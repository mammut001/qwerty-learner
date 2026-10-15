import type { TapWord } from './words'

export type RoundAnswer = { word: string; correct: boolean }

type SessionSummaryProps = {
  words: TapWord[]
  answers: RoundAnswer[]
  hasNextChapter: boolean
  onRetryWrong: () => void
  onRestart: () => void
  onNextChapter: () => void
  onOpenPicker: () => void
}

export default function SessionSummary({
  words,
  answers,
  hasNextChapter,
  onRetryWrong,
  onRestart,
  onNextChapter,
  onOpenPicker,
}: SessionSummaryProps) {
  const total = answers.length
  const correct = answers.filter((answer) => answer.correct).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrongNames = Array.from(new Set(answers.filter((answer) => !answer.correct).map((answer) => answer.word)))
  const wrongWords = wrongNames
    .map((name) => words.find((word) => word.name === name))
    .filter((word): word is TapWord => word !== undefined)

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">本轮完成</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="题数" value={String(total)} />
        <Stat label="答对" value={String(correct)} />
        <Stat label="正确率" value={`${accuracy}%`} />
      </div>

      {wrongWords.length > 0 ? (
        <div className="mt-5 text-left">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">需要再练的词</h3>
          <ul className="mt-2 divide-y divide-gray-100 rounded-2xl border border-gray-100 dark:divide-white/10 dark:border-white/10">
            {wrongWords.map((word) => (
              <li key={word.name} className="flex flex-wrap items-baseline justify-between gap-x-3 px-4 py-2.5">
                <span className="break-all font-medium text-gray-900 dark:text-white">{word.name}</span>
                <span className="break-words text-sm text-gray-500 dark:text-gray-400">{word.meaning || '（暂无释义）'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-emerald-700 dark:text-emerald-300">这一轮全部答对了。</p>
      )}

      <div className="mt-6 grid gap-3">
        {wrongWords.length > 0 && (
          <button type="button" onClick={onRetryWrong} className="ui-btn-primary h-14 w-full text-lg">
            再练错的（{wrongWords.length}）
          </button>
        )}
        {hasNextChapter && (
          <button type="button" onClick={onNextChapter} className="ui-btn-primary h-14 w-full text-lg">
            下一章
          </button>
        )}
        <button type="button" onClick={onRestart} className="ui-btn-secondary h-12 w-full">
          重新练本章
        </button>
        <button
          type="button"
          onClick={onOpenPicker}
          className="h-12 w-full text-sm text-gray-500 underline-offset-4 hover:underline dark:text-gray-400"
        >
          换词库或章节
        </button>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-white/[0.04]">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
