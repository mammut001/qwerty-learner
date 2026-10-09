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

export function isGuestMode(): boolean {
  return guestMode
}

export function setGuestMode(enabled: boolean): void {
  guestMode = enabled
}
