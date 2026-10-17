import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  DEFAULT_FEMALE_VOICE,
  DEFAULT_MALE_VOICE,
  applyTtsSentenceFixes,
  assignPassageSentenceVoice,
  computeIntensiveKey,
  computeIntensiveObjectPath,
  concatenateMp3Buffers,
  parseMp3Duration,
} from '../src/utils/intensiveListeningAudioKey.mjs'
import { mirrorIntensivePath } from '../src/utils/voiceMirror.mjs'
import { INTENSIVE_PASSAGES } from '../src/resources/intensiveListening.ts'

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

test('intensive listening manifest is valid and consistent with passages', () => {
  const manifestPath = path.resolve('public/voice/intensive-listening-manifest.json')
  assert.ok(fs.existsSync(manifestPath))
  const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(data.version, 'v1')
  assert.ok(typeof data.items === 'object' && data.items !== null)

  const passageMap = new Map(INTENSIVE_PASSAGES.map((p) => [p.id, p]))
  const itemEntries = Object.entries(data.items)
  assert.ok(itemEntries.length > 0)

  for (const [passageId, item] of itemEntries) {
    const passage = passageMap.get(passageId)
    assert.ok(passage, `Passage not found in intensiveListening.ts: ${passageId}`)
    assert.match(item.key, /^[0-9a-f]{16}$/)
    assert.ok(Array.isArray(item.segments))
    assert.equal(
      item.segments.length,
      passage.sentences.length,
      `Segments count mismatch for ${passageId}`,
    )

    let lastEnd = 0
    for (let i = 0; i < item.segments.length; i++) {
      const seg = item.segments[i]
      assert.ok(
        seg.start < seg.end,
        `Segment start must be < end in ${passageId} index ${i}: [${seg.start}, ${seg.end}]`,
      )
      if (i > 0) {
        assert.ok(
          seg.start >= lastEnd,
          `Segments must be increasing and non-overlapping in ${passageId} index ${i}: start ${seg.start} < lastEnd ${lastEnd}`,
        )
      }
      lastEnd = seg.end
    }
  }
})

test('applyTtsSentenceFixes fixes spoken text and updates key for passages with réévalu and elisions', () => {
  assert.equal(applyTtsSentenceFixes('s’épanouir'), 'sépanouir')
  assert.equal(applyTtsSentenceFixes('l’école'), 'lécole')
  assert.equal(applyTtsSentenceFixes('qu’il'), 'quil')
  assert.equal(applyTtsSentenceFixes('jusqu’à'), 'jusquà')
  assert.equal(applyTtsSentenceFixes('L’Ontario'), 'LOntario')
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')

  assert.equal(applyTtsSentenceFixes('Je réévalue'), 'Je ré-évalue')
  assert.equal(applyTtsSentenceFixes('Je réévalue immédiatement la matrice'), 'Je ré-évalue immédiatement la matrice')
  assert.equal(applyTtsSentenceFixes('un cadre préétabli'), 'un cadre préétabli')
  assert.equal(applyTtsSentenceFixes('rééquilibrage'), 'rééquilibrage')
  assert.equal(applyTtsSentenceFixes('réédition'), 'réédition')
  assert.equal(applyTtsSentenceFixes('l’réévaluation'), 'l’ré-évaluation')

  const reevaluPassages = INTENSIVE_PASSAGES.filter((p) =>
    p.sentences.some((s) => /réévalu/i.test(s.fr)),
  )
  assert.equal(reevaluPassages.length, 1)
  assert.equal(reevaluPassages[0].id, 'entrevue-embauche-montreal')
})
