import { activeErrorBookCandidates } from './study-features.mjs'
const date = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v
export const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const task = (v) => typeof v === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(v)
const minutes = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000000
const integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max
const number = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
const text = (v, max) => typeof v === 'string' && v.length <= max
const uuid = (v) => typeof v === 'string' && /^[a-f0-9-]{36}$/.test(v)
const tense = (v) => ['present', 'passeCompose', 'imparfait'].includes(v)
const reviewKind = (v) => ['vocabulary', 'grammar', 'conjugation'].includes(v)
const tcfSkill = (v) => ['listening', 'reading'].includes(v)
const timestamp = (v) => integer(v, 0, 9999999999999)

const MAX_VOCAB_RECORDS = 3000
const MAX_GRAMMAR_HISTORY = 50
const MAX_CONJUGATION_ATTEMPTS = 3000
const MAX_FOCUS_SESSIONS = 2000
const MAX_TCF_ATTEMPTS = 120
const MAX_REVIEW_ITEMS = 1000
const MAX_STATE_BYTES = 1500000

export function emptySyncMeta() {
  return {
    startDateUpdatedAt: 0,
    settingsUpdatedAt: 0,
    minimumModeUpdatedAt: {},
    minutesUpdatedAt: {},
    grammarDraftUpdatedAt: 0,
  }
}

export function emptyLearningProgress() {
  return {
    vocabulary: { records: [] },
    grammar: { draft: null, history: [] },
    conjugation: {},
    conjugationDaily: {},
    conjugationAttempts: [],
    focusSessions: [],
    tcfAttempts: [],
    reviews: { items: {} },
  }
}

function validateVocabularyRecord(value) {
  if (!record(value) || !uuid(value.id) || !text(value.word, 200) || !text(value.dict, 120) ||
      !(value.chapter === null || integer(value.chapter, -1, 10000)) || !integer(value.timeStamp, 0, 9999999999) ||
      !date(value.day) || !integer(value.durationMs, 0, 86400000) || !integer(value.wrongCount, 0, 10000) ||
      !Array.isArray(value.wrongKeys) || value.wrongKeys.length > 200 ||
      value.wrongKeys.some((key) => !text(key, 20))) throw new Error('Invalid vocabulary record')
}

function validateGrammarDraft(value) {
  if (value === null) return
  if (!record(value) || value.status !== 'running' || !integer(value.secondsLeft, 0, 1800) ||
      !integer(value.currentBatch, 0, 100) || !record(value.answers) || !record(value.reasons) ||
      !record(value.submittedBatches) || !Array.isArray(value.outputAnswers) || value.outputAnswers.length > 20 ||
      !(value.startedAt === null || timestamp(value.startedAt)) ||
      !(value.deadline === null || timestamp(value.deadline))) throw new Error('Invalid grammar draft')
  for (const [key, answer] of Object.entries(value.answers))
    if (!/^\d{1,4}$/.test(key) || !['A', 'B'].includes(answer)) throw new Error('Invalid grammar answer')
  for (const [key, reason] of Object.entries(value.reasons))
    if (!/^\d{1,4}$/.test(key) || !text(reason, 4000)) throw new Error('Invalid grammar reason')
  for (const [key, submitted] of Object.entries(value.submittedBatches))
    if (!/^\d{1,4}$/.test(key) || typeof submitted !== 'boolean') throw new Error('Invalid grammar batch')
  if (value.outputAnswers.some((answer) => !text(answer, 6000))) throw new Error('Invalid grammar output')
}

function validateGrammarItem(value) {
  if (!record(value) || !text(value.id, 120) || !text(value.label, 400) || typeof value.correct !== 'boolean' ||
      !(value.prompt === undefined || text(value.prompt, 1000)))
    throw new Error('Invalid grammar item')
}

function validateGrammarSession(value) {
  if (!record(value) || !uuid(value.id) || !text(value.topic, 200) || !integer(value.score, 0, 10000) ||
      !integer(value.total, 0, 10000) || value.score > value.total || !integer(value.elapsedSeconds, 0, 86400) ||
      !timestamp(value.finishedAt) || !date(value.day) || !record(value.answers) ||
      !record(value.reasons) || !Array.isArray(value.outputAnswers) || value.outputAnswers.length > 20)
    throw new Error('Invalid grammar session')
  for (const [key, answer] of Object.entries(value.answers))
    if (!/^\d{1,4}$/.test(key) || !['A', 'B'].includes(answer)) throw new Error('Invalid grammar answer')
  for (const [key, reason] of Object.entries(value.reasons))
    if (!/^\d{1,4}$/.test(key) || !text(reason, 4000)) throw new Error('Invalid grammar reason')
  if (value.outputAnswers.some((answer) => !text(answer, 6000))) throw new Error('Invalid grammar output')
  if (value.items !== undefined) {
    if (!Array.isArray(value.items) || value.items.length > 100) throw new Error('Invalid grammar items')
    value.items.forEach(validateGrammarItem)
  }
}

function validateConjugation(value) {
  if (!record(value)) throw new Error('Invalid conjugation')
  for (const [verb, tenses] of Object.entries(value)) {
    if (!text(verb, 120) || !record(tenses)) throw new Error('Invalid conjugation verb')
    for (const [key, stat] of Object.entries(tenses)) {
      if (!tense(key) || !record(stat) || !integer(stat.correct, 0, 10000000) ||
          !integer(stat.total, 0, 10000000) || stat.correct > stat.total) throw new Error('Invalid conjugation stat')
    }
  }
}

function validateConjugationAttempt(value) {
  if (!record(value) || !uuid(value.id) || !text(value.verb, 120) || !tense(value.tense) ||
      typeof value.correct !== 'boolean' || !date(value.day) || !timestamp(value.occurredAt))
    throw new Error('Invalid conjugation attempt')
}

function validateFocusSession(value) {
  if (!record(value) || !uuid(value.id) || !date(value.day) || !task(value.taskId) ||
      !text(value.title, 160) || !integer(value.minutes, 1, 240) || !timestamp(value.endedAt))
    throw new Error('Invalid focus session')
}

