import { expect, test } from '@playwright/test'

for (const mode of ['hideVowel', 'hideConsonant'] as const) {
  test(`French dictation ${mode} handles accents, ligatures and y`, async ({ page }) => {
    await page.addInitScript((type) => {
      localStorage.setItem('wordDictationConfig', JSON.stringify({ isOpen: true, type, openBy: 'user' }))
    }, mode)
    await page.goto('/word-lists')
    await page.getByLabel('词表名称').fill('法语元音听写')
    await page.getByLabel('词条', { exact: true }).fill('œuvre = 作品\nété = 夏天\npays = 国家\nmerci = 谢谢')
    await page.getByTestId('word-list-practise').click()
    await expect(page.getByRole('link', { name: '法语元音听写' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    const letters = page.locator('div[lang="fr"] span.font-mono')
    for (const [word, masked, meaning] of [
      ['œuvre', mode === 'hideVowel' ? '__vr_' : 'œu__e', '作品'],
      ['été', mode === 'hideVowel' ? '_t_' : 'é_é', '夏天'],
      ['pays', mode === 'hideVowel' ? 'p__s' : '_ay_', '国家'],
    ]) {
      await expect(page.getByText(meaning, { exact: true })).toBeVisible()
      await expect.poll(async () => (await letters.allTextContents()).join('')).toBe(masked)
      await page.keyboard.insertText(word[0])
      await expect(letters.first()).toHaveText(word[0])
      await expect(letters.first()).toHaveClass(/text-green-600/)
      await page.keyboard.insertText(word.slice(1))
    }
    await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
  })
}
