import EchelleAiEvaluation from '@/components/EchelleAiEvaluation'
import useFrenchSpeechRecognition from '@/hooks/useFrenchSpeechRecognition'
import useSpeech from '@/hooks/useSpeech'
import {
  ECHELLE_ITEM_CATALOG,
  type EchelleCatalogItem,
  type EchelleItemSkill,
  type EchelleProductionItem,
  type EchelleQuizItem,
  getEchelleLevelItems,
  scoreEchelleItem,
} from '@/resources/echelleCurriculum'
import { estimateRetention } from '@/resources/echelleMemory'
import { getEchelleStage } from '@/resources/echelleQuebecoise'
import { countDue, memoryLabel } from '@/resources/echelleReview'
import type { EchelleAiStatus, EchelleEvaluation, EchelleItemRecord, LearningProgress } from '@/services/studyPlanSync'
import {
  evaluateEchelleProduction,
  getLearningProgress,
  loadEchelleAiStatus,
  recordEchelleMastery,
  subscribeLearningProgress,
} from '@/services/studyPlanSync'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import IconBook from '~icons/tabler/book'
import IconCheck from '~icons/tabler/check'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconChevronRight from '~icons/tabler/chevron-right'
import IconClock from '~icons/tabler/clock'
import IconHeadphones from '~icons/tabler/headphones'
import IconMicrophone from '~icons/tabler/microphone'
import IconPencil from '~icons/tabler/pencil'
import IconPlayerPlay from '~icons/tabler/player-play'
import IconRefresh from '~icons/tabler/refresh'
import IconSparkles from '~icons/tabler/sparkles'
import IconVolume from '~icons/tabler/volume'

const skillLabels: Record<EchelleItemSkill, string> = {
  listening: '听力',
  reading: '阅读',
  writing: '书面表达',
  speaking: '口语表达',
  lex: '词汇',
  gr: '语法 / 篇章',
}

const skillIcons: Record<EchelleItemSkill, ReactNode> = {
  listening: <IconHeadphones className="h-4 w-4" />,
  reading: <IconBook className="h-4 w-4" />,
  writing: <IconPencil className="h-4 w-4" />,
  speaking: <IconMicrophone className="h-4 w-4" />,
  lex: <span className="text-xs font-bold">词</span>,
  gr: <span className="text-xs font-bold">法</span>,
}

const SKILL_ORDER: EchelleItemSkill[] = ['listening', 'reading', 'writing', 'speaking', 'lex', 'gr']
const FRENCH_SPEECH: Partial<SpeechSynthesisUtterance> = { lang: 'fr-CA', rate: 0.9 }

function useLearning() {
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
  return learning
}

