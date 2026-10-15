import { buildOptions, pickDistractors } from './distractors'
import { CHAPTER_LENGTH } from '@/constants'
import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useMemo } from 'react'
import useSWR from 'swr'

export type QuizKind = 'fr2zh' | 'zh2fr' | 'listen'

/** A dictionary entry as the tap pages use it: `meaning` is the Chinese gloss, joined when a word has several. */
export type TapWord = {
  name: string
  meaning: string
  notation?: string
}

export type QuizQuestion = {
  word: TapWord
  options: string[]
  answer: string
}

export function toTapWord(word: Word): TapWord {
  // The typing page tolerates loose data (a bare string, or a missing field), so read the raw value as unknown.
  const raw: unknown = word.trans
  const trans: string[] = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : typeof raw === 'string' && raw.trim() !== ''
    ? [raw]
    : []
  return {
    name: word.name,
    meaning: trans.join('；'),
    notation: typeof word.notation === 'string' && word.notation.trim() !== '' ? word.notation : undefined,
  }
}

/** Loads a dictionary with the same SWR key as the typing page, so both share one cache entry. */
export function useTapDictionary(dict: Dictionary, chapter: number) {
  const { data, error, isLoading, mutate } = useSWR(dict.url, wordListFetcher)
  const all = useMemo(() => (data ?? []).map(toTapWord).filter((word) => word.name !== ''), [data])
  const chapterWords = useMemo(() => all.slice(chapter * CHAPTER_LENGTH, (chapter + 1) * CHAPTER_LENGTH), [all, chapter])
  return { all, chapterWords, error, isLoading, ready: data !== undefined, retry: mutate }
}

/** Words a quiz kind can ask: 法→中 and 中→法 need a meaning, 听音选词 only needs the spelling. */
export function quizEligible(words: TapWord[], kind: QuizKind): TapWord[] {
  return kind === 'listen' ? words : words.filter((word) => word.meaning !== '')
}

/**
 * Builds one multiple-choice question. Wrong options come from the chapter first and from the whole dictionary
 * only when the chapter is too small. 中→法 and 听音选词 prefer look-alike spellings.
 */
export function buildQuestion(
  word: TapWord,
  kind: QuizKind,
  chapterWords: TapWord[],
  allWords: TapWord[],
  random: () => number = Math.random,
): QuizQuestion {
  const answer = kind === 'fr2zh' ? word.meaning : word.name
  const valueOf = (item: TapWord) => (kind === 'fr2zh' ? item.meaning : item.name)
  const usable = (pool: TapWord[]) =>
    pool
      .filter((item) => item.name !== word.name && item.meaning !== '')
      .map(valueOf)
      .filter((value) => value !== answer)

  const distractors = pickDistractors(answer, usable(chapterWords), usable(allWords), {
    count: 3,
    similar: kind !== 'fr2zh',
    random,
  })
  return { word, answer, options: buildOptions(answer, distractors, random) }
}
