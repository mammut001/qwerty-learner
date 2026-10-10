import type {
  ConjugatedPersonForm,
  ConjugationResult,
  TenseId,
} from './types'
import { UnsupportedVerbError } from './types'

export const TENSE_LABELS: Record<TenseId, { fr: string; zh: string }> = {
  present: { fr: 'Présent de l’indicatif', zh: '直陈式现在时' },
  passeCompose: { fr: 'Passé composé', zh: '复合过去时' },
  imparfait: { fr: 'Imparfait', zh: '未完成过去时' },
  plusQueParfait: { fr: 'Plus-que-parfait', zh: '愈过去时' },
  futurProche: { fr: 'Futur proche', zh: '最近将来时' },
  futurSimple: { fr: 'Futur simple', zh: '简单将来时' },
  futurAnterieur: { fr: 'Futur antérieur', zh: '先将来时' },
  passeRecent: { fr: 'Passé récent', zh: '最近过去时' },
  conditionnelPresent: { fr: 'Conditionnel présent', zh: '条件式现在时' },
  conditionnelPasse: { fr: 'Conditionnel passé', zh: '条件式过去时' },
  subjonctifPresent: { fr: 'Subjonctif présent', zh: '虚拟式现在时' },
  subjonctifPasse: { fr: 'Subjonctif passé', zh: '虚拟式过去时' },
  imperatif: { fr: 'Impératif présent', zh: '命令式现在时' },
  passeSimple: { fr: 'Passé simple', zh: '简单过去时' },
  gerondif: { fr: 'Gérondif', zh: '副动词' },
}

// 17 DR MRS VANDERTRAMP verbs taking être
const ETRE_VERBS = new Set([
  'devenir',
  'revenir',
  'monter',
  'rester',
  'sortir',
  'venir',
  'aller',
  'naître',
  'descendre',
  'entrer',
  'rentrer',
  'tomber',
  'retourner',
  'arriver',
  'mourir',
  'partir',
  'passer',
])

// Dual auxiliary verbs: default to être, take avoir with direct object (COD)
const DUAL_AUXILIARY_VERBS = new Set([
  'monter',
  'descendre',
  'sortir',
  'passer',
  'rentrer',
  'retourner',
])

const IMPERSONAL_VERBS = new Set(['falloir', 'pleuvoir'])

export const SECOND_GROUP_VERBS = new Set([
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
])

const REGULAR_DRE_VERBS = new Set([
  'vendre',
  'attendre',
  'répondre',
  'entendre',
  'perdre',
  'rendre',
  'descendre',
  'confondre',
  'correspondre',
  'défendre',
  'dépendre',
  'détendre',
  'fendre',
  'fondre',
  'mordre',
  'pendre',
  'prétendre',
  'suspendre',
  'tendre',
  'tondre',
  'tordre',
])

const ACHETER_PELER_SET = new Set([
  'acheter',
  'racheter',
  'geler',
  'dégeler',
  'surgeler',
  'congeler',
  'peler',
  'remouler',
  'modeler',
  'ciseler',
  'marteler',
  'crocheter',
  'fileter',
])

type IrregularVerbDef = {
  participePresent: string
  participePasse: string
  auxiliary?: 'avoir' | 'être' | 'avoir / être'
  present: [string, string, string, string, string, string] | [string]
  imparfait: [string, string, string, string, string, string] | [string]
  futurSimple: [string, string, string, string, string, string] | [string]
  conditionnelPresent: [string, string, string, string, string, string] | [string]
  subjonctifPresent: [string, string, string, string, string, string] | [string]
  imperatif?: [string, string, string]
  passeSimple: [string, string, string, string, string, string] | [string]
}

