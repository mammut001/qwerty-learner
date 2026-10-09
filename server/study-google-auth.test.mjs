import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'

const ORIGIN = 'http://localhost:5173'

function createMockVerifier(usersByToken = {}, errorByToken = {}) {
  return {
    async verify(token) {
      if (errorByToken[token]) {
        throw new Error(errorByToken[token])
      }
      const user = usersByToken[token]
      if (!user) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }
      return {
        uid: user.uid,
        email: user.email.toLowerCase(),
        name: user.name || '',
        picture: user.picture || '',
      }
    },
  }
}

async function withServer(options, run) {
  const dir = mkdtempSync(join(tmpdir(), 'study-auth-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: ORIGIN,
    metricsToken: 'test-metrics',
    slowRequestMs: 0,
    ...options,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const call = async (method, path, { body, cookie = '', origin = ORIGIN, headers = {} } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: origin,
        Cookie: cookie,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    let data = null
    try {
      data = JSON.parse(text)
    } catch {}
    const setCookie = response.headers.get('set-cookie') || ''
    const cookieToken = setCookie ? setCookie.split(';')[0] : ''
    return { response, data, setCookie, cookieToken }
  }
  try {
    await run(call, { base, database })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
}

test('GET auth is disabled by default, reflects flags, and never sets a cookie', async () => {
  // Disabled by default
  await withServer({}, async (call) => {
    const res = await call('GET', '/api/study-plan/auth')
    assert.equal(res.response.status, 200)
    assert.deepEqual(res.data, {
      enabled: false,
      required: false,
      signedIn: false,
      user: null,
    })
    assert.equal(res.setCookie, '', 'must not set a cookie')
  })

  // Enabled and required flags
  const verifier = createMockVerifier()
  await withServer({ firebaseVerifier: verifier, authRequired: true }, async (call) => {
    const res = await call('GET', '/api/study-plan/auth')
    assert.equal(res.response.status, 200)
    assert.deepEqual(res.data, {
      enabled: true,
      required: true,
      signedIn: false,
      user: null,
    })
    assert.equal(res.setCookie, '', 'must not set a cookie')
  })
})

test('First sign-in adopts initialized anonymous learner; second sign-in returns same data; different user gets separate data', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice', picture: 'https://pic/a' },
    'token-bob': { uid: 'bob-uid', email: 'bob@example.com', name: 'Bob', picture: 'https://pic/b' },
  }
  const verifier = createMockVerifier(users)

  await withServer({ firebaseVerifier: verifier }, async (call) => {
    // 1. Anonymous user loads plan and writes state
    const anon = await call('GET', '/api/study-plan')
    assert.equal(anon.response.status, 200)
    const anonCookie = anon.cookieToken
    assert.ok(anonCookie.startsWith('study_session='))

    const state = {
      startDate: '2026-10-01',
      minutes: { '2026-10-05': { 'sat-retell': 45 } },
      minimumMode: {},
    }
    const updateRes = await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })
    assert.equal(updateRes.response.status, 200)

    // 2. Alice signs in from this browser: adopts the initialized anonymous learner
    const loginAlice = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(loginAlice.response.status, 200)
    assert.equal(loginAlice.data.signedIn, true)
    assert.equal(loginAlice.data.created, true)
    assert.equal(loginAlice.data.adopted, true)
    assert.equal(loginAlice.data.linked, false)
    assert.match(loginAlice.data.user.id, /^[0-9a-f]{16}$/)
    assert.deepEqual(loginAlice.data.user, {
      id: loginAlice.data.user.id,
      email: 'alice@example.com',
      name: 'Alice',
      picture: 'https://pic/a',
    })
    const aliceCookie = loginAlice.cookieToken
    assert.ok(aliceCookie.startsWith('study_session='))

    // Alice's plan has the adopted state
    const alicePlan = await call('GET', '/api/study-plan', { cookie: aliceCookie })
    assert.equal(alicePlan.response.status, 200)
    assert.equal(alicePlan.data.state.minutes['2026-10-05']['sat-retell'], 45)

    // GET /api/study-plan/auth for Alice reports signedIn with user profile
    const aliceAuth = await call('GET', '/api/study-plan/auth', { cookie: aliceCookie })
    assert.equal(aliceAuth.data.signedIn, true)
    assert.deepEqual(aliceAuth.data.user, {
      id: loginAlice.data.user.id,
      email: 'alice@example.com',
      name: 'Alice',
      picture: 'https://pic/a',
    })

    // 3. Second sign-in of Alice from a clean browser (no cookie) returns same learner
    const aliceCleanLogin = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    assert.equal(aliceCleanLogin.response.status, 200)
    assert.equal(aliceCleanLogin.data.signedIn, true)
    assert.equal(aliceCleanLogin.data.created, false)
    assert.equal(aliceCleanLogin.data.adopted, false)
    const aliceSecondCookie = aliceCleanLogin.cookieToken

    const aliceSecondPlan = await call('GET', '/api/study-plan', { cookie: aliceSecondCookie })
    assert.equal(aliceSecondPlan.data.state.minutes['2026-10-05']['sat-retell'], 45)

    // 4. Bob signs in from a clean browser: creates fresh learner, cannot see Alice's state
    const bobLogin = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-bob' },
    })
    assert.equal(bobLogin.response.status, 200)
    assert.equal(bobLogin.data.created, true)
    assert.equal(bobLogin.data.adopted, false)
    const bobCookie = bobLogin.cookieToken

    const bobPlan = await call('GET', '/api/study-plan', { cookie: bobCookie })
    assert.equal(bobPlan.data.state, null, "Bob has fresh empty state, cannot see Alice's state")

    // 5. User signs in with Alice's old anonymous cookie: must NOT adopt Alice's learner again
    const users2 = {
      'token-charlie': { uid: 'charlie-uid', email: 'charlie@example.com', name: 'Charlie', picture: '' },
    }
    Object.assign(users, users2)

    const charlieLoginWithAnon = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-charlie' },
    })
    assert.equal(charlieLoginWithAnon.response.status, 200)
    assert.equal(charlieLoginWithAnon.data.adopted, false, 'cannot adopt an already-owned learner')
    assert.equal(charlieLoginWithAnon.data.created, true)
    const charlieCookie = charlieLoginWithAnon.cookieToken

    const charliePlan = await call('GET', '/api/study-plan', { cookie: charlieCookie })
    assert.equal(charliePlan.data.state, null, 'Charlie gets fresh learner')
  })
})

