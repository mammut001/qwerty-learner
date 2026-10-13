import { expect, test } from '@playwright/test'

for (const chapter of [-1, 0.5, '2', null, 999]) {
  test(`invalid stored chapter ${JSON.stringify(chapter)} recovers to the first chapter`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().includes('Cannot update a component')) errors.push(message.text())
    })
    await page.addInitScript((value) => localStorage.setItem('currentChapter', JSON.stringify(value)), chapter)
    await page.goto('/typing')
    await expect(page.getByRole('button', { name: '第 1 章', exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('currentChapter') ?? 'null'))).toBe(0)
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    expect(errors).toEqual([])
  })
}

test('a valid saved chapter is preserved', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('currentChapter', '1'))
  await page.goto('/typing')
  await expect(page.getByRole('button', { name: '第 2 章', exact: true })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('currentChapter') ?? 'null'))).toBe(1)
})
