import { useState } from 'react'
import type React from 'react'
import usePronunciationSound from '@/hooks/usePronunciation'
import type { IntensiveQuestion, IntensiveVocab } from './types'

interface VocabAndQuizProps {
  vocabList: IntensiveVocab[]
  questions?: IntensiveQuestion[]
  onAllQuestionsCorrect?: () => void
  className?: string
}

const VocabItem: React.FC<{ vocab: IntensiveVocab }> = ({ vocab }) => {
  const { play, stop, isPlaying } = usePronunciationSound(vocab.fr)

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation()
    stop()
    play()
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-xs transition hover:border-gray-200 dark:border-gray-700/60 dark:bg-gray-800">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePronounce}
          aria-label={`朗读词汇 ${vocab.fr}`}
          title="点击朗读发音"
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
            isPlaying
              ? 'bg-indigo-600 text-white animate-pulse'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
          }`}
        >
          🔊
        </button>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{vocab.fr}</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{vocab.zh}</span>
    </div>
  )
}

export const VocabAndQuiz: React.FC<VocabAndQuizProps> = ({
  vocabList,
  questions = [],
  onAllQuestionsCorrect,
  className = '',
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  const handleSelectChoice = (questionIdx: number, choiceIdx: number) => {
    const updated = {
      ...selectedAnswers,
      [questionIdx]: choiceIdx,
    }
    setSelectedAnswers(updated)

    // Check if all questions are answered correctly
    if (questions.length > 0) {
      const allCorrect = questions.every((q, idx) => updated[idx] === q.answer)
      if (allCorrect && onAllQuestionsCorrect) {
        onAllQuestionsCorrect()
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 重点词汇 Section */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">重点词汇</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            共 {vocabList.length} 词 · 点击喇叭听原音
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {vocabList.map((vocab, index) => (
            <VocabItem key={index} vocab={vocab} />
          ))}
        </div>
      </section>

      {/* 理解题 Section */}
      {questions.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">语篇理解测验</h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">即时反馈 · 检验听力效果</span>
          </div>

          <div className="space-y-5">
            {questions.map((q, qIndex) => {
              const selected = selectedAnswers[qIndex]
              const hasAnswered = typeof selected === 'number'
              const isCorrect = hasAnswered && selected === q.answer

              return (
                <div
                  key={qIndex}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/60"
                >
                  <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span className="mr-1.5 text-indigo-600 dark:text-indigo-400">
                      Q{qIndex + 1}.
                    </span>
                    {q.q}
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.choices.map((choice, cIndex) => {
                      const isThisSelected = selected === cIndex
                      const isThisCorrectAnswer = cIndex === q.answer

                      let buttonStyle =
                        'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-500'

                      if (hasAnswered) {
                        if (isThisCorrectAnswer) {
                          buttonStyle =
                            'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-400'
                        } else if (isThisSelected && !isCorrect) {
                          buttonStyle =
                            'border-rose-400 bg-rose-50 text-rose-800 line-through dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500'
                        } else {
                          buttonStyle =
                            'border-gray-200 bg-gray-50/50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-500'
                        }
                      }

                      return (
                        <button
                          key={cIndex}
                          type="button"
                          onClick={() => handleSelectChoice(qIndex, cIndex)}
                          className={`flex items-start gap-2 rounded-lg border p-2.5 text-left text-xs transition ${buttonStyle}`}
                        >
                          <span className="mt-0.5 font-mono font-bold">
                            {String.fromCharCode(65 + cIndex)}.
                          </span>
                          <span className="flex-1">{choice}</span>
                          {hasAnswered && isThisCorrectAnswer && <span>✓</span>}
                          {hasAnswered && isThisSelected && !isCorrect && <span>✗</span>}
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback Message */}
                  {hasAnswered && (
                    <div
                      className={`mt-2.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect
                        ? '🎉 回答正确！'
                        : `💡 正确答案是 ${String.fromCharCode(65 + q.answer)}：${q.choices[q.answer]}`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
