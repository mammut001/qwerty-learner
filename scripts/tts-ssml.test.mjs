import {
  PREFIX_IPA,
  cleanLexiconIpa,
  escapeXml,
  extractLexiconIpa,
  findMissingElisionCombos,
  formatTtsSpokenText,
  formatTtsSsml,
  normalizeElisionCombo,
  shardOf,
} from '../src/utils/ttsSsml.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'

test('cleanLexiconIpa strips slashes, backslashes, syllable dots, and tie bars', () => {
  assert.equal(cleanLexiconIpa('/e.kɔl/'), 'ekɔl')
  assert.equal(cleanLexiconIpa('\\e.pa.nwiʁ\\'), 'epanwiʁ')
  assert.equal(cleanLexiconIpa('/o.ʒuʁ.d‿ɥi/'), 'oʒuʁdɥi')
  assert.equal(cleanLexiconIpa('\\o.ʒuʁ.d‿ɥi\\'), 'oʒuʁdɥi')
  assert.equal(cleanLexiconIpa('/de.te/'), 'dete')
  assert.equal(cleanLexiconIpa(''), '')
  assert.equal(cleanLexiconIpa(null), '')
  assert.equal(cleanLexiconIpa(undefined), '')
})

test('extractLexiconIpa extracts and cleans first valid IPA from raw entries', () => {
  const singleEntry = [['noun', '/e.kɔl/', 'f', ['school'], ['学校']]]
  assert.equal(extractLexiconIpa(singleEntry), 'ekɔl')

  const fallbackEntry = [
    ['unknown', '', '', [], ['avoir的变位形式']],
    ['verb', '\\e.pa.nwiʁ\\', '', [], []],
  ]
  assert.equal(extractLexiconIpa(fallbackEntry), 'epanwiʁ')

  const emptyEntries = [['unknown', '', '', [], []]]
  assert.equal(extractLexiconIpa(emptyEntries), '')
  assert.equal(extractLexiconIpa([]), '')
  assert.equal(extractLexiconIpa(null), '')
})

test('normalizeElisionCombo normalizes casing and apostrophes to typographic ’', () => {
  assert.equal(normalizeElisionCombo("l'école"), 'l’école')
  assert.equal(normalizeElisionCombo('L’École'), 'l’école')
  assert.equal(normalizeElisionCombo("QU'IL"), 'qu’il')
  assert.equal(normalizeElisionCombo("aujourd'hui"), 'aujourd’hui')
  assert.equal(normalizeElisionCombo('Aujourd’hui'), 'aujourd’hui')
})

test('shardOf calculates proper two-letter shard for French words', () => {
  assert.equal(shardOf('école'), 'ec')
  assert.equal(shardOf('épanouir'), 'ep')
  assert.equal(shardOf('été'), 'et')
  assert.equal(shardOf('histoire'), 'hi')
  assert.equal(shardOf('à'), 'a_')
})

test('escapeXml correctly escapes &, <, and > without altering other characters', () => {
  assert.equal(escapeXml('Art & Culture <2026>'), 'Art &amp; Culture &lt;2026&gt;')
  assert.equal(escapeXml("l'école d'été"), "l'école d'été")
  assert.equal(escapeXml('« Bonjour »'), '« Bonjour »')
})

test('formatTtsSsml wraps elision combos with SSML phoneme tags and speak root', () => {
  const customDict = {
    'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
    'd’été': { ipa: 'dete', source: 'lexicon', reviewed: false },
    'c’est': { ipa: 'sɛst', source: 'lexicon', reviewed: false },
    'qu’il': { ipa: 'kil', source: 'lexicon', reviewed: false },
    'aujourd’hui': { ipa: 'oʒuʁdɥi', source: 'lexicon', reviewed: false },
  }

  // Single combo
  assert.equal(formatTtsSsml("l'école", { dictionary: customDict }), '<speak><phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme></speak>')
  assert.equal(formatTtsSsml('l’école', { dictionary: customDict }), '<speak><phoneme alphabet="ipa" ph="lekɔl">l’école</phoneme></speak>')

  // Multiple combos per sentence
  assert.equal(
    formatTtsSsml("C'est l'école d'été.", { dictionary: customDict }),
    '<speak><phoneme alphabet="ipa" ph="sɛst">C\'est</phoneme> <phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme> <phoneme alphabet="ipa" ph="dete">d\'été</phoneme>.</speak>',
  )

  // Case preservation: combo as written is preserved inside tag
  assert.equal(
    formatTtsSsml("L'ÉCOLE et QU'IL vienne", {
      dictionary: {
        'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
        'qu’il': { ipa: 'kil', source: 'lexicon', reviewed: false },
      },
    }),
    '<speak><phoneme alphabet="ipa" ph="lekɔl">L\'ÉCOLE</phoneme> et <phoneme alphabet="ipa" ph="kil">QU\'IL</phoneme> vienne</speak>',
  )

  // aujourd'hui compound
  assert.equal(
    formatTtsSsml("Aujourd'hui, c'est ouvert.", { dictionary: customDict }),
    '<speak><phoneme alphabet="ipa" ph="oʒuʁdɥi">Aujourd\'hui</phoneme>, <phoneme alphabet="ipa" ph="sɛst">c\'est</phoneme> ouvert.</speak>',
  )
})

