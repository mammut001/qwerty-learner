export type { VideoAccent, VideoCaptionType, VideoLesson, VideoLevel } from '@/resources/videoLessons'
export type { VideoFilterOptions, VideoProgress, VideoProgressRecord } from './helpers'

export interface YouTubePlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  setPlaybackRate: (suggestedRate: number) => void
  getCurrentTime: () => number
  getPlayerState: () => number
  loadModule?: (moduleName: string) => void
  unloadModule?: (moduleName: string) => void
  destroy?: () => void
}
