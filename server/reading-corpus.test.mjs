// Tests for the offline reading-corpus pilot (scripts/reading-corpus). Pure functions only: no network.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cleanExtract,
  selectPassages,
  passageProblems,
  countWords,
  PASSAGE_MIN_WORDS,
  PASSAGE_MAX_WORDS,
} from '../scripts/reading-corpus/passages.mjs'
import {
  estimateLevel,
  computeMetrics,
  levelFromScore,
  tokenize,
  loadDefaultBasicWords,
  bandOf,
} from '../scripts/reading-corpus/level.mjs'

// Builds a paragraph of roughly `words` words from simple, self-contained French sentences.
function paragraph(words, seed = 0) {
  const sentences = [
    'La ville organise chaque année une grande fête pour les familles du quartier.',
    'Les bénévoles installent des tables près du parc et préparent des repas simples.',
    'Plusieurs commerces locaux offrent des produits frais aux visiteurs de la journée.',
    'Les enfants peuvent participer à des jeux et à des ateliers de peinture colorée.',
    'Le programme dure tout l’après-midi et se termine par un concert en plein air.',
  ]
  const out = []
  let n = 0
  let i = seed
  while (n < words) {
    const s = sentences[i % sentences.length]
    out.push(s)
    n += countWords(s)
    i++
  }
  return out.join(' ')
}

function article(...blocks) {
  return blocks.join('\n')
}

test('cleanExtract drops headers, lists and formula lines and stops at the references tail', () => {
  const extract = article(
    'Introduction courte et complète.',
    '',
    '== Histoire ==',
    '',
    'Un paragraphe d’histoire complet.',
    '* un item de liste',
    '1. un item numéroté',
    'x = y + 2 {formule}',
    '== Notes et références ==',
    'Ce texte ne doit jamais apparaître.',
  )
  const { paragraphs, droppedLines } = cleanExtract(extract)
  assert.deepEqual(paragraphs, [
    'Introduction courte et complète.',
    'Un paragraphe d’histoire complet.',
  ])
  assert.equal(droppedLines.headings, 1)
  assert.equal(droppedLines.lists, 2)
  assert.equal(droppedLines.formulas, 1)
  assert.equal(droppedLines.sectionTail, 1)
})

test('selectPassages never alters text: every paragraph is a verbatim substring, in source order', () => {
  const p1 = paragraph(120, 0)
  const p2 = paragraph(110, 2)
  const p3 = paragraph(100, 1)
  const extract = article(p1, '\n', '== Contexte ==', p2, p3, '== Voir aussi ==', 'Liste')
  const { passages } = selectPassages(extract)
  assert.ok(passages.length >= 1)
  for (const pass of passages) {
    assert.equal(pass.text, pass.paragraphs.join('\n\n'))
    for (const para of pass.paragraphs) {
      assert.ok(extract.includes(para), 'paragraph must be a substring of the extract')
    }
  }
})

test('selectPassages respects the 80-300 word bounds', () => {
  const extract = article(paragraph(150, 0), paragraph(150, 1), paragraph(150, 2), paragraph(150, 3), paragraph(40, 4))
  const { passages } = selectPassages(extract)
  assert.ok(passages.length >= 1)
  for (const pass of passages) {
    assert.ok(pass.words >= PASSAGE_MIN_WORDS, `words ${pass.words} below minimum`)
    assert.ok(pass.words <= PASSAGE_MAX_WORDS, `words ${pass.words} above maximum`)
    assert.equal(pass.words, countWords(pass.text))
  }
})

test('selectPassages returns nothing for an extract shorter than the minimum', () => {
  const { passages, paragraphCount } = selectPassages('Un texte très court.\n\nEncore une phrase.')
  assert.equal(passages.length, 0)
  assert.equal(paragraphCount, 2)
})

test('selectPassages rejects paragraphs with leftover markup', () => {
  const marked = paragraph(120, 0).replace('La ville', 'La ville[1]')
  const extract = article(marked)
  const { passages, rejected } = selectPassages(extract)
  assert.equal(passages.length, 0)
  assert.ok(rejected['leftover-markup'] >= 1)
  assert.ok(passageProblems([marked]).includes('leftover-markup'))
  assert.ok(passageProblems([paragraph(120, 0).replace('La ville', '{{modèle}} La ville')]).includes('leftover-markup'))
})

