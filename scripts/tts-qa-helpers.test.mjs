import {
  LONE_ELIDED_TOKENS,
  SPELLED_PUNCTUATION_TOKENS,
  classifyQaToken,
  filterIgnoredFlaggedWords,
  findFlaggedWords,
  formatIntensiveFlaggedSentence,
  formatTcfFlaggedMessage,
  getIgnoredTokens,
  hasEuphonicT,
  isFlaggedToken,
  mapFlaggedWordToIntensiveSentence,
  normalizeQaToken,
  timeToSegmentIndex,
} from '../src/utils/ttsQaHelpers.mjs'
import { QA_IGNORE_FILE, loadQaIgnoreConfig, parseArgs } from './tts-qa-deepgram.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'

test('normalizeQaToken trims, lowercases, and strips surrounding punctuation', () => {
  assert.equal(normalizeQaToken(''), '')
  assert.equal(normalizeQaToken(null), '')
  assert.equal(normalizeQaToken('  Bonjour  '), 'bonjour')
  assert.equal(normalizeQaToken("s'"), 's')
  assert.equal(normalizeQaToken('«s»'), 's')
  assert.equal(normalizeQaToken('cédille,'), 'cédille')
  assert.equal(normalizeQaToken('...Aigu!'), 'aigu')
})

test('isFlaggedToken and classifyQaToken flag all lone elided letters', () => {
  const loneLetters = ['s', 'l', 'd', 'j', 'm', 'n', 't', 'c', 'qu']
  for (const letter of loneLetters) {
    assert.equal(isFlaggedToken(letter), true, `Failed for ${letter}`)
    assert.equal(isFlaggedToken(letter.toUpperCase()), true, `Failed for uppercase ${letter}`)
    assert.equal(isFlaggedToken(`${letter}'`), true, `Failed for ${letter}'`)

    const classification = classifyQaToken(letter)
    assert.ok(classification)
    assert.equal(classification.type, 'lone_elision')
    assert.equal(classification.token, letter)
  }
})

test('isFlaggedToken and classifyQaToken flag spelled-out punctuation and accents', () => {
  const punctuationTokens = [
    'accent',
    'aigu',
    'grave',
    'circonflexe',
    'cédille',
    'cedille',
    'tréma',
    'trema',
    'apostrophe',
    'astérisque',
    'asterisque',
    'tiret',
  ]

  for (const token of punctuationTokens) {
    assert.equal(isFlaggedToken(token), true, `Failed for ${token}`)
    assert.equal(isFlaggedToken(token.toUpperCase()), true, `Failed for uppercase ${token}`)
    assert.equal(isFlaggedToken(`${token},`), true, `Failed for ${token},`)

    const classification = classifyQaToken(token)
    assert.ok(classification)
    assert.equal(classification.type, 'spelled_punctuation')
  }
})

test('isFlaggedToken returns false for normal spoken French words', () => {
  const normalWords = [
    'bonjour',
    'sépanouir',
    'lécole',
    'quil',
    'jusquà',
    'daccord',
    'cétait',
    'merci',
    'radio',
    'communautaire',
    'intégration',
    'québécoise',
  ]

  for (const word of normalWords) {
    assert.equal(isFlaggedToken(word), false, `False positive for "${word}"`)
    assert.equal(classifyQaToken(word), null, `False positive classification for "${word}"`)
  }
})

