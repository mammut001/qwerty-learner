import LineCharts from './components/LineCharts'
import Layout from '@/components/Layout'
import {
  flushStudyProgress,
  getStudySyncSnapshot,
  loadReviewQueue,
  loadStudyAnalytics,
  submitReviewResult,
  subscribeStudySyncStatus,
  type ReviewQueueItem,
  type StudyAnalytics,
  type StudySyncStatus,
  type TrendPoint,
} from '@/services/studyPlanSync'
import { isOpenDarkModeAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

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

const rankingCard = (
  title: string,
  items: StudyAnalytics['rankings']['vocabulary'],
  emptyText: string,
) => (
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
  const [, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [trendScale, setTrendScale] = useState<TrendScale>('weekly')
  const [syncStatus, setSyncStatus] = useState<StudySyncStatus>(() => getStudySyncSnapshot())
  const hadPendingSync = useRef(false)

  const onBack = useCallback(() => {
    navigate('/')
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

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshAnalytics(), refreshReview()])
  }, [refreshAnalytics, refreshReview])

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

  const reviewResult = async (item: ReviewQueueItem, quality: number) => {
    submitReviewResult(item, quality)
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

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto pl-20 pr-20 pt-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <ScrollArea.Root className="flex-1 overflow-y-auto">
          <ScrollArea.Viewport className="h-full w-auto pb-[20rem] [&>div]:!block">
            <section className="mx-4 my-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-indigo-500">今日复习 · 间隔重复</div>
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
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
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

            <section className="mx-4 my-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-indigo-500">服务端学习统计</div>
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
