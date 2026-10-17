import {
  type VoiceOverride,
  createPlaybackToken,
  isFrenchVoiceAvailable,
  lookupTtsAudioCandidates,
  lookupVoiceOverride,
  overrideAudioCandidates,
  playFrenchVoice,
  prefetchFrenchVoice,
  setFrenchVoiceLoop,
  stopFrenchVoice,
} from '@/services/frenchVoice'
import { pronunciationConfigAtom } from '@/store'
import type { PronunciationType } from '@/typings'
import { addHowlListener } from '@/utils'
import { romajiToHiragana } from '@/utils/kana'
import noop from '@/utils/noop'
import { safeSpeak, stopSpeechSynthesis } from '@/utils/speechSynthesis'
import type { Howl } from 'howler'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSound from 'use-sound'
import type { HookOptions } from 'use-sound/dist/types'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='
export function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>): string {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
    case 'romaji':
      return `${pronunciationApi}${romajiToHiragana(word)}&le=jap`
    case 'zh':
      return `${pronunciationApi}${word}&le=zh`
    case 'ja':
      return `${pronunciationApi}${word}&le=jap`
    case 'fr':
      return `${pronunciationApi}${encodeURIComponent(word)}&le=fr`
    case 'de':
      return `${pronunciationApi}${word}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${word}&le=ru` // 有道不支持哈萨克语, 暂时用俄语发音兜底
    case 'id':
      return `${pronunciationApi}${word}&le=id`
    default:
      return ''
  }
}

type ClipPlayback = {
  volume: number
  rate: number
  loop: boolean
  isCurrent: () => boolean
  audioRef: { current: HTMLAudioElement | null }
  onStart: () => void
  onEnd: () => void
}

/**
 * Plays the first URL in `urls` that starts. A load error or a rejected play() moves on to the next URL.
 * Resolves true once a clip has started, false if every URL failed or this playback was superseded.
 */
