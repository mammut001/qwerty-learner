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

for (const index of [-1, 0.5, '1']) {
  test(`invalid saved review index ${JSON.stringify(index)} restarts at the first word`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript((value) => {
      localStorage.setItem(
        'reviewModeInfo',
        JSON.stringify({ isReviewMode: true, reviewRecord: { words: [{ name: 'bonjour', trans: ['你好'] }], index: value } }),
      )
    }, index)
    await page.goto('/typing')
    await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
    await expect(page.locator('textarea')).toBeAttached()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    await page.keyboard.insertText('bonjour')
    await expect(page.getByRole('button', { name: '练习其他章节', exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const reviewRecord of [null, { words: [] }, { words: {} }]) {
  test(`empty review ${JSON.stringify(reviewRecord)} offers a route back to dictionaries`, async ({ page }) => {
    await page.addInitScript(
      (record) => localStorage.setItem('reviewModeInfo', JSON.stringify({ isReviewMode: true, reviewRecord: record })),
      reviewRecord,
    )
    await page.goto('/typing')
    await expect(page.getByRole('heading', { name: '没有可复习的词条' })).toBeVisible()
    await page.getByRole('button', { name: '返回词库' }).click()
    await expect(page).toHaveURL(/\/gallery$/)
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('reviewModeInfo') ?? '{}').isReviewMode)).toBe(false)
  })
}
