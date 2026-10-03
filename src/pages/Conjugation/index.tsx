import Header from '@/components/Header'
import Layout from '@/components/Layout'
import {
  conjugationTenseLabels,
  defaultConjugationVerb,
  frenchVerbs,
  type ConjugationRow,
  type ConjugationTense,
  type FrenchVerbConjugation,
} from '@/resources/conjugation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconBook from '~icons/tabler/book'
import IconRefresh from '~icons/tabler/refresh'

type PracticeScope = 'current' | 'mixed'
type PracticeResult = 'correct' | 'wrong' | null
type TenseStat = { correct: number; total: number }
type ConjugationStats = Record<string, Partial<Record<ConjugationTense, TenseStat>>>

type PracticeQuestion = {
  tense: ConjugationTense
  subject: string
  answers: string[]
  displayAnswer: string
}

const STATS_KEY = 'qwerty-fr-conjugation-stats-v1'
const tenses: ConjugationTense[] = ['present', 'passeCompose', 'imparfait']
const accentChars = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'ô', 'ö', 'î', 'ï', 'ç', 'œ', 'æ']

const normalizeAnswer = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')

const loadStats = (): ConjugationStats => {
  try {
    const value = window.localStorage.getItem(STATS_KEY)
    return value ? (JSON.parse(value) as ConjugationStats) : {}
  } catch {
    return {}
  }
}

const getStat = (stats: ConjugationStats, verb: string, tense: ConjugationTense): TenseStat =>
  stats[verb]?.[tense] ?? { correct: 0, total: 0 }

const getAccuracy = (stat: TenseStat) => (stat.total === 0 ? null : Math.round((stat.correct / stat.total) * 100))

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

const buildQuestion = (verb: FrenchVerbConjugation, selectedTense: ConjugationTense, scope: PracticeScope): PracticeQuestion => {
  const tense = scope === 'mixed' ? pick(tenses) : selectedTense
  const row = pick(verb.tenses[tense]) as ConjugationRow

  if (row.subject === 'il / elle / on') {
    const subject = pick(['il', 'elle', 'on'])
    const answers = row.answers.filter((answer) => answer.startsWith(`${subject} `))
    return {
      tense,
      subject,
      answers,
      displayAnswer: answers.join(' / '),
    }
  }

  if (row.subject === 'ils / elles') {
    const subject = pick(['ils', 'elles'])
    const answers = row.answers.filter((answer) => answer.startsWith(`${subject} `))
    return {
      tense,
      subject,
      answers,
      displayAnswer: answers.join(' / '),
    }
  }

  return {
    tense,
    subject: row.subject,
    answers: row.answers,
    displayAnswer: row.answers.join(' / '),
  }
}

