import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

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
  const state = { startDate: '2026-10-01', minutes: { '2026-10-03': { 'sat-listening': 5 } }, minimumMode: {} }
  const initialized = await call('POST', { state })
  assert.equal(initialized.res.status, 200)
  assert.equal(initialized.data.state.startDate, state.startDate)
  assert.deepEqual(initialized.data.state.minutes, state.minutes)
  assert.deepEqual(initialized.data.state.minimumMode, state.minimumMode)
  assert.deepEqual(initialized.data.state.learning.vocabulary.records, [])
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
    ],
  }
  assert.equal((await call('PATCH', learningMutation)).res.status, 200)
  assert.equal((await call('PATCH', learningMutation)).res.status, 200, 'Learning replay is idempotent')

  expected = (await call('GET')).data.state
  assert.equal(expected.minutes['2026-10-03']['sat-retell'], 8, 'Concurrent updates preserved')
  assert.equal(expected.minutes['2026-10-03']['sat-listening'], 15, 'Completion target preserved')
  assert.equal(expected.minimumMode['2026-10-03'], true)
  assert.equal(expected.startDate, '2026-09-28')
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
  console.log('PASS: same-origin API, analytics trends/rankings, SM-2 review, bind/unbind, restart persistence, concurrent/idempotent writes, isolation and CSRF')
}
if (process.argv[1]?.endsWith('smoke-study.mjs')) {
  const [base, mode, path] = process.argv.slice(2)
  if (!base) throw new Error('Usage: node scripts/smoke-study.mjs https://APP.ACCOUNT.workers.dev [--save-session|--resume-session FILE]')
  await smokeStudy(base, { saveSession: mode === '--save-session' ? path : undefined, resumeSession: mode === '--resume-session' ? path : undefined })
}