test('selectPassages rejects truncated sentences and too many numbers', () => {
  const truncated = paragraph(120, 0).replace(/\.$/, ', et la')
  assert.ok(passageProblems([truncated]).includes('truncated-end'))
  const numbers = Array.from({ length: 30 }, (_, i) => String(1000 + i)).join(' ')
  const numericPassage = `La population a atteint ${numbers} habitants selon les relevés annuels publiés par la ville.`
  const padded = [numericPassage, paragraph(90, 0)]
  assert.ok(passageProblems(padded).includes('too-many-numbers'))
})

test('selectPassages rejects passages that begin with an anaphoric or back-referencing paragraph', () => {
  const anaphoric = `Il a ensuite choisi de rester. ${paragraph(90, 0)}`
  assert.ok(passageProblems([anaphoric]).includes('anaphoric-start'))
  const backRef = `${paragraph(60, 0)} Voir le tableau ci-dessus pour les détails. ${paragraph(30, 1)}`
  assert.ok(passageProblems([backRef]).includes('back-reference'))
})

test('tokenize keeps hyphenated words and splits elisions', () => {
  assert.deepEqual(tokenize('qu’il a peut-être été'), ['qu', 'il', 'a', 'peut-être', 'été'])
})

test('estimator is deterministic', () => {
  const basic = loadDefaultBasicWords()
  const text = 'Le logement est une question importante. Lorsque les loyers augmentent, les familles cherchent un autre quartier.'
  const a = estimateLevel(text)
  const b = estimateLevel(text)
  assert.deepEqual(a, b)
  assert.deepEqual(computeMetrics(text, basic), computeMetrics(text, basic))
  assert.ok(a.estimatedLevel >= 4 && a.estimatedLevel <= 12)
})

test('estimator is monotonic on simple, medium and complex hand-made texts', () => {
  const simple = 'Le chat dort sur le lit. Il fait beau ce matin. Marie va au parc avec son chien. Ils jouent dans l’herbe. Le soleil brille et les enfants rient. Nous mangeons une pomme. C’est une bonne journée.'
  const medium = 'Lorsque la famille a déménagé à Montréal, les parents ont choisi un appartement près de l’école, parce que les enfants devaient marcher seuls chaque matin. Le loyer était élevé, mais le quartier offrait des services qui facilitaient la vie quotidienne, car les transports en commun étaient nombreux.'
  const complex = 'Bien que les autorités municipales aient annoncé plusieurs mesures visant à réduire la crise du logement, les associations de locataires estiment qu’il faudra attendre que les constructions nouvelles soient achevées pour observer une amélioration réelle. Le gouvernement avait pourtant reconnu, dès l’automne précédent, que l’accessibilité financière des ménages les plus vulnérables constituait une priorité qu’il aurait dû traiter plus tôt, tandis que plusieurs rapports indépendants avaient été publiés sans que leurs recommandations soient véritablement appliquées.'
  const s = estimateLevel(simple)
  const m = estimateLevel(medium)
  const c = estimateLevel(complex)
  assert.ok(s.score < m.score && m.score < c.score, `scores ${s.score} < ${m.score} < ${c.score}`)
  assert.ok(s.estimatedLevel <= m.estimatedLevel && m.estimatedLevel <= c.estimatedLevel)
  assert.ok(s.estimatedLevel < c.estimatedLevel)
})

test('levelFromScore is non-decreasing in the score and bands cover 4-12', () => {
  let prev = 0
  for (let s = 0; s <= 1; s += 0.01) {
    const lvl = levelFromScore(Math.round(s * 100) / 100)
    assert.ok(lvl >= prev)
    prev = lvl
  }
  assert.equal(levelFromScore(0), 4)
  assert.equal(levelFromScore(1), 12)
  assert.equal(bandOf(4), '4-6')
  assert.equal(bandOf(8), '7-8')
  assert.equal(bandOf(10), '9-10')
  assert.equal(bandOf(12), '11-12')
})
