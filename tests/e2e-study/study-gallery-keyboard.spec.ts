import { expect, test } from '@playwright/test'

test('Enter opens a focused dictionary card and Escape closes only its dialog', async ({ page }) => {
  await page.goto('/gallery')
  const card = page.getByRole('button', { name: '打开词库：基础核心词 01', exact: true })
  await card.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page).toHaveURL(/\/gallery$/)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeAttached()
  await expect(page).toHaveURL(/\/gallery$/)
})

test('Enter on a focused gallery link follows that link', async ({ page }) => {
  await page.goto('/gallery')
  await page.getByTestId('gallery-word-lists').focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/word-lists$/)
})

test('the gallery background Enter shortcut still returns to practice', async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByTestId('gallery-word-lists')).toBeVisible()
  await page.locator('body').evaluate((body) => {
    body.tabIndex = -1
    body.focus()
  })
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/typing$/)
})
