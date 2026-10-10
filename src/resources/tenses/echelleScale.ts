import * as rawEchelle from '../../../server/echelle-data.mjs'
import type { TenseLesson } from './types'

export type ScaleSkill = 'listening' | 'reading' | 'writing' | 'speaking'

export type ScaleWordingSkills = {
  listening?: number
  reading?: number
  writing?: number
  speaking?: number
}

// Build map at module load
const WORDING_MAP = new Map<string, ScaleWordingSkills>()

interface RawLevelData {
  level: number
  dimensions?: Record<string, string[]>
}

interface RawEchelleModule {
  ECHELLE_LEVELS?: Record<ScaleSkill, RawLevelData[]>
}

const rawLevels = (rawEchelle as unknown as RawEchelleModule).ECHELLE_LEVELS

if (rawLevels) {
  const skills: ScaleSkill[] = ['listening', 'reading', 'writing', 'speaking']
  for (const skill of skills) {
    const list = rawLevels[skill] || []
    for (const lvl of list) {
      if (lvl.dimensions) {
        for (const dimKey of Object.keys(lvl.dimensions)) {
          const arr = lvl.dimensions[dimKey]
          if (Array.isArray(arr)) {
            for (const item of arr) {
              if (typeof item === 'string') {
                const trimmed = item.trim()
                let entry = WORDING_MAP.get(trimmed)
                if (!entry) {
                  entry = {}
                  WORDING_MAP.set(trimmed, entry)
                }
                entry[skill] = lvl.level
              }
            }
          }
        }
      }
    }
  }
}

/** Get the skill -> level map for a given verbatim scale wording */
export function getWordingSkills(wording: string): ScaleWordingSkills | undefined {
  return WORDING_MAP.get(wording.trim())
}

/** Check if a wording exists verbatim in the scale dimensions */
export function hasWording(wording: string): boolean {
  return WORDING_MAP.has(wording.trim())
}

/** Returns the entire wording map (read-only) */
export function getWordingMap(): ReadonlyMap<string, ScaleWordingSkills> {
  return WORDING_MAP
}

/**
 * Formats a scale wording citation string:
 * « Niveau 2 (compréhension) · Niveau 3 (production) — Quelques verbes à l’indicatif présent »
 * or « Niveau 7 — Des verbes au plus-que-parfait »
 */
export function formatEchelleCitation(wording: string): string {
  const trimmed = wording.trim()
  const skills = getWordingSkills(trimmed)
  if (!skills) {
    throw new Error(`Scale wording not found in official Quebec Scale: "${trimmed}"`)
  }

  const compLevels = [skills.listening, skills.reading].filter((n): n is number => typeof n === 'number')
  const prodLevels = [skills.writing, skills.speaking].filter((n): n is number => typeof n === 'number')
  const minComp = compLevels.length > 0 ? Math.min(...compLevels) : null
  const minProd = prodLevels.length > 0 ? Math.min(...prodLevels) : null

  const parts: string[] = []
  if (minComp !== null && minProd !== null) {
    if (minComp === minProd) {
      parts.push(`Niveau ${minComp}`)
    } else {
      parts.push(`Niveau ${minComp} (compréhension) · Niveau ${minProd} (production)`)
    }
  } else if (minComp !== null) {
    parts.push(`Niveau ${minComp} (compréhension)`)
  } else if (minProd !== null) {
    parts.push(`Niveau ${minProd} (production)`)
  }

  return `${parts.join(' · ')} — ${trimmed}`
}

/**
 * Derives echelleNiveau (number | [number, number]) across a list of verbatim wordings
 */
export function deriveEchelleNiveau(wordings: string[]): number | [number, number] {
  const allLevels: number[] = []
  for (const w of wordings) {
    const skills = getWordingSkills(w)
    if (skills) {
      for (const lvl of Object.values(skills)) {
        if (typeof lvl === 'number') {
          allLevels.push(lvl)
        }
      }
    }
  }

  if (allLevels.length === 0) return 1
  const min = Math.min(...allLevels)
  const max = Math.max(...allLevels)
  return min === max ? min : [min, max]
}

/**
 * Computes both echelleNiveau and echelleSources from verbatim scale wordings
 */
export function computeEchelleScaleInfo(wordings: string[]): {
  echelleNiveau: number | [number, number]
  echelleSources: string[]
} {
  return {
    echelleNiveau: deriveEchelleNiveau(wordings),
    echelleSources: wordings.map(formatEchelleCitation),
  }
}

