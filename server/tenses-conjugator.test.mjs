import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  conjugate,
  conjugateAll,
  getSupportedVerbs,
  allTenseLessons,
  singleTenseLessons,
  crossCuttingLessons,
} from '../src/resources/tenses/index.ts'

describe('French Tenses Conjugation Engine & Content Suite', () => {
  describe('Conjugation Engine: Complete tense coverage for irregular verbs', () => {
    const irregularVerbs = [
      'être',
      'avoir',
      'aller',
      'faire',
      'pouvoir',
      'vouloir',
      'devoir',
      'savoir',
      'venir',
      'tenir',
      'prendre',
      'mettre',
      'dire',
      'voir',
      'partir',
      'sortir',
      'dormir',
      'lire',
      'écrire',
      'boire',
      'connaître',
      'recevoir',
      'croire',
      'vivre',
      'suivre',
      'ouvrir',
      'offrir',
      'courir',
      'mourir',
      'naître',
      'falloir',
      'pleuvoir',
      'valoir',
      'plaire',
      'rire',
      'conduire',
      'craindre',
      'envoyer',
      's’asseoir',
    ]

    const allTenses = [
      'present',
      'passeCompose',
      'imparfait',
      'plusQueParfait',
      'futurProche',
      'futurSimple',
      'futurAnterieur',
      'passeRecent',
      'conditionnelPresent',
      'conditionnelPasse',
      'subjonctifPresent',
      'subjonctifPasse',
      'imperatif',
      'passeSimple',
      'gerondif',
    ]

    for (const verb of irregularVerbs) {
      test(`verb "${verb}" conjugates across all 15 tenses without crash`, () => {
        const all = conjugateAll(verb)
        for (const tenseId of allTenses) {
          const res = all[tenseId]
          assert.ok(res, `Result exists for ${verb} in ${tenseId}`)
          assert.ok(res.participePasse, `Participe passé exists for ${verb}`)
          assert.ok(res.participePresent, `Participe présent exists for ${verb}`)

          if (verb === 'falloir' || verb === 'pleuvoir') {
            if (tenseId === 'imperatif') {
              assert.equal(res.forms.length, 0, `Impersonal verb has no imperative`)
            } else if (tenseId === 'gerondif') {
              assert.equal(res.forms.length, 1)
            } else {
              assert.equal(res.forms.length, 1, `Impersonal verb has 1 form in ${tenseId}`)
              assert.ok(res.forms[0].display.length > 0)
            }
          } else if (tenseId === 'imperatif') {
            assert.equal(res.forms.length, 3, `Imperative has 3 forms (tu, nous, vous) for ${verb}`)
            for (const f of res.forms) {
              assert.ok(f.verb.length > 0)
              assert.ok(f.display.length > 0)
            }
          } else if (tenseId === 'gerondif') {
            assert.equal(res.forms.length, 1, `Gérondif has 1 form for ${verb}`)
            assert.ok(res.forms[0].display.startsWith('en '))
          } else {
            assert.equal(res.forms.length, 6, `${verb} in ${tenseId} returns 6 forms`)
            for (const f of res.forms) {
              assert.ok(f.verb.length > 0, `Non-empty verb in ${verb} ${tenseId} ${f.person}`)
              assert.ok(f.display.length > 0, `Non-empty display in ${verb} ${tenseId} ${f.person}`)
            }
          }
        }
      })
    }
  })

  describe('Known-form spot checks (≥ 120 forms validated against authoritative reference)', () => {
    // Exact forms from standard French grammar (Bescherelle / Robert / Académie)
    const spotChecks = [
      // --- être ---
      { verb: 'être', tense: 'present', person: 0, expected: 'je suis' },
      { verb: 'être', tense: 'present', person: 1, expected: 'tu es' },
      { verb: 'être', tense: 'present', person: 2, expected: 'il / elle / on est' },
      { verb: 'être', tense: 'present', person: 3, expected: 'nous sommes' },
      { verb: 'être', tense: 'present', person: 4, expected: 'vous êtes' },
      { verb: 'être', tense: 'present', person: 5, expected: 'ils / elles sont' },
      { verb: 'être', tense: 'imparfait', person: 0, expected: "j'étais" },
      { verb: 'être', tense: 'imparfait', person: 3, expected: 'nous étions' },
      { verb: 'être', tense: 'futurSimple', person: 0, expected: 'je serai' },
      { verb: 'être', tense: 'futurSimple', person: 3, expected: 'nous serons' },
      { verb: 'être', tense: 'conditionnelPresent', person: 0, expected: 'je serais' },
      { verb: 'être', tense: 'conditionnelPresent', person: 4, expected: 'vous seriez' },
      { verb: 'être', tense: 'subjonctifPresent', person: 0, expected: 'que je sois' },
      { verb: 'être', tense: 'subjonctifPresent', person: 2, expected: "qu'il / elle / on soit" },
      { verb: 'être', tense: 'subjonctifPresent', person: 3, expected: 'que nous soyons' },
      { verb: 'être', tense: 'subjonctifPresent', person: 4, expected: 'que vous soyez' },
      { verb: 'être', tense: 'subjonctifPresent', person: 5, expected: "qu'ils / elles soient" },
      { verb: 'être', tense: 'passeSimple', person: 0, expected: 'je fus' },
      { verb: 'être', tense: 'passeSimple', person: 2, expected: 'il / elle / on fut' },
      { verb: 'être', tense: 'passeSimple', person: 3, expected: 'nous fûmes' },
      { verb: 'être', tense: 'imperatif', person: 0, expected: 'sois !' },
      { verb: 'être', tense: 'imperatif', person: 1, expected: 'soyons !' },
      { verb: 'être', tense: 'imperatif', person: 2, expected: 'soyez !' },
      { verb: 'être', tense: 'passeCompose', person: 0, expected: "j'ai été" },
      { verb: 'être', tense: 'plusQueParfait', person: 0, expected: "j'avais été" },
      { verb: 'être', tense: 'gerondif', person: 0, expected: 'en étant' },

      // --- avoir ---
      { verb: 'avoir', tense: 'present', person: 0, expected: "j'ai" },
      { verb: 'avoir', tense: 'present', person: 1, expected: 'tu as' },
      { verb: 'avoir', tense: 'present', person: 2, expected: 'il / elle / on a' },
      { verb: 'avoir', tense: 'present', person: 3, expected: 'nous avons' },
      { verb: 'avoir', tense: 'present', person: 4, expected: 'vous avez' },
      { verb: 'avoir', tense: 'present', person: 5, expected: 'ils / elles ont' },
      { verb: 'avoir', tense: 'imparfait', person: 0, expected: "j'avais" },
      { verb: 'avoir', tense: 'futurSimple', person: 0, expected: "j'aurai" },
      { verb: 'avoir', tense: 'conditionnelPresent', person: 0, expected: "j'aurais" },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 0, expected: "que j'aie" },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 2, expected: "qu'il / elle / on ait" },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 3, expected: 'que nous ayons' },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 5, expected: "qu'ils / elles aient" },
      { verb: 'avoir', tense: 'passeSimple', person: 0, expected: "j'eus" },
      { verb: 'avoir', tense: 'imperatif', person: 0, expected: 'aie !' },
      { verb: 'avoir', tense: 'imperatif', person: 1, expected: 'ayons !' },
      { verb: 'avoir', tense: 'imperatif', person: 2, expected: 'ayez !' },
      { verb: 'avoir', tense: 'passeCompose', person: 0, expected: "j'ai eu" },
      { verb: 'avoir', tense: 'gerondif', person: 0, expected: 'en ayant' },

      // --- aller ---
      { verb: 'aller', tense: 'present', person: 0, expected: 'je vais' },
      { verb: 'aller', tense: 'present', person: 1, expected: 'tu vas' },
      { verb: 'aller', tense: 'present', person: 2, expected: 'il / elle / on va' },
      { verb: 'aller', tense: 'present', person: 3, expected: 'nous allons' },
      { verb: 'aller', tense: 'present', person: 4, expected: 'vous allez' },
      { verb: 'aller', tense: 'present', person: 5, expected: 'ils / elles vont' },
      { verb: 'aller', tense: 'futurSimple', person: 0, expected: "j'irai" },
      { verb: 'aller', tense: 'conditionnelPresent', person: 0, expected: "j'irais" },
      { verb: 'aller', tense: 'subjonctifPresent', person: 0, expected: "que j'aille" },
      { verb: 'aller', tense: 'subjonctifPresent', person: 3, expected: 'que nous allions' },
      { verb: 'aller', tense: 'subjonctifPresent', person: 5, expected: "qu'ils / elles aillent" },
      { verb: 'aller', tense: 'passeSimple', person: 0, expected: "j'allai" },
      { verb: 'aller', tense: 'passeSimple', person: 2, expected: 'il / elle / on alla' },
      { verb: 'aller', tense: 'imperatif', person: 0, expected: 'va !' },
      { verb: 'aller', tense: 'imperatif', person: 1, expected: 'allons !' },
      { verb: 'aller', tense: 'imperatif', person: 2, expected: 'allez !' },
      { verb: 'aller', tense: 'passeCompose', person: 0, expected: 'je suis allé' },

      // --- faire ---
      { verb: 'faire', tense: 'present', person: 0, expected: 'je fais' },
      { verb: 'faire', tense: 'present', person: 3, expected: 'nous faisons' },
      { verb: 'faire', tense: 'present', person: 4, expected: 'vous faites' },
      { verb: 'faire', tense: 'present', person: 5, expected: 'ils / elles font' },
      { verb: 'faire', tense: 'imparfait', person: 0, expected: 'je faisais' },
      { verb: 'faire', tense: 'futurSimple', person: 0, expected: 'je ferai' },
      { verb: 'faire', tense: 'conditionnelPresent', person: 0, expected: 'je ferais' },
      { verb: 'faire', tense: 'subjonctifPresent', person: 0, expected: 'que je fasse' },
      { verb: 'faire', tense: 'subjonctifPresent', person: 3, expected: 'que nous fassions' },
      { verb: 'faire', tense: 'passeSimple', person: 0, expected: 'je fis' },
      { verb: 'faire', tense: 'imperatif', person: 1, expected: 'faisons !' },
      { verb: 'faire', tense: 'imperatif', person: 2, expected: 'faites !' },

      // --- pouvoir ---
      { verb: 'pouvoir', tense: 'present', person: 0, expected: 'je peux' },
      { verb: 'pouvoir', tense: 'present', person: 2, expected: 'il / elle / on peut' },
      { verb: 'pouvoir', tense: 'present', person: 3, expected: 'nous pouvons' },
      { verb: 'pouvoir', tense: 'present', person: 5, expected: 'ils / elles peuvent' },
      { verb: 'pouvoir', tense: 'futurSimple', person: 0, expected: 'je pourrai' },
      { verb: 'pouvoir', tense: 'conditionnelPresent', person: 0, expected: 'je pourrais' },
      { verb: 'pouvoir', tense: 'subjonctifPresent', person: 0, expected: 'que je puisse' },
      { verb: 'pouvoir', tense: 'subjonctifPresent', person: 3, expected: 'que nous puissions' },
      { verb: 'pouvoir', tense: 'passeSimple', person: 0, expected: 'je pus' },

      // --- vouloir ---
      { verb: 'vouloir', tense: 'present', person: 0, expected: 'je veux' },
      { verb: 'vouloir', tense: 'present', person: 2, expected: 'il / elle / on veut' },
      { verb: 'vouloir', tense: 'present', person: 3, expected: 'nous voulons' },
      { verb: 'vouloir', tense: 'present', person: 5, expected: 'ils / elles veulent' },
      { verb: 'vouloir', tense: 'futurSimple', person: 0, expected: 'je voudrai' },
      { verb: 'vouloir', tense: 'conditionnelPresent', person: 0, expected: 'je voudrais' },
      { verb: 'vouloir', tense: 'subjonctifPresent', person: 0, expected: 'que je veuille' },
      { verb: 'vouloir', tense: 'subjonctifPresent', person: 3, expected: 'que nous voulions' },
      { verb: 'vouloir', tense: 'subjonctifPresent', person: 5, expected: "qu'ils / elles veuillent" },
      { verb: 'vouloir', tense: 'imperatif', person: 2, expected: 'veuillez !' },

      // --- devoir ---
      { verb: 'devoir', tense: 'present', person: 0, expected: 'je dois' },
      { verb: 'devoir', tense: 'present', person: 3, expected: 'nous devons' },
      { verb: 'devoir', tense: 'present', person: 5, expected: 'ils / elles doivent' },
      { verb: 'devoir', tense: 'futurSimple', person: 0, expected: 'je devrai' },
      { verb: 'devoir', tense: 'conditionnelPresent', person: 0, expected: 'je devrais' },
      { verb: 'devoir', tense: 'subjonctifPresent', person: 0, expected: 'que je doive' },
      { verb: 'devoir', tense: 'subjonctifPresent', person: 3, expected: 'que nous devions' },

      // --- savoir ---
      { verb: 'savoir', tense: 'present', person: 0, expected: 'je sais' },
      { verb: 'savoir', tense: 'present', person: 3, expected: 'nous savons' },
      { verb: 'savoir', tense: 'futurSimple', person: 0, expected: 'je saurai' },
      { verb: 'savoir', tense: 'conditionnelPresent', person: 0, expected: 'je saurais' },
      { verb: 'savoir', tense: 'subjonctifPresent', person: 0, expected: 'que je sache' },
      { verb: 'savoir', tense: 'subjonctifPresent', person: 3, expected: 'que nous sachions' },
      { verb: 'savoir', tense: 'imperatif', person: 0, expected: 'sache !' },
      { verb: 'savoir', tense: 'imperatif', person: 2, expected: 'sachez !' },

      // --- venir ---
      { verb: 'venir', tense: 'present', person: 0, expected: 'je viens' },
      { verb: 'venir', tense: 'present', person: 3, expected: 'nous venons' },
      { verb: 'venir', tense: 'present', person: 5, expected: 'ils / elles viennent' },
      { verb: 'venir', tense: 'futurSimple', person: 0, expected: 'je viendrai' },
      { verb: 'venir', tense: 'conditionnelPresent', person: 0, expected: 'je viendrais' },
      { verb: 'venir', tense: 'subjonctifPresent', person: 0, expected: 'que je vienne' },
      { verb: 'venir', tense: 'subjonctifPresent', person: 3, expected: 'que nous venions' },
      { verb: 'venir', tense: 'passeSimple', person: 0, expected: 'je vins' },
      { verb: 'venir', tense: 'passeCompose', person: 0, expected: 'je suis venu' },

      // --- prendre ---
      { verb: 'prendre', tense: 'present', person: 0, expected: 'je prends' },
      { verb: 'prendre', tense: 'present', person: 3, expected: 'nous prenons' },
      { verb: 'prendre', tense: 'present', person: 5, expected: 'ils / elles prennent' },
      { verb: 'prendre', tense: 'futurSimple', person: 0, expected: 'je prendrai' },
      { verb: 'prendre', tense: 'subjonctifPresent', person: 0, expected: 'que je prenne' },
      { verb: 'prendre', tense: 'subjonctifPresent', person: 3, expected: 'que nous prenions' },
      { verb: 'prendre', tense: 'passeSimple', person: 0, expected: 'je pris' },
      { verb: 'prendre', tense: 'passeCompose', person: 0, expected: "j'ai pris" },

      // --- mettre ---
      { verb: 'mettre', tense: 'present', person: 0, expected: 'je mets' },
      { verb: 'mettre', tense: 'present', person: 3, expected: 'nous mettons' },
      { verb: 'mettre', tense: 'subjonctifPresent', person: 0, expected: 'que je mette' },
      { verb: 'mettre', tense: 'passeSimple', person: 0, expected: 'je mis' },

      // --- dire ---
      { verb: 'dire', tense: 'present', person: 0, expected: 'je dis' },
      { verb: 'dire', tense: 'present', person: 3, expected: 'nous disons' },
      { verb: 'dire', tense: 'present', person: 4, expected: 'vous dites' },
      { verb: 'dire', tense: 'present', person: 5, expected: 'ils / elles disent' },
      { verb: 'dire', tense: 'futurSimple', person: 0, expected: 'je dirai' },

      // --- voir ---
      { verb: 'voir', tense: 'present', person: 0, expected: 'je vois' },
      { verb: 'voir', tense: 'present', person: 3, expected: 'nous voyons' },
      { verb: 'voir', tense: 'futurSimple', person: 0, expected: 'je verrai' },
      { verb: 'voir', tense: 'subjonctifPresent', person: 0, expected: 'que je voie' },
      { verb: 'voir', tense: 'subjonctifPresent', person: 3, expected: 'que nous voyions' },
      { verb: 'voir', tense: 'passeSimple', person: 0, expected: 'je vis' },

      // --- mourir / naître ---
      { verb: 'mourir', tense: 'present', person: 0, expected: 'je meurs' },
      { verb: 'mourir', tense: 'present', person: 3, expected: 'nous mourons' },
      { verb: 'mourir', tense: 'futurSimple', person: 0, expected: 'je mourrai' },
      { verb: 'mourir', tense: 'passeCompose', person: 2, expected: 'il / elle / on est mort' },
      { verb: 'naître', tense: 'present', person: 0, expected: 'je nais' },
      { verb: 'naître', tense: 'passeSimple', person: 0, expected: 'je naquis' },
      { verb: 'naître', tense: 'passeCompose', person: 0, expected: 'je suis né' },

      // --- falloir / pleuvoir ---
      { verb: 'falloir', tense: 'present', person: 0, expected: 'il faut' },
      { verb: 'falloir', tense: 'imparfait', person: 0, expected: 'il fallait' },
      { verb: 'falloir', tense: 'futurSimple', person: 0, expected: 'il faudra' },
      { verb: 'falloir', tense: 'conditionnelPresent', person: 0, expected: 'il faudrait' },
      { verb: 'falloir', tense: 'subjonctifPresent', person: 0, expected: "qu'il faille" },
      { verb: 'pleuvoir', tense: 'present', person: 0, expected: 'il pleut' },
      { verb: 'pleuvoir', tense: 'futurSimple', person: 0, expected: 'il pleuvra' },
      { verb: 'pleuvoir', tense: 'subjonctifPresent', person: 0, expected: "qu'il pleuve" },

      // --- regular models: -er (parler), -ir (finir), -re (vendre) ---
      { verb: 'parler', tense: 'present', person: 0, expected: 'je parle' },
      { verb: 'parler', tense: 'present', person: 3, expected: 'nous parlons' },
      { verb: 'parler', tense: 'imparfait', person: 0, expected: 'je parlais' },
      { verb: 'parler', tense: 'futurSimple', person: 0, expected: 'je parlerai' },
      { verb: 'parler', tense: 'conditionnelPresent', person: 0, expected: 'je parlerais' },
      { verb: 'parler', tense: 'passeSimple', person: 0, expected: 'je parlai' },
      { verb: 'finir', tense: 'present', person: 0, expected: 'je finis' },
      { verb: 'finir', tense: 'present', person: 3, expected: 'nous finissons' },
      { verb: 'finir', tense: 'imparfait', person: 0, expected: 'je finissais' },
      { verb: 'finir', tense: 'subjonctifPresent', person: 0, expected: 'que je finisse' },
      { verb: 'vendre', tense: 'present', person: 0, expected: 'je vends' },
      { verb: 'vendre', tense: 'present', person: 2, expected: 'il / elle / on vend' },
      { verb: 'vendre', tense: 'present', person: 3, expected: 'nous vendons' },
    ]

    test(`spot checks total ≥ 120 (${spotChecks.length} exact checks)`, () => {
      assert.ok(spotChecks.length >= 120)
    })

    for (const { verb, tense, person, expected } of spotChecks) {
      test(`${verb} [${tense}] person ${person} === "${expected}"`, () => {
        const res = conjugate(verb, tense)
        assert.ok(res.forms[person], `Form index ${person} exists`)
        assert.equal(
          res.forms[person].display,
          expected,
          `Mismatch for ${verb} ${tense} person ${person}`,
        )
      })
    }
  })

  describe('Spelling alternations & Elisions', () => {
    test('Elision: je vs j’ in vowel vs consonant', () => {
      const parlerPres = conjugate('parler', 'present')
      assert.equal(parlerPres.forms[0].display, 'je parle')

      const aimerPres = conjugate('aimer', 'present')
      assert.equal(aimerPres.forms[0].display, "j'aime")

      const avoirPres = conjugate('avoir', 'present')
      assert.equal(avoirPres.forms[0].display, "j'ai")

      const avoirCond = conjugate('avoir', 'conditionnelPresent')
      assert.equal(avoirCond.forms[0].display, "j'aurais")
    })

    test('-ger verbs add e before a and o', () => {
      const mangerPres = conjugate('manger', 'present')
      assert.equal(mangerPres.forms[3].verb, 'mangeons')
      assert.equal(mangerPres.forms[3].display, 'nous mangeons')

      const mangerImp = conjugate('manger', 'imparfait')
      assert.equal(mangerImp.forms[0].verb, 'mangeais')
      assert.equal(mangerImp.forms[0].display, 'je mangeais')
      assert.equal(mangerImp.forms[3].verb, 'mangions') // no extra e before i
    })

    test('-cer verbs use ç before a and o', () => {
      const comPres = conjugate('commencer', 'present')
      assert.equal(comPres.forms[3].verb, 'commençons')

      const comImp = conjugate('commencer', 'imparfait')
      assert.equal(comImp.forms[0].verb, 'commençais')
      assert.equal(comImp.forms[3].verb, 'commencions') // c before i
    })

    test('-yer verbs alternate y / i', () => {
      const nettoyerPres = conjugate('nettoyer', 'present')
      assert.equal(nettoyerPres.forms[0].verb, 'nettoie')
      assert.equal(nettoyerPres.forms[3].verb, 'nettoyons')

      const envoyerPres = conjugate('envoyer', 'present')
      assert.equal(envoyerPres.forms[0].verb, 'envoie')
      assert.equal(envoyerPres.forms[3].verb, 'envoyons')
      assert.equal(envoyerPres.forms[5].verb, 'envoient')
    })

    test('e/é + consonant + er alternation', () => {
      const acheterPres = conjugate('acheter', 'present')
      assert.equal(acheterPres.forms[0].verb, 'achète')
      assert.equal(acheterPres.forms[3].verb, 'achetons')

      const leverPres = conjugate('lever', 'present')
      assert.equal(leverPres.forms[0].verb, 'lève')
      assert.equal(leverPres.forms[3].verb, 'levons')

      const prefPres = conjugate('préférer', 'present')
      assert.equal(prefPres.forms[0].verb, 'préfère')
      assert.equal(prefPres.forms[3].verb, 'préférons')
    })

    test('-eler and -eter doubling', () => {
      const appelerPres = conjugate('appeler', 'present')
      assert.equal(appelerPres.forms[0].verb, 'appelle')
      assert.equal(appelerPres.forms[3].verb, 'appelons')

      const jeterPres = conjugate('jeter', 'present')
      assert.equal(jeterPres.forms[0].verb, 'jette')
      assert.equal(jeterPres.forms[3].verb, 'jetons')
    })

    test('Reflexive verbs: pronoun placement, auxiliary être, and imperative', () => {
      const seLeverPres = conjugate('se lever', 'present')
      assert.equal(seLeverPres.isReflexive, true)
      assert.equal(seLeverPres.auxiliary, 'être')
      assert.equal(seLeverPres.forms[0].display, 'je me lève')
      assert.equal(seLeverPres.forms[3].display, 'nous nous levons')

      const seLeverPC = conjugate('se lever', 'passeCompose')
      assert.equal(seLeverPC.forms[0].display, 'je me suis levé')
      assert.equal(seLeverPC.forms[3].display, 'nous nous sommes levés')

      const seLeverImp = conjugate('se lever', 'imperatif')
      assert.equal(seLeverImp.forms[0].display, 'lève-toi !')
      assert.equal(seLeverImp.forms[1].display, 'levons-nous !')
      assert.equal(seLeverImp.forms[2].display, 'levez-vous !')
    })

    test('Être verbs (DR MRS VANDERTRAMP) auxiliary and agreement variants', () => {
      const partirPC = conjugate('partir', 'passeCompose')
      assert.equal(partirPC.auxiliary, 'être')
      assert.equal(partirPC.forms[0].display, 'je suis parti')
      assert.ok(partirPC.forms[0].agreementVariants)
      assert.equal(partirPC.forms[0].agreementVariants.feminine, 'suis partie')

      const descendrePC = conjugate('descendre', 'passeCompose')
      assert.equal(descendrePC.auxiliary, 'avoir / être')
      assert.ok(descendrePC.notes && descendrePC.notes.length > 0)
    })
  })

  describe('Content Invariants: Quality Assurance Across All 25 Lessons', () => {
    test('Total lessons is exactly 25 (15 tenses + 10 cross-cutting)', () => {
      assert.equal(allTenseLessons.length, 25)
      assert.equal(singleTenseLessons.length, 15)
      assert.equal(crossCuttingLessons.length, 10)
    })

    for (const lesson of allTenseLessons) {
      const isCross = lesson.category === 'cross-cutting'
      const minEx = isCross ? 20 : 24
      const minQ = isCross ? 12 : 16

      test(`Lesson [${lesson.id}] satisfies all invariants`, () => {
        // 1. Basic metadata
        assert.ok(lesson.titleFr.length > 0, 'titleFr present')
        assert.ok(lesson.titleZh.length > 0, 'titleZh present')
        assert.ok(lesson.cefrLevel.length > 0, 'cefrLevel present')
        assert.ok(lesson.summaryZh.length > 0, 'summaryZh present')

        // 2. Examples invariant
        const totalExamples = lesson.usages.reduce((s, u) => s + u.examples.length, 0)
        assert.ok(
          totalExamples >= minEx,
          `Total examples ${totalExamples} >= ${minEx} for ${lesson.id}`,
        )

        for (const usage of lesson.usages) {
          assert.ok(usage.id.length > 0, 'usage id present')
          assert.ok(usage.titleZh.length > 0, 'usage titleZh present')
          assert.ok(usage.descriptionZh.length > 0, 'usage descriptionZh present')
          assert.ok(
            usage.examples.length >= 4,
            `Usage ${usage.id} in ${lesson.id} has ${usage.examples.length} >= 4 examples`,
          )

          for (const ex of usage.examples) {
            assert.ok(ex.fr.length > 0, 'fr present')
            assert.ok(ex.zh.length > 0, 'zh present')
            assert.ok(ex.highlight.length > 0, 'highlight present')
            assert.ok(
              ex.fr.includes(ex.highlight),
              `Highlight "${ex.highlight}" must be substring of "${ex.fr}" in lesson ${lesson.id}`,
            )
          }
        }

        // 3. Signal words
        if (!isCross) {
          assert.ok(lesson.signalWords.length >= 4, `Signal words count >= 4 in ${lesson.id}`)
          for (const sw of lesson.signalWords) {
            assert.ok(sw.word.length > 0, 'word present')
            assert.ok(sw.meaningZh.length > 0, 'meaningZh present')
            assert.ok(
              sw.example.fr.includes(sw.example.highlight),
              `Signal word highlight in fr for ${sw.word}`,
            )
          }
        }

        // 4. Common mistakes
        assert.ok(lesson.commonMistakes.length >= 4, `Common mistakes >= 4 in ${lesson.id}`)
        for (const cm of lesson.commonMistakes) {
          assert.ok(cm.wrong.length > 0, 'wrong present')
          assert.ok(cm.right.length > 0, 'right present')
          assert.ok(cm.explanationZh.length > 0, 'explanationZh present')
        }

        // 5. Questions invariant
        assert.ok(
          lesson.questions.length >= minQ,
          `Total questions ${lesson.questions.length} >= ${minQ} in ${lesson.id}`,
        )

        for (const q of lesson.questions) {
          assert.ok(q.id.length > 0, 'q.id present')
          assert.ok(q.prompt.length > 0, 'q.prompt present')
          assert.ok(q.correctAnswer.length > 0, 'q.correctAnswer present')
          assert.ok(q.explanationZh.length > 0, 'q.explanationZh present')
          if (q.type === 'choice') {
            assert.ok(q.options && q.options.length >= 2, `choice options >= 2 in ${q.id}`)
            assert.ok(
              q.options.some((opt) => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()),
              `correctAnswer "${q.correctAnswer}" in options for ${q.id}`,
            )
          }
        }
      })
    }
  })
})
