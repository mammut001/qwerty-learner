import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CONFUSABLE_SIBLINGS,
  buildTileExercise,
  chunkLetterRun,
  isAccentLetter,
  isSeparator,
  isSpellingEligible,
  spellingEligible,
  splitGraphemes,
} from './tiles'

// Simple deterministic pseudo-random number generator for tests
function createDeterministicRng(seed = 123456789) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

test('splitGraphemes splits NFC strings into grapheme clusters', () => {
  assert.deepEqual(splitGraphemes('café'), ['c', 'a', 'f', 'é'])
  assert.deepEqual(splitGraphemes("l'âge"), ['l', "'", 'â', 'g', 'e'])
  assert.deepEqual(splitGraphemes('grand-mère'), ['g', 'r', 'a', 'n', 'd', '-', 'm', 'è', 'r', 'e'])
})

test('separators are identified and kept fixed in place', () => {
  assert.equal(isSeparator("'"), true)
  assert.equal(isSeparator('-'), true)
  assert.equal(isSeparator(' '), true)
  assert.equal(isSeparator('a'), false)
  assert.equal(isSeparator('é'), false)

  const rng = createDeterministicRng()
  const ex = buildTileExercise("l'âge", rng)

  const [s0, s1, s2, s3, s4] = ex.segments
  assert.equal(s0?.type, 'slot')
  if (s0?.type === 'slot') assert.equal(s0.expected, 'l')

  assert.equal(s1?.type, 'separator')
  if (s1?.type === 'separator') assert.equal(s1.text, "'")

  assert.equal(s2?.type, 'slot')
  if (s2?.type === 'slot') assert.equal(s2.expected, 'â')

  assert.equal(s3?.type, 'slot')
  if (s3?.type === 'slot') assert.equal(s3.expected, 'g')

  assert.equal(s4?.type, 'slot')
  if (s4?.type === 'slot') assert.equal(s4.expected, 'e')

  assert.deepEqual(ex.answerTiles, ['l', 'â', 'g', 'e'])
})

test('accents are recognized as single tiles even in long words', () => {
  assert.equal(isAccentLetter('é'), true)
  assert.equal(isAccentLetter('è'), true)
  assert.equal(isAccentLetter('ê'), true)
  assert.equal(isAccentLetter('ë'), true)
  assert.equal(isAccentLetter('à'), true)
  assert.equal(isAccentLetter('â'), true)
  assert.equal(isAccentLetter('ç'), true)
  assert.equal(isAccentLetter('î'), true)
  assert.equal(isAccentLetter('ï'), true)
  assert.equal(isAccentLetter('ô'), true)
  assert.equal(isAccentLetter('û'), true)
  assert.equal(isAccentLetter('ù'), true)
  assert.equal(isAccentLetter('ü'), true)
  assert.equal(isAccentLetter('œ'), true)
  assert.equal(isAccentLetter('æ'), true)
  assert.equal(isAccentLetter('a'), false)

  // In a long word > 14 graphemes, accented letters must remain single tiles
  // "télécommunication" = 17 graphemes
  const rng = createDeterministicRng()
  const ex = buildTileExercise('télécommunication', rng)
  // Ensure 'é' appears as individual 1-character tiles in answerTiles
  const singleAccents = ex.answerTiles.filter((tile) => tile === 'é')
  assert.equal(singleAccents.length, 2)
  // Check that no chunk contains 'é' combined with other letters
  assert.equal(ex.answerTiles.some((tile) => tile.length > 1 && tile.includes('é')), false)
})

test('chunkLetterRun produces chunks of 2-3 letters for longer runs', () => {
  assert.deepEqual(chunkLetterRun(['a']), ['a'])
  assert.deepEqual(chunkLetterRun(['a', 'b']), ['ab'])
  assert.deepEqual(chunkLetterRun(['a', 'b', 'c']), ['abc'])
  assert.deepEqual(chunkLetterRun(['a', 'b', 'c', 'd']), ['ab', 'cd'])
  assert.deepEqual(chunkLetterRun(['a', 'b', 'c', 'd', 'e']), ['abc', 'de'])
  assert.deepEqual(chunkLetterRun(['a', 'b', 'c', 'd', 'e', 'f']), ['abc', 'def'])
  assert.deepEqual(chunkLetterRun(['a', 'b', 'c', 'd', 'e', 'f', 'g']), ['abc', 'de', 'fg'])
})

test('distractors include the confusable sibling for accented letters', () => {
  const rng = createDeterministicRng(42)

  // 'café' has 'é', distractors must include a confusable sibling ('è', 'e', or 'ê')
  const cafe = buildTileExercise('café', rng)
  const cafeSiblings = CONFUSABLE_SIBLINGS['é']
  assert.ok(cafe.distractors.some((d) => cafeSiblings.includes(d)))
  assert.ok(cafe.distractors.length >= 2 && cafe.distractors.length <= 4)

  // 'français' has 'ç', distractors must include 'c'
  const francais = buildTileExercise('français', rng)
  assert.ok(francais.distractors.includes('c'))

  // 'août' has 'û', distractors must include 'u', 'ù', or 'ü'
  const aout = buildTileExercise('août', rng)
  const aoutSiblings = CONFUSABLE_SIBLINGS['û']
  assert.ok(aout.distractors.some((d) => aoutSiblings.includes(d)))

  // Word without accents gets 2-4 random distractors
  const maison = buildTileExercise('maison', rng)
  assert.ok(maison.distractors.length >= 2 && maison.distractors.length <= 4)
})

test('shuffled pool contains exactly answer tiles + distractors', () => {
  const rng = createDeterministicRng(99)
  const ex = buildTileExercise('grand-mère', rng)

  const expectedAll = [...ex.answerTiles, ...ex.distractors].sort()
  const actualPool = [...ex.pool].sort()

  assert.deepEqual(actualPool, expectedAll)
  assert.equal(ex.pool.length, ex.answerTiles.length + ex.distractors.length)
})

test('deterministic with an injected rng', () => {
  const rng1 = createDeterministicRng(54321)
  const rng2 = createDeterministicRng(54321)

  const ex1 = buildTileExercise("s'il vous plaît", rng1)
  const ex2 = buildTileExercise("s'il vous plaît", rng2)

  assert.deepEqual(ex1.pool, ex2.pool)
  assert.deepEqual(ex1.distractors, ex2.distractors)
  assert.deepEqual(ex1.answerTiles, ex2.answerTiles)
})

test('isSpellingEligible filters words > 24 graphemes and empty meanings in zh2fr', () => {
  const shortWithMeaning = { name: 'bonjour', meaning: '你好' }
  const shortNoMeaning = { name: 'bonjour', meaning: '' }
  const longWord = { name: 'anticonstitutionnellement-extra', meaning: '极长词' } // > 24 chars

  assert.equal(isSpellingEligible(shortWithMeaning, 'zh2fr'), true)
  assert.equal(isSpellingEligible(shortWithMeaning, 'listen'), true)

  assert.equal(isSpellingEligible(shortNoMeaning, 'zh2fr'), false)
  assert.equal(isSpellingEligible(shortNoMeaning, 'listen'), true)

  assert.equal(isSpellingEligible(longWord, 'zh2fr'), false)
  assert.equal(isSpellingEligible(longWord, 'listen'), false)

  assert.equal(spellingEligible([shortWithMeaning, shortNoMeaning, longWord], 'zh2fr').length, 1)
  assert.equal(spellingEligible([shortWithMeaning, shortNoMeaning, longWord], 'listen').length, 2)
})
