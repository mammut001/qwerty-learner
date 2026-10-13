import { expect, test } from '@playwright/test'

test('ArrowDown and Enter selects a dictionary suggestion', async ({ page }) => {
  await page.goto('/dictionary')
  const searchInput = page.getByRole('searchbox', { name: '查词' })
  await searchInput.fill('logem')
  const suggestions = page.getByTestId('dictionary-suggestions')
  await expect(suggestions).toBeVisible()

  // Press ArrowDown to highlight the first suggestion
  await searchInput.press('ArrowDown')
  const firstOption = suggestions.getByRole('option').first()
  await expect(firstOption).toHaveAttribute('aria-selected', 'true')

  // Press Enter to submit the selected suggestion
  await searchInput.press('Enter')
  await expect(page).toHaveURL(/\/dictionary\?q=logement$/)
  const result = page.getByTestId('dictionary-result')
  await expect(result).toContainText('logement')
  await expect(suggestions).toHaveCount(0)
})

test('Escape closes search suggestions without navigating', async ({ page }) => {
  await page.goto('/dictionary')
  const searchInput = page.getByRole('searchbox', { name: '查词' })
  await searchInput.fill('logem')
  const suggestions = page.getByTestId('dictionary-suggestions')
  await expect(suggestions).toBeVisible()

  await searchInput.press('Escape')
  await expect(suggestions).toHaveCount(0)
  expect(page.url()).toContain('/dictionary')
})

test('ArrowUp cycles suggestions backwards', async ({ page }) => {
  await page.goto('/dictionary')
  const searchInput = page.getByRole('searchbox', { name: '查词' })
  await searchInput.fill('logem')
  const suggestions = page.getByTestId('dictionary-suggestions')
  await expect(suggestions).toBeVisible()

  // ArrowUp from unselected wraps to the last suggestion
  await searchInput.press('ArrowUp')
  const lastOption = suggestions.getByRole('option').last()
  await expect(lastOption).toHaveAttribute('aria-selected', 'true')
})
