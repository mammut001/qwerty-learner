import { type BrowserContext, type Locator, type Page, expect, test } from '@playwright/test'
import { ECHELLE_ITEM_CATALOG, getEchelleLevelItems } from '../../server/echelle-curriculum.mjs'

type QuizItem = { id: string; kind: string; questions: { prompt: string; choices: string[]; answer: string }[] }
type ProductionItem = { id: string; kind: 'production'; skill: 'writing' | 'speaking'; wordMin?: number; secondsMin?: number; selfChecks: string[] }

const pendingMutationCount = (page: Page) =>
  page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('qwerty-fr-study-plan-pending:')).length)

async function answerQuiz(card: Locator, answers: string[]) {
  const groups = card.getByRole('group')
  for (const [index, answer] of answers.entries()) {
    await groups.nth(index).getByRole('button', { name: answer, exact: true }).click()
  }
  await card.getByRole('button', { name: '提交答案' }).click()
}

const SPOKEN = 'Bonjour, je m’appelle Lucia. Je suis mexicaine et je suis infirmière à Montréal.'
const DAY_MS = 24 * 60 * 60 * 1000

/** No real audio in CI: speech output is silenced and speech recognition "hears" SPOKEN once per session. */
async function installBrowserFakes(context: BrowserContext) {
  await context.addInitScript((spoken) => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { cancel() {}, speak() {} } })
    class FakeRecognition {
      lang = ''
      continuous = false
      interimResults = false
      onresult: ((event: unknown) => void) | null = null
      onerror: ((event: unknown) => void) | null = null
      onend: (() => void) | null = null
      start() {
        setTimeout(() => this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: spoken } }] }), 200)
      }
      stop() {
        setTimeout(() => this.onend?.(), 0)
      }
    }
    for (const name of ['SpeechRecognition', 'webkitSpeechRecognition'])
      Object.defineProperty(window, name, { configurable: true, value: FakeRecognition })
    const offset = Number(localStorage.getItem('e2e-clock-offset') || 0)
    const realNow = Date.now.bind(Date)
    Date.now = () => realNow() + offset
  }, SPOKEN)
}

async function completeProduction(card: Locator, item: ProductionItem) {
  if (item.skill === 'writing') {
    await card.getByLabel('书面表达作答').fill('Bonjour ! Je m’appelle Lucia. Je suis mexicaine et je suis infirmière.')
  } else {
    await card.getByRole('button', { name: '开始计时' }).click()
    await expect
      .poll(async () => parseInt((await card.getByTestId('speaking-seconds').textContent()) ?? '0', 10), {
        timeout: ((item.secondsMin ?? 0) + 5) * 1000,
      })
      .toBeGreaterThanOrEqual(item.secondsMin ?? 0)
    await card.getByRole('button', { name: '停止计时' }).click()
    await expect(card.getByTestId('speaking-transcript')).toHaveValue(SPOKEN)
  }
  // With AI scoring on, self-checks are only a checklist; the AI verdict decides mastery.
  await expect(card.getByRole('button', { name: '标记为已掌握' })).toHaveCount(0)
  await card.getByRole('button', { name: 'AI 评分' }).click()
  await expect(card.getByTestId('ai-verdict')).toHaveText('达到 Niveau 1')
  for (const criterion of ['tache', 'texte', 'phrase', 'lexique']) await expect(card.getByTestId(`ai-criterion-${criterion}`)).toBeVisible()
}

