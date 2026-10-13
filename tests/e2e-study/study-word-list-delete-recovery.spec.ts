import { expect, test } from '@playwright/test'

test('failed word-list deletion preserves the list and editor, then allows retry', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('阅读生词')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好')
  await page.getByTestId('word-list-save').click()
  await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 我未保存的笔记')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    ;(window as any).restoreStorageWrites = () => {
      Storage.prototype.setItem = original
    }
    Storage.prototype.setItem = function (key, value) {
      if (key === 'qwerty-fr-custom-dicts-v1') throw new DOMException('blocked', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.getByTestId('word-list-delete').click()
  await page.getByTestId('word-list-delete-confirm').click()
  await expect(page.getByRole('status')).toContainText('删除失败')
  await expect(page.getByLabel('词表名称')).toHaveValue('阅读生词')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('bonjour = 我未保存的笔记')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]').length)).toBe(1)
  await page.evaluate(() => (window as any).restoreStorageWrites())
  await page.getByTestId('word-list-delete-confirm').click()
  await expect(page.getByText('还没有词表')).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]').length)).toBe(0)
})
