import * as raw from '../../server/echelle-memory.mjs'

export type EchelleMemoryFields = {
  mastered: boolean
  stage: number
  dueAt: number | null
  lastPassedAt: number | null
  lapses: number
}

export type EchelleMemoryStatus = 'new' | 'learning' | 'due' | 'mastered'

type MemoryRecord = Partial<EchelleMemoryFields> & { mastered: boolean; updatedAt?: number }

export const DAY_MS = raw.DAY_MS as number
export const REVIEW_INTERVAL_DAYS = raw.REVIEW_INTERVAL_DAYS as readonly number[]
export const LONG_TERM_STAGE = raw.LONG_TERM_STAGE as number

export const nextMemory = raw.nextMemory as (previous: MemoryRecord | undefined, passed: boolean, at: number) => EchelleMemoryFields

export const memoryStatus = raw.memoryStatus as (record: MemoryRecord | undefined, now: number) => EchelleMemoryStatus

export const estimateRetention = raw.estimateRetention as (record: MemoryRecord | undefined, now: number) => number

export const isLongTerm = raw.isLongTerm as (record: MemoryRecord | undefined) => boolean

export const intervalDaysForStage = raw.intervalDaysForStage as (stage: number) => number
