import {
  DEFAULT_ACCENT,
  TTS_BASE_URL,
  TTS_VERSION,
  TTS_VOICES,
  computeTtsAudioUrl,
  computeTtsKey,
  computeTtsObjectPath,
  speakableText,
  spokenTextFor,
} from '../src/utils/ttsKey.mjs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
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

test('spokenTextFor applies overrides for specific accents and falls back to speakableText', () => {
  // Both accents overridden
  assert.equal(spokenTextFor("à l'âge de", 'fr-CA'), 'à lâge de')
  assert.equal(spokenTextFor("à l'âge de", 'fr-FR'), 'à lâge de')

  // Only fr-CA overridden
  assert.equal(spokenTextFor("à l'ère du numérique", 'fr-CA'), 'à lère du numérique')
  assert.equal(spokenTextFor("à l'ère du numérique", 'fr-FR'), "à l'ère du numérique")

  // Only fr-FR overridden
  assert.equal(spokenTextFor("à l'égard de", 'fr-CA'), "à l'égard de")
  assert.equal(spokenTextFor("à l'égard de", 'fr-FR'), 'à légard de')

  // Unaffected entries return standard speakableText
  assert.equal(spokenTextFor('bonjour', 'fr-CA'), 'bonjour')
  assert.equal(spokenTextFor('bonjour', 'fr-FR'), 'bonjour')
  assert.equal(spokenTextFor("à l'heure", 'fr-CA'), "à l'heure")
  assert.equal(spokenTextFor("à l'heure", 'fr-FR'), "à l'heure")
})

test('computeTtsKey applies accent-specific overrides and leaves unaffected keys identical', () => {
  // Manifest keys for unaffected entries must stay identical
  const manifest = JSON.parse(fs.readFileSync('public/voice/tts-manifest.json', 'utf8'))
  const keysCA = new Set(manifest.keys['fr-CA'])
  const keysFR = new Set(manifest.keys['fr-FR'])

  const unaffectedSamples = [
    { text: 'bonjour', keyCA: 'e0342494f2047283', keyFR: 'a427720688bd67c6' },
    { text: 'Montréal', keyCA: 'b96f9c1a9f1127b6', keyFR: '370c09e4e22bd558' },
    { text: "trait d'union", keyCA: 'ca5214a3e0ffbdef', keyFR: '8f78ae304047cb19' },
    { text: "s'appeler", keyCA: '055bbf74446e29a8', keyFR: 'e9d184b685f6ebdd' },
    { text: "C'est la vie.", keyCA: '9b0f97a2a7c13b23', keyFR: 'c96403fa95c69ffe' },
    { text: "l'arrivée du train", keyCA: '1dd0c98b871e9046', keyFR: 'f99668a4a3b92883' },
    { text: 'Je vous prie de + infinitif', keyCA: 'a89720ab6cda1929', keyFR: '24f3afc87466f7e8' },
    { text: "à l'heure", keyCA: 'd584007f3ad916ae', keyFR: '287b6f6435236afd' },
  ]

  for (const { text, keyCA, keyFR } of unaffectedSamples) {
    const computedCA = computeTtsKey(TTS_VOICES['fr-CA'], text, 'fr-CA')
    const computedFR = computeTtsKey(TTS_VOICES['fr-FR'], text, 'fr-FR')
    assert.equal(computedCA, keyCA, `CA key mismatch for "${text}"`)
    assert.equal(computedFR, keyFR, `FR key mismatch for "${text}"`)
    assert.ok(keysCA.has(computedCA), `Manifest missing CA key for "${text}"`)
    assert.ok(keysFR.has(computedFR), `Manifest missing FR key for "${text}"`)
  }

  // Overridden entry: fr-CA key matches hash of spoken override
  const overriddenText = "à l'âge de"
  const caKey = computeTtsKey(TTS_VOICES['fr-CA'], overriddenText, 'fr-CA')
  const expectedCaKey = crypto.createHash('sha256').update(`v1|${TTS_VOICES['fr-CA']}|à lâge de`).digest('hex').slice(0, 16)
  assert.equal(caKey, expectedCaKey)

  // Accent-specific override: "à l'ère du numérique" overridden on fr-CA, untouched on fr-FR
  const ereText = "à l'ère du numérique"
  const ereKeyCA = computeTtsKey(TTS_VOICES['fr-CA'], ereText, 'fr-CA')
  const expectedEreKeyCA = crypto.createHash('sha256').update(`v1|${TTS_VOICES['fr-CA']}|à lère du numérique`).digest('hex').slice(0, 16)
  assert.equal(ereKeyCA, expectedEreKeyCA)

  // fr-FR has no override, matches existing manifest key
  const ereKeyFR = computeTtsKey(TTS_VOICES['fr-FR'], ereText, 'fr-FR')
  assert.equal(ereKeyFR, '0d2ff88cc9e7321b')
  assert.ok(keysFR.has(ereKeyFR))
})
