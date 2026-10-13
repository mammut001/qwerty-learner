import Tooltip from '@/components/Tooltip'
import { SoundIcon } from '@/components/WordPronunciationIcon/SoundIcon'
import useSpeech from '@/hooks/useSpeech'
import { briefMeaning, lookupDictionary } from '@/services/dictionary'
import { loadOnlineChinese, needsOnlineChinese } from '@/services/dictionaryOnline'
import { loadYoudaoFrench } from '@/services/dictionaryYoudao'
import { fontSizeConfigAtom, isTextSelectableAtom, pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export type TranslationProps = {
  word: string
  trans: string
  showTrans?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Translation({ word, trans, showTrans = true, onMouseEnter, onMouseLeave }: TranslationProps) {
  const usableTrans =
    trans.normalize('NFC').trim().toLocaleLowerCase('fr') === word.normalize('NFC').trim().toLocaleLowerCase('fr') ? '' : trans.trim()
  const [resolved, setResolved] = useState<{ key: string; meaning: string; loading: boolean } | null>(null)
  const key = JSON.stringify([word, trans])
  const [retryRequest, setRetryRequest] = useState({ key: '', attempt: 0 })
  const attempt = retryRequest.key === key ? retryRequest.attempt : 0
  const retryMeaning = useCallback(() => setRetryRequest((old) => ({ key, attempt: old.attempt + 1 })), [key])
  useEffect(() => {
    if (usableTrans) return
    let cancelled = false
    setResolved({ key, meaning: '', loading: true })
    const run = async () => {
      let meaning = ''
      try {
        const result = await lookupDictionary(word).catch(() => null)
        if (cancelled) return
        meaning = result ? briefMeaning(result) : ''
        if (!/[一-鿿]/.test(meaning) && navigator.onLine !== false) {
          const headword = result?.words[0]?.word ?? result?.lemmas[0]?.word ?? word
          const online = await loadYoudaoFrench(headword, { forceRefresh: attempt > 0 })
          if (cancelled) return
          const chinese = online?.senses
            .slice(0, 3)
            .map((sense) => sense.gloss)
            .join('；')
          if (chinese) meaning = chinese
          else if (!result || needsOnlineChinese(result)) {
            const fallback = await loadOnlineChinese(headword, { forceRefresh: attempt > 0 })
            if (fallback.zh.length) meaning = fallback.zh.slice(0, 3).join('；')
          }
        }
      } catch {
        // Keep a usable offline definition if the online source is unavailable.
      }
      if (!cancelled) setResolved({ key, meaning, loading: false })
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [key, word, usableTrans, attempt])
  const meaning = usableTrans || (resolved?.key === key ? resolved.meaning : '')
  const loading = !usableTrans && (resolved?.key !== key || resolved.loading)
  useEffect(() => {
    if (usableTrans || meaning || loading) return
    window.addEventListener('online', retryMeaning)
    return () => window.removeEventListener('online', retryMeaning)
  }, [usableTrans, meaning, loading, retryMeaning])
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const isShowTransRead = window.speechSynthesis && pronunciationConfig.isTransRead
  const speechOptions = useMemo(() => ({ volume: pronunciationConfig.transVolume }), [pronunciationConfig.transVolume])
  const { speak, speaking } = useSpeech(meaning, speechOptions)

  const handleClickSoundIcon = useCallback(() => {
    speak(true)
  }, [speak])

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div className={`flex items-center justify-center  pb-4 pt-5`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <span
        className={`max-w-4xl text-center font-sans transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
          isShowTransRead && 'pl-8'
        } ${isTextSelectable && 'select-text'}`}
        style={{ fontSize: fontSizeConfig.translateFont.toString() + 'px' }}
      >
        {showTrans ? meaning || (loading ? '正在补查释义…' : '暂无释义') : '\u00A0'}
      </span>
      {isShowTransRead && showTrans && meaning && (
        <Tooltip content="朗读释义" className="ml-3 h-5 w-5 cursor-pointer leading-7">
          <SoundIcon animated={speaking} onClick={handleClickSoundIcon} className="h-5 w-5" />
        </Tooltip>
      )}
      {showTrans && !meaning && !loading && (
        <div className="ml-3 flex items-center gap-3 text-sm text-indigo-500">
          <button type="button" className="underline" onClick={retryMeaning}>
            重试释义
          </button>
          <Link className="underline" to={`/dictionary?q=${encodeURIComponent(word)}`}>
            查看词典
          </Link>
        </div>
      )}
    </div>
  )
}
