// Fill missing offline Chinese senses from direct Wiktionary French → Chinese data.
// node scripts/enrich-dictionary-chinese.mjs [--source-dir .tmp/dictionary] [--out-dir public/lexicon/fr]
import { createReadStream, createWriteStream, existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { pathToFileURL } from 'node:url'
import { createGunzip } from 'node:zlib'
import * as OpenCC from 'opencc-js'

const simplify = OpenCC.Converter({ from: 'tw', to: 'cn' })
const skipped = new Set(['name', 'prefix', 'suffix', 'interfix', 'infix', 'character', 'symbol', 'punct', 'circumfix'])
const dated = new Set(['obsolete', 'archaic', 'dated', 'historical', 'rare'])
const chineseLanguages = new Set(['zh', 'cmn', 'zh-Hans', 'zh-Hant'])
const hasChinese = (text) => /[\u3400-\u9fff]/u.test(text)
const usefulSense = (sense) => !sense.form_of && !(sense.tags ?? []).some((tag) => tag === 'form-of' || dated.has(tag))
const clean = (text) => simplify(text.replace(/\s+/g, ' ').trim()).slice(0, 160)

export function chineseGlosses(entry, source) {
  if (entry.lang_code !== 'fr' || !entry.word || skipped.has(entry.pos)) return []
  const values =
    source === 'zh'
      ? (entry.senses ?? []).filter(usefulSense).map((sense) => sense.glosses?.at(-1))
      : (entry.translations ?? [])
          .filter((translation) => chineseLanguages.has(translation.lang_code) && usefulSense(translation))
          .filter((translation) => {
            // sense_index is one based. Do not import obsolete senses or inflected-form translations.
            const sense = entry.senses?.[translation.sense_index - 1]
            return !sense || usefulSense(sense)
          })
          .map((translation) => translation.word)
  return [...new Set(values.filter((text) => typeof text === 'string' && hasChinese(text)).map(clean))].slice(0, 6)
}

// Never attach a noun's meaning to a homographic verb or replace an existing Chinese definition.
export function mergeChinese(shard, entry, glosses) {
  if (!glosses.length) return false
  const word = entry.word.normalize('NFC')
  const rows = shard.e[word] ?? []
  let row = rows.find((item) => item[0] === entry.pos)
  if (row?.[4].length) return false
  if (!row) {
    row = [entry.pos ?? 'unknown', '', '', [], []]
    rows.push(row)
    shard.e[word] = rows
  }
  row[4] = glosses
  row[1] ||= (entry.sounds ?? []).find((sound) => sound.ipa)?.ipa ?? ''
  return true
}

function shardOf(word) {
  const key = word.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'").trim()
  return [key[0], key[1]].map((char) => (char && /[a-z]/.test(char) ? char : '_')).join('')
}

async function sourceFile(sourceDir, file, url) {
  const path = join(sourceDir, file)
  if (existsSync(path)) return path
  await mkdir(sourceDir, { recursive: true })
  const temporary = `${path}.part`
  try {
    console.log(`Downloading ${url}`)
    const response = await fetch(url)
    if (!response.ok || !response.body) throw new Error(`Dictionary download failed: ${response.status}`)
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary))
    await rename(temporary, path)
  } catch (error) {
    await rm(temporary, { force: true })
    throw error
  }
  return path
}

// JSONL uses LF as its delimiter. readline also splits valid U+2028/U+2029 inside JSON strings.
export async function* readJsonLines(input) {
  input.setEncoding('utf8')
  let pending = ''
  for await (const chunk of input) {
    pending += chunk
    let start = 0
    let end
    while ((end = pending.indexOf('\n', start)) !== -1) {
      const line = pending.slice(start, end).trim()
      if (line) yield JSON.parse(line)
      start = end + 1
    }
    pending = pending.slice(start)
  }
  if (pending.trim()) yield JSON.parse(pending)
}

export async function enrichChinese({ sourceDir = '.tmp/dictionary', outDir = 'public/lexicon/fr' } = {}) {
  const shards = new Map()
  for (const file of await readdir(outDir)) {
    if (/^[a-z_]{2}\.json$/.test(file)) shards.set(file.slice(0, 2), JSON.parse(await readFile(join(outDir, file), 'utf8')))
  }
  const coverage = () => {
    const words = new Set()
    for (const data of shards.values()) {
      for (const [word, entries] of Object.entries(data.e)) {
        if (entries.some((row) => row[4].length) || data.s[word]?.some(hasChinese)) words.add(word)
      }
      for (const [word, meanings] of Object.entries(data.s)) if (meanings.some(hasChinese)) words.add(word)
    }
    return words.size
  }
  const before = coverage()
  const changed = new Set()
  const sources = [
    ['zh', 'fr-zh.jsonl', 'https://kaikki.org/zhwiktionary/%E6%B3%95%E8%AF%AD/kaikki.org-dictionary-%E6%B3%95%E8%AF%AD.jsonl'],
    ['fr', 'fr-raw.jsonl.gz', 'https://kaikki.org/frwiktionary/raw-wiktextract-data.jsonl.gz'],
  ]
  for (const [source, file, url] of sources) {
    const path = await sourceFile(sourceDir, file, url)
    const input = file.endsWith('.gz') ? createReadStream(path).pipe(createGunzip()) : createReadStream(path)
    let enriched = 0
    for await (const entry of readJsonLines(input)) {
      const glosses = chineseGlosses(entry, source)
      if (!glosses.length) continue
      const key = shardOf(entry.word)
      if (!shards.has(key)) shards.set(key, { e: {}, s: {}, f: {} })
      if (mergeChinese(shards.get(key), entry, glosses)) {
        changed.add(key)
        enriched += 1
      }
    }
    console.log(`${source}: filled ${enriched} missing Chinese part-of-speech entries`)
  }
  const reviewed = JSON.parse(await readFile(new URL('./dictionary-chinese-reviewed.json', import.meta.url), 'utf8'))
  for (const entry of reviewed) {
    if (!entry.source || !entry.reviewedAt || !entry.zh?.every(hasChinese)) throw new Error('Unattributed reviewed meaning')
    const key = shardOf(entry.word)
    if (!shards.has(key)) shards.set(key, { e: {}, s: {}, f: {} })
    if (mergeChinese(shards.get(key), entry, entry.zh)) changed.add(key)
  }
  // Parse both inputs successfully before writing; leave unaffected shards byte-for-byte intact.
  for (const key of changed) {
    const data = shards.get(key)
    data.e = Object.fromEntries(Object.entries(data.e).sort(([a], [b]) => (a < b ? -1 : 1)))
    await writeFile(join(outDir, `${key}.json`), JSON.stringify(data))
  }
  const after = coverage()
  console.log(`Chinese headword coverage: ${before} → ${after} (+${after - before}); ${changed.size} shards changed`)
  return { before, after }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const option = (flag, fallback) => {
    const index = process.argv.indexOf(flag)
    if (index === -1) return fallback
    if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`Missing value for ${flag}`)
    return process.argv[index + 1]
  }
  await enrichChinese({ sourceDir: option('--source-dir', '.tmp/dictionary'), outDir: option('--out-dir', 'public/lexicon/fr') })
}
