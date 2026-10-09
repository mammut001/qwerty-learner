import { computePlacementResult } from '../../server/placement-data.mjs'
import { parseEchelleItemId, scoreEchelleItem } from '../resources/echelleCurriculum'
import { nextMemory } from '../resources/echelleMemory'
import type { PlacementProfile, PlacementResult } from '../resources/placementTest'
import { isGuestMode } from './guestMode'

type StudyPlanSettings = {
  examDate: string
  dailyTargetMinutes: number | null
  studyDays: number[]
}

const STUDY_PLAN_DAY_COUNT = 26 * 7
const DEFAULT_STUDY_DAYS = [1, 2, 3, 4, 5, 6, 0]

const validStudyDateKey = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

const shiftStudyDateKey = (key: string, amount: number) => {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  date.setDate(date.getDate() + amount)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

const startDateFromExamDate = (examDate: string) => shiftStudyDateKey(examDate, -(STUDY_PLAN_DAY_COUNT - 1))

const normalizeStudyPlanSettings = (value: Partial<StudyPlanSettings> | null | undefined, startDate: string): StudyPlanSettings => {
  const fallback: StudyPlanSettings = {
    examDate: shiftStudyDateKey(startDate, STUDY_PLAN_DAY_COUNT - 1),
    dailyTargetMinutes: null,
    studyDays: [...DEFAULT_STUDY_DAYS],
  }
  const requestedStudyDays = value?.studyDays
  const requestedTarget = value?.dailyTargetMinutes
  const requestedExamDate = value?.examDate
  const studyDays = Array.isArray(requestedStudyDays)
    ? Array.from(new Set(requestedStudyDays.filter((day: number) => Number.isInteger(day) && day >= 0 && day <= 6)))
    : fallback.studyDays
  return {
    examDate: validStudyDateKey(requestedExamDate) ? requestedExamDate : fallback.examDate,
    dailyTargetMinutes:
      requestedTarget === null ||
      (typeof requestedTarget === 'number' && Number.isInteger(requestedTarget) && requestedTarget >= 20 && requestedTarget <= 240)
        ? requestedTarget
        : fallback.dailyTargetMinutes,
    studyDays: studyDays.length ? studyDays : fallback.studyDays,
  }
}

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

export type FocusSessionRecord = {
  id: string
  day: string
  taskId: string
  title: string
  minutes: number
  endedAt: number
}

export type TcfSkill = 'listening' | 'reading' | 'writing' | 'speaking'
export type TcfAttemptAnswer = {
  questionId: string
  choice: number | null
  correct: boolean
}
export type TcfAttemptRecord = {
  id: string
  skill: TcfSkill
  questionCount: number
  answers?: TcfAttemptAnswer[]
  correctCount?: number | null
  scaledScore: number
  score?: number
  nclc: number
  durationSeconds: number
  startedAt: number
  finishedAt: number
  day: string
  writingDetails?: {
    task1Id: string
    task1Response: string
    task2Id: string
    task2Response: string
    task3Id: string
    task3Response: string
    wordCounts: { task1: number; task2: number; task3: number }
    scores: { taskCompletion: number; coherence: number; vocabulary: number; grammar: number }
  }
  speakingDetails?: {
    task1Id: string
    task1Duration: number
    task2Id: string
    task2Duration: number
    task3Id: string
    task3Duration: number
    recordingsMeta: Record<string, unknown>
    scores: { fluency: number; pronunciation: number; vocabulary: number; grammar: number; taskCompletion: number }
  }
}

export type TcfEeDraft = {
  draftId: string
  task1Id: string
  task1Response: string
  task2Id: string
  task2Response: string
  task3Id: string
  task3Response: string
  remainingSeconds: number
  currentTask: number
  startedAt: number
  updatedAt: number
}

export type TcfEeAttempt = {
  id: string
  skill?: 'writing'
  task1Id: string
  task1Response: string
  task2Id: string
  task2Response: string
  task3Id: string
  task3Response: string
  wordCounts: { task1: number; task2: number; task3: number }
  scores: { taskCompletion: number; coherence: number; vocabulary: number; grammar: number }
  totalScore: number
  scaledScore?: number
  score?: number
  nclc: number
  durationSeconds: number
  startedAt: number
  finishedAt: number
  day: string
}

export type TcfEoRecordingMeta = {
  recorded: boolean
  duration: number
}

export type TcfEoAttempt = {
  id: string
  skill?: 'speaking'
  task1Id: string
  task1Duration: number
  task2Id: string
  task2Duration: number
  task3Id: string
  task3Duration: number
  recordingsMeta: {
    task1?: TcfEoRecordingMeta
    task2?: TcfEoRecordingMeta
    task3?: TcfEoRecordingMeta
  }
  scores: {
    fluency: number
    pronunciation: number
    vocabulary: number
    grammar: number
    taskCompletion: number
  }
  totalScore: number
  scaledScore?: number
  score?: number
  nclc: number
  durationSeconds: number
  startedAt: number
  finishedAt: number
  day: string
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

export type EchelleCorrection = { original: string; suggestion: string; explanationZh: string }

export type EchelleStoredEvaluation = {
  passed: boolean
  scores: Record<string, number>
  mean: number
  estimatedLevel: number
  feedbackZh: string
  provider: string
  model: string
  rubricVersion: string
  evaluatedAt: number
  corrections: EchelleCorrection[]
}

export type EchelleEvaluation = EchelleStoredEvaluation & {
  criteria: { id: string; labelZh: string; score: number; evidence: string; commentZh: string }[]
  strengthsZh: string[]
  requiredMean: number
  warnings: string[]
}

export type EchelleAiStatus = { enabled: boolean; provider: string | null; model: string | null; rubricVersion: string }

export type EchelleItemRecord = {
  mastered: boolean
  score: number
  attempts: number
  updatedAt: number
  stage?: number
  dueAt?: number | null
  lastPassedAt?: number | null
  lapses?: number
  method?: 'check' | 'self' | 'ai'
  ai?: EchelleStoredEvaluation
  response?: string[] | { selfChecks?: boolean[]; wordCount?: number; seconds?: number }
}

export type LearningProgress = {
  vocabulary: { records: VocabularyProgressRecord[] }
  grammar: { draft: GrammarDraft | null; history: GrammarSessionRecord[] }
  conjugation: ConjugationStats
  conjugationDaily: Record<string, TenseStat>
  conjugationAttempts: ConjugationAttempt[]
  focusSessions: FocusSessionRecord[]
  tcfAttempts: TcfAttemptRecord[]
  placement: PlacementProfile
  reviews: { items: Record<string, ReviewState> }
  echelle: { items: Record<string, EchelleItemRecord> }
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

export type ErrorBookItem = {
  itemId: string
  kind: ReviewKind
  sourceId: string
  label: string
  context: Record<string, unknown>
  errorCount: number
  correctStreak: number
  mastered: boolean
  firstWrongAt: number | null
  lastWrongAt: number | null
  lastAttemptAt: number
  updatedAt: number
}

export type StudyCheckin = {
  day: string
  status: 'complete' | 'makeup'
  completedAt: number
  source: 'automatic' | 'manual'
}

export type StudyCheckinDay = {
  day: string
  plannedMinutes: number
  actualMinutes: number
  targetMinutes: number
  active: boolean
  complete: boolean
  checkinStatus: 'complete' | 'makeup' | null
}

export type StudyCheckinSummary = {
  items: StudyCheckin[]
  daily: StudyCheckinDay[]
  streak: { current: number; longest: number }
}

export type StudyAchievement = {
  id: string
  title: string
  description: string
  unlockedAt: number
  progress: Record<string, number>
}

export type WeeklyStudyReport = {
  weekStart: string
  weekEnd: string
  minutes: number
  plannedMinutes: number
  plannedDays: number
  completedDays: number
  completionPercent: number
  accuracy: {
    vocabulary: number | null
    grammar: number | null
    conjugation: number | null
  }
  activityMinutes: {
    vocabulary: number
    grammar: number
    conjugation: number
    focus: number
  }
  accuracyChange: {
    vocabularyAccuracy: number | null
    grammarAccuracy: number | null
    conjugationAccuracy: number | null
  }
  weakPoints: Array<{ kind: ReviewKind; label: string; errors: number }>
  suggestions: string[]
  generatedAt: number
  finalized: boolean
}

export type MasteryMetric = {
  known: number
  mastered: number
  activeErrors: number
  percent: number
}

export type DashboardHeatmapDay = {
  day: string
  minutes: number
  plannedMinutes: number
  completionPercent: number
}

export type StudyDashboard = {
  heatmap: DashboardHeatmapDay[]
  mastery: {
    vocabulary: MasteryMetric
    grammar: MasteryMetric
    conjugation: MasteryMetric
  }
  projection: {
    totalPlannedMinutes: number
    completedMinutes: number
    remainingMinutes: number
    progressPercent: number
    averageDailyMinutes: number
    predictedCompletionDate: string | null
    scheduledCompletionDate: string
    deltaDays: number | null
  }
}

export type SmartTodayTask = {
  id: 'smart-review' | 'smart-vocab' | 'smart-grammar' | 'smart-conjugation' | 'smart-placement-focus' | 'smart-placement-secondary'
  kind: 'review' | ReviewKind | 'placement' | 'reading' | 'listening'
  title: string
  minutes: number
  href: string
  reason: string
  actualMinutes: number
  complete: boolean
}

export type PlacementAnalyticsSummary = {
  cefrLevel: string
  suggestedStartWeek: number
  studyPhaseId?: number
  weakestSection: string
  secondWeakestSection?: string
  primaryDictId?: string
  grammarTopicId?: string
  tcfBoostHref?: string
  ranked?: Array<{ section: string; ratio: number }>
}

export type SmartTodayPlan = {
  day: string
  targetMinutes: number
  plannedRoadmapMinutes: number
  dueReviews: number
  activeErrors: number
  completedMinutes: number
  placement: PlacementAnalyticsSummary | null
  tasks: SmartTodayTask[]
}

export type TcfSkillAnalytics = {
  attempts: number
  latestScore: number | null
  bestScore: number | null
  targetScore: number
  gapToTarget: number | null
  latestNclc: number | null
  trend: Array<{ id: string; finishedAt: number; score: number; nclc: number }>
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
  focus: { sessions: number; minutes: number }
  tcf: {
    listening: TcfSkillAnalytics
    reading: TcfSkillAnalytics
    writing?: TcfSkillAnalytics
    speaking?: TcfSkillAnalytics
  }
  trends: { daily: TrendPoint[]; weekly: TrendPoint[]; monthly: TrendPoint[] }
  rankings: {
    vocabulary: ErrorRankingItem[]
    grammar: ErrorRankingItem[]
    conjugation: ErrorRankingItem[]
  }
  reviewDue: number
  dashboard: StudyDashboard
  placement: PlacementAnalyticsSummary | null
  echelle: {
    currentLevel: number
    passedLevels: number[]
    totalItems: number
    masteredItems: number
    levels: Array<{
      level: number
      passed: boolean
      total: number
      mastered: number
      skills: Record<string, { total: number; mastered: number }>
    }>
  }
  today: SmartTodayPlan
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
  | { kind: 'focusSession'; value: FocusSessionRecord }
  | { kind: 'tcfAttempt'; value: TcfAttemptRecord }
  | { kind: 'placementResult'; value: PlacementResult }
  | {
      kind: 'echelleCheck'
      itemId: string
      answers?: string[]
      response?: { selfChecks: boolean[]; wordCount?: number; seconds?: number }
      updatedAt: number
    }
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
const ANALYTICS_KEY = 'qwerty-fr-study-analytics-v3'
const REVIEW_KEY = 'qwerty-fr-study-review-v1'
const SYNC_KEY = 'qwerty-fr-study-sync-key-v1'
const LEGACY_MIGRATION_KEY = `qwerty-fr-study-legacy-migration-v2${API_BASE ? ':' + API_BASE : ''}`
const SEED = `qwerty-fr-study-plan-migration${API_BASE ? ':' + API_BASE : ''}`
const PENDING = `qwerty-fr-study-plan-pending:${API_BASE ? API_BASE + ':' : ''}`
const MAX_VOCAB_RECORDS = 3000
const MAX_CONJUGATION_ATTEMPTS = 3000
const MAX_FOCUS_SESSIONS = 2000
const MAX_TCF_ATTEMPTS = 120
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

export type PasskeyAccountInfo = {
  registered: boolean
  signedIn: boolean
  passkeyCount: number
  createdAt?: number
}

export type StudyCsvKind = 'records' | 'error-book' | 'weekly-reports'

const syncStatusListeners = new Set<(status: StudySyncStatus) => void>()
let syncStatus: StudySyncStatus = { phase: 'idle', pending: 0, message: '尚未同步' }
let autoSyncInstalled = false
let running: Promise<void> | undefined
let retry: ReturnType<typeof setTimeout> | undefined
let fallback: StudyServerState | undefined
let legacyMigrationRunning: Promise<boolean> | undefined

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
    focusSessions: [],
    tcfAttempts: [],
    placement: { latest: null, history: [] },
    reviews: { items: {} },
    echelle: { items: {} },
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
          focusSessions: learning.focusSessions ?? [],
          tcfAttempts: learning.tcfAttempts ?? [],
          placement: learning.placement ?? { latest: null, history: [] },
          reviews: { items: learning.reviews?.items ?? {} },
          echelle: learning.echelle ?? { items: {} },
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
  if (isGuestMode()) {
    throw new Error(unauthorized)
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${API_BASE}/api/study-plan${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: method === 'GET' && body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.status === 401) {
      try {
        const data = (await response.clone().json()) as { code?: string }
        if (data?.code === 'LOGIN_REQUIRED' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qwerty-auth-required'))
        }
      } catch {
        // Ignore response parse errors
      }
      throw new Error(unauthorized)
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string; code?: string }
      const error = new Error(data.code || data.error || `Study API: ${response.status}`)
      ;(error as Error & { code?: string; status?: number }).code = data.code
      ;(error as Error & { code?: string; status?: number }).status = response.status
      throw error
    }
    return (await response.json()) as Record<string, unknown>
  } finally {
    clearTimeout(timeout)
  }
}

async function apiText(method: string, path: string) {
  if (isGuestMode()) {
    throw new Error('STUDY_SESSION_BLOCKED')
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${API_BASE}/api/study-plan${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
    })
    if (response.status === 401) {
      try {
        const data = (await response.clone().json()) as { code?: string }
        if (data?.code === 'LOGIN_REQUIRED' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qwerty-auth-required'))
        }
      } catch {
        // Ignore response parse errors
      }
      throw new Error('STUDY_SESSION_BLOCKED')
    }
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(text || `Study API: ${response.status}`)
    }
    return response.text()
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
              backup: { format: 'qwerty-study-plan', version: 5, schemaVersion: 5, state: next.operations[0].value },
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
  if (isGuestMode()) {
    if (retry) {
      clearTimeout(retry)
      retry = undefined
    }
    return Promise.resolve()
  }
  ensureAutoSyncListeners()
  try {
    ensureFallback(initial)
    if (!localStorage.getItem(SEED)) localStorage.setItem(SEED, JSON.stringify(fallback))
  } catch {
    emitSyncStatus('error', '无法访问浏览器存储，请检查隐私设置或存储空间。')
    return Promise.resolve()
  }
  if (running) return running

  const locks = (
    navigator as Navigator & {
      locks?: { request: (name: string, callback: () => Promise<void>) => Promise<void> }
    }
  ).locks
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
  if (isGuestMode() || !operations.length) return
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
  localStorage.setItem(`${PENDING}${order.toString().padStart(16, '0')}:${id}`, JSON.stringify({ id, operations }))
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
  publish(applyStudyPlanClocks({ ...current, startDate: next.startDate, minutes: next.minutes, minimumMode: next.minimumMode }, operations))
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

export function recordFocusSession(input: Omit<FocusSessionRecord, 'id'> & { id?: string }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day)) throw new Error('INVALID_FOCUS_DAY')
  if (!/^[a-z][a-z0-9-]{0,79}$/.test(input.taskId)) throw new Error('INVALID_FOCUS_TASK')
  if (!input.title.trim() || input.title.length > 160) throw new Error('INVALID_FOCUS_TITLE')
  if (!Number.isInteger(input.minutes) || input.minutes < 1 || input.minutes > 240) throw new Error('INVALID_FOCUS_MINUTES')
  if (!Number.isSafeInteger(input.endedAt) || input.endedAt < 0 || input.endedAt > 9999999999999) throw new Error('INVALID_FOCUS_TIMESTAMP')

  const session: FocusSessionRecord = {
    id: input.id ?? crypto.randomUUID(),
    day: input.day,
    taskId: input.taskId,
    title: input.title.trim(),
    minutes: input.minutes,
    endedAt: input.endedAt,
  }
  const updatedAt = input.endedAt
  const current = ensureFallback()
  const operations: Operation[] = [
    { kind: 'increment', day: session.day, task: session.taskId, value: session.minutes, updatedAt },
    { kind: 'focusSession', value: session },
  ]
  enqueue(operations)
  const focusSessions = [...current.learning.focusSessions.filter((item) => item.id !== session.id), session].slice(-MAX_FOCUS_SESSIONS)
  publish({
    ...current,
    minutes: {
      ...current.minutes,
      [session.day]: {
        ...(current.minutes[session.day] ?? {}),
        [session.taskId]: (current.minutes[session.day]?.[session.taskId] ?? 0) + session.minutes,
      },
    },
    learning: { ...current.learning, focusSessions },
  })
  return session
}

