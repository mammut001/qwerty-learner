import { flushStudyProgress, recordFocusSession } from './studyPlanSync'

export const FOCUS_IDLE_MS = 2 * 60 * 1000
const KEY = 'qwerty-fr-focus-timer-v1'
const EVENT = 'qwerty-focus-timer-change'

export type FocusPauseReason = 'manual' | 'hidden' | 'idle'
export type FocusTimerStatus = 'running' | 'paused' | 'finished'
export type FocusTimerSnapshot = {
  version: 1
  day: string
  taskId: string
  title: string
  targetMinutes: number
  activeMs: number
  remainingMs: number
  status: FocusTimerStatus
  lastTickAt: number | null
  lastActivityAt: number
  pauseReason: FocusPauseReason | null
  committed: boolean
}

export type FocusTimerStart = {
  day: string
  taskId: string
  title: string
  targetMinutes: number
}

const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day)

const notify = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT))
}

const persist = (snapshot: FocusTimerSnapshot | null, announce = true) => {
  if (typeof localStorage === 'undefined') return
  if (snapshot) localStorage.setItem(KEY, JSON.stringify(snapshot))
  else localStorage.removeItem(KEY)
  if (announce) notify()
}

const parseStored = (value: string | null): FocusTimerSnapshot | null => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<FocusTimerSnapshot>
    if (
      parsed.version !== 1 ||
      !validDay(String(parsed.day ?? '')) ||
      typeof parsed.taskId !== 'string' ||
      !parsed.taskId ||
      typeof parsed.title !== 'string' ||
      !parsed.title ||
      !Number.isInteger(parsed.targetMinutes) ||
      (parsed.targetMinutes ?? 0) < 1 ||
      (parsed.targetMinutes ?? 0) > 240 ||
      typeof parsed.activeMs !== 'number' ||
      typeof parsed.remainingMs !== 'number' ||
      !['running', 'paused', 'finished'].includes(String(parsed.status)) ||
      typeof parsed.lastActivityAt !== 'number'
    ) return null
    return parsed as FocusTimerSnapshot
  } catch {
    return null
  }
}

export function advanceFocusTimer(snapshot: FocusTimerSnapshot, now: number): FocusTimerSnapshot {
  if (snapshot.status !== 'running' || snapshot.lastTickAt === null) return snapshot
  const idleAt = snapshot.lastActivityAt + FOCUS_IDLE_MS
  const effectiveNow = Math.min(now, idleAt)
  const elapsed = Math.max(0, effectiveNow - snapshot.lastTickAt)
  const counted = Math.min(snapshot.remainingMs, elapsed)
  const remainingMs = Math.max(0, snapshot.remainingMs - counted)
  const activeMs = snapshot.activeMs + counted

  if (remainingMs === 0) {
    return {
      ...snapshot,
      activeMs,
      remainingMs: 0,
      status: 'finished',
      lastTickAt: null,
      pauseReason: null,
    }
  }
  if (now >= idleAt) {
    return {
      ...snapshot,
      activeMs,
      remainingMs,
      status: 'paused',
      lastTickAt: null,
      pauseReason: 'idle',
    }
  }
  return { ...snapshot, activeMs, remainingMs, lastTickAt: now }
}

export function focusTimerRecordedMinutes(snapshot: FocusTimerSnapshot) {
  return Math.min(snapshot.targetMinutes, Math.floor(snapshot.activeMs / 60000))
}

export function getFocusTimerSnapshot(now = Date.now()): FocusTimerSnapshot | null {
  if (typeof localStorage === 'undefined') return null
  const stored = parseStored(localStorage.getItem(KEY))
  if (!stored) return null
  const advanced = advanceFocusTimer(stored, now)
  if (JSON.stringify(advanced) !== JSON.stringify(stored)) persist(advanced, false)
  return advanced
}

export function startFocusTimer(input: FocusTimerStart, now = Date.now()) {
  if (!validDay(input.day)) throw new Error('INVALID_FOCUS_DAY')
  if (!input.taskId.trim() || !input.title.trim()) throw new Error('INVALID_FOCUS_TASK')
  if (!Number.isInteger(input.targetMinutes) || input.targetMinutes < 1 || input.targetMinutes > 240)
    throw new Error('INVALID_FOCUS_MINUTES')
  const snapshot: FocusTimerSnapshot = {
    version: 1,
    day: input.day,
    taskId: input.taskId,
    title: input.title.slice(0, 160),
    targetMinutes: input.targetMinutes,
    activeMs: 0,
    remainingMs: input.targetMinutes * 60000,
    status: 'running',
    lastTickAt: now,
    lastActivityAt: now,
    pauseReason: null,
    committed: false,
  }
  persist(snapshot)
  return snapshot
}

