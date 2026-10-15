import assert from 'node:assert/strict'
import { createHash, generateKeyPairSync, sign as signData } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { createAppleVerifier } from './study-apple.mjs'
import { createStudyServer } from './study-plan.mjs'

const ORIGIN = 'http://localhost:5173'
const CLIENT_ID = 'top.paytonpei.french.web'
const REDIRECT_URI = 'https://french.paytonpei.top/api/study-plan/auth/apple/callback'
const APPLE_ORIGIN = 'https://appleid.apple.com'
const APPLE_EMAIL = 'alice@privaterelay.appleid.com'

const sha256Hex = (value) => createHash('sha256').update(value).digest('hex')
const b64url = (value) => Buffer.from(value).toString('base64url')

// One RSA key pair per file. The fake JWKS endpoint serves its public half under KID.
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const KID = 'test-kid-1'
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' }

const { privateKey: otherPrivateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })

function fakeAppleFetch(getKeys = () => [jwk], counter = { count: 0 }) {
  const fetchImpl = async () => {
    counter.count += 1
    return {
      ok: true,
      headers: new Headers({ 'cache-control': 'max-age=3600' }),
      json: async () => ({ keys: getKeys() }),
    }
  }
  return { fetchImpl, counter }
}

// Builds an id_token signed with RS256. Claims default to a valid token; pass overrides to break one thing.
function signToken(claims = {}, { key = privateKey, kid = KID, alg = 'RS256' } = {}) {
  const now = Math.floor(Date.now() / 1000)
  const body = {
    iss: 'https://appleid.apple.com',
    aud: CLIENT_ID,
    sub: 'apple-user-1',
    iat: now,
    exp: now + 600,
    email: APPLE_EMAIL,
    email_verified: 'true',
    is_private_email: 'true',
    ...claims,
  }
  const headerPart = b64url(JSON.stringify({ alg, kid }))
  const payloadPart = b64url(JSON.stringify(body))
  const signature = signData('sha256', Buffer.from(`${headerPart}.${payloadPart}`), key).toString('base64url')
  return `${headerPart}.${payloadPart}.${signature}`
}

const appleVerifier = () => createAppleVerifier({ clientId: CLIENT_ID, fetchImpl: fakeAppleFetch().fetchImpl })

function createMockGoogleVerifier(usersByToken = {}) {
  return {
    async verify(token) {
      const user = usersByToken[token]
      if (!user) throw new Error('FIREBASE_TOKEN_INVALID')
      return { uid: user.uid, email: user.email.toLowerCase(), name: user.name || '', picture: '' }
    },
  }
}

