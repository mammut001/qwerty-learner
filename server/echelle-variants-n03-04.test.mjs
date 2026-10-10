import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { N03_04_SCENARIOS } from './echelle-variants/n03-04.mjs'
import { ECHELLE_ITEM_CATALOG, mulberry32 } from './echelle-curriculum.mjs'

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length
}

const EXPECTED_INDICATORS = [
  // Niveau 3 listening (5)
  'n3-listening-0',
  'n3-listening-1',
  'n3-listening-2',
  'n3-listening-3',
  'n3-listening-4',
  // Niveau 3 reading (5)
  'n3-reading-0',
  'n3-reading-1',
  'n3-reading-2',
  'n3-reading-3',
  'n3-reading-4',
  // Niveau 4 listening (7)
  'n4-listening-0',
  'n4-listening-1',
  'n4-listening-2',
  'n4-listening-3',
  'n4-listening-4',
  'n4-listening-5',
  'n4-listening-6',
  // Niveau 4 reading (6)
  'n4-reading-0',
  'n4-reading-1',
  'n4-reading-2',
  'n4-reading-3',
  'n4-reading-4',
  'n4-reading-5',
]

const badFrenchRegexes = [
  { re: /\b(de|que|je|ne|me|te|se)\s+[aeiouéèêàâîôû]\w{2,}/i, name: 'elision' },
  { re: /\b(de le|à le|de les|à les)\b/i, name: 'contraction' },
  { re: /\b(Les|Des) \S+ (se trouve|est)\b/, name: 'agreement' },
]

const ABSURDITY_TERMS = [
  'lion',
  'manchot',
  'tornade',
  "piste d'atterrissage",
  'ile inhabitee',
  'cinq etoiles',
  'demolir',
]

function normalizeForSearch(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
}

function checkAbsurdity(choice) {
  const norm = normalizeForSearch(choice)
  for (const term of ABSURDITY_TERMS) {
    if (term.includes(' ')) {
      if (norm.includes(term)) return term
    } else {
      const re = new RegExp(`\\b${term}s?\\b`, 'i')
      if (re.test(norm)) return term
    }
  }
  return null
}

function extract6Grams(text) {
  const words = normalizeForSearch(text).split(/[^a-z0-9]+/).filter(Boolean)
  const grams = new Set()
  for (let i = 0; i <= words.length - 6; i++) {
    grams.add(words.slice(i, i + 6).join(' '))
  }
  return grams
}

function has6GramOverlap(text, choice) {
  const textGrams = extract6Grams(text)
  if (textGrams.size === 0) return false
  const choiceWords = normalizeForSearch(choice).split(/[^a-z0-9]+/).filter(Boolean)
  for (let i = 0; i <= choiceWords.length - 6; i++) {
    if (textGrams.has(choiceWords.slice(i, i + 6).join(' '))) return true
  }
  return false
}

