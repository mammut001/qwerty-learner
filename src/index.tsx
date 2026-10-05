import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { FriendLinks } from './pages/FriendLinks'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { migrateVocabularyHistory } from '@/services/studyPlanSync'
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

const VOCABULARY_MIGRATION_KEY = 'qwerty-fr-vocabulary-server-migration-v1'

async function migrateExistingVocabularyHistory() {
  try {
    if (window.localStorage.getItem(VOCABULARY_MIGRATION_KEY)) return
    const records = (await db.wordRecords.orderBy('timeStamp').reverse().limit(3000).toArray()).reverse()
    migrateVocabularyHistory(
      records.map((record) => ({
        word: record.word,
        dict: record.dict,
        chapter: record.chapter,
        timeStamp: record.timeStamp,
        durationMs: record.timing.reduce((total, value) => total + value, 0),
        wrongCount: record.wrongCount,
        wrongKeys: Object.values(record.mistakes ?? {}).flat().map(String).slice(0, 200),
      })),
    )
    window.localStorage.setItem(VOCABULARY_MIGRATION_KEY, 'queued')
  } catch {
    // Keep local IndexedDB data untouched and retry on a later page load.
  }
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    void migrateExistingVocabularyHistory()
  }, [])

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 600
      if (!isMobile) {
        window.location.href = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner/' : '/'
      }
      setIsMobile(isMobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {isMobile ? (
              <Route path="/*" element={<Navigate to="/mobile" />} />
            ) : (
              <>
                <Route index element={<TypingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/conjugation" element={<ConjugationPage />} />
                <Route path="/grammar-session" element={<GrammarSessionPage />} />
                <Route path="/study-plan" element={<StudyPlanPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/error-book" element={<ErrorBook />} />
                <Route path="/friend-links" element={<FriendLinks />} />
                <Route path="/*" element={<Navigate to="/" />} />
              </>
            )}
            <Route path="/mobile" element={<MobilePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
