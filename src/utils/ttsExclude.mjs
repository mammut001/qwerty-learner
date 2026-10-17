// Shared list of words excluded from Google Chirp TTS generation and playback.
// Canonical source: scripts/tts-exclude.json

export const TTS_EXCLUDED_WORDS = ['à']

const excludeSet = new Set(TTS_EXCLUDED_WORDS)

export function isTtsExcluded(word) {
  if (typeof word !== 'string') return false
  return excludeSet.has(word.trim())
}

export default TTS_EXCLUDED_WORDS
