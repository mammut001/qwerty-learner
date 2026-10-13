import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('new offline Chinese meanings remain available without online sources and are saved for practice', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.abort())
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  const words = [
    ['rite', '（宗教）仪式；礼仪'],
    ['remonter', '再次上去；回升'],
    ['rituel', '宗教仪式的；按惯例进行的'],
    ['embaucher', '雇用；招聘'],
    ['bienveillance', '仁慈'],
  ]
  for (const [word, meaning] of words) {
    await page.goto(`/dictionary?q=${word}`)
    await expect(page.getByTestId('dictionary-result')).toContainText(meaning)
  }
  await page.goto('/dictionary?q=rite')
  await page.getByTestId('dictionary-add').click()
  await expect(page.getByRole('status')).toContainText('已新建')
  await page.goto('/word-lists')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('rite = （宗教）仪式；礼仪')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('（宗教）仪式；礼仪', { exact: true })).toBeVisible()
})

test('legacy headword-only meanings can be resolved from the expanded offline dictionary', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.abort())
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('旧生词本')
  await page.getByLabel('词条', { exact: true }).fill('rite = rite')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('（宗教）仪式；礼仪', { exact: true })).toBeVisible()
})
