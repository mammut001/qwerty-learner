import { webcrypto } from 'node:crypto'

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const DEFAULT_TTL_SECONDS = 3600
const MAX_TTL_SECONDS = 86400
const KEY_REFETCH_THROTTLE_MS = 60000
const TIMEOUT_MS = 5000

function base64urlToBytes(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function base64urlToJson(str) {
  const bytes = base64urlToBytes(str)
  const text = new TextDecoder().decode(bytes)
  return JSON.parse(text)
}

export function createFirebaseVerifier({ projectId, fetchImpl = fetch, now = Date.now }) {
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('projectId is required')
  }

  let cachedJwks = null
  let inFlightFetch = null
  let lastRefetchAt = 0

  async function fetchJwks() {
    if (inFlightFetch) return inFlightFetch

    inFlightFetch = (async () => {
      let res
      try {
        res = await fetchImpl(JWKS_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      } catch {
        throw new Error('FIREBASE_KEYS_UNAVAILABLE')
      }

      if (!res || !res.ok) {
        throw new Error('FIREBASE_KEYS_UNAVAILABLE')
      }

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('FIREBASE_KEYS_UNAVAILABLE')
      }

      if (!data || !Array.isArray(data.keys)) {
        throw new Error('FIREBASE_KEYS_UNAVAILABLE')
      }

      let ttlSeconds = DEFAULT_TTL_SECONDS
      const cacheControl = res.headers?.get?.('cache-control') || ''
      const match = /max-age=(\d+)/i.exec(cacheControl)
      if (match) {
        const parsed = parseInt(match[1], 10)
        if (Number.isFinite(parsed) && parsed > 0) {
          ttlSeconds = Math.min(parsed, MAX_TTL_SECONDS)
        }
      }

      const currentTime = now()
      const keysMap = new Map()
      for (const k of data.keys) {
        if (k && typeof k.kid === 'string') {
          keysMap.set(k.kid, k)
        }
      }

      cachedJwks = {
        keys: keysMap,
        expiresAt: currentTime + ttlSeconds * 1000,
      }
      lastRefetchAt = currentTime
      return cachedJwks
    })().finally(() => {
      inFlightFetch = null
    })

    return inFlightFetch
  }

  async function getJwk(kid) {
    const currentTime = now()
    let key = null
    if (cachedJwks && currentTime < cachedJwks.expiresAt) {
      key = cachedJwks.keys.get(kid)
    }

    if (!key) {
      const cacheExpired = !cachedJwks || currentTime >= cachedJwks.expiresAt
      const canRefetch = currentTime - lastRefetchAt >= KEY_REFETCH_THROTTLE_MS
      if (cacheExpired || canRefetch) {
        const jwks = await fetchJwks()
        key = jwks.keys.get(kid)
      }
    }

    return key || null
  }

  return {
    async verify(idToken) {
      if (typeof idToken !== 'string' || idToken.length === 0 || idToken.length > 4096) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      const parts = idToken.split('.')
      if (parts.length !== 3) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      for (const part of parts) {
        if (!part || !/^[A-Za-z0-9_-]+$/.test(part)) {
          throw new Error('FIREBASE_TOKEN_INVALID')
        }
      }

      let header
      try {
        header = base64urlToJson(parts[0])
      } catch {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (!header || typeof header !== 'object' || header.alg !== 'RS256' || !header.kid || typeof header.kid !== 'string') {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      const jwk = await getJwk(header.kid)
      if (!jwk) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      const subtle = globalThis.crypto?.subtle || webcrypto?.subtle
      if (!subtle) {
        throw new Error('FIREBASE_KEYS_UNAVAILABLE')
      }

      let cryptoKey
      try {
        cryptoKey = jwk._cryptoKey || (await subtle.importKey(
          'jwk',
          jwk,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['verify']
        ))
        if (!jwk._cryptoKey) jwk._cryptoKey = cryptoKey
      } catch {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      let validSignature = false
      try {
        const dataBuffer = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
        const signatureBuffer = base64urlToBytes(parts[2])
        validSignature = await subtle.verify(
          'RSASSA-PKCS1-v1_5',
          cryptoKey,
          signatureBuffer,
          dataBuffer
        )
      } catch {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (!validSignature) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      let claims
      try {
        claims = base64urlToJson(parts[1])
      } catch {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (!claims || typeof claims !== 'object') {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      const expectedIss = `https://securetoken.google.com/${projectId}`
      if (claims.iss !== expectedIss) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (claims.aud !== projectId) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (typeof claims.sub !== 'string' || claims.sub.length === 0 || claims.sub.length > 128) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      const nowSec = Math.floor(now() / 1000)

      if (typeof claims.exp !== 'number' || claims.exp <= nowSec) {
        throw new Error('FIREBASE_TOKEN_EXPIRED')
      }

      if (typeof claims.iat !== 'number' || claims.iat > nowSec + 60) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (typeof claims.auth_time !== 'number' || claims.auth_time > nowSec + 60) {
        throw new Error('FIREBASE_TOKEN_INVALID')
      }

      if (nowSec - claims.auth_time > 15 * 60) {
        throw new Error('FIREBASE_TOKEN_EXPIRED')
      }

      if (claims.firebase?.sign_in_provider !== 'google.com') {
        throw new Error('FIREBASE_PROVIDER_NOT_ALLOWED')
      }

      if (!claims.email || typeof claims.email !== 'string' || claims.email_verified !== true) {
        throw new Error('FIREBASE_EMAIL_UNVERIFIED')
      }

      const uid = claims.sub
      const email = claims.email.toLowerCase().slice(0, 254)
      const name = typeof claims.name === 'string' ? claims.name.slice(0, 120) : ''
      const picture = typeof claims.picture === 'string' ? claims.picture.slice(0, 500) : ''

      return { uid, email, name, picture }
    },
  }
}
