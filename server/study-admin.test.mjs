import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'
import { buildPlacementCohortReport, authorizeAdminRequest } from './study-admin.mjs'
import { computePlacementResult, PLACEMENT_QUESTIONS } from './placement-data.mjs'

test('buildPlacementCohortReport aggregates levels and hides full learner ids', () => {
  const answers = PLACEMENT_QUESTIONS.map((q) => ({ questionId: q.id, choiceIndex: q.correctIndex }))
  const placement = computePlacementResult({
    answers,
    startedAt: 1,
    finishedAt: 2,
    durationSeconds: 1,
    day: '2026-10-01',
    id: randomUUID(),
  })
  const learnerId = 'a'.repeat(64)
  const report = buildPlacementCohortReport([
    {
      id: learnerId,
      state: JSON.stringify({
        startDate: '2026-10-01',
        minutes: {},
        minimumMode: {},
        learning: { placement: { latest: placement, history: [placement] } },
      }),
    },
    { id: 'b'.repeat(64), state: JSON.stringify({ startDate: '2026-10-01', minutes: {}, minimumMode: {} }) },
  ])
  assert.equal(report.totalLearners, 2)
  assert.equal(report.placementCompleted, 1)
  assert.ok(report.byLevel.B2 >= 1 || report.byLevel['B2+'] >= 1)
  assert.equal(report.recent[0].learnerRef, learnerId.slice(0, 8))
  assert.equal(report.recent[0].learnerRef.length, 8)
})

test('admin placement cohort API requires bearer token', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-admin-'))
  const token = 'test-admin-token-' + 'x'.repeat(20)
  const server = createStudyServer({
    database: join(dir, 'study.sqlite'),
    origin: 'http://localhost:5173',
    adminToken: token,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`
  try {
    const config = await fetch(`${base}/api/study-plan/admin/config`)
    assert.equal(config.status, 200)
    assert.deepEqual(await config.json(), { enabled: true })

    const denied = await fetch(`${base}/api/study-plan/admin/placement-cohort`)
    assert.equal(denied.status, 401)

    const ok = await fetch(`${base}/api/study-plan/admin/placement-cohort`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(ok.status, 200)
    const body = await ok.json()
    assert.equal(body.report.totalLearners, 0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('authorizeAdminRequest rejects short tokens', () => {
  assert.equal(authorizeAdminRequest('Bearer x', 'short').ok, false)
})
