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
import Header from '@/components/Header'
import Tooltip from '@/components/Tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom, randomConfigAtom, reviewModeInfoAtom } from '@/store'
import { IsDesktop, isLegal } from '@/utils'
import { useSaveChapterRecord } from '@/utils/db'
import { useMixPanelChapterLogUploader } from '@/utils/mixpanel'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { NavLink, useSearchParams } from 'react-router-dom'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useImmerReducer } from 'use-immer'

const App: React.FC = () => {
  const [state, dispatch] = useImmerReducer(typingReducer, structuredClone(initialState))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { words, error: wordListError } = useWordList()

  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDictId = searchParams.get('dict')
  const randomConfig = useAtomValue(randomConfigAtom)
  const chapterLogUploader = useMixPanelChapterLogUploader(state)
  const saveChapterRecord = useSaveChapterRecord()

  const reviewModeInfo = useAtomValue(reviewModeInfoAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)

  useEffect(() => {
    if (!requestedDictId || !(requestedDictId in idDictionaryMap)) return

    setCurrentDictId(requestedDictId)
    setCurrentChapter(0)
    setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('dict')
    setSearchParams(nextSearchParams, { replace: true })
  }, [
    requestedDictId,
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
        alert(
          ' Qwerty Learner 目的为帮助键盘学习者练习法语输入，目前暂未适配移动端，希望您使用桌面端浏览器访问。如您使用的是 Ipad 等平板电脑设备，可以使用外接键盘使用本软件。',
        )
      }, 500)
    }
  }, [])

  // 在组件挂载和currentDictId改变时，检查当前字典是否存在，如果不存在，则将其重置为默认值
  useEffect(() => {
    const id = currentDictId
    if (!(id in idDictionaryMap)) {
      setCurrentDictId('tcf-canada-foundation-01')
      setCurrentChapter(0)
      return
    }
  }, [currentDictId, setCurrentChapter, setCurrentDictId])

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
    // 当用户完成章节后且完成 word Record 数据保存，记录 chapter Record 数据,
    if (state.isFinished && !state.isSavingRecord) {
      chapterLogUploader()
      saveChapterRecord(state)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isFinished, state.isSavingRecord])

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
        <Header>
          <DictChapterButton />
          <Tooltip content="26 周 TCF Canada 学习计划与今日任务">
            <NavLink
              to="/study-plan"
              className="block rounded-lg px-3 py-1 text-base transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
            >
              学习计划
            </NavLink>
          </Tooltip>
          <Tooltip content="30 分钟：passé composé vs imparfait">
            <NavLink
              to="/grammar-session"
              className="block rounded-lg px-3 py-1 text-base transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
            >
              30分钟语法
            </NavLink>
          </Tooltip>
          <Tooltip content="按动词学习 Présent / Passé composé / Imparfait">
            <NavLink
              to="/conjugation"
              className="block rounded-lg px-3 py-1 text-base transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
            >
              动词变位
            </NavLink>
          </Tooltip>
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
        </Header>
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