test('First sign-in with uninitialized cookie creates fresh learner without adopting', async () => {
  const verifier = createMockVerifier({
    'token-dave': { uid: 'dave-uid', email: 'dave@example.com' },
  })

  await withServer({ firebaseVerifier: verifier }, async (call) => {
    // Visitor GETs plan once (creates anonymous learner row with state=null)
    const anon = await call('GET', '/api/study-plan')
    const anonCookie = anon.cookieToken

    // Dave signs in with uninitialized cookie
    const daveLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-dave' },
    })
    assert.equal(daveLogin.response.status, 200)
    assert.equal(daveLogin.data.created, true)
    assert.equal(daveLogin.data.adopted, false, 'uninitialized state is not adopted')
  })
})

test('Logout clears session cookie and deletes account session', async () => {
  const verifier = createMockVerifier({
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com' },
  })

  // 1. Account session logout deletes account session and sends clearing Set-Cookie
  await withServer({ firebaseVerifier: verifier, authRequired: true }, async (call) => {
    const login = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    const cookie = login.cookieToken

    // Logout
    const logout = await call('POST', '/api/study-plan/auth/logout', {
      cookie,
      body: {},
    })
    assert.equal(logout.response.status, 200)
    assert.deepEqual(logout.data, { signedIn: false })
    assert.match(logout.setCookie, /study_session=;\s*Path=\/api;/)
    assert.match(logout.setCookie, /Max-Age=0/)

    // Using the logged-out cookie in required mode gets 401 LOGIN_REQUIRED
    const planAfterLogout = await call('GET', '/api/study-plan', { cookie })
    assert.equal(planAfterLogout.response.status, 401)
    assert.equal(planAfterLogout.data.code, 'LOGIN_REQUIRED')
  })

  // 2. Anonymous learner token calling logout must NOT clear cookie
  await withServer({ firebaseVerifier: verifier, authRequired: false }, async (call) => {
    const anon = await call('GET', '/api/study-plan')
    const anonCookie = anon.cookieToken
    assert.ok(anonCookie.startsWith('study_session='))

    const anonLogout = await call('POST', '/api/study-plan/auth/logout', {
      cookie: anonCookie,
      body: {},
    })
    assert.equal(anonLogout.response.status, 200)
    assert.deepEqual(anonLogout.data, { signedIn: false })
    assert.equal(anonLogout.setCookie, '', 'must not clear anonymous session cookie')

    // Anonymous session remains valid and active
    const planAfterAnon = await call('GET', '/api/study-plan', { cookie: anonCookie })
    assert.equal(planAfterAnon.response.status, 200)
  })
})

