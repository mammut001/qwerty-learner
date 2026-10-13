import { expect, test } from '@playwright/test'

for (const key of ['Enter', 'Space']) {
  test(`${key} on a chapter card opens that chapter without starting practice`, async ({ page }) => {
    await page.goto('/gallery?dict=tcf-canada-foundation-01')
    const dialog = page.getByRole('dialog', { name: '基础核心词 01', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: '练习第 1 章', exact: true })).toHaveAttribute('aria-current', 'true')
    const chapter = dialog.getByRole('button', { name: '练习第 2 章', exact: true })
    await chapter.focus()
    await expect(chapter).toBeFocused()
    await page.keyboard.press(key)
    await expect(page).toHaveURL(/\/typing$/)
    await expect(page.getByRole('button', { name: '第 2 章', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('currentChapter') ?? 'null'))).toBe(1)
  })
}
