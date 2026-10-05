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
    assert.equal(analytics.analytics.reviewDue, 3)

    const review = await (await call('GET', cookie, undefined, options.origin, '/review?today=2026-10-05')).json()
    assert.equal(review.queue.length, 3)
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
    state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.learning.reviews.items[vocabReview.itemId].repetitions, 1, 'review schedule survives restart')
    assert.equal(state.minutes['2026-10-03']['sat-retell'], 20)

    assert.equal((await call('PATCH', cookie, mutation, 'https://evil.example')).status, 403)
    assert.equal((await call('PATCH', '', mutation)).status, 401)
    assert.equal((await call('GET', cookie, undefined, options.origin, '/review?today=bad-date')).status, 400)
    assert.equal((await call('POST', cookie, { key: 'bad' }, options.origin, '/sync-key/revoke')).status, 400)

    const beforeInvalid = (await (await call('GET', cookie)).json()).state
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
