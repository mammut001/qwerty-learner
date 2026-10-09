import { buildAchievementCandidates, buildErrorBookEntries, buildWeeklyReport, featureDateUtils, streakFromCheckins } from './study-features.mjs'
import { normalizeState, studyDaySummary } from './study-model.mjs'

const { addDays, diffDays, dateKey } = featureDateUtils
const safeJson = (value) => JSON.stringify(value ?? {})
const parseJson = (value, fallback = null) => {
  try { return JSON.parse(value) } catch { return fallback }
}

export const STUDY_SCHEMA_VERSION = 10

export function ensureNodeFeatureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS error_book (
      learner TEXT NOT NULL, item_id TEXT NOT NULL, kind TEXT NOT NULL, source_id TEXT NOT NULL,
      label TEXT NOT NULL, context TEXT NOT NULL, error_count INTEGER NOT NULL, correct_streak INTEGER NOT NULL,
      mastered INTEGER NOT NULL DEFAULT 0, first_wrong_at INTEGER, last_wrong_at INTEGER,
      last_attempt_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (learner,item_id)
    );
    CREATE INDEX IF NOT EXISTS error_book_lookup ON error_book(learner,mastered,kind,last_wrong_at DESC);
    CREATE TABLE IF NOT EXISTS checkins (
      learner TEXT NOT NULL, day TEXT NOT NULL, status TEXT NOT NULL, completed_at INTEGER NOT NULL,
      source TEXT NOT NULL, PRIMARY KEY (learner,day)
    );
    CREATE INDEX IF NOT EXISTS checkins_day ON checkins(learner,day DESC);
    CREATE TABLE IF NOT EXISTS achievements (
      learner TEXT NOT NULL, achievement_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (learner,achievement_id)
    );
    CREATE TABLE IF NOT EXISTS weekly_reports (
      learner TEXT NOT NULL, week_start TEXT NOT NULL, week_end TEXT NOT NULL, payload TEXT NOT NULL,
      generated_at INTEGER NOT NULL, finalized INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (learner,week_start)
    );
    CREATE INDEX IF NOT EXISTS weekly_reports_history ON weekly_reports(learner,week_start DESC);
    CREATE TABLE IF NOT EXISTS tcf_attempts (
      learner TEXT NOT NULL, attempt_id TEXT NOT NULL, skill TEXT NOT NULL, question_count INTEGER NOT NULL,
      correct_count INTEGER NOT NULL, scaled_score INTEGER NOT NULL, nclc INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER NOT NULL,
      day TEXT NOT NULL, answers TEXT NOT NULL, PRIMARY KEY (learner,attempt_id)
    );
    CREATE INDEX IF NOT EXISTS tcf_attempts_history ON tcf_attempts(learner,skill,finished_at DESC);
    CREATE TABLE IF NOT EXISTS tcf_ee_drafts (
      learner TEXT NOT NULL PRIMARY KEY, draft_id TEXT NOT NULL, task1_id TEXT NOT NULL, task1_response TEXT NOT NULL DEFAULT '',
      task2_id TEXT NOT NULL, task2_response TEXT NOT NULL DEFAULT '', task3_id TEXT NOT NULL, task3_response TEXT NOT NULL DEFAULT '',
      remaining_seconds INTEGER NOT NULL, current_task INTEGER NOT NULL DEFAULT 0, started_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tcf_ee_attempts (
      learner TEXT NOT NULL, attempt_id TEXT NOT NULL, task1_id TEXT NOT NULL, task1_response TEXT NOT NULL,
      task2_id TEXT NOT NULL, task2_response TEXT NOT NULL, task3_id TEXT NOT NULL, task3_response TEXT NOT NULL,
      word_counts TEXT NOT NULL, scores TEXT NOT NULL, total_score INTEGER NOT NULL, nclc INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER NOT NULL,
      day TEXT NOT NULL, PRIMARY KEY (learner,attempt_id)
    );
    CREATE INDEX IF NOT EXISTS tcf_ee_attempts_history ON tcf_ee_attempts(learner,finished_at DESC);
    CREATE TABLE IF NOT EXISTS tcf_eo_attempts (
      learner TEXT NOT NULL, attempt_id TEXT NOT NULL, task1_id TEXT NOT NULL, task1_duration INTEGER NOT NULL DEFAULT 0,
      task2_id TEXT NOT NULL, task2_duration INTEGER NOT NULL DEFAULT 0, task3_id TEXT NOT NULL, task3_duration INTEGER NOT NULL DEFAULT 0,
      recordings_meta TEXT NOT NULL, scores TEXT NOT NULL, total_score INTEGER NOT NULL, nclc INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER NOT NULL,
      day TEXT NOT NULL, PRIMARY KEY (learner,attempt_id)
    );
    CREATE INDEX IF NOT EXISTS tcf_eo_attempts_history ON tcf_eo_attempts(learner,finished_at DESC);
    CREATE TABLE IF NOT EXISTS rate_limits (
      scope TEXT NOT NULL, action TEXT NOT NULL, window_start INTEGER NOT NULL, count INTEGER NOT NULL,
      blocked_until INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (scope,action)
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, learner TEXT, action TEXT NOT NULL, status TEXT NOT NULL,
      actor_hash TEXT NOT NULL, details TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS audit_log_learner_created ON audit_log(learner,created_at DESC);
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, learner TEXT NOT NULL UNIQUE, user_handle TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS passkeys (
      credential_id TEXT PRIMARY KEY, account_id TEXT NOT NULL, public_key TEXT NOT NULL,
      algorithm INTEGER NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0, transports TEXT NOT NULL,
      created_at INTEGER NOT NULL, last_used_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS passkeys_account ON passkeys(account_id,created_at);
    CREATE TABLE IF NOT EXISTS passkey_challenges (
      challenge TEXT PRIMARY KEY, purpose TEXT NOT NULL, learner TEXT, user_handle TEXT,
      expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS passkey_challenges_expiry ON passkey_challenges(expires_at);
    CREATE TABLE IF NOT EXISTS account_sessions (
      token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS account_sessions_account ON account_sessions(account_id,expires_at);
    CREATE TABLE IF NOT EXISTS cohorts (
      id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, join_code_hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cohorts_created ON cohorts(created_at DESC);
    CREATE TABLE IF NOT EXISTS learner_cohorts (
      learner TEXT NOT NULL PRIMARY KEY, cohort_id TEXT NOT NULL, joined_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS learner_cohorts_cohort ON learner_cohorts(cohort_id,joined_at DESC);
    CREATE TABLE IF NOT EXISTS account_identities (
      provider TEXT NOT NULL,
      subject TEXT NOT NULL,
      account_id TEXT NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      picture TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      last_login_at INTEGER NOT NULL,
      PRIMARY KEY (provider, subject)
    );
    CREATE INDEX IF NOT EXISTS account_identities_account ON account_identities(account_id);
  `)
  const existingVersion = Number(
    db.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get()?.value ?? 0,
  )
  if (existingVersion > STUDY_SCHEMA_VERSION)
    throw new Error(`Database schema v${existingVersion} is newer than server v${STUDY_SCHEMA_VERSION}`)
  db.prepare(`
    INSERT INTO schema_meta(key,value,updated_at) VALUES('schema_version',?,?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at
  `).run(String(STUDY_SCHEMA_VERSION), Date.now())
}

export function getNodeSchemaVersion(db) {
  const value = db.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get()?.value
  return Number(value)
}

function materializeErrorBook(db, learner, state) {
  const entries = buildErrorBookEntries(state)
  db.prepare('DELETE FROM error_book WHERE learner=?').run(learner)
  const insert = db.prepare(`
    INSERT INTO error_book(
      learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,
      first_wrong_at,last_wrong_at,last_attempt_at,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
  `)
  for (const item of entries) {
    insert.run(
      learner, item.itemId, item.kind, item.sourceId, item.label, safeJson(item.context),
      item.errorCount, item.correctStreak, item.mastered ? 1 : 0,
      item.firstWrongAt, item.lastWrongAt, item.lastAttemptAt, item.updatedAt,
    )
  }
}

function materializeAutoCheckins(db, learner, state, nowMs) {
  const days = new Set([
    ...Object.keys(state.minutes ?? {}),
    ...(state.learning?.vocabulary?.records ?? []).map((item) => item.day),
    ...(state.learning?.grammar?.history ?? []).map((item) => item.day),
    ...Object.keys(state.learning?.conjugationDaily ?? {}),
  ])
  const upsert = db.prepare(`
    INSERT INTO checkins(learner,day,status,completed_at,source) VALUES(?,?,?,?,?)
    ON CONFLICT(learner,day) DO UPDATE SET
      status=CASE WHEN excluded.status='complete' THEN 'complete' ELSE checkins.status END,
      completed_at=CASE WHEN excluded.status='complete' THEN excluded.completed_at ELSE checkins.completed_at END,
      source=CASE WHEN excluded.status='complete' THEN excluded.source ELSE checkins.source END
  `)
  for (const day of days) {
    if (!dateKey(day)) continue
    const summary = studyDaySummary(state, day)
    if (summary.complete) upsert.run(learner, day, 'complete', nowMs, 'automatic')
  }
}

function checkinDays(db, learner) {
  return db.prepare("SELECT day FROM checkins WHERE learner=? AND status IN ('complete','makeup') ORDER BY day").all(learner).map((row) => row.day)
}

function materializeAchievements(db, learner, state, nowMs) {
  const days = checkinDays(db, learner)
  const insert = db.prepare(`
    INSERT OR IGNORE INTO achievements(learner,achievement_id,title,description,unlocked_at,payload)
    VALUES(?,?,?,?,?,?)
  `)
  for (const item of buildAchievementCandidates(state, days)) {
    insert.run(learner, item.id, item.title, item.description, nowMs, safeJson(item.progress))
  }
}

function materializeWeeklyReports(db, learner, state, nowMs) {
  db.prepare('DELETE FROM weekly_reports WHERE learner=?').run(learner)
  const today = new Date(nowMs).toISOString().slice(0, 10)
  let weekStart = state.startDate
  let previous = null
  let generated = 0
  while (weekStart <= today && generated < 26) {
    const weekEnd = addDays(weekStart, 6)
    const summaries = Array.from({ length: 7 }, (_, index) => studyDaySummary(state, addDays(weekStart, index)))
    const report = buildWeeklyReport(state, weekStart, summaries, previous)
    const finalized = weekEnd < today ? 1 : 0
    db.prepare(`
      INSERT INTO weekly_reports(learner,week_start,week_end,payload,generated_at,finalized)
      VALUES(?,?,?,?,?,?)
      ON CONFLICT(learner,week_start) DO UPDATE SET
        week_end=excluded.week_end,payload=excluded.payload,generated_at=excluded.generated_at,finalized=excluded.finalized
    `).run(learner, weekStart, weekEnd, safeJson(report), nowMs, finalized)
    previous = report
    weekStart = addDays(weekStart, 7)
    generated += 1
  }
}

function materializeTcfAttempts(db, learner, state) {
  db.prepare('DELETE FROM tcf_attempts WHERE learner=?').run(learner)
  const insert = db.prepare(`
    INSERT INTO tcf_attempts(
      learner,attempt_id,skill,question_count,correct_count,scaled_score,nclc,
      duration_seconds,started_at,finished_at,day,answers
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
  `)
  for (const item of state.learning?.tcfAttempts ?? []) {
    insert.run(
      learner, item.id, item.skill, item.questionCount, item.correctCount, item.scaledScore, item.nclc,
      item.durationSeconds, item.startedAt, item.finishedAt, item.day, safeJson(item.answers),
    )
  }
}

export function materializeNodeFeatures(db, learner, input, nowMs = Date.now()) {
  const state = normalizeState(input)
  materializeErrorBook(db, learner, state)
  materializeAutoCheckins(db, learner, state, nowMs)
  materializeAchievements(db, learner, state, nowMs)
  materializeWeeklyReports(db, learner, state, nowMs)
  materializeTcfAttempts(db, learner, state)
}

export function listNodeErrorBook(db, learner, { kind = '', status = 'active', from = '', to = '', limit = 100 } = {}) {
  const clauses = ['learner=?']
  const args = [learner]
  if (kind) { clauses.push('kind=?'); args.push(kind) }
  if (status === 'active') clauses.push('mastered=0')
  else if (status === 'mastered') clauses.push('mastered=1')
  if (from) { clauses.push('last_wrong_at>=?'); args.push(new Date(from + 'T00:00:00.000Z').getTime()) }
  if (to) { clauses.push('last_wrong_at<=?'); args.push(new Date(to + 'T23:59:59.999Z').getTime()) }
  const rows = db.prepare(`
    SELECT item_id,kind,source_id,label,context,error_count,correct_streak,mastered,
           first_wrong_at,last_wrong_at,last_attempt_at,updated_at
    FROM error_book WHERE ${clauses.join(' AND ')}
    ORDER BY mastered ASC,last_wrong_at DESC,error_count DESC LIMIT ?
  `).all(...args, limit)
  return rows.map((row) => ({
    itemId: row.item_id,
    kind: row.kind,
    sourceId: row.source_id,
    label: row.label,
    context: parseJson(row.context, {}),
    errorCount: row.error_count,
    correctStreak: row.correct_streak,
    mastered: Boolean(row.mastered),
    firstWrongAt: row.first_wrong_at,
    lastWrongAt: row.last_wrong_at,
    lastAttemptAt: row.last_attempt_at,
    updatedAt: row.updated_at,
  }))
}

export function listNodeCheckins(db, learner, { from = '', to = '', today = new Date().toISOString().slice(0, 10), state = null } = {}) {
  const clauses = ['learner=?']
  const args = [learner]
  if (from) { clauses.push('day>=?'); args.push(from) }
  if (to) { clauses.push('day<=?'); args.push(to) }
  const items = db.prepare(`
    SELECT day,status,completed_at,source FROM checkins
    WHERE ${clauses.join(' AND ')} ORDER BY day DESC LIMIT 180
  `).all(...args).map((row) => ({
    day: row.day, status: row.status, completedAt: row.completed_at, source: row.source,
  }))
  const days = items.filter((item) => item.status === 'complete' || item.status === 'makeup').map((item) => item.day)
  const byDay = new Map(items.map((item) => [item.day, item]))
  const daily = state
    ? Array.from({ length: 14 }, (_, index) => addDays(today, index - 13)).map((day) => ({
        ...studyDaySummary(state, day),
        checkinStatus: byDay.get(day)?.status ?? null,
      }))
    : []
  return { items, daily, streak: streakFromCheckins(days, today) }
}

export function applyNodeMakeup(db, learner, state, day, nowMs = Date.now()) {
  const today = new Date(nowMs).toISOString().slice(0, 10)
  if (!dateKey(day) || day >= today) return { ok: false, code: 'INVALID_MAKEUP_DAY', message: '补签只能用于过去的学习日。' }
  const age = diffDays(day, today)
  if (age < 1 || age > 7) return { ok: false, code: 'MAKEUP_WINDOW_EXPIRED', message: '只能补签最近 7 天。' }
  const summary = studyDaySummary(state, day)
  if (!summary.active) return { ok: false, code: 'NOT_A_STUDY_DAY', message: '该日期不是当前计划学习日。' }
  const existing = db.prepare('SELECT status FROM checkins WHERE learner=? AND day=?').get(learner, day)
  if (existing) return { ok: false, code: 'ALREADY_CHECKED_IN', message: '该日期已经打卡或补签。' }
  if (summary.actualMinutes < 10) return { ok: false, code: 'MAKEUP_MINUTES_REQUIRED', message: '补签需要当天至少有 10 分钟学习记录。' }
  const monday = addDays(day, -((new Date(day + 'T00:00:00.000Z').getUTCDay() + 6) % 7))
  const sunday = addDays(monday, 6)
  const count = db.prepare("SELECT COUNT(*) AS count FROM checkins WHERE learner=? AND status='makeup' AND day BETWEEN ? AND ?")
    .get(learner, monday, sunday)?.count ?? 0
  if (count >= 2) return { ok: false, code: 'MAKEUP_LIMIT_REACHED', message: '每个自然周最多补签 2 次。' }
  db.prepare('INSERT INTO checkins(learner,day,status,completed_at,source) VALUES(?,?,?,?,?)')
    .run(learner, day, 'makeup', nowMs, 'manual')
  materializeAchievements(db, learner, state, nowMs)
  return { ok: true }
}

export function listNodeAchievements(db, learner) {
  return db.prepare(`
    SELECT achievement_id,title,description,unlocked_at,payload
    FROM achievements WHERE learner=? ORDER BY unlocked_at DESC,achievement_id
  `).all(learner).map((row) => ({
    id: row.achievement_id,
    title: row.title,
    description: row.description,
    unlockedAt: row.unlocked_at,
    progress: parseJson(row.payload, {}),
  }))
}

export function listNodeWeeklyReports(db, learner, limit = 26) {
  return db.prepare(`
    SELECT week_start,week_end,payload,generated_at,finalized
    FROM weekly_reports WHERE learner=? ORDER BY week_start DESC LIMIT ?
  `).all(learner, limit).map((row) => ({
    ...parseJson(row.payload, {}),
    generatedAt: row.generated_at,
    finalized: Boolean(row.finalized),
  }))
}

export function getNodeTcfEeDraft(db, learner) {
  const row = db.prepare(`
    SELECT draft_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
           remaining_seconds, current_task, started_at, updated_at
    FROM tcf_ee_drafts WHERE learner=?
  `).get(learner)
  if (!row) return null
  return {
    draftId: row.draft_id,
    task1Id: row.task1_id,
    task1Response: row.task1_response,
    task2Id: row.task2_id,
    task2Response: row.task2_response,
    task3Id: row.task3_id,
    task3Response: row.task3_response,
    remainingSeconds: row.remaining_seconds,
    currentTask: row.current_task,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
  }
}

export function saveNodeTcfEeDraft(db, learner, draft) {
  db.prepare(`
    INSERT INTO tcf_ee_drafts(
      learner, draft_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
      remaining_seconds, current_task, started_at, updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(learner) DO UPDATE SET
      draft_id=excluded.draft_id,
      task1_id=excluded.task1_id,
      task1_response=excluded.task1_response,
      task2_id=excluded.task2_id,
      task2_response=excluded.task2_response,
      task3_id=excluded.task3_id,
      task3_response=excluded.task3_response,
      remaining_seconds=excluded.remaining_seconds,
      current_task=excluded.current_task,
      started_at=excluded.started_at,
      updated_at=excluded.updated_at
  `).run(
    learner,
    draft.draftId,
    draft.task1Id,
    draft.task1Response ?? '',
    draft.task2Id,
    draft.task2Response ?? '',
    draft.task3Id,
    draft.task3Response ?? '',
    draft.remainingSeconds,
    draft.currentTask ?? 0,
    draft.startedAt,
    draft.updatedAt ?? Date.now(),
  )
}

export function deleteNodeTcfEeDraft(db, learner) {
  db.prepare('DELETE FROM tcf_ee_drafts WHERE learner=?').run(learner)
}

export function saveNodeTcfEeAttempt(db, learner, attempt) {
  db.prepare(`
    INSERT INTO tcf_ee_attempts(
      learner, attempt_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
      word_counts, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(learner, attempt_id) DO UPDATE SET
      task1_id=excluded.task1_id,
      task1_response=excluded.task1_response,
      task2_id=excluded.task2_id,
      task2_response=excluded.task2_response,
      task3_id=excluded.task3_id,
      task3_response=excluded.task3_response,
      word_counts=excluded.word_counts,
      scores=excluded.scores,
      total_score=excluded.total_score,
      nclc=excluded.nclc,
      duration_seconds=excluded.duration_seconds,
      started_at=excluded.started_at,
      finished_at=excluded.finished_at,
      day=excluded.day
  `).run(
    learner,
    attempt.id,
    attempt.task1Id,
    attempt.task1Response,
    attempt.task2Id,
    attempt.task2Response,
    attempt.task3Id,
    attempt.task3Response,
    safeJson(attempt.wordCounts),
    safeJson(attempt.scores),
    attempt.totalScore,
    attempt.nclc,
    attempt.durationSeconds,
    attempt.startedAt,
    attempt.finishedAt,
    attempt.day,
  )
  deleteNodeTcfEeDraft(db, learner)
}

export function listNodeTcfEeAttempts(db, learner, limit = 100) {
  return db.prepare(`
    SELECT attempt_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
           word_counts, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    FROM tcf_ee_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).all(learner, limit).map((row) => ({
    id: row.attempt_id,
    skill: 'writing',
    task1Id: row.task1_id,
    task1Response: row.task1_response,
    task2Id: row.task2_id,
    task2Response: row.task2_response,
    task3Id: row.task3_id,
    task3Response: row.task3_response,
    wordCounts: parseJson(row.word_counts, {}),
    scores: parseJson(row.scores, {}),
    totalScore: row.total_score,
    scaledScore: row.total_score,
    score: row.total_score,
    nclc: row.nclc,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    day: row.day,
  }))
}

export function saveNodeTcfEoAttempt(db, learner, attempt) {
  db.prepare(`
    INSERT INTO tcf_eo_attempts(
      learner, attempt_id, task1_id, task1_duration, task2_id, task2_duration, task3_id, task3_duration,
      recordings_meta, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(learner, attempt_id) DO UPDATE SET
      task1_id=excluded.task1_id,
      task1_duration=excluded.task1_duration,
      task2_id=excluded.task2_id,
      task2_duration=excluded.task2_duration,
      task3_id=excluded.task3_id,
      task3_duration=excluded.task3_duration,
      recordings_meta=excluded.recordings_meta,
      scores=excluded.scores,
      total_score=excluded.total_score,
      nclc=excluded.nclc,
      duration_seconds=excluded.duration_seconds,
      started_at=excluded.started_at,
      finished_at=excluded.finished_at,
      day=excluded.day
  `).run(
    learner,
    attempt.id,
    attempt.task1Id,
    attempt.task1Duration ?? 0,
    attempt.task2Id,
    attempt.task2Duration ?? 0,
    attempt.task3Id,
    attempt.task3Duration ?? 0,
    safeJson(attempt.recordingsMeta),
    safeJson(attempt.scores),
    attempt.totalScore,
    attempt.nclc,
    attempt.durationSeconds,
    attempt.startedAt,
    attempt.finishedAt,
    attempt.day,
  )
}

export function listNodeTcfEoAttempts(db, learner, limit = 100) {
  return db.prepare(`
    SELECT attempt_id, task1_id, task1_duration, task2_id, task2_duration, task3_id, task3_duration,
           recordings_meta, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    FROM tcf_eo_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).all(learner, limit).map((row) => ({
    id: row.attempt_id,
    skill: 'speaking',
    task1Id: row.task1_id,
    task1Duration: row.task1_duration,
    task2Id: row.task2_id,
    task2Duration: row.task2_duration,
    task3Id: row.task3_id,
    task3Duration: row.task3_duration,
    recordingsMeta: parseJson(row.recordings_meta, {}),
    scores: parseJson(row.scores, {}),
    totalScore: row.total_score,
    scaledScore: row.total_score,
    score: row.total_score,
    nclc: row.nclc,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    day: row.day,
  }))
}

export function deleteNodeTcfEoAttempt(db, learner, attemptId) {
  db.prepare('DELETE FROM tcf_eo_attempts WHERE learner=? AND attempt_id=?').run(learner, attemptId)
}

export function listNodeTcfAttempts(db, learner, { skill = '', limit = 100 } = {}) {
  if (skill === 'writing') {
    return listNodeTcfEeAttempts(db, learner, limit)
  }
  if (skill === 'speaking') {
    return listNodeTcfEoAttempts(db, learner, limit)
  }
  if (skill === 'listening' || skill === 'reading') {
    return db.prepare(`
      SELECT attempt_id,skill,question_count,correct_count,scaled_score,nclc,duration_seconds,
             started_at,finished_at,day,answers
      FROM tcf_attempts WHERE learner=? AND skill=?
      ORDER BY finished_at DESC LIMIT ?
    `).all(learner, skill, limit).map((row) => ({
      id: row.attempt_id,
      skill: row.skill,
      questionCount: row.question_count,
      correctCount: row.correct_count,
      scaledScore: row.scaled_score,
      score: row.scaled_score,
      nclc: row.nclc,
      durationSeconds: row.duration_seconds,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      day: row.day,
      answers: parseJson(row.answers, []),
    }))
  }
  const qcm = db.prepare(`
    SELECT attempt_id,skill,question_count,correct_count,scaled_score,nclc,duration_seconds,
           started_at,finished_at,day,answers
    FROM tcf_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).all(learner, limit).map((row) => ({
    id: row.attempt_id,
    skill: row.skill,
    questionCount: row.question_count,
    correctCount: row.correct_count,
    scaledScore: row.scaled_score,
    score: row.scaled_score,
    nclc: row.nclc,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    day: row.day,
    answers: parseJson(row.answers, []),
  }))
  const ee = listNodeTcfEeAttempts(db, learner, limit)
  const eo = listNodeTcfEoAttempts(db, learner, limit)
  return [...qcm, ...ee, ...eo]
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, limit)
}

export function consumeNodeRateLimit(db, scope, action, {
  nowMs = Date.now(), limit = 8, windowMs = 5 * 60_000, blockMs = 15 * 60_000,
} = {}) {
  const row = db.prepare('SELECT window_start,count,blocked_until FROM rate_limits WHERE scope=? AND action=?').get(scope, action)
  if (row?.blocked_until > nowMs) return { allowed: false, retryAfterMs: row.blocked_until - nowMs }
  if (!row || nowMs - row.window_start >= windowMs) {
    db.prepare(`
      INSERT INTO rate_limits(scope,action,window_start,count,blocked_until) VALUES(?,?,?,?,0)
      ON CONFLICT(scope,action) DO UPDATE SET window_start=excluded.window_start,count=1,blocked_until=0
    `).run(scope, action, nowMs, 1)
    return { allowed: true, remaining: limit - 1 }
  }
  const count = row.count + 1
  if (count > limit) {
    const blockedUntil = nowMs + blockMs
    db.prepare('UPDATE rate_limits SET count=?,blocked_until=? WHERE scope=? AND action=?').run(count, blockedUntil, scope, action)
    return { allowed: false, retryAfterMs: blockMs }
  }
  db.prepare('UPDATE rate_limits SET count=? WHERE scope=? AND action=?').run(count, scope, action)
  return { allowed: true, remaining: Math.max(0, limit - count) }
}

export function writeNodeAudit(db, { id, learner = null, action, status, actorHash, details = {}, createdAt = Date.now() }) {
  db.prepare('INSERT INTO audit_log(id,learner,action,status,actor_hash,details,created_at) VALUES(?,?,?,?,?,?,?)')
    .run(id, learner, action, status, actorHash, safeJson(details).slice(0, 4000), createdAt)
}

export function deleteNodeLearnerData(db, learner) {
  const account = db.prepare('SELECT id FROM accounts WHERE learner=?').get(learner)
  if (account?.id) {
    db.prepare('DELETE FROM account_identities WHERE account_id=?').run(account.id)
    db.prepare('DELETE FROM passkeys WHERE account_id=?').run(account.id)
    db.prepare('DELETE FROM account_sessions WHERE account_id=?').run(account.id)
    db.prepare('DELETE FROM accounts WHERE id=?').run(account.id)
  }
  db.prepare('DELETE FROM passkey_challenges WHERE learner=?').run(learner)
  const tables = [
    'mutations',
    'sync_keys',
    'error_book',
    'checkins',
    'achievements',
    'weekly_reports',
    'tcf_attempts',
    'tcf_ee_drafts',
    'tcf_ee_attempts',
    'tcf_eo_attempts',
    'audit_log',
  ]
  for (const table of tables) db.prepare(`DELETE FROM ${table} WHERE learner=?`).run(learner)
  db.prepare('DELETE FROM rate_limits WHERE scope=?').run('learner:' + learner)
  db.prepare('DELETE FROM learners WHERE id=?').run(learner)
}
