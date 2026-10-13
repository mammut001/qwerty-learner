import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.use({ timezoneId: 'America/Toronto', serviceWorkers: 'block' })

test('statistics exports use the local calendar date and preserve their payloads', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date
    const fixed = NativeDate.parse('2026-10-14T01:00:00Z')
    window.Date = new Proxy(NativeDate, {
      construct(target, args, newTarget) {
        return Reflect.construct(target, args.length ? args : [fixed], newTarget)
      },
      apply() {
        return new NativeDate(fixed).toString()
      },
      get(target, property, receiver) {
        return property === 'now' ? () => fixed : Reflect.get(target, property, receiver)
      },
    })
  })
  const report = { format: 'qwerty-study-weekly-reports', version: 1, exportedAt: '2026-10-14T01:00:00Z', items: [] }
  const csv = 'word,meaning\nbonjour,你好\n'
  await page.route('**/api/study-plan/weekly-reports/export?**', (route) => route.fulfill({ json: report }))
  await page.route('**/api/study-plan/records.csv', (route) => route.fulfill({ contentType: 'text/csv', body: csv }))
  await page.goto('/analysis')
  const jsonPending = page.waitForEvent('download')
  await page.getByRole('button', { name: '周报 JSON', exact: true }).click()
  const json = await jsonPending
  expect(json.suggestedFilename()).toBe('qwerty-study-weekly-reports-2026-10-13.json')
  expect(JSON.parse(await readFile((await json.path())!, 'utf8'))).toEqual(report)
  const csvPending = page.waitForEvent('download')
  await page.getByRole('button', { name: '学习记录 CSV', exact: true }).click()
  const file = await csvPending
  expect(file.suggestedFilename()).toBe('qwerty-study-records-2026-10-13.csv')
  expect((await readFile((await file.path())!, 'utf8')).replace(/^\uFEFF/, '')).toBe(csv)
})
