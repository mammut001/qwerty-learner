import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { listUsersForAdmin } from './study-admin.mjs'
import { ensureNodeFeatureSchema } from './study-node-features.mjs'
import { createStudyServer } from './study-plan.mjs'

const ADMIN_TOKEN = 'test-study-admin-token-12345'
const MOD_TOKEN = 'test-study-moderator-token-67890'
const DAY = 86_400_000
const utcDay = (ms) => new Date(ms).toISOString().slice(0, 10)

// Fixed clock for the unit tests. Every account's timestamps are relative to NOW.
const NOW = Date.UTC(2026, 9, 15, 12, 0, 0)

function openSeedDb(database) {
  const db = new DatabaseSync(database)
  db.exec(`
    CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
    CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
    CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
  `)
  ensureNodeFeatureSchema(db)
  return db
}

// Four account shapes: Google only (with checkins and sessions), Apple only (with error book),
// passkey-only (no identities), and both providers.
function seed(db, now = NOW) {
  const insertAccount = db.prepare('INSERT INTO accounts(id,learner,user_handle,created_at) VALUES(?,?,?,?)')
  const insertIdentity = db.prepare(`
    INSERT INTO account_identities(provider,subject,account_id,email,display_name,picture,created_at,last_login_at)
    VALUES(?,?,?,?,?,?,?,?)
  `)
  const insertSession = db.prepare('INSERT INTO account_sessions(token_hash,account_id,created_at,expires_at) VALUES(?,?,?,?)')
  const insertCheckin = db.prepare('INSERT INTO checkins(learner,day,status,completed_at,source) VALUES(?,?,?,?,?)')
  const insertError = db.prepare(`
    INSERT INTO error_book(learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,last_attempt_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)
  `)
  const insertAchievement = db.prepare(`
    INSERT INTO achievements(learner,achievement_id,title,description,unlocked_at,payload) VALUES(?,?,?,?,?,?)
  `)

  // Google only.
  insertAccount.run('acc-google', 'l-google', 'google-user', now - 40 * DAY)
  insertIdentity.run('google', 'g-1', 'acc-google', 'alice@gmail.test', 'Alice', '', now - 40 * DAY, now - 1 * DAY)
  insertSession.run('hash-g-active', 'acc-google', now - 3 * 3_600_000, now + 30 * DAY)
  insertSession.run('hash-g-expired', 'acc-google', now - 40 * DAY, now - 10 * DAY)
  for (const offset of [0, 1, 2]) insertCheckin.run('l-google', utcDay(now - offset * DAY), 'complete', now, 'manual')
  insertCheckin.run('l-google', utcDay(now - 5 * DAY), 'makeup', now, 'manual')
  insertCheckin.run('l-google', utcDay(now - 20 * DAY), 'missed', now, 'manual')

  // Apple only, with error book rows.
  insertAccount.run('acc-apple', 'l-apple', 'apple-user', now - 10 * DAY)
  insertIdentity.run('apple', 'a-1', 'acc-apple', 'bob@privaterelay.appleid.com', 'Bob', '', now - 10 * DAY, now - 3 * DAY)
  insertError.run('l-apple', 'i1', 'vocabulary', 's1', 'lbl', '{}', 2, 0, 0, now, now)
  insertError.run('l-apple', 'i2', 'vocabulary', 's2', 'lbl', '{}', 1, 2, 0, now, now)
  insertError.run('l-apple', 'i3', 'grammar', 's3', 'lbl', '{}', 3, 3, 1, now, now)
  insertAchievement.run('l-apple', 'ach-1', 'First', 'desc', now, '{}')
  insertAchievement.run('l-apple', 'ach-2', 'Second', 'desc', now, '{}')

  // Passkey only, created two days ago.
  insertAccount.run('acc-passkey', 'l-passkey', 'passkey-user', now - 2 * DAY)

  // Both providers. Google login is the most recent activity in the whole table.
  insertAccount.run('acc-both', 'l-both', 'both-user', now - 60 * DAY)
  insertIdentity.run('google', 'g-2', 'acc-both', 'carol@gmail.test', 'Carol', '', now - 60 * DAY, now - 2 * 3_600_000)
  insertIdentity.run('apple', 'a-2', 'acc-both', 'carol@icloud.test', 'Carol A', '', now - 60 * DAY, now - 5 * DAY)
}

