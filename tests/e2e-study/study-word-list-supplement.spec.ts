import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('a personal note can preview a Chinese supplement and dismissing the preview leaves the note', async ({ page }) => {
  await page.goto('/word-lists')
  const editor = page.getByLabel('词条', { exact: true })
  await editor.fill('remonter = my personal note')
  await page.getByTestId('chinese-supplement-preview-button').click()
  const preview = page.getByTestId('chinese-supplement-preview')
  await expect(preview).toBeVisible()
  await expect(preview).toContainText('my personal note')
  await expect(preview).toContainText('回升')
  await page.getByTestId('chinese-supplement-dismiss').click()
  await expect(preview).toHaveCount(0)
  await expect(editor).toHaveValue('remonter = my personal note')
  await page.getByTestId('chinese-supplement-preview-button').click()
  await expect(preview).toBeVisible()
  await page.getByTestId('chinese-supplement-accept').click()
  await expect(editor).toHaveValue(/my personal note/)
  await expect(editor).toHaveValue(/回升/)
})
