import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'
import { validateFullMockSession, fullMockRemaining, FULL_MOCK_SECONDS, normalizeFullMockSession } from './study-full-mock.mjs'
import { mergeFullMockSessions, hasFullMockRating } from '../src/services/tcfFullMockMerge.ts'

const makeSession = (now = Date.now()) => ({
  version: 1, id: randomUUID(), phase: 'listening', createdAt: now, updatedAt: now,
  stageStartedAt: now, deadlineAt: now + FULL_MOCK_SECONDS.listening * 1000,
  completed: {},
  qcm: { listening: { answers: {}, played: [], index: 0 }, reading: { answers: {}, played: [], index: 0 } },
  writing: {
    taskIds: ['ee-t1-01', 'ee-t2-01', 'ee-t3-01'], texts: ['', '', ''],
    activeTask: 0, scores: { taskCompletion: 0, coherence: 0, vocabulary: 0, grammar: 0 },
  },
  speaking: {
    taskIds: ['eo-t1-01', 'eo-t2-01', 'eo-t3-01'], notes: ['', '', ''], activeTask: 0,
    durations: [0, 0, 0],
    scores: { fluency: 0, pronunciation: 0, vocabulary: 0, grammar: 0, taskCompletion: 0 },
  },
})

test('full mock strict validation, absolute independent section clocks and sequence', () => {
  const session = makeSession()
  assert.equal(validateFullMockSession(session), session)
  assert.equal(fullMockRemaining(session, session.stageStartedAt + 5000), 2095)
  assert.equal(fullMockRemaining(session, session.deadlineAt + 100), 0)
  assert.throws(() => validateFullMockSession({ ...session, deadlineAt: session.deadlineAt + 1000 }), /DEADLINE/)
  assert.throws(() => validateFullMockSession({ ...session, writing: { ...session.writing, texts: ['x'.repeat(10001), '', ''] } }), /EE/)
  assert.throws(() => validateFullMockSession({ ...session, qcm: { ...session.qcm, listening: { ...session.qcm.listening, answers: { 'co-40': 2 } } } }), /QCM/)
  const writing = { ...session, phase: 'writing', deadlineAt: session.stageStartedAt + 3600000 }
  assert.throws(() => validateFullMockSession(writing), /SEQUENCE/)
})