function playClipUrls(urls: string[], playback: ClipPlayback): Promise<boolean> {
  const { volume, rate, loop, isCurrent, audioRef, onStart, onEnd } = playback

  const tryFrom = (index: number): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      if (index >= urls.length || !isCurrent()) {
        resolve(false)
        return
      }

      const audio = new Audio(urls[index])
      audio.volume = volume
      audio.playbackRate = rate
      audio.loop = loop
      audioRef.current = audio

      let started = false
      let moved = false
      let settled = false
      const settle = (ok: boolean) => {
        if (settled) return
        settled = true
        resolve(ok)
      }
      const finish = () => {
        if (!isCurrent()) return
        if (audioRef.current === audio) audioRef.current = null
        onEnd()
      }
      const advance = () => {
        if (started || moved) return
        moved = true
        audio.onerror = null
        tryFrom(index + 1).then(settle)
      }

      audio.onplay = () => {
        started = true
        if (isCurrent()) onStart()
      }
      audio.onended = finish
      audio.onerror = () => {
        if (started) finish()
        else advance()
      }

      audio.play().then(
        () => {
          started = true
          settle(true)
        },
        () => advance(),
      )
    })

  return tryFrom(0).then((ok) => {
    if (!ok && isCurrent()) audioRef.current = null
    return ok
  })
}

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)
  const activeTokenRef = useRef<number | null>(null)
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null)

  // French never preloads a Howl: playback uses TTS / Lingua Libre first and only falls back to a plain Audio element for Youdao.
  const soundSrc = useMemo(() => {
    if (pronunciationConfig.type === 'fr') {
      return ''
    }
    return generateWordSoundSrc(word, pronunciationConfig.type)
  }, [pronunciationConfig.type, word])

  const [playSound, { stop: stopSound, sound }] = useSound(soundSrc, {
    html5: true,
    format: ['mp3'],
    loop,
    volume: pronunciationConfig.volume,
    rate: pronunciationConfig.rate,
  } as HookOptions)

  useEffect(() => {
    if (pronunciationConfig.type === 'fr' && activeTokenRef.current !== null) {
      setFrenchVoiceLoop(loop, activeTokenRef.current)
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.loop = loop
    }
    if (!sound) return
    sound.loop(loop)
    return noop
  }, [loop, pronunciationConfig.type, sound])

  useEffect(() => {
    if (!sound) return
    const unListens: Array<() => void> = []

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(sound, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'pause', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'playerror', () => setIsPlaying(false)))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      ;(sound as Howl).unload()
    }
  }, [sound])

  const play = useCallback(
    (options?: Parameters<typeof playSound>[0]) => {
      if (pronunciationConfig.type === 'fr') {
        if (fallbackAudioRef.current) {
          fallbackAudioRef.current.pause()
          fallbackAudioRef.current = null
        }
        stopSpeechSynthesis()
        const myToken = createPlaybackToken()
        activeTokenRef.current = myToken

        void (async () => {
          const accent = pronunciationConfig.accent || 'fr-CA'
          let override: VoiceOverride | null | undefined
          try {
            override = await lookupVoiceOverride(word)
          } catch {
            // tolerate failure
          }
          if (activeTokenRef.current !== myToken) return

          if (override && !override.audio) {
            safeSpeak(word, {
              volume: pronunciationConfig.volume,
              rate: pronunciationConfig.rate,
              onStart: () => {
                if (activeTokenRef.current === myToken) {
                  setIsPlaying(true)
                }
              },
              onEnd: () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                  setIsPlaying(false)
                }
              },
              onError: () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                  setIsPlaying(false)
                }
              },
            })
            return
          }

          let ttsCandidates: string[] = []
          try {
            ttsCandidates = await lookupTtsAudioCandidates(word, accent)
          } catch {
            // tolerate failure by falling back
          }
          if (activeTokenRef.current !== myToken) return

          // Ordered clips: Lingua Libre override (mirror, then original), then TTS (same-origin mirror, or bucket on Pages).
          const clipUrls = [...overrideAudioCandidates(override), ...ttsCandidates]
          if (clipUrls.length > 0) {
            const started = await playClipUrls(clipUrls, {
              volume: pronunciationConfig.volume,
              rate: pronunciationConfig.rate,
              loop,
              isCurrent: () => activeTokenRef.current === myToken,
              audioRef: fallbackAudioRef,
              onStart: () => setIsPlaying(true),
              onEnd: () => {
                activeTokenRef.current = null
                setIsPlaying(false)
              },
            })
            if (started || activeTokenRef.current !== myToken) return
          }

          // Every clip failed (or none exist): the dictionary proxy, then Youdao / speech synthesis.
          const result = await playFrenchVoice(word, {
            volume: pronunciationConfig.volume,
            rate: pronunciationConfig.rate,
            loop,
            token: myToken,
            onStart: () => {
              if (activeTokenRef.current === myToken) {
                setIsPlaying(true)
              }
            },
            onEnd: () => {
              if (activeTokenRef.current === myToken) {
                activeTokenRef.current = null
                setIsPlaying(false)
              }
            },
          })

          if (result === 'superseded') {
            if (activeTokenRef.current === myToken) {
              setIsPlaying(false)
              activeTokenRef.current = null
            }
            return
          }

          if (result === 'starred') {
            if (activeTokenRef.current !== myToken) {
              return
            }
            safeSpeak(word, {
              volume: pronunciationConfig.volume,
              rate: pronunciationConfig.rate,
              onStart: () => {
                if (activeTokenRef.current === myToken) {
                  setIsPlaying(true)
                }
              },
              onEnd: () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                  setIsPlaying(false)
                }
              },
              onError: () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                  setIsPlaying(false)
                }
              },
            })
            return
          }

          if (result === 'unavailable') {
            if (activeTokenRef.current !== myToken) {
              return
            }
            if (!soundSrc) {
              void playClipUrls([generateWordSoundSrc(word, 'fr')], {
                volume: pronunciationConfig.volume,
                rate: pronunciationConfig.rate,
                loop,
                isCurrent: () => activeTokenRef.current === myToken,
                audioRef: fallbackAudioRef,
                onStart: () => setIsPlaying(true),
                onEnd: () => {
                  activeTokenRef.current = null
                  setIsPlaying(false)
                },
              })
            } else {
              playSound(options)
            }
          }
        })()
        return
      }

      playSound(options)
    },
    [
      loop,
      playSound,
      pronunciationConfig.accent,
      pronunciationConfig.rate,
      pronunciationConfig.type,
      pronunciationConfig.volume,
      soundSrc,
      word,
    ],
  )

  const stop = useCallback(
    (id?: string) => {
      if (activeTokenRef.current !== null) {
        stopFrenchVoice(activeTokenRef.current)
        activeTokenRef.current = null
      }
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.pause()
        fallbackAudioRef.current = null
      }
      stopSpeechSynthesis()
      stopSound(id)
      setIsPlaying(false)
    },
    [stopSound],
  )

  useEffect(() => {
    return () => {
      if (activeTokenRef.current !== null) {
        stopFrenchVoice(activeTokenRef.current)
        activeTokenRef.current = null
      }
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.pause()
        fallbackAudioRef.current = null
      }
      stopSpeechSynthesis()
    }
  }, [])

  return { play, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word) return

    if (pronunciationConfig.type === 'fr') {
      let cancelled = false
      let created: HTMLAudioElement | null = null
      const accent = pronunciationConfig.accent || 'fr-CA'
      void (async () => {
        let override: VoiceOverride | null | undefined
        try {
          override = await lookupVoiceOverride(word)
        } catch {
          // tolerate failure
        }
        if (cancelled) return

        let soundUrl: string | undefined
        let fromOverride = false
        const overrideCandidates = overrideAudioCandidates(override)
        if (overrideCandidates.length > 0) {
          soundUrl = overrideCandidates[0]
          fromOverride = true
        } else if (!override || override.audio !== null) {
          try {
            const ttsCandidates = await lookupTtsAudioCandidates(word, accent)
            soundUrl = ttsCandidates[0]
          } catch {
            // tolerate failure
          }
        }
        if (cancelled) return

        if (!soundUrl) {
          if (override === undefined && isFrenchVoiceAvailable()) {
            prefetchFrenchVoice(word)
          }
          return
        }
        const url: string = soundUrl
        const head = document.head
        const isPrefetch = (Array.from(head.querySelectorAll('audio[src]')) as HTMLAudioElement[]).some(
          (el) => el.getAttribute('src') === url,
        )
        if (!isPrefetch) {
          const audio = new Audio()
          audio.src = url
          audio.preload = 'auto'
          if (fromOverride) audio.crossOrigin = 'anonymous'
          audio.style.display = 'none'
          head.appendChild(audio)
          created = audio
        }
      })()
      return () => {
        cancelled = true
        if (created && created.parentNode) {
          created.parentNode.removeChild(created)
        }
      }
    }

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    const head = document.head
    const isPrefetch = (Array.from(head.querySelectorAll('link[href]')) as HTMLLinkElement[]).some((el) => el.href === soundUrl)

    if (!isPrefetch) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'

      // gpt 说这这两行能尽可能规避下载插件被触发问题。 本地测试不加也可以，考虑到别的插件可能有问题，所以加上保险
      audio.crossOrigin = 'anonymous'
      audio.style.display = 'none'

      head.appendChild(audio)

      return () => {
        head.removeChild(audio)
      }
    }
  }, [pronunciationConfig.accent, pronunciationConfig.type, word])
}
