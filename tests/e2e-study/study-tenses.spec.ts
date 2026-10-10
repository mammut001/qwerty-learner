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
  await expect(page.getByTestId('cheatsheet-tense-present')).toBeVisible()
  await expect(page.getByTestId('cheatsheet-tense-conditionnelPresent')).toBeVisible()
  await expect(page.getByTestId('cheatsheet-tense-subjonctifPresent')).toBeVisible()
  await expect(page.getByTestId('cheatsheet-cell-present-1s')).toBeVisible()

  // Switch verb in cheat sheet
  await page.getByRole('button', { name: 'faire', exact: true }).click()
  await expect(page.getByTestId('cheatsheet-infinitive-title')).toHaveText('faire')
  await expect(page.getByTestId('cheatsheet-cell-present-1s')).toContainText('je fais')

  // 3. Navigate into a single tense lesson (/tenses/present)
  await page.goto('/tenses/present')
  await expect(
    page.getByRole('heading', { name: 'Présent de l’indicatif', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('直陈式现在时')).toBeVisible()
  await expect(page.getByText('一句话定位与核心思维')).toBeVisible()

  // Verify table explorer exists and can switch verbs
  await expect(page.getByText('变位速查表 (直陈式现在时)')).toBeVisible()
  await expect(page.getByTestId('explorer-cell-1s')).toContainText('je parle')

  // Switch verb in table explorer
  await page.getByRole('button', { name: 'aller', exact: true }).click()
  await expect(page.getByTestId('explorer-cell-1s')).toContainText('je vais')

  // Typing an unsupported verb in explorer shows unsupported error message
  const verbInput = page.getByTestId('explorer-verb-input')
  await verbInput.fill('xyz')
  await page.getByTestId('explorer-submit-btn').click()
  await expect(page.getByTestId('unsupported-verb-error')).toBeVisible()

  // Switch back to a valid verb
  await page.getByRole('button', { name: 'parler', exact: true }).click()
  await expect(page.getByTestId('explorer-cell-1s')).toContainText('je parle')

  // Verify example sentences with audio button and lookup wrapper
  await expect(page.getByTestId('example-speak-0')).toBeVisible()

  // Verify interactive practice section and answer a question deterministically
  await expect(page.getByText('互动课后练习')).toBeVisible()
  await page.getByTestId('choice-option-0').click()
  await expect(page.getByTestId('question-feedback')).toBeVisible()

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
