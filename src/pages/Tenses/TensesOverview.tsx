import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { allTenseLessons, lessonGroups } from '@/resources/tenses/data'
import { loadAllProgress } from './storage'
import TensesTimeline from './TensesTimeline'
import TenseCheatSheet from './TenseCheatSheet'
import IconBook from '~icons/tabler/book'
import IconSparkles from '~icons/tabler/sparkles'
import IconCheck from '~icons/tabler/check'
import IconTimeline from '~icons/tabler/timeline'

export default function TensesOverview() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'cheatsheet'>('catalog')
  const progressMap = loadAllProgress()

  const totalExamples = allTenseLessons.reduce(
    (sum, l) => sum + l.usages.reduce((uSum, u) => uSum + u.examples.length, 0),
    0,
  )

  const totalQuestions = allTenseLessons.reduce((sum, l) => sum + l.questions.length, 0)
  const totalMiniTexts = allTenseLessons.reduce(
    (sum, l) => sum + (l.miniTexts ? l.miniTexts.length : 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50/90 via-white to-purple-50/60 p-6 shadow-xs dark:border-indigo-950 dark:from-gray-800 dark:via-gray-800/90 dark:to-indigo-950/40 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-2xs dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-300">
              <IconSparkles className="h-3.5 w-3.5" />
              魁北克能力量表 (Échelle québécoise) & TCF Canada 专项突破
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              法语时态与变位专题
            </h1>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              涵盖 15 大核心时态与 10 大横向辨析专题。每一时态均配备<strong>一句话定位、严密构成法则、原生规则变位引擎、纯正魁北克场景例句、高频易错警示与互动针对性练习</strong>。
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 dark:bg-gray-800/80">
                📚 <strong>{allTenseLessons.length}</strong> 个专项深度课程
              </span>
              <span className="flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 dark:bg-gray-800/80">
                💬 <strong>{totalExamples}</strong> 条地道例句
              </span>
              <span className="flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 dark:bg-gray-800/80">
                ✍️ <strong>{totalQuestions}</strong> 道互动精选习题
              </span>
              {totalMiniTexts > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 dark:bg-gray-800/80">
                  📖 <strong>{totalMiniTexts}</strong> 篇语境短文
                </span>
              )}
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex shrink-0 rounded-2xl bg-gray-200/60 p-1.5 dark:bg-gray-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <IconBook className="h-4 w-4" /> 专题分类课程
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cheatsheet')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'cheatsheet'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <IconTimeline className="h-4 w-4" /> 全部时态一览
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'cheatsheet' ? (
        <TenseCheatSheet />
      ) : (
        <div className="space-y-8">
          {/* Timeline Section */}
          <TensesTimeline lessons={allTenseLessons} />

          {/* Grouped Catalog Sections */}
          <div className="space-y-8">
            {lessonGroups.map((group) => (
              <div key={group.category} className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 dark:border-gray-800 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {group.labelZh}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {group.descriptionZh}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    共 {group.lessons.length} 门课
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.lessons.map((lesson) => {
                    const lessonProgress = progressMap[lesson.id]
                    const answeredCount = lessonProgress
                      ? Object.keys(lessonProgress.completedQuestions).length
                      : 0
                    const totalQ = lesson.questions.length
                    const isDone = answeredCount >= totalQ && totalQ > 0

                    const exampleCount = lesson.usages.reduce(
                      (sum, u) => sum + u.examples.length,
                      0,
                    )

                    const echelleDisplay = Array.isArray(lesson.echelleNiveau)
                      ? `EQ ${lesson.echelleNiveau.join('-')}`
                      : `EQ ${lesson.echelleNiveau}`

                    return (
                      <NavLink
                        key={lesson.id}
                        to={`/tenses/${lesson.id}`}
                        className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/90 dark:hover:border-indigo-600"
                      >
                        <div>
                          {/* Badges Bar */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {lesson.cefrLevel}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                {echelleDisplay}
                              </span>
                              {answeredCount > 0 && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {isDone ? <IconCheck className="h-3 w-3" /> : null}
                                  {answeredCount}/{totalQ} 题
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Titles */}
                          <div className="mt-3">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                              {lesson.titleFr}
                            </h3>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {lesson.titleZh}
                            </div>
                          </div>

                          {/* Summary */}
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                            {lesson.summaryZh}
                          </p>
                        </div>

                        {/* Footer info */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-700/80">
                          <span>{exampleCount} 个生活/真题例句</span>
                          <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition dark:text-indigo-400">
                            进入专题 →
                          </span>
                        </div>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
