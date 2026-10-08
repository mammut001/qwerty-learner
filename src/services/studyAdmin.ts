import { studyApiBase } from '@/services/studyPlanSync'

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)
const ADMIN_TOKEN_KEY = 'qwerty-study-admin-token-v1'

export type PlacementCohortReport = {
  generatedAt: string
  cohortId: string | null
  totalLearners: number
  placementCompleted: number
  placementPending: number
  placementRate: number
  byLevel: Record<string, number>
  cohortSectionAccuracy: Record<string, number | null>
  recent: Array<{
    learnerRef: string
    cefrLevel: string
    finishedAt: number
    suggestedStartWeek: number | null
    weakestSection: string | null
    sectionAccuracy: Record<string, number | null>
  }>
}

export type AdminCohortSummary = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  memberCount: number
}

export type AdminCohortCreated = {
  id: string
  name: string
  joinCode: string
  createdAt: number
}

function adminHeaders(adminToken: string, json = false) {
  const headers: Record<string, string> = { Authorization: `Bearer ${adminToken}` }
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

export function getStoredAdminToken() {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveAdminToken(token: string) {
  try {
    if (token) window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
    else window.sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export async function loadAdminConfig(): Promise<{ enabled: boolean }> {
  const response = await fetch(`${API_BASE}/api/study-plan/admin/config`, { credentials: 'include' })
  if (!response.ok) throw new Error('ADMIN_CONFIG_FAILED')
  return (await response.json()) as { enabled: boolean }
}

export async function listAdminCohorts(adminToken: string): Promise<AdminCohortSummary[]> {
  const response = await fetch(`${API_BASE}/api/study-plan/admin/cohorts`, {
    credentials: 'include',
    headers: adminHeaders(adminToken),
  })
  if (response.status === 401) throw new Error('ADMIN_UNAUTHORIZED')
  if (response.status === 503) throw new Error('ADMIN_DISABLED')
  if (!response.ok) throw new Error('ADMIN_COHORTS_FAILED')
  const payload = (await response.json()) as { cohorts: AdminCohortSummary[] }
  return payload.cohorts
}

export async function createAdminCohort(adminToken: string, name: string): Promise<AdminCohortCreated> {
  const response = await fetch(`${API_BASE}/api/study-plan/admin/cohorts`, {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(adminToken, true),
    body: JSON.stringify({ name }),
  })
  if (response.status === 401) throw new Error('ADMIN_UNAUTHORIZED')
  if (!response.ok) throw new Error('ADMIN_COHORT_CREATE_FAILED')
  const payload = (await response.json()) as { cohort: AdminCohortCreated }
  return payload.cohort
}

export async function rotateAdminCohortJoinCode(
  adminToken: string,
  cohortId: string,
): Promise<{ cohortId: string; joinCode: string; updatedAt: number }> {
  const response = await fetch(`${API_BASE}/api/study-plan/admin/cohorts/rotate`, {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(adminToken, true),
    body: JSON.stringify({ cohortId }),
  })
  if (response.status === 401) throw new Error('ADMIN_UNAUTHORIZED')
  if (!response.ok) throw new Error('ADMIN_COHORT_ROTATE_FAILED')
  const payload = (await response.json()) as { cohort: { cohortId: string; joinCode: string; updatedAt: number } }
  return payload.cohort
}

export async function loadPlacementCohortReport(adminToken: string, cohortId?: string | null): Promise<PlacementCohortReport> {
  const query = cohortId ? `?cohortId=${encodeURIComponent(cohortId)}` : ''
  const response = await fetch(`${API_BASE}/api/study-plan/admin/placement-cohort${query}`, {
    credentials: 'include',
    headers: adminHeaders(adminToken),
  })
  if (response.status === 401) throw new Error('ADMIN_UNAUTHORIZED')
  if (response.status === 503) throw new Error('ADMIN_DISABLED')
  if (!response.ok) throw new Error('ADMIN_COHORT_FAILED')
  const payload = (await response.json()) as { report: PlacementCohortReport }
  return payload.report
}

export async function downloadPlacementCohortCsv(adminToken: string, cohortId?: string | null) {
  const query = cohortId ? `?cohortId=${encodeURIComponent(cohortId)}` : ''
  const response = await fetch(`${API_BASE}/api/study-plan/admin/placement-cohort.csv${query}`, {
    credentials: 'include',
    headers: adminHeaders(adminToken),
  })
  if (!response.ok) throw new Error('ADMIN_CSV_FAILED')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'placement-cohort.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
