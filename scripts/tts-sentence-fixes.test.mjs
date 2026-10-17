import { TTS_SENTENCE_FIX_RULES, applyTtsSentenceFixes } from '../src/utils/ttsSentenceFixes.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'

test('applyTtsSentenceFixes satisfies all required prompt examples', () => {
  assert.equal(applyTtsSentenceFixes('s’épanouir'), 'sépanouir')
  assert.equal(applyTtsSentenceFixes('l’école'), 'lécole')
  assert.equal(applyTtsSentenceFixes('qu’il'), 'quil')
  assert.equal(applyTtsSentenceFixes('jusqu’à'), 'jusquà')
  assert.equal(applyTtsSentenceFixes('L’Ontario'), 'LOntario')
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')
  assert.equal(applyTtsSentenceFixes('Je réévalue'), 'Je ré-évalue')
})

test('applyTtsSentenceFixes joins all elided forms before vowels and h', () => {
  // l
  assert.equal(applyTtsSentenceFixes("l'école"), 'lécole')
  assert.equal(applyTtsSentenceFixes('L’école'), 'Lécole')
  assert.equal(applyTtsSentenceFixes("l'histoire"), 'lhistoire')
  assert.equal(applyTtsSentenceFixes("l'hôpital"), 'lhôpital')

  // d
  assert.equal(applyTtsSentenceFixes("d'accord"), 'daccord')
  assert.equal(applyTtsSentenceFixes('D’ailleurs'), 'Dailleurs')
  assert.equal(applyTtsSentenceFixes("d'hiver"), 'dhiver')
  assert.equal(applyTtsSentenceFixes("d'eau"), 'deau')

  // j
  assert.equal(applyTtsSentenceFixes("j'ai"), 'jai')
  assert.equal(applyTtsSentenceFixes('J’ai'), 'Jai')
  assert.equal(applyTtsSentenceFixes("j'adore"), 'jadore')

  // m
  assert.equal(applyTtsSentenceFixes("m'a"), 'ma')
  assert.equal(applyTtsSentenceFixes('m’inquiète'), 'minquiète')

  // n
  assert.equal(applyTtsSentenceFixes("n'est"), 'nest')
  assert.equal(applyTtsSentenceFixes('n’y'), 'ny')

  // s
  assert.equal(applyTtsSentenceFixes('s’épanouir'), 'sépanouir')
  assert.equal(applyTtsSentenceFixes("s'il"), 'sil')
  assert.equal(applyTtsSentenceFixes('s’adapter'), 'sadapter')
  assert.equal(applyTtsSentenceFixes('s’habiller'), 'shabiller')

  // t
  assert.equal(applyTtsSentenceFixes("t'a"), 'ta')
  assert.equal(applyTtsSentenceFixes('t’y'), 'ty')

  // c
  assert.equal(applyTtsSentenceFixes("c'est"), 'cest')
  assert.equal(applyTtsSentenceFixes('C’est'), 'Cest')
  assert.equal(applyTtsSentenceFixes("c'était"), 'cétait')

  // qu
  assert.equal(applyTtsSentenceFixes("qu'il"), 'quil')
  assert.equal(applyTtsSentenceFixes('qu’on'), 'quon')
  assert.equal(applyTtsSentenceFixes('QU’ILS'), 'QUILS')

  // jusqu
  assert.equal(applyTtsSentenceFixes("jusqu'à"), 'jusquà')
  assert.equal(applyTtsSentenceFixes('jusqu’au'), 'jusquau')
  assert.equal(applyTtsSentenceFixes("jusqu'ici"), 'jusquici')

  // lorsqu
  assert.equal(applyTtsSentenceFixes("lorsqu'il"), 'lorsquil')
  assert.equal(applyTtsSentenceFixes('Lorsqu’on'), 'Lorsquon')

  // puisqu
  assert.equal(applyTtsSentenceFixes("puisqu'il"), 'puisquil')
  assert.equal(applyTtsSentenceFixes('Puisqu’elle'), 'Puisquelle')

  // quoiqu
  assert.equal(applyTtsSentenceFixes("quoiqu'il"), 'quoiquil')
  assert.equal(applyTtsSentenceFixes('quoiqu’en'), 'quoiquen')

  // presqu
  assert.equal(applyTtsSentenceFixes("presqu'île"), 'presquîle')
  assert.equal(applyTtsSentenceFixes('Presqu’île'), 'Presquîle')

  // aujourd'hui
  assert.equal(applyTtsSentenceFixes("aujourd'hui"), 'aujourdhui')
  assert.equal(applyTtsSentenceFixes('Aujourd’hui'), 'Aujourdhui')
})

test('applyTtsSentenceFixes preserves non-elision apostrophes and unrelated words', () => {
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')
  assert.equal(applyTtsSentenceFixes("'Bonjour'"), "'Bonjour'")
  assert.equal(applyTtsSentenceFixes('"Bonjour"'), '"Bonjour"')
  assert.equal(applyTtsSentenceFixes("don't"), "don't")
  assert.equal(applyTtsSentenceFixes("it's"), "it's")
  assert.equal(applyTtsSentenceFixes('un cadre préétabli'), 'un cadre préétabli')
  assert.equal(applyTtsSentenceFixes('rééquilibrage'), 'rééquilibrage')
  assert.equal(applyTtsSentenceFixes('réédition'), 'réédition')
})

test('applyTtsSentenceFixes preserves combos like l’réévaluation and applies both rules', () => {
  assert.equal(applyTtsSentenceFixes("l'réévaluation"), "l'ré-évaluation")
  assert.equal(applyTtsSentenceFixes('l’réévaluation'), 'l’ré-évaluation')
  assert.equal(applyTtsSentenceFixes("qu'on réévalue"), 'quon ré-évalue')
  assert.equal(applyTtsSentenceFixes('d’une réévaluation'), 'dune ré-évaluation')
})

test('applyTtsSentenceFixes handles empty or non-string inputs safely', () => {
  assert.equal(applyTtsSentenceFixes(''), '')
  assert.equal(applyTtsSentenceFixes(null), '')
  assert.equal(applyTtsSentenceFixes(undefined), '')
  assert.equal(applyTtsSentenceFixes(123), '')
})
