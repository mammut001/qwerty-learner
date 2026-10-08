import { type Page, expect, test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 800 } })

type ShellReading = {
  mark: string | null
  connected: boolean
  navigations: number
  height: number
  loader: boolean
  flashed: boolean
  headers: number
}

const mainNav: { name: string; url: string }[] = [
  { name: '定级测试', url: '/placement-test' },
  { name: '等级课程', url: '/levels' },
  { name: '单词跟打', url: '/typing' },
  { name: '我的词表', url: '/word-lists' },
  { name: '查词', url: '/dictionary' },
  { name: '语法', url: '/grammar-session' },
  { name: '动词变位', url: '/conjugation' },
  { name: '错题本', url: '/error-book' },
  { name: '统计', url: '/analysis' },
  { name: '学习计划', url: '/study-plan' },
]

const examNav: { name: string; url: string }[] = [
  { name: '总览', url: '/tcf' },
  { name: '听力', url: '/tcf-listening' },
  { name: '阅读', url: '/tcf-reading' },
  { name: '写作', url: '/tcf-writing' },
  { name: '口语', url: '/tcf-speaking' },
  { name: '能力量表', url: '/echelle' },
]

async function readShell(page: Page): Promise<ShellReading> {
  return page.evaluate(() => {
    const win = window as Window & { __shellMark?: string; __loaderFlashed?: boolean }
    const marked = document.querySelector<HTMLElement>('[data-shell-node="1"]')
    const loader = [...document.querySelectorAll('.fixed.inset-0')].some((el) => {
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
      const rect = el.getBoundingClientRect()
      const covers = rect.width >= window.innerWidth - 2 && rect.height >= window.innerHeight - 2
      return covers && Boolean(el.querySelector('[role="status"]'))
    })
    return {
      mark: win.__shellMark ?? null,
      connected: Boolean(marked?.isConnected),
      navigations: performance.getEntriesByType('navigation').length,
      height: marked?.getBoundingClientRect().height ?? -1,
      loader,
      flashed: Boolean(win.__loaderFlashed),
      headers: document.querySelectorAll('[data-testid="app-shell-header"]').length,
    }
  })
}

function expectStable(shell: ShellReading, height: number, step: string) {
  expect(shell.mark, step).toBe('stay')
  expect(shell.connected, step).toBe(true)
  expect(shell.navigations, step).toBe(1)
  expect(shell.loader, step).toBe(false)
  expect(shell.flashed, step).toBe(false)
  expect(shell.headers, step).toBe(1)
  expect(Math.abs(shell.height - height), `${step} height ${shell.height} vs ${height}`).toBeLessThanOrEqual(1)
}

async function waitForDestination(page: Page, url: string) {
  await expect(page).toHaveURL(new RegExp(`${url}$`), { timeout: 30_000 })
  const ready: Record<string, () => Promise<void>> = {
    '/placement-test': () => expect(page.getByRole('heading', { name: '找到你的法语起点' })).toBeVisible({ timeout: 30_000 }),
    '/levels': () => expect(page.getByRole('heading', { name: '等级课程' })).toBeVisible({ timeout: 30_000 }),
    '/typing': () => expect(page.getByRole('button', { name: /第 \d+ 章/ })).toBeVisible({ timeout: 30_000 }),
    '/word-lists': () => expect(page.getByRole('heading', { name: '我的词表' })).toBeVisible({ timeout: 30_000 }),
    '/dictionary': () => expect(page.getByRole('heading', { name: '查词' })).toBeVisible({ timeout: 30_000 }),
    '/grammar-session': () => expect(page.getByRole('button', { name: '开始 30 分钟' })).toBeVisible({ timeout: 30_000 }),
    '/conjugation': () => expect(page.getByRole('heading', { name: 'Conjugaison' })).toBeVisible({ timeout: 30_000 }),
    '/error-book': () => expect(page.getByRole('heading', { name: '词汇 · 语法 · 动词变位' })).toBeVisible({ timeout: 30_000 }),
    '/analysis': () => expect(page.getByRole('heading', { name: '进度、掌握度与完成预测' })).toBeVisible({ timeout: 30_000 }),
    '/study-plan': () => expect(page.getByText('26 周学习计划')).toBeVisible({ timeout: 30_000 }),
    '/tcf': () => expect(page.getByRole('heading', { name: 'NCLC 7 总览' })).toBeVisible({ timeout: 30_000 }),
    '/tcf-listening': () => expect(page.getByRole('heading', { name: '39 题完整模拟' })).toBeVisible({ timeout: 30_000 }),
    '/tcf-reading': () => expect(page.getByRole('heading', { name: '39 题完整模拟' })).toBeVisible({ timeout: 30_000 }),
    '/tcf-writing': () => expect(page.getByRole('heading', { name: '写作 3 任务完整模拟' })).toBeVisible({ timeout: 30_000 }),
    '/tcf-speaking': () => expect(page.getByRole('heading', { name: '口语 3 任务完整模拟' })).toBeVisible({ timeout: 30_000 }),
    '/echelle': () => expect(page.getByRole('heading', { name: '魁北克法语能力量表' })).toBeVisible({ timeout: 30_000 }),
  }
  await ready[url]()
}

