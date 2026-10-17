#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isDirectExecution = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`
const isUnderTsLoader = process.execArgv.some((arg) => arg.includes('ts-extension-loader.mjs'))
if (isDirectExecution && !isUnderTsLoader) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const loaderPath = path.join(repoRoot, 'server/ts-extension-loader.mjs')
  const scriptPath = fileURLToPath(import.meta.url)
  const args = ['--experimental-loader', loaderPath, '--experimental-strip-types', scriptPath, ...process.argv.slice(2)]
  const child = spawnSync(process.execPath, args, { stdio: 'inherit' })
  process.exit(child.status ?? 0)
}

// Running under ts-extension-loader
const { INTENSIVE_AUDIO_BASE_URL, computeIntensiveObjectPath } = await import('../src/utils/intensiveListeningAudioKey.mjs')

const { TCF_LISTENING_BASE_URL, computeListeningObjectPath } = await import('../src/utils/tcfListeningAudioKey.mjs')

const {
  findFlaggedWords,
  formatIntensiveFlaggedSentence,
  formatTcfFlaggedMessage,
  getIgnoredTokens,
  mapFlaggedWordToIntensiveSentence,
} = await import('../src/utils/ttsQaHelpers.mjs')

export const QA_IGNORE_FILE = path.resolve('scripts/tts-qa-ignore.json')

/**
 * Loads the optional per-item QA ignore list (e.g. scripts/tts-qa-ignore.json).
 * @param {string} [filePath]
 * @returns {Record<string, Record<string, string[]>>}
 */
export function loadQaIgnoreConfig(filePath = QA_IGNORE_FILE) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      console.warn(`Warning: Could not parse QA ignore file ${filePath}: ${err.message}`)
      return {}
    }
  }
  return {}
}

const INTENSIVE_MANIFEST_FILE = path.resolve('public/voice/intensive-listening-manifest.json')
const TCF_MANIFEST_FILE = path.resolve('public/voice/tcf-listening-manifest.json')

export function parseArgs(rawArgs = process.argv.slice(2)) {
  let manifestType = null
  let only = null
  let concurrency = 2

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i]
    if (arg === 'intensive' || arg === 'tcf-listening') {
      manifestType = arg
    } else if (arg.startsWith('--manifest=')) {
      manifestType = arg.slice('--manifest='.length).trim()
    } else if (arg.startsWith('--type=')) {
      manifestType = arg.slice('--type='.length).trim()
    } else if (arg.startsWith('--only=')) {
      only = arg.slice('--only='.length).trim()
    } else if (arg === '--only' && i + 1 < rawArgs.length) {
      only = rawArgs[++i].trim()
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parseInt(arg.slice('--concurrency='.length), 10)
    } else if (arg === '--concurrency' && i + 1 < rawArgs.length) {
      concurrency = parseInt(rawArgs[++i], 10)
    }
  }

  return { manifestType, only, concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 2 }
}

