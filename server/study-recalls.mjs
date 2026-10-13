import { randomUUID } from 'node:crypto'

export const ALLOWED_SECTIONS = new Set(['speaking', 'writing'])

export const ALLOWED_TASKS_BY_SECTION = {
  speaking: new Set([2, 3]),
  writing: new Set([1, 2, 3]),
}

export function isValidSection(section) {
  return typeof section === 'string' && ALLOWED_SECTIONS.has(section)
}

export function isValidTask(section, task) {
  if (typeof task !== 'number' || !Number.isInteger(task)) return false
  const allowed = ALLOWED_TASKS_BY_SECTION[section]
  return Boolean(allowed && allowed.has(task))
}

export function isValidExamMonth(examMonth, nowMs = Date.now()) {
  if (typeof examMonth !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(examMonth)) {
    return false
  }
  const [yearStr, monthStr] = examMonth.split('-')
  const examYear = Number(yearStr)
  const examMonthNum = Number(monthStr)

  const now = new Date(nowMs)
  const curUtcYear = now.getUTCFullYear()
  const curUtcMonth = now.getUTCMonth() + 1
  const diffUtc = (curUtcYear - examYear) * 12 + (curUtcMonth - examMonthNum)

  const curLocalYear = now.getFullYear()
  const curLocalMonth = now.getMonth() + 1
  const diffLocal = (curLocalYear - examYear) * 12 + (curLocalMonth - examMonthNum)

  const validUtc = diffUtc >= 0 && diffUtc <= 24
  const validLocal = diffLocal >= 0 && diffLocal <= 24

  return validUtc || validLocal
}

export function containsUrl(text) {
  if (typeof text !== 'string') return false
  return /(?:https?:\/\/|www\.)/i.test(text)
}

