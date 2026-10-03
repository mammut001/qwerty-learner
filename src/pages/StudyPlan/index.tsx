import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { CHAPTER_LENGTH } from '@/constants'
import { idDictionaryMap } from '@/resources/dictionary'
import { db } from '@/utils/db'
import { wordListFetcher } from '@/utils/wordListFetcher'
import {
  getDayPlan,
  getStudyPhase,
  minimumModeTasks,
  studyPhases,
  weeklyStudyPlan,
  type StudyTask,
  type StudyTaskKind,
} from '@/resources/studyPlan'
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import useSWR from 'swr'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconCalendar from '~icons/tabler/calendar'
import IconCheck from '~icons/tabler/check'
import IconClock from '~icons/tabler/clock'
import IconPlayerPlay from '~icons/tabler/player-play'

type StudyPlanStorage = {
  startDate: string
  minutes: Record<string, Record<string, number>>
  minimumMode: Record<string, boolean>
}

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

function parseImportedStorage(value: unknown): StudyPlanStorage | null {
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
      if (!taskId || typeof minuteValue !== 'number' || !Number.isFinite(minuteValue) || minuteValue < 0) return null
      dayMinutes[taskId] = minuteValue
    }
    minutes[dateKey] = dayMinutes
  }

  const minimumMode: StudyPlanStorage['minimumMode'] = {}
  for (const [dateKey, modeValue] of Object.entries(value.minimumMode)) {
    if (!isDateKey(dateKey) || typeof modeValue !== 'boolean') return null
    minimumMode[dateKey] = modeValue
  }

  return {
    startDate: value.startDate,
    minutes,
    minimumMode,
  }
}

function countRecordedMinuteDays(minutes: StudyPlanStorage['minutes']) {
  return Object.values(minutes).filter((dayMinutes) => Object.values(dayMinutes).some((value) => value > 0)).length
}

