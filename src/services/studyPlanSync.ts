import { normalizeStudyPlanSettings, startDateFromExamDate, type StudyPlanSettings } from '../resources/studyPlanSchedule.ts'
// Empty means same-origin; set at Vite build time for a separate API deployment.
export function studyApiBase(value = ''): string {
  if (!value.trim()) return ''
  const url = new URL(value.trim())
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/' ||
    !(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
  )
    throw new Error('VITE_STUDY_API_BASE_URL must be an HTTPS origin (HTTP is allowed only for local development).')
  return url.origin
}

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)

export type StudyPlanStorage = {
  startDate: string
  settings: StudyPlanSettings
  minutes: Record<string, Record<string, number>>
  minimumMode: Record<string, boolean>
}

export type VocabularyProgressRecord = {
  id: string
  word: string
  dict: string
  chapter: number | null
  timeStamp: number
  day: string
  durationMs: number
  wrongCount: number
  wrongKeys: string[]
}

export type VocabularyProgressInput = Omit<VocabularyProgressRecord, 'id' | 'day'> & {
  id?: string
  day?: string
}

export type GrammarChoice = 'A' | 'B'
export type GrammarDraft = {
  status: 'running'
  secondsLeft: number
  currentBatch: number
  answers: Record<string, GrammarChoice>
  reasons: Record<string, string>
  submittedBatches: Record<string, boolean>
  outputAnswers: string[]
  startedAt: number | null
  deadline: number | null
}

export type GrammarSessionItem = {
  id: string
  label: string
  prompt?: string
  correct: boolean
}

export type GrammarSessionRecord = {
  id: string
  topic: string
  score: number
  total: number
  elapsedSeconds: number
  finishedAt: number
  day: string
  answers: Record<string, GrammarChoice>
  reasons: Record<string, string>
  outputAnswers: string[]
  items?: GrammarSessionItem[]
}

export type TenseStat = { correct: number; total: number }
export type ConjugationTense = 'present' | 'passeCompose' | 'imparfait'
export type ConjugationStats = Record<string, Partial<Record<ConjugationTense, TenseStat>>>
export type ConjugationAttempt = {
  id: string
  verb: string
  tense: ConjugationTense
  correct: boolean
  day: string
  occurredAt: number
}

export type ReviewKind = 'vocabulary' | 'grammar' | 'conjugation'
export type ReviewState = {
  kind: ReviewKind
  sourceId: string
  label: string
  dueDate: string
  intervalDays: number
  repetitions: number
  ease: number
  lastReviewedAt: number | null
  updatedAt: number
  lastResult: number
}

export type ReviewQueueItem = {
  itemId: string
  kind: ReviewKind
  sourceId: string
  label: string
  errorCount: number
  lastErrorAt: number
  dueDate: string
  repetitions: number
  intervalDays: number
  ease: number
  lastReviewedAt: number | null
}

export type SyncMeta = {
  startDateUpdatedAt: number
  settingsUpdatedAt: number
  minimumModeUpdatedAt: Record<string, number>
  minutesUpdatedAt: Record<string, Record<string, number>>
  grammarDraftUpdatedAt: number
}

export type LearningProgress = {
  vocabulary: { records: VocabularyProgressRecord[] }
  grammar: { draft: GrammarDraft | null; history: GrammarSessionRecord[] }
  conjugation: ConjugationStats
  conjugationDaily: Record<string, TenseStat>
  conjugationAttempts: ConjugationAttempt[]
  reviews: { items: Record<string, ReviewState> }
}

export type StudyServerState = StudyPlanStorage & {
  learning: LearningProgress
  syncMeta: SyncMeta
}

export type TrendPoint = {
  label: string
  startDate: string
  endDate: string
  minutes: number
  vocabularyAccuracy: number | null
  grammarAccuracy: number | null
  conjugationAccuracy: number | null
}

export type ErrorRankingItem = {
  id: string
  label: string
  errors: number
  attempts: number
  correct: number
  accuracy: number | null
}

