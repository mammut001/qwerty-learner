import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('TCF full sitting continues across skills and restores answers/timer on another device', async ({ page, browser, context }) => {
  page.on('dialog', (dialog) => void dialog.accept())
  await page.goto('/tcf/full-mock')
  await expect(page.getByRole('heading', { name: /四科连续模拟/ })).toBeVisible()
  await page.getByTestId('full-mock-start').click()
  await expect(page.getByTestId('full-mock-qcm')).toContainText('第 1 / 39 题')
  await expect(page.getByTestId('full-mock-timer')).toContainText(/34:|35:/)
  await page.getByTestId('full-mock-choice-1').click()
  await expect(page.getByTestId('full-mock-choice-1')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')

  // A different browser context gets only the authenticated cookie, not localStorage.
  const another = await browser.newContext({ serviceWorkers: 'block' })
  try {
    await another.addCookies(await context.cookies())
    const remote = await another.newPage()
    await remote.goto('/tcf/full-mock')
    await expect(remote.getByTestId('full-mock-qcm')).toContainText('第 1 / 39 题')
    await expect(remote.getByTestId('full-mock-choice-1')).toHaveAttribute('aria-pressed', 'true')
    await expect(remote.getByTestId('full-mock-timer')).toContainText(/34:|35:/)
  } finally {
    await another.close()
  }

  await page.getByTestId('full-mock-next-section').click()
  await expect(page.getByRole('heading', { name: 'CE 阅读', exact: true })).toBeVisible()
  await page.getByTestId('full-mock-choice-2').click()
  await page.getByTestId('full-mock-next-section').click()
  await expect(page.getByTestId('full-mock-writing')).toBeVisible()
  await page.getByTestId('full-mock-writing-input').fill('Bonjour, je souhaite apprendre le français à Montréal.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await page.reload()
  await expect(page.getByTestId('full-mock-writing-input')).toHaveValue('Bonjour, je souhaite apprendre le français à Montréal.')
  await page.getByTestId('full-mock-next-section').click()
  await expect(page.getByTestId('full-mock-speaking')).toBeVisible()
  await page.getByTestId('full-mock-speaking-notes').fill('Bonjour. Je souhaite parler de mon expérience.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await page.reload()
  await expect(page.getByTestId('full-mock-speaking-notes')).toHaveValue('Bonjour. Je souhaite parler de mon expérience.')
  await page.getByTestId('full-mock-next-section').click()
  await expect(page.getByTestId('full-mock-complete')).toContainText('四科模考完成')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await expect(page.getByTestId('full-mock-complete')).toContainText('CO 听力')
  await expect(page.getByTestId('full-mock-complete')).toContainText('EO 口语')
  await expect(page.getByTestId('full-mock-pending-rating-writing')).toContainText('请补评')
  await expect(page.getByTestId('full-mock-pending-rating-speaking')).toContainText('请补评')
  await expect(page.getByTestId('full-mock-complete')).toContainText('未评分')
  await page.reload()
  await expect(page.getByTestId('full-mock-complete')).toBeVisible()
})

test('two devices recover a 409 automatically and a reload does not overwrite the server answer', async ({ page, browser, context }) => {
  await page.goto('/tcf/full-mock')
  await page.getByTestId('full-mock-start').click()
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')

  const deviceB = await browser.newContext({ serviceWorkers: 'block' })
  try {
    await deviceB.addCookies(await context.cookies())
    const second = await deviceB.newPage()
    await second.goto('/tcf/full-mock')
    await expect(second.getByTestId('full-mock-qcm')).toBeVisible()
    await second.getByTestId('full-mock-choice-1').click()
    await expect(second.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')

    await page.getByRole('button', { name: '下一题' }).click()
    await page.getByTestId('full-mock-choice-2').click()
    // Device A still holds the original revision and receives 409 on PUT.
    // Recovery must fetch B's Q1, retain A's distinct Q2, then retry on the
    // new revision without requiring a manual refresh.
    await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
    await page.getByRole('button', { name: '上一题' }).click()
    await expect(page.getByTestId('full-mock-choice-1')).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: '下一题' }).click()
    await expect(page.getByTestId('full-mock-choice-2')).toHaveAttribute('aria-pressed', 'true')

    // Read the persisted sitting itself, not just the current browser's UI:
    // Q1 from B and Q2 from A must both be present after the 409 retry.
    const persisted = await page.evaluate(async () => {
      const response = await fetch('/api/study-plan/tcf-full-mock', {
        credentials: 'include', cache: 'no-store',
      })
      if (!response.ok) throw new Error(`Full mock GET failed: ${response.status}`)
      return response.json()
    })
    expect(persisted.session.qcm.listening.answers).toEqual({ 'co-01': 1, 'co-02': 2 })
    expect(persisted.session.qcm.listening.index).toBe(1)

    // B is now stale. Its local updatedAt can be artificially newer, but a
    // reload is not allowed to erase the server's Q2.
    await second.evaluate(() => {
      const key = 'qwerty-tcf-full-mock-v1'
      const session = JSON.parse(localStorage.getItem(key)!)
      session.updatedAt += 9999999
      localStorage.setItem(key, JSON.stringify(session))
    })
    await second.reload()
    // Check the second device's own authenticated GET after reload: the
    // backend still has Q2 as the cursor and both answer choices persisted.
    const reloadedServer = await second.evaluate(async () => {
      const response = await fetch('/api/study-plan/tcf-full-mock', {
        credentials: 'include', cache: 'no-store',
      })
      if (!response.ok) throw new Error(`Full mock GET failed: ${response.status}`)
      return (await response.json()).session.qcm.listening
    })
    expect(reloadedServer.index).toBe(1)
    expect(reloadedServer.answers).toEqual({ 'co-01': 1, 'co-02': 2 })
    // The server also persists the current question index (Q2). Reload
    // restores Q2 directly; pressing "下一题" here would advance to Q3.
    await expect(second.getByTestId('full-mock-qcm')).toContainText('第 2 / 39 题')
    await expect(second.getByTestId('full-mock-choice-2')).toHaveAttribute('aria-pressed', 'true')
    await second.getByRole('button', { name: '上一题' }).click()
    await expect(second.getByTestId('full-mock-qcm')).toContainText('第 1 / 39 题')
    await expect(second.getByTestId('full-mock-choice-1')).toHaveAttribute('aria-pressed', 'true')
    await second.getByRole('button', { name: '下一题' }).click()
    await expect(second.getByTestId('full-mock-qcm')).toContainText('第 2 / 39 题')
    await expect(second.getByTestId('full-mock-choice-2')).toHaveAttribute('aria-pressed', 'true')
    await expect(second.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
    await page.reload()
    await expect(page.getByTestId('full-mock-qcm')).toContainText('第 2 / 39 题')
    await expect(page.getByTestId('full-mock-choice-2')).toHaveAttribute('aria-pressed', 'true')
    // A second independent GET proves B's reload did not overwrite either
    // persisted answer, even when its local clock was artificially advanced.
    const afterReload = await page.evaluate(async () => {
      const response = await fetch('/api/study-plan/tcf-full-mock', {
        credentials: 'include', cache: 'no-store',
      })
      if (!response.ok) throw new Error(`Full mock GET failed: ${response.status}`)
      const payload = await response.json()
      return payload.session.qcm.listening.answers
    })
    expect(afterReload).toEqual({ 'co-01': 1, 'co-02': 2 })
  } finally {
    await deviceB.close()
  }
})

test('manual section submission asks confirmation, expiry does not, and unrated EE/EO are excluded', async ({ page }) => {
  await page.goto('/tcf/full-mock')
  await page.getByTestId('full-mock-start').click()
  const button = page.getByTestId('full-mock-next-section')
  page.once('dialog', (dialog) => void dialog.dismiss())
  await button.click()
  await expect(page.getByRole('heading', { name: 'CO 听力', exact: true })).toBeVisible()

  page.on('dialog', (dialog) => void dialog.accept())
  await button.click()
  await expect(page.getByRole('heading', { name: 'CE 阅读', exact: true })).toBeVisible()
  await button.click()
  await expect(page.getByTestId('full-mock-writing')).toBeVisible()
  await button.click()
  await expect(page.getByTestId('full-mock-speaking')).toBeVisible()
  await button.click()
  await expect(page.getByTestId('full-mock-complete')).toBeVisible()
  await expect(page.getByTestId('full-mock-pending-rating-writing')).toBeVisible()
  await expect(page.getByTestId('full-mock-pending-rating-speaking')).toBeVisible()
  await expect(page.getByTestId('full-mock-complete')).toContainText('未评分')

  // Unrated sections never create score attempts or pollute the NCLC 7 hub.
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await page.goto('/tcf')
  await expect(page.getByTestId('tcf-hub-writing')).toContainText('—')
  await expect(page.getByTestId('tcf-hub-speaking')).toContainText('—')
  await expect(page.getByTestId('tcf-hub-writing')).not.toContainText('最高 0')
  await expect(page.getByTestId('tcf-hub-speaking')).not.toContainText('最高 0')
  await page.goto('/tcf/full-mock')
  await expect(page.getByTestId('full-mock-pending-rating-writing')).toBeVisible()

  // Explicit zero is a legitimate grade; the default zero with untouched
  // score selectors is not one.
  const writing = page.getByTestId('full-mock-pending-rating-writing')
  await expect(writing.getByRole('button', { name: '提交补评' })).toBeDisabled()
  const selects = writing.locator('select')
  for (let i = 0; i < 4; i++) await selects.nth(i).selectOption('0')
  await expect(writing.getByRole('button', { name: '提交补评' })).toBeEnabled()
  await writing.getByRole('button', { name: '提交补评' }).click()
  await expect(page.getByTestId('full-mock-pending-rating-writing')).not.toBeVisible()
  await expect(page.getByTestId('full-mock-pending-rating-speaking')).toBeVisible()
})

test('offline EE task 2 and EO notes survive reload, reconnect and server three-way merge', async ({ page }) => {
  page.on('dialog', (dialog) => void dialog.accept())
  await page.goto('/tcf/full-mock')
  await page.getByTestId('full-mock-start').click()
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await page.getByTestId('full-mock-next-section').click() // CO -> CE
  await expect(page.getByRole('heading', { name: 'CE 阅读', exact: true })).toBeVisible()
  await page.getByTestId('full-mock-next-section').click() // CE -> EE
  await expect(page.getByTestId('full-mock-writing')).toBeVisible()
  await page.getByRole('button', { name: '任务 2', exact: true }).click()
  const writing = page.getByTestId('full-mock-writing-input')
  await writing.fill('Texte deux.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem('qwerty-tcf-full-mock-base-v1')!).writing.texts[1],
  )).toBe('Texte deux.')

  await page.route('**/api/**', (route) => route.abort())
  await writing.fill('Hors ligne texte.')
  await page.reload() // Still offline: local draft must remain available.
  await expect(page.getByTestId('full-mock-writing-input')).toHaveValue('Hors ligne texte.')
  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem('qwerty-tcf-full-mock-base-v1')!).writing.texts[1],
  )).toBe('Texte deux.') // Offline edit MUST NOT advance the acknowledged base.

  await page.unroute('**/api/**')
  await page.reload() // Server still holds Texte deux., local changed since base.
  await expect(page.getByTestId('full-mock-writing-input')).toHaveValue('Hors ligne texte.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  expect(await page.evaluate(async () => {
    const response = await fetch('/api/study-plan/tcf-full-mock', { credentials: 'include', cache: 'no-store' })
    if (!response.ok) throw new Error(`Full mock GET failed: ${response.status}`)
    return (await response.json()).session.writing.texts[1]
  })).toBe('Hors ligne texte.')
  await page.reload()
  await expect(page.getByTestId('full-mock-writing-input')).toHaveValue('Hors ligne texte.')

  await page.getByTestId('full-mock-next-section').click() // EE -> EO
  await expect(page.getByTestId('full-mock-speaking')).toBeVisible()
  const notes = page.getByTestId('full-mock-speaking-notes')
  await notes.fill('Notes initiales.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await page.route('**/api/**', (route) => route.abort())
  await notes.fill('Notes hors ligne.')
  await page.reload()
  await expect(page.getByTestId('full-mock-speaking-notes')).toHaveValue('Notes hors ligne.')
  await page.unroute('**/api/**')
  await page.reload()
  await expect(page.getByTestId('full-mock-speaking-notes')).toHaveValue('Notes hors ligne.')
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  expect(await page.evaluate(async () => {
    const response = await fetch('/api/study-plan/tcf-full-mock', { credentials: 'include', cache: 'no-store' })
    if (!response.ok) throw new Error(`Full mock GET failed: ${response.status}`)
    return (await response.json()).session.speaking.notes[0]
  })).toBe('Notes hors ligne.')
})

test('fast client clock receives full CO time and does not prematurely submit', async ({ page }) => {
  // Only the browser clock is advanced; Node/D1 keeps the actual time.
  // Emulate a fast device wall clock without depending on newer Playwright
  // clock APIs (this repository supports @playwright/test ^1.40).
  await page.addInitScript(() => {
    const nativeNow = Date.now.bind(Date)
    Date.now = () => nativeNow() + 10 * 60_000
  })
  await page.goto('/tcf/full-mock')
  await page.getByTestId('full-mock-start').click()
  await expect(page.getByTestId('full-mock-save-status')).toHaveText('已自动保存到云端')
  await expect(page.getByTestId('full-mock-timer')).toContainText(/34:|35:/)
  await expect(page.getByRole('heading', { name: 'CO 听力', exact: true })).toBeVisible()
  const offset = await page.evaluate(() => Number(localStorage.getItem('qwerty-tcf-full-mock-clock-v1')))
  expect(offset).toBeGreaterThan(-620_000)
  expect(offset).toBeLessThan(-580_000)
  await page.reload()
  await expect(page.getByTestId('full-mock-timer')).toContainText(/34:|35:/)
  await expect(page.getByRole('heading', { name: 'CO 听力', exact: true })).toBeVisible()
})
