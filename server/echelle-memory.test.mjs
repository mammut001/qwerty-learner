import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DAY_MS,
  REVIEW_INTERVAL_DAYS,
  TARGET_RETENTION,
  estimateRetention,
  isLongTerm,
  memoryStatus,
  nextMemory,
} from './echelle-memory.mjs'
import { apply, emptyLearningProgress, normalizeState, studyAnalytics } from './study-model.mjs'

const T0 = Date.UTC(2026, 0, 5, 12)
const CORRECT = ['墨西哥人', '护士']
const WRONG = ['加拿大人', '护士']

const baseState = (echelleItems = {}) =>
  normalizeState({
    startDate: '2025-01-01',
    minutes: {},
    minimumMode: {},
    learning: { ...emptyLearningProgress(), echelle: { items: echelleItems } },
    syncMeta: { startDateUpdatedAt: 0, settingsUpdatedAt: 0, minimumModeUpdatedAt: {}, minutesUpdatedAt: {}, grammarDraftUpdatedAt: 0 },
  })

const check = (state, at, answers, itemId = 'n1-listening-0') =>
  apply(state, [{ kind: 'echelleCheck', itemId, answers, updatedAt: at }])

const evaluation = (passed, at) => ({
  passed,
  scores: { realisation: passed ? 3 : 1, coherence: 3, lexique: 3, grammaire: 3 },
  mean: passed ? 3 : 2.5,
  estimatedLevel: 1,
  feedbackZh: '好',
  provider: 'mock',
  model: 'mock-1',
  rubricVersion: 'echelle-prod-v1',
  evaluatedAt: at,
  corrections: [],
})

describe('forgetting-curve schedule', () => {
  it('walks the expanding intervals when every review is passed on time', () => {
    let memory
    let at = T0
    const intervals = []
    for (let i = 0; i < REVIEW_INTERVAL_DAYS.length + 2; i++) {
      memory = nextMemory(memory, true, at)
      intervals.push(Math.round((memory.dueAt - at) / DAY_MS))
      at = memory.dueAt
    }
    assert.deepEqual(intervals, [...REVIEW_INTERVAL_DAYS, 120, 120])
  })

  it('keeps the schedule when practising before the review is due', () => {
    const first = nextMemory(undefined, true, T0)
    const early = nextMemory(first, true, T0 + DAY_MS / 2)
    assert.equal(early.stage, 1)
    assert.equal(early.dueAt, first.dueAt)
  })

  it('treats a failed check after mastery as forgetting', () => {
    const second = nextMemory(nextMemory(undefined, true, T0), true, T0 + DAY_MS)
    const lapsed = nextMemory(second, false, T0 + 4 * DAY_MS)
    assert.deepEqual(
      { mastered: lapsed.mastered, stage: lapsed.stage, dueAt: lapsed.dueAt, lapses: lapsed.lapses },
      { mastered: false, stage: 0, dueAt: null, lapses: 1 },
    )
    assert.equal(nextMemory(lapsed, true, T0 + 5 * DAY_MS).stage, 1)
  })

  it('reports status, retention and long-term memory', () => {
    const memory = nextMemory(undefined, true, T0)
    assert.equal(memoryStatus(undefined, T0), 'new')
    assert.equal(memoryStatus({ ...memory, mastered: false }, T0), 'learning')
    assert.equal(memoryStatus(memory, T0 + DAY_MS - 1), 'mastered')
    assert.equal(memoryStatus(memory, T0 + DAY_MS), 'due')
    assert.equal(estimateRetention(memory, T0), 1)
    assert.ok(Math.abs(estimateRetention(memory, T0 + DAY_MS) - TARGET_RETENTION) < 1e-9)
    assert.ok(estimateRetention(memory, T0 + 3 * DAY_MS) < TARGET_RETENTION)
    assert.equal(isLongTerm({ ...memory, stage: 5 }), true)
    assert.equal(isLongTerm(memory), false)
  })
})

describe('echelle memory in the study model', () => {
  it('schedules the first review one day after mastery and advances when reviewed on time', () => {
    const s1 = check(baseState(), T0, CORRECT)
    assert.equal(s1.learning.echelle.items['n1-listening-0'].dueAt, T0 + DAY_MS)
    const s2 = check(s1, T0 + DAY_MS, CORRECT)
    const item = s2.learning.echelle.items['n1-listening-0']
    assert.deepEqual({ stage: item.stage, dueAt: item.dueAt }, { stage: 2, dueAt: T0 + 3 * DAY_MS })
  })

  it('drops a forgotten item and therefore the level pass', () => {
    const s1 = check(baseState(), T0, CORRECT)
    const s2 = check(s1, T0 + DAY_MS, WRONG)
    assert.equal(s2.learning.echelle.items['n1-listening-0'].mastered, false)
    assert.equal(s2.learning.echelle.items['n1-listening-0'].lapses, 1)
  })

  it('migrates records written before scheduling existed', () => {
    const state = baseState({ 'n1-listening-0': { mastered: true, score: 1, attempts: 1, updatedAt: T0 } })
    assert.deepEqual(
      (({ stage, dueAt, lastPassedAt, lapses }) => ({ stage, dueAt, lastPassedAt, lapses }))(state.learning.echelle.items['n1-listening-0']),
      { stage: 1, dueAt: T0 + DAY_MS, lastPassedAt: T0, lapses: 0 },
    )
  })

  it('counts due reviews in analytics', () => {
    const state = check(baseState(), T0, CORRECT)
    assert.equal(studyAnalytics(state, new Date(T0 + DAY_MS / 2)).echelle.dueItems, 0)
    assert.equal(studyAnalytics(state, new Date(T0 + 2 * DAY_MS)).echelle.dueItems, 1)
  })

  it('does not let a self-assessment master writing when AI scoring is required', () => {
    const op = {
      kind: 'echelleCheck',
      itemId: 'n1-writing-production',
      response: { selfChecks: [true, true, true], wordCount: 20 },
      updatedAt: T0,
    }
    assert.equal(apply(baseState(), [op]).learning.echelle.items['n1-writing-production'].mastered, true)
    const strict = apply(baseState(), [op], { selfAssessProduction: false }).learning.echelle.items['n1-writing-production']
    assert.deepEqual({ mastered: strict.mastered, method: strict.method }, { mastered: false, method: 'self' })
  })

  it('accepts AI evaluations only from the server', () => {
    const op = { kind: 'echelleEvaluation', itemId: 'n1-writing-production', evaluation: evaluation(true, T0), wordCount: 12, updatedAt: T0 }
    assert.throws(() => apply(baseState(), [op]), /Invalid operation/)
    const item = apply(baseState(), [op], { trusted: true }).learning.echelle.items['n1-writing-production']
    assert.deepEqual(
      { mastered: item.mastered, method: item.method, stage: item.stage, mean: item.ai.mean },
      { mastered: true, method: 'ai', stage: 1, mean: 3 },
    )
  })

  it('rejects malformed AI evaluations even from the server', () => {
    const op = {
      kind: 'echelleEvaluation',
      itemId: 'n1-writing-production',
      evaluation: { ...evaluation(true, T0), scores: { realisation: 9 } },
      updatedAt: T0,
    }
    assert.throws(() => apply(baseState(), [op], { trusted: true }), /Invalid echelle evaluation/)
  })
})
