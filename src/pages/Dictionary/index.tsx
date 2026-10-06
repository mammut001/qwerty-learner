import DictionaryCard from '@/components/Dictionary/DictionaryCard'
import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { type DictionaryResult, cleanDictionaryQuery, lookupDictionary, suggestDictionaryWords } from '@/services/dictionary'
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
  const [result, setResult] = useState<DictionaryResult | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [history, setHistory] = useState(readHistory)

  useEffect(() => {
    setInput(query)
    if (!query) {
      setResult(null)
      return
    }
    let cancelled = false
    setError('')
    lookupDictionary(query)
      .then((value) => {
        if (cancelled) return
        setResult(value)
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
    return () => {
      cancelled = true
    }
  }, [query])

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

  const search = (text: string) => {
    const next = cleanDictionaryQuery(text)
    setSuggestions([])
    setSearchParams(next ? { q: next } : {})
  }

  const chipClass =
    'rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'

  return (
    <Layout>
      <Header />
      <main className="w-full flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-sm font-medium text-indigo-500">离线法语词典</div>
          <h1 className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">查词</h1>

          <form
            role="search"
            className="relative mt-5"
            onSubmit={(event) => {
              event.preventDefault()
              search(input)
            }}
          >
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="输入法语单词或变位形式，例如 mangeais"
              aria-label="查词"
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              lang="fr"
              className="my-card w-full rounded-2xl border border-transparent bg-white py-3.5 pl-12 pr-24 text-lg outline-none focus:border-indigo-400 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              查询
            </button>
            {suggestions.length > 0 && (
              <ul
                data-testid="dictionary-suggestions"
                className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                {suggestions.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => search(item)}
                      lang="fr"
                      className="block w-full px-5 py-2 text-left text-gray-800 hover:bg-indigo-50 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <section className="my-card mt-6 rounded-2xl bg-white p-5 dark:bg-gray-800 sm:p-7">
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : result && query ? (
              <DictionaryCard result={result} />
            ) : query ? (
              <p className="text-sm text-gray-400">正在查「{query}」…</p>
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

          <p className="mt-4 text-xs leading-5 text-gray-400">
            释义来自英文与中文维基词典（Wiktionary），经 kaikki.org / wiktextract 提取并裁剪，按 CC BY-SA
            许可使用；「本站词库」是本项目自己整理的释义。有中文释义的词条优先显示中文，其余显示英文。
          </p>
        </div>
      </main>
    </Layout>
  )
}
