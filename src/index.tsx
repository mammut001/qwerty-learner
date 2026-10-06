import Loading from './components/Loading'
import './index.css'
import { isOpenDarkModeAtom } from '@/store'
import 'animate.css'
import { useAtomValue } from 'jotai'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

const TypingPage = lazy(() => import('./pages/Typing'))
const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))
const ConjugationPage = lazy(() => import('./pages/Conjugation'))
const GrammarSessionPage = lazy(() => import('./pages/GrammarSession'))
const StudyPlanPage = lazy(() => import('./pages/StudyPlan'))
const TcfHubPage = lazy(() => import('./pages/TcfHub'))
const TcfListeningPage = lazy(() => import('./pages/TcfListening'))
const TcfReadingPage = lazy(() => import('./pages/TcfReading'))
const TcfWritingPage = lazy(() => import('./pages/TcfWriting'))
const TcfSpeakingPage = lazy(() => import('./pages/TcfSpeaking'))
const CustomDictPage = lazy(() => import('./pages/CustomDict'))
const KeyboardRequiredPage = lazy(() => import('./pages/KeyboardRequired'))
const ErrorBookPage = lazy(() => import('./pages/ErrorBook').then((module) => ({ default: module.ErrorBook })))
const FocusTimerDock = lazy(() => import('./components/FocusTimerDock'))

// The study plan is the home page; old `/?dict=…` practice links keep working by forwarding to the typing page.
function HomeRedirect() {
  const { search } = useLocation()
  return <Navigate to={search ? `/typing${search}` : '/study-plan'} replace />
}

async function migrateExistingStudyData() {
  try {
    const [{ migrateLegacyStudyData }, { db }] = await Promise.all([import('@/services/studyPlanSync'), import('@/utils/db')])
    const records = (await db.wordRecords.orderBy('timeStamp').reverse().limit(3000).toArray()).reverse()
    const grammarHistory = JSON.parse(window.localStorage.getItem('qwerty-fr-grammar-session-history-v1') ?? '[]')
    const conjugation = JSON.parse(window.localStorage.getItem('qwerty-fr-conjugation-stats-v1') ?? '{}')
    await migrateLegacyStudyData({
      vocabulary: records.map((record) => ({
        word: record.word,
        dict: record.dict,
        chapter: record.chapter,
        timeStamp: record.timeStamp,
        durationMs: record.timing.reduce((total, value) => total + value, 0),
        wrongCount: record.wrongCount,
        wrongKeys: Object.values(record.mistakes ?? {})
          .flat()
          .map(String)
          .slice(0, 200),
      })),
      grammarHistory,
      conjugation,
    })
  } catch {
    // Keep every legacy store untouched and retry on a later page load.
  }
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    void migrateExistingStudyData()
    void import('@/services/pwa').then(({ registerStudyPwa }) => registerStudyPwa())
    void import('@/services/studyReminder').then(({ startStudyReminderScheduler }) => startStudyReminderScheduler())
    void import('@/services/focusTimer').then(({ startFocusTimerRuntime }) => startFocusTimerRuntime())
  }, [])

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<HomeRedirect />} />
            <Route path="/typing" element={isMobile ? <KeyboardRequiredPage /> : <TypingPage />} />
            <Route path="/gallery" element={isMobile ? <KeyboardRequiredPage /> : <GalleryPage />} />
            <Route path="/word-lists" element={<CustomDictPage />} />
            <Route path="/conjugation" element={<ConjugationPage />} />
            <Route path="/grammar-session" element={<GrammarSessionPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/tcf" element={<TcfHubPage />} />
            <Route path="/tcf-listening" element={<TcfListeningPage />} />
            <Route path="/tcf-reading" element={<TcfReadingPage />} />
            <Route path="/tcf-writing" element={<TcfWritingPage />} />
            <Route path="/tcf-speaking" element={<TcfSpeakingPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/error-book" element={<ErrorBookPage />} />
            <Route path="/*" element={<Navigate to="/study-plan" />} />
          </Routes>
          <FocusTimerDock />
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')
container && createRoot(container).render(<Root />)
