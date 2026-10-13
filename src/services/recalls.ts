import { studyApiBase } from './studyPlanSync'

export type RecallSection = 'speaking' | 'writing'
export type RecallStatus = 'pending' | 'approved' | 'rejected'

export interface RecallItem {
  id: string
  section: RecallSection
  task: number
  examMonth: string
  city?: string
  topic: string
  note?: string
  createdAt: number
}

export interface AdminRecallItem extends RecallItem {
  status: RecallStatus
  reviewedAt: number | null
}

export interface RecallSubmitInput {
  section: RecallSection
  task: number
  examMonth: string
  city?: string
  topic: string
  note?: string
}

export interface RecallListResponse {
  ok: boolean
  items: RecallItem[]
  total: number
}

export interface AdminRecallListResponse {
  ok: boolean
  items: AdminRecallItem[]
  total: number
}

export interface RecallSubmitResponse {
  ok: boolean
  id: string
  status: 'pending'
}

export interface RecallReviewResponse {
  ok: boolean
  count: number
}

export interface RecallValidationErrors {
  section?: string
  task?: string
  examMonth?: string
  city?: string
  topic?: string
  note?: string
}

export interface RecallValidationResult {
  valid: boolean
  errors: RecallValidationErrors
}

export class RecallError extends Error {
  code: string
  status?: number
  retryAfterSeconds?: number

  constructor(message: string, code = 'RECALL_FAILED', status?: number, retryAfterSeconds?: number) {
    super(message)
    this.name = 'RecallError'
    this.code = code
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export const ALLOWED_SECTIONS = ['speaking', 'writing'] as const

export const ALLOWED_TASKS_BY_SECTION: Record<RecallSection, number[]> = {
  speaking: [2, 3],
  writing: [1, 2, 3],
}

export function isValidSection(section: unknown): section is RecallSection {
  return typeof section === 'string' && (section === 'speaking' || section === 'writing')
}

export function isValidTask(section: unknown, task: unknown): boolean {
  if (typeof task !== 'number' || !Number.isInteger(task)) return false
  if (!isValidSection(section)) return false
  return ALLOWED_TASKS_BY_SECTION[section].includes(task)
}

export function getTaskOptions(section?: string): number[] {
  if (section === 'speaking') return [2, 3]
  if (section === 'writing') return [1, 2, 3]
  return []
}

export function getSectionLabel(section: string): string {
  if (section === 'speaking') return '口语'
  if (section === 'writing') return '写作'
  return section
}

export function getTaskLabel(task: number): string {
  return `任务 ${task}`
}

export function formatRecallLabel(section: string, task?: number): string {
  const s = getSectionLabel(section)
  if (task !== undefined && task !== null && Number.isInteger(Number(task))) {
    return `${s} 任务 ${task}`
  }
  return s
}

export const getRecallLabel = formatRecallLabel

export function containsUrl(text: string): boolean {
  if (typeof text !== 'string') return false
  return /(?:https?:\/\/|www\.)/i.test(text)
}

export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  let sanitized = ''
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code === 0x7f) continue
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) continue
    sanitized += text[i]
  }
  return sanitized.trim()
}

export function isValidExamMonth(examMonth: unknown, now: Date | number = new Date()): boolean {
  if (typeof examMonth !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(examMonth)) {
    return false
  }
  const [yearStr, monthStr] = examMonth.split('-')
  const examYear = Number(yearStr)
  const examMonthNum = Number(monthStr)

  const date = typeof now === 'number' ? new Date(now) : new Date(now.getTime())
  const curUtcYear = date.getUTCFullYear()
  const curUtcMonth = date.getUTCMonth() + 1
  const diffUtc = (curUtcYear - examYear) * 12 + (curUtcMonth - examMonthNum)

  const curLocalYear = date.getFullYear()
  const curLocalMonth = date.getMonth() + 1
  const diffLocal = (curLocalYear - examYear) * 12 + (curLocalMonth - examMonthNum)

  const validUtc = diffUtc >= 0 && diffUtc <= 24
  const validLocal = diffLocal >= 0 && diffLocal <= 24

  return validUtc || validLocal
}

