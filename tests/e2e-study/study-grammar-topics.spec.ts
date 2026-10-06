import { expect, test } from '@playwright/test'

const pendingMutationCount = async (page) =>
  page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('qwerty-fr-study-plan-pending:')).length)

test('a non-default grammar topic can be completed, synced and surfaces in the error book', async ({ page }) => {
  await page.goto('/grammar-session')
  await expect(page.getByTestId('grammar-topic-passe-compose-imparfait')).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('grammar-topic-subjonctif-indicatif').click()
  await expect(page.getByRole('heading', { name: 'Subjonctif vs indicatif' })).toBeVisible()
  await page.getByRole('button', { name: '开始 30 分钟' }).click()

  // Always answer A: the topic mixes A and B answers, so this yields both right and wrong items.
  for (const batchSize of [4, 4, 2]) {
    const options = page.getByRole('button', { name: /^A\./ })
    await expect(options).toHaveCount(batchSize)
    for (let index = 0; index < batchSize; index += 1) await options.nth(index).click()
    for (const reason of await page.getByPlaceholder(/il faut que/).all()) await reason.fill('测试理由')
    await page.getByRole('button', { name: '提交本组并看解释' }).click()
    if (batchSize === 4) await page.getByRole('button', { name: '继续下一组' }).click()
  }

  // A reload mid-session restores the same topic from the synced draft.
  await page.waitForTimeout(600)
  await page.reload()
  await expect(page.getByText('Subjonctif vs indicatif · 第 3 / 3 组')).toBeVisible()

  for (const output of await page.getByPlaceholder('自己写完整法语句子').all()) await output.fill('Il faut que j’aille à la banque.')
  await page.getByRole('button', { name: '完成本次训练' }).click()
  await expect(page.getByRole('heading', { name: '5 / 10' })).toBeVisible()
  await expect.poll(() => pendingMutationCount(page), { timeout: 20_000 }).toBe(0)

  // The server accepted the new question ids and lists the wrong ones.
  await page.goto('/error-book')
  await expect(page.getByText('espérer que → indicatif（常用 futur）').first()).toBeVisible()

  // The intro remembers the last result for that topic.
  await page.goto('/grammar-session')
  await expect(page.getByTestId('grammar-topic-subjonctif-indicatif')).toContainText('上次 5 / 10')
})
