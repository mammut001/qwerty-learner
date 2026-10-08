import {
  COMMUNICATION_TYPES,
  ECHELLE_SKILLS,
  ECHELLE_TARGET_LEVEL,
  type EchelleSkill,
  getEchelleLevel,
  getEchelleStage,
  nextEchelleLevel,
} from '@/resources/echelleQuebecoise'
import { NavLink } from 'react-router-dom'

type Props = {
  skill: EchelleSkill
  currentLevel: number | null | undefined
  className?: string
}

export default function EchelleGoalCard({ skill, currentLevel, className = '' }: Props) {
  const skillMeta = ECHELLE_SKILLS.find((item) => item.skill === skill)
  const hasLevel = currentLevel != null && currentLevel >= 4
  const current = hasLevel ? getEchelleLevel(skill, currentLevel) : null
  const goalLevel = nextEchelleLevel(currentLevel)
  const goal = getEchelleLevel(skill, goalLevel)
  const goalStage = getEchelleStage(goalLevel)
  const atTarget = hasLevel && currentLevel >= ECHELLE_TARGET_LEVEL

  return (
    <section data-testid="echelle-goal-card" className={`my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="ui-eyebrow">魁北克能力量表对照 · {skillMeta?.labelZh}</div>
        <NavLink to={`/echelle?skill=${skill}&level=${goalLevel}`} className="ui-btn-secondary px-3 py-1.5 text-xs">
          查看完整量表 →
        </NavLink>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]">
          <div className="text-xs text-gray-500 dark:text-gray-400">这次估算对应</div>
          {current ? (
            <>
              <div className="mt-1 text-lg font-semibold text-gray-950 dark:text-white">
                Niveau {current.level} · {COMMUNICATION_TYPES[current.type]?.zh ?? current.type}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{current.descriptionZh}</p>
            </>
          ) : (
            <>
              <div className="mt-1 text-lg font-semibold text-gray-950 dark:text-white">低于 Niveau 4</div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                先把初级阶段的日常需求类任务做扎实，再冲 Niveau 4「功能性」交流。
              </p>
            </>
          )}
          {atTarget && (
            <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">已达到 NCLC 7 = 量表 Niveau 7（自主交流）。</p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-950 dark:text-white">下一步：Niveau {goal.level}</span>
            <span className="ui-chip">
              {goalStage.labelZh} · {COMMUNICATION_TYPES[goal.type]?.zh ?? goal.type}
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {goal.indicators.slice(0, 4).map((indicator) => (
              <li key={indicator.fr} className="flex gap-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <span className="text-gray-800 dark:text-gray-100">{indicator.zh}</span>
                  <span className="mt-0.5 block text-xs italic leading-5 text-gray-400">{indicator.examples[0]}</span>
                </span>
              </li>
            ))}
          </ul>
          {goal.dimensions.phrase.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {goal.dimensions.phrase.slice(0, 4).map((item) => (
                <span key={item} className="ui-chip text-[11px]">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
