import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

for (const payload of [{ error: 'bad response' }, [null], [{ name: 123 }], []]) {
  test(`invalid dictionary ${JSON.stringify(payload)} shows an error and retries in place`, async ({ page }) => {
    let recovered = false
    await page.route('**/dicts/TCF_Canada_Foundation_01.json', (route) =>
      route.fulfill({
        json: recovered ? [{ name: 'bonjour', trans: ['你好'] }] : payload,
      }),
    )
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/typing')
    await expect(page.getByRole('alert')).toContainText('词库加载失败')
    await expect(page.getByRole('button', { name: '重新加载', exact: true })).toBeVisible()
    await page.evaluate(() => {
      ;(window as Window & { retryMarker?: boolean }).retryMarker = true
    })
    recovered = true
    await page.getByRole('button', { name: '重新加载', exact: true }).click()
    await expect(page.getByRole('alert')).not.toBeAttached()
    expect(await page.evaluate(() => (window as Window & { retryMarker?: boolean }).retryMarker)).toBe(true)
    await page.keyboard.press('Enter')
    await expect(page.locator('textarea')).toBeFocused()
    await page.keyboard.insertText('bonjour')
    await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })
}
