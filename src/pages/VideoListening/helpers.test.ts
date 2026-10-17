import {
  calculateSeekTarget,
  cyclePlaybackRate,
  filterLessons,
  formatSeconds,
  loadAllProgress,
  loadVideoProgress,
  saveVideoProgress,
  shouldLoopAB,
} from './helpers'
import type { VideoLesson } from '@/resources/videoLessons'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('formatSeconds formats seconds to mm:ss or hh:mm:ss correctly', () => {
  assert.equal(formatSeconds(0), '00:00')
  assert.equal(formatSeconds(-10), '00:00')
  assert.equal(formatSeconds(Number.NaN), '00:00')
  assert.equal(formatSeconds(5), '00:05')
  assert.equal(formatSeconds(59), '00:59')
  assert.equal(formatSeconds(60), '01:00')
  assert.equal(formatSeconds(65), '01:05')
  assert.equal(formatSeconds(240), '04:00')
  assert.equal(formatSeconds(3599), '59:59')
  assert.equal(formatSeconds(3600), '01:00:00')
  assert.equal(formatSeconds(3665), '01:01:05')
  assert.equal(formatSeconds(36000), '10:00:00')
})

test('shouldLoopAB accurately triggers when playback reaches or passes pointB', () => {
  // Missing points
  assert.equal(shouldLoopAB(50, null, null), false)
  assert.equal(shouldLoopAB(50, 10, null), false)
  assert.equal(shouldLoopAB(50, null, 60), false)

  // Invalid point relationship (B <= A)
  assert.equal(shouldLoopAB(50, 30, 20), false)
  assert.equal(shouldLoopAB(50, 30, 30), false)

  // Before point B
  assert.equal(shouldLoopAB(25, 20, 30), false)
  assert.equal(shouldLoopAB(29.9, 20, 30), false)

  // At or past point B
  assert.equal(shouldLoopAB(30, 20, 30), true)
  assert.equal(shouldLoopAB(30.1, 20, 30), true)
  assert.equal(shouldLoopAB(55, 20, 30), true)

  // Non-finite values
  assert.equal(shouldLoopAB(Number.NaN, 20, 30), false)
  assert.equal(shouldLoopAB(35, Number.NaN, 30), false)
  assert.equal(shouldLoopAB(35, 20, Number.NaN), false)
})

test('calculateSeekTarget calculates forward/backward seek with bounds clamping', () => {
  // Normal seek back 5s
  assert.equal(calculateSeekTarget(20, -5), 15)
  // Clamp to 0
  assert.equal(calculateSeekTarget(3, -5), 0)
  // Normal seek back 15s
  assert.equal(calculateSeekTarget(30, -15), 15)
  // Clamp to custom minTime
  assert.equal(calculateSeekTarget(12, -15, 10), 10)
  // Forward seek with maxTime
  assert.equal(calculateSeekTarget(100, 10, 0, 105), 105)
  assert.equal(calculateSeekTarget(100, 10, 0, 120), 110)
})

test('cyclePlaybackRate cycles across 0.75, 1, and 1.25', () => {
  assert.equal(cyclePlaybackRate(0.75), 1)
  assert.equal(cyclePlaybackRate(1), 1.25)
  assert.equal(cyclePlaybackRate(1.25), 0.75)
  // Unlisted speed resets to default first option
  assert.equal(cyclePlaybackRate(1.5), 0.75)
  assert.equal(cyclePlaybackRate(0.5), 0.75)
})

