import { expect, test } from '@playwright/test'

test('imported duplicates complete missing meanings while preserving existing notes and word order', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('补全生词')
  await page.getByLabel('词条', { exact: true }).fill('école\nrite = rite\nbonjour = 我的笔记')
  await page.getByTestId('word-list-file').setInputFiles({
    name: 'meanings.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify([
        { name: 'e\u0301cole', trans: ['学校'] },
        { name: 'rite', trans: ['仪式'] },
        { name: 'bonjour', trans: ['你好'] },
      ]),
    ),
  })
  await expect(page.getByRole('status')).toContainText('已读入 meanings.json')
  await expect(page.getByTestId('word-list-count')).toContainText('识别到 3 个词条')
  await expect(page.getByText('已合并 3 个重复词条')).toBeVisible()
  await page.getByTestId('word-list-save').click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-custom-dicts-v1') ?? '[]')[0].words)).toEqual([
    { name: 'école', trans: ['学校'] },
    { name: 'rite', trans: ['仪式'] },
    { name: 'bonjour', trans: ['我的笔记'] },
  ])
})
