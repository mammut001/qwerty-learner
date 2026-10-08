// French → Chinese via Youdao's public dictionary JSON.
// The official Open API (openapi.youdao.com) has no French dictionary, so this uses the same
// dict.youdao.com endpoint the word-audio player already calls. It is unofficial and can change;
// callers keep the offline lexicon and Wiktionary when this returns nothing or fails.

const YOUDAO_URL = 'https://dict.youdao.com/jsonapi'
const DICTS = JSON.stringify({ count: 2, dicts: [['fc', 'blng_sents_part']] })
const HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MISS_TTL_MS = 6 * 60 * 60 * 1000
const CJK = /[一-鿿]/
const PHONE_OK = /^[\u0020-\u007E\u00C0-\u024F\u0250-\u02FF\u0300-\u036F]{1,40}$/u
const QUERY_OK = /^[\p{L}\p{M}][\p{L}\p{M}0-9' -]*$/u
const TAGS = /<[^>]+>/g

export function normalizeFrenchQuery(input) {
  if (typeof input !== 'string') return ''
  const text = input.trim().replace(/\s+/g, ' ').replace(/[’ʼʻ]/g, "'")
  if (!text || text.length > 80 || !QUERY_OK.test(text) || !/\p{L}/u.test(text)) return ''
  return text
}

export function frenchQueryKey(query) {
  return normalizeFrenchQuery(query).toLocaleLowerCase('fr-FR')
}

function cleanText(value) {
  const raw = Array.isArray(value) ? value.filter((item) => typeof item === 'string').join('') : typeof value === 'string' ? value : ''
  return raw
    .replace(TAGS, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function glossText(value) {
  const text = cleanText(value).slice(0, 200)
  return text && CJK.test(text) && !text.includes('<') ? text : ''
}

export function parseYoudaoFrench(data, query) {
  const fc = data && typeof data === 'object' ? data.fc : null
  const word = fc && Array.isArray(fc.word) ? fc.word[0] : null
  const senses = []
  const rows = word && Array.isArray(word.trs) ? word.trs : []
  for (const row of rows) {
    const parts = []
    const translations = Array.isArray(row?.tr) ? row.tr : []
    for (const item of translations) {
      const gloss = glossText(item?.l?.i)
      if (gloss) parts.push(gloss)
    }
    const gloss = parts.join('；').slice(0, 200)
    if (!gloss) continue
    const pos = typeof row?.pos === 'string' ? row.pos.trim().slice(0, 16) : ''
    senses.push({ pos, gloss })
    if (senses.length >= 6) break
  }

  const examples = []
  const pairs = Array.isArray(data?.blng_sents_part?.['sentence-pair']) ? data.blng_sents_part['sentence-pair'] : []
  for (const pair of pairs) {
    const fr = cleanText(pair?.sentence).slice(0, 160)
    const zh = cleanText(pair?.['sentence-translation']).slice(0, 160)
    if (!fr || !zh || fr.length > 140 || zh.length > 80) continue
    if (!CJK.test(zh) || fr.includes('?') || zh.includes('?') || fr.includes('<') || zh.includes('<') || fr.includes('\uFFFD')) continue
    examples.push({ fr, zh })
    if (examples.length >= 2) break
  }

  const head = cleanText(word?.['return-phrase']?.l?.i).slice(0, 80)
  const phoneRaw = typeof word?.phone === 'string' ? word.phone.trim() : ''
  const source = cleanText(fc?.source?.name).slice(0, 40)
  return {
    query,
    word: head || query,
    phone: PHONE_OK.test(phoneRaw) ? phoneRaw : '',
    source,
    senses,
    examples,
  }
}

export function createYoudaoCache(max = 400) {
  const entries = new Map()
  return {
    get(key, now) {
      const hit = entries.get(key)
      if (!hit) return null
      if (now - hit.at >= hit.ttl) {
        entries.delete(key)
        return null
      }
      entries.delete(key)
      entries.set(key, hit)
      return hit.value
    },
    set(key, value, ttl, now) {
      if (entries.has(key)) entries.delete(key)
      entries.set(key, { value, ttl, at: now })
      while (entries.size > max) entries.delete(entries.keys().next().value)
    },
  }
}

export async function lookupYoudaoFrench(query, { fetchImpl = globalThis.fetch, cache, now = Date.now() } = {}) {
  const normalized = normalizeFrenchQuery(query)
  if (!normalized) return { error: 'invalid' }
  const key = normalized.toLocaleLowerCase('fr-FR')
  const hit = cache?.get(key, now)
  if (hit) return { value: hit, cached: true }
  const url = `${YOUDAO_URL}?${new URLSearchParams({ q: normalized, le: 'fr', dicts: DICTS })}`
  let response
  try {
    response = await fetchImpl(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4500),
    })
  } catch {
    return { error: 'upstream' }
  }
  if (!response?.ok) return { error: 'upstream' }
  let data
  try {
    const text = await response.text()
    if (!text || text.length > 1_000_000) return { error: 'upstream' }
    data = JSON.parse(text)
  } catch {
    return { error: 'upstream' }
  }
  const value = parseYoudaoFrench(data, normalized)
  const ttl = value.senses.length || value.examples.length ? HIT_TTL_MS : MISS_TTL_MS
  cache?.set(key, value, ttl, now)
  return { value, cached: false }
}