test('Verifier errors, allow-list, rate limits, body validation, methods, and cross-origin checks', async () => {
  const users = {
    'token-allowed': { uid: 'u1', email: 'allowed@example.com' },
    'token-disallowed': { uid: 'u2', email: 'blocked@example.com' },
  }
  const errors = {
    'token-invalid': 'FIREBASE_TOKEN_INVALID',
    'token-expired': 'FIREBASE_TOKEN_EXPIRED',
    'token-keys-fail': 'FIREBASE_KEYS_UNAVAILABLE',
  }
  const verifier = createMockVerifier(users, errors)

  await withServer({
    firebaseVerifier: verifier,
    allowedEmails: 'allowed@example.com, other@example.com',
    maxNewAccountsPerDay: 2,
  }, async (call) => {
    // 1. Verifier failure -> 401 with code
    const inv = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-invalid' } })
    assert.equal(inv.response.status, 401)
    assert.equal(inv.data.code, 'FIREBASE_TOKEN_INVALID')

    const exp = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-expired' } })
    assert.equal(exp.response.status, 401)
    assert.equal(exp.data.code, 'FIREBASE_TOKEN_EXPIRED')

    // 503 for FIREBASE_KEYS_UNAVAILABLE
    const keysFail = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-keys-fail' } })
    assert.equal(keysFail.response.status, 503)
    assert.equal(keysFail.data.code, 'FIREBASE_KEYS_UNAVAILABLE')

    // 2. Allow-list miss -> 403 EMAIL_NOT_ALLOWED
    const blocked = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-disallowed' } })
    assert.equal(blocked.response.status, 403)
    assert.equal(blocked.data.code, 'EMAIL_NOT_ALLOWED')

    // 3. Body validation -> 400
    const emptyBody = await call('POST', '/api/study-plan/auth/firebase', { body: {} })
    assert.equal(emptyBody.response.status, 400)
    assert.equal(emptyBody.data.code, 'AUTH_REQUEST_INVALID')

    const extraKeys = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-allowed', extra: 1 } })
    assert.equal(extraKeys.response.status, 400)
    assert.equal(extraKeys.data.code, 'AUTH_REQUEST_INVALID')

    // 4. Method check -> 405
    const getFirebase = await call('GET', '/api/study-plan/auth/firebase')
    assert.equal(getFirebase.response.status, 405)

    const postAuth = await call('POST', '/api/study-plan/auth', { body: {} })
    assert.equal(postAuth.response.status, 405)

    const getLogout = await call('GET', '/api/study-plan/auth/logout')
    assert.equal(getLogout.response.status, 405)

    // 5. Cross-origin POST rejected -> 403
    const crossOrigin = await call('POST', '/api/study-plan/auth/firebase', {
      origin: 'https://evil.invalid',
      body: { idToken: 'token-allowed' },
    })
    assert.equal(crossOrigin.response.status, 403)

    // 6. Rate limit on login: 10 attempts per 5 min -> 11th gets 429
    for (let i = 0; i < 5; i++) {
      await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-invalid' } })
    }
    const rateLimited = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-invalid' } })
    assert.equal(rateLimited.response.status, 429)
    assert.equal(rateLimited.data.code, 'AUTH_RATE_LIMITED')
    assert.ok(rateLimited.data.retryAfterSeconds > 0)
  })

  // Global new-account cap
  await withServer({
    firebaseVerifier: createMockVerifier({
      'u1': { uid: 'u1', email: 'u1@example.com' },
      'u2': { uid: 'u2', email: 'u2@example.com' },
      'u3': { uid: 'u3', email: 'u3@example.com' },
    }),
    maxNewAccountsPerDay: 2,
  }, async (call) => {
    const s1 = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'u1' } })
    assert.equal(s1.response.status, 200)
    assert.equal(s1.data.created, true)

    const s2 = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'u2' } })
    assert.equal(s2.response.status, 200)
    assert.equal(s2.data.created, true)

    const s3 = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'u3' } })
    assert.equal(s3.response.status, 429)
    assert.equal(s3.data.code, 'SIGNUP_LIMIT_REACHED')
  })
})

