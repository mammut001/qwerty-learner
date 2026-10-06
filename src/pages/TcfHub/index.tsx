import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { TCF_CONFIG, type TcfSkill } from '@/resources/tcfMock'
import { type StudyAnalytics, type TcfSkillAnalytics, loadStudyAnalytics } from '@/services/studyPlanSync'
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
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadStudyAnalytics()
      .then((value) => {
        if (!cancelled) setAnalytics(value)
      })
      .catch(() => undefined)
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
      <Header />
      <main className="w-full flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950/40 dark:to-gray-900 sm:p-8">
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">TCF Canada · 四项模考</div>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-950 dark:text-white">NCLC 7 总览</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                  四项都达到 NCLC 7 才算达标：听力 458、阅读 453、写作和口语各 10/20。分数是训练估算，用来看差距和趋势，不代替官方成绩。
                </p>
              </div>
              <div data-testid="tcf-hub-summary" className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm dark:bg-gray-800">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{reached} / 4</div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {attempted === 0 ? '还没有模考记录' : reached === 4 ? '四项全部达标' : '项已达到 NCLC 7'}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
                        {config.shortLabel.replace(` ${code}`, '')}
                        <span className="ml-2 text-sm font-normal text-gray-400">{code}</span>
                      </h2>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{format}</p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        done
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                          : latest === null
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {nclcLabel(data?.latestNclc)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-950 dark:text-white">{latest ?? '—'}</span>
                    <span className="text-sm text-gray-400">
                      / 目标 {config.targetScore}（满分 {config.maxScore}）
                    </span>
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label={`${config.shortLabel} 距 NCLC 7 目标的进度`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${done ? 'bg-green-500' : 'bg-indigo-500'}`}
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
                    to={config.route}
                    className="mt-5 inline-flex w-fit items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-indigo-700 hover:no-underline"
                  >
                    {latest === null ? '开始第一次模考' : '再考一次'}
                  </NavLink>
                </section>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <span>
              {!loaded
                ? '正在读取模考记录…'
                : analytics
                ? '每项的分数趋势和 NCLC 7 目标线在统计页。'
                : '暂时读不到模考统计（后端不可用且没有本机缓存），模考本身仍可正常进行。'}
            </span>
            <NavLink to="/analysis" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              查看趋势 →
            </NavLink>
          </div>
        </div>
      </main>
    </Layout>
  )
}
