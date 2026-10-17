import type { SentenceSegment } from '../../services/intensiveListeningAudio'
import { resolveIntensiveAudioCandidates } from '../../services/intensiveListeningAudio'

export { resolveIntensiveAudioCandidates }

export const INTENSIVE_STORAGE_KEY = 'tcf-intensive-listening-completed-v1'

export const PLAYBACK_SPEEDS: number[] = [0.75, 1, 1.25]

/**
 * Decides whether audio playback should advance to the next candidate URL.
 * Fallback to the next candidate (e.g. GCS bucket) must only occur when:
 * 1. A subsequent candidate exists (currentIndex + 1 < totalCandidates).
 * 2. A real, fatal MediaError occurred on the current candidate.
 * Abort events (MEDIA_ERR_ABORTED = 1), missing error objects, or non-error events
 * must never abandon the self-hosted mirror.
 */
export function shouldFallbackAudioCandidate(
  currentIndex: number,
  totalCandidates: number,
  error: { code: number } | null | undefined,
): boolean {
  if (currentIndex + 1 >= totalCandidates) return false
  if (!error || typeof error.code !== 'number') return false
  // MEDIA_ERR_ABORTED (1) is triggered by pause, seek, or navigation aborts, not an asset failure
  if (error.code === 1) return false
  // Real fatal errors: MEDIA_ERR_NETWORK (2), MEDIA_ERR_DECODE (3), MEDIA_ERR_SRC_NOT_SUPPORTED (4)
  return error.code === 2 || error.code === 3 || error.code === 4
}

/**
 * Finds the index of the sentence whose segment encompasses `currentTime` using binary search.
 * Edge cases:
 * - Empty segments => -1
 * - currentTime before first segment => 0
 * - currentTime after last segment => last index
 */
export function findCurrentSentenceIndex(currentTime: number, segments: SentenceSegment[]): number {
  if (!segments || segments.length === 0) return -1
  if (!Number.isFinite(currentTime) || currentTime <= segments[0].start) return 0
  const lastIndex = segments.length - 1
  if (currentTime >= segments[lastIndex].end) return lastIndex

  let low = 0
  let high = lastIndex

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const seg = segments[mid]

    if (currentTime >= seg.start && currentTime < seg.end) {
      return mid
    }

    if (currentTime < seg.start) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  return Math.max(0, Math.min(lastIndex, high >= 0 ? high : low))
}

/**
 * Returns the index for the next sentence, clamped to the total length.
 */
export function getNextSentenceIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(0, currentIndex) + 1, total - 1)
}

/**
 * Returns the index for the previous sentence, clamped to 0.
 */
export function getPrevSentenceIndex(currentIndex: number): number {
  return Math.max(0, currentIndex - 1)
}

/**
 * Determines whether playback should loop back to segment.start when single-sentence loop is enabled.
 */
export function shouldLoopCurrentSentence(
  currentTime: number,
  segment: SentenceSegment | null | undefined,
  isLoopEnabled: boolean,
): boolean {
  if (!isLoopEnabled || !segment) return false
  if (!Number.isFinite(currentTime) || !Number.isFinite(segment.end)) return false
  return currentTime >= segment.end - 0.04
}

/**
 * Cycles through playback speeds: 0.75 -> 1 -> 1.25 -> 0.75
 */
export function cycleSpeed(currentSpeed: number, speeds: number[] = PLAYBACK_SPEEDS): number {
  if (!speeds || speeds.length === 0) return 1
  const idx = speeds.indexOf(currentSpeed)
  if (idx === -1 || idx === speeds.length - 1) {
    return speeds[0]
  }
  return speeds[idx + 1]
}

/**
 * Formats seconds into mm:ss format.
 */
export function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00'
  const rounded = Math.floor(totalSeconds)
  const minutes = Math.floor(rounded / 60)
  const seconds = rounded % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Reads the set of completed passage IDs from localStorage.
 */
export function getCompletedPassageIds(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) return new Set()
  try {
    const raw = window.localStorage.getItem(INTENSIVE_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item) => typeof item === 'string'))
    }
  } catch {
    // Ignore corrupt storage
  }
  return new Set()
}

/**
 * Marks a passage as completed in localStorage.
 */
export function markPassageCompleted(passageId: string): void {
  if (typeof window === 'undefined' || !window.localStorage || !passageId) return
  try {
    const current = getCompletedPassageIds()
    current.add(passageId)
    window.localStorage.setItem(INTENSIVE_STORAGE_KEY, JSON.stringify(Array.from(current)))
  } catch {
    // Ignore storage write errors (e.g. private browsing quota)
  }
}

/**
 * Matches French words including hyphenated words and words with internal apostrophes.
 */
export const FRENCH_WORD_REGEX = /([A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+)*)/

/**
 * Common French elision prefixes (articles, pronouns, prepositions, conjunctions).
 * l' (le/la), d' (de), j' (je), m' (me), t' (te), s' (se), c' (ce), n' (ne), qu' (que/qui),
 * jusqu' (jusque), lorsqu' (lorsque), puisqu' (puisque).
 */
export const ELISION_PREFIX = /^(?:l|d|j|n|s|m|t|c|qu|jusqu|lorsqu|puisqu)['’](?=[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ])/i

/**
 * Punctuation characters at word boundaries.
 */
const PUNCTUATION_EDGES = /^[\s.,;:!?«»"“”()[\]…—–'’\\-]+|[\s.,;:!?«»"“”()[\]…—–'’\\-]+$/gu

/**
 * Normalizes a word clicked in intensive listening for dictionary lookup:
 * - strips surrounding punctuation
 * - ignores elided articles/pronouns (e.g. l'école -> école, d'arriver -> arriver)
 * - keeps hyphenated words whole (e.g. peut-être -> peut-être)
 * - standardizes Unicode to NFC form
 */
export function normalizeLookupWord(raw: string): string {
  if (!raw) return ''
  let word = raw.normalize('NFC').replace(PUNCTUATION_EDGES, '')
  word = word.replace(ELISION_PREFIX, '')
  word = word.replace(PUNCTUATION_EDGES, '')
  return word.normalize('NFC')
}