test('Login-required mode gates all data routes and third-party cost routes', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com' },
  }
  const verifier = createMockVerifier(users)
  const youdaoLookup = async (q) => ({ value: { word: q, explanation: 'bonjour' } })
  const dummyAudio = Buffer.alloc(300, 0x42)
  const youdaoVoice = async () => ({ buffer: dummyAudio })

  await withServer({
    firebaseVerifier: verifier,
    authRequired: true,
    youdaoLookup,
    youdaoVoice,
  }, async (call) => {
    // Anonymous GET of plan -> 401 LOGIN_REQUIRED, NO Set-Cookie
    const anonPlan = await call('GET', '/api/study-plan')
    assert.equal(anonPlan.response.status, 401)
    assert.equal(anonPlan.data.code, 'LOGIN_REQUIRED')
    assert.equal(anonPlan.setCookie, '')

    // Dictionary when anonymous -> 401 LOGIN_REQUIRED
    const anonDict = await call('GET', '/api/study-plan/dictionary?q=bonjour')
    assert.equal(anonDict.response.status, 401)
    assert.equal(anonDict.data.code, 'LOGIN_REQUIRED')

    // Dictionary voice when anonymous -> 401 LOGIN_REQUIRED
    const anonVoice = await call('GET', '/api/study-plan/dictionary/voice?q=bonjour')
    assert.equal(anonVoice.response.status, 401)
    assert.equal(anonVoice.data.code, 'LOGIN_REQUIRED')

    // Echelle evaluate when anonymous -> 401 LOGIN_REQUIRED
    const anonEval = await call('POST', '/api/study-plan/echelle/evaluate', {
      body: { submission: { kind: 'writing', itemId: 'w1' } },
    })
    assert.equal(anonEval.response.status, 401)
    assert.equal(anonEval.data.code, 'LOGIN_REQUIRED')

    // Sync link -> 403 SYNC_LINK_DISABLED
    const syncLink = await call('POST', '/api/study-plan/link', {
      body: { key: 'a'.repeat(64) },
    })
    assert.equal(syncLink.response.status, 403)
    assert.equal(syncLink.data.code, 'SYNC_LINK_DISABLED')

    // Passkey login options is still reachable without login
    const passkeyOpt = await call('POST', '/api/study-plan/passkey/login/options', { body: {} })
    assert.equal(passkeyOpt.response.status, 200)

    // Sign in with Google
    const login = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    assert.equal(login.response.status, 200)
    const cookie = login.cookieToken

    // Signed in: plan is reachable
    const signedInPlan = await call('GET', '/api/study-plan', { cookie })
    assert.equal(signedInPlan.response.status, 200)

    // Signed in: dictionary is reachable
    const signedInDict = await call('GET', '/api/study-plan/dictionary?q=bonjour', { cookie })
    assert.equal(signedInDict.response.status, 200)
    assert.equal(signedInDict.data.word, 'bonjour')

    // Signed in: dictionary voice is reachable
    const signedInVoice = await call('GET', '/api/study-plan/dictionary/voice?q=bonjour', { cookie })
    assert.equal(signedInVoice.response.status, 200)
  })
})

