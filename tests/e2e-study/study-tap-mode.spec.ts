import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

test.use({
  viewport: { width: 375, height: 812 },
  hasTouch: true,
})

test('tap mode flashcards, four-choice quiz, tile spelling and progress recording', async ({ page }) => {
  // Prevent external network calls and ensure a predictable guest/auth state
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: false, signedIn: false, user: null } }),
  )

  const dictPath = path.resolve(__dirname, '../../public/dicts/A1_Jingbian_Ep01.json')
  const dictEntries: Array<{ name: string; trans: string[] }> = JSON.parse(fs.readFileSync(dictPath, 'utf-8'))

  // 1. Visit /tap?dict=a1-jingbian-ep01&chapter=0 and verify flashcard view
  await page.goto('/tap?dict=a1-jingbian-ep01&chapter=0')
  await expect(page).toHaveURL(/\/tap\?dict=a1-jingbian-ep01&chapter=0$/)

  // Verify no horizontal scroll on mobile viewport
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  // Shows flashcards
  const flipToChineseButton = page.getByRole('button', { name: '翻到中文面' })
  await expect(flipToChineseButton).toBeVisible()
  const firstWordName = dictEntries[0].name
  await expect(page.getByText(firstWordName, { exact: true })).toBeVisible()

  // 2. Flip card
  await flipToChineseButton.click()
  const flipToFrenchButton = page.getByRole('button', { name: '翻回法语面' })
  await expect(flipToFrenchButton).toBeVisible()
  const firstWordMeaning = dictEntries[0].trans.join('；')
  await expect(page.getByText(firstWordMeaning)).toBeVisible()

  // 3. "会了" advances to next card
  await page.getByRole('button', { name: '会了', exact: true }).click()
  const secondWordName = dictEntries[1].name
  await expect(page.getByText(secondWordName, { exact: true })).toBeVisible()

  // 4. 四选一 法→中 select the correct option (derived from dict JSON) shows 答对了
  await page.getByRole('tab', { name: '四选一' }).click()
  await expect(page.getByText('选出这个法语词的中文意思')).toBeVisible()

  // Question displays the French word; locate its correct Chinese meaning from dict JSON
  const questionWordElement = page.locator('.tracking-tight.text-gray-900, .tracking-tight.text-white').first()
  const currentQuizWord = (await questionWordElement.textContent())?.trim() || firstWordName
  const matchingQuizEntry = dictEntries.find((entry) => entry.name === currentQuizWord)
  expect(matchingQuizEntry).toBeDefined()
  const correctQuizAnswer = matchingQuizEntry!.trans.join('；')

  const correctOptionButton = page.getByRole('button', { name: correctQuizAnswer, exact: true })
  await expect(correctOptionButton).toBeVisible()
  await correctOptionButton.click()
  await expect(page.getByText('答对了')).toBeVisible()

  // 5. 拼词 tab: fill tiles for current word -> 答对了; wrong tile order shows a red state
  await page.getByRole('tab', { name: '拼词' }).click()
  await expect(page.getByText('看中文释义，拼出对应的法语词')).toBeVisible()

  // Derive target French word from displayed Chinese meaning via dict JSON
  const displayedMeaning = (await page.locator('.break-words.text-2xl').textContent())?.trim()
  const matchingSpellEntry = dictEntries.find((entry) => entry.trans.join('；') === displayedMeaning)
  expect(matchingSpellEntry).toBeDefined()
  const targetFrench = matchingSpellEntry!.name

  // Fill tiles in correct order
  const tilePool = page.locator('div.flex.flex-wrap.items-center.justify-center.gap-2 button')
  for (const char of targetFrench) {
    const tile = tilePool.filter({ hasText: new RegExp(`^${char}$`) }).and(page.locator(':not([disabled])')).first()
    await tile.click()
  }

  // Submit correct spelling
  const submitButton = page.getByRole('button', { name: '确认' })
  await expect(submitButton).toBeEnabled()
  await submitButton.click()
  await expect(page.getByText('答对了')).toBeVisible()

  // Test wrong tile order on the next word -> red state
  const nextWordButton = page.getByRole('button', { name: '下一题' })
  await nextWordButton.click()
  await expect(page.getByText('看中文释义，拼出对应的法语词')).toBeVisible()

  // Fill tiles in reverse order so position is wrong
  const poolButtons = page.locator('div.flex.flex-wrap.items-center.justify-center.gap-2 button:not([disabled])')
  const poolCount = await poolButtons.count()
  // The slot count equals empty slots in the slot row
  const slotCount = await page.locator('[aria-label^="未填槽位"]').count()
  for (let i = poolCount - 1; i >= poolCount - slotCount; i--) {
    await poolButtons.nth(i).click()
  }

  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  // Red state indicates wrong answer: text shows 答错了 and slots have border-rose-500
  await expect(page.getByText('答错了')).toBeVisible()
  await expect(page.locator('.border-rose-500').first()).toBeVisible()

  // No horizontal scroll across the view
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  // 6. Assert a vocabulary record with mode 'tap' is queued (IndexedDB wordRecords / sync queue)
  await expect.poll(async () => {
    return await page.evaluate(async () => {
      try {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('RecordDB')
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        const records = await new Promise<Array<{ mode?: string }>>((resolve, reject) => {
          const tx = database.transaction('wordRecords', 'readonly')
          const store = tx.objectStore('wordRecords')
          const req = store.getAll()
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => reject(req.error)
        })
        database.close()
        return records.some((r) => r.mode === 'tap')
      } catch {
        return false
      }
    })
  }).toBe(true)
})
