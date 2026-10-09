import {
  type AuthStatus,
  getAuthStatus,
} from '@/services/auth'
import { AUTH_STATUS_CACHE_KEY, setGuestMode } from '@/services/guestMode'
import {
  getCurrentProfile,
  hasStash,
  switchLocalProfile,
} from '@/services/localProfile'
import { authStatusAtom } from '@/store/auth'
import { useSetAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect } from 'react'

const RECONCILED_FLAG = 'qfp:reconciled'

const writeCachedStatus = (status: 'open' | 'locked') => {
  try {
    window.localStorage.setItem(AUTH_STATUS_CACHE_KEY, status)
  } catch {
    // Quota or private browsing mode
  }
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
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
        setGuestMode(locked)
        writeCachedStatus(locked ? 'locked' : 'open')
      })
      .catch(() => {
        // Backend unreachable or offline: static deployments keep working
        if (!cancelled) {
          setGuestMode(false)
          writeCachedStatus('open')
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

  return <>{children}</>
}
