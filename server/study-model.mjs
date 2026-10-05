const date = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v
export const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const task = (v) => typeof v === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(v)
const minutes = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000000
const integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max
const text = (v, max) => typeof v === 'string' && v.length <= max
const uuid = (v) => typeof v === 'string' && /^[a-f0-9-]{36}$/.test(v)
const tense = (v) => ['present', 'passeCompose', 'imparfait'].includes(v)

const MAX_VOCAB_RECORDS = 3000
const MAX_GRAMMAR_HISTORY = 50
const MAX_STATE_BYTES = 1500000

export function emptyLearningProgress() {
  return {
    vocabulary: { records: [] },
    grammar: { draft: null, history: [] },
    conjugation: {},
    conjugationDaily: {},
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
      !(value.startedAt === null || integer(value.startedAt, 0, 9999999999999)) ||
      !(value.deadline === null || integer(value.deadline, 0, 9999999999999))) throw new Error('Invalid grammar draft')
  for (const [key, answer] of Object.entries(value.answers))
    if (!/^\d{1,4}$/.test(key) || !['A', 'B'].includes(answer)) throw new Error('Invalid grammar answer')
  for (const [key, reason] of Object.entries(value.reasons))
    if (!/^\d{1,4}$/.test(key) || !text(reason, 4000)) throw new Error('Invalid grammar reason')
  for (const [key, submitted] of Object.entries(value.submittedBatches))
    if (!/^\d{1,4}$/.test(key) || typeof submitted !== 'boolean') throw new Error('Invalid grammar batch')
  if (value.outputAnswers.some((answer) => !text(answer, 6000))) throw new Error('Invalid grammar output')
}

