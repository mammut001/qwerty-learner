import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  allTenseLessons,
  conjugate,
  conjugateAll,
  crossCuttingLessons,
  getSupportedVerbs,
  isSupportedVerb,
  singleTenseLessons,
  UnsupportedVerbError,
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
            if (tenseId === 'imperatif' || tenseId === 'gerondif') {
              assert.equal(res.forms.length, 0, `Impersonal verb has no imperative or gerund`)
            } else {
              assert.equal(res.forms.length, 1, `Impersonal verb has 1 form in ${tenseId}`)
              assert.ok(res.forms[0].display.length > 0)
            }
          } else if (verb === 'pouvoir' && tenseId === 'imperatif') {
            assert.equal(res.forms.length, 0, `pouvoir has no imperative`)
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
      { verb: 'être', tense: 'imparfait', person: 0, expected: 'j’étais' },
      { verb: 'être', tense: 'imparfait', person: 3, expected: 'nous étions' },
      { verb: 'être', tense: 'futurSimple', person: 0, expected: 'je serai' },
      { verb: 'être', tense: 'futurSimple', person: 3, expected: 'nous serons' },
      { verb: 'être', tense: 'conditionnelPresent', person: 0, expected: 'je serais' },
      { verb: 'être', tense: 'conditionnelPresent', person: 4, expected: 'vous seriez' },
      { verb: 'être', tense: 'subjonctifPresent', person: 0, expected: 'que je sois' },
      { verb: 'être', tense: 'subjonctifPresent', person: 2, expected: 'qu’il / elle / on soit' },
      { verb: 'être', tense: 'subjonctifPresent', person: 3, expected: 'que nous soyons' },
      { verb: 'être', tense: 'subjonctifPresent', person: 4, expected: 'que vous soyez' },
      { verb: 'être', tense: 'subjonctifPresent', person: 5, expected: 'qu’ils / elles soient' },
      { verb: 'être', tense: 'passeSimple', person: 0, expected: 'je fus' },
      { verb: 'être', tense: 'passeSimple', person: 2, expected: 'il / elle / on fut' },
      { verb: 'être', tense: 'passeSimple', person: 3, expected: 'nous fûmes' },
      { verb: 'être', tense: 'imperatif', person: 0, expected: 'sois !' },
      { verb: 'être', tense: 'imperatif', person: 1, expected: 'soyons !' },
      { verb: 'être', tense: 'imperatif', person: 2, expected: 'soyez !' },
      { verb: 'être', tense: 'passeCompose', person: 0, expected: 'j’ai été' },
      { verb: 'être', tense: 'plusQueParfait', person: 0, expected: 'j’avais été' },
      { verb: 'être', tense: 'gerondif', person: 0, expected: 'en étant' },

      // --- avoir ---
      { verb: 'avoir', tense: 'present', person: 0, expected: 'j’ai' },
      { verb: 'avoir', tense: 'present', person: 1, expected: 'tu as' },
      { verb: 'avoir', tense: 'present', person: 2, expected: 'il / elle / on a' },
      { verb: 'avoir', tense: 'present', person: 3, expected: 'nous avons' },
      { verb: 'avoir', tense: 'present', person: 4, expected: 'vous avez' },
      { verb: 'avoir', tense: 'present', person: 5, expected: 'ils / elles ont' },
      { verb: 'avoir', tense: 'imparfait', person: 0, expected: 'j’avais' },
      { verb: 'avoir', tense: 'futurSimple', person: 0, expected: 'j’aurai' },
      { verb: 'avoir', tense: 'conditionnelPresent', person: 0, expected: 'j’aurais' },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 0, expected: 'que j’aie' },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 2, expected: 'qu’il / elle / on ait' },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 3, expected: 'que nous ayons' },
      { verb: 'avoir', tense: 'subjonctifPresent', person: 5, expected: 'qu’ils / elles aient' },
      { verb: 'avoir', tense: 'passeSimple', person: 0, expected: 'j’eus' },
      { verb: 'avoir', tense: 'imperatif', person: 0, expected: 'aie !' },
      { verb: 'avoir', tense: 'imperatif', person: 1, expected: 'ayons !' },
      { verb: 'avoir', tense: 'imperatif', person: 2, expected: 'ayez !' },
      { verb: 'avoir', tense: 'passeCompose', person: 0, expected: 'j’ai eu' },
      { verb: 'avoir', tense: 'gerondif', person: 0, expected: 'en ayant' },

      // --- aller ---
      { verb: 'aller', tense: 'present', person: 0, expected: 'je vais' },
      { verb: 'aller', tense: 'present', person: 1, expected: 'tu vas' },
      { verb: 'aller', tense: 'present', person: 2, expected: 'il / elle / on va' },
      { verb: 'aller', tense: 'present', person: 3, expected: 'nous allons' },
      { verb: 'aller', tense: 'present', person: 4, expected: 'vous allez' },
      { verb: 'aller', tense: 'present', person: 5, expected: 'ils / elles vont' },
      { verb: 'aller', tense: 'futurSimple', person: 0, expected: 'j’irai' },
      { verb: 'aller', tense: 'conditionnelPresent', person: 0, expected: 'j’irais' },
      { verb: 'aller', tense: 'subjonctifPresent', person: 0, expected: 'que j’aille' },
      { verb: 'aller', tense: 'subjonctifPresent', person: 3, expected: 'que nous allions' },
      { verb: 'aller', tense: 'subjonctifPresent', person: 5, expected: 'qu’ils / elles aillent' },
      { verb: 'aller', tense: 'passeSimple', person: 0, expected: 'j’allai' },
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
      { verb: 'vouloir', tense: 'subjonctifPresent', person: 5, expected: 'qu’ils / elles veuillent' },
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
      { verb: 'prendre', tense: 'passeCompose', person: 0, expected: 'j’ai pris' },

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
      { verb: 'falloir', tense: 'subjonctifPresent', person: 0, expected: 'qu’il faille' },
      { verb: 'pleuvoir', tense: 'present', person: 0, expected: 'il pleut' },
      { verb: 'pleuvoir', tense: 'futurSimple', person: 0, expected: 'il pleuvra' },
      { verb: 'pleuvoir', tense: 'subjonctifPresent', person: 0, expected: 'qu’il pleuve' },

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

    const norm = (s) => (s || '').replace(/[\u2019\u0027]/g, '\u0027').trim()

    for (const { verb, tense, person, expected } of spotChecks) {
      test(`${verb} [${tense}] person ${person} matches "${expected}"`, () => {
        const res = conjugate(verb, tense)
        assert.ok(res.forms[person], `Form index ${person} exists for ${verb} ${tense}`)
        const form = res.forms[person]
        const expNorm = norm(expected)

        if (res.auxiliary === 'être' || res.auxiliary === 'avoir / être' || res.isReflexive) {
          const matchAnswer = form.answers?.some((a) => norm(a) === expNorm)
          const matchDisplay = norm(form.display) === expNorm
          const matchSubjectVerb = norm(form.subject + ' ' + form.verb) === expNorm
          const matchVerb =
            norm(form.verb) === expNorm ||
            (form.agreementVariants &&
              Object.values(form.agreementVariants).some((v) => norm(v) === expNorm))
          assert.ok(
            matchAnswer || matchDisplay || matchSubjectVerb || matchVerb,
            `Expected "${expected}" to match answers (${form.answers}) or display "${form.display}" for ${verb} ${tense} person ${person}`,
          )
        } else {
          assert.equal(
            norm(form.display),
            expNorm,
            `Mismatch for ${verb} ${tense} person ${person}`,
          )
        }
      })
    }
  })

  describe('Spelling alternations & Elisions', () => {
    test('Elision: je vs j’ in vowel vs consonant', () => {
      const parlerPres = conjugate('parler', 'present')
      assert.equal(parlerPres.forms[0].display, 'je parle')

      const aimerPres = conjugate('aimer', 'present')
      assert.equal(aimerPres.forms[0].display, 'j’aime')

      const avoirPres = conjugate('avoir', 'present')
      assert.equal(avoirPres.forms[0].display, 'j’ai')

      const avoirCond = conjugate('avoir', 'conditionnelPresent')
      assert.equal(avoirCond.forms[0].display, 'j’aurais')
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
      assert.equal(seLeverPC.forms[0].display, 'je me suis levé(e)')
      assert.ok(seLeverPC.forms[0].answers.includes('je me suis levé'))
      assert.equal(seLeverPC.forms[3].display, 'nous nous sommes levés / levées')

      const seLeverImp = conjugate('se lever', 'imperatif')
      assert.equal(seLeverImp.forms[0].display, 'lève-toi !')
      assert.equal(seLeverImp.forms[1].display, 'levons-nous !')
      assert.equal(seLeverImp.forms[2].display, 'levez-vous !')
    })

    test('Être verbs (DR MRS VANDERTRAMP) auxiliary and agreement variants', () => {
      const partirPC = conjugate('partir', 'passeCompose')
      assert.equal(partirPC.auxiliary, 'être')
      assert.equal(partirPC.forms[0].display, 'je suis parti(e)')
      assert.ok(partirPC.forms[0].agreementVariants)
      assert.equal(partirPC.forms[0].agreementVariants.feminine, 'suis partie')

      const descendrePC = conjugate('descendre', 'passeCompose')
      assert.equal(descendrePC.auxiliary, 'avoir / être')
      assert.ok(descendrePC.notes && descendrePC.notes.length > 0)
    })
  })

  describe('Section A Bug Regressions (A.1 – A.12)', () => {
    test('A.1: Reflexive verbs starting with s’ parse correctly', () => {
      const appPres = conjugate('s’appeler', 'present')
      assert.equal(appPres.forms[0].display, 'je m’appelle')
      assert.equal(appPres.forms[3].display, 'nous nous appelons')
      assert.equal(conjugate('s’appeler', 'passeCompose').forms[0].display, 'je me suis appelé(e)')

      const habPres = conjugate('s’habiller', 'present')
      assert.equal(habPres.forms[0].display, 'je m’habille')
      assert.equal(conjugate('s’habiller', 'passeCompose').forms[0].display, 'je me suis habillé(e)')
    })

    test('A.2: se souvenir follows venir, and -venir / -tenir derivations are accurate', () => {
      const souvPres = conjugate('se souvenir', 'present')
      assert.equal(souvPres.forms[0].display, 'je me souviens')
      assert.equal(souvPres.forms[3].display, 'nous nous souvenons')
      assert.equal(souvPres.forms[5].display, 'ils / elles se souviennent')

      assert.equal(conjugate('se souvenir', 'passeCompose').forms[0].display, 'je me suis souvenu(e)')
      assert.equal(conjugate('se souvenir', 'futurSimple').forms[0].display, 'je me souviendrai')
      assert.equal(conjugate('se souvenir', 'subjonctifPresent').forms[0].display, 'que je me souvienne')
      assert.equal(conjugate('se souvenir', 'imperatif').forms[0].display, 'souviens-toi !')
      assert.equal(conjugate('se souvenir', 'gerondif').forms[0].display, 'en se souvenant')

      assert.equal(conjugate('devenir', 'passeCompose').auxiliary, 'être')
      assert.equal(conjugate('revenir', 'passeCompose').auxiliary, 'être')
      assert.equal(conjugate('parvenir', 'passeCompose').auxiliary, 'être')
      assert.equal(conjugate('intervenir', 'passeCompose').auxiliary, 'être')

      assert.equal(conjugate('obtenir', 'passeCompose').auxiliary, 'avoir')
      assert.equal(conjugate('obtenir', 'present').forms[0].display, 'j’obtiens')
      assert.equal(conjugate('obtenir', 'futurSimple').forms[0].display, 'j’obtiendrai')
      assert.equal(conjugate('prévenir', 'present').forms[0].display, 'je préviens')
      assert.equal(conjugate('retenir', 'present').forms[0].display, 'je retiens')
    })

    test('A.3: Passé simple 3rd plural of -ger / -cer verbs does not add extra e or ç before è', () => {
      const mangerPS = conjugate('manger', 'passeSimple')
      assert.equal(mangerPS.forms[5].verb, 'mangèrent')
      assert.equal(mangerPS.forms[5].display, 'ils / elles mangèrent')

      const comPS = conjugate('commencer', 'passeSimple')
      assert.equal(comPS.forms[5].verb, 'commencèrent')
      assert.equal(comPS.forms[5].display, 'ils / elles commencèrent')
    })

    test('A.4: Irregular tables conditionnel présent vous forms (dormiriez, offririez)', () => {
      assert.equal(conjugate('dormir', 'conditionnelPresent').forms[4].display, 'vous dormiriez')
      assert.equal(conjugate('offrir', 'conditionnelPresent').forms[4].display, 'vous offririez')
    })

    test('A.5: pouvoir has no impératif; vouloir and savoir have correct impératif forms', () => {
      const pouvImp = conjugate('pouvoir', 'imperatif')
      assert.equal(pouvImp.forms.length, 0)
      assert.ok(pouvImp.notes && pouvImp.notes.some((n) => n.includes('pouvoir n’a pas d’impératif')))

      const voulImp = conjugate('vouloir', 'imperatif')
      assert.equal(voulImp.forms.length, 3)
      assert.equal(voulImp.forms[0].display, 'veuille !')
      assert.equal(voulImp.forms[1].display, 'veuillons !')
      assert.equal(voulImp.forms[2].display, 'veuillez !')

      const savImp = conjugate('savoir', 'imperatif')
      assert.equal(savImp.forms.length, 3)
      assert.equal(savImp.forms[0].display, 'sache !')
      assert.equal(savImp.forms[1].display, 'sachons !')
      assert.equal(savImp.forms[2].display, 'sachez !')
    })

    test('A.6: Impersonal verbs in compound tenses use 3rd-person auxiliary and have no impératif/gérondif', () => {
      assert.equal(conjugate('falloir', 'passeCompose').forms[0].display, 'il a fallu')
      assert.equal(conjugate('falloir', 'plusQueParfait').forms[0].display, 'il avait fallu')
      assert.equal(conjugate('falloir', 'futurAnterieur').forms[0].display, 'il aura fallu')
      assert.equal(conjugate('falloir', 'conditionnelPasse').forms[0].display, 'il aurait fallu')
      assert.equal(conjugate('falloir', 'subjonctifPasse').forms[0].display, 'qu’il ait fallu')
      assert.equal(conjugate('falloir', 'imperatif').forms.length, 0)
      assert.equal(conjugate('falloir', 'gerondif').forms.length, 0)

      assert.equal(conjugate('pleuvoir', 'passeCompose').forms[0].display, 'il a plu')
      assert.equal(conjugate('pleuvoir', 'plusQueParfait').forms[0].display, 'il avait plu')
      assert.equal(conjugate('pleuvoir', 'futurAnterieur').forms[0].display, 'il aura plu')
      assert.equal(conjugate('pleuvoir', 'conditionnelPasse').forms[0].display, 'il aurait plu')
      assert.equal(conjugate('pleuvoir', 'subjonctifPasse').forms[0].display, 'qu’il ait plu')
      assert.equal(conjugate('pleuvoir', 'imperatif').forms.length, 0)
      assert.equal(conjugate('pleuvoir', 'gerondif').forms.length, 0)
    })

    test('A.7: Elision after que in subjonctif passé across all forms and answers', () => {
      const aimerSP = conjugate('aimer', 'subjonctifPasse')
      assert.equal(aimerSP.forms[0].display, 'que j’aie aimé')
      assert.equal(aimerSP.forms[1].display, 'que tu aies aimé')
      assert.equal(aimerSP.forms[2].display, 'qu’il / elle / on ait aimé')
      assert.equal(aimerSP.forms[3].display, 'que nous ayons aimé')
      assert.equal(aimerSP.forms[4].display, 'que vous ayez aimé')
      assert.equal(aimerSP.forms[5].display, 'qu’ils / elles aient aimé')

      const allerSP = conjugate('aller', 'subjonctifPasse')
      assert.ok(allerSP.forms[2].answers.includes('qu’il soit allé'))
      assert.ok(allerSP.forms[2].answers.includes('qu’elle soit allée'))
      assert.ok(allerSP.forms[5].answers.includes('qu’ils soient allés'))
      assert.ok(allerSP.forms[5].answers.includes('qu’elles soient allées'))
    })

    test('A.8: s’asseoir participle agreements, gérondif, periphrastic elisions, and apostrophe normalisation', () => {
      const assPC = conjugate('s’asseoir', 'passeCompose')
      assert.ok(assPC.forms[3].display.includes('assises'))
      assert.ok(assPC.forms[5].display.includes('assises'))

      assert.equal(conjugate('s’asseoir', 'gerondif').forms[0].display, 'en s’asseyant')
      assert.equal(conjugate('s’habiller', 'gerondif').forms[0].display, 'en s’habillant')
      assert.equal(conjugate('s’habiller', 'futurProche').forms[0].display, 'je vais m’habiller')
      assert.equal(conjugate('s’habiller', 'passeRecent').forms[0].display, 'je viens de m’habiller')
      assert.equal(conjugate('s’asseoir', 'passeRecent').forms[0].display, 'je viens de m’asseoir')

      const straight = conjugate("s'asseoir", 'present')
      const typo = conjugate('s’asseoir', 'present')
      assert.equal(straight.forms[0].display, typo.forms[0].display)
    })

    test('A.9: Maison d’être verbs default to être with avoir / être auxiliary and direct object note', () => {
      const descendrePC = conjugate('descendre', 'passeCompose')
      assert.equal(descendrePC.auxiliary, 'avoir / être')
      assert.equal(descendrePC.forms[0].display, 'je suis descendu(e)')
      assert.ok(descendrePC.notes && descendrePC.notes.some((n) => n.includes('j’ai descendu les valises')))

      const etreVerbs = [
        'aller',
        'venir',
        'arriver',
        'partir',
        'entrer',
        'rester',
        'tomber',
        'naître',
        'mourir',
        'devenir',
        'revenir',
        'retourner',
        'rentrer',
        'monter',
        'descendre',
        'sortir',
        'passer',
      ]
      for (const ev of etreVerbs) {
        const res = conjugate(ev, 'passeCompose')
        assert.ok(
          res.auxiliary === 'être' || res.auxiliary === 'avoir / être',
          `Verb ${ev} must use être auxiliary (was ${res.auxiliary})`,
        )
      }
    })

    test('A.10: Stem changes for verbs not in hand-written list (geler, peser, protéger, doubling, -yer)', () => {
      assert.equal(conjugate('geler', 'present').forms[0].display, 'je gèle')
      assert.equal(conjugate('peser', 'present').forms[0].display, 'je pèse')
      assert.equal(conjugate('peser', 'futurSimple').forms[0].display, 'je pèserai')

      const protPres = conjugate('protéger', 'present')
      assert.equal(protPres.forms[0].display, 'je protège')
      assert.equal(protPres.forms[3].display, 'nous protégeons')
      assert.equal(conjugate('protéger', 'futurSimple').forms[0].display, 'je protégerai')

      assert.equal(conjugate('appeler', 'present').forms[0].display, 'j’appelle')
      assert.equal(conjugate('rappeler', 'present').forms[0].display, 'je rappelle')
      assert.equal(conjugate('jeter', 'present').forms[0].display, 'je jette')
      assert.equal(conjugate('rejeter', 'present').forms[0].display, 'je rejette')
      assert.equal(conjugate('épeler', 'present').forms[0].display, 'j’épelle')

      assert.equal(conjugate('acheter', 'present').forms[0].display, 'j’achète')
      assert.equal(conjugate('nettoyer', 'present').forms[0].display, 'je nettoie')
      assert.equal(conjugate('essuyer', 'present').forms[0].display, 'je essuie'.replace('je e', 'j’e'))
    })

    test('A.11: Unknown input is cleanly rejected with UnsupportedVerbError, known 2nd-group verbs supported', () => {
      assert.equal(isSupportedVerb('xyz'), false)
      assert.throws(() => conjugate('xyz', 'present'), UnsupportedVerbError)
      assert.throws(() => conjugate('xyzir', 'present'), UnsupportedVerbError)

      const known2ndGroup = [
        'finir',
        'choisir',
        'réussir',
        'grandir',
        'réfléchir',
        'remplir',
        'obéir',
        'agir',
        'réagir',
        'bâtir',
        'guérir',
        'punir',
        'rougir',
        'vieillir',
        'maigrir',
        'grossir',
        'applaudir',
        'établir',
        'fournir',
        'investir',
        'nourrir',
        'ralentir',
        'saisir',
        'définir',
        'démolir',
        'réunir',
        'garantir',
      ]
      for (const v of known2ndGroup) {
        assert.ok(isSupportedVerb(v), `Verb ${v} must be recognized as supported`)
        const pres = conjugate(v, 'present')
        assert.ok(pres.forms[3].verb.endsWith('issons'), `${v} nous form must end with issons`)
      }
    })

    test('Section 1: s’en aller, spaces after reflexive pronoun, and non-conjugable reflexive bases are cleanly rejected as unsupported', () => {
      // s'en aller and typographical variants
      const enAllerVariants = ['s’en aller', "s'en aller", '  s’en aller  ', 'S’EN ALLER']
      for (const v of enAllerVariants) {
        assert.equal(isSupportedVerb(v), false, `${v} must not be supported`)
        assert.throws(() => conjugate(v, 'present'), UnsupportedVerbError, `${v} must throw UnsupportedVerbError`)
        assert.throws(() => conjugate(v, 'imparfait'), UnsupportedVerbError, `${v} must throw UnsupportedVerbError`)
      }

      // Inputs containing a space after the reflexive pronoun
      const spacedReflexives = [
        'se brosser les dents',
        'se coucher tard',
        'se faire du souci',
        'se rendre compte',
        'se laisser aller',
        's’envoler au loin',
      ]
      for (const v of spacedReflexives) {
        assert.equal(isSupportedVerb(v), false, `${v} must not be supported`)
        assert.throws(() => conjugate(v, 'present'), UnsupportedVerbError, `${v} must throw UnsupportedVerbError`)
      }

      // Non-reflexive multi-word phrases
      const multiWordPhrases = ['parler français', 'aller au cinéma', 'manger une pomme']
      for (const v of multiWordPhrases) {
        assert.equal(isSupportedVerb(v), false, `${v} must not be supported`)
        assert.throws(() => conjugate(v, 'present'), UnsupportedVerbError, `${v} must throw UnsupportedVerbError`)
      }

      // Reflexive whose base verb is not conjugable
      const nonConjugableReflexives = ['se xyz', 'se table', 'se pomme', 's’impossible', 's’inconnu', 'se 123']
      for (const v of nonConjugableReflexives) {
        assert.equal(isSupportedVerb(v), false, `${v} must not be supported`)
        assert.throws(() => conjugate(v, 'present'), UnsupportedVerbError, `${v} must throw UnsupportedVerbError`)
      }

      // Degenerate inputs
      const degenerate = ['', '   ', 'se', 'se ', 's’', 's\'']
      for (const v of degenerate) {
        assert.equal(isSupportedVerb(v), false, `"${v}" must not be supported`)
        assert.throws(() => conjugate(v, 'present'), UnsupportedVerbError, `"${v}" must throw UnsupportedVerbError`)
      }

      // Valid reflexive verbs must still succeed
      const validReflexives = ['se laver', 'se souvenir', 's’habiller', "s'habiller", 's’asseoir', 'se lever']
      for (const v of validReflexives) {
        assert.equal(isSupportedVerb(v), true, `${v} must be supported`)
        const res = conjugate(v, 'present')
        assert.ok(res.forms.length > 0, `${v} should produce forms`)
      }
    })

    test('A.12: High-frequency irregular verbs complete in every tense', () => {
      const a12Verbs = [
        'devenir',
        'revenir',
        'obtenir',
        'sentir',
        'servir',
        'mentir',
        'découvrir',
        'souffrir',
        'produire',
        'construire',
        'traduire',
        'détruire',
        'apparaître',
        'disparaître',
        'reconnaître',
        'permettre',
        'promettre',
        'battre',
        'éteindre',
        'atteindre',
        'se plaindre',
        'apercevoir',
        'décevoir',
        'sourire',
        'interdire',
        'prédire',
        'élire',
        'décrire',
        'inscrire',
        'poursuivre',
        'survivre',
        'cueillir',
        'accueillir',
        'fuir',
      ]

      for (const v of a12Verbs) {
        assert.ok(isSupportedVerb(v), `Verb ${v} must be supported`)
        const all = conjugateAll(v)
        for (const t of [
          'present',
          'passeCompose',
          'imparfait',
          'plusQueParfait',
          'futurSimple',
          'conditionnelPresent',
          'subjonctifPresent',
          'passeSimple',
        ]) {
          assert.ok(all[t].forms.length > 0, `${v} in ${t} must return forms`)
        }
      }
      assert.equal(conjugate('prédire', 'present').forms[4].display, 'vous prédisez')
    })
  })

  describe('Conjugation System Invariants', () => {
    test('Futur stem exactly equals Conditionnel stem for all supported verbs', () => {
      const futurEndings = ['ai', 'as', 'a', 'ons', 'ez', 'ont']
      const condEndings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']

      for (const v of getSupportedVerbs()) {
        const fut = conjugate(v, 'futurSimple').forms
        const cond = conjugate(v, 'conditionnelPresent').forms

        assert.equal(
          fut.length,
          cond.length,
          `Form length mismatch between futur and cond for ${v}`,
        )

        for (let i = 0; i < fut.length; i++) {
          const fv = fut[i].verb.replace(/^(me |te |se |nous |vous |m’|t’|s’)/, '')
          const cv = cond[i].verb.replace(/^(me |te |se |nous |vous |m’|t’|s’)/, '')

          const fe = fut.length === 1 ? 'a' : futurEndings[i]
          const ce = cond.length === 1 ? 'ait' : condEndings[i]

          assert.ok(
            fv.endsWith(fe),
            `Futur form "${fv}" of ${v} must end with "${fe}"`,
          )
          assert.ok(
            cv.endsWith(ce),
            `Conditionnel form "${cv}" of ${v} must end with "${ce}"`,
          )

          const fStem = fv.slice(0, -fe.length)
          const cStem = cv.slice(0, -ce.length)
          assert.equal(
            fStem,
            cStem,
            `Futur stem "${fStem}" !== Conditionnel stem "${cStem}" for ${v} form ${i}`,
          )
        }
      }
    })

    test('Imparfait stem derives from nous-present stem for all personal verbs (except être)', () => {
      const impEndings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']

      for (const v of getSupportedVerbs()) {
        if (v === 'être' || v === 'falloir' || v === 'pleuvoir') continue

        const pres = conjugate(v, 'present').forms
        const imp = conjugate(v, 'imparfait').forms

        const nousPres = pres[3].verb.replace(/^(me |te |se |nous |vous |m’|t’|s’)/, '')
        assert.ok(
          nousPres.endsWith('ons'),
          `nous-present "${nousPres}" of ${v} must end with "ons"`,
        )
        const nousStem = nousPres.slice(0, -3)

        for (let i = 0; i < 6; i++) {
          const iv = imp[i].verb.replace(/^(me |te |se |nous |vous |m’|t’|s’)/, '')
          const ending = impEndings[i]
          assert.ok(
            iv.endsWith(ending),
            `Imparfait form "${iv}" of ${v} must end with "${ending}"`,
          )
          const impStem = iv.slice(0, -ending.length)

          const normNousStem = nousStem.replace(/ge$/, 'g').replace(/ç$/, 'c')
          const normImpStem = impStem.replace(/ge$/, 'g').replace(/ç$/, 'c')
          assert.equal(
            normImpStem,
            normNousStem,
            `Imparfait stem "${impStem}" must match nous-present stem "${nousStem}" for ${v} person ${i}`,
          )
        }
      }
    })

    test('Sanity check: every supported verb × every tense has no undefined, double spaces, or bad elisions', () => {
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

      const badPatterns = [
        /undefined/,
        /\s{2,}/,
        /que je [aeéèêëiouy]/i,
        /que il\b/i,
        /que elle\b/i,
        /que on\b/i,
        /que ils\b/i,
        /que elles\b/i,
        /\bse [aeéèêëiouy]/i,
        /\bme [aeéèêëiouy]/i,
        /\bte [aeéèêëiouy]/i,
        /\bde [aeéèêëiouy]/i,
      ]

      for (const v of getSupportedVerbs()) {
        const all = conjugateAll(v)
        for (const t of allTenses) {
          const res = all[t]
          for (const f of res.forms) {
            const stringsToCheck = [f.display, f.verb, ...(f.answers || [])]
            for (const s of stringsToCheck) {
              assert.ok(s && s.length > 0, `Form string missing in ${v} ${t}`)
              for (const p of badPatterns) {
                assert.ok(
                  !p.test(s),
                  `Bad pattern ${p} matched in ${v} ${t}: "${s}"`,
                )
              }
            }
          }
        }
      }
    })
  })

  describe('Content Invariants: Quality Assurance Across All 25 Lessons', () => {
    test('Total lessons is exactly 25 (15 tenses + 10 cross-cutting)', () => {
      assert.equal(allTenseLessons.length, 25)
      assert.equal(singleTenseLessons.length, 15)
      assert.equal(crossCuttingLessons.length, 10)
    })

    test('Section C.1: French content purity (no CJK, no "→", no full-width parens in French fields)', () => {
      const CJK_REGEX = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/

      for (const lesson of allTenseLessons) {
        // echelleSources must not contain internal ids like n5-gr-...
        for (const src of lesson.echelleSources || []) {
          assert.ok(
            !/^n\d+-gr-/.test(src),
            `Lesson [${lesson.id}] echelleSources contains internal id "${src}"`,
          )
        }

        // Examples: fr and highlight must be pure French
        for (const u of lesson.usages) {
          for (const ex of u.examples) {
            assert.ok(!CJK_REGEX.test(ex.fr), `CJK in example fr [${lesson.id}]: "${ex.fr}"`)
            assert.ok(!CJK_REGEX.test(ex.highlight), `CJK in highlight [${lesson.id}]: "${ex.highlight}"`)
            assert.ok(!ex.fr.includes('→'), `Arrow in example fr [${lesson.id}]: "${ex.fr}"`)
            assert.ok(!ex.fr.includes('（') && !ex.fr.includes('）'), `Full-width parens in example fr [${lesson.id}]`)
          }
        }

        // Mistakes: wrong and right must be pure French
        for (const cm of lesson.commonMistakes) {
          assert.ok(!CJK_REGEX.test(cm.wrong), `CJK in mistake wrong [${lesson.id}]: "${cm.wrong}"`)
          assert.ok(!CJK_REGEX.test(cm.right), `CJK in mistake right [${lesson.id}]: "${cm.right}"`)
          assert.ok(!cm.wrong.includes('→'), `Arrow in mistake wrong [${lesson.id}]: "${cm.wrong}"`)
          assert.ok(!cm.right.includes('→'), `Arrow in mistake right [${lesson.id}]: "${cm.right}"`)
          assert.ok(!cm.wrong.includes('（') && !cm.wrong.includes('）'), `Full-width parens in mistake wrong [${lesson.id}]`)
          assert.ok(!cm.right.includes('（') && !cm.right.includes('）'), `Full-width parens in mistake right [${lesson.id}]`)
        }

        // Signal words: examples must be pure French
        for (const sw of lesson.signalWords || []) {
          if (sw.example) {
            assert.ok(!CJK_REGEX.test(sw.example.fr), `CJK in signal word fr [${lesson.id}]: "${sw.example.fr}"`)
            assert.ok(!sw.example.fr.includes('→'), `Arrow in signal word fr [${lesson.id}]: "${sw.example.fr}"`)
          }
        }

        // Questions: options must be pure French
        for (const q of lesson.questions) {
          if (q.options) {
            for (const opt of q.options) {
              assert.ok(!CJK_REGEX.test(opt), `CJK in question option [${lesson.id} / ${q.id}]: "${opt}"`)
              assert.ok(!opt.includes('→'), `Arrow in question option [${lesson.id} / ${q.id}]: "${opt}"`)
              assert.ok(!opt.includes('（') && !opt.includes('）'), `Full-width parens in question option [${lesson.id} / ${q.id}]`)
            }
          }
        }
      }
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