const IRREGULAR_VERBS: Record<string, IrregularVerbDef> = {
  être: {
    participePresent: 'étant',
    participePasse: 'été',
    auxiliary: 'avoir',
    present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    futurSimple: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    conditionnelPresent: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
    subjonctifPresent: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
    imperatif: ['sois', 'soyons', 'soyez'],
    passeSimple: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'],
  },
  avoir: {
    participePresent: 'ayant',
    participePasse: 'eu',
    auxiliary: 'avoir',
    present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    futurSimple: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
    conditionnelPresent: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
    subjonctifPresent: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
    imperatif: ['aie', 'ayons', 'ayez'],
    passeSimple: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'],
  },
  aller: {
    participePresent: 'allant',
    participePasse: 'allé',
    auxiliary: 'être',
    present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    imparfait: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
    futurSimple: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
    conditionnelPresent: ['irais', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
    subjonctifPresent: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
    imperatif: ['va', 'allons', 'allez'],
    passeSimple: ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'],
  },
  faire: {
    participePresent: 'faisant',
    participePasse: 'fait',
    auxiliary: 'avoir',
    present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    imparfait: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
    futurSimple: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
    conditionnelPresent: ['ferais', 'ferais', 'ferait', 'ferions', 'feriez', 'feraient'],
    subjonctifPresent: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
    imperatif: ['fais', 'faisons', 'faites'],
    passeSimple: ['fis', 'fis', 'fit', 'fîmes', 'fîtes', 'firent'],
  },
  pouvoir: {
    participePresent: 'pouvant',
    participePasse: 'pu',
    auxiliary: 'avoir',
    present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
    imparfait: ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'],
    futurSimple: ['pourrai', 'pourras', 'pourra', 'pourrons', 'pourrez', 'pourront'],
    conditionnelPresent: ['pourrais', 'pourrais', 'pourrait', 'pourrions', 'pourriez', 'pourraient'],
    subjonctifPresent: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
    imperatif: undefined,
    passeSimple: ['pus', 'pus', 'put', 'pûmes', 'pûtes', 'purent'],
  },
  vouloir: {
    participePresent: 'voulant',
    participePasse: 'voulu',
    auxiliary: 'avoir',
    present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
    imparfait: ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient'],
    futurSimple: ['voudrai', 'voudras', 'voudra', 'voudrons', 'voudrez', 'voudront'],
    conditionnelPresent: ['voudrais', 'voudrais', 'voudrait', 'voudrions', 'voudriez', 'voudraient'],
    subjonctifPresent: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
    imperatif: ['veuille', 'veuillons', 'veuillez'],
    passeSimple: ['voulus', 'voulus', 'voulut', 'voulûmes', 'voulûtes', 'voulurent'],
  },
  devoir: {
    participePresent: 'devant',
    participePasse: 'dû',
    auxiliary: 'avoir',
    present: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
    imparfait: ['devais', 'devais', 'devait', 'devions', 'deviez', 'devaient'],
    futurSimple: ['devrai', 'devras', 'devra', 'devrons', 'devrez', 'devront'],
    conditionnelPresent: ['devrais', 'devrais', 'devrait', 'devrions', 'devriez', 'devraient'],
    subjonctifPresent: ['doive', 'doives', 'doive', 'devions', 'deviez', 'doivent'],
    imperatif: ['dois', 'devons', 'devez'],
    passeSimple: ['dus', 'dus', 'dut', 'dûmes', 'dûtes', 'durent'],
  },
  savoir: {
    participePresent: 'sachant',
    participePasse: 'su',
    auxiliary: 'avoir',
    present: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
    imparfait: ['savais', 'savais', 'savait', 'savions', 'saviez', 'savaient'],
    futurSimple: ['saurai', 'sauras', 'saura', 'saurons', 'saurez', 'sauront'],
    conditionnelPresent: ['saurais', 'saurais', 'saurait', 'saurions', 'sauriez', 'sauraient'],
    subjonctifPresent: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
    imperatif: ['sache', 'sachons', 'sachez'],
    passeSimple: ['sus', 'sus', 'sut', 'sûmes', 'sûtes', 'surent'],
  },
  venir: {
    participePresent: 'venant',
    participePasse: 'venu',
    auxiliary: 'être',
    present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
    imparfait: ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'],
    futurSimple: ['viendrai', 'viendras', 'viendra', 'viendrons', 'viendrez', 'viendront'],
    conditionnelPresent: ['viendrais', 'viendrais', 'viendrait', 'viendrions', 'viendriez', 'viendraient'],
    subjonctifPresent: ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent'],
    imperatif: ['viens', 'venons', 'venez'],
    passeSimple: ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent'],
  },
  tenir: {
    participePresent: 'tenant',
    participePasse: 'tenu',
    auxiliary: 'avoir',
    present: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'],
    imparfait: ['tenais', 'tenais', 'tenait', 'tenions', 'teniez', 'tenaient'],
    futurSimple: ['tiendrai', 'tiendras', 'tiendra', 'tiendrons', 'tiendrez', 'tiendront'],
    conditionnelPresent: ['tiendrais', 'tiendrais', 'tiendrait', 'tiendrions', 'tiendriez', 'tiendraient'],
    subjonctifPresent: ['tienne', 'tiennes', 'tienne', 'tenions', 'teniez', 'tiennent'],
    imperatif: ['tiens', 'tenons', 'tenez'],
    passeSimple: ['tins', 'tins', 'tint', 'tînmes', 'tîntes', 'tinrent'],
  },
  prendre: {
    participePresent: 'prenant',
    participePasse: 'pris',
    auxiliary: 'avoir',
    present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
    imparfait: ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
    futurSimple: ['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'],
    conditionnelPresent: ['prendrais', 'prendrais', 'prendrait', 'prendrions', 'prendriez', 'prendraient'],
    subjonctifPresent: ['prenne', 'prennes', 'prenne', 'prenions', 'preniez', 'prennent'],
    imperatif: ['prends', 'prenons', 'prenez'],
    passeSimple: ['pris', 'pris', 'prit', 'prîmes', 'prîtes', 'prirent'],
  },
  mettre: {
    participePresent: 'mettant',
    participePasse: 'mis',
    auxiliary: 'avoir',
    present: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'],
    imparfait: ['mettais', 'mettais', 'mettait', 'mettions', 'mettiez', 'mettaient'],
    futurSimple: ['mettrai', 'mettras', 'mettra', 'mettrons', 'mettrez', 'mettront'],
    conditionnelPresent: ['mettrais', 'mettrais', 'mettrait', 'mettrions', 'mettriez', 'mettraient'],
    subjonctifPresent: ['mette', 'mettes', 'mette', 'mettions', 'mettiez', 'mettent'],
    imperatif: ['mets', 'mettons', 'mettez'],
    passeSimple: ['mis', 'mis', 'mit', 'mîmes', 'mîtes', 'mirent'],
  },
  dire: {
    participePresent: 'disant',
    participePasse: 'dit',
    auxiliary: 'avoir',
    present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
    imparfait: ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient'],
    futurSimple: ['dirai', 'diras', 'dira', 'dirons', 'direz', 'diront'],
    conditionnelPresent: ['dirais', 'dirais', 'dirait', 'dirions', 'diriez', 'diraient'],
    subjonctifPresent: ['dise', 'dises', 'dise', 'disions', 'disiez', 'disent'],
    imperatif: ['dis', 'disons', 'dites'],
    passeSimple: ['dis', 'dis', 'dit', 'dîmes', 'dîtes', 'dirent'],
  },
  voir: {
    participePresent: 'voyant',
    participePasse: 'vu',
    auxiliary: 'avoir',
    present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
    imparfait: ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient'],
    futurSimple: ['verrai', 'verras', 'verra', 'verrons', 'verrez', 'verront'],
    conditionnelPresent: ['verrais', 'verrais', 'verrait', 'verrions', 'verriez', 'verraient'],
    subjonctifPresent: ['voie', 'voies', 'voie', 'voyions', 'voyiez', 'voient'],
    imperatif: ['vois', 'voyons', 'voyez'],
    passeSimple: ['vis', 'vis', 'vit', 'vîmes', 'vîtes', 'virent'],
  },
  partir: {
    participePresent: 'partant',
    participePasse: 'parti',
    auxiliary: 'être',
    present: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
    imparfait: ['partais', 'partais', 'partait', 'partions', 'partiez', 'partaient'],
    futurSimple: ['partirai', 'partiras', 'partira', 'partirons', 'partirez', 'partiront'],
    conditionnelPresent: ['partirais', 'partirais', 'partirait', 'partirions', 'partiriez', 'partiraient'],
    subjonctifPresent: ['parte', 'partes', 'parte', 'partions', 'partiez', 'partent'],
    imperatif: ['pars', 'partons', 'partez'],
    passeSimple: ['partis', 'partis', 'partit', 'partîmes', 'partîtes', 'partirent'],
  },
  sortir: {
    participePresent: 'sortant',
    participePasse: 'sorti',
    auxiliary: 'avoir / être',
    present: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
    imparfait: ['sortais', 'sortais', 'sortait', 'sortions', 'sortiez', 'sortaient'],
    futurSimple: ['sortirai', 'sortiras', 'sortira', 'sortirons', 'sortirez', 'sortiront'],
    conditionnelPresent: ['sortirais', 'sortirais', 'sortirait', 'sortirions', 'sortiriez', 'sortiraient'],
    subjonctifPresent: ['sorte', 'sortes', 'sorte', 'sortions', 'sortiez', 'sortent'],
    imperatif: ['sors', 'sortons', 'sortez'],
    passeSimple: ['sortis', 'sortis', 'sortit', 'sortîmes', 'sortîtes', 'sortirent'],
  },
  dormir: {
    participePresent: 'dormant',
    participePasse: 'dormi',
    auxiliary: 'avoir',
    present: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'],
    imparfait: ['dormais', 'dormais', 'dormait', 'dormions', 'dormiez', 'dormaient'],
    futurSimple: ['dormirai', 'dormiras', 'dormira', 'dormirons', 'dormirez', 'dormiront'],
    conditionnelPresent: ['dormirais', 'dormirais', 'dormirait', 'dormirions', 'dormiriez', 'dormiraient'],
    subjonctifPresent: ['dorme', 'dormes', 'dorme', 'dormions', 'dormiez', 'dorment'],
    imperatif: ['dors', 'dormons', 'dormez'],
    passeSimple: ['dormis', 'dormis', 'dormit', 'dormîmes', 'dormîtes', 'dormirent'],
  },
  lire: {
    participePresent: 'lisant',
    participePasse: 'lu',
    auxiliary: 'avoir',
    present: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'],
    imparfait: ['lisais', 'lisais', 'lisait', 'lisions', 'lisiez', 'lisaient'],
    futurSimple: ['lirai', 'liras', 'lira', 'lirons', 'lirez', 'liront'],
    conditionnelPresent: ['lirais', 'lirais', 'lirait', 'lirions', 'liriez', 'liraient'],
    subjonctifPresent: ['lise', 'lises', 'lise', 'lisions', 'lisiez', 'lisent'],
    imperatif: ['lis', 'lisons', 'lisez'],
    passeSimple: ['lus', 'lus', 'lut', 'lûmes', 'lûtes', 'lurent'],
  },
  écrire: {
    participePresent: 'écrivant',
    participePasse: 'écrit',
    auxiliary: 'avoir',
    present: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'],
    imparfait: ['écrivais', 'écrivais', 'écrivait', 'écrivions', 'écriviez', 'écrivaient'],
    futurSimple: ['écrirai', 'écriras', 'écrira', 'écrirons', 'écrirez', 'écriront'],
    conditionnelPresent: ['écrirais', 'écrirais', 'écrirait', 'écririons', 'écririez', 'écriraient'],
    subjonctifPresent: ['écrive', 'écrives', 'écrive', 'écrivions', 'écriviez', 'écrivent'],
    imperatif: ['écris', 'écrivons', 'écrivez'],
    passeSimple: ['écrivis', 'écrivis', 'écrivit', 'écrivîmes', 'écrivîtes', 'écrivirent'],
  },
  boire: {
    participePresent: 'buvant',
    participePasse: 'bu',
    auxiliary: 'avoir',
    present: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'],
    imparfait: ['buvais', 'buvais', 'buvait', 'buvions', 'buviez', 'buvaient'],
    futurSimple: ['boirai', 'boiras', 'boira', 'boirons', 'boirez', 'boiront'],
    conditionnelPresent: ['boirais', 'boirais', 'boirait', 'boirions', 'boiriez', 'boiraient'],
    subjonctifPresent: ['boive', 'boives', 'boive', 'buvions', 'buviez', 'boivent'],
    imperatif: ['bois', 'buvons', 'buvez'],
    passeSimple: ['bus', 'bus', 'but', 'bûmes', 'bûtes', 'burent'],
  },
  connaître: {
    participePresent: 'connaissant',
    participePasse: 'connu',
    auxiliary: 'avoir',
    present: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'],
    imparfait: ['connaissais', 'connaissais', 'connaissait', 'connaissions', 'connaissiez', 'connaissaient'],
    futurSimple: ['connaîtrai', 'connaîtras', 'connaîtra', 'connaîtrons', 'connaîtrez', 'connaîtront'],
    conditionnelPresent: ['connaîtrais', 'connaîtrais', 'connaîtrait', 'connaîtrions', 'connaîtriez', 'connaîtraient'],
    subjonctifPresent: ['connaisse', 'connaisses', 'connaisse', 'connaissions', 'connaissiez', 'connaissent'],
    imperatif: ['connais', 'connaissons', 'connaissez'],
    passeSimple: ['connus', 'connus', 'connut', 'connûmes', 'connûtes', 'connurent'],
  },
  recevoir: {
    participePresent: 'recevant',
    participePasse: 'reçu',
    auxiliary: 'avoir',
    present: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'],
    imparfait: ['recevais', 'recevais', 'recevait', 'recevions', 'receviez', 'recevaient'],
    futurSimple: ['recevrai', 'recevras', 'recevra', 'recevrons', 'recevrez', 'recevront'],
    conditionnelPresent: ['recevrais', 'recevrais', 'recevrait', 'recevrions', 'recevriez', 'recevraient'],
    subjonctifPresent: ['reçoive', 'reçoives', 'reçoive', 'recevions', 'receviez', 'reçoivent'],
    imperatif: ['reçois', 'recevons', 'recevez'],
    passeSimple: ['reçus', 'reçus', 'reçut', 'reçûmes', 'reçûtes', 'reçurent'],
  },
  croire: {
    participePresent: 'croyant',
    participePasse: 'cru',
    auxiliary: 'avoir',
    present: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'],
    imparfait: ['croyais', 'croyais', 'croyait', 'croyions', 'croyiez', 'croyaient'],
    futurSimple: ['croirai', 'croiras', 'croira', 'croirons', 'croirez', 'croiront'],
    conditionnelPresent: ['croirais', 'croirais', 'croirait', 'croirions', 'croiriez', 'croiraient'],
    subjonctifPresent: ['croie', 'croies', 'croie', 'croyions', 'croyiez', 'croient'],
    imperatif: ['crois', 'croyons', 'croyez'],
    passeSimple: ['crus', 'crus', 'crut', 'crûmes', 'crûtes', 'crurent'],
  },
  vivre: {
    participePresent: 'vivant',
    participePasse: 'vécu',
    auxiliary: 'avoir',
    present: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'],
    imparfait: ['vivais', 'vivais', 'vivait', 'vivions', 'viviez', 'vivaient'],
    futurSimple: ['vivrai', 'vivras', 'vivra', 'vivrons', 'vivrez', 'vivront'],
    conditionnelPresent: ['vivrais', 'vivrais', 'vivrait', 'vivrions', 'vivriez', 'vivraient'],
    subjonctifPresent: ['vive', 'vives', 'vive', 'vivions', 'viviez', 'vivent'],
    imperatif: ['vis', 'vivons', 'vivez'],
    passeSimple: ['vécus', 'vécus', 'vécut', 'vécûmes', 'vécûtes', 'vécurent'],
  },
  suivre: {
    participePresent: 'suivant',
    participePasse: 'suivi',
    auxiliary: 'avoir',
    present: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'],
    imparfait: ['suivais', 'suivais', 'suivait', 'suivions', 'suiviez', 'suivaient'],
    futurSimple: ['suivrai', 'suivras', 'suivra', 'suivrons', 'suivrez', 'suivront'],
    conditionnelPresent: ['suivrais', 'suivrais', 'suivrait', 'suivrions', 'suivriez', 'suivraient'],
    subjonctifPresent: ['suive', 'suives', 'suive', 'suivions', 'suiviez', 'suivent'],
    imperatif: ['suis', 'suivons', 'suivez'],
    passeSimple: ['suivis', 'suivis', 'suivit', 'suivîmes', 'suivîtes', 'suivirent'],
  },
  ouvrir: {
    participePresent: 'ouvrant',
    participePasse: 'ouvert',
    auxiliary: 'avoir',
    present: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'],
    imparfait: ['ouvrais', 'ouvrais', 'ouvrait', 'ouvrions', 'ouvriez', 'ouvraient'],
    futurSimple: ['ouvrirai', 'ouvriras', 'ouvrira', 'ouvrirons', 'ouvrirez', 'ouvriront'],
    conditionnelPresent: ['ouvrirais', 'ouvrirais', 'ouvrirait', 'ouvririons', 'ouvririez', 'ouvriraient'],
    subjonctifPresent: ['ouvre', 'ouvres', 'ouvre', 'ouvrions', 'ouvriez', 'ouvrent'],
    imperatif: ['ouvre', 'ouvrons', 'ouvrez'],
    passeSimple: ['ouvris', 'ouvris', 'ouvrit', 'ouvrîmes', 'ouvrîtes', 'ouvrirent'],
  },
  offrir: {
    participePresent: 'offrant',
    participePasse: 'offert',
    auxiliary: 'avoir',
    present: ['offre', 'offres', 'offre', 'offrons', 'offrez', 'offrent'],
    imparfait: ['offrais', 'offrais', 'offrait', 'offrions', 'offriez', 'offraient'],
    futurSimple: ['offrirai', 'offriras', 'offrira', 'offrirons', 'offrirez', 'offriront'],
    conditionnelPresent: ['offrirais', 'offrirais', 'offrirait', 'offririons', 'offririez', 'offriraient'],
    subjonctifPresent: ['offre', 'offres', 'offre', 'offrions', 'offriez', 'offrent'],
    imperatif: ['offre', 'offrons', 'offrez'],
    passeSimple: ['offris', 'offris', 'offrit', 'offrîmes', 'offrîtes', 'offrirent'],
  },
  courir: {
    participePresent: 'courant',
    participePasse: 'couru',
    auxiliary: 'avoir',
    present: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'],
    imparfait: ['courais', 'courais', 'courait', 'courions', 'couriez', 'couraient'],
    futurSimple: ['courrai', 'courras', 'courra', 'courrons', 'courrez', 'courront'],
    conditionnelPresent: ['courrais', 'courrais', 'courrait', 'courrions', 'courriez', 'courraient'],
    subjonctifPresent: ['coure', 'coures', 'coure', 'courions', 'couriez', 'courent'],
    imperatif: ['cours', 'courons', 'courez'],
    passeSimple: ['courus', 'courus', 'courut', 'courûmes', 'courûtes', 'coururent'],
  },
  mourir: {
    participePresent: 'mourant',
    participePasse: 'mort',
    auxiliary: 'être',
    present: ['meurs', 'meurs', 'meurt', 'mourons', 'mourez', 'meurent'],
    imparfait: ['mourais', 'mourais', 'mourait', 'mourions', 'mouriez', 'mouraient'],
    futurSimple: ['mourrai', 'mourras', 'mourra', 'mourrons', 'mourrez', 'mourront'],
    conditionnelPresent: ['mourrais', 'mourrais', 'mourrait', 'mourrions', 'mourriez', 'mourraient'],
    subjonctifPresent: ['meure', 'meures', 'meure', 'mourions', 'mouriez', 'meurent'],
    imperatif: ['meurs', 'mourons', 'mourez'],
    passeSimple: ['mourus', 'mourus', 'mourut', 'mourûmes', 'mourûtes', 'moururent'],
  },
  naître: {
    participePresent: 'naissant',
    participePasse: 'né',
    auxiliary: 'être',
    present: ['nais', 'nais', 'naît', 'naissons', 'naissez', 'naissent'],
    imparfait: ['naissais', 'naissais', 'naissait', 'naissions', 'naissiez', 'naissaient'],
    futurSimple: ['naîtrai', 'naîtras', 'naîtra', 'naîtrons', 'naîtrez', 'naîtront'],
    conditionnelPresent: ['naîtrais', 'naîtrais', 'naîtrait', 'naîtrions', 'naîtriez', 'naîtraient'],
    subjonctifPresent: ['naisse', 'naisses', 'naisse', 'naissions', 'naissiez', 'naissent'],
    imperatif: ['nais', 'naissons', 'naissez'],
    passeSimple: ['naquis', 'naquis', 'naquit', 'naquîmes', 'naquîtes', 'naquirent'],
  },
  falloir: {
    participePresent: 'fallant',
    participePasse: 'fallu',
    auxiliary: 'avoir',
    present: ['faut'],
    imparfait: ['fallait'],
    futurSimple: ['faudra'],
    conditionnelPresent: ['faudrait'],
    subjonctifPresent: ['faille'],
    imperatif: undefined,
    passeSimple: ['fallut'],
  },
  pleuvoir: {
    participePresent: 'pleuvant',
    participePasse: 'plu',
    auxiliary: 'avoir',
    present: ['pleut'],
    imparfait: ['pleuvait'],
    futurSimple: ['pleuvra'],
    conditionnelPresent: ['pleuvrait'],
    subjonctifPresent: ['pleuve'],
    imperatif: undefined,
    passeSimple: ['plut'],
  },
  valoir: {
    participePresent: 'valant',
    participePasse: 'valu',
    auxiliary: 'avoir',
    present: ['vaux', 'vaux', 'vaut', 'valons', 'valez', 'valent'],
    imparfait: ['valais', 'valais', 'valait', 'valions', 'valiez', 'valaient'],
    futurSimple: ['vaudrai', 'vaudras', 'vaudra', 'vaudrons', 'vaudrez', 'vaudront'],
    conditionnelPresent: ['vaudrais', 'vaudrais', 'vaudrait', 'vaudrions', 'vaudriez', 'vaudraient'],
    subjonctifPresent: ['vaille', 'vailles', 'vaille', 'valions', 'valiez', 'vaillent'],
    imperatif: ['vaux', 'valons', 'valez'],
    passeSimple: ['valus', 'valus', 'valut', 'valûmes', 'valûtes', 'valurent'],
  },
  plaire: {
    participePresent: 'plaisant',
    participePasse: 'plu',
    auxiliary: 'avoir',
    present: ['plais', 'plais', 'plaît', 'plaisons', 'plaisez', 'plaisent'],
    imparfait: ['plaisais', 'plaisais', 'plaisait', 'plaisions', 'plaisiez', 'plaisaient'],
    futurSimple: ['plairai', 'plairas', 'plaira', 'plairons', 'plairez', 'plairont'],
    conditionnelPresent: ['plairais', 'plairais', 'plairait', 'plairions', 'plairiez', 'plairaient'],
    subjonctifPresent: ['plaise', 'plaises', 'plaise', 'plaisions', 'plaisiez', 'plaisent'],
    imperatif: ['plais', 'plaisons', 'plaisez'],
    passeSimple: ['plus', 'plus', 'plut', 'plûmes', 'plûtes', 'plurent'],
  },
  rire: {
    participePresent: 'riant',
    participePasse: 'ri',
    auxiliary: 'avoir',
    present: ['ris', 'ris', 'rit', 'rions', 'riez', 'rient'],
    imparfait: ['riais', 'riais', 'riait', 'riions', 'riiez', 'riaient'],
    futurSimple: ['rirai', 'riras', 'rira', 'rirons', 'rirez', 'riront'],
    conditionnelPresent: ['rirais', 'rirais', 'rirait', 'ririons', 'ririez', 'riraient'],
    subjonctifPresent: ['rie', 'ries', 'rie', 'riions', 'riiez', 'rient'],
    imperatif: ['ris', 'rions', 'riez'],
    passeSimple: ['ris', 'ris', 'rit', 'rîmes', 'rîtes', 'rirent'],
  },
  conduire: {
    participePresent: 'conduisant',
    participePasse: 'conduit',
    auxiliary: 'avoir',
    present: ['conduis', 'conduis', 'conduit', 'conduisons', 'conduisez', 'conduisent'],
    imparfait: ['conduisais', 'conduisais', 'conduisait', 'conduisions', 'conduisiez', 'conduisaient'],
    futurSimple: ['conduirai', 'conduiras', 'conduira', 'conduirons', 'conduirez', 'conduiront'],
    conditionnelPresent: ['conduirais', 'conduirais', 'conduirait', 'conduirions', 'conduiriez', 'conduiraient'],
    subjonctifPresent: ['conduise', 'conduises', 'conduise', 'conduisions', 'conduisiez', 'conduisent'],
    imperatif: ['conduis', 'conduisons', 'conduisez'],
    passeSimple: ['conduisis', 'conduisis', 'conduisit', 'conduisîmes', 'conduisîtes', 'conduisirent'],
  },
  craindre: {
    participePresent: 'craignant',
    participePasse: 'craint',
    auxiliary: 'avoir',
    present: ['crains', 'crains', 'craint', 'craignons', 'craignez', 'craignent'],
    imparfait: ['craignais', 'craignais', 'craignait', 'craignions', 'craigniez', 'craignaient'],
    futurSimple: ['craindrai', 'craindras', 'craindra', 'craindrons', 'craindrez', 'craindront'],
    conditionnelPresent: ['craindrais', 'craindrais', 'craindrait', 'craindrions', 'craindriez', 'craindraient'],
    subjonctifPresent: ['craigne', 'craignes', 'craigne', 'craignions', 'craigniez', 'craignent'],
    imperatif: ['crains', 'craignons', 'craignez'],
    passeSimple: ['craignis', 'craignis', 'craignit', 'craignîmes', 'craignîtes', 'craignirent'],
  },
  peindre: {
    participePresent: 'peignant',
    participePasse: 'peint',
    auxiliary: 'avoir',
    present: ['peins', 'peins', 'peint', 'peignons', 'peignez', 'peignent'],
    imparfait: ['peignais', 'peignais', 'peignait', 'peignions', 'peigniez', 'peignaient'],
    futurSimple: ['peindrai', 'peindras', 'peindra', 'peindrons', 'peindrez', 'peindront'],
    conditionnelPresent: ['peindrais', 'peindrais', 'peindrait', 'peindrions', 'peindriez', 'peindraient'],
    subjonctifPresent: ['peigne', 'peignes', 'peigne', 'peignions', 'peigniez', 'peignent'],
    imperatif: ['peins', 'peignons', 'peignez'],
    passeSimple: ['peignis', 'peignis', 'peignit', 'peignîmes', 'peignîtes', 'peignirent'],
  },
  joindre: {
    participePresent: 'joignant',
    participePasse: 'joint',
    auxiliary: 'avoir',
    present: ['joins', 'joins', 'joint', 'joignons', 'joignez', 'joignent'],
    imparfait: ['joignais', 'joignais', 'joignait', 'joignions', 'joigniez', 'joignaient'],
    futurSimple: ['joindrai', 'joindras', 'joindra', 'joindrons', 'joindrez', 'joindront'],
    conditionnelPresent: ['joindrais', 'joindrais', 'joindrait', 'joindrions', 'joindriez', 'joindraient'],
    subjonctifPresent: ['joigne', 'joignes', 'joigne', 'joignions', 'joigniez', 'joignent'],
    imperatif: ['joins', 'joignons', 'joignez'],
    passeSimple: ['joignis', 'joignis', 'joignit', 'joignîmes', 'joignîtes', 'joignirent'],
  },
  envoyer: {
    participePresent: 'envoyant',
    participePasse: 'envoyé',
    auxiliary: 'avoir',
    present: ['envoie', 'envoies', 'envoie', 'envoyons', 'envoyez', 'envoient'],
    imparfait: ['envoyais', 'envoyais', 'envoyait', 'envoyions', 'envoyiez', 'envoyaient'],
    futurSimple: ['enverrai', 'enverras', 'enverra', 'enverrons', 'enverrez', 'enverront'],
    conditionnelPresent: ['enverrais', 'enverrais', 'enverrait', 'enverrions', 'enverriez', 'enverraient'],
    subjonctifPresent: ['envoie', 'envoies', 'envoie', 'envoyions', 'envoyiez', 'envoient'],
    imperatif: ['envoie', 'envoyons', 'envoyez'],
    passeSimple: ['envoyai', 'envoyas', 'envoya', 'envoyâmes', 'envoyâtes', 'envoyèrent'],
  },
  's’asseoir': {
    participePresent: 'asseyant',
    participePasse: 'assis',
    auxiliary: 'être',
    present: ['assieds', 'assieds', 'assied', 'asseyons', 'asseyez', 'asseyent'],
    imparfait: ['asseyais', 'asseyais', 'asseyait', 'asseyions', 'asseyiez', 'asseyaient'],
    futurSimple: ['assiérai', 'assiéras', 'assiéra', 'assiérons', 'assiérez', 'assiéront'],
    conditionnelPresent: ['assiérais', 'assiérais', 'assiérait', 'assiérions', 'assiériez', 'assiéraient'],
    subjonctifPresent: ['asseye', 'asseyes', 'asseye', 'asseyions', 'asseyiez', 'asseyent'],
    imperatif: ['assieds', 'asseyons', 'asseyez'],
    passeSimple: ['assis', 'assis', 'assit', 'assîmes', 'assîtes', 'assirent'],
  },
  attendre: {
    participePresent: 'attendant',
    participePasse: 'attendu',
    auxiliary: 'avoir',
    present: ['attends', 'attends', 'attend', 'attendons', 'attendez', 'attendent'],
    imparfait: ['attendais', 'attendais', 'attendait', 'attendions', 'attendiez', 'attendaient'],
    futurSimple: ['attendrai', 'attendras', 'attendra', 'attendrons', 'attendrez', 'attendront'],
    conditionnelPresent: ['attendrais', 'attendrais', 'attendrait', 'attendrions', 'attendriez', 'attendraient'],
    subjonctifPresent: ['attende', 'attendes', 'attende', 'attendions', 'attendiez', 'attendent'],
    imperatif: ['attends', 'attendons', 'attendez'],
    passeSimple: ['attendis', 'attendis', 'attendit', 'attendîmes', 'attendîtes', 'attendirent'],
  },
  répondre: {
    participePresent: 'répondant',
    participePasse: 'répondu',
    auxiliary: 'avoir',
    present: ['réponds', 'réponds', 'répond', 'répondons', 'répondez', 'répondent'],
    imparfait: ['répondais', 'répondais', 'répondait', 'répondions', 'répondiez', 'répondaient'],
    futurSimple: ['répondrai', 'répondras', 'répondra', 'répondrons', 'répondrez', 'répondront'],
    conditionnelPresent: ['répondrais', 'répondrais', 'répondrait', 'répondrions', 'répondriez', 'répondraient'],
    subjonctifPresent: ['réponde', 'répondes', 'réponde', 'répondions', 'répondiez', 'répondent'],
    imperatif: ['réponds', 'répondons', 'répondez'],
    passeSimple: ['répondis', 'répondis', 'répondit', 'répondîmes', 'répondîtes', 'répondirent'],
  },
  entendre: {
    participePresent: 'entendant',
    participePasse: 'entendu',
    auxiliary: 'avoir',
    present: ['entends', 'entends', 'entend', 'entendons', 'entendez', 'entendent'],
    imparfait: ['entendais', 'entendais', 'entendait', 'entendions', 'entendiez', 'entendaient'],
    futurSimple: ['entendrai', 'entendras', 'entendra', 'entendrons', 'entendrez', 'entendront'],
    conditionnelPresent: ['entendrais', 'entendrais', 'entendrait', 'entendrions', 'entendriez', 'entendraient'],
    subjonctifPresent: ['entende', 'entendes', 'entende', 'entendions', 'entendiez', 'entendent'],
    imperatif: ['entends', 'entendons', 'entendez'],
    passeSimple: ['entendis', 'entendis', 'entendit', 'entendîmes', 'entendîtes', 'entendirent'],
  },
  perdre: {
    participePresent: 'perdant',
    participePasse: 'perdu',
    auxiliary: 'avoir',
    present: ['perds', 'perds', 'perd', 'perdons', 'perdez', 'perdent'],
    imparfait: ['perdais', 'perdais', 'perdait', 'perdions', 'perdiez', 'perdaient'],
    futurSimple: ['perdrai', 'perdras', 'perdra', 'perdrons', 'perdrez', 'perdront'],
    conditionnelPresent: ['perdrais', 'perdrais', 'perdrait', 'perdrions', 'perdriez', 'perdraient'],
    subjonctifPresent: ['perde', 'perdes', 'perde', 'perdions', 'perdiez', 'perdent'],
    imperatif: ['perds', 'perdons', 'perdez'],
    passeSimple: ['perdis', 'perdis', 'perdit', 'perdîmes', 'perdîtes', 'perdirent'],
  },
  descendre: {
    participePresent: 'descendant',
    participePasse: 'descendu',
    auxiliary: 'avoir / être',
    present: ['descends', 'descends', 'descend', 'descendons', 'descendez', 'descendent'],
    imparfait: ['descendais', 'descendais', 'descendait', 'descendions', 'descendiez', 'descendaient'],
    futurSimple: ['descendrai', 'descendras', 'descendra', 'descendrons', 'descendrez', 'descendront'],
    conditionnelPresent: ['descendrais', 'descendrais', 'descendrait', 'descendrions', 'descendriez', 'descendraient'],
    subjonctifPresent: ['descende', 'descendes', 'descende', 'descendions', 'descendiez', 'descendent'],
    imperatif: ['descends', 'descendons', 'descendez'],
    passeSimple: ['descendis', 'descendis', 'descendit', 'descendîmes', 'descendîtes', 'descendirent'],
  },
  rendre: {
    participePresent: 'rendant',
    participePasse: 'rendu',
    auxiliary: 'avoir',
    present: ['rends', 'rends', 'rend', 'rendons', 'rendez', 'rendent'],
    imparfait: ['rendais', 'rendais', 'rendait', 'rendions', 'rendiez', 'rendaient'],
    futurSimple: ['rendrai', 'rendras', 'rendra', 'rendrons', 'rendrez', 'rendront'],
    conditionnelPresent: ['rendrais', 'rendrais', 'rendrait', 'rendrions', 'rendriez', 'rendraient'],
    subjonctifPresent: ['rende', 'rendes', 'rende', 'rendions', 'rendiez', 'rendent'],
    imperatif: ['rends', 'rendons', 'rendez'],
    passeSimple: ['rendis', 'rendis', 'rendit', 'rendîmes', 'rendîtes', 'rendirent'],
  },

  // Additional high-frequency irregular verbs (Section A.12)
  sentir: {
    participePresent: 'sentant',
    participePasse: 'senti',
    auxiliary: 'avoir',
    present: ['sens', 'sens', 'sent', 'sentons', 'sentez', 'sentent'],
    imparfait: ['sentais', 'sentais', 'sentait', 'sentions', 'sentiez', 'sentaient'],
    futurSimple: ['sentirai', 'sentiras', 'sentira', 'sentirons', 'sentirez', 'sentiront'],
    conditionnelPresent: ['sentirais', 'sentirais', 'sentirait', 'sentirions', 'sentiriez', 'sentiraient'],
    subjonctifPresent: ['sente', 'sentes', 'sente', 'sentions', 'sentiez', 'sentent'],
    imperatif: ['sens', 'sentons', 'sentez'],
    passeSimple: ['sentis', 'sentis', 'sentit', 'sentîmes', 'sentîtes', 'sentirent'],
  },
  servir: {
    participePresent: 'servant',
    participePasse: 'servi',
    auxiliary: 'avoir',
    present: ['sers', 'sers', 'sert', 'servons', 'servez', 'servent'],
    imparfait: ['servais', 'servais', 'servait', 'servions', 'serviez', 'servaient'],
    futurSimple: ['servirai', 'serviras', 'servira', 'servirons', 'servirez', 'serviront'],
    conditionnelPresent: ['servirais', 'servirais', 'servirait', 'servirions', 'serviriez', 'serviraient'],
    subjonctifPresent: ['serve', 'serves', 'serve', 'servions', 'serviez', 'servent'],
    imperatif: ['sers', 'servons', 'servez'],
    passeSimple: ['servis', 'servis', 'servit', 'servîmes', 'servîtes', 'servirent'],
  },
  mentir: {
    participePresent: 'mentant',
    participePasse: 'menti',
    auxiliary: 'avoir',
    present: ['mens', 'mens', 'ment', 'mentons', 'mentez', 'mentent'],
    imparfait: ['mentais', 'mentais', 'mentait', 'mentions', 'mentiez', 'mentaient'],
    futurSimple: ['mentirai', 'mentiras', 'mentira', 'mentirons', 'mentirez', 'mentiront'],
    conditionnelPresent: ['mentirais', 'mentirais', 'mentirait', 'mentirions', 'mentiriez', 'mentiraient'],
    subjonctifPresent: ['mente', 'mentes', 'mente', 'mentions', 'mentiez', 'mentent'],
    imperatif: ['mens', 'mentons', 'mentez'],
    passeSimple: ['mentis', 'mentis', 'mentit', 'mentîmes', 'mentîtes', 'mentirent'],
  },
  découvrir: {
    participePresent: 'découvrant',
    participePasse: 'découvert',
    auxiliary: 'avoir',
    present: ['découvre', 'découvres', 'découvre', 'découvrons', 'découvrez', 'découvrent'],
    imparfait: ['découvrais', 'découvrais', 'découvrait', 'découvrions', 'découvriez', 'découvraient'],
    futurSimple: ['découvrirai', 'découvriras', 'découvrira', 'découvrirons', 'découvrirez', 'découvriront'],
    conditionnelPresent: ['découvrirais', 'découvrirais', 'découvrirait', 'découvririons', 'découvririez', 'découvriraient'],
    subjonctifPresent: ['découvre', 'découvres', 'découvre', 'découvrions', 'découvriez', 'découvrent'],
    imperatif: ['découvre', 'découvrons', 'découvrez'],
    passeSimple: ['découvris', 'découvris', 'découvrit', 'découvrîmes', 'découvrîtes', 'découvrirent'],
  },
  souffrir: {
    participePresent: 'souffrant',
    participePasse: 'souffert',
    auxiliary: 'avoir',
    present: ['souffre', 'souffres', 'souffre', 'souffrons', 'souffrez', 'souffrent'],
    imparfait: ['souffrais', 'souffrais', 'souffrait', 'souffrions', 'souffriez', 'souffraient'],
    futurSimple: ['souffrirai', 'souffriras', 'souffrira', 'souffrirons', 'souffrirez', 'souffriront'],
    conditionnelPresent: ['souffrirais', 'souffrirais', 'souffrirait', 'souffririons', 'souffririez', 'souffriraient'],
    subjonctifPresent: ['souffre', 'souffres', 'souffre', 'souffrions', 'souffriez', 'souffrent'],
    imperatif: ['souffre', 'souffrons', 'souffrez'],
    passeSimple: ['souffris', 'souffris', 'souffrit', 'souffrîmes', 'souffrîtes', 'souffrirent'],
  },
  produire: {
    participePresent: 'produisant',
    participePasse: 'produit',
    auxiliary: 'avoir',
    present: ['produis', 'produis', 'produit', 'produisons', 'produisez', 'produisent'],
    imparfait: ['produisais', 'produisais', 'produisait', 'produisions', 'produisiez', 'produisaient'],
    futurSimple: ['produirai', 'produiras', 'produira', 'produirons', 'produirez', 'produiront'],
    conditionnelPresent: ['produirais', 'produirais', 'produirait', 'produirions', 'produiriez', 'produiraient'],
    subjonctifPresent: ['produise', 'produises', 'produise', 'produisions', 'produisiez', 'produisent'],
    imperatif: ['produis', 'produisons', 'produisez'],
    passeSimple: ['produisis', 'produisis', 'produisit', 'produisîmes', 'produisîtes', 'produisirent'],
  },
  construire: {
    participePresent: 'construisant',
    participePasse: 'construit',
    auxiliary: 'avoir',
    present: ['construis', 'construis', 'construit', 'construisons', 'construisez', 'construisent'],
    imparfait: ['construisais', 'construisais', 'construisait', 'construisions', 'construisiez', 'construisaient'],
    futurSimple: ['construirai', 'construiras', 'construira', 'construirons', 'construirez', 'construiront'],
    conditionnelPresent: ['construirais', 'construirais', 'construirait', 'construirions', 'construiriez', 'construiraient'],
    subjonctifPresent: ['construise', 'construises', 'construise', 'construisions', 'construisiez', 'construisent'],
    imperatif: ['construis', 'construisons', 'construisez'],
    passeSimple: ['construisis', 'construisis', 'construisit', 'construisîmes', 'construisîtes', 'construisirent'],
  },
  traduire: {
    participePresent: 'traduisant',
    participePasse: 'traduit',
    auxiliary: 'avoir',
    present: ['traduis', 'traduis', 'traduit', 'traduisons', 'traduisez', 'traduisent'],
    imparfait: ['traduisais', 'traduisais', 'traduisait', 'traduisions', 'traduisiez', 'traduisaient'],
    futurSimple: ['traduirai', 'traduiras', 'traduira', 'traduirons', 'traduirez', 'traduiront'],
    conditionnelPresent: ['traduirais', 'traduirais', 'traduirait', 'traduirions', 'traduiriez', 'traduiraient'],
    subjonctifPresent: ['traduise', 'traduises', 'traduise', 'traduisions', 'traduisiez', 'traduisent'],
    imperatif: ['traduis', 'traduisons', 'traduisez'],
    passeSimple: ['traduisis', 'traduisis', 'traduisit', 'traduisîmes', 'traduisîtes', 'traduisirent'],
  },
  détruire: {
    participePresent: 'détruisant',
    participePasse: 'détruit',
    auxiliary: 'avoir',
    present: ['détruis', 'détruis', 'détruit', 'détruisons', 'détruisez', 'détruisent'],
    imparfait: ['détruisais', 'détruisais', 'détruisait', 'détruisions', 'détruisiez', 'détruisaient'],
    futurSimple: ['détruirai', 'détruiras', 'détruira', 'détruirons', 'détruirez', 'détruiront'],
    conditionnelPresent: ['détruirais', 'détruirais', 'détruirait', 'détruirions', 'détruiriez', 'détruiraient'],
    subjonctifPresent: ['détruise', 'détruises', 'détruise', 'détruisions', 'détruisiez', 'détruisent'],
    imperatif: ['détruis', 'détruisons', 'détruisez'],
    passeSimple: ['détruisis', 'détruisis', 'détruisit', 'détruisîmes', 'détruisîtes', 'détruisirent'],
  },
  apparaître: {
    participePresent: 'apparaissant',
    participePasse: 'apparu',
    auxiliary: 'avoir / être',
    present: ['apparais', 'apparais', 'apparaît', 'apparaissons', 'apparaissez', 'apparaissent'],
    imparfait: ['apparaissais', 'apparaissais', 'apparaissait', 'apparaissions', 'apparaissiez', 'apparaissaient'],
    futurSimple: ['apparaîtrai', 'apparaîtras', 'apparaîtra', 'apparaîtrons', 'apparaîtrez', 'apparaîtront'],
    conditionnelPresent: ['apparaîtrais', 'apparaîtrais', 'apparaîtrait', 'apparaîtrions', 'apparaîtriez', 'apparaîtraient'],
    subjonctifPresent: ['apparaisse', 'apparaisses', 'apparaisse', 'apparaissions', 'apparaissiez', 'apparaissent'],
    imperatif: ['apparais', 'apparaissons', 'apparaissez'],
    passeSimple: ['apparus', 'apparus', 'apparut', 'apparûmes', 'apparûtes', 'apparurent'],
  },
  disparaître: {
    participePresent: 'disparaissant',
    participePasse: 'disparu',
    auxiliary: 'avoir',
    present: ['disparais', 'disparais', 'disparaît', 'disparaissons', 'disparaissez', 'disparaissent'],
    imparfait: ['disparaissais', 'disparaissais', 'disparaissait', 'disparaissions', 'disparaissiez', 'disparaissaient'],
    futurSimple: ['disparaîtrai', 'disparaîtras', 'disparaîtra', 'disparaîtrons', 'disparaîtrez', 'disparaîtront'],
    conditionnelPresent: ['disparaîtrais', 'disparaîtrais', 'disparaîtrait', 'disparaîtrions', 'disparaîtriez', 'disparaîtraient'],
    subjonctifPresent: ['disparaisse', 'disparaisses', 'disparaisse', 'disparaissions', 'disparaissiez', 'disparaissent'],
    imperatif: ['disparais', 'disparaissons', 'disparaissez'],
    passeSimple: ['disparus', 'disparus', 'disparut', 'disparûmes', 'disparûtes', 'disparurent'],
  },
  reconnaître: {
    participePresent: 'reconnaissant',
    participePasse: 'reconnu',
    auxiliary: 'avoir',
    present: ['reconnais', 'reconnais', 'reconnaît', 'reconnaissons', 'reconnaissez', 'reconnaissent'],
    imparfait: ['reconnaissais', 'reconnaissais', 'reconnaissait', 'reconnaissions', 'reconnaissiez', 'reconnaissaient'],
    futurSimple: ['reconnaîtrai', 'reconnaîtras', 'reconnaîtra', 'reconnaîtrons', 'reconnaîtrez', 'reconnaîtront'],
    conditionnelPresent: ['reconnaîtrais', 'reconnaîtrais', 'reconnaîtrait', 'reconnaîtrions', 'reconnaîtriez', 'reconnaîtraient'],
    subjonctifPresent: ['reconnaisse', 'reconnaisses', 'reconnaisse', 'reconnaissions', 'reconnaissiez', 'reconnaissent'],
    imperatif: ['reconnais', 'reconnaissons', 'reconnaissez'],
    passeSimple: ['reconnus', 'reconnus', 'reconnut', 'reconnûmes', 'reconnûtes', 'reconnurent'],
  },
  permettre: {
    participePresent: 'permettant',
    participePasse: 'permis',
    auxiliary: 'avoir',
    present: ['permets', 'permets', 'permet', 'permettons', 'permettez', 'permettent'],
    imparfait: ['permettais', 'permettais', 'permettait', 'permettions', 'permettiez', 'permettaient'],
    futurSimple: ['permettrai', 'permettras', 'permettra', 'permettrons', 'permettrez', 'permettront'],
    conditionnelPresent: ['permettrais', 'permettrais', 'permettrait', 'permettrions', 'permettriez', 'permettraient'],
    subjonctifPresent: ['permette', 'permettes', 'permette', 'permettions', 'permettiez', 'permettent'],
    imperatif: ['permets', 'permettons', 'permettez'],
    passeSimple: ['permis', 'permis', 'permit', 'permîmes', 'permîtes', 'permirent'],
  },
  promettre: {
    participePresent: 'promettant',
    participePasse: 'promis',
    auxiliary: 'avoir',
    present: ['promets', 'promets', 'promet', 'promettons', 'promettez', 'promettent'],
    imparfait: ['promettais', 'promettais', 'promettait', 'promettions', 'promettiez', 'promettaient'],
    futurSimple: ['promettrai', 'promettras', 'promettra', 'promettrons', 'promettrez', 'promettront'],
    conditionnelPresent: ['promettrais', 'promettrais', 'promettrait', 'promettrions', 'promettriez', 'promettraient'],
    subjonctifPresent: ['promette', 'promettes', 'promette', 'promettions', 'promettiez', 'promettent'],
    imperatif: ['promets', 'promettons', 'promettez'],
    passeSimple: ['promis', 'promis', 'promit', 'promîmes', 'promîtes', 'promirent'],
  },
  battre: {
    participePresent: 'battant',
    participePasse: 'battu',
    auxiliary: 'avoir',
    present: ['bats', 'bats', 'bat', 'battons', 'battez', 'battent'],
    imparfait: ['battais', 'battais', 'battait', 'battions', 'battiez', 'battaient'],
    futurSimple: ['battrai', 'battras', 'battra', 'battrons', 'battrez', 'battront'],
    conditionnelPresent: ['battrais', 'battrais', 'battrait', 'battrions', 'battriez', 'battraient'],
    subjonctifPresent: ['batte', 'battes', 'batte', 'battions', 'battiez', 'battent'],
    imperatif: ['bats', 'battons', 'battez'],
    passeSimple: ['battis', 'battis', 'battit', 'battîmes', 'battîtes', 'battirent'],
  },
  vaincre: {
    participePresent: 'vainquant',
    participePasse: 'vaincu',
    auxiliary: 'avoir',
    present: ['vaincs', 'vaincs', 'vainc', 'vainquons', 'vainquez', 'vainquent'],
    imparfait: ['vainquais', 'vainquais', 'vainquait', 'vainquions', 'vainquiez', 'vainquaient'],
    futurSimple: ['vaincrai', 'vaincras', 'vaincra', 'vaincrons', 'vaincrez', 'vaincront'],
    conditionnelPresent: ['vaincrais', 'vaincrais', 'vaincrait', 'vaincrions', 'vaincriez', 'vaincraient'],
    subjonctifPresent: ['vainque', 'vainques', 'vainque', 'vainquions', 'vainquiez', 'vainquent'],
    imperatif: ['vaincs', 'vainquons', 'vainquez'],
    passeSimple: ['vainquis', 'vainquis', 'vainquit', 'vainquîmes', 'vainquîtes', 'vainquirent'],
  },
  résoudre: {
    participePresent: 'résolvant',
    participePasse: 'résolu',
    auxiliary: 'avoir',
    present: ['résous', 'résous', 'résout', 'résolvons', 'résolvez', 'résolvent'],
    imparfait: ['résolvais', 'résolvais', 'résolvait', 'résolvions', 'résolviez', 'résolvaient'],
    futurSimple: ['résoudrai', 'résoudras', 'résoudra', 'résoudrons', 'résoudrez', 'résoudront'],
    conditionnelPresent: ['résoudrais', 'résoudrais', 'résoudrait', 'résoudrions', 'résoudriez', 'résoudraient'],
    subjonctifPresent: ['résolve', 'résolves', 'résolve', 'résolvions', 'résolviez', 'résolvent'],
    imperatif: ['résous', 'résolvons', 'résolvez'],
    passeSimple: ['résolus', 'résolus', 'résolut', 'résolûmes', 'résolûtes', 'résolurent'],
  },
  éteindre: {
    participePresent: 'éteignant',
    participePasse: 'éteint',
    auxiliary: 'avoir',
    present: ['éteins', 'éteins', 'éteint', 'éteignons', 'éteignez', 'éteignent'],
    imparfait: ['éteignais', 'éteignais', 'éteignait', 'éteignions', 'éteigniez', 'éteignaient'],
    futurSimple: ['éteindrai', 'éteindras', 'éteindra', 'éteindrons', 'éteindrez', 'éteindront'],
    conditionnelPresent: ['éteindrais', 'éteindrais', 'éteindrait', 'éteindrions', 'éteindriez', 'éteindraient'],
    subjonctifPresent: ['éteigne', 'éteignes', 'éteigne', 'éteignions', 'éteigniez', 'éteignent'],
    imperatif: ['éteins', 'éteignons', 'éteignez'],
    passeSimple: ['éteignis', 'éteignis', 'éteignit', 'éteignîmes', 'éteignîtes', 'éteignirent'],
  },
  atteindre: {
    participePresent: 'atteignant',
    participePasse: 'atteint',
    auxiliary: 'avoir',
    present: ['atteins', 'atteins', 'atteint', 'atteignons', 'atteignez', 'atteignent'],
    imparfait: ['atteignais', 'atteignais', 'atteignait', 'atteignions', 'atteigniez', 'atteignaient'],
    futurSimple: ['atteindrai', 'atteindras', 'atteindra', 'atteindrons', 'atteindrez', 'atteindront'],
    conditionnelPresent: ['atteindrais', 'atteindrais', 'atteindrait', 'atteindrions', 'atteindriez', 'atteindraient'],
    subjonctifPresent: ['atteigne', 'atteignes', 'atteigne', 'atteignions', 'atteigniez', 'atteignent'],
    imperatif: ['atteins', 'atteignons', 'atteignez'],
    passeSimple: ['atteignis', 'atteignis', 'atteignit', 'atteignîmes', 'atteignîtes', 'atteignirent'],
  },
  plaindre: {
    participePresent: 'plaignant',
    participePasse: 'plaint',
    auxiliary: 'avoir',
    present: ['plains', 'plains', 'plaint', 'plaignons', 'plaignez', 'plaignent'],
    imparfait: ['plaignais', 'plaignais', 'plaignait', 'plaignions', 'plaigniez', 'plaignaient'],
    futurSimple: ['plaindrai', 'plaindras', 'plaindra', 'plaindrons', 'plaindrez', 'plaindront'],
    conditionnelPresent: ['plaindrais', 'plaindrais', 'plaindrait', 'plaindrions', 'plaindriez', 'plaindraient'],
    subjonctifPresent: ['plaigne', 'plaignes', 'plaigne', 'plaignions', 'plaigniez', 'plaignent'],
    imperatif: ['plains', 'plaignons', 'plaignez'],
    passeSimple: ['plaignis', 'plaignis', 'plaignit', 'plaignîmes', 'plaignîtes', 'plaignirent'],
  },
  apercevoir: {
    participePresent: 'apercevant',
    participePasse: 'aperçu',
    auxiliary: 'avoir',
    present: ['aperçois', 'aperçois', 'aperçoit', 'apercevons', 'apercevez', 'aperçoivent'],
    imparfait: ['apercevais', 'apercevais', 'apercevait', 'apercevions', 'aperceviez', 'apercevaient'],
    futurSimple: ['apercevrai', 'apercevras', 'apercevra', 'apercevrons', 'apercevrez', 'apercevront'],
    conditionnelPresent: ['apercevrais', 'apercevrais', 'apercevrait', 'apercevrions', 'apercevriez', 'apercevraient'],
    subjonctifPresent: ['aperçoive', 'aperçoives', 'aperçoive', 'apercevions', 'aperceviez', 'aperçoivent'],
    imperatif: ['aperçois', 'apercevons', 'apercevez'],
    passeSimple: ['aperçus', 'aperçus', 'aperçut', 'aperçûmes', 'aperçûtes', 'aperçurent'],
  },
  décevoir: {
    participePresent: 'décevant',
    participePasse: 'déçu',
    auxiliary: 'avoir',
    present: ['déçois', 'déçois', 'déçoit', 'décevons', 'décevez', 'déçoivent'],
    imparfait: ['décevais', 'décevais', 'décevait', 'décevions', 'déceviez', 'décevaient'],
    futurSimple: ['décevrai', 'décevras', 'décevra', 'décevrons', 'décevrez', 'décevront'],
    conditionnelPresent: ['décevrais', 'décevrais', 'décevrait', 'décevrions', 'décevriez', 'décevraient'],
    subjonctifPresent: ['déçoive', 'déçoives', 'déçoive', 'décevions', 'déceviez', 'déçoivent'],
    imperatif: ['déçois', 'décevons', 'décevez'],
    passeSimple: ['déçus', 'déçus', 'déçut', 'déçûmes', 'déçûtes', 'déçurent'],
  },
  sourire: {
    participePresent: 'souriant',
    participePasse: 'souri',
    auxiliary: 'avoir',
    present: ['souris', 'souris', 'sourit', 'sourions', 'souriez', 'sourient'],
    imparfait: ['souriais', 'souriais', 'souriait', 'souriions', 'souriiez', 'souriaient'],
    futurSimple: ['sourirai', 'souriras', 'sourira', 'sourirons', 'sourirez', 'souriront'],
    conditionnelPresent: ['sourirais', 'sourirais', 'sourirait', 'souririons', 'souririez', 'souriraient'],
    subjonctifPresent: ['sourie', 'souries', 'sourie', 'souriions', 'souriez', 'sourient'],
    imperatif: ['souris', 'sourions', 'souriez'],
    passeSimple: ['souris', 'souris', 'sourit', 'sourîmes', 'sourîtes', 'sourirent'],
  },
  interdire: {
    participePresent: 'interdisant',
    participePasse: 'interdit',
    auxiliary: 'avoir',
    present: ['interdis', 'interdis', 'interdit', 'interdisons', 'interdisez', 'interdisent'],
    imparfait: ['interdisais', 'interdisais', 'interdisait', 'interdisions', 'interdisiez', 'interdisaient'],
    futurSimple: ['interdirai', 'interdiras', 'interdira', 'interdirons', 'interdirez', 'interdiront'],
    conditionnelPresent: ['interdirais', 'interdirais', 'interdirait', 'interdirions', 'interdiriez', 'interdiraient'],
    subjonctifPresent: ['interdise', 'interdises', 'interdise', 'interdisions', 'interdisiez', 'interdisent'],
    imperatif: ['interdis', 'interdisons', 'interdisez'],
    passeSimple: ['interdis', 'interdis', 'interdit', 'interdîmes', 'interdîtes', 'interdirent'],
  },
  prédire: {
    participePresent: 'prédisant',
    participePasse: 'prédit',
    auxiliary: 'avoir',
    present: ['prédis', 'prédis', 'prédit', 'prédisons', 'prédisez', 'prédisent'],
    imparfait: ['prédisais', 'prédisais', 'prédisait', 'prédisions', 'prédisiez', 'prédisaient'],
    futurSimple: ['prédirai', 'prédiras', 'prédira', 'prédirons', 'prédirez', 'prédiront'],
    conditionnelPresent: ['prédirais', 'prédirais', 'prédirait', 'prédirions', 'prédiriez', 'prédiraient'],
    subjonctifPresent: ['prédise', 'prédises', 'prédise', 'prédisions', 'prédisiez', 'prédisent'],
    imperatif: ['prédis', 'prédisons', 'prédisez'],
    passeSimple: ['prédis', 'prédis', 'prédit', 'prédisîmes', 'prédisîtes', 'prédirent'],
  },
  élire: {
    participePresent: 'élisant',
    participePasse: 'élu',
    auxiliary: 'avoir',
    present: ['élis', 'élis', 'élit', 'élisons', 'élisez', 'élisent'],
    imparfait: ['élisais', 'élisais', 'élisait', 'élisions', 'élisiez', 'élisaient'],
    futurSimple: ['élirai', 'éliras', 'élira', 'élirons', 'élirez', 'éliront'],
    conditionnelPresent: ['élirais', 'élirais', 'élirait', 'élirions', 'éliriez', 'éliraient'],
    subjonctifPresent: ['élise', 'élises', 'élise', 'élisions', 'élisiez', 'élisent'],
    imperatif: ['élis', 'élisons', 'élisez'],
    passeSimple: ['élus', 'élus', 'élut', 'élûmes', 'élûtes', 'élurent'],
  },
  décrire: {
    participePresent: 'décrivant',
    participePasse: 'décrit',
    auxiliary: 'avoir',
    present: ['décris', 'décris', 'décrit', 'décrivons', 'décrivez', 'décrivent'],
    imparfait: ['décrivais', 'décrivais', 'décrivait', 'décrivions', 'décriviez', 'décrivaient'],
    futurSimple: ['décrirai', 'décriras', 'décrira', 'décrirons', 'décrirez', 'décriront'],
    conditionnelPresent: ['décrirais', 'décrirais', 'décrirait', 'décririons', 'décririez', 'décriraient'],
    subjonctifPresent: ['décrive', 'décrives', 'décrive', 'décrivions', 'décriviez', 'décrivent'],
    imperatif: ['décris', 'décrivons', 'décrivez'],
    passeSimple: ['décrivis', 'décrivis', 'décrivit', 'décrivîmes', 'décrivîtes', 'décrivirent'],
  },
  inscrire: {
    participePresent: 'inscrivant',
    participePasse: 'inscrit',
    auxiliary: 'avoir',
    present: ['inscris', 'inscris', 'inscrit', 'inscrivons', 'inscrivez', 'inscrivent'],
    imparfait: ['inscrivais', 'inscrivais', 'inscrivait', 'inscrivions', 'inscriviez', 'inscrivaient'],
    futurSimple: ['inscrirai', 'inscriras', 'inscrira', 'inscrirons', 'inscrirez', 'inscriront'],
    conditionnelPresent: ['inscrirais', 'inscrirais', 'inscrirait', 'inscririons', 'inscririez', 'inscriraient'],
    subjonctifPresent: ['inscrive', 'inscrives', 'inscrive', 'inscrivions', 'inscriviez', 'inscrivent'],
    imperatif: ['inscris', 'inscrivons', 'inscrivez'],
    passeSimple: ['inscrivis', 'inscrivis', 'inscrivit', 'inscrivîmes', 'inscrivîtes', 'inscrivirent'],
  },
  poursuivre: {
    participePresent: 'poursuivant',
    participePasse: 'poursuivi',
    auxiliary: 'avoir',
    present: ['poursuis', 'poursuis', 'poursuit', 'poursuivons', 'poursuivez', 'poursuivent'],
    imparfait: ['poursuivais', 'poursuivais', 'poursuivait', 'poursuivions', 'poursuiviez', 'poursuivaient'],
    futurSimple: ['poursuivrai', 'poursuivras', 'poursuivra', 'poursuivrons', 'poursuivrez', 'poursuivront'],
    conditionnelPresent: ['poursuivrais', 'poursuivrais', 'poursuivrait', 'poursuivrions', 'poursuivriez', 'poursuivraient'],
    subjonctifPresent: ['poursuive', 'poursuives', 'poursuive', 'poursuivions', 'poursuiviez', 'poursuivent'],
    imperatif: ['poursuis', 'poursuivons', 'poursuivez'],
    passeSimple: ['poursuivis', 'poursuivis', 'poursuivit', 'poursuivîmes', 'poursuivîtes', 'poursuivirent'],
  },
  survivre: {
    participePresent: 'survivant',
    participePasse: 'survécu',
    auxiliary: 'avoir',
    present: ['survis', 'survis', 'survit', 'survivons', 'survivez', 'survivent'],
    imparfait: ['survivais', 'survivais', 'survivait', 'survivions', 'surviviez', 'survivaient'],
    futurSimple: ['survivrai', 'survivras', 'survivra', 'survivrons', 'survivrez', 'survivront'],
    conditionnelPresent: ['survivrais', 'survivrais', 'survivrait', 'survivrions', 'survivriez', 'survivraient'],
    subjonctifPresent: ['survive', 'survives', 'survive', 'survivions', 'surviviez', 'survivent'],
    imperatif: ['survis', 'survivons', 'survivez'],
    passeSimple: ['survécus', 'survécus', 'survécut', 'survécûmes', 'survécûtes', 'survécurent'],
  },
  cueillir: {
    participePresent: 'cueillant',
    participePasse: 'cueilli',
    auxiliary: 'avoir',
    present: ['cueille', 'cueilles', 'cueille', 'cueillons', 'cueillez', 'cueillent'],
    imparfait: ['cueillais', 'cueillais', 'cueillait', 'cueillions', 'cueilliez', 'cueillaient'],
    futurSimple: ['cueillerai', 'cueilleras', 'cueillera', 'cueillerons', 'cueillerez', 'cueilleront'],
    conditionnelPresent: ['cueillerais', 'cueillerais', 'cueillerait', 'cueillerions', 'cueilleriez', 'cueilleraient'],
    subjonctifPresent: ['cueille', 'cueilles', 'cueille', 'cueillions', 'cueilliez', 'cueillent'],
    imperatif: ['cueille', 'cueillons', 'cueillez'],
    passeSimple: ['cueillis', 'cueillis', 'cueillit', 'cueillîmes', 'cueillîtes', 'cueillirent'],
  },
  accueillir: {
    participePresent: 'accueillant',
    participePasse: 'accueilli',
    auxiliary: 'avoir',
    present: ['accueille', 'accueilles', 'accueille', 'accueillons', 'accueillez', 'accueillent'],
    imparfait: ['accueillais', 'accueillais', 'accueillait', 'accueillions', 'accueilliez', 'accueillaient'],
    futurSimple: ['accueillerai', 'accueilleras', 'accueillera', 'accueillerons', 'accueillerez', 'accueilleront'],
    conditionnelPresent: ['accueillerais', 'accueillerais', 'accueillerait', 'accueillerions', 'accueilleriez', 'accueilleraient'],
    subjonctifPresent: ['accueille', 'accueilles', 'accueille', 'accueillions', 'accueilliez', 'accueillent'],
    imperatif: ['accueille', 'accueillons', 'accueillez'],
    passeSimple: ['accueillis', 'accueillis', 'accueillit', 'accueillîmes', 'accueillîtes', 'accueillirent'],
  },
  fuir: {
    participePresent: 'fuyant',
    participePasse: 'fui',
    auxiliary: 'avoir',
    present: ['fuis', 'fuis', 'fuit', 'fuyons', 'fuyez', 'fuient'],
    imparfait: ['fuyais', 'fuyais', 'fuyait', 'fuyions', 'fuyiez', 'fuyaient'],
    futurSimple: ['fuirai', 'fuiras', 'fuira', 'fuirons', 'fuirez', 'fuiront'],
    conditionnelPresent: ['fuirais', 'fuirais', 'fuirait', 'fuirions', 'fuiriez', 'fuiraient'],
    subjonctifPresent: ['fuie', 'fuies', 'fuie', 'fuyions', 'fuyiez', 'fuient'],
    imperatif: ['fuis', 'fuyons', 'fuyez'],
    passeSimple: ['fuis', 'fuis', 'fuit', 'fuîmes', 'fuîtes', 'fuirent'],
  },
  haïr: {
    participePresent: 'haïssant',
    participePasse: 'haï',
    auxiliary: 'avoir',
    present: ['hais', 'hais', 'hait', 'haïssons', 'haïssez', 'haïssent'],
    imparfait: ['haïssais', 'haïssais', 'haïssait', 'haïssions', 'haïssiez', 'haïssaient'],
    futurSimple: ['haïrai', 'haïras', 'haïra', 'haïrons', 'haïrez', 'haïront'],
    conditionnelPresent: ['haïrais', 'haïrais', 'haïrait', 'haïrions', 'haïriez', 'haïraient'],
    subjonctifPresent: ['haïsse', 'haïsses', 'haïsse', 'haïssions', 'haïssiez', 'haïssent'],
    imperatif: ['hais', 'haïssons', 'haïssez'],
    passeSimple: ['haïs', 'haïs', 'haït', 'haïmes', 'haïtes', 'haïrent'],
  },
  acquérir: {
    participePresent: 'acquérant',
    participePasse: 'acquis',
    auxiliary: 'avoir',
    present: ['acquiers', 'acquiers', 'acquiert', 'acquérons', 'acquérez', 'acquièrent'],
    imparfait: ['acquérais', 'acquérais', 'acquérait', 'acquérions', 'acquériez', 'acquéraient'],
    futurSimple: ['acquerrai', 'acquerras', 'acquerra', 'acquerrons', 'acquerrez', 'acquerront'],
    conditionnelPresent: ['acquerrais', 'acquerrais', 'acquerrait', 'acquerrions', 'acquerriez', 'acquerraient'],
    subjonctifPresent: ['acquière', 'acquières', 'acquière', 'acquérions', 'acquériez', 'acquièrent'],
    imperatif: ['acquiers', 'acquérons', 'acquérez'],
    passeSimple: ['acquis', 'acquis', 'acquit', 'acquîmes', 'acquîtes', 'acquirent'],
  },
}

// Fix prédire passé simple in French
IRREGULAR_VERBS['prédire'].passeSimple = ['prédis', 'prédis', 'prédit', 'prédîmes', 'prédîtes', 'prédirent']
IRREGULAR_VERBS['sourire'].subjonctifPresent = ['sourie', 'souries', 'sourie', 'souriions', 'souriiez', 'sourient']

// Alias base asseoir to s’asseoir
IRREGULAR_VERBS['asseoir'] = IRREGULAR_VERBS['s’asseoir']

export const startsWithVowel = (text: string): boolean =>
  /^[aeiouyhàâäéèêëîïôöùûü]/i.test(text.trim())

const elideSubject = (subject: string, verbForm: string): string => {
  const normSubject = subject.trim()
  if (normSubject === 'je') {
    return startsWithVowel(verbForm) ? `j’${verbForm}` : `je ${verbForm}`
  }
  return `${normSubject} ${verbForm}`
}

export const elideQue = (subjectPhrase: string): string => {
  const trimmed = subjectPhrase.trim()
  return startsWithVowel(trimmed) ? `qu’${trimmed}` : `que ${trimmed}`
}

export const elideDe = (target: string): string => {
  const trimmed = target.trim()
  return startsWithVowel(trimmed) ? `d’${trimmed}` : `de ${trimmed}`
}

const reflexivePronoun = (person: string, verbForm: string): string => {
  const vowel = startsWithVowel(verbForm)
  switch (person) {
    case '1s':
      return vowel ? 'm’' : 'me '
    case '2s':
      return vowel ? 't’' : 'te '
    case '3s':
    case '3p':
      return vowel ? 's’' : 'se '
    case '1p':
      return 'nous '
    case '2p':
      return 'vous '
    default:
      return vowel ? 's’' : 'se '
  }
}

const reflexiveImperatif = (person: string, verbForm: string): string => {
  switch (person) {
    case '2s':
    case 'tu':
      return `${verbForm}-toi`
    case '1p':
    case 'nous':
      return `${verbForm}-nous`
    case '2p':
    case 'vous':
      return `${verbForm}-vous`
    default:
      return verbForm
  }
}

/** Compute past participle agreement endings */
export const computeAgreement = (participle: string) => {
  const base = participle.trim()
  let masculine = base
  let feminine: string
  let pluralMasc: string
  let pluralFem: string

  if (base.endsWith('s')) {
    masculine = base
    feminine = `${base}e`
    pluralMasc = base
    pluralFem = `${base}es`
  } else if (base.endsWith('e')) {
    feminine = base
    pluralMasc = `${base}s`
    pluralFem = `${base}s`
  } else {
    feminine = `${base}e`
    pluralMasc = `${base}s`
    pluralFem = `${base}es`
  }
  return { masculine, feminine, pluralMasc, pluralFem }
}

/** Derive verbs following known models (venir/tenir, etc.) */
function deriveFromModel(verb: string): IrregularVerbDef | null {
  const v = verb.toLowerCase()
  if (v.endsWith('venir') && v !== 'venir') {
    const prefix = v.slice(0, -5)
    const base = IRREGULAR_VERBS['venir']
    const aux =
      v === 'devenir' || v === 'revenir' || v === 'parvenir' || v === 'intervenir'
        ? 'être'
        : 'avoir'
    return {
      participePresent: `${prefix}${base.participePresent}`,
      participePasse: `${prefix}${base.participePasse}`,
      auxiliary: aux,
      present: base.present.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['present'],
      imparfait: base.imparfait.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['imparfait'],
      futurSimple: base.futurSimple.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['futurSimple'],
      conditionnelPresent: base.conditionnelPresent.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['conditionnelPresent'],
      subjonctifPresent: base.subjonctifPresent.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['subjonctifPresent'],
      imperatif: base.imperatif ? (base.imperatif.map((f) => `${prefix}${f}`) as unknown as NonNullable<IrregularVerbDef['imperatif']>) : undefined,
      passeSimple: base.passeSimple.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['passeSimple'],
    }
  }

  if (v.endsWith('tenir') && v !== 'tenir') {
    const prefix = v.slice(0, -5)
    const base = IRREGULAR_VERBS['tenir']
    return {
      participePresent: `${prefix}${base.participePresent}`,
      participePasse: `${prefix}${base.participePasse}`,
      auxiliary: 'avoir',
      present: base.present.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['present'],
      imparfait: base.imparfait.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['imparfait'],
      futurSimple: base.futurSimple.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['futurSimple'],
      conditionnelPresent: base.conditionnelPresent.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['conditionnelPresent'],
      subjonctifPresent: base.subjonctifPresent.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['subjonctifPresent'],
      imperatif: base.imperatif ? (base.imperatif.map((f) => `${prefix}${f}`) as unknown as NonNullable<IrregularVerbDef['imperatif']>) : undefined,
      passeSimple: base.passeSimple.map((f) => `${prefix}${f}`) as unknown as IrregularVerbDef['passeSimple'],
    }
  }

  return null
}

/** Check whether a verb infinitive is supported */
export function isSupportedVerb(rawInfinitive: string): boolean {
  const norm = rawInfinitive
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '’')
  const isReflexive = norm.startsWith('se ') || norm.startsWith('s’')
  const base = isReflexive ? norm.replace(/^(se\s+|s’)/i, '') : norm

  if (!base) return false
  // Reject multi-word verb phrases or spaces after reflexive pronoun (e.g. s’en aller, se laver les mains)
  if (/\s/.test(base)) return false

  const baseSupported =
    (base.length >= 3 && base.endsWith('er')) ||
    Boolean(IRREGULAR_VERBS[base]) ||
    SECOND_GROUP_VERBS.has(base) ||
    REGULAR_DRE_VERBS.has(base) ||
    base.endsWith('venir') ||
    base.endsWith('tenir')

  if (baseSupported) return true
  if (IRREGULAR_VERBS[norm]) return true
  return false
}

