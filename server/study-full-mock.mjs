// Persisted full-exam state shared by the Node and D1 API implementations.
// Only bounded, structured answers are stored; microphone audio is never sent here.
export const FULL_MOCK_SKILLS = ['listening', 'reading', 'writing', 'speaking']
export const FULL_MOCK_SECONDS = { listening: 2100, reading: 3600, writing: 3600, speaking: 720 }

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const integer = (v, low, high) => Number.isSafeInteger(v) && v >= low && v <= high
const text = (v, max) => typeof v === 'string' && v.length <= max
const uuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
const keys = (value, allowed) => object(value) && Object.keys(value).every((k) => allowed.includes(k))
const scoreFields = {
  writing: { taskCompletion: 5, coherence: 5, vocabulary: 5, grammar: 5 },
  speaking: { fluency: 4, pronunciation: 4, vocabulary: 4, grammar: 4, taskCompletion: 4 },
}
const checkScores = (value, bounds) => keys(value, Object.keys(bounds)) &&
  Object.entries(bounds).every(([name, max]) => integer(value[name], 0, max))

export function fullMockRemaining(session, now = Date.now()) {
  if (session.phase === 'complete') return 0
  return Math.max(0, Math.ceil((session.deadlineAt - now) / 1000))
}

export function validateFullMockSession(session, now = Date.now()) {
  if (!object(session) || JSON.stringify(session).length > 65000 ||
      !keys(session, ['version', 'id', 'phase', 'createdAt', 'updatedAt', 'stageStartedAt', 'deadlineAt', 'completed', 'qcm', 'writing', 'speaking']) ||
      session.version !== 1 || !uuid(session.id) ||
      ![...FULL_MOCK_SKILLS, 'complete'].includes(session.phase) ||
      !integer(session.createdAt, 1, Number.MAX_SAFE_INTEGER) ||
      !integer(session.updatedAt, session.createdAt, Number.MAX_SAFE_INTEGER) ||
      !integer(session.stageStartedAt, session.createdAt, Number.MAX_SAFE_INTEGER) ||
      !integer(session.deadlineAt, 0, Number.MAX_SAFE_INTEGER) ||
      !keys(session.completed, FULL_MOCK_SKILLS) || !keys(session.qcm, ['listening', 'reading'])) {
    throw new Error('INVALID_FULL_MOCK_SESSION')
  }
  for (const [position, skill] of FULL_MOCK_SKILLS.entries()) {
    const entry = session.completed[skill]
    const phase = FULL_MOCK_SKILLS.indexOf(session.phase)
    if ((position < phase || session.phase === 'complete') !== Boolean(entry)) throw new Error('INVALID_FULL_MOCK_SEQUENCE')
    if (entry && (!keys(entry, ['score', 'nclc', 'finishedAt', 'startedAt']) ||
      !(position >= 2 && entry.score === null && entry.nclc === null) &&
        (!integer(entry.score, 0, position < 2 ? 699 : 20) || !integer(entry.nclc, 0, 10)) ||
      !integer(entry.startedAt, session.createdAt, Number.MAX_SAFE_INTEGER) ||
      !integer(entry.finishedAt, entry.startedAt, Number.MAX_SAFE_INTEGER))) {
      throw new Error('INVALID_FULL_MOCK_RESULT')
    }
  }
  for (const [skill, prefix] of [['listening', 'co-'], ['reading', 'ce-']]) {
    const value = session.qcm[skill]
    if (!keys(value, ['answers', 'played', 'index']) || !keys(value.answers, Array.from({ length: 39 }, (_, i) => prefix + String(i + 1).padStart(2, '0'))) ||
        !integer(value.index, 0, 38) || !Array.isArray(value.played) || value.played.length > 39 ||
        new Set(value.played).size !== value.played.length ||
        value.played.some((id) => !/^co-\d{2}$/.test(id) || Number(id.slice(3)) < 1 || Number(id.slice(3)) > 39) ||
        Object.values(value.answers).some((a) => !integer(a, 0, 3))) throw new Error('INVALID_FULL_MOCK_QCM')
  }
  const writing = session.writing
  const speaking = session.speaking
  if (!keys(writing, ['taskIds', 'texts', 'activeTask', 'scores', 'ratedFields']) ||
      (writing.ratedFields !== undefined && (!Array.isArray(writing.ratedFields) ||
        new Set(writing.ratedFields).size !== writing.ratedFields.length ||
        writing.ratedFields.some((field) => !Object.hasOwn(scoreFields.writing, field)))) ||
      !Array.isArray(writing.taskIds) || writing.taskIds.length !== 3 ||
      writing.taskIds.some((id, i) => !text(id, 80) || !id.startsWith('ee-t' + (i + 1) + '-')) ||
      !Array.isArray(writing.texts) || writing.texts.length !== 3 ||
      writing.texts.some((t) => !text(t, 10000)) ||
      !integer(writing.activeTask, 0, 2) || !checkScores(writing.scores, scoreFields.writing)) throw new Error('INVALID_FULL_MOCK_EE')
  if (!keys(speaking, ['taskIds', 'notes', 'activeTask', 'durations', 'scores', 'ratedFields']) ||
      (speaking.ratedFields !== undefined && (!Array.isArray(speaking.ratedFields) ||
        new Set(speaking.ratedFields).size !== speaking.ratedFields.length ||
        speaking.ratedFields.some((field) => !Object.hasOwn(scoreFields.speaking, field)))) ||
      !Array.isArray(speaking.taskIds) || speaking.taskIds.length !== 3 ||
      speaking.taskIds.some((id, i) => !text(id, 80) || !id.startsWith('eo-t' + (i + 1) + '-')) ||
      !Array.isArray(speaking.notes) || speaking.notes.length !== 3 ||
      speaking.notes.some((t) => !text(t, 5000)) ||
      !Array.isArray(speaking.durations) || speaking.durations.length !== 3 ||
      speaking.durations.some((d) => !integer(d, 0, 720)) ||
      !integer(speaking.activeTask, 0, 2) || !checkScores(speaking.scores, scoreFields.speaking)) throw new Error('INVALID_FULL_MOCK_EO')
  if (session.phase === 'complete') {
    if (session.deadlineAt !== 0) throw new Error('INVALID_FULL_MOCK_DEADLINE')
  } else if (session.deadlineAt !== session.stageStartedAt + FULL_MOCK_SECONDS[session.phase] * 1000) {
    throw new Error('INVALID_FULL_MOCK_DEADLINE')
  }
  return session
}

