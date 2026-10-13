import { isGuestMode } from './guestMode'
import { studyApiBase } from './studyPlanSync'
import { trackAnalyticsEvent } from '../utils/analytics'

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)

export type ReportCategory = 'wrong-answer' | 'language-error' | 'unclear' | 'audio' | 'other'

export interface ReportItemInput {
  itemId: string
  variant: number
  category: ReportCategory
  note?: string
}

export interface ReportItemResponse {
  ok: boolean
  id?: string
  status?: string
  deduped?: boolean
}

export class ReportItemError extends Error {
  code: string

  constructor(message: string, code = 'REPORT_FAILED') {
    super(message)
    this.name = 'ReportItemError'
    this.code = code
  }
}

// In-memory set of item+variant combinations reported in the current browser session.
const sessionReportedItems = new Set<string>()

export function isItemVariantReportedInSession(itemId: string, variant: number): boolean {
  return sessionReportedItems.has(`${itemId}#${variant}`)
}

export function markItemVariantReportedInSession(itemId: string, variant: number): void {
  sessionReportedItems.add(`${itemId}#${variant}`)
}

export async function reportEchelleItem(input: ReportItemInput): Promise<ReportItemResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new ReportItemError('网络未连接，请联网后再报告问题', 'OFFLINE')
  }

  if (isGuestMode()) {
    throw new ReportItemError('当前处于访客模式，无法提交问题报告', 'GUEST_MODE')
  }

  const { itemId, variant, category, note } = input
  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : ''

  try {
    const response = await fetch(`${API_BASE}/api/study-plan/reports`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        variant,
        category,
        note: cleanNote,
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { code?: string; error?: string } | null
      const code = data?.code || ''
      if (response.status === 429 || code === 'REPORT_RATE_LIMITED') {
        throw new ReportItemError('提交过于频繁（每小时限 20 次），请稍后再试', 'REPORT_RATE_LIMITED')
      }
      if (response.status === 401) {
        throw new ReportItemError('学习会话无效或未登录，请刷新页面后再试', 'UNAUTHORIZED')
      }
      if (code === 'NOTE_TOO_LONG') {
        throw new ReportItemError('问题描述不能超过 500 字', 'NOTE_TOO_LONG')
      }
      if (code === 'ITEM_NOT_FOUND' || code === 'VARIANT_INVALID' || code === 'CATEGORY_INVALID') {
        throw new ReportItemError('题目信息不正确，无法提交报告', code)
      }
      throw new ReportItemError(data?.error || '提交失败，请稍后重试', code || 'REPORT_FAILED')
    }

    const result = (await response.json()) as ReportItemResponse
    markItemVariantReportedInSession(itemId, variant)
    trackAnalyticsEvent('issue_report')
    return result
  } catch (err) {
    if (err instanceof ReportItemError) throw err
    throw new ReportItemError('网络连接失败，请检查网络后重试', 'NETWORK_ERROR')
  }
}