test('Access-password + login combined works, and site password blocks auth routes when not granted', async () => {
  const verifier = createMockVerifier({
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com' },
  })

  await withServer({
    firebaseVerifier: verifier,
    authRequired: true,
    accessPassword: 'secret-password',
  }, async (call) => {
    // Auth routes blocked with 401 ACCESS_REQUIRED when password not entered
    const authGet = await call('GET', '/api/study-plan/auth')
    assert.equal(authGet.response.status, 401)
    assert.equal(authGet.data.code, 'ACCESS_REQUIRED')

    const authLogin = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-alice' } })
    assert.equal(authLogin.response.status, 401)
    assert.equal(authLogin.data.code, 'ACCESS_REQUIRED')

    const authLogout = await call('POST', '/api/study-plan/auth/logout', { body: {} })
    assert.equal(authLogout.response.status, 401)
    assert.equal(authLogout.data.code, 'ACCESS_REQUIRED')

    // 1. Grant access password
    const accessRes = await call('POST', '/api/study-plan/access', { body: { password: 'secret-password' } })
    assert.equal(accessRes.response.status, 200)
    const accessCookie = accessRes.cookieToken
    assert.ok(accessCookie.startsWith('study_access='))

    // 2. Now GET auth is allowed
    const authWithPass = await call('GET', '/api/study-plan/auth', { cookie: accessCookie })
    assert.equal(authWithPass.response.status, 200)
    assert.equal(authWithPass.data.enabled, true)
    assert.equal(authWithPass.data.signedIn, false)

    // 3. Login with Google using access cookie
    const loginRes = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: accessCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(loginRes.response.status, 200)
    const sessionCookie = loginRes.cookieToken
    assert.ok(sessionCookie.startsWith('study_session='))

    // 4. Access plan with both cookies
    const fullCookies = `${accessCookie}; ${sessionCookie}`
    const planRes = await call('GET', '/api/study-plan', { cookie: fullCookies })
    assert.equal(planRes.response.status, 200)
  })
})

test('Linking Google identity to existing passkey account', async () => {
  const verifier = createMockVerifier({
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
  })

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    // Set up an existing passkey account
    const initial = await call('GET', '/api/study-plan')
    const anonCookie = initial.cookieToken
    const state = { startDate: '2026-10-01', minutes: {}, minimumMode: {} }
    await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })

    const regOpts = await call('POST', '/api/study-plan/passkey/register/options', { cookie: anonCookie, body: {} })
    assert.equal(regOpts.response.status, 200)

    // Import helper to create a valid passkey fixture
    const { createPasskeyFixture } = await import('./study-passkey-test-helper.mjs')
    const fixture = await createPasskeyFixture(ORIGIN)
    const registration = await fixture.registration(regOpts.data.options.challenge)

    const verifyPasskey = await call('POST', '/api/study-plan/passkey/register/verify', {
      cookie: anonCookie,
      body: { credential: registration },
    })
    assert.equal(verifyPasskey.response.status, 200)
    const passkeyCookie = verifyPasskey.cookieToken

    // Verify GET /api/study-plan/auth with passkey session: signedIn: true, user with id
    const authPasskeyOnly = await call('GET', '/api/study-plan/auth', { cookie: passkeyCookie })
    assert.equal(authPasskeyOnly.data.signedIn, true)
    assert.match(authPasskeyOnly.data.user.id, /^[0-9a-f]{16}$/)
    assert.deepEqual(authPasskeyOnly.data.user, {
      id: authPasskeyOnly.data.user.id,
      email: '',
      name: '',
      picture: '',
    })

    // Now sign in with Google presenting the passkey account session
    const googleLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: passkeyCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(googleLogin.response.status, 200)
    assert.equal(googleLogin.data.created, false)
    assert.equal(googleLogin.data.adopted, false)
    assert.equal(googleLogin.data.linked, true, 'linked Google identity to existing passkey account')
    assert.equal(googleLogin.data.user.id, authPasskeyOnly.data.user.id)
    const linkedCookie = googleLogin.cookieToken

    // GET /api/study-plan/auth now shows signedIn: true, user: Alice with same id
    const authLinked = await call('GET', '/api/study-plan/auth', { cookie: linkedCookie })
    assert.equal(authLinked.data.signedIn, true)
    assert.equal(authLinked.data.user.id, authPasskeyOnly.data.user.id)
    assert.equal(authLinked.data.user.email, 'alice@example.com')

    // Account still retains passkey count
    const accountInfo = await call('GET', '/api/study-plan/account', { cookie: linkedCookie })
    assert.equal(accountInfo.response.status, 200)
    assert.equal(accountInfo.data.passkeyCount, 1)
  })
})

