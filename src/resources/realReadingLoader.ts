export interface RealReadingMeta {
  id: string
  level: number
  site: 'vikidia' | 'wikipedia'
  title: string
  url: string
  historyUrl: string
  revisionId: number | string
  licenceName: string
  licenceUrl: string
  retrievedAt: string
  words: number
  wordCount: number
  justificationFr: string
  paragraphsKept: number[]
  disagreement: boolean
}

export interface RealReadingPassage extends RealReadingMeta {
  text: string
  questions: [string, string, string, string][]
}

export interface RealReadingScoreResult {
  kind: 'real-reading'
  correctCount: number
  totalQuestions: number
  score: number
  mastered: boolean
  results: boolean[]
  perQuestion: boolean[]
}

export type RealReadingModule = {
  listRealReading: (level?: number) => RealReadingMeta[]
  getRealReading: (id: string) => RealReadingPassage | null
  scoreRealReading: (id: string, answers: (string | number)[]) => RealReadingScoreResult | null
  formatRealReadingAttribution: (passage: RealReadingPassage | RealReadingMeta) => string
  getRealReadingAttribution: (passage: RealReadingPassage | RealReadingMeta) => string
}

let loaderPromise: Promise<RealReadingModule> | null = null

export function loadRealReadingModule(): Promise<RealReadingModule> {
  if (!loaderPromise) {
    loaderPromise = import('../../server/real-reading.mjs') as unknown as Promise<RealReadingModule>
  }
  return loaderPromise
}

export async function listRealReadingForLevel(level: number): Promise<RealReadingMeta[]> {
  const mod = await loadRealReadingModule()
  return mod.listRealReading(level)
}

export async function getRealReadingPassage(id: string): Promise<RealReadingPassage | null> {
  const mod = await loadRealReadingModule()
  return mod.getRealReading(id)
}

export async function scoreRealReadingPassage(
  id: string,
  answers: (string | number)[],
): Promise<RealReadingScoreResult | null> {
  const mod = await loadRealReadingModule()
  return mod.scoreRealReading(id, answers)
}
