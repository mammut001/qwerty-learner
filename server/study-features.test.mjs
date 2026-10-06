import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  activeErrorBookCandidates,
  buildAchievementCandidates,
  buildErrorBookEntries,
  buildWeeklyReport,
  streakFromCheckins,
} from './study-features.mjs'

const baseState = () => ({
  startDate: '2026-10-01',
  minutes: {},
  learning: {
    vocabulary: { records: [] },
    grammar: { history: [] },
    conjugation: {},
    conjugationDaily: {},
    conjugationAttempts: [],
  },
})

test('error book unifies three practice types and retires after three consecutive correct attempts', () => {
  const state = baseState()
  state.learning.vocabulary.records = [
    { id: '1', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 100, day: '2026-10-01', wrongCount: 2 },
    { id: '2', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 200, day: '2026-10-02', wrongCount: 0 },
    { id: '3', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 300, day: '2026-10-03', wrongCount: 0 },
    { id: '4', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 400, day: '2026-10-04', wrongCount: 0 },
  ]
  state.learning.grammar.history = [
    {
      id: 'g1',
      topic: 'pc vs imp',
      finishedAt: 1000,
      day: '2026-10-01',
      items: [{ id: 'rule-1', label: '过去习惯', prompt: 'Q', correct: false }],
    },
    {
      id: 'g2',
      topic: 'pc vs imp',
      finishedAt: 2000,
      day: '2026-10-02',
      items: [{ id: 'rule-1', label: '过去习惯', prompt: 'Q', correct: true }],
    },
  ]
  state.learning.conjugation = { venir: { present: { correct: 1, total: 2 } } }
  state.learning.conjugationAttempts = [
    { id: 'c1', verb: 'venir', tense: 'present', correct: false, day: '2026-10-01', occurredAt: 1000 },
    { id: 'c2', verb: 'venir', tense: 'present', correct: true, day: '2026-10-02', occurredAt: 2000 },
  ]

  const entries = buildErrorBookEntries(state)
  const vocab = entries.find((item) => item.kind === 'vocabulary')
  const grammar = entries.find((item) => item.kind === 'grammar')
  const conjugation = entries.find((item) => item.kind === 'conjugation')
  assert.equal(vocab.mastered, true)
  assert.equal(vocab.correctStreak, 3)
  assert.equal(vocab.errorCount, 2)
  assert.equal(grammar.mastered, false)
  assert.equal(grammar.correctStreak, 1)
  assert.equal(conjugation.mastered, false)
  assert.equal(conjugation.correctStreak, 1)
  assert.equal(activeErrorBookCandidates(state).some((item) => item.itemId === vocab.itemId), false)

  state.learning.vocabulary.records.push(
    { id: '5', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 500, day: '2026-10-05', wrongCount: 1 },
  )
  const resurfaced = buildErrorBookEntries(state).find((item) => item.kind === 'vocabulary')
  assert.equal(resurfaced.mastered, false)
  assert.equal(resurfaced.correctStreak, 0)
  assert.equal(activeErrorBookCandidates(state).some((item) => item.itemId === resurfaced.itemId), true)
})

test('achievements and checkin streak use backend-derived completed days', () => {
  const state = baseState()
  state.learning.vocabulary.records = Array.from({ length: 100 }, (_, index) => ({
    word: 'word-' + index,
  }))
  state.minutes = { '2026-10-01': { a: 1800 } }
  const achievements = buildAchievementCandidates(state, ['2026-10-01', '2026-10-02', '2026-10-03'])
  assert.ok(achievements.some((item) => item.id === 'vocab-100'))
  assert.ok(achievements.some((item) => item.id === 'streak-3'))
  assert.ok(achievements.some((item) => item.id === 'minutes-1800'))
  assert.deepEqual(streakFromCheckins(['2026-10-01', '2026-10-02', '2026-10-03'], '2026-10-03'), {
    current: 3,
    longest: 3,
  })
})

test('weekly report includes completion, accuracy changes, weak points and deterministic suggestions', () => {
  const state = baseState()
  state.learning.vocabulary.records = [
    { id: 'v1', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 1, day: '2026-10-01', wrongCount: 1 },
    { id: 'v2', word: 'prendre', dict: 'd', chapter: 0, timeStamp: 2, day: '2026-10-02', wrongCount: 0 },
  ]
  state.learning.grammar.history = [{
    id: 'g1', topic: 'pc', score: 1, total: 2, day: '2026-10-01', finishedAt: 1,
    items: [{ id: 'x', label: '过去习惯', correct: false }],
  }]
  state.learning.conjugationDaily = { '2026-10-01': { correct: 1, total: 2 } }
  const daySummaries = Array.from({ length: 7 }, (_, index) => ({
    day: `2026-10-0${index + 1}`,
    plannedMinutes: index < 5 ? 60 : 0,
    actualMinutes: index < 3 ? 60 : 0,
    complete: index < 3,
  }))
  const report = buildWeeklyReport(state, '2026-10-01', daySummaries, {
    accuracy: { vocabulary: 40, grammar: 60, conjugation: 40 },
  })
  assert.equal(report.minutes, 180)
  assert.equal(report.plannedMinutes, 300)
  assert.equal(report.completionPercent, 60)
  assert.equal(report.accuracy.vocabulary, 50)
  assert.equal(report.accuracy.grammar, 50)
  assert.equal(report.accuracy.conjugation, 50)
  assert.equal(report.accuracyChange.vocabularyAccuracy, 10)
  assert.ok(report.weakPoints.some((item) => item.label === 'prendre'))
  assert.ok(report.suggestions.length > 0)
})
