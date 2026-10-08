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
      <div className="flex w-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-2 sm:px-6 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="ui-eyebrow">服务端统一错题本</div>
              <h1 className="ui-title mt-3">词汇 · 语法 · 动词变位</h1>
              <p className="ui-subtle mt-2">答错自动进入；连续答对 3 次自动标记掌握并退出今日 SM-2 复习。</p>
            </div>
            <div className="flex gap-2">
              <div className="ui-stat min-w-[7rem] py-3">
                <div className="ui-stat-label">当前列表</div>
                <div className="ui-stat-value text-xl">{items.length}</div>
              </div>
              <div className="ui-stat min-w-[7rem] py-3">
                <div className="ui-stat-label">未掌握</div>
                <div className="ui-stat-value text-xl text-amber-600 dark:text-amber-400">{activeCount}</div>
              </div>
            </div>
          </div>

          <div className="my-card mt-6 grid gap-4 rounded-3xl bg-white p-5 dark:bg-gray-800 md:grid-cols-4">
            <label className="ui-stat-label">
              类型
              <select
                aria-label="错题类型"
                value={type}
                onChange={(event) => setType(event.target.value as TypeFilter)}
                className="ui-input mt-1.5 w-full"
              >
                <option value="">全部</option>
                <option value="vocabulary">词汇</option>
                <option value="grammar">语法</option>
                <option value="conjugation">动词变位</option>
              </select>
            </label>
            <label className="ui-stat-label">
              状态
              <select
                aria-label="错题状态"
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="ui-input mt-1.5 w-full"
              >
                <option value="active">待掌握</option>
                <option value="mastered">已掌握</option>
                <option value="all">全部</option>
              </select>
            </label>
            <label className="ui-stat-label">
              从
              <input
                aria-label="错题开始日期"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="ui-input mt-1.5 w-full"
              />
            </label>
            <label className="ui-stat-label">
              到
              <input
                aria-label="错题结束日期"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="ui-input mt-1.5 w-full"
              />
            </label>
          </div>

          {message && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30">{message}</div>}

          <ScrollArea.Root className="mt-5 flex-1 overflow-hidden" aria-label="错题列表">
            <ScrollArea.Viewport className="h-full w-full pb-16">
              {loading ? (
                <div className="ui-panel p-10 text-center text-sm text-gray-400">正在读取错题本…</div>
              ) : items.length === 0 ? (
                <div className="ui-panel flex flex-col items-center gap-2 p-12 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                    ✓
                  </span>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">当前筛选下没有错题。</div>
                  <div className="text-xs text-gray-400">答错的词汇、语法与变位会自动出现在这里</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      data-testid="error-book-item"
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200/70 bg-white px-5 py-4 transition-all hover:-translate-y-px hover:shadow-md dark:border-white/[0.06] dark:bg-gray-800"
                    >
                      <span className="ui-chip-accent">{typeLabel[item.kind]}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900 dark:text-white">{item.label}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          错误 {item.errorCount} 次 · 连续答对 {item.correctStreak}/3 · 最近错误 {timeLabel(item.lastWrongAt)}
                        </div>
                        {item.kind === 'grammar' && typeof item.context.prompt === 'string' && item.context.prompt && (
                          <div className="mt-1 truncate text-xs text-gray-500">{item.context.prompt}</div>
                        )}
                      </div>
                      <span
                        className={
                          item.mastered ? 'ui-chip text-emerald-600 dark:text-emerald-300' : 'ui-chip text-amber-600 dark:text-amber-300'
                        }
                      >
                        {item.mastered ? '已掌握' : '待重练'}
                      </span>
                      <button type="button" onClick={() => retry(item)} className="ui-btn-primary">
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
