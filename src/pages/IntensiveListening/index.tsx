import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import { INTENSIVE_PASSAGES } from '@/resources/intensiveListening'
import type { SentenceSegment } from '@/services/intensiveListeningAudio'
import { loadIntensiveManifest } from '@/services/intensiveListeningAudio'
import { PassageCard } from './PassageCard'
import { PlayerControls } from './PlayerControls'
import { TranscriptView } from './TranscriptView'
import { VocabAndQuiz } from './VocabAndQuiz'
import {
  findCurrentSentenceIndex,
  getCompletedPassageIds,
  getNextSentenceIndex,
  getPrevSentenceIndex,
  markPassageCompleted,
  resolveIntensiveAudioCandidates,
  shouldFallbackAudioCandidate,
  shouldLoopCurrentSentence,
} from './helpers'
import type { IntensiveLevelFilter, IntensiveListeningManifest, Passage } from './types'

export const IntensiveListeningPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  // Manifest cache & state
  const [manifest, setManifest] = useState<IntensiveListeningManifest | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => getCompletedPassageIds())

  // Filter state for list view
  const [levelFilter, setLevelFilter] = useState<IntensiveLevelFilter>('ALL')

  // Load manifest on mount
  useEffect(() => {
    let cancelled = false
    loadIntensiveManifest().then((data) => {
      if (!cancelled && data) {
        setManifest(data)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Find active passage if id param is present
  const activePassage = useMemo<Passage | null>(() => {
    if (!id) return null
    return INTENSIVE_PASSAGES.find((p) => p.id === id) ?? null
  }, [id])

  // Manifest item for the active passage
  const manifestItem = useMemo(() => {
    if (!activePassage || !manifest?.items) return null
    return manifest.items[activePassage.id] ?? null
  }, [activePassage, manifest])

  const audioCandidates = useMemo(() => {
    if (!activePassage || !manifest) return []
    return resolveIntensiveAudioCandidates(activePassage.id, manifest)
  }, [activePassage, manifest])

  const segments = useMemo<SentenceSegment[]>(() => {
    return manifestItem?.segments ?? []
  }, [manifestItem])

  const isAudioPending = !manifestItem || !manifestItem.key || audioCandidates.length === 0

  // Audio & Player playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0)
  const [isLooping, setIsLooping] = useState(false)
  const [showChinese, setShowChinese] = useState(true)
  const [showFrench, setShowFrench] = useState(true)

  // Reset playback when passage changes
  useEffect(() => {
    setCandidateIndex(0)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setActiveSentenceIndex(0)
    setIsLooping(false)
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        if (Number.isFinite(audioRef.current.currentTime) && audioRef.current.currentTime !== 0) {
          audioRef.current.currentTime = 0
        }
      } catch {
        // Ignore playback reset error during passage unmount/change
      }
    }
  }, [activePassage?.id])

  // Fallback to next audio source ONLY if current candidate suffers a real fatal error
  const handleAudioError = useCallback(
    (e?: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const audio = e?.currentTarget || audioRef.current
      const mediaError = audio?.error ?? null
      if (shouldFallbackAudioCandidate(candidateIndex, audioCandidates.length, mediaError)) {
        setCandidateIndex((prev) => prev + 1)
      }
    },
    [candidateIndex, audioCandidates.length],
  )

  // Sync playback rate to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Audio event handlers
  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    const time = audio.currentTime
    setCurrentTime(time)

    // Check single-sentence loop condition
    const currentSeg = segments[activeSentenceIndex]
    if (shouldLoopCurrentSentence(time, currentSeg, isLooping)) {
      audio.currentTime = currentSeg.start
      void audio.play()
      return
    }

    // Binary search for active sentence
    if (segments.length > 0) {
      const foundIdx = findCurrentSentenceIndex(time, segments)
      if (foundIdx !== -1 && foundIdx !== activeSentenceIndex) {
        setActiveSentenceIndex(foundIdx)
      }
    }
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (activePassage) {
      markPassageCompleted(activePassage.id)
      setCompletedIds(getCompletedPassageIds())
    }
  }

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || isAudioPending) return

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [isAudioPending])

  // Seek to specific time
  const handleSeek = useCallback(
    (time: number) => {
      const audio = audioRef.current
      if (!audio || isAudioPending) return
      audio.currentTime = time
      setCurrentTime(time)
      if (segments.length > 0) {
        const found = findCurrentSentenceIndex(time, segments)
        if (found !== -1) setActiveSentenceIndex(found)
      }
    },
    [isAudioPending, segments],
  )

  // Seek to a sentence by index
  const handleSelectSentence = useCallback(
    (index: number) => {
      setActiveSentenceIndex(index)
      const audio = audioRef.current
      if (!audio || isAudioPending) return

      const seg = segments[index]
      if (seg) {
        audio.currentTime = seg.start
        setCurrentTime(seg.start)
      }
      if (audio.paused) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    },
    [isAudioPending, segments],
  )

  const handlePrevSentence = useCallback(() => {
    if (activeSentenceIndex <= 0) return
    const prevIdx = getPrevSentenceIndex(activeSentenceIndex)
    handleSelectSentence(prevIdx)
  }, [activeSentenceIndex, handleSelectSentence])

  const handleNextSentence = useCallback(() => {
    if (!activePassage || activeSentenceIndex >= activePassage.sentences.length - 1) return
    const nextIdx = getNextSentenceIndex(activeSentenceIndex, activePassage.sentences.length)
    handleSelectSentence(nextIdx)
  }, [activePassage, activeSentenceIndex, handleSelectSentence])

  const handleToggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev)
  }, [])

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!activePassage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        handleTogglePlay()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        handlePrevSentence()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        handleNextSentence()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleToggleLoop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePassage, handleTogglePlay, handlePrevSentence, handleNextSentence, handleToggleLoop])

  // Filtered passages for list view
  const filteredPassages = useMemo(() => {
    if (levelFilter === 'ALL') return INTENSIVE_PASSAGES
    return INTENSIVE_PASSAGES.filter((p) => p.level === levelFilter)
  }, [levelFilter])

  // --- RENDER 1: Not found screen ---
  if (id && !activePassage) {
    return (
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">未找到该精听语篇</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            请检查网址或返回语篇列表选择其他练习。
          </p>
          <button
            type="button"
            onClick={() => navigate('/intensive-listening')}
            className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            ← 返回精听列表
          </button>
        </div>
      </Layout>
    )
  }

  // --- RENDER 2: Player View (/intensive-listening/:id) ---
  if (activePassage) {
    const isCompleted = completedIds.has(activePassage.id)
    const isDialogue = Boolean(activePassage.speakers?.B)
    const currentCandidate = audioCandidates[candidateIndex] || ''

    return (
      <Layout>
        <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 overflow-x-hidden">
        {/* Hidden Audio Element */}
        {currentCandidate && (
          <audio
            key={activePassage.id}
            ref={audioRef}
            src={currentCandidate}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={handleAudioError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Back Link & Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
          <Link
            to="/intensive-listening"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>← 返回语篇列表</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {activePassage.topic}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                activePassage.level === 'B1'
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
              }`}
            >
              {activePassage.level}
            </span>
            {isCompleted && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                ✓ 已完成
              </span>
            )}
          </div>
        </div>

        {/* Passage Title Banner */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {activePassage.title}
          </h1>
          <p className="mt-0.5 text-xs md:text-sm italic text-gray-500 dark:text-gray-400">
            {activePassage.titleFr}
          </p>
        </div>

        {/* Mobile Sticky Player Bar (visible on phone, hidden on desktop) */}
        <div className="lg:hidden sticky top-2 z-20 mb-4">
          <PlayerControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrevSentence={handlePrevSentence}
            onNextSentence={handleNextSentence}
            canPrev={activeSentenceIndex > 0}
            canNext={activeSentenceIndex < activePassage.sentences.length - 1}
            isLooping={isLooping}
            onToggleLoop={handleToggleLoop}
            playbackRate={playbackRate}
            onChangePlaybackRate={setPlaybackRate}
            showChinese={showChinese}
            onToggleChinese={() => setShowChinese((prev) => !prev)}
            showFrench={showFrench}
            onToggleFrench={() => setShowFrench((prev) => !prev)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            currentSentenceIndex={activeSentenceIndex}
            totalSentences={activePassage.sentences.length}
            isAudioPending={isAudioPending}
            className="shadow-md"
          />
        </div>

        {/* Desktop 2-Column Grid (Player Left, Transcript Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Column: Sticky Controls */}
          <div className="hidden lg:block lg:col-span-5 sticky top-6 space-y-4">
            <PlayerControls
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onPrevSentence={handlePrevSentence}
              onNextSentence={handleNextSentence}
              canPrev={activeSentenceIndex > 0}
              canNext={activeSentenceIndex < activePassage.sentences.length - 1}
              isLooping={isLooping}
              onToggleLoop={handleToggleLoop}
              playbackRate={playbackRate}
              onChangePlaybackRate={setPlaybackRate}
              showChinese={showChinese}
              onToggleChinese={() => setShowChinese((prev) => !prev)}
              showFrench={showFrench}
              onToggleFrench={() => setShowFrench((prev) => !prev)}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              currentSentenceIndex={activeSentenceIndex}
              totalSentences={activePassage.sentences.length}
              isAudioPending={isAudioPending}
            />

            {/* Hint Box */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 leading-relaxed dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">💡 精听使用技巧：</span>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                <li>点击右侧任意句子可精准跳转播放。</li>
                <li>开启「盲听」隐藏原文，听完后再核对文本。</li>
                <li>开启「单句循环」攻克连音与魁北克特色表达。</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Transcript View */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-700/60">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">原文对照</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">点击单词查词 · 点击句子即刻跳转播放</span>
              </div>

              <TranscriptView
                sentences={activePassage.sentences}
                segments={segments}
                activeIndex={activeSentenceIndex}
                onSelectSentence={handleSelectSentence}
                showChinese={showChinese}
                showFrench={showFrench}
                isDialogue={isDialogue}
                isAudioPending={isAudioPending}
                className="max-h-[560px]"
              />
            </div>
          </div>
        </div>

        {/* Below: 重点词汇 & 理解题 */}
        <div className="mt-8">
          <VocabAndQuiz
            vocabList={activePassage.vocab}
            questions={activePassage.questions}
            onAllQuestionsCorrect={() => {
              markPassageCompleted(activePassage.id)
              setCompletedIds(getCompletedPassageIds())
            }}
          />
        </div>
      </div>
    </Layout>
  )
  }

  // --- RENDER 3: List View (/intensive-listening) ---
  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Header Banner */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-400/30">
          <span>🎧</span>
          <span>每日法语听力体验 · 句级同步</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          精听 — 魁北克原篇语料
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
          独家原创魁北克生活、租房、职场与社会话题。基于 Google Chirp 3 HD 原生加拿大法语合成，毫秒级句级同步高亮，支持单句循环、盲听测试与重点词汇跟读。
        </p>

        {/* Level Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'ALL', label: `全部 (${INTENSIVE_PASSAGES.length})` },
              {
                key: 'B1',
                label: `B1 基础 (${INTENSIVE_PASSAGES.filter((p) => p.level === 'B1').length})`,
              },
              {
                key: 'B2',
                label: `B2 进阶 (${INTENSIVE_PASSAGES.filter((p) => p.level === 'B2').length})`,
              },
            ] as const
          ).map((tab) => {
            const isActive = levelFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setLevelFilter(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPassages.map((passage) => (
          <PassageCard
            key={passage.id}
            passage={passage}
            isCompleted={completedIds.has(passage.id)}
          />
        ))}
      </div>
    </div>
  </Layout>
  )
}

export default IntensiveListeningPage
