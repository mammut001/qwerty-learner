const { expect, test } = require('@playwright/test')

const CANNED_BODY = JSON.stringify({
  parse: {
    text: '<div class="mw-heading mw-heading2"><h2 id="法語">法語</h2></div><ol><li>住所，住處<dl><dd>example</dd></dl></li><li>住宅</li></ol><div class="mw-heading mw-heading2"><h2 id="英语">英语</h2></div><ol><li>不应出现</li></ol>',
  },
})

test('online Chinese fallback from Wiktionary with caching and error handling, plus grammar prompt lookup', async ({ page }) => {
  let requestCount = 0
  await page.route('https://zh.wiktionary.org/**', (route) => {
    requestCount += 1
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: CANNED_BODY,
    })
  })

  // 1. /dictionary?q=voisinage shows dictionary-online containing 住所，住处 (Simplified!) and 住宅,
  // and not 不应出现 and not example.
  await page.goto('/dictionary?q=voisinage')
  const onlineBlock = page.getByTestId('dictionary-online')
  await expect(onlineBlock).toBeVisible()
  await expect(onlineBlock).toContainText('住所，住处')
  await expect(onlineBlock).toContainText('住宅')
  await expect(onlineBlock).not.toContainText('不应出现')
  await expect(onlineBlock).not.toContainText('example')
  expect(requestCount).toBe(1)

  // 2. A second visit to the same word does not call the network again (count the routed requests).
  await page.goto('/dictionary?q=voisinage')
  await expect(page.getByTestId('dictionary-online')).toBeVisible()
  expect(requestCount).toBe(1)

  // 3. A word that already has curated Chinese, /dictionary?q=logement, makes no request.
  await page.goto('/dictionary?q=logement')
  await expect(page.getByTestId('dictionary-result')).toContainText('本站词库')
  await expect(page.getByTestId('dictionary-online')).toHaveCount(0)
  expect(requestCount).toBe(1)

  // 4. When the route is aborted (route.abort()), the page still shows the English definitions and no
  // dictionary-online block. Use a different word for this case: trottoir.
  await page.unroute('https://zh.wiktionary.org/**')
  await page.route('https://zh.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=trottoir')
  const result = page.getByTestId('dictionary-result')
  await expect(result).toBeVisible()
  await expect(page.getByTestId('dictionary-online')).toHaveCount(0)
  await expect(result).toContainText('trottoir')

  // 5. In /grammar-session, after submitting the first batch of the default topic, clicking a French word inside a
  // question prompt opens dictionary-popover.
  await page.unroute('https://zh.wiktionary.org/**')
  await page.route('https://zh.wiktionary.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: CANNED_BODY,
    }),
  )
  await page.goto('/grammar-session')
  await page.getByRole('button', { name: '开始 30 分钟' }).click()

  const options = page.getByRole('button', { name: /^A\./ })
  await expect(options).toHaveCount(4)
  for (let index = 0; index < 4; index += 1) {
    await options.nth(index).click()
  }
  for (const textarea of await page.locator('textarea').all()) {
    await textarea.fill('测试理由')
  }
  await page.getByRole('button', { name: '提交本组并看解释' }).click()
  await expect(page.getByRole('button', { name: '继续下一组' })).toBeVisible()

  const promptWord = page.locator('section').first().locator('.text-xl').locator('span[role="button"]').first()
  await promptWord.click()
  const popover = page.getByTestId('dictionary-popover')
  await expect(popover).toBeVisible()
})
