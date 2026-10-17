#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Re-exec with repository TS loader if necessary
const isUnderTsLoader = process.execArgv.some((arg) => arg.includes('ts-extension-loader.mjs'))
if (!isUnderTsLoader) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const loaderPath = path.join(repoRoot, 'server/ts-extension-loader.mjs')
  const scriptPath = fileURLToPath(import.meta.url)
  const args = [
    '--experimental-loader',
    loaderPath,
    '--experimental-strip-types',
    scriptPath,
    ...process.argv.slice(2),
  ]
  const child = spawnSync(process.execPath, args, { stdio: 'inherit' })
  process.exit(child.status ?? 0)
}

// Running under ts-extension-loader
const {
  INTENSIVE_AUDIO_BASE_URL,
  INTENSIVE_AUDIO_VERSION,
  DEFAULT_FEMALE_VOICE,
  DEFAULT_INTENSIVE_SPEAKING_RATE,
  DEFAULT_MALE_VOICE,
  applyTtsSentenceFixes,
  assignPassageSentenceVoice,
  computeIntensiveKey,
  computeIntensiveObjectPath,
  concatenateMp3Buffers,
  parseMp3Duration,
} = await import('../src/utils/intensiveListeningAudioKey.mjs')

const { INTENSIVE_PASSAGES } = await import('../src/resources/intensiveListening.ts')

const MANIFEST_FILE = path.resolve('public/voice/intensive-listening-manifest.json')
const BUCKET_NAME = 'tcf-voice-tcf-canada-5b8c2'

function parseArgs() {
  const args = process.argv.slice(2)
  let dryRun = false
  let limit = null
  let only = null
  let rate = DEFAULT_INTENSIVE_SPEAKING_RATE
  let concurrency = 2

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice('--limit='.length), 10)
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[++i], 10)
    } else if (arg.startsWith('--only=')) {
      only = arg.slice('--only='.length).trim()
    } else if (arg === '--only' && i + 1 < args.length) {
      only = args[++i].trim()
    } else if (arg.startsWith('--rate=')) {
      rate = parseFloat(arg.slice('--rate='.length))
    } else if (arg === '--rate' && i + 1 < args.length) {
      rate = parseFloat(args[++i])
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parseInt(arg.slice('--concurrency='.length), 10)
    } else if (arg === '--concurrency' && i + 1 < args.length) {
      concurrency = parseInt(args[++i], 10)
    }
  }

  return { dryRun, limit, only, rate, concurrency }
}

function loadExistingManifest() {
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
      if (parsed && typeof parsed.items === 'object' && parsed.items !== null) {
        return parsed
      }
    } catch {
      // Ignore corrupt manifest and return fresh
    }
  }
  return {
    version: INTENSIVE_AUDIO_VERSION,
    base: INTENSIVE_AUDIO_BASE_URL,
    items: {},
  }
}

function saveManifest(manifest) {
  const sortedItems = Object.keys(manifest.items)
    .sort()
    .reduce((acc, key) => {
      acc[key] = manifest.items[key]
      return acc
    }, {})

  const output = {
    version: manifest.version || INTENSIVE_AUDIO_VERSION,
    base: manifest.base || INTENSIVE_AUDIO_BASE_URL,
    items: sortedItems,
  }

  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true })
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8')
  return output
}

/**
 * Audio concatenation note:
 * Each sentence is synthesized with Google Chirp 3 HD fr-CA (audioEncoding: MP3, sampleRateHertz: 24000).
 * Concatenating valid MP3 buffers directly produces smooth playback in all browsers,
 * preserving exact timing alignment without synthetic silent frames.
 * The duration of each sentence is parsed directly from MPEG-2 Layer III frame headers.
 */
async function runDryRun(tasks, config) {
  console.log('=== Intensive Listening Audio Generator (DRY RUN) ===')
  console.log(`Speaking rate: ${config.rate}`)
  console.log(`Male voice: ${DEFAULT_MALE_VOICE}`)
  console.log(`Female voice: ${DEFAULT_FEMALE_VOICE}`)
  console.log(`Total passages matched: ${tasks.length}\n`)

  let totalChars = 0
  let totalSentences = 0

  for (let i = 0; i < tasks.length; i++) {
    const { passage, key, objectPath, sentencesWithVoices } = tasks[i]
    console.log(`[${i + 1}/${tasks.length}] [${passage.level}] ${passage.id} — "${passage.title}" (${passage.sentences.length} sentences)`)
    console.log(`   Key: ${key}`)
    console.log(`   Object: ${objectPath}`)
    console.log(`   Public URL: ${INTENSIVE_AUDIO_BASE_URL}/${objectPath}`)

    for (let sIdx = 0; sIdx < sentencesWithVoices.length; sIdx++) {
      const s = sentencesWithVoices[sIdx]
      totalSentences++
      totalChars += s.text.length
      console.log(`     #${sIdx + 1} [Speaker ${s.speaker} -> ${s.voice}]: "${s.text}" (${s.text.length} chars)`)
    }
    console.log('')
  }

  console.log('--- Dry Run Summary ---')
  console.log(`Passages: ${tasks.length}`)
  console.log(`Total sentences: ${totalSentences}`)
  console.log(`Total characters: ${totalChars}`)
  console.log('No network requests made. No files modified.')
}

