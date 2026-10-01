import type { Dictionary, DictionaryResource } from '@/typings/index'
import { calcChapterCount } from '@/utils'

const frenchDictionaries: DictionaryResource[] = [
  {
    id: 'tcf-canada-foundation-01',
    name: 'TCF Canada 基础核心词 01',
    description: '核心动词、时间、连接词与基础日常词汇',
    category: 'TCF Canada',
    tags: ['A1-A2', '基础'],
    url: '/dicts/TCF_Canada_Foundation_01.json',
    length: 102,
    language: 'fr',
    languageCategory: 'fr',
  },
  {
    id: 'tcf-canada-daily-life',
    name: 'TCF Canada 日常生活',
    description: '住房、购物、饮食、交通、旅行与健康高频词',
    category: 'TCF Canada',
    tags: ['A2-B1', '日常生活'],
    url: '/dicts/TCF_Canada_Daily_Life.json',
    length: 80,
    language: 'fr',
    languageCategory: 'fr',
  },
  {
    id: 'tcf-canada-work-study-admin',
    name: 'TCF Canada 工作·学习·行政',
    description: '工作、学校、表格、银行、移民与行政手续高频词',
    category: 'TCF Canada',
    tags: ['A2-B1', '工作行政'],
    url: '/dicts/TCF_Canada_Work_Study_Admin.json',
    length: 76,
    language: 'fr',
    languageCategory: 'fr',
  },
  {
    id: 'tcf-canada-b1-connectors',
    name: 'TCF Canada B1 连接词',
    description: '口语与写作最常用的原因、结果、转折、条件与结构连接词',
    category: 'TCF Canada',
    tags: ['B1', '连接词'],
    url: '/dicts/TCF_Canada_B1_Connectors.json',
    length: 64,
    language: 'fr',
    languageCategory: 'fr',
  },
  {
    id: 'tcf-canada-b2-opinion',
    name: 'TCF Canada B2 观点表达',
    description: '论证、社会议题、抽象动词与 B2 高频表达',
    category: 'TCF Canada',
    tags: ['B2', '观点论证'],
    url: '/dicts/TCF_Canada_B2_Opinion.json',
    length: 72,
    language: 'fr',
    languageCategory: 'fr',
  },
  {
    id: 'tcf-canada-oral-writing',
    name: 'TCF Canada 口语·写作表达',
    description: '任务型口语、礼貌请求、表达观点与写作邮件常用句块',
    category: 'TCF Canada',
    tags: ['B1-B2', '口语写作'],
    url: '/dicts/TCF_Canada_Oral_Writing.json',
    length: 64,
    language: 'fr',
    languageCategory: 'fr',
  },
]

export const dictionaryResources: DictionaryResource[] = [...frenchDictionaries]

export const dictionaries: Dictionary[] = dictionaryResources.map((resource) => ({
  ...resource,
  chapterCount: calcChapterCount(resource.length),
}))

export const idDictionaryMap: Record<string, Dictionary> = Object.fromEntries(dictionaries.map((dict) => [dict.id, dict]))
