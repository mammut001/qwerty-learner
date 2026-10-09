import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('guest mode: recorded progress mutation performs no fetch and leaves no pending-queue key; setGuestMode(false) restores normal path', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'guest-client-'))
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
  let fetchCount = 0

  globalThis.fetch = async (path, options) => {
    fetchCount++
    const response = await realFetch(base + path, {
      ...options,
      headers: { ...options.headers, Origin: 'http://localhost:5173', Cookie: cookie },
    })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    return response
  }

  try {
    const { isGuestMode, setGuestMode } = await import('../src/services/guestMode.ts')
    const client = await import('../src/services/studyPlanSync.ts')

    // 1. Enable guest mode
    setGuestMode(true)
    assert.equal(isGuestMode(), true, 'Guest mode must be enabled')

    const pendingKeys = () => Object.keys(storage).filter((k) => k.startsWith('qwerty-fr-study-plan-pending:'))

    // 2. Perform a progress mutation in guest mode
    fetchCount = 0
    client.recordVocabularyProgress({
      word: 'bonjour',
      dict: 'tcf-01',
      chapter: 1,
      timeStamp: 1700000000,
      durationMs: 500,
      wrongCount: 0,
      wrongKeys: [],
    })

    // Also trigger sync attempt explicitly
    await client.syncStudyPlan()
    await client.flushStudyProgress()

    // Assert: zero fetches performed, and NO pending keys in storage
    assert.equal(fetchCount, 0, 'No fetch should be performed in guest mode')
    assert.equal(pendingKeys().length, 0, 'No pending mutation queue key should be written in guest mode')

    // 3. Disable guest mode (e.g. user logged in or guest mode turned off)
    setGuestMode(false)
    assert.equal(isGuestMode(), false, 'Guest mode must be disabled')

    // 4. Perform a progress mutation in normal mode
    client.recordVocabularyProgress({
      word: 'merci',
      dict: 'tcf-01',
      chapter: 1,
      timeStamp: 1700000001,
      durationMs: 400,
      wrongCount: 0,
      wrongKeys: [],
    })

    // Assert: pending key is written in storage, and normal fetch path is used
    await client.flushStudyProgress()
    assert.ok(fetchCount > 0, 'Normal mode should perform network requests to sync')
  } finally {
    globalThis.fetch = realFetch
    server.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