test('DELETE /api/study-plan/data cleans up account_identities and account data', async () => {
  const verifier = createMockVerifier({
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
  })

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    const login = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    assert.equal(login.response.status, 200)
    const cookie = login.cookieToken

    // Verify account_identities row exists in db
    const { DatabaseSync } = await import('node:sqlite')
    const db = new DatabaseSync(database)
    assert.equal(
      db.prepare("SELECT COUNT(*) AS count FROM account_identities WHERE provider='google' AND subject='alice-uid'").get().count,
      1,
    )
    db.close()

    // Delete data
    const del = await call('DELETE', '/api/study-plan/data', {
      cookie,
      body: { confirm: 'DELETE' },
    })
    assert.equal(del.response.status, 200)
    assert.deepEqual(del.data, { deleted: true })

    // Verify account_identities row was deleted
    const dbAfter = new DatabaseSync(database)
    assert.equal(
      dbAfter.prepare("SELECT COUNT(*) AS count FROM account_identities WHERE provider='google' AND subject='alice-uid'").get().count,
      0,
      'account_identities row deleted with account',
    )
    assert.equal(dbAfter.prepare('SELECT COUNT(*) AS count FROM accounts').get().count, 0)
    dbAfter.close()
  })
})

test('Anonymous learner with passkey-style account links Google identity using anonymous cookie and retains state', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
  }
  const verifier = createMockVerifier(users)

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    // 1. Anonymous learner writes state
    const initial = await call('GET', '/api/study-plan')
    const anonCookie = initial.cookieToken
    assert.ok(anonCookie.startsWith('study_session='))
    const state = {
      startDate: '2026-10-01',
      minutes: { '2026-10-05': { 'sat-retell': 45 } },
      minimumMode: {},
    }
    await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })

    // Create sync key to verify it is revoked upon linking
    const syncRes = await call('POST', '/api/study-plan/sync-key', { cookie: anonCookie, body: {} })
    assert.equal(syncRes.response.status, 200)
    const syncKey = syncRes.data.key

    // 2. Registers passkey-style account
    const regOpts = await call('POST', '/api/study-plan/passkey/register/options', { cookie: anonCookie, body: {} })
    assert.equal(regOpts.response.status, 200)

    const { createPasskeyFixture } = await import('./study-passkey-test-helper.mjs')
    const fixture = await createPasskeyFixture(ORIGIN)
    const registration = await fixture.registration(regOpts.data.options.challenge)

    const verifyPasskey = await call('POST', '/api/study-plan/passkey/register/verify', {
      cookie: anonCookie,
      body: { credential: registration },
    })
    assert.equal(verifyPasskey.response.status, 200)

    // 3. Keeps using the original anonymous cookie and signs in with Google
    const googleLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(googleLogin.response.status, 200)
    assert.equal(googleLogin.data.signedIn, true)
    assert.equal(googleLogin.data.created, false)
    assert.equal(googleLogin.data.adopted, false)
    assert.equal(googleLogin.data.linked, true)
    assert.equal(googleLogin.data.user.email, 'alice@example.com')

    // Returned cookie shows the same plan state
    const linkedCookie = googleLogin.cookieToken
    assert.ok(linkedCookie.startsWith('study_session='))
    const linkedPlan = await call('GET', '/api/study-plan', { cookie: linkedCookie })
    assert.equal(linkedPlan.response.status, 200)
    assert.equal(linkedPlan.data.state.minutes['2026-10-05']['sat-retell'], 45)

    // Verify sync key was revoked upon linking
    const { DatabaseSync } = await import('node:sqlite')
    const { createHash } = await import('node:crypto')
    const db = new DatabaseSync(database)
    const keyHash = createHash('sha256').update(syncKey).digest('hex')
    const syncRow = db.prepare('SELECT revoked FROM sync_keys WHERE key_hash=?').get(keyHash)
    assert.equal(syncRow.revoked, 1, 'sync key is revoked like the adopt path')
    db.close()

    // 4. A later Google sign-in from a clean browser reaches the same state
    const cleanLogin = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    assert.equal(cleanLogin.response.status, 200)
    assert.equal(cleanLogin.data.signedIn, true)
    assert.equal(cleanLogin.data.created, false)
    assert.equal(cleanLogin.data.adopted, false)
    assert.equal(cleanLogin.data.linked, false)
    const cleanCookie = cleanLogin.cookieToken

    const cleanPlan = await call('GET', '/api/study-plan', { cookie: cleanCookie })
    assert.equal(cleanPlan.response.status, 200)
    assert.equal(cleanPlan.data.state.minutes['2026-10-05']['sat-retell'], 45)
  })
})

