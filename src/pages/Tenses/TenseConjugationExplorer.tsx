import { useMemo, useState } from 'react'
import { TENSE_LABELS, conjugate, getSupportedVerbs } from '@/resources/tenses/conjugator'
import type { TenseId } from '@/resources/tenses/types'
import { safeSpeak } from '@/utils/speechSynthesis'
import IconSearch from '~icons/tabler/search'
import IconVolume from '~icons/tabler/volume'

const QUICK_VERBS = [
  'parler',
  'finir',
  'vendre',
  'être',
  'avoir',
  'aller',
  'faire',
  'prendre',
  'venir',
  'vouloir',
  'pouvoir',
  'devoir',
  'savoir',
  'voir',
  'se lever',
]

export interface TenseConjugationExplorerProps {
  tenseId: TenseId
  initialVerb?: string
}

export default function TenseConjugationExplorer({
  tenseId,
  initialVerb = 'parler',
}: TenseConjugationExplorerProps) {
  const [query, setQuery] = useState(initialVerb)
  const [selectedVerb, setSelectedVerb] = useState(initialVerb)

  const supportedVerbs = useMemo(() => getSupportedVerbs(), [])

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return supportedVerbs.filter((v) => v.toLowerCase().includes(q)).slice(0, 8)
  }, [query, supportedVerbs])

  const { conjugationResult, error } = useMemo(() => {
    const verbToConjugate = selectedVerb.trim() || 'parler'
    try {
      return { conjugationResult: conjugate(verbToConjugate, tenseId), error: null }
    } catch {
      return { conjugationResult: null, error: '暂不支持这个动词' }
    }
  }, [selectedVerb, tenseId])

  const handleSelectVerb = (verb: string) => {
    setSelectedVerb(verb)
    setQuery(verb)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSelectedVerb(query.trim())
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            变位速查表 ({conjugationResult ? conjugationResult.tenseLabelZh : TENSE_LABELS[tenseId]?.zh || '动词变位'})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            支持所有常用动词、不规则动词及自反动词，点击喇叭即可发音
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <div className="relative w-full sm:w-56">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入或搜索动词..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-950"
            />
          </div>
          {query !== selectedVerb && (
            <button
              type="submit"
              className="ml-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 active:scale-95"
            >
              变位
            </button>
          )}
        </form>
      </div>

      {filteredSuggestions.length > 0 && query !== selectedVerb && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <span className="text-gray-400">匹配建议:</span>
          {filteredSuggestions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleSelectVerb(v)}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Quick verb chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">常用动词:</span>
        {QUICK_VERBS.map((v) => {
          const isActive = v === selectedVerb
          return (
            <button
              key={v}
              type="button"
              onClick={() => handleSelectVerb(v)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>

      {/* Unsupported Verb Error */}
      {error && (
        <div
          data-testid="unsupported-verb-error"
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/60 dark:bg-amber-950/40"
        >
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {error}
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            仅支持常见法语规则动词（-er及部分第二组-ir）与常用不规则动词。请尝试上方推荐常用动词。
          </p>
        </div>
      )}

      {conjugationResult && (
        <>
          {/* Verb Info Summary */}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50/60 p-3 text-xs dark:bg-indigo-950/40">
            <div className="font-semibold text-indigo-950 dark:text-indigo-200">
              原形: <span className="font-mono text-sm text-indigo-700 dark:text-indigo-300">{conjugationResult.infinitive}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              助动词: <span className="font-semibold text-gray-900 dark:text-white">{conjugationResult.auxiliary}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              过去分词: <span className="font-mono font-medium text-gray-900 dark:text-white">{conjugationResult.participePasse}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              现在分词: <span className="font-mono font-medium text-gray-900 dark:text-white">{conjugationResult.participePresent}</span>
            </div>
          </div>

          {conjugationResult.notes && conjugationResult.notes.length > 0 && (
            <div className="mt-2 space-y-1">
              {conjugationResult.notes.map((note, idx) => (
                <div key={idx} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                  💡 {note}
                </div>
              ))}
            </div>
          )}

          {/* Forms Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700/80">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-medium text-gray-500 dark:border-gray-700/80 dark:bg-gray-900/60 dark:text-gray-400">
                  <th className="py-2.5 pl-4 pr-3">人称 (Personne)</th>
                  <th className="py-2.5 px-3">变位形式 (Forme conjuguée)</th>
                  <th className="py-2.5 px-3 text-right pr-4">发音</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {conjugationResult.forms.map((form, index) => {
                  return (
                    <tr
                      key={index}
                      className="transition hover:bg-indigo-50/30 dark:hover:bg-gray-700/40"
                    >
                      <td className="py-2.5 pl-4 pr-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {form.subject || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {form.display}
                        </span>
                        {form.agreementVariants && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                            {form.agreementVariants.feminine && `(♀ ${form.agreementVariants.feminine})`}
                            {form.agreementVariants.pluralMasc && `(pl: ${form.agreementVariants.pluralMasc})`}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right pr-4">
                        <button
                          type="button"
                          onClick={() => safeSpeak(form.display, { lang: 'fr-CA' })}
                          title={`朗读 ${form.display}`}
                          className="inline-flex items-center justify-center rounded-lg p-1 text-gray-400 transition hover:bg-indigo-100 hover:text-indigo-600 active:scale-95 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-indigo-300"
                        >
                          <IconVolume className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