async function clickMainNav(page: Page, name: string) {
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name, exact: true }).click()
}

test('main nav and TCF 模考 stay in one document with a stable header', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/study-plan')
  await expect(page.getByTestId('app-shell-header')).toBeVisible()
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
  await expect(page.getByTestId('access-gate')).toHaveCount(0)

  const height = await page.evaluate(() => {
    const win = window as Window & { __shellMark?: string; __loaderFlashed?: boolean }
    win.__shellMark = 'stay'
    win.__loaderFlashed = false
    const header = document.querySelector<HTMLElement>('[data-testid="app-shell-header"]')
    if (!header) return 0
    header.dataset.shellNode = '1'
    const seesLoader = () =>
      [...document.querySelectorAll('.fixed.inset-0')].some((el) => {
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
        const rect = el.getBoundingClientRect()
        return rect.width >= window.innerWidth - 2 && rect.height >= window.innerHeight - 2 && Boolean(el.querySelector('[role="status"]'))
      })
    const observer = new MutationObserver(() => {
      if (seesLoader()) win.__loaderFlashed = true
    })
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true })
    return new Promise<number>((resolve) => {
      document.fonts.ready.then(() => resolve(header.getBoundingClientRect().height))
    })
  })
  expect(height).toBeGreaterThan(40)

  for (const item of mainNav) {
    await clickMainNav(page, item.name)
    await waitForDestination(page, item.url)
    const shell = await readShell(page)
    console.info(`shell ${item.url} ${JSON.stringify(shell)}`)
    expectStable(shell, height, item.url)
  }

  for (const item of examNav) {
    await page.getByRole('button', { name: 'TCF 模考' }).click()
    await page.getByRole('menuitem', { name: new RegExp(item.name) }).click()
    await waitForDestination(page, item.url)
    const shell = await readShell(page)
    console.info(`shell ${item.url} ${JSON.stringify(shell)}`)
    expectStable(shell, height, item.url)
  }

  await clickMainNav(page, '单词跟打')
  await waitForDestination(page, '/typing')
  await expect(page.getByTestId('app-shell-header').getByRole('button', { name: /第 \d+ 章/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'TCF 模考' }).click()
  const label = page.getByRole('menuitem', { name: /能力量表/ }).getByText('能力量表', { exact: true })
  await expect(label).toBeVisible()
  const menuCheck = await label.evaluate((el) => {
    const panel = el.closest('.w-80')
    if (!panel) return { opaque: false, lines: 0, height: 0, topIsMenu: false, background: '' }
    const background = getComputedStyle(panel).backgroundColor
    const range = document.createRange()
    range.selectNodeContents(el)
    const rect = el.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    const link = hit?.closest('a')
    return {
      opaque: /^rgb\(255,\s*255,\s*255\)$/.test(background) || /^rgba\(255,\s*255,\s*255,\s*1\)$/.test(background),
      lines: range.getClientRects().length,
      height: rect.height,
      topIsMenu: Boolean(link?.closest('.w-80') && (link.textContent ?? '').includes('能力量表')),
      background,
    }
  })
  console.info(`typing menu ${JSON.stringify(menuCheck)}`)
  expect(menuCheck.opaque).toBe(true)
  expect(menuCheck.lines).toBe(1)
  expect(menuCheck.height).toBeLessThan(32)
  expect(menuCheck.topIsMenu).toBe(true)
  const typingShell = await readShell(page)
  console.info(`shell /typing menu-open ${JSON.stringify(typingShell)}`)
  expectStable(typingShell, height, '/typing menu')

  await clickMainNav(page, '语法')
  await waitForDestination(page, '/grammar-session')
  await expect(page.getByTestId('grammar-topic-passe-compose-imparfait')).toBeVisible()
  const grammarList = await readShell(page)
  console.info(`shell /grammar-session topics ${JSON.stringify(grammarList)}`)
  expectStable(grammarList, height, '/grammar-session topics')
  await page.getByRole('button', { name: '开始 30 分钟' }).click()
  await expect(page.getByRole('link', { name: '退出' })).toBeVisible()
  await expect(page.getByTestId('app-shell-header').getByRole('link', { name: '退出' })).toHaveCount(0)
  const grammarRun = await readShell(page)
  console.info(`shell /grammar-session running ${JSON.stringify(grammarRun)}`)
  expectStable(grammarRun, height, '/grammar-session running')

  await clickMainNav(page, '等级课程')
  await waitForDestination(page, '/levels')
  await page.getByTestId('levels-back-home').click()
  await waitForDestination(page, '/study-plan')
  const backHome = await readShell(page)
  console.info(`shell levels-back-home ${JSON.stringify(backHome)}`)
  expectStable(backHome, height, 'levels-back-home')

  const shotDir = process.env.NAV_SEAMLESS_SHOTS
  if (shotDir) {
    await page.screenshot({ path: `${shotDir}/nav-study-plan.png` })
    await clickMainNav(page, '单词跟打')
    await waitForDestination(page, '/typing')
    await page.screenshot({ path: `${shotDir}/nav-typing.png` })
  }
})
