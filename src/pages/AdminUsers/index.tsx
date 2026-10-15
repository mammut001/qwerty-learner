import Layout from '@/components/Layout'
import {
  type AdminUserItem,
  type AdminUserProvider,
  type AdminUsersSummary,
  getStoredAdminUsersToken,
  listAdminUsers,
  saveAdminUsersToken,
} from '@/services/adminUsers'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {items.map((item) => (
                        <tr key={item.accountId} data-testid="admin-users-row" className="align-top">
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
