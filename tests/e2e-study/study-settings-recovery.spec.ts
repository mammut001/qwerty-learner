import { expect, test } from '@playwright/test'

for (const corrupted of [null, { foreignFont: null, translateFont: 31 }, ['invalid']]) {
  test(`typing recovers malformed font settings: ${JSON.stringify(corrupted)}`, async ({ page }) => {
    const crashes: string[] = []
    page.on('pageerror', (error) => crashes.push(error.message))
    await page.addInitScript((value) => {
      if (localStorage.getItem('fontsize') === null) localStorage.setItem('fontsize', JSON.stringify(value))
    }, corrupted)
    await page.goto('/typing')
    await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    const config = await page.evaluate(() => JSON.parse(localStorage.getItem('fontsize') ?? '{}'))
    expect(typeof config.foreignFont).toBe('number')
    if (corrupted && !Array.isArray(corrupted)) expect(config.translateFont).toBe(31)
    await page.reload()
    await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
    expect(crashes).toEqual([])
  })
}

test('a partial sound setting keeps the user preference and recovers a missing resource', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('keySoundsConfig', JSON.stringify({ isOpen: false, volume: 'loud', resource: null }))
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
  const config = await page.evaluate(() => JSON.parse(localStorage.getItem('keySoundsConfig') ?? '{}'))
  expect(config.isOpen).toBe(false)
  expect(config.resource).toBeTruthy()
  expect(config.volume).toBe(1)
})

test('recovered settings work even when the browser refuses to save the repair', async ({ page }) => {
  const crashes: string[] = []
  page.on('pageerror', (error) => crashes.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('fontsize', 'null')
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'fontsize') throw new DOMException('Storage unavailable', 'QuotaExceededError')
      return setItem.call(this, key, value)
    }
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  await expect(page.locator('div[lang="fr"] span.font-mono').first()).toHaveCSS('font-size', '48px')
  expect(crashes).toEqual([])
})

test('a recovered dictation setting can be changed and saved again', async ({ page }) => {
  const crashes: string[] = []
  page.on('pageerror', (error) => crashes.push(error.message))
  await page.addInitScript(() => {
    if (localStorage.getItem('wordDictationConfig') === null) localStorage.setItem('wordDictationConfig', 'null')
  })
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
  // A second tab can replace preferences after the atom has already mounted.
  await page.evaluate(() => {
    localStorage.setItem('wordDictationConfig', 'null')
    window.dispatchEvent(new StorageEvent('storage', { key: 'wordDictationConfig', newValue: 'null', storageArea: localStorage }))
  })
  await page.keyboard.press('Control+Alt+v')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wordDictationConfig') ?? '{}').isOpen)).toBe(true)
  await page.reload()
  await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('wordDictationConfig') ?? '{}').isOpen)).toBe(true)
  expect(crashes).toEqual([])
})
