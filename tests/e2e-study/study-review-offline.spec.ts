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

test('review progress survives reload without cross-component render warnings', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Cannot update a component')) errors.push(message.text())
  })
  await page.addInitScript(() => {
    if (localStorage.getItem('reviewModeInfo')) return
    localStorage.setItem(
      'reviewModeInfo',
      JSON.stringify({
        isReviewMode: true,
        reviewRecord: {
          words: [
            { name: 'bonjour', trans: ['你好'] },
            { name: 'salut', trans: ['你好'] },
          ],
          index: 0,
          isFinished: false,
        },
      }),
    )
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('bonjour')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('reviewModeInfo') ?? '{}').reviewRecord.index)).toBe(1)
  await page.reload()
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('salut')
  await expect(page.getByRole('button', { name: '练习其他章节', exact: true })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('reviewModeInfo') ?? '{}').reviewRecord.isFinished))
    .toBe(true)
  expect(errors).toEqual([])
})

test('manually moving to the next review word saves the resume position', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('reviewModeInfo')) return
    localStorage.setItem(
      'reviewModeInfo',
      JSON.stringify({
        isReviewMode: true,
        reviewRecord: {
          words: [
            { name: 'bonjour', trans: ['你好'] },
            { name: 'salut', trans: ['你好'] },
          ],
          index: 0,
          isFinished: false,
        },
      }),
    )
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.getByText('salut', { exact: true }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('reviewModeInfo') ?? '{}').reviewRecord.index)).toBe(1)
  await page.reload()
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('salut')
  await expect(page.getByRole('button', { name: '练习其他章节', exact: true })).toBeVisible()
})

test('random chapter mode preserves the order of a saved review when resuming', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
    localStorage.setItem('randomConfig', JSON.stringify({ isOpen: true }))
    localStorage.setItem(
      'reviewModeInfo',
      JSON.stringify({
        isReviewMode: true,
        reviewRecord: {
          words: [
            { name: 'bonjour', trans: ['你好'] },
            { name: 'merci', trans: ['谢谢'] },
            { name: 'salut', trans: ['你好'] },
          ],
          index: 1,
          isFinished: false,
        },
      }),
    )
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  await expect(page.locator('textarea')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('merci')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('reviewModeInfo') ?? '{}').reviewRecord.index)).toBe(2)
  await page.keyboard.insertText('salut')
  await expect(page.getByRole('button', { name: '练习其他章节', exact: true })).toBeVisible()
})

test('ordinary chapters still shuffle when random mode is enabled', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
    localStorage.setItem('randomConfig', JSON.stringify({ isOpen: true }))
  })
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('随机练习验证')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好\nmerci = 谢谢\nsalut = 你好')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '随机练习验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  for (const word of ['salut', 'bonjour', 'merci']) {
    await page.keyboard.insertText(word)
    if (word !== 'merci')
      await expect(
        page
          .locator('span')
          .filter({ hasText: word === 'salut' ? /^b$/ : /^m$/ })
          .first(),
      ).toHaveClass(/text-gray-600/)
  }
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})
