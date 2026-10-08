import { studyPolicy, sessionCookie } from './study-http.mjs'
import { errorBookCsv, learningRecordsCsv, weeklyReportsCsv } from './study-csv.mjs'
import {
  adminApiEnabled,
  authorizeAdminRequest,
  loadPlacementCohortReportFromDb,
  placementCohortCsv,
} from './study-admin.mjs'
import {
  createCohort,
  getLearnerCohort,
  joinLearnerToCohort,
  listCohorts,
  rotateCohortJoinCode,
} from './study-cohorts.mjs'
import { EchelleAiError, RUBRIC_VERSION, evaluateProduction, evaluationOperation, validateSubmission } from './echelle-ai-harness.mjs'
import { aiRateLimits, aiStatus, createAiProvider } from './echelle-ai-providers.mjs'
import { bearerMatches, createStudyMetrics, logStudyRequest, loopbackAddress, studyRequestId } from './study-observability.mjs'
import {
  createNodePasskeyLoginOptions,
  createNodePasskeyRegistrationOptions,
  nodePasskeyAccountInfo,
  resolveNodeAccountSession,
  verifyNodePasskeyLogin,
  verifyNodePasskeyRegistration,
} from './study-node-passkey.mjs'
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
  listNodeTcfAttempts,
  getNodeTcfEeDraft,
  saveNodeTcfEeDraft,
  deleteNodeTcfEeDraft,
  saveNodeTcfEeAttempt,
  listNodeTcfEeAttempts,
  saveNodeTcfEoAttempt,
  listNodeTcfEoAttempts,
  deleteNodeTcfEoAttempt,
  consumeNodeRateLimit,
  writeNodeAudit,
  deleteNodeLearnerData,
} from './study-node-features.mjs'
import { createYoudaoCache, frenchQueryKey, lookupYoudaoFrench, normalizeFrenchQuery } from './youdao-fr.mjs'
import { randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { mkdirSync, statSync, createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve, extname, join, normalize } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

function serveStatic(req, res, staticDir) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' })
    return res.end('Method Not Allowed')
  }

  const parsedUrl = new URL(req.url, 'http://localhost')
  const pathname = decodeURIComponent(parsedUrl.pathname)
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(resolve(staticDir), safePath)

  let stat
  try {
    stat = statSync(filePath)
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html')
      stat = statSync(filePath)
    }
  } catch {
    filePath = join(resolve(staticDir), 'index.html')
    try {
      stat = statSync(filePath)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end('Not Found')
    }
  }

  const ext = extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  const isHashedAsset = pathname.startsWith('/assets/')

  const headers = {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Last-Modified': stat.mtime.toUTCString(),
    'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  }

  const ims = req.headers['if-modified-since']
  if (ims && new Date(ims) >= stat.mtime) {
    res.writeHead(304, headers)
    return res.end()
  }

  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  createReadStream(filePath).pipe(res)
}

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
  metricsToken = process.env.STUDY_METRICS_TOKEN || '',
  slowRequestMs = Number(process.env.STUDY_SLOW_REQUEST_MS || 1000),
  staticDir = process.env.STUDY_STATIC_DIR || '',
  accessPassword = process.env.STUDY_ACCESS_PASSWORD || '',
  adminToken = process.env.STUDY_ADMIN_TOKEN || '',
  aiProvider = createAiProvider(process.env),
  aiLimits = aiRateLimits(process.env),
  youdaoLookup = null,
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
  const metrics = createStudyMetrics()
  const slowThresholdMs = Number.isFinite(slowRequestMs) && slowRequestMs >= 0 ? slowRequestMs : 1000

  // Optional site-wide gate for a personal deployment: with STUDY_ACCESS_PASSWORD set, every data route needs a
  // signed access cookie. The signing key is derived from the password, so changing it revokes every device.
  const accessKey = accessPassword ? createHash('sha256').update('study-access-v1:' + accessPassword).digest() : null
  const ACCESS_TTL_MS = 90 * 24 * 60 * 60_000
  const signAccess = (expires) => createHmac('sha256', accessKey).update(String(expires)).digest()
  const accessCookie = (value, maxAgeSeconds) =>
    `study_access=${value}; Path=/api; HttpOnly; SameSite=${sameSite === 'none' ? 'None' : 'Strict'}; Max-Age=${maxAgeSeconds}${secure ? '; Secure' : ''}`
  const accessGranted = (cookieHeader) => {
    if (!accessKey) return true
    const match = /(?:^|;\s*)study_access=(\d{13})\.([a-f0-9]{64})(?:;|$)/.exec(cookieHeader || '')
    if (!match || Number(match[1]) <= Date.now()) return false
    return timingSafeEqual(Buffer.from(match[2], 'hex'), signAccess(match[1]))
  }

  const resolveLearner = (token) => {
    if (!token) return null
    const credential = hash(token)
    let row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(credential)
    if (row) return { learner: credential, row, viaSyncKey: false, viaAccount: false }
    const link = db.prepare('SELECT learner FROM sync_keys WHERE key_hash=? AND revoked=0').get(credential)
    if (link) {
      row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(link.learner)
      if (row) return { learner: link.learner, row, viaSyncKey: true, viaAccount: false }
    }
    const accountSession = resolveNodeAccountSession(db, credential)
    return accountSession
      ? { ...accountSession, viaSyncKey: false, viaAccount: true }
      : null
  }

  const youdaoCache = createYoudaoCache()
  const lookupFrench = youdaoLookup || ((query) => lookupYoudaoFrench(query, { cache: youdaoCache }))

  const handler = async (req, res) => {
    const requestStarted = performance.now()
    const requestHeaders = new Headers(req.headers)
    const requestId = studyRequestId(requestHeaders)
    const requestUrl = new URL(req.url || '/', 'http://study.local')
    const path = requestUrl.pathname
    res.setHeader('X-Request-ID', requestId)
    res.once('finish', () => {
      if (path === '/api/metrics') return
      const durationMs = performance.now() - requestStarted
      metrics.observe(res.statusCode, durationMs, slowThresholdMs)
      logStudyRequest({
        requestId,
        method: req.method || 'GET',
        path,
        status: res.statusCode,
        durationMs,
        storage: 'sqlite',
        slowThresholdMs,
      })
    })
    const send = (status, data, extraHeaders = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders })
      res.end(JSON.stringify(data))
    }
    const sendError = (status, code, message, extra = {}, headers = {}) =>
      send(status, { error: message, code, ...extra }, headers)
    const sendText = (status, body, contentType, extraHeaders = {}) => {
      res.writeHead(status, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...extraHeaders,
      })
      res.end(body)
    }
    const sendCsv = (filename, body) =>
      sendText(200, body, 'text/csv; charset=utf-8', {
        'Content-Disposition': `attachment; filename="${filename}"`,
      })
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
    const health = ['/api/health', '/health'].includes(path)
    const metricsRoute = path === '/api/metrics'
    if (metricsRoute) {
      const authorized =
        bearerMatches(req.headers.authorization, metricsToken) ||
        (!metricsToken && loopbackAddress(req.socket?.remoteAddress))
      if (!authorized) return sendError(401, 'METRICS_UNAUTHORIZED', 'Metrics access denied')
      if (req.method !== 'GET') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      return sendText(200, metrics.render(), 'text/plain; version=0.0.4; charset=utf-8')
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
    const account = path === '/api/study-plan/account'
    const passkeyRegisterOptions = path === '/api/study-plan/passkey/register/options'
    const passkeyRegisterVerify = path === '/api/study-plan/passkey/register/verify'
    const passkeyLoginOptions = path === '/api/study-plan/passkey/login/options'
    const passkeyLoginVerify = path === '/api/study-plan/passkey/login/verify'
    const recordsCsv = path === '/api/study-plan/records.csv'
    const errorCsv = path === '/api/study-plan/error-book.csv'
    const reportsCsv = path === '/api/study-plan/weekly-reports.csv'
    const tcfWritingDraft = path === '/api/study-plan/tcf-writing/draft'
    const tcfWriting = path === '/api/study-plan/tcf-writing'
    const tcfSpeaking = path === '/api/study-plan/tcf-speaking'
    const tcfAttempts = path === '/api/study-plan/tcf-attempts'
    const access = path === '/api/study-plan/access'
    const adminConfig = path === '/api/study-plan/admin/config'
    const adminPlacementCohort = path === '/api/study-plan/admin/placement-cohort'
    const adminPlacementCsv = path === '/api/study-plan/admin/placement-cohort.csv'
    const adminCohorts = path === '/api/study-plan/admin/cohorts'
    const adminCohortRotate = path === '/api/study-plan/admin/cohorts/rotate'
    const cohortInfo = path === '/api/study-plan/cohort'
    const cohortJoin = path === '/api/study-plan/cohort/join'
    const echelleAi = path === '/api/study-plan/echelle/ai'
    const echelleEvaluate = path === '/api/study-plan/echelle/evaluate'
    const dictionary = path === '/api/study-plan/dictionary'
    const plan = path === '/api/study-plan'
    if (!health && !importing && !exporting && !analytics && !syncKey && !revokeSyncKey && !linking && !unlinking &&
        !echelleAi && !echelleEvaluate && !dictionary &&
        !syncInfo && !review && !errorBook && !checkins && !makeup && !achievements && !reports && !reportExport && !deleteData &&
        !account && !passkeyRegisterOptions && !passkeyRegisterVerify && !passkeyLoginOptions && !passkeyLoginVerify &&
        !recordsCsv && !errorCsv && !reportsCsv && !tcfWritingDraft && !tcfWriting && !tcfSpeaking && !tcfAttempts && !access &&
        !adminConfig && !adminPlacementCohort && !adminPlacementCsv && !adminCohorts && !adminCohortRotate &&
        !cohortInfo && !cohortJoin && !plan) {
      if (staticDir && !path.startsWith('/api/')) {
        return serveStatic(req, res, staticDir)
      }
      return sendError(404, 'NOT_FOUND', 'Not found')
    }

    const policy = studyPolicy({ origin, secure, sameSite }, { method: req.method, headers: new Headers(req.headers) }, health)
    for (const [key, value] of Object.entries(policy.headers)) res.setHeader(key, value)
    if (policy.status) return policy.status === 204
      ? send(204, null)
      : sendError(
          policy.status,
          policy.status === 503 ? 'SERVER_CONFIG_INVALID' : 'REQUEST_REJECTED',
          policy.status === 503 ? 'Invalid server configuration' : 'Request rejected',
        )

    const originList = String(origin || '').split(',').map((s) => s.trim()).filter(Boolean)
    const reqOrigin = typeof req.headers['origin'] === 'string' ? req.headers['origin'] : null
    const effectiveOrigin = (reqOrigin && originList.includes(reqOrigin)) ? reqOrigin : originList[0]

    if (health) {
      try {
        db.prepare('SELECT id,state FROM learners LIMIT 1').get()
        db.prepare('SELECT learner,id,payload FROM mutations LIMIT 1').get()
        db.prepare('SELECT key_hash,learner,created,revoked FROM sync_keys LIMIT 1').get()
        db.prepare('SELECT learner,item_id FROM error_book LIMIT 1').get()
        db.prepare('SELECT learner,day FROM checkins LIMIT 1').get()
        db.prepare('SELECT learner,achievement_id FROM achievements LIMIT 1').get()
        db.prepare('SELECT learner,week_start FROM weekly_reports LIMIT 1').get()
        db.prepare('SELECT learner,attempt_id,skill FROM tcf_attempts LIMIT 1').get()
        db.prepare('SELECT learner,draft_id FROM tcf_ee_drafts LIMIT 1').get()
        db.prepare('SELECT learner,attempt_id FROM tcf_ee_attempts LIMIT 1').get()
        db.prepare('SELECT learner,attempt_id FROM tcf_eo_attempts LIMIT 1').get()
        db.prepare('SELECT scope,action FROM rate_limits LIMIT 1').get()
        db.prepare('SELECT id,action FROM audit_log LIMIT 1').get()
        db.prepare('SELECT id,learner,user_handle FROM accounts LIMIT 1').get()
        db.prepare('SELECT credential_id,account_id FROM passkeys LIMIT 1').get()
        db.prepare('SELECT challenge,purpose FROM passkey_challenges LIMIT 1').get()
        db.prepare('SELECT token_hash,account_id FROM account_sessions LIMIT 1').get()
        db.prepare('SELECT id,name FROM cohorts LIMIT 1').get()
        db.prepare('SELECT learner,cohort_id FROM learner_cohorts LIMIT 1').get()
        const schemaVersion = getNodeSchemaVersion(db)
        if (schemaVersion !== STUDY_SCHEMA_VERSION) throw new Error('Schema version mismatch')
        return send(200, { ok: true, storage: 'sqlite', schemaVersion })
      } catch {
        return sendError(503, 'DATABASE_NOT_READY', 'Database not ready')
      }
    }

    if (access) {
      const required = Boolean(accessKey)
      if (req.method === 'GET') return send(200, { required, granted: accessGranted(req.headers.cookie) })
      if (req.method === 'DELETE') return send(200, { required, granted: !required }, { 'Set-Cookie': accessCookie('', 0) })
      if (req.method !== 'POST') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      if (!required) return send(200, { required, granted: true })
      const limit = consumeNodeRateLimit(db, 'actor:' + actorHash, 'access-login', {
        limit: 8,
        windowMs: 10 * 60_000,
        blockMs: 15 * 60_000,
      })
      if (!limit.allowed)
        return sendError(429, 'ACCESS_RATE_LIMITED', 'Too many attempts. Try again later.', {
          retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000),
        })
      let input
      try {
        input = await readBody(req)
      } catch {
        return sendError(400, 'ACCESS_REQUEST_INVALID', 'Invalid access request')
      }
      if (!hasExactKeys(input, ['password'], ['password']) || typeof input.password !== 'string' || input.password.length > 200)
        return sendError(400, 'ACCESS_REQUEST_INVALID', 'Invalid access request')
      const supplied = createHash('sha256').update('study-access-v1:' + input.password).digest()
      if (!timingSafeEqual(supplied, accessKey)) {
        audit(null, 'access_login', 'denied')
        return sendError(401, 'ACCESS_DENIED', 'Wrong access password')
      }
      const expires = Date.now() + ACCESS_TTL_MS
      audit(null, 'access_login', 'success')
      return send(200, { required, granted: true }, {
        'Set-Cookie': accessCookie(`${expires}.${signAccess(expires).toString('hex')}`, Math.floor(ACCESS_TTL_MS / 1000)),
      })
    }
    if (adminConfig) {
      if (req.method !== 'GET') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      return send(200, { enabled: adminApiEnabled(adminToken) })
    }

    if (adminPlacementCohort || adminPlacementCsv) {
      if (req.method !== 'GET') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      const auth = authorizeAdminRequest(req.headers.authorization, adminToken)
      if (!auth.ok) {
        audit(null, 'admin_placement_cohort', auth.status === 401 ? 'denied' : 'disabled')
        return sendError(auth.status, auth.code, auth.message)
      }
      const cohortId = requestUrl.searchParams.get('cohortId') || null
      const report = loadPlacementCohortReportFromDb(db, cohortId)
      audit(null, 'admin_placement_cohort', 'success', {
        learners: report.totalLearners,
        completed: report.placementCompleted,
        cohortId: report.cohortId,
      })
      if (adminPlacementCsv) return sendCsv('placement-cohort.csv', placementCohortCsv(report))
      return send(200, { report })
    }

    if (adminCohorts || adminCohortRotate) {
      const auth = authorizeAdminRequest(req.headers.authorization, adminToken)
      if (!auth.ok) return sendError(auth.status, auth.code, auth.message)
      if (adminCohorts) {
        if (req.method === 'GET') return send(200, { cohorts: listCohorts(db) })
        if (req.method === 'POST') {
          let input
          try {
            input = await readBody(req)
          } catch {
            return sendError(400, 'COHORT_REQUEST_INVALID', 'Invalid cohort request')
          }
          if (!hasExactKeys(input, ['name'], ['name']) || typeof input.name !== 'string')
            return sendError(400, 'COHORT_REQUEST_INVALID', 'Invalid cohort request')
          try {
            const cohort = createCohort(db, input.name)
            audit(null, 'admin_cohort_create', 'success', { cohortId: cohort.id })
            return send(200, { cohort })
          } catch {
            return sendError(400, 'COHORT_REQUEST_INVALID', 'Invalid cohort name')
          }
        }
        return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      }
      if (req.method !== 'POST') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      let input
      try {
        input = await readBody(req)
      } catch {
        return sendError(400, 'COHORT_REQUEST_INVALID', 'Invalid cohort request')
      }
      if (!hasExactKeys(input, ['cohortId'], ['cohortId']) || typeof input.cohortId !== 'string')
        return sendError(400, 'COHORT_REQUEST_INVALID', 'Invalid cohort request')
      try {
        const rotated = rotateCohortJoinCode(db, input.cohortId)
        audit(null, 'admin_cohort_rotate', 'success', { cohortId: rotated.cohortId })
        return send(200, { cohort: rotated })
      } catch {
        return sendError(404, 'COHORT_NOT_FOUND', 'Cohort not found')
      }
    }

    if (!accessGranted(req.headers.cookie)) return sendError(401, 'ACCESS_REQUIRED', 'Access password required')

    if (dictionary) {
      if (req.method !== 'GET') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      const query = normalizeFrenchQuery(requestUrl.searchParams.get('q') || '')
      if (!query) return sendError(400, 'DICTIONARY_QUERY_INVALID', 'Invalid dictionary query')
      const cacheKey = frenchQueryKey(query)
      const cached = youdaoCache.get(cacheKey, Date.now())
      if (cached) return send(200, cached)
      const limit = consumeNodeRateLimit(db, 'actor:' + actorHash, 'dictionary', {
        limit: 120,
        windowMs: 10 * 60_000,
        blockMs: 60_000,
      })
      if (!limit.allowed) {
        return sendError(
          429,
          'DICTIONARY_RATE_LIMITED',
          'Too many dictionary lookups. Try again later.',
          { retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000) },
          { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) },
        )
      }
      let outcome
      try {
        outcome = await lookupFrench(query)
      } catch {
        return sendError(502, 'DICTIONARY_UNAVAILABLE', 'Dictionary is temporarily unavailable')
      }
      if (!outcome || outcome.error || !outcome.value) {
        return sendError(502, 'DICTIONARY_UNAVAILABLE', 'Dictionary is temporarily unavailable')
      }
      return send(200, outcome.value)
    }

    if (echelleAi) {
      if (req.method !== 'GET') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
      return send(200, aiStatus(aiProvider, RUBRIC_VERSION))
    }
    if (echelleEvaluate && req.method !== 'POST') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')

    if ((importing || syncKey || revokeSyncKey || linking || unlinking || makeup || passkeyRegisterOptions ||
        passkeyRegisterVerify || passkeyLoginOptions || passkeyLoginVerify) && req.method !== 'POST')
      return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if ((exporting || analytics || syncInfo || review || errorBook || checkins || achievements || reports || reportExport ||
        account || recordsCsv || errorCsv || reportsCsv || tcfAttempts || cohortInfo) && req.method !== 'GET')
      return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (cohortJoin && req.method !== 'POST') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (tcfWritingDraft && !['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (tcfWriting && !['GET', 'POST'].includes(req.method)) return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (tcfSpeaking && !['GET', 'POST', 'DELETE'].includes(req.method)) return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (deleteData && req.method !== 'DELETE') return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')
    if (plan && !['GET', 'POST', 'PATCH'].includes(req.method)) return sendError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')

    if (passkeyLoginOptions || passkeyLoginVerify) {
      const limit = consumeNodeRateLimit(db, 'actor:' + actorHash, 'passkey-login', {
        limit: 20,
        windowMs: 5 * 60_000,
        blockMs: 10 * 60_000,
      })
      if (!limit.allowed)
        return sendError(429, 'PASSKEY_RATE_LIMITED', 'Too many passkey attempts. Try again later.')
      try {
        const input = await readBody(req)
        if (passkeyLoginOptions) {
          if (!hasExactKeys(input, [])) return sendError(400, 'PASSKEY_REQUEST_INVALID', 'Invalid passkey request')
          return send(200, { options: createNodePasskeyLoginOptions(db, effectiveOrigin) })
        }
        if (!hasExactKeys(input, ['credential'], ['credential']))
          return sendError(400, 'PASSKEY_REQUEST_INVALID', 'Invalid passkey request')
        const result = await verifyNodePasskeyLogin(db, effectiveOrigin, input.credential)
        res.setHeader('Set-Cookie', sessionCookie(result.sessionToken, { secure, sameSite }))
        audit(result.learner, 'passkey_login', 'success')
        return send(200, {
          state: normalizeState(result.state),
          account: {
            registered: result.registered,
            signedIn: result.signedIn,
            passkeyCount: result.passkeyCount,
            createdAt: result.createdAt,
          },
        })
      } catch (error) {
        audit(null, 'passkey_login', 'denied', { code: error instanceof Error ? error.message : 'PASSKEY_LOGIN_FAILED' })
        return sendError(401, error instanceof Error ? error.message : 'PASSKEY_LOGIN_FAILED', 'Passkey login failed')
      }
    }

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
    let viaAccount = resolved?.viaAccount ?? false

    if (!row) {
      if (req.method !== 'GET' || exporting || errorBook || checkins || achievements || reports || reportExport || deleteData)
        return sendError(401, 'SESSION_REQUIRED', 'Load plan first')
      const next = randomBytes(32).toString('hex')
      learner = hash(next)
      db.prepare('INSERT INTO learners(id) VALUES(?)').run(learner)
      row = { state: null }
      viaSyncKey = false
      viaAccount = false
      res.setHeader('Set-Cookie', sessionCookie(next, { secure, sameSite }))
    }

    if (cohortInfo && req.method === 'GET') return send(200, { cohort: getLearnerCohort(db, learner) })

    if (echelleEvaluate) {
      if (!aiProvider) return sendError(503, 'AI_DISABLED', 'AI scoring is not configured')
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      let input
      let submission
      try {
        input = await readBody(req)
        submission = validateSubmission(input).submission
      } catch (error) {
        if (error instanceof EchelleAiError)
          return sendError(400, error.code, 'Invalid evaluation request', error.details)
        return sendError(error instanceof RangeError ? 413 : 400, 'EVALUATION_INVALID', 'Invalid evaluation request')
      }
      for (const { scope, ...window } of aiLimits) {
        const key = scope === 'learner' ? 'learner:' + learner : scope === 'actor' ? 'actor:' + actorHash : 'global'
        const limit = consumeNodeRateLimit(db, key, 'ai-eval', window)
        if (!limit.allowed) {
          audit(learner, 'echelle_ai_evaluate', 'rate_limited', { scope })
          return sendError(429, 'AI_RATE_LIMITED', 'Too many AI evaluations. Try again later.', {
            scope,
            retryAfterSeconds: Math.ceil(limit.retryAfterMs / 1000),
          })
        }
      }
      let evaluation
      try {
        evaluation = await evaluateProduction(input, aiProvider)
      } catch (error) {
        const code = error instanceof EchelleAiError ? error.code : 'AI_UNAVAILABLE'
        audit(learner, 'echelle_ai_evaluate', 'error', { code, itemId: submission.itemId })
        return sendError(502, code, 'AI scoring failed; retry later')
      }
      db.exec('BEGIN IMMEDIATE')
      try {
        const current = db.prepare('SELECT state FROM learners WHERE id=?').get(learner)
        const state = apply(normalizeState(JSON.parse(current.state)), [evaluationOperation(evaluation, submission, Date.now())], { trusted: true })
        db.prepare('UPDATE learners SET state=? WHERE id=?').run(JSON.stringify(state), learner)
        materializeNodeFeatures(db, learner, state)
        db.exec('COMMIT')
        audit(learner, 'echelle_ai_evaluate', 'success', { itemId: submission.itemId, passed: evaluation.passed, mean: evaluation.mean })
        return send(200, { evaluation, state })
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    }

    if (cohortJoin) {
      const limit = consumeNodeRateLimit(db, 'actor:' + actorHash, 'cohort-join', {
        limit: 12,
        windowMs: 10 * 60_000,
        blockMs: 15 * 60_000,
      })
      if (!limit.allowed)
        return sendError(429, 'COHORT_JOIN_RATE_LIMITED', 'Too many join attempts. Try again later.')
      let input
      try {
        input = await readBody(req)
      } catch {
        return sendError(400, 'COHORT_JOIN_INVALID', 'Invalid join request')
      }
      if (!hasExactKeys(input, ['code'], ['code']) || typeof input.code !== 'string' || input.code.length > 40)
        return sendError(400, 'COHORT_JOIN_INVALID', 'Invalid join request')
      try {
        const cohort = joinLearnerToCohort(db, learner, input.code)
        audit(learner, 'cohort_join', 'success', { cohortId: cohort.cohortId })
        return send(200, { cohort })
      } catch {
        audit(learner, 'cohort_join', 'denied')
        return sendError(400, 'COHORT_JOIN_INVALID', 'Invalid or expired class join code')
      }
    }

    if (account) return send(200, nodePasskeyAccountInfo(db, learner, viaAccount))

    if (passkeyRegisterOptions || passkeyRegisterVerify) {
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      const limit = consumeNodeRateLimit(db, 'learner:' + learner, 'passkey-register', {
        limit: 12,
        windowMs: 60 * 60_000,
        blockMs: 60 * 60_000,
      })
      if (!limit.allowed) return sendError(429, 'PASSKEY_RATE_LIMITED', 'Too many passkey changes. Try again later.')
      try {
        const input = await readBody(req)
        if (passkeyRegisterOptions) {
          if (!hasExactKeys(input, [])) return sendError(400, 'PASSKEY_REQUEST_INVALID', 'Invalid passkey request')
          return send(200, { options: createNodePasskeyRegistrationOptions(db, learner, effectiveOrigin) })
        }
        if (!hasExactKeys(input, ['credential'], ['credential']))
          return sendError(400, 'PASSKEY_REQUEST_INVALID', 'Invalid passkey request')
        const result = await verifyNodePasskeyRegistration(db, learner, effectiveOrigin, input.credential)
        res.setHeader('Set-Cookie', sessionCookie(result.sessionToken, { secure, sameSite }))
        viaAccount = true
        audit(learner, 'passkey_register', 'success')
        return send(200, {
          account: {
            registered: result.registered,
            signedIn: result.signedIn,
            passkeyCount: result.passkeyCount,
            createdAt: result.createdAt,
          },
        })
      } catch (error) {
        audit(learner, 'passkey_register', 'error', { code: error instanceof Error ? error.message : 'PASSKEY_REGISTER_FAILED' })
        return sendError(400, error instanceof Error ? error.message : 'PASSKEY_REGISTER_FAILED', 'Passkey registration failed')
      }
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

    if (row.state && (errorBook || checkins || achievements || reports || reportExport || errorCsv || reportsCsv || tcfAttempts || makeup)) {
      try {
        materializeNodeFeatures(db, learner, JSON.parse(row.state))
      } catch {
        return sendError(503, 'DERIVED_DATA_UNAVAILABLE', 'Derived study data is temporarily unavailable')
      }
    }

    if (recordsCsv) {
      if (!row.state) return sendError(409, 'PLAN_UNINITIALIZED', 'Initialize plan first')
      return sendCsv('qwerty-study-records.csv', learningRecordsCsv(normalizeState(JSON.parse(row.state))))
    }

    if (errorCsv) {
      const items = listNodeErrorBook(db, learner, { status: 'all', limit: 1000 })
      return sendCsv('qwerty-study-error-book.csv', errorBookCsv(items))
    }

    if (reportsCsv) {
      const items = listNodeWeeklyReports(db, learner, 26)
      return sendCsv('qwerty-study-weekly-reports.csv', weeklyReportsCsv(items))
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

    if (tcfWritingDraft) {
      if (req.method === 'GET') {
        return send(200, { draft: getNodeTcfEeDraft(db, learner) })
      }
      if (req.method === 'DELETE') {
        deleteNodeTcfEeDraft(db, learner)
        return send(200, { ok: true, deleted: true })
      }
      try {
        const input = await readBody(req)
        const draft = input?.draft ?? input
        if (
          !record(draft) ||
          typeof draft.draftId !== 'string' ||
          typeof draft.task1Id !== 'string' ||
          typeof draft.task2Id !== 'string' ||
          typeof draft.task3Id !== 'string' ||
          typeof (draft.task1Response ?? '') !== 'string' ||
          typeof (draft.task2Response ?? '') !== 'string' ||
          typeof (draft.task3Response ?? '') !== 'string' ||
          (draft.task1Response ?? '').length > 10000 ||
          (draft.task2Response ?? '').length > 10000 ||
          (draft.task3Response ?? '').length > 10000 ||
          !Number.isInteger(draft.remainingSeconds) ||
          draft.remainingSeconds < 0 ||
          draft.remainingSeconds > 3600 ||
          !Number.isInteger(draft.startedAt)
        ) {
          return sendError(400, 'INVALID_DRAFT_PAYLOAD', 'Invalid draft payload')
        }
        saveNodeTcfEeDraft(db, learner, draft)
        return send(200, { ok: true, draft })
      } catch (error) {
        return sendError(error instanceof RangeError ? 413 : 400, 'SAVE_DRAFT_FAILED', 'Unable to save draft')
      }
    }

    if (tcfWriting) {
      if (req.method === 'GET') {
        const limit = Math.min(100, Math.max(1, Number(requestUrl.searchParams.get('limit') || 100)))
        return send(200, { items: listNodeTcfEeAttempts(db, learner, limit) })
      }
      try {
        const input = await readBody(req)
        if (
          !record(input) ||
          typeof input.id !== 'string' ||
          typeof input.task1Id !== 'string' ||
          typeof input.task1Response !== 'string' ||
          typeof input.task2Id !== 'string' ||
          typeof input.task2Response !== 'string' ||
          typeof input.task3Id !== 'string' ||
          typeof input.task3Response !== 'string' ||
          input.task1Response.length > 20000 ||
          input.task2Response.length > 20000 ||
          input.task3Response.length > 20000 ||
          !record(input.wordCounts) ||
          !record(input.scores) ||
          !Number.isInteger(input.totalScore) ||
          input.totalScore < 0 ||
          input.totalScore > 20 ||
          !Number.isInteger(input.nclc) ||
          input.nclc < 0 ||
          input.nclc > 10 ||
          !Number.isInteger(input.durationSeconds) ||
          input.durationSeconds < 0 ||
          input.durationSeconds > 3600 ||
          !Number.isInteger(input.startedAt) ||
          !Number.isInteger(input.finishedAt) ||
          typeof input.day !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(input.day)
        ) {
          return sendError(400, 'INVALID_EE_ATTEMPT', 'Invalid EE attempt payload')
        }
        saveNodeTcfEeAttempt(db, learner, input)
        audit(learner, 'tcf_writing_submit', 'success', { id: input.id, totalScore: input.totalScore, nclc: input.nclc })
        return send(200, { ok: true, attempt: input })
      } catch (error) {
        return sendError(error instanceof RangeError ? 413 : 400, 'SAVE_EE_FAILED', 'Unable to submit writing exam')
      }
    }

    if (tcfSpeaking) {
      if (req.method === 'GET') {
        const limit = Math.min(100, Math.max(1, Number(requestUrl.searchParams.get('limit') || 100)))
        return send(200, { items: listNodeTcfEoAttempts(db, learner, limit) })
      }
      if (req.method === 'DELETE') {
        let id = requestUrl.searchParams.get('id')
        if (!id) {
          try {
            const body = await readBody(req)
            id = body?.id
          } catch {}
        }
        if (!id || typeof id !== 'string') return sendError(400, 'INVALID_ATTEMPT_ID', 'Invalid attempt ID')
        deleteNodeTcfEoAttempt(db, learner, id)
        return send(200, { ok: true, deleted: true })
      }
      try {
        const input = await readBody(req)
        const recordingsMetaJson = JSON.stringify(input?.recordingsMeta ?? {})
        if (recordingsMetaJson.length > 4000 || recordingsMetaJson.includes('data:audio') || recordingsMetaJson.includes('base64,')) {
          return sendError(400, 'RECORDING_PAYLOAD_TOO_LARGE', 'Recordings metadata exceeds size limit; audio must be stored locally in IndexedDB')
        }
        if (
          !record(input) ||
          typeof input.id !== 'string' ||
          typeof input.task1Id !== 'string' ||
          typeof input.task2Id !== 'string' ||
          typeof input.task3Id !== 'string' ||
          !record(input.scores) ||
          !Number.isInteger(input.totalScore) ||
          input.totalScore < 0 ||
          input.totalScore > 20 ||
          !Number.isInteger(input.nclc) ||
          input.nclc < 0 ||
          input.nclc > 10 ||
          !Number.isInteger(input.durationSeconds) ||
          input.durationSeconds < 0 ||
          input.durationSeconds > 3600 ||
          !Number.isInteger(input.startedAt) ||
          !Number.isInteger(input.finishedAt) ||
          typeof input.day !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(input.day)
        ) {
          return sendError(400, 'INVALID_EO_ATTEMPT', 'Invalid EO attempt payload')
        }
        saveNodeTcfEoAttempt(db, learner, input)
        audit(learner, 'tcf_speaking_save', 'success', { id: input.id, totalScore: input.totalScore, nclc: input.nclc })
        return send(200, { ok: true, attempt: input })
      } catch (error) {
        return sendError(error instanceof RangeError ? 413 : 400, 'SAVE_EO_FAILED', 'Unable to save speaking exam')
      }
    }

    if (tcfAttempts) {
      const skill = requestUrl.searchParams.get('skill') || ''
      const limitValue = Number(requestUrl.searchParams.get('limit') || 100)
      if ((skill && !['listening', 'reading', 'writing', 'speaking'].includes(skill)) || !Number.isFinite(limitValue))
        return sendError(400, 'INVALID_TCF_FILTER', 'Invalid TCF attempt filter')
      const limit = Math.min(120, Math.max(1, Math.round(limitValue)))
      return send(200, { items: listNodeTcfAttempts(db, learner, { skill, limit }) })
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
      const writingAttempts = listNodeTcfEeAttempts(db, learner, 100)
      const speakingAttempts = listNodeTcfEoAttempts(db, learner, 100)
      return send(200, { analytics: studyAnalytics(JSON.parse(row.state), now, { writingAttempts, speakingAttempts }) })
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
            state = apply(state, input.operations, { selfAssessProduction: !aiProvider })
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
