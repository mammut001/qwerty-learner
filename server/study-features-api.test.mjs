import { createStudyServer } from './study-plan.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const dayKey = (date) => date.toISOString().slice(0, 10)
const addDays = (day, amount) => {
  const value = new Date(day + 'T12:00:00.000Z')
  value.setUTCDate(value.getUTCDate() + amount)
  return dayKey(value)
}

test('error book, checkins, achievements, reports, rate limits, audit and delete-all API', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-features-api-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({ database, origin: 'http://localhost:5173' })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/study-plan`
  const today = dayKey(new Date())
  const yesterday = addDays(today, -1)
  const startDate = addDays(today, -8)
  let cookie = ''

  const call = async (method, path = '', body, requestCookie = cookie) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: 'http://localhost:5173',
        Cookie: requestCookie,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (response.headers.get('set-cookie') && !requestCookie) cookie = response.headers.get('set-cookie').split(';')[0]
    const data = await response.json()
    return { response, data }
  }

  try {
    const bootstrap = await call('GET')
    assert.equal(bootstrap.response.status, 200)
    assert.match(cookie, /^study_session=/)

    const initial = {
      startDate,
      minutes: {
        [yesterday]: { 'manual-study': 10 },
        [today]: { 'manual-total': 600 },
      },
      minimumMode: {},
    }
    assert.equal((await call('POST', '', { state: initial })).response.status, 200)

    const wrongId = randomUUID()
    const wrong = await call('PATCH', '', {
      id: randomUUID(),
      operations: [{
        kind: 'vocabularyRecords',
        value: [{
          id: wrongId,
          word: 'prendre',
          dict: 'tcf-canada-foundation-01',
          chapter: 0,
          timeStamp: Math.floor(Date.now() / 1000) - 60,
          day: today,
          durationMs: 1000,
          wrongCount: 1,
          wrongKeys: ['x'],
        }],
      }],
    })
    assert.equal(wrong.response.status, 200)

    const active = await call('GET', '/error-book?type=vocabulary&status=active')
    assert.equal(active.response.status, 200)
    assert.equal(active.data.items.length, 1)
    assert.equal(active.data.items[0].label, 'prendre')
    assert.equal(active.data.items[0].correctStreak, 0)

    const correctRecords = Array.from({ length: 3 }, (_, index) => ({
      id: randomUUID(),
      word: 'prendre',
      dict: 'tcf-canada-foundation-01',
      chapter: 0,
      timeStamp: Math.floor(Date.now() / 1000) + index + 1,
      day: today,
      durationMs: 900,
      wrongCount: 0,
      wrongKeys: [],
    }))
    assert.equal((await call('PATCH', '', {
      id: randomUUID(),
      operations: [{ kind: 'vocabularyRecords', value: correctRecords }],
    })).response.status, 200)

    const afterMastery = await call('GET', '/error-book?status=active')
    assert.equal(afterMastery.data.items.some((item) => item.label === 'prendre'), false)
    const mastered = await call('GET', '/error-book?status=mastered')
    assert.equal(mastered.data.items.find((item) => item.label === 'prendre').correctStreak, 3)

    const review = await call('GET', `/review?today=${today}`)
    assert.equal(review.data.queue.some((item) => item.label === 'prendre'), false, 'mastered error leaves SM-2 queue')

    const makeup = await call('POST', '/checkins/makeup', { day: yesterday })
    assert.equal(makeup.response.status, 200)
    assert.equal(makeup.data.items.find((item) => item.day === yesterday).status, 'makeup')

    const secondMakeup = await call('POST', '/checkins/makeup', { day: yesterday })
    assert.equal(secondMakeup.response.status, 409)
    assert.equal(secondMakeup.data.code, 'ALREADY_CHECKED_IN')

    const checkins = await call('GET', `/checkins?today=${today}`)
    assert.equal(checkins.response.status, 200)
    assert.ok(checkins.data.items.some((item) => item.day === yesterday && item.status === 'makeup'))
    assert.equal(typeof checkins.data.streak.current, 'number')
    assert.equal(typeof checkins.data.streak.longest, 'number')
    assert.ok(checkins.data.streak.longest >= 1)

    const achievements = await call('GET', '/achievements')
    assert.ok(achievements.data.items.some((item) => item.id === 'minutes-600'))

    const focusId = randomUUID()
    const focusSaved = await call('PATCH', '', {
      id: randomUUID(),
      operations: [
        { kind: 'increment', day: today, task: 'smart-conjugation', value: 12, updatedAt: Date.now() },
        {
          kind: 'focusSession',
          value: {
            id: focusId,
            day: today,
            taskId: 'smart-conjugation',
            title: '动词变位',
            minutes: 12,
            endedAt: Date.now(),
          },
        },
      ],
    })
    assert.equal(focusSaved.response.status, 200)

    const invalidFocus = await call('PATCH', '', {
      id: randomUUID(),
      operations: [{
        kind: 'focusSession',
        value: {
          id: randomUUID(),
          day: today,
          taskId: 'INVALID TASK',
          title: 'bad',
          minutes: 999,
          endedAt: Date.now(),
        },
      }],
    })
    assert.equal(invalidFocus.response.status, 400)
    assert.equal(typeof invalidFocus.data.code, 'string')

    const reports = await call('GET', '/weekly-reports')
    assert.ok(reports.data.items.length >= 1)
    assert.equal(typeof reports.data.items[0].completionPercent, 'number')
    assert.ok(Array.isArray(reports.data.items[0].suggestions))
    assert.ok(reports.data.items.some((item) => item.activityMinutes?.focus === 12))
    assert.ok(reports.data.items.some((item) => item.activityMinutes?.conjugation >= 12))
    const reportExport = await call('GET', '/weekly-reports/export')
    assert.equal(reportExport.data.format, 'qwerty-study-weekly-reports')
    assert.equal(reportExport.data.version, 1)
    const weeklyCsvResponse = await fetch(base + '/weekly-reports.csv', {
      headers: { Origin: 'http://localhost:5173', Cookie: cookie },
    })
    assert.equal(weeklyCsvResponse.status, 200)
    const weeklyCsv = await weeklyCsvResponse.text()
    assert.match(weeklyCsv, /focus_minutes/)
    assert.match(weeklyCsv, /conjugation_minutes/)

    const syncKey = await call('POST', '/sync-key', {})
    assert.equal(syncKey.response.status, 200)

    const inspect = new DatabaseSync(database)
    assert.equal(Number(inspect.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get().value), 8)
    assert.ok(inspect.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action='sync_key_create'").get().count >= 1)
    assert.ok(inspect.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE action='checkin_makeup'").get().count >= 1)
    inspect.close()

    let last
    for (let index = 0; index < 7; index++) {
      last = await call('POST', '/link', { key: '0'.repeat(64) }, '')
    }
    assert.equal(last.response.status, 429)
    assert.equal(last.data.code, 'SYNC_LINK_RATE_LIMITED')
    assert.ok(last.data.retryAfterSeconds > 0)

    const invalidDelete = await call('DELETE', '/data', { confirm: 'nope' })
    assert.equal(invalidDelete.response.status, 400)
    assert.equal(invalidDelete.data.code, 'DELETE_CONFIRMATION_REQUIRED')

    const deleted = await call('DELETE', '/data', { confirm: 'DELETE' })
    assert.equal(deleted.response.status, 200)
    assert.equal(deleted.data.deleted, true)

    const afterDelete = new DatabaseSync(database)
    assert.equal(afterDelete.prepare('SELECT COUNT(*) AS count FROM learners').get().count, 0)
    assert.equal(afterDelete.prepare('SELECT COUNT(*) AS count FROM error_book').get().count, 0)
    assert.equal(afterDelete.prepare('SELECT COUNT(*) AS count FROM weekly_reports').get().count, 0)
    assert.equal(afterDelete.prepare('SELECT COUNT(*) AS count FROM audit_log WHERE learner IS NOT NULL').get().count, 0)
    assert.ok(
      afterDelete.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE learner IS NULL AND action='sync_link'").get().count >= 1,
      'anonymous brute-force audit evidence remains after learner deletion',
    )
    afterDelete.close()
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
