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

export const normalizeCustomWordName = (name: string) => name.normalize('NFC').trim().replace(/\s+/g, ' ')

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
  const seen = new Map<string, number>()
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
    const name = normalizeCustomWordName(cut === -1 ? line : line.slice(0, cut))
    const meaning = cut === -1 ? '' : line.slice(cut + width).trim()
    if (!name) continue
    if (name.length > CUSTOM_DICT_LIMITS.word || meaning.length > CUSTOM_DICT_LIMITS.trans) {
      tooLong += 1
      continue
    }
    const existingIndex = seen.get(name)
    if (existingIndex !== undefined) {
      const existing = words[existingIndex]
      const lacksMeaning = existing.trans.every(
        (item) => normalizeCustomWordName(item).toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'),
      )
      if (meaning && lacksMeaning) existing.trans = [meaning]
      duplicates += 1
      continue
    }
    if (words.length >= CUSTOM_DICT_LIMITS.words) {
      truncated = true
      break
    }
    seen.set(name, words.length)
    words.push({ name, trans: meaning ? [meaning] : [] })
  }
  return { words, duplicates, tooLong, truncated }
}

const singleLine = (text: string) => text.replace(/\s+/g, ' ').trim()

export const wordListToText = (words: CustomDictWord[]) =>
  words
    .map((word) => {
      const name = normalizeCustomWordName(word.name)
      return word.trans.length ? `${name} = ${word.trans.map(singleLine).join('；')}` : name
    })
    .join('\n')

/** Read quoted CSV fields before flattening each definition to the editor's one-line format. */
function csvToText(content: string): string {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let closedQuote = false
  const source = content.replace(/^\uFEFF/, '')
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    if (quoted) {
      if (char !== '"') field += char
      else if (source[i + 1] === '"') {
        field += '"'
        i += 1
      } else {
        quoted = false
        closedQuote = true
      }
      continue
    }
    if (closedQuote && char !== ',' && char !== '\r' && char !== '\n') {
      if (/\s/.test(char)) continue
      throw new Error('CSV 引号后的内容格式不正确，请检查文件。')
    }
    if (char === ',') {
      row.push(field)
      field = ''
      closedQuote = false
    } else if (char === '\r' || char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      closedQuote = false
      if (char === '\r' && source[i + 1] === '\n') i += 1
    } else if (char === '"' && !field.trim()) {
      field = ''
      quoted = true
    } else field += char
  }
  if (quoted) throw new Error('CSV 引号未闭合，请检查文件。')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
    .map((cells) => {
      const [name, ...meanings] = cells.map((cell) => cell.replace(/\s+/g, ' ').trim())
      return meanings.length ? `${name}\t${meanings.join(',')}` : name
    })
    .join('\n')
}

/** Turns an imported .json / .csv / .txt file into editor text. */
export function importedFileToText(filename: string, content: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) {
    const parsed: unknown = JSON.parse(content.replace(/^\uFEFF/, ''))
    const rows = Array.isArray(parsed) ? parsed : (parsed as { words?: unknown })?.words
    if (!Array.isArray(rows)) throw new Error('JSON 需要是 [{ "name": "mot", "trans": ["释义"] }] 这样的数组。')
    return wordListToText(
      rows.map((row: unknown, index: number) => {
        if (!row || typeof row !== 'object' || !('name' in row) || typeof row.name !== 'string' || !row.name.trim()) {
          throw new Error(`JSON 第 ${index + 1} 个词条缺少有效的 name。`)
        }
        const trans = 'trans' in row ? row.trans : undefined
        if (trans === undefined || trans === null) return { name: row.name, trans: [] }
        if (typeof trans === 'string') return { name: row.name, trans: [trans] }
        if (!Array.isArray(trans) || trans.some((item) => typeof item !== 'string')) {
          throw new Error(`JSON 第 ${index + 1} 个词条的 trans 需要是字符串或字符串数组。`)
        }
        return { name: row.name, trans }
      }),
    )
  }
  if (lower.endsWith('.csv')) {
    return csvToText(content)
  }
  return content
}
