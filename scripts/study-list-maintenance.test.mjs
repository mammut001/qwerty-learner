import {
  acceptDirectGloss,
  applyChineseSupplement,
  applyDirectChinese,
  assignSenseGlosses,
  countMissingPracticeChinese,
  emptyOnlyLine,
  fillMissingPosFromTwins,
  foldApostrophe,
  lexiconShardUrl,
  practiceListUrl,
  previewChineseSupplement,
  summarizeGapFill,
  supplementSourceAllowed,
} from '../src/utils/studyListMaintenance.mjs'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

test('direct Chinese fills empty parts of speech and leaves existing glosses unchanged', () => {
  const existing = ['大、高']
  const rows = [
    ['adj', '', '', [], existing],
    ['noun', '', 'm', ['grown-up'], []],
  ]
  const unchanged = applyDirectChinese(rows, { pos: 'adj', zh: ['巨大'] })
  assert.equal(unchanged.changed, false)
  assert.equal(unchanged.rows[0][4], existing)
  assert.deepEqual(unchanged.rows[0][4], ['大、高'])

  const summary = summarizeGapFill([
    {
      word: "jusqu'à",
      rows: [['prep', '/ʒys.k‿a/', '', ['until'], []]],
      variants: [{ word: 'jusqu’à', rows: [['prep', '', '', [], ['截至']]] }],
    },
    {
      word: "pouvoir d'achat",
      rows: [['noun', '', 'm', ['purchasing power'], []]],
      variants: [{ word: 'pouvoir d’achat', rows: [['noun', '', '', [], ['购买力']]] }],
      partGlosses: ['权力', '购买'],
    },
    { word: 'grand', rows, variants: [] },
    {
      word: 'fermé',
      rows: [['adj', '', '', [], []]],
      variants: [{ word: 'ferme', rows: [['adj', '', '', [], ['坚固的']]] }],
    },
  ])
  console.log(`before=${summary.before} after=${summary.after}`)
  for (const item of summary.filled) console.log(`filled ${item.word} ${item.pos.join(',')}`)
  for (const item of summary.remainders) console.log(`remainder ${item.word} ${item.pos.join(',')} lacks direct Chinese source`)
  assert.ok(summary.before > summary.after)
  assert.deepEqual(
    summary.filled.map((item) => item.word),
    ["jusqu'à", "pouvoir d'achat"],
  )
  assert.deepEqual(summary.filled[1].rows[0][4], ['购买力'])
  assert.equal(summary.filled[0].rows[0][4][0], '截至')
  assert.deepEqual(rows[0][4], ['大、高'])
  console.log(`existing Chinese unchanged: ${rows[0][4].join('、')}`)
  assert.equal(acceptDirectGloss({ headword: "pouvoir d'achat", pos: 'noun', glosses: ['权力'], partGlosses: ['权力', '购买'] }), null)
  console.log('compound part-gloss rejected')
  assert.equal(foldApostrophe('fermé'), 'fermé')
  assert.notEqual(foldApostrophe('fermé'), foldApostrophe('ferme'))
})

test('a multi-POS study word keeps each gloss and example with its own part of speech', async () => {
  const stored = assignSenseGlosses('fort', [
    {
      pos: 'adj',
      glosses: ['强'],
      example: 'Ce qui ne me tue pas me rend plus fort.',
      examplePos: 'adj',
    },
    {
      pos: 'noun',
      glosses: ['要塞', '堡垒'],
      example: 'Le fort de la Pompelle est un ouvrage défensif.',
      examplePos: 'noun',
    },
    {
      pos: 'noun',
      glosses: ['要塞'],
      example: 'Le sanglier est dans son fort.',
      examplePos: 'adj',
    },
  ])
  const adjective = stored.find((sense) => sense.pos === 'adj')
  const noun = stored.find((sense) => sense.pos === 'noun')
  assert.deepEqual(adjective.zh, ['强'])
  assert.deepEqual(noun.zh, ['要塞', '堡垒'])
  assert.match(adjective.example, /plus fort/)
  assert.match(noun.example, /fort de la Pompelle/)
  assert.doesNotMatch(noun.example, /sanglier/)
  console.log(`multi-pos adj=${adjective.zh.join('/')} noun=${noun.zh.join('/')}`)

  const reviewed = JSON.parse(await readFile(new URL('./dictionary-chinese-reviewed.json', import.meta.url), 'utf8'))
  const fort = reviewed.filter((entry) => entry.word === 'fort')
  const fromFile = assignSenseGlosses(
    'fort',
    fort.map((entry) => ({ pos: entry.pos, glosses: entry.zh, example: entry.example, examplePos: entry.pos })),
  )
  assert.deepEqual(
    fromFile.map((sense) => sense.pos),
    ['adj', 'noun'],
  )
  assert.notDeepEqual(fromFile[0].zh, fromFile[1].zh)
  assert.match(fromFile[0].example, /plus fort/)
  assert.match(fromFile[1].example, /fort de la Pompelle/)
  const swapped = assignSenseGlosses('fort', [{ pos: 'noun', glosses: ['要塞'], example: fromFile[0].example, examplePos: 'adj' }])
  assert.equal(swapped[0].example, undefined)
  assert.deepEqual(swapped[0].zh, ['要塞'])
})

