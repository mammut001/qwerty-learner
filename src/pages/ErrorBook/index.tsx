import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { type ErrorBookItem, type ReviewKind, loadErrorBook } from '@/services/studyPlanSync'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type StatusFilter = 'active' | 'mastered' | 'all'
type TypeFilter = ReviewKind | ''

const typeLabel: Record<ReviewKind, string> = {
  vocabulary: '词汇',
  grammar: '语法',
  conjugation: '动词变位',
}

const timeLabel = (value: number | null) => {
  if (!value) return '历史记录'
  return new Date(value).toLocaleString()
}

export function ErrorBook() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ErrorBookItem[]>([])
  const [type, setType] = useState<TypeFilter>('')
  const [status, setStatus] = useState<StatusFilter>('active')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      setItems(await loadErrorBook({ type, status, from: from || undefined, to: to || undefined }))
    } catch {
      setMessage('错题本暂时读取失败；如果当前离线，联网后会自动恢复。')
    } finally {
      setLoading(false)
    }
  }, [from, status, to, type])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const activeCount = useMemo(() => items.filter((item) => !item.mastered).length, [items])

  const retry = (item: ErrorBookItem) => {
    if (item.kind === 'vocabulary') {
      const dict = typeof item.context.dict === 'string' ? item.context.dict : ''
      const chapter = typeof item.context.chapter === 'number' && Number.isInteger(item.context.chapter) ? item.context.chapter : 0
      navigate(`/typing?dict=${encodeURIComponent(dict)}&chapter=${chapter}`)
      return
    }
    if (item.kind === 'grammar') {
      navigate('/grammar-session')
      return
    }
    const verb = typeof item.context.verb === 'string' ? item.context.verb : item.sourceId.split('|')[0]
    const tense = typeof item.context.tense === 'string' ? item.context.tense : item.sourceId.split('|')[1]
    navigate(`/conjugation?verb=${encodeURIComponent(verb)}&tense=${encodeURIComponent(tense)}&mode=practice&scope=current`)
  }

  return (
    <Layout>
      <Header />
      <div className="flex w-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-2 sm:px-6 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-indigo-500">服务端统一错题本</div>
              <h1 className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">词汇 · 语法 · 动词变位</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">答错自动进入；连续答对 3 次自动标记掌握并退出今日 SM-2 复习。</p>
            </div>
            <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
              当前列表 {items.length} 项 · 未掌握 {activeCount} 项
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:grid-cols-4">
            <label className="text-xs text-gray-500">
              类型
              <select
                aria-label="错题类型"
                value={type}
                onChange={(event) => setType(event.target.value as TypeFilter)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">全部</option>
                <option value="vocabulary">词汇</option>
                <option value="grammar">语法</option>
                <option value="conjugation">动词变位</option>
              </select>
            </label>
            <label className="text-xs text-gray-500">
              状态
              <select
                aria-label="错题状态"
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="active">待掌握</option>
                <option value="mastered">已掌握</option>
                <option value="all">全部</option>
              </select>
            </label>
            <label className="text-xs text-gray-500">
              从
              <input
                aria-label="错题开始日期"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
            <label className="text-xs text-gray-500">
              到
              <input
                aria-label="错题结束日期"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
          </div>

          {message && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30">{message}</div>}

          <ScrollArea.Root className="mt-5 flex-1 overflow-hidden" aria-label="错题列表">
            <ScrollArea.Viewport className="h-full w-full pb-16">
              {loading ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-400 dark:bg-gray-900">正在读取错题本…</div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl bg-green-50 p-8 text-center text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
                  当前筛选下没有错题。
                </div>
              ) : (
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      data-testid="error-book-item"
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        {typeLabel[item.kind]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900 dark:text-white">{item.label}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          错误 {item.errorCount} 次 · 连续答对 {item.correctStreak}/3 · 最近错误 {timeLabel(item.lastWrongAt)}
                        </div>
                        {item.kind === 'grammar' && typeof item.context.prompt === 'string' && item.context.prompt && (
                          <div className="mt-1 truncate text-xs text-gray-500">{item.context.prompt}</div>
                        )}
                      </div>
                      <span className={item.mastered ? 'text-sm text-green-600' : 'text-sm text-amber-600'}>
                        {item.mastered ? '已掌握' : '待重练'}
                      </span>
                      <button
                        type="button"
                        onClick={() => retry(item)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                      >
                        一键重练
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex touch-none select-none bg-transparent" />
          </ScrollArea.Root>
        </div>
      </div>
    </Layout>
  )
}
