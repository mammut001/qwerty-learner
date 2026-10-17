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
import ttsSpokenOverridesJs from '../src/utils/ttsSpokenOverrides.mjs'
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

test('spokenTextFor formats elision with SSML phoneme, respects manual overrides, and handles missing IPA', () => {
  // à l'époque (both accents) returns SSML with phoneme for l’époque
  assert.equal(spokenTextFor("à l'époque", 'fr-CA'), '<speak>à <phoneme alphabet="ipa" ph="lepɔk">l\'époque</phoneme></speak>')
  assert.equal(spokenTextFor("à l'époque", 'fr-FR'), '<speak>à <phoneme alphabet="ipa" ph="lepɔk">l\'époque</phoneme></speak>')

  // Manual override still wins
  assert.equal(spokenTextFor("à l'âge de", 'fr-CA'), 'à lâge de')
  assert.equal(spokenTextFor("à l'âge de", 'fr-FR'), 'à lâge de')
  assert.equal(spokenTextFor("à l'ère du numérique", 'fr-CA'), 'à lère du numérique')
  assert.equal(spokenTextFor("à l'ère du numérique", 'fr-FR'), 'à lère du numérique')
  assert.equal(spokenTextFor("s'évanouir", 'fr-CA'), 'sévanouir')
  assert.equal(spokenTextFor("s'établir", 'fr-CA'), '<speak><phoneme alphabet="ipa" ph="setabliʁ">s\'établir</phoneme></speak>')
  assert.equal(spokenTextFor("s'établir", 'fr-FR'), '<speak><phoneme alphabet="ipa" ph="setabliʁ">s\'établir</phoneme></speak>')

  // Only fr-FR overridden in ttsSpokenOverrides
  assert.equal(spokenTextFor("à l'égard de", 'fr-FR'), 'à légard de')

  // Entry with missing IPA returns plain text unchanged
  assert.equal(spokenTextFor("bourse d'études", 'fr-CA'), "bourse d'études")
  assert.equal(spokenTextFor("bourse d'études", 'fr-FR'), "bourse d'études")
  assert.equal(spokenTextFor("en d'autres termes", 'fr-CA'), "en d'autres termes")

  // Unaffected entries without elision return standard speakableText
  assert.equal(spokenTextFor('bonjour', 'fr-CA'), 'bonjour')
  assert.equal(spokenTextFor('bonjour', 'fr-FR'), 'bonjour')
})

