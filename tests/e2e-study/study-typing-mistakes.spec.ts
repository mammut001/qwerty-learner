import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { read, utils } from 'xlsx'

test('typos reset the word, export exact mistake counts and allow practice without React render warnings', async ({ page }) => {
  const renderWarnings: string[] = []
  page.on('console', (message) => {
    if (/Cannot update a component|while rendering a different component/.test(message.text())) renderWarnings.push(message.text())
  })
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('纠错练习')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好\nmerci = 谢谢')
  await page.getByTestId('word-list-practise').click()
  await expect(page).toHaveURL(/\/typing$/)
  await expect(page.getByRole('link', { name: '纠错练习' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await expect(page.getByText('你好', { exact: true })).toBeVisible()
  const firstLetter = page.locator('span').filter({ hasText: /^b$/ }).first()
  for (const typo of ['x', 'y']) {
    await page.keyboard.press(typo)
    await expect(firstLetter).toHaveClass(/text-red-600/)
    await expect(firstLetter).toHaveClass(/text-gray-600/)
  }
  for (const key of 'bonjour') await page.keyboard.press(key)
  await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
  const nextLetter = page.locator('span').filter({ hasText: /^m$/ }).first()
  await expect(nextLetter).toHaveClass(/text-gray-600/)
  await page.keyboard.press('m')
  await expect(nextLetter).toHaveClass(/text-green-600/)
  for (const key of 'erci') await page.keyboard.press(key)
  await expect(page.getByText('导出本章练习结果', { exact: true })).toBeAttached()
  const exportControl = page.getByText('导出本章练习结果', { exact: true }).locator('../..').locator('svg')
  const downloadPromise = page.waitForEvent('download')
  await exportControl.click()
  const download = await downloadPromise
  const filePath = await download.path()
  if (!filePath) throw new Error('Missing practice export')
  const workbook = read(await readFile(filePath), { type: 'buffer' })
  const rows = utils.sheet_to_json<{ name: string; wrongCount: number; wrongLetters: string }>(workbook.Sheets.Data)
  expect(rows.find((row) => row.name === 'bonjour')).toMatchObject({ wrongCount: 2, wrongLetters: 'b:2' })
  expect(rows.find((row) => row.name === 'merci')).toMatchObject({ wrongCount: 0 })
  expect(renderWarnings).toEqual([])
})

test('multi-character input validates every letter and supports French phrases with spaces', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('批量输入练习')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好\nun bail = 租约\nmerci = 谢谢')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '批量输入练习' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  const firstLetter = page.locator('span').filter({ hasText: /^b$/ }).first()
  await page.keyboard.insertText('xxxjour')
  await expect(firstLetter).toHaveClass(/text-red-600/)
  await expect(firstLetter).toHaveClass(/text-gray-600/)
  await expect(page.getByText('你好', { exact: true })).toBeVisible()
  await page.keyboard.insertText('bonjourx')
  const lastLetter = page.locator('span').filter({ hasText: /^r$/ }).first()
  await expect(lastLetter).toHaveClass(/text-red-600/)
  await expect(lastLetter).toHaveClass(/text-gray-600/)
  await page.keyboard.insertText('bon')
  await expect(firstLetter).toHaveClass(/text-green-600/)
  await expect(page.locator('span').filter({ hasText: /^n$/ }).first()).toHaveClass(/text-green-600/)
  await page.keyboard.insertText('jour')
  await expect(page.getByText('租约', { exact: true })).toBeVisible()
  await expect(page.locator('span').filter({ hasText: /^u$/ }).first()).toHaveClass(/text-gray-600/)
  // Browsers can deliver paste input with null data while the textarea holds the text.
  await page.locator('textarea').evaluate((element) => {
    element.value = 'un bail'
    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: null }))
  })
  await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
})

test('paste shortcuts remain available and the dictation shortcut uses Alt', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('剪贴板练习')
  await page.getByLabel('词条', { exact: true }).fill('bonjour = 你好\nmerci = 谢谢')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '剪贴板练习' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  for (const shift of [false, true]) {
    const intercepted = await page.locator('textarea').evaluate((element, shiftKey) => {
      const event = new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', ctrlKey: true, shiftKey, bubbles: true, cancelable: true })
      element.dispatchEvent(event)
      const prevented = event.defaultPrevented
      element.dispatchEvent(new KeyboardEvent('keyup', { key: 'v', code: 'KeyV', ctrlKey: true, shiftKey, bubbles: true }))
      return prevented
    }, shift)
    expect(intercepted).toBe(false)
  }
  await page.keyboard.press('Control+Alt+v')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wordDictationConfig') ?? '{}').isOpen)).toBe(true)
  await page.keyboard.press('Control+Alt+v')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wordDictationConfig') ?? '{}').isOpen)).toBe(false)
  await page.keyboard.press('Control+Alt+Shift+v')
  await expect(page.getByText('你好', { exact: true })).toBeHidden()
  await page.keyboard.press('Control+Alt+Shift+v')
  await expect(page.getByText('你好', { exact: true })).toBeVisible()
  await page.evaluate(() => navigator.clipboard.writeText('bonjour'))
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+v' : 'Control+v')
  await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
})
