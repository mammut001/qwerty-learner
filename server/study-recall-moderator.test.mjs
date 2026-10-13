import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { authorizeRecallModeration } from './study-admin.mjs'
import { createStudyServer } from './study-plan.mjs'

const ADMIN_TOKEN = 'test-study-admin-token-12345'
const MOD_TOKEN = 'test-study-moderator-token-67890'

// ---------------------------------------------------------------------------
// Unit tests: authorizeRecallModeration helper matrix
// ---------------------------------------------------------------------------

test('unit: helper matrix - admin token only configured', () => {
  const tokens = { adminToken: ADMIN_TOKEN, moderatorToken: '' }

  // Right admin token -> success with role 'admin'
  const rightAdmin = authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, tokens)
  assert.equal(rightAdmin.ok, true)
  assert.equal(rightAdmin.role, 'admin')

  // Moderator token presented -> unauthorized (401)
  const modAttempt = authorizeRecallModeration(`Bearer ${MOD_TOKEN}`, tokens)
  assert.equal(modAttempt.ok, false)
  assert.equal(modAttempt.status, 401)
  assert.equal(modAttempt.code, 'ADMIN_UNAUTHORIZED')

  // Wrong token -> unauthorized (401)
  const wrongToken = authorizeRecallModeration('Bearer completely-wrong-token-123', tokens)
  assert.equal(wrongToken.ok, false)
  assert.equal(wrongToken.status, 401)
  assert.equal(wrongToken.code, 'ADMIN_UNAUTHORIZED')

  // Missing header -> unauthorized (401)
  const missingHeader = authorizeRecallModeration(undefined, tokens)
  assert.equal(missingHeader.ok, false)
  assert.equal(missingHeader.status, 401)
  assert.equal(missingHeader.code, 'ADMIN_UNAUTHORIZED')

  // Short moderator token (<16 chars) is treated as not configured
  const shortModTokens = { adminToken: ADMIN_TOKEN, moderatorToken: 'short-token' }
  const shortModAttempt = authorizeRecallModeration('Bearer short-token', shortModTokens)
  assert.equal(shortModAttempt.ok, false)
  assert.equal(shortModAttempt.status, 401)
})

test('unit: helper matrix - moderator token only configured', () => {
  const tokens = { adminToken: '', moderatorToken: MOD_TOKEN }

  // Right moderator token -> success with role 'moderator'
  const rightMod = authorizeRecallModeration(`Bearer ${MOD_TOKEN}`, tokens)
  assert.equal(rightMod.ok, true)
  assert.equal(rightMod.role, 'moderator')

  // Admin token presented -> unauthorized (401)
  const adminAttempt = authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, tokens)
  assert.equal(adminAttempt.ok, false)
  assert.equal(adminAttempt.status, 401)
  assert.equal(adminAttempt.code, 'ADMIN_UNAUTHORIZED')

  // Wrong token -> unauthorized (401)
  const wrongToken = authorizeRecallModeration('Bearer completely-wrong-token-123', tokens)
  assert.equal(wrongToken.ok, false)
  assert.equal(wrongToken.status, 401)
  assert.equal(wrongToken.code, 'ADMIN_UNAUTHORIZED')

  // Missing header -> unauthorized (401)
  const missingHeader = authorizeRecallModeration(undefined, tokens)
  assert.equal(missingHeader.ok, false)
  assert.equal(missingHeader.status, 401)
  assert.equal(missingHeader.code, 'ADMIN_UNAUTHORIZED')

  // Short admin token (<16 chars) is treated as not configured
  const shortAdminTokens = { adminToken: 'short-admin', moderatorToken: MOD_TOKEN }
  const shortAdminAttempt = authorizeRecallModeration('Bearer short-admin', shortAdminTokens)
  assert.equal(shortAdminAttempt.ok, false)
  assert.equal(shortAdminAttempt.status, 401)
})

test('unit: helper matrix - both tokens configured', () => {
  const tokens = { adminToken: ADMIN_TOKEN, moderatorToken: MOD_TOKEN }

  // Right admin token -> success with role 'admin'
  const rightAdmin = authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, tokens)
  assert.equal(rightAdmin.ok, true)
  assert.equal(rightAdmin.role, 'admin')

  // Right moderator token -> success with role 'moderator'
  const rightMod = authorizeRecallModeration(`Bearer ${MOD_TOKEN}`, tokens)
  assert.equal(rightMod.ok, true)
  assert.equal(rightMod.role, 'moderator')

  // Supports recallModeratorToken property name as well
  const altTokens = { adminToken: ADMIN_TOKEN, recallModeratorToken: MOD_TOKEN }
  const altMod = authorizeRecallModeration(`Bearer ${MOD_TOKEN}`, altTokens)
  assert.equal(altMod.ok, true)
  assert.equal(altMod.role, 'moderator')

  // Wrong token -> unauthorized (401)
  const wrongToken = authorizeRecallModeration('Bearer completely-wrong-token-123', tokens)
  assert.equal(wrongToken.ok, false)
  assert.equal(wrongToken.status, 401)
  assert.equal(wrongToken.code, 'ADMIN_UNAUTHORIZED')

  // Missing header -> unauthorized (401)
  const missingHeader = authorizeRecallModeration(undefined, tokens)
  assert.equal(missingHeader.ok, false)
  assert.equal(missingHeader.status, 401)
  assert.equal(missingHeader.code, 'ADMIN_UNAUTHORIZED')
})

