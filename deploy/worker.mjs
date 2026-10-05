import { studyPolicy, sessionCookie } from '../server/study-http.mjs'
import { apply, record, validate, importOperations, exportPlan, normalizeState, studyAnalytics, buildReviewQueue } from '../server/study-model.mjs'

const MAX_BODY_BYTES = 1700000
const json = (status, data, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
})
const digest = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (b) => b.toString(16).padStart(2, '0')).join('')
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')

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
      return json(200, { ok: true, storage: 'd1' })
    } catch {
      return json(503, { error: 'Database not ready' })
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
  const plan = path === '/api/study-plan'
  if (!importing && !exporting && !analytics && !syncKey && !revokeSyncKey && !linking && !unlinking && !syncInfo && !review && !plan)
    return json(404, { error: 'Not found' })
  if ((importing || syncKey || revokeSyncKey || linking || unlinking) && request.method !== 'POST') return json(405, { error: 'Method not allowed' })
  if ((exporting || analytics || syncInfo || review) && request.method !== 'GET') return json(405, { error: 'Method not allowed' })
  if (plan && !['GET', 'POST', 'PATCH'].includes(request.method)) return json(405, { error: 'Method not allowed' })

  const db = env.DB.withSession('first-primary')
  const headers = {}

  if (linking) {
    try {
      const input = await readBody(request)
      if (typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) return json(400, { error: 'Invalid sync key' })
      const linked = await db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').bind(await digest(input.key)).first()
      if (!linked) return json(401, { error: 'Invalid sync key' })
      const row = await db.prepare('SELECT state FROM learners WHERE id=?').bind(linked.learner).first()
      if (!row?.state) return json(409, { error: 'Sync key has no initialized plan' })
      headers['Set-Cookie'] = sessionCookie(input.key, {
        secure: env.STUDY_COOKIE_SECURE === 'true',
        sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
      })
      return json(200, { state: normalizeState(JSON.parse(row.state)) }, headers)
    } catch (error) {
      return json(error instanceof RangeError ? 413 : 400, { error: 'Unable to link device' })
    }
  }

  const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1]
  let resolved = await resolveLearner(db, token)
  let learner = resolved?.learner ?? null
  let row = resolved?.row ?? null
  let viaSyncKey = resolved?.viaSyncKey ?? false

  if (!row) {
    if (request.method !== 'GET' || exporting) return json(401, { error: 'Load plan first' })
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
    if (!row.state) return json(409, { error: 'Initialize plan first' })
    if (viaSyncKey) return json(409, { error: 'Unlink this device before rotating the sync key' })
    const key = randomToken()
    await db.batch([
      db.prepare('UPDATE sync_keys SET revoked=1 WHERE learner=? AND revoked=0').bind(learner),
      db.prepare('INSERT INTO sync_keys(key_hash,learner,created,revoked) VALUES(?,?,?,0)')
        .bind(await digest(key), learner, Date.now()),
    ])
    return json(200, { key })
  }

  if (revokeSyncKey) {
    try {
      const input = await readBody(request)
      if (typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) return json(400, { error: 'Invalid sync key' })
      if (token === input.key) return json(409, { error: 'Unlink this device before revoking its active sync key' })
      const result = await db.prepare('UPDATE sync_keys SET revoked=1 WHERE key_hash=? AND learner=? AND revoked=0')
        .bind(await digest(input.key), learner).run()
      return result.meta.changes ? json(200, { revoked: true }) : json(404, { error: 'Sync key not found' })
    } catch (error) {
      return json(error instanceof RangeError ? 413 : 400, { error: 'Unable to revoke sync key' })
    }
  }

  if (syncInfo) {
    const active = await db.prepare('SELECT COUNT(*) AS count FROM sync_keys WHERE learner=? AND revoked=0').bind(learner).first()
    return json(200, { bound: viaSyncKey, activeKeys: active?.count ?? 0 }, headers)
  }

  if (unlinking) {
    if (!row.state) return json(409, { error: 'Initialize plan first' })
    const next = randomToken()
    const nextLearner = await digest(next)
    await db.prepare('INSERT INTO learners(id,state,revision) VALUES(?,?,0)').bind(nextLearner, row.state).run()
    headers['Set-Cookie'] = sessionCookie(next, {
      secure: env.STUDY_COOKIE_SECURE === 'true',
      sameSite: env.STUDY_COOKIE_SAME_SITE || 'strict',
    })
    return json(200, { state: normalizeState(JSON.parse(row.state)), bound: false }, headers)
  }

  if (review) {
    if (!row.state) return json(200, { queue: [] }, headers)
    const today = requestUrl.searchParams.get('today')
    if (!today || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return json(400, { error: 'Invalid review date' }, headers)
    try {
      return json(200, { queue: buildReviewQueue(JSON.parse(row.state), today) }, headers)
    } catch {
      return json(400, { error: 'Unable to build review queue' }, headers)
    }
  }

  if (exporting) {
    if (!row.state) return json(409, { error: 'Initialize plan first' })
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
    return json(error instanceof RangeError ? 413 : 400, { error: 'Invalid request' })
  }

  if (request.method === 'POST' && !importing) {
    try { validate(input.state) } catch { return json(400, { error: 'Invalid plan' }) }
    await db.prepare('UPDATE learners SET state=?,revision=revision+1 WHERE id=? AND state IS NULL')
      .bind(JSON.stringify(normalizeState(input.state)), learner).run()
    const current = await getRow()
    return json(200, { state: normalizeState(JSON.parse(current.state)) })
  }

  if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id)) return json(400, { error: 'Invalid mutation ID' })
  const payload = JSON.stringify(input.operations)
  if (payload === undefined) return json(400, { error: 'Missing operations' })

  for (let attempt = 0; attempt < 8; attempt++) {
    const seen = await db.prepare('SELECT payload FROM mutations WHERE learner=? AND id=?').bind(learner, input.id).first()
    if (seen) {
      if (seen.payload !== payload) return json(400, { error: 'Mutation ID reused' })
      const current = await getRow()
      return json(200, { state: normalizeState(JSON.parse(current.state)) })
    }

    row = await getRow()
    if (!row?.state) return json(400, { error: 'Initialize plan first' })
    let state
    try { state = apply(JSON.parse(row.state), input.operations) } catch { return json(400, { error: 'Invalid operations' }) }

    const result = await db.batch([
      db.prepare(`INSERT INTO mutations(learner,id,payload,revision)
        SELECT id,?,?,revision FROM learners WHERE id=? AND revision=?
        ON CONFLICT(learner,id) DO NOTHING`).bind(input.id, payload, learner, row.revision),
      db.prepare(`UPDATE learners SET state=?,revision=revision+1 WHERE id=? AND revision=?
        AND EXISTS(SELECT 1 FROM mutations WHERE learner=? AND id=? AND payload=? AND revision=?)`)
        .bind(JSON.stringify(state), learner, row.revision, learner, input.id, payload, row.revision),
    ])
    if (result[1].meta.changes === 1) return json(200, { state })
  }
  return json(409, { error: 'Concurrent update; retry this mutation' })
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
        : json(policy.status, { error: policy.status === 503 ? 'Invalid server configuration' : 'Request rejected' }, policy.headers)
    }
    let response
    try { response = await studyApi(request, env) }
    catch { response = json(503, { error: 'Storage unavailable; retry later' }) }
    for (const [key, value] of Object.entries(policy.headers)) response.headers.set(key, value)
    return response
  },
}
