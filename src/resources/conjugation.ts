export type ConjugationTense = 'present' | 'passeCompose' | 'imparfait'

export type ConjugationRow = {
  subject: string
  display: string
  answers: string[]
}

export type FrenchVerbConjugation = {
  infinitive: string
  translation: string
  auxiliary: 'avoir' | 'être'
  pastParticiple: string
  note?: string
  tenses: Record<ConjugationTense, ConjugationRow[]>
}

export const conjugationTenseLabels: Record<ConjugationTense, string> = {
  present: 'Présent',
  passeCompose: 'Passé composé',
  imparfait: 'Imparfait',
}

const firstPerson = (form: string) =>
  /^[aeiouyhàâäéèêëîïôöùûü]/i.test(form) ? `j'${form}` : `je ${form}`

const simpleRows = (forms: [string, string, string, string, string, string]): ConjugationRow[] => [
  { subject: 'je', display: firstPerson(forms[0]), answers: [firstPerson(forms[0])] },
  { subject: 'tu', display: `tu ${forms[1]}`, answers: [`tu ${forms[1]}`] },
  {
    subject: 'il / elle / on',
    display: `il / elle / on ${forms[2]}`,
    answers: [`il ${forms[2]}`, `elle ${forms[2]}`, `on ${forms[2]}`],
  },
  { subject: 'nous', display: `nous ${forms[3]}`, answers: [`nous ${forms[3]}`] },
  { subject: 'vous', display: `vous ${forms[4]}`, answers: [`vous ${forms[4]}`] },
  {
    subject: 'ils / elles',
    display: `ils / elles ${forms[5]}`,
    answers: [`ils ${forms[5]}`, `elles ${forms[5]}`],
  },
]

const passeComposeAvoir = (participle: string) =>
  simpleRows([
    `ai ${participle}`,
    `as ${participle}`,
    `a ${participle}`,
    `avons ${participle}`,
    `avez ${participle}`,
    `ont ${participle}`,
  ])

const agreement = (participle: string) => {
  const feminine = `${participle}e`
  const plural = `${participle}s`
  const femininePlural = `${participle}es`
  return { feminine, plural, femininePlural }
}

const passeComposeEtre = (participle: string): ConjugationRow[] => {
  const { feminine, plural, femininePlural } = agreement(participle)
  return [
    {
      subject: 'je',
      display: `je suis ${participle}(e)`,
      answers: [`je suis ${participle}`, `je suis ${feminine}`],
    },
    {
      subject: 'tu',
      display: `tu es ${participle}(e)`,
      answers: [`tu es ${participle}`, `tu es ${feminine}`],
    },
    {
      subject: 'il / elle / on',
      display: `il est ${participle} / elle est ${feminine} / on est ${participle}(e)`,
      answers: [`il est ${participle}`, `elle est ${feminine}`, `on est ${participle}`, `on est ${feminine}`],
    },
    {
      subject: 'nous',
      display: `nous sommes ${plural} / ${femininePlural}`,
      answers: [`nous sommes ${plural}`, `nous sommes ${femininePlural}`],
    },
    {
      subject: 'vous',
      display: `vous êtes ${participle}(e)(s)`,
      answers: [
        `vous êtes ${participle}`,
        `vous êtes ${feminine}`,
        `vous êtes ${plural}`,
        `vous êtes ${femininePlural}`,
      ],
    },
    {
      subject: 'ils / elles',
      display: `ils sont ${plural} / elles sont ${femininePlural}`,
      answers: [`ils sont ${plural}`, `elles sont ${femininePlural}`],
    },
  ]
}

const passeComposeReflexive = (participle: string): ConjugationRow[] => {
  const { feminine, plural, femininePlural } = agreement(participle)
  return [
    {
      subject: 'je',
      display: `je me suis ${participle}(e)`,
      answers: [`je me suis ${participle}`, `je me suis ${feminine}`],
    },
    {
      subject: 'tu',
      display: `tu t'es ${participle}(e)`,
      answers: [`tu t'es ${participle}`, `tu t'es ${feminine}`],
    },
    {
      subject: 'il / elle / on',
      display: `il s'est ${participle} / elle s'est ${feminine} / on s'est ${participle}(e)`,
      answers: [
        `il s'est ${participle}`,
        `elle s'est ${feminine}`,
        `on s'est ${participle}`,
        `on s'est ${feminine}`,
      ],
    },
    {
      subject: 'nous',
      display: `nous nous sommes ${plural} / ${femininePlural}`,
      answers: [`nous nous sommes ${plural}`, `nous nous sommes ${femininePlural}`],
    },
    {
      subject: 'vous',
      display: `vous vous êtes ${participle}(e)(s)`,
      answers: [
        `vous vous êtes ${participle}`,
        `vous vous êtes ${feminine}`,
        `vous vous êtes ${plural}`,
        `vous vous êtes ${femininePlural}`,
      ],
    },
    {
      subject: 'ils / elles',
      display: `ils se sont ${plural} / elles se sont ${femininePlural}`,
      answers: [`ils se sont ${plural}`, `elles se sont ${femininePlural}`],
    },
  ]
}

const verb = (
  infinitive: string,
  translation: string,
  auxiliary: 'avoir' | 'être',
  pastParticiple: string,
  present: [string, string, string, string, string, string],
  imparfait: [string, string, string, string, string, string],
  note?: string,
): FrenchVerbConjugation => ({
  infinitive,
  translation,
  auxiliary,
  pastParticiple,
  note,
  tenses: {
    present: simpleRows(present),
    passeCompose: auxiliary === 'avoir' ? passeComposeAvoir(pastParticiple) : passeComposeEtre(pastParticiple),
    imparfait: simpleRows(imparfait),
  },
})

