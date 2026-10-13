import type { RealReadingMeta, RealReadingPassage, RealReadingScoreResult } from '@/resources/realReadingLoader'
import { getRealReadingPassage, listRealReadingForLevel, scoreRealReadingPassage } from '@/resources/realReadingLoader'
import { trackAnalyticsEvent } from '@/utils/analytics'
import { useEffect, useMemo, useState } from 'react'
import IconBook from '~icons/tabler/book'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconRefresh from '~icons/tabler/refresh'

const STORAGE_PREFIX = 'qwerty-real-reading-best:'

function readBestScore(id: string): number | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'number') return parsed
      if (parsed && typeof parsed.score === 'number') return parsed.score
    } catch {
      const num = Number(raw)
      return Number.isNaN(num) ? null : num
    }
  } catch {
    return null
  }
  return null
}

function writeBestScore(id: string, score: number): void {
  try {
    const prev = readBestScore(id) ?? -1
    if (score >= prev) {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify({ score, timestamp: Date.now() }))
    }
  } catch {
    // Ignore localStorage unavailable or quota errors
  }
}

/** Deterministic pseudo-random choice shuffle so correct answer is not always in the same slot. */
function deterministicShuffle<T>(arr: T[], seedStr: string): T[] {
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1)
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

function RealReadingCard({
  meta,
  isOpen,
  onToggle,
  bestScore,
  onScoreUpdated,
}: {
  meta: RealReadingMeta
  isOpen: boolean
  onToggle: () => void
  bestScore: number | null
  onScoreUpdated: (id: string, score: number) => void
}) {
  const [passage, setPassage] = useState<RealReadingPassage | null>(null)
  const [loading, setLoading] = useState(false)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [scoreResult, setScoreResult] = useState<RealReadingScoreResult | null>(null)

  useEffect(() => {
    if (isOpen && !passage && !loading) {
      let active = true
      setLoading(true)
      void getRealReadingPassage(meta.id).then((p) => {
        if (active) {
          setPassage(p)
          setLoading(false)
        }
      })
      return () => {
        active = false
      }
    }
  }, [isOpen, passage, loading, meta.id])

  const displayChoices = useMemo(() => {
    if (!passage) return []
    return passage.questions.map((q, qIdx) => {
      const choices = [q[1], q[2], q[3]]
      return deterministicShuffle(choices, `${passage.id}-${qIdx}`)
    })
  }, [passage])

  const allAnswered = passage && userAnswers.length === passage.questions.length && userAnswers.every(Boolean)
  const isCompleted = typeof bestScore === 'number' && bestScore >= 1

  const handleSelect = (qIdx: number, choice: string) => {
    if (scoreResult) return
    setUserAnswers((prev) => {
      const next = [...prev]
      next[qIdx] = choice
      return next
    })
  }

  const handleSubmit = async () => {
    if (!passage || !allAnswered) return
    const res = await scoreRealReadingPassage(passage.id, userAnswers)
    if (res) {
      setScoreResult(res)
      writeBestScore(passage.id, res.score)
      onScoreUpdated(passage.id, res.score)
    }
  }

  const handleRetry = () => {
    setUserAnswers([])
    setScoreResult(null)
  }

  const siteNameZh = meta.site === 'wikipedia' ? '维基百科' : 'Vikidia'

  return (
    <div
      data-testid={`real-reading-item-${meta.id}`}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/[0.05] transition-shadow dark:bg-white/[0.04] dark:ring-white/[0.06]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
            }`}
          >
            {isCompleted ? <IconCheck className="h-3.5 w-3.5" data-testid="real-reading-check-icon" /> : '•'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{meta.title}</h3>
              <span className="shrink-0 rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                {siteNameZh}
              </span>
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{meta.words} 词</span>
              {isCompleted && (
                <span data-testid="real-reading-check" className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              )}
            </div>
            {meta.justificationFr && (
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{meta.justificationFr}</p>
            )}
          </div>
        </div>
        <IconChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 dark:border-white/5">
          {loading && (
            <div className="py-6 text-center text-sm text-gray-500">正在加载文章内容...</div>
          )}

          {passage && (
            <div className="space-y-6">
              {/* Passage text */}
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-white/[0.04] dark:text-gray-200">
                {passage.text.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {passage.questions.map((q, qIdx) => (
                  <fieldset key={qIdx} role="group" className="space-y-2">
                    <legend className="flex w-full items-center justify-between text-sm font-medium text-gray-900 dark:text-white">
                      <span>
                        {qIdx + 1}. {q[0]}
                      </span>
                      {scoreResult && (
                        <span
                          data-testid={`real-reading-q-${qIdx}-${scoreResult.perQuestion[qIdx] ? 'correct' : 'incorrect'}`}
                          className={`ml-2 text-xs font-semibold ${
                            scoreResult.perQuestion[qIdx]
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {scoreResult.perQuestion[qIdx] ? '✓ 正确' : '✗ 错误'}
                        </span>
                      )}
                    </legend>
                    <div className="grid grid-cols-1 gap-2">
                      {displayChoices[qIdx]?.map((choice) => {
                        const selected = userAnswers[qIdx] === choice
                        let style =
                          'bg-white ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:bg-white/[0.08]'
                        if (scoreResult) {
                          if (choice === q[1]) {
                            style =
                              'bg-emerald-50 ring-1 ring-emerald-400 dark:bg-emerald-900/30 dark:ring-emerald-700 font-medium'
                          } else if (selected) {
                            style =
                              'bg-rose-50 ring-1 ring-rose-400 dark:bg-rose-900/30 dark:ring-rose-700'
                          }
                        } else if (selected) {
                          style =
                            'bg-indigo-50 ring-1 ring-indigo-300 dark:bg-indigo-900/20 dark:ring-indigo-700'
                        }
                        return (
                          <button
                            key={choice}
                            type="button"
                            disabled={Boolean(scoreResult)}
                            aria-pressed={selected}
                            onClick={() => handleSelect(qIdx, choice)}
                            className={`rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${style}`}
                          >
                            {choice}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {/* Actions & Score */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!scoreResult ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="ui-btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    提交答案
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      data-testid="real-reading-score"
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      得分：{scoreResult.correctCount} / {scoreResult.totalQuestions} (
                      {Math.round(scoreResult.score * 100)}%)
                    </div>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="ui-btn-secondary flex items-center gap-1 text-xs"
                    >
                      <IconRefresh className="h-3.5 w-3.5" /> 重做
                    </button>
                  </div>
                )}
              </div>

              {/* Attribution Line */}
              <div
                data-testid="real-reading-attribution"
                className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-400"
              >
                <p className="leading-relaxed">
                  Source : «{' '}
                  <a
                    href={passage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {passage.title}
                  </a>{' '}
                  »,{' '}
                  <a
                    href={passage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {passage.site === 'wikipedia' ? 'Wikipédia' : 'Vikidia'}
                  </a>{' '}
                  (
                  <a
                    href={passage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {passage.url}
                  </a>
                  ), auteurs :{' '}
                  <a
                    href={passage.historyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {passage.historyUrl}
                  </a>
                  , licence{' '}
                  <a
                    href={passage.licenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="real-reading-licence-link"
                    className="font-medium text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {passage.licenceName}
                  </a>{' '}
                  (
                  <a
                    href={passage.licenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {passage.licenceUrl}
                  </a>
                  ). Texte reproduit sans modification. Questions © Qwerty Français, diffusées sous la même licence.
                </p>
                <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                  原文未作修改 · CC 授权共享 · 练习记录仅保存在本地
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RealReadingSection({ level }: { level: number }) {
  const [passages, setPassages] = useState<RealReadingMeta[]>([])
  const [openPassageId, setOpenPassageId] = useState<string | null>(null)
  const [bestScores, setBestScores] = useState<Record<string, number>>({})

  useEffect(() => {
    let active = true
    void listRealReadingForLevel(level).then((list) => {
      if (!active) return
      setPassages(list)
      const scores: Record<string, number> = {}
      for (const p of list) {
        const s = readBestScore(p.id)
        if (s !== null) scores[p.id] = s
      }
      setBestScores(scores)
    })
    return () => {
      active = false
    }
  }, [level])

  const handleScoreUpdated = (id: string, score: number) => {
    setBestScores((prev) => ({
      ...prev,
      [id]: Math.max(prev[id] ?? -1, score),
    }))
  }

  // Only render section on levels that have passages
  if (passages.length === 0) return null

  const completedCount = passages.filter((p) => (bestScores[p.id] ?? 0) >= 1).length

  return (
    <section data-testid="level-real-reading" className="mt-8 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
            <IconBook className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">真实阅读</h2>
          <span className="ml-2 text-sm font-normal text-gray-500">
            {completedCount} / {passages.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          来自 Vikidia / 维基百科的原文片段，不计入等级达标
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {passages.map((meta) => (
          <RealReadingCard
            key={meta.id}
            meta={meta}
            isOpen={openPassageId === meta.id}
            onToggle={() => {
              const willOpen = openPassageId !== meta.id
              if (willOpen) {
                trackAnalyticsEvent('real_reading_open')
              }
              setOpenPassageId(willOpen ? meta.id : null)
            }}
            bestScore={bestScores[meta.id] ?? null}
            onScoreUpdated={handleScoreUpdated}
          />
        ))}
      </div>
    </section>
  )
}
