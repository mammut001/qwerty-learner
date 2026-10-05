import HeatmapCharts from './components/HeatmapCharts'
import KeyboardWithBarCharts from './components/KeyboardWithBarCharts'
import LineCharts from './components/LineCharts'
import { useWordStats } from './hooks/useWordStats'
import Layout from '@/components/Layout'
import {
  getStudySyncSnapshot,
  loadStudyAnalytics,
  subscribeStudySyncStatus,
  type StudyAnalytics,
  type StudySyncStatus,
} from '@/services/studyPlanSync'
import { isOpenDarkModeAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const minutesLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

const Analysis = () => {
  const navigate = useNavigate()
  const [, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<StudySyncStatus>(() => getStudySyncSnapshot())
  const hadPendingSync = useRef(false)

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const changeDarkModeState = () => {
    setIsOpenDarkMode((old) => !old)
  }

  useHotkeys(
    'ctrl+d',
    () => {
      changeDarkModeState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  const { isEmpty, exerciseRecord, wordRecord, wpmRecord, accuracyRecord, wrongTimeRecord } = useWordStats(
    dayjs().subtract(1, 'year').unix(),
    dayjs().unix(),
  )

  const refreshAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      setAnalytics(await loadStudyAnalytics())
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAnalytics()
    const unsubscribe = subscribeStudySyncStatus((status) => {
      setSyncStatus(status)
      if (status.pending > 0) {
        hadPendingSync.current = true
      } else if (status.phase === 'saved' && hadPendingSync.current) {
        hadPendingSync.current = false
        void refreshAnalytics()
      }
    })
    const onOnline = () => void refreshAnalytics()
    window.addEventListener('online', onOnline)
    return () => {
      unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [refreshAnalytics])

  const weeklyHistory = analytics?.plan.weeklyHistory ?? []
  const latestWeek = weeklyHistory.length ? weeklyHistory[weeklyHistory.length - 1] : null
  const weeklyMinutesData = weeklyHistory.map<[string, number]>((week) => [week.startDate, week.minutes])
  const weeklyCompletionData = weeklyHistory.map<[string, number]>((week) => [week.startDate, week.completionPercent])
  const wrongWordTrendData = weeklyHistory.map<[string, number]>((week) => [week.startDate, week.wrongWords])

  const syncTone =
    syncStatus.phase === 'offline' || syncStatus.phase === 'error'
      ? 'text-amber-600 dark:text-amber-300'
      : syncStatus.pending > 0 || syncStatus.phase === 'syncing' || syncStatus.phase === 'queued'
        ? 'text-indigo-600 dark:text-indigo-300'
        : 'text-green-600 dark:text-green-300'

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto pl-20 pr-20 pt-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <ScrollArea.Root className="flex-1 overflow-y-auto">
          <ScrollArea.Viewport className="h-full w-auto pb-[20rem] [&>div]:!block">
            <section className="mx-4 my-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-indigo-500">服务端学习统计</div>
                  <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">最近 12 周进度</h1>
                  <div className={`mt-2 text-xs ${syncTone}`}>
                    {syncStatus.message}
                    {syncStatus.pending > 0 ? ` · ${syncStatus.pending} 条待同步` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAnalytics()}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
                >
                  刷新统计
                </button>
              </div>

              {analyticsLoading && !analytics ? (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-400 dark:bg-gray-900">正在读取服务端统计…</div>
              ) : analytics ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
                      <div className="text-xs text-indigo-500">本周分钟</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {minutesLabel(analytics.plan.weeklyMinutes)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">计划 {minutesLabel(analytics.plan.weeklyPlannedMinutes)}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">本周完成率</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {latestWeek?.completionPercent ?? analytics.plan.weekCompletionPercent}%
                      </div>
                      <div className="mt-1 text-xs text-gray-500">完成 {analytics.plan.weeklyCompletedDays} / 7 天</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">本周错词</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{latestWeek?.wrongWords ?? 0}</div>
                      <div className="mt-1 text-xs text-gray-500">错误输入 {latestWeek?.wrongAttempts ?? 0} 次</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">连续学习</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{analytics.streak.current} 天</div>
                      <div className="mt-1 text-xs text-gray-500">最长 {analytics.streak.longest} 天</div>
                    </div>
                  </div>

                  {weeklyHistory.length > 0 && (
                    <div className="mt-5 grid gap-4 xl:grid-cols-3">
                      <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                        <LineCharts title="每周学习分钟数" name="分钟" data={weeklyMinutesData} />
                      </div>
                      <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                        <LineCharts title="每周完成率" name="完成率" data={weeklyCompletionData} suffix="%" />
                      </div>
                      <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                        <LineCharts title="每周错词趋势" name="错词数" data={wrongWordTrendData} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-900">
                  还没有服务端统计。离线时新记录会先保存在本机，联网后自动同步并更新这里。
                </div>
              )}
            </section>

            {isEmpty ? (
              <div className="align-items-center m-4 grid h-56 w-auto place-content-center overflow-hidden rounded-lg shadow-lg dark:bg-gray-600">
                <div className="text-lg text-gray-400">暂无词汇练习明细；上面的学习计划统计仍可独立使用。</div>
              </div>
            ) : (
              <>
                <div className="mx-4 my-8 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <HeatmapCharts title="过去一年练习次数热力图" data={exerciseRecord} />
                </div>
                <div className="mx-4 my-8 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <HeatmapCharts title="过去一年练习词数热力图" data={wordRecord} />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <LineCharts title="过去一年WPM趋势图" name="WPM" data={wpmRecord} />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <LineCharts title="过去一年正确率趋势图" name="正确率(%)" data={accuracyRecord} suffix="%" />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <KeyboardWithBarCharts title="按键错误次数排行" name="错误次数" data={wrongTimeRecord} />
                </div>
              </>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <div className="overflow-y-auto"></div>
      </div>
    </Layout>
  )
}

export default Analysis
