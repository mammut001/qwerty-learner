import type { EchelleEvaluation, EchelleStoredEvaluation } from '@/services/studyPlanSync'
import IconCheck from '~icons/tabler/check'
import IconX from '~icons/tabler/x'

const CRITERION_LABELS: Record<string, string> = { tache: '任务完成', texte: '篇章组织', phrase: '句子与语法', lexique: '词汇' }
const SCORE_LABELS = ['无法评估', '明显低于本级', '接近本级', '符合本级', '高于本级']

const warningText = (warning: string) => {
  if (warning === 'PROMPT_INJECTION') return '答案中出现了试图影响评分的指令，已忽略并下调分数。'
  if (warning === 'NOT_FRENCH') return '答案主要不是法语，按 0 分处理。'
  if (warning.startsWith('EVIDENCE_NOT_FOUND:'))
    return `「${CRITERION_LABELS[warning.split(':')[1]] ?? warning}」的评分没有引用到你的原文，已按规则下调。`
  return warning
}

type Props = { evaluation: EchelleEvaluation | EchelleStoredEvaluation; level: number }

export default function EchelleAiEvaluation({ evaluation, level }: Props) {
  const detailed = 'criteria' in evaluation ? evaluation : null
  const criteria = detailed
    ? detailed.criteria
    : Object.entries(evaluation.scores).map(([id, score]) => ({
        id,
        labelZh: CRITERION_LABELS[id] ?? id,
        score,
        evidence: '',
        commentZh: '',
      }))
  const requiredMean = detailed?.requiredMean ?? 2.75
  const estimate = evaluation.passed
    ? `约 Niveau ${evaluation.estimatedLevel}`
    : level > 1
    ? `约 Niveau ${evaluation.estimatedLevel}`
    : '尚未达到 Niveau 1'

  return (
    <div
      data-testid="ai-evaluation"
      className="mt-4 rounded-xl bg-gray-50 p-4 text-sm ring-1 ring-gray-200 dark:bg-white/[0.04] dark:ring-white/10"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          data-testid="ai-verdict"
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
            evaluation.passed
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
          }`}
        >
          {evaluation.passed ? <IconCheck className="h-4 w-4" /> : <IconX className="h-4 w-4" />}
          {evaluation.passed ? `达到 Niveau ${level}` : `未达到 Niveau ${level}`}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          平均 <b className="text-gray-900 dark:text-white">{evaluation.mean.toFixed(2)}</b> / 4（达标线 {requiredMean}，且任务完成 ≥
          3、每项 ≥ 2）
        </span>
        <span className="text-gray-600 dark:text-gray-400">估计水平：{estimate}</span>
      </div>

      <div className="mt-4 space-y-3">
        {criteria.map((criterion) => (
          <div key={criterion.id} data-testid={`ai-criterion-${criterion.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900 dark:text-white">{criterion.labelZh}</span>
              <span className="text-xs text-gray-500">
                {criterion.score} / 4 · {SCORE_LABELS[criterion.score]}
              </span>
            </div>
            <div className="ui-progress-track mt-1 h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  criterion.score >= 3 ? 'bg-emerald-500' : criterion.score === 2 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(criterion.score / 4) * 100}%` }}
              />
            </div>
            {criterion.commentZh && <p className="mt-1 text-gray-600 dark:text-gray-400">{criterion.commentZh}</p>}
            {criterion.evidence && <p className="mt-0.5 text-xs italic text-gray-500">依据：「{criterion.evidence}」</p>}
          </div>
        ))}
      </div>

      <p className="mt-4 leading-relaxed text-gray-800 dark:text-gray-200">{evaluation.feedbackZh}</p>

      {detailed && detailed.strengthsZh.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-emerald-700 dark:text-emerald-300">
          {detailed.strengthsZh.map((strength) => (
            <li key={strength}>{strength}</li>
          ))}
        </ul>
      )}

      {evaluation.corrections.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 font-medium text-gray-900 dark:text-white">修改建议</div>
          <ul className="space-y-2">
            {evaluation.corrections.map((correction) => (
              <li key={correction.original} className="rounded-lg bg-white p-2 dark:bg-white/[0.04]">
                <span className="text-rose-600 line-through dark:text-rose-400">{correction.original}</span>
                <span className="mx-1 text-gray-400">→</span>
                <span className="text-emerald-700 dark:text-emerald-300">{correction.suggestion}</span>
                <div className="mt-0.5 text-xs text-gray-500">{correction.explanationZh}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detailed && detailed.warnings.length > 0 && (
        <ul data-testid="ai-warnings" className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-300">
          {detailed.warnings.map((warning) => (
            <li key={warning}>⚠ {warningText(warning)}</li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-xs text-gray-400">
        按魁北克量表 Niveau {level} 官方描述评分 · {evaluation.provider}/{evaluation.model} · 标准 {evaluation.rubricVersion}
      </div>
    </div>
  )
}
