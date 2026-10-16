import { expect, test } from '@playwright/test'

for (const key of ['Space', 'Enter']) {
  test(`${key} opens the chapter chooser and arrows select the next chapter`, async ({ page }) => {
    await page.goto('/typing')
    const button = page.getByRole('button', { name: '第 1 章', exact: true })
    await expect(button).toBeVisible()
    await button.focus()
    await expect(button).toBeFocused()
    await page.keyboard.press(key)
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: '第 2 章', exact: true })).toBeFocused()
    await expect(page.getByRole('listbox')).not.toBeVisible()
    await expect(page.locator('textarea')).not.toBeFocused()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('currentChapter') ?? 'null'))).toBe(1)
  })
}
