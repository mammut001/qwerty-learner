import { type BrowserContext, expect, test } from '@playwright/test'
import { REAL_READING_PASSAGES } from '../../server/echelle-variants/real-reading.mjs'

async function installBrowserFakes(context: BrowserContext) {
  await context.addInitScript(() => {
    localStorage.setItem('echelle:fixedVariant', '0')
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { cancel() {}, speak() {} },
    })
  })
}

test('real reading section opens, displays attribution, scores answers, persists completion locally without altering level progress', async ({
  context,
  page,
}) => {
  test.setTimeout(60_000)
  await installBrowserFakes(context)

  // Navigate to Level 4 (which contains real reading passages)
  await page.goto('/levels/4')
  await expect(page).toHaveURL(/\/levels\/4$/)

  // Check the level progress bar initial state (e.g. "0 / 24")
  const progressLocator = page.getByTestId('level-progress')
  await expect(progressLocator).toBeVisible()
  const initialProgress = (await progressLocator.textContent())?.trim()
  expect(initialProgress).toBeTruthy()

  // Verify the "真实阅读" section is visible after reading
  const section = page.getByTestId('level-real-reading')
  await expect(section).toBeVisible()
  await expect(section.getByText('真实阅读')).toBeVisible()
  await expect(section.getByText('来自 Vikidia / 维基百科的原文片段，不计入等级达标')).toBeVisible()

  // Find a target level 4 passage
  const targetPassage = REAL_READING_PASSAGES.find((p) => p.level === 4)
  expect(targetPassage).toBeDefined()
  if (!targetPassage) return

  const itemCard = page.getByTestId(`real-reading-item-${targetPassage.id}`)
  await expect(itemCard).toBeVisible()

  // Before answering, no checkmark should be displayed
  await expect(itemCard.getByTestId('real-reading-check')).toHaveCount(0)

  // Click card to open/expand accordion
  await itemCard.getByRole('button').first().click()

  // Verify passage text is rendered
  await expect(itemCard.getByText(targetPassage.text.split('\n\n')[0])).toBeVisible()

  // Verify attribution and licence links
  const attribution = itemCard.getByTestId('real-reading-attribution')
  await expect(attribution).toBeVisible()
  await expect(attribution).toContainText(targetPassage.title)
  await expect(attribution).toContainText('Texte reproduit sans modification.')
  await expect(attribution).toContainText('原文未作修改')

  const licenceLink = itemCard.getByTestId('real-reading-licence-link')
  await expect(licenceLink).toBeVisible()
  await expect(licenceLink).toHaveAttribute('target', '_blank')
  await expect(licenceLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(licenceLink).toHaveAttribute('href', targetPassage.licenceUrl)

  // Answer all 3 questions with correct choices
  for (let qIdx = 0; qIdx < targetPassage.questions.length; qIdx++) {
    const question = targetPassage.questions[qIdx]
    const correctAnswer = question[1]
    const choiceButton = itemCard.getByRole('button', { name: correctAnswer, exact: true })
    await expect(choiceButton).toBeVisible()
    await choiceButton.click()
  }

  // Submit answers
  const submitButton = itemCard.getByRole('button', { name: '提交答案' })
  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  // Verify score display
  const scoreDisplay = itemCard.getByTestId('real-reading-score')
  await expect(scoreDisplay).toBeVisible()
  await expect(scoreDisplay).toContainText('得分：3 / 3 (100%)')

  // Verify per-question correctness badges
  for (let qIdx = 0; qIdx < targetPassage.questions.length; qIdx++) {
    await expect(itemCard.getByTestId(`real-reading-q-${qIdx}-correct`)).toBeVisible()
  }

  // Verify level progress counter remains unchanged after submission
  await expect(progressLocator).toHaveText(initialProgress!)

  // Reload page to verify local persistence
  await page.reload()
  await expect(page.getByTestId('level-real-reading')).toBeVisible()

  // Checkmark ✓ is visible on the passage item
  const reloadedCard = page.getByTestId(`real-reading-item-${targetPassage.id}`)
  await expect(reloadedCard.getByTestId('real-reading-check')).toBeVisible()
  await expect(reloadedCard.getByTestId('real-reading-check')).toHaveText('✓')

  // Level progress counter is still strictly unchanged
  await expect(page.getByTestId('level-progress')).toHaveText(initialProgress!)
})
