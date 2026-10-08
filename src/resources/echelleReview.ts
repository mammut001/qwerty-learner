import { ECHELLE_ITEM_CATALOG, type EchelleCatalogItem } from './echelleCurriculum'
import { DAY_MS, type EchelleMemoryStatus, isLongTerm, memoryStatus } from './echelleMemory'
import type { EchelleItemRecord } from '@/services/studyPlanSync'

export type EchelleReviewEntry = { item: EchelleCatalogItem; record: EchelleItemRecord; dueAt: number }

/** Mastered items whose review is due by `until`, earliest first. */
export function echelleReviewQueue(records: Record<string, EchelleItemRecord>, until: number): EchelleReviewEntry[] {
  return Object.entries(records)
    .filter(([id, record]) => ECHELLE_ITEM_CATALOG[id] && record.mastered && typeof record.dueAt === 'number' && record.dueAt <= until)
    .map(([id, record]) => ({ item: ECHELLE_ITEM_CATALOG[id], record, dueAt: record.dueAt as number }))
    .sort((a, b) => a.dueAt - b.dueAt || a.item.level - b.item.level)
}

export function countDue(records: Record<string, EchelleItemRecord>, ids: string[], now: number) {
  return ids.filter((id) => memoryStatus(records[id], now) === 'due').length
}

export function formatDue(dueAt: number, now: number) {
  const days = Math.ceil((dueAt - now) / DAY_MS)
  if (days <= 0) return '今天复习'
  if (days === 1) return '明天复习'
  return `${days} 天后复习`
}

export function memoryLabel(record: EchelleItemRecord | undefined, now: number): { status: EchelleMemoryStatus; text: string } {
  const status = memoryStatus(record, now)
  if (!record) return { status, text: '学习' }
  if (status === 'learning') return { status, text: record.lapses ? `已遗忘 · 重新学习` : `未达标 · 已试 ${record.attempts} 次` }
  if (status === 'due') return { status, text: '待复习' }
  const due = typeof record.dueAt === 'number' ? formatDue(record.dueAt, now) : ''
  return { status, text: `${isLongTerm(record) ? '长期记忆' : '已掌握'}${due ? ` · ${due}` : ''}` }
}
