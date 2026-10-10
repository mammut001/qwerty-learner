import React, { useState, useMemo } from 'react'
import { conjugateAll, getSupportedVerbs } from '@/resources/tenses/conjugator'
import type { TenseId, ConjugationResult } from '@/resources/tenses/types'
import { safeSpeak } from '@/utils/speechSynthesis'
import IconVolume from '~icons/tabler/volume'
import IconSearch from '~icons/tabler/search'
import IconPrinter from '~icons/tabler/printer'

const POPULAR_VERBS = [
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
  'parler',
  'finir',
  'vendre',
  'se lever',
]

const TENSE_ORDER: { id: TenseId; mood: string }[] = [
  { id: 'present', mood: 'Indicatif 直陈式' },
  { id: 'passeCompose', mood: 'Indicatif 直陈式' },
  { id: 'imparfait', mood: 'Indicatif 直陈式' },
  { id: 'plusQueParfait', mood: 'Indicatif 直陈式' },
  { id: 'futurProche', mood: 'Indicatif 直陈式' },
  { id: 'futurSimple', mood: 'Indicatif 直陈式' },
  { id: 'futurAnterieur', mood: 'Indicatif 直陈式' },
  { id: 'passeRecent', mood: 'Indicatif 直陈式' },
  { id: 'passeSimple', mood: 'Indicatif 直陈式' },
  { id: 'conditionnelPresent', mood: 'Conditionnel 条件式' },
  { id: 'conditionnelPasse', mood: 'Conditionnel 条件式' },
  { id: 'subjonctifPresent', mood: 'Subjonctif 虚拟式' },
  { id: 'subjonctifPasse', mood: 'Subjonctif 虚拟式' },
  { id: 'imperatif', mood: 'Impératif 命令式' },
  { id: 'gerondif', mood: 'Non-finite 副动词' },
]

export default function TenseCheatSheet() {
  const [selectedVerb, setSelectedVerb] = useState('être')
  const [query, setQuery] = useState('être')

  const supportedVerbs = useMemo(() => getSupportedVerbs(), [])

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return supportedVerbs.filter((v) => v.toLowerCase().includes(q)).slice(0, 8)
  }, [query, supportedVerbs])

  const allConjugations = useMemo(() => {
    const verb = selectedVerb.trim() || 'être'
    try {
      return conjugateAll(verb)
    } catch {
      return conjugateAll('être')
    }
  }, [selectedVerb])

  const handleSelectVerb = (v: string) => {
    setSelectedVerb(v)
    setQuery(v)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSelectedVerb(query.trim())
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Get metadata from any of the results (e.g. present)
  const meta = allConjugations.present

  return (
    <div className="space-y-6">
      {/* Top Search & Actions (hidden on print) */}
      <div className="print:hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              全部时态一览 (Tableau récapitulatif des temps)
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              单动词全时态横向对照速查表，支持一键打印与所有常用动词变位查询
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <IconPrinter className="h-4 w-4" /> 打印 / 保存为 PDF
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入任意法语动词..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            查询全时态
          </button>
        </form>

        {filteredSuggestions.length > 0 && query !== selectedVerb && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-400">建议:</span>
            {filteredSuggestions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleSelectVerb(v)}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200"
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Quick Verb Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400">核心动词:</span>
          {POPULAR_VERBS.map((v) => {
            const active = v === selectedVerb
            return (
              <button
                key={v}
                type="button"
                onClick={() => handleSelectVerb(v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300'
                }`}
              >
                {v}
              </button>
            )
          })}
        </div>
      </div>

      {/* Printable Sheet Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6 print:border-none print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-700/80">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white print:text-2xl">
              {meta.infinitive}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>助动词 Auxiliaire: <strong className="text-gray-800 dark:text-gray-200">{meta.auxiliary}</strong></span>
              <span>•</span>
              <span>过去分词: <strong className="text-gray-800 dark:text-gray-200">{meta.participePasse}</strong></span>
              <span>•</span>
              <span>现在分词: <strong className="text-gray-800 dark:text-gray-200">{meta.participePresent}</strong></span>
            </div>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            15 大时态全景速查
          </div>
        </div>

        {meta.notes && meta.notes.length > 0 && (
          <div className="mt-3 space-y-1">
            {meta.notes.map((n, i) => (
              <div key={i} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                💡 {n}
              </div>
            ))}
          </div>
        )}

        {/* Grid of all 15 tenses */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
          {TENSE_ORDER.map(({ id, mood }) => {
            const data: ConjugationResult = allConjugations[id]
            if (!data) return null

            return (
              <div
                key={id}
                className="flex flex-col rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition dark:border-gray-700/60 dark:bg-gray-900/40 print:border print:border-gray-300 print:bg-white"
              >
                <div className="flex items-start justify-between gap-2 border-b border-gray-200/60 pb-2 dark:border-gray-800">
                  <div>
                    <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      {mood}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {data.tenseLabelFr}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {data.tenseLabelZh}
                  </div>
                </div>

                <div className="mt-3 flex-1 space-y-1.5">
                  {data.forms.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="group flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-mono text-gray-400 dark:text-gray-500 w-16 shrink-0 truncate">
                        {f.subject || '—'}
                      </span>
                      <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                        {f.display}
                      </span>
                      <button
                        type="button"
                        onClick={() => safeSpeak(f.display, { lang: 'fr-CA' })}
                        title={`发音 ${f.display}`}
                        className="print:hidden rounded p-0.5 text-gray-300 transition hover:text-indigo-600 active:scale-95 group-hover:text-gray-500 dark:text-gray-600 dark:hover:text-indigo-400"
                      >
                        <IconVolume className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
