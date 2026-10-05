import { weeklyStudyPlan, type DayPlan, type StudyTask } from './studyPlan.ts'

export type StudyPlanSettings = {
  examDate: string
  dailyTargetMinutes: number | null
  studyDays: number[]
}

export const PLAN_DAY_COUNT = 26 * 7
export const DEFAULT_STUDY_DAYS = [1, 2, 3, 4, 5, 6, 0]

const validDateKey = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

const parseDate = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const shiftDateKey = (key: string, amount: number) => {
  const date = parseDate(key)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

export const examDateFromStartDate = (startDate: string) => shiftDateKey(startDate, PLAN_DAY_COUNT - 1)

export const startDateFromExamDate = (examDate: string) => shiftDateKey(examDate, -(PLAN_DAY_COUNT - 1))

export const defaultStudyPlanSettings = (startDate: string): StudyPlanSettings => ({
  examDate: examDateFromStartDate(startDate),
  dailyTargetMinutes: null,
  studyDays: [...DEFAULT_STUDY_DAYS],
})

export const normalizeStudyPlanSettings = (
  value: Partial<StudyPlanSettings> | null | undefined,
  startDate: string,
): StudyPlanSettings => {
  const fallback = defaultStudyPlanSettings(startDate)
  const studyDays = Array.isArray(value?.studyDays)
    ? Array.from(new Set(value.studyDays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)))
    : fallback.studyDays
  return {
    examDate: validDateKey(value?.examDate) ? value.examDate : fallback.examDate,
    dailyTargetMinutes:
      value?.dailyTargetMinutes === null ||
      (Number.isInteger(value?.dailyTargetMinutes) &&
        Number(value?.dailyTargetMinutes) >= 20 &&
        Number(value?.dailyTargetMinutes) <= 240)
        ? (value?.dailyTargetMinutes ?? null)
        : fallback.dailyTargetMinutes,
    studyDays: studyDays.length ? studyDays : fallback.studyDays,
  }
}

export const isConfiguredStudyDay = (settings: StudyPlanSettings, weekday: number) =>
  settings.studyDays.includes(weekday)

export function scaleStudyTasks(tasks: StudyTask[], targetMinutes: number | null): StudyTask[] {
  if (targetMinutes === null || tasks.length === 0) return tasks
  const sourceTotal = tasks.reduce((sum, task) => sum + task.minutes, 0)
  if (sourceTotal <= 0) return tasks

  const allocations = tasks.map((task) => {
    const exact = (task.minutes / sourceTotal) * targetMinutes
    return { task, minutes: Math.max(1, Math.floor(exact)), fraction: exact - Math.floor(exact) }
  })
  let allocated = allocations.reduce((sum, item) => sum + item.minutes, 0)

  if (allocated < targetMinutes) {
    const order = [...allocations].sort((a, b) => b.fraction - a.fraction)
    let index = 0
    while (allocated < targetMinutes) {
      order[index % order.length].minutes += 1
      allocated += 1
      index += 1
    }
  } else if (allocated > targetMinutes) {
    const order = [...allocations].sort((a, b) => a.fraction - b.fraction)
    let index = 0
    while (allocated > targetMinutes && order.some((item) => item.minutes > 1)) {
      const item = order[index % order.length]
      if (item.minutes > 1) {
        item.minutes -= 1
        allocated -= 1
      }
      index += 1
    }
  }

  const byId = new Map(allocations.map((item) => [item.task.id, item.minutes]))
  return tasks.map((task) => ({ ...task, minutes: byId.get(task.id) ?? task.minutes }))
}

const defaultWeekSelected = (settings: StudyPlanSettings) =>
  DEFAULT_STUDY_DAYS.every((day) => settings.studyDays.includes(day)) && settings.studyDays.length === 7

const redistributedTasksForWeekday = (weekday: number, settings: StudyPlanSettings): StudyTask[] => {
  if (!isConfiguredStudyDay(settings, weekday)) return []
  if (defaultWeekSelected(settings)) {
    return weeklyStudyPlan.find((plan) => plan.weekday === weekday)?.tasks ?? []
  }
  const activeDays = DEFAULT_STUDY_DAYS.filter((day) => settings.studyDays.includes(day))
  const position = activeDays.indexOf(weekday)
  if (position < 0) return []
  const allTasks = weeklyStudyPlan.flatMap((plan) => plan.tasks)
  const start = Math.floor((position * allTasks.length) / activeDays.length)
  const end = Math.floor(((position + 1) * allTasks.length) / activeDays.length)
  return allTasks.slice(start, end)
}

export function getConfiguredDayTasks(
  dayPlan: DayPlan,
  settings: StudyPlanSettings,
  minimumMode: boolean,
  minimumTasks: StudyTask[],
): StudyTask[] {
  if (!isConfiguredStudyDay(settings, dayPlan.weekday)) return []
  if (minimumMode) return minimumTasks
  return scaleStudyTasks(redistributedTasksForWeekday(dayPlan.weekday, settings), settings.dailyTargetMinutes)
}

export const configuredWeeklyTargetMinutes = (
  plans: DayPlan[],
  settings: StudyPlanSettings,
  minimumTasks: StudyTask[] = [],
) =>
  plans.reduce(
    (total, plan) =>
      total +
      getConfiguredDayTasks(plan, settings, false, minimumTasks).reduce((sum, task) => sum + task.minutes, 0),
    0,
  )
