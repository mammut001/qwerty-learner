import { expect, test } from '@playwright/test'

test('canonically equivalent accents are duplicates while different accents remain separate words', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('重音词表')
  await page.getByLabel('词条', { exact: true }).fill('école = 学校\ne\u0301cole = 重复\ncote = 评级\ncôte = 海岸')
  await expect(page.getByTestId('word-list-count')).toContainText('识别到 3 个词条')
  await expect(page.getByText('已忽略 1 个重复词条')).toBeVisible()
  await page.getByTestId('word-list-save').click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)).toEqual([
    { name: 'école', trans: ['学校'] },
    { name: 'cote', trans: ['评级'] },
    { name: 'côte', trans: ['海岸'] },
  ])
})

test('dictionary recognises an existing word stored with a decomposed accent', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'qwerty-fr-custom-dicts-v1',
      JSON.stringify([
        {
          id: 'custom-legacy',
          name: '生词本',
          description: '',
          words: [{ name: 'e\u0301cole', trans: ['学校'] }],
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    ),
  )
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ status: 502, json: {} }))
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=%C3%A9cole')
  await expect(page.getByTestId('dictionary-add')).toHaveText('已在词表中')
  await expect(page.getByTestId('dictionary-add')).toBeDisabled()
})
