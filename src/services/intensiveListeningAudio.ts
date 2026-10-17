import { INTENSIVE_AUDIO_BASE_URL, INTENSIVE_AUDIO_VERSION } from '../utils/intensiveListeningAudioKey.mjs'
import { VOICE_MIRROR_PATH, mirrorIntensivePath } from '../utils/voiceMirror.mjs'

export interface SentenceSegment {
  start: number
  end: number
}

export interface IntensiveManifestItem {
  key: string
  segments: SentenceSegment[]
}

export interface IntensiveListeningManifest {
  version: string
  base: string
  items: Record<string, IntensiveManifestItem>
}

let manifestCache: IntensiveListeningManifest | null = null
let manifestPromise: Promise<IntensiveListeningManifest | null> | null = null

function hasVoiceMirror(): boolean {
  return typeof REACT_APP_DEPLOY_ENV === 'undefined' || REACT_APP_DEPLOY_ENV !== 'pages'
}

export function setIntensiveManifestCacheForTest(manifest: IntensiveListeningManifest | null): void {
  manifestCache = manifest
  manifestPromise = null
}

export function getIntensiveManifestCache(): IntensiveListeningManifest | null {
  return manifestCache
}

export async function loadIntensiveManifest(): Promise<IntensiveListeningManifest | null> {
  if (manifestCache) return manifestCache
  if (manifestPromise) return manifestPromise

  manifestPromise = (async () => {
    try {
      const prefix = typeof REACT_APP_DEPLOY_ENV !== 'undefined' && REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
      const hash = typeof LATEST_COMMIT_HASH !== 'undefined' ? LATEST_COMMIT_HASH : ''
      const query = hash ? `?v=${encodeURIComponent(hash)}` : ''
      const response = await fetch(`${prefix}/voice/intensive-listening-manifest.json${query}`)
      if (!response.ok) return null
      const data = (await response.json()) as IntensiveListeningManifest
      if (!data || typeof data.items !== 'object' || data.items === null) return null
      manifestCache = {
        version: data.version || INTENSIVE_AUDIO_VERSION,
        base: data.base || INTENSIVE_AUDIO_BASE_URL,
        items: data.items,
      }
      return manifestCache
    } catch {
      return null
    } finally {
      manifestPromise = null
    }
  })()

  return manifestPromise
}

/**
 * Resolves candidate audio URLs in order for a given passage ID:
 * 1. Self-hosted same-origin mirror (/voice-audio/intensive/v1/<key>.mp3)
 * 2. GCS public bucket URL (<base>/intensive/v1/<key>.mp3)
 * Returns [] if passage is not yet in manifest or has no key.
 */
export function resolveIntensiveAudioCandidates(
  passageId: string,
  manifest: IntensiveListeningManifest | null,
  forceMirrorCheck?: boolean,
): string[] {
  if (!manifest || !manifest.items) return []
  const entry = manifest.items[passageId]
  if (!entry || !entry.key) return []

  const version = manifest.version || INTENSIVE_AUDIO_VERSION
  const rel = mirrorIntensivePath(entry.key, version)
  const candidates: string[] = []

  const useMirror = forceMirrorCheck !== undefined ? forceMirrorCheck : hasVoiceMirror()
  if (useMirror) {
    candidates.push(`${VOICE_MIRROR_PATH}/${rel}`)
  }

  const base = String(manifest.base || INTENSIVE_AUDIO_BASE_URL).replace(/\/+$/, '')
  candidates.push(`${base}/${rel}`)

  return candidates
}

export async function lookupIntensiveAudioCandidates(passageId: string): Promise<string[]> {
  const manifest = await loadIntensiveManifest()
  return resolveIntensiveAudioCandidates(passageId, manifest)
}
