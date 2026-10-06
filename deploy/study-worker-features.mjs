import { buildAchievementCandidates, buildErrorBookEntries, buildWeeklyReport, featureDateUtils, streakFromCheckins } from '../server/study-features.mjs'
import { normalizeState, studyDaySummary } from '../server/study-model.mjs'

const { addDays, diffDays, dateKey } = featureDateUtils
const safeJson = (value) => JSON.stringify(value ?? {})
const parseJson = (value, fallback = null) => {
  try { return JSON.parse(value) } catch { return fallback }
}
const runBatches = async (db, statements, size = 50) => {
  for (let index = 0; index < statements.length; index += size) {
    await db.batch(statements.slice(index, index + size))
  }
}

async function materializeErrorBook(db, learner, state) {
  const entries = buildErrorBookEntries(state)
  const statements = [db.prepare('DELETE FROM error_book WHERE learner=?').bind(learner)]
  for (const item of entries) {
    statements.push(
      db.prepare(`
        INSERT INTO error_book(
          learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,
          first_wrong_at,last_wrong_at,last_attempt_at,updated_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        learner, item.itemId, item.kind, item.sourceId, item.label, safeJson(item.context),
        item.errorCount, item.correctStreak, item.mastered ? 1 : 0,
        item.firstWrongAt, item.lastWrongAt, item.lastAttemptAt, item.updatedAt,
      ),
    )
  }
  await runBatches(db, statements)
}

async function materializeAutoCheckins(db, learner, state, nowMs) {
  const days = new Set([
    ...Object.keys(state.minutes ?? {}),
    ...(state.learning?.vocabulary?.records ?? []).map((item) => item.day),
    ...(state.learning?.grammar?.history ?? []).map((item) => item.day),
    ...Object.keys(state.learning?.conjugationDaily ?? {}),
  ])
  const statements = []
  for (const day of days) {
    if (!dateKey(day)) continue
    const summary = studyDaySummary(state, day)
    if (!summary.complete) continue
    statements.push(
      db.prepare(`
        INSERT INTO checkins(learner,day,status,completed_at,source) VALUES(?,?,?,?,?)
        ON CONFLICT(learner,day) DO UPDATE SET
          status=CASE WHEN excluded.status='complete' THEN 'complete' ELSE checkins.status END,
          completed_at=CASE WHEN excluded.status='complete' THEN excluded.completed_at ELSE checkins.completed_at END,
          source=CASE WHEN excluded.status='complete' THEN excluded.source ELSE checkins.source END
      `).bind(learner, day, 'complete', nowMs, 'automatic'),
    )
  }
  if (statements.length) await runBatches(db, statements)
}

async function checkinDays(db, learner) {
  const result = await db.prepare("SELECT day FROM checkins WHERE learner=? AND status IN ('complete','makeup') ORDER BY day").bind(learner).all()
  return (result.results ?? []).map((row) => row.day)
}

async function materializeAchievements(db, learner, state, nowMs) {
  const days = await checkinDays(db, learner)
  const candidates = buildAchievementCandidates(state, days)
  if (!candidates.length) return
  await runBatches(db, candidates.map((item) =>
    db.prepare(`
      INSERT OR IGNORE INTO achievements(learner,achievement_id,title,description,unlocked_at,payload)
      VALUES(?,?,?,?,?,?)
    `).bind(learner, item.id, item.title, item.description, nowMs, safeJson(item.progress)),
  ))
}

async function materializeWeeklyReports(db, learner, state, nowMs) {
  const today = new Date(nowMs).toISOString().slice(0, 10)
  let weekStart = state.startDate
  let previous = null
  let generated = 0
  const statements = [db.prepare('DELETE FROM weekly_reports WHERE learner=?').bind(learner)]
  while (weekStart <= today && generated < 26) {
    const weekEnd = addDays(weekStart, 6)
    const summaries = Array.from({ length: 7 }, (_, index) => studyDaySummary(state, addDays(weekStart, index)))
    const report = buildWeeklyReport(state, weekStart, summaries, previous)
    const finalized = weekEnd < today ? 1 : 0
    statements.push(
      db.prepare(`
        INSERT INTO weekly_reports(learner,week_start,week_end,payload,generated_at,finalized)
        VALUES(?,?,?,?,?,?)
        ON CONFLICT(learner,week_start) DO UPDATE SET
          week_end=excluded.week_end,payload=excluded.payload,generated_at=excluded.generated_at,finalized=excluded.finalized
      `).bind(learner, weekStart, weekEnd, safeJson(report), nowMs, finalized),
    )
    previous = report
    weekStart = addDays(weekStart, 7)
    generated += 1
  }
  if (statements.length) await runBatches(db, statements)
}

async function materializeTcfAttempts(db, learner, state) {
  const statements = [db.prepare('DELETE FROM tcf_attempts WHERE learner=?').bind(learner)]
  for (const item of state.learning?.tcfAttempts ?? []) {
    statements.push(
      db.prepare(`
        INSERT INTO tcf_attempts(
          learner,attempt_id,skill,question_count,correct_count,scaled_score,nclc,
          duration_seconds,started_at,finished_at,day,answers
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        learner, item.id, item.skill, item.questionCount, item.correctCount, item.scaledScore, item.nclc,
        item.durationSeconds, item.startedAt, item.finishedAt, item.day, safeJson(item.answers),
      ),
    )
  }
  await runBatches(db, statements)
}

export async function materializeWorkerFeatures(db, learner, input, nowMs = Date.now()) {
  const state = normalizeState(input)
  await materializeErrorBook(db, learner, state)
  await materializeAutoCheckins(db, learner, state, nowMs)
  await materializeAchievements(db, learner, state, nowMs)
  await materializeWeeklyReports(db, learner, state, nowMs)
  await materializeTcfAttempts(db, learner, state)
}

export async function listWorkerErrorBook(db, learner, { kind = '', status = 'active', from = '', to = '', limit = 100 } = {}) {
  const clauses = ['learner=?']
  const args = [learner]
  if (kind) { clauses.push('kind=?'); args.push(kind) }
  if (status === 'active') clauses.push('mastered=0')
  else if (status === 'mastered') clauses.push('mastered=1')
  if (from) { clauses.push('last_wrong_at>=?'); args.push(new Date(from + 'T00:00:00.000Z').getTime()) }
  if (to) { clauses.push('last_wrong_at<=?'); args.push(new Date(to + 'T23:59:59.999Z').getTime()) }
  args.push(limit)
  const result = await db.prepare(`
    SELECT item_id,kind,source_id,label,context,error_count,correct_streak,mastered,
           first_wrong_at,last_wrong_at,last_attempt_at,updated_at
    FROM error_book WHERE ${clauses.join(' AND ')}
    ORDER BY mastered ASC,last_wrong_at DESC,error_count DESC LIMIT ?
  `).bind(...args).all()
  return (result.results ?? []).map((row) => ({
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

export async function listWorkerCheckins(db, learner, { from = '', to = '', today = new Date().toISOString().slice(0, 10), state = null } = {}) {
  const clauses = ['learner=?']
  const args = [learner]
  if (from) { clauses.push('day>=?'); args.push(from) }
  if (to) { clauses.push('day<=?'); args.push(to) }
  const result = await db.prepare(`
    SELECT day,status,completed_at,source FROM checkins
    WHERE ${clauses.join(' AND ')} ORDER BY day DESC LIMIT 180
  `).bind(...args).all()
  const items = (result.results ?? []).map((row) => ({
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

export async function applyWorkerMakeup(db, learner, state, day, nowMs = Date.now()) {
  const today = new Date(nowMs).toISOString().slice(0, 10)
  if (!dateKey(day) || day >= today) return { ok: false, code: 'INVALID_MAKEUP_DAY', message: '补签只能用于过去的学习日。' }
  const age = diffDays(day, today)
  if (age < 1 || age > 7) return { ok: false, code: 'MAKEUP_WINDOW_EXPIRED', message: '只能补签最近 7 天。' }
  const summary = studyDaySummary(state, day)
  if (!summary.active) return { ok: false, code: 'NOT_A_STUDY_DAY', message: '该日期不是当前计划学习日。' }
  const existing = await db.prepare('SELECT status FROM checkins WHERE learner=? AND day=?').bind(learner, day).first()
  if (existing) return { ok: false, code: 'ALREADY_CHECKED_IN', message: '该日期已经打卡或补签。' }
  if (summary.actualMinutes < 10) return { ok: false, code: 'MAKEUP_MINUTES_REQUIRED', message: '补签需要当天至少有 10 分钟学习记录。' }
  const monday = addDays(day, -((new Date(day + 'T00:00:00.000Z').getUTCDay() + 6) % 7))
  const sunday = addDays(monday, 6)
  const count = await db.prepare("SELECT COUNT(*) AS count FROM checkins WHERE learner=? AND status='makeup' AND day BETWEEN ? AND ?")
    .bind(learner, monday, sunday).first()
  if ((count?.count ?? 0) >= 2) return { ok: false, code: 'MAKEUP_LIMIT_REACHED', message: '每个自然周最多补签 2 次。' }
  await db.prepare('INSERT INTO checkins(learner,day,status,completed_at,source) VALUES(?,?,?,?,?)')
    .bind(learner, day, 'makeup', nowMs, 'manual').run()
  await materializeAchievements(db, learner, state, nowMs)
  return { ok: true }
}

export async function listWorkerAchievements(db, learner) {
  const result = await db.prepare(`
    SELECT achievement_id,title,description,unlocked_at,payload
    FROM achievements WHERE learner=? ORDER BY unlocked_at DESC,achievement_id
  `).bind(learner).all()
  return (result.results ?? []).map((row) => ({
    id: row.achievement_id,
    title: row.title,
    description: row.description,
    unlockedAt: row.unlocked_at,
    progress: parseJson(row.payload, {}),
  }))
}

export async function listWorkerWeeklyReports(db, learner, limit = 26) {
  const result = await db.prepare(`
    SELECT week_start,week_end,payload,generated_at,finalized
    FROM weekly_reports WHERE learner=? ORDER BY week_start DESC LIMIT ?
  `).bind(learner, limit).all()
  return (result.results ?? []).map((row) => ({
    ...parseJson(row.payload, {}),
    generatedAt: row.generated_at,
    finalized: Boolean(row.finalized),
  }))
}

export async function getWorkerTcfEeDraft(db, learner) {
  const row = await db.prepare(`
    SELECT draft_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
           remaining_seconds, current_task, started_at, updated_at
    FROM tcf_ee_drafts WHERE learner=?
  `).bind(learner).first()
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

export async function saveWorkerTcfEeDraft(db, learner, draft) {
  await db.prepare(`
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
  `).bind(
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
  ).run()
}

export async function deleteWorkerTcfEeDraft(db, learner) {
  await db.prepare('DELETE FROM tcf_ee_drafts WHERE learner=?').bind(learner).run()
}

export async function saveWorkerTcfEeAttempt(db, learner, attempt) {
  await db.batch([
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
    `).bind(
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
    ),
    db.prepare('DELETE FROM tcf_ee_drafts WHERE learner=?').bind(learner),
  ])
}

export async function listWorkerTcfEeAttempts(db, learner, limit = 100) {
  const result = await db.prepare(`
    SELECT attempt_id, task1_id, task1_response, task2_id, task2_response, task3_id, task3_response,
           word_counts, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    FROM tcf_ee_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).bind(learner, limit).all()
  return (result.results ?? []).map((row) => ({
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

export async function saveWorkerTcfEoAttempt(db, learner, attempt) {
  await db.prepare(`
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
  `).bind(
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
  ).run()
}

export async function listWorkerTcfEoAttempts(db, learner, limit = 100) {
  const result = await db.prepare(`
    SELECT attempt_id, task1_id, task1_duration, task2_id, task2_duration, task3_id, task3_duration,
           recordings_meta, scores, total_score, nclc, duration_seconds, started_at, finished_at, day
    FROM tcf_eo_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).bind(learner, limit).all()
  return (result.results ?? []).map((row) => ({
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

export async function deleteWorkerTcfEoAttempt(db, learner, attemptId) {
  await db.prepare('DELETE FROM tcf_eo_attempts WHERE learner=? AND attempt_id=?').bind(learner, attemptId).run()
}

export async function listWorkerTcfAttempts(db, learner, { skill = '', limit = 100 } = {}) {
  if (skill === 'writing') {
    return listWorkerTcfEeAttempts(db, learner, limit)
  }
  if (skill === 'speaking') {
    return listWorkerTcfEoAttempts(db, learner, limit)
  }
  if (skill === 'listening' || skill === 'reading') {
    const result = await db.prepare(`
      SELECT attempt_id,skill,question_count,correct_count,scaled_score,nclc,duration_seconds,
             started_at,finished_at,day,answers
      FROM tcf_attempts WHERE learner=? AND skill=?
      ORDER BY finished_at DESC LIMIT ?
    `).bind(learner, skill, limit).all()
    return (result.results ?? []).map((row) => ({
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
  const qcmResult = await db.prepare(`
    SELECT attempt_id,skill,question_count,correct_count,scaled_score,nclc,duration_seconds,
           started_at,finished_at,day,answers
    FROM tcf_attempts WHERE learner=?
    ORDER BY finished_at DESC LIMIT ?
  `).bind(learner, limit).all()
  const qcm = (qcmResult.results ?? []).map((row) => ({
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
  const ee = await listWorkerTcfEeAttempts(db, learner, limit)
  const eo = await listWorkerTcfEoAttempts(db, learner, limit)
  return [...qcm, ...ee, ...eo]
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, limit)
}

export async function consumeWorkerRateLimit(db, scope, action, {
  nowMs = Date.now(), limit = 8, windowMs = 5 * 60_000, blockMs = 15 * 60_000,
} = {}) {
  const row = await db.prepare('SELECT window_start,count,blocked_until FROM rate_limits WHERE scope=? AND action=?').bind(scope, action).first()
  if (row?.blocked_until > nowMs) return { allowed: false, retryAfterMs: row.blocked_until - nowMs }
  if (!row || nowMs - row.window_start >= windowMs) {
    await db.prepare(`
      INSERT INTO rate_limits(scope,action,window_start,count,blocked_until) VALUES(?,?,?,?,0)
      ON CONFLICT(scope,action) DO UPDATE SET window_start=excluded.window_start,count=1,blocked_until=0
    `).bind(scope, action, nowMs, 1).run()
    return { allowed: true, remaining: limit - 1 }
  }
  const count = row.count + 1
  if (count > limit) {
    const blockedUntil = nowMs + blockMs
    await db.prepare('UPDATE rate_limits SET count=?,blocked_until=? WHERE scope=? AND action=?')
      .bind(count, blockedUntil, scope, action).run()
    return { allowed: false, retryAfterMs: blockMs }
  }
  await db.prepare('UPDATE rate_limits SET count=? WHERE scope=? AND action=?').bind(count, scope, action).run()
  return { allowed: true, remaining: Math.max(0, limit - count) }
}

export async function writeWorkerAudit(db, { id, learner = null, action, status, actorHash, details = {}, createdAt = Date.now() }) {
  await db.prepare('INSERT INTO audit_log(id,learner,action,status,actor_hash,details,created_at) VALUES(?,?,?,?,?,?,?)')
    .bind(id, learner, action, status, actorHash, safeJson(details).slice(0, 4000), createdAt).run()
}

export async function deleteWorkerLearnerData(db, learner) {
  const account = await db.prepare('SELECT id FROM accounts WHERE learner=?').bind(learner).first()
  const statements = [
    db.prepare('DELETE FROM mutations WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM sync_keys WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM error_book WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM checkins WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM achievements WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM weekly_reports WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM tcf_attempts WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM tcf_ee_drafts WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM tcf_ee_attempts WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM tcf_eo_attempts WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM audit_log WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM rate_limits WHERE scope=?').bind('learner:' + learner),
    db.prepare('DELETE FROM passkey_challenges WHERE learner=?').bind(learner),
    db.prepare('DELETE FROM learners WHERE id=?').bind(learner),
  ]
  if (account?.id) {
    statements.unshift(
      db.prepare('DELETE FROM passkeys WHERE account_id=?').bind(account.id),
      db.prepare('DELETE FROM account_sessions WHERE account_id=?').bind(account.id),
      db.prepare('DELETE FROM accounts WHERE id=?').bind(account.id),
    )
  }
  await db.batch(statements)
}
