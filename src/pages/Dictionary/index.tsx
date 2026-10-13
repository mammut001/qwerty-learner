import DictionaryCard from '@/components/Dictionary/DictionaryCard'
import Layout from '@/components/Layout'
import {
  type DictionaryResult,
  cleanDictionaryQuery,
  findAccentedVariants,
  lookupDictionary,
  suggestDictionaryWords,
} from '@/services/dictionary'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IconSearch from '~icons/tabler/search'

const HISTORY_KEY = 'qwerty-fr-dictionary-history'
const EXAMPLES = ['logement', 'mangeais', 'en revanche', "aujourd'hui", 'belle']

const readHistory = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

export default function DictionaryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = cleanDictionaryQuery(searchParams.get('q') ?? '')
  const [input, setInput] = useState(query)
  const [result, setResult] = useState<{ query: string; data: DictionaryResult } | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [accentedVariants, setAccentedVariants] = useState<string[]>([])
  const [error, setError] = useState('')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const [history, setHistory] = useState(readHistory)

  useEffect(() => {
    setInput(query)
    setAccentedVariants([])
    setError('')
    if (!query) {
      setResult(null)
      return
    }
    let cancelled = false
    setResult(null)
    lookupDictionary(query)
      .then((value) => {
        if (cancelled) return
        setResult({ query, data: value })
        if (value.words.length || value.lemmas.length) {
          setHistory((old) => {
            const next = [query, ...old.filter((item) => item !== query)].slice(0, 12)
            try {
              window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
            } catch {
              // History is a convenience only.
            }
            return next
          })
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : '词典数据加载失败')
      })

    void findAccentedVariants(query).then((variants) => {
      if (!cancelled) setAccentedVariants(variants)
    })

    return () => {
      cancelled = true
    }
  }, [query, lookupAttempt])

  useEffect(() => {
    const typed = cleanDictionaryQuery(input)
    if (typed === query || typed.length < 2) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      suggestDictionaryWords(typed)
        .then((items) => {
          if (!cancelled) setSuggestions(items)
        })
        .catch(() => undefined)
    }, 150)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [input, query])

  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedSuggestionIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setSuggestions([])
      setSelectedSuggestionIndex(-1)
    } else if (event.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        event.preventDefault()
        search(suggestions[selectedSuggestionIndex])
      }
    }
  }

  const search = (text: string) => {
    const next = cleanDictionaryQuery(text)
    setSuggestions([])
    setSelectedSuggestionIndex(-1)
    setSearchParams(next ? { q: next } : {})
  }

  const chipClass =
    'ui-chip hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors'

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="ui-eyebrow">法语词典</div>
          <h1 className="ui-title mt-3">查词</h1>

          <form
            role="search"
            className="relative mt-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
                search(suggestions[selectedSuggestionIndex])
              } else {
                search(input)
              }
            }}
          >
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls={suggestions.length > 0 ? 'dictionary-suggestions-list' : undefined}
              aria-activedescendant={
                selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length
                  ? `suggestion-${selectedSuggestionIndex}`
                  : undefined
              }
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                setSelectedSuggestionIndex(-1)
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  setSuggestions([])
                  setSelectedSuggestionIndex(-1)
                }, 200)
              }}
              placeholder="输入法语单词或变位形式，例如 mangeais"
              aria-label="查词"
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              lang="fr"
              className="my-card w-full rounded-2xl border border-transparent bg-white py-3.5 pl-12 pr-24 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400/80 sm:text-lg [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            <button
              type="submit"
              className="ui-btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium"
            >
              查询
            </button>
            {suggestions.length > 0 && (
              <ul
                id="dictionary-suggestions-list"
                role="listbox"
                aria-label="搜索建议"
                data-testid="dictionary-suggestions"
                className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                {suggestions.map((item, index) => {
                  const isSelected = selectedSuggestionIndex === index
                  return (
                    <li key={item} id={`suggestion-${index}`} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => search(item)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        lang="fr"
                        className={`block w-full px-5 py-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-gray-700 dark:text-indigo-300'
                            : 'text-gray-800 hover:bg-indigo-50 dark:text-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </form>

          <section className="my-card mt-6 rounded-2xl bg-white p-5 dark:bg-gray-800 sm:p-7">
            {error ? (
              <div role="alert" className="rounded-xl bg-red-50/70 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <p>{error}</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-current px-3 py-1.5 font-medium"
                  onClick={() => setLookupAttempt((value) => value + 1)}
                >
                  重试查词
                </button>
              </div>
            ) : result && query && result.query === query ? (
              <DictionaryCard key={result.query} result={result.data} />
            ) : query ? (
              <div className="flex items-center gap-2.5 py-4 text-sm text-gray-400 dark:text-gray-500">
                <span className="inline-block h-2 w-2 animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span>正在查「{query}」…</span>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  支持不带重音符号输入（ecole 能查到 école）、变位和变形还原（mangeais → manger），以及 l’、d’、qu’
                  这类省音。阅读和听力复盘时，直接点原文里的单词也能查。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">{history.length > 0 ? '最近查过' : '试试看'}</span>
                  {(history.length > 0 ? history : EXAMPLES).map((item) => (
                    <button key={item} type="button" onClick={() => search(item)} lang="fr" className={chipClass}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {accentedVariants.length > 0 && query && (
            <div className="mt-4 flex flex-wrap items-center gap-2 px-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              <span>你要找的可能是：</span>
              {accentedVariants.map((item) => (
                <button key={item} type="button" onClick={() => search(item)} lang="fr" className={chipClass}>
                  {item}
                </button>
              ))}
            </div>
          )}

          <p className="mx-auto mt-6 max-w-prose text-center text-xs leading-5 text-gray-400/90 dark:text-gray-500">
            在线时，中文释义优先来自有道《现代法汉汉法词典》，查不到再由维基词典补全。离线词条来自英文与中文维基词典（Wiktionary），经
            kaikki.org / wiktextract 提取并裁剪，按 CC BY-SA 许可使用；「本站词库」是本项目自己整理的释义。
          </p>
        </div>
      </main>
    </Layout>
  )
}
