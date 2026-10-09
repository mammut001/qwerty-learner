import { ECHELLE_LEVELS } from './echelleQuebecoiseData'

export type EchelleSkill = 'listening' | 'reading' | 'writing' | 'speaking'

export type EchelleDiscourseType =
  | 'informatif'
  | 'descriptif'
  | 'narratif'
  | 'explicatif'
  | 'injonctif'
  | 'argumentatif'
  | 'expressif'
  | 'resume'

export type EchelleIndicator = {
  fr: string
  zh: string
  examples: string[]
  typeDeDiscours?: EchelleDiscourseType
}

export type EchelleLevel = {
  level: number
  type: string
  descriptionFr: string
  descriptionZh: string
  context: string[]
  sujets?: string
  contenu?: string[]
  etendue?: string
  composantesLinguistiques?: string
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

export const DISCOURSE_TYPE_META: Record<EchelleDiscourseType, { fr: string; zh: string; badgeClass: string; descriptionZh: string }> = {
  informatif: {
    fr: 'Informatif',
    zh: '信息类',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-600/20',
    descriptionZh: '提供或获取事实、数据与客观情况',
  },
  descriptif: {
    fr: 'Descriptif',
    zh: '描述类',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-600/20',
    descriptionZh: '描绘人物、物体、地点、场景或状态细节',
  },
  narratif: {
    fr: 'Narratif',
    zh: '叙述类',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ring-1 ring-purple-600/20',
    descriptionZh: '叙述经历、故事、事件历程或文化作品情节',
  },
  explicatif: {
    fr: 'Explicatif',
    zh: '解释类',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-600/20',
    descriptionZh: '说明原因、运作机制、分析利弊或阐释观点',
  },
  injonctif: {
    fr: 'Injonctif',
    zh: '指令类',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-600/20',
    descriptionZh: '传达或遵循指示、规章、步骤、建议与禁令',
  },
  argumentatif: {
    fr: 'Argumentatif',
    zh: '论证类',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-1 ring-indigo-600/20',
    descriptionZh: '阐明立场、辨析事实与观点、辩论或维护论点',
  },
  expressif: {
    fr: 'Expressif',
    zh: '表达交际类',
    badgeClass: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 ring-1 ring-pink-600/20',
    descriptionZh: '人际交往寒暄、表达情感、态度、评价与愿望',
  },
  resume: {
    fr: 'Résumé',
    zh: '概括类',
    badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 ring-1 ring-teal-600/20',
    descriptionZh: '提炼概括核心要点、综述多源信息',
  },
}

export type EchelleAcquisitionStage = 'emerging' | 'proficient' | 'standard'

export const ACQUISITION_STAGE_META: Record<
  EchelleAcquisitionStage,
  { labelFr: string; labelZh: string; badgeClass: string; descriptionZh: string }
> = {
  emerging: {
    labelFr: 'Quelques',
    labelZh: '初学萌芽',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    descriptionZh: '开始认识或尝试使用该语言点',
  },
  proficient: {
    labelFr: 'Une variété de',
    labelZh: '多样熟练',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    descriptionZh: '能在多种不同语境中准确自如运用',
  },
  standard: {
    labelFr: 'Maitrise',
    labelZh: '巩固掌握',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    descriptionZh: '已建立自主稳定的语言规范与掌控力',
  },
}

export type ParsedDimensionItem = {
  raw: string
  cleanText: string
  stage: EchelleAcquisitionStage
  stageLabelZh: string
  stageBadgeClass: string
}

export function parseDimensionItem(raw: string): ParsedDimensionItem {
  const trimmed = raw.trim()
  if (/^Quelques\s+/i.test(trimmed)) {
    const clean = trimmed.replace(/^Quelques\s+/i, '')
    return {
      raw: trimmed,
      cleanText: clean.charAt(0).toUpperCase() + clean.slice(1),
      stage: 'emerging',
      stageLabelZh: ACQUISITION_STAGE_META.emerging.labelZh,
      stageBadgeClass: ACQUISITION_STAGE_META.emerging.badgeClass,
    }
  }
  if (/^Une variété de\s+/i.test(trimmed)) {
    const clean = trimmed.replace(/^Une variété de\s+/i, '')
    return {
      raw: trimmed,
      cleanText: clean.charAt(0).toUpperCase() + clean.slice(1),
      stage: 'proficient',
      stageLabelZh: ACQUISITION_STAGE_META.proficient.labelZh,
      stageBadgeClass: ACQUISITION_STAGE_META.proficient.badgeClass,
    }
  }
  return {
    raw: trimmed,
    cleanText: trimmed,
    stage: 'standard',
    stageLabelZh: ACQUISITION_STAGE_META.standard.labelZh,
    stageBadgeClass: ACQUISITION_STAGE_META.standard.badgeClass,
  }
}

export const SUJETS_ZH: Record<string, string> = {
  'Liés à l’environnement immédiat': '与身边直接环境相关',
  'Liés à la vie quotidienne': '与日常生活相关',
  Courants: '日常常见话题',
  'D’intérêt général ou spécifiques': '普遍关注或特定议题',
  'Liés à son domaine d’expertise ou à ses champs d’intérêt': '自身专长或兴趣领域',
  Diversifiés: '多元广泛领域',
  'À la croisée de différents domaines': '跨学科与多领域交叉议题',
}

export const CONTENU_ZH: Record<string, string> = {
  Factuel: '事实性',
  Explicite: '直接明示',
  Concret: '具体具象',
  'Parfois implicite': '含部分言外之意',
  Implicite: '含蓄隐性推断',
  'Parfois abstrait': '涉及抽象概念',
  Abstrait: '抽象深层内涵',
  'Organisé de manière linéaire': '线性时序组织',
  'Organisé de manière parfois non linéaire': '非线性分层组织',
  'Organisé de manière non linéaire': '复杂非线性组织',
  'Organisé de manière à assurer la cohérence du message': '注重篇章连贯衔接',
  'Organisé de manière à assurer l’efficacité et la cohérence du message': '兼顾高效沟通与严谨篇章连贯',
}

export const ETENDUE_ZH: Record<string, string> = {
  'Quelques mots-clés ou expressions courantes': '若干关键词或常用固定表达',
  'Mots isolés ou expressions courantes mémorisées': '孤立词汇或记忆的常用句',
  'Expressions courantes mémorisées': '记忆的常用日常表达',
  'Propos très brefs': '极简短陈述',
  'Propos brefs': '简短陈述',
  'Quelques phrases brèves': '若干简短句子',
  'Conversations brèves': '简短对话交流',
  'Textes d’un paragraphe': '1段文字',
  'Textes de quelques lignes': '数行简短文本',
  'Textes de deux ou trois paragraphes': '2至3段文章',
  Conversations: '日常对话',
  'Conversations et courtes présentations': '对话与短陈述',
  'Conversations et productions culturelles': '对话与文化类内容',
  'Textes de quelques paragraphes': '数段篇幅文章',
  'Textes d’une à deux pages': '1至2页文本',
  'Textes d’une ou deux pages': '1至2页文本',
  'Textes de plusieurs pages': '数页长篇文本',
  'Conversations, productions culturelles et présentations': '对话、文化作品与专题演讲',
  'Conversations et présentations': '深入对话与专题展示',
  'Publications variées': '各类出版物与文献',
  'Échanges et exposés': '深入研讨与专题陈述',
}

export const DIMENSION_LABELS: Record<keyof EchelleLevel['dimensions'], { fr: string; zh: string }> = {
  lexique: { fr: 'Lexique', zh: '词汇主题' },
  phrase: { fr: 'Grammaire de la phrase', zh: '句子语法' },
  texte: { fr: 'Grammaire du texte', zh: '篇章语法' },
}

export const ECHELLE_PROGRESSION_MARKERS = [
  { fr: 'Quelques', zh: '开始认识或尝试使用该语言点（初学萌芽）' },
  { fr: 'Une variété de', zh: '能在多种不同语境中准确自如运用（多样熟练）' },
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
