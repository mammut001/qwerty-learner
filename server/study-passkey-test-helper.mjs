import { webcrypto } from 'node:crypto'
import { base64urlToBytes, bytesToBase64url } from './study-passkey.mjs'

const cryptoApi = globalThis.crypto ?? webcrypto
const encoder = new TextEncoder()

const sha256 = async (value) => new Uint8Array(await cryptoApi.subtle.digest('SHA-256', value))

const authenticatorData = async (rpId, signCount) => {
  const rpHash = await sha256(encoder.encode(rpId))
  const bytes = new Uint8Array(37)
  bytes.set(rpHash, 0)
  bytes[32] = 0x05 // user presence + user verification
  new DataView(bytes.buffer).setUint32(33, signCount, false)
  return bytes
}

const clientData = (type, challenge, origin) => {
  const bytes = encoder.encode(JSON.stringify({ type, challenge, origin, crossOrigin: false }))
  return {
    bytes,
    encoded: bytesToBase64url(bytes),
  }
}

const trimInteger = (bytes) => {
  let index = 0
  while (index < bytes.length - 1 && bytes[index] === 0) index += 1
  let value = bytes.slice(index)
  if (value[0] & 0x80) {
    const padded = new Uint8Array(value.length + 1)
    padded.set(value, 1)
    value = padded
  }
  return value
}

export const rawEcdsaToDer = (signature) => {
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature)
  if (bytes.length !== 64) throw new Error('Expected raw P-256 signature')
  const r = trimInteger(bytes.slice(0, 32))
  const s = trimInteger(bytes.slice(32))
  const bodyLength = 2 + r.length + 2 + s.length
  const out = new Uint8Array(2 + bodyLength)
  out[0] = 0x30
  out[1] = bodyLength
  out[2] = 0x02
  out[3] = r.length
  out.set(r, 4)
  const sOffset = 4 + r.length
  out[sOffset] = 0x02
  out[sOffset + 1] = s.length
  out.set(s, sOffset + 2)
  return out
}

export async function createPasskeyFixture(origin) {
  const rpId = new URL(origin).hostname
  const pair = await cryptoApi.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  )
  const spki = new Uint8Array(await cryptoApi.subtle.exportKey('spki', pair.publicKey))
  const credentialId = cryptoApi.getRandomValues(new Uint8Array(32))
  const id = bytesToBase64url(credentialId)

  return {
    id,
    async registration(challenge) {
      const client = clientData('webauthn.create', challenge, origin)
      const authData = await authenticatorData(rpId, 0)
      return {
        id,
        rawId: id,
        type: 'public-key',
        response: {
          clientDataJSON: client.encoded,
          authenticatorData: bytesToBase64url(authData),
          publicKey: bytesToBase64url(spki),
          publicKeyAlgorithm: -7,
          transports: ['internal'],
        },
      }
    },
    async authentication(challenge, signCount = 1) {
      const client = clientData('webauthn.get', challenge, origin)
      const authData = await authenticatorData(rpId, signCount)
      const clientHash = await sha256(client.bytes)
      const signed = new Uint8Array(authData.length + clientHash.length)
      signed.set(authData, 0)
      signed.set(clientHash, authData.length)
      const rawSignature = new Uint8Array(
        await cryptoApi.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, signed),
      )
      const der = rawSignature[0] === 0x30 && rawSignature.length !== 64
        ? rawSignature
        : rawEcdsaToDer(rawSignature)
      return {
        id,
        rawId: id,
        type: 'public-key',
        response: {
          clientDataJSON: client.encoded,
          authenticatorData: bytesToBase64url(authData),
          signature: bytesToBase64url(der),
          userHandle: null,
        },
      }
    },
  }
}

export function decodeBase64url(value) {
  return base64urlToBytes(value)
}
