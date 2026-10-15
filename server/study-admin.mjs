import { analyzePlacementWeakness } from './placement-data.mjs'
import { fetchLearnerPlacementRows, fetchLearnerPlacementRowsAsync } from './study-cohorts.mjs'
import { bearerMatches } from './study-observability.mjs'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'B2+']

export function adminApiEnabled(adminToken) {
  return typeof adminToken === 'string' && adminToken.length >= 16
}

export function authorizeAdminRequest(authorizationHeader, adminToken) {
  if (!adminApiEnabled(adminToken)) return { ok: false, status: 503, code: 'ADMIN_DISABLED', message: 'Admin API is not configured' }
  if (!bearerMatches(authorizationHeader, adminToken))
    return { ok: false, status: 401, code: 'ADMIN_UNAUTHORIZED', message: 'Invalid admin token' }
  return { ok: true }
}

export function authorizeRecallModeration(
  authorizationHeader,
  { adminToken, moderatorToken, recallModeratorToken } = {},
) {
  const resolvedModeratorToken = moderatorToken ?? recallModeratorToken
  const adminConfigured = adminApiEnabled(adminToken)
  const moderatorConfigured = adminApiEnabled(resolvedModeratorToken)
  if (!adminConfigured && !moderatorConfigured) {
    return { ok: false, status: 503, code: 'ADMIN_DISABLED', message: 'Admin API is not configured' }
  }
  if (adminConfigured && bearerMatches(authorizationHeader, adminToken)) {
    return { ok: true, role: 'admin' }
  }
  if (moderatorConfigured && bearerMatches(authorizationHeader, resolvedModeratorToken)) {
    return { ok: true, role: 'moderator' }
  }
  return { ok: false, status: 401, code: 'ADMIN_UNAUTHORIZED', message: 'Invalid admin token' }
}

export function parseRecallModeratorCanApprove(value) {
  return value === true || value === 'true' || value === '1'
}

function sectionAccuracy(sectionTotals) {
  const out = {}
  for (const [section, row] of Object.entries(sectionTotals)) {
    out[section] = row.total > 0 ? Math.round((row.correct / row.total) * 100) : null
  }
  return out
}

function weakestFromScores(sectionScores) {
  if (!sectionScores || typeof sectionScores !== 'object') return null
  const ranked = Object.entries(sectionScores)
    .map(([section, score]) => ({
      section,
      ratio: score?.total ? score.correct / score.total : 0,
    }))
    .sort((a, b) => a.ratio - b.ratio)
  return ranked[0]?.section ?? null
}

/**
 * Aggregate placement results for all learners on this deployment (single-tenant class view).
 * Learner IDs are truncated in the response; no sync codes or personal content.
 */
export function buildPlacementCohortReport(rows) {
  const byLevel = Object.fromEntries(CEFR_LEVELS.map((level) => [level, 0]))
  const sectionTotals = {
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
  }
  let totalLearners = 0
  let placementCompleted = 0
  const recent = []

  for (const row of rows) {
    if (!row?.id) continue
    totalLearners += 1
    if (typeof row.state !== 'string') continue
    let state
    try {
      state = JSON.parse(row.state)
    } catch {
      continue
    }
    const latest = state?.learning?.placement?.latest
    if (!latest || typeof latest.cefrLevel !== 'string') continue
    placementCompleted += 1
    byLevel[latest.cefrLevel] = (byLevel[latest.cefrLevel] ?? 0) + 1
    for (const [section, score] of Object.entries(latest.sectionScores ?? {})) {
      if (!sectionTotals[section] || !score) continue
      sectionTotals[section].correct += Number(score.correct) || 0
      sectionTotals[section].total += Number(score.total) || 0
    }
    const weakness = analyzePlacementWeakness(latest)
    recent.push({
      learnerRef: String(row.id).slice(0, 8),
      cefrLevel: latest.cefrLevel,
      finishedAt: latest.finishedAt,
      suggestedStartWeek: latest.recommendations?.suggestedStartWeek ?? null,
      weakestSection: weakness.weakest,
      sectionAccuracy: sectionAccuracy(
        Object.fromEntries(
          Object.entries(latest.sectionScores ?? {}).map(([section, score]) => [
            section,
            { correct: score.correct, total: score.total },
          ]),
        ),
      ),
    })
  }

  recent.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0) || a.learnerRef.localeCompare(b.learnerRef))
  const trimmedRecent = recent.slice(0, 200)

  return {
    generatedAt: new Date().toISOString(),
    totalLearners,
    placementCompleted,
    placementPending: Math.max(0, totalLearners - placementCompleted),
    placementRate: totalLearners ? Math.round((placementCompleted / totalLearners) * 1000) / 10 : 0,
    byLevel,
    cohortSectionAccuracy: sectionAccuracy(sectionTotals),
    recent: trimmedRecent,
  }
}

