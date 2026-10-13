import { expect, test } from '@playwright/test'

for (const field of ['词表名称', '词表备注', '词条']) {
  test(`editing ${field} clears stale saved feedback without silently saving changes`, async ({ page }) => {
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('原词表')
    await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好')
    await page.getByTestId('word-list-save').click()
    await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
    const before = await page.evaluate(() => localStorage.getItem('qwerty-fr-custom-dicts-v1'))
    await page.getByLabel(field, { exact: true }).fill(field === '词条' ? 'bonjour = 早安' : '未保存的新内容')
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByTestId('word-list-save')).toBeEnabled()
    expect(await page.evaluate(() => localStorage.getItem('qwerty-fr-custom-dicts-v1'))).toBe(before)
    await page.getByTestId('word-list-save').click()
    await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
    await expect(page.getByTestId('word-list-save')).toBeDisabled()
  })
}
