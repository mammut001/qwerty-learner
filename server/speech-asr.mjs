// Server-side speech-to-text integration with Deepgram (Nova-3, French)
// Used to assess oral fluency, rate, pauses, and intelligibility.
// Secrets rule: DEEPGRAM_API_KEY must never be logged, printed, or sent to the client.

export const MAX_AUDIO_BYTES = 6 * 1024 * 1024 // 6 MB

export const ALLOWED_AUDIO_TYPES = Object.freeze(new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
  'audio/mpeg',
]))

export class SpeechAsrError extends Error {
  constructor(code, message = code, details = {}) {
    super(message)
    this.code = code
    this.details = details
  }
}

export function isFrenchFiller(word) {
  const clean = String(word || '').toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
  return /^(euh+|heu+|hum+|ben|bah|mm+|hm+|uh+|um+)$/i.test(clean)
}

/**
 * Computes oral production metrics from ASR words and audio duration.
 * Pure function: handles empty audio / no words gracefully without throwing.
 */
export function speechMetrics(words = [], durationSeconds = 0) {
  const duration = Number(durationSeconds) > 0 ? Number(durationSeconds) : 0
  const validWords = Array.isArray(words) ? words : []
  const wordCount = validWords.length

  if (wordCount === 0 || duration === 0) {
    return {
      wordCount: 0,
      speechSeconds: 0,
      wordsPerMinute: 0,
      articulationRate: 0,
      pauseCount: 0,
      longPauseCount: 0,
      longestPauseSeconds: 0,
      pauseRatio: duration > 0 ? 1 : 0,
      fillerCount: 0,
      meanConfidence: 0,
      lowConfidenceWords: [],
      lowConfidenceRatio: 0,
      intelligibility: 'unclear',
    }
  }

  let rawSpeechSeconds = 0
  let confidenceSum = 0
  let lowConfCount = 0
  const lowConfidenceWords = []
  let fillerCount = 0

  for (const w of validWords) {
    const start = Number(w.start) || 0
    const end = Number(w.end) || 0
    const span = Math.max(0, end - start)
    rawSpeechSeconds += span

    const conf = Number(w.confidence) || 0
    confidenceSum += conf
    if (conf < 0.6) {
      lowConfCount++
      if (lowConfidenceWords.length < 12) {
        lowConfidenceWords.push({
          word: String(w.word || ''),
          start: Math.round(start * 100) / 100,
          end: Math.round(end * 100) / 100,
          confidence: Math.round(conf * 100) / 100,
        })
      }
    }

    if (isFrenchFiller(w.word)) {
      fillerCount++
    }
  }

  const speechSeconds = Math.round(Math.min(duration, rawSpeechSeconds) * 100) / 100
  const wordsPerMinute = duration > 0 ? Math.round((wordCount / (duration / 60)) * 10) / 10 : 0
  const articulationRate = speechSeconds > 0 ? Math.round((wordCount / (speechSeconds / 60)) * 10) / 10 : 0

  // Pauses between consecutive words
  const sorted = [...validWords].sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
  let pauseCount = 0
  let longPauseCount = 0
  let longestPauseSeconds = 0

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = Number(sorted[i - 1].end) || 0
    const currStart = Number(sorted[i].start) || 0
    const gap = currStart - prevEnd
    if (gap >= 0.4) {
      pauseCount++
      if (gap >= 1.5) {
        longPauseCount++
      }
      if (gap > longestPauseSeconds) {
        longestPauseSeconds = gap
      }
    }
  }

  longestPauseSeconds = Math.round(longestPauseSeconds * 100) / 100
  const pauseRatio = duration > 0 ? Math.max(0, Math.min(1, Math.round(((duration - speechSeconds) / duration) * 100) / 100)) : 0
  const meanConfidence = Math.round((confidenceSum / wordCount) * 100) / 100
  const lowConfidenceRatio = Math.round((lowConfCount / wordCount) * 100) / 100

  // Intelligibility band:
  // Word confidence from speech recognition separates clear from unclear speech,
  // acting as a proxy for intelligibility (not a phoneme-level pronunciation score).
  // - 'clear': high recognition confidence (>= 0.88) with few uncertain words (<= 15%)
  // - 'mostly-clear': moderate confidence (>= 0.72) with <= 35% uncertain words
  // - 'unclear': lower confidence or heavy distortion (> 35% uncertain words)
  let intelligibility = 'unclear'
  if (meanConfidence >= 0.88 && lowConfidenceRatio <= 0.15) {
    intelligibility = 'clear'
  } else if (meanConfidence >= 0.72 && lowConfidenceRatio <= 0.35) {
    intelligibility = 'mostly-clear'
  }

  return {
    wordCount,
    speechSeconds,
    wordsPerMinute,
    articulationRate,
    pauseCount,
    longPauseCount,
    longestPauseSeconds,
    pauseRatio,
    fillerCount,
    meanConfidence,
    lowConfidenceWords,
    lowConfidenceRatio,
    intelligibility,
  }
}

