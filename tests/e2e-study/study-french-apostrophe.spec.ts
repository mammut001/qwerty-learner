import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { read, utils } from 'xlsx'

for (const [headword, input] of [
  ["l'ami", 'l’ami'],
  ['l’ami', "l'ami"],
]) {
  test(`French ${JSON.stringify(headword)} accepts ${JSON.stringify(input)} without a typo`, async ({ page }) => {
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('撇号输入验证')
    await page.getByLabel('词条', { exact: true }).fill(`${headword} = 朋友`)
    await page.getByTestId('word-list-practise').click()
    await expect(page.getByRole('link', { name: '撇号输入验证' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    await page.keyboard.insertText(input)
    const button = page.getByRole('button', { name: '导出本章练习结果', exact: true })
    await expect(button).toBeVisible()
    const pending = page.waitForEvent('download')
    await button.click()
    const download = await pending
    const path = await download.path()
    if (!path) throw new Error('Missing export')
    const workbook = read(await readFile(path), { type: 'buffer' })
    expect(utils.sheet_to_json(workbook.Sheets.Data)).toMatchObject([{ name: headword, correctCount: 5, wrongCount: 0 }])
  })
}

test('omitting a French apostrophe is still a typo', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('撇号必填验证')
  await page.getByLabel('词条', { exact: true }).fill("l'ami = 朋友")
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '撇号必填验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await page.keyboard.insertText('lami')
  const apostrophe = page.locator('div[lang="fr"] span.font-mono').nth(1)
  await expect(apostrophe).toHaveClass(/text-red-600/)
  await expect(apostrophe).toHaveClass(/text-gray-600/)
  await page.keyboard.insertText('l’ami')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
})
