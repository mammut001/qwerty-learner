export type PlayFrenchVoiceResult = 'played' | 'superseded' | 'unavailable'

export type PlayFrenchVoiceOptions = {
  volume?: number
  rate?: number
  loop?: boolean
  onStart?: () => void
  onEnd?: () => void
  token?: number
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      audioContext = new AudioCtx()
    }
  }
  return audioContext
}

function apiBase(): string {
  try {
    const configured = String(import.meta.env?.VITE_STUDY_API_BASE_URL ?? '').trim()
    return configured ? new URL(configured).origin : ''
  } catch {
    return ''
  }
}

const bufferCache = new Map<string, AudioBuffer>()
const inflightVoice = new Map<string, Promise<AudioBuffer>>()
let proxyUnavailable = false

type AvailabilityListener = (available: boolean) => void
const availabilityListeners = new Set<AvailabilityListener>()

export function isFrenchVoiceAvailable(): boolean {
  return !proxyUnavailable
}

export function subscribeFrenchVoiceAvailability(listener: AvailabilityListener): () => void {
  availabilityListeners.add(listener)
  return () => {
    availabilityListeners.delete(listener)
  }
}

function setProxyUnavailable() {
  if (!proxyUnavailable) {
    proxyUnavailable = true
    availabilityListeners.forEach((l) => l(false))
  }
}

export async function loadFrenchVoice(text: string): Promise<AudioBuffer> {
  const query = text.trim()
  if (!query) throw new Error('Query is empty')
  const key = query.toLowerCase()

  const cached = bufferCache.get(key)
  if (cached) {
    bufferCache.delete(key)
    bufferCache.set(key, cached)
    return cached
  }

  const inProgress = inflightVoice.get(key)
  if (inProgress) return inProgress

  const ctx = getAudioContext()
  if (!ctx) throw new Error('AudioContext is not supported')

  const fetchPromise = (async () => {
    const url = `${apiBase()}/api/study-plan/dictionary/voice?q=${encodeURIComponent(query)}`
    const response = await fetch(url, { credentials: 'include' })
    if (!response.ok) {
      // Only disable proxy permanently for the session if route itself is missing/forbidden (401, 403, 404, 405).
      // 502, 429, 5xx are transient or per-word; keep proxy enabled.
      if ([401, 403, 404, 405].includes(response.status)) {
        setProxyUnavailable()
      }
      throw new Error(`Voice proxy error: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      ctx.decodeAudioData(arrayBuffer, resolve, reject)
    })
    bufferCache.set(key, audioBuffer)
    if (bufferCache.size > 200) {
      const oldest = bufferCache.keys().next().value
      if (oldest) bufferCache.delete(oldest)
    }
    return audioBuffer
  })()

  inflightVoice.set(key, fetchPromise)
  try {
    return await fetchPromise
  } finally {
    inflightVoice.delete(key)
  }
}

export function prefetchFrenchVoice(text: string): void {
  void loadFrenchVoice(text).catch(() => undefined)
}

type ActivePlayback = {
  source: AudioBufferSourceNode
  gainNode: GainNode
  token: number
  onEnd?: () => void
  stopped: boolean
  stopTimer?: number
  fireEnd: () => void
}

let currentPlayback: ActivePlayback | null = null
let currentPlayId = 0
let currentPlaybackToken: number | null = null

let nextToken = 0
export function createPlaybackToken(): number {
  nextToken += 1
  return nextToken
}

function stopActive(active: ActivePlayback) {
  if (active.stopped) return
  active.stopped = true

  const ctx = getAudioContext()
  if (ctx && ctx.state !== 'closed') {
    try {
      const now = ctx.currentTime
      active.gainNode.gain.cancelScheduledValues(now)
      active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now)
      active.gainNode.gain.linearRampToValueAtTime(0, now + 0.02)
      active.source.stop(now + 0.03)
    } catch {
      try {
        active.source.stop()
      } catch {
        // Ignore stop error
      }
    }
  }

  active.stopTimer = window.setTimeout(() => {
    active.fireEnd()
  }, 35)
}

export function stopFrenchVoice(token?: number): void {
  // If token is provided, only stop if it matches the current active token
  if (token !== undefined && token !== currentPlaybackToken) {
    return
  }

  currentPlayId += 1
  currentPlaybackToken = null

  if (currentPlayback) {
    const active = currentPlayback
    currentPlayback = null
    stopActive(active)
  }
}

export function setFrenchVoiceLoop(loop: boolean, token?: number): void {
  if (token !== undefined && token !== currentPlaybackToken) {
    return
  }
  if (currentPlayback && !currentPlayback.stopped) {
    currentPlayback.source.loop = loop
  }
}

export async function playFrenchVoice(
  text: string,
  { volume = 1, rate = 1, loop = false, onStart, onEnd, token }: PlayFrenchVoiceOptions = {},
): Promise<PlayFrenchVoiceResult> {
  const ctx = getAudioContext()
  if (!ctx) return 'unavailable'

  currentPlayId += 1
  const thisPlayId = currentPlayId
  const thisToken = token ?? createPlaybackToken()
  currentPlaybackToken = thisToken

  if (currentPlayback) {
    const prev = currentPlayback
    currentPlayback = null
    stopActive(prev)
  }

  let buffer: AudioBuffer
  try {
    buffer = await loadFrenchVoice(text)
  } catch {
    return 'unavailable'
  }

  if (thisPlayId !== currentPlayId) {
    return 'superseded'
  }

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  } catch {
    return 'unavailable'
  }

  if (thisPlayId !== currentPlayId) {
    return 'superseded'
  }

  try {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = rate
    source.loop = loop

    const gainNode = ctx.createGain()
    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    const duration = buffer.duration / Math.max(rate, 0.01)

    // Gain starts at 0, linear ramp to volume over ~8 ms
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.008)

    // Fade out over last ~25 ms unless looping
    if (!loop && duration > 0.033) {
      const fadeOutStart = Math.max(now + 0.008, now + duration - 0.025)
      const fadeOutEnd = now + duration
      gainNode.gain.setValueAtTime(volume, fadeOutStart)
      gainNode.gain.linearRampToValueAtTime(0, fadeOutEnd)
    }

    let endFired = false
    const fireEnd = () => {
      if (endFired) return
      endFired = true
      if (active.stopTimer) window.clearTimeout(active.stopTimer)
      onEnd?.()
    }

    const active: ActivePlayback = {
      source,
      gainNode,
      token: thisToken,
      onEnd,
      stopped: false,
      fireEnd,
    }
    currentPlayback = active

    source.onended = () => {
      if (currentPlayback === active) {
        currentPlayback = null
        if (currentPlaybackToken === thisToken) {
          currentPlaybackToken = null
        }
      }
      fireEnd()
    }

    source.start(now)
    onStart?.()
    return 'played'
  } catch {
    return 'unavailable'
  }
}
