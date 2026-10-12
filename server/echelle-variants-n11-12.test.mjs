import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ECHELLE_ITEM_CATALOG, mulberry32 } from './echelle-curriculum.mjs'
import { N11_12_SCENARIOS } from './echelle-variants/n11-12.mjs'

const N11_INDICATORS = [
  'n11-listening-0',
  'n11-listening-1',
  'n11-listening-2',
  'n11-listening-3',
  'n11-reading-0',
  'n11-reading-1',
  'n11-reading-2',
  'n11-reading-3',
]

const N12_INDICATORS = [
  'n12-listening-0',
  'n12-listening-1',
  'n12-listening-2',
  'n12-reading-0',
  'n12-reading-1',
  'n12-reading-2',
]

const ALL_INDICATORS = [...N11_INDICATORS, ...N12_INDICATORS]

function countWords(str) {
  return (str.match(/[a-zA-ZÀ-ÿ0-9'’]+(-[a-zA-ZÀ-ÿ0-9'’]+)*/g) || []).length
}

function tokenizeWords(str) {
  return (str.toLowerCase().match(/[a-zà-ÿ0-9]+/g) || [])
}

function hasSixConsecutiveWordsShared(text, choice) {
  const textWords = tokenizeWords(text)
  const choiceWords = tokenizeWords(choice)
  if (choiceWords.length < 6) return false
  for (let i = 0; i <= choiceWords.length - 6; i++) {
    const gram = choiceWords.slice(i, i + 6).join(' ')
    for (let j = 0; j <= textWords.length - 6; j++) {
      if (textWords.slice(j, j + 6).join(' ') === gram) {
        return true
      }
    }
  }
  return false
}

const ABSOLUTIST_RE = /\b(plus jamais|sans exception|uniquement|totalement interdit)\b/i