export function loadPlacementCohortReportFromDb(db, cohortId = null) {
  const rows = fetchLearnerPlacementRows(db, cohortId)
  const report = buildPlacementCohortReport(rows)
  return {
    ...report,
    cohortId: cohortId || null,
  }
}

export async function loadPlacementCohortReportFromDbAsync(db, cohortId = null) {
  const rows = await fetchLearnerPlacementRowsAsync(db, cohortId)
  const report = buildPlacementCohortReport(rows)
  return {
    ...report,
    cohortId: cohortId || null,
  }
}

export function placementCohortCsv(report) {
  const lines = ['learner_ref,cefr_level,finished_at,suggested_start_week,weakest_section']
  for (const row of report.recent) {
    lines.push(
      [
        row.learnerRef,
        row.cefrLevel,
        row.finishedAt ?? '',
        row.suggestedStartWeek ?? '',
        row.weakestSection ?? '',
      ].join(','),
    )
  }
  return lines.join('\n')
}

const DAY_MS = 86_400_000
const USER_PROVIDERS = ['google', 'apple']
const COMPLETED_CHECKIN_STATUSES = "('complete','makeup')"

function clampInteger(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(number)))
}

// Escape LIKE wildcards with '!' so that a search for "100%" matches literally.
function escapeLikeTerm(text) {
  return text.replace(/[!%_]/g, (char) => `!${char}`)
}

function utcDayKey(ms) {
  return new Date(ms).toISOString().slice(0, 10)
}

/**
 * Admin view of signed-up accounts (intranet only; the route requires the full admin token).
 * Returns one row per account ordered by most recent activity, plus a global summary.
 * Filters: provider ('google' | 'apple') keeps accounts with that identity; q is a case-insensitive
 * substring match on any identity email or display name. Emails are returned here, never in audit logs.
 */
