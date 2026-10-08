import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { PLACEMENT_QUESTIONS, buildPlacementDailyBoost, computePlacementResult } from './placement-data.mjs'
import { apply, buildTodayTaskPlan, normalizeState } from './study-model.mjs'

const base = () =>
  normalizeState({
    startDate: '2026-10-01',
    minutes: {},
    minimumMode: {},
  })

test('placement result is recomputed and stored on learner state', () => {
  const answers = PLACEMENT_QUESTIONS.map((q) => ({ questionId: q.id, choiceIndex: q.correctIndex }))
  const result = computePlacementResult({
    answers,
    startedAt: 1,
    finishedAt: 120_000,
    durationSeconds: 120,
    day: '2026-10-01',
    id: randomUUID(),
  })
  assert.equal(result.cefrLevel, 'B2+')
  const next = apply(base(), [{ kind: 'placementResult', value: result }])
  assert.equal(next.learning.placement.latest.id, result.id)
  assert.equal(next.learning.placement.history.length, 1)
})

test('placement daily boost injects focus tasks without changing the daily minute budget', () => {
  const answers = PLACEMENT_QUESTIONS.map((q) => ({
    questionId: q.id,
    choiceIndex: q.section === 'reading' ? 0 : q.correctIndex,
  }))
  const result = computePlacementResult({
    answers,
    startedAt: 1,
    finishedAt: 2,
    durationSeconds: 1,
    day: '2026-10-01',
    id: randomUUID(),
  })
  const boost = buildPlacementDailyBoost(result)
  assert.equal(boost.focusTask.id, 'smart-placement-focus')
  const state = apply(base(), [{ kind: 'placementResult', value: result }])
  state.settings.dailyTargetMinutes = 60
  const today = buildTodayTaskPlan(state, '2026-10-05')
  assert.ok(today.placement)
  assert.ok(today.tasks.some((task) => task.id === 'smart-placement-focus'))
  assert.ok(today.tasks.some((task) => task.id === 'smart-placement-secondary'))
  assert.equal(today.tasks.reduce((total, task) => total + task.minutes, 0), 60)
})

test('tampered placement level is rejected', () => {
  const answers = [{ questionId: PLACEMENT_QUESTIONS[0].id, choiceIndex: 0 }]
  const result = computePlacementResult({
    answers,
    startedAt: 1,
    finishedAt: 2,
    durationSeconds: 1,
    day: '2026-10-01',
    id: randomUUID(),
  })
  const bad = { ...result, cefrLevel: 'B2+' }
  assert.throws(() => apply(base(), [{ kind: 'placementResult', value: bad }]), /level mismatch/)
})
