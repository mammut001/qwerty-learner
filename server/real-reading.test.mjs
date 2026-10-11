import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { REAL_READING_PASSAGES } from './echelle-variants/real-reading.mjs'
import {
  formatRealReadingAttribution,
  getRealReading,
  listRealReading,
  scoreRealReading,
} from './real-reading.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const pilotCorpusPath = path.join(repoRoot, 'scripts/reading-corpus/out/pilot-corpus.json')

function normalizeForNgrams(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[«»""''’`]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function hasSixGramOverlap(passageWords, optionWords) {
  if (optionWords.length < 6 || passageWords.length < 6) return false
  const passageSixGrams = new Set()
  for (let i = 0; i <= passageWords.length - 6; i++) {
    passageSixGrams.add(passageWords.slice(i, i + 6).join(' '))
  }
  for (let i = 0; i <= optionWords.length - 6; i++) {
    const candidate = optionWords.slice(i, i + 6).join(' ')
    if (passageSixGrams.has(candidate)) {
      return candidate
    }
  }
  return false
}

describe('Real Reading (真实阅读) Engine & Corpus Tests', () => {
  const pilotCorpus = JSON.parse(fs.readFileSync(pilotCorpusPath, 'utf8'))

  it('contains at least 45 kept passages (target >= 45)', () => {
    assert.ok(
      REAL_READING_PASSAGES.length >= 45,
      `Expected >= 45 passages, found ${REAL_READING_PASSAGES.length}`,
    )
  })

  it('every passage text is byte-identical to whole paragraphs of the corresponding pilot-corpus passage', () => {
    for (const p of REAL_READING_PASSAGES) {
      // Find candidate matching pilot items
      const matches = pilotCorpus.filter((x) => x.url === p.url && x.revisionId === p.revisionId)
      assert.ok(matches.length > 0, `No pilot corpus record found with url ${p.url} and rev ${p.revisionId}`)

      const match = matches.find((m) => m.text.includes(p.text))
      assert.ok(
        match,
        `Passage text for ${p.id} (${p.title}) is not a byte-identical substring of any matching pilot corpus passage`,
      )

      const pilotParas = match.text.split('\n\n')
      const keptParas = p.text.split('\n\n')
      assert.strictEqual(
        keptParas.length,
        p.paragraphsKept.length,
        `paragraphsKept length (${p.paragraphsKept.length}) does not match split length (${keptParas.length}) in ${p.id}`,
      )

      for (const kp of keptParas) {
        assert.ok(
          pilotParas.includes(kp),
          `Paragraph in ${p.id} is not an exact whole paragraph from the pilot corpus:\n${kp}`,
        )
      }
    }
  })

  it('every passage has valid licence name+URL, url, historyUrl, and a French justification', () => {
    for (const p of REAL_READING_PASSAGES) {
      assert.ok(typeof p.id === 'string' && p.id.startsWith('rr-'), `Invalid id: ${p.id}`)
      assert.ok(typeof p.title === 'string' && p.title.trim().length > 0, `Missing title in ${p.id}`)
      assert.ok(p.site === 'vikidia' || p.site === 'wikipedia', `Invalid site ${p.site} in ${p.id}`)

      assert.ok(typeof p.url === 'string' && /^https?:\/\//.test(p.url), `Invalid url in ${p.id}: ${p.url}`)
      assert.ok(
        typeof p.historyUrl === 'string' && /^https?:\/\//.test(p.historyUrl),
        `Invalid historyUrl in ${p.id}: ${p.historyUrl}`,
      )
      assert.ok(
        typeof p.licenceName === 'string' &&
          (p.licenceName.includes('Creative Commons') || p.licenceName.includes('CC BY-SA')),
        `Invalid licenceName in ${p.id}: ${p.licenceName}`,
      )
      assert.ok(
        typeof p.licenceUrl === 'string' && /^https?:\/\//.test(p.licenceUrl),
        `Invalid licenceUrl in ${p.id}: ${p.licenceUrl}`,
      )
      assert.ok(
        typeof p.justificationFr === 'string' && p.justificationFr.trim().length > 0,
        `Missing justificationFr in ${p.id}`,
      )
    }
  })

  it('all passage levels are integers within [4, 12]', () => {
    for (const p of REAL_READING_PASSAGES) {
      assert.ok(Number.isInteger(p.level), `Level must be an integer in ${p.id}: ${p.level}`)
      assert.ok(p.level >= 4 && p.level <= 12, `Level out of range [4, 12] in ${p.id}: ${p.level}`)
    }
  })

  it('every passage has exactly 3 questions with 3 distinct non-empty options each', () => {
    for (const p of REAL_READING_PASSAGES) {
      assert.strictEqual(
        p.questions.length,
        3,
        `Passage ${p.id} must have exactly 3 questions, got ${p.questions.length}`,
      )

      for (let qi = 0; qi < p.questions.length; qi++) {
        const row = p.questions[qi]
        assert.ok(Array.isArray(row) && row.length === 4, `Question row must have [prompt, correct, dist1, dist2] in ${p.id} Q${qi}`)
        const [prompt, correct, dist1, dist2] = row
        assert.ok(typeof prompt === 'string' && prompt.trim().length > 0, `Empty prompt in ${p.id} Q${qi}`)
        assert.ok(typeof correct === 'string' && correct.trim().length > 0, `Empty correct option in ${p.id} Q${qi}`)
        assert.ok(typeof dist1 === 'string' && dist1.trim().length > 0, `Empty distractor 1 in ${p.id} Q${qi}`)
        assert.ok(typeof dist2 === 'string' && dist2.trim().length > 0, `Empty distractor 2 in ${p.id} Q${qi}`)

        const choices = [correct, dist1, dist2]
        const uniqueChoices = new Set(choices)
        assert.strictEqual(
          uniqueChoices.size,
          3,
          `Question ${qi} in ${p.id} contains duplicate choices: ${JSON.stringify(choices)}`,
        )
      }
    }
  })

  it('no correct answer repeats 6+ consecutive words of the passage (paraphrase rule)', () => {
    for (const p of REAL_READING_PASSAGES) {
      const passageWords = normalizeForNgrams(p.text)

      for (let qi = 0; qi < p.questions.length; qi++) {
        const [, correctAnswer] = p.questions[qi]
        const answerWords = normalizeForNgrams(correctAnswer)
        const overlap = hasSixGramOverlap(passageWords, answerWords)
        assert.strictEqual(
          overlap,
          false,
          `Passage ${p.id} Q${qi} correct answer has 6-word verbatim overlap with passage: "${overlap}"`,
        )
      }
    }
  })

  it('option lengths within each question are well balanced (within ±40% of their mean)', () => {
    for (const p of REAL_READING_PASSAGES) {
      for (let qi = 0; qi < p.questions.length; qi++) {
        const [, c1, c2, c3] = p.questions[qi]
        const choices = [c1, c2, c3]
        const lens = choices.map((c) => c.length)
        const mean = lens.reduce((acc, n) => acc + n, 0) / lens.length
        for (let ci = 0; ci < lens.length; ci++) {
          const spread = Math.abs(lens[ci] - mean) / mean
          assert.ok(
            spread <= 0.4001,
            `Option length spread ${(spread * 100).toFixed(1)}% exceeds 40% in ${p.id} Q${qi} option ${ci}: "${choices[ci]}" (mean: ${mean})`,
          )
        }
      }
    }
  })

  it('attribution formatter produces full valid credit line with title, url, historyUrl, and licence', () => {
    for (const p of REAL_READING_PASSAGES) {
      const attr = formatRealReadingAttribution(p)
      assert.ok(attr.includes(p.title), `Attribution missing title in ${p.id}`)
      assert.ok(attr.includes(p.url), `Attribution missing url in ${p.id}`)
      assert.ok(attr.includes(p.historyUrl), `Attribution missing historyUrl in ${p.id}`)
      assert.ok(attr.includes(p.licenceName), `Attribution missing licenceName in ${p.id}`)
      assert.ok(attr.includes(p.licenceUrl), `Attribution missing licenceUrl in ${p.id}`)
      assert.ok(attr.includes('Texte reproduit sans modification.'), `Attribution missing reproduction notice in ${p.id}`)
      assert.ok(
        attr.includes('Questions © Qwerty Français, diffusées sous la même licence.'),
        `Attribution missing questions notice in ${p.id}`,
      )
    }
  })

  it('listRealReading returns metadata only without full passage text or questions', () => {
    for (let lvl = 4; lvl <= 12; lvl++) {
      const list = listRealReading(lvl)
      for (const item of list) {
        assert.strictEqual(item.level, lvl)
        assert.ok(typeof item.id === 'string')
        assert.ok(typeof item.title === 'string')
        assert.ok(typeof item.wordCount === 'number' && item.wordCount > 0)
        assert.strictEqual(item.text, undefined, `listRealReading must not leak passage text: ${item.id}`)
        assert.strictEqual(item.questions, undefined, `listRealReading must not leak questions: ${item.id}`)
      }
    }
  })

  it('getRealReading returns full passage by id, and null for unknown id', () => {
    const first = REAL_READING_PASSAGES[0]
    const fetched = getRealReading(first.id)
    assert.deepStrictEqual(fetched, first)
    assert.strictEqual(getRealReading('rr-non-existent-id'), null)
  })

  it('scoreRealReading scores full correct, partial, and full wrong answers correctly', () => {
    const passage = REAL_READING_PASSAGES[0]
    const correctAnswers = passage.questions.map((q) => q[1])

    // Full correct (by string)
    const fullRes = scoreRealReading(passage.id, correctAnswers)
    assert.strictEqual(fullRes.score, 1)
    assert.strictEqual(fullRes.correctCount, 3)
    assert.strictEqual(fullRes.totalQuestions, 3)
    assert.strictEqual(fullRes.mastered, true)
    assert.deepStrictEqual(fullRes.perQuestion, [true, true, true])

    // Full correct (by index 0 since q[1] is the correct answer index 0 in raw options)
    const fullResByIndices = scoreRealReading(passage.id, [0, 0, 0])
    assert.strictEqual(fullResByIndices.score, 1)
    assert.strictEqual(fullResByIndices.correctCount, 3)
    assert.strictEqual(fullResByIndices.mastered, true)

    // Partial (first correct, others wrong)
    const partialAnswers = [
      correctAnswers[0],
      passage.questions[1][2],
      passage.questions[2][3],
    ]
    const partialRes = scoreRealReading(passage.id, partialAnswers)
    assert.strictEqual(partialRes.score, 1 / 3)
    assert.strictEqual(partialRes.correctCount, 1)
    assert.strictEqual(partialRes.totalQuestions, 3)
    assert.strictEqual(partialRes.mastered, false)
    assert.deepStrictEqual(partialRes.perQuestion, [true, false, false])

    // Full wrong
    const wrongAnswers = [
      passage.questions[0][2],
      passage.questions[1][2],
      passage.questions[2][2],
    ]
    const wrongRes = scoreRealReading(passage.id, wrongAnswers)
    assert.strictEqual(wrongRes.score, 0)
    assert.strictEqual(wrongRes.correctCount, 0)
    assert.strictEqual(wrongRes.totalQuestions, 3)
    assert.strictEqual(wrongRes.mastered, false)
    assert.deepStrictEqual(wrongRes.perQuestion, [false, false, false])

    // Non-existent passage
    const nullRes = scoreRealReading('unknown-passage-id', [0, 1, 2])
    assert.strictEqual(nullRes, null)
  })

  it('regression guard: real reading modules are not statically imported by main app entry points', () => {
    const entryFiles = [
      path.join(repoRoot, 'src/index.tsx'),
      path.join(repoRoot, 'src/App.tsx'),
      path.join(repoRoot, 'src/resources/echelleCurriculum.ts'),
      path.join(repoRoot, 'server/echelle-curriculum-core.mjs'),
    ]

    for (const file of entryFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8')
        assert.ok(
          !content.includes('real-reading') && !content.includes('REAL_READING'),
          `File ${path.relative(repoRoot, file)} contains unexpected static reference to real-reading`,
        )
      }
    }
  })
})