async function main() {
  const config = parseArgs()
  let selected = INTENSIVE_PASSAGES

  if (config.only) {
    selected = selected.filter((p) => p.id === config.only)
    if (selected.length === 0) {
      console.error(`Error: No passage found with id "${config.only}".`)
      process.exit(1)
    }
  }

  if (typeof config.limit === 'number' && config.limit > 0) {
    selected = selected.slice(0, config.limit)
  }

  const tasks = selected.map((passage) => {
    const key = computeIntensiveKey(passage, { rate: config.rate })
    const objectPath = computeIntensiveObjectPath(key, INTENSIVE_AUDIO_VERSION)
    const sentencesWithVoices = passage.sentences.map((sentence, index) => {
      const voice = assignPassageSentenceVoice(passage, sentence)
      return {
        index,
        speaker: sentence.speaker || 'A',
        voice,
        text: applyTtsSentenceFixes(sentence.fr),
      }
    })
    return { passage, key, objectPath, sentencesWithVoices }
  })

  if (config.dryRun) {
    await runDryRun(tasks, config)
    return
  }

  // Real execution (executed by supervisor with valid credentials)
  const {
    GoogleAuth,
    checkRemoteExists,
    getServiceAccountCredentials,
    synthesizeText,
    uploadAudio,
  } = await import('./google-cloud-shared.mjs')

  const creds = getServiceAccountCredentials()
  const auth = new GoogleAuth(creds)
  const manifest = loadExistingManifest()

  console.log('=== Intensive Listening Audio Generator ===')
  console.log(`Processing ${tasks.length} passages (speakingRate: ${config.rate})...`)

  let generatedCount = 0
  let skippedCount = 0
  let failedCount = 0
  let totalCharsUsed = 0

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { passage, key, objectPath, sentencesWithVoices } = task
    const publicUrl = `${INTENSIVE_AUDIO_BASE_URL}/${objectPath}`

    console.log(`\n[${i + 1}/${tasks.length}] Passage "${passage.id}" (${passage.sentences.length} sentences)...`)

    try {
      const existingEntry = manifest.items[passage.id]
      if (existingEntry && existingEntry.key === key && Array.isArray(existingEntry.segments)) {
        const exists = await checkRemoteExists(publicUrl)
        if (exists) {
          console.log(`  -> Already exists on remote and in manifest (${key}). Skipping.`)
          skippedCount++
          continue
        }
      }

      console.log(`  -> Synthesizing sentence by sentence...`)
      const sentenceBuffers = []
      const sentenceDurations = []

      for (const item of sentencesWithVoices) {
        totalCharsUsed += item.text.length
        const buf = await synthesizeText(auth, item.voice, 'fr-CA', item.text, {
          speakingRate: config.rate,
          sampleRateHertz: 24000,
          audioEncoding: 'MP3',
        })

        const meta = parseMp3Duration(buf)
        sentenceBuffers.push(buf)
        sentenceDurations.push(meta.duration)
      }

      // Compute sentence segments with 3 decimal precision
      let currentStart = 0
      const segments = sentenceDurations.map((dur) => {
        const start = Number(currentStart.toFixed(3))
        const end = Number((currentStart + dur).toFixed(3))
        currentStart = end
        return { start, end }
      })

      const combinedBuffer = concatenateMp3Buffers(sentenceBuffers)
      console.log(`  -> Total duration: ${currentStart.toFixed(3)}s, total buffer: ${combinedBuffer.length} bytes.`)

      console.log(`  -> Uploading to GCS: ${objectPath}...`)
      await uploadAudio(auth, objectPath, combinedBuffer, BUCKET_NAME)

      manifest.items[passage.id] = {
        key,
        segments,
      }
      saveManifest(manifest)
      generatedCount++
      console.log(`  -> Done! Manifest updated.`)
    } catch (err) {
      console.error(`  -> ERROR for passage "${passage.id}":`, err.message)
      failedCount++
    }
  }

  console.log('\n=== Generation Finished ===')
  console.log(`Generated: ${generatedCount}`)
  console.log(`Skipped:   ${skippedCount}`)
  console.log(`Failed:    ${failedCount}`)
  console.log(`Total characters synthesized: ${totalCharsUsed}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
