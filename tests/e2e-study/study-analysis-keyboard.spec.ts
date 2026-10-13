import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('Enter refreshes statistics without triggering the page back shortcut', async ({ page }) => {
  let reads = 0
  await page.route('**/api/study-plan/review?**', (route) => {
    reads += 1
    return route.fulfill({ json: { queue: [] } })
  })
  await page.goto('/analysis')
  await expect(page.getByText('今天没有到期错题。新的错误会自动进入复习计划。', { exact: true })).toBeVisible()
  const before = reads
  await page.getByRole('button', { name: '刷新数据', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/analysis$/)
  await expect.poll(() => reads).toBeGreaterThan(before)
})

test('Enter on a review score saves that score and stays on statistics', async ({ page }) => {
  const item = {
    itemId: 'vocabulary:bonjour',
    kind: 'vocabulary',
    sourceId: 'bonjour',
    label: 'bonjour · 键盘复习',
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
  await expect(page.getByText(item.label, { exact: true })).toBeVisible()
  await page.context().setOffline(true)
  await page.getByRole('button', { name: '记得', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/analysis$/)
  await expect(page.getByText(item.label, { exact: true })).toHaveCount(0)
  const operations = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith('qwerty-fr-study-plan-pending:'))
      .flatMap((key) => JSON.parse(localStorage.getItem(key) ?? '{}').operations ?? [])
      .filter((op) => op.kind === 'reviewResult'),
  )
  expect(operations).toHaveLength(1)
  expect(operations[0].quality).toBe(4)
})

test('Escape on the page background still returns to the study plan', async ({ page }) => {
  await page.goto('/analysis')
  await expect(page.getByRole('button', { name: '刷新数据', exact: true })).toBeVisible()
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/study-plan$/)
})
