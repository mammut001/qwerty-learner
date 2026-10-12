import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { read, utils } from 'xlsx'

test.use({ serviceWorkers: 'block' })

async function finishChapter(page: Page) {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('导出练习')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '导出练习' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('bonjour')
  await expect(page.getByText('导出本章练习结果', { exact: true })).toBeAttached()
}

for (const key of ['Enter', 'Space']) {
  test(`practice results can be exported using ${key}`, async ({ page }) => {
    await finishChapter(page)
    const button = page.getByRole('button', { name: '导出本章练习结果', exact: true })
    await expect(button).toBeVisible()
    await button.focus()
    await expect(button).toBeFocused()
    const pending = page.waitForEvent('download', { timeout: 10000 })
    await page.keyboard.press(key)
    const download = await pending
    expect(download.suggestedFilename()).toBe('导出练习第1章.xlsx')
    const filePath = await download.path()
    if (!filePath) throw new Error('Missing practice export')
    const workbook = read(await readFile(filePath), { type: 'buffer' })
    expect(utils.sheet_to_json(workbook.Sheets.Data)).toMatchObject([{ name: 'bonjour', correctCount: 7, wrongCount: 0 }])
  })
}

test('a failed spreadsheet module load shows an actionable export error', async ({ page }) => {
  await page.route(/xlsx.*\.js/, (route) => route.abort())
  await finishChapter(page)
  const button = page.getByRole('button', { name: '导出本章练习结果', exact: true })
  await expect(button).toBeVisible()
  await button.click()
  await expect(page.getByRole('alert')).toHaveText('导出失败，请刷新页面后重试。')
  await expect(button).toBeEnabled()
  await expect(button).toHaveAttribute('aria-busy', 'false')
})

test('export is disabled while its spreadsheet module is loading', async ({ page }) => {
  let release: () => void = () => undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(/xlsx.*\.js/, async (route) => {
    await gate
    await route.continue()
  })
  await finishChapter(page)
  const button = page.getByRole('button', { name: '导出本章练习结果', exact: true })
  const pending = page.waitForEvent('download', { timeout: 10000 })
  await button.click()
  try {
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  } finally {
    release()
  }
  await pending
  await expect(button).toBeEnabled()
  await expect(button).toHaveAttribute('aria-busy', 'false')
})
