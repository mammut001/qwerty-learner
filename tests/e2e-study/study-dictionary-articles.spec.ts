import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })
test.beforeEach(async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.abort())
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
})

test('batch completion resolves article nouns and plurals without changing spelling or borrowing adverb meanings', async ({ page }) => {
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('le logement\nun bail\nune maison\nles maisons\nle bien\nle zzzzqx-rite')
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已补全 5 个词条，1 个暂未补全')
  await expect(editor).toHaveValue(/le logement = .*住房/)
  await expect(editor).toHaveValue(/un bail = .*租约/)
  await expect(editor).toHaveValue(/une maison = .*房子/)
  await expect(editor).toHaveValue(/les maisons = .*房子/)
  await expect(editor).toHaveValue(/le bien = 好，善，正直，善良/)
  await expect(editor).not.toHaveValue(/adv\./)
  await expect(editor).toHaveValue(/\nle zzzzqx-rite$/)
})

test('dictionary lookup keeps the article query URL while resolving the plural noun and its gender', async ({ page }) => {
  await page.goto('/dictionary?q=les%20maisons')
  await expect(page).toHaveURL(/q=les%20maisons$/)
  const result = page.getByTestId('dictionary-result')
  await expect(result).toContainText('「maisons」是 maison 的变化形式')
  await expect(result).toContainText('阴性')
  await expect(result).toContainText('房子')
})

test('typing shows an article noun’s offline Chinese meaning', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('带冠词的名词')
  await page.getByLabel('词条', { exact: true }).fill('un bail')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('n.m. 租约，租贷契约', { exact: true })).toBeVisible()
})

test('an exact phrase entry takes precedence over removing its article', async ({ page }) => {
  await page.route('**/lexicon/fr/le.json*', (route) =>
    route.fulfill({
      json: {
        e: { 'le bien': [['phrase', '', '', [], ['完整短语释义']]] },
        s: {},
        f: {},
      },
    }),
  )
  await page.goto('/dictionary?q=le%20bien')
  await expect(page.getByTestId('dictionary-result')).toContainText('完整短语释义')
  await expect(page.getByTestId('dictionary-result')).not.toContainText('好，善，正直，善良')
})
