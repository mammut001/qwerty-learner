import { apply, record, validate } from '../server/study-model.mjs'

const json = (status, data, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
})
const digest = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (b) => b.toString(16).padStart(2, '0')).join('')
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > 600000) throw new RangeError('Request too large')
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing body')
  const decoder = new TextDecoder()
  let text = '', size = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 600000) { await reader.cancel(); throw new RangeError('Request too large') }
    text += decoder.decode(value, { stream: true })
  }
  const input = JSON.parse(text + decoder.decode())
  if (!record(input)) throw new SyntaxError('Invalid body')
  return input
}

export async function studyApi(request, env) {
  const path = new URL(request.url).pathname
  if (path === '/api/health') {
    try { await env.DB.prepare('SELECT revision FROM learners LIMIT 1').all(); return json(200, { ok: true, storage: 'd1' }) }
    catch { return json(503, { error: 'Database not ready' }) }
  }
  if (path !== '/api/study-plan') return json(404, { error: 'Not found' })
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) return json(405, { error: 'Method not allowed' }, { Allow: 'GET, POST, PATCH' })
  // Fixed deployment origin, never inferred from Host or a forwarded header.
  const origin = request.headers.get('origin')
  if (!env.STUDY_ORIGIN || (env.STUDY_COOKIE_SECURE !== 'true' && !env.STUDY_ORIGIN.startsWith('http://localhost:'))) return json(503, { error: 'Origin configuration missing' })
  if ((origin && origin !== env.STUDY_ORIGIN) || request.headers.get('sec-fetch-site') === 'cross-site') return json(403, { error: 'Origin rejected' })
  if (request.method !== 'GET' && (origin !== env.STUDY_ORIGIN || request.headers.get('content-type')?.split(';')[0] !== 'application/json')) return json(403, { error: 'Same-origin JSON required' })
  const db = env.DB.withSession('first-primary')
  const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1]
  let learner = token ? await digest(token) : null
  const getRow = () => db.prepare('SELECT state,revision FROM learners WHERE id=?').bind(learner).first()
  let row = learner ? await getRow() : null
  const headers = {}
  if (!row) {
    if (request.method !== 'GET') return json(401, { error: 'Load plan first' })
    const next = randomToken()
    learner = await digest(next)
    await db.prepare('INSERT INTO learners(id) VALUES(?)').bind(learner).run()
    row = { state: null, revision: 0 }
    headers['Set-Cookie'] = `study_session=${next}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=31536000${env.STUDY_COOKIE_SECURE === 'true' ? '; Secure' : ''}`
  }
  if (request.method === 'GET') return json(200, { state: row.state ? JSON.parse(row.state) : null }, headers)
  let input
  try { input = await readBody(request) }
  catch (error) { return json(error instanceof RangeError ? 413 : 400, { error: 'Invalid request' }) }
  if (request.method === 'POST') {
    try { validate(input.state) } catch { return json(400, { error: 'Invalid plan' }) }
    await db.prepare('UPDATE learners SET state=?,revision=revision+1 WHERE id=? AND state IS NULL').bind(JSON.stringify(input.state), learner).run()
    return json(200, { state: JSON.parse((await getRow()).state) })
  }
  if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id)) return json(400, { error: 'Invalid mutation ID' })
  const payload = JSON.stringify(input.operations)
  if (payload === undefined) return json(400, { error: 'Missing operations' })
  // Optimistic concurrency with an atomic D1 batch. A mutation and its state update
  // commit together; competing writers retry against the current revision.
  for (let attempt = 0; attempt < 8; attempt++) {
    const seen = await db.prepare('SELECT payload FROM mutations WHERE learner=? AND id=?').bind(learner, input.id).first()
    if (seen) {
      if (seen.payload !== payload) return json(400, { error: 'Mutation ID reused' })
      return json(200, { state: JSON.parse((await getRow()).state) })
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
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    try { return await studyApi(request, env) }
    catch { return json(503, { error: 'Storage unavailable; retry later' }) }
  },
}
