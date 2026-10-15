#!/usr/bin/env node
import { TTS_BASE_URL, TTS_VOICES, computeTtsAudioUrl, computeTtsKey, computeTtsObjectPath, speakableText } from '../src/utils/ttsKey.mjs'
import fs from 'node:fs'
import path from 'node:path'

const DICT_DIR = path.resolve('public/dicts')
const TMP_DIR = path.resolve('.tmp')
const STATE_FILE = path.join(TMP_DIR, 'tts-state.json')
const MANIFEST_FILE = path.resolve('public/voice/tts-manifest.json')
const QC_FILE = path.join(TMP_DIR, 'tts-qc.json')
const REPORT_FILE = path.resolve('docs/tts-qc.md')

fs.mkdirSync(TMP_DIR, { recursive: true })
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true })

function parseArgs() {
  const args = process.argv.slice(2)
  let limit = null
  let accent = null
  let concurrency = 4

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice('--limit='.length), 10)
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[++i], 10)
    } else if (arg.startsWith('--accent=')) {
      accent = arg.slice('--accent='.length).trim()
    } else if (arg === '--accent' && i + 1 < args.length) {
      accent = args[++i].trim()
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parseInt(arg.slice('--concurrency='.length), 10)
    } else if (arg === '--concurrency' && i + 1 < args.length) {
      concurrency = parseInt(args[++i], 10)
    }
  }

  return { limit, accent, concurrency }
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

function loadJson(file, fallback = {}) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'))
    } catch {
      // Ignore corrupt file
    }
  }
  return fallback
}

function saveJson(file, data) {
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, file)
}

function collectDictNames() {
  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
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
      if (name) {
        candidateSet.add(name)
      }
    }
  }

  return Array.from(candidateSet)
}

async function transcribeWithDeepgram(apiKey, audioUrl) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-2', {
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
        // Fallback: try fetching the audio buffer directly
        const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(15000) })
        if (!audioRes.ok) throw new Error(`Audio fetch failed (${audioRes.status})`)
        const audioBuf = Buffer.from(await audioRes.arrayBuffer())

        const bufferRes = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-2', {
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

function generateReport(qcData) {
  const records = Object.values(qcData.transcripts || {})
  const total = records.length
  const mismatches = records.filter((r) => !r.matched)
  const matches = total - mismatches.length
  const matchRate = total > 0 ? ((matches / total) * 100).toFixed(2) : '100.00'

  const lines = [
    '# Google Chirp 3 HD TTS Quality Check Report',
    '',
    `- **Date**: ${new Date().toISOString()}`,
    '- **ASR Model**: Deepgram `nova-2` (`language=fr`)',
    `- **Total Objects Checked**: ${total}`,
    `- **Matches**: ${matches} (${matchRate}%)`,
    `- **Mismatches**: ${mismatches.length}`,
    '',
    '## Mismatch Details',
    '',
    'Single-word homophones, grammatical variants, or slight phonetic transcriptions are expected and documented below.',
    '',
    '| Text | Accent | Transcript | Audio URL |',
    '| --- | --- | --- | --- |',
  ]

  for (const m of mismatches) {
    const safeText = m.text.replace(/\|/g, '\\|')
    const safeTranscript = (m.transcript || '(empty)').replace(/\|/g, '\\|')
    lines.push(`| ${safeText} | ${m.accent} | ${safeTranscript} | [audio](${m.url}) |`)
  }

  lines.push('')
  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8')
  console.log(`QC Report written to ${REPORT_FILE}`)
}

