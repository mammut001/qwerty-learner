import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'America/Toronto', serviceWorkers: 'block' })

for (const { instant, expected } of [
  {
    instant: '2026-10-14T01:00:00Z',
    expected: ['2026-10-12', '2026-10-11', '2026-10-10', '2026-10-09', '2026-10-08', '2026-10-07', '2026-10-06'],
  },
  {
    instant: '2026-01-01T02:00:00Z',
    expected: ['2025-12-30', '2025-12-29', '2025-12-28', '2025-12-27', '2025-12-26', '2025-12-25', '2025-12-24'],
  },
]) {
  test(`makeup dates follow local calendar days at ${instant}`, async ({ page }) => {
    await page.addInitScript((instant) => {
      const NativeDate = Date
      const fixed = NativeDate.parse(instant)
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
    }, instant)
    await page.goto('/analysis')
    const buttons = page.getByRole('button', { name: /^\d{4}-\d{2}-\d{2} 补签$/ })
    await expect(buttons).toHaveCount(7)
    expect(await buttons.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))).toEqual(
      expected.map((day) => `${day} 补签`),
    )
  })
}
