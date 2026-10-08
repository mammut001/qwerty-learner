import DictDetail from './DictDetail'
import { useDictStats } from './hooks/useDictStats'
import bookCover from '@/assets/book-cover.png'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import { currentDictIdAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { calcChapterCount } from '@/utils'
import * as Progress from '@radix-ui/react-progress'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  dictionary: Dictionary
  autoOpen?: boolean
  placementRecommended?: boolean
}

export default function DictionaryComponent({ dictionary, autoOpen = false, placementRecommended = false }: Props) {
  const currentDictID = useAtomValue(currentDictIdAtom)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoOpen) setOpen(true)
  }, [autoOpen])

  const buttonRef = useRef<HTMLButtonElement>(null)
  const entry = useIntersectionObserver(buttonRef, {})
  const isVisible = !!entry?.isIntersecting
  const dictStats = useDictStats(dictionary.id, isVisible)
  const chapterCount = useMemo(() => calcChapterCount(dictionary.length), [dictionary.length])
  const isSelected = currentDictID === dictionary.id
  const progress = useMemo(
    () => (dictStats ? Math.ceil((dictStats.exercisedChapterCount / chapterCount) * 100) : 0),
    [dictStats, chapterCount],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative flex h-36 w-80 cursor-pointer items-center justify-center overflow-hidden rounded-lg p-4 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
          placementRecommended
            ? 'bg-violet-50 ring-2 ring-violet-400 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50'
            : isSelected
            ? 'bg-indigo-400'
            : 'bg-zinc-50 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
        aria-label={`打开词库：${dictionary.name}`}
      >
        <div className="relative ml-1 mt-2 flex h-full w-full flex-col items-start justify-start">
          <h1
            className={`mb-1.5 text-xl font-normal ${
              isSelected ? 'text-white' : 'text-gray-800 group-hover:text-indigo-400 dark:text-gray-200'
            }`}
          >
            {dictionary.name}
          </h1>
          {placementRecommended && (
            <span className="mb-1 inline-block rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              定级推荐
            </span>
          )}

          <TooltipProvider>
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <span
                  className={`mb-1 block max-w-full truncate ${
                    isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-200'
                  } whitespace-nowrap`}
                >
                  {dictionary.description}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{dictionary.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className={`mb-0.5 font-bold ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-200'}`}>{dictionary.length} 词</p>

          <div className="flex w-full items-center pt-2">
            {progress > 0 && (
              <Progress.Root
                value={progress}
                max={100}
                className={`mr-4 h-2 w-full rounded-full border bg-white ${isSelected ? 'border-indigo-600' : 'border-indigo-400'}`}
              >
                <Progress.Indicator
                  className={`h-full rounded-full pl-0 ${isSelected ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                  style={{ width: `${progress}%` }}
                />
              </Progress.Root>
            )}
            <img
              src={bookCover}
              alt=""
              className={`pointer-events-none absolute right-3 top-3 w-16 ${isSelected ? 'opacity-50' : 'opacity-20'}`}
            />
          </div>
        </div>
      </button>

      <DialogContent className="w-[60rem] max-w-none !rounded-[20px]">
        <DictDetail dictionary={dictionary} />
      </DialogContent>
    </Dialog>
  )
}
