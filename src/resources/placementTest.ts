import {
  PLACEMENT_QUESTIONS as RAW_PLACEMENT_QUESTIONS,
  PLACEMENT_SECTIONS as RAW_PLACEMENT_SECTIONS,
} from '../../server/placement-data.mjs'

export type PlacementSection = 'vocabulary' | 'grammar' | 'reading'
export type PlacementCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'B2+'

export type PlacementQuestion = {
  id: string
  section: PlacementSection
  level: Exclude<PlacementCefrLevel, 'B2+'>
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  passage?: string
}

export type PlacementRouteHint = { href: string; label: string }

export type PlacementRecommendations = {
  studyPhaseId: number
  suggestedStartWeek: number
  estimatedNclc: string
  vocabularyDictIds: string[]
  grammarTopicIds: string[]
  routes: PlacementRouteHint[]
  summaryZh: string
  teachingFocus: string[]
}

export type PlacementAnswerRecord = {
  questionId: string
  choiceIndex: number
  correct: boolean
}

export type PlacementResult = {
  id: string
  finishedAt: number
  startedAt: number
  day: string
  durationSeconds: number
  cefrLevel: PlacementCefrLevel
  sectionScores: Record<PlacementSection, { correct: number; total: number }>
  levelScores: Record<Exclude<PlacementCefrLevel, 'B2+'>, { correct: number; total: number }>
  answers: PlacementAnswerRecord[]
  recommendations: PlacementRecommendations
  questionCount: number
  version: 1
}

export type PlacementProfile = {
  latest: PlacementResult | null
  history: PlacementResult[]
}

export const PLACEMENT_QUESTIONS = RAW_PLACEMENT_QUESTIONS as PlacementQuestion[]
export const PLACEMENT_SECTIONS = RAW_PLACEMENT_SECTIONS as PlacementSection[]

export {
  computePlacementResult,
  placementSectionLabel,
  buildPlacementRecommendations,
  deriveCefrLevel,
} from '../../server/placement-data.mjs'
