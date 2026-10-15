import {
  DEFAULT_ACCENT,
  TTS_BASE_URL,
  TTS_VERSION,
  TTS_VOICES,
  computeTtsAudioUrl,
  computeTtsKey,
  computeTtsObjectPath,
  speakableText,
} from '../src/utils/ttsKey.mjs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'

test('ttsKey constants match configuration', () => {
  assert.equal(TTS_VERSION, 'v1')
  assert.equal(DEFAULT_ACCENT, 'fr-CA')
  assert.equal(TTS_VOICES['fr-CA'], 'fr-CA-Chirp3-HD-Achird')
  assert.equal(TTS_VOICES['fr-FR'], 'fr-FR-Chirp3-HD-Achird')
  assert.equal(TTS_BASE_URL, 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2')
})

test('speakableText normalises placeholder symbols and gender markers across 18 entries', () => {
  const cases = [
    { input: 'Je vous prie de + infinitif', expected: 'Je vous prie de' },
    { input: 'Je vous souhaite + nom', expected: 'Je vous souhaite' },
    { input: 'Pourriez-vous + infinitif ?', expected: 'Pourriez-vous ?' },
    { input: 'afin de / que', expected: 'afin de, afin que' },
    { input: 'aller + infinitif', expected: 'aller' },
    { input: 'aller à + ville', expected: 'aller à' },
    { input: 'commencer à + infinitif', expected: 'commencer à' },
    { input: 'de peur de / que', expected: 'de peur de, de peur que' },
    { input: 'dès que + indicatif', expected: 'dès que' },
    { input: 'il faut + infinitif', expected: 'il faut' },
    { input: 'il y a + durée', expected: 'il y a' },
    { input: 'je me suis peut-être mal expliqué(e)', expected: 'je me suis peut-être mal expliqué' },
    { input: 'je ne suis pas sûr(e) que…', expected: 'je ne suis pas sûr que…' },
    { input: 'je suis absolument persuadé(e) que…', expected: 'je suis absolument persuadé que…' },
    { input: "m'a doté(e) de…", expected: "m'a doté de…" },
    { input: 'tu aurais dû + infinitif', expected: 'tu aurais dû' },
    { input: 'venir de + infinitif', expected: 'venir de' },
    { input: 'être vivement intéressé(e) par', expected: 'être vivement intéressé par' },
  ]

  for (const { input, expected } of cases) {
    assert.equal(speakableText(input), expected, `Failed normalising "${input}"`)
  }
})

test('speakableText leaves unchanged plain words untouched', () => {
  const plainWords = [
    'bonjour',
    'Paris',
    'Montréal',
    'château',
    "c'est-à-dire",
    'l’été dernier',
    'aujourd’hui',
    'Société & Environnement',
    'œuvre',
    'restaurant',
    'café',
  ]

  for (const word of plainWords) {
    assert.equal(speakableText(word), word, `Plain word altered: "${word}"`)
  }
})

test('computeTtsKey matches node:crypto sha256 on speakableText', () => {
  const sampleTexts = [
    'bonjour',
    'Montréal',
    'Je vous prie de + infinitif',
    'Pourriez-vous + infinitif ?',
    'afin de / que',
    'je ne suis pas sûr(e) que…',
    'être vivement intéressé(e) par',
  ]

  for (const accent of ['fr-CA', 'fr-FR']) {
    const voice = TTS_VOICES[accent]
    for (const text of sampleTexts) {
      const actual = computeTtsKey(voice, text)
      const spoken = speakableText(text)
      const expected = crypto.createHash('sha256').update(`v1|${voice}|${spoken}`).digest('hex').slice(0, 16)
      assert.equal(actual, expected, `Mismatch for text "${text}" with voice "${voice}"`)
      assert.equal(actual.length, 16)
      assert.match(actual, /^[0-9a-f]{16}$/)
    }
  }
})

test('computeTtsObjectPath and computeTtsAudioUrl build expected paths', () => {
  const key = 'e0342494f2047283'
  assert.equal(computeTtsObjectPath('fr-CA', key), 'v1/fr-CA/e0342494f2047283.mp3')
  assert.equal(computeTtsObjectPath('fr-FR', key), 'v1/fr-FR/e0342494f2047283.mp3')

  assert.equal(
    computeTtsAudioUrl('https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2', 'fr-CA', key),
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/v1/fr-CA/e0342494f2047283.mp3',
  )
  assert.equal(
    computeTtsAudioUrl('https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/', 'fr-FR', key),
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/v1/fr-FR/e0342494f2047283.mp3',
  )
})
