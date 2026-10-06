import { CHAPTER_LENGTH } from '@/constants'
import { idDictionaryMap } from '@/resources/dictionary'
import type { Dictionary, Word } from '@/typings'
import { atom } from 'jotai'

export type CustomDictWord = { name: string; trans: string[] }

export type CustomDict = {
  id: string
  name: string
  description: string
  words: CustomDictWord[]
  createdAt: number
  updatedAt: number
}

export const CUSTOM_DICT_STORAGE_KEY = 'qwerty-fr-custom-dicts-v1'
export const CUSTOM_DICT_CATEGORY = '我的词表'
export const CUSTOM_DICT_URL_PREFIX = 'custom:'
export const CUSTOM_DICT_LIMITS = { lists: 50, words: 2000, name: 60, description: 120, word: 200, trans: 300 }

const isCustomDict = (value: unknown): value is CustomDict => {
  if (!value || typeof value !== 'object') return false
  const dict = value as Partial<CustomDict>
  return (
    typeof dict.id === 'string' &&
    dict.id.startsWith('custom-') &&
    typeof dict.name === 'string' &&
    Array.isArray(dict.words) &&
    dict.words.every((word) => word && typeof word.name === 'string' && Array.isArray(word.trans))
  )
}

export function readCustomDicts(): CustomDict[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CUSTOM_DICT_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isCustomDict) : []
  } catch {
    return []
  }
}

const baseCustomDictsAtom = atom<CustomDict[]>(readCustomDicts())

// Read synchronously at startup so a selected custom list is never mistaken for a missing dictionary on first render.
export const customDictsAtom = atom(
  (get) => get(baseCustomDictsAtom),
  (_get, set, next: CustomDict[]) => {
    window.localStorage.setItem(CUSTOM_DICT_STORAGE_KEY, JSON.stringify(next))
    set(baseCustomDictsAtom, next)
  },
)

export function customDictToDictionary(dict: CustomDict): Dictionary {
  return {
    id: dict.id,
    name: dict.name,
    description: dict.description || '自定义词表',
    category: CUSTOM_DICT_CATEGORY,
    tags: ['自定义'],
    // The version suffix changes the SWR cache key whenever the list is edited.
    url: `${CUSTOM_DICT_URL_PREFIX}${dict.id}?v=${dict.updatedAt}`,
    length: dict.words.length,
    language: 'fr',
    languageCategory: 'fr',
    chapterCount: Math.ceil(dict.words.length / CHAPTER_LENGTH),
  }
}

export const customDictionariesAtom = atom<Dictionary[]>((get) => get(customDictsAtom).map(customDictToDictionary))

export function findDictionary(id: string | null | undefined, customDictionaries: Dictionary[]): Dictionary | undefined {
  if (!id) return undefined
  return idDictionaryMap[id] ?? customDictionaries.find((dict) => dict.id === id)
}

export function loadCustomDictWords(url: string): Word[] {
  const id = url.slice(CUSTOM_DICT_URL_PREFIX.length).split('?')[0]
  const dict = readCustomDicts().find((item) => item.id === id)
  if (!dict) throw new Error('这个自定义词表已被删除，请重新选择词库。')
  return dict.words.map((word) => ({ name: word.name, trans: word.trans, usphone: '', ukphone: '' }))
}

const SEPARATORS = ['\t', '=', '：', ' : ', ' - ', '|']

export type ParsedWordList = { words: CustomDictWord[]; duplicates: number; tooLong: number; truncated: boolean }

/** One entry per line: `mot = 释义`. The meaning is optional; lines starting with # are comments. */
export function parseWordListText(text: string): ParsedWordList {
  const words: CustomDictWord[] = []
  const seen = new Set<string>()
  let duplicates = 0
  let tooLong = 0
  let truncated = false
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    let cut = -1
    let width = 0
    for (const separator of SEPARATORS) {
      const index = line.indexOf(separator)
      if (index > 0 && (cut === -1 || index < cut)) {
        cut = index
        width = separator.length
      }
    }
    const name = (cut === -1 ? line : line.slice(0, cut)).trim().replace(/\s+/g, ' ')
    const meaning = cut === -1 ? '' : line.slice(cut + width).trim()
    if (!name) continue
    if (name.length > CUSTOM_DICT_LIMITS.word || meaning.length > CUSTOM_DICT_LIMITS.trans) {
      tooLong += 1
      continue
    }
    if (seen.has(name)) {
      duplicates += 1
      continue
    }
    if (words.length >= CUSTOM_DICT_LIMITS.words) {
      truncated = true
      break
    }
    seen.add(name)
    words.push({ name, trans: meaning ? [meaning] : [] })
  }
  return { words, duplicates, tooLong, truncated }
}

export const wordListToText = (words: CustomDictWord[]) =>
  words.map((word) => (word.trans.length ? `${word.name} = ${word.trans.join('；')}` : word.name)).join('\n')

/** Turns an imported .json / .csv / .txt file into editor text. */
export function importedFileToText(filename: string, content: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) {
    const parsed: unknown = JSON.parse(content)
    const rows = Array.isArray(parsed) ? parsed : (parsed as { words?: unknown })?.words
    if (!Array.isArray(rows)) throw new Error('JSON 需要是 [{ "name": "mot", "trans": ["释义"] }] 这样的数组。')
    return wordListToText(
      rows
        .filter((row): row is { name: string; trans?: unknown } => Boolean(row) && typeof (row as { name?: unknown }).name === 'string')
        .map((row) => ({
          name: row.name,
          trans: Array.isArray(row.trans) ? row.trans.filter((item): item is string => typeof item === 'string') : [],
        })),
    )
  }
  if (lower.endsWith('.csv')) {
    return content
      .split(/\r?\n/)
      .map((line) => {
        const index = line.indexOf(',')
        return index === -1 ? line : `${line.slice(0, index).replace(/^"|"$/g, '')}\t${line.slice(index + 1).replace(/^"|"$/g, '')}`
      })
      .join('\n')
  }
  return content
}
