import type { TenseCategory, TenseLesson } from '../types'
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
  actionsImmediatesLesson,
  impVsPqpLesson,
  pcVsImparfaitLesson,
  phrasesAvecSiLesson,
  troisFutursLesson,
} from './crossCutting1'
import {
  auxiliaireEtAccordLesson,
  concordanceDiscoursLesson,
  indicatifVsSubjonctifLesson,
  ligneDuTempsLesson,
  voixPassiveLesson,
} from './crossCutting2'

import { enrichLessonWithScale } from '../echelleScale'

const _presentLesson = enrichLessonWithScale(presentLesson)
const _passeComposeLesson = enrichLessonWithScale(passeComposeLesson)
const _imparfaitLesson = enrichLessonWithScale(imparfaitLesson)
const _plusQueParfaitLesson = enrichLessonWithScale(plusQueParfaitLesson)
const _futurProcheLesson = enrichLessonWithScale(futurProcheLesson)
const _futurSimpleLesson = enrichLessonWithScale(futurSimpleLesson)
const _futurAnterieurLesson = enrichLessonWithScale(futurAnterieurLesson)
const _passeRecentLesson = enrichLessonWithScale(passeRecentLesson)
const _conditionnelPresentLesson = enrichLessonWithScale(conditionnelPresentLesson)
const _conditionnelPasseLesson = enrichLessonWithScale(conditionnelPasseLesson)
const _subjonctifPresentLesson = enrichLessonWithScale(subjonctifPresentLesson)
const _subjonctifPasseLesson = enrichLessonWithScale(subjonctifPasseLesson)
const _imperatifLesson = enrichLessonWithScale(imperatifLesson)
const _passeSimpleLesson = enrichLessonWithScale(passeSimpleLesson)
const _gerondifLesson = enrichLessonWithScale(gerondifLesson)

const _pcVsImparfaitLesson = enrichLessonWithScale(pcVsImparfaitLesson)
const _impVsPqpLesson = enrichLessonWithScale(impVsPqpLesson)
const _troisFutursLesson = enrichLessonWithScale(troisFutursLesson)
const _actionsImmediatesLesson = enrichLessonWithScale(actionsImmediatesLesson)
const _phrasesAvecSiLesson = enrichLessonWithScale(phrasesAvecSiLesson)
const _indicatifVsSubjonctifLesson = enrichLessonWithScale(indicatifVsSubjonctifLesson)
const _auxiliaireEtAccordLesson = enrichLessonWithScale(auxiliaireEtAccordLesson)
const _concordanceDiscoursLesson = enrichLessonWithScale(concordanceDiscoursLesson)
const _voixPassiveLesson = enrichLessonWithScale(voixPassiveLesson)
const _ligneDuTempsLesson = enrichLessonWithScale(ligneDuTempsLesson)

export {
  _presentLesson as presentLesson,
  _passeComposeLesson as passeComposeLesson,
  _imparfaitLesson as imparfaitLesson,
  _plusQueParfaitLesson as plusQueParfaitLesson,
  _futurProcheLesson as futurProcheLesson,
  _futurSimpleLesson as futurSimpleLesson,
  _futurAnterieurLesson as futurAnterieurLesson,
  _passeRecentLesson as passeRecentLesson,
  _conditionnelPresentLesson as conditionnelPresentLesson,
  _conditionnelPasseLesson as conditionnelPasseLesson,
  _subjonctifPresentLesson as subjonctifPresentLesson,
  _subjonctifPasseLesson as subjonctifPasseLesson,
  _imperatifLesson as imperatifLesson,
  _passeSimpleLesson as passeSimpleLesson,
  _gerondifLesson as gerondifLesson,
  _pcVsImparfaitLesson as pcVsImparfaitLesson,
  _impVsPqpLesson as impVsPqpLesson,
  _troisFutursLesson as troisFutursLesson,
  _actionsImmediatesLesson as actionsImmediatesLesson,
  _phrasesAvecSiLesson as phrasesAvecSiLesson,
  _indicatifVsSubjonctifLesson as indicatifVsSubjonctifLesson,
  _auxiliaireEtAccordLesson as auxiliaireEtAccordLesson,
  _concordanceDiscoursLesson as concordanceDiscoursLesson,
  _voixPassiveLesson as voixPassiveLesson,
  _ligneDuTempsLesson as ligneDuTempsLesson,
}

export const singleTenseLessons: TenseLesson[] = [
  _presentLesson,
  _passeRecentLesson,
  _passeComposeLesson,
  _imparfaitLesson,
  _plusQueParfaitLesson,
  _passeSimpleLesson,
  _futurProcheLesson,
  _futurSimpleLesson,
  _futurAnterieurLesson,
  _conditionnelPresentLesson,
  _conditionnelPasseLesson,
  _subjonctifPresentLesson,
  _subjonctifPasseLesson,
  _imperatifLesson,
  _gerondifLesson,
]

export const crossCuttingLessons: TenseLesson[] = [
  _pcVsImparfaitLesson,
  _impVsPqpLesson,
  _troisFutursLesson,
  _actionsImmediatesLesson,
  _phrasesAvecSiLesson,
  _indicatifVsSubjonctifLesson,
  _auxiliaireEtAccordLesson,
  _concordanceDiscoursLesson,
  _voixPassiveLesson,
  _ligneDuTempsLesson,
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
      _presentLesson,
      _passeRecentLesson,
      _passeComposeLesson,
      _imparfaitLesson,
      _plusQueParfaitLesson,
      _passeSimpleLesson,
      _futurProcheLesson,
      _futurSimpleLesson,
      _futurAnterieurLesson,
    ],
  },
  {
    category: 'conditionnel',
    labelFr: 'Conditionnel',
    labelZh: '条件式 (礼貌、假设与虚拟)',
    descriptionZh: '表达委婉请求、假设结果、推测与未实现遗憾的核心语式。',
    lessons: [_conditionnelPresentLesson, _conditionnelPasseLesson],
  },
  {
    category: 'subjonctif',
    labelFr: 'Subjonctif',
    labelZh: '虚拟式 (主观情绪、愿望与必然)',
    descriptionZh: '表达愿望、情感、怀疑、必要性等主观态度的从句语式，B1/B2 关键得分点。',
    lessons: [_subjonctifPresentLesson, _subjonctifPasseLesson],
  },
  {
    category: 'imperatif',
    labelFr: 'Impératif',
    labelZh: '命令式 (指令、建议与劝告)',
    descriptionZh: '省略主语人称代词，用于直接给出指令、提出建议、指示路线或警告。',
    lessons: [_imperatifLesson],
  },
  {
    category: 'non-finite',
    labelFr: 'Formes non conjuguées',
    labelZh: '副动词与非人称形式',
    descriptionZh: 'en + 现在分词，表达时间伴随、方式手段与因果条件。',
    lessons: [_gerondifLesson],
  },
  {
    category: 'cross-cutting',
    labelFr: 'Comparaisons & Synthèses',
    labelZh: '横向对比与综合专题',
    descriptionZh: '时态辨析、条件句 si 系统、主从句时态配合与时间轴全景。',
    lessons: crossCuttingLessons,
  },
]
