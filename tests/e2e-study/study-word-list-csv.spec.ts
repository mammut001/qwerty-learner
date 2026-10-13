import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('CSV quoted commas, escaped quotes and multiline definitions survive import and JSON export', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('CSV 生词')
  await page.getByTestId('word-list-file').setInputFiles({
    name: 'words.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('\uFEFF"oui, bien sûr","当然，""没问题"""\r\n"bonjour","你好\n早安"\r\nsalut,你好,嗨'),
  })
  await expect(page.getByRole('status')).toContainText('已读入 words.csv')
  await page.getByTestId('word-list-save').click()
  await expect(page.getByRole('status')).toContainText('已保存 3 个词条')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 JSON', exact: true }).click()
  const download = await downloading
  expect(JSON.parse(await readFile((await download.path())!, 'utf8'))).toEqual([
    { name: 'oui, bien sûr', trans: ['当然，"没问题"'] },
    { name: 'bonjour', trans: ['你好 早安'] },
    { name: 'salut', trans: ['你好,嗨'] },
  ])
})

test('malformed CSV preserves the editor and the same file can be retried after correction', async ({ page }) => {
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('bonjour = 你好')
  const file = page.getByTestId('word-list-file')
  await file.setInputFiles({ name: 'words.csv', mimeType: 'text/csv', buffer: Buffer.from('"salut","未闭合') })
  await expect(page.getByRole('status')).toContainText('CSV 引号未闭合')
  await expect(editor).toHaveValue('bonjour = 你好')
  await file.setInputFiles({ name: 'words.csv', mimeType: 'text/csv', buffer: Buffer.from('"salut","嗨"') })
  await expect(page.getByRole('status')).toContainText('已读入 words.csv')
  await expect(editor).toHaveValue('bonjour = 你好\nsalut\t嗨')
})