test('a non-empty note stays until the Chinese supplement is accepted, and empty-only fill ignores it', () => {
  const preview = previewChineseSupplement('remonter', ['my personal note'], '回升')
  assert.equal(applyChineseSupplement(preview, false), null)
  assert.equal(preview.existing, 'my personal note')
  const accepted = applyChineseSupplement(preview, true)
  assert.match(accepted, /my personal note/)
  assert.match(accepted, /回升/)
  console.log(`note unchanged until accept: ${preview.existing}`)
  console.log(`note kept after accept: ${accepted}`)

  const filled = emptyOnlyLine('rite', 'rite', [], '仪式')
  assert.equal(filled, 'rite = 仪式')
  const kept = emptyOnlyLine('remonter = my personal note', 'remonter', ['my personal note'], '回升')
  assert.equal(kept, 'remonter = my personal note')
  assert.equal(previewChineseSupplement('rite', [], '仪式'), null)
  console.log(`empty line filled: ${filled}`)
  assert.equal(supplementSourceAllowed("pouvoir d'achat", 'pouvoir'), false)
  assert.equal(supplementSourceAllowed("pouvoir d'achat", "pouvoir d'achat"), true)
})

test('an article plus a noun may use that noun gloss, and a compound still rejects one part', async () => {
  const foundation = JSON.parse(await readFile('public/dicts/TCF_Canada_Foundation_01.json', 'utf8'))
  const daily = JSON.parse(await readFile('public/dicts/TCF_Canada_Daily_Life.json', 'utf8'))
  const logementZh = foundation.find((word) => word.name === 'logement').trans[0]
  const maisonZh = daily.find((word) => word.name === 'maison').trans[0]
  assert.equal(logementZh, 'n.m. 住房；住所')
  assert.match(maisonZh, /房子/)

  assert.equal(supplementSourceAllowed('le logement', 'logement'), true)
  assert.equal(supplementSourceAllowed('un bail', 'bail'), true)
  assert.equal(supplementSourceAllowed('la maison', 'maison'), true)
  assert.equal(supplementSourceAllowed("le pouvoir d'achat", 'pouvoir'), false)
  assert.equal(supplementSourceAllowed("le pouvoir d'achat", "pouvoir d'achat"), true)
  assert.equal(supplementSourceAllowed("pouvoir d'achat", 'pouvoir'), false)

  const maisonShard = JSON.parse(await readFile('public/lexicon/fr/ma.json', 'utf8'))
  assert.equal(maisonShard.e.maisons, undefined)
  const maisonLemmas = maisonShard.f.maisons
  assert.ok(Array.isArray(maisonLemmas) && maisonLemmas.length === 1)
  const maisonLemma = maisonLemmas[0]
  const maisonSite = maisonShard.s[maisonLemma].find((item) => item.includes('房子'))
  assert.equal(supplementSourceAllowed('les maisons', maisonLemma), true)
  assert.equal(supplementSourceAllowed('les maisons', 'maisons'), true)
  const pluralChinese = supplementSourceAllowed('les maisons', maisonLemma) ? maisonSite : ''
  assert.equal(emptyOnlyLine('les maisons', 'les maisons', [], pluralChinese), `les maisons = ${maisonSite}`)
  const pluralPreview = previewChineseSupplement('les maisons', ['my personal note'], pluralChinese)
  assert.equal(pluralPreview.existing, 'my personal note')
  assert.equal(applyChineseSupplement(pluralPreview, false), null)
  const pluralAccepted = applyChineseSupplement(pluralPreview, true)
  assert.match(pluralAccepted, /my personal note/)
  assert.match(pluralAccepted, /房子/)
  console.log(`plural lemma allowed: les maisons -> ${maisonLemma} = ${maisonSite}`)

  assert.equal(emptyOnlyLine('le logement', 'le logement', [], logementZh), `le logement = ${logementZh}`)
  assert.equal(emptyOnlyLine('un bail', 'un bail', [], '租约'), 'un bail = 租约')
  const partOnly = supplementSourceAllowed("pouvoir d'achat", 'pouvoir') ? '权力' : ''
  assert.equal(emptyOnlyLine("pouvoir d'achat", "pouvoir d'achat", [], partOnly), "pouvoir d'achat")

  const preview = previewChineseSupplement('la maison', ['my personal note'], maisonZh)
  assert.equal(preview.existing, 'my personal note')
  assert.equal(applyChineseSupplement(preview, false), null)
  const accepted = applyChineseSupplement(preview, true)
  assert.match(accepted, /my personal note/)
  assert.match(accepted, /房子/)
  console.log(`article+noun allowed: le logement = ${logementZh}`)
  console.log(`article note kept: ${accepted}`)
  console.log(`compound part rejected: pouvoir d'achat`)
})

