import DictPicker from './DictPicker'
import Practice from './Practice'
import { useTapDictionary } from './words'
import Layout from '@/components/Layout'
import { currentChapterAtom, currentDictIdAtom, currentDictInfoAtom, reviewModeInfoAtom } from '@/store'
import { customDictionariesAtom, findDictionary } from '@/store/customDict'
import type { Dictionary } from '@/typings'
import { addStudyMinutes, flushStudyProgress } from '@/services/studyPlanSync'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IconRefresh from '~icons/tabler/refresh'

// Same vocabulary smart tasks Typing credits; study-plan links on phones land here instead of /typing.
const TAP_STUDY_VOCABULARY_TASKS = new Set(['mon-vocab', 'fri-vocab', 'minimum-vocab', 'smart-vocab'])

/**
 * 点选模式: practice without a keyboard. Used on phones in place of /typing and /gallery, and on /tap everywhere.
 * Honours ?dict= and ?chapter= links (the same ones the typing page takes) so study-plan links open practice directly.
 */
export default function TapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const customDictionaries = useAtomValue(customDictionariesAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const requestedDictId = searchParams.get('dict')
  const requestedChapter = searchParams.get('chapter')
  const [view, setView] = useState<'picker' | 'practice'>(() => (requestedDictId ? 'practice' : 'picker'))
  const studyPlanTracking = useRef<{ dateKey: string; taskId: string; startedAt: number } | null>(null)

  // Credit the study-plan task with the time spent in practice, when the page is left.
  const recordStudyPlanMinutes = () => {
    const tracking = studyPlanTracking.current
    studyPlanTracking.current = null
    if (!tracking) return
    const elapsedMinutes = Math.max(1, Math.ceil((Date.now() - tracking.startedAt) / 60000))
    try {
      addStudyMinutes(tracking.dateKey, tracking.taskId, elapsedMinutes)
      void flushStudyProgress().catch(() => undefined)
    } catch {
      // Practice itself is unaffected if smart-task minute tracking cannot be queued.
    }
  }
  useEffect(() => () => recordStudyPlanMinutes(), [])

  useEffect(() => {
    const requestedDictionary = findDictionary(requestedDictId, customDictionaries)
    if (!requestedDictId || !requestedDictionary) return

    const parsedChapter = requestedChapter !== null && /^\d+$/.test(requestedChapter) ? Number(requestedChapter) : -1
    const nextChapter =
      Number.isSafeInteger(parsedChapter) && parsedChapter >= 0 && parsedChapter < requestedDictionary.chapterCount ? parsedChapter : 0

    setCurrentDictId(requestedDictionary.id)
    setCurrentChapter(nextChapter)
    setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))
    setView('practice')

    const requestedStudyDate = searchParams.get('studyDate')
    const requestedStudyTask = searchParams.get('studyTask')
    if (
      requestedStudyDate &&
      requestedStudyTask &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedStudyDate) &&
      TAP_STUDY_VOCABULARY_TASKS.has(requestedStudyTask)
    ) {
      recordStudyPlanMinutes()
      studyPlanTracking.current = { dateKey: requestedStudyDate, taskId: requestedStudyTask, startedAt: Date.now() }
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    for (const key of ['dict', 'chapter', 'studyDate', 'studyTask']) nextSearchParams.delete(key)
    setSearchParams(nextSearchParams, { replace: true })
  }, [
    customDictionaries,
    requestedDictId,
    requestedChapter,
    searchParams,
    setCurrentChapter,
    setCurrentDictId,
    setReviewModeInfo,
    setSearchParams,
  ])

  const choose = (dict: Dictionary, chapter: number) => {
    setCurrentDictId(dict.id)
    setCurrentChapter(chapter)
    setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))
    setView('practice')
  }

  return (
    <Layout>
      {view === 'picker' ? (
        <DictPicker
          selectedDictId={currentDictId}
          selectedChapter={currentChapter}
          customDictionaries={customDictionaries}
          onPick={choose}
        />
      ) : (
        <PracticeLoader
          dict={currentDictInfo}
          chapter={currentChapter}
          onOpenPicker={() => setView('picker')}
          onChapter={(chapter) => setCurrentChapter(chapter)}
        />
      )}
    </Layout>
  )
}

function PracticeLoader({
  dict,
  chapter,
  onOpenPicker,
  onChapter,
}: {
  dict: Dictionary
  chapter: number
  onOpenPicker: () => void
  onChapter: (chapter: number) => void
}) {
  const { all, chapterWords, ready, error, retry } = useTapDictionary(dict, chapter)

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <div role="alert" className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <div className="font-medium text-red-700 dark:text-red-300">词库加载失败</div>
          <div className="mt-2 break-words text-sm text-red-600/80 dark:text-red-300/80">{error.message}</div>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={() => void retry()} className="ui-btn-primary h-11 px-4">
              <IconRefresh className="mr-1 h-4 w-4" />
              重试
            </button>
            <button type="button" onClick={onOpenPicker} className="ui-btn-secondary h-11 px-4">
              换词库
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div role="status" className="flex flex-1 items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
        正在加载词库…
      </div>
    )
  }

  return (
    <Practice
      key={`${dict.id}-${chapter}`}
      dict={dict}
      chapter={chapter}
      chapterWords={chapterWords}
      allWords={all}
      onOpenPicker={onOpenPicker}
      onChapter={onChapter}
    />
  )
}
