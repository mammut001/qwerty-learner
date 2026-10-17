import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  DEFAULT_FEMALE_VOICE,
  DEFAULT_MALE_VOICE,
  assignPassageSentenceVoice,
  computeIntensiveKey,
  computeIntensiveObjectPath,
  concatenateMp3Buffers,
  parseMp3Duration,
} from '../src/utils/intensiveListeningAudioKey.mjs'
import { mirrorIntensivePath } from '../src/utils/voiceMirror.mjs'

test('computeIntensiveKey produces 16 hex chars and is deterministic', () => {
  const passage = {
    id: 'test-passage',
    speakers: { A: 'female' },
    sentences: [
      { speaker: 'A', fr: 'Bonjour tout le monde.' },
      { speaker: 'A', fr: 'Comment ça va ?' },
    ],
  }

  const key1 = computeIntensiveKey(passage)
  const key2 = computeIntensiveKey(passage)
  assert.equal(typeof key1, 'string')
  assert.equal(key1.length, 16)
  assert.match(key1, /^[0-9a-f]{16}$/)
  assert.equal(key1, key2)

  // Changing text produces different key
  const modified = {
    ...passage,
    sentences: [{ speaker: 'A', fr: 'Bonjour à tous.' }],
  }
  const keyModified = computeIntensiveKey(modified)
  assert.notEqual(key1, keyModified)

  // Changing rate produces different key
  const keyRate = computeIntensiveKey(passage, { rate: 1.0 })
  assert.notEqual(key1, keyRate)
})

test('assignPassageSentenceVoice assigns male/female Chirp voices appropriately', () => {
  const monologueFemale = {
    id: 'mono',
    speakers: { A: 'female' },
  }
  assert.equal(
    assignPassageSentenceVoice(monologueFemale, { speaker: 'A', fr: 'Test' }),
    DEFAULT_FEMALE_VOICE,
  )

  const dialogue = {
    id: 'dialogue',
    speakers: { A: 'female', B: 'male' },
  }
  assert.equal(
    assignPassageSentenceVoice(dialogue, { speaker: 'A', fr: 'Test' }),
    DEFAULT_FEMALE_VOICE,
  )
  assert.equal(
    assignPassageSentenceVoice(dialogue, { speaker: 'B', fr: 'Test' }),
    DEFAULT_MALE_VOICE,
  )
})

test('computeIntensiveObjectPath and mirrorIntensivePath align', () => {
  const key = 'a1b2c3d4e5f67890'
  assert.equal(computeIntensiveObjectPath(key), 'intensive/v1/a1b2c3d4e5f67890.mp3')
  assert.equal(mirrorIntensivePath(key), 'intensive/v1/a1b2c3d4e5f67890.mp3')
})

test('parseMp3Duration accurately parses existing MP3 fixtures and empty buffers', () => {
  assert.equal(parseMp3Duration(Buffer.alloc(0)).duration, 0)
  assert.equal(parseMp3Duration(null).duration, 0)

  const samplePath = path.resolve('public/sounds/key-sound/Topre.mp3')
  if (fs.existsSync(samplePath)) {
    const buf = fs.readFileSync(samplePath)
    const result = parseMp3Duration(buf)
    assert.ok(result.duration > 0.1 && result.duration < 0.2)
    assert.ok(result.frameCount >= 4)
    assert.equal(result.sampleRate, 44100)
  }
})

test('concatenateMp3Buffers combines multiple chunks', () => {
  const b1 = Buffer.from([1, 2, 3])
  const b2 = Buffer.from([4, 5])
  const combined = concatenateMp3Buffers([b1, b2])
  assert.equal(combined.length, 5)
  assert.deepEqual([...combined], [1, 2, 3, 4, 5])
})

test('intensive listening manifest exists and is valid empty JSON', () => {
  const manifestPath = path.resolve('public/voice/intensive-listening-manifest.json')
  assert.ok(fs.existsSync(manifestPath))
  const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(data.version, 'v1')
  assert.ok(typeof data.items === 'object')
  assert.equal(Object.keys(data.items).length, 0)
})
