import Layout from '@/components/Layout'
import { type TcfEeScores, calculateEeTotalScore, countFrenchWords, estimateTcfEeNclc } from '@/resources/tcfEvaluation'
import { TCF_WRITING_PROMPTS_BY_TASK, type TcfWritingPrompt } from '@/resources/tcfWritingData'
import {
  type TcfEeAttempt,
  type TcfEeDraft,
  addStudyMinutes,
  deleteTcfEeDraft,
  flushStudyProgress,
  loadTcfEeDraft,
  saveTcfEeDraft,
  submitTcfEeAttempt,
} from '@/services/studyPlanSync'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconCheck from '~icons/tabler/check'
import IconClock from '~icons/tabler/clock'
import IconDeviceFloppy from '~icons/tabler/device-floppy'
import IconRefresh from '~icons/tabler/refresh'

type ExamMode = 'intro' | 'writing' | 'assessment' | 'review'

const TOTAL_MINUTES = 60
const TOTAL_SECONDS = TOTAL_MINUTES * 60

const formatClock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const nclcLabel = (value: number) => (value >= 4 ? `NCLC ${value}` : 'NCLC < 4')

export default function TcfWritingPage() {
  const [searchParams] = useSearchParams()
  const studyDate = searchParams.get('studyDate')
  const studyTask = searchParams.get('studyTask')

  // Selected prompts for Task 1, 2, 3
  const [task1Index, setTask1Index] = useState(0)
  const [task2Index, setTask2Index] = useState(0)
  const [task3Index, setTask3Index] = useState(0)

  const prompt1 = TCF_WRITING_PROMPTS_BY_TASK[1][task1Index] ?? TCF_WRITING_PROMPTS_BY_TASK[1][0]
  const prompt2 = TCF_WRITING_PROMPTS_BY_TASK[2][task2Index] ?? TCF_WRITING_PROMPTS_BY_TASK[2][0]
  const prompt3 = TCF_WRITING_PROMPTS_BY_TASK[3][task3Index] ?? TCF_WRITING_PROMPTS_BY_TASK[3][0]

  const [mode, setMode] = useState<ExamMode>('intro')
  const [activeTask, setActiveTask] = useState<1 | 2 | 3>(1)
  const [responses, setResponses] = useState<{ 1: string; 2: string; 3: string }>({
    1: '',
    2: '',
    3: '',
  })
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [draftId, setDraftId] = useState<string>(() => `draft-${Date.now()}`)
  const [savedDraft, setSavedDraft] = useState<TcfEeDraft | null>(null)
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [scores, setScores] = useState<TcfEeScores>({
    taskCompletion: 3,
    coherence: 3,
    vocabulary: 3,
    grammar: 3,
  })
  const [, setResult] = useState<TcfEeAttempt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const activePrompt: TcfWritingPrompt = activeTask === 1 ? prompt1 : activeTask === 2 ? prompt2 : prompt3
  const activeText = responses[activeTask]
  const resp1 = responses[1]
  const resp2 = responses[2]
  const resp3 = responses[3]
  const wordCount1 = useMemo(() => countFrenchWords(resp1), [resp1])
  const wordCount2 = useMemo(() => countFrenchWords(resp2), [resp2])
  const wordCount3 = useMemo(() => countFrenchWords(resp3), [resp3])
  const activeWordCount = activeTask === 1 ? wordCount1 : activeTask === 2 ? wordCount2 : wordCount3

  const totalScore = useMemo(() => calculateEeTotalScore(scores), [scores])
  const estimatedNclc = useMemo(() => estimateTcfEeNclc(totalScore), [totalScore])
  const targetGap = useMemo(() => Math.max(0, 10 - totalScore), [totalScore])

  // Check for existing draft on mount
  useEffect(() => {
    let mounted = true
    void (async () => {
      const draft = await loadTcfEeDraft()
      if (mounted && draft && (draft.task1Response || draft.task2Response || draft.task3Response)) {
        setSavedDraft(draft)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (mode !== 'writing') return
    const timer = window.setInterval(() => {
      setRemainingSeconds((old) => Math.max(0, old - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [mode])

  // Auto-submit when time expires
  useEffect(() => {
    if (mode === 'writing' && remainingSeconds === 0 && !submitting) {
      void enterAssessment()
    }
  }, [mode, remainingSeconds, submitting])

  // Keep latest state in ref to avoid resetting auto-save interval when remainingSeconds ticks
  const stateRef = useRef({
    responses,
    remainingSeconds,
    activeTask,
    draftId,
    prompt1,
    prompt2,
    prompt3,
    startedAt,
  })
  useEffect(() => {
    stateRef.current = {
      responses,
      remainingSeconds,
      activeTask,
      draftId,
      prompt1,
      prompt2,
      prompt3,
      startedAt,
    }
  })

  // Auto-save draft every 2.5 seconds if responses changed
  const lastSavedRef = useRef<string>('')
  useEffect(() => {
    if (mode !== 'writing') return
    const timer = window.setInterval(() => {
      const cur = stateRef.current
      if (!cur.startedAt) return
      const currentSerialized = JSON.stringify({
        r1: cur.responses[1],
        r2: cur.responses[2],
        r3: cur.responses[3],
        task: cur.activeTask,
      })
      if (currentSerialized === lastSavedRef.current) return

      lastSavedRef.current = currentSerialized
      setSaveStatus('正在自动保存...')
      const draftPayload: TcfEeDraft = {
        draftId: cur.draftId,
        task1Id: cur.prompt1.id,
        task1Response: cur.responses[1],
        task2Id: cur.prompt2.id,
        task2Response: cur.responses[2],
        task3Id: cur.prompt3.id,
        task3Response: cur.responses[3],
        remainingSeconds: cur.remainingSeconds,
        currentTask: cur.activeTask,
        startedAt: cur.startedAt,
        updatedAt: Date.now(),
      }
      void saveTcfEeDraft(draftPayload).then(() => {
        setSaveStatus(`草稿已自动保存 (${new Date().toLocaleTimeString('zh-CN', { hour12: false })})`)
      })
    }, 2500)

    return () => window.clearInterval(timer)
  }, [mode])

  const startNewExam = () => {
    setMode('writing')
    setActiveTask(1)
    setResponses({ 1: '', 2: '', 3: '' })
    setRemainingSeconds(TOTAL_SECONDS)
    const now = Date.now()
    setStartedAt(now)
    setDraftId(`ee-draft-${now}`)
    setResult(null)
    setMessage('')
    setSaveStatus('')
  }

  const resumeDraft = (draft: TcfEeDraft) => {
    // Locate tasks in dataset
    const t1Idx = TCF_WRITING_PROMPTS_BY_TASK[1].findIndex((p) => p.id === draft.task1Id)
    const t2Idx = TCF_WRITING_PROMPTS_BY_TASK[2].findIndex((p) => p.id === draft.task2Id)
    const t3Idx = TCF_WRITING_PROMPTS_BY_TASK[3].findIndex((p) => p.id === draft.task3Id)
    if (t1Idx >= 0) setTask1Index(t1Idx)
    if (t2Idx >= 0) setTask2Index(t2Idx)
    if (t3Idx >= 0) setTask3Index(t3Idx)

    setDraftId(draft.draftId)
    setResponses({
      1: draft.task1Response ?? '',
      2: draft.task2Response ?? '',
      3: draft.task3Response ?? '',
    })
    setRemainingSeconds(Math.max(60, draft.remainingSeconds ?? TOTAL_SECONDS))
    setStartedAt(draft.startedAt ?? Date.now())
    setActiveTask((draft.currentTask as 1 | 2 | 3) || 1)
    setMode('writing')
    setSavedDraft(null)
    setSaveStatus('已恢复草稿')
  }

  const shufflePrompts = () => {
    setTask1Index(Math.floor(Math.random() * TCF_WRITING_PROMPTS_BY_TASK[1].length))
    setTask2Index(Math.floor(Math.random() * TCF_WRITING_PROMPTS_BY_TASK[2].length))
    setTask3Index(Math.floor(Math.random() * TCF_WRITING_PROMPTS_BY_TASK[3].length))
  }

  const enterAssessment = () => {
    setMode('assessment')
    setSaveStatus('')
  }

  const submitFinalAssessment = async () => {
    if (submitting) return
    setSubmitting(true)
    const finishedAt = Date.now()
    const durationSeconds = Math.max(0, Math.min(TOTAL_SECONDS, Math.round((finishedAt - (startedAt ?? finishedAt)) / 1000)))

    const attemptPayload: TcfEeAttempt = {
      id: `ee-attempt-${finishedAt}`,
      skill: 'writing',
      task1Id: prompt1.id,
      task1Response: responses[1],
      task2Id: prompt2.id,
      task2Response: responses[2],
      task3Id: prompt3.id,
      task3Response: responses[3],
      wordCounts: {
        task1: wordCount1,
        task2: wordCount2,
        task3: wordCount3,
      },
      scores,
      totalScore,
      scaledScore: totalScore,
      score: totalScore,
      nclc: estimatedNclc,
      durationSeconds,
      startedAt: startedAt ?? finishedAt,
      finishedAt,
      day: new Date(finishedAt).toISOString().slice(0, 10),
    }

    try {
      const saved = await submitTcfEeAttempt(attemptPayload)
      setResult(saved)
      setMode('review')
      await deleteTcfEeDraft()
      setSavedDraft(null)

      if (studyDate && studyTask && /^\d{4}-\d{2}-\d{2}$/.test(studyDate) && /^[a-z][a-z0-9-]{0,79}$/.test(studyTask)) {
        addStudyMinutes(studyDate, studyTask, Math.max(1, Math.ceil(durationSeconds / 60)))
      }
      await flushStudyProgress()
      setMessage('写作模考及自评已保存；断网时先留在本机队列，恢复网络后自动同步。')
    } catch {
      setMessage('结果保存失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  const wordCountStatus = (count: number, min: number, max: number) => {
    if (count < min) {
      return {
        status: 'under',
        text: `已写 ${count} 词，还差 ${min - count} 词达下限 (建议 ${min}–${max} 词)`,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200',
      }
    }
    if (count > max) {
      return {
        status: 'over',
        text: `已写 ${count} 词，超出上限 ${count - max} 词 (建议 ${min}–${max} 词)`,
        color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200',
      }
    }
    return {
      status: 'ok',
      text: `已写 ${count} 词，符合要求 (${min}–${max} 词)`,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200',
    }
  }

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className={`mx-auto w-full ${mode !== 'intro' ? 'max-w-7xl' : 'max-w-5xl'}`}>
          {/* Header navigation & status */}
          {mode !== 'writing' ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <NavLink to="/study-plan" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600">
                <IconArrowLeft className="h-4 w-4" />
                返回学习计划
              </NavLink>
            </div>
          ) : (
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
              <div className="flex items-center gap-3">
                <NavLink to="/study-plan" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600">
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  退出
                </NavLink>
                <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                {/* Task switcher tabs */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((taskNum) => {
                    const t = taskNum as 1 | 2 | 3
                    const count = t === 1 ? wordCount1 : t === 2 ? wordCount2 : wordCount3
                    const limits = t === 1 ? '60–120' : t === 2 ? '120–150' : '120–180'
                    const isActive = activeTask === t
                    return (
                      <button
                        key={t}
                        type="button"
                        data-testid={`tcf-writing-task-tab-${t}`}
                        onClick={() => setActiveTask(t)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>Tâche {t} ({limits}词)</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[11px] font-mono ${
                            isActive ? 'bg-indigo-700 text-white' : 'bg-white/80 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {saveStatus && (
                  <span
                    data-testid="tcf-writing-save-status"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"
                  >
                    <IconDeviceFloppy className="h-3.5 w-3.5" />
                    {saveStatus}
                  </span>
                )}
                <div
                  data-testid="tcf-writing-timer"
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-sm font-bold shadow-inner ${
                    remainingSeconds < 300
                      ? 'animate-pulse bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                  }`}
                >
                  <IconClock className="h-4 w-4" />
                  {formatClock(remainingSeconds)}
                </div>
                <button
                  type="button"
                  data-testid="tcf-writing-submit"
                  onClick={enterAssessment}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  交卷自评
                </button>
              </div>
            </div>
          )}

          {/* Banner: Only show in intro mode */}
          {mode === 'intro' && (
            <header className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950/40 dark:to-gray-900 sm:p-8">
              <div className="text-sm font-semibold text-indigo-600">TCF Canada · Expression Écrite</div>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">写作 3 任务完整模拟</h1>
              <p className="mt-3 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">
                60 分钟完成 3 个写作任务。实时统计法语词数，断网与跨设备草稿自动保存；交卷后按 4 维度对照范文与连接词自评换算 NCLC 等级。
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标 NCLC 7
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标 10/20 分
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  总时长 60 分钟
                </span>
              </div>
            </header>
          )}

          {/* Intro mode */}
          {mode === 'intro' && (
            <section className="mt-6 space-y-6">
              {savedDraft && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 dark:border-indigo-800 dark:bg-indigo-950/40">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">发现未完成的写作草稿</h3>
                      <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                        剩余时间约 {Math.round(savedDraft.remainingSeconds / 60)} 分钟 · 更新于{' '}
                        {new Date(savedDraft.updatedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => resumeDraft(savedDraft)}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
                      >
                        继续草稿
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void deleteTcfEeDraft()
                          setSavedDraft(null)
                        }}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        放弃草稿
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-950 dark:text-white">考试任务说明</h2>
                  <button
                    type="button"
                    onClick={shufflePrompts}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <IconRefresh className="h-3.5 w-3.5" />
                    换一组题目
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/40">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 1 · 短消息</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt1.title}</div>
                    <div className="mt-2 text-xs text-gray-500">要求词数：60–120 词</div>
                    <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt1.prompt}</div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/40">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 2 · 记叙/文章</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt2.title}</div>
                    <div className="mt-2 text-xs text-gray-500">要求词数：120–150 词</div>
                    <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt2.prompt}</div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/40">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 3 · 观点议论文</div>
                    <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt3.title}</div>
                    <div className="mt-2 text-xs text-gray-500">要求词数：120–180 词</div>
                    <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt3.prompt}</div>
                  </div>
                </div>

                <ul className="mt-6 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  <li>• 总倒计时 60 分钟，所有任务共用时间，时间到自动提交。</li>
                  <li>
                    • 实时法语字数统计：严格遵循法语规范，撇号分隔计词（如 <em>l&apos;école</em> 计 2 词）。
                  </li>
                  <li>• 每隔几秒自动保存至浏览器及后端，即使意外刷新或换设备也可无缝续写。</li>
                  <li>• 完成作答后进入 4 维度自评，对照参考范文与连接词评估水平，换算 NCLC 估分。</li>
                </ul>

                <button
                  type="button"
                  data-testid="tcf-writing-start"
                  onClick={startNewExam}
                  className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  开始 60 分钟写作模考
                </button>
              </div>
            </section>
          )}

          {/* Writing mode: Realistic Two-Column Split Layout */}
          {mode === 'writing' && (
            <section className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Task Prompt & Materials (5 cols on lg) */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                      Tâche {activeTask} · {activePrompt.category}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      建议词数：{activePrompt.minWords}–{activePrompt.maxWords} 词
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-gray-950 dark:text-white leading-snug">
                    {activePrompt.title}
                  </h2>

                  <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {activePrompt.prompt}
                  </div>

                  {/* Task 3 Documents */}
                  {activeTask === 3 && (activePrompt.docA || activePrompt.docB) && (
                    <div className="mt-4 space-y-3">
                      {activePrompt.docA && (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs leading-relaxed text-gray-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-gray-200">
                          <div className="mb-1 font-bold text-indigo-700 dark:text-indigo-300">Document A</div>
                          {activePrompt.docA}
                        </div>
                      )}
                      {activePrompt.docB && (
                        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 text-xs leading-relaxed text-gray-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-gray-200">
                          <div className="mb-1 font-bold text-purple-700 dark:text-purple-300">Document B</div>
                          {activePrompt.docB}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-900/50">
                    💡 <strong>要求提示</strong>：请使用清晰的段落结构与准确的法语语法。字数不足或超出均会受到考官扣分。
                  </div>
                </div>
              </div>

              {/* Right Column: Editor Workspace (7 cols on lg) */}
              <div className="flex flex-col space-y-3 lg:col-span-7">
                <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <label htmlFor="writing-textarea" className="text-sm font-bold text-gray-900 dark:text-white">
                      作答区域 (Réponse de la tâche {activeTask})
                    </label>
                    {(() => {
                      const status = wordCountStatus(activeWordCount, activePrompt.minWords, activePrompt.maxWords)
                      return (
                        <div
                          data-testid="tcf-writing-word-count"
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}
                        >
                          {status.text}
                        </div>
                      )
                    })()}
                  </div>

                  <textarea
                    id="writing-textarea"
                    data-testid="tcf-writing-editor"
                    rows={16}
                    value={activeText}
                    onChange={(e) => {
                      const val = e.target.value
                      setResponses((old) => ({ ...old, [activeTask]: val }))
                    }}
                    placeholder="Rédigez votre réponse en français ici..."
                    className="mt-3 min-h-[460px] w-full flex-1 resize-y rounded-xl border border-gray-200 p-4 font-sans text-base leading-relaxed text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={activeTask === 1}
                        onClick={() => setActiveTask((old) => (old === 3 ? 2 : 1))}
                        className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
                      >
                        ← 上一题
                      </button>
                      <button
                        type="button"
                        disabled={activeTask === 3}
                        onClick={() => setActiveTask((old) => (old === 1 ? 2 : 3))}
                        className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
                      >
                        下一题 →
                      </button>
                    </div>

                    <div className="text-xs text-gray-400">
                      自动实时保存 · 支持随时切换题目
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Assessment mode */}
          {(mode === 'assessment' || mode === 'review') && (
            <section className="mt-6 space-y-6">
              {/* Estimated NCLC card */}
              <div
                data-testid="tcf-writing-result"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-xs text-gray-400">各任务词数</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      T1: {wordCount1} | T2: {wordCount2} | T3: {wordCount3}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">自评总分</div>
                    <div className="mt-1 text-2xl font-bold text-indigo-600">{totalScore} / 20</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">估算等级</div>
                    <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{nclcLabel(estimatedNclc)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">距 NCLC 7 目标 (10/20)</div>
                    <div className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">
                      {targetGap === 0 ? '已达到' : `还差 ${targetGap} 分`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <span className="font-semibold">⚠️ 训练估分，非官方评分：</span>
                  本评估依据 4 维度对照标准估算，仅供备考冲刺与阶段性自查，正式成绩以官方评分单为准。
                </div>
              </div>

              {/* Rubric evaluation form */}
              <div
                data-testid="tcf-writing-assessment"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">{mode === 'review' ? '自评打分结果' : '四维度自评清单'}</h2>
                <p className="mt-1 text-xs text-gray-500">根据您在 3 个任务中的综合表现，为每个维度进行打分（0–5 分）：</p>

                <div className="mt-6 space-y-6">
                  {/* Task completion */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">1. 任务完成度 (Task Completion)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.taskCompletion} / 5 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      所有任务是否扣题、回答了全部引导要点，字数是否落在建议区间内，语气格式是否符合情境。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, taskCompletion: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.taskCompletion === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coherence */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">2. 连贯与组织 (Coherence & Organisation)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.coherence} / 5 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      文章结构是否分明（引言、正文论据、结论），段落过渡是否自然，连接词使用是否合理多样。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, coherence: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.coherence === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">3. 词汇多样性与准确性 (Lexique & Vocabulaire)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.vocabulary} / 5 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      用词是否准确地道，是否能使用与话题切合的较高级词汇与固定搭配，避免简单词汇过度重复。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, vocabulary: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.vocabulary === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grammar */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">4. 语法与句式结构 (Morphosyntaxe & Grammaire)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.grammar} / 5 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      句式是否有长短句结合与复合句，时态配合（复合过去时/未完成过去时/条件式/虚拟式）、性数配合是否准确。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, grammar: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.grammar === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {mode === 'assessment' && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitFinalAssessment()}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <IconCheck className="h-4 w-4" />
                    {submitting ? '正在保存成绩...' : '提交自评并保存模考记录'}
                  </button>
                )}
              </div>

              {/* Reference essays and connectors for all 3 tasks */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-950 dark:text-white">三任务参考范文与常用连接词</h3>

                {[
                  { taskIndex: 1, prompt: prompt1, response: responses[1], count: wordCount1 },
                  { taskIndex: 2, prompt: prompt2, response: responses[2], count: wordCount2 },
                  { taskIndex: 3, prompt: prompt3, response: responses[3], count: wordCount3 },
                ].map(({ taskIndex, prompt, response, count }) => (
                  <div
                    key={prompt.id}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                          Tâche {taskIndex} · {prompt.category}
                        </span>
                        <h4 className="font-bold text-gray-900 dark:text-white">{prompt.title}</h4>
                      </div>
                      <div className="text-xs text-gray-500">
                        作答词数：{count} 词 / 建议 {prompt.minWords}–{prompt.maxWords} 词
                      </div>
                    </div>

                    {/* Comparison grid: User response vs Reference sample answer */}
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                          <span>您的提交作答：</span>
                          <span>{count} 词</span>
                        </div>
                        <div className="mt-1.5 h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          {response.trim() || '（未输入作答内容）'}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <span>官方高分参考范文：</span>
                          <span>建议 {prompt.minWords}–{prompt.maxWords} 词</span>
                        </div>
                        <div className="mt-1.5 h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm leading-relaxed text-gray-800 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-gray-200">
                          {prompt.sampleAnswer}
                        </div>
                      </div>
                    </div>

                    {/* Connectors & phrases */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                        <div className="text-xs font-medium text-gray-500">推荐连接词：</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {prompt.connectors.map((c) => (
                            <span
                              key={c}
                              className="rounded-md bg-white px-2 py-0.5 text-xs text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                        <div className="text-xs font-medium text-gray-500">经典实用表达：</div>
                        <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                          {prompt.usefulPhrases.map((p) => (
                            <li key={p}>• {p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {message && (
            <div className="mt-5 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{message}</div>
          )}
        </div>
      </div>
    </Layout>
  )
}
