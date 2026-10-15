import { apply, emptyLearningProgress } from './study-model.mjs'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'

const vocabulary = (overrides = {}) => ({
  id: randomUUID(),
  word: 'pain',
  dict: 'tcf-canada-foundation-01',
  chapter: 0,
  timeStamp: 1791014400,
  day: '2026-10-03',
  durationMs: 1200,
  wrongCount: 0,
  wrongKeys: [],
  ...overrides,
})

const startState = () => ({ startDate: '2026-10-01', minutes: {}, minimumMode: {}, learning: emptyLearningProgress() })

const applyRecord = (record) => apply(startState(), [{ kind: 'vocabularyRecords', value: [record] }], { trusted: false })

test('vocabulary record with mode "tap" is accepted and persisted', () => {
  const record = vocabulary({ mode: 'tap' })
  const next = applyRecord(record)
  const stored = next.learning.vocabulary.records.find((item) => item.id === record.id)
  assert.ok(stored, 'record is stored')
  assert.equal(stored.mode, 'tap')
})

test('vocabulary record without mode keeps working (typing records)', () => {
  const record = vocabulary()
  const next = applyRecord(record)
  const stored = next.learning.vocabulary.records.find((item) => item.id === record.id)
  assert.ok(stored)
  assert.equal('mode' in stored, false)
})

test('vocabulary record with any other mode value is rejected', () => {
  for (const mode of ['other', 'typing', '', 'TAP', null, 1]) {
    assert.throws(() => applyRecord(vocabulary({ mode })), /Invalid vocabulary record/, `mode ${JSON.stringify(mode)}`)
  }
})
