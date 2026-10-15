import { createStudyServer } from './study-plan.mjs'
import { createYoudaoCache, fetchYoudaoFrenchVoice, isYoudaoFrenchStarred, lookupYoudaoFrench, normalizeFrenchQuery, parseYoudaoFrench } from './youdao-fr.mjs'
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

const VOULOIR_STARRED = {
  fc: {
    source: { name: '现代法汉汉法词典' },
    word: [
      {
        trs: [{ pos: 'v.t.', tr: [{ l: { i: ['愿意；想，要'] } }] }],
        phone: 'vulwa:r',
        'return-phrase': { l: { i: 'vouloir*' } },
      },
    ],
  },
  simple: {
    word: [
      {
        speech: 'vouloir*&le=fr',
        'return-phrase': 'vouloir*',
      },
    ],
  },
}

test('isYoudaoFrenchStarred identifies starred headwords across jsonapi shapes', () => {
  assert.equal(isYoudaoFrenchStarred(VOULOIR_STARRED), true)
  assert.equal(isYoudaoFrenchStarred(BONJOUR), false)
  assert.equal(isYoudaoFrenchStarred({ simple: { word: [{ speech: 'faire*&le=fr' }] } }), true)
  assert.equal(isYoudaoFrenchStarred({ simple: { word: [{ 'return-phrase': 'pouvoir*' }] } }), true)
  assert.equal(isYoudaoFrenchStarred({ fc: { word: [{ 'return-phrase': 'voir*' }] } }), true)
  assert.equal(isYoudaoFrenchStarred({ fc: { word: [{ 'return-phrase': { l: { i: 'venir*' } } }] } }), true)
  assert.equal(isYoudaoFrenchStarred(null), false)
  assert.equal(isYoudaoFrenchStarred({}), false)

  const parsedStarred = parseYoudaoFrench(VOULOIR_STARRED, 'vouloir')
  assert.equal(parsedStarred.starred, true)
  const parsedBonjour = parseYoudaoFrench(BONJOUR, 'bonjour')
  assert.equal(parsedBonjour.starred, false)
})

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

    let receivedRefresh
    const open = createStudyServer({
      database: join(dir, 'open.sqlite'),
      origin: 'http://localhost:5173',
      accessPassword: '',
      youdaoLookup: async (query, options) => {
        receivedRefresh = options.forceRefresh
        calls += 1
        assert.equal(query, 'bonjour')
        return { value: parseYoudaoFrench(BONJOUR, query) }
      },
    })
    await new Promise((resolve) => open.listen(0, '127.0.0.1', resolve))
    try {
      const ok = await fetch(`http://127.0.0.1:${open.address().port}/api/study-plan/dictionary?q=${encodeURIComponent('bonjour')}`)
      assert.equal(ok.status, 200)
      assert.equal(receivedRefresh, false)
      const refreshed = await fetch(`http://127.0.0.1:${open.address().port}/api/study-plan/dictionary?q=bonjour&refresh=1`)
      assert.equal(refreshed.status, 200)
      assert.equal(receivedRefresh, true)
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

test('fetchYoudaoFrenchVoice validates query, handles upstream success and errors', async () => {
  const invalid = await fetchYoudaoFrenchVoice('')
  assert.equal(invalid.error, 'invalid')

  const validAudio = Buffer.alloc(250, 0x5a)
  const ok = await fetchYoudaoFrenchVoice('bonjour', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
      arrayBuffer: async () => validAudio.buffer,
    }),
  })
  assert.equal(ok.error, undefined)
  assert.equal(ok.buffer.length, 250)

  // Non-200
  const notFound = await fetchYoudaoFrenchVoice('bonjour', {
    fetchImpl: async () => ({
      ok: false,
      status: 404,
      headers: { 'content-type': 'audio/mpeg' },
    }),
  })
  assert.equal(notFound.error, 'upstream')

  // Non-audio content type
  const badContent = await fetchYoudaoFrenchVoice('bonjour', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { 'content-type': 'text/html' },
      arrayBuffer: async () => validAudio.buffer,
    }),
  })
  assert.equal(badContent.error, 'upstream')

  // Too small (< 200 bytes)
  const tooSmall = await fetchYoudaoFrenchVoice('bonjour', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
      arrayBuffer: async () => Buffer.alloc(100).buffer,
    }),
  })
  assert.equal(tooSmall.error, 'upstream')
})

