import { expect, test } from '@playwright/test'

test('a delayed file import cannot append to another word list after switching', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'qwerty-fr-custom-dicts-v1',
      JSON.stringify([
        { id: 'custom-first', name: '词表一', description: '', words: [{ name: 'bonjour', trans: ['你好'] }], createdAt: 1, updatedAt: 1 },
        { id: 'custom-second', name: '词表二', description: '', words: [{ name: 'salut', trans: ['你好'] }], createdAt: 1, updatedAt: 1 },
      ]),
    ),
  )
  await page.goto('/word-lists')
  await page.evaluate(() => {
    const original = File.prototype.text
    File.prototype.text = function () {
      if (this.name !== 'slow.txt') return original.call(this)
      return new Promise<string>((resolve) => {
        ;(window as any).finishImport = () => resolve('ancien = 旧内容')
      })
    }
  })
  await page
    .getByTestId('word-list-file')
    .setInputFiles({ name: 'slow.txt', mimeType: 'text/plain', buffer: Buffer.from('ancien = 旧内容') })
  await page.getByRole('button', { name: /^词表二/ }).click()
  await page
    .getByTestId('word-list-file')
    .setInputFiles({ name: 'new.txt', mimeType: 'text/plain', buffer: Buffer.from('nouveau = 新内容') })
  await expect(page.getByRole('status')).toContainText('已读入 new.txt')
  await page.evaluate(async () => {
    ;(window as any).finishImport()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  await expect(page.getByLabel('词表名称')).toHaveValue('词表二')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('salut = 你好\nnouveau = 新内容')
  await expect(page.getByRole('status')).toContainText('已读入 new.txt')
})

test('finishing an import preserves a name entered while the file was being read', async ({ page }) => {
  await page.goto('/word-lists')
  await page.evaluate(() => {
    File.prototype.text = () =>
      new Promise<string>((resolve) => {
        ;(window as any).finishImport = () => resolve('bonjour = 你好')
      })
  })
  await page
    .getByTestId('word-list-file')
    .setInputFiles({ name: 'slow.txt', mimeType: 'text/plain', buffer: Buffer.from('bonjour = 你好') })
  await expect(page.getByRole('button', { name: '正在读取文件…', exact: true })).toBeDisabled()
  await page.getByLabel('词表名称').fill('我的阅读笔记')
  await page.evaluate(() => (window as any).finishImport())
  await expect(page.getByRole('status')).toContainText('已读入 slow.txt')
  await expect(page.getByLabel('词表名称')).toHaveValue('我的阅读笔记')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('bonjour = 你好')
  await expect(page.getByRole('button', { name: '从文件导入（.txt / .csv / .json）', exact: true })).toBeEnabled()
})
