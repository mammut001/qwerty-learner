import { expect, test } from '@playwright/test'

// Request failure and delay fixtures must reach Playwright instead of the service-worker cache.
test.use({ serviceWorkers: 'block' })

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
  await expect(youdao.locator('mark')).toHaveText('Bonjour')

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

test('rite stays a French headword and examples highlight whole words only', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        query: 'rite',
        word: 'rite',
        phone: '',
        source: '',
        senses: [],
        examples: [{ fr: 'Ce rite mérite une étude. Rite : un rite ancien.', zh: '这个仪式值得研究。一个古老的仪式。' }],
      }),
    }),
  )
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=rite')
  const result = page.getByTestId('dictionary-result')
  await expect(result.locator('span[lang="fr"]', { hasText: /^rite$/ })).toBeVisible()
  await expect(result).toContainText('英文释义')
  await expect(result.locator('mark')).toHaveText(['rite', 'Rite', 'rite'])
})

test('an identical English gloss is not saved as a meaning', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ json: { word: 'rite', senses: [], examples: [] } }))
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=rite')
  await expect(page.getByTestId('dictionary-result')).toContainText('英文释义')
  await page.getByTestId('dictionary-add').click()
  await expect(page.getByRole('status')).toContainText('已新建')
  await page.goto('/word-lists')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('rite')
})

test('typing fills a legacy repeated headword with an available Chinese meaning', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({ json: { word: 'rite', senses: [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] } }),
  )
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('缺失释义')
  await page.getByLabel('词条', { exact: true }).fill('rite = rite')
  await page.getByTestId('word-list-practise').click()
  await page.keyboard.press('Enter')
  await expect(page.getByText('仪式；礼仪', { exact: true })).toBeVisible()
})

test('typing exposes missing meanings when all sources fail', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ status: 502, json: {} }))
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('缺失释义')
  await page.getByLabel('词条', { exact: true }).fill('rite = rite')
  await page.getByTestId('word-list-practise').click()
  await page.keyboard.press('Enter')
  await expect(page.getByText('暂无释义', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '查看词典' })).toHaveAttribute('href', '/dictionary?q=rite')
})

test('typing still tries the online definition when the offline shard cannot load', async ({ page }) => {
  await page.route('**/lexicon/fr/ri.json', (route) => route.abort())
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({ json: { word: 'rite', senses: [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] } }),
  )
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('缺失释义')
  await page.getByLabel('词条', { exact: true }).fill('rite')
  await page.getByTestId('word-list-practise').click()
  await page.keyboard.press('Enter')
  await expect(page.getByText('仪式；礼仪', { exact: true })).toBeVisible()
})

for (const trans of [[], ['bonjour'], ['我的专属笔记']]) {
  test(`saved word meaning can be completed without overwriting notes: ${JSON.stringify(trans)}`, async ({ page }) => {
    await page.addInitScript((trans) => {
      window.localStorage.setItem(
        'qwerty-fr-custom-dicts-v1',
        JSON.stringify([
          { id: 'custom-repair', name: '生词本', description: '', words: [{ name: 'bonjour', trans }], createdAt: 1, updatedAt: 1 },
        ]),
      )
    }, trans)
    await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ json: BONJOUR }))
    await page.goto('/dictionary?q=bonjour')
    await expect(page.getByTestId('dictionary-youdao')).toContainText('早安，日安')
    const button = page.getByTestId('dictionary-add')
    if (trans[0] === '我的专属笔记') {
      await expect(button).toBeDisabled()
      await expect(button).toHaveText('已在词表中')
    } else {
      await expect(button).toHaveText('补全释义')
      await button.click()
      await expect(page.getByRole('status')).toContainText('已补全')
    }
    const words = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)
    expect(words).toEqual([{ name: 'bonjour', trans: trans[0] === '我的专属笔记' ? trans : ['早安，日安，白天好，你好'] }])
  })
}

for (const recovery of ['button', 'online']) {
  test(`missing meaning can recover without restarting practice: ${recovery}`, async ({ page }) => {
    let recovered = false
    await page.route('**/api/study-plan/dictionary**', (route) =>
      recovered
        ? route.fulfill({ json: { word: 'rite', senses: [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] } })
        : route.fulfill({ status: 502, json: {} }),
    )
    await page.route('**://*.wiktionary.org/**', (route) => route.abort())
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('补查恢复')
    await page.getByLabel('词条', { exact: true }).fill('rite')
    await page.getByTestId('word-list-practise').click()
    await page.keyboard.press('Enter')
    await expect(page.getByText('暂无释义', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '开始', exact: true }).click()
    await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
    recovered = true
    if (recovery === 'button') await page.getByRole('button', { name: '重试释义' }).click()
    else await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await expect(page.getByText('仪式；礼仪', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '重试释义' })).toHaveCount(0)
  })
}

