import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import {
  buildStudyDashboard,
  buildTodayTaskPlan,
  exportPlan,
  importOperations,
  normalizeState,
} from './study-model.mjs'

const baseState = () => normalizeState({
  startDate: '2026-10-01',
  settings: {
    examDate: '2027-03-31',
    dailyTargetMinutes: 60,
    studyDays: [1, 2, 3, 4, 5, 6, 0],
  },
  minutes: {
    '2026-10-03': { 'manual-study': 30 },
    '2026-10-04': { 'manual-study': 45 },
  },
  minimumMode: {},
  learning: {
    vocabulary: {
      records: [{
        id: randomUUID(),
        word: 'prendre',
        dict: 'tcf-canada-foundation-01',
        chapter: 0,
        timeStamp: 1791014400,
        day: '2026-10-03',
        durationMs: 1200,
        wrongCount: 1,
        wrongKeys: ['x'],
      }],
    },
    grammar: {
      draft: null,
      history: [{
        id: randomUUID(),
        topic: 'pc-vs-imp',
        score: 0,
        total: 1,
        elapsedSeconds: 300,
        finishedAt: 1791061200000,
        day: '2026-10-03',
        answers: { 1: 'A' },
        reasons: { 1: 'test' },
        outputAnswers: [],
        items: [{ id: 'rule-1', label: '过去习惯', correct: false }],
      }],
    },
    conjugation: { prendre: { present: { correct: 0, total: 1 } } },
    conjugationDaily: { '2026-10-03': { correct: 0, total: 1 } },
    conjugationAttempts: [{
      id: randomUUID(),
      verb: 'prendre',
      tense: 'present',
      correct: false,
      day: '2026-10-03',
      occurredAt: 1791061300000,
    }],
    reviews: { items: {} },
  },
})

test('dashboard exposes heatmap, module mastery and a pace-based completion projection', () => {
  const state = baseState()
  const dashboard = buildStudyDashboard(state, '2026-10-05')
  assert.equal(dashboard.heatmap.length, 90)
  assert.deepEqual(dashboard.heatmap.at(-2), {
    day: '2026-10-04',
    minutes: 45,
    plannedMinutes: 60,
    completionPercent: 75,
  })
  assert.equal(dashboard.mastery.vocabulary.known, 1)
  assert.equal(dashboard.mastery.vocabulary.activeErrors, 1)
  assert.equal(dashboard.mastery.vocabulary.percent, 0)
  assert.equal(dashboard.mastery.grammar.activeErrors, 1)
  assert.equal(dashboard.mastery.conjugation.activeErrors, 1)
  assert.ok(dashboard.projection.totalPlannedMinutes > 0)
  assert.equal(dashboard.projection.completedMinutes, 75)
  assert.ok(dashboard.projection.averageDailyMinutes > 0)
  assert.match(dashboard.projection.predictedCompletionDate, /^\d{4}-\d{2}-\d{2}$/)
})

test('smart today plan prioritizes due review and never exceeds the configured daily target', () => {
  const state = baseState()
  const today = buildTodayTaskPlan(state, '2026-10-05')
  assert.equal(today.targetMinutes, 60)
  assert.equal(today.dueReviews, 3)
  assert.equal(today.activeErrors, 3)
  assert.ok(today.tasks.some((task) => task.id === 'smart-review'))
  assert.ok(today.tasks.some((task) => task.id === 'smart-vocab'))
  assert.ok(today.tasks.some((task) => task.id === 'smart-grammar'))
  assert.ok(today.tasks.some((task) => task.id === 'smart-conjugation'))
  assert.equal(today.tasks.reduce((total, task) => total + task.minutes, 0), 60)
  assert.ok(today.tasks.every((task) => task.minutes > 0))
})

test('backup v5 exports schema version and imports remain compatible with v1 through v5', () => {
  const state = baseState()
  const backup = exportPlan(state)
  assert.equal(backup.version, 5)
  assert.equal(backup.schemaVersion, 8)
  for (const version of [1, 2, 3, 4, 5]) {
    const operations = importOperations({
      format: 'qwerty-study-plan',
      version,
      state,
    })
    assert.equal(operations.length, 1)
    assert.equal(operations[0].kind, 'replace')
  }
  assert.throws(() => importOperations({ format: 'qwerty-study-plan', version: 99, state }))
})