test('findFlaggedWords detects defect tokens from Deepgram word arrays with timestamps', () => {
  // Simulates Deepgram transcript of "Les enfants peuvent s’épanouir à l’école"
  // where "s" was pronounced as a separate word
  const defectWords = [
    { word: 'Les', start: 0.1, end: 0.3 },
    { word: 'enfants', start: 0.32, end: 0.7 },
    { word: 'peuvent', start: 0.75, end: 1.1 },
    { word: 's', start: 1.15, end: 1.65 }, // Defect: 0.5s separate "s"
    { word: 'épanouir', start: 1.7, end: 2.2 },
    { word: 'à', start: 2.25, end: 2.35 },
    { word: 'l’école', start: 2.4, end: 2.8 },
  ]

  const flagged = findFlaggedWords(defectWords)
  assert.equal(flagged.length, 1)
  assert.equal(flagged[0].token, 's')
  assert.equal(flagged[0].type, 'lone_elision')
  assert.equal(flagged[0].start, 1.15)
  assert.equal(flagged[0].end, 1.65)
  assert.equal(flagged[0].index, 3)

  // Simulates spelled-out accent defect: "r e accent aigu"
  const accentDefectWords = [
    { word: 'r', start: 0.0, end: 0.2 },
    { word: 'e', start: 0.22, end: 0.35 },
    { word: 'accent', start: 0.4, end: 0.7 },
    { word: 'aigu', start: 0.72, end: 1.0 },
    { word: 'value', start: 1.05, end: 1.4 },
  ]

  const flaggedAccents = findFlaggedWords(accentDefectWords)
  // "accent" and "aigu" must be flagged as spelled_punctuation
  const types = flaggedAccents.map((f) => f.type)
  assert.ok(types.includes('spelled_punctuation'))
  const tokens = flaggedAccents.map((f) => f.token)
  assert.ok(tokens.includes('accent'))
  assert.ok(tokens.includes('aigu'))

  // Clean words list produces no flagged items
  const cleanWords = [
    { word: 'Les', start: 0.1, end: 0.3 },
    { word: 'enfants', start: 0.32, end: 0.7 },
    { word: 'peuvent', start: 0.75, end: 1.1 },
    { word: 'sépanouir', start: 1.15, end: 1.8 },
    { word: 'à', start: 1.85, end: 1.95 },
    { word: 'lécole', start: 2.0, end: 2.5 },
  ]
  assert.deepEqual(findFlaggedWords(cleanWords), [])
})

test('timeToSegmentIndex accurately locates segment for timestamps', () => {
  const segments = [
    { start: 0.0, end: 4.5 },
    { start: 4.5, end: 9.8 },
    { start: 9.8, end: 16.2 },
  ]

  // Mid-segment hits
  assert.equal(timeToSegmentIndex(segments, 2.0), 0)
  assert.equal(timeToSegmentIndex(segments, 7.0), 1)
  assert.equal(timeToSegmentIndex(segments, 12.0), 2)

  // Exact boundaries: [start, end)
  assert.equal(timeToSegmentIndex(segments, 0.0), 0)
  assert.equal(timeToSegmentIndex(segments, 4.5), 1)
  assert.equal(timeToSegmentIndex(segments, 9.8), 2)

  // Near end of audio
  assert.equal(timeToSegmentIndex(segments, 16.2), 2)
  assert.equal(timeToSegmentIndex(segments, 16.4), 2)

  // Negative / out of bounds
  assert.equal(timeToSegmentIndex(segments, -0.5), 0)
  assert.equal(timeToSegmentIndex(segments, 25.0), 2)

  // Invalid inputs
  assert.equal(timeToSegmentIndex([], 5.0), -1)
  assert.equal(timeToSegmentIndex(null, 5.0), -1)
  assert.equal(timeToSegmentIndex(segments, NaN), -1)
})

test('mapFlaggedWordToIntensiveSentence and formatIntensiveFlaggedSentence produce expected format', () => {
  const segments = [
    { start: 0.0, end: 5.2 },
    { start: 5.2, end: 11.4 },
    { start: 11.4, end: 18.0 },
  ]
  const sentences = [
    { speaker: 'A', fr: 'Première phrase du passage.' },
    { speaker: 'A', fr: 'Deuxième phrase contenant une élision.' },
    { speaker: 'A', fr: 'Troisième phrase de conclusion.' },
  ]

  const flaggedWord = {
    token: 's',
    start: 8.0,
    end: 8.5,
    type: 'lone_elision',
  }

  const mapped = mapFlaggedWordToIntensiveSentence(flaggedWord, segments, sentences)
  assert.equal(mapped.segmentIndex, 1)
  assert.equal(mapped.sentenceNumber, 2)
  assert.equal(mapped.sentenceFr, 'Deuxième phrase contenant une élision.')

  const formatted = formatIntensiveFlaggedSentence('test-passage', mapped.sentenceNumber, mapped.sentenceFr)
  assert.equal(formatted, 'test-passage #2: Deuxième phrase contenant une élision.')

  assert.equal(formatTcfFlaggedMessage('co-01'), 'co-01')
})

test('parseArgs parses CLI arguments for tts-qa-deepgram', () => {
  assert.deepEqual(parseArgs(['intensive']), {
    manifestType: 'intensive',
    only: null,
    concurrency: 2,
  })

  assert.deepEqual(parseArgs(['tcf-listening', '--only=co-05', '--concurrency=4']), {
    manifestType: 'tcf-listening',
    only: 'co-05',
    concurrency: 4,
  })

  assert.deepEqual(parseArgs(['--type=intensive', '--only', 'radio-communautaire']), {
    manifestType: 'intensive',
    only: 'radio-communautaire',
    concurrency: 2,
  })
})

