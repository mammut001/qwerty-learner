import { expect, test } from '@playwright/test'

test('Tenses and conjugation topic section flows smoothly', async ({ page }) => {
  // 1. Navigate to /tenses overview
  await page.goto('/tenses')
  await expect(page.getByRole('heading', { name: '法语时态与变位专题' })).toBeVisible()
  await expect(page.getByText('法语时态时间轴全景 (Ligne du temps interactive)')).toBeVisible()

  // Verify lesson cards exist (exact matching avoids ambiguity with other tenses)
  await expect(
    page.getByRole('heading', { name: 'Présent de l’indicatif', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Passé composé', exact: true })).toBeVisible()

  // 2. Open all-tenses cheat-sheet view
  await page.getByRole('button', { name: '全部时态一览' }).click()
  await expect(
    page.getByRole('heading', { name: '全部时态一览 (Tableau récapitulatif des temps)' }),
  ).toBeVisible()
  // Check that multiple tenses render in cheat sheet
  await expect(page.getByText('Présent', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Conditionnel présent', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Subjonctif présent', { exact: true }).first()).toBeVisible()

  // Switch verb in cheat sheet
  await page.getByRole('button', { name: 'faire', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'faire' })).toBeVisible()
  await expect(page.getByText('je fais')).toBeVisible()

  // 3. Navigate into a single tense lesson (/tenses/present)
  await page.goto('/tenses/present')
  await expect(
    page.getByRole('heading', { name: 'Présent de l’indicatif', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('直陈式现在时')).toBeVisible()
  await expect(page.getByText('一句话定位与核心思维')).toBeVisible()

  // Verify table explorer exists and can switch verbs
  await expect(page.getByText('变位速查表 (直陈式现在时)')).toBeVisible()
  await expect(page.getByText('je parle')).toBeVisible()

  // Switch verb in table explorer
  await page.getByRole('button', { name: 'aller', exact: true }).click()
  await expect(page.getByText('je vais')).toBeVisible()

  // Typing an unsupported verb in explorer shows unsupported error message
  const verbInput = page.locator('input[placeholder="输入或搜索动词..."]')
  await verbInput.fill('xyz')
  await page.getByRole('button', { name: '变位' }).click()
  await expect(page.getByText('暂不支持这个动词')).toBeVisible()

  // Switch back to a valid verb
  await page.getByRole('button', { name: 'parler', exact: true }).click()
  await expect(page.getByText('je parle')).toBeVisible()

  // Verify example sentences with audio button and lookup wrapper
  const speakButtons = page.getByRole('button', { name: '朗读例句' })
  await expect(speakButtons.first()).toBeVisible()

  // Verify interactive practice section and answer a question deterministically
  await expect(page.getByText('互动课后练习')).toBeVisible()
  await page.locator('[data-testid="choice-option-0"]').click()
  await expect(page.locator('[data-testid="question-feedback"]')).toBeVisible()

  // Verify localStorage contains updated progress
  const progressRaw = await page.evaluate(() =>
    localStorage.getItem('qwerty-fr-tenses-progress-v1'),
  )
  expect(progressRaw).toBeTruthy()
  expect(progressRaw).toContain('present')

  // 4. Navigate into a cross-cutting lesson (/tenses/passeCompose-vs-imparfait)
  await page.goto('/tenses/passeCompose-vs-imparfait')
  await expect(
    page.getByRole('heading', { name: 'Passé composé vs Imparfait', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('复合过去时 vs 未完成过去时')).toBeVisible()
})