export type StudyAnalytics = {
  generatedAt: string
  plan: {
    totalMinutes: number
    currentWeek: number
    weeklyMinutes: number
    weeklyPlannedMinutes: number
    weeklyPlannedDays: number
    weeklyCompletedDays: number
    weekCompletionPercent: number
    weeklyHistory: Array<{
      week: number
      startDate: string
      endDate: string
      minutes: number
      plannedMinutes: number
      completionPercent: number
      completedDays: number
      wrongWords: number
      wrongAttempts: number
    }>
    phase: {
      id: number
      weeks: [number, number]
      completedDays: number
      elapsedDays: number
      completionPercent: number
    }
  }
  streak: { current: number; longest: number }
  vocabulary: { attempts: number; uniqueWords: number; wrongWords: number; minutes: number; accuracy: number | null }
  grammar: {
    sessions: number
    correct: number
    total: number
    accuracy: number | null
    minutes: number
    hasDraft: boolean
  }
  conjugation: { attempts: number; correct: number; accuracy: number | null; practicedVerbs: number }
  trends: { daily: TrendPoint[]; weekly: TrendPoint[]; monthly: TrendPoint[] }
  rankings: {
    vocabulary: ErrorRankingItem[]
    grammar: ErrorRankingItem[]
    conjugation: ErrorRankingItem[]
  }
  reviewDue: number
}

type Operation =
  | { kind: 'startDate'; value: string; updatedAt: number }
  | { kind: 'settings'; value: StudyPlanSettings; updatedAt: number }
  | { kind: 'mode'; day: string; value: boolean | null; updatedAt: number }
  | { kind: 'minutes'; day: string; task: string; value: number | null; updatedAt: number }
  | { kind: 'increment'; day: string; task: string; value: number; updatedAt: number }
  | { kind: 'replace'; value: StudyPlanStorage | StudyServerState }
  | { kind: 'vocabularyRecords'; value: VocabularyProgressRecord[] }
  | { kind: 'grammarDraft'; value: GrammarDraft | null; updatedAt: number }
  | { kind: 'grammarSession'; value: GrammarSessionRecord }
  | { kind: 'grammarSeed'; value: GrammarSessionRecord[] }
  | { kind: 'conjugationSeed'; value: ConjugationStats }
  | { kind: 'conjugationAttempt'; value: ConjugationAttempt }
  | {
      kind: 'reviewResult'
      itemId: string
      reviewKind: ReviewKind
      sourceId: string
      label: string
      quality: number
      reviewedAt: number
      day: string
    }

type Mutation = { id: string; operations: Operation[] }

const KEY = 'qwerty-fr-study-plan-v1'
const ANALYTICS_KEY = 'qwerty-fr-study-analytics-v2'
const REVIEW_KEY = 'qwerty-fr-study-review-v1'
const SYNC_KEY = 'qwerty-fr-study-sync-key-v1'
const SEED = `qwerty-fr-study-plan-migration${API_BASE ? ':' + API_BASE : ''}`
const PENDING = `qwerty-fr-study-plan-pending:${API_BASE ? API_BASE + ':' : ''}`
const MAX_VOCAB_RECORDS = 3000
const MAX_CONJUGATION_ATTEMPTS = 3000
const isPendingKey = (key: string) => key.startsWith(PENDING) && /^\d{16}:/.test(key.slice(PENDING.length))
const listeners = new Set<(state: StudyServerState) => void>()
const statuses = new Set<(message: string) => void>()

export type StudySyncStatus = {
  phase: 'idle' | 'queued' | 'syncing' | 'saved' | 'offline' | 'error'
  pending: number
  message: string
}

export type StudySyncInfo = {
  bound: boolean
  activeKeys: number
}

const syncStatusListeners = new Set<(status: StudySyncStatus) => void>()
let syncStatus: StudySyncStatus = { phase: 'idle', pending: 0, message: '尚未同步' }
let autoSyncInstalled = false
let running: Promise<void> | undefined
let retry: ReturnType<typeof setTimeout> | undefined
let fallback: StudyServerState | undefined

