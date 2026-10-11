import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  ECHELLE_ITEM_CATALOG,
  ECHELLE_LEVEL_ITEMS,
  countEchelleItemVariants,
  getEchelleItemVariant,
  reshuffleItemChoices,
  scoreEchelleItem,
} from './echelle-curriculum.mjs'
import { LEXIQUE_TOPICS } from './echelle-lexique-bank.mjs'
import { N01_02_SCENARIOS } from './echelle-variants/n01-02.mjs'
import { PERSONAS, numberToFrench } from './echelle-variants/shared.mjs'
import { apply, emptyLearningProgress, normalizeState } from './study-model.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const baseState = (echelleItems = {}) =>
  normalizeState({
    startDate: '2025-01-01',
    minutes: {},
    minimumMode: {},
    learning: { ...emptyLearningProgress(), echelle: { items: echelleItems } },
    syncMeta: {
      startDateUpdatedAt: 0,
      settingsUpdatedAt: 0,
      minimumModeUpdatedAt: {},
      minutesUpdatedAt: {},
      grammarDraftUpdatedAt: 0,
    },
  })

const getN12QuizItems = () =>
  [...ECHELLE_LEVEL_ITEMS[1], ...ECHELLE_LEVEL_ITEMS[2]].filter((id) => !id.includes('production'))

