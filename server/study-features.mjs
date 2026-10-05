const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const dateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const addDays = (key, amount) => {
  const value = new Date(key + 'T00:00:00.000Z')
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}
const diffDays = (from, to) => Math.floor((new Date(to + 'T00:00:00.000Z') - new Date(from + 'T00:00:00.000Z')) / 86400000)
const accuracy = (correct, total) => (total ? Math.round((correct / total) * 100) : null)
const sum = (values) => values.reduce((total, value) => total + value, 0)

const upsertAttempt = (map, itemId, seed, correct, at, errorWeight = 1) => {
  const row = map.get(itemId) ?? {
    ...seed,
    itemId,
    errorCount: 0,
    correctStreak: 0,
    firstWrongAt: null,
    lastWrongAt: null,
    lastAttemptAt: 0,
  }
  row.lastAttemptAt = Math.max(row.lastAttemptAt, at)
  if (correct) {
    if (row.errorCount > 0) row.correctStreak += 1
  } else {
    row.errorCount += Math.max(1, errorWeight)
    row.correctStreak = 0
    row.firstWrongAt = row.firstWrongAt === null ? at : Math.min(row.firstWrongAt, at)
    row.lastWrongAt = row.lastWrongAt === null ? at : Math.max(row.lastWrongAt, at)
  }
  map.set(itemId, row)
}

export function buildErrorBookEntries(state, masteredCorrects = 3) {
  const items = new Map()
  const vocabulary = [...(state?.learning?.vocabulary?.records ?? [])]
    .sort((a, b) => a.timeStamp - b.timeStamp || String(a.id).localeCompare(String(b.id)))
  for (const record of vocabulary) {
    const sourceId = record.dict + '|' + record.word
    const itemId = 'vocabulary:' + sourceId
    upsertAttempt(
      items,
      itemId,
      {
        kind: 'vocabulary',
        sourceId,
        label: record.word,
        context: { dict: record.dict, chapter: record.chapter },
      },
      record.wrongCount === 0,
      record.timeStamp * 1000,
      record.wrongCount,
    )
  }

  const grammar = [...(state?.learning?.grammar?.history ?? [])]
    .sort((a, b) => a.finishedAt - b.finishedAt || String(a.id).localeCompare(String(b.id)))
  for (const session of grammar) {
    if (session.items?.length) {
      for (const item of session.items) {
        const sourceId = item.id
        const itemId = 'grammar:' + sourceId
        upsertAttempt(
          items,
          itemId,
          {
            kind: 'grammar',
            sourceId,
            label: item.label,
            context: { topic: session.topic, prompt: item.prompt ?? null },
          },
          item.correct,
          session.finishedAt,
        )
      }
    } else {
      const sourceId = 'topic:' + session.topic
      const itemId = 'grammar:' + sourceId
      upsertAttempt(
        items,
        itemId,
        {
          kind: 'grammar',
          sourceId,
          label: session.topic,
          context: { topic: session.topic, prompt: null },
        },
        session.score === session.total,
        session.finishedAt,
        Math.max(1, session.total - session.score),
      )
    }
  }

  // Conjugation aggregate stats pre-date per-attempt history. Keep aggregate errors as
  // the durable "this item was wrong" signal, then use newer per-attempt events only
  // to derive the current consecutive-correct streak and last-error timestamp.
  for (const [verb, tenses] of Object.entries(state?.learning?.conjugation ?? {})) {
    for (const [tense, stat] of Object.entries(tenses ?? {})) {
      const errors = Math.max(0, Number(stat?.total ?? 0) - Number(stat?.correct ?? 0))
      if (!errors) continue
      const sourceId = verb + '|' + tense
      const itemId = 'conjugation:' + sourceId
      items.set(itemId, {
        itemId,
        kind: 'conjugation',
        sourceId,
        label: verb + ' · ' + tense,
        context: { verb, tense },
        errorCount: errors,
        correctStreak: 0,
        firstWrongAt: 0,
        lastWrongAt: 0,
        lastAttemptAt: 0,
      })
    }
  }

  const conjugationAttempts = [...(state?.learning?.conjugationAttempts ?? [])]
    .sort((a, b) => a.occurredAt - b.occurredAt || String(a.id).localeCompare(String(b.id)))
  for (const attempt of conjugationAttempts) {
    const sourceId = attempt.verb + '|' + attempt.tense
    const itemId = 'conjugation:' + sourceId
    const row = items.get(itemId)
    if (!row) continue
    row.lastAttemptAt = Math.max(row.lastAttemptAt, attempt.occurredAt)
    if (attempt.correct) {
      row.correctStreak += 1
    } else {
      row.correctStreak = 0
      row.lastWrongAt = Math.max(row.lastWrongAt ?? 0, attempt.occurredAt)
      if (!row.firstWrongAt) row.firstWrongAt = attempt.occurredAt
    }
  }

  return [...items.values()]
    .filter((item) => item.errorCount > 0)
    .map((item) => ({
      ...item,
      mastered: item.correctStreak >= masteredCorrects,
      masteredCorrects,
      updatedAt: Math.max(item.lastAttemptAt, item.lastWrongAt ?? 0),
    }))
    .sort((a, b) => Number(a.mastered) - Number(b.mastered) || (b.lastWrongAt ?? 0) - (a.lastWrongAt ?? 0) || b.errorCount - a.errorCount)
}

