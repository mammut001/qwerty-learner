import Layout from '@/components/Layout'
import { placementSectionLabel } from '@/resources/placementTest'
import {
  type AdminCohortSummary,
  type PlacementCohortReport,
  createAdminCohort,
  downloadPlacementCohortCsv,
  getStoredAdminToken,
  listAdminCohorts,
  loadAdminConfig,
  loadPlacementCohortReport,
  rotateAdminCohortJoinCode,
  saveAdminToken,
} from '@/services/studyAdmin'
import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'B2+']

export default function AdminPlacementPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [tokenInput, setTokenInput] = useState(() => getStoredAdminToken())
  const [report, setReport] = useState<PlacementCohortReport | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cohorts, setCohorts] = useState<AdminCohortSummary[]>([])
  const [selectedCohortId, setSelectedCohortId] = useState<string>('')
  const [newCohortName, setNewCohortName] = useState('')
  const [revealedJoinCode, setRevealedJoinCode] = useState('')
  const [cohortBusy, setCohortBusy] = useState(false)

  useEffect(() => {
    void loadAdminConfig()
      .then((config) => setEnabled(config.enabled))
      .catch(() => setEnabled(false))
  }, [])

  const maxLevelCount = useMemo(() => {
    if (!report) return 1
    return Math.max(1, ...LEVEL_ORDER.map((level) => report.byLevel[level] ?? 0))
  }, [report])

  const refreshCohorts = async (token: string) => {
    try {
      setCohorts(await listAdminCohorts(token))
    } catch {
      setCohorts([])
    }
  }

  const refresh = async (token: string, cohortId?: string | null) => {
    setLoading(true)
    setError('')
    try {
      const filterId = cohortId === '' || cohortId === undefined ? null : cohortId
      const next = await loadPlacementCohortReport(token, filterId)
      setReport(next)
      saveAdminToken(token)
      await refreshCohorts(token)
    } catch (cause) {
      setReport(null)
      if (cause instanceof Error && cause.message === 'ADMIN_UNAUTHORIZED') setError('管理员令牌无效。')
      else if (cause instanceof Error && cause.message === 'ADMIN_DISABLED') setError('服务端未配置 STUDY_ADMIN_TOKEN。')
      else setError('无法加载班级定级汇总，请检查网络与令牌。')
    } finally {
      setLoading(false)
    }
  }

  const submitToken = (event: React.FormEvent) => {
    event.preventDefault()
    void refresh(tokenInput.trim())
  }

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="my-card relative mt-2 overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-400/10 to-transparent blur-3xl"
            />
            <div className="ui-eyebrow relative text-violet-600 dark:text-violet-300">机构版 · 定级看板</div>
            <h1 className="ui-title relative mt-3">Placement 定级看板</h1>
            <p className="relative mt-3 max-w-3xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">
              可创建多个班级、发放分班邀请码，并按班级筛选定级汇总（匿名前缀 ID，不含同步码或个人内容）。需在服务端设置{' '}
              <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[13px] dark:bg-white/[0.06]">STUDY_ADMIN_TOKEN</code>（至少 16
              字符），浏览器用 Bearer 令牌访问。
            </p>
            <NavLink to="/study-plan" className="ui-btn-secondary relative mt-5 px-3 py-1.5 text-xs">
              ← 返回学习计划
            </NavLink>
          </header>

          {enabled === false && (
            <div
              data-testid="admin-disabled"
              className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100"
            >
              当前后端未启用机构 API。本地请在启动 <code>yarn server</code> 前导出 <code>STUDY_ADMIN_TOKEN</code>；Cloudflare 部署请在
              Worker 变量中配置同名密钥。
            </div>
          )}

          <form onSubmit={submitToken} className="my-card mt-5 rounded-3xl bg-white p-6 dark:bg-gray-800" data-testid="admin-token-form">
            <label className="ui-stat-label block">管理员令牌</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                className="ui-input min-w-[16rem] flex-1"
                placeholder="Bearer token（仅存于本会话 sessionStorage）"
                autoComplete="off"
              />
              <button type="submit" disabled={loading || !tokenInput.trim()} className="ui-btn-primary">
                {loading ? '加载中…' : '加载汇总'}
              </button>
              {report && (
                <button
                  type="button"
                  onClick={() => void downloadPlacementCohortCsv(tokenInput.trim(), selectedCohortId || null)}
                  className="ui-btn-secondary"
                >
                  导出 CSV
                </button>
              )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>

          {report && tokenInput.trim() && (
            <section data-testid="admin-cohort-tools" className="my-card mt-5 rounded-3xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">班级与邀请码</h2>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  定级汇总范围
                  <select
                    value={selectedCohortId}
                    onChange={(event) => {
                      const value = event.target.value
                      setSelectedCohortId(value)
                      void refresh(tokenInput.trim(), value || null)
                    }}
                    className="ui-input mt-1.5 block min-w-[12rem]"
                  >
                    <option value="">全部 learner（未分班 + 已分班）</option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name} · {cohort.memberCount} 人
                      </option>
                    ))}
                  </select>
                </label>
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const token = tokenInput.trim()
                    const name = newCohortName.trim()
                    if (!name) return
                    setCohortBusy(true)
                    void createAdminCohort(token, name)
                      .then((created) => {
                        setNewCohortName('')
                        setRevealedJoinCode(created.joinCode)
                        setSelectedCohortId(created.id)
                        return refresh(token, created.id)
                      })
                      .catch(() => setError('创建班级失败，请检查班级名称（2–80 字）。'))
                      .finally(() => setCohortBusy(false))
                  }}
                >
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    新建班级
                    <input
                      value={newCohortName}
                      onChange={(event) => setNewCohortName(event.target.value)}
                      className="ui-input mt-1.5 block min-w-[10rem]"
                      placeholder="例如：2026 春季 A 班"
                    />
                  </label>
                  <button type="submit" disabled={cohortBusy || newCohortName.trim().length < 2} className="ui-btn-primary">
                    创建并生成邀请码
                  </button>
                </form>
                {selectedCohortId && (
                  <button
                    type="button"
                    disabled={cohortBusy}
                    onClick={() => {
                      const token = tokenInput.trim()
                      setCohortBusy(true)
                      void rotateAdminCohortJoinCode(token, selectedCohortId)
                        .then((rotated) => setRevealedJoinCode(rotated.joinCode))
                        .catch(() => setError('轮换邀请码失败。'))
                        .finally(() => setCohortBusy(false))
                    }}
                    className="ui-btn-secondary"
                  >
                    轮换当前班邀请码
                  </button>
                )}
              </div>
              {revealedJoinCode && (
                <p
                  data-testid="admin-join-code-reveal"
                  className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100"
                >
                  分班邀请码（仅显示一次，请复制发给学员）
                  <strong className="rounded-lg bg-white px-2.5 py-1 font-mono text-base tracking-[0.12em] text-gray-950 shadow-sm ring-1 ring-amber-200 dark:bg-black/30 dark:text-white dark:ring-amber-400/20">
                    {revealedJoinCode}
                  </strong>
                </p>
              )}
            </section>
          )}

          {report && (
            <section data-testid="admin-placement-dashboard" className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <StatCard label="Learner 总数" value={String(report.totalLearners)} />
                <StatCard label="已完成定级" value={String(report.placementCompleted)} />
                <StatCard label="未定级" value={String(report.placementPending)} />
                <StatCard label="定级率" value={`${report.placementRate}%`} />
              </div>

              <div className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">CEFR 分布</h2>
                <div className="mt-4 space-y-3">
                  {LEVEL_ORDER.map((level) => {
                    const count = report.byLevel[level] ?? 0
                    const width = Math.round((count / maxLevelCount) * 100)
                    return (
                      <div key={level} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-200">{level}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-right tabular-nums text-gray-600 dark:text-gray-300">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">分项平均正确率（已定级学员）</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {Object.entries(report.cohortSectionAccuracy).map(([section, value]) => (
                    <div key={section} className="ui-stat">
                      <div className="ui-stat-label">{placementSectionLabel(section)}</div>
                      <div className="ui-stat-value">{value === null ? '—' : `${value}%`}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="my-card overflow-x-auto rounded-3xl bg-white dark:bg-gray-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-100 text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:border-white/[0.06] dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">学员 Ref</th>
                      <th className="px-4 py-3.5 font-semibold">CEFR</th>
                      <th className="px-4 py-3.5 font-semibold">完成时间</th>
                      <th className="px-4 py-3.5 font-semibold">推荐周</th>
                      <th className="px-4 py-3.5 font-semibold">弱项</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                          暂无定级记录
                        </td>
                      </tr>
                    ) : (
                      report.recent.map((row) => (
                        <tr
                          key={`${row.learnerRef}-${row.finishedAt}`}
                          className="border-t border-gray-100 transition-colors hover:bg-gray-50/70 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs">{row.learnerRef}</td>
                          <td className="px-4 py-2.5">
                            <span className="ui-chip-accent">{row.cefrLevel}</span>
                          </td>
                          <td className="px-4 py-2.5">{row.finishedAt ? new Date(row.finishedAt).toLocaleString() : '—'}</td>
                          <td className="px-4 py-2.5">{row.suggestedStartWeek ?? '—'}</td>
                          <td className="px-4 py-2.5">{row.weakestSection ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-stat">
      <div className="ui-stat-label">{label}</div>
      <div className="ui-stat-value">{value}</div>
    </div>
  )
}
