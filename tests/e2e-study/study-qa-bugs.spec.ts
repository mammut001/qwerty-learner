import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 800 } })

test('unknown routes show a 404 without redirecting to the study-plan login wall', async ({ page }) => {
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: true, signedIn: false, user: null } }),
  )
  await page.goto('/nonexistent')
  await expect(page.getByTestId('not-found-page')).toContainText('页面不存在')
  await expect(page).toHaveURL(/\/nonexistent$/)
})

test('admin routes verify a bearer token against a protected API, never the public config endpoint', async ({ page }) => {
  const verified: string[] = []
  await page.route('**/api/study-plan/admin/config', (route) => route.fulfill({ json: { enabled: true } }))
  await page.route('**/api/study-plan/admin/placement-cohort', (route) => {
    const auth = route.request().headers().authorization || ''
    verified.push(auth)
    return route.fulfill({ status: auth === 'Bearer valid-admin' ? 200 : 401, json: { ok: auth === 'Bearer valid-admin' } })
  })
  await page.goto('/admin')
  await expect(page.getByTestId('admin-access-denied')).toBeVisible()
  await expect(page.getByRole('heading', { name: '管理员控制台' })).toHaveCount(0)
  await page.getByLabel('管理员令牌').fill('wrong')
  await page.getByRole('button', { name: '验证管理员权限' }).click()
  await expect(page.getByRole('alert')).toContainText('无效')
  await page.getByLabel('管理员令牌').fill('valid-admin')
  await page.getByRole('button', { name: '验证管理员权限' }).click()
  await expect(page.getByRole('heading', { name: '管理员控制台' })).toBeVisible()
  expect(verified).toContain('Bearer valid-admin')
  await page.goto('/admin/users')
  await expect(page.getByTestId('admin-access-denied')).toBeVisible()
})

test('tap deep links retain their dictionary/chapter across reload and selection changes', async ({ page }) => {
  await page.goto('/tap?dict=tcf-canada-foundation-01&chapter=0')
  await expect(page).toHaveURL(/\/tap\?dict=tcf-canada-foundation-01&chapter=0$/)
  await expect(page.getByText('第 1 章', { exact: false }).first()).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/tap\?dict=tcf-canada-foundation-01&chapter=0$/)
  await page.getByRole('button', { name: '换词库' }).first().click()
  await page.getByRole('button', { name: '第 2 章' }).click()
  await expect(page).toHaveURL(/\/tap\?dict=tcf-canada-foundation-01&chapter=1$/)
  await page.reload()
  await expect(page.getByText('第 2 章', { exact: false }).first()).toBeVisible()
})

test('guest typing sends no protected sync or analytics requests', async ({ page }) => {
  const protectedRequests: string[] = []
  await page.route('**/api/study-plan/auth', (route) =>
    route.fulfill({ json: { enabled: true, required: true, signedIn: false, user: null } }),
  )
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (
      url.pathname.startsWith('/api/study-plan') &&
      !['/api/study-plan/auth', '/api/study-plan/access'].includes(url.pathname)
    ) {
      protectedRequests.push(url.pathname)
    }
  })
  await page.goto('/typing')
  await expect(page.getByRole('button', { name: /第 \d+ 章/ })).toBeVisible()
  await page.waitForTimeout(700)
  expect(protectedRequests).toEqual([])
})

test('normal French typos never trigger the extension warning; actual input tampering self-clears', async ({ page }) => {
  await page.goto('/word-lists')
  await page.getByLabel('词表名称').fill('输入冲突测试')
  await page.getByLabel('词条', { exact: true }).fill('être = 是\nmerci = 谢谢')
  await page.getByTestId('word-list-practise').click()
  await expect(page).toHaveURL(/\/typing$/)
  await expect(page.getByRole('link', { name: '输入冲突测试' })).toBeVisible()
  // Enter on the previously focused button/link need not start typing. Use the
  // actual start control, and target the hidden practice input (not the editor).
  await page.getByRole('button', { name: '开始', exact: true }).click()
  const typingInput = page.locator('textarea[spellcheck="false"]')
  await expect(typingInput).toBeFocused()
  const letters = page.locator('div[lang="fr"] span.font-mono')
  await expect.poll(async () => (await letters.allTextContents()).join('')).toBe('être')
  // "être" begins with ê: the unaccented e is wrong at index 0, not 1.
  for (let i = 0; i < 3; i++) {
    await page.keyboard.insertText('etre')
    await expect(letters.first()).toHaveClass(/text-red-600/)
    await expect(letters.first()).toHaveClass(/text-gray-600/)
  }
  await expect(page.getByText('插件冲突！')).toHaveCount(0)
  const injectConflict = async () => {
    await typingInput.evaluate((element) => {
      element.value = 'tampered'
      element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'e' }))
    })
  }
  await injectConflict()
  await expect(page.getByText('插件冲突！')).toBeVisible()
  await expect(page.getByText('插件冲突！')).toHaveCount(0, { timeout: 7000 })
  await injectConflict()
  await expect(page.getByText('插件冲突！')).toBeVisible()
  await page.keyboard.insertText('être')
  await expect(page.getByText('插件冲突！')).toHaveCount(0)
  await expect(page.getByText('谢谢', { exact: true })).toBeVisible()
})

test('conjugation defaults to the first verb and respects an explicit link', async ({ page }) => {
  await page.goto('/conjugation')
  await expect(page.getByRole('heading', { name: 'être' })).toBeVisible()
  await page.goto('/conjugation?verb=prendre')
  await expect(page.getByRole('heading', { name: 'prendre' })).toBeVisible()
})
