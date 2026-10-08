import { ECHELLE_LEVELS } from './echelleQuebecoiseData'

export type EchelleSkill = 'listening' | 'reading' | 'writing' | 'speaking'

export type EchelleIndicator = {
  fr: string
  zh: string
  examples: string[]
}

export type EchelleLevel = {
  level: number
  type: string
  descriptionFr: string
  descriptionZh: string
  context: string[]
  indicators: EchelleIndicator[]
  dimensions: { lexique: string[]; phrase: string[]; texte: string[] }
}

export type EchelleStage = { id: 'debutant' | 'intermediaire' | 'avance'; labelFr: string; labelZh: string; levels: [number, number] }

export const ECHELLE_SOURCE = {
  title: 'Échelle québécoise des niveaux de compétence en français',
  publisher: 'Ministère de la Langue française · Gouvernement du Québec',
  edition: '2023',
}

export const ECHELLE_TARGET_LEVEL = 7
export const ECHELLE_MAX_LEVEL = 12

export const ECHELLE_STAGES: EchelleStage[] = [
  { id: 'debutant', labelFr: 'Débutant', labelZh: '初级', levels: [1, 4] },
  { id: 'intermediaire', labelFr: 'Intermédiaire', labelZh: '中级', levels: [5, 8] },
  { id: 'avance', labelFr: 'Avancé', labelZh: '高级', levels: [9, 12] },
]

export const ECHELLE_SKILLS: { skill: EchelleSkill; code: string; labelFr: string; labelZh: string }[] = [
  { skill: 'listening', code: 'CO', labelFr: 'Compréhension orale', labelZh: '听力理解' },
  { skill: 'reading', code: 'CE', labelFr: 'Compréhension écrite', labelZh: '阅读理解' },
  { skill: 'writing', code: 'EE', labelFr: 'Production écrite', labelZh: '书面表达' },
  { skill: 'speaking', code: 'EO', labelFr: 'Production orale', labelZh: '口语表达' },
]

export const COMMUNICATION_TYPES: Record<string, { zh: string; definition: string }> = {
  Minimale: { zh: '最低限度', definition: '能理解或说出与个人信息相关的单词或表达。' },
  Élémentaire: { zh: '基础', definition: '能理解或表达满足日常需求的基本内容。' },
  Fonctionnelle: { zh: '功能性', definition: '能理解或表达足以在社会中正常生活、满足日常需求的信息。' },
  Interactive: { zh: '互动', definition: '能积极参与，在理解或表达中主动推进交流。' },
  Autonome: { zh: '自主', definition: '无需他人帮助即可理解或表达信息。' },
  Aisée: { zh: '流畅', definition: '在大多数情境中都能轻松、流畅地使用语言。' },
  Nuancée: { zh: '细腻', definition: '能有效使用语言来理解或表达细微差别。' },
}

export const CONTEXT_ZH: Record<string, string> = {
  Prévisible: '可预期',
  'Partiellement prévisible': '部分可预期',
  'Non prévisible': '不可预期',
  'Non exigeant': '要求不高',
  'Peu exigeant': '要求较低',
  'Parfois exigeant': '有时要求较高',
  Exigeant: '要求高',
  'Généralement informel': '多为非正式',
  'Parfois formel': '有时正式',
  Formel: '正式',
  'Facilité par des indices visuels': '有图片等视觉提示辅助',
  'Facilité par la situation en face à face, par des indices visuels ou par l’aide constante d’une personne interlocutrice':
    '面对面、有视觉提示或对方持续帮助',
  'Facilité par la situation en face à face, par des indices visuels ou par l’aide fréquente d’une personne interlocutrice':
    '面对面、有视觉提示或对方经常帮助',
  'Facilité parfois par des indices visuels ou par l’aide occasionnelle d’une personne interlocutrice': '偶尔借助视觉提示或对方帮助',
  'Facilité par l’aide ponctuelle d’une personne interlocutrice': '对方偶尔帮忙即可',
}

export const PHONOLOGY_DEGREES = [
  {
    labelFr: 'Maitrise partielle',
    labelZh: '部分掌握',
    descriptionZh: '部分掌握法语音系；母语或其他语言的干扰可能影响对方听懂。',
  },
  {
    labelFr: 'Maitrise suffisante',
    labelZh: '足够掌握',
    descriptionZh: '大体掌握法语音系；其他语言的干扰对可懂度影响不大。',
  },
  {
    labelFr: 'Maitrise assurée',
    labelZh: '稳定掌握',
    descriptionZh: '掌握法语音系；口音不影响可懂度——量表不要求像母语者，只要求清晰可懂。',
  },
]

export const DIMENSION_LABELS: Record<keyof EchelleLevel['dimensions'], { fr: string; zh: string }> = {
  lexique: { fr: 'Lexique', zh: '词汇主题' },
  phrase: { fr: 'Grammaire de la phrase', zh: '句子语法' },
  texte: { fr: 'Grammaire du texte', zh: '篇章语法' },
}

export const ECHELLE_PROGRESSION_MARKERS = [
  { fr: 'Quelques', zh: '开始认识或使用该语言点' },
  { fr: 'Une variété de', zh: '能在多种语境中恰当使用' },
]

// The placement test reports CEFR bands; these are the matching NCLC estimates already shown to learners.
export const CEFR_TO_ECHELLE: Record<string, number> = { A1: 4, A2: 5, B1: 6, B2: 7, 'B2+': 8 }

// 26-week roadmap phases (see studyPlan.ts) and the Échelle level each phase builds towards.
export const PHASE_ECHELLE_TARGET: Record<number, number> = { 1: 5, 2: 6, 3: 7, 4: 7, 5: 7, 6: 8 }

export function getEchelleLevel(skill: EchelleSkill, level: number): EchelleLevel {
  const clamped = Math.max(1, Math.min(ECHELLE_MAX_LEVEL, Math.round(level)))
  return ECHELLE_LEVELS[skill][clamped - 1]
}

export function getEchelleStage(level: number): EchelleStage {
  return ECHELLE_STAGES.find((stage) => level >= stage.levels[0] && level <= stage.levels[1]) ?? ECHELLE_STAGES[0]
}

// TCF estimates report 0 for anything below NCLC 4, so the next useful goal starts at level 4.
export function nextEchelleLevel(current: number | null | undefined): number {
  if (current == null || current < 4) return 4
  return Math.min(ECHELLE_MAX_LEVEL, current + 1)
}

export function isEchelleSkill(value: string | null | undefined): value is EchelleSkill {
  return value === 'listening' || value === 'reading' || value === 'writing' || value === 'speaking'
}

export { ECHELLE_LEVELS }