const localDay = (timestampMs = Date.now()) => {
  const date = new Date(timestampMs)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addLocalDays = (day: string, amount: number) => {
  const value = new Date(`${day}T12:00:00`)
  value.setDate(value.getDate() + amount)
  return localDay(value.getTime())
}

export function emptySyncMeta(): SyncMeta {
  return {
    startDateUpdatedAt: 0,
    settingsUpdatedAt: 0,
    minimumModeUpdatedAt: {},
    minutesUpdatedAt: {},
    grammarDraftUpdatedAt: 0,
  }
}

export function emptyLearningProgress(): LearningProgress {
  return {
    vocabulary: { records: [] },
    grammar: { draft: null, history: [] },
    conjugation: {},
    conjugationDaily: {},
    conjugationAttempts: [],
    reviews: { items: {} },
  }
}

function withLearning(state: StudyPlanStorage | StudyServerState): StudyServerState {
  const source = state as Partial<StudyServerState>
  const learning = source.learning
  return {
    startDate: state.startDate,
    settings: normalizeStudyPlanSettings(source.settings, state.startDate),
    minutes: state.minutes ?? {},
    minimumMode: state.minimumMode ?? {},
    learning: learning
      ? {
          vocabulary: { records: learning.vocabulary?.records ?? [] },
          grammar: {
            draft: learning.grammar?.draft ?? null,
            history: learning.grammar?.history ?? [],
          },
          conjugation: learning.conjugation ?? {},
          conjugationDaily: learning.conjugationDaily ?? {},
          conjugationAttempts: learning.conjugationAttempts ?? [],
          reviews: { items: learning.reviews?.items ?? {} },
        }
      : emptyLearningProgress(),
    syncMeta: source.syncMeta
      ? {
          ...emptySyncMeta(),
          ...source.syncMeta,
          minimumModeUpdatedAt: source.syncMeta.minimumModeUpdatedAt ?? {},
          minutesUpdatedAt: source.syncMeta.minutesUpdatedAt ?? {},
        }
      : emptySyncMeta(),
  }
}

function defaultState(): StudyServerState {
  const startDate = localDay()
  return {
    startDate,
    settings: normalizeStudyPlanSettings(undefined, startDate),
    minutes: {},
    minimumMode: {},
    learning: emptyLearningProgress(),
    syncMeta: emptySyncMeta(),
  }
}

function readCachedState(): StudyServerState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? withLearning(JSON.parse(raw) as StudyPlanStorage | StudyServerState) : null
  } catch {
    return null
  }
}

function ensureFallback(initial?: StudyPlanStorage | StudyServerState): StudyServerState {
  const cached = readCachedState()
  if (initial) {
    const normalized = withLearning(initial)
    const suppliedLearning = Object.prototype.hasOwnProperty.call(initial, 'learning')
    const suppliedSyncMeta = Object.prototype.hasOwnProperty.call(initial, 'syncMeta')
    fallback = cached
      ? {
          ...cached,
          startDate: normalized.startDate,
          settings: normalized.settings,
          minutes: normalized.minutes,
          minimumMode: normalized.minimumMode,
          learning: suppliedLearning ? normalized.learning : cached.learning,
          syncMeta: suppliedSyncMeta ? normalized.syncMeta : cached.syncMeta,
        }
      : normalized
  } else {
    fallback = cached ?? fallback ?? defaultState()
  }
  return fallback as StudyServerState
}

const publish = (input: StudyPlanStorage | StudyServerState) => {
  const state = withLearning(input)
  fallback = state
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((listener) => listener(state))
}

async function api(method: string, path = '', body?: unknown, unauthorized = 'STUDY_SESSION_BLOCKED') {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${API_BASE}/api/study-plan${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.status === 401) throw new Error(unauthorized)
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(data.error || `Study API: ${response.status}`)
    }
    return (await response.json()) as Record<string, unknown>
  } finally {
    clearTimeout(timeout)
  }
}

async function requestState(method: string, body?: unknown, path = ''): Promise<StudyServerState | null> {
  const payload = await api(method, path, body)
  const state = payload.state as StudyPlanStorage | StudyServerState | null
  return state ? withLearning(state) : null
}