describe('Échelle québécoise Niveaux 3 & 4 practice scenarios (n03-04)', () => {
  it('covers all 23 expected listening and reading indicators and all exist in ECHELLE_ITEM_CATALOG', () => {
    assert.strictEqual(Object.keys(N03_04_SCENARIOS).length, 23)
    for (const id of EXPECTED_INDICATORS) {
      assert.ok(N03_04_SCENARIOS[id], `Missing scenario entry for ${id}`)
      assert.ok(ECHELLE_ITEM_CATALOG[id], `Item ID ${id} not found in ECHELLE_ITEM_CATALOG`)
    }
  })

  for (const itemId of EXPECTED_INDICATORS) {
    describe(`Indicator: ${itemId}`, () => {
      const scenarios = N03_04_SCENARIOS[itemId]
      const isN3 = itemId.startsWith('n3-')
      const isListening = itemId.includes('-listening-')
      const minWords = isN3 ? Math.round(25 * 0.85) : Math.round(40 * 0.85) // 21 or 34
      const maxWords = isN3 ? Math.round(45 * 1.15) : Math.round(70 * 1.15) // 52 or 81

      it('has at least 5 scenarios with both situation 0 and 1 covered and >= 2 slot templates', () => {
        assert.ok(Array.isArray(scenarios), `Scenarios for ${itemId} is not an array`)
        assert.ok(scenarios.length >= 5, `${itemId} has only ${scenarios.length} scenarios, expected >= 5`)

        const hasSitu0 = scenarios.some((s) => s.situation === 0)
        const hasSitu1 = scenarios.some((s) => s.situation === 1)
        assert.ok(hasSitu0, `${itemId} is missing situation 0`)
        assert.ok(hasSitu1, `${itemId} is missing situation 1`)

        const templateCount = scenarios.filter((s) => typeof s === 'function').length
        assert.ok(templateCount >= 2, `${itemId} has ${templateCount} templates, expected >= 2`)
      })

      it('is deterministic, yields >= 40 distinct texts, conforms to word counts and French invariants over 300 seeded builds', () => {
        const distinctTexts = new Set()
        let longestAnswerCount = 0
        let totalQuestions = 0
        let verbatimBuildCount = 0

        for (let seed = 1; seed <= 300; seed++) {
          // Determinism check: building twice with identical seed produces identical output
          const rand1 = mulberry32(seed)
          const scIdx1 = Math.floor(rand1() * scenarios.length)
          const sc1 = scenarios[scIdx1]
          const res1 = typeof sc1 === 'function' ? sc1(rand1) : sc1

          const rand2 = mulberry32(seed)
          const scIdx2 = Math.floor(rand2() * scenarios.length)
          const sc2 = scenarios[scIdx2]
          const res2 = typeof sc2 === 'function' ? sc2(rand2) : sc2

          assert.deepStrictEqual(res1, res2, `Non-deterministic output for ${itemId} with seed ${seed}`)

          distinctTexts.add(res1.text)

          // Word count check
          const wc = countWords(res1.text)
          assert.ok(
            wc >= minWords && wc <= maxWords,
            `Word count ${wc} out of bounds [${minWords}, ${maxWords}] for ${itemId} seed ${seed}: "${res1.text}"`
          )

          // Unresolved slot markers check
          assert.strictEqual(
            /undefined|null|NaN|\$\{|\{|\}/.test(res1.text),
            false,
            `Unresolved slot marker in ${itemId} seed ${seed}: "${res1.text}"`
          )

          // French syntax checks
          for (const rule of badFrenchRegexes) {
            const match = res1.text.match(rule.re)
            assert.strictEqual(
              match,
              null,
              `Broken French (${rule.name}: "${match?.[0]}") in ${itemId} seed ${seed}: "${res1.text}"`
            )
          }

          // Punctuation check: uppercase after full stop or question mark
          const punctMatch = res1.text.match(/(?:\.|\?)\s+([a-zà-ÿ])/g)
          assert.strictEqual(
            punctMatch,
            null,
            `Lowercase after full stop/question mark (${punctMatch?.[0]}) in ${itemId} seed ${seed}: "${res1.text}"`
          )

          // Listening check: no emoji or digits-only tables
          if (isListening) {
            assert.strictEqual(
              /[\u{1F300}-\u{1F9FF}]/u.test(res1.text),
              false,
              `Emoji found in listening text for ${itemId} seed ${seed}: "${res1.text}"`
            )
            assert.strictEqual(
              /\|\s*\d+\s*\|/.test(res1.text),
              false,
              `Table found in listening text for ${itemId} seed ${seed}: "${res1.text}"`
            )
          }

          // Questions check
          assert.ok(Array.isArray(res1.questions) && res1.questions.length === 2, `Expected 2 questions in ${itemId}`)
          let buildHasOverlap = false
          for (const q of res1.questions) {
            totalQuestions++
            const [prompt, correct, d1, d2] = q

            assert.ok(prompt && typeof prompt === 'string', `Empty prompt in ${itemId}`)
            assert.ok(correct && typeof correct === 'string', `Empty correct answer in ${itemId}`)
            assert.ok(d1 && typeof d1 === 'string', `Empty distractor 1 in ${itemId}`)
            assert.ok(d2 && typeof d2 === 'string', `Empty distractor 2 in ${itemId}`)

            // 3 distinct non-empty choices
            assert.notStrictEqual(correct, d1, `Duplicate choices (correct == d1) in ${itemId}: "${prompt}"`)
            assert.notStrictEqual(correct, d2, `Duplicate choices (correct == d2) in ${itemId}: "${prompt}"`)
            assert.notStrictEqual(d1, d2, `Duplicate choices (d1 == d2) in ${itemId}: "${prompt}"`)

            // No unresolved markers in questions
            assert.strictEqual(
              /undefined|null|NaN|\$\{|\{|\}/.test(prompt + correct + d1 + d2),
              false,
              `Unresolved marker in question row for ${itemId}: "${prompt}"`
            )

            // Absurdity blacklist check: options contain no absurdity terms
            for (const choice of [correct, d1, d2]) {
              const hit = checkAbsurdity(choice)
              assert.strictEqual(
                hit,
                null,
                `Absurd choice found ("${hit}") in ${itemId} seed ${seed}: "${choice}"`
              )
            }

            // Option lengths within ±40% of their mean
            const meanLen = (correct.length + d1.length + d2.length) / 3
            for (const choice of [correct, d1, d2]) {
              const diff = Math.abs(choice.length - meanLen)
              assert.ok(
                diff <= meanLen * 0.40,
                `Option length ${choice.length} out of ±40% mean (${meanLen.toFixed(1)}) in ${itemId} seed ${seed}: "${choice}"`
              )
            }

            // Verbatim 6-word run check: correct answer vs text
            if (has6GramOverlap(res1.text, correct)) {
              buildHasOverlap = true
            }

            // Ratio check: correct length <= 1.6 * average distractor length
            const avgDist = (d1.length + d2.length) / 2
            assert.ok(
              correct.length <= avgDist * 1.6,
              `Correct answer too long (ratio ${(correct.length / avgDist).toFixed(2)} > 1.6) in ${itemId}: "${correct}" vs "${d1}", "${d2}"`
            )

            if (correct.length > d1.length && correct.length > d2.length) {
              longestAnswerCount++
            }
          }
          if (buildHasOverlap) {
            verbatimBuildCount++
          }
        }

        // Distinct texts check
        assert.ok(
          distinctTexts.size >= 40,
          `Expected >= 40 distinct texts over 300 seeds for ${itemId}, got ${distinctTexts.size}`
        )

        // Longest choice frequency check (<= 40%)
        const longestPct = (longestAnswerCount / totalQuestions) * 100
        assert.ok(
          longestPct <= 40,
          `Correct answer is longest choice ${longestPct.toFixed(1)}% of the time (> 40% allowed) for ${itemId}`
        )

        // Verbatim frequency check (<= 15% of builds)
        const verbatimPct = (verbatimBuildCount / 300) * 100
        assert.ok(
          verbatimPct <= 15,
          `Correct answer shares 6-word run with text in ${verbatimPct.toFixed(1)}% of builds (> 15% allowed) for ${itemId}`
        )
      })
    })
  }
})