/** Conjugate regular verbs based on French 3 groups and spelling rules */
function conjugateRegular(
  infinitive: string,
  isReflexive: boolean,
): IrregularVerbDef {
  const verb = infinitive.trim().toLowerCase()
  const aux: 'avoir' | 'être' | 'avoir / être' = isReflexive
    ? 'être'
    : DUAL_AUXILIARY_VERBS.has(verb)
      ? 'avoir / être'
      : ETRE_VERBS.has(verb)
        ? 'être'
        : 'avoir'

  // Group 1: -er
  if (verb.endsWith('er')) {
    const root = verb.slice(0, -2)

    // -ger: manger -> nous mangeons, je mangeais
    const isGer = verb.endsWith('ger')
    const gerPrefix = isGer ? verb.slice(0, -1) : root // 'mange' vs 'mang'

    // -cer: commencer -> nous commençons, je commençais
    const isCer = verb.endsWith('cer')
    const cerPrefix = isCer ? `${root.slice(0, -1)}ç` : root // 'commenç' vs 'commenc'

    // -yer: payer / nettoyer / essuyer
    const isYer = verb.endsWith('yer')

    const isEler = verb.endsWith('eler')
    const isEter = verb.endsWith('eter')
    const isAcheterPeler = ACHETER_PELER_SET.has(verb)

    let stemSil = root
    let futStem = verb

    if (isAcheterPeler) {
      const m = root.match(/^(.*)e([^eéèêëaiouy\s]+)$/)
      if (m) {
        stemSil = `${m[1]}è${m[2]}`
        futStem = `${stemSil}er`
      }
    } else if (isEler) {
      stemSil = `${root}l`
      futStem = `${stemSil}er`
    } else if (isEter) {
      stemSil = `${root}t`
      futStem = `${stemSil}er`
    } else if (/^(.*)e([bcdfghjklmnpqrstvwxz]|vr)er$/.test(verb)) {
      // e + consonne(s) + er: peser, mener, lever, achever, promener, enlever, semer
      const m = verb.match(/^(.*)e([bcdfghjklmnpqrstvwxz]|vr)er$/)
      if (m) {
        stemSil = `${m[1]}è${m[2]}`
        futStem = `${stemSil}er`
      }
    } else if (/^(.*)é([bcdfghjklmnpqrstvwxz]|br|cl|cr|dr|fr|gr|pr|tr|vr)er$/.test(verb)) {
      // é + consonne(s) + er: protéger, espérer, répéter, compléter, célébrer, posséder
      const m = verb.match(/^(.*)é([bcdfghjklmnpqrstvwxz]|br|cl|cr|dr|fr|gr|pr|tr|vr)er$/)
      if (m) {
        stemSil = `${m[1]}è${m[2]}`
        futStem = verb // traditional spelling keeps é in futur and conditionnel
      }
    } else if (isYer) {
      stemSil = `${root.slice(0, -1)}i`
      futStem = `${stemSil}er`
    }

    const stemNous = isGer ? `${gerPrefix}ons` : isCer ? `${cerPrefix}ons` : `${root}ons`
    const stemVous = `${root}ez`

    const present: [string, string, string, string, string, string] = [
      `${stemSil}e`,
      `${stemSil}es`,
      `${stemSil}e`,
      stemNous,
      stemVous,
      `${stemSil}ent`,
    ]

    const impfStem = isGer ? gerPrefix : isCer ? cerPrefix : root
    const imparfait: [string, string, string, string, string, string] = [
      `${impfStem}ais`,
      `${impfStem}ais`,
      `${impfStem}ait`,
      `${root}ions`,
      `${root}iez`,
      `${impfStem}aient`,
    ]

    const futurSimple: [string, string, string, string, string, string] = [
      `${futStem}ai`,
      `${futStem}as`,
      `${futStem}a`,
      `${futStem}ons`,
      `${futStem}ez`,
      `${futStem}ont`,
    ]

    const conditionnelPresent: [string, string, string, string, string, string] = [
      `${futStem}ais`,
      `${futStem}ais`,
      `${futStem}ait`,
      `${futStem}ions`,
      `${futStem}iez`,
      `${futStem}aient`,
    ]

    const subjonctifPresent: [string, string, string, string, string, string] = [
      `${stemSil}e`,
      `${stemSil}es`,
      `${stemSil}e`,
      `${root}ions`,
      `${root}iez`,
      `${stemSil}ent`,
    ]

    const imperatif: [string, string, string] = [`${stemSil}e`, stemNous, stemVous]

    // Passé simple: -ger and -cer use e / ç before a, but 3rd plural uses -èrent without extra e or ç
    const psStemA = isGer ? gerPrefix : isCer ? cerPrefix : root
    const passeSimple: [string, string, string, string, string, string] = [
      `${psStemA}ai`,
      `${psStemA}as`,
      `${psStemA}a`,
      `${psStemA}âmes`,
      `${psStemA}âtes`,
      `${root}èrent`,
    ]

    const participePresent = `${isGer ? gerPrefix : isCer ? cerPrefix : root}ant`
    const participePasse = `${root}é`

    return {
      participePresent,
      participePasse,
      auxiliary: aux,
      present,
      imparfait,
      futurSimple,
      conditionnelPresent,
      subjonctifPresent,
      imperatif,
      passeSimple,
    }
  }

  // Group 2: -ir (finir, choisir, réussir...)
  if (verb.endsWith('ir')) {
    const root = verb.slice(0, -2)
    const present: [string, string, string, string, string, string] = [
      `${root}is`,
      `${root}is`,
      `${root}it`,
      `${root}issons`,
      `${root}issez`,
      `${root}issent`,
    ]
    const imparfait: [string, string, string, string, string, string] = [
      `${root}issais`,
      `${root}issais`,
      `${root}issait`,
      `${root}issions`,
      `${root}issiez`,
      `${root}issaient`,
    ]
    const futurSimple: [string, string, string, string, string, string] = [
      `${verb}ai`,
      `${verb}as`,
      `${verb}a`,
      `${verb}ons`,
      `${verb}ez`,
      `${verb}ont`,
    ]
    const conditionnelPresent: [string, string, string, string, string, string] = [
      `${verb}ais`,
      `${verb}ais`,
      `${verb}ait`,
      `${verb}ions`,
      `${verb}iez`,
      `${verb}aient`,
    ]
    const subjonctifPresent: [string, string, string, string, string, string] = [
      `${root}isse`,
      `${root}isses`,
      `${root}isse`,
      `${root}issions`,
      `${root}issiez`,
      `${root}issent`,
    ]
    const imperatif: [string, string, string] = [`${root}is`, `${root}issons`, `${root}issez`]
    const passeSimple: [string, string, string, string, string, string] = [
      `${root}is`,
      `${root}is`,
      `${root}it`,
      `${root}îmes`,
      `${root}îtes`,
      `${root}irent`,
    ]
    return {
      participePresent: `${root}issant`,
      participePasse: `${root}i`,
      auxiliary: aux,
      present,
      imparfait,
      futurSimple,
      conditionnelPresent,
      subjonctifPresent,
      imperatif,
      passeSimple,
    }
  }

  // Group 3: regular -re (vendre, attendre, etc.)
  const root = verb.endsWith('re') ? verb.slice(0, -2) : verb
  const present: [string, string, string, string, string, string] = [
    `${root}s`,
    `${root}s`,
    root.endsWith('d') || root.endsWith('t') ? root : `${root}t`,
    `${root}ons`,
    `${root}ez`,
    `${root}ent`,
  ]
  const imparfait: [string, string, string, string, string, string] = [
    `${root}ais`,
    `${root}ais`,
    `${root}ait`,
    `${root}ions`,
    `${root}iez`,
    `${root}aient`,
  ]
  const futurSimple: [string, string, string, string, string, string] = [
    `${root}rai`,
    `${root}ras`,
    `${root}ra`,
    `${root}rons`,
    `${root}rez`,
    `${root}ront`,
  ]
  const conditionnelPresent: [string, string, string, string, string, string] = [
    `${root}rais`,
    `${root}rais`,
    `${root}rait`,
    `${root}rions`,
    `${root}riez`,
    `${root}raient`,
  ]
  const subjonctifPresent: [string, string, string, string, string, string] = [
    `${root}e`,
    `${root}es`,
    `${root}e`,
    `${root}ions`,
    `${root}iez`,
    `${root}ent`,
  ]
  const imperatif: [string, string, string] = [`${root}s`, `${root}ons`, `${root}ez`]
  const passeSimple: [string, string, string, string, string, string] = [
    `${root}is`,
    `${root}is`,
    `${root}it`,
    `${root}îmes`,
    `${root}îtes`,
    `${root}irent`,
  ]
  return {
    participePresent: `${root}ant`,
    participePasse: `${root}u`,
    auxiliary: aux,
    present,
    imparfait,
    futurSimple,
    conditionnelPresent,
    subjonctifPresent,
    imperatif,
    passeSimple,
  }
}

