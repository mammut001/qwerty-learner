import crypto from 'node:crypto'

export const INTENSIVE_AUDIO_VERSION = 'v1'
export const INTENSIVE_AUDIO_BASE_URL = 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2'
export const DEFAULT_MALE_VOICE = 'fr-CA-Chirp3-HD-Achird'
export const DEFAULT_FEMALE_VOICE = 'fr-CA-Chirp3-HD-Aoede'
export const DEFAULT_INTENSIVE_SPEAKING_RATE = 0.95

/**
 * Assigns Google Chirp 3 HD fr-CA voice based on passage speaker configuration.
 * - Male: fr-CA-Chirp3-HD-Achird
 * - Female: fr-CA-Chirp3-HD-Aoede
 * - Monologue defaults to speaker A (or female if not specified).
 */
export function assignPassageSentenceVoice(
  passage,
  sentence,
  { maleVoice = DEFAULT_MALE_VOICE, femaleVoice = DEFAULT_FEMALE_VOICE } = {},
) {
  const speakerRole = sentence?.speaker || 'A'
  const speakerGender =
    passage?.speakers?.[speakerRole] ||
    passage?.speakers?.A ||
    (speakerRole === 'B' ? 'male' : 'female')

  return speakerGender === 'male' ? maleVoice : femaleVoice
}

/**
 * Computes sha256 of passage content + assigned voices + rate, truncated to 16 hex chars.
 */
export function computeIntensiveKey(
  passage,
  {
    version = INTENSIVE_AUDIO_VERSION,
    rate = DEFAULT_INTENSIVE_SPEAKING_RATE,
    voiceA,
    voiceB,
  } = {},
) {
  const vA =
    voiceA || (passage?.speakers?.A === 'male' ? DEFAULT_MALE_VOICE : DEFAULT_FEMALE_VOICE)
  const vB =
    voiceB ||
    (passage?.speakers?.B
      ? passage.speakers.B === 'male'
        ? DEFAULT_MALE_VOICE
        : DEFAULT_FEMALE_VOICE
      : '')

  const sentencesStr = (passage?.sentences || [])
    .map((s) => `${s.speaker || 'A'}:${String(s.fr || '').trim()}`)
    .join('\n')

  const input = `${version}|${passage?.id || ''}|${vA}|${vB}|${rate}|${sentencesStr}`
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 16)
}

/**
 * Relative path in the GCS bucket or mirror: intensive/v1/<key>.mp3
 */
export function computeIntensiveObjectPath(key, version = INTENSIVE_AUDIO_VERSION) {
  return `intensive/${version}/${key}.mp3`
}

/**
 * Parses MPEG-1 / MPEG-2 / MPEG-2.5 Layer III frame headers to measure the exact duration
 * of an MP3 audio buffer without external dependencies.
 *
 * For MPEG-2 Layer III at 24000 Hz (Google Chirp 3 HD fr-CA):
 * Each frame is 576 samples => 576 / 24000 = 0.024s (24 ms).
 * Returns { duration, frameCount, sampleRate, totalSamples }.
 */
export function parseMp3Duration(buf) {
  if (!buf || buf.length === 0) {
    return { duration: 0, frameCount: 0, sampleRate: 0, totalSamples: 0 }
  }

  let offset = 0
  const len = buf.length

  // Skip ID3v2 metadata header if present
  if (len >= 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const flags = buf[5]
    const tagSize = (buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]
    offset = 10 + tagSize + (flags & 0x10 ? 10 : 0)
  }

  const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
  const bitratesV2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
  const sampleRates = {
    1: [44100, 48000, 32000],
    2: [22050, 24000, 16000],
    2.5: [11025, 12000, 8000],
  }

  let totalSamples = 0
  let sampleRate = 0
  let frameCount = 0

  while (offset < len - 4) {
    // Frame sync: 11 bits set to 1 (0xFF and 3 MSB of next byte)
    if (buf[offset] === 0xff && (buf[offset + 1] & 0xe0) === 0xe0) {
      const b1 = buf[offset + 1]
      const b2 = buf[offset + 2]

      const versionBits = (b1 >> 3) & 0x03
      let version = null
      if (versionBits === 3) version = 1
      else if (versionBits === 2) version = 2
      else if (versionBits === 0) version = 2.5

      const layerBits = (b1 >> 1) & 0x03
      const isLayer3 = layerBits === 1

      const bitrateIdx = (b2 >> 4) & 0x0f
      const srateIdx = (b2 >> 2) & 0x03
      const padding = (b2 >> 1) & 0x01

      if (version && isLayer3 && bitrateIdx > 0 && bitrateIdx < 15 && srateIdx < 3) {
        const sr = sampleRates[version][srateIdx]
        const br = (version === 1 ? bitratesV1L3[bitrateIdx] : bitratesV2L3[bitrateIdx]) * 1000
        const samplesPerFrame = version === 1 ? 1152 : 576
        const frameLength = Math.floor(((version === 1 ? 144 : 72) * br) / sr) + padding

        if (frameLength > 0 && offset + frameLength <= len) {
          totalSamples += samplesPerFrame
          sampleRate = sr
          frameCount++
          offset += frameLength
          continue
        }
      }
    }
    offset++
  }

  const duration = sampleRate > 0 ? totalSamples / sampleRate : 0
  return { duration, frameCount, sampleRate, totalSamples }
}

/**
 * Concatenates MP3 buffers encoded with identical parameters into a single valid MP3 stream.
 */
export function concatenateMp3Buffers(buffers) {
  return Buffer.concat(buffers)
}
