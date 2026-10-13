import { expect, test } from '@playwright/test'

for (const [headword, input] of [
  ['peut-être', 'peut‑être'],
  ['peut‑être', 'peut-être'],
  ['peut-être', 'peut–être'],
]) {
  test(`French hyphen ${JSON.stringify(headword)} accepts ${JSON.stringify(input)} without typo`, async ({ page }) => {
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('连字符验证')
    await page.getByLabel('词条', { exact: true }).fill(`${headword} = 也许`)
    await page.getByTestId('word-list-practise').click()
    await expect(page.getByRole('link', { name: '连字符验证' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    await page.keyboard.insertText(input)
    await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
  })
}

test('omitting a French hyphen is still a typo', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('连字符必填验证')
  await page.getByLabel('词条', { exact: true }).fill('peut-être = 也许')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '连字符必填验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('peutetre')
  const hyphen = page.locator('div[lang="fr"] span.font-mono').nth(4)
  await expect(hyphen).toHaveClass(/text-red-600/)
  await expect(hyphen).toHaveClass(/text-gray-600/)
  await page.keyboard.insertText('peut-être')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})

test('French phrases with non-breaking spaces accept regular spacebar input', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('不换行空格验证')
  await page.getByLabel('词条', { exact: true }).fill('très\u00A0bien = 很好')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '不换行空格验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('très bien')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})

test('French accent buttons can be activated via mouse click and keyboard Enter', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('字符按钮验证')
  await page.getByLabel('词条', { exact: true }).fill('café = 咖啡')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '字符按钮验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('caf')
  const accentButton = page.getByRole('button', { name: '输入法语字符 é', exact: true })
  await expect(accentButton).toBeVisible()
  await accentButton.click()
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})
