const date = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v
export const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const task = (v) => typeof v === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(v)
const minutes = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000000
export function validate(state) {
  if (!record(state) || !date(state.startDate) || !record(state.minutes) || !record(state.minimumMode)) throw new Error('Invalid plan')
  for (const [day, tasks] of Object.entries(state.minutes)) {
    if (!date(day) || !record(tasks)) throw new Error('Invalid day')
    for (const [id, value] of Object.entries(tasks)) if (!task(id) || !minutes(value)) throw new Error('Invalid minutes')
  }
  for (const [day, value] of Object.entries(state.minimumMode))
    if (!date(day) || typeof value !== 'boolean') throw new Error('Invalid mode')
  if (new TextEncoder().encode(JSON.stringify(state)).byteLength > 512000) throw new Error('Plan too large')
}
export function apply(state, operations) {
  if (!Array.isArray(operations) || operations.length > 10000) throw new Error('Invalid operations')
  for (const op of operations) {
    if (!record(op)) throw new Error('Invalid operation')
    if (op.kind === 'startDate' && date(op.value)) state.startDate = op.value
    else if (op.kind === 'mode' && date(op.day) && (op.value === null || typeof op.value === 'boolean')) {
      if (op.value === null) delete state.minimumMode[op.day]
      else state.minimumMode[op.day] = op.value
    } else if (['minutes', 'increment'].includes(op.kind) && date(op.day) && task(op.task) && (op.value === null || minutes(op.value))) {
      state.minutes[op.day] ??= {}
      if (op.value === null && op.kind === 'minutes') delete state.minutes[op.day][op.task]
      else if (op.value !== null)
        state.minutes[op.day][op.task] = op.kind === 'increment' ? (state.minutes[op.day][op.task] ?? 0) + op.value : op.value
      else throw new Error('Invalid increment')
    } else throw new Error('Invalid operation')
  }
  validate(state)
  return state
}

