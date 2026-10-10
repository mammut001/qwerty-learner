import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ECHELLE_ITEM_CATALOG,
  ECHELLE_LEVEL_ITEMS,
  countEchelleItemVariants,
  getEchelleItemVariant,
  scoreEchelleItem,
} from './echelle-curriculum.mjs'
import { LEXIQUE_TOPICS } from './echelle-lexique-bank.mjs'
import { apply, emptyLearningProgress, normalizeState } from './study-model.mjs'

const baseState = (echelleItems = {}) =>
  normalizeState({
    startDate: '2025-01-01',
    minutes: {},
    minimumMode: {},
    learning: { ...emptyLearningProgress(), echelle: { items: echelleItems } },
    syncMeta: {
      startDateUpdatedAt: 0,
      settingsUpdatedAt: 0,
      minimumModeUpdatedAt: {},
      minutesUpdatedAt: {},
      grammarDraftUpdatedAt: 0,
    },
  })

const getN12QuizItems = () =>
  [...ECHELLE_LEVEL_ITEMS[1], ...ECHELLE_LEVEL_ITEMS[2]].filter((id) => !id.includes('production'))

describe('Échelle item variant engine', () => {
  it('variant 0 or undefined equals catalog item for every item id; scoring without variant is unchanged', () => {
    for (const [id, catalogItem] of Object.entries(ECHELLE_ITEM_CATALOG)) {
      const v0 = getEchelleItemVariant(id, 0)
      const vUndefined = getEchelleItemVariant(id)
      assert.deepStrictEqual(v0, catalogItem, `Variant 0 differs from catalog for item ${id}`)
      assert.deepStrictEqual(vUndefined, catalogItem, `Variant undefined differs from catalog for item ${id}`)

      if (catalogItem.kind !== 'production') {
        const correctAnswers = catalogItem.questions.map((q) => q.answer)
        const scoreNoVariant = scoreEchelleItem(id, correctAnswers)
        const scoreMetaEmpty = scoreEchelleItem(id, correctAnswers, {})
        const scoreMetaZero = scoreEchelleItem(id, correctAnswers, { variant: 0 })

        assert.deepStrictEqual(scoreNoVariant, scoreMetaEmpty)
        assert.deepStrictEqual(scoreNoVariant, scoreMetaZero)
        assert.strictEqual(scoreNoVariant.mastered, true)
        assert.strictEqual(scoreNoVariant.score, 1)
      }
    }
  })

  it('is deterministic, has distinct choices with answers, audioText matches text, and no unresolved slot markers across 200 seeds for all N1-N2 quiz items', () => {
    const quizItems = getN12QuizItems()
    assert.strictEqual(quizItems.length, 43)

    for (const itemId of quizItems) {
      assert.ok(countEchelleItemVariants(itemId) > 1, `Expected > 1 variants for ${itemId}`)

      for (let seed = 1; seed <= 200; seed++) {
        const v1 = getEchelleItemVariant(itemId, seed)
        const v2 = getEchelleItemVariant(itemId, seed)

        assert.deepStrictEqual(v1, v2, `Non-deterministic output for ${itemId} with seed ${seed}`)
        assert.strictEqual(v1.variant, seed)

        if (v1.text) {
          assert.strictEqual(v1.text.includes('undefined'), false, `Unresolved undefined in ${itemId} seed ${seed}: ${v1.text}`)
          assert.strictEqual(v1.text.includes('NaN'), false, `Unresolved NaN in ${itemId} seed ${seed}: ${v1.text}`)
          assert.strictEqual(/\$\{[^}]+\}/.test(v1.text), false, `Unresolved template token in ${itemId} seed ${seed}: ${v1.text}`)
        }

        if (v1.skill === 'listening') {
          assert.strictEqual(v1.audioText, v1.text, `audioText does not match text in listening item ${itemId} seed ${seed}`)
        }

        assert.ok(Array.isArray(v1.questions) && v1.questions.length > 0)
        for (const q of v1.questions) {
          assert.strictEqual(new Set(q.choices).size, q.choices.length, `Duplicate choices in ${itemId} seed ${seed}: ${q.choices.join(', ')}`)
          assert.ok(q.choices.includes(q.answer), `Answer "${q.answer}" not in choices for ${itemId} seed ${seed}: ${q.choices.join(', ')}`)
          assert.strictEqual(q.prompt.includes('undefined'), false, `Unresolved undefined in prompt of ${itemId} seed ${seed}: ${q.prompt}`)
        }
      }
    }
  })

  it('yields ≥ 12 distinct texts and non-constant answer positions across 300 seeds for every N1-N2 listening and reading indicator', () => {
    const indicatorItems = getN12QuizItems().filter((id) => id.includes('listening') || id.includes('reading'))
    assert.strictEqual(indicatorItems.length, 24)

    for (const itemId of indicatorItems) {
      const texts = new Set()
      const answerPositions = new Set()

      for (let seed = 1; seed <= 300; seed++) {
        const v = getEchelleItemVariant(itemId, seed)
        texts.add(v.text)
        for (const q of v.questions) {
          answerPositions.add(q.choices.indexOf(q.answer))
        }
      }

      assert.ok(
        texts.size >= 12,
        `Expected ≥ 12 distinct texts for indicator ${itemId}, got ${texts.size}`,
      )
      assert.ok(
        answerPositions.size > 1,
        `Answer position is constant for indicator ${itemId}: only seen indices ${[...answerPositions].join(', ')}`,
      )
    }
  })

  it('tests every word in the topic at least once across 300 seeds for every N1-N2 lexique topic', () => {
    const lexiqueItems = getN12QuizItems().filter((id) => id.includes('lex-'))
    assert.strictEqual(lexiqueItems.length, 12)

    for (const itemId of lexiqueItems) {
      const topicId = itemId.replace(/^n\d+-lex-/, '')
      const topic = LEXIQUE_TOPICS.find((t) => t.id === topicId)
      assert.ok(topic, `Topic not found for ${topicId}`)
      assert.ok(topic.words.length >= 12, `Topic ${topicId} has fewer than 12 words: ${topic.words.length}`)

      const testedWords = new Set()
      for (let seed = 1; seed <= 300; seed++) {
        const item = getEchelleItemVariant(itemId, seed)
        assert.strictEqual(item.questions.length, 4)

        for (const q of item.questions) {
          for (const [fr, zh] of topic.words) {
            if (q.prompt.includes(fr) || q.prompt.includes(zh) || q.answer === fr || q.answer === zh) {
              testedWords.add(fr)
            }
          }
        }
      }

      assert.strictEqual(
        testedWords.size,
        topic.words.length,
        `Not all words reached for topic ${topicId}: reached ${testedWords.size} / ${topic.words.length}`,
      )
    }
  })

  it('scores correctly with non-zero meta.variant', () => {
    const itemId = 'n1-listening-0'
    const catalogItem = ECHELLE_ITEM_CATALOG[itemId]
    const v0Answers = catalogItem.questions.map((q) => q.answer)

    // Find a variant whose answers differ from variant 0
    let variantWithDiffAnswers = null
    for (let s = 1; s <= 50; s++) {
      const v = getEchelleItemVariant(itemId, s)
      const answers = v.questions.map((q) => q.answer)
      if (answers.some((ans, i) => ans !== v0Answers[i])) {
        variantWithDiffAnswers = { seed: s, answers }
        break
      }
    }
    assert.ok(variantWithDiffAnswers, 'Could not find variant with distinct answers')

    const { seed, answers: variantAnswers } = variantWithDiffAnswers

    // Scoring with the variant's own answers and matching meta.variant succeeds
    const variantScore = scoreEchelleItem(itemId, variantAnswers, { variant: seed })
    assert.strictEqual(variantScore.mastered, true)
    assert.strictEqual(variantScore.score, 1)

    // Scoring the same submission against variant 0 fails because answers differ
    const v0Score = scoreEchelleItem(itemId, variantAnswers)
    assert.strictEqual(v0Score.mastered, false)
    assert.ok(v0Score.score < 1)
  })

  it('study-model apply handles valid, invalid, and absent variants correctly', () => {
    let state = baseState()
    const itemId = 'n1-listening-0'
    const v42 = getEchelleItemVariant(itemId, 42)
    const v42Answers = v42.questions.map((q) => q.answer)

    // Valid non-zero variant records mastery and stores variant on item record
    state = apply(state, [
      {
        kind: 'echelleCheck',
        itemId,
        answers: v42Answers,
        variant: 42,
        updatedAt: 1000,
      },
    ])

    const stored42 = state.learning.echelle.items[itemId]
    assert.ok(stored42)
    assert.strictEqual(stored42.mastered, true)
    assert.strictEqual(stored42.variant, 42)
    assert.strictEqual(stored42.attempts, 1)

    // Absent variant records mastery against catalog item and does not store variant
    const itemId2 = 'n1-listening-1'
    const v0Answers2 = ECHELLE_ITEM_CATALOG[itemId2].questions.map((q) => q.answer)
    state = apply(state, [
      {
        kind: 'echelleCheck',
        itemId: itemId2,
        answers: v0Answers2,
        updatedAt: 2000,
      },
    ])

    const stored0 = state.learning.echelle.items[itemId2]
    assert.ok(stored0)
    assert.strictEqual(stored0.mastered, true)
    assert.strictEqual(stored0.variant, undefined)

    // Invalid variants must throw Invalid operation
    const invalidVariants = [-1, -100, 1.5, 0x80000000, '42', 'abc', null, {}, []]
    for (const badVariant of invalidVariants) {
      assert.throws(
        () => {
          apply(state, [
            {
              kind: 'echelleCheck',
              itemId,
              answers: v42Answers,
              variant: badVariant,
              updatedAt: 3000,
            },
          ])
        },
        /Invalid operation/,
        `Expected rejection for invalid variant ${badVariant}`,
      )
    }
  })
})
