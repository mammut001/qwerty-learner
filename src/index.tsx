import './services/localProfileInit'
import { initAnalytics } from './utils/analytics'
import { setupChunkReloadListener } from './utils/chunkReload'

initAnalytics()
setupChunkReloadListener()
import AccessGate from './components/AccessGate'
import { titleForPath, usePageTitle } from './hooks/usePageTitle'
import AdminRouteGate from './components/AdminRouteGate'
import AppErrorBoundary from './components/AppErrorBoundary'
import AuthGate from './components/AuthGate'
import { LookupProvider } from './components/Dictionary/LookupProvider'
import Header from './components/Header'
import { LoadingUI } from './components/Loading'
import RequireAccount from './components/RequireAccount'
import { ShellHeaderProvider } from './components/ShellHeader'
import './index.css'
import { isGuestMode, readCachedStatus } from '@/services/guestMode'
import { isOpenDarkModeAtom } from '@/store'
import { authStatusAtom } from '@/store/auth'
import { resolveHomePath } from '@/utils/homePath'
import 'animate.css'
import { useAtomValue } from 'jotai'
// Targeted polyfill for Safari 14 / iOS 14 / Chrome < 98 (Typing practice relies on structuredClone).
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = ((value: unknown) => {
    if (value === undefined) return undefined
    return JSON.parse(JSON.stringify(value))
  }) as typeof structuredClone
}

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'


const NotFoundPage = lazy(() => import('./pages/NotFound'))
const AdminHomePage = lazy(() => import('./pages/AdminHome'))
const TypingPage = lazy(() => import('./pages/Typing'))
const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))
const ConjugationPage = lazy(() => import('./pages/Conjugation'))
const GrammarSessionPage = lazy(() => import('./pages/GrammarSession'))
const TensesPage = lazy(() => import('./pages/Tenses'))
const StudyPlanPage = lazy(() => import('./pages/StudyPlan'))
const TcfHubPage = lazy(() => import('./pages/TcfHub'))
const TcfFullMockPage = lazy(() => import('./pages/TcfFullMock'))
const PlacementTestPage = lazy(() => import('./pages/PlacementTest'))
const AdminPlacementPage = lazy(() => import('./pages/AdminPlacement'))
const ExamRecallsPage = lazy(() => import('./pages/ExamRecalls'))
const AdminRecallsPage = lazy(() => import('./pages/AdminRecalls'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsers'))
const EchelleQuebecoisePage = lazy(() => import('./pages/EchelleQuebecoise'))
const LevelsPage = lazy(() => import('./pages/Levels'))
const LevelDetailPage = lazy(() => import('./pages/LevelDetail'))
const LevelReviewPage = lazy(() => import('./pages/LevelReview'))
const TcfListeningPage = lazy(() => import('./pages/TcfListening'))
const TcfReadingPage = lazy(() => import('./pages/TcfReading'))
const TcfWritingPage = lazy(() => import('./pages/TcfWriting'))
const TcfSpeakingPage = lazy(() => import('./pages/TcfSpeaking'))
const DictionaryPage = lazy(() => import('./pages/Dictionary'))
const CustomDictPage = lazy(() => import('./pages/CustomDict'))
const TapPage = lazy(() => import('./pages/Tap'))
const ErrorBookPage = lazy(() => import('./pages/ErrorBook').then((module) => ({ default: module.ErrorBook })))
const BillingPage = lazy(() => import('./pages/Billing'))
const FocusTimerDock = lazy(() => import('./components/FocusTimerDock'))

// The study plan is the home page for signed-in users; guests land on typing practice.
// Old `/?dict=…` practice links keep working by forwarding to the typing page.
function HomeRedirect() {
  const { search } = useLocation()
  const authStatus = useAtomValue(authStatusAtom)
  const cachedStatus = readCachedStatus()
  const guestMode = isGuestMode()
  return <Navigate to={resolveHomePath({ search, authStatus, cachedStatus, guestMode })} replace />
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
        ...(record.mode === 'tap' ? { mode: 'tap' as const } : {}),
      })),
      grammarHistory,
      conjugation,
    })
  } catch {
    // Keep every legacy store untouched and retry on a later page load.
  }
}

function OutletFallback() {
  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center">
      <LoadingUI />
    </div>
  )
}

