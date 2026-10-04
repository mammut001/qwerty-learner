import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createStudyServer } from './study-plan.mjs'
import { studyPolicy } from './study-http.mjs'
import worker from '../deploy/worker.mjs'
import { smokeCors } from '../scripts/smoke-study-cors.mjs'

test('Node remote-origin session, health schema failure and invalid cookie configuration', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'study-cors-'))
  const database = join(directory, 'db.sqlite')
  const origin = 'https://frontend.example.invalid'
  const server = createStudyServer({ database, origin, secure: true, sameSite: 'none' })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    await smokeCors(base, origin, { crossSite: true })
    const destination = join(directory, 'backup.sqlite')
    const backup = spawnSync(process.execPath, ['server/sqlite-backup.mjs', database, destination], { encoding: 'utf8' })
    assert.equal(backup.status, 0, backup.stderr)
    const restored = new DatabaseSync(destination, { readOnly: true })
    assert.ok(restored.prepare('SELECT count(*) AS n FROM learners WHERE state IS NOT NULL').get().n >= 2)
    assert.ok(restored.prepare('SELECT count(*) AS n FROM mutations').get().n >= 3)
    assert.equal(restored.prepare('PRAGMA quick_check').get().quick_check, 'ok')
    restored.close()
    assert.notEqual(spawnSync(process.execPath, ['server/sqlite-backup.mjs', database, destination]).status, 0, 'Backup cannot overwrite a prior backup')
    const external = new DatabaseSync(database)
    external.exec('DROP TABLE mutations')
    external.close()
    assert.equal((await fetch(base + '/health')).status, 503, 'Missing schema must not be healthy')
  } finally {
    await new Promise((r) => server.close(r))
    rmSync(directory, { recursive: true, force: true })
  }
  for (const settings of [
    { origin: '*', secure: true },
    { origin: 'https://frontend.example.invalid/path', secure: true },
    { origin, secure: false, sameSite: 'none' },
    { origin: 'http://public.example.invalid', secure: false },
  ]) assert.equal(studyPolicy(settings, new Request('https://api.example.invalid/health'), true).status, 503)
  const rejected = studyPolicy({ origin, secure: true }, new Request('https://api.example.invalid/api/study-plan', { headers: { Origin: origin, 'Sec-Fetch-Site': 'cross-site' } }))
  assert.equal(rejected.status, 403, 'Strict mode does not opt into cross-site sessions')
})

test('Worker health and error responses enforce method/origin and expose no storage details', async () => {
  const env = { STUDY_ORIGIN: 'https://frontend.example.invalid', STUDY_COOKIE_SECURE: 'true', STUDY_COOKIE_SAME_SITE: 'none', DB: { prepare() { throw new Error('private database path') } } }
  const response = await worker.fetch(new Request('https://api.example.invalid/health', { headers: { Origin: env.STUDY_ORIGIN } }), env)
  assert.equal(response.status, 503)
  assert.equal(response.headers.get('access-control-allow-origin'), env.STUDY_ORIGIN)
  assert.doesNotMatch(await response.text(), /private database path/)
  assert.equal((await worker.fetch(new Request('https://api.example.invalid/health', { method: 'DELETE' }), env)).status, 405)
})
