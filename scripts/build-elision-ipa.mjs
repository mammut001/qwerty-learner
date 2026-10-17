#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Re-exec with repository TS loader if necessary
const isUnderTsLoader = process.execArgv.some((arg) => arg.includes('ts-extension-loader.mjs'))
if (!isUnderTsLoader) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const loaderPath = path.join(repoRoot, 'server/ts-extension-loader.mjs')
  const scriptPath = fileURLToPath(import.meta.url)
  const args = ['--experimental-loader', loaderPath, '--experimental-strip-types', scriptPath, ...process.argv.slice(2)]
  const child = spawnSync(process.execPath, args, { stdio: 'inherit' })
  process.exit(child.status ?? 0)
}

// Running under ts-extension-loader
const { ELISION_COMBO_REGEX, PREFIX_IPA, PREFIX_REGEX_STR, VOWELS_H_STR, extractLexiconIpa, normalizeElisionCombo, shardOf } = await import(
  '../src/utils/ttsSsml.mjs'
)

const { INTENSIVE_PASSAGES } = await import('../src/resources/intensiveListening.ts')
const { TCF_LISTENING_QUESTIONS } = await import('../src/resources/tcfMock.ts')
const { TCF_LISTENING_SET_B } = await import('../src/resources/tcfMockSetB.ts')

const DICT_FILE = path.resolve('src/utils/ttsElisionIpa.json')
const LEXICON_DIR = path.resolve('public/lexicon/fr')

const shardCache = new Map()
function getShardData(shardName) {
  if (shardCache.has(shardName)) return shardCache.get(shardName)
  const shardPath = path.join(LEXICON_DIR, `${shardName}.json`)
  if (!fs.existsSync(shardPath)) return null
  try {
    const data = JSON.parse(fs.readFileSync(shardPath, 'utf8'))
    shardCache.set(shardName, data)
    return data
  } catch {
    return null
  }
}

export function scanAllSources() {
  const texts = []

  // 1. Intensive listening sentences (fr)
  for (const passage of INTENSIVE_PASSAGES || []) {
    for (const sentence of passage.sentences || []) {
      if (typeof sentence?.fr === 'string') {
        texts.push(sentence.fr)
      }
    }
  }

  // 2. TCF listening Set A audioText
  for (const q of TCF_LISTENING_QUESTIONS || []) {
    if (typeof q?.audioText === 'string') {
      texts.push(q.audioText)
    }
  }

  // 3. TCF listening Set B audioText
  for (const q of TCF_LISTENING_SET_B || []) {
    if (typeof q?.audioText === 'string') {
      texts.push(q.audioText)
    }
  }

  const uniqueCombos = new Set()
  for (const text of texts) {
    const matches = text.matchAll(new RegExp(ELISION_COMBO_REGEX.source, 'giu'))
    for (const m of matches) {
      uniqueCombos.add(normalizeElisionCombo(m[0]))
    }
  }

  return Array.from(uniqueCombos).sort((a, b) => a.localeCompare(b))
}

export function buildElisionDictionary() {
  let existingDict = {}
  if (fs.existsSync(DICT_FILE)) {
    try {
      existingDict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf8'))
    } catch {
      existingDict = {}
    }
  }

  const scannedCombos = scanAllSources()
  const singleComboRegex = new RegExp(`^(${PREFIX_REGEX_STR})[’](${VOWELS_H_STR}\\p{L}*)$`, 'iu')
  const newDict = {}

  let preservedCount = 0
  let newlyFoundCount = 0
  let newlyMissingCount = 0

  for (const combo of scannedCombos) {
    // Keep existing entries untouched when re-running
    if (existingDict[combo]) {
      newDict[combo] = existingDict[combo]
      preservedCount++
      continue
    }

    if (combo === 'aujourd’hui') {
      const shard = getShardData(shardOf('aujourd’hui'))
      const entries = shard?.e?.['aujourd’hui'] || shard?.e?.["aujourd'hui"]
      const ipa = extractLexiconIpa(entries)
      if (ipa) {
        newDict[combo] = { ipa, source: 'lexicon', reviewed: false }
        newlyFoundCount++
      } else {
        newDict[combo] = { ipa: '', source: 'manual', reviewed: false }
        newlyMissingCount++
      }
      continue
    }

    const m = combo.match(singleComboRegex)
    if (!m) {
      newDict[combo] = { ipa: '', source: 'manual', reviewed: false }
      newlyMissingCount++
      continue
    }

    const prefix = m[1].toLowerCase()
    const word = m[2].toLowerCase()
    const prefixIpa = PREFIX_IPA[prefix]

    const shardName = shardOf(word)
    const shard = getShardData(shardName)
    // Exact-form match only in shard.e
    const entries = shard?.e?.[word]
    const wordIpa = extractLexiconIpa(entries)

    if (prefixIpa && wordIpa) {
      newDict[combo] = { ipa: prefixIpa + wordIpa, source: 'lexicon', reviewed: false }
      newlyFoundCount++
    } else {
      newDict[combo] = { ipa: '', source: 'manual', reviewed: false }
      newlyMissingCount++
    }
  }

  // Also retain any existing entries that were not in this scan (safe dictionary maintenance)
  for (const [k, v] of Object.entries(existingDict)) {
    if (!newDict[k]) {
      newDict[k] = v
      preservedCount++
    }
  }

  // Sort keys alphabetically
  const sortedDict = {}
  for (const k of Object.keys(newDict).sort((a, b) => a.localeCompare(b))) {
    sortedDict[k] = newDict[k]
  }

  return { sortedDict, stats: { scanned: scannedCombos.length, preservedCount, newlyFoundCount, newlyMissingCount } }
}

async function main() {
  console.log('=== Building TTS Elision IPA Dictionary ===')
  const { sortedDict, stats } = buildElisionDictionary()

  fs.writeFileSync(DICT_FILE, JSON.stringify(sortedDict, null, 2) + '\n', 'utf8')
  console.log(`Saved ${Object.keys(sortedDict).length} combos to ${DICT_FILE}`)
  console.log(
    `Stats: ${stats.scanned} scanned (${stats.preservedCount} preserved, ${stats.newlyFoundCount} lexicon, ${stats.newlyMissingCount} manual)\n`,
  )

  const missingEntries = Object.entries(sortedDict).filter(([, v]) => !v.ipa || v.ipa.trim() === '' || v.source === 'manual')

  console.log('### TODO Table: Elision Combos Missing Lexicon IPA (Require Manual Review)')
  console.log('| Combo | IPA | Source | Reviewed | Notes |')
  console.log('| :--- | :--- | :--- | :--- | :--- |')
  for (const [combo, entry] of missingEntries) {
    const word = combo.includes('’') ? combo.split('’')[1] : combo
    console.log(
      `| \`${combo}\` | \`${entry.ipa}\` | \`${entry.source}\` | \`${entry.reviewed}\` | Exact form "${word}" missing IPA in lexicon |`,
    )
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main()
}