export function activeErrorBookCandidates(state) {
  return buildErrorBookEntries(state)
    .filter((item) => !item.mastered)
    .map((item) => ({
      itemId: item.itemId,
      kind: item.kind,
      sourceId: item.sourceId,
      label:
        item.kind === 'grammar' && item.context?.prompt
          ? item.label + ' · ' + item.context.prompt
          : item.label,
      errorCount: item.errorCount,
      lastErrorAt: item.lastWrongAt ?? 0,
    }))
}

export function planWeekStart(state, day) {
  if (!dateKey(state?.startDate) || !dateKey(day)) throw new Error('Invalid plan week date')
  const offset = Math.floor(diffDays(state.startDate, day) / 7) * 7
  return addDays(state.startDate, Math.max(0, offset))
}

const dayLearningMetrics = (state, day) => {
  const vocab = (state?.learning?.vocabulary?.records ?? []).filter((item) => item.day === day)
  const grammar = (state?.learning?.grammar?.history ?? []).filter((item) => item.day === day)
  const conjugation = state?.learning?.conjugationDaily?.[day] ?? { correct: 0, total: 0 }
  return {
    vocabularyCorrect: vocab.filter((item) => item.wrongCount === 0).length,
    vocabularyTotal: vocab.length,
    grammarCorrect: sum(grammar.map((item) => Number(item.score ?? 0))),
    grammarTotal: sum(grammar.map((item) => Number(item.total ?? 0))),
    conjugationCorrect: Number(conjugation.correct ?? 0),
    conjugationTotal: Number(conjugation.total ?? 0),
  }
}

