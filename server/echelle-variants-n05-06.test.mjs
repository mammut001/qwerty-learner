import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { N05_06_SCENARIOS, SLOT_NOUN_METADATA } from './echelle-variants/n05-06.mjs'
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
  if (aw.length < 6) return false
  const tSet = new Set()
  for (let i = 0; i <= tw.length - 6; i++) {
    tSet.add(tw.slice(i, i + 6).join(' '))
  }
  for (let i = 0; i <= aw.length - 6; i++) {
    if (tSet.has(aw.slice(i, i + 6).join(' '))) return true
  }
  return false
}

const EXPECTED_INDICATOR_IDS = [
  'n5-listening-0', 'n5-listening-1', 'n5-listening-2', 'n5-listening-3', 'n5-listening-4', 'n5-listening-5',
  'n5-reading-0', 'n5-reading-1', 'n5-reading-2', 'n5-reading-3', 'n5-reading-4', 'n5-reading-5',
  'n6-listening-0', 'n6-listening-1', 'n6-listening-2', 'n6-listening-3', 'n6-listening-4', 'n6-listening-5',
  'n6-reading-0', 'n6-reading-1', 'n6-reading-2', 'n6-reading-3', 'n6-reading-4', 'n6-reading-5',
]

const N5_6_LEXIQUE_TOPICS = [
  'demenagement', 'circulation', 'tourisme', 'urgences', 'renovation',
  'etudes', 'conditions-travail', 'actualite', 'taches-pro',
]

const N5_6_GRAMMAR_CONCEPTS = [
  'imparfait', 'action-recente', 'completives', 'infinitives', 'circonstancielles',
  'passif', 'si-realiste', 'passe-simple', 'accord-gn',
]

const N5_6_TEXTE_CONCEPTS = [
  'connecteurs-spatiaux', 'connecteurs-enumeratifs', 'reprise-possessifs-demonstratifs',
  'chronologie-present', 'connecteurs-illustration', 'pronoms-le-en', 'pc-imparfait',
]

const KNOWN_ABBREVIATIONS = ['p. ex.', 'etc.', 'c.-à-d.', 'vs.']

