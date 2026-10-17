// Utility functions for IPA pronunciation dictionary and SSML formatting for Google Cloud TTS.
// Canonical dictionary: src/utils/ttsElisionIpa.json
import { applyTtsSentenceFixes } from './ttsSentenceFixes.mjs'
import fs from 'node:fs'
import { createRequire } from 'node:module'

export { applyTtsSentenceFixes }

export const PREFIX_IPA = {
  l: 'l',
  d: 'd',
  j: 'ʒ',
  m: 'm',
  n: 'n',
  s: 's',
  t: 't',
  c: 's',
  qu: 'k',
  jusqu: 'ʒysk',
  lorsqu: 'lɔʁsk',
  puisqu: 'pɥisk',
  quoiqu: 'kwak',
  presqu: 'pʁɛsk',
}

export const PREFIX_REGEX_STR = '(?:jusqu|lorsqu|puisqu|quoiqu|presqu|qu|[cdjlmnst])'
export const VOWELS_H_STR = '[aàâäeéèêëiîïoôöuùûüyÿæœh]'

// Matches elision combos in sentence text: prefix + apostrophe + word starting with vowel/h,
// or the special compound aujourd'hui / aujourd’hui.
export const ELISION_COMBO_REGEX = new RegExp(`\\b(${PREFIX_REGEX_STR})['’](${VOWELS_H_STR}\\p{L}*)|\\b(aujourd['’]hui)\\b`, 'giu')

/**
 * Normalizes dictionary word key (matches normalizeDictionaryKey in dictionary.ts and build-dictionary.mjs).
 * @param {string} word
 * @returns {string}
 */
export function normalizeDictionaryKey(word) {
  if (typeof word !== 'string') return ''
  return word
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’`]/g, "'")
    .trim()
}

/**
 * Returns two-letter shard name for a word in public/lexicon/fr.
 * @param {string} word
 * @returns {string}
 */
export function shardOf(word) {
  const key = normalizeDictionaryKey(word)
  const letters = [key[0], key[1]].map((char) => (char && /[a-z]/.test(char) ? char : '_'))
  return letters.join('')
}

/**
 * Cleans raw IPA string from lexicon entry:
 * strips slashes, backslashes, syllable dots, and liaison tie bars.
 * @param {string | null | undefined} rawIpa
 * @returns {string}
 */
export function cleanLexiconIpa(rawIpa) {
  if (typeof rawIpa !== 'string') return ''
  return rawIpa
    .replace(/[\/\\\.]/g, '')
    .replace(/‿/g, '')
    .trim()
}

/**
 * Extracts and cleans the first available non-empty IPA transcription from a lexicon entry array.
 * @param {Array} rawEntries
 * @returns {string}
 */
export function extractLexiconIpa(rawEntries) {
  if (!Array.isArray(rawEntries)) return ''
  for (const entry of rawEntries) {
    if (Array.isArray(entry) && typeof entry[1] === 'string' && entry[1].trim() !== '') {
      const cleaned = cleanLexiconIpa(entry[1])
      if (cleaned) return cleaned
    }
  }
  return ''
}

/**
 * Normalizes an elision combo to lowercase with typographic apostrophe (’).
 * @param {string} combo
 * @returns {string}
 */
export function normalizeElisionCombo(combo) {
  if (typeof combo !== 'string') return ''
  return combo.toLowerCase().replace(/['`]/g, '’').trim()
}

let cachedDict = null
/**
 * Loads the elision IPA dictionary from src/utils/ttsElisionIpa.json.
 * @returns {Record<string, { ipa: string, say?: string, source: 'lexicon' | 'manual', reviewed: boolean, note?: string }>}
 */
export function loadElisionIpaDict() {
  if (cachedDict) return cachedDict
  try {
    const require = createRequire(import.meta.url)
    cachedDict = require('./ttsElisionIpa.json')
    return cachedDict
  } catch {
    try {
      const p = new URL('./ttsElisionIpa.json', import.meta.url)
      cachedDict = JSON.parse(fs.readFileSync(p, 'utf8'))
      return cachedDict
    } catch {
      return {}
    }
  }
}

