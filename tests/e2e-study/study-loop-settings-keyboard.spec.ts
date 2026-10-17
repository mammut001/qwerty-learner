import { expect, test } from '@playwright/test'

test('arrow selection in repeat settings updates the saved repetition count', async ({ page }) => {
  await page.goto('/typing')
  await page.getByRole('button', { name: '选择单词的循环次数' }).click()
  const once = page.getByRole('radio', { name: '1', exact: true })
  await expect(once).toBeChecked()
  await once.focus()
  await page.keyboard.press('ArrowDown', { delay: 50 })
  const radio3 = page.getByRole('radio', { name: '3', exact: true })
  await expect(radio3).toBeChecked()
  await expect(radio3).toBeFocused()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('loopWordConfig') ?? '{}').times)).toBe(3)
  await page.keyboard.press('ArrowDown', { delay: 50 })
  const radio5 = page.getByRole('radio', { name: '5', exact: true })
  await expect(radio5).toBeChecked()
  await expect(radio5).toBeFocused()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('loopWordConfig') ?? '{}').times)).toBe(5)
})