export function expectedTcfNclc(skill, score) {
  if (skill === 'writing' || skill === 'speaking') {
    if (score >= 16) return 10
    if (score >= 14) return 9
    if (score >= 12) return 8
    if (score >= 10) return 7
    if (score >= 7) return 6
    if (score >= 6) return 5
    if (score >= 4) return 4
    return 0
  }
  if (score >= 549) return 10
  if (skill === 'listening') {
    if (score >= 523) return 9
    if (score >= 503) return 8
    if (score >= 458) return 7
    if (score >= 398) return 6
    if (score >= 369) return 5
    if (score >= 331) return 4
    return 0
  }
  if (score >= 524) return 9
  if (score >= 499) return 8
  if (score >= 453) return 7
  if (score >= 406) return 6
  if (score >= 375) return 5
  if (score >= 342) return 4
  return 0
}

function validateTcfAttempt(value) {
  if (!record(value) || !uuid(value.id) || !tcfSkill(value.skill) || value.questionCount !== 39 ||
      !Array.isArray(value.answers) || value.answers.length !== value.questionCount ||
      !integer(value.correctCount, 0, value.questionCount) || !integer(value.scaledScore, 0, 699) ||
      !integer(value.nclc, 0, 10) || !integer(value.durationSeconds, 0, 3600) ||
      !timestamp(value.startedAt) || !timestamp(value.finishedAt) || value.finishedAt < value.startedAt ||
      !date(value.day)) throw new Error('Invalid TCF attempt')
  const prefix = value.skill === 'listening' ? 'co-' : 'ce-'
  const ids = new Set()
  for (const answer of value.answers) {
    if (!record(answer) || !text(answer.questionId, 80) || !answer.questionId.startsWith(prefix) ||
        ids.has(answer.questionId) ||
        !(answer.choice === null || integer(answer.choice, 0, 3)) ||
        typeof answer.correct !== 'boolean') throw new Error('Invalid TCF answer')
    ids.add(answer.questionId)
  }
  const calculatedCorrect = value.answers.filter((answer) => answer.correct).length
  const expectedScore = Math.round((calculatedCorrect / value.questionCount) * 699)
  if (calculatedCorrect !== value.correctCount || value.scaledScore !== expectedScore ||
      value.nclc !== expectedTcfNclc(value.skill, expectedScore))
    throw new Error('Invalid TCF score')
}


function validateReviewState(value) {
  if (!record(value) || !reviewKind(value.kind) || !text(value.sourceId, 400) || !text(value.label, 500) ||
      !date(value.dueDate) || !integer(value.intervalDays, 0, 36500) || !integer(value.repetitions, 0, 10000) ||
      !number(value.ease, 1.3, 4) || !(value.lastReviewedAt === null || timestamp(value.lastReviewedAt)) ||
      !timestamp(value.updatedAt) || !integer(value.lastResult, 0, 5))
    throw new Error('Invalid review state')
}

function validateSyncMeta(value) {
  if (!record(value) || !timestamp(value.startDateUpdatedAt) ||
      !timestamp(value.settingsUpdatedAt ?? 0) || !record(value.minimumModeUpdatedAt) ||
      !record(value.minutesUpdatedAt) || !timestamp(value.grammarDraftUpdatedAt)) throw new Error('Invalid sync metadata')
  for (const [day, valueAt] of Object.entries(value.minimumModeUpdatedAt))
    if (!date(day) || !timestamp(valueAt)) throw new Error('Invalid mode clock')
  for (const [day, tasks] of Object.entries(value.minutesUpdatedAt)) {
    if (!date(day) || !record(tasks)) throw new Error('Invalid minutes clock')
    for (const [id, valueAt] of Object.entries(tasks))
      if (!task(id) || !timestamp(valueAt)) throw new Error('Invalid minutes clock')
  }
}

function validatePlanSettings(value) {
  if (!record(value) || !date(value.examDate) ||
      !(value.dailyTargetMinutes === null || integer(value.dailyTargetMinutes, 20, 240)) ||
      !Array.isArray(value.studyDays) || value.studyDays.length < 1 || value.studyDays.length > 7 ||
      new Set(value.studyDays).size !== value.studyDays.length ||
      value.studyDays.some((day) => !integer(day, 0, 6)))
    throw new Error('Invalid plan settings')
}

function defaultPlanSettings(startDate) {
  return {
    examDate: addDays(startDate, 181),
    dailyTargetMinutes: null,
    studyDays: [1, 2, 3, 4, 5, 6, 0],
  }
}

function validateLearning(value) {
  if (!record(value) || !record(value.vocabulary) || !Array.isArray(value.vocabulary.records) ||
      value.vocabulary.records.length > MAX_VOCAB_RECORDS || !record(value.grammar) ||
      !Array.isArray(value.grammar.history) || value.grammar.history.length > MAX_GRAMMAR_HISTORY ||
      !record(value.conjugation) || !record(value.conjugationDaily)) throw new Error('Invalid learning progress')
  const conjugationAttempts = value.conjugationAttempts ?? []
  const focusSessions = value.focusSessions ?? []
  const tcfAttempts = value.tcfAttempts ?? []
  const reviews = value.reviews ?? { items: {} }
  if (!Array.isArray(conjugationAttempts) || conjugationAttempts.length > MAX_CONJUGATION_ATTEMPTS ||
      !Array.isArray(focusSessions) || focusSessions.length > MAX_FOCUS_SESSIONS ||
      !Array.isArray(tcfAttempts) || tcfAttempts.length > MAX_TCF_ATTEMPTS ||
      !record(reviews) || !record(reviews.items) || Object.keys(reviews.items).length > MAX_REVIEW_ITEMS)
    throw new Error('Invalid learning progress')
  value.vocabulary.records.forEach(validateVocabularyRecord)
  validateGrammarDraft(value.grammar.draft)
  value.grammar.history.forEach(validateGrammarSession)
  validateConjugation(value.conjugation)
  for (const [day, stat] of Object.entries(value.conjugationDaily)) {
    if (!date(day) || !record(stat) || !integer(stat.correct, 0, 10000000) ||
        !integer(stat.total, 0, 10000000) || stat.correct > stat.total) throw new Error('Invalid conjugation daily stat')
  }
  conjugationAttempts.forEach(validateConjugationAttempt)
  focusSessions.forEach(validateFocusSession)
  tcfAttempts.forEach(validateTcfAttempt)
  for (const [id, item] of Object.entries(reviews.items)) {
    if (!text(id, 500)) throw new Error('Invalid review ID')
    validateReviewState(item)
  }
}

