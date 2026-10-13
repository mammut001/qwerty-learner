// Shared slot tables and helpers for Échelle québécoise item variants.
// Used to procedurally generate authentic Level 1 & 2 scenarios.

// Helper to pick one item uniformly at random with a seeded PRNG function `rand`
export function pick(array, rand) {
  return array[Math.floor(rand() * array.length)]
}

// Helper to sample `count` distinct items from an array using `rand`
export function sample(array, count, rand) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

// Gender agreement helper: returns masc if persona is male, fem if female
export function g(persona, masc, fem) {
  const gender = typeof persona === 'string' ? persona : persona?.gender
  return gender === 'f' ? fem : masc
}

// Capitalisation helper: capitalises first letter, handling l’ and d’ prefixes
export function cap(str) {
  if (!str) return ''
  const s = String(str)
  if (/^[ld][\'’]/i.test(s)) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Personas: first name, gender ('m' | 'f'), paired with plausible origins and nationalities.
// Reflects diverse origins of Québec newcomers (Latin America, Maghreb, West Africa, Haiti, Asia, Europe).
export const PERSONAS = [
  { name: 'Ana', gender: 'f', country: 'le Chili', countryPrep: 'du Chili', natM: 'chilien', natF: 'chilienne', natZh: '智利人', langFr: 'espagnol', langZh: '西班牙语' },
  { name: 'Lucia', gender: 'f', country: 'la Colombie', countryPrep: 'de Colombie', natM: 'colombien', natF: 'colombienne', natZh: '哥伦比亚人', langFr: 'espagnol', langZh: '西班牙语' },
  { name: 'Sofia', gender: 'f', country: 'le Brésil', countryPrep: 'du Brésil', natM: 'brésilien', natF: 'brésilienne', natZh: '巴西人', langFr: 'portugais', langZh: '葡萄牙语' },
  { name: 'Carlos', gender: 'm', country: 'le Mexique', countryPrep: 'du Mexique', natM: 'mexicain', natF: 'mexicaine', natZh: '墨西哥人', langFr: 'espagnol', langZh: '西班牙语' },
  { name: 'Mateo', gender: 'm', country: 'la Colombie', countryPrep: 'de Colombie', natM: 'colombien', natF: 'colombienne', natZh: '哥伦比亚人', langFr: 'espagnol', langZh: '西班牙语' },
  { name: 'Fatima', gender: 'f', country: 'le Maroc', countryPrep: 'du Maroc', natM: 'marocain', natF: 'marocaine', natZh: '摩洛哥人', langFr: 'arabe', langZh: '阿拉伯语' },
  { name: 'Amina', gender: 'f', country: 'l’Algérie', countryPrep: 'd’Algérie', natM: 'algérien', natF: 'algérienne', natZh: '阿尔及利亚人', langFr: 'arabe', langZh: '阿拉伯语' },
  { name: 'Youssef', gender: 'm', country: 'le Maroc', countryPrep: 'du Maroc', natM: 'marocain', natF: 'marocaine', natZh: '摩洛哥人', langFr: 'arabe', langZh: '阿拉伯语' },
  { name: 'Karim', gender: 'm', country: 'l’Algérie', countryPrep: 'd’Algérie', natM: 'algérien', natF: 'algérienne', natZh: '阿尔及利亚人', langFr: 'arabe', langZh: '阿拉伯语' },
  { name: 'Amadou', gender: 'm', country: 'le Sénégal', countryPrep: 'du Sénégal', natM: 'sénégalais', natF: 'sénégalaise', natZh: '塞内加尔人', langFr: 'wolof', langZh: '沃洛夫语' },
  { name: 'Mariam', gender: 'f', country: 'le Cameroun', countryPrep: 'du Cameroun', natM: 'camerounais', natF: 'camerounaise', natZh: '喀麦隆人', langFr: 'fulfulde', langZh: '富拉语' },
  { name: 'Jean-Baptiste', gender: 'm', country: 'Haïti', countryPrep: 'd’Haïti', natM: 'haïtien', natF: 'haïtienne', natZh: '海地人', langFr: 'créole haïtien', langZh: '海地克里奥尔语' },
  { name: 'Daphnée', gender: 'f', country: 'Haïti', countryPrep: 'd’Haïti', natM: 'haïtien', natF: 'haïtienne', natZh: '海地人', langFr: 'créole haïtien', langZh: '海地克里奥尔语' },
  { name: 'Jin', gender: 'm', country: 'la Chine', countryPrep: 'de Chine', natM: 'chinois', natF: 'chinoise', natZh: '中国人', langFr: 'mandarin', langZh: '中文普通话' },
  { name: 'Mei', gender: 'f', country: 'la Chine', countryPrep: 'de Chine', natM: 'chinois', natF: 'chinoise', natZh: '中国人', langFr: 'mandarin', langZh: '中文普通话' },
  { name: 'Tariq', gender: 'm', country: 'le Liban', countryPrep: 'du Liban', natM: 'libanais', natF: 'libanaise', natZh: '黎巴嫩人', langFr: 'arabe', langZh: '阿拉伯语' },
  { name: 'Priya', gender: 'f', country: 'l’Inde', countryPrep: 'd’Inde', natM: 'indien', natF: 'indienne', natZh: '印度人', langFr: 'hindi', langZh: '印地语' },
  { name: 'Marc', gender: 'm', country: 'la France', countryPrep: 'de France', natM: 'français', natF: 'française', natZh: '法国人', langFr: 'français', langZh: '法语' },
  { name: 'Émilie', gender: 'f', country: 'la France', countryPrep: 'de France', natM: 'français', natF: 'française', natZh: '法国人', langFr: 'français', langZh: '法语' },
]

// Countries table with proper French prepositions (du / de / d’ / des)
export const COUNTRIES = [
  { name: 'le Mexique', prep: 'du Mexique', prepEn: 'au Mexique', zh: '墨西哥', natM: 'mexicain', natF: 'mexicaine', natZh: '墨西哥人' },
  { name: 'la Chine', prep: 'de Chine', prepEn: 'en Chine', zh: '中国', natM: 'chinois', natF: 'chinoise', natZh: '中国人' },
  { name: 'l’Algérie', prep: 'd’Algérie', prepEn: 'en Algérie', zh: '阿尔及利亚', natM: 'algérien', natF: 'algérienne', natZh: '阿尔及利亚人' },
  { name: 'le Liban', prep: 'du Liban', prepEn: 'au Liban', zh: '黎巴嫩', natM: 'libanais', natF: 'libanaise', natZh: '黎巴嫩人' },
  { name: 'la Tunisie', prep: 'de Tunisie', prepEn: 'en Tunisie', zh: '突尼斯', natM: 'tunisien', natF: 'tunisienne', natZh: '突尼斯人' },
  { name: 'les Philippines', prep: 'des Philippines', prepEn: 'aux Philippines', zh: '菲律宾', natM: 'philippin', natF: 'philippine', natZh: '菲律宾人' },
  { name: 'le Brésil', prep: 'du Brésil', prepEn: 'au Brésil', zh: '巴西', natM: 'brésilien', natF: 'brésilienne', natZh: '巴西人' },
  { name: 'l’Inde', prep: 'd’Inde', prepEn: 'en Inde', zh: '印度', natM: 'indien', natF: 'indienne', natZh: '印度人' },
  { name: 'la Colombie', prep: 'de Colombie', prepEn: 'en Colombie', zh: '哥伦比亚', natM: 'colombien', natF: 'colombienne', natZh: '哥伦比亚人' },
  { name: 'le Sénégal', prep: 'du Sénégal', prepEn: 'au Sénégal', zh: '塞内加尔', natM: 'sénégalais', natF: 'sénégalaise', natZh: '塞内加尔人' },
  { name: 'le Cameroun', prep: 'du Cameroun', prepEn: 'au Cameroun', zh: '喀麦隆', natM: 'camerounais', natF: 'camerounaise', natZh: '喀麦隆人' },
  { name: 'Haïti', prep: 'd’Haïti', prepEn: 'en Haïti', zh: '海地', natM: 'haïtien', natF: 'haïtienne', natZh: '海地人' },
  { name: 'le Maroc', prep: 'du Maroc', prepEn: 'au Maroc', zh: '摩洛哥', natM: 'marocain', natF: 'marocaine', natZh: '摩洛哥人' },
  { name: 'la Syrie', prep: 'de Syrie', prepEn: 'en Syrie', zh: '叙利亚', natM: 'syrien', natF: 'syrienne', natZh: '叙利亚人' },
  { name: 'l’Ukraine', prep: 'd’Ukraine', prepEn: 'en Ukraine', zh: '乌克兰', natM: 'ukrainien', natF: 'ukrainienne', natZh: '乌克兰人' },
  { name: 'le Vietnam', prep: 'du Vietnam', prepEn: 'au Vietnam', zh: '越南', natM: 'vietnamien', natF: 'vietnamienne', natZh: '越南人' },
  { name: 'la France', prep: 'de France', prepEn: 'en France', zh: '法国', natM: 'français', natF: 'française', natZh: '法国人' },
  { name: 'le Chili', prep: 'du Chili', prepEn: 'au Chili', zh: '智利', natM: 'chilien', natF: 'chilienne', natZh: '智利人' },
  { name: 'le Pérou', prep: 'du Pérou', prepEn: 'au Pérou', zh: '秘鲁', natM: 'péruvien', natF: 'péruvienne', natZh: '秘鲁人' },
]

// Nationalities with masculine, feminine, and Chinese gloss
export const NATIONALITIES = [
  { m: 'mexicain', f: 'mexicaine', zh: '墨西哥人' },
  { m: 'colombien', f: 'colombienne', zh: '哥伦比亚人' },
  { m: 'chilien', f: 'chilienne', zh: '智利人' },
  { m: 'marocain', f: 'marocaine', zh: '摩洛哥人' },
  { m: 'algérien', f: 'algérienne', zh: '阿尔及利亚人' },
  { m: 'tunisien', f: 'tunisienne', zh: '突尼斯人' },
  { m: 'sénégalais', f: 'sénégalaise', zh: '塞内加尔人' },
  { m: 'haïtien', f: 'haïtienne', zh: '海地人' },
  { m: 'chinois', f: 'chinoise', zh: '中国人' },
  { m: 'brésilien', f: 'brésilienne', zh: '巴西人' },
  { m: 'libanais', f: 'libanaise', zh: '黎巴嫩人' },
  { m: 'français', f: 'française', zh: '法国人' },
  { m: 'camerounais', f: 'camerounaise', zh: '喀麦隆人' },
  { m: 'péruvien', f: 'péruvienne', zh: '秘鲁人' },
  { m: 'indien', f: 'indienne', zh: '印度人' },
]

// Professions with masculine, feminine, and Chinese gloss
export const PROFESSIONS = [
  { m: 'infirmier', f: 'infirmière', zh: '护士' },
  { m: 'avocat', f: 'avocate', zh: '律师' },
  { m: 'cuisinier', f: 'cuisinière', zh: '厨师' },
  { m: 'ingénieur', f: 'ingénieure', zh: '工程师' },
  { m: 'enseignant', f: 'enseignante', zh: '教师' },
  { m: 'chauffeur', f: 'chauffeuse', zh: '司机' },
  { m: 'comptable', f: 'comptable', zh: '会计' },
  { m: 'médecin', f: 'médecin', zh: '医生' },
  { m: 'vendeur', f: 'vendeuse', zh: '销售员' },
  { m: 'électricien', f: 'électricienne', zh: '电工' },
  { m: 'coiffeur', f: 'coiffeuse', zh: '理发师' },
  { m: 'serveur', f: 'serveuse', zh: '服务员' },
  { m: 'mécanicien', f: 'mécanicienne', zh: '汽修工' },
  { m: 'secrétaire', f: 'secrétaire', zh: '秘书' },
]

// Days of the week
export const DAYS = [
  { fr: 'lundi', zh: '星期一' },
  { fr: 'mardi', zh: '星期二' },
  { fr: 'mercredi', zh: '星期三' },
  { fr: 'jeudi', zh: '星期四' },
  { fr: 'vendredi', zh: '星期五' },
  { fr: 'samedi', zh: '星期六' },
  { fr: 'dimanche', zh: '星期日' },
]

// Months
export const MONTHS = [
  { fr: 'janvier', zh: '1 月', num: 1 },
  { fr: 'février', zh: '2 月', num: 2 },
  { fr: 'mars', zh: '3 月', num: 3 },
  { fr: 'avril', zh: '4 月', num: 4 },
  { fr: 'mai', zh: '5 月', num: 5 },
  { fr: 'juin', zh: '6 月', num: 6 },
  { fr: 'juillet', zh: '7 月', num: 7 },
  { fr: 'août', zh: '8 月', num: 8 },
  { fr: 'septembre', zh: '9 月', num: 9 },
  { fr: 'octobre', zh: '10 月', num: 10 },
  { fr: 'novembre', zh: '11 月', num: 11 },
  { fr: 'décembre', zh: '12 月', num: 12 },
]

// Dates (days of month)
export const DATES = [
  { dayNum: 1, dayText: '1er' },
  { dayNum: 2, dayText: '2' },
  { dayNum: 5, dayText: '5' },
  { dayNum: 8, dayText: '8' },
  { dayNum: 10, dayText: '10' },
  { dayNum: 12, dayText: '12' },
  { dayNum: 14, dayText: '14' },
  { dayNum: 15, dayText: '15' },
  { dayNum: 18, dayText: '18' },
  { dayNum: 20, dayText: '20' },
  { dayNum: 22, dayText: '22' },
  { dayNum: 25, dayText: '25' },
]

// Clock times
export const CLOCK_TIMES = [
  { frText: '8 heures', frDisplay: '8 h 00', zh: '8 点', hour: 8 },
  { frText: '8 heures et demie', frDisplay: '8 h 30', zh: '8 点半', hour: 8, min: 30 },
  { frText: '9 heures', frDisplay: '9 h 00', zh: '9 点', hour: 9 },
  { frText: '9 heures et demie', frDisplay: '9 h 30', zh: '9 点半', hour: 9, min: 30 },
  { frText: '10 heures 15', frDisplay: '10 h 15', zh: '10 点 15 分', hour: 10, min: 15 },
  { frText: '11 heures 30', frDisplay: '11 h 30', zh: '11 点半', hour: 11, min: 30 },
  { frText: '13 heures', frDisplay: '13 h 00', zh: '13 点', hour: 13 },
  { frText: '14 heures', frDisplay: '14 h 00', zh: '14 点', hour: 14 },
  { frText: '15 heures', frDisplay: '15 h 00', zh: '15 点', hour: 15 },
  { frText: '16 heures', frDisplay: '16 h 00', zh: '16 点', hour: 16 },
  { frText: '17 heures 30', frDisplay: '17 h 30', zh: '17 点半', hour: 17, min: 30 },
  { frText: '18 heures', frDisplay: '18 h 00', zh: '18 点', hour: 18 },
  { frText: '19 heures', frDisplay: '19 h 00', zh: '19 点', hour: 19 },
  { frText: '20 heures', frDisplay: '20 h 00', zh: '20 点', hour: 20 },
  { frText: '21 heures', frDisplay: '21 h 00', zh: '21 点', hour: 21 },
]

// Room numbers
export const ROOM_NUMBERS = [
  { fr: '102', display: 'Salle 102', zh: '102 教室' },
  { fr: '105', display: 'Salle 105', zh: '105 教室' },
  { fr: '201', display: 'Salle 201', zh: '201 教室' },
  { fr: '204', display: 'Salle 204', zh: '204 教室' },
  { fr: '302', display: 'Salle 302', zh: '302 教室' },
  { fr: '308', display: 'Salle 308', zh: '308 教室' },
  { fr: '110', display: 'Local 110', zh: '110 办公室' },
  { fr: '215', display: 'Local 215', zh: '215 办公室' },
  { fr: 'B-12', display: 'Local B-12', zh: 'B-12 办公室' },
  { fr: 'A-20', display: 'Local A-20', zh: 'A-20 办公室' },
]

// Québec fictional 555-exchange phone numbers
export const PHONE_NUMBERS = [
  { fr: '514 555-0123', zh: '514 555-0123' },
  { fr: '514 555-0145', zh: '514 555-0145' },
  { fr: '514 555-0189', zh: '514 555-0189' },
  { fr: '418 555-0112', zh: '418 555-0112' },
  { fr: '418 555-0164', zh: '418 555-0164' },
  { fr: '418 555-0198', zh: '418 555-0198' },
  { fr: '450 555-0134', zh: '450 555-0134' },
  { fr: '450 555-0177', zh: '450 555-0177' },
  { fr: '819 555-0156', zh: '819 555-0156' },
  { fr: '819 555-0182', zh: '819 555-0182' },
]

// Classroom objects
export const CLASSROOM_OBJECTS = [
  { fr: 'un cahier', zh: '本子' },
  { fr: 'un crayon', zh: '铅笔' },
  { fr: 'une gomme', zh: '橡皮' },
  { fr: 'une règle', zh: '尺子' },
  { fr: 'un stylo', zh: '圆珠笔' },
  { fr: 'un livre', zh: '书' },
  { fr: 'un dictionnaire', zh: '字典' },
  { fr: 'une feuille', zh: '活页纸' },
  { fr: 'un cartable', zh: '活页夹' },
  { fr: 'un surligneur', zh: '荧光笔' },
  { fr: 'une trousse', zh: '笔袋' },
  { fr: 'des ciseaux', zh: '剪刀' },
]

// Classroom instructions
export const CLASSROOM_INSTRUCTIONS = [
  { fr: 'Ouvrez votre livre', zh: '打开书' },
  { fr: 'Fermez votre livre', zh: '合上书' },
  { fr: 'Écoutez et répétez', zh: '听并跟读' },
  { fr: 'Lisez le texte', zh: '阅读课文' },
  { fr: 'Écrivez la réponse', zh: '写下答案' },
  { fr: 'Levez la main', zh: '举手' },
  { fr: 'Regardez le tableau', zh: '看黑板' },
  { fr: 'Soulignez les mots', zh: '划出单词' },
  { fr: 'Prenez votre cahier', zh: '拿出练习本' },
  { fr: 'Travaillez à deux', zh: '两人一组合作' },
]

// Helpers for article contractions and prepositions
// Works with objects having { base, gender, number, vowel }
export function prepDe(noun) {
  if (noun.number === 'p') return `des ${noun.base}`
  if (noun.vowel) return `de l’${noun.base}`
  if (noun.gender === 'f') return `de la ${noun.base}`
  return `du ${noun.base}`
}

export function prepA(noun) {
  if (noun.number === 'p') return `aux ${noun.base}`
  if (noun.vowel) return `à l’${noun.base}`
  if (noun.gender === 'f') return `à la ${noun.base}`
  return `au ${noun.base}`
}

export function artDef(noun) {
  if (noun.number === 'p') return `les ${noun.base}`
  if (noun.vowel) return `l’${noun.base}`
  if (noun.gender === 'f') return `la ${noun.base}`
  return `le ${noun.base}`
}

export function artIndef(noun) {
  if (noun.number === 'p') return `des ${noun.base}`
  if (noun.gender === 'f') return `une ${noun.base}`
  return `un ${noun.base}`
}

export function aCoteDe(noun) {
  return `à côté ${prepDe(noun)}`
}

export function presDe(noun) {
  return `près ${prepDe(noun)}`
}

export function enFaceDe(noun) {
  return `en face ${prepDe(noun)}`
}

// Food items with grammatical gender, number, vowel flag, matched selling units, and Chinese gloss
export const FOOD_ITEMS = [
  { base: 'café', gender: 'm', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '咖啡' },
  { base: 'farine', gender: 'f', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '面粉' },
  { base: 'huile', gender: 'f', number: 's', vowel: true, unitFr: 'le litre', unitShort: 'L', zh: '油' },
  { base: 'pâtes', gender: 'f', number: 'p', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '意面' },
  { base: 'pommes', gender: 'f', number: 'p', vowel: true, unitFr: 'la livre', unitShort: 'lb', zh: '苹果' },
  { base: 'lait', gender: 'm', number: 's', vowel: false, unitFr: 'le litre', unitShort: 'L', zh: '牛奶' },
  { base: 'riz', gender: 'm', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '大米' },
  { base: 'pain', gender: 'm', number: 's', vowel: false, unitFr: 'l’unité', unitShort: 'unité', zh: '面包' },
  { base: 'œufs', gender: 'm', number: 'p', vowel: true, unitFr: 'la douzaine', unitShort: 'douzaine', zh: '鸡蛋' },
  { base: 'fromage', gender: 'm', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '奶酪' },
  { base: 'sucre', gender: 'm', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '糖' },
  { base: 'beurre', gender: 'm', number: 's', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '黄油' },
  { base: 'tomates', gender: 'f', number: 'p', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '西红柿' },
  { base: 'bananes', gender: 'f', number: 'p', vowel: false, unitFr: 'la livre', unitShort: 'lb', zh: '香蕉' },
  { base: 'oranges', gender: 'f', number: 'p', vowel: true, unitFr: 'la livre', unitShort: 'lb', zh: '橙子' },
  { base: 'muffins', gender: 'm', number: 'p', vowel: false, unitFr: 'la douzaine', unitShort: 'douzaine', zh: '松饼' },
  { base: 'jus d’orange', gender: 'm', number: 's', vowel: false, unitFr: 'le litre', unitShort: 'L', zh: '橙汁' },
]

// Places, shops and services with grammatical gender and contractions
export const PLACES_SERVICES = [
  { fr: 'l’épicerie', base: 'épicerie', gender: 'f', number: 's', vowel: true, au: 'à l’épicerie', du: 'de l’épicerie', zh: '杂货店' },
  { fr: 'la pharmacie', base: 'pharmacie', gender: 'f', number: 's', vowel: false, au: 'à la pharmacie', du: 'de la pharmacie', zh: '药店' },
  { fr: 'le dépanneur', base: 'dépanneur', gender: 'm', number: 's', vowel: false, au: 'au dépanneur', du: 'du dépanneur', zh: '便利店' },
  { fr: 'la bibliothèque', base: 'bibliothèque', gender: 'f', number: 's', vowel: false, au: 'à la bibliothèque', du: 'de la bibliothèque', zh: '图书馆' },
  { fr: 'la caisse populaire', base: 'caisse populaire', gender: 'f', number: 's', vowel: false, au: 'à la caisse populaire', du: 'de la caisse populaire', zh: '信用合作社' },
  { fr: 'le bureau de poste', base: 'bureau de poste', gender: 'm', number: 's', vowel: false, au: 'au bureau de poste', du: 'du bureau de poste', zh: '邮局' },
  { fr: 'le centre communautaire', base: 'centre communautaire', gender: 'm', number: 's', vowel: false, au: 'au centre communautaire', du: 'du centre communautaire', zh: '社区中心' },
  { fr: 'l’hôpital', base: 'hôpital', gender: 'm', number: 's', vowel: true, au: 'à l’hôpital', du: 'de l’hôpital', zh: '医院' },
  { fr: 'la clinique médicale', base: 'clinique médicale', gender: 'f', number: 's', vowel: false, au: 'à la clinique médicale', du: 'de la clinique médicale', zh: '诊所' },
  { fr: 'le supermarché', base: 'supermarché', gender: 'm', number: 's', vowel: false, au: 'au supermarché', du: 'du supermarché', zh: '超市' },
  { fr: 'la boulangerie', base: 'boulangerie', gender: 'f', number: 's', vowel: false, au: 'à la boulangerie', du: 'de la boulangerie', zh: '面包店' },
  { fr: 'la piscine municipale', base: 'piscine municipale', gender: 'f', number: 's', vowel: false, au: 'à la piscine municipale', du: 'de la piscine municipale', zh: '市政游泳池' },
]

// Family relations
export const FAMILY_RELATIONS = [
  { termFr: 'votre père', ansFr: 'mon père', childAnsFr: 'son père', gender: 'm', otherFr: 'mon oncle', zh: '父亲', otherZh: '叔伯 / 舅舅' },
  { termFr: 'votre mère', ansFr: 'ma mère', childAnsFr: 'sa mère', gender: 'f', otherFr: 'ma tante', zh: '母亲', otherZh: '姑姑 / 阿姨' },
  { termFr: 'votre frère', ansFr: 'mon frère', childAnsFr: 'son frère', gender: 'm', otherFr: 'mon cousin', zh: '兄弟', otherZh: '堂 / 表兄弟' },
  { termFr: 'votre sœur', ansFr: 'ma sœur', childAnsFr: 'sa sœur', gender: 'f', otherFr: 'ma cousine', zh: '姐妹', otherZh: '堂 / 表姐妹' },
  { termFr: 'votre oncle', ansFr: 'mon oncle', childAnsFr: 'son oncle', gender: 'm', otherFr: 'mon père', zh: '叔伯 / 舅舅', otherZh: '父亲' },
  { termFr: 'votre tante', ansFr: 'ma tante', childAnsFr: 'sa tante', gender: 'f', otherFr: 'ma mère', zh: '姑姑 / 阿姨', otherZh: '母亲' },
  { termFr: 'votre grand-père', ansFr: 'mon grand-père', childAnsFr: 'son grand-père', gender: 'm', otherFr: 'mon père', zh: '祖父 / 外祖父', otherZh: '父亲' },
  { termFr: 'votre grand-mère', ansFr: 'ma grand-mère', childAnsFr: 'sa grand-mère', gender: 'f', otherFr: 'ma mère', zh: '祖母 / 外祖母', otherZh: '母亲' },
  { termFr: 'votre fils', ansFr: 'mon fils', childAnsFr: 'son fils', gender: 'm', otherFr: 'mon neveu', zh: '儿子', otherZh: '侄子 / 外甥' },
  { termFr: 'votre fille', ansFr: 'ma fille', childAnsFr: 'sa fille', gender: 'f', otherFr: 'ma nièce', zh: '女儿', otherZh: '侄女 / 外甥女' },
  { termFr: 'votre cousin', ansFr: 'mon cousin', childAnsFr: 'son cousin', gender: 'm', otherFr: 'mon frère', zh: '堂 / 表兄弟', otherZh: '兄弟' },
]

// Payment methods in Québec
export const PAYMENT_METHODS = [
  { fr: 'par carte de débit', zh: '借记卡 / 银行卡', short: 'carte de débit' },
  { fr: 'par carte de crédit', zh: '信用卡', short: 'carte de crédit' },
  { fr: 'en argent comptant', zh: '现金', short: 'argent comptant' },
  { fr: 'par virement Interac', zh: 'Interac 转账', short: 'virement Interac' },
  { fr: 'par chèque', zh: '支票', short: 'chèque' },
]

// Directions
export const SIMPLE_DIRECTIONS = [
  { fr: 'au fond, à droite', zh: '走到底右转', shortFr: 'à droite', kw: 'droite' },
  { fr: 'au fond, à gauche', zh: '走到底左转', shortFr: 'à gauche', kw: 'gauche' },
  { fr: 'tout droit', zh: '直走', shortFr: 'tout droit', kw: 'droit' },
  { fr: 'à côté de l’entrée', zh: '在入口旁边', shortFr: 'près de l’entrée', kw: 'entrée' },
  { fr: 'près des escaliers', zh: '在楼梯旁边', shortFr: 'près des escaliers', kw: 'escaliers' },
  { fr: 'en face de l’ascenseur', zh: '在电梯对面', shortFr: 'en face de l’ascenseur', kw: 'ascenseur' },
  { fr: 'au deuxième étage', zh: '在二楼', shortFr: 'au deuxième étage', kw: 'étage' },
  { fr: 'au rez-de-chaussée', zh: '在一楼', shortFr: 'au rez-de-chaussée', kw: 'rez-de-chaussée' },
  { fr: 'au sous-sol', zh: '在地下室', shortFr: 'au sous-sol', kw: 'sous-sol' },
  { fr: 'au coin de la rue', zh: '在街角', shortFr: 'au coin', kw: 'coin' },
]

// Number formatting to French in words (0 - 9999) with grammatical hyphens and plural rules
export function numberToFrench(n) {
  if (n === 0) return 'zéro'
  const UNITS = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

  function under100(num) {
    if (num === 0) return ''
    if (num < 20) return UNITS[num]
    if (num < 70) {
      const ten = Math.floor(num / 10)
      const rem = num % 10
      if (rem === 0) return TENS[ten]
      if (rem === 1) return `${TENS[ten]} et un`
      return `${TENS[ten]}-${UNITS[rem]}`
    }
    if (num < 80) {
      const rem = num - 60
      if (rem === 11) return 'soixante et onze'
      return `soixante-${under100(rem)}`
    }
    if (num === 80) return 'quatre-vingts'
    if (num < 100) {
      const rem = num - 80
      return `quatre-vingt-${under100(rem)}`
    }
    return ''
  }

  function under1000(num) {
    if (num === 0) return ''
    if (num < 100) return under100(num)
    const h = Math.floor(num / 100)
    const rem = num % 100
    const prefix = h === 1 ? 'cent' : `${UNITS[h]} cent`
    if (rem === 0) {
      return h === 1 ? 'cent' : `${UNITS[h]} cents`
    }
    return `${prefix} ${under100(rem)}`
  }

  if (n < 1000) return under1000(n)

  const m = Math.floor(n / 1000)
  const rem = n % 1000
  const mPrefix = m === 1 ? 'mille' : `${under1000(m)} mille`
  if (rem === 0) return mPrefix
  return `${mPrefix} ${under1000(rem)}`
}

// Authentic pictograms with emoji for n1-reading-3
export const PICTOGRAMS = [
  { emoji: '🚻', fr: 'toilettes', zh: '洗手间 / 厕所' },
  { emoji: '🚪', fr: 'sortie', zh: '出口' },
  { emoji: '🚌', fr: 'arrêt d’autobus', zh: '公交车站' },
  { emoji: '💊', fr: 'pharmacie', zh: '药店' },
  { emoji: '🚭', fr: 'défense de fumer', zh: '禁止吸烟' },
  { emoji: '♿', fr: 'accès fauteuil roulant', zh: '无障碍通道' },
  { emoji: '☎️', fr: 'téléphone', zh: '电话' },
  { emoji: '🅿️', fr: 'stationnement', zh: '停车场' },
  { emoji: '🚇', fr: 'métro', zh: '地铁' },
  { emoji: '🏥', fr: 'hôpital', zh: '医院' },
  { emoji: '🍴', fr: 'cafétéria', zh: '餐厅 / 咖啡厅' },
  { emoji: 'ℹ️', fr: 'information', zh: '问讯处 / 信息台' },
  { emoji: '🛗', fr: 'ascenseur', zh: '电梯' },
  { emoji: '⚠️', fr: 'danger', zh: '危险' },
  { emoji: '🔥', fr: 'sortie de secours', zh: '紧急安全出口' },
  { emoji: '📵', fr: 'cellulaire interdit', zh: '禁止使用手机' },
  { emoji: '🗑️', fr: 'poubelle', zh: '垃圾桶' },
  { emoji: '♻️', fr: 'recyclage', zh: '回收' },
]

// Symbols and abbreviations for n2-reading-2
export const SYMBOLS_ABBREVIATIONS = [
  { abbr: '$', meaningFr: 'dollar', meaningZh: '元 / 加元' },
  { abbr: '¢', meaningFr: 'cent', meaningZh: '分' },
  { abbr: '°C', meaningFr: 'degré Celsius', meaningZh: '摄氏度' },
  { abbr: 'kg', meaningFr: 'kilogramme', meaningZh: '千克 / 公斤' },
  { abbr: 'g', meaningFr: 'gramme', meaningZh: '克' },
  { abbr: 'lb', meaningFr: 'livre (poids)', meaningZh: '磅（重量单位）' },
  { abbr: 'L', meaningFr: 'litre', meaningZh: '升' },
  { abbr: 'ml', meaningFr: 'millilitre', meaningZh: '毫升' },
  { abbr: 'km', meaningFr: 'kilomètre', meaningZh: '千米 / 公里' },
  { abbr: 'h', meaningFr: 'heure', meaningZh: '小时' },
  { abbr: 'min', meaningFr: 'minute', meaningZh: '分钟' },
  { abbr: 'tél.', meaningFr: 'téléphone', meaningZh: '电话' },
  { abbr: 'RDV', meaningFr: 'rendez-vous', meaningZh: '预约 / 约会' },
  { abbr: 'p. ex.', meaningFr: 'par exemple', meaningZh: '例如' },
  { abbr: 'no', meaningFr: 'numéro', meaningZh: '号码 / 门牌号' },
  { abbr: 'app.', meaningFr: 'appartement', meaningZh: '公寓号' },
  { abbr: 'boul.', meaningFr: 'boulevard', meaningZh: '大道' },
  { abbr: 'av.', meaningFr: 'avenue', meaningZh: '大街' },
]

// Elision helpers (handles de, que, le, la, je, ne, se, me, te)
const NON_ELIDABLE_PATTERN = /^(?:8\b|11\b|8\s|11\s|8h|11h|huit|onze|oui|yaourt|yoga|youssef|hockey|halte|hall)\b/i
const ELIDABLE_VOWEL_PATTERN = /^[aeiouyàâäéèêëîïôöùûüÿ]/i
const MUTE_H_PATTERN = /^h[eéèaouiy]/i

export function isElidable(word) {
  if (!word) return false
  const s = String(word).trim()
  if (!s) return false
  const clean = s.replace(/^['"«\s]+/, '')
  if (NON_ELIDABLE_PATTERN.test(clean)) return false
  if (MUTE_H_PATTERN.test(clean)) return true
  return ELIDABLE_VOWEL_PATTERN.test(clean)
}

export function elide(prefix, word) {
  if (!word) return prefix
  const w = String(word)
  if (isElidable(w)) {
    const p = prefix.toLowerCase()
    if (p === 'de') return `d’${w}`
    if (p === 'que') return `qu’${w}`
    if (p === 'le' || p === 'la') return `l’${w}`
    if (p === 'je') return `j’${w}`
    if (p === 'ne') return `n’${w}`
    if (p === 'se') return `s’${w}`
    if (p === 'me') return `m’${w}`
    if (p === 'te') return `t’${w}`
    if (p === 'ce') return `c’${w}`
    return `${prefix.slice(0, -1)}’${w}`
  }
  return `${prefix} ${w}`
}

export function de(word) {
  return elide('de', word)
}

export function que(word) {
  return elide('que', word)
}

export function le(word) {
  return elide('le', word)
}

export function la(word) {
  return elide('la', word)
}

export function l(word) {
  return elide('le', word)
}

export function je(word) {
  return elide('je', word)
}

export function ne(word) {
  return elide('ne', word)
}

export function se(word) {
  return elide('se', word)
}

export function me(word) {
  return elide('me', word)
}

export function te(word) {
  return elide('te', word)
}

// Gratitude helper for "merci de / merci d’avoir / merci pour + nom"
export function merciDe(target) {
  if (!target) return ''
  const s = String(target)
  if (/^avoir\b/i.test(s)) return `d’${s}`
  if (/^m’avoir\b/i.test(s)) return `de ${s}`
  if (/^être\b/i.test(s)) return `d’${s}`
  return `pour ${s}`
}

// Prepositions for institutions & organisations (gender-aware: un CPE, un Service de garde, une Clinique, etc.)
export function auOrg(org) {
  if (typeof org === 'object' && org?.au) return org.au
  const name = typeof org === 'object' ? org.name : String(org)
  const gender = typeof org === 'object' && org.gender ? org.gender : (/^(CPE|Centre|Service|CLSC)\b/i.test(name) ? 'm' : 'f')
  if (isElidable(name)) return `à l’${name}`
  return gender === 'm' ? `au ${name}` : `à la ${name}`
}

export function deOrg(org) {
  if (typeof org === 'object' && org?.du) return org.du
  const name = typeof org === 'object' ? org.name : String(org)
  const gender = typeof org === 'object' && org.gender ? org.gender : (/^(CPE|Centre|Service|CLSC)\b/i.test(name) ? 'm' : 'f')
  if (isElidable(name)) return `d’${name}`
  return gender === 'm' ? `du ${name}` : `de la ${name}`
}

// Agreement helpers for slot nouns
export function verbSeTrouver(noun) {
  return noun?.number === 'p' ? 'se trouvent' : 'se trouve'
}

export function verbEtre(noun) {
  return noun?.number === 'p' ? 'sont' : 'est'
}

export function pronSujet(noun) {
  if (noun?.number === 'p') return noun?.gender === 'f' ? 'elles' : 'ils'
  return noun?.gender === 'f' ? 'elle' : 'il'
}

export function adjSitue(noun) {
  if (noun?.number === 'p') return noun?.gender === 'f' ? 'situées' : 'situés'
  return noun?.gender === 'f' ? 'située' : 'situé'
}

export function cher(persona) {
  return g(persona, 'Cher', 'Chère')
}

export function au(word) {
  if (!word) return 'au'
  const w = String(word).trim()
  if (isElidable(w)) return `à l’${w}`
  return `au ${w}`
}

export function du(word) {
  if (!word) return 'du'
  const w = String(word).trim()
  if (isElidable(w)) return `d’${w}`
  return `du ${w}`
}

export function q(prompt, correct, d1, d2, evidence) {
  const row = [prompt, correct, d1, d2]
  if (evidence) {
    row.evidence = (Array.isArray(evidence) ? evidence : [evidence]).map((e) => String(e).toLowerCase().trim())
  }
  return row
}

