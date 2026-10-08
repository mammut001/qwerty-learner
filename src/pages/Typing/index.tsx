import Layout from '../../components/Layout'
import { DictChapterButton } from './components/DictChapterButton'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import ResultScreen from './components/ResultScreen'
import Speed from './components/Speed'
import StartButton from './components/StartButton'
import Switcher from './components/Switcher'
import WordList from './components/WordList'
import WordPanel from './components/WordPanel'
import { useConfetti } from './hooks/useConfetti'
import { useWordList } from './hooks/useWordList'
import { TypingContext, TypingStateActionType, initialState, typingReducer } from './store'
import PageToolbar from '@/components/PageToolbar'
import Tooltip from '@/components/Tooltip'
import { addStudyMinutes, flushStudyProgress } from '@/services/studyPlanSync'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom, randomConfigAtom, reviewModeInfoAtom } from '@/store'
import { customDictionariesAtom, findDictionary } from '@/store/customDict'
import { IsDesktop, isLegal } from '@/utils'
import { useSaveChapterRecord } from '@/utils/db'
import { useMixPanelChapterLogUploader } from '@/utils/mixpanel'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useImmerReducer } from 'use-immer'

const studyVocabularyTaskIds = new Set(['mon-vocab', 'fri-vocab', 'minimum-vocab', 'smart-vocab'])