function pending(): Mutation[] {
  return Object.keys(localStorage)
    .filter(isPendingKey)
    .sort()
    .map((key) => JSON.parse(localStorage.getItem(key) || 'null') as Mutation)
}

function emitSyncStatus(phase: StudySyncStatus['phase'], message: string) {
  let count = 0
  try {
    count = pending().length
  } catch {
    count = syncStatus.pending
  }
  syncStatus = { phase, pending: count, message }
  statuses.forEach((listener) => listener(message))
  syncStatusListeners.forEach((listener) => listener(syncStatus))
}

function ensureAutoSyncListeners() {
  if (autoSyncInstalled || typeof window === 'undefined') return
  autoSyncInstalled = true
  const resume = () => {
    try {
      if (pending().length > 0) void syncStudyPlan()
    } catch {
      // Browser storage may be unavailable; the next explicit save will surface the error.
    }
  }
  window.addEventListener('online', resume)
  window.addEventListener('focus', resume)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resume()
    })
  }
}

export function getStudySyncSnapshot(): StudySyncStatus {
  try {
    return { ...syncStatus, pending: pending().length }
  } catch {
    return { ...syncStatus }
  }
}

export function subscribeStudySyncStatus(listener: (status: StudySyncStatus) => void) {
  ensureAutoSyncListeners()
  syncStatusListeners.add(listener)
  listener(getStudySyncSnapshot())
  return () => syncStatusListeners.delete(listener)
}

function removeAcknowledgedMutation(id: string) {
  for (const key of Object.keys(localStorage)) {
    if (isPendingKey(key) && JSON.parse(localStorage.getItem(key) || 'null').id === id) localStorage.removeItem(key)
  }
}

async function drain() {
  ensureFallback()
  let state = await requestState('GET')
  if (!state) {
    const seed = JSON.parse(localStorage.getItem(SEED) || JSON.stringify(fallback)) as StudyServerState
    state = await requestState('POST', { state: withLearning(seed) })
  }

  for (;;) {
    const next = pending()[0]
    if (!next) break
    emitSyncStatus('syncing', '正在合并并保存到服务端…')
    state =
      next.operations.length === 1 && next.operations[0].kind === 'replace'
        ? await requestState(
            'POST',
            {
              id: next.id,
              backup: { format: 'qwerty-study-plan', version: 4, state: next.operations[0].value },
            },
            '/import',
          )
        : await requestState('PATCH', next)
    removeAcknowledgedMutation(next.id)
  }

  if (state) publish(state)
  localStorage.removeItem(SEED)
  if (retry) {
    clearTimeout(retry)
    retry = undefined
  }
  emitSyncStatus('saved', '已与服务端合并并保存')
}