async function withServer(options, run) {
  const dir = mkdtempSync(join(tmpdir(), 'study-apple-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: ORIGIN,
    metricsToken: 'test-metrics',
    slowRequestMs: 0,
    appleClientId: CLIENT_ID,
    appleRedirectUri: REDIRECT_URI,
    appleVerifier: appleVerifier(),
    ...options,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`

  // JSON or bodyless request on the study origin.
  const call = async (method, path, { body, cookie = '', origin = ORIGIN, headers = {} } = {}) => {
    const response = await fetch(base + path, {
      method,
      redirect: 'manual',
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
    return { response, status: response.status, text, data, setCookies: response.headers.getSetCookie?.() ?? [] }
  }

  // Step 1: GET /start. Apple's authorize URL carries the state and the nonce parameter.
  const start = async ({ cookie = '', returnPath } = {}) => {
    const query = returnPath === undefined ? '' : `?return=${encodeURIComponent(returnPath)}`
    const res = await call('GET', `/api/study-plan/auth/apple/start${query}`, { cookie })
    assert.equal(res.status, 302, 'start redirects to Apple')
    const authorize = new URL(res.response.headers.get('location'))
    const stateCookie = res.setCookies.find((c) => c.startsWith('apple_state=')) || ''
    return {
      res,
      authorize,
      state: authorize.searchParams.get('state'),
      nonce: authorize.searchParams.get('nonce'),
      stateCookie: stateCookie.split(';')[0],
    }
  }

  // Step 2: the cross-site form_post from Apple, exactly as the browser sends it.
  const callback = async (fields, { cookie = '', origin = APPLE_ORIGIN, headers = {} } = {}) => {
    const response = await fetch(base + '/api/study-plan/auth/apple/callback', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        Origin: origin,
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Sec-Fetch-Site': 'cross-site',
        ...headers,
      },
      body: new URLSearchParams(fields).toString(),
    })
    const text = await response.text()
    return {
      status: response.status,
      contentType: response.headers.get('content-type'),
      cacheControl: response.headers.get('cache-control'),
      referrerPolicy: response.headers.get('referrer-policy'),
      text,
      ticket: /finish\?ticket=([a-f0-9]{64})/.exec(text)?.[1] ?? null,
      loginResult: /login=([a-z]+)(?:&amp;reason=([A-Z_]+))?/.exec(text)?.slice(1) ?? null,
    }
  }

  // Step 3: GET /finish, a same-site navigation.
  const finish = async (ticket, { cookie = '' } = {}) => {
    const res = await call('GET', `/api/study-plan/auth/apple/finish?ticket=${ticket}`, { cookie })
    const session = res.setCookies.find((c) => c.startsWith('study_session=')) || ''
    return {
      status: res.status,
      location: res.response.headers.get('location'),
      sessionCookie: session.split(';')[0],
      setCookies: res.setCookies,
    }
  }

  // Start, sign a token for the nonce Apple echoes, and post the callback.
  const login = async ({ cookie = '', claims = {}, user, returnPath, key, kid } = {}) => {
    const started = await start({ cookie, returnPath })
    const idToken = signToken({ nonce: started.nonce, ...claims }, { key, kid })
    const fields = { state: started.state, id_token: idToken, code: 'c'.repeat(12) }
    if (user !== undefined) fields.user = JSON.stringify(user)
    const result = await callback(fields, { cookie: started.stateCookie })
    return { started, result, idToken }
  }

  const db = () => new DatabaseSync(database)
  try {
    await run({ call, start, callback, finish, login, base, db, database })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
}

test('GET auth reports appleEnabled, and start is 404 when Apple is not configured', async () => {
  await withServer({ appleClientId: '', appleVerifier: null }, async ({ call }) => {
    const status = await call('GET', '/api/study-plan/auth')
    assert.equal(status.data.appleEnabled, false)
    const start = await call('GET', '/api/study-plan/auth/apple/start')
    assert.equal(start.status, 404)
    assert.equal(start.data.code, 'AUTH_DISABLED')
  })
  await withServer({}, async ({ call }) => {
    const status = await call('GET', '/api/study-plan/auth')
    assert.equal(status.data.appleEnabled, true)
  })
})

test('start redirects to Apple with the expected parameters and stores only hashes', async () => {
  await withServer({}, async ({ start, db }) => {
    const started = await start()
    assert.equal(started.authorize.origin, APPLE_ORIGIN)
    assert.equal(started.authorize.pathname, '/auth/authorize')
    assert.equal(started.authorize.searchParams.get('client_id'), CLIENT_ID)
    assert.equal(started.authorize.searchParams.get('redirect_uri'), REDIRECT_URI)
    assert.equal(started.authorize.searchParams.get('response_type'), 'code id_token')
    assert.equal(started.authorize.searchParams.get('response_mode'), 'form_post')
    assert.equal(started.authorize.searchParams.get('scope'), 'name email')
    assert.match(started.state, /^[a-f0-9]{64}$/)
    assert.match(started.nonce, /^[a-f0-9]{64}$/)
    assert.equal(
      started.res.setCookies[0],
      `apple_state=${started.state}; Path=/api/study-plan/auth/apple; HttpOnly; SameSite=Lax; Max-Age=600`,
    )

    const database = db()
    try {
      const rows = database.prepare('SELECT state_hash, nonce_hash, return_path, prior_credential FROM apple_login_pending').all()
      assert.equal(rows.length, 1)
      assert.equal(rows[0].state_hash, sha256Hex(started.state))
      assert.equal(rows[0].nonce_hash, sha256Hex(started.nonce))
      assert.equal(rows[0].return_path, '/')
      assert.equal(rows[0].prior_credential, null)
      assert.ok(!JSON.stringify(rows).includes(started.state), 'the raw state is never stored')
    } finally {
      database.close()
    }
  })
})

test('return paths are limited to same-site paths', async () => {
  const cases = [
    ['/study-plan', '/study-plan'],
    ['/typing?dict=x', '/typing?dict=x'],
    ['/path#frag', '/path'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['https://evil.example/', '/'],
    ['javascript:alert(1)', '/'],
    ['relative', '/'],
    ['/has space', '/'],
  ]
  for (const [input, expected] of cases) {
    // A fresh server per case keeps each one under the start/callback/finish rate limits.
    await withServer({}, async ({ login, finish }) => {
      const { result } = await login({ returnPath: input, claims: { sub: `sub-${expected}` } })
      assert.ok(result.ticket, `ticket issued for ${input}`)
      const done = await finish(result.ticket)
      assert.equal(done.status, 303, input)
      assert.equal(done.location, expected, input)
    })
  }
})

test('happy path creates an account, sets the session, and clears the state cookie', async () => {
  await withServer({}, async ({ login, finish, call, db }) => {
    const { result } = await login({
      returnPath: '/study-plan',
      user: { name: { firstName: 'Alice', lastName: 'Martin' }, email: APPLE_EMAIL },
    })
    assert.equal(result.status, 200)
    assert.match(result.contentType, /^text\/html; charset=utf-8/)
    assert.equal(result.cacheControl, 'no-store')
    assert.equal(result.referrerPolicy, 'no-referrer')
    assert.ok(result.ticket)
    assert.ok(result.text.includes(`/api/study-plan/auth/apple/finish?ticket=${result.ticket}`))

    const done = await finish(result.ticket)
    assert.equal(done.status, 303)
    assert.equal(done.location, '/study-plan')
    assert.match(done.sessionCookie, /^study_session=[a-f0-9]{64}$/)
    assert.ok(done.setCookies.some((c) => c.startsWith('apple_state=;') && c.includes('Max-Age=0')))

    const status = await call('GET', '/api/study-plan/auth', { cookie: done.sessionCookie })
    assert.equal(status.data.signedIn, true)
    assert.equal(status.data.user.email, APPLE_EMAIL)
    assert.equal(status.data.user.name, 'Alice Martin')
    assert.match(status.data.user.id, /^[0-9a-f]{16}$/)

    const database = db()
    try {
      assert.equal(database.prepare('SELECT COUNT(*) AS n FROM apple_login_pending').get().n, 0, 'pending row consumed')
      assert.equal(database.prepare("SELECT COUNT(*) AS n FROM account_identities WHERE provider='apple'").get().n, 1)
    } finally {
      database.close()
    }
  })
})

test('a second Apple login with the same subject reuses the same account and keeps the first name', async () => {
  await withServer({}, async ({ login, finish, call, db }) => {
    const first = await login({ claims: { sub: 'apple-repeat' }, user: { name: { firstName: 'Carol', lastName: 'Dupont' } } })
    const firstDone = await finish(first.result.ticket)
    // Apple omits the name after the first authorization.
    const second = await login({ claims: { sub: 'apple-repeat' } })
    const secondDone = await finish(second.result.ticket)

    const a = await call('GET', '/api/study-plan/auth', { cookie: firstDone.sessionCookie })
    const b = await call('GET', '/api/study-plan/auth', { cookie: secondDone.sessionCookie })
    assert.equal(a.data.user.id, b.data.user.id)
    assert.equal(b.data.user.name, 'Carol Dupont')

    const database = db()
    try {
      assert.equal(database.prepare('SELECT COUNT(*) AS n FROM accounts').get().n, 1)
      assert.equal(database.prepare("SELECT COUNT(*) AS n FROM account_identities WHERE provider='apple'").get().n, 1)
    } finally {
      database.close()
    }
  })
})

test('a guest learner from the start request is adopted and keeps its plan', async () => {
  await withServer({}, async ({ call, login, finish }) => {
    const anon = await call('GET', '/api/study-plan')
    const anonCookie = anon.setCookies[0].split(';')[0]
    const state = { startDate: '2026-10-01', minutes: { '2026-10-05': { 'sat-retell': 45 } }, minimumMode: {} }
    const saved = await call('POST', '/api/study-plan', { cookie: anonCookie, body: { state } })
    assert.equal(saved.status, 200)

    // The guest cookie is sent on /start, which is what records the learner for adoption.
    const { result } = await login({ cookie: anonCookie, claims: { sub: 'apple-guest' } })
    const done = await finish(result.ticket)
    assert.equal(done.status, 303)

    const plan = await call('GET', '/api/study-plan', { cookie: done.sessionCookie })
    assert.equal(plan.status, 200)
    assert.equal(plan.data.state.minutes['2026-10-05']['sat-retell'], 45)
  })
})

test('an existing Google session links the Apple identity to the same account', async () => {
  const googleUser = { uid: 'google-uid-1', email: 'bob@example.com', name: 'Bob' }
  await withServer({ firebaseVerifier: createMockGoogleVerifier({ 'token-bob': googleUser }) }, async ({ call, login, finish, db }) => {
    const google = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-bob' } })
    assert.equal(google.status, 200)
    const googleCookie = google.setCookies[0].split(';')[0]

    const { result } = await login({ cookie: googleCookie, claims: { sub: 'apple-bob', email: 'bob-apple@privaterelay.appleid.com' } })
    const done = await finish(result.ticket)
    assert.equal(done.status, 303)

    const status = await call('GET', '/api/study-plan/auth', { cookie: done.sessionCookie })
    assert.equal(status.data.user.id, google.data.user.id, 'same account')
    assert.equal(status.data.user.email, 'bob@example.com', 'Google identity is preferred for the profile')

    const database = db()
    try {
      assert.equal(database.prepare('SELECT COUNT(*) AS n FROM accounts').get().n, 1)
      assert.equal(database.prepare('SELECT COUNT(*) AS n FROM account_identities').get().n, 2)
    } finally {
      database.close()
    }
  })
})

test('a wrong, replayed, or expired state issues no ticket', async () => {
  await withServer({}, async ({ start, callback, login, db }) => {
    // Unknown state
    const unknown = await callback({ state: 'a'.repeat(64), id_token: 'x', code: 'c' })
    assert.equal(unknown.ticket, null)
    assert.deepEqual(unknown.loginResult, ['failed', 'APPLE_STATE_INVALID'])

    // Malformed state
    const malformed = await callback({ state: 'not-hex', id_token: 'x', code: 'c' })
    assert.equal(malformed.ticket, null)

    // Replay: a state is usable once
    const first = await login({ claims: { sub: 'replay' } })
    assert.ok(first.result.ticket)
    const { started, idToken } = first
    const replay = await callback({ state: started.state, id_token: idToken, code: 'c' }, { cookie: started.stateCookie })
    assert.equal(replay.ticket, null)
    assert.deepEqual(replay.loginResult, ['failed', 'APPLE_STATE_INVALID'])

    // Expired: move the pending row into the past
    const expired = await start()
    const database = db()
    try {
      database.prepare('UPDATE apple_login_pending SET expires_at=0 WHERE state_hash=?').run(sha256Hex(expired.state))
    } finally {
      database.close()
    }
    const late = await callback(
      { state: expired.state, id_token: signToken({ nonce: expired.nonce }), code: 'c' },
      { cookie: expired.stateCookie },
    )
    assert.equal(late.ticket, null)
    assert.deepEqual(late.loginResult, ['failed', 'APPLE_STATE_EXPIRED'])
  })
})

test('a bad id_token issues no ticket: wrong audience, issuer, signature, nonce, expiry, or unverified email', async () => {
  const bad = [
    [{ aud: 'com.someone.else' }, undefined, 'APPLE_TOKEN_INVALID'],
    [{ iss: 'https://evil.example' }, undefined, 'APPLE_TOKEN_INVALID'],
    [{}, { key: otherPrivateKey }, 'APPLE_TOKEN_INVALID'],
    [{ nonce: 'f'.repeat(64) }, undefined, 'APPLE_TOKEN_INVALID'],
    [{ exp: Math.floor(Date.now() / 1000) - 5 }, undefined, 'APPLE_TOKEN_EXPIRED'],
    [{ email_verified: 'false' }, undefined, 'APPLE_EMAIL_UNVERIFIED'],
  ]
  await withServer({}, async ({ start, callback }) => {
    for (const [claims, signing, code] of bad) {
      const started = await start()
      const idToken = signing?.key
        ? signToken({ nonce: started.nonce, ...claims }, { key: signing.key })
        : signToken({ nonce: started.nonce, ...claims })
      const result = await callback({ state: started.state, id_token: idToken, code: 'c' }, { cookie: started.stateCookie })
      assert.equal(result.ticket, null, JSON.stringify(claims))
      assert.deepEqual(result.loginResult, ['failed', code], JSON.stringify(claims))
    }
  })
})

test('a missing apple_state cookie is accepted, but a mismatched cookie is rejected', async () => {
  await withServer({}, async ({ start, callback, finish }) => {
    // Browser dropped the cookie: the pending row still matches, so the login proceeds (audited).
    const dropped = await start()
    const accepted = await callback(
      { state: dropped.state, id_token: signToken({ nonce: dropped.nonce }), code: 'c' },
      { cookie: '' },
    )
    assert.ok(accepted.ticket, 'missing cookie with a matching pending row is accepted')
    assert.equal((await finish(accepted.ticket)).status, 303)

    // A cookie from another flow does not bind to this state.
    const mismatched = await start()
    const other = await start()
    const rejected = await callback(
      { state: mismatched.state, id_token: signToken({ nonce: mismatched.nonce }), code: 'c' },
      { cookie: other.stateCookie },
    )
    assert.equal(rejected.ticket, null)
    assert.deepEqual(rejected.loginResult, ['failed', 'APPLE_STATE_MISMATCH'])
  })
})

test('user cancellation returns login=cancelled and issues no ticket', async () => {
  await withServer({}, async ({ start, callback }) => {
    const started = await start({ returnPath: '/typing' })
    const result = await callback(
      { state: started.state, error: 'user_cancelled_authorize' },
      { cookie: started.stateCookie },
    )
    assert.equal(result.ticket, null)
    assert.deepEqual(result.loginResult, ['cancelled', undefined])
    assert.ok(result.text.includes('href="/typing?login=cancelled"'))
  })
})

test('tickets are single use and expire after two minutes', async () => {
  await withServer({}, async ({ login, finish, db }) => {
    const once = await login({ claims: { sub: 'ticket-once' } })
    const first = await finish(once.result.ticket)
    assert.equal(first.status, 303)
    assert.equal(first.location, '/')
    const second = await finish(once.result.ticket)
    assert.equal(second.sessionCookie, '')
    assert.equal(second.location, '/?login=failed&reason=APPLE_TICKET_INVALID')

    const old = await login({ claims: { sub: 'ticket-old' } })
    const database = db()
    try {
      database.prepare('UPDATE apple_login_tickets SET expires_at=0 WHERE ticket_hash=?').run(sha256Hex(old.result.ticket))
    } finally {
      database.close()
    }
    const expired = await finish(old.result.ticket)
    assert.equal(expired.sessionCookie, '')
    assert.equal(expired.location, '/?login=failed&reason=APPLE_TICKET_EXPIRED')
  })
})

test('STUDY_ALLOWED_EMAILS blocks Apple accounts outside the list', async () => {
  await withServer({ allowedEmails: 'allowed@example.com' }, async ({ login, finish }) => {
    const { result } = await login({ claims: { sub: 'not-allowed', email: APPLE_EMAIL } })
    assert.ok(result.ticket, 'the callback itself does not check the allow-list')
    const denied = await finish(result.ticket)
    assert.equal(denied.sessionCookie, '')
    assert.equal(denied.location, '/?login=failed&reason=EMAIL_NOT_ALLOWED')
  })
})

test('the daily new-account limit applies to Apple sign-ups', async () => {
  await withServer({ maxNewAccountsPerDay: 1 }, async ({ login, finish }) => {
    const first = await login({ claims: { sub: 'limit-1' } })
    assert.equal((await finish(first.result.ticket)).status, 303)
    const second = await login({ claims: { sub: 'limit-2' } })
    const blocked = await finish(second.result.ticket)
    assert.equal(blocked.sessionCookie, '')
    assert.equal(blocked.location, '/?login=failed&reason=SIGNUP_LIMIT_REACHED')
  })
})

test('the cross-site Origin is exempt only on the Apple callback path', async () => {
  await withServer({}, async ({ call }) => {
    const firebase = await call('POST', '/api/study-plan/auth/firebase', {
      origin: APPLE_ORIGIN,
      body: { idToken: 'x' },
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    })
    assert.equal(firebase.status, 403, 'other POST routes still reject the Apple origin')

    const logout = await call('POST', '/api/study-plan/auth/logout', {
      origin: APPLE_ORIGIN,
      body: {},
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    })
    assert.equal(logout.status, 403)
  })
})

test('the callback rejects methods other than POST and bodies other than form-encoded', async () => {
  await withServer({}, async ({ call, callback }) => {
    const get = await call('GET', '/api/study-plan/auth/apple/callback')
    assert.equal(get.status, 405)

    const wrongType = await call('POST', '/api/study-plan/auth/apple/callback', {
      origin: APPLE_ORIGIN,
      body: { state: 'x' },
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    })
    assert.equal(wrongType.status, 400)

    const invalid = await callback({ state: 'x'.repeat(64) })
    assert.equal(invalid.ticket, null)
  })
})

test('the id_token verifier accepts a valid token and rejects bad ones', async () => {
  const verifier = createAppleVerifier({ clientId: CLIENT_ID, fetchImpl: fakeAppleFetch().fetchImpl })
  const nonceHash = sha256Hex(sha256Hex('raw-nonce'))
  const good = signToken({ nonce: sha256Hex('raw-nonce'), email: 'Mixed.Case@Example.COM', is_private_email: true, email_verified: true })
  const claims = await verifier.verify(good, { nonceHash })
  assert.deepEqual(claims, {
    sub: 'apple-user-1',
    email: 'mixed.case@example.com',
    emailVerified: true,
    isPrivateEmail: true,
  })

  const reject = async (token, code) => {
    await assert.rejects(() => verifier.verify(token, { nonceHash }), (error) => error.message === code)
  }
  await reject(signToken({ nonce: sha256Hex('raw-nonce') }, { alg: 'HS256' }), 'APPLE_TOKEN_INVALID')
  await reject('a.b.c', 'APPLE_TOKEN_INVALID')
  await reject(good.slice(0, -4) + 'AAAA', 'APPLE_TOKEN_INVALID')
  await reject(signToken({ nonce: sha256Hex('other') }), 'APPLE_TOKEN_INVALID')
  await assert.rejects(() => verifier.verify(good, {}), (error) => error.message === 'APPLE_TOKEN_INVALID')
})

test('the verifier refetches Apple keys once after the throttle, for a rotated key', async () => {
  let offset = 0
  const now = () => Date.now() + offset
  const rotated = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const rotatedJwk = { ...rotated.publicKey.export({ format: 'jwk' }), kid: 'rotated-kid', alg: 'RS256', use: 'sig' }
  let served = [jwk]
  const { fetchImpl, counter } = fakeAppleFetch(() => served)
  const verifier = createAppleVerifier({ clientId: CLIENT_ID, fetchImpl, now })
  const nonceHash = sha256Hex(sha256Hex('n'))

  await verifier.verify(signToken({ nonce: sha256Hex('n') }), { nonceHash })
  assert.equal(counter.count, 1)

  // Apple rotates its keys. Within the throttle window the new kid is not fetched again.
  served = [jwk, rotatedJwk]
  const rotatedToken = signToken({ nonce: sha256Hex('n') }, { key: rotated.privateKey, kid: 'rotated-kid' })
  await assert.rejects(() => verifier.verify(rotatedToken, { nonceHash }), (error) => error.message === 'APPLE_TOKEN_INVALID')
  assert.equal(counter.count, 1)

  // After the throttle window it is fetched once and accepted.
  offset += 61_000
  const claims = await verifier.verify(rotatedToken, { nonceHash })
  assert.equal(claims.sub, 'apple-user-1')
  assert.equal(counter.count, 2)
})
