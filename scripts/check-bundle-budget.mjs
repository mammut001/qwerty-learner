import { gzipSync } from 'node:zlib'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const buildDir = 'build'
const manifestCandidates = [join(buildDir, '.vite', 'manifest.json'), join(buildDir, 'manifest.json')]
let manifest
for (const candidate of manifestCandidates) {
  try {
    manifest = JSON.parse(await readFile(candidate, 'utf8'))
    break
  } catch {}
}
if (!manifest) throw new Error('Vite manifest not found. Run the production build first.')

const entries = Object.values(manifest).filter((item) => item?.isEntry)
if (entries.length !== 1) throw new Error(`Expected one Vite entry chunk, found ${entries.length}`)

const byFile = new Map(Object.values(manifest).filter(Boolean).map((item) => [item.file, item]))
const initialFiles = new Set()
const visit = (item) => {
  if (!item || initialFiles.has(item.file)) return
  initialFiles.add(item.file)
  for (const imported of item.imports ?? []) {
    const candidate = manifest[imported] ?? byFile.get(imported)
    if (candidate) visit(candidate)
  }
}
visit(entries[0])

const jsFiles = [...new Set(Object.values(manifest).map((item) => item?.file).filter((file) => file?.endsWith('.js')))]
const sizeOf = async (file) => {
  const bytes = await readFile(join(buildDir, file))
  return { raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength }
}
const sizes = new Map()
for (const file of jsFiles) sizes.set(file, await sizeOf(file))

const kib = (value) => Math.round((value / 1024) * 10) / 10
const initialGzip = [...initialFiles]
  .filter((file) => file.endsWith('.js'))
  .reduce((sum, file) => sum + (sizes.get(file)?.gzip ?? 0), 0)
const totalGzip = jsFiles.reduce((sum, file) => sum + (sizes.get(file)?.gzip ?? 0), 0)
const largest = jsFiles
  .map((file) => ({ file, ...(sizes.get(file) ?? { raw: 0, gzip: 0 }) }))
  .sort((a, b) => b.gzip - a.gzip)[0]

const budgets = {
  initialGzip: 450 * 1024,
  largestChunkGzip: 650 * 1024,
  totalGzip: 2200 * 1024,
}

console.log(JSON.stringify({
  initialGzipKiB: kib(initialGzip),
  largestChunk: largest ? { file: largest.file, gzipKiB: kib(largest.gzip) } : null,
  totalJsGzipKiB: kib(totalGzip),
  initialFiles: [...initialFiles].filter((file) => file.endsWith('.js')),
}, null, 2))

const failures = []
if (initialGzip > budgets.initialGzip)
  failures.push(`initial JS gzip ${kib(initialGzip)} KiB > ${kib(budgets.initialGzip)} KiB`)
if (largest && largest.gzip > budgets.largestChunkGzip)
  failures.push(`largest JS chunk ${largest.file} ${kib(largest.gzip)} KiB > ${kib(budgets.largestChunkGzip)} KiB`)
if (totalGzip > budgets.totalGzip)
  failures.push(`total JS gzip ${kib(totalGzip)} KiB > ${kib(budgets.totalGzip)} KiB`)
if (failures.length) throw new Error('Bundle budget exceeded:\n- ' + failures.join('\n- '))
