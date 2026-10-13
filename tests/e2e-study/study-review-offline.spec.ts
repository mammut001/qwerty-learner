import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('saved review words remain usable when the original dictionary cannot be downloaded', async ({ page }) => {
  await page.route('**/dicts/*.json', (route) => {
    return route.abort()
  })
  await page.addInitScript(() => {
    localStorage.setItem('currentChapter', '-1')
    localStorage.setItem(
      'reviewModeInfo',
      JSON.stringify({
        isReviewMode: true,
        reviewRecord: {
          dict: 'tcf-canada-foundation-01',
          words: [{ name: 'bonjour', trans: ['你好'] }],
          index: 0,
          isFinished: false,
          createTime: Date.now(),
        },
      }),
    )
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('bonjour')
  await expect(page.getByRole('button', { name: '练习其他章节', exact: true })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('currentChapter') ?? 'null'))).toBe(-1)
  await expect(page.getByRole('alert')).not.toBeAttached()
})
