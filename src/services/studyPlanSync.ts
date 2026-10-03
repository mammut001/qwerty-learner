export type StudyPlanStorage = {
  startDate: string
  minutes: Record<string, Record<string, number>>
  minimumMode: Record<string, boolean>
}
type Operation = {
  kind: 'startDate' | 'mode' | 'minutes' | 'increment'
  day?: string
  task?: string
  value: string | number | boolean | null
}
type Mutation = { id: string; operations: Operation[] }
const KEY = 'qwerty-fr-study-plan-v1'
const SEED = 'qwerty-fr-study-plan-migration'
const PENDING = 'qwerty-fr-study-plan-pending:'
const listeners = new Set<(state: StudyPlanStorage) => void>()
const statuses = new Set<(message: string) => void>()
let running: Promise<void> | undefined
let retry: ReturnType<typeof setTimeout> | undefined
let fallback: StudyPlanStorage

const publish = (state: StudyPlanStorage) => {
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((listener) => listener(state))
}
async function request(method: string, body?: unknown): Promise<StudyPlanStorage | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch('/api/study-plan', {
      method,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(`Study API: ${response.status}`)
    return (await response.json()).state
  } finally {
    clearTimeout(timeout)
  }
}
function pending(): Mutation[] {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(PENDING))
    .sort()
    .map((key) => JSON.parse(localStorage.getItem(key) || 'null') as Mutation)
}
async function drain() {
  let state = await request('GET')
  if (!state) state = await request('POST', { state: JSON.parse(localStorage.getItem(SEED) || JSON.stringify(fallback)) })
  for (;;) {
    const next = pending()[0]
    if (!next) break
    statuses.forEach((listener) => listener('正在保存到服务端…'))
    state = await request('PATCH', next)
    // Delete only this acknowledged operation, never the entire pending queue.
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PENDING) && JSON.parse(localStorage.getItem(key) || 'null').id === next.id) localStorage.removeItem(key)
    }
  }
  if (state) publish(state)
  localStorage.removeItem(SEED)
  if (retry) {
    clearTimeout(retry)
    retry = undefined
  }
  statuses.forEach((listener) => listener('已保存到服务端'))
}
export function syncStudyPlan(initial?: StudyPlanStorage): Promise<void> {
  if (initial) fallback = initial
  if (!fallback) return Promise.resolve()
  try {
    if (!localStorage.getItem(SEED)) localStorage.setItem(SEED, JSON.stringify(fallback))
  } catch {
    statuses.forEach((listener) => listener('无法访问浏览器存储，请检查隐私设置或存储空间。'))
    return Promise.resolve()
  }
  if (running) return running
  // Web Locks also serialize first-session creation and queue processing across tabs.
  const locks = (navigator as Navigator & { locks?: { request: (name: string, callback: () => Promise<void>) => Promise<void> } }).locks
  running = (locks ? locks.request('qwerty-study-plan', drain) : drain())
    .catch(() => {
      statuses.forEach((listener) => listener('服务端暂不可用，记录保留在本机，将自动重试。'))
      if (!retry)
        retry = setTimeout(() => {
          retry = undefined
          void syncStudyPlan()
        }, 10000)
    })
    .finally(() => {
      running = undefined
    })
  return running
}
function enqueue(operations: Operation[]) {
  if (!operations.length) return
  const id = crypto.randomUUID()
  // Persist before sending so reloads and lost responses are safe to retry.
  const last = Math.max(
    0,
    ...Object.keys(localStorage)
      .filter((key) => key.startsWith(PENDING))
      .map((key) => Number(key.slice(PENDING.length).split(':')[0])),
  )
  const order = Math.max(Date.now() * 1000, last + 1)
  localStorage.setItem(`${PENDING}${order.toString().padStart(16, '0')}:${id}`, JSON.stringify({ id, operations }))
  void syncStudyPlan()
}
export function saveStudyPlan(previous: StudyPlanStorage, next: StudyPlanStorage) {
  const operations: Operation[] = []
  if (previous.startDate !== next.startDate) operations.push({ kind: 'startDate', value: next.startDate })
  for (const day of Array.from(new Set([...Object.keys(previous.minimumMode), ...Object.keys(next.minimumMode)]))) {
    if (previous.minimumMode[day] !== next.minimumMode[day]) operations.push({ kind: 'mode', day, value: next.minimumMode[day] ?? null })
  }
  for (const day of Array.from(new Set([...Object.keys(previous.minutes), ...Object.keys(next.minutes)]))) {
    for (const task of Array.from(new Set([...Object.keys(previous.minutes[day] ?? {}), ...Object.keys(next.minutes[day] ?? {})]))) {
      if (previous.minutes[day]?.[task] !== next.minutes[day]?.[task])
        operations.push({ kind: 'minutes', day, task, value: next.minutes[day]?.[task] ?? null })
    }
  }
  fallback = previous
  enqueue(operations)
  publish(next)
}
export function addStudyMinutes(day: string, task: string, value: number) {
  const raw = localStorage.getItem(KEY)
  if (!raw) return
  const state = JSON.parse(raw) as StudyPlanStorage
  fallback = state
  enqueue([{ kind: 'increment', day, task, value }])
  publish({ ...state, minutes: { ...state.minutes, [day]: { ...state.minutes[day], [task]: (state.minutes[day]?.[task] ?? 0) + value } } })
}
export function subscribeStudyPlan(listener: (state: StudyPlanStorage) => void, status: (message: string) => void) {
  listeners.add(listener)
  statuses.add(status)
  const refresh = () => {
    void syncStudyPlan()
  }
  window.addEventListener('online', refresh)
  window.addEventListener('focus', refresh)
  return () => {
    listeners.delete(listener)
    statuses.delete(status)
    window.removeEventListener('online', refresh)
    window.removeEventListener('focus', refresh)
  }
}
