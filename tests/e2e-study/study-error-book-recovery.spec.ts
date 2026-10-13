import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

const item = (label: string, kind = 'vocabulary') => ({
  itemId: label,
  label,
  kind,
  sourceId: label,
  context: {},
  mastered: false,
  errorCount: 1,
  correctStreak: 0,
  lastWrongAt: null,
})

test('a failed error book request shows retry without claiming the list is empty', async ({ page }) => {
  let fail = true
  await page.route('**/error-book?**', (route) =>
    route.fulfill({
      status: fail ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(fail ? { error: 'unavailable' } : { items: [item('恢复后的错词')] }),
    }),
  )
  await page.goto('/error-book')
  await expect(page.getByRole('alert')).toContainText('错题本暂时读取失败')
  await expect(page.getByText('当前筛选下没有错题。')).not.toBeVisible()
  fail = false
  await page.getByRole('button', { name: '重新读取错题本' }).click()
  await expect(page.getByTestId('error-book-item')).toContainText('恢复后的错词')
  await expect(page.getByRole('alert')).not.toBeAttached()
})

test('a slow earlier filter cannot overwrite the newest error book results', async ({ page }) => {
  let release: () => void = () => undefined
  let received: () => void = () => undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const started = new Promise<void>((resolve) => {
    received = resolve
  })
  await page.route('**/error-book?**', async (route) => {
    const type = new URL(route.request().url()).searchParams.get('type')
    if (type === 'grammar') {
      received()
      await gate
    }
    await route.fulfill({
      json: {
        items: [item(type === 'grammar' ? '旧语法结果' : type === 'conjugation' ? '最新变位结果' : '初始结果', type || 'vocabulary')],
      },
    })
  })
  await page.goto('/error-book')
  await expect(page.getByTestId('error-book-item')).toContainText('初始结果')
  await page.getByLabel('错题类型').selectOption('grammar')
  await started
  await page.getByLabel('错题类型').selectOption('conjugation')
  await expect(page.getByTestId('error-book-item')).toContainText('最新变位结果')
  const response = page.waitForResponse((res) => res.url().includes('/error-book?') && res.url().includes('type=grammar'))
  release()
  await (await response).finished()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await expect(page.getByTestId('error-book-item')).toContainText('最新变位结果')
  await expect(page.getByText('旧语法结果')).not.toBeAttached()
})

test('restoring connectivity reloads a failed error book automatically', async ({ page }) => {
  let fail = true
  await page.route('**/error-book?**', (route) =>
    route.fulfill({
      status: fail ? 503 : 200,
      json: fail ? { error: 'unavailable' } : { items: [item('联网后恢复')] },
    }),
  )
  await page.goto('/error-book')
  await expect(page.getByRole('alert')).toContainText('错题本暂时读取失败')
  fail = false
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect(page.getByTestId('error-book-item')).toContainText('联网后恢复')
  await expect(page.getByRole('alert')).not.toBeAttached()
})

test('grammar retry opens the topic recorded with the mistake', async ({ page }) => {
  await page.route('**/error-book?**', (route) =>
    route.fulfill({
      json: { items: [{ ...item('重练虚拟式', 'grammar'), context: { topic: 'subjonctif vs indicatif' } }] },
    }),
  )
  await page.goto('/error-book')
  await page.getByRole('button', { name: '一键重练' }).click()
  await expect(page).toHaveURL(/grammar-session\?topic=subjonctif-indicatif/)
  await expect(page.getByRole('heading', { name: 'Subjonctif vs indicatif', exact: true })).toBeVisible()
  await expect(page.getByTestId('grammar-topic-subjonctif-indicatif')).toHaveAttribute('aria-checked', 'true')
})

test('an unrelated unfinished grammar draft does not replace the requested retry topic', async ({ page }) => {
  await page.goto('/grammar-session?topic=passe-compose-imparfait')
  await page.getByRole('button', { name: '开始 30 分钟' }).click()
  await expect(page.getByText(/第 1 \/ 3 组/)).toBeVisible()
  await page.getByRole('button', { name: /^A\./ }).first().click()
  await page.goto('/grammar-session?topic=subjonctif-indicatif')
  await expect(page.getByRole('heading', { name: 'Subjonctif vs indicatif', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '开始 30 分钟' })).toBeVisible()
})