export function buildWeeklyReport(state, weekStart, daySummaries, previousReport = null) {
  if (!dateKey(weekStart) || !Array.isArray(daySummaries) || daySummaries.length !== 7)
    throw new Error('Invalid weekly report input')
  const weekEnd = addDays(weekStart, 6)
  const learning = Array.from({ length: 7 }, (_, index) => dayLearningMetrics(state, addDays(weekStart, index)))
  const total = (key) => sum(learning.map((item) => item[key]))
  const vocabularyAccuracy = accuracy(total('vocabularyCorrect'), total('vocabularyTotal'))
  const grammarAccuracy = accuracy(total('grammarCorrect'), total('grammarTotal'))
  const conjugationAccuracy = accuracy(total('conjugationCorrect'), total('conjugationTotal'))
  const minutes = sum(daySummaries.map((item) => item.actualMinutes))
  const plannedMinutes = sum(daySummaries.map((item) => item.plannedMinutes))
  const plannedDays = daySummaries.filter((item) => item.plannedMinutes > 0).length
  const completedDays = daySummaries.filter((item) => item.complete).length
  const completionPercent = plannedMinutes ? Math.min(100, Math.round((minutes / plannedMinutes) * 100)) : 0
  const weakPoints = buildErrorBookEntries(state)
    .filter((item) => !item.mastered && (item.lastWrongAt ?? 0) <= new Date(weekEnd + 'T23:59:59.999Z').getTime())
    .sort((a, b) => b.errorCount - a.errorCount || (b.lastWrongAt ?? 0) - (a.lastWrongAt ?? 0))
    .slice(0, 5)
    .map((item) => ({ kind: item.kind, label: item.label, errors: item.errorCount }))

  const changes = {
    vocabularyAccuracy: previousReport?.accuracy?.vocabulary === null || previousReport?.accuracy?.vocabulary === undefined || vocabularyAccuracy === null
      ? null : vocabularyAccuracy - previousReport.accuracy.vocabulary,
    grammarAccuracy: previousReport?.accuracy?.grammar === null || previousReport?.accuracy?.grammar === undefined || grammarAccuracy === null
      ? null : grammarAccuracy - previousReport.accuracy.grammar,
    conjugationAccuracy: previousReport?.accuracy?.conjugation === null || previousReport?.accuracy?.conjugation === undefined || conjugationAccuracy === null
      ? null : conjugationAccuracy - previousReport.accuracy.conjugation,
  }

  const suggestions = []
  if (completionPercent < 70) suggestions.push('下周先保住每天目标，减少同时开启的新任务。')
  if (vocabularyAccuracy !== null && vocabularyAccuracy < 80) suggestions.push('把错词本前几项加入每天 10 分钟短复习。')
  if (grammarAccuracy !== null && grammarAccuracy < 80) suggestions.push('优先重练错题最多的语法点，并写一句理由再提交。')
  if (conjugationAccuracy !== null && conjugationAccuracy < 80) suggestions.push('对高频弱项动词做短轮次变位练习，连续答对 3 次再移出错题本。')
  if (!suggestions.length) suggestions.push('本周节奏稳定，下周维持当前计划并优先处理到期 SM-2 复习。')

  return {
    weekStart,
    weekEnd,
    minutes,
    plannedMinutes,
    plannedDays,
    completedDays,
    completionPercent,
    accuracy: {
      vocabulary: vocabularyAccuracy,
      grammar: grammarAccuracy,
      conjugation: conjugationAccuracy,
    },
    accuracyChange: changes,
    weakPoints,
    suggestions,
  }
}

export function buildAchievementCandidates(state, checkinDays = []) {
  const vocabularyUnique = new Set((state?.learning?.vocabulary?.records ?? []).map((item) => item.word)).size
  const totalMinutes = sum(Object.values(state?.minutes ?? {}).flatMap((tasks) => Object.values(tasks ?? {}).map(Number)))
  const days = [...new Set(checkinDays.filter(dateKey))].sort()
  let longestStreak = 0, run = 0, previous = null
  for (const day of days) {
    run = previous && diffDays(previous, day) === 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = day
  }

  const catalog = [
    ['vocab-50', '词汇起步', '累计练习 50 个不同单词', vocabularyUnique >= 50, { vocabularyUnique }],
    ['vocab-100', '百词里程碑', '累计练习 100 个不同单词', vocabularyUnique >= 100, { vocabularyUnique }],
    ['vocab-300', '词汇积累者', '累计练习 300 个不同单词', vocabularyUnique >= 300, { vocabularyUnique }],
    ['streak-3', '三日连击', '连续完成学习目标 3 天', longestStreak >= 3, { longestStreak }],
    ['streak-7', '一周不间断', '连续完成学习目标 7 天', longestStreak >= 7, { longestStreak }],
    ['streak-14', '两周坚持', '连续完成学习目标 14 天', longestStreak >= 14, { longestStreak }],
    ['streak-30', '月度坚持者', '连续完成学习目标 30 天', longestStreak >= 30, { longestStreak }],
    ['minutes-600', '十小时', '累计学习 600 分钟', totalMinutes >= 600, { totalMinutes }],
    ['minutes-1800', '三十小时', '累计学习 1800 分钟', totalMinutes >= 1800, { totalMinutes }],
    ['minutes-6000', '百小时', '累计学习 6000 分钟', totalMinutes >= 6000, { totalMinutes }],
  ]

  return catalog
    .filter(([, , , unlocked]) => unlocked)
    .map(([id, title, description, , progress]) => ({ id, title, description, progress }))
}

export function streakFromCheckins(days, today) {
  const active = new Set(days.filter(dateKey))
  let cursor = active.has(today) ? today : addDays(today, -1)
  let current = 0
  while (active.has(cursor)) {
    current += 1
    cursor = addDays(cursor, -1)
  }
  let longest = 0, run = 0, previous = null
  for (const day of [...active].sort()) {
    run = previous && diffDays(previous, day) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = day
  }
  return { current, longest }
}

export const featureDateUtils = { addDays, diffDays, dateKey }
