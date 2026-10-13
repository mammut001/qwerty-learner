import { chineseGlosses, mergeChinese, readJsonLines } from './enrich-dictionary-chinese.mjs'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'

test('direct Chinese translations are simplified and deduplicated; other languages and dated senses are excluded', () => {
  assert.deepEqual(
    chineseGlosses(
      {
        word: 'rite',
        lang_code: 'fr',
        pos: 'noun',
        senses: [{ glosses: ['Cérémonie'] }, { tags: ['obsolete'] }],
        translations: [
          { lang_code: 'cmn', word: '儀式', sense_index: 1 },
          { lang_code: 'zh', word: '仪式', sense_index: 1 },
          { lang_code: 'ja', word: '儀礼' },
          { lang_code: 'en', word: 'ritual' },
          { lang_code: 'cmn', word: '古义', sense_index: 2 },
          { lang_code: 'cmn', word: 'yíshì' },
        ],
      },
      'fr',
    ),
    ['仪式'],
  )
  assert.deepEqual(
    chineseGlosses({ word: 'rite', lang_code: 'en', pos: 'noun', translations: [{ lang_code: 'cmn', word: '仪式' }] }, 'fr'),
    [],
  )
})

test('Chinese definitions keep headwords absent from English while excluding inflections and proper names', () => {
  assert.deepEqual(
    chineseGlosses(
      {
        word: 'mot',
        lang_code: 'fr',
        pos: 'noun',
        senses: [{ glosses: ['詞語'] }, { glosses: ['单词的复数'], form_of: [{ word: 'mot' }] }, { glosses: ['word'] }],
      },
      'zh',
    ),
    ['词语'],
  )
  assert.deepEqual(chineseGlosses({ word: 'Paris', lang_code: 'fr', pos: 'name', senses: [{ glosses: ['巴黎'] }] }, 'zh'), [])
})

test('merging preserves existing definitions and matches parts of speech without borrowing a homograph’s meaning', () => {
  const shard = { e: { mot: [['verb', '/mo/', '', ['English verb'], []]] }, s: { mot: ['原有笔记'] }, f: {} }
  assert.equal(mergeChinese(shard, { word: 'mot', pos: 'noun' }, ['词']), true)
  assert.deepEqual(shard.e.mot[0][4], [])
  assert.deepEqual(shard.e.mot[1], ['noun', '', '', [], ['词']])
  assert.equal(mergeChinese(shard, { word: 'mot', pos: 'noun' }, ['替换']), false)
  assert.deepEqual(shard.e.mot[1][4], ['词'])
  assert.deepEqual(shard.s.mot, ['原有笔记'])
  assert.equal(mergeChinese(shard, { word: 'nouveau', pos: 'adj' }, ['新的']), true)
  assert.deepEqual(shard.e.nouveau[0][4], ['新的'])
})

test('JSONL parsing preserves Unicode paragraph separators, UTF-8 chunks and a final line without LF', async () => {
  const text = '{"word":"école","ref":"a\u2029b\u2028c"}\r\n{"word":"仪式"}'
  const bytes = Buffer.from(text)
  const rows = []
  for await (const row of readJsonLines(Readable.from(Array.from(bytes, (byte) => Buffer.from([byte]))))) rows.push(row)
  assert.deepEqual(rows, [{ word: 'école', ref: 'a\u2029b\u2028c' }, { word: '仪式' }])
})

test('incremental enrichment is repeatable and malformed sources leave existing shards untouched', async () => {
  const { mkdtemp, mkdir, readFile, rm, writeFile } = await import('node:fs/promises')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { gzipSync } = await import('node:zlib')
  const { enrichChinese } = await import('./enrich-dictionary-chinese.mjs')
  const root = await mkdtemp(join(tmpdir(), 'tcf-chinese-'))
  const sourceDir = join(root, 'source')
  const outDir = join(root, 'out')
  try {
    await mkdir(sourceDir)
    await mkdir(outDir)
    const old = JSON.stringify({ e: { mot: [['noun', '', '', ['word'], []]] }, s: { mot: ['原有笔记'] }, f: { mots: ['mot'] } })
    await writeFile(join(outDir, 'mo.json'), old)
    await writeFile(
      join(sourceDir, 'fr-zh.jsonl'),
      JSON.stringify({ word: 'mot', lang_code: 'fr', pos: 'noun', senses: [{ glosses: ['詞'] }] }),
    )
    await writeFile(join(sourceDir, 'fr-raw.jsonl.gz'), gzipSync('not json\n'))
    await assert.rejects(enrichChinese({ sourceDir, outDir }), SyntaxError)
    assert.equal(await readFile(join(outDir, 'mo.json'), 'utf8'), old)
    await writeFile(
      join(sourceDir, 'fr-raw.jsonl.gz'),
      gzipSync(JSON.stringify({ word: 'nouveau', lang_code: 'fr', pos: 'adj', translations: [{ lang_code: 'cmn', word: '新的' }] }) + '\n'),
    )
    const first = await enrichChinese({ sourceDir, outDir })
    assert.ok(first.after > first.before)
    const written = await readFile(join(outDir, 'mo.json'), 'utf8')
    const second = await enrichChinese({ sourceDir, outDir })
    assert.equal(second.after, second.before)
    assert.equal(await readFile(join(outDir, 'mo.json'), 'utf8'), written)
    const data = JSON.parse(written)
    assert.deepEqual(data.e.mot[0][4], ['词'])
    assert.deepEqual(data.s.mot, ['原有笔记'])
    assert.deepEqual(data.f.mots, ['mot'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
