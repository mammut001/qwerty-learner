import { expect, test } from '@playwright/test'

const BONJOUR = {
  query: 'bonjour',
  word: 'bonjour',
  phone: 'bɔ̃ʒu:r',
  source: '现代法汉汉法词典',
  senses: [{ pos: 'm.', gloss: '早安，日安，白天好，你好' }],
  examples: [{ fr: 'Client: Bonjour, monsieur.', zh: '顾客：你好，先生。' }],
}

test('Youdao Chinese is the explanation and is what gets saved to the word list', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(BONJOUR),
    }),
  )

  await page.goto('/dictionary?q=bonjour')
  const youdao = page.getByTestId('dictionary-youdao')
  await expect(youdao).toBeVisible()
  await expect(youdao).toContainText('有道 · 现代法汉汉法词典')
  await expect(youdao).toContainText('阳性名词')
  await expect(youdao).toContainText('早安，日安，白天好，你好')
  await expect(youdao).toContainText('顾客：你好，先生。')
  await expect(youdao).not.toContainText('<b>')

  await page.getByTestId('dictionary-add').click()
  await expect(page.getByRole('status')).toContainText('已新建「生词本」并加入')
  await page.goto('/word-lists')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue(/bonjour = 早安，日安，白天好，你好/)
})

test('an inflected form asks Youdao for the dictionary form', async ({ page }) => {
  let requested = ''
  await page.route('**/api/study-plan/dictionary**', (route) => {
    requested = new URL(route.request().url()).searchParams.get('q') ?? ''
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        query: requested,
        word: requested,
        phone: '',
        source: '现代法汉汉法词典',
        senses: [{ pos: 'v.t.', gloss: '吃，食用' }],
        examples: [],
      }),
    })
  })

  await page.goto('/dictionary?q=mangeais')
  await expect(page.getByTestId('dictionary-result')).toContainText('「mangeais」是 manger 的变化形式')
  await expect(page.getByTestId('dictionary-youdao')).toContainText('吃，食用')
  await expect(page.getByTestId('dictionary-youdao')).toContainText('及物动词')
  expect(requested).toBe('manger')
})

test('a failed Youdao lookup still shows the offline dictionary', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"upstream"}' }),
  )
  await page.goto('/dictionary?q=ecole')
  const result = page.getByTestId('dictionary-result')
  await expect(result).toContainText('école')
  await expect(result).toContainText('school')
  await expect(result).toContainText('阴性')
  await expect(page.getByTestId('dictionary-youdao')).toHaveCount(0)
})
