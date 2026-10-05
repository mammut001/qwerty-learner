import { studyPolicy, sessionCookie } from './study-http.mjs'
import { apply, record, validate, importOperations, exportPlan, normalizeState, studyAnalytics } from './study-model.mjs'
import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'

const hash = (value) => createHash('sha256').update(value).digest('hex')
const MAX_BODY_BYTES = 1700000

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
} = {}) {
  mkdirSync(dirname(resolve(database)), { recursive: true })
  const db = new DatabaseSync(database)
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
    CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
    CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL);`)

  const resolveLearner = (token) => {
    if (!token) return null
    const credential = hash(token)
    let row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(credential)
    if (row) return { learner: credential, row }
    const link = db.prepare('SELECT learner FROM sync_keys WHERE key_hash=?').get(credential)
    if (!link) return null
    row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(link.learner)
    return row ? { learner: link.learner, row } : null
  }

  const handler = async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      res.end(JSON.stringify(data))
    }
    const requestUrl = new URL(req.url || '/', 'http://study.local')
    const path = requestUrl.pathname
    const health = ['/api/health', '/health'].includes(path)
    const importing = path === '/api/study-plan/import'
    const exporting = path === '/api/study-plan/export'
    const analytics = path === '/api/study-plan/analytics'
    const syncKey = path === '/api/study-plan/sync-key'
    const linking = path === '/api/study-plan/link'
    const plan = path === '/api/study-plan'
    if (!health && !importing && !exporting && !analytics && !syncKey && !linking && !plan) return send(404, { error: 'Not found' })

    const policy = studyPolicy({ origin, secure, sameSite }, { method: req.method, headers: new Headers(req.headers) }, health)
    for (const [key, value] of Object.entries(policy.headers)) res.setHeader(key, value)
    if (policy.status) return send(policy.status, policy.status === 204 ? null : { error: policy.status === 503 ? 'Invalid server configuration' : 'Request rejected' })

    if (health) {
      try {
        db.prepare('SELECT id,state FROM learners LIMIT 1').get()
        db.prepare('SELECT learner,id,payload FROM mutations LIMIT 1').get()
        db.prepare('SELECT key_hash,learner,created FROM sync_keys LIMIT 1').get()
        return send(200, { ok: true, storage: 'sqlite' })
      } catch {
        return send(503, { error: 'Database not ready' })
      }
    }

    if ((importing || syncKey || linking) && req.method !== 'POST') return send(405, { error: 'Method not allowed' })
    if ((exporting || analytics) && req.method !== 'GET') return send(405, { error: 'Method not allowed' })
    if (plan && !['GET', 'POST', 'PATCH'].includes(req.method)) return send(405, { error: 'Method not allowed' })

    if (linking) {
      try {
        const input = await readBody(req)
        if (typeof input.key !== 'string' || !/^[a-f0-9]{64}$/.test(input.key)) return send(400, { error: 'Invalid sync key' })
        const linked = db.prepare('SELECT learner FROM sync_keys WHERE key_hash=?').get(hash(input.key))
        if (!linked) return send(401, { error: 'Invalid sync key' })
        const row = db.prepare('SELECT state FROM learners WHERE id=?').get(linked.learner)
        if (!row?.state) return send(409, { error: 'Sync key has no initialized plan' })
        res.setHeader('Set-Cookie', sessionCookie(input.key, { secure, sameSite }))
        return send(200, { state: normalizeState(JSON.parse(row.state)) })
      } catch (error) {
        return send(error instanceof RangeError ? 413 : 400, { error: 'Unable to link device' })
      }
    }

    const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]
    let resolved = resolveLearner(token)
    let learner = resolved?.learner ?? null
    let row = resolved?.row ?? null

    if (!row) {
      if (req.method !== 'GET' || exporting) return send(401, { error: 'Load plan first' })
      const next = randomBytes(32).toString('hex')
      learner = hash(next)
      db.prepare('INSERT INTO learners(id) VALUES(?)').run(learner)
      row = { state: null }
      res.setHeader('Set-Cookie', sessionCookie(next, { secure, sameSite }))
    }

    if (syncKey) {
      if (!row.state) return send(409, { error: 'Initialize plan first' })
      const key = randomBytes(32).toString('hex')
      db.prepare('INSERT INTO sync_keys(key_hash,learner,created) VALUES(?,?,?)').run(hash(key), learner, Date.now())
      return send(200, { key })
    }

    if (exporting) {
      if (!row.state) return send(409, { error: 'Initialize plan first' })
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
        db.exec('COMMIT')
        send(200, { state })
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } catch (error) {
      const status = error instanceof RangeError ? 413 : error instanceof SyntaxError || !String(error.code || '').startsWith('ERR_SQLITE') ? 400 : 500
      send(status, { error: 'Unable to save plan' })
    }
  }

  const server = createServer((req, res) => {
    void handler(req, res).catch(() => {
      if (res.headersSent) return res.destroy()
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ error: 'Storage unavailable; retry later' }))
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
