import { expect, test } from '@playwright/test'

test('video listening catalog filters and blocked YouTube offline notice', async ({ page }) => {
  const abortedDomains: string[] = []

  // Mock auth endpoint to avoid external dependencies
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: false, signedIn: false, user: null } }),
  )

  // Block any real requests to YouTube and Google CDN (simulating mainland China network)
  await page.route(/(youtube\.com|i\.ytimg\.com)/, (route) => {
    abortedDomains.push(new URL(route.request().url()).hostname)
    return route.abort()
  })

  // 1. Visit video listening catalog
  await page.goto('/video-listening')
  await expect(page.getByRole('heading', { name: '视频听力' })).toBeVisible()

  // Verify list shows video cards
  const videoCards = page.locator('a[href^="/video-listening/"]')
  await expect(videoCards.first()).toBeVisible()
  const totalCount = await videoCards.count()
  expect(totalCount).toBeGreaterThan(1)

  // 2. Filter: 口音 魁北克 reduces the list
  await page.getByRole('button', { name: '魁北克', exact: true }).click()
  const quebecCount = await videoCards.count()
  expect(quebecCount).toBeLessThan(totalCount)
  expect(quebecCount).toBeGreaterThan(0)

  // 3. Filter: 难度 B2
  await page.getByRole('button', { name: 'B2', exact: true }).click()
  const b2QuebecCount = await videoCards.count()
  expect(b2QuebecCount).toBeLessThanOrEqual(quebecCount)
  expect(b2QuebecCount).toBeGreaterThan(0)

  // 4. Open a lesson page
  await videoCards.first().click()
  await expect(page).toHaveURL(/\/video-listening\/.+/)

  // 5. Assert the friendly notice 「当前网络无法加载 YouTube」 appears within ~10s
  const offlineAlert = page.getByRole('alert')
  await expect(offlineAlert).toContainText('当前网络无法加载 YouTube', { timeout: 10_000 })

  // Verify YouTube domain requests were properly intercepted and blocked
  expect(abortedDomains.some((host) => host.includes('youtube.com'))).toBe(true)
})
