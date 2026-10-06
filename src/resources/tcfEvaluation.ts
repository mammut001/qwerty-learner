export function countFrenchWords(text: string): number {
  if (!text || typeof text !== 'string') return 0
  // In French, apostrophes separate words (e.g. l'école = 2 words, d'accord = 2 words).
  const normalized = text.replace(/['’]/g, ' ')
  const words = normalized.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu)
  return words ? words.length : 0
}

export type TcfEeScores = {
  taskCompletion: number // 0-5
  coherence: number // 0-5
  vocabulary: number // 0-5
  grammar: number // 0-5
}

export function calculateEeTotalScore(scores: Partial<TcfEeScores>): number {
  const tc = Math.max(0, Math.min(5, Math.round(scores.taskCompletion ?? 0)))
  const co = Math.max(0, Math.min(5, Math.round(scores.coherence ?? 0)))
  const vo = Math.max(0, Math.min(5, Math.round(scores.vocabulary ?? 0)))
  const gr = Math.max(0, Math.min(5, Math.round(scores.grammar ?? 0)))
  return tc + co + vo + gr
}

export function estimateTcfEeNclc(score: number): number {
  const s = Math.max(0, Math.min(20, Math.round(score)))
  if (s >= 16) return 10
  if (s >= 14) return 9
  if (s >= 12) return 8
  if (s >= 10) return 7
  if (s >= 7) return 6
  if (s >= 6) return 5
  if (s >= 4) return 4
  return 0
}

export type TcfEoScores = {
  fluency: number // 0-4
  pronunciation: number // 0-4
  vocabulary: number // 0-4
  grammar: number // 0-4
  taskCompletion: number // 0-4
}

export function calculateEoTotalScore(scores: Partial<TcfEoScores>): number {
  const fl = Math.max(0, Math.min(4, Math.round(scores.fluency ?? 0)))
  const pr = Math.max(0, Math.min(4, Math.round(scores.pronunciation ?? 0)))
  const vo = Math.max(0, Math.min(4, Math.round(scores.vocabulary ?? 0)))
  const gr = Math.max(0, Math.min(4, Math.round(scores.grammar ?? 0)))
  const tc = Math.max(0, Math.min(4, Math.round(scores.taskCompletion ?? 0)))
  return fl + pr + vo + gr + tc
}

export function estimateTcfEoNclc(score: number): number {
  const s = Math.max(0, Math.min(20, Math.round(score)))
  if (s >= 16) return 10
  if (s >= 14) return 9
  if (s >= 12) return 8
  if (s >= 10) return 7
  if (s >= 7) return 6
  if (s >= 6) return 5
  if (s >= 4) return 4
  return 0
}