export function recordTcfAttempt(input: Omit<TcfAttemptRecord, 'id' | 'day'> & { id?: string; day?: string }) {
  if (!['listening', 'reading'].includes(input.skill)) throw new Error('INVALID_TCF_SKILL')
  if (!Number.isInteger(input.questionCount) || input.questionCount !== 39) throw new Error('INVALID_TCF_QUESTION_COUNT')
  if (!Array.isArray(input.answers) || input.answers.length !== input.questionCount) throw new Error('INVALID_TCF_ANSWERS')
  if (
    input.answers.some(
      (answer) =>
        !answer ||
        typeof answer.questionId !== 'string' ||
        answer.questionId.length > 80 ||
        !(answer.choice === null || (Number.isInteger(answer.choice) && answer.choice >= 0 && answer.choice <= 3)) ||
        typeof answer.correct !== 'boolean',
    )
  )
    throw new Error('INVALID_TCF_ANSWERS')
  if (
    typeof input.correctCount !== 'number' ||
    !Number.isInteger(input.correctCount) ||
    input.correctCount < 0 ||
    input.correctCount > input.questionCount
  )
    throw new Error('INVALID_TCF_SCORE')
  if (!Number.isInteger(input.scaledScore) || input.scaledScore < 0 || input.scaledScore > 699) throw new Error('INVALID_TCF_SCORE')
  if (!Number.isInteger(input.nclc) || input.nclc < 0 || input.nclc > 10) throw new Error('INVALID_TCF_NCLC')
  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 0 || input.durationSeconds > 3600)
    throw new Error('INVALID_TCF_DURATION')
  if (
    !Number.isSafeInteger(input.startedAt) ||
    !Number.isSafeInteger(input.finishedAt) ||
    input.startedAt < 0 ||
    input.finishedAt < input.startedAt
  )
    throw new Error('INVALID_TCF_TIMESTAMP')

  const attempt: TcfAttemptRecord = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    day: input.day ?? localDay(input.finishedAt),
    answers: input.answers.map((answer) => ({ ...answer })),
  }
  optimisticOperation({ kind: 'tcfAttempt', value: attempt }, (state) => {
    const attempts = [...state.learning.tcfAttempts.filter((item) => item.id !== attempt.id), attempt]
      .sort((a, b) => a.finishedAt - b.finishedAt || a.id.localeCompare(b.id))
      .slice(-MAX_TCF_ATTEMPTS)
    return { ...state, learning: { ...state.learning, tcfAttempts: attempts } }
  })
  return attempt
}

