const encoder = new TextEncoder()
const decoder = new TextDecoder()
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export const bytesToBase64url = (input) => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  let output = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0
    const value = (a << 16) | (b << 8) | c
    output += B64[(value >>> 18) & 63]
    output += B64[(value >>> 12) & 63]
    output += i + 1 < bytes.length ? B64[(value >>> 6) & 63] : '='
    output += i + 2 < bytes.length ? B64[value & 63] : '='
  }
  return output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export const base64urlToBytes = (value) => {
  if (typeof value !== 'string' || value.length > 12000 || !/^[A-Za-z0-9_-]*$/.test(value))
    throw new Error('PASSKEY_ENCODING_INVALID')
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4)
  const output = []
  for (let i = 0; i < padded.length; i += 4) {
    const chars = padded.slice(i, i + 4)
    const values = [...chars].map((char) => (char === '=' ? 0 : B64.indexOf(char)))
    if (values.some((item) => item < 0)) throw new Error('PASSKEY_ENCODING_INVALID')
    const combined = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3]
    output.push((combined >>> 16) & 255)
    if (chars[2] !== '=') output.push((combined >>> 8) & 255)
    if (chars[3] !== '=') output.push(combined & 255)
  }
  return new Uint8Array(output)
}

const sha256 = async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', value))

const equalBytes = (a, b) => {
  if (a.length !== b.length) return false
  let difference = 0
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index]
  return difference === 0
}

export const randomPasskeyValue = (size = 32) => {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytesToBase64url(bytes)
}

export function passkeyRegistrationOptions({ challenge, rpId, userHandle }) {
  return {
    challenge,
    rp: { name: 'Qwerty Français', id: rpId },
    user: {
      id: userHandle,
      name: 'qwerty-learner',
      displayName: 'Qwerty Français learner',
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 },
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'required',
    },
  }
}

export function passkeyAuthenticationOptions({ challenge, rpId }) {
  return {
    challenge,
    rpId,
    timeout: 60000,
    userVerification: 'required',
    allowCredentials: [],
  }
}

export function readPasskeyClientData(clientDataJSON) {
  const bytes = base64urlToBytes(clientDataJSON)
  if (bytes.length > 8192) throw new Error('PASSKEY_CLIENT_DATA_TOO_LARGE')
  let value
  try {
    value = JSON.parse(decoder.decode(bytes))
  } catch {
    throw new Error('PASSKEY_CLIENT_DATA_INVALID')
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('PASSKEY_CLIENT_DATA_INVALID')
  if (typeof value.challenge !== 'string' || typeof value.origin !== 'string' || typeof value.type !== 'string')
    throw new Error('PASSKEY_CLIENT_DATA_INVALID')
  return value
}

const verifyClientData = (clientDataJSON, expectedType, expectedChallenge, expectedOrigin) => {
  const data = readPasskeyClientData(clientDataJSON)
  if (data.type !== expectedType) throw new Error('PASSKEY_TYPE_INVALID')
  if (data.challenge !== expectedChallenge) throw new Error('PASSKEY_CHALLENGE_INVALID')
  if (data.origin !== expectedOrigin) throw new Error('PASSKEY_ORIGIN_INVALID')
  if (data.crossOrigin === true) throw new Error('PASSKEY_CROSS_ORIGIN_DENIED')
  return data
}

const verifyAuthenticatorData = async (encoded, expectedRpId) => {
  const bytes = base64urlToBytes(encoded)
  if (bytes.length < 37) throw new Error('PASSKEY_AUTHENTICATOR_DATA_INVALID')
  const expectedRpHash = await sha256(encoder.encode(expectedRpId))
  if (!equalBytes(bytes.slice(0, 32), expectedRpHash)) throw new Error('PASSKEY_RP_ID_INVALID')
  const flags = bytes[32]
  if ((flags & 0x01) === 0) throw new Error('PASSKEY_USER_PRESENCE_REQUIRED')
  if ((flags & 0x04) === 0) throw new Error('PASSKEY_USER_VERIFICATION_REQUIRED')
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return {
    bytes,
    signCount: view.getUint32(33, false),
  }
}

const readDerLength = (bytes, offset) => {
  const first = bytes[offset]
  if (first < 0x80) return { length: first, next: offset + 1 }
  const count = first & 0x7f
  if (count < 1 || count > 2) throw new Error('PASSKEY_SIGNATURE_INVALID')
  let length = 0
  for (let index = 0; index < count; index++) length = (length << 8) | bytes[offset + 1 + index]
  return { length, next: offset + 1 + count }
}

const normalizeDerInteger = (bytes) => {
  let value = bytes
  while (value.length > 32 && value[0] === 0) value = value.slice(1)
  if (value.length > 32) throw new Error('PASSKEY_SIGNATURE_INVALID')
  const output = new Uint8Array(32)
  output.set(value, 32 - value.length)
  return output
}

export const derEcdsaToRaw = (signature) => {
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature)
  if (bytes[0] !== 0x30) throw new Error('PASSKEY_SIGNATURE_INVALID')
  const sequence = readDerLength(bytes, 1)
  let offset = sequence.next
  if (offset + sequence.length !== bytes.length || bytes[offset++] !== 0x02) throw new Error('PASSKEY_SIGNATURE_INVALID')
  const rLength = readDerLength(bytes, offset)
  offset = rLength.next
  const r = bytes.slice(offset, offset + rLength.length)
  offset += rLength.length
  if (bytes[offset++] !== 0x02) throw new Error('PASSKEY_SIGNATURE_INVALID')
  const sLength = readDerLength(bytes, offset)
  offset = sLength.next
  const s = bytes.slice(offset, offset + sLength.length)
  offset += sLength.length
  if (offset !== bytes.length) throw new Error('PASSKEY_SIGNATURE_INVALID')
  const raw = new Uint8Array(64)
  raw.set(normalizeDerInteger(r), 0)
  raw.set(normalizeDerInteger(s), 32)
  return raw
}

