import { expect, test } from '@playwright/test'

test('a custom word list can be created, practised, edited, found in the gallery and deleted', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('模考生词')
  await page.getByLabel('词条', { exact: true }).fill(
    ['# 阅读套题 B', 'un bail = 租约', 'déménager\t搬家', 'en revanche：相反', 'un bail = 重复', 'sans-abri', ''].join('\n'),
  )
  await expect(page.getByTestId('word-list-count')).toContainText('识别到 4 个词条 · 1 章')
  await expect(page.getByText('已忽略 1 个重复词条')).toBeVisible()

  // Saving selects the list and opens the typing page on its first chapter.
  await page.getByTestId('word-list-practise').click()
  await expect(page).toHaveURL(/\/typing$/)
  await expect(page.getByRole('link', { name: '模考生词' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByText('租约')).toBeVisible()
  for (const key of 'un bail') await page.keyboard.press(key === ' ' ? 'Space' : key)
  await expect(page.getByText('搬家')).toBeVisible()

  // A reload keeps the custom list selected instead of falling back to the default dictionary.
  await page.reload()
  await expect(page.getByRole('link', { name: '模考生词' })).toBeVisible()

  // The gallery lists it under its own category and links to the manager.
  await page.goto('/gallery')
  await expect(page.getByRole('heading', { name: '我的词表' })).toBeVisible()
  await expect(page.getByRole('button', { name: '打开词库：模考生词' })).toBeVisible()
  await page.getByTestId('gallery-word-lists').click()
  await expect(page).toHaveURL(/\/word-lists$/)

  // Edits are picked up by the typing page.
  await expect(page.getByLabel('词表名称')).toHaveValue('模考生词')
  await page.getByLabel('词条', { exact: true }).fill('le logement = 住房')
  await page.getByTestId('word-list-save').click()
  await expect(page.getByRole('status')).toContainText('已保存 1 个词条')
  await page.getByTestId('word-list-practise').click()
  await page.keyboard.press('Enter')
  await expect(page.getByText('住房')).toBeVisible()

  // Deleting the selected list sends the typing page back to the default dictionary.
  await page.goto('/word-lists')
  await page.getByTestId('word-list-delete').click()
  await page.getByTestId('word-list-delete-confirm').click()
  await expect(page.getByText('还没有词表')).toBeVisible()
  await page.goto('/typing')
  await expect(page.getByRole('link', { name: '基础核心词 01' })).toBeVisible()
})
