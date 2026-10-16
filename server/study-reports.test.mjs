import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'
import {
  STUDY_SCHEMA_VERSION,
  deleteNodeLearnerData,
  ensureNodeFeatureSchema,
  getNodeSchemaVersion,
} from './study-node-features.mjs'
import {
  REPORT_CATEGORIES,
  buildItemReportSnapshot,
  listItemReports,
  resolveItemReports,
  sanitizeReportNote,
  saveItemReport,
} from './study-reports.mjs'

const ADMIN_TOKEN = 'test-study-admin-token-12345'

function setupTestServer(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'study-reports-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: 'http://localhost:5173',
    adminToken: ADMIN_TOKEN,
    ...options,
  })
  return { dir, database, server }
}

test('migration v11 -> v12 creates item_reports table and migrates an existing DB forward', () => {
  assert.equal(STUDY_SCHEMA_VERSION, 15)
  const dir = mkdtempSync(join(tmpdir(), 'study-migration-v12-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
      CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
      CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
    `)
    ensureNodeFeatureSchema(db)

    // Simulate an existing v11 database
    db.exec('DROP TABLE item_reports;')
    db.prepare("UPDATE schema_meta SET value='11' WHERE key='schema_version'").run()
    db.prepare(`
      INSERT INTO error_book(learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,last_attempt_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `).run('learner_1', 'i1', 'vocabulary', 's1', 'label', 'ctx', 1, 0, 0, 1, 1)

    assert.equal(getNodeSchemaVersion(db), 11)

    // Forward migrate to v12
    ensureNodeFeatureSchema(db)

    assert.equal(getNodeSchemaVersion(db), STUDY_SCHEMA_VERSION)
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name))
    assert.ok(tables.has('item_reports'))
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM error_book').get().n, 1, 'existing error_book rows survive migration')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('deletion path removes all item reports when learner is deleted', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-reports-del-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
      CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
      CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
    `)
    ensureNodeFeatureSchema(db)

    const learner1 = 'learner_alpha'
    const learner2 = 'learner_beta'
    db.prepare('INSERT INTO learners(id,state) VALUES(?,NULL)').run(learner1)
    db.prepare('INSERT INTO learners(id,state) VALUES(?,NULL)').run(learner2)

    saveItemReport(db, {
      learner: learner1,
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
      note: 'alpha report 1',
    })
    saveItemReport(db, {
      learner: learner1,
      itemId: 'n1-reading-1',
      variant: 0,
      category: 'language-error',
      note: 'alpha report 2',
    })
    saveItemReport(db, {
      learner: learner2,
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
      note: 'beta report 1',
    })

    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM item_reports WHERE learner=?').get(learner1).n, 2)
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM item_reports WHERE learner=?').get(learner2).n, 1)

    deleteNodeLearnerData(db, learner1)

    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM item_reports WHERE learner=?').get(learner1).n, 0, 'learner1 reports removed')
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM item_reports WHERE learner=?').get(learner2).n, 1, 'learner2 reports remain intact')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/reports: validation, session requirement, untrusted snapshot ignored', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`

  let sessionCookie = ''

  const call = async (method, path = '', body, headers = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.headers.get('set-cookie') && !sessionCookie) {
      sessionCookie = response.headers.get('set-cookie').split(';')[0]
    }
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  try {
    // 1. Unauthenticated write attempt (no session cookie) fails with 401
    const unauth = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
    })
    assert.equal(unauth.response.status, 401)
    assert.equal(unauth.data.code, 'SESSION_REQUIRED')

    // 2. Establish session
    const init = await call('GET')
    assert.equal(init.response.status, 200)
    assert.ok(sessionCookie.startsWith('study_session='))

    // 3. Validation: missing required fields
    const missingKeys = await call('POST', '/reports', { itemId: 'n1-reading-0' })
    assert.equal(missingKeys.response.status, 400)
    assert.equal(missingKeys.data.code, 'REPORT_INVALID')

    // 4. Validation: unknown itemId
    const badItem = await call('POST', '/reports', {
      itemId: 'nonexistent-item-999',
      variant: 0,
      category: 'wrong-answer',
    })
    assert.equal(badItem.response.status, 400)
    assert.equal(badItem.data.code, 'ITEM_NOT_FOUND')

    // 5. Validation: invalid variant (negative, float, string)
    const badVariant1 = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: -1,
      category: 'wrong-answer',
    })
    assert.equal(badVariant1.response.status, 400)
    assert.equal(badVariant1.data.code, 'VARIANT_INVALID')

    const badVariant2 = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 1.5,
      category: 'wrong-answer',
    })
    assert.equal(badVariant2.response.status, 400)
    assert.equal(badVariant2.data.code, 'VARIANT_INVALID')

    // 6. Validation: invalid category
    const badCat = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'bogus-category',
    })
    assert.equal(badCat.response.status, 400)
    assert.equal(badCat.data.code, 'CATEGORY_INVALID')

    // 7. Validation: note too long (> 500 chars)
    const longNote = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
      note: 'x'.repeat(501),
    })
    assert.equal(longNote.response.status, 400)
    assert.equal(longNote.data.code, 'NOTE_TOO_LONG')

    // 8. Valid report with client-supplied spoofed snapshot
    // Client attempts to supply a fake snapshot, which must be IGNORED and rebuilt server-side
    const valid = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
      note: '答案不正确\x00\x08',
      snapshot: { evil: 'untrusted-client-snapshot', questions: [] },
    })
    assert.equal(valid.response.status, 200)
    assert.equal(valid.data.ok, true)
    assert.ok(valid.data.id)
    assert.equal(valid.data.deduped, false)

    // Inspect stored row: note has control chars stripped, snapshot contains authentic curriculum data
    const adminFetch = await call(
      'GET',
      `/admin/reports?status=open`,
      undefined,
      { Authorization: `Bearer ${ADMIN_TOKEN}` },
    )
    assert.equal(adminFetch.response.status, 200)
    const report = adminFetch.data.reports.find((r) => r.id === valid.data.id)
    assert.ok(report)
    assert.equal(report.note, '答案不正确') // Control characters stripped
    assert.equal(report.snapshot.itemId, 'n1-reading-0')
    assert.ok(report.snapshot.questions.length > 0)
    assert.equal(report.snapshot.evil, undefined) // Fake snapshot ignored!
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/reports: 24h dedupe updates existing row instead of inserting', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  let sessionCookie = ''

  const call = async (method, path = '', body, headers = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.headers.get('set-cookie') && !sessionCookie) {
      sessionCookie = response.headers.get('set-cookie').split(';')[0]
    }
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  try {
    await call('GET') // bootstrap session

    // Initial report
    const res1 = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 2,
      category: 'unclear',
      note: 'First note',
    })
    assert.equal(res1.response.status, 200)
    assert.equal(res1.data.deduped, false)
    const reportId = res1.data.id

    // Same learner, same item, same variant, same category -> dedupes, updates existing
    const res2 = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 2,
      category: 'unclear',
      note: 'Updated note with more details',
    })
    assert.equal(res2.response.status, 200)
    assert.equal(res2.data.ok, true)
    assert.equal(res2.data.id, reportId, 'returns same report id')
    assert.equal(res2.data.deduped, true)

    // Admin view verifies single row with updated note
    const admin = await call('GET', '/admin/reports', undefined, { Authorization: `Bearer ${ADMIN_TOKEN}` })
    const matching = admin.data.reports.filter((r) => r.itemId === 'n1-reading-0' && r.variant === 2)
    assert.equal(matching.length, 1, 'only one row exists due to deduplication')
    assert.equal(matching[0].note, 'Updated note with more details')

    // Same item + variant but DIFFERENT category -> NOT deduped, inserts new row
    const res3 = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 2,
      category: 'language-error',
      note: 'Grammar issue',
    })
    assert.equal(res3.response.status, 200)
    assert.equal(res3.data.deduped, false)
    assert.notEqual(res3.data.id, reportId)

    const admin2 = await call('GET', '/admin/reports', undefined, { Authorization: `Bearer ${ADMIN_TOKEN}` })
    const matching2 = admin2.data.reports.filter((r) => r.itemId === 'n1-reading-0' && r.variant === 2)
    assert.equal(matching2.length, 2, 'two rows now exist for different categories')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/reports: rate limiting per actor (20/hour cap)', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  let sessionCookie = ''

  const call = async (method, path = '', body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.headers.get('set-cookie') && !sessionCookie) {
      sessionCookie = response.headers.get('set-cookie').split(';')[0]
    }
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  try {
    await call('GET') // bootstrap session

    // Send 20 reports with different variants (avoid dedupe)
    for (let i = 0; i < 20; i++) {
      const res = await call('POST', '/reports', {
        itemId: 'n1-reading-0',
        variant: i,
        category: 'other',
        note: `report ${i}`,
      })
      assert.equal(res.response.status, 200, `report ${i} should succeed`)
    }

    // 21st report should be rate limited (429)
    const rateLimited = await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 99,
      category: 'other',
      note: 'one too many',
    })
    assert.equal(rateLimited.response.status, 429)
    assert.equal(rateLimited.data.code, 'REPORT_RATE_LIMITED')
    assert.ok(rateLimited.data.retryAfterSeconds > 0)
    assert.ok(rateLimited.response.headers.get('retry-after'))
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('Admin endpoints: auth required, listing, aggregate view, CSV export, resolve', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  let sessionCookie = ''

  const call = async (method, path = '', body, headers = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.headers.get('set-cookie') && !sessionCookie) {
      sessionCookie = response.headers.get('set-cookie').split(';')[0]
    }
    return response
  }

  try {
    // 1. Unauthenticated admin requests are rejected
    const unauthGet = await call('GET', '/admin/reports')
    assert.equal(unauthGet.status, 401)
    const badTokenGet = await call('GET', '/admin/reports', undefined, { Authorization: 'Bearer wrong-token' })
    assert.equal(badTokenGet.status, 401)
    const unauthResolve = await call('POST', '/admin/reports/resolve', { id: 'some-id' })
    assert.equal(unauthResolve.status, 401)

    // 2. Create reports as learner
    await call('GET') // bootstrap
    const rep1 = await (await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 0,
      category: 'wrong-answer',
      note: 'Question 1 answer key is wrong',
    })).json()
    const rep2 = await (await call('POST', '/reports', {
      itemId: 'n1-reading-0',
      variant: 1,
      category: 'language-error',
      note: 'Grammar typo in text',
    })).json()

    // 3. Authorized admin list
    const adminRes = await call('GET', '/admin/reports?status=open', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminRes.status, 200)
    const adminData = await adminRes.json()
    assert.equal(adminData.ok, true)
    assert.ok(adminData.reports.length >= 2)
    assert.ok(adminData.aggregate.length >= 2)

    // Check aggregate structure
    const agg = adminData.aggregate.find((a) => a.itemId === 'n1-reading-0' && a.variant === 0)
    assert.ok(agg)
    assert.equal(agg.count, 1)
    assert.equal(agg.openCount, 1)
    assert.equal(agg.categories['wrong-answer'], 1)

    // 4. CSV export
    const csvRes = await call('GET', '/admin/reports.csv', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(csvRes.status, 200)
    assert.match(csvRes.headers.get('content-type') || '', /text\/csv/)
    const csvText = await csvRes.text()
    assert.ok(csvText.includes('id,item_id,variant,category,status,note,created_at'))
    assert.ok(csvText.includes('n1-reading-0'))
    assert.ok(csvText.includes('Question 1 answer key is wrong'))

    // 5. Resolve report
    const resolveRes = await call(
      'POST',
      '/admin/reports/resolve',
      { id: rep1.id },
      { Authorization: `Bearer ${ADMIN_TOKEN}` },
    )
    assert.equal(resolveRes.status, 200)
    const resolveData = await resolveRes.json()
    assert.equal(resolveData.ok, true)
    assert.equal(resolveData.resolved, 1)

    // Verify status changed to resolved
    const openAfter = await (await call('GET', '/admin/reports?status=open', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })).json()
    assert.equal(openAfter.reports.some((r) => r.id === rep1.id), false)
    assert.equal(openAfter.reports.some((r) => r.id === rep2.id), true)

    const allAfter = await (await call('GET', '/admin/reports?status=all', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })).json()
    const resolvedItem = allAfter.reports.find((r) => r.id === rep1.id)
    assert.equal(resolvedItem.status, 'resolved')
    assert.ok(resolvedItem.resolvedAt > 0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
