import { useCallback, useEffect, useRef, useState } from 'react'

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> }
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionConstructor = new () => Recognition

const recognitionConstructor = (): RecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

/**
 * Browser speech-to-text in Québec French. `onFinal` receives each finished phrase;
 * the browser may stop on silence, so the hook restarts until `stop()` is called.
 */
export default function useFrenchSpeechRecognition(onFinal: (phrase: string) => void) {
  const Constructor = recognitionConstructor()
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<Recognition | null>(null)
  const wantedRef = useRef(false)
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  const stop = useCallback(() => {
    wantedRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    if (!Constructor) return
    const recognition = new Constructor()
    recognition.lang = 'fr-CA'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let pending = ''
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]
        if (result.isFinal) onFinalRef.current(result[0].transcript.trim())
        else pending += result[0].transcript
      }
      setInterim(pending)
    }
    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      wantedRef.current = false
      setError(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? '麦克风或语音识别权限被拒绝，请手动输入你说的内容。'
          : '语音识别暂时不可用，请手动输入你说的内容。',
      )
    }
    recognition.onend = () => {
      if (wantedRef.current) recognition.start()
      else setListening(false)
    }
    recognitionRef.current = recognition
    wantedRef.current = true
    setError(null)
    setListening(true)
    recognition.start()
  }, [Constructor])

  useEffect(() => stop, [stop])

  return { supported: Boolean(Constructor), listening, interim, error, start, stop }
}
