import type { TapWord } from './words'
import usePronunciationSound from '@/hooks/usePronunciation'
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react'
import IconVolume from '~icons/tabler/volume'

const SWIPE_DISTANCE = 80

type FlashcardsProps = {
  word: TapWord
  /** Called once per card. durationMs runs from when the card appeared to the answer. */
  onAnswer: (correct: boolean, durationMs: number) => void
}

/** One card: flip by tapping, answer with the buttons, or swipe left (不会) and right (会了). Mounted per card. */
export default function Flashcards({ word, onAnswer }: FlashcardsProps) {
  const { play } = usePronunciationSound(word.name)
  const shownAt = useRef(Date.now())
  const answered = useRef(false)
  const drag = useRef<{ pointerId: number; startX: number } | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [dragX, setDragX] = useState(0)

  useEffect(() => {
    play()
    // Autoplay once when the card appears; the play button replays it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const answer = (correct: boolean) => {
    if (answered.current) return
    answered.current = true
    onAnswer(correct, Date.now() - shownAt.current)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (answered.current) return
    drag.current = { pointerId: event.pointerId, startX: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    setDragX(event.clientX - current.startX)
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    drag.current = null
    setDragX(0)
    const distance = event.clientX - current.startX
    if (cancelled) return
    if (distance >= SWIPE_DISTANCE) answer(true)
    else if (distance <= -SWIPE_DISTANCE) answer(false)
    else if (Math.abs(distance) < 8) setFlipped((value) => !value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setFlipped((value) => !value)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      answer(true)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      answer(false)
    }
  }

  const swiping = dragX !== 0
  const tint =
    dragX > 0
      ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
      : dragX < 0
      ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/40'
      : 'border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => play()}
          aria-label="播放发音"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 active:scale-95 dark:bg-indigo-950/50 dark:text-indigo-300"
        >
          <IconVolume className="h-6 w-6" />
        </button>
      </div>

      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? '翻回法语面' : '翻到中文面'}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => endDrag(event, false)}
          onPointerCancel={(event) => endDrag(event, true)}
          onKeyDown={onKeyDown}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)`,
            transition: swiping ? 'none' : 'transform 200ms ease',
          }}
          className={`flex min-h-[15rem] w-full touch-pan-y select-none flex-col items-center justify-center rounded-3xl border p-6 text-center shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${tint}`}
        >
          {flipped ? (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400">{word.name}</div>
              <div className="mt-3 break-words text-2xl font-semibold leading-snug text-gray-900 dark:text-white">
                {word.meaning || '（暂无释义）'}
              </div>
              {word.notation && <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{word.notation}</div>}
            </>
          ) : (
            <>
              <div className="break-all text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">{word.name}</div>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">点卡片看中文</div>
            </>
          )}
        </div>
        {dragX > 30 && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
            会了
          </div>
        )}
        {dragX < -30 && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-lg bg-rose-500 px-3 py-1 text-sm font-semibold text-white">
            不会
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          className="h-16 rounded-2xl bg-rose-500 text-lg font-semibold text-white shadow-sm active:translate-y-px active:bg-rose-600"
        >
          不会
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className="h-16 rounded-2xl bg-emerald-600 text-lg font-semibold text-white shadow-sm active:translate-y-px active:bg-emerald-700"
        >
          会了
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">左滑为不会，右滑为会了</p>
    </div>
  )
}