const recordStudyPlanVocabularyMinutes = (dateKey: string, taskId: string, elapsedSeconds: number) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !studyVocabularyTaskIds.has(taskId) || elapsedSeconds <= 0) return

  try {
    addStudyMinutes(dateKey, taskId, Math.max(1, Math.ceil(elapsedSeconds / 60)))
  } catch {
    // Keep the typing result usable if the study-plan storage is unavailable or malformed.
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useImmerReducer(typingReducer, structuredClone(initialState))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { words, error: wordListError } = useWordList()

  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDictId = searchParams.get('dict')
  const requestedChapter = searchParams.get('chapter')
  const requestedStudyDate = searchParams.get('studyDate')
  const requestedStudyTaskId = searchParams.get('studyTask')
  const studyPlanTracking = useRef<{ dateKey: string; taskId: string } | null>(null)
  const recordedStudyPlanChapter = useRef(false)
  const flushedFinishedChapter = useRef(false)
  const randomConfig = useAtomValue(randomConfigAtom)
  const customDictionaries = useAtomValue(customDictionariesAtom)
  const chapterLogUploader = useMixPanelChapterLogUploader(state)
  const saveChapterRecord = useSaveChapterRecord()

  const reviewModeInfo = useAtomValue(reviewModeInfoAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)

  useEffect(() => {
    const requestedDictionary = findDictionary(requestedDictId, customDictionaries)
    if (!requestedDictId || !requestedDictionary) return

    const parsedChapter = requestedChapter !== null && /^\d+$/.test(requestedChapter) ? Number(requestedChapter) : -1
    const nextChapter =
      Number.isSafeInteger(parsedChapter) && parsedChapter >= 0 && parsedChapter < requestedDictionary.chapterCount ? parsedChapter : 0

    setCurrentDictId(requestedDictId)
    setCurrentChapter(nextChapter)
    setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))

    studyPlanTracking.current =
      requestedStudyDate &&
      requestedStudyTaskId &&
      /^\d{4}-\d{2}-\d{2}$/.test(requestedStudyDate) &&
      studyVocabularyTaskIds.has(requestedStudyTaskId)
        ? { dateKey: requestedStudyDate, taskId: requestedStudyTaskId }
        : null

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('dict')
    nextSearchParams.delete('chapter')
    nextSearchParams.delete('studyDate')
    nextSearchParams.delete('studyTask')
    setSearchParams(nextSearchParams, { replace: true })
  }, [
    customDictionaries,
    requestedDictId,
    requestedChapter,
    requestedStudyDate,
    requestedStudyTaskId,
    searchParams,
    setCurrentChapter,
    setCurrentDictId,
    setReviewModeInfo,
    setSearchParams,
  ])

  useEffect(() => {
    // 检测用户设备
    if (!IsDesktop()) {
      setTimeout(() => {
        alert('单词跟打需要实体键盘。请在电脑上使用；平板可以接上外接键盘后再练习。')
      }, 500)
    }
  }, [])

  // 在组件挂载和currentDictId改变时，检查当前字典是否存在，如果不存在，则将其重置为默认值
  useEffect(() => {
    const id = currentDictId
    if (!findDictionary(id, customDictionaries)) {
      setCurrentDictId('tcf-canada-foundation-01')
      setCurrentChapter(0)
      return
    }
  }, [currentDictId, customDictionaries, setCurrentChapter, setCurrentDictId])

  const skipWord = useCallback(() => {
    dispatch({ type: TypingStateActionType.SKIP_WORD })
  }, [dispatch])

  useEffect(() => {
    const onBlur = () => {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
    }
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [dispatch])

  useEffect(() => {
    state.chapterData.words?.length > 0 ? setIsLoading(false) : setIsLoading(true)
  }, [state.chapterData.words])

  useEffect(() => {
    if (!state.isTyping) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!isLoading && e.key !== 'Enter' && (isLegal(e.key) || e.key === ' ') && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return () => window.removeEventListener('keydown', onKeyDown)
    }
  }, [state.isTyping, isLoading, dispatch])

  useEffect(() => {
    if (words !== undefined) {
      const initialIndex = isReviewMode && reviewModeInfo.reviewRecord?.index ? reviewModeInfo.reviewRecord.index : 0

      dispatch({
        type: TypingStateActionType.SETUP_CHAPTER,
        payload: { words, shouldShuffle: randomConfig.isOpen, initialIndex },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  useEffect(() => {
    // 当用户完成章节后且完成 word Record 数据保存，记录 chapter Record 数据。
    // 单词记录本身已先写入 IndexedDB + durable sync queue；这里在结果页出现时主动 flush。
    if (!state.isFinished) {
      flushedFinishedChapter.current = false
      return
    }
    if (!state.isSavingRecord) {
      chapterLogUploader()
      saveChapterRecord(state)
      if (!flushedFinishedChapter.current) {
        flushedFinishedChapter.current = true
        void flushStudyProgress()
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isFinished, state.isSavingRecord])

  useEffect(() => {
    if (!state.isFinished) {
      recordedStudyPlanChapter.current = false
      return
    }
    const tracking = studyPlanTracking.current
    if (recordedStudyPlanChapter.current || !tracking) return

    recordStudyPlanVocabularyMinutes(tracking.dateKey, tracking.taskId, state.timerData.time)
    recordedStudyPlanChapter.current = true
  }, [state.isFinished, state.timerData.time])

  useEffect(() => {
    // 启动计时器
    let intervalId: number
    if (state.isTyping) {
      intervalId = window.setInterval(() => {
        dispatch({ type: TypingStateActionType.TICK_TIMER })
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [state.isTyping, dispatch])

  useConfetti(state.isFinished)

  return (
    <TypingContext.Provider value={{ state: state, dispatch }}>
      {state.isFinished && <ResultScreen />}
      <Layout>
        <PageToolbar>
          <DictChapterButton />
          <PronunciationSwitcher />
          <Switcher />
          <StartButton isLoading={isLoading} />
          <Tooltip content="跳过该词">
            <button
              className={`${
                state.isShowSkip ? 'bg-orange-400' : 'invisible w-0 bg-gray-300 px-0 opacity-0'
              } my-btn-primary transition-all duration-300 `}
              onClick={skipWord}
            >
              Skip
            </button>
          </Tooltip>
        </PageToolbar>
        <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-5">
          <div className="container relative mx-auto flex h-full flex-col items-center">
            <div className="container flex flex-grow items-center justify-center">
              {wordListError ? (
                <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-center dark:border-red-900 dark:bg-red-950/30">
                  <div className="font-medium text-red-700 dark:text-red-300">词库加载失败</div>
                  <div className="mt-2 text-sm text-red-600/80 dark:text-red-300/80">{wordListError.message}</div>
                  <button
                    type="button"
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:opacity-90"
                    onClick={() => window.location.reload()}
                  >
                    重新加载
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center ">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  ></div>
                </div>
              ) : (
                !state.isFinished && <WordPanel />
              )}
            </div>
            <Speed />
          </div>
        </div>
      </Layout>
      <WordList />
    </TypingContext.Provider>
  )
}

export default App
