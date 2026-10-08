import { createHash, randomBytes, randomUUID } from 'node:crypto'

const JOIN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const JOIN_CODE_PREFIX = 'cohort-join-v1:'

export function normalizeJoinCode(input) {
  if (typeof input !== 'string') return null
  const normalized = input.replace(/[\s-]/g, '').toUpperCase()
  if (!/^[A-Z0-9]{16}$/.test(normalized)) return null
  return normalized
}

export function formatJoinCode(normalized16) {
  return normalized16.match(/.{1,4}/g).join('-')
}

export function generateJoinCodeNormalized() {
  const bytes = randomBytes(16)
  let out = ''
  for (let i = 0; i < 16; i++) out += JOIN_CODE_CHARS[bytes[i] % JOIN_CODE_CHARS.length]
  return out
}

export function hashJoinCode(normalized16) {
  return createHash('sha256').update(JOIN_CODE_PREFIX + normalized16).digest('hex')
}

export function validateCohortName(name) {
  if (typeof name !== 'string') return null
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 80) return null
  return trimmed
}

export function createCohort(db, name) {
  const label = validateCohortName(name)
  if (!label) throw new Error('Invalid cohort name')
  const id = randomUUID()
  const normalized = generateJoinCodeNormalized()
  const joinCodeHash = hashJoinCode(normalized)
  const now = Date.now()
  db.prepare(`
    INSERT INTO cohorts(id,name,join_code_hash,created_at,updated_at) VALUES(?,?,?,?,?)
  `).run(id, label, joinCodeHash, now, now)
  return {
    id,
    name: label,
    joinCode: formatJoinCode(normalized),
    createdAt: now,
  }
}

export function rotateCohortJoinCode(db, cohortId) {
  if (typeof cohortId !== 'string' || !/^[a-f0-9-]{36}$/.test(cohortId)) throw new Error('Invalid cohort id')
  const row = db.prepare('SELECT id FROM cohorts WHERE id=?').get(cohortId)
  if (!row) throw new Error('Cohort not found')
  const normalized = generateJoinCodeNormalized()
  const joinCodeHash = hashJoinCode(normalized)
  const now = Date.now()
  db.prepare('UPDATE cohorts SET join_code_hash=?, updated_at=? WHERE id=?').run(joinCodeHash, now, cohortId)
  return { cohortId, joinCode: formatJoinCode(normalized), updatedAt: now }
}

export function listCohorts(db) {
  return db
    .prepare(`
      SELECT
        c.id,
        c.name,
        c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        (SELECT COUNT(*) FROM learner_cohorts lc WHERE lc.cohort_id = c.id) AS memberCount
      FROM cohorts c
      ORDER BY c.created_at DESC
    `)
    .all()
}

export function findCohortByJoinCode(db, codeInput) {
  const normalized = normalizeJoinCode(codeInput)
  if (!normalized) return null
  const joinCodeHash = hashJoinCode(normalized)
  return db.prepare('SELECT id, name, created_at AS createdAt FROM cohorts WHERE join_code_hash=?').get(joinCodeHash) ?? null
}

export function joinLearnerToCohort(db, learner, codeInput) {
  if (typeof learner !== 'string' || learner.length < 8) throw new Error('Invalid learner')
  const cohort = findCohortByJoinCode(db, codeInput)
  if (!cohort) throw new Error('Invalid join code')
  const now = Date.now()
  db.prepare(`
    INSERT INTO learner_cohorts(learner,cohort_id,joined_at) VALUES(?,?,?)
    ON CONFLICT(learner) DO UPDATE SET cohort_id=excluded.cohort_id, joined_at=excluded.joined_at
  `).run(learner, cohort.id, now)
  return { cohortId: cohort.id, name: cohort.name, joinedAt: now }
}

export function getLearnerCohort(db, learner) {
  const row = db
    .prepare(`
      SELECT lc.cohort_id AS cohortId, lc.joined_at AS joinedAt, c.name
      FROM learner_cohorts lc
      INNER JOIN cohorts c ON c.id = lc.cohort_id
      WHERE lc.learner=?
    `)
    .get(learner)
  return row ?? null
}

