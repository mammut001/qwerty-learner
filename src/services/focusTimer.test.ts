import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FOCUS_IDLE_MS, type FocusTimerSnapshot, advanceFocusTimer, focusTimerRecordedMinutes } from './focusTimer'

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

test('idle window is two minutes', () => {
  assert.equal(FOCUS_IDLE_MS, 2 * MINUTE)
})

test('a hidden tab keeps counting while the user was active recently', () => {
  // Last input 90 seconds before the next tick (e.g. the tab was hidden in between): the whole gap counts.
  const next = advanceFocusTimer(running(), T0 + 90_000)
  assert.equal(next.status, 'running')
  assert.equal(next.remainingMs, 25 * MINUTE - 90_000)
  assert.equal(next.activeMs, 90_000)
})

test('no input for more than two minutes auto-pauses at the idle boundary', () => {
  const next = advanceFocusTimer(running(), T0 + 10 * MINUTE)
  assert.equal(next.status, 'paused')
  assert.equal(next.pauseReason, 'idle')
  assert.equal(next.lastTickAt, null)
  assert.equal(next.activeMs, FOCUS_IDLE_MS)
  assert.equal(next.remainingMs, 25 * MINUTE - FOCUS_IDLE_MS)
})

test('the countdown finishes on wall-clock time while input keeps arriving', () => {
  // Activity recorded at 30 minutes keeps the timer running until the 25-minute target is used up.
  const next = advanceFocusTimer(running({ lastActivityAt: T0 + 30 * MINUTE }), T0 + 40 * MINUTE)
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
