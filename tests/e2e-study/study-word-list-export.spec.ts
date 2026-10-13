import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('export includes current editor contents and filename without silently saving edits', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('原词表')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好')
  await page.getByTestId('word-list-save').click()
  await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
  await page.getByLabel('词表名称').fill('阅读笔记')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 早安\nsalut = 你好')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出当前编辑 JSON', exact: true }).click()
  const download = await downloading
  expect(download.suggestedFilename()).toBe('阅读笔记.json')
  const path = await download.path()
  expect(JSON.parse(await readFile(path!, 'utf8'))).toEqual([
    { name: 'bonjour', trans: ['早安'] },
    { name: 'salut', trans: ['你好'] },
  ])
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0])
  expect(saved.name).toBe('原词表')
  expect(saved.words).toEqual([{ name: 'bonjour', trans: ['你好'] }])
  await expect(page.getByTestId('word-list-save')).toBeEnabled()
  await page.getByLabel('词条', { exact: true }).fill('')
  await page.getByRole('button', { name: '导出当前编辑 JSON', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('没有可导出的词条')
})
