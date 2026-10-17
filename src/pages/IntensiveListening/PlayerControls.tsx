import type React from 'react'
import { cycleSpeed, formatSeconds } from './helpers'

interface PlayerControlsProps {
  isPlaying: boolean
  onTogglePlay: () => void
  onPrevSentence: () => void
  onNextSentence: () => void
  canPrev: boolean
  canNext: boolean
  isLooping: boolean
  onToggleLoop: () => void
  playbackRate: number
  onChangePlaybackRate: (rate: number) => void
  showChinese: boolean
  onToggleChinese: () => void
  showFrench: boolean
  onToggleFrench: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  currentSentenceIndex: number
  totalSentences: number
  isAudioPending: boolean
  className?: string
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevSentence,
  onNextSentence,
  canPrev,
  canNext,
  isLooping,
  onToggleLoop,
  playbackRate,
  onChangePlaybackRate,
  showChinese,
  onToggleChinese,
  showFrench,
  onToggleFrench,
  currentTime,
  duration,
  onSeek,
  currentSentenceIndex,
  totalSentences,
  isAudioPending,
  className = '',
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = parseFloat(e.target.value)
    if (Number.isFinite(nextTime)) {
      onSeek(nextTime)
    }
  }

  const handleCycleSpeed = () => {
    onChangePlaybackRate(cycleSpeed(playbackRate))
  }

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const progressPercent = safeDuration > 0 ? Math.min(100, Math.max(0, (currentTime / safeDuration) * 100)) : 0

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Top Meta & Toggle Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-400/30">
            第 {Math.min(currentSentenceIndex + 1, totalSentences)} / {totalSentences} 句
          </span>

          {isAudioPending && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-400/30"
              title="音频正在由云端生成中"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>音频生成中</span>
            </span>
          )}
        </div>

        {/* View & Rate Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            disabled={isAudioPending}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 font-mono font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            title="点击切换播放语速"
          >
            {playbackRate}x
          </button>

          {/* Chinese Translation Toggle */}
          <button
            type="button"
            onClick={onToggleChinese}
            className={`rounded-lg border px-2 py-1 font-medium transition ${
              showChinese
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            title="显示或隐藏中文译文"
          >
            中文{showChinese ? '开' : '关'}
          </button>

          {/* French Blind Mode Toggle */}
          <button
            type="button"
            onClick={onToggleFrench}
            className={`rounded-lg border px-2 py-1 font-medium transition ${
              !showFrench
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="盲听模式：隐藏法文原文，仅显示占位符"
          >
            {!showFrench ? '盲听中' : '盲听'}
          </button>
        </div>
      </div>

      {/* Seek Scrubber & Times */}
      <div className="mt-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={safeDuration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSliderChange}
            disabled={isAudioPending || safeDuration === 0}
            aria-label="音频播放进度"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600 disabled:cursor-not-allowed dark:bg-gray-700"
            style={{
              background: `linear-gradient(to right, #4f46e5 ${progressPercent}%, #e5e7eb ${progressPercent}%)`,
            }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(safeDuration)}</span>
        </div>
      </div>

      {/* Main Playback Buttons */}
      <div className="mt-3 flex items-center justify-between">
        {/* Loop Toggle */}
        <button
          type="button"
          onClick={onToggleLoop}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            isLooping
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-300 ring-1 ring-indigo-500/20'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title="单句循环 (快捷键: R)"
        >
          <span className="text-sm">🔁</span>
          <span className="hidden sm:inline">单句循环</span>
          <span className="sm:hidden">循环</span>
        </button>

        {/* Prev / Play / Next Group */}
        <div className="flex items-center gap-2">
          {/* Prev Sentence */}
          <button
            type="button"
            onClick={onPrevSentence}
            disabled={!canPrev || isAudioPending}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            title="上一句 (快捷键: ←)"
            aria-label="上一句"
          >
            <span className="text-sm font-bold">⏮</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={isAudioPending}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            title={isPlaying ? '暂停 (快捷键: 空格)' : '播放 (快捷键: 空格)'}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <span className="text-lg font-bold leading-none">⏸</span>
            ) : (
              <span className="ml-0.5 text-lg font-bold leading-none">▶</span>
            )}
          </button>

          {/* Next Sentence */}
          <button
            type="button"
            onClick={onNextSentence}
            disabled={!canNext || isAudioPending}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            title="下一句 (快捷键: →)"
            aria-label="下一句"
          >
            <span className="text-sm font-bold">⏭</span>
          </button>
        </div>

        {/* Keyboard Shortcut Indicator */}
        <div className="hidden lg:flex items-center text-[11px] text-gray-500 dark:text-gray-400">
          <span>Space 播放 · ←/→ 切句</span>
        </div>
      </div>
    </div>
  )
}
