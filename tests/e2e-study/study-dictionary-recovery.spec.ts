import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('a failed dictionary shard can be retried and the recovered word can be saved', async ({ page }) => {
  let recovered = false
  await page.route('**/lexicon/fr/bo.json', (route) =>
    recovered ? route.continue() : route.fulfill({ status: 503, json: { error: 'temporary' } }),
  )
  await page.route('**/api/study-plan/dictionary**', (route) => route.fulfill({ status: 502, json: {} }))
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/dictionary?q=bonjour')
  await expect(page.getByRole('alert')).toContainText('词典数据加载失败（503）')
  await expect(page.getByTestId('dictionary-add')).toHaveCount(0)
  recovered = true
  await page.getByRole('button', { name: '重试查词' }).click()
  await expect(page).toHaveURL(/q=bonjour/)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByTestId('dictionary-result').locator('span[lang="fr"]', { hasText: /^bonjour$/ })).toBeVisible()
  await page.getByTestId('dictionary-add').click()
  await expect(page.getByRole('status')).toContainText('已新建「生词本」并加入')
})

test('clearing a failed query removes its error and returns to dictionary help', async ({ page }) => {
  await page.route('**/lexicon/fr/bo.json', (route) => route.fulfill({ status: 503, json: {} }))
  await page.goto('/dictionary?q=bonjour')
  await expect(page.getByRole('alert')).toBeVisible()
  const search = page.getByRole('searchbox', { name: '查词' })
  await search.fill('')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/dictionary$/)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByText('试试看', { exact: true })).toBeVisible()
})
