import Layout from '@/components/Layout'
import { useHideShellHeader } from '@/components/ShellHeader'
import { TCF_CONFIG, TCF_QUESTIONS, estimateTcfEeNclc, estimateTcfEoNclc, type TcfQcmSkill, type TcfSkill } from '@/resources/tcfMock'
import { calculateEeTotalScore, calculateEoTotalScore, countFrenchWords } from '@/resources/tcfEvaluation'
import { TCF_WRITING_PROMPTS_BY_TASK } from '@/resources/tcfWritingData'
import { TCF_SPEAKING_PROMPTS_BY_TASK, type TcfSpeakingPrompt } from '@/resources/tcfSpeakingData'
import { getAudioRecording, saveAudioRecording } from '@/services/tcfAudioStorage'
import {
  addStudyMinutes, flushStudyProgress, recordTcfAttempt, saveTcfEoAttempt, submitTcfEeAttempt,
  type TcfEeAttempt, type TcfEoAttempt,
} from '@/services/studyPlanSync'
import {
  FULL_MOCK_ORDER, advanceFullMock, createFullMockSession, fullMockQcmResult, fullMockRemaining,
  loadRemoteFullMock, readLocalFullMock, saveRemoteFullMock, storeLocalFullMock, FullMockRequestError,
  readLocalFullMockBase, storeLocalFullMockBase,
  readLocalFullMockClockOffset, storeLocalFullMockClockOffset,
  type FullMockSession,
} from '@/services/tcfFullMock'
import { hasFullMockRating, mergeFullMockSessions } from '@/services/tcfFullMockMerge'
import { correctedFullMockNow } from '@/services/tcfFullMockClock'
import { playListeningQuestionAudio, stopListeningAudio } from '@/services/tcfListeningAudio'
import { trackAnalyticsEvent } from '@/utils/analytics'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

const format = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
const dayKey = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10)
const labels: Record<TcfSkill, string> = { listening: 'CO 听力', reading: 'CE 阅读', writing: 'EE 写作', speaking: 'EO 口语' }
const inputStyle = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white'
const panel = 'rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800'

type RatedSection = 'writing' | 'speaking'

// Only explicitly completed self-assessments enter tcfAttempts/analytics.
// Deterministic ID prevents duplicate grades from multiple devices.
function recordRatedSection(current: FullMockSession, skill: RatedSection, score: number, nclc: number, startedAt: number, finishedAt: number) {
  const duration = Math.max(0, Math.min(TCF_CONFIG[skill].minutes * 60, Math.round((finishedAt - startedAt) / 1000)))
  if (skill === 'writing') {
    const attempt: TcfEeAttempt = {
      id: current.id, skill: 'writing',
      task1Id: current.writing.taskIds[0], task1Response: current.writing.texts[0],
      task2Id: current.writing.taskIds[1], task2Response: current.writing.texts[1],
      task3Id: current.writing.taskIds[2], task3Response: current.writing.texts[2],
      wordCounts: {
        task1: countFrenchWords(current.writing.texts[0]),
        task2: countFrenchWords(current.writing.texts[1]),
        task3: countFrenchWords(current.writing.texts[2]),
      },
      scores: current.writing.scores, totalScore: score, scaledScore: score, score, nclc,
      durationSeconds: duration, startedAt, finishedAt, day: dayKey(finishedAt),
    }
    void submitTcfEeAttempt(attempt)
  } else {
    const attempt: TcfEoAttempt = {
      id: current.id, skill: 'speaking',
      task1Id: current.speaking.taskIds[0], task1Duration: current.speaking.durations[0],
      task2Id: current.speaking.taskIds[1], task2Duration: current.speaking.durations[1],
      task3Id: current.speaking.taskIds[2], task3Duration: current.speaking.durations[2],
      recordingsMeta: {
        task1: { recorded: current.speaking.durations[0] > 0, duration: current.speaking.durations[0] },
        task2: { recorded: current.speaking.durations[1] > 0, duration: current.speaking.durations[1] },
        task3: { recorded: current.speaking.durations[2] > 0, duration: current.speaking.durations[2] },
      },
      scores: current.speaking.scores, totalScore: score, scaledScore: score, score, nclc,
      durationSeconds: duration, startedAt, finishedAt, day: dayKey(finishedAt),
    }
    void saveTcfEoAttempt(attempt)
  }
}

