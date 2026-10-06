import DictionaryCard from './DictionaryCard'
import { type DictionaryResult, lookupDictionary } from '@/services/dictionary'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const WORD = /([A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+)*)/

type CloseListener = () => void
const closeSubscribers = new Set<CloseListener>()

function notifyCloseOthers(except: CloseListener) {
  closeSubscribers.forEach((listener) => {
    if (listener !== except) {
      listener()
    }
  })
}

/** French text whose words can be clicked to look them up in the offline dictionary. */
export default function LookupText({ text, className }: { text: string; className?: string }) {
  const tokens = useMemo(() => text.split(WORD), [text])
  const [active, setActive] = useState<string | null>(null)
  const [result, setResult] = useState<DictionaryResult | null>(null)
  const [error, setError] = useState('')

  const closeSelf = useCallback(() => {
    setActive(null)
  }, [])

  useEffect(() => {
    closeSubscribers.add(closeSelf)
    return () => {
      closeSubscribers.delete(closeSelf)
    }
  }, [closeSelf])

  useEffect(() => {
    setActive(null)
  }, [text])

  const openToken = (token: string) => {
    notifyCloseOthers(closeSelf)
    setActive(token)
  }

  useEffect(() => {
    if (active === null) return
    let cancelled = false
    setResult(null)
    setError('')
    lookupDictionary(active)
      .then((value) => {
        if (!cancelled) setResult(value)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : '词典数据加载失败')
      })
    return () => {
      cancelled = true
    }
  }, [active])

  return (
    <>
      <span className={className} lang="fr">
        {tokens.map((token, index) =>
          index % 2 === 1 ? (
            <span
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => openToken(token)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openToken(token)
              }}
              className={`cursor-pointer rounded decoration-indigo-300 decoration-dotted underline-offset-4 hover:bg-indigo-100 hover:underline dark:hover:bg-indigo-900/50 ${
                active === token ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''
              }`}
            >
              {token}
            </span>
          ) : (
            <Fragment key={index}>{token}</Fragment>
          ),
        )}
      </span>
      {active !== null && (
        <aside
          data-testid="dictionary-popover"
          aria-label={`查词：${active}`}
          className="fixed inset-x-3 bottom-3 z-40 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 text-left font-sans text-base font-normal normal-case tracking-normal shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:inset-x-auto sm:right-6 sm:w-96"
        >
          <div className="mb-2 flex items-center justify-between">
            <NavLink to={`/dictionary?q=${encodeURIComponent(active)}`} className="text-xs font-medium text-indigo-500 hover:underline">
              在词典里查看完整释义 →
            </NavLink>
            <button
              type="button"
              aria-label="关闭查词"
              onClick={() => setActive(null)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : result ? (
            <DictionaryCard result={result} compact />
          ) : (
            <p className="text-sm text-gray-400">正在查「{active}」…</p>
          )}
        </aside>
      )}
    </>
  )
}
