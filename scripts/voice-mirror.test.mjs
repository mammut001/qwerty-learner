import { VOICE_MIRROR_PATH, mirrorOverrideFileName, mirrorOverridePath, mirrorTtsPath } from '../src/utils/voiceMirror.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'

test('mirror path constants and TTS paths follow the bucket layout', () => {
  assert.equal(VOICE_MIRROR_PATH, '/voice-audio')
  assert.equal(mirrorTtsPath('fr-CA', '0009501a932aad8e'), 'v1/fr-CA/0009501a932aad8e.mp3')
  assert.equal(mirrorTtsPath('fr-FR', 'abc'), 'v1/fr-FR/abc.mp3')
})

test('override file name is the URL-decoded last segment', () => {
  const url =
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2b/LL-Q150_%28fra%29-Pamputt-vouloir.wav/LL-Q150_%28fra%29-Pamputt-vouloir.wav.mp3'
  assert.equal(mirrorOverrideFileName(url), 'LL-Q150_(fra)-Pamputt-vouloir.wav.mp3')
})

test('override file name keeps spaces, parentheses and accented letters', () => {
  const url = 'https://upload.wikimedia.org/x/LL-Q150%20(fra)-DSwissK-acqu%C3%A9rir.wav.mp3'
  assert.equal(mirrorOverrideFileName(url), 'LL-Q150 (fra)-DSwissK-acquérir.wav.mp3')
})

test('override file name ignores query strings and fragments', () => {
  assert.equal(mirrorOverrideFileName('https://h/a/b/plain.mp3?x=1'), 'plain.mp3')
  assert.equal(mirrorOverrideFileName('https://h/a/b/plain.mp3#frag'), 'plain.mp3')
})

test('override file name returns null for empty input', () => {
  assert.equal(mirrorOverrideFileName(null), null)
  assert.equal(mirrorOverrideFileName(undefined), null)
  assert.equal(mirrorOverrideFileName(''), null)
})

test('override path is ll/ plus the encoded decoded file name', () => {
  const url = 'https://upload.wikimedia.org/x/LL-Q150_%28fra%29-Pamputt-vouloir.wav.mp3'
  assert.equal(mirrorOverridePath(url), 'll/LL-Q150_(fra)-Pamputt-vouloir.wav.mp3')
  const accented = 'https://h/LL-Q150%20(fra)-DSwissK-acqu%C3%A9rir.wav.mp3'
  assert.equal(mirrorOverridePath(accented), `ll/${encodeURIComponent('LL-Q150 (fra)-DSwissK-acquérir.wav.mp3')}`)
  assert.equal(mirrorOverridePath(accented), 'll/LL-Q150%20(fra)-DSwissK-acqu%C3%A9rir.wav.mp3')
})

test('override path returns null for empty input', () => {
  assert.equal(mirrorOverridePath(null), null)
  assert.equal(mirrorOverridePath(''), null)
})