export function fetchLearnerPlacementRows(db, cohortId) {
  if (cohortId === null || cohortId === undefined || cohortId === '') {
    return db.prepare('SELECT id, state FROM learners').all()
  }
  if (typeof cohortId !== 'string' || !/^[a-f0-9-]{36}$/.test(cohortId)) throw new Error('Invalid cohort id')
  return db
    .prepare(`
      SELECT l.id, l.state
      FROM learners l
      INNER JOIN learner_cohorts lc ON lc.learner = l.id
      WHERE lc.cohort_id=?
    `)
    .all(cohortId)
}

/** D1 / async database bindings for Cloudflare Worker. */
export async function listCohortsAsync(db) {
  const result = await db
    .prepare(`
      SELECT
        c.id,
        c.name,
        c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        (SELECT COUNT(*) FROM learner_cohorts lc WHERE lc.cohort_id = c.id) AS memberCount
      FROM cohorts c
      ORDER BY c.created_at DESC
    `)
    .all()
  return result.results ?? []
}

export async function createCohortAsync(db, name) {
  const label = validateCohortName(name)
  if (!label) throw new Error('Invalid cohort name')
  const id = randomUUID()
  const normalized = generateJoinCodeNormalized()
  const joinCodeHash = hashJoinCode(normalized)
  const now = Date.now()
  await db
    .prepare('INSERT INTO cohorts(id,name,join_code_hash,created_at,updated_at) VALUES(?,?,?,?,?)')
    .bind(id, label, joinCodeHash, now, now)
    .run()
  return { id, name: label, joinCode: formatJoinCode(normalized), createdAt: now }
}

export async function rotateCohortJoinCodeAsync(db, cohortId) {
  if (typeof cohortId !== 'string' || !/^[a-f0-9-]{36}$/.test(cohortId)) throw new Error('Invalid cohort id')
  const row = await db.prepare('SELECT id FROM cohorts WHERE id=?').bind(cohortId).first()
  if (!row) throw new Error('Cohort not found')
  const normalized = generateJoinCodeNormalized()
  const joinCodeHash = hashJoinCode(normalized)
  const now = Date.now()
  await db.prepare('UPDATE cohorts SET join_code_hash=?, updated_at=? WHERE id=?').bind(joinCodeHash, now, cohortId).run()
  return { cohortId, joinCode: formatJoinCode(normalized), updatedAt: now }
}

export async function joinLearnerToCohortAsync(db, learner, codeInput) {
  if (typeof learner !== 'string' || learner.length < 8) throw new Error('Invalid learner')
  const normalized = normalizeJoinCode(codeInput)
  if (!normalized) throw new Error('Invalid join code')
  const joinCodeHash = hashJoinCode(normalized)
  const cohort = await db.prepare('SELECT id, name, created_at AS createdAt FROM cohorts WHERE join_code_hash=?').bind(joinCodeHash).first()
  if (!cohort) throw new Error('Invalid join code')
  const now = Date.now()
  await db
    .prepare(`
      INSERT INTO learner_cohorts(learner,cohort_id,joined_at) VALUES(?,?,?)
      ON CONFLICT(learner) DO UPDATE SET cohort_id=excluded.cohort_id, joined_at=excluded.joined_at
    `)
    .bind(learner, cohort.id, now)
    .run()
  return { cohortId: cohort.id, name: cohort.name, joinedAt: now }
}

export async function getLearnerCohortAsync(db, learner) {
  const row = await db
    .prepare(`
      SELECT lc.cohort_id AS cohortId, lc.joined_at AS joinedAt, c.name
      FROM learner_cohorts lc
      INNER JOIN cohorts c ON c.id = lc.cohort_id
      WHERE lc.learner=?
    `)
    .bind(learner)
    .first()
  return row ?? null
}

export async function fetchLearnerPlacementRowsAsync(db, cohortId) {
  if (!cohortId) {
    const result = await db.prepare('SELECT id, state FROM learners').all()
    return result.results ?? []
  }
  if (typeof cohortId !== 'string' || !/^[a-f0-9-]{36}$/.test(cohortId)) throw new Error('Invalid cohort id')
  const result = await db
    .prepare(`
      SELECT l.id, l.state
      FROM learners l
      INNER JOIN learner_cohorts lc ON lc.learner = l.id
      WHERE lc.cohort_id=?
    `)
    .bind(cohortId)
    .all()
  return result.results ?? []
}