const MAX_PLACEMENT_HISTORY = 5

export type PlacementResultInput = {
  id?: string
  startedAt: number
  finishedAt: number
  day?: string
  durationSeconds: number
  answers: { questionId: string; choiceIndex: number }[]
}

export function recordPlacementResult(input: PlacementResultInput): PlacementResult {
  if (!Array.isArray(input.answers) || input.answers.length === 0) throw new Error('INVALID_PLACEMENT_ANSWERS')
  const result = computePlacementResult({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    day: input.day ?? localDay(input.finishedAt),
  }) as PlacementResult

  optimisticOperation({ kind: 'placementResult', value: result }, (state) => {
    const history = [...state.learning.placement.history.filter((item) => item.id !== result.id), result]
      .sort((a, b) => a.finishedAt - b.finishedAt || a.id.localeCompare(b.id))
      .slice(-MAX_PLACEMENT_HISTORY)
    return {
      ...state,
      learning: {
        ...state.learning,
        placement: { latest: result, history },
      },
    }
  })
  return result
}

export type EchelleCheckInput = {
  itemId: string
  answers?: string[]
  response?: { selfChecks: boolean[]; wordCount?: number; seconds?: number }
  /** When the server has AI scoring enabled, a self-assessment is recorded but never counts as mastery. */
  aiRequired?: boolean
}

