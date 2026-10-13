export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface ChunkReloadOptions {
  now?: () => number
  storage?: StorageLike | null
  reload?: () => void
  cooldownMs?: number
}

const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'is not a valid javascript mime type',
  'chunkloaderror',
]

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>
    if (errObj.type === 'vite:preloadError') {
      return true
    }
    if (errObj.name === 'ChunkLoadError') {
      return true
    }
    if ('payload' in errObj && errObj.payload && errObj.payload !== error) {
      if (isChunkLoadError(errObj.payload)) {
        return true
      }
    }
    if ('error' in errObj && errObj.error && errObj.error !== error) {
      if (isChunkLoadError(errObj.error)) {
        return true
      }
    }
  }

  let text = ''
  if (typeof error === 'string') {
    text = error
  } else if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>
    const message = typeof errObj.message === 'string' ? errObj.message : ''
    text = message || String(error)
  } else {
    text = String(error)
  }

  const lower = text.toLowerCase()
  return CHUNK_ERROR_PATTERNS.some((pattern) => lower.includes(pattern))
}

export const CHUNK_RELOAD_STORAGE_KEY = 'qwerty:chunk_reload_ts'
const DEFAULT_COOLDOWN_MS = 60000

let memoryReloaded = false

export function resetChunkReloadState(): void {
  memoryReloaded = false
}

function getSafeSessionStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // Access may throw in restricted browsing contexts
  }
  return null
}

export function handleChunkReload(
  error: unknown,
  options?: ChunkReloadOptions,
): boolean {
  if (!isChunkLoadError(error)) {
    return false
  }

  const now = options?.now ?? (() => Date.now())
  const reload = options?.reload ?? (() => window.location.reload())
  const storage =
    options?.storage !== undefined ? options.storage : getSafeSessionStorage()
  const cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS
  const currentTime = now()

  if (storage) {
    try {
      const raw = storage.getItem(CHUNK_RELOAD_STORAGE_KEY)
      if (raw) {
        const last = parseInt(raw, 10)
        if (Number.isFinite(last) && currentTime >= last && currentTime - last < cooldownMs) {
          return false
        }
      }
      storage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(currentTime))
      reload()
      return true
    } catch {
      // Storage threw; fallback to in-memory guard
    }
  }

  // Storage unavailable or threw: reload at most once per page lifetime
  if (memoryReloaded) {
    return false
  }
  memoryReloaded = true
  reload()
  return true
}

export function setupChunkReloadListener(
  target: EventTarget = typeof window !== 'undefined' ? window : ({} as EventTarget),
  options?: ChunkReloadOptions,
): () => void {
  if (typeof target?.addEventListener !== 'function') return () => {}

  const listener = (event: Event) => {
    const error = (event as { payload?: unknown }).payload ?? event
    const reloaded = handleChunkReload(error, options)
    if (reloaded && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }
  }

  target.addEventListener('vite:preloadError', listener)
  return () => {
    if (typeof target?.removeEventListener === 'function') {
      target.removeEventListener('vite:preloadError', listener)
    }
  }
}
