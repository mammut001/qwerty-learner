import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ALLOWED_AUDIO_TYPES,
  MAX_AUDIO_BYTES,
  SpeechAsrError,
  asrRateLimits,
  isFrenchFiller,
  speechMetrics,
  transcribeSpeech,
} from './speech-asr.mjs'
import { createStudyServer } from './study-plan.mjs'

describe('speechMetrics pure function', () => {
  it('handles empty words or zero duration gracefully', () => {
    const empty1 = speechMetrics([], 0)
    assert.equal(empty1.wordCount, 0)
    assert.equal(empty1.speechSeconds, 0)
    assert.equal(empty1.wordsPerMinute, 0)
    assert.equal(empty1.articulationRate, 0)
    assert.equal(empty1.pauseCount, 0)
    assert.equal(empty1.longPauseCount, 0)
    assert.equal(empty1.longestPauseSeconds, 0)
    assert.equal(empty1.fillerCount, 0)
    assert.equal(empty1.meanConfidence, 0)
    assert.deepEqual(empty1.lowConfidenceWords, [])
    assert.equal(empty1.lowConfidenceRatio, 0)
    assert.equal(empty1.intelligibility, 'unclear')

    const empty2 = speechMetrics([], 10)
    assert.equal(empty2.wordCount, 0)
    assert.equal(empty2.pauseRatio, 1)
    assert.equal(empty2.intelligibility, 'unclear')
  })

  it('computes word count, speech duration, WPM and articulation rate', () => {
    // 5 words, duration = 10s
    // Spans: 0.5s each = 2.5s speech time
    // Gaps:
    // w1: 0.0 - 0.5
    // w2: 1.0 - 1.5 (gap = 0.5s >= 0.4s -> pause)
    // w3: 3.5 - 4.0 (gap = 2.0s >= 1.5s -> long pause)
    // w4: 4.2 - 4.7 (gap = 0.2s < 0.4s -> no pause)
    // w5: 5.5 - 6.0 (gap = 0.8s >= 0.4s -> pause)
    const words = [
      { word: 'Bonjour', start: 0.0, end: 0.5, confidence: 0.98 },
      { word: 'je', start: 1.0, end: 1.5, confidence: 0.95 },
      { word: 'suis', start: 3.5, end: 4.0, confidence: 0.92 },
      { word: 'très', start: 4.2, end: 4.7, confidence: 0.99 },
      { word: 'heureux', start: 5.5, end: 6.0, confidence: 0.96 },
    ]
    const m = speechMetrics(words, 10)
    assert.equal(m.wordCount, 5)
    assert.equal(m.speechSeconds, 2.5)
    // WPM = 5 / (10/60) = 30
    assert.equal(m.wordsPerMinute, 30)
    // Articulation rate = 5 / (2.5/60) = 120
    assert.equal(m.articulationRate, 120)
    assert.equal(m.pauseCount, 3) // gaps: 0.5s, 2.0s, 0.8s
    assert.equal(m.longPauseCount, 1) // gap: 2.0s
    assert.equal(m.longestPauseSeconds, 2.0)
    assert.equal(m.fillerCount, 0)
    assert.equal(m.meanConfidence, 0.96)
    assert.equal(m.lowConfidenceRatio, 0)
    assert.deepEqual(m.lowConfidenceWords, [])
    assert.equal(m.intelligibility, 'clear')
  })

  it('detects French filler words', () => {
    assert.equal(isFrenchFiller('euh'), true)
    assert.equal(isFrenchFiller('euh...'), true)
    assert.equal(isFrenchFiller('heu'), true)
    assert.equal(isFrenchFiller('hum'), true)
    assert.equal(isFrenchFiller('ben'), true)
    assert.equal(isFrenchFiller('bah'), true)
    assert.equal(isFrenchFiller('bonjour'), false)
    assert.equal(isFrenchFiller('bien'), false)

    const words = [
      { word: 'Euh', start: 0, end: 0.5, confidence: 0.9 },
      { word: 'je', start: 0.6, end: 0.9, confidence: 0.9 },
      { word: 'pense', start: 1.0, end: 1.4, confidence: 0.9 },
      { word: 'ben', start: 1.5, end: 1.8, confidence: 0.9 },
      { word: 'oui', start: 1.9, end: 2.2, confidence: 0.9 },
    ]
    const m = speechMetrics(words, 3)
    assert.equal(m.fillerCount, 2)
  })

  it('identifies low confidence words and classifies intelligibility bands', () => {
    // Clear: meanConfidence >= 0.88 && lowConfidenceRatio <= 0.15
    const clearWords = [
      { word: 'un', start: 0, end: 0.3, confidence: 0.95 },
      { word: 'deux', start: 0.4, end: 0.7, confidence: 0.92 },
      { word: 'trois', start: 0.8, end: 1.1, confidence: 0.90 },
      { word: 'quatre', start: 1.2, end: 1.5, confidence: 0.94 },
    ]
    assert.equal(speechMetrics(clearWords, 2).intelligibility, 'clear')

    // Mostly clear: meanConfidence >= 0.72 && lowConfidenceRatio <= 0.35
    const mostlyClearWords = [
      { word: 'un', start: 0, end: 0.3, confidence: 0.85 },
      { word: 'deux', start: 0.4, end: 0.7, confidence: 0.55 }, // < 0.6
      { word: 'trois', start: 0.8, end: 1.1, confidence: 0.80 },
      { word: 'quatre', start: 1.2, end: 1.5, confidence: 0.78 },
    ]
    const mcMetrics = speechMetrics(mostlyClearWords, 2)
    assert.equal(mcMetrics.intelligibility, 'mostly-clear')
    assert.equal(mcMetrics.lowConfidenceWords.length, 1)
    assert.equal(mcMetrics.lowConfidenceWords[0].word, 'deux')

    // Unclear: low confidence ratio > 0.35 or meanConfidence < 0.72
    const unclearWords = [
      { word: 'un', start: 0, end: 0.3, confidence: 0.50 },
      { word: 'deux', start: 0.4, end: 0.7, confidence: 0.45 },
      { word: 'trois', start: 0.8, end: 1.1, confidence: 0.70 },
      { word: 'quatre', start: 1.2, end: 1.5, confidence: 0.60 },
    ]
    const uncMetrics = speechMetrics(unclearWords, 2)
    assert.equal(uncMetrics.intelligibility, 'unclear')
    assert.equal(uncMetrics.lowConfidenceRatio, 0.5)
  })
})

