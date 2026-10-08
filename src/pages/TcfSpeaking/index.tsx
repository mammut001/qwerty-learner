import LookupText from '@/components/Dictionary/LookupText'
import EchelleGoalCard from '@/components/EchelleGoalCard'
import Layout from '@/components/Layout'
import { useHideShellHeader } from '@/components/ShellHeader'
import { type TcfEoScores, calculateEoTotalScore, estimateTcfEoNclc } from '@/resources/tcfEvaluation'
import {
  TCF_SPEAKING_PROMPTS_BY_TASK,
  type TcfSpeakingTask1Prompt,
  type TcfSpeakingTask2Prompt,
  type TcfSpeakingTask3Prompt,
} from '@/resources/tcfSpeakingData'
import { type TcfEoAttempt, addStudyMinutes, flushStudyProgress, saveTcfEoAttempt } from '@/services/studyPlanSync'
import { deleteAudioRecording, saveAudioRecording } from '@/services/tcfAudioStorage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconCheck from '~icons/tabler/check'
import IconClock from '~icons/tabler/clock'
import IconMicrophone from '~icons/tabler/microphone'
import IconPlayerStop from '~icons/tabler/player-stop'
import IconRefresh from '~icons/tabler/refresh'
import IconTrash from '~icons/tabler/trash'

type ExamMode = 'intro' | 'speaking' | 'assessment' | 'review'
type TaskPhase = 'idle' | 'prep' | 'recording' | 'finished'

const formatClock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const nclcLabel = (value: number) => (value >= 4 ? `NCLC ${value}` : 'NCLC < 4')

