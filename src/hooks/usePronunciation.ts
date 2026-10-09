import {
  createPlaybackToken,
  isFrenchVoiceAvailable,
  playFrenchVoice,
  prefetchFrenchVoice,
  setFrenchVoiceLoop,
  stopFrenchVoice,
  subscribeFrenchVoiceAvailability,
} from '@/services/frenchVoice'
import { pronunciationConfigAtom } from '@/store'
import type { PronunciationType } from '@/typings'
import { addHowlListener } from '@/utils'
import { romajiToHiragana } from '@/utils/kana'
import noop from '@/utils/noop'
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

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)
  const [proxyAvailable, setProxyAvailable] = useState(isFrenchVoiceAvailable)
  const activeTokenRef = useRef<number | null>(null)
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return subscribeFrenchVoiceAvailability(setProxyAvailable)
  }, [])

  const soundSrc = useMemo(() => {
    if (pronunciationConfig.type === 'fr' && proxyAvailable) {
      return ''
    }
    return generateWordSoundSrc(word, pronunciationConfig.type)
  }, [pronunciationConfig.type, proxyAvailable, word])

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
        const myToken = createPlaybackToken()
        activeTokenRef.current = myToken

        void playFrenchVoice(word, {
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
        }).then((result) => {
          if (result === 'superseded') {
            if (activeTokenRef.current === myToken) {
              activeTokenRef.current = null
            }
            setIsPlaying(false)
            return
          }

          if (result === 'unavailable') {
            if (activeTokenRef.current !== myToken) {
              return
            }
            if (!soundSrc) {
              const fallbackAudio = new Audio(generateWordSoundSrc(word, 'fr'))
              fallbackAudio.volume = pronunciationConfig.volume
              fallbackAudio.playbackRate = pronunciationConfig.rate
              fallbackAudio.loop = loop
              fallbackAudioRef.current = fallbackAudio
              fallbackAudio.onplay = () => {
                if (activeTokenRef.current === myToken) {
                  setIsPlaying(true)
                }
              }
              fallbackAudio.onended = () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                }
                fallbackAudioRef.current = null
                setIsPlaying(false)
              }
              fallbackAudio.onerror = () => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                }
                fallbackAudioRef.current = null
                setIsPlaying(false)
              }
              void fallbackAudio.play().catch(() => {
                if (activeTokenRef.current === myToken) {
                  activeTokenRef.current = null
                }
                fallbackAudioRef.current = null
                setIsPlaying(false)
              })
            } else {
              playSound(options)
            }
          }
        })
        return
      }

      playSound(options)
    },
    [loop, playSound, pronunciationConfig.rate, pronunciationConfig.type, pronunciationConfig.volume, soundSrc, word],
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
    }
  }, [])

  return { play, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word) return

    if (pronunciationConfig.type === 'fr' && isFrenchVoiceAvailable()) {
      prefetchFrenchVoice(word)
      return
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
  }, [pronunciationConfig.type, word])
}
