import LookupText from '@/components/Dictionary/LookupText'
import Header from '@/components/Header'
import Layout from '@/components/Layout'
import {
  TCF_CONFIG,
  TCF_MIXED_SET_ID,
  TCF_QUESTIONS,
  TCF_QUESTION_SETS,
  type TcfQcmSkill,
  type TcfQuestion,
  estimateTcfNclc,
  estimateTcfScaledScore,
  pickTcfQuestions,
  shuffleTcfChoiceOrder,
} from '@/resources/tcfMock'
import { type TcfAttemptRecord, addStudyMinutes, flushStudyProgress, getLearningProgress, recordTcfAttempt } from '@/services/studyPlanSync'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconClock from '~icons/tabler/clock'
import IconPlayerPlay from '~icons/tabler/player-play'

type ExamMode = 'intro' | 'running' | 'review' | 'practice'
const answerLetters = ['A', 'B', 'C', 'D'] as const
const defaultChoiceOrder = [0, 1, 2, 3]
const setStorageKey = (skill: TcfQcmSkill) => `qwerty-fr-tcf-set-${skill}`

const readStoredSetId = (skill: TcfQcmSkill) => {
  try {
    const stored = window.localStorage.getItem(setStorageKey(skill))
    if (stored === TCF_MIXED_SET_ID || TCF_QUESTION_SETS[skill].some((set) => set.id === stored)) return stored as string
  } catch {
    // Storage may be unavailable; fall back to the first set.
  }
  return TCF_QUESTION_SETS[skill][0].id
}

// Wrong-answer practice is local: a question leaves the pool once it is answered correctly after its last wrong attempt.
const clearedStorageKey = (skill: TcfQcmSkill) => `qwerty-fr-tcf-practice-cleared-${skill}`

const readClearedQuestions = (skill: TcfQcmSkill): Record<string, number> => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(clearedStorageKey(skill)) ?? '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, number>
  } catch {
    // Treat unreadable storage as "nothing cleared yet".
  }
  return {}
}

const markQuestionCleared = (skill: TcfQcmSkill, questionId: string) => {
  try {
    window.localStorage.setItem(clearedStorageKey(skill), JSON.stringify({ ...readClearedQuestions(skill), [questionId]: Date.now() }))
  } catch {
    // The question simply stays in the practice pool.
  }
}

const formatClock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const nclcLabel = (value: number) => (value >= 4 ? `NCLC ${value}` : 'NCLC < 4')