const assertCredentialShape = (credential) => {
  if (!credential || typeof credential !== 'object' || Array.isArray(credential)) throw new Error('PASSKEY_CREDENTIAL_INVALID')
  if (credential.type !== 'public-key' || typeof credential.id !== 'string' || typeof credential.rawId !== 'string')
    throw new Error('PASSKEY_CREDENTIAL_INVALID')
  if (!credential.response || typeof credential.response !== 'object' || Array.isArray(credential.response))
    throw new Error('PASSKEY_CREDENTIAL_INVALID')
  if (credential.id.length > 2048 || credential.rawId.length > 2048) throw new Error('PASSKEY_CREDENTIAL_INVALID')
}

export async function verifyPasskeyRegistration({
  credential,
  expectedChallenge,
  expectedOrigin,
  expectedRpId,
}) {
  assertCredentialShape(credential)
  const response = credential.response
  if (
    typeof response.clientDataJSON !== 'string' ||
    typeof response.authenticatorData !== 'string' ||
    typeof response.publicKey !== 'string' ||
    !Number.isInteger(response.publicKeyAlgorithm) ||
    ![-7, -257].includes(response.publicKeyAlgorithm)
  ) throw new Error('PASSKEY_REGISTRATION_INVALID')
  verifyClientData(response.clientDataJSON, 'webauthn.create', expectedChallenge, expectedOrigin)
  const authenticator = await verifyAuthenticatorData(response.authenticatorData, expectedRpId)
  const rawId = bytesToBase64url(base64urlToBytes(credential.rawId))
  if (rawId !== bytesToBase64url(base64urlToBytes(credential.id))) throw new Error('PASSKEY_CREDENTIAL_ID_MISMATCH')
  const publicKeyBytes = base64urlToBytes(response.publicKey)
  if (publicKeyBytes.length < 64 || publicKeyBytes.length > 2048) throw new Error('PASSKEY_PUBLIC_KEY_INVALID')
  return {
    credentialId: rawId,
    publicKey: bytesToBase64url(publicKeyBytes),
    algorithm: response.publicKeyAlgorithm,
    signCount: authenticator.signCount,
    transports: Array.isArray(response.transports)
      ? response.transports.filter((item) => typeof item === 'string').slice(0, 8)
      : [],
  }
}

const importPasskeyPublicKey = async (publicKey, algorithm) => {
  const keyBytes = base64urlToBytes(publicKey)
  if (algorithm === -7) {
    return crypto.subtle.importKey(
      'spki',
      keyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    )
  }
  if (algorithm === -257) {
    return crypto.subtle.importKey(
      'spki',
      keyBytes,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
  }
  throw new Error('PASSKEY_ALGORITHM_UNSUPPORTED')
}

export async function verifyPasskeyAuthentication({
  credential,
  publicKey,
  algorithm,
  previousSignCount = 0,
  expectedChallenge,
  expectedOrigin,
  expectedRpId,
}) {
  assertCredentialShape(credential)
  const response = credential.response
  if (
    typeof response.clientDataJSON !== 'string' ||
    typeof response.authenticatorData !== 'string' ||
    typeof response.signature !== 'string'
  ) throw new Error('PASSKEY_AUTHENTICATION_INVALID')
  verifyClientData(response.clientDataJSON, 'webauthn.get', expectedChallenge, expectedOrigin)
  const authenticator = await verifyAuthenticatorData(response.authenticatorData, expectedRpId)

  const clientHash = await sha256(base64urlToBytes(response.clientDataJSON))
  const signed = new Uint8Array(authenticator.bytes.length + clientHash.length)
  signed.set(authenticator.bytes, 0)
  signed.set(clientHash, authenticator.bytes.length)

  const key = await importPasskeyPublicKey(publicKey, algorithm)
  const suppliedSignature = base64urlToBytes(response.signature)
  const signature = algorithm === -7 ? derEcdsaToRaw(suppliedSignature) : suppliedSignature
  const verified =
    algorithm === -7
      ? await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, signature, signed)
      : await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, signature, signed)
  if (!verified) throw new Error('PASSKEY_SIGNATURE_INVALID')

  if (previousSignCount > 0 && authenticator.signCount > 0 && authenticator.signCount <= previousSignCount)
    throw new Error('PASSKEY_COUNTER_REPLAY')

  return { signCount: authenticator.signCount }
}
