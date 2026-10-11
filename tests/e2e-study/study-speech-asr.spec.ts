import { type BrowserContext, expect, test } from '@playwright/test'

const CANNED_TRANSCRIPT = 'Bonjour, je m’appelle Lucia et je suis infirmière.'

const CANNED_RESULT = {
  transcript: CANNED_TRANSCRIPT,
  durationSeconds: 12.5,
  words: [
    { word: 'Bonjour', start: 0.1, end: 0.7, confidence: 0.98 },
    { word: 'je', start: 0.8, end: 1.0, confidence: 0.95 },
    { word: 'm’appelle', start: 1.1, end: 1.6, confidence: 0.92 },
    { word: 'Lucia', start: 1.7, end: 2.2, confidence: 0.52 }, // low confidence
    { word: 'et', start: 2.3, end: 2.5, confidence: 0.96 },
    { word: 'je', start: 2.6, end: 2.8, confidence: 0.94 },
    { word: 'suis', start: 2.9, end: 3.2, confidence: 0.93 },
    { word: 'infirmière', start: 3.3, end: 4.1, confidence: 0.55 }, // low confidence
  ],
  metrics: {
    wordCount: 8,
    speechSeconds: 11.0,
    wordsPerMinute: 38,
    articulationRate: 141,
    pauseCount: 2,
    longPauseCount: 0,
    longestPauseSeconds: 0.8,
    pauseRatio: 0.73,
    fillerCount: 0,
    meanConfidence: 0.84,
    lowConfidenceWords: [
      { word: 'Lucia', start: 1.7, end: 2.2, confidence: 0.52 },
      { word: 'infirmière', start: 3.3, end: 4.1, confidence: 0.55 },
    ],
    lowConfidenceRatio: 0.25,
    intelligibility: 'mostly-clear' as const,
  },
}

async function installMediaFakes(context: BrowserContext) {
  await context.addInitScript(() => {
    localStorage.setItem('echelle:fixedVariant', '0')
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => undefined,
        speak: () => undefined,
      },
    })

    class FakeMediaStream {
      getTracks() {
        return [{ stop: () => undefined }]
      }
    }

    class FakeMediaRecorder {
      state = 'inactive'
      mimeType = 'audio/webm;codecs=opus'
      ondataavailable: ((e: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      onerror: (() => void) | null = null

      static isTypeSupported(type: string) {
        return type.includes('audio/webm')
      }

      start() {
        this.state = 'recording'
      }

      stop() {
        this.state = 'inactive'
        if (this.ondataavailable) {
          const fakeBlob = new Blob(['FAKE_AUDIO_BYTES_FOR_TEST'], { type: 'audio/webm;codecs=opus' })
          this.ondataavailable({ data: fakeBlob })
        }
        if (this.onstop) {
          this.onstop()
        }
      }
    }

    Object.defineProperty(window, 'MediaRecorder', {
      configurable: true,
      writable: true,
      value: FakeMediaRecorder,
    })

    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {},
      })
    }

    navigator.mediaDevices.getUserMedia = async () => {
      return new FakeMediaStream() as unknown as MediaStream
    }
  })
}

