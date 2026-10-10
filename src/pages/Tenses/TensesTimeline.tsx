import React from 'react'
import { NavLink } from 'react-router-dom'
import type { TenseLesson } from '@/resources/tenses/types'

export interface TensesTimelineProps {
  lessons: TenseLesson[]
}

export default function TensesTimeline({ lessons }: TensesTimelineProps) {
  // Map of lesson IDs to lesson objects
  const lessonMap = new Map(lessons.map((l) => [l.id, l]))

  const moodRows = [
    {
      mood: '直陈式 (Indicatif)',
      past: [
        { id: 'plusQueParfait', label: 'Plus-que-parfait', sub: '愈过去时 (先过去)' },
        { id: 'imparfait', label: 'Imparfait', sub: '未完成过去时 (状态/习惯)' },
        { id: 'passeCompose', label: 'Passé composé', sub: '复合过去时 (完成动作)' },
        { id: 'passeRecent', label: 'Passé récent', sub: '最近过去时 (刚发生)' },
        { id: 'passeSimple', label: 'Passé simple', sub: '简单过去时 (书面叙述)' },
      ],
      now: [{ id: 'present', label: 'Présent', sub: '现在时 (当下/普遍)' }],
      future: [
        { id: 'futurProche', label: 'Futur proche', sub: '最近将来时 (将要)' },
        { id: 'futurSimple', label: 'Futur simple', sub: '简单将来时 (计划/预测)' },
        { id: 'futurAnterieur', label: 'Futur antérieur', sub: '先将来时 (将来完成)' },
      ],
    },
    {
      mood: '条件式 (Conditionnel)',
      past: [{ id: 'conditionnelPasse', label: 'Cond. passé', sub: '过去遗憾/推测' }],
      now: [{ id: 'conditionnelPresent', label: 'Cond. présent', sub: '礼貌/虚拟假设' }],
      future: [],
    },
    {
      mood: '虚拟式 (Subjonctif)',
      past: [{ id: 'subjonctifPasse', label: 'Subj. passé', sub: '虚拟式过去时' }],
      now: [{ id: 'subjonctifPresent', label: 'Subj. présent', sub: '主观意愿/情感' }],
      future: [],
    },
    {
      mood: '命令式 (Impératif)',
      past: [],
      now: [{ id: 'imperatif', label: 'Impératif', sub: '指令/劝告/建议' }],
      future: [],
    },
    {
      mood: '非人称形式',
      past: [],
      now: [{ id: 'gerondif', label: 'Gérondif', sub: '副动词 (伴随/方式)' }],
      future: [],
    },
  ]

  const renderCard = (item: { id: string; label: string; sub: string }, variant: 'past' | 'now' | 'future') => {
    const lesson = lessonMap.get(item.id)
    const cefr = lesson?.cefrLevel ?? 'A2'
    const colorClasses =
      variant === 'now'
        ? 'border-indigo-300 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
        : variant === 'past'
        ? 'border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
        : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'

    return (
      <NavLink
        key={item.id}
        to={`/tenses/${item.id}`}
        className={`group flex min-w-[140px] flex-col rounded-xl border p-2.5 text-xs transition hover:shadow-xs ${colorClasses}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold truncate">{item.label}</span>
          <span className="rounded bg-white/70 px-1 py-0.2 text-[10px] font-semibold opacity-90 dark:bg-black/30">
            {cefr}
          </span>
        </div>
        <span className="mt-1 text-[11px] opacity-80 truncate">{item.sub}</span>
      </NavLink>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6">
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100 dark:border-gray-700/80">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            法语时态时间轴全景 (Ligne du temps interactive)
          </h3>
          <span className="hidden sm:inline-block text-xs text-gray-400">
            基于「Maintenant (现在)」锚点的宏观纵览
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          横轴对应时间流（过去 ← 现在 → 将来），纵轴区分语式。点击任意时态直接进入专属专题讲解。
        </p>
      </div>

      {/* Axis Headers */}
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-12 gap-2 text-center text-xs font-semibold uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="col-span-2 text-left text-gray-400">语式 (Mode)</div>
            <div className="col-span-5 text-amber-600 dark:text-amber-400">
              ← 过去 (Passé)
            </div>
            <div className="col-span-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded py-0.5">
              ● 现在 (Présent)
            </div>
            <div className="col-span-3 text-emerald-600 dark:text-emerald-400">
              将来 (Futur) →
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60 pt-2 space-y-3">
            {moodRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 pt-3 items-center">
                <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {row.mood}
                </div>

                {/* Past Section */}
                <div className="col-span-5 flex flex-wrap gap-1.5 justify-end pr-2">
                  {row.past.map((item) => renderCard(item, 'past'))}
                </div>

                {/* Present / Now Section */}
                <div className="col-span-2 flex flex-col gap-1.5 items-center px-1">
                  {row.now.map((item) => renderCard(item, 'now'))}
                </div>

                {/* Future Section */}
                <div className="col-span-3 flex flex-wrap gap-1.5 pl-2">
                  {row.future.map((item) => renderCard(item, 'future'))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
