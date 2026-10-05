import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createPasskeyFixture } from './study-passkey-test-helper.mjs'
import { createStudyServer } from './study-plan.mjs'

const jsonRequest = async (base, path, { method = 'GET', cookie = '', origin, body, headers = {} } = {}) => {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return {
    response,
    body: await response.json().catch(() => null),
  }
}

test('Passkey binds an anonymous learner and restores it from a fresh browser session', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-passkey-api-'))
  const database = join(dir, 'data.sqlite')
  const origin = 'http://localhost:4173'
  const server = createStudyServer({ database, origin, metricsToken: 'metrics-secret', slowRequestMs: 0 })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`

  try {
    const initial = await jsonRequest(base, '/api/study-plan', { origin })
    assert.equal(initial.response.status, 200)
    const anonymousCookie = initial.response.headers.get('set-cookie').split(';')[0]
    const state = {
      startDate: '2026-10-01',
      minutes: { '2026-10-05': { 'mon-vocab': 31 } },
      minimumMode: {},
    }
    assert.equal((await jsonRequest(base, '/api/study-plan', {
      method: 'POST',
      cookie: anonymousCookie,
      origin,
      body: { state },
    })).response.status, 200)

    const registerOptions = await jsonRequest(base, '/api/study-plan/passkey/register/options', {
      method: 'POST',
      cookie: anonymousCookie,
      origin,
      body: {},
    })
    assert.equal(registerOptions.response.status, 200)
    assert.equal(registerOptions.body.options.rp.id, 'localhost')
    const invalidOptions = await jsonRequest(base, '/api/study-plan/passkey/register/options', {
      method: 'POST',
      cookie: anonymousCookie,
      origin,
      body: { unexpected: true },
    })
    assert.equal(invalidOptions.response.status, 400)
    assert.equal(invalidOptions.body.code, 'PASSKEY_REQUEST_INVALID')
    const fixture = await createPasskeyFixture(origin)
    const registration = await fixture.registration(registerOptions.body.options.challenge)
    const registered = await jsonRequest(base, '/api/study-plan/passkey/register/verify', {
      method: 'POST',
      cookie: anonymousCookie,
      origin,
      body: { credential: registration },
    })
    assert.equal(registered.response.status, 200)
    assert.equal(registered.body.account.registered, true)
    assert.equal(registered.body.account.signedIn, true)
    const accountCookie = registered.response.headers.get('set-cookie').split(';')[0]
    const account = await jsonRequest(base, '/api/study-plan/account', {
      cookie: accountCookie,
      origin,
    })
    assert.deepEqual(
      { registered: account.body.registered, signedIn: account.body.signedIn, passkeyCount: account.body.passkeyCount },
      { registered: true, signedIn: true, passkeyCount: 1 },
    )

    // A browser with no study cookie obtains a discoverable-credential challenge,
    // signs it with the same authenticator and lands on the exact same learner.
    const loginOptions = await jsonRequest(base, '/api/study-plan/passkey/login/options', {
      method: 'POST',
      origin,
      body: {},
    })
    assert.equal(loginOptions.response.status, 200)
    const assertion = await fixture.authentication(loginOptions.body.options.challenge, 1)
    const login = await jsonRequest(base, '/api/study-plan/passkey/login/verify', {
      method: 'POST',
      origin,
      body: { credential: assertion },
    })
    assert.equal(login.response.status, 200)
    assert.equal(login.body.account.signedIn, true)
    assert.equal(login.body.state.minutes['2026-10-05']['mon-vocab'], 31)
    const loginCookie = login.response.headers.get('set-cookie').split(';')[0]
    const restored = await jsonRequest(base, '/api/study-plan', { cookie: loginCookie, origin })
    assert.equal(restored.body.state.minutes['2026-10-05']['mon-vocab'], 31)

    // Replay of the same assertion counter is rejected.
    const replayOptions = await jsonRequest(base, '/api/study-plan/passkey/login/options', {
      method: 'POST',
      origin,
      body: {},
    })
    const replay = await fixture.authentication(replayOptions.body.options.challenge, 1)
    assert.equal((await jsonRequest(base, '/api/study-plan/passkey/login/verify', {
      method: 'POST',
      origin,
      body: { credential: replay },
    })).response.status, 401)

    const recordsCsv = await fetch(base + '/api/study-plan/records.csv', {
      headers: { Origin: origin, Cookie: loginCookie },
    })
    assert.equal(recordsCsv.status, 200)
    assert.match(recordsCsv.headers.get('content-type'), /text\/csv/)
    assert.match(await recordsCsv.text(), /mon-vocab/)

    const errorCsv = await fetch(base + '/api/study-plan/error-book.csv', {
      headers: { Origin: origin, Cookie: loginCookie },
    })
    assert.equal(errorCsv.status, 200)
    assert.match(errorCsv.headers.get('content-disposition'), /error-book\.csv/)

    const reportCsv = await fetch(base + '/api/study-plan/weekly-reports.csv', {
      headers: { Origin: origin, Cookie: loginCookie },
    })
    assert.equal(reportCsv.status, 200)
    assert.match(reportCsv.headers.get('content-disposition'), /weekly-reports\.csv/)

    const noMetrics = await fetch(base + '/api/metrics')
    assert.equal(noMetrics.status, 401)
    const metrics = await fetch(base + '/api/metrics', {
      headers: {
        Authorization: 'Bearer metrics-secret',
        'X-Request-ID': 'passkey-api-test-0001',
      },
    })
    assert.equal(metrics.status, 200)
    assert.equal(metrics.headers.get('x-request-id'), 'passkey-api-test-0001')
    const body = await metrics.text()
    assert.match(body, /qwerty_study_http_requests_total/)
    assert.match(body, /qwerty_study_http_slow_requests_total/)
    assert.match(body, /qwerty_study_http_errors_total/)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