export function noteFocusTimerActivity(now = Date.now()) {
  const snapshot = getFocusTimerSnapshot(now)
  if (!snapshot || snapshot.status !== 'running') return snapshot
  const next = { ...snapshot, lastActivityAt: now, lastTickAt: now }
  persist(next)
  return next
}

export function pauseFocusTimer(reason: FocusPauseReason = 'manual', now = Date.now()) {
  const snapshot = getFocusTimerSnapshot(now)
  if (!snapshot || snapshot.status !== 'running') return snapshot
  const next: FocusTimerSnapshot = {
    ...snapshot,
    status: 'paused',
    lastTickAt: null,
    pauseReason: reason,
  }
  persist(next)
  return next
}

export function resumeFocusTimer(now = Date.now()) {
  const snapshot = getFocusTimerSnapshot(now)
  if (!snapshot || snapshot.status !== 'paused') return snapshot
  const next: FocusTimerSnapshot = {
    ...snapshot,
    status: 'running',
    lastTickAt: now,
    lastActivityAt: now,
    pauseReason: null,
  }
  persist(next)
  return next
}

async function commitFocusTimerResult(snapshot: FocusTimerSnapshot) {
  if (snapshot.status !== 'finished' || snapshot.committed) return
  const committed = { ...snapshot, committed: true }
  persist(committed)
  const minutes = focusTimerRecordedMinutes(committed)
  if (minutes > 0) {
    try {
      recordFocusSession({
        day: committed.day,
        taskId: committed.taskId,
        title: committed.title,
        minutes,
        endedAt: Date.now(),
      })
      await flushStudyProgress()
    } catch {
      persist({ ...committed, committed: false })
      return
    }
  }
  notify()
}

export function finishFocusTimer(now = Date.now()) {
  const snapshot = getFocusTimerSnapshot(now)
  if (!snapshot) return null
  const advanced = advanceFocusTimer(snapshot, now)
  const finished: FocusTimerSnapshot = {
    ...advanced,
    status: 'finished',
    lastTickAt: null,
    pauseReason: null,
  }
  persist(finished)
  void commitFocusTimerResult(finished)
  return finished
}

export function clearFocusTimer() {
  persist(null)
}

export function subscribeFocusTimer(listener: (snapshot: FocusTimerSnapshot | null) => void) {
  if (typeof window === 'undefined') return () => undefined
  const handler = () => listener(getFocusTimerSnapshot())
  window.addEventListener(EVENT, handler)
  listener(getFocusTimerSnapshot())
  return () => window.removeEventListener(EVENT, handler)
}

let runtimeStarted = false
let lastActivityWrite = 0

export function startFocusTimerRuntime() {
  if (runtimeStarted || typeof window === 'undefined') return
  runtimeStarted = true

  const tick = () => {
    const snapshot = getFocusTimerSnapshot()
    notify()
    if (snapshot?.status === 'finished' && !snapshot.committed) void commitFocusTimerResult(snapshot)
  }
  const activity = () => {
    const now = Date.now()
    if (now - lastActivityWrite < 15000) return
    lastActivityWrite = now
    noteFocusTimerActivity(now)
  }
  const visibility = () => {
    if (document.visibilityState === 'hidden') pauseFocusTimer('hidden')
    else tick()
  }

  const timer = window.setInterval(tick, 1000)
  for (const event of ['keydown', 'pointerdown', 'mousemove', 'touchstart'] as const)
    window.addEventListener(event, activity, { passive: true })
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('focus', tick)
  window.addEventListener('online', tick)
  tick()

  return () => {
    window.clearInterval(timer)
    for (const event of ['keydown', 'pointerdown', 'mousemove', 'touchstart'] as const)
      window.removeEventListener(event, activity)
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('focus', tick)
    window.removeEventListener('online', tick)
    runtimeStarted = false
  }
}
