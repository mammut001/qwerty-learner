import type { TenseLesson, TenseCategory } from '../types'
import { presentLesson } from './present'
import { passeComposeLesson } from './passeCompose'
import { imparfaitLesson } from './imparfait'
import { plusQueParfaitLesson } from './plusQueParfait'
import { futurProcheLesson } from './futurProche'
import { futurSimpleLesson } from './futurSimple'
import { futurAnterieurLesson } from './futurAnterieur'
import { passeRecentLesson } from './passeRecent'
import { conditionnelPresentLesson } from './conditionnelPresent'
import { conditionnelPasseLesson } from './conditionnelPasse'
import { subjonctifPresentLesson } from './subjonctifPresent'
import { subjonctifPasseLesson } from './subjonctifPasse'
import { imperatifLesson } from './imperatif'
import { passeSimpleLesson } from './passeSimple'
import { gerondifLesson } from './gerondif'
import {
  pcVsImparfaitLesson,
  impVsPqpLesson,
  troisFutursLesson,
  actionsImmediatesLesson,
  phrasesAvecSiLesson,
} from './crossCutting1'
import {
  indicatifVsSubjonctifLesson,
  auxiliaireEtAccordLesson,
  concordanceDiscoursLesson,
  voixPassiveLesson,
  ligneDuTempsLesson,
} from './crossCutting2'

export {
  presentLesson,
  passeComposeLesson,
  imparfaitLesson,
  plusQueParfaitLesson,
  futurProcheLesson,
  futurSimpleLesson,
  futurAnterieurLesson,
  passeRecentLesson,
  conditionnelPresentLesson,
  conditionnelPasseLesson,
  subjonctifPresentLesson,
  subjonctifPasseLesson,
  imperatifLesson,
  passeSimpleLesson,
  gerondifLesson,
  pcVsImparfaitLesson,
  impVsPqpLesson,
  troisFutursLesson,
  actionsImmediatesLesson,
  phrasesAvecSiLesson,
  indicatifVsSubjonctifLesson,
  auxiliaireEtAccordLesson,
  concordanceDiscoursLesson,
  voixPassiveLesson,
  ligneDuTempsLesson,
}

export const singleTenseLessons: TenseLesson[] = [
  presentLesson,
  passeRecentLesson,
  passeComposeLesson,
  imparfaitLesson,
  plusQueParfaitLesson,
  passeSimpleLesson,
  futurProcheLesson,
  futurSimpleLesson,
  futurAnterieurLesson,
  conditionnelPresentLesson,
  conditionnelPasseLesson,
  subjonctifPresentLesson,
  subjonctifPasseLesson,
  imperatifLesson,
  gerondifLesson,
]

export const crossCuttingLessons: TenseLesson[] = [
  pcVsImparfaitLesson,
  impVsPqpLesson,
  troisFutursLesson,
  actionsImmediatesLesson,
  phrasesAvecSiLesson,
  indicatifVsSubjonctifLesson,
  auxiliaireEtAccordLesson,
  concordanceDiscoursLesson,
  voixPassiveLesson,
  ligneDuTempsLesson,
]

export const allTenseLessons: TenseLesson[] = [
  ...singleTenseLessons,
  ...crossCuttingLessons,
]

export const lessonMap: Record<string, TenseLesson> = allTenseLessons.reduce(
  (acc, lesson) => {
    acc[lesson.id] = lesson
    return acc
  },
  {} as Record<string, TenseLesson>,
)

export function getLessonById(id: string): TenseLesson | undefined {
  return lessonMap[id]
}

export interface LessonGroup {
  category: TenseCategory
  labelFr: string
  labelZh: string
  descriptionZh: string
  lessons: TenseLesson[]
}

export const lessonGroups: LessonGroup[] = [
  {
    category: 'indicatif',
    labelFr: 'Indicatif',
    labelZh: '直陈式 (事实与客观世界)',
    descriptionZh: '法语中最核心的语式，用于叙述真实发生、正在进行或预计发生的动作。',
    lessons: [
      presentLesson,
      passeRecentLesson,
      passeComposeLesson,
      imparfaitLesson,
      plusQueParfaitLesson,
      passeSimpleLesson,
      futurProcheLesson,
      futurSimpleLesson,
      futurAnterieurLesson,
    ],
  },
  {
    category: 'conditionnel',
    labelFr: 'Conditionnel',
    labelZh: '条件式 (礼貌、假设与虚拟)',
    descriptionZh: '表达委婉请求、假设结果、推测与未实现遗憾的核心语式。',
    lessons: [conditionnelPresentLesson, conditionnelPasseLesson],
  },
  {
    category: 'subjonctif',
    labelFr: 'Subjonctif',
    labelZh: '虚拟式 (主观情绪、愿望与必然)',
    descriptionZh: '表达愿望、情感、怀疑、必要性等主观态度的从句语式，B1/B2 关键得分点。',
    lessons: [subjonctifPresentLesson, subjonctifPasseLesson],
  },
  {
    category: 'imperatif',
    labelFr: 'Impératif',
    labelZh: '命令式 (指令、建议与劝告)',
    descriptionZh: '省略主语人称代词，用于直接给出指令、提出建议、指示路线或警告。',
    lessons: [imperatifLesson],
  },
  {
    category: 'non-finite',
    labelFr: 'Formes non conjuguées',
    labelZh: '副动词与非人称形式',
    descriptionZh: 'en + 现在分词，表达时间伴随、方式手段与因果条件。',
    lessons: [gerondifLesson],
  },
  {
    category: 'cross-cutting',
    labelFr: 'Comparaisons & Synthèses',
    labelZh: '横向对比与综合专题',
    descriptionZh: '时态辨析、条件句 si 系统、主从句时态配合与时间轴全景。',
    lessons: crossCuttingLessons,
  },
]
