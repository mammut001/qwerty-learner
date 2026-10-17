import type React from 'react'
import { Link } from 'react-router-dom'
import type { Passage } from './types'

interface PassageCardProps {
  passage: Passage
  isCompleted?: boolean
}

export const PassageCard: React.FC<PassageCardProps> = ({ passage, isCompleted = false }) => {
  const isDialogue = Boolean(passage.speakers?.B)
  const levelStyle =
    passage.level === 'B1'
      ? 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-400/30'
      : 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-400/30'

  return (
    <Link
      to={`/intensive-listening/${passage.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-500/30 dark:bg-gray-800 dark:ring-white/10 dark:hover:ring-indigo-400/30"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${levelStyle}`}
            >
              {passage.level}
            </span>
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700/60 dark:text-gray-300">
              {passage.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {passage.sentences.length} 句
            </span>
            {isCompleted && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-400/30"
                title="已完成精听"
              >
                <span>✓</span>
                <span>已学</span>
              </span>
            )}
          </div>
        </div>

        {/* Titles */}
        <div className="mt-3.5">
          <h3 className="text-base font-semibold text-gray-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {passage.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-normal italic text-gray-500 dark:text-gray-400">
            {passage.titleFr}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700/60 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span>{isDialogue ? '👥 对话篇' : '🎙️ 独白篇'}</span>
          <span>·</span>
          <span>{passage.vocab.length} 个核心词</span>
        </span>
        <span className="font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform dark:text-indigo-400">
          开始精听 →
        </span>
      </div>
    </Link>
  )
}
