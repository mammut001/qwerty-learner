import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('legacy IndexedDB/localStorage payloads migrate once and offline migration is not marked done early', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-legacy-migration-'))
  const server = createStudyServer({ database: join(dir, 'data.sqlite') })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const realFetch = globalThis.fetch
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
  globalThis.fetch = async (path, options) => {
    if (offline) throw new Error('offline')
    const response = await realFetch(base + path, {
      ...options,
      headers: { ...options?.headers, Origin: 'http://localhost:5173', Cookie: cookie },
    })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    return response
  }

  try {
    const client = await import('../src/services/studyPlanSync.ts?legacy-migration-v5')
    const initial = { startDate: '2026-10-01', minutes: {}, minimumMode: {} }
    await client.syncStudyPlan(initial)

    const input = {
      vocabulary: [{
        word: 'prendre',
        dict: 'legacy-dict',
        chapter: 0,
        timeStamp: 1791014400,
        durationMs: 1200,
        wrongCount: 1,
        wrongKeys: ['x'],
      }],
      grammarHistory: [{
        topic: 'legacy grammar',
        score: 1,
        total: 2,
        elapsedSeconds: 300,
        finishedAt: 1791061200000,
        answers: { 1: 'A', 2: 'B' },
        reasons: { 1: '背景', 2: '事件' },
        outputAnswers: ['test'],
      }],
      conjugation: {
        prendre: {
          present: { correct: 2, total: 3 },
        },
      },
    }

    assert.equal(await client.migrateLegacyStudyData(input), true)
    let learning = await client.getLearningProgress()
    assert.equal(learning.vocabulary.records.filter((item) => item.word === 'prendre').length, 1)
    assert.equal(learning.grammar.history.filter((item) => item.topic === 'legacy grammar').length, 1)
    assert.deepEqual(learning.conjugation.prendre.present, { correct: 2, total: 3 })

    assert.equal(await client.migrateLegacyStudyData(input), true)
    learning = await client.getLearningProgress()
    assert.equal(learning.vocabulary.records.filter((item) => item.word === 'prendre').length, 1)
    assert.equal(learning.grammar.history.filter((item) => item.topic === 'legacy grammar').length, 1)

    const migrationKey = Object.keys(storage).find((key) => key.includes('legacy-migration-v2'))
    assert.ok(migrationKey)
    assert.equal(storage[migrationKey], 'done')

    delete storage[migrationKey]
    offline = true
    const offlineInput = {
      vocabulary: [{
        word: 'venir',
        dict: 'legacy-dict',
        chapter: 0,
        timeStamp: 1791014500,
        durationMs: 900,
        wrongCount: 0,
        wrongKeys: [],
      }],
    }
    assert.equal(await client.migrateLegacyStudyData(offlineInput), false)
    assert.notEqual(storage[migrationKey], 'done')
    assert.ok(Object.keys(storage).some((key) => key.includes('pending:')))

    offline = false
    window.dispatchEvent(new Event('online'))
    assert.equal(await client.migrateLegacyStudyData(offlineInput), true)
    assert.equal(storage[migrationKey], 'done')
    learning = await client.getLearningProgress()
    assert.equal(learning.vocabulary.records.filter((item) => item.word === 'venir').length, 1)
    assert.equal(
      learning.vocabulary.records.filter((item) => item.word === 'venir').length,
      1,
      'retry after reconnect does not duplicate the already queued legacy row',
    )

    await client.syncStudyPlan()
  } finally {
    globalThis.fetch = realFetch
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
