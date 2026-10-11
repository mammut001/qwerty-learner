import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

try {
  register('./ts-extension-loader.mjs', import.meta.url)
} catch {
  // Already registered or unsupported
}

test('after a 401 no further fetch happens when timers advance 60 s; after a 503 retry fires; leaving guest mode or login signal resumes sync', async () => {
  const origSetTimeout = globalThis.setTimeout
  const origClearTimeout = globalThis.clearTimeout

  let currentTime = 0
  let nextTimerId = 1
  const activeTimers = new Map()

  globalThis.setTimeout = (fn, delay = 0, ...args) => {
    const id = nextTimerId++
    activeTimers.set(id, { fn, delay, args, due: currentTime + delay })
    return id
  }
  globalThis.clearTimeout = (id) => {
    activeTimers.delete(id)
  }

  const advanceTimers = async (ms) => {
    currentTime += ms
    const due = []
    for (const [id, timer] of activeTimers.entries()) {
      if (timer.due <= currentTime) {
        due.push({ id, timer })
      }
    }
    for (const { id, timer } of due) {
      activeTimers.delete(id)
      await timer.fn(...timer.args)
    }
  }

  const storage = {}
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: {
      value: (key, value) => {
        storage[key] = String(value)
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

  let fetchCalls = []
  let nextStatus = 401
  let nextBody = { code: 'LOGIN_REQUIRED' }

  globalThis.fetch = async (url, options) => {
    fetchCalls.push({ url, options })
    return new Response(JSON.stringify(nextBody), {
      status: nextStatus,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { setGuestMode } = await import('../src/services/guestMode.ts')
    const client = await import('../src/services/studyPlanSync.ts')

    // -------------------------------------------------------------------------
    // 1. Proving: after a 401 no further fetch happens when timers advance 60 s
    // -------------------------------------------------------------------------
    await client.syncStudyPlan()
    assert.equal(fetchCalls.length, 1, 'Initial request performed')
    assert.equal(client.isStudySyncBlocked(), true, 'Auth marked blocked after 401')
    assert.equal(activeTimers.size, 0, 'No retry timer armed after 401')

    await advanceTimers(60000)
    assert.equal(fetchCalls.length, 1, 'No polling retry after 60s following 401')

    // Resume listeners (online, focus) must not cause repeated requests while blocked
    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('online'))
    assert.equal(fetchCalls.length, 1, 'Focus/online do not re-request while blocked')

    // -------------------------------------------------------------------------
    // Locally queued operations are never dropped because of a 401
    // -------------------------------------------------------------------------
    client.addStudyMinutes('2026-10-03', 'sat-listening', 15)
    assert.ok(
      Object.keys(storage).some((key) => key.includes('pending:')),
      'Pending queue preserves local mutation during 401',
    )
    for (let i = 0; i < 20 && !client.isStudySyncBlocked(); i++) {
      await new Promise((resolve) => origSetTimeout(resolve, 5))
    }
    assert.equal(fetchCalls.length, 2, 'Explicit user save attempts sync once')
    assert.equal(client.isStudySyncBlocked(), true, 'Still blocked after save gets 401')
    assert.equal(activeTimers.size, 0, 'No retry timer armed after user action 401')

    await advanceTimers(60000)
    assert.equal(fetchCalls.length, 2, 'No retry timer fires after advancing 60s')

    // -------------------------------------------------------------------------
    // 2. Proving: after a 503 the retry still fires
    // -------------------------------------------------------------------------
    nextStatus = 503
    nextBody = { error: 'Service Unavailable' }
    await client.resumeStudyPlanSync()
    assert.equal(fetchCalls.length, 3, '503 request sent')
    assert.equal(client.isStudySyncBlocked(), false, 'Not marked auth-blocked on 503')
    assert.equal(activeTimers.size, 1, '10s retry timer armed after 503')

    await advanceTimers(10000)
    for (let i = 0; i < 20 && fetchCalls.length === 3; i++) {
      await new Promise((resolve) => origSetTimeout(resolve, 5))
    }
    await new Promise((resolve) => origSetTimeout(resolve, 20))
    assert.equal(fetchCalls.length, 4, 'Retry request fired after 10s on 503')

    // -------------------------------------------------------------------------
    // 3. Proving: after leaving guest mode / login signal the sync resumes
    // -------------------------------------------------------------------------
    nextStatus = 200
    nextBody = {
      state: {
        startDate: '2026-10-01',
        settings: { examDate: '2027-03-31', studyDays: [1, 2, 3, 4, 5, 6, 0], dailyTargetMinutes: null },
        minutes: {},
        minimumMode: {},
        learning: {
          vocabulary: { records: [] },
          grammar: { draft: null, history: [] },
          conjugation: {},
          focusSessions: [],
          reviews: { items: {} },
        },
        syncMeta: {
          startDateUpdatedAt: 0,
          settingsUpdatedAt: 0,
          minimumModeUpdatedAt: {},
          minutesUpdatedAt: {},
          grammarDraftUpdatedAt: 0,
        },
      },
    }

    // Set guest mode (clears retry timer)
    setGuestMode(true)
    assert.equal(activeTimers.size, 0, 'Guest mode clears active retry timer')

    // Leave guest mode -> sync resumes
    const beforeLeavingGuest = fetchCalls.length
    setGuestMode(false)
    for (let i = 0; i < 20 && fetchCalls.length === beforeLeavingGuest; i++) {
      await new Promise((resolve) => origSetTimeout(resolve, 5))
    }
    assert.ok(fetchCalls.length > beforeLeavingGuest, 'Leaving guest mode resumes sync')
    assert.equal(client.isStudySyncBlocked(), false, 'Sync is unblocked after leaving guest mode')

    // Login signal -> sync resumes
    const beforeLoginSignal = fetchCalls.length
    window.dispatchEvent(new Event('qwerty-auth-login'))
    for (let i = 0; i < 20 && fetchCalls.length === beforeLoginSignal; i++) {
      await new Promise((resolve) => origSetTimeout(resolve, 5))
    }
    assert.ok(fetchCalls.length > beforeLoginSignal, 'Login signal resumes sync')
  } finally {
    globalThis.setTimeout = origSetTimeout
    globalThis.clearTimeout = origClearTimeout
  }
})
