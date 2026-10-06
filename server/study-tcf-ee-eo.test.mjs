import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'
import { countFrenchWords, calculateEeTotalScore, estimateTcfEeNclc, calculateEoTotalScore, estimateTcfEoNclc } from '../src/resources/tcfEvaluation.ts'

test('countFrenchWords accurately counts French words treating apostrophes as delimiters', () => {
  assert.equal(countFrenchWords(""), 0)
  assert.equal(countFrenchWords("Bonjour tout le monde !"), 4)
  assert.equal(countFrenchWords("l'école"), 2) // l' and école
  assert.equal(countFrenchWords("d'accord"), 2) // d' and accord
  assert.equal(countFrenchWords("C'est l'histoire d'un homme d'affaires."), 9) // C', est, l', histoire, d', un, homme, d', affaires
  assert.equal(countFrenchWords("C'est l'histoire"), 4) // C', est, l', histoire
  assert.equal(countFrenchWords("rendez-vous"), 1) // hyphenated words remain single word
  assert.equal(countFrenchWords("peut-être"), 1)
})

test('EE and EO score calculation and NCLC estimations', () => {
  // EE
  assert.equal(calculateEeTotalScore({ taskCompletion: 3, coherence: 2, vocabulary: 3, grammar: 2 }), 10)
  assert.equal(estimateTcfEeNclc(10), 7)
  assert.equal(estimateTcfEeNclc(9), 6)
  assert.equal(estimateTcfEeNclc(12), 8)
  assert.equal(estimateTcfEeNclc(14), 9)
  assert.equal(estimateTcfEeNclc(16), 10)
  assert.equal(estimateTcfEeNclc(3), 0)

  // EO
  assert.equal(calculateEoTotalScore({ fluency: 2, pronunciation: 2, vocabulary: 2, grammar: 2, taskCompletion: 2 }), 10)
  assert.equal(estimateTcfEoNclc(10), 7)
  assert.equal(estimateTcfEoNclc(11), 7)
  assert.equal(estimateTcfEoNclc(9), 6)
  assert.equal(estimateTcfEoNclc(12), 8)
  assert.equal(estimateTcfEoNclc(14), 9)
  assert.equal(estimateTcfEoNclc(16), 10)
})