test('getIgnoredTokens extracts per-item ignored tokens from ignore config', () => {
  const config = {
    'tcf-listening': {
      'co-11': ['c'],
      'co-20': ['s', 'qu'],
    },
    'intensive': {
      'radio-communautaire': ['c'],
    },
  }

  // Exact matches
  assert.deepEqual(getIgnoredTokens(config, 'tcf-listening', 'co-11'), ['c'])
  assert.deepEqual(getIgnoredTokens(config, 'tcf-listening', 'co-20'), ['s', 'qu'])
  assert.deepEqual(getIgnoredTokens(config, 'intensive', 'radio-communautaire'), ['c'])

  // Suffix matching fallback
  assert.deepEqual(getIgnoredTokens(config, 'tcf-listening', 'tcf-set-b-co-11'), ['c'])

  // Non-matching
  assert.deepEqual(getIgnoredTokens(config, 'tcf-listening', 'co-01'), [])
  assert.deepEqual(getIgnoredTokens(config, 'unknown-type', 'co-11'), [])
  assert.deepEqual(getIgnoredTokens(null, 'tcf-listening', 'co-11'), [])
  assert.deepEqual(getIgnoredTokens({}, 'tcf-listening', 'co-11'), [])
})

test('findFlaggedWords skips ignored defect tokens for specific items', () => {
  // Simulates question co-11: "vol AC 412" transcribed as "vol A C quatre cent douze"
  const wordsCo11 = [
    { word: 'vol', start: 0.1, end: 0.4 },
    { word: 'A', start: 0.45, end: 0.65 },
    { word: 'C', start: 0.7, end: 1.0 }, // Would normally be flagged as lone elision
    { word: 'quatre', start: 1.05, end: 1.4 },
  ]

  // Without ignore list: 'c' is flagged
  const flaggedWithoutIgnore = findFlaggedWords(wordsCo11)
  assert.equal(flaggedWithoutIgnore.length, 1)
  assert.equal(flaggedWithoutIgnore[0].token, 'c')

  // With ignore list: 'c' is skipped
  const flaggedWithIgnore = findFlaggedWords(wordsCo11, ['c'])
  assert.deepEqual(flaggedWithIgnore, [])

  // Case-insensitive and punctuation-tolerant ignore matching
  assert.deepEqual(findFlaggedWords(wordsCo11, ['C']), [])
  assert.deepEqual(findFlaggedWords(wordsCo11, ["c'"]), [])
  assert.deepEqual(findFlaggedWords(wordsCo11, new Set(['c'])), [])

  // Unrelated defects in same item are still flagged
  const mixedWords = [
    { word: 'C', start: 0.5, end: 0.8 }, // Ignored
    { word: 's', start: 1.2, end: 1.5 }, // Real defect
  ]
  const mixedFlagged = findFlaggedWords(mixedWords, ['c'])
  assert.equal(mixedFlagged.length, 1)
  assert.equal(mixedFlagged[0].token, 's')

  // filterIgnoredFlaggedWords helper
  const allFlagged = findFlaggedWords(mixedWords)
  assert.equal(allFlagged.length, 2)
  const filtered = filterIgnoredFlaggedWords(allFlagged, ['c'])
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].token, 's')
})

test('loadQaIgnoreConfig loads committed scripts/tts-qa-ignore.json with AC flight code rule', () => {
  const config = loadQaIgnoreConfig(QA_IGNORE_FILE)
  assert.ok(config && typeof config === 'object')
  assert.ok(Array.isArray(config?.['tcf-listening']?.['co-11']))
  assert.deepEqual(config['tcf-listening']['co-11'], ['c'])

  // Non-existent path returns empty object safely
  assert.deepEqual(loadQaIgnoreConfig('/tmp/non-existent-qa-ignore.json'), {})
})