async function main() {
  const { limit, accent, concurrency } = parseArgs()
  const apiKey = getDeepgramApiKey()
  const qcData = loadJson(QC_FILE, { transcripts: {} })
  if (!qcData.transcripts) qcData.transcripts = {}

  const manifest = loadJson(MANIFEST_FILE, null)
  if (!manifest || !manifest.keys) {
    throw new Error(`Manifest not found at ${MANIFEST_FILE}. Please run build-tts-audio.mjs first.`)
  }

  const state = loadJson(STATE_FILE, { objects: {} })

  // Map key -> source text
  const keyToText = new Map()
  for (const obj of Object.values(state.objects || {})) {
    if (obj.key && obj.text) {
      keyToText.set(`${obj.accent}:${obj.key}`, obj.text)
    }
  }

  const allTexts = collectDictNames()
  for (const text of allTexts) {
    for (const acc of ['fr-CA', 'fr-FR']) {
      const voice = TTS_VOICES[acc]
      if (voice) {
        const key = computeTtsKey(voice, text)
        keyToText.set(`${acc}:${key}`, text)
      }
    }
  }

  const targetAccents = accent ? [accent] : ['fr-CA', 'fr-FR']
  const tasks = []

  for (const acc of targetAccents) {
    const keys = manifest.keys[acc] || []
    for (const key of keys) {
      const text = keyToText.get(`${acc}:${key}`) || key
      const objectPath = computeTtsObjectPath(acc, key)
      const url = computeTtsAudioUrl(manifest.base || TTS_BASE_URL, acc, key)
      tasks.push({ accent: acc, key, text, objectPath, url })
    }
  }

  const selectedTasks = limit ? tasks.slice(0, limit) : tasks
  console.log(
    `Running Quality Check on ${selectedTasks.length} items (concurrency: ${concurrency}, target accents: ${targetAccents.join(', ')})`,
  )

  let checkedCount = 0
  let matchCount = 0
  let mismatchCount = 0
  let skippedCount = 0
  let failedCount = 0

  let index = 0
  let lastSave = Date.now()

  async function worker() {
    while (index < selectedTasks.length) {
      const taskIndex = index++
      const task = selectedTasks[taskIndex]
      const { accent: acc, key, text, objectPath, url } = task

      const cached = qcData.transcripts[objectPath]
      if (cached && typeof cached.transcript === 'string') {
        skippedCount++
        checkedCount++
        if (cached.matched) matchCount++
        else mismatchCount++
        continue
      }

      const transcript = await transcribeWithDeepgram(apiKey, url)
      if (transcript === null) {
        failedCount++
        checkedCount++
        console.warn(`[${checkedCount}/${selectedTasks.length}] Transcription failed: ${url}`)
        continue
      }

      const normSource = normalise(speakableText(text))
      const normTrans = normalise(transcript)
      const matched = normSource === normTrans

      qcData.transcripts[objectPath] = {
        accent: acc,
        key,
        text,
        url,
        transcript,
        normSource,
        normTranscript: normTrans,
        matched,
        checkedAt: new Date().toISOString(),
      }

      checkedCount++
      if (matched) {
        matchCount++
      } else {
        mismatchCount++
        console.log(`[MISMATCH] [${acc}] "${text}" -> transcript: "${transcript}"`)
      }

      if (selectedTasks.length <= 50 || checkedCount % 50 === 0 || checkedCount === selectedTasks.length) {
        console.log(
          `[${checkedCount}/${selectedTasks.length}] Matches: ${matchCount}, Mismatches: ${mismatchCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`,
        )
      }

      if (Date.now() - lastSave > 5000) {
        saveJson(QC_FILE, qcData)
        lastSave = Date.now()
      }
    }
  }

  const pool = Array.from({ length: concurrency }, () => worker())
  await Promise.all(pool)

  saveJson(QC_FILE, qcData)
  generateReport(qcData)

  console.log('\n--- QC Summary ---')
  console.log(`Total checked: ${checkedCount}`)
  console.log(`Matches: ${matchCount}`)
  console.log(`Mismatches: ${mismatchCount}`)
  console.log(`Skipped (cached): ${skippedCount}`)
  console.log(`Failed: ${failedCount}`)
  console.log(`Report: ${REPORT_FILE}`)
}

main().catch((err) => {
  console.error('Fatal error in check-tts-audio:', err)
  process.exit(1)
})
