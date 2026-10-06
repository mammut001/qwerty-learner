import {
  type FocusTimerSnapshot,
  clearFocusTimer,
  finishFocusTimer,
  focusTimerRecordedMinutes,
  getFocusTimerSnapshot,
  pauseFocusTimer,
  resumeFocusTimer,
  subscribeFocusTimer,
} from '@/services/focusTimer'
import { useEffect, useState } from 'react'

const timeLabel = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

const pauseLabel: Record<string, string> = {
  manual: '已暂停',
  hidden: '页面隐藏，已自动暂停',
  idle: '长时间无输入，已自动暂停',
}

export default function FocusTimerDock() {
  const [snapshot, setSnapshot] = useState<FocusTimerSnapshot | null>(() => getFocusTimerSnapshot())

  useEffect(() => subscribeFocusTimer(setSnapshot), [])
  if (!snapshot) return null

  return (
    <aside
      data-testid="focus-timer-dock"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-indigo-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-indigo-900 dark:bg-gray-900/95"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-300">专注计时</div>
          <div className="mt-1 truncate font-semibold text-gray-950 dark:text-white">{snapshot.title}</div>
          <div className="mt-2 font-mono text-3xl tabular-nums text-gray-950 dark:text-white">{timeLabel(snapshot.remainingMs)}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            有效专注 {Math.floor(snapshot.activeMs / 60000)} min
            {snapshot.status === 'paused' && snapshot.pauseReason ? ` · ${pauseLabel[snapshot.pauseReason]}` : ''}
            {snapshot.status === 'finished' ? ` · 已记录 ${focusTimerRecordedMinutes(snapshot)} min` : ''}
          </div>
        </div>
        {snapshot.status === 'finished' && (
          <button
            type="button"
            onClick={clearFocusTimer}
            aria-label="关闭专注计时器"
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ×
          </button>
        )}
      </div>

      {snapshot.status !== 'finished' && (
        <div className="mt-4 flex gap-2">
          {snapshot.status === 'running' ? (
            <button
              type="button"
              onClick={() => pauseFocusTimer('manual')}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-200"
            >
              暂停
            </button>
          ) : (
            <button
              type="button"
              onClick={() => resumeFocusTimer()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              继续
            </button>
          )}
          <button
            type="button"
            onClick={() => finishFocusTimer()}
            className="ml-auto rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:text-gray-200"
          >
            结束并记录
          </button>
        </div>
      )}
    </aside>
  )
}
