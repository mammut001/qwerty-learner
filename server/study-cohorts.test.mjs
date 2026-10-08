import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { computePlacementResult, PLACEMENT_QUESTIONS } from './placement-data.mjs'
import { createStudyServer } from './study-plan.mjs'
import {
  createCohort,
  joinLearnerToCohort,
  normalizeJoinCode,
  hashJoinCode,
} from './study-cohorts.mjs'
import { loadPlacementCohortReportFromDb } from './study-admin.mjs'
import { ensureNodeFeatureSchema } from './study-node-features.mjs'
import { DatabaseSync } from 'node:sqlite'

test('cohort join code normalizes and hashes deterministically', () => {
  const normalized = normalizeJoinCode('abcd-efgh-jklm-npqr')
  assert.equal(normalized, 'ABCDEFGHJKLMNPQR')
  assert.equal(hashJoinCode(normalized), hashJoinCode('ABCDEFGHJKLMNPQR'))
})

test('placement cohort report filters by cohort membership', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-cohorts-'))
  const db = new DatabaseSync(join(dir, 'cohorts.sqlite'))
  try {
    db.exec('CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);')
    ensureNodeFeatureSchema(db)
    const cohortA = createCohort(db, 'Class A')
    const cohortB = createCohort(db, 'Class B')
    const learnerA = 'a'.repeat(64)
    const learnerB = 'b'.repeat(64)
    const learnerC = 'c'.repeat(64)
    const answers = PLACEMENT_QUESTIONS.map((q) => ({ questionId: q.id, choiceIndex: q.correctIndex }))
    const placement = computePlacementResult({
      answers,
      startedAt: 1,
      finishedAt: 2,
      durationSeconds: 1,
      day: '2026-10-01',
      id: randomUUID(),
    })
    const stateWithPlacement = JSON.stringify({
      startDate: '2026-10-01',
      minutes: {},
      minimumMode: {},
      learning: { placement: { latest: placement, history: [placement] } },
    })
    db.prepare('INSERT INTO learners(id,state) VALUES(?,?)').run(learnerA, stateWithPlacement)
    db.prepare('INSERT INTO learners(id,state) VALUES(?,?)').run(learnerB, stateWithPlacement)
    db.prepare('INSERT INTO learners(id,state) VALUES(?,?)').run(
      learnerC,
      JSON.stringify({ startDate: '2026-10-01', minutes: {}, minimumMode: {} }),
    )
    joinLearnerToCohort(db, learnerA, cohortA.joinCode)
    joinLearnerToCohort(db, learnerB, cohortB.joinCode)

    const all = loadPlacementCohortReportFromDb(db, null)
    assert.equal(all.totalLearners, 3)
    assert.equal(all.placementCompleted, 2)

    const onlyA = loadPlacementCohortReportFromDb(db, cohortA.id)
    assert.equal(onlyA.cohortId, cohortA.id)
    assert.equal(onlyA.totalLearners, 1)
    assert.equal(onlyA.placementCompleted, 1)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('cohort admin and learner join APIs', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-cohorts-api-'))
  const token = 'test-admin-token-' + 'y'.repeat(20)
  const server = createStudyServer({
    database: join(dir, 'study.sqlite'),
    origin: 'http://localhost:5173',
    adminToken: token,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`
  const origin = 'http://localhost:5173'
  const admin = { Authorization: `Bearer ${token}`, Origin: origin }
  try {
    const created = await fetch(`${base}/api/study-plan/admin/cohorts`, {
      method: 'POST',
      headers: { ...admin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Spring 2026' }),
    })
    assert.equal(created.status, 200)
    const { cohort } = await created.json()
    assert.ok(cohort.id)
    assert.match(cohort.joinCode, /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)

    const plan = await fetch(`${base}/api/study-plan`, { headers: { Origin: origin } })
    assert.equal(plan.status, 200)
    const cookie = plan.headers.get('set-cookie') ?? ''

    const joined = await fetch(`${base}/api/study-plan/cohort/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie, Origin: origin },
      body: JSON.stringify({ code: cohort.joinCode }),
    })
    assert.equal(joined.status, 200)
    const joinedBody = await joined.json()
    assert.equal(joinedBody.cohort.name, 'Spring 2026')

    const info = await fetch(`${base}/api/study-plan/cohort`, { headers: { cookie, Origin: origin } })
    assert.equal(info.status, 200)
    const infoBody = await info.json()
    assert.equal(infoBody.cohort.cohortId, cohort.id)

    const filtered = await fetch(`${base}/api/study-plan/admin/placement-cohort?cohortId=${cohort.id}`, {
      headers: admin,
    })
    assert.equal(filtered.status, 200)
    assert.equal((await filtered.json()).report.totalLearners, 1)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
