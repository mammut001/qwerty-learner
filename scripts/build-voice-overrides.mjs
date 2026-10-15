#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DICT_DIR = path.resolve('public/dicts')
const TMP_DIR = path.resolve('.tmp')
const YOUDAO_CACHE_FILE = path.join(TMP_DIR, 'youdao-voice-cache.json')
const COMMONS_CACHE_FILE = path.join(TMP_DIR, 'commons-voice-cache.json')
const OUT_FILE = path.resolve('public/voice/fr-overrides.json')

fs.mkdirSync(TMP_DIR, { recursive: true })
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })

function loadJsonCache(file) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'))
    }
  } catch {
    // Ignore corrupt cache
  }
  return {}
}

function saveJsonCache(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error(`Failed to write cache ${file}:`, err.message)
  }
}

function collectDictNames() {
  const files = fs.readdirSync(DICT_DIR).filter((f) => f.endsWith('.json'))
  const candidateSet = new Set()

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
      if (!name) continue

      // Single word or short phrase: <= 5 words, no sentence-level punctuation, no parens
      const words = name.split(/\s+/)
      if (words.length <= 5 && !/[.,!?;:…«»"“”]/.test(name) && !/\(.*\)/.test(name)) {
        candidateSet.add(name.toLowerCase())
      }
    }
  }

  return Array.from(candidateSet).sort()
}

function isStarredYoudaoData(data) {
  if (!data || typeof data !== 'object') return false
  const simpleWords = Array.isArray(data?.simple?.word) ? data.simple.word : []
  for (const w of simpleWords) {
    if (typeof w?.speech === 'string' && w.speech.includes('*')) return true
    if (typeof w?.['return-phrase'] === 'string' && w['return-phrase'].includes('*')) return true
  }
  const fcWords = Array.isArray(data?.fc?.word) ? data.fc.word : []
  for (const w of fcWords) {
    if (typeof w?.speech === 'string' && w.speech.includes('*')) return true
    const rp = w?.['return-phrase']
    if (typeof rp === 'string' && rp.includes('*')) return true
    if (typeof rp?.l?.i === 'string' && rp.l.i.includes('*')) return true
  }
  return false
}

