#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// If not running under the repository's TS loader, re-exec with the loader so TS imports resolve seamlessly.
const isUnderTsLoader = process.execArgv.some((arg) => arg.includes('ts-extension-loader.mjs'))
if (!isUnderTsLoader) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const loaderPath = path.join(repoRoot, 'server/ts-extension-loader.mjs')
  const scriptPath = fileURLToPath(import.meta.url)
  const args = ['--experimental-loader', loaderPath, '--experimental-strip-types', scriptPath, ...process.argv.slice(2)]
  const child = spawnSync(process.execPath, args, { stdio: 'inherit' })
  process.exit(child.status ?? 0)
}

// Below runs under ts-extension-loader.
const {
  DEFAULT_SPEAKING_RATE,
  DEFAULT_VOICE_A,
  DEFAULT_VOICE_B,
  TCF_LISTENING_BASE_URL,
  TCF_LISTENING_VERSION,
  applyTtsSentenceFixes,
  computeListeningKeyForQuestion,
  computeListeningObjectPath,
  getQuestionTurns,
} = await import('../src/utils/tcfListeningAudioKey.mjs')
const { findMissingElisionCombos } = await import('../src/utils/ttsSsml.mjs')

const { TCF_LISTENING_QUESTIONS } = await import('../src/resources/tcfMock.ts')
const { TCF_LISTENING_SET_B } = await import('../src/resources/tcfMockSetB.ts')

const MANIFEST_FILE = path.resolve('public/voice/tcf-listening-manifest.json')
const BUCKET_NAME = 'tcf-voice-tcf-canada-5b8c2'

function parseArgs() {
  const args = process.argv.slice(2)
  let dryRun = false
  let limit = null
  let only = null
  let voiceA = DEFAULT_VOICE_A
  let voiceB = DEFAULT_VOICE_B
  let rate = DEFAULT_SPEAKING_RATE
  let concurrency = 4
  let allowMissing = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--allow-missing') {
      allowMissing = true
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice('--limit='.length), 10)
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[++i], 10)
    } else if (arg.startsWith('--only=')) {
      only = arg.slice('--only='.length).trim()
    } else if (arg === '--only' && i + 1 < args.length) {
      only = args[++i].trim()
    } else if (arg.startsWith('--voice-a=')) {
      voiceA = arg.slice('--voice-a='.length).trim()
    } else if (arg === '--voice-a' && i + 1 < args.length) {
      voiceA = args[++i].trim()
    } else if (arg.startsWith('--voice-b=')) {
      voiceB = arg.slice('--voice-b='.length).trim()
    } else if (arg === '--voice-b' && i + 1 < args.length) {
      voiceB = args[++i].trim()
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

  return { dryRun, limit, only, voiceA, voiceB, rate, concurrency, allowMissing }
}

export function collectListeningQuestions() {
  const setA = (TCF_LISTENING_QUESTIONS || []).map((q) => ({ ...q, set: 'A' }))
  const setB = (TCF_LISTENING_SET_B || []).map((q) => ({ ...q, set: 'B' }))
  return [...setA, ...setB]
}

function loadExistingManifest() {
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
      if (parsed && typeof parsed.items === 'object' && parsed.items !== null) {
        return parsed
      }
    } catch {
      // Ignore corrupt manifest
    }
  }
  return {
    version: TCF_LISTENING_VERSION,
    base: TCF_LISTENING_BASE_URL,
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
    version: manifest.version || TCF_LISTENING_VERSION,
    base: manifest.base || TCF_LISTENING_BASE_URL,
    items: sortedItems,
  }

  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true })
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8')
  return output
}

/**
 * Note on joining dialogue turns:
 * Google Chirp 3 HD voices do not support SSML pause tags (<break time="450ms"/>).
 * Concatenating valid MP3 byte streams synthesized with the exact same encoder settings
 * (audioEncoding: MP3, sampleRateHertz: 24000) produces standard concatenated MP3 frames.
 * HTMLAudioElement, mobile browsers, and native audio decoders decode these smoothly,
 * preserving natural conversational cadence between speakers.
 */
function concatenateMp3Buffers(buffers) {
  return Buffer.concat(buffers)
}

async function runDryRun(tasks, config) {
  console.log(`=== TCF Listening Audio Generator (DRY RUN) ===`)
  console.log(`Voices: Turn A = ${config.voiceA}, Turn B = ${config.voiceB}`)
  console.log(`Speaking rate: ${config.rate}`)
  console.log(`Total questions matched: ${tasks.length}\n`)

  let totalChars = 0
  let totalTurns = 0
  let dialogueCount = 0
  let monologueCount = 0

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { question, turns, key, objectPath } = task
    const isDialogue = turns.length > 1
    if (isDialogue) dialogueCount++
    else monologueCount++

    console.log(
      `[${i + 1}/${tasks.length}] [${question.set}:${question.id}] type=${question.type} (${turns.length} turn${
        turns.length > 1 ? 's' : ''
      })`,
    )
    console.log(`   Key: ${key}`)
    console.log(`   Object: ${objectPath}`)
    console.log(`   Public URL: ${TCF_LISTENING_BASE_URL}/${objectPath}`)

    for (const turn of turns) {
      totalTurns++
      totalChars += turn.text.length
      console.log(`     Turn ${turn.index} [${turn.voice}]: "${turn.text}" (${turn.text.length} chars)`)
    }
    console.log('')
  }

  console.log('--- Dry Run Summary ---')
  console.log(`Questions: ${tasks.length} (${dialogueCount} dialogues, ${monologueCount} monologues)`)
  console.log(`Total turns: ${totalTurns}`)
  console.log(`Total characters: ${totalChars}`)
  console.log('No network requests made. No files modified.')
}

