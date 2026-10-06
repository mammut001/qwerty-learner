import type { DictionaryResult } from './dictionary'

let converterPromise: Promise<(text: string) => string> | null = null

async function getConverter(): Promise<(text: string) => string> {
  if (!converterPromise) {
    converterPromise = import('opencc-js/t2cn').then((OpenCC) => OpenCC.Converter({ from: 'tw', to: 'cn' }))
  }
  return converterPromise
}

function findFrenchH2(doc: Document): HTMLHeadingElement | null {
  const headings = Array.from(doc.querySelectorAll('h2'))
  for (let i = 0; i < headings.length; i += 1) {
    const h2 = headings[i]
    if (h2.id === '法语' || h2.id === '法語') return h2
    const spans = Array.from(h2.querySelectorAll('span'))
    for (let j = 0; j < spans.length; j += 1) {
      const id = spans[j].id
      if (id === '法语' || id === '法語') return h2
    }
  }
  return null
}

function getHeadingWrapper(h2: HTMLHeadingElement, doc: Document): Element {
  const mwWrapper = h2.closest('.mw-heading')
  if (mwWrapper && mwWrapper.parentElement) return mwWrapper
  const parent = h2.parentElement
  if (parent && parent !== doc.body && parent.tagName.toLowerCase() === 'div' && !parent.classList.contains('mw-parser-output')) {
    return parent
  }
  return h2
}

export async function fetchOnlineChinese(word: string): Promise<string[]> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 8000)

  let data: unknown
  try {
    const url = `https://zh.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(
      word,
    )}&prop=text&format=json&formatversion=2&origin=*&redirects=1`
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`网络请求失败（${response.status}）`)
    }
    data = await response.json()
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('网络请求异常')
  } finally {
    window.clearTimeout(timer)
  }

  if (!data || typeof data !== 'object') {
    throw new Error('返回数据格式异常')
  }

  const record = data as Record<string, unknown>
  if (record.error && typeof record.error === 'object') {
    const errObj = record.error as Record<string, unknown>
    if (errObj.code === 'missingtitle') {
      return []
    }
    throw new Error(`维基词典接口错误（${String(errObj.code ?? 'unknown')}）`)
  }

  if (!record.parse || typeof record.parse !== 'object') {
    throw new Error('返回数据缺少 parse 字段')
  }

  const parseObj = record.parse as Record<string, unknown>
  if (typeof parseObj.text !== 'string') {
    throw new Error('返回数据缺少 parse.text 字段')
  }

  const doc = new DOMParser().parseFromString(parseObj.text, 'text/html')
  const frenchH2 = findFrenchH2(doc)
  if (!frenchH2) return []

  const headingWrapper = getHeadingWrapper(frenchH2, doc)
  const sectionElements: Element[] = []
  let curr = headingWrapper.nextElementSibling
  while (curr) {
    if (curr.tagName.toLowerCase() === 'h2' || curr.querySelector('h2')) {
      break
    }
    sectionElements.push(curr)
    curr = curr.nextElementSibling
  }

  const listItems: HTMLLIElement[] = []
  for (let i = 0; i < sectionElements.length; i += 1) {
    const el = sectionElements[i]
    if (el.tagName.toLowerCase() === 'ol') {
      const children = Array.from(el.children)
      for (let j = 0; j < children.length; j += 1) {
        if (children[j].tagName.toLowerCase() === 'li') {
          listItems.push(children[j] as HTMLLIElement)
        }
      }
    } else {
      const nestedOls = Array.from(el.querySelectorAll('ol'))
      for (let k = 0; k < nestedOls.length; k += 1) {
        const ol = nestedOls[k]
        if (!ol.parentElement?.closest('ol')) {
          const children = Array.from(ol.children)
          for (let j = 0; j < children.length; j += 1) {
            if (children[j].tagName.toLowerCase() === 'li') {
              listItems.push(children[j] as HTMLLIElement)
            }
          }
        }
      }
    }
  }

  if (listItems.length === 0) return []

  const converter = await getConverter()
  const definitions: string[] = []
  const seen = new Set<string>()

  for (let i = 0; i < listItems.length; i += 1) {
    const li = listItems[i]
    const clone = li.cloneNode(true) as HTMLLIElement
    const nested = Array.from(clone.querySelectorAll('dl, ul, ol'))
    nested.forEach((node) => node.remove())

    const raw = (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (!raw) continue

    const converted = converter(raw).slice(0, 120).trim()
    if (!converted || seen.has(converted)) continue

    seen.add(converted)
    definitions.push(converted)
    if (definitions.length >= 6) break
  }

  return definitions
}

const CACHE_KEY = 'qwerty-fr-dictionary-online-v1'
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 400

type CacheRecord = Record<string, { zh: string[]; at: number }>

function readCache(): CacheRecord {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as CacheRecord
    }
  } catch {
    // localStorage unavailable
  }
  return {}
}

function writeCache(data: CacheRecord) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage write error
  }
}

function getCached(word: string): string[] | null {
  const cache = readCache()
  const entry = cache[word]
  if (!entry) return null
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    return null
  }
  return entry.zh
}

function setCached(word: string, zh: string[]) {
  const cache = readCache()
  cache[word] = { zh, at: Date.now() }

  const keys = Object.keys(cache)
  if (keys.length > MAX_CACHE_ENTRIES) {
    keys.sort((a, b) => (cache[a]?.at ?? 0) - (cache[b]?.at ?? 0))
    const removeCount = keys.length - MAX_CACHE_ENTRIES
    for (let i = 0; i < removeCount; i += 1) {
      delete cache[keys[i]]
    }
  }
  writeCache(cache)
}

const inflight = new Map<string, Promise<string[]>>()

export async function loadOnlineChinese(word: string): Promise<string[]> {
  const normalized = word.trim()
  if (!normalized) return []

  const cached = getCached(normalized)
  if (cached !== null) return cached

  const pending = inflight.get(normalized)
  if (pending) return pending

  const request = fetchOnlineChinese(normalized)
    .then((result) => {
      setCached(normalized, result)
      inflight.delete(normalized)
      return result
    })
    .catch((error: unknown) => {
      inflight.delete(normalized)
      throw error
    })

  inflight.set(normalized, request)
  return request
}

export function needsOnlineChinese(result: DictionaryResult): string | null {
  const primary = result.words[0] ?? result.lemmas[0]
  if (!primary) {
    const q = result.query.trim()
    if (q.length >= 2 && !/\s/.test(q)) {
      return q
    }
    return null
  }
  const hasSite = primary.site.length > 0
  const hasZh = primary.entries.some((entry) => entry.zh.length > 0)
  if (!hasSite && !hasZh) {
    return primary.word
  }
  return null
}
