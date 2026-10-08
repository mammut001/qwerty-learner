import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PLACEMENT_QUESTIONS, buildPlacementDailyBoost, computePlacementResult } from './placement-data.mjs'
import { randomUUID } from 'node:crypto'

test('buildPlacementDailyBoost picks focus from weakest section', () => {
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
  assert.equal(boost.weakestSection, 'reading')
  assert.match(boost.focusTask.href, /tcf-reading/)
})
