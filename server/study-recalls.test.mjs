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
  ALLOWED_SECTIONS,
  ALLOWED_TASKS_BY_SECTION,
  MAX_PENDING_RECALLS,
  containsUrl,
  isValidExamMonth,
  isValidSection,
  isValidTask,
  listApprovedRecalls,
  listRecallsForAdmin,
  normalizeTopic,
  reviewRecalls,
  sanitizeText,
  saveExamRecall,
  validateRecallInput,
} from './study-recalls.mjs'

const ADMIN_TOKEN = 'test-study-admin-token-12345'

function setupTestServer(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: 'http://localhost:5173',
    adminToken: ADMIN_TOKEN,
    ...options,
  })
  return { dir, database, server }
}

function createMockVerifier() {
  const users = {
    'token-alice': { uid: 'uid-alice', email: 'alice@example.test', name: 'Alice', picture: '' },
  }
  return {
    async verify(token) {
      const user = users[token]
      if (!user) throw new Error('FIREBASE_TOKEN_INVALID')
      return { ...user }
    },
  }
}

test('migration v12 -> v13 creates exam_recalls table and migrates an existing DB forward', () => {
  assert.equal(STUDY_SCHEMA_VERSION, 13)
  const dir = mkdtempSync(join(tmpdir(), 'study-migration-v13-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
      CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
      CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
    `)
    ensureNodeFeatureSchema(db)

    // Simulate an existing v12 database
    db.exec('DROP TABLE exam_recalls;')
    db.prepare("UPDATE schema_meta SET value='12' WHERE key='schema_version'").run()
    db.prepare(`
      INSERT INTO error_book(learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,last_attempt_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `).run('learner_1', 'i1', 'vocabulary', 's1', 'label', 'ctx', 1, 0, 0, 1, 1)

    assert.equal(getNodeSchemaVersion(db), 12)

    // Forward migrate to v13
    ensureNodeFeatureSchema(db)

    assert.equal(getNodeSchemaVersion(db), 13)
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name))
    assert.ok(tables.has('exam_recalls'))
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM error_book').get().n, 1, 'existing error_book rows survive migration')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('deletion path removes all exam recalls when learner or account is deleted', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-del-'))
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
    const account1 = 'account_alpha'
    db.prepare('INSERT INTO learners(id,state) VALUES(?,NULL)').run(learner1)
    db.prepare('INSERT INTO learners(id,state) VALUES(?,NULL)').run(learner2)
    db.prepare('INSERT INTO accounts(id,learner,user_handle,created_at) VALUES(?,?,?,?)').run(account1, learner1, 'alpha', 100)

    saveExamRecall(db, {
      learner: learner1,
      accountId: account1,
      section: 'speaking',
      task: 2,
      examMonth: '2026-09',
      city: 'Paris',
      topic: 'Topic 1 for alpha with sufficient length',
    })
    saveExamRecall(db, {
      learner: learner1,
      accountId: account1,
      section: 'writing',
      task: 1,
      examMonth: '2026-09',
      city: 'Lyon',
      topic: 'Topic 2 for alpha with sufficient length',
    })
    saveExamRecall(db, {
      learner: learner2,
      accountId: null,
      section: 'speaking',
      task: 3,
      examMonth: '2026-09',
      city: 'Montreal',
      topic: 'Topic 3 for beta with sufficient length',
    })

    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exam_recalls WHERE learner=?').get(learner1).n, 2)
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exam_recalls WHERE learner=?').get(learner2).n, 1)

    deleteNodeLearnerData(db, learner1)

    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exam_recalls WHERE learner=?').get(learner1).n, 0, 'learner1 recalls removed')
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exam_recalls WHERE account_id=?').get(account1).n, 0, 'account1 recalls removed')
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exam_recalls WHERE learner=?').get(learner2).n, 1, 'learner2 recalls remain intact')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('pure validation helpers: sections, tasks, exam month range, text sanitization, URL rejection', () => {
  // Sections
  assert.equal(isValidSection('speaking'), true)
  assert.equal(isValidSection('writing'), true)
  assert.equal(isValidSection('listening'), false)
  assert.equal(isValidSection('reading'), false)
  assert.equal(isValidSection(''), false)
  assert.equal(isValidSection(null), false)

  // Tasks per section
  // speaking: 2, 3
  assert.equal(isValidTask('speaking', 2), true)
  assert.equal(isValidTask('speaking', 3), true)
  assert.equal(isValidTask('speaking', 1), false)
  assert.equal(isValidTask('speaking', 4), false)
  assert.equal(isValidTask('speaking', 2.5), false)

  // writing: 1, 2, 3
  assert.equal(isValidTask('writing', 1), true)
  assert.equal(isValidTask('writing', 2), true)
  assert.equal(isValidTask('writing', 3), true)
  assert.equal(isValidTask('writing', 4), false)
  assert.equal(isValidTask('writing', 0), false)

  // Exam month: fixed anchor for tests (2026-10-15 UTC)
  const fixedNowMs = Date.UTC(2026, 9, 15) // Month is 0-indexed: 9 = October
  assert.equal(isValidExamMonth('2026-10', fixedNowMs), true, 'current month is valid')
  assert.equal(isValidExamMonth('2026-09', fixedNowMs), true, 'last month is valid')
  assert.equal(isValidExamMonth('2024-10', fixedNowMs), true, '24 months ago is valid')
  assert.equal(isValidExamMonth('2024-09', fixedNowMs), false, '25 months ago is older than 24 months')
  assert.equal(isValidExamMonth('2026-11', fixedNowMs), false, 'future month is invalid')
  assert.equal(isValidExamMonth('2027-01', fixedNowMs), false, 'future year is invalid')
  assert.equal(isValidExamMonth('2026-00', fixedNowMs), false, 'month 00 is invalid format')
  assert.equal(isValidExamMonth('2026-13', fixedNowMs), false, 'month 13 is invalid format')
  assert.equal(isValidExamMonth('bad-month', fixedNowMs), false, 'arbitrary string is invalid format')

  // URL detection
  assert.equal(containsUrl('Check http://spam.xyz now'), true)
  assert.equal(containsUrl('Check https://spam.xyz now'), true)
  assert.equal(containsUrl('Check www.spam.xyz now'), true)
  assert.equal(containsUrl('Check WWW.SPAM.XYZ now'), true)
  assert.equal(containsUrl('Check HTTPS://SPAM.XYZ now'), true)
  assert.equal(containsUrl('Un sujet ordinaire sur le voyage'), false)

  // Text sanitization
  assert.equal(sanitizeText('hello\x00\x08world\x1f'), 'helloworld')
  assert.equal(normalizeTopic('  Bonjour   Le  MONDE!  '), 'bonjour le monde!')

  // validateRecallInput comprehensive check
  const validPayload = {
    section: 'speaking',
    task: 2,
    examMonth: '2026-10',
    city: 'Montpellier',
    topic: 'Parlez de vos dernieres vacances en famille',
    note: 'Examinateur tres agreable',
  }
  const okResult = validateRecallInput(validPayload, { nowMs: fixedNowMs })
  assert.equal(okResult.ok, true)
  assert.equal(okResult.data.city, 'Montpellier')

  // Topic length constraints (10 - 800)
  assert.equal(validateRecallInput({ ...validPayload, topic: 'short' }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, topic: 'a'.repeat(801) }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, topic: 'a'.repeat(10) }, { nowMs: fixedNowMs }).ok, true)
  assert.equal(validateRecallInput({ ...validPayload, topic: 'a'.repeat(800) }, { nowMs: fixedNowMs }).ok, true)

  // City length constraint (<= 40)
  assert.equal(validateRecallInput({ ...validPayload, city: 'c'.repeat(41) }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, city: 'c'.repeat(40) }, { nowMs: fixedNowMs }).ok, true)

  // Note length constraint (<= 300)
  assert.equal(validateRecallInput({ ...validPayload, note: 'n'.repeat(301) }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, note: 'n'.repeat(300) }, { nowMs: fixedNowMs }).ok, true)

  // URL in topic / city / note rejected
  assert.equal(validateRecallInput({ ...validPayload, topic: 'Visitez http://exam.com pour voir le sujet' }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, city: 'www.paris.fr' }, { nowMs: fixedNowMs }).ok, false)
  assert.equal(validateRecallInput({ ...validPayload, note: 'Voir https://tips.fr' }, { nowMs: fixedNowMs }).ok, false)
})

test('saveExamRecall: status pending, deduplication per learner/section/task/month/topic', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-save-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    ensureNodeFeatureSchema(db)

    const payload = {
      learner: 'learner_1',
      accountId: 'account_1',
      section: 'speaking',
      task: 2,
      examMonth: '2026-09',
      city: 'Paris',
      topic: 'Racontez un souvenir marquant de vos etudes',
      note: 'Premiere note',
      nowMs: 1000,
    }

    const first = saveExamRecall(db, payload)
    assert.equal(first.deduped, false)
    assert.equal(first.status, 'pending')
    assert.ok(first.id)

    // Verify row in DB
    const row = db.prepare('SELECT * FROM exam_recalls WHERE id=?').get(first.id)
    assert.equal(row.status, 'pending')
    assert.equal(row.city, 'Paris')
    assert.equal(row.note, 'Premiere note')

    // Same learner submitting same normalized topic with differing whitespace and case -> dedupes
    const second = saveExamRecall(db, {
      ...payload,
      topic: '  RACONTEZ   un souvenir marquant de VOS etudes  ',
      city: 'Paris 15e',
      note: 'Note mise a jour',
      nowMs: 2000,
    })
    assert.equal(second.deduped, true)
    assert.equal(second.id, first.id)
    assert.equal(second.status, 'pending')

    // Row remains unchanged on dedupe (security guard: submitter cannot alter existing row)
    const unchangedRow = db.prepare('SELECT * FROM exam_recalls WHERE id=?').get(first.id)
    assert.equal(unchangedRow.city, 'Paris')
    assert.equal(unchangedRow.note, 'Premiere note')

    // Different section -> NOT deduped
    const diffSection = saveExamRecall(db, { ...payload, section: 'writing', task: 1 })
    assert.equal(diffSection.deduped, false)
    assert.notEqual(diffSection.id, first.id)

    // Different task -> NOT deduped
    const diffTask = saveExamRecall(db, { ...payload, task: 3 })
    assert.equal(diffTask.deduped, false)
    assert.notEqual(diffTask.id, first.id)

    // Different month -> NOT deduped
    const diffMonth = saveExamRecall(db, { ...payload, examMonth: '2026-08' })
    assert.equal(diffMonth.deduped, false)
    assert.notEqual(diffMonth.id, first.id)

    // Different learner -> NOT deduped
    const diffLearner = saveExamRecall(db, { ...payload, learner: 'learner_2' })
    assert.equal(diffLearner.deduped, false)
    assert.notEqual(diffLearner.id, first.id)

    // Guest without learner (learner = null) -> NOT deduped
    const guest1 = saveExamRecall(db, { ...payload, learner: null })
    const guest2 = saveExamRecall(db, { ...payload, learner: null })
    assert.equal(guest1.deduped, false)
    assert.equal(guest2.deduped, false)
    assert.notEqual(guest1.id, guest2.id)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('listApprovedRecalls and reviewRecalls: pending hidden, approved visible, rejected hidden, no sensitive fields', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-list-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    ensureNodeFeatureSchema(db)

    const r1 = saveExamRecall(db, {
      learner: 'learner_secret_1',
      accountId: 'account_secret_1',
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      city: 'Marseille',
      topic: 'Topic 1 approved for speaking task 2',
      note: 'Note 1',
    })
    const r2 = saveExamRecall(db, {
      learner: 'learner_secret_2',
      accountId: 'account_secret_2',
      section: 'speaking',
      task: 3,
      examMonth: '2026-09',
      city: 'Nice',
      topic: 'Topic 2 approved for speaking task 3',
      note: 'Note 2',
    })
    const r3 = saveExamRecall(db, {
      learner: 'learner_secret_3',
      accountId: 'account_secret_3',
      section: 'writing',
      task: 1,
      examMonth: '2026-10',
      city: 'Bordeaux',
      topic: 'Topic 3 pending that will stay pending',
      note: 'Note 3',
    })

    // 1. Pending items are completely hidden in approved list
    let approved = listApprovedRecalls(db)
    assert.equal(approved.total, 0)
    assert.equal(approved.items.length, 0)

    // Admin list shows all 3 pending
    let adminPending = listRecallsForAdmin(db, { status: 'pending' })
    assert.equal(adminPending.total, 3)
    assert.equal(adminPending.items.length, 3)

    // 2. Approve r1 and r2
    const reviewResult = reviewRecalls(db, { ids: [r1.id, r2.id], action: 'approve' })
    assert.equal(reviewResult.count, 2)

    // 3. Approved items are now visible
    approved = listApprovedRecalls(db)
    assert.equal(approved.total, 2)
    assert.equal(approved.items.length, 2)

    // 4. Verify ONLY allowed fields exist on public objects: no learner, no account_id, no status
    for (const item of approved.items) {
      assert.ok(item.id)
      assert.ok(item.section)
      assert.ok(typeof item.task === 'number')
      assert.ok(item.examMonth)
      assert.ok(item.city !== undefined)
      assert.ok(item.topic)
      assert.ok(item.note !== undefined)
      assert.ok(typeof item.createdAt === 'number')

      // Assert ABSOLUTELY NO identifiers or internal columns
      assert.equal(item.learner, undefined, 'learner must not be exposed')
      assert.equal(item.accountId, undefined, 'accountId must not be exposed')
      assert.equal(item.account_id, undefined, 'account_id must not be exposed')
      assert.equal(item.status, undefined, 'status must not be exposed in public list')
      assert.equal(item.dedupeKey, undefined, 'dedupeKey must not be exposed')
      assert.equal(item.reviewedAt, undefined, 'reviewedAt must not be exposed in public list')
    }

    // 5. Reject r1 -> becomes hidden
    reviewRecalls(db, { ids: [r1.id], action: 'reject' })
    approved = listApprovedRecalls(db)
    assert.equal(approved.total, 1)
    assert.equal(approved.items[0].id, r2.id)

    // 6. Filtering and pagination
    // Add another approved writing item
    const r4 = saveExamRecall(db, {
      learner: 'learner_4',
      section: 'writing',
      task: 2,
      examMonth: '2026-10',
      topic: 'Topic 4 approved for writing task 2',
    })
    reviewRecalls(db, { ids: [r4.id], action: 'approve' })

    const filterSpeaking = listApprovedRecalls(db, { section: 'speaking' })
    assert.equal(filterSpeaking.total, 1)
    assert.equal(filterSpeaking.items[0].id, r2.id)

    const filterWriting = listApprovedRecalls(db, { section: 'writing' })
    assert.equal(filterWriting.total, 1)
    assert.equal(filterWriting.items[0].id, r4.id)

    const filterTask3 = listApprovedRecalls(db, { task: 3 })
    assert.equal(filterTask3.total, 1)
    assert.equal(filterTask3.items[0].id, r2.id)

    const filterMonth10 = listApprovedRecalls(db, { month: '2026-10' })
    assert.equal(filterMonth10.total, 1)
    assert.equal(filterMonth10.items[0].id, r4.id)

    // Pagination
    const pageLimit1 = listApprovedRecalls(db, { limit: 1, offset: 0 })
    assert.equal(pageLimit1.items.length, 1)
    assert.equal(pageLimit1.total, 2)

    const pageOffset1 = listApprovedRecalls(db, { limit: 1, offset: 1 })
    assert.equal(pageOffset1.items.length, 1)
    assert.notEqual(pageLimit1.items[0].id, pageOffset1.items[0].id)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('API endpoints: guest submit under required auth, public listing, rate limiting, admin flow', async () => {
  const { dir, server } = setupTestServer({
    authRequired: true,
    firebaseVerifier: createMockVerifier(),
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`

  const call = async (method, path = '', body, headers = {}) => {
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

  try {
    // 1. GET /recalls: public list works for guests even under authRequired: true
    const publicGet = await call('GET', '/recalls')
    assert.equal(publicGet.response.status, 200)
    assert.equal(publicGet.data.ok, true)
    assert.deepEqual(publicGet.data.items, [])
    assert.equal(publicGet.data.total, 0)

    // 2. POST /recalls: guest submit works even under authRequired: true with no session/cookie
    const guestSubmit = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      city: 'Beijing',
      topic: 'Sujet sur les loisirs et les activites sportives',
      note: 'Examinateur neutre',
    })
    assert.equal(guestSubmit.response.status, 200)
    assert.equal(guestSubmit.data.ok, true)
    assert.equal(guestSubmit.data.status, 'pending')
    assert.ok(guestSubmit.data.id)
    const recallId = guestSubmit.data.id

    // 3. Pending topic does NOT appear in public list
    const publicAfterSubmit = await call('GET', '/recalls')
    assert.equal(publicAfterSubmit.response.status, 200)
    assert.equal(publicAfterSubmit.data.items.length, 0)

    // 4. Validation errors on POST /recalls
    const badKeys = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Sujet valide mais avec cle en trop',
      extraKey: 'not allowed',
    })
    assert.equal(badKeys.response.status, 400)
    assert.equal(badKeys.data.code, 'RECALL_INVALID')

    const badSection = await call('POST', '/recalls', {
      section: 'invalid-section',
      task: 2,
      examMonth: '2026-10',
      topic: 'Sujet avec section invalide ici',
    })
    assert.equal(badSection.response.status, 400)
    assert.equal(badSection.data.code, 'RECALL_INVALID')

    const spamTopic = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Regardez sur http://spam-links.com pour les questions',
    })
    assert.equal(spamTopic.response.status, 400)
    assert.equal(spamTopic.data.code, 'RECALL_INVALID')

    // 5. Admin endpoints authorization checks
    const unauthAdmin = await call('GET', '/admin/recalls')
    assert.equal(unauthAdmin.response.status, 401)

    const wrongTokenAdmin = await call('GET', '/admin/recalls', undefined, {
      Authorization: 'Bearer wrong-admin-token',
    })
    assert.equal(wrongTokenAdmin.response.status, 401)

    const unauthReview = await call('POST', '/admin/recalls/review', { ids: [recallId], action: 'approve' })
    assert.equal(unauthReview.response.status, 401)

    // 6. Authorized admin listing
    const adminGet = await call('GET', '/admin/recalls?status=pending', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminGet.response.status, 200)
    assert.equal(adminGet.data.ok, true)
    const pendingItem = adminGet.data.items.find((i) => i.id === recallId)
    assert.ok(pendingItem)
    assert.equal(pendingItem.topic, 'Sujet sur les loisirs et les activites sportives')
    assert.equal(pendingItem.status, 'pending')

    // 7. Admin reviews and approves the recall
    const approveRes = await call(
      'POST',
      '/admin/recalls/review',
      { ids: [recallId], action: 'approve' },
      { Authorization: `Bearer ${ADMIN_TOKEN}` },
    )
    assert.equal(approveRes.response.status, 200)
    assert.equal(approveRes.data.ok, true)
    assert.equal(approveRes.data.reviewed, 1)

    // 8. Public list now displays the approved recall
    const publicAfterApprove = await call('GET', '/recalls')
    assert.equal(publicAfterApprove.response.status, 200)
    assert.equal(publicAfterApprove.data.items.length, 1)
    const approvedItem = publicAfterApprove.data.items[0]
    assert.equal(approvedItem.id, recallId)
    assert.equal(approvedItem.topic, 'Sujet sur les loisirs et les activites sportives')
    assert.equal(approvedItem.section, 'speaking')
    assert.equal(approvedItem.task, 2)
    assert.equal(approvedItem.examMonth, '2026-10')
    assert.equal(approvedItem.city, 'Beijing')
    // No learner/account leak in public response
    assert.equal(approvedItem.learner, undefined)
    assert.equal(approvedItem.accountId, undefined)

    // 9. Admin reviews and rejects the recall
    const rejectRes = await call(
      'POST',
      '/admin/recalls/review',
      { ids: [recallId], action: 'reject' },
      { Authorization: `Bearer ${ADMIN_TOKEN}` },
    )
    assert.equal(rejectRes.response.status, 200)
    assert.equal(rejectRes.data.ok, true)
    assert.equal(rejectRes.data.reviewed, 1)

    // Public list hides the rejected recall
    const publicAfterReject = await call('GET', '/recalls')
    assert.equal(publicAfterReject.response.status, 200)
    assert.equal(publicAfterReject.data.items.length, 0)

    // Admin rejected list shows it
    const adminRejected = await call('GET', '/admin/recalls?status=rejected', undefined, {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    })
    assert.equal(adminRejected.response.status, 200)
    assert.ok(adminRejected.data.items.some((i) => i.id === recallId))
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/recalls: rate limiting (5 per hour limit, 6th request is rejected with 429)', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`

  const call = async (method, path = '', body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  try {
    // Send 5 distinct submissions
    for (let i = 1; i <= 5; i++) {
      const res = await call('POST', '/recalls', {
        section: 'speaking',
        task: 2,
        examMonth: '2026-10',
        topic: `Sujet de test numero ${i} suffisamment long`,
      })
      assert.equal(res.response.status, 200, `submission ${i} must succeed`)
      assert.equal(res.data.ok, true)
    }

    // 6th submission should exceed rate limit (429)
    const limited = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Sujet de test numero 6 qui doit echouer',
    })
    assert.equal(limited.response.status, 429)
    assert.equal(limited.data.code, 'RECALL_RATE_LIMITED')
    assert.ok(limited.data.retryAfterSeconds > 0)
    assert.ok(limited.response.headers.get('retry-after'))
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('security: submit, approve, resubmit same topic with different note -> public list still shows original note', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-sec-note-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    ensureNodeFeatureSchema(db)

    const learner = 'learner_sec_check'

    // 1. Submit initial recall
    const r1 = saveExamRecall(db, {
      learner,
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      city: 'Paris',
      topic: 'Sujet legitime approuve par la moderation',
      note: 'Note originale legitime',
    })
    assert.equal(r1.status, 'pending')

    // 2. Admin approves the recall
    reviewRecalls(db, { ids: [r1.id], action: 'approve' })

    // Verify public list shows the original note
    let approved = listApprovedRecalls(db)
    assert.equal(approved.items.length, 1)
    assert.equal(approved.items[0].note, 'Note originale legitime')

    // 3. Submitter attempts to tamper with note and city on already-approved topic
    const r2 = saveExamRecall(db, {
      learner,
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      city: 'Hacked City',
      topic: 'Sujet legitime approuve par la moderation',
      note: 'Note modifiee illegitime',
    })
    assert.equal(r2.id, r1.id)
    assert.equal(r2.deduped, true)
    assert.equal(r2.status, 'pending')

    // 4. Public list STILL shows original note and original city!
    approved = listApprovedRecalls(db)
    assert.equal(approved.items.length, 1)
    assert.equal(approved.items[0].note, 'Note originale legitime')
    assert.equal(approved.items[0].city, 'Paris')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('abuse guard unit test: maxPending override rejects new inserts when queue is full, allows dedupe', () => {
  assert.equal(MAX_PENDING_RECALLS, 500)
  const dir = mkdtempSync(join(tmpdir(), 'study-recalls-queue-unit-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    ensureNodeFeatureSchema(db)
    const smallLimit = 2

    // 1. Insert 1st pending item
    const r1 = saveExamRecall(db, {
      learner: 'learner_q1',
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Premier sujet pour remplir la file d attente',
      maxPending: smallLimit,
    })
    assert.equal(r1.deduped, false)
    assert.ok(r1.id)

    // 2. Insert 2nd pending item (queue reaches smallLimit = 2)
    const r2 = saveExamRecall(db, {
      learner: 'learner_q2',
      section: 'speaking',
      task: 3,
      examMonth: '2026-10',
      topic: 'Deuxieme sujet pour remplir la file d attente',
      maxPending: smallLimit,
    })
    assert.equal(r2.deduped, false)
    assert.ok(r2.id)

    // 3. 3rd distinct item is rejected because queue is full
    const r3 = saveExamRecall(db, {
      learner: 'learner_q3',
      section: 'writing',
      task: 1,
      examMonth: '2026-10',
      topic: 'Troisieme sujet qui doit etre refuse car la file est pleine',
      maxPending: smallLimit,
    })
    assert.equal(r3.queueFull, true)
    assert.equal(r3.id, null)

    // 4. Duplicate of 1st item succeeds normally even when queue is full
    const dup = saveExamRecall(db, {
      learner: 'learner_q1',
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Premier sujet pour remplir la file d attente',
      maxPending: smallLimit,
    })
    assert.equal(dup.deduped, true)
    assert.equal(dup.id, r1.id)
    assert.equal(dup.status, 'pending')
    assert.equal(dup.queueFull, undefined)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('abuse guard API test: returns 503 RECALL_QUEUE_FULL when queue is full, allows dedupe', async () => {
  const { dir, server } = setupTestServer({ maxPendingRecalls: 1 })
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
    await call('GET')

    // 1st submission succeeds (reaches maxPendingRecalls = 1)
    const res1 = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Premier sujet API pour atteindre la limite',
    })
    assert.equal(res1.response.status, 200)
    assert.equal(res1.data.ok, true)
    const firstId = res1.data.id

    // 2nd distinct submission rejected with 503 RECALL_QUEUE_FULL
    const res2 = await call('POST', '/recalls', {
      section: 'speaking',
      task: 3,
      examMonth: '2026-10',
      topic: 'Deuxieme sujet API qui doit etre bloque a 503',
    })
    assert.equal(res2.response.status, 503)
    assert.equal(res2.data.code, 'RECALL_QUEUE_FULL')
    assert.equal(res2.data.error, 'Submissions are temporarily paused.')

    // Duplicate of 1st submission returns 200 even though queue is full
    const dupRes = await call('POST', '/recalls', {
      section: 'speaking',
      task: 2,
      examMonth: '2026-10',
      topic: 'Premier sujet API pour atteindre la limite',
    })
    assert.equal(dupRes.response.status, 200)
    assert.equal(dupRes.data.ok, true)
    assert.equal(dupRes.data.id, firstId)
    assert.equal(dupRes.data.status, 'pending')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
