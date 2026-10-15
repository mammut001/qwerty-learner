#!/usr/bin/env node
import { TTS_BASE_URL, TTS_VOICES, computeTtsAudioUrl, computeTtsKey, speakableText } from '../src/utils/ttsKey.mjs'
import fs from 'node:fs'
import path from 'node:path'

const DICT_DIR = path.resolve('public/dicts')
const TMP_DIR = path.resolve('.tmp')
const CACHE_FILE = path.join(TMP_DIR, 'elision-transcripts.json')
const DEFECTS_FILE = path.join(TMP_DIR, 'elision-defects.json')

fs.mkdirSync(TMP_DIR, { recursive: true })

export const ELISION_WORD_REGEX = /\b(l|d|j|m|t|s|c|n|qu|jusqu|lorsqu|puisqu)['’]\p{L}/iu
export const ELISION_PARSE_REGEX = /\b(l|d|j|m|t|s|c|n|qu|jusqu|lorsqu|puisqu)['’]([\p{L}]+)/giu

export function parseArgs() {
  const args = process.argv.slice(2)
  let limit = null
  let concurrency = 6

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice('--limit='.length), 10)
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[++i], 10)
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parseInt(arg.slice('--concurrency='.length), 10)
    } else if (arg === '--concurrency' && i + 1 < args.length) {
      concurrency = parseInt(args[++i], 10)
    }
  }

  return { limit, concurrency }
}

function getDeepgramApiKey() {
  if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY.trim()) {
    return process.env.DEEPGRAM_API_KEY.trim()
  }
  const defaultEnvPath = '/Users/dogecoin/Documents/GitHub/tcf-canada/.env.local'
  if (fs.existsSync(defaultEnvPath)) {
    try {
      const content = fs.readFileSync(defaultEnvPath, 'utf8')
      const match = content.match(/^DEEPGRAM_API_KEY=(.*)$/m)
      if (match) {
        return match[1].trim().replace(/^['"]|['"]$/g, '')
      }
    } catch {
      // Ignore read errors
    }
  }
  throw new Error('DEEPGRAM_API_KEY not found in process.env or /Users/dogecoin/Documents/GitHub/tcf-canada/.env.local')
}

export function normalise(text) {
  if (typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`-]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshteinDistance(a, b) {
  const m = a.length,
    n = b.length
  const d = []
  for (let i = 0; i <= m; i++) d[i] = [i]
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

export function computeSimilarity(a, b) {
  if (!a && !b) return 1
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  return 1 - levenshteinDistance(a, b) / maxLen
}

export function collectElisionNames() {
  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
  const names = new Set()

  for (const file of files) {
    const filePath = path.join(DICT_DIR, file)
    let entries = []
    try {
      entries = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      console.warn(`Could not read ${file}:`, err.message)
      continue
    }

    for (const item of entries) {
      if (typeof item?.name !== 'string') continue
      const name = item.name.trim()
      if (name && ELISION_WORD_REGEX.test(name)) {
        names.add(name)
      }
    }
  }

  return Array.from(names).sort()
}

async function transcribeWithDeepgram(apiKey, audioUrl) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ url: audioUrl }),
        signal: AbortSignal.timeout(20000),
      })

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2
        console.warn(`Deepgram rate-limited, waiting ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!res.ok) {
        // Fallback: fetch audio buffer directly
        const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(15000) })
        if (!audioRes.ok) throw new Error(`Audio fetch failed (${audioRes.status})`)
        const audioBuf = Buffer.from(await audioRes.arrayBuffer())

        const bufferRes = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-3', {
          method: 'POST',
          headers: {
            'Content-Type': 'audio/mpeg',
            Authorization: `Token ${apiKey}`,
          },
          body: audioBuf,
          signal: AbortSignal.timeout(20000),
        })

        if (!bufferRes.ok) {
          throw new Error(`Deepgram buffer transcription HTTP ${bufferRes.status}`)
        }
        const bufData = await bufferRes.json()
        return bufData.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
      }

      const data = await res.json()
      return data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    } catch (err) {
      if (attempt === 4) {
        console.warn(`Deepgram transcription failed for ${audioUrl}:`, err.message)
        return null
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
  return null
}

/**
 * Checks if an entry's audio has an elision defect:
 * 1. The elided consonant letter(s) appears as a standalone token in the normalised transcript,
 *    not also present as a standalone word in the source, and not followed by the elided word.
 * 2. Or the similarity between normalised source and normalised transcript is very low (< 0.35).
 */
export function checkElisionDefect(name, transcript) {
  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return { broken: true, reason: 'empty_transcript', similarity: 0 }
  }

  const spoken = speakableText(name)
  const normSource = normalise(spoken)
  const normTrans = normalise(transcript)
  const sim = computeSimilarity(normSource, normTrans)

  // Extract elisions from spoken text
  const elisions = []
  const parseRe = new RegExp(ELISION_PARSE_REGEX.source, 'giu')
  let match
  while ((match = parseRe.exec(spoken)) !== null) {
    elisions.push({
      prefix: normalise(match[1]),
      nextWord: normalise(match[2]),
    })
  }

  // Standalone words in source outside elisions
  const sourceWithoutElisions = spoken.replace(new RegExp(ELISION_PARSE_REGEX.source, 'giu'), ' ')
  const standaloneSourceTokens = new Set(normalise(sourceWithoutElisions).split(/\s+/).filter(Boolean))

  const transTokens = normTrans.split(/\s+/).filter(Boolean)

  for (const elision of elisions) {
    const { prefix, nextWord } = elision
    if (standaloneSourceTokens.has(prefix)) {
      continue
    }

    // Check if any occurrence of prefix in transcript is followed by nextWord (or stem)
    let hasMatchingOccurrence = false
    let strayOccurrence = null

    for (let i = 0; i < transTokens.length; i++) {
      if (transTokens[i] === prefix) {
        const nextTransToken = transTokens[i + 1] || ''
        const stemMatch =
          nextTransToken &&
          (nextWord === nextTransToken ||
            nextWord.startsWith(nextTransToken.slice(0, Math.min(3, nextTransToken.length))) ||
            nextTransToken.startsWith(nextWord.slice(0, Math.min(3, nextWord.length))))

        if (stemMatch) {
          hasMatchingOccurrence = true
        } else {
          strayOccurrence = {
            index: i,
            foundNext: nextTransToken,
          }
        }
      }
    }

    // If prefix appears standalone in transcript but NO occurrence matches nextWord:
    if (strayOccurrence && !hasMatchingOccurrence) {
      return {
        broken: true,
        reason: `standalone_elision_letter: "${prefix}" followed by "${strayOccurrence.foundNext}" instead of "${nextWord}"`,
        similarity: sim,
        prefix,
        nextWord,
        foundNext: strayOccurrence.foundNext,
      }
    }
  }

  // Very low similarity check (< 0.35)
  // Catches severe breakdown (e.g. "g u", "g t", "essaie saint jean sous-titre").
  // Excludes known fine elisions like "à l'heure" which prompt notes is fine despite Deepgram hearing "alors".
  if (sim < 0.35 && spoken !== "à l'heure") {
    return {
      broken: true,
      reason: `low_similarity (${(sim * 100).toFixed(1)}%): source="${normSource}" vs transcript="${normTrans}"`,
      similarity: sim,
    }
  }

  return { broken: false, similarity: sim }
}

