import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('failed deletion preserves the error word and keyboard retry removes it', async ({ page }) => {
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
  await page.getByText('查看错题', { exact: true }).click()
  const button = page.getByRole('button', { name: '删除 bonjour 的练习记录', exact: true })
  await expect(button).toBeVisible()
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.delete
    const state = window as Window & { failDelete?: boolean }
    state.failDelete = true
    IDBObjectStore.prototype.delete = function (...args) {
      if (state.failDelete && this.name === 'wordRecords') throw new DOMException('Delete unavailable', 'UnknownError')
      return original.apply(this, args)
    }
  })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('alert')).toHaveText('删除失败，记录仍保留，请重试。')
  await expect(button).toBeEnabled()
  await expect(page.getByRole('cell', { name: 'bonjour', exact: true })).toBeVisible()
  await page.evaluate(() => {
    ;(window as Window & { failDelete?: boolean }).failDelete = false
  })
  await button.focus()
  await page.keyboard.press('Space')
  await expect(button).not.toBeAttached()
  await expect(page.getByRole('alert')).not.toBeAttached()
})
