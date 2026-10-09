import type { DictionaryResult } from './dictionary'

export type YoudaoSense = { pos: string; gloss: string }
export type YoudaoExample = { fr: string; zh: string }

export type YoudaoFrench = {
  query: string
  word: string
  phone: string
  source: string
  senses: YoudaoSense[]
  examples: YoudaoExample[]
}

const CJK = /[一-鿿]/
const memory = new Map<string, YoudaoFrench>()
const inflight = new Map<string, Promise<YoudaoFrench | null>>()

function apiBase(): string {
  try {
    const configured = String(import.meta.env?.VITE_STUDY_API_BASE_URL ?? '').trim()
    return configured ? new URL(configured).origin : ''
  } catch {
    return ''
  }
}

function asYoudao(data: unknown, query: string): YoudaoFrench {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const senses: YoudaoSense[] = []
  if (Array.isArray(record.senses)) {
    for (const item of record.senses) {
      if (!item || typeof item !== 'object') continue
      const sense = item as Record<string, unknown>
      const gloss = typeof sense.gloss === 'string' ? sense.gloss.trim() : ''
      const pos = typeof sense.pos === 'string' ? sense.pos.trim() : ''
      if (!gloss || !CJK.test(gloss) || gloss.includes('<')) continue
      senses.push({ pos, gloss })
      if (senses.length >= 6) break
    }
  }
  const examples: YoudaoExample[] = []
  if (Array.isArray(record.examples)) {
    for (const item of record.examples) {
      if (!item || typeof item !== 'object') continue
      const example = item as Record<string, unknown>
      const fr = typeof example.fr === 'string' ? example.fr.trim() : ''
      const zh = typeof example.zh === 'string' ? example.zh.trim() : ''
      if (!fr || !zh || !CJK.test(zh) || fr.includes('<') || zh.includes('<')) continue
      examples.push({ fr, zh })
      if (examples.length >= 2) break
    }
  }
  const word = typeof record.word === 'string' ? record.word.trim() : ''
  return {
    query,
    word: word || query,
    phone: typeof record.phone === 'string' ? record.phone.trim() : '',
    source: typeof record.source === 'string' ? record.source.trim() : '',
    senses,
    examples,
  }
}

async function fetchYoudao(query: string): Promise<YoudaoFrench | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${apiBase()}/api/study-plan/dictionary?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
      signal: controller.signal,
    })
    if (!response.ok) {
      if (response.status === 401) {
        const data = (await response.clone().json().catch(() => ({}))) as { code?: string }
        if (data.code === 'LOGIN_REQUIRED') {
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('qwerty-auth-required'))
        }
      }
      return null
    }
    return asYoudao(await response.json(), query)
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

/** Chinese explanation for a French headword. Null means the lookup failed; an empty sense list is a real miss. */
export async function loadYoudaoFrench(word: string): Promise<YoudaoFrench | null> {
  const query = word.trim()
  if (!query) return null
  const cached = memory.get(query)
  if (cached) return cached
  const pending = inflight.get(query)
  if (pending) return pending
  const request = fetchYoudao(query)
    .then((value) => {
      if (value) {
        memory.set(query, value)
        if (memory.size > 200) {
          const oldest = memory.keys().next().value
          if (oldest) memory.delete(oldest)
        }
      }
      return value
    })
    .finally(() => {
      inflight.delete(query)
    })
  inflight.set(query, request)
  return request
}

/** Prefer the dictionary form (manger) over the typed inflection (mangeais). */
export function youdaoQuery(result: DictionaryResult): string | null {
  const primary = result.words[0] ?? result.lemmas[0]
  const text = (primary?.word || result.query).trim()
  if (!text || text.length > 80 || !/\p{L}/u.test(text)) return null
  return text
}
