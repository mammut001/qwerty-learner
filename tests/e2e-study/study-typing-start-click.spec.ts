import { expect, test } from '@playwright/test'

test('clicking start button with the mouse focuses textarea and records typing stats', async ({ page }) => {
  await page.goto('/typing?dict=a1-jingbian-ep01&chapter=0')

  const startButton = page.getByRole('button', { name: '开始' })
  await expect(startButton).toBeVisible()
  await startButton.click()

  for (const char of 'pays') {
    await page.keyboard.press(char)
    await page.waitForTimeout(60)
  }

  await expect(page.locator('div', { hasText: '输入数' }).locator('span', { hasText: /^4$/ }).first()).toBeVisible()
  await expect(page.locator('div', { hasText: '正确数' }).locator('span', { hasText: /^4$/ }).first()).toBeVisible()
})
