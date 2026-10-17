import { formatSeconds } from './helpers'
import type React from 'react'
import IconEar from '~icons/tabler/ear'
import IconHeadphones from '~icons/tabler/headphones'
import IconKeyboard from '~icons/tabler/keyboard'
import IconRepeat from '~icons/tabler/repeat'
import IconX from '~icons/tabler/x'

interface PlayerControlsProps {
  currentTime: number
  pointA: number | null
  pointB: number | null
  onSetPointA: () => void
  onSetPointB: () => void
  onClearAB: () => void
  playbackRate: number
  onChangePlaybackRate: (rate: number) => void
  onSeekBack: (seconds: number) => void
  captionsEnabled: boolean
  onToggleCaptions: () => void
  isCompleted: boolean
  onToggleCompleted: (checked: boolean) => void
  playerReady: boolean
  lastSavedTime?: number
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTime,
  pointA,
  pointB,
  onSetPointA,
  onSetPointB,
  onClearAB,
  playbackRate,
  onChangePlaybackRate,
  onSeekBack,
  captionsEnabled,
  onToggleCaptions,
  isCompleted,
  onToggleCompleted,
  playerReady,
  lastSavedTime,
}) => {
  const isLooping = pointA !== null && pointB !== null && pointB > pointA

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Tip Banner */}
      <div className="flex items-center justify-between rounded-xl bg-indigo-50/80 px-4 py-2.5 text-xs text-indigo-800 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-400/20 sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>建议先盲听一遍，再打开字幕对照</span>
        </div>
        {lastSavedTime && lastSavedTime > 2 && (
          <span className="hidden text-xs text-indigo-600 dark:text-indigo-300 md:inline">上次学习至 {formatSeconds(lastSavedTime)}</span>
        )}
      </div>

      {/* Main Controls Grid (Large buttons on phone for 375px) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Speed Controls */}
        <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">语速调节</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[0.75, 1, 1.25].map((rate) => {
              const active = playbackRate === rate
              return (
                <button
                  key={rate}
                  type="button"
                  disabled={!playerReady}
                  onClick={() => onChangePlaybackRate(rate)}
                  className={`min-h-[44px] rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {rate}x
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Back Seek Controls */}
        <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">快退重听</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={!playerReady}
              onClick={() => onSeekBack(5)}
              className="min-h-[44px] rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-800 transition hover:bg-gray-200 active:scale-95 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              ⟲ 5 秒
            </button>
            <button
              type="button"
              disabled={!playerReady}
              onClick={() => onSeekBack(15)}
              className="min-h-[44px] rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-800 transition hover:bg-gray-200 active:scale-95 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              ⟲ 15 秒
            </button>
          </div>
        </div>

        {/* Captions / Blind Mode Toggle */}
        <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">字幕模式</span>
          <button
            type="button"
            disabled={!playerReady}
            onClick={onToggleCaptions}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition active:scale-95 disabled:opacity-50 ${
              !captionsEnabled
                ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-600'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
            }`}
          >
            {!captionsEnabled ? (
              <>
                <IconEar className="h-4 w-4" />
                <span>盲听模式（无字幕）</span>
              </>
            ) : (
              <>
                <IconHeadphones className="h-4 w-4" />
                <span>字幕：开（点击盲听）</span>
              </>
            )}
          </button>
        </div>

        {/* Completion Checkbox Card */}
        <div className="flex flex-col justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">学习进度</span>
          <label className="flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2 transition hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onToggleCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{isCompleted ? '✓ 已标记完成' : '标记为已完成'}</span>
          </label>
        </div>
      </div>

      {/* A-B Repeat Section */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <IconRepeat className={`h-5 w-5 ${isLooping ? 'animate-pulse text-indigo-600' : 'text-gray-400'}`} />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">A-B 单句 / 片段复读</h4>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            当前播放：<span className="font-mono font-medium text-gray-800 dark:text-gray-200">{formatSeconds(currentTime)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            disabled={!playerReady}
            onClick={onSetPointA}
            className={`min-h-[44px] flex-1 rounded-xl px-4 text-sm font-medium transition active:scale-95 disabled:opacity-50 sm:flex-initial ${
              pointA !== null
                ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400/50 dark:bg-indigo-950/60 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {pointA !== null ? `起点 A: ${formatSeconds(pointA)}` : '设起点 A'}
          </button>

          <button
            type="button"
            disabled={!playerReady || pointA === null}
            onClick={onSetPointB}
            className={`min-h-[44px] flex-1 rounded-xl px-4 text-sm font-medium transition active:scale-95 disabled:opacity-50 sm:flex-initial ${
              pointB !== null
                ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400/50 dark:bg-indigo-950/60 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {pointB !== null ? `终点 B: ${formatSeconds(pointB)}` : '设终点 B'}
          </button>

          {(pointA !== null || pointB !== null) && (
            <button
              type="button"
              onClick={onClearAB}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-gray-100 px-3 text-sm text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <IconX className="h-4 w-4" />
              <span>清除</span>
            </button>
          )}

          {isLooping && pointA !== null && pointB !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500" />
              正在循环：{formatSeconds(pointA)} - {formatSeconds(pointB)}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Keyboard Hints */}
      <div className="hidden items-center gap-4 rounded-xl bg-gray-50/80 px-4 py-2 text-xs text-gray-500 ring-1 ring-gray-900/5 dark:bg-gray-800/40 dark:text-gray-400 dark:ring-white/5 sm:flex">
        <IconKeyboard className="h-4 w-4 shrink-0 text-gray-400" />
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span>[空格] 播放/暂停</span>
          <span>[←] 后退5秒</span>
          <span>[A] 标记起点</span>
          <span>[B] 标记终点</span>
          <span>[S] 切换倍速</span>
        </div>
      </div>
    </div>
  )
}

export default PlayerControls
