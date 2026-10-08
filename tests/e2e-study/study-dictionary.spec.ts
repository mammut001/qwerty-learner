import { type Page, expect, test } from '@playwright/test'

async function stubYoudaoEmpty(page: Page) {
  await page.route('**/api/study-plan/dictionary**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ query: '', word: '', phone: '', source: '', senses: [], examples: [] }),
    }),
  )
}

test('the offline dictionary resolves accents, inflections and elisions, and feeds the word lists', async ({ page }) => {
  await stubYoudaoEmpty(page)
  await page.goto('/dictionary')

  // Typing without accents still finds the headword, with the curated Chinese meaning first.
  await page.getByRole('searchbox', { name: '查词' }).fill('ecole')
  await page.getByRole('button', { name: '查询' }).click()
  await expect(page).toHaveURL(/\/dictionary\?q=ecole$/)
  const result = page.getByTestId('dictionary-result')
  await expect(result).toContainText('école')
  await expect(result).toContainText('school')
  await expect(result).toContainText('阴性')

  // An inflected form is traced back to its dictionary form.
  await page.goto('/dictionary?q=mangeais')
  await expect(result).toContainText('「mangeais」是 manger 的变化形式')
  await expect(result).toContainText('to eat')

  // Elided articles are stripped.
  await page.goto("/dictionary?q=l'appartement")
  await expect(result).toContainText('appartement')

  // Suggestions complete a prefix.
  await page.getByRole('searchbox', { name: '查词' }).fill('logem')
  await page.getByTestId('dictionary-suggestions').getByRole('button', { name: 'logement', exact: true }).click()
  await expect(result).toContainText('本站词库')
  await expect(result).toContainText('housing')

  // Unknown words say so instead of failing.
  await page.goto('/dictionary?q=zzzzqx')
  await expect(page.getByTestId('dictionary-empty')).toBeVisible()

  // Saving a word creates the default list, which is then a normal practice list.
  await page.goto('/dictionary?q=logement')
  await page.getByTestId('dictionary-add').click()
  await expect(page.getByRole('status')).toContainText('已新建「生词本」并加入')
  await expect(page.getByTestId('dictionary-add')).toBeDisabled()
  await page.goto('/word-lists')
  await expect(page.getByLabel('词表名称')).toHaveValue('生词本')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue(/^logement = .*住房/)

  // Words in a reviewed reading passage can be looked up in place.
  await page.goto('/tcf-reading')
  await page.getByTestId('tcf-start-exam').click()
  await page.getByTestId('tcf-submit-exam').click()
  await expect(page.getByTestId('tcf-result')).toBeVisible()
  await page.getByText('fermeture', { exact: true }).click()
  const popover = page.getByTestId('dictionary-popover')
  await expect(popover).toContainText('fermeture')
  await expect(popover).toContainText('阴性')
  await popover.getByRole('button', { name: '关闭查词' }).click()
  await expect(popover).toHaveCount(0)
})