export const FULL_MOCK_UPSERT_SQL = `INSERT INTO tcf_full_mock_sessions(learner,revision,payload,updated_at)
VALUES (?,1,?,?)
ON CONFLICT(learner) DO UPDATE SET
 revision=revision+1,payload=excluded.payload,updated_at=excluded.updated_at
WHERE tcf_full_mock_sessions.revision=?`
export function validateMockUpdate(current, next) {
  validateFullMockSession(next)
  if (!current) return
  if (current.id !== next.id) return // Starting a different sitting explicitly replaces the previous sitting.
  const before = FULL_MOCK_SKILLS.indexOf(current.phase)
  const after = FULL_MOCK_SKILLS.indexOf(next.phase)
  const rank = (value) => value === 'complete' ? 4 : FULL_MOCK_SKILLS.indexOf(value)
  if (rank(next.phase) < rank(current.phase) ||
      (current.phase === next.phase && current.deadlineAt !== next.deadlineAt) ||
      next.createdAt !== current.createdAt ||
      next.updatedAt < current.updatedAt) throw new Error('INVALID_FULL_MOCK_TRANSITION')
}

// Normalize a fast client's clock before persistence. For an existing sitting,
// anchor the active section to the already accepted server deadline so a clock
// adjustment can never reset or extend its timer.
export function normalizeFullMockSession(input, current = null, now = Date.now()) {
  validateFullMockSession(input)
  const next = structuredClone(input)
  if (current?.id === next.id) {
    next.createdAt = current.createdAt
    const sameSection = next.phase === current.phase
    if (sameSection) {
      next.stageStartedAt = current.stageStartedAt
      next.deadlineAt = current.deadlineAt
    } else {
      const skew = Math.max(0, next.updatedAt - now, next.stageStartedAt - now)
      next.stageStartedAt -= skew
      if (next.deadlineAt) next.deadlineAt -= skew
    }
    for (const [skill, result] of Object.entries(next.completed)) {
      if (current.completed[skill]) {
        // Previously completed timestamps were already normalized.
        result.startedAt = current.completed[skill].startedAt
        result.finishedAt = current.completed[skill].finishedAt
      } else {
        result.startedAt = Math.max(next.createdAt, Math.min(now, result.startedAt))
        result.finishedAt = Math.max(result.startedAt, Math.min(now, result.finishedAt))
      }
    }
    next.updatedAt = Math.max(current.updatedAt, Math.min(now, next.updatedAt))
  } else {
    // Shift the sitting as a whole; this preserves section duration and
    // elapsed time instead of resetting the timer to the request arrival.
    const skew = Math.max(0, next.updatedAt - now, next.createdAt - now,
      next.stageStartedAt - now, ...Object.values(next.completed).map((r) => r.finishedAt - now))
    next.createdAt -= skew
    next.updatedAt -= skew
    next.stageStartedAt -= skew
    if (next.deadlineAt) next.deadlineAt -= skew
    for (const result of Object.values(next.completed)) {
      result.startedAt -= skew
      result.finishedAt -= skew
    }
  }
  validateFullMockSession(next)
  return next
}
