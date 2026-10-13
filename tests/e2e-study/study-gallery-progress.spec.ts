import { expect, test } from '@playwright/test'

test('dictionary progress counts distinct current chapters and excludes reviews', async ({ page }) => {
  await page.goto('/gallery')
  const card = page.getByRole('button', { name: '打开词库：基础核心词 01', exact: true })
  await expect(card).toBeVisible()
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('chapterRecords', 'readwrite')
      for (const chapter of [0, 0, -1, null, 0.5, 99])
        transaction.objectStore('chapterRecords').add({ dict: 'tcf-canada-foundation-01', chapter })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  })
  await page.reload()
  await card.scrollIntoViewIfNeeded()
  await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise<void>((resolve) => {
      const transaction = database.transaction('chapterRecords', 'readwrite')
      for (const chapter of [1, 2, 3, 4, 5]) transaction.objectStore('chapterRecords').add({ dict: 'tcf-canada-foundation-01', chapter })
      transaction.oncomplete = () => resolve()
    })
    database.close()
  })
  await page.reload()
  await card.scrollIntoViewIfNeeded()
  await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
})
