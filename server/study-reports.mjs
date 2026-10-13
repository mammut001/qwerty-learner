import { randomUUID } from 'node:crypto'
import { getEchelleItem, getEchelleItemVariant, parseEchelleItemId } from './echelle-curriculum.mjs'

export { getEchelleItem, getEchelleItemVariant, parseEchelleItemId }

export function isValidCatalogItem(itemId) {
  return typeof itemId === 'string' && Boolean(parseEchelleItemId(itemId)) && Boolean(getEchelleItem(itemId))
}

export const REPORT_CATEGORIES = new Set([
  'wrong-answer',
  'language-error',
  'unclear',
  'audio',
  'other',
])

const parseJson = (value, fallback = null) => {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function sanitizeReportNote(note) {
  if (typeof note !== 'string') return ''
  return note.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

export function buildItemReportSnapshot(itemId, variant) {
  const item = getEchelleItemVariant(itemId, variant)
  if (!item) return '{}'

  const questions = Array.isArray(item.questions)
    ? item.questions.map((q) => ({
        prompt: q.prompt ?? '',
        choices: Array.isArray(q.choices) ? q.choices : [],
        answer: q.answer ?? '',
      }))
    : []

  const snapshot = {
    itemId: item.id,
    variant: typeof item.variant === 'number' ? item.variant : variant,
    kind: item.kind,
    skill: item.skill,
    text: item.text ?? null,
    audioText: item.audioText ?? null,
    questions,
  }

  const raw = JSON.stringify(snapshot)
  if (raw.length > 16384) {
    return JSON.stringify({
      ...snapshot,
      text: typeof snapshot.text === 'string' ? snapshot.text.slice(0, 2000) : null,
      audioText: typeof snapshot.audioText === 'string' ? snapshot.audioText.slice(0, 2000) : null,
      questions: questions.slice(0, 10),
    }).slice(0, 16384)
  }
  return raw
}

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000

export function saveItemReport(
  db,
  {
    id = randomUUID(),
    learner = null,
    accountId = null,
    itemId,
    variant,
    category,
    note = '',
    snapshot = '{}',
    appVersion = null,
    nowMs = Date.now(),
  },
) {
  const windowStart = nowMs - DEDUPE_WINDOW_MS
  const existing = learner
    ? db.prepare(`
        SELECT id FROM item_reports
        WHERE learner = ? AND item_id = ? AND variant = ? AND category = ? AND created_at >= ?
        ORDER BY created_at DESC LIMIT 1
      `).get(learner, itemId, variant, category, windowStart)
    : null

  if (existing?.id) {
    db.prepare(`
      UPDATE item_reports
      SET note = ?, snapshot = ?, app_version = ?, created_at = ?, status = 'open'
      WHERE id = ?
    `).run(note, snapshot, appVersion, nowMs, existing.id)
    return { id: existing.id, deduped: true, status: 'open' }
  }

  const reportId = id || randomUUID()
  db.prepare(`
    INSERT INTO item_reports (
      id, learner, account_id, item_id, variant, category, note, snapshot, app_version, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
  `).run(reportId, learner, accountId, itemId, variant, category, note, snapshot, appVersion, nowMs)

  return { id: reportId, deduped: false, status: 'open' }
}

export function listItemReports(db, { status = 'open', limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50))
  const safeOffset = Math.max(0, Number(offset) || 0)

  let rows
  if (status && status !== 'all') {
    rows = db.prepare(`
      SELECT * FROM item_reports
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(status, safeLimit, safeOffset)
  } else {
    rows = db.prepare(`
      SELECT * FROM item_reports
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(safeLimit, safeOffset)
  }

  return rows.map((r) => ({
    id: r.id,
    learner: r.learner,
    accountId: r.account_id,
    itemId: r.item_id,
    variant: Number(r.variant),
    category: r.category,
    note: r.note,
    snapshot: parseJson(r.snapshot, {}),
    appVersion: r.app_version,
    createdAt: Number(r.created_at),
    created: Number(r.created_at),
    status: r.status,
    resolvedAt: r.resolved_at ? Number(r.resolved_at) : null,
  }))
}

export function aggregateItemReports(db) {
  const groupRows = db.prepare(`
    SELECT
      item_id,
      variant,
      COUNT(*) AS total_reports,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_reports,
      MAX(created_at) AS last_reported_at
    FROM item_reports
    GROUP BY item_id, variant
    ORDER BY total_reports DESC, last_reported_at DESC
  `).all()

  const catRows = db.prepare(`
    SELECT item_id, variant, category, COUNT(*) AS cat_count
    FROM item_reports
    GROUP BY item_id, variant, category
  `).all()

  const catMap = new Map()
  for (const c of catRows) {
    const key = `${c.item_id}#${c.variant}`
    if (!catMap.has(key)) catMap.set(key, {})
    catMap.get(key)[c.category] = Number(c.cat_count)
  }

  return groupRows.map((g) => {
    const key = `${g.item_id}#${g.variant}`
    return {
      itemId: g.item_id,
      variant: Number(g.variant),
      count: Number(g.total_reports),
      openCount: Number(g.open_reports),
      lastReportedAt: Number(g.last_reported_at),
      categories: catMap.get(key) || {},
    }
  })
}

export function resolveItemReports(db, { id, ids, itemId, variant, nowMs = Date.now() }) {
  let count = 0
  if (typeof id === 'string' && id) {
    const res = db.prepare(`
      UPDATE item_reports SET status = 'resolved', resolved_at = ? WHERE id = ?
    `).run(nowMs, id)
    count += res.changes
  } else if (Array.isArray(ids) && ids.length > 0) {
    for (const reportId of ids) {
      if (typeof reportId === 'string' && reportId) {
        const res = db.prepare(`
          UPDATE item_reports SET status = 'resolved', resolved_at = ? WHERE id = ?
        `).run(nowMs, reportId)
        count += res.changes
      }
    }
  } else if (typeof itemId === 'string' && itemId) {
    if (typeof variant === 'number') {
      const res = db.prepare(`
        UPDATE item_reports SET status = 'resolved', resolved_at = ? WHERE item_id = ? AND variant = ?
      `).run(nowMs, itemId, variant)
      count += res.changes
    } else {
      const res = db.prepare(`
        UPDATE item_reports SET status = 'resolved', resolved_at = ? WHERE item_id = ?
      `).run(nowMs, itemId)
      count += res.changes
    }
  }
  return { count }
}

const quoteCsv = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

export function itemReportsCsv(reports) {
  const header = ['id', 'item_id', 'variant', 'category', 'status', 'note', 'created_at', 'resolved_at', 'app_version', 'learner', 'account_id']
  const lines = [header.join(',')]
  for (const r of reports) {
    lines.push([
      quoteCsv(r.id),
      quoteCsv(r.itemId),
      quoteCsv(r.variant),
      quoteCsv(r.category),
      quoteCsv(r.status),
      quoteCsv(r.note),
      quoteCsv(r.createdAt ? new Date(r.createdAt).toISOString() : ''),
      quoteCsv(r.resolvedAt ? new Date(r.resolvedAt).toISOString() : ''),
      quoteCsv(r.appVersion ?? ''),
      quoteCsv(r.learner ?? ''),
      quoteCsv(r.accountId ?? ''),
    ].join(','))
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}
