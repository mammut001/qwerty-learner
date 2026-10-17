import { safeSpeak, stopSpeechSynthesis } from '../utils/speechSynthesis'
import { TCF_LISTENING_BASE_URL, TCF_LISTENING_VERSION, mirrorListeningPath } from '../utils/tcfListeningAudioKey.mjs'
import { VOICE_MIRROR_PATH } from '../utils/voiceMirror.mjs'

export interface TcfListeningManifest {
  version: string
  base: string
  items: Record<string, string>
}

let manifestCache: TcfListeningManifest | null = null
let manifestPromise: Promise<TcfListeningManifest | null> | null = null

// The self-hosted mirror only exists on the main deployment; the GitHub Pages build has no /voice-audio/.
function hasVoiceMirror(): boolean {
  return typeof REACT_APP_DEPLOY_ENV === 'undefined' || REACT_APP_DEPLOY_ENV !== 'pages'
}

export function setListeningManifestCacheForTest(manifest: TcfListeningManifest | null): void {
  manifestCache = manifest
  manifestPromise = null
}

export function getListeningManifestCache(): TcfListeningManifest | null {
  return manifestCache
}

export async function loadListeningManifest(): Promise<TcfListeningManifest | null> {
  if (manifestCache) return manifestCache
  if (manifestPromise) return manifestPromise

  manifestPromise = (async () => {
    try {
      const prefix = typeof REACT_APP_DEPLOY_ENV !== 'undefined' && REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
      const hash = typeof LATEST_COMMIT_HASH !== 'undefined' ? LATEST_COMMIT_HASH : ''
      const query = hash ? `?v=${encodeURIComponent(hash)}` : ''
      const response = await fetch(`${prefix}/voice/tcf-listening-manifest.json${query}`)
      if (!response.ok) return null
      const data = (await response.json()) as TcfListeningManifest
      if (!data || typeof data.items !== 'object' || data.items === null) return null
      manifestCache = {
        version: data.version || TCF_LISTENING_VERSION,
        base: data.base || TCF_LISTENING_BASE_URL,
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
 * Resolves candidate URLs in order for a question ID:
 * 1. Same-origin mirror (/voice-audio/listening/v1/<key>.mp3)
 * 2. GCS public URL (<base>/listening/v1/<key>.mp3)
 * Returns [] if not found in manifest.
 */
export function resolveListeningAudioCandidates(questionId: string, manifest: TcfListeningManifest | null): string[] {
  if (!manifest || !manifest.items) return []
  const key = manifest.items[questionId]
  if (!key) return []

  const version = manifest.version || TCF_LISTENING_VERSION
  const rel = mirrorListeningPath(key, version)
  const candidates: string[] = []

  if (hasVoiceMirror()) {
    candidates.push(`${VOICE_MIRROR_PATH}/${rel}`)
  }

  const base = String(manifest.base || TCF_LISTENING_BASE_URL).replace(/\/+$/, '')
  candidates.push(`${base}/${rel}`)

  return candidates
}

export async function lookupListeningAudioCandidates(questionId: string): Promise<string[]> {
  const manifest = await loadListeningManifest()
  return resolveListeningAudioCandidates(questionId, manifest)
}

let activeAudio: HTMLAudioElement | null = null
let currentPlaybackToken = 0

export function stopListeningAudio(): void {
  currentPlaybackToken += 1
  if (activeAudio) {
    try {
      activeAudio.onplay = null
      activeAudio.onended = null
      activeAudio.onerror = null
      activeAudio.pause()
      activeAudio.currentTime = 0
      activeAudio.src = ''
    } catch {
      // Ignore cleanup error
    }
    activeAudio = null
  }
  stopSpeechSynthesis()
}

export interface PlayListeningAudioOptions {
  onError?: (err: string) => void
  onStart?: () => void
  onEnd?: () => void
}

function playAudioUrl(url: string, isCurrent: () => boolean, options: PlayListeningAudioOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (typeof Audio === 'undefined') {
      resolve(false)
      return
    }

    try {
      const audio = new Audio(url)
      audio.playbackRate = 1.0

      let started = false
      let settled = false

      const settle = (success: boolean) => {
        if (settled) return
        settled = true
        if (!success && activeAudio === audio) {
          activeAudio = null
        }
        resolve(success)
      }

      audio.onplay = () => {
        started = true
        if (isCurrent()) {
          activeAudio = audio
          options.onStart?.()
        }
      }

      audio.onended = () => {
        if (activeAudio === audio) {
          activeAudio = null
        }
        if (isCurrent()) {
          options.onEnd?.()
        }
      }

      audio.onerror = () => {
        if (!started) {
          settle(false)
        }
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.then(
          () => {
            if (!isCurrent()) {
              try {
                audio.pause()
                audio.src = ''
              } catch {
                // Ignore
              }
              settle(false)
              return
            }
            settle(true)
          },
          () => {
            settle(false)
          },
        )
      } else {
        settle(true)
      }
    } catch {
      resolve(false)
    }
  })
}

/**
 * Plays the pre-generated natural audio clip for a TCF listening question.
 * Tries the candidate URLs in order using HTMLAudioElement.
 * If no MP3 is in the manifest or all candidate URLs fail, falls back to safeSpeak.
 */
export async function playListeningQuestionAudio(
  question: { id: string; audioText?: string },
  options: PlayListeningAudioOptions = {},
): Promise<'played-audio' | 'played-speech' | 'failed'> {
  stopListeningAudio()

  const myToken = currentPlaybackToken
  const isCurrent = () => myToken === currentPlaybackToken

  let candidates: string[] = []
  try {
    candidates = await lookupListeningAudioCandidates(question.id)
  } catch {
    candidates = []
  }

  if (!isCurrent()) return 'failed'

  if (candidates.length > 0) {
    for (const url of candidates) {
      if (!isCurrent()) return 'failed'
      const played = await playAudioUrl(url, isCurrent, options)
      if (played) return 'played-audio'
    }
  }

  // Fall back to browser speech synthesis
  if (!isCurrent()) return 'failed'

  const ok = safeSpeak(question.audioText ?? '', {
    lang: 'fr-CA',
    rate: 0.92,
    onStart: () => {
      if (isCurrent()) options.onStart?.()
    },
    onEnd: () => {
      if (isCurrent()) options.onEnd?.()
    },
    onError: (err) => {
      if (isCurrent()) options.onError?.(err)
    },
  })

  if (!ok && (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined')) {
    options.onError?.('not-supported')
    return 'failed'
  }

  return 'played-speech'
}
