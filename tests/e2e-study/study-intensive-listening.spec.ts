import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

test('intensive listening list, passage view, transcript toggles, sentence seek, and single main landmark', async ({
  page,
}) => {
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
  await expect.poll(async () => {
    return await audio.evaluate((el: HTMLAudioElement) => el.readyState >= 1)
  }).toBe(true)

  // Click sentence 3 (index 2) in the transcript list
  const sentence3Row = page.locator('[aria-label="精听原文对照"] > div').nth(2)
  await sentence3Row.click()

  // Verify currentTime matches the segment start in the manifest
  await expect.poll(async () => {
    return await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
  }).toBeCloseTo(sentence3SegmentStart, 1)

  // Exactly one <main> remains asserted
  await expect(page.locator('main')).toHaveCount(1)
})