describe('Échelle québécoise Niveaux 5–6 Scenarios and Banks', () => {
  it('covers all 24 listening and reading indicator keys in ECHELLE_ITEM_CATALOG', () => {
    assert.strictEqual(Object.keys(N05_06_SCENARIOS).length, 24)
    for (const id of EXPECTED_INDICATOR_IDS) {
      assert.ok(N05_06_SCENARIOS[id], `Missing scenario entry for ${id}`)
      assert.ok(ECHELLE_ITEM_CATALOG[id], `Item ${id} not found in ECHELLE_ITEM_CATALOG`)
    }
  })

  it('provides at least 5 scenarios per indicator, with both official situation types (0 and 1)', () => {
    for (const [id, scenarios] of Object.entries(N05_06_SCENARIOS)) {
      assert.ok(
        scenarios.length >= 5,
        `Expected >= 5 scenarios for ${id}, found ${scenarios.length}`
      )
      const situations = new Set(scenarios.map((s) => s.situation))
      assert.ok(situations.has(0), `Indicator ${id} missing situation: 0`)
      assert.ok(situations.has(1), `Indicator ${id} missing situation: 1`)
    }
  })

  it('satisfies invariants across 300 seeded builds for each indicator', () => {
    for (const [id, scenarios] of Object.entries(N05_06_SCENARIOS)) {
      const isN5 = id.startsWith('n5-')
      const isListening = id.includes('-listening-')
      // N5 bounds: 70–110 words ±15% = [60, 126]
      // N6 bounds: 90–140 words ±15% = [77, 161]
      const minWords = isN5 ? 60 : 77
      const maxWords = isN5 ? 126 : 161

      const distinctTexts = new Set()

      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const sc = scenarios[sIdx]

        // Determinism check: same seed produces identical output
        const rand1 = mulberry32(424242)
        const rand2 = mulberry32(424242)
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

          // Word count bound check
          const words = text.trim().split(/\s+/).length
          assert.ok(
            words >= minWords && words <= maxWords,
            `Word count ${words} out of bounds [${minWords}, ${maxWords}] in ${id} sc ${sIdx} seed ${seed}`
          )

          // No unresolved template markers
          assert.ok(
            !/undefined|null|NaN|\$\{|\{|\}/.test(text),
            `Unresolved template marker in ${id} sc ${sIdx} seed ${seed}`
          )

          // No lowercase letter immediately following punctuation (sentence capitalisation)
          let cleanText = text
          for (const abbrev of KNOWN_ABBREVIATIONS) {
            cleanText = cleanText.replaceAll(abbrev, '___')
          }
          const punctMatch = cleanText.match(/[.!?]["»]?\s+([a-zà-ÿ])/)
          assert.strictEqual(
            punctMatch,
            null,
            `Lowercase letter after sentence terminator in ${id} sc ${sIdx}: "${punctMatch?.[0]}"`
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

          // Questions check
          assert.strictEqual(
            inst.questions.length,
            3,
            `Expected 3 questions in ${id} sc ${sIdx}, got ${inst.questions.length}`
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
          }
        }
      }

      // Must yield >= 12 distinct texts
      assert.ok(
        distinctTexts.size >= 12,
        `Expected >= 12 distinct texts for ${id}, got ${distinctTexts.size}`
      )
    }
  })

  it('validates extended lexique topics first introduced at Niveaux 5–6', () => {
    const lexiqueMap = new Map(LEXIQUE_TOPICS.map((t) => [t.id, t.words]))
    for (const topic of N5_6_LEXIQUE_TOPICS) {
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

  it('validates extended grammar concepts first introduced at Niveaux 5–6', () => {
    const grammarMap = new Map(SENTENCE_GRAMMAR.map((c) => [c.id, c.questions]))
    for (const concept of N5_6_GRAMMAR_CONCEPTS) {
      const pool = grammarMap.get(concept)
      assert.ok(pool, `Concept ${concept} missing from SENTENCE_GRAMMAR`)
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 questions for grammar concept ${concept}, got ${pool.length}`
      )
      for (const q of pool) {
        assert.strictEqual(q.length, 4, `Question must be [prompt, ans, dist1, dist2] in concept ${concept}`)
        if (concept === 'passe-simple') {
          assert.ok(q[0].includes('vient du verbe') || q[0].includes('En français courant') || q[0].includes('___'), `Prompt format in concept ${concept}`)
        } else {
          assert.ok(q[0].includes('___'), `Prompt must have blank '___' in grammar concept ${concept}`)
        }
        assert.ok(q[1] && q[2] && q[3], `Choices must be non-empty in grammar concept ${concept}`)
        const choices = new Set([q[1], q[2], q[3]])
        assert.strictEqual(choices.size, 3, `Choices must be 3 distinct values in grammar concept ${concept}`)
      }
    }
  })

  it('validates extended texte concepts first introduced at Niveaux 5–6', () => {
    const texteMap = new Map(TEXT_GRAMMAR.map((c) => [c.id, c.questions]))
    for (const concept of N5_6_TEXTE_CONCEPTS) {
      const pool = texteMap.get(concept)
      assert.ok(pool, `Concept ${concept} missing from TEXT_GRAMMAR`)
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 questions for texte concept ${concept}, got ${pool.length}`
      )
      for (const q of pool) {
        assert.strictEqual(q.length, 4, `Question must be [prompt, ans, dist1, dist2] in concept ${concept}`)
        assert.ok(q[0].includes('___'), `Prompt must have blank '___' in texte concept ${concept}`)
        assert.ok(q[1] && q[2] && q[3], `Choices must be non-empty in texte concept ${concept}`)
        const choices = new Set([q[1], q[2], q[3]])
        assert.strictEqual(choices.size, 3, `Choices must be 3 distinct values in texte concept ${concept}`)
      }
    }
  })

  it('satisfies Section B question quality invariants across 40 seeds per scenario', () => {
    for (const [id, scenarios] of Object.entries(N05_06_SCENARIOS)) {
      let strictlyLongestCount = 0
      let totalQ = 0

      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const sc = scenarios[sIdx]
        for (let seed = 0; seed < 40; seed++) {
          const rand = mulberry32(djb2(`${id}:${sIdx}:${seed}`))
          const inst = typeof sc === 'function' ? sc(rand) : sc
          const text = inst.text

          for (let qIdx = 0; qIdx < inst.questions.length; qIdx++) {
            totalQ++
            const [prompt, ans, dist1, dist2] = inst.questions[qIdx]

            // 1. Longest check
            if (ans.length > dist1.length && ans.length > dist2.length) {
              strictlyLongestCount++
            }

            // 2. Length deviation: no option differs from average option length by > 60%
            const avgLen = (ans.length + dist1.length + dist2.length) / 3
            for (const opt of [ans, dist1, dist2]) {
              const diff = Math.abs(opt.length - avgLen)
              assert.ok(
                diff / avgLen <= 0.60,
                `Option length deviation ${(diff / avgLen).toFixed(2)} exceeds 60% for option "${opt}" in ${id} sc ${sIdx} q ${qIdx}`
              )
            }

            // 3. Paraphrase check: correct answer shares no 6-word sequence with the text
            assert.ok(
              !hasCommon6WordSeq(text, ans),
              `Correct answer shares a 6-word sequence with text in ${id} sc ${sIdx} q ${qIdx}: "${ans}"`
            )
          }
        }
      }

      // Correct answer is the strictly longest option in at most 40% of questions per indicator
      const longestPct = strictlyLongestCount / totalQ
      assert.ok(
        longestPct <= 0.40,
        `Indicator ${id} has ${(longestPct * 100).toFixed(1)}% strictly longest answers, expected <= 40%`
      )
    }
  })

  it('satisfies slot grammar scan patterns without invalid contractions or elisions', () => {
    const p1 = /\b(de le|à le|de les|à les)\b/i
    const p2 = /\ben (le|la|les|l[’'])\s?\w+/i
    const p3 = /\bentre [^.;,]{3,40} à /i
    const p4 = /\b(de|que|je|ne|me|te|se)\s+[aeiouéèêàâîôû]\w{2,}/i
    const allowedP2 = [
      'en l’absence de', "en l'absence de",
      'en la matière', 'en la matiere',
      'en l’occurrence', "en l'occurrence",
      'en l’air', "en l'air",
    ]

    for (const [id, scenarios] of Object.entries(N05_06_SCENARIOS)) {
      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const sc = scenarios[sIdx]
        for (let seed = 0; seed < 40; seed++) {
          const rand = mulberry32(djb2(`${id}:${sIdx}:${seed}`))
          const inst = typeof sc === 'function' ? sc(rand) : sc
          const items = [inst.text]
          for (const q of inst.questions) items.push(q[0], q[1], q[2], q[3])

          for (const str of items) {
            assert.ok(!p1.test(str), `P1 contraction hit in ${id} sc ${sIdx}: "${str}"`)
            let cleanP2 = str
            for (const al of allowedP2) cleanP2 = cleanP2.replaceAll(al, '___')
            assert.ok(!p2.test(cleanP2), `P2 article after en hit in ${id} sc ${sIdx}: "${cleanP2}"`)
            assert.ok(!p3.test(str), `P3 entre ... à hit in ${id} sc ${sIdx}: "${str}"`)
            assert.ok(!p4.test(str), `P4 missing elision hit in ${id} sc ${sIdx}: "${str}"`)
          }
        }
      }
    }
  })

  it('satisfies comprehensive levels 5-6 guard invariants across 300 seeded builds', () => {
    const ALLOWED_PROPER_NOUNS = ['Le Devoir', 'Les Affaires', 'Le Soleil', 'Le Droit']

    const NON_ELIDING_WORDS = new Set([
      'haut', 'haute', 'hautes', 'hauteur', 'hausse', 'homard', 'hockey',
      'halte', 'harcèlement', 'hors', 'huit', 'onze', 'héroïque', 'hérisson',
      'hache', 'honte', 'haine', 'hasard', 'hâte', 'héros', 'hollande', 'hongrie',
      'harpon', 'harpons', 'yoga', 'yoho', 'yukon',
    ])

    const mascPersonas = new Set([
      'Patrick', 'Luc', 'Simon', 'Karim', 'Émile', 'Tariq',
      'Marc', 'David', 'Alexandre', 'Antoine', 'François', 'Mathieu',
    ])
    const femPersonas = new Set([
      'Marie-Ève', 'Marie', 'Geneviève', 'Isabelle', 'Véronique', 'Audrey',
      'Sophie', 'Valérie', 'Chantal', 'Monique', 'Nadia', 'Camille',
      'Julie', 'Caroline', 'Lucia',
    ])

    const mascNouns = SLOT_NOUN_METADATA.filter((n) => n.gender === 'm').map((n) => n.noun)
    const femNouns = SLOT_NOUN_METADATA.filter((n) => n.gender === 'f').map((n) => n.noun)
    const mascClashRe = new RegExp(`\\b(la|une|cette)\\s+(${mascNouns.join('|')})\\b`, 'iu')
    const femClashRe = new RegExp(`\\b(le|un|ce|cet)\\s+(${femNouns.join('|')})\\b`, 'iu')

    const contractionRe = /\b(à|de) (le|les)\b/i
    const deDesRe = /\bde des\b/i
    const doubledRe = /(?<![\p{L}\p{N}])(de|le|la|les|un|une|à)\s+\1(?![\p{L}\p{N}])/iu
    const wrongElisionRe = /(?<![\p{L}\p{N}])(d|l|qu|j|n|s|m|t|c)[’'](?![aeiouyhâàéèêëîïôöûùœAEIOUYHÂÀÉÈÊÎÔÛŒ\d])/iu
    const elisionCheckRe = /(?<![\p{L}\p{N}])(de|que|lorsque|puisque|jusque|je|ne|me|te|se)\s+([a-zà-ÿ]+)/giu
    const ilFautRe = /\bil faut (?:absolument )?d[e’']/i
    const cherRe = /\b(Cher|Chère|Chers|Chères)\s+([A-ZÀ-Ÿ][a-zà-ÿ-]+)/gu

    let totalBuilds = 0
    let totalQuestions = 0
    let totalScenarios = 0

    for (const [id, scenarios] of Object.entries(N05_06_SCENARIOS)) {
      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        totalScenarios++
        const sc = scenarios[sIdx]
        const isDynamic = typeof sc === 'function'
        const iterations = isDynamic ? 300 : 1

        for (let seed = 0; seed < iterations; seed++) {
          totalBuilds++
          const rand = mulberry32(djb2(`${id}:${sIdx}:${seed}`))
          const inst = isDynamic ? sc(rand) : sc
          const lowerText = inst.text.toLowerCase().replace(/[’']/g, ' ')

          // Option distinctness & answer-binding
          for (let qIdx = 0; qIdx < inst.questions.length; qIdx++) {
            totalQuestions++
            const q = inst.questions[qIdx]
            const [prompt, ans, dist1, dist2] = q
            const choices = [ans.trim().toLowerCase(), dist1.trim().toLowerCase(), dist2.trim().toLowerCase()]
            assert.strictEqual(
              new Set(choices).size,
              3,
              `Duplicate or trivial choices in ${id} sc ${sIdx} q ${qIdx}: ${JSON.stringify(choices)}`
            )

            const ev = q.evidence || []
            assert.ok(
              Array.isArray(ev) && ev.length >= 1,
              `Question must have at least 1 evidence keyword in ${id} sc ${sIdx} q ${qIdx}`
            )
            for (const kw of ev) {
              const cleanKw = kw.toLowerCase().replace(/[’']/g, ' ').trim()
              assert.ok(
                lowerText.includes(cleanKw),
                `Evidence keyword "${kw}" missing from built text in ${id} sc ${sIdx} q ${qIdx} seed ${seed}`
              )
            }
          }

          const strings = [inst.text]
          for (const q of inst.questions) strings.push(q[0], q[1], q[2], q[3])

          for (const rawStr of strings) {
            let str = rawStr
            for (const pn of ALLOWED_PROPER_NOUNS) {
              str = str.replaceAll(`de ${pn}`, '___DE_PN___').replaceAll(`à ${pn}`, '___A_PN___')
            }

            // 1. Contraction check: \b(à|de) (le|les)\b
            assert.ok(
              !contractionRe.test(str),
              `Forbidden contraction in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 2. de des check
            assert.ok(
              !deDesRe.test(str),
              `Forbidden "de des" in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 3. Doubled function words
            assert.ok(
              !doubledRe.test(str),
              `Doubled function word in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 4. Wrong elision
            assert.ok(
              !wrongElisionRe.test(str),
              `Wrong elision in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 5. il faut (absolument )?d[e']
            assert.ok(
              !ilFautRe.test(str),
              `Forbidden "il faut de" in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 6. Article/noun clashes from SLOT_NOUN_METADATA
            assert.ok(
              !mascClashRe.test(str),
              `Masculine slot noun clash with feminine article in ${id} sc ${sIdx}: "${rawStr}"`
            )
            assert.ok(
              !femClashRe.test(str),
              `Feminine slot noun clash with masculine article in ${id} sc ${sIdx}: "${rawStr}"`
            )

            // 7. Persona gender agreement for Cher/Chère
            for (const cm of str.matchAll(cherRe)) {
              const salutation = cm[1]
              const persona = cm[2]
              if (salutation === 'Cher') {
                assert.ok(!femPersonas.has(persona), `Gender clash: "Cher ${persona}" in ${id} sc ${sIdx}`)
              }
              if (salutation === 'Chère') {
                assert.ok(!mascPersonas.has(persona), `Gender clash: "Chère ${persona}" in ${id} sc ${sIdx}`)
              }
            }

            // 8. Missing mandatory elision with allowlist
            for (const em of str.matchAll(elisionCheckRe)) {
              const nextWord = em[2].toLowerCase()
              if (NON_ELIDING_WORDS.has(nextWord) || nextWord.startsWith('huit') || nextWord.startsWith('onze')) {
                continue
              }
              const isVowelInitial = /^[aeiouâàéèêëîïôöûùœ]/.test(nextWord)
              const isMuteH = /^h[aeiouâàéèêëîïôöûùœ]/.test(nextWord) && !NON_ELIDING_WORDS.has(nextWord)
              assert.ok(
                !isVowelInitial && !isMuteH,
                `Missing mandatory elision "${em[0]}" in ${id} sc ${sIdx}: "${rawStr}"`
              )
            }
          }
        }
      }
    }

    console.log(
      `Guard test completed successfully: ${totalScenarios} scenarios, ${totalBuilds} builds, and ${totalQuestions} questions verified across all 24 indicators.`
    )
  })
})

