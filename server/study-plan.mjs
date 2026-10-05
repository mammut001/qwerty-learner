import { studyPolicy, sessionCookie } from './study-http.mjs'
import { apply, record, validate, importOperations, exportPlan, normalizeState, studyAnalytics, buildReviewQueue } from './study-model.mjs'
import {
  ensureNodeFeatureSchema,
  getNodeSchemaVersion,
  STUDY_SCHEMA_VERSION,
  materializeNodeFeatures,
  listNodeErrorBook,
  listNodeCheckins,
  applyNodeMakeup,
  listNodeAchievements,
  listNodeWeeklyReports,
  consumeNodeRateLimit,
  writeNodeAudit,
  deleteNodeLearnerData,
} from './study-node-features.mjs'
import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'

const hash = (value) => createHash('sha256').update(value).digest('hex')
const MAX_BODY_BYTES = 1700000
const ALLOWED_ERROR_TYPES = new Set(['vocabulary', 'grammar', 'conjugation'])
const hasExactKeys = (value, allowed, required = []) => {
  if (!record(value)) return false
  const keys = Object.keys(value)
  return required.every((key) => keys.includes(key)) && keys.every((key) => allowed.includes(key))
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new RangeError('Request too large')
  }
  const input = JSON.parse(body)
  if (!record(input)) throw new SyntaxError('Invalid body')
  return input
}