function validateGrammarSession(value) {
  if (!record(value) || !uuid(value.id) || !text(value.topic, 200) || !integer(value.score, 0, 10000) ||
      !integer(value.total, 0, 10000) || value.score > value.total || !integer(value.elapsedSeconds, 0, 86400) ||
      !integer(value.finishedAt, 0, 9999999999999) || !date(value.day) || !record(value.answers) ||
      !record(value.reasons) || !Array.isArray(value.outputAnswers) || value.outputAnswers.length > 20)
    throw new Error('Invalid grammar session')
  for (const [key, answer] of Object.entries(value.answers))
    if (!/^\d{1,4}$/.test(key) || !['A', 'B'].includes(answer)) throw new Error('Invalid grammar answer')
  for (const [key, reason] of Object.entries(value.reasons))
    if (!/^\d{1,4}$/.test(key) || !text(reason, 4000)) throw new Error('Invalid grammar reason')
  if (value.outputAnswers.some((answer) => !text(answer, 6000))) throw new Error('Invalid grammar output')
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

function validateLearning(value) {
  if (!record(value) || !record(value.vocabulary) || !Array.isArray(value.vocabulary.records) ||
      value.vocabulary.records.length > MAX_VOCAB_RECORDS || !record(value.grammar) ||
      !Array.isArray(value.grammar.history) || value.grammar.history.length > MAX_GRAMMAR_HISTORY ||
      !record(value.conjugation) || !record(value.conjugationDaily)) throw new Error('Invalid learning progress')
  value.vocabulary.records.forEach(validateVocabularyRecord)
  validateGrammarDraft(value.grammar.draft)
  value.grammar.history.forEach(validateGrammarSession)
  validateConjugation(value.conjugation)
  for (const [day, stat] of Object.entries(value.conjugationDaily)) {
    if (!date(day) || !record(stat) || !integer(stat.correct, 0, 10000000) ||
        !integer(stat.total, 0, 10000000) || stat.correct > stat.total) throw new Error('Invalid conjugation daily stat')
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
  if (state.learning !== undefined) validateLearning(state.learning)
  if (new TextEncoder().encode(JSON.stringify(state)).byteLength > MAX_STATE_BYTES) throw new Error('Plan too large')
}

export function normalizeState(state) {
  validate(state)
  const next = structuredClone(state)
  next.learning ??= emptyLearningProgress()
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

function conjugationTotals(stats) {
  let total = 0
  for (const tenses of Object.values(stats)) for (const value of Object.values(tenses)) total += value.total
  return total
}

export function apply(state, operations) {
  state = normalizeState(state)
  if (!Array.isArray(operations) || operations.length > 10000) throw new Error('Invalid operations')
  for (const op of operations) {
    if (!record(op)) throw new Error('Invalid operation')
    if (op.kind === 'replace') {
      state = normalizeState(op.value)
    } else if (op.kind === 'startDate' && date(op.value)) state.startDate = op.value
    else if (op.kind === 'mode' && date(op.day) && (op.value === null || typeof op.value === 'boolean')) {
      if (op.value === null) delete state.minimumMode[op.day]
      else state.minimumMode[op.day] = op.value
    } else if (['minutes', 'increment'].includes(op.kind) && date(op.day) && task(op.task) && (op.value === null || minutes(op.value))) {
      state.minutes[op.day] ??= {}
      if (op.value === null && op.kind === 'minutes') delete state.minutes[op.day][op.task]
      else if (op.value !== null)
        state.minutes[op.day][op.task] = op.kind === 'increment' ? (state.minutes[op.day][op.task] ?? 0) + op.value : op.value
      else throw new Error('Invalid increment')
    } else if (op.kind === 'vocabularyRecords' && Array.isArray(op.value) && op.value.length <= MAX_VOCAB_RECORDS) {
      state.learning.vocabulary.records = mergeVocabularyRecords(state.learning.vocabulary.records, op.value)
    } else if (op.kind === 'grammarDraft') {
      validateGrammarDraft(op.value)
      state.learning.grammar.draft = structuredClone(op.value)
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
    } else if (op.kind === 'conjugationAttempt' && text(op.verb, 120) && tense(op.tense) &&
               typeof op.correct === 'boolean' && date(op.day)) {
      const byVerb = state.learning.conjugation[op.verb] ?? {}
      const stat = byVerb[op.tense] ?? { correct: 0, total: 0 }
      byVerb[op.tense] = { correct: stat.correct + (op.correct ? 1 : 0), total: stat.total + 1 }
      state.learning.conjugation[op.verb] = byVerb
      const daily = state.learning.conjugationDaily[op.day] ?? { correct: 0, total: 0 }
      state.learning.conjugationDaily[op.day] = {
        correct: daily.correct + (op.correct ? 1 : 0),
        total: daily.total + 1,
      }
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

function targetsFor(state, day) {
  return state.minimumMode[day] ? MINIMUM_TARGETS : (NORMAL_TARGETS[keyToUtc(day).getUTCDay()] ?? {})
}
function actualForTargets(state, day, targets) {
  const actual = state.minutes[day] ?? {}
  return sum(Object.keys(targets).map((id) => actual[id] ?? 0))
}
function dayComplete(state, day) {
  const targets = targetsFor(state, day)
  const planned = sum(Object.values(targets))
  return planned > 0 && actualForTargets(state, day, targets) >= planned
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

export function studyAnalytics(input, now = new Date()) {
  const state = normalizeState(input)
  const today = toKey(now)
  const rawWeek = Math.floor(diffDays(state.startDate, today) / 7) + 1
  const currentWeek = Math.max(1, Math.min(26, rawWeek))
  const weekStart = addDays(state.startDate, (currentWeek - 1) * 7)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const weeklyMinutes = sum(weekDays.map((day) => actualForTargets(state, day, targetsFor(state, day))))
  const weeklyPlannedMinutes = sum(weekDays.map((day) => sum(Object.values(targetsFor(state, day)))))
  const weeklyCompletedDays = weekDays.filter((day) => dayComplete(state, day)).length
  const phaseIndex = PHASES.findIndex(([start, end]) => currentWeek >= start && currentWeek <= end)
  const [phaseStartWeek, phaseEndWeek] = PHASES[Math.max(0, phaseIndex)]
  const phaseStart = addDays(state.startDate, (phaseStartWeek - 1) * 7)
  const phaseEnd = addDays(state.startDate, phaseEndWeek * 7 - 1)
  const effectiveEnd = today < phaseEnd ? today : phaseEnd
  const phaseElapsedDays = effectiveEnd < phaseStart ? 0 : diffDays(phaseStart, effectiveEnd) + 1
  let phaseCompletedDays = 0
  for (let i = 0; i < phaseElapsedDays; i++) if (dayComplete(state, addDays(phaseStart, i))) phaseCompletedDays += 1

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

  return {
    generatedAt: now.toISOString(),
    plan: {
      totalMinutes: totalPlanMinutes(state),
      currentWeek,
      weeklyMinutes,
      weeklyPlannedMinutes,
      weeklyCompletedDays,
      weekCompletionPercent: Math.round((weeklyCompletedDays / 7) * 100),
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
    },
    grammar: {
      sessions: grammar.length,
      correct: grammarCorrect,
      total: grammarTotal,
      accuracy: grammarTotal ? Math.round((grammarCorrect / grammarTotal) * 100) : null,
      minutes: Math.round(sum(grammar.map((item) => item.elapsedSeconds)) / 60),
      hasDraft: state.learning.grammar.draft !== null,
    },
    conjugation: {
      attempts: conjugationTotal,
      correct: conjugationCorrect,
      accuracy: conjugationTotal ? Math.round((conjugationCorrect / conjugationTotal) * 100) : null,
      practicedVerbs: practicedVerbs.size,
    },
  }
}

export function importOperations(backup) {
  if (!record(backup) || backup.format !== 'qwerty-study-plan' || ![1, 2].includes(backup.version)) throw new Error('Unsupported backup')
  validate(backup.state)
  return [{ kind: 'replace', value: backup.state }]
}
export function exportPlan(state) {
  return { format: 'qwerty-study-plan', version: 2, exportedAt: new Date().toISOString(), state: normalizeState(state) }
}
