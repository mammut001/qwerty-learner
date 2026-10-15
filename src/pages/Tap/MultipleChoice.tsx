import { type QuizKind, type TapWord, buildQuestion } from './words'
import usePronunciationSound from '@/hooks/usePronunciation'
import { useEffect, useRef, useState } from 'react'
import IconVolume from '~icons/tabler/volume'

type MultipleChoiceProps = {
  word: TapWord
  kind: QuizKind
  chapterWords: TapWord[]
  allWords: TapWord[]
  /** Called when the learner picks an option. durationMs runs from when the question appeared. */
  onAnswer: (correct: boolean, durationMs: number) => void
  /** Called when the learner moves on from the feedback. */
  onNext: (correct: boolean) => void
  isLast: boolean
}

const KIND_PROMPT: Record<QuizKind, string> = {
  fr2zh: '选出这个法语词的中文意思',
  zh2fr: '选出这个意思对应的法语词',
  listen: '听发音，选出你听到的词',
}

/** One four-option question. Mounted per question, so the options are built once and the state resets with it. */
export default function MultipleChoice({ word, kind, chapterWords, allWords, onAnswer, onNext, isLast }: MultipleChoiceProps) {
  const [question] = useState(() => buildQuestion(word, kind, chapterWords, allWords))
  const { play } = usePronunciationSound(word.name)
  const shownAt = useRef(Date.now())
  const [picked, setPicked] = useState<string | null>(null)
  const revealed = picked !== null
  const correct = picked !== null && picked === question.answer

  useEffect(() => {
    // Listening and French-to-Chinese questions play the word when they appear; 中→法 plays it on reveal.
    if (kind !== 'zh2fr') play()
    // Autoplay once per question; the speaker button replays it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (option: string) => {
    if (revealed) return
    setPicked(option)
    onAnswer(option === question.answer, Date.now() - shownAt.current)
    if (kind === 'zh2fr') play()
  }

  const optionClass = (option: string) => {
    const base =
      'min-h-14 w-full break-words rounded-2xl border px-4 py-3 text-left text-lg leading-snug transition active:scale-[0.99] disabled:cursor-default'
    if (!revealed)
      return `${base} border-gray-200 bg-white text-gray-900 hover:border-indigo-300 dark:border-white/10 dark:bg-gray-800 dark:text-white`
    if (option === question.answer)
      return `${base} border-emerald-500 bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200`
    if (option === picked) return `${base} border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200`
    return `${base} border-gray-200 bg-white text-gray-400 dark:border-white/10 dark:bg-gray-800 dark:text-gray-500`
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">{KIND_PROMPT[kind]}</p>
        {kind === 'fr2zh' && (
          <div className="mt-3 flex items-center gap-3">
            <span className="break-all text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{word.name}</span>
            <button
              type="button"
              onClick={() => play()}
              aria-label="播放发音"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 active:scale-95 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              <IconVolume className="h-5 w-5" />
            </button>
          </div>
        )}
        {kind === 'zh2fr' && (
          <div className="mt-3 break-words text-2xl font-semibold leading-snug text-gray-900 dark:text-white">{word.meaning}</div>
        )}
        {kind === 'listen' && (
          <button
            type="button"
            onClick={() => play()}
            aria-label="播放发音"
            className="mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md active:scale-95"
          >
            <IconVolume className="h-10 w-10" />
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {question.options.map((option) => (
          <button key={option} type="button" disabled={revealed} onClick={() => pick(option)} className={optionClass(option)}>
            {option}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]" role="status">
          <p className={`font-semibold ${correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
            {correct ? '答对了' : '答错了'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <span className="text-gray-500 dark:text-gray-400">正确答案：</span>
            <span className="font-medium">{question.answer}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {word.name}
            {word.meaning ? `  ·  ${word.meaning}` : ''}
          </p>
          <button type="button" onClick={() => onNext(correct)} className="ui-btn-primary h-14 w-full text-lg">
            {isLast ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  )
}
