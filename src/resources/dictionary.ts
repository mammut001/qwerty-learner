import type { Dictionary, DictionaryResource } from '@/typings/index'
import { calcChapterCount } from '@/utils'

const frenchDictionaries: DictionaryResource[] = [
  {
    id: 'tcf-canada-foundation-01',
    name: 'TCF Canada 基础核心词 01',
    description: 'TCF Canada 法语基础高频词：核心动词、时间、连接词与日常主题词汇',
    category: 'TCF Canada',
    tags: ['基础', 'A1-A2'],
    url: '/dicts/TCF_Canada_Foundation_01.json',
    length: 102,
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
