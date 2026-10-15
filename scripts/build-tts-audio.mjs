#!/usr/bin/env node
import {
  TTS_VERSION,
  TTS_VOICES,
  TTS_BASE_URL,
  computeTtsKey,
  computeTtsObjectPath,
  speakableText,
  spokenTextFor,
} from '../src/utils/ttsKey.mjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DICT_DIR = path.resolve('public/dicts')
const TMP_DIR = path.resolve('.tmp')
const STATE_FILE = path.join(TMP_DIR, 'tts-state.json')
const MANIFEST_FILE = path.resolve('public/voice/tts-manifest.json')
const BUCKET_NAME = 'tcf-voice-tcf-canada-5b8c2'
const EXCLUDE_FILE = path.resolve('scripts/tts-exclude.json')

fs.mkdirSync(TMP_DIR, { recursive: true })
fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true })

export function loadExcludeList(filePath = EXCLUDE_FILE) {
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      if (Array.isArray(data)) {
        return new Set(data.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean))
      }
    } catch (err) {
      console.warn(`Could not read ${filePath}:`, err.message)
    }
  }
  return new Set()
}

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

function getServiceAccountCredentials() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const defaultPath = path.join(process.env.HOME || '', '.config/gcloud/tts-key.json')
  const keyPath = envPath && fs.existsSync(envPath) ? envPath : defaultPath

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Google service-account key not found at ${keyPath}`)
  }

  const content = fs.readFileSync(keyPath, 'utf8')
  return JSON.parse(content)
}

function base64Url(data) {
  return Buffer.from(data).toString('base64url')
}

class GoogleAuth {
  constructor(creds) {
    this.creds = creds
    this.token = null
    this.expiresAt = 0
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000)
    if (this.token && now < this.expiresAt - 300) {
      return this.token
    }

    const header = { alg: 'RS256', typ: 'JWT' }
    const claim = {
      iss: this.creds.client_email,
      sub: this.creds.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
    }

    const signInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(signInput)
    const signature = signer.sign(this.creds.private_key, 'base64url')
    const jwt = `${signInput}.${signature}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OAuth token fetch failed (${res.status}): ${errText}`)
    }

    const data = await res.json()
    this.token = data.access_token
    this.expiresAt = now + (data.expires_in || 3600)
    return this.token
  }
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
      if (data && data.objects) {
        for (const [k, obj] of Object.entries(data.objects)) {
          if (obj?.status === 'failed') {
            delete data.objects[k]
          }
        }
      }
      return data
    } catch {
      // Ignore corrupt state
    }
  }
  return { objects: {}, charactersUsed: 0 }
}

function saveState(state) {
  const tmp = `${STATE_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8')
  fs.renameSync(tmp, STATE_FILE)
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

async function checkRemoteExists(publicUrl) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(publicUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
      if (res.status === 200) return true
      if (res.status === 404) return false
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1000 * attempt))
        continue
      }
      return false
    } catch {
      if (attempt === 3) return false
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
  return false
}

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 250 // Max ~240 requests/min to respect GCP 300 RPM limit

async function paceRequest() {
  const now = Date.now()
  const wait = Math.max(0, lastRequestTime + MIN_REQUEST_INTERVAL_MS - now)
  lastRequestTime = Math.max(now, lastRequestTime + MIN_REQUEST_INTERVAL_MS)
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait))
  }
}

