import type { getApps, initializeApp } from 'firebase/app'
import type {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { firebaseConfig } from './firebaseConfig'

export type AuthUser = {
  id: string
  email: string
  name: string
  picture: string
}

export type AuthStatus = {
  enabled: boolean
  required: boolean
  signedIn: boolean
  user: AuthUser | null
}

export type AuthSignInResult = {
  signedIn: boolean
  created: boolean
  adopted: boolean
  linked: boolean
  user: AuthUser
}

const apiBase = () => {
  try {
    const configured = String(import.meta.env?.VITE_STUDY_API_BASE_URL ?? '').trim()
    return configured ? new URL(configured).origin : ''
  } catch {
    return ''
  }
}

type FirebaseSdk = {
  initializeApp: typeof initializeApp
  getApps: typeof getApps
  getAuth: typeof getAuth
  inMemoryPersistence: typeof inMemoryPersistence
  setPersistence: typeof setPersistence
  GoogleAuthProvider: typeof GoogleAuthProvider
  signInWithPopup: typeof signInWithPopup
  signOut: typeof signOut
}

let sdkPromise: Promise<FirebaseSdk> | null = null
let cachedSdk: FirebaseSdk | null = null

export function preloadFirebaseSdk(): Promise<FirebaseSdk> {
  if (!sdkPromise) {
    sdkPromise = Promise.all([import('firebase/app'), import('firebase/auth')]).then(
      ([appMod, authMod]) => {
        const sdk: FirebaseSdk = {
          initializeApp: appMod.initializeApp,
          getApps: appMod.getApps,
          getAuth: authMod.getAuth,
          inMemoryPersistence: authMod.inMemoryPersistence,
          setPersistence: authMod.setPersistence,
          GoogleAuthProvider: authMod.GoogleAuthProvider,
          signInWithPopup: authMod.signInWithPopup,
          signOut: authMod.signOut,
        }
        cachedSdk = sdk
        try {
          const app = sdk.getApps().length > 0 ? sdk.getApps()[0] : sdk.initializeApp(firebaseConfig)
          const auth = sdk.getAuth(app)
          sdk.setPersistence(auth, sdk.inMemoryPersistence).catch(() => undefined)
        } catch {
          // Preload configuration error ignored until active login attempt
        }
        return sdk
      },
    )
  }
  return sdkPromise
}

function mapFirebaseError(error: unknown): Error {
  if (error && typeof error === 'object') {
    const code = (error as { code?: string }).code
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return new Error('LOGIN_CANCELLED')
    }
    if (code === 'auth/popup-blocked') {
      return new Error('POPUP_BLOCKED')
    }
    if (code === 'auth/unauthorized-domain') {
      return new Error('DOMAIN_NOT_AUTHORIZED')
    }
    if (code === 'auth/network-request-failed') {
      return new Error('NETWORK')
    }
    if (typeof code === 'string' && code) {
      return new Error(code)
    }
  }
  if (error instanceof TypeError) {
    return new Error('NETWORK')
  }
  if (error instanceof Error) {
    return error
  }
  return new Error('UNKNOWN_ERROR')
}

async function postTokenToBackend(idToken: string): Promise<AuthSignInResult> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${apiBase()}/api/study-plan/auth/firebase`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => ({}))) as {
      signedIn?: boolean
      created?: boolean
      adopted?: boolean
      linked?: boolean
      user?: AuthUser
      code?: string
      error?: string
    }
    if (!res.ok) {
      const code = data.code || (res.status === 429 ? 'AUTH_RATE_LIMITED' : 'AUTH_FAILED')
      throw new Error(code)
    }
    return {
      signedIn: Boolean(data.signedIn),
      created: Boolean(data.created),
      adopted: Boolean(data.adopted),
      linked: Boolean(data.linked),
      user: data.user ?? { id: '', email: '', name: '', picture: '' },
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('NETWORK')
    }
    if (error instanceof TypeError) {
      throw new Error('NETWORK')
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

/** Rejects when the backend cannot be reached; 404 indicates an older backend without auth routes. */
export async function getAuthStatus(): Promise<AuthStatus> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${apiBase()}/api/study-plan/auth`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
    if (response.status === 404) {
      return { enabled: false, required: false, signedIn: false, user: null }
    }
    if (!response.ok) {
      throw new Error(`Auth status: ${response.status}`)
    }
    const data = (await response.json()) as Partial<AuthStatus>
    return {
      enabled: data.enabled === true,
      required: data.required === true,
      signedIn: data.signedIn === true,
      user: (data.user as AuthUser | null) ?? null,
    }
  } finally {
    window.clearTimeout(timer)
  }
}

export async function signInWithGoogle(): Promise<AuthSignInResult> {
  // DEV-only test seam (stripped out in production builds)
  if (
    import.meta.env.DEV &&
    typeof (window as unknown as { __QWERTY_TEST_ID_TOKEN__?: string }).__QWERTY_TEST_ID_TOKEN__ === 'string'
  ) {
    const devToken = (window as unknown as { __QWERTY_TEST_ID_TOKEN__: string }).__QWERTY_TEST_ID_TOKEN__
    return await postTokenToBackend(devToken)
  }

  const sdk = cachedSdk || (await preloadFirebaseSdk())
  const app = sdk.getApps().length > 0 ? sdk.getApps()[0] : sdk.initializeApp(firebaseConfig)
  const auth = sdk.getAuth(app)

  const provider = new sdk.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  let idToken: string
  try {
    const cred = await sdk.signInWithPopup(auth, provider)
    idToken = await cred.user.getIdToken()
  } catch (error) {
    throw mapFirebaseError(error)
  }

  try {
    return await postTokenToBackend(idToken)
  } finally {
    await sdk.signOut(auth).catch(() => undefined)
  }
}

export async function logout(): Promise<void> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${apiBase()}/api/study-plan/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller.signal,
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { code?: string }
      throw new Error(data.code || `Logout: ${response.status}`)
    }
  } finally {
    window.clearTimeout(timer)
  }
}

export function authErrorMessage(code: string): string {
  switch (code) {
    case 'EMAIL_NOT_ALLOWED':
      return '这个 Google 账号没有被授权使用本站。'
    case 'AUTH_RATE_LIMITED':
      return '尝试次数太多，请稍后再试。'
    case 'POPUP_BLOCKED':
      return '浏览器拦截了登录弹窗，请允许弹窗后重试。'
    case 'SIGNUP_LIMIT_REACHED':
      return '今天的新账号名额已满，请明天再试。'
    case 'LOGIN_CANCELLED':
      return '登录已取消。'
    case 'DOMAIN_NOT_AUTHORIZED':
      return '当前域名未在授权列表中。'
    case 'NETWORK':
      return '网络连接失败，请检查网络后重试。'
    case 'FIREBASE_TOKEN_INVALID':
      return '登录凭据无效，请重新登录。'
    case 'FIREBASE_TOKEN_EXPIRED':
      return '登录凭据已过期，请重新登录。'
    case 'FIREBASE_PROVIDER_NOT_ALLOWED':
      return '仅支持通过 Google 账号登录。'
    case 'FIREBASE_EMAIL_UNVERIFIED':
      return '该 Google 账号邮箱尚未验证。'
    case 'FIREBASE_KEYS_UNAVAILABLE':
      return '登录验证服务暂时不可用，请稍后重试。'
    case 'AUTH_DISABLED':
      return '站点暂未开启账号登录。'
    case 'AUTH_REQUEST_INVALID':
      return '登录请求无效。'
    case 'ACCESS_REQUIRED':
      return '需要先输入站点访问口令。'
    default:
      return '登录失败，请稍后重试。'
  }
}
