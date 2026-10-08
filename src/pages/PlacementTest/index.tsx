import Layout from '@/components/Layout'
import { CEFR_TO_ECHELLE, COMMUNICATION_TYPES, ECHELLE_SKILLS, getEchelleLevel } from '@/resources/echelleQuebecoise'
import {
  PLACEMENT_QUESTIONS,
  PLACEMENT_SECTIONS,
  type PlacementQuestion,
  type PlacementResult,
  placementSectionLabel,
} from '@/resources/placementTest'
import { studyPhases } from '@/resources/studyPlan'
import { flushStudyProgress, getLearningProgress, recordPlacementResult } from '@/services/studyPlanSync'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconClock from '~icons/tabler/clock'
import IconPlayerPlay from '~icons/tabler/player-play'

type Mode = 'intro' | 'running' | 'result'

const ESTIMATED_MINUTES = 20

const toDateKey = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatClock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const levelBadgeClass: Record<string, string> = {
  A1: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  A2: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
  B1: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  B2: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  'B2+': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
}

function sectionQuestions(section: string) {
  return PLACEMENT_QUESTIONS.filter((q) => q.section === section)
}

export default function PlacementTestPage() {
  const [mode, setMode] = useState<Mode>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<PlacementResult | null>(null)
  const [previousLatest, setPreviousLatest] = useState<PlacementResult | null>(null)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const questions = PLACEMENT_QUESTIONS
  const current = questions[index]
  const progress = ((index + (mode === 'result' ? 1 : 0)) / questions.length) * 100

  const sectionProgress = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {}
    for (const section of PLACEMENT_SECTIONS) {
      const list = sectionQuestions(section)
      map[section] = {
        total: list.length,
        done: list.filter((q) => answers[q.id] !== undefined).length,
      }
    }
    return map
  }, [answers])

  useEffect(() => {
    void getLearningProgress().then((learning) => setPreviousLatest(learning.placement?.latest ?? null))
  }, [])

  useEffect(() => {
    if (mode !== 'running' || startedAt === null) return
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [mode, startedAt])

  const startTest = useCallback(() => {
    setAnswers({})
    setIndex(0)
    setReviewIndex(null)
    setResult(null)
    setStartedAt(Date.now())
    setElapsed(0)
    setMode('running')
  }, [])

  const selectChoice = (choiceIndex: number) => {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }))
  }

  const goNext = () => {
    if (index < questions.length - 1) setIndex((value) => value + 1)
    else finishTest()
  }

  const goPrev = () => {
    if (index > 0) setIndex((value) => value - 1)
  }

  const finishTest = () => {
    const finishedAt = Date.now()
    const start = startedAt ?? finishedAt
    const payload = {
      startedAt: start,
      finishedAt,
      durationSeconds: Math.max(1, Math.floor((finishedAt - start) / 1000)),
      answers: questions
        .map((q) => ({
          questionId: q.id,
          choiceIndex: answers[q.id] ?? -1,
        }))
        .filter((a) => a.choiceIndex >= 0),
    }
    if (payload.answers.length < questions.length) {
      const firstMissing = questions.findIndex((q) => answers[q.id] === undefined)
      if (firstMissing >= 0) setIndex(firstMissing)
      return
    }
    const saved = recordPlacementResult(payload)
    setResult(saved)
    setMode('result')
    void flushStudyProgress()
  }

  const phaseName = result ? studyPhases.find((p) => p.id === result.recommendations.studyPhaseId)?.name : null

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <NavLink
            to="/study-plan"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 no-underline transition-colors hover:text-gray-900 hover:no-underline dark:text-gray-400 dark:hover:text-white"
          >
            <IconArrowLeft className="h-4 w-4" />
            返回学习计划
          </NavLink>

          {mode === 'intro' && (
            <section
              data-testid="placement-intro"
              className="my-card relative overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-400/20 to-transparent blur-3xl"
              />
              <div className="relative">
                <div className="ui-eyebrow">入学定级 · Placement Test</div>
                <h1 className="ui-title mt-3">找到你的法语起点</h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                  约 {ESTIMATED_MINUTES} 分钟、共 {questions.length} 题，覆盖词汇、语法与阅读。结果映射到 CEFR（A1–B2+），并给出与 26
                  周路线图、词库与模考相匹配的
                  <strong className="font-semibold text-gray-900 dark:text-white">差异化学习建议</strong>
                  。分数写入学习后端，换设备用同步码即可恢复。
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: '词汇', count: sectionProgress.vocabulary?.total ?? 12, detail: '高频义与搭配' },
                    { label: '语法', count: sectionProgress.grammar?.total ?? 8, detail: '时态、从句与常见结构' },
                    { label: '阅读', count: sectionProgress.reading?.total ?? 4, detail: '通知 / 议论短文理解' },
                  ].map((item) => (
                    <div key={item.label} className="ui-stat">
                      <div className="ui-stat-label">{item.label}</div>
                      <div className="ui-stat-value">
                        {item.count}
                        <span className="ml-1 text-sm font-medium text-gray-400">题</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.detail}</div>
                    </div>
                  ))}
                </div>
                {previousLatest && (
                  <div className="ui-panel mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    上次定级
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelBadgeClass[previousLatest.cefrLevel] ?? ''}`}>
                      {previousLatest.cefrLevel}
                    </span>
                    <span className="text-gray-400">{toDateKey(previousLatest.finishedAt)} · 可重新测试以更新定位</span>
                  </div>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button type="button" data-testid="placement-start" onClick={startTest} className="ui-btn-primary px-5 py-3">
                    <IconPlayerPlay className="h-4 w-4" />
                    {previousLatest ? '重新定级' : '开始定级测试'}
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <IconClock className="h-4 w-4" />
                    不限时，计时仅用于参考
                  </span>
                </div>
              </div>
            </section>
          )}

          {mode === 'running' && current && (
            <section className="my-card rounded-[28px] bg-white p-5 dark:bg-gray-800 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="text-sm font-semibold tabular-nums text-gray-950 dark:text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="tabular-nums text-gray-300 dark:text-gray-600">/ {questions.length}</span>
                  <span className="ui-chip ml-2">{placementSectionLabel(current.section)}</span>
                  <span className="ui-chip">难度 {current.level}</span>
                </div>
                <span className="ui-chip tabular-nums">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatClock(elapsed)}
                </span>
              </div>
              <div className="ui-progress-track mt-4">
                <div className="ui-progress-bar" style={{ width: `${Math.max(progress, 1.5)}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-400">
                {PLACEMENT_SECTIONS.map((section) => {
                  const { done, total } = sectionProgress[section] ?? { done: 0, total: 0 }
                  return (
                    <span key={section} className="tabular-nums">
                      {placementSectionLabel(section)}{' '}
                      <span className={done === total ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'}>
                        {done}/{total}
                      </span>
                    </span>
                  )
                })}
              </div>
              {'passage' in current && current.passage && (
                <div className="mt-6 whitespace-pre-wrap rounded-2xl border-l-[3px] border-indigo-400 bg-gray-50/80 py-4 pl-5 pr-4 font-serif text-[15px] leading-7 text-gray-800 dark:bg-white/[0.03] dark:text-gray-100">
                  {current.passage}
                </div>
              )}
              <h2 className="mt-6 text-xl font-semibold leading-8 text-gray-950 dark:text-white">{current.prompt}</h2>
              <div className="mt-5 grid gap-2.5">
                {current.choices.map((choice, choiceIndex) => {
                  const selected = answers[current.id] === choiceIndex
                  return (
                    <button
                      key={choiceIndex}
                      type="button"
                      data-testid={`placement-choice-${choiceIndex}`}
                      onClick={() => selectChoice(choiceIndex)}
                      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all duration-150 ${
                        selected
                          ? 'border-indigo-400 bg-indigo-50/80 text-indigo-950 shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:border-indigo-400/60 dark:bg-indigo-500/10 dark:text-indigo-50'
                          : 'border-gray-200 bg-white hover:-translate-y-px hover:border-indigo-200 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-indigo-400/30'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-white/[0.06] dark:text-gray-300'
                        }`}
                      >
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <span>{choice}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.06]">
                <button type="button" onClick={goPrev} disabled={index === 0} className="ui-btn-secondary">
                  上一题
                </button>
                <button
                  type="button"
                  data-testid="placement-next"
                  onClick={goNext}
                  disabled={answers[current.id] === undefined}
                  className="ui-btn-primary px-5"
                >
                  {index === questions.length - 1 ? '提交并查看结果' : '下一题 →'}
                </button>
              </div>
            </section>
          )}

          {mode === 'result' && result && (
            <section data-testid="placement-result" className="space-y-5">
              <div className="my-card relative overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/25 to-transparent blur-3xl"
                />
                <div className="relative">
                  <div className="ui-eyebrow">定级结果</div>
                  <div className="mt-4 flex flex-wrap items-center gap-6">
                    <span
                      data-testid="placement-cefr-level"
                      className={`flex h-24 w-24 items-center justify-center rounded-[26px] text-4xl font-bold tracking-tight shadow-sm ring-1 ring-inset ring-black/5 ${
                        levelBadgeClass[result.cefrLevel] ?? ''
                      }`}
                    >
                      {result.cefrLevel}
                    </span>
                    <div>
                      <div className="text-lg font-semibold text-gray-950 dark:text-white">{result.recommendations.estimatedNclc}</div>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <span className="ui-chip tabular-nums">用时 {formatClock(result.durationSeconds)}</span>
                        <span className="ui-chip tabular-nums">
                          正确 {result.answers.filter((a) => a.correct).length}/{result.questionCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 max-w-2xl text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                    {result.recommendations.summaryZh}
                  </p>
                  {phaseName && (
                    <p className="mt-3 inline-flex rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                      建议从 26 周路线图的「{phaseName}」阶段（约 Week {result.recommendations.suggestedStartWeek}）重点投入。
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {PLACEMENT_SECTIONS.map((section) => {
                  const score = result.sectionScores[section]
                  const pct = score?.total ? Math.round((score.correct / score.total) * 100) : 0
                  return (
                    <div key={section} className="ui-stat">
                      <div className="ui-stat-label">{placementSectionLabel(section)}</div>
                      <div className="ui-stat-value">{pct}%</div>
                      <div className="ui-progress-track mt-3">
                        <div className="ui-progress-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <div className="mt-2 text-xs tabular-nums text-gray-500">
                        {score?.correct ?? 0}/{score?.total ?? 0} 题
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7">
                <h3 className="text-lg font-semibold text-gray-950 dark:text-white">推荐学习路径</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                  {result.recommendations.teachingFocus.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span className="leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {result.recommendations.routes.map((route) => (
                    <NavLink key={route.href} to={route.href} className="ui-btn-secondary">
                      {route.label} →
                    </NavLink>
                  ))}
                </div>
              </div>

              <EchelleSnapshot cefrLevel={result.cefrLevel} />

              <div className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">题目复盘</h3>
                  <button
                    type="button"
                    className="ui-btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => setReviewIndex(reviewIndex === null ? 0 : null)}
                  >
                    {reviewIndex === null ? '展开' : '收起'}
                  </button>
                </div>
                {reviewIndex !== null && (
                  <div className="mt-4 space-y-4">
                    {questions.map((question) => {
                      const answer = result.answers.find((a) => a.questionId === question.id)
                      const chosen = answer?.choiceIndex
                      return <QuestionReview key={question.id} question={question} chosen={chosen} correct={answer?.correct ?? false} />
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={startTest} className="ui-btn-secondary">
                  再测一次
                </button>
                <NavLink to="/study-plan" className="ui-btn-primary">
                  回到学习计划
                </NavLink>
              </div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  )
}

function EchelleSnapshot({ cefrLevel }: { cefrLevel: string }) {
  const level = CEFR_TO_ECHELLE[cefrLevel] ?? 4
  const type = getEchelleLevel('listening', level).type
  return (
    <div data-testid="placement-echelle" className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">对照魁北克能力量表</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            约 Niveau {level} · {type}（{COMMUNICATION_TYPES[type]?.zh}）。这一级在四项能力上大致意味着：
          </p>
        </div>
        <NavLink to={`/echelle?level=${level}`} className="ui-btn-secondary px-3 py-1.5 text-xs">
          看完整量表 →
        </NavLink>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ECHELLE_SKILLS.map((item) => (
          <NavLink
            key={item.skill}
            to={`/echelle?skill=${item.skill}&level=${level}`}
            className="rounded-2xl bg-gray-50 p-4 text-sm no-underline transition hover:bg-indigo-50/60 hover:no-underline dark:bg-white/[0.04] dark:hover:bg-indigo-500/10"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">{item.code}</span>
              <span className="font-semibold text-gray-950 dark:text-white">{item.labelZh}</span>
            </div>
            <p className="mt-1.5 leading-6 text-gray-600 dark:text-gray-300">{getEchelleLevel(item.skill, level).descriptionZh}</p>
          </NavLink>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        定级测试只考词汇、语法和阅读，量表等级是按 CEFR 估算的参考，四项的实际水平以对应模考为准。
      </p>
    </div>
  )
}

function QuestionReview({ question, chosen, correct }: { question: PlacementQuestion; chosen: number | undefined; correct: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-l-[3px] p-4 text-sm ${
        correct
          ? 'border-gray-200 border-l-emerald-400 dark:border-white/10 dark:border-l-emerald-500'
          : 'border-gray-200 border-l-amber-400 dark:border-white/10 dark:border-l-amber-500'
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
          {correct ? '✓ 正确' : '✗ 待加强'}
        </span>
        <span>
          {placementSectionLabel(question.section)} · {question.level}
        </span>
      </div>
      {question.passage && <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{question.passage}</p>}
      <p className="mt-2 font-medium text-gray-900 dark:text-white">{question.prompt}</p>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        你的选择：{chosen === undefined ? '—' : question.choices[chosen]} · 正确答案：{question.choices[question.correctIndex]}
      </p>
      <p className="mt-1 text-gray-500">{question.explanation}</p>
    </div>
  )
}