export function listSelectableMonths(now: Date | number = new Date()): string[] {
  const date = typeof now === 'number' ? new Date(now) : new Date(now.getTime())
  const year = date.getFullYear()
  const month = date.getMonth()
  const months: string[] = []

  for (let i = 0; i < 25; i++) {
    const d = new Date(year, month - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${y}-${m}`)
  }

  return months
}

export function validateRecallInput(
  input: {
    section?: unknown
    task?: unknown
    examMonth?: unknown
    city?: unknown
    topic?: unknown
    note?: unknown
  },
  now: Date | number = new Date(),
): RecallValidationResult {
  const errors: RecallValidationErrors = {}
  const safe = input && typeof input === 'object' ? input : {}

  if (!isValidSection(safe.section)) {
    errors.section = '请选择考试项目（口语或写作）'
  }

  if (!isValidTask(safe.section, safe.task)) {
    errors.task = '请选择有效的任务编号'
  }

  if (!isValidExamMonth(safe.examMonth, now)) {
    errors.examMonth = '请选择有效的考试月份（近 24 个月内）'
  }

  if (safe.city !== undefined && safe.city !== null && safe.city !== '') {
    if (typeof safe.city !== 'string') {
      errors.city = '考试城市格式不正确'
    } else {
      const sanitized = sanitizeText(safe.city)
      if (sanitized.length > 40) {
        errors.city = '考试城市不能超过 40 个字'
      } else if (containsUrl(sanitized)) {
        errors.city = '考试城市不能包含链接'
      }
    }
  }

  if (typeof safe.topic !== 'string') {
    errors.topic = '请输入题目描述（10–800 字）'
  } else {
    const sanitized = sanitizeText(safe.topic)
    if (sanitized.length < 10) {
      errors.topic = '题目描述至少需要 10 个字'
    } else if (sanitized.length > 800) {
      errors.topic = '题目描述不能超过 800 个字'
    } else if (containsUrl(sanitized)) {
      errors.topic = '题目描述不能包含链接'
    }
  }

  if (safe.note !== undefined && safe.note !== null && safe.note !== '') {
    if (typeof safe.note !== 'string') {
      errors.note = '补充说明格式不正确'
    } else {
      const sanitized = sanitizeText(safe.note)
      if (sanitized.length > 300) {
        errors.note = '补充说明不能超过 300 个字'
      } else if (containsUrl(sanitized)) {
        errors.note = '补充说明不能包含链接'
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

const ADMIN_RECALLS_TOKEN_KEY = 'qwerty-recalls-admin-token-v1'

export function getStoredRecallsAdminToken(): string {
  try {
    return window.sessionStorage.getItem(ADMIN_RECALLS_TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveRecallsAdminToken(token: string): void {
  try {
    if (token) window.sessionStorage.setItem(ADMIN_RECALLS_TOKEN_KEY, token)
    else window.sessionStorage.removeItem(ADMIN_RECALLS_TOKEN_KEY)
  } catch {
    // Ignore storage failures.
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

export async function listRecalls(params?: {
  section?: RecallSection
  task?: number
  month?: string
  limit?: number
  offset?: number
}): Promise<RecallListResponse> {
  const query = new URLSearchParams()
  if (params?.section) query.set('section', params.section)
  if (params?.task !== undefined && params?.task !== null) query.set('task', String(params.task))
  if (params?.month) query.set('month', params.month)
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  if (params?.offset !== undefined) query.set('offset', String(params.offset))
  const qs = query.toString()
  const url = `${getApiBase()}/api/study-plan/recalls${qs ? `?${qs}` : ''}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { code?: string; error?: string } | null
      throw new RecallError(data?.error || '加载机经失败，请稍后重试', data?.code || 'FETCH_FAILED', response.status)
    }

    return (await response.json()) as RecallListResponse
  } catch (err) {
    if (err instanceof RecallError) throw err
    throw new RecallError('网络连接失败，请检查网络后重试', 'NETWORK_ERROR')
  }
}