/** Main conjugation entry point */
export function conjugate(rawInfinitive: string, tenseId: TenseId): ConjugationResult {
  const trimmed = rawInfinitive
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '’')

  const isReflexive =
    trimmed.startsWith('se ') ||
    trimmed.startsWith('s’')

  const baseInfinitive = isReflexive
    ? trimmed.replace(/^(se\s+|s’)/i, '')
    : trimmed

  if (!isSupportedVerb(trimmed)) {
    throw new UnsupportedVerbError(rawInfinitive)
  }

  const isImpersonal = IMPERSONAL_VERBS.has(baseInfinitive)

  const def: IrregularVerbDef =
    IRREGULAR_VERBS[baseInfinitive] ??
    IRREGULAR_VERBS[trimmed] ??
    deriveFromModel(baseInfinitive) ??
    conjugateRegular(baseInfinitive, isReflexive)

  const auxiliary: 'avoir' | 'être' | 'avoir / être' = isReflexive
    ? 'être'
    : (DUAL_AUXILIARY_VERBS.has(baseInfinitive)
      ? 'avoir / être'
      : (def.auxiliary ??
        (ETRE_VERBS.has(baseInfinitive)
          ? 'être'
          : 'avoir')))

  const notes: string[] = []
  if (DUAL_AUXILIARY_VERBS.has(baseInfinitive) && !isReflexive) {
    notes.push(
      'Ce verbe utilise l’auxiliaire « être » par défaut (emploi intransitif de déplacement ou de changement d’état : « je suis descendu(e) ») et l’auxiliaire « avoir » lorsqu’il a un objet direct (COD transitif, ex. « j’ai descendu les valises »).',
    )
  }
  if (isReflexive) {
    notes.push(
      'Tous les verbes pronominaux se conjuguent avec l’auxiliaire « être » aux temps composés.',
    )
  }

  const pp = def.participePasse
  const partPres = def.participePresent
  const agreement = computeAgreement(pp)

  const usesEtre = auxiliary === 'être' || auxiliary === 'avoir / être'

  const buildCompoundForms = (
    auxForms: [string, string, string, string, string, string] | [string],
    moodPrefix = '',
  ): ConjugatedPersonForm[] => {
    if (isImpersonal) {
      const auxVal = auxForms[2] ?? auxForms[0]
      const verb = `${auxVal} ${pp}`
      const subject = 'il'
      const display = moodPrefix ? `${elideQue('il')} ${verb}` : `il ${verb}`
      return [
        {
          person: '3s',
          subject,
          verb,
          display,
          answers: [display, `qu’il ${verb}`, `qu'il ${verb}`, `il ${verb}`, verb],
        },
      ]
    }

    const sixAux = auxForms as [string, string, string, string, string, string]
    const persons = ['1s', '2s', '3s', '1p', '2p', '3p']
    const subjects = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']

    return sixAux.map((auxVal, idx) => {
      const p = persons[idx]
      const sub = subjects[idx]

      if (isReflexive) {
        const refl = reflexivePronoun(p, auxVal)
        const baseVerb = `${refl}${auxVal} ${pp}`

        let display = ''
        const answers: string[] = []
        const variants = {
          masculine: `${refl}${auxVal} ${agreement.masculine}`,
          feminine: `${refl}${auxVal} ${agreement.feminine}`,
          pluralMasc: `${refl}${auxVal} ${agreement.pluralMasc}`,
          pluralFem: `${refl}${auxVal} ${agreement.pluralFem}`,
        }

        if (p === '1s') {
          if (moodPrefix) {
            display = `que je ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `que je ${refl}${auxVal} ${agreement.masculine}`,
              `que je ${refl}${auxVal} ${agreement.feminine}`,
              `je ${refl}${auxVal} ${agreement.masculine}`,
              `je ${refl}${auxVal} ${agreement.feminine}`,
            )
          } else {
            display = `je ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `je ${refl}${auxVal} ${agreement.masculine}`,
              `je ${refl}${auxVal} ${agreement.feminine}`,
            )
          }
        } else if (p === '2s') {
          if (moodPrefix) {
            display = `que tu ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `que tu ${refl}${auxVal} ${agreement.masculine}`,
              `que tu ${refl}${auxVal} ${agreement.feminine}`,
              `tu ${refl}${auxVal} ${agreement.masculine}`,
              `tu ${refl}${auxVal} ${agreement.feminine}`,
            )
          } else {
            display = `tu ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `tu ${refl}${auxVal} ${agreement.masculine}`,
              `tu ${refl}${auxVal} ${agreement.feminine}`,
            )
          }
        } else if (p === '3s') {
          if (moodPrefix) {
            display = `qu’il ${refl}${auxVal} ${agreement.masculine} / qu’elle ${refl}${auxVal} ${agreement.feminine} / qu’on ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `qu’il ${refl}${auxVal} ${agreement.masculine}`,
              `qu’elle ${refl}${auxVal} ${agreement.feminine}`,
              `qu’on ${refl}${auxVal} ${agreement.masculine}`,
              `qu’on ${refl}${auxVal} ${agreement.feminine}`,
              `il ${refl}${auxVal} ${agreement.masculine}`,
              `elle ${refl}${auxVal} ${agreement.feminine}`,
              `on ${refl}${auxVal} ${agreement.masculine}`,
              `on ${refl}${auxVal} ${agreement.feminine}`,
            )
          } else {
            display = `il ${refl}${auxVal} ${agreement.masculine} / elle ${refl}${auxVal} ${agreement.feminine} / on ${refl}${auxVal} ${pp}(e)`
            answers.push(
              `il ${refl}${auxVal} ${agreement.masculine}`,
              `elle ${refl}${auxVal} ${agreement.feminine}`,
              `on ${refl}${auxVal} ${agreement.masculine}`,
              `on ${refl}${auxVal} ${agreement.feminine}`,
            )
          }
        } else if (p === '1p') {
          if (moodPrefix) {
            display = `que nous ${refl}${auxVal} ${agreement.pluralMasc} / ${agreement.pluralFem}`
            answers.push(
              `que nous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `que nous ${refl}${auxVal} ${agreement.pluralFem}`,
              `nous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `nous ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          } else {
            display = `nous ${refl}${auxVal} ${agreement.pluralMasc} / ${agreement.pluralFem}`
            answers.push(
              `nous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `nous ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          }
        } else if (p === '2p') {
          if (moodPrefix) {
            display = `que vous ${refl}${auxVal} ${pp}(e)(s)`
            answers.push(
              `que vous ${refl}${auxVal} ${agreement.masculine}`,
              `que vous ${refl}${auxVal} ${agreement.feminine}`,
              `que vous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `que vous ${refl}${auxVal} ${agreement.pluralFem}`,
              `vous ${refl}${auxVal} ${agreement.masculine}`,
              `vous ${refl}${auxVal} ${agreement.feminine}`,
              `vous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `vous ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          } else {
            display = `vous ${refl}${auxVal} ${pp}(e)(s)`
            answers.push(
              `vous ${refl}${auxVal} ${agreement.masculine}`,
              `vous ${refl}${auxVal} ${agreement.feminine}`,
              `vous ${refl}${auxVal} ${agreement.pluralMasc}`,
              `vous ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          }
        } else {
          if (moodPrefix) {
            display = `qu’ils ${refl}${auxVal} ${agreement.pluralMasc} / qu’elles ${refl}${auxVal} ${agreement.pluralFem}`
            answers.push(
              `qu’ils ${refl}${auxVal} ${agreement.pluralMasc}`,
              `qu’elles ${refl}${auxVal} ${agreement.pluralFem}`,
              `ils ${refl}${auxVal} ${agreement.pluralMasc}`,
              `elles ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          } else {
            display = `ils ${refl}${auxVal} ${agreement.pluralMasc} / elles ${refl}${auxVal} ${agreement.pluralFem}`
            answers.push(
              `ils ${refl}${auxVal} ${agreement.pluralMasc}`,
              `elles ${refl}${auxVal} ${agreement.pluralFem}`,
            )
          }
        }

        return {
          person: p,
          subject: sub,
          verb: baseVerb,
          display,
          answers,
          agreementVariants: variants,
        }
      }

      if (usesEtre) {
        const verbMasc = `${auxVal} ${agreement.masculine}`
        const verbFem = `${auxVal} ${agreement.feminine}`
        const verbPlMasc = `${auxVal} ${agreement.pluralMasc}`
        const verbPlFem = `${auxVal} ${agreement.pluralFem}`
        const variants = {
          masculine: verbMasc,
          feminine: verbFem,
          pluralMasc: verbPlMasc,
          pluralFem: verbPlFem,
        }

        let display = ''
        const answers: string[] = []

        if (p === '1s') {
          if (moodPrefix) {
            display = `que je ${auxVal} ${pp}(e)`
            answers.push(
              `que je ${auxVal} ${agreement.masculine}`,
              `que je ${auxVal} ${agreement.feminine}`,
              `je ${auxVal} ${agreement.masculine}`,
              `je ${auxVal} ${agreement.feminine}`,
            )
          } else {
            const prefix = elideSubject('je', auxVal)
            display = `${prefix} ${pp}(e)`
            answers.push(
              `${prefix} ${agreement.masculine}`,
              `${prefix} ${agreement.feminine}`,
            )
          }
        } else if (p === '2s') {
          if (moodPrefix) {
            display = `que tu ${auxVal} ${pp}(e)`
            answers.push(
              `que tu ${verbMasc}`,
              `que tu ${verbFem}`,
              `tu ${verbMasc}`,
              `tu ${verbFem}`,
            )
          } else {
            display = `tu ${auxVal} ${pp}(e)`
            answers.push(`tu ${verbMasc}`, `tu ${verbFem}`)
          }
        } else if (p === '3s') {
          if (moodPrefix) {
            display = `qu’il ${verbMasc} / qu’elle ${verbFem} / qu’on ${auxVal} ${pp}(e)`
            answers.push(
              `qu’il ${verbMasc}`,
              `qu’elle ${verbFem}`,
              `qu’on ${verbMasc}`,
              `qu’on ${verbFem}`,
              `il ${verbMasc}`,
              `elle ${verbFem}`,
              `on ${verbMasc}`,
              `on ${verbFem}`,
            )
          } else {
            display = `il ${verbMasc} / elle ${verbFem} / on ${auxVal} ${pp}(e)`
            answers.push(
              `il ${verbMasc}`,
              `elle ${verbFem}`,
              `on ${verbMasc}`,
              `on ${verbFem}`,
            )
          }
        } else if (p === '1p') {
          if (moodPrefix) {
            display = `que nous ${auxVal} ${agreement.pluralMasc} / ${agreement.pluralFem}`
            answers.push(
              `que nous ${verbPlMasc}`,
              `que nous ${verbPlFem}`,
              `nous ${verbPlMasc}`,
              `nous ${verbPlFem}`,
            )
          } else {
            display = `nous ${auxVal} ${agreement.pluralMasc} / ${agreement.pluralFem}`
            answers.push(`nous ${verbPlMasc}`, `nous ${verbPlFem}`)
          }
        } else if (p === '2p') {
          if (moodPrefix) {
            display = `que vous ${auxVal} ${pp}(e)(s)`
            answers.push(
              `que vous ${verbMasc}`,
              `que vous ${verbFem}`,
              `que vous ${verbPlMasc}`,
              `que vous ${verbPlFem}`,
              `vous ${verbMasc}`,
              `vous ${verbFem}`,
              `vous ${verbPlMasc}`,
              `vous ${verbPlFem}`,
            )
          } else {
            display = `vous ${auxVal} ${pp}(e)(s)`
            answers.push(
              `vous ${verbMasc}`,
              `vous ${verbFem}`,
              `vous ${verbPlMasc}`,
              `vous ${verbPlFem}`,
            )
          }
        } else {
          if (moodPrefix) {
            display = `qu’ils ${verbPlMasc} / qu’elles ${verbPlFem}`
            answers.push(
              `qu’ils ${verbPlMasc}`,
              `qu’elles ${verbPlFem}`,
              `ils ${verbPlMasc}`,
              `elles ${verbPlFem}`,
            )
          } else {
            display = `ils ${verbPlMasc} / elles ${verbPlFem}`
            answers.push(`ils ${verbPlMasc}`, `elles ${verbPlFem}`)
          }
        }

        return {
          person: p,
          subject: sub,
          verb: verbMasc,
          display,
          answers,
          agreementVariants: variants,
        }
      }

      // Standard Avoir compound tense
      const verb = `${auxVal} ${pp}`
      let display = ''
      const answers: string[] = []

      if (p === '1s') {
        if (moodPrefix) {
          display = startsWithVowel(auxVal) ? `que j’${verb}` : `que je ${verb}`
          answers.push(
            display,
            startsWithVowel(auxVal) ? `que j'${verb}` : display,
            elideSubject('je', verb),
            `j'${verb}`,
          )
        } else {
          display = elideSubject('je', verb)
          answers.push(display, `j'${verb}`)
        }
      } else if (p === '2s') {
        if (moodPrefix) {
          display = `que tu ${verb}`
          answers.push(display, `tu ${verb}`)
        } else {
          display = `tu ${verb}`
          answers.push(display)
        }
      } else if (p === '3s') {
        if (moodPrefix) {
          display = `qu’il / elle / on ${verb}`
          answers.push(
            `qu’il ${verb}`,
            `qu'il ${verb}`,
            `qu’elle ${verb}`,
            `qu'elle ${verb}`,
            `qu’on ${verb}`,
            `qu'on ${verb}`,
            `il ${verb}`,
            `elle ${verb}`,
            `on ${verb}`,
          )
        } else {
          display = `il / elle / on ${verb}`
          answers.push(`il ${verb}`, `elle ${verb}`, `on ${verb}`)
        }
      } else if (p === '1p') {
        if (moodPrefix) {
          display = `que nous ${verb}`
          answers.push(display, `nous ${verb}`)
        } else {
          display = `nous ${verb}`
          answers.push(display)
        }
      } else if (p === '2p') {
        if (moodPrefix) {
          display = `que vous ${verb}`
          answers.push(display, `vous ${verb}`)
        } else {
          display = `vous ${verb}`
          answers.push(display)
        }
      } else {
        if (moodPrefix) {
          display = `qu’ils / elles ${verb}`
          answers.push(
            `qu’ils ${verb}`,
            `qu'ils ${verb}`,
            `qu’elles ${verb}`,
            `qu'elles ${verb}`,
            `ils ${verb}`,
            `elles ${verb}`,
          )
        } else {
          display = `ils / elles ${verb}`
          answers.push(`ils ${verb}`, `elles ${verb}`)
        }
      }

      return {
        person: p,
        subject: sub,
        verb,
        display,
        answers,
      }
    })
  }

  const buildSimpleForms = (
    rawForms: [string, string, string, string, string, string] | [string],
    options: {
      isSubjunctive?: boolean
    } = {},
  ): ConjugatedPersonForm[] => {
    if (isImpersonal) {
      const v = rawForms[0]
      const display = options.isSubjunctive ? `${elideQue('il')} ${v}` : `il ${v}`
      return [
        {
          person: '3s',
          subject: 'il',
          verb: v,
          display,
          answers: [display, `qu’il ${v}`, `qu'il ${v}`, `il ${v}`, v],
        },
      ]
    }

    const sixForms = rawForms as [string, string, string, string, string, string]
    const persons = ['1s', '2s', '3s', '1p', '2p', '3p']
    const subjects = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']

    return sixForms.map((rawVerb, idx) => {
      const p = persons[idx]
      const sub = subjects[idx]

      let fullVerb = rawVerb
      if (isReflexive) {
        const refl = reflexivePronoun(p, rawVerb)
        fullVerb = `${refl}${rawVerb}`
      }

      let display = ''
      const answers: string[] = []

      if (options.isSubjunctive) {
        if (p === '1s') {
          display = startsWithVowel(fullVerb)
            ? `que j’${fullVerb}`
            : `que je ${fullVerb}`
          answers.push(display, startsWithVowel(fullVerb) ? `que j'${fullVerb}` : display)
        } else if (p === '2s') {
          display = `que tu ${fullVerb}`
          answers.push(display)
        } else if (p === '3s') {
          display = `qu’il / elle / on ${fullVerb}`
          answers.push(
            `qu’il ${fullVerb}`,
            `qu'il ${fullVerb}`,
            `qu’elle ${fullVerb}`,
            `qu'elle ${fullVerb}`,
            `qu’on ${fullVerb}`,
            `qu'on ${fullVerb}`,
          )
        } else if (p === '1p') {
          display = `que nous ${fullVerb}`
          answers.push(display)
        } else if (p === '2p') {
          display = `que vous ${fullVerb}`
          answers.push(display)
        } else {
          display = `qu’ils / elles ${fullVerb}`
          answers.push(
            `qu’ils ${fullVerb}`,
            `qu'ils ${fullVerb}`,
            `qu’elles ${fullVerb}`,
            `qu'elles ${fullVerb}`,
          )
        }
      } else {
        if (p === '1s') {
          display = elideSubject('je', fullVerb)
          answers.push(display, display.replace(/’/g, "'"))
        } else if (p === '3s') {
          display = `il / elle / on ${fullVerb}`
          answers.push(`il ${fullVerb}`, `elle ${fullVerb}`, `on ${fullVerb}`)
        } else if (p === '3p') {
          display = `ils / elles ${fullVerb}`
          answers.push(`ils ${fullVerb}`, `elles ${fullVerb}`)
        } else {
          display = `${sub} ${fullVerb}`
          answers.push(display)
        }
      }

      return {
        person: p,
        subject: sub,
        verb: fullVerb,
        display,
        answers,
      }
    })
  }

  // Semi-auxiliaries
  const ALLER_PRESENT: [string, string, string, string, string, string] = [
    'vais',
    'vas',
    'va',
    'allons',
    'allez',
    'vont',
  ]
  const VENIR_PRESENT: [string, string, string, string, string, string] = [
    'viens',
    'viens',
    'vient',
    'venons',
    'venez',
    'viennent',
  ]

  let forms: ConjugatedPersonForm[] = []

  switch (tenseId) {
    case 'present':
      forms = buildSimpleForms(def.present)
      break

    case 'passeCompose':
      forms = buildCompoundForms(
        usesEtre
          ? ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']
          : ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      )
      break

    case 'imparfait':
      forms = buildSimpleForms(def.imparfait)
      break

    case 'plusQueParfait':
      forms = buildCompoundForms(
        usesEtre
          ? ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient']
          : ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
      )
      break

    case 'futurProche': {
      if (isImpersonal) {
        const display = `il va ${baseInfinitive}`
        forms = [
          {
            person: '3s',
            subject: 'il',
            verb: `va ${baseInfinitive}`,
            display,
            answers: [display, `va ${baseInfinitive}`],
          },
        ]
      } else {
        const persons = ['1s', '2s', '3s', '1p', '2p', '3p']
        const subjects = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']
        forms = ALLER_PRESENT.map((allerForm, idx) => {
          const p = persons[idx]
          const sub = subjects[idx]

          let verb = ''
          let display = ''
          const answers: string[] = []

          if (isReflexive) {
            const refl = reflexivePronoun(p, baseInfinitive)
            verb = `${allerForm} ${refl}${baseInfinitive}`
          } else {
            verb = `${allerForm} ${baseInfinitive}`
          }

          if (p === '1s') {
            display = elideSubject('je', verb)
            answers.push(display)
          } else if (p === '3s') {
            display = `il / elle / on ${verb}`
            answers.push(`il ${verb}`, `elle ${verb}`, `on ${verb}`)
          } else if (p === '3p') {
            display = `ils / elles ${verb}`
            answers.push(`ils ${verb}`, `elles ${verb}`)
          } else {
            display = `${sub} ${verb}`
            answers.push(display)
          }

          return { person: p, subject: sub, verb, display, answers }
        })
      }
      break
    }

    case 'futurSimple':
      forms = buildSimpleForms(def.futurSimple)
      break

    case 'futurAnterieur':
      forms = buildCompoundForms(
        usesEtre
          ? ['serai', 'seras', 'sera', 'serons', 'serez', 'seront']
          : ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
      )
      break

    case 'passeRecent': {
      if (isImpersonal) {
        const dePhrase = elideDe(baseInfinitive)
        const display = `il vient ${dePhrase}`
        forms = [
          {
            person: '3s',
            subject: 'il',
            verb: `vient ${dePhrase}`,
            display,
            answers: [display, `vient ${dePhrase}`],
          },
        ]
      } else {
        const persons = ['1s', '2s', '3s', '1p', '2p', '3p']
        const subjects = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']
        forms = VENIR_PRESENT.map((venirForm, idx) => {
          const p = persons[idx]
          const sub = subjects[idx]

          let verb = ''
          if (isReflexive) {
            const refl = reflexivePronoun(p, baseInfinitive)
            verb = `${venirForm} de ${refl}${baseInfinitive}`
          } else {
            const dePhrase = elideDe(baseInfinitive)
            verb = `${venirForm} ${dePhrase}`
          }

          let display = ''
          const answers: string[] = []

          if (p === '1s') {
            display = elideSubject('je', verb)
            answers.push(display)
          } else if (p === '3s') {
            display = `il / elle / on ${verb}`
            answers.push(`il ${verb}`, `elle ${verb}`, `on ${verb}`)
          } else if (p === '3p') {
            display = `ils / elles ${verb}`
            answers.push(`ils ${verb}`, `elles ${verb}`)
          } else {
            display = `${sub} ${verb}`
            answers.push(display)
          }

          return { person: p, subject: sub, verb, display, answers }
        })
      }
      break
    }

    case 'conditionnelPresent':
      forms = buildSimpleForms(def.conditionnelPresent)
      break

    case 'conditionnelPasse':
      forms = buildCompoundForms(
        usesEtre
          ? ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient']
          : ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
      )
      break

    case 'subjonctifPresent':
      forms = buildSimpleForms(def.subjonctifPresent, { isSubjunctive: true })
      break

    case 'subjonctifPasse':
      forms = buildCompoundForms(
        usesEtre
          ? ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient']
          : ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
        'que',
      )
      break

    case 'imperatif': {
      if (isImpersonal || baseInfinitive === 'pouvoir') {
        forms = []
        if (baseInfinitive === 'pouvoir') {
          notes.push('pouvoir n’a pas d’impératif')
        } else {
          notes.push(`${baseInfinitive} n’a pas d’impératif`)
        }
      } else {
        const impRaw: string[] = def.imperatif ?? [
          def.present[1] ?? '',
          def.present[3] ?? '',
          def.present[4] ?? '',
        ]
        const persons = ['2s', '1p', '2p']
        const labels = ['(tu)', '(nous)', '(vous)']

        forms = impRaw.map((v, idx) => {
          const p = persons[idx] ?? '2s'
          const display = isReflexive
            ? `${reflexiveImperatif(p, v)} !`
            : `${v} !`
          const cleanVerb = isReflexive ? reflexiveImperatif(p, v) : v
          return {
            person: p,
            subject: labels[idx] ?? '',
            verb: cleanVerb,
            display,
            answers: [display, cleanVerb, v],
          }
        })
      }
      break
    }

    case 'passeSimple':
      forms = buildSimpleForms(def.passeSimple)
      break

    case 'gerondif': {
      if (isImpersonal) {
        forms = []
        if (baseInfinitive === 'falloir') {
          notes.push('falloir n’a pas de gérondif')
        } else {
          notes.push('pleuvoir n’a pas de gérondif (« pleuvant » existe uniquement comme participe présent)')
        }
      } else {
        const reflG = startsWithVowel(partPres) ? 's’' : 'se '
        const verb = isReflexive
          ? `${reflG}${partPres}`
          : partPres
        const display = isReflexive
          ? `en ${reflG}${partPres}`
          : `en ${partPres}`
        forms = [
          {
            person: 'gerondif',
            subject: '',
            verb,
            display,
            answers: [display, verb],
          },
        ]
      }
      break
    }
  }

  const labels = TENSE_LABELS[tenseId]

  return {
    infinitive: rawInfinitive,
    tense: tenseId,
    tenseLabelFr: labels.fr,
    tenseLabelZh: labels.zh,
    forms,
    participePresent: partPres,
    participePasse: pp,
    auxiliary,
    isReflexive,
    isImpersonal,
    notes: notes.length > 0 ? notes : undefined,
  }
}

/** Conjugate a verb across all 15 supported tenses */
export function conjugateAll(infinitive: string): Record<TenseId, ConjugationResult> {
  const tenses: TenseId[] = [
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

  const result = {} as Record<TenseId, ConjugationResult>
  for (const tense of tenses) {
    result[tense] = conjugate(infinitive, tense)
  }
  return result
}

/** Return list of high-frequency and regular model verbs supported by the engine */
export function getSupportedVerbs(): string[] {
  const irregulars = Object.keys(IRREGULAR_VERBS).filter((k) => k !== 'asseoir')
  const models = [
    'parler',
    'aimer',
    'manger',
    'commencer',
    'payer',
    'acheter',
    'lever',
    'préférer',
    'appeler',
    'jeter',
    'se lever',
    's’appeler',
    'se souvenir',
    'se plaindre',
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
    'vaincre',
    'résoudre',
    'éteindre',
    'atteindre',
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
    'haïr',
    'acquérir',
    'vendre',
    'attendre',
    'répondre',
    ...Array.from(SECOND_GROUP_VERBS),
  ]
  return Array.from(new Set(irregulars.concat(models))).sort((a, b) => a.localeCompare(b, 'fr'))
}