describe('transcribeSpeech client module', () => {
  const SECRET_KEY = 'dg_secret_test_key_123456789'

  it('rejects missing API key with ASR_NOT_CONFIGURED', async () => {
    await assert.rejects(
      transcribeSpeech({ audio: Buffer.from('audio-data'), mimeType: 'audio/webm', apiKey: '' }),
      (err) => err instanceof SpeechAsrError && err.code === 'ASR_NOT_CONFIGURED',
    )
  })

  it('rejects invalid audio buffer with INVALID_AUDIO', async () => {
    await assert.rejects(
      transcribeSpeech({ audio: Buffer.alloc(0), mimeType: 'audio/webm', apiKey: SECRET_KEY }),
      (err) => err instanceof SpeechAsrError && err.code === 'INVALID_AUDIO',
    )
  })

  it('calls Deepgram with correct headers, query params and body', async () => {
    let capturedUrl = ''
    let capturedHeaders = {}
    let capturedBody = null

    const fakeFetch = async (url, options) => {
      capturedUrl = url
      capturedHeaders = options.headers
      capturedBody = options.body
      return {
        ok: true,
        json: async () => ({
          metadata: { duration: 4.5 },
          results: {
            channels: [
              {
                alternatives: [
                  {
                    transcript: 'Bonjour tout le monde',
                    words: [
                      { word: 'bonjour', punctuated_word: 'Bonjour', start: 0.1, end: 0.6, confidence: 0.98 },
                      { word: 'tout', punctuated_word: 'tout', start: 0.7, end: 1.0, confidence: 0.95 },
                      { word: 'le', punctuated_word: 'le', start: 1.1, end: 1.3, confidence: 0.94 },
                      { word: 'monde', punctuated_word: 'monde', start: 1.4, end: 1.9, confidence: 0.97 },
                    ],
                  },
                ],
              },
            ],
          },
        }),
      }
    }

    const audioBuf = Buffer.from('fake-audio-bytes')
    const result = await transcribeSpeech({
      audio: audioBuf,
      mimeType: 'audio/webm;codecs=opus',
      apiKey: SECRET_KEY,
      fetchImpl: fakeFetch,
    })

    assert.ok(capturedUrl.includes('api.deepgram.com/v1/listen'))
    assert.ok(capturedUrl.includes('model=nova-3'))
    assert.ok(capturedUrl.includes('language=fr-CA'))
    assert.ok(capturedUrl.includes('filler_words=true'))
    assert.equal(capturedHeaders.Authorization, `Token ${SECRET_KEY}`)
    assert.equal(capturedHeaders['Content-Type'], 'audio/webm;codecs=opus')
    assert.equal(capturedBody, audioBuf)

    assert.equal(result.transcript, 'Bonjour tout le monde')
    assert.equal(result.durationSeconds, 4.5)
    assert.equal(result.words.length, 4)
    assert.equal(result.metrics.wordCount, 4)
    assert.equal(result.metrics.intelligibility, 'clear')
  })

  it('maps upstream failure to ASR_UPSTREAM_FAILED without leaking key or upstream body', async () => {
    const fakeFailingFetch = async () => ({
      ok: false,
      status: 502,
      json: async () => ({ error: 'internal deepgram error with some internal details' }),
    })

    let caughtError = null
    try {
      await transcribeSpeech({
        audio: Buffer.from('fake-audio'),
        mimeType: 'audio/webm',
        apiKey: SECRET_KEY,
        fetchImpl: fakeFailingFetch,
      })
    } catch (err) {
      caughtError = err
    }

    assert.ok(caughtError instanceof SpeechAsrError)
    assert.equal(caughtError.code, 'ASR_UPSTREAM_FAILED')
    assert.doesNotMatch(caughtError.message, new RegExp(SECRET_KEY))
    assert.doesNotMatch(caughtError.message, /internal deepgram error/)
  })
})

