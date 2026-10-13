import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  formatRecallLabel,
  getRecallLabel,
  getSectionLabel,
  getTaskLabel,
  getTaskOptions,
  isValidExamMonth,
  isValidSection,
  isValidTask,
  listSelectableMonths,
  sanitizeText,
  validateRecallInput,
} from './recalls'
import type { RecallValidationResult } from './recalls'

const FIXED_NOW = new Date(2026, 9, 15, 12, 0, 0) // 2026-10-15

test('sanitizeText strips control characters while preserving tab and newline', () => {
  assert.equal(
    sanitizeText('\u0000Bonjour\t\nmonde!\u007f'),
    'Bonjour\t\nmonde!',
  )
})

test('task options per section', () => {
  assert.deepEqual(getTaskOptions('speaking'), [2, 3])
  assert.deepEqual(getTaskOptions('writing'), [1, 2, 3])
  assert.deepEqual(getTaskOptions('reading'), [])
  assert.deepEqual(getTaskOptions('listening'), [])
  assert.deepEqual(getTaskOptions(''), [])
  assert.deepEqual(getTaskOptions(undefined), [])

  assert.equal(isValidSection('speaking'), true)
  assert.equal(isValidSection('writing'), true)
  assert.equal(isValidSection('reading'), false)
  assert.equal(isValidSection(null), false)

  assert.equal(isValidTask('speaking', 2), true)
  assert.equal(isValidTask('speaking', 3), true)
  assert.equal(isValidTask('speaking', 1), false)
  assert.equal(isValidTask('speaking', 4), false)

  assert.equal(isValidTask('writing', 1), true)
  assert.equal(isValidTask('writing', 2), true)
  assert.equal(isValidTask('writing', 3), true)
  assert.equal(isValidTask('writing', 4), false)
  assert.equal(isValidTask('writing', 0), false)
})

test('label helper formats section and task properly', () => {
  assert.equal(getSectionLabel('speaking'), '口语')
  assert.equal(getSectionLabel('writing'), '写作')
  assert.equal(getTaskLabel(1), '任务 1')
  assert.equal(getTaskLabel(2), '任务 2')

  assert.equal(formatRecallLabel('speaking', 2), '口语 任务 2')
  assert.equal(formatRecallLabel('speaking', 3), '口语 任务 3')
  assert.equal(formatRecallLabel('writing', 1), '写作 任务 1')
  assert.equal(formatRecallLabel('writing', 2), '写作 任务 2')
  assert.equal(formatRecallLabel('writing', 3), '写作 任务 3')
  assert.equal(formatRecallLabel('speaking'), '口语')
  assert.equal(formatRecallLabel('writing'), '写作')

  // getRecallLabel alias
  assert.equal(getRecallLabel('speaking', 2), '口语 任务 2')
  assert.equal(getRecallLabel('writing', 3), '写作 任务 3')
})

test('month list: length 25, newest first, crosses a year boundary correctly with an injected now', () => {
  const months2026 = listSelectableMonths(FIXED_NOW)
  assert.equal(months2026.length, 25)
  assert.equal(months2026[0], '2026-10')
  assert.equal(months2026[1], '2026-09')
  assert.equal(months2026[10], '2025-12')
  assert.equal(months2026[24], '2024-10')

  // Year boundary crossing test with January injected now
  const janNow = new Date(2025, 0, 10, 12, 0, 0) // 2025-01-10
  const monthsJan = listSelectableMonths(janNow)
  assert.equal(monthsJan.length, 25)
  assert.equal(monthsJan[0], '2025-01')
  assert.equal(monthsJan[1], '2024-12')
  assert.equal(monthsJan[2], '2024-11')
  assert.equal(monthsJan[12], '2024-01')
  assert.equal(monthsJan[13], '2023-12')
  assert.equal(monthsJan[24], '2023-01')

  // Timestamp number works as input
  const monthsTimestamp = listSelectableMonths(FIXED_NOW.getTime())
  assert.equal(monthsTimestamp.length, 25)
  assert.equal(monthsTimestamp[0], '2026-10')
})

test('isValidExamMonth validates range within last 24 months and not future', () => {
  assert.equal(isValidExamMonth('2026-10', FIXED_NOW), true)
  assert.equal(isValidExamMonth('2025-10', FIXED_NOW), true)
  assert.equal(isValidExamMonth('2024-10', FIXED_NOW), true) // Exactly 24 months ago

  // Future month
  assert.equal(isValidExamMonth('2026-11', FIXED_NOW), false)
  assert.equal(isValidExamMonth('2027-01', FIXED_NOW), false)

  // Past beyond 24 months
  assert.equal(isValidExamMonth('2024-09', FIXED_NOW), false)
  assert.equal(isValidExamMonth('2023-01', FIXED_NOW), false)

  // Invalid formats
  assert.equal(isValidExamMonth('2026/10', FIXED_NOW), false)
  assert.equal(isValidExamMonth('2026-1', FIXED_NOW), false)
  assert.equal(isValidExamMonth('', FIXED_NOW), false)
  assert.equal(isValidExamMonth(null, FIXED_NOW), false)
})

test('validateRecallInput: valid inputs pass', () => {
  const validSpeaking = {
    section: 'speaking',
    task: 2,
    examMonth: '2026-10',
    city: 'Paris',
    topic: 'Parlez de votre expérience professionnelle récente.',
    note: 'Examinateur très gentil, 3 questions de relance.',
  }
  const res1: RecallValidationResult = validateRecallInput(validSpeaking, FIXED_NOW)
  assert.equal(res1.valid, true)
  assert.deepEqual(res1.errors, {})

  const validWriting = {
    section: 'writing',
    task: 1,
    examMonth: '2025-06',
    topic: 'Écrivez un message pour inviter vos amis à votre fête.',
  }
  const res2 = validateRecallInput(validWriting, FIXED_NOW)
  assert.equal(res2.valid, true)
  assert.deepEqual(res2.errors, {})
})

