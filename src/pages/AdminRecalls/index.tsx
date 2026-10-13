import Layout from '@/components/Layout'
import {
  type AdminRecallItem,
  type RecallStatus,
  formatRecallLabel,
  getStoredRecallsAdminToken,
  listAdminRecalls,
  reviewRecalls,
  saveRecallsAdminToken,
} from '@/services/recalls'
import React, { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconRefresh from '~icons/tabler/refresh'
import IconX from '~icons/tabler/x'

const ADMIN_PAGE_SIZE = 50

export default function AdminRecallsPage() {
  const [tokenInput, setTokenInput] = useState(() => getStoredRecallsAdminToken())
  const [activeToken, setActiveToken] = useState(() => getStoredRecallsAdminToken())
  const [statusTab, setStatusTab] = useState<RecallStatus>('pending')

  const [items, setItems] = useState<AdminRecallItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewing, setReviewing] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  // Load recalls from server
  const loadList = useCallback(async (token: string, status: RecallStatus, offset = 0, append = false) => {
    if (!token.trim()) {
      setItems([])
      setTotal(0)
      return
    }

    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError('')
      setReviewMessage('')
    }

    try {
      const res = await listAdminRecalls(token.trim(), {
        status,
        limit: ADMIN_PAGE_SIZE,
        offset,
      })

      if (append) {
        setItems((prev) => [...prev, ...res.items])
      } else {
        setItems(res.items)
        setSelectedIds([])
      }
      setTotal(res.total)
    } catch (err: unknown) {
      const anyErr = err as { code?: string; status?: number; message?: string }
      if (anyErr.status === 401 || anyErr.status === 403 || anyErr.code === 'ADMIN_UNAUTHORIZED') {
        setError('令牌不正确。')
      } else {
        setError(anyErr.message || '加载机经列表失败。')
      }
      if (!append) {
        setItems([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Initial load if token exists
  useEffect(() => {
    if (activeToken.trim()) {
      void loadList(activeToken, statusTab, 0, false)
    }
  }, [activeToken, statusTab, loadList])

  // Submit token form
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tokenInput.trim()
    saveRecallsAdminToken(trimmed)
    setActiveToken(trimmed)
    setError('')
    void loadList(trimmed, statusTab, 0, false)
  }

  // Load more
  const handleLoadMore = () => {
    if (loadingMore || items.length >= total) return
    void loadList(activeToken, statusTab, items.length, true)
  }

  // Handle single or batch review
  const handleReview = async (ids: string[], action: 'approve' | 'reject') => {
    if (ids.length === 0 || reviewing || !activeToken) return
    setReviewing(true)
    setReviewMessage('')
    setError('')

    try {
      const res = await reviewRecalls(activeToken, { ids, action })
      // Remove affected rows from current list
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
      setTotal((prev) => Math.max(0, prev - res.count))
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
      setReviewMessage(`已更新 ${res.count} 条机经。`)
    } catch (err: unknown) {
      const anyErr = err as { code?: string; status?: number; message?: string }
      if (anyErr.status === 401 || anyErr.status === 403 || anyErr.code === 'ADMIN_UNAUTHORIZED') {
        setError('令牌不正确。')
      } else {
        setError(anyErr.message || '操作失败，请重试。')
      }
    } finally {
      setReviewing(false)
    }
  }

  // Checkbox select all / none
  const allCurrentSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id))
  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Format timestamp
  const formatDate = (ts: number | null) => {
    if (!ts) return ''
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  }

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {/* Header */}
          <header className="my-card relative mt-2 overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-400/10 to-transparent blur-3xl"
            />
            <div className="ui-eyebrow relative text-violet-600 dark:text-violet-300">管理后台 · 内容审核</div>
            <h1 className="ui-title relative mt-2">机经审核后台</h1>
            <p className="relative mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
              审核考生提交的口语与写作回忆题目，通过审核的题目将公开发布。审核接口仅允许携带管理员令牌通过内网访问。
            </p>
            <NavLink to="/recalls" className="ui-btn-secondary relative mt-4 px-3 py-1.5 text-xs">
              ← 返回机经分享
            </NavLink>
          </header>

          {/* Token input card */}
          <form
            onSubmit={handleTokenSubmit}
            data-testid="admin-token-form"
            className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800"
          >
            <label className="ui-stat-label block text-xs">管理员令牌 (STUDY_ADMIN_TOKEN)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="password"
                data-testid="admin-token-input"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Bearer 令牌（存于 sessionStorage）"
                autoComplete="off"
                className="ui-input min-w-[16rem] flex-1"
              />
              <button
                type="submit"
                data-testid="admin-token-submit"
                disabled={loading || !tokenInput.trim()}
                className="ui-btn-primary"
              >
                {loading ? '加载中…' : '验证并加载'}
              </button>
            </div>
            {error && (
              <p data-testid="admin-error-text" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {reviewMessage && (
              <p
                data-testid="admin-review-message"
                className="mt-2 text-sm text-emerald-600 dark:text-emerald-400"
              >
                {reviewMessage}
              </p>
            )}
          </form>

          {/* Management Controls & Status Switch */}
          {activeToken && !error && (
            <div className="space-y-4">
              {/* Status Switch Tabs */}
              <div className="my-card flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
                <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-white/[0.06]">
                  <button
                    type="button"
                    data-testid="status-tab-pending"
                    onClick={() => setStatusTab('pending')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                      statusTab === 'pending'
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    待审核
                  </button>
                  <button
                    type="button"
                    data-testid="status-tab-approved"
                    onClick={() => setStatusTab('approved')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                      statusTab === 'approved'
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    已通过
                  </button>
                  <button
                    type="button"
                    data-testid="status-tab-rejected"
                    onClick={() => setStatusTab('rejected')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                      statusTab === 'rejected'
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    已拒绝
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  当前状态共 <span className="font-semibold text-gray-900 dark:text-white">{total}</span> 条（已加载 {items.length} 条）
                </div>
              </div>

              {/* Batch Action Toolbar */}
              {items.length > 0 && (
                <div
                  data-testid="admin-batch-toolbar"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-gray-800/70"
                >
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={allCurrentSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span>全选当前页</span>
                    </label>
                    {selectedIds.length > 0 && (
                      <span className="ui-chip-accent text-xs">已选 {selectedIds.length} 条</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="batch-approve-btn"
                      disabled={selectedIds.length === 0 || reviewing}
                      onClick={() => handleReview(selectedIds, 'approve')}
                      className="ui-btn inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                      <span>通过选定 ({selectedIds.length})</span>
                    </button>
                    <button
                      type="button"
                      data-testid="batch-reject-btn"
                      disabled={selectedIds.length === 0 || reviewing}
                      onClick={() => handleReview(selectedIds, 'reject')}
                      className="ui-btn inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-40"
                    >
                      <IconX className="h-3.5 w-3.5" />
                      <span>拒绝选定 ({selectedIds.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4" data-testid="admin-recalls-list">
                {loading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="my-card animate-pulse rounded-2xl bg-white p-5 dark:bg-gray-800">
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-white/10" />
                        <div className="mt-3 h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                      </div>
                    ))}
                  </div>
                )}

                {!loading && items.length === 0 && (
                  <div className="my-card rounded-2xl bg-white p-10 text-center dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">当前没有该状态的机经记录。</p>
                  </div>
                )}

                {!loading &&
                  items.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        data-testid={`admin-item-${item.id}`}
                        className={`my-card rounded-2xl bg-white p-5 transition-all dark:bg-gray-800 sm:p-6 ${
                          isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
                        }`}
                      >
                        {/* Item Header */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-white/10">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectItem(item.id)}
                              aria-label={`选择机经 ${item.id}`}
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="ui-chip font-mono text-xs">{item.examMonth}</span>
                            <span className="ui-chip-accent text-xs">
                              {formatRecallLabel(item.section, item.task)}
                            </span>
                            {item.city && (
                              <span className="ui-chip text-xs text-gray-600 dark:text-gray-300">{item.city}</span>
                            )}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                item.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                  : item.status === 'rejected'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                              }`}
                            >
                              {item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核'}
                            </span>
                          </div>

                          <div className="text-right text-[11px] text-gray-400 dark:text-gray-500">
                            <div>提交于: {formatDate(item.createdAt)}</div>
                            {item.reviewedAt && <div>审核于: {formatDate(item.reviewedAt)}</div>}
                          </div>
                        </div>

                        {/* Full text of topic */}
                        <div className="mt-3.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-100">
                          {item.topic}
                        </div>

                        {/* Note if present */}
                        {item.note && (
                          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs leading-relaxed text-gray-600 dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-gray-300">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">考生备注：</span>
                            <span className="whitespace-pre-wrap break-words">{item.note}</span>
                          </div>
                        )}

                        {/* Actions for this item */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
                          <span className="font-mono text-[11px] text-gray-400">ID: {item.id}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              data-testid={`approve-btn-${item.id}`}
                              disabled={reviewing}
                              onClick={() => handleReview([item.id], 'approve')}
                              className="ui-btn inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            >
                              <IconCheck className="h-3.5 w-3.5" />
                              <span>通过</span>
                            </button>
                            <button
                              type="button"
                              data-testid={`reject-btn-${item.id}`}
                              disabled={reviewing}
                              onClick={() => handleReview([item.id], 'reject')}
                              className="ui-btn inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                            >
                              <IconX className="h-3.5 w-3.5" />
                              <span>拒绝</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Load More Button */}
              {!loading && items.length > 0 && items.length < total && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    data-testid="admin-load-more-btn"
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
                        <span>加载更多 ({items.length} / {total})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
