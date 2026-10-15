import { getStoredAdminUsersToken, saveAdminUsersToken } from './adminUsers'
import { getStoredRecallsAdminToken, saveRecallsAdminToken } from './recalls'
import { getStoredAdminToken, saveAdminToken } from './studyAdmin'
import { studyApiBase } from './studyPlanSync'
import { useEffect, useState } from 'react'

export type AdminAvailability = 'available' | 'hidden'
export type AdminAvailabilityState = AdminAvailability | 'pending'

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)

export function resolveAdminAvailability(statusOrError: number | unknown): AdminAvailability {
  if (typeof statusOrError === 'number') return statusOrError === 200 ? 'available' : 'hidden'
  if (
    typeof statusOrError === 'object' &&
    statusOrError !== null &&
    'status' in statusOrError &&
    typeof (statusOrError as { status: unknown }).status === 'number'
  ) {
    return (statusOrError as { status: number }).status === 200 ? 'available' : 'hidden'
  }
  return 'hidden'
}

export const mapStatusToAdminAvailability = resolveAdminAvailability
export const mapAdminAvailabilityStatus = resolveAdminAvailability

// /admin/config is publicly accessible and cannot establish an admin's identity.
export function adminProbeEndpoint(pathname: string): string {
  if (pathname === '/admin/recalls') return '/api/study-plan/admin/recalls/summary'
  if (pathname === '/admin/users') return '/api/study-plan/admin/users?limit=1'
  return '/api/study-plan/admin/placement-cohort'
}

export function getAdminTokenForRoute(pathname: string): string {
  if (typeof window === 'undefined') return ''
  if (pathname === '/admin/recalls') return getStoredRecallsAdminToken()
  if (pathname === '/admin/users') return getStoredAdminUsersToken()
  return getStoredAdminToken()
}

export function saveAdminTokenForRoute(pathname: string, token: string): void {
  if (pathname === '/admin/recalls') saveRecallsAdminToken(token)
  else if (pathname === '/admin/users') saveAdminUsersToken(token)
  else saveAdminToken(token)
}

export async function probeAdminAvailability(pathname = '/admin', suppliedToken?: string): Promise<AdminAvailability> {
  const token = (suppliedToken ?? getAdminTokenForRoute(pathname)).trim()
  if (!token) return 'hidden'
  try {
    const response = await fetch(`${API_BASE}${adminProbeEndpoint(pathname)}`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
    return resolveAdminAvailability(response.status)
  } catch {
    return 'hidden'
  }
}

export const checkAdminAvailability = probeAdminAvailability
export const getAdminAvailability = probeAdminAvailability
// Token changes/revocation should never reuse a cached 200 response.
export function resetAdminAvailabilityCache(): void {}

export function useAdminAvailability(pathname = '/admin'): AdminAvailabilityState {
  const [result, setResult] = useState<{ pathname: string; availability: AdminAvailabilityState }>({
    pathname,
    availability: 'pending',
  })

  useEffect(() => {
    let mounted = true
    setResult({ pathname, availability: 'pending' })
    void probeAdminAvailability(pathname).then((availability) => {
      if (mounted) setResult({ pathname, availability })
    })
    return () => {
      mounted = false
    }
  }, [pathname])

  return result.pathname === pathname ? result.availability : 'pending'
}
