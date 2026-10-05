import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('client offline queue, LWW merge, review scheduling and sync bind/unbind', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-client-'))
  const server = createStudyServer({ database: join(dir, 'data.sqlite') })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const realFetch = globalThis.fetch
  const realNow = Date.now
  const storage = {}
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: { value: (key, value) => { storage[key] = value } },
    removeItem: { value: (key) => { delete storage[key] } },
  })
  globalThis.localStorage = storage
  globalThis.window = new EventTarget()
  let cookie = ''
  let offline = false
  let loseResponse = false

  globalThis.fetch = async (path, options) => {
    if (offline) throw new Error('offline')
    assert.equal(options.credentials, 'include', 'Remote API calls must include the browser session')
    const response = await realFetch(base + path, {
      ...options,
      headers: { ...options.headers, Origin: 'http://localhost:5173', Cookie: cookie },
    })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    if (loseResponse && (options.method === 'PATCH' || path.endsWith('/import'))) {
      loseResponse = false
      throw new Error('lost response after commit')
    }
    return response
  }

  const KEY = 'qwerty-fr-study-plan-v1'
  const initial = { startDate: '2026-10-01', minutes: {}, minimumMode: {} }

  try {
    const client = await import('../src/services/studyPlanSync.ts')
    assert.equal(client.studyApiBase('https://study.example.invalid/'), 'https://study.example.invalid')
    assert.equal(client.studyApiBase(''), '')
    for (const value of ['http://remote.example.invalid', 'https://u:p@example.invalid', 'https://example.invalid/api'])
      assert.throws(() => client.studyApiBase(value))

    storage.setItem(KEY, JSON.stringify(initial))
    await client.syncStudyPlan(initial)
    const next = { ...initial, minutes: { '2026-10-03': { 'sat-listening': 15 } }, minimumMode: { '2026-10-03': true } }
    client.saveStudyPlan(initial, next)
    await client.syncStudyPlan()
    storage.removeItem(KEY)
    await client.syncStudyPlan(initial)
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['sat-listening'], 15)

    loseResponse = true
    client.addStudyMinutes('2026-10-03', 'mon-vocab', 3)
    await client.syncStudyPlan()
    assert.ok(Object.keys(storage).some((key) => key.includes('pending:')))
    await client.syncStudyPlan()
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['mon-vocab'], 3)

    offline = true
    client.addStudyMinutes('2026-10-03', 'mon-vocab', 2)
    await client.syncStudyPlan()
    offline = false
    window.dispatchEvent(new Event('online'))
    for (let attempt = 0; attempt < 50 && client.getStudySyncSnapshot().pending > 0; attempt++)
      await new Promise((resolve) => setTimeout(resolve, 20))
    assert.equal(client.getStudySyncSnapshot().pending, 0)
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['mon-vocab'], 5)

    // Simulate a newer edit from another device, then replay an older offline edit.
    const ownerCookie = cookie
    const cachedBeforeConflict = JSON.parse(storage.getItem(KEY))
    const baseClock = realNow() + 100000
    const remoteConflict = await realFetch(base + '/api/study-plan', {
      method: 'PATCH',
      headers: { Origin: 'http://localhost:5173', Cookie: ownerCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: randomUUID(),
        operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value: 99, updatedAt: baseClock + 1000 }],
      }),
    })
    assert.equal(remoteConflict.status, 200)
    Date.now = () => baseClock
    offline = true
    client.saveStudyPlan(cachedBeforeConflict, {
      ...cachedBeforeConflict,
      minutes: { ...cachedBeforeConflict.minutes, '2026-10-03': { ...cachedBeforeConflict.minutes['2026-10-03'], 'sat-listening': 5 } },
    })
    await client.syncStudyPlan()
    offline = false
    Date.now = realNow
    await client.syncStudyPlan()
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['sat-listening'], 99, 'newer remote timestamp wins')

    const reloaded = await import('../src/services/studyPlanSync.ts?learning')
    reloaded.recordVocabularyProgress({
      word: 'prendre',
      dict: 'tcf-canada-foundation-01',
      chapter: 0,
      timeStamp: 1791014400,
      durationMs: 1200,
      wrongCount: 1,
      wrongKeys: ['x'],
    })
    reloaded.recordConjugationAttempt('prendre', 'passeCompose', false, '2026-10-03')
    reloaded.completeGrammarSession({
      topic: 'passé composé vs imparfait',
      score: 1,
      total: 2,
      elapsedSeconds: 1200,
      finishedAt: 1791061200000,
      answers: { 1: 'A', 2: 'B' },
      reasons: { 1: '背景描述', 2: '时间点' },
      outputAnswers: ['Je regardais la télé.'],
      items: [
        { id: '1', label: '背景 + 突发事件', correct: true },
        { id: '2', label: '过去习惯', correct: false },
      ],
    })
    await reloaded.syncStudyPlan()

    const analytics = await reloaded.loadStudyAnalytics()
    assert.equal(analytics.trends.daily.length, 30)
    assert.equal(analytics.trends.weekly.length, 12)
    assert.equal(analytics.trends.monthly.length, 12)
    assert.equal(analytics.rankings.vocabulary[0].label, 'prendre')
    assert.equal(analytics.rankings.grammar[0].label, '过去习惯')
    assert.equal(analytics.rankings.conjugation[0].label, 'prendre')

    let reviewQueue = await reloaded.loadReviewQueue()
    assert.equal(reviewQueue.length, 3)
    const vocabReview = reviewQueue.find((item) => item.kind === 'vocabulary')
    assert.ok(vocabReview)

    offline = true
    reloaded.submitReviewResult(vocabReview, 4)
    await reloaded.flushStudyProgress()
    assert.ok(reloaded.getStudySyncSnapshot().pending > 0)
    offline = false
    window.dispatchEvent(new Event('online'))
    for (let attempt = 0; attempt < 50 && reloaded.getStudySyncSnapshot().pending > 0; attempt++)
      await new Promise((resolve) => setTimeout(resolve, 20))
    assert.equal(reloaded.getStudySyncSnapshot().pending, 0)
    reviewQueue = await reloaded.loadReviewQueue()
    assert.equal(reviewQueue.some((item) => item.itemId === vocabReview.itemId), false)

    const syncKey = await reloaded.createStudySyncKey()
    assert.equal((await reloaded.loadStudySyncInfo()).bound, false)
    const linkedExpected = (await reloaded.exportRemoteStudyPlan(initial)).state

    cookie = ''
    for (const key of Object.keys(storage)) delete storage[key]
    const linkedDevice = await import('../src/services/studyPlanSync.ts?linked-device-v3')
    const linkedState = await linkedDevice.linkStudyDevice(syncKey)
    assert.deepEqual(linkedState, linkedExpected)
    assert.equal((await linkedDevice.loadStudySyncInfo()).bound, true)

    const detached = await linkedDevice.unlinkStudyDevice()
    assert.equal((await linkedDevice.loadStudySyncInfo()).bound, false)
    assert.deepEqual(detached.learning.reviews.items, linkedExpected.learning.reviews.items)

    cookie = ownerCookie
    await reloaded.revokeStudySyncKey(syncKey)
    assert.equal((await reloaded.loadStudySyncInfo()).activeKeys, 0)
    cookie = ''
    await assert.rejects(() => linkedDevice.linkStudyDevice(syncKey), /INVALID_SYNC_KEY/)

    cookie = ownerCookie
    const backup = await reloaded.exportRemoteStudyPlan(initial)
    assert.equal(backup.version, 3)
    const imported = { ...backup.state, startDate: '2026-09-01', minutes: { '2026-10-04': { 'sun-vocab': 60 } } }
    offline = true
    assert.equal(await reloaded.importRemoteStudyPlan(backup.state, imported), false)
    offline = false
    loseResponse = true
    const importReload = await import('../src/services/studyPlanSync.ts?import-v3')
    await importReload.syncStudyPlan(imported)
    assert.ok(Object.keys(storage).some((key) => key.includes('pending:')))
    await importReload.syncStudyPlan()
    assert.equal((await importReload.exportRemoteStudyPlan(initial)).state.startDate, '2026-09-01')
  } finally {
    Date.now = realNow
    globalThis.fetch = realFetch
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
