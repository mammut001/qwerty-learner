import { expect, test } from '@playwright/test'

test('TCF question sets, shared navigation, only-wrong review and wrong-answer practice', async ({ page }) => {
  // The study plan is the home page; legacy practice links still reach the typing page.
  await page.goto('/')
  await expect(page).toHaveURL(/\/study-plan$/)
  await page.goto('/?dict=unknown-dict')
  await expect(page).toHaveURL(/\/typing\?dict=unknown-dict$/)

  // The shared navigation reaches every mock exam from any page.
  await page.goto('/study-plan')
  await page.getByRole('button', { name: /TCF 模考/ }).click()
  await page.getByRole('menuitem', { name: /阅读/ }).click()
  await expect(page).toHaveURL(/\/tcf-reading$/)
  await expect(page.getByTestId('tcf-set-a')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByTestId('tcf-start-practice')).toHaveCount(0)

  // Sit set B: one wrong answer on Q1, one right answer on Q39 reached through the navigator.
  await page.getByTestId('tcf-set-b').click()
  await page.getByTestId('tcf-start-exam').click()
  await expect(page.getByRole('navigation', { name: '主导航' })).toHaveCount(0)
  await page.getByRole('button', { name: /^[A-D]\s*Le mardi$/ }).click()
  await page.getByRole('button', { name: '跳到第 39 题（未作答）' }).click()
  await page.getByRole('button', { name: /Les objectifs de départ ne pouvaient pas être vérifiés/ }).click()
  await expect(page.getByRole('button', { name: '跳到第 39 题（已作答）' })).toBeVisible()
  await page.getByTestId('tcf-submit-exam').click()
  await expect(page.getByTestId('tcf-result')).toContainText('1 / 39')

  // Review can be narrowed to wrong answers only.
  const reviewGrid = page.getByTestId('tcf-review-grid').getByRole('button')
  await expect(reviewGrid).toHaveCount(39)
  await page.getByTestId('tcf-only-wrong').check()
  await expect(reviewGrid).toHaveCount(38)

  // The overview shows the reading attempt against its NCLC 7 target and leaves untested skills blank.
  await page.goto('/tcf')
  await expect(page.getByTestId('tcf-hub-reading')).toContainText('已考 1 次')
  await expect(page.getByTestId('tcf-hub-reading')).toContainText('距目标还差 435 分')
  await expect(page.getByTestId('tcf-hub-speaking')).toContainText('开始第一次模考')
  await expect(page.getByTestId('tcf-hub-summary')).toContainText('0 / 4')
  await page.getByTestId('tcf-hub-reading').getByRole('link', { name: '再考一次' }).click()
  await expect(page).toHaveURL(/\/tcf-reading$/)

  // Only the question that was actually answered wrong enters the practice pool.
  await expect(page.getByTestId('tcf-set-b')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('错题重练 · 1 题')).toBeVisible()
  await page.getByTestId('tcf-start-practice').click()
  await page.getByRole('button', { name: /^[A-D]\s*Le lundi$/ }).click()
  await expect(page.getByTestId('tcf-explanation')).toBeVisible()
  await page.getByTestId('tcf-leave-practice').click()
  await expect(page.getByTestId('tcf-start-practice')).toHaveCount(0)
})
