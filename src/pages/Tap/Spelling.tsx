import { buildTileExercise, isAccentLetter, splitGraphemes } from './tiles'
import type { TapWord } from './words'
import usePronunciationSound from '@/hooks/usePronunciation'
import { useCallback, useEffect, useRef, useState } from 'react'
import IconVolume from '~icons/tabler/volume'

export type SpellKind = 'zh2fr' | 'listen'

type SpellingProps = {
  word: TapWord
  kind: SpellKind
  onAnswer: (correct: boolean, durationMs: number) => void
  onNext: (correct: boolean) => void
  isLast: boolean
}

const KIND_PROMPT: Record<SpellKind, string> = {
  zh2fr: '看中文释义，拼出对应的法语词',
  listen: '听发音，拼出你听到的词',
}

/** Accented letters are wrapped in a colored span for visual feedback. */
function renderHighlightedSpelling(text: string) {
  const graphemes = splitGraphemes(text)
  return graphemes.map((g, idx) => {
    if (isAccentLetter(g)) {
      return (
        <span
          key={idx}
          className="font-bold text-amber-600 underline decoration-amber-500 decoration-2 underline-offset-4 dark:text-amber-400"
        >
          {g}
        </span>
      )
    }
    return <span key={idx}>{g}</span>
  })
}