export function syncStudyPlan(initial?: StudyPlanStorage | StudyServerState): Promise<void> {
  ensureAutoSyncListeners()
  try {
    ensureFallback(initial)
    if (!localStorage.getItem(SEED)) localStorage.setItem(SEED, JSON.stringify(fallback))
  } catch {
    emitSyncStatus('error', '无法访问浏览器存储，请检查隐私设置或存储空间。')
    return Promise.resolve()
  }
  if (running) return running

  const locks = (navigator as Navigator & {
    locks?: { request: (name: string, callback: () => Promise<void>) => Promise<void> }
  }).locks
  running = (locks ? locks.request('qwerty-study-plan', drain) : drain())
    .catch((error: Error) => {
      const sessionBlocked = error.message === 'STUDY_SESSION_BLOCKED'
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      emitSyncStatus(
        offline ? 'offline' : 'error',
        sessionBlocked
          ? '浏览器未保留学习会话。记录仍保留在本机，允许 Cookie 后会继续同步。'
          : offline
            ? '当前离线：学习记录已保存在本机，联网后会按最新时间戳自动合并。'
            : '服务端暂不可用，记录保留在本机，将自动重试。',
      )
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
  ensureAutoSyncListeners()
  ensureFallback()
  const id = crypto.randomUUID()
  const last = Math.max(
    0,
    ...Object.keys(localStorage)
      .filter(isPendingKey)
      .map((key) => Number(key.slice(PENDING.length).split(':')[0])),
  )
  const order = Math.max(Date.now() * 1000, last + 1)
  localStorage.setItem(
    `${PENDING}${order.toString().padStart(16, '0')}:${id}`,
    JSON.stringify({ id, operations }),
  )
  emitSyncStatus('queued', '已先保存在本机，正在同步…')
  void syncStudyPlan()
  return id
}

function applyStudyPlanClocks(state: StudyServerState, operations: Operation[]) {
  const next = withLearning(state)
  for (const op of operations) {
    if (op.kind === 'startDate') next.syncMeta.startDateUpdatedAt = op.updatedAt
    else if (op.kind === 'settings') {
      next.syncMeta.settingsUpdatedAt = op.updatedAt
      next.syncMeta.startDateUpdatedAt = Math.max(next.syncMeta.startDateUpdatedAt, op.updatedAt)
    } else if (op.kind === 'mode') next.syncMeta.minimumModeUpdatedAt[op.day] = op.updatedAt
    else if (op.kind === 'minutes' || op.kind === 'increment') {
      next.syncMeta.minutesUpdatedAt[op.day] ??= {}
      next.syncMeta.minutesUpdatedAt[op.day][op.task] = op.updatedAt
    } else if (op.kind === 'grammarDraft') next.syncMeta.grammarDraftUpdatedAt = op.updatedAt
  }
  return next
}

function optimisticOperation(operation: Operation, update: (state: StudyServerState) => StudyServerState) {
  const current = ensureFallback()
  enqueue([operation])
  publish(applyStudyPlanClocks(update(current), [operation]))
}

export function saveStudyPlan(previous: StudyPlanStorage, next: StudyPlanStorage) {
  const operations: Operation[] = []
  const updatedAt = Date.now()
  if (previous.startDate !== next.startDate) operations.push({ kind: 'startDate', value: next.startDate, updatedAt })
  for (const day of Array.from(new Set([...Object.keys(previous.minimumMode), ...Object.keys(next.minimumMode)]))) {
    if (previous.minimumMode[day] !== next.minimumMode[day])
      operations.push({ kind: 'mode', day, value: next.minimumMode[day] ?? null, updatedAt })
  }
  for (const day of Array.from(new Set([...Object.keys(previous.minutes), ...Object.keys(next.minutes)]))) {
    for (const task of Array.from(new Set([...Object.keys(previous.minutes[day] ?? {}), ...Object.keys(next.minutes[day] ?? {})]))) {
      if (previous.minutes[day]?.[task] !== next.minutes[day]?.[task])
        operations.push({ kind: 'minutes', day, task, value: next.minutes[day]?.[task] ?? null, updatedAt })
    }
  }
  const current = ensureFallback(previous)
  enqueue(operations)
  publish(
    applyStudyPlanClocks(
      { ...current, startDate: next.startDate, minutes: next.minutes, minimumMode: next.minimumMode },
      operations,
    ),
  )
}

export function saveStudyPlanSettings(settings: StudyPlanSettings) {
  const current = ensureFallback()
  const normalized = normalizeStudyPlanSettings(settings, current.startDate)
  const nextStartDate = startDateFromExamDate(normalized.examDate)
  const updatedAt = Date.now()
  optimisticOperation({ kind: 'settings', value: normalized, updatedAt }, (state) => ({
    ...state,
    startDate: nextStartDate,
    settings: normalized,
  }))
}

export function addStudyMinutes(day: string, task: string, value: number) {
  const updatedAt = Date.now()
  optimisticOperation({ kind: 'increment', day, task, value, updatedAt }, (state) => ({
    ...state,
    minutes: {
      ...state.minutes,
      [day]: { ...(state.minutes[day] ?? {}), [task]: (state.minutes[day]?.[task] ?? 0) + value },
    },
  }))
}

export function recordVocabularyProgress(input: VocabularyProgressInput) {
  const record: VocabularyProgressRecord = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    day: input.day ?? localDay(input.timeStamp * 1000),
    wrongKeys: input.wrongKeys.slice(0, 200),
  }
  optimisticOperation({ kind: 'vocabularyRecords', value: [record] }, (state) => {
    const records = state.learning.vocabulary.records.filter((item) => item.id !== record.id)
    return {
      ...state,
      learning: {
        ...state.learning,
        vocabulary: { records: [...records, record].slice(-MAX_VOCAB_RECORDS) },
      },
    }
  })
  return record
}

export function migrateVocabularyHistory(records: VocabularyProgressInput[]) {
  if (!records.length) return
  const normalized = records.slice(-MAX_VOCAB_RECORDS).map((record) => ({
    ...record,
    id: record.id ?? crypto.randomUUID(),
    day: record.day ?? localDay(record.timeStamp * 1000),
    wrongKeys: record.wrongKeys.slice(0, 200),
  }))
  const state = ensureFallback()
  const known = new Set(state.learning.vocabulary.records.map((item) => item.id))
  const additions = normalized.filter((item) => !known.has(item.id))
  if (!additions.length) return
  enqueue([{ kind: 'vocabularyRecords', value: additions }])
  publish({
    ...state,
    learning: {
      ...state.learning,
      vocabulary: {
        records: [...state.learning.vocabulary.records, ...additions].slice(-MAX_VOCAB_RECORDS),
      },
    },
  })
}

export function saveGrammarDraft(draft: GrammarDraft | null) {
  const updatedAt = Date.now()
  optimisticOperation({ kind: 'grammarDraft', value: draft, updatedAt }, (state) => ({
    ...state,
    learning: {
      ...state.learning,
      grammar: { ...state.learning.grammar, draft },
    },
  }))
}

export function completeGrammarSession(session: Omit<GrammarSessionRecord, 'id' | 'day'> & { id?: string; day?: string }) {
  const record: GrammarSessionRecord = {
    ...session,
    id: session.id ?? crypto.randomUUID(),
    day: session.day ?? localDay(session.finishedAt),
  }
  const updatedAt = Date.now()
  const state = ensureFallback()
  const operations: Operation[] = [
    { kind: 'grammarSession', value: record },
    { kind: 'grammarDraft', value: null, updatedAt },
  ]
  enqueue(operations)
  publish(
    applyStudyPlanClocks(
      {
        ...state,
        learning: {
          ...state.learning,
          grammar: {
            draft: null,
            history: [record, ...state.learning.grammar.history.filter((item) => item.id !== record.id)].slice(0, 50),
          },
        },
      },
      operations,
    ),
  )
  return record
}

export function seedGrammarHistory(records: GrammarSessionRecord[]) {
  if (!records.length) return
  const state = ensureFallback()
  if (state.learning.grammar.history.length) return
  enqueue([{ kind: 'grammarSeed', value: records.slice(0, 50) }])
  publish({
    ...state,
    learning: { ...state.learning, grammar: { ...state.learning.grammar, history: records.slice(0, 50) } },
  })
}

export function seedConjugationStats(stats: ConjugationStats) {
  const state = ensureFallback()
  const total = Object.values(state.learning.conjugation).reduce(
    (sum, tenses) => sum + Object.values(tenses).reduce((inner, value) => inner + (value?.total ?? 0), 0),
    0,
  )
  if (total > 0) return
  enqueue([{ kind: 'conjugationSeed', value: stats }])
  publish({ ...state, learning: { ...state.learning, conjugation: stats } })
}

export function recordConjugationAttempt(
  verb: string,
  tense: ConjugationTense,
  correct: boolean,
  day = localDay(),
) {
  const occurredAt = Date.now()
  const attempt: ConjugationAttempt = {
    id: crypto.randomUUID(),
    verb,
    tense,
    correct,
    day,
    occurredAt,
  }
  optimisticOperation({ kind: 'conjugationAttempt', value: attempt }, (state) => {
    const current = state.learning.conjugation[verb]?.[tense] ?? { correct: 0, total: 0 }
    const daily = state.learning.conjugationDaily[day] ?? { correct: 0, total: 0 }
    return {
      ...state,
      learning: {
        ...state.learning,
        conjugation: {
          ...state.learning.conjugation,
          [verb]: {
            ...(state.learning.conjugation[verb] ?? {}),
            [tense]: { correct: current.correct + (correct ? 1 : 0), total: current.total + 1 },
          },
        },
        conjugationDaily: {
          ...state.learning.conjugationDaily,
          [day]: { correct: daily.correct + (correct ? 1 : 0), total: daily.total + 1 },
        },
        conjugationAttempts: [...state.learning.conjugationAttempts.filter((item) => item.id !== attempt.id), attempt].slice(
          -MAX_CONJUGATION_ATTEMPTS,
        ),
      },
    }
  })
  return attempt
}

function localReviewState(previous: ReviewState | undefined, item: ReviewQueueItem, quality: number, reviewedAt: number): ReviewState {
  let ease = previous?.ease ?? item.ease ?? 2.5
  let repetitions = previous?.repetitions ?? item.repetitions ?? 0
  let intervalDays = previous?.intervalDays ?? item.intervalDays ?? 0
  ease = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.max(1, Math.round(Math.max(1, intervalDays) * ease))
  }
  return {
    kind: item.kind,
    sourceId: item.sourceId,
    label: item.label,
    dueDate: addLocalDays(localDay(reviewedAt), intervalDays),
    intervalDays,
    repetitions,
    ease: Math.round(ease * 100) / 100,
    lastReviewedAt: reviewedAt,
    updatedAt: reviewedAt,
    lastResult: quality,
  }
}

