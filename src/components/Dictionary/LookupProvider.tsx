import { LookupContext, type LookupController } from './lookupContext'
import type { DictionaryResult } from '@/services/dictionary'
import { type ReactNode, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const DictionaryCard = lazy(() => import('./DictionaryCard'))

export function LookupProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const triggerRef = useRef<HTMLElement | null>(null)
  const ownerRef = useRef<string | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [result, setResult] = useState<DictionaryResult | null>(null)
  const [error, setError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)

  const close = useCallback(() => {
    ownerRef.current = null
    triggerRef.current = null
    setActive(null)
  }, [])

  const open = useCallback((word: string, trigger?: HTMLElement | null, ownerId?: string | null) => {
    // A click inside the card passes null so the card can remount for the new word
    // without its own cleanup dismissing the popover.
    if (ownerId !== null && ownerId !== undefined) {
      ownerRef.current = ownerId
      triggerRef.current = trigger ?? null
    }
    setActive(word)
  }, [])

  const dismissIfOwner = useCallback((ownerId: string) => {
    if (ownerRef.current !== ownerId) return
    ownerRef.current = null
    triggerRef.current = null
    setActive(null)
  }, [])

  useEffect(() => {
    close()
  }, [pathname, search, close])

  useEffect(() => {
    if (active === null) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
      event.preventDefault()
      const trigger = triggerRef.current
      close()
      trigger?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [active, close])

  useEffect(() => {
    if (active === null) return
    let cancelled = false
    setResult(null)
    setError('')
    void import('@/services/dictionary')
      .then(({ lookupDictionary }) => {
        if (cancelled) return null
        return lookupDictionary(active)
      })
      .then((value) => {
        if (!cancelled && value) setResult(value)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : '词典数据加载失败')
      })
    return () => {
      cancelled = true
    }
  }, [active, lookupAttempt])

  const value = useMemo<LookupController>(() => ({ active, inPopover: false, open, dismissIfOwner }), [active, open, dismissIfOwner])
  const popoverValue = useMemo<LookupController>(() => ({ ...value, inPopover: true }), [value])

  return (
    <LookupContext.Provider value={value}>
      {children}
      {active !== null && (
        <LookupContext.Provider value={popoverValue}>
          <aside
            data-testid="dictionary-popover"
            aria-label={`查词：${active}`}
            className="fixed inset-x-3 bottom-3 z-40 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 text-left font-sans text-base font-normal normal-case tracking-normal shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:inset-x-auto sm:right-6 sm:w-96"
          >
            <div className="mb-2 flex items-center justify-between">
              <NavLink
                to={`/dictionary?q=${encodeURIComponent(active)}`}
                onClick={close}
                className="text-xs font-medium text-indigo-500 hover:underline"
              >
                在词典里查看完整释义 →
              </NavLink>
              <button
                type="button"
                aria-label="关闭查词"
                onClick={close}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            {error ? (
              <div role="alert" className="text-sm text-red-600 dark:text-red-400">
                <p>{error}</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-current px-3 py-1.5 font-medium"
                  onClick={() => setLookupAttempt((attempt) => attempt + 1)}
                >
                  重试查词
                </button>
              </div>
            ) : result ? (
              <Suspense fallback={<p className="text-sm text-gray-400">正在查「{active}」…</p>}>
                <DictionaryCard result={result} compact />
              </Suspense>
            ) : (
              <p className="text-sm text-gray-400">正在查「{active}」…</p>
            )}
          </aside>
        </LookupContext.Provider>
      )}
    </LookupContext.Provider>
  )
}
