import Layout from '@/components/Layout'
import {
  COMMUNICATION_TYPES,
  CONTEXT_ZH,
  DIMENSION_LABELS,
  ECHELLE_PROGRESSION_MARKERS,
  ECHELLE_SKILLS,
  ECHELLE_SOURCE,
  ECHELLE_STAGES,
  ECHELLE_TARGET_LEVEL,
  type EchelleLevel,
  type EchelleSkill,
  PHONOLOGY_DEGREES,
  DISCOURSE_TYPE_META,
  parseDimensionItem,
  SUJETS_ZH,
  CONTENU_ZH,
  ETENDUE_ZH,
  getEchelleLevel,
  getEchelleStage,
  isEchelleSkill,
  nextEchelleLevel,
} from '@/resources/echelleQuebecoise'
import { type StudyAnalytics, loadStudyAnalytics } from '@/services/studyPlanSync'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const GLOSSARY: { fr: string; zh: string }[] = [
  { fr: 'Le sens général', zh: '大意：整体信息，不抠细节（Niveau 4）' },
  { fr: 'L’essentiel', zh: '要点：信息中最重要、占比最大的部分（Niveau 5、7）' },
  { fr: 'De façon détaillée', zh: '详细：覆盖情境的大部分明确细节（Niveau 6）' },
  { fr: 'De façon structurée', zh: '有条理：各部分组织连贯（Niveau 8）' },
  { fr: 'Avec aisance', zh: '轻松自如：理解不费力、表达流畅（Niveau 9）' },
  { fr: 'Avec précision', zh: '精准：表述准确清晰（Niveau 10）' },
  { fr: 'De façon finement articulée', zh: '细腻有层次：大量复杂要素组织严密（Niveau 11）' },
  { fr: 'De façon créative', zh: '有创造性：运用修辞与文化典故表达（Niveau 12）' },
  { fr: 'Raconter / Relater', zh: '讲述事件经过 / 详细地讲述' },
  { fr: 'Exposer', zh: '系统、完整地阐述一个话题' },
  { fr: 'Interpréter', zh: '提炼隐含意义，并评估其价值与影响' },
  { fr: 'Mettre en perspective', zh: '多角度、结合背景地审视一个话题' },
]

function parseLevel(value: string | null): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null
}