test('formatTtsSsml handles XML escaping of & and < in text with elision combos', () => {
  const customDict = {
    'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
  }

  const input = "« Art & culture : l'école <primaire> »"
  const expected = '<speak>« Art &amp; culture : <phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme> &lt;primaire&gt; »</speak>'
  assert.equal(formatTtsSsml(input, { dictionary: customDict }), expected)
})

test('formatTtsSsml applies réévalue fix alongside SSML phoneme wrapping', () => {
  const customDict = {
    'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
  }

  assert.equal(
    formatTtsSsml("Je réévalue l'école", { dictionary: customDict }),
    '<speak>Je ré-évalue <phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme></speak>',
  )
})

test('formatTtsSsml preserves plain text when no elision combos are present', () => {
  assert.equal(formatTtsSsml('Bonjour à tous le monde.'), 'Bonjour à tous le monde.')
  assert.equal(formatTtsSsml('Bonjour à tous le monde.', { alwaysWrapSpeak: true }), '<speak>Bonjour à tous le monde.</speak>')
})

test('refusal on missing IPA: findMissingElisionCombos and formatTtsSsml throw behavior', () => {
  const customDict = {
    'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
    'j’ai': { ipa: '', source: 'manual', reviewed: false },
  }

  // Detection of missing combos
  const missing = findMissingElisionCombos("J'ai vu l'école et j'arrive", customDict)
  assert.deepEqual(missing.sort(), ['j’ai', 'j’arrive'])

  // Refusal when allowMissing is false (default)
  assert.throws(
    () => formatTtsSsml("J'ai vu l'école", { dictionary: customDict, allowMissing: false }),
    /Refusing SSML synthesis: combo "j’ai" has empty IPA in dictionary/,
  )

  // Bypassed when allowMissing is true
  const allowed = formatTtsSsml("J'ai vu l'école", { dictionary: customDict, allowMissing: true })
  assert.equal(allowed, '<speak>J\'ai vu <phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme></speak>')
})

test('formatTtsSpokenText uses committed dictionary by default and formats standard examples', () => {
  const s1 = formatTtsSpokenText("l'école")
  assert.equal(s1, '<speak><phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme></speak>')

  const s2 = formatTtsSpokenText('s’épanouir')
  assert.equal(s2, '<speak><phoneme alphabet="ipa" ph="sepanwiʁ">s’épanouir</phoneme></speak>')

  const s3 = formatTtsSpokenText("d'été")
  assert.equal(s3, '<speak><phoneme alphabet="ipa" ph="dete">d\'été</phoneme></speak>')
})

test('say strategy replaces combo with plain escaped say text and avoids phoneme element', () => {
  const customDict = {
    'd’oignon': { ipa: 'dɔɲɔ̃', say: 'doignon', source: 'manual', reviewed: false, note: 'Chirp rejects ɲ in phoneme' },
    'l’école': { ipa: 'lekɔl', source: 'lexicon', reviewed: false },
    'qu’autre': { ipa: '', say: 'quautre & plus', source: 'manual', reviewed: false },
  }

  // d'oignon replaces with "doignon" instead of <phoneme>
  assert.equal(
    formatTtsSsml("des pelures d'oignon fraîches", { dictionary: customDict }),
    '<speak>des pelures doignon fraîches</speak>',
  )
  assert.equal(
    formatTtsSsml('des pelures d’oignon fraîches', { dictionary: customDict }),
    '<speak>des pelures doignon fraîches</speak>',
  )

  // Mixed: one combo with phoneme, one combo with say
  assert.equal(
    formatTtsSsml("l'école et d'oignon", { dictionary: customDict }),
    '<speak><phoneme alphabet="ipa" ph="lekɔl">l\'école</phoneme> et doignon</speak>',
  )

  // say with empty ipa does NOT count as missing and does not throw with allowMissing: false
  assert.deepEqual(findMissingElisionCombos("rien qu'autre", customDict), [])
  assert.equal(
    formatTtsSsml("rien qu'autre", { dictionary: customDict, allowMissing: false }),
    '<speak>rien quautre &amp; plus</speak>',
  )

  // Real committed dictionary formats d’oignon as doignon without phoneme
  const committedReal = formatTtsSpokenText("pelures d’oignon pour le bouillon")
  assert.equal(committedReal, '<speak>pelures doignon pour le bouillon</speak>')
  assert.ok(!committedReal.includes('<phoneme'))
})
