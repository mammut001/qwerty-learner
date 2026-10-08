import { expect, test } from '@playwright/test'

test('placement test assigns a CEFR level and shows it on the study plan', async ({ page }) => {
  await page.goto('/placement-test')
  await expect(page.getByTestId('placement-intro')).toBeVisible()
  await page.getByTestId('placement-start').click()

  const total = 24
  for (let i = 0; i < total; i += 1) {
    await page.getByTestId('placement-choice-1').click()
    await page.getByTestId('placement-next').click()
  }

  await expect(page.getByTestId('placement-result')).toBeVisible()
  await expect(page.getByTestId('placement-cefr-level')).not.toBeEmpty()
  await expect(page.getByTestId('placement-echelle')).toContainText('Niveau')

  await page.goto('/study-plan')
  await expect(page.getByTestId('placement-summary')).toBeVisible()
  await expect(page.getByTestId('placement-personalized-track')).toBeVisible()

  await page.goto('/analysis')
  await expect(page.getByTestId('analysis-placement')).toBeVisible()
})
