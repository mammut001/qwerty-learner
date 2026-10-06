import { expect, test } from '@playwright/test'

test('TCF Canada Writing (EE) and Speaking (EO) mock exams and 4-skill target analytics', async ({
  page,
  context,
}) => {
  // Install mock WebAuthn, SpeechSynthesis, and MediaRecorder
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })

  await context.addInitScript(() => {
    // Speech synthesis mock
    class MockSpeechSynthesisUtterance {
      text: string
      lang = ''
      rate = 1
      pitch = 1
      constructor(text: string) {
        this.text = text
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel() {}, speak() {} },
    })

    // MediaRecorder & getUserMedia mock
    class MockMediaRecorder extends EventTarget {
      state: 'inactive' | 'recording' | 'paused' = 'inactive'
      mimeType = 'audio/webm'
      ondataavailable: ((e: any) => void) | null = null
      onstop: (() => void) | null = null
      start() {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
        if (this.ondataavailable) {
          this.ondataavailable({
            data: new Blob(['fake-audio-payload'], { type: 'audio/webm' }),
          })
        }
        if (this.onstop) {
          this.onstop()
        }
      }
    }
    Object.defineProperty(window, 'MediaRecorder', {
      configurable: true,
      value: MockMediaRecorder,
    })

    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {},
      })
    }
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        stop() {},
        kind: 'audio',
        enabled: true,
      }
      return {
        getTracks: () => [track],
        getAudioTracks: () => [track],
      } as any
    }
  })

  // ==========================================
  // Part 1: Writing (Expression Écrite) Flow
  // ==========================================
  await page.goto('/tcf-writing')
  await expect(page.getByText('TCF Canada · Expression Écrite')).toBeVisible()
  await expect(page.getByText('写作 3 任务完整模拟')).toBeVisible()
  await expect(page.getByText('总时长 60 分钟')).toBeVisible()

  // Start Exam
  await page.getByTestId('tcf-writing-start').click()
  await expect(page.getByTestId('tcf-writing-timer')).toContainText(/59:|60:/)

  // Test word count with apostrophes and hyphens in Task 1
  const editor = page.getByTestId('tcf-writing-editor')
  await editor.fill("Bonjour, l'ami ! C'est l'histoire d'un rendez-vous.")
  // French count: Bonjour(1) + l'(2) + ami(3) + C'(4) + est(5) + l'(6) + histoire(7) + d'(8) + un(9) + rendez-vous(10) = 10 words
  const wordBadge = page.getByTestId('tcf-writing-word-count')
  await expect(wordBadge).toBeVisible()
  await expect(wordBadge).toContainText('已写 10 词')
  await expect(wordBadge).toContainText('还差 50 词达下限')

  // Fill sufficient words for Task 1 (60–120 words)
  const task1Text =
    "Bonjour, je vous écris avec un grand plaisir pour confirmer ma présence à la pendaison de crémaillère de samedi prochain. C'est une excellente occasion de fêter votre emménagement dans ce bel appartement au centre-ville. J'arriverai vers dix-huit heures avec quelques gourmandises et du bon vin à partager ensemble. Merci chaleureusement pour cette invitation, j'ai hâte de vous retrouver tous très bientôt !"
  await editor.fill(task1Text)
  await expect(wordBadge).toContainText('符合要求')

  // Auto-save test: wait 3.5 seconds for auto-save trigger
  await page.waitForTimeout(3500)
  await expect(page.getByTestId('tcf-writing-save-status')).toContainText('草稿已自动保存')

  // Reload page to test draft recovery
  await page.goto('/tcf-writing')
  await expect(page.getByText('发现未完成的写作草稿')).toBeVisible()
  await page.getByRole('button', { name: '继续草稿' }).click()
  await expect(page.getByTestId('tcf-writing-editor')).toHaveValue(task1Text)

  // Switch to Task 2 (120–150 words)
  await page.getByTestId('tcf-writing-task-tab-2').click()
  const task2Text =
    "Pendant mes dernières vacances d'été, j'ai vécu une expérience mémorable lors d'un séjour de randonnée dans les parcs naturels québécois. Dès notre arrivée au campement, le contact direct avec la forêt boréale et la tranquillité des lacs environnants nous ont offert un dépaysement total. Chaque journée était rythmée par l'exploration de sentiers sauvages et l'observation d'animaux locaux tels que des castors et des orignaux. Le moment le plus marquant fut sans conteste l'ascension du mont principal au lever du soleil, où un panorama grandiose s'est déployé sous nos yeux émerveillés. Cette aventure authentique m'a profondément ressourcé et m'a rappelé l'importance capitale de préserver nos écosystèmes naturels face au développement urbain moderne."
  await editor.fill(task2Text)

  // Switch to Task 3 (120–180 words)
  await page.getByTestId('tcf-writing-task-tab-3').click()
  // Check Doc A / Doc B are present
  await expect(page.getByText(/Document 1/)).toBeVisible()
  const task3Text =
    "Le débat concernant l'instauration d'une semaine de quatre jours suscite des avis fortement contrastés. D'un côté, les partisans soulignent que la réduction du temps de présence limite l'épuisement professionnel, favorise un meilleur équilibre entre vie de famille et obligations professionnelles, tout en stimulant la productivité globale des salariés. D'un autre côté, certains gestionnaires redoutent un alourdissement du coût organisationnel pour les petites structures et une baisse de réactivité vis-à-vis des clients. À mon avis, adopter un modèle hybride de travail constitue une avancée sociale majeure pour notre société moderne. En conclusion, faire confiance à l'autonomie des collaborateurs renforce durablement la fidélité et la performance collective de l'entreprise."
  await editor.fill(task3Text)

  // Submit writing responses to enter self-assessment
  await page.getByTestId('tcf-writing-submit').click()
  await expect(page.getByTestId('tcf-writing-result')).toBeVisible()
  await expect(page.getByTestId('tcf-writing-assessment')).toBeVisible()
  await expect(page.getByText('四维度自评清单')).toBeVisible()
  await expect(page.getByText('⚠️ 训练估分，非官方评分')).toBeVisible()

  // Submit final assessment
  await page.getByRole('button', { name: '提交自评并保存模考记录' }).click()
  await expect(page.getByText('三任务参考范文与常用连接词')).toBeVisible()
  await expect(page.getByText('官方高分参考范文').first()).toBeVisible()
  await expect(page.getByText('推荐连接词').first()).toBeVisible()

  // ==========================================
  // Part 2: Speaking (Expression Orale) Flow
  // ==========================================
  await page.goto('/tcf-speaking')
  await expect(page.getByText('TCF Canada · Expression Orale')).toBeVisible()
  await expect(page.getByText('口语 3 任务完整模拟')).toBeVisible()

  // Start speaking exam
  await page.getByTestId('tcf-speaking-start').click()
  await expect(page.getByTestId('tcf-speaking-timer')).toBeVisible()
  await expect(page.getByText('麦克风录音已就绪')).toBeVisible()

  // Task 1: Record and Stop
  await page.getByTestId('tcf-speaking-record-btn').click()
  await page.waitForTimeout(500)
  await page.getByTestId('tcf-speaking-stop-btn').click()
  await expect(page.getByTestId('tcf-audio-player-1')).toBeVisible()

  // Task 2: Interaction task
  await page.getByTestId('tcf-speaking-task-tab-2').click()
  await expect(page.getByText(/情境描述/)).toBeVisible()
  await page.getByRole('button', { name: '跳过准备，直接作答' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: '停止作答' }).click()

  // Task 3: Point of view task
  await page.getByTestId('tcf-speaking-task-tab-3').click()
  await page.getByRole('button', { name: '开始作答录音' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: '停止作答' }).click()

  // Finish speaking tasks and enter assessment
  await page.getByTestId('tcf-speaking-finish').click()
  await expect(page.getByTestId('tcf-speaking-result')).toBeVisible()
  await expect(page.getByTestId('tcf-speaking-assessment')).toBeVisible()
  await expect(page.getByText('五维度自评清单')).toBeVisible()
  await expect(page.getByText('⚠️ 训练估分，非官方评分')).toBeVisible()

  // Submit speaking self-assessment
  await page.getByRole('button', { name: '提交自评并保存模考记录' }).click()
  await expect(page.getByText('三任务参考要点与论据解析')).toBeVisible()
  await expect(page.getByText('推荐作答要点')).toBeVisible()

  // ==========================================
  // Part 3: Analytics 4-Skill Trends & Target Lines
  // ==========================================
  await page.goto('/analysis')
  await expect(page.getByTestId('tcf-score-trends')).toBeVisible()

  // Verify all 4 skill targets are visible in header
  await expect(page.getByText('CO 目标 458')).toBeVisible()
  await expect(page.getByText('CE 目标 453')).toBeVisible()
  await expect(page.getByText('EE 目标 10/20')).toBeVisible()
  await expect(page.getByText('EO 目标 10/20')).toBeVisible()

  // Verify all 4 skill cards exist
  await expect(page.getByText('听力 CO', { exact: true })).toBeVisible()
  await expect(page.getByText('阅读 CE', { exact: true })).toBeVisible()
  await expect(page.getByText('写作 EE', { exact: true })).toBeVisible()
  await expect(page.getByText('口语 EO', { exact: true })).toBeVisible()

  // Verify writing and speaking attempts were recorded
  await expect(page.getByText('写作 EE', { exact: true }).locator('..').locator('..')).toContainText('1 次')
  await expect(page.getByText('口语 EO', { exact: true }).locator('..').locator('..')).toContainText('1 次')

  // Verify API reflects the attempts
  const attempts = await page.evaluate(async () => {
    const [ee, eo, all] = await Promise.all([
      fetch('/api/study-plan/tcf-attempts?skill=writing', { credentials: 'include' }).then((r) =>
        r.json(),
      ),
      fetch('/api/study-plan/tcf-attempts?skill=speaking', { credentials: 'include' }).then((r) =>
        r.json(),
      ),
      fetch('/api/study-plan/tcf-attempts', { credentials: 'include' }).then((r) => r.json()),
    ])
    return {
      writingCount: ee.items?.length ?? 0,
      speakingCount: eo.items?.length ?? 0,
      totalCount: all.items?.length ?? 0,
    }
  })
  expect(attempts.writingCount).toBe(1)
  expect(attempts.speakingCount).toBe(1)
  expect(attempts.totalCount).toBeGreaterThanOrEqual(2)

  // ==========================================
  // Part 4: All 4 skills reach target celebration
  // ==========================================
  await page.evaluate(async () => {
    const now = Date.now()
    const buildQcmPayload = (skill: 'listening' | 'reading') => {
      const prefix = skill === 'listening' ? 'co-' : 'ce-'
      const answers = Array.from({ length: 39 }, (_, i) => {
        const id = `${prefix}${String(i + 1).padStart(2, '0')}`
        const correct = i < 26 // 26 correct -> 466 scaledScore -> NCLC 7
        return { questionId: id, choice: correct ? 0 : 1, correct }
      })
      return {
        id: `00000000-0000-4000-8000-${skill === 'listening' ? '111111111111' : '222222222222'}`,
        skill,
        questionCount: 39,
        answers,
        correctCount: 26,
        scaledScore: 466,
        nclc: 7,
        durationSeconds: 1200,
        startedAt: now - 1200000,
        finishedAt: now,
        day: new Date(now).toISOString().slice(0, 10),
      }
    }

    const coPayload = buildQcmPayload('listening')
    const cePayload = buildQcmPayload('reading')
    await fetch('/api/study-plan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: '33333333-3333-4333-8333-333333333333',
        operations: [
          { kind: 'tcfAttempt', value: coPayload },
          { kind: 'tcfAttempt', value: cePayload },
        ],
      }),
    })
  })

  // Reload analysis page and verify celebration banner
  await page.goto('/analysis')
  await expect(page.getByTestId('tcf-all-targets-reached')).toBeVisible()
  await expect(page.getByTestId('tcf-all-targets-reached')).toContainText(
    '恭喜！四项技能（CO / CE / EE / EO）均已达到 NCLC 7 目标！',
  )
})
