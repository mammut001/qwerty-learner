import Header from '@/components/Header'
import { getEchelleLevelItems, parseEchelleItemId, summarizeEchelleLevel } from '@/resources/echelleCurriculum'
import { getEchelleStage } from '@/resources/echelleQuebecoise'
import { countDue } from '@/resources/echelleReview'
import type { LearningProgress } from '@/services/studyPlanSync'
import { getLearningProgress, subscribeLearningProgress } from '@/services/studyPlanSync'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconChevronRight from '~icons/tabler/chevron-right'
import IconClock from '~icons/tabler/clock'

const skillLabels: Record<string, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '书面表达',
  speaking: '口语表达',
  lex: '词汇',
  gr: '语法 / 篇章',
}

export default function LevelsPage() {
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

  const levels = useMemo(() => {
    const masteredIds = Object.entries(learning?.echelle?.items ?? {})
      .filter(([, record]) => record.mastered)
      .map(([id]) => id)
    return Array.from({ length: 12 }, (_, i) => {
      const level = i + 1
      const items = getEchelleLevelItems(level)
      const skills = Array.from(new Set(items.map((id) => parseEchelleItemId(id)?.skill ?? ''))).filter(Boolean)
      const due = countDue(learning?.echelle?.items ?? {}, items, Date.now())
      return { level, summary: summarizeEchelleLevel(level, masteredIds), skills, stage: getEchelleStage(level), due }
    })
  }, [learning])
  const currentLevel = levels.find(({ summary }) => !summary.passed)?.level ?? 12
  const passedCount = levels.filter(({ summary }) => summary.passed).length
  const totalDue = levels.reduce((sum, { due }) => sum + due, 0)

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="mb-8">
          <Link to="/study-plan" data-testid="levels-back-home" className="ui-btn-secondary mb-4 flex w-fit items-center gap-1">
            <IconChevronLeft className="h-4 w-4" />
            学习计划
          </Link>
          <span className="ui-eyebrow">Échelle québécoise</span>
          <h1 className="ui-title mt-2">等级课程</h1>
          <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
            按魁北克能力量表的 12
            个等级逐项学习。每个等级包含听力、阅读、书面表达、口语表达、词汇与语法/篇章知识点。全部掌握后该等级判定为「达标」。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="ui-chip" data-testid="levels-passed-count">
              已达标 {passedCount} / 12 级
            </span>
            {passedCount < 12 && (
              <Link to={`/levels/${currentLevel}`} className="ui-btn-primary px-3 py-1.5 text-sm no-underline">
                继续 Niveau {currentLevel}
              </Link>
            )}
            <Link
              to="/levels/review"
              data-testid="levels-review-link"
              className="ui-btn-secondary flex items-center gap-1 px-3 py-1.5 text-sm no-underline"
            >
              <IconClock className="h-4 w-4" /> 复习队列{totalDue > 0 ? `（${totalDue} 项待复习）` : ''}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {levels.map(({ level, summary, skills, stage, due }) => {
            const progress = summary.total > 0 ? Math.round((summary.mastered / summary.total) * 100) : 0
            const isPassed = summary.passed
            const isCurrent = !isPassed && currentLevel === level
            return (
              <Link
                key={level}
                to={`/levels/${level}`}
                data-testid={`level-card-${level}`}
                className={`ui-panel group relative flex flex-col gap-3 p-5 no-underline transition-all hover:-translate-y-px hover:shadow-lg ${
                  isPassed ? 'ring-1 ring-emerald-400/60' : isCurrent ? 'ring-1 ring-indigo-400/60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{stage.labelFr}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Niveau {level}</div>
                  </div>
                  {isPassed ? (
                    <span className="ui-chip-accent flex items-center gap-1 text-xs">
                      <IconCheck className="h-3.5 w-3.5" />
                      达标
                    </span>
                  ) : isCurrent ? (
                    <span className="ui-chip flex items-center gap-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      进行中
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="ui-chip text-[11px]">
                      {skillLabels[skill] ?? skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {summary.mastered} / {summary.total} 项
                      {due > 0 && <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">待复习 {due}</span>}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="ui-progress-track h-2">
                    <div className={`ui-progress-bar h-2 ${isPassed ? 'bg-emerald-500' : ''}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 text-gray-300 transition-colors group-hover:text-indigo-500 dark:text-gray-600">
                  <IconChevronRight className="h-5 w-5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
