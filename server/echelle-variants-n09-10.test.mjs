import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { N09_10_SCENARIOS } from './echelle-variants/n09-10.mjs'
import { ECHELLE_ITEM_CATALOG, mulberry32 } from './echelle-curriculum.mjs'
import { LEXIQUE_TOPICS } from './echelle-lexique-bank.mjs'
import { SENTENCE_GRAMMAR } from './echelle-grammar-bank.mjs'
import { TEXT_GRAMMAR } from './echelle-texte-bank.mjs'

function djb2(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) + str.charCodeAt(i)
  return hash >>> 0
}

function normalizeWords(str) {
  return str
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/[^a-zà-ÿ0-9\s]/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function hasCommon6WordSeq(text, ans) {
  const tw = normalizeWords(text)
  const aw = normalizeWords(ans)
  if (aw.length < 6 || tw.length < 6) return false
  const tSet = new Set()
  for (let i = 0; i <= tw.length - 6; i++) {
    tSet.add(tw.slice(i, i + 6).join(' '))
  }
  for (let i = 0; i <= aw.length - 6; i++) {
    if (tSet.has(aw.slice(i, i + 6).join(' '))) return true
  }
  return false
}

const N9_INDICATORS = [
  'n9-listening-0', 'n9-listening-1', 'n9-listening-2', 'n9-listening-3', 'n9-listening-4',
  'n9-reading-0', 'n9-reading-1', 'n9-reading-2', 'n9-reading-3', 'n9-reading-4',
]

const N10_INDICATORS = [
  'n10-listening-0', 'n10-listening-1', 'n10-listening-2', 'n10-listening-3', 'n10-listening-4',
  'n10-reading-0', 'n10-reading-1', 'n10-reading-2', 'n10-reading-3',
]

const ALL_INDICATORS = [...N9_INDICATORS, ...N10_INDICATORS]

const N9_10_LEXIQUE_TOPICS = ['domaine-expertise', 'langage-image']

const N9_10_GRAMMAR_CONCEPTS = [
  'negation-diverse', 'discours-indirect', 'relatifs-complexes',
  'correlatives', 'concordance', 'indicatif-subjonctif', 'accord-pp', 'accord-gv',
]

const N9_10_TEXTE_CONCEPTS = [
  'connecteurs-variete', 'substituts', 'ponctuation-style',
  'relations-implicites', 'coherence-temporelle',
]

const KNOWN_ABBREVIATIONS = ['p. ex.', 'etc.', 'c.-à-d.', 'vs.', 'M.', 'Mme', 'Dr.', 'Dre.']
const LEGITIMATE_ELISION_EXCEPTIONS = new Set(['de un', 'de une', 'de huit', 'de onze', 'je hais'])

function checkCleanFrench(str, context) {
  // Contractions check
  assert.ok(!/\b(de le|à le|de les|à les)\b/i.test(str), `Forbidden contraction in ${context}: "${str}"`)

  // Missing elision check (using Unicode boundary to avoid false positives on accented letters in JS)
  const elisionMatch = str.match(/(?<![\p{L}\p{M}])(de|que|je|ne|me|te|se)\s+([aeiouéèêàâîôû][\p{L}\p{M}]{2,})/ui)
  if (elisionMatch) {
    const matched = elisionMatch[0].toLowerCase()
    assert.ok(
      LEGITIMATE_ELISION_EXCEPTIONS.has(matched),
      `Forbidden missing elision in ${context}: "${elisionMatch[0]}" in "${str}"`
    )
  }

  // Merci pour avoir/être check
  assert.ok(!/merci[^.!?]*\bpour (avoir|être)\b/i.test(str), `Forbidden "merci pour avoir/être" in ${context}: "${str}"`)

  // Lowercase letter right after punctuation
  let cleanPunct = str.replace(/\.\.\./g, '…')
  for (const abbrev of KNOWN_ABBREVIATIONS) {
    cleanPunct = cleanPunct.replaceAll(abbrev, '___')
  }
  const punctMatch = cleanPunct.match(/[.!?]["»]?\s+([a-zàâéèêîôû])/)
  assert.strictEqual(
    punctMatch,
    null,
    `Lowercase letter after sentence terminator in ${context}: "${punctMatch?.[0]}" in "${str}"`
  )

  // Placeholders check
  assert.ok(!/undefined|null|NaN|\$\{/.test(str), `Unresolved template placeholder in ${context}: "${str}"`)

  // Double spaces check
  assert.ok(!/  /.test(str), `Double space in ${context}: "${str}"`)
}

describe('Échelle québécoise Niveaux 9–10 Scenarios and Banks', () => {
  it('covers all 19 listening and reading indicator keys in ECHELLE_ITEM_CATALOG', () => {
    assert.strictEqual(Object.keys(N09_10_SCENARIOS).length, 19)
    for (const id of ALL_INDICATORS) {
      assert.ok(N09_10_SCENARIOS[id], `Missing scenario entry for ${id}`)
      assert.ok(ECHELLE_ITEM_CATALOG[id], `Item ${id} not found in ECHELLE_ITEM_CATALOG`)
    }
  })

  it('provides at least 4 scenarios per indicator, with both official situation types (0 and 1) and valid frames', () => {
    for (const [id, scenarios] of Object.entries(N09_10_SCENARIOS)) {
      assert.ok(
        scenarios.length >= 4,
        `Expected >= 4 scenarios for ${id}, found ${scenarios.length}`
      )
      const count0 = scenarios.filter((s) => s.situation === 0).length
      const count1 = scenarios.filter((s) => s.situation === 1).length
      assert.ok(count0 >= 2, `Indicator ${id} missing >= 2 scenarios for situation 0 (got ${count0})`)
      assert.ok(count1 >= 2, `Indicator ${id} missing >= 2 scenarios for situation 1 (got ${count1})`)

      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const sc = scenarios[sIdx]
        assert.ok(
          sc.situation === 0 || sc.situation === 1,
          `Indicator ${id} scenario ${sIdx} has invalid situation: ${sc.situation}`
        )
        assert.ok(
          typeof sc.frame === 'string' && sc.frame.trim().length > 0,
          `Indicator ${id} scenario ${sIdx} missing non-empty frame string`
        )
        const frameWords = sc.frame.trim().split(/\s+/).filter(Boolean)
        assert.ok(
          frameWords.length <= 12,
          `Indicator ${id} scenario ${sIdx} frame "${sc.frame}" exceeds 12 words (${frameWords.length})`
        )
      }
    }
  })

  it('satisfies invariants across 300 seeded builds for each indicator', () => {
    for (const [id, scenarios] of Object.entries(N09_10_SCENARIOS)) {
      const isN9 = id.startsWith('n9-')
      const isListening = id.includes('-listening-')
      // N9 bounds: 190–260 words ±15% = [161, 299]
      // N10 bounds: 220–300 words ±15% = [187, 345]
      const minWords = isN9 ? 161 : 187
      const maxWords = isN9 ? 299 : 345

      const distinctTexts = new Set()
      let totalQuestions = 0
      let longestCorrectCount = 0

      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const sc = scenarios[sIdx]

        // Determinism check: same seed produces identical output
        const rand1 = mulberry32(123456)
        const rand2 = mulberry32(123456)
        const inst1 = typeof sc === 'function' ? sc(rand1) : sc
        const inst2 = typeof sc === 'function' ? sc(rand2) : sc
        assert.strictEqual(
          inst1.text,
          inst2.text,
          `Non-deterministic text for ${id} scenario ${sIdx}`
        )
        assert.deepStrictEqual(
          inst1.questions,
          inst2.questions,
          `Non-deterministic questions for ${id} scenario ${sIdx}`
        )

        for (let seed = 0; seed < 300; seed++) {
          const rand = mulberry32(djb2(`${id}:${sIdx}:${seed}`))
          const inst = typeof sc === 'function' ? sc(rand) : sc
          const text = inst.text
          distinctTexts.add(text)

          // Check clean French on text
          checkCleanFrench(text, `${id} sc ${sIdx} seed ${seed} text`)

          // Word count bound check
          const words = text.trim().split(/\s+/).filter(Boolean).length
          assert.ok(
            words >= minWords && words <= maxWords,
            `Word count ${words} out of bounds [${minWords}, ${maxWords}] in ${id} sc ${sIdx} seed ${seed}`
          )

          // Listening texts contain no emojis or digits-only tables
          if (isListening) {
            assert.ok(
              !/[\u{1F300}-\u{1F9FF}]/u.test(text),
              `Emoji found in listening text ${id} sc ${sIdx}`
            )
            assert.ok(
              !/\n\s*\|\s*[\d\s|]+\|\s*\n/.test(text),
              `Digits-only table found in listening text ${id} sc ${sIdx}`
            )
          }

          // Questions check: exactly 4 questions per scenario
          assert.strictEqual(
            inst.questions.length,
            4,
            `Expected 4 questions in ${id} sc ${sIdx}, got ${inst.questions.length}`
          )

          for (let qIdx = 0; qIdx < inst.questions.length; qIdx++) {
            const row = inst.questions[qIdx]
            assert.strictEqual(
              row.length,
              4,
              `Expected question row [prompt, ans, dist1, dist2] in ${id} sc ${sIdx} q ${qIdx}`
            )
            const [prompt, ans, dist1, dist2] = row
            assert.ok(prompt && typeof prompt === 'string' && prompt.trim().length > 0)
            assert.ok(ans && typeof ans === 'string' && ans.trim().length > 0)
            assert.ok(dist1 && typeof dist1 === 'string' && dist1.trim().length > 0)
            assert.ok(dist2 && typeof dist2 === 'string' && dist2.trim().length > 0)

            checkCleanFrench(prompt, `${id} sc ${sIdx} q ${qIdx} prompt`)
            checkCleanFrench(ans, `${id} sc ${sIdx} q ${qIdx} ans`)
            checkCleanFrench(dist1, `${id} sc ${sIdx} q ${qIdx} dist1`)
            checkCleanFrench(dist2, `${id} sc ${sIdx} q ${qIdx} dist2`)

            const choices = new Set([ans, dist1, dist2])
            assert.strictEqual(
              choices.size,
              3,
              `Choices must be 3 distinct non-empty values in ${id} sc ${sIdx} q ${qIdx}`
            )

            // Length ratio check: correct answer <= 1.6x average distractor length
            const avgDistLen = (dist1.length + dist2.length) / 2
            assert.ok(
              ans.length <= 1.6 * avgDistLen,
              `Correct answer length (${ans.length}) exceeds 1.6x average distractor length (${avgDistLen}) in ${id} sc ${sIdx} q ${qIdx}`
            )

            // Paraphrasing check: no 6 consecutive words shared with text
            assert.ok(
              !hasCommon6WordSeq(text, ans),
              `Answer shares 6 consecutive words with text in ${id} sc ${sIdx} q ${qIdx}: "${ans}"`
            )

            if (seed === 0) {
              totalQuestions++
              if (ans.length > dist1.length && ans.length > dist2.length) {
                longestCorrectCount++
              }
            }
          }
        }
      }

      // Must yield >= 4 distinct texts
      assert.ok(
        distinctTexts.size >= 4,
        `Expected >= 4 distinct texts for ${id}, got ${distinctTexts.size}`
      )

      // Correct answer strictly longest in at most 40% of questions of the indicator
      const longestPct = (longestCorrectCount / totalQuestions) * 100
      assert.ok(
        longestPct <= 40,
        `Correct answer is strictly longest in ${longestPct.toFixed(1)}% (> 40%) of questions for indicator ${id}`
      )
    }
  })

  it('validates extended lexique topics first introduced at Niveaux 9–10', () => {
    const lexiqueMap = new Map(LEXIQUE_TOPICS.map((t) => [t.id, t.words]))
    for (const topic of N9_10_LEXIQUE_TOPICS) {
      const entries = lexiqueMap.get(topic)
      assert.ok(entries, `Topic ${topic} missing from LEXIQUE_TOPICS`)
      assert.ok(
        entries.length >= 12 && entries.length <= 15,
        `Expected 12-15 entries for topic ${topic}, got ${entries.length}`
      )
      for (const entry of entries) {
        assert.ok(Array.isArray(entry) && entry.length === 2, `Entry must be [french, chinese] in topic ${topic}`)
        assert.ok(entry[0] && typeof entry[0] === 'string' && entry[0].length > 0)
        assert.ok(entry[1] && typeof entry[1] === 'string' && entry[1].length > 0)
      }
    }
  })

  it('validates extended grammar concepts first introduced at Niveaux 9–10', () => {
    const grammarMap = new Map(SENTENCE_GRAMMAR.map((c) => [c.id, c.questions]))
    for (const concept of N9_10_GRAMMAR_CONCEPTS) {
      const pool = grammarMap.get(concept)
      assert.ok(pool, `Concept ${concept} missing from SENTENCE_GRAMMAR`)
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 questions for grammar concept ${concept}, got ${pool.length}`
      )
      for (const q of pool) {
        assert.strictEqual(q.length, 4, `Question must be [prompt, ans, dist1, dist2] in concept ${concept}`)
        assert.ok(q[0].includes('___'), `Prompt must have blank '___' in grammar concept ${concept}`)
        assert.ok(q[1] && q[2] && q[3], `Choices must be non-empty in grammar concept ${concept}`)
        const choices = new Set([q[1], q[2], q[3]])
        assert.strictEqual(choices.size, 3, `Choices must be 3 distinct values in grammar concept ${concept}`)
      }
    }
  })

  it('validates extended texte concepts first introduced at Niveaux 9–10', () => {
    const texteMap = new Map(TEXT_GRAMMAR.map((c) => [c.id, c.questions]))
    for (const concept of N9_10_TEXTE_CONCEPTS) {
      const pool = texteMap.get(concept)
      assert.ok(pool, `Concept ${concept} missing from TEXT_GRAMMAR`)
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 questions for texte concept ${concept}, got ${pool.length}`
      )
      for (const q of pool) {
        assert.strictEqual(q.length, 4, `Question must be [prompt, ans, dist1, dist2] in concept ${concept}`)
        assert.ok(
          q[0].includes('___') || q[0].includes(':') || q[0].includes('Quelle phrase') || q[0].includes('Lien implicite'),
          `Prompt format in texte concept ${concept}: "${q[0]}"`
        )
        assert.ok(q[1] && q[2] && q[3], `Choices must be non-empty in texte concept ${concept}`)
        const choices = new Set([q[1], q[2], q[3]])
        assert.strictEqual(choices.size, 3, `Choices must be 3 distinct values in texte concept ${concept}`)
      }
    }
  })
})
