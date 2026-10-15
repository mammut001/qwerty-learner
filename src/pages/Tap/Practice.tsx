import Flashcards from './Flashcards'
import MultipleChoice from './MultipleChoice'
import SessionSummary, { type RoundAnswer } from './SessionSummary'
import { recordTapAnswer } from './record'
import { type QuizKind, type TapWord, quizEligible } from './words'
import type { Dictionary } from '@/typings'
import { useState } from 'react'

type TapTab = 'flash' | 'quiz'

const KIND_LABEL: Record<QuizKind, string> = {
  fr2zh: '法→中',
  zh2fr: '中→法',
  listen: '听音选词',
}

type Session = { id: number; words: TapWord[]; answers: RoundAnswer[] }

type PracticeProps = {
  dict: Dictionary
  chapter: number
  chapterWords: TapWord[]
  allWords: TapWord[]
  onOpenPicker: () => void
  onChapter: (chapter: number) => void
}

/** The practice view for one chapter. Remounted (by the parent) whenever the dictionary or chapter changes. */
export default function Practice({ dict, chapter, chapterWords, allWords, onOpenPicker, onChapter }: PracticeProps) {
  const [tab, setTab] = useState<TapTab>('flash')
  const [kind, setKind] = useState<QuizKind>('fr2zh')
  const [session, setSession] = useState<Session>(() => ({ id: 0, words: chapterWords, answers: [] }))

  const roundWords = (nextTab: TapTab, nextKind: QuizKind) => (nextTab === 'quiz' ? quizEligible(chapterWords, nextKind) : chapterWords)
  const startRound = (nextTab: TapTab, nextKind: QuizKind) =>
    setSession((previous) => ({ id: previous.id + 1, words: roundWords(nextTab, nextKind), answers: [] }))

  const switchTab = (next: TapTab) => {
    if (next === tab) return
    setTab(next)
    startRound(next, kind)
  }

  const switchKind = (next: QuizKind) => {
    if (next === kind) return
    setKind(next)
    startRound('quiz', next)
  }

  const record = (word: TapWord, correct: boolean, durationMs: number) => {
    recordTapAnswer({ word: word.name, dict: dict.id, chapter, durationMs, correct })
  }

  const advance = (word: TapWord, correct: boolean) => {
    setSession((previous) => ({ ...previous, answers: [...previous.answers, { word: word.name, correct }] }))
  }

  const retryWrong = () =>
    setSession((previous) => {
      const wrong = new Set(previous.answers.filter((answer) => !answer.correct).map((answer) => answer.word))
      return { id: previous.id + 1, words: previous.words.filter((word) => wrong.has(word.name)), answers: [] }
    })

  const { words, answers } = session
  const index = answers.length
  const done = words.length > 0 && index >= words.length
  const current = words[index]
  const correctSoFar = answers.filter((answer) => answer.correct).length
  const hasNextChapter = chapter + 1 < dict.chapterCount

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">{dict.name}</div>
          <div className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">
            第 {chapter + 1} 章<span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">共 {dict.chapterCount} 章</span>
          </div>
        </div>
        <button type="button" onClick={onOpenPicker} className="ui-btn-secondary h-10 shrink-0 px-3 text-sm">
          换词库
        </button>
      </header>

      <div role="tablist" aria-label="练习方式" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-white/5">
        <TabButton active={tab === 'flash'} onClick={() => switchTab('flash')}>
          闪卡
        </TabButton>
        <TabButton active={tab === 'quiz'} onClick={() => switchTab('quiz')}>
          四选一
        </TabButton>
      </div>

      {tab === 'quiz' && (
        <div role="tablist" aria-label="四选一类型" className="mt-3 grid grid-cols-3 gap-2">
          {(Object.keys(KIND_LABEL) as QuizKind[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={kind === item}
              onClick={() => switchKind(item)}
              className={`h-10 rounded-xl border text-sm transition ${
                kind === item
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {KIND_LABEL[item]}
            </button>
          ))}
        </div>
      )}

      {words.length === 0 ? (
        <div
          role="status"
          className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400"
        >
          {tab === 'quiz' && kind !== 'listen' ? '本章的词没有中文释义，无法出这类题。请试试听音选词，或换一章。' : '这一章没有词条。'}
        </div>
      ) : (
        <>
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(Math.min(index, words.length) / words.length) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {done ? `${words.length} 题已完成` : `第 ${index + 1} / ${words.length} 个`} · 答对 {correctSoFar}
            </p>
          </div>

          <div className="mt-5">
            {done ? (
              <SessionSummary
                words={words}
                answers={answers}
                hasNextChapter={hasNextChapter}
                onRetryWrong={retryWrong}
                onRestart={() => startRound(tab, kind)}
                onNextChapter={() => onChapter(chapter + 1)}
                onOpenPicker={onOpenPicker}
              />
            ) : current && tab === 'flash' ? (
              <Flashcards
                key={`${session.id}-${index}`}
                word={current}
                onAnswer={(correct, durationMs) => {
                  record(current, correct, durationMs)
                  advance(current, correct)
                }}
              />
            ) : current ? (
              <MultipleChoice
                key={`${session.id}-${index}`}
                word={current}
                kind={kind}
                chapterWords={chapterWords}
                allWords={allWords}
                isLast={index === words.length - 1}
                onAnswer={(correct, durationMs) => record(current, correct, durationMs)}
                onNext={(correct) => advance(current, correct)}
              />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`h-10 rounded-xl text-sm font-medium transition ${
        active ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-800 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {children}
    </button>
  )
}
