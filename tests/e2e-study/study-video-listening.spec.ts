import { expect, test } from '@playwright/test'

test('video listening catalog filters and blocked YouTube offline notice', async ({ page }) => {
  const abortedDomains: string[] = []

  // Mock auth endpoint to avoid external dependencies
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: false, signedIn: false, user: null } }),
  )

  // Block any real requests to YouTube and Google CDN (simulating mainland China network)
  await page.route(/(youtube\.com|i\.ytimg\.com)/, (route) => {
    abortedDomains.push(new URL(route.request().url()).hostname)
    return route.abort()
  })

  // 1. Visit video listening catalog
  await page.goto('/video-listening')
  await expect(page.getByRole('heading', { name: '视频听力' })).toBeVisible()

  // Verify list shows video cards
  const videoCards = page.locator('a[href^="/video-listening/"]')
  await expect(videoCards.first()).toBeVisible()
  const totalCount = await videoCards.count()
  expect(totalCount).toBeGreaterThan(1)

  // 2. Filter: 口音 魁北克 reduces the list
  await page.getByRole('button', { name: '魁北克', exact: true }).click()
  const quebecCount = await videoCards.count()
  expect(quebecCount).toBeLessThan(totalCount)
  expect(quebecCount).toBeGreaterThan(0)

  // 3. Filter: 难度 B2
  await page.getByRole('button', { name: 'B2', exact: true }).click()
  const b2QuebecCount = await videoCards.count()
  expect(b2QuebecCount).toBeLessThanOrEqual(quebecCount)
  expect(b2QuebecCount).toBeGreaterThan(0)

  // 4. Open a lesson page
  await videoCards.first().click()
  await expect(page).toHaveURL(/\/video-listening\/.+/)

  // 5. Assert the friendly notice 「当前网络无法加载 YouTube」 appears within ~10s
  const offlineAlert = page.getByRole('alert')
  await expect(offlineAlert).toContainText('当前网络无法加载 YouTube', { timeout: 10_000 })

  // Verify YouTube domain requests were properly intercepted and blocked
  expect(abortedDomains.some((host) => host.includes('youtube.com'))).toBe(true)
})

test('credits video listening time to study minutes and fires video_listen analytics after 60s playback', async ({ page }) => {
  // Mock auth endpoint
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: false, signedIn: false, user: null } }),
  )

  await page.clock.install({ time: new Date('2026-10-17T12:00:00') })

  // Stub YouTube iframe API and clock before page loads
  await page.addInitScript(() => {
    // Analytics spy
    ;(window as any).umami = {
      track: (name: string, data?: Record<string, string | number | boolean>) => {
        ;((window as any)._trackedEvents ??= []).push({ name, data })
      },
    }

    // Stub YouTube API
    let stateChangeCallback: ((e: { data: number }) => void) | null = null
    let currentState = 2 // PAUSED

    class MockPlayer {
      constructor(elementId: string, options: any) {
        stateChangeCallback = options?.events?.onStateChange
        queueMicrotask(() => {
          options?.events?.onReady?.({ target: this })
        })
      }
      playVideo() {
        currentState = 1
        stateChangeCallback?.({ data: 1 })
      }
      pauseVideo() {
        currentState = 2
        stateChangeCallback?.({ data: 2 })
      }
      getCurrentTime() {
        return 10
      }
      getPlayerState() {
        return currentState
      }
      seekTo() {}
      setPlaybackRate() {}
      destroy() {}
    }

    ;(window as any).YT = {
      Player: MockPlayer,
      PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 },
    }
    ;(window as any).__simulateStateChange = (state: number) => {
      currentState = state
      stateChangeCallback?.({ data: state })
    }
  })

  // Open a video lesson with study query params
  await page.goto('/video-listening/rc-francisation-etudiants?studyDate=2026-10-17&studyTask=sat-listening')
  await expect(page.getByRole('heading', { name: '魁北克法语班学员分享生活与融入经历' })).toBeVisible()

  // Wait for player ready
  await expect(page.getByRole('button', { name: '设起点 A' })).toBeVisible()

  // Simulate YouTube player transitioning to PLAYING (state 1)
  await page.evaluate(() => {
    ;(window as any).__simulateStateChange(1)
  })

  // Advance time by 65s of playback (65s -> 2 minutes, and >= 60s for video_listen)
  await page.clock.runFor(65_000)

  // Verify only 1 video_listen event was fired
  const events = await page.evaluate(() => (window as any)._trackedEvents ?? [])
  const videoListenEvents = events.filter((e: any) => e.name === 'video_listen')
  expect(videoListenEvents).toHaveLength(1)

  // Navigate away to study-plan to trigger onLeave flush
  await page.goto('/study-plan')

  // Verify queued study minutes
  const pendingMinutesOps = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith('qwerty-fr-study-plan-pending:'))
      .flatMap((k) => JSON.parse(localStorage.getItem(k) ?? '{}').operations ?? [])
      .filter((op) => op.kind === 'increment' || op.kind === 'minutes'),
  )
  expect(pendingMinutesOps.length).toBeGreaterThan(0)
  const satOp = pendingMinutesOps.find((op) => op.task === 'sat-listening' && op.day === '2026-10-17')
  expect(satOp).toBeDefined()
  expect(satOp.value).toBe(2)

  // Verify local study plan state updated
  const storedPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-study-plan-v1') ?? '{}'))
  expect(storedPlan.minutes?.['2026-10-17']?.['sat-listening']).toBeGreaterThanOrEqual(2)
})
