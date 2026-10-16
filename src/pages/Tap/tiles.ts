import type { TapWord } from './words'

export type TileSlotSegment = {
  type: 'slot'
  slotIndex: number
  expected: string
}

export type SeparatorSegment = {
  type: 'separator'
  text: string
}

export type TileSegment = TileSlotSegment | SeparatorSegment

export type TileExercise = {
  word: string
  segments: TileSegment[]
  answerTiles: string[]
  distractors: string[]
  pool: string[]
}

export const ACCENT_LETTERS = new Set([
  'é', 'è', 'ê', 'ë',
  'à', 'â',
  'ç',
  'î', 'ï',
  'ô',
  'û', 'ù', 'ü',
  'œ', 'æ',
  'ÿ',
  'É', 'È', 'Ê', 'Ë',
  'À', 'Â',
  'Ç',
  'Î', 'Ï',
  'Ô',
  'Û', 'Ù', 'Ü',
  'Œ', 'Æ',
  'Ÿ',
])

export const CONFUSABLE_SIBLINGS: Record<string, string[]> = {
  é: ['è', 'e', 'ê'],
  è: ['é', 'e', 'ê'],
  ê: ['é', 'è', 'e', 'ë'],
  ë: ['è', 'é', 'e'],
  à: ['a', 'â'],
  â: ['a', 'à'],
  ç: ['c'],
  î: ['i', 'ï'],
  ï: ['i', 'î'],
  ô: ['o'],
  û: ['u', 'ù', 'ü'],
  ù: ['u', 'û'],
  ü: ['u', 'û'],
  œ: ['e', 'o'],
  æ: ['e', 'a'],
  ÿ: ['y', 'ï'],
  É: ['È', 'E', 'Ê'],
  È: ['É', 'E', 'Ê'],
  Ê: ['É', 'È', 'E'],
  Ë: ['È', 'É', 'E'],
  À: ['A', 'Â'],
  Â: ['A', 'À'],
  Ç: ['C'],
  Î: ['I', 'Ï'],
  Ï: ['I', 'Î'],
  Ô: ['O'],
  Û: ['U', 'Ù', 'Ü'],
  Ù: ['U', 'Û'],
  Ü: ['U', 'Û'],
  Œ: ['E', 'O'],
  Æ: ['E', 'A'],
  Ÿ: ['Y', 'Ï'],
}

const RANDOM_DISTRACTOR_POOL = [
  'e', 's', 'a', 'i', 't', 'n', 'r', 'u', 'l', 'o',
  'd', 'c', 'p', 'm', 'v', 'b', 'g', 'f', 'h', 'q',
]

/** Splits text into grapheme clusters using Intl.Segmenter if available, else Array.from on NFC string. */
export function splitGraphemes(text: string): string[] {
  const nfc = text.normalize('NFC')
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(nfc), (item) => item.segment)
  }
  return Array.from(nfc)
}

/** Pre-filled fixed separators (spaces, apostrophes, hyphens, and standard punctuation). */
export function isSeparator(grapheme: string): boolean {
  return /^[\s'\u2019\u002D\u2010-\u2015.,?!/()…+]$/u.test(grapheme)
}

/** Whether the grapheme is a French accented letter. */
export function isAccentLetter(grapheme: string): boolean {
  return ACCENT_LETTERS.has(grapheme)
}

/** Breaks a run of letters into chunks of 2 to 3 letters. Length 1 stays single. */
export function chunkLetterRun(run: string[]): string[] {
  const n = run.length
  if (n <= 3) {
    return [run.join('')]
  }

  const chunks: string[] = []
  let i = 0
  let remaining = n
  while (remaining > 0) {
    let size = 3
    if (remaining === 4) {
      size = 2
    } else if (remaining === 2) {
      size = 2
    }
    chunks.push(run.slice(i, i + size).join(''))
    i += size
    remaining -= size
  }
  return chunks
}

/** Fisher-Yates shuffle with an injected pseudo-random source. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Generates tiles and separators from the target word, along with 2-4 distractor tiles.
 * Deterministic when `random` is provided.
 */
export function buildTileExercise(
  targetWord: string,
  random: () => number = Math.random,
): TileExercise {
  const normalized = targetWord.normalize('NFC').trim()
  const graphemes = splitGraphemes(normalized)

  const segments: TileSegment[] = []
  const answerTiles: string[] = []
  let slotIndex = 0

  if (graphemes.length <= 14) {
    for (const g of graphemes) {
      if (isSeparator(g)) {
        segments.push({ type: 'separator', text: g })
      } else {
        segments.push({ type: 'slot', slotIndex, expected: g })
        answerTiles.push(g)
        slotIndex++
      }
    }
  } else {
    let currentRun: string[] = []
    const flushRun = () => {
      if (currentRun.length === 0) return
      const chunks = chunkLetterRun(currentRun)
      for (const chunk of chunks) {
        segments.push({ type: 'slot', slotIndex, expected: chunk })
        answerTiles.push(chunk)
        slotIndex++
      }
      currentRun = []
    }

    for (const g of graphemes) {
      if (isSeparator(g)) {
        flushRun()
        segments.push({ type: 'separator', text: g })
      } else if (isAccentLetter(g)) {
        flushRun()
        segments.push({ type: 'slot', slotIndex, expected: g })
        answerTiles.push(g)
        slotIndex++
      } else {
        currentRun.push(g)
      }
    }
    flushRun()
  }

  // Find accented letters in the word
  const wordAccents = graphemes.filter((g) => isAccentLetter(g))
  const distractors: string[] = []
  const chosen = new Set<string>()

  for (const accent of wordAccents) {
    if (distractors.length >= 4) break
    const candidates = CONFUSABLE_SIBLINGS[accent]
    if (candidates && candidates.length > 0) {
      const available = candidates.filter((c) => !chosen.has(c))
      const poolToPick = available.length > 0 ? available : candidates
      const idx = Math.floor(random() * poolToPick.length)
      const picked = poolToPick[idx]
      distractors.push(picked)
      chosen.add(picked)
    }
  }

  // Fill with random letters if fewer than 2
  let attempts = 0
  while (distractors.length < 2 && attempts < 50) {
    attempts++
    const idx = Math.floor(random() * RANDOM_DISTRACTOR_POOL.length)
    const candidate = RANDOM_DISTRACTOR_POOL[idx]
    if (!chosen.has(candidate)) {
      distractors.push(candidate)
      chosen.add(candidate)
    }
  }

  // Extreme fallback to guarantee at least 2 distractors
  if (distractors.length < 2) {
    const fallbacks = ['x', 'z', 'k', 'w']
    for (const fb of fallbacks) {
      if (distractors.length >= 2) break
      if (!chosen.has(fb)) {
        distractors.push(fb)
        chosen.add(fb)
      }
    }
  }

  const pool = shuffle([...answerTiles, ...distractors], random)

  return {
    word: normalized,
    segments,
    answerTiles,
    distractors,
    pool,
  }
}

/**
 * Whether a word is usable for tile spelling.
 * Long entries (> 24 graphemes total) are skipped.
 * In 'zh2fr' mode, a Chinese translation is required.
 */
export function isSpellingEligible(word: TapWord, subMode: 'zh2fr' | 'listen'): boolean {
  const graphemes = splitGraphemes(word.name.trim())
  if (graphemes.length === 0 || graphemes.length > 24) return false
  if (subMode === 'zh2fr' && !word.meaning.trim()) return false
  return true
}

export function spellingEligible(words: TapWord[], subMode: 'zh2fr' | 'listen'): TapWord[] {
  return words.filter((w) => isSpellingEligible(w, subMode))
}
