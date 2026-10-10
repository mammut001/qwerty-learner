import React from 'react'
import { NavLink } from 'react-router-dom'
import type { TenseLesson, TenseId } from '@/resources/tenses/types'
import { allTenseLessons } from '@/resources/tenses/data'
import ExampleItem from './ExampleItem'
import TenseConjugationExplorer from './TenseConjugationExplorer'
import TensePractice from './TensePractice'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconChevronRight from '~icons/tabler/chevron-right'
import IconSparkles from '~icons/tabler/sparkles'
import IconCheck from '~icons/tabler/check'
import IconX from '~icons/tabler/x'

export interface TenseLessonDetailProps {
  lesson: TenseLesson
}

export default function TenseLessonDetail({ lesson }: TenseLessonDetailProps) {
  const currentIndex = allTenseLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? allTenseLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < allTenseLessons.length - 1
      ? allTenseLessons[currentIndex + 1]
      : null

  const isSingleTense = lesson.category !== 'cross-cutting'

  const echelleDisplay = Array.isArray(lesson.echelleNiveau)
    ? `EQ ${lesson.echelleNiveau.join('-')}`
    : `EQ ${lesson.echelleNiveau}`

  const totalExamples = lesson.usages.reduce(
    (sum, u) => sum + u.examples.length,
    0,
  )

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <NavLink
          to="/tenses"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-500"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          返回时态专题目录
        </NavLink>

        <div className="flex items-center gap-2">
          {prevLesson ? (
            <NavLink
              to={`/tenses/${prevLesson.id}`}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
              上一课: {prevLesson.titleFr}
            </NavLink>
          ) : null}
          {nextLesson ? (
            <NavLink
              to={`/tenses/${nextLesson.id}`}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
            >
              下一课: {nextLesson.titleFr}
              <IconChevronRight className="h-3.5 w-3.5" />
            </NavLink>
          ) : null}
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 shadow-xs dark:border-indigo-950 dark:from-gray-800 dark:via-gray-800/90 dark:to-indigo-950/40 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
            {lesson.cefrLevel}
          </span>
          <span className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            魁北克能力量表: {echelleDisplay}
          </span>
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {lesson.timelinePosition === 'past'
              ? '时间定位: 过去 (Passé)'
              : lesson.timelinePosition === 'present'
              ? '时间定位: 现在 (Présent)'
              : lesson.timelinePosition === 'future'
              ? '时间定位: 将来 (Futur)'
              : lesson.timelinePosition === 'hypothetical'
              ? '时间定位: 假设 / 虚拟'
              : '时间定位: 综合全景'}
          </span>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {lesson.titleFr}
          </h1>
          <div className="mt-1 text-lg font-semibold text-gray-500 dark:text-gray-400">
            {lesson.titleZh}
          </div>
        </div>

        {/* 一句话定位 */}
        <div className="mt-4 rounded-2xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs dark:border-indigo-900 dark:bg-gray-800/90">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
            <IconSparkles className="h-4 w-4" /> 一句话定位与核心思维
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
            {lesson.summaryZh}
          </p>
        </div>

        {lesson.echelleSources && lesson.echelleSources.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
            📖 官方量表依据: {lesson.echelleSources.join('；')}
          </div>
        )}
      </div>

      {/* Section 1: 构成法则 (Formation Rules) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            1. 构成法则与词尾规范 (Formation & Terminaisons)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            掌握词根提取规律、人称词尾和特殊拼写变动
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {lesson.formationSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-gray-50/80 p-3 text-sm text-gray-800 dark:bg-gray-900/40 dark:text-gray-200"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Endings Table */}
        {lesson.endingsTable && lesson.endingsTable.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700/80">
            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
              各组词尾速查表
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {lesson.endingsTable.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-48 shrink-0">
                    {group.label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {group.endings.map((ending, eIdx) => (
                      <span
                        key={eIdx}
                        className="rounded-lg bg-indigo-50 px-2 py-1 font-mono font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        {ending}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Irregular Stems */}
        {lesson.irregularStems && lesson.irregularStems.length > 0 && (
          <div className="mt-4 rounded-xl border border-gray-100 dark:border-gray-700/80 p-4">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              关键不规则动词词根 (Radicaux irréguliers)
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 text-xs">
              {lesson.irregularStems.map((stem, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900/50"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stem.verb}:
                  </span>{' '}
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {stem.stem}
                  </span>
                  {stem.notes && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{stem.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pronunciation Notes */}
        {lesson.pronunciationNotes && lesson.pronunciationNotes.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50/80 p-4 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 space-y-1.5">
            <div className="font-bold">🗣️ 发音与拼写防坑提示 (Prononciation vs Orthographe)</div>
            {lesson.pronunciationNotes.map((pNote, pIdx) => (
              <div key={pIdx} className="leading-relaxed">
                • {pNote}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: 变位速查引擎 (Conjugation Explorer) */}
      {isSingleTense && (
        <TenseConjugationExplorer
          tenseId={lesson.id as TenseId}
          initialVerb={lesson.defaultVerb || 'parler'}
        />
      )}

      {/* Section 3: 用法与例句 (Usages & Examples) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6 space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 dark:border-gray-700/80">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              2. 典型用法与场景例句 ({totalExamples} 例)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              精选魁北克工作、租房、医疗、办事与日常会话地道表达，点击生词即时查词，点击喇叭即时发音
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {lesson.usages.length} 种细分用法
          </span>
        </div>

        <div className="space-y-6">
          {lesson.usages.map((usage, uIdx) => (
            <div
              key={usage.id}
              className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 dark:border-gray-700/70 dark:bg-gray-900/30 space-y-3"
            >
              <div className="flex items-baseline gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {uIdx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {usage.titleZh}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {usage.descriptionZh}
                  </p>
                </div>
              </div>

              {/* Examples Grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {usage.examples.map((ex, exIdx) => (
                  <ExampleItem key={exIdx} example={ex} index={exIdx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: 信号词 (Signal Words) */}
      {lesson.signalWords && lesson.signalWords.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              3. 标志信号词与时间连接词 (Marqueurs temporels)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              TCF Canada 听力与阅读定位关键信号词
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lesson.signalWords.map((sw, swIdx) => (
              <div
                key={swIdx}
                className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-700/60 dark:bg-gray-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {sw.word}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sw.meaningZh}
                  </span>
                </div>
                <div className="mt-2 text-xs">
                  <ExampleItem example={sw.example} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: 易错点警示 (Common Mistakes) */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/90 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              4. 华语母语者高频易错点 (Pièges fréquents)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              针对母语负迁移、虚词遗漏与时态混淆的专项纠偏
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lesson.commonMistakes.map((mistake, mIdx) => (
              <div
                key={mIdx}
                className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700/60 dark:bg-gray-900/40 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    <IconX className="h-3 w-3" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-rose-700 dark:text-rose-400 line-through">
                    {mistake.wrong}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {mistake.right}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300 pl-7">
                  {mistake.explanationZh}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: 课后针对性练习 (Practice) */}
      <TensePractice lessonId={lesson.id} questions={lesson.questions} />
    </div>
  )
}
