import { TCF_LISTENING_QUESTIONS } from '../src/resources/tcfMock.ts'
import { TCF_LISTENING_SET_B } from '../src/resources/tcfMockSetB.ts'
import {
  resolveListeningAudioCandidates,
  setListeningManifestCacheForTest,
  lookupListeningAudioCandidates,
} from '../src/services/tcfListeningAudio.ts'
import {
  DEFAULT_SPEAKING_RATE,
  DEFAULT_VOICE_A,
  DEFAULT_VOICE_B,
  TCF_LISTENING_BASE_URL,
  TCF_LISTENING_VERSION,
  applyTtsSentenceFixes,
  assignListeningVoice,
  computeListeningAudioUrl,
  computeListeningKey,
  computeListeningKeyForQuestion,
  computeListeningObjectPath,
  formatTtsSpokenText,
  getQuestionTurns,
  mirrorListeningPath,
  splitTurns,
} from '../src/utils/tcfListeningAudioKey.mjs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import test from 'node:test'

test('constants match expected values', () => {
  assert.equal(TCF_LISTENING_VERSION, 'v1')
  assert.equal(DEFAULT_VOICE_A, 'fr-CA-Chirp3-HD-Achird')
  assert.equal(DEFAULT_VOICE_B, 'fr-CA-Chirp3-HD-Aoede')
  assert.equal(DEFAULT_SPEAKING_RATE, 0.95)
  assert.equal(TCF_LISTENING_BASE_URL, 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2')
})

test('turn splitting breaks on em-dash and strips leading dash and spaces', () => {
  const dialogue2Turns = '— Bonjour, je voudrais deux billets pour le film de vingt heures. — Il ne reste que des places au premier rang.'
  const turns2 = splitTurns(dialogue2Turns)
  assert.equal(turns2.length, 2)
  assert.equal(turns2[0], 'Bonjour, je voudrais deux billets pour le film de vingt heures.')
  assert.equal(turns2[1], 'Il ne reste que des places au premier rang.')

  const dialogue3Turns = "— Bonjour, un café et un croissant, s'il vous plaît. — Sur place ou à emporter ? — À emporter, merci."
  const turns3 = splitTurns(dialogue3Turns)
  assert.equal(turns3.length, 3)
  assert.equal(turns3[0], "Bonjour, un café et un croissant, s'il vous plaît.")
  assert.equal(turns3[1], 'Sur place ou à emporter ?')
  assert.equal(turns3[2], 'À emporter, merci.')

  const monologue = 'Attention, le train à destination de Montréal partira exceptionnellement de la voie douze au lieu de la voie huit.'
  const turnsMono = splitTurns(monologue)
  assert.equal(turnsMono.length, 1)
  assert.equal(turnsMono[0], monologue)

  assert.deepEqual(splitTurns(''), [])
  assert.deepEqual(splitTurns(null), [])
  assert.deepEqual(splitTurns(undefined), [])
})

test('voice assignment follows alternating dialogue turns and announcement monologues', () => {
  // Dialogue: turn 0 = male (Achird), turn 1 = female (Aoede), turn 2 = male (Achird)
  assert.equal(assignListeningVoice('dialogue', 0, true), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('dialogue', 1, true), DEFAULT_VOICE_B)
  assert.equal(assignListeningVoice('dialogue', 2, true), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('dialogue', 3, true), DEFAULT_VOICE_B)

  // Monologue: announcement = female (Aoede)
  assert.equal(assignListeningVoice('announcement', 0, false), DEFAULT_VOICE_B)
  assert.equal(assignListeningVoice('annonce', 0, false), DEFAULT_VOICE_B)

  // Monologue: others = male (Achird)
  assert.equal(assignListeningVoice('voicemail', 0, false), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('news', 0, false), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('opinion', 0, false), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('practical', 0, false), DEFAULT_VOICE_A)
  assert.equal(assignListeningVoice('message', 0, false), DEFAULT_VOICE_A)

  // Custom voices via overrides
  assert.equal(assignListeningVoice('dialogue', 0, true, 'custom-male', 'custom-female'), 'custom-male')
  assert.equal(assignListeningVoice('dialogue', 1, true, 'custom-male', 'custom-female'), 'custom-female')
  assert.equal(assignListeningVoice('announcement', 0, false, 'custom-male', 'custom-female'), 'custom-female')
  assert.equal(assignListeningVoice('voicemail', 0, false, 'custom-male', 'custom-female'), 'custom-male')
})

test('getQuestionTurns breaks question into structured turns with assigned voices', () => {
  const dialogueQ = {
    type: 'dialogue',
    audioText: '— Tu viens samedi ? — Non, je garde mon frère.',
  }
  const turns = getQuestionTurns(dialogueQ)
  assert.equal(turns.length, 2)
  assert.deepEqual(turns[0], {
    index: 0,
    text: 'Tu viens samedi ?',
    voice: DEFAULT_VOICE_A,
  })
  assert.deepEqual(turns[1], {
    index: 1,
    text: 'Non, je garde mon frère.',
    voice: DEFAULT_VOICE_B,
  })

  const announcementQ = {
    type: 'announcement',
    audioText: 'Le magasin fermera ses portes dans quinze minutes.',
  }
  const monoTurns = getQuestionTurns(announcementQ)
  assert.equal(monoTurns.length, 1)
  assert.deepEqual(monoTurns[0], {
    index: 0,
    text: 'Le magasin fermera ses portes dans quinze minutes.',
    voice: DEFAULT_VOICE_B,
  })
})

test('key computation is deterministic, 16 hex characters, and matches node crypto sha256', () => {
  const sampleQuestion = {
    id: 'co-01',
    type: 'dialogue',
    audioText: '— Bonjour, je voudrais deux billets. — Il ne reste que le premier rang.',
  }

  const key1 = computeListeningKeyForQuestion(sampleQuestion)
  const key2 = computeListeningKeyForQuestion(sampleQuestion)
  assert.equal(key1, key2, 'Key must be deterministic')
  assert.equal(key1.length, 16)
  assert.match(key1, /^[0-9a-f]{16}$/)

  // Verify against independent Node crypto sha256
  const turns = getQuestionTurns(sampleQuestion)
  const voicesStr = turns.map((t) => t.voice).join('+')
  const expectedRaw = `v1|${voicesStr}|0.95|${sampleQuestion.audioText.trim()}`
  const expectedHash = crypto.createHash('sha256').update(expectedRaw).digest('hex').slice(0, 16)
  assert.equal(key1, expectedHash)

  // Changing text changes key
  const keyDiffText = computeListeningKeyForQuestion({
    ...sampleQuestion,
    audioText: '— Bonjour, trois billets s’il vous plaît. — Très bien.',
  })
  assert.notEqual(key1, keyDiffText)

  // Changing rate changes key
  const keyDiffRate = computeListeningKeyForQuestion(sampleQuestion, { rate: 1.0 })
  assert.notEqual(key1, keyDiffRate)

  // Changing voices changes key
  const keyDiffVoice = computeListeningKeyForQuestion(sampleQuestion, {
    voiceA: 'different-voice-a',
  })
  assert.notEqual(key1, keyDiffVoice)

  // Changing version changes key
  const keyDiffVersion = computeListeningKeyForQuestion(sampleQuestion, { version: 'v2' })
  assert.notEqual(key1, keyDiffVersion)
})

test('path helpers build expected GCS and mirror paths', () => {
  const key = 'f5be9877faf3ae9a'
  assert.equal(computeListeningObjectPath(key), 'listening/v1/f5be9877faf3ae9a.mp3')
  assert.equal(computeListeningObjectPath(key, 'v2'), 'listening/v2/f5be9877faf3ae9a.mp3')
  assert.equal(mirrorListeningPath(key), 'listening/v1/f5be9877faf3ae9a.mp3')

  assert.equal(
    computeListeningAudioUrl(TCF_LISTENING_BASE_URL, key),
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/listening/v1/f5be9877faf3ae9a.mp3',
  )
  assert.equal(
    computeListeningAudioUrl(`${TCF_LISTENING_BASE_URL}/`, key),
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/listening/v1/f5be9877faf3ae9a.mp3',
  )
})

test('resolveListeningAudioCandidates returns candidate URLs in exact priority order', () => {
  const mockManifest = {
    version: 'v1',
    base: 'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2',
    items: {
      'co-01': 'f5be9877faf3ae9a',
      'co-b01': '7d7f19fcfc7d704d',
    },
  }

  const candidates01 = resolveListeningAudioCandidates('co-01', mockManifest)
  assert.deepEqual(candidates01, [
    '/voice-audio/listening/v1/f5be9877faf3ae9a.mp3',
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/listening/v1/f5be9877faf3ae9a.mp3',
  ])

  const candidatesB01 = resolveListeningAudioCandidates('co-b01', mockManifest)
  assert.deepEqual(candidatesB01, [
    '/voice-audio/listening/v1/7d7f19fcfc7d704d.mp3',
    'https://storage.googleapis.com/tcf-voice-tcf-canada-5b8c2/listening/v1/7d7f19fcfc7d704d.mp3',
  ])

  // Missing question returns empty candidates
  assert.deepEqual(resolveListeningAudioCandidates('co-99', mockManifest), [])
  assert.deepEqual(resolveListeningAudioCandidates('co-01', null), [])
  assert.deepEqual(resolveListeningAudioCandidates('co-01', { version: 'v1', base: '', items: {} }), [])
})

test('lookupListeningAudioCandidates uses injected test cache correctly', async () => {
  const mockManifest = {
    version: 'v1',
    base: 'https://storage.googleapis.com/test-bucket',
    items: {
      'co-02': '5b203e22fb29ec3c',
    },
  }

  setListeningManifestCacheForTest(mockManifest)
  const candidates = await lookupListeningAudioCandidates('co-02')
  assert.deepEqual(candidates, [
    '/voice-audio/listening/v1/5b203e22fb29ec3c.mp3',
    'https://storage.googleapis.com/test-bucket/listening/v1/5b203e22fb29ec3c.mp3',
  ])

  const missing = await lookupListeningAudioCandidates('co-999')
  assert.deepEqual(missing, [])

  // Clear test cache
  setListeningManifestCacheForTest(null)
})

test('all 78 listening questions across Set A and Set B process cleanly with distinct keys', () => {
  assert.equal(TCF_LISTENING_QUESTIONS.length, 39, 'Set A should have 39 questions')
  assert.equal(TCF_LISTENING_SET_B.length, 39, 'Set B should have 39 questions')

  const all = [...TCF_LISTENING_QUESTIONS, ...TCF_LISTENING_SET_B]
  assert.equal(all.length, 78)

  const idSet = new Set()
  for (const q of all) {
    assert.ok(q.id, 'Question must have id')
    assert.ok(!idSet.has(q.id), `Duplicate question id found: ${q.id}`)
    idSet.add(q.id)

    assert.ok(typeof q.audioText === 'string' && q.audioText.length > 0, `Missing audioText for ${q.id}`)
    const turns = getQuestionTurns(q)
    assert.ok(turns.length >= 1, `Must have at least 1 turn for ${q.id}`)

    const key = computeListeningKeyForQuestion(q)
    assert.match(key, /^[0-9a-f]{16}$/, `Invalid key generated for ${q.id}: ${key}`)
  }
})

test('committed public/voice/tcf-listening-manifest.json is valid JSON with 78 items', () => {
  const manifestPath = 'public/voice/tcf-listening-manifest.json'
  assert.ok(fs.existsSync(manifestPath), `${manifestPath} must exist`)
  const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(content.version, 'v1')
  assert.equal(content.base, TCF_LISTENING_BASE_URL)
  assert.equal(Object.keys(content.items).length, 78)
})

test('applyTtsSentenceFixes preserves elisions, formatTtsSpokenText produces SSML, and keys are preserved for unaffected questions', () => {
  assert.equal(applyTtsSentenceFixes('s’épanouir'), 's’épanouir')
  assert.equal(applyTtsSentenceFixes('l’école'), 'l’école')
  assert.equal(applyTtsSentenceFixes('qu’il'), 'qu’il')
  assert.equal(applyTtsSentenceFixes('jusqu’à'), 'jusqu’à')
  assert.equal(applyTtsSentenceFixes('L’Ontario'), 'L’Ontario')
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')

  assert.equal(formatTtsSpokenText('s’épanouir'), '<speak><phoneme alphabet="ipa" ph="sepanwiʁ">s’épanouir</phoneme></speak>')
  assert.equal(formatTtsSpokenText('l’école'), '<speak><phoneme alphabet="ipa" ph="lekɔl">l’école</phoneme></speak>')

  assert.equal(applyTtsSentenceFixes('Je réévalue'), 'Je ré-évalue')
  assert.equal(applyTtsSentenceFixes('Je réévalue immédiatement la matrice'), 'Je ré-évalue immédiatement la matrice')
  assert.equal(applyTtsSentenceFixes('un cadre préétabli'), 'un cadre préétabli')
  assert.equal(applyTtsSentenceFixes('rééquilibrage'), 'rééquilibrage')
  assert.equal(applyTtsSentenceFixes('réédition'), 'réédition')
  assert.equal(applyTtsSentenceFixes('l’réévaluation'), 'l’ré-évaluation')

  const all = [...TCF_LISTENING_QUESTIONS, ...TCF_LISTENING_SET_B]
  assert.equal(all.length, 78)

  const manifestPath = 'public/voice/tcf-listening-manifest.json'
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const elisionRegex = /\b(jusqu|lorsqu|puisqu|quoiqu|presqu|aujourd|qu|[cdjlmnst])['’](?=[aàâäeéèêëiîïoôöuùûüyÿæœh])/iu

  let changedCount = 0
  let unchangedCount = 0

  for (const q of all) {
    const hasReevalu = /réévalu/i.test(q.audioText || '')
    assert.equal(hasReevalu, false, `Question ${q.id} contains réévalu`)
    const hasElision = elisionRegex.test(q.audioText || '')
    const key = computeListeningKeyForQuestion(q)

    assert.equal(key, manifest.items[q.id], `Key mismatch for question ${q.id}: ${key} !== ${manifest.items[q.id]}`)

    if (hasElision) {
      changedCount++
    } else {
      unchangedCount++
    }
  }

  assert.equal(changedCount, 54)
  assert.equal(unchangedCount, 24)
})