function loadStorage(todayKey: string): StudyPlanStorage {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StudyPlanStorage>
      return {
        startDate: parsed.startDate ?? todayKey,
        minutes: parsed.minutes ?? {},
        minimumMode: parsed.minimumMode ?? {},
      }
    }
  } catch {
    // Ignore malformed local storage and start clean.
  }

  return {
    startDate: todayKey,
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
  const [pendingImport, setPendingImport] = useState<StudyPlanStorage | null>(null)
  const [highlightedMissedDayKey, setHighlightedMissedDayKey] = useState<string | null>(null)

  const saveStorage = (next: StudyPlanStorage) => {
    setStorage(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // The plan still works in-memory if localStorage is unavailable.
    }
  }

  const startDate = parseDateKey(storage.startDate)
  const dayOffset = Math.max(0, calendarDayNumber(today) - calendarDayNumber(startDate))
  const currentWeekIndex = Math.min(25, Math.floor(dayOffset / 7))
  const currentWeek = currentWeekIndex + 1
  const phase = getStudyPhase(currentWeek)
  const phaseProgress = Math.min(100, Math.round((currentWeek / 26) * 100))
  const targetDictionary = idDictionaryMap[weekDictionaryIds[currentWeek]]
  const [previewWeek, setPreviewWeek] = useState(currentWeek)
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
  const {
    data: previewWordList,
    error: previewWordListError,
    isLoading: isPreviewWordListLoading,
  } = useSWR(previewDictionary?.url ?? null, wordListFetcher)

  const normalizedPreviewFilter = previewFilter.trim().toLocaleLowerCase()
  const previewFilterCount =
    Number(Boolean(normalizedPreviewFilter)) +
    Number(onlyMistakenPreviewWords) +
    Number(selectedMistakeChapter !== null)
  const hasPreviewFilters = previewFilterCount > 0
  const clearPreviewFilters = () => {
    setPreviewFilter('')
    setOnlyMistakenPreviewWords(false)
    setSelectedMistakeChapter(null)
    setPreviewPage(1)
  }
  const filteredPreviewWords = normalizedPreviewFilter
    ? (previewWordList ?? []).filter((word) =>
        [word.name, word.notation ?? '', ...word.trans].some((value) =>
          value.toLocaleLowerCase().includes(normalizedPreviewFilter),
        ),
      )
    : (previewWordList ?? [])

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
  }, [previewDictionary?.id, previewWeek])

  const previewErrorWordsStatus =
    previewErrorWordsState.dictId === previewDictionary?.id ? previewErrorWordsState.status : 'loading'
  const previewErrorWords =
    previewErrorWordsStatus === 'ready' ? previewErrorWordsState.words : new Set<string>()
  const previewMistakeSummary =
    previewErrorWordsStatus === 'ready' &&
    !isPreviewWordListLoading &&
    !previewWordListError &&
    previewWordList
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

    const selectedChapterStillExists = previewMistakeSummary.chapters.some(
      ({ chapter }) => chapter === selectedMistakeChapter,
    )
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
    phase.id === 1
      ? '/conjugation?verb=prendre&tense=passeCompose&mode=practice&scope=current'
      : '/conjugation?mode=practice&scope=mixed'
  const todayPlan = getDayPlan(today.getDay())
  const minimumMode = Boolean(storage.minimumMode[todayKey])
  const todayTasks = minimumMode ? minimumModeTasks : todayPlan.tasks
  const todayVocabularyTask = todayTasks.find((task) => task.kind === 'vocabulary' && task.href === '/gallery')
  const previewTrackingQuery =
    previewWeek === currentWeek && todayVocabularyTask
      ? `&studyDate=${todayKey}&studyTask=${todayVocabularyTask.id}`
      : ''
  const previewPracticeHref = previewDictionary
    ? `/?dict=${encodeURIComponent(previewDictionary.id)}${previewTrackingQuery}`
    : '/'
  const selectedMistakeChapterIndex =
    selectedMistakeChapter !== null ? selectedMistakeChapter - 1 : null
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
  const weeklyPlannedMinutes = weeklyStudyPlan.reduce(
    (total, day) => total + day.tasks.reduce((dayTotal, task) => dayTotal + task.minutes, 0),
    0,
  )
  const actualMinutesForTasks = (dateKey: string, tasks: StudyTask[]) =>
    tasks.reduce((sum, task) => sum + (storage.minutes[dateKey]?.[task.id] ?? 0), 0)

  const weeklyActualMinutes = currentPlanWeekDays.reduce((total, item) => {
    const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
    return total + actualMinutesForTasks(item.key, tasks)
  }, 0)
  const weeklyCompletedDays = currentPlanWeekDays.filter((item) => {
    const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    return plannedMinutes > 0 && actualMinutes >= plannedMinutes
  }).length
  const weeklyMissedDays = currentPlanWeekDays.filter((item) => {
    const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    const complete = plannedMinutes > 0 && actualMinutes >= plannedMinutes
    return item.key < todayKey && plannedMinutes > 0 && !complete
  }).length
  const earliestMissedDayKey = currentPlanWeekDays.reduce<string | null>((earliest, item) => {
    const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    const complete = plannedMinutes > 0 && actualMinutes >= plannedMinutes
    const missed = item.key < todayKey && plannedMinutes > 0 && !complete
    if (!missed) return earliest
    return earliest === null || item.key < earliest ? item.key : earliest
  }, null)
  const earliestMissedDayName =
    currentPlanWeekDays.find((item) => item.key === earliestMissedDayKey)?.day.name ?? null
  const earliestMissedDayRemainingMinutes = (() => {
    const item = currentPlanWeekDays.find((dayItem) => dayItem.key === earliestMissedDayKey)
    if (!item) return null
    const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
    const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
    const actualMinutes = actualMinutesForTasks(item.key, tasks)
    return plannedMinutes - actualMinutes
  })()
  const highlightedMissedDayStillMissed =
    highlightedMissedDayKey !== null &&
    currentPlanWeekDays.some((item) => {
      if (item.key !== highlightedMissedDayKey) return false
      const tasks = storage.minimumMode[item.key] ? minimumModeTasks : item.day.tasks
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

  const todayActualMinutes = actualMinutesForTasks(todayKey, todayTasks)
  const todayPlannedMinutes = todayTasks.reduce((sum, task) => sum + task.minutes, 0)

  const recentThreeDays = [0, -1, -2].map((offset) => {
    const date = addDays(today, offset)
    const key = toDateKey(date)
    const day = getDayPlan(date.getDay())
    const tasks = storage.minimumMode[key] ? minimumModeTasks : day.tasks
    const total = actualMinutesForTasks(key, tasks)
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

  const changeStartDate = (value: string) => {
    if (!value) return
    saveStorage({
      ...storage,
      startDate: value,
    })
  }

  const exportStudyPlan = () => {
    const blob = new Blob([JSON.stringify(storage, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qwerty-fr-study-plan-${todayKey}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setImportMessage('已导出学习计划 JSON。')
  }

  const importStudyPlan = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setPendingImport(null)

    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const imported = parseImportedStorage(parsed)
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

  const confirmImportStudyPlan = () => {
    if (!pendingImport) return
    saveStorage(pendingImport)
    setPendingImport(null)
    setImportMessage('导入成功：学习计划数据已更新。')
  }

  const cancelImportStudyPlan = () => {
    setPendingImport(null)
    setImportMessage('已取消导入，现有数据未修改。')
  }

  const renderTask = (task: StudyTask, dateKey: string, compact = false) => {
    const actual = storage.minutes[dateKey]?.[task.id] ?? 0
    const complete = actual >= task.minutes
    let taskHref = task.href
    let actionLabel = task.actionLabel

    if (task.kind === 'vocabulary' && task.href === '/gallery' && targetDictionary) {
      taskHref = `/?dict=${targetDictionary.id}&studyDate=${dateKey}&studyTask=${task.id}`
      actionLabel = `练 ${targetDictionary.name}`
    } else if (task.href === '/grammar-session') {
      actionLabel = '练 Passé composé vs imparfait'
    } else if (task.href === '/conjugation') {
      taskHref = conjugationHref
      actionLabel = phase.id === 1 ? '练 prendre · Passé composé' : '开始核心动词练习'
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
              {actual > task.minutes && (
                <span className="text-xs text-gray-400">超出 {actual - task.minutes} min</span>
              )}
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
      <Header>
        <NavLink
          to="/"
          className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <IconArrowLeft />
          返回练习
        </NavLink>
        <NavLink
          to="/grammar-session"
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          30分钟语法
        </NavLink>
        <NavLink
          to="/conjugation"
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          动词变位
        </NavLink>
      </Header>

      <main className="container mx-auto w-full max-w-6xl flex-1 px-10 pb-12">
        <section className="my-card rounded-3xl bg-white p-7 dark:bg-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-500">
                <IconCalendar />
                TCF Canada · 26 周学习计划
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                Week {currentWeek} / 26 · {phase.name}
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{phase.goal}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                计划开始日
                <input
                  type="date"
                  value={storage.startDate}
                  onChange={(event) => changeStartDate(event.target.value)}
                  className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
              </label>

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
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={importStudyPlan}
                  className="hidden"
                />
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
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${phaseProgress}%` }} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
              <div className="text-xs text-indigo-500">当前阶段</div>
              <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                第 {phase.weeks[0]}–{phase.weeks[1]} 周 · {phase.name}
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{phase.state}</div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="text-xs text-gray-400">本周实际</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{minutesLabel(weeklyActualMinutes)}</div>
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
              <div className="mt-1 text-sm text-gray-500">计划约 {minutesLabel(weeklyPlannedMinutes)}（≈ 7 小时）</div>
              <div className="mt-1 text-sm text-gray-500">完成 {weeklyCompletedDays} / 7 天</div>
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
                  <span className="text-gray-400">最早是{earliestMissedDayName} · {earliestMissedDayKey}</span>
                  {earliestMissedDayRemainingMinutes !== null && earliestMissedDayRemainingMinutes > 0 && (
                    <span className="text-gray-400">还差 {earliestMissedDayRemainingMinutes} min</span>
                  )}
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-500">未完成 {weeklyMissedDays} 天</div>
              )}
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="text-xs text-gray-400">连续性</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{activeRecentDays} / 3 天有学习</div>
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
                        document
                          .getElementById(`study-week-day-${item.key}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {phase.focus.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-indigo-500">
                <span>词库预览</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  正在预览第 {previewWeek} 周
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {previewDictionary?.name ?? '词库加载失败'}
              </h2>
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
                          onClick={
                            previewWeek === currentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined
                          }
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
                  const wordPracticeHref =
                    chapterIndex !== null ? `${previewPracticeHref}&chapter=${chapterIndex}` : previewPracticeHref

                  return (
                    <NavLink
                      key={`${word.name}-${index}`}
                      to={wordPracticeHref}
                      onClick={
                        previewWeek === currentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined
                      }
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
                    document
                      .getElementById(`study-week-day-${todayKey}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                  className="text-sm font-medium text-indigo-500 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  今日计划 · {todayPlan.name} · {todayKey}
                </button>
              ) : (
                <div className="text-sm font-medium text-indigo-500">今日计划 · {todayPlan.name} · {todayKey}</div>
              )}
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {minimumMode ? '10 分钟最低模式' : todayPlan.totalLabel}
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
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">{todayTasks.map((task) => renderTask(task, todayKey))}</div>
        </section>

        <section className="mt-10">
          <div>
            <div className="text-sm font-medium text-indigo-500">正常周 · 约 7 小时</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">本周安排</h2>
              {currentPlanWeekDays.length === 7 && (
                <span className="text-sm font-normal text-gray-400">
                  {currentPlanWeekDays[0].key} · {currentPlanWeekDays[currentPlanWeekDays.length - 1].key}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">五六日保持轻量；周四做 TCF 专项，周日只复盘错误。</p>
          </div>

          <div className="mt-5 space-y-4">
            {currentPlanWeekDays.map(({ key, day }) => {
              const dayMinimumMode = Boolean(storage.minimumMode[key])
              const dayTasks = dayMinimumMode ? minimumModeTasks : day.tasks
              const dayActual = actualMinutesForTasks(key, dayTasks)
              const dayPlannedMinutes = dayTasks.reduce((sum, task) => sum + task.minutes, 0)
              const dayComplete = dayPlannedMinutes > 0 && dayActual >= dayPlannedMinutes
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
                        {dayMinimumMode ? '10 分钟最低模式' : day.totalLabel}
                        {day.note ? ` · ${day.note}` : ''}
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

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {dayTasks.map((task) => renderTask(task, key, true))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="text-sm font-medium text-indigo-500">六个月路线</div>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">26 周怎么推进</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studyPhases.map((item) => {
              const active = item.id === phase.id
              const weeks = Array.from({ length: item.weeks[1] - item.weeks[0] + 1 }, (_, index) => item.weeks[0] + index)

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 ${
                    active
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="text-xs font-medium text-indigo-500">
                    第 {item.weeks[0]}–{item.weeks[1]} 周 {active ? '· 当前阶段' : ''}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{item.goal}</div>
                  <div className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.state}</div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    {weeks.map((week) => {
                      const dictionary = idDictionaryMap[weekDictionaryIds[week]]
                      const isCurrentWeek = week === currentWeek
                      const trackingQuery =
                        isCurrentWeek && todayVocabularyTask
                          ? `&studyDate=${todayKey}&studyTask=${todayVocabularyTask.id}`
                          : ''
                      const weekHref = dictionary ? `/?dict=${encodeURIComponent(dictionary.id)}${trackingQuery}` : '/'

                      return (
                        <div
                          key={week}
                          className={`flex items-stretch gap-2 rounded-xl p-1 text-sm transition ${
                            isCurrentWeek
                              ? 'bg-indigo-500 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          <NavLink
                            to={weekHref}
                            onClick={isCurrentWeek && todayVocabularyTask ? () => saveStorage(storage) : undefined}
                            className={`min-w-0 flex-1 rounded-lg px-2 py-1 transition ${
                              isCurrentWeek ? 'hover:bg-indigo-600' : 'hover:bg-indigo-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className={`font-medium ${isCurrentWeek ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                第 {week} 周
                              </span>
                              {isCurrentWeek && (
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">当前周</span>
                              )}
                            </div>
                            {dictionary && (
                              <>
                                <div className={`mt-1 leading-5 ${isCurrentWeek ? 'text-indigo-50' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {dictionary.name} · {dictionary.length} 词
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
                                      <span className="rounded-full bg-white/20 px-2 py-0.5 font-medium text-white">
                                        完成
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </NavLink>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMistakeChapter(null)
                              setPreviewWeek(week)
                            }}
                            className={`shrink-0 rounded-lg px-2.5 text-xs font-medium transition ${
                              previewWeek === week
                                ? isCurrentWeek
                                  ? 'bg-white text-indigo-600'
                                  : 'bg-indigo-500 text-white'
                                : isCurrentWeek
                                  ? 'bg-white/15 text-white hover:bg-white/25'
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
      </main>
    </Layout>
  )
}