describe('POST /api/study-plan/speech/transcribe endpoint', () => {
  const ORIGIN = 'http://localhost:5173'
  const STATE = { startDate: '2026-01-05', minutes: {}, minimumMode: {} }
  const SECRET_KEY = 'dg_super_secret_never_leak'

  async function withTestServer(options = {}, run) {
    const dir = mkdtempSync(join(tmpdir(), 'study-speech-asr-'))
    const server = createStudyServer({
      database: join(dir, 'study.sqlite'),
      origin: ORIGIN,
      deepgramApiKey: SECRET_KEY,
      ...options,
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
    let cookie = ''

    const call = async (method, path = '', { body, contentType, raw = false } = {}) => {
      const headers = { Origin: ORIGIN }
      if (cookie) headers.Cookie = cookie
      if (contentType) headers['Content-Type'] = contentType

      const response = await fetch(base + path, {
        method,
        headers,
        body,
      })
      if (!cookie && response.headers.get('set-cookie')) {
        cookie = response.headers.get('set-cookie').split(';')[0]
      }
      return {
        status: response.status,
        headers: response.headers,
        data: raw ? await response.text() : await response.json().catch(() => null),
      }
    }

    try {
      // Initialize learner session and plan
      await call('GET')
      await call('POST', '', { body: JSON.stringify({ state: STATE }), contentType: 'application/json' })
      await run(call)
    } finally {
      await new Promise((resolve) => server.close(resolve))
      rmSync(dir, { recursive: true, force: true })
    }
  }

  it('requires session / plan initialization', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'study-speech-asr-anon-'))
    const server = createStudyServer({
      database: join(dir, 'study.sqlite'),
      origin: ORIGIN,
      deepgramApiKey: SECRET_KEY,
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const url = `http://127.0.0.1:${server.address().port}/api/study-plan/speech/transcribe`
    try {
      // POST without session cookie
      const res = await fetch(url, {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'audio/webm' },
        body: Buffer.from('audio'),
      })
      assert.equal(res.status, 401)
      const data = await res.json()
      assert.equal(data.code, 'SESSION_REQUIRED')
    } finally {
      await new Promise((resolve) => server.close(resolve))
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects unsupported media types with 415', async () => {
    await withTestServer({}, async (call) => {
      const res = await call('POST', '/speech/transcribe', {
        body: Buffer.from('text'),
        contentType: 'text/plain',
      })
      assert.equal(res.status, 415)
      assert.equal(res.data.code, 'UNSUPPORTED_MEDIA_TYPE')
      assert.equal(res.headers.get('connection'), 'close')

      const jsonRes = await call('POST', '/speech/transcribe', {
        body: JSON.stringify({ audio: 'abc' }),
        contentType: 'application/json',
      })
      assert.equal(jsonRes.status, 415)
      assert.equal(jsonRes.data.code, 'UNSUPPORTED_MEDIA_TYPE')
      assert.equal(jsonRes.headers.get('connection'), 'close')
    })
  })

  it('rejects payload larger than 6 MB with 413', async () => {
    await withTestServer({}, async (call) => {
      const oversized = Buffer.alloc(MAX_AUDIO_BYTES + 100)
      const res = await call('POST', '/speech/transcribe', {
        body: oversized,
        contentType: 'audio/webm',
      })
      assert.equal(res.status, 413)
      assert.equal(res.data.code, 'REQUEST_TOO_LARGE')
      assert.equal(res.headers.get('connection'), 'close')
    })
  })

  const runKeepAliveRejection = async ({ contentType, expectedStatus, expectedCode }) => {
    const dir = mkdtempSync(join(tmpdir(), 'study-speech-asr-keepalive-'))
    const server = createStudyServer({
      database: join(dir, 'study.sqlite'),
      origin: ORIGIN,
      deepgramApiKey: SECRET_KEY,
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const port = server.address().port
    const agent = new http.Agent({ keepAlive: true })

    try {
      // Initialize session cookie and plan
      const getRes = await fetch(`http://127.0.0.1:${port}/api/study-plan`, {
        headers: { Origin: ORIGIN },
      })
      const cookie = getRes.headers.get('set-cookie')?.split(';')[0] || ''
      await fetch(`http://127.0.0.1:${port}/api/study-plan`, {
        method: 'POST',
        headers: { Origin: ORIGIN, Cookie: cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: STATE }),
      })

      const chunk = Buffer.alloc(7 * 1024 * 1024, 0)
      const req1 = http.request({
        hostname: '127.0.0.1',
        port,
        path: '/api/study-plan/speech/transcribe',
        method: 'POST',
        agent,
        headers: {
          Origin: ORIGIN,
          Cookie: cookie,
          'Content-Type': contentType,
          'Content-Length': chunk.length,
        },
      })

      let gotResponse1 = false
      const res1 = await new Promise((resolve, reject) => {
        req1.on('response', (res) => {
          gotResponse1 = true
          let body = ''
          let settled = false
          const done = () => {
            if (!settled) {
              settled = true
              resolve({ status: res.statusCode, headers: res.headers, body })
            }
          }
          res.on('data', (c) => { body += c })
          res.once('end', done)
          res.once('close', done)
        })
        req1.on('error', (err) => {
          if (!gotResponse1) reject(err)
        })
        req1.end(chunk)
      })

      assert.equal(res1.status, expectedStatus)
      assert.equal(res1.headers.connection, 'close')
      const parsed1 = JSON.parse(res1.body)
      assert.equal(parsed1.code, expectedCode)

      // 2. Normal request on the same keep-alive agent succeeds without ECONNRESET
      const res2 = await new Promise((resolve, reject) => {
        const req2 = http.request({
          hostname: '127.0.0.1',
          port,
          path: '/api/study-plan/echelle/ai',
          method: 'GET',
          agent,
          headers: { Origin: ORIGIN, Cookie: cookie },
        })
        req2.on('error', reject)
        req2.on('response', (res) => {
          let body = ''
          let settled = false
          const done = () => {
            if (!settled) {
              settled = true
              resolve({ status: res.statusCode, headers: res.headers, body })
            }
          }
          res.on('data', (c) => { body += c })
          res.once('end', done)
          res.once('close', done)
        })
        req2.end()
      })

      assert.equal(res2.status, 200)
      const parsed2 = JSON.parse(res2.body)
      assert.equal(parsed2.asr, true)
    } finally {
      agent.destroy()
      await new Promise((resolve) => server.close(resolve))
      rmSync(dir, { recursive: true, force: true })
    }
  }

  it('handles keep-alive connection cleanly: 7 MB upload returns 413 and subsequent request on same agent succeeds', async () => {
    await runKeepAliveRejection({ contentType: 'audio/webm', expectedStatus: 413, expectedCode: 'REQUEST_TOO_LARGE' })
  })

  it('handles keep-alive connection cleanly: 7 MB upload with unsupported type returns 415 and subsequent request succeeds', async () => {
    await runKeepAliveRejection({ contentType: 'text/plain', expectedStatus: 415, expectedCode: 'UNSUPPORTED_MEDIA_TYPE' })
  })

  it('returns 503 ASR_NOT_CONFIGURED when DEEPGRAM_API_KEY is not set', async () => {
    await withTestServer({ deepgramApiKey: '' }, async (call) => {
      const res = await call('POST', '/speech/transcribe', {
        body: Buffer.from('dummy-audio'),
        contentType: 'audio/webm',
      })
      assert.equal(res.status, 503)
      assert.equal(res.data.code, 'ASR_NOT_CONFIGURED')
      assert.equal(res.headers.get('connection'), 'close')

      const aiStatusRes = await call('GET', '/echelle/ai')
      assert.equal(aiStatusRes.data.asr, false)
    })
  })

  it('reports asr: true in /echelle/ai when configured', async () => {
    await withTestServer({ deepgramApiKey: SECRET_KEY }, async (call) => {
      const aiStatusRes = await call('GET', '/echelle/ai')
      assert.equal(aiStatusRes.data.asr, true)
    })
  })

  it('succeeds with fake fetch and never exposes DEEPGRAM_API_KEY', async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({
        metadata: { duration: 3.2 },
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: 'Bonjour',
                  words: [{ word: 'bonjour', punctuated_word: 'Bonjour', start: 0.1, end: 0.8, confidence: 0.99 }],
                },
              ],
            },
          ],
        },
      }),
    })

    await withTestServer({ asrFetchImpl: fakeFetch }, async (call) => {
      const res = await call('POST', '/speech/transcribe', {
        body: Buffer.from('audio-data'),
        contentType: 'audio/webm;codecs=opus',
      })
      assert.equal(res.status, 200)
      assert.equal(res.data.transcript, 'Bonjour')
      assert.equal(res.data.durationSeconds, 3.2)
      assert.equal(res.data.metrics.wordCount, 1)
      assert.equal(res.data.metrics.intelligibility, 'clear')

      // Assert secret key is nowhere in JSON response
      const rawJson = JSON.stringify(res.data)
      assert.doesNotMatch(rawJson, new RegExp(SECRET_KEY))
    })
  })

  it('enforces actor rate limit', async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({
        metadata: { duration: 1.0 },
        results: { channels: [{ alternatives: [{ transcript: 'test', words: [] }] }] },
      }),
    })

    const customLimits = [{ scope: 'actor', limit: 2, windowMs: 60_000, blockMs: 60_000 }]
    await withTestServer({ asrFetchImpl: fakeFetch, asrLimits: customLimits }, async (call) => {
      const res1 = await call('POST', '/speech/transcribe', { body: Buffer.from('audio'), contentType: 'audio/webm' })
      assert.equal(res1.status, 200)
      const res2 = await call('POST', '/speech/transcribe', { body: Buffer.from('audio'), contentType: 'audio/webm' })
      assert.equal(res2.status, 200)

      const blocked = await call('POST', '/speech/transcribe', { body: Buffer.from('audio'), contentType: 'audio/webm' })
      assert.equal(blocked.status, 429)
      assert.equal(blocked.data.code, 'ASR_RATE_LIMITED')
      assert.equal(blocked.data.scope, 'actor')
    })
  })

  it('enforces site-wide daily cap limit', async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({
        metadata: { duration: 1.0 },
        results: { channels: [{ alternatives: [{ transcript: 'test', words: [] }] }] },
      }),
    })

    const customLimits = asrRateLimits({ STUDY_ASR_DAILY_LIMIT: '1' })
    await withTestServer({ asrFetchImpl: fakeFetch, asrLimits: customLimits }, async (call) => {
      const res1 = await call('POST', '/speech/transcribe', { body: Buffer.from('audio'), contentType: 'audio/webm' })
      assert.equal(res1.status, 200)

      const blocked = await call('POST', '/speech/transcribe', { body: Buffer.from('audio'), contentType: 'audio/webm' })
      assert.equal(blocked.status, 429)
      assert.equal(blocked.data.code, 'ASR_RATE_LIMITED')
      assert.equal(blocked.data.scope, 'global')
    })
  })
})