test('practice-list URLs change with the build token and lexicon shards keep ?v=', () => {
  const first = practiceListUrl('./dicts/TCF_Canada_Foundation_01.json', 'build-a')
  const second = practiceListUrl('./dicts/TCF_Canada_Foundation_01.json', 'build-b')
  assert.notEqual(first, second)
  assert.match(first, /\?v=build-a/)
  assert.match(second, /\?v=build-b/)
  const shard = lexiconShardUrl('mo', 'build-a')
  assert.match(shard, /\?v=/)
  assert.equal(practiceListUrl('custom:custom-1?v=1', 'build-a'), 'custom:custom-1?v=1')
  console.log(`practice urls ${first} ${second}`)
  console.log(`lexicon shard ${shard}`)
})

test('curated practice lists and the live lexicon record the Chinese gap after direct fills', async () => {
  const dictDir = 'public/dicts'
  const words = []
  for (const file of (await readdir(dictDir)).filter((name) => name.endsWith('.json'))) {
    words.push(...JSON.parse(await readFile(join(dictDir, file), 'utf8')))
  }
  const practice = countMissingPracticeChinese(words)
  console.log(`practice-list before=${practice.missing} after=${practice.missing}`)
  assert.equal(practice.missing, 0)
  const etre = words.find((word) => word.name === 'être')
  assert.deepEqual(etre.trans, ['v. 是；处于；存在；也是构成部分复合时态的助动词'])
  console.log(`existing practice Chinese unchanged: ${JSON.stringify(etre.trans)}`)

  const shardOf = (word) => {
    const key = word
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’`]/g, "'")
      .trim()
    return [key[0], key[1]].map((char) => (char && /[a-z]/.test(char) ? char : '_')).join('')
  }
  const needed = new Set(words.map((word) => shardOf(word.name)))
  const shards = new Map()
  for (const name of needed) {
    try {
      shards.set(name, JSON.parse(await readFile(join('public/lexicon/fr', `${name}.json`), 'utf8')))
    } catch {
      shards.set(name, { e: {}, s: {}, f: {} })
    }
  }
  const groups = new Map()
  for (const data of shards.values()) {
    for (const [word, rows] of Object.entries(data.e)) {
      const key = foldApostrophe(word)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push({ word, rows })
    }
  }
  const seen = new Set()
  const items = []
  for (const word of words) {
    if (seen.has(word.name)) continue
    seen.add(word.name)
    const variants = groups.get(foldApostrophe(word.name)) ?? []
    const exact = variants.find((variant) => variant.word === word.name)
    if (!exact) continue
    items.push({ word: word.name, rows: exact.rows, variants })
  }
  const live = summarizeGapFill(items)
  console.log(`live lexicon before=${live.before} after=${live.after}`)
  assert.equal(live.before, live.after)
  assert.equal(live.filled.length, 0)
  for (const item of live.remainders) console.log(`remainder ${item.word} ${item.pos.join(',')} lacks direct Chinese source`)

  const jusqu = shards.get('ju').e["jusqu'à"]
  const curly = shards.get('ju').e['jusqu’à']
  const pouvoir = shards.get('po').e["pouvoir d'achat"]
  assert.deepEqual(jusqu[0][4], ['截至'])
  assert.deepEqual(curly[0][4], ['截至'])
  assert.deepEqual(pouvoir[0][4], ['购买力'])
  const filled = fillMissingPosFromTwins("jusqu'à", jusqu, groups.get(foldApostrophe("jusqu'à")))
  assert.deepEqual(filled.filledPos, [])
  assert.deepEqual(filled.rows[0][4], ['截至'])
})