export function validate(state) {
  if (!record(state) || !date(state.startDate) || !record(state.minutes) || !record(state.minimumMode)) throw new Error('Invalid plan')
  for (const [day, tasks] of Object.entries(state.minutes)) {
    if (!date(day) || !record(tasks)) throw new Error('Invalid day')
    for (const [id, value] of Object.entries(tasks)) if (!task(id) || !minutes(value)) throw new Error('Invalid minutes')
  }
  for (const [day, value] of Object.entries(state.minimumMode))
    if (!date(day) || typeof value !== 'boolean') throw new Error('Invalid mode')
  if (state.settings !== undefined) validatePlanSettings(state.settings)
  if (state.learning !== undefined) validateLearning(state.learning)
  if (state.syncMeta !== undefined) validateSyncMeta(state.syncMeta)
  if (new TextEncoder().encode(JSON.stringify(state)).byteLength > MAX_STATE_BYTES) throw new Error('Plan too large')
}

export function normalizeState(state) {
  validate(state)
  const next = structuredClone(state)
  next.settings ??= defaultPlanSettings(next.startDate)
  validatePlanSettings(next.settings)
  next.startDate = addDays(next.settings.examDate, -181)
  next.learning ??= emptyLearningProgress()
  next.learning.conjugationAttempts ??= []
  next.learning.focusSessions ??= []
  next.learning.tcfAttempts ??= []
  next.learning.reviews ??= { items: {} }
  next.learning.reviews.items ??= {}
  next.syncMeta ??= emptySyncMeta()
  next.syncMeta.settingsUpdatedAt ??= 0
  validate(next)
  return next
}

function mergeVocabularyRecords(current, incoming) {
  const seen = new Set(current.map((item) => item.id))
  const appended = [...current]
  for (const item of incoming) {
    validateVocabularyRecord(item)
    if (!seen.has(item.id)) {
      appended.push(structuredClone(item))
      seen.add(item.id)
    }
  }
  appended.sort((a, b) => a.timeStamp - b.timeStamp || a.id.localeCompare(b.id))
  return appended.slice(-MAX_VOCAB_RECORDS)
}

function mergeConjugationAttempts(current, incoming) {
  const seen = new Set(current.map((item) => item.id))
  const appended = [...current]
  for (const item of incoming) {
    validateConjugationAttempt(item)
    if (!seen.has(item.id)) {
      appended.push(structuredClone(item))
      seen.add(item.id)
    }
  }
  appended.sort((a, b) => a.occurredAt - b.occurredAt || a.id.localeCompare(b.id))
  return appended.slice(-MAX_CONJUGATION_ATTEMPTS)
}

function mergeFocusSessions(current, incoming) {
  const seen = new Set(current.map((item) => item.id))
  const appended = [...current]
  for (const item of incoming) {
    validateFocusSession(item)
    if (!seen.has(item.id)) {
      appended.push(structuredClone(item))
      seen.add(item.id)
    }
  }
  appended.sort((a, b) => a.endedAt - b.endedAt || a.id.localeCompare(b.id))
  return appended.slice(-MAX_FOCUS_SESSIONS)
}

function mergeTcfAttempts(current, incoming) {
  const seen = new Set(current.map((item) => item.id))
  const appended = [...current]
  for (const item of incoming) {
    validateTcfAttempt(item)
    if (!seen.has(item.id)) {
      appended.push(structuredClone(item))
      seen.add(item.id)
    }
  }
  appended.sort((a, b) => a.finishedAt - b.finishedAt || a.id.localeCompare(b.id))
  return appended.slice(-MAX_TCF_ATTEMPTS)
}

function conjugationTotals(stats) {
  let total = 0
  for (const tenses of Object.values(stats)) for (const value of Object.values(tenses)) total += value.total
  return total
}

const opUpdatedAt = (op) => timestamp(op.updatedAt) ? op.updatedAt : 0
const shouldApply = (incoming, current) => incoming >= (current ?? 0)

function scheduleReview(previous, op) {
  const quality = op.quality
  const reviewedAt = op.reviewedAt
  const reviewDay = op.day
  const easeBefore = previous?.ease ?? 2.5
  let ease = Math.max(1.3, easeBefore + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  let repetitions = previous?.repetitions ?? 0
  let intervalDays = previous?.intervalDays ?? 0
  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.max(1, Math.round(Math.max(1, intervalDays) * ease))
  }
  return {
    kind: op.reviewKind,
    sourceId: op.sourceId,
    label: op.label,
    dueDate: addDays(reviewDay, intervalDays),
    intervalDays,
    repetitions,
    ease: Math.round(ease * 100) / 100,
    lastReviewedAt: reviewedAt,
    updatedAt: reviewedAt,
    lastResult: quality,
  }
}

