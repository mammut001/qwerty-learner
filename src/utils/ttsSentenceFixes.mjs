// Spoken-text adjustments applied ONLY to text sent to Google Cloud TTS.
// Display text in UI, transcripts, and question banks remains unchanged.

export const TTS_SENTENCE_FIX_RULES = [
  {
    // Google Chirp spells out double é in "réévalu*" (e.g. "r e accent aigu e accent aigu value").
    // Hyphenating to "ré-évalu*" ensures natural spoken pronunciation.
    pattern: /\bré(é)valu/gi,
    replace: (match) => {
      if (match.startsWith('RÉ') || match.startsWith('RÉ-')) return 'RÉ-ÉVALU'
      if (match.startsWith('Ré')) return 'Ré-évalu'
      return 'ré-évalu'
    },
  },
]

/**
 * Applies spoken-text adjustments to a sentence or dialogue turn before TTS synthesis.
 * Preserves case and leaves unaffected words untouched.
 * @param {string | null | undefined} text
 * @returns {string}
 */
export function applyTtsSentenceFixes(text) {
  if (typeof text !== 'string') return ''
  let result = text
  for (const rule of TTS_SENTENCE_FIX_RULES) {
    result = result.replace(rule.pattern, rule.replace)
  }
  return result
}
