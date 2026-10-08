import assert from 'node:assert'
import { describe, it } from 'node:test'
import { ECHELLE_ITEM_CATALOG, getEchelleLevelItems, scoreEchelleItem, summarizeEchelleLevel } from './echelle-curriculum.mjs'
import { apply, emptyLearningProgress, normalizeState, studyAnalytics } from './study-model.mjs'

const baseState = () =>
  normalizeState({
    startDate: '2025-01-01',
    minutes: {},
    minimumMode: {},
    learning: emptyLearningProgress(),
    syncMeta: {
      startDateUpdatedAt: 0,
      settingsUpdatedAt: 0,
      minimumModeUpdatedAt: {},
      minutesUpdatedAt: {},
      grammarDraftUpdatedAt: 0,
    },
  })

describe('echelle curriculum', () => {
  it('covers every listening and reading indicator exactly once', () => {
    const listening = getEchelleLevelItems(1).filter((id) => id.includes('-listening-'))
    const reading = getEchelleLevelItems(1).filter((id) => id.includes('-reading-'))
    assert.strictEqual(listening.length, 6)
    assert.strictEqual(reading.length, 6)
  })

  it('scores a listening item when all answers are correct', () => {
    const result = scoreEchelleItem('n1-listening-0', ['墨西哥人', '护士'])
    assert.strictEqual(result.mastered, true)
    assert.strictEqual(result.score, 1)
  })

  it('does not master a listening item with one wrong answer', () => {
    const result = scoreEchelleItem('n1-listening-0', ['加拿大人', '护士'])
    assert.strictEqual(result.mastered, false)
  })

  it('masters a writing production item when word count and self-checks pass', () => {
    const result = scoreEchelleItem('n1-writing-production', [], { wordCount: 8, selfChecks: [true, true, true] })
    assert.strictEqual(result.mastered, true)
  })

  it('fails a speaking production item when not enough seconds', () => {
    const result = scoreEchelleItem('n1-speaking-production', [], { seconds: 5, selfChecks: [true, true, true] })
    assert.strictEqual(result.mastered, false)
  })

  it('does not reveal the answer through choice order', () => {
    const quizzes = Object.values(ECHELLE_ITEM_CATALOG).filter((item) => item.questions)
    for (const kind of ['grammar', 'indicator', 'lexique']) {
      const questions = quizzes.filter((item) => item.kind === kind).flatMap((item) => item.questions)
      const first = questions.filter((q) => q.choices[0] === q.answer).length
      assert.ok(first / questions.length < 0.5, `${kind}: answer is first in ${first}/${questions.length}`)
      assert.ok(questions.every((q) => q.choices.includes(q.answer)), `${kind}: answer missing from choices`)
    }
  })

  it('summarizes level 1 as passed when all items are mastered', () => {
    const masteredIds = getEchelleLevelItems(1)
    assert.strictEqual(summarizeEchelleLevel(1, masteredIds).passed, true)
  })
})

describe('echelle study-model operations', () => {
  it('applies an echelleCheck operation and records mastery', () => {
    const state = baseState()
    const next = apply(state, [
      {
        kind: 'echelleCheck',
        itemId: 'n1-listening-0',
        answers: ['墨西哥人', '护士'],
        updatedAt: 1000,
      },
    ])
    const record = next.learning.echelle.items['n1-listening-0']
    assert.ok(record)
    assert.strictEqual(record.mastered, true)
    assert.strictEqual(record.attempts, 1)
  })

  it('rejects echelleCheck for unknown item ids', () => {
    const state = baseState()
    assert.throws(
      () => apply(state, [{ kind: 'echelleCheck', itemId: 'n1-unknown-0', answers: [], updatedAt: 1 }]),
      /Invalid operation/,
    )
  })

  it('does not double-count attempts for the same updatedAt', () => {
    const state = baseState()
    const op = { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['墨西哥人', '护士'], updatedAt: 1000 }
    const s1 = apply(state, [op])
    const s2 = apply(s1, [op])
    assert.strictEqual(s2.learning.echelle.items['n1-listening-0'].attempts, 1)
  })

  it('increments attempts for a later updatedAt', () => {
    const state = baseState()
    const s1 = apply(state, [
      { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['加拿大人', '护士'], updatedAt: 1000 },
    ])
    const s2 = apply(s1, [
      { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['墨西哥人', '护士'], updatedAt: 2000 },
    ])
    assert.strictEqual(s2.learning.echelle.items['n1-listening-0'].attempts, 2)
    assert.strictEqual(s2.learning.echelle.items['n1-listening-0'].mastered, true)
  })

  it('lets a correct retry replace a failed attempt with real millisecond clocks', () => {
    const failedAt = Date.now()
    const s1 = apply(baseState(), [
      { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['加拿大人', '护士'], updatedAt: failedAt },
    ])
    const s2 = apply(s1, [
      { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['墨西哥人', '护士'], updatedAt: failedAt + 1 },
    ])
    assert.deepStrictEqual(
      { mastered: s2.learning.echelle.items['n1-listening-0'].mastered, attempts: s2.learning.echelle.items['n1-listening-0'].attempts },
      { mastered: true, attempts: 2 },
    )
  })

  it('rejects echelleCheck with an out-of-range timestamp instead of storing it as 0', () => {
    assert.throws(
      () => apply(baseState(), [
        { kind: 'echelleCheck', itemId: 'n1-listening-0', answers: ['墨西哥人', '护士'], updatedAt: Date.now() * 1000 },
      ]),
      /Invalid operation/,
    )
  })

  it('reports echelle analytics after mastering all level 1 items', () => {
    let state = baseState()
    const items = getEchelleLevelItems(1)
    for (const itemId of items) {
      const item = ECHELLE_ITEM_CATALOG[itemId]
      let response
      if (item.kind === 'production') {
        response =
          item.skill === 'writing'
            ? { wordCount: item.wordMin + 10, selfChecks: item.selfChecks.map(() => true) }
            : { seconds: item.secondsMin + 10, selfChecks: item.selfChecks.map(() => true) }
      }
      state = apply(state, [
        {
          kind: 'echelleCheck',
          itemId,
          answers: item.kind !== 'production' ? item.questions.map((q) => q.answer) : undefined,
          response,
          updatedAt: Date.now() + items.indexOf(itemId),
        },
      ])
    }
    const analytics = studyAnalytics(state, new Date('2025-01-15'))
    assert.ok(analytics.echelle.passedLevels.includes(1))
    assert.strictEqual(analytics.echelle.currentLevel, 2)
  })

  it('validates echelle item records', () => {
    const state = baseState()
    state.learning.echelle.items['n1-listening-0'] = {
      mastered: true,
      score: 1.2,
      attempts: 0,
      updatedAt: 0,
    }
    assert.throws(() => apply(state, []), /Invalid echelle item/)
  })
})