test('full mock session: learner isolation, durable reload, optimistic revision and delete', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-full-mock-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({ database, origin: 'http://localhost:4173' })
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const port = server.address().port
    const call = async (method, cookie = '', data) => {
      const res = await fetch(`http://127.0.0.1:${port}/api/study-plan/tcf-full-mock`, {
        method, headers: { Origin: 'http://localhost:4173', Cookie: cookie, ...(data ? { 'Content-Type': 'application/json' } : {}) },
        body: data ? JSON.stringify(data) : undefined,
      })
      return { status: res.status, cookie: res.headers.get('set-cookie')?.split(';')[0] ?? cookie, data: await res.json() }
    }
    const first = await call('GET')
    const other = await call('GET')
    assert.equal(first.status, 200)
    assert.equal(first.data.session, null)
    const s = makeSession()
    s.qcm.listening.answers['co-01'] = 2
    s.writing.texts[0] = "Bonjour, je voudrais m'inscrire."
    let saved = await call('PUT', first.cookie, { session: s, revision: 0 })
    assert.equal(saved.status, 200)
    assert.equal(saved.data.revision, 1)
    const reload = await call('GET', first.cookie)
    assert.equal(reload.data.session.qcm.listening.answers['co-01'], 2)
    assert.equal(reload.data.session.writing.texts[0], s.writing.texts[0])
    assert.equal((await call('GET', other.cookie)).data.session, null)
    assert.equal((await call('PUT', first.cookie, { session: s, revision: 0 })).status, 409)

    const changed = { ...s, updatedAt: Date.now(), qcm: {
      ...s.qcm, listening: { ...s.qcm.listening, index: 3 },
    } }
    saved = await call('PUT', first.cookie, { session: changed, revision: 1 })
    assert.equal(saved.status, 200)
    assert.equal(saved.data.revision, 2)
    assert.equal((await call('GET', first.cookie)).data.session.qcm.listening.index, 3)
    assert.equal((await call('PUT', first.cookie, { session: { ...changed, phase: 'reading' }, revision: 2 })).status, 400)
    assert.equal((await call('PUT', first.cookie, { session: { ...changed, writing: { ...changed.writing, texts: ['x'.repeat(20001), '', ''] } }, revision: 2 })).status, 400)
    const fast = makeSession(Date.now() + 10 * 60_000)
    const fastFirst = await call('PUT', first.cookie, { session: fast, revision: 2 })
    assert.equal(fastFirst.status, 200, 'a fast-clock learner must not receive HTTP 400')
    assert.equal(fastFirst.data.revision, 3)
    assert.ok(fastFirst.data.session.createdAt <= Date.now(), 'timestamps use the server clock')
    assert.equal(fastFirst.data.session.deadlineAt - fastFirst.data.session.stageStartedAt, 2100_000)
    const fastAgain = structuredClone(fast)
    fastAgain.qcm.listening.answers['co-02'] = 3
    fastAgain.updatedAt += 3000
    const anotherSave = await call('PUT', first.cookie, { session: fastAgain, revision: 3 })
    assert.equal(anotherSave.status, 200)
    assert.equal(anotherSave.data.session.deadlineAt, fastFirst.data.session.deadlineAt, 'later writes cannot extend the deadline')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('two devices merge distinct answers, server wins same-question conflicts despite a faster local clock', () => {
  const base = makeSession()
  const remote = structuredClone(base)
  remote.qcm.listening.answers['co-01'] = 1
  remote.qcm.listening.played.push('co-01')
  remote.updatedAt += 20
  const local = structuredClone(base)
  local.qcm.listening.answers['co-02'] = 2
  local.qcm.listening.played.push('co-02')
  local.updatedAt += 60_000_000 // clock skew never authorizes replacing the server
  const merged = mergeFullMockSessions(remote, local, base)
  assert.deepEqual(merged.qcm.listening.answers, { 'co-01': 1, 'co-02': 2 })
  assert.equal(merged.updatedAt, remote.updatedAt, 'stale fast-clock metadata must not force another upload')
  assert.deepEqual(new Set(merged.qcm.listening.played), new Set(['co-01', 'co-02']))
  assert.equal(merged.deadlineAt, remote.deadlineAt)
  const withoutBase = mergeFullMockSessions(remote, local)
  assert.deepEqual(withoutBase.qcm.listening.answers, { 'co-01': 1, 'co-02': 2 })

  // Reload after B saved Q1 and A saved Q2: the active question is Q2.
  // A stale browser copy with a future timestamp must neither erase Q2 nor
  // cause the UI to advance to Q3 when it reloads.
  const serverBoth = structuredClone(remote)
  serverBoth.qcm.listening.answers['co-02'] = 2
  serverBoth.qcm.listening.index = 1
  serverBoth.updatedAt += 30
  serverBoth.writing.ratedFields = []
  serverBoth.speaking.ratedFields = []
  const staleDevice = structuredClone(remote)
  staleDevice.writing.ratedFields = []
  staleDevice.speaking.ratedFields = []
  staleDevice.updatedAt += 9_999_999
  const reloaded = mergeFullMockSessions(serverBoth, staleDevice)
  assert.deepEqual(reloaded.qcm.listening.answers, { 'co-01': 1, 'co-02': 2 })
  assert.equal(reloaded.qcm.listening.index, 1, 'the server Q2 cursor survives refresh')
  assert.equal(reloaded.updatedAt, serverBoth.updatedAt, 'refresh does not re-upload an artificially newer local timestamp')
  assert.deepEqual(reloaded, serverBoth, 'stale reload is exactly the server session, with no write to overwrite Q2')

  const bothTouched = structuredClone(local)
  bothTouched.qcm.listening.answers['co-01'] = 3
  const conflict = mergeFullMockSessions(remote, bothTouched, base)
  assert.equal(conflict.qcm.listening.answers['co-01'], 1, 'server answer wins a genuine same-question conflict')
  assert.equal(conflict.qcm.listening.answers['co-02'], 2)
  // A keystroke made while this device's own request was in flight is new
  // relative to the submitted snapshot; it must survive its own ACK.
  const submitted = structuredClone(remote)
  const pending = structuredClone(submitted)
  pending.qcm.listening.answers['co-01'] = 0
  assert.equal(mergeFullMockSessions(remote, pending, submitted).qcm.listening.answers['co-01'], 0)
  assert.equal(mergeFullMockSessions(remote, { ...local, id: randomUUID() }).id, remote.id, 'other sittings cannot overwrite the active server sitting')
})

test('explicit scoring excludes unrated EE/EO and accepts an intentionally selected 0', () => {
  const sitting = makeSession()
  assert.equal(hasFullMockRating(sitting, 'writing'), false)
  assert.equal(hasFullMockRating(sitting, 'speaking'), false)
  sitting.writing.ratedFields = Object.keys(sitting.writing.scores)
  assert.equal(hasFullMockRating(sitting, 'writing'), true)
  sitting.speaking.ratedFields = ['fluency']
  assert.equal(hasFullMockRating(sitting, 'speaking'), false)
  sitting.speaking.ratedFields = Object.keys(sitting.speaking.scores)
  assert.equal(hasFullMockRating(sitting, 'speaking'), true)
  const next = structuredClone(sitting)
  next.phase = 'complete'
  next.deadlineAt = 0
  next.completed = Object.fromEntries(['listening', 'reading', 'writing', 'speaking'].map((skill, position) =>
    [skill, { score: position >= 2 ? null : 0, nclc: position >= 2 ? null : 0,
      startedAt: sitting.createdAt, finishedAt: sitting.createdAt }]))
  assert.equal(validateFullMockSession(next), next, 'unrated sections have no numeric score')
  next.completed.listening.score = null
  assert.throws(() => validateFullMockSession(next), /RESULT/)
})

test('fast device timestamp is server-normalized without extending the current section deadline', () => {
  const now = Date.now()
  const skewed = makeSession(now + 10 * 60_000)
  skewed.qcm.listening.answers['co-01'] = 2
  const stored = normalizeFullMockSession(skewed, null, now)
  assert.equal(stored.createdAt, now)
  assert.equal(stored.updatedAt, now)
  assert.equal(stored.deadlineAt - stored.stageStartedAt, FULL_MOCK_SECONDS.listening * 1000)
  const later = structuredClone(skewed)
  later.updatedAt += 2000
  later.qcm.listening.answers['co-02'] = 3
  const updated = normalizeFullMockSession(later, stored, now + 2000)
  assert.equal(updated.createdAt, stored.createdAt)
  assert.equal(updated.stageStartedAt, stored.stageStartedAt)
  assert.equal(updated.deadlineAt, stored.deadlineAt)
  assert.equal(updated.qcm.listening.answers['co-02'], 3)
  assert.equal(validateFullMockSession(updated), updated)
})