export function createStudyServer({
  database = process.env.STUDY_DB_PATH || './data/study-plan.sqlite',
  origin = process.env.STUDY_ORIGIN || 'http://localhost:5173',
  secure = process.env.STUDY_COOKIE_SECURE === 'true',
  sameSite = process.env.STUDY_COOKIE_SAME_SITE || 'strict',
  trustProxyIp = process.env.STUDY_TRUST_PROXY_IP === 'true',
} = {}) {
  mkdirSync(dirname(resolve(database)), { recursive: true })
  const db = new DatabaseSync(database)
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
    CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
    CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);`)
  if (!db.prepare("PRAGMA table_info(sync_keys)").all().some((column) => column.name === 'revoked'))
    db.exec('ALTER TABLE sync_keys ADD COLUMN revoked INTEGER NOT NULL DEFAULT 0')
  ensureNodeFeatureSchema(db)

  const resolveLearner = (token) => {
    if (!token) return null
    const credential = hash(token)
    let row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(credential)
    if (row) return { learner: credential, row, viaSyncKey: false }
    const link = db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').get(credential)
    if (!link) return null
    row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(link.learner)
    return row ? { learner: link.learner, row, viaSyncKey: true } : null
  }

  const handler = async (req, res) => {
    const send = (status, data, extraHeaders = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders })
      res.end(JSON.stringify(data))
    }
    const sendError = (status, code, message, extra = {}, headers = {}) =>
      send(status, { error: message, code, ...extra }, headers)
    const actorSource =
      trustProxyIp && typeof req.headers['x-study-client-ip'] === 'string'
        ? req.headers['x-study-client-ip']
        : req.socket?.remoteAddress || 'unknown'
    const actorHash = hash(actorSource)
    const audit = (learner, action, status, details = {}) => {
      try {
        writeNodeAudit(db, {
          id: randomBytes(16).toString('hex'),
          learner,
          action,
          status,
          actorHash,
          details,
        })
      } catch {
        // Audit must never leak or block the primary user operation.
      }
    }
    const requestUrl = new URL(req.url || '/', 'http://study.local')
    const path = requestUrl.pathname
    const health = ['/api/health', '/health'].includes(path)
    const importing = path === '/api/study-plan/import'
    const exporting = path === '/api/study-plan/export'
    const analytics = path === '/api/study-plan/analytics'
    const syncKey = path === '/api/study-plan/sync-key'
    const revokeSyncKey = path === '/api/study-plan/sync-key/revoke'
    const linking = path === '/api/study-plan/link'
    const unlinking = path === '/api/study-plan/unlink'
    const syncInfo = path === '/api/study-plan/sync'
    const review = path === '/api/study-plan/review'
    const errorBook = path === '/api/study-plan/error-book'
    const checkins = path === '/api/study-plan/checkins'
    const makeup = path === '/api/study-plan/checkins/makeup'
    const achievements = path === '/api/study-plan/achievements'
    const reports = path === '/api/study-plan/weekly-reports'
    const reportExport = path === '/api/study-plan/weekly-reports/export'
    const deleteData = path === '/api/study-plan/data'
    const plan = path === '/api/study-plan'
    if (!health && !importing && !exporting && !analytics && !syncKey && !revokeSyncKey && !linking && !unlinking &&
        !syncInfo && !review && !errorBook && !checkins && !makeup && !achievements && !reports && !reportExport && !deleteData && !plan)
      return sendError(404, 'NOT_FOUND', 'Not found')

    const policy = studyPolicy({ origin, secure, sameSite }, { method: req.method, headers: new Headers(req.headers) }, health)
    for (const [key, value] of Object.entries(policy.headers)) res.setHeader(key, value)
    if (policy.status) return policy.status === 204
      ? send(204, null)
      : sendError(
          policy.status,
          policy.status === 503 ? 'SERVER_CONFIG_INVALID' : 'REQUEST_REJECTED',
          policy.status === 503 ? 'Invalid server configuration' : 'Request rejected',
        )

    if (health) {
      try {
        db.prepare('SELECT id,state FROM learners LIMIT 1').get()
        db.prepare('SELECT learner,id,payload FROM mutations LIMIT 1').get()
        db.prepare('SELECT key_hash,learner,created,revoked FROM sync_keys LIMIT 1').get()
        db.prepare('SELECT learner,item_id FROM error_book LIMIT 1').get()
        db.prepare('SELECT learner,day FROM checkins LIMIT 1').get()
        db.prepare('SELECT learner,achievement_id FROM achievements LIMIT 1').get()
        db.prepare('SELECT learner,week_start FROM weekly_reports LIMIT 1').get()
        db.prepare('SELECT scope,action FROM rate_limits LIMIT 1').get()
        db.prepare('SELECT id,action FROM audit_log LIMIT 1').get()
        const schemaVersion = getNodeSchemaVersion(db)
        if (schemaVersion !== STUDY_SCHEMA_VERSION) throw new Error('Schema version mismatch')
        return send(200, { ok: true, storage: 'sqlite', schemaVersion })
      } catch {
        return sendError(503, 'DATABASE_NOT_READY', 'Database not ready')
      }
    }

    if ((importing || syncKey || revokeSyncKey || linking || unlinking || makeup) && req.method !== 'POST')
      return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if ((exporting || analytics || syncInfo || review || errorBook || checkins || achievements || reports || reportExport) && req.method !== 'GET')
      return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (deleteData && req.method !== 'DELETE') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (plan && !['GET', 'POST', 'PATCH'].includes(req.method)) return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')

    if (linking) {
      const limit = consumeNodeRateLimit(db, 'actor:' + actorHash, 'sync-link', {
        limit: 6,
        windowMs: 5 * 60_000,
        blockMs: 15 * 60_000,
      })
      if (!limit.allowed) {
        audit(null, 'sync_link', 'rate_limited')
        return sendError(
          429,
          'SYNC_LINK_RATE_LIMITED',
          'Too many sync-code attempts. Try again later.',
          { retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000) },
          { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) },
        )
      }
      try {
        const input = await readBody(req)
        if (!hasExactKeys(input, ['key'], ['key']) || typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) {
          audit(null, 'sync_link', 'invalid_request')
          return sendError(400, 'SYNC_KEY_INVALID', 'Invalid sync key')
        }
        const linked = db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').get(hash(input.key))
        if (!linked) {
          audit(null, 'sync_link', 'denied')
          return sendError(401, 'SYNC_KEY_INVALID', 'Invalid sync key')
        }
        const linkedRow = db.prepare('SELECT state FROM learners WHERE id=?').get(linked.learner)
        if (!linkedRow?.state) {
          audit(linked.learner, 'sync_link', 'conflict')
          return sendError(409, 'SYNC_KEY_UNINITIALIZED', 'Sync key has no initialized plan')
        }
        res.setHeader('Set-Cookie', sessionCookie(input.key, { secure, sameSite }))
        audit(linked.learner, 'sync_link', 'success')
        return send(200, { state: normalizeState(JSON.parse(linkedRow.state)) })
      } catch (error) {
        audit(null, 'sync_link', 'error')
        return sendError(
          error instanceof RangeError ? 413 : 400,
          error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'SYNC_LINK_FAILED',
          error instanceof RangeError ? 'Request too large' : 'Unable to link device',
        )
      }
    }

    const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]
    let resolved = resolveLearner(token)
    let learner = resolved?.learner ?? null
    let row = resolved?.row ?? null
    let viaSyncKey = resolved?.viaSyncKey ?? false

    if (!row) {
      if (req.method !== 'GET' || exporting || errorBook || checkins || achievements || reports || reportExport || deleteData)
        return sendError(401, 'SESSION_REQUIRED', 'Load plan first')
      const next = randomBytes(32).toString('hex')
      learner = hash(next)
      db.prepare('INSERT INTO learners(id) VALUES(?)').run(learner)
      row = { state: null }
      viaSyncKey = false
      res.setHeader('Set-Cookie', sessionCookie(next, { secure, sameSite }))
    }

    if (syncKey) {
      const limit = consumeNodeRateLimit(db, 'learner:' + learner, 'sync-key-write', { limit: 12, windowMs: 60 * 60_000, blockMs: 60 * 60_000 })
      if (!limit.allowed) {
        audit(learner, 'sync_key_create', 'rate_limited')
        return sendError(429, 'SYNC_KEY_RATE_LIMITED', 'Too many sync-key changes. Try again later.', {
          retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000),
        })
      }
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      if (viaSyncKey) return sendError(409, 'SYNC_KEY_ROTATION_FORBIDDEN', 'Unlink this device before rotating the sync key')
      const key = randomBytes(32).toString('hex')
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare('UPDATE sync_keys SET revoked=1 WHERE learner=? AND revoked=0').run(learner)
        db.prepare('INSERT INTO sync_keys(key_hash,learner,created,revoked) VALUES(?,?,?,0)').run(hash(key), learner, Date.now())
        audit(learner, 'sync_key_create', 'success')
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        audit(learner, 'sync_key_create', 'error')
        throw error
      }
      return send(200, { key })
    }

    if (revokeSyncKey) {
      const limit = consumeNodeRateLimit(db, 'learner:' + learner, 'sync-key-write', { limit: 12, windowMs: 60 * 60_000, blockMs: 60 * 60_000 })
      if (!limit.allowed) return sendError(429, 'SYNC_KEY_RATE_LIMITED', 'Too many sync-key changes. Try again later.')
      try {
        const input = await readBody(req)
        if (!hasExactKeys(input, ['key'], ['key']) || typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) {
          audit(learner, 'sync_key_revoke', 'invalid_request')
          return sendError(400, 'SYNC_KEY_INVALID', 'Invalid sync key')
        }
        if (token === input.key) return sendError(409, 'ACTIVE_SYNC_KEY', 'Unlink this device before revoking its active sync key')
        const result = db.prepare('UPDATE sync_keys SET revoked=1 WHERE key_hash=? AND learner=? AND revoked=0').run(hash(input.key), learner)
        if (!result.changes) {
          audit(learner, 'sync_key_revoke', 'not_found')
          return sendError(404, 'SYNC_KEY_NOT_FOUND', 'Sync key not found')
        }
        audit(learner, 'sync_key_revoke', 'success')
        return send(200, { revoked: true })
      } catch (error) {
        audit(learner, 'sync_key_revoke', 'error')
        return sendError(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'SYNC_KEY_REVOKE_FAILED', 'Unable to revoke sync key')
      }
    }

    if (syncInfo) {
      const activeKeys = db.prepare('SELECT COUNT(*) AS count FROM sync_keys WHERE learner=? AND revoked=0').get(learner)?.count ?? 0
      return send(200, { bound: viaSyncKey, activeKeys })
    }

    if (unlinking) {
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      const next = randomBytes(32).toString('hex')
      const nextLearner = hash(next)
      const cloned = normalizeState(JSON.parse(row.state))
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare('INSERT INTO learners(id,state) VALUES(?,?)').run(nextLearner, JSON.stringify(cloned))
        materializeNodeFeatures(db, nextLearner, cloned)
        audit(learner, 'sync_unlink', 'success', { newLearnerHash: nextLearner.slice(0, 12) })
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        audit(learner, 'sync_unlink', 'error')
        throw error
      }
      res.setHeader('Set-Cookie', sessionCookie(next, { secure, sameSite }))
      return send(200, { state: cloned, bound: false })
    }

    if (review) {
      if (!row.state) return send(200, { queue: [] })
      const today = requestUrl.searchParams.get('today')
      if (!today || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return sendError(400, 'INVALID_REVIEW_DATE', 'Invalid review date')
      try {
        return send(200, { queue: buildReviewQueue(JSON.parse(row.state), today) })
      } catch {
        return sendError(400, 'REVIEW_QUEUE_FAILED', 'Unable to build review queue')
      }
    }

    if (row.state && (errorBook || checkins || achievements || reports || reportExport || makeup)) {
      try {
        materializeNodeFeatures(db, learner, JSON.parse(row.state))
      } catch {
        return sendError(503, 'DERIVED_DATA_UNAVAILABLE', 'Derived study data is temporarily unavailable')
      }
    }

    if (errorBook) {
      const kind = requestUrl.searchParams.get('type') || ''
      const status = requestUrl.searchParams.get('status') || 'active'
      const from = requestUrl.searchParams.get('from') || ''
      const to = requestUrl.searchParams.get('to') || ''
      const limit = Math.min(100, Math.max(1, Number(requestUrl.searchParams.get('limit') || 100)))
      if ((kind && !ALLOWED_ERROR_TYPES.has(kind)) || !['active', 'mastered', 'all'].includes(status) ||
          (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) || !Number.isFinite(limit))
        return sendError(400, 'INVALID_ERROR_BOOK_FILTER', 'Invalid error-book filter')
      return send(200, { items: listNodeErrorBook(db, learner, { kind, status, from, to, limit }) })
    }

    if (checkins) {
      const from = requestUrl.searchParams.get('from') || ''
      const to = requestUrl.searchParams.get('to') || ''
      const today = requestUrl.searchParams.get('today') || new Date().toISOString().slice(0, 10)
      if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) || !/^\d{4}-\d{2}-\d{2}$/.test(today))
        return sendError(400, 'INVALID_CHECKIN_FILTER', 'Invalid check-in filter')
      return send(200, listNodeCheckins(db, learner, {
        from,
        to,
        today,
        state: normalizeState(JSON.parse(row.state)),
      }))
    }

    if (makeup) {
      try {
        const input = await readBody(req)
        if (!hasExactKeys(input, ['day'], ['day']) || typeof input.day !== 'string')
          return sendError(400, 'INVALID_MAKEUP_REQUEST', 'Invalid makeup request')
        const result = applyNodeMakeup(db, learner, normalizeState(JSON.parse(row.state)), input.day)
        if (!result.ok) {
          audit(learner, 'checkin_makeup', 'denied', { day: input.day, code: result.code })
          return sendError(409, result.code, result.message)
        }
        audit(learner, 'checkin_makeup', 'success', { day: input.day })
        return send(200, listNodeCheckins(db, learner, {
          today: new Date().toISOString().slice(0, 10),
          state: normalizeState(JSON.parse(row.state)),
        }))
      } catch (error) {
        audit(learner, 'checkin_makeup', 'error')
        return sendError(error instanceof RangeError ? 413 : 400, 'MAKEUP_FAILED', 'Unable to apply makeup check-in')
      }
    }

    if (achievements) return send(200, { items: listNodeAchievements(db, learner) })

    if (reports || reportExport) {
      const limit = Math.min(26, Math.max(1, Number(requestUrl.searchParams.get('limit') || 26)))
      const items = listNodeWeeklyReports(db, learner, limit)
      if (reportExport) return send(200, { format: 'qwerty-study-weekly-reports', version: 1, exportedAt: new Date().toISOString(), items })
      return send(200, { items })
    }

    if (deleteData) {
      try {
        const input = await readBody(req)
        if (!hasExactKeys(input, ['confirm'], ['confirm']) || input.confirm !== 'DELETE')
          return sendError(400, 'DELETE_CONFIRMATION_REQUIRED', 'Type DELETE to confirm full data deletion')
        audit(learner, 'delete_all_data', 'requested')
        db.exec('BEGIN IMMEDIATE')
        try {
          deleteNodeLearnerData(db, learner)
          db.exec('COMMIT')
        } catch (error) {
          db.exec('ROLLBACK')
          throw error
        }
        const clearCookie = `study_session=; Path=/api; HttpOnly; SameSite=${sameSite === 'none' ? 'None' : 'Strict'}; Max-Age=0${secure ? '; Secure' : ''}`
        return send(200, { deleted: true }, { 'Set-Cookie': clearCookie })
      } catch (error) {
        audit(learner, 'delete_all_data', 'error')
        return sendError(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'DELETE_ALL_FAILED', 'Unable to delete data')
      }
    }

    if (exporting) {
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      return send(200, exportPlan(JSON.parse(row.state)))
    }

    if (analytics) {
      if (!row.state) return send(200, { analytics: null })
      const today = requestUrl.searchParams.get('today')
      const now = today && /^\d{4}-\d{2}-\d{2}$/.test(today) && !Number.isNaN(Date.parse(`${today}T12:00:00.000Z`))
        ? new Date(`${today}T12:00:00.000Z`)
        : new Date()
      return send(200, { analytics: studyAnalytics(JSON.parse(row.state), now) })
    }

    if (req.method === 'GET') return send(200, { state: row.state ? normalizeState(JSON.parse(row.state)) : null })

    try {
      const input = await readBody(req)
      if (importing) input.operations = importOperations(input.backup)
      db.exec('BEGIN IMMEDIATE')
      try {
        row = db.prepare('SELECT state FROM learners WHERE id=?').get(learner)
        let state = row.state ? normalizeState(JSON.parse(row.state)) : null
        if (req.method === 'POST' && !importing) {
          validate(input.state)
          state ??= normalizeState(input.state)
        } else {
          if (!state) throw new Error('Initialize plan first')
          if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id)) throw new Error('Invalid mutation ID')
          const payload = JSON.stringify(input.operations)
          const seen = db.prepare('SELECT payload FROM mutations WHERE learner=? AND id=?').get(learner, input.id)
          if (seen && seen.payload !== payload) throw new Error('Mutation ID reused')
          if (!seen) {
            state = apply(state, input.operations)
            db.prepare('INSERT INTO mutations VALUES(?,?,?)').run(learner, input.id, payload)
          }
        }
        db.prepare('UPDATE learners SET state=? WHERE id=?').run(JSON.stringify(state), learner)
        materializeNodeFeatures(db, learner, state)
        db.exec('COMMIT')
        send(200, { state })
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } catch (error) {
      const status = error instanceof RangeError ? 413 : error instanceof SyntaxError || !String(error.code || '').startsWith('ERR_SQLITE') ? 400 : 500
      sendError(
        status,
        error instanceof RangeError ? 'REQUEST_TOO_LARGE' : status === 500 ? 'STORAGE_ERROR' : 'PLAN_WRITE_INVALID',
        status === 500 ? 'Storage unavailable; retry later' : 'Unable to save plan',
      )
    }
  }

  const server = createServer((req, res) => {
    void handler(req, res).catch(() => {
      if (res.headersSent) return res.destroy()
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ error: 'Storage unavailable; retry later', code: 'STORAGE_UNAVAILABLE' }))
    })
  })
  server.requestTimeout = 15000
  server.headersTimeout = 10000
  server.on('close', () => db.close())
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createStudyServer().listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1')
}
