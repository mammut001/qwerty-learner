// Pure helper functions for Deepgram TTS QA.
// Detects lone elided letters and spelled-out punctuation/accent tokens.
// Maps word timestamps to passage sentences via manifest segments.

export const LONE_ELIDED_TOKENS = Object.freeze(new Set(['s', 'l', 'd', 'j', 'm', 'n', 't', 'c', 'qu']))

export const SPELLED_PUNCTUATION_TOKENS = Object.freeze(
  new Set([
    'accent',
    'aigu',
    'grave',
    'circonflexe',
    'cédille',
    'cedille',
    'tréma',
    'trema',
    'apostrophe',
    'astérisque',
    'asterisque',
    'tiret',
  ]),
)

/**
 * Helper to check if text contains euphonic '-t-'.
 * @param {string | null | undefined} text
 * @returns {boolean}
 */
export function hasEuphonicT(text) {
  if (typeof text !== 'string') return false
  return text.toLowerCase().includes('-t-')
}

/**
 * Normalizes a raw token from Deepgram ASR:
 * lowercases and strips leading/trailing whitespace and punctuation.
 * @param {string | null | undefined} token
 * @returns {string}
 */
export function normalizeQaToken(token) {
  if (typeof token !== 'string') return ''
  return token
    .toLowerCase()
    .trim()
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '')
}

/**
 * Checks whether a token is flagged as a lone elided letter or spelled-out punctuation.
 * Ignores lone 't' tokens when originalText contains euphonic '-t-'.
 * @param {string | null | undefined} rawToken
 * @param {string | { originalText?: string }} [originalText]
 * @returns {boolean}
 */
export function isFlaggedToken(rawToken, originalText = '') {
  const clean = normalizeQaToken(rawToken)
  if (!clean) return false
  const text = typeof originalText === 'string' ? originalText : originalText?.originalText || ''
  if (clean === 't' && hasEuphonicT(text)) {
    return false
  }
  if (LONE_ELIDED_TOKENS.has(clean)) return true
  const unaccented = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return SPELLED_PUNCTUATION_TOKENS.has(clean) || SPELLED_PUNCTUATION_TOKENS.has(unaccented)
}

/**
 * Classifies a token and returns defect metadata, or null if token is normal.
 * Ignores lone 't' tokens when originalText contains euphonic '-t-'.
 * @param {string | null | undefined} rawToken
 * @param {string | { originalText?: string }} [originalText]
 * @returns {{ token: string, raw: string, type: string, reason: string } | null}
 */
export function classifyQaToken(rawToken, originalText = '') {
  const clean = normalizeQaToken(rawToken)
  if (!clean) return null

  const text = typeof originalText === 'string' ? originalText : originalText?.originalText || ''
  if (clean === 't' && hasEuphonicT(text)) {
    return null
  }

  if (LONE_ELIDED_TOKENS.has(clean)) {
    return {
      token: clean,
      raw: String(rawToken),
      type: 'lone_elision',
      reason: `Lone elided letter token: "${clean}"`,
    }
  }

  const unaccented = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (SPELLED_PUNCTUATION_TOKENS.has(clean) || SPELLED_PUNCTUATION_TOKENS.has(unaccented)) {
    return {
      token: clean,
      raw: String(rawToken),
      type: 'spelled_punctuation',
      reason: `Spelled-out punctuation or diacritic: "${clean}"`,
    }
  }

  return null
}

/**
 * Resolves the list of ignored defect tokens for a specific item from an ignore configuration.
 * Supports matching exact item ID or question id suffix (e.g. matching question id 'co-11').
 * @param {Record<string, Record<string, string[]>> | null | undefined} ignoreConfig
 * @param {string} manifestType e.g. 'tcf-listening' or 'intensive'
 * @param {string} itemId e.g. 'co-11' or 'radio-communautaire'
 * @returns {string[]}
 */
export function getIgnoredTokens(ignoreConfig, manifestType, itemId) {
  if (!ignoreConfig || typeof ignoreConfig !== 'object') return []
  const typeMap = ignoreConfig[manifestType]
  if (!typeMap || typeof typeMap !== 'object') return []
  if (Array.isArray(typeMap[itemId])) return typeMap[itemId]
  if (typeof itemId === 'string') {
    const match = Object.entries(typeMap).find(([k]) => itemId === k || itemId.endsWith(k))
    if (match && Array.isArray(match[1])) return match[1]
  }
  return []
}

/**
 * Normalizes an array or Set of ignored tokens into a Set of cleaned tokens.
 * @param {Array<string> | Set<string> | null | undefined} ignoredTokens
 * @returns {Set<string>}
 */
function toNormalizedIgnoreSet(ignoredTokens) {
  if (!ignoredTokens) return new Set()
  const list = ignoredTokens instanceof Set ? Array.from(ignoredTokens) : Array.isArray(ignoredTokens) ? ignoredTokens : [ignoredTokens]
  return new Set(list.map((t) => normalizeQaToken(t)).filter(Boolean))
}

/**
 * Filters an array of already-flagged items using an ignore list.
 * Also ignores lone 't' tokens when originalText contains euphonic '-t-'.
 * @param {Array<{ token: string }>} flaggedWords
 * @param {Array<string> | Set<string>} [ignoredTokens]
 * @param {string | { originalText?: string }} [originalText]
 * @returns {Array<{ token: string }>}
 */
