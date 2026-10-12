import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'

test.use({ serviceWorkers: 'block' })

async function openData(page: import('@playwright/test').Page) {
  await page.goto('/typing')
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '数据设置' }).click()
}

test('corrupt backups show an error and allow a valid backup to be imported', async ({ page }) => {
  await openData(page)
  const exportButton = page.getByRole('button', { name: '导出数据', exact: true })
  const importButton = page.getByRole('button', { name: '导入数据', exact: true })
  const pendingDownload = page.waitForEvent('download')
  await exportButton.click()
  const download = await pendingDownload
  const path = await download.path()
  if (!path) throw new Error('Missing backup file')
  const backup = await readFile(path)
  expect(JSON.parse(gunzipSync(backup).toString()).formatName).toBe('dexie')
  await expect(exportButton).toBeEnabled()

  const pendingChooser = page.waitForEvent('filechooser')
  await importButton.click()
  await (await pendingChooser).setFiles({ name: 'broken.gz', mimeType: 'application/gzip', buffer: Buffer.from('invalid gzip') })
  await expect(page.getByRole('alert')).toHaveText('导入失败，请选择有效的 .gz 备份文件后重试。')
  await expect(importButton).toBeEnabled()
  await expect(exportButton).toBeEnabled()

  const retryChooser = page.waitForEvent('filechooser')
  await importButton.click()
  await (await retryChooser).setFiles({ name: 'backup.gz', mimeType: 'application/gzip', buffer: backup })
  await expect(importButton).toBeEnabled()
  await expect(importButton).toHaveAttribute('aria-busy', 'false')
  await expect(page.getByRole('alert')).not.toBeAttached()
})

test('failed export dependencies show feedback and release the export button', async ({ page }) => {
  await page.route(/pako.*\.js/, (route) => route.abort())
  await openData(page)
  const button = page.getByRole('button', { name: '导出数据', exact: true })
  await button.click()
  await expect(page.getByRole('alert')).toHaveText('导出失败，请重试。若仍失败，请刷新页面后重试。')
  await expect(button).toBeEnabled()
  await expect(button).toHaveAttribute('aria-busy', 'false')
})

test('cancelling file selection releases both data controls', async ({ page }) => {
  await openData(page)
  const button = page.getByRole('button', { name: '导入数据', exact: true })
  const pendingChooser = page.waitForEvent('filechooser')
  await button.click()
  const chooser = await pendingChooser
  await expect(button).toBeDisabled()
  await chooser.element().evaluate((input) => input.dispatchEvent(new Event('cancel')))
  await expect(button).toBeEnabled()
  await expect(page.getByRole('button', { name: '导出数据', exact: true })).toBeEnabled()
  await expect(page.getByRole('alert')).not.toBeAttached()
})