function useAiStatus() {
  const [status, setStatus] = useState<EchelleAiStatus | null>(null)
  useEffect(() => {
    let active = true
    void loadEchelleAiStatus().then((next) => {
      if (active) setStatus(next)
    })
    return () => {
      active = false
    }
  }, [])
  return status
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function openItem(itemId: string, setActive?: (id: string) => void) {
  setActive?.(itemId)
  requestAnimationFrame(() =>
    document.querySelector(`[data-testid="level-item-${itemId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  )
}

export default function LevelDetailPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const level = Number(levelParam)
  const validLevel = Number.isInteger(level) && level >= 1 && level <= 12
  const learning = useLearning()
  const aiStatus = useAiStatus()
  const [searchParams] = useSearchParams()
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const items = useMemo(
    () =>
      validLevel
        ? getEchelleLevelItems(level)
            .map((id) => ECHELLE_ITEM_CATALOG[id])
            .filter(Boolean)
        : [],
    [level, validLevel],
  )

  const linkedItem = searchParams.get('item')
  useEffect(() => {
    if (linkedItem && items.some((item) => item.id === linkedItem)) openItem(linkedItem, setActiveItemId)
    else setActiveItemId(null)
  }, [items, linkedItem])

  const grouped = useMemo(() => {
    const map = new Map<EchelleItemSkill, EchelleCatalogItem[]>()
    for (const skill of SKILL_ORDER) {
      const list = items.filter((item) => item.skill === skill)
      if (list.length) map.set(skill, list)
    }
    return map
  }, [items])

  if (!validLevel) {
    return (
      <>
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Link to="/levels" className="ui-btn-secondary">
            返回等级课程
          </Link>
          <p className="mt-6 text-gray-600">无效的等级参数。</p>
        </div>
      </>
    )
  }

  const now = Date.now()
  const itemStates = learning?.echelle?.items ?? {}
  const total = items.length
  const mastered = items.filter((item) => itemStates[item.id]?.mastered).length
  const passed = total > 0 && mastered === total
  const dueCount = countDue(
    itemStates,
    items.map((item) => item.id),
    now,
  )
  const nextItem =
    items.find((item) => !itemStates[item.id]?.mastered) ?? items.find((item) => memoryLabel(itemStates[item.id], now).status === 'due')
  const percent = total ? Math.round((mastered / total) * 100) : 0

  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 pb-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link to="/levels" className="ui-btn-secondary flex items-center gap-1">
            <IconChevronLeft className="h-4 w-4" />
            全部等级
          </Link>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">{getEchelleStage(level).labelFr}</div>
            <h1 className="ui-title">Niveau {level}</h1>
          </div>
          {passed && (
            <span className="ui-chip-accent flex items-center gap-1">
              <IconCheck className="h-4 w-4" /> 已达标
            </span>
          )}
          <nav aria-label="相邻等级" className="ml-auto flex gap-2 text-sm">
            {level > 1 && (
              <Link to={`/levels/${level - 1}`} className="ui-btn-secondary flex items-center gap-1 px-3 py-1.5">
                <IconChevronLeft className="h-4 w-4" /> Niveau {level - 1}
              </Link>
            )}
            {level < 12 && (
              <Link to={`/levels/${level + 1}`} className="ui-btn-secondary flex items-center gap-1 px-3 py-1.5">
                Niveau {level + 1} <IconChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.05] dark:bg-white/[0.04] dark:ring-white/[0.06]">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">总进度</span>
            <span className="font-semibold text-gray-900 dark:text-white" data-testid="level-progress">
              {mastered} / {total}
            </span>
          </div>
          <div
            className="ui-progress-track h-3"
            role="progressbar"
            aria-label={`Niveau ${level} 进度`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className={`ui-progress-bar h-3 ${passed ? 'bg-emerald-500' : ''}`} style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {Array.from(grouped.entries()).map(([skill, list]) => (
              <span key={skill} className="ui-chip">
                {skillLabels[skill]} {list.filter((item) => itemStates[item.id]?.mastered).length}/{list.length}
              </span>
            ))}
            {dueCount > 0 && (
              <span data-testid="level-due-count" className="ui-chip flex items-center gap-1 text-amber-700 dark:text-amber-300">
                <IconClock className="h-3.5 w-3.5" /> 待复习 {dueCount}
              </span>
            )}
          </div>
          {nextItem && (
            <button type="button" onClick={() => openItem(nextItem.id, setActiveItemId)} className="ui-btn-primary mt-4 text-sm">
              {itemStates[nextItem.id]?.mastered ? '复习' : '继续学习'}：{skillLabels[nextItem.skill]} · {nextItem.titleZh}
            </button>
          )}
          <p className="mt-3 text-xs text-gray-500">
            按遗忘曲线安排复习：通过后 1、2、4、7、15、30、60、120 天各复习一次；复习没通过即视为遗忘，需要重新掌握，等级达标也会随之取消。
          </p>
        </div>

        {passed && (
          <div
            data-testid="level-passed-banner"
            className="mb-8 rounded-2xl bg-emerald-50 p-5 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800/40"
          >
            恭喜！你已经掌握 Niveau {level} 的全部知识点。
            {level < 12 ? (
              <Link to={`/levels/${level + 1}`} className="ml-2 font-semibold underline">
                进入 Niveau {level + 1}
              </Link>
            ) : (
              <span className="ml-2 font-semibold">你已完成量表的全部 12 个等级。</span>
            )}
          </div>
        )}

        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([skill, list]) => (
            <section key={skill} data-testid={`level-skill-${skill}`}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {skillIcons[skill]}
                </span>
                {skillLabels[skill]}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {list.filter((item) => itemStates[item.id]?.mastered).length} / {list.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                {list.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    now={now}
                    aiStatus={aiStatus}
                    state={itemStates[item.id]}
                    isOpen={activeItemId === item.id}
                    onToggle={() => setActiveItemId(activeItemId === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

function ItemCard({
  item,
  now,
  aiStatus,
  state,
  isOpen,
  onToggle,
}: {
  item: EchelleCatalogItem
  now: number
  aiStatus: EchelleAiStatus | null
  state?: EchelleItemRecord
  isOpen: boolean
  onToggle: () => void
}) {
  const isMastered = state?.mastered ?? false
  const memory = memoryLabel(state, now)
  const retention = isMastered ? Math.round(estimateRetention(state, now) * 100) : null
  const subtitle = item.kind === 'indicator' ? item.descriptionFr : item.kind === 'production' ? item.promptZh : undefined
  return (
    <div
      className={`ui-panel overflow-hidden p-0 transition-all ${isOpen ? 'ring-1 ring-indigo-400/60 sm:col-span-2' : ''}`}
      data-testid={`level-item-${item.id}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
              isMastered
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400'
            }`}
          >
            {isMastered ? <IconCheck className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-gray-900 dark:text-white">{item.titleZh}</span>
            {subtitle && <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>}
          </span>
        </div>
        <span
          data-testid={`level-item-status-${item.id}`}
          data-status={memory.status}
          title={retention !== null ? `估计记忆保持率约 ${retention}%` : undefined}
          className={`shrink-0 text-xs ${memory.status === 'due' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}
        >
          {memory.text}
        </span>
      </button>
      {isOpen &&
        (item.kind === 'production' ? <ProductionPanel item={item} state={state} aiStatus={aiStatus} /> : <QuizPanel item={item} />)}
    </div>
  )
}

function QuizPanel({ item }: { item: EchelleQuizItem }) {
  const [answers, setAnswers] = useState<(string | null)[]>(() => item.questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const isListening = item.skill === 'listening'
  const { speak } = useSpeech(item.audioText ?? item.text ?? '', FRENCH_SPEECH)

  const complete = answers.every((answer): answer is string => answer !== null)
  const result = submitted && complete ? scoreEchelleItem(item.id, answers) : null

  const handleSubmit = () => {
    if (!complete) return
    recordEchelleMastery({ itemId: item.id, answers })
    setSubmitted(true)
  }

  const handleRetry = () => {
    setAnswers(item.questions.map(() => null))
    setSubmitted(false)
    setShowTranscript(false)
  }

  return (
    <div className="border-t border-gray-100 p-4 dark:border-white/[0.06]">
      {isListening ? (
        <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => speak(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-sm ring-1 ring-gray-200 dark:bg-white/[0.06] dark:text-indigo-300 dark:ring-white/10"
            >
              <IconVolume className="h-3.5 w-3.5" /> 播放录音
            </button>
            <button
              type="button"
              onClick={() => setShowTranscript((value) => !value)}
              className="text-xs text-gray-500 underline-offset-2 hover:underline"
            >
              {showTranscript || submitted ? '隐藏原文' : '看原文（先听再看）'}
            </button>
          </div>
          {(showTranscript || submitted) && (
            <p className="mt-3 leading-relaxed text-gray-800 dark:text-gray-200" data-testid="listening-transcript">
              {item.text}
            </p>
          )}
        </div>
      ) : (
        item.text && (
          <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 dark:bg-white/[0.04] dark:text-gray-200">
            {item.text}
          </div>
        )
      )}
      {item.explanationZh && <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">{item.explanationZh}</div>}
      {item.examples && item.examples.length > 0 && (
        <div className="mb-4 space-y-1">
          {item.examples.map(([fr, zh], index) => (
            <div key={index} className="text-sm">
              <span className="text-gray-800 dark:text-gray-200">{fr}</span>
              <span className="ml-2 text-gray-500">{zh}</span>
            </div>
          ))}
        </div>
      )}
      {item.words && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {item.words.map(([fr, zh]) => (
            <div key={fr} className="rounded-lg bg-gray-50 p-2 text-sm dark:bg-white/[0.04]">
              <div className="font-medium text-gray-900 dark:text-white">{fr}</div>
              <div className="text-gray-500">{zh}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {item.questions.map((question, index) => (
          <fieldset key={index}>
            <legend className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              {index + 1}. {question.prompt}
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {question.choices.map((choice) => {
                const selected = answers[index] === choice
                let style =
                  'bg-white ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:bg-white/[0.08]'
                if (submitted) {
                  if (choice === question.answer)
                    style = 'bg-emerald-50 ring-1 ring-emerald-300 dark:bg-emerald-900/20 dark:ring-emerald-700'
                  else if (selected) style = 'bg-rose-50 ring-1 ring-rose-300 dark:bg-rose-900/20 dark:ring-rose-700'
                } else if (selected) {
                  style = 'bg-indigo-50 ring-1 ring-indigo-300 dark:bg-indigo-900/20 dark:ring-indigo-700'
                }
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={submitted}
                    aria-pressed={selected}
                    onClick={() => setAnswers((current) => current.map((value, i) => (i === index ? choice : value)))}
                    className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${style}`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!complete}
            className="ui-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            提交答案
          </button>
        ) : (
          <>
            {result?.mastered ? (
              <span data-testid="level-item-mastered" className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <IconCheck className="h-5 w-5" /> 已掌握（{result.correctCount}/{result.totalQuestions}）
              </span>
            ) : (
              <span data-testid="level-item-failed" className="text-rose-600 dark:text-rose-400">
                答对 {result?.correctCount ?? 0}/{result?.totalQuestions ?? item.questions.length}，
                {item.threshold >= 1 ? '需要全部答对' : `需要至少 ${Math.round(item.threshold * 100)}%`}，请重试
              </span>
            )}
            <button type="button" onClick={handleRetry} className="ui-btn-secondary flex items-center gap-1">
              <IconRefresh className="h-4 w-4" /> 重做
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const AI_ERRORS: Record<string, string> = {
  PRODUCTION_TOO_SHORT: '长度还不够，请先达到字数/时长要求。',
  AI_RATE_LIMITED: 'AI 评分次数过多（每小时 30 次），请稍后再试。',
  AI_DISABLED: '服务端未开启 AI 评分。',
  PENDING_MUTATIONS: '还有学习记录未同步，请联网后再评分。',
  STUDY_SESSION_BLOCKED: '浏览器未保留学习会话，暂时无法评分。',
}

function ProductionPanel({
  item,
  state,
  aiStatus,
}: {
  item: EchelleProductionItem
  state?: EchelleItemRecord
  aiStatus: EchelleAiStatus | null
}) {
  const isWriting = item.skill === 'writing'
  const aiEnabled = aiStatus?.enabled ?? false
  const [text, setText] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [usedSpeech, setUsedSpeech] = useState(false)
  const [selfChecks, setSelfChecks] = useState<boolean[]>(() => item.selfChecks.map(() => false))
  const [saved, setSaved] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EchelleEvaluation | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const speech = useFrenchSpeechRecognition((phrase) => {
    if (!phrase) return
    setText((current) => (current ? `${current} ${phrase}` : phrase))
    setUsedSpeech(true)
  })

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => stopTimer, [])

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      stopTimer()
      speech.stop()
    } else {
      setIsRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
      if (speech.supported) speech.start()
    }
  }

  const wc = wordCount(text)
  const meetsLength = isWriting ? wc >= (item.wordMin ?? 0) : seconds >= (item.secondsMin ?? 0)
  const canSelfMaster = meetsLength && selfChecks.every(Boolean) && !isRecording
  const canEvaluate = meetsLength && (isWriting || wc >= 3) && !isRecording && !evaluating

  const handleSelfMaster = () => {
    recordEchelleMastery({
      itemId: item.id,
      response: isWriting ? { selfChecks, wordCount: wc } : { selfChecks, seconds },
    })
    setSaved(true)
  }

  const handleEvaluate = async () => {
    setEvaluating(true)
    setAiError(null)
    try {
      setEvaluation(
        await evaluateEchelleProduction({
          itemId: item.id,
          text,
          ...(isWriting ? {} : { seconds, inputMode: usedSpeech ? 'speech' : 'manual-transcript' }),
        }),
      )
    } catch (error) {
      setAiError(AI_ERRORS[(error as Error).message] ?? 'AI 评分暂时不可用，请稍后重试。')
    } finally {
      setEvaluating(false)
    }
  }

  const textArea = (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      rows={6}
      aria-label={isWriting ? '书面表达作答' : '口语转写'}
      data-testid={isWriting ? undefined : 'speaking-transcript'}
      className="w-full rounded-xl border-0 bg-gray-50 p-3 text-sm text-gray-900 ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:bg-white/[0.04] dark:text-white dark:ring-white/10"
      placeholder={isWriting ? '用法语回答…' : '你说的内容会出现在这里，也可以手动输入或修改…'}
    />
  )

  return (
    <div className="border-t border-gray-100 p-4 dark:border-white/[0.06]">
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-white">题目：</span>
        {item.promptZh}
      </div>
      <div className="mb-4 text-sm italic text-gray-500">{item.promptFr}</div>

      {isWriting ? (
        <>
          {textArea}
          <div className={`mt-2 text-xs ${meetsLength ? 'text-emerald-600' : 'text-gray-500'}`}>
            当前 {wc} 词 / 目标 {item.wordMin} 词
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-white/[0.04]">
            <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="speaking-seconds">
              {seconds}s
            </div>
            <div className="mt-1 text-xs text-gray-500">大声说出你的回答；目标：至少 {item.secondsMin} 秒</div>
            <button
              type="button"
              onClick={toggleRecording}
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                isRecording
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              }`}
            >
              {isRecording ? (
                '停止计时'
              ) : (
                <>
                  <IconPlayerPlay className="h-4 w-4" /> 开始计时
                </>
              )}
            </button>
            {speech.listening && speech.interim && <p className="mt-2 text-sm italic text-gray-500">{speech.interim}…</p>}
          </div>
          {aiEnabled && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-gray-500">
                {speech.supported
                  ? '计时时会自动转写（魁北克法语），转写有误可以直接修改。'
                  : '这个浏览器不支持语音转写，请在下面手动输入你刚才说的内容。'}
              </div>
              {textArea}
              {speech.error && <div className="mt-1 text-xs text-rose-600">{speech.error}</div>}
            </div>
          )}
        </>
      )}

      <div className="mt-4 space-y-2">
        {aiEnabled && <div className="text-xs font-medium text-gray-500">自查清单（不计分，AI 评分决定是否掌握）</div>}
        {item.selfChecks.map((label, index) => (
          <label key={label} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={selfChecks[index]}
              onChange={(e) => setSelfChecks((current) => current.map((value, i) => (i === index ? e.target.checked : value)))}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {aiEnabled ? (
          <button
            type="button"
            onClick={() => void handleEvaluate()}
            disabled={!canEvaluate}
            className="ui-btn-primary flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSparkles className="h-4 w-4" /> {evaluating ? 'AI 正在按量表评分…' : 'AI 评分'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSelfMaster}
              disabled={!canSelfMaster}
              className="ui-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              标记为已掌握
            </button>
            {saved && (
              <span data-testid="level-item-mastered" className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <IconCheck className="h-4 w-4" /> 已记录
              </span>
            )}
            <span className="text-xs text-gray-400">未开启 AI 评分：按字数/时长 + 自评记录</span>
          </>
        )}
        {aiError && (
          <span data-testid="ai-error" className="text-sm text-rose-600 dark:text-rose-400">
            {aiError}
          </span>
        )}
      </div>

      {evaluation ? (
        <EchelleAiEvaluation evaluation={evaluation} level={item.level} />
      ) : (
        state?.ai && (
          <>
            <div className="mt-4 text-xs text-gray-500">上次 AI 评分</div>
            <EchelleAiEvaluation evaluation={state.ai} level={item.level} />
          </>
        )
      )}
    </div>
  )
}
