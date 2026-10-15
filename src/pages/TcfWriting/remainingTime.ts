/**
 * Remaining exam time, derived from the real start time so a refresh or a background tab cannot reset or freeze it.
 * `savedRemainingSeconds` is the last value written to the draft; it can be stale, so the smaller value wins.
 */
export const writingRemainingSeconds = (
  startedAt: number,
  now: number,
  totalSeconds: number,
  savedRemainingSeconds?: number | null,
): number => {
  const elapsedSeconds = Math.floor(Math.max(0, now - startedAt) / 1000)
  const fromClock = Math.max(0, totalSeconds - elapsedSeconds)
  if (savedRemainingSeconds === null || savedRemainingSeconds === undefined) return fromClock
  return Math.max(0, Math.min(fromClock, savedRemainingSeconds))
}
