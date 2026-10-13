import { expect, test } from '@playwright/test'

for (const target of ['existing', 'new']) {
  test(`switching to ${target} word list asks before discarding unsaved changes`, async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'qwerty-fr-custom-dicts-v1',
        JSON.stringify([
          {
            id: 'custom-first',
            name: '词表一',
            description: '',
            words: [{ name: 'bonjour', trans: ['你好'] }],
            createdAt: 1,
            updatedAt: 1,
          },
          { id: 'custom-second', name: '词表二', description: '', words: [{ name: 'salut', trans: ['你好'] }], createdAt: 1, updatedAt: 1 },
        ]),
      ),
    )
    await page.goto('/word-lists')
    const editor = page.getByLabel('词条', { exact: true })
    await editor.fill('bonjour = 未保存的修改')
    // Re-selecting the current list must not clear its edits or open a dialog.
    await page.getByRole('button', { name: /^词表一/ }).click()
    await expect(editor).toHaveValue('bonjour = 未保存的修改')
    const next = target === 'existing' ? page.getByRole('button', { name: /^词表二/ }) : page.getByTestId('word-list-new')
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('未保存的修改')
      await dialog.dismiss()
    })
    await next.click()
    await expect(editor).toHaveValue('bonjour = 未保存的修改')
    await expect(page.getByLabel('词表名称')).toHaveValue('词表一')
    page.once('dialog', (dialog) => dialog.accept())
    await next.click()
    await expect(page.getByLabel('词表名称')).toHaveValue(target === 'existing' ? '词表二' : '')
    await expect(editor).toHaveValue(target === 'existing' ? 'salut = 你好' : '')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words[0].trans)).toEqual([
      '你好',
    ])
  })
}