function normalizeOption(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(l['’]|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|d['’])/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Build a scenario using mulberry32 for a given seed
function buildScenario(scenarios, seed) {
  const rand = mulberry32(seed)
  const idx = Math.floor(rand() * scenarios.length)
  const sc = scenarios[idx]
  const raw = typeof sc === 'function' ? sc(rand) : (typeof sc.build === 'function' ? sc.build(rand) : sc)
  return {
    ...raw,
    scenarioIndex: idx,
  }
}

describe('N11–N12 Échelle québécoise variant scenarios', () => {
  it('covers all required indicator IDs and exists in ECHELLE_ITEM_CATALOG', () => {
    assert.strictEqual(Object.keys(N11_12_SCENARIOS).length, 14)
    for (const id of ALL_INDICATORS) {
      assert.ok(N11_12_SCENARIOS[id], `Missing indicator ${id} in N11_12_SCENARIOS`)
      assert.ok(ECHELLE_ITEM_CATALOG[id], `Indicator ${id} does not exist in ECHELLE_ITEM_CATALOG`)
      assert.strictEqual(ECHELLE_ITEM_CATALOG[id].kind, 'indicator')
    }
  })

  it('provides at least 4 scenarios per indicator with both situation 0 and 1', () => {
    for (const id of ALL_INDICATORS) {
      const scenarios = N11_12_SCENARIOS[id]
      assert.ok(
        scenarios.length >= 4,
        `Indicator ${id} has fewer than 4 scenarios: ${scenarios.length}`
      )
      const situations = new Set(scenarios.map((s) => s.situation))
      assert.ok(
        situations.has(0),
        `Indicator ${id} is missing situation 0`
      )
      assert.ok(
        situations.has(1),
        `Indicator ${id} is missing situation 1`
      )
    }
  })

  it('is deterministic, yields ≥ 4 distinct texts across 300 seeds, and respects word bounds (N11: 204–368, N12: 221–391)', () => {
    for (const id of ALL_INDICATORS) {
      const isN11 = id.startsWith('n11-')
      const minWords = isN11 ? Math.floor(240 * 0.85) : Math.floor(260 * 0.85) // 204 / 221
      const maxWords = isN11 ? Math.ceil(320 * 1.15) : Math.ceil(340 * 1.15) // 368 / 391
      const scenarios = N11_12_SCENARIOS[id]
      const texts = new Set()

      for (let seed = 1; seed <= 300; seed++) {
        const b1 = buildScenario(scenarios, seed)
        const b2 = buildScenario(scenarios, seed)

        assert.deepStrictEqual(b1, b2, `Non-deterministic output for ${id} with seed ${seed}`)
        texts.add(b1.text)

        const wc = countWords(b1.text)
        assert.ok(
          wc >= minWords && wc <= maxWords,
          `Word count ${wc} out of bounds [${minWords}, ${maxWords}] for ${id} seed ${seed}`
        )
      }

      assert.ok(
        texts.size >= 4,
        `Expected ≥ 4 distinct texts for ${id} across 300 seeds, got ${texts.size}`
      )
    }
  })

  it('validates question structure: 4 questions per scenario, exactly 3 distinct non-empty choices, correct answer length ratio ≤ 1.6', () => {
    for (const id of ALL_INDICATORS) {
      const scenarios = N11_12_SCENARIOS[id]
      for (let scIdx = 0; scIdx < scenarios.length; scIdx++) {
        const sc = scenarios[scIdx]
        assert.strictEqual(
          sc.questions.length,
          4,
          `Scenario ${id}[${scIdx}] does not have exactly 4 questions (has ${sc.questions.length})`
        )

        for (let qIdx = 0; qIdx < sc.questions.length; qIdx++) {
          const row = sc.questions[qIdx]
          assert.strictEqual(
            row.length,
            4,
            `Question ${id}[${scIdx}][${qIdx}] must have prompt + 3 choices (row length 4, got ${row.length})`
          )
          const [prompt, correct, d1, d2] = row
          assert.ok(prompt && prompt.trim().length > 0, `Empty prompt in ${id}[${scIdx}][${qIdx}]`)
          assert.ok(correct && correct.trim().length > 0, `Empty correct answer in ${id}[${scIdx}][${qIdx}]`)
          assert.ok(d1 && d1.trim().length > 0, `Empty distractor 1 in ${id}[${scIdx}][${qIdx}]`)
          assert.ok(d2 && d2.trim().length > 0, `Empty distractor 2 in ${id}[${scIdx}][${qIdx}]`)

          const choices = [correct, d1, d2]
          assert.strictEqual(
            new Set(choices).size,
            3,
            `Duplicate choices in ${id}[${scIdx}][${qIdx}]: ${choices.join(' | ')}`
          )
          const normChoices = new Set(choices.map(normalizeOption))
          assert.strictEqual(
            normChoices.size,
            3,
            `Duplicate normalized choices in ${id}[${scIdx}][${qIdx}]: ${choices.map(normalizeOption).join(' | ')}`
          )

          const avgDistractorLen = (d1.length + d2.length) / 2
          const ratio = correct.length / avgDistractorLen
          assert.ok(
            ratio >= 0.65 && ratio <= 1.35,
            `Correct answer length ratio ${ratio.toFixed(2)} out of [0.65, 1.35] (correct: ${correct.length}, mean distractors: ${avgDistractorLen}) in ${id}[${scIdx}][${qIdx}]`
          )

          for (const str of [prompt, ...choices]) {
            assert.strictEqual(
              ABSOLUTIST_RE.test(str),
              false,
              `Absolutist marker found in ${id}[${scIdx}][${qIdx}]: "${str}"`
            )
            assert.strictEqual(
              /,\s+[A-ZÀ-ÖØ-ß]/.test(str),
              false,
              `Capital after comma found in ${id}[${scIdx}][${qIdx}]: "${str}"`
            )
          }

          assert.strictEqual(
            hasSixConsecutiveWordsShared(sc.text, correct),
            false,
            `Correct answer shares ≥ 6 consecutive words with text in ${id}[${scIdx}][${qIdx}]: "${correct}"`
          )
        }
      }
    }
  })

  it('seeded generation across 50 seeds satisfies quality guards (normalized uniqueness, length balance [0.65, 1.35], clean syntax)', () => {
    for (const id of ALL_INDICATORS) {
      const scenarios = N11_12_SCENARIOS[id]
      for (let seed = 1; seed <= 50; seed++) {
        const built = buildScenario(scenarios, seed)
        for (let qIdx = 0; qIdx < built.questions.length; qIdx++) {
          const [prompt, correct, d1, d2] = built.questions[qIdx]
          const choices = [correct, d1, d2]
          const norm = choices.map(normalizeOption)
          assert.strictEqual(
            new Set(norm).size,
            3,
            `Duplicate normalized option in ${id} seed ${seed} q${qIdx}`
          )
          const avgDist = (d1.length + d2.length) / 2
          const ratio = correct.length / avgDist
          assert.ok(
            ratio >= 0.65 && ratio <= 1.35,
            `Length ratio ${ratio.toFixed(2)} out of [0.65, 1.35] in ${id} seed ${seed} q${qIdx}`
          )
          for (const str of [prompt, ...choices]) {
            assert.strictEqual(
              ABSOLUTIST_RE.test(str),
              false,
              `Absolutist marker in ${id} seed ${seed} q${qIdx}: "${str}"`
            )
            assert.strictEqual(
              /,\s+[A-ZÀ-ÖØ-ß]/.test(str),
              false,
              `Capital after comma in ${id} seed ${seed} q${qIdx}: "${str}"`
            )
          }
        }
      }
    }
  })

  it('strictly longest correct option is at most 40% of questions per indicator', () => {
    for (const id of ALL_INDICATORS) {
      const scenarios = N11_12_SCENARIOS[id]
      let totalQuestions = 0
      let strictlyLongestCount = 0

      for (const sc of scenarios) {
        for (const row of sc.questions) {
          totalQuestions++
          const [, correct, d1, d2] = row
          if (correct.length > d1.length && correct.length > d2.length) {
            strictlyLongestCount++
          }
        }
      }

      const ratio = strictlyLongestCount / totalQuestions
      assert.ok(
        ratio <= 0.40,
        `Indicator ${id} has strictly longest correct answer in ${(ratio * 100).toFixed(1)}% of questions (> 40%)`
      )
    }
  })

  it('listening texts contain no emoji, tables, or formatting markers', () => {
    for (const id of ALL_INDICATORS.filter((i) => i.includes('listening'))) {
      const scenarios = N11_12_SCENARIOS[id]
      for (let scIdx = 0; scIdx < scenarios.length; scIdx++) {
        const text = scenarios[scIdx].text
        assert.strictEqual(
          /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(text),
          false,
          `Emoji found in listening text ${id}[${scIdx}]`
        )
        assert.strictEqual(
          /\|.*\|/.test(text),
          false,
          `Table formatting found in listening text ${id}[${scIdx}]`
        )
      }
    }
  })

  it('zero forbidden grammar, elision, and syntax patterns across all scenarios', () => {
    // Contracted articles: de le, à le, de les, à les, de des (with unicode word boundary)
    const contractedArticlesRe = /(?:^|[\s,;:(«'’])(de\s+le|à\s+le|de\s+les|à\s+les|de\s+des)(?:[\s,;:)»'’]|$)/i
    const deLeNounRe = /\bde le\s+[a-zà-ÿ]/i

    // Unelided short grammatical words before vowels: de, que, je, ne, me, te, se
    // Accounting for French accented letters before and after
    const unelidedRe = /(?:^|[\s,;:(«'’])(de|que|je|ne|me|te|se)\s+([aeiouéèêàâîôû][a-zA-Zà-ÿ0-9]{2,})/i

    // merci pour avoir / être
    const merciPourRe = /merci[^.!?]*\bpour\s+(?:avoir|être)\b/i

    // double spaces
    const doubleSpaceRe = / {2}/

    // placeholder / unresolved tokens
    const placeholderRe = /(undefined|null|NaN|\$\{|\{|\})/

    // lowercase after sentence end
    const lowercaseAfterEndRe = /[.?!]\s+([a-zàâéèêîôû])/

    const abbrevs = ['p. ex.', 'etc.', 'i.e.', 'al.', 'vol.', 'art.', 'n°', 'dr.', 'dre.']

    for (const id of ALL_INDICATORS) {
      const scenarios = N11_12_SCENARIOS[id]
      for (let scIdx = 0; scIdx < scenarios.length; scIdx++) {
        const sc = scenarios[scIdx]
        const allStrings = [
          sc.text,
          ...sc.questions.flatMap((q) => q),
        ]

        for (const str of allStrings) {
          const mContr = str.match(contractedArticlesRe)
          assert.strictEqual(mContr, null, `Forbidden contracted article "${mContr?.[1]}" in ${id}[${scIdx}]`)

          assert.strictEqual(deLeNounRe.test(str), false, `Forbidden "de le + noun" in ${id}[${scIdx}]: "${str}"`)

          const mUnelided = str.match(unelidedRe)
          assert.strictEqual(mUnelided, null, `Unelided word "${mUnelided?.[1]} ${mUnelided?.[2]}" in ${id}[${scIdx}]`)

          const mMerci = str.match(merciPourRe)
          assert.strictEqual(mMerci, null, `Forbidden "merci pour avoir/être" in ${id}[${scIdx}]`)

          const mDoubleSpace = str.match(doubleSpaceRe)
          assert.strictEqual(mDoubleSpace, null, `Double space found in ${id}[${scIdx}]`)

          const mPlaceholder = str.match(placeholderRe)
          assert.strictEqual(mPlaceholder, null, `Unresolved placeholder "${mPlaceholder?.[1]}" in ${id}[${scIdx}]`)

          let pos = 0
          while (true) {
            const sub = str.slice(pos)
            const mLower = sub.match(lowercaseAfterEndRe)
            if (!mLower) break
            const matchIndex = pos + mLower.index
            const pre = str.slice(Math.max(0, matchIndex - 12), matchIndex + 2)
            const isAbbrev = abbrevs.some((ab) => pre.toLowerCase().includes(ab.toLowerCase()))
            assert.ok(
              isAbbrev,
              `Lowercase letter right after punctuation in ${id}[${scIdx}]: "...${pre}${mLower[1]}..."`
            )
            pos = matchIndex + mLower[0].length
          }
        }
      }
    }
  })
})
