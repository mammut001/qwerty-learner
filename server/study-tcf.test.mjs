import { createStudyServer } from './study-plan.mjs'
import {
  TCF_CONFIG,
  TCF_LISTENING_QUESTIONS,
  TCF_READING_QUESTIONS,
  estimateTcfNclc,
  estimateTcfScaledScore,
} from '../src/resources/tcfMock.ts'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('TCF CO/CE content has 39 questions and NCLC 7 targets', () => {
  assert.equal(TCF_LISTENING_QUESTIONS.length, 39)
  assert.equal(TCF_READING_QUESTIONS.length, 39)
  assert.equal(new Set(TCF_LISTENING_QUESTIONS.map((item) => item.id)).size, 39)
  assert.equal(new Set(TCF_READING_QUESTIONS.map((item) => item.id)).size, 39)
  assert.equal(TCF_CONFIG.listening.minutes, 35)
  assert.equal(TCF_CONFIG.reading.minutes, 60)
  assert.equal(TCF_CONFIG.listening.targetScore, 458)
  assert.equal(TCF_CONFIG.reading.targetScore, 453)
  const score26 = estimateTcfScaledScore(26)
  assert.equal(score26, 466)
  assert.ok(estimateTcfNclc('listening', score26) >= 7)
  assert.ok(estimateTcfNclc('reading', score26) >= 7)
  assert.ok(estimateTcfNclc('listening', 457) < 7)
  assert.ok(estimateTcfNclc('reading', 452) < 7)
})

test('TCF attempts persist, materialize and restore through a linked device', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-tcf-'))
  const database = join(dir, 'study.sqlite')
  const options = { database, origin: 'http://localhost:5173' }
  let server
  let base

  const start = async () => {
    server = createStudyServer(options)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  }
  const stop = () => new Promise((resolve) => server.close(resolve))
  const call = async (method, path = '', cookie = '', body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: options.origin,
        Cookie: cookie,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await response.json()
    return { response, data }
  }

  try {
    await start()
    const bootstrap = await call('GET')
    const cookie = bootstrap.response.headers.get('set-cookie').split(';')[0]
    assert.equal((await call('POST', '', cookie, {
      state: { startDate: '2026-10-01', minutes: {}, minimumMode: {} },
    })).response.status, 200)

    const finishedAt = Date.now()
    const answers = TCF_LISTENING_QUESTIONS.map((question, index) => ({
      questionId: question.id,
      choice: index < 26 ? question.answer : null,
      correct: index < 26,
    }))
    const correctCount = answers.filter((item) => item.correct).length
    const scaledScore = estimateTcfScaledScore(correctCount)
    const attempt = {
      id: randomUUID(),
      skill: 'listening',
      questionCount: 39,
      answers,
      correctCount,
      scaledScore,
      nclc: estimateTcfNclc('listening', scaledScore),
      durationSeconds: 1200,
      startedAt: finishedAt - 1200_000,
      finishedAt,
      day: new Date(finishedAt).toISOString().slice(0, 10),
    }
    const mutation = {
      id: randomUUID(),
      operations: [{ kind: 'tcfAttempt', value: attempt }],
    }
    assert.equal((await call('PATCH', '', cookie, mutation)).response.status, 200)
    assert.equal((await call('PATCH', '', cookie, mutation)).response.status, 200, 'TCF mutation replay is idempotent')

    const history = await call('GET', '/tcf-attempts?skill=listening', cookie)
    assert.equal(history.response.status, 200)
    assert.equal(history.data.items.length, 1)
    assert.equal(history.data.items[0].id, attempt.id)
    assert.equal(history.data.items[0].scaledScore, scaledScore)
    assert.equal(history.data.items[0].answers.length, 39)

    const analytics = await call('GET', '/analytics?today=2026-10-05', cookie)
    assert.equal(analytics.data.analytics.tcf.listening.attempts, 1)
    assert.equal(analytics.data.analytics.tcf.listening.latestScore, scaledScore)
    assert.equal(analytics.data.analytics.tcf.listening.targetScore, 458)
    assert.equal(analytics.data.analytics.tcf.reading.attempts, 0)
    assert.equal(analytics.data.analytics.tcf.writing.attempts, 0)
    assert.equal(analytics.data.analytics.tcf.speaking.attempts, 0)

    const invalidFilter = await call('GET', '/tcf-attempts?skill=invalid', cookie)
    assert.equal(invalidFilter.response.status, 400)
    assert.equal(invalidFilter.data.code, 'INVALID_TCF_FILTER')

    const invalidAttempt = {
      ...attempt,
      id: randomUUID(),
      answers: attempt.answers.slice(0, 1),
      correctCount: 1,
    }
    assert.equal((await call('PATCH', '', cookie, {
      id: randomUUID(),
      operations: [{ kind: 'tcfAttempt', value: invalidAttempt }],
    })).response.status, 400)

    const key = await call('POST', '/sync-key', cookie, {})
    assert.equal(key.response.status, 200)
    const linked = await call('POST', '/link', '', { key: key.data.key })
    assert.equal(linked.response.status, 200)
    const linkedCookie = linked.response.headers.get('set-cookie').split(';')[0]
    const linkedHistory = await call('GET', '/tcf-attempts?skill=listening', linkedCookie)
    assert.equal(linkedHistory.data.items[0].id, attempt.id)

    const inspect = new DatabaseSync(database)
    assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM tcf_attempts').get().count, 1)
    assert.equal(Number(inspect.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get().value), 8)
    inspect.close()

    await stop()
    server = null
    await start()
    const restarted = await call('GET', '/tcf-attempts?skill=listening', cookie)
    assert.equal(restarted.response.status, 200)
    assert.equal(restarted.data.items[0].id, attempt.id)
  } finally {
    if (server) await stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
