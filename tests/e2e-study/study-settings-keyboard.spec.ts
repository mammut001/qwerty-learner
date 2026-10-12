import { expect, test } from '@playwright/test'

test('Space toggles settings without starting the paused exercise', async ({ page }) => {
  await page.goto('/typing')
  await page.getByTitle('打开设置对话框').click()
  const toggle = page.getByRole('switch').first()
  await expect(toggle).toBeVisible()
  const checked = await toggle.getAttribute('aria-checked')
  await toggle.focus()
  await page.keyboard.press('Space')
  await expect(toggle).toHaveAttribute('aria-checked', checked === 'true' ? 'false' : 'true')
  await expect(page.locator('textarea')).not.toBeFocused()
  await expect(toggle).toBeFocused()
})

test('Space activates the font reset button without resuming practice', async ({ page }) => {
  await page.goto('/typing')
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '显示设置' }).click()
  const slider = page.getByRole('slider').first()
  await slider.focus()
  await page.keyboard.press('End')
  await expect(slider).toHaveAttribute('aria-valuenow', '96')
  const reset = page.getByTitle('重置字体设置')
  await reset.focus()
  await page.keyboard.press('Space')
  await expect(slider).not.toHaveAttribute('aria-valuenow', '96')
  await expect(reset).toBeFocused()
  await expect(page.locator('textarea')).not.toBeFocused()
})

for (const key of ['Enter', 'Space', 'Escape']) {
  test(`${key} closes the named settings dialog and returns focus`, async ({ page }) => {
    await page.goto('/typing')
    const opener = page.getByTitle('打开设置对话框')
    await opener.click()
    const dialog = page.getByRole('dialog', { name: '设置', exact: true })
    await expect(dialog).toBeAttached()
    const close = page.getByRole('button', { name: '关闭设置', exact: true })
    await expect(close).toBeVisible()
    await expect.poll(async () => (await close.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(40)
    await expect.poll(async () => (await close.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(40)
    await close.focus()
    await page.keyboard.press(key)
    await expect(dialog).not.toBeAttached()
    await expect(opener).toBeFocused()
    await expect(page.locator('textarea')).not.toBeFocused()
  })
}
