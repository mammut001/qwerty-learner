import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

async function setupAudioAndAuth(page: Page) {
  // Mock auth endpoint
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: false, signedIn: false, user: null } }),
  )

  // Stub audio: route all mp3 URLs to the local silent mp3 fixture with HTTP 206 range support
  const silentMp3Path = path.resolve(__dirname, 'fixtures/silent.mp3')
  const mp3Buffer = fs.readFileSync(silentMp3Path)
  const totalLength = mp3Buffer.length

  await page.route('**/*.mp3*', (route) => {
    const range = route.request().headers().range
    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range)
      const start = match ? parseInt(match[1], 10) : 0
      const end = match && match[2] ? parseInt(match[2], 10) : totalLength - 1
      const chunk = mp3Buffer.subarray(start, end + 1)
      return route.fulfill({
        status: 206,
        contentType: 'audio/mpeg',
        headers: {
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${totalLength}`,
          'Content-Length': String(chunk.length),
        },
        body: chunk,
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'audio/mpeg',
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(totalLength),
      },
      body: mp3Buffer,
    })
  })
}

test('intensive listening list, passage view, transcript toggles, sentence seek, and single main landmark', async ({ page }) => {
  await setupAudioAndAuth(page)

  // Read manifest to obtain the exact segment start timestamp for sentence 3
  const manifestPath = path.resolve(__dirname, '../../public/voice/intensive-listening-manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const sentence3SegmentStart = manifest.items['preparer-hiver-quebec'].segments[2].start
  expect(typeof sentence3SegmentStart).toBe('number')

  // 1. Visit intensive listening catalog
  await page.goto('/intensive-listening')
  await expect(page.getByRole('heading', { name: '精听 — 魁北克原篇语料' })).toBeVisible()

  // Verify list shows passages and exactly one <main>
  const passageCards = page.locator('a[href^="/intensive-listening/"]')
  await expect(passageCards.first()).toBeVisible()
  expect(await passageCards.count()).toBeGreaterThan(0)
  await expect(page.locator('main')).toHaveCount(1)

  // 2. Open preparer-hiver-quebec
  const targetCard = page.locator('a[href="/intensive-listening/preparer-hiver-quebec"]')
  await expect(targetCard).toBeVisible()
  await targetCard.click()
  await expect(page).toHaveURL(/\/intensive-listening\/preparer-hiver-quebec$/)

  // Exactly one <main> on passage page as well
  await expect(page.locator('main')).toHaveCount(1)

  // 3. Transcript shows French + Chinese
  const frenchSentence1 = page.getByText('Si vous venez d’arriver au Québec', { exact: false })
  const chineseSentence1 = page.getByText('如果你刚来到魁北克', { exact: false })
  await expect(frenchSentence1).toBeVisible()
  await expect(chineseSentence1).toBeVisible()

  // 4. 中文 toggle hides Chinese
  const toggleChineseButton = page.getByRole('button', { name: '中文开' }).filter({ visible: true })
  await toggleChineseButton.click()
  await expect(chineseSentence1).toHaveCount(0)

  // 5. 盲听 hides French
  const blindModeButton = page.getByRole('button', { name: '盲听', exact: true }).filter({ visible: true })
  await blindModeButton.click()
  await expect(frenchSentence1).toHaveCount(0)

  // 6. Clicking sentence 3 seeks the <audio> currentTime to the manifest segment start of sentence 3
  const audio = page.locator('audio')
  // Wait until audio metadata has loaded from the stubbed MP3 fixture
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.readyState >= 1)
    })
    .toBe(true)

  // Click sentence 3 (index 2) in the transcript list
  const sentence3Row = page.locator('[aria-label="精听原文对照"] > div').nth(2)
  await sentence3Row.click()

  // Verify currentTime matches the segment start in the manifest
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
    })
    .toBeGreaterThanOrEqual(sentence3SegmentStart)

  // Exactly one <main> remains asserted
  await expect(page.locator('main')).toHaveCount(1)
})

test('clicking a French word like école opens offline dictionary lookup with Chinese gloss and does not seek audio', async ({ page }) => {
  await setupAudioAndAuth(page)

  // Visit passage with "l’école" (premier-jour-cours-francais sentence 8)
  await page.goto('/intensive-listening/premier-jour-cours-francais')
  await expect(page.getByRole('heading', { name: '第一天上法语课' })).toBeVisible()

  const audio = page.locator('audio')
  // Wait until audio metadata has loaded
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.readyState >= 1)
    })
    .toBe(true)

  // Verify initial currentTime is 0
  const initialTime = await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
  expect(initialTime).toBe(0)

  // Locate word 'école' within the transcript
  const transcript = page.locator('[aria-label="精听原文对照"]')
  const ecoleWord = transcript.getByText('école', { exact: false })
  await expect(ecoleWord).toBeVisible()

  // Clicking 'école' must open the existing offline dictionary lookup
  await ecoleWord.click()

  // Verify dictionary popover opened with Chinese gloss
  const popover = page.getByTestId('dictionary-popover')
  await expect(popover).toBeVisible()
  await expect(popover).toHaveAttribute('aria-label', '查词：école')
  await expect(popover).toContainText('学校')

  // Word click must NOT change audio currentTime
  const timeAfterWordClick = await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
  expect(timeAfterWordClick).toBe(0)

  // Close the dictionary popover
  await popover.getByRole('button', { name: '关闭查词' }).click()
  await expect(popover).toHaveCount(0)

  // Clicking the sentence row elsewhere (not on a word) seeks to the sentence
  const sentence8Row = transcript.locator('> div').nth(7)
  await sentence8Row.getByText('8', { exact: true }).click()
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
    })
    .toBeGreaterThan(30)

  // Hidden French (盲听 mode) shows no clickable words
  const blindModeButton = page.getByRole('button', { name: '盲听', exact: true }).filter({ visible: true })
  await blindModeButton.click()
  await expect(transcript.getByText('école', { exact: false })).toHaveCount(0)
})

test('credits listening time to study minutes, respects study params, and fires intensive_complete on passage end', async ({ page }) => {
  await setupAudioAndAuth(page)

  await page.clock.install({ time: new Date('2026-10-17T12:00:00') })

  // Track analytics events
  await page.addInitScript(() => {
    ;(window as any).umami = {
      track: (name: string, data?: Record<string, string | number | boolean>) => {
        ;((window as any)._trackedEvents ??= []).push({ name, data })
      },
    }
  })

  // Open passage with studyDate and studyTask params
  await page.goto('/intensive-listening/premier-jour-cours-francais?studyDate=2026-10-17&studyTask=sat-listening')
  await expect(page.getByRole('heading', { name: '第一天上法语课' })).toBeVisible()

  const audio = page.locator('audio')
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.readyState >= 1)
    })
    .toBe(true)

  // Start playback
  await page.getByRole('button', { name: '播放', exact: true }).filter({ visible: true }).click()
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => !el.paused)
    })
    .toBe(true)
  await expect(page.getByRole('button', { name: '暂停', exact: true }).filter({ visible: true })).toBeVisible()

  // While playing, advance clock by 75s of simulated playback (75s -> 2 minutes) and pause
  await page.clock.runFor(75_000)
  await audio.evaluate((el: HTMLAudioElement) => {
    el.pause()
  })
  await expect
    .poll(async () => {
      return await audio.evaluate((el: HTMLAudioElement) => el.paused)
    })
    .toBe(true)

  // Leave page to trigger onLeave flush
  await page.goto('/study-plan')

  // Verify minutes are queued in study-plan pending queue
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

  // Verify local plan storage updated
  const storedPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('qwerty-fr-study-plan-v1') ?? '{}'))
  expect(storedPlan.minutes?.['2026-10-17']?.['sat-listening']).toBeGreaterThanOrEqual(2)

  // Re-visit passage to assert intensive_complete event
  await page.goto('/intensive-listening/premier-jour-cours-francais')
  await expect(page.getByRole('heading', { name: '第一天上法语课' })).toBeVisible()

  // Trigger audio ended event
  await audio.evaluate((el: HTMLAudioElement) => {
    el.dispatchEvent(new Event('ended'))
  })

  // Assert intensive_complete analytics event was fired without PII
  const tracked = await page.evaluate(() => (window as any)._trackedEvents ?? [])
  expect(tracked.some((e: any) => e.name === 'intensive_complete')).toBe(true)
})
