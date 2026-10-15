#!/usr/bin/env node
// Mirrors every pronunciation clip the French voice feature can play onto local disk.
//
//   node scripts/sync-voice-mirror.mjs --dir <targetDir> [--concurrency 8]
//
// Layout written under <targetDir> (served same-origin at /voice-audio/):
//   v1/<accent>/<key>.mp3            from the GCS TTS bucket (public/voice/tts-manifest.json)
//   ll/<decoded file name>           from Lingua Libre / Wikimedia (public/voice/fr-overrides.json)
//
// Existing non-empty files are skipped. Downloads go to "<file>.part" and are renamed when complete.
import { mirrorOverrideFileName, mirrorTtsPath } from '../src/utils/voiceMirror.mjs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const USER_AGENT = 'tcf-canada-voice-mirror/1.0 (https://french.paytonpei.top)'
const MAX_RETRIES = 5
const PROGRESS_EVERY = 200
const DEFAULT_CONCURRENCY = 8

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TTS_MANIFEST = path.join(repoRoot, 'public/voice/tts-manifest.json')
const OVERRIDES = path.join(repoRoot, 'public/voice/fr-overrides.json')

function parseArgs(argv) {
  const args = { dir: null, concurrency: DEFAULT_CONCURRENCY }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dir') {
      args.dir = argv[++i]
    } else if (arg === '--concurrency') {
      args.concurrency = Number(argv[++i])
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (!args.dir) throw new Error('Missing required --dir <targetDir>')
  if (!Number.isInteger(args.concurrency) || args.concurrency < 1) {
    throw new Error('--concurrency must be a positive integer')
  }
  return args
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

/**
 * Builds the full list of { source, target } pairs, deduplicated by target path.
 */
async function buildJobs(targetDir) {
  const jobs = new Map()
  const add = (source, relativeTarget) => {
    const target = path.join(targetDir, relativeTarget)
    if (!jobs.has(target)) jobs.set(target, { source, target, label: relativeTarget })
  }

  const manifest = await readJson(TTS_MANIFEST)
  const base = String(manifest.base || '').replace(/\/+$/, '')
  for (const accent of Object.keys(manifest.keys || {})) {
    for (const key of manifest.keys[accent] || []) {
      const rel = mirrorTtsPath(accent, key)
      add(`${base}/${rel}`, rel)
    }
  }

  const overrides = await readJson(OVERRIDES)
  for (const [word, override] of Object.entries(overrides.words || {})) {
    if (!override || !override.audio) continue
    // The on-disk name is the decoded file name (mirrorOverridePath only encodes it for URLs).
    const fileName = mirrorOverrideFileName(override.audio)
    if (!fileName) {
      console.warn(`skip override "${word}": cannot derive file name from ${override.audio}`)
      continue
    }
    add(override.audio, path.posix.join('ll', fileName))
  }

  return [...jobs.values()]
}

async function fileSize(file) {
  try {
    const stat = await fs.stat(file)
    return stat.size
  } catch {
    return 0
  }
}

const RETRYABLE_STATUS = (status) => status === 429 || status >= 500

async function downloadOnce(source) {
  const response = await fetch(source, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.5' },
    redirect: 'follow',
  })
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`)
    error.retryable = RETRYABLE_STATUS(response.status)
    throw error
  }
  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  if (!contentType.startsWith('audio/') && !contentType.startsWith('application/octet-stream')) {
    const error = new Error(`unexpected content-type "${contentType || 'none'}"`)
    error.retryable = false
    throw error
  }
  const body = Buffer.from(await response.arrayBuffer())
  if (body.length === 0) {
    const error = new Error('empty response body')
    error.retryable = true
    throw error
  }
  return body
}

async function downloadWithRetry(source) {
  let lastError
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await downloadOnce(source)
    } catch (error) {
      lastError = error
      // Network errors (no .retryable flag) are retried; HTTP 4xx other than 429 are not.
      const retryable = error.retryable !== false
      if (!retryable || attempt === MAX_RETRIES) break
      const delay = Math.min(30_000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 250)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

async function processJob(job) {
  if ((await fileSize(job.target)) > 0) return 'skipped'
  await fs.mkdir(path.dirname(job.target), { recursive: true })
  const partFile = `${job.target}.part`
  try {
    const body = await downloadWithRetry(job.source)
    await fs.writeFile(partFile, body)
    await fs.rename(partFile, job.target)
    return 'downloaded'
  } catch (error) {
    await fs.rm(partFile, { force: true }).catch(() => {})
    throw error
  }
}

async function main() {
  const { dir, concurrency } = parseArgs(process.argv.slice(2))
  const targetDir = path.resolve(dir)
  const jobs = await buildJobs(targetDir)
  console.log(`voice mirror: ${jobs.length} files -> ${targetDir} (concurrency ${concurrency})`)

  const counts = { downloaded: 0, skipped: 0 }
  const failed = []
  let processed = 0
  let next = 0

  const report = () => {
    processed += 1
    if (processed % PROGRESS_EVERY === 0 || processed === jobs.length) {
      console.log(
        `progress ${processed}/${jobs.length} (downloaded ${counts.downloaded}, skipped ${counts.skipped}, failed ${failed.length})`,
      )
    }
  }

  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next]
      next += 1
      try {
        counts[await processJob(job)] += 1
      } catch (error) {
        failed.push({ source: job.source, label: job.label, reason: error.message })
        console.error(`FAILED ${job.source}: ${error.message}`)
      }
      report()
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker()))

  console.log('')
  console.log('summary')
  console.log(`  total:      ${jobs.length}`)
  console.log(`  downloaded: ${counts.downloaded}`)
  console.log(`  skipped:    ${counts.skipped}`)
  console.log(`  failed:     ${failed.length}`)
  for (const item of failed) {
    console.log(`    - ${item.source} (${item.reason})`)
  }
  return failed.length === 0 ? 0 : 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
    .then((code) => {
      process.exitCode = code
    })
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
