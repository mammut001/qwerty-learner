// Local data isolation per account (qfp: qwerty-fr-profile)

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
  readonly length: number
}

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>()

  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.map.set(key, String(value))
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  key(index: number): string | null {
    const keys = Array.from(this.map.keys())
    return index >= 0 && index < keys.length ? keys[index] : null
  }

  get length(): number {
    return this.map.size
  }
}

export function createMemoryStorage(): StorageLike {
  return new MemoryStorage()
}

function getDefaultStorage(): StorageLike {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: StorageLike }).localStorage) {
    return (globalThis as unknown as { localStorage: StorageLike }).localStorage
  }
  return new MemoryStorage()
}

const DEVICE_EXACT_KEYS = new Set([
  'qwerty-fr-access-granted',
  'qwerty-fr-auth-status-v1',
  'isOpenDarkModeAtom',
  'keySoundsConfig',
  'hintSoundsConfig',
  'pronunciation',
  'fontsize',
  'phoneticConfig',
  'randomConfig',
  'wordDictationConfig',
  'isShowPrevAndNextWord',
  'isIgnoreCase',
  'isShowAnswerOnHover',
  'isTextSelectable',
  'hasSeenEnhancedPromotion',
])

export function isDeviceLevelKey(key: string): boolean {
  if (key.startsWith('qfp:')) return true
  if (DEVICE_EXACT_KEYS.has(key)) return true
  if (key.startsWith('qwerty-fr-dictionary-online')) return true
  return false
}

function safeGet(storage: StorageLike, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage: StorageLike, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    // Quota exceeded or private browsing mode
  }
}

function safeRemove(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // Private mode restriction
  }
}

function getAllKeys(storage: StorageLike): string[] {
  const keys: string[] = []
  try {
    const len = storage.length
    for (let i = 0; i < len; i++) {
      const k = storage.key(i)
      if (k !== null) keys.push(k)
    }
  } catch {
    // Storage access unavailable
  }
  return keys
}

export type ProfileSwitchResult = {
  switched: boolean
  failedKeys: string[]
}

function safeMove(
  storage: StorageLike,
  fromKey: string,
  toKey: string,
  options?: { preventOverwrite?: boolean },
): boolean {
  const val = safeGet(storage, fromKey)
  if (val === null) return true

  if (options?.preventOverwrite ?? true) {
    const existing = safeGet(storage, toKey)
    if (existing !== null && existing !== '') {
      if (existing === val) {
        // Destination already holds identical value; safe to remove source key
        safeRemove(storage, fromKey)
        return true
      }
      // Different non-empty value exists; do not overwrite, keep destination and leave source
      return false
    }
  }

  // Safe move algorithm:
  // read value -> remove source -> set destination -> if destination does not read back equal, put value back under source key
  safeRemove(storage, fromKey)
  let success = false
  try {
    storage.setItem(toKey, val)
    success = storage.getItem(toKey) === val
  } catch {
    success = false
  }

  if (success) {
    return true
  }

  // Rollback on failure: clean up partially written destination and restore source
  try {
    if (storage.getItem(toKey) !== null && storage.getItem(toKey) !== val) {
      storage.removeItem(toKey)
    }
  } catch {
    // Ignore cleanup error
  }

  try {
    storage.setItem(fromKey, val)
  } catch {
    // Best effort restore
  }
  return false
}

export function getCurrentProfile(storage: StorageLike = getDefaultStorage()): string {
  return safeGet(storage, 'qfp:current') || 'anon'
}

export function hasStash(profile: string, storage: StorageLike = getDefaultStorage()): boolean {
  const prefix = `qfp:data:${profile}:`
  return getAllKeys(storage).some((k) => k.startsWith(prefix))
}

export function repairInterruptedSwitch(
  storage: StorageLike = getDefaultStorage(),
): ProfileSwitchResult {
  const switchingRaw = safeGet(storage, 'qfp:switching')
  if (!switchingRaw) return { switched: true, failedKeys: [] }

  const failedKeys: string[] = []

  try {
    const switching = JSON.parse(switchingRaw) as {
      from?: string
      to?: string
      phase?: 'stash' | 'restore'
    }
    if (switching && typeof switching.from === 'string' && typeof switching.to === 'string') {
      const from = switching.from
      const to = switching.to
      const phase = switching.phase === 'restore' ? 'restore' : 'stash'

      if (phase === 'stash') {
        // Complete stashing for any user keys belonging to 'from' still in root
        const keys = getAllKeys(storage)
        for (const k of keys) {
          if (!isDeviceLevelKey(k)) {
            const stashKey = `qfp:data:${from}:${k}`
            const ok = safeMove(storage, k, stashKey, { preventOverwrite: true })
            if (!ok) {
              failedKeys.push(k)
            }
          }
        }
        safeSet(storage, 'qfp:switching', JSON.stringify({ from, to, phase: 'restore' }))
      }

      // In phase 'restore' ONLY restore
      const prefix = `qfp:data:${to}:`
      const allStashKeys = getAllKeys(storage)
      for (const stashKey of allStashKeys) {
        if (stashKey.startsWith(prefix)) {
          const origKey = stashKey.slice(prefix.length)
          const ok = safeMove(storage, stashKey, origKey, { preventOverwrite: true })
          if (!ok) {
            failedKeys.push(origKey)
          }
        }
      }

      safeSet(storage, 'qfp:current', to)
    }
  } catch {
    // Malformed recovery record
  } finally {
    safeRemove(storage, 'qfp:switching')
  }

  return { switched: failedKeys.length === 0, failedKeys }
}

