import assert from 'node:assert/strict'

// Runs against Node and actual local D1 in CI. Browser-required response headers
// are asserted explicitly; fetch in Node itself does not enforce browser CORS.
export async function smokeCors(base, frontend, { crossSite = false } = {}) {
  const headers = { Origin: frontend, 'Sec-Fetch-Site': crossSite ? 'cross-site' : 'same-site' }
  const request = (path, options = {}) => fetch(base + path, { ...options, headers: { ...headers, ...options.headers } })
  for (const path of ['/health', '/api/health']) {
    const health = await request(path)
    assert.equal(health.status, 200)
    assert.equal((await health.json()).ok, true)
    assert.equal(health.headers.get('access-control-allow-origin'), frontend)
    assert.equal(health.headers.get('access-control-allow-credentials'), 'true')
    assert.equal(health.headers.get('vary'), 'Origin')
    assert.equal(health.headers.get('cache-control'), 'no-store')
    assert.equal(health.headers.get('set-cookie'), null)
    assert.equal((await request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 405)
  }
  const preflight = await request('/api/study-plan', { method: 'OPTIONS', headers: { 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'content-type' } })
  assert.equal(preflight.status, 204)
  assert.match(preflight.headers.get('access-control-allow-methods'), /PATCH/)
  assert.equal(preflight.headers.get('set-cookie'), null)
  for (const origin of ['https://evil.invalid', 'null']) {
    const denied = await request('/api/study-plan', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'PATCH' } })
    assert.equal(denied.status, 403)
    assert.equal(denied.headers.get('access-control-allow-origin'), null)
  }
  const deletePreflight = await request('/api/study-plan/data', {
    method: 'OPTIONS',
    headers: { 'Access-Control-Request-Method': 'DELETE', 'Access-Control-Request-Headers': 'content-type' },
  })
  assert.equal(deletePreflight.status, 204)
  assert.match(deletePreflight.headers.get('access-control-allow-methods'), /DELETE/)
  const first = await request('/api/study-plan')
  const cookieHeader = first.headers.get('set-cookie')
  assert.equal(first.status, 200)
  assert.match(cookieHeader, crossSite ? /SameSite=None.*Secure/ : /SameSite=Strict/)
  const cookie = cookieHeader.split(';')[0]
  const state = { startDate: '2026-10-04', minutes: { '2026-10-04': { 'sun-vocab': 15 } }, minimumMode: {} }
  const write = await request('/api/study-plan', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) })
  assert.equal(write.status, 200)
  assert.equal(write.headers.get('access-control-allow-origin'), frontend)
  const normalizedState = (await write.json()).state
  assert.equal(normalizedState.startDate, state.startDate)
  assert.deepEqual(normalizedState.minutes, state.minutes)
  assert.deepEqual(normalizedState.minimumMode, state.minimumMode)
  assert.ok(normalizedState.learning)
  const reload = await request('/api/study-plan', { headers: { Cookie: cookie } })
  assert.deepEqual((await reload.json()).state, normalizedState)
  const blocked = await request('/api/study-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) })
  assert.equal(blocked.status, 401, 'Blocked/missing browser cookie must not report a successful save')
  assert.equal(blocked.headers.get('access-control-allow-origin'), frontend, 'Browser can read session errors')
  assert.equal((await request('/api/study-plan', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://evil.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) })).status, 403)
  const exportedResponse = await request('/api/study-plan/export', { headers: { Cookie: cookie } })
  assert.equal(exportedResponse.status, 200)
  const backup = await exportedResponse.json()
  assert.equal(backup.format, 'qwerty-study-plan')
  assert.equal(backup.version, 4)
  assert.deepEqual(backup.state, normalizedState)
  const importId = crypto.randomUUID()
  const changed = {
    ...backup,
    state: {
      ...backup.state,
      startDate: '2026-09-28',
      settings: { ...backup.state.settings, examDate: '2027-03-28' },
      minutes: { '2026-10-04': { 'sun-vocab': 42 } },
    },
  }
  const importCall = (value, id = importId, targetCookie = cookie) => request('/api/study-plan/import', { method: 'POST', headers: { Cookie: targetCookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, backup: value }) })
  assert.equal((await importCall(changed)).status, 200)
  assert.equal((await importCall(changed)).status, 200)
  assert.deepEqual((await (await request('/api/study-plan', { headers: { Cookie: cookie } })).json()).state, changed.state)
  assert.equal((await importCall({ ...changed, version: 99 }, crypto.randomUUID())).status, 400)
  assert.equal((await importCall({ ...changed, state: { ...backup.state, startDate: 'invalid' } }, crypto.randomUUID())).status, 400)
  assert.equal((await importCall(backup)).status, 400, 'An import id cannot change payload')
  const edit = await request('/api/study-plan', { method: 'PATCH', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), operations: [{ kind: 'increment', day: '2026-10-04', task: 'sun-vocab', value: 3 }] }) })
  assert.equal(edit.status, 200)
  assert.equal((await (await importCall(changed)).json()).state.minutes['2026-10-04']['sun-vocab'], 45, 'Lost import response retry must not overwrite newer progress')
  const other = await request('/api/study-plan')
  const otherCookie = other.headers.get('set-cookie').split(';')[0]
  await request('/api/study-plan', { method: 'POST', headers: { Cookie: otherCookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) })
  assert.equal((await importCall(backup, crypto.randomUUID(), otherCookie)).status, 200)
  assert.deepEqual((await (await request('/api/study-plan/export', { headers: { Cookie: otherCookie } })).json()).state, backup.state, 'Export/import round trips to an independent identity')
  assert.equal((await request('/api/study-plan/export')).status, 401)
  console.log('PASS: credentialed CORS including DELETE preflight, remote session reload, export/import round trip, CSRF, /health and /api/health')
}
