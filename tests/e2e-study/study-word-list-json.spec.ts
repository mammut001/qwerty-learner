import { expect, test } from '@playwright/test'

test('JSON line breaks and tabs do not become extra words when imported and saved', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('阅读词组')
  await page.getByTestId('word-list-file').setInputFiles({
    name: 'words.json',
    mimeType: 'application/json',
    buffer: Buffer.from('\uFEFF' + JSON.stringify([{ name: 'avoir\nbesoin de', trans: ['需要\n有必要', '必须\t要'] }])),
  })
  await expect(page.getByRole('status')).toContainText('已读入 words.json')
  await expect(page.getByLabel('词条', { exact: true })).toHaveValue('avoir besoin de = 需要 有必要；必须 要')
  await expect(page.getByTestId('word-list-count')).toContainText('识别到 1 个词条')
  await page.getByTestId('word-list-save').click()
  await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)).toEqual([
    { name: 'avoir besoin de', trans: ['需要 有必要；必须 要'] },
  ])
})

test('invalid JSON entries do not silently drop words or meanings and corrected files can be imported', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('JSON 生词')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('salut = 嗨')
  const file = page.getByTestId('word-list-file')
  await file.setInputFiles({
    name: 'words.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([{ name: 'bonjour', trans: ['你好'] }, null])),
  })
  await expect(page.getByRole('status')).toContainText('第 2 个词条缺少有效的 name')
  await expect(editor).toHaveValue('salut = 嗨')
  await file.setInputFiles({
    name: 'words.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([{ name: 'bonjour', trans: ['你好', 123] }])),
  })
  await expect(page.getByRole('status')).toContainText('第 1 个词条的 trans 需要是字符串或字符串数组')
  await expect(editor).toHaveValue('salut = 嗨')
  await file.setInputFiles({
    name: 'words.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([{ name: 'bonjour', trans: '早安' }])),
  })
  await expect(page.getByRole('status')).toContainText('已读入 words.json')
  await expect(editor).toHaveValue('salut = 嗨\nbonjour = 早安')
  await page.getByTestId('word-list-save').click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)).toEqual([
    { name: 'salut', trans: ['嗨'] },
    { name: 'bonjour', trans: ['早安'] },
  ])
})
