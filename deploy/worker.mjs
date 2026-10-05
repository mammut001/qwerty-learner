import { studyPolicy, sessionCookie } from '../server/study-http.mjs'
import { apply, record, validate, importOperations, exportPlan, normalizeState, studyAnalytics, buildReviewQueue } from '../server/study-model.mjs'
import {
  materializeWorkerFeatures,
  listWorkerErrorBook,
  listWorkerCheckins,
  applyWorkerMakeup,
  listWorkerAchievements,
  listWorkerWeeklyReports,
  consumeWorkerRateLimit,
  writeWorkerAudit,
  deleteWorkerLearnerData,
} from './study-worker-features.mjs'

const MAX_BODY_BYTES = 1700000
const STUDY_SCHEMA_VERSION = 5
const json = (status, data, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
})
const jsonError = (status, code, message, extra = {}, headers = {}) => json(status, { error: message, code, ...extra }, headers)
const digest = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (b) => b.toString(16).padStart(2, '0')).join('')
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
const ALLOWED_ERROR_TYPES = new Set(['vocabulary', 'grammar', 'conjugation'])
const hasExactKeys = (value, allowed, required = []) => {
  if (!record(value)) return false
  const keys = Object.keys(value)
  return required.every((key) => keys.includes(key)) && keys.every((key) => allowed.includes(key))
}

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new RangeError('Request too large')
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing body')
  const decoder = new TextDecoder()
  let text = '', size = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RangeError('Request too large') }
    text += decoder.decode(value, { stream: true })
  }
  const input = JSON.parse(text + decoder.decode())
  if (!record(input)) throw new SyntaxError('Invalid body')
  return input
}

async function resolveLearner(db, token) {
  if (!token) return null
  const credential = await digest(token)
  let row = await db.prepare('SELECT id,state,revision FROM learners WHERE id=?').bind(credential).first()
  if (row) return { learner: credential, row, viaSyncKey: false }
  const link = await db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').bind(credential).first()
  if (!link) return null
  row = await db.prepare('SELECT id,state,revision FROM learners WHERE id=?').bind(link.learner).first()
  return row ? { learner: link.learner, row, viaSyncKey: true } : null
}

