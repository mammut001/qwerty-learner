// Builds scripts/reading-corpus/basic-words.json: the ~1,500-word "basic high-frequency" list used by level.mjs.
//
// Source material (repo's own beginner content only, levels 1-3):
//   - every scenario in server/echelle-variants/ whose key starts with n1-, n2- or n3- ;
//     static scenarios contribute their text, template scenarios are rendered with seeds 1..10;
//   - every French entry of LEXIQUE_TOPICS in server/echelle-lexique-bank.mjs.
// Each text (scenario render or lexique topic) is one document. Words are tokenized with level.mjs
// tokenize(). The list keeps the 1,500 tokens with the highest document frequency (ties: total
// frequency, then alphabetical). Levels 4-12 are never used to build this list, so calibration
// on them is not circular.
//
// Run: node scripts/reading-corpus/build-basic-wordlist.mjs

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SCENARIO_REGISTRY } from '../../server/echelle-variants/index.mjs'
import { LEXIQUE_TOPICS } from '../../server/echelle-lexique-bank.mjs'
import { tokenize } from './level.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const TARGET = 1500
const SEEDS = 10

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const docs = []
let scenarioKeys = 0
for (const key of Object.keys(SCENARIO_REGISTRY)) {
  if (!/^n[123]-/.test(key)) continue
  scenarioKeys++
  for (const entry of SCENARIO_REGISTRY[key]) {
    if (typeof entry === 'function') {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const out = entry(mulberry32(seed))
        if (out && typeof out.text === 'string') docs.push(out.text)
      }
    } else if (entry && typeof entry.text === 'string') {
      docs.push(entry.text)
    }
  }
}
for (const topic of LEXIQUE_TOPICS) {
  docs.push(topic.words.map((w) => w[0]).join(' '))
}

const df = new Map()
const tf = new Map()
for (const doc of docs) {
  const tokens = tokenize(doc)
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1)
  for (const t of new Set(tokens)) df.set(t, (df.get(t) || 0) + 1)
}

const ranked = [...df.keys()].sort((a, b) =>
  (df.get(b) - df.get(a)) || (tf.get(b) - tf.get(a)) || (a < b ? -1 : a > b ? 1 : 0))
const words = ranked.slice(0, TARGET)

const out = {
  method: 'Document frequency over repo beginner material (levels 1-3 scenarios, seeds 1-10 for template scenarios, plus LEXIQUE_TOPICS French entries). Top 1500 tokens by document frequency, ties by total frequency then alphabetical. Tokens: level.mjs tokenize().',
  sources: {
    scenarioKeysLevels1to3: scenarioKeys,
    lexiqueTopics: LEXIQUE_TOPICS.length,
    documents: docs.length,
    vocabularyBeforeCut: df.size,
  },
  count: words.length,
  words,
}
writeFileSync(join(here, 'basic-words.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`documents=${docs.length} vocabulary=${df.size} kept=${words.length} lastDf=${df.get(words.at(-1))}`)
