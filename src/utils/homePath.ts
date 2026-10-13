import type { AuthStatus } from '@/services/auth'

export type CachedAuthStatus = 'open' | 'locked' | null

export interface ResolveHomePathOptions {
  search?: string | null
  authStatus?: AuthStatus | null
  cachedStatus?: CachedAuthStatus
  guestMode?: boolean
}

/**
 * Resolves the destination route for visitors landing on `/`.
 *
 * Decision flow:
 * 1. Existing query string links (e.g. `/?dict=...`) continue forwarding to `/typing?...`.
 * 2. Without query string:
 *    - Signed-in learners or environments where sign-in is not required go to `/study-plan`.
 *    - Guests (backend status enabled && required && !signedIn, or cached 'locked' / guestMode true) go to `/typing`.
 *    - Brand-new visitors (backend status not yet loaded and no cache at all) are treated as guests and go to `/typing`.
 */
export function resolveHomePath(options?: ResolveHomePathOptions): string {
  if (options?.search) {
    const search = options.search.startsWith('?') ? options.search : `?${options.search}`
    return `/typing${search}`
  }

  const authStatus = options?.authStatus
  if (authStatus != null) {
    const isGuest = Boolean(authStatus.enabled && authStatus.required && !authStatus.signedIn)
    return isGuest ? '/typing' : '/study-plan'
  }

  const cachedStatus = options?.cachedStatus
  const guestMode = options?.guestMode

  if (cachedStatus === 'open' && !guestMode) {
    return '/study-plan'
  }

  return '/typing'
}
