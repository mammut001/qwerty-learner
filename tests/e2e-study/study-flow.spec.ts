import { expect, test } from '@playwright/test'

const pendingMutationCount = async (page) =>
  page.evaluate(
    () =>
      Object.keys(localStorage).filter((key) => key.startsWith('qwerty-fr-study-plan-pending:')).length,
  )

test('practice, offline persistence, sync, analytics, reminders and PWA shell', async ({ browser, page, context }) => {
  // Install a discoverable virtual authenticator before the app is loaded so feature detection
  // and navigator.credentials.create/get see the same WebAuthn environment from first render.
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const authenticator = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })

  await context.addInitScript(() => {
    class MockSpeechSynthesisUtterance {
      text: string
      lang = ''
      rate = 1
      pitch = 1
      constructor(text: string) { this.text = text }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel() {}, speak() {} },
    })
  })

  await page.goto('/study-plan')
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  await expect(page.getByTestId('smart-today-plan')).toBeVisible()
  await expect(page.getByText('智能今日任务')).toBeVisible()
  await expect.poll(() => page.evaluate(() => location.hostname)).toBe('localhost')
  await expect.poll(() => page.evaluate(() => typeof PublicKeyCredential !== 'undefined')).toBe(true)

  // Plan settings re-date the 26-week roadmap without erasing already recorded minutes.
  const firstMinutes = page.getByLabel(/实际学习分钟数/).first()
  await firstMinutes.fill('15')
  await page.getByLabel('考试日期').fill('2027-03-31')
  const dailyTarget = page.getByLabel('每天目标分钟')
  await dailyTarget.fill('45')
  await dailyTarget.blur()
  await expect(page.getByTestId('study-plan-settings')).toContainText('2026-10-01 → 2027-03-31')
  await expect(firstMinutes).toHaveValue('15')

  // Optional focus timer survives route changes and writes only real active minutes through the existing queue.
  await page.getByLabel('专注计时分钟').fill('5')
  await page.getByRole('button', { name: '开始专注' }).click()
  await expect(page.getByTestId('focus-timer-dock')).toBeVisible()
  await page.getByRole('button', { name: '暂停' }).click()
  await expect(page.getByTestId('focus-timer-dock')).toContainText('已暂停')
  await page.getByRole('button', { name: '继续' }).click()
  await page.evaluate(() => {
    const key = 'qwerty-fr-focus-timer-v1'
    const timer = JSON.parse(localStorage.getItem(key) || 'null')
    if (!timer) throw new Error('focus timer missing')
    timer.activeMs = 60_000
    timer.remainingMs = Math.max(1, timer.remainingMs - 60_000)
    timer.lastTickAt = Date.now()
    timer.lastActivityAt = Date.now()
    localStorage.setItem(key, JSON.stringify(timer))
  })
  await page.getByRole('button', { name: '结束并记录' }).click()
  await expect(page.getByTestId('focus-timer-dock')).toContainText('已记录 1 min')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)

  // Passkey is optional: bind the current anonymous learner, then clear browser storage/cookies
  // and prove discoverable-credential login restores the same server-side state without a sync code.
  const registerResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/study-plan/passkey/register/verify') &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: '创建 Passkey' }).click()
  const registerResponse = await registerResponsePromise
  expect(registerResponse.status()).toBe(200)
  await expect(page.getByTestId('passkey-account')).toContainText('1 个 Passkey')
  const recordedBeforePasskeyLogin = await page.getByLabel(/实际学习分钟数/).first().inputValue()
  await context.clearCookies()
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/study-plan/passkey/login/verify') &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: '使用 Passkey 登录' }).click()
  const loginResponse = await loginResponsePromise
  expect(loginResponse.status()).toBe(200)
  await expect(page.getByTestId('passkey-account')).toContainText('已登录')
  await expect(page.getByLabel(/实际学习分钟数/).first()).toHaveValue(recordedBeforePasskeyLogin)

  // Browser reminder is opt-in and local to this browser.
  await page.getByRole('button', { name: '开启提醒' }).click()
  await expect(page.getByRole('button', { name: '提醒已开启' })).toBeVisible()
  await page.getByLabel('学习提醒时间').fill('23:59')

  // The PWA service worker takes control and warms the current app shell.
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 15_000 })
  const manifest = await page.evaluate(async () => {
    const response = await fetch(new URL('manifest.json', document.baseURI))
    return response.json()
  })
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('./study-plan')

  // Start a real conjugation practice from the smart plan so task time and answer stats share one backend state.
  await page.getByRole('link', { name: '开始动词变位' }).click()
  await expect(page).toHaveURL(/studyTask=smart-conjugation/)
  const answer = page.getByPlaceholder('例如：nous avons pris')
  await answer.fill('definitely-wrong')
  await page.getByRole('button', { name: '检查（Enter）' }).click()
  await expect(page.getByText('✗ 再看一下这个形式')).toBeVisible()

  // The wrong answer appears in the unified backend error book and can be retrained in one click.
  await page.goto('/error-book')
  await expect(page.getByText('服务端统一错题本')).toBeVisible()
  await expect(page.getByTestId('error-book-item').filter({ hasText: 'prendre' })).toBeVisible()
  await page.getByTestId('error-book-item').filter({ hasText: 'prendre' }).getByRole('button', { name: '一键重练' }).click()
  await expect(page).toHaveURL(/\/conjugation\?verb=prendre/)

  await page.goto('/study-plan')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await expect(
    page.getByTestId('smart-today-plan').locator('article').filter({ hasText: '动词变位' }),
  ).toContainText(/1 \/ /)

  // Go offline, edit progress, then prove the installed shell itself still reloads.
  await context.setOffline(true)
  const offlineMinutes = page.getByLabel(/实际学习分钟数/).first()
  await offlineMinutes.fill('23')
  await expect.poll(() => pendingMutationCount(page)).toBeGreaterThan(0)
  await page.reload()
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  await expect(page.getByText(/当前离线|待同步|服务端暂不可用/).first()).toBeVisible()

  // Reconnect automatically drains the durable queue.
  await context.setOffline(false)
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect.poll(() => pendingMutationCount(page), { timeout: 20_000 }).toBe(0)
  await expect(page.locator('span').filter({ hasText: /^已与服务端合并并保存$/ })).toBeVisible()

  // Complete one CO and one CE mock attempt. CO audio must lock after a single play.
  await page.goto('/tcf-listening')
  await expect(page.getByText('TCF Canada 听力 CO')).toBeVisible()
  await expect(page.getByText('39 题完整模拟')).toBeVisible()
  await page.getByTestId('tcf-start-exam').click()
  await expect(page.getByTestId('tcf-timer')).toContainText(/34:|35:/)
  const playOnce = page.getByTestId('tcf-audio-play')
  await playOnce.click()
  await expect(playOnce).toBeDisabled()
  await page.getByRole('button', { name: /Acheter des billets de cinéma/ }).click()
  await page.getByTestId('tcf-submit-exam').click()
  await expect(page.getByTestId('tcf-result')).toBeVisible()
  await expect(page.getByTestId('tcf-explanation')).toBeVisible()
  await expect.poll(() => pendingMutationCount(page)).toBe(0)

  await page.goto('/tcf-reading')
  await expect(page.getByText('TCF Canada 阅读 CE')).toBeVisible()
  await page.getByTestId('tcf-start-exam').click()
  await expect(page.getByTestId('tcf-timer')).toContainText(/59:|60:/)
  await page.getByRole('button', { name: /Utiliser le bassin pour enfants/ }).click()
  await page.getByTestId('tcf-submit-exam').click()
  await expect(page.getByTestId('tcf-result')).toBeVisible()
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await page.goto('/study-plan')
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()

  // Generate a portable sync code only after every offline mutation has reached the server.
  const generate = page.getByRole('button', { name: /生成同步码|轮换同步码/ })
  await generate.click()
  const syncCode = await page.getByLabel('当前学习进度同步码').inputValue()
  expect(syncCode).toMatch(/^[a-f0-9]{64}$/)

  // A fresh browser binds to the same learner and reads the same server-side analytics.
  const second = await browser.newContext()
  const secondPage = await second.newPage()
  await secondPage.goto('/study-plan')
  await secondPage.getByLabel('连接已有学习进度的同步码').fill(syncCode)
  await secondPage.getByRole('button', { name: '绑定' }).click()
  await expect(secondPage.getByText('此设备已通过同步码绑定')).toBeVisible()

  await secondPage.goto('/analysis')
  await expect(secondPage.getByText('学习趋势与错误画像')).toBeVisible()
  await expect(secondPage.getByText('错误最多的动词')).toBeVisible()
  await expect(secondPage.getByText('prendre', { exact: true }).first()).toBeVisible()
  await expect(secondPage.getByText('动词变位正确率').first()).toBeVisible()
  await expect(secondPage.getByText('打卡与成就')).toBeVisible()
  await expect(secondPage.getByText('学习周报')).toBeVisible()
  await expect(secondPage.getByText('每周总结与下周建议')).toBeVisible()
  const currentReportBody = secondPage.locator(
    '[data-print-weekly-reports] details[open] [data-testid^="weekly-report-body-"]',
  )
  await expect(currentReportBody).toBeVisible()
  await expect(currentReportBody).toContainText('专注 1 min')
  await expect(secondPage.getByTestId('learning-dashboard')).toBeVisible()
  await expect(secondPage.getByText('每日学习分钟热力图')).toBeVisible()
  await expect(secondPage.getByRole('progressbar', { name: '词汇掌握度' })).toBeVisible()
  await expect(secondPage.getByRole('progressbar', { name: '语法掌握度' })).toBeVisible()
  await expect(secondPage.getByRole('progressbar', { name: '变位掌握度' })).toBeVisible()
  await expect(secondPage.getByTestId('tcf-score-trends')).toBeVisible()
  await expect(secondPage.getByText('CO 目标 458')).toBeVisible()
  await expect(secondPage.getByText('CE 目标 453')).toBeVisible()
  const syncedTcf = await secondPage.evaluate(async () => {
    const [listening, reading] = await Promise.all([
      fetch('/api/study-plan/tcf-attempts?skill=listening', { credentials: 'include' }).then((response) => response.json()),
      fetch('/api/study-plan/tcf-attempts?skill=reading', { credentials: 'include' }).then((response) => response.json()),
    ])
    return { listening: listening.items?.length ?? 0, reading: reading.items?.length ?? 0 }
  })
  expect(syncedTcf).toEqual({ listening: 1, reading: 1 })

  // Analytics endpoint failure falls back to the last cached backend dashboard instead of crashing the page.
  await secondPage.route('**/api/study-plan/analytics**', (route) => route.abort())
  await secondPage.reload()
  await expect(secondPage.getByTestId('learning-dashboard')).toBeVisible()
  await expect(secondPage.getByText('每日学习分钟热力图')).toBeVisible()
  await secondPage.unroute('**/api/study-plan/analytics**')

  for (const [button, pattern] of [
    ['周报 CSV', /^qwerty-study-weekly-reports-.*\.csv$/],
    ['学习记录 CSV', /^qwerty-study-records-.*\.csv$/],
    ['错题本 CSV', /^qwerty-study-error-book-.*\.csv$/],
  ] as const) {
    const downloadPromise = secondPage.waitForEvent('download')
    await secondPage.getByRole('button', { name: button }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(pattern)
  }
  await expect(secondPage.getByRole('button', { name: '打印周报' })).toBeVisible()

  await second.close()

  // Study plan, analytics and error book remain usable on a narrow mobile viewport.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobile.newPage()
  await mobilePage.goto('/study-plan')
  await expect(mobilePage.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  await mobilePage.getByLabel('连接已有学习进度的同步码').fill(syncCode)
  await mobilePage.getByRole('button', { name: '绑定' }).click()
  await expect(mobilePage.getByTestId('smart-today-plan')).toBeVisible()

  await mobilePage.goto('/analysis')
  await expect(mobilePage).toHaveURL(/\/analysis$/)
  await expect(mobilePage.getByTestId('learning-dashboard')).toBeVisible()
  const closeAnalysis = mobilePage.getByRole('button', { name: '关闭统计页' })
  await closeAnalysis.focus()
  await expect(closeAnalysis).toBeFocused()

  await mobilePage.goto('/error-book')
  await expect(mobilePage.getByText('服务端统一错题本')).toBeVisible()
  const closeErrorBook = mobilePage.getByRole('button', { name: '关闭错题本' })
  await closeErrorBook.focus()
  await expect(closeErrorBook).toBeFocused()
  await mobile.close()
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId: authenticator.authenticatorId })
})