/**
 * Transcribes audio via Deepgram Nova-3 API.
 * Never logs or returns the API key or upstream error bodies.
 */
export async function transcribeSpeech({
  audio,
  mimeType,
  fetchImpl = globalThis.fetch,
  apiKey,
  language = 'fr-CA',
  timeoutMs = 30000,
}) {
  if (!apiKey) {
    throw new SpeechAsrError('ASR_NOT_CONFIGURED', 'Speech recognition is not configured')
  }
  if (!Buffer.isBuffer(audio) || audio.length === 0) {
    throw new SpeechAsrError('INVALID_AUDIO', 'Audio buffer is empty or invalid')
  }

  const url = new URL('https://api.deepgram.com/v1/listen')
  url.searchParams.set('model', 'nova-3')
  url.searchParams.set('language', language)
  url.searchParams.set('smart_format', 'true')
  url.searchParams.set('punctuate', 'true')
  url.searchParams.set('utterances', 'true')
  url.searchParams.set('filler_words', 'true')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetchImpl(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': mimeType,
      },
      body: audio,
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timer)
    throw new SpeechAsrError('ASR_UPSTREAM_FAILED', 'Speech recognition upstream failed')
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw new SpeechAsrError('ASR_UPSTREAM_FAILED', 'Speech recognition upstream returned non-ok status')
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new SpeechAsrError('ASR_UPSTREAM_FAILED', 'Failed to parse speech recognition response')
  }

  const durationSeconds = Number(data?.metadata?.duration) || 0
  const channel = data?.results?.channels?.[0]
  const alternative = channel?.alternatives?.[0]
  const transcript = typeof alternative?.transcript === 'string' ? alternative.transcript.trim() : ''
  const rawWords = Array.isArray(alternative?.words) ? alternative.words : []
  const words = rawWords
    .map((w) => ({
      word: String(w.punctuated_word || w.word || '').trim(),
      start: Math.round((Number(w.start) || 0) * 100) / 100,
      end: Math.round((Number(w.end) || 0) * 100) / 100,
      confidence: Math.round((Number(w.confidence) || 0) * 100) / 100,
    }))
    .filter((w) => w.word.length > 0)

  const metrics = speechMetrics(words, durationSeconds)

  return {
    transcript,
    durationSeconds: Math.round(durationSeconds * 100) / 100,
    words,
    metrics,
  }
}

/** Rate limits for ASR transcribe endpoint */
export function asrRateLimits(env = process.env) {
  const daily = Number(env.STUDY_ASR_DAILY_LIMIT)
  return [
    { scope: 'actor', limit: 30, windowMs: 60 * 60_000, blockMs: 60 * 60_000 },
    { scope: 'global', limit: Number.isInteger(daily) && daily > 0 ? daily : 300, windowMs: 24 * 60 * 60_000, blockMs: 60 * 60_000 },
  ]
}
