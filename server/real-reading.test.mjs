import assert from 'node:assert/strict'
import crypto from 'node:crypto'
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

const EXPECTED_PASSAGE_SHA256 = {
  'rr-vikidia-medecin-1': 'bcb1469d85e14baa9bd029ec05e19a29e4886729287b69462ad9051527f19f5f',
  'rr-vikidia-medecin-3': '9526217d5abd5aa6a77e33ee06749951b0e2aa4025b21ada7675ba2917231d2e',
  'rr-vikidia-logement-1': '8127a092f80e9b5ea8b3875c7f5fb520c02aeb6d1cef300d59cf4c11ac384221',
  'rr-vikidia-appartement-1': '35708ea6e53f0b0517a1ca5973cda6131c126ccf91b82465be6945a20aad7037',
  'rr-vikidia-travail-1': '7c6b827485b62b80af2d94e4ebaa022384b23738fe882d9095b0ada80e4499ac',
  'rr-vikidia-ecole-1': '8529a7cac06fc702c0b530b582628b62f5ad2a173ea305bd3b177080bd226c5e',
  'rr-vikidia-transport-1': '84db2a80aaed26100f0f86cc1ae5da6634a23e46bf7260ea53eff9c0fb8b4081',
  'rr-vikidia-alimentation-3': '3142bb20a419ed75e35a81d8377797863771d1a82fd7d9e08536b1b222ba24c7',
  'rr-vikidia-pain-1': '134015b791c13f8a76ec14ee921e6d506b242164e38b15f619a51d019d31081c',
  'rr-vikidia-pain-2': '007904e5b3662776eaed62e75a39a80a124e822aadcf844d2823fbdf66dcca1b',
  'rr-vikidia-climat-1': '866fb4e9333c3cb8e24369e079a48bb00e1fbbae44bdb3078614eeb9abe1c954',
  'rr-vikidia-climat-3': 'f55644630241b72c28ee2dd62b509662f7e6fdefe5577b0998ae7f651305b5ce',
  'rr-vikidia-montreal-1': '73cd3d1d0a442085937c168637cb0e4266bdf9ec87de447f54abb5708e74b6af',
  'rr-vikidia-montreal-2': '9fa2a7464b17abf092c8559b3bdc795bbf16957b021754181d87b5b1fd5c67a6',
  'rr-vikidia-montreal-3': '96975da2da251923b82b89dda1a52ae03a3e63365dbfd482da8c794037775348',
  'rr-vikidia-noel-1': '8e63e87f7b0eee6da73667feebb95b786a1c41b8adb4995c86f9e99bc5aed7d4',
  'rr-vikidia-noel-2': '6c9e2bcd083077766bbb8c623f7190655bcd80e9a5327f50784c0c603ef0df90',
  'rr-wikipedia-sante-publique-2': 'e010fa9ae7c625ff4f46379238334cf69fda65f3cd63a175fe1eb6cbdc16f898',
  'rr-wikipedia-sante-publique-3': 'f754d6f9fbc1f1a0463f90ded78e1091b9ab61cc29e97c8c346ff377ad771aef',
  'rr-wikipedia-logement-1': '47d9e8ed6b96d078e40cb9cd3468ff84f5b32961ec3f444b9c9baf5231d6c160',
  'rr-wikipedia-logement-2': '30bc2f0073a54e1000b20f32a213c8e921ad8dd9509291ef80309e77edf2c5be',
  'rr-wikipedia-salaire-minimum-1': '571fb912c5077f39faf0f3c2c77d75fac3ba4b3543a897411b0eb1a1b611a3bb',
  'rr-wikipedia-salaire-minimum-2': 'fa21d9b51bf89886c289412777767964c70e291912be69ba45b6e9070612ebc9',
  'rr-wikipedia-salaire-minimum-3': '590b7e260db02a2769027e92b7fd06c83ab54f059b23fdeb17f0b3380916c75b',
  'rr-wikipedia-education-au-quebec-1': '41621fe639d4f54315c579c28f3b756abb237b1e47862d5cbbffc022255546ff',
  'rr-wikipedia-transport-en-commun-1': 'bd8dca1a3ddc7d6b606878f5fe93a4d22207287bb3366219993832d9964c9f4f',
  'rr-wikipedia-transport-en-commun-2': 'e40c18de498149f231691ca38ab0ea801c07bd571d262d4f2d9d8b191a7e742a',
  'rr-wikipedia-alimentation-1': 'e6200e8dc689b97e6cb5314a27f2ee0e40176568294ac8bc1746db92bad92c10',
  'rr-wikipedia-alimentation-2': 'c3e5ca8f75cbf598b761f551abc0ee87049f9f72480ab57b16e4cf3cb1b0808b',
  'rr-wikipedia-alimentation-3': '7234070dd832ba891fd03331f92fff5d5a7200ad85b9f56d0097d591e53fb2c8',
  'rr-wikipedia-changement-climatique-1': 'cbfeb6eae1b89f3ca81d5beafe01e722d32c800ea81f8746aeca56109a3eba9e',
  'rr-wikipedia-changement-climatique-2': '257430a1766abf105c95d26970f064e738f99854d6baf3b5c8d6fd0e9bd7f72b',
  'rr-wikipedia-changement-climatique-3': '70fda4d78b4c466ac08aa1b623a81f7855f04830cf9b05a622ba17c1b6de5916',
  'rr-wikipedia-assemblee-nationale-du-quebec-1': '0278bd4369d9468ab68193b5d5ec5cb366f7a6708c845039ddd8adc9dcec8160',
  'rr-wikipedia-assemblee-nationale-du-quebec-2': '8b655368bde5dfa668c9a1bc8caff2301884e17d561604d2484ada09612b4f67',
  'rr-wikipedia-parlement-du-canada-1': 'ebbad32de9dbb49a0e8b0c70e162bac498fc624be722532831e1bbf28b6c9328',
  'rr-wikipedia-parlement-du-canada-3': '7f30824da2815e36007c9e5ef3b7c45ae1c53f2d968ba82eb4acfe17acc70f0c',
  'rr-wikipedia-immigration-au-canada-1': '1432cf319fda412451783dc2256ed6d38f806c497589d38ca578822449d2a414',
  'rr-wikipedia-immigration-au-canada-2': '750ecd5531cc9f2d9d22d78f6cb4ebf0242d581e12b8d312495f79ec8e9f8383',
  'rr-wikipedia-immigration-au-canada-3': 'a6e452b946d4d8da9e88c4c37e3efbee6e673b5055f05d43277b6683fb8026ab',
  'rr-wikipedia-montreal-1': 'd70886cd846294bbc9a1cf0c99e3097be0c7977b98c2daa63ac6d2e49ab749be',
  'rr-wikipedia-montreal-2': 'f4bb70996af28d25bff29069824dbc089152b665267a3d89709ddde8c04889d4',
  'rr-wikipedia-quebec-ville-1': '2713a06899537df1436c2a988482370966bc5bc77118cd4dea4040baa2d0134d',
  'rr-wikipedia-quebec-ville-2': 'b35cee90d016b93c95913b96042e5ea9e5b2ef58ecd737f262f50d972ca23993',
  'rr-wikipedia-fete-nationale-du-quebec-1': '54347f6f582fb7cd29db7b839b9662ba7349c666bf5c2b2bab86a71ec72c3420',
  'rr-wikipedia-fete-nationale-du-quebec-2': '260a41fa6302792f95320efe7b93d20fb4e22dd914be543f8d5de9c6e457f833',
  'rr-wikipedia-fete-nationale-du-quebec-3': '620fb625266901551654a092fc9eacfb71ee4f95d65d561f6b64c716e9a9c5f0',
  'rr-wikipedia-noel-1': 'f4cc62d83b7557a3dea1317e53bd8f8d42c376328cd46233caecdbaf9c60ed61',
  'rr-wikipedia-noel-2': 'c6df56a5ea8fc0f9dbfab07809a6ff8b9d6c3ff2b43b4d447775d451016f5ae6',
}

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

  it('every passage text has byte-identical SHA256 hash matching reference origin/master hash', () => {
    for (const p of REAL_READING_PASSAGES) {
      const actualHash = crypto.createHash('sha256').update(p.text, 'utf8').digest('hex')
      const expectedHash = EXPECTED_PASSAGE_SHA256[p.id]
      assert.ok(expectedHash, `Missing expected SHA256 hash for passage ${p.id}`)
      assert.strictEqual(
        actualHash,
        expectedHash,
        `Passage text SHA256 hash mismatch in ${p.id} (${p.title}): expected ${expectedHash}, got ${actualHash}`,
      )
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

  it('enforces quality guards on options: normalized uniqueness, length balance [0.65, 1.35], no absolutist markers, and clean syntax', () => {
    function normalizeOption(s) {
      return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^(l['’]|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|d['’])/g, '')
        .replace(/[^a-z0-9]/g, '')
    }

    const absolutistRe = /\b(plus jamais|sans exception|uniquement|totalement interdit)\b/i
    const forbiddenSyntax1 = /\b(à le|à les|de des)\b/i
    const forbiddenSyntax2 = /\bde le\s+[a-zà-ÿ]/i
    const commaCapRe = /,\s+[A-ZÀ-ÖØ-ß]/

    for (const p of REAL_READING_PASSAGES) {
      for (let qi = 0; qi < p.questions.length; qi++) {
        const [prompt, correct, dist1, dist2] = p.questions[qi]
        const options = [correct, dist1, dist2]

        // 1. Normalized distinct options
        const normalized = options.map(normalizeOption)
        assert.strictEqual(
          new Set(normalized).size,
          3,
          `Normalized options duplicate in ${p.id} Q${qi}: ${JSON.stringify(normalized)} from ${JSON.stringify(options)}`,
        )

        // 2. Length balance: correct length within [0.65, 1.35] of mean distractor length
        const meanDist = (dist1.length + dist2.length) / 2
        const ratio = correct.length / meanDist
        assert.ok(
          ratio >= 0.65 && ratio <= 1.35,
          `Correct answer length ratio ${ratio.toFixed(2)} out of [0.65, 1.35] in ${p.id} Q${qi}: correct (${correct.length}) vs mean distractors (${meanDist})`,
        )

        // 3. Absolutist markers guard
        for (const str of [prompt, ...options]) {
          assert.strictEqual(
            absolutistRe.test(str),
            false,
            `Absolutist marker found in ${p.id} Q${qi}: "${str}"`,
          )
        }

        // 4. Forbidden syntax guard
        for (const str of [prompt, ...options]) {
          assert.strictEqual(
            forbiddenSyntax1.test(str),
            false,
            `Forbidden contraction in ${p.id} Q${qi}: "${str}"`,
          )
          assert.strictEqual(
            forbiddenSyntax2.test(str),
            false,
            `Forbidden "de le + noun" in ${p.id} Q${qi}: "${str}"`,
          )
          assert.strictEqual(
            commaCapRe.test(str),
            false,
            `Capital letter after comma in ${p.id} Q${qi}: "${str}"`,
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
