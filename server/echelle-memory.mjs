// Forgetting-curve scheduling for Échelle items (Ebbinghaus-style expanding intervals).
// Every pass at or after the due time moves the item one step further out; a failed check
// means the item was forgotten, so it drops back to "learning" and must be passed again.

export const DAY_MS = 24 * 60 * 60 * 1000
export const REVIEW_INTERVAL_DAYS = Object.freeze([1, 2, 4, 7, 15, 30, 60, 120])
export const MAX_MEMORY_STAGE = REVIEW_INTERVAL_DAYS.length
// Passing the 15-day review is treated as long-term memory.
export const LONG_TERM_STAGE = 5
// Retention is modelled so that it falls to this value exactly when the review is due.
export const TARGET_RETENTION = 0.9

export function intervalDaysForStage(stage) {
  if (!Number.isInteger(stage) || stage < 1) return 0
  return REVIEW_INTERVAL_DAYS[Math.min(stage, MAX_MEMORY_STAGE) - 1]
}

/**
 * Next memory fields after a check finished at `at` (ms).
 * Practising before the due time keeps the schedule; it neither earns a step nor loses one.
 */
export function nextMemory(previous, passed, at) {
  const lapses = previous?.lapses ?? 0
  if (!passed) {
    return { mastered: false, stage: 0, dueAt: null, lastPassedAt: previous?.lastPassedAt ?? null, lapses: previous?.mastered ? lapses + 1 : lapses }
  }
  if (previous?.mastered && typeof previous.dueAt === 'number' && at < previous.dueAt) {
    return { mastered: true, stage: previous.stage, dueAt: previous.dueAt, lastPassedAt: at, lapses }
  }
  const stage = Math.min(MAX_MEMORY_STAGE, (previous?.mastered ? previous.stage : 0) + 1)
  return { mastered: true, stage, dueAt: at + intervalDaysForStage(stage) * DAY_MS, lastPassedAt: at, lapses }
}

/** Fills memory fields for records written before scheduling existed. */
export function withMemoryDefaults(record) {
  if (typeof record.stage === 'number') return record
  return record.mastered
    ? { ...record, stage: 1, dueAt: record.updatedAt + DAY_MS, lastPassedAt: record.updatedAt, lapses: 0 }
    : { ...record, stage: 0, dueAt: null, lastPassedAt: null, lapses: 0 }
}

/**
 * 'new' never checked, 'learning' checked but not passed, 'due' passed but the review time has come,
 * 'mastered' passed and still inside its interval.
 */
export function memoryStatus(record, now) {
  if (!record) return 'new'
  if (!record.mastered) return 'learning'
  return typeof record.dueAt === 'number' && now >= record.dueAt ? 'due' : 'mastered'
}

/** Estimated recall probability, 1 right after a pass and TARGET_RETENTION at the due time. */
export function estimateRetention(record, now) {
  if (!record?.mastered || typeof record.lastPassedAt !== 'number') return 0
  const intervalMs = Math.max(1, (record.dueAt ?? record.lastPassedAt + DAY_MS) - record.lastPassedAt)
  const elapsed = Math.max(0, now - record.lastPassedAt)
  return Math.pow(TARGET_RETENTION, elapsed / intervalMs)
}

export function isLongTerm(record) {
  return Boolean(record?.mastered && record.stage >= LONG_TERM_STAGE)
}
