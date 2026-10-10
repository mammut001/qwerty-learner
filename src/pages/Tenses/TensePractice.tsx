import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { TenseQuestion } from '@/resources/tenses/types'
import { loadLessonProgress, saveQuestionResult, resetLessonProgress } from './storage'
import IconCheck from '~icons/tabler/check'
import IconX from '~icons/tabler/x'
import IconRefresh from '~icons/tabler/refresh'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconChevronRight from '~icons/tabler/chevron-right'

const ACCENT_CHARS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'ô', 'ö', 'î', 'ï', 'ç', 'œ', 'æ']

const normalizeAnswer = (val: string) =>
  val
    .trim()
    .toLowerCase()
    .replace(/[’ʼʻ]/g, "'")
    .replace(/\s+/g, ' ')

export interface TensePracticeProps {
  lessonId: string
  questions: TenseQuestion[]
}

export default function TensePractice({ lessonId, questions }: TensePracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(() => loadLessonProgress(lessonId))
  const [inputAnswer, setInputAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQ = questions[currentIndex]
  const record = currentQ ? progress.completedQuestions[currentQ.id] : undefined

  // Sync state when moving between questions
  useEffect(() => {
    if (record) {
      setInputAnswer(record.answered)
      setSubmitted(true)
      setCurrentIsCorrect(record.correct)
    } else {
      setInputAnswer('')
      setSubmitted(false)
      setCurrentIsCorrect(false)
    }
  }, [currentIndex, record])

  const handleSelectOption = (opt: string) => {
    if (submitted) return
    const isCorrect = normalizeAnswer(opt) === normalizeAnswer(currentQ.correctAnswer)
    const updated = saveQuestionResult(lessonId, currentQ.id, opt, isCorrect)
    setProgress(updated)
    setInputAnswer(opt)
    setSubmitted(true)
    setCurrentIsCorrect(isCorrect)
  }

  const handleSubmitFill = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (submitted || !inputAnswer.trim()) return

    const normInput = normalizeAnswer(inputAnswer)
    const normCorrect = normalizeAnswer(currentQ.correctAnswer)
    const normAccepted = (currentQ.acceptedAnswers ?? []).map(normalizeAnswer)

    const isCorrect =
      normInput === normCorrect || normAccepted.includes(normInput)

    const updated = saveQuestionResult(lessonId, currentQ.id, inputAnswer.trim(), isCorrect)
    setProgress(updated)
    setSubmitted(true)
    setCurrentIsCorrect(isCorrect)
  }

  const insertAccent = useCallback((char: string) => {
    const input = inputRef.current
    if (!input) {
      setInputAnswer((prev) => prev + char)
      return
    }
    const start = input.selectionStart ?? inputAnswer.length
    const end = input.selectionEnd ?? start
    const next = inputAnswer.slice(0, start) + char + inputAnswer.slice(end)
    setInputAnswer(next)
    window.setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + char.length, start + char.length)
    }, 0)
  }, [inputAnswer])

  const handleReset = () => {
    if (window.confirm('确定要清空本课的练习记录并重新开始吗？')) {
      resetLessonProgress(lessonId)
      setProgress({
        lessonId,
        completedQuestions: {},
        totalAttempts: 0,
        correctCount: 0,
      })
      setInputAnswer('')
      setSubmitted(false)
      setCurrentIsCorrect(false)
      setCurrentIndex(0)
    }
  }

  const answeredCount = Object.keys(progress.completedQuestions).length
  const totalCount = questions.length
  const accuracy =
    answeredCount > 0 ? Math.round((progress.correctCount / answeredCount) * 100) : 0

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6">
      {/* Header & Score Bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 dark:border-gray-700/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            互动课后练习 ({answeredCount}/{totalCount})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            包含单选变位、语境辨析与直接填空，答题进度实时本地保存
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <span>正确率:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{accuracy}%</span>
            <span className="text-gray-400">({progress.correctCount}/{answeredCount})</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            title="清空练习记录"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <IconRefresh className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Selector Dots */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {questions.map((q, idx) => {
          const res = progress.completedQuestions[q.id]
          const isCurrent = idx === currentIndex
          let bgClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          if (res) {
            bgClass = res.correct
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${bgClass} ${
                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Active Question Box */}
      {currentQ && (
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/70 p-5 dark:border-gray-700/60 dark:bg-gray-900/40">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>第 {currentIndex + 1} / {totalCount} 题 ({currentQ.type === 'choice' ? '选择题' : '拼写填空'})</span>
            {submitted && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  currentIsCorrect
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                }`}
              >
                {currentIsCorrect ? (
                  <>
                    <IconCheck className="h-3.5 w-3.5" /> 回答正确
                  </>
                ) : (
                  <>
                    <IconX className="h-3.5 w-3.5" /> 回答错误
                  </>
                )}
              </span>
            )}
          </div>

          <div className="mt-3 text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
            {currentQ.prompt}
          </div>

          {/* Options for Choice */}
          {currentQ.type === 'choice' && currentQ.options && (
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = inputAnswer === opt
                const isOptionCorrect = normalizeAnswer(opt) === normalizeAnswer(currentQ.correctAnswer)

                let optClass = 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500'
                if (submitted) {
                  if (isOptionCorrect) {
                    optClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold'
                  } else if (isSelected && !currentIsCorrect) {
                    optClass = 'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-200 line-through'
                  } else {
                    optClass = 'border-gray-200 bg-white opacity-60 dark:border-gray-700 dark:bg-gray-800'
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition ${optClass}`}
                  >
                    <span>{opt}</span>
                    {submitted && isOptionCorrect && (
                      <IconCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {submitted && isSelected && !currentIsCorrect && (
                      <IconX className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Input for Fill */}
          {currentQ.type === 'fill' && (
            <div className="mt-4">
              <form onSubmit={handleSubmitFill} className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="在此输入动词变位答案..."
                  disabled={submitted}
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                    submitted
                      ? currentIsCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400'
                  }`}
                />
                {!submitted && (
                  <button
                    type="submit"
                    disabled={!inputAnswer.trim()}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    提交
                  </button>
                )}
              </form>

              {/* Accents toolbar */}
              {!submitted && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-gray-400">特殊字符:</span>
                  {ACCENT_CHARS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertAccent(char)}
                      className="rounded bg-gray-200/80 px-2 py-0.5 text-xs font-mono text-gray-800 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback & Explanation */}
          {submitted && (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-2xs dark:bg-gray-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                解析与参考答案
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                标准答案: <span className="font-mono text-indigo-600 dark:text-indigo-400">{currentQ.correctAnswer}</span>
              </div>
              <div className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {currentQ.explanationZh}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-5 flex items-center justify-between border-t border-gray-200/60 pt-4 dark:border-gray-700/60">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <IconChevronLeft className="h-4 w-4" /> 上一题
            </button>
            <button
              type="button"
              disabled={currentIndex === totalCount - 1}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
            >
              下一题 <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