export function recordEchelleMastery(input: EchelleCheckInput) {
  const result = scoreEchelleItem(input.itemId, input.answers, input.response)
  if (!result) throw new Error('UNKNOWN_ECHELLE_ITEM')
  // The server keeps the newest attempt only, so retries within one millisecond must still move forward.
  const previous = ensureFallback().learning.echelle.items[input.itemId]
  const updatedAt = Math.max(Date.now(), (previous?.updatedAt ?? 0) + 1)
  const operation: Operation = {
    kind: 'echelleCheck',
    itemId: input.itemId,
    updatedAt,
    ...(input.answers ? { answers: input.answers } : {}),
    ...(input.response ? { response: input.response } : {}),
  }

  const production = result.kind === 'production'
  const selfAssess = !(production && input.aiRequired)
  optimisticOperation(operation, (state) => {
    const existing = state.learning.echelle.items[input.itemId]
    const record: EchelleItemRecord = {
      ...nextMemory(existing, result.mastered && selfAssess, updatedAt),
      score: selfAssess ? result.score : 0,
      attempts: (existing?.attempts ?? 0) + 1,
      updatedAt,
      method: production ? 'self' : 'check',
      response: input.answers ?? input.response,
    }
    return {
      ...state,
      learning: {
        ...state.learning,
        echelle: { items: { ...state.learning.echelle.items, [input.itemId]: record } },
      },
    }
  })
  const parsed = parseEchelleItemId(input.itemId)
  if (parsed && (parsed.skill === 'writing' || parsed.skill === 'speaking')) {
    const primaryId = `n${parsed.level}-${parsed.skill}-production`
    if (input.itemId !== primaryId) {
      recordEchelleMastery({ ...input, itemId: primaryId })
    }
  }
  return { ...result, mastered: result.mastered && selfAssess }
}