async function synthesizeText(auth, voiceName, accent, text) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    await paceRequest()
    const token = await auth.getAccessToken()
    try {
      const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: accent,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (res.status === 429 || res.status >= 500) {
        const headerRetry = Number(res.headers.get('retry-after')) || 0
        const backoffSec = Math.max(headerRetry, attempt * 5, 10)
        console.warn(`TTS ${res.status} rate-limited for "${text}", retrying in ${backoffSec}s (attempt ${attempt}/8)...`)
        await new Promise((r) => setTimeout(r, backoffSec * 1000))
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`TTS API failed (${res.status}): ${errText}`)
      }

      const data = await res.json()
      if (!data.audioContent) {
        throw new Error(`TTS response missing audioContent for "${text}"`)
      }

      return Buffer.from(data.audioContent, 'base64')
    } catch (err) {
      if (attempt === 8) throw err
      const backoffSec = attempt * 3
      await new Promise((r) => setTimeout(r, backoffSec * 1000))
    }
  }
  throw new Error(`TTS synthesis exceeded retries for "${text}"`)
}

async function uploadAudio(auth, objectPath, audioBuf) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const token = await auth.getAccessToken()
    try {
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(
        objectPath,
      )}`

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        body: audioBuf,
        signal: AbortSignal.timeout(25000),
      })

      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2
        console.warn(`GCS upload ${res.status} for "${objectPath}", retrying in ${retryAfter}s...`)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`GCS upload failed (${res.status}): ${errText}`)
      }

      return await res.json()
    } catch (err) {
      if (attempt === 5) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
  throw new Error(`GCS upload exceeded retries for "${objectPath}"`)
}

function updateManifest(state, tasks, isPartialRun = false, excludeSet = new Set()) {
  let manifest = {
    version: TTS_VERSION,
    base: TTS_BASE_URL,
    voices: { ...TTS_VOICES },
    keys: {
      'fr-CA': [],
      'fr-FR': [],
    },
  }

  const keySets = {
    'fr-CA': new Set(),
    'fr-FR': new Set(),
  }

  if (isPartialRun && fs.existsSync(MANIFEST_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
      if (existing.keys) {
        if (Array.isArray(existing.keys['fr-CA'])) {
          for (const k of existing.keys['fr-CA']) keySets['fr-CA'].add(k)
        }
        if (Array.isArray(existing.keys['fr-FR'])) {
          for (const k of existing.keys['fr-FR']) keySets['fr-FR'].add(k)
        }
      }
    } catch {
      // Ignore corrupt manifest
    }
  }

  for (const task of tasks) {
    if (excludeSet.has(task.text)) continue
    const obj = state.objects[task.objectPath]
    if (obj && (obj.status === 'exists' || obj.status === 'generated')) {
      if (keySets[task.accent]) {
        keySets[task.accent].add(task.key)
      }
    }
  }

  for (const text of excludeSet) {
    for (const acc of ['fr-CA', 'fr-FR']) {
      const voice = TTS_VOICES[acc]
      if (voice) {
        const key = computeTtsKey(voice, text, acc)
        keySets[acc].delete(key)
      }
    }
  }

  manifest.keys['fr-CA'] = Array.from(keySets['fr-CA']).sort()
  manifest.keys['fr-FR'] = Array.from(keySets['fr-FR']).sort()

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  return manifest
}

async function main() {
  const { limit, accent, concurrency } = parseArgs()
  const creds = getServiceAccountCredentials()
  const auth = new GoogleAuth(creds)
  const state = loadState()
  const excludeSet = loadExcludeList()

  const rawTexts = collectDictNames()
  const allTexts = rawTexts.filter((t) => !excludeSet.has(t))
  console.log(`Collected ${rawTexts.length} unique texts from ${DICT_DIR} (${excludeSet.size} excluded, ${allTexts.length} active)`)

  const selectedTexts = limit ? allTexts.slice(0, limit) : allTexts
  const targetAccents = accent ? [accent] : ['fr-CA', 'fr-FR']

  console.log(`Processing ${selectedTexts.length} texts across accent(s): ${targetAccents.join(', ')} (concurrency: ${concurrency})`)

  const tasks = []
  for (const text of selectedTexts) {
    for (const acc of targetAccents) {
      const voice = TTS_VOICES[acc]
      if (!voice) {
        throw new Error(`Unknown accent: ${acc}`)
      }
      const key = computeTtsKey(voice, text, acc)
      const objectPath = computeTtsObjectPath(acc, key)
      tasks.push({ accent: acc, voice, text, key, objectPath })
    }
  }

  console.log(`Total tasks to check/generate: ${tasks.length}`)

  let generatedCount = 0
  let skippedCount = 0
  let failedCount = 0
  let batchCharsUsed = 0
  let completed = 0

  let index = 0
  let lastSave = Date.now()

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++
      const task = tasks[taskIndex]
      const { accent: acc, voice, text, key, objectPath } = task
      const publicUrl = `${TTS_BASE_URL}/${objectPath}`

      try {
        const cached = state.objects[objectPath]
        if (cached && (cached.status === 'exists' || cached.status === 'generated')) {
          skippedCount++
          completed++
          if (completed % 50 === 0 || completed === tasks.length) {
            console.log(
              `[${completed}/${tasks.length}] Progress: ${generatedCount} gen, ${skippedCount} skip, ${failedCount} fail (${batchCharsUsed} chars)`,
            )
          }
          continue
        }

        const remoteExists = await checkRemoteExists(publicUrl)
        if (remoteExists) {
          state.objects[objectPath] = {
            status: 'exists',
            key,
            accent: acc,
            text,
            characters: text.length,
            updatedAt: new Date().toISOString(),
          }
          skippedCount++
          completed++
          if (completed % 50 === 0 || completed === tasks.length) {
            console.log(
              `[${completed}/${tasks.length}] Progress: ${generatedCount} gen, ${skippedCount} skip, ${failedCount} fail (${batchCharsUsed} chars)`,
            )
          }
          continue
        }

        const spoken = spokenTextFor(text, acc)
        const audioBuf = await synthesizeText(auth, voice, acc, spoken)
        await uploadAudio(auth, objectPath, audioBuf)

        const chars = spoken.length
        batchCharsUsed += chars
        state.charactersUsed = (state.charactersUsed || 0) + chars
        state.objects[objectPath] = {
          status: 'generated',
          key,
          accent: acc,
          text,
          characters: chars,
          updatedAt: new Date().toISOString(),
        }
        generatedCount++
        completed++

        if (tasks.length <= 50 || completed % 100 === 0 || completed === tasks.length) {
          console.log(
            `[${completed}/${tasks.length}] Progress: ${generatedCount} gen, ${skippedCount} skip, ${failedCount} fail (${batchCharsUsed} chars)`,
          )
        }

        if (Date.now() - lastSave > 5000) {
          saveState(state)
          lastSave = Date.now()
        }
      } catch (err) {
        failedCount++
        completed++
        console.error(`[${completed}/${tasks.length}] FAILED [${acc}] "${text}": ${err.message}`)
        state.objects[objectPath] = {
          status: 'failed',
          key,
          accent: acc,
          text,
          error: err.message,
          updatedAt: new Date().toISOString(),
        }
      }
    }
  }

  const pool = Array.from({ length: concurrency }, () => worker())
  await Promise.all(pool)

  saveState(state)
  const isPartialRun = Boolean(limit || accent)
  const manifest = updateManifest(state, tasks, isPartialRun, excludeSet)

  console.log('\n--- Final Summary ---')
  console.log(`Tasks: ${tasks.length}`)
  console.log(`Generated: ${generatedCount}`)
  console.log(`Skipped (already exists): ${skippedCount}`)
  console.log(`Failed: ${failedCount}`)
  console.log(`Batch characters used: ${batchCharsUsed}`)
  console.log(`Total state characters used: ${state.charactersUsed || 0}`)
  console.log(`Manifest keys: fr-CA=${manifest.keys['fr-CA'].length}, fr-FR=${manifest.keys['fr-FR'].length}`)
  console.log(`Manifest written to: ${MANIFEST_FILE}`)

  if (failedCount > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Fatal error in build-tts-audio:', err)
  process.exit(1)
})
