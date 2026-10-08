import { expect, test } from '@playwright/test'

test('Échelle québécoise page shows every skill and level with indicators and linguistic dimensions', async ({ page }) => {
  await page.goto('/tcf')
  await expect(page.getByTestId('tcf-hub-writing')).toContainText('Niveau 7 要做到')
  await page.getByTestId('tcf-hub-echelle-writing').click()

  await expect(page).toHaveURL(/\/echelle\?skill=writing&level=7/)
  const detail = page.getByTestId('echelle-level-detail')
  await expect(detail).toContainText('Niveau 7')
  await expect(detail).toContainText('Autonome')
  await expect(detail).toContainText('= NCLC 7 达标线')
  await expect(page.getByTestId('echelle-indicator')).toHaveCount(4)
  await expect(detail).toContainText('Rédiger une lettre de motivation pour présenter sa candidature à un nouveau poste.')

  await page.getByTestId('echelle-skill-listening').click()
  await page.getByTestId('echelle-level-1').click()
  await expect(detail).toContainText('Minimale')
  await expect(page.getByTestId('echelle-indicator')).toHaveCount(6)

  await page.getByTestId('echelle-skill-speaking').click()
  await page.getByTestId('echelle-level-12').click()
  await expect(detail).toContainText('Nuancée')
  await expect(page.getByText('发音掌握度 · Maitrise phonologique')).toBeVisible()
})