test('Anonymous cookie for account with existing Google identity creates fresh learner and does not merge', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
    'token-bob': { uid: 'bob-uid', email: 'bob@example.com', name: 'Bob' },
  }
  const verifier = createMockVerifier(users)

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    // 1. Anonymous learner writes state
    const initial = await call('GET', '/api/study-plan')
    const anonCookie = initial.cookieToken
    assert.ok(anonCookie.startsWith('study_session='))
    const state = {
      startDate: '2026-10-01',
      minutes: { '2026-10-05': { 'sat-retell': 45 } },
      minimumMode: {},
    }
    await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })

    // 2. Registers passkey-style account
    const regOpts = await call('POST', '/api/study-plan/passkey/register/options', { cookie: anonCookie, body: {} })
    assert.equal(regOpts.response.status, 200)

    const { createPasskeyFixture } = await import('./study-passkey-test-helper.mjs')
    const fixture = await createPasskeyFixture(ORIGIN)
    const registration = await fixture.registration(regOpts.data.options.challenge)

    const verifyPasskey = await call('POST', '/api/study-plan/passkey/register/verify', {
      cookie: anonCookie,
      body: { credential: registration },
    })
    assert.equal(verifyPasskey.response.status, 200)

    // 3. The account is linked to Alice's Google identity
    const aliceLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: verifyPasskey.cookieToken,
      body: { idToken: 'token-alice' },
    })
    assert.equal(aliceLogin.response.status, 200)
    assert.equal(aliceLogin.data.linked, true)

    // 4. Bob presents the original anonymous cookie and signs in with Google
    const bobLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-bob' },
    })
    assert.equal(bobLogin.response.status, 200)
    assert.equal(bobLogin.data.signedIn, true)
    assert.equal(bobLogin.data.created, true)
    assert.equal(bobLogin.data.adopted, false)
    assert.equal(bobLogin.data.linked, false)
    assert.equal(bobLogin.data.user.email, 'bob@example.com')

    // 5. Bob gets a fresh empty learner and cannot see the state
    const bobCookie = bobLogin.cookieToken
    const bobPlan = await call('GET', '/api/study-plan', { cookie: bobCookie })
    assert.equal(bobPlan.response.status, 200)
    assert.equal(bobPlan.data.state, null, 'Bob gets fresh empty learner and cannot see state')

    // Bob signing in again from a clean browser reaches Bob's own empty state
    const bobCleanLogin = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-bob' },
    })
    assert.equal(bobCleanLogin.response.status, 200)
    const bobCleanPlan = await call('GET', '/api/study-plan', { cookie: bobCleanLogin.cookieToken })
    assert.equal(bobCleanPlan.response.status, 200)
    assert.equal(bobCleanPlan.data.state, null)

    // Alice's data is still intact
    const aliceCleanLogin = await call('POST', '/api/study-plan/auth/firebase', {
      body: { idToken: 'token-alice' },
    })
    assert.equal(aliceCleanLogin.response.status, 200)
    const alicePlan = await call('GET', '/api/study-plan', { cookie: aliceCleanLogin.cookieToken })
    assert.equal(alicePlan.response.status, 200)
    assert.equal(alicePlan.data.state.minutes['2026-10-05']['sat-retell'], 45)
  })
})

