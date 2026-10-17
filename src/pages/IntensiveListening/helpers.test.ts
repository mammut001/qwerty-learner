import {
  cycleSpeed,
  findCurrentSentenceIndex,
  formatSeconds,
  getNextSentenceIndex,
  getPrevSentenceIndex,
  normalizeLookupWord,
  resolveIntensiveAudioCandidates,
  shouldFallbackAudioCandidate,
  shouldLoopCurrentSentence,
} from './helpers'
import assert from 'node:assert/strict'
import test from 'node:test'

test('findCurrentSentenceIndex returns correct indices via binary search', () => {
  const segments = [
    { start: 0.0, end: 3.5 },
    { start: 3.5, end: 7.2 },
    { start: 7.2, end: 11.0 },
    { start: 11.0, end: 15.8 },
  ]

  // Edge cases
  assert.equal(findCurrentSentenceIndex(0, []), -1)
  assert.equal(findCurrentSentenceIndex(-1.0, segments), 0)
  assert.equal(findCurrentSentenceIndex(0.0, segments), 0)
  assert.equal(findCurrentSentenceIndex(2.0, segments), 0)

  // Transition boundaries
  assert.equal(findCurrentSentenceIndex(3.499, segments), 0)
  assert.equal(findCurrentSentenceIndex(3.5, segments), 1)
  assert.equal(findCurrentSentenceIndex(5.0, segments), 1)

  assert.equal(findCurrentSentenceIndex(7.2, segments), 2)
  assert.equal(findCurrentSentenceIndex(9.0, segments), 2)

  assert.equal(findCurrentSentenceIndex(11.0, segments), 3)
  assert.equal(findCurrentSentenceIndex(15.799, segments), 3)

  // Beyond last segment
  assert.equal(findCurrentSentenceIndex(15.8, segments), 3)
  assert.equal(findCurrentSentenceIndex(20.0, segments), 3)
})

test('getNextSentenceIndex and getPrevSentenceIndex clamp within boundaries', () => {
  assert.equal(getNextSentenceIndex(0, 5), 1)
  assert.equal(getNextSentenceIndex(3, 5), 4)
  assert.equal(getNextSentenceIndex(4, 5), 4)

  assert.equal(getPrevSentenceIndex(4), 3)
  assert.equal(getPrevSentenceIndex(1), 0)
  assert.equal(getPrevSentenceIndex(0), 0)
})

test('shouldLoopCurrentSentence correctly detects segment boundary during loop mode', () => {
  const segment = { start: 2.0, end: 6.0 }

  // When loop disabled, never loop
  assert.equal(shouldLoopCurrentSentence(5.99, segment, false), false)
  assert.equal(shouldLoopCurrentSentence(6.1, segment, false), false)

  // When segment is missing
  assert.equal(shouldLoopCurrentSentence(6.0, null, true), false)

  // When loop enabled
  assert.equal(shouldLoopCurrentSentence(3.0, segment, true), false)
  assert.equal(shouldLoopCurrentSentence(5.95, segment, true), false)
  assert.equal(shouldLoopCurrentSentence(5.97, segment, true), true)
  assert.equal(shouldLoopCurrentSentence(6.0, segment, true), true)
  assert.equal(shouldLoopCurrentSentence(6.5, segment, true), true)
})

test('cycleSpeed cycles through 0.75 -> 1 -> 1.25 -> 0.75', () => {
  assert.equal(cycleSpeed(0.75), 1)
  assert.equal(cycleSpeed(1), 1.25)
  assert.equal(cycleSpeed(1.25), 0.75)
  assert.equal(cycleSpeed(2.0), 0.75)
})

test('formatSeconds formats minutes and seconds cleanly', () => {
  assert.equal(formatSeconds(0), '00:00')
  assert.equal(formatSeconds(-5), '00:00')
  assert.equal(formatSeconds(9), '00:09')
  assert.equal(formatSeconds(65), '01:05')
  assert.equal(formatSeconds(125), '02:05')
})

test('resolveIntensiveAudioCandidates builds candidate URLs correctly', () => {
  const manifest = {
    version: 'v1',
    base: 'https://storage.googleapis.com/test-bucket',
    items: {
      'test-passage': {
        key: 'abcdef1234567890',
        segments: [{ start: 0, end: 1.5 }],
      },
    },
  }

  // Null manifest or unknown passage
  assert.deepEqual(resolveIntensiveAudioCandidates('unknown', manifest), [])
  assert.deepEqual(resolveIntensiveAudioCandidates('test-passage', null), [])

  // With mirror enabled
  const withMirror = resolveIntensiveAudioCandidates('test-passage', manifest, true)
  assert.equal(withMirror.length, 2)
  assert.equal(withMirror[0], '/voice-audio/intensive/v1/abcdef1234567890.mp3')
  assert.equal(withMirror[1], 'https://storage.googleapis.com/test-bucket/intensive/v1/abcdef1234567890.mp3')

  // With mirror disabled
  const withoutMirror = resolveIntensiveAudioCandidates('test-passage', manifest, false)
  assert.equal(withoutMirror.length, 1)
  assert.equal(withoutMirror[0], 'https://storage.googleapis.com/test-bucket/intensive/v1/abcdef1234567890.mp3')
})

