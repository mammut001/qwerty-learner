import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('makeup submits once and remains successful when achievement refresh fails', async ({ page }) => {
  let requests = 0
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/study-plan/achievements', (route) => route.fulfill({ status: 503, json: {} }))
  await page.route('**/api/study-plan/checkins/makeup', async (route) => {
    requests += 1
    const { day } = route.request().postDataJSON()
    await gate
    await route.fulfill({ json: { items: [{ day, status: 'makeup' }], daily: [], streak: { current: 1, longest: 1 } } })
  })
  await page.goto('/analysis')
  const buttons = page.getByRole('button', { name: /^\d{4}-\d{2}-\d{2} 补签$/ })
  await expect(buttons).toHaveCount(7)
  await buttons.first().dblclick()
  await expect(page.getByText('补签中…', { exact: true })).toBeVisible()
  for (const button of await buttons.all()) await expect(button).toBeDisabled()
  await expect.poll(() => requests).toBe(1)
  release()
  await expect(page.getByText(/补签成功，成就暂时未能刷新/)).toBeVisible()
  await expect(page.getByText('已补签', { exact: true })).toBeVisible()
  await expect(buttons).toHaveCount(6)
  await expect(buttons.first()).toBeEnabled()
})

test('a failed makeup unlocks the controls for a successful retry', async ({ page }) => {
  await page.route('**/api/study-plan/achievements', (route) => route.fulfill({ json: { items: [] } }))
  let requests = 0
  await page.route('**/api/study-plan/checkins/makeup', (route) => {
    requests += 1
    const { day } = route.request().postDataJSON()
    return requests === 1
      ? route.fulfill({ status: 503, json: { error: 'temporary' } })
      : route.fulfill({
          json: {
            items: [{ day, status: 'makeup' }],
            daily: [],
            streak: { current: 1, longest: 1 },
          },
        })
  })
  await page.goto('/analysis')
  const buttons = page.getByRole('button', { name: /^\d{4}-\d{2}-\d{2} 补签$/ })
  await buttons.first().click()
  await expect(page.getByText('补签失败，请检查网络与学习记录。', { exact: true })).toBeVisible()
  await expect(buttons.first()).toBeEnabled()
  await buttons.first().click()
  await expect(page.getByText(/补签成功。/)).toBeVisible()
  await expect(page.getByText('已补签', { exact: true })).toBeVisible()
  expect(requests).toBe(2)
})
