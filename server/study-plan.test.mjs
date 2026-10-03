import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const initial = { startDate: '2026-10-01', minutes: { '2026-10-03': { 'sat-listening': 5 } }, minimumMode: {} }
test('durability, create-only migration, isolation, idempotent minutes and validation', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-plan-'))
  const options = { database: join(dir, 'data.sqlite'), origin: 'http://localhost:5173' }
  let server
  let base
  const start = async () => {
    server = createStudyServer(options)
    await new Promise((r) => server.listen(0, '127.0.0.1', r))
    base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  }
  const stop = () => new Promise((r) => server.close(r))
  const call = (method, cookie = '', body, origin = options.origin) =>
    fetch(base, {
      method,
      headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  try {
    await start()
    const first = await call('GET')
    const cookie = first.headers.get('set-cookie').split(';')[0]
    assert.match(first.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/)
    assert.equal((await first.json()).state, null)
    assert.equal((await call('POST', cookie, { state: initial })).status, 200)
    assert.deepEqual((await (await call('POST', cookie, { state: { ...initial, startDate: '2020-01-01' } })).json()).state, initial)
    const mutation = {
      id: randomUUID(),
      operations: [
        { kind: 'increment', day: '2026-10-03', task: 'sat-listening', value: 10 },
        { kind: 'mode', day: '2026-10-03', value: true },
        { kind: 'startDate', value: '2026-09-28' },
      ],
    }
    assert.equal((await call('PATCH', cookie, mutation)).status, 200)
    assert.equal((await call('PATCH', cookie, mutation)).status, 200)
    let state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.minutes['2026-10-03']['sat-listening'], 15) // completed at the existing target
    assert.equal(state.startDate, '2026-09-28')
    assert.equal(state.minimumMode['2026-10-03'], true)
    await stop()
    await start()
    assert.deepEqual((await (await call('GET', cookie)).json()).state, state)
    assert.equal((await (await call('GET')).json()).state, null) // different browser
    assert.equal((await call('PATCH', '', mutation)).status, 401)
    assert.equal((await call('PATCH', cookie, mutation, 'https://evil.example')).status, 403)
    assert.equal((await call('PATCH', cookie, { ...mutation, operations: [] })).status, 400)
    for (const value of [-1, '15', 1000001]) {
      assert.equal(
        (
          await call('PATCH', cookie, {
            id: randomUUID(),
            operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value }],
          })
        ).status,
        400,
      )
    }
    assert.equal(
      (
        await call('PATCH', cookie, {
          id: randomUUID(),
          operations: [
            { kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value: 0 },
            { kind: 'mode', day: '2026-02-30', value: true },
          ],
        })
      ).status,
      400,
    )
    assert.deepEqual((await (await call('GET', cookie)).json()).state, state) // rollback whole invalid mutation
    await Promise.all(
      ['mon-vocab', 'fri-vocab'].map((task) =>
        call('PATCH', cookie, { id: randomUUID(), operations: [{ kind: 'increment', day: '2026-10-03', task, value: 7 }] }),
      ),
    )
    state = (await (await call('GET', cookie)).json()).state
    assert.equal(state.minutes['2026-10-03']['mon-vocab'], 7)
    assert.equal(state.minutes['2026-10-03']['fri-vocab'], 7)
    const undo = await call('PATCH', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'minutes', day: '2026-10-03', task: 'sat-listening', value: 0 }],
    })
    assert.equal((await undo.json()).state.minutes['2026-10-03']['sat-listening'], 0)
    const huge = await call('PATCH', cookie, { padding: 'x'.repeat(600001) })
    assert.equal(huge.status, 413)
  } finally {
    if (server?.listening) await stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
