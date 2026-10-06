// Client for the optional site-wide access password (STUDY_ACCESS_PASSWORD on the server).

export type AccessStatus = { required: boolean; granted: boolean }
export type UnlockResult = { ok: true } | { ok: false; reason: 'wrong' } | { ok: false; reason: 'rate-limited'; retryAfterSeconds: number }

const apiBase = () => {
  try {
    const configured = String(import.meta.env?.VITE_STUDY_API_BASE_URL ?? '').trim()
    return configured ? new URL(configured).origin : ''
  } catch {
    return ''
  }
}

const ACCESS_URL = `${apiBase()}/api/study-plan/access`

async function request(init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(ACCESS_URL, { credentials: 'include', signal: controller.signal, ...init })
  } finally {
    window.clearTimeout(timer)
  }
}

/** Rejects when the backend cannot be reached; callers then let the offline app through. */
export async function getAccessStatus(): Promise<AccessStatus> {
  const response = await request({ method: 'GET' }, 5000)
  if (!response.ok) throw new Error(`Access status: ${response.status}`)
  const data = (await response.json()) as Partial<AccessStatus>
  return { required: data.required === true, granted: data.granted === true }
}

export async function unlockAccess(password: string): Promise<UnlockResult> {
  const response = await request(
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) },
    10000,
  )
  if (response.ok) return { ok: true }
  if (response.status === 401) return { ok: false, reason: 'wrong' }
  if (response.status === 429) {
    const data = (await response.json().catch(() => ({}))) as { retryAfterSeconds?: number }
    return { ok: false, reason: 'rate-limited', retryAfterSeconds: Number(data.retryAfterSeconds) || 900 }
  }
  throw new Error(`Access unlock: ${response.status}`)
}
