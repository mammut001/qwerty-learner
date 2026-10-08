import Layout from '@/components/Layout'
import { CHAPTER_LENGTH } from '@/constants'
import { idDictionaryMap } from '@/resources/dictionary'
import { COMMUNICATION_TYPES, ECHELLE_TARGET_LEVEL, PHASE_ECHELLE_TARGET, getEchelleLevel } from '@/resources/echelleQuebecoise'
import { placementRetestDue } from '@/resources/placementHelpers'
import {
  type StudyTask,
  type StudyTaskKind,
  getDayPlan,
  getStudyPhase,
  minimumModeTasks,
  studyPhases,
  weeklyStudyPlan,
} from '@/resources/studyPlan'
import {
  type StudyPlanSettings,
  configuredWeeklyTargetMinutes,
  getConfiguredDayTasks,
  normalizeStudyPlanSettings,
} from '@/resources/studyPlanSchedule'
import { type FocusTimerSnapshot, getFocusTimerSnapshot, startFocusTimer, subscribeFocusTimer } from '@/services/focusTimer'
import { loginWithStudyPasskey, passkeyAvailable, registerStudyPasskey } from '@/services/passkey'
import { type PwaInstallState, getPwaInstallState, installStudyPwa, subscribePwaInstallState } from '@/services/pwa'
import {
  type LearnerCohortBinding,
  type LearningProgress,
  type PasskeyAccountInfo,
  type StudyAnalytics,
  type StudyPlanStorage,
  type StudyServerState,
  type StudySyncInfo,
  type StudySyncStatus,
  createStudySyncKey,
  deleteAllStudyData,
  exportRemoteStudyPlan,
  getLearningProgress,
  getStoredStudySyncKey,
  importRemoteStudyPlan,
  joinCohort,
  linkStudyDevice,
  loadLearnerCohort,
  loadPasskeyAccount,
  loadStudyAnalytics,
  loadStudySyncInfo,
  revokeStudySyncKey,
  saveStudyPlan,
  saveStudyPlanSettings,
  subscribeLearningProgress,
  subscribeStudyPlan,
  subscribeStudySyncStatus,
  syncStudyPlan,
  unlinkStudyDevice,
} from '@/services/studyPlanSync'
import {
  type StudyReminderPreferences,
  getStudyReminderPreferences,
  requestStudyReminderPermission,
  saveStudyReminderPreferences,
} from '@/services/studyReminder'
import { customDictsAtom } from '@/store/customDict'
import { db } from '@/utils/db'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useAtomValue } from 'jotai'
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import useSWR from 'swr'
import IconCalendar from '~icons/tabler/calendar'
import IconCheck from '~icons/tabler/check'
import IconClock from '~icons/tabler/clock'
import IconPlayerPlay from '~icons/tabler/player-play'

type PreviewErrorWordsState = {
  dictId: string
  status: 'loading' | 'ready' | 'error'
  words: Set<string>
  error: string
}

const STORAGE_KEY = 'qwerty-fr-study-plan-v1'
const DAY_MS = 24 * 60 * 60 * 1000
const PREVIEW_PAGE_SIZE = 20

const weekDictionaryIds: Record<number, string> = {
  1: 'tcf-canada-foundation-01',
  2: 'tcf-grammar-passe-compose-core',
  3: 'tcf-grammar-pc-vs-imparfait',
  4: 'tcf-a1-a2-people-routine',
  5: 'tcf-canada-work-study-admin',
  6: 'tcf-canada-b1-connectors',
  7: 'tcf-b1-verbs-prepositions',
  8: 'tcf-b1-services-society',
  9: 'tcf-canada-b2-opinion',
  10: 'tcf-b2-abstract-nouns',
  11: 'tcf-b2-collocations',
  12: 'tcf-canada-oral-writing',
  13: 'tcf-canada-oral-writing',
  14: 'tcf-oral-questions',
  15: 'tcf-writing-formal',
  16: 'tcf-canada-b2-opinion',
  17: 'tcf-canada-oral-writing',
  18: 'tcf-b2-collocations',
  19: 'tcf-oral-questions',
  20: 'tcf-writing-formal',
  21: 'tcf-canada-b2-opinion',
  22: 'tcf-canada-oral-writing',
  23: 'tcf-oral-questions',
  24: 'tcf-writing-formal',
  25: 'tcf-b2-abstract-nouns',
  26: 'tcf-b2-collocations',
}

const smartKindLabels: Record<string, string> = {
  review: '复习',
  vocabulary: '词汇',
  grammar: '语法',
  conjugation: '变位',
  placement: '定级',
  reading: '阅读',
  listening: '听力',
}

const kindLabels: Record<StudyTaskKind, string> = {
  grammar: '语法',
  listening: '听力',
  vocabulary: '词汇',
  reading: '阅读',
  writing: '写作',
  speaking: '口语',
  pronunciation: '发音',
  tcf: 'TCF',
  review: '复习',
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toDateKey(parseDateKey(value)) === value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseImportedStorage(value: unknown): StudyPlanStorage | StudyServerState | null {
  if (!isRecord(value)) return null
  if (!Object.prototype.hasOwnProperty.call(value, 'startDate')) return null
  if (!Object.prototype.hasOwnProperty.call(value, 'minutes')) return null
  if (!Object.prototype.hasOwnProperty.call(value, 'minimumMode')) return null
  if (!isDateKey(value.startDate) || !isRecord(value.minutes) || !isRecord(value.minimumMode)) return null

  const minutes: StudyPlanStorage['minutes'] = {}
  for (const [dateKey, dayValue] of Object.entries(value.minutes)) {
    if (!isDateKey(dateKey) || !isRecord(dayValue)) return null

    const dayMinutes: Record<string, number> = {}
    for (const [taskId, minuteValue] of Object.entries(dayValue)) {
      if (
        !/^[a-z][a-z0-9-]{0,79}$/.test(taskId) ||
        typeof minuteValue !== 'number' ||
        !Number.isFinite(minuteValue) ||
        minuteValue < 0 ||
        minuteValue > 1000000
      )
        return null
      dayMinutes[taskId] = minuteValue
    }
    minutes[dateKey] = dayMinutes
  }

  const minimumMode: StudyPlanStorage['minimumMode'] = {}
  for (const [dateKey, modeValue] of Object.entries(value.minimumMode)) {
    if (!isDateKey(dateKey) || typeof modeValue !== 'boolean') return null
    minimumMode[dateKey] = modeValue
  }

  const imported: StudyPlanStorage | StudyServerState = {
    startDate: value.startDate,
    settings: normalizeStudyPlanSettings(
      isRecord(value.settings) ? (value.settings as Partial<StudyPlanSettings>) : undefined,
      value.startDate,
    ),
    minutes,
    minimumMode,
  }
  if (isRecord(value.learning)) {
    ;(imported as StudyServerState).learning = value.learning as unknown as LearningProgress
  }
  if (isRecord(value.syncMeta)) {
    ;(imported as StudyServerState).syncMeta = value.syncMeta as StudyServerState['syncMeta']
  }
  return imported
}

function countRecordedMinuteDays(minutes: StudyPlanStorage['minutes']) {
  return Object.values(minutes).filter((dayMinutes) => Object.values(dayMinutes).some((value) => value > 0)).length
}

function loadStorage(todayKey: string): StudyPlanStorage {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StudyPlanStorage>
      const startDate = parsed.startDate ?? todayKey
      return {
        startDate,
        settings: normalizeStudyPlanSettings(parsed.settings, startDate),
        minutes: parsed.minutes ?? {},
        minimumMode: parsed.minimumMode ?? {},
      }
    }
  } catch {
    // Ignore malformed local storage and start clean.
  }

  return {
    startDate: todayKey,
    settings: normalizeStudyPlanSettings(undefined, todayKey),
    minutes: {},
    minimumMode: {},
  }
}

function addDays(date: Date, amount: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + amount)
  return next
}

function calendarDayNumber(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
}

function PhaseEchelleTarget({ phaseId }: { phaseId: number }) {
  const level = PHASE_ECHELLE_TARGET[phaseId] ?? ECHELLE_TARGET_LEVEL
  const speaking = getEchelleLevel('speaking', level)
  const grammar = Array.from(new Set([...speaking.dimensions.phrase, ...getEchelleLevel('writing', level).dimensions.phrase])).slice(0, 5)
  return (
    <NavLink
      to={`/echelle?skill=speaking&level=${level}`}
      data-testid="study-phase-echelle"
      className="mt-4 block rounded-2xl border border-gray-200/70 bg-white/70 p-4 text-sm no-underline transition hover:border-indigo-200 hover:no-underline dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-indigo-400/30"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="ui-chip-accent">量表目标 Niveau {level}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {speaking.type} · {COMMUNICATION_TYPES[speaking.type]?.zh}交流 · 本阶段要稳定的语法
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {grammar.map((item) => (
          <span key={item} className="ui-chip text-[11px]">
            {item}
          </span>
        ))}
      </div>
    </NavLink>
  )
}

function LevelsLink() {
  return (
    <NavLink
      to="/levels"
      data-testid="study-levels-link"
      className="mt-3 block rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-4 text-sm no-underline transition hover:border-indigo-300 hover:bg-indigo-50/70 hover:no-underline dark:border-indigo-400/20 dark:bg-indigo-900/10 dark:hover:border-indigo-400/40"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-indigo-700 dark:text-indigo-300">按等级课程逐项学习</span>
        <span className="text-indigo-600 dark:text-indigo-300">→</span>
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Niveau 1–12 听力、阅读、书面表达、口语表达、词汇、语法/篇章知识点，逐级达标。
      </div>
    </NavLink>
  )
}

function minutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export default function StudyPlanPage() {
  const today = useMemo(() => new Date(), [])
  const todayKey = toDateKey(today)
  const [storage, setStorage] = useState<StudyPlanStorage>(() => loadStorage(todayKey))
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState('')
  const [pendingImport, setPendingImport] = useState<StudyPlanStorage | StudyServerState | null>(null)
  const [highlightedMissedDayKey, setHighlightedMissedDayKey] = useState<string | null>(null)
  const [learning, setLearning] = useState<LearningProgress | null>(null)
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)
  const [syncKey, setSyncKey] = useState(() => getStoredStudySyncKey())
  const [syncKeyInput, setSyncKeyInput] = useState(() => getStoredStudySyncKey())
  const [syncInfo, setSyncInfo] = useState<StudySyncInfo>({ bound: false, activeKeys: 0 })
  const [accountInfo, setAccountInfo] = useState<PasskeyAccountInfo>({
    registered: false,
    signedIn: false,
    passkeyCount: 0,
  })
  const [focusTaskId, setFocusTaskId] = useState('')
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [focusSnapshot, setFocusSnapshot] = useState<FocusTimerSnapshot | null>(() => getFocusTimerSnapshot())
  const [syncStatus, setSyncStatus] = useState<StudySyncStatus>({
    phase: 'idle',
    pending: 0,
    message: '尚未同步',
  })
  const [dailyTargetInput, setDailyTargetInput] = useState(
    storage.settings.dailyTargetMinutes === null ? '' : String(storage.settings.dailyTargetMinutes),
  )
  const [reminderPreferences, setReminderPreferences] = useState<StudyReminderPreferences>(() => getStudyReminderPreferences())
  const [pwaState, setPwaState] = useState<PwaInstallState>(() => getPwaInstallState())
  const [placementPreviewAppliedId, setPlacementPreviewAppliedId] = useState<string | null>(null)
  const [learnerCohort, setLearnerCohort] = useState<LearnerCohortBinding | null>(null)
  const [cohortJoinInput, setCohortJoinInput] = useState('')
  const [cohortJoinMessage, setCohortJoinMessage] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeStudyPlan(setStorage, setImportMessage)
    const unsubscribeLearning = subscribeLearningProgress(setLearning)
    const unsubscribeStatus = subscribeStudySyncStatus(setSyncStatus)
    void syncStudyPlan(loadStorage(todayKey)).then(() => {
      void getLearningProgress().then(setLearning)
      void loadStudySyncInfo()
        .then(setSyncInfo)
        .catch(() => undefined)
      void loadPasskeyAccount()
        .then(setAccountInfo)
        .catch(() => undefined)
      void loadLearnerCohort()
        .then(setLearnerCohort)
        .catch(() => undefined)
    })
    return () => {
      unsubscribe()
      unsubscribeLearning()
      unsubscribeStatus()
    }
  }, [todayKey])

  useEffect(() => {
    setDailyTargetInput(storage.settings.dailyTargetMinutes === null ? '' : String(storage.settings.dailyTargetMinutes))
  }, [storage.settings.dailyTargetMinutes])

  useEffect(() => {
    const unsubscribe = subscribePwaInstallState(setPwaState)
    return () => {
      unsubscribe()
    }
  }, [])
  useEffect(() => {
    const unsubscribe = subscribeFocusTimer(setFocusSnapshot)
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      void loadStudyAnalytics({ sync: false })
        .then((value) => {
          if (!cancelled) setAnalytics(value)
        })
        .catch(() => {
          // Existing local summaries remain available while the backend is offline.
        })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [learning, storage])

  const saveStorage = (next: StudyPlanStorage) => {
    try {
      saveStudyPlan(storage, next)
    } catch {
      setImportMessage('无法保存记录，请检查浏览器存储空间后重试。')
    }
  }

  const startDate = parseDateKey(storage.startDate)
  const dayOffset = Math.max(0, calendarDayNumber(today) - calendarDayNumber(startDate))
  const currentWeekIndex = Math.min(25, Math.floor(dayOffset / 7))
  const currentWeek = currentWeekIndex + 1
  const phase = getStudyPhase(currentWeek)
  const phaseStartDate = addDays(startDate, (phase.weeks[0] - 1) * 7)
  const phaseEndDate = addDays(startDate, phase.weeks[1] * 7 - 1)
  const phaseProgress = Math.min(100, Math.round((currentWeek / 26) * 100))
  const targetDictionary = idDictionaryMap[weekDictionaryIds[currentWeek]]
  const placementRecommendedDictionary = useMemo(() => {
    const dictId = learning?.placement?.latest?.recommendations.vocabularyDictIds[0]
    return dictId ? idDictionaryMap[dictId] : undefined
  }, [learning])
  const [previewWeek, setPreviewWeek] = useState(currentWeek)
  const placementGrammarTopicId = learning?.placement?.latest?.recommendations.grammarTopicIds[0]

  useEffect(() => {
    const latest = learning?.placement?.latest
    if (!latest || placementPreviewAppliedId === latest.id) return
    setPreviewWeek(latest.recommendations.suggestedStartWeek)
    setPlacementPreviewAppliedId(latest.id)
  }, [learning?.placement?.latest, placementPreviewAppliedId])

  const [previewFilter, setPreviewFilter] = useState('')
  const [onlyMistakenPreviewWords, setOnlyMistakenPreviewWords] = useState(false)
  const [selectedMistakeChapter, setSelectedMistakeChapter] = useState<number | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [previewErrorWordsState, setPreviewErrorWordsState] = useState<PreviewErrorWordsState>({
    dictId: '',
    status: 'loading',
    words: new Set(),
    error: '',
  })
  const previewDictionary = idDictionaryMap[weekDictionaryIds[previewWeek]]
  const previewWeekStart = addDays(startDate, (previewWeek - 1) * 7)
  const previewWeekEnd = addDays(previewWeekStart, 6)
  const {
    data: previewWordList,
    error: previewWordListError,
    isLoading: isPreviewWordListLoading,
  } = useSWR(previewDictionary?.url ?? null, wordListFetcher)

  const normalizedPreviewFilter = previewFilter.trim().toLocaleLowerCase()
  const previewFilterCount =
    Number(Boolean(normalizedPreviewFilter)) + Number(onlyMistakenPreviewWords) + Number(selectedMistakeChapter !== null)
  const hasPreviewFilters = previewFilterCount > 0
  const clearPreviewFilters = () => {
    setPreviewFilter('')
    setOnlyMistakenPreviewWords(false)
    setSelectedMistakeChapter(null)
    setPreviewPage(1)
  }
  const filteredPreviewWords = normalizedPreviewFilter
    ? (previewWordList ?? []).filter((word) =>
        [word.name, word.notation ?? '', ...word.trans].some((value) => value.toLocaleLowerCase().includes(normalizedPreviewFilter)),
      )
    : previewWordList ?? []

  useEffect(() => {
    setPreviewWeek(currentWeek)
  }, [currentWeek])

  useEffect(() => {
    setPreviewFilter('')
    setOnlyMistakenPreviewWords(false)
    setSelectedMistakeChapter(null)
    setPreviewPage(1)
  }, [previewWeek])

  useEffect(() => {
    const dictId = previewDictionary?.id
    if (!dictId) {
      setPreviewErrorWordsState({
        dictId: '',
        status: 'error',
        words: new Set(),
        error: '找不到正在预览的词库。',
      })
      return
    }

    let cancelled = false
    setPreviewErrorWordsState({
      dictId,
      status: 'loading',
      words: new Set(),
      error: '',
    })

    if (learning && learning.vocabulary.records.length > 0) {
      setPreviewErrorWordsState({
        dictId,
        status: 'ready',
        words: new Set(
          learning.vocabulary.records.filter((record) => record.dict === dictId && record.wrongCount > 0).map((record) => record.word),
        ),
        error: '',
      })
      return () => {
        cancelled = true
      }
    }

    db.wordRecords
      .where('dict')
      .equals(dictId)
      .and((record) => record.wrongCount > 0)
      .toArray()
      .then((records) => {
        if (cancelled) return
        setPreviewErrorWordsState({
          dictId,
          status: 'ready',
          words: new Set(records.map((record) => record.word)),
          error: '',
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setPreviewErrorWordsState({
          dictId,
          status: 'error',
          words: new Set(),
          error: error instanceof Error ? error.message : '读取错题记录失败。',
        })
      })

    return () => {
      cancelled = true
    }
  }, [learning, previewDictionary?.id, previewWeek])

  const previewErrorWordsStatus = previewErrorWordsState.dictId === previewDictionary?.id ? previewErrorWordsState.status : 'loading'
  const previewErrorWords = previewErrorWordsStatus === 'ready' ? previewErrorWordsState.words : new Set<string>()
  const previewMistakeSummary =
    previewErrorWordsStatus === 'ready' && !isPreviewWordListLoading && !previewWordListError && previewWordList
      ? (() => {
          const seenWordNames = new Set<string>()
          const chapterCounts = new Map<number, number>()
          let total = 0

          previewWordList.forEach((word, index) => {
            if (seenWordNames.has(word.name)) return
            seenWordNames.add(word.name)
            if (!previewErrorWords.has(word.name)) return

            total += 1
            const chapter = Math.floor(index / CHAPTER_LENGTH) + 1
            chapterCounts.set(chapter, (chapterCounts.get(chapter) ?? 0) + 1)
          })

          return {
            total,
            chapters: Array.from(chapterCounts.entries()).map(([chapter, count]) => ({ chapter, count })),
          }
        })()
      : null
  const previewMistakenWordCount = previewMistakeSummary?.total ?? null

  useEffect(() => {
    if (selectedMistakeChapter === null) return

    if (previewWordListError || previewErrorWordsStatus === 'error') {
      setSelectedMistakeChapter(null)
      setPreviewPage(1)
      return
    }

    if (!previewMistakeSummary) return

    const selectedChapterStillExists = previewMistakeSummary.chapters.some(({ chapter }) => chapter === selectedMistakeChapter)
    if (!selectedChapterStillExists) {
      setSelectedMistakeChapter(null)
      setPreviewPage(1)
    }
  }, [previewErrorWordsStatus, previewMistakeSummary, previewWordListError, selectedMistakeChapter])

  const isMistakeFilterActive = onlyMistakenPreviewWords && previewErrorWordsStatus === 'ready'
  const isMistakeChapterFilterActive =
    selectedMistakeChapter !== null &&
    previewErrorWordsStatus === 'ready' &&
    !isPreviewWordListLoading &&
    !previewWordListError &&
    Boolean(previewWordList)
  const chapterFilteredPreviewWords = isMistakeChapterFilterActive
    ? filteredPreviewWords.filter((word) => {
        const fullWordIndex = previewWordList?.indexOf(word) ?? -1
        if (fullWordIndex < 0 || !previewErrorWords.has(word.name)) return false
        return Math.floor(fullWordIndex / CHAPTER_LENGTH) + 1 === selectedMistakeChapter
      })
    : filteredPreviewWords
  const matchedPreviewWords = isMistakeFilterActive
    ? chapterFilteredPreviewWords.filter((word) => previewErrorWords.has(word.name))
    : chapterFilteredPreviewWords
  const previewTotalPages = Math.max(1, Math.ceil(matchedPreviewWords.length / PREVIEW_PAGE_SIZE))
  const currentPreviewPage = Math.min(previewPage, previewTotalPages)
  const previewPageStart = (currentPreviewPage - 1) * PREVIEW_PAGE_SIZE
  const previewWords = matchedPreviewWords.slice(previewPageStart, previewPageStart + PREVIEW_PAGE_SIZE)

  const conjugationHref =
    phase.id === 1 ? '/conjugation?verb=prendre&tense=passeCompose&mode=practice&scope=current' : '/conjugation?mode=practice&scope=mixed'
  const todayPlan = getDayPlan(today.getDay())
  const minimumMode = Boolean(storage.minimumMode[todayKey])
  const todayTasks = getConfiguredDayTasks(todayPlan, storage.settings, minimumMode, minimumModeTasks)
  useEffect(() => {
    if (!todayTasks.length) {
      setFocusTaskId('')
      return
    }
    if (!todayTasks.some((task) => task.id === focusTaskId)) setFocusTaskId(todayTasks[0].id)
  }, [focusTaskId, todayTasks])
  const todayVocabularyTask = todayTasks.find((task) => task.kind === 'vocabulary' && task.href === '/gallery')
  const focusOwnsTodayVocabulary = Boolean(
    focusSnapshot && focusSnapshot.day === todayKey && todayVocabularyTask && focusSnapshot.taskId === todayVocabularyTask.id,
  )
  const previewTrackingQuery =
    previewWeek === currentWeek && todayVocabularyTask && !focusOwnsTodayVocabulary
      ? `&studyDate=${todayKey}&studyTask=${todayVocabularyTask.id}`
      : ''
  const previewPracticeHref = previewDictionary
    ? `/typing?dict=${encodeURIComponent(previewDictionary.id)}${previewTrackingQuery}`
    : '/typing'
  const selectedMistakeChapterIndex = selectedMistakeChapter !== null ? selectedMistakeChapter - 1 : null
  const selectedMistakeChapterPracticeHref =
    isMistakeChapterFilterActive &&
    selectedMistakeChapterIndex !== null &&
    Number.isSafeInteger(selectedMistakeChapterIndex) &&
    selectedMistakeChapterIndex >= 0 &&
    previewDictionary &&
    selectedMistakeChapterIndex < previewDictionary.chapterCount
      ? `${previewPracticeHref}&chapter=${selectedMistakeChapterIndex}`
      : null

  const planWeekStart = addDays(startDate, currentWeekIndex * 7)
  const currentPlanWeekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(planWeekStart, index)
    return {
      date,
      key: toDateKey(date),
      day: getDayPlan(date.getDay()),
    }
  })
  const weeklyPlannedMinutes = configuredWeeklyTargetMinutes(weeklyStudyPlan, storage.settings, minimumModeTasks)
  const actualMinutesForTasks = (dateKey: string, tasks: StudyTask[]) =>
    tasks.reduce((sum, task) => sum + (storage.minutes[dateKey]?.[task.id] ?? 0), 0)
  const recordedMinutesForDay = (dateKey: string) => Object.values(storage.minutes[dateKey] ?? {}).reduce((sum, value) => sum + value, 0)

  const weeklyActualMinutes = currentPlanWeekDays.reduce((total, item) => total + recordedMinutesForDay(item.key), 0)
  const weeklyCompletedDays = currentPlanWeekDays.filter((item) => {
    const tasks = getConfiguredDayTasks(item.day, storage.settings, Boolean(storage.minimumMode[item.key]), minimumModeTasks)
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    return plannedMinutes > 0 && actualMinutes >= plannedMinutes
  }).length
  const weeklyMissedDays = currentPlanWeekDays.filter((item) => {
    const tasks = getConfiguredDayTasks(item.day, storage.settings, Boolean(storage.minimumMode[item.key]), minimumModeTasks)
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    const complete = plannedMinutes > 0 && actualMinutes >= plannedMinutes
    return item.key < todayKey && plannedMinutes > 0 && !complete
  }).length
  const earliestMissedDayKey = currentPlanWeekDays.reduce<string | null>((earliest, item) => {
    const tasks = getConfiguredDayTasks(item.day, storage.settings, Boolean(storage.minimumMode[item.key]), minimumModeTasks)
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    const complete = plannedMinutes > 0 && actualMinutes >= plannedMinutes
    const missed = item.key < todayKey && plannedMinutes > 0 && !complete
    if (!missed) return earliest
    return earliest === null || item.key < earliest ? item.key : earliest
  }, null)
  const earliestMissedDayName = currentPlanWeekDays.find((item) => item.key === earliestMissedDayKey)?.day.name ?? null
  const earliestMissedDayRemainingMinutes = (() => {
    const item = currentPlanWeekDays.find((dayItem) => dayItem.key === earliestMissedDayKey)
    if (!item) return null
    const tasks = getConfiguredDayTasks(item.day, storage.settings, Boolean(storage.minimumMode[item.key]), minimumModeTasks)
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    return plannedMinutes - actualMinutes
  })()
  const highlightedMissedDayStillMissed =
    highlightedMissedDayKey !== null &&
    currentPlanWeekDays.some((item) => {
      if (item.key !== highlightedMissedDayKey) return false
      const tasks = getConfiguredDayTasks(item.day, storage.settings, Boolean(storage.minimumMode[item.key]), minimumModeTasks)
      const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
      const actualMinutes = actualMinutesForTasks(item.key, tasks)
      const complete = plannedMinutes > 0 && actualMinutes >= plannedMinutes
      return item.key < todayKey && plannedMinutes > 0 && !complete
    })

  useEffect(() => {
    if (highlightedMissedDayKey === null) return
    if (weeklyMissedDays === 0 || !highlightedMissedDayStillMissed) {
      setHighlightedMissedDayKey(null)
    }
  }, [highlightedMissedDayKey, highlightedMissedDayStillMissed, weeklyMissedDays])

  const todayActualMinutes = recordedMinutesForDay(todayKey)
  const todayPlannedMinutes = todayTasks.reduce((sum, task) => sum + task.minutes, 0)

  const recentThreeDays = [0, -1, -2].map((offset) => {
    const date = addDays(today, offset)
    const key = toDateKey(date)
    const day = getDayPlan(date.getDay())
    const total = recordedMinutesForDay(key)
    return { key, name: day.name, total }
  })
  const activeRecentDays = recentThreeDays.filter((item) => item.total > 0).length

  const updateMinutes = (dateKey: string, taskId: string, value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
    saveStorage({
      ...storage,
      minutes: {
        ...storage.minutes,
        [dateKey]: {
          ...(storage.minutes[dateKey] ?? {}),
          [taskId]: safeValue,
        },
      },
    })
  }

  const toggleMinimumMode = () => {
    const nextValue = !minimumMode
    saveStorage({
      ...storage,
      minimumMode: {
        ...storage.minimumMode,
        [todayKey]: nextValue,
      },
    })
  }

  const updatePlanSettings = (next: StudyPlanSettings) => {
    try {
      saveStudyPlanSettings(next)
      setImportMessage('计划设置已保存；历史学习记录保持不变。')
    } catch {
      setImportMessage('计划设置保存失败，请检查输入后重试。')
    }
  }

  const changeExamDate = (value: string) => {
    if (!value) return
    updatePlanSettings({ ...storage.settings, examDate: value })
  }

  const commitDailyTarget = () => {
    const value = dailyTargetInput.trim()
    if (!value) {
      updatePlanSettings({ ...storage.settings, dailyTargetMinutes: null })
      return
    }
    const minutes = Number(value)
    if (!Number.isInteger(minutes) || minutes < 20 || minutes > 240) {
      setDailyTargetInput(storage.settings.dailyTargetMinutes === null ? '' : String(storage.settings.dailyTargetMinutes))
      setImportMessage('每天目标分钟需要是 20–240 的整数；留空则沿用原计划每天任务时长。')
      return
    }
    updatePlanSettings({ ...storage.settings, dailyTargetMinutes: minutes })
  }

  const toggleStudyDay = (weekday: number) => {
    const selected = storage.settings.studyDays.includes(weekday)
    if (selected && storage.settings.studyDays.length === 1) {
      setImportMessage('每周至少保留一个学习日。')
      return
    }
    const studyDays = selected
      ? storage.settings.studyDays.filter((day: number) => day !== weekday)
      : [...storage.settings.studyDays, weekday]
    updatePlanSettings({ ...storage.settings, studyDays })
  }

  const toggleReminder = async () => {
    if (reminderPreferences.enabled) {
      const next = saveStudyReminderPreferences({ ...reminderPreferences, enabled: false })
      setReminderPreferences(next)
      return
    }
    const permission = await requestStudyReminderPermission()
    if (permission !== 'granted') {
      setImportMessage('浏览器没有授予通知权限；提醒保持关闭。')
      return
    }
    const next = saveStudyReminderPreferences({ ...reminderPreferences, enabled: true })
    setReminderPreferences(next)
    setImportMessage('学习提醒已开启。')
  }

  const changeReminderTime = (time: string) => {
    const next = saveStudyReminderPreferences({ ...reminderPreferences, time })
    setReminderPreferences(next)
  }

  const installPwa = async () => {
    const installed = await installStudyPwa()
    setImportMessage(installed ? '已接受安装，可以从系统应用入口打开。' : '当前浏览器暂未提供安装提示。')
  }

  const startFocus = () => {
    const task = todayTasks.find((candidate) => candidate.id === focusTaskId)
    if (!task) {
      setImportMessage('今天没有可用于专注计时的路线图任务。')
      return
    }
    try {
      startFocusTimer({
        day: todayKey,
        taskId: task.id,
        title: task.title,
        targetMinutes: focusMinutes,
      })
      setImportMessage(`专注计时已开始：${task.title} · ${focusMinutes} 分钟。`)
    } catch {
      setImportMessage('无法启动专注计时，请检查任务与时长。')
    }
  }

  const createPasskey = async () => {
    setImportMessage('')
    try {
      await registerStudyPasskey()
      const account = await loadPasskeyAccount()
      setAccountInfo(account)
      setSyncKey('')
      setSyncKeyInput('')
      setSyncInfo(await loadStudySyncInfo())
      setImportMessage('Passkey 已绑定到当前学习进度。以后换设备可直接使用 Passkey 登录。')
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      setImportMessage(
        code === 'PASSKEY_UNSUPPORTED' || code === 'PASSKEY_BROWSER_UNSUPPORTED'
          ? '当前浏览器或系统不支持所需的 Passkey API。'
          : code === 'PENDING_MUTATIONS'
          ? '请等待待同步记录保存完成后再创建 Passkey。'
          : 'Passkey 创建未完成；现有匿名学习进度没有变化。',
      )
    }
  }

  const loginPasskey = async () => {
    setImportMessage('')
    try {
      const result = await loginWithStudyPasskey()
      setStorage(result.state)
      setLearning(result.state.learning)
      setAccountInfo(result.account)
      setSyncKey('')
      setSyncKeyInput('')
      setSyncInfo(await loadStudySyncInfo())
      setImportMessage('Passkey 登录成功，已恢复账户绑定的全部学习进度。')
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      setImportMessage(
        code === 'PASSKEY_UNSUPPORTED'
          ? '当前浏览器不支持 Passkey。'
          : code === 'PENDING_MUTATIONS'
          ? '请先等待本机待同步记录保存完成，再切换到账户进度。'
          : 'Passkey 登录失败或已取消；当前匿名进度保持不变。',
      )
    }
  }

  const exportStudyPlan = async () => {
    try {
      const backup = await exportRemoteStudyPlan(storage)
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `qwerty-fr-study-plan-${todayKey}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setImportMessage('已导出服务端学习计划 JSON。')
    } catch {
      setImportMessage('导出失败：请确认服务端可用且待保存记录已同步；本机记录未修改。')
    }
  }

  const importStudyPlan = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setPendingImport(null)

    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const candidate =
        isRecord(parsed) &&
        parsed.format === 'qwerty-study-plan' &&
        (parsed.version === 1 || parsed.version === 2 || parsed.version === 3 || parsed.version === 4 || parsed.version === 5)
          ? parsed.state
          : parsed
      const imported = parseImportedStorage(candidate)
      if (!imported) {
        setImportMessage('导入失败：JSON 结构不符合学习计划格式，现有数据未修改。')
        return
      }

      setPendingImport(imported)
      setImportMessage('')
    } catch {
      setImportMessage('导入失败：文件不是有效 JSON，现有数据未修改。')
    }
  }

  const confirmImportStudyPlan = async () => {
    if (!pendingImport) return
    try {
      const saved = await importRemoteStudyPlan(storage, pendingImport)
      setPendingImport(null)
      setImportMessage(saved ? '导入成功：已保存到服务端。' : '导入已保留在本机队列，连接恢复后将同步到服务端。')
    } catch {
      setImportMessage('导入失败：无法保存，请检查浏览器存储。')
    }
  }

  const cancelImportStudyPlan = () => {
    setPendingImport(null)
    setImportMessage('已取消导入，现有数据未修改。')
  }

  const generateSyncKey = async () => {
    try {
      const key = await createStudySyncKey(storage)
      setSyncKey(key)
      setSyncKeyInput(key)
      setSyncInfo(await loadStudySyncInfo())
      setImportMessage('同步码已生成。它等同账号密码，请只保存在你自己的设备上。')
    } catch {
      setImportMessage('暂时无法生成同步码：请先等待本机待保存记录同步完成。')
    }
  }

  const copySyncKey = async () => {
    if (!syncKey) return
    try {
      await navigator.clipboard.writeText(syncKey)
      setImportMessage('同步码已复制。')
    } catch {
      setImportMessage('浏览器无法自动复制，请手动选择同步码。')
    }
  }

  const connectWithSyncKey = async () => {
    try {
      const linked = await linkStudyDevice(syncKeyInput)
      setStorage(linked)
      setLearning(linked.learning)
      setSyncKey(syncKeyInput.trim().toLowerCase())
      setSyncInfo(await loadStudySyncInfo())
      setImportMessage('这台设备已绑定到同一份服务端学习进度。')
    } catch (error) {
      setImportMessage(
        error instanceof Error && error.message === 'INVALID_SYNC_KEY'
          ? '同步码无效，请检查后重试。'
          : '连接失败：请确认同步码正确，并等待本机待保存记录同步完成。',
      )
    }
  }

  const disconnectSync = async () => {
    try {
      const detached = await unlinkStudyDevice()
      setStorage(detached)
      setLearning(detached.learning)
      setSyncKey('')
      setSyncKeyInput('')
      setSyncInfo({ bound: false, activeKeys: 0 })
      setImportMessage('已解绑：当前进度保留在这台设备的新独立副本中，之后不会再和原设备互相覆盖。')
    } catch {
      setImportMessage('解绑失败：请先联网并等待待同步记录保存完成。')
    }
  }

  const revokeSyncCode = async () => {
    if (!syncKey) return
    try {
      await revokeStudySyncKey(syncKey)
      setSyncKey('')
      setSyncKeyInput('')
      setSyncInfo(await loadStudySyncInfo())
      setImportMessage('同步码已撤销，之后不能再用它绑定新设备。')
    } catch (error) {
      setImportMessage(
        error instanceof Error && error.message.includes('Unlink this device')
          ? '当前设备正在使用这个同步码，请先解绑当前设备再撤销。'
          : '撤销同步码失败，请确认网络正常。',
      )
    }
  }

  const deleteAllData = async () => {
    const confirmation = window.prompt('此操作会永久删除服务端学习计划、错题本、打卡、成就、周报和同步数据。请输入 DELETE 确认。')
    if (confirmation !== 'DELETE') {
      setImportMessage('已取消删除。')
      return
    }
    try {
      await deleteAllStudyData()
      await db.delete()
      for (const key of [
        'qwerty-fr-grammar-session-history-v1',
        'qwerty-fr-grammar-server-migration-v1',
        'qwerty-fr-conjugation-stats-v1',
        'qwerty-fr-vocabulary-server-migration-v1',
      ])
        window.localStorage.removeItem(key)
      setImportMessage('服务端与本机学习数据都已删除，页面将重新初始化。')
      window.setTimeout(() => window.location.reload(), 300)
    } catch {
      setImportMessage('删除失败：请先联网并等待待同步记录保存完成。')
    }
  }

  const smartToday = analytics?.today
  const customWordLists = useAtomValue(customDictsAtom)

  const smartTaskHref = (task: NonNullable<StudyAnalytics['today']>['tasks'][number]) => {
    const withStudy = (href: string) => {
      const separator = href.includes('?') ? '&' : '?'
      return `${href}${separator}studyDate=${todayKey}&studyTask=${task.id}`
    }
    if (task.kind === 'placement' || task.kind === 'reading' || task.kind === 'listening') return withStudy(task.href)
    if (task.kind === 'vocabulary') {
      if (task.href.includes('dict=')) return withStudy(task.href)
      if (placementRecommendedDictionary) return withStudy(`/typing?dict=${encodeURIComponent(placementRecommendedDictionary.id)}`)
      if (targetDictionary) return withStudy(`/typing?dict=${encodeURIComponent(targetDictionary.id)}`)
      return withStudy('/typing')
    }
    if (task.kind === 'grammar') {
      if (task.href.includes('topic=')) return withStudy(task.href)
      return withStudy('/grammar-session')
    }
    if (task.kind === 'conjugation') return withStudy(task.href)
    if (task.kind === 'review') return withStudy('/analysis')
    return task.href
  }

  const personalizedWeek = analytics?.placement?.suggestedStartWeek ?? learning?.placement?.latest?.recommendations.suggestedStartWeek
  const personalizedPhase = personalizedWeek ? getStudyPhase(personalizedWeek) : null

  const renderTask = (task: StudyTask, dateKey: string, compact = false) => {
    const actual = storage.minutes[dateKey]?.[task.id] ?? 0
    const complete = actual >= task.minutes
    let taskHref = task.href
    let actionLabel = task.actionLabel

    const roadmapVocabDict = placementRecommendedDictionary ?? targetDictionary
    if (task.kind === 'vocabulary' && task.href === '/gallery' && roadmapVocabDict) {
      const focusOwnsTask = Boolean(focusSnapshot && focusSnapshot.day === dateKey && focusSnapshot.taskId === task.id)
      taskHref = focusOwnsTask
        ? `/typing?dict=${roadmapVocabDict.id}`
        : `/typing?dict=${roadmapVocabDict.id}&studyDate=${dateKey}&studyTask=${task.id}`
      actionLabel =
        placementRecommendedDictionary && placementRecommendedDictionary.id !== targetDictionary?.id
          ? `定级词库 · ${placementRecommendedDictionary.name}`
          : `练 ${roadmapVocabDict.name}`
    } else if (task.href === '/grammar-session') {
      if (placementGrammarTopicId) {
        taskHref = `/grammar-session?topic=${encodeURIComponent(placementGrammarTopicId)}&studyDate=${dateKey}&studyTask=${task.id}`
      }
      actionLabel = placementGrammarTopicId ? '定级语法专题' : '练语法专题'
    } else if (task.href === '/conjugation') {
      taskHref = conjugationHref
      actionLabel = phase.id === 1 ? '练 prendre · Passé composé' : '开始核心动词练习'
    } else if (
      task.href === '/tcf-listening' ||
      task.href === '/tcf-reading' ||
      task.href === '/tcf-writing' ||
      task.href === '/tcf-speaking'
    ) {
      taskHref = `${task.href}?studyDate=${dateKey}&studyTask=${task.id}`
    }

    return (
      <div
        key={task.id}
        className={`rounded-2xl border p-4 transition ${
          complete
            ? 'border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/20'
            : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {kindLabels[task.kind]}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
              <span className="text-xs text-gray-400">目标 {task.minutes} min</span>
              {actual > task.minutes && <span className="text-xs text-gray-400">超出 {actual - task.minutes} min</span>}
            </div>
            {!compact && <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{task.description}</p>}
          </div>

          {complete && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
              <IconCheck />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {taskHref ? (
            <NavLink
              to={taskHref}
              onClick={task.kind === 'vocabulary' ? () => saveStorage(storage) : undefined}
              className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm text-white transition hover:bg-indigo-600"
            >
              <IconPlayerPlay />
              {actionLabel ?? '开始'}
            </NavLink>
          ) : (
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              线下 / 自选材料
            </span>
          )}

          <label className="ml-auto flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            实际
            <input
              type="number"
              min={0}
              step={5}
              value={actual}
              onChange={(event) => updateMinutes(dateKey, task.id, Number(event.target.value))}
              className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              aria-label={`${task.title} 实际学习分钟数`}
            />
            min
          </label>

          <button
            type="button"
            onClick={() => updateMinutes(dateKey, task.id, complete ? 0 : task.minutes)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              complete
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300'
            }`}
          >
            {complete ? '取消完成' : '按目标完成'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <main className="container mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6 lg:px-10">
        <section className="my-card relative overflow-hidden rounded-[28px] bg-white p-5 dark:bg-gray-800 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1 basis-[26rem]">
              <div className="ui-eyebrow">
                <IconCalendar />
                TCF Canada · 26 周学习计划
              </div>
              <h1 className="ui-title mt-3">
                <span className="tabular-nums text-gray-400 dark:text-gray-500">Week</span>{' '}
                <span className="tabular-nums">{currentWeek}</span>
                <span className="text-gray-300 dark:text-gray-600"> / 26</span>
                <span className="text-gray-300 dark:text-gray-600"> · </span>
                {phase.name}
              </h1>
              {personalizedWeek && personalizedPhase && personalizedWeek !== currentWeek && (
                <p data-testid="placement-personalized-week" className="mt-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  定级并行轨道：Week {personalizedWeek} · {personalizedPhase.name}（日历仍按 Week {currentWeek}{' '}
                  推进，词库预览已默认切到定级周）
                </p>
              )}
              <p className="mt-2 text-gray-500 dark:text-gray-400">{phase.goal}</p>
              {!learning?.placement?.latest ? (
                <div
                  data-testid="placement-prompt"
                  className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-4 text-sm leading-6 text-indigo-950 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:via-transparent dark:to-violet-500/10 dark:text-indigo-100"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-base font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/10">
                    A→B
                  </div>
                  <div className="min-w-[14rem] flex-1">
                    <div className="font-semibold">还没做过入学定级？</div>
                    <p className="mt-0.5 text-indigo-900/70 dark:text-indigo-200/80">
                      约 20 分钟的 Placement Test 会给出 CEFR 等级，并推荐应从哪一周、哪些词库与模考开始，方便后续分级教学。
                    </p>
                  </div>
                  <NavLink to="/placement-test" className="ui-btn-primary">
                    开始定级测试 →
                  </NavLink>
                </div>
              ) : (
                <div
                  data-testid="placement-summary"
                  className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  <span>当前定级</span>
                  <span className="ui-chip-accent">{learning.placement.latest.cefrLevel}</span>
                  <span className="text-gray-400">·</span>
                  <NavLink to="/placement-test" className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">
                    查看详情或重新测试
                  </NavLink>
                  {placementRetestDue(learning.placement.latest.finishedAt) && (
                    <span className="text-amber-600 dark:text-amber-400">· 已超过 4 周，建议复测定级</span>
                  )}
                </div>
              )}
              {targetDictionary && (
                <NavLink
                  to={`/typing?dict=${encodeURIComponent(targetDictionary.id)}${
                    todayVocabularyTask && !focusOwnsTodayVocabulary ? `&studyDate=${todayKey}&studyTask=${todayVocabularyTask.id}` : ''
                  }`}
                  onClick={todayVocabularyTask ? () => saveStorage(storage) : undefined}
                  className="mt-1 block text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
                >
                  本周词库（26 周路线）：{targetDictionary.name} · {targetDictionary.length} 词 · 共{' '}
                  {Math.ceil(targetDictionary.length / CHAPTER_LENGTH)} 章
                </NavLink>
              )}
              {placementRecommendedDictionary && placementRecommendedDictionary.id !== targetDictionary?.id && (
                <NavLink
                  data-testid="placement-recommended-dict"
                  to={`/typing?dict=${encodeURIComponent(placementRecommendedDictionary.id)}`}
                  className="mt-1 block text-sm text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
                >
                  定级推荐词库：{placementRecommendedDictionary.name} · 与当前周次不同，适合按水平补强
                </NavLink>
              )}
              {previewWeek !== currentWeek && previewDictionary && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('study-dictionary-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="mt-1 block text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
                >
                  正在预览第 {previewWeek} 周：{previewDictionary.name} · {previewDictionary.length} 词 · 共{' '}
                  {Math.ceil(previewDictionary.length / CHAPTER_LENGTH)} 章
                </button>
              )}
            </div>

            <div className="flex w-full max-w-md flex-col items-end gap-2">
              <div data-testid="focus-timer-setup" className="ui-panel w-full p-3.5 text-left">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-200">专注计时 · 可选</div>
                    <div className="mt-0.5 text-[11px] leading-5 text-gray-500 dark:text-gray-400">
                      隐藏页面或连续 2 分钟无输入会自动暂停；结束后只把真实有效分钟写回所选任务。
                    </div>
                  </div>
                  {focusSnapshot && focusSnapshot.status !== 'finished' && (
                    <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                      {focusSnapshot.status === 'running' ? '计时中' : '已暂停'}
                    </span>
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_88px_auto]">
                  <select
                    aria-label="专注计时任务"
                    value={focusTaskId}
                    onChange={(event) => setFocusTaskId(event.target.value)}
                    disabled={!todayTasks.length || Boolean(focusSnapshot && focusSnapshot.status !== 'finished')}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {todayTasks.length ? (
                      todayTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))
                    ) : (
                      <option value="">今天是休息日</option>
                    )}
                  </select>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={focusMinutes}
                    disabled={Boolean(focusSnapshot && focusSnapshot.status !== 'finished')}
                    onChange={(event) => setFocusMinutes(Math.min(120, Math.max(5, Math.round(Number(event.target.value) || 25))))}
                    aria-label="专注计时分钟"
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-xs text-gray-700 outline-none focus:border-indigo-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={startFocus}
                    disabled={!todayTasks.length || Boolean(focusSnapshot && focusSnapshot.status !== 'finished')}
                    className="ui-btn-primary px-3 py-1.5 text-xs"
                  >
                    开始专注
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  {[25, 50].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      disabled={Boolean(focusSnapshot && focusSnapshot.status !== 'finished')}
                      onClick={() => setFocusMinutes(minutes)}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-500 hover:border-indigo-300 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {minutes} min
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] text-gray-400">暂停/继续/结束可在右下角计时器操作</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('study-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
              >
                计划设置、提醒、账户与同步 ↓
              </button>
            </div>
          </div>

          <div className="relative mt-7 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>整体进度</span>
            <span className="tabular-nums">
              <span className="text-gray-900 dark:text-white">{phaseProgress}%</span> · 还剩 {26 - currentWeek} 周
            </span>
          </div>
          <div className="ui-progress-track relative mt-2">
            <div className="ui-progress-bar" style={{ width: `${Math.max(phaseProgress, 1.5)}%` }} />
          </div>

          <div className="relative mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white p-4 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-transparent">
              <div className="ui-stat-label text-indigo-500 dark:text-indigo-300">当前阶段</div>
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`study-roadmap-phase-${phase.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-1 font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
              >
                第 {phase.weeks[0]}–{phase.weeks[1]} 周 · {phase.name}
              </button>
              <div className="mt-1 text-sm text-indigo-400">
                {toDateKey(phaseStartDate)} · {toDateKey(phaseEndDate)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-indigo-400">
                <span>
                  本阶段第 {currentWeek - phase.weeks[0] + 1} / {phase.weeks[1] - phase.weeks[0] + 1} 周
                </span>
                <span>本阶段还剩 {phase.weeks[1] - currentWeek} 周</span>
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{phase.state}</div>
              {analytics && (
                <div className="mt-2 text-xs text-indigo-400">
                  服务端阶段完成 {analytics.plan.phase.completionPercent}% · {analytics.plan.phase.completedDays} /{' '}
                  {analytics.plan.phase.elapsedDays} 个已到日期完成
                </div>
              )}
            </div>
            <div className="ui-stat">
              <div className="ui-stat-label">本周实际</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="ui-stat-value mt-0">{minutesLabel(weeklyActualMinutes)}</div>
                {weeklyPlannedMinutes > 0 && weeklyActualMinutes > weeklyPlannedMinutes && (
                  <span className="text-sm text-gray-400">超出 {weeklyActualMinutes - weeklyPlannedMinutes} min</span>
                )}
                {weeklyPlannedMinutes > 0 && weeklyPlannedMinutes - weeklyActualMinutes > 0 && (
                  <span className="text-sm text-gray-400">还差 {weeklyPlannedMinutes - weeklyActualMinutes} min</span>
                )}
                {weeklyPlannedMinutes > 0 && weeklyActualMinutes >= weeklyPlannedMinutes && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    完成
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">计划约 {minutesLabel(weeklyPlannedMinutes)}</div>
              <div className="mt-1 text-sm text-gray-500">
                完成 {weeklyCompletedDays} / {storage.settings.studyDays.length} 个学习日
              </div>
              {analytics && (
                <div className="mt-1 text-xs text-gray-400">
                  服务端累计 {minutesLabel(analytics.plan.totalMinutes)} · 本周完成度 {analytics.plan.weekCompletionPercent}%
                </div>
              )}
              {weeklyMissedDays > 0 && earliestMissedDayKey && earliestMissedDayName ? (
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightedMissedDayKey(earliestMissedDayKey)
                      document
                        .getElementById(`study-week-day-${earliestMissedDayKey}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    className="text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    未完成 {weeklyMissedDays} 天
                  </button>
                  <span className="text-gray-400">
                    最早是{earliestMissedDayName} · {earliestMissedDayKey}
                  </span>
                  {earliestMissedDayRemainingMinutes !== null && earliestMissedDayRemainingMinutes > 0 && (
                    <span className="text-gray-400">还差 {earliestMissedDayRemainingMinutes} min</span>
                  )}
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-500">未完成 {weeklyMissedDays} 天</div>
              )}
            </div>
            <div className="ui-stat">
              <div className="ui-stat-label">连续性</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="ui-stat-value mt-0">{activeRecentDays} / 3 天有学习</div>
                {activeRecentDays === 0 && <span className="text-sm text-gray-400">这三天都没学</span>}
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                {recentThreeDays.map((item, index) => {
                  const isInCurrentPlanWeek = currentPlanWeekDays.some((dayItem) => dayItem.key === item.key)
                  const label = `${['今天', '昨天', '前天'][index]} · ${item.name} · ${item.key} · ${item.total > 0 ? '有' : '无'}`

                  return isInCurrentPlanWeek ? (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        document.getElementById(`study-week-day-${item.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                      className="block text-left underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                    >
                      {label}
                    </button>
                  ) : (
                    <div key={item.key}>{label}</div>
                  )
                })}
              </div>
              <div className="mt-1 text-sm text-gray-500">原则：可以少学，但尽量不要连续三天完全不碰法语。</div>
              {analytics && (
                <div className="mt-2 text-xs text-gray-400">
                  当前连续 {analytics.streak.current} 天 · 历史最长 {analytics.streak.longest} 天
                </div>
              )}
            </div>
          </div>

          {analytics && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <span>
                词汇：{analytics.vocabulary.attempts} 次 · {analytics.vocabulary.uniqueWords} 个词 · {analytics.vocabulary.wrongWords}{' '}
                个错词
              </span>
              <span>
                语法：{analytics.grammar.sessions} 次{analytics.grammar.accuracy === null ? '' : ` · ${analytics.grammar.accuracy}%`}
                {analytics.grammar.hasDraft ? ' · 有未完成练习' : ''}
              </span>
              <span>
                变位：{analytics.conjugation.attempts} 题
                {analytics.conjugation.accuracy === null ? '' : ` · ${analytics.conjugation.accuracy}%`} ·{' '}
                {analytics.conjugation.practicedVerbs} 个动词
              </span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {phase.focus.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>
          <PhaseEchelleTarget phaseId={phase.id} />
          <LevelsLink />
        </section>

        {analytics?.placement && (
          <section
            data-testid="placement-personalized-track"
            className="my-card mt-7 rounded-3xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900 dark:bg-violet-950/30 sm:p-7"
          >
            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">定级个性化轨道（与 26 周日历并行）</div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-200">
              当前 CEFR <strong>{analytics.placement.cefrLevel}</strong>，系统推荐从 Week {analytics.placement.suggestedStartWeek}{' '}
              的内容密度练起，并优先补 <strong>{analytics.placement.weakestSection}</strong> /{' '}
              <strong>{analytics.placement.secondWeakestSection}</strong>。 下方日历仍按考试倒计时走 Week {currentWeek}，方便你对照官方 26
              周大纲。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <NavLink
                to="/placement-test"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
              >
                查看定级详情
              </NavLink>
              {smartToday?.placement?.tcfBoostHref && (
                <NavLink
                  to={smartToday.placement.tcfBoostHref}
                  className="rounded-lg border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-800 dark:border-violet-700 dark:text-violet-200"
                >
                  今日推荐模考入口
                </NavLink>
              )}
              <NavLink
                to="/admin/placement"
                className="rounded-lg border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-800 dark:border-violet-700 dark:text-violet-200"
              >
                机构定级看板
              </NavLink>
            </div>
          </section>
        )}

        <section
          aria-labelledby="my-word-lists-title"
          data-testid="home-word-lists"
          className="my-card mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl bg-white p-4 dark:bg-gray-800 sm:px-7 sm:py-5"
        >
          <div className="min-w-[12rem] flex-1">
            <h2 id="my-word-lists-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              我的词表
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {customWordLists.length > 0
                ? `${customWordLists.length} 个自定义词表，点名字直接开始跟打。`
                : '把模考和阅读里遇到的生词做成自己的词表，用「单词跟打」背。'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {customWordLists.slice(0, 4).map((list) => (
              <NavLink
                key={list.id}
                to={`/typing?dict=${encodeURIComponent(list.id)}`}
                className="max-w-[14rem] truncate rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 no-underline transition hover:bg-indigo-100 hover:no-underline dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                {list.name} · {list.words.length} 词
              </NavLink>
            ))}
            <NavLink
              to="/word-lists"
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-indigo-600 hover:no-underline"
            >
              {customWordLists.length > 0 ? '管理词表' : '＋ 新建词表'}
            </NavLink>
          </div>
        </section>

        <section
          aria-labelledby="smart-today-title"
          data-testid="smart-today-plan"
          className="mt-7 rounded-3xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/50 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">智能今日任务</div>
              <h2 id="smart-today-title" className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
                {smartToday ? `${smartToday.completedMinutes} / ${smartToday.targetMinutes} min` : '正在读取今日组合…'}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700 dark:text-gray-200">
                根据 SM-2 到期量、active 错题和每天目标分钟动态分配。
                {smartToday?.placement
                  ? ` 已定级 ${smartToday.placement.cefrLevel}：今日约 45% 分钟强制投入定级弱项（${smartToday.placement.weakestSection} / ${smartToday.placement.secondWeakestSection}），26 周路线图任务仍保留在下方日历。`
                  : ' 完成定级测试后，这一层会按 CEFR 弱项加权；路线图本身不变。'}
              </p>
            </div>
            {smartToday && (
              <div className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-indigo-800 dark:bg-gray-900 dark:text-gray-200">
                到期复习 {smartToday.dueReviews} · active 错题 {smartToday.activeErrors}
                {smartToday.placement && (
                  <div className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    定级 {smartToday.placement.cefrLevel} · 推荐周 {smartToday.placement.suggestedStartWeek}
                  </div>
                )}
              </div>
            )}
          </div>

          {smartToday ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {smartToday.tasks.map((task) => (
                <article
                  key={task.id}
                  className={`rounded-2xl border p-4 ${
                    task.complete
                      ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                      {smartKindLabels[task.kind]}
                    </span>
                    <h3 className="font-semibold text-gray-950 dark:text-white">{task.title}</h3>
                    {task.complete && <span className="ml-auto text-sm font-medium text-green-700 dark:text-green-300">已完成</span>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">{task.reason}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span>
                          {task.actualMinutes} / {task.minutes} min
                        </span>
                        <span>{Math.min(100, Math.round((task.actualMinutes / Math.max(1, task.minutes)) * 100))}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${task.title} 今日完成度`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, Math.round((task.actualMinutes / Math.max(1, task.minutes)) * 100))}
                        className="ui-progress-track mt-1.5"
                      >
                        <div
                          className="ui-progress-bar"
                          style={{ width: `${Math.min(100, Math.round((task.actualMinutes / Math.max(1, task.minutes)) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <NavLink
                      to={smartTaskHref(task)}
                      aria-label={`开始${task.title}`}
                      className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      {task.complete ? '再练一次' : '开始'}
                    </NavLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-white p-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              服务端暂不可用且本机还没有今日任务缓存。路线图和离线练习仍可正常使用。
            </div>
          )}
        </section>

        <section
          id="study-dictionary-preview"
          className="mt-7 rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-indigo-500">
                <span>词库预览</span>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`study-roadmap-week-${previewWeek}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-indigo-300"
                >
                  定位这一周
                </button>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  正在预览第 {previewWeek} 周
                </span>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(`study-roadmap-phase-${getStudyPhase(previewWeek).id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="text-xs font-normal text-gray-400 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  {getStudyPhase(previewWeek).name}
                </button>
                <span className="text-xs font-normal text-gray-400">
                  在阶段里第 {previewWeek - getStudyPhase(previewWeek).weeks[0] + 1} /{' '}
                  {getStudyPhase(previewWeek).weeks[1] - getStudyPhase(previewWeek).weeks[0] + 1} 周
                </span>
                <span className="text-xs font-normal text-gray-400">
                  这一阶段还剩 {getStudyPhase(previewWeek).weeks[1] - previewWeek} 周
                </span>
                {previewWeek !== currentWeek && (
                  <button
                    type="button"
                    onClick={() => setPreviewWeek(currentWeek)}
                    className="text-xs font-normal text-gray-400 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    改回第 {currentWeek} 周
                  </button>
                )}
                <span className="text-xs font-normal text-gray-400">
                  {toDateKey(previewWeekStart)} · {toDateKey(previewWeekEnd)}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {previewDictionary ? (
                  <NavLink
                    to={previewPracticeHref}
                    onClick={previewWeek === currentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                    className="underline decoration-gray-300 underline-offset-4 hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    {previewDictionary.name}
                  </NavLink>
                ) : (
                  '词库加载失败'
                )}
              </h2>
              {previewDictionary && (
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {previewDictionary.length} 词 · 共 {Math.ceil(previewDictionary.length / CHAPTER_LENGTH)} 章
                </div>
              )}
              {previewDictionary && !isPreviewWordListLoading && !previewWordListError && previewWordList && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {normalizedPreviewFilter || isMistakeFilterActive || isMistakeChapterFilterActive
                      ? `匹配了 ${matchedPreviewWords.length} 个 · 第 ${currentPreviewPage} 页 / 共 ${previewTotalPages} 页 · 显示了 ${previewWords.length} 个`
                      : previewWordList.length < PREVIEW_PAGE_SIZE
                      ? `匹配了 ${matchedPreviewWords.length} 个 · 第 ${currentPreviewPage} 页 / 共 ${previewTotalPages} 页 · 已全部显示`
                      : `匹配了 ${matchedPreviewWords.length} 个 · 第 ${currentPreviewPage} 页 / 共 ${previewTotalPages} 页 · 显示了 ${previewWords.length} 个`}
                  </span>
                  {isMistakeChapterFilterActive && selectedMistakeChapter !== null && (
                    <>
                      <span>正在看第 {selectedMistakeChapter} 章错过的词</span>
                      {selectedMistakeChapterPracticeHref && (
                        <NavLink
                          to={selectedMistakeChapterPracticeHref}
                          onClick={previewWeek === currentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                          className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                        >
                          去练这一章
                        </NavLink>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="w-full max-w-sm space-y-2">
              <label className="block text-sm text-gray-500 dark:text-gray-400">
                过滤词库
                <input
                  type="search"
                  value={previewFilter}
                  onChange={(event) => {
                    setPreviewFilter(event.target.value)
                    setPreviewPage(1)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Escape' || !hasPreviewFilters) return
                    event.preventDefault()
                    clearPreviewFilters()
                  }}
                  placeholder="按词名、notation 或中文释义"
                  disabled={isPreviewWordListLoading || Boolean(previewWordListError)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:disabled:bg-gray-950"
                />
              </label>

              {hasPreviewFilters && (
                <button
                  type="button"
                  onClick={clearPreviewFilters}
                  className="w-fit rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  清除筛选（{previewFilterCount}）
                </button>
              )}

              <label
                className={`flex items-center gap-2 text-sm ${
                  previewErrorWordsStatus === 'ready'
                    ? 'cursor-pointer text-gray-600 dark:text-gray-300'
                    : 'cursor-not-allowed text-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={onlyMistakenPreviewWords}
                  onChange={(event) => {
                    setOnlyMistakenPreviewWords(event.target.checked)
                    setPreviewPage(1)
                  }}
                  disabled={previewErrorWordsStatus !== 'ready'}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>只看错过的{previewMistakenWordCount !== null ? `（${previewMistakenWordCount}）` : ''}</span>
              </label>

              {previewMistakeSummary && previewMistakeSummary.chapters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewMistakeSummary.chapters.map(({ chapter, count }) => {
                    const active = selectedMistakeChapter === chapter
                    return (
                      <button
                        key={chapter}
                        type="button"
                        onClick={() => {
                          setSelectedMistakeChapter(active ? null : chapter)
                          setPreviewPage(1)
                        }}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                          active
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        第 {chapter} 章 {count} 个
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            {previewErrorWordsStatus === 'loading' ? (
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                正在读取错题记录…
              </div>
            ) : previewErrorWordsStatus === 'error' ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                错题记录读取失败：{previewErrorWordsState.error}
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            {previewWordListError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                词库加载失败：{previewWordListError.message}
              </div>
            ) : isPreviewWordListLoading ? (
              <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                正在加载第 {previewWeek} 周词库…
              </div>
            ) : previewWords.length > 0 ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {previewWords.map((word, index) => {
                    const fullWordIndex = previewWordList?.indexOf(word) ?? -1
                    const chapterIndex = fullWordIndex >= 0 ? Math.floor(fullWordIndex / CHAPTER_LENGTH) : null
                    const chapter = chapterIndex !== null ? chapterIndex + 1 : null
                    const wordPracticeHref = chapterIndex !== null ? `${previewPracticeHref}&chapter=${chapterIndex}` : previewPracticeHref

                    return (
                      <NavLink
                        key={`${word.name}-${index}`}
                        to={wordPracticeHref}
                        onClick={previewWeek === currentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                        className="rounded-xl bg-gray-50 px-3 py-2 transition hover:bg-indigo-50 dark:bg-gray-900 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{word.name}</div>
                          <div className="flex shrink-0 flex-wrap justify-end gap-1">
                            {previewErrorWordsStatus === 'ready' && previewErrorWords.has(word.name) && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                错过
                              </span>
                            )}
                            {chapter !== null && (
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                                第 {chapter} 章
                              </span>
                            )}
                          </div>
                        </div>
                        {word.notation && (
                          <div className="mt-1 text-xs font-medium text-indigo-500 dark:text-indigo-300">{word.notation}</div>
                        )}
                        {word.trans.length > 0 && (
                          <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {word.trans.slice(0, 2).join('；')}
                          </div>
                        )}
                      </NavLink>
                    )
                  })}
                </div>

                {previewTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewPage(Math.max(1, currentPreviewPage - 1))}
                      disabled={currentPreviewPage <= 1}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      上一页
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      第 {currentPreviewPage} 页 / 共 {previewTotalPages} 页
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(Math.min(previewTotalPages, currentPreviewPage + 1))}
                      disabled={currentPreviewPage >= previewTotalPages}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {isMistakeChapterFilterActive
                  ? '这一章没有匹配的错过词'
                  : normalizedPreviewFilter || isMistakeFilterActive
                  ? '没有匹配的词。'
                  : '这个词库没有可显示的词。'}
              </div>
            )}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              {currentPlanWeekDays.some((item) => item.key === todayKey) ? (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`study-week-day-${todayKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                  className="text-sm font-medium text-indigo-500 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  今日计划 · {todayPlan.name} · {todayKey}
                </button>
              ) : (
                <div className="ui-eyebrow">
                  今日计划 · {todayPlan.name} · {todayKey}
                </div>
              )}
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {todayTasks.length === 0
                  ? '休息日（按设置）'
                  : minimumMode
                  ? '10 分钟最低模式'
                  : storage.settings.dailyTargetMinutes
                  ? `${storage.settings.dailyTargetMinutes} min 目标`
                  : storage.settings.studyDays.length < 7
                  ? `${todayPlannedMinutes} min 目标`
                  : todayPlan.totalLabel}
              </h2>
              {todayPlan.note && <p className="mt-1 text-sm text-gray-500">{todayPlan.note}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <IconClock />
                  今天 {todayActualMinutes} / {todayPlannedMinutes} min
                </div>
                {todayPlannedMinutes > 0 && todayActualMinutes > todayPlannedMinutes && (
                  <span className="text-gray-400">超出 {todayActualMinutes - todayPlannedMinutes} min</span>
                )}
                {todayPlannedMinutes > 0 && todayPlannedMinutes - todayActualMinutes > 0 && (
                  <span className="text-gray-400">还差 {todayPlannedMinutes - todayActualMinutes} min</span>
                )}
                {todayPlannedMinutes > 0 && todayActualMinutes >= todayPlannedMinutes && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    完成
                  </span>
                )}
              </div>
              {todayTasks.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleMinimumMode}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    minimumMode
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300'
                  }`}
                >
                  {minimumMode ? '恢复正常计划' : '今天太累了 → 10 分钟模式'}
                </button>
              ) : (
                <span className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-400 dark:bg-gray-900">今天不安排计划任务</span>
              )}
            </div>
          </div>

          {todayTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">{todayTasks.map((task) => renderTask(task, todayKey))}</div>
          ) : (
            <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              按你的每周学习日设置，今天是休息日。历史学习记录仍会保留在统计里。
            </div>
          )}
        </section>

        <section className="mt-10">
          <div>
            <div className="ui-eyebrow">
              每周 {storage.settings.studyDays.length} 个学习日 · 计划 {minutesLabel(weeklyPlannedMinutes)}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">本周安排</h2>
              {currentPlanWeekDays.length === 7 && (
                <span className="text-sm font-normal text-gray-400">
                  {currentPlanWeekDays[0].key} · {currentPlanWeekDays[currentPlanWeekDays.length - 1].key}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              未选中的日期保留原路线位置但作为休息日；调整设置不会删除已经完成的实际记录。
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {currentPlanWeekDays.map(({ key, day }) => {
              const dayMinimumMode = Boolean(storage.minimumMode[key])
              const dayTasks = getConfiguredDayTasks(day, storage.settings, dayMinimumMode, minimumModeTasks)
              const dayActual = recordedMinutesForDay(key)
              const dayScheduledActual = actualMinutesForTasks(key, dayTasks)
              const dayPlannedMinutes = dayTasks.reduce((sum, task) => sum + task.minutes, 0)
              const dayComplete = dayPlannedMinutes > 0 && dayScheduledActual >= dayPlannedMinutes
              const dayMissed = key < todayKey && dayPlannedMinutes > 0 && !dayComplete
              const isToday = key === todayKey

              return (
                <div
                  id={`study-week-day-${key}`}
                  key={key}
                  className={`rounded-2xl border p-5 ${
                    isToday
                      ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20'
                      : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                  } ${
                    highlightedMissedDayStillMissed && highlightedMissedDayKey === key
                      ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{day.name}</h3>
                        <span className="text-sm font-normal text-gray-400">{key}</span>
                        {isToday && <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">今天</span>}
                        {highlightedMissedDayStillMissed && highlightedMissedDayKey === key && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            最早未完成
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {dayTasks.length === 0
                          ? '休息日（按设置）'
                          : dayMinimumMode
                          ? '10 分钟最低模式'
                          : storage.settings.dailyTargetMinutes
                          ? `${storage.settings.dailyTargetMinutes} min 目标`
                          : storage.settings.studyDays.length < 7
                          ? `${dayPlannedMinutes} min 目标`
                          : day.totalLabel}
                        {day.note && dayTasks.length > 0 ? ` · ${day.note}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <span>已记录 {dayActual} min</span>
                      {dayPlannedMinutes > 0 && dayActual > dayPlannedMinutes && (
                        <span className="text-gray-400">超出 {dayActual - dayPlannedMinutes} min</span>
                      )}
                      {dayMissed && dayPlannedMinutes - dayActual > 0 && (
                        <span className="text-gray-400">还差 {dayPlannedMinutes - dayActual} min</span>
                      )}
                      {dayComplete && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                          完成
                        </span>
                      )}
                      {dayMissed && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                          未完成
                        </span>
                      )}
                    </div>
                  </div>

                  {dayTasks.length > 0 ? (
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">{dayTasks.map((task) => renderTask(task, key, true))}</div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-400 dark:bg-gray-900">
                      这一天按当前设置不安排计划任务；已有历史分钟仍保留。
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="ui-eyebrow">六个月路线</div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">26 周怎么推进</h2>
            <button
              type="button"
              onClick={() =>
                document.getElementById(`study-roadmap-week-${currentWeek}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-indigo-300"
            >
              回到当前周
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studyPhases.map((item) => {
              const active = item.id === phase.id
              const weeks = Array.from({ length: item.weeks[1] - item.weeks[0] + 1 }, (_, index) => item.weeks[0] + index)
              const roadmapPhaseStart = addDays(startDate, (item.weeks[0] - 1) * 7)
              const roadmapPhaseEnd = addDays(startDate, item.weeks[1] * 7 - 1)

              return (
                <div
                  id={`study-roadmap-phase-${item.id}`}
                  key={item.id}
                  className={`rounded-2xl border p-5 ${
                    active
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-500">
                    <span>
                      第 {item.weeks[0]}–{item.weeks[1]} 周 {active ? '· 当前阶段' : ''}
                    </span>
                    <span className="font-normal text-gray-400 dark:text-gray-500">共 {item.weeks[1] - item.weeks[0] + 1} 周</span>
                    {item.weeks[1] < currentWeek && <span className="font-normal text-gray-400 dark:text-gray-500">已过</span>}
                    {item.weeks[0] > currentWeek && <span className="font-normal text-gray-400 dark:text-gray-500">未到</span>}
                    {active && (
                      <>
                        <span className="font-normal text-gray-400 dark:text-gray-500">
                          本阶段第 {currentWeek - item.weeks[0] + 1} / {item.weeks[1] - item.weeks[0] + 1} 周
                        </span>
                        <span className="font-normal text-gray-400 dark:text-gray-500">本阶段还剩 {item.weeks[1] - currentWeek} 周</span>
                      </>
                    )}
                    {!active && previewWeek >= item.weeks[0] && previewWeek <= item.weeks[1] && (
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(`study-roadmap-week-${previewWeek}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                        className="font-normal text-gray-400 underline decoration-gray-300 underline-offset-2 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-300"
                      >
                        正在预览第 {previewWeek} 周
                        {previewDictionary
                          ? ` · ${previewDictionary.name} · ${previewDictionary.length} 词 · 共 ${Math.ceil(
                              previewDictionary.length / CHAPTER_LENGTH,
                            )} 章`
                          : ''}
                      </button>
                    )}
                    <span className="font-normal text-gray-400 dark:text-gray-500">
                      {toDateKey(roadmapPhaseStart)} · {toDateKey(roadmapPhaseEnd)}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{item.goal}</div>
                  <div className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.state}</div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    {weeks.map((week) => {
                      const dictionary = idDictionaryMap[weekDictionaryIds[week]]
                      const isCurrentWeek = week === currentWeek
                      const trackingQuery =
                        isCurrentWeek && todayVocabularyTask ? `&studyDate=${todayKey}&studyTask=${todayVocabularyTask.id}` : ''
                      const weekHref = dictionary ? `/typing?dict=${encodeURIComponent(dictionary.id)}${trackingQuery}` : '/typing'
                      const roadmapWeekStart = addDays(startDate, (week - 1) * 7)
                      const roadmapWeekEnd = addDays(roadmapWeekStart, 6)

                      return (
                        <div
                          id={`study-roadmap-week-${week}`}
                          key={week}
                          className={`flex items-stretch gap-2 rounded-xl p-1 text-sm transition ${
                            isCurrentWeek
                              ? 'bg-indigo-500 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          <div
                            className={`min-w-0 flex-1 rounded-lg px-2 py-1 transition ${
                              isCurrentWeek ? 'hover:bg-indigo-600' : 'hover:bg-indigo-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <NavLink
                                  to={weekHref}
                                  onClick={isCurrentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                                  className={`font-medium ${isCurrentWeek ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
                                >
                                  第 {week} 周
                                </NavLink>
                                {week === previewWeek && !isCurrentWeek && (
                                  <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                                    预览
                                  </span>
                                )}
                                <NavLink
                                  to={weekHref}
                                  onClick={isCurrentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                                  className={`text-xs ${isCurrentWeek ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                  {toDateKey(roadmapWeekStart)} · {toDateKey(roadmapWeekEnd)}
                                </NavLink>
                              </div>
                              {isCurrentWeek && (
                                <NavLink
                                  to={weekHref}
                                  onClick={todayVocabularyTask ? () => saveStorage(storage) : undefined}
                                  className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white"
                                >
                                  当前周
                                </NavLink>
                              )}
                            </div>
                            {dictionary && (
                              <NavLink
                                to={weekHref}
                                onClick={isCurrentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                                className={`mt-1 block leading-5 ${isCurrentWeek ? 'text-indigo-50' : 'text-gray-500 dark:text-gray-400'}`}
                              >
                                <div>
                                  {dictionary.name} · {dictionary.length} 词 · 共 {Math.ceil(dictionary.length / CHAPTER_LENGTH)} 章
                                </div>
                                {isCurrentWeek && (
                                  <div className="mt-1 flex items-center gap-2 text-xs text-indigo-100">
                                    <span>本周已记录 {minutesLabel(weeklyActualMinutes)}</span>
                                    {weeklyPlannedMinutes > 0 && weeklyActualMinutes > weeklyPlannedMinutes && (
                                      <span>超出 {weeklyActualMinutes - weeklyPlannedMinutes} min</span>
                                    )}
                                    {weeklyPlannedMinutes > 0 && weeklyPlannedMinutes - weeklyActualMinutes > 0 && (
                                      <span>还差 {weeklyPlannedMinutes - weeklyActualMinutes} min</span>
                                    )}
                                    {weeklyPlannedMinutes > 0 && weeklyActualMinutes >= weeklyPlannedMinutes && (
                                      <span className="rounded-full bg-white/20 px-2 py-0.5 font-medium text-white">完成</span>
                                    )}
                                  </div>
                                )}
                              </NavLink>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMistakeChapter(null)
                              setPreviewWeek(week)
                              document.getElementById('study-dictionary-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                            className={`shrink-0 rounded-lg px-2.5 text-xs font-medium transition ${
                              previewWeek === week
                                ? isCurrentWeek
                                  ? 'bg-white text-indigo-600'
                                  : 'bg-indigo-500 text-white'
                                : isCurrentWeek
                                ? 'bg-white/20 text-white hover:bg-white/25'
                                : 'bg-white text-indigo-600 hover:bg-indigo-100 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {previewWeek === week ? '预览中' : '预览'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section
          id="study-settings"
          aria-labelledby="study-settings-title"
          className="my-card mt-10 scroll-mt-6 rounded-3xl bg-white p-4 dark:bg-gray-800 sm:p-7"
        >
          <h2 id="study-settings-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
            设置与同步
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            考试日期与每日目标、学习提醒、数据导入导出、Passkey 账户和跨设备同步。
          </p>
          <div className="mt-5 grid items-start gap-4 lg:grid-cols-2 [&>*]:max-w-none">
            <div
              data-testid="study-plan-settings"
              className="w-full max-w-md rounded-xl border border-gray-100 bg-gray-50 p-3 text-left dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-300">学习计划设置</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  考试日期
                  <input
                    type="date"
                    value={storage.settings.examDate}
                    onChange={(event) => changeExamDate(event.target.value)}
                    aria-label="考试日期"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </label>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  每天目标分钟
                  <input
                    type="number"
                    min={20}
                    max={240}
                    step={5}
                    value={dailyTargetInput}
                    onChange={(event) => setDailyTargetInput(event.target.value)}
                    onBlur={commitDailyTarget}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    placeholder="留空＝原计划"
                    aria-label="每天目标分钟"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </label>
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">每周学习日</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {[
                    [1, '一'],
                    [2, '二'],
                    [3, '三'],
                    [4, '四'],
                    [5, '五'],
                    [6, '六'],
                    [0, '日'],
                  ].map(([weekday, label]) => {
                    const active = storage.settings.studyDays.includes(Number(weekday))
                    return (
                      <button
                        key={weekday}
                        type="button"
                        aria-pressed={active}
                        aria-label={`周${label}学习`}
                        onClick={() => toggleStudyDay(Number(weekday))}
                        className={`rounded-md px-2 py-1 text-xs ${
                          active
                            ? 'bg-indigo-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        周{label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-2 text-[11px] leading-5 text-gray-400">
                26 周会按考试日重新排期：{storage.startDate} → {storage.settings.examDate}
                。调整只改变计划日期和目标，已有实际分钟与练习记录不会删除。
              </div>
            </div>

            <div className="w-full max-w-md rounded-xl border border-gray-100 bg-gray-50 p-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-300">提醒与离线安装</div>
                  <div className="mt-0.5 text-[11px] text-gray-400">
                    浏览器/PWA 运行时可按时提醒；完全关闭后，系统不会保证纯网页定时唤醒。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleReminder}
                  aria-pressed={reminderPreferences.enabled}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    reminderPreferences.enabled
                      ? 'bg-indigo-500 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {reminderPreferences.enabled ? '提醒已开启' : '开启提醒'}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <label className="text-gray-500 dark:text-gray-400">
                  提醒时间
                  <input
                    type="time"
                    value={reminderPreferences.time}
                    onChange={(event) => changeReminderTime(event.target.value)}
                    aria-label="学习提醒时间"
                    className="ml-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </label>
                {pwaState.installed ? (
                  <span className="ml-auto text-green-600 dark:text-green-300">已安装为 PWA</span>
                ) : pwaState.canInstall ? (
                  <button
                    type="button"
                    onClick={installPwa}
                    className="ml-auto rounded-lg border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    安装到设备
                  </button>
                ) : (
                  <span className="ml-auto text-gray-400">{pwaState.serviceWorkerReady ? '离线缓存已就绪' : '浏览器暂不支持安装'}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={exportStudyPlan}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                导出 JSON
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                导入 JSON
              </button>
              <input ref={importInputRef} type="file" accept="application/json,.json" onChange={importStudyPlan} className="hidden" />
            </div>
            <div
              data-testid="passkey-account"
              className="w-full max-w-md rounded-xl border border-gray-100 bg-gray-50 p-3 text-left dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-200">Passkey 账户 · 可选</div>
                  <div className="mt-0.5 text-[11px] leading-5 text-gray-500 dark:text-gray-400">
                    不创建账户也可继续匿名使用。Passkey 只绑定当前 learner，换设备登录后直接恢复同一份进度。
                  </div>
                </div>
                <span className={`text-[11px] ${accountInfo.registered ? 'text-green-600 dark:text-green-300' : 'text-gray-400'}`}>
                  {accountInfo.registered
                    ? `${accountInfo.passkeyCount} 个 Passkey · ${accountInfo.signedIn ? '已登录' : '已绑定'}`
                    : '匿名模式'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void createPasskey()}
                  disabled={!passkeyAvailable()}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {accountInfo.registered ? '添加另一个 Passkey' : '创建 Passkey'}
                </button>
                <button
                  type="button"
                  onClick={() => void loginPasskey()}
                  disabled={!passkeyAvailable()}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  使用 Passkey 登录
                </button>
                {!passkeyAvailable() && (
                  <span className="self-center text-[11px] text-amber-600 dark:text-amber-300">此浏览器不支持 Passkey</span>
                )}
              </div>
            </div>

            <div
              data-testid="learner-cohort-panel"
              className="w-full max-w-md rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-left dark:border-violet-900 dark:bg-violet-950/30"
            >
              <div className="text-xs font-medium text-violet-800 dark:text-violet-200">机构班级</div>
              <div className="mt-0.5 text-[11px] text-violet-700/80 dark:text-violet-300/80">
                教师提供的分班邀请码（16 位）用于把本设备学习进度计入该班定级汇总；换班会覆盖原绑定。
              </div>
              {learnerCohort ? (
                <p className="mt-2 text-xs text-violet-900 dark:text-violet-100">
                  已加入：<strong>{learnerCohort.name}</strong>
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">尚未加入班级。</p>
              )}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={cohortJoinInput}
                  onChange={(event) => setCohortJoinInput(event.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  aria-label="分班邀请码"
                  className="min-w-0 flex-1 rounded-lg border border-violet-200 bg-white px-2 py-1.5 font-mono text-xs uppercase tracking-wide text-gray-700 outline-none focus:border-violet-400 dark:border-violet-800 dark:bg-gray-900 dark:text-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    void joinCohort(cohortJoinInput.trim())
                      .then((cohort) => {
                        setLearnerCohort(cohort)
                        setCohortJoinInput('')
                        setCohortJoinMessage('已加入班级。')
                      })
                      .catch(() => setCohortJoinMessage('邀请码无效，请向教师确认后重试。'))
                  }}
                  disabled={cohortJoinInput.replace(/[\s-]/g, '').length < 16}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  加入
                </button>
              </div>
              {cohortJoinMessage && <p className="mt-1 text-[11px] text-violet-800 dark:text-violet-200">{cohortJoinMessage}</p>}
            </div>

            <div className="w-full max-w-md rounded-xl border border-gray-100 bg-gray-50 p-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-300">跨设备同步</div>
                  <div className="mt-0.5 text-[11px] text-gray-400">同步码等同账号密码；轮换后旧码失效，其他设备需要用新码重新绑定。</div>
                </div>
                <button
                  type="button"
                  onClick={generateSyncKey}
                  disabled={syncInfo.bound}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {syncKey ? '轮换同步码' : '生成同步码'}
                </button>
              </div>

              {syncKey && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="password"
                    readOnly
                    value={syncKey}
                    aria-label="当前学习进度同步码"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={copySyncKey}
                    className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600"
                  >
                    复制
                  </button>
                </div>
              )}

              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={syncKeyInput}
                  onChange={(event) => setSyncKeyInput(event.target.value)}
                  placeholder="在新设备粘贴 64 位同步码"
                  aria-label="连接已有学习进度的同步码"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-600 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={connectWithSyncKey}
                  disabled={!/^[a-fA-F0-9]{64}$/.test(syncKeyInput.trim())}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  绑定
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2 text-[11px] dark:border-gray-700">
                <span className={syncInfo.bound ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400'}>
                  {syncInfo.bound ? '此设备已通过同步码绑定' : '此设备使用独立会话'}
                </span>
                <span className="text-gray-400">有效同步码 {syncInfo.activeKeys}</span>
                <span className={syncStatus.pending > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-green-600 dark:text-green-300'}>
                  {syncStatus.pending > 0 ? `${syncStatus.pending} 条待同步` : syncStatus.message}
                </span>
                {syncInfo.bound && (
                  <button
                    type="button"
                    onClick={disconnectSync}
                    className="ml-auto rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-500 hover:border-amber-300 hover:text-amber-600 dark:border-gray-700 dark:bg-gray-800"
                  >
                    解绑此设备
                  </button>
                )}
                {syncKey && !syncInfo.bound && (
                  <button
                    type="button"
                    onClick={revokeSyncCode}
                    className="ml-auto rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-500 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800"
                  >
                    撤销同步码
                  </button>
                )}
              </div>
              <div className="mt-3 border-t border-red-100 pt-3 dark:border-red-950">
                <button
                  type="button"
                  onClick={() => void deleteAllData()}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-gray-800 dark:text-red-300"
                >
                  删除我的全部学习数据
                </button>
                <div className="mt-1 text-[11px] text-gray-400">会同时删除服务端进度、错题本、打卡、成就、周报、同步码与审计记录。</div>
              </div>
            </div>

            {pendingImport && (
              <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-900 dark:bg-amber-950/30">
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">确认覆盖现有学习计划？</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/70">
                    <div className="text-xs font-medium text-gray-400">现有计划</div>
                    <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">开始日：{storage.startDate}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {countRecordedMinuteDays(storage.minutes)} 天记录了分钟
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/70">
                    <div className="text-xs font-medium text-gray-400">导入文件</div>
                    <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">开始日：{pendingImport.startDate}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {countRecordedMinuteDays(pendingImport.minutes)} 天记录了分钟
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelImportStudyPlan}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={confirmImportStudyPlan}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700"
                  >
                    确认导入
                  </button>
                </div>
              </div>
            )}

            {importMessage && <div className="max-w-sm text-right text-xs text-gray-500 dark:text-gray-400">{importMessage}</div>}
          </div>
        </section>
      </main>
    </Layout>
  )
}