async function queryYoudaoWithRetry(word, retries = 3) {
  const url = `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word)}&le=fr`
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      return isStarredYoudaoData(data)
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Youdao check failed for "${word}" after ${retries} attempts:`, err.message)
        return false
      }
      await new Promise((r) => setTimeout(r, 200 * attempt))
    }
  }
  return false
}

async function checkStarredWords(words, youdaoCache) {
  let dirtyCount = 0
  const starredList = []
  const concurrency = 4
  let currentIndex = 0
  let completed = 0

  console.log(`Checking ${words.length} candidate words against Youdao...`)

  async function worker() {
    while (currentIndex < words.length) {
      const index = currentIndex++
      const word = words[index]

      let starred
      if (word in youdaoCache) {
        starred = youdaoCache[word]
      } else {
        starred = await queryYoudaoWithRetry(word)
        youdaoCache[word] = starred
        dirtyCount++
        if (dirtyCount >= 50) {
          saveJsonCache(YOUDAO_CACHE_FILE, youdaoCache)
          dirtyCount = 0
        }
        await new Promise((r) => setTimeout(r, 25))
      }

      if (starred) {
        starredList.push(word)
      }

      completed++
      if (completed % 500 === 0 || completed === words.length) {
        console.log(`Progress: ${completed}/${words.length} checked (${starredList.length} starred so far)`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  saveJsonCache(YOUDAO_CACHE_FILE, youdaoCache)

  return starredList.sort()
}

async function lookupLinguaLibreOnCommons(word, commonsCache) {
  if (word in commonsCache) {
    return commonsCache[word]
  }

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=intitle:"LL-Q150 (fra)" "${encodeURIComponent(
    word,
  )}.wav"&gsrnamespace=6&gsrlimit=20&prop=categories|videoinfo|imageinfo&cllimit=500&viprop=derivatives|url&iiprop=url&format=json`

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TCFCanadaPractice/1.0 (https://github.com/mammut001/qwerty-learner; learner@example.org)',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2
        console.warn(`Wikimedia rate limited (HTTP ${res.status}) on "${word}", waiting ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      const pages = Object.values(data.query?.pages || {})

      if (!pages.length) {
        const result = { audio: null }
        commonsCache[word] = result
        return result
      }

      const candidates = []
      for (const page of pages) {
        const title = page.title || ''
        const extMatch = /\.(wav|ogg|mp3|flac)$/i.exec(title)
        if (!extMatch) continue

        const base = title.slice('File:'.length, extMatch.index)
        const prefix = 'LL-Q150 (fra)-'
        if (!base.startsWith(prefix)) continue
        const body = base.slice(prefix.length).replace(/_/g, ' ')

        let speaker = null
        let recordedWord = null
        const cats = page.categories || []
        for (const cat of cats) {
          const m = /^Category:Lingua Libre pronunciation by (.+)$/i.exec(cat.title)
          if (m) {
            speaker = m[1].trim().replace(/_/g, ' ')
            break
          }
        }

        if (speaker && body.toLowerCase().startsWith(speaker.toLowerCase() + '-')) {
          recordedWord = body.slice(speaker.length + 1).trim()
        } else if (!speaker) {
          const expectedSuffix = `-${word.toLowerCase()}`
          if (body.toLowerCase().endsWith(expectedSuffix)) {
            speaker = body.slice(0, body.length - expectedSuffix.length).trim()
            recordedWord = body.slice(speaker.length + 1).trim()
          }
        }

        if (!recordedWord || recordedWord.toLowerCase() !== word.toLowerCase()) continue

        const pageUrl =
          page.imageinfo?.[0]?.descriptionurl ||
          page.videoinfo?.[0]?.descriptionurl ||
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`
        const derivatives = page.videoinfo?.[0]?.derivatives || []
        const mp3 = derivatives.find(
          (d) => d.transcodekey === 'mp3' || d.type === 'audio/mpeg' || (typeof d.src === 'string' && d.src.endsWith('.mp3')),
        )

        candidates.push({
          speaker: speaker || 'Unknown',
          title,
          pageUrl,
          mp3Url: mp3?.src || null,
        })
      }

      const best = candidates.find((c) => c.mp3Url)
      if (!best || !best.mp3Url) {
        const result = { audio: null }
        commonsCache[word] = result
        return result
      }

      const result = {
        audio: best.mp3Url,
        credit: `${best.speaker} · Lingua Libre · CC BY-SA`,
        page: best.pageUrl,
      }
      commonsCache[word] = result
      return result
    } catch (err) {
      if (attempt === 4) {
        console.warn(`Commons lookup failed for "${word}" after ${attempt} attempts:`, err.message)
        const result = { audio: null }
        commonsCache[word] = result
        return result
      }
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }

  const fallback = { audio: null }
  commonsCache[word] = fallback
  return fallback
}

async function main() {
  const candidateWords = collectDictNames()
  console.log(`Collected ${candidateWords.length} unique candidate words from public/dicts/*.json`)

  const youdaoCache = loadJsonCache(YOUDAO_CACHE_FILE)
  const commonsCache = loadJsonCache(COMMONS_CACHE_FILE)

  const starredWords = await checkStarredWords(candidateWords, youdaoCache)
  console.log(`Found ${starredWords.length} starred words:`, starredWords)

  const wordsResult = {}
  let recordingsCount = 0

  console.log(`Looking up Lingua Libre recordings on Wikimedia Commons for ${starredWords.length} starred words...`)
  for (const word of starredWords) {
    const entry = await lookupLinguaLibreOnCommons(word, commonsCache)
    saveJsonCache(COMMONS_CACHE_FILE, commonsCache)

    if (entry && entry.audio) {
      wordsResult[word] = {
        audio: entry.audio,
        credit: entry.credit,
        page: entry.page,
      }
      recordingsCount++
    } else {
      wordsResult[word] = { audio: null }
    }
    await new Promise((r) => setTimeout(r, 350))
  }

  // Sort keys alphabetically
  const sortedWords = {}
  for (const key of Object.keys(wordsResult).sort()) {
    sortedWords[key] = wordsResult[key]
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'Wikimedia Commons / Lingua Libre (CC BY-SA)',
    words: sortedWords,
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`\nDone! Checked: ${candidateWords.length}, Starred: ${starredWords.length}, Recordings: ${recordingsCount}`)
  console.log(`Wrote manifest to ${OUT_FILE}`)
}

main().catch((err) => {
  console.error('Fatal error in build-voice-overrides:', err)
  process.exit(1)
})
