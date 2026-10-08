import Layout from '@/components/Layout'
import { ECHELLE_TARGET_LEVEL, getEchelleLevel } from '@/resources/echelleQuebecoise'
import { TCF_CONFIG, type TcfSkill } from '@/resources/tcfMock'
import { type StudyAnalytics, type TcfSkillAnalytics, getLearningProgress, loadStudyAnalytics } from '@/services/studyPlanSync'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const skills: { skill: TcfSkill; code: string; format: string }[] = [
  { skill: 'listening', code: 'CO', format: '39 题 · 35 分钟 · 音频只播一次' },
  { skill: 'reading', code: 'CE', format: '39 题 · 60 分钟 · A1 到 C2 递进' },
  { skill: 'writing', code: 'EE', format: '3 个任务 · 60 分钟 · 对照范文自评' },
  { skill: 'speaking', code: 'EO', format: '3 个任务 · 约 12 分钟 · 录音回放自评' },
]

const nclcLabel = (value: number | null | undefined) => (value == null ? '未测' : value >= 4 ? `NCLC ${value}` : 'NCLC < 4')

export default function TcfHubPage() {
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)
  const [placementLevel, setPlacementLevel] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      loadStudyAnalytics().catch(() => null),
      getLearningProgress()
        .then((learning) => learning.placement?.latest?.cefrLevel ?? null)
        .catch(() => null),
    ])
      .then(([analyticsValue, level]) => {
        if (cancelled) return
        if (analyticsValue) setAnalytics(analyticsValue)
        setPlacementLevel(level)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = (skill: TcfSkill): TcfSkillAnalytics | undefined => analytics?.tcf?.[skill]
  const reached = skills.filter(({ skill }) => stats(skill)?.gapToTarget === 0).length
  const attempted = skills.filter(({ skill }) => (stats(skill)?.attempts ?? 0) > 0).length

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="my-card relative overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/25 via-violet-400/20 to-transparent blur-3xl"
            />
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="ui-eyebrow">TCF Canada · 四项模考</span>
              {placementLevel ? (
                <span data-testid="tcf-hub-placement-level" className="ui-chip-accent">
                  定级 {placementLevel}
                </span>
              ) : (
                <NavLink
                  to="/placement-test"
                  className="ui-chip no-underline hover:border-indigo-200 hover:text-indigo-700 hover:no-underline"
                >
                  未定级 → 去测试
                </NavLink>
              )}
            </div>
            <div className="relative mt-3 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="ui-title">NCLC 7 总览</h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                  四项都达到 NCLC 7 才算达标：听力 458、阅读 453、写作和口语各 10/20。分数是训练估算，用来看差距和趋势，不代替官方成绩。
                </p>
                <NavLink
                  to="/echelle"
                  className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
                >
                  NCLC 7 = 魁北克能力量表 Niveau 7，看每项具体要求 →
                </NavLink>
              </div>
              <div
                data-testid="tcf-hub-summary"
                className="flex items-center gap-4 rounded-2xl border border-gray-200/70 bg-white/80 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="relative h-14 w-14">
                  <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-gray-200 dark:stroke-white/10" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(reached / 4) * 97.4} 97.4`}
                      className="stroke-indigo-500 transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-gray-950 dark:text-white">
                    {reached}/4
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-950 dark:text-white">{reached} / 4 项达标</div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {attempted === 0 ? '还没有模考记录' : reached === 4 ? '四项全部达标' : '项已达到 NCLC 7'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {skills.map(({ skill, code, format }) => {
              const config = TCF_CONFIG[skill]
              const data = stats(skill)
              const latest = data?.latestScore ?? null
              const gap = data?.gapToTarget ?? null
              const done = gap === 0
              const percent = latest === null ? 0 : Math.min(100, Math.round((latest / config.targetScore) * 100))
              return (
                <section
                  key={skill}
                  data-testid={`tcf-hub-${skill}`}
                  className="my-card group flex flex-col rounded-3xl bg-white p-6 transition-transform duration-200 hover:-translate-y-0.5 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(99,102,241,0.8)]">
                        {code}
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-950 dark:text-white">{config.shortLabel.replace(` ${code}`, '')}</h2>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{format}</p>
                      </div>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                        done
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20'
                          : latest === null
                          ? 'bg-gray-50 text-gray-500 ring-gray-200 dark:bg-white/[0.04] dark:text-gray-300 dark:ring-white/10'
                          : 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20'
                      }`}
                    >
                      {nclcLabel(data?.latestNclc)}
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-semibold tabular-nums tracking-tight ${
                        latest === null ? 'text-gray-300 dark:text-gray-600' : 'text-gray-950 dark:text-white'
                      }`}
                    >
                      {latest ?? '—'}
                    </span>
                    <span className="text-sm tabular-nums text-gray-400">
                      / 目标 {config.targetScore}（满分 {config.maxScore}）
                    </span>
                  </div>
                  <div
                    className="ui-progress-track mt-3"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label={`${config.shortLabel} 距 NCLC 7 目标的进度`}
                  >
                    <div
                      className={done ? 'h-full rounded-full bg-emerald-500 transition-all duration-500' : 'ui-progress-bar'}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{latest === null ? '做一次模考后显示差距' : done ? '已达到 NCLC 7 目标' : `距目标还差 ${gap} 分`}</span>
                    {data && data.attempts > 0 && (
                      <span>
                        已考 {data.attempts} 次 · 最高 {data.bestScore}
                      </span>
                    )}
                  </div>

                  <NavLink
                    to={`/echelle?skill=${skill}&level=${ECHELLE_TARGET_LEVEL}`}
                    data-testid={`tcf-hub-echelle-${skill}`}
                    className="mt-5 block rounded-2xl bg-gray-50 p-3.5 text-xs leading-5 text-gray-600 no-underline transition hover:bg-indigo-50/60 hover:no-underline dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-indigo-500/10"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">Niveau {ECHELLE_TARGET_LEVEL} 要做到：</span>
                    {getEchelleLevel(skill, ECHELLE_TARGET_LEVEL).descriptionZh}
                  </NavLink>

                  <NavLink to={config.route} className={`mt-6 w-fit ${latest === null ? 'ui-btn-primary' : 'ui-btn-secondary'}`}>
                    {latest === null ? '开始第一次模考 →' : '再考一次 →'}
                  </NavLink>
                </section>
              )
            })}
          </div>

          <div className="ui-panel mt-5 flex flex-wrap items-center justify-between gap-3 px-5 text-sm text-gray-600 dark:text-gray-300">
            <span>
              {!loaded
                ? '正在读取模考记录…'
                : analytics
                ? '每项的分数趋势和 NCLC 7 目标线在统计页。'
                : '暂时读不到模考统计（后端不可用且没有本机缓存），模考本身仍可正常进行。'}
            </span>
            <NavLink to="/analysis" className="ui-btn-secondary px-3 py-1.5 text-xs">
              查看趋势 →
            </NavLink>
          </div>
        </div>
      </main>
    </Layout>
  )
}