let echelleAiStatus: Promise<EchelleAiStatus> | undefined

export function loadEchelleAiStatus(): Promise<EchelleAiStatus> {
  echelleAiStatus ??= api('GET', '/echelle/ai')
    .then((payload) => payload as unknown as EchelleAiStatus)
    .catch(() => {
      echelleAiStatus = undefined
      return { enabled: false, provider: null, model: null, rubricVersion: '' }
    })
  return echelleAiStatus
}

export type EchelleEvaluationInput = {
  itemId: string
  text: string
  seconds?: number
  inputMode?: 'typed' | 'speech' | 'manual-transcript'
}

/** Scores a writing/speaking answer on the server; the server writes the result into the learner's state. */
export async function evaluateEchelleProduction(input: EchelleEvaluationInput): Promise<EchelleEvaluation> {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const payload = await api('POST', '/echelle/evaluate', input)
  const state = payload.state as StudyServerState | undefined
  if (state) publish(withLearning(state))
  return payload.evaluation as EchelleEvaluation
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

const stableLegacyUuid = (value: string) => {
  const seeds = [2166136261, 2246822519, 3266489917, 668265263]
  const chunks = seeds.map((seed) => {
    let hash = seed >>> 0
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619) >>> 0
      hash ^= hash >>> 13
    }
    return hash.toString(16).padStart(8, '0')
  })
  const hex = chunks.join('').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const sanitizeLegacyGrammarHistory = (value: unknown): GrammarSessionRecord[] => {
  if (!Array.isArray(value)) return []
  return value.slice(0, 50).flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const row = item as Record<string, unknown>
    const finishedAt = typeof row.finishedAt === 'number' && Number.isFinite(row.finishedAt) ? row.finishedAt : 0
    const score = typeof row.score === 'number' && Number.isInteger(row.score) ? row.score : -1
    const total = typeof row.total === 'number' && Number.isInteger(row.total) ? row.total : -1
    if (finishedAt <= 0 || score < 0 || total < score || total > 10000) return []

    const answers = Object.fromEntries(
      Object.entries(row.answers && typeof row.answers === 'object' && !Array.isArray(row.answers) ? row.answers : {}).filter(
        ([key, answer]) => /^\d{1,4}$/.test(key) && (answer === 'A' || answer === 'B'),
      ),
    ) as Record<string, GrammarChoice>
    const reasons = Object.fromEntries(
      Object.entries(row.reasons && typeof row.reasons === 'object' && !Array.isArray(row.reasons) ? row.reasons : {})
        .filter(([key, reason]) => /^\d{1,4}$/.test(key) && typeof reason === 'string')
        .map(([key, reason]) => [key, String(reason).slice(0, 4000)]),
    )

    const topic = typeof row.topic === 'string' ? row.topic.slice(0, 200) : 'passé composé vs imparfait'
    return [
      {
        id: stableLegacyUuid(`grammar|${finishedAt}|${topic}|${score}|${total}|${index}`),
        topic,
        score,
        total,
        elapsedSeconds:
          typeof row.elapsedSeconds === 'number' && Number.isFinite(row.elapsedSeconds)
            ? Math.max(0, Math.min(86400, Math.round(row.elapsedSeconds)))
            : 0,
        finishedAt,
        day: localDay(finishedAt),
        answers,
        reasons,
        outputAnswers: Array.isArray(row.outputAnswers)
          ? row.outputAnswers
              .filter((entry): entry is string => typeof entry === 'string')
              .slice(0, 20)
              .map((entry) => entry.slice(0, 6000))
          : [],
      },
    ]
  })
}

const sanitizeLegacyConjugation = (value: unknown): ConjugationStats => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: ConjugationStats = {}
  for (const [verb, rawTenses] of Object.entries(value as Record<string, unknown>)) {
    if (!verb || verb.length > 120 || !rawTenses || typeof rawTenses !== 'object' || Array.isArray(rawTenses)) continue
    const next: Partial<Record<ConjugationTense, TenseStat>> = {}
    for (const tense of ['present', 'passeCompose', 'imparfait'] as ConjugationTense[]) {
      const raw = (rawTenses as Record<string, unknown>)[tense]
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
      const stat = raw as Record<string, unknown>
      if (
        typeof stat.correct !== 'number' ||
        typeof stat.total !== 'number' ||
        !Number.isInteger(stat.correct) ||
        !Number.isInteger(stat.total)
      )
        continue
      const correct = stat.correct
      const total = stat.total
      if (correct < 0 || total < correct || total > 10000000) continue
      next[tense] = { correct, total }
    }
    if (Object.keys(next).length) result[verb] = next
  }
  return result
}

export function migrateLegacyStudyData(input: { vocabulary?: VocabularyProgressInput[]; grammarHistory?: unknown; conjugation?: unknown }) {
  if (isGuestMode()) return Promise.resolve(false)
  if (legacyMigrationRunning) return legacyMigrationRunning
  legacyMigrationRunning = runLegacyStudyMigration(input).finally(() => {
    legacyMigrationRunning = undefined
  })
  return legacyMigrationRunning
}