export function submitReviewResult(item: ReviewQueueItem, quality: number) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new Error('INVALID_REVIEW_QUALITY')
  const reviewedAt = Date.now()
  const day = localDay(reviewedAt)
  const operation: Operation = {
    kind: 'reviewResult',
    itemId: item.itemId,
    reviewKind: item.kind,
    sourceId: item.sourceId,
    label: item.label,
    quality,
    reviewedAt,
    day,
  }
  const state = ensureFallback()
  enqueue([operation])
  const review = localReviewState(state.learning.reviews.items[item.itemId], item, quality, reviewedAt)
  publish({
    ...state,
    learning: {
      ...state.learning,
      reviews: { items: { ...state.learning.reviews.items, [item.itemId]: review } },
    },
  })
  try {
    const cached = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '[]') as ReviewQueueItem[]
    localStorage.setItem(REVIEW_KEY, JSON.stringify(cached.filter((candidate) => candidate.itemId !== item.itemId)))
  } catch {
    // The durable mutation queue is the source of truth.
  }
  return review
}

export async function getLearningProgress(): Promise<LearningProgress> {
  await syncStudyPlan()
  return (readCachedState() ?? ensureFallback()).learning
}

export async function flushStudyProgress(): Promise<StudySyncStatus> {
  await syncStudyPlan()
  return getStudySyncSnapshot()
}

