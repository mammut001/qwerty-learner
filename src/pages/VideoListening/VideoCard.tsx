import type { VideoProgress } from './helpers'
import type { VideoLesson } from '@/resources/videoLessons'
import type React from 'react'
import { Link } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'
import IconClock from '~icons/tabler/clock'

interface VideoCardProps {
  lesson: VideoLesson
  progress?: VideoProgress | null
}

const ACCENT_LABELS: Record<string, { label: string; flag: string; style: string }> = {
  Québec: {
    label: '魁北克',
    flag: '⚜️',
    style: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/30',
  },
  Canada: {
    label: '加拿大',
    flag: '🍁',
    style: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-400/30',
  },
  France: {
    label: '法国',
    flag: '🇫🇷',
    style: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-400/30',
  },
}

export const VideoCard: React.FC<VideoCardProps> = ({ lesson, progress }) => {
  const isCompleted = Boolean(progress?.completed)
  const accentMeta = ACCENT_LABELS[lesson.accent] ?? {
    label: lesson.accent,
    flag: '🌐',
    style: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  }

  const thumbnailUrl = `https://i.ytimg.com/vi/${lesson.youtubeId}/mqdefault.jpg`

  return (
    <Link
      to={`/video-listening/${lesson.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-500/30 dark:bg-gray-800 dark:ring-white/10 dark:hover:ring-indigo-400/30"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        <img
          src={thumbnailUrl}
          alt={lesson.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Duration badge on bottom-right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
          <IconClock className="h-3 w-3" />
          <span>{lesson.durationLabel}</span>
        </div>

        {/* Level badge on top-left */}
        <div className="absolute left-2 top-2">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold shadow-sm ${
              lesson.level === 'B1' ? 'bg-emerald-700 text-white' : 'bg-amber-700 text-white'
            }`}
          >
            {lesson.level}
          </span>
        </div>

        {/* Completed indicator badge on top-right */}
        {isCompleted && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-emerald-700/90 px-2 py-0.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
            <IconCheck className="h-3.5 w-3.5" />
            <span>已完成</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Accent and Captions chips */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${accentMeta.style}`}
            >
              <span>{accentMeta.flag}</span>
              <span>{accentMeta.label}</span>
            </span>

            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                lesson.captions === 'human'
                  ? 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-400/30'
                  : 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-400/20'
              }`}
            >
              {lesson.captions === 'human' ? '人工字幕' : '自动字幕'}
            </span>
          </div>

          {/* Chinese Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-base">
            {lesson.title}
          </h3>

          {/* French Subtitle */}
          <p className="mt-1 line-clamp-1 text-xs italic text-gray-500 dark:text-gray-400">{lesson.titleFr}</p>
        </div>

        {/* Channel and Attribution */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-500 dark:border-gray-700/60 dark:text-gray-400">
          <span className="truncate font-medium">{lesson.channel}</span>
          <span className="shrink-0 text-indigo-600 transition group-hover:translate-x-0.5 dark:text-indigo-400">练习 →</span>
        </div>
      </div>
    </Link>
  )
}

export default VideoCard
