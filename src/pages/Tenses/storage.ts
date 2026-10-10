import type { TensePracticeProgress } from '@/resources/tenses/types'

const STORAGE_KEY = 'qwerty-fr-tenses-progress-v1'

export function loadAllProgress(): Record<string, TensePracticeProgress> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function loadLessonProgress(lessonId: string): TensePracticeProgress {
  const all = loadAllProgress()
  return (
    all[lessonId] ?? {
      lessonId,
      completedQuestions: {},
      totalAttempts: 0,
      correctCount: 0,
    }
  )
}

export function saveQuestionResult(
  lessonId: string,
  questionId: string,
  answered: string,
  isCorrect: boolean,
): TensePracticeProgress {
  const all = loadAllProgress()
  const prev = all[lessonId] ?? {
    lessonId,
    completedQuestions: {},
    totalAttempts: 0,
    correctCount: 0,
  }

  const alreadyAnswered = Boolean(prev.completedQuestions[questionId])
  const prevWasCorrect = prev.completedQuestions[questionId]?.correct ?? false

  const nextQuestions = {
    ...prev.completedQuestions,
    [questionId]: {
      answered,
      correct: isCorrect,
      timestamp: Date.now(),
    },
  }

  let nextCorrectCount = prev.correctCount
  if (!alreadyAnswered) {
    if (isCorrect) nextCorrectCount += 1
  } else {
    if (!prevWasCorrect && isCorrect) nextCorrectCount += 1
    if (prevWasCorrect && !isCorrect) nextCorrectCount -= 1
  }

  const updated: TensePracticeProgress = {
    lessonId,
    completedQuestions: nextQuestions,
    totalAttempts: prev.totalAttempts + 1,
    correctCount: Math.max(0, nextCorrectCount),
  }

  all[lessonId] = updated

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    } catch {
      // ignore storage quota / private browsing errors
    }
  }

  return updated
}

export function resetLessonProgress(lessonId: string): void {
  const all = loadAllProgress()
  delete all[lessonId]
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    } catch {
      // ignore
    }
  }
}