/**
 * Canonical verbatim wordings from the Quebec Scale dimensions for all 25 lessons
 */
export const LESSON_ECHELLE_WORDINGS: Record<string, string[]> = {
  present: [
    'Quelques verbes à l’indicatif présent',
    'Une variété de verbes à l’indicatif présent',
  ],
  passeRecent: [
    'L’expression d’une action récente ou en cours',
  ],
  passeCompose: [
    'Quelques verbes au passé composé',
    'Une variété de verbes au passé composé',
  ],
  imparfait: [
    'Des verbes à l’imparfait',
    'L’emploi conjoint du passé composé et de l’imparfait',
  ],
  plusQueParfait: [
    'Des verbes au plus-que-parfait',
  ],
  passeSimple: [
    'Quelques verbes au passé simple',
    'Une variété de verbes au passé simple',
  ],
  futurProche: [
    'Des verbes au futur proche',
  ],
  futurSimple: [
    'Quelques verbes au futur simple',
    'Une variété de verbes au futur simple',
  ],
  futurAnterieur: [
    'Des verbes au futur antérieur',
  ],
  conditionnelPresent: [
    'Quelques verbes au conditionnel présent comme forme de politesse',
    'Une variété de verbes au conditionnel présent',
  ],
  conditionnelPasse: [
    'Quelques verbes au conditionnel passé',
    'Une variété de verbes au conditionnel passé',
  ],
  subjonctifPresent: [
    'Quelques verbes au subjonctif présent',
    'Une variété de verbes au subjonctif présent',
  ],
  subjonctifPasse: [
    'Quelques verbes au subjonctif passé',
    'Des verbes au subjonctif passé',
  ],
  imperatif: [
    'Quelques verbes à l’impératif présent',
    'Une variété de verbes à l’impératif présent',
  ],
  gerondif: [
    'Quelques verbes au gérondif',
    'Des verbes au gérondif',
  ],
  'passeCompose-vs-imparfait': [
    'L’emploi conjoint du passé composé et de l’imparfait',
    'Les temps de verbe et une variété de connecteurs temporels pour marquer la chronologie des actions par rapport au présent',
  ],
  'imparfait-vs-plus-que-parfait': [
    'Des verbes au plus-que-parfait',
    'Des verbes à l’imparfait',
  ],
  'futurProche-vs-futurSimple-vs-present': [
    'Des verbes au futur proche',
    'Quelques verbes au futur simple',
    'Une variété de verbes au futur simple',
  ],
  'actionRecente-progressif-futurProche': [
    'L’expression d’une action récente ou en cours',
    'Des verbes au futur proche',
  ],
  'phrases-avec-si': [
    'La condition introduite par si',
    'Des hypothèses réalistes sur un fait présent ou futur avec si',
    'Des hypothèses irréelles sur un fait présent ou futur avec si',
    'Des hypothèses irréelles au passé avec si',
  ],
  'indicatif-vs-subjonctif': [
    'Les règles d’emploi du mode indicatif ou subjonctif',
    'Quelques verbes au subjonctif présent',
  ],
  'choix-auxiliaire-accord-pp': [
    'Les règles d’accord des participes passés',
    'Une variété de verbes au passé composé',
  ],
  'concordance-discours-indirect': [
    'Le discours indirect',
    'Les règles de concordance des temps',
    'Les modes et les temps verbaux pour assurer la cohérence temporelle',
  ],
  'voix-passive': [
    'La forme passive',
    'Les règles d’accord des participes passés',
  ],
  'ligne-du-temps': [
    'Les temps de verbe et une variété de connecteurs temporels pour marquer la chronologie des actions par rapport au présent',
    'Les temps de verbe et une variété de connecteurs temporels pour marquer la chronologie des actions par rapport au passé, au présent, au futur',
    'Les modes et les temps verbaux pour assurer la cohérence temporelle',
  ],
}

/**
 * Enriches a lesson with computed echelleNiveau and echelleSources from official scale wordings
 */
export function enrichLessonWithScale(lesson: TenseLesson): TenseLesson {
  const wordings = LESSON_ECHELLE_WORDINGS[lesson.id]
  if (!wordings || wordings.length === 0) return lesson
  const { echelleNiveau, echelleSources } = computeEchelleScaleInfo(wordings)
  return {
    ...lesson,
    echelleNiveau,
    echelleSources,
  }
}
