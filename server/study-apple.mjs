import { createHash, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto'

// Verifies the id_token that Sign in with Apple returns through the form_post callback. We never exchange the
// authorization code (that would need the .p8 private key), so this check is the whole authentication step.
const JWKS_URL = 'https://appleid.apple.com/auth/keys'
const ISSUER = 'https://appleid.apple.com'
const DEFAULT_TTL_SECONDS = 3600
const MAX_TTL_SECONDS = 86400
const KEY_REFETCH_THROTTLE_MS = 60000
const TIMEOUT_MS = 5000
const CLOCK_SKEW_SECONDS = 60
const MAX_TOKEN_LENGTH = 8192

const sha256Hex = (value) => createHash('sha256').update(value).digest('hex')

function base64urlToBuffer(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function base64urlToJson(str) {
  return JSON.parse(base64urlToBuffer(str).toString('utf8'))
}

const isTrue = (value) => value === true || value === 'true'

/**
 * Nonce handling: the server sends Apple the value H = sha256hex(N) as the `nonce` parameter, where N is random
 * and never leaves the server. Apple copies H into the id_token unchanged. The caller stores only
 * nonceHash = sha256hex(H), and this verifier checks sha256hex(claims.nonce) against it in constant time.
 * The raw state, nonce and ticket values are therefore never stored, only their hashes.
 */
export function createAppleVerifier({ clientId, fetchImpl = fetch, now = Date.now } = {}) {
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('clientId is required')
  }

  let cachedKeys = null
  let inFlightFetch = null
  let lastRefetchAt = 0

  async function fetchKeys() {
    if (inFlightFetch) return inFlightFetch

    inFlightFetch = (async () => {
      let res
      try {
        res = await fetchImpl(JWKS_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      } catch {
        throw new Error('APPLE_KEYS_UNAVAILABLE')
      }
      if (!res || !res.ok) throw new Error('APPLE_KEYS_UNAVAILABLE')

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('APPLE_KEYS_UNAVAILABLE')
      }
      if (!data || !Array.isArray(data.keys)) throw new Error('APPLE_KEYS_UNAVAILABLE')

      let ttlSeconds = DEFAULT_TTL_SECONDS
      const cacheControl = res.headers?.get?.('cache-control') || ''
      const match = /max-age=(\d+)/i.exec(cacheControl)
      if (match) {
        const parsed = parseInt(match[1], 10)
        if (Number.isFinite(parsed) && parsed > 0) ttlSeconds = Math.min(parsed, MAX_TTL_SECONDS)
      }

      const currentTime = now()
      const keys = new Map()
      for (const jwk of data.keys) {
        if (jwk && jwk.kty === 'RSA' && typeof jwk.kid === 'string') keys.set(jwk.kid, jwk)
      }
      cachedKeys = { keys, expiresAt: currentTime + ttlSeconds * 1000 }
      lastRefetchAt = currentTime
      return cachedKeys
    })().finally(() => {
      inFlightFetch = null
    })

    return inFlightFetch
  }

  // Returns the JWK for kid. A cache miss refetches once, throttled, so a rotated key is picked up without
  // letting an attacker who sends random kids force a fetch on every request.
  async function getJwk(kid) {
    const currentTime = now()
    if (cachedKeys && currentTime < cachedKeys.expiresAt) {
      const cached = cachedKeys.keys.get(kid)
      if (cached) return cached
    }
    const cacheExpired = !cachedKeys || currentTime >= cachedKeys.expiresAt
    const canRefetch = currentTime - lastRefetchAt >= KEY_REFETCH_THROTTLE_MS
    if (cacheExpired || canRefetch) {
      const keys = await fetchKeys()
      return keys.keys.get(kid) || null
    }
    return null
  }

  return {
    async verify(idToken, { nonceHash } = {}) {
      if (typeof idToken !== 'string' || idToken.length === 0 || idToken.length > MAX_TOKEN_LENGTH) {
        throw new Error('APPLE_TOKEN_INVALID')
      }
      if (typeof nonceHash !== 'string' || !/^[a-f0-9]{64}$/.test(nonceHash)) {
        throw new Error('APPLE_TOKEN_INVALID')
      }

      const parts = idToken.split('.')
      if (parts.length !== 3) throw new Error('APPLE_TOKEN_INVALID')
      for (const part of parts) {
        if (!part || !/^[A-Za-z0-9_-]+$/.test(part)) throw new Error('APPLE_TOKEN_INVALID')
      }

      let header
      try {
        header = base64urlToJson(parts[0])
      } catch {
        throw new Error('APPLE_TOKEN_INVALID')
      }
      if (!header || typeof header !== 'object' || header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
        throw new Error('APPLE_TOKEN_INVALID')
      }

      const jwk = await getJwk(header.kid)
      if (!jwk) throw new Error('APPLE_TOKEN_INVALID')

      let publicKey
      try {
        publicKey = createPublicKey({ key: jwk, format: 'jwk' })
      } catch {
        throw new Error('APPLE_TOKEN_INVALID')
      }

      let validSignature = false
      try {
        validSignature = verifySignature(
          'sha256',
          Buffer.from(`${parts[0]}.${parts[1]}`),
          publicKey,
          base64urlToBuffer(parts[2]),
        )
      } catch {
        throw new Error('APPLE_TOKEN_INVALID')
      }
      if (!validSignature) throw new Error('APPLE_TOKEN_INVALID')

      let claims
      try {
        claims = base64urlToJson(parts[1])
      } catch {
        throw new Error('APPLE_TOKEN_INVALID')
      }
      if (!claims || typeof claims !== 'object') throw new Error('APPLE_TOKEN_INVALID')

      if (claims.iss !== ISSUER) throw new Error('APPLE_TOKEN_INVALID')
      if (claims.aud !== clientId) throw new Error('APPLE_TOKEN_INVALID')
      if (typeof claims.sub !== 'string' || claims.sub.length === 0 || claims.sub.length > 256) {
        throw new Error('APPLE_TOKEN_INVALID')
      }

      const nowSec = Math.floor(now() / 1000)
      if (typeof claims.exp !== 'number' || claims.exp <= nowSec) throw new Error('APPLE_TOKEN_EXPIRED')
      if (typeof claims.iat !== 'number' || claims.iat > nowSec + CLOCK_SKEW_SECONDS) throw new Error('APPLE_TOKEN_INVALID')

      if (typeof claims.nonce !== 'string') throw new Error('APPLE_TOKEN_INVALID')
      const presentedNonce = Buffer.from(sha256Hex(claims.nonce), 'hex')
      const expectedNonce = Buffer.from(nonceHash, 'hex')
      if (presentedNonce.length !== expectedNonce.length || !timingSafeEqual(presentedNonce, expectedNonce)) {
        throw new Error('APPLE_TOKEN_INVALID')
      }

      if (typeof claims.email !== 'string' || claims.email.length === 0 || claims.email.length > 254) {
        throw new Error('APPLE_EMAIL_MISSING')
      }
      if (!isTrue(claims.email_verified)) throw new Error('APPLE_EMAIL_UNVERIFIED')

      return {
        sub: claims.sub,
        email: claims.email.toLowerCase(),
        emailVerified: true,
        isPrivateEmail: isTrue(claims.is_private_email),
      }
    },
  }
}
