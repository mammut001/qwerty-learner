import { studyPolicy, sessionCookie } from './study-http.mjs'
import { apply, record, validate, importOperations, exportPlan } from './study-model.mjs'
import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'

const hash = (value) => createHash('sha256').update(value).digest('hex')

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
    CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));`)
  const handler = async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      res.end(JSON.stringify(data))
    }
    const health = ['/api/health', '/health'].includes(req.url)
    const importing = req.url === '/api/study-plan/import'
    const exporting = req.url === '/api/study-plan/export'
    if (!health && !importing && !exporting && req.url !== '/api/study-plan') return send(404, { error: 'Not found' })
    const policy = studyPolicy({ origin, secure, sameSite }, { method: req.method, headers: new Headers(req.headers) }, health)
    for (const [key, value] of Object.entries(policy.headers)) res.setHeader(key, value)
    if (policy.status) return send(policy.status, policy.status === 204 ? null : { error: policy.status === 503 ? 'Invalid server configuration' : 'Request rejected' })
    if (health) {
      try {
        db.prepare('SELECT id,state FROM learners LIMIT 1').get()
        db.prepare('SELECT learner,id,payload FROM mutations LIMIT 1').get()
        return send(200, { ok: true, storage: 'sqlite' })
      }
      catch { return send(503, { error: 'Database not ready' }) }
    }
    if ((importing && req.method !== 'POST') || (exporting && req.method !== 'GET')) return send(405, { error: 'Method not allowed' })
    const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]
    let learner = token ? hash(token) : null
    let row = learner ? db.prepare('SELECT state FROM learners WHERE id=?').get(learner) : null
    if (!row) {
      if (req.method !== 'GET' || exporting) return send(401, { error: 'Load plan first' })
      const next = randomBytes(32).toString('hex')
      learner = hash(next)
      db.prepare('INSERT INTO learners(id) VALUES(?)').run(learner)
      row = { state: null }
      res.setHeader(
        'Set-Cookie',
        sessionCookie(next, { secure, sameSite }),
      )
    }
    if (exporting) {
      if (!row.state) return send(409, { error: 'Initialize plan first' })
      return send(200, exportPlan(JSON.parse(row.state)))
    }
    if (req.method === 'GET') return send(200, { state: row.state ? JSON.parse(row.state) : null })
    let body = ''
    try {
      for await (const chunk of req) {
        body += chunk
        if (Buffer.byteLength(body) > 600000) return send(413, { error: 'Request too large' })
      }
      const input = JSON.parse(body)
      if (!record(input)) throw new Error('Invalid body')
      if (importing) input.operations = importOperations(input.backup)
      db.exec('BEGIN IMMEDIATE')
      try {
        row = db.prepare('SELECT state FROM learners WHERE id=?').get(learner)
        let state = row.state ? JSON.parse(row.state) : null
        if (req.method === 'POST' && !importing) {
          // Migration is create-only: a stale browser cache never overwrites server data.
          validate(input.state)
          state ??= input.state
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
      send(error instanceof SyntaxError || !String(error.code || '').startsWith('ERR_SQLITE') ? 400 : 500, { error: 'Unable to save plan' })
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
