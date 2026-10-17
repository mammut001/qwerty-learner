import { TTS_SENTENCE_FIX_RULES, applyTtsSentenceFixes } from '../src/utils/ttsSentenceFixes.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'

test('applyTtsSentenceFixes fixes réévalue pronunciations', () => {
  assert.equal(applyTtsSentenceFixes('Je réévalue'), 'Je ré-évalue')
  assert.equal(applyTtsSentenceFixes('Je réévalue immédiatement la matrice'), 'Je ré-évalue immédiatement la matrice')
  assert.equal(applyTtsSentenceFixes('Réévaluer la situation'), 'Ré-évaluer la situation')
  assert.equal(applyTtsSentenceFixes('RÉÉVALUATION DU PROJET'), 'RÉ-ÉVALUATION DU PROJET')
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')
})

test('applyTtsSentenceFixes fixes réaménag pronunciations', () => {
  assert.equal(applyTtsSentenceFixes("réaménager l'espace public"), "ré-aménager l'espace public")
  assert.equal(applyTtsSentenceFixes('Réaménager la ville'), 'Ré-aménager la ville')
  assert.equal(applyTtsSentenceFixes('RÉAMÉNAGEMENT DU QUARTIER'), 'RÉ-AMÉNAGEMENT DU QUARTIER')
  assert.equal(applyTtsSentenceFixes('aménagement'), 'aménagement')
})

test('applyTtsSentenceFixes preserves elisions as standard text', () => {
  // Elisions are no longer joined globally; they are preserved in standard text
  // and handled via SSML phonemes in the TTS pipeline.
  assert.equal(applyTtsSentenceFixes('s’épanouir'), 's’épanouir')
  assert.equal(applyTtsSentenceFixes('l’école'), 'l’école')
  assert.equal(applyTtsSentenceFixes("l'école"), "l'école")
  assert.equal(applyTtsSentenceFixes('qu’il'), 'qu’il')
  assert.equal(applyTtsSentenceFixes('jusqu’à'), 'jusqu’à')
  assert.equal(applyTtsSentenceFixes('L’Ontario'), 'L’Ontario')
  assert.equal(applyTtsSentenceFixes("d'accord"), "d'accord")
  assert.equal(applyTtsSentenceFixes("c'est"), "c'est")
  assert.equal(applyTtsSentenceFixes("aujourd'hui"), "aujourd'hui")
})

test('applyTtsSentenceFixes preserves unrelated words and apostrophes', () => {
  assert.equal(applyTtsSentenceFixes('« Bonjour »'), '« Bonjour »')
  assert.equal(applyTtsSentenceFixes("'Bonjour'"), "'Bonjour'")
  assert.equal(applyTtsSentenceFixes('"Bonjour"'), '"Bonjour"')
  assert.equal(applyTtsSentenceFixes("don't"), "don't")
  assert.equal(applyTtsSentenceFixes("it's"), "it's")
  assert.equal(applyTtsSentenceFixes('un cadre préétabli'), 'un cadre préétabli')
  assert.equal(applyTtsSentenceFixes('rééquilibrage'), 'rééquilibrage')
  assert.equal(applyTtsSentenceFixes('réédition'), 'réédition')
})

test('applyTtsSentenceFixes fixes réévaluation following elisions', () => {
  assert.equal(applyTtsSentenceFixes("l'réévaluation"), "l'ré-évaluation")
  assert.equal(applyTtsSentenceFixes('l’réévaluation'), 'l’ré-évaluation')
  assert.equal(applyTtsSentenceFixes("qu'on réévalue"), "qu'on ré-évalue")
  assert.equal(applyTtsSentenceFixes('d’une réévaluation'), 'd’une ré-évaluation')
})

test('applyTtsSentenceFixes handles empty or non-string inputs safely', () => {
  assert.equal(applyTtsSentenceFixes(''), '')
  assert.equal(applyTtsSentenceFixes(null), '')
  assert.equal(applyTtsSentenceFixes(undefined), '')
  assert.equal(applyTtsSentenceFixes(123), '')
})
