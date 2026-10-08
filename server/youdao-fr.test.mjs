import { createStudyServer } from './study-plan.mjs'
import { createYoudaoCache, lookupYoudaoFrench, normalizeFrenchQuery, parseYoudaoFrench } from './youdao-fr.mjs'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const BONJOUR = {
  fc: {
    source: { name: '现代法汉汉法词典' },
    word: [
      {
        trs: [{ pos: 'm.', tr: [{ l: { i: ['早安，日安，白天好，你好'] } }] }],
        phone: 'bɔ̃ʒu:r',
        'return-phrase': { l: { i: 'bonjour' } },
      },
    ],
  },
  blng_sents_part: {
    'sentence-pair': [
      { sentence: 'Client: <b>Bonjour</b>, monsieur.', 'sentence-translation': '顾客：你好，先生。' },
      { sentence: 'Avant de te conna?tre, je mangeais.', 'sentence-translation': '结识你之前。' },
    ],
  },
}

test('parseYoudaoFrench keeps the Chinese gloss and drops garbled examples', () => {
  const parsed = parseYoudaoFrench(BONJOUR, 'bonjour')
  assert.equal(parsed.word, 'bonjour')
  assert.equal(parsed.phone, 'bɔ̃ʒu:r')
  assert.equal(parsed.source, '现代法汉汉法词典')
  assert.deepEqual(parsed.senses, [{ pos: 'm.', gloss: '早安，日安，白天好，你好' }])
  assert.deepEqual(parsed.examples, [{ fr: 'Client: Bonjour, monsieur.', zh: '顾客：你好，先生。' }])
  assert.equal(parseYoudaoFrench({ fc: { word: [{ phone: 'oʒurdчi', trs: [] }] } }, "aujourd'hui").phone, '')
  assert.equal(normalizeFrenchQuery('  Aujourd’hui  '), "Aujourd'hui")
  assert.equal(normalizeFrenchQuery('https://evil.example'), '')
  assert.equal(normalizeFrenchQuery('a'.repeat(81)), '')
})

test('lookupYoudaoFrench caches a hit and does not cache an upstream failure', async () => {
  const cache = createYoudaoCache()
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return {
      ok: true,
      text: async () => JSON.stringify(BONJOUR),
    }
  }
  const first = await lookupYoudaoFrench('Bonjour', { fetchImpl, cache, now: 1_000 })
  const second = await lookupYoudaoFrench('bonjour', { fetchImpl, cache, now: 1_000 })
  assert.equal(calls, 1)
  assert.equal(first.cached, false)
  assert.equal(second.cached, true)
  assert.equal(second.value.senses[0].gloss, '早安，日安，白天好，你好')

  const failed = await lookupYoudaoFrench('école', {
    fetchImpl: async () => {
      throw new Error('offline')
    },
    cache,
    now: 1_000,
  })
  assert.equal(failed.error, 'upstream')
  assert.equal(cache.get('école', 1_000), null)
})

test('dictionary route is access-gated, validates the query, and does not open a learner session', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'youdao-fr-'))
  let calls = 0
  const server = createStudyServer({
    database: join(dir, 'data.sqlite'),
    origin: 'http://localhost:5173',
    accessPassword: 'secret',
    youdaoLookup: async () => {
      calls += 1
      return { value: parseYoudaoFrench(BONJOUR, 'bonjour') }
    },
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const denied = await fetch(`${base}/api/study-plan/dictionary?q=bonjour`)
    assert.equal(denied.status, 401)
    assert.equal(calls, 0)

    const open = createStudyServer({
      database: join(dir, 'open.sqlite'),
      origin: 'http://localhost:5173',
      accessPassword: '',
      youdaoLookup: async (query) => {
        calls += 1
        assert.equal(query, 'bonjour')
        return { value: parseYoudaoFrench(BONJOUR, query) }
      },
    })
    await new Promise((resolve) => open.listen(0, '127.0.0.1', resolve))
    try {
      const ok = await fetch(`http://127.0.0.1:${open.address().port}/api/study-plan/dictionary?q=${encodeURIComponent('bonjour')}`)
      assert.equal(ok.status, 200)
      assert.equal(ok.headers.get('set-cookie'), null)
      const body = await ok.json()
      assert.equal(body.senses[0].gloss, '早安，日安，白天好，你好')
      assert.equal(body.examples[0].fr, 'Client: Bonjour, monsieur.')

      const invalid = await fetch(`http://127.0.0.1:${open.address().port}/api/study-plan/dictionary?q=${encodeURIComponent('<script>')}`)
      assert.equal(invalid.status, 400)
      const down = createStudyServer({
        database: join(dir, 'down.sqlite'),
        origin: 'http://localhost:5173',
        accessPassword: '',
        youdaoLookup: async () => ({ error: 'upstream' }),
      })
      await new Promise((resolve) => down.listen(0, '127.0.0.1', resolve))
      try {
        const failed = await fetch(`http://127.0.0.1:${down.address().port}/api/study-plan/dictionary?q=bonjour`)
        assert.equal(failed.status, 502)
      } finally {
        await new Promise((resolve) => down.close(resolve))
      }
    } finally {
      await new Promise((resolve) => open.close(resolve))
    }
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