function QuestionContent({
  question,
  skill,
  mode,
  selected,
  order,
  played,
  replayable = false,
  onPlay,
  onSelect,
}: {
  question: TcfQuestion
  skill: TcfQcmSkill
  mode: ExamMode
  selected: number | undefined
  /** Display order of the choices; values are indexes into `question.choices`. */
  order: number[]
  played: boolean
  replayable?: boolean
  onPlay: () => void
  onSelect: (choice: number) => void
}) {
  const reviewing = mode === 'review'
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-indigo-500">
        <span>
          {question.type} · {question.id.toUpperCase()}
        </span>
      </div>

      {skill === 'listening' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Audio Console / Transcription */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/40">
              {reviewing ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    复盘音频文本 (Transcription) · 点单词可查词
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-800 dark:text-gray-100">
                    <LookupText text={question.audioText ?? ''} />
                  </p>
                </>
              ) : (
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">听力音频控制台</div>
                  <div className="mt-2 text-xs leading-relaxed text-gray-500">
                    {replayable
                      ? '错题重练不限播放次数，听清楚再作答。'
                      : played
                      ? '本题播放机会已使用。'
                      : '准备好后再点击播放；音频仅可播放一次，不可暂停或重播。'}
                  </div>
                  <button
                    type="button"
                    data-testid="tcf-audio-play"
                    disabled={played}
                    onClick={onPlay}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
                  >
                    <IconPlayerPlay className="h-4 w-4" />
                    {replayable ? '播放音频' : played ? '已播放' : '播放音频 (一次机会)'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Prompt and choices */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-bold leading-snug text-gray-950 dark:text-white">
                {reviewing ? <LookupText text={question.prompt} /> : question.prompt}
              </h2>

              <div className="mt-4 grid gap-2.5">
                {order.map((index, position) => {
                  const choice = question.choices[index]
                  const isSelected = selected === index
                  const isCorrect = reviewing && question.answer === index
                  const isWrong = reviewing && isSelected && question.answer !== index
                  const tone = isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                    : isWrong
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                    : isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800'
                  return reviewing ? (
                    <div key={choice} className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${tone}`}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {answerLetters[position]}
                      </span>
                      <span className="pt-0.5 text-sm text-gray-800 dark:text-gray-100">
                        <LookupText text={choice} />
                      </span>
                    </div>
                  ) : (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => onSelect(index)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${tone}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {answerLetters[position]}
                      </span>
                      <span className="pt-0.5 text-sm text-gray-800 dark:text-gray-100">{choice}</span>
                    </button>
                  )
                })}
              </div>

              {reviewing && (
                <div
                  data-testid="tcf-explanation"
                  className="mt-4 rounded-xl bg-gray-100 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <strong className="text-gray-900 dark:text-white">解析：</strong>
                  <LookupText text={question.explanation} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Reading: Realistic TCF SO two-column split layout */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Passage / Document (7 cols) */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-2xl border border-gray-200 bg-gray-50/80 p-6 leading-relaxed text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 sm:text-base sm:leading-7">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Document / 阅读材料
                {reviewing && <span className="ml-2 font-medium normal-case tracking-normal text-indigo-400">点单词可查词</span>}
              </div>
              <div className="whitespace-pre-wrap">{reviewing ? <LookupText text={question.passage ?? ''} /> : question.passage}</div>
            </div>
          </div>

          {/* Right Column: Question prompt & choices (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-500">Question / 问题</div>
              <h2 className="text-base font-bold leading-snug text-gray-950 dark:text-white sm:text-lg">
                {reviewing ? <LookupText text={question.prompt} /> : question.prompt}
              </h2>

              <div className="mt-4 grid gap-2.5">
                {order.map((index, position) => {
                  const choice = question.choices[index]
                  const isSelected = selected === index
                  const isCorrect = reviewing && question.answer === index
                  const isWrong = reviewing && isSelected && question.answer !== index
                  const tone = isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                    : isWrong
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                    : isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800'
                  return reviewing ? (
                    <div key={choice} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${tone}`}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {answerLetters[position]}
                      </span>
                      <span className="pt-0.5 text-xs font-medium text-gray-800 dark:text-gray-100 sm:text-sm">
                        <LookupText text={choice} />
                      </span>
                    </div>
                  ) : (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => onSelect(index)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${tone}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {answerLetters[position]}
                      </span>
                      <span className="pt-0.5 text-xs font-medium text-gray-800 dark:text-gray-100 sm:text-sm">{choice}</span>
                    </button>
                  )
                })}
              </div>

              {reviewing && (
                <div
                  data-testid="tcf-explanation"
                  className="mt-4 rounded-xl bg-gray-100 p-4 text-xs leading-5 text-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:text-sm sm:leading-6"
                >
                  <strong className="text-gray-900 dark:text-white">解析：</strong>
                  <LookupText text={question.explanation} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TcfMockExamPage({ skill }: { skill: TcfQcmSkill }) {
  const config = TCF_CONFIG[skill]
  const [setId, setSetId] = useState(() => readStoredSetId(skill))
  const [questions, setQuestions] = useState<TcfQuestion[]>(() => TCF_QUESTIONS[skill])
  const [choiceOrder, setChoiceOrder] = useState<Record<string, number[]>>({})
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
  const [onlyWrong, setOnlyWrong] = useState(false)
  const [practicePool, setPracticePool] = useState<TcfQuestion[]>([])

  const refreshPracticePool = useCallback(async () => {
    try {
      const learning = await getLearningProgress()
      const latest = new Map<string, { correct: boolean; at: number }>()
      const attempts = learning.tcfAttempts.filter((item) => item.skill === skill).sort((a, b) => a.finishedAt - b.finishedAt)
      for (const attempt of attempts) {
        for (const answer of attempt.answers ?? []) {
          if (answer.choice !== null) latest.set(answer.questionId, { correct: answer.correct, at: attempt.finishedAt })
        }
      }
      const cleared = readClearedQuestions(skill)
      setPracticePool(
        TCF_QUESTION_SETS[skill]
          .flatMap((set) => set.questions)
          .filter((item) => {
            const last = latest.get(item.id)
            return last !== undefined && !last.correct && (cleared[item.id] ?? 0) < last.at
          }),
      )
    } catch {
      // Without readable history there is simply nothing to practise yet.
    }
  }, [skill])

  useEffect(() => {
    void refreshPracticePool()
  }, [refreshPracticePool])

  const question = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const targetGap = useMemo(() => (result ? Math.max(0, config.targetScore - result.scaledScore) : null), [config.targetScore, result])

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

  const chooseSet = (nextSetId: string) => {
    setSetId(nextSetId)
    try {
      window.localStorage.setItem(setStorageKey(skill), nextSetId)
    } catch {
      // Remembering the last set is optional.
    }
  }

  // Audio belongs to one question; leaving it must not keep the previous clip playing.
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [currentIndex])

  const startPractice = () => {
    if (practicePool.length === 0) return
    setQuestions(practicePool)
    setChoiceOrder(Object.fromEntries(practicePool.map((item) => [item.id, shuffleTcfChoiceOrder()])))
    setMode('practice')
    setCurrentIndex(0)
    setAnswers({})
    setPlayed({})
    setResult(null)
    setMessage('')
  }

  const leavePractice = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setMode('intro')
    setAnswers({})
    void refreshPracticePool()
  }

  const selectChoice = (choice: number) => {
    if (mode === 'practice') {
      if (answers[question.id] !== undefined) return
      if (choice === question.answer) markQuestionCleared(skill, question.id)
    }
    setAnswers((old) => ({ ...old, [question.id]: choice }))
  }

  const startExam = () => {
    const nextQuestions = pickTcfQuestions(skill, setId)
    setQuestions(nextQuestions)
    setChoiceOrder(Object.fromEntries(nextQuestions.map((item) => [item.id, shuffleTcfChoiceOrder()])))
    setMode('running')
    setCurrentIndex(0)
    setAnswers({})
    setPlayed({})
    setRemainingSeconds(config.minutes * 60)
    setStartedAt(Date.now())
    setResult(null)
    setOnlyWrong(false)
    setMessage('')
  }

  const playAudio = () => {
    if (skill !== 'listening' || (mode !== 'practice' && played[question.id])) return
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setMessage('当前浏览器不支持法语语音播放，请使用最新版 Chrome / Safari。')
      return
    }
    if (mode !== 'practice') setPlayed((old) => ({ ...old, [question.id]: true }))
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
    const durationSeconds = Math.max(0, Math.min(config.minutes * 60, Math.round((finishedAt - startedAt) / 1000)))
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
      if (studyDate && studyTask && /^\d{4}-\d{2}-\d{2}$/.test(studyDate) && /^[a-z][a-z0-9-]{0,79}$/.test(studyTask)) {
        addStudyMinutes(studyDate, studyTask, Math.max(1, Math.ceil(durationSeconds / 60)))
      }
      await flushStudyProgress()
      void refreshPracticePool()
      setMessage('模考结果已保存；断网时会先留在本机队列，恢复网络后自动同步。')
    } catch {
      setMessage('结果暂时无法保存，请保留本页并稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      {mode !== 'running' && <Header />}
      <div className="flex w-full flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className={`mx-auto w-full ${mode !== 'intro' ? 'max-w-7xl' : 'max-w-5xl'}`}>
          {/* Header navigation & status */}
          {mode === 'running' ? (
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
              <div className="flex items-center gap-3">
                <NavLink
                  to="/study-plan"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-500 hover:text-indigo-600"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  退出
                </NavLink>
                <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <span className="whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
                  <span className="hidden sm:inline">{config.label} · </span>第 {currentIndex + 1} / {questions.length} 题
                </span>
                <span className="hidden whitespace-nowrap text-xs text-gray-400 sm:inline">
                  (已作答 {answeredCount} / {questions.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  data-testid="tcf-timer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-1.5 font-mono text-sm font-bold text-gray-800 shadow-inner dark:bg-gray-900 dark:text-gray-100"
                >
                  <IconClock className="h-4 w-4" />
                  {formatClock(remainingSeconds)}
                </div>
                <button
                  type="button"
                  data-testid="tcf-submit-exam"
                  disabled={submitting}
                  onClick={() => void finishExam()}
                  className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? '正在交卷…' : '交卷'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-4">
              {mode === 'practice' && (
                <>
                  <button
                    type="button"
                    data-testid="tcf-leave-practice"
                    onClick={leavePractice}
                    className="mr-auto inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    结束重练
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    错题重练 · 不计时 · 答对 {questions.filter((item) => answers[item.id] === item.answer).length} / {questions.length}
                  </div>
                </>
              )}
              {mode === 'review' && (
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  复盘模式 · {config.label}
                </div>
              )}
            </div>
          )}

          {/* Banner: Only in intro mode */}
          {mode === 'intro' && (
            <header className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950/40 dark:to-gray-900 sm:p-8">
              <div className="text-sm font-semibold text-indigo-600">{config.label}</div>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">39 题完整模拟</h1>
              <p className="mt-3 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">
                {skill === 'listening'
                  ? '35 分钟。每题法语音频只能播放一次，四选一；交卷后查看音频文本、答案与解析。'
                  : '60 分钟。覆盖通知、短文、实用文本、文章与观点类材料，四选一；交卷后逐题复盘。'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标 NCLC 7
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标分数 {config.targetScore}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  {config.minutes} 分钟
                </span>
              </div>
            </header>
          )}

          {mode === 'intro' ? (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">考试说明</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                <li>• 共 39 题，四选一，难度由 A1 逐步升到 C2；选项顺序每次随机；计时结束会自动交卷。</li>
                {skill === 'listening' && <li>• 每题音频点击后立即消耗播放机会，不能暂停后重播。</li>}
                <li>• 分数为训练估算；真实 TCF Canada 使用官方加权换算。</li>
                <li>• 结果会保存作答、用时、估算分数和 NCLC，并通过现有同步机制跨设备恢复。</li>
              </ul>
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">选择题库</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="选择题库">
                  {[
                    ...TCF_QUESTION_SETS[skill].map((set) => ({
                      id: set.id,
                      label: set.label,
                      detail: `${set.questions.length} 题固定套题`,
                    })),
                    { id: TCF_MIXED_SET_ID, label: '随机组卷', detail: '每题从各套题同一难度位置随机抽取' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={setId === option.id}
                      data-testid={`tcf-set-${option.id}`}
                      onClick={() => chooseSet(option.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        setId === option.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                          : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{option.label}</div>
                      <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{option.detail}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                data-testid="tcf-start-exam"
                onClick={startExam}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                开始完整模考
              </button>
              {practicePool.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">错题重练 · {practicePool.length} 题</div>
                    <div className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                      来自历次模考中答错的题。不计时，选完立即看解析；答对后该题会移出重练列表。
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="tcf-start-practice"
                    onClick={startPractice}
                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    开始重练
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>
              {result && (
                <section
                  data-testid="tcf-result"
                  className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs text-gray-400">答对</div>
                      <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{result.correctCount} / 39</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">估算分数</div>
                      <div className="mt-1 text-2xl font-bold text-indigo-600">{result.scaledScore} / 699</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">估算等级</div>
                      <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{nclcLabel(result.nclc)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">距 NCLC 7</div>
                      <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">
                        {targetGap === 0 ? '已达到' : `还差 ${targetGap} 分`}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-gray-500">
                    训练分数采用 0–699 线性估算，仅用于趋势与目标差距，不代替官方成绩单。
                  </p>
                </section>
              )}

              {(mode === 'running' || mode === 'practice') && (
                <nav
                  data-testid="tcf-question-nav"
                  aria-label="题号导航"
                  className="mt-4 grid grid-cols-8 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]"
                >
                  {questions.map((item, index) => {
                    const answered = answers[item.id] !== undefined
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`跳到第 ${index + 1} 题${answered ? '（已作答）' : '（未作答）'}`}
                        aria-current={currentIndex === index ? 'step' : undefined}
                        className={`h-8 rounded-lg text-xs font-semibold transition ${
                          currentIndex === index ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-900' : ''
                        } ${
                          answered
                            ? mode === 'running'
                              ? 'bg-indigo-600 text-white'
                              : answers[item.id] === item.answer
                              ? 'bg-green-600 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </nav>
              )}

              {mode === 'review' && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    点击题号逐题复盘 · 错 {questions.filter((item) => answers[item.id] !== item.answer).length} 题
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      data-testid="tcf-only-wrong"
                      checked={onlyWrong}
                      onChange={(event) => setOnlyWrong(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    />
                    只看错题
                  </label>
                </div>
              )}

              {mode === 'review' && (
                <div data-testid="tcf-review-grid" className="mt-3 grid grid-cols-8 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
                  {questions.map((item, index) => {
                    const correct = answers[item.id] === item.answer
                    if (onlyWrong && correct) return null
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`复盘第 ${index + 1} 题`}
                        className={`h-9 rounded-lg text-xs font-semibold ${currentIndex === index ? 'ring-2 ring-indigo-500' : ''} ${
                          correct
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              )}

              <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-indigo-600">
                      第 {currentIndex + 1} / {questions.length} 题
                    </div>
                    {mode === 'running' && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        已作答 {answeredCount} / {questions.length}
                      </div>
                    )}
                  </div>
                  <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <QuestionContent
                  question={question}
                  skill={skill}
                  mode={mode === 'practice' ? (answers[question.id] === undefined ? 'running' : 'review') : mode}
                  selected={answers[question.id]}
                  order={choiceOrder[question.id] ?? defaultChoiceOrder}
                  played={Boolean(played[question.id])}
                  replayable={mode === 'practice'}
                  onPlay={playAudio}
                  onSelect={selectChoice}
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((old) => Math.max(0, old - 1))}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                    >
                      ← 上一题
                    </button>
                    <button
                      type="button"
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => setCurrentIndex((old) => Math.min(questions.length - 1, old + 1))}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                    >
                      下一题 →
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    第 {currentIndex + 1} / {questions.length} 题
                  </div>
                </div>
              </section>
            </>
          )}

          {message && (
            <div className="mt-5 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{message}</div>
          )}
        </div>
      </div>
    </Layout>
  )
}
