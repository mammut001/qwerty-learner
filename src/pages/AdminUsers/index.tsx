import Layout from '@/components/Layout'
import {
  type AdminUserDailyWords,
  type AdminUserDetail,
  type AdminUserItem,
  type AdminUserProvider,
  type AdminUsersSummary,
  getAdminUserDetail,
  getStoredAdminUsersToken,
  listAdminUsers,
  saveAdminUsersToken,
} from '@/services/adminUsers'
import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconRefresh from '~icons/tabler/refresh'
import IconSearch from '~icons/tabler/search'

const PAGE_SIZE = 50
const APPLE_RELAY_SUFFIX = '@privaterelay.appleid.com'

type Filters = { provider: '' | AdminUserProvider; q: string }

function formatDateTime(ms: number | null): string {
  if (!ms) return '—'
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function ProviderBadges({ providers }: { providers: AdminUserProvider[] }) {
  if (providers.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-gray-400">仅通行密钥</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {providers.map((provider) => (
        <span
          key={provider}
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            provider === 'google'
              ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
              : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          }`}
        >
          {provider === 'google' ? 'Google' : 'Apple'}
        </span>
      ))}
    </div>
  )
}

function EmailList({ emails, displayName }: { emails: string[]; displayName: string }) {
  if (emails.length === 0) {
    return <span className="text-xs text-gray-400">—</span>
  }
  return (
    <div className="space-y-0.5">
      {emails.map((email) => (
        <div key={email} className="flex flex-wrap items-center gap-1.5">
          <span className="break-all text-gray-900 dark:text-gray-100">{email}</span>
          {email.toLowerCase().endsWith(APPLE_RELAY_SUFFIX) && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Apple 隐藏邮箱
            </span>
          )}
        </div>
      ))}
      {displayName && <div className="text-[11px] text-gray-500 dark:text-gray-400">{displayName}</div>}
    </div>
  )
}

function SignupChart({ data }: { data: AdminUsersSummary['signupsByDay'] }) {
  const max = Math.max(1, ...data.map((row) => row.count))
  const lastIndex = data.length - 1
  return (
    <section className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800" data-testid="admin-users-chart">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">近 30 天注册（UTC 日）</h2>
      <div className="mt-4 flex h-40 items-end gap-1">
        {data.map((row) => {
          const pct = row.count > 0 ? Math.max(4, Math.round((row.count / max) * 100)) : 0
          return (
            <div key={row.day} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.day}：${row.count}`}>
              <div
                data-testid="admin-users-bar"
                className="w-full rounded-t bg-indigo-500 dark:bg-indigo-400"
                style={{ height: `${pct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-1">
        {data.map((row, index) => (
          <div key={row.day} className="min-w-0 flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500">
            {index % 5 === 0 || index === lastIndex ? row.day.slice(5) : ''}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${value}%`
}

function formatSecondsPerWord(ms: number | null): string {
  return ms === null ? '—' : `${(ms / 1000).toFixed(1)} 秒`
}

function hasAnyActivity(detail: AdminUserDetail): boolean {
  return (
    detail.activeDays > 0 ||
    detail.vocabulary.totalWords > 0 ||
    detail.grammar.sessions > 0 ||
    detail.conjugation.attempts > 0 ||
    detail.tcf.count > 0 ||
    detail.errorBook.total > 0 ||
    detail.placement.latest !== null
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{hint}</div>}
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 p-4 dark:border-white/10">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="mt-3 text-xs text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  )
}

function DailyWordsChart({ data }: { data: AdminUserDailyWords[] }) {
  const max = Math.max(1, ...data.map((row) => row.words))
  const lastIndex = data.length - 1
  return (
    <section data-testid="admin-user-detail-chart">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-white">近 30 天每日词数（UTC 日）</h3>
      <div className="mt-3 flex h-24 items-end gap-1">
        {data.map((row) => {
          const pct = row.words > 0 ? Math.max(4, Math.round((row.words / max) * 100)) : 0
          return (
            <div key={row.day} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.day}：${row.words} 词`}>
              <div className="w-full rounded-t bg-emerald-500 dark:bg-emerald-400" style={{ height: `${pct}%` }} />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((row, index) => (
          <div key={row.day} className="min-w-0 flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500">
            {index % 5 === 0 || index === lastIndex ? row.day.slice(5) : ''}
          </div>
        ))}
      </div>
    </section>
  )
}

function UserDetailPanel({
  email,
  detail,
  loading,
  error,
  onClose,
}: {
  email: string
  detail: AdminUserDetail | null
  loading: boolean
  error: string
  onClose: () => void
}) {
  return (
    <section data-testid="admin-user-detail" className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">学习活动</div>
          <div className="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">{email || '—'}</div>
        </div>
        <button type="button" onClick={onClose} className="ui-btn-secondary px-3 py-1.5 text-xs">
          关闭
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-gray-400">加载中…</p>}
      {error && (
        <p data-testid="admin-user-detail-error" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {detail && !loading && !error && !hasAnyActivity(detail) && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">暂无学习记录。</p>
      )}

      {detail && !loading && !error && hasAnyActivity(detail) && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="最近活跃" value={formatDateTime(detail.lastActiveAt)} />
            <StatTile
              label="学习天数"
              value={`${detail.activeDays} 天`}
              hint={detail.checkins.days > 0 ? `打卡 ${detail.checkins.days} 天` : undefined}
            />
            <StatTile label="总时长" value={`${detail.totalMinutes} 分钟`} />
            <StatTile
              label="打字词数"
              value={String(detail.vocabulary.totalWords)}
              hint={detail.vocabulary.tapCount > 0 ? `其中点选模式 ${detail.vocabulary.tapCount}` : undefined}
            />
            <StatTile label="平均每词用时" value={formatSecondsPerWord(detail.vocabulary.avgMsPerWord)} />
            <StatTile label="正确率" value={formatPercent(detail.vocabulary.accuracy)} hint="无错误的词 / 全部词" />
            <StatTile
              label="错题本数"
              value={`${detail.errorBook.active} 待掌握`}
              hint={`共 ${detail.errorBook.total}，已掌握 ${detail.errorBook.mastered}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DetailSection title="最常错的词">
              {detail.vocabulary.topMistakes.length === 0 ? (
                <span className="text-gray-400">暂无错词。</span>
              ) : (
                <ol className="space-y-1">
                  {detail.vocabulary.topMistakes.map((item) => (
                    <li key={item.word} className="flex flex-wrap justify-between gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.word}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.dict} · 错 {item.wrongCount} 次
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </DetailSection>

            <DetailSection title="词库 / 章节">
              {detail.vocabulary.byDict.length === 0 ? (
                <span className="text-gray-400">暂无词库记录。</span>
              ) : (
                <ul className="space-y-1">
                  {detail.vocabulary.byDict.map((item) => (
                    <li key={item.dict} className="flex flex-wrap justify-between gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.dict || '未标注'}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.count} 词{item.chapters.length > 0 ? ` · 章节 ${item.chapters.join(', ')}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          </div>

          <DailyWordsChart data={detail.vocabulary.perDay} />

          <div className="grid gap-4 lg:grid-cols-2">
            <DetailSection title="语法练习">
              <div className="mb-2">
                {detail.grammar.sessions} 次 · 正确率 {formatPercent(detail.grammar.accuracy)}
              </div>
              {detail.grammar.recent.length > 0 && (
                <ul className="space-y-1">
                  {detail.grammar.recent.map((item, index) => (
                    <li key={`${item.finishedAt ?? index}-${item.topic}`} className="flex flex-wrap justify-between gap-2">
                      <span>{item.topic || '未命名'}</span>
                      <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {item.score}/{item.total}
                        {item.day ? ` · ${item.day}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>

            <DetailSection title="变位练习">
              {detail.conjugation.attempts > 0 ? (
                <div>
                  {detail.conjugation.attempts} 次 · 正确率 {formatPercent(detail.conjugation.accuracy)}
                </div>
              ) : (
                <span className="text-gray-400">暂无变位记录。</span>
              )}
            </DetailSection>

            <DetailSection title="分级测试">
              {detail.placement.latest ? (
                <div className="space-y-1">
                  <div>
                    最新等级 <span className="font-semibold text-gray-900 dark:text-white">{detail.placement.latest.cefrLevel}</span>
                    {detail.placement.latest.suggestedStartWeek !== null &&
                      ` · 建议从第 ${detail.placement.latest.suggestedStartWeek} 周开始`}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {Object.entries(detail.placement.latest.sectionAccuracy)
                      .map(([section, value]) => `${section} ${formatPercent(value)}`)
                      .join(' · ')}
                  </div>
                  {detail.placement.historyCount > 0 && (
                    <div className="text-gray-500 dark:text-gray-400">历史测试 {detail.placement.historyCount} 次</div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">暂无分级测试。</span>
              )}
            </DetailSection>

            <DetailSection title="模拟考（TCF）">
              <div className="mb-2">{detail.tcf.count} 次</div>
              {detail.tcf.recent.length > 0 && (
                <ul className="space-y-1">
                  {detail.tcf.recent.map((item, index) => (
                    <li key={`${item.finishedAt ?? index}-${item.skill}`} className="flex flex-wrap justify-between gap-2">
                      <span>{item.skill}</span>
                      <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {item.scaledScore} 分 · NCLC {item.nclc} · {item.correctCount}/{item.questionCount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          </div>
        </div>
      )}
    </section>
  )
}

export default function AdminUsersPage() {
  const [tokenInput, setTokenInput] = useState(() => getStoredAdminUsersToken())
  const [activeToken, setActiveToken] = useState(() => getStoredAdminUsersToken())
  const [providerFilter, setProviderFilter] = useState<'' | AdminUserProvider>('')
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')

  const [items, setItems] = useState<AdminUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const requestSeq = useRef(0)
  const detailSeq = useRef(0)
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null)
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const load = useCallback(async (token: string, filters: Filters, offset: number, append: boolean) => {
    if (!token.trim()) return
    const seq = ++requestSeq.current
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError('')
    }
    try {
      const res = await listAdminUsers(token, {
        provider: filters.provider,
        q: filters.q,
        limit: PAGE_SIZE,
        offset,
      })
      if (seq !== requestSeq.current) return
      setSummary(res.summary)
      setTotal(res.total)
      setItems((prev) => (append ? [...prev, ...res.items] : res.items))
    } catch (err: unknown) {
      if (seq !== requestSeq.current) return
      const anyErr = err as { code?: string; message?: string }
      if (anyErr.code === 'ADMIN_UNAUTHORIZED') {
        setError('令牌不正确。')
      } else {
        setError(anyErr.message || '加载用户列表失败。')
      }
      if (!append) {
        setItems([])
        setTotal(0)
        setSummary(null)
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [])

  // Reload whenever the token or a filter changes.
  useEffect(() => {
    if (activeToken.trim()) {
      void load(activeToken, { provider: providerFilter, q: query }, 0, false)
    }
  }, [activeToken, providerFilter, query, load])

  const loadDetail = useCallback(async (token: string, accountId: string) => {
    const seq = ++detailSeq.current
    setDetailLoading(true)
    setDetailError('')
    setDetail(null)
    try {
      const next = await getAdminUserDetail(token, accountId)
      if (seq !== detailSeq.current) return
      setDetail(next)
    } catch (err: unknown) {
      if (seq !== detailSeq.current) return
      setDetailError((err as { message?: string }).message || '加载用户详情失败。')
    } finally {
      if (seq === detailSeq.current) setDetailLoading(false)
    }
  }, [])

  const handleOpenDetail = (user: AdminUserItem) => {
    setSelectedUser(user)
    void loadDetail(activeToken, user.accountId)
  }

  const handleCloseDetail = () => {
    detailSeq.current += 1
    setSelectedUser(null)
    setDetail(null)
    setDetailError('')
    setDetailLoading(false)
  }

  const handleTokenSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = tokenInput.trim()
    if (!trimmed) return
    saveAdminUsersToken(trimmed)
    if (trimmed === activeToken) {
      void load(trimmed, { provider: providerFilter, q: query }, 0, false)
    } else {
      setActiveToken(trimmed)
    }
  }

  const handleClearToken = () => {
    handleCloseDetail()
    saveAdminUsersToken('')
    setTokenInput('')
    setActiveToken('')
    setItems([])
    setTotal(0)
    setSummary(null)
    setError('')
  }

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = searchInput.trim()
    if (next === query) {
      void load(activeToken, { provider: providerFilter, q: query }, 0, false)
    } else {
      setQuery(next)
    }
  }

  const handleRefresh = () => {
    void load(activeToken, { provider: providerFilter, q: query }, 0, false)
  }

  const handleLoadMore = () => {
    if (loadingMore || items.length >= total) return
    void load(activeToken, { provider: providerFilter, q: query }, items.length, true)
  }

  const summaryCards = summary
    ? [
        { label: '总用户', value: summary.totalAccounts },
        { label: 'Google', value: summary.byProvider.google },
        { label: 'Apple', value: summary.byProvider.apple },
        { label: '仅通行密钥', value: summary.byProvider.passkeyOnly },
        { label: '近 7 天新增', value: summary.newLast7Days },
        { label: '近 30 天新增', value: summary.newLast30Days },
        { label: '近 7 天活跃', value: summary.activeLast7Days },
      ]
    : []

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Header */}
          <header className="my-card relative mt-2 overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-400/10 to-transparent blur-3xl"
            />
            <div className="ui-eyebrow relative text-violet-600 dark:text-violet-300">管理后台 · 用户</div>
            <h1 className="ui-title relative mt-2">注册用户</h1>
            <p className="relative mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
              查看注册账号的邮箱、登录方式与学习活动。仅限内网访问，接口只接受完整管理员令牌（STUDY_ADMIN_TOKEN）。
            </p>
            <NavLink to="/" className="ui-btn-secondary relative mt-4 px-3 py-1.5 text-xs">
              ← 返回首页
            </NavLink>
          </header>

          {/* Token input card */}
          <form onSubmit={handleTokenSubmit} data-testid="admin-token-form" className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800">
            <label className="ui-stat-label block text-xs">管理员令牌 (STUDY_ADMIN_TOKEN)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="password"
                data-testid="admin-token-input"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Bearer 令牌（保存在本机 localStorage）"
                autoComplete="off"
                className="ui-input min-w-[16rem] flex-1"
              />
              <button type="submit" data-testid="admin-token-submit" disabled={loading || !tokenInput.trim()} className="ui-btn-primary">
                {loading ? '加载中…' : '验证并加载'}
              </button>
              {activeToken && (
                <button type="button" onClick={handleClearToken} className="ui-btn-secondary">
                  清除令牌
                </button>
              )}
            </div>
            {error && (
              <p data-testid="admin-error-text" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </form>

          {summary && !error && (
            <>
              {/* Summary cards */}
              <section data-testid="admin-users-summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {summaryCards.map((card) => (
                  <div key={card.label} className="my-card rounded-2xl bg-white p-4 dark:bg-gray-800">
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{card.label}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{card.value}</div>
                  </div>
                ))}
              </section>

              <SignupChart data={summary.signupsByDay} />

              {/* Filters */}
              <section className="my-card flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span>登录方式</span>
                  <select
                    data-testid="admin-users-provider"
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value as '' | AdminUserProvider)}
                    className="ui-input py-1.5 text-xs"
                  >
                    <option value="">全部</option>
                    <option value="google">Google</option>
                    <option value="apple">Apple</option>
                  </select>
                </label>
                <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="search"
                    data-testid="admin-users-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="邮箱或名字"
                    maxLength={200}
                    className="ui-input min-w-[12rem] flex-1 py-1.5 text-xs"
                  />
                  <button type="submit" className="ui-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs">
                    <IconSearch className="h-3.5 w-3.5" />
                    <span>搜索</span>
                  </button>
                </form>
                <button
                  type="button"
                  data-testid="admin-users-refresh"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="ui-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                >
                  <IconRefresh className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>刷新</span>
                </button>
              </section>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                符合条件 <span className="font-semibold text-gray-900 dark:text-white">{total}</span> 个账号（已加载 {items.length} 个）
              </div>

              {/* Table */}
              <div className="my-card overflow-hidden rounded-2xl bg-white dark:bg-gray-800">
                <div className="overflow-x-auto">
                  <table
                    data-testid="admin-users-table"
                    className="min-w-full divide-y divide-gray-100 text-left text-xs dark:divide-white/10"
                  >
                    <thead className="bg-gray-50 text-[11px] font-semibold text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3">邮箱</th>
                        <th className="whitespace-nowrap px-4 py-3">登录方式</th>
                        <th className="whitespace-nowrap px-4 py-3">注册时间</th>
                        <th className="whitespace-nowrap px-4 py-3">最近登录</th>
                        <th className="whitespace-nowrap px-4 py-3">打卡天数</th>
                        <th className="whitespace-nowrap px-4 py-3">错题</th>
                        <th className="whitespace-nowrap px-4 py-3">成就</th>
                        <th className="whitespace-nowrap px-4 py-3">在线会话</th>
                        <th className="whitespace-nowrap px-4 py-3">学习活动</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {items.map((item) => (
                        <tr
                          key={item.accountId}
                          data-testid="admin-users-row"
                          className={`align-top ${
                            selectedUser?.accountId === item.accountId ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : ''
                          }`}
                        >
                          <td className="min-w-[14rem] px-4 py-3">
                            <EmailList emails={item.emails} displayName={item.displayName} />
                          </td>
                          <td className="px-4 py-3">
                            <ProviderBadges providers={item.providers} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                            {formatDateTime(item.lastLoginAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                            <div className="text-gray-900 dark:text-gray-100">{item.checkinDays}</div>
                            {item.lastCheckinDay && <div className="font-mono text-[10px] text-gray-400">最近 {item.lastCheckinDay}</div>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums" title="已掌握 / 错题总数">
                            {item.masteredItems} / {item.errorBookItems}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums">{item.achievements}</td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums">{item.activeSessions}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <button
                              type="button"
                              data-testid="admin-users-detail-button"
                              aria-expanded={selectedUser?.accountId === item.accountId}
                              onClick={() => handleOpenDetail(item)}
                              className="ui-btn-secondary px-2.5 py-1 text-xs"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!loading && items.length === 0 && (
                  <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">没有符合条件的账号。</div>
                )}
                {loading && items.length === 0 && <div className="p-10 text-center text-sm text-gray-400">加载中…</div>}
              </div>

              {selectedUser && (
                <UserDetailPanel
                  email={selectedUser.emails[0] || selectedUser.displayName}
                  detail={detail}
                  loading={detailLoading}
                  error={detailError}
                  onClose={handleCloseDetail}
                />
              )}

              {!loading && items.length > 0 && items.length < total && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    data-testid="admin-users-load-more"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="ui-btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium"
                  >
                    {loadingMore ? (
                      <>
                        <IconRefresh className="h-4 w-4 animate-spin" />
                        <span>加载中…</span>
                      </>
                    ) : (
                      <>
                        <IconChevronDown className="h-4 w-4" />
                        <span>
                          加载更多 ({items.length} / {total})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}