describe('Échelle item variant engine', () => {
  it('variant 0 or undefined equals catalog item for every item id; scoring without variant is unchanged', () => {
    for (const [id, catalogItem] of Object.entries(ECHELLE_ITEM_CATALOG)) {
      const v0 = getEchelleItemVariant(id, 0)
      const vUndefined = getEchelleItemVariant(id)
      assert.deepStrictEqual(v0, catalogItem, `Variant 0 differs from catalog for item ${id}`)
      assert.deepStrictEqual(vUndefined, catalogItem, `Variant undefined differs from catalog for item ${id}`)

      if (catalogItem.kind !== 'production') {
        const correctAnswers = catalogItem.questions.map((q) => q.answer)
        const scoreNoVariant = scoreEchelleItem(id, correctAnswers)
        const scoreMetaEmpty = scoreEchelleItem(id, correctAnswers, {})
        const scoreMetaZero = scoreEchelleItem(id, correctAnswers, { variant: 0 })

        assert.deepStrictEqual(scoreNoVariant, scoreMetaEmpty)
        assert.deepStrictEqual(scoreNoVariant, scoreMetaZero)
        assert.strictEqual(scoreNoVariant.mastered, true)
        assert.strictEqual(scoreNoVariant.score, 1)
      }
    }
  })

  it('is deterministic, has distinct choices with answers, audioText matches text, and no unresolved slot markers across 200 seeds for all N1-N2 quiz items', () => {
    const quizItems = getN12QuizItems()
    assert.strictEqual(quizItems.length, 43)

    for (const itemId of quizItems) {
      assert.ok(countEchelleItemVariants(itemId) > 1, `Expected > 1 variants for ${itemId}`)

      for (let seed = 1; seed <= 200; seed++) {
        const v1 = getEchelleItemVariant(itemId, seed)
        const v2 = getEchelleItemVariant(itemId, seed)

        assert.deepStrictEqual(v1, v2, `Non-deterministic output for ${itemId} with seed ${seed}`)
        assert.strictEqual(v1.variant, seed)

        if (v1.text) {
          assert.strictEqual(v1.text.includes('undefined'), false, `Unresolved undefined in ${itemId} seed ${seed}: ${v1.text}`)
          assert.strictEqual(v1.text.includes('NaN'), false, `Unresolved NaN in ${itemId} seed ${seed}: ${v1.text}`)
          assert.strictEqual(/\$\{[^}]+\}/.test(v1.text), false, `Unresolved template token in ${itemId} seed ${seed}: ${v1.text}`)
        }

        if (v1.skill === 'listening') {
          assert.strictEqual(v1.audioText, v1.text, `audioText does not match text in listening item ${itemId} seed ${seed}`)
        }

        assert.ok(Array.isArray(v1.questions) && v1.questions.length > 0)
        for (const q of v1.questions) {
          assert.strictEqual(new Set(q.choices).size, q.choices.length, `Duplicate choices in ${itemId} seed ${seed}: ${q.choices.join(', ')}`)
          assert.ok(q.choices.includes(q.answer), `Answer "${q.answer}" not in choices for ${itemId} seed ${seed}: ${q.choices.join(', ')}`)
          assert.strictEqual(q.prompt.includes('undefined'), false, `Unresolved undefined in prompt of ${itemId} seed ${seed}: ${q.prompt}`)
        }
      }
    }
  })

  it('every N1-N2 listening and reading indicator has ≥ 5 scenarios and represents both situation 0 and 1', () => {
    const indicatorItems = getN12QuizItems().filter((id) => id.includes('listening') || id.includes('reading'))
    assert.strictEqual(indicatorItems.length, 24)

    for (const itemId of indicatorItems) {
      const scenarios = N01_02_SCENARIOS[itemId]
      assert.ok(Array.isArray(scenarios), `Missing scenarios for ${itemId}`)
      assert.ok(scenarios.length >= 5, `Expected ≥ 5 scenarios for ${itemId}, got ${scenarios.length}`)

      const situations = new Set(scenarios.map((s) => s.situation))
      assert.ok(situations.has(0), `Missing situation 0 in ${itemId}`)
      assert.ok(situations.has(1), `Missing situation 1 in ${itemId}`)
    }
  })

  it('yields ≥ 60 distinct texts and non-constant answer positions across 400 seeds for every N1-N2 listening and reading indicator', () => {
    const indicatorItems = getN12QuizItems().filter((id) => id.includes('listening') || id.includes('reading'))
    assert.strictEqual(indicatorItems.length, 24)

    for (const itemId of indicatorItems) {
      const texts = new Set()
      const answerPositions = new Set()

      for (let seed = 1; seed <= 400; seed++) {
        const v = getEchelleItemVariant(itemId, seed)
        texts.add(v.text)
        for (const q of v.questions) {
          answerPositions.add(q.choices.indexOf(q.answer))
        }
      }

      assert.ok(
        texts.size >= 60,
        `Expected ≥ 60 distinct texts for indicator ${itemId}, got ${texts.size}`,
      )
      assert.ok(
        answerPositions.size > 1,
        `Answer position is constant for indicator ${itemId}: only seen indices ${[...answerPositions].join(', ')}`,
      )
    }
  })

  it('passes French agreement, contraction, capitalization, and Chinese choice regressions across 400 seeds for all N1-N2 quiz items', () => {
    const quizItems = getN12QuizItems()
    const maleNames = PERSONAS.filter((p) => p.gender === 'm').map((p) => p.name)
    const chereMaleRegex = new RegExp(`\\bChère\\s+(${maleNames.join('|')})\\b`)
    const contractionRegex = /\b(du pâtes|de le\b|à le\b|de les\b|à les\b)/i
    const ABBRS = ['app.', 'boul.', 'av.', 'tél.', 'p. ex.', 'M.', 'Mme.', 'Mlle.', 'ch.', 'bur.', 'no.', 'nº.', 'approx.', 'min.', 'etc.']
    const ALLOWED_PROPER_NOUNS = new Set(['INTERAC', 'RAMQ', 'STM', 'A', 'B', 'C', 'D', 'B-12', 'A-20', 'NIP', 'RDV', 'IGA', 'HQ', 'WIFI', 'GPS', 'SIN', 'NAS'])

    for (const itemId of quizItems) {
      for (let seed = 1; seed <= 400; seed++) {
        const v = getEchelleItemVariant(itemId, seed)
        if (v.text) {
          assert.strictEqual(
            chereMaleRegex.test(v.text),
            false,
            `Found "Chère <MaleName>" agreement error in ${itemId} seed ${seed}: ${v.text}`,
          )
          assert.strictEqual(
            contractionRegex.test(v.text),
            false,
            `Found contraction error in ${itemId} seed ${seed}: ${v.text}`,
          )

          // Capitalization after full stop
          const fullStopMatches = [...v.text.matchAll(/(?:(\S+)\s+)?(\S+)\.\s+([a-zàâçéèêëîïôûùüÿœ])/g)]
          for (const m of fullStopMatches) {
            const preceding = (m[1] ? m[1] + ' ' : '') + m[2] + '.'
            const endsWithAbbr = ABBRS.some((a) => preceding.toLowerCase().endsWith(a.toLowerCase()))
            assert.ok(
              endsWithAbbr,
              `Found lowercase after full stop in ${itemId} seed ${seed}: "${m[0]}" in "${v.text}"`,
            )
          }
        }

        // Chinese-only answer options must not contain Latin letters except allow-listed proper nouns
        for (const q of v.questions) {
          for (const choice of q.choices) {
            if (/[\u4e00-\u9fa5]/.test(choice)) {
              const latinWords = choice.match(/[a-zA-ZÀ-ÿ]+/g) || []
              for (const w of latinWords) {
                assert.ok(
                  ALLOWED_PROPER_NOUNS.has(w.toUpperCase()),
                  `Unexpected Latin word "${w}" in Chinese option "${choice}" in ${itemId} seed ${seed}`,
                )
              }
            }
          }
        }
      }
    }
  })

  it('correctly converts numbers 0–9999 to French words with correct hyphens and plural rules', () => {
    const KNOWN_SPELLINGS = [
      [0, 'zéro'],
      [1, 'un'],
      [16, 'seize'],
      [20, 'vingt'],
      [21, 'vingt et un'],
      [35, 'trente-cinq'],
      [50, 'cinquante'],
      [60, 'soixante'],
      [70, 'soixante-dix'],
      [71, 'soixante et onze'],
      [75, 'soixante-quinze'],
      [80, 'quatre-vingts'],
      [81, 'quatre-vingt-un'],
      [89, 'quatre-vingt-neuf'],
      [90, 'quatre-vingt-dix'],
      [91, 'quatre-vingt-onze'],
      [99, 'quatre-vingt-dix-neuf'],
      [100, 'cent'],
      [101, 'cent un'],
      [200, 'deux cents'],
      [203, 'deux cent trois'],
      [280, 'deux cent quatre-vingts'],
      [500, 'cinq cents'],
      [999, 'neuf cent quatre-vingt-dix-neuf'],
      [1000, 'mille'],
      [1001, 'mille un'],
      [1200, 'mille deux cents'],
      [1205, 'mille deux cent cinq'],
      [2000, 'deux mille'],
      [2500, 'deux mille cinq cents'],
      [3080, 'trois mille quatre-vingts'],
      [8000, 'huit mille'],
    ]

    for (const [n, expected] of KNOWN_SPELLINGS) {
      assert.strictEqual(numberToFrench(n), expected, `Mismatch for number ${n}`)
    }
  })

  it('items without scenarios reshuffle choices and set variant for non-zero seeds while count remains 1 and variant 0 equals catalog', () => {
    // If any real quiz item currently lacks extra variants (count === 1), test getEchelleItemVariant on it
    const candidateId = Object.keys(ECHELLE_ITEM_CATALOG).find(
      (id) => ECHELLE_ITEM_CATALOG[id].kind !== 'production' && countEchelleItemVariants(id) === 1
    )
    if (candidateId) {
      const catalogItem = ECHELLE_ITEM_CATALOG[candidateId]
      assert.strictEqual(countEchelleItemVariants(candidateId), 1)

      const v0 = getEchelleItemVariant(candidateId, 0)
      assert.deepStrictEqual(v0, catalogItem)

      const seenPositions = new Set()
      for (let seed = 1; seed <= 20; seed++) {
        const v = getEchelleItemVariant(candidateId, seed)
        assert.strictEqual(v.variant, seed)
        assert.strictEqual(v.text, catalogItem.text)
        assert.strictEqual(v.questions.length, catalogItem.questions.length)
        for (let i = 0; i < v.questions.length; i++) {
          assert.strictEqual(v.questions[i].prompt, catalogItem.questions[i].prompt)
          assert.strictEqual(v.questions[i].answer, catalogItem.questions[i].answer)
          assert.strictEqual(new Set(v.questions[i].choices).size, catalogItem.questions[i].choices.length)
          if (i === 0) {
            seenPositions.add(v.questions[i].choices.indexOf(v.questions[i].answer))
          }
        }
      }
      if (catalogItem.questions?.[0]?.choices?.length > 1) {
        assert.ok(seenPositions.size > 1, `Answer positions were not reshuffled across seeds: seen ${[...seenPositions]}`)
      }
    }

    // Always cover the no-scenario reshuffle code path with a synthetic item via the exported helper
    const syntheticItem = {
      id: 'synthetic-no-scenario-item',
      kind: 'indicator',
      skill: 'listening',
      text: 'Texte d’écoute synthétique sans scénarios.',
      questions: [
        {
          prompt: 'Quel est le sujet ?',
          answer: 'Bonne réponse',
          choices: ['Bonne réponse', 'Choix B', 'Choix C', 'Choix D'],
        },
      ],
    }

    const seenPositions = new Set()
    for (let seed = 1; seed <= 20; seed++) {
      const v = reshuffleItemChoices(syntheticItem, seed)
      assert.strictEqual(v.variant, seed)
      assert.strictEqual(v.text, syntheticItem.text)
      assert.strictEqual(v.questions.length, syntheticItem.questions.length)
      assert.strictEqual(v.questions[0].prompt, syntheticItem.questions[0].prompt)
      assert.strictEqual(v.questions[0].answer, syntheticItem.questions[0].answer)
      assert.strictEqual(new Set(v.questions[0].choices).size, 4)
      seenPositions.add(v.questions[0].choices.indexOf(v.questions[0].answer))
    }
    assert.ok(seenPositions.size > 1, `Answer positions were not reshuffled across seeds for synthetic item: seen ${[...seenPositions]}`)
  })

  it('tests every word in the topic at least once across 300 seeds for every N1-N2 lexique topic', () => {
    const lexiqueItems = getN12QuizItems().filter((id) => id.includes('lex-'))
    assert.strictEqual(lexiqueItems.length, 12)

    for (const itemId of lexiqueItems) {
      const topicId = itemId.replace(/^n\d+-lex-/, '')
      const topic = LEXIQUE_TOPICS.find((t) => t.id === topicId)
      assert.ok(topic, `Topic not found for ${topicId}`)
      assert.ok(topic.words.length >= 12, `Topic ${topicId} has fewer than 12 words: ${topic.words.length}`)

      const testedWords = new Set()
      for (let seed = 1; seed <= 300; seed++) {
        const item = getEchelleItemVariant(itemId, seed)
        assert.strictEqual(item.questions.length, 4)

        for (const q of item.questions) {
          for (const [fr, zh] of topic.words) {
            if (q.prompt.includes(fr) || q.prompt.includes(zh) || q.answer === fr || q.answer === zh) {
              testedWords.add(fr)
            }
          }
        }
      }

      assert.strictEqual(
        testedWords.size,
        topic.words.length,
        `Not all words reached for topic ${topicId}: reached ${testedWords.size} / ${topic.words.length}`,
      )
    }
  })

  it('scores correctly with non-zero meta.variant', () => {
    const itemId = 'n1-listening-0'
    const catalogItem = ECHELLE_ITEM_CATALOG[itemId]
    const v0Answers = catalogItem.questions.map((q) => q.answer)

    // Find a variant whose answers differ from variant 0
    let variantWithDiffAnswers = null
    for (let s = 1; s <= 50; s++) {
      const v = getEchelleItemVariant(itemId, s)
      const answers = v.questions.map((q) => q.answer)
      if (answers.some((ans, i) => ans !== v0Answers[i])) {
        variantWithDiffAnswers = { seed: s, answers }
        break
      }
    }
    assert.ok(variantWithDiffAnswers, 'Could not find variant with distinct answers')

    const { seed, answers: variantAnswers } = variantWithDiffAnswers

    // Scoring with the variant's own answers and matching meta.variant succeeds
    const variantScore = scoreEchelleItem(itemId, variantAnswers, { variant: seed })
    assert.strictEqual(variantScore.mastered, true)
    assert.strictEqual(variantScore.score, 1)

    // Scoring the same submission against variant 0 fails because answers differ
    const v0Score = scoreEchelleItem(itemId, variantAnswers)
    assert.strictEqual(v0Score.mastered, false)
    assert.ok(v0Score.score < 1)
  })

  it('study-model apply handles valid, invalid, and absent variants correctly', () => {
    let state = baseState()
    const itemId = 'n1-listening-0'
    const v42 = getEchelleItemVariant(itemId, 42)
    const v42Answers = v42.questions.map((q) => q.answer)

    // Valid non-zero variant records mastery and stores variant on item record
    state = apply(state, [
      {
        kind: 'echelleCheck',
        itemId,
        answers: v42Answers,
        variant: 42,
        updatedAt: 1000,
      },
    ])

    const stored42 = state.learning.echelle.items[itemId]
    assert.ok(stored42)
    assert.strictEqual(stored42.mastered, true)
    assert.strictEqual(stored42.variant, 42)
    assert.strictEqual(stored42.attempts, 1)

    // Absent variant records mastery against catalog item and does not store variant
    const itemId2 = 'n1-listening-1'
    const v0Answers2 = ECHELLE_ITEM_CATALOG[itemId2].questions.map((q) => q.answer)
    state = apply(state, [
      {
        kind: 'echelleCheck',
        itemId: itemId2,
        answers: v0Answers2,
        updatedAt: 2000,
      },
    ])

    const stored0 = state.learning.echelle.items[itemId2]
    assert.ok(stored0)
    assert.strictEqual(stored0.mastered, true)
    assert.strictEqual(stored0.variant, undefined)

    // Invalid variants must throw Invalid operation
    const invalidVariants = [-1, -100, 1.5, 0x80000000, '42', 'abc', null, {}, []]
    for (const badVariant of invalidVariants) {
      assert.throws(
        () => {
          apply(state, [
            {
              kind: 'echelleCheck',
              itemId,
              answers: v42Answers,
              variant: badVariant,
              updatedAt: 3000,
            },
          ])
        },
        /Invalid operation/,
        `Expected rejection for invalid variant ${badVariant}`,
      )
    }
  })

  it('satisfies second review round French rules across 600 seeds for all N1-N2 listening and reading indicators', () => {
    const indicatorItems = getN12QuizItems().filter((id) => id.includes('listening') || id.includes('reading'))
    assert.strictEqual(indicatorItems.length, 24)

    const elisionRegex = /\b(de|que|le|la|je|ne|me|te|se)\s+([aeiouyéèêàâîôûAEIOUYÉÈÊÀÂÎÔÛ]\S*)/g
    const merciRegex = /merci[^.!?]*\bpour (avoir|être)\b/i
    const pluralAgreementRegex = /\b(Les|Des) \S+ (se trouve|est situé|est)\b/
    const instGenderRegex = /\bde la (Service|Centre|CPE|CLSC)\b|\b[Àà] la (CPE|CLSC|Service|Centre)\b/
    const weatherDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    const futurN1Regex = /\b(aura|auront|sera|seront|ira|iront)\b/

    const ELISION_ALLOW_LIST = new Set([
      'onze', 'onzième', 'oui', 'yaourt', 'yoga', 'youssef',
      'huit', 'huitième', 'hockey', 'halte', 'hall',
    ])

    for (const itemId of indicatorItems) {
      for (let seed = 1; seed <= 600; seed++) {
        const v = getEchelleItemVariant(itemId, seed)
        const texts = [v.text]
        if (v.questions) {
          for (const q of v.questions) {
            texts.push(q.prompt)
            if (q.choices) texts.push(...q.choices)
          }
        }

        for (const text of texts) {
          if (!text) continue

          let m
          while ((m = elisionRegex.exec(text)) !== null) {
            if (m.index > 0 && /[a-zA-ZàâäéèêëîïôöùûüÿœçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸŒÇ]/.test(text[m.index - 1])) {
              continue
            }
            const cleanWord = m[2].toLowerCase().replace(/[^a-zàâçéèêëîïôöùûüÿœ]/g, '')
            if (ELISION_ALLOW_LIST.has(cleanWord)) {
              continue
            }
            assert.fail(`Elision error in ${itemId} seed ${seed}: "${m[0]}" in "${text}"`)
          }

          assert.strictEqual(
            merciRegex.test(text),
            false,
            `"merci pour avoir/être" error in ${itemId} seed ${seed}: "${text}"`,
          )

          assert.strictEqual(
            pluralAgreementRegex.test(text),
            false,
            `Plural agreement error in ${itemId} seed ${seed}: "${text}"`,
          )

          assert.strictEqual(
            instGenderRegex.test(text),
            false,
            `Institution gender error in ${itemId} seed ${seed}: "${text}"`,
          )

          if (itemId.startsWith('n1-')) {
            assert.strictEqual(
              futurN1Regex.test(text),
              false,
              `Futur simple found in Niveau 1 item ${itemId} seed ${seed}: "${text}"`,
            )
          }
        }

        if (v.text && (v.text.includes('☀️') || v.text.includes('🌧️') || v.text.includes('❄️') || v.text.includes('🌬️'))) {
          const lowerText = v.text.toLowerCase()
          for (const day of weatherDays) {
            const dayMatches = lowerText.match(new RegExp(`\\b${day}\\b`, 'g')) || []
            assert.ok(
              dayMatches.length <= 1,
              `Day "${day}" appears multiple times in weather strip for ${itemId} seed ${seed}: "${v.text}"`,
            )
          }
        }
      }
    }
  })

  it('server/echelle-curriculum core does not statically import any echelle-variants/n*.mjs file', () => {
    const corePath = join(__dirname, 'echelle-curriculum-core.mjs')
    const coreSource = readFileSync(corePath, 'utf8')

    // Must not statically import any echelle-variants scenario file
    const staticVariantImport = /import\s+.*from\s+['"].*echelle-variants(\/.*)?['"]/
    assert.strictEqual(
      staticVariantImport.test(coreSource),
      false,
      'server/echelle-curriculum-core.mjs must not statically import echelle-variants modules',
    )

    // Check that client resource imports echelle-curriculum-core.mjs and not the eager server entry
    const clientResourcePath = join(__dirname, '../src/resources/echelleCurriculum.ts')
    const clientResourceSource = readFileSync(clientResourcePath, 'utf8')
    assert.ok(
      clientResourceSource.includes('echelle-curriculum-core.mjs'),
      'src/resources/echelleCurriculum.ts must import echelle-curriculum-core.mjs',
    )
    assert.strictEqual(
      clientResourceSource.includes("from '../../server/echelle-curriculum.mjs'"),
      false,
      'src/resources/echelleCurriculum.ts must not import eager server/echelle-curriculum.mjs',
    )
  })

  it('echelleBatchLoader: retries failed loads and fails loudly on missing export in dev', async () => {
    const {
      ensureLevelBatchLoaded,
      isLevelBatchLoaded,
      setBatchLoaderForTest,
      resetBatchLoaderStateForTest,
      BATCH_EXPORT_NAMES,
    } = await import('../src/resources/echelleBatchLoader.ts')

    try {
      resetBatchLoaderStateForTest()
      let callCount = 0
      const flakyLoader = async () => {
        callCount++
        if (callCount === 1) {
          throw new Error('transient network failure')
        }
        return { [BATCH_EXPORT_NAMES['n01-02']]: {} }
      }

      setBatchLoaderForTest('n01-02', flakyLoader)

      // First call fails
      const firstRes = await ensureLevelBatchLoaded(1)
      assert.strictEqual(firstRes, false)
      assert.strictEqual(isLevelBatchLoaded(1), false, 'Failed load must not be cached as loaded')

      // Second call succeeds
      const secondRes = await ensureLevelBatchLoaded(1)
      assert.strictEqual(secondRes, true)
      assert.strictEqual(isLevelBatchLoaded(1), true, 'Retry must succeed and be cached')
      assert.strictEqual(callCount, 2)

      // Missing export in dev fails loudly (throws)
      resetBatchLoaderStateForTest()
      const badLoader = async () => ({ WRONG_EXPORT: {} })
      setBatchLoaderForTest('n01-02', badLoader)
      await assert.rejects(
        () => ensureLevelBatchLoaded(1),
        /Missing export "N01_02_SCENARIOS" in batch "n01-02"/,
      )
    } finally {
      resetBatchLoaderStateForTest()
    }
  })

  it('recordEchelleMastery reconciles memory correctly when scored before batch was registered', async () => {
    if (!globalThis.localStorage) {
      const mem = {}
      globalThis.localStorage = {
        getItem: (k) => mem[k] ?? null,
        setItem: (k, v) => {
          mem[k] = String(v)
        },
        removeItem: (k) => {
          delete mem[k]
        },
        clear: () => {
          for (const k in mem) delete mem[k]
        },
      }
    }
    if (!globalThis.window) {
      globalThis.window = new EventTarget()
    }

    const { recordEchelleMastery, getLastEchelleReconcilePromise, resetStudyPlanSyncForTest } = await import(
      '../src/services/studyPlanSync.ts'
    )
    const { getEchelleItemVariant, registerIndicatorScenarios, SCENARIO_REGISTRY } = await import(
      '../server/echelle-curriculum-core.mjs'
    )
    const { resetBatchLoaderStateForTest, setBatchLoaderForTest } = await import(
      '../src/resources/echelleBatchLoader.ts'
    )

    const itemId = 'n1-listening-0'
    const variant = 1

    const { N01_02_SCENARIOS } = await import('./echelle-variants/n01-02.mjs')
    registerIndicatorScenarios(N01_02_SCENARIOS)
    const variantItem = getEchelleItemVariant(itemId, variant)
    assert.ok(variantItem)
    const passingAnswers = variantItem.questions.map((q) => q.answer)
    const failingAnswers = variantItem.questions.map((q, i) =>
      i === 0 ? q.choices.find((c) => c !== q.answer) : q.answer,
    )

    const realNow = Date.now
    const fixedNow = 1770000000000
    Date.now = () => fixedNow

    const realFetch = globalThis.fetch
    globalThis.fetch = async () => {
      throw new Error('offline')
    }

    try {
      const testAnswerSet = async (answers, label) => {
        // 1. Baseline: batch registered from the start
        localStorage.clear()
        resetStudyPlanSyncForTest()
        resetBatchLoaderStateForTest()
        registerIndicatorScenarios(N01_02_SCENARIOS)
        recordEchelleMastery({ itemId, answers, variant })
        const cachedBaseline = JSON.parse(localStorage.getItem('qwerty-fr-study-plan-v1'))
        const baselineRecord = cachedBaseline.learning.echelle.items[itemId]

        // 2. Test: batch NOT registered at time of scoring, then registered and reconciled
        localStorage.clear()
        resetStudyPlanSyncForTest()
        resetBatchLoaderStateForTest()
        delete SCENARIO_REGISTRY[itemId]

        setBatchLoaderForTest('n01-02', async () => {
          return { N01_02_SCENARIOS }
        })

        recordEchelleMastery({ itemId, answers, variant })
        const reconcilePromise = getLastEchelleReconcilePromise()
        assert.ok(reconcilePromise, 'Reconcile promise must be started')
        await reconcilePromise

        const cachedReconciled = JSON.parse(localStorage.getItem('qwerty-fr-study-plan-v1'))
        const reconciledRecord = cachedReconciled.learning.echelle.items[itemId]

        assert.deepStrictEqual(
          reconciledRecord,
          baselineRecord,
          `Reconciled record for ${label} must be deep-equal to baseline record obtained with pre-registered batch`,
        )
        assert.strictEqual(reconciledRecord.attempts, 1, 'Attempts must be counted exactly once')
      }

      await testAnswerSet(passingAnswers, 'passing')
      await testAnswerSet(failingAnswers, 'failing')
    } finally {
      Date.now = realNow
      globalThis.fetch = realFetch
      resetStudyPlanSyncForTest()
      registerIndicatorScenarios(N01_02_SCENARIOS)
      resetBatchLoaderStateForTest()
    }
  })
})
