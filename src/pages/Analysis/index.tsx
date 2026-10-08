import LineCharts from './components/LineCharts'
import Layout from '@/components/Layout'
import { placementSectionLabel } from '@/resources/placementTest'
import {
  type ReviewQueueItem,
  type StudyAchievement,
  type StudyAnalytics,
  type StudyCheckinSummary,
  type StudyCsvKind,
  type StudySyncStatus,
  type TrendPoint,
  type WeeklyStudyReport,
  addStudyMinutes,
  applyStudyMakeup,
  downloadStudyCsv,
  exportWeeklyStudyReports,
  flushStudyProgress,
  getStudySyncSnapshot,
  loadReviewQueue,
  loadStudyAchievements,
  loadStudyAnalytics,
  loadStudyCheckins,
  loadWeeklyStudyReports,
  submitReviewResult,
  subscribeStudySyncStatus,
} from '@/services/studyPlanSync'
import { isOpenDarkModeAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'

type TrendScale = 'daily' | 'weekly' | 'monthly'

const minutesLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

const scaleLabels: Record<TrendScale, string> = {
  daily: '按天',
  weekly: '按周',
  monthly: '按月',
}

const kindLabels: Record<ReviewQueueItem['kind'], string> = {
  vocabulary: '单词',
  grammar: '语法',
  conjugation: '变位',
}

const accuracySeries = (points: TrendPoint[], key: 'vocabularyAccuracy' | 'grammarAccuracy' | 'conjugationAccuracy') =>
  points.flatMap<[string, number]>((point) => (point[key] === null ? [] : [[point.startDate, point[key] as number]]))

const heatmapCellClass = (minutes: number, maxMinutes: number) => {
  if (minutes <= 0) return 'bg-gray-100 dark:bg-gray-800'
  const ratio = maxMinutes ? minutes / maxMinutes : 0
  if (ratio >= 0.75) return 'bg-indigo-600 dark:bg-indigo-400'
  if (ratio >= 0.5) return 'bg-indigo-500 dark:bg-indigo-500'
  if (ratio >= 0.25) return 'bg-indigo-300 dark:bg-indigo-700'
  return 'bg-indigo-200 dark:bg-indigo-900'
}

const rankingCard = (title: string, items: StudyAnalytics['rankings']['vocabulary'], emptyText: string) => (
  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
    {items.length === 0 ? (
      <div className="mt-3 text-sm text-gray-400">{emptyText}</div>
    ) : (
      <div className="mt-3 space-y-2">
        {items.slice(0, 8).map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <span className="w-5 text-right text-xs text-gray-400">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200">{item.label}</span>
            <span className="text-red-500">{item.errors} 错</span>
            <span className="w-12 text-right text-xs text-gray-400">{item.accuracy === null ? '—' : `${item.accuracy}%`}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

const Analysis = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedStudyDate = searchParams.get('studyDate')
  const requestedStudyTask = searchParams.get('studyTask')
  const [, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [trendScale, setTrendScale] = useState<TrendScale>('weekly')
  const [syncStatus, setSyncStatus] = useState<StudySyncStatus>(() => getStudySyncSnapshot())
  const [checkins, setCheckins] = useState<StudyCheckinSummary>({
    items: [],
    daily: [],
    streak: { current: 0, longest: 0 },
  })
  const [achievements, setAchievements] = useState<StudyAchievement[]>([])
  const [weeklyReports, setWeeklyReports] = useState<WeeklyStudyReport[]>([])
  const [featureMessage, setFeatureMessage] = useState('')
  const hadPendingSync = useRef(false)

  const onBack = useCallback(() => {
    navigate('/study-plan')
  }, [navigate])

  useHotkeys(
    'ctrl+d',
    () => {
      setIsOpenDarkMode((old) => !old)
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  useHotkeys('enter,esc', onBack, { preventDefault: true })

  const refreshAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      setAnalytics(await loadStudyAnalytics())
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const refreshReview = useCallback(async () => {
    setReviewLoading(true)
    try {
      setReviewQueue(await loadReviewQueue())
    } finally {
      setReviewLoading(false)
    }
  }, [])

  const refreshFeatures = useCallback(async () => {
    try {
      const [checkinData, achievementData, reportData] = await Promise.all([
        loadStudyCheckins(),
        loadStudyAchievements(),
        loadWeeklyStudyReports(),
      ])
      setCheckins(checkinData)
      setAchievements(achievementData)
      setWeeklyReports(reportData)
    } catch {
      setFeatureMessage('打卡、成就或周报暂时无法读取。')
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshAnalytics(), refreshReview(), refreshFeatures()])
  }, [refreshAnalytics, refreshFeatures, refreshReview])

  useEffect(() => {
    void refreshAll()
    const unsubscribe = subscribeStudySyncStatus((status) => {
      setSyncStatus(status)
      if (status.pending > 0) {
        hadPendingSync.current = true
      } else if (status.phase === 'saved' && hadPendingSync.current) {
        hadPendingSync.current = false
        void refreshAll()
      }
    })
    const onOnline = () => void refreshAll()
    window.addEventListener('online', onOnline)
    return () => {
      unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [refreshAll])

  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index - 1)
    return date.toISOString().slice(0, 10)
  })

  const makeupDay = async (day: string) => {
    setFeatureMessage('')
    try {
      setCheckins(await applyStudyMakeup(day))
      setAchievements(await loadStudyAchievements())
      setFeatureMessage(`${day} 补签成功。`)
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      const messages: Record<string, string> = {
        MAKEUP_WINDOW_EXPIRED: '只能补签最近 7 天。',
        NOT_A_STUDY_DAY: '这一天不是当前计划学习日。',
        ALREADY_CHECKED_IN: '这一天已经打卡或补签。',
        MAKEUP_MINUTES_REQUIRED: '补签要求当天至少有 10 分钟学习记录。',
        MAKEUP_LIMIT_REACHED: '每个自然周最多补签 2 次。',
      }
      setFeatureMessage(messages[code] ?? '补签失败，请检查网络与学习记录。')
    }
  }

  const exportReports = async () => {
    try {
      const payload = await exportWeeklyStudyReports()
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qwerty-study-weekly-reports-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setFeatureMessage('周报导出失败，请联网后重试。')
    }
  }

  const exportCsv = async (kind: StudyCsvKind) => {
    try {
      const payload = await downloadStudyCsv(kind)
      const blob = new Blob([payload.text], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = payload.filename.replace('.csv', `-${new Date().toISOString().slice(0, 10)}.csv`)
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setFeatureMessage('CSV 导出失败，请确认联网且待同步记录已经保存。')
    }
  }

  const printWeeklyReports = () => window.print()

  const reviewResult = async (item: ReviewQueueItem, quality: number) => {
    submitReviewResult(item, quality)
    if (requestedStudyTask === 'smart-review' && requestedStudyDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedStudyDate)) {
      try {
        addStudyMinutes(requestedStudyDate, requestedStudyTask, 2)
      } catch {
        // The review result itself remains durable even if smart-task minute tracking cannot be queued.
      }
    }
    setReviewQueue((old) => old.filter((candidate) => candidate.itemId !== item.itemId))
    await flushStudyProgress()
    if (getStudySyncSnapshot().pending === 0) void refreshAll()
  }

  const syncTone =
    syncStatus.phase === 'offline' || syncStatus.phase === 'error'
      ? 'text-amber-600 dark:text-amber-300'
      : syncStatus.pending > 0 || syncStatus.phase === 'syncing' || syncStatus.phase === 'queued'
      ? 'text-indigo-600 dark:text-indigo-300'
      : 'text-green-600 dark:text-green-300'

  const points = analytics?.trends[trendScale] ?? []
  const minutesData = points.map<[string, number]>((point) => [point.startDate, point.minutes])
  const vocabularyData = accuracySeries(points, 'vocabularyAccuracy')
  const grammarData = accuracySeries(points, 'grammarAccuracy')
  const conjugationData = accuracySeries(points, 'conjugationAccuracy')
  const dashboard = analytics?.dashboard
  const heatmapMax = dashboard ? Math.max(1, ...dashboard.heatmap.map((item) => item.minutes)) : 1
  const mastery = dashboard?.mastery
  const projection = dashboard?.projection
  const tcfListeningData = (analytics?.tcf?.listening?.trend ?? []).map<[string, number]>((item) => [
    new Date(item.finishedAt).toISOString(),
    item.score,
  ])
  const tcfReadingData = (analytics?.tcf?.reading?.trend ?? []).map<[string, number]>((item) => [
    new Date(item.finishedAt).toISOString(),
    item.score,
  ])
  const tcfWritingData = (analytics?.tcf?.writing?.trend ?? []).map<[string, number]>((item) => [
    new Date(item.finishedAt).toISOString(),
    item.score,
  ])
  const tcfSpeakingData = (analytics?.tcf?.speaking?.trend ?? []).map<[string, number]>((item) => [
    new Date(item.finishedAt).toISOString(),
    item.score,
  ])
  const allFourReachedNclc7 = Boolean(
    analytics?.tcf?.listening?.gapToTarget === 0 &&
      analytics?.tcf?.reading?.gapToTarget === 0 &&
      analytics?.tcf?.writing?.gapToTarget === 0 &&
      analytics?.tcf?.speaking?.gapToTarget === 0,
  )

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto px-4 pt-2 sm:px-6 lg:px-20">
        <ScrollArea.Root className="flex-1 overflow-y-auto">
          <ScrollArea.Viewport className="h-full w-auto pb-[20rem] [&>div]:!block">
            <section
              aria-labelledby="learning-dashboard-title"
              data-testid="learning-dashboard"
              className="mx-0 my-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:mx-4 sm:my-8 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-300">学习数据仪表盘</div>
                  <h1 id="learning-dashboard-title" className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">
                    进度、掌握度与完成预测
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    数据来自服务端统计；断网或后端暂不可用时会自动读取最近一次本地缓存。
                  </p>
                </div>
                {projection && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-100">
                    <div className="text-xs font-medium">按近 28 天速度预测</div>
                    <div className="mt-1 text-lg font-semibold">{projection.predictedCompletionDate ?? '数据不足'}</div>
                    <div className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                      当前 {projection.averageDailyMinutes} min/天 · 计划 {projection.scheduledCompletionDate}
                    </div>
                  </div>
                )}
              </div>

              {analytics?.placement ? (
                <section
                  data-testid="analysis-placement"
                  className="mt-5 rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                        定级画像 · CEFR {analytics.placement.cefrLevel}
                      </h2>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                        推荐从 Week {analytics.placement.suggestedStartWeek} 的内容密度练起；弱项优先{' '}
                        <strong>{analytics.placement.weakestSection}</strong>
                        {analytics.placement.secondWeakestSection ? ` / ${analytics.placement.secondWeakestSection}` : ''}。 下方 TCF 趋势与
                        26 周日历进度可对照使用。
                      </p>
                      {analytics.placement.ranked?.length ? (
                        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                          {analytics.placement.ranked.map((row) => (
                            <li
                              key={row.section}
                              className="rounded-full bg-white px-2.5 py-1 text-violet-800 dark:bg-gray-900 dark:text-violet-200"
                            >
                              {placementSectionLabel(row.section)} {Math.round(row.ratio * 100)}%
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <NavLink
                      to="/placement-test"
                      className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                    >
                      查看 / 复测
                    </NavLink>
                  </div>
                </section>
              ) : (
                <section
                  data-testid="analysis-placement-prompt"
                  className="mt-5 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300"
                >
                  尚未完成入学定级。
                  <NavLink to="/placement-test" className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">
                    去做 Placement Test
                  </NavLink>
                  ，统计页会在此显示分项弱项与推荐周次。
                </section>
              )}

              {dashboard ? (
                <>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <div className="min-w-0 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-gray-900 dark:text-white">每日学习分钟热力图</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">最近 90 天</span>
                      </div>
                      <div
                        role="img"
                        aria-label="最近 90 天每日学习分钟热力图"
                        className="mt-4 grid w-fit max-w-full grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-1 overflow-x-auto pb-2"
                      >
                        {dashboard.heatmap.map((item) => (
                          <div
                            key={item.day}
                            title={`${item.day}: ${item.minutes} 分钟`}
                            aria-label={`${item.day} 学习 ${item.minutes} 分钟`}
                            className={`h-4 w-4 shrink-0 rounded-[3px] ${heatmapCellClass(item.minutes, heatmapMax)}`}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>少</span>
                        {[0, 0.2, 0.4, 0.7, 1].map((ratio) => (
                          <span
                            key={ratio}
                            aria-hidden="true"
                            className={`h-3 w-3 rounded-[2px] ${heatmapCellClass(Math.round(heatmapMax * ratio), heatmapMax)}`}
                          />
                        ))}
                        <span>多</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <h2 className="font-semibold text-gray-900 dark:text-white">完成预测</h2>
                      {projection ? (
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-600 dark:text-gray-300">总进度</span>
                            <strong className="text-gray-950 dark:text-white">{projection.progressPercent}%</strong>
                          </div>
                          <div
                            role="progressbar"
                            aria-label="总学习进度"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={projection.progressPercent}
                            className="ui-progress-track"
                          >
                            <div className="ui-progress-bar" style={{ width: `${projection.progressPercent}%` }} />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-600 dark:text-gray-300">已完成分钟</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {projection.completedMinutes} / {projection.totalPlannedMinutes}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-600 dark:text-gray-300">预计完成</span>
                            <span className="text-gray-900 dark:text-gray-100">{projection.predictedCompletionDate ?? '数据不足'}</span>
                          </div>
                          {projection.deltaDays !== null && (
                            <div
                              className={`rounded-lg px-3 py-2 text-xs ${
                                projection.deltaDays <= 0
                                  ? 'bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200'
                                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                              }`}
                            >
                              {projection.deltaDays <= 0
                                ? `按当前速度预计可提前 ${Math.abs(projection.deltaDays)} 天完成。`
                                : `按当前速度预计比计划晚 ${projection.deltaDays} 天，建议提高每日有效学习分钟。`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">暂无足够数据用于预测。</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ['词汇', mastery?.vocabulary],
                        ['语法', mastery?.grammar],
                        ['变位', mastery?.conjugation],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{label}掌握度</span>
                          <strong className="text-xl text-indigo-700 dark:text-indigo-300">{value?.percent ?? 0}%</strong>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`${label}掌握度`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={value?.percent ?? 0}
                          className="ui-progress-track mt-3"
                        >
                          <div className="ui-progress-bar" style={{ width: `${value?.percent ?? 0}%` }} />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                          已掌握 {value?.mastered ?? 0} / 已接触 {value?.known ?? 0} · active 错项 {value?.activeErrors ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  当前没有可用的仪表盘缓存。你仍可继续离线练习，联网后这里会自动恢复。
                </div>
              )}
            </section>

            <section className="mx-0 my-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mx-4 sm:my-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="ui-eyebrow">今日复习 · 间隔重复</div>
                  <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {reviewLoading ? '正在生成复习队列…' : `今天有 ${reviewQueue.length} 项`}
                  </h1>
                  <div className={`mt-2 text-xs ${syncTone}`}>
                    {syncStatus.message}
                    {syncStatus.pending > 0 ? ` · ${syncStatus.pending} 条待同步` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAll()}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:border-gray-700 dark:text-gray-300"
                >
                  刷新数据
                </button>
              </div>

              {!reviewLoading && reviewQueue.length === 0 ? (
                <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
                  今天没有到期错题。新的错误会自动进入复习计划。
                </div>
              ) : (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {reviewQueue.slice(0, 12).map((item) => (
                    <div key={item.itemId} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                          {kindLabels[item.kind]}
                        </span>
                        <span className="text-xs text-gray-400">历史错误 {item.errorCount} 次</span>
                        {item.repetitions > 0 && <span className="text-xs text-gray-400">已复习 {item.repetitions} 轮</span>}
                      </div>
                      <div className="mt-2 font-medium text-gray-900 dark:text-white">{item.label}</div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          ['忘了', 1],
                          ['困难', 3],
                          ['记得', 4],
                          ['轻松', 5],
                        ].map(([label, quality]) => (
                          <button
                            key={String(label)}
                            type="button"
                            onClick={() => void reviewResult(item, Number(quality))}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mx-0 my-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mx-4 sm:my-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="ui-eyebrow">打卡与成就</div>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    连续 {checkins.streak.current} 天 · 最长 {checkins.streak.longest} 天
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    正常完成目标自动打卡；最近 7 天可补签，每周最多 2 次，且当天至少学习 10 分钟。
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                  已解锁 {achievements.length} 个成就
                </div>
              </div>

              {featureMessage && (
                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  {featureMessage}
                </div>
              )}

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">每日目标完成情况</div>
                  <div className="mt-3 grid gap-2">
                    {checkins.daily
                      .slice(-7)
                      .reverse()
                      .map((day) => (
                        <div key={day.day} className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="flex-1 text-gray-600 dark:text-gray-300">{day.day}</span>
                            <span className={day.complete ? 'text-green-600' : day.active ? 'text-amber-600' : 'text-gray-400'}>
                              {day.checkinStatus === 'makeup' ? '补签' : day.complete ? '完成' : day.active ? '未完成' : '休息日'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            {day.actualMinutes} / {day.plannedMinutes} min
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">最近 7 天补签</div>
                  <div className="mt-3 grid gap-2">
                    {recentDays.map((day) => {
                      const item = checkins.items.find((checkin) => checkin.day === day)
                      return (
                        <div key={day} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                          <span className="flex-1 text-gray-600 dark:text-gray-300">{day}</span>
                          {item ? (
                            <span className={item.status === 'makeup' ? 'text-amber-600' : 'text-green-600'}>
                              {item.status === 'makeup' ? '已补签' : '已完成'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void makeupDay(day)}
                              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800"
                            >
                              尝试补签
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">里程碑成就</div>
                  {achievements.length === 0 ? (
                    <div className="mt-3 text-sm text-gray-400">继续完成每日目标，成就会自动在服务端解锁并跨设备同步。</div>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {achievements.slice(0, 8).map((item) => (
                        <div key={item.id} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.title}</div>
                          <div className="mt-0.5 text-xs text-gray-400">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section
              data-print-weekly-reports
              className="mx-0 my-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mx-4 sm:my-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="ui-eyebrow">学习周报</div>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">每周总结与下周建议</h2>
                  <p className="mt-1 text-sm text-gray-500">周报由后端根据真实学习记录自动生成并保存历史版本。</p>
                </div>
                <div data-print-hidden className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void exportReports()}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-300"
                  >
                    周报 JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => void exportCsv('weekly-reports')}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-300"
                  >
                    周报 CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => void exportCsv('records')}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-300"
                  >
                    学习记录 CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => void exportCsv('error-book')}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-500 outline-none hover:border-indigo-300 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-300"
                  >
                    错题本 CSV
                  </button>
                  <button
                    type="button"
                    onClick={printWeeklyReports}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    打印周报
                  </button>
                </div>
              </div>

              {weeklyReports.length === 0 ? (
                <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-400 dark:bg-gray-900">还没有可生成的周报。</div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {weeklyReports.slice(0, 8).map((report) => (
                    <details
                      key={report.weekStart}
                      open={!report.finalized}
                      className="rounded-xl border border-gray-100 p-4 dark:border-gray-700"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {report.weekStart} → {report.weekEnd}
                          </span>
                          <span className="text-sm text-indigo-600">{minutesLabel(report.minutes)}</span>
                          <span className="text-sm text-gray-500">完成率 {report.completionPercent}%</span>
                          <span className="ml-auto text-xs text-gray-400">{report.finalized ? '已归档' : '本周更新中'}</span>
                        </div>
                      </summary>
                      <div data-testid={`weekly-report-body-${report.weekStart}`} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
                          <div className="text-xs text-gray-400">本周活动时长</div>
                          <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                            <div>词汇 {report.activityMinutes?.vocabulary ?? 0} min</div>
                            <div>语法 {report.activityMinutes?.grammar ?? 0} min</div>
                            <div>变位 {report.activityMinutes?.conjugation ?? 0} min</div>
                            <div>专注 {report.activityMinutes?.focus ?? 0} min</div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
                          <div className="text-xs text-gray-400">正确率</div>
                          <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                            <div>单词 {report.accuracy.vocabulary === null ? '—' : `${report.accuracy.vocabulary}%`}</div>
                            <div>语法 {report.accuracy.grammar === null ? '—' : `${report.accuracy.grammar}%`}</div>
                            <div>变位 {report.accuracy.conjugation === null ? '—' : `${report.accuracy.conjugation}%`}</div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
                          <div className="text-xs text-gray-400">薄弱点</div>
                          <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                            {report.weakPoints.length ? (
                              report.weakPoints.slice(0, 4).map((item) => (
                                <div key={`${item.kind}-${item.label}`} className="truncate">
                                  {item.label} · {item.errors} 错
                                </div>
                              ))
                            ) : (
                              <div>本周没有明显薄弱点</div>
                            )}
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">
                          <div className="text-xs text-gray-400">下周建议</div>
                          <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                            {report.suggestions.map((suggestion) => (
                              <div key={suggestion}>{suggestion}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>

            <section className="mx-0 my-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mx-4 sm:my-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="ui-eyebrow">服务端学习统计</div>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">学习趋势与错误画像</h2>
                </div>
                <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                  {(Object.keys(scaleLabels) as TrendScale[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setTrendScale(scale)}
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        trendScale === scale ? 'bg-white font-medium text-indigo-600 shadow dark:bg-gray-700' : 'text-gray-500'
                      }`}
                    >
                      {scaleLabels[scale]}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading && !analytics ? (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-400 dark:bg-gray-900">正在读取服务端统计…</div>
              ) : analytics ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
                      <div className="text-xs text-indigo-500">本周学习</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {minutesLabel(analytics.plan.weeklyMinutes)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">计划 {minutesLabel(analytics.plan.weeklyPlannedMinutes)}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">单词正确率</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {analytics.vocabulary.accuracy === null ? '—' : `${analytics.vocabulary.accuracy}%`}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{analytics.vocabulary.attempts} 次单词记录</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">语法正确率</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {analytics.grammar.accuracy === null ? '—' : `${analytics.grammar.accuracy}%`}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{analytics.grammar.total} 道题</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-xs text-gray-400">变位正确率</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                        {analytics.conjugation.accuracy === null ? '—' : `${analytics.conjugation.accuracy}%`}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{analytics.conjugation.attempts} 道练习</div>
                    </div>
                  </div>

                  <section
                    data-testid="tcf-score-trends"
                    className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900 dark:bg-indigo-950/20"
                  >
                    {allFourReachedNclc7 && (
                      <div
                        data-testid="tcf-all-targets-reached"
                        className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
                      >
                        <div className="flex items-center gap-2 text-base font-bold sm:text-lg">
                          <span>🎉</span> 恭喜！四项技能（CO / CE / EE / EO）均已达到 NCLC 7 目标！
                        </div>
                        <p className="mt-1 text-xs text-green-700 dark:text-green-300 sm:text-sm">
                          听力、阅读、写作与口语均已达到加拿大移民局 NCLC 7 对应基准分数，保持手感，冲刺正式考试！
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">TCF Canada 模考趋势</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          按技能分别统计服务端已同步的完整模考；虚线为 NCLC 7 目标。
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-3 py-1.5 dark:bg-gray-900">CO 目标 458</span>
                        <span className="rounded-full bg-white px-3 py-1.5 dark:bg-gray-900">CE 目标 453</span>
                        <span className="rounded-full bg-white px-3 py-1.5 dark:bg-gray-900">EE 目标 10/20</span>
                        <span className="rounded-full bg-white px-3 py-1.5 dark:bg-gray-900">EO 目标 10/20</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">听力 CO</span>
                          {analytics.tcf?.listening?.bestScore !== null && analytics.tcf?.listening?.bestScore !== undefined && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">最高 {analytics.tcf.listening.bestScore}</span>
                          )}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {analytics.tcf?.listening?.latestScore ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {analytics.tcf?.listening?.attempts ?? 0} 次 ·
                          {analytics.tcf?.listening?.gapToTarget === null || analytics.tcf?.listening?.gapToTarget === undefined
                            ? ' 尚无成绩'
                            : analytics.tcf.listening.gapToTarget === 0
                            ? ' 已达到 NCLC 7 目标'
                            : ` 距目标 ${analytics.tcf.listening.gapToTarget} 分`}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">阅读 CE</span>
                          {analytics.tcf?.reading?.bestScore !== null && analytics.tcf?.reading?.bestScore !== undefined && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">最高 {analytics.tcf.reading.bestScore}</span>
                          )}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {analytics.tcf?.reading?.latestScore ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {analytics.tcf?.reading?.attempts ?? 0} 次 ·
                          {analytics.tcf?.reading?.gapToTarget === null || analytics.tcf?.reading?.gapToTarget === undefined
                            ? ' 尚无成绩'
                            : analytics.tcf.reading.gapToTarget === 0
                            ? ' 已达到 NCLC 7 目标'
                            : ` 距目标 ${analytics.tcf.reading.gapToTarget} 分`}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">写作 EE</span>
                          {analytics.tcf?.writing?.bestScore !== null && analytics.tcf?.writing?.bestScore !== undefined && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">最高 {analytics.tcf.writing.bestScore}</span>
                          )}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {analytics.tcf?.writing?.latestScore !== null && analytics.tcf?.writing?.latestScore !== undefined
                            ? `${analytics.tcf.writing.latestScore} / 20`
                            : '—'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {analytics.tcf?.writing?.attempts ?? 0} 次 ·
                          {analytics.tcf?.writing?.gapToTarget === null || analytics.tcf?.writing?.gapToTarget === undefined
                            ? ' 尚无成绩'
                            : analytics.tcf.writing.gapToTarget === 0
                            ? ' 已达到 NCLC 7 目标'
                            : ` 距目标 ${analytics.tcf.writing.gapToTarget} 分`}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-3 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">口语 EO</span>
                          {analytics.tcf?.speaking?.bestScore !== null && analytics.tcf?.speaking?.bestScore !== undefined && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">最高 {analytics.tcf.speaking.bestScore}</span>
                          )}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {analytics.tcf?.speaking?.latestScore !== null && analytics.tcf?.speaking?.latestScore !== undefined
                            ? `${analytics.tcf.speaking.latestScore} / 20`
                            : '—'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {analytics.tcf?.speaking?.attempts ?? 0} 次 ·
                          {analytics.tcf?.speaking?.gapToTarget === null || analytics.tcf?.speaking?.gapToTarget === undefined
                            ? ' 尚无成绩'
                            : analytics.tcf.speaking.gapToTarget === 0
                            ? ' 已达到 NCLC 7 目标'
                            : ` 距目标 ${analytics.tcf.speaking.gapToTarget} 分`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      <div className="h-72 rounded-xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900">
                        <LineCharts
                          title="听力 CO 历次模考分数"
                          name="CO 分数"
                          data={tcfListeningData}
                          target={458}
                          targetLabel="NCLC 7 · 458"
                        />
                      </div>
                      <div className="h-72 rounded-xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900">
                        <LineCharts
                          title="阅读 CE 历次模考分数"
                          name="CE 分数"
                          data={tcfReadingData}
                          target={453}
                          targetLabel="NCLC 7 · 453"
                        />
                      </div>
                      <div className="h-72 rounded-xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900">
                        <LineCharts
                          title="写作 EE 历次模考分数"
                          name="EE 分数"
                          data={tcfWritingData}
                          target={10}
                          targetLabel="NCLC 7 · 10/20"
                        />
                      </div>
                      <div className="h-72 rounded-xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900">
                        <LineCharts
                          title="口语 EO 历次模考分数"
                          name="EO 分数"
                          data={tcfSpeakingData}
                          target={10}
                          targetLabel="NCLC 7 · 10/20"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                      <LineCharts title={`${scaleLabels[trendScale]}学习时长`} name="分钟" data={minutesData} />
                    </div>
                    <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                      <LineCharts title={`${scaleLabels[trendScale]}单词正确率`} name="正确率" data={vocabularyData} suffix="%" />
                    </div>
                    <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                      <LineCharts title={`${scaleLabels[trendScale]}语法正确率`} name="正确率" data={grammarData} suffix="%" />
                    </div>
                    <div className="h-72 rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                      <LineCharts title={`${scaleLabels[trendScale]}动词变位正确率`} name="正确率" data={conjugationData} suffix="%" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-3">
                    {rankingCard('错误最多的单词', analytics.rankings.vocabulary, '还没有单词错误记录')}
                    {rankingCard('错误最多的语法点', analytics.rankings.grammar, '还没有语法错误记录')}
                    {rankingCard('错误最多的动词', analytics.rankings.conjugation, '还没有变位错误记录')}
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-900">
                  暂无可用的服务端统计。离线学习会先写入本机队列，联网后自动合并。
                </div>
              )}
            </section>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical" />
        </ScrollArea.Root>
      </div>
    </Layout>
  )
}

export default Analysis