test('speech ASR flow: record, transcribe, view measurements card with highlighted words, and evaluate with grounded metrics', async ({
  context,
  page,
}) => {
  test.setTimeout(60_000)
  await installMediaFakes(context)

  // Mock /echelle/ai so that asr is reported as enabled
  await page.route('**/api/study-plan/echelle/ai', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        enabled: true,
        provider: 'mock',
        model: 'mock',
        rubricVersion: '2026.04',
        asr: true,
      }),
    })
  })

  // Intercept ASR transcription
  let transcribeCalled = false
  await page.route('**/api/study-plan/speech/transcribe', async (route) => {
    transcribeCalled = true
    const req = route.request()
    expect(req.method()).toBe('POST')
    expect(req.headers()['content-type']).toContain('audio/')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CANNED_RESULT),
    })
  })

  // Intercept evaluate endpoint and capture payload
  const evaluatePayloads: Array<{ inputMode?: string; speech?: unknown; text?: string }> = []
  await page.route('**/api/study-plan/echelle/evaluate', async (route) => {
    const postData = route.request().postDataJSON() as { inputMode?: string; speech?: unknown; text?: string }
    evaluatePayloads.push(postData)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        evaluation: {
          passed: true,
          mean: 3.25,
          estimatedLevel: 1,
          feedbackZh: '口语表达符合要求，语音清晰可懂。',
          scores: { tache: 4, texte: 3, phrase: 3, lexique: 3, phonologie: 3 },
          criteria: [
            { id: 'tache', labelZh: '任务完成', score: 4, evidence: 'Lucia', commentZh: '完成自我介绍' },
            { id: 'texte', labelZh: '篇章组织', score: 3, evidence: 'et', commentZh: '组织自然' },
            { id: 'phrase', labelZh: '句子与语法', score: 3, evidence: 'je suis infirmière', commentZh: '语法正确' },
            { id: 'lexique', labelZh: '词汇', score: 3, evidence: 'infirmière', commentZh: '词汇贴切' },
            { id: 'phonologie', labelZh: '语音与可懂度', score: 3, evidence: '置信度 84%', commentZh: '发音清晰度良好' },
          ],
          strengthsZh: ['发音流利且重点突出'],
          requiredMean: 2.75,
          warnings: [],
          provider: 'mock',
          model: 'mock',
          rubricVersion: '2026.04',
          evaluatedAt: Date.now(),
          corrections: [],
          speech: CANNED_RESULT.metrics,
        },
      }),
    })
  })

  // Navigate to Level 1 speaking item
  await page.goto('/levels/1?item=n1-speaking-production')

  const speakingCard = page.getByTestId('level-item-n1-speaking-production')
  await expect(speakingCard).toBeVisible()

  // Make sure speaking panel is expanded
  const recorderStartBtn = speakingCard.getByTestId('speaking-recorder-start')
  if (!(await recorderStartBtn.isVisible())) {
    await speakingCard.getByRole('button').first().click()
  }
  await expect(recorderStartBtn).toBeVisible()

  // Start recording
  await recorderStartBtn.click()
  const stopBtn = speakingCard.getByTestId('speaking-recorder-stop')
  await expect(stopBtn).toBeVisible()

  // Wait for 1 second of recorded time
  await page.waitForTimeout(1100)

  // Stop recording
  await stopBtn.click()

  // Check audio player is rendered
  const audioPlayer = speakingCard.getByTestId('speaking-audio-player')
  await expect(audioPlayer).toBeVisible()

  // Check privacy consent line and check it
  const consentCheckbox = speakingCard.getByTestId('asr-consent-checkbox')
  if (await consentCheckbox.isVisible()) {
    await consentCheckbox.check()
  }

  // Click « 转写并评分 » button
  const transcribeAndEvalBtn = speakingCard.getByTestId('speech-transcribe-eval-btn')
  await expect(transcribeAndEvalBtn).toBeEnabled()
  await transcribeAndEvalBtn.click()

  // Verify ASR was called
  await expect.poll(() => transcribeCalled).toBe(true)

  // Verify measurements card is displayed
  const metricsCard = speakingCard.getByTestId('speech-metrics-card').first()
  await expect(metricsCard).toBeVisible()
  await expect(speakingCard.getByTestId('metric-wpm').first()).toContainText('38')
  await expect(speakingCard.getByTestId('intelligibility-badge').first()).toContainText('基本清晰')

  // Verify highlighted low-confidence words
  const lowConfWords = metricsCard.getByTestId('low-confidence-word')
  await expect(lowConfWords.first()).toBeVisible()
  const count = await lowConfWords.count()
  expect(count).toBeGreaterThanOrEqual(1)
  await expect(lowConfWords.first()).toHaveAttribute('title', '识别不确定，可能是发音不清')

  // Verify AI evaluation result is displayed
  await expect(speakingCard.getByTestId('ai-evaluation')).toBeVisible()

  // Verify first evaluate payload carries inputMode: 'asr' and speech metrics
  expect(evaluatePayloads.length).toBeGreaterThanOrEqual(1)
  const firstEval = evaluatePayloads[0]
  expect(firstEval.inputMode).toBe('asr')
  expect(firstEval.text).toBe(CANNED_TRANSCRIPT)
  expect(firstEval.speech).toBeDefined()
  expect((firstEval.speech as { wordsPerMinute: number }).wordsPerMinute).toBe(38)

  // Now test transcript modification: if edited, subsequent evaluate sends manual-transcript without speech
  const transcriptArea = speakingCard.getByTestId('speaking-transcript')
  await expect(transcriptArea).toBeVisible()
  await transcriptArea.fill(`${CANNED_TRANSCRIPT} (modifié)`)

  // Check warning message appeared
  await expect(speakingCard.getByText('⚠️ 文本已修改（切换为手动转写模式）')).toBeVisible()

  // Re-evaluate
  const reEvaluateBtn = speakingCard.getByRole('button', { name: /AI 评分|AI 正在按量表评分/ })
  await reEvaluateBtn.click()

  // Verify second evaluate payload
  await expect.poll(() => evaluatePayloads.length).toBeGreaterThanOrEqual(2)
  const secondEval = evaluatePayloads[1]
  expect(secondEval.inputMode).toBe('manual-transcript')
  expect(secondEval.speech).toBeUndefined()
  expect(secondEval.text).toContain('(modifié)')
})