async function main() {
  const config = parseArgs()
  const allQuestions = collectListeningQuestions()

  let selected = allQuestions
  if (config.only) {
    selected = selected.filter((q) => q.id === config.only || `${q.set}:${q.id}` === config.only)
    if (selected.length === 0) {
      console.error(`Error: No listening question found with id "${config.only}".`)
      process.exit(1)
    }
  }

  if (typeof config.limit === 'number' && config.limit > 0) {
    selected = selected.slice(0, config.limit)
  }

  const tasks = selected.map((question) => {
    const turns = getQuestionTurns(question, config.voiceA, config.voiceB)
    const key = computeListeningKeyForQuestion(question, {
      version: TCF_LISTENING_VERSION,
      rate: config.rate,
      voiceA: config.voiceA,
      voiceB: config.voiceB,
    })
    const objectPath = computeListeningObjectPath(key, TCF_LISTENING_VERSION)
    return { question, turns, key, objectPath }
  })

  // Refuse if any question contains an elision combo whose dictionary IPA is empty
  const questionsWithMissing = []
  for (const task of tasks) {
    const missing = findMissingElisionCombos(task.question.audioText || '')
    if (missing.length > 0) {
      questionsWithMissing.push({ id: task.question.id, missing })
    }
  }

  if (questionsWithMissing.length > 0) {
    console.error(`Refusing synthesis: ${questionsWithMissing.length} questions contain elision combos with empty dictionary IPA:`)
    for (const q of questionsWithMissing) {
      console.error(`  - Question "${q.id}": [${q.missing.join(', ')}]`)
    }
    if (!config.allowMissing) {
      console.error('Use --allow-missing to synthesize anyway.')
      process.exit(1)
    }
  }

  if (config.dryRun) {
    await runDryRun(tasks, config)
    return
  }

  // Real execution (run by supervisor with valid credentials)
  const { GoogleAuth, checkRemoteExists, getServiceAccountCredentials, synthesizeText, uploadAudio } = await import(
    './google-cloud-shared.mjs'
  )

  const creds = getServiceAccountCredentials()
  const auth = new GoogleAuth(creds)
  const manifest = loadExistingManifest()

  console.log(`=== TCF Listening Audio Generator ===`)
  console.log(`Processing ${tasks.length} questions (concurrency: ${config.concurrency})...`)

  let generatedCount = 0
  let skippedCount = 0
  let failedCount = 0
  let totalCharsUsed = 0
  let completed = 0
  let taskIndex = 0

  async function worker() {
    while (taskIndex < tasks.length) {
      const current = tasks[taskIndex++]
      const { question, turns, key, objectPath } = current
      const publicUrl = `${TCF_LISTENING_BASE_URL}/${objectPath}`

      try {
        // If manifest already has this question mapping to the key AND GCS object exists, skip
        if (manifest.items[question.id] === key) {
          const exists = await checkRemoteExists(publicUrl)
          if (exists) {
            skippedCount++
            completed++
            if (completed % 10 === 0 || completed === tasks.length) {
              console.log(`[${completed}/${tasks.length}] Progress: ${generatedCount} gen, ${skippedCount} skip, ${failedCount} fail`)
            }
            continue
          }
        }

        // Check if remote object already exists on GCS (e.g. from prior partial run)
        const remoteExists = await checkRemoteExists(publicUrl)
        if (remoteExists) {
          manifest.items[question.id] = key
          skippedCount++
          completed++
          if (completed % 10 === 0 || completed === tasks.length) {
            console.log(`[${completed}/${tasks.length}] Progress: ${generatedCount} gen, ${skippedCount} skip, ${failedCount} fail`)
          }
          continue
        }

        // Synthesize each turn
        const turnBuffers = []
        let questionChars = 0
        for (const turn of turns) {
          const audioBuf = await synthesizeText(auth, turn.voice, 'fr-CA', turn.text, {
            speakingRate: config.rate,
            sampleRateHertz: 24000,
            audioEncoding: 'MP3',
          })
          turnBuffers.push(audioBuf)
          questionChars += turn.text.length
        }

        const combinedAudio = concatenateMp3Buffers(turnBuffers)
        await uploadAudio(auth, objectPath, combinedAudio, BUCKET_NAME)

        manifest.items[question.id] = key
        totalCharsUsed += questionChars
        generatedCount++
        completed++

        console.log(
          `[${completed}/${tasks.length}] Generated [${question.id}] (${turns.length} turn${
            turns.length > 1 ? 's' : ''
          }, ${questionChars} chars) -> ${objectPath}`,
        )

        // Save manifest incrementally
        saveManifest(manifest)
      } catch (err) {
        failedCount++
        completed++
        console.error(`[${completed}/${tasks.length}] FAILED [${question.id}]: ${err.message}`)
      }
    }
  }

  const pool = Array.from({ length: config.concurrency }, () => worker())
  await Promise.all(pool)

  const finalManifest = saveManifest(manifest)
  console.log('\n--- Final Summary ---')
  console.log(`Tasks: ${tasks.length}`)
  console.log(`Generated: ${generatedCount}`)
  console.log(`Skipped: ${skippedCount}`)
  console.log(`Failed: ${failedCount}`)
  console.log(`Total characters: ${totalCharsUsed}`)
  console.log(`Manifest items count: ${Object.keys(finalManifest.items).length}`)
  console.log(`Manifest written to: ${MANIFEST_FILE}`)

  if (failedCount > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Fatal error in build-tcf-listening-audio:', err)
  process.exit(1)
})