test('unit: helper matrix - neither token configured', () => {
  const emptyTokens = { adminToken: '', moderatorToken: '' }

  // With a bearer token -> 503 ADMIN_DISABLED
  const withToken = authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, emptyTokens)
  assert.equal(withToken.ok, false)
  assert.equal(withToken.status, 503)
  assert.equal(withToken.code, 'ADMIN_DISABLED')

  // Missing header -> 503 ADMIN_DISABLED
  const missingHeader = authorizeRecallModeration(undefined, emptyTokens)
  assert.equal(missingHeader.ok, false)
  assert.equal(missingHeader.status, 503)
  assert.equal(missingHeader.code, 'ADMIN_DISABLED')

  // Empty object / undefined options -> 503 ADMIN_DISABLED
  assert.equal(authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, {}).status, 503)
  assert.equal(authorizeRecallModeration(undefined, {}).status, 503)
  assert.equal(authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`).status, 503)

  // Both tokens short (<16 chars) -> 503 ADMIN_DISABLED
  const shortBoth = authorizeRecallModeration(`Bearer ${ADMIN_TOKEN}`, {
    adminToken: 'too-short',
    moderatorToken: 'also-short',
  })
  assert.equal(shortBoth.ok, false)
  assert.equal(shortBoth.status, 503)
  assert.equal(shortBoth.code, 'ADMIN_DISABLED')
})

test('unit: helper - both tokens configured and identical treats match as admin', () => {
  const shared = 'identical-secret-token-12345'
  const tokens = { adminToken: shared, moderatorToken: shared }

  const match = authorizeRecallModeration(`Bearer ${shared}`, tokens)
  assert.equal(match.ok, true)
  assert.equal(match.role, 'admin')
})

// ---------------------------------------------------------------------------
// API integration tests
// ---------------------------------------------------------------------------

function setupTestServer(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'study-mod-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: 'http://localhost:5173',
    ...options,
  })
  return { dir, database, server }
}

async function callApi(server, method, path, body, headers = {}) {
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: 'http://localhost:5173',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  return { response, data }
}

test('API: with both tokens configured - moderator access scope vs admin access scope', async () => {
  const { dir, database, server } = setupTestServer({
    adminToken: ADMIN_TOKEN,
    recallModeratorToken: MOD_TOKEN,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    // 1. Submit a recall item to review
    const submitRes = await callApi(server, 'POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Sujet sur les loisirs et la vie associative',
    })
    assert.equal(submitRes.response.status, 200)
    const recallId = submitRes.data.id
    assert.ok(recallId)

    // 2. Moderator can GET pending recalls
    const modGet = await callApi(server, 'GET', '/admin/recalls?status=pending', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modGet.response.status, 200)
    assert.equal(modGet.data.ok, true)
    const found = modGet.data.items.find((i) => i.id === recallId)
    assert.ok(found)

    // 3. Moderator can POST review (approve)
    const modReview = await callApi(
      server,
      'POST',
      '/admin/recalls/review',
      { ids: [recallId], action: 'approve' },
      { Authorization: `Bearer ${MOD_TOKEN}` },
    )
    assert.equal(modReview.response.status, 200)
    assert.equal(modReview.data.ok, true)
    assert.equal(modReview.data.reviewed, 1)

    // 4. Verify audit log recorded role: 'moderator'
    const db1 = new DatabaseSync(database)
    try {
      const getAudit = db1
        .prepare('SELECT action, status, details FROM audit_log WHERE action = ? ORDER BY created_at DESC LIMIT 1')
        .get('admin_recalls')
      assert.equal(getAudit?.status, 'success')
      const getDetails = JSON.parse(getAudit.details)
      assert.equal(getDetails.role, 'moderator')

      const reviewAudit = db1
        .prepare('SELECT action, status, details FROM audit_log WHERE action = ? ORDER BY created_at DESC LIMIT 1')
        .get('admin_recalls_review')
      assert.equal(reviewAudit?.status, 'success')
      const reviewDetails = JSON.parse(reviewAudit.details)
      assert.equal(reviewDetails.role, 'moderator')
      assert.equal(reviewDetails.action, 'approve')
    } finally {
      db1.close()
    }

    // 5. Moderator token gets 401 on other admin endpoints
    const modReports = await callApi(server, 'GET', '/admin/reports', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modReports.response.status, 401)

    const modReportsResolve = await callApi(
      server,
      'POST',
      '/admin/reports/resolve',
      { id: 'item-123' },
      { Authorization: `Bearer ${MOD_TOKEN}` },
    )
    assert.equal(modReportsResolve.response.status, 401)

    const modCohorts = await callApi(server, 'GET', '/admin/cohorts', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modCohorts.response.status, 401)

    const modPlacement = await callApi(server, 'GET', '/admin/placement-cohort', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modPlacement.response.status, 401)

    // 6. Admin token still works on all endpoints
    // Recalls list
    const adminGet = await callApi(server, 'GET', '/admin/recalls?status=all', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminGet.response.status, 200)

    // Recalls review
    const adminReview = await callApi(
      server,
      'POST',
      '/admin/recalls/review',
      { ids: [recallId], action: 'reject' },
      { Authorization: `Bearer ${ADMIN_TOKEN}` },
    )
    assert.equal(adminReview.response.status, 200)
    assert.equal(adminReview.data.reviewed, 1)

    // Verify audit log recorded role: 'admin'
    const db2 = new DatabaseSync(database)
    try {
      const adminReviewAudit = db2
        .prepare('SELECT action, status, details FROM audit_log WHERE action = ? ORDER BY created_at DESC LIMIT 1')
        .get('admin_recalls_review')
      assert.equal(adminReviewAudit?.status, 'success')
      assert.equal(JSON.parse(adminReviewAudit.details).role, 'admin')
    } finally {
      db2.close()
    }

    // Other admin endpoints work with admin token
    const adminReports = await callApi(server, 'GET', '/admin/reports', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminReports.response.status, 200)

    const adminCohorts = await callApi(server, 'GET', '/admin/cohorts', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminCohorts.response.status, 200)

    const adminPlacement = await callApi(server, 'GET', '/admin/placement-cohort', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminPlacement.response.status, 200)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('API: with only moderator token configured - recall endpoints work and reports endpoint returns 503', async () => {
  const { dir, server } = setupTestServer({
    adminToken: '',
    recallModeratorToken: MOD_TOKEN,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    // Submit a recall
    const submitRes = await callApi(server, 'POST', '/recalls', {
      section: 'writing',
      task: 2,
      examMonth: '2026-10',
      topic: 'Article de blog sur la cuisine traditionnelle',
    })
    assert.equal(submitRes.response.status, 200)
    const recallId = submitRes.data.id

    // Moderator can list recalls
    const modGet = await callApi(server, 'GET', '/admin/recalls?status=pending', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modGet.response.status, 200)
    assert.equal(modGet.data.ok, true)

    // Moderator can review recalls
    const modReview = await callApi(
      server,
      'POST',
      '/admin/recalls/review',
      { ids: [recallId], action: 'approve' },
      { Authorization: `Bearer ${MOD_TOKEN}` },
    )
    assert.equal(modReview.response.status, 200)
    assert.equal(modReview.data.reviewed, 1)

    // /api/study-plan/admin/reports answers 503 because adminToken is not configured
    const modReports = await callApi(server, 'GET', '/admin/reports', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(modReports.response.status, 503)

    const noAuthReports = await callApi(server, 'GET', '/admin/reports')
    assert.equal(noAuthReports.response.status, 503)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('API: with neither token configured - recall admin endpoints return 503', async () => {
  const { dir, server } = setupTestServer({
    adminToken: '',
    recallModeratorToken: '',
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    const recallsGet = await callApi(server, 'GET', '/admin/recalls', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(recallsGet.response.status, 503)

    const recallsReview = await callApi(
      server,
      'POST',
      '/admin/recalls/review',
      { ids: ['some-id'], action: 'approve' },
      { Authorization: `Bearer ${MOD_TOKEN}` },
    )
    assert.equal(recallsReview.response.status, 503)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('API: default recallModeratorToken option falls back to process.env.STUDY_RECALL_MODERATOR_TOKEN', async () => {
  const originalEnv = process.env.STUDY_RECALL_MODERATOR_TOKEN
  process.env.STUDY_RECALL_MODERATOR_TOKEN = MOD_TOKEN
  const { dir, server } = setupTestServer({ adminToken: '' })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const res = await callApi(server, 'GET', '/admin/recalls', undefined, {
      Authorization: `Bearer ${MOD_TOKEN}`,
    })
    assert.equal(res.response.status, 200)
  } finally {
    if (originalEnv === undefined) delete process.env.STUDY_RECALL_MODERATOR_TOKEN
    else process.env.STUDY_RECALL_MODERATOR_TOKEN = originalEnv
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

