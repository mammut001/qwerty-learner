import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

for (const failure of ['queue', 'cache']) {
  test(`review scoring preserves durability when ${failure} writes fail`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const item = {
      itemId: 'vocabulary:bonjour',
      kind: 'vocabulary',
      sourceId: 'bonjour',
      label: 'bonjour · 待复习',
      errorCount: 1,
      lastErrorAt: 1,
      dueDate: new Date().toISOString().slice(0, 10),
      repetitions: 0,
      intervalDays: 1,
      ease: 2.5,
      lastReviewedAt: null,
    }
    await page.route('**/api/study-plan/review?**', (route) => route.fulfill({ json: { queue: [item] } }))
    await page.goto('/analysis')
    await expect(page.getByText('bonjour · 待复习', { exact: true })).toBeVisible()
    await page.context().setOffline(true)
    await page.evaluate((failure) => {
      const original = Storage.prototype.setItem
      ;(window as any).restoreReviewWrites = () => {
        Storage.prototype.setItem = original
      }
      Storage.prototype.setItem = function (key, value) {
        if (
          (failure === 'queue' && key.startsWith('qwerty-fr-study-plan-pending:')) ||
          (failure === 'cache' && key === 'qwerty-fr-study-plan-v1')
        ) {
          throw new DOMException('blocked', 'QuotaExceededError')
        }
        return original.call(this, key, value)
      }
    }, failure)
    const remember = page.getByRole('button', { name: '记得', exact: true })
    await remember.click()
    if (failure === 'queue') {
      await expect(page.getByRole('alert')).toContainText('复习结果未保存')
      await expect(page.getByText('bonjour · 待复习', { exact: true })).toBeVisible()
      await page.evaluate(() => (window as any).restoreReviewWrites())
      await remember.click()
    }
    await expect(page.getByText('bonjour · 待复习', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    const operations = await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith('qwerty-fr-study-plan-pending:'))
        .flatMap((key) => JSON.parse(localStorage.getItem(key) ?? '{}').operations ?? [])
        .filter((op) => op.kind === 'reviewResult'),
    )
    expect(operations).toHaveLength(1)
    expect(operations[0]).toMatchObject({ itemId: item.itemId, quality: 4 })
    expect(errors).toEqual([])
  })
}