export function apply(state, operations) {
  state = normalizeState(state)
  if (!Array.isArray(operations) || operations.length > 10000) throw new Error('Invalid operations')
  for (const op of operations) {
    if (!record(op)) throw new Error('Invalid operation')
    if (op.kind === 'replace') {
      state = normalizeState(op.value)
    } else if (op.kind === 'startDate' && date(op.value)) {
      const updatedAt = opUpdatedAt(op)
      if (shouldApply(updatedAt, state.syncMeta.startDateUpdatedAt) &&
          shouldApply(updatedAt, state.syncMeta.settingsUpdatedAt)) {
        state.startDate = op.value
        state.settings = { ...state.settings, examDate: addDays(op.value, 181) }
        state.syncMeta.startDateUpdatedAt = updatedAt
        state.syncMeta.settingsUpdatedAt = updatedAt
      }
    } else if (op.kind === 'settings') {
      validatePlanSettings(op.value)
      const updatedAt = opUpdatedAt(op)
      if (shouldApply(updatedAt, state.syncMeta.settingsUpdatedAt)) {
        state.settings = structuredClone(op.value)
        state.startDate = addDays(op.value.examDate, -181)
        state.syncMeta.settingsUpdatedAt = updatedAt
        state.syncMeta.startDateUpdatedAt = Math.max(state.syncMeta.startDateUpdatedAt, updatedAt)
      }
    } else if (op.kind === 'mode' && date(op.day) && (op.value === null || typeof op.value === 'boolean')) {
      const updatedAt = opUpdatedAt(op)
      if (shouldApply(updatedAt, state.syncMeta.minimumModeUpdatedAt[op.day])) {
        if (op.value === null) delete state.minimumMode[op.day]
        else state.minimumMode[op.day] = op.value
        state.syncMeta.minimumModeUpdatedAt[op.day] = updatedAt
      }
    } else if (op.kind === 'minutes' && date(op.day) && task(op.task) && (op.value === null || minutes(op.value))) {
      const updatedAt = opUpdatedAt(op)
      state.syncMeta.minutesUpdatedAt[op.day] ??= {}
      if (shouldApply(updatedAt, state.syncMeta.minutesUpdatedAt[op.day][op.task])) {
        state.minutes[op.day] ??= {}
        if (op.value === null) delete state.minutes[op.day][op.task]
        else state.minutes[op.day][op.task] = op.value
        state.syncMeta.minutesUpdatedAt[op.day][op.task] = updatedAt
      }
    } else if (op.kind === 'increment' && date(op.day) && task(op.task) && minutes(op.value)) {
      state.minutes[op.day] ??= {}
      state.minutes[op.day][op.task] = (state.minutes[op.day][op.task] ?? 0) + op.value
      state.syncMeta.minutesUpdatedAt[op.day] ??= {}
      state.syncMeta.minutesUpdatedAt[op.day][op.task] = Math.max(
        state.syncMeta.minutesUpdatedAt[op.day][op.task] ?? 0,
        opUpdatedAt(op),
      )
    } else if (op.kind === 'vocabularyRecords' && Array.isArray(op.value) && op.value.length <= MAX_VOCAB_RECORDS) {
      state.learning.vocabulary.records = mergeVocabularyRecords(state.learning.vocabulary.records, op.value)
    } else if (op.kind === 'grammarDraft') {
      validateGrammarDraft(op.value)
      const updatedAt = opUpdatedAt(op)
      if (shouldApply(updatedAt, state.syncMeta.grammarDraftUpdatedAt)) {
        state.learning.grammar.draft = structuredClone(op.value)
        state.syncMeta.grammarDraftUpdatedAt = updatedAt
      }
    } else if (op.kind === 'grammarSession') {
      validateGrammarSession(op.value)
      if (!state.learning.grammar.history.some((item) => item.id === op.value.id))
        state.learning.grammar.history = [structuredClone(op.value), ...state.learning.grammar.history].slice(0, MAX_GRAMMAR_HISTORY)
    } else if (op.kind === 'grammarSeed' && Array.isArray(op.value) && op.value.length <= MAX_GRAMMAR_HISTORY) {
      op.value.forEach(validateGrammarSession)
      if (state.learning.grammar.history.length === 0) state.learning.grammar.history = structuredClone(op.value).slice(0, MAX_GRAMMAR_HISTORY)
    } else if (op.kind === 'conjugationSeed') {
      validateConjugation(op.value)
      if (conjugationTotals(state.learning.conjugation) === 0) state.learning.conjugation = structuredClone(op.value)
    } else if (op.kind === 'conjugationAttempt' && record(op.value)) {
      validateConjugationAttempt(op.value)
      if (!state.learning.conjugationAttempts.some((item) => item.id === op.value.id)) {
        state.learning.conjugationAttempts = mergeConjugationAttempts(state.learning.conjugationAttempts, [op.value])
        const byVerb = state.learning.conjugation[op.value.verb] ?? {}
        const stat = byVerb[op.value.tense] ?? { correct: 0, total: 0 }
        byVerb[op.value.tense] = { correct: stat.correct + (op.value.correct ? 1 : 0), total: stat.total + 1 }
        state.learning.conjugation[op.value.verb] = byVerb
        const daily = state.learning.conjugationDaily[op.value.day] ?? { correct: 0, total: 0 }
        state.learning.conjugationDaily[op.value.day] = {
          correct: daily.correct + (op.value.correct ? 1 : 0),
          total: daily.total + 1,
        }
      }
    } else if (op.kind === 'conjugationAttempt' && text(op.verb, 120) && tense(op.tense) &&
               typeof op.correct === 'boolean' && date(op.day)) {
      // Compatibility for durable offline mutations queued by the previous frontend.
      // Mutation-level idempotency still prevents double counting; only the new format has per-attempt history.
      const byVerb = state.learning.conjugation[op.verb] ?? {}
      const stat = byVerb[op.tense] ?? { correct: 0, total: 0 }
      byVerb[op.tense] = { correct: stat.correct + (op.correct ? 1 : 0), total: stat.total + 1 }
      state.learning.conjugation[op.verb] = byVerb
      const daily = state.learning.conjugationDaily[op.day] ?? { correct: 0, total: 0 }
      state.learning.conjugationDaily[op.day] = {
        correct: daily.correct + (op.correct ? 1 : 0),
        total: daily.total + 1,
      }
    } else if (op.kind === 'focusSession' && record(op.value)) {
      validateFocusSession(op.value)
      state.learning.focusSessions = mergeFocusSessions(state.learning.focusSessions, [op.value])
    } else if (op.kind === 'tcfAttempt' && record(op.value)) {
      validateTcfAttempt(op.value)
      state.learning.tcfAttempts = mergeTcfAttempts(state.learning.tcfAttempts, [op.value])
    } else if (op.kind === 'reviewResult' && text(op.itemId, 500) && reviewKind(op.reviewKind) &&
               text(op.sourceId, 400) && text(op.label, 500) && integer(op.quality, 0, 5) &&
               timestamp(op.reviewedAt) && date(op.day)) {
      const previous = state.learning.reviews.items[op.itemId]
      if (!previous || op.reviewedAt >= previous.updatedAt)
        state.learning.reviews.items[op.itemId] = scheduleReview(previous, op)
    } else throw new Error('Invalid operation')
  }
  validate(state)
  return state
}

const NORMAL_TARGETS = {
  0: { 'sun-review': 25 },
  1: { 'mon-grammar': 30, 'mon-listening': 30, 'mon-vocab': 20 },
  2: { 'tue-reading': 35, 'tue-writing': 40, 'tue-correction': 15 },
  3: { 'wed-listening': 30, 'wed-speaking': 40, 'wed-pronunciation': 15 },
  4: { 'thu-tcf': 60, 'thu-review': 30 },
  5: { 'fri-vocab': 10, 'fri-listening': 10 },
  6: { 'sat-listening': 15, 'sat-retell': 10 },
}
const MINIMUM_TARGETS = { 'minimum-vocab': 5, 'minimum-listening': 5 }
const PHASES = [[1, 4], [5, 8], [9, 12], [13, 16], [17, 21], [22, 26]]
const keyToUtc = (key) => new Date(key + 'T00:00:00.000Z')
const toKey = (value) => value.toISOString().slice(0, 10)
const addDays = (key, amount) => {
  const value = keyToUtc(key)
  value.setUTCDate(value.getUTCDate() + amount)
  return toKey(value)
}
const diffDays = (from, to) => Math.floor((keyToUtc(to) - keyToUtc(from)) / 86400000)
const sum = (values) => values.reduce((total, value) => total + value, 0)
const accuracy = (correct, total) => total ? Math.round((correct / total) * 100) : null

