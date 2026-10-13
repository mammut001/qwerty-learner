import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('failed saved-review reads offer retry and recover the existing progress', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/dicts/TCF_Canada_Foundation_01.json', (route) => route.fulfill({ json: [{ name: 'bonjour', trans: ['你好'] }] }))
  await page.goto('/gallery?dict=tcf-canada-foundation-01')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(['wordRecords', 'reviewRecords'], 'readwrite')
      transaction.objectStore('wordRecords').add({
        word: 'bonjour',
        dict: 'tcf-canada-foundation-01',
        chapter: 0,
        wrongCount: 1,
        timing: [],
        mistakes: { 0: ['x'] },
        timeStamp: Date.now(),
      })
      transaction.objectStore('reviewRecords').add({
        dict: 'tcf-canada-foundation-01',
        words: [{ name: 'bonjour', trans: ['你好'] }],
        index: 0,
        isFinished: false,
        createTime: Date.now(),
      })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  })
  await page.reload()
  await page.evaluate(() => {
    const original = IDBIndex.prototype.openCursor
    const state = window as Window & { failReviewRead?: boolean }
    state.failReviewRead = true
    IDBIndex.prototype.openCursor = function (...args) {
      if (state.failReviewRead && this.objectStore.name === 'reviewRecords') throw new DOMException('Read unavailable', 'UnknownError')
      return original.apply(this, args)
    }
    const originalGetAll = IDBIndex.prototype.getAll
    IDBIndex.prototype.getAll = function (...args) {
      if (state.failReviewRead && this.objectStore.name === 'reviewRecords') throw new DOMException('Read unavailable', 'UnknownError')
      return originalGetAll.apply(this, args)
    }
  })
  await page.getByText('错题回顾', { exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('复习进度暂时读取失败')
  await expect(page.getByRole('button', { name: '开始复习', exact: true })).toBeDisabled()
  await page.evaluate(() => {
    ;(window as Window & { failReviewRead?: boolean }).failReviewRead = false
  })
  await page.getByRole('button', { name: '重新读取复习进度' }).click()
  await expect(page.getByRole('alert')).not.toBeAttached()
  await page.getByRole('button', { name: '继续当前进度' }).click()
  await expect(page).toHaveURL(/\/typing$/)
  await expect(page.getByRole('link', { name: /基础核心词 01 错题复习/ })).toBeVisible()
  expect(errors).toEqual([])
})
