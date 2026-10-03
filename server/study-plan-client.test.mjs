import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('client migrates, reloads from server, replays a lost response exactly once, and restores offline edits', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-client-'))
  const server = createStudyServer({ database: join(dir, 'data.sqlite') })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = `http://127.0.0.1:${server.address().port}`
  const realFetch = globalThis.fetch
  const storage = {}
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: {
      value: (key, value) => {
        storage[key] = value
      },
    },
    removeItem: {
      value: (key) => {
        delete storage[key]
      },
    },
  })
  globalThis.localStorage = storage
  globalThis.window = new EventTarget()
  let cookie = ''
  let offline = false
  let loseResponse = false
  globalThis.fetch = async (path, options) => {
    if (offline) throw new Error('offline')
    const response = await realFetch(base + path, {
      ...options,
      headers: { ...options.headers, Origin: 'http://localhost:5173', Cookie: cookie },
    })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    if (loseResponse && options.method === 'PATCH') {
      loseResponse = false
      throw new Error('lost response after commit')
    }
    return response
  }
  const KEY = 'qwerty-fr-study-plan-v1'
  const initial = { startDate: '2026-10-01', minutes: {}, minimumMode: {} }
  try {
    const client = await import('../src/services/studyPlanSync.ts')
    storage.setItem(KEY, JSON.stringify(initial))
    await client.syncStudyPlan(initial)
    const next = { ...initial, minutes: { '2026-10-03': { 'sat-listening': 15 } }, minimumMode: { '2026-10-03': true } }
    client.saveStudyPlan(initial, next)
    await client.syncStudyPlan()
    storage.removeItem(KEY) // proves restore is from SQLite, not localStorage
    await client.syncStudyPlan(initial)
    assert.deepEqual(JSON.parse(storage.getItem(KEY)), next)
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
    const reloaded = await import('../src/services/studyPlanSync.ts?reload')
    await reloaded.syncStudyPlan(JSON.parse(storage.getItem(KEY)))
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['mon-vocab'], 5)
    assert.equal(Object.keys(storage).filter((key) => key.includes('pending:')).length, 0)
    // First-ever use offline: seed must not include queued increments on migration.
    cookie = ''
    for (const key of Object.keys(storage)) delete storage[key]
    storage.setItem(KEY, JSON.stringify(initial))
    offline = true
    reloaded.addStudyMinutes('2026-10-03', 'mon-vocab', 4)
    await reloaded.syncStudyPlan()
    offline = false
    const firstReload = await import('../src/services/studyPlanSync.ts?first-offline-reload')
    await firstReload.syncStudyPlan(JSON.parse(storage.getItem(KEY)))
    assert.equal(JSON.parse(storage.getItem(KEY)).minutes['2026-10-03']['mon-vocab'], 4)
    await client.syncStudyPlan()
    await reloaded.syncStudyPlan()
  } finally {
    globalThis.fetch = realFetch
    await new Promise((r) => server.close(r))
    rmSync(dir, { recursive: true, force: true })
  }
})
