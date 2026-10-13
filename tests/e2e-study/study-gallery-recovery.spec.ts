import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('dictionary details explain failed error-word loading and offer an in-place retry', async ({ page }) => {
  let fail = true
  await page.route('**/dicts/TCF_Canada_Foundation_01.json', (route) =>
    route.fulfill({
      status: fail ? 503 : 200,
      json: fail ? { error: 'unavailable' } : [{ name: 'bonjour', trans: ['你好'] }],
    }),
  )
  await page.goto('/gallery?dict=tcf-canada-foundation-01')
  await expect(page.getByRole('alert')).toContainText('错词记录暂时读取失败')
  fail = false
  await page.getByRole('button', { name: '重新读取错词' }).click()
  await expect(page.getByRole('alert')).not.toBeAttached()
  await expect(page).toHaveURL(/\/gallery\?dict=tcf-canada-foundation-01$/)
})

test('local error-word read failures can be retried without unhandled errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/dicts/TCF_Canada_Foundation_01.json', (route) => route.fulfill({ json: [{ name: 'bonjour', trans: ['你好'] }] }))
  await page.addInitScript(() => {
    const original = IDBIndex.prototype.openCursor
    const state = window as Window & { failErrorWordRead?: boolean }
    state.failErrorWordRead = true
    IDBIndex.prototype.openCursor = function (...args) {
      if (state.failErrorWordRead && this.name === 'wrongCount') throw new DOMException('Read temporarily unavailable', 'UnknownError')
      return original.apply(this, args)
    }
  })
  await page.goto('/gallery?dict=tcf-canada-foundation-01')
  await expect(page.getByRole('alert')).toContainText('错词记录暂时读取失败')
  await page.evaluate(() => {
    ;(window as Window & { failErrorWordRead?: boolean }).failErrorWordRead = false
  })
  await page.getByRole('button', { name: '重新读取错词' }).click()
  await expect(page.getByRole('alert')).not.toBeAttached()
  expect(errors).toEqual([])
})
