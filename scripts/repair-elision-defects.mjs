#!/usr/bin/env node
import { TTS_VOICES } from '../src/utils/ttsKey.mjs'
import { checkElisionDefect, computeSimilarity, normalise } from './find-elision-defects.mjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const TMP_DIR = path.resolve('.tmp')
const CANDIDATE_AUDIO_DIR = path.join(TMP_DIR, 'candidate-audio')
const DEFECTS_FILE = path.join(TMP_DIR, 'elision-defects.json')
const REPAIR_STATE_FILE = path.join(TMP_DIR, 'repair-state.json')
const OVERRIDES_FILE = path.resolve('src/utils/ttsSpokenOverrides.json')

fs.mkdirSync(CANDIDATE_AUDIO_DIR, { recursive: true })

export const ELISION_REMOVE_APOS_REGEX = /\b(l|d|j|m|t|s|c|n|qu|jusqu|lorsqu|puisqu)['’]([\p{L}])/giu

export function generateCandidateSpokenText(name) {
  return name.replace(new RegExp(ELISION_REMOVE_APOS_REGEX.source, 'giu'), '$1$2')
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

async function synthesizeText(auth, voiceName, accent, text) {
  for (let attempt = 1; attempt <= 5; attempt++) {
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
        signal: AbortSignal.timeout(20000),
      })

      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1000 * attempt))
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`TTS API failed (${res.status}): ${errText}`)
      }

      const data = await res.json()
      return Buffer.from(data.audioContent, 'base64')
    } catch (err) {
      if (attempt === 5) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

async function transcribeBuffer(apiKey, audioBuf) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.deepgram.com/v1/listen?language=fr&model=nova-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          Authorization: `Token ${apiKey}`,
        },
        body: audioBuf,
        signal: AbortSignal.timeout(20000),
      })

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500 * attempt))
        continue
      }

      if (!res.ok) {
        throw new Error(`Deepgram API failed (${res.status})`)
      }

      const data = await res.json()
      return data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    } catch (err) {
      if (attempt === 4) {
        console.warn('Transcription failed:', err.message)
        return null
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

async function main() {
  if (!fs.existsSync(DEFECTS_FILE)) {
    throw new Error(`Defects file not found at ${DEFECTS_FILE}. Run find-elision-defects.mjs first.`)
  }

  const defectsData = JSON.parse(fs.readFileSync(DEFECTS_FILE, 'utf8'))
  const defects = defectsData.defects || []
  console.log(`Loaded ${defects.length} defect entries from ${DEFECTS_FILE}`)

  const creds = getServiceAccountCredentials()
  const auth = new GoogleAuth(creds)
  const apiKey = getDeepgramApiKey()

  let repairState = {}
  if (fs.existsSync(REPAIR_STATE_FILE)) {
    try {
      repairState = JSON.parse(fs.readFileSync(REPAIR_STATE_FILE, 'utf8'))
    } catch {
      repairState = {}
    }
  }

  const acceptedOverrides = {}
  const failedRepairs = []

  for (const defect of defects) {
    const { name, brokenAccents } = defect
    const candidateText = generateCandidateSpokenText(name)

    for (const accent of brokenAccents) {
      const stateKey = `${accent}:${name}`
      const voice = TTS_VOICES[accent]
      console.log(`\nEvaluating [${accent}] "${name}" -> candidate: "${candidateText}"`)

      let evalResult = repairState[stateKey]
      if (!evalResult) {
        // Synthesise candidate audio
        const audioBuf = await synthesizeText(auth, voice, accent, candidateText)
        const safeName = name.replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, '_').slice(0, 40)
        const audioFilePath = path.join(CANDIDATE_AUDIO_DIR, `${accent}_${safeName}.mp3`)
        fs.writeFileSync(audioFilePath, audioBuf)

        // Transcribe with Deepgram nova-3
        const transcript = await transcribeBuffer(apiKey, audioBuf)

        // Acceptance evaluation:
        // 1. The elision letter no longer appears standalone
        // 2. Normalised transcript is close to the normalised source (treating "lâge" ≈ "l'âge" by comparing with apostrophes removed)
        const check = checkElisionDefect(name, transcript)
        const normSource = normalise(candidateText)
        const normTrans = normalise(transcript)
        const similarity = computeSimilarity(normSource, normTrans)

        const accepted = !check.broken && similarity >= 0.7

        evalResult = {
          name,
          accent,
          candidateText,
          transcript,
          similarity,
          audioFilePath,
          accepted,
          reason: accepted ? 'accepted' : check.broken ? check.reason : `low_similarity (${(similarity * 100).toFixed(1)}%)`,
        }

        repairState[stateKey] = evalResult
        fs.writeFileSync(REPAIR_STATE_FILE, JSON.stringify(repairState, null, 2), 'utf8')
      }

      console.log(`  Candidate transcript: "${evalResult.transcript}" (similarity: ${(evalResult.similarity * 100).toFixed(1)}%)`)
      console.log(`  Result: ${evalResult.accepted ? 'ACCEPTED' : 'REJECTED (' + evalResult.reason + ')'}`)

      if (evalResult.accepted) {
        if (!acceptedOverrides[name]) acceptedOverrides[name] = {}
        acceptedOverrides[name][accent] = candidateText
      } else {
        failedRepairs.push({
          name,
          accent,
          candidateText,
          transcript: evalResult.transcript,
          reason: evalResult.reason,
        })
      }
    }
  }

  // Sort keys in overrides
  const sortedOverrides = {}
  for (const key of Object.keys(acceptedOverrides).sort()) {
    sortedOverrides[key] = acceptedOverrides[key]
  }

  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(sortedOverrides, null, 2) + '\n', 'utf8')
  console.log(`\nSaved accepted overrides to ${OVERRIDES_FILE}`)

  const mjsFile = path.resolve('src/utils/ttsSpokenOverrides.mjs')
  fs.writeFileSync(
    mjsFile,
    `// Auto-generated module for seamless compatibility across Node.js ESM, TypeScript 4.0, and Vite browser bundling.\n// Canonical source of truth: src/utils/ttsSpokenOverrides.json\n\nexport default ${JSON.stringify(sortedOverrides, null, 2)}\n`,
    'utf8',
  )
  console.log(`Saved companion module to ${mjsFile}`)

  console.log('\n========================================')
  console.log('         REPAIR SUMMARY                 ')
  console.log('========================================')
  console.log(`Total broken defect entries: ${defects.length}`)
  console.log(`Repaired entries: ${Object.keys(sortedOverrides).length}`)
  console.log(`Unrepaired entries/accents: ${failedRepairs.length}`)

  console.log('\n--- Repaired List ---')
  for (const [name, accs] of Object.entries(sortedOverrides)) {
    console.log(`- "${name}":`)
    for (const [acc, spoken] of Object.entries(accs)) {
      console.log(`    ${acc}: "${spoken}"`)
    }
  }

  console.log('\n--- Unrepaired List ---')
  for (const f of failedRepairs) {
    console.log(`- [${f.accent}] "${f.name}": candidate "${f.candidateText}" failed ("${f.transcript}" - ${f.reason})`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('Fatal error in repair-elision-defects:', err)
    process.exit(1)
  })
}