export default function TcfFullMockPage() {
  const [session, setSession] = useState<FullMockSession | null>(null)
  const sessionRef = useRef<FullMockSession | null>(null)
  const revisionRef = useRef(0)
  const baseSessionRef = useRef<FullMockSession | null>(readLocalFullMockBase())
  const [clockOffsetMs, setClockOffsetMs] = useState(readLocalFullMockClockOffset)
  const clockOffsetRef = useRef(clockOffsetMs)
  const syncClock = useCallback((offset: number) => {
    clockOffsetRef.current = offset
    setClockOffsetMs(offset)
    storeLocalFullMockClockOffset(offset)
  }, [])
  const savingRef = useRef(false)
  const lastUploadedRef = useRef('')
  const finishingRef = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [saveMessage, setSaveMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useHideShellHeader(Boolean(session && session.phase !== 'complete'))

  const applySession = useCallback((next: FullMockSession) => {
    sessionRef.current = next
    storeLocalFullMock(next)
    setSession(next)
  }, [])

  const load = useCallback(async () => {
    const local = readLocalFullMock()
    try {
      const remote = await loadRemoteFullMock()
      // Compare against the last *acknowledged* server snapshot persisted on
      // this device, not the last offline edit nor any client timestamp.
      // Read it before replacing it with this GET's authoritative response.
      const acknowledged = readLocalFullMockBase()
      // A successful GET is the authority for the active question cursor.
      // Unlike an answer edit, stale local navigation must not rewind Q2
      // after another device has already saved index 1.
      const merged = mergeFullMockSessions(remote.session, local, acknowledged,
        { preferServerCursor: true })
      revisionRef.current = remote.revision
      baseSessionRef.current = remote.session
      storeLocalFullMockBase(remote.session)
      lastUploadedRef.current = remote.session ? JSON.stringify(remote.session) : ''
      syncClock(remote.clockOffsetMs)
      if (merged) {
        applySession(merged)
      } else {
        setSession(null)
        sessionRef.current = null
      }
      setSaveMessage(remote.session && JSON.stringify(merged) === JSON.stringify(remote.session)
        ? '已连接云端，可在同一账号的其他设备继续' : '正在同步…')
    } catch (error) {
      if (local) applySession(local)
      setSaveMessage(error instanceof FullMockRequestError
        ? `加载失败（HTTP ${error.status}：${error.code}），请检查账号及服务器`
        : '当前离线：答题保存在此设备，联网后将尝试同步')
    } finally {
      setLoaded(true)
    }
  }, [applySession, syncClock])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Serialize writes; on 409 fetch the authoritative revision, merge per
  // question and retry without requiring a refresh. A changed answer during an
  // in-flight save is rebased against the submitted snapshot, not discarded.
  const upload = useCallback(async () => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      let conflicts = 0
      for (;;) {
        const latest = sessionRef.current
        if (!latest) break
        const payload = JSON.stringify(latest)
        if (payload === lastUploadedRef.current) break
        try {
          const saved = await saveRemoteFullMock(latest, revisionRef.current)
          revisionRef.current = saved.revision
          baseSessionRef.current = saved.session
          storeLocalFullMockBase(saved.session)
          lastUploadedRef.current = JSON.stringify(saved.session)
          syncClock(saved.clockOffsetMs)
          const merged = mergeFullMockSessions(saved.session, sessionRef.current, latest)
          if (merged && JSON.stringify(merged) !== JSON.stringify(sessionRef.current)) applySession(merged)
          conflicts = 0
        } catch (error) {
          if (!(error instanceof FullMockRequestError) || error.status !== 409) throw error
          if (++conflicts > 5) throw new Error('FULL_MOCK_RETRY_EXHAUSTED')
          const remote = await loadRemoteFullMock()
          const pending = sessionRef.current
          revisionRef.current = remote.revision
          const merged = mergeFullMockSessions(remote.session, pending,
            baseSessionRef.current ?? readLocalFullMockBase())
          baseSessionRef.current = remote.session
          storeLocalFullMockBase(remote.session)
          lastUploadedRef.current = remote.session ? JSON.stringify(remote.session) : ''
          syncClock(remote.clockOffsetMs)
          if (merged) applySession(merged)
          // Loop retries only the fields not yet acknowledged by the server.
        }
      }
      setSaveMessage('已自动保存到云端')
    } catch (error) {
      if (error instanceof FullMockRequestError) {
        setSaveMessage(`保存失败（HTTP ${error.status}：${error.code}），本机答案已保留`)
      } else if (error instanceof Error && error.message === 'FULL_MOCK_RETRY_EXHAUSTED') {
        setSaveMessage('其他设备仍在修改，请稍后重试；本机答案已保留')
      } else {
        setSaveMessage('网络不可用：已保存本机，联网后将自动重试')
      }
    } finally {
      savingRef.current = false
    }
  }, [applySession, syncClock])

  useEffect(() => {
    if (!loaded || !session || JSON.stringify(session) === lastUploadedRef.current) return
    const timer = window.setTimeout(() => void upload(), 400)
    return () => window.clearTimeout(timer)
  }, [loaded, session, upload])

  useEffect(() => {
    const handler = () => { void upload() }
    window.addEventListener('online', handler)
    window.addEventListener('visibilitychange', handler)
    return () => {
      window.removeEventListener('online', handler)
      window.removeEventListener('visibilitychange', handler)
    }
  }, [upload])

  useEffect(() => {
    const handlePageHide = () => {
      const latest = sessionRef.current
      if (latest) storeLocalFullMock(latest)
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])

  const change = useCallback((transform: (old: FullMockSession) => FullMockSession) => {
    const old = sessionRef.current
    if (!old) return
    setSaveMessage('正在同步…')
    applySession({ ...transform(old), updatedAt: Math.max(correctedFullMockNow(Date.now(), clockOffsetRef.current), old.updatedAt + 1) })
  }, [applySession])

  const start = () => {
    if (session && session.phase !== 'complete' && !window.confirm('开始新模考会覆盖未完成的模考，确定吗？')) return
    revisionRef.current = session ? revisionRef.current : 0
    lastUploadedRef.current = ''
    setSaveMessage('正在同步…')
    applySession(createFullMockSession(correctedFullMockNow(Date.now(), clockOffsetRef.current)))
    trackAnalyticsEvent('tcf_full_mock_start')
  }

  const submitStage = useCallback(async () => {
    const current = sessionRef.current
    if (!current || current.phase === 'complete' || finishingRef.current) return
    finishingRef.current = true
    setBusy(true)
    stopListeningAudio()
    const phase = current.phase
    const finishedAt = correctedFullMockNow(Date.now(), clockOffsetRef.current)

    const duration = Math.max(0, Math.min(TCF_CONFIG[phase].minutes * 60, Math.round((Math.min(finishedAt, current.deadlineAt) - current.stageStartedAt) / 1000)))
    let score: number | null
    let nclc: number | null
    try {
      if (phase === 'listening' || phase === 'reading') {
        const result = fullMockQcmResult(current, phase)
        score = result.scaledScore
        nclc = result.nclc
        recordTcfAttempt({
          skill: phase, questionCount: 39, answers: result.answers, correctCount: result.correctCount,
          scaledScore: score, nclc, durationSeconds: duration, startedAt: current.stageStartedAt, finishedAt,
        })
      } else {
        const rated = hasFullMockRating(current, phase)
        score = rated
          ? phase === 'writing' ? calculateEeTotalScore(current.writing.scores) : calculateEoTotalScore(current.speaking.scores)
          : null
        nclc = score === null ? null
          : phase === 'writing' ? estimateTcfEeNclc(score) : estimateTcfEoNclc(score)
        if (score !== null && nclc !== null) recordRatedSection(current, phase, score, nclc, current.stageStartedAt, finishedAt)
      }
      const next = advanceFullMock(current, score, nclc, finishedAt)
      setSaveMessage('正在同步…')
      applySession(next)
      // Flush existing tcfAttempts queue and the sitting state independently.
      void flushStudyProgress().catch(() => undefined)
      await upload()
      trackAnalyticsEvent('tcf_full_mock_section_complete')
    } catch {
      setSaveMessage('该项成绩暂存失败，请检查连接后重试提交')
    } finally {
      finishingRef.current = false
      setBusy(false)
    }
  }, [applySession, upload])

  const gradeCompleted = (skill: RatedSection) => {
    const current = sessionRef.current
    const result = current?.completed[skill]
    if (!current || !result || result.score !== null || !hasFullMockRating(current, skill)) return
    const score = skill === 'writing' ? calculateEeTotalScore(current.writing.scores) : calculateEoTotalScore(current.speaking.scores)
    const nclc = skill === 'writing' ? estimateTcfEeNclc(score) : estimateTcfEoNclc(score)
    recordRatedSection(current, skill, score, nclc, result.startedAt, result.finishedAt)
    change((old) => ({
      ...old,
      completed: { ...old.completed, [skill]: { ...result, score, nclc } },
    }))
    setSaveMessage('补评已保存，正在同步…')
  }

  const remaining = session ? fullMockRemaining(session, correctedFullMockNow(now, clockOffsetMs)) : 0
  useEffect(() => {
    if (session && session.phase !== 'complete' && remaining === 0 && !busy) void submitStage()
  }, [session, remaining, busy, submitStage])

  useEffect(() => { stopListeningAudio() }, [session?.phase, session?.qcm.listening.index])
  useEffect(() => () => { stopListeningAudio() }, [])


  const activeRecordingKey = session ? `${session.id}-full-mock-eo-${session.speaking.activeTask}` : ''
  useEffect(() => {
    setAudioUrl(null)
    if (session?.phase !== 'speaking') return
    let cancelled = false
    let createdUrl: string | null = null
    void getAudioRecording(activeRecordingKey).then((item) => {
      if (!item || cancelled) return
      createdUrl = URL.createObjectURL(item.blob)
      setAudioUrl(createdUrl)
    })
    return () => { cancelled = true; if (createdUrl) URL.revokeObjectURL(createdUrl) }
  }, [activeRecordingKey, session?.phase, session?.speaking.durations])

  const stopRecording = () => {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }
  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const startRecording = async () => {
    const current = sessionRef.current
    if (!current || current.phase !== 'speaking' || recording || !navigator.mediaDevices?.getUserMedia) {
      setSaveMessage('本浏览器不支持录音，请使用文字笔记保存作答内容')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      const chunks: Blob[] = []
      const started = Date.now()
      const index = current.speaking.activeTask
      const key = `${current.id}-full-mock-eo-${index}`
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      recorder.onstop = () => {
        const length = Math.min(720, Math.round((Date.now() - started) / 1000))
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size) void saveAudioRecording(key, blob, blob.type, length).then(() => {
          change((old) => ({
            ...old,
            speaking: { ...old.speaking, durations: old.speaking.durations.map((t, i) => i === index ? length : t) as [number, number, number] },
          }))
        }).catch(() => setSaveMessage('本机录音保存失败，请保留文字记录'))
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setRecording(true)
    } catch { setSaveMessage('无法访问麦克风，请检查浏览器权限；文字记录仍可跨设备同步') }
  }

  if (!loaded) return <Layout><main className="p-8" role="status">正在恢复连续模考…</main></Layout>

  const phase = session?.phase
  const qcmSkill: TcfQcmSkill | null = phase === 'listening' || phase === 'reading' ? phase : null
  const progress = qcmSkill && session ? session.qcm[qcmSkill] : null
  const question = qcmSkill && progress ? TCF_QUESTIONS[qcmSkill][progress.index] : null
  const writingTask = session?.writing.activeTask ?? 0
  const speakingTask = session?.speaking.activeTask ?? 0
  const writingPrompt = session?.phase === 'writing'
    ? TCF_WRITING_PROMPTS_BY_TASK[(writingTask + 1) as 1 | 2 | 3].find((item) => item.id === session.writing.taskIds[writingTask])
    : null
  const speakingPrompt = session?.phase === 'speaking'
    ? (TCF_SPEAKING_PROMPTS_BY_TASK[(speakingTask + 1) as 1 | 2 | 3] as TcfSpeakingPrompt[]).find((item) => item.id === session.speaking.taskIds[speakingTask])
    : null

  const ratingControls = (skill: RatedSection) => {
    if (!session) return null
    const rating = session[skill]
    return (
      <div className="mt-3 grid gap-3 sm:grid-cols-2" data-testid={`full-mock-ratings-${skill}`}>
        {Object.entries(rating.scores).map(([field, score]) => (
          <label key={field} className="text-sm">{field}
            <select aria-label={field} className={`${inputStyle} mt-1`}
              value={rating.ratedFields?.includes(field) ? score : ''}
              onChange={(event) => {
                const value = Number(event.target.value)
                change((old) => skill === 'writing'
                  ? { ...old, writing: {
                    ...old.writing,
                    scores: { ...old.writing.scores, [field]: value },
                    ratedFields: Array.from(new Set([...(old.writing.ratedFields ?? []), field])),
                  } }
                  : { ...old, speaking: {
                    ...old.speaking,
                    scores: { ...old.speaking.scores, [field]: value },
                    ratedFields: Array.from(new Set([...(old.speaking.ratedFields ?? []), field])),
                  } })
              }}>
              <option value="" disabled>请选择分数</option>
              {Array.from({ length: skill === 'writing' ? 6 : 5 }, (_, i) =>
                <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <main className="w-full flex-1 overflow-y-auto px-4 py-7 sm:px-8" data-testid="tcf-full-mock">
        <div className="mx-auto max-w-5xl space-y-5">
          <nav className="flex items-center justify-between text-sm">
            <NavLink to="/tcf" className="text-indigo-600">← TCF NCLC 7 总览</NavLink>
            <span role="status" className="text-xs text-gray-500" data-testid="full-mock-save-status">{saveMessage}</span>
          </nav>
          <header className={panel}>
            <div className="text-sm font-semibold text-indigo-600">TCF Canada · 完整连续模考</div>
            <h1 className="mt-2 text-2xl font-bold">四科连续模拟 · CO → CE → EE → EO</h1>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {FULL_MOCK_ORDER.map((skill, index) => (
                <div key={skill} className={`rounded-xl border p-3 text-sm ${phase === skill ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="font-semibold">{index + 1}. {labels[skill]}</div>
                  <div>{TCF_CONFIG[skill].minutes} 分钟</div>
                  {session?.completed[skill] && <div className="text-xs">已完成 · {session.completed[skill]?.score} 分</div>}
                </div>
              ))}
            </div>
          </header>

          {!session ? (
            <section className={panel}>
              <h2 className="text-xl font-semibold">开始完整模考</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">CO 39题/35分钟、CE 39题/60分钟、EE 3任务/60分钟、EO 3任务/12分钟，按顺序推进。每项计时从进入该项开始，离开页面不暂停。</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">答案会在本机即时保存并同步同一学习账号；断网时自动保留本地版本。评分仅为练习估算，写作和口语采用自行评分。</p>
              <button type="button" className="ui-btn-primary mt-4" onClick={start} data-testid="full-mock-start">开始 CO 听力</button>
            </section>
          ) : phase === 'complete' ? (
            <section className={panel} data-testid="full-mock-complete">
              <h2 className="text-2xl font-bold">四科模考完成</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FULL_MOCK_ORDER.map((skill) => <div key={skill} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                  {labels[skill]}：{session.completed[skill]?.score === null ? '未评分 · 请补评' : `${session.completed[skill]?.score} / ${TCF_CONFIG[skill].maxScore}`}
                  {session.completed[skill]?.score !== null && <span> · NCLC {session.completed[skill]?.nclc || '<4'}</span>}
                  <div className="text-xs">{session.completed[skill]?.score === null
                    ? '未评分成绩不会进入最新／最佳成绩、趋势或最弱项统计'
                    : `目标 ${TCF_CONFIG[skill].targetScore} · 差距 ${Math.max(0, TCF_CONFIG[skill].targetScore - (session.completed[skill]?.score ?? 0))}`}</div>
                  {(skill === 'writing' || skill === 'speaking') && session.completed[skill]?.score === null && (
                    <div className="mt-3" data-testid={`full-mock-pending-rating-${skill}`}>
                      <p className="text-sm font-semibold">请补评{labels[skill]}，否则该项不计入成绩面板。</p>
                      {ratingControls(skill)}
                      <button type="button" className="ui-btn-primary mt-3"
                        disabled={!hasFullMockRating(session, skill)}
                        onClick={() => gradeCompleted(skill)}>提交补评</button>
                    </div>
                  )}
                </div>)}
              </div>
              <div className="mt-5 flex gap-3">
                <NavLink to="/tcf" className="ui-btn-secondary">查看 NCLC 7 总览</NavLink>
                <button type="button" className="ui-btn-primary" onClick={start}>再考一场</button>
              </div>
            </section>
          ) : (
            <>
              <div className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-xl font-bold">{labels[phase ?? 'listening']}</h2><p className="text-xs text-gray-500">本项独立倒计时，时间到自动进入下一项</p></div>
                  <div role="timer" data-testid="full-mock-timer" className="font-mono text-2xl font-bold tabular-nums">{format(remaining)}</div>
                </div>
              </div>

              {qcmSkill && progress && question && (
                <section className={panel} data-testid="full-mock-qcm">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>第 {progress.index + 1} / 39 题 · 已答 {Object.keys(progress.answers).length} 题</span>
                    <span className="text-gray-500">{qcmSkill === 'listening' ? '音频仅可播放一次' : '阅读文档并选择答案'}</span>
                  </div>
                  {qcmSkill === 'listening' ? (
                    <div className="mt-4">
                      <button
                        type="button" className="ui-btn-secondary"
                        disabled={progress.played.includes(question.id)}
                        onClick={() => {
                          change((old) => ({
                            ...old,
                            qcm: { ...old.qcm, listening: { ...old.qcm.listening, played: [...old.qcm.listening.played, question.id] } },
                          }))
                          void playListeningQuestionAudio(question)
                          trackAnalyticsEvent('listening_play')
                        }}
                        data-testid="full-mock-play"

                      >{progress.played.includes(question.id) ? '已播放（不可重播）' : '播放法语音频'}</button>
                    </div>
                  ) : (
                    <div className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-7 dark:bg-gray-900">{question.passage}</div>
                  )}
                  <h3 className="mt-5 text-lg font-semibold">{question.prompt}</h3>
                  <div className="mt-4 grid gap-2">
                    {question.choices.map((choice, i) => (
                      <button
                        type="button" key={i}
                        data-testid={`full-mock-choice-${i}`}
                        aria-pressed={progress.answers[question.id] === i}
                        className={`rounded-xl border p-3 text-left text-sm ${progress.answers[question.id] === i ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => change((old) => ({
                          ...old,
                          qcm: { ...old.qcm, [qcmSkill]: {
                            ...old.qcm[qcmSkill], answers: { ...old.qcm[qcmSkill].answers, [question.id]: i },
                          } },
                        }))}
                      >{String.fromCharCode(65 + i)}. {choice}</button>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-between gap-3">
                    <button type="button" className="ui-btn-secondary" disabled={progress.index === 0} onClick={() => change((old) => ({
                      ...old, qcm: { ...old.qcm, [qcmSkill]: { ...old.qcm[qcmSkill], index: old.qcm[qcmSkill].index - 1 } },
                    }))}>上一题</button>
                    <button type="button" className="ui-btn-secondary" disabled={progress.index === 38} onClick={() => change((old) => ({
                      ...old, qcm: { ...old.qcm, [qcmSkill]: { ...old.qcm[qcmSkill], index: old.qcm[qcmSkill].index + 1 } },
                    }))}>下一题</button>
                  </div>
                </section>
              )}

              {phase === 'writing' && writingPrompt && (
                <section className={panel} data-testid="full-mock-writing">
                  <div className="flex gap-2">{[0, 1, 2].map((i) =>
                    <button key={i} type="button" className={session.writing.activeTask === i ? 'ui-btn-primary' : 'ui-btn-secondary'} onClick={() => change((old) => ({ ...old, writing: { ...old.writing, activeTask: i } }))}>任务 {i + 1}</button>)}</div>
                  <h3 className="mt-5 text-lg font-bold">{writingPrompt.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{writingPrompt.prompt}</p>
                  {writingPrompt.docA && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">{writingPrompt.docA}</p>}
                  {writingPrompt.docB && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900">{writingPrompt.docB}</p>}
                  <label className="mt-4 block text-sm font-semibold" htmlFor="full-mock-writing-input">法语作答 · {countFrenchWords(session.writing.texts[writingTask])} 词（建议 {writingPrompt.minWords}–{writingPrompt.maxWords}）</label>
                  <textarea id="full-mock-writing-input" data-testid="full-mock-writing-input" rows={9} maxLength={10000} className={`${inputStyle} mt-2`} value={session.writing.texts[writingTask]}
                    onChange={(event) => { const value = event.target.value; change((old) => ({
                      ...old, writing: { ...old.writing, texts: old.writing.texts.map((text, i) => i === writingTask ? value : text) as [string, string, string] },
                    })) }} />
                </section>
              )}

              {phase === 'speaking' && speakingPrompt && (
                <section className={panel} data-testid="full-mock-speaking">
                  <div className="flex gap-2">{[0, 1, 2].map((i) =>
                    <button key={i} type="button" className={session.speaking.activeTask === i ? 'ui-btn-primary' : 'ui-btn-secondary'}
                      disabled={recording}
                      onClick={() => change((old) => ({ ...old, speaking: { ...old.speaking, activeTask: i } }))}>任务 {i + 1}</button>)}</div>
                  <h3 className="mt-5 text-lg font-bold">{speakingPrompt.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                    {'intro' in speakingPrompt ? speakingPrompt.intro : 'scenario' in speakingPrompt ? speakingPrompt.scenario : speakingPrompt.prompt}
                  </p>
                  {'questions' in speakingPrompt && <ul className="mt-3 list-inside list-disc text-sm">{speakingPrompt.questions.map((q) => <li key={q}>{q}</li>)}</ul>}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" className="ui-btn-secondary" data-testid="full-mock-record"
                      onClick={() => recording ? stopRecording() : void startRecording()}>{recording ? '停止录音' : '开始本题录音'}</button>
                    {audioUrl && <audio controls src={audioUrl} aria-label="本机口语录音回放" />}
                  </div>
                  <label htmlFor="full-mock-speaking-notes" className="mt-4 block text-sm font-semibold">作答要点 / 口语文字记录（可跨设备恢复）</label>
                  <textarea id="full-mock-speaking-notes" data-testid="full-mock-speaking-notes" rows={5} maxLength={5000}
                    className={`${inputStyle} mt-2`} value={session.speaking.notes[speakingTask]}
                    onChange={(event) => { const value = event.target.value; change((old) => ({
                      ...old, speaking: { ...old.speaking, notes: old.speaking.notes.map((n, i) => i === speakingTask ? value : n) as [string, string, string] },
                    })) }} />
                  <p className="mt-2 text-xs text-gray-500">录音文件仅存于本设备的 IndexedDB；跨设备同步作答文字和剩余时间，不上传音频。</p>
                </section>
              )}

              {(phase === 'writing' || phase === 'speaking') && (
                <section className={panel} data-testid="full-mock-self-assess">
                  <h3 className="font-semibold">练习自评（仅用于估算 NCLC，不代表官方评分）</h3>
                  <p className="mt-2 text-xs text-gray-500">所有评分维度都选择分数后才计入成绩；未评分可在整场结束后补评。</p>
                  {ratingControls(phase)}
                </section>
              )}

              <section className="flex justify-end">
                <button type="button" data-testid="full-mock-next-section" className="ui-btn-primary" disabled={busy || recording}
                  onClick={() => {
                    const current = sessionRef.current
                    if (!current || !window.confirm(`确定提交${labels[current.phase === 'complete' ? 'speaking' : current.phase]}？该科目提交后将直接进入下一项，不能返回修改。`)) return
                    void submitStage()
                  }}>
                  {busy ? '正在保存…' : phase === 'speaking' ? '提交口语并完成整场模考' : `提交${labels[phase ?? 'listening']}并进入下一项`}
                </button>
              </section>
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}
