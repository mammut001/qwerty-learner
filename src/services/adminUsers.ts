import { studyApiBase } from './studyPlanSync'

// Intranet-only admin API. Requires the full STUDY_ADMIN_TOKEN (the recall moderator token is rejected).
const ADMIN_USERS_TOKEN_KEY = 'qwerty-admin-token'

export type AdminUserProvider = 'google' | 'apple'

export interface AdminUserItem {
  accountId: string
  createdAt: number
  lastLoginAt: number | null
  providers: AdminUserProvider[]
  emails: string[]
  displayName: string
  checkinDays: number
  lastCheckinDay: string | null
  errorBookItems: number
  masteredItems: number
  achievements: number
  activeSessions: number
}

export interface AdminUsersSummary {
  totalAccounts: number
  byProvider: { google: number; apple: number; passkeyOnly: number }
  newLast7Days: number
  newLast30Days: number
  activeLast7Days: number
  signupsByDay: Array<{ day: string; count: number }>
}

export interface AdminUsersResponse {
  ok: true
  total: number
  items: AdminUserItem[]
  summary: AdminUsersSummary
}

export interface AdminUserDailyWords {
  day: string
  words: number
  ms: number
}

export interface AdminUserDetail {
  lastActiveAt: number | null
  activeDays: number
  totalMinutes: number
  vocabulary: {
    totalWords: number
    totalTypingMs: number
    tapCount: number
    avgMsPerWord: number | null
    accuracy: number | null
    topMistakes: Array<{ word: string; dict: string; wrongCount: number; attempts: number }>
    byDict: Array<{ dict: string; count: number; chapters: number[] }>
    perDay: AdminUserDailyWords[]
  }
  grammar: {
    sessions: number
    accuracy: number | null
    recent: Array<{ topic: string; day: string | null; score: number; total: number; elapsedSeconds: number; finishedAt: number | null }>
  }
  conjugation: { attempts: number; accuracy: number | null }
  placement: {
    latest: {
      cefrLevel: string
      finishedAt: number | null
      suggestedStartWeek: number | null
      sectionAccuracy: Record<string, number | null>
    } | null
    historyCount: number
  }
  tcf: {
    count: number
    recent: Array<{
      skill: string
      correctCount: number
      questionCount: number
      scaledScore: number
      nclc: number
      finishedAt: number | null
    }>
  }
  errorBook: { total: number; mastered: number; active: number }
  checkins: { days: number; lastDay: string | null }
}

export interface AdminUserDetailResponse {
  ok: true
  detail: AdminUserDetail
}

export interface AdminUsersQuery {
  provider?: AdminUserProvider | ''
  q?: string
  limit?: number
  offset?: number
}

export class AdminUsersError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'AdminUsersError'
    this.code = code
    this.status = status
  }
}

export function getStoredAdminUsersToken(): string {
  try {
    return window.localStorage.getItem(ADMIN_USERS_TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveAdminUsersToken(token: string): void {
  try {
    if (token) window.localStorage.setItem(ADMIN_USERS_TOKEN_KEY, token)
    else window.localStorage.removeItem(ADMIN_USERS_TOKEN_KEY)
  } catch {
    // Ignore storage failures (private mode, blocked storage).
  }
}

function getApiBase(): string {
  try {
    const envUrl =
      typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_STUDY_API_BASE_URL
        : undefined
    return studyApiBase(envUrl)
  } catch {
    return studyApiBase()
  }
}

// Shared GET helper for the admin endpoints: same token handling and error mapping for every call.
async function fetchAdminJson<T>(pathWithQuery: string, adminToken: string, failureMessage: string): Promise<T> {
  const url = `${getApiBase()}${pathWithQuery}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: `Bearer ${adminToken.trim()}` },
    })
  } catch {
    throw new AdminUsersError('网络连接失败，请检查网络后重试。', 'NETWORK_ERROR', 0)
  }

  if (!response.ok) {
    if (response.status === 404) {
      const data = (await response
        .clone()
        .json()
        .catch(() => null)) as { code?: string } | null
      if (data?.code === 'ADMIN_USER_NOT_FOUND') throw new AdminUsersError('没有找到该用户。', 'ADMIN_USER_NOT_FOUND', 404)
      throw new AdminUsersError('后台仅限内网访问。请通过 SSH 通道在本机地址打开本页。', 'ADMIN_NOT_FOUND', 404)
    }
    if (response.status === 401 || response.status === 403) {
      throw new AdminUsersError('令牌不正确。', 'ADMIN_UNAUTHORIZED', response.status)
    }
    if (response.status === 503) {
      throw new AdminUsersError('服务端未配置 STUDY_ADMIN_TOKEN。', 'ADMIN_DISABLED', 503)
    }
    const data = (await response.json().catch(() => null)) as { code?: string; error?: string; message?: string } | null
    throw new AdminUsersError(data?.error || data?.message || failureMessage, data?.code || 'ADMIN_FAILED', response.status)
  }

  return (await response.json()) as T
}

export async function listAdminUsers(adminToken: string, query: AdminUsersQuery = {}): Promise<AdminUsersResponse> {
  const params = new URLSearchParams()
  if (query.provider) params.set('provider', query.provider)
  if (query.q) params.set('q', query.q)
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.offset !== undefined) params.set('offset', String(query.offset))
  const qs = params.toString()
  return fetchAdminJson<AdminUsersResponse>(`/api/study-plan/admin/users${qs ? `?${qs}` : ''}`, adminToken, '加载用户列表失败。')
}

export async function getAdminUserDetail(adminToken: string, accountId: string): Promise<AdminUserDetail> {
  const params = new URLSearchParams({ id: accountId })
  const res = await fetchAdminJson<AdminUserDetailResponse>(
    `/api/study-plan/admin/users/detail?${params.toString()}`,
    adminToken,
    '加载用户详情失败。',
  )
  return res.detail
}
