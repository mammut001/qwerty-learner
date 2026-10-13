import Layout from '@/components/Layout'
import {
  type RecallItem,
  type RecallSection,
  formatRecallLabel,
  getTaskOptions,
  listRecalls,
  listSelectableMonths,
  submitRecall,
  validateRecallInput,
} from '@/services/recalls'
import { trackAnalyticsEvent } from '@/utils/analytics'
import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import IconAlertCircle from '~icons/tabler/alert-circle'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconMessageShare from '~icons/tabler/message-share'
import IconPlus from '~icons/tabler/plus'
import IconRefresh from '~icons/tabler/refresh'
import IconX from '~icons/tabler/x'

const PAGE_SIZE = 20

export default function ExamRecallsPage() {
  const [items, setItems] = useState<RecallItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Filters
  const [sectionFilter, setSectionFilter] = useState<RecallSection | ''>('')
  const [taskFilter, setTaskFilter] = useState<number | ''>('')
  const [monthFilter, setMonthFilter] = useState<string>('')

  // Share form open/close & state
  const [showForm, setShowForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form inputs
  const availableMonths = useMemo(() => listSelectableMonths(), [])
  const [formSection, setFormSection] = useState<RecallSection>('speaking')
  const [formTask, setFormTask] = useState<number>(2)
  const [formMonth, setFormMonth] = useState<string>(() => availableMonths[0] || '')
  const [formCity, setFormCity] = useState('')
  const [formTopic, setFormTopic] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({})

  const formId = useId()

  // Track page view once on mount
  useEffect(() => {
    trackAnalyticsEvent('recall_view')
  }, [])

  // Available task filters based on sectionFilter
  const filterTaskOptions = useMemo(() => {
    if (sectionFilter === 'speaking') return [2, 3]
    if (sectionFilter === 'writing') return [1, 2, 3]
    return [1, 2, 3]
  }, [sectionFilter])

  // Form task options based on formSection
  const formTaskOptions = useMemo(() => {
    return getTaskOptions(formSection)
  }, [formSection])

  // Ensure formTask stays valid when formSection changes
  const handleFormSectionChange = (nextSection: RecallSection) => {
    setFormSection(nextSection)
    const nextTasks = getTaskOptions(nextSection)
    if (!nextTasks.includes(formTask)) {
      setFormTask(nextTasks[0] || 2)
    }
  }

  // Handle section filter change and reset task filter if incompatible
  const handleSectionFilterChange = (nextSection: RecallSection | '') => {
    setSectionFilter(nextSection)
    if (nextSection === 'speaking' && taskFilter === 1) {
      setTaskFilter('')
    }
  }

  // Fetch initial page or refetch on filter change
  const fetchList = useCallback(
    async (offset = 0, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setFetchError('')
      }

      try {
        const res = await listRecalls({
          section: sectionFilter || undefined,
          task: typeof taskFilter === 'number' ? taskFilter : undefined,
          month: monthFilter || undefined,
          limit: PAGE_SIZE,
          offset,
        })

        if (append) {
          setItems((prev) => [...prev, ...res.items])
        } else {
          setItems(res.items)
        }
        setTotal(res.total)
      } catch (err) {
        if (!append) {
          setFetchError(err instanceof Error ? err.message : '加载失败，请检查网络后重试。')
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [sectionFilter, taskFilter, monthFilter],
  )

  // Trigger refetch whenever filters change
  useEffect(() => {
    void fetchList(0, false)
  }, [fetchList])

  // Load more pagination
  const handleLoadMore = () => {
    if (loadingMore || items.length >= total) return
    void fetchList(items.length, true)
  }

  // Reset form to defaults
  const resetForm = () => {
    setFormSection('speaking')
    setFormTask(2)
    setFormMonth(availableMonths[0] || '')
    setFormCity('')
    setFormTopic('')
    setFormNote('')
    setFormFieldErrors({})
    setSubmitError('')
  }

  // Handle submit recall
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const payload = {
      section: formSection,
      task: formTask,
      examMonth: formMonth,
      city: formCity.trim(),
      topic: formTopic.trim(),
      note: formNote.trim(),
    }

    // Client-side validation
    const validation = validateRecallInput(payload)
    if (!validation.valid) {
      setFormFieldErrors(validation.errors as Record<string, string>)
      return
    }
    setFormFieldErrors({})

    setSubmitting(true)
    try {
      await submitRecall(payload)
      trackAnalyticsEvent('recall_submit', { section: formSection })
      setSubmitSuccess('已提交，审核通过后会显示在列表中。谢谢分享！')
      resetForm()
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('提交失败，请检查网络后重试。')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {/* Header Block */}
          <header className="my-card relative overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/25 via-violet-400/20 to-transparent blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="ui-eyebrow">考生回忆 · 互助备考</span>
                <h1 className="ui-title mt-2">机经分享</h1>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">
                  考过 TCF Canada 的同学回忆的口语、写作题目，按考试月份整理。
                </p>
              </div>
              <button
                type="button"
                data-testid="open-share-form-btn"
                onClick={() => {
                  setShowForm((prev) => !prev)
                  setSubmitSuccess('')
                  setSubmitError('')
                }}
                className="ui-btn-primary inline-flex shrink-0 items-center gap-2 self-start rounded-2xl px-4 py-2.5 sm:self-center"
              >
                {showForm ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                <span>{showForm ? '收起分享表单' : '分享我考到的题目'}</span>
              </button>
            </div>
          </header>

          {/* Clearly visible notice card */}
          <div
            data-testid="recall-notice-card"
            className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs leading-5 text-amber-900 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100 sm:text-sm sm:leading-6"
          >
            <div className="flex items-start gap-2.5">
              <IconAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                内容来自考生回忆，非官方题目，可能不完整或有出入，仅供备考参考。请勿上传试卷照片或官方原文。
              </div>
            </div>
          </div>

          {/* Submission Form Card (Collapsible) */}
          {showForm && (
            <section
              data-testid="recall-submission-form"
              className="my-card rounded-3xl border border-indigo-100 bg-white p-6 shadow-md transition-all dark:border-white/10 dark:bg-gray-800 sm:p-7"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
                <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <IconMessageShare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>分享我考到的题目</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                  aria-label="关闭表单"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>

              {submitSuccess && (
                <div
                  data-testid="recall-submit-success"
                  className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  <IconCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div
                  data-testid="recall-submit-error"
                  className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                >
                  <IconAlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                {/* Section selection */}
                <div>
                  <label className="ui-stat-label block text-xs">考试科目</label>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      data-testid="section-opt-speaking"
                      onClick={() => handleFormSectionChange('speaking')}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                        formSection === 'speaking'
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300'
                      }`}
                    >
                      口语 (EO)
                    </button>
                    <button
                      type="button"
                      data-testid="section-opt-writing"
                      onClick={() => handleFormSectionChange('writing')}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                        formSection === 'writing'
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300'
                      }`}
                    >
                      写作 (EE)
                    </button>
                  </div>
                  {formFieldErrors.section && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.section}</p>
                  )}
                </div>

                {/* Task selection & Exam month */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${formId}-task`} className="ui-stat-label block text-xs">
                      任务编号
                    </label>
                    <div className="mt-2 flex gap-2">
                      {formTaskOptions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormTask(t)}
                          className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                            formTask === t
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300'
                          }`}
                        >
                          任务 {t}
                        </button>
                      ))}
                    </div>
                    {formFieldErrors.task && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.task}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`${formId}-month`} className="ui-stat-label block text-xs">
                      考试月份
                    </label>
                    <select
                      id={`${formId}-month`}
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      className="ui-input mt-2 block w-full py-2"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {formFieldErrors.examMonth && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.examMonth}</p>
                    )}
                  </div>
                </div>

                {/* City input */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor={`${formId}-city`} className="ui-stat-label block text-xs">
                      考点城市（选填）
                    </label>
                    <span className="text-xs text-gray-400">{formCity.length} / 40 字</span>
                  </div>
                  <input
                    id={`${formId}-city`}
                    type="text"
                    maxLength={40}
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="例如：蒙特利尔 / 巴黎 / 北京（选填）"
                    className="ui-input mt-1.5 block w-full"
                  />
                  {formFieldErrors.city && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.city}</p>
                  )}
                </div>

                {/* Topic textarea */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor={`${formId}-topic`} className="ui-stat-label block text-xs">
                      题目内容与描述 <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs ${
                        formTopic.trim().length > 0 && (formTopic.trim().length < 10 || formTopic.trim().length > 800)
                          ? 'font-medium text-amber-600 dark:text-amber-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {formTopic.length} / 800 字 (最少 10 字)
                    </span>
                  </div>
                  <textarea
                    id={`${formId}-topic`}
                    rows={4}
                    maxLength={800}
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="请尽量详细回忆考题的具体情景、题目要求或提问。请勿包含网页链接或官方试卷原文。"
                    className="ui-input mt-1.5 block w-full resize-y font-sans leading-relaxed"
                  />
                  {formFieldErrors.topic && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.topic}</p>
                  )}
                </div>

                {/* Note textarea */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor={`${formId}-note`} className="ui-stat-label block text-xs">
                      备考说明或细节（选填）
                    </label>
                    <span className="text-xs text-gray-400">{formNote.length} / 300 字</span>
                  </div>
                  <textarea
                    id={`${formId}-note`}
                    rows={2}
                    maxLength={300}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="例如：考官态度、追问细节、解题体会或难度感受（选填，300 字以内）"
                    className="ui-input mt-1.5 block w-full resize-y font-sans leading-relaxed"
                  />
                  {formFieldErrors.note && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formFieldErrors.note}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowForm(false)
                    }}
                    className="ui-btn-secondary px-4 py-2"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    data-testid="submit-recall-btn"
                    disabled={submitting}
                    className="ui-btn-primary px-5 py-2"
                  >
                    {submitting ? '提交中…' : '确认提交'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Filters Bar */}
          <section className="my-card rounded-2xl bg-white p-4 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Section filter pills */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleSectionFilterChange('')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      sectionFilter === ''
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    全部科目
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionFilterChange('speaking')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      sectionFilter === 'speaking'
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    口语
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionFilterChange('writing')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      sectionFilter === 'writing'
                        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    写作
                  </button>
                </div>

                {/* Task filter select */}
                <div className="relative">
                  <select
                    value={taskFilter === '' ? '' : String(taskFilter)}
                    onChange={(e) => {
                      const val = e.target.value
                      setTaskFilter(val === '' ? '' : Number(val))
                    }}
                    className="ui-input py-1.5 pl-3 pr-8 text-xs font-medium"
                    aria-label="按任务筛选"
                  >
                    <option value="">全部任务</option>
                    {filterTaskOptions.map((t) => (
                      <option key={t} value={t}>
                        任务 {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month filter select */}
                <div className="relative">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="ui-input py-1.5 pl-3 pr-8 text-xs font-medium"
                    aria-label="按月份筛选"
                  >
                    <option value="">全部月份</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total count indicator */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                共 <span className="font-semibold text-gray-800 dark:text-gray-200">{total}</span> 条通过审核
              </div>
            </div>
          </section>

          {/* List of Recall Cards */}
          <section className="space-y-4" data-testid="recalls-list-section">
            {/* Error state */}
            {fetchError && !loading && (
              <div className="my-card rounded-2xl bg-white p-8 text-center dark:bg-gray-800">
                <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => void fetchList(0, false)}
                  className="ui-btn-secondary mt-4 inline-flex items-center gap-1.5 text-xs"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  <span>重试</span>
                </button>
              </div>
            )}

            {/* Loading state for initial load */}
            {loading && (
              <div className="space-y-3" data-testid="recalls-loading">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="my-card animate-pulse rounded-2xl bg-white p-5 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                      <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
                    </div>
                    <div className="mt-3 h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !fetchError && items.length === 0 && (
              <div
                data-testid="recalls-empty"
                className="my-card rounded-2xl bg-white p-12 text-center dark:bg-gray-800"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  还没有通过审核的机经，欢迎分享第一条。
                </p>
                {!showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="ui-btn-primary mt-4 inline-flex items-center gap-1.5 text-xs"
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                    <span>立即分享</span>
                  </button>
                )}
              </div>
            )}

            {/* Item cards */}
            {!loading &&
              items.map((item) => (
                <article
                  key={item.id}
                  data-testid={`recall-item-${item.id}`}
                  className="my-card rounded-2xl bg-white p-5 transition-shadow hover:shadow-md dark:bg-gray-800 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="ui-chip font-mono font-medium text-gray-700 dark:text-gray-300">
                        {item.examMonth}
                      </span>
                      <span className="ui-chip-accent">
                        {formatRecallLabel(item.section, item.task)}
                      </span>
                      {item.city && (
                        <span className="ui-chip text-gray-500 dark:text-gray-400">
                          {item.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic (Preserves line breaks) */}
                  <div className="mt-3.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {item.topic}
                  </div>

                  {/* Note if present */}
                  {item.note && (
                    <div className="mt-3.5 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs leading-relaxed text-gray-600 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-gray-300">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">备考备注：</span>
                      <span className="whitespace-pre-wrap break-words">{item.note}</span>
                    </div>
                  )}
                </article>
              ))}

            {/* Load More Pagination */}
            {!loading && items.length > 0 && items.length < total && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  data-testid="load-more-btn"
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
          </section>
        </div>
      </main>
    </Layout>
  )
}
