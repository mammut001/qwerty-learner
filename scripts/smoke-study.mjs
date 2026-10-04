import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

export async function smokeStudy(base, { saveSession, resumeSession, frontendOrigin } = {}) {
  const url = new URL(base)
  assert.ok(url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname), 'Public smoke requires HTTPS')
  const origin = url.origin
  let cookie = '', expected
  const call = async (method, body, options = {}) => {
    const res = await fetch(`${origin}/api/study-plan`, {
      method, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { Cookie: options.cookie ?? cookie, Origin: options.origin ?? frontendOrigin ?? origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    return { res, data }
  }
  const health = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(20000) })
  assert.equal(health.status, 200, 'D1 health check')
  const alias = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(20000) })
  assert.equal(alias.status, 200, '/health is API readiness, not SPA HTML')
  assert.equal((await alias.json()).ok, true)
  assert.equal(alias.headers.get('cache-control'), 'no-store')
  assert.equal(alias.headers.get('set-cookie'), null)
  const page = await fetch(`${origin}/study-plan`, { signal: AbortSignal.timeout(20000) })
  assert.equal(page.status, 200, 'SPA deep link')
  assert.match(page.headers.get('content-type'), /text\/html/)
  if (resumeSession) {
    const saved = JSON.parse(await readFile(resumeSession, 'utf8'))
    assert.equal(saved.origin, origin)
    cookie = saved.cookie
    assert.deepEqual((await call('GET')).data.state, saved.expected, 'Data survives worker restart/redeploy')
    console.log('PASS: saved progress survived restart/redeploy')
    return
  }
  let response = await call('GET')
  assert.equal(response.res.status, 200)
  const setCookie = response.res.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly; SameSite=(Strict|None)/)
  if (url.protocol === 'https:') assert.match(setCookie, /; Secure/)
  cookie = setCookie.split(';')[0]
  assert.equal(response.data.state, null)
  const state = { startDate: '2026-10-01', minutes: { '2026-10-03': { 'sat-listening': 5 } }, minimumMode: {} }
  assert.equal((await call('POST', { state })).res.status, 200)
  assert.deepEqual((await call('POST', { state: { ...state, startDate: '2020-01-01' } })).data.state, state, 'Migration is create-only')
  const mutation = { id: randomUUID(), operations: [
    { kind: 'startDate', value: '2026-09-28' },
    { kind: 'increment', day: '2026-10-03', task: 'sat-listening', value: 10 },
    { kind: 'mode', day: '2026-10-03', value: true },
  ] }
  response = await call('PATCH', mutation)
  assert.equal(response.res.status, 200)
  assert.equal((await call('PATCH', mutation)).data.state.minutes['2026-10-03']['sat-listening'], 15, 'Duplicate delivery not double counted')
  assert.equal((await call('PATCH', { ...mutation, operations: [] })).res.status, 400, 'ID cannot be reused with different data')
  const increments = Array.from({ length: 4 }, () => ({ id: randomUUID(), operations: [{ kind: 'increment', day: '2026-10-03', task: 'sat-retell', value: 2 }] }))
  const results = await Promise.all(increments.map((m) => call('PATCH', m)))
  results.forEach((r) => assert.equal(r.res.status, 200))
  expected = (await call('GET')).data.state
  assert.equal(expected.minutes['2026-10-03']['sat-retell'], 8, 'Concurrent updates preserved')
  assert.equal(expected.minutes['2026-10-03']['sat-listening'], 15, 'Completion target preserved')
  assert.equal(expected.minimumMode['2026-10-03'], true)
  assert.equal(expected.startDate, '2026-09-28')
  assert.equal((await call('GET', undefined, { cookie: '' })).data.state, null, 'Browser identities isolated')
  assert.equal((await call('PATCH', mutation, { cookie: '' })).res.status, 401)
  assert.equal((await call('PATCH', mutation, { origin: 'https://evil.invalid' })).res.status, 403)
  assert.equal((await call('PATCH', { id: randomUUID(), operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-retell', value: -1 }] })).res.status, 400)
  assert.deepEqual((await call('GET')).data.state, expected, 'Rejected write leaves state intact')
  if (saveSession) await writeFile(saveSession, JSON.stringify({ origin, cookie, expected }), { mode: 0o600 })
  console.log('PASS: same-origin API, migration, save/reload, completion, concurrent minutes, retry deduplication, isolation and CSRF')
}
if (process.argv[1]?.endsWith('smoke-study.mjs')) {
  const [base, mode, path] = process.argv.slice(2)
  if (!base) throw new Error('Usage: node scripts/smoke-study.mjs https://APP.ACCOUNT.workers.dev [--save-session|--resume-session FILE]')
  await smokeStudy(base, { saveSession: mode === '--save-session' ? path : undefined, resumeSession: mode === '--resume-session' ? path : undefined })
}
