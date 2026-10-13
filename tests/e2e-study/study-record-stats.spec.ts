import { expect, test } from '@playwright/test'

test('chapter record statistics handle mistakes and zero denominators', async ({ page }) => {
  await page.goto('/typing')
  const values = await page.evaluate(async () => {
    const { ChapterRecord } = await new Function('return import("/src/utils/db/record.ts")')()
    const normal = new ChapterRecord('test', 0, 30, 8, 2, 2, [0, 1, 2], 4, [])
    const empty = new ChapterRecord('test', 0, 0, 0, 0, 0, [], 0, [])
    const immediate = new ChapterRecord('test', 0, 0, 7, 1, 1, [], 1, [])
    return [normal, empty, immediate].map((record) => ({
      wpm: record.wpm,
      inputAccuracy: record.inputAccuracy,
      wordAccuracy: record.wordAccuracy,
    }))
  })
  expect(values).toEqual([
    { wpm: 4, inputAccuracy: 80, wordAccuracy: 75 },
    { wpm: 0, inputAccuracy: 0, wordAccuracy: 0 },
    { wpm: 0, inputAccuracy: 88, wordAccuracy: 0 },
  ])
})
