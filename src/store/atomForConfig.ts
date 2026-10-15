import type { WritableAtom } from 'jotai'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { RESET } from 'jotai/vanilla/utils/constants'

type SetStateActionWithReset<Value> = Value | typeof RESET | ((prev: Value) => Value | typeof RESET)

function repairConfig(value: unknown, fallback: unknown): unknown {
  if (value === null || typeof value !== typeof fallback) return fallback
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback
  if (!fallback || typeof fallback !== 'object') return value
  if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback
  if (Array.isArray(value)) return fallback

  const record = value as Record<string, unknown>
  const defaults = fallback as Record<string, unknown>
  let repaired = record
  for (const key of Object.keys(defaults)) {
    const field = repairConfig(record[key], defaults[key])
    if (field !== record[key]) {
      if (repaired === record) repaired = { ...record }
      repaired[key] = field
    }
  }
  return repaired
}

export default function atomForConfig<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
  options: { getOnInit?: boolean } = {},
): WritableAtom<T, [SetStateActionWithReset<T>], void> {
  // This project's Jotai version accepts only (key, initialValue, storage).
  // atomWithStorage hydrates on mount, which happens after the first atom read.
  // For settings needed during chapter setup, read the persisted value
  // synchronously so a new page cannot initialize with the default first.
  const storageAtom = atomWithStorage(key, defaultValue)
  const readCurrent = (value: T): T => {
    if (!options.getOnInit) return value
    try {
      const serialized = localStorage.getItem(key)
      return serialized === null ? value : (JSON.parse(serialized) as T)
    } catch {
      return value
    }
  }
  return atom(
    (get) => {
      const config = readCurrent(get(storageAtom))
      const newConfig = repairConfig(config, defaultValue) as T

      if (newConfig !== config) {
        try {
          localStorage.setItem(key, JSON.stringify(newConfig))
        } catch {
          // Recovered settings still work when browser storage is unavailable.
        }
      }

      return newConfig
    },
    (get, set, update: SetStateActionWithReset<T>) => {
      if (typeof update === 'function') {
        const current = repairConfig(readCurrent(get(storageAtom)), defaultValue) as T
        set(storageAtom, update(current))
      } else {
        set(storageAtom, update)
      }
    },
  )
}