export function subscribeStudyPlan(
  listener: (state: StudyPlanStorage) => void,
  status: (message: string) => void,
) {
  const wrapped = (state: StudyServerState) => listener(state)
  listeners.add(wrapped)
  statuses.add(status)
  const refresh = () => void syncStudyPlan()
  window.addEventListener('online', refresh)
  window.addEventListener('focus', refresh)
  return () => {
    listeners.delete(wrapped)
    statuses.delete(status)
    window.removeEventListener('online', refresh)
    window.removeEventListener('focus', refresh)
  }
}

export function subscribeLearningProgress(listener: (learning: LearningProgress) => void) {
  const wrapped = (state: StudyServerState) => listener(state.learning)
  listeners.add(wrapped)
  return () => listeners.delete(wrapped)
}

export async function exportRemoteStudyPlan(initial: StudyPlanStorage) {
  await syncStudyPlan(initial)
  if (pending().length) throw new Error('请等待待保存记录同步后再导出。')
  const payload = await api('GET', '/export')
  if (!payload.state || pending().length) throw new Error('同步未完成，请稍后重试。')
  return payload as {
    format: 'qwerty-study-plan'
    version: 4
    exportedAt: string
    state: StudyServerState
  }
}

export async function importRemoteStudyPlan(previous: StudyPlanStorage, state: StudyPlanStorage | StudyServerState) {
  const current = ensureFallback(previous)
  const imported = withLearning(state)
  const next = Object.prototype.hasOwnProperty.call(state, 'learning')
    ? imported
    : { ...imported, learning: current.learning, syncMeta: current.syncMeta }
  const id = enqueue([{ kind: 'replace', value: next }])
  publish(next)
  await syncStudyPlan()
  return !pending().some((mutation) => mutation.id === id)
}

