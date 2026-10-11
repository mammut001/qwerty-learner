import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

try {
  register('./ts-extension-loader.mjs', import.meta.url)
} catch {
  // Already registered or unsupported
}

test('guest 401 latch, request loop prevention, public auth paths, and in-page sign-in sync resumption', async (t) => {
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
  let customFetchHandler = null

  globalThis.fetch = async (url, options) => {
    fetchCalls.push({ url, options })
    if (customFetchHandler) {
      return customFetchHandler(url, options)
    }
    return new Response(JSON.stringify(nextBody), {
      status: nextStatus,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resetStorage = () => {
    for (const key of Object.keys(storage)) {
      delete storage[key]
    }
  }

  const mockPlanState = {
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
  }

  try {
    const { isGuestMode, setGuestMode } = await import('../src/services/guestMode.ts')
    const client = await import('../src/services/studyPlanSync.ts')

    // -------------------------------------------------------------------------
    // 1. 401 latches authBlocked, no timer retry, 503 retries, leaving guest mode resumes sync
    // -------------------------------------------------------------------------
    await t.test('401 latches authBlocked without timer retry, 503 arms retry, leaving guest mode resumes sync', async () => {
      resetStorage()
      fetchCalls = []
      nextStatus = 401
      nextBody = { code: 'LOGIN_REQUIRED' }

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

      // Dead events: qwerty-auth-login and qwerty-login must NOT resume sync
      window.dispatchEvent(new Event('qwerty-auth-login'))
      window.dispatchEvent(new Event('qwerty-login'))
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => origSetTimeout(resolve, 5))
      }
      assert.equal(fetchCalls.length, 1, 'Dead login events have no listeners and do not trigger requests')
      assert.equal(client.isStudySyncBlocked(), true, 'Sync remains blocked after dead login events')

      // Explicit user action when guest mode is false attempts sync once
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

      // 503 response: retry timer arms and fires
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

      // Setting guest mode clears active retry timer
      setGuestMode(true)
      assert.equal(activeTimers.size, 0, 'Guest mode clears active retry timer')

      // Leaving guest mode (true -> false) resumes sync
      nextStatus = 200
      nextBody = { state: mockPlanState }
      const beforeLeavingGuest = fetchCalls.length
      setGuestMode(false)
      for (let i = 0; i < 20 && fetchCalls.length === beforeLeavingGuest; i++) {
        await new Promise((resolve) => origSetTimeout(resolve, 5))
      }
      assert.ok(fetchCalls.length > beforeLeavingGuest, 'Leaving guest mode resumes sync')
      await client.syncStudyPlan()
      assert.equal(client.isStudySyncBlocked(), false, 'Sync is unblocked after leaving guest mode')
    })

    // -------------------------------------------------------------------------
    // 2. Request loop prevention: fetch returns 401 and status says "not locked"
    // -------------------------------------------------------------------------
    await t.test('request loop prevention: at most ONE study-plan request is made despite repeated setGuestMode(false)', async () => {
      resetStorage()
      fetchCalls = []
      setGuestMode(false)

      customFetchHandler = (url) => {
        if (url.includes('/api/study-plan/auth')) {
          // Status endpoint says "not locked"
          return new Response(JSON.stringify({ enabled: true, required: false, signedIn: false, user: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        // Study plan endpoint returns 401 LOGIN_REQUIRED
        return new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Simulate AuthGate's qwerty-auth-required handler
      let authRequiredCount = 0
      const onAuthRequired = () => {
        authRequiredCount++
        // AuthGate.checkStatus() evaluates status (not locked) and calls setGuestMode(false)
        setGuestMode(false)
      }
      window.addEventListener('qwerty-auth-required', onAuthRequired)

      try {
        // Trigger initial sync: gets 401, dispatches qwerty-auth-required
        await client.syncStudyPlan()
        assert.equal(client.isStudySyncBlocked(), true, 'AuthBlocked is latched after 401')
        assert.ok(authRequiredCount >= 1, 'AuthGate auth-required handler was triggered')

        // Simulate repeated executions of the auth-required path (e.g. repeated checkStatus)
        for (let i = 0; i < 5; i++) {
          window.dispatchEvent(new Event('qwerty-auth-required'))
          setGuestMode(false)
        }

        // Advance timers by 60 seconds
        await advanceTimers(60000)

        // Count study-plan requests (excluding /auth requests)
        const studyPlanRequests = fetchCalls.filter((c) => !c.url.includes('/auth'))
        assert.equal(
          studyPlanRequests.length,
          1,
          'At most ONE study-plan request is made despite repeated setGuestMode(false) and advancing timers',
        )
        assert.equal(client.isStudySyncBlocked(), true, 'Auth latch remains intact')
      } finally {
        window.removeEventListener('qwerty-auth-required', onAuthRequired)
        customFetchHandler = null
      }
    })

    // -------------------------------------------------------------------------
    // 3. Login and public auth paths are never blocked locally by authBlocked latch
    // -------------------------------------------------------------------------
    await t.test(
      'public auth endpoints (passkey login, passkey registration, sync key link) bypass authBlocked latch in api()',
      async () => {
        resetStorage()
        fetchCalls = []

        // Force latch to blocked
        nextStatus = 401
        nextBody = { code: 'LOGIN_REQUIRED' }
        await client.syncStudyPlan()
        assert.equal(client.isStudySyncBlocked(), true, 'Latch is engaged before auth requests')

        customFetchHandler = (url) => {
          if (url.includes('/passkey/login/options')) {
            return new Response(JSON.stringify({ options: { challenge: 'test-challenge' } }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          if (url.includes('/passkey/login/verify')) {
            return new Response(
              JSON.stringify({
                state: mockPlanState,
                account: { registered: true, signedIn: true, passkeyCount: 1 },
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }
          if (url.includes('/passkey/register/options')) {
            return new Response(JSON.stringify({ options: { challenge: 'reg-challenge' } }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          if (url.includes('/passkey/register/verify')) {
            return new Response(
              JSON.stringify({
                account: { registered: true, signedIn: true, passkeyCount: 1 },
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }
          if (url.includes('/link')) {
            return new Response(JSON.stringify({ state: mockPlanState }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          return new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          // 1. beginPasskeyLogin: POST /passkey/login/options goes through api() while authBlocked=true
          const loginOptions = await client.beginPasskeyLogin()
          assert.equal(loginOptions.challenge, 'test-challenge')
          assert.ok(
            fetchCalls.some((c) => c.url.includes('/passkey/login/options')),
            'beginPasskeyLogin successfully sent request through api()',
          )

          // 2. finishPasskeyLogin: POST /passkey/login/verify goes through api() while authBlocked=true
          const loginResult = await client.finishPasskeyLogin({ id: 'cred-1' })
          assert.equal(loginResult.account.signedIn, true)
          assert.ok(
            fetchCalls.some((c) => c.url.includes('/passkey/login/verify')),
            'finishPasskeyLogin successfully sent request through api()',
          )
          assert.equal(client.isStudySyncBlocked(), false, 'Successful passkey login unlatches authBlocked')

          // Re-latch authBlocked
          nextStatus = 401
          customFetchHandler = null
          await client.syncStudyPlan()
          assert.equal(client.isStudySyncBlocked(), true, 'Re-latched to authBlocked=true')

          // Restore customFetchHandler
          customFetchHandler = (url) => {
            if (url.includes('/passkey/register/options')) {
              return new Response(JSON.stringify({ options: { challenge: 'reg-challenge' } }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            }
            if (url.includes('/passkey/register/verify')) {
              return new Response(
                JSON.stringify({
                  account: { registered: true, signedIn: true, passkeyCount: 1 },
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
              )
            }
            if (url.includes('/link')) {
              return new Response(JSON.stringify({ state: mockPlanState }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            }
            return new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // 3. beginPasskeyRegistration: POST /passkey/register/options goes through api() while authBlocked=true
          const regOptions = await client.beginPasskeyRegistration()
          assert.equal(regOptions.challenge, 'reg-challenge')
          assert.ok(
            fetchCalls.some((c) => c.url.includes('/passkey/register/options')),
            'beginPasskeyRegistration successfully sent request through api()',
          )

          // 4. finishPasskeyRegistration: POST /passkey/register/verify goes through api() while authBlocked=true
          const regResult = await client.finishPasskeyRegistration({ id: 'cred-2' })
          assert.equal(regResult.registered, true)
          assert.ok(
            fetchCalls.some((c) => c.url.includes('/passkey/register/verify')),
            'finishPasskeyRegistration successfully sent request through api()',
          )
          assert.equal(client.isStudySyncBlocked(), false, 'Successful passkey registration unlatches authBlocked')

          // Re-latch authBlocked
          nextStatus = 401
          customFetchHandler = null
          await client.syncStudyPlan()
          assert.equal(client.isStudySyncBlocked(), true, 'Re-latched to authBlocked=true')

          customFetchHandler = (url) => {
            if (url.includes('/link')) {
              return new Response(JSON.stringify({ state: mockPlanState }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            }
            return new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // 5. linkStudyDevice: POST /link goes through api() while authBlocked=true
          const linkResult = await client.linkStudyDevice('a'.repeat(64))
          assert.ok(linkResult.startDate, 'Link succeeded')
          assert.ok(
            fetchCalls.some((c) => c.url.includes('/link')),
            'linkStudyDevice successfully sent request through api()',
          )
          assert.equal(client.isStudySyncBlocked(), false, 'Successful sync link unlatches authBlocked')
        } finally {
          customFetchHandler = null
        }
      },
    )

    // -------------------------------------------------------------------------
    // 4. After in-page sign-in, locally queued operations are sent without user action
    // -------------------------------------------------------------------------
    await t.test('after successful in-page sign-in, locally queued operations are sent without further user action', async () => {
      resetStorage()
      fetchCalls = []
      setGuestMode(false)

      // User performs local actions while not in guest mode
      client.addStudyMinutes('2026-10-08', 'grammar', 30)
      assert.ok(client.getStudySyncSnapshot().pending > 0, 'Mutations are queued locally')

      // Sync attempts and fails with 401, latching authBlocked
      nextStatus = 401
      nextBody = { code: 'LOGIN_REQUIRED' }
      for (let i = 0; i < 20 && !client.isStudySyncBlocked(); i++) {
        await new Promise((resolve) => origSetTimeout(resolve, 5))
      }
      assert.equal(client.isStudySyncBlocked(), true, 'AuthBlocked is latched')
      assert.ok(client.getStudySyncSnapshot().pending > 0, 'Queued mutations are preserved')

      // AuthGate sets guestMode to true upon detecting required auth
      setGuestMode(true)
      assert.equal(isGuestMode(), true, 'Guest mode is active')

      // Now user successfully signs in on the same page:
      // Backend now accepts requests (status 200)
      nextStatus = 200
      nextBody = { state: mockPlanState }
      const callsBeforeSignIn = fetchCalls.length

      // Sign-in completion triggers setGuestMode(false) (transition true -> false)
      setGuestMode(false)

      // Without any explicit user action, onGuestModeChange unlatches authBlocked and drains queue
      for (let i = 0; i < 20 && client.getStudySyncSnapshot().pending > 0; i++) {
        await new Promise((resolve) => origSetTimeout(resolve, 5))
      }

      assert.ok(fetchCalls.length > callsBeforeSignIn, 'Sync request was dispatched automatically')
      const patchCall = fetchCalls.find((c) => c.options?.method === 'PATCH')
      assert.ok(patchCall, 'PATCH request containing queued operations was sent')
      assert.equal(client.getStudySyncSnapshot().pending, 0, 'Pending queue was drained')
      assert.equal(client.isStudySyncBlocked(), false, 'AuthBlocked is unlatched')
    })

    // -------------------------------------------------------------------------
    // 5. Guest mode confirms enqueue returns early and no failing request happens
    // -------------------------------------------------------------------------
    await t.test('guest mode prevents enqueue and flush from making network requests', async () => {
      resetStorage()
      setGuestMode(true)
      fetchCalls = []

      // Explicit user action while in guest mode
      client.addStudyMinutes('2026-10-09', 'vocab', 15)

      // Confirm no pending items were stored
      assert.equal(
        Object.keys(storage).some((k) => k.includes('pending:')),
        false,
        'No operations queued in guest mode',
      )
      assert.equal(fetchCalls.length, 0, 'No network requests made in guest mode')

      // flushStudyProgress in guest mode returns early without requests
      const snapshot = await client.flushStudyProgress()
      assert.equal(fetchCalls.length, 0, 'flushStudyProgress makes no request in guest mode')
      assert.equal(snapshot.pending, 0)
    })
  } finally {
    globalThis.setTimeout = origSetTimeout
    globalThis.clearTimeout = origClearTimeout
  }
})
