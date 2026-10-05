import Layout from '@/components/Layout'
import {
  addStudyMinutes,
  flushStudyProgress,
  recordTcfAttempt,
  type TcfAttemptRecord,
} from '@/services/studyPlanSync'
import {
  TCF_CONFIG,
  TCF_QUESTIONS,
  estimateTcfNclc,
  estimateTcfScaledScore,
  type TcfQuestion,
  type TcfSkill,
} from '@/resources/tcfMock'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconClock from '~icons/tabler/clock'
import IconPlayerPlay from '~icons/tabler/player-play'

type ExamMode = 'intro' | 'running' | 'review'
const answerLetters = ['A', 'B', 'C', 'D'] as const

const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const nclcLabel = (value: number) => (value >= 4 ? `NCLC ${value}` : 'NCLC < 4')

function QuestionContent({
  question,
  skill,
  mode,
  selected,
  played,
  onPlay,
  onSelect,
}: {
  question: TcfQuestion
  skill: TcfSkill
  mode: ExamMode
  selected: number | undefined
  played: boolean
  onPlay: () => void
  onSelect: (choice: number) => void
}) {
  const reviewing = mode === 'review'
  return (
    <div className="space-y-5">
      <div className="text-xs font-medium uppercase tracking-wide text-indigo-500">
        {question.type} · {question.id.toUpperCase()}
      </div>

      {skill === 'listening' ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
          {reviewing ? (
            <>
              <div className="text-xs font-medium text-indigo-500">复盘音频文本</div>
              <p className="mt-2 leading-7 text-gray-800 dark:text-gray-100">{question.audioText}</p>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">音频只可播放一次</div>
                <div className="mt-1 text-sm text-gray-500">
                  {played ? '本题播放机会已使用。' : '准备好后再点击播放；点击后不能重播。'}
                </div>
              </div>
              <button
                type="button"
                data-testid="tcf-audio-play"
                disabled={played}
                onClick={onPlay}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
              >
                <IconPlayerPlay className="h-4 w-4" />
                {played ? '已播放' : '播放一次'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 leading-7 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          {question.passage}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">{question.prompt}</h2>
        <div className="mt-4 grid gap-3">
          {question.choices.map((choice, index) => {
            const isSelected = selected === index
            const isCorrect = reviewing && question.answer === index
            const isWrong = reviewing && isSelected && question.answer !== index
            const tone = isCorrect
              ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
              : isWrong
                ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                : isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800'
            return (
              <button
                key={choice}
                type="button"
                disabled={reviewing}
                onClick={() => onSelect(index)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${tone}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                  {answerLetters[index]}
                </span>
                <span className="pt-0.5 text-gray-800 dark:text-gray-100">{choice}</span>
              </button>
            )
          })}
        </div>
      </div>

      {reviewing && (
        <div data-testid="tcf-explanation" className="rounded-xl bg-gray-100 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <strong>解析：</strong>{question.explanation}
        </div>
      )}
    </div>
  )
}

export default function TcfMockExamPage({ skill }: { skill: TcfSkill }) {
  const config = TCF_CONFIG[skill]
  const questions = TCF_QUESTIONS[skill]
  const [searchParams] = useSearchParams()
  const studyDate = searchParams.get('studyDate')
  const studyTask = searchParams.get('studyTask')
  const [mode, setMode] = useState<ExamMode>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [played, setPlayed] = useState<Record<string, boolean>>({})
  const [remainingSeconds, setRemainingSeconds] = useState(config.minutes * 60)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [result, setResult] = useState<TcfAttemptRecord | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const question = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const targetGap = useMemo(
    () => (result ? Math.max(0, config.targetScore - result.scaledScore) : null),
    [config.targetScore, result],
  )

  useEffect(() => {
    if (mode !== 'running') return
    const timer = window.setInterval(() => {
      setRemainingSeconds((old) => Math.max(0, old - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [mode])

  useEffect(() => {
    if (mode === 'running' && remainingSeconds === 0 && !submitting) void finishExam()
  }, [mode, remainingSeconds, submitting])

  const startExam = () => {
    setMode('running')
    setCurrentIndex(0)
    setAnswers({})
    setPlayed({})
    setRemainingSeconds(config.minutes * 60)
    setStartedAt(Date.now())
    setResult(null)
    setMessage('')
  }

  const playAudio = () => {
    if (skill !== 'listening' || played[question.id]) return
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setMessage('当前浏览器不支持法语语音播放，请使用最新版 Chrome / Safari。')
      return
    }
    setPlayed((old) => ({ ...old, [question.id]: true }))
    const utterance = new SpeechSynthesisUtterance(question.audioText ?? '')
    utterance.lang = 'fr-CA'
    utterance.rate = 0.92
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  async function finishExam() {
    if (mode !== 'running' || startedAt === null || submitting) return
    setSubmitting(true)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    const finishedAt = Date.now()
    const responseItems = questions.map((item) => {
      const choice = answers[item.id]
      return {
        questionId: item.id,
        choice: choice === undefined ? null : choice,
        correct: choice === item.answer,
      }
    })
    const correctCount = responseItems.filter((item) => item.correct).length
    const scaledScore = estimateTcfScaledScore(correctCount)
    const nclc = estimateTcfNclc(skill, scaledScore)
    const durationSeconds = Math.max(
      0,
      Math.min(config.minutes * 60, Math.round((finishedAt - startedAt) / 1000)),
    )
    try {
      const saved = recordTcfAttempt({
        skill,
        questionCount: questions.length,
        answers: responseItems,
        correctCount,
        scaledScore,
        nclc,
        durationSeconds,
        startedAt,
        finishedAt,
      })
      setResult(saved)
      setMode('review')
      setCurrentIndex(0)
      if (
        studyDate &&
        studyTask &&
        /^\d{4}-\d{2}-\d{2}$/.test(studyDate) &&
        /^[a-z][a-z0-9-]{0,79}$/.test(studyTask)
      ) {
        addStudyMinutes(studyDate, studyTask, Math.max(1, Math.ceil(durationSeconds / 60)))
      }
      await flushStudyProgress()
      setMessage('模考结果已保存；断网时会先留在本机队列，恢复网络后自动同步。')
    } catch {
      setMessage('结果暂时无法保存，请保留本页并稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <NavLink to="/study-plan" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600">
              <IconArrowLeft className="h-4 w-4" />
              返回学习计划
            </NavLink>
            {mode !== 'intro' && (
              <div data-testid="tcf-timer" className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 font-mono text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <IconClock className="h-4 w-4" />
                {formatClock(remainingSeconds)}
              </div>
            )}
          </div>

          <header className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950/40 dark:to-gray-900 sm:p-8">
            <div className="text-sm font-semibold text-indigo-600">{config.label}</div>
            <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">39 题完整模拟</h1>
            <p className="mt-3 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">
              {skill === 'listening'
                ? '35 分钟。每题法语音频只能播放一次，四选一；交卷后查看音频文本、答案与解析。'
                : '60 分钟。覆盖通知、短文、实用文本、文章与观点类材料，四选一；交卷后逐题复盘。'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">目标 NCLC 7</span>
              <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">目标分数 {config.targetScore}</span>
              <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">{config.minutes} 分钟</span>
            </div>
          </header>

          {mode === 'intro' ? (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">考试说明</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                <li>• 共 39 题，四选一；计时结束会自动交卷。</li>
                {skill === 'listening' && <li>• 每题音频点击后立即消耗播放机会，不能暂停后重播。</li>}
                <li>• 分数为训练估算；真实 TCF Canada 使用官方加权换算。</li>
                <li>• 结果会保存作答、用时、估算分数和 NCLC，并通过现有同步机制跨设备恢复。</li>
              </ul>
              <button type="button" data-testid="tcf-start-exam" onClick={startExam} className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">
                开始完整模考
              </button>
            </section>
          ) : (
            <>
              {result && (
                <section data-testid="tcf-result" className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div><div className="text-xs text-gray-400">答对</div><div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{result.correctCount} / 39</div></div>
                    <div><div className="text-xs text-gray-400">估算分数</div><div className="mt-1 text-2xl font-bold text-indigo-600">{result.scaledScore} / 699</div></div>
                    <div><div className="text-xs text-gray-400">估算等级</div><div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{nclcLabel(result.nclc)}</div></div>
                    <div><div className="text-xs text-gray-400">距 NCLC 7</div><div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{targetGap === 0 ? '已达到' : `还差 ${targetGap} 分`}</div></div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-gray-500">训练分数采用 0–699 线性估算，仅用于趋势与目标差距，不代替官方成绩单。</p>
                </section>
              )}

              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-indigo-600">第 {currentIndex + 1} / {questions.length} 题</div>
                    {mode === 'running' && <div className="mt-1 text-xs text-gray-400">已作答 {answeredCount} / {questions.length}</div>}
                  </div>
                  <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                  </div>
                </div>

                <QuestionContent
                  question={question}
                  skill={skill}
                  mode={mode}
                  selected={answers[question.id]}
                  played={Boolean(played[question.id])}
                  onPlay={playAudio}
                  onSelect={(choice) => setAnswers((old) => ({ ...old, [question.id]: choice }))}
                />

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((old) => Math.max(0, old - 1))} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200">
                    上一题
                  </button>
                  <div className="flex gap-2">
                    {mode === 'running' && (
                      <button type="button" data-testid="tcf-submit-exam" disabled={submitting} onClick={() => void finishExam()} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-50 dark:border-red-900">
                        {submitting ? '正在保存…' : '交卷'}
                      </button>
                    )}
                    <button type="button" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex((old) => Math.min(questions.length - 1, old + 1))} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
                      下一题
                    </button>
                  </div>
                </div>
              </section>

              {mode === 'review' && (
                <div data-testid="tcf-review-grid" className="mt-4 grid grid-cols-8 gap-2 sm:grid-cols-10">
                  {questions.map((item, index) => {
                    const correct = answers[item.id] === item.answer
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`复盘第 ${index + 1} 题`}
                        className={`h-9 rounded-lg text-xs font-semibold ${currentIndex === index ? 'ring-2 ring-indigo-500' : ''} ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {message && <div className="mt-5 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{message}</div>}
        </div>
      </div>
    </Layout>
  )
}
