import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStudyServer } from '../server/study-plan.mjs'

const directory = await mkdtemp(join(tmpdir(), 'qwerty-backup-drill-'))
const source = join(directory, 'source.sqlite')
const backup = join(directory, 'backup.sqlite')
const restored = join(directory, 'restored.sqlite')
const origin = 'http://localhost:5173'
let server

const start = async (database) => {
  server = createStudyServer({ database, origin })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return `http://127.0.0.1:${server.address().port}`
}
const stop = async () => {
  if (!server) return
  await new Promise((resolve) => server.close(resolve))
  server = undefined
}
const call = async (base, method, cookie = '', body) =>
  fetch(base + '/api/study-plan', {
    method,
    headers: {
      Origin: origin,
      Cookie: cookie,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

try {
  let base = await start(source)
  const first = await call(base, 'GET')
  const cookie = first.headers.get('set-cookie').split(';')[0]
  assert.equal((await first.json()).state, null)

  const state = {
    startDate: '2026-10-01',
    minutes: { '2026-10-05': { 'restore-drill': 47 } },
    minimumMode: {},
  }
  assert.equal((await call(base, 'POST', cookie, { state })).status, 200)

  // Exercise the documented ONLINE backup while SQLite WAL mode is active.
  const result = spawnSync(process.execPath, ['server/sqlite-backup.mjs', source, backup], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /integrity checked/)

  // Change live data after the backup so restore proves a point-in-time snapshot.
  assert.equal((await call(base, 'PATCH', cookie, {
    id: crypto.randomUUID(),
    operations: [{ kind: 'increment', day: '2026-10-05', task: 'restore-drill', value: 5, updatedAt: Date.now() }],
  })).status, 200)
  assert.equal((await (await call(base, 'GET', cookie)).json()).state.minutes['2026-10-05']['restore-drill'], 52)
  await stop()

  await copyFile(backup, restored)
  base = await start(restored)
  const restoredResponse = await call(base, 'GET', cookie)
  assert.equal(restoredResponse.status, 200)
  const restoredState = (await restoredResponse.json()).state
  assert.equal(restoredState.minutes['2026-10-05']['restore-drill'], 47, 'restored DB returns the backed-up point in time')
  assert.equal((await fetch(base + '/api/health')).status, 200)

  const overwrite = spawnSync(process.execPath, ['server/sqlite-backup.mjs', source, backup], { encoding: 'utf8' })
  assert.notEqual(overwrite.status, 0, 'backup helper must never overwrite an existing backup')
  console.log('PASS: online SQLite backup, integrity check, point-in-time restore and overwrite guard')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
