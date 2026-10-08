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
