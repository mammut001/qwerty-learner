import Header from '@/components/Header'
import Layout from '@/components/Layout'
import {
  getDayPlan,
  getStudyPhase,
  minimumModeTasks,
  studyPhases,
  weeklyStudyPlan,
  type StudyTask,
  type StudyTaskKind,
} from '@/resources/studyPlan'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
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

const STORAGE_KEY = 'qwerty-fr-study-plan-v1'
const DAY_MS = 24 * 60 * 60 * 1000

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
  const todayPlan = getDayPlan(today.getDay())
  const minimumMode = Boolean(storage.minimumMode[todayKey])
  const todayTasks = minimumMode ? minimumModeTasks : todayPlan.tasks

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

  const todayActualMinutes = actualMinutesForTasks(todayKey, todayTasks)
  const todayPlannedMinutes = todayTasks.reduce((sum, task) => sum + task.minutes, 0)

  const recentThreeDays = [0, -1, -2].map((offset) => {
    const date = addDays(today, offset)
    const key = toDateKey(date)
    const day = getDayPlan(date.getDay())
    const tasks = storage.minimumMode[key] ? minimumModeTasks : day.tasks
    const total = actualMinutesForTasks(key, tasks)
    return { key, total }
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

  const renderTask = (task: StudyTask, dateKey: string, compact = false) => {
    const actual = storage.minutes[dateKey]?.[task.id] ?? 0
    const complete = actual >= task.minutes

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
          {task.href ? (
            <NavLink
              to={task.href}
              className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm text-white transition hover:bg-indigo-600"
            >
              <IconPlayerPlay />
              {task.actionLabel ?? '开始'}
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

            <label className="text-sm text-gray-500 dark:text-gray-400">
              计划开始日
              <input
                type="date"
                value={storage.startDate}
                onChange={(event) => changeStartDate(event.target.value)}
                className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </label>
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
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{minutesLabel(weeklyActualMinutes)}</div>
              <div className="mt-1 text-sm text-gray-500">计划约 {minutesLabel(weeklyPlannedMinutes)}（≈ 7 小时）</div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="text-xs text-gray-400">连续性</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{activeRecentDays} / 3 天有学习</div>
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

        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-indigo-500">今日计划 · {todayPlan.name}</div>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {minimumMode ? '10 分钟最低模式' : todayPlan.totalLabel}
              </h2>
              {todayPlan.note && <p className="mt-1 text-sm text-gray-500">{todayPlan.note}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <IconClock />
                今天 {todayActualMinutes} / {todayPlannedMinutes} min
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
            <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">本周安排</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">五六日保持轻量；周四做 TCF 专项，周日只复盘错误。</p>
          </div>

          <div className="mt-5 space-y-4">
            {currentPlanWeekDays.map(({ key, day }) => {
              const dayMinimumMode = Boolean(storage.minimumMode[key])
              const dayTasks = dayMinimumMode ? minimumModeTasks : day.tasks
              const dayActual = actualMinutesForTasks(key, dayTasks)
              const isToday = key === todayKey

              return (
                <div
                  key={key}
                  className={`rounded-2xl border p-5 ${
                    isToday
                      ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20'
                      : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{day.name}</h3>
                        {isToday && <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">今天</span>}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {dayMinimumMode ? '10 分钟最低模式' : day.totalLabel}
                        {day.note ? ` · ${day.note}` : ''}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-500">已记录 {dayActual} min</div>
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
                    第 {item.weeks[0]}–{item.weeks[1]} 周 {active ? '· 当前' : ''}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{item.goal}</div>
                  <div className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.state}</div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </Layout>
  )
}
