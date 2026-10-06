// Builds the offline French dictionary served from public/lexicon/fr.
//
//   node scripts/build-dictionary.mjs [--source-dir <dir>]
//
// Sources (downloaded into the source dir, default .tmp/dictionary, when missing):
//   - English Wiktionary, French entries, via kaikki.org (wiktextract)  -> definitions in English, IPA, inflections
//   - Chinese Wiktionary, French entries, via kaikki.org (wiktextract)  -> definitions in Chinese where they exist
// Both are CC BY-SA; see public/lexicon/LICENSE.md, which this script also writes.
import { createReadStream, createWriteStream, existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import * as OpenCC from 'opencc-js'

const SOURCES = {
  en: {
    file: 'fr-en.jsonl',
    url: 'https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl',
  },
  zh: {
    file: 'fr-zh.jsonl',
    url: 'https://kaikki.org/zhwiktionary/%E6%B3%95%E8%AF%AD/kaikki.org-dictionary-%E6%B3%95%E8%AF%AD.jsonl',
  },
}
const OUT_DIR = 'public/lexicon/fr'
const MAX_GLOSSES = 6
const MAX_GLOSS_LENGTH = 160
// Proper nouns and affixes add ~10k entries nobody looks up while studying for the TCF.
const SKIPPED_POS = new Set(['name', 'prefix', 'suffix', 'interfix', 'infix', 'character', 'symbol', 'punct', 'circumfix'])
const DATED = new Set(['obsolete', 'archaic', 'dated', 'historical', 'rare'])

const sourceDirFlag = process.argv.indexOf('--source-dir')
const sourceDir = sourceDirFlag === -1 ? '.tmp/dictionary' : process.argv[sourceDirFlag + 1]

const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' })

/** Must stay in sync with `normalizeDictionaryKey` in src/services/dictionary.ts. */
export const normalizeKey = (word) =>
  word.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'").trim()

/** Must stay in sync with `dictionaryShard` in src/services/dictionary.ts. */
export const shardOf = (word) => {
  const key = normalizeKey(word)
  const letters = [key[0], key[1]].map((char) => (char && /[a-z]/.test(char) ? char : '_'))
  return letters.join('')
}

async function ensureSource({ file, url }) {
  const path = join(sourceDir, file)
  if (existsSync(path)) return path
  console.log(`Downloading ${url}`)
  await mkdir(sourceDir, { recursive: true })
  const response = await fetch(url)
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}): ${url}`)
  await pipeline(Readable.fromWeb(response.body), createWriteStream(path))
  return path
}

async function* readEntries(path) {
  for await (const line of createInterface({ input: createReadStream(path), crlfDelay: Infinity })) {
    if (line) yield JSON.parse(line)
  }
}

const isFormSense = (sense) => Boolean(sense.form_of) || (sense.tags ?? []).includes('form-of')

const cleanGloss = (text) => {
  const gloss = text.replace(/\s+/g, ' ').trim()
  return gloss.length > MAX_GLOSS_LENGTH ? `${gloss.slice(0, MAX_GLOSS_LENGTH - 1).trimEnd()}…` : gloss
}

function glossesOf(entry) {
  const senses = (entry.senses ?? []).filter((sense) => !isFormSense(sense) && sense.glosses?.length)
  const current = senses.filter((sense) => !(sense.tags ?? []).some((tag) => DATED.has(tag)))
  const glosses = []
  for (const sense of current.length ? current : senses) {
    const gloss = cleanGloss(sense.glosses[sense.glosses.length - 1])
    if (gloss && !glosses.includes(gloss)) glosses.push(gloss)
    if (glosses.length === MAX_GLOSSES) break
  }
  return glosses
}

function genderOf(entry) {
  const tags = new Set([...(entry.tags ?? []), ...(entry.senses ?? []).flatMap((sense) => sense.tags ?? [])])
  const head = entry.head_templates?.[0]?.expansion ?? ''
  const masculine = tags.has('masculine') || /\sm(\s|$|,)/.test(head)
  const feminine = tags.has('feminine') || /\sf(\s|$|,)/.test(head)
  return masculine && feminine ? 'mf' : masculine ? 'm' : feminine ? 'f' : ''
}

const ipaOf = (entry) => (entry.sounds ?? []).find((sound) => sound.ipa)?.ipa ?? ''

async function loadSiteGlosses() {
  // The curated Chinese meanings from our own word lists are the most reliable ones for exam vocabulary.
  const glosses = new Map()
  for (const file of await readdir('public/dicts')) {
    if (!file.endsWith('.json')) continue
    for (const word of JSON.parse(await readFile(join('public/dicts', file), 'utf8'))) {
      if (typeof word?.name !== 'string' || !Array.isArray(word.trans) || word.trans.length === 0) continue
      if (!glosses.has(word.name)) glosses.set(word.name, word.trans.filter((item) => typeof item === 'string').slice(0, 3))
    }
  }
  return glosses
}

const [enPath, zhPath] = await Promise.all([ensureSource(SOURCES.en), ensureSource(SOURCES.zh)])

// word -> pos -> { ipa, gender, en, zh }
const entries = new Map()
// form -> Set(lemma)
const forms = new Map()
const slot = (word, pos) => {
  if (!entries.has(word)) entries.set(word, new Map())
  const byPos = entries.get(word)
  if (!byPos.has(pos)) byPos.set(pos, { ipa: '', gender: '', en: [], zh: [] })
  return byPos.get(pos)
}

for await (const entry of readEntries(enPath)) {
  if (!entry.word || SKIPPED_POS.has(entry.pos)) continue
  for (const sense of entry.senses ?? []) {
    for (const target of sense.form_of ?? []) {
      if (!target.word || target.word === entry.word) continue
      if (!forms.has(entry.word)) forms.set(entry.word, new Set())
      forms.get(entry.word).add(target.word)
    }
  }
  const glosses = glossesOf(entry)
  if (glosses.length === 0) continue
  const target = slot(entry.word, entry.pos)
  for (const gloss of glosses) if (target.en.length < MAX_GLOSSES && !target.en.includes(gloss)) target.en.push(gloss)
  target.ipa ||= ipaOf(entry)
  target.gender ||= genderOf(entry)
}

let chineseEntries = 0
for await (const entry of readEntries(zhPath)) {
  if (!entry.word || SKIPPED_POS.has(entry.pos)) continue
  const glosses = glossesOf(entry).map((gloss) => toSimplified(gloss))
  if (glosses.length === 0) continue
  // Only enrich words the English extract already knows, so every entry keeps a consistent shape and source.
  const byPos = entries.get(entry.word)
  if (!byPos) continue
  const target = byPos.get(entry.pos) ?? [...byPos.values()][0]
  for (const gloss of glosses) if (target.zh.length < MAX_GLOSSES && !target.zh.includes(gloss)) target.zh.push(gloss)
  target.ipa ||= ipaOf(entry)
  chineseEntries += 1
}

const siteGlosses = await loadSiteGlosses()

// shard -> { e: { word: [[pos, ipa, gender, en[], zh[]]] }, s: { word: [meaning] }, f: { form: [lemma] } }
const shards = new Map()
const shard = (word) => {
  const key = shardOf(word)
  if (!shards.has(key)) shards.set(key, { e: {}, s: {}, f: {} })
  return shards.get(key)
}

for (const [word, byPos] of entries) {
  shard(word).e[word] = [...byPos].map(([pos, data]) => [pos, data.ipa, data.gender, data.en, data.zh])
}
let formCount = 0
for (const [form, lemmas] of forms) {
  const known = [...lemmas].filter((lemma) => entries.has(lemma)).sort()
  if (known.length === 0) continue
  shard(form).f[form] = known
  formCount += 1
}
for (const [word, meanings] of siteGlosses) shard(word).s[word] = meanings

await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })
let bytes = 0
for (const [key, data] of shards) {
  const sorted = Object.fromEntries(
    Object.entries(data).map(([part, value]) => [part, Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1)))]),
  )
  const json = JSON.stringify(sorted)
  bytes += Buffer.byteLength(json)
  await writeFile(join(OUT_DIR, `${key}.json`), json)
}

await writeFile(
  'public/lexicon/LICENSE.md',
  `# Dictionary data

The files in \`fr/\` are generated by \`scripts/build-dictionary.mjs\` from:

- **English Wiktionary** (French entries) — https://en.wiktionary.org
- **Chinese Wiktionary** (French entries) — https://zh.wiktionary.org

extracted by [wiktextract](https://github.com/tatuylonen/wiktextract) and published at https://kaikki.org.
Definitions were shortened, Chinese text was converted to Simplified Chinese, and proper nouns and affixes were left out.

Wiktionary text is available under the Creative Commons Attribution-ShareAlike License
(https://creativecommons.org/licenses/by-sa/4.0/). This derived data is distributed under the same licence.
It is separate from the application source code, which keeps its own licence.

The \`s\` section of each file holds the meanings from this project's own word lists in \`public/dicts\`.
`,
)

console.log(
  `Wrote ${shards.size} shards, ${entries.size} entries (${chineseEntries} with Chinese), ${formCount} inflected forms, ${
    siteGlosses.size
  } site meanings — ${(bytes / 1e6).toFixed(1)} MB`,
)
