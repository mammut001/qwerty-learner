import type { FullMockSession } from './tcfFullMock'

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const phaseRank = (phase: FullMockSession['phase']) =>
  phase === 'complete' ? 4 : ['listening', 'reading', 'writing', 'speaking'].indexOf(phase)

// Three-way merge when the last acknowledged server snapshot is available.
// If both devices touched one field, the server wins. A locally changed field
// is retained only when the server still has the acknowledged value.
// Without a base snapshot we union distinct QCM answers and favor the server
// for same-question conflicts; never compare client clocks for authority.
export function mergeFullMockSessions(
  remote: FullMockSession | null,
  local: FullMockSession | null,
  base: FullMockSession | null = null,
): FullMockSession | null {
  if (!remote) return local
  if (!local || local.id !== remote.id) return remote
  const ancestor = base?.id === remote.id ? base : null
  // The server ACK may normalize timestamps. If nothing changed while that
  // request was in flight, adopt it verbatim instead of re-uploading the
  // previous (potentially fast-clock) timestamp forever.
  if (ancestor && same(local, ancestor)) return remote
  const choose = <T,>(serverValue: T | undefined, localValue: T | undefined, before: T | undefined): T | undefined => {
    if (same(serverValue, localValue)) return serverValue
    // QCM does not support deleting an answer. Absence on the local copy
    // must never delete a previously persisted server answer, even if a
    // stale baseline happened to contain it.
    if (localValue === undefined) return serverValue
    if (serverValue === undefined) return localValue
    if (ancestor) {
      if (same(serverValue, before)) return localValue
      return serverValue
    }
    // Missing on one side is not a conflicting answer; keep any actual work.
    if (serverValue === undefined || serverValue === null || serverValue === '') return localValue
    return serverValue
  }
  const selectMap = <T,>(server: Record<string, T>, mine: Record<string, T>, before?: Record<string, T>) => {
    const result: Record<string, T> = {}
    for (const key of Array.from(new Set([...Object.keys(server), ...Object.keys(mine)]))) {
      const value = choose(server[key], mine[key], before?.[key])
      if (value !== undefined) result[key] = value
    }
    return result
  }
  const mergeStrings = (server: string[], mine: string[], before?: string[]) =>
    server.map((value, index) => choose(value, mine[index], before?.[index]) ?? value) as [string, string, string]
  const localLater = phaseRank(local.phase) > phaseRank(remote.phase)
  const leading = localLater ? local : remote
  const result: FullMockSession = {
    ...leading,
    createdAt: remote.createdAt,
    // Client clocks are not an authority for server revisions. Retain the
    // acknowledged server timestamp; new answers still get persisted via CAS.
    updatedAt: remote.updatedAt,
    completed: { ...local.completed, ...remote.completed },
    qcm: {
      listening: {
        answers: selectMap(remote.qcm.listening.answers, local.qcm.listening.answers, ancestor?.qcm.listening.answers),
        played: Array.from(new Set([...remote.qcm.listening.played, ...local.qcm.listening.played])),
        index: choose(remote.qcm.listening.index, local.qcm.listening.index, ancestor?.qcm.listening.index) ?? remote.qcm.listening.index,
      },
      reading: {
        answers: selectMap(remote.qcm.reading.answers, local.qcm.reading.answers, ancestor?.qcm.reading.answers),
        played: Array.from(new Set([...remote.qcm.reading.played, ...local.qcm.reading.played])),
        index: choose(remote.qcm.reading.index, local.qcm.reading.index, ancestor?.qcm.reading.index) ?? remote.qcm.reading.index,
      },
    },
    writing: {
      ...remote.writing,
      texts: mergeStrings(remote.writing.texts, local.writing.texts, ancestor?.writing.texts),
      activeTask: choose(remote.writing.activeTask, local.writing.activeTask, ancestor?.writing.activeTask) ?? remote.writing.activeTask,
      scores: selectMap(remote.writing.scores, local.writing.scores, ancestor?.writing.scores) as FullMockSession['writing']['scores'],
      ratedFields: Array.from(new Set([...(remote.writing.ratedFields ?? []), ...(local.writing.ratedFields ?? [])])),
    },
    speaking: {
      ...remote.speaking,
      notes: mergeStrings(remote.speaking.notes, local.speaking.notes, ancestor?.speaking.notes),
      activeTask: choose(remote.speaking.activeTask, local.speaking.activeTask, ancestor?.speaking.activeTask) ?? remote.speaking.activeTask,
      durations: remote.speaking.durations.map((n, i) => Math.max(n, local.speaking.durations[i])) as [number, number, number],
      scores: selectMap(remote.speaking.scores, local.speaking.scores, ancestor?.speaking.scores) as FullMockSession['speaking']['scores'],
      ratedFields: Array.from(new Set([...(remote.speaking.ratedFields ?? []), ...(local.speaking.ratedFields ?? [])])),
    },
  }
  // Never resurrect an earlier phase or replace a previously accepted deadline
  // with a clock-adjusted or stale one.
  if (!localLater) {
    result.phase = remote.phase
    result.stageStartedAt = remote.stageStartedAt
    result.deadlineAt = remote.deadlineAt
  }
  // Completed results may be revised only by an explicit later rating.
  for (const skill of ['writing', 'speaking'] as const) {
    const newer = local.completed[skill]
    const prior = ancestor?.completed[skill]
    if (newer && remote.completed[skill] && ancestor &&
        same(remote.completed[skill], prior) && !same(newer, prior)) {
      result.completed[skill] = newer
    }
  }
  return result
}

export function hasFullMockRating(session: FullMockSession, skill: 'writing' | 'speaking'): boolean {
  const values = session[skill].scores
  return Object.keys(values).every((field) => session[skill].ratedFields?.includes(field))
}