test('computeTtsKey leaves keys unchanged for a sample of 20 non-elision words', () => {
  // Manifest keys for non-elision words must stay completely identical
  const manifest = JSON.parse(fs.readFileSync('public/voice/tts-manifest.json', 'utf8'))
  const keysCA = new Set(manifest.keys['fr-CA'])
  const keysFR = new Set(manifest.keys['fr-FR'])

  const nonElision20Samples = [
    { text: 'bonjour', keyCA: 'e0342494f2047283', keyFR: 'a427720688bd67c6' },
    { text: 'Montréal', keyCA: 'b96f9c1a9f1127b6', keyFR: '370c09e4e22bd558' },
    { text: 'restaurant', keyCA: '8425e6686641602f', keyFR: 'ffd6b4e8c7aa0d95' },
    { text: 'café', keyCA: 'b78ade9c09245929', keyFR: 'afb5a89812308f49' },
    { text: 'merci', keyCA: '7ea236bcf80a6146', keyFR: '19d8268c1bfed6ea' },
    { text: 'château', keyCA: '990a7c6dd9594682', keyFR: 'fae305210f1c5d14' },
    { text: 'maison', keyCA: '6f4c5eb09883c00e', keyFR: '2225364f4bbd5612' },
    { text: 'travail', keyCA: '3ea8b307657712a9', keyFR: '9f7726720423dfba' },
    { text: 'voiture', keyCA: '3eade91ffda66f38', keyFR: '2923e99836132c09' },
    { text: 'train', keyCA: 'b393cccb44cdbf8d', keyFR: 'a118f332e932b6b7' },
    { text: 'gare', keyCA: 'dc72faa86f36ec26', keyFR: '744686db54c267f0' },
    { text: 'famille', keyCA: '4a4742cfd020a4c0', keyFR: 'cb1b66fdc5867dc0' },
    { text: 'école', keyCA: '970dd9ff6c2c1357', keyFR: '89f155e80ff7bb3d' },
    { text: 'santé', keyCA: 'e04c2c42081fa41d', keyFR: 'dd3299979e6be796' },
    { text: 'voyage', keyCA: '9dccb4f54ed5136b', keyFR: '3b17211892cd7067' },
    { text: 'vacances', keyCA: '7d80f234a3e3c056', keyFR: '4d9ba28b3b37d09f' },
    { text: 'musique', keyCA: 'addb47be08702e6b', keyFR: '138e4653093fc9ac' },
    { text: 'cinéma', keyCA: '583ec48e449c58a7', keyFR: 'd0bf2ce644f909c3' },
    { text: 'livre', keyCA: '3e18e5c74d2c105e', keyFR: '53c1261a9822c97f' },
    { text: 'journal', keyCA: 'dff47e5e2f809e83', keyFR: 'fcfef72e5137e691' },
  ]

  assert.equal(nonElision20Samples.length, 20)

  for (const { text, keyCA, keyFR } of nonElision20Samples) {
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

  // "à l'ère du numérique" overridden on both accents
  const ereText = "à l'ère du numérique"
  const ereKeyCA = computeTtsKey(TTS_VOICES['fr-CA'], ereText, 'fr-CA')
  const expectedEreKeyCA = crypto.createHash('sha256').update(`v1|${TTS_VOICES['fr-CA']}|à lère du numérique`).digest('hex').slice(0, 16)
  assert.equal(ereKeyCA, expectedEreKeyCA)

  // fr-FR override matches the approved take key
  const ereKeyFR = computeTtsKey(TTS_VOICES['fr-FR'], ereText, 'fr-FR')
  assert.equal(ereKeyFR, '22e12843cc45681e')
  assert.ok(keysFR.has(ereKeyFR))
})

test("approved takes for l'ère (fr-FR) and s'établir keep their audio keys", () => {
  assert.equal(computeTtsKey(TTS_VOICES['fr-FR'], "à l'ère du numérique", 'fr-FR'), '22e12843cc45681e')
  assert.equal(computeTtsKey(TTS_VOICES['fr-CA'], "s'établir", 'fr-CA'), 'f1820e0429acc8fe')
  assert.equal(computeTtsKey(TTS_VOICES['fr-FR'], "s'établir", 'fr-FR'), '3458ce155d9f4404')
})

test('ttsSpokenOverrides.mjs default export matches ttsSpokenOverrides.json', () => {
  const json = JSON.parse(fs.readFileSync('src/utils/ttsSpokenOverrides.json', 'utf8'))
  assert.deepEqual(ttsSpokenOverridesJs, json)
})

test('ttsExclude.mjs export matches scripts/tts-exclude.json and isTtsExcluded works', async () => {
  const { TTS_EXCLUDED_WORDS, isTtsExcluded } = await import('../src/utils/ttsExclude.mjs')
  const json = JSON.parse(fs.readFileSync('scripts/tts-exclude.json', 'utf8'))
  assert.deepEqual(TTS_EXCLUDED_WORDS, json)
  assert.equal(isTtsExcluded('à'), true)
  assert.equal(isTtsExcluded(' à '), true)
  assert.equal(isTtsExcluded('bonjour'), false)
})

test('ttsElisionIpa.mjs default export matches ttsElisionIpa.json', async () => {
  const { default: ttsElisionIpaJs } = await import('../src/utils/ttsElisionIpa.mjs')
  const json = JSON.parse(fs.readFileSync('src/utils/ttsElisionIpa.json', 'utf8'))
  assert.deepEqual(ttsElisionIpaJs, json)
})
