import { expect, test } from '@playwright/test'

// The password check itself is covered by server/study-access.test.mjs; this drives the lock screen.
test('a locked site shows the password screen until the right password is entered', async ({ page }) => {
  let granted = false
  let attempts = 0
  await page.route('**/api/study-plan/access', async (route) => {
    const request = route.request()
    if (request.method() === 'GET') return route.fulfill({ json: { required: true, granted } })
    attempts += 1
    const { password } = request.postDataJSON() as { password: string }
    if (attempts === 3) return route.fulfill({ status: 429, json: { code: 'ACCESS_RATE_LIMITED', retryAfterSeconds: 840 } })
    if (password !== 'sésame') return route.fulfill({ status: 401, json: { code: 'ACCESS_DENIED' } })
    granted = true
    return route.fulfill({ json: { required: true, granted: true } })
  })

  await page.goto('/study-plan')
  const gate = page.getByTestId('access-gate')
  await expect(gate).toBeVisible()
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: '主导航' })).toHaveCount(0)

  const unlock = gate.getByRole('button', { name: '解锁' })
  await expect(unlock).toBeDisabled()
  await gate.getByLabel('访问口令').fill('wrong')
  await unlock.click()
  await expect(gate.getByRole('alert')).toContainText('口令不对')

  await gate.getByLabel('访问口令').fill('still wrong')
  await unlock.click()
  await expect(gate.getByRole('alert')).toContainText('口令不对')
  await unlock.click()
  await expect(gate.getByRole('alert')).toContainText('14 分钟后再试')

  await gate.getByLabel('访问口令').fill('sésame')
  await unlock.click()
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  await expect(page.getByTestId('access-gate')).toHaveCount(0)

  // Once let in, the device opens straight away on later visits.
  await page.goto('/dictionary')
  await expect(page.getByRole('searchbox', { name: '查词' })).toBeVisible()

  // If the server stops recognising the device (password changed), the lock screen comes back.
  granted = false
  await page.goto('/study-plan')
  await expect(page.getByTestId('access-gate')).toBeVisible()
})

test('an unreachable backend does not lock the offline app', async ({ page }) => {
  await page.route('**/api/study-plan/access', (route) => route.abort())
  await page.goto('/dictionary')
  await expect(page.getByRole('searchbox', { name: '查词' })).toBeVisible()
  await expect(page.getByTestId('access-gate')).toHaveCount(0)
})
