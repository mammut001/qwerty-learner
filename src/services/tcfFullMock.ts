import { TCF_CONFIG, TCF_QUESTIONS, estimateTcfNclc, estimateTcfScaledScore, type TcfQcmSkill, type TcfSkill } from '@/resources/tcfMock'
import { TCF_WRITING_PROMPTS_BY_TASK } from '@/resources/tcfWritingData'
import { TCF_SPEAKING_PROMPTS_BY_TASK } from '@/resources/tcfSpeakingData'
import { studyApiBase, syncStudyPlan } from '@/services/studyPlanSync'

export const FULL_MOCK_ORDER: TcfSkill[] = ['listening', 'reading', 'writing', 'speaking']
export const FULL_MOCK_STORAGE = 'qwerty-tcf-full-mock-v1'

type QcmProgress = { answers: Record<string, number>; played: string[]; index: number }
type MockResult = { score: number | null; nclc: number | null; startedAt: number; finishedAt: number }
export type FullMockSession = {
  version: 1
  id: string
  phase: TcfSkill | 'complete'
  createdAt: number
  updatedAt: number
  stageStartedAt: number
  deadlineAt: number
  completed: Partial<Record<TcfSkill, MockResult>>
  qcm: Record<TcfQcmSkill, QcmProgress>
  writing: {
    taskIds: [string, string, string]
    texts: [string, string, string]
    activeTask: number
    scores: { taskCompletion: number; coherence: number; vocabulary: number; grammar: number }
    ratedFields?: string[]
  }
  speaking: {
    taskIds: [string, string, string]
    notes: [string, string, string]
    activeTask: number
    durations: [number, number, number]
    scores: { fluency: number; pronunciation: number; vocabulary: number; grammar: number; taskCompletion: number }
    ratedFields?: string[]
  }
}

export function createFullMockSession(now = Date.now()): FullMockSession {
  return {
    version: 1, id: crypto.randomUUID(), phase: 'listening', createdAt: now, updatedAt: now,
    stageStartedAt: now, deadlineAt: now + TCF_CONFIG.listening.minutes * 60000,
    completed: {},
    qcm: { listening: { answers: {}, played: [], index: 0 }, reading: { answers: {}, played: [], index: 0 } },
    writing: {
      taskIds: [1, 2, 3].map((i) => TCF_WRITING_PROMPTS_BY_TASK[i as 1 | 2 | 3][0].id) as [string, string, string],
      texts: ['', '', ''], activeTask: 0,
      scores: { taskCompletion: 0, coherence: 0, vocabulary: 0, grammar: 0 }, ratedFields: [],
    },
    speaking: {
      taskIds: [1, 2, 3].map((i) => TCF_SPEAKING_PROMPTS_BY_TASK[i as 1 | 2 | 3][0].id) as [string, string, string],
      notes: ['', '', ''], activeTask: 0, durations: [0, 0, 0],
      scores: { fluency: 0, pronunciation: 0, vocabulary: 0, grammar: 0, taskCompletion: 0 }, ratedFields: [],
    },
  }
}

export const fullMockRemaining = (session: FullMockSession, now = Date.now()) =>
  session.phase === 'complete' ? 0 : Math.max(0, Math.ceil((session.deadlineAt - now) / 1000))

export function fullMockQcmResult(session: FullMockSession, skill: TcfQcmSkill) {
  const questions = TCF_QUESTIONS[skill]
  const answers = questions.map((q) => {
    const choice = session.qcm[skill].answers[q.id]
    return { questionId: q.id, choice: choice === undefined ? null : choice, correct: choice === q.answer }
  })
  const correctCount = answers.filter((a) => a.correct).length
  const scaledScore = estimateTcfScaledScore(correctCount, 39)
  return { answers, correctCount, scaledScore, nclc: estimateTcfNclc(skill, scaledScore) }
}

export function advanceFullMock(session: FullMockSession, score: number | null, nclc: number | null, now = Date.now()): FullMockSession {
  if (session.phase === 'complete') return session
  const position = FULL_MOCK_ORDER.indexOf(session.phase)
  const nextPhase: FullMockSession['phase'] = position < FULL_MOCK_ORDER.length - 1
    ? FULL_MOCK_ORDER[position + 1]
    : 'complete'
  return {
    ...session,
    phase: nextPhase,
    updatedAt: Math.max(now, session.updatedAt + 1),
    stageStartedAt: now,
    deadlineAt: nextPhase === 'complete' ? 0 : now + TCF_CONFIG[nextPhase].minutes * 60000,
    completed: {
      ...session.completed,
      [session.phase]: { score, nclc, startedAt: session.stageStartedAt, finishedAt: now },
    },
  }
}

export function readLocalFullMock(): FullMockSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(FULL_MOCK_STORAGE) ?? 'null') as FullMockSession | null
    return value && value.version === 1 && typeof value.id === 'string' &&
      ['listening', 'reading', 'writing', 'speaking', 'complete'].includes(value.phase) &&
      value.qcm && value.qcm.listening && value.qcm.reading &&
      value.qcm.listening.answers && value.qcm.reading.answers &&
      Array.isArray(value.qcm.listening.played) && Array.isArray(value.qcm.reading.played) &&
      value.writing && Array.isArray(value.writing.texts) && value.writing.texts.length === 3 &&
      value.speaking && Array.isArray(value.speaking.notes) && value.speaking.notes.length === 3 &&
      value.completed && Number.isFinite(value.deadlineAt) ? value : null
  } catch { return null }
}

export function storeLocalFullMock(session: FullMockSession) {
  try { localStorage.setItem(FULL_MOCK_STORAGE, JSON.stringify(session)) } catch { /* Private mode/storage denied */ }
}

const base = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)
export type RemotePayload = { session: FullMockSession | null; revision: number }

export class FullMockRequestError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code)
  }
}

async function remoteError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({})) as { code?: string }
  throw new FullMockRequestError(response.status, body.code || 'FULL_MOCK_REQUEST_FAILED')
}

export async function loadRemoteFullMock(): Promise<RemotePayload> {
  // Use the existing study sync to establish the same learner/session cookie.
  await syncStudyPlan()
  const response = await fetch(`${base}/api/study-plan/tcf-full-mock`, { credentials: 'include', cache: 'no-store' })
  if (!response.ok) return remoteError(response)
  return response.json() as Promise<RemotePayload>
}

export async function saveRemoteFullMock(session: FullMockSession, revision: number): Promise<{ revision: number; session: FullMockSession }> {
  const response = await fetch(`${base}/api/study-plan/tcf-full-mock`, {
    method: 'PUT', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, revision }),
  })
  if (!response.ok) return remoteError(response)
  return response.json() as Promise<{ revision: number; session: FullMockSession }>
}
