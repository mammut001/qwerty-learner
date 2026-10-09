import * as raw from '../../server/echelle-curriculum.mjs'
import type { EchelleDiscourseType } from './echelleQuebecoise'

export type EchelleItemSkill = 'listening' | 'reading' | 'writing' | 'speaking' | 'lex' | 'gr'

export type EchelleQuestion = { prompt: string; choices: string[]; answer: string }

type EchelleItemBase = { id: string; level: number; skill: EchelleItemSkill; titleZh: string }

export type EchelleQuizItem = EchelleItemBase & {
  kind: 'grammar' | 'lexique' | 'indicator'
  questions: EchelleQuestion[]
  threshold: number
  explanationZh?: string
  examples?: [string, string][]
  words?: [string, string][]
  descriptionFr?: string
  text?: string
  audioText?: string
  typeDeDiscours?: EchelleDiscourseType
}

export type EchelleProductionItem = EchelleItemBase & {
  kind: 'production'
  skill: 'writing' | 'speaking'
  promptZh: string
  promptFr: string
  wordMin?: number
  secondsMin?: number
  selfChecks: string[]
  typeDeDiscours?: EchelleDiscourseType
  situations?: string[]
}

export type EchelleCatalogItem = EchelleQuizItem | EchelleProductionItem

export type EchelleProductionResponse = { selfChecks: boolean[]; wordCount?: number; seconds?: number }

export type EchelleScore = {
  kind: EchelleCatalogItem['kind']
  correctCount: number
  totalQuestions: number
  score: number
  mastered: boolean
}

export type EchelleLevelSummary = {
  level: number
  passed: boolean
  total: number
  mastered: number
  skills: Partial<Record<EchelleItemSkill, { total: number; mastered: number }>>
}

export const ECHELLE_ITEM_CATALOG = raw.ECHELLE_ITEM_CATALOG as Readonly<Record<string, EchelleCatalogItem>>

export const getEchelleLevelItems = raw.getEchelleLevelItems as (level: number) => string[]

export const parseEchelleItemId = raw.parseEchelleItemId as (itemId: string) => { level: number; skill: EchelleItemSkill } | null

export const scoreEchelleItem = raw.scoreEchelleItem as (
  itemId: string,
  answers?: string[],
  meta?: Partial<EchelleProductionResponse>,
) => EchelleScore | null

export const summarizeEchelleLevel = raw.summarizeEchelleLevel as (
  level: number,
  masteredIds: string[] | Set<string>,
) => EchelleLevelSummary

export const getEchelleProductionTaskPool = raw.getEchelleProductionTaskPool as (
  skill: 'writing' | 'speaking',
  level: number,
) => EchelleProductionItem[]
