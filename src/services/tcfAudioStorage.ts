import { tcfAudioDbName } from './localProfile'

const DB_VERSION = 1
const STORE_NAME = 'recordings'

export type AudioRecordingItem = {
  id: string
  blob: Blob
  mimeType: string
  durationSeconds: number
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not available in this environment.'))
    }
    const request = indexedDB.open(tcfAudioDbName(), DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveAudioRecording(id: string, blob: Blob, mimeType = 'audio/webm', durationSeconds = 0): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const item: AudioRecordingItem = {
      id,
      blob,
      mimeType,
      durationSeconds,
      createdAt: Date.now(),
    }
    store.put(item)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function getAudioRecording(id: string): Promise<AudioRecordingItem | null> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(id)
      request.onsuccess = () => {
        db.close()
        resolve(request.result ?? null)
      }
      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch {
    return null
  }
}

export async function deleteAudioRecording(id: string): Promise<void> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(id)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    })
  } catch {
    // Ignore deletion errors on missing database
  }
}