test('EE draft persistence, auto-save, submission and EO audio metadata safety', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-ee-eo-'))
  const database = join(dir, 'study.sqlite')
  let server = null
  let base = ''

  const start = async () => {
    server = createStudyServer({ database, origin: 'http://127.0.0.1:3000' })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    base = `http://127.0.0.1:${address.port}/api/study-plan`
  }

  const stop = async () => {
    if (!server) return
    await new Promise((resolve) => server.close(resolve))
    server = null
  }

  const call = async (method, path, cookie, body) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Cookie: cookie || '',
        Origin: 'http://127.0.0.1:3000',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  try {
    await start()

    // 1. Establish session
    const init = await call('GET', '', '')
    assert.equal(init.response.status, 200)
    const cookie = init.response.headers.get('set-cookie').split(';')[0]

    // Initialize plan
    await call('POST', '', cookie, {
      state: {
        startDate: '2026-10-01',
        minutes: {},
        minimumMode: {},
      },
    })

    // 2. Draft operations
    const initialDraft = await call('GET', '/tcf-writing/draft', cookie)
    assert.equal(initialDraft.response.status, 200)
    assert.equal(initialDraft.data.draft, null)

    const draftData = {
      draftId: randomUUID(),
      task1Id: 'ee-t1-01',
      task1Response: "Bonjour, je vous invite à mon anniversaire samedi prochain. J'espère que vous viendrez !",
      task2Id: 'ee-t2-01',
      task2Response: "Pendant mes dernières vacances, j'ai voyagé à Québec. C'était une expérience incroyable.",
      task3Id: 'ee-t3-01',
      task3Response: "",
      remainingSeconds: 2700,
      currentTask: 1,
      startedAt: Date.now() - 900000,
      updatedAt: Date.now(),
    }

    const saveDraftRes = await call('POST', '/tcf-writing/draft', cookie, { draft: draftData })
    assert.equal(saveDraftRes.response.status, 200)
    assert.equal(saveDraftRes.data.ok, true)

    const loadedDraft = await call('GET', '/tcf-writing/draft', cookie)
    assert.equal(loadedDraft.response.status, 200)
    assert.equal(loadedDraft.data.draft.task1Id, 'ee-t1-01')
    assert.equal(loadedDraft.data.draft.currentTask, 1)
    assert.equal(loadedDraft.data.draft.remainingSeconds, 2700)

    // 3. Submit EE Attempt
    const eeAttempt = {
      id: randomUUID(),
      task1Id: 'ee-t1-01',
      task1Response: draftData.task1Response,
      task2Id: 'ee-t2-01',
      task2Response: draftData.task2Response,
      task3Id: 'ee-t3-01',
      task3Response: "Certains pensent que le télétravail isole, tandis que d'autres apprécient la flexibilité. À mon avis, un modèle hybride est optimal.",
      wordCounts: {
        task1: countFrenchWords(draftData.task1Response),
        task2: countFrenchWords(draftData.task2Response),
        task3: 20,
      },
      scores: {
        taskCompletion: 3,
        coherence: 3,
        vocabulary: 3,
        grammar: 2,
      },
      totalScore: 11,
      nclc: 7,
      durationSeconds: 3000,
      startedAt: Date.now() - 3000000,
      finishedAt: Date.now(),
      day: '2026-10-06',
    }

    const submitRes = await call('POST', '/tcf-writing', cookie, eeAttempt)
    assert.equal(submitRes.response.status, 200)
    assert.equal(submitRes.data.ok, true)

    // Draft should be automatically cleared after submit
    const draftAfterSubmit = await call('GET', '/tcf-writing/draft', cookie)
    assert.equal(draftAfterSubmit.data.draft, null)

    // EE history
    const eeHistory = await call('GET', '/tcf-writing', cookie)
    assert.equal(eeHistory.response.status, 200)
    assert.equal(eeHistory.data.items.length, 1)
    assert.equal(eeHistory.data.items[0].totalScore, 11)
    assert.equal(eeHistory.data.items[0].nclc, 7)

    // 4. EO Attempt Operations & Audio Safety Check
    // Reject attempt if raw audio or large base64 is in recordingsMeta
    const badEoAttempt = {
      id: randomUUID(),
      task1Id: 'eo-t1-01',
      task2Id: 'eo-t2-01',
      task3Id: 'eo-t3-01',
      recordingsMeta: {
        task1: { rawAudio: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQ8...' },
      },
      scores: { fluency: 2, pronunciation: 2, vocabulary: 2, grammar: 2, taskCompletion: 2 },
      totalScore: 10,
      nclc: 7,
      durationSeconds: 700,
      startedAt: Date.now() - 700000,
      finishedAt: Date.now(),
      day: '2026-10-06',
    }
    const badEoRes = await call('POST', '/tcf-speaking', cookie, badEoAttempt)
    assert.equal(badEoRes.response.status, 400)
    assert.equal(badEoRes.data.code, 'RECORDING_PAYLOAD_TOO_LARGE')

    // Valid EO attempt (metadata only, no raw audio in backend)
    const validEoAttempt = {
      id: randomUUID(),
      task1Id: 'eo-t1-01',
      task1Duration: 110,
      task2Id: 'eo-t2-01',
      task2Duration: 200,
      task3Id: 'eo-t3-01',
      task3Duration: 260,
      recordingsMeta: {
        task1: { recorded: true, duration: 110 },
        task2: { recorded: true, duration: 200 },
        task3: { recorded: true, duration: 260 },
      },
      scores: { fluency: 3, pronunciation: 2, vocabulary: 3, grammar: 2, taskCompletion: 2 },
      totalScore: 12,
      nclc: 8,
      durationSeconds: 650,
      startedAt: Date.now() - 650000,
      finishedAt: Date.now(),
      day: '2026-10-06',
    }
    const saveEoRes = await call('POST', '/tcf-speaking', cookie, validEoAttempt)
    assert.equal(saveEoRes.response.status, 200)

    const eoHistory = await call('GET', '/tcf-speaking', cookie)
    assert.equal(eoHistory.response.status, 200)
    assert.equal(eoHistory.data.items.length, 1)
    assert.equal(eoHistory.data.items[0].totalScore, 12)
    assert.equal(eoHistory.data.items[0].nclc, 8)

    // 5. Query /api/study-plan/tcf-attempts with skill filters
    const allAttempts = await call('GET', '/tcf-attempts', cookie)
    assert.equal(allAttempts.response.status, 200)
    assert.equal(allAttempts.data.items.length, 2) // 1 EE + 1 EO

    const writingOnly = await call('GET', '/tcf-attempts?skill=writing', cookie)
    assert.equal(writingOnly.response.status, 200)
    assert.equal(writingOnly.data.items.length, 1)
    assert.equal(writingOnly.data.items[0].skill, 'writing')
    assert.equal(writingOnly.data.items[0].scaledScore, 11)

    const speakingOnly = await call('GET', '/tcf-attempts?skill=speaking', cookie)
    assert.equal(speakingOnly.response.status, 200)
    assert.equal(speakingOnly.data.items.length, 1)
    assert.equal(speakingOnly.data.items[0].skill, 'speaking')
    assert.equal(speakingOnly.data.items[0].scaledScore, 12)

    // 6. Analytics includes 4 skills with targets
    const analytics = await call('GET', '/analytics?today=2026-10-06', cookie)
    assert.equal(analytics.response.status, 200)
    const tcf = analytics.data.analytics.tcf
    assert.equal(tcf.listening.targetScore, 458)
    assert.equal(tcf.reading.targetScore, 453)
    assert.equal(tcf.writing.targetScore, 10)
    assert.equal(tcf.writing.attempts, 1)
    assert.equal(tcf.writing.latestScore, 11)
    assert.equal(tcf.writing.gapToTarget, 0)
    assert.equal(tcf.speaking.targetScore, 10)
    assert.equal(tcf.speaking.attempts, 1)
    assert.equal(tcf.speaking.latestScore, 12)
    assert.equal(tcf.speaking.gapToTarget, 0)

    // 7. Delete EO attempt
    const deleteEo = await call('DELETE', `/tcf-speaking?id=${validEoAttempt.id}`, cookie, {})
    assert.equal(deleteEo.response.status, 200)
    assert.equal(deleteEo.data.deleted, true)

    const eoAfterDelete = await call('GET', '/tcf-speaking', cookie)
    assert.equal(eoAfterDelete.data.items.length, 0)
  } finally {
    if (server) await stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
