/**
 * Safe SpeechSynthesis utility for browser text-to-speech.
 *
 * Resolves browser/OS issues:
 * 1. Single-use SpeechSynthesisUtterance lifecycle: Never reuse consumed utterances.
 * 2. Voice lookup: Explicitly finds and binds Canadian French (fr-CA) or French (fr) voice.
 * 3. Chrome GC bug: Shields active utterance in module reference until onend/onerror fires.
 * 4. Cancel/Speak race condition: On macOS Chromium, immediately calling speak() after cancel()
 *    emits an interrupted error that triggers the system NSBeep alert sound ("滴" 一声).
 *    A slight delay (25ms) allows Chrome's audio subsystem to cleanly finalize cancel.
 * 5. Apostrophe & punctuation normalization: Normalizes curly apostrophes (’ / ʼ / ʻ) to standard (').
 */

let globalActiveUtterance: SpeechSynthesisUtterance | null = null
let cancelTimeoutId: number | null = null

export function selectBestVoice(targetLang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices?.() || []
  if (!voices.length) return null

  const normTarget = targetLang.toLowerCase().replace(/_/g, '-')
  // 1. Exact match (e.g. 'fr-ca')
  const exact = voices.find((v) => v.lang.toLowerCase().replace(/_/g, '-') === normTarget)
  if (exact) return exact

  // 2. Language prefix match (e.g. 'fr-fr', 'fr')
  const langPrefix = normTarget.split('-')[0]
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().replace(/_/g, '-').startsWith(langPrefix))
  if (prefixMatch) return prefixMatch

  return null
}

export type SafeSpeakOptions = Partial<SpeechSynthesisUtterance> & {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

export function stopSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (cancelTimeoutId !== null) {
    window.clearTimeout(cancelTimeoutId)
    cancelTimeoutId = null
  }
  globalActiveUtterance = null
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Ignore error on cancel
  }
}

export function safeSpeak(text: string, options?: SafeSpeakOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    options?.onError?.('not-supported')
    return false
  }

  const cleaned = text.replace(/[’ʼʻ]/g, "'").trim()
  if (!cleaned) {
    options?.onEnd?.()
    return false
  }

  const synth = window.speechSynthesis

  if (cancelTimeoutId !== null) {
    window.clearTimeout(cancelTimeoutId)
    cancelTimeoutId = null
  }

  const shouldCancel = synth.speaking || synth.pending
  if (shouldCancel) {
    try {
      synth.cancel()
    } catch {
      // Ignore cancel error
    }
  }

  const doSpeak = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleaned)
      if (options) {
        if (options.rate !== undefined) utterance.rate = options.rate
        if (options.pitch !== undefined) utterance.pitch = options.pitch
        if (options.volume !== undefined) utterance.volume = options.volume
        if (options.lang !== undefined) utterance.lang = options.lang
      }

      const targetLang = options?.lang || 'fr-CA'
      const voice = options?.voice || selectBestVoice(targetLang)
      if (voice) {
        utterance.voice = voice
      }

      // Shield from V8 garbage collection mid-speech
      globalActiveUtterance = utterance

      let finished = false
      const cleanup = () => {
        if (finished) return
        finished = true
        if (globalActiveUtterance === utterance) {
          globalActiveUtterance = null
        }
      }

      utterance.onstart = () => {
        options?.onStart?.()
      }

      utterance.onend = () => {
        cleanup()
        options?.onEnd?.()
      }

      utterance.onerror = (event) => {
        cleanup()
        // Ignore deliberate user cancellations
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.warn('SpeechSynthesis error:', event.error)
        }
        options?.onError?.(event.error)
      }

      synth.speak(utterance)
      return true
    } catch (err) {
      globalActiveUtterance = null
      console.warn('Failed to start SpeechSynthesis:', err)
      options?.onError?.(String(err))
      return false
    }
  }

  // If canceling previous utterance, defer speak slightly (25ms) so Chrome's audio subsystem
  // finishes the cancellation event and doesn't fire an interrupted error with alert beep.
  if (shouldCancel) {
    cancelTimeoutId = window.setTimeout(() => {
      cancelTimeoutId = null
      doSpeak()
    }, 25)
    return true
  }

  return doSpeak()
}
