// Shared utility for Google Chirp 3 HD TTS key generation and paths.
// Generates first 16 hex chars of sha256(`v1|<voice>|<spokenText>`).
// Pure JS SHA-256 implementation so it can run identically in browser and Node without external deps.
import { applyTtsSentenceFixes } from './ttsSentenceFixes.mjs'
import ttsSpokenOverrides from './ttsSpokenOverrides.mjs'
import { ELISION_COMBO_REGEX, findMissingElisionCombos, formatTtsSsml, loadElisionIpaDict } from './ttsSsml.mjs'

export const TTS_VERSION = 'v1'

export const TTS_VOICES = {
  'fr-CA': 'fr-CA-Chirp3-HD-Achird',
  'fr-FR': 'fr-FR-Chirp3-HD-Achird',
}

export const DEFAULT_ACCENT = 'fr-CA'

export const TTS_BASE_URL = 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2'

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be,
  0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa,
  0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85,
  0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
  0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]

function sha256Hex(bytes) {
  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a
  let h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19

  const len = bytes.length
  const bitLen = len * 8
  const rem = (len + 9) % 64
  const padLen = rem === 0 ? 0 : 64 - rem
  const totalLen = len + 1 + padLen + 8
  const buf = new Uint8Array(totalLen)
  buf.set(bytes)
  buf[len] = 0x80

  const view = new DataView(buf.buffer)
  view.setUint32(totalLen - 4, bitLen >>> 0)
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000))

  const w = new Int32Array(64)
  for (let i = 0; i < totalLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getInt32(i + j * 4)
    }
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^ ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^ (w[j - 15] >>> 3)
      const s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^ ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^ (w[j - 2] >>> 10)
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7
    for (let j = 0; j < 64; j++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) | 0

      h = g
      g = f
      f = e
      e = (d + temp1) | 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) | 0
    }
    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0
    h5 = (h5 + f) | 0
    h6 = (h6 + g) | 0
    h7 = (h7 + h) | 0
  }
  const res = [h0, h1, h2, h3, h4, h5, h6, h7]
  return res.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('')
}

const encoder = new TextEncoder()

/**
 * Normalises raw dictionary headwords for speech synthesis:
 * - Drops " + <placeholder>" segments up to '?', '…', '...' or end
 * - Expands "X de / que" to "X de, X que"
 * - Drops "(e)" gender markers
 * - Collapses whitespace and trims, preserving final punctuation like '?' and ellipses
 */
export function speakableText(name) {
  if (typeof name !== 'string') return ''
  let text = name

  // Turn 'afin de / que' style 'X de / que' into 'X de, X que'
  text = text.replace(/\b([\p{L}\p{M}\x27\u2019]+(?:\s+[\p{L}\p{M}\x27\u2019]+)*)\s+de\s*\/\s*que\b/gu, '$1 de, $1 que')

  // Drop (e) gender markers
  text = text.replace(/\(e\)/gi, '')

  // Remove ' + <placeholder>' segments up to '?', '…', '...' or end
  text = text.replace(/\s*\+\s*[^?….]*?(\?|…|\.{3}|$)/gu, (match, p1) => {
    return p1 ? ` ${p1}` : ''
  })

  // Collapse whitespace, trim
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Resolves spoken text for a dictionary headword:
 * returns override from ttsSpokenOverrides if present for the given accent,
 * otherwise if speakable text contains elision combos, returns SSML built with the elision builder.
 * If any combo has no IPA and no say, returns the plain text unchanged.
 */
export function spokenTextFor(name, accent = DEFAULT_ACCENT, options = {}) {
  if (typeof name !== 'string') return ''
  const trimmed = name.trim()
  const override = ttsSpokenOverrides?.[trimmed]?.[accent]
  if (typeof override === 'string' && override.trim()) {
    return override.trim()
  }
  let text = speakableText(name)
  if (!text) return ''

  text = applyTtsSentenceFixes(text)

  const matches = text.match(new RegExp(ELISION_COMBO_REGEX.source, 'iu'))
  if (!matches) {
    return text
  }

  const dictionary = options?.dictionary || loadElisionIpaDict()
  const missing = findMissingElisionCombos(text, dictionary)
  if (missing.length > 0) {
    return text
  }

  return formatTtsSsml(text, { dictionary })
}

/**
 * Returns the first 16 hex characters of sha256(`v1|<voice>|<spokenText>`).
 * Accepts optional accent (or derives from voice name).
 */
export function computeTtsKey(voice, text, accent) {
  const resolvedAccent = accent || (voice?.startsWith('fr-FR') ? 'fr-FR' : 'fr-CA')
  const spoken = spokenTextFor(text, resolvedAccent)
  const input = `${TTS_VERSION}|${voice}|${spoken}`
  const bytes = encoder.encode(input)
  return sha256Hex(bytes).slice(0, 16)
}

export function computeTtsObjectPath(accent, key) {
  return `${TTS_VERSION}/${accent}/${key}.mp3`
}

export function computeTtsAudioUrl(base, accent, key) {
  const cleanBase = String(base ?? '').replace(/\/+$/, '')
  return `${cleanBase}/${computeTtsObjectPath(accent, key)}`
}

export { TTS_EXCLUDED_WORDS, isTtsExcluded } from './ttsExclude.mjs'
