import { buildOptions, editDistance, pickDistractors, spellingKey } from '../src/pages/Tap/distractors.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'

// Deterministic random source so the assertions do not depend on luck.
function seeded(seed = 1) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x80000000
  }
}

const chapter = ['chat', 'chien', 'cheval', 'chapeau', 'chaise', 'manger', 'boire', 'maison', 'ami', 'a', 'à', 'où', 'ou']

test('spellingKey strips accents and case; editDistance is a plain edit distance', () => {
  assert.equal(spellingKey('Été'), 'ete')
  assert.equal(spellingKey('où'), 'ou')
  assert.equal(editDistance('chat', 'chat'), 0)
  assert.equal(editDistance('chat', 'chats'), 1)
  assert.equal(editDistance('chat', 'chien'), 3)
  assert.equal(editDistance('', 'abc'), 3)
})

test('returns exactly count distinct options that never include the target', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const picked = pickDistractors('chat', chapter, [], { count: 3, random: seeded(seed) })
    assert.equal(picked.length, 3)
    assert.equal(new Set(picked).size, 3, 'no duplicate options')
    assert.ok(!picked.includes('chat'), 'target is not a distractor')
  }
})

test('with similar spelling, near words are preferred over distant ones', () => {
  const picked = pickDistractors('chat', chapter, [], { count: 3, similar: true, random: seeded(7) })
  // chapeau, chaise, chien, cheval are the closest spellings to "chat"; "maison" and "manger" are far.
  const close = ['chien', 'cheval', 'chapeau', 'chaise']
  for (const text of picked) {
    assert.ok(close.includes(text), `${text} is a near spelling of chat`)
  }
})

test('accent-only differences become distractors when similar mode is on', () => {
  const picked = pickDistractors('ou', chapter, [], { count: 2, similar: true, random: seeded(3) })
  assert.ok(picked.includes('où'), `expected "où" among ${JSON.stringify(picked)}`)
  assert.ok(!picked.includes('ou'))
})

test('without similar mode the choice is random across the pool', () => {
  const seen = new Set()
  for (let seed = 1; seed <= 80; seed++) {
    for (const text of pickDistractors('chat', chapter, [], { count: 3, random: seeded(seed) })) seen.add(text)
  }
  assert.ok(seen.has('maison') || seen.has('manger') || seen.has('boire'), 'distant words are also drawn')
})

test('tiny chapter: falls back to the dictionary pool and still yields distinct options', () => {
  const tinyChapter = ['bonjour', 'merci']
  const dictionary = ['bonjour', 'merci', 'chat', 'chien', 'pain', 'eau']
  const picked = pickDistractors('bonjour', tinyChapter, dictionary, { count: 3, similar: true, random: seeded(5) })
  assert.equal(picked.length, 3)
  assert.equal(new Set(picked).size, 3)
  assert.ok(!picked.includes('bonjour'))
  assert.ok(picked.includes('merci'), 'chapter words are used before the fallback')
})

test('returns fewer options only when there is nothing else to draw', () => {
  assert.deepEqual(pickDistractors('chat', ['chat'], ['chat'], { count: 3 }), [])
  assert.deepEqual(pickDistractors('chat', ['chien'], [], { count: 3, random: seeded(2) }), ['chien'])
  assert.deepEqual(pickDistractors('chat', [], [], { count: 3 }), [])
})

test('duplicate texts in the pools are collapsed', () => {
  const picked = pickDistractors('chat', ['chien', 'chien', 'chien', 'chat'], ['chien', 'chaise'], { count: 3, random: seeded(4) })
  assert.equal(new Set(picked).size, picked.length)
  assert.deepEqual(picked.sort(), ['chaise', 'chien'])
})

test('buildOptions puts the answer in exactly once, with all distractors', () => {
  const options = buildOptions('chat', ['chien', 'chaise', 'chat', 'chien'], seeded(9))
  assert.equal(options.filter((item) => item === 'chat').length, 1)
  assert.equal(new Set(options).size, options.length)
  assert.deepEqual([...options].sort(), ['chaise', 'chat', 'chien'])
})
