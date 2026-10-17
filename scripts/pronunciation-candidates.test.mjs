import {
  TTS_VOICES,
  computeTtsKey,
} from '../src/utils/ttsKey.mjs'
import {
  TTS_EXCLUDED_WORDS,
  isTtsExcluded,
} from '../src/utils/ttsExclude.mjs'
import {
  lookupPronunciationCandidates,
  lookupTtsAudioCandidates,
  lookupTtsAudioUrl,
  loadTtsManifest,
  overrideAudioCandidates,
  setVoiceOverridesCacheForTest,
} from '../src/services/frenchVoice.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

test('TTS_EXCLUDED_WORDS matches scripts/tts-exclude.json', () => {
  const json = JSON.parse(fs.readFileSync('scripts/tts-exclude.json', 'utf8'))
  assert.deepEqual(TTS_EXCLUDED_WORDS, json)
})

test('isTtsExcluded correctly identifies excluded words and trims whitespace', () => {
  assert.equal(isTtsExcluded('à'), true)
  assert.equal(isTtsExcluded(' à '), true)
  assert.equal(isTtsExcluded('bonjour'), false)
  assert.equal(isTtsExcluded('Montréal'), false)
  assert.equal(isTtsExcluded(''), false)
  assert.equal(isTtsExcluded(null), false)
  assert.equal(isTtsExcluded(undefined), false)
})

test('loadTtsManifest does not fetch and resolves null without manifest download', async () => {
  const manifest = await loadTtsManifest()
  assert.equal(manifest, null)
})

test('lookupTtsAudioCandidates derives mirror URL directly from key without GCS secondary on mirror origin', async () => {
  const caCandidates = await lookupTtsAudioCandidates('bonjour', 'fr-CA')
  const caKey = computeTtsKey(TTS_VOICES['fr-CA'], 'bonjour', 'fr-CA')
  assert.equal(caKey, 'e0342494f2047283')
  assert.deepEqual(caCandidates, [`/voice-audio/v1/fr-CA/${caKey}.mp3`])

  const frCandidates = await lookupTtsAudioCandidates('bonjour', 'fr-FR')
  const frKey = computeTtsKey(TTS_VOICES['fr-FR'], 'bonjour', 'fr-FR')
  assert.equal(frKey, 'a427720688bd67c6')
  assert.deepEqual(frCandidates, [`/voice-audio/v1/fr-FR/${frKey}.mp3`])

  const firstUrl = await lookupTtsAudioUrl('bonjour', 'fr-CA')
  assert.equal(firstUrl, `/voice-audio/v1/fr-CA/${caKey}.mp3`)
})

test('lookupTtsAudioCandidates returns empty array for excluded words', async () => {
  for (const excluded of TTS_EXCLUDED_WORDS) {
    const caCandidates = await lookupTtsAudioCandidates(excluded, 'fr-CA')
    assert.deepEqual(caCandidates, [], `Excluded word "${excluded}" must produce no Chirp candidate`)

    const frCandidates = await lookupTtsAudioCandidates(excluded, 'fr-FR')
    assert.deepEqual(frCandidates, [], `Excluded word "${excluded}" must produce no Chirp candidate`)

    const paddedCandidates = await lookupTtsAudioCandidates(`  ${excluded}  `, 'fr-CA')
    assert.deepEqual(paddedCandidates, [], `Padded excluded word "${excluded}" must produce no Chirp candidate`)

    const url = await lookupTtsAudioUrl(excluded, 'fr-CA')
    assert.equal(url, null)
  }
})

test('lookupTtsAudioCandidates returns empty array for empty or whitespace query', async () => {
  assert.deepEqual(await lookupTtsAudioCandidates('', 'fr-CA'), [])
  assert.deepEqual(await lookupTtsAudioCandidates('   ', 'fr-CA'), [])
})

test('candidate order per word prioritises Lingua Libre override, then Chirp mirror', async () => {
  const testWord = 'vouloir'
  const mockOverrideAudio = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b1/LL-Q150_%28fra%29-Pamputt-vouloir.wav/LL-Q150_%28fra%29-Pamputt-vouloir.wav.mp3'

  setVoiceOverridesCacheForTest({
    [testWord]: {
      audio: mockOverrideAudio,
      credit: 'Pamputt · Lingua Libre · CC BY-SA',
    },
  })

  try {
    const candidates = await lookupPronunciationCandidates(testWord, 'fr-CA')
    const expectedKey = computeTtsKey(TTS_VOICES['fr-CA'], testWord, 'fr-CA')

    assert.equal(candidates.length, 3)
    // 1. Lingua Libre mirror
    assert.equal(candidates[0], '/voice-audio/ll/LL-Q150_(fra)-Pamputt-vouloir.wav.mp3')
    // 2. Lingua Libre original audio
    assert.equal(candidates[1], mockOverrideAudio)
    // 3. Same-origin mirror Chirp TTS
    assert.equal(candidates[2], `/voice-audio/v1/fr-CA/${expectedKey}.mp3`)
  } finally {
    setVoiceOverridesCacheForTest(null)
  }
})

test('words without overrides yield only the Chirp mirror candidate', async () => {
  setVoiceOverridesCacheForTest({})
  try {
    const candidates = await lookupPronunciationCandidates('bonjour', 'fr-CA')
    const key = computeTtsKey(TTS_VOICES['fr-CA'], 'bonjour', 'fr-CA')
    assert.deepEqual(candidates, [`/voice-audio/v1/fr-CA/${key}.mp3`])
  } finally {
    setVoiceOverridesCacheForTest(null)
  }
})

test('excluded words without overrides yield no clip candidates', async () => {
  setVoiceOverridesCacheForTest({})
  try {
    const candidates = await lookupPronunciationCandidates('à', 'fr-CA')
    assert.deepEqual(candidates, [])
  } finally {
    setVoiceOverridesCacheForTest(null)
  }
})

test('words with audio: null overrides yield no clip candidates (fall back to safeSpeak)', async () => {
  setVoiceOverridesCacheForTest({
    asseoir: {
      audio: null,
    },
  })
  try {
    const candidates = await lookupPronunciationCandidates('asseoir', 'fr-CA')
    assert.deepEqual(candidates, [])
  } finally {
    setVoiceOverridesCacheForTest(null)
  }
})
