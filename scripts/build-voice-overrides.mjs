#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DICT_DIR = path.resolve('public/dicts')
const TMP_DIR = path.resolve('.tmp')
const YOUDAO_CACHE_FILE = path.join(TMP_DIR, 'youdao-voice-cache.json')
const COMMONS_CACHE_FILE = path.join(TMP_DIR, 'commons-voice-cache.json')
const TRANSCRIPT_CACHE_FILE = path.join(TMP_DIR, 'transcript-cache.json')
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

function loadTranscriptCache() {
  const cache = loadJsonCache(TRANSCRIPT_CACHE_FILE)
  const tsvFile = path.join(TMP_DIR, 'll-qc.tsv')
  if (fs.existsSync(tsvFile)) {
    try {
      const content = fs.readFileSync(tsvFile, 'utf8')
      for (const line of content.split('\n')) {
        const parts = line.split('\t')
        if (parts.length >= 3) {
          const transcript = parts[1].trim()
          const url = parts[2].trim()
          if (url && !(url in cache)) {
            cache[url] = transcript
          }
        }
      }
    } catch {
      // Ignore errors reading tsv
    }
  }
  return cache
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
  return null
}

function normalise(text) {
  if (typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseArgs() {
  const args = process.argv.slice(2)
  let qc = false
  let onlyWords = null

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--qc') {
      qc = true
    } else if (arg.startsWith('--only=')) {
      onlyWords = arg
        .slice('--only='.length)
        .split(',')
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
    } else if (arg === '--only' && i + 1 < args.length) {
      onlyWords = args[++i]
        .split(',')
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
    }
  }

  return { qc, onlyWords }
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

async function fetchExactLinguaLibreCandidates(word) {
  let continueParams = ''
  const pages = []
  const maxPages = 5
  const seenPages = new Set()

  for (let p = 0; p < maxPages; p++) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=intitle:"LL-Q150 (fra)" "${encodeURIComponent(
      word,
    )}.wav"&gsrnamespace=6&gsrlimit=50&prop=categories|videoinfo|imageinfo&cllimit=500&viprop=derivatives|url&iiprop=url&format=json${continueParams}`

    let resData = null
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

        resData = await res.json()
        break
      } catch (err) {
        if (attempt === 4) {
          console.warn(`Commons query failed for "${word}" after ${attempt} attempts:`, err.message)
          break
        }
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }

    if (!resData) break

    const currentPages = Object.values(resData.query?.pages || {})
    for (const page of currentPages) {
      const pageKey = page.pageid || page.title
      if (!seenPages.has(pageKey)) {
        seenPages.add(pageKey)
        pages.push(page)
      }
    }

    if (!resData.continue) break
    continueParams = '&' + new URLSearchParams(resData.continue).toString()
    await new Promise((r) => setTimeout(r, 500))
  }

  const candidates = []
  const seenTitles = new Set()

  for (const page of pages) {
    const title = page.title || ''
    if (seenTitles.has(title)) continue
    seenTitles.add(title)

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
    } else {
      const expectedSuffix = `-${word.toLowerCase()}`
      if (body.toLowerCase().endsWith(expectedSuffix)) {
        if (!speaker) {
          speaker = body.slice(0, body.length - expectedSuffix.length).trim()
        }
        recordedWord = body.slice(body.length - word.length).trim()
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

  return candidates
}

async function fetchAudioWithRetry(url) {
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
        console.warn(`Wikimedia audio rate limited (HTTP ${res.status}), waiting ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      if (attempt === 4) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

async function transcribeMp3WithDeepgram(mp3Url, apiKey, transcriptCache) {
  if (mp3Url in transcriptCache && transcriptCache[mp3Url] !== null) {
    return transcriptCache[mp3Url]
  }

  let audioBuf
  try {
    audioBuf = await fetchAudioWithRetry(mp3Url)
  } catch (err) {
    console.warn(`Failed to fetch audio for ${mp3Url}:`, err.message)
    return null
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-2', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          Authorization: `Token ${apiKey}`,
        },
        body: audioBuf,
        signal: AbortSignal.timeout(15000),
      })
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2
        console.warn(`Deepgram rate limited, waiting ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }
      if (!res.ok) throw new Error(`Deepgram HTTP ${res.status}`)
      const data = await res.json()
      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
      transcriptCache[mp3Url] = transcript
      saveJsonCache(TRANSCRIPT_CACHE_FILE, transcriptCache)
      return transcript
    } catch (err) {
      if (attempt === 4) {
        console.warn(`Deepgram transcription failed for ${mp3Url}:`, err.message)
        return null
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
  return null
}

async function lookupWithQC(word, apiKey, transcriptCache, commonsCache) {
  const candidates = await fetchExactLinguaLibreCandidates(word)

  for (const cand of candidates) {
    if (!cand.mp3Url) continue
    const transcript = await transcribeMp3WithDeepgram(cand.mp3Url, apiKey, transcriptCache)
    if (transcript != null) {
      const normTranscript = normalise(transcript)
      const normWord = normalise(word)
      if (normTranscript === normWord) {
        const result = {
          audio: cand.mp3Url,
          credit: `${cand.speaker} · Lingua Libre · CC BY-SA`,
          page: cand.pageUrl,
        }
        commonsCache[word] = result
        return { entry: result, speaker: cand.speaker }
      }
    }
    await new Promise((r) => setTimeout(r, 150))
  }

  const fallback = { audio: null }
  commonsCache[word] = fallback
  return { entry: fallback, speaker: null }
}

async function lookupLinguaLibreOnCommons(word, commonsCache) {
  if (word in commonsCache) {
    return commonsCache[word]
  }

  const candidates = await fetchExactLinguaLibreCandidates(word)
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
}

async function main() {
  const { qc, onlyWords } = parseArgs()

  let apiKey = null
  if (qc) {
    apiKey = getDeepgramApiKey()
    if (!apiKey) {
      throw new Error(
        'QC requested (--qc) but DEEPGRAM_API_KEY was not found in environment or /Users/dogecoin/Documents/GitHub/tcf-canada/.env.local',
      )
    }
  }

  const youdaoCache = loadJsonCache(YOUDAO_CACHE_FILE)
  const commonsCache = loadJsonCache(COMMONS_CACHE_FILE)
  const transcriptCache = qc ? loadTranscriptCache() : {}

  const existingManifest = loadJsonCache(OUT_FILE)
  const isOnlyMode = Array.isArray(onlyWords) && onlyWords.length > 0

  let targetWords = []
  if (isOnlyMode) {
    targetWords = onlyWords
    console.log(`Targeting ${targetWords.length} specific words (--only): ${targetWords.join(', ')}`)
  } else {
    const candidateWords = collectDictNames()
    console.log(`Collected ${candidateWords.length} unique candidate words from public/dicts/*.json`)
    targetWords = await checkStarredWords(candidateWords, youdaoCache)
    console.log(`Found ${targetWords.length} starred words:`, targetWords)
  }

  const wordsResult = isOnlyMode && existingManifest?.words ? { ...existingManifest.words } : {}

  let recordingsCount = 0

  console.log(`Processing ${targetWords.length} words (qc=${qc})...`)
  for (const word of targetWords) {
    let entry = null
    let speaker = null

    if (qc) {
      const res = await lookupWithQC(word, apiKey, transcriptCache, commonsCache)
      entry = res.entry
      speaker = res.speaker
      if (speaker) {
        console.log(`${word}: chosen speaker ${speaker}`)
      } else {
        console.log(`${word}: fell back to null`)
      }
    } else {
      entry = await lookupLinguaLibreOnCommons(word, commonsCache)
      if (entry && entry.audio) {
        speaker = entry.credit ? entry.credit.split(' · ')[0] : 'Unknown'
        console.log(`${word}: chosen speaker ${speaker}`)
      } else {
        console.log(`${word}: fell back to null`)
      }
    }

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
    generatedAt: isOnlyMode && existingManifest?.generatedAt ? existingManifest.generatedAt : new Date().toISOString(),
    source: existingManifest?.source || 'Wikimedia Commons / Lingua Libre (CC BY-SA)',
    words: sortedWords,
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`\nDone! Processed: ${targetWords.length}, Recordings: ${recordingsCount}`)
  console.log(`Wrote manifest to ${OUT_FILE}`)
}

main().catch((err) => {
  console.error('Fatal error in build-voice-overrides:', err)
  process.exit(1)
})