test('a new query hides the previous word and its save button while loading', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({
      json:
        new URL(route.request().url()).searchParams.get('q') === 'rite'
          ? { word: 'rite', senses: [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] }
          : BONJOUR,
    }),
  )
  await page.goto('/dictionary?q=bonjour')
  await expect(page.getByTestId('dictionary-youdao')).toContainText('早安，日安')
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/lexicon/fr/ri.json', async (route) => {
    await gate
    await route.continue()
  })
  const search = page.getByRole('searchbox', { name: '查词' })
  await search.fill('rite')
  await search.press('Enter')
  try {
    await expect(page).toHaveURL(/q=rite/)
    await expect(page.getByText('正在查「rite」…', { exact: true })).toBeVisible()
    await expect(page.getByTestId('dictionary-add')).toHaveCount(0)
    await expect(page.getByTestId('dictionary-result')).toHaveCount(0)
  } finally {
    release()
  }
  await expect(page.getByTestId('dictionary-result').locator('span[lang="fr"]', { hasText: /^rite$/ })).toBeVisible()
  await expect(page.getByTestId('dictionary-youdao')).toContainText('仪式；礼仪')
})

test('a query with an elided article still displays its resolved dictionary entry', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ status: 502, json: {} }))
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=l%27%C3%A9cole')
  await expect(page.getByTestId('dictionary-result')).toContainText('school')
  await expect(page.getByTestId('dictionary-result').locator('span[lang="fr"]', { hasText: /^école$/ })).toBeVisible()
})

test('explicit retry refreshes a cached empty dictionary response', async ({ page }) => {
  let requests = 0
  await page.route('**/api/study-plan/dictionary**', (route) => {
    requests += 1
    if (requests > 1) expect(new URL(route.request().url()).searchParams.get('refresh')).toBe('1')
    return route.fulfill({ json: { word: 'rite', senses: requests === 1 ? [] : [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] } })
  })
  await page.route('**://*.wiktionary.org/**', (route) => route.fulfill({ json: { error: { code: 'missingtitle' } } }))
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('缓存恢复')
  await page.getByLabel('词条', { exact: true }).fill('rite')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('暂无释义', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '开始', exact: true }).click()
  await page.getByRole('button', { name: '重试释义' }).click()
  await expect(page.getByText('仪式；礼仪', { exact: true })).toBeVisible()
  expect(requests).toBe(2)
})

test('explicit retry also refreshes cached empty Wiktionary results', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ json: { word: 'rite', senses: [], examples: [] } }))
  let zhRequests = 0
  await page.route('**://*.wiktionary.org/**', (route) => {
    if (new URL(route.request().url()).hostname === 'zh.wiktionary.org') {
      zhRequests += 1
      if (zhRequests > 1)
        return route.fulfill({ json: { parse: { text: '<h2 id="法语">法语</h2><ol><li>仪式；礼仪</li></ol><h2>英语</h2>' } } })
    }
    return route.fulfill({ json: { error: { code: 'missingtitle' } } })
  })
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('缓存恢复')
  await page.getByLabel('词条', { exact: true }).fill('rite')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('暂无释义', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '开始', exact: true }).click()
  await page.getByRole('button', { name: '重试释义' }).click()
  await expect(page.getByText('仪式；礼仪', { exact: true })).toBeVisible()
  expect(zhRequests).toBe(2)
})

test('a repeated headword with decomposed accents is still treated as a missing meaning', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('重音释义')
  await page.getByLabel('词条', { exact: true }).fill('école = e\u0301cole')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('n.f. 学校', { exact: true })).toBeVisible()
})

test('a late definition never replaces the next word after manual navigation', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  let requested = false
  await page.route('**/api/study-plan/dictionary**', async (route) => {
    requested = true
    await gate
    await route.fulfill({ json: { word: 'rite', senses: [{ pos: 'm.', gloss: '仪式；礼仪' }], examples: [] } })
  })
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('切换释义')
  await page.getByLabel('词条', { exact: true }).fill('rite\nbonjour = 你好')
  await page.getByTestId('word-list-practise').click()
  await expect.poll(() => requested).toBe(true)
  await page.getByRole('button', { name: '开始', exact: true }).click()
  await page.getByText('bonjour', { exact: true }).click()
  await expect(page.getByText('你好', { exact: true })).toBeVisible()
  const delivered = page.waitForResponse('**/api/study-plan/dictionary**')
  release()
  await (await delivered).finished()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await expect(page.getByText('你好', { exact: true })).toBeVisible()
  await expect(page.getByText('仪式；礼仪', { exact: true })).toHaveCount(0)
})
