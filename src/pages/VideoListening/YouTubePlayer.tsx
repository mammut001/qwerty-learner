import type { YouTubePlayerInstance } from './types'
import type { VideoLesson } from '@/resources/videoLessons'
import type React from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import IconAlertCircle from '~icons/tabler/alert-circle'
import IconRefresh from '~icons/tabler/refresh'

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string | HTMLElement, options: Record<string, unknown>) => YouTubePlayerInstance
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YouTubePlayerProps {
  lesson: VideoLesson
  onReady: (player: YouTubePlayerInstance) => void
  onError?: (error: unknown) => void
  onStateChange?: (state: number) => void
}

let ytApiScriptPromise: Promise<void> | null = null

function loadYouTubeIframeApi(timeoutMs = 8000): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not defined'))
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve()
  }

  if (ytApiScriptPromise) {
    return ytApiScriptPromise
  }

  ytApiScriptPromise = new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const handleTimeout = () => {
      ytApiScriptPromise = null
      reject(new Error('YT_LOAD_TIMEOUT'))
    }

    timer = setTimeout(handleTimeout, timeoutMs)

    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (timer) clearTimeout(timer)
      if (prevReady) {
        try {
          prevReady()
        } catch {
          // ignore previous ready callback failures
        }
      }
      resolve()
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => {
        if (timer) clearTimeout(timer)
        ytApiScriptPromise = null
        reject(new Error('YT_SCRIPT_ERROR'))
      }
      document.body.appendChild(script)
    }
  })

  return ytApiScriptPromise
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ lesson, onReady, onError, onStateChange }) => {
  const containerId = useId().replace(/:/g, '_')
  const [loadError, setLoadError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryNonce, setRetryNonce] = useState(0)
  const playerRef = useRef<YouTubePlayerInstance | null>(null)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setLoadError(false)

    loadYouTubeIframeApi(8000)
      .then(() => {
        if (isCancelled) return

        if (!window.YT || !window.YT.Player) {
          throw new Error('YT_NOT_AVAILABLE')
        }

        // Clean up previous instance if any
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy()
          } catch {
            // ignore destroy errors
          }
          playerRef.current = null
        }

        const playerElement = document.getElementById(containerId)
        if (!playerElement) {
          setIsLoading(false)
          return
        }

        const playerVars: Record<string, unknown> = {
          cc_load_policy: 1,
          cc_lang_pref: 'fr',
          hl: 'fr',
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        }

        if (typeof lesson.start === 'number') {
          playerVars.start = lesson.start
        }
        if (typeof lesson.end === 'number') {
          playerVars.end = lesson.end
        }

        playerRef.current = new window.YT.Player(containerId, {
          videoId: lesson.youtubeId,
          playerVars,
          events: {
            onReady: (event: { target: YouTubePlayerInstance }) => {
              if (isCancelled) return
              setIsLoading(false)
              playerRef.current = event.target
              onReady(event.target)
            },
            onError: (event: unknown) => {
              if (isCancelled) return
              setIsLoading(false)
              setLoadError(true)
              onError?.(event)
            },
            onStateChange: (event: { data: number }) => {
              if (isCancelled) return
              onStateChange?.(event.data)
            },
          },
        })
      })
      .catch((error) => {
        if (isCancelled) return
        setIsLoading(false)
        setLoadError(true)
        onError?.(error)
      })

    return () => {
      isCancelled = true
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy()
        } catch {
          // ignore destroy errors on unmount
        }
        playerRef.current = null
      }
    }
  }, [containerId, lesson.id, lesson.youtubeId, lesson.start, lesson.end, retryNonce, onReady, onError, onStateChange])

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-gray-900/10 dark:ring-white/10">
      {/* Target container for YouTube IFrame */}
      <div id={containerId} className="h-full w-full" />

      {/* Loading state indicator */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 p-4 text-center text-white backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-gray-300 sm:text-sm">正在加载 YouTube 官方播放器…</p>
        </div>
      )}

      {/* Friendly offline / block notice required by specification */}
      {loadError && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 p-6 text-center text-white backdrop-blur-sm"
        >
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-400">
            <IconAlertCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">当前网络无法加载 YouTube（中国大陆需要使用其他网络）。</h3>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-gray-300 sm:text-sm">
            本页精选听力语料由 YouTube 官方播放器提供原生法语发音与官方字幕。如在大陆地区使用，需配置网络或可在下方继续浏览视频列表。
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                ytApiScriptPromise = null
                setRetryNonce((n) => n + 1)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 sm:text-sm"
            >
              <IconRefresh className="h-4 w-4" />
              <span>重试加载</span>
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20 sm:text-sm"
            >
              <span>在 YouTube 打开 ↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default YouTubePlayer
