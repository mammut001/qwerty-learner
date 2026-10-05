import {
  beginPasskeyLogin,
  beginPasskeyRegistration,
  finishPasskeyLogin,
  finishPasskeyRegistration,
  type PasskeyAccountInfo,
  type StudyServerState,
} from './studyPlanSync'

type RegistrationOptionsJson = {
  challenge: string
  rp: PublicKeyCredentialRpEntity
  user: Omit<PublicKeyCredentialUserEntity, 'id'> & { id: string }
  pubKeyCredParams: PublicKeyCredentialParameters[]
  timeout?: number
  attestation?: AttestationConveyancePreference
  authenticatorSelection?: AuthenticatorSelectionCriteria
}

type AuthenticationOptionsJson = {
  challenge: string
  rpId?: string
  timeout?: number
  userVerification?: UserVerificationRequirement
  allowCredentials?: Array<Omit<PublicKeyCredentialDescriptor, 'id'> & { id: string }>
}

type ModernAttestationResponse = AuthenticatorAttestationResponse & {
  getAuthenticatorData?: () => ArrayBuffer
  getPublicKey?: () => ArrayBuffer | null
  getPublicKeyAlgorithm?: () => number
  getTransports?: () => string[]
}

const decodeBase64url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer
}

const encodeBase64url = (value: ArrayBuffer) => {
  const bytes = new Uint8Array(value)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const requireWebAuthn = () => {
  if (
    typeof window === 'undefined' ||
    typeof PublicKeyCredential === 'undefined' ||
    !navigator.credentials
  ) throw new Error('PASSKEY_UNSUPPORTED')
}

const registrationOptions = (input: Record<string, unknown>): PublicKeyCredentialCreationOptions => {
  const value = input as unknown as RegistrationOptionsJson
  return {
    ...value,
    challenge: decodeBase64url(value.challenge),
    user: { ...value.user, id: decodeBase64url(value.user.id) },
  }
}

const authenticationOptions = (input: Record<string, unknown>): PublicKeyCredentialRequestOptions => {
  const value = input as unknown as AuthenticationOptionsJson
  return {
    ...value,
    challenge: decodeBase64url(value.challenge),
    allowCredentials: (value.allowCredentials ?? []).map((item) => ({
      ...item,
      id: decodeBase64url(item.id),
    })),
  }
}

const serializeRegistration = (credential: PublicKeyCredential) => {
  const response = credential.response as ModernAttestationResponse
  const authenticatorData = response.getAuthenticatorData?.()
  const publicKey = response.getPublicKey?.()
  const publicKeyAlgorithm = response.getPublicKeyAlgorithm?.()
  if (!authenticatorData || !publicKey || typeof publicKeyAlgorithm !== 'number')
    throw new Error('PASSKEY_BROWSER_UNSUPPORTED')
  return {
    id: encodeBase64url(credential.rawId),
    rawId: encodeBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: encodeBase64url(response.clientDataJSON),
      authenticatorData: encodeBase64url(authenticatorData),
      publicKey: encodeBase64url(publicKey),
      publicKeyAlgorithm,
      transports: response.getTransports?.() ?? [],
    },
  }
}

const serializeAuthentication = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAssertionResponse
  return {
    id: encodeBase64url(credential.rawId),
    rawId: encodeBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: encodeBase64url(response.clientDataJSON),
      authenticatorData: encodeBase64url(response.authenticatorData),
      signature: encodeBase64url(response.signature),
      userHandle: response.userHandle ? encodeBase64url(response.userHandle) : null,
    },
  }
}

export async function registerStudyPasskey(): Promise<PasskeyAccountInfo> {
  requireWebAuthn()
  const options = registrationOptions(await beginPasskeyRegistration())
  const created = await navigator.credentials.create({ publicKey: options })
  if (!(created instanceof PublicKeyCredential)) throw new Error('PASSKEY_REGISTRATION_CANCELLED')
  return finishPasskeyRegistration(serializeRegistration(created))
}

export async function loginWithStudyPasskey(): Promise<{
  state: StudyServerState
  account: PasskeyAccountInfo
}> {
  requireWebAuthn()
  const options = authenticationOptions(await beginPasskeyLogin())
  const found = await navigator.credentials.get({ publicKey: options })
  if (!(found instanceof PublicKeyCredential)) throw new Error('PASSKEY_LOGIN_CANCELLED')
  return finishPasskeyLogin(serializeAuthentication(found))
}

export function passkeyAvailable() {
  return typeof window !== 'undefined' && typeof PublicKeyCredential !== 'undefined' && Boolean(navigator.credentials)
}
