import type { VideoLesson } from '@/resources/videoLessons'

export interface VideoProgress {
  lastTime?: number
  completed?: boolean
  updatedAt?: number
}

export type VideoProgressRecord = Record<string, VideoProgress>

export const PROGRESS_STORAGE_KEY = 'tcf-video-listening-progress-v1'

export const PLAYBACK_RATES: number[] = [0.75, 1, 1.25]

/**
 * Format raw seconds into mm:ss or hh:mm:ss string.
 */
export function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '00:00'
  }

  const rounded = Math.floor(totalSeconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const seconds = rounded % 60

  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, '0')
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${paddedMinutes}:${paddedSeconds}`
}

/**
 * Check if the playback should loop back to pointA during A-B repeat.
 */
export function shouldLoopAB(currentTime: number, pointA: number | null, pointB: number | null): boolean {
  if (pointA === null || pointB === null) return false
  if (!Number.isFinite(pointA) || !Number.isFinite(pointB) || !Number.isFinite(currentTime)) {
    return false
  }
  if (pointB <= pointA) return false
  return currentTime >= pointB
}

/**
 * Calculate the target time for forward/backward seeking with boundary clamping.
 */
export function calculateSeekTarget(currentTime: number, deltaSeconds: number, minTime = 0, maxTime = Number.POSITIVE_INFINITY): number {
  const safeCurrent = Number.isFinite(currentTime) ? currentTime : 0
  const safeMin = Number.isFinite(minTime) ? minTime : 0
  const safeMax = Number.isFinite(maxTime) ? maxTime : Number.POSITIVE_INFINITY

  const target = safeCurrent + deltaSeconds
  return Math.max(safeMin, Math.min(safeMax, target))
}

/**
 * Cycle through the available playback speeds: 0.75 -> 1 -> 1.25 -> 0.75
 */
export function cyclePlaybackRate(currentRate: number, rates: number[] = PLAYBACK_RATES): number {
  if (!rates || rates.length === 0) return 1
  const currentIndex = rates.indexOf(currentRate)
  if (currentIndex === -1 || currentIndex === rates.length - 1) {
    return rates[0]
  }
  return rates[currentIndex + 1]
}

export interface VideoFilterOptions {
  accent?: string
  level?: string
  query?: string
}

/**
 * Filter video lessons by accent, level, and text search.
 */
export function filterLessons(lessons: VideoLesson[], filters: VideoFilterOptions): VideoLesson[] {
  const { accent, level, query } = filters
  const normalizedQuery = query?.trim().toLowerCase()

  return lessons.filter((lesson) => {
    if (accent && accent !== '全部' && lesson.accent !== accent) {
      return false
    }

    if (level && level !== '全部' && lesson.level !== level) {
      return false
    }

    if (normalizedQuery) {
      const matchTitle = lesson.title.toLowerCase().includes(normalizedQuery)
      const matchTitleFr = lesson.titleFr.toLowerCase().includes(normalizedQuery)
      const matchChannel = lesson.channel.toLowerCase().includes(normalizedQuery)
      const matchTopics = lesson.topics.some((t) => t.toLowerCase().includes(normalizedQuery))
      const matchNotes = lesson.notes ? lesson.notes.toLowerCase().includes(normalizedQuery) : false

      if (!matchTitle && !matchTitleFr && !matchChannel && !matchTopics && !matchNotes) {
        return false
      }
    }

    return true
  })
}

function resolveStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    // In restricted sandbox or cookies disabled
  }
  return null
}

/**
 * Safely load all stored video progress records from localStorage.
 */
export function loadAllProgress(storage?: Storage): VideoProgressRecord {
  const s = resolveStorage(storage)
  if (!s) return {}

  try {
    const raw = s.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as VideoProgressRecord
    }
  } catch {
    // Fallback on corrupt JSON
  }
  return {}
}

/**
 * Safely load progress for a specific video id.
 */
export function loadVideoProgress(id: string, storage?: Storage): VideoProgress | null {
  const all = loadAllProgress(storage)
  return all[id] ?? null
}

/**
 * Safely update and persist progress for a specific video id.
 */
export function saveVideoProgress(id: string, patch: Partial<VideoProgress>, storage?: Storage): VideoProgressRecord {
  const s = resolveStorage(storage)
  const current = loadAllProgress(storage)
  const updatedEntry: VideoProgress = {
    ...current[id],
    ...patch,
    updatedAt: Date.now(),
  }
  const next: VideoProgressRecord = {
    ...current,
    [id]: updatedEntry,
  }

  if (s) {
    try {
      s.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage quota or restricted context
    }
  }

  return next
}
