import { expect, test } from '@playwright/test'

for (const kind of ['long', 'many']) {
  test(`incomplete ${kind} word lists cannot replace saved data or start practice`, async ({ page }) => {
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('完整词表')
    const editor = page.getByLabel('词条', { exact: true })
    await editor.fill('bonjour = 你好')
    await page.getByTestId('word-list-save').click()
    await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
    const text =
      kind === 'long' ? 'bonjour = 你好\nsalut = ' + '长'.repeat(301) : Array.from({ length: 2001 }, (_, i) => `mot${i} = 词义`).join('\n')
    await editor.fill(text)
    await expect(page.getByTestId('word-list-save')).toBeEnabled()
    await page.getByTestId('word-list-save').click()
    await expect(page.getByRole('status')).toContainText(kind === 'long' ? '超过长度限制' : '请拆分')
    await expect(editor).toHaveValue(text)
    await page.getByTestId('word-list-practise').click()
    await expect(page).toHaveURL(/\/word-lists$/)
    await expect(editor).toHaveValue(text)
    await page.getByRole('button', { name: '导出当前编辑 JSON', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('保存或导出')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)).toEqual([
      { name: 'bonjour', trans: ['你好'] },
    ])
    await editor.fill('bonjour = 你好\nsalut = 嗨')
    await page.getByTestId('word-list-save').click()
    await expect(page.getByRole('status')).toContainText('已保存 2 个词条')
  })
}
