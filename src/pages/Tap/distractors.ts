/**
 * Wrong options for multiple-choice questions. Pure so it can be unit tested without the UI.
 *
 * Candidates come from two pools: `primary` (the current chapter) is always tried first, and `fallback`
 * (the rest of the dictionary) only fills the gap when the primary pool has too few distinct options.
 */

export type DistractorOptions = {
  /** Number of wrong options wanted (the answer is not counted). Default 3. */
  count?: number
  /** Prefer candidates whose spelling is close to the target (accents stripped). Default false. */
  similar?: boolean
  /** Random source in [0, 1). Injectable for tests. */
  random?: () => number
}

/** Lower-case, accent-free form used to compare spelling. */
export function spellingKey(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/** Classic edit distance (insert, delete, substitute), two-row version. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
    }
    previous = current
  }
  return previous[b.length]
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Distinct candidate texts, without the target itself and without anything that reads exactly the same as the target. */
function usableCandidates(target: string, pool: readonly string[]): string[] {
  const seen = new Set<string>([target])
  const result: string[] = []
  for (const text of pool) {
    if (typeof text !== 'string' || text.length === 0 || seen.has(text)) continue
    seen.add(text)
    result.push(text)
  }
  return result
}

/**
 * Picks from one pool. With `similar`, texts with the same accent-free spelling as the target come first
 * (so "ou" / "où" traps always show up), then the closest spellings, sampled so repeated questions differ.
 */
function drawFrom(
  target: string,
  pool: string[],
  count: number,
  options: Required<Pick<DistractorOptions, 'similar' | 'random'>>,
): string[] {
  if (pool.length <= count) return shuffled(pool, options.random)
  if (!options.similar) return shuffled(pool, options.random).slice(0, count)

  const targetKey = spellingKey(target)
  const ranked = shuffled(pool, options.random)
    .map((text) => {
      const key = spellingKey(text)
      // Normalised by length so short words do not win just by being short.
      const distance = editDistance(targetKey, key) / Math.max(targetKey.length, key.length, 1)
      return { text, same: key === targetKey, distance }
    })
    .sort((a, b) => Number(b.same) - Number(a.same) || a.distance - b.distance)

  const sameSpelling = ranked.filter((item) => item.same).map((item) => item.text)
  // A band one wider than needed: still close spellings, but varied from question to question.
  const closest = ranked.slice(0, count + 1).map((item) => item.text)
  const head = sameSpelling.slice(0, count)
  const rest = closest.filter((text) => !head.includes(text))
  return [...head, ...shuffled(rest, options.random).slice(0, count - head.length)]
}

/**
 * Returns up to `count` distinct wrong options for `target`. Fewer are returned only when both pools together
 * do not have enough distinct texts; the caller decides how to present a short option list.
 */
export function pickDistractors(
  target: string,
  primary: readonly string[],
  fallback: readonly string[] = [],
  options: DistractorOptions = {},
): string[] {
  const count = Math.max(0, Math.floor(options.count ?? 3))
  const resolved = { similar: options.similar ?? false, random: options.random ?? Math.random }
  if (count === 0) return []

  const primaryPool = usableCandidates(target, primary)
  const picked = drawFrom(target, primaryPool, count, resolved)
  if (picked.length >= count) return picked

  const picks = new Set(picked)
  const extra = usableCandidates(target, fallback).filter((text) => !picks.has(text) && !primaryPool.includes(text))
  const more = drawFrom(target, extra, count - picked.length, resolved)
  return [...picked, ...more]
}

/** Shuffles the answer in among the wrong options. The answer is always included exactly once. */
export function buildOptions(answer: string, distractors: readonly string[], random: () => number = Math.random): string[] {
  const wrong = Array.from(new Set(distractors)).filter((text) => text !== answer)
  return shuffled([answer, ...wrong], random)
}