function ShellOutlet({ children }: { children: React.ReactNode }) {
  const { pathname, search } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  usePageTitle(titleForPath(pathname))

  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [pathname, search])

  return (
    <div ref={ref} data-testid="app-shell-outlet" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AppErrorBoundary resetKey={pathname}>
        {children}
      </AppErrorBoundary>
    </div>
  )
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const authStatus = useAtomValue(authStatusAtom)
  // Do not start authenticated migration before the initial auth check resolves.
  useEffect(() => {
    if (authStatus && (!authStatus.enabled || !authStatus.required || authStatus.signedIn)) {
      void migrateExistingStudyData()
    }
  }, [authStatus])

  useEffect(() => {
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
        <LookupProvider>
          <AccessGate>
            <AuthGate>
              <ShellHeaderProvider>
                <div className="flex h-screen w-full flex-col overflow-hidden">
                  <Header />
                  <ShellOutlet>
                    <Suspense fallback={<OutletFallback />}>
                      <Routes>
                        <Route index element={<HomeRedirect />} />
                        <Route path="/typing" element={isMobile ? <TapPage /> : <TypingPage />} />
                        <Route path="/gallery" element={isMobile ? <TapPage /> : <GalleryPage />} />
                        <Route path="/tap" element={<TapPage />} />
                        <Route path="/dictionary" element={<DictionaryPage />} />
                        <Route path="/word-lists" element={<CustomDictPage />} />
                        <Route path="/conjugation" element={<ConjugationPage />} />
                        <Route path="/grammar-session" element={<GrammarSessionPage />} />
                        <Route path="/tenses" element={<TensesPage />} />
                        <Route path="/tenses/:lessonId" element={<TensesPage />} />
                        <Route path="/study-plan" element={<RequireAccount pageName="学习计划"><StudyPlanPage /></RequireAccount>} />
                        <Route path="/placement-test" element={<RequireAccount pageName="定级测试"><PlacementTestPage /></RequireAccount>} />
                        <Route path="/admin" element={<AdminRouteGate><AdminHomePage /></AdminRouteGate>} />
                        <Route
                          path="/admin/placement"
                          element={
                            <AdminRouteGate>
                              <AdminPlacementPage />
                            </AdminRouteGate>
                          }
                        />
                        <Route path="/recalls" element={<ExamRecallsPage />} />
                        <Route
                          path="/admin/recalls"
                          element={
                            <AdminRouteGate>
                              <AdminRecallsPage />
                            </AdminRouteGate>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <AdminRouteGate>
                              <AdminUsersPage />
                            </AdminRouteGate>
                          }
                        />
                        <Route path="/tcf" element={<RequireAccount pageName="TCF 总览"><TcfHubPage /></RequireAccount>} />
                        <Route path="/tcf/full-mock" element={<RequireAccount pageName="TCF 完整模考"><TcfFullMockPage /></RequireAccount>} />
                        <Route path="/echelle" element={<RequireAccount pageName="能力量表"><EchelleQuebecoisePage /></RequireAccount>} />
                        <Route path="/levels" element={<RequireAccount pageName="等级课程"><LevelsPage /></RequireAccount>} />
                        <Route path="/levels/review" element={<RequireAccount pageName="课程复习"><LevelReviewPage /></RequireAccount>} />
                        <Route path="/levels/:level" element={<RequireAccount pageName="等级课程"><LevelDetailPage /></RequireAccount>} />
                        <Route path="/tcf-listening" element={<TcfListeningPage />} />
                        <Route path="/tcf-reading" element={<TcfReadingPage />} />
                        <Route path="/tcf-writing" element={<RequireAccount pageName="TCF 写作"><TcfWritingPage /></RequireAccount>} />
                        <Route path="/tcf-speaking" element={<RequireAccount pageName="TCF 口语"><TcfSpeakingPage /></RequireAccount>} />
                        <Route path="/analysis" element={<RequireAccount pageName="统计"><AnalysisPage /></RequireAccount>} />
                        <Route path="/error-book" element={<RequireAccount pageName="错题本"><ErrorBookPage /></RequireAccount>} />
                        <Route path="/billing" element={<BillingPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </ShellOutlet>
                </div>
                <Suspense fallback={null}>
                  <FocusTimerDock />
                </Suspense>
              </ShellHeaderProvider>
            </AuthGate>
          </AccessGate>
        </LookupProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')
container && createRoot(container).render(<Root />)