export default function EchelleQuebecoisePage() {
  const [params, setParams] = useSearchParams()
  const paramSkill = params.get('skill')
  const skill: EchelleSkill = isEchelleSkill(paramSkill) ? paramSkill : 'listening'
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null)

  useEffect(() => {
    let cancelled = false
    loadStudyAnalytics()
      .then((value) => {
        if (!cancelled) setAnalytics(value)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const latestFor = (target: EchelleSkill): number | null => analytics?.tcf?.[target]?.latestNclc ?? null
  const currentLevel = latestFor(skill)
  const level = parseLevel(params.get('level')) ?? (currentLevel != null ? nextEchelleLevel(currentLevel) : ECHELLE_TARGET_LEVEL)
  const detail = getEchelleLevel(skill, level)
  const skillMeta = ECHELLE_SKILLS.find((item) => item.skill === skill) ?? ECHELLE_SKILLS[0]

  const select = (next: { skill?: EchelleSkill; level?: number }) => {
    const nextParams = new URLSearchParams(params)
    if (next.skill) nextParams.set('skill', next.skill)
    if (next.level) nextParams.set('level', String(next.level))
    setParams(nextParams, { replace: true })
  }

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          <header className="my-card relative overflow-hidden rounded-[28px] bg-white p-6 dark:bg-gray-800 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/20 via-indigo-400/20 to-transparent blur-3xl"
            />
            <div className="relative">
              <span className="ui-eyebrow">Échelle québécoise · {ECHELLE_SOURCE.edition}</span>
              <h1 className="ui-title mt-3">魁北克法语能力量表</h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">
                12 个等级、3 个阶段、4 项能力，描述每一级「能用法语做成什么事」。量表最初就是 CLB / NCLC 的法语改编版，等级与 NCLC
                一一对应：TCF Canada 换算出的 NCLC 7，就是这里的 Niveau 7（中级 · 自主交流）。
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                {ECHELLE_STAGES.map((stage) => (
                  <span key={stage.id} className="ui-chip">
                    {stage.labelZh} {stage.labelFr} · Niveau {stage.levels[0]}–{stage.levels[1]}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <Link to="/levels" className="ui-btn-primary inline-flex no-underline">
                  进入等级课程
                </Link>
              </div>
            </div>
          </header>

          <nav aria-label="能力" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ECHELLE_SKILLS.map((item) => {
              const active = item.skill === skill
              const latest = latestFor(item.skill)
              return (
                <button
                  key={item.skill}
                  type="button"
                  data-testid={`echelle-skill-${item.skill}`}
                  aria-pressed={active}
                  onClick={() => select({ skill: item.skill, level: latest != null ? nextEchelleLevel(latest) : level })}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-indigo-300 bg-white shadow-[0_10px_30px_-18px_rgba(79,70,229,0.7)] dark:border-indigo-400/40 dark:bg-gray-800'
                      : 'border-gray-200/80 bg-white/60 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-xs font-bold ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400'}`}>
                      {item.code}
                    </span>
                    <span className="text-[11px] tabular-nums text-gray-400">
                      {latest == null ? '未测' : latest >= 4 ? `NCLC ${latest}` : '< 4'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-950 dark:text-white">{item.labelZh}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.labelFr}</div>
                </button>
              )
            })}
          </nav>

          <section className="my-card rounded-3xl bg-white p-5 dark:bg-gray-800 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {ECHELLE_STAGES.map((stage) => (
                <div key={stage.id}>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stage.labelZh} · {stage.labelFr}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 4 }, (_, index) => stage.levels[0] + index).map((value) => {
                      const selected = value === level
                      const isCurrent = currentLevel != null && currentLevel >= 4 && value === currentLevel
                      const isTarget = value === ECHELLE_TARGET_LEVEL
                      return (
                        <button
                          key={value}
                          type="button"
                          data-testid={`echelle-level-${value}`}
                          aria-pressed={selected}
                          aria-label={`Niveau ${value}${isCurrent ? '（当前）' : ''}${isTarget ? '（NCLC 7 目标）' : ''}`}
                          onClick={() => select({ level: value })}
                          className={`relative flex h-12 flex-col items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition ${
                            selected
                              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_8px_18px_-8px_rgba(99,102,241,0.8)]'
                              : isTarget
                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/20'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          {value}
                          {(isCurrent || isTarget) && (
                            <span className={`text-[9px] font-medium leading-none ${selected ? 'text-white/80' : 'text-gray-400'}`}>
                              {isCurrent ? '当前' : '目标'}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <LevelDetail skillLabel={skillMeta.labelZh} detail={detail} currentLevel={currentLevel} />

          {skill === 'speaking' && (
            <section className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">发音掌握度 · Maitrise phonologique</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                量表不按等级规定发音，只看两件事：法语音位与韵律掌握得怎样，以及对方要花多大力气才能听懂。
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PHONOLOGY_DEGREES.map((degree, index) => (
                  <div key={degree.labelFr} className="ui-stat">
                    <div className="ui-stat-label">
                      {index + 1}. {degree.labelZh}
                    </div>
                    <div className="mt-1 text-xs italic text-gray-400">{degree.labelFr}</div>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{degree.descriptionZh}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-7">
            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">读懂等级用词</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              相邻等级的差别往往只在一个修饰语上，记住这些词就能看出升级要补什么。
            </p>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {GLOSSARY.map((entry) => (
                <div key={entry.fr} className="flex gap-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium italic text-gray-900 dark:text-gray-100">{entry.fr}</dt>
                  <dd className="text-gray-600 dark:text-gray-300">{entry.zh}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="px-1 text-xs leading-5 text-gray-400">
            来源：{ECHELLE_SOURCE.title}（{ECHELLE_SOURCE.publisher}，{ECHELLE_SOURCE.edition}
            ）。法文为原文，中文为学习用释义。量表本身不是测评工具；这里的「当前」来自你最近一次模考的训练估算。
          </p>
        </div>
      </main>
    </Layout>
  )
}

function LevelDetail({ skillLabel, detail, currentLevel }: { skillLabel: string; detail: EchelleLevel; currentLevel: number | null }) {
  const stage = getEchelleStage(detail.level)
  const type = COMMUNICATION_TYPES[detail.type]
  const status =
    currentLevel == null
      ? null
      : currentLevel >= detail.level
      ? '你最近一次模考已达到这一级'
      : detail.level === nextEchelleLevel(currentLevel)
      ? '这是你的下一级目标'
      : null

  return (
    <section data-testid="echelle-level-detail" className="my-card rounded-3xl bg-white p-6 dark:bg-gray-800 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="ui-eyebrow">
            {skillLabel} · {stage.labelZh} {stage.labelFr}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            Niveau {detail.level}
            <span className="ml-3 text-base font-medium text-gray-500 dark:text-gray-400">
              {detail.type} · {type?.zh}
            </span>
          </h2>
          {type && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{type.definition}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.level === ECHELLE_TARGET_LEVEL && <span className="ui-chip-accent">= NCLC 7 达标线</span>}
          {status && <span className="ui-chip">{status}</span>}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">总体描述 · Description générale</div>
        <p className="mt-1.5 text-[15px] leading-7 text-gray-800 dark:text-gray-100">{detail.descriptionZh}</p>
        <p className="mt-1 text-sm italic leading-6 text-gray-500 dark:text-gray-400">{detail.descriptionFr}</p>
      </div>

      {/* 官方演进参数矩阵 (Paramètres de progression) */}
      <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/10 dark:bg-gray-900/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">演进参数矩阵 · Paramètres de progression</h3>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">官方 6 维宏观标准</span>
        </div>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">沟通模式 · Communication</div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {detail.type} ({type?.zh ?? ''})
            </div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{type?.definition}</div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">话题范围 · Sujets</div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {detail.sujets ? SUJETS_ZH[detail.sujets] ?? detail.sujets : '日常生活'}
            </div>
            {detail.sujets && <div className="mt-0.5 text-xs italic text-gray-500 dark:text-gray-400">{detail.sujets}</div>}
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">篇幅与语篇广度 · Étendue</div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {detail.etendue ? ETENDUE_ZH[detail.etendue] ?? detail.etendue : '常规篇幅'}
            </div>
            {detail.etendue && <div className="mt-0.5 text-xs italic text-gray-500 dark:text-gray-400">{detail.etendue}</div>}
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04] sm:col-span-2 lg:col-span-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">内容特质 · Contenu</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(detail.contenu && detail.contenu.length > 0 ? detail.contenu : ['Factuel', 'Concret']).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  {CONTENU_ZH[c] ?? c}
                  <span className="ml-1 text-[10px] italic opacity-75">({c})</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">语言综合 · Composantes</div>
            <div className="mt-1 text-xs leading-5 text-gray-800 dark:text-gray-200">
              {detail.composantesLinguistiques || '基础词汇与句式'}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-white/[0.04] sm:col-span-2 lg:col-span-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">语境特征与支持 · Contexte</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detail.context.map((item) => (
                <span key={item} className="ui-chip text-xs" title={item}>
                  {CONTEXT_ZH[item] ?? item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-sm font-semibold text-gray-950 dark:text-white">
        能力指标与真实情境 · Indicateurs ({detail.indicators.length} 条)
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        指标按 8 大语篇类型分类；附带的示例为魁省官方行动导向典型情境（Situations types）。
      </p>
      <ol className="mt-3 space-y-3">
        {detail.indicators.map((indicator, index) => {
          const dt = indicator.typeDeDiscours && DISCOURSE_TYPE_META[indicator.typeDeDiscours]
          return (
            <li
              key={indicator.fr}
              data-testid="echelle-indicator"
              className="rounded-2xl border border-gray-200/80 p-4 transition-colors hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold tabular-nums text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {dt && (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${dt.badgeClass}`}
                        title={dt.descriptionZh}
                      >
                        {dt.zh} · {dt.fr}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-950 dark:text-white">{indicator.zh}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{indicator.fr}</div>
                  <div className="mt-2.5 rounded-xl bg-gray-50/70 p-2.5 dark:bg-white/[0.02]">
                    <div className="text-[11px] font-medium text-gray-400">官方行动情境（Situations types）：</div>
                    <ul className="mt-1 space-y-1">
                      {indicator.examples.map((example) => (
                        <li key={example} className="text-xs leading-5 text-gray-600 dark:text-gray-300">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <h3 className="mt-8 text-sm font-semibold text-gray-950 dark:text-white">本级语言掌握维度 · Dimensions linguistiques</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        只列本级新出现的语言点（低级已掌握的累积继承）；每个要点均解析出官方掌握阶段：
        <span className="ml-1 inline-flex items-center gap-1">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            初学萌芽 (Quelques)
          </span>
          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
            多样熟练 (Une variété)
          </span>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            巩固掌握 (Maitrise)
          </span>
        </span>
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {(Object.keys(DIMENSION_LABELS) as (keyof EchelleLevel['dimensions'])[]).map((key) => (
          <div key={key} className="rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.04]">
            <div className="text-xs font-semibold text-gray-950 dark:text-white">{DIMENSION_LABELS[key].zh}</div>
            <div className="text-[11px] italic text-gray-400">{DIMENSION_LABELS[key].fr}</div>
            {detail.dimensions[key].length === 0 ? (
              <p className="mt-2 text-xs text-gray-400">本级无新增</p>
            ) : (
              <ul className="mt-2.5 space-y-2">
                {detail.dimensions[key].map((item) => {
                  const parsed = parseDimensionItem(item)
                  return (
                    <li key={item} className="flex items-start gap-1.5 text-xs leading-5 text-gray-700 dark:text-gray-200">
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${parsed.stageBadgeClass}`}>
                        {parsed.stageLabelZh}
                      </span>
                      <span>{parsed.cleanText}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
