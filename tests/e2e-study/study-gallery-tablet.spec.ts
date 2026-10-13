import { expect, test } from '@playwright/test'

test('dictionary details fit a narrow tablet viewport and remain scrollable', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 600 })
  await page.goto('/gallery?dict=tcf-canada-foundation-01')
  const dialog = page.getByRole('dialog', { name: '基础核心词 01', exact: true })
  await expect(dialog).toBeVisible()
  await expect.poll(async () => (await dialog.boundingBox())?.width ?? 1000).toBeLessThanOrEqual(684)
  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(8)
  expect(box!.y).toBeGreaterThanOrEqual(8)
  expect(box!.x + box!.width).toBeLessThanOrEqual(692)
  expect(box!.y + box!.height).toBeLessThanOrEqual(592)
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})