function scaleTargets(targets, targetMinutes) {
  if (targetMinutes === null) return targets
  const entries = Object.entries(targets)
  const sourceTotal = sum(entries.map(([, value]) => value))
  if (!entries.length || sourceTotal <= 0) return targets
  const allocations = entries.map(([id, value]) => {
    const exact = (value / sourceTotal) * targetMinutes
    return { id, minutes: Math.max(1, Math.floor(exact)), fraction: exact - Math.floor(exact) }
  })
  let allocated = sum(allocations.map((item) => item.minutes))
  const order = [...allocations].sort((a, b) => b.fraction - a.fraction)
  let index = 0
  while (allocated < targetMinutes) {
    order[index % order.length].minutes += 1
    allocated += 1
    index += 1
  }
  while (allocated > targetMinutes && allocations.some((item) => item.minutes > 1)) {
    const item = order[index % order.length]
    if (item.minutes > 1) {
      item.minutes -= 1
      allocated -= 1
    }
    index += 1
  }
  return Object.fromEntries(allocations.map((item) => [item.id, item.minutes]))
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
function baseTargetsForWeekday(settings, weekday) {
  if (!settings.studyDays.includes(weekday)) return {}
  const defaultWeek = settings.studyDays.length === 7 && WEEKDAY_ORDER.every((day) => settings.studyDays.includes(day))
  if (defaultWeek) return NORMAL_TARGETS[weekday] ?? {}

  const activeDays = WEEKDAY_ORDER.filter((day) => settings.studyDays.includes(day))
  const position = activeDays.indexOf(weekday)
  if (position < 0) return {}
  const allTargets = WEEKDAY_ORDER.flatMap((day) => Object.entries(NORMAL_TARGETS[day] ?? {}))
  const start = Math.floor((position * allTargets.length) / activeDays.length)
  const end = Math.floor(((position + 1) * allTargets.length) / activeDays.length)
  return Object.fromEntries(allTargets.slice(start, end))
}

function targetsFor(state, day) {
  const weekday = keyToUtc(day).getUTCDay()
  if (!state.settings.studyDays.includes(weekday)) return {}
  if (state.minimumMode[day]) return MINIMUM_TARGETS
  return scaleTargets(baseTargetsForWeekday(state.settings, weekday), state.settings.dailyTargetMinutes)
}
function actualForTargets(state, day, targets) {
  const actual = state.minutes[day] ?? {}
  return sum(Object.keys(targets).map((id) => actual[id] ?? 0))
}
function recordedMinutesForDay(state, day) {
  return sum(Object.values(state.minutes[day] ?? {}))
}
function dayComplete(state, day) {
  const targets = targetsFor(state, day)
  const planned = sum(Object.values(targets))
  return planned > 0 && actualForTargets(state, day, targets) >= planned
}

export function studyDaySummary(input, day) {
  const state = normalizeState(input)
  if (!date(day)) throw new Error('Invalid summary date')
  const targets = targetsFor(state, day)
  const plannedMinutes = sum(Object.values(targets))
  const actualMinutes = recordedMinutesForDay(state, day)
  const targetMinutes = actualForTargets(state, day, targets)
  return {
    day,
    plannedMinutes,
    actualMinutes,
    targetMinutes,
    active: plannedMinutes > 0,
    complete: plannedMinutes > 0 && targetMinutes >= plannedMinutes,
  }
}
function totalPlanMinutes(state) {
  return sum(Object.values(state.minutes).flatMap((tasks) => Object.values(tasks)))
}
function streaks(days, today) {
  const active = new Set(days)
  const sorted = [...active].sort()
  let longest = 0, run = 0, previous = null
  for (const day of sorted) {
    if (previous && diffDays(previous, day) === 1) run += 1
    else run = 1
    longest = Math.max(longest, run)
    previous = day
  }
  let cursor = active.has(today) ? today : addDays(today, -1)
  let current = 0
  while (active.has(cursor)) {
    current += 1
    cursor = addDays(cursor, -1)
  }
  return { current, longest }
}

function dayMetrics(state, day) {
  const vocab = state.learning.vocabulary.records.filter((item) => item.day === day)
  const grammar = state.learning.grammar.history.filter((item) => item.day === day)
  let grammarCorrect = 0, grammarTotal = 0
  for (const session of grammar) {
    grammarCorrect += session.score
    grammarTotal += session.total
  }
  const conjugation = state.learning.conjugationDaily[day] ?? { correct: 0, total: 0 }
  return {
    minutes: sum(Object.values(state.minutes[day] ?? {})),
    vocabularyCorrect: vocab.filter((item) => item.wrongCount === 0).length,
    vocabularyTotal: vocab.length,
    grammarCorrect,
    grammarTotal,
    conjugationCorrect: conjugation.correct,
    conjugationTotal: conjugation.total,
  }
}

function aggregateDays(state, days, label, startDate, endDate) {
  const metrics = days.map((day) => dayMetrics(state, day))
  const total = (key) => sum(metrics.map((item) => item[key]))
  return {
    label,
    startDate,
    endDate,
    minutes: total('minutes'),
    vocabularyAccuracy: accuracy(total('vocabularyCorrect'), total('vocabularyTotal')),
    grammarAccuracy: accuracy(total('grammarCorrect'), total('grammarTotal')),
    conjugationAccuracy: accuracy(total('conjugationCorrect'), total('conjugationTotal')),
  }
}

function startOfWeek(day) {
  const value = keyToUtc(day)
  const weekday = value.getUTCDay()
  value.setUTCDate(value.getUTCDate() - ((weekday + 6) % 7))
  return toKey(value)
}

function startOfMonth(day) {
  return day.slice(0, 7) + '-01'
}

function monthDays(start) {
  const value = keyToUtc(start)
  const month = value.getUTCMonth()
  const days = []
  while (value.getUTCMonth() === month) {
    days.push(toKey(value))
    value.setUTCDate(value.getUTCDate() + 1)
  }
  return days
}

function trendBuckets(state, today) {
  const daily = Array.from({ length: 30 }, (_, index) => addDays(today, index - 29))
    .map((day) => aggregateDays(state, [day], day.slice(5), day, day))
  const currentWeekStart = startOfWeek(today)
  const weekly = Array.from({ length: 12 }, (_, index) => addDays(currentWeekStart, (index - 11) * 7))
    .map((start) => {
      const days = Array.from({ length: 7 }, (_, index) => addDays(start, index))
      return aggregateDays(state, days, start.slice(5), start, days[6])
    })
  const currentMonthStart = startOfMonth(today)
  const currentMonth = keyToUtc(currentMonthStart)
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const value = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + index - 11, 1))
    const start = toKey(value)
    const days = monthDays(start)
    return aggregateDays(state, days, start.slice(0, 7), start, days[days.length - 1])
  })
  return { daily, weekly, monthly }
}

