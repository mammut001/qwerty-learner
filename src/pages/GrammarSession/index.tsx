import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { grammarBatches, passeComposeVsImparfaitScenarios } from '@/resources/grammarSessions'
import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconBook from '~icons/tabler/book'
import IconClock from '~icons/tabler/clock'
import IconRefresh from '~icons/tabler/refresh'

type Choice = 'A' | 'B'
type SessionStatus = 'intro' | 'running' | 'finished'

const SESSION_SECONDS = 30 * 60
const HISTORY_KEY = 'qwerty-fr-grammar-session-history-v1'

const outputPrompts = [
  {
    zh: '我正在看电视的时候，我朋友给我打电话了。',
    hint: 'regarder la télé / appeler',
  },
  {
    zh: '以前我每天坐公交，但是昨天我走路去了公司。',
    hint: 'avant / prendre le bus / hier / aller au travail à pied',
  },
  {
    zh: '当我走进厨房的时候，我妈妈正在准备晚饭。',
    hint: 'entrer dans la cuisine / préparer le dîner',
  },
]

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export default function GrammarSessionPage() {
  const [status, setStatus] = useState<SessionStatus>('intro')
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Choice>>({})
  const [reasons, setReasons] = useState<Record<number, string>>({})
  const [submittedBatches, setSubmittedBatches] = useState<Record<number, boolean>>({})
  const [outputAnswers, setOutputAnswers] = useState<string[]>(['', '', ''])
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    if (status !== 'running' || secondsLeft <= 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft((old) => Math.max(0, old - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft, status])

  const batch = grammarBatches[currentBatch]
  const batchQuestions = useMemo(
    () => passeComposeVsImparfaitScenarios.filter((question) => batch.questionIds.includes(question.id)),
    [batch.questionIds],
  )

  const batchSubmitted = Boolean(submittedBatches[currentBatch])

  const canSubmitBatch = batchQuestions.every((question) => {
    return Boolean(answers[question.id]) && (reasons[question.id]?.trim().length ?? 0) >= 2
  })

  const score = useMemo(
    () =>
      passeComposeVsImparfaitScenarios.reduce(
        (total, question) => total + (answers[question.id] === question.correct ? 1 : 0),
        0,
      ),
    [answers],
  )

  const startSession = () => {
    setStatus('running')
    setSecondsLeft(SESSION_SECONDS)
    setCurrentBatch(0)
    setAnswers({})
    setReasons({})
    setSubmittedBatches({})
    setOutputAnswers(['', '', ''])
    setStartedAt(Date.now())
  }

  const submitBatch = () => {
    if (!canSubmitBatch) return
    setSubmittedBatches((old) => ({ ...old, [currentBatch]: true }))
  }

  const nextBatch = () => {
    if (currentBatch < grammarBatches.length - 1) {
      setCurrentBatch((old) => old + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const finishSession = () => {
    const finishedAt = Date.now()
    const elapsedSeconds = startedAt ? Math.round((finishedAt - startedAt) / 1000) : SESSION_SECONDS - secondsLeft
    const record = {
      topic: 'passé composé vs imparfait',
      score,
      total: passeComposeVsImparfaitScenarios.length,
      elapsedSeconds,
      finishedAt,
      reasons,
      outputAnswers,
    }

    try {
      const old = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]') as unknown[]
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...old].slice(0, 20)))
    } catch {
      // localStorage unavailable: session can still finish normally
    }

    setStatus('finished')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allOutputsFilled = outputAnswers.every((answer) => answer.trim().length >= 3)

  if (status === 'intro') {
    return (
      <Layout>
        <Header>
          <NavLink
            to="/"
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <IconArrowLeft />
            返回练习
          </NavLink>
          <NavLink
            to="/conjugation"
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            动词变位
          </NavLink>
        </Header>

        <main className="container mx-auto flex flex-1 items-center justify-center px-10 pb-10">
          <section className="my-card w-full max-w-3xl rounded-3xl bg-white p-10 dark:bg-gray-800">
            <div className="flex items-center gap-3 text-indigo-500">
              <IconClock className="text-3xl" />
              <span className="text-sm font-medium">30 分钟 · 过去时态恢复</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-gray-900 dark:text-white">Passé composé vs imparfait</h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              这不是刷分模式。每一道题都要先选答案，再用中文或法语写一句“为什么”。提交之后才会看到标准解释。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/40">
                <div className="text-sm text-indigo-500">第 1 组</div>
                <div className="mt-1 font-medium text-gray-800 dark:text-gray-100">4 题 · 背景 vs 事件</div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/40">
                <div className="text-sm text-indigo-500">第 2 组</div>
                <div className="mt-1 font-medium text-gray-800 dark:text-gray-100">4 题 · 时间词与习惯</div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/40">
                <div className="text-sm text-indigo-500">第 3 组</div>
                <div className="mt-1 font-medium text-gray-800 dark:text-gray-100">2 题 + 3 句输出</div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              核心提醒：不要先找“时间词公式”。先问自己：
              <strong>这是在描述当时的背景/习惯，还是在讲发生并完成了什么？</strong>
            </div>

            <button type="button" onClick={startSession} className="my-btn-primary mt-8 px-8 py-3 text-base">
              开始 30 分钟
            </button>
          </section>
        </main>
      </Layout>
    )
  }

  if (status === 'finished') {
    return (
      <Layout>
        <Header>
          <NavLink
            to="/"
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <IconArrowLeft />
            返回练习
          </NavLink>
        </Header>

        <main className="container mx-auto flex flex-1 items-center justify-center px-10 pb-10">
          <section className="my-card w-full max-w-3xl rounded-3xl bg-white p-10 dark:bg-gray-800">
            <div className="text-sm font-medium text-indigo-500">本次 30 分钟训练完成</div>
            <h1 className="mt-3 text-4xl font-semibold text-gray-900 dark:text-white">
              {score} / {passeComposeVsImparfaitScenarios.length}
            </h1>
            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-300">
              分数只是参考。更重要的是你每一题都先写了“为什么”，然后才对照解释。这个过程比单纯把 A/B 选对更接近真正掌握。
            </p>

            <div className="mt-7 rounded-2xl bg-indigo-50 p-6 dark:bg-indigo-950/30">
              <div className="font-semibold text-gray-900 dark:text-white">把规则压成一句</div>
              <p className="mt-2 text-lg leading-8 text-gray-700 dark:text-gray-200">
                <strong>imparfait</strong> = 当时是什么样 / 正在干什么 / 以前经常干什么；
                <strong> passé composé</strong> = 发生了什么 / 完成了什么。
              </p>
            </div>

            <div className="mt-7">
              <h2 className="font-semibold text-gray-900 dark:text-white">你最后写的 3 句</h2>
              <div className="mt-3 space-y-3">
                {outputAnswers.map((answer, index) => (
                  <div key={outputPrompts[index].zh} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                    <div className="text-sm text-gray-500">{outputPrompts[index].zh}</div>
                    <div className="mt-1 text-gray-900 dark:text-gray-100">{answer}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button type="button" onClick={startSession} className="my-btn-primary flex gap-2 px-6 py-2 text-base">
                <IconRefresh />
                再练一轮
              </button>
              <NavLink
                to="/conjugation"
                className="rounded-lg border border-gray-200 px-5 py-2 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
              >
                去练动词变位
              </NavLink>
            </div>
          </section>
        </main>
      </Layout>
    )
  }

  const isLastBatch = currentBatch === grammarBatches.length - 1

  return (
    <Layout>
      <Header>
        <NavLink
          to="/"
          className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <IconArrowLeft />
          退出
        </NavLink>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1 font-mono text-sm ${
            secondsLeft === 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30'
          }`}
        >
          <IconClock />
          {formatTime(secondsLeft)}
        </div>
      </Header>

      <main className="container mx-auto w-full max-w-5xl flex-1 px-10 pb-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="text-sm font-medium text-indigo-500">
              Passé composé vs imparfait · 第 {currentBatch + 1} / {grammarBatches.length} 组
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{batch.title}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">先选，再解释为什么。提交本组之后才看答案。</p>
          </div>
          <div className="flex gap-2">
            {grammarBatches.map((item, index) => (
              <div
                key={item.title}
                className={`h-2 w-16 rounded-full ${
                  index < currentBatch || submittedBatches[index]
                    ? 'bg-green-400'
                    : index === currentBatch
                      ? 'bg-indigo-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {secondsLeft === 0 && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">
            30 分钟到了。你可以继续把当前组做完；这里不强制中断训练。
          </div>
        )}

        <div className="space-y-6">
          {batchQuestions.map((question) => {
            const selected = answers[question.id]
            const isCorrect = selected === question.correct

            return (
              <section key={question.id} className="my-card rounded-2xl bg-white p-6 dark:bg-gray-800">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-950">
                    {question.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-medium leading-8 text-gray-900 dark:text-white">{question.prompt}</div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {question.options.map((option) => {
                        const chosen = selected === option.label
                        const showCorrect = batchSubmitted && option.label === question.correct
                        const showWrong = batchSubmitted && chosen && option.label !== question.correct

                        return (
                          <button
                            key={option.label}
                            type="button"
                            disabled={batchSubmitted}
                            onClick={() => setAnswers((old) => ({ ...old, [question.id]: option.label }))}
                            className={`rounded-xl border-2 p-4 text-left transition ${
                              showCorrect
                                ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                                : showWrong
                                  ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                                  : chosen
                                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'border-gray-100 hover:border-indigo-200 dark:border-gray-700'
                            }`}
                          >
                            <span className="mr-2 font-semibold">{option.label}.</span>
                            <span className="text-gray-800 dark:text-gray-100">{option.text}</span>
                          </button>
                        )
                      })}
                    </div>

                    <label className="mt-5 block">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">为什么？中文完全可以</span>
                      <textarea
                        value={reasons[question.id] ?? ''}
                        disabled={batchSubmitted}
                        onChange={(event) => setReasons((old) => ({ ...old, [question.id]: event.target.value }))}
                        placeholder="例如：前面是在描述正在进行的背景，后面是突然发生的事件……"
                        rows={2}
                        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </label>

                    {batchSubmitted && (
                      <div
                        className={`mt-5 rounded-xl border p-5 ${
                          isCorrect
                            ? 'border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                            : 'border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {isCorrect ? '✓ 选择正确' : `这题正确答案是 ${question.correct}`}
                        </div>
                        <p className="mt-2 leading-7 text-gray-700 dark:text-gray-200">{question.explanation}</p>
                        <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
                          {question.translation}
                        </div>
                        {question.signal && (
                          <div className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-300">线索：{question.signal}</div>
                        )}
                        {question.vocabulary && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {question.vocabulary.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-300"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 border-t border-black/5 pt-3 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                          你写的理由：{reasons[question.id]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {!batchSubmitted ? (
          <div className="mt-7 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {!canSubmitBatch ? '每题都要选择答案，并写一句理由后才能提交。' : '这一组可以提交了。'}
            </p>
            <button
              type="button"
              disabled={!canSubmitBatch}
              onClick={submitBatch}
              className="my-btn-primary px-7 py-2 text-base disabled:cursor-not-allowed disabled:opacity-40"
            >
              提交本组并看解释
            </button>
          </div>
        ) : !isLastBatch ? (
          <div className="mt-7 flex justify-end">
            <button type="button" onClick={nextBatch} className="my-btn-primary px-7 py-2 text-base">
              继续下一组
            </button>
          </div>
        ) : (
          <section className="my-card mt-8 rounded-2xl bg-white p-7 dark:bg-gray-800">
            <div className="text-sm font-medium text-indigo-500">最后一步 · 不再做选择题</div>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">自己造 3 个句子</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              这里不自动判分。目标是把刚才的判断真正变成输出。
            </p>

            <div className="mt-6 space-y-5">
              {outputPrompts.map((prompt, index) => (
                <label key={prompt.zh} className="block">
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {index + 1}. {prompt.zh}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">提示：{prompt.hint}</div>
                  <textarea
                    rows={2}
                    value={outputAnswers[index]}
                    onChange={(event) =>
                      setOutputAnswers((old) => old.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                    }
                    placeholder="自己写完整法语句子"
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between">
              <div className="text-sm text-gray-500">选择题当前：{score} / 10。不要为了这个数字重做答案。</div>
              <button
                type="button"
                disabled={!allOutputsFilled}
                onClick={finishSession}
                className="my-btn-primary px-7 py-2 text-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                完成本次训练
              </button>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}