export default function Spelling({ word, kind, onAnswer, onNext, isLast }: SpellingProps) {
  const [exercise] = useState(() => buildTileExercise(word.name))
  const { play } = usePronunciationSound(word.name)
  const shownAt = useRef(Date.now())
  const mistakeCount = useRef(0)

  // slots stores the poolIndex placed at each answer slot, or null if unfilled
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array.from({ length: exercise.answerTiles.length }, () => null),
  )
  const [revealed, setRevealed] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    if (kind === 'listen') {
      play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allFilled = slots.every((s) => s !== null)

  const placeTile = (poolIndex: number) => {
    if (revealed || slots.includes(poolIndex)) return
    const firstEmpty = slots.findIndex((s) => s === null)
    if (firstEmpty === -1) return
    setSlots((prev) => {
      const next = [...prev]
      next[firstEmpty] = poolIndex
      return next
    })
  }

  const returnSlotToPool = (slotIndex: number) => {
    if (revealed || slots[slotIndex] === null) return
    setSlots((prev) => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
  }

  const clearAll = () => {
    if (revealed) return
    setSlots(Array.from({ length: exercise.answerTiles.length }, () => null))
  }

  const giveHint = () => {
    if (revealed) return
    // Find the first slot that is either empty or holds a wrong tile
    const targetSlotIndex = slots.findIndex(
      (poolIdx, sIdx) => poolIdx === null || exercise.pool[poolIdx] !== exercise.answerTiles[sIdx],
    )
    if (targetSlotIndex === -1) {
      // All slots already match correctly
      return
    }

    const expectedTile = exercise.answerTiles[targetSlotIndex]
    mistakeCount.current += 1

    setSlots((prev) => {
      const next = [...prev]
      // Free current wrong tile in this slot
      next[targetSlotIndex] = null

      // Find an unused matching pool tile first
      let matchingPoolIdx = exercise.pool.findIndex(
        (tile, pIdx) => tile === expectedTile && !next.includes(pIdx),
      )

      // If all matching tiles are placed in other slots, take one from a misplaced slot
      if (matchingPoolIdx === -1) {
        const misplacedSlotIdx = next.findIndex(
          (pIdx, sIdx) => pIdx !== null && exercise.pool[pIdx] === expectedTile && sIdx !== targetSlotIndex,
        )
        if (misplacedSlotIdx !== -1) {
          const found = next[misplacedSlotIdx]
          if (found !== null && found !== undefined) {
            matchingPoolIdx = found
            next[misplacedSlotIdx] = null
          }
        }
      }

      if (matchingPoolIdx !== -1) {
        next[targetSlotIndex] = matchingPoolIdx
      }
      return next
    })
  }

  const submit = useCallback(() => {
    if (revealed || !allFilled) return
    const matchesAll = slots.every(
      (poolIdx, sIdx) => poolIdx !== null && exercise.pool[poolIdx] === exercise.answerTiles[sIdx],
    )

    if (!matchesAll) {
      mistakeCount.current += 1
    }

    const correct = matchesAll && mistakeCount.current === 0
    setIsCorrect(correct)
    setRevealed(true)
    play()
    onAnswer(correct, Date.now() - shownAt.current)
  }, [allFilled, exercise.answerTiles, exercise.pool, onAnswer, play, revealed, slots])

  // Keyboard navigation on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Backspace') {
        if (revealed) return
        e.preventDefault()
        for (let i = slots.length - 1; i >= 0; i--) {
          if (slots[i] !== null) {
            setSlots((prev) => {
              const next = [...prev]
              next[i] = null
              return next
            })
            break
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (revealed) {
          onNext(isCorrect ?? false)
        } else if (allFilled) {
          submit()
        }
      } else if (!revealed && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const char = e.key.toLowerCase()
        const poolIdx = exercise.pool.findIndex(
          (tile, idx) => tile.toLowerCase() === char && !slots.includes(idx),
        )
        if (poolIdx !== -1) {
          const emptySlot = slots.findIndex((s) => s === null)
          if (emptySlot !== -1) {
            e.preventDefault()
            setSlots((prev) => {
              const next = [...prev]
              next[emptySlot] = poolIdx
              return next
            })
          }
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [allFilled, exercise.pool, isCorrect, onNext, revealed, slots, submit])

  return (
    <div className="flex flex-col gap-5">
      {/* Question prompt & header card */}
      <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">{KIND_PROMPT[kind]}</p>

        {kind === 'zh2fr' && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="break-words text-2xl font-semibold leading-snug text-gray-900 dark:text-white">
              {word.meaning || '（暂无中文释义）'}
            </div>
            <button
              type="button"
              onClick={() => play()}
              aria-label="播放发音"
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 active:scale-95 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              <IconVolume className="h-4 w-4" />
            </button>
          </div>
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

      {/* Answer slots row with pre-filled fixed separators */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-800">
        <div className="flex min-h-[52px] flex-wrap items-center justify-center gap-1.5">
          {exercise.segments.map((segment, segIdx) => {
            if (segment.type === 'separator') {
              if (segment.text === ' ') {
                return <span key={segIdx} className="inline-block h-10 w-3 shrink-0 select-none" />
              }
              return (
                <span
                  key={segIdx}
                  className="select-none px-0.5 text-2xl font-bold text-gray-500 dark:text-gray-400"
                >
                  {segment.text}
                </span>
              )
            }

            const slotIdx = segment.slotIndex
            const filledPoolIdx = slots[slotIdx]
            const filledText = filledPoolIdx !== null ? exercise.pool[filledPoolIdx] : null
            const isPositionCorrect = revealed ? filledText === segment.expected : null

            let slotStyle =
              'min-h-[44px] min-w-[38px] px-2.5 py-1 text-lg font-bold rounded-xl border text-center transition active:scale-95'

            if (!revealed) {
              if (filledText !== null) {
                slotStyle +=
                  ' border-indigo-400 bg-indigo-50 text-indigo-900 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200'
              } else {
                slotStyle +=
                  ' border-2 border-dashed border-gray-300 bg-gray-50/50 text-transparent dark:border-white/20 dark:bg-white/5 cursor-default'
              }
            } else {
              if (isPositionCorrect) {
                slotStyle +=
                  ' border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 cursor-default'
              } else {
                slotStyle +=
                  ' border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 cursor-default'
              }
            }

            return (
              <button
                key={segIdx}
                type="button"
                disabled={revealed || filledText === null}
                onClick={() => returnSlotToPool(slotIdx)}
                aria-label={
                  filledText
                    ? `已填 ${filledText}，点击收回`
                    : `未填槽位 ${slotIdx + 1}`
                }
                className={slotStyle}
              >
                {filledText ?? '\u00A0'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Shuffled tile pool (thumb-sized min 44px) */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-1">
        {exercise.pool.map((tileText, poolIdx) => {
          const isUsed = slots.includes(poolIdx)
          return (
            <button
              key={poolIdx}
              type="button"
              disabled={revealed || isUsed}
              onClick={() => placeTile(poolIdx)}
              className={`min-h-[44px] min-w-[44px] rounded-2xl border px-3.5 py-2 text-lg font-semibold transition ${
                isUsed
                  ? 'cursor-default border-dashed border-gray-200 bg-transparent text-transparent opacity-20 dark:border-white/10'
                  : 'border-gray-200 bg-white text-gray-900 shadow-sm hover:border-indigo-300 active:scale-95 dark:border-white/10 dark:bg-gray-800 dark:text-white'
              }`}
            >
              {tileText}
            </button>
          )
        })}
      </div>

      {/* Action buttons before reveal */}
      {!revealed && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={slots.every((s) => s === null)}
            onClick={clearAll}
            className="ui-btn-secondary h-12 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            清空
          </button>
          <button
            type="button"
            onClick={giveHint}
            className="ui-btn-secondary h-12 text-sm"
          >
            提示
          </button>
          <button
            type="button"
            disabled={!allFilled}
            onClick={submit}
            className="ui-btn-primary h-12 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            确认
          </button>
        </div>
      )}

      {/* Revealed feedback card */}
      {revealed && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]" role="status">
          <p
            className={`font-semibold ${
              isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}
          >
            {isCorrect ? '答对了' : '答错了'}
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <span className="text-gray-500 dark:text-gray-400">正确拼写：</span>
            <span className="ml-1 text-base font-semibold tracking-wide">
              {renderHighlightedSpelling(word.name)}
            </span>
          </div>
          {word.meaning && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {word.name} · {word.meaning}
            </p>
          )}
          <button
            type="button"
            onClick={() => onNext(isCorrect ?? false)}
            className="ui-btn-primary h-14 w-full text-lg"
          >
            {isLast ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  )
}
