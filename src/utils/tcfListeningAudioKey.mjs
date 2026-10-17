// Shared utility for TCF listening audio keys, turn splitting, and voice assignment.
// Pure JS implementation so it runs identically in Node and the browser without external deps.

import { applyTtsSentenceFixes } from './ttsSentenceFixes.mjs'

export { applyTtsSentenceFixes }

export const TCF_LISTENING_VERSION = 'v1'

export const DEFAULT_VOICE_A = 'fr-CA-Chirp3-HD-Achird' // male
export const DEFAULT_VOICE_B = 'fr-CA-Chirp3-HD-Aoede' // female

export const DEFAULT_SPEAKING_RATE = 0.95

export const TCF_LISTENING_BASE_URL = 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2'

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be,
  0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa,
  0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85,
  0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
  0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]

export function sha256Hex(bytes) {
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
 * Splits an audioText string into dialogue turns on the em-dash turn marker ('—').
 * Strips leading '— ' from each turn and trims whitespace.
 * For monologues (no em-dash), returns a single-item array with trimmed text.
 * @param {string | null | undefined} audioText
 * @returns {string[]}
 */
export function splitTurns(audioText) {
  if (typeof audioText !== 'string') return []
  const text = audioText.trim()
  if (!text) return []

  if (!text.includes('—')) {
    return [text]
  }

  // Split on em-dash (—) followed by optional spaces
  return text
    .split(/—\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

/**
 * Checks if a question type represents an announcement.
 * @param {string | null | undefined} type
 * @returns {boolean}
 */
export function isAnnouncementType(type) {
  if (typeof type !== 'string') return false
  return /announc|annonc/i.test(type)
}

/**
 * Assigns a voice for a turn:
 * - Dialogues alternate: turn 0 = voiceA (male), turn 1 = voiceB (female), turn 2 = voiceA, etc.
 * - Monologues: voiceB for announcements, voiceA otherwise.
 * @param {string} type question type (e.g. 'dialogue', 'announcement', 'voicemail')
 * @param {number} turnIndex 0-indexed turn position
 * @param {boolean} isDialogue whether question is a dialogue
 * @param {string} voiceA default male voice
 * @param {string} voiceB default female voice
 * @returns {string} voice name
 */
export function assignListeningVoice(
  type,
  turnIndex = 0,
  isDialogue = false,
  voiceA = DEFAULT_VOICE_A,
  voiceB = DEFAULT_VOICE_B,
) {
  if (isDialogue) {
    return turnIndex % 2 === 0 ? voiceA : voiceB
  }
  return isAnnouncementType(type) ? voiceB : voiceA
}

/**
 * Breaks a question into its turns with assigned voices.
 * @param {{ type: string, audioText?: string }} question
 * @param {string} [voiceA]
 * @param {string} [voiceB]
 * @returns {Array<{ index: number, text: string, voice: string }>}
 */
export function getQuestionTurns(question, voiceA = DEFAULT_VOICE_A, voiceB = DEFAULT_VOICE_B) {
  const audioText = question?.audioText || ''
  const isDialogue = question?.type === 'dialogue' || audioText.includes('—')
  const rawTurns = splitTurns(audioText)

  return rawTurns.map((text, index) => ({
    index,
    text: applyTtsSentenceFixes(text),
    voice: assignListeningVoice(question?.type || '', index, isDialogue, voiceA, voiceB),
  }))
}

/**
 * Computes the first 16 hex characters of sha256(version + voices + rate + audioText).
 * @param {{
 *   version?: string,
 *   voices: string | string[],
 *   rate?: number | string,
 *   audioText: string
 * }} params
 * @returns {string} 16 hex characters
 */
export function computeListeningKey({
  version = TCF_LISTENING_VERSION,
  voices,
  rate = DEFAULT_SPEAKING_RATE,
  audioText,
}) {
  const voicesStr = Array.isArray(voices) ? voices.join('+') : String(voices || '')
  const cleanText = typeof audioText === 'string' ? applyTtsSentenceFixes(audioText.trim()) : ''
  const input = `${version}|${voicesStr}|${rate}|${cleanText}`
  const bytes = encoder.encode(input)
  return sha256Hex(bytes).slice(0, 16)
}

/**
 * Helper to compute the listening key for a question item.
 * @param {{ type: string, audioText?: string }} question
 * @param {{
 *   version?: string,
 *   rate?: number | string,
 *   voiceA?: string,
 *   voiceB?: string
 * }} [options]
 * @returns {string}
 */
export function computeListeningKeyForQuestion(
  question,
  {
    version = TCF_LISTENING_VERSION,
    rate = DEFAULT_SPEAKING_RATE,
    voiceA = DEFAULT_VOICE_A,
    voiceB = DEFAULT_VOICE_B,
  } = {},
) {
  const turns = getQuestionTurns(question, voiceA, voiceB)
  const voices = turns.map((t) => t.voice)
  return computeListeningKey({
    version,
    voices,
    rate,
    audioText: question?.audioText || '',
  })
}

/**
 * Returns GCS object path for a listening key: `listening/<version>/<key>.mp3`.
 * @param {string} key
 * @param {string} [version]
 * @returns {string}
 */
export function computeListeningObjectPath(key, version = TCF_LISTENING_VERSION) {
  return `listening/${version}/${key}.mp3`
}

/**
 * Returns GCS public URL for a listening key.
 * @param {string} base
 * @param {string} key
 * @param {string} [version]
 * @returns {string}
 */
export function computeListeningAudioUrl(base, key, version = TCF_LISTENING_VERSION) {
  const cleanBase = String(base ?? '').replace(/\/+$/, '')
  return `${cleanBase}/${computeListeningObjectPath(key, version)}`
}

/**
 * Returns relative path on the same-origin mirror.
 * @param {string} key
 * @param {string} [version]
 * @returns {string}
 */
export function mirrorListeningPath(key, version = TCF_LISTENING_VERSION) {
  return `listening/${version}/${key}.mp3`
}
