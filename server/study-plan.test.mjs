import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const initial = { startDate: '2026-10-01', minutes: { '2026-10-03': { 'sat-listening': 5 } }, minimumMode: {} }

test('durability, analytics, review scheduling, LWW sync and device binding', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-plan-'))
  const options = { database: join(dir, 'data.sqlite'), origin: 'http://localhost:5173' }
  let server
  let base
  const start = async () => {
    server = createStudyServer(options)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  }
  const stop = () => new Promise((resolve) => server.close(resolve))
  const call = (method, cookie = '', body, origin = options.origin, suffix = '') =>
    fetch(base + suffix, {
      method,
      headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  try {
    await start()
    const first = await call('GET')
    const cookie = first.headers.get('set-cookie').split(';')[0]
    assert.match(first.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/)
    assert.equal((await first.json()).state, null)

    const initialized = await call('POST', cookie, { state: initial })
    assert.equal(initialized.status, 200)
    const initializedState = (await initialized.json()).state
    assert.equal(initializedState.startDate, initial.startDate)
    assert.deepEqual(initializedState.learning.conjugationAttempts, [])
    assert.deepEqual(initializedState.learning.reviews.items, {})
    assert.equal(initializedState.syncMeta.startDateUpdatedAt, 0)
    assert.equal(initializedState.syncMeta.settingsUpdatedAt, 0)
    assert.deepEqual(initializedState.settings, {
      examDate: '2027-03-31',
      dailyTargetMinutes: null,
      studyDays: [1, 2, 3, 4, 5, 6, 0],
    })
    assert.deepEqual((await (await call('POST', cookie, { state: { ...initial, startDate: '2020-01-01' } })).json()).state, initializedState)

    const mutation = {
      id: randomUUID(),
      operations: [
        { kind: 'increment', day: '2026-10-03', task: 'sat-listening', value: 10, updatedAt: 100 },
        { kind: 'mode', day: '2026-10-03', value: true, updatedAt: 100 },
        { kind: 'startDate', value: '2026-09-28', updatedAt: 100 },
      ],
    }
    assert.equal((await call('PATCH', cookie, mutation)).status, 200)
    assert.equal((await call('PATCH', cookie, mutation)).status, 200, 'mutation replay is idempotent')

    // Last-write-wins for fields that can conflict across devices.
    assert.equal((await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-retell', value: 20, updatedAt: 200 }],
    })).status, 200)
    assert.equal((await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-retell', value: 5, updatedAt: 150 }],
    })).status, 200)
    let state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.minutes['2026-10-03']['sat-retell'], 20, 'older offline write cannot overwrite newer remote field')
    assert.equal(state.syncMeta.minutesUpdatedAt['2026-10-03']['sat-retell'], 200)

    const settingsMutation = {
      id: randomUUID(),
      operations: [{
        kind: 'settings',
        value: { examDate: '2027-03-31', dailyTargetMinutes: 60, studyDays: [1, 3, 5] },
        updatedAt: 300,
      }],
    }
    assert.equal((await call('PATCH', cookie, settingsMutation)).status, 200)
    assert.equal((await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{
        kind: 'settings',
        value: { examDate: '2027-04-30', dailyTargetMinutes: 90, studyDays: [2, 4] },
        updatedAt: 250,
      }],
    })).status, 200)
    state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.startDate, '2026-10-01')
    assert.deepEqual(state.settings, { examDate: '2027-03-31', dailyTargetMinutes: 60, studyDays: [1, 3, 5] })
    assert.equal(state.minutes['2026-10-03']['sat-retell'], 20, 're-scheduling never rewrites completed history')

    const vocabId = randomUUID()
    const grammarId = randomUUID()
    const conjugationId = randomUUID()
    const learningMutation = {
      id: randomUUID(),
      operations: [
        {
          kind: 'vocabularyRecords',
          value: [{
            id: vocabId,
            word: 'prendre',
            dict: 'tcf-canada-foundation-01',
            chapter: 0,
            timeStamp: 1791014400,
            day: '2026-10-03',
            durationMs: 1200,
            wrongCount: 2,
            wrongKeys: ['x', 'r'],
          }],
        },
        {
          kind: 'grammarSession',
          value: {
            id: grammarId,
            topic: 'passé composé vs imparfait',
            score: 1,
            total: 2,
            elapsedSeconds: 1200,
            finishedAt: 1791061200000,
            day: '2026-10-03',
            answers: { 1: 'A', 2: 'B' },
            reasons: { 1: '背景描述', 2: '时间点' },
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
            id: conjugationId,
            verb: 'prendre',
            tense: 'passeCompose',
            correct: false,
            day: '2026-10-03',
            occurredAt: 1791061300000,
          },
        },
      ],
    }
    assert.equal((await call('PATCH', cookie, learningMutation)).status, 200)
    assert.equal((await call('PATCH', cookie, learningMutation)).status, 200, 'append-only learning events replay once')
    const legacyConjugationMutation = {
      id: randomUUID(),
      operations: [{ kind: 'conjugationAttempt', verb: 'venir', tense: 'present', correct: false, day: '2026-10-03' }],
    }
    assert.equal((await call('PATCH', cookie, legacyConjugationMutation)).status, 200, 'previous offline conjugation format remains replayable')
    assert.equal((await call('PATCH', cookie, legacyConjugationMutation)).status, 200)
    assert.equal((await (await call('GET', cookie)).json()).state.learning.conjugation.venir.present.total, 1)

    const analytics = await (await call('GET', cookie, undefined, options.origin, '/analytics?today=2026-10-05')).json()
    assert.equal(analytics.analytics.vocabulary.attempts, 1)
    assert.equal(analytics.analytics.vocabulary.accuracy, 0)
    assert.equal(analytics.analytics.grammar.accuracy, 50)
    assert.equal(analytics.analytics.conjugation.accuracy, 0)
    assert.equal(analytics.analytics.trends.daily.length, 30)
    assert.equal(analytics.analytics.trends.weekly.length, 12)
    assert.equal(analytics.analytics.trends.monthly.length, 12)
    assert.equal(analytics.analytics.rankings.vocabulary[0].label, 'prendre')
    assert.equal(analytics.analytics.rankings.grammar[0].label, '过去习惯')
    assert.equal(analytics.analytics.rankings.conjugation[0].label, 'prendre')
    assert.equal(analytics.analytics.reviewDue, 4)
    assert.equal(analytics.analytics.dashboard.heatmap.length, 90)
    assert.equal(analytics.analytics.dashboard.mastery.vocabulary.activeErrors, 1)
    assert.equal(analytics.analytics.dashboard.mastery.grammar.activeErrors, 1)
    assert.equal(analytics.analytics.dashboard.mastery.conjugation.activeErrors, 2)
    assert.equal(analytics.analytics.today.targetMinutes, 60)
    assert.equal(
      analytics.analytics.today.tasks.reduce((total, task) => total + task.minutes, 0),
      60,
      'smart today tasks fit exactly inside the configured daily target',
    )
    assert.ok(analytics.analytics.today.tasks.some((task) => task.id === 'smart-review'))
    assert.equal(analytics.analytics.plan.weeklyPlannedDays, 3)
    assert.equal(analytics.analytics.plan.weeklyPlannedMinutes, 180)
    assert.equal(analytics.analytics.plan.weeklyMinutes, 35, 'history on a newly configured rest day remains counted')

    const review = await (await call('GET', cookie, undefined, options.origin, '/review?today=2026-10-05')).json()
    assert.equal(review.queue.length, 4)
    const vocabReview = review.queue.find((item) => item.kind === 'vocabulary')
    assert.ok(vocabReview)
    const reviewMutation = {
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
    }
    assert.equal((await call('PATCH', cookie, reviewMutation)).status, 200)
    const afterReview = await (await call('GET', cookie, undefined, options.origin, '/review?today=2026-10-05')).json()
    assert.equal(afterReview.queue.some((item) => item.itemId === vocabReview.itemId), false)
    const dueTomorrow = await (await call('GET', cookie, undefined, options.origin, '/review?today=2026-10-06')).json()
    assert.equal(dueTomorrow.queue.some((item) => item.itemId === vocabReview.itemId), true)

    const firstKeyResponse = await call('POST', cookie, {}, options.origin, '/sync-key')
    assert.equal(firstKeyResponse.status, 200)
    const firstSyncKey = (await firstKeyResponse.json()).key
    assert.match(firstSyncKey, /^[a-f0-9]{64}$/)
    const keyResponse = await call('POST', cookie, {}, options.origin, '/sync-key')
    assert.equal(keyResponse.status, 200)
    const syncKey = (await keyResponse.json()).key
    assert.match(syncKey, /^[a-f0-9]{64}$/)
    assert.notEqual(syncKey, firstSyncKey)
    assert.equal((await call('POST', '', { key: firstSyncKey }, options.origin, '/link')).status, 401, 'rotated key is revoked')
    assert.deepEqual(await (await call('GET', cookie, undefined, options.origin, '/sync')).json(), { bound: false, activeKeys: 1 })

    const linked = await call('POST', '', { key: syncKey }, options.origin, '/link')
    assert.equal(linked.status, 200)
    const linkedCookie = linked.headers.get('set-cookie').split(';')[0]
    assert.deepEqual(await (await call('GET', linkedCookie, undefined, options.origin, '/sync')).json(), { bound: true, activeKeys: 1 })

    const detached = await call('POST', linkedCookie, {}, options.origin, '/unlink')
    assert.equal(detached.status, 200)
    const detachedCookie = detached.headers.get('set-cookie').split(';')[0]
    assert.deepEqual(await (await call('GET', detachedCookie, undefined, options.origin, '/sync')).json(), { bound: false, activeKeys: 0 })
    assert.equal((await (await call('GET', detachedCookie)).json()).state.learning.reviews.items[vocabReview.itemId].repetitions, 1)

    assert.equal((await call('POST', cookie, { key: syncKey }, options.origin, '/sync-key/revoke')).status, 200)
    assert.equal((await call('POST', '', { key: syncKey }, options.origin, '/link')).status, 401)
    assert.deepEqual(await (await call('GET', cookie, undefined, options.origin, '/sync')).json(), { bound: false, activeKeys: 0 })

    await stop()
    await start()
    const healthAfterRestart = await fetch(base.replace('/api/study-plan', '/api/health'))
    assert.equal(healthAfterRestart.status, 200)
    assert.equal((await healthAfterRestart.json()).schemaVersion, 5)
    state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.learning.reviews.items[vocabReview.itemId].repetitions, 1, 'review schedule survives restart')
    assert.equal(state.minutes['2026-10-03']['sat-retell'], 20)

    assert.equal((await call('PATCH', cookie, mutation, 'https://evil.example')).status, 403)
    assert.equal((await call('PATCH', '', mutation)).status, 401)
    assert.equal((await call('GET', cookie, undefined, options.origin, '/review?today=bad-date')).status, 400)
    assert.equal((await call('POST', cookie, { key: 'bad' }, options.origin, '/sync-key/revoke')).status, 400)

    const beforeInvalid = (await (await call('GET', cookie)).json()).state
    for (const value of [
      { examDate: 'bad-date', dailyTargetMinutes: 60, studyDays: [1, 3, 5] },
      { examDate: '2027-03-31', dailyTargetMinutes: 5, studyDays: [1, 3, 5] },
      { examDate: '2027-03-31', dailyTargetMinutes: 60, studyDays: [] },
      { examDate: '2027-03-31', dailyTargetMinutes: 60, studyDays: [1, 7] },
    ]) {
      assert.equal((await call('PATCH', cookie, {
        id: randomUUID(),
        operations: [{ kind: 'settings', value, updatedAt: Date.now() }],
      })).status, 400)
    }
    assert.deepEqual((await (await call('GET', cookie)).json()).state, beforeInvalid, 'invalid settings roll back atomically')

    assert.equal((await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'reviewResult', itemId: 'x', reviewKind: 'vocabulary', sourceId: 'x', label: 'x', quality: 9, reviewedAt: Date.now(), day: '2026-10-05' }],
    })).status, 400)
    assert.deepEqual((await (await call('GET', cookie)).json()).state, beforeInvalid)

    const huge = await call('PATCH', cookie, { padding: 'x'.repeat(1800001) })
    assert.equal(huge.status, 413)
  } finally {
    if (server?.listening) await stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
