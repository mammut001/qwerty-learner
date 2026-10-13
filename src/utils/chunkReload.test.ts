import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CHUNK_RELOAD_STORAGE_KEY,
  StorageLike,
  handleChunkReload,
  isChunkLoadError,
  setupChunkReloadListener,
} from './chunkReload'

function createMockStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem(key: string) {
      return data[key] ?? null
    },
    setItem(key: string, value: string) {
      data[key] = value
    },
  }
}

test('detects each chunk-error message', () => {
  const messages = [
    'Failed to fetch dynamically imported module: https://example.com/assets/Typing-123.js',
    'TypeError: error loading dynamically imported module /assets/Levels-456.js',
    'Importing a module script failed.',
    'Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html". is not a valid JavaScript MIME type.',
    'is not a valid JavaScript MIME type',
  ]

  for (const message of messages) {
    assert.equal(isChunkLoadError(new Error(message)), true, `Expected "${message}" to be detected as chunk error`)
    assert.equal(isChunkLoadError(message), true, `Expected string "${message}" to be detected as chunk error`)
  }

  // Name check
  const chunkLoadError = new Error('Loading chunk 12 failed')
  chunkLoadError.name = 'ChunkLoadError'
  assert.equal(isChunkLoadError(chunkLoadError), true)
  assert.equal(isChunkLoadError({ name: 'ChunkLoadError' }), true)

  // Vite preload error event with payload
  assert.equal(isChunkLoadError({ type: 'vite:preloadError' }), true)
  assert.equal(
    isChunkLoadError({
      type: 'vite:preloadError',
      payload: new Error('Failed to fetch dynamically imported module'),
    }),
    true,
  )
})

test('ignores unrelated errors', () => {
  const unrelatedErrors = [
    new Error('Network error'),
    new Error('Failed to fetch'),
    new TypeError('Cannot read properties of null (reading "map")'),
    new Error('404 Not Found'),
    new Error('syntax error: unexpected token <'),
    null,
    undefined,
    '',
    123,
    {},
  ]

  for (const error of unrelatedErrors) {
    assert.equal(isChunkLoadError(error), false)
    assert.equal(handleChunkReload(error), false)
  }
})

test('first failure triggers reload', () => {
  const storage = createMockStorage()
  let reloads = 0
  const chunkError = new Error('Failed to fetch dynamically imported module: /assets/index.js')

  const result = handleChunkReload(chunkError, {
    now: () => 1000,
    storage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, true)
  assert.equal(reloads, 1)
  assert.equal(storage.data[CHUNK_RELOAD_STORAGE_KEY], '1000')
})

test('second failure inside 60 s does not reload', () => {
  const storage = createMockStorage({ [CHUNK_RELOAD_STORAGE_KEY]: '1000' })
  let reloads = 0
  const chunkError = new Error('error loading dynamically imported module /assets/index.js')

  // 30 seconds after previous reload (inside 60 s cooldown)
  const result = handleChunkReload(chunkError, {
    now: () => 31000,
    storage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, false)
  assert.equal(reloads, 0)
  assert.equal(storage.data[CHUNK_RELOAD_STORAGE_KEY], '1000')
})

test('after 60 s it reloads again', () => {
  const storage = createMockStorage({ [CHUNK_RELOAD_STORAGE_KEY]: '1000' })
  let reloads = 0
  const chunkError = new Error('Importing a module script failed.')

  // 61 seconds after previous reload (after 60 s cooldown)
  const result = handleChunkReload(chunkError, {
    now: () => 62000,
    storage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, true)
  assert.equal(reloads, 1)
  assert.equal(storage.data[CHUNK_RELOAD_STORAGE_KEY], '62000')
})

test('storage null does not reload', () => {
  let reloads = 0
  const chunkError = new Error('Failed to fetch dynamically imported module: /assets/page.js')

  const result = handleChunkReload(chunkError, {
    now: () => 1000,
    storage: null,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, false)
  assert.equal(reloads, 0)
})

test('storage that throws does not reload', () => {
  const throwingStorage: StorageLike = {
    getItem() {
      throw new Error('sessionStorage access denied')
    },
    setItem() {
      throw new Error('sessionStorage access denied')
    },
  }
  let reloads = 0
  const chunkError = new Error('Failed to fetch dynamically imported module: /assets/page.js')

  const result = handleChunkReload(chunkError, {
    now: () => 1000,
    storage: throwingStorage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, false)
  assert.equal(reloads, 0)
})

test('storage setItem that throws does not reload', () => {
  const throwingSetItemStorage: StorageLike = {
    getItem() {
      return null
    },
    setItem() {
      throw new Error('QuotaExceededError')
    },
  }
  let reloads = 0
  const chunkError = new Error('is not a valid JavaScript MIME type')

  const result = handleChunkReload(chunkError, {
    now: () => 1000,
    storage: throwingSetItemStorage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(result, false)
  assert.equal(reloads, 0)
})

test('setupChunkReloadListener routes vite:preloadError event and calls preventDefault', () => {
  const listeners: Record<string, ((event: Event) => void)[]> = {}
  const mockTarget = {
    addEventListener(type: string, listener: (event: Event) => void) {
      listeners[type] = listeners[type] || []
      listeners[type].push(listener)
    },
    removeEventListener(type: string, listener: (event: Event) => void) {
      listeners[type] = (listeners[type] || []).filter((l) => l !== listener)
    },
  }

  const storage = createMockStorage()
  let reloads = 0
  const cleanup = setupChunkReloadListener(mockTarget as unknown as EventTarget, {
    now: () => 1000,
    storage,
    reload: () => {
      reloads++
    },
  })

  assert.equal(listeners['vite:preloadError']?.length, 1)

  let prevented = false
  const mockEvent = {
    type: 'vite:preloadError',
    payload: new Error('Failed to fetch dynamically imported module: /assets/foo.js'),
    preventDefault() {
      prevented = true
    },
  } as unknown as Event

  // Dispatch event - should reload and preventDefault
  listeners['vite:preloadError'][0](mockEvent)
  assert.equal(reloads, 1)
  assert.equal(prevented, true)

  // Dispatch again inside cooldown - should NOT reload, should NOT preventDefault
  let preventedSecond = false
  const secondMockEvent = {
    type: 'vite:preloadError',
    payload: new Error('Failed to fetch dynamically imported module: /assets/foo.js'),
    preventDefault() {
      preventedSecond = true
    },
  } as unknown as Event

  listeners['vite:preloadError'][0](secondMockEvent)
  assert.equal(reloads, 1)
  assert.equal(preventedSecond, false)

  cleanup()
  assert.equal(listeners['vite:preloadError']?.length, 0)
})