async function main() {
  const { limit, concurrency } = parseArgs()
  const apiKey = getDeepgramApiKey()

  let cache = {}
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    } catch {
      cache = {}
    }
  }

  const allNames = collectElisionNames()
  const names = limit ? allNames.slice(0, limit) : allNames
  console.log(`Found ${allNames.length} names with elisions (checking ${names.length}, concurrency: ${concurrency})`)

  const tasks = []
  for (const name of names) {
    for (const accent of ['fr-CA', 'fr-FR']) {
      const voice = TTS_VOICES[accent]
      const key = computeTtsKey(voice, name)
      const url = computeTtsAudioUrl(TTS_BASE_URL, accent, key)
      tasks.push({ name, accent, key, url })
    }
  }

  console.log(`Total audio items to transcribe: ${tasks.length}`)

  let completed = 0
  let cacheHits = 0
  let lastSave = Date.now()

  let taskIndex = 0
  async function worker() {
    while (taskIndex < tasks.length) {
      const task = tasks[taskIndex++]
      const cacheKey = `${task.accent}:${task.key}`

      if (cache[cacheKey] && typeof cache[cacheKey].transcript === 'string') {
        cacheHits++
        completed++
        if (completed % 100 === 0 || completed === tasks.length) {
          console.log(`[${completed}/${tasks.length}] (cached ${cacheHits})`)
        }
        continue
      }

      const transcript = await transcribeWithDeepgram(apiKey, task.url)
      cache[cacheKey] = {
        name: task.name,
        accent: task.accent,
        key: task.key,
        url: task.url,
        transcript,
        transcribedAt: new Date().toISOString(),
      }

      completed++
      if (completed % 50 === 0 || completed === tasks.length) {
        console.log(`[${completed}/${tasks.length}] (cached ${cacheHits})`)
      }

      if (Date.now() - lastSave > 5000) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
        lastSave = Date.now()
      }
    }
  }

  const pool = Array.from({ length: concurrency }, () => worker())
  await Promise.all(pool)

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')

  // Analyze defects
  const brokenByAccent = {
    'fr-CA': 0,
    'fr-FR': 0,
  }
  const defects = []

  for (const name of names) {
    const entryDefect = {
      name,
      brokenAccents: [],
      details: {},
    }

    for (const accent of ['fr-CA', 'fr-FR']) {
      const voice = TTS_VOICES[accent]
      const key = computeTtsKey(voice, name)
      const cached = cache[`${accent}:${key}`]
      const transcript = cached ? cached.transcript : null

      const check = checkElisionDefect(name, transcript)
      if (check.broken) {
        brokenByAccent[accent]++
        entryDefect.brokenAccents.push(accent)
        entryDefect.details[accent] = {
          key,
          url: cached?.url,
          transcript,
          ...check,
        }
      }
    }

    if (entryDefect.brokenAccents.length > 0) {
      defects.push(entryDefect)
    }
  }

  const result = {
    checkedCount: names.length,
    brokenCounts: brokenByAccent,
    defectsCount: defects.length,
    defects,
  }

  fs.writeFileSync(DEFECTS_FILE, JSON.stringify(result, null, 2) + '\n', 'utf8')

  console.log('\n========================================')
  console.log('       ELISION DEFECTS SUMMARY          ')
  console.log('========================================')
  console.log(`Total checked names: ${names.length}`)
  console.log(`Broken fr-CA: ${brokenByAccent['fr-CA']}`)
  console.log(`Broken fr-FR: ${brokenByAccent['fr-FR']}`)
  console.log(`Total broken entries: ${defects.length}`)
  console.log(`Defects saved to: ${DEFECTS_FILE}`)
  console.log('\nBroken entries list:')
  for (const d of defects) {
    console.log(`- "${d.name}" [${d.brokenAccents.join(', ')}]`)
    for (const acc of d.brokenAccents) {
      const detail = d.details[acc]
      console.log(`    ${acc}: "${detail.transcript}" (${detail.reason})`)
    }
  }
}

// Only execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('Fatal error in find-elision-defects:', err)
    process.exit(1)
  })
}
