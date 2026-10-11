export const AUTH_STATUS_CACHE_KEY = 'qwerty-fr-auth-status-v1'

const GATED_PATHS = new Set([
  '/study-plan',
  '/placement-test',
  '/levels',
  '/levels/review',
  '/echelle',
  '/tcf',
  '/tcf-writing',
  '/tcf-speaking',
  '/analysis',
  '/error-book',
])

export function isPathGated(pathname: string): boolean {
  if (GATED_PATHS.has(pathname)) return true
  if (pathname.startsWith('/levels/')) return true
  return false
}

const readInitialGuestMode = (): boolean => {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(AUTH_STATUS_CACHE_KEY)
      return cached === 'locked'
    }
  } catch {
    // Storage access might be restricted
  }
  return false
}

let guestMode = readInitialGuestMode()
const listeners = new Set<(enabled: boolean) => void>()

export function isGuestMode(): boolean {
  return guestMode
}

export function onGuestModeChange(listener: (enabled: boolean) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setGuestMode(enabled: boolean): void {
  if (guestMode === enabled) return
  guestMode = enabled
  listeners.forEach((listener) => {
    try {
      listener(enabled)
    } catch {
      // Storage or listener errors
    }
  })
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { __setGuestMode?: (enabled: boolean) => void }).__setGuestMode = setGuestMode
}
