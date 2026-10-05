import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { FriendLinks } from './pages/FriendLinks'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { registerStudyPwa } from '@/services/pwa'
import { startStudyReminderScheduler } from '@/services/studyReminder'
import { migrateLegacyStudyData } from '@/services/studyPlanSync'
import { db } from '@/utils/db'
import 'animate.css'
import { useAtomValue } from 'jotai'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))
const ConjugationPage = lazy(() => import('./pages/Conjugation'))
const GrammarSessionPage = lazy(() => import('./pages/GrammarSession'))
const StudyPlanPage = lazy(() => import('./pages/StudyPlan'))

async function migrateExistingStudyData() {
  try {
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
        wrongKeys: Object.values(record.mistakes ?? {}).flat().map(String).slice(0, 200),
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
    void registerStudyPwa()
    startStudyReminderScheduler()
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
            <Route index element={isMobile ? <MobilePage /> : <TypingPage />} />
            <Route path="/gallery" element={isMobile ? <MobilePage /> : <GalleryPage />} />
            <Route path="/conjugation" element={<ConjugationPage />} />
            <Route path="/grammar-session" element={<GrammarSessionPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/error-book" element={<ErrorBook />} />
            <Route path="/friend-links" element={<FriendLinks />} />
            <Route path="/mobile" element={<MobilePage />} />
            <Route path="/*" element={<Navigate to={isMobile ? '/study-plan' : '/'} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
