import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const DEFAULT_TTS_BUCKET = 'tcf-voice-tcf-canada-5b8c2'

export function getServiceAccountCredentials(customPath) {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const defaultPath = path.join(process.env.HOME || '', '.config/gcloud/tts-key.json')
  const keyPath = customPath || (envPath && fs.existsSync(envPath) ? envPath : defaultPath)

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Google service-account key not found at ${keyPath}`)
  }

  const content = fs.readFileSync(keyPath, 'utf8')
  return JSON.parse(content)
}

function base64Url(data) {
  return Buffer.from(data).toString('base64url')
}

export class GoogleAuth {
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

let lastRequestTime = 0
export const MIN_REQUEST_INTERVAL_MS = 250 // Max ~240 requests/min to respect GCP 300 RPM limit

export async function paceRequest(intervalMs = MIN_REQUEST_INTERVAL_MS) {
  const now = Date.now()
  const wait = Math.max(0, lastRequestTime + intervalMs - now)
  lastRequestTime = Math.max(now, lastRequestTime + intervalMs)
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait))
  }
}

export async function checkRemoteExists(publicUrl) {
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

export async function synthesizeText(
  auth,
  voiceName,
  accent,
  text,
  { speakingRate, sampleRateHertz, audioEncoding = 'MP3' } = {},
) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    await paceRequest()
    const token = await auth.getAccessToken()
    try {
      const audioConfig = { audioEncoding }
      if (typeof sampleRateHertz === 'number') audioConfig.sampleRateHertz = sampleRateHertz
      if (typeof speakingRate === 'number') audioConfig.speakingRate = speakingRate

      const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          input: text.startsWith('<speak>') ? { ssml: text } : { text },
          voice: {
            languageCode: accent,
            name: voiceName,
          },
          audioConfig,
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

export async function uploadAudio(auth, objectPath, audioBuf, bucketName = DEFAULT_TTS_BUCKET) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const token = await auth.getAccessToken()
    try {
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(
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
