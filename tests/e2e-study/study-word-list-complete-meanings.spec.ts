import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('batch Chinese completion preserves notes and comments and only persists after saving', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('待补全')
  await page
    .getByLabel('词条', { exact: true })
    .fill('rite\nRite\nembaucher = embaucher\nremonter = my personal note\nconnaître = 我的笔记\nzzzzqx')
  await page.getByTestId('word-list-save').click()
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill(`${await editor.inputValue()}\n# 保留这条备注`)
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已补全 3 个词条，1 个暂未补全')
  await expect(editor).toHaveValue(/rite = （宗教）仪式；礼仪/)
  await expect(editor).toHaveValue(/Rite = （宗教）仪式；礼仪/)
  await expect(editor).toHaveValue(/embaucher = 雇用；招聘/)
  await expect(editor).toHaveValue(/remonter = my personal note/)
  await expect(editor).toHaveValue(/connaître = 我的笔记/)
  await expect(editor).toHaveValue(/# 保留这条备注$/)
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)
  expect(saved.find((word: { name: string }) => word.name === 'rite').trans).toEqual([])
  await page.getByTestId('word-list-save').click()
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)
  expect(saved.find((word: { name: string }) => word.name === 'rite').trans).toEqual(['（宗教）仪式；礼仪'])
})

test('editing during lookup cancels completion so a late result cannot replace the draft', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/lexicon/fr/ri.json*', async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('rite')
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('button', { name: '正在补全中文…' })).toBeDisabled()
  await editor.fill('embaucher = 我刚写的笔记')
  const response = page.waitForResponse((response) => response.url().includes('/lexicon/fr/ri.json'))
  release()
  await (await response).finished()
  // A new action also confirms that no completion job continues owning the editor.
  await page.getByLabel('词表名称').fill('新草稿')
  await page.getByTestId('word-list-save').click()
  await expect(editor).toHaveValue('embaucher = 我刚写的笔记')
  await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
})

test('a failed shard does not discard successful meanings and can be retried', async ({ page }) => {
  let recovered = false
  await page.route('**/lexicon/fr/ri.json*', (route) => (recovered ? route.continue() : route.fulfill({ status: 503, json: {} })))
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('rite\nembaucher')
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已补全 1 个词条，1 个暂未补全')
  await expect(page.getByRole('status')).toContainText('加载失败，可重试')
  await expect(editor).toHaveValue('rite\nembaucher = 雇用；招聘')
  recovered = true
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已补全 1 个词条，0 个暂未补全')
  await expect(editor).toHaveValue('rite = （宗教）仪式；礼仪\nembaucher = 雇用；招聘')
})

test('switching lists cancels completion and keeps the newly selected list intact', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'qwerty-fr-custom-dicts-v1',
      JSON.stringify([
        { id: 'custom-first', name: '第一本', description: '', words: [{ name: 'rite', trans: [] }], createdAt: 1, updatedAt: 1 },
        {
          id: 'custom-second',
          name: '第二本',
          description: '',
          words: [{ name: 'embaucher', trans: ['我的笔记'] }],
          createdAt: 2,
          updatedAt: 2,
        },
      ]),
    ),
  )
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/lexicon/fr/ri.json*', async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/word-lists')
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('button', { name: '正在补全中文…' })).toBeDisabled()
  await page.getByRole('button', { name: /第二本/ }).click()
  const response = page.waitForResponse((response) => response.url().includes('/lexicon/fr/ri.json'))
  release()
  await (await response).finished()
  await expect(page.getByLabel('词表名称')).toHaveValue('第二本')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('embaucher = 我的笔记')
  await expect(page.getByRole('button', { name: '补全缺失中文', exact: true })).toBeDisabled()
})