test('euphonic -t- is treated as legitimate across QA helpers', () => {
  // 1. hasEuphonicT detects -t-
  assert.equal(hasEuphonicT('a-t-il'), true)
  assert.equal(hasEuphonicT('passe-t-il'), true)
  assert.equal(hasEuphonicT('va-t-elle'), true)
  assert.equal(hasEuphonicT("Y a-t-il des frais d'annulation ?"), true)
  assert.equal(hasEuphonicT("Y A-T-IL UNE LISTE D'ATTENTE ?"), true)
  assert.equal(hasEuphonicT('peut-on'), false)
  assert.equal(hasEuphonicT("à l'époque"), false)
  assert.equal(hasEuphonicT(''), false)
  assert.equal(hasEuphonicT(null), false)
  assert.equal(hasEuphonicT(undefined), false)

  // 2. isFlaggedToken and classifyQaToken ignore lone 't' when originalText contains -t-
  assert.equal(isFlaggedToken('t', 'a-t-il'), false)
  assert.equal(isFlaggedToken('T', 'passe-t-il'), false)
  assert.equal(isFlaggedToken("t'", 'va-t-elle'), false)
  assert.equal(isFlaggedToken('t', "Y a-t-il des frais d'annulation ?"), false)
  assert.equal(classifyQaToken('t', 'a-t-il'), null)
  assert.equal(classifyQaToken('T', 'passe-t-il'), null)

  // But 't' is still flagged when originalText does not contain -t-
  assert.equal(isFlaggedToken('t', "à l'époque"), true)
  assert.equal(isFlaggedToken('t', 'peut-on'), true)
  assert.equal(isFlaggedToken('t', ''), true)
  assert.equal(isFlaggedToken('t'), true)
  assert.ok(classifyQaToken('t', "à l'époque"))

  // Other lone tokens are STILL flagged even if originalText contains -t-
  assert.equal(isFlaggedToken('s', "Y a-t-il une liste d'attente ?"), true)
  assert.equal(isFlaggedToken('d', "Y a-t-il une liste d'attente ?"), true)
  assert.equal(isFlaggedToken('qu', "Y a-t-il une liste d'attente ?"), true)
  assert.ok(classifyQaToken('s', "Y a-t-il une liste d'attente ?"))

  // 3. findFlaggedWords ignores lone 't' when originalText has -t-
  const deepgramWordsWithEuphonicT = [
    { word: 'Y', start: 0.1, end: 0.3 },
    { word: 'a', start: 0.32, end: 0.5 },
    { word: 't', start: 0.52, end: 0.65 }, // Transcribed as lone 't'
    { word: 'il', start: 0.68, end: 0.9 },
    { word: 'des', start: 0.92, end: 1.1 },
    { word: 'frais', start: 1.12, end: 1.5 },
  ]

  // With originalText: lone 't' is ignored
  const flaggedWithContext = findFlaggedWords(deepgramWordsWithEuphonicT, [], "Y a-t-il des frais d'annulation ?")
  assert.deepEqual(flaggedWithContext, [])

  // Also works passing originalText as 2nd arg
  assert.deepEqual(findFlaggedWords(deepgramWordsWithEuphonicT, "Y a-t-il des frais d'annulation ?"), [])

  // Without context or when text has no -t-: 't' is flagged
  const flaggedWithoutContext = findFlaggedWords(deepgramWordsWithEuphonicT)
  assert.equal(flaggedWithoutContext.length, 1)
  assert.equal(flaggedWithoutContext[0].token, 't')

  const flaggedWithUnrelatedContext = findFlaggedWords(deepgramWordsWithEuphonicT, [], "à l'époque")
  assert.equal(flaggedWithUnrelatedContext.length, 1)
  assert.equal(flaggedWithUnrelatedContext[0].token, 't')

  // Real defects alongside euphonic 't' are still flagged
  const mixedDefectWords = [
    { word: 't', start: 0.5, end: 0.6 }, // Legitimate euphonic t
    { word: 's', start: 1.2, end: 1.5 }, // Real defect
  ]
  const flaggedMixed = findFlaggedWords(mixedDefectWords, [], 'a-t-il')
  assert.equal(flaggedMixed.length, 1)
  assert.equal(flaggedMixed[0].token, 's')

  // 4. filterIgnoredFlaggedWords filters 't' when originalText has -t-
  const flaggedTokens = [{ token: 't' }, { token: 's' }]
  const filteredTokens = filterIgnoredFlaggedWords(flaggedTokens, [], 'a-t-il')
  assert.equal(filteredTokens.length, 1)
  assert.equal(filteredTokens[0].token, 's')

  const nonFilteredTokens = filterIgnoredFlaggedWords(flaggedTokens, [], "à l'époque")
  assert.equal(nonFilteredTokens.length, 2)
})