test('shouldFallbackAudioCandidate only falls back on fatal errors and preserves mirror otherwise', () => {
  // Non-errors or missing error object must never fall back
  assert.equal(shouldFallbackAudioCandidate(0, 2, null), false)
  assert.equal(shouldFallbackAudioCandidate(0, 2, undefined), false)
  assert.equal(shouldFallbackAudioCandidate(0, 2, {} as unknown as { code: number }), false)

  // MEDIA_ERR_ABORTED (1) represents a canceled or superseded request, not a mirror failure
  assert.equal(shouldFallbackAudioCandidate(0, 2, { code: 1 }), false)

  // Real fatal errors: MEDIA_ERR_NETWORK (2), MEDIA_ERR_DECODE (3), MEDIA_ERR_SRC_NOT_SUPPORTED (4)
  assert.equal(shouldFallbackAudioCandidate(0, 2, { code: 2 }), true)
  assert.equal(shouldFallbackAudioCandidate(0, 2, { code: 3 }), true)
  assert.equal(shouldFallbackAudioCandidate(0, 2, { code: 4 }), true)

  // Boundary: when already on the last candidate, never fall back further
  assert.equal(shouldFallbackAudioCandidate(1, 2, { code: 2 }), false)
  assert.equal(shouldFallbackAudioCandidate(1, 2, { code: 4 }), false)
  assert.equal(shouldFallbackAudioCandidate(0, 1, { code: 4 }), false)
})

test('normalizeLookupWord normalizes punctuation, ignores elisions, keeps hyphenated words, and standardizes NFC', () => {
  // Direct words
  assert.equal(normalizeLookupWord('école'), 'école')
  assert.equal(normalizeLookupWord('café'), 'café')

  // Elisions (both straight quote and curly apostrophe)
  assert.equal(normalizeLookupWord('l’école'), 'école')
  assert.equal(normalizeLookupWord("l'école"), 'école')
  assert.equal(normalizeLookupWord('L’école'), 'école')
  assert.equal(normalizeLookupWord("L'école"), 'école')
  assert.equal(normalizeLookupWord('d’arriver'), 'arriver')
  assert.equal(normalizeLookupWord("d'arriver"), 'arriver')
  assert.equal(normalizeLookupWord('j’ai'), 'ai')
  assert.equal(normalizeLookupWord('qu’il'), 'il')
  assert.equal(normalizeLookupWord('s’adapte'), 'adapte')
  assert.equal(normalizeLookupWord('c’est'), 'est')
  assert.equal(normalizeLookupWord('n’est'), 'est')
  assert.equal(normalizeLookupWord('m’a'), 'a')
  assert.equal(normalizeLookupWord('jusqu’à'), 'à')

  // Hyphenated words kept whole
  assert.equal(normalizeLookupWord('peut-être'), 'peut-être')
  assert.equal(normalizeLookupWord('sous-couche'), 'sous-couche')
  assert.equal(normalizeLookupWord('coupe-vent'), 'coupe-vent')
  assert.equal(normalizeLookupWord('rendez-vous'), 'rendez-vous')

  // Compound/non-elided words with internal apostrophe
  assert.equal(normalizeLookupWord('aujourd’hui'), 'aujourd’hui')
  assert.equal(normalizeLookupWord("aujourd'hui"), "aujourd'hui")

  // Punctuation stripping
  assert.equal(normalizeLookupWord('l’école.'), 'école')
  assert.equal(normalizeLookupWord('«l’école»'), 'école')
  assert.equal(normalizeLookupWord('(dépanneur),'), 'dépanneur')
  assert.equal(normalizeLookupWord('peut-être !'), 'peut-être')
  assert.equal(normalizeLookupWord('...'), '')
  assert.equal(normalizeLookupWord(''), '')

  // Unicode NFC normalization
  const nfdEcole = 'e\u0301cole'
  assert.equal(normalizeLookupWord(nfdEcole), 'école')
  assert.equal(normalizeLookupWord(`l’${nfdEcole}`), 'école')
})
