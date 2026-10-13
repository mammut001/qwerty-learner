import { expect, test } from '@playwright/test'

test('manual word navigation starts a fresh repetition count for the next word', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('loopWordConfig', JSON.stringify({ times: 3 })))
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('重复次数验证')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好\nmerci = 谢谢')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '重复次数验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('bonjour')
  await expect(page.locator('span').filter({ hasText: /^b$/ }).first()).toHaveClass(/text-gray-600/)
  await page.getByText('merci', { exact: true }).click()
  const firstLetter = page.locator('span').filter({ hasText: /^m$/ }).first()
  await expect(firstLetter).toHaveClass(/text-gray-600/)
  for (let repetition = 0; repetition < 2; repetition += 1) {
    await page.keyboard.insertText('merci')
    await expect(firstLetter).toHaveClass(/text-gray-600/)
  }
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).not.toBeVisible()
  await page.keyboard.insertText('merci')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})
