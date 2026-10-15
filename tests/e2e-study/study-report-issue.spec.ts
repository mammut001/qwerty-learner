import { expect, test } from '@playwright/test'

test.describe('Practice item issue reporting (« 报告问题 »)', () => {
  test('learner opens a reading item, rolls variant, reports an issue with category and note, and sees confirmation', async ({
    page,
    context,
  }) => {
    // Silence synthetic speech in CI if invoked
    await context.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { cancel() {}, speak() {} },
      })
    })

    // 1. Open a reading item on Niveau 1
    await page.goto('/levels/1?item=n1-reading-0')
    const card = page.getByTestId('level-item-n1-reading-0')
    await expect(card).toBeVisible()

    // Wait for item content and "换一题" button to be ready
    const rerollBtn = card.getByRole('button', { name: '换一题' })
    await expect(rerollBtn).toBeVisible()

    // 2. Click "换一题" once
    await rerollBtn.click()

    // 3. Click "报告问题" button to open inline reporting form
    const reportBtn = card.getByTestId('report-issue-btn')
    await expect(reportBtn).toBeVisible()
    await reportBtn.click()

    const reportForm = card.getByTestId('report-issue-form')
    await expect(reportForm).toBeVisible()

    // 4. Select category and enter note
    const unclearRadio = reportForm.getByRole('radio', { name: '题意不清' })
    await expect(unclearRadio).toBeVisible()
    await unclearRadio.check()

    const noteInput = reportForm.getByTestId('report-note-input')
    await expect(noteInput).toBeVisible()
    const testNote = '第2个选项表述有歧义，请核实题干与选项对应关系。'
    await noteInput.fill(testNote)

    // 5. Intercept the POST request and response to /api/study-plan/reports
    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/study-plan/reports') && req.method() === 'POST',
    )
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/study-plan/reports') && res.request().method() === 'POST',
    )

    // Click submit
    const submitBtn = reportForm.getByTestId('report-submit-btn')
    await submitBtn.click()

    const request = await requestPromise
    const response = await responsePromise

    // Assert request payload
    const payload = JSON.parse(request.postData() || '{}')
    expect(payload.itemId).toBe('n1-reading-0')
    expect(typeof payload.variant).toBe('number')
    expect(payload.variant).toBeGreaterThanOrEqual(0)
    expect(payload.category).toBe('unclear')
    expect(payload.note).toBe(testNote)

    // Assert server response
    expect(response.status()).toBe(200)
    const resData = (await response.json()) as { ok: boolean; id?: string }
    expect(resData.ok).toBe(true)
    expect(typeof resData.id).toBe('string')

    // 6. See confirmation and verify re-submit is disabled in this session
    const confirmation = card.getByTestId('report-submitted-confirmation')
    await expect(confirmation).toBeVisible()
    await expect(confirmation).toContainText('已收到，谢谢')

    // Inline form should be closed
    await expect(card.getByTestId('report-issue-form')).toHaveCount(0)

    // Re-submit button should no longer be displayed (replaced by confirmation)
    await expect(card.getByTestId('report-issue-btn')).toHaveCount(0)
  })

  test('reporting is also available after submitting answers', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { cancel() {}, speak() {} },
      })
    })

    await page.goto('/levels/1?item=n1-reading-0')
    const card = page.getByTestId('level-item-n1-reading-0')
    await expect(card).toBeVisible()

    // This item loads its question variant asynchronously. A count() call
    // before the quiz renders can return zero, leaving Submit disabled forever.
    const submitAnswerBtn = card.getByRole('button', { name: '提交答案' })
    await expect(submitAnswerBtn).toBeVisible()
    const questions = card.locator('fieldset')
    await expect(questions.first()).toBeVisible()
    const questionCount = await questions.count()
    expect(questionCount).toBeGreaterThan(0)
    for (let i = 0; i < questionCount; i++) {
      const firstChoice = questions.nth(i).getByRole('button').first()
      await firstChoice.click()
      await expect(firstChoice).toHaveAttribute('aria-pressed', 'true')
    }

    // Prove all questions are answered before submitting; never click a
    // disabled control and let Playwright silently wait for its test timeout.
    await expect(submitAnswerBtn).toBeEnabled()
    await submitAnswerBtn.click()

    // Now answered: result and retry buttons are shown, and report button is also visible
    const reportBtn = card.getByTestId('report-issue-btn')
    await expect(reportBtn).toBeVisible()
    await reportBtn.click()

    const reportForm = card.getByTestId('report-issue-form')
    await expect(reportForm).toBeVisible()

    // Cancel closes form
    const cancelBtn = reportForm.getByTestId('report-cancel-btn')
    await cancelBtn.click()
    await expect(card.getByTestId('report-issue-form')).toHaveCount(0)
    await expect(card.getByTestId('report-issue-btn')).toBeVisible()
  })

  test('guest mode hides the report button', async ({ page }) => {
    await page.goto('/levels/1?item=n1-reading-0')
    const card = page.getByTestId('level-item-n1-reading-0')
    await expect(card).toBeVisible()
    await expect(card.getByTestId('report-issue-btn')).toBeVisible()

    // Dynamically toggle guest mode
    await page.evaluate(() => {
      ;(window as unknown as { __setGuestMode?: (enabled: boolean) => void }).__setGuestMode?.(true)
    })

    // Report button should now be hidden
    await expect(card.getByTestId('report-issue-btn')).toHaveCount(0)
  })
})
