import { parseEchelleItemId, registerIndicatorScenarios, scoreEchelleItem } from './echelleCurriculum'
import { type EchelleMemoryFields, nextMemory } from './echelleMemory'

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

const BATCH_LOADERS: Record<EchelleBatchKey, () => Promise<Record<string, unknown>>> = {
  'n01-02': () => import('../../server/echelle-variants/n01-02.mjs'),
  'n03-04': () => import('../../server/echelle-variants/n03-04.mjs'),
  'n05-06': () => import('../../server/echelle-variants/n05-06.mjs'),
  'n07-08': () => import('../../server/echelle-variants/n07-08.mjs'),
  'n09-10': () => import('../../server/echelle-variants/n09-10.mjs'),
  'n11-12': () => import('../../server/echelle-variants/n11-12.mjs'),
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
      const loader = BATCH_LOADERS[key]
      if (!loader) return false
      const mod = await loader()
      const exportName = `N${key.replace('-', '_').toUpperCase()}_SCENARIOS`
      const scenarios =
        mod[exportName] ||
        Object.values(mod).find((v) => v && typeof v === 'object' && !Array.isArray(v))
      if (scenarios && typeof scenarios === 'object') {
        registerIndicatorScenarios(scenarios as Record<string, unknown>)
      }
      loadedBatches.add(key)
      return true
    } catch {
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

type EchellePendingOp = {
  kind: string
  itemId?: string
  answers?: string[]
  response?: unknown
  variant?: number
  updatedAt?: number
}

type EchellePendingMutation = {
  operations?: EchellePendingOp[]
}

type EchelleSyncRecord = Partial<EchelleMemoryFields> & {
  mastered: boolean
  attempts?: number
  updatedAt?: number
  [key: string]: unknown
}

export async function replayPendingEchelleMutations<
  T extends {
    learning: {
      echelle: {
        items: Record<string, EchelleSyncRecord>
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  },
>(
  mutations: EchellePendingMutation[],
  getState: () => T,
  saveState: (s: T) => void,
): Promise<number> {
  let replayedCount = 0
  for (const mut of mutations) {
    for (const op of mut.operations || []) {
      if (
        op.kind === 'echelleCheck' &&
        typeof op.itemId === 'string' &&
        typeof op.variant === 'number' &&
        op.variant > 0 &&
        typeof op.updatedAt === 'number'
      ) {
        const loaded = await ensureItemBatchLoaded(op.itemId)
        if (loaded) {
          const responseObj =
            typeof op.response === 'object' && op.response !== null && !Array.isArray(op.response)
              ? (op.response as Record<string, unknown>)
              : {}
          const meta = {
            ...responseObj,
            variant: op.variant,
          }
          const result = scoreEchelleItem(op.itemId, op.answers, meta)
          if (result) {
            const current = getState()
            const existing = current.learning?.echelle?.items?.[op.itemId]
            if (!existing || op.updatedAt >= (existing.updatedAt ?? 0)) {
              const record: EchelleSyncRecord = {
                ...nextMemory(existing, result.mastered, op.updatedAt),
                score: result.score,
                attempts: existing?.attempts ?? 1,
                updatedAt: op.updatedAt,
                method: 'check',
                response: op.response ?? op.answers,
                variant: op.variant,
              }
              saveState({
                ...current,
                learning: {
                  ...current.learning,
                  echelle: {
                    items: { ...current.learning?.echelle?.items, [op.itemId]: record },
                  },
                },
              })
              replayedCount++
            }
          }
        }
      }
    }
  }
  return replayedCount
}