function rankings(state) {
  const vocabulary = new Map()
  for (const item of state.learning.vocabulary.records) {
    const key = item.dict + '|' + item.word
    const row = vocabulary.get(key) ?? { id: key, label: item.word, errors: 0, attempts: 0, correct: 0 }
    row.attempts += 1
    row.errors += item.wrongCount
    if (item.wrongCount === 0) row.correct += 1
    vocabulary.set(key, row)
  }

  const grammar = new Map()
  for (const session of state.learning.grammar.history) {
    if (session.items?.length) {
      for (const item of session.items) {
        const row = grammar.get(item.id) ?? { id: item.id, label: item.label, errors: 0, attempts: 0, correct: 0 }
        row.attempts += 1
        row.errors += item.correct ? 0 : 1
        row.correct += item.correct ? 1 : 0
        grammar.set(item.id, row)
      }
    } else {
      const key = 'topic:' + session.topic
      const row = grammar.get(key) ?? { id: key, label: session.topic, errors: 0, attempts: 0, correct: 0 }
      row.attempts += session.total
      row.correct += session.score
      row.errors += session.total - session.score
      grammar.set(key, row)
    }
  }

  const conjugation = new Map()
  for (const [verb, tenses] of Object.entries(state.learning.conjugation)) {
    let correct = 0, total = 0
    for (const stat of Object.values(tenses)) {
      correct += stat.correct
      total += stat.total
    }
    conjugation.set(verb, { id: verb, label: verb, errors: total - correct, attempts: total, correct })
  }

  const finish = (map) => [...map.values()]
    .map((item) => ({ ...item, accuracy: accuracy(item.correct, item.attempts) }))
    .filter((item) => item.errors > 0)
    .sort((a, b) => b.errors - a.errors || b.attempts - a.attempts || a.label.localeCompare(b.label))
    .slice(0, 10)

  return {
    vocabulary: finish(vocabulary),
    grammar: finish(grammar),
    conjugation: finish(conjugation),
  }
}

function reviewCandidates(state) {
  return activeErrorBookCandidates(state)
}

export function buildReviewQueue(input, today = toKey(new Date())) {
  const state = normalizeState(input)
  if (!date(today)) throw new Error('Invalid review date')
  return reviewCandidates(state)
    .map((candidate) => {
      const review = state.learning.reviews.items[candidate.itemId]
      const resurfaced = candidate.lastErrorAt > (review?.lastReviewedAt ?? 0)
      const dueDate = resurfaced || !review ? today : review.dueDate
      return {
        ...candidate,
        dueDate,
        repetitions: review?.repetitions ?? 0,
        intervalDays: review?.intervalDays ?? 0,
        ease: review?.ease ?? 2.5,
        lastReviewedAt: review?.lastReviewedAt ?? null,
      }
    })
    .filter((item) => item.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.errorCount - a.errorCount || b.lastErrorAt - a.lastErrorAt)
    .slice(0, 50)
}


const masteryKinds = ['vocabulary', 'grammar', 'conjugation']
const masteryRow = (known, activeErrors) => {
  const mastered = Math.max(0, known - activeErrors)
  return {
    known,
    mastered,
    activeErrors,
    percent: known ? Math.max(0, Math.min(100, Math.round((mastered / known) * 100))) : 0,
  }
}

function dashboardForState(state, today) {
  const activeErrors = activeErrorBookCandidates(state)
  const activeByKind = Object.fromEntries(masteryKinds.map((kind) => [
    kind,
    new Set(activeErrors.filter((item) => item.kind === kind).map((item) => item.sourceId)).size,
  ]))

  const vocabularyKnown = new Set(state.learning.vocabulary.records.map((item) => item.dict + '|' + item.word)).size
  const grammarKnown = new Set(
    state.learning.grammar.history.flatMap((session) =>
      session.items?.length ? session.items.map((item) => item.id) : ['topic:' + session.topic],
    ),
  ).size
  const conjugationKnown = new Set(
    Object.entries(state.learning.conjugation).flatMap(([verb, tenses]) =>
      Object.entries(tenses)
        .filter(([, stat]) => stat.total > 0)
        .map(([tense]) => verb + '|' + tense),
    ),
  ).size

  const heatmap = Array.from({ length: 90 }, (_, index) => addDays(today, index - 89)).map((day) => {
    const plannedMinutes = sum(Object.values(targetsFor(state, day)))
    const actualMinutes = recordedMinutesForDay(state, day)
    return {
      day,
      minutes: actualMinutes,
      plannedMinutes,
      completionPercent: plannedMinutes ? Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100)) : 0,
    }
  })

  const totalPlannedMinutes = sum(
    Array.from({ length: 182 }, (_, index) => addDays(state.startDate, index))
      .map((day) => sum(Object.values(targetsFor(state, day)))),
  )
  const completedMinutes = Math.min(totalPlannedMinutes, totalPlanMinutes(state))
  const recentDays = Array.from({ length: 28 }, (_, index) => addDays(today, index - 27))
  const recentMinutes = sum(recentDays.map((day) => recordedMinutesForDay(state, day)))
  const averageDailyMinutes = Math.round((recentMinutes / 28) * 10) / 10
  const remainingMinutes = Math.max(0, totalPlannedMinutes - completedMinutes)
  const daysToFinish = remainingMinutes === 0 ? 0 : averageDailyMinutes > 0 ? Math.ceil(remainingMinutes / averageDailyMinutes) : null
  const predictedCompletionDate = daysToFinish === null ? null : addDays(today, daysToFinish)

  return {
    heatmap,
    mastery: {
      vocabulary: masteryRow(vocabularyKnown, activeByKind.vocabulary ?? 0),
      grammar: masteryRow(grammarKnown, activeByKind.grammar ?? 0),
      conjugation: masteryRow(conjugationKnown, activeByKind.conjugation ?? 0),
    },
    projection: {
      totalPlannedMinutes,
      completedMinutes,
      remainingMinutes,
      progressPercent: totalPlannedMinutes ? Math.min(100, Math.round((completedMinutes / totalPlannedMinutes) * 100)) : 0,
      averageDailyMinutes,
      predictedCompletionDate,
      scheduledCompletionDate: state.settings.examDate,
      deltaDays: predictedCompletionDate ? diffDays(state.settings.examDate, predictedCompletionDate) : null,
    },
  }
}