export function switchLocalProfile(
  next: string,
  mode: 'keep' | 'swap',
  storage: StorageLike = getDefaultStorage(),
): ProfileSwitchResult {
  const repairRes = repairInterruptedSwitch(storage)

  const current = getCurrentProfile(storage)
  if (next === current) return repairRes

  if (mode === 'keep') {
    // Keep: in-place data becomes 'next' data
    const recordDb = safeGet(storage, `qfp:db:${current}`)
    if (recordDb) {
      safeMove(storage, `qfp:db:${current}`, `qfp:db:${next}`, { preventOverwrite: true })
    }
    const tcfDb = safeGet(storage, `qfp:db:tcfAudio:${current}`)
    if (tcfDb) {
      safeMove(storage, `qfp:db:tcfAudio:${current}`, `qfp:db:tcfAudio:${next}`, { preventOverwrite: true })
    }
    safeSet(storage, 'qfp:current', next)
    safeRemove(storage, 'qfp:switching')
    return { switched: true, failedKeys: [] }
  }

  // Swap: stash current user-scoped data, restore next user-scoped data
  const failedKeys: string[] = [...repairRes.failedKeys]
  safeSet(storage, 'qfp:switching', JSON.stringify({ from: current, to: next, phase: 'stash' }))

  const keys = getAllKeys(storage)
  for (const k of keys) {
    if (!isDeviceLevelKey(k)) {
      const stashKey = `qfp:data:${current}:${k}`
      const ok = safeMove(storage, k, stashKey, { preventOverwrite: true })
      if (!ok) {
        failedKeys.push(k)
      }
    }
  }

  safeSet(storage, 'qfp:switching', JSON.stringify({ from: current, to: next, phase: 'restore' }))

  const prefix = `qfp:data:${next}:`
  const allStashKeys = getAllKeys(storage)
  for (const stashKey of allStashKeys) {
    if (stashKey.startsWith(prefix)) {
      const origKey = stashKey.slice(prefix.length)
      const ok = safeMove(storage, stashKey, origKey, { preventOverwrite: true })
      if (!ok) {
        failedKeys.push(origKey)
      }
    }
  }

  safeSet(storage, 'qfp:current', next)
  safeRemove(storage, 'qfp:switching')
  return { switched: failedKeys.length === 0, failedKeys }
}

export function recordDbName(profile?: string, storage: StorageLike = getDefaultStorage()): string {
  const currentProfile = profile || getCurrentProfile(storage)
  const key = `qfp:db:${currentProfile}`
  const mapped = safeGet(storage, key)
  if (mapped) return mapped

  const hasAny = getAllKeys(storage).some((k) => k.startsWith('qfp:db:') && !k.startsWith('qfp:db:tcfAudio:'))
  if (!hasAny) {
    safeSet(storage, key, 'RecordDB')
    return 'RecordDB'
  }
  const randomSuffix = Math.random().toString(36).slice(2, 10)
  const fresh = `RecordDB-${randomSuffix}`
  safeSet(storage, key, fresh)
  return fresh
}

export function tcfAudioDbName(profile?: string, storage: StorageLike = getDefaultStorage()): string {
  const currentProfile = profile || getCurrentProfile(storage)
  const key = `qfp:db:tcfAudio:${currentProfile}`
  const mapped = safeGet(storage, key)
  if (mapped) return mapped

  const hasAny = getAllKeys(storage).some((k) => k.startsWith('qfp:db:tcfAudio:'))
  if (!hasAny) {
    safeSet(storage, key, 'qwerty-tcf-eo-audio-db')
    return 'qwerty-tcf-eo-audio-db'
  }
  const randomSuffix = Math.random().toString(36).slice(2, 10)
  const fresh = `qwerty-tcf-eo-audio-db-${randomSuffix}`
  safeSet(storage, key, fresh)
  return fresh
}

export function initLocalProfile(storage: StorageLike = getDefaultStorage()): string {
  repairInterruptedSwitch(storage)
  const current = getCurrentProfile(storage)
  if (!safeGet(storage, 'qfp:current')) {
    safeSet(storage, 'qfp:current', 'anon')
  }
  return current
}