test('Anonymous cookie for account with null state links Google identity', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
  }
  const verifier = createMockVerifier(users)

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    // Visitor loads plan (creates anonymous learner row with state=null)
    const initial = await call('GET', '/api/study-plan')
    const anonCookie = initial.cookieToken
    assert.ok(anonCookie.startsWith('study_session='))

    // Directly insert an accounts row for this learner (passkey-style account with state=null)
    const { DatabaseSync } = await import('node:sqlite')
    const { createHash, randomBytes } = await import('node:crypto')
    const hash = (v) => createHash('sha256').update(v).digest('hex')
    const token = anonCookie.replace('study_session=', '')
    const learnerId = hash(token)
    const accountId = 'acc-' + randomBytes(8).toString('hex')

    const db = new DatabaseSync(database)
    db.prepare('INSERT INTO accounts(id, learner, user_handle, created_at) VALUES(?,?,?,?)')
      .run(accountId, learnerId, 'handle-' + randomBytes(8).toString('hex'), Date.now())
    db.close()

    // Sign in with Google using anonCookie: should link even though state is null
    const login = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: anonCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(login.response.status, 200)
    assert.equal(login.data.signedIn, true)
    assert.equal(login.data.created, false)
    assert.equal(login.data.adopted, false)
    assert.equal(login.data.linked, true)
    assert.equal(login.data.user.email, 'alice@example.com')
  })
})

test('Device presenting sync-key link cookie links to existing passkey account and revokes sync keys', async () => {
  const users = {
    'token-alice': { uid: 'alice-uid', email: 'alice@example.com', name: 'Alice' },
  }
  const verifier = createMockVerifier(users)

  await withServer({ firebaseVerifier: verifier }, async (call, { database }) => {
    // 1. Initial learner with state and sync key
    const initial = await call('GET', '/api/study-plan')
    const anonCookie = initial.cookieToken
    const state = {
      startDate: '2026-10-01',
      minutes: { '2026-10-05': { 'sat-retell': 45 } },
      minimumMode: {},
    }
    await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })

    const syncKeyRes = await call('POST', '/api/study-plan/sync-key', { cookie: anonCookie, body: {} })
    assert.equal(syncKeyRes.response.status, 200)
    const syncKey = syncKeyRes.data.key

    // 2. Register passkey account for this learner
    const regOpts = await call('POST', '/api/study-plan/passkey/register/options', { cookie: anonCookie, body: {} })
    const { createPasskeyFixture } = await import('./study-passkey-test-helper.mjs')
    const fixture = await createPasskeyFixture(ORIGIN)
    const registration = await fixture.registration(regOpts.data.options.challenge)
    await call('POST', '/api/study-plan/passkey/register/verify', {
      cookie: anonCookie,
      body: { credential: registration },
    })

    // 3. Second device links with sync key (cookie is study_session=<syncKey>)
    const linkDevice = await call('POST', '/api/study-plan/link', { body: { key: syncKey } })
    assert.equal(linkDevice.response.status, 200)
    const syncDeviceCookie = linkDevice.cookieToken
    assert.ok(syncDeviceCookie.startsWith('study_session='))

    // 4. Second device signs in with Google using sync-key cookie
    const googleLogin = await call('POST', '/api/study-plan/auth/firebase', {
      cookie: syncDeviceCookie,
      body: { idToken: 'token-alice' },
    })
    assert.equal(googleLogin.response.status, 200)
    assert.equal(googleLogin.data.signedIn, true)
    assert.equal(googleLogin.data.created, false)
    assert.equal(googleLogin.data.adopted, false)
    assert.equal(googleLogin.data.linked, true)

    // Plan state is visible with new session cookie
    const accountCookie = googleLogin.cookieToken
    const plan = await call('GET', '/api/study-plan', { cookie: accountCookie })
    assert.equal(plan.response.status, 200)
    assert.equal(plan.data.state.minutes['2026-10-05']['sat-retell'], 45)

    // Sync key is now revoked
    const { DatabaseSync } = await import('node:sqlite')
    const { createHash } = await import('node:crypto')
    const db = new DatabaseSync(database)
    const keyHash = createHash('sha256').update(syncKey).digest('hex')
    const syncRow = db.prepare('SELECT revoked FROM sync_keys WHERE key_hash=?').get(keyHash)
    assert.equal(syncRow.revoked, 1, 'sync key was revoked')
    db.close()
  })
})



