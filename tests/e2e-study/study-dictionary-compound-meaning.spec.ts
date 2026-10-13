import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('batch completion does not mistake one component for the meaning of an unknown compound', async ({ page }) => {
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('rendez-vous\nzzzzqx-rite\nl’école\nmangeais')
  await page.getByRole('button', { name: '补全缺失中文', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已补全 3 个词条，1 个暂未补全')
  await expect(editor).toHaveValue(/rendez-vous = /)
  await expect(editor).toHaveValue(/\nzzzzqx-rite\n/)
  await expect(editor).toHaveValue(/l’école = .*学校/)
  await expect(editor).toHaveValue(/mangeais = .*吃/)
})

test('typing an unknown compound never displays its component’s definition as the whole meaning', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => route.abort())
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('词组释义')
  await page.getByLabel('词条', { exact: true }).fill('zzzzqx-rite')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByText('暂无释义', { exact: true })).toBeVisible()
  await expect(page.getByText('（宗教）仪式；礼仪', { exact: true })).toHaveCount(0)
})
