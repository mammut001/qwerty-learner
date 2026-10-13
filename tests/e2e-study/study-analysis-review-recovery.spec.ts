import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('failed review loading is not mistaken for an empty queue and refresh recovers', async ({ page }) => {
  let recovered = false
  await page.route('**/api/study-plan/review?**', (route) =>
    recovered ? route.fulfill({ json: { queue: [] } }) : route.fulfill({ status: 503, json: { error: 'temporary' } }),
  )
  await page.goto('/analysis')
  await expect(page.getByRole('alert')).toContainText('复习队列读取失败')
  await expect(page.getByText('今天没有到期错题。新的错误会自动进入复习计划。', { exact: true })).toHaveCount(0)
  recovered = true
  await page.getByRole('button', { name: '刷新数据', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByText('今天没有到期错题。新的错误会自动进入复习计划。', { exact: true })).toBeVisible()
})

for (const source of ['offline-cache', 'server-with-blocked-cache']) {
  test(`review entries remain usable from ${source}`, async ({ page }) => {
    const item = {
      itemId: 'vocabulary:bonjour',
      kind: 'vocabulary',
      sourceId: 'bonjour',
      label: 'bonjour · 测试复习',
      errorCount: 1,
      lastErrorAt: 1,
      dueDate: new Date().toISOString().slice(0, 10),
      repetitions: 0,
      intervalDays: 1,
      ease: 2.5,
      lastReviewedAt: null,
    }
    await page.addInitScript(
      ({ item, source }) => {
        if (source === 'offline-cache') localStorage.setItem('qwerty-fr-study-review-v1', JSON.stringify([item]))
        else {
          const original = Storage.prototype.setItem
          Storage.prototype.setItem = function (key, value) {
            if (key === 'qwerty-fr-study-review-v1') throw new DOMException('blocked', 'QuotaExceededError')
            return original.call(this, key, value)
          }
        }
      },
      { item, source },
    )
    await page.route('**/api/study-plan/review?**', (route) =>
      source === 'offline-cache' ? route.fulfill({ status: 503, json: { error: 'offline' } }) : route.fulfill({ json: { queue: [item] } }),
    )
    await page.goto('/analysis')
    await expect(page.getByText('bonjour · 测试复习', { exact: true })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByText('今天没有到期错题。新的错误会自动进入复习计划。', { exact: true })).toHaveCount(0)
  })
}
