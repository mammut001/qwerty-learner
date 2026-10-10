import { safeSpeak, stopSpeechSynthesis, type SafeSpeakOptions } from '@/utils/speechSynthesis'
import { useCallback, useEffect, useRef, useState } from 'react'

export type UseSpeechResult = {
  /**
   * Speak speaking
   * @param {boolean} [abort=false] Whether to cancel other speak
   */
  speak: (abort?: boolean) => void
  /**
   * Cancel speaking
   */
  cancel: () => void
  /**
   * Whether currently speaking
   */
  speaking: boolean
}

/**
 * React hook for using the SpeechSynthesis API.
 * @param {string} text The text to be spoken.
 * @param {Partial<SpeechSynthesisUtterance>} option SpeechSynthesisUtterance API option. {@link https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance#instance_properties}
 * @returns {Object} An object containing `speak`, `cancel` methods and `speaking` state.
 * @throws {Error} If browser not support SpeechSynthesis API.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API}
 */
export default function useSpeech(text: string, option?: Partial<SpeechSynthesisUtterance>): UseSpeechResult {
  const [speaking, setSpeaking] = useState(false)
  const isMountedRef = useRef(true)
  const textRef = useRef(text)
  const optionRef = useRef(option)

  textRef.current = text
  optionRef.current = option

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopSpeechSynthesis()
      setSpeaking(false)
    }
  }, [])

  const cancel = useCallback(() => {
    stopSpeechSynthesis()
    if (isMountedRef.current) {
      setSpeaking(false)
    }
  }, [])

  const speak = useCallback((_abort = false) => {
    const currentText = textRef.current
    if (!currentText) return

    const speakOptions: SafeSpeakOptions = {
      ...optionRef.current,
      onStart: () => {
        if (isMountedRef.current) {
          setSpeaking(true)
        }
      },
      onEnd: () => {
        if (isMountedRef.current) {
          setSpeaking(false)
        }
      },
      onError: () => {
        if (isMountedRef.current) {
          setSpeaking(false)
        }
      },
    }

    safeSpeak(currentText, speakOptions)
  }, [])

  return {
    speak,
    cancel,
    speaking,
  }
}
