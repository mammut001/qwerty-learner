import { DAY_MS, estimateRetention } from '@/resources/echelleMemory'
import { type EchelleReviewEntry, echelleReviewQueue, formatDue } from '@/resources/echelleReview'
import type { LearningProgress } from '@/services/studyPlanSync'
import { getLearningProgress, subscribeLearningProgress } from '@/services/studyPlanSync'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconChevronRight from '~icons/tabler/chevron-right'

const skillLabels: Record<string, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '书面表达',
  speaking: '口语表达',
  lex: '词汇',
  gr: '语法 / 篇章',
}

const UPCOMING_DAYS = 7

function ReviewRow({ entry, now }: { entry: EchelleReviewEntry; now: number }) {
  const retention = Math.round(estimateRetention(entry.record, now) * 100)
  return (
    <li>
      <Link
        to={`/levels/${entry.item.level}?item=${entry.item.id}`}
        data-testid={`review-item-${entry.item.id}`}
        className="ui-panel flex items-center justify-between gap-3 p-4 no-underline transition-all hover:-translate-y-px hover:shadow-md"
      >
        <span className="min-w-0">
          <span className="block font-medium text-gray-900 dark:text-white">
            Niveau {entry.item.level} · {skillLabels[entry.item.skill]} · {entry.item.titleZh}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            第 {entry.record.stage ?? 1} 次复习间隔 · 估计记忆保持 {retention}%
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
          {entry.dueAt <= now ? <b className="text-amber-600 dark:text-amber-400">现在复习</b> : formatDue(entry.dueAt, now)}
          <IconChevronRight className="h-4 w-4" />
        </span>
      </Link>
    </li>
  )
}

export default function LevelReviewPage() {
  const [learning, setLearning] = useState<LearningProgress | null>(null)

  useEffect(() => {
    let active = true
    void getLearningProgress().then((next) => {
      if (active) setLearning(next)
    })
    const unsubscribe = subscribeLearningProgress(setLearning)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const now = Date.now()
  const queue = echelleReviewQueue(learning?.echelle?.items ?? {}, now + UPCOMING_DAYS * DAY_MS)
  const due = queue.filter((entry) => entry.dueAt <= now)
  const upcoming = queue.filter((entry) => entry.dueAt > now)

  return (
    <>
      <div className="container mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <Link to="/levels" className="ui-btn-secondary inline-flex items-center gap-1">
          <IconChevronLeft className="h-4 w-4" /> 全部等级
        </Link>
        <h1 className="ui-title mt-4">复习队列</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          按艾宾浩斯遗忘曲线安排：每次按时通过，下次间隔变长（1 → 2 → 4 → 7 → 15 → 30 → 60 → 120
          天）；提前练习不改变计划；复习没通过就回到「未掌握」。
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white" data-testid="review-due-count">
          现在需要复习：{due.length} 项
        </h2>
        {due.length ? (
          <ul className="space-y-2">
            {due.map((entry) => (
              <ReviewRow key={entry.item.id} entry={entry} now={now} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">没有到期的知识点，继续学习新内容吧。</p>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">未来 {UPCOMING_DAYS} 天</h2>
            <ul className="space-y-2">
              {upcoming.map((entry) => (
                <ReviewRow key={entry.item.id} entry={entry} now={now} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
