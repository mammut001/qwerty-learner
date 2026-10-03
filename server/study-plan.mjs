import { randomBytes, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'

const hash = (value) => createHash('sha256').update(value).digest('hex')
const date = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v
const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const task = (v) => typeof v === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(v)
const minutes = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000000
function validate(state) {
  if (!record(state) || !date(state.startDate) || !record(state.minutes) || !record(state.minimumMode)) throw new Error('Invalid plan')
  for (const [day, tasks] of Object.entries(state.minutes)) {
    if (!date(day) || !record(tasks)) throw new Error('Invalid day')
    for (const [id, value] of Object.entries(tasks)) if (!task(id) || !minutes(value)) throw new Error('Invalid minutes')
  }
  for (const [day, value] of Object.entries(state.minimumMode))
    if (!date(day) || typeof value !== 'boolean') throw new Error('Invalid mode')
  if (Buffer.byteLength(JSON.stringify(state)) > 512000) throw new Error('Plan too large')
}
function apply(state, operations) {
  if (!Array.isArray(operations) || operations.length > 10000) throw new Error('Invalid operations')
  for (const op of operations) {
    if (!record(op)) throw new Error('Invalid operation')
    if (op.kind === 'startDate' && date(op.value)) state.startDate = op.value
    else if (op.kind === 'mode' && date(op.day) && (op.value === null || typeof op.value === 'boolean')) {
      if (op.value === null) delete state.minimumMode[op.day]
      else state.minimumMode[op.day] = op.value
    } else if (['minutes', 'increment'].includes(op.kind) && date(op.day) && task(op.task) && (op.value === null || minutes(op.value))) {
      state.minutes[op.day] ??= {}
      if (op.value === null && op.kind === 'minutes') delete state.minutes[op.day][op.task]
      else if (op.value !== null)
        state.minutes[op.day][op.task] = op.kind === 'increment' ? (state.minutes[op.day][op.task] ?? 0) + op.value : op.value
      else throw new Error('Invalid increment')
    } else throw new Error('Invalid operation')
  }
  validate(state)
  return state
}

export function createStudyServer({
  database = process.env.STUDY_DB_PATH || './data/study-plan.sqlite',
  origin = process.env.STUDY_ORIGIN || 'http://localhost:5173',
  secure = process.env.STUDY_COOKIE_SECURE === 'true',
} = {}) {
  mkdirSync(dirname(resolve(database)), { recursive: true })
  const db = new DatabaseSync(database)
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
    CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));`)
  const server = createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      res.end(JSON.stringify(data))
    }
    if (req.url !== '/api/study-plan') return send(404, { error: 'Not found' })
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) return send(405, { error: 'Method not allowed' })
    // No CORS. Writes must be same-origin JSON requests; never trust forwarded headers.
    if ((req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site')
      return send(403, { error: 'Origin rejected' })
    if (req.method !== 'GET' && (req.headers.origin !== origin || req.headers['content-type']?.split(';')[0] !== 'application/json'))
      return send(403, { error: 'Same-origin JSON required' })
    const token = /(?:^|;\s*)study_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]
    let learner = token ? hash(token) : null
    let row = learner ? db.prepare('SELECT state FROM learners WHERE id=?').get(learner) : null
    if (!row) {
      if (req.method !== 'GET') return send(401, { error: 'Load plan first' })
      const next = randomBytes(32).toString('hex')
      learner = hash(next)
      db.prepare('INSERT INTO learners(id) VALUES(?)').run(learner)
      row = { state: null }
      res.setHeader(
        'Set-Cookie',
        `study_session=${next}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=31536000${secure ? '; Secure' : ''}`,
      )
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
      db.exec('BEGIN IMMEDIATE')
      try {
        row = db.prepare('SELECT state FROM learners WHERE id=?').get(learner)
        let state = row.state ? JSON.parse(row.state) : null
        if (req.method === 'POST') {
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
  })
  server.requestTimeout = 15000
  server.headersTimeout = 10000
  server.on('close', () => db.close())
  return server
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createStudyServer().listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1')
}
