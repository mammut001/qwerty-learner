import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createFirebaseVerifier } from './study-firebase.mjs'

const projectId = 'tcf-canada-5b8c2'

function toBase64Url(objOrBuf) {
  const buf = Buffer.isBuffer(objOrBuf)
    ? objOrBuf
    : Buffer.from(typeof objOrBuf === 'string' ? objOrBuf : JSON.stringify(objOrBuf))
  return buf.toString('base64url')
}

async function createTestKey(kid = 'test-kid-1') {
  const keyPair = await globalThis.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )
  const jwk = await globalThis.crypto.subtle.exportKey('jwk', keyPair.publicKey)
  jwk.kid = kid
  jwk.alg = 'RS256'
  return { keyPair, jwk, kid }
}

async function makeToken(header, payload, privateKey) {
  const headB64 = toBase64Url(header)
  const payB64 = toBase64Url(payload)
  const data = new TextEncoder().encode(`${headB64}.${payB64}`)
  const sigBuf = await globalThis.crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, data)
  const sigB64 = Buffer.from(sigBuf).toString('base64url')
  return `${headB64}.${payB64}.${sigB64}`
}

function baseClaims(nowSec = Math.floor(Date.now() / 1000)) {
  return {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    sub: 'user-uid-123',
    exp: nowSec + 3600,
    iat: nowSec,
    auth_time: nowSec - 60,
    email: 'Test.User@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/avatar.png',
    firebase: {
      sign_in_provider: 'google.com',
    },
  }
}

test('Firebase verifier verifies valid token and returns normalized user', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  const token = await makeToken(
    { alg: 'RS256', kid: key.kid },
    baseClaims(nowSec),
    key.keyPair.privateKey,
  )

  const user = await verifier.verify(token)
  assert.deepEqual(user, {
    uid: 'user-uid-123',
    email: 'test.user@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.png',
  })
})

test('Firebase verifier rejects bad signature', async () => {
  const key1 = await createTestKey('kid-1')
  const key2 = await createTestKey('kid-2')
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key1.jwk] }),
    }),
  })

  // Signed with key2, but header claims kid-1
  const token = await makeToken(
    { alg: 'RS256', kid: key1.kid },
    baseClaims(nowSec),
    key2.keyPair.privateKey,
  )

  await assert.rejects(verifier.verify(token), { message: 'FIREBASE_TOKEN_INVALID' })
})

test('Firebase verifier rejects wrong aud and iss', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  // Wrong aud
  const tokenWrongAud = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), aud: 'wrong-project' },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(tokenWrongAud), { message: 'FIREBASE_TOKEN_INVALID' })

  // Wrong iss
  const tokenWrongIss = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), iss: 'https://securetoken.google.com/wrong-project' },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(tokenWrongIss), { message: 'FIREBASE_TOKEN_INVALID' })
})

test('Firebase verifier rejects expired token', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  const expiredToken = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), exp: nowSec - 10 },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(expiredToken), { message: 'FIREBASE_TOKEN_EXPIRED' })
})

test('Firebase verifier rejects stale auth_time older than 15 minutes', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  // auth_time is 16 minutes old (960s > 900s)
  const staleToken = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), auth_time: nowSec - 960 },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(staleToken), { message: 'FIREBASE_TOKEN_EXPIRED' })
})

test('Firebase verifier rejects non-google provider', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  const tokenPassword = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), firebase: { sign_in_provider: 'password' } },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(tokenPassword), { message: 'FIREBASE_PROVIDER_NOT_ALLOWED' })
})

test('Firebase verifier rejects unverified email or missing email', async () => {
  const key = await createTestKey()
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [key.jwk] }),
    }),
  })

  const unverifiedToken = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), email_verified: false },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(unverifiedToken), { message: 'FIREBASE_EMAIL_UNVERIFIED' })

  const noEmailToken = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), email: '' },
    key.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(noEmailToken), { message: 'FIREBASE_EMAIL_UNVERIFIED' })
})

test('Firebase verifier rejects alg: none', async () => {
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
      json: async () => ({ keys: [] }),
    }),
  })

  const headB64 = toBase64Url({ alg: 'none', kid: 'any' })
  const payB64 = toBase64Url(baseClaims(nowSec))
  const unsignedToken = `${headB64}.${payB64}.`
  await assert.rejects(verifier.verify(unsignedToken), { message: 'FIREBASE_TOKEN_INVALID' })
})

test('Firebase verifier caches keys and reuses for subsequent verifies', async () => {
  const key = await createTestKey()
  let fetchCount = 0
  const nowMs = 1700000000000
  const nowSec = Math.floor(nowMs / 1000)
  const verifier = createFirebaseVerifier({
    projectId,
    now: () => nowMs,
    fetchImpl: async () => {
      fetchCount++
      return {
        ok: true,
        headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
        json: async () => ({ keys: [key.jwk] }),
      }
    },
  })

  const token1 = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), sub: 'user-1' },
    key.keyPair.privateKey,
  )
  const token2 = await makeToken(
    { alg: 'RS256', kid: key.kid },
    { ...baseClaims(nowSec), sub: 'user-2' },
    key.keyPair.privateKey,
  )

  const u1 = await verifier.verify(token1)
  const u2 = await verifier.verify(token2)
  assert.equal(u1.uid, 'user-1')
  assert.equal(u2.uid, 'user-2')
  assert.equal(fetchCount, 1, 'keys cached, fetch called once')
})

test('Firebase verifier triggers refetch on unknown kid at most once per minute', async () => {
  const key1 = await createTestKey('kid-1')
  const key2 = await createTestKey('kid-2')
  let fetchCount = 0
  let currentTime = 1700000000000

  const verifier = createFirebaseVerifier({
    projectId,
    now: () => currentTime,
    fetchImpl: async () => {
      fetchCount++
      // First fetch only returns key1, subsequent fetch returns key1 and key2
      const keys = fetchCount === 1 ? [key1.jwk] : [key1.jwk, key2.jwk]
      return {
        ok: true,
        headers: new Headers({ 'Cache-Control': 'public, max-age=3600' }),
        json: async () => ({ keys }),
      }
    },
  })

  const token1 = await makeToken(
    { alg: 'RS256', kid: key1.kid },
    baseClaims(Math.floor(currentTime / 1000)),
    key1.keyPair.privateKey,
  )
  await verifier.verify(token1)
  assert.equal(fetchCount, 1)

  // Verify with unknown kid within 60s: throttled, should not refetch and reject
  currentTime += 10000 // 10s later
  const token2 = await makeToken(
    { alg: 'RS256', kid: key2.kid },
    baseClaims(Math.floor(currentTime / 1000)),
    key2.keyPair.privateKey,
  )
  await assert.rejects(verifier.verify(token2), { message: 'FIREBASE_TOKEN_INVALID' })
  assert.equal(fetchCount, 1, 'did not refetch within 60s')

  // Advance time past 60s: refetch allowed, finds key2 and succeeds
  currentTime += 55000 // now 65s since first fetch
  const user2 = await verifier.verify(token2)
  assert.equal(fetchCount, 2, 'refetched after 60s')
  assert.equal(user2.uid, 'user-uid-123')
})

test('Firebase verifier throws FIREBASE_KEYS_UNAVAILABLE on fetch failure', async () => {
  const verifier = createFirebaseVerifier({
    projectId,
    fetchImpl: async () => {
      throw new Error('Network error')
    },
  })

  const dummyToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtpZDEifQ.eyJzdWIiOiIxIn0.c2ln'
  await assert.rejects(verifier.verify(dummyToken), { message: 'FIREBASE_KEYS_UNAVAILABLE' })
})