export function buildStudyDashboard(input, today = toKey(new Date())) {
  const state = normalizeState(input)
  if (!date(today)) throw new Error('Invalid dashboard date')
  return dashboardForState(state, today)
}

const allocateWeightedMinutes = (total, weights) => {
  if (total <= 0) return weights.map(() => 0)
  const weightSum = sum(weights)
  const raw = weights.map((weight) => (total * weight) / weightSum)
  const allocated = raw.map(Math.floor)
  let remaining = total - sum(allocated)
  const order = raw
    .map((value, index) => ({ index, fraction: value - allocated[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  for (let index = 0; remaining > 0; index = (index + 1) % order.length) {
    allocated[order[index].index] += 1
    remaining -= 1
  }
  return allocated
}

function todayPlanForState(state, today) {
  const due = buildReviewQueue(state, today)
  const activeErrors = activeErrorBookCandidates(state)
  const plannedToday = sum(Object.values(targetsFor(state, today)))
  const targetMinutes = state.settings.dailyTargetMinutes ?? (plannedToday > 0 ? plannedToday : 60)
  const errorCounts = {
    vocabulary: activeErrors.filter((item) => item.kind === 'vocabulary').length,
    grammar: activeErrors.filter((item) => item.kind === 'grammar').length,
    conjugation: activeErrors.filter((item) => item.kind === 'conjugation').length,
  }

  const reviewMinutes = due.length
    ? Math.min(Math.max(2, due.length * 2), Math.max(2, Math.round(targetMinutes * 0.45)))
    : 0
  const remainder = Math.max(0, targetMinutes - reviewMinutes)
  const weights = [
    4 + Math.min(4, errorCounts.vocabulary),
    3 + Math.min(4, errorCounts.grammar),
    3 + Math.min(4, errorCounts.conjugation),
  ]
  const [vocabularyMinutes, grammarMinutes, conjugationMinutes] = allocateWeightedMinutes(remainder, weights)
  const actual = state.minutes[today] ?? {}

  const definitions = [
    ...(reviewMinutes > 0
      ? [{
          id: 'smart-review',
          kind: 'review',
          title: '到期复习',
          minutes: reviewMinutes,
          href: '/analysis',
          reason: `${due.length} 项 SM-2 到期复习，优先清空遗留记忆负债。`,
        }]
      : []),
    {
      id: 'smart-vocab',
      kind: 'vocabulary',
      title: '新词与错词巩固',
      minutes: vocabularyMinutes,
      href: '/typing',
      reason: errorCounts.vocabulary
        ? `当前有 ${errorCounts.vocabulary} 个 active 错词，先巩固再推进新词。`
        : '当前词汇错题压力较低，继续推进新词。',
    },
    {
      id: 'smart-grammar',
      kind: 'grammar',
      title: '语法训练',
      minutes: grammarMinutes,
      href: '/grammar-session',
      reason: errorCounts.grammar
        ? `当前有 ${errorCounts.grammar} 个 active 语法错点。`
        : '保持语法训练占比，避免只刷词汇。',
    },
    {
      id: 'smart-conjugation',
      kind: 'conjugation',
      title: '动词变位',
      minutes: conjugationMinutes,
      href: '/conjugation?mode=practice&scope=mixed',
      reason: errorCounts.conjugation
        ? `当前有 ${errorCounts.conjugation} 个 active 变位弱项。`
        : '用混合变位练习维持提取速度。',
    },
  ].filter((item) => item.minutes > 0)

  const tasks = definitions.map((item) => {
    const actualMinutes = actual[item.id] ?? 0
    return {
      ...item,
      actualMinutes,
      complete: actualMinutes >= item.minutes,
    }
  })

  return {
    day: today,
    targetMinutes,
    plannedRoadmapMinutes: plannedToday,
    dueReviews: due.length,
    activeErrors: activeErrors.length,
    completedMinutes: sum(tasks.map((item) => Math.min(item.minutes, item.actualMinutes))),
    tasks,
  }
}

export function buildTodayTaskPlan(input, today = toKey(new Date())) {
  const state = normalizeState(input)
  if (!date(today)) throw new Error('Invalid today-plan date')
  return todayPlanForState(state, today)
}

export function buildTcfSkillAnalytics(attempts, targetScore) {
  const sorted = [...attempts].sort((a, b) => a.finishedAt - b.finishedAt)
  const latest = sorted.length ? sorted[sorted.length - 1] : null
  const bestScore = sorted.length ? Math.max(...sorted.map((item) => (item.scaledScore ?? item.totalScore ?? item.total_score ?? item.score))) : null
  const latestScore = latest ? (latest.scaledScore ?? latest.totalScore ?? latest.total_score ?? latest.score) : null
  return {
    attempts: sorted.length,
    latestScore,
    bestScore,
    targetScore,
    gapToTarget: latestScore !== null ? Math.max(0, targetScore - latestScore) : null,
    latestNclc: latest?.nclc ?? null,
    trend: sorted.slice(-20).map((item) => ({
      id: item.id || item.attemptId || item.attempt_id,
      finishedAt: item.finishedAt || item.finished_at,
      score: item.scaledScore ?? item.totalScore ?? item.total_score ?? item.score,
      nclc: item.nclc,
    })),
  }
}

function tcfSkillAnalytics(state, skill, targetScore) {
  const attempts = (state.learning.tcfAttempts ?? [])
    .filter((item) => item.skill === skill)
  return buildTcfSkillAnalytics(attempts, targetScore)
}

export function studyAnalytics(input, now = new Date(), extra = {}) {
  const state = normalizeState(input)
  const today = toKey(now)
  const rawWeek = Math.floor(diffDays(state.startDate, today) / 7) + 1
  const currentWeek = Math.max(1, Math.min(26, rawWeek))
  const weekStart = addDays(state.startDate, (currentWeek - 1) * 7)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const weeklyMinutes = sum(weekDays.map((day) => recordedMinutesForDay(state, day)))
  const weeklyPlannedMinutes = sum(weekDays.map((day) => sum(Object.values(targetsFor(state, day)))))
  const weeklyPlannedDays = weekDays.filter((day) => sum(Object.values(targetsFor(state, day))) > 0).length
  const weeklyCompletedDays = weekDays.filter((day) => dayComplete(state, day)).length
  const phaseIndex = PHASES.findIndex(([start, end]) => currentWeek >= start && currentWeek <= end)
  const [phaseStartWeek, phaseEndWeek] = PHASES[Math.max(0, phaseIndex)]
  const phaseStart = addDays(state.startDate, (phaseStartWeek - 1) * 7)
  const phaseEnd = addDays(state.startDate, phaseEndWeek * 7 - 1)
  const effectiveEnd = today < phaseEnd ? today : phaseEnd
  const phaseCalendarDays = effectiveEnd < phaseStart ? 0 : diffDays(phaseStart, effectiveEnd) + 1
  let phaseElapsedDays = 0
  let phaseCompletedDays = 0
  for (let i = 0; i < phaseCalendarDays; i++) {
    const day = addDays(phaseStart, i)
    if (sum(Object.values(targetsFor(state, day))) <= 0) continue
    phaseElapsedDays += 1
    if (dayComplete(state, day)) phaseCompletedDays += 1
  }

  const vocabulary = state.learning.vocabulary.records
  const grammar = state.learning.grammar.history
  let conjugationCorrect = 0, conjugationTotal = 0
  const practicedVerbs = new Set()
  for (const [verb, tenses] of Object.entries(state.learning.conjugation)) {
    for (const stat of Object.values(tenses)) {
      conjugationCorrect += stat.correct
      conjugationTotal += stat.total
      if (stat.total > 0) practicedVerbs.add(verb)
    }
  }

  const activeDays = new Set(
    Object.entries(state.minutes)
      .filter(([, tasks]) => Object.values(tasks).some((value) => value > 0))
      .map(([day]) => day),
  )
  vocabulary.forEach((item) => activeDays.add(item.day))
  grammar.forEach((item) => activeDays.add(item.day))
  Object.entries(state.learning.conjugationDaily).forEach(([day, stat]) => {
    if (stat.total > 0) activeDays.add(day)
  })
  const grammarCorrect = sum(grammar.map((item) => item.score))
  const grammarTotal = sum(grammar.map((item) => item.total))
  const vocabularyWrongWords = new Set(vocabulary.filter((item) => item.wrongCount > 0).map((item) => item.word))
  const firstHistoryWeek = Math.max(1, currentWeek - 11)
  const weeklyHistory = Array.from({ length: currentWeek - firstHistoryWeek + 1 }, (_, index) => {
    const week = firstHistoryWeek + index
    const startDate = addDays(state.startDate, (week - 1) * 7)
    const days = Array.from({ length: 7 }, (__, dayIndex) => addDays(startDate, dayIndex))
    const plannedMinutes = sum(days.map((day) => sum(Object.values(targetsFor(state, day)))))
    const actualMinutes = sum(days.map((day) => recordedMinutesForDay(state, day)))
    const completedDays = days.filter((day) => dayComplete(state, day)).length
    const wrongRecords = vocabulary.filter(
      (item) => item.day >= startDate && item.day <= days[days.length - 1] && item.wrongCount > 0,
    )
    return {
      week,
      startDate,
      endDate: days[days.length - 1],
      minutes: actualMinutes,
      plannedMinutes,
      completionPercent: plannedMinutes ? Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100)) : 0,
      completedDays,
      wrongWords: new Set(wrongRecords.map((item) => item.word)).size,
      wrongAttempts: sum(wrongRecords.map((item) => item.wrongCount)),
    }
  })

  return {
    generatedAt: now.toISOString(),
    plan: {
      totalMinutes: totalPlanMinutes(state),
      currentWeek,
      weeklyMinutes,
      weeklyPlannedMinutes,
      weeklyPlannedDays,
      weeklyCompletedDays,
      weekCompletionPercent: weeklyPlannedDays ? Math.round((weeklyCompletedDays / weeklyPlannedDays) * 100) : 0,
      weeklyHistory,
      phase: {
        id: phaseIndex + 1,
        weeks: [phaseStartWeek, phaseEndWeek],
        completedDays: phaseCompletedDays,
        elapsedDays: phaseElapsedDays,
        completionPercent: phaseElapsedDays ? Math.round((phaseCompletedDays / phaseElapsedDays) * 100) : 0,
      },
    },
    streak: streaks(activeDays, today),
    vocabulary: {
      attempts: vocabulary.length,
      uniqueWords: new Set(vocabulary.map((item) => item.word)).size,
      wrongWords: vocabularyWrongWords.size,
      minutes: Math.round(sum(vocabulary.map((item) => item.durationMs)) / 60000),
      accuracy: accuracy(vocabulary.filter((item) => item.wrongCount === 0).length, vocabulary.length),
    },
    grammar: {
      sessions: grammar.length,
      correct: grammarCorrect,
      total: grammarTotal,
      accuracy: accuracy(grammarCorrect, grammarTotal),
      minutes: Math.round(sum(grammar.map((item) => item.elapsedSeconds)) / 60),
      hasDraft: state.learning.grammar.draft !== null,
    },
    conjugation: {
      attempts: conjugationTotal,
      correct: conjugationCorrect,
      accuracy: accuracy(conjugationCorrect, conjugationTotal),
      practicedVerbs: practicedVerbs.size,
    },
    focus: {
      sessions: state.learning.focusSessions.length,
      minutes: sum(state.learning.focusSessions.map((item) => item.minutes)),
    },
    tcf: {
      listening: tcfSkillAnalytics(state, 'listening', 458),
      reading: tcfSkillAnalytics(state, 'reading', 453),
      writing: buildTcfSkillAnalytics(extra.writingAttempts ?? [], 10),
      speaking: buildTcfSkillAnalytics(extra.speakingAttempts ?? [], 10),
    },
    trends: trendBuckets(state, today),
    rankings: rankings(state),
    reviewDue: buildReviewQueue(state, today).length,
    dashboard: dashboardForState(state, today),
    today: todayPlanForState(state, today),
  }
}

export function importOperations(backup) {
  if (!record(backup) || backup.format !== 'qwerty-study-plan' || ![1, 2, 3, 4, 5].includes(backup.version)) throw new Error('Unsupported backup')
  validate(backup.state)
  return [{ kind: 'replace', value: backup.state }]
}
export function exportPlan(state) {
  return { format: 'qwerty-study-plan', version: 5, schemaVersion: 8, exportedAt: new Date().toISOString(), state: normalizeState(state) }
}
