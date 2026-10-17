import { PlayerControls } from './PlayerControls'
import { VideoCard } from './VideoCard'
import { YouTubePlayer } from './YouTubePlayer'
import {
  ListeningAccumulator,
  calculateSeekTarget,
  cyclePlaybackRate,
  filterLessons,
  loadAllProgress,
  loadVideoProgress,
  recordListeningMinutes,
  resolveListeningStudyTask,
  saveVideoProgress,
  shouldLoopAB,
} from './helpers'
import type { YouTubePlayerInstance } from './types'
import Layout from '@/components/Layout'
import { VIDEO_LESSONS, type VideoLesson } from '@/resources/videoLessons'
import { trackAnalyticsEvent } from '@/utils/analytics'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconHeadphones from '~icons/tabler/headphones'
import IconSearch from '~icons/tabler/search'

const ACCENT_OPTIONS = ['全部', 'Québec', 'Canada', 'France'] as const
const LEVEL_OPTIONS = ['全部', 'B1', 'B2'] as const

export default function VideoListeningPage() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentSlug = id || searchParams.get('v') || ''
  const selectedLesson = useMemo<VideoLesson | null>(() => {
    if (!currentSlug) return null
    return VIDEO_LESSONS.find((lesson) => lesson.id === currentSlug || lesson.youtubeId === currentSlug) ?? null
  }, [currentSlug])

  // Filters state for List View
  const [accentFilter, setAccentFilter] = useState<string>('全部')
  const [levelFilter, setLevelFilter] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Local progress state
  const [allProgress, setAllProgress] = useState(() => loadAllProgress())

  // Player state
  const playerRef = useRef<YouTubePlayerInstance | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [pointA, setPointA] = useState<number | null>(null)
  const [pointB, setPointB] = useState<number | null>(null)
  const accumulatorRef = useRef<ListeningAccumulator | null>(null)
  const hasTrackedVideoListenRef = useRef(false)

  // Sync progress from localStorage on mount and route changes
  useEffect(() => {
    setAllProgress(loadAllProgress())
  }, [selectedLesson?.id])

  // Reset player state when selected lesson changes
  useEffect(() => {
    setPlayerReady(false)
    setCurrentTime(0)
    setPlaybackRate(1)
    setCaptionsEnabled(true)
    setPointA(null)
    setPointB(null)
  }, [selectedLesson?.id])

  // Credit actual listening time via accumulator
  useEffect(() => {
    if (!selectedLesson) {
      if (accumulatorRef.current) {
        accumulatorRef.current.onLeave()
        accumulatorRef.current = null
      }
      return
    }

    const { dateKey, taskId } = resolveListeningStudyTask(searchParams, 'video-listening')
    hasTrackedVideoListenRef.current = false

    const accumulator = new ListeningAccumulator({
      onFlush: (minutes) => {
        recordListeningMinutes(dateKey, taskId, minutes)
      },
    })
    accumulatorRef.current = accumulator

    const handlePageHide = () => {
      accumulator.onLeave()
    }
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      accumulator.onLeave()
      accumulatorRef.current = null
    }
  }, [selectedLesson?.id, searchParams])

  // Check if current lesson is completed
  const isLessonCompleted = Boolean(selectedLesson && allProgress[selectedLesson.id]?.completed)

  const handleToggleCompleted = useCallback(
    (checked: boolean) => {
      if (!selectedLesson) return
      const updated = saveVideoProgress(selectedLesson.id, { completed: checked })
      setAllProgress(updated)
    },
    [selectedLesson],
  )

  const handlePlayerReady = useCallback(
    (player: YouTubePlayerInstance) => {
      playerRef.current = player
      setPlayerReady(true)

      if (selectedLesson) {
        const saved = loadVideoProgress(selectedLesson.id)
        if (saved?.lastTime && saved.lastTime > 2) {
          const minTime = selectedLesson.start ?? 0
          const maxTime = selectedLesson.end ?? Number.POSITIVE_INFINITY
          if (saved.lastTime >= minTime && saved.lastTime < maxTime - 5) {
            try {
              player.seekTo(saved.lastTime, false)
            } catch {
              // Ignore seek failures during initialization
            }
          }
        }
      }
    },
    [selectedLesson],
  )

  const handleStateChange = useCallback(
    (state: number) => {
      if (state === 1) {
        accumulatorRef.current?.onPlay()
      } else {
        accumulatorRef.current?.onPause()
      }

      if (!hasTrackedVideoListenRef.current && accumulatorRef.current && accumulatorRef.current.getTotalPlaybackSeconds() >= 60) {
        hasTrackedVideoListenRef.current = true
        trackAnalyticsEvent('video_listen')
      }

      if (state === 2 && playerRef.current && selectedLesson) {
        try {
          const cur = playerRef.current.getCurrentTime()
          saveVideoProgress(selectedLesson.id, { lastTime: cur })
        } catch {
          // ignore
        }
      }
    },
    [selectedLesson],
  )

  // 250ms polling loop for A-B repeat and time tracking
  useEffect(() => {
    if (!playerReady || !selectedLesson) return

    const interval = setInterval(() => {
      if (!playerRef.current) return
      try {
        const cur = playerRef.current.getCurrentTime()
        if (Number.isFinite(cur)) {
          setCurrentTime(cur)

          // A-B loop check
          if (shouldLoopAB(cur, pointA, pointB)) {
            playerRef.current.seekTo(pointA ?? 0, true)
          }
        }
      } catch {
        // Player might be switching or destroyed
      }

      if (!hasTrackedVideoListenRef.current && accumulatorRef.current && accumulatorRef.current.getTotalPlaybackSeconds() >= 60) {
        hasTrackedVideoListenRef.current = true
        trackAnalyticsEvent('video_listen')
      }
    }, 250)

    return () => clearInterval(interval)
  }, [playerReady, selectedLesson, pointA, pointB])

  // Periodically persist playback position to localStorage
  const roundedTime = Math.floor(currentTime)
  useEffect(() => {
    if (!playerReady || !selectedLesson || roundedTime <= 1) return

    const timer = setTimeout(() => {
      saveVideoProgress(selectedLesson.id, { lastTime: currentTime })
    }, 2000)

    return () => clearTimeout(timer)
  }, [playerReady, selectedLesson, roundedTime, currentTime])

  // Speed change handler
  const handleChangePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate)
    try {
      if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(rate)
      }
    } catch {
      // Ignore
    }
  }, [])

  // Seek back handler
  const handleSeekBack = useCallback(
    (deltaSeconds: number) => {
      if (!playerRef.current || !selectedLesson) return
      try {
        const cur = playerRef.current.getCurrentTime()
        const target = calculateSeekTarget(cur, -deltaSeconds, selectedLesson.start, selectedLesson.end)
        playerRef.current.seekTo(target, true)
        setCurrentTime(target)
      } catch {
        // Ignore
      }
    },
    [selectedLesson],
  )

  // A-B Repeat set actions
  const handleSetPointA = useCallback(() => {
    if (!playerRef.current) return
    try {
      const cur = playerRef.current.getCurrentTime()
      setPointA(cur)
      setPointB((prevB) => (prevB !== null && prevB <= cur ? null : prevB))
    } catch {
      // Ignore
    }
  }, [])

  const handleSetPointB = useCallback(() => {
    if (!playerRef.current) return
    try {
      const cur = playerRef.current.getCurrentTime()
      if (pointA !== null && cur > pointA) {
        setPointB(cur)
      }
    } catch {
      // Ignore
    }
  }, [pointA])

  const handleClearAB = useCallback(() => {
    setPointA(null)
    setPointB(null)
  }, [])

  // Captions toggle handler using official loadModule/unloadModule
  const handleToggleCaptions = useCallback(() => {
    if (!playerRef.current) return
    const nextState = !captionsEnabled
    setCaptionsEnabled(nextState)

    try {
      if (nextState) {
        if (typeof playerRef.current.loadModule === 'function') {
          playerRef.current.loadModule('captions')
        }
      } else {
        if (typeof playerRef.current.unloadModule === 'function') {
          playerRef.current.unloadModule('captions')
        }
      }
    } catch {
      // Ignore
    }
  }, [captionsEnabled])

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!selectedLesson || !playerReady) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) {
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        try {
          if (playerRef.current) {
            const state = playerRef.current.getPlayerState()
            if (state === 1) {
              playerRef.current.pauseVideo()
            } else {
              playerRef.current.playVideo()
            }
          }
        } catch {
          // Ignore
        }
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleSeekBack(5)
        return
      }

      if (event.key === 'a' || event.key === 'A') {
        handleSetPointA()
        return
      }

      if (event.key === 'b' || event.key === 'B') {
        handleSetPointB()
        return
      }

      if (event.key === 's' || event.key === 'S') {
        const nextRate = cyclePlaybackRate(playbackRate)
        handleChangePlaybackRate(nextRate)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLesson, playerReady, playbackRate, handleSeekBack, handleSetPointA, handleSetPointB, handleChangePlaybackRate])

  // Filtered lessons for list display
  const filteredLessons = useMemo(() => {
    return filterLessons(VIDEO_LESSONS, {
      accent: accentFilter,
      level: levelFilter,
      query: searchQuery,
    })
  }, [accentFilter, levelFilter, searchQuery])

  return (
    <Layout>
      <div className="w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* PLAYER VIEW: Shown when a valid lesson is active          */}
        {/* ========================================================= */}
        {selectedLesson ? (
          <div className="flex flex-col gap-6">
            {/* Top Navigation Bar in Player View */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/video-listening')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-900/5 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-gray-700 sm:text-sm"
              >
                <IconArrowLeft className="h-4 w-4" />
                <span>返回视频列表</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {selectedLesson.accent === 'Québec'
                    ? '⚜️ 魁北克口音'
                    : selectedLesson.accent === 'Canada'
                    ? '🍁 加拿大口音'
                    : '🇫🇷 法国口音'}
                </span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {selectedLesson.level}
                </span>
              </div>
            </div>

            {/* YouTube 16:9 Video Player */}
            <div>
              <YouTubePlayer
                lesson={selectedLesson}
                onReady={handlePlayerReady}
                onStateChange={handleStateChange}
              />

              {/* Player Controls Under Player */}
              <PlayerControls
                currentTime={currentTime}
                pointA={pointA}
                pointB={pointB}
                onSetPointA={handleSetPointA}
                onSetPointB={handleSetPointB}
                onClearAB={handleClearAB}
                playbackRate={playbackRate}
                onChangePlaybackRate={handleChangePlaybackRate}
                onSeekBack={handleSeekBack}
                captionsEnabled={captionsEnabled}
                onToggleCaptions={handleToggleCaptions}
                isCompleted={isLessonCompleted}
                onToggleCompleted={handleToggleCompleted}
                playerReady={playerReady}
                lastSavedTime={allProgress[selectedLesson.id]?.lastTime}
              />
            </div>

            {/* Video Metadata, Tips and Footer Under Player */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
              <div className="flex flex-col gap-2">
                <h1 className="text-lg font-bold text-gray-950 dark:text-white sm:text-xl">{selectedLesson.title}</h1>
                <p className="text-sm italic text-gray-600 dark:text-gray-300">{selectedLesson.titleFr}</p>
              </div>

              {/* Learning Notes / Tips */}
              {selectedLesson.notes && (
                <div className="mt-4 rounded-xl bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-500/20 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-500/20 sm:text-sm">
                  <div className="font-semibold text-amber-950 dark:text-amber-100">💡 学习提示与听力要点</div>
                  <p className="mt-1">{selectedLesson.notes}</p>
                </div>
              )}

              {/* Topics Tags */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {selectedLesson.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
                  >
                    #{topic}
                  </span>
                ))}
              </div>

              {/* Footer under player: channel attribution & external link */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-700/60 dark:text-gray-400 sm:text-sm">
                <div>
                  频道归属：
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLesson.channel}</span>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedLesson.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span>在 YouTube 打开 ↗</span>
                </a>
              </div>
            </div>

            {/* Other lessons section: keeps video list browsable under player view */}
            <div className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-950 dark:text-white sm:text-lg">精选法语视频推荐</h3>
                <Link to="/video-listening" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  查看全部视频 ({VIDEO_LESSONS.length}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {VIDEO_LESSONS.filter((item) => item.id !== selectedLesson.id)
                  .slice(0, 3)
                  .map((item) => (
                    <VideoCard key={item.id} lesson={item} progress={allProgress[item.id]} />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* LIST VIEW: Catalog of all curated video listening lessons */
          /* ========================================================= */
          <div className="flex flex-col gap-6">
            {/* Header / Intro */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 p-6 shadow-sm ring-1 ring-indigo-500/10 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 dark:ring-white/10 sm:p-8">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                <IconHeadphones className="h-3.5 w-3.5" />
                <span>真实语料精听</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">视频听力</h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-sm sm:leading-relaxed">
                精选加拿大魁北克与法国真实新闻、演讲与访谈语料，提供慢速、A-B 复读与盲听对照模式，帮助攻克魁北克口音与真实语速，突破 TCF
                Canada 听力理解难关。
              </p>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Accent Filter */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                  <span className="mr-1 font-semibold text-gray-500 dark:text-gray-400">口音：</span>
                  {ACCENT_OPTIONS.map((opt) => {
                    const active = accentFilter === opt
                    const label = opt === 'Québec' ? '魁北克' : opt === 'Canada' ? '加拿大' : opt === 'France' ? '法国' : '全部'
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAccentFilter(opt)}
                        className={`rounded-full px-3 py-1 font-medium transition ${
                          active
                            ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Level Filter */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                  <span className="mr-1 font-semibold text-gray-500 dark:text-gray-400">难度：</span>
                  {LEVEL_OPTIONS.map((lvl) => {
                    const active = levelFilter === lvl
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevelFilter(lvl)}
                        className={`rounded-full px-3 py-1 font-medium transition ${
                          active
                            ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索视频标题、主题或频道…"
                  className="w-full rounded-xl border-0 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-400 dark:focus:ring-indigo-400 sm:text-sm"
                />
              </div>
            </div>

            {/* Video Cards Grid */}
            {filteredLessons.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLessons.map((lesson) => (
                  <VideoCard key={lesson.id} lesson={lesson} progress={allProgress[lesson.id]} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
                <p className="text-sm text-gray-500 dark:text-gray-400">没有找到符合条件的精选视频</p>
                <button
                  type="button"
                  onClick={() => {
                    setAccentFilter('全部')
                    setLevelFilter('全部')
                    setSearchQuery('')
                  }}
                  className="mt-3 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  重置筛选条件
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
