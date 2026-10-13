import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { read, utils } from 'xlsx'

for (const { headword, legacy } of [
  { headword: 'été', legacy: false },
  { headword: 'e\u0301te\u0301', legacy: false },
  { headword: 'e\u0301te\u0301', legacy: true },
]) {
  test(`French typing accepts equivalent accent encoding in ${JSON.stringify(headword)}${legacy ? ' from an existing list' : ''}`, async ({
    page,
  }) => {
    if (legacy) {
      await page.addInitScript(
        (headword) =>
          localStorage.setItem(
            'qwerty-fr-custom-dicts-v1',
            JSON.stringify([
              {
                id: 'custom-legacy',
                name: '重音输入练习',
                description: '',
                words: [
                  { name: headword, trans: ['夏天'] },
                  { name: 'merci', trans: ['谢谢'] },
                ],
                createdAt: 1,
                updatedAt: 1,
              },
            ]),
          ),
        headword,
      )
    }
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('重音输入练习')
    await page.getByLabel('词条', { exact: true }).fill(`${headword} = 夏天\nmerci = 谢谢`)
    await page.getByTestId('word-list-practise').click()
    await expect(page.getByRole('link', { name: '重音输入练习' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    const letters = page.locator('div[lang="fr"] span.font-mono')
    await expect.poll(async () => (await letters.allTextContents()).join('')).toBe('été')
    await page.keyboard.insertText('ete')
    await expect(letters.first()).toHaveClass(/text-red-600/)
    await expect(letters.first()).toHaveClass(/text-gray-600/)
    await page.keyboard.insertText('e\u0301')
    await expect(letters.first()).toHaveText('é')
    await expect(letters.first()).toHaveClass(/text-green-600/)
    await page.keyboard.insertText('te\u0301')
    await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
    await expect(letters.first()).toHaveText('m')
    await page.keyboard.insertText('m')
    await expect(letters.first()).toHaveClass(/text-green-600/)
    await page.keyboard.insertText('erci')
    const control = page.getByText('导出本章练习结果', { exact: true })
    await expect(control).toBeAttached()
    const pending = page.waitForEvent('download')
    await control.locator('../..').locator('svg').click()
    const download = await pending
    const filePath = await download.path()
    if (!filePath) throw new Error('Missing practice export')
    const workbook = read(await readFile(filePath), { type: 'buffer' })
    const rows = utils.sheet_to_json<{ name: string; correctCount: number; wrongCount: number; wrongLetters: string }>(workbook.Sheets.Data)
    expect(rows.find((row) => row.name === (legacy ? headword : headword.normalize('NFC')))).toMatchObject({
      correctCount: 3,
      wrongCount: 1,
      wrongLetters: 'é:1',
    })
  })
}
