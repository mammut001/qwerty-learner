import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { N01_02_SCENARIOS } from './echelle-variants/n01-02.mjs'
import { N03_04_SCENARIOS } from './echelle-variants/n03-04.mjs'
import * as shared from './echelle-variants/shared.mjs'
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

describe('Guard test: Levels 1–4 French grammar invariants and answer binding', () => {
  it('enforces French invariants, distinct options, and answer evidence binding across 300 seeded builds for all scenarios in levels 1–4', () => {
    // 1. Build slot gender dictionaries from metadata
    const maleNames = shared.PERSONAS.filter((p) => p.gender === 'm').map((p) => p.name)
    const femaleNames = shared.PERSONAS.filter((p) => p.gender === 'f').map((p) => p.name)
    const chereMaleRegex = new RegExp(`\\bChère\\s+(?:${maleNames.join('|')})\\b`, 'u')
    const cherFemaleRegex = new RegExp(`\\bCher\\s+(?:${femaleNames.join('|')})\\b`, 'u')

    const slotMascNouns = new Set()
    const slotFemNouns = new Set()

    for (const val of Object.values(shared)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object') {
            const noun = item.base || item.noun || item.name
            const g = item.gender
            if (noun && typeof noun === 'string' && (g === 'm' || g === 'f') && item.number !== 'p') {
              const firstWord = noun.trim().split(/\s+/)[0].toLowerCase().replace(/^[dl]’/i, '')
              if (firstWord.length > 2 && !maleNames.map((n) => n.toLowerCase()).includes(firstWord) && !femaleNames.map((n) => n.toLowerCase()).includes(firstWord)) {
                if (g === 'm') slotMascNouns.add(firstWord)
                if (g === 'f') slotFemNouns.add(firstWord)
              }
            }
            if (item.article === 'un' && item.name) {
              const firstWord = item.name.trim().split(/\s+/)[0].toLowerCase().replace(/^[dl]’/i, '')
              if (firstWord.length > 2) slotMascNouns.add(firstWord)
            }
            if (item.article === 'une' && item.name) {
              const firstWord = item.name.trim().split(/\s+/)[0].toLowerCase().replace(/^[dl]’/i, '')
              if (firstWord.length > 2) slotFemNouns.add(firstWord)
            }
          }
        }
      }
    }

    // Patterns
    const PROPER_NAME_ALLOWLIST = new Set([
      'le devoir', 'le soleil', 'le cartet', 'les laurentides', 'le plateau', 'les habitations', 'le châtelet'
    ])
    const contractionRegex = /(?:^|[\s,;!?'’(])(à|de)\s+(le|les)\s+([a-zà-ÿA-ZÀ-Ý\w]+)/giu
    const deDesRegex = /(?:^|[\s,;!?'’(])de\s+des(?:$|[\s,;!?'’)])/iu
    const doubledFuncRegex = /(?:^|[\s,;!?'’(])(de|le|la|les|un|une|à)\s+\1(?:$|[\s,;!?'’)])/iu
    const wrongElisionRegex = /(?:^|[\s,;!?'’(])(d|l|qu|j|n|s|m|t|c)[’'](?![aeiouyhâàéèêëîïôöûùœAEIOUYHÂÀÉÈÊÎÔÛŒ\d])/iu
    const MANDATORY_ELISION_ALLOWLIST = new Set([
      'onze', 'onzième', 'un', 'une', 'huit', 'huitième', 'oui'
    ])
    const mandatoryElisionRegex = /(?:^|[\s,;!?'’(])(de|le|la|que|je|ne|se|me|te|lorsque|puisque|jusque)\s+([a-zà-ÿ]+)/giu
    const ilFautDeRegex = /il faut\s+(?:absolument\s+)?d[e’']/iu

    const allIndicators = { ...N01_02_SCENARIOS, ...N03_04_SCENARIOS }
    let scenariosChecked = 0
    let buildsChecked = 0
    let questionsChecked = 0

    for (const [indicatorId, scenarioList] of Object.entries(allIndicators)) {
      for (let sIdx = 0; sIdx < scenarioList.length; sIdx++) {
        scenariosChecked++
        const sc = scenarioList[sIdx]
        const isTemplate = typeof sc === 'function'
        const iterations = isTemplate ? 300 : 1

        for (let seed = 1; seed <= iterations; seed++) {
          buildsChecked++
          const rand = mulberry32(seed)
          const build = isTemplate ? sc(rand) : sc

          assert.ok(build.text && typeof build.text === 'string', `Missing text in ${indicatorId} sc ${sIdx}`)
          assert.ok(Array.isArray(build.questions) && build.questions.length > 0, `Missing questions in ${indicatorId} sc ${sIdx}`)

          const stringsToCheck = [{ type: 'text', val: build.text }]

          for (let qIdx = 0; qIdx < build.questions.length; qIdx++) {
            questionsChecked++
            const q = build.questions[qIdx]
            const [prompt, correct, d1, d2] = q

            assert.ok(prompt && typeof prompt === 'string', `Empty prompt in ${indicatorId} sc ${sIdx} q ${qIdx}`)
            assert.ok(correct && typeof correct === 'string', `Empty correct answer in ${indicatorId} sc ${sIdx} q ${qIdx}`)
            assert.ok(d1 && typeof d1 === 'string', `Empty d1 in ${indicatorId} sc ${sIdx} q ${qIdx}`)
            assert.ok(d2 && typeof d2 === 'string', `Empty d2 in ${indicatorId} sc ${sIdx} q ${qIdx}`)

            // Distinct options
            assert.notStrictEqual(correct, d1, `Duplicate choices (correct == d1) in ${indicatorId} sc ${sIdx} seed ${seed}: "${prompt}"`)
            assert.notStrictEqual(correct, d2, `Duplicate choices (correct == d2) in ${indicatorId} sc ${sIdx} seed ${seed}: "${prompt}"`)
            assert.notStrictEqual(d1, d2, `Duplicate choices (d1 == d2) in ${indicatorId} sc ${sIdx} seed ${seed}: "${prompt}"`)

            // Trivial variant check
            const norm = (s) => String(s).toLowerCase().trim().replace(/[’']/g, "'").replace(/[.,!?;:]/g, '')
            assert.notStrictEqual(norm(correct), norm(d1), `Trivial variant (correct ≈ d1) in ${indicatorId} sc ${sIdx} seed ${seed}: "${correct}" vs "${d1}"`)
            assert.notStrictEqual(norm(correct), norm(d2), `Trivial variant (correct ≈ d2) in ${indicatorId} sc ${sIdx} seed ${seed}: "${correct}" vs "${d2}"`)
            assert.notStrictEqual(norm(d1), norm(d2), `Trivial variant (d1 ≈ d2) in ${indicatorId} sc ${sIdx} seed ${seed}: "${d1}" vs "${d2}"`)

            // Answer-binding check:
            if (isTemplate) {
              assert.ok(
                Array.isArray(q.evidence) && q.evidence.length >= 1,
                `Template question missing evidence keywords in ${indicatorId} sc ${sIdx} q ${qIdx}: "${prompt}"`
              )
              const lowerText = build.text.toLowerCase()
              for (const kw of q.evidence) {
                assert.ok(
                  lowerText.includes(kw.toLowerCase()),
                  `Evidence keyword "${kw}" not found in built text for ${indicatorId} sc ${sIdx} seed ${seed}: "${build.text}"`
                )
              }
            }

            stringsToCheck.push({ type: `q${qIdx}_prompt`, val: prompt })
            stringsToCheck.push({ type: `q${qIdx}_correct`, val: correct })
            stringsToCheck.push({ type: `q${qIdx}_d1`, val: d1 })
            stringsToCheck.push({ type: `q${qIdx}_d2`, val: d2 })
          }

          // Check patterns over text, questions and options
          for (const { type, val } of stringsToCheck) {
            if (!val || typeof val !== 'string') continue

            // 1. Contraction check
            let m
            contractionRegex.lastIndex = 0
            while ((m = contractionRegex.exec(val)) !== null) {
              const phrase = `${m[2]} ${m[3]}`.toLowerCase()
              if (!PROPER_NAME_ALLOWLIST.has(phrase)) {
                const nextWord = m[3]
                const isCapitalized = /^[A-ZÀ-Ý]/.test(nextWord)
                if (!isCapitalized) {
                  assert.fail(`[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Contraction error "${m[0].trim()}": in "${val}"`)
                }
              }
            }

            // 2. de des
            assert.strictEqual(
              deDesRegex.test(val),
              false,
              `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] "de des" found in "${val}"`
            )

            // 3. Doubled function words
            if (doubledFuncRegex.test(val)) {
              const hit = val.match(doubledFuncRegex)
              assert.fail(`[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Doubled function word "${hit[0].trim()}" in "${val}"`)
            }

            // 4. Wrong elision
            if (wrongElisionRegex.test(val)) {
              const hit = val.match(wrongElisionRegex)
              assert.fail(`[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Wrong elision "${hit[0].trim()}" in "${val}"`)
            }

            // 5. Mandatory elision
            mandatoryElisionRegex.lastIndex = 0
            let me
            while ((me = mandatoryElisionRegex.exec(val)) !== null) {
              const nextWord = me[2].toLowerCase()
              const firstChar = nextWord[0]
              if ('aeiouâàéèêîôûœ'.includes(firstChar) && !MANDATORY_ELISION_ALLOWLIST.has(nextWord)) {
                assert.fail(`[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Mandatory elision missing "${me[0].trim()}" in "${val}"`)
              }
            }

            // 6. il faut de
            assert.strictEqual(
              ilFautDeRegex.test(val),
              false,
              `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] "il faut de" found in "${val}"`
            )

            // 7. Persona gender agreement
            assert.strictEqual(
              chereMaleRegex.test(val),
              false,
              `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Found "Chère <MaleName>" agreement error in "${val}"`
            )
            assert.strictEqual(
              cherFemaleRegex.test(val),
              false,
              `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Found "Cher <FemaleName>" agreement error in "${val}"`
            )

            // 8. Gender clash with slot nouns
            for (const mascNoun of slotMascNouns) {
              const clashRe = new RegExp(`(?:^|[\\s,;!?'’])(une|la|cette)\\s+${mascNoun}(?:$|[\\s,;!?'’])`, 'iu')
              assert.strictEqual(
                clashRe.test(val),
                false,
                `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Fem article before masc noun "${mascNoun}" in "${val}"`
              )
            }
            for (const femNoun of slotFemNouns) {
              const clashRe = new RegExp(`(?:^|[\\s,;!?'’])(un|le|ce|cet)\\s+${femNoun}(?:$|[\\s,;!?'’])`, 'iu')
              assert.strictEqual(
                clashRe.test(val),
                false,
                `[${indicatorId} sc ${sIdx} seed ${seed} in ${type}] Masc article before fem noun "${femNoun}" in "${val}"`
              )
            }
          }
        }
      }
    }

    const summaryMsg = `Guard test complete: checked ${scenariosChecked} scenarios, ${buildsChecked} builds, ${questionsChecked} questions across levels 1–4.`
    console.log(summaryMsg)
    process.on('exit', () => {
      console.log(summaryMsg)
    })
  })
})