export default function TcfSpeakingPage() {
  const [searchParams] = useSearchParams()
  const studyDate = searchParams.get('studyDate')
  const studyTask = searchParams.get('studyTask')

  // Selected prompts for Task 1, 2, 3
  const [task1Index, setTask1Index] = useState(0)
  const [task2Index, setTask2Index] = useState(0)
  const [task3Index, setTask3Index] = useState(0)

  const prompt1 = (TCF_SPEAKING_PROMPTS_BY_TASK[1][task1Index] ?? TCF_SPEAKING_PROMPTS_BY_TASK[1][0]) as TcfSpeakingTask1Prompt
  const prompt2 = (TCF_SPEAKING_PROMPTS_BY_TASK[2][task2Index] ?? TCF_SPEAKING_PROMPTS_BY_TASK[2][0]) as TcfSpeakingTask2Prompt
  const prompt3 = (TCF_SPEAKING_PROMPTS_BY_TASK[3][task3Index] ?? TCF_SPEAKING_PROMPTS_BY_TASK[3][0]) as TcfSpeakingTask3Prompt

  const [mode, setMode] = useState<ExamMode>('intro')
  useHideShellHeader(mode === 'speaking')
  const [activeTask, setActiveTask] = useState<1 | 2 | 3>(1)
  const [attemptId, setAttemptId] = useState<string>(() => `eo-attempt-${Date.now()}`)
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  // Per task phase & timer
  const [taskPhases, setTaskPhases] = useState<Record<1 | 2 | 3, TaskPhase>>({
    1: 'idle',
    2: 'idle',
    3: 'idle',
  })
  const [taskRemaining, setTaskRemaining] = useState<Record<1 | 2 | 3, number>>({
    1: prompt1.durationSeconds,
    2: prompt2.prepSeconds,
    3: prompt3.durationSeconds,
  })
  const [taskDurations, setTaskDurations] = useState<Record<1 | 2 | 3, number>>({
    1: 0,
    2: 0,
    3: 0,
  })

  // Audio object URLs for playback from IndexedDB
  const [audioUrls, setAudioUrls] = useState<Record<1 | 2 | 3, string | null>>({
    1: null,
    2: null,
    3: null,
  })

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingStartRef = useRef<number>(0)

  // Self assessment state
  const [scores, setScores] = useState<TcfEoScores>({
    fluency: 2,
    pronunciation: 2,
    vocabulary: 2,
    grammar: 2,
    taskCompletion: 2,
  })
  const [, setResult] = useState<TcfEoAttempt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const totalScore = useMemo(() => calculateEoTotalScore(scores), [scores])
  const estimatedNclc = useMemo(() => estimateTcfEoNclc(totalScore), [totalScore])
  const targetGap = useMemo(() => Math.max(0, 10 - totalScore), [totalScore])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(audioUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [audioUrls, mediaStream])

  // Timer tick for active task
  useEffect(() => {
    if (mode !== 'speaking') return
    const phase = taskPhases[activeTask]
    if (phase !== 'prep' && phase !== 'recording') return

    const timer = window.setInterval(() => {
      setTaskRemaining((old) => {
        const next = Math.max(0, (old[activeTask] ?? 0) - 1)
        if (next === 0) {
          // Time expired for this phase
          if (activeTask === 2 && phase === 'prep') {
            // Task 2 prep finished -> switch to recording phase
            setTimeout(() => void startTaskRecording(2), 50)
          } else {
            // Recording finished -> stop
            setTimeout(() => void stopTaskRecording(activeTask), 50)
          }
        }
        return { ...old, [activeTask]: next }
      })
    }, 1000)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeTask, taskPhases])

  const requestMicrophone = async (): Promise<MediaStream | null> => {
    if (mediaStream) return mediaStream
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicAvailable(false)
      return null
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMediaStream(stream)
      setMicAvailable(true)
      return stream
    } catch {
      setMicAvailable(false)
      return null
    }
  }

  const shufflePrompts = () => {
    setTask1Index(Math.floor(Math.random() * TCF_SPEAKING_PROMPTS_BY_TASK[1].length))
    setTask2Index(Math.floor(Math.random() * TCF_SPEAKING_PROMPTS_BY_TASK[2].length))
    setTask3Index(Math.floor(Math.random() * TCF_SPEAKING_PROMPTS_BY_TASK[3].length))
  }

  const startExam = async () => {
    const id = `eo-attempt-${Date.now()}`
    setAttemptId(id)
    setMode('speaking')
    setActiveTask(1)
    setTaskPhases({ 1: 'idle', 2: 'idle', 3: 'idle' })
    setTaskRemaining({
      1: prompt1.durationSeconds,
      2: prompt2.prepSeconds,
      3: prompt3.durationSeconds,
    })
    setTaskDurations({ 1: 0, 2: 0, 3: 0 })
    setResult(null)
    setMessage('')

    // Try to get mic permission, but don't block if denied
    await requestMicrophone()
  }

  const startTaskPrep = (task: 1 | 2 | 3) => {
    setTaskPhases((old) => ({ ...old, [task]: 'prep' }))
    if (task === 2) {
      setTaskRemaining((old) => ({ ...old, 2: prompt2.prepSeconds }))
    }
  }

  const startTaskRecording = async (task: 1 | 2 | 3) => {
    const stream = mediaStream ?? (await requestMicrophone())
    setTaskPhases((old) => ({ ...old, [task]: 'recording' }))
    const durationLimit = task === 1 ? prompt1.durationSeconds : task === 2 ? prompt2.durationSeconds : prompt3.durationSeconds
    setTaskRemaining((old) => ({ ...old, [task]: durationLimit }))
    recordingStartRef.current = Date.now()

    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        const recorder = new MediaRecorder(stream)
        recordedChunksRef.current = []
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        recorder.onstop = () => {
          const duration = Math.round((Date.now() - recordingStartRef.current) / 1000)
          setTaskDurations((old) => ({ ...old, [task]: duration }))
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            const recKey = `${attemptId}-t${task}`
            void saveAudioRecording(recKey, blob, recorder.mimeType || 'audio/webm', duration)
            const url = URL.createObjectURL(blob)
            setAudioUrls((old) => {
              const prevUrl = old[task]
              if (prevUrl) URL.revokeObjectURL(prevUrl)
              return { ...old, [task]: url }
            })
          }
        }
        mediaRecorderRef.current = recorder
        recorder.start(500)
      } catch {
        // Fallback to timer-only mode if MediaRecorder fails
      }
    }
  }

  const stopTaskRecording = (task: 1 | 2 | 3) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      const duration = Math.round((Date.now() - recordingStartRef.current) / 1000)
      setTaskDurations((old) => ({ ...old, [task]: duration }))
    }
    setTaskPhases((old) => ({ ...old, [task]: 'finished' }))
  }

  const resetTask = async (task: 1 | 2 | 3) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    const recKey = `${attemptId}-t${task}`
    await deleteAudioRecording(recKey)
    setAudioUrls((old) => {
      const prevUrl = old[task]
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return { ...old, [task]: null }
    })
    setTaskPhases((old) => ({ ...old, [task]: 'idle' }))
    setTaskRemaining((old) => ({
      ...old,
      [task]: task === 1 ? prompt1.durationSeconds : task === 2 ? prompt2.prepSeconds : prompt3.durationSeconds,
    }))
    setTaskDurations((old) => ({ ...old, [task]: 0 }))
  }

  const enterAssessment = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setMode('assessment')
  }

  const submitFinalAssessment = async () => {
    if (submitting) return
    setSubmitting(true)
    const finishedAt = Date.now()

    const attemptPayload: TcfEoAttempt = {
      id: attemptId,
      skill: 'speaking',
      task1Id: prompt1.id,
      task1Duration: taskDurations[1],
      task2Id: prompt2.id,
      task2Duration: taskDurations[2],
      task3Id: prompt3.id,
      task3Duration: taskDurations[3],
      recordingsMeta: {
        task1: { recorded: Boolean(audioUrls[1]), duration: taskDurations[1] },
        task2: { recorded: Boolean(audioUrls[2]), duration: taskDurations[2] },
        task3: { recorded: Boolean(audioUrls[3]), duration: taskDurations[3] },
      },
      scores,
      totalScore,
      scaledScore: totalScore,
      score: totalScore,
      nclc: estimatedNclc,
      durationSeconds: taskDurations[1] + taskDurations[2] + taskDurations[3],
      startedAt: finishedAt - (taskDurations[1] + taskDurations[2] + taskDurations[3]) * 1000,
      finishedAt,
      day: new Date(finishedAt).toISOString().slice(0, 10),
    }

    try {
      const saved = await saveTcfEoAttempt(attemptPayload)
      setResult(saved)
      setMode('review')

      const totalMinutes = Math.max(1, Math.ceil((taskDurations[1] + taskDurations[2] + taskDurations[3]) / 60))
      if (studyDate && studyTask && /^\d{4}-\d{2}-\d{2}$/.test(studyDate) && /^[a-z][a-z0-9-]{0,79}$/.test(studyTask)) {
        addStudyMinutes(studyDate, studyTask, totalMinutes)
      }
      await flushStudyProgress()
      setMessage('口语模考记录已成功保存；音频保存在本机 IndexedDB 中。')
    } catch {
      setMessage('保存失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className={`mx-auto w-full ${mode !== 'intro' ? 'max-w-7xl' : 'max-w-5xl'}`}>
          {/* Header navigation & status */}
          {mode === 'speaking' && (
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
              <div className="flex items-center gap-3">
                <NavLink
                  to="/study-plan"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-500 hover:text-indigo-600"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  退出
                </NavLink>
                <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                {/* Task switcher tabs */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((taskNum) => {
                    const t = taskNum as 1 | 2 | 3
                    const hasAudio = Boolean(audioUrls[t])
                    const isActive = activeTask === t
                    const detail = t === 1 ? '面试2分' : t === 2 ? '互动5.5分' : '论证4.5分'
                    return (
                      <button
                        key={t}
                        type="button"
                        data-testid={`tcf-speaking-task-tab-${t}`}
                        onClick={() => setActiveTask(t)}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-1.5 text-xs font-semibold transition sm:gap-2 sm:px-3 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>
                          Tâche {t}
                          <span className="hidden sm:inline"> ({detail})</span>
                        </span>
                        {hasAudio && <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-gray-900" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    micAvailable
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : micAvailable === false
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <IconMicrophone className="h-3.5 w-3.5" />
                  {micAvailable ? '麦克风录音已就绪' : '计时模式'}
                </span>

                <div
                  data-testid="tcf-speaking-timer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-1.5 font-mono text-sm font-bold text-gray-800 shadow-inner dark:bg-gray-900 dark:text-gray-100"
                >
                  <IconClock className="h-4 w-4" />
                  {formatClock(taskRemaining[activeTask])}
                </div>

                <button
                  type="button"
                  data-testid="tcf-speaking-finish"
                  onClick={enterAssessment}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  完成作答，进入自评
                </button>
              </div>
            </div>
          )}

          {/* Banner: Only show in intro mode */}
          {mode === 'intro' && (
            <header className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950/40 dark:to-gray-900 sm:p-8">
              <div className="text-sm font-semibold text-indigo-600">TCF Canada · Expression Orale</div>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">口语 3 任务完整模拟</h1>
              <p className="mt-3 max-w-3xl leading-7 text-gray-600 dark:text-gray-300">
                约 12 分钟完成 3 个口语任务。支持准备计时、作答计时与浏览器录音回放；作答后通过 5 维度自评换算 NCLC 等级。
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标 NCLC 7
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  目标 10/20 分
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  总时长约 12 分钟
                </span>
              </div>
            </header>
          )}

          {/* Intro mode */}
          {mode === 'intro' && (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 1 · 面试与问答</div>
                  <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt1.title}</div>
                  <div className="mt-2 text-xs text-gray-500">时长约 2 分钟 (无准备时间)</div>
                  <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt1.intro}</div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 2 · 提问互动</div>
                  <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt2.title}</div>
                  <div className="mt-2 text-xs text-gray-500">2 分钟准备 + 约 3.5 分钟作答</div>
                  <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt2.instructions}</div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 3 · 观点论证</div>
                  <div className="mt-1 font-medium text-gray-900 dark:text-white">{prompt3.title}</div>
                  <div className="mt-2 text-xs text-gray-500">约 4.5 分钟自由阐述</div>
                  <div className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-gray-400">{prompt3.prompt}</div>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                <li>• 浏览器录音：点击开始后请求麦克风授权。若拒绝授权，系统会自动切换为纯计时模拟模式。</li>
                <li>• 录音数据完全保存在本机 IndexedDB 中，服务端仅保留时长与自评元数据，绝不上报大段音频。</li>
                <li>• 每个任务录制完成后均可随时回放录音，不满意可一键删除重新录制。</li>
                <li>• 全部任务完成后，依据 5 维度（流利度、发音、词汇、语法、任务完成度）对照标准自评。</li>
              </ul>

              <button
                type="button"
                data-testid="tcf-speaking-start"
                onClick={() => void startExam()}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                开始口语模考
              </button>
            </section>
          )}

          {/* Speaking mode: Realistic Split View */}
          {mode === 'speaking' && (
            <section className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Task Materials (7 cols on lg) */}
              <div className="space-y-4 lg:col-span-7">
                {activeTask === 1 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        Tâche 1 · Entretien dirigé
                      </span>
                      <span className="text-xs text-gray-500">约 2 分钟 · 无准备时间</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-gray-950 dark:text-white">{prompt1.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{prompt1.intro}</p>

                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                      <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        考官可能提出的问题 (Questions de l&apos;examinateur)：
                      </div>
                      <ul className="mt-2.5 space-y-2 text-sm text-gray-800 dark:text-gray-200">
                        {prompt1.questions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-900/50">
                      💡 <strong>应试策略</strong>：自然从容，详细介绍个人背景、经历与日常生活，避免单字回答，尽量使用复合句扩展。
                    </div>
                  </div>
                )}

                {activeTask === 2 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        Tâche 2 · Exercice en interaction
                      </span>
                      <span className="text-xs text-gray-500">2 分钟准备 + 约 3.5 分钟作答</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-gray-950 dark:text-white">{prompt2.title}</h2>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs leading-relaxed text-gray-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-gray-200">
                        <strong className="text-indigo-700 dark:text-indigo-300">情境描述：</strong>
                        <div className="mt-1">{prompt2.scenario}</div>
                      </div>
                      <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 text-xs leading-relaxed text-gray-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-gray-200">
                        <strong className="text-purple-700 dark:text-purple-300">角色扮演：</strong>
                        <div className="mt-1">
                          考官为【{prompt2.examinerRole}】，您为【{prompt2.examineeRole}】。
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{prompt2.instructions}</div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-900/50">
                      💡 <strong>互动提示</strong>：主动向考官提问获取详细信息，使用多种疑问句型（Est-ce que... / Pourriez-vous me dire
                      si... / Quels sont...）。
                    </div>
                  </div>
                )}

                {activeTask === 3 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        Tâche 3 · Expression d&apos;un point de vue
                      </span>
                      <span className="text-xs text-gray-500">约 4.5 分钟自由阐述 · 无准备时间</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-gray-950 dark:text-white">{prompt3.title}</h2>
                    <div className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">辩论主题：{prompt3.topic}</div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{prompt3.prompt}</p>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-900/50">
                      💡 <strong>结构提示</strong>：遵循「引入话题 → 阐述正反观点 → 表达个人明确立场 →
                      总结」的标准论辩框架，运用连接词展开论据。
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Recording Console (5 cols on lg) */}
              <div className="flex flex-col space-y-4 lg:col-span-5">
                <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">考场录音工作台</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        taskPhases[activeTask] === 'recording'
                          ? 'animate-pulse bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : taskPhases[activeTask] === 'prep'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : taskPhases[activeTask] === 'finished'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {taskPhases[activeTask] === 'recording'
                        ? '● 正在作答录音中'
                        : taskPhases[activeTask] === 'prep'
                        ? '⏳ 准备时间'
                        : taskPhases[activeTask] === 'finished'
                        ? '✓ 作答完成'
                        : '○ 等待作答'}
                    </span>
                  </div>

                  {/* Big countdown clock */}
                  <div className="my-6 flex flex-col items-center justify-center rounded-2xl bg-gray-50/80 p-6 dark:bg-gray-900/60">
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {taskPhases[activeTask] === 'prep' ? '准备剩余时间' : '作答剩余时间'}
                    </div>
                    <div className="mt-2 font-mono text-4xl font-extrabold text-gray-900 dark:text-white">
                      {formatClock(taskRemaining[activeTask])}
                    </div>
                    {taskPhases[activeTask] === 'recording' && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                        <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                        麦克风正在录音中，请清晰作答
                      </div>
                    )}
                  </div>

                  {/* Actions area */}
                  <div className="space-y-3">
                    {/* Task 1 controls */}
                    {activeTask === 1 && (
                      <div>
                        {taskPhases[1] === 'idle' && (
                          <button
                            type="button"
                            data-testid="tcf-speaking-record-btn"
                            onClick={() => void startTaskRecording(1)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            <IconMicrophone className="h-4 w-4" />
                            开始作答录音
                          </button>
                        )}
                        {taskPhases[1] === 'recording' && (
                          <button
                            type="button"
                            data-testid="tcf-speaking-stop-btn"
                            onClick={() => stopTaskRecording(1)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white shadow-sm hover:bg-red-700"
                          >
                            <IconPlayerStop className="h-4 w-4" />
                            停止作答
                          </button>
                        )}
                      </div>
                    )}

                    {/* Task 2 controls */}
                    {activeTask === 2 && (
                      <div>
                        {taskPhases[2] === 'idle' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => startTaskPrep(2)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              <IconClock className="h-4 w-4" />
                              开始 2 分钟准备
                            </button>
                            <button
                              type="button"
                              onClick={() => void startTaskRecording(2)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-600 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                            >
                              跳过准备，直接作答
                            </button>
                          </div>
                        )}
                        {taskPhases[2] === 'prep' && (
                          <button
                            type="button"
                            onClick={() => void startTaskRecording(2)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            <IconMicrophone className="h-4 w-4" />
                            准备完毕，开始作答录音
                          </button>
                        )}
                        {taskPhases[2] === 'recording' && (
                          <button
                            type="button"
                            onClick={() => stopTaskRecording(2)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white shadow-sm hover:bg-red-700"
                          >
                            <IconPlayerStop className="h-4 w-4" />
                            停止作答
                          </button>
                        )}
                      </div>
                    )}

                    {/* Task 3 controls */}
                    {activeTask === 3 && (
                      <div>
                        {taskPhases[3] === 'idle' && (
                          <button
                            type="button"
                            onClick={() => void startTaskRecording(3)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            <IconMicrophone className="h-4 w-4" />
                            开始作答录音
                          </button>
                        )}
                        {taskPhases[3] === 'recording' && (
                          <button
                            type="button"
                            onClick={() => stopTaskRecording(3)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white shadow-sm hover:bg-red-700"
                          >
                            <IconPlayerStop className="h-4 w-4" />
                            停止作答
                          </button>
                        )}
                      </div>
                    )}

                    {/* Finished recording display */}
                    {taskPhases[activeTask] === 'finished' && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            录音已就绪 (用时 {taskDurations[activeTask]} 秒)
                          </span>
                          <button
                            type="button"
                            onClick={() => void resetTask(activeTask)}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                            重新录制
                          </button>
                        </div>
                        {audioUrls[activeTask] && (
                          <div className="mt-3">
                            <audio
                              data-testid={`tcf-audio-player-${activeTask}`}
                              controls
                              src={audioUrls[activeTask] ?? undefined}
                              className="h-10 w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
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

                    <div className="text-xs text-gray-400">纯本地录音 · 不占云端</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Assessment & Review mode */}
          {(mode === 'assessment' || mode === 'review') && (
            <section className="mt-6 space-y-6">
              {/* Score card */}
              <div
                data-testid="tcf-speaking-result"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-xs text-gray-400">总录音时长</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {taskDurations[1] + taskDurations[2] + taskDurations[3]} 秒 (约{' '}
                      {Math.ceil((taskDurations[1] + taskDurations[2] + taskDurations[3]) / 60)} 分钟)
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
                  本评估依据 5 维度对照标准估算，仅供备考冲刺与阶段性自查，正式成绩以官方评分单为准。
                </div>
              </div>

              <EchelleGoalCard skill="speaking" currentLevel={estimatedNclc} />

              {/* Rubric evaluation form */}
              <div
                data-testid="tcf-speaking-assessment"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">{mode === 'review' ? '自评打分结果' : '五维度自评清单'}</h2>
                <p className="mt-1 text-xs text-gray-500">根据您在 3 个任务中的综合口语表现，为每个维度进行打分（0–4 分）：</p>

                <div className="mt-6 space-y-6">
                  {/* Fluency */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">1. 流利度与连贯性 (Fluidité & Continuité)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.fluency} / 4 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">语流是否自然顺畅，有无长时间停顿或卡壳，话语组织是否自然连贯。</p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, fluency: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.fluency === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pronunciation */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">2. 语音语调与发音 (Prononciation & Intonation)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.pronunciation} / 4 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      元音鼻化音准确度，连读（liaison）与联诵（enchaînement），升降调与重音节奏。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={mode === 'review'}
                          onClick={() => setScores((old) => ({ ...old, pronunciation: val }))}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            scores.pronunciation === val
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
                      <div className="font-medium text-gray-900 dark:text-white">3. 词汇丰富度与贴切性 (Lexique & Vocabulaire)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.vocabulary} / 4 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">话题词汇覆盖度，选词是否恰当、多变，是否能自如使用常用短语与习语表达。</p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4].map((val) => (
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
                      <div className="font-medium text-gray-900 dark:text-white">4. 语法多样性与准确性 (Grammaire & Morphosyntaxe)</div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.grammar} / 4 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      动词变位、时态配合（复合过去时/未完成过去时/条件式）、代词搭配与复合句掌控。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4].map((val) => (
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

                  {/* Task completion */}
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        5. 任务完成与互动表达 (Réalisation de la tâche & Interaction)
                      </div>
                      <div className="font-mono text-sm font-bold text-indigo-600">{scores.taskCompletion} / 4 分</div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      任务 1 是否全面自我介绍，任务 2 是否提出多样化疑问并形成有效互动，任务 3 论点是否清晰有力。
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[0, 1, 2, 3, 4].map((val) => (
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

              {/* Sample key points & suggested arguments */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-950 dark:text-white">三任务参考要点与论据解析</h3>

                {/* Task 1 sample */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 1 · {prompt1.title}</span>
                    <span className="text-xs text-gray-500">作答用时：{taskDurations[1]} 秒</span>
                  </div>
                  {audioUrls[1] && (
                    <div className="mt-3">
                      <audio controls src={audioUrls[1]} className="h-9 w-full max-w-md" />
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      推荐作答要点 (Points clés recommandés)：
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {prompt1.sampleKeyPoints.map((point, i) => (
                        <li key={i}>
                          • <LookupText text={point} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Task 2 sample */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 2 · {prompt2.title}</span>
                    <span className="text-xs text-gray-500">作答用时：{taskDurations[2]} 秒</span>
                  </div>
                  {audioUrls[2] && (
                    <div className="mt-3">
                      <audio controls src={audioUrls[2]} className="h-9 w-full max-w-md" />
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      推荐提问句式清单 (Questions suggérées pour l&apos;interaction)：
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {prompt2.suggestedQuestions.map((q, i) => (
                        <li key={i}>
                          • <LookupText text={q} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Task 3 sample */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Tâche 3 · {prompt3.title}</span>
                    <span className="text-xs text-gray-500">作答用时：{taskDurations[3]} 秒</span>
                  </div>
                  {audioUrls[3] && (
                    <div className="mt-3">
                      <audio controls src={audioUrls[3]} className="h-9 w-full max-w-md" />
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-900">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">支持观点与论据 (Arguments pour)：</div>
                      <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                        {prompt3.suggestedArgumentsFor.map((arg, i) => (
                          <li key={i}>
                            • <LookupText text={arg} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-900">
                      <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        反面观点与保留 (Arguments contre / réserves)：
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                        {prompt3.suggestedArgumentsAgainst.map((arg, i) => (
                          <li key={i}>
                            • <LookupText text={arg} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-3.5 dark:bg-gray-900">
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">高分阐述逻辑框架 (Plan recommandé)：</div>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-gray-700 dark:text-gray-300">
                      {prompt3.sampleOutline.map((step, i) => (
                        <li key={i}>
                          <LookupText text={step} />
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
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
