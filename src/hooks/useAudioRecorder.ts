import { useCallback, useEffect, useRef, useState } from 'react'

export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return ''
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  for (const c of candidates) {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return ''
}

export type UseAudioRecorderOptions = {
  maxDurationSeconds?: number
  onMaxDuration?: () => void
}

export type UseAudioRecorderReturn = {
  isRecording: boolean
  elapsedSeconds: number
  blob: Blob | null
  audioUrl: string | null
  error: string | null
  start: () => Promise<boolean>
  stop: () => void
  reset: () => void
  supported: boolean
  mimeType: string
}

export function useAudioRecorder({
  maxDurationSeconds = 180,
  onMaxDuration,
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const mimeTypeRef = useRef<string>('')
  const onMaxDurationRef = useRef(onMaxDuration)
  onMaxDurationRef.current = onMaxDuration

  const supported = typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia)

  const cleanupAudioUrl = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
  }, [])

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Ignore stop error
      }
    }
    stopTracks()
    setIsRecording(false)
  }, [clearTimer, stopTracks])

  const reset = useCallback(() => {
    stop()
    cleanupAudioUrl()
    setBlob(null)
    setElapsedSeconds(0)
    setError(null)
    chunksRef.current = []
  }, [stop, cleanupAudioUrl])

  const start = useCallback(async (): Promise<boolean> => {
    reset()
    if (!supported) {
      setError('当前浏览器不支持录音功能')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const pickedMime = getSupportedAudioMimeType()
      mimeTypeRef.current = pickedMime

      const recorder = pickedMime ? new MediaRecorder(stream, { mimeType: pickedMime }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeTypeRef.current || 'audio/webm',
        })
        setBlob(recordedBlob)
        const url = URL.createObjectURL(recordedBlob)
        setAudioUrl(url)
        stopTracks()
      }

      recorder.onerror = () => {
        setError('录音过程中发生错误')
        stop()
      }

      recorder.start(500)
      startTimeRef.current = Date.now()
      setIsRecording(true)

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)
        if (elapsed >= maxDurationSeconds) {
          stop()
          onMaxDurationRef.current?.()
        }
      }, 500)

      return true
    } catch (err) {
      stopTracks()
      const errorObj = err as Error
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        setError('未获得麦克风权限，请在浏览器中允许使用麦克风')
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        setError('未检测到可用的麦克风设备')
      } else {
        setError('无法启动麦克风录音，请检查设备权限')
      }
      return false
    }
  }, [maxDurationSeconds, reset, stop, stopTracks, supported])

  useEffect(() => {
    return () => {
      clearTimer()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          // Ignore cleanup error on unmount
        }
      }
      stopTracks()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl, clearTimer, stopTracks])

  return {
    isRecording,
    elapsedSeconds,
    blob,
    audioUrl,
    error,
    start,
    stop,
    reset,
    supported,
    mimeType: mimeTypeRef.current,
  }
}

export default useAudioRecorder
