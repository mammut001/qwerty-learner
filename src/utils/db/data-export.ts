import { db } from '.'
import { getCurrentDate, recordDataAction } from '..'

export type ExportProgress = {
  totalRows?: number
  completedRows: number
  done: boolean
}

export type ImportProgress = {
  totalRows?: number
  completedRows: number
  done: boolean
}

export async function exportDatabase(callback: (exportProgress: ExportProgress) => boolean) {
  const [pako, { saveAs }] = await Promise.all([import('pako'), import('file-saver'), import('dexie-export-import')])

  const blob = await db.export({
    progressCallback: ({ totalRows, completedRows, done }) => {
      return callback({ totalRows, completedRows, done })
    },
  })
  const [wordCount, chapterCount] = await Promise.all([db.wordRecords.count(), db.chapterRecords.count()])

  const json = await blob.text()
  const compressed = pako.gzip(json)
  const compressedBlob = new Blob([compressed])
  const currentDate = getCurrentDate()
  saveAs(compressedBlob, `Qwerty-Learner-User-Data-${currentDate}.gz`)
  recordDataAction({ type: 'export', size: compressedBlob.size, wordCount, chapterCount })
}

export async function importDatabase(onStart: () => void, callback: (importProgress: ImportProgress) => boolean) {
  const file = await new Promise<File | undefined>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.gz,application/gzip'
    input.addEventListener('change', () => resolve(input.files?.[0]), { once: true })
    input.addEventListener('cancel', () => resolve(undefined), { once: true })
    input.click()
  })
  if (!file) return false

  onStart()

  const [pako] = await Promise.all([import('pako'), import('dexie-export-import')])
  const compressed = await file.arrayBuffer()
  const json = pako.ungzip(compressed, { to: 'string' })
  const blob = new Blob([json])

  await db.import(blob, {
    acceptVersionDiff: true,
    acceptMissingTables: true,
    acceptNameDiff: false,
    acceptChangedPrimaryKey: false,
    overwriteValues: true,
    clearTablesBeforeImport: true,
    progressCallback: ({ totalRows, completedRows, done }) => {
      return callback({ totalRows, completedRows, done })
    },
  })

  const [wordCount, chapterCount] = await Promise.all([db.wordRecords.count(), db.chapterRecords.count()])
  recordDataAction({ type: 'import', size: file.size, wordCount, chapterCount })
  return true
}
