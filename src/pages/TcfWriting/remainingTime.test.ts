import assert from 'node:assert/strict'
import { test } from 'node:test'
import { writingRemainingSeconds } from './remainingTime'

const TOTAL = 3600
const START = Date.UTC(2026, 9, 10, 9, 0, 0)

test('a fresh exam shows the full hour', () => {
  assert.equal(writingRemainingSeconds(START, START, TOTAL), 3600)
})

test('remaining time counts down from the real start time', () => {
  assert.equal(writingRemainingSeconds(START, START + 25 * 60_000, TOTAL), 35 * 60)
})

test('a refresh after 30 minutes resumes at 30 minutes, not 60', () => {
  // The draft was last written at the very start (remaining 3600); the clock says 30 minutes have passed.
  assert.equal(writingRemainingSeconds(START, START + 30 * 60_000, TOTAL, 3600), 30 * 60)
})

test('a stale saved value never extends the exam', () => {
  // Draft says 40 minutes left, but real time says only 10 are left.
  assert.equal(writingRemainingSeconds(START, START + 50 * 60_000, TOTAL, 40 * 60), 10 * 60)
})

test('an expired exam resumes at zero instead of being floored to a minute', () => {
  assert.equal(writingRemainingSeconds(START, START + 3 * 60 * 60_000, TOTAL, 1200), 0)
  assert.equal(writingRemainingSeconds(START, START + 3600 * 1000 + 500, TOTAL), 0)
})

test('a start time in the future does not inflate the remaining time', () => {
  assert.equal(writingRemainingSeconds(START + 60_000, START, TOTAL), 3600)
})