// Activity = max(identity last_login, latest session created, account created), descending.
// acc-both: Google login 2h ago. acc-google: session 3h ago. acc-passkey: created 2d ago. acc-apple: login 3d ago.
const EXPECTED_ORDER = ['acc-both', 'acc-google', 'acc-passkey', 'acc-apple']

test('listUsersForAdmin: rows ordered by most recent activity with per-account aggregates', () => {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-unit-'))
  const db = openSeedDb(join(dir, 'study.sqlite'))
  try {
    seed(db)
    const result = listUsersForAdmin(db, { now: NOW })
    assert.equal(result.total, 4)
    assert.deepEqual(result.items.map((item) => item.accountId), EXPECTED_ORDER)

    const google = result.items.find((item) => item.accountId === 'acc-google')
    assert.deepEqual(google.providers, ['google'])
    assert.deepEqual(google.emails, ['alice@gmail.test'])
    assert.equal(google.displayName, 'Alice')
    assert.equal(google.createdAt, NOW - 40 * DAY)
    assert.equal(google.lastLoginAt, NOW - 1 * DAY)
    // Complete and makeup rows count; the 'missed' row does not.
    assert.equal(google.checkinDays, 4)
    assert.equal(google.lastCheckinDay, utcDay(NOW))
    assert.equal(google.activeSessions, 1, 'expired session is not counted')
    assert.equal(google.errorBookItems, 0)
    assert.equal(google.achievements, 0)

    const apple = result.items.find((item) => item.accountId === 'acc-apple')
    assert.deepEqual(apple.providers, ['apple'])
    assert.deepEqual(apple.emails, ['bob@privaterelay.appleid.com'])
    assert.equal(apple.errorBookItems, 3)
    assert.equal(apple.masteredItems, 1)
    assert.equal(apple.achievements, 2)
    assert.equal(apple.checkinDays, 0)
    assert.equal(apple.lastCheckinDay, null)

    const passkey = result.items.find((item) => item.accountId === 'acc-passkey')
    assert.deepEqual(passkey.providers, [])
    assert.deepEqual(passkey.emails, [])
    assert.equal(passkey.lastLoginAt, null)

    const both = result.items.find((item) => item.accountId === 'acc-both')
    assert.deepEqual(both.providers, ['google', 'apple'])
    assert.deepEqual(both.emails, ['carol@gmail.test', 'carol@icloud.test'])
    assert.equal(both.displayName, 'Carol', 'display name comes from the most recent login')
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('listUsersForAdmin: provider filter keeps accounts with that identity', () => {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-provider-'))
  const db = openSeedDb(join(dir, 'study.sqlite'))
  try {
    seed(db)
    const google = listUsersForAdmin(db, { provider: 'google', now: NOW })
    assert.equal(google.total, 2)
    assert.deepEqual(google.items.map((item) => item.accountId), ['acc-both', 'acc-google'])

    const apple = listUsersForAdmin(db, { provider: 'apple', now: NOW })
    assert.equal(apple.total, 2)
    assert.deepEqual(apple.items.map((item) => item.accountId), ['acc-both', 'acc-apple'])

    // Unknown provider values are ignored by the helper (the route rejects them with 400).
    assert.equal(listUsersForAdmin(db, { provider: 'github', now: NOW }).total, 4)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('listUsersForAdmin: q is a case-insensitive substring match and % or _ are literal', () => {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-q-'))
  const db = openSeedDb(join(dir, 'study.sqlite'))
  try {
    seed(db)
    assert.deepEqual(listUsersForAdmin(db, { q: 'CAROL', now: NOW }).items.map((item) => item.accountId), ['acc-both'])
    assert.deepEqual(listUsersForAdmin(db, { q: 'bob@priv', now: NOW }).items.map((item) => item.accountId), ['acc-apple'])
    assert.deepEqual(listUsersForAdmin(db, { q: 'alice', now: NOW }).items.map((item) => item.accountId), ['acc-google'])

    // Wildcards must not match every row.
    assert.equal(listUsersForAdmin(db, { q: '%', now: NOW }).total, 0)
    assert.equal(listUsersForAdmin(db, { q: '_', now: NOW }).total, 0)
    assert.equal(listUsersForAdmin(db, { q: 'a%l', now: NOW }).total, 0)

    // Combined with provider.
    assert.deepEqual(
      listUsersForAdmin(db, { q: 'carol', provider: 'apple', now: NOW }).items.map((item) => item.accountId),
      ['acc-both'],
    )
    assert.equal(listUsersForAdmin(db, { q: 'carol', provider: 'google', now: NOW }).total, 1)
    assert.equal(listUsersForAdmin(db, { q: 'bob', provider: 'google', now: NOW }).total, 0)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('listUsersForAdmin: summary counts and 30-day signup series', () => {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-summary-'))
  const db = openSeedDb(join(dir, 'study.sqlite'))
  try {
    seed(db)
    const { summary } = listUsersForAdmin(db, { now: NOW })
    assert.equal(summary.totalAccounts, 4)
    assert.deepEqual(summary.byProvider, { google: 2, apple: 2, passkeyOnly: 1 })
    // Created in the last 7 days: only the passkey account (2 days ago).
    assert.equal(summary.newLast7Days, 1)
    // Created in the last 30 days: passkey (2 days ago) and apple (10 days ago).
    assert.equal(summary.newLast30Days, 2)
    // Active in the last 7 days by login, session, or checkin: both, google, apple. Passkey has none.
    assert.equal(summary.activeLast7Days, 3)

    assert.equal(summary.signupsByDay.length, 30)
    const days = summary.signupsByDay.map((row) => row.day)
    assert.equal(days.at(-1), utcDay(NOW), 'series ends on today (UTC)')
    assert.equal(days[0], utcDay(NOW - 29 * DAY), 'series starts 29 days ago (UTC)')
    const byDay = Object.fromEntries(summary.signupsByDay.map((row) => [row.day, row.count]))
    assert.equal(byDay[utcDay(NOW - 2 * DAY)], 1)
    assert.equal(byDay[utcDay(NOW - 10 * DAY)], 1)
    assert.equal(summary.signupsByDay.reduce((sum, row) => sum + row.count, 0), 2)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('listUsersForAdmin: limit is clamped to 1..200 and offset to >= 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-page-'))
  const db = openSeedDb(join(dir, 'study.sqlite'))
  try {
    seed(db)
    assert.equal(listUsersForAdmin(db, { limit: 0, now: NOW }).items.length, 1)
    assert.equal(listUsersForAdmin(db, { limit: -5, now: NOW }).items.length, 1)
    assert.equal(listUsersForAdmin(db, { limit: 100000, now: NOW }).items.length, 4)
    assert.equal(listUsersForAdmin(db, { limit: 'abc', now: NOW }).items.length, 4, 'non-numeric limit uses the default')

    const paged = listUsersForAdmin(db, { limit: 2, offset: 2, now: NOW })
    assert.equal(paged.total, 4)
    assert.deepEqual(paged.items.map((item) => item.accountId), ['acc-passkey', 'acc-apple'])

    const negativeOffset = listUsersForAdmin(db, { limit: 1, offset: -10, now: NOW })
    assert.deepEqual(negativeOffset.items.map((item) => item.accountId), ['acc-both'])
    assert.equal(listUsersForAdmin(db, { limit: 2, offset: 100, now: NOW }).items.length, 0)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

// ---------------------------------------------------------------------------
// HTTP route
// ---------------------------------------------------------------------------

async function callApi(server, method, path, headers = {}) {
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: 'http://localhost:5173',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: method === 'POST' ? '{}' : undefined,
  })
  const data = await response.json().catch(() => null)
  return { response, data }
}

function setupServer(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'admin-users-http-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: 'http://localhost:5173',
    ...options,
  })
  return { dir, database, server }
}

test('GET /admin/users: full admin token only; moderator and wrong tokens are rejected', async () => {
  const { dir, database, server } = setupServer({
    adminToken: ADMIN_TOKEN,
    recallModeratorToken: MOD_TOKEN,
    recallModeratorCanApprove: true,
  })
  const seedDb = openSeedDb(database)
  seed(seedDb)
  seedDb.close()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    const noAuth = await callApi(server, 'GET', '/admin/users')
    assert.equal(noAuth.response.status, 401)
    assert.equal(noAuth.data.code, 'ADMIN_UNAUTHORIZED')

    const wrong = await callApi(server, 'GET', '/admin/users', { Authorization: 'Bearer wrong-token-123456789' })
    assert.equal(wrong.response.status, 401)

    const moderator = await callApi(server, 'GET', '/admin/users', { Authorization: `Bearer ${MOD_TOKEN}` })
    assert.equal(moderator.response.status, 401, 'recall moderator token must not read users')
    assert.equal(moderator.data.code, 'ADMIN_UNAUTHORIZED')

    const ok = await callApi(server, 'GET', '/admin/users', { Authorization: `Bearer ${ADMIN_TOKEN}` })
    assert.equal(ok.response.status, 200)
    assert.equal(ok.data.ok, true)
    assert.equal(ok.data.total, 4)
    assert.equal(ok.data.items.length, 4)
    assert.equal(ok.data.summary.totalAccounts, 4)
    assert.equal(ok.data.summary.signupsByDay.length, 30)
    assert.ok(ok.data.items[0].accountId, 'items carry accountId')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('GET /admin/users: query params, validation, method and disabled config', async () => {
  const { dir, database, server } = setupServer({ adminToken: ADMIN_TOKEN })
  const seedDb = openSeedDb(database)
  seed(seedDb)
  seedDb.close()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` }

  try {
    const google = await callApi(server, 'GET', '/admin/users?provider=google&limit=1', auth)
    assert.equal(google.response.status, 200)
    assert.equal(google.data.total, 2)
    assert.equal(google.data.items.length, 1)
    assert.equal(google.data.items[0].accountId, 'acc-both')

    const search = await callApi(server, 'GET', `/admin/users?q=${encodeURIComponent('%')}`, auth)
    assert.equal(search.response.status, 200)
    assert.equal(search.data.total, 0)

    const badProvider = await callApi(server, 'GET', '/admin/users?provider=facebook', auth)
    assert.equal(badProvider.response.status, 400)
    assert.equal(badProvider.data.code, 'ADMIN_USERS_INVALID')

    const post = await callApi(server, 'POST', '/admin/users', auth)
    assert.equal(post.response.status, 405)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }

  // Admin token not configured: the route reports 503 like the other admin routes.
  const disabled = setupServer({ adminToken: '' })
  await new Promise((resolve) => disabled.server.listen(0, '127.0.0.1', resolve))
  try {
    const res = await callApi(disabled.server, 'GET', '/admin/users', auth)
    assert.equal(res.response.status, 503)
    assert.equal(res.data.code, 'ADMIN_DISABLED')
  } finally {
    await new Promise((resolve) => disabled.server.close(resolve))
    rmSync(disabled.dir, { recursive: true, force: true })
  }
})

test('GET /admin/users: audit log records the access without emails or the search term', async () => {
  const { dir, database, server } = setupServer({ adminToken: ADMIN_TOKEN })
  const seedDb = openSeedDb(database)
  seed(seedDb)
  seedDb.close()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` }
    const res = await callApi(server, 'GET', '/admin/users?q=carol@gmail', auth)
    assert.equal(res.response.status, 200)
    assert.equal(res.data.total, 1)

    const reader = new DatabaseSync(database)
    try {
      const rows = reader.prepare("SELECT status, details FROM audit_log WHERE action = 'admin_users'").all()
      assert.ok(rows.length >= 1)
      const success = rows.find((row) => row.status === 'success')
      assert.ok(success, 'success row written')
      assert.doesNotMatch(success.details, /@/, 'no email in audit details')
      assert.doesNotMatch(success.details, /carol/i, 'search term not logged')
    } finally {
      reader.close()
    }
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