export function listUsersForAdmin(db, { limit = 100, offset = 0, provider = null, q = '', now = Date.now() } = {}) {
  const safeLimit = clampInteger(limit, 100, 1, 200)
  const safeOffset = clampInteger(offset, 0, 0, Number.MAX_SAFE_INTEGER)
  const safeProvider = provider && USER_PROVIDERS.includes(provider) ? provider : null
  const term = String(q ?? '').trim().slice(0, 200)

  const filters = []
  const filterParams = []
  if (safeProvider) {
    filters.push('EXISTS (SELECT 1 FROM account_identities i WHERE i.account_id = a.id AND i.provider = ?)')
    filterParams.push(safeProvider)
  }
  if (term) {
    const pattern = `%${escapeLikeTerm(term)}%`
    filters.push(
      "EXISTS (SELECT 1 FROM account_identities i WHERE i.account_id = a.id AND (i.email LIKE ? ESCAPE '!' OR i.display_name LIKE ? ESCAPE '!'))",
    )
    filterParams.push(pattern, pattern)
  }
  const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  // Shared by the count and the page query. Session_agg uses `now` for active sessions, so it comes first.
  const baseCte = `
    WITH identity_agg AS (
      SELECT account_id, MAX(last_login_at) AS last_login_at FROM account_identities GROUP BY account_id
    ),
    session_agg AS (
      SELECT account_id,
        MAX(created_at) AS last_session_at,
        SUM(CASE WHEN expires_at > ? THEN 1 ELSE 0 END) AS active_sessions
      FROM account_sessions GROUP BY account_id
    ),
    base AS (
      SELECT a.id AS account_id, a.learner, a.created_at, ia.last_login_at,
        COALESCE(sa.active_sessions, 0) AS active_sessions,
        MAX(a.created_at, COALESCE(ia.last_login_at, 0), COALESCE(sa.last_session_at, 0)) AS activity_at
      FROM accounts a
      LEFT JOIN identity_agg ia ON ia.account_id = a.id
      LEFT JOIN session_agg sa ON sa.account_id = a.id
      ${whereSql}
    )`

  const total = Number(
    db.prepare(`${baseCte} SELECT COUNT(*) AS total FROM base`).get(now, ...filterParams)?.total || 0,
  )

  const pageRows = db.prepare(`
    ${baseCte}
    SELECT p.account_id, p.learner, p.created_at, p.last_login_at, p.active_sessions, p.activity_at,
      (SELECT COUNT(*) FROM checkins c WHERE c.learner = p.learner AND c.status IN ${COMPLETED_CHECKIN_STATUSES}) AS checkin_days,
      (SELECT MAX(c.day) FROM checkins c WHERE c.learner = p.learner AND c.status IN ${COMPLETED_CHECKIN_STATUSES}) AS last_checkin_day,
      (SELECT COUNT(*) FROM error_book e WHERE e.learner = p.learner) AS error_book_items,
      (SELECT COUNT(*) FROM error_book e WHERE e.learner = p.learner AND e.mastered = 1) AS mastered_items,
      (SELECT COUNT(*) FROM achievements y WHERE y.learner = p.learner) AS achievements
    FROM (
      SELECT * FROM base ORDER BY activity_at DESC, account_id LIMIT ? OFFSET ?
    ) p
    ORDER BY p.activity_at DESC, p.account_id
  `).all(now, ...filterParams, safeLimit, safeOffset)

  // One identities query for the whole page (no per-account loop).
  const identitiesByAccount = new Map()
  if (pageRows.length) {
    const placeholders = pageRows.map(() => '?').join(',')
    const identityRows = db.prepare(`
      SELECT account_id, provider, email, display_name, last_login_at, created_at
      FROM account_identities
      WHERE account_id IN (${placeholders})
      ORDER BY created_at, provider
    `).all(...pageRows.map((row) => row.account_id))
    for (const identity of identityRows) {
      if (!identitiesByAccount.has(identity.account_id)) identitiesByAccount.set(identity.account_id, [])
      identitiesByAccount.get(identity.account_id).push(identity)
    }
  }

  const items = pageRows.map((row) => {
    const identities = identitiesByAccount.get(row.account_id) ?? []
    const providers = USER_PROVIDERS.filter((name) => identities.some((identity) => identity.provider === name))
    const ordered = [...identities].sort(
      (a, b) => USER_PROVIDERS.indexOf(a.provider) - USER_PROVIDERS.indexOf(b.provider) || a.created_at - b.created_at,
    )
    const emails = [...new Set(ordered.map((identity) => identity.email).filter(Boolean))]
    const mostRecent = identities.reduce(
      (best, identity) => (!best || identity.last_login_at > best.last_login_at ? identity : best),
      null,
    )
    const displayName = mostRecent?.display_name || identities.find((identity) => identity.display_name)?.display_name || ''
    return {
      accountId: row.account_id,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at ?? null,
      providers,
      emails,
      displayName,
      checkinDays: Number(row.checkin_days) || 0,
      lastCheckinDay: row.last_checkin_day ?? null,
      errorBookItems: Number(row.error_book_items) || 0,
      masteredItems: Number(row.mastered_items) || 0,
      achievements: Number(row.achievements) || 0,
      activeSessions: Number(row.active_sessions) || 0,
    }
  })

  const weekAgo = now - 7 * DAY_MS
  const monthAgo = now - 30 * DAY_MS
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM accounts) AS total,
      (SELECT COUNT(DISTINCT account_id) FROM account_identities WHERE provider = 'google') AS google,
      (SELECT COUNT(DISTINCT account_id) FROM account_identities WHERE provider = 'apple') AS apple,
      (SELECT COUNT(*) FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM account_identities i WHERE i.account_id = a.id)) AS passkey_only,
      (SELECT COUNT(*) FROM accounts WHERE created_at >= ?) AS new_7,
      (SELECT COUNT(*) FROM accounts WHERE created_at >= ?) AS new_30,
      (SELECT COUNT(*) FROM accounts a WHERE
        EXISTS (SELECT 1 FROM account_identities i WHERE i.account_id = a.id AND i.last_login_at >= ?)
        OR EXISTS (SELECT 1 FROM account_sessions s WHERE s.account_id = a.id AND s.created_at >= ?)
        OR EXISTS (SELECT 1 FROM checkins c WHERE c.learner = a.learner AND c.status IN ${COMPLETED_CHECKIN_STATUSES} AND c.day >= ?)
      ) AS active_7
  `).get(weekAgo, monthAgo, weekAgo, weekAgo, utcDayKey(weekAgo))

  const todayUtc = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate())
  const signupStart = todayUtc - 29 * DAY_MS
  const signupRows = db.prepare(`
    SELECT strftime('%Y-%m-%d', created_at / 1000.0, 'unixepoch') AS day, COUNT(*) AS count
    FROM accounts WHERE created_at >= ? GROUP BY day
  `).all(signupStart)
  const signupCounts = new Map(signupRows.map((row) => [row.day, Number(row.count) || 0]))
  const signupsByDay = Array.from({ length: 30 }, (_, index) => {
    const day = utcDayKey(signupStart + index * DAY_MS)
    return { day, count: signupCounts.get(day) ?? 0 }
  })

  return {
    total,
    items,
    summary: {
      totalAccounts: Number(counts.total) || 0,
      byProvider: {
        google: Number(counts.google) || 0,
        apple: Number(counts.apple) || 0,
        passkeyOnly: Number(counts.passkey_only) || 0,
      },
      newLast7Days: Number(counts.new_7) || 0,
      newLast30Days: Number(counts.new_30) || 0,
      activeLast7Days: Number(counts.active_7) || 0,
      signupsByDay,
    },
  }
}

const DETAIL_WINDOW_DAYS = 30
const DETAIL_TOP_MISTAKES = 10
const DETAIL_RECENT = 10
const DETAIL_TCF_RECENT = 5

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const finiteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const percent = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : null)
const dayStartMs = (day) => (typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? Date.parse(`${day}T00:00:00Z`) : NaN)

// Accepts an account id (what /admin/users lists) or a learner id. Returns null when neither exists.
function resolveAdminLearner(db, id) {
  const account = db.prepare('SELECT id, learner FROM accounts WHERE id = ?').get(id)
  if (account) return { accountId: account.id, learner: account.learner }
  const learner = db.prepare('SELECT id FROM learners WHERE id = ?').get(id)
  if (learner) return { accountId: null, learner: learner.id }
  return null
}

function parseLearnerState(db, learner) {
  const row = db.prepare('SELECT state FROM learners WHERE id = ?').get(learner)
  if (!row || typeof row.state !== 'string') return {}
  try {
    const parsed = JSON.parse(row.state)
    return isObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Learning-activity summary for one user (intranet admin view). Returns aggregates only: no raw state,
 * no emails, no sync keys or identity subjects. Returns null when the id matches no account or learner.
 * Vocabulary timeStamp is in seconds (as in study-csv); other timestamps are milliseconds.
 */
export function getUserDetailForAdmin(db, accountOrLearnerId, { now = Date.now() } = {}) {
  const id = String(accountOrLearnerId ?? '').trim().slice(0, 200)
  if (!id) return null
  const resolved = resolveAdminLearner(db, id)
  if (!resolved) return null
  const { learner, accountId } = resolved

  const state = parseLearnerState(db, learner)
  const learning = isObject(state.learning) ? state.learning : {}
  const records = (Array.isArray(learning.vocabulary?.records) ? learning.vocabulary.records : []).filter(isObject)
  const grammarHistory = (Array.isArray(learning.grammar?.history) ? learning.grammar.history : []).filter(isObject)
  const conjugationAttempts = (Array.isArray(learning.conjugationAttempts) ? learning.conjugationAttempts : []).filter(isObject)
  const focusSessions = (Array.isArray(learning.focusSessions) ? learning.focusSessions : []).filter(isObject)
  const minutesByDay = isObject(state.minutes) ? state.minutes : {}

  const completedCheckins = db.prepare(`
    SELECT day, completed_at FROM checkins WHERE learner = ? AND status IN ${COMPLETED_CHECKIN_STATUSES}
  `).all(learner)
  const tcfRows = db.prepare(`
    SELECT skill, correct_count, question_count, scaled_score, nclc, finished_at, day
    FROM tcf_attempts WHERE learner = ? ORDER BY finished_at DESC LIMIT ?
  `).all(learner, DETAIL_TCF_RECENT)
  const tcfTotal = Number(db.prepare('SELECT COUNT(*) AS count FROM tcf_attempts WHERE learner = ?').get(learner)?.count) || 0
  const errorRow = db.prepare(`
    SELECT COUNT(*) AS total, SUM(CASE WHEN mastered = 1 THEN 1 ELSE 0 END) AS mastered,
      MAX(last_attempt_at) AS last_attempt_at
    FROM error_book WHERE learner = ?
  `).get(learner)

  // Active days: any day with a learning record, a completed check-in, or positive plan minutes.
  const activeDays = new Set()
  for (const item of [...records, ...grammarHistory, ...conjugationAttempts, ...focusSessions, ...tcfRows]) {
    if (typeof item.day === 'string' && item.day) activeDays.add(item.day)
  }
  for (const row of completedCheckins) activeDays.add(row.day)
  let totalMinutes = 0
  const positiveMinuteDays = []
  for (const [day, tasks] of Object.entries(minutesByDay)) {
    const dayMinutes = isObject(tasks) ? Object.values(tasks).reduce((sum, value) => sum + finiteNumber(value), 0) : 0
    totalMinutes += dayMinutes
    if (dayMinutes > 0) {
      activeDays.add(day)
      positiveMinuteDays.push(day)
    }
  }

  // Last activity: the latest timestamp across learning records, check-ins, errors and (for accounts) logins and sessions.
  const activityTimes = [
    ...records.map((item) => finiteNumber(item.timeStamp) * 1000),
    ...grammarHistory.map((item) => finiteNumber(item.finishedAt)),
    ...conjugationAttempts.map((item) => finiteNumber(item.occurredAt)),
    ...focusSessions.map((item) => finiteNumber(item.endedAt)),
    ...tcfRows.map((row) => finiteNumber(row.finished_at)),
    ...completedCheckins.map((row) => finiteNumber(row.completed_at)),
    finiteNumber(errorRow?.last_attempt_at),
    ...positiveMinuteDays.map((day) => dayStartMs(day)).filter(Number.isFinite),
  ]
  if (accountId) {
    const identity = db.prepare('SELECT MAX(last_login_at) AS last_login_at FROM account_identities WHERE account_id = ?').get(accountId)
    const session = db.prepare('SELECT MAX(created_at) AS created_at FROM account_sessions WHERE account_id = ?').get(accountId)
    activityTimes.push(finiteNumber(identity?.last_login_at), finiteNumber(session?.created_at))
  }
  const lastActiveAt = activityTimes.reduce((latest, time) => (time > latest ? time : latest), 0) || null

  // Vocabulary.
  const totalTypingMs = records.reduce((sum, item) => sum + finiteNumber(item.durationMs), 0)
  const correctWords = records.filter((item) => finiteNumber(item.wrongCount) === 0).length
  const mistakes = new Map()
  const dicts = new Map()
  const windowDays = Array.from({ length: DETAIL_WINDOW_DAYS }, (_, index) => utcDayKey(now - (DETAIL_WINDOW_DAYS - 1 - index) * DAY_MS))
  const perDay = new Map(windowDays.map((day) => [day, { day, words: 0, ms: 0 }]))
  for (const item of records) {
    const word = String(item.word ?? '')
    const wrong = finiteNumber(item.wrongCount)
    if (word && wrong > 0) {
      const entry = mistakes.get(word) ?? { word, dict: String(item.dict ?? ''), wrongCount: 0, attempts: 0 }
      entry.wrongCount += wrong
      entry.attempts += 1
      mistakes.set(word, entry)
    }
    const dict = String(item.dict ?? '')
    const dictEntry = dicts.get(dict) ?? { dict, count: 0, chapters: new Set() }
    dictEntry.count += 1
    if (Number.isInteger(item.chapter)) dictEntry.chapters.add(item.chapter)
    dicts.set(dict, dictEntry)
    const bucket = perDay.get(item.day)
    if (bucket) {
      bucket.words += 1
      bucket.ms += finiteNumber(item.durationMs)
    }
  }

  // Grammar.
  const grammarScore = grammarHistory.reduce((sum, item) => sum + finiteNumber(item.score), 0)
  const grammarTotal = grammarHistory.reduce((sum, item) => sum + finiteNumber(item.total), 0)
  const recentGrammar = [...grammarHistory]
    .sort((a, b) => finiteNumber(b.finishedAt) - finiteNumber(a.finishedAt))
    .slice(0, DETAIL_RECENT)
    .map((item) => ({
      topic: String(item.topic ?? ''),
      day: item.day ?? null,
      score: finiteNumber(item.score),
      total: finiteNumber(item.total),
      elapsedSeconds: finiteNumber(item.elapsedSeconds),
      finishedAt: item.finishedAt ?? null,
    }))

  // Conjugation.
  const conjugationCorrect = conjugationAttempts.filter((item) => item.correct === true).length

  // Placement.
  const latestPlacement = isObject(learning.placement?.latest) ? learning.placement.latest : null
  const placementSections = {}
  for (const [section, score] of Object.entries(latestPlacement?.sectionScores ?? {})) {
    if (isObject(score)) placementSections[section] = { correct: finiteNumber(score.correct), total: finiteNumber(score.total) }
  }

  return {
    lastActiveAt,
    activeDays: activeDays.size,
    totalMinutes: Math.round(totalMinutes),
    vocabulary: {
      totalWords: records.length,
      totalTypingMs,
      avgMsPerWord: records.length ? Math.round(totalTypingMs / records.length) : null,
      accuracy: percent(correctWords, records.length),
      topMistakes: [...mistakes.values()]
        .sort((a, b) => b.wrongCount - a.wrongCount || a.word.localeCompare(b.word))
        .slice(0, DETAIL_TOP_MISTAKES),
      byDict: [...dicts.values()]
        .map((entry) => ({ dict: entry.dict, count: entry.count, chapters: [...entry.chapters].sort((a, b) => a - b) }))
        .sort((a, b) => b.count - a.count || a.dict.localeCompare(b.dict)),
      perDay: [...perDay.values()],
    },
    grammar: {
      sessions: grammarHistory.length,
      accuracy: percent(grammarScore, grammarTotal),
      recent: recentGrammar,
    },
    conjugation: {
      attempts: conjugationAttempts.length,
      accuracy: percent(conjugationCorrect, conjugationAttempts.length),
    },
    placement: {
      latest: latestPlacement && typeof latestPlacement.cefrLevel === 'string'
        ? {
            cefrLevel: latestPlacement.cefrLevel,
            finishedAt: latestPlacement.finishedAt ?? null,
            suggestedStartWeek: latestPlacement.recommendations?.suggestedStartWeek ?? null,
            sectionAccuracy: sectionAccuracy(placementSections),
          }
        : null,
      historyCount: Array.isArray(learning.placement?.history) ? learning.placement.history.length : 0,
    },
    tcf: {
      count: tcfTotal,
      recent: tcfRows.map((row) => ({
        skill: row.skill,
        correctCount: Number(row.correct_count) || 0,
        questionCount: Number(row.question_count) || 0,
        scaledScore: Number(row.scaled_score) || 0,
        nclc: Number(row.nclc) || 0,
        finishedAt: Number(row.finished_at) || null,
      })),
    },
    errorBook: {
      total: Number(errorRow?.total) || 0,
      mastered: Number(errorRow?.mastered) || 0,
      active: (Number(errorRow?.total) || 0) - (Number(errorRow?.mastered) || 0),
    },
    checkins: {
      days: completedCheckins.length,
      lastDay: completedCheckins.reduce((latest, row) => (!latest || row.day > latest ? row.day : latest), null),
    },
  }
}
