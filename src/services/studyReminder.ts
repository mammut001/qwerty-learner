import { getDayPlan, minimumModeTasks } from '../resources/studyPlan.ts'
import {
  getConfiguredDayTasks,
  normalizeStudyPlanSettings,
  type StudyPlanSettings,
} from '../resources/studyPlanSchedule.ts'
import type { StudyPlanStorage } from './studyPlanSync'

export type StudyReminderPreferences = {
  enabled: boolean
  time: string
}

const PLAN_KEY = 'qwerty-fr-study-plan-v1'
const REMINDER_KEY = 'qwerty-fr-study-reminder-v1'
const LAST_KEY = 'qwerty-fr-study-reminder-last-v1'
const DEFAULT: StudyReminderPreferences = { enabled: false, time: '19:00' }
let started = false
let timer: ReturnType<typeof setInterval> | undefined

const localDay = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStudyReminderPreferences(): StudyReminderPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(REMINDER_KEY) ?? 'null') as Partial<StudyReminderPreferences> | null
    const time = typeof parsed?.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(parsed.time) ? parsed.time : DEFAULT.time
    return { enabled: parsed?.enabled === true, time }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveStudyReminderPreferences(next: StudyReminderPreferences) {
  const normalized = {
    enabled: next.enabled === true,
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(next.time) ? next.time : DEFAULT.time,
  }
  localStorage.setItem(REMINDER_KEY, JSON.stringify(normalized))
  if (normalized.enabled) void checkStudyReminder()
  return normalized
}

export async function requestStudyReminderPermission() {
  if (!('Notification' in window)) return 'unsupported' as const
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    saveStudyReminderPreferences({ ...getStudyReminderPreferences(), enabled: false })
  }
  return permission
}

function readPlan(): StudyPlanStorage | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StudyPlanStorage
    if (!parsed.startDate || !parsed.minutes || !parsed.minimumMode) return null
    return {
      ...parsed,
      settings: normalizeStudyPlanSettings(parsed.settings as Partial<StudyPlanSettings> | undefined, parsed.startDate),
    }
  } catch {
    return null
  }
}

async function showStudyNotification(remaining: number) {
  const title = '今天的法语计划还没完成'
  const body = remaining > 0 ? `还差约 ${remaining} 分钟，打开 Qwerty Français 继续学习。` : '打开 Qwerty Français 看看今天的计划。'
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        icon: new URL(`${import.meta.env.BASE_URL}android-chrome-192x192.png`, window.location.href).pathname,
        badge: new URL(`${import.meta.env.BASE_URL}favicon-32x32.png`, window.location.href).pathname,
        tag: 'qwerty-fr-study-reminder',
        data: { url: new URL(`${import.meta.env.BASE_URL}study-plan`, window.location.href).href },
      })
      return
    } catch {
      // Fall back to a page notification below.
    }
  }
  new Notification(title, { body, tag: 'qwerty-fr-study-reminder' })
}

export async function checkStudyReminder(now = new Date()) {
  const preferences = getStudyReminderPreferences()
  if (!preferences.enabled || !('Notification' in window) || Notification.permission !== 'granted') return false
  const [hour, minute] = preferences.time.split(':').map(Number)
  if (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute) return false

  const today = localDay(now)
  if (localStorage.getItem(LAST_KEY) === today) return false
  const plan = readPlan()
  if (!plan) return false
  const dayPlan = getDayPlan(now.getDay())
  const tasks = getConfiguredDayTasks(dayPlan, plan.settings, Boolean(plan.minimumMode[today]), minimumModeTasks)
  if (!tasks.length) return false

  const planned = tasks.reduce((sum, task) => sum + task.minutes, 0)
  const actual = tasks.reduce((sum, task) => sum + (plan.minutes[today]?.[task.id] ?? 0), 0)
  if (actual >= planned) return false

  await showStudyNotification(Math.max(0, planned - actual))
  localStorage.setItem(LAST_KEY, today)
  return true
}

export function startStudyReminderScheduler() {
  if (started || typeof window === 'undefined') return
  started = true
  const check = () => void checkStudyReminder()
  timer = setInterval(check, 60_000)
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  check()
}

export function stopStudyReminderSchedulerForTests() {
  if (timer) clearInterval(timer)
  timer = undefined
  started = false
}
