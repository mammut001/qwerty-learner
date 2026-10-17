import { useContext, useEffect, useId, useRef } from 'react'
import type React from 'react'
import { LookupContext } from '@/components/Dictionary/lookupContext'
import { ELISION_PREFIX, FRENCH_WORD_REGEX, normalizeLookupWord } from './helpers'
import type { IntensiveSentence, SentenceSegment } from './types'

interface TranscriptViewProps {
  sentences: IntensiveSentence[]
  segments: SentenceSegment[]
  activeIndex: number
  onSelectSentence: (index: number) => void
  showChinese: boolean
  showFrench: boolean
  isDialogue: boolean
  isAudioPending: boolean
  className?: string
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  sentences,
  segments,
  activeIndex,
  onSelectSentence,
  showChinese,
  showFrench,
  isDialogue,
  isAudioPending,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const lastScrollTimeRef = useRef<number>(0)
  const ownerId = useId()
  const lookup = useContext(LookupContext)
  const activeWord = lookup?.active ?? null
  const dismissIfOwner = lookup?.dismissIfOwner
  const open = lookup?.open

  useEffect(() => {
    if (!dismissIfOwner) return
    return () => dismissIfOwner(ownerId)
  }, [ownerId, dismissIfOwner])

  // Track user manual scrolling to prevent disruptive auto-scrolls
  const handleScroll = () => {
    lastScrollTimeRef.current = Date.now()
  }

  // Smoothly scroll active sentence into view if user hasn't scrolled in 3s
  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= sentences.length) return
    const rowEl = rowRefs.current[activeIndex]
    if (!rowEl) return

    const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current
    if (timeSinceLastScroll > 3000) {
      rowEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeIndex, sentences.length])

  // Placeholder generator for blind mode
  const getBlindPlaceholder = (text: string) => {
    // Generate bullet dots corresponding to words
    const words = text.split(/\s+/).filter(Boolean)
    return words.map((w) => '•'.repeat(Math.max(2, Math.min(6, w.length)))).join(' ')
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`space-y-3 overflow-y-auto pr-1 ${className}`}
      tabIndex={0}
      aria-label="精听原文对照"
    >
      {sentences.map((sentence, index) => {
        const isActive = index === activeIndex
        const segment = segments[index]
        const speaker = sentence.speaker || 'A'

        return (
          <div
            key={index}
            ref={(el) => {
              rowRefs.current[index] = el
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectSentence(index)
              }
            }}
            onClick={() => onSelectSentence(index)}
            className={`group relative cursor-pointer rounded-xl p-3.5 transition-all duration-200 ${
              isActive
                ? 'border-l-4 border-indigo-600 bg-indigo-50/90 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/40'
                : 'border border-transparent bg-white/70 hover:border-gray-200 hover:bg-white dark:bg-gray-800/60 dark:hover:border-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            {/* Sentence Header (Index + Speaker tag if dialogue) */}
            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </span>

                {isDialogue && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      speaker === 'A'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    角色 {speaker}
                  </span>
                )}
              </div>

              {/* Timestamp if available */}
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1 text-[10px] text-gray-400 opacity-60 transition-opacity group-hover:opacity-100 dark:text-gray-500" title="点击任意法语单词即可查词">
                  查词
                </span>
                {segment && !isAudioPending && (
                  <span className={`font-mono text-[10px] ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {segment.start.toFixed(1)}s
                  </span>
                )}
              </div>
            </div>

            {/* French Text (Larger font, bolded when active) */}
            <div
              className={`text-base leading-relaxed tracking-normal transition-colors ${
                isActive
                  ? 'font-medium text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {showFrench ? (
                <span lang="fr">
                  {sentence.fr.split(FRENCH_WORD_REGEX).map((token, tokenIdx) => {
                    if (tokenIdx % 2 === 1) {
                      const normalized = normalizeLookupWord(token)
                      const isWordActive = Boolean(activeWord && normalized && activeWord.toLowerCase() === normalized.toLowerCase())
                      const match = token.match(ELISION_PREFIX)
                      const elisionPrefix = match ? match[0] : ''
                      const coreWord = elisionPrefix ? token.slice(elisionPrefix.length) : token

                      return (
                        <span
                          key={tokenIdx}
                          tabIndex={-1}
                          title="点击查词"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (normalized) {
                              open?.(normalized, e.currentTarget, ownerId)
                            }
                          }}
                          className={`cursor-pointer rounded px-0.5 py-0.5 transition-colors hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 ${
                            isWordActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : ''
                          }`}
                        >
                          {elisionPrefix ? (
                            <>
                              <span>{elisionPrefix}</span>
                              <span>{coreWord}</span>
                            </>
                          ) : (
                            token
                          )}
                        </span>
                      )
                    }
                    return <span key={tokenIdx}>{token}</span>
                  })}
                </span>
              ) : (
                <span className="select-none tracking-widest text-gray-500 dark:text-gray-400 font-mono">
                  {getBlindPlaceholder(sentence.fr)}
                </span>
              )}
            </div>

            {/* Chinese Translation (Smaller font, grey) */}
            {showChinese && (
              <div className={`mt-1.5 text-xs leading-normal ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {sentence.zh}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
