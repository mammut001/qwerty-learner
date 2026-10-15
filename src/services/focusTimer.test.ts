import assert from 'node:assert/strict'
import { test } from 'node:test'
import { type FocusTimerSnapshot, advanceFocusTimer, focusTimerRecordedMinutes } from './focusTimer'

const T0 = Date.UTC(2026, 9, 10, 9, 0, 0)
const MINUTE = 60_000

const running = (overrides: Partial<FocusTimerSnapshot> = {}): FocusTimerSnapshot => ({
  version: 1,
  day: '2026-10-10',
  taskId: 'focus',
  title: '专注',
  targetMinutes: 25,
  activeMs: 0,
  remainingMs: 25 * MINUTE,
  status: 'running',
  lastTickAt: T0,
  lastActivityAt: T0,
  pauseReason: null,
  committed: false,
  ...overrides,
})

test('a background tab does not freeze the countdown', () => {
  // The tab was hidden for 10 minutes with no input; the next tick should count the whole gap.
  const next = advanceFocusTimer(running(), T0 + 10 * MINUTE)
  assert.equal(next.status, 'running')
  assert.equal(next.remainingMs, 15 * MINUTE)
  assert.equal(next.activeMs, 10 * MINUTE)
})

test('the countdown finishes on wall-clock time even after a long gap', () => {
  const next = advanceFocusTimer(running(), T0 + 40 * MINUTE)
  assert.equal(next.status, 'finished')
  assert.equal(next.remainingMs, 0)
  assert.equal(focusTimerRecordedMinutes(next), 25)
})

test('an explicit pause stops the countdown until it is resumed', () => {
  const paused = running({ status: 'paused', lastTickAt: null, pauseReason: 'manual' })
  assert.equal(advanceFocusTimer(paused, T0 + 10 * MINUTE), paused)
})

test('recorded minutes are whole minutes of counted time, capped at the target', () => {
  assert.equal(focusTimerRecordedMinutes(running({ activeMs: 4.5 * MINUTE })), 4)
  assert.equal(focusTimerRecordedMinutes(running({ activeMs: 90 * MINUTE })), 25)
})
