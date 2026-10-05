import { expect, test } from '@playwright/test'

const pendingMutationCount = async (page) =>
  page.evaluate(
    () =>
      Object.keys(localStorage).filter((key) => key.startsWith('qwerty-fr-study-plan-pending:')).length,
  )

test('practice, offline persistence, sync, analytics, reminders and PWA shell', async ({ browser, page, context }) => {
  await page.goto('/study-plan')
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()

  // Plan settings re-date the 26-week roadmap without erasing already recorded minutes.
  const firstMinutes = page.getByLabel(/实际学习分钟数/).first()
  await firstMinutes.fill('15')
  await page.getByLabel('考试日期').fill('2027-03-31')
  const dailyTarget = page.getByLabel('每天目标分钟')
  await dailyTarget.fill('45')
  await dailyTarget.blur()
  await expect(page.getByTestId('study-plan-settings')).toContainText('2026-10-01 → 2027-03-31')
  await expect(firstMinutes).toHaveValue('15')

  // Browser reminder is opt-in and local to this browser.
  await page.getByRole('button', { name: '开启提醒' }).click()
  await expect(page.getByRole('button', { name: '提醒已开启' })).toBeVisible()
  await page.getByLabel('学习提醒时间').fill('23:59')

  // The PWA service worker takes control and warms the current app shell.
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 15_000 })
  const manifest = await page.evaluate(async () => {
    const response = await fetch(new URL('manifest.json', document.baseURI))
    return response.json()
  })
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('./study-plan')

  // A real conjugation practice result is written to the study backend.
  await page.goto('/conjugation?verb=prendre&tense=present&mode=practice&scope=current')
  const answer = page.getByPlaceholder('例如：nous avons pris')
  await answer.fill('definitely-wrong')
  await page.getByRole('button', { name: '检查（Enter）' }).click()
  await expect(page.getByText('✗ 再看一下这个形式')).toBeVisible()

  // The wrong answer appears in the unified backend error book and can be retrained in one click.
  await page.goto('/error-book')
  await expect(page.getByText('服务端统一错题本')).toBeVisible()
  await expect(page.getByTestId('error-book-item').filter({ hasText: 'prendre' })).toBeVisible()
  await page.getByTestId('error-book-item').filter({ hasText: 'prendre' }).getByRole('button', { name: '一键重练' }).click()
  await expect(page).toHaveURL(/\/conjugation\?verb=prendre/)

  await page.goto('/study-plan')
  await expect.poll(() => pendingMutationCount(page)).toBe(0)

  // Go offline, edit progress, then prove the installed shell itself still reloads.
  await context.setOffline(true)
  const offlineMinutes = page.getByLabel(/实际学习分钟数/).first()
  await offlineMinutes.fill('23')
  await expect.poll(() => pendingMutationCount(page)).toBeGreaterThan(0)
  await page.reload()
  await expect(page.getByText('TCF Canada · 26 周学习计划')).toBeVisible()
  await expect(page.getByText(/当前离线|待同步|服务端暂不可用/).first()).toBeVisible()

  // Reconnect automatically drains the durable queue.
  await context.setOffline(false)
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect.poll(() => pendingMutationCount(page), { timeout: 20_000 }).toBe(0)
  await expect(page.locator('span').filter({ hasText: /^已与服务端合并并保存$/ })).toBeVisible()

  // Generate a portable sync code only after every offline mutation has reached the server.
  const generate = page.getByRole('button', { name: /生成同步码|轮换同步码/ })
  await generate.click()
  const syncCode = await page.getByLabel('当前学习进度同步码').inputValue()
  expect(syncCode).toMatch(/^[a-f0-9]{64}$/)

  // A fresh browser binds to the same learner and reads the same server-side analytics.
  const second = await browser.newContext()
  const secondPage = await second.newPage()
  await secondPage.goto('/study-plan')
  await secondPage.getByLabel('连接已有学习进度的同步码').fill(syncCode)
  await secondPage.getByRole('button', { name: '绑定' }).click()
  await expect(secondPage.getByText('此设备已通过同步码绑定')).toBeVisible()

  await secondPage.goto('/analysis')
  await expect(secondPage.getByText('学习趋势与错误画像')).toBeVisible()
  await expect(secondPage.getByText('错误最多的动词')).toBeVisible()
  await expect(secondPage.getByText('prendre', { exact: true }).first()).toBeVisible()
  await expect(secondPage.getByText('动词变位正确率').first()).toBeVisible()
  await expect(secondPage.getByText('打卡与成就')).toBeVisible()
  await expect(secondPage.getByText('学习周报')).toBeVisible()
  await expect(secondPage.getByText('每周总结与下周建议')).toBeVisible()

  const downloadPromise = secondPage.waitForEvent('download')
  await secondPage.getByRole('button', { name: '导出周报' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^qwerty-study-weekly-reports-/)

  await second.close()
})