/**
 * Finds all elision combos in a sentence that are missing or have empty IPA in the dictionary.
 * Combos with an optional "say" replacement text are not considered missing even if IPA is empty.
 * @param {string} text
 * @param {Record<string, { ipa?: string, say?: string }>} [dictionary]
 * @returns {string[]} array of missing combo keys normalized to ’
 */
export function findMissingElisionCombos(text, dictionary = loadElisionIpaDict()) {
  if (typeof text !== 'string' || !text) return []
  const matches = text.matchAll(new RegExp(ELISION_COMBO_REGEX.source, 'giu'))
  const missing = new Set()
  for (const m of matches) {
    const key = normalizeElisionCombo(m[0])
    const entry = dictionary?.[key]
    const hasSay = typeof entry?.say === 'string' && entry.say.trim() !== ''
    const ipa = typeof entry?.ipa === 'string' ? entry.ipa.trim() : ''
    if (!ipa && !hasSay) {
      missing.add(key)
    }
  }
  return Array.from(missing)
}

/**
 * Escapes XML special characters in plain text (&, <, >).
 * Apostrophes and quotes in text content do not require XML entity escaping.
 * @param {string} text
 * @returns {string}
 */
export function escapeXml(text) {
  if (typeof text !== 'string') return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Formats a sentence for TTS using SSML:
 * - Applies réévalue fix
 * - Escapes XML in text
 * - If combo has "say" text, replaces with escaped say text
 * - Otherwise wraps each elision combo found in dictionary with <phoneme alphabet="ipa" ph="IPA">combo</phoneme>
 * - Preserves original casing and apostrophe of the combo
 * - Wraps entire text in <speak>...</speak>
 * - Refuses synthesis (throws Error) if allowMissing is false and a combo has neither IPA nor say
 *
 * @param {string | null | undefined} text
 * @param {{
 *   dictionary?: Record<string, { ipa?: string, say?: string }>,
 *   allowMissing?: boolean,
 *   alwaysWrapSpeak?: boolean
 * }} [options]
 * @returns {string}
 */
export function formatTtsSsml(text, { dictionary = loadElisionIpaDict(), allowMissing = false, alwaysWrapSpeak = false } = {}) {
  if (typeof text !== 'string') return ''
  if (!text.trim()) return ''

  if (text.startsWith('<speak>') && text.endsWith('</speak>')) {
    return text
  }

  const fixedText = applyTtsSentenceFixes(text)
  const matches = Array.from(fixedText.matchAll(new RegExp(ELISION_COMBO_REGEX.source, 'giu')))

  if (matches.length === 0) {
    if (alwaysWrapSpeak) {
      return `<speak>${escapeXml(fixedText)}</speak>`
    }
    return fixedText
  }

  if (!allowMissing) {
    const missing = findMissingElisionCombos(fixedText, dictionary)
    if (missing.length > 0) {
      throw new Error(`Refusing SSML synthesis: combo "${missing[0]}" has empty IPA in dictionary`)
    }
  }

  let lastIndex = 0
  let ssml = ''

  for (const m of matches) {
    const raw = m[0]
    const index = m.index

    ssml += escapeXml(fixedText.slice(lastIndex, index))

    const key = normalizeElisionCombo(raw)
    const entry = dictionary?.[key]
    const hasSay = typeof entry?.say === 'string' && entry.say.trim() !== ''
    const ipa = typeof entry?.ipa === 'string' ? entry.ipa.trim() : ''

    if (hasSay) {
      ssml += escapeXml(entry.say)
    } else if (ipa) {
      ssml += `<phoneme alphabet="ipa" ph="${ipa}">${escapeXml(raw)}</phoneme>`
    } else {
      ssml += escapeXml(raw)
    }

    lastIndex = index + raw.length
  }

  ssml += escapeXml(fixedText.slice(lastIndex))
  return `<speak>${ssml}</speak>`
}

/**
 * Formats spoken text for TTS requests and content key computation.
 * For sentences with elision combos, returns SSML wrapped in <speak>.
 * For sentences without elisions, returns plain text with applyTtsSentenceFixes applied.
 * By default allowMissing is true for non-throwing key hashing and turn assignment.
 *
 * @param {string | null | undefined} text
 * @param {object} [options]
 * @returns {string}
 */
export function formatTtsSpokenText(text, options = {}) {
  if (typeof text !== 'string') return ''
  return formatTtsSsml(text, { allowMissing: true, ...options })
}
