export const PLACEMENT_RETEST_DAYS = 28

export function daysSinceTimestamp(timestamp: number) {
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000))
}

export function placementRetestDue(finishedAt: number | undefined) {
  if (!finishedAt) return false
  return daysSinceTimestamp(finishedAt) >= PLACEMENT_RETEST_DAYS
}
