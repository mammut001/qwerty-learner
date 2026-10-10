import test, { describe, it } from 'node:test'
import assert from 'node:assert'
import { mulberry32, shuffle, ECHELLE_ITEM_CATALOG } from './echelle-curriculum.mjs'
import { N07_08_SCENARIOS } from './echelle-variants/n07-08.mjs'


const N7_INDICATORS = [
  'n7-listening-0', 'n7-listening-1', 'n7-listening-2', 'n7-listening-3',
  'n7-reading-0', 'n7-reading-1', 'n7-reading-2', 'n7-reading-3',
]

const N8_INDICATORS = [
  'n8-listening-0', 'n8-listening-1', 'n8-listening-2', 'n8-listening-3', 'n8-listening-4',
  'n8-reading-0', 'n8-reading-1', 'n8-reading-2', 'n8-reading-3', 'n8-reading-4',
]

const ALL_INDICATORS = [...N7_INDICATORS, ...N8_INDICATORS]

function countFrenchWords(text) {
  if (!text || typeof text !== 'string') return 0
  const normalized = text.replace(/['’]/g, ' ')
  const words = normalized.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu)
  return words ? words.length : 0
}

function checkRegexInString(str, context) {
  assert.ok(!/\b(de le|à le|de les|à les)\b/i.test(str), `Forbidden contraction in ${context}: "${str}"`)
  assert.ok(!/\b(de|que|je|ne|me|te|se)\s+[aeiouéèêàâîôû]\w{2,}/i.test(str), `Forbidden missing elision in ${context}: "${str}"`)
  assert.ok(!/merci[^.!?]*\bpour (avoir|être)\b/i.test(str), `Forbidden "merci pour avoir/être" in ${context}: "${str}"`)
  assert.ok(!/(?:^|[.!?]\s+)[a-zàâéèêîôû]/.test(str.replace(/(?:etc\.|p\. ex\.|M\.|Mme)\s+[a-z]/g, '')), `Lowercase after punctuation in ${context}: "${str}"`)
  assert.ok(!/undefined|null|NaN|\$\{/.test(str), `Unresolved template token in ${context}: "${str}"`)
  assert.ok(!/  /.test(str), `Double space in ${context}: "${str}"`)
}

describe('Échelle québécoise Niveaux 7-8 Scenarios Invariant Tests', () => {
  it('covers all 18 indicators and all item IDs exist in ECHELLE_ITEM_CATALOG', () => {
    for (const itemId of ALL_INDICATORS) {
      assert.ok(ECHELLE_ITEM_CATALOG[itemId], `Item id ${itemId} must exist in ECHELLE_ITEM_CATALOG`)
      assert.ok(Array.isArray(N07_08_SCENARIOS[itemId]), `Scenario bank missing array for ${itemId}`)
    }
  })

  for (const itemId of ALL_INDICATORS) {
    const isN7 = itemId.startsWith('n7-')
    const level = isN7 ? 7 : 8
    const minWords = Math.floor((isN7 ? 130 : 150) * 0.85)
    const maxWords = Math.ceil((isN7 ? 180 : 210) * 1.15)
    const isListening = itemId.includes('listening')

    describe(`Indicator ${itemId} (Niveau ${level})`, () => {
      const scenarios = N07_08_SCENARIOS[itemId] || []

      it('has at least 4 scenarios and covers both situations (0 and 1)', () => {
        assert.ok(scenarios.length >= 4, `${itemId}: expected >= 4 scenarios, got ${scenarios.length}`)
        const situations = new Set(scenarios.map((s) => s.situation))
        assert.ok(situations.has(0), `${itemId}: missing situation 0`)
        assert.ok(situations.has(1), `${itemId}: missing situation 1`)
      })

      it('produces deterministic output, >= 6 distinct texts, and respects word bounds across 300 seeds', () => {
        const texts = new Set()
        for (let seed = 1; seed <= 300; seed++) {
          const rand1 = mulberry32(seed)
          const scIdx1 = Math.floor(rand1() * scenarios.length)
          const sc1 = scenarios[scIdx1]
          const built1 = typeof sc1 === 'function' ? sc1(rand1) : sc1

          const rand2 = mulberry32(seed)
          const scIdx2 = Math.floor(rand2() * scenarios.length)
          const sc2 = scenarios[scIdx2]
          const built2 = typeof sc2 === 'function' ? sc2(rand2) : sc2

          assert.deepStrictEqual(built1, built2, `${itemId} must be deterministic for seed ${seed}`)
          texts.add(built1.text)

          const wc = countFrenchWords(built1.text)
          assert.ok(
            wc >= minWords && wc <= maxWords,
            `${itemId} seed ${seed}: word count ${wc} out of bounds [${minWords}, ${maxWords}] for text:\n${built1.text}`,
          )
        }
        assert.ok(texts.size >= 6, `${itemId}: expected >= 6 distinct texts, got ${texts.size}`)
      })

      it('satisfies quality invariants for questions, distractors, implicit questions, and zero regex hits', () => {
        let totalQuestions = 0
        let strictlyLongestCount = 0

        scenarios.forEach((sc, scIdx) => {
          const text = sc.text
          checkRegexInString(text, `${itemId} sc${scIdx} text`)

          if (isListening) {
            assert.ok(!/[\u{1F300}-\u{1F9FF}]/u.test(text), `${itemId} sc${scIdx}: listening text contains emoji`)
          }

          assert.strictEqual(sc.questions.length, 3, `${itemId} sc${scIdx} must have exactly 3 questions`)
          let hasImplicit = false

          sc.questions.forEach(([prompt, correct, d1, d2], qIdx) => {
            totalQuestions++
            checkRegexInString(prompt, `${itemId} sc${scIdx} q${qIdx} prompt`)
            checkRegexInString(correct, `${itemId} sc${scIdx} q${qIdx} correct`)
            checkRegexInString(d1, `${itemId} sc${scIdx} q${qIdx} d1`)
            checkRegexInString(d2, `${itemId} sc${scIdx} q${qIdx} d2`)

            // 3 choices distinct and non-empty
            const choices = [correct, d1, d2]
            assert.strictEqual(new Set(choices).size, 3, `${itemId} sc${scIdx} q${qIdx}: choices must be distinct`)
            choices.forEach((c) => assert.ok(c && c.trim().length > 0))

            // Check implicit question presence
            if (/implicite|sous-entendu|déduire|attitude|intention|sentiment|ton de|réaction/i.test(prompt)) {
              hasImplicit = true
            }

            // Paraphrase check: no 6 consecutive words shared between text and correct answer
            const textWords = text.toLowerCase().replace(/['’]/g, ' ').match(/[\p{L}\p{N}]+/gu) || []
            const correctWords = correct.toLowerCase().replace(/['’]/g, ' ').match(/[\p{L}\p{N}]+/gu) || []
            if (correctWords.length >= 6) {
              const textWordStr = textWords.join(' ')
              for (let i = 0; i <= correctWords.length - 6; i++) {
                const sub = correctWords.slice(i, i + 6).join(' ')
                assert.ok(
                  !textWordStr.includes(sub),
                  `${itemId} sc${scIdx} q${qIdx}: correct answer shares 6 consecutive words with text: "${sub}"`,
                )
              }
            }

            // Length ratio: correct answer not longer than 1.6x avg distractor
            const avgDist = (d1.length + d2.length) / 2
            assert.ok(
              correct.length <= 1.6 * avgDist,
              `${itemId} sc${scIdx} q${qIdx}: correct answer (${correct.length}) > 1.6x avg distractor (${avgDist})`,
            )

            // Strictly longest option tracking
            if (correct.length > d1.length && correct.length > d2.length) {
              strictlyLongestCount++
            }
          })

          assert.ok(
            hasImplicit,
            `${itemId} sc${scIdx}: must have at least one question testing an implicit element`,
          )
        })

        const longestPct = (strictlyLongestCount / totalQuestions) * 100
        assert.ok(
          longestPct <= 40,
          `${itemId}: correct answer is strictly longest in ${longestPct.toFixed(1)}% of questions (> 40% allowed: ${strictlyLongestCount}/${totalQuestions})`,
        )
      })
    })
  }
})
