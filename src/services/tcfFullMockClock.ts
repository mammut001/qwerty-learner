// The backend supplies a millisecond server timestamp with each full-mock
// response. Midpoint sampling bounds network latency without trusting a
// potentially fast or slow device wall clock.
export function fullMockClockOffset(serverNow: number, sentAt: number, receivedAt: number): number {
  if (![serverNow, sentAt, receivedAt].every(Number.isFinite) || receivedAt < sentAt) {
    throw new Error('INVALID_FULL_MOCK_SERVER_TIME')
  }
  return Math.round(serverNow - (sentAt + receivedAt) / 2)
}

export function correctedFullMockNow(deviceNow: number, offsetMs: number): number {
  return deviceNow + offsetMs
}
