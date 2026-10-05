const quote = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}
const row = (values) => values.map(quote).join(',')
const iso = (value) => {
  if (!value) return ''
  const date = new Date(Number(value))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}
const csv = (rows) => '\uFEFF' + rows.map(row).join('\r\n') + '\r\n'

export function learningRecordsCsv(state) {
  const rows = [[
    'record_type','day','module','item','detail','correct','total','minutes','timestamp'
  ]]

  for (const [day, tasks] of Object.entries(state?.minutes ?? {})) {
    for (const [task, minutes] of Object.entries(tasks ?? {})) {
      rows.push(['study_minutes', day, 'plan', task, '', '', '', Number(minutes) || 0, ''])
    }
  }
  for (const item of state?.learning?.vocabulary?.records ?? []) {
    rows.push([
      'vocabulary', item.day, 'vocabulary', item.word, item.dict,
      item.wrongCount === 0 ? 1 : 0, 1,
      Math.round((Number(item.durationMs ?? 0) / 60000) * 100) / 100,
      iso(Number(item.timeStamp ?? 0) * 1000),
    ])
  }
  for (const item of state?.learning?.grammar?.history ?? []) {
    rows.push([
      'grammar', item.day, 'grammar', item.topic, '',
      Number(item.score ?? 0), Number(item.total ?? 0),
      Math.round((Number(item.elapsedSeconds ?? 0) / 60) * 100) / 100,
      iso(item.finishedAt),
    ])
  }
  for (const item of state?.learning?.conjugationAttempts ?? []) {
    rows.push([
      'conjugation', item.day, 'conjugation', item.verb, item.tense,
      item.correct ? 1 : 0, 1, '', iso(item.occurredAt),
    ])
  }
  for (const item of state?.learning?.focusSessions ?? []) {
    rows.push([
      'focus', item.day, 'focus', item.title, item.taskId,
      '', '', Number(item.minutes) || 0, iso(item.endedAt),
    ])
  }
  return csv(rows)
}

export function errorBookCsv(items) {
  const rows = [[
    'status','kind','label','source_id','error_count','correct_streak','first_wrong_at','last_wrong_at','last_attempt_at'
  ]]
  for (const item of items ?? []) {
    rows.push([
      item.mastered ? 'mastered' : 'active',
      item.kind,
      item.label,
      item.sourceId,
      item.errorCount,
      item.correctStreak,
      iso(item.firstWrongAt),
      iso(item.lastWrongAt),
      iso(item.lastAttemptAt),
    ])
  }
  return csv(rows)
}

export function weeklyReportsCsv(items) {
  const rows = [[
    'week_start','week_end','minutes','planned_minutes','completion_percent',
    'vocabulary_accuracy','grammar_accuracy','conjugation_accuracy',
    'vocabulary_minutes','grammar_minutes','conjugation_minutes','focus_minutes',
    'weak_points','suggestions','finalized'
  ]]
  for (const item of items ?? []) {
    rows.push([
      item.weekStart,
      item.weekEnd,
      item.minutes,
      item.plannedMinutes,
      item.completionPercent,
      item.accuracy?.vocabulary ?? '',
      item.accuracy?.grammar ?? '',
      item.accuracy?.conjugation ?? '',
      item.activityMinutes?.vocabulary ?? 0,
      item.activityMinutes?.grammar ?? 0,
      item.activityMinutes?.conjugation ?? 0,
      item.activityMinutes?.focus ?? 0,
      (item.weakPoints ?? []).map((point) => `${point.label}:${point.errors}`).join('; '),
      (item.suggestions ?? []).join('; '),
      item.finalized ? 'true' : 'false',
    ])
  }
  return csv(rows)
}
