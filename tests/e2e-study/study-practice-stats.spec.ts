import { expect, test, type Page } from '@playwright/test'

async function startShortPractice(page: Page) {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('统计验证')
  await page.getByLabel('词条', { exact: true }).fill('a = 一个')
  await page.getByTestId('word-list-practise').click()
  await expect(page.getByRole('link', { name: '统计验证' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea')).toBeFocused()
}

test('finishing before the first timer tick produces finite statistics', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.setInterval
    window.setInterval = ((handler, delay, ...args) =>
      original(handler, delay === 1000 ? 60000 : delay, ...args)) as typeof window.setInterval
  })
  await startShortPractice(page)
  await page.keyboard.insertText('a')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
  await expect(page.getByText('章节耗时', { exact: true }).locator('..')).toContainText('00:00')
  const wpm = page.getByText('WPM', { exact: true }).first().locator('..').locator('span').first()
  await expect(wpm).toHaveText(/^\d+$/)
  await expect(page.getByText('正确率', { exact: true }).first().locator('..')).toContainText('100%')
})

test('practice with elapsed time still reports a positive finite speed', async ({ page }) => {
  await startShortPractice(page)
  await expect(page.getByText('00:01', { exact: true })).toBeVisible()
  await page.keyboard.insertText('a')
  await expect(page.getByRole('button', { name: '导出本章练习结果', exact: true })).toBeVisible()
  const wpm = page.getByText('WPM', { exact: true }).first().locator('..').locator('span').first()
  await expect(wpm).toHaveText(/^\d+$/)
  expect(Number(await wpm.innerText())).toBeGreaterThan(0)
})
