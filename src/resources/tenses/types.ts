export type TenseId =
  | 'present'
  | 'passeCompose'
  | 'imparfait'
  | 'plusQueParfait'
  | 'futurProche'
  | 'futurSimple'
  | 'futurAnterieur'
  | 'passeRecent'
  | 'conditionnelPresent'
  | 'conditionnelPasse'
  | 'subjonctifPresent'
  | 'subjonctifPasse'
  | 'imperatif'
  | 'passeSimple'
  | 'gerondif'

export type TenseCategory =
  | 'indicatif'
  | 'conditionnel'
  | 'subjonctif'
  | 'imperatif'
  | 'non-finite'
  | 'cross-cutting'

export type ConjugatedPersonForm = {
  person: string // '1s' | '2s' | '3s' | '1p' | '2p' | '3p' | 'tu' | 'nous' | 'vous' | 'impersonal' | 'gerondif'
  subject: string // 'je' | 'tu' | 'il / elle / on' | 'nous' | 'vous' | 'ils / elles' | 'il' | ''
  verb: string // e.g. 'parle', 'ai parlé'
  display: string // e.g. "je parle", "j'ai parlé", "lève-toi !", "qu'il vienne"
  answers: string[]
  agreementVariants?: {
    masculine?: string
    feminine?: string
    pluralMasc?: string
    pluralFem?: string
  }
}

export type ConjugationResult = {
  infinitive: string
  tense: TenseId
  tenseLabelFr: string
  tenseLabelZh: string
  forms: ConjugatedPersonForm[]
  participePresent: string
  participePasse: string
  auxiliary: 'avoir' | 'être' | 'avoir / être'
  isReflexive: boolean
  isImpersonal?: boolean
  notes?: string[]
}

export type LessonExample = {
  fr: string
  zh: string
  highlight: string
  noteZh?: string
}

export type LessonUsage = {
  id: string
  titleZh: string
  descriptionZh: string
  examples: LessonExample[]
}

export type SignalWord = {
  word: string
  meaningZh: string
  example: LessonExample
}

export type CommonMistake = {
  wrong: string
  right: string
  explanationZh: string
  noteZh?: string
}

export class UnsupportedVerbError extends Error {
  constructor(verb: string) {
    super(`Verbe non supporté : ${verb}`)
    this.name = 'UnsupportedVerbError'
  }
}

export type TenseQuestion = {
  id: string
  type: 'choice' | 'fill'
  prompt: string
  options?: string[]
  correctAnswer: string
  acceptedAnswers?: string[]
  explanationZh: string
}

export type EndingTableEntry = {
  label: string
  endings: string[]
}

export type IrregularStemEntry = {
  verb: string
  stem: string
  notes?: string
}

export type TenseLesson = {
  id: string
  titleFr: string
  titleZh: string
  category: TenseCategory
  cefrLevel: string
  echelleNiveau: number | number[]
  echelleSources?: string[]
  summaryZh: string
  timelinePosition: 'past' | 'present' | 'future' | 'hypothetical' | 'overview'
  formationSteps: string[]
  endingsTable?: EndingTableEntry[]
  irregularStems?: IrregularStemEntry[]
  pronunciationNotes?: string[]
  usages: LessonUsage[]
  signalWords: SignalWord[]
  commonMistakes: CommonMistake[]
  questions: TenseQuestion[]
  defaultVerb?: string
}

export type TensePracticeProgress = {
  lessonId: string
  completedQuestions: Record<string, { answered: string; correct: boolean; timestamp: number }>
  totalAttempts: number
  correctCount: number
}

export const TENSE_TYPES_VERSION = '1.0.0'