export function filterIgnoredFlaggedWords(flaggedWords, ignoredTokens = [], originalText = '') {
  if (!Array.isArray(flaggedWords)) return []
  const text = typeof originalText === 'string' ? originalText : originalText?.originalText || ''
  const ignoreEuphT = hasEuphonicT(text)
  const ignoreSet = toNormalizedIgnoreSet(ignoredTokens)
  return flaggedWords.filter((f) => {
    const clean = normalizeQaToken(f.token)
    if (clean === 't' && ignoreEuphT) return false
    return !ignoreSet.has(clean)
  })
}

/**
 * Inspects a list of Deepgram word objects or tokens and returns all flagged items.
 * An optional list or Set of ignoredTokens can be provided to skip known legitimate letter spellings.
 * An optional originalText string can be provided to treat euphonic '-t-' as legitimate.
 * @param {Array<string | { word?: string, punctuated_word?: string, start?: number, end?: number, confidence?: number }>} words
 * @param {Array<string> | Set<string> | string | { ignoredTokens?: any, originalText?: string }} [ignoredTokens]
 * @param {string | { originalText?: string }} [originalText]
 * @returns {Array<{ token: string, raw: string, type: string, reason: string, start: number | null, end: number | null, confidence: number | null, index: number }>}
 */
export function findFlaggedWords(words, ignoredTokens = [], originalText = '') {
  if (!Array.isArray(words)) return []

  let effectiveIgnored = ignoredTokens
  let effectiveOriginalText = originalText

  if (typeof ignoredTokens === 'string' && !originalText) {
    if (ignoredTokens.includes('-t-') || ignoredTokens.includes(' ')) {
      effectiveIgnored = []
      effectiveOriginalText = ignoredTokens
    }
  } else if (
    ignoredTokens &&
    typeof ignoredTokens === 'object' &&
    !Array.isArray(ignoredTokens) &&
    !(ignoredTokens instanceof Set)
  ) {
    effectiveIgnored = ignoredTokens.ignoredTokens || []
    effectiveOriginalText = ignoredTokens.originalText || originalText
  }

  const text = typeof effectiveOriginalText === 'string' ? effectiveOriginalText : effectiveOriginalText?.originalText || ''
  const ignoreSet = toNormalizedIgnoreSet(effectiveIgnored)
  const flagged = []

  for (let i = 0; i < words.length; i++) {
    const item = words[i]
    const raw = typeof item === 'string' ? item : item?.word || item?.punctuated_word || ''
    const classification = classifyQaToken(raw, text)
    if (classification && !ignoreSet.has(classification.token)) {
      flagged.push({
        ...classification,
        start: typeof item?.start === 'number' ? item.start : null,
        end: typeof item?.end === 'number' ? item.end : null,
        confidence: typeof item?.confidence === 'number' ? item.confidence : null,
        index: i,
      })
    }
  }

  return flagged
}

/**
 * Maps an audio timestamp (in seconds) to the corresponding segment index in an intensive listening manifest.
 * Segments are sorted non-overlapping [{ start, end }].
 * @param {Array<{ start: number, end: number }>} segments
 * @param {number} time timestamp in seconds
 * @returns {number} 0-based segment index, or -1 if no segments
 */
export function timeToSegmentIndex(segments, time) {
  if (!Array.isArray(segments) || segments.length === 0 || typeof time !== 'number' || Number.isNaN(time)) {
    return -1
  }

  // Exact interval match: [start, end)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (time >= seg.start && time < seg.end) {
      return i
    }
  }

  // Boundary condition on the last segment end
  const last = segments[segments.length - 1]
  if (time >= last.start && time <= last.end + 0.5) {
    return segments.length - 1
  }

  // Timestamp precedes the first segment
  if (time < segments[0].start) {
    return 0
  }

  // Fallback: pick the closest segment
  let bestIdx = -1
  let minDistance = Infinity
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    let dist = 0
    if (time < seg.start) dist = seg.start - time
    else if (time > seg.end) dist = time - seg.end
    if (dist < minDistance) {
      minDistance = dist
      bestIdx = i
    }
  }

  return bestIdx
}

/**
 * Maps a flagged word object to an intensive passage sentence using manifest segments.
 * @param {{ start?: number | null, end?: number | null }} flaggedWord
 * @param {Array<{ start: number, end: number }>} segments
 * @param {Array<{ fr: string }>} sentences
 * @returns {{ time: number, segmentIndex: number, sentenceNumber: number | null, sentenceFr: string }}
 */
export function mapFlaggedWordToIntensiveSentence(flaggedWord, segments, sentences) {
  const time =
    typeof flaggedWord?.start === 'number'
      ? typeof flaggedWord?.end === 'number'
        ? (flaggedWord.start + flaggedWord.end) / 2
        : flaggedWord.start
      : 0

  const segIndex = timeToSegmentIndex(segments, time)
  const sentenceNumber = segIndex >= 0 ? segIndex + 1 : null
  const sentenceFr = segIndex >= 0 && sentences?.[segIndex]?.fr ? sentences[segIndex].fr : ''

  return {
    time,
    segmentIndex: segIndex,
    sentenceNumber,
    sentenceFr,
  }
}

/**
 * Formats intensive passage flagged message: 'passageId #n: <sentence fr>'.
 * @param {string} passageId
 * @param {number | null} sentenceNumber 1-based sentence number
 * @param {string} sentenceFr
 * @returns {string}
 */
export function formatIntensiveFlaggedSentence(passageId, sentenceNumber, sentenceFr) {
  const numStr = sentenceNumber != null ? `#${sentenceNumber}` : '#?'
  return `${passageId} ${numStr}: ${sentenceFr}`
}

/**
 * Formats TCF listening flagged message: prints question id.
 * @param {string} questionId
 * @returns {string}
 */
export function formatTcfFlaggedMessage(questionId) {
  return `${questionId}`
}