test('validateRecallInput: validates section and task rules', () => {
  // Invalid section
  const resBadSection = validateRecallInput(
    { section: 'reading', task: 1, examMonth: '2026-10', topic: 'Un sujet valide pour le test' },
    FIXED_NOW,
  )
  assert.equal(resBadSection.valid, false)
  assert.ok(resBadSection.errors.section)

  // Speaking task 1 is disallowed (only 2, 3)
  const resSpeakingTask1 = validateRecallInput(
    { section: 'speaking', task: 1, examMonth: '2026-10', topic: 'Un sujet valide pour le test' },
    FIXED_NOW,
  )
  assert.equal(resSpeakingTask1.valid, false)
  assert.ok(resSpeakingTask1.errors.task)

  // Writing task 4 is disallowed
  const resWritingTask4 = validateRecallInput(
    { section: 'writing', task: 4, examMonth: '2026-10', topic: 'Un sujet valide pour le test' },
    FIXED_NOW,
  )
  assert.equal(resWritingTask4.valid, false)
  assert.ok(resWritingTask4.errors.task)
})

test('validateRecallInput: validates exam month rules', () => {
  const base = {
    section: 'speaking',
    task: 3,
    topic: 'Une question sur les voyages internationaux.',
  }

  const resFuture = validateRecallInput({ ...base, examMonth: '2026-12' }, FIXED_NOW)
  assert.equal(resFuture.valid, false)
  assert.ok(resFuture.errors.examMonth)

  const resTooOld = validateRecallInput({ ...base, examMonth: '2024-08' }, FIXED_NOW)
  assert.equal(resTooOld.valid, false)
  assert.ok(resTooOld.errors.examMonth)

  const resInvalidFormat = validateRecallInput({ ...base, examMonth: 'octobre-2026' }, FIXED_NOW)
  assert.equal(resInvalidFormat.valid, false)
  assert.ok(resInvalidFormat.errors.examMonth)
})

test('validateRecallInput: validates city length and URL rules', () => {
  const base = {
    section: 'writing',
    task: 2,
    examMonth: '2026-09',
    topic: 'Rédigez une lettre de réclamation à la compagnie aérienne.',
  }

  // Exactly 40 characters is valid
  const res40 = validateRecallInput({ ...base, city: 'C'.repeat(40) }, FIXED_NOW)
  assert.equal(res40.valid, true)

  // 41 characters is invalid
  const res41 = validateRecallInput({ ...base, city: 'C'.repeat(41) }, FIXED_NOW)
  assert.equal(res41.valid, false)
  assert.ok(res41.errors.city)

  // URL in city
  const resUrlCity1 = validateRecallInput({ ...base, city: 'https://paris.fr' }, FIXED_NOW)
  assert.equal(resUrlCity1.valid, false)
  assert.ok(resUrlCity1.errors.city)

  const resUrlCity2 = validateRecallInput({ ...base, city: 'www.test.com' }, FIXED_NOW)
  assert.equal(resUrlCity2.valid, false)
  assert.ok(resUrlCity2.errors.city)
})

test('validateRecallInput: validates topic length and URL rules', () => {
  const base = {
    section: 'writing',
    task: 3,
    examMonth: '2026-09',
  }

  // Short topic (< 10 chars)
  const resShort = validateRecallInput({ ...base, topic: '123456789' }, FIXED_NOW)
  assert.equal(resShort.valid, false)
  assert.ok(resShort.errors.topic)

  // Exactly 10 chars is valid
  const res10 = validateRecallInput({ ...base, topic: '1234567890' }, FIXED_NOW)
  assert.equal(res10.valid, true)

  // Exactly 800 chars is valid
  const res800 = validateRecallInput({ ...base, topic: 'A'.repeat(800) }, FIXED_NOW)
  assert.equal(res800.valid, true)

  // 801 chars is invalid
  const res801 = validateRecallInput({ ...base, topic: 'A'.repeat(801) }, FIXED_NOW)
  assert.equal(res801.valid, false)
  assert.ok(res801.errors.topic)

  // URL in topic
  const resUrl = validateRecallInput(
    { ...base, topic: 'Regardez le sujet sur https://example.com/topic-detail' },
    FIXED_NOW,
  )
  assert.equal(resUrl.valid, false)
  assert.ok(resUrl.errors.topic)
})

test('validateRecallInput: validates note length and URL rules', () => {
  const base = {
    section: 'speaking',
    task: 2,
    examMonth: '2026-10',
    topic: 'Présentez un lieu touristique que vous aimez.',
  }

  // Exactly 300 characters is valid
  const res300 = validateRecallInput({ ...base, note: 'N'.repeat(300) }, FIXED_NOW)
  assert.equal(res300.valid, true)

  // 301 characters is invalid
  const res301 = validateRecallInput({ ...base, note: 'N'.repeat(301) }, FIXED_NOW)
  assert.equal(res301.valid, false)
  assert.ok(res301.errors.note)

  // URL in note
  const resUrlNote = validateRecallInput({ ...base, note: 'Consultez http://notes.fr' }, FIXED_NOW)
  assert.equal(resUrlNote.valid, false)
  assert.ok(resUrlNote.errors.note)
})