export function sanitizeText(text) {
  if (typeof text !== 'string') return ''
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

export function normalizeTopic(topic) {
  if (typeof topic !== 'string') return ''
  return sanitizeText(topic)
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function buildRecallDedupeKey(section, task, examMonth, topic) {
  return `${section}:${task}:${examMonth}:${normalizeTopic(topic)}`
}

export function validateRecallInput(input, { nowMs = Date.now() } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid input payload' }
  }
  const { section, task, examMonth, city = '', topic, note = '' } = input

  if (!isValidSection(section)) {
    return { ok: false, error: 'Invalid section' }
  }
  if (!isValidTask(section, task)) {
    return { ok: false, error: 'Invalid task for section' }
  }
  if (!isValidExamMonth(examMonth, nowMs)) {
    return { ok: false, error: 'Invalid exam month' }
  }

  if (city !== undefined && city !== null && typeof city !== 'string') {
    return { ok: false, error: 'City must be a string' }
  }
  const sanitizedCity = sanitizeText(city ?? '')
  if (sanitizedCity.length > 40) {
    return { ok: false, error: 'City exceeds 40 characters' }
  }
  if (containsUrl(sanitizedCity)) {
    return { ok: false, error: 'City cannot contain URLs' }
  }

  if (typeof topic !== 'string') {
    return { ok: false, error: 'Topic must be a string' }
  }
  const sanitizedTopic = sanitizeText(topic)
  if (sanitizedTopic.length < 10 || sanitizedTopic.length > 800) {
    return { ok: false, error: 'Topic must be between 10 and 800 characters' }
  }
  if (containsUrl(sanitizedTopic)) {
    return { ok: false, error: 'Topic cannot contain URLs' }
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    return { ok: false, error: 'Note must be a string' }
  }
  const sanitizedNote = sanitizeText(note ?? '')
  if (sanitizedNote.length > 300) {
    return { ok: false, error: 'Note exceeds 300 characters' }
  }
  if (containsUrl(sanitizedNote)) {
    return { ok: false, error: 'Note cannot contain URLs' }
  }

  return {
    ok: true,
    data: {
      section,
      task,
      examMonth,
      city: sanitizedCity,
      topic: sanitizedTopic,
      note: sanitizedNote,
    },
  }
}

export function saveExamRecall(
  db,
  {
    id = randomUUID(),
    learner = null,
    accountId = null,
    section,
    task,
    examMonth,
    city = '',
    topic,
    note = '',
    nowMs = Date.now(),
  },
) {
  const sanitizedCity = sanitizeText(city ?? '')
  const sanitizedTopic = sanitizeText(topic)
  const sanitizedNote = sanitizeText(note ?? '')
  const dedupeKey = buildRecallDedupeKey(section, task, examMonth, sanitizedTopic)

  const existing = learner
    ? db.prepare(`
        SELECT id FROM exam_recalls
        WHERE learner = ? AND dedupe_key = ?
        ORDER BY created_at DESC LIMIT 1
      `).get(learner, dedupeKey)
    : null

  if (existing?.id) {
    db.prepare(`
      UPDATE exam_recalls
      SET city = ?, note = ?
      WHERE id = ?
    `).run(sanitizedCity, sanitizedNote, existing.id)
    return { id: existing.id, deduped: true, status: 'pending' }
  }

  const recallId = id || randomUUID()
  db.prepare(`
    INSERT INTO exam_recalls (
      id, learner, account_id, section, task, exam_month, city, topic, note, status, created_at, reviewed_at, dedupe_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NULL, ?)
  `).run(
    recallId,
    learner,
    accountId,
    section,
    task,
    examMonth,
    sanitizedCity,
    sanitizedTopic,
    sanitizedNote,
    nowMs,
    dedupeKey,
  )

  return { id: recallId, deduped: false, status: 'pending' }
}

export function listApprovedRecalls(
  db,
  { section, task, month, limit = 20, offset = 0 } = {},
) {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20))
  const safeOffset = Math.max(0, Number(offset) || 0)

  const conditions = ["status = 'approved'"]
  const params = []

  if (section && ALLOWED_SECTIONS.has(section)) {
    conditions.push('section = ?')
    params.push(section)
  }
  if (task !== undefined && task !== null && Number.isInteger(Number(task))) {
    conditions.push('task = ?')
    params.push(Number(task))
  }
  if (month && typeof month === 'string') {
    conditions.push('exam_month = ?')
    params.push(month)
  }

  const whereClause = conditions.join(' AND ')
  const totalRow = db.prepare(`SELECT COUNT(*) AS total FROM exam_recalls WHERE ${whereClause}`).get(...params)
  const total = Number(totalRow?.total || 0)

  const rows = db.prepare(`
    SELECT id, section, task, exam_month, city, topic, note, created_at
    FROM exam_recalls
    WHERE ${whereClause}
    ORDER BY exam_month DESC, created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, safeLimit, safeOffset)

  const items = rows.map((r) => ({
    id: r.id,
    section: r.section,
    task: Number(r.task),
    examMonth: r.exam_month,
    city: r.city,
    topic: r.topic,
    note: r.note,
    createdAt: Number(r.created_at),
  }))

  return { items, total }
}

export function listRecallsForAdmin(
  db,
  { status = 'pending', limit = 50, offset = 0 } = {},
) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50))
  const safeOffset = Math.max(0, Number(offset) || 0)

  let rows
  let total
  if (status && status !== 'all') {
    total = Number(db.prepare('SELECT COUNT(*) AS total FROM exam_recalls WHERE status = ?').get(status)?.total || 0)
    rows = db.prepare(`
      SELECT id, section, task, exam_month, city, topic, note, status, created_at, reviewed_at
      FROM exam_recalls
      WHERE status = ?
      ORDER BY exam_month DESC, created_at DESC
      LIMIT ? OFFSET ?
    `).all(status, safeLimit, safeOffset)
  } else {
    total = Number(db.prepare('SELECT COUNT(*) AS total FROM exam_recalls').get()?.total || 0)
    rows = db.prepare(`
      SELECT id, section, task, exam_month, city, topic, note, status, created_at, reviewed_at
      FROM exam_recalls
      ORDER BY exam_month DESC, created_at DESC
      LIMIT ? OFFSET ?
    `).all(safeLimit, safeOffset)
  }

  const items = rows.map((r) => ({
    id: r.id,
    section: r.section,
    task: Number(r.task),
    examMonth: r.exam_month,
    city: r.city,
    topic: r.topic,
    note: r.note,
    status: r.status,
    createdAt: Number(r.created_at),
    reviewedAt: r.reviewed_at ? Number(r.reviewed_at) : null,
  }))

  return { items, total }
}

export function reviewRecalls(db, { ids, action, nowMs = Date.now() }) {
  if (!Array.isArray(ids) || ids.length === 0) return { count: 0 }
  if (action !== 'approve' && action !== 'reject') return { count: 0 }
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  let count = 0
  const stmt = db.prepare('UPDATE exam_recalls SET status = ?, reviewed_at = ? WHERE id = ?')
  for (const id of ids) {
    if (typeof id === 'string' && id) {
      const res = stmt.run(newStatus, nowMs, id)
      count += res.changes
    }
  }
  return { count }
}

// Aliases matching prompt function names
export const listApproved = listApprovedRecalls
export const listForAdmin = listRecallsForAdmin
export const review = reviewRecalls
export const saveRecall = saveExamRecall