async function runLegacyStudyMigration(input: { vocabulary?: VocabularyProgressInput[]; grammarHistory?: unknown; conjugation?: unknown }) {
  try {
    if (localStorage.getItem(LEGACY_MIGRATION_KEY) === 'done') return true
    await syncStudyPlan()
    const state = ensureFallback()
    const operations: Operation[] = []

    const existingVocabulary = new Set(
      state.learning.vocabulary.records.map((item) =>
        [item.word, item.dict, item.chapter ?? -1, item.timeStamp, item.wrongCount].join('|'),
      ),
    )
    const vocabulary = (input.vocabulary ?? []).slice(-MAX_VOCAB_RECORDS).flatMap((item, index) => {
      if (!item.word || !item.dict || !Number.isFinite(item.timeStamp) || item.timeStamp < 0) return []
      const signature = [item.word, item.dict, item.chapter ?? -1, item.timeStamp, item.wrongCount].join('|')
      if (existingVocabulary.has(signature)) return []
      existingVocabulary.add(signature)
      return [
        {
          ...item,
          id: item.id ?? stableLegacyUuid(`vocabulary|${signature}|${index}`),
          day: item.day ?? localDay(item.timeStamp * 1000),
          durationMs: Math.max(0, Math.min(86400000, Math.round(item.durationMs))),
          wrongCount: Math.max(0, Math.min(10000, Math.round(item.wrongCount))),
          wrongKeys: item.wrongKeys
            .filter((key) => typeof key === 'string')
            .slice(0, 200)
            .map((key) => key.slice(0, 20)),
        } satisfies VocabularyProgressRecord,
      ]
    })
    if (vocabulary.length) operations.push({ kind: 'vocabularyRecords', value: vocabulary })

    const grammar = sanitizeLegacyGrammarHistory(input.grammarHistory)
    const existingGrammar = new Set(
      state.learning.grammar.history.map((item) => [item.topic, item.finishedAt, item.score, item.total].join('|')),
    )
    const grammarAdditions = grammar.filter((item) => {
      const signature = [item.topic, item.finishedAt, item.score, item.total].join('|')
      if (existingGrammar.has(signature)) return false
      existingGrammar.add(signature)
      return true
    })
    grammarAdditions.forEach((value) => operations.push({ kind: 'grammarSession', value }))

    const legacyConjugation = sanitizeLegacyConjugation(input.conjugation)
    const remoteConjugationTotal = Object.values(state.learning.conjugation).reduce(
      (sum, byTense) => sum + Object.values(byTense).reduce((inner, stat) => inner + (stat?.total ?? 0), 0),
      0,
    )
    const legacyConjugationTotal = Object.values(legacyConjugation).reduce(
      (sum, byTense) => sum + Object.values(byTense).reduce((inner, stat) => inner + (stat?.total ?? 0), 0),
      0,
    )
    if (remoteConjugationTotal === 0 && legacyConjugationTotal > 0) operations.push({ kind: 'conjugationSeed', value: legacyConjugation })

    if (operations.length) {
      const current = ensureFallback()
      enqueue(operations)
      let learning = current.learning
      if (vocabulary.length) {
        learning = {
          ...learning,
          vocabulary: {
            records: [...learning.vocabulary.records, ...vocabulary].slice(-MAX_VOCAB_RECORDS),
          },
        }
      }
      if (grammarAdditions.length) {
        learning = {
          ...learning,
          grammar: {
            ...learning.grammar,
            history: [...grammarAdditions, ...learning.grammar.history].slice(0, 50),
          },
        }
      }
      if (remoteConjugationTotal === 0 && legacyConjugationTotal > 0) learning = { ...learning, conjugation: legacyConjugation }
      publish({ ...current, learning })
    }

    await syncStudyPlan()
    if (pending().length === 0) {
      localStorage.setItem(LEGACY_MIGRATION_KEY, 'done')
      return true
    }
    return false
  } catch {
    return false
  }
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

export function recordConjugationAttempt(verb: string, tense: ConjugationTense, correct: boolean, day = localDay()) {
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

export function subscribeStudyPlan(listener: (state: StudyPlanStorage) => void, status: (message: string) => void) {
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
    version: 5
    schemaVersion: 6
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

export async function loadStudyAnalytics(options: { sync?: boolean } = {}): Promise<StudyAnalytics | null> {
  if (options.sync !== false) await syncStudyPlan()
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

const normalizePasskeyAccount = (value: unknown): PasskeyAccountInfo => {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  return {
    registered: source.registered === true,
    signedIn: source.signedIn === true,
    passkeyCount: typeof source.passkeyCount === 'number' ? Math.max(0, Math.round(source.passkeyCount)) : 0,
    createdAt: typeof source.createdAt === 'number' ? source.createdAt : undefined,
  }
}

export async function loadPasskeyAccount(): Promise<PasskeyAccountInfo> {
  await syncStudyPlan()
  const payload = await api('GET', '/account')
  return normalizePasskeyAccount(payload)
}

export async function beginPasskeyRegistration(): Promise<Record<string, unknown>> {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const payload = await api('POST', '/passkey/register/options', {})
  if (!payload.options || typeof payload.options !== 'object') throw new Error('PASSKEY_OPTIONS_INVALID')
  return payload.options as Record<string, unknown>
}

export async function finishPasskeyRegistration(credential: unknown): Promise<PasskeyAccountInfo> {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const payload = await api('POST', '/passkey/register/verify', { credential })
  const account = normalizePasskeyAccount(payload.account)
  if (!account.registered) throw new Error('PASSKEY_REGISTRATION_FAILED')
  localStorage.removeItem(SYNC_KEY)
  return account
}

export async function beginPasskeyLogin(): Promise<Record<string, unknown>> {
  if (pending().length) {
    await syncStudyPlan()
    if (pending().length) throw new Error('PENDING_MUTATIONS')
  }
  const payload = await api('POST', '/passkey/login/options', {})
  if (!payload.options || typeof payload.options !== 'object') throw new Error('PASSKEY_OPTIONS_INVALID')
  return payload.options as Record<string, unknown>
}

export async function finishPasskeyLogin(credential: unknown): Promise<{
  state: StudyServerState
  account: PasskeyAccountInfo
}> {
  if (pending().length) {
    await syncStudyPlan()
    if (pending().length) throw new Error('PENDING_MUTATIONS')
  }
  const payload = await api('POST', '/passkey/login/verify', { credential }, 'PASSKEY_LOGIN_FAILED')
  const state = payload.state as StudyPlanStorage | StudyServerState | undefined
  if (!state) throw new Error('PASSKEY_LOGIN_FAILED')
  const normalized = withLearning(state)
  localStorage.removeItem(SYNC_KEY)
  localStorage.removeItem(SEED)
  publish(normalized)
  emitSyncStatus('saved', 'Passkey 登录成功，已恢复服务端学习进度。')
  return { state: normalized, account: normalizePasskeyAccount(payload.account) }
}

export async function downloadStudyCsv(kind: StudyCsvKind): Promise<{ filename: string; text: string }> {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  const paths: Record<StudyCsvKind, string> = {
    records: '/records.csv',
    'error-book': '/error-book.csv',
    'weekly-reports': '/weekly-reports.csv',
  }
  const filenames: Record<StudyCsvKind, string> = {
    records: 'qwerty-study-records.csv',
    'error-book': 'qwerty-study-error-book.csv',
    'weekly-reports': 'qwerty-study-weekly-reports.csv',
  }
  return { filename: filenames[kind], text: await apiText('GET', paths[kind]) }
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

export async function loadErrorBook(
  filters: {
    type?: ReviewKind | ''
    status?: 'active' | 'mastered' | 'all'
    from?: string
    to?: string
    limit?: number
  } = {},
): Promise<ErrorBookItem[]> {
  await syncStudyPlan()
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.limit) params.set('limit', String(filters.limit))
  const payload = await api('GET', `/error-book?${params.toString()}`)
  return Array.isArray(payload.items) ? (payload.items as ErrorBookItem[]) : []
}

export async function loadStudyCheckins(today = localDay()): Promise<StudyCheckinSummary> {
  await syncStudyPlan()
  const payload = await api('GET', `/checkins?today=${encodeURIComponent(today)}`)
  return {
    items: Array.isArray(payload.items) ? (payload.items as StudyCheckin[]) : [],
    daily: Array.isArray(payload.daily) ? (payload.daily as StudyCheckinDay[]) : [],
    streak:
      payload.streak && typeof payload.streak === 'object' ? (payload.streak as StudyCheckinSummary['streak']) : { current: 0, longest: 0 },
  }
}

export async function applyStudyMakeup(day: string): Promise<StudyCheckinSummary> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('INVALID_MAKEUP_DAY')
  await syncStudyPlan()
  const payload = await api('POST', '/checkins/makeup', { day })
  return {
    items: Array.isArray(payload.items) ? (payload.items as StudyCheckin[]) : [],
    daily: Array.isArray(payload.daily) ? (payload.daily as StudyCheckinDay[]) : [],
    streak:
      payload.streak && typeof payload.streak === 'object' ? (payload.streak as StudyCheckinSummary['streak']) : { current: 0, longest: 0 },
  }
}

export async function loadStudyAchievements(): Promise<StudyAchievement[]> {
  await syncStudyPlan()
  const payload = await api('GET', '/achievements')
  return Array.isArray(payload.items) ? (payload.items as StudyAchievement[]) : []
}

export async function loadTcfAttempts(skill?: TcfSkill, limit = 100): Promise<TcfAttemptRecord[]> {
  await syncStudyPlan()
  const query = new URLSearchParams()
  if (skill) query.set('skill', skill)
  query.set('limit', String(Math.min(120, Math.max(1, Math.round(limit)))))
  const payload = await api('GET', `/tcf-attempts?${query.toString()}`)
  return Array.isArray(payload.items) ? (payload.items as TcfAttemptRecord[]) : []
}

export async function loadWeeklyStudyReports(limit = 26): Promise<WeeklyStudyReport[]> {
  await syncStudyPlan()
  const payload = await api('GET', `/weekly-reports?limit=${Math.min(26, Math.max(1, Math.round(limit)))}`)
  return Array.isArray(payload.items) ? (payload.items as WeeklyStudyReport[]) : []
}

export async function exportWeeklyStudyReports() {
  await syncStudyPlan()
  return api('GET', '/weekly-reports/export?limit=26') as Promise<{
    format: 'qwerty-study-weekly-reports'
    version: 1
    exportedAt: string
    items: WeeklyStudyReport[]
  }>
}

export const TCF_EE_DRAFT_KEY = 'qwerty-tcf-ee-draft'
export const TCF_EE_ATTEMPTS_KEY = 'qwerty-tcf-ee-attempts'
export const TCF_EO_ATTEMPTS_KEY = 'qwerty-tcf-eo-attempts'

export async function loadTcfEeDraft(): Promise<TcfEeDraft | null> {
  try {
    const payload = await api('GET', '/tcf-writing/draft')
    if (payload.draft) {
      localStorage.setItem(TCF_EE_DRAFT_KEY, JSON.stringify(payload.draft))
      return payload.draft as TcfEeDraft
    }
  } catch {
    // Fall back to local draft
  }
  try {
    const cached = localStorage.getItem(TCF_EE_DRAFT_KEY)
    return cached ? (JSON.parse(cached) as TcfEeDraft) : null
  } catch {
    return null
  }
}

export async function saveTcfEeDraft(draft: TcfEeDraft): Promise<void> {
  try {
    localStorage.setItem(TCF_EE_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    void 0
  }
  try {
    await api('POST', '/tcf-writing/draft', { draft })
  } catch {
    // Offline auto-save fallback
  }
}

export async function deleteTcfEeDraft(): Promise<void> {
  try {
    localStorage.removeItem(TCF_EE_DRAFT_KEY)
  } catch {
    void 0
  }
  try {
    await api('DELETE', '/tcf-writing/draft')
  } catch {
    void 0
  }
}

export async function submitTcfEeAttempt(attempt: TcfEeAttempt): Promise<TcfEeAttempt> {
  try {
    localStorage.removeItem(TCF_EE_DRAFT_KEY)
  } catch {
    void 0
  }
  try {
    const listRaw = localStorage.getItem(TCF_EE_ATTEMPTS_KEY)
    const list = listRaw ? (JSON.parse(listRaw) as TcfEeAttempt[]) : []
    const updated = [attempt, ...list.filter((item) => item.id !== attempt.id)].slice(0, 50)
    localStorage.setItem(TCF_EE_ATTEMPTS_KEY, JSON.stringify(updated))
  } catch {
    void 0
  }
  try {
    const res = await api('POST', '/tcf-writing', attempt)
    return (res.attempt as TcfEeAttempt) ?? attempt
  } catch {
    return attempt
  }
}

export async function loadTcfEeAttempts(limit = 100): Promise<TcfEeAttempt[]> {
  try {
    const payload = await api('GET', `/tcf-writing?limit=${Math.min(100, Math.max(1, limit))}`)
    if (Array.isArray(payload.items)) {
      try {
        localStorage.setItem(TCF_EE_ATTEMPTS_KEY, JSON.stringify(payload.items))
      } catch {
        void 0
      }
      return payload.items as TcfEeAttempt[]
    }
  } catch {
    void 0
  }
  try {
    const cached = localStorage.getItem(TCF_EE_ATTEMPTS_KEY)
    return cached ? (JSON.parse(cached) as TcfEeAttempt[]) : []
  } catch {
    return []
  }
}

export async function saveTcfEoAttempt(attempt: TcfEoAttempt): Promise<TcfEoAttempt> {
  try {
    const listRaw = localStorage.getItem(TCF_EO_ATTEMPTS_KEY)
    const list = listRaw ? (JSON.parse(listRaw) as TcfEoAttempt[]) : []
    const updated = [attempt, ...list.filter((item) => item.id !== attempt.id)].slice(0, 50)
    localStorage.setItem(TCF_EO_ATTEMPTS_KEY, JSON.stringify(updated))
  } catch {
    void 0
  }
  try {
    const res = await api('POST', '/tcf-speaking', attempt)
    return (res.attempt as TcfEoAttempt) ?? attempt
  } catch {
    return attempt
  }
}

export async function loadTcfEoAttempts(limit = 100): Promise<TcfEoAttempt[]> {
  try {
    const payload = await api('GET', `/tcf-speaking?limit=${Math.min(100, Math.max(1, limit))}`)
    if (Array.isArray(payload.items)) {
      try {
        localStorage.setItem(TCF_EO_ATTEMPTS_KEY, JSON.stringify(payload.items))
      } catch {
        void 0
      }
      return payload.items as TcfEoAttempt[]
    }
  } catch {
    void 0
  }
  try {
    const cached = localStorage.getItem(TCF_EO_ATTEMPTS_KEY)
    return cached ? (JSON.parse(cached) as TcfEoAttempt[]) : []
  } catch {
    return []
  }
}

export async function deleteTcfEoAttempt(id: string): Promise<boolean> {
  try {
    const listRaw = localStorage.getItem(TCF_EO_ATTEMPTS_KEY)
    if (listRaw) {
      const list = (JSON.parse(listRaw) as TcfEoAttempt[]).filter((item) => item.id !== id)
      localStorage.setItem(TCF_EO_ATTEMPTS_KEY, JSON.stringify(list))
    }
  } catch {
    void 0
  }
  try {
    await api('DELETE', `/tcf-speaking?id=${encodeURIComponent(id)}`)
    return true
  } catch {
    return false
  }
}

export type LearnerCohortBinding = {
  cohortId: string
  name: string
  joinedAt: number
}

export async function loadLearnerCohort(): Promise<LearnerCohortBinding | null> {
  const payload = await api('GET', '/cohort')
  const cohort = payload.cohort as LearnerCohortBinding | null
  return cohort ?? null
}

export async function joinCohort(code: string): Promise<LearnerCohortBinding> {
  const payload = await api('POST', '/cohort/join', { code })
  return payload.cohort as LearnerCohortBinding
}

export async function deleteAllStudyData() {
  await syncStudyPlan()
  if (pending().length) throw new Error('PENDING_MUTATIONS')
  await api('DELETE', '/data', { confirm: 'DELETE' })
  for (const key of Object.keys(localStorage)) {
    if (
      key === KEY ||
      key === ANALYTICS_KEY ||
      key === REVIEW_KEY ||
      key === SYNC_KEY ||
      key === LEGACY_MIGRATION_KEY ||
      key === SEED ||
      key === TCF_EE_DRAFT_KEY ||
      key === TCF_EE_ATTEMPTS_KEY ||
      key === TCF_EO_ATTEMPTS_KEY ||
      isPendingKey(key)
    ) {
      localStorage.removeItem(key)
    }
  }
  fallback = undefined
  emitSyncStatus('idle', '学习数据已删除')
  return true
}
