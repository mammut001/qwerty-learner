import { parseEchelleItemId, registerIndicatorScenarios } from './echelleCurriculum'

export type EchelleBatchKey = 'n01-02' | 'n03-04' | 'n05-06' | 'n07-08' | 'n09-10' | 'n11-12'

export function getBatchKeyForLevel(level: number): EchelleBatchKey | null {
  if (level >= 1 && level <= 2) return 'n01-02'
  if (level >= 3 && level <= 4) return 'n03-04'
  if (level >= 5 && level <= 6) return 'n05-06'
  if (level >= 7 && level <= 8) return 'n07-08'
  if (level >= 9 && level <= 10) return 'n09-10'
  if (level >= 11 && level <= 12) return 'n11-12'
  return null
}

export function getBatchKeyForItemId(itemId: string): EchelleBatchKey | null {
  const parsed = parseEchelleItemId(itemId)
  if (!parsed) return null
  return getBatchKeyForLevel(parsed.level)
}

export const BATCH_EXPORT_NAMES: Record<EchelleBatchKey, string> = {
  'n01-02': 'N01_02_SCENARIOS',
  'n03-04': 'N03_04_SCENARIOS',
  'n05-06': 'N05_06_SCENARIOS',
  'n07-08': 'N07_08_SCENARIOS',
  'n09-10': 'N09_10_SCENARIOS',
  'n11-12': 'N11_12_SCENARIOS',
}

export type EchelleBatchLoaderFn = () => Promise<Record<string, unknown>>

const DEFAULT_BATCH_LOADERS: Record<EchelleBatchKey, EchelleBatchLoaderFn> = {
  'n01-02': () => import('../../server/echelle-variants/n01-02.mjs'),
  'n03-04': () => import('../../server/echelle-variants/n03-04.mjs'),
  'n05-06': () => import('../../server/echelle-variants/n05-06.mjs'),
  'n07-08': () => import('../../server/echelle-variants/n07-08.mjs'),
  'n09-10': () => import('../../server/echelle-variants/n09-10.mjs'),
  'n11-12': () => import('../../server/echelle-variants/n11-12.mjs'),
}

let batchLoaders: Record<EchelleBatchKey, EchelleBatchLoaderFn> = { ...DEFAULT_BATCH_LOADERS }

export function setBatchLoaderForTest(key: EchelleBatchKey, loader?: EchelleBatchLoaderFn): void {
  if (loader) {
    batchLoaders[key] = loader
  } else {
    batchLoaders[key] = DEFAULT_BATCH_LOADERS[key]
  }
}

export function resetBatchLoaderStateForTest(): void {
  batchLoaders = { ...DEFAULT_BATCH_LOADERS }
  loadedBatches.clear()
  batchPromises.clear()
}

const loadedBatches = new Set<EchelleBatchKey>()
const batchPromises = new Map<EchelleBatchKey, Promise<boolean>>()

export function isLevelBatchLoaded(level: number): boolean {
  const key = getBatchKeyForLevel(level)
  return !key || loadedBatches.has(key)
}

export function isItemBatchLoaded(itemId: string): boolean {
  const key = getBatchKeyForItemId(itemId)
  return !key || loadedBatches.has(key)
}

export async function ensureLevelBatchLoaded(level: number): Promise<boolean> {
  const key = getBatchKeyForLevel(level)
  if (!key) return true
  if (loadedBatches.has(key)) return true
  const pending = batchPromises.get(key)
  if (pending) return pending

  const promise = (async () => {
    try {
      const loader = batchLoaders[key]
      if (!loader) return false
      const mod = await loader()
      const exportName = BATCH_EXPORT_NAMES[key]
      const scenarios = mod?.[exportName]
      if (!scenarios || typeof scenarios !== 'object' || Array.isArray(scenarios)) {
        const error = new Error(`[echelleBatchLoader] Missing export "${exportName}" in batch "${key}"`)
        if (process.env.NODE_ENV !== 'production') {
          throw error
        }
        return false
      }
      registerIndicatorScenarios(scenarios as Record<string, unknown>)
      loadedBatches.add(key)
      return true
    } catch (err) {
      if (
        process.env.NODE_ENV !== 'production' &&
        err instanceof Error &&
        err.message.includes('[echelleBatchLoader] Missing export')
      ) {
        throw err
      }
      return false
    } finally {
      batchPromises.delete(key)
    }
  })()

  batchPromises.set(key, promise)
  return promise
}

export async function ensureItemBatchLoaded(itemId: string): Promise<boolean> {
  const parsed = parseEchelleItemId(itemId)
  if (!parsed) return true
  return ensureLevelBatchLoaded(parsed.level)
}