export default function ConjugationPage() {
  const [searchParams] = useSearchParams()
  const requestedVerb = searchParams.get('verb')
  const requestedTense = searchParams.get('tense')
  const requestedMode = searchParams.get('mode')
  const requestedScope = searchParams.get('scope')
  const initialVerb = frenchVerbs.find((verb) => verb.infinitive === requestedVerb) ?? defaultConjugationVerb
  const initialTense: ConjugationTense =
    requestedTense && tenses.includes(requestedTense as ConjugationTense)
      ? (requestedTense as ConjugationTense)
      : 'passeCompose'
  const initialMode: 'study' | 'practice' = requestedMode === 'practice' ? 'practice' : 'study'
  const initialScope: PracticeScope = requestedScope === 'mixed' ? 'mixed' : 'current'

  const [query, setQuery] = useState('')
  const [selectedVerb, setSelectedVerb] = useState<FrenchVerbConjugation>(initialVerb)
  const [selectedTense, setSelectedTense] = useState<ConjugationTense>(initialTense)
  const [mode, setMode] = useState<'study' | 'practice'>(initialMode)
  const [practiceScope, setPracticeScope] = useState<PracticeScope>(initialScope)
  const [question, setQuestion] = useState<PracticeQuestion>(() => buildQuestion(initialVerb, initialTense, initialScope))
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<PracticeResult>(null)
  const [stats, setStats] = useState<ConjugationStats>(() => loadStats())
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredVerbs = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return frenchVerbs
    return frenchVerbs.filter(
      (verb) => verb.infinitive.toLowerCase().includes(needle) || verb.translation.toLowerCase().includes(needle),
    )
  }, [query])

  const currentRows = selectedVerb.tenses[selectedTense]

  const startNextQuestion = useCallback(() => {
    setQuestion(buildQuestion(selectedVerb, selectedTense, practiceScope))
    setAnswer('')
    setResult(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [practiceScope, selectedTense, selectedVerb])

  useEffect(() => {
    if (mode === 'practice') {
      startNextQuestion()
    }
  }, [selectedVerb, selectedTense, practiceScope, mode, startNextQuestion])

  const updateStat = useCallback(
    (tense: ConjugationTense, isCorrect: boolean) => {
      setStats((old) => {
        const current = getStat(old, selectedVerb.infinitive, tense)
        const next: ConjugationStats = {
          ...old,
          [selectedVerb.infinitive]: {
            ...(old[selectedVerb.infinitive] ?? {}),
            [tense]: {
              correct: current.correct + (isCorrect ? 1 : 0),
              total: current.total + 1,
            },
          },
        }
        window.localStorage.setItem(STATS_KEY, JSON.stringify(next))
        return next
      })
    },
    [selectedVerb.infinitive],
  )

  const submitAnswer = useCallback(() => {
    if (result) {
      startNextQuestion()
      return
    }

    const normalized = normalizeAnswer(answer)
    if (!normalized) return

    const isCorrect = question.answers.some((item) => normalizeAnswer(item) === normalized)
    setResult(isCorrect ? 'correct' : 'wrong')
    updateStat(question.tense, isCorrect)
  }, [answer, question.answers, question.tense, result, startNextQuestion, updateStat])

  const insertAccent = useCallback(
    (char: string) => {
      const input = inputRef.current
      if (!input) {
        setAnswer((old) => old + char)
        return
      }
      const start = input.selectionStart ?? answer.length
      const end = input.selectionEnd ?? start
      const next = answer.slice(0, start) + char + answer.slice(end)
      setAnswer(next)
      window.setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + char.length, start + char.length)
      }, 0)
    },
    [answer],
  )

  const renderPasseComposeBreakdown = (display: string) => {
    const firstVariant = display.split(' / ')[0]
    const pieces = firstVariant.split(' ')
    if (pieces.length < 3) return null
    const participle = pieces[pieces.length - 1]
    const auxiliaryPart = pieces.slice(0, -1).join(' ')
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{auxiliaryPart}</span>
        <span className="text-gray-400">+</span>
        <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{participle}</span>
      </div>
    )
  }

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
          to="/grammar-session"
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          30分钟语法
        </NavLink>
        <NavLink
          to="/gallery"
          className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <IconBook />
          词库
        </NavLink>
      </Header>

      <main className="container mx-auto flex min-h-0 flex-1 gap-6 overflow-hidden px-10 pb-6">
        <aside className="my-card flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl bg-white p-4 dark:bg-gray-800">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Conjugaison</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">30 个核心动词</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索 prendre / 拿..."
            className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <div className="customized-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredVerbs.map((verb) => {
              const active = verb.infinitive === selectedVerb.infinitive
              return (
                <button
                  key={verb.infinitive}
                  type="button"
                  onClick={() => setSelectedVerb(verb)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    active
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{verb.infinitive}</div>
                  <div className={`text-xs ${active ? 'text-indigo-100' : 'text-gray-400'}`}>{verb.translation}</div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="customized-scrollbar flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">{selectedVerb.infinitive}</h1>
                <span className="text-gray-500 dark:text-gray-400">{selectedVerb.translation}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  auxiliaire: {selectedVerb.auxiliary}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  participe passé: {selectedVerb.pastParticiple}
                </span>
              </div>
              {selectedVerb.note && <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-gray-400">{selectedVerb.note}</p>}
            </div>

            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setMode('study')}
                className={`rounded-lg px-4 py-2 text-sm ${
                  mode === 'study' ? 'bg-white font-medium text-indigo-600 shadow dark:bg-gray-700' : 'text-gray-500'
                }`}
              >
                查看模式
              </button>
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`rounded-lg px-4 py-2 text-sm ${
                  mode === 'practice' ? 'bg-white font-medium text-indigo-600 shadow dark:bg-gray-700' : 'text-gray-500'
                }`}
              >
                练习模式
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {tenses.map((tense) => {
              const stat = getStat(stats, selectedVerb.infinitive, tense)
              const accuracy = getAccuracy(stat)
              return (
                <button
                  key={tense}
                  type="button"
                  onClick={() => setSelectedTense(tense)}
                  className={`rounded-xl border px-4 py-2 text-left transition ${
                    selectedTense === tense
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-200 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium">{conjugationTenseLabels[tense]}</div>
                  <div className="text-xs opacity-70">{accuracy === null ? '未练习' : `${accuracy}% · ${stat.correct}/${stat.total}`}</div>
                </button>
              )
            })}
          </div>

          {mode === 'study' ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-[180px_1fr] bg-gray-50 px-5 py-3 text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <div>人称</div>
                <div>{conjugationTenseLabels[selectedTense]}</div>
              </div>
              {currentRows.map((row) => (
                <div
                  key={row.subject}
                  className="grid grid-cols-[180px_1fr] border-t border-gray-100 px-5 py-4 dark:border-gray-700"
                >
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{row.subject}</div>
                  <div>
                    <div className="text-lg text-gray-900 dark:text-gray-100">{row.display}</div>
                    {selectedTense === 'passeCompose' && renderPasseComposeBreakdown(row.display)}
                  </div>
                </div>
              ))}
              {selectedTense === 'passeCompose' && (
                <div className="border-t border-gray-100 bg-indigo-50/60 px-5 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-indigo-950/30 dark:text-gray-300">
                  结构重点：<strong>助动词 avoir / être 的 présent + participe passé</strong>。使用 être 时要特别注意过去分词的性数配合。
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-lg bg-gray-100 p-1 text-sm dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() => setPracticeScope('current')}
                    className={`rounded-md px-3 py-1.5 ${
                      practiceScope === 'current' ? 'bg-white text-indigo-600 shadow dark:bg-gray-700' : 'text-gray-500'
                    }`}
                  >
                    只练 {conjugationTenseLabels[selectedTense]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeScope('mixed')}
                    className={`rounded-md px-3 py-1.5 ${
                      practiceScope === 'mixed' ? 'bg-white text-indigo-600 shadow dark:bg-gray-700' : 'text-gray-500'
                    }`}
                  >
                    三时态混合
                  </button>
                </div>
                <button
                  type="button"
                  onClick={startNextQuestion}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600"
                >
                  <IconRefresh />
                  换一题
                </button>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-8 dark:border-indigo-900 dark:bg-indigo-950/20">
                <div className="text-sm text-gray-500 dark:text-gray-400">请写出完整变位</div>
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">{selectedVerb.infinitive}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-indigo-600 shadow-sm dark:bg-gray-800">
                    {conjugationTenseLabels[question.tense]}
                  </span>
                  <span className="text-xl text-gray-600 dark:text-gray-300">· {question.subject}</span>
                </div>

                <form
                  className="mt-6"
                  onSubmit={(event) => {
                    event.preventDefault()
                    submitAnswer()
                  }}
                >
                  <input
                    ref={inputRef}
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    disabled={result !== null}
                    autoFocus
                    placeholder="例如：nous avons pris"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-xl outline-none transition dark:bg-gray-900 dark:text-white ${
                      result === 'correct'
                        ? 'border-green-400'
                        : result === 'wrong'
                          ? 'border-red-400'
                          : 'border-gray-200 focus:border-indigo-400 dark:border-gray-700'
                    }`}
                  />

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {accentChars.map((char) => (
                      <button
                        key={char}
                        type="button"
                        disabled={result !== null}
                        onClick={() => insertAccent(char)}
                        className="min-w-8 rounded-md bg-white px-2 py-1 text-sm text-gray-600 shadow-sm hover:text-indigo-600 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  {result && (
                    <div
                      className={`mt-5 rounded-xl px-4 py-3 text-sm ${
                        result === 'correct'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      }`}
                    >
                      <div className="font-medium">{result === 'correct' ? '✓ 正确' : '✗ 再看一下这个形式'}</div>
                      <div className="mt-1">答案：{question.displayAnswer}</div>
                    </div>
                  )}

                  <button type="submit" className="my-btn-primary mt-5 min-w-32 py-2 text-base">
                    {result ? '下一题（Enter）' : '检查（Enter）'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </Layout>
  )
}