const sampleLessons: VideoLesson[] = [
  {
    id: 'lesson-1',
    youtubeId: 'yt-1',
    title: '魁北克法语对话',
    titleFr: 'Dialogue québécois',
    channel: 'Radio-Canada Info',
    accent: 'Québec',
    level: 'B1',
    durationLabel: '3:00',
    captions: 'human',
    topics: ['生活', '日常'],
    notes: '发音清晰',
  },
  {
    id: 'lesson-2',
    youtubeId: 'yt-2',
    title: '加拿大联邦政治演说',
    titleFr: 'Discours politique fédéral',
    channel: 'CPAC',
    accent: 'Canada',
    level: 'B2',
    durationLabel: '5:00',
    captions: 'auto',
    topics: ['政治', '联邦'],
  },
  {
    id: 'lesson-3',
    youtubeId: 'yt-3',
    title: '法国总统讲话',
    titleFr: 'Allocution présidentielle',
    channel: 'FRANCE 24',
    accent: 'France',
    level: 'B2',
    durationLabel: '10:00',
    captions: 'human',
    topics: ['政治', '新闻'],
  },
]

test('filterLessons filters by accent, level, and query', () => {
  // All
  assert.equal(filterLessons(sampleLessons, {}).length, 3)
  assert.equal(filterLessons(sampleLessons, { accent: '全部', level: '全部' }).length, 3)

  // Accent
  const quebecOnly = filterLessons(sampleLessons, { accent: 'Québec' })
  assert.equal(quebecOnly.length, 1)
  assert.equal(quebecOnly[0].id, 'lesson-1')

  const franceOnly = filterLessons(sampleLessons, { accent: 'France' })
  assert.equal(franceOnly.length, 1)
  assert.equal(franceOnly[0].id, 'lesson-3')

  // Level
  const b1Only = filterLessons(sampleLessons, { level: 'B1' })
  assert.equal(b1Only.length, 1)
  assert.equal(b1Only[0].id, 'lesson-1')

  const b2Only = filterLessons(sampleLessons, { level: 'B2' })
  assert.equal(b2Only.length, 2)

  // Accent + Level
  const canadaB2 = filterLessons(sampleLessons, { accent: 'Canada', level: 'B2' })
  assert.equal(canadaB2.length, 1)
  assert.equal(canadaB2[0].id, 'lesson-2')

  // Text search in Chinese title
  const searchChinese = filterLessons(sampleLessons, { query: '联邦' })
  assert.equal(searchChinese.length, 1)
  assert.equal(searchChinese[0].id, 'lesson-2')

  // Text search in French title
  const searchFrench = filterLessons(sampleLessons, { query: 'dialogue' })
  assert.equal(searchFrench.length, 1)
  assert.equal(searchFrench[0].id, 'lesson-1')

  // Text search in channel name
  const searchChannel = filterLessons(sampleLessons, { query: 'FRANCE 24' })
  assert.equal(searchChannel.length, 1)
  assert.equal(searchChannel[0].id, 'lesson-3')

  // Text search in topics
  const searchTopic = filterLessons(sampleLessons, { query: '日常' })
  assert.equal(searchTopic.length, 1)
  assert.equal(searchTopic[0].id, 'lesson-1')
})

function createMockStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.get(key) ?? null
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, value)
    },
  }
}

test('loadAllProgress and saveVideoProgress handle local persistence gracefully', () => {
  const mockStorage = createMockStorage()

  // Initially empty
  assert.deepEqual(loadAllProgress(mockStorage), {})
  assert.equal(loadVideoProgress('video-1', mockStorage), null)

  // Save progress for video-1
  saveVideoProgress('video-1', { lastTime: 42, completed: false }, mockStorage)
  const item1 = loadVideoProgress('video-1', mockStorage)
  assert.ok(item1)
  assert.equal(item1.lastTime, 42)
  assert.equal(item1.completed, false)
  assert.ok(typeof item1.updatedAt === 'number')

  // Mark video-1 as completed
  saveVideoProgress('video-1', { completed: true }, mockStorage)
  const updated1 = loadVideoProgress('video-1', mockStorage)
  assert.ok(updated1)
  assert.equal(updated1.lastTime, 42)
  assert.equal(updated1.completed, true)

  // Corrupted JSON recovery
  mockStorage.setItem('tcf-video-listening-progress-v1', '{invalid json}')
  assert.deepEqual(loadAllProgress(mockStorage), {})
  assert.equal(loadVideoProgress('video-1', mockStorage), null)
})
