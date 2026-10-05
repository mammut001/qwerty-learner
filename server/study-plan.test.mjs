import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const initial = { startDate: '2026-10-01', minutes: { '2026-10-03': { 'sat-listening': 5 } }, minimumMode: {} }
test('durability, create-only migration, isolation, idempotent minutes and validation', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-plan-'))
  const options = { database: join(dir, 'data.sqlite'), origin: 'http://localhost:5173' }
  let server
  let base
  const start = async () => {
    server = createStudyServer(options)
    await new Promise((r) => server.listen(0, '127.0.0.1', r))
    base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  }
  const stop = () => new Promise((r) => server.close(r))
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
    assert.deepEqual(initializedState.minutes, initial.minutes)
    assert.deepEqual(initializedState.minimumMode, initial.minimumMode)
    assert.deepEqual(initializedState.learning.vocabulary.records, [])
    assert.deepEqual((await (await call('POST', cookie, { state: { ...initial, startDate: '2020-01-01' } })).json()).state, initializedState)
    const mutation = {
      id: randomUUID(),
      operations: [
        { kind: 'increment', day: '2026-10-03', task: 'sat-listening', value: 10 },
        { kind: 'mode', day: '2026-10-03', value: true },
        { kind: 'startDate', value: '2026-09-28' },
      ],
    }
    assert.equal((await call('PATCH', cookie, mutation)).status, 200)
    assert.equal((await call('PATCH', cookie, mutation)).status, 200)
    let state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.minutes['2026-10-03']['sat-listening'], 15) // completed at the existing target
    assert.equal(state.startDate, '2026-09-28')
    assert.equal(state.minimumMode['2026-10-03'], true)
    await stop()
    await start()
    assert.deepEqual((await (await call('GET', cookie)).json()).state, state)
    assert.equal((await (await call('GET')).json()).state, null) // different browser
    assert.equal((await call('PATCH', '', mutation)).status, 401)
    assert.equal((await call('PATCH', cookie, mutation, 'https://evil.example')).status, 403)
    assert.equal((await call('PATCH', cookie, { ...mutation, operations: [] })).status, 400)
    for (const value of [-1, '15', 1000001]) {
      assert.equal(
        (
          await call('PATCH', cookie, {
            id: randomUUID(),
            operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value }],
          })
        ).status,
        400,
      )
    }
    assert.equal(
      (
        await call('PATCH', cookie, {
          id: randomUUID(),
          operations: [
            { kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value: 0 },
            { kind: 'mode', day: '2026-02-30', value: true },
          ],
        })
      ).status,
      400,
    )
    assert.deepEqual((await (await call('GET', cookie)).json()).state, state) // rollback whole invalid mutation
    await Promise.all(
      ['mon-vocab', 'fri-vocab'].map((task) =>
        call('PATCH', cookie, { id: randomUUID(), operations: [{ kind: 'increment', day: '2026-10-03', task, value: 7 }] }),
      ),
    )
    state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.minutes['2026-10-03']['mon-vocab'], 7)
    assert.equal(state.minutes['2026-10-03']['fri-vocab'], 7)
    const undo = await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value: 0 }],
    })
    assert.equal((await undo.json()).state.minutes['2026-10-03']['sat-listening'], 0)
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
          },
        },
        { kind: 'conjugationAttempt', verb: 'prendre', tense: 'passeCompose', correct: true, day: '2026-10-03' },
      ],
    }
    assert.equal((await call('PATCH', cookie, learningMutation)).status, 200)
    assert.equal((await call('PATCH', cookie, learningMutation)).status, 200, 'learning mutation is idempotent')
    const analytics = await (await call('GET', cookie, undefined, options.origin, '/analytics?today=2026-10-03')).json()
    assert.equal(analytics.analytics.vocabulary.attempts, 1)
    assert.equal(analytics.analytics.grammar.sessions, 1)
    assert.equal(analytics.analytics.conjugation.attempts, 1)
    assert.ok(analytics.analytics.plan.weeklyHistory.length > 0)
    const latestAnalyticsWeek = analytics.analytics.plan.weeklyHistory.at(-1)
    assert.equal(latestAnalyticsWeek.wrongWords, 1)
    assert.equal(latestAnalyticsWeek.wrongAttempts, 1)

    const keyResponse = await call('POST', cookie, {}, options.origin, '/sync-key')
    assert.equal(keyResponse.status, 200)
    const syncKey = (await keyResponse.json()).key
    assert.match(syncKey, /^[a-f0-9]{64}$/)
    const linked = await call('POST', '', { key: syncKey }, options.origin, '/link')
    assert.equal(linked.status, 200)
    const linkedCookie = linked.headers.get('set-cookie').split(';')[0]
    assert.equal((await (await call('GET', linkedCookie)).json()).state.learning.vocabulary.records.length, 1)
    const linkedMutation = {
      id: randomUUID(),
      operations: [{ kind: 'conjugationAttempt', verb: 'prendre', tense: 'present', correct: false, day: '2026-10-04' }],
    }
    assert.equal((await call('PATCH', linkedCookie, linkedMutation)).status, 200)
    assert.equal((await (await call('GET', cookie)).json()).state.learning.conjugation.prendre.present.total, 1)

    const huge = await call('PATCH', cookie, { padding: 'x'.repeat(1800001) })
    assert.equal(huge.status, 413)
  } finally {
    if (server?.listening) await stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
