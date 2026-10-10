import type React from 'react'
import LookupText from '@/components/Dictionary/LookupText'
import { safeSpeak } from '@/utils/speechSynthesis'
import type { LessonExample } from '@/resources/tenses/types'
import IconVolume from '~icons/tabler/volume'

export interface ExampleItemProps {
  example: LessonExample
  index?: number
}

export default function ExampleItem({ example }: ExampleItemProps) {
  const { fr, zh, highlight } = example
  const idx = highlight ? fr.indexOf(highlight) : -1

  const before = idx >= 0 ? fr.slice(0, idx) : ''
  const target = idx >= 0 ? highlight : ''
  const after = idx >= 0 ? fr.slice(idx + highlight.length) : ''

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    safeSpeak(fr, { lang: 'fr-CA' })
  }

  return (
    <div className="group rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 transition hover:border-indigo-100 hover:bg-white hover:shadow-xs dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700 dark:hover:bg-gray-800/80">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-relaxed text-gray-900 dark:text-gray-100">
            {idx >= 0 ? (
              <>
                {before ? <LookupText text={before} className="inline" /> : null}
                <span className="mx-0.5 rounded bg-indigo-100/70 px-1 py-0.5 font-semibold text-indigo-700 underline decoration-indigo-400 underline-offset-2 dark:bg-indigo-950/70 dark:text-indigo-300 dark:decoration-indigo-600">
                  <LookupText text={target} className="inline font-semibold" />
                </span>
                {after ? <LookupText text={after} className="inline" /> : null}
              </>
            ) : (
              <LookupText text={fr} className="inline" />
            )}
          </div>
          <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-normal">
            {zh}
          </div>
          {example.noteZh && (
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">
              {example.noteZh}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          title="朗读法语例句 (魁北克/标准发音)"
          aria-label="朗读例句"
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-indigo-300"
        >
          <IconVolume className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
