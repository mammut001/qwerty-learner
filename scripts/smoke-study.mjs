import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createPasskeyFixture } from '../server/study-passkey-test-helper.mjs'

export async function smokeStudy(base, { saveSession, resumeSession, frontendOrigin } = {}) {
  const url = new URL(base)
  assert.ok(url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname), 'Public smoke requires HTTPS')
  const origin = url.origin
  let cookie = '', expected, syncKey
  const call = async (method, body, options = {}) => {
    const res = await fetch(`${origin}/api/study-plan${options.path ?? ''}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { Cookie: options.cookie ?? cookie, Origin: options.origin ?? frontendOrigin ?? origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    return { res, data }
  }
  const health = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(20000) })
  assert.equal(health.status, 200, 'D1 health check')
  assert.equal((await health.clone().json()).schemaVersion, 10, 'schema migration version is current')
  const alias = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(20000) })
  assert.equal(alias.status, 200, '/health is API readiness, not SPA HTML')
  assert.equal((await alias.json()).ok, true)
  assert.equal(alias.headers.get('cache-control'), 'no-store')
  assert.equal(alias.headers.get('set-cookie'), null)
  const page = await fetch(`${origin}/study-plan`, { signal: AbortSignal.timeout(20000) })
  assert.equal(page.status, 200, 'SPA deep link')
  assert.match(page.headers.get('content-type'), /text\/html/)
  if (resumeSession) {
    const saved = JSON.parse(await readFile(resumeSession, 'utf8'))
    assert.equal(saved.origin, origin)
    cookie = saved.cookie
    assert.deepEqual((await call('GET')).data.state, saved.expected, 'Data survives worker restart/redeploy')
    const linked = await call('POST', { key: saved.syncKey }, { cookie: '', path: '/link' })
    assert.equal(linked.res.status, 200, 'Portable sync key survives worker restart/redeploy')
    const linkedCookie = linked.res.headers.get('set-cookie').split(';')[0]
    assert.deepEqual((await call('GET', undefined, { cookie: linkedCookie })).data.state, saved.expected)
    console.log('PASS: saved progress and cross-device sync key survived restart/redeploy')
    return
  }
  let response = await call('GET')
  assert.equal(response.res.status, 200)
  const setCookie = response.res.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly; SameSite=(Strict|None)/)
  if (url.protocol === 'https:') assert.match(setCookie, /; Secure/)
  cookie = setCookie.split(';')[0]
  assert.equal(response.data.state, null)
  const makeupDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const state = {
    startDate: '2026-10-01',
    minutes: {
      '2026-10-03': { 'sat-listening': 5, 'manual-total': 600 },
    },
    minimumMode: {},
  }
  state.minutes[makeupDay] = { ...(state.minutes[makeupDay] ?? {}), 'manual-study': 10 }
  const initialized = await call('POST', { state })
  assert.equal(initialized.res.status, 200)
  assert.equal(initialized.data.state.startDate, state.startDate)
  assert.deepEqual(initialized.data.state.minutes, state.minutes)
  assert.deepEqual(initialized.data.state.minimumMode, state.minimumMode)
  assert.deepEqual(initialized.data.state.learning.vocabulary.records, [])
  assert.deepEqual(initialized.data.state.settings, {
    examDate: '2027-03-31',
    dailyTargetMinutes: null,
    studyDays: [1, 2, 3, 4, 5, 6, 0],
  })
  assert.deepEqual((await call('POST', { state: { ...state, startDate: '2020-01-01' } })).data.state, initialized.data.state, 'Migration is create-only')
  const mutation = { id: randomUUID(), operations: [
    { kind: 'startDate', value: '2026-09-28' },
    { kind: 'increment', day: '2026-10-03', task: 'sat-listening', value: 10 },
    { kind: 'mode', day: '2026-10-03', value: true },
  ] }
  response = await call('PATCH', mutation)
  assert.equal(response.res.status, 200)
  assert.equal((await call('PATCH', mutation)).data.state.minutes['2026-10-03']['sat-listening'], 15, 'Duplicate delivery not double counted')
  assert.equal((await call('PATCH', { ...mutation, operations: [] })).res.status, 400, 'ID cannot be reused with different data')
  const increments = Array.from({ length: 4 }, () => ({ id: randomUUID(), operations: [{ kind: 'increment', day: '2026-10-03', task: 'sat-retell', value: 2 }] }))
  const results = await Promise.all(increments.map((m) => call('PATCH', m)))
  results.forEach((r) => assert.equal(r.res.status, 200))

  const learningMutation = {
    id: randomUUID(),
    operations: [
      {
        kind: 'vocabularyRecords',
        value: [{
          id: randomUUID(),
          word: 'prendre',
          dict: 'tcf-canada-foundation-01',
          chapter: 0,
          timeStamp: 1791014400,
          day: '2026-10-03',
          durationMs: 1200,
          wrongCount: 1,
          wrongKeys: ['x'],
        }],
      },
      {
        kind: 'grammarSession',
        value: {
          id: randomUUID(),
          topic: 'passé composé vs imparfait',
          score: 8,
          total: 10,
          elapsedSeconds: 1200,
          finishedAt: 1791061200000,
          day: '2026-10-03',
          answers: { 1: 'A' },
          reasons: { 1: '背景描述' },
          outputAnswers: ['Je regardais la télé.'],
          items: [
            { id: '1', label: '背景 + 突发事件', correct: true },
            { id: '2', label: '过去习惯', correct: false },
          ],
        },
      },
      {
        kind: 'conjugationAttempt',
        value: {
          id: randomUUID(),
          verb: 'prendre',
          tense: 'passeCompose',
          correct: false,
          day: '2026-10-03',
          occurredAt: 1791061300000,
        },
      },
      {
        kind: 'tcfAttempt',
        value: {
          id: randomUUID(),
          skill: 'listening',
          questionCount: 39,
          answers: Array.from({ length: 39 }, (_, index) => ({
            questionId: `co-${String(index + 1).padStart(2, '0')}`,
            choice: index < 26 ? 1 : null,
            correct: index < 26,
          })),
          correctCount: 26,
          scaledScore: 466,
          nclc: 7,
          durationSeconds: 1200,
          startedAt: 1791060000000,
          finishedAt: 1791061200000,
          day: '2026-10-03',
        },
      },
    ],
  }
  assert.equal((await call('PATCH', learningMutation)).res.status, 200)
  assert.equal((await call('PATCH', learningMutation)).res.status, 200, 'Learning replay is idempotent')

  const errorBook = await call('GET', undefined, { path: '/error-book?status=active' })
  assert.equal(errorBook.res.status, 200)
  assert.equal(errorBook.data.items.length, 3)
  assert.ok(errorBook.data.items.some((item) => item.kind === 'vocabulary' && item.label === 'prendre'))
  assert.ok(errorBook.data.items.some((item) => item.kind === 'grammar'))
  assert.ok(errorBook.data.items.some((item) => item.kind === 'conjugation'))

  const makeup = await call('POST', { day: makeupDay }, { path: '/checkins/makeup' })
  assert.equal(makeup.res.status, 200)
  assert.equal(makeup.data.items.find((item) => item.day === makeupDay).status, 'makeup')

  const achievements = await call('GET', undefined, { path: '/achievements' })
  assert.equal(achievements.res.status, 200)
  assert.ok(achievements.data.items.some((item) => item.id === 'minutes-600'))

  const reports = await call('GET', undefined, { path: '/weekly-reports' })
  assert.equal(reports.res.status, 200)
  assert.ok(reports.data.items.length >= 1)
  assert.ok(Array.isArray(reports.data.items[0].suggestions))
  const reportsExport = await call('GET', undefined, { path: '/weekly-reports/export' })
  assert.equal(reportsExport.res.status, 200)
  assert.equal(reportsExport.data.format, 'qwerty-study-weekly-reports')

  const invalidErrorBook = await call('GET', undefined, { path: '/error-book?type=bad' })
  assert.equal(invalidErrorBook.res.status, 400)
  assert.equal(invalidErrorBook.data.code, 'INVALID_ERROR_BOOK_FILTER')

  const settingsMutation = {
    id: randomUUID(),
    operations: [{
      kind: 'settings',
      value: { examDate: '2027-03-28', dailyTargetMinutes: 45, studyDays: [1, 3, 5] },
      updatedAt: Date.now(),
    }],
  }
  assert.equal((await call('PATCH', settingsMutation)).res.status, 200)

  expected = (await call('GET')).data.state
  assert.equal(expected.minutes['2026-10-03']['sat-retell'], 8, 'Concurrent updates preserved')
  assert.equal(expected.minutes['2026-10-03']['sat-listening'], 15, 'Completion target preserved')
  assert.equal(expected.minimumMode['2026-10-03'], true)
  assert.equal(expected.startDate, '2026-09-28')
  assert.deepEqual(expected.settings, {
    examDate: '2027-03-28',
    dailyTargetMinutes: 45,
    studyDays: [1, 3, 5],
  })
  assert.equal(expected.learning.vocabulary.records.length, 1)
  assert.equal(expected.learning.grammar.history.length, 1)
  assert.equal(expected.learning.conjugation.prendre.passeCompose.total, 1)

  const analytics = await call('GET', undefined, { path: '/analytics?today=2026-10-03' })
  assert.equal(analytics.res.status, 200)
  assert.equal(analytics.data.analytics.vocabulary.attempts, 1)
  assert.equal(analytics.data.analytics.grammar.sessions, 1)
  assert.equal(analytics.data.analytics.conjugation.attempts, 1)
  assert.equal(analytics.data.analytics.vocabulary.accuracy, 0)
  assert.equal(analytics.data.analytics.grammar.accuracy, 80)
  assert.equal(analytics.data.analytics.conjugation.accuracy, 0)
  assert.equal(analytics.data.analytics.plan.weeklyPlannedDays, 3)
  assert.equal(analytics.data.analytics.trends.daily.length, 30)
  assert.equal(analytics.data.analytics.trends.weekly.length, 12)
  assert.equal(analytics.data.analytics.trends.monthly.length, 12)
  assert.equal(analytics.data.analytics.rankings.vocabulary[0].label, 'prendre')
  assert.equal(analytics.data.analytics.rankings.grammar[0].label, '过去习惯')
  assert.equal(analytics.data.analytics.rankings.conjugation[0].label, 'prendre')
  assert.ok(analytics.data.analytics.plan.weeklyHistory.length > 0)
  const latestAnalyticsWeek = analytics.data.analytics.plan.weeklyHistory.at(-1)
  assert.equal(latestAnalyticsWeek.wrongWords, 1)
  assert.equal(latestAnalyticsWeek.wrongAttempts, 1)
  assert.equal(typeof latestAnalyticsWeek.completionPercent, 'number')
  assert.equal(analytics.data.analytics.dashboard.heatmap.length, 90)
  assert.equal(analytics.data.analytics.dashboard.mastery.vocabulary.activeErrors, 1)
  assert.equal(analytics.data.analytics.dashboard.mastery.grammar.activeErrors, 1)
  assert.equal(analytics.data.analytics.dashboard.mastery.conjugation.activeErrors, 1)
  assert.equal(analytics.data.analytics.tcf.listening.attempts, 1)
  assert.equal(analytics.data.analytics.tcf.listening.latestScore, 466)
  assert.equal(analytics.data.analytics.tcf.listening.targetScore, 458)
  assert.equal(analytics.data.analytics.tcf.reading.attempts, 0)
  assert.equal(analytics.data.analytics.today.targetMinutes, 45)
  assert.equal(
    analytics.data.analytics.today.tasks.reduce((total, task) => total + task.minutes, 0),
    45,
    'smart tasks stay inside configured daily minutes',
  )
  assert.ok(analytics.data.analytics.today.tasks.some((task) => task.id === 'smart-review'))
  assert.match(analytics.data.analytics.dashboard.projection.predictedCompletionDate, /^\d{4}-\d{2}-\d{2}$/)

  const tcfHistory = await call('GET', undefined, { path: '/tcf-attempts?skill=listening' })
  assert.equal(tcfHistory.res.status, 200)
  assert.equal(tcfHistory.data.items.length, 1)
  assert.equal(tcfHistory.data.items[0].scaledScore, 466)

  const reviewResponse = await call('GET', undefined, { path: '/review?today=2026-10-05' })
  assert.equal(reviewResponse.res.status, 200)
  assert.equal(reviewResponse.data.queue.length, 3)
  const vocabReview = reviewResponse.data.queue.find((item) => item.kind === 'vocabulary')
  assert.ok(vocabReview)
  assert.equal((await call('PATCH', {
    id: randomUUID(),
    operations: [{
      kind: 'reviewResult',
      itemId: vocabReview.itemId,
      reviewKind: vocabReview.kind,
      sourceId: vocabReview.sourceId,
      label: vocabReview.label,
      quality: 4,
      reviewedAt: 1791230400000,
      day: '2026-10-05',
    }],
  })).res.status, 200)
  assert.equal((await call('GET', undefined, { path: '/review?today=2026-10-05' })).data.queue.some((item) => item.itemId === vocabReview.itemId), false)
  expected = (await call('GET')).data.state

  // Register a genuine P-256 WebAuthn credential against the anonymous learner, then
  // authenticate from a fresh cookie jar and continue the rest of smoke through the account session.
  const passkeyOrigin = frontendOrigin ?? origin
  const fixture = await createPasskeyFixture(passkeyOrigin)
  const registerOptions = await call('POST', {}, { path: '/passkey/register/options' })
  assert.equal(registerOptions.res.status, 200)
  const registration = await fixture.registration(registerOptions.data.options.challenge)
  const registered = await call('POST', { credential: registration }, { path: '/passkey/register/verify' })
  assert.equal(registered.res.status, 200)
  assert.equal(registered.data.account.registered, true)

  const loginOptions = await call('POST', {}, { cookie: '', path: '/passkey/login/options' })
  assert.equal(loginOptions.res.status, 200)
  const assertion = await fixture.authentication(loginOptions.data.options.challenge, 1)
  const loggedIn = await call('POST', { credential: assertion }, { cookie: '', path: '/passkey/login/verify' })
  assert.equal(loggedIn.res.status, 200)
  assert.deepEqual(loggedIn.data.state, expected, 'Passkey login restores the same learner state without a sync code')
  cookie = loggedIn.res.headers.get('set-cookie').split(';')[0]
  assert.equal((await call('GET', undefined, { path: '/account' })).data.signedIn, true)

  const recordsCsv = await fetch(`${origin}/api/study-plan/records.csv`, {
    headers: { Cookie: cookie, Origin: frontendOrigin ?? origin },
  })
  assert.equal(recordsCsv.status, 200)
  assert.match(recordsCsv.headers.get('content-type'), /text\/csv/)
  assert.match(await recordsCsv.text(), /prendre/)

  const errorCsv = await fetch(`${origin}/api/study-plan/error-book.csv`, {
    headers: { Cookie: cookie, Origin: frontendOrigin ?? origin },
  })
  assert.equal(errorCsv.status, 200)
  assert.match(await errorCsv.text(), /vocabulary/)

  const reportsCsv = await fetch(`${origin}/api/study-plan/weekly-reports.csv`, {
    headers: { Cookie: cookie, Origin: frontendOrigin ?? origin },
  })
  assert.equal(reportsCsv.status, 200)
  assert.match(await reportsCsv.text(), /week_start/)

  const keyResponse = await call('POST', {}, { path: '/sync-key' })
  assert.equal(keyResponse.res.status, 200)
  syncKey = keyResponse.data.key
  assert.match(syncKey, /^[a-f0-9]{64}$/)
  const linked = await call('POST', { key: syncKey }, { cookie: '', path: '/link' })
  assert.equal(linked.res.status, 200)
  const linkedCookie = linked.res.headers.get('set-cookie').split(';')[0]
  assert.deepEqual((await call('GET', undefined, { cookie: linkedCookie })).data.state, expected, 'A second device reads the same learner state')
  assert.deepEqual((await call('GET', undefined, { cookie: linkedCookie, path: '/sync' })).data, { bound: true, activeKeys: 1 })
  const detached = await call('POST', {}, { cookie: linkedCookie, path: '/unlink' })
  assert.equal(detached.res.status, 200)
  const detachedCookie = detached.res.headers.get('set-cookie').split(';')[0]
  assert.deepEqual((await call('GET', undefined, { cookie: detachedCookie, path: '/sync' })).data, { bound: false, activeKeys: 0 })
  assert.deepEqual((await call('GET', undefined, { cookie: detachedCookie })).data.state, expected, 'Unlinked device keeps an independent copy')

  assert.equal((await call('GET', undefined, { cookie: '' })).data.state, null, 'Browser identities isolated')
  assert.equal((await call('PATCH', mutation, { cookie: '' })).res.status, 401)
  assert.equal((await call('PATCH', mutation, { origin: 'https://evil.invalid' })).res.status, 403)
  assert.equal((await call('PATCH', { id: randomUUID(), operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-retell', value: -1 }] })).res.status, 400)
  assert.deepEqual((await call('GET')).data.state, expected, 'Rejected write leaves state intact')
  if (saveSession) await writeFile(saveSession, JSON.stringify({ origin, cookie, expected, syncKey }), { mode: 0o600 })
  console.log('PASS: schema v6, passkey account restore, CSV exports, dashboard/today plan, unified error book, checkins/achievements, weekly reports, analytics/SM-2, sync, restart persistence, idempotency, isolation and CSRF')
}
if (process.argv[1]?.endsWith('smoke-study.mjs')) {
  const [base, mode, path] = process.argv.slice(2)
  if (!base) throw new Error('Usage: node scripts/smoke-study.mjs https://APP.ACCOUNT.workers.dev [--save-session|--resume-session FILE]')
  await smokeStudy(base, { saveSession: mode === '--save-session' ? path : undefined, resumeSession: mode === '--resume-session' ? path : undefined })
}
