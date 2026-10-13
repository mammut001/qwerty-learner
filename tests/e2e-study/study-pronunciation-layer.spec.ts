import { expect, test } from '@playwright/test'

test('pronunciation controls stay above the paused word overlay', async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1012 })
  await page.goto('/typing')
  await expect(page.getByText('按任意键开始', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /^法语/ }).first().click()
  const section = page.getByText('开关循环发音', { exact: true }).locator('..')
  const control = section.getByRole('switch')
  await expect(control).toBeVisible()
  await expect
    .poll(() =>
      control.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
        return Boolean(target && element.contains(target))
      }),
    )
    .toBe(true)
  const checked = await control.getAttribute('aria-checked')
  await control.click()
  await expect(control).toHaveAttribute('aria-checked', checked === 'true' ? 'false' : 'true')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
})