export async function studyApi(request, env) {
  const requestUrl = new URL(request.url)
  const path = requestUrl.pathname
  const health = ['/api/health', '/health'].includes(path)
  if (health) {
    try {
      await env.DB.prepare('SELECT id,state,revision FROM learners LIMIT 1').all()
      await env.DB.prepare('SELECT learner,id,payload,revision FROM mutations LIMIT 1').all()
      await env.DB.prepare('SELECT key_hash,learner,created,revoked FROM sync_keys LIMIT 1').all()
      await env.DB.prepare('SELECT learner,item_id FROM error_book LIMIT 1').all()
      await env.DB.prepare('SELECT learner,day FROM checkins LIMIT 1').all()
      await env.DB.prepare('SELECT learner,achievement_id FROM achievements LIMIT 1').all()
      await env.DB.prepare('SELECT learner,week_start FROM weekly_reports LIMIT 1').all()
      await env.DB.prepare('SELECT scope,action FROM rate_limits LIMIT 1').all()
      await env.DB.prepare('SELECT id,action FROM audit_log LIMIT 1').all()
      const schema = await env.DB.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").first()
      const schemaVersion = Number(schema?.value)
      if (schemaVersion !== STUDY_SCHEMA_VERSION) throw new Error('Schema version mismatch')
      return json(200, { ok: true, storage: 'd1', schemaVersion })
    } catch {
      return jsonError(503, 'DATABASE_NOT_READY', 'Database not ready')
    }
  }

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
  if (!importing && !exporting && !analytics && !syncKey && !revokeSyncKey && !linking && !unlinking && !syncInfo &&
      !review && !errorBook && !checkins && !makeup && !achievements && !reports && !reportExport && !deleteData && !plan)
    return jsonError(404, 'NOT_FOUND', 'Not found')
  if ((importing || syncKey || revokeSyncKey || linking || unlinking || makeup) && request.method !== 'POST')
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
  if ((exporting || analytics || syncInfo || review || errorBook || checkins || achievements || reports || reportExport) && request.method !== 'GET')
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
  if (deleteData && request.method !== 'DELETE') return jsonError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
  if (plan && !['GET', 'POST', 'PATCH'].includes(request.method)) return jsonError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')

  const db = env.DB.withSession('first-primary')
  const headers = {}
  const actorHash = await digest(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown')
  const audit = async (learner, action, status, details = {}) => {
    try {
      await writeWorkerAudit(db, { id: randomId(), learner, action, status, actorHash, details })
    } catch {
      // Audit must never leak or block the primary user operation.
    }
  }

  if (linking) {
    const limit = await consumeWorkerRateLimit(db, 'actor:' + actorHash, 'sync-link', {
      limit: 6,
      windowMs: 5 * 60_000,
      blockMs: 15 * 60_000,
    })
    if (!limit.allowed) {
      await audit(null, 'sync_link', 'rate_limited')
      return jsonError(
        429,
        'SYNC_LINK_RATE_LIMITED',
        'Too many sync-code attempts. Try again later.',
        { retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000) },
        { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) },
      )
    }
    try {
      const input = await readBody(request)
      if (!hasExactKeys(input, ['key'], ['key']) || typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) {
        await audit(null, 'sync_link', 'invalid_request')
        return jsonError(400, 'SYNC_KEY_INVALID', 'Invalid sync key')
      }
      const linked = await db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').bind(await digest(input.key)).first()
      if (!linked) {
        await audit(null, 'sync_link', 'denied')
        return jsonError(401, 'SYNC_KEY_INVALID', 'Invalid sync key')
      }
      const linkedRow = await db.prepare('SELECT state FROM learners WHERE id=?').bind(linked.learner).first()
      if (!linkedRow?.state) {
        await audit(linked.learner, 'sync_link', 'conflict')
        return jsonError(409, 'SYNC_KEY_UNINITIALIZED', 'Sync key has no initialized plan')
      }
      headers['Set-Cookie'] = sessionCookie(input.key, {
        secure: env.STUDY_COOKIE_SECURE === 'true',
        sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
      })
      await audit(linked.learner, 'sync_link', 'success')
      return json(200, { state: normalizeState(JSON.parse(linkedRow.state)) }, headers)
    } catch (error) {
      await audit(null, 'sync_link', 'error')
      return jsonError(
        error instanceof RangeError ? 413 : 400,
        error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'SYNC_LINK_FAILED',
        error instanceof RangeError ? 'Request too large' : 'Unable to link device',
      )
    }
  }

  const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1]
  let resolved = await resolveLearner(db, token)
  let learner = resolved?.learner ?? null
  let row = resolved?.row ?? null
  let viaSyncKey = resolved?.viaSyncKey ?? false

  if (!row) {
    if (request.method !== 'GET' || exporting || errorBook || checkins || achievements || reports || reportExport || deleteData)
      return jsonError(401, 'SESSION_REQUIRED', 'Load plan first')
    const next = randomToken()
    learner = await digest(next)
    await db.prepare('INSERT INTO learners(id) VALUES(?)').bind(learner).run()
    row = { state: null, revision: 0 }
    viaSyncKey = false
    headers['Set-Cookie'] = sessionCookie(next, {
      secure: env.STUDY_COOKIE_SECURE === 'true',
      sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
    })
  }

  const getRow = () => db.prepare('SELECT state,revision FROM learners WHERE id=?').bind(learner).first()

  if (syncKey) {
    const limit = await consumeWorkerRateLimit(db, 'learner:' + learner, 'sync-key-write', {
      limit: 12,
      windowMs: 60 * 60_000,
      blockMs: 60 * 60_000,
    })
    if (!limit.allowed) {
      await audit(learner, 'sync_key_create', 'rate_limited')
      return jsonError(429, 'SYNC_KEY_RATE_LIMITED', 'Too many sync-key changes. Try again later.')
    }
    if (!row.state) return jsonError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
    if (viaSyncKey) return jsonError(409, 'SYNC_KEY_ROTATION_FORBIDDEN', 'Unlink this device before rotating the sync key')
    const key = randomToken()
    await db.batch([
      db.prepare('UPDATE sync_keys SET revoked=1 WHERE learner=? AND revoked=0').bind(learner),
      db.prepare('INSERT INTO sync_keys(key_hash,learner,created,revoked) VALUES(?,?,?,0)')
        .bind(await digest(key), learner, Date.now()),
    ])
    await audit(learner, 'sync_key_create', 'success')
    return json(200, { key })
  }

  if (revokeSyncKey) {
    const limit = await consumeWorkerRateLimit(db, 'learner:' + learner, 'sync-key-write', {
      limit: 12,
      windowMs: 60 * 60_000,
      blockMs: 60 * 60_000,
    })
    if (!limit.allowed) return jsonError(429, 'SYNC_KEY_RATE_LIMITED', 'Too many sync-key changes. Try again later.')
    try {
      const input = await readBody(request)
      if (!hasExactKeys(input, ['key'], ['key']) || typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) {
        await audit(learner, 'sync_key_revoke', 'invalid_request')
        return jsonError(400, 'SYNC_KEY_INVALID', 'Invalid sync key')
      }
      if (token === input.key) return jsonError(409, 'ACTIVE_SYNC_KEY', 'Unlink this device before revoking its active sync key')
      const result = await db.prepare('UPDATE sync_keys SET revoked=1 WHERE key_hash=? AND learner=? AND revoked=0')
        .bind(await digest(input.key), learner).run()
      if (!result.meta.changes) {
        await audit(learner, 'sync_key_revoke', 'not_found')
        return jsonError(404, 'SYNC_KEY_NOT_FOUND', 'Sync key not found')
      }
      await audit(learner, 'sync_key_revoke', 'success')
      return json(200, { revoked: true })
    } catch (error) {
      await audit(learner, 'sync_key_revoke', 'error')
      return jsonError(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'SYNC_KEY_REVOKE_FAILED', 'Unable to revoke sync key')
    }
  }

  if (syncInfo) {
    const active = await db.prepare('SELECT COUNT(*) AS count FROM sync_keys WHERE learner=? AND revoked=0').bind(learner).first()
    return json(200, { bound: viaSyncKey, activeKeys: active?.count ?? 0 }, headers)
  }

  if (unlinking) {
    if (!row.state) return jsonError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
    const next = randomToken()
    const nextLearner = await digest(next)
    const cloned = normalizeState(JSON.parse(row.state))
    await db.prepare('INSERT INTO learners(id,state,revision) VALUES(?,?,0)').bind(nextLearner, JSON.stringify(cloned)).run()
    try { await materializeWorkerFeatures(db, nextLearner, cloned) } catch {}
    await audit(learner, 'sync_unlink', 'success', { newLearnerHash: nextLearner.slice(0, 12) })
    headers['Set-Cookie'] = sessionCookie(next, {
      secure: env.STUDY_COOKIE_SECURE === 'true',
      sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
    })
    return json(200, { state: cloned, bound: false }, headers)
  }

  if (review) {
    if (!row.state) return json(200, { queue: [] }, headers)
    const today = requestUrl.searchParams.get('today')
    if (!today || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return jsonError(400, 'INVALID_REVIEW_DATE', 'Invalid review date', {}, headers)
    try {
      return json(200, { queue: buildReviewQueue(JSON.parse(row.state), today) }, headers)
    } catch {
      return jsonError(400, 'REVIEW_QUEUE_FAILED', 'Unable to build review queue', {}, headers)
    }
  }

  if (row.state && (errorBook || checkins || achievements || reports || reportExport || makeup)) {
    try {
      await materializeWorkerFeatures(db, learner, JSON.parse(row.state))
    } catch {
      return jsonError(503, 'DERIVED_DATA_UNAVAILABLE', 'Derived study data is temporarily unavailable', {}, headers)
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
      return jsonError(400, 'INVALID_ERROR_BOOK_FILTER', 'Invalid error-book filter', {}, headers)
    return json(200, { items: await listWorkerErrorBook(db, learner, { kind, status, from, to, limit }) }, headers)
  }

  if (checkins) {
    const from = requestUrl.searchParams.get('from') || ''
    const to = requestUrl.searchParams.get('to') || ''
    const today = requestUrl.searchParams.get('today') || new Date().toISOString().slice(0, 10)
    if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) || !/^\d{4}-\d{2}-\d{2}$/.test(today))
      return jsonError(400, 'INVALID_CHECKIN_FILTER', 'Invalid check-in filter', {}, headers)
    return json(200, await listWorkerCheckins(db, learner, {
      from,
      to,
      today,
      state: normalizeState(JSON.parse(row.state)),
    }), headers)
  }

  if (makeup) {
    try {
      const input = await readBody(request)
      if (!hasExactKeys(input, ['day'], ['day']) || typeof input.day !== 'string')
        return jsonError(400, 'INVALID_MAKEUP_REQUEST', 'Invalid makeup request', {}, headers)
      const result = await applyWorkerMakeup(db, learner, normalizeState(JSON.parse(row.state)), input.day)
      if (!result.ok) {
        await audit(learner, 'checkin_makeup', 'denied', { day: input.day, code: result.code })
        return jsonError(409, result.code, result.message, {}, headers)
      }
      await audit(learner, 'checkin_makeup', 'success', { day: input.day })
      return json(200, await listWorkerCheckins(db, learner, {
        today: new Date().toISOString().slice(0, 10),
        state: normalizeState(JSON.parse(row.state)),
      }), headers)
    } catch (error) {
      await audit(learner, 'checkin_makeup', 'error')
      return jsonError(error instanceof RangeError ? 413 : 400, 'MAKEUP_FAILED', 'Unable to apply makeup check-in', {}, headers)
    }
  }

  if (achievements) return json(200, { items: await listWorkerAchievements(db, learner) }, headers)

  if (reports || reportExport) {
    const limit = Math.min(26, Math.max(1, Number(requestUrl.searchParams.get('limit') || 26)))
    const items = await listWorkerWeeklyReports(db, learner, limit)
    if (reportExport) return json(200, { format: 'qwerty-study-weekly-reports', version: 1, exportedAt: new Date().toISOString(), items }, headers)
    return json(200, { items }, headers)
  }

  if (deleteData) {
    try {
      const input = await readBody(request)
      if (!hasExactKeys(input, ['confirm'], ['confirm']) || input.confirm !== 'DELETE')
        return jsonError(400, 'DELETE_CONFIRMATION_REQUIRED', 'Type DELETE to confirm full data deletion', {}, headers)
      await audit(learner, 'delete_all_data', 'requested')
      await deleteWorkerLearnerData(db, learner)
      const clearSameSite = (env.STUDY_COOKIE_SAME_SITE || 'strict') === 'none' ? 'None' : 'Strict'
      headers['Set-Cookie'] = `study_session=; Path=/api; HttpOnly; SameSite=${clearSameSite}; Max-Age=0${env.STUDY_COOKIE_SECURE === 'true' ? '; Secure' : ''}`
      return json(200, { deleted: true }, headers)
    } catch (error) {
      await audit(learner, 'delete_all_data', 'error')
      return jsonError(error instanceof RangeError ? 413 : 400, error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'DELETE_ALL_FAILED', 'Unable to delete data', {}, headers)
    }
  }

  if (exporting) {
    if (!row.state) return jsonError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
    return json(200, exportPlan(JSON.parse(row.state)))
  }

  if (analytics) {
    if (!row.state) return json(200, { analytics: null }, headers)
    const today = requestUrl.searchParams.get('today')
    const now = today && /^\d{4}-\d{2}-\d{2}$/.test(today) && !Number.isNaN(Date.parse(`${today}T12:00:00.000Z`))
      ? new Date(`${today}T12:00:00.000Z`)
      : new Date()
    return json(200, { analytics: studyAnalytics(JSON.parse(row.state), now) }, headers)
  }

  if (request.method === 'GET') return json(200, { state: row.state ? normalizeState(JSON.parse(row.state)) : null }, headers)

  let input
  try {
    input = await readBody(request)
    if (importing) input.operations = importOperations(input.backup)
  } catch (error) {
    return jsonError(
      error instanceof RangeError ? 413 : 400,
      error instanceof RangeError ? 'REQUEST_TOO_LARGE' : 'INVALID_REQUEST',
      error instanceof RangeError ? 'Request too large' : 'Invalid request',
      {},
      headers,
    )
  }

  if (request.method === 'POST' && !importing) {
    let normalized
    try {
      validate(input.state)
      normalized = normalizeState(input.state)
    } catch {
      return jsonError(400, 'PLAN_INVALID', 'Invalid plan', {}, headers)
    }
    await db.prepare('UPDATE learners SET state=?,revision=revision+1 WHERE id=? AND state IS NULL')
      .bind(JSON.stringify(normalized), learner).run()
    const current = await getRow()
    const state = normalizeState(JSON.parse(current.state))
    try { await materializeWorkerFeatures(db, learner, state) } catch {}
    return json(200, { state }, headers)
  }

  if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id))
    return jsonError(400, 'MUTATION_ID_INVALID', 'Invalid mutation ID', {}, headers)
  const payload = JSON.stringify(input.operations)
  if (payload === undefined) return jsonError(400, 'OPERATIONS_MISSING', 'Missing operations', {}, headers)

  for (let attempt = 0; attempt < 8; attempt++) {
    const seen = await db.prepare('SELECT payload FROM mutations WHERE learner=? AND id=?').bind(learner, input.id).first()
    if (seen) {
      if (seen.payload !== payload) return jsonError(400, 'MUTATION_ID_REUSED', 'Mutation ID reused', {}, headers)
      const current = await getRow()
      return json(200, { state: normalizeState(JSON.parse(current.state)) }, headers)
    }

    row = await getRow()
    if (!row?.state) return jsonError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first', {}, headers)
    let state
    try { state = apply(JSON.parse(row.state), input.operations) }
    catch { return jsonError(400, 'OPERATIONS_INVALID', 'Invalid operations', {}, headers) }

    const result = await db.batch([
      db.prepare(`INSERT INTO mutations(learner,id,payload,revision)
        SELECT id,?,?,revision FROM learners WHERE id=? AND revision=?
        ON CONFLICT(learner,id) DO NOTHING`).bind(input.id, payload, learner, row.revision),
      db.prepare(`UPDATE learners SET state=?,revision=revision+1 WHERE id=? AND revision=?
        AND EXISTS(SELECT 1 FROM mutations WHERE learner=? AND id=? AND payload=? AND revision=?)`)
        .bind(JSON.stringify(state), learner, row.revision, learner, input.id, payload, row.revision),
    ])
    if (result[1].meta.changes === 1) {
      try { await materializeWorkerFeatures(db, learner, state) } catch {}
      return json(200, { state }, headers)
    }
  }
  return jsonError(409, 'CONCURRENT_UPDATE', 'Concurrent update; retry this mutation', {}, headers)
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname
    if (!path.startsWith('/api/') && path !== '/health') return env.ASSETS.fetch(request)
    const policy = studyPolicy(
      {
        origin: env.STUDY_ORIGIN,
        secure: env.STUDY_COOKIE_SECURE === 'true',
        sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
      },
      request,
      ['/api/health', '/health'].includes(path),
    )
    if (policy.status) {
      return policy.status === 204
        ? new Response(null, { status: 204, headers: policy.headers })
        : jsonError(
            policy.status,
            policy.status === 503 ? 'SERVER_CONFIG_INVALID' : 'REQUEST_REJECTED',
            policy.status === 503 ? 'Invalid server configuration' : 'Request rejected',
            {},
            policy.headers,
          )
    }
    let response
    try { response = await studyApi(request, env) }
    catch { response = jsonError(503, 'STORAGE_UNAVAILABLE', 'Storage unavailable; retry later') }
    for (const [key, value] of Object.entries(policy.headers)) response.headers.set(key, value)
    return response
  },
}