export function getDeepgramApiKey() {
  if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY.trim()) {
    return process.env.DEEPGRAM_API_KEY.trim()
  }
  const defaultEnvPath = path.resolve('.env.local')
  if (fs.existsSync(defaultEnvPath)) {
    try {
      const content = fs.readFileSync(defaultEnvPath, 'utf8')
      const match = content.match(/^DEEPGRAM_API_KEY=(.*)$/m)
      if (match && match[1].trim()) {
        return match[1].trim().replace(/^['"]|['"]$/g, '')
      }
    } catch {
      // Ignore read errors
    }
  }
  return null
}

export async function downloadAudio(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) {
    throw new Error(`Audio fetch HTTP ${res.status}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function transcribeWithDeepgram(apiKey, audioBuffer) {
  const url = new URL('https://api.deepgram.com/v1/listen')
  url.searchParams.set('model', 'nova-3')
  url.searchParams.set('language', 'fr')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          Authorization: `Token ${apiKey}`,
        },
        body: audioBuffer,
        signal: AbortSignal.timeout(30000),
      })

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2
        console.warn(`Deepgram rate-limited, waiting ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!res.ok) {
        throw new Error(`Deepgram API HTTP ${res.status}`)
      }

      const data = await res.json()
      const alt = data?.results?.channels?.[0]?.alternatives?.[0]
      const words = Array.isArray(alt?.words) ? alt.words : []
      return {
        transcript: alt?.transcript || '',
        words,
      }
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
  throw new Error('Deepgram transcription failed after retries')
}

async function runIntensiveQa({ only, concurrency, apiKey, ignoreConfig = loadQaIgnoreConfig() }) {
  if (!fs.existsSync(INTENSIVE_MANIFEST_FILE)) {
    console.error(`Error: Manifest file not found: ${INTENSIVE_MANIFEST_FILE}`)
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(INTENSIVE_MANIFEST_FILE, 'utf8'))
  const { INTENSIVE_PASSAGES } = await import('../src/resources/intensiveListening.ts')
  const passageMap = new Map((INTENSIVE_PASSAGES || []).map((p) => [p.id, p]))

  let passageIds = Object.keys(manifest.items || {}).sort()
  if (only) {
    passageIds = passageIds.filter((id) => id === only)
    if (passageIds.length === 0) {
      console.error(`Error: Passage id "${only}" not found in manifest.`)
      process.exit(1)
    }
  }

  console.log(`=== Deepgram TTS QA: Intensive Listening (${passageIds.length} passages) ===`)
  let totalDefects = 0
  let processed = 0

  for (const passageId of passageIds) {
    const item = manifest.items[passageId]
    const passage = passageMap.get(passageId)
    const publicUrl = `${manifest.base || INTENSIVE_AUDIO_BASE_URL}/${computeIntensiveObjectPath(item.key)}`

    try {
      const audioBuffer = await downloadAudio(publicUrl)
      const asr = await transcribeWithDeepgram(apiKey, audioBuffer)
      const ignoredTokens = getIgnoredTokens(ignoreConfig, 'intensive', passageId)
      const originalText = passage?.sentences?.map((s) => s.fr).join(' ') || ''
      const flagged = findFlaggedWords(asr.words, ignoredTokens, originalText)

      if (flagged.length > 0) {
        totalDefects += flagged.length
        const seenSentences = new Set()
        for (const f of flagged) {
          const mapping = mapFlaggedWordToIntensiveSentence(f, item.segments || [], passage?.sentences || [])
          const sentKey = `${passageId}#${mapping.sentenceNumber}`
          if (!seenSentences.has(sentKey)) {
            seenSentences.add(sentKey)
            console.log(formatIntensiveFlaggedSentence(passageId, mapping.sentenceNumber, mapping.sentenceFr))
          }
          console.log(`   -> Flagged token: "${f.token}" (${f.type}) at ${f.start?.toFixed(2)}s`)
        }
      }
      processed++
    } catch (err) {
      totalDefects++
      console.error(`Error processing passage "${passageId}": ${err.message}`)
    }
  }

  console.log(`\nProcessed: ${processed}/${passageIds.length}`)
  console.log(`Defects flagged: ${totalDefects}`)
  return totalDefects
}

async function runTcfQa({ only, concurrency, apiKey, ignoreConfig = loadQaIgnoreConfig() }) {
  if (!fs.existsSync(TCF_MANIFEST_FILE)) {
    console.error(`Error: Manifest file not found: ${TCF_MANIFEST_FILE}`)
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(TCF_MANIFEST_FILE, 'utf8'))
  const { TCF_LISTENING_QUESTIONS } = await import('../src/resources/tcfMock.ts')
  const { TCF_LISTENING_SET_B } = await import('../src/resources/tcfMockSetB.ts')
  const questionMap = new Map([
    ...(TCF_LISTENING_QUESTIONS || []).map((q) => [q.id, q]),
    ...(TCF_LISTENING_SET_B || []).map((q) => [q.id, q]),
  ])
  let questionIds = Object.keys(manifest.items || {}).sort()

  if (only) {
    questionIds = questionIds.filter((id) => id === only || id.endsWith(only))
    if (questionIds.length === 0) {
      console.error(`Error: Question id "${only}" not found in manifest.`)
      process.exit(1)
    }
  }

  console.log(`=== Deepgram TTS QA: TCF Listening (${questionIds.length} questions) ===`)
  let totalDefects = 0
  let processed = 0

  for (const qId of questionIds) {
    const itemKey = manifest.items[qId]
    const publicUrl = `${manifest.base || TCF_LISTENING_BASE_URL}/${computeListeningObjectPath(itemKey)}`

    try {
      const audioBuffer = await downloadAudio(publicUrl)
      const asr = await transcribeWithDeepgram(apiKey, audioBuffer)
      const ignoredTokens = getIgnoredTokens(ignoreConfig, 'tcf-listening', qId)
      const question = questionMap.get(qId)
      const originalText = question?.audioText || ''
      const flagged = findFlaggedWords(asr.words, ignoredTokens, originalText)

      if (flagged.length > 0) {
        totalDefects += flagged.length
        console.log(formatTcfFlaggedMessage(qId))
        for (const f of flagged) {
          console.log(`   -> Flagged token: "${f.token}" (${f.type}) at ${f.start?.toFixed(2)}s`)
        }
      }
      processed++
    } catch (err) {
      totalDefects++
      console.error(`Error processing question "${qId}": ${err.message}`)
    }
  }

  console.log(`\nProcessed: ${processed}/${questionIds.length}`)
  console.log(`Defects flagged: ${totalDefects}`)
  return totalDefects
}

async function main() {
  const { manifestType, only, concurrency } = parseArgs()

  if (!manifestType || (manifestType !== 'intensive' && manifestType !== 'tcf-listening')) {
    console.error('Usage: node scripts/tts-qa-deepgram.mjs <intensive | tcf-listening> [--only=<id>]')
    process.exit(1)
  }

  const apiKey = getDeepgramApiKey()
  if (!apiKey) {
    console.error('Error: DEEPGRAM_API_KEY environment variable is required.')
    process.exit(1)
  }

  const ignoreConfig = loadQaIgnoreConfig()
  let totalDefects = 0
  if (manifestType === 'intensive') {
    totalDefects = await runIntensiveQa({ only, concurrency, apiKey, ignoreConfig })
  } else {
    totalDefects = await runTcfQa({ only, concurrency, apiKey, ignoreConfig })
  }

  if (totalDefects > 0) {
    console.error(`\nQA FAILED: ${totalDefects} defect token(s) detected.`)
    process.exit(1)
  }

  console.log('\nQA PASSED: 0 defects detected.')
  process.exit(0)
}

if (isDirectExecution) {
  main().catch((err) => {
    console.error('Fatal QA script error:', err.message)
    process.exit(1)
  })
}
