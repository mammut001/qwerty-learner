import { weeklyStudyPlan } from '../resources/studyPlan'
import { addStudyMinutes, flushStudyProgress } from '../services/studyPlanSync'

export function getLocalStudyDate(timestampMs = Date.now()): string {
  const date = new Date(timestampMs)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Resolves the studyDate and studyTask to credit for listening practice.
 * 1. If studyDate is provided in searchParams (YYYY-MM-DD), use it; otherwise default to today.
 * 2. If studyTask is provided in searchParams (valid task id), use it.
 * 3. Otherwise, check if the weekly study plan has a scheduled task of kind 'listening'
 *    for that day's weekday (e.g. mon-listening, wed-listening, fri-listening, sat-listening).
 * 4. If none exists (e.g. Tue, Thu, Sun), use defaultTaskId ('intensive-listening' or 'video-listening')
 *    which matches the server validator /^[a-z][a-z0-9-]{0,79}$/.
 */
export function resolveListeningStudyTask(
  searchParams: URLSearchParams,
  defaultTaskId: 'intensive-listening' | 'video-listening',
  now = Date.now(),
): { dateKey: string; taskId: string } {
  const requestedDate = searchParams.get('studyDate')
  const requestedTask = searchParams.get('studyTask')

  const dateKey = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : getLocalStudyDate(now)

  if (requestedTask && /^[a-z][a-z0-9-]{0,79}$/.test(requestedTask)) {
    return { dateKey, taskId: requestedTask }
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const weekday = new Date(year, month - 1, day, 12).getDay()
  const scheduledTask = weeklyStudyPlan.find((d) => d.weekday === weekday)?.tasks.find((t) => t.kind === 'listening')

  if (scheduledTask) {
    return { dateKey, taskId: scheduledTask.id }
  }

  return { dateKey, taskId: defaultTaskId }
}

/**
 * Credits listening minutes to study plan via addStudyMinutes and triggers background flush.
 */
export function recordListeningMinutes(dateKey: string, taskId: string, minutes: number): void {
  if (minutes <= 0) return
  try {
    addStudyMinutes(dateKey, taskId, minutes)
    void flushStudyProgress().catch(() => undefined)
  } catch {
    // Storage or sync errors must never crash listening audio or video playback
  }
}

export interface ListeningAccumulatorOptions {
  onFlush: (minutes: number) => void
  now?: () => number
  pauseThresholdMs?: number // default 60_000 (60s)
  flushIntervalMs?: number // default 300_000 (5min)
}

export class ListeningAccumulator {
  private isPlaying = false
  private playStartedAt: number | null = null
  private accumulatedMs = 0
  private totalPlayingMs = 0
  private pausedAt: number | null = null
  private pauseTimer: ReturnType<typeof setTimeout> | null = null
  private periodicTimer: ReturnType<typeof setTimeout> | null = null
  private timeOffset = 0

  private readonly onFlush: (minutes: number) => void
  private readonly customNow?: () => number
  private readonly pauseThresholdMs: number
  private readonly flushIntervalMs: number

  constructor(options: ListeningAccumulatorOptions) {
    this.onFlush = options.onFlush
    this.customNow = options.now
    this.pauseThresholdMs = options.pauseThresholdMs ?? 60_000
    this.flushIntervalMs = options.flushIntervalMs ?? 300_000
  }

  private getCurrentTime(): number {
    return (this.customNow ? this.customNow() : Date.now()) + this.timeOffset
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  public getAccumulatedSeconds(): number {
    let currentMs = this.accumulatedMs
    if (this.isPlaying && this.playStartedAt !== null) {
      currentMs += Math.max(0, this.getCurrentTime() - this.playStartedAt)
    }
    return Math.floor(currentMs / 1000)
  }

  public getTotalPlaybackSeconds(): number {
    let currentMs = this.totalPlayingMs
    if (this.isPlaying && this.playStartedAt !== null) {
      currentMs += Math.max(0, this.getCurrentTime() - this.playStartedAt)
    }
    return Math.floor(currentMs / 1000)
  }

  public onPlay(customNow?: number): void {
    const now = customNow ?? this.getCurrentTime()

    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer)
      this.pauseTimer = null
    }

    if (this.isPlaying) return

    this.isPlaying = true
    this.playStartedAt = now
    this.pausedAt = null

    this.schedulePeriodicTimer()
  }

  public onPause(customNow?: number): void {
    const now = customNow ?? this.getCurrentTime()

    if (this.periodicTimer) {
      clearTimeout(this.periodicTimer)
      this.periodicTimer = null
    }

    if (!this.isPlaying) return

    if (this.playStartedAt !== null) {
      const elapsed = Math.max(0, now - this.playStartedAt)
      this.accumulatedMs += elapsed
      this.totalPlayingMs += elapsed
      this.playStartedAt = null
    }

    this.isPlaying = false
    this.pausedAt = now

    if (this.accumulatedMs > 0) {
      this.schedulePauseTimer()
    }
  }

  public onLeave(customNow?: number): number {
    const now = customNow ?? this.getCurrentTime()

    if (this.isPlaying) {
      this.onPause(now)
    }

    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer)
      this.pauseTimer = null
    }
    if (this.periodicTimer) {
      clearTimeout(this.periodicTimer)
      this.periodicTimer = null
    }

    return this.flushFinal()
  }

  public advanceTime(ms: number): void {
    this.timeOffset += ms
    this.tick()
  }

  public tick(customNow?: number): void {
    const now = customNow ?? this.getCurrentTime()

    if (this.isPlaying && this.playStartedAt !== null) {
      const elapsedSinceStart = Math.max(0, now - this.playStartedAt)
      const potentialMs = this.accumulatedMs + elapsedSinceStart
      if (potentialMs >= this.flushIntervalMs) {
        this.triggerPeriodicFlush(now)
      }
    } else if (!this.isPlaying && this.pausedAt !== null && this.accumulatedMs > 0) {
      if (now - this.pausedAt >= this.pauseThresholdMs) {
        this.triggerPauseTimeout()
      }
    }
  }

  private schedulePauseTimer(): void {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer)
    }
    this.pauseTimer = setTimeout(() => {
      this.triggerPauseTimeout()
    }, this.pauseThresholdMs)
  }

  private triggerPauseTimeout(): void {
    if (this.isPlaying) return
    if (this.accumulatedMs > 0) {
      this.flushFinal()
    }
  }

  private schedulePeriodicTimer(): void {
    if (this.periodicTimer) {
      clearTimeout(this.periodicTimer)
      this.periodicTimer = null
    }
    if (!this.isPlaying) return

    const remainingMs = Math.max(1, this.flushIntervalMs - (this.accumulatedMs % this.flushIntervalMs))
    this.periodicTimer = setTimeout(() => {
      this.triggerPeriodicFlush()
    }, remainingMs)
  }

  private triggerPeriodicFlush(customNow?: number): void {
    if (!this.isPlaying) return
    const now = customNow ?? this.getCurrentTime()

    if (this.playStartedAt !== null) {
      const elapsed = Math.max(0, now - this.playStartedAt)
      this.accumulatedMs += elapsed
      this.totalPlayingMs += elapsed
      this.playStartedAt = now
    }

    const minutesToFlush = Math.floor(this.accumulatedMs / 60_000)
    if (minutesToFlush > 0) {
      this.accumulatedMs -= minutesToFlush * 60_000
      this.onFlush(minutesToFlush)
    }

    this.schedulePeriodicTimer()
  }

  private flushFinal(): number {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer)
      this.pauseTimer = null
    }
    if (this.accumulatedMs <= 0) return 0

    const elapsedSeconds = this.accumulatedMs / 1000
    const minutes = Math.max(1, Math.ceil(elapsedSeconds / 60))
    this.accumulatedMs = 0
    this.onFlush(minutes)
    return minutes
  }

  public destroy(): void {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer)
      this.pauseTimer = null
    }
    if (this.periodicTimer) {
      clearTimeout(this.periodicTimer)
      this.periodicTimer = null
    }
  }
}