const seLever: FrenchVerbConjugation = {
  infinitive: 'se lever',
  translation: '起床；站起来',
  auxiliary: 'être',
  pastParticiple: 'levé',
  note: '代词动词在复合过去时使用 être；过去分词通常要注意性数配合。',
  tenses: {
    present: simpleRows(['me lève', 'te lèves', 'se lève', 'nous levons', 'vous levez', 'se lèvent']),
    passeCompose: passeComposeReflexive('levé'),
    imparfait: simpleRows(['me levais', 'te levais', 'se levait', 'nous levions', 'vous leviez', 'se levaient']),
  },
}

export const frenchVerbs: FrenchVerbConjugation[] = [
  verb('être', '是；处于', 'avoir', 'été', ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient']),
  verb('avoir', '有', 'avoir', 'eu', ['ai', 'as', 'a', 'avons', 'avez', 'ont'], ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient']),
  verb('aller', '去', 'être', 'allé', ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient']),
  verb('faire', '做；制造', 'avoir', 'fait', ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient']),
  verb('pouvoir', '能够；可以', 'avoir', 'pu', ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient']),
  verb('vouloir', '想要', 'avoir', 'voulu', ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient']),
  verb('devoir', '必须；应该', 'avoir', 'dû', ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'], ['devais', 'devais', 'devait', 'devions', 'deviez', 'devaient']),
  verb('savoir', '知道；会', 'avoir', 'su', ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], ['savais', 'savais', 'savait', 'savions', 'saviez', 'savaient']),
  verb('venir', '来', 'être', 'venu', ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient']),
  verb('partir', '离开；出发', 'être', 'parti', ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], ['partais', 'partais', 'partait', 'partions', 'partiez', 'partaient']),
  verb('prendre', '拿；乘坐', 'avoir', 'pris', ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient']),
  verb('mettre', '放；穿', 'avoir', 'mis', ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], ['mettais', 'mettais', 'mettait', 'mettions', 'mettiez', 'mettaient']),
  verb('dire', '说', 'avoir', 'dit', ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient']),
  verb('voir', '看见', 'avoir', 'vu', ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient']),
  verb('sortir', '出去；出来', 'être', 'sorti', ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'], ['sortais', 'sortais', 'sortait', 'sortions', 'sortiez', 'sortaient'], '这里按“不及物：出去”学习，所以 passé composé 使用 être。及物用法如 sortir la poubelle 可使用 avoir。'),
  verb('connaître', '认识；熟悉', 'avoir', 'connu', ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'], ['connaissais', 'connaissais', 'connaissait', 'connaissions', 'connaissiez', 'connaissaient']),
  verb('comprendre', '理解', 'avoir', 'compris', ['comprends', 'comprends', 'comprend', 'comprenons', 'comprenez', 'comprennent'], ['comprenais', 'comprenais', 'comprenait', 'comprenions', 'compreniez', 'comprenaient']),
  verb('apprendre', '学习；得知', 'avoir', 'appris', ['apprends', 'apprends', 'apprend', 'apprenons', 'apprenez', 'apprennent'], ['apprenais', 'apprenais', 'apprenait', 'apprenions', 'appreniez', 'apprenaient']),
  verb('écrire', '写', 'avoir', 'écrit', ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'], ['écrivais', 'écrivais', 'écrivait', 'écrivions', 'écriviez', 'écrivaient']),
  verb('lire', '读', 'avoir', 'lu', ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'], ['lisais', 'lisais', 'lisait', 'lisions', 'lisiez', 'lisaient']),
  verb('boire', '喝', 'avoir', 'bu', ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'], ['buvais', 'buvais', 'buvait', 'buvions', 'buviez', 'buvaient']),
  verb('dormir', '睡觉', 'avoir', 'dormi', ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'], ['dormais', 'dormais', 'dormait', 'dormions', 'dormiez', 'dormaient']),
  verb('attendre', '等待', 'avoir', 'attendu', ['attends', 'attends', 'attend', 'attendons', 'attendez', 'attendent'], ['attendais', 'attendais', 'attendait', 'attendions', 'attendiez', 'attendaient']),
  verb('répondre', '回答；回复', 'avoir', 'répondu', ['réponds', 'réponds', 'répond', 'répondons', 'répondez', 'répondent'], ['répondais', 'répondais', 'répondait', 'répondions', 'répondiez', 'répondaient']),
  verb('finir', '结束；完成', 'avoir', 'fini', ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'], ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient']),
  verb('choisir', '选择', 'avoir', 'choisi', ['choisis', 'choisis', 'choisit', 'choisissons', 'choisissez', 'choisissent'], ['choisissais', 'choisissais', 'choisissait', 'choisissions', 'choisissiez', 'choisissaient']),
  verb('travailler', '工作', 'avoir', 'travaillé', ['travaille', 'travailles', 'travaille', 'travaillons', 'travaillez', 'travaillent'], ['travaillais', 'travaillais', 'travaillait', 'travaillions', 'travailliez', 'travaillaient']),
  verb('parler', '说话；交谈', 'avoir', 'parlé', ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'], ['parlais', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient']),
  verb('manger', '吃', 'avoir', 'mangé', ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'], ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient']),
  seLever,
]

export const defaultConjugationVerb = frenchVerbs.find((item) => item.infinitive === 'prendre') ?? frenchVerbs[0]
