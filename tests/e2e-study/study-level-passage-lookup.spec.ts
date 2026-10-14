import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('echelle:fixedVariant', '0')
  })
})

test('level passages and revealed listening transcripts open the dictionary popover', async ({ page }) => {
  await page.route('**/api/study-plan/dictionary**', (route) => {
    const query = new URL(route.request().url()).searchParams.get('q') ?? ''
    return route.fulfill({
      json: {
        query,
        word: query,
        phone: '',
        source: '现代法汉汉法词典',
        senses: [{ pos: 'n.', gloss: '释义' }],
        examples: [{ fr: 'Un mot dans la phrase.', zh: '句子里的一个词。' }],
      },
    })
  })
  await page.route('**://*.wiktionary.org/**', (route) => route.abort())

  const reading = page.getByTestId('level-item-n1-reading-0')
  await page.goto('/levels/1?item=n1-reading-0')
  const passageWord = reading.getByRole('button', { name: 'conversation', exact: true })
  await passageWord.scrollIntoViewIfNeeded()
  await expect(passageWord).toBeVisible()
  await passageWord.click()
  const popover = page.getByTestId('dictionary-popover')
  await expect(popover).toHaveCount(1)
  await expect(popover).toHaveAttribute('aria-label', '查词：conversation')
  await expect(popover.getByRole('link', { name: '在词典里查看完整释义 →' })).toHaveAttribute(
    'href',
    `/dictionary?q=${encodeURIComponent('conversation')}`,
  )
  await expect(popover.getByRole('button', { name: 'phrase', exact: true })).toBeVisible()
  await popover.getByRole('button', { name: 'phrase', exact: true }).click()
  await expect(popover).toHaveCount(1)
  await expect(popover).toHaveAttribute('aria-label', '查词：phrase')
  await expect(page).toHaveURL(/\/levels\/1\?item=n1-reading-0$/)
  await popover.getByRole('button', { name: '关闭查词' }).focus()
  await page.keyboard.press('Escape')
  await expect(popover).toHaveCount(0)
  await expect(passageWord).toBeFocused()

  const listening = page.getByTestId('level-item-n1-listening-0')
  await page.goto('/levels/1?item=n1-listening-0')
  await expect(listening.getByTestId('listening-transcript')).toHaveCount(0)
  await listening.getByRole('button', { name: '播放录音' }).click()
  await expect(listening.getByTestId('listening-transcript')).toHaveCount(0)
  await listening.getByRole('button', { name: '看原文（先听再看）' }).click()
  await expect(listening.getByTestId('listening-transcript')).toBeVisible()
  await listening.getByRole('button', { name: '隐藏原文' }).click()
  await expect(listening.getByTestId('listening-transcript')).toHaveCount(0)
  await listening.getByRole('button', { name: '看原文（先听再看）' }).click()
  const transcriptWord = listening.getByTestId('listening-transcript').getByRole('button', { name: 'infirmière', exact: true })
  await transcriptWord.click()
  await expect(popover).toHaveCount(1)
  await expect(popover).toHaveAttribute('aria-label', '查词：infirmière')
  await expect(popover.getByRole('link', { name: '在词典里查看完整释义 →' })).toHaveAttribute(
    'href',
    `/dictionary?q=${encodeURIComponent('infirmière')}`,
  )
  await expect(page).toHaveURL(/\/levels\/1\?item=n1-listening-0$/)

  await page.goto('/levels/2?item=n2-gr-present')
  const example = page.getByText('我们在蒙特利尔住了两年。').locator('..')
  await expect(example.getByRole('button', { name: 'habitons', exact: true })).toBeVisible()
  await expect(example.getByRole('button', { name: '我们在蒙特利尔住了两年。' })).toHaveCount(0)
})
