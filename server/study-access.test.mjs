import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const ORIGIN = 'http://localhost:5173'

async function withServer(options, run) {
  const dir = mkdtempSync(join(tmpdir(), 'study-access-'))
  const server = createStudyServer({ database: join(dir, 'study.sqlite'), origin: ORIGIN, ...options })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const call = async (method, path, { body, cookie = '', origin = ORIGIN } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: { Origin: origin, Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { response, data: await response.json().catch(() => null), setCookie: response.headers.get('set-cookie') || '' }
  }
  try {
    await run(call)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
}

test('without an access password the gate is off', async () => {
  await withServer({}, async (call) => {
    const status = await call('GET', '/api/study-plan/access')
    assert.deepEqual(status.data, { required: false, granted: true })
    assert.equal((await call('GET', '/api/study-plan')).response.status, 200)
  })
})

test('with an access password every data route needs the signed cookie', async () => {
  await withServer({ accessPassword: 'correct horse' }, async (call) => {
    // Health stays public for uptime checks; everything else is closed.
    assert.equal((await call('GET', '/api/health')).response.status, 200)
    assert.deepEqual((await call('GET', '/api/study-plan/access')).data, { required: true, granted: false })
    for (const path of [
      '/api/study-plan',
      '/api/study-plan/analytics?today=2026-10-06',
      '/api/study-plan/export',
      '/api/study-plan/account',
    ]) {
      const blocked = await call('GET', path)
      assert.equal(blocked.response.status, 401, path)
      assert.equal(blocked.data.code, 'ACCESS_REQUIRED')
      assert.equal(blocked.setCookie, '', 'a blocked request must not start a learner session')
    }
    const blockedLogin = await call('POST', '/api/study-plan/passkey/login/options', { body: {} })
    assert.equal(blockedLogin.response.status, 401)

    // Wrong, malformed and cross-origin attempts.
    const wrong = await call('POST', '/api/study-plan/access', { body: { password: 'nope' } })
    assert.equal(wrong.response.status, 401)
    assert.equal(wrong.data.code, 'ACCESS_DENIED')
    assert.equal(wrong.setCookie, '')
    assert.equal((await call('POST', '/api/study-plan/access', { body: { password: 7 } })).response.status, 400)
    assert.equal((await call('POST', '/api/study-plan/access', { body: { password: 'correct horse', extra: 1 } })).response.status, 400)
    assert.equal(
      (await call('POST', '/api/study-plan/access', { body: { password: 'correct horse' }, origin: 'https://evil.example' })).response
        .status,
      403,
    )

    // Forged or expired cookies are rejected.
    const forged = `study_access=${Date.now() + 60_000}.${'0'.repeat(64)}`
    assert.equal((await call('GET', '/api/study-plan', { cookie: forged })).response.status, 401)

    const ok = await call('POST', '/api/study-plan/access', { body: { password: 'correct horse' } })
    assert.equal(ok.response.status, 200)
    assert.deepEqual(ok.data, { required: true, granted: true })
    assert.match(ok.setCookie, /^study_access=\d{13}\.[a-f0-9]{64}; Path=\/api; HttpOnly; SameSite=Strict; Max-Age=7776000$/)
    const cookie = ok.setCookie.split(';')[0]

    assert.deepEqual((await call('GET', '/api/study-plan/access', { cookie })).data, { required: true, granted: true })
    const plan = await call('GET', '/api/study-plan', { cookie })
    assert.equal(plan.response.status, 200)
    assert.match(plan.setCookie, /^study_session=/)

    // A cookie whose expiry was tampered with no longer matches its signature.
    const [expires, signature] = cookie.replace('study_access=', '').split('.')
    const stretched = `study_access=${Number(expires) + 1000}.${signature}`
    assert.equal((await call('GET', '/api/study-plan', { cookie: stretched })).response.status, 401)

    const out = await call('DELETE', '/api/study-plan/access', { body: {}, cookie })
    assert.match(out.setCookie, /^study_access=; .*Max-Age=0/)
  })
})

test('changing the access password revokes existing cookies, and guessing is rate limited', async () => {
  let cookie = ''
  await withServer({ accessPassword: 'first' }, async (call) => {
    cookie = (await call('POST', '/api/study-plan/access', { body: { password: 'first' } })).setCookie.split(';')[0]
    assert.equal((await call('GET', '/api/study-plan', { cookie })).response.status, 200)
  })
  await withServer({ accessPassword: 'second' }, async (call) => {
    assert.equal((await call('GET', '/api/study-plan', { cookie })).response.status, 401)

    const statuses = []
    for (let attempt = 0; attempt < 10; attempt += 1)
      statuses.push((await call('POST', '/api/study-plan/access', { body: { password: `guess-${attempt}` } })).response.status)
    assert.deepEqual(statuses.slice(0, 8), Array(8).fill(401))
    assert.deepEqual(statuses.slice(8), [429, 429])
    // Even the right password is refused while the block is active.
    const blocked = await call('POST', '/api/study-plan/access', { body: { password: 'second' } })
    assert.equal(blocked.response.status, 429)
    assert.equal(blocked.data.code, 'ACCESS_RATE_LIMITED')
    assert.ok(blocked.data.retryAfterSeconds > 0)
  })
})

test('secure deployments mark the access cookie Secure', async () => {
  await withServer({ accessPassword: 'pw', origin: 'https://french.example', secure: true }, async (call) => {
    const ok = await call('POST', '/api/study-plan/access', { body: { password: 'pw' }, origin: 'https://french.example' })
    assert.match(ok.setCookie, /; Secure$/)
  })
})
