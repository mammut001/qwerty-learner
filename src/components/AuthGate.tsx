import Loading from './Loading'
import logo from '@/assets/logo.svg'
import {
  type AuthStatus,
  authErrorMessage,
  getAuthStatus,
  preloadFirebaseSdk,
  signInWithGoogle,
} from '@/services/auth'
import {
  getCurrentProfile,
  hasStash,
  switchLocalProfile,
} from '@/services/localProfile'
import { authStatusAtom } from '@/store/auth'
import { useSetAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

const AUTH_STATUS_CACHE_KEY = 'qwerty-fr-auth-status-v1'
const RECONCILED_FLAG = 'qfp:reconciled'

const readCachedStatus = (): 'open' | 'locked' | null => {
  try {
    const cached = window.localStorage.getItem(AUTH_STATUS_CACHE_KEY)
    if (cached === 'open' || cached === 'locked') return cached
    return null
  } catch {
    return null
  }
}

const writeCachedStatus = (status: 'open' | 'locked') => {
  try {
    window.localStorage.setItem(AUTH_STATUS_CACHE_KEY, status)
  } catch {
    // Quota or private browsing mode
  }
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'checking' | 'open' | 'locked'>(() => {
    const cached = readCachedStatus()
    return cached === 'open' ? 'open' : 'checking'
  })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const setAuthStatus = useSetAtom(authStatusAtom)

  const reconcileProfile = useCallback((status: AuthStatus): boolean => {
    if (status.signedIn && status.user?.id) {
      const target = `acct:${status.user.id}`
      const current = getCurrentProfile()
      if (current !== target) {
        // Startup reconciliation:
        // - 'swap' if an isolated stash for this account already exists or current is another account.
        // - 'keep' if current is 'anon' and no stash exists for target (adopt local data into newly discovered session).
        const mode = hasStash(target) || current !== 'anon' ? 'swap' : 'keep'
        switchLocalProfile(target, mode)
        if (sessionStorage.getItem(RECONCILED_FLAG) !== target) {
          sessionStorage.setItem(RECONCILED_FLAG, target)
          window.location.reload()
          return true
        }
      }
    } else if (!status.signedIn) {
      const current = getCurrentProfile()
      if (current !== 'anon') {
        switchLocalProfile('anon', 'swap')
        if (sessionStorage.getItem(RECONCILED_FLAG) !== 'anon') {
          sessionStorage.setItem(RECONCILED_FLAG, 'anon')
          window.location.reload()
          return true
        }
      }
    }
    return false
  }, [])

  const checkStatus = useCallback(() => {
    let cancelled = false
    getAuthStatus()
      .then((status) => {
        if (cancelled) return
        if (reconcileProfile(status)) return

        setAuthStatus(status)
        const locked = status.enabled && status.required && !status.signedIn
        writeCachedStatus(locked ? 'locked' : 'open')
        setPhase(locked ? 'locked' : 'open')
      })
      .catch(() => {
        // Backend unreachable or offline: static deployments keep working
        if (!cancelled) {
          writeCachedStatus('open')
          setPhase('open')
        }
      })
    return () => {
      cancelled = true
    }
  }, [reconcileProfile, setAuthStatus])

  useEffect(() => {
    return checkStatus()
  }, [checkStatus])

  useEffect(() => {
    const handleAuthRequired = () => {
      checkStatus()
    }
    window.addEventListener('qwerty-auth-required', handleAuthRequired)
    return () => {
      window.removeEventListener('qwerty-auth-required', handleAuthRequired)
    }
  }, [checkStatus])

  const warmSdk = () => void preloadFirebaseSdk().catch(() => undefined)

  useEffect(() => {
    if (phase === 'locked') {
      warmSdk()
    }
  }, [phase])

  const handleSignIn = async () => {
    if (submitting) return
    setSubmitting(true)
    setMessage('')
    try {
      const result = await signInWithGoogle()
      const target = `acct:${result.user.id}`
      const mode = result.created || result.adopted || result.linked ? 'keep' : 'swap'
      switchLocalProfile(target, mode)
      sessionStorage.removeItem(RECONCILED_FLAG)
      window.location.reload()
      return
    } catch (error) {
      const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      setMessage(authErrorMessage(code))
      setSubmitting(false)
    }
  }

  if (phase === 'open') return <>{children}</>
  if (phase === 'checking') return <Loading />

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4">
      <div
        data-testid="auth-gate"
        className="my-card w-full max-w-sm rounded-3xl bg-white p-7 dark:bg-gray-800"
      >
        <div className="flex items-center gap-3 text-indigo-500">
          <img src={logo} className="h-10 w-10" alt="" />
          <div>
            <div className="text-xl font-bold leading-6">Qwerty Français</div>
            <div className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">TCF Canada</div>
          </div>
        </div>
        <h1 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">登录后继续</h1>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          学习进度与复习计划将保存在你的个人账号中。
        </p>
        <button
          type="button"
          data-testid="google-sign-in"
          onClick={handleSignIn}
          onMouseEnter={warmSdk}
          onFocus={warmSdk}
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white py-2.5 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          <GoogleIcon className="h-5 w-5 shrink-0" />
          <span>{submitting ? '正在登录…' : '使用 Google 账号登录'}</span>
        </button>
        {message && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