export async function loadStudyAnalytics(): Promise<StudyAnalytics | null> {
  await syncStudyPlan()
  try {
    const payload = await api('GET', `/analytics?today=${encodeURIComponent(localDay())}`)
    const analytics = (payload.analytics as StudyAnalytics | null) ?? null
    if (analytics) localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics))
    return analytics
  } catch {
    try {
      const cached = localStorage.getItem(ANALYTICS_KEY)
      return cached ? (JSON.parse(cached) as StudyAnalytics) : null
    } catch {
      return null
    }
  }
}

export async function loadReviewQueue(): Promise<ReviewQueueItem[]> {
  await syncStudyPlan()
  try {
    const payload = await api('GET', `/review?today=${encodeURIComponent(localDay())}`)
    const queue = Array.isArray(payload.queue) ? (payload.queue as ReviewQueueItem[]) : []
    localStorage.setItem(REVIEW_KEY, JSON.stringify(queue))
    return queue
  } catch {
    try {
      const cached = localStorage.getItem(REVIEW_KEY)
      return cached ? (JSON.parse(cached) as ReviewQueueItem[]) : []
    } catch {
      return []
    }
  }
}

export async function createStudySyncKey(initial?: StudyPlanStorage) {
  await syncStudyPlan(initial)
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const payload = await api('POST', '/sync-key', {})
  const key = payload.key
  if (typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key)) throw new Error('INVALID_SYNC_KEY_RESPONSE')
  localStorage.setItem(SYNC_KEY, key)
  return key
}

export function getStoredStudySyncKey() {
  try {
    const key = localStorage.getItem(SYNC_KEY)
    return key && /^[a-f0-9]{64}$/.test(key) ? key : ''
  } catch {
    return ''
  }
}

export async function loadStudySyncInfo(): Promise<StudySyncInfo> {
  await syncStudyPlan()
  const payload = await api('GET', '/sync')
  return {
    bound: payload.bound === true,
    activeKeys: typeof payload.activeKeys === 'number' ? payload.activeKeys : 0,
  }
}

export async function linkStudyDevice(key: string): Promise<StudyServerState> {
  const normalized = key.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalized)) throw new Error('INVALID_SYNC_KEY')
  if (pending().length) {
    await syncStudyPlan()
    if (pending().length) throw new Error('PENDING_MUTATIONS')
  }
  const payload = await api('POST', '/link', { key: normalized }, 'INVALID_SYNC_KEY')
  const state = payload.state as StudyServerState | undefined
  if (!state) throw new Error('INVALID_SYNC_KEY_RESPONSE')
  localStorage.removeItem(SEED)
  localStorage.setItem(SYNC_KEY, normalized)
  publish(withLearning(state))
  return withLearning(state)
}

export async function unlinkStudyDevice(): Promise<StudyServerState> {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const payload = await api('POST', '/unlink', {})
  const state = payload.state as StudyServerState | undefined
  if (!state) throw new Error('UNLINK_FAILED')
  localStorage.removeItem(SYNC_KEY)
  localStorage.removeItem(SEED)
  publish(withLearning(state))
  emitSyncStatus('saved', '已解绑；这台设备已保留一份独立学习进度。')
  return withLearning(state)
}

export async function revokeStudySyncKey(key = getStoredStudySyncKey()) {
  const normalized = key.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalized)) throw new Error('INVALID_SYNC_KEY')
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  await api('POST', '/sync-key/revoke', { key: normalized })
  if (getStoredStudySyncKey() === normalized) localStorage.removeItem(SYNC_KEY)
  return true
}