test('dictionary voice route is access-gated, caches hits, handles errors and methods', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'youdao-voice-'))
  const dummyAudio = Buffer.alloc(300, 0x42)
  let calls = 0
  const server = createStudyServer({
    database: join(dir, 'data.sqlite'),
    origin: 'http://localhost:5173',
    accessPassword: 'secret',
    youdaoVoice: async () => {
      calls += 1
      return { buffer: dummyAudio }
    },
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const denied = await fetch(`${base}/api/study-plan/dictionary/voice?q=bonjour`)
    assert.equal(denied.status, 401)
    assert.equal(calls, 0)

    const open = createStudyServer({
      database: join(dir, 'open.sqlite'),
      origin: 'http://localhost:5173',
      accessPassword: '',
      youdaoVoice: async (query) => {
        calls += 1
        assert.equal(query, 'bonjour')
        return { buffer: dummyAudio }
      },
    })
    await new Promise((resolve) => open.listen(0, '127.0.0.1', resolve))
    try {
      const openBase = `http://127.0.0.1:${open.address().port}`

      // Success returns injected bytes with audio/mpeg
      const ok = await fetch(`${openBase}/api/study-plan/dictionary/voice?q=${encodeURIComponent('bonjour')}`)
      assert.equal(ok.status, 200)
      assert.equal(ok.headers.get('content-type'), 'audio/mpeg')
      const bytes = Buffer.from(await ok.arrayBuffer())
      assert.deepEqual(bytes, dummyAudio)
      assert.equal(calls, 1)

      // Second request for the same word is served from cache (upstream called once)
      const cached = await fetch(`${openBase}/api/study-plan/dictionary/voice?q=${encodeURIComponent('bonjour')}`)
      assert.equal(cached.status, 200)
      assert.equal(cached.headers.get('content-type'), 'audio/mpeg')
      const cachedBytes = Buffer.from(await cached.arrayBuffer())
      assert.deepEqual(cachedBytes, dummyAudio)
      assert.equal(calls, 1)

      // Empty or invalid query -> 400
      const empty = await fetch(`${openBase}/api/study-plan/dictionary/voice?q=`)
      assert.equal(empty.status, 400)
      const invalid = await fetch(`${openBase}/api/study-plan/dictionary/voice?q=${encodeURIComponent('<script>')}`)
      assert.equal(invalid.status, 400)

      // Non-GET -> 405
      const nonGet = await fetch(`${openBase}/api/study-plan/dictionary/voice?q=bonjour`, {
        method: 'POST',
        headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json' },
      })
      assert.equal(nonGet.status, 405)

      // Upstream failure -> 502 and is not cached
      let failCalls = 0
      const down = createStudyServer({
        database: join(dir, 'down.sqlite'),
        origin: 'http://localhost:5173',
        accessPassword: '',
        youdaoVoice: async () => {
          failCalls += 1
          return { error: 'upstream' }
        },
      })
      await new Promise((resolve) => down.listen(0, '127.0.0.1', resolve))
      try {
        const downBase = `http://127.0.0.1:${down.address().port}`
        const failed1 = await fetch(`${downBase}/api/study-plan/dictionary/voice?q=bonjour`)
        assert.equal(failed1.status, 502)
        assert.equal(failCalls, 1)

        const failed2 = await fetch(`${downBase}/api/study-plan/dictionary/voice?q=bonjour`)
        assert.equal(failed2.status, 502)
        assert.equal(failCalls, 2)
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

test('an explicit refresh replaces a cached miss and subsequent normal queries use the new hit', async () => {
  const cache = createYoudaoCache()
  let calls = 0
  const fetchImpl = async () => ({ ok: true, text: async () => JSON.stringify(++calls === 1 ? {} : BONJOUR) })
  await lookupYoudaoFrench('bonjour', { fetchImpl, cache, now: 1000 })
  const stale = await lookupYoudaoFrench('bonjour', { fetchImpl, cache, now: 1001 })
  assert.equal(stale.cached, true)
  assert.equal(stale.value.senses.length, 0)
  const fresh = await lookupYoudaoFrench('bonjour', { fetchImpl, cache, now: 1002, forceRefresh: true })
  assert.equal(fresh.value.senses[0].gloss, '早安，日安，白天好，你好')
  const reused = await lookupYoudaoFrench('bonjour', { fetchImpl, cache, now: 1003 })
  assert.equal(reused.cached, true)
  assert.equal(calls, 2)
})

test('dictionary voice route rejects starred headwords with 422 and caches verdict', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'youdao-fr-starred-'))
  let voiceCalls = 0
  let lookupCalls = 0
  const dummyAudio = Buffer.alloc(256, 1)

  const server = createStudyServer({
    database: join(dir, 'starred.sqlite'),
    origin: 'http://localhost:5173',
    accessPassword: '',
    youdaoVoice: async () => {
      voiceCalls += 1
      return { buffer: dummyAudio }
    },
    youdaoLookup: async (query) => {
      lookupCalls += 1
      if (query === 'vouloir') {
        return { value: parseYoudaoFrench(VOULOIR_STARRED, 'vouloir') }
      }
      return { value: parseYoudaoFrench(BONJOUR, query) }
    },
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    // Starred headword returns 422 DICTIONARY_VOICE_STARRED
    const res1 = await fetch(`${base}/api/study-plan/dictionary/voice?q=vouloir`)
    assert.equal(res1.status, 422)
    const body1 = await res1.json()
    assert.equal(body1.code, 'DICTIONARY_VOICE_STARRED')
    assert.equal(voiceCalls, 0)
    assert.equal(lookupCalls, 1)

    // Second call is served from voice cache verdict (no voice calls, no lookup calls)
    const res2 = await fetch(`${base}/api/study-plan/dictionary/voice?q=vouloir`)
    assert.equal(res2.status, 422)
    const body2 = await res2.json()
    assert.equal(body2.code, 'DICTIONARY_VOICE_STARRED')
    assert.equal(voiceCalls, 0)
    assert.equal(lookupCalls, 1)

    // Normal non-starred word succeeds 200
    const ok = await fetch(`${base}/api/study-plan/dictionary/voice?q=bonjour`)
    assert.equal(ok.status, 200)
    assert.equal(voiceCalls, 1)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

