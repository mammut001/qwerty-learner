import { studyApiBase } from './studyPlanSync'
import { useEffect, useState } from 'react'

export type AdminAvailability = 'available' | 'hidden'
export type AdminAvailabilityState = AdminAvailability | 'pending'

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)

let probePromise: Promise<AdminAvailability> | null = null
let cachedAvailability: AdminAvailability | null = null

/**
 * Pure status-to-availability mapping.
 * Resolves HTTP 200 to 'available', and any other status code (404, 401, 500, 503, etc.)
 * or thrown network error to 'hidden'.
 */
export function resolveAdminAvailability(statusOrError: number | unknown): AdminAvailability {
  if (typeof statusOrError === 'number') {
    return statusOrError === 200 ? 'available' : 'hidden'
  }
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

/**
 * Probes `/api/study-plan/admin/config` once per page load.
 * Module-level cached promise ensures a single probe across page lifetime.
 */
export function probeAdminAvailability(): Promise<AdminAvailability> {
  if (probePromise) {
    return probePromise
  }

  probePromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/study-plan/admin/config`, {
        credentials: 'include',
      })
      const result = resolveAdminAvailability(response.status)
      cachedAvailability = result
      return result
    } catch (error) {
      const result = resolveAdminAvailability(error)
      cachedAvailability = result
      return result
    }
  })()

  return probePromise
}

export const checkAdminAvailability = probeAdminAvailability
export const getAdminAvailability = probeAdminAvailability

export function resetAdminAvailabilityCache(): void {
  probePromise = null
  cachedAvailability = null
}

/**
 * React hook for checking admin availability.
 * Returns 'pending' while probing, then 'available' or 'hidden'.
 */
export function useAdminAvailability(): AdminAvailabilityState {
  const [availability, setAvailability] = useState<AdminAvailabilityState>(
    () => cachedAvailability ?? 'pending',
  )

  useEffect(() => {
    let mounted = true
    void probeAdminAvailability().then((result) => {
      if (mounted) {
        setAvailability(result)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  return availability
}