test('a learner masters every Niveau 1 item through the UI, passes the level and sees it on another device', async ({
  browser,
  context,
  page,
}) => {
  test.setTimeout(120_000)
  await installBrowserFakes(context)

  await page.goto('/levels')
  await expect(page.getByTestId('level-card-12')).toBeVisible()
  await expect(page.getByTestId('levels-passed-count')).toHaveText('已达标 0 / 12 级')
  await expect(page.getByTestId('level-card-1')).toContainText('进行中')
  await page.getByTestId('level-card-1').click()
  await expect(page).toHaveURL(/\/levels\/1$/)
  for (const skill of ['listening', 'reading', 'writing', 'speaking', 'lex'])
    await expect(page.getByTestId(`level-skill-${skill}`)).toBeVisible()

  // Listening hides the transcript until the learner asks for it or submits.
  const firstId = 'n1-listening-0'
  const first = ECHELLE_ITEM_CATALOG[firstId] as QuizItem
  const firstCard = page.getByTestId(`level-item-${firstId}`)
  await firstCard.getByRole('button').first().click()
  await expect(firstCard.getByTestId('listening-transcript')).toHaveCount(0)

  // A failed attempt is recorded, and a later correct retry must win on the server.
  await answerQuiz(
    firstCard,
    first.questions.map((q, i) => (i === 0 ? q.choices.find((choice) => choice !== q.answer)! : q.answer)),
  )
  await expect(firstCard.getByTestId('level-item-failed')).toBeVisible()
  await expect(firstCard.getByTestId('listening-transcript')).toBeVisible()
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await firstCard.getByRole('button', { name: '重做' }).click()
  await answerQuiz(firstCard, first.questions.map((q) => q.answer))
  await expect(firstCard.getByTestId('level-item-mastered')).toBeVisible()
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await page.reload()
  await expect(page.getByTestId(`level-item-${firstId}`)).toContainText('已掌握')

  const itemIds = getEchelleLevelItems(1).filter((id) => id !== firstId)
  for (const itemId of itemIds) {
    const item = ECHELLE_ITEM_CATALOG[itemId] as QuizItem | ProductionItem
    const card = page.getByTestId(`level-item-${itemId}`)
    await card.getByRole('button').first().click()
    if (item.kind === 'production') await completeProduction(card, item as ProductionItem)
    else {
      await answerQuiz(card, (item as QuizItem).questions.map((q) => q.answer))
      await expect(card.getByTestId('level-item-mastered')).toBeVisible()
    }
    await expect(card.getByTestId(`level-item-status-${itemId}`)).toHaveText('已掌握 · 明天复习')
  }

  await expect(page.getByTestId('level-progress')).toHaveText(`${itemIds.length + 1} / ${itemIds.length + 1}`)
  await expect(page.getByTestId('level-passed-banner')).toContainText('恭喜！你已经掌握 Niveau 1 的全部知识点。')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await page.getByTestId('level-passed-banner').getByRole('link', { name: '进入 Niveau 2' }).click()
  await expect(page).toHaveURL(/\/levels\/2$/)

  await page.goto('/levels')
  await expect(page.getByTestId('level-card-1')).toContainText('达标')
  await expect(page.getByTestId('level-card-2')).toContainText('进行中')
  await expect(page.getByTestId('levels-passed-count')).toHaveText('已达标 1 / 12 级')

  // The same mastery state is restored from the backend on a second device.
  await page.goto('/study-plan')
  await page.getByRole('button', { name: /生成同步码|轮换同步码/ }).click()
  const syncCode = await page.getByLabel('当前学习进度同步码').inputValue()
  expect(syncCode).toMatch(/^[a-f0-9]{64}$/)

  const second = await browser.newContext()
  const secondPage = await second.newPage()
  await secondPage.goto('/study-plan')
  await secondPage.getByLabel('连接已有学习进度的同步码').fill(syncCode)
  await secondPage.getByRole('button', { name: '绑定' }).click()
  await expect(secondPage.getByText('此设备已通过同步码绑定')).toBeVisible()
  await secondPage.goto('/levels')
  await expect(secondPage.getByTestId('level-card-1')).toContainText('达标')
  await expect(secondPage.getByTestId('levels-passed-count')).toHaveText('已达标 1 / 12 级')
  await secondPage.goto('/levels/1')
  await expect(secondPage.getByTestId('level-passed-banner')).toBeVisible()
  // The AI verdict itself is synced, not just the mastered flag.
  const writing = secondPage.getByTestId('level-item-n1-writing-production')
  await writing.getByRole('button').first().click()
  await expect(writing.getByTestId('ai-verdict')).toHaveText('达到 Niveau 1')
  await second.close()
})

test('items follow the forgetting curve: due reviews, forgetting and relearning', async ({ context, page }) => {
  await installBrowserFakes(context)
  const itemId = 'n1-listening-0'
  const item = ECHELLE_ITEM_CATALOG[itemId] as QuizItem
  const correct = item.questions.map((q) => q.answer)
  const wrong = item.questions.map((q, i) => (i === 0 ? q.choices.find((choice) => choice !== q.answer)! : q.answer))
  const status = () => page.getByTestId(`level-item-status-${itemId}`)
  const travel = async (days: number) => {
    await page.evaluate((ms) => localStorage.setItem('e2e-clock-offset', String(ms)), days * DAY_MS)
    await page.reload()
  }

  await page.goto(`/levels/1?item=${itemId}`)
  const card = page.getByTestId(`level-item-${itemId}`)
  await answerQuiz(card, correct)
  await expect(status()).toHaveText('已掌握 · 明天复习')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)

  // Two days later the first review (1 day) is due, and shows up in the queue.
  await travel(2)
  await expect(status()).toHaveText('待复习')
  await expect(page.getByTestId('level-due-count')).toHaveText('待复习 1')
  await page.goto('/levels')
  await expect(page.getByTestId('levels-review-link')).toContainText('1 项待复习')
  await page.getByTestId('levels-review-link').click()
  await expect(page.getByTestId('review-due-count')).toHaveText('现在需要复习：1 项')
  await page.getByTestId(`review-item-${itemId}`).click()
  await expect(page).toHaveURL(new RegExp(`/levels/1\\?item=${itemId}$`))

  // Passing the review on time moves the next review out to 2 days.
  await answerQuiz(card, correct)
  await expect(status()).toHaveText('已掌握 · 2 天后复习')
  await expect(page.getByTestId('level-due-count')).toHaveCount(0)
  await expect.poll(() => pendingMutationCount(page)).toBe(0)

  // Failing the next review counts as forgetting; the learner has to master it again.
  await travel(5)
  await answerQuiz(card, wrong)
  await expect(status()).toHaveText('已遗忘 · 重新学习')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)
  await page.reload()
  await expect(status()).toHaveText('已遗忘 · 重新学习')
  await answerQuiz(card, correct)
  await expect(status()).toHaveText('已掌握 · 明天复习')
})
