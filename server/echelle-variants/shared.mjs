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

// Personas: first name, gender ('m' | 'f').
// Reflects diverse origins of Québec newcomers (Latin America, Maghreb, West Africa, Haiti, Asia, Europe).
export const PERSONAS = [
  { name: 'Ana', gender: 'f' },
  { name: 'Lucia', gender: 'f' },
  { name: 'Sofia', gender: 'f' },
  { name: 'Carlos', gender: 'm' },
  { name: 'Mateo', gender: 'm' },
  { name: 'Fatima', gender: 'f' },
  { name: 'Amina', gender: 'f' },
  { name: 'Youssef', gender: 'm' },
  { name: 'Karim', gender: 'm' },
  { name: 'Amadou', gender: 'm' },
  { name: 'Mariam', gender: 'f' },
  { name: 'Jean-Baptiste', gender: 'm' },
  { name: 'Daphnée', gender: 'f' },
  { name: 'Jin', gender: 'm' },
  { name: 'Mei', gender: 'f' },
  { name: 'Tariq', gender: 'm' },
  { name: 'Priya', gender: 'f' },
  { name: 'Marc', gender: 'm' },
  { name: 'Émilie', gender: 'f' },
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

// Places, shops and services
export const PLACES_SERVICES = [
  { fr: 'l’épicerie', zh: '杂货店' },
  { fr: 'la pharmacie', zh: '药店' },
  { fr: 'le dépanneur', zh: '便利店' },
  { fr: 'la bibliothèque', zh: '图书馆' },
  { fr: 'la caisse populaire', zh: '信用合作社' },
  { fr: 'le bureau de poste', zh: '邮局' },
  { fr: 'le centre communautaire', zh: '社区中心' },
  { fr: 'l’hôpital', zh: '医院' },
  { fr: 'la clinique médicale', zh: '诊所' },
  { fr: 'le supermarché', zh: '超市' },
  { fr: 'la boulangerie', zh: '面包店' },
  { fr: 'la piscine municipale', zh: '市政游泳池' },
]

// Family relations
export const FAMILY_RELATIONS = [
  { termFr: 'votre père', ansFr: 'mon père', otherFr: 'mon oncle', zh: '父亲', otherZh: '叔伯 / 舅舅' },
  { termFr: 'votre mère', ansFr: 'ma mère', otherFr: 'ma tante', zh: '母亲', otherZh: '姑姑 / 阿姨' },
  { termFr: 'votre frère', ansFr: 'mon frère', otherFr: 'mon cousin', zh: '兄弟', otherZh: '堂 / 表兄弟' },
  { termFr: 'votre sœur', ansFr: 'ma sœur', otherFr: 'ma cousine', zh: '姐妹', otherZh: '堂 / 表姐妹' },
  { termFr: 'votre oncle', ansFr: 'mon oncle', otherFr: 'mon père', zh: '叔伯 / 舅舅', otherZh: '父亲' },
  { termFr: 'votre tante', ansFr: 'ma tante', otherFr: 'ma mère', zh: '姑姑 / 阿姨', otherZh: '母亲' },
  { termFr: 'votre grand-père', ansFr: 'mon grand-père', otherFr: 'mon père', zh: '祖父 / 外祖父', otherZh: '父亲' },
  { termFr: 'votre grand-mère', ansFr: 'ma grand-mère', otherFr: 'ma mère', zh: '祖母 / 外祖母', otherZh: '母亲' },
  { termFr: 'votre fils', ansFr: 'mon fils', otherFr: 'mon neveu', zh: '儿子', otherZh: '侄子 / 外甥' },
  { termFr: 'votre fille', ansFr: 'ma fille', otherFr: 'ma nièce', zh: '女儿', otherZh: '侄女 / 外甥女' },
  { termFr: 'votre cousin', ansFr: 'mon cousin', otherFr: 'mon frère', zh: '堂 / 表兄弟', otherZh: '兄弟' },
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
  { fr: 'au fond, à droite', zh: '走到底右转', shortFr: 'à droite' },
  { fr: 'au fond, à gauche', zh: '走到底左转', shortFr: 'à gauche' },
  { fr: 'tout droit', zh: '直走', shortFr: 'tout droit' },
  { fr: 'à côté de l’entrée', zh: '在入口旁边', shortFr: 'près de l’entrée' },
  { fr: 'près des escaliers', zh: '在楼梯旁边', shortFr: 'près des escaliers' },
  { fr: 'en face de l’ascenseur', zh: '在电梯对面', shortFr: 'en face de l’ascenseur' },
  { fr: 'au deuxième étage', zh: '在二楼', shortFr: 'au 2e étage' },
  { fr: 'au rez-de-chaussée', zh: '在一楼', shortFr: 'au rez-de-chaussée' },
  { fr: 'au sous-sol', zh: '在地下室', shortFr: 'au sous-sol' },
  { fr: 'au coin de la rue', zh: '在街角', shortFr: 'au coin' },
]