export async function submitRecall(input: RecallSubmitInput): Promise<RecallSubmitResponse> {
  const url = `${getApiBase()}/api/study-plan/recalls`
  const cleanCity = typeof input.city === 'string' ? sanitizeText(input.city) : undefined
  const cleanNote = typeof input.note === 'string' ? sanitizeText(input.note) : undefined
  const cleanTopic = sanitizeText(input.topic)

  const payload: Record<string, unknown> = {
    section: input.section,
    task: input.task,
    examMonth: input.examMonth,
    topic: cleanTopic,
  }
  if (cleanCity) payload.city = cleanCity
  if (cleanNote) payload.note = cleanNote

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        code?: string
        error?: string
        retryAfterSeconds?: number
      } | null
      const code = data?.code || ''
      const status = response.status

      if (status === 429 || code === 'RECALL_RATE_LIMITED') {
        throw new RecallError('提交太频繁了，请稍后再试。', 'RECALL_RATE_LIMITED', 429, data?.retryAfterSeconds)
      }
      if (status === 503 || code === 'RECALL_QUEUE_FULL') {
        throw new RecallError('投稿暂时关闭，请过一段时间再来。', 'RECALL_QUEUE_FULL', 503)
      }
      if (status === 413 || code === 'REQUEST_TOO_LARGE') {
        throw new RecallError('内容不符合要求，请检查后重试（不能包含链接，题目 10–800 字）。', 'REQUEST_TOO_LARGE', 413)
      }
      if (status === 400 || code === 'RECALL_INVALID') {
        throw new RecallError(
          '内容不符合要求，请检查后重试（不能包含链接，题目 10–800 字）。',
          'RECALL_INVALID',
          400,
        )
      }
      throw new RecallError('提交失败，请检查网络后重试。', code || 'SUBMIT_FAILED', status)
    }

    return (await response.json()) as RecallSubmitResponse
  } catch (err) {
    if (err instanceof RecallError) throw err
    throw new RecallError('提交失败，请检查网络后重试。', 'NETWORK_ERROR')
  }
}

export async function listAdminRecalls(
  adminToken: string,
  params?: {
    status?: RecallStatus | 'all'
    limit?: number
    offset?: number
  },
): Promise<AdminRecallListResponse> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  if (params?.offset !== undefined) query.set('offset', String(params.offset))
  const qs = query.toString()
  const url = `${getApiBase()}/api/study-plan/admin/recalls${qs ? `?${qs}` : ''}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${adminToken.trim()}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new RecallError('审核后台仅限内网访问。请通过 SSH 通道在本机地址打开本页。', 'ADMIN_NOT_FOUND', 404)
      }
      if (response.status === 401 || response.status === 403) {
        throw new RecallError('令牌不正确。', 'ADMIN_UNAUTHORIZED', response.status)
      }
      const data = (await response.json().catch(() => null)) as { code?: string; error?: string } | null
      throw new RecallError(data?.error || '加载机经列表失败。', data?.code || 'ADMIN_FAILED', response.status)
    }

    return (await response.json()) as AdminRecallListResponse
  } catch (err) {
    if (err instanceof RecallError) throw err
    throw new RecallError('网络连接失败，请检查网络后重试。', 'NETWORK_ERROR')
  }
}

export async function reviewRecalls(
  adminToken: string,
  input: {
    ids: string[]
    action: 'approve' | 'reject'
  },
): Promise<RecallReviewResponse> {
  const url = `${getApiBase()}/api/study-plan/admin/recalls/review`

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken.trim()}`,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new RecallError('审核后台仅限内网访问。请通过 SSH 通道在本机地址打开本页。', 'ADMIN_NOT_FOUND', 404)
      }
      if (response.status === 401 || response.status === 403) {
        throw new RecallError('令牌不正确。', 'ADMIN_UNAUTHORIZED', response.status)
      }
      const data = (await response.json().catch(() => null)) as { code?: string; error?: string } | null
      throw new RecallError(data?.error || '审核操作失败。', data?.code || 'ADMIN_FAILED', response.status)
    }

    return (await response.json()) as RecallReviewResponse
  } catch (err) {
    if (err instanceof RecallError) throw err
    throw new RecallError('操作失败，请检查网络后重试。', 'NETWORK_ERROR')
  }
}
