import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('a failed review creation preserves the chapter and can be retried', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/dicts/TCF_Canada_Foundation_01.json', (route) => route.fulfill({ json: [{ name: 'bonjour', trans: ['你好'] }] }))
  await page.goto('/typing')
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  const letter = page.locator('span').filter({ hasText: /^b$/ }).first()
  await page.keyboard.insertText('x')
  await expect(letter).toHaveClass(/text-red-600/)
  await expect(letter).toHaveClass(/text-gray-600/)
  await page.keyboard.insertText('bonjour')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
  await page.goto('/gallery?dict=tcf-canada-foundation-01')
  await page.getByText('错题回顾', { exact: true }).click()
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put
    const state = window as Window & { failReviewWrite?: boolean }
    state.failReviewWrite = true
    IDBObjectStore.prototype.put = function (...args) {
      if (state.failReviewWrite && this.name === 'reviewRecords') throw new DOMException('Storage full', 'QuotaExceededError')
      return original.apply(this, args)
    }
  })
  const button = page.getByRole('button', { name: '开始复习', exact: true })
  const chapterBefore = await page.evaluate(() => localStorage.getItem('currentChapter'))
  await button.click()
  await expect(page.getByRole('alert')).toHaveText('创建复习失败，请检查浏览器存储空间后重试。')
  await expect(button).toBeEnabled()
  expect(await page.evaluate(() => localStorage.getItem('currentChapter'))).toBe(chapterBefore)
  await page.evaluate(() => {
    ;(window as Window & { failReviewWrite?: boolean }).failReviewWrite = false
  })
  await button.click()
  await expect(page).toHaveURL(/\/typing$/)
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  expect(errors).toEqual([])
})
