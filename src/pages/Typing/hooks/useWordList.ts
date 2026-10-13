import { CHAPTER_LENGTH } from '@/constants'
import { currentChapterAtom, currentDictInfoAtom, reviewModeInfoAtom } from '@/store'
import type { Word, WordWithIndex } from '@/typings/index'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'

export type UseWordListResult = {
  words: WordWithIndex[]
  isLoading: boolean
  error: Error | undefined
  isRetrying: boolean
  retry: () => Promise<unknown>
}

export function useWordList(): UseWordListResult {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const { isReviewMode, reviewRecord } = useAtomValue(reviewModeInfoAtom)

  const { data: wordList, error, isLoading, isValidating, mutate } = useSWR(currentDictInfo.url, wordListFetcher)

  const chapterCount = wordList ? Math.ceil(wordList.length / CHAPTER_LENGTH) : currentDictInfo.chapterCount
  const safeChapter = Number.isSafeInteger(currentChapter) && currentChapter >= 0 && currentChapter < chapterCount ? currentChapter : 0

  useEffect(() => {
    if (currentChapter !== safeChapter) setCurrentChapter(safeChapter)
  }, [currentChapter, safeChapter, setCurrentChapter])

  const words: WordWithIndex[] = useMemo(() => {
    let newWords: Word[]
    if (isReviewMode) {
      newWords = reviewRecord?.words ?? []
    } else if (wordList) {
      newWords = wordList.slice(safeChapter * CHAPTER_LENGTH, (safeChapter + 1) * CHAPTER_LENGTH)
    } else {
      newWords = []
    }

    return newWords.map((word, index) => {
      let trans: string[]
      if (Array.isArray(word.trans)) {
        trans = word.trans.filter((item) => typeof item === 'string')
      } else if (word.trans === null || word.trans === undefined || typeof word.trans === 'object') {
        trans = []
      } else {
        trans = [String(word.trans)]
      }
      return {
        ...word,
        index,
        trans,
      }
    })
  }, [isReviewMode, wordList, reviewRecord?.words, safeChapter])

  return { words, isLoading, error, isRetrying: isValidating, retry: mutate }
}
