// Échelle québécoise practice content scenarios for Niveaux 3 & 4.
// Covers both official situations types (examples) for every listening and reading indicator.
// All indicators yield >= 40 distinct texts across 300 seeded builds.

import { pick, sample, q, cher, au, du, g } from './shared.mjs'

// Helper to count words identically to the evaluation harness
export function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length
}

export function de(word) {
  const w = String(word).trim()
  if (/^[aeiouéèêàâîôûh]/i.test(w)) return `d’${w}`
  return `de ${w}`
}

export function a(word) {
  const w = String(word).trim()
  if (/^[aeiouéèêàâîôûh]/i.test(w)) return `à l’${w}`
  return `à ${w}`
}

// ===========================================================================
// NIVEAU 3 SCENARIOS IMPLEMENTATION
// ===========================================================================

// ---------------------------------------------------------------------------
// n3-listening-0
// ---------------------------------------------------------------------------
const N3_SUPERMARKETS = [
  { name: 'Metro', fee: '50 dollars', minZh: '50 加元' },
  { name: 'IGA', fee: '60 dollars', minZh: '60 加元' },
  { name: 'Maxi', fee: '45 dollars', minZh: '45 加元' },
  { name: 'Super C', fee: '55 dollars', minZh: '55 加元' },
  { name: 'Provigo', fee: '65 dollars', minZh: '65 加元' },
]
const N3_SUPERMARKET_SCHEDS = [
  { daysFr: 'le mardi et le jeudi', daysZh: '周二和周四', hoursFr: 'entre 13 h et 17 h' },
  { daysFr: 'le lundi et le mercredi', daysZh: '周一和周三', hoursFr: 'entre 10 h et 14 h' },
  { daysFr: 'le mercredi et le vendredi', daysZh: '周三和周五', hoursFr: 'entre 14 h et 18 h' },
  { daysFr: 'le vendredi et le samedi', daysZh: '周五和周六', hoursFr: 'entre 9 h et 13 h' },
]
const N3_TRANSIT_NETS = [
  { agency: 'de la STM à Montréal', card: 'carte OPUS', fareFr: '3 dollars 75', fareZh: '3,75 加元' },
  { agency: 'du RTC à Québec', card: 'carte OPUS', fareFr: '3 dollars 50', fareZh: '3,50 加元' },
  { agency: 'de la STL à Laval', card: 'carte Horizon', fareFr: '3 dollars 50', fareZh: '3,50 加元' },
  { agency: 'de la STS à Sherbrooke', card: 'carte La Vermeille', fareFr: '3 dollars 30', fareZh: '3,30 加元' },
]
const N3_TRANSIT_PASS_LIST = [
  { passFr: 'soirée illimitée', passZh: '晚间通票', priceFr: '6 dollars' },
  { passFr: 'fin de semaine', passZh: '周末通票', priceFr: '15 dollars' },
  { passFr: 'mensuel régulier', passZh: '月度通票', priceFr: '94 dollars' },
  { passFr: 'une journée', passZh: '单日通票', priceFr: '11 dollars' },
]
const N3_PHARMACY_DELIVERIES = [
  { name: 'Jean Coutu', minFr: '40 dollars', minZh: '40 加元', daysFr: 'le mardi et le jeudi', daysZh: '周二和周四' },
  { name: 'Pharmaprix', minFr: '50 dollars', minZh: '50 加元', daysFr: 'le lundi et le mercredi', daysZh: '周一和周三' },
  { name: 'Brunet', minFr: '35 dollars', minZh: '35 加元', daysFr: 'le mercredi et le vendredi', daysZh: '周三和周五' },
  { name: 'Familiprix', minFr: '45 dollars', minZh: '45 加元', daysFr: 'le vendredi et le samedi', daysZh: '周五和周六' },
  { name: 'Uniprix', minFr: '30 dollars', minZh: '30 加元', daysFr: 'le mardi et le vendredi', daysZh: '周二和周五' },
]
const N3_LIBRARY_MEMBERSHIPS = [
  { city: 'de Longueuil', feeFr: '15 dollars', feeZh: '15 加元', limitFr: 'dix livres', limitZh: '10 本图书' },
  { city: 'de Lévis', feeFr: '20 dollars', feeZh: '20 加元', limitFr: 'quinze livres', limitZh: '15 本图书' },
  { city: 'de Gatineau', feeFr: '25 dollars', feeZh: '25 加元', limitFr: 'douze livres', limitZh: '12 本图书' },
  { city: 'de Laval', feeFr: '10 dollars', feeZh: '10 加元', limitFr: 'huit livres', limitZh: '8 本图书' },
  { city: 'de Sherbrooke', feeFr: '12 dollars', feeZh: '12 加元', limitFr: 'six livres', limitZh: '6 本图书' },
]

export const N03_L_0 = [
  // Scenario 1 (Template, situation: 0) - Livraison d'épicerie en ligne
  Object.assign(
    (rand) => {
      const store = pick(N3_SUPERMARKETS, rand)
      const sched = pick(N3_SUPERMARKET_SCHEDS, rand)
      const othersFee = sample(N3_SUPERMARKETS.filter(s => s.minZh !== store.minZh), 2, rand)
      const othersSched = sample(N3_SUPERMARKET_SCHEDS.filter(s => s.daysZh !== sched.daysZh), 2, rand)
      const text = `Pour la livraison à domicile avec ${store.name}, le service est gratuit à partir de ${store.fee}. Le chauffeur passe ${sched.daysFr}, habituellement ${sched.hoursFr}.`
      return {
        text,
        questions: [
          q('满多少金额可以享受免费送货？', store.minZh, othersFee[0].minZh, othersFee[1].minZh, [store.name.toLowerCase(), 'gratuit']),
          q('超市在哪几天安排送货？', sched.daysZh, othersSched[0].daysZh, othersSched[1].daysZh, [sched.daysFr.toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N3_SUPERMARKETS.length * N3_SUPERMARKET_SCHEDS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Titres et tarifs de transport urbain
  Object.assign(
    (rand) => {
      const transit = pick(N3_TRANSIT_NETS, rand)
      const pass = pick(N3_TRANSIT_PASS_LIST, rand)
      const othersFare = sample(['3,00 加元', '4,25 加元', '2,75 加元', '3,90 加元'].filter(f => f !== transit.fareZh), 2, rand)
      const othersPass = sample(N3_TRANSIT_PASS_LIST.filter(p => p.passZh !== pass.passZh), 2, rand)
      const text = `Pour utiliser le réseau ${transit.agency}, un passage unitaire coûte ${transit.fareFr}. Le titre ${pass.passFr} coûte ${pass.priceFr}. N’oubliez pas de valider votre carte sur la borne.`
      return {
        text,
        questions: [
          q('单程车票的价格是多少？', transit.fareZh, othersFare[0], othersFare[1], [transit.agency.split(' ')[0].toLowerCase(), 'coûte']),
          q('被介绍的通票类型是？', pass.passZh, othersPass[0].passZh, othersPass[1].passZh, [pass.passFr.toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N3_TRANSIT_NETS.length * N3_TRANSIT_PASS_LIST.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Pharmacie à domicile)
  Object.assign(
    (rand) => {
      const pharm = pick(N3_PHARMACY_DELIVERIES, rand)
      const othersMin = sample(N3_PHARMACY_DELIVERIES.filter(p => p.minZh !== pharm.minZh), 2, rand)
      const othersDays = sample(N3_PHARMACY_DELIVERIES.filter(p => p.daysZh !== pharm.daysZh), 2, rand)
      const text = `À la pharmacie ${pharm.name}, la livraison des ordonnances à domicile est sans frais dès ${pharm.minFr} d’achats. Le commis livre ${pharm.daysFr} en après-midi.`
      return {
        text,
        questions: [
          q('药房满多少金额免收配送费？', pharm.minZh, othersMin[0].minZh, othersMin[1].minZh, [pharm.name.toLowerCase(), 'achats']),
          q('送药上门服务安排在哪几天？', pharm.daysZh, othersDays[0].daysZh, othersDays[1].daysZh, [pharm.daysFr.toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N3_PHARMACY_DELIVERIES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Bibliothèque municipale)
  Object.assign(
    (rand) => {
      const lib = pick(N3_LIBRARY_MEMBERSHIPS, rand)
      const othersFee = sample(N3_LIBRARY_MEMBERSHIPS.filter(l => l.feeZh !== lib.feeZh), 2, rand)
      const othersLimit = sample(N3_LIBRARY_MEMBERSHIPS.filter(l => l.limitZh !== lib.limitZh), 2, rand)
      const text = `À la bibliothèque municipale ${lib.city}, l’abonnement annuel coûte ${lib.feeFr} par adulte. La carte permet d’emprunter jusqu’à ${lib.limitFr} pour trois semaines complètes.`
      return {
        text,
        questions: [
          q('居民办理图书借阅的年费是？', lib.feeZh, othersFee[0].feeZh, othersFee[1].feeZh, [lib.city.toLowerCase(), 'abonnement']),
          q('读者一次最多可以借多少书？', lib.limitZh, othersLimit[0].limitZh, othersLimit[1].limitZh, [lib.limitFr.toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N3_LIBRARY_MEMBERSHIPS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Supermarché Provigo
  {
    situation: 0,
    text: 'Bienvenue chez Provigo. Pour faire livrer votre épicerie chez vous, le panier d’achats doit atteindre au moins 60 dollars. Nous livrons du lundi au vendredi jusqu’à 19 heures.',
    questions: [
      q('最低购物金额是多少才能送货？', '60 加元', '40 加元', '30 加元', ['60', 'dollars']),
      q('超市哪几天提供送货服务？', '周一至周五', '周二至周六', '仅限双休日', ['lundi', 'vendredi']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Titres de transport autobus et métro
  {
    situation: 1,
    text: 'Bonjour madame. Pour circuler dans l’autobus et le métro, vous pouvez acheter un titre de deux passages à sept dollars. C’est valide durant deux heures après la première validation.',
    questions: [
      q('购买两次票的价格是多少？', '7,00 加元', '5,00 加元', '9,00 加元', ['sept dollars']),
      q('车票验证后的有效时长是？', '2 个小时', '4 个小时', '1 个小时', ['deux heures']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-1
// ---------------------------------------------------------------------------
const N3_FORMS = [
  { name: 'la demande d’allocation familiale', topicZh: '家庭津贴申请表', field: '« revenu net »' },
  { name: 'le renouvellement de la carte d’assurance maladie', topicZh: '医保卡更新表', field: '« numéro de référence »' },
  { name: 'l’inscription à la garderie municipale', topicZh: '日托报名表格', field: '« contact d’urgence »' },
  { name: 'le formulaire d’admission au cégep', topicZh: '学院申请表格', field: '« code permanent »' },
]
const N3_WEEKENDS = [
  { act: 'au parc Jean-Drapeau pour faire du vélo', actZh: '去公园骑行', day: 'samedi' },
  { act: 'au Musée national des beaux-arts à Québec', actZh: '去美术馆参观', day: 'dimanche' },
  { act: 'à la cabane à sucre avec ma cousine', actZh: '去枫糖小屋', day: 'samedi' },
  { act: 'en randonnée sur le mont Saint-Hilaire', actZh: '去徒步登山', day: 'dimanche' },
  { act: 'à la patinoire extérieure du quartier', actZh: '去户外滑冰', day: 'samedi' },
]
const N3_OFFICE_CLOSINGS = [
  { place: 'le secrétariat des cours', hour: 'dix-sept heures', placeZh: '课程秘书处' },
  { place: 'le bureau des admissions', hour: 'seize heures', placeZh: '入学招生处' },
  { place: 'la clinique universitaire', hour: 'dix-huit heures', placeZh: '校医务诊所' },
  { place: 'le centre de services aux étudiants', hour: 'dix-sept heures trente', placeZh: '学生服务处' },
  { place: 'le guichet des permis municipaux', hour: 'seize heures trente', placeZh: '市政服务处' },
]
const N3_LUNCH_INVITES = [
  { place: 'au bistro du coin', placeZh: '街角的小餐馆' },
  { place: 'à la pizzeria de la rue Principale', placeZh: '主街的披萨店' },
  { place: 'au café près de la gare', placeZh: '车站旁咖啡厅' },
  { place: 'au restaurant libanais du quartier', placeZh: '社区风味餐馆' },
  { place: 'à la boulangerie artisanale', placeZh: '手作面包餐厅' },
]

export const N03_L_1 = [
  // Scenario 1 (Template, situation: 0) - Demande d'aide pour remplir un formulaire
  Object.assign(
    (rand) => {
      const form = pick(N3_FORMS, rand)
      const friend = pick(['Julie', 'Fatima', 'Carlos', 'Youssef'], rand)
      const othersForm = sample(N3_FORMS.filter(f => f.topicZh !== form.topicZh), 2, rand)
      const text = `— Salut ${friend} ! Est-ce que tu pourrais m’aider avec ${form.name} ? Je ne comprends pas bien la case ${form.field}. Tu as deux minutes ?`
      return {
        text,
        questions: [
          q('朋友需要什么方面的帮助？', `协助填写${form.topicZh}`, `协助填写${othersForm[0].topicZh}`, `协助填写${othersForm[1].topicZh}`, [form.field.replace(/[«»]/g, '').toLowerCase()]),
          q('面对求助，合适的回答是：', 'Oui, je peux regarder avec toi.', 'Non, j’ai déjà envoyé ce document.', 'Oui, j’ai rempli ma propre feuille.', ['aider']),
        ],
      }
    },
    { situation: 0, capacity: N3_FORMS.length * 4 }
  ),
  // Scenario 2 (Template, situation: 1) - Question sur les projets de fin de semaine
  Object.assign(
    (rand) => {
      const plan = pick(N3_WEEKENDS, rand)
      const name = pick(['Antoine', 'Chloé', 'Maxime', 'Amina'], rand)
      const othersPlan = sample(N3_WEEKENDS.filter(p => p.actZh !== plan.actZh), 2, rand)
      const text = `— Bonjour ${name} ! Qu’est-ce que tu as prévu pour la fin de semaine ? — Je vais aller ${plan.act} ce ${plan.day}. Et toi, est-ce que tu fais quelque chose de spécial ?`
      return {
        text,
        questions: [
          q('同事计划在周末做什么？', plan.actZh, othersPlan[0].actZh, othersPlan[1].actZh, [plan.day.toLowerCase()]),
          q('面对询问，合适的回答是：', 'Moi, je vais me reposer à la maison.', 'La réunion d’équipe débute à dix heures.', 'Le rapport complet est envoyé ce matin.', ['prévu']),
        ],
      }
    },
    { situation: 1, capacity: N3_WEEKENDS.length * 4 }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Horaire de fermeture d'un bureau)
  Object.assign(
    (rand) => {
      const off = pick(N3_OFFICE_CLOSINGS, rand)
      const name = pick(['Sophie', 'Mei', 'Karim', 'Amadou'], rand)
      const othersOff = sample(N3_OFFICE_CLOSINGS.filter(o => o.placeZh !== off.placeZh), 2, rand)
      const text = `— Excuse-moi ${name}, est-ce que tu sais si ${off.place} ferme bien à ${off.hour} ? Je dois déposer une feuille importante avant mon départ.`
      return {
        text,
        questions: [
          q('说话人想打听哪个部门的下班时间？', off.placeZh, othersOff[0].placeZh, othersOff[1].placeZh, [off.place.split(' ')[1].toLowerCase()]),
          q('面对询问，合适的回答是：', `Oui, le service ferme à ${off.hour}.`, 'Non, le bureau ouvre à huit heures.', 'Le service est fermé la fin de semaine.', ['ferme']),
        ],
      }
    },
    { situation: 0, capacity: N3_OFFICE_CLOSINGS.length * 4 }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Invitation d'un collègue pour dîner)
  Object.assign(
    (rand) => {
      const lunch = pick(N3_LUNCH_INVITES, rand)
      const colleague = pick(['Jean', 'Émilie', 'Valérie', 'Simon'], rand)
      const othersLunch = sample(N3_LUNCH_INVITES.filter(l => l.placeZh !== lunch.placeZh), 2, rand)
      const text = `— Salut ${colleague} ! Est-ce que ça te tente de venir dîner avec nous ${lunch.place} ce midi ? On part ensemble du bureau vers midi et quart.`
      return {
        text,
        questions: [
          q('同事邀请对方去哪里用餐？', lunch.placeZh, othersLunch[0].placeZh, othersLunch[1].placeZh, [lunch.place.split(' ')[1].toLowerCase()]),
          q('面对邀请，合适的回答是：', 'Avec plaisir, j’arrive dans cinq minutes.', 'La pause pour dîner termine à treize heures.', 'La réunion d’équipe commence à treize heures.', ['dîner']),
        ],
      }
    },
    { situation: 1, capacity: N3_LUNCH_INVITES.length * 4 }
  ),
  // Scenario 5 (Static, situation: 0) - Formulaire de bourse d'études
  {
    situation: 0,
    text: '— Excuse-moi Carlos, est-ce que tu as rempli la demande d’aide financière pour les cours ? Je ne comprends pas où écrire mon numéro d’assurance sociale.',
    questions: [
      q('朋友在咨询关于什么的疑问？', '助学贷款申请表格', '学期学费减免申请', '大学奖学金申请表', ['aide financière']),
      q('面对求助，合适的回答是：', 'Viens, je vais te montrer la case.', 'Non, j’ai déjà envoyé ma demande hier.', 'Oui, la date limite est le trente avril.', ['assurance sociale']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Sortie de camping dans Charlevoix
  {
    situation: 1,
    text: '— Salut Martin ! Tu as des projets pour la longue fin de semaine ? Nous partons deux jours en camping dans Charlevoix s’il fait beau. Tu viens avec nous ?',
    questions: [
      q('马丁被邀请参加什么活动？', '去夏勒瓦地区露营', '在市中心商场购物', '去市立图书馆复习', ['camping', 'Charlevoix']),
      q('面对邀请，合适的回答是：', 'Merci, mais j’ai déjà un engagement.', 'La météo annonce de la pluie samedi.', 'Le trajet dure environ trois heures.', ['projets']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-2
// ---------------------------------------------------------------------------
const N3_CLOTHES = [
  { item: 'un manteau d’hiver', colorM: 'bleu marine', colorZh: '深蓝色', feature: 'très chaud avec un capuchon', discount: 'à moitié prix', reasonZh: '商品享受半价' },
  { item: 'une veste imperméable', colorM: 'noire', colorZh: '深黑色', feature: 'avec de grandes poches', discount: 'en liquidation', reasonZh: '属于清仓甩卖' },
  { item: 'un chandail de laine', colorM: 'vert foncé', colorZh: '墨绿色', feature: 'doux et très confortable', discount: 'avec un bon rabais', reasonZh: '享受降价立减' },
  { item: 'un pantalon chaud', colorM: 'gris foncé', colorZh: '深灰色', feature: 'parfait pour le froid', discount: 'en solde de saison', reasonZh: '属于季末打折' },
  { item: 'un blouson d’automne', colorM: 'brun foncé', colorZh: '深棕色', feature: 'doublé en polaire douce', discount: 'avec un bon rabais', reasonZh: '享受降价立减' },
]
const N3_CLOTH_STORES = ['chez Simons', 'au magasin Winners', 'au centre commercial', 'à la boutique locale', 'chez Aubainerie']

const N3_SICK_LIST = [
  { name: 'Karim', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’un gros rhume avec un peu de fièvre', sympZh: '重感冒伴有低烧' },
  { name: 'Sarah', absent: 's’est absentée ce matin', pronoun: 'Elle', prep: 'd’un mal de gorge très persistant', sympZh: '严重喉咙疼痛' },
  { name: 'Patrick', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’une vilaine grippe saisonnière', sympZh: '患季节性流感' },
  { name: 'Lucia', absent: 's’est absentée ce matin', pronoun: 'Elle', prep: 'd’une migraine intense et de fatigue', sympZh: '偏头痛伴随疲劳' },
  { name: 'David', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’une bronchite assez douloureuse', sympZh: '患急性支气管炎' },
]
const N3_CLINIC_LIST = [
  { clinic: 'à la clinique sans rendez-vous', clinicZh: '免预约门诊部', kw: 'sans rendez-vous' },
  { clinic: 'chez son médecin de famille', clinicZh: '家庭医生诊所', kw: 'médecin de famille' },
  { clinic: 'au centre médical local', clinicZh: '本地医疗中心', kw: 'centre médical' },
  { clinic: 'au cabinet médical du quartier', clinicZh: '社区医生门诊', kw: 'cabinet médical' },
]
const N3_FALSE_CLINICS = [
  '街区连锁药房',
  '医院急诊中心',
  '私人牙医诊所',
  '眼科专科门诊',
]

const N3_APPLIANCES = [
  { item: 'une cafetière programmable', colorFr: 'noire', colorZh: '黑色机身', feat: 'compacte avec une verseuse en verre', purposeFr: 'préparer du bon café le matin', useZh: '快速煮制新鲜咖啡', useKw: 'café' },
  { item: 'un grille-pain électrique', colorFr: 'argenté', colorZh: '银灰机身', feat: 'muni de fentes très larges', purposeFr: 'griller le pain doré', useZh: '均匀烘烤各种面包', useKw: 'pain' },
  { item: 'un four à micro-ondes', colorFr: 'blanc', colorZh: '白色机身', feat: 'doté d’un affichage numérique clair', purposeFr: 'réchauffer les repas rapidement', useZh: '快速加热便当餐食', useKw: 'repas' },
  { item: 'un mélangeur de cuisine', colorFr: 'rouge', colorZh: '深红机身', feat: 'équipé de lames solides en acier', purposeFr: 'mélanger les fruits frais pour les jus', useZh: '轻松搅拌新鲜果汁', useKw: 'fruits' },
]
const N3_APPLIANCE_STORES = ['au magasin Walmart', 'chez Canadian Tire', 'au magasin Best Buy', 'au centre d’achats']

const N3_PETS = [
  { type: 'chaton très affectueux', furFr: 'au pelage gris rayé', furZh: '灰色条纹', featFr: 'doux et très affectueux', featZh: '温顺且非常亲人', kw: 'affectueux', furKw: 'gris' },
  { type: 'chiot très énergique', furFr: 'au pelage brun doré', furZh: '棕褐毛色', featFr: 'plein d’énergie et joyeux', featZh: '精力充沛且开朗', kw: 'énergie', furKw: 'brun' },
  { type: 'jeune chat calme', furFr: 'au pelage noir et blanc', furZh: '黑白相间', featFr: 'très calme et attentif', featZh: '非常安静且专注', kw: 'calme', furKw: 'noir' },
  { type: 'petit chien timide', furFr: 'au pelage blanc pur', furZh: '纯白毛色', featFr: 'très timide et réservé', featZh: '非常胆小且害羞', kw: 'timide', furKw: 'blanc' },
]
const N3_SHELTER_LOCS = ['de Québec', 'de Montréal', 'de Laval', 'de Sherbrooke']

export const N03_L_2 = [
  // Scenario 1 (Template, situation: 0) - Achat de vêtement chaud en solde
  Object.assign(
    (rand) => {
      const c = pick(N3_CLOTHES, rand)
      const store = pick(N3_CLOTH_STORES, rand)
      const othersColor = sample(N3_CLOTHES.filter(x => x.colorZh !== c.colorZh), 2, rand)
      const falseReasons = ['附赠精美礼品', '免除配送费用', '赠送双倍积分', '附带延长保修']
      const othersReason = sample(falseReasons, 2, rand)
      const text = `Regarde, je viens d’acheter ${c.item} ${c.colorM}. C’est ${c.feature}, parfait pour l’hiver au Québec. En plus, c’était ${c.discount} ${store}.`
      return {
        text,
        questions: [
          q('购买的衣物是什么颜色？', c.colorZh, othersColor[0].colorZh, othersColor[1].colorZh, [c.colorM.split(' ')[0].toLowerCase()]),
          q('为什么这次购物很划算？', c.reasonZh, othersReason[0], othersReason[1], [c.discount.split(' ')[0].toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N3_CLOTHES.length * N3_CLOTH_STORES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Collègue malade absent
  Object.assign(
    (rand) => {
      const p = pick(N3_SICK_LIST, rand)
      const clinic = pick(N3_CLINIC_LIST, rand)
      const othersSymp = sample(N3_SICK_LIST.filter(x => x.sympZh !== p.sympZh), 2, rand)
      const othersClinic = sample(N3_FALSE_CLINICS, 2, rand)
      const text = `Notre collègue ${p.name} ne sera pas là aujourd’hui. ${p.pronoun} souffre ${p.prep}. Le médecin consulté ${clinic.clinic} lui a recommandé trois jours de repos complet au lit.`
      return {
        text,
        questions: [
          q('生病的同事出现了什么症状？', p.sympZh, othersSymp[0].sympZh, othersSymp[1].sympZh, [p.prep.split(' ')[1].toLowerCase()]),
          q('同事去哪里看了医生？', clinic.clinicZh, othersClinic[0], othersClinic[1], [clinic.kw.toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N3_SICK_LIST.length * N3_CLINIC_LIST.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Nouvel appareil de cuisine)
  Object.assign(
    (rand) => {
      const app = pick(N3_APPLIANCES, rand)
      const st = pick(N3_APPLIANCE_STORES, rand)
      const othersColor = sample(N3_APPLIANCES.filter(x => x.colorZh !== app.colorZh), 2, rand)
      const othersUse = sample(N3_APPLIANCES.filter(x => x.useZh !== app.useZh), 2, rand)
      const text = `J’ai acheté ${app.item} ${app.colorFr} en solde ${st}. L’appareil est ${app.feat}, idéal pour ${app.purposeFr}.`
      return {
        text,
        questions: [
          q('买到的厨房电器外观颜色是？', app.colorZh, othersColor[0].colorZh, othersColor[1].colorZh, [app.colorFr]),
          q('这款电器的主要实用功能是？', app.useZh, othersUse[0].useZh, othersUse[1].useZh, [app.useKw]),
        ],
      }
    },
    { situation: 0, capacity: N3_APPLIANCES.length * N3_APPLIANCE_STORES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Animal de compagnie adopté)
  Object.assign(
    (rand) => {
      const pet = pick(N3_PETS, rand)
      const loc = pick(N3_SHELTER_LOCS, rand)
      const othersFur = sample(N3_PETS.filter(x => x.furZh !== pet.furZh), 2, rand)
      const othersFeat = sample(N3_PETS.filter(x => x.featZh !== pet.featZh), 2, rand)
      const text = `Au refuge pour animaux ${loc}, nous avons choisi un ${pet.type} ${pet.furFr}. L’animal est ${pet.featFr}. Nous sommes ravis de l’accueillir à la maison.`
      return {
        text,
        questions: [
          q('在收容所挑选的动物毛色是？', pet.furZh, othersFur[0].furZh, othersFur[1].furZh, [pet.furKw]),
          q('这只小动物表现出的性格是？', pet.featZh, othersFeat[0].featZh, othersFeat[1].featZh, [pet.kw]),
        ],
      }
    },
    { situation: 1, capacity: N3_PETS.length * N3_SHELTER_LOCS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Écharpe en laine et mitaines
  {
    situation: 0,
    text: 'J’ai acheté une écharpe en laine brune et des mitaines épaisses. Les deux articles étaient en solde pour vingt dollars au total au magasin de la rue Saint-Denis.',
    questions: [
      q('买到的围巾是什么颜色？', '棕色毛线', '黑色毛线', '深蓝毛线', ['brune']),
      q('购买这两样物品共花了多少钱？', '20 加元', '35 加元', '50 加元', ['vingt dollars']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Collègue atteint d'une laryngite
  {
    situation: 1,
    text: 'Marc nous a écrit ce matin. Il a une laryngite et a complètement perdu sa voix. Le médecin lui a prescrit du repos et des tisanes chaudes pour toute la semaine.',
    questions: [
      q('马克身体有什么具体不适？', '得了喉炎并且失声', '偏头痛伴随有低烧', '扭伤手腕无法写字', ['laryngite']),
      q('医生给马克的治疗建议是？', '充分休息并喝热茶', '按时服用消炎胶囊', '佩戴护具卧床静养', ['repos', 'tisanes']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-3
// ---------------------------------------------------------------------------
const N3_MED_DOSAGES = [
  { med: 'ce sirop pour la toux', dose: 'une cuillère', freq: 'deux fois par jour', freqZh: '每天 2 次', moment: 'après le déjeuner et le souper', dur: 'pendant cinq jours' },
  { med: 'ces comprimés blancs', dose: 'un comprimé', freq: 'trois fois par jour', freqZh: '每天 3 次', moment: 'avec un grand verre d’eau', dur: 'pendant sept jours' },
  { med: 'ces gélules de vitamines', dose: 'deux gélules', freq: 'chaque matin', freqZh: '每天早晨', moment: 'avant le premier repas', dur: 'pendant dix jours' },
  { med: 'ces gouttes pour les yeux', dose: 'trois gouttes', freq: 'au coucher', freqZh: '每晚睡前', moment: 'le soir au coucher', dur: 'pendant une semaine' },
]
const N3_MED_ADVICES = [
  { fr: 'Buvez beaucoup d’eau dans la journée.', zh: '白天多喝温水补充水分' },
  { fr: 'Reposez-vous bien pour vite récupérer.', zh: '充分卧床休息加快恢复' },
  { fr: 'Ne dépassez jamais la dose recommandée.', zh: '严格按医嘱剂量切勿过量' },
  { fr: 'Gardez ce flacon dans un endroit frais.', zh: '将药瓶放置阴凉干燥处' },
]
const N3_IT_DEVICES = [
  { dev: 'l’ordinateur du bureau', step1: 'd’abord allumer l’écran puis le boîtier central', step1Zh: '先开显示器再开机箱主机', step2: 'taper ton mot de passe d’employé', step2Zh: '输入员工个人密码' },
  { dev: 'la session de travail', step1: 'd’abord brancher la clé sur le port USB', step1Zh: '先将优盘插在USB接口', step2: 'cliquer sur l’icône bleue du réseau', step2Zh: '点击内部网络的蓝色图标' },
  { dev: 'le poste informatique', step1: 'd’abord appuyer sur le gros bouton noir', step1Zh: '先按下机箱上的黑色大按钮', step2: 'inscrire ton identifiant temporaire', step2Zh: '输入系统临时工号' },
  { dev: 'la tablette de vente', step1: 'd’abord déverrouiller l’écran d’accueil', step1Zh: '先在屏幕主页解锁按键', step2: 'lancer le logiciel de la caisse', step2Zh: '打开门店的收银系统软件' },
]
const N3_IT_FOLLOWS = [
  'Ensuite, ouvre ta boîte de courriels.',
  'Puis, vérifie tes tâches du jour.',
  'Après, confirme ta présence sur le portail.',
  'Ensuite, regarde les messages urgents.',
]

const N3_WASH_MACHINES = [
  { machine: 'la laveuse frontale', soapSlot: 'le petit bac de gauche', cycle: 'délicat', soapZh: '左侧的小储液槽', cycleZh: '温和轻柔洗涤程序' },
  { machine: 'la machine à laver', soapSlot: 'le compartiment supérieur', cycle: 'coton rapide', soapZh: '顶部的小分配格槽', cycleZh: '快速棉质清洗程序' },
  { machine: 'le lave-linge moderne', soapSlot: 'le tiroir central gradué', cycle: 'éco', soapZh: '中间带刻度的小槽', cycleZh: '冷水节能环保程序' },
]
const N3_WASH_TEMPS = ['à l’eau tiède', 'à l’eau froide', 'à basse température']

const N3_WORKSHOP_AREAS = [
  { area: 'à l’atelier de menuiserie', gear: 'des lunettes de sécurité transparentes', gearZh: '透明护目安全眼镜', placeZh: '员工专用更衣室内' },
  { area: 'au laboratoire de mécanique', gear: 'des gants de protection renforcés', gearZh: '加厚耐磨防护手套', placeZh: '员工专用更衣室内' },
  { area: 'dans la zone d’usinage', gear: 'un casque de protection antibruit', gearZh: '专用防噪安全耳罩', placeZh: '员工专用更衣室内' },
]

export const N03_L_3 = [
  // Scenario 1 (Template, situation: 0) - Posologie de médicaments
  Object.assign(
    (rand) => {
      const med = pick(N3_MED_DOSAGES, rand)
      const adv = pick(N3_MED_ADVICES, rand)
      const othersFreq = sample(N3_MED_DOSAGES.filter(m => m.freqZh !== med.freqZh), 2, rand)
      const othersAdv = sample(N3_MED_ADVICES.filter(a => a.zh !== adv.zh), 2, rand)
      const text = `À la pharmacie, on m’a bien expliqué comment prendre ${med.med}. Prenez ${med.dose} ${med.freq}, ${med.moment}, ${med.dur}. ${adv.fr}`
      return {
        text,
        questions: [
          q('这种药品的服用频率是？', med.freqZh, othersFreq[0].freqZh, othersFreq[1].freqZh, [med.freq.split(' ')[0].toLowerCase()]),
          q('药剂师给出的健康建议是？', adv.zh, othersAdv[0].zh, othersAdv[1].zh, [adv.fr.split(' ')[0].toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N3_MED_DOSAGES.length * N3_MED_ADVICES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Poste informatique de bureau
  Object.assign(
    (rand) => {
      const dev = pick(N3_IT_DEVICES, rand)
      const follow = pick(N3_IT_FOLLOWS, rand)
      const othersStep1 = sample(N3_IT_DEVICES.filter(d => d.step1Zh !== dev.step1Zh), 2, rand)
      const othersStep2 = sample(N3_IT_DEVICES.filter(d => d.step2Zh !== dev.step2Zh), 2, rand)
      const text = `Pour ouvrir ${dev.dev}, écoute bien les étapes. Tu dois ${dev.step1}. Dès que la lumière verte clignote, il faut ${dev.step2}. ${follow}`
      return {
        text,
        questions: [
          q('开启工作设备的第一步是？', dev.step1Zh, othersStep1[0].step1Zh, othersStep1[1].step1Zh, [dev.step1.split(' ')[1].toLowerCase()]),
          q('完成开机步骤后接下来做什么？', dev.step2Zh, othersStep2[0].step2Zh, othersStep2[1].step2Zh, [dev.step2.split(' ')[0].toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N3_IT_DEVICES.length * N3_IT_FOLLOWS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Lave-linge de buanderie)
  Object.assign(
    (rand) => {
      const wm = pick(N3_WASH_MACHINES, rand)
      const temp = pick(N3_WASH_TEMPS, rand)
      const text = `Pour faire fonctionner ${wm.machine}, place d’abord ton linge dans le tambour. Verse une mesure de détergent dans ${wm.soapSlot}, puis tourne le bouton vers le cycle ${wm.cycle} ${temp}.`
      return {
        text,
        questions: [
          q('洗衣液应倒在哪个具体位置？', wm.soapZh, '洗衣机机身排水管道', '直接倒入滚筒的最底部', ['détergent', wm.soapSlot.split(' ')[1].toLowerCase()]),
          q('建议选择哪一种洗涤程序？', wm.cycleZh, '高温强力除污清洗程序', '超高速甩干脱水程序', [wm.cycle.split(' ')[0].toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N3_WASH_MACHINES.length * N3_WASH_TEMPS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Consignes atelier)
  Object.assign(
    (rand) => {
      const ws = pick(N3_WORKSHOP_AREAS, rand)
      const text = `Avant de commencer le travail ${ws.area}, enfile ${ws.gear}. Dépose ton sac dans le vestiaire des employés et lace bien tes bottes de protection.`
      return {
        text,
        questions: [
          q('进入工作区域前必须佩戴什么？', ws.gearZh, '轻便普通防尘棉纱口罩', '耐磨防刮保暖皮质手套', [ws.gear.split(' ')[1].toLowerCase()]),
          q('随身背包应当放在什么地方？', ws.placeZh, '靠近生产机床的物料架', '车间大门口右侧木长椅', ['vestiaire']),
        ],
      }
    },
    { situation: 1, capacity: N3_WORKSHOP_AREAS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Sachet de poudre pour la toux
  {
    situation: 0,
    text: 'Pour votre toux, dissolvez un sachet de poudre dans un verre d’eau tiède chaque matin. Ne dépassez pas deux sachets par jour et buvez beaucoup d’eau fraîche.',
    questions: [
      q('这种止咳冲剂应该在什么时候服用？', '每天早晨起床后', '每晚睡前空腹时', '午餐正餐进食前', ['chaque matin']),
      q('冲剂每天的最高限量是多少？', '每天最多两小包', '每天最多四小包', '每天最多一整盒', ['deux sachets']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Imprimante partagée
  {
    situation: 1,
    text: 'Pour lancer l’imprimante partagée, appuie sur le bouton vert situé sur le côté droit. Attends que le voyant bleu devienne fixe avant d’envoyer ton premier document.',
    questions: [
      q('开启打印机应按下哪个按钮？', '右侧的绿色按钮', '左侧的红色开关', '顶部的黄色旋钮', ['bouton vert', 'côté droit']),
      q('什么时候才可以发送打印文件？', '蓝色指示灯常亮时', '黄色警报灯闪烁时', '红色按键弹起之后', ['voyant bleu', 'fixe']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-4
// ---------------------------------------------------------------------------
const N3_COMPLIMENTS = [
  { item: 'ton veston bleu', kw: 'veston', adj: 'très élégant', itemZh: '蓝色外套', effectZh: '显得大方得体' },
  { item: 'ta chemise blanche', kw: 'chemise', adj: 'vraiment impeccable', itemZh: '白色衬衫', effectZh: '显得干净整洁' },
  { item: 'ta belle veste', kw: 'veste', adj: 'très soignée', itemZh: '漂亮的夹克', effectZh: '很有职业精神' },
  { item: 'ton joli foulard', kw: 'foulard', adj: 'superbe', itemZh: '好看的围巾', effectZh: '显得现代大方' },
  { item: 'ton pull en laine', kw: 'pull', adj: 'très chic', itemZh: '羊毛毛衣', effectZh: '款式大方端庄' },
]
const N3_MEETINGS = [
  'pour la réunion de ce matin',
  'pour notre rencontre d’équipe',
  'pour la visite des nouveaux clients',
  'pour la formation de cet après-midi',
]

const N3_CHEER_PERSONAS = [
  { name: 'Mélanie', gender: 'f' },
  { name: 'Amadou', gender: 'm' },
  { name: 'Sofia', gender: 'f' },
  { name: 'Émile', gender: 'm' },
  { name: 'Karim', gender: 'm' },
  { name: 'Lucia', gender: 'f' },
]

const N3_CHEERS = [
  { condition: 'ta vilaine grippe', kwCond: 'grippe', conditionZh: '患上严重流感', wish: 'un prompt rétablissement', kwWish: 'rétablissement', wishZh: '祝早日恢复健康' },
  { condition: 'ton opération récente', kwCond: 'opération', conditionZh: '刚做完手术', wish: 'une douce convalescence', kwWish: 'convalescence', wishZh: '祝安心平稳休养' },
  { condition: 'ta grosse bronchite', kwCond: 'bronchite', conditionZh: '患上支气管炎', wish: 'un bon rétablissement', kwWish: 'rétablissement', wishZh: '祝早日康复如初' },
  { condition: 'tes douleurs au dos', kwCond: 'dos', conditionZh: '背部感到疼痛', wish: 'beaucoup de repos', kwWish: 'repos', wishZh: '祝好好放松休息' },
]
const N3_FALSE_WISHES = [
  '祝考试顺利通过',
  '祝旅途平安愉快',
  '祝生日快乐幸福',
  '祝乔迁新居顺利',
]

const N3_EXAM_SUCCESSES = [
  { exam: 'pratique de conduite', kwExam: 'conduite', task: 'les manœuvres de stationnement', passZh: '通过了路考拿到驾照' },
  { exam: 'de français professionnel', kwExam: 'professionnel', task: 'la compréhension orale', passZh: '通过了职业法语考试' },
  { exam: 'd’admission au cégep', kwExam: 'cégep', task: 'toutes les épreuves écrites', passZh: '顺利通过了学院统考' },
  { exam: 'de certification comptable', kwExam: 'comptable', task: 'les exercices financiers', passZh: '考取了专业资格证书' },
]
const N3_EXAM_PRAISES = [
  'Je suis vraiment fier de ton beau succès.',
  'Tout le monde est très impressionné par ton résultat.',
  'C’est amplement mérité après tant d’efforts.',
  'Tu as démontré toute ta belle persévérance.',
]

const N3_NEWCOMERS = [
  { name: 'Antoine', dept: 'de l’informatique', kwDept: 'informatique', deptZh: '热烈欢迎加入技术团队' },
  { name: 'Thomas', dept: 'des finances', kwDept: 'finances', deptZh: '热烈欢迎加入财务团队' },
  { name: 'Nicolas', dept: 'des admissions', kwDept: 'admissions', deptZh: '热烈欢迎加入招生团队' },
  { name: 'Gabriel', dept: 'de la logistique', kwDept: 'logistique', deptZh: '热烈欢迎加入后勤团队' },
]
const N3_NEWCOMER_GREETS = [
  'Prends bien tes repères et passe une agréable première journée.',
  'Installe-toi confortablement et passe une excellente première journée.',
  'Prends le temps d’arriver et passe une très belle première journée.',
  'Découvre calmement tes dossiers et passe une agréable première journée.',
]

export const N03_L_4 = [
  // Scenario 1 (Template, situation: 0) - Compliment tenue
  Object.assign(
    (rand) => {
      const c = pick(N3_COMPLIMENTS, rand)
      const m = pick(N3_MEETINGS, rand)
      const othersItem = sample(N3_COMPLIMENTS.filter(x => x.itemZh !== c.itemZh), 2, rand)
      const text = `Wow, ${c.item} est ${c.adj} ! Cela te va à merveille ${m}. Tu fais une excellente impression auprès de toute l’équipe aujourd’hui.`
      return {
        text,
        questions: [
          q('说话人赞赏了对方的什么穿着？', c.itemZh, othersItem[0].itemZh, othersItem[1].itemZh, [c.kw]),
          q('同事表达的核心赞赏意思是？', c.effectZh, '衣服显得过于宽大随意', '颜色看起来陈旧过时', ['impression']),
        ],
      }
    },
    { situation: 0, capacity: N3_COMPLIMENTS.length * N3_MEETINGS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Vœux de bon rétablissement
  Object.assign(
    (rand) => {
      const ch = pick(N3_CHEERS, rand)
      const p = pick(N3_CHEER_PERSONAS, rand)
      const othersWish = sample(N3_FALSE_WISHES, 2, rand)
      const othersCond = sample(N3_CHEERS.filter(x => x.conditionZh !== ch.conditionZh), 2, rand)
      const text = `${cher(p)}, j’ai appris pour ${ch.condition}. Je te souhaite ${ch.wish}. Prends tout ton temps pour te soigner. Reviens-nous en pleine forme !`
      return {
        text,
        questions: [
          q('朋友发来这段问候的主要内容是？', ch.wishZh, othersWish[0], othersWish[1], [ch.kwWish]),
          q('朋友得知对方出现了什么状况？', ch.conditionZh, othersCond[0].conditionZh, othersCond[1].conditionZh, [ch.kwCond]),
        ],
      }
    },
    { situation: 1, capacity: N3_CHEER_PERSONAS.length * N3_CHEERS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Examen réussi)
  Object.assign(
    (rand) => {
      const ex = pick(N3_EXAM_SUCCESSES, rand)
      const praise = pick(N3_EXAM_PRAISES, rand)
      const othersPass = sample(N3_EXAM_SUCCESSES.filter(x => x.passZh !== ex.passZh), 2, rand)
      const text = `Bravo pour ton examen ${ex.exam} ! Tu as tellement pratiqué ${ex.task} ces dernières semaines. ${praise}`
      return {
        text,
        questions: [
          q('朋友发来祝贺的具体事情是？', ex.passZh, othersPass[0].passZh, othersPass[1].passZh, [ex.kwExam]),
          q('说话人对这个结果有什么评价？', '对努力付出的认可', '靠运气通过的侥幸', '过程准备得太匆忙', ['pratiqué']),
        ],
      }
    },
    { situation: 0, capacity: N3_EXAM_SUCCESSES.length * N3_EXAM_PRAISES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Bienvenue nouveau collègue)
  Object.assign(
    (rand) => {
      const newcomer = pick(N3_NEWCOMERS, rand)
      const greet = pick(N3_NEWCOMER_GREETS, rand)
      const otherDept = sample(N3_NEWCOMERS.filter(x => x.deptZh !== newcomer.deptZh), 1, rand)[0].deptZh
      const otherAct = pick(['祝贺同事获得岗位晋升', '举行老员工告别聚会'], rand)
      const text = `Bienvenue dans notre équipe, ${newcomer.name} ! Nous sommes tous très heureux de t’accueillir dans la division ${newcomer.dept}. ${greet}`
      return {
        text,
        questions: [
          q('同事向新员工表达了什么心意？', newcomer.deptZh, otherDept, otherAct, [newcomer.kwDept]),
          q('同事希望对方在第一天怎样？', '顺利度过愉快的第一天', '立即起草一份业务方案', '独立处理客户投诉案件', ['première', 'journée']),
        ],
      }
    },
    { situation: 1, capacity: N3_NEWCOMERS.length * N3_NEWCOMER_GREETS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Félicitations promotion & veston
  {
    situation: 0,
    text: 'Félicitations pour ta promotion ! Ton nouveau veston bleu marine est très classe et s’accorde parfaitement à tes nouvelles fonctions. Tu as fière allure !',
    questions: [
      q('说话人称赞了同事的什么着装？', '深蓝色的西装外套', '质地轻薄的长袖衫', '剪裁合身的长裤子', ['veston bleu']),
      q('« Tu as fière allure » 的意思是：', '你看起来气派精神', '你走起路来很迅速', '你穿着打扮太随意', ['fière allure']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Vœux après opération du genou
  {
    situation: 1,
    text: 'Coucou Julie ! Je viens aux nouvelles après ton opération du genou. J’espère que tu as moins mal. Reste bien tranquille à la maison et reviens en pleine forme !',
    questions: [
      q('朋友为什么发来这段慰问？', '得知对方刚做膝盖手术', '听说对方准备外出旅行', '祝贺对方喜迁全新住所', ['opération', 'genou']),
      q('朋友希望朱莉怎样休养？', '安心在家休养到康复', '每天坚持在户外快走', '尽快回单位报到上班', ['tranquille', 'maison']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-0
// ---------------------------------------------------------------------------
const N3_SCHOOL_EVENTS = [
  { date: 'le 14 octobre', rsvp: 'le 10 octobre', rsvpBad1: 'avant le 25 octobre', rsvpBad2: 'avant le 15 novembre' },
  { date: 'le 22 octobre', rsvp: 'le 17 octobre', rsvpBad1: 'avant le 30 octobre', rsvpBad2: 'avant le 15 novembre' },
  { date: 'le 12 novembre', rsvp: 'le 7 novembre', rsvpBad1: 'avant le 20 novembre', rsvpBad2: 'avant le premier décembre' },
  { date: 'le 18 novembre', rsvp: 'le 12 novembre', rsvpBad1: 'avant le 25 novembre', rsvpBad2: 'avant le premier décembre' },
]

export const N03_R_0 = [
  // Scenario 1 (Template, situation: 0) - Rencontre parents-enseignant
  Object.assign(
    (rand) => {
      const school = pick(['Saint-Jean-Baptiste', 'Marguerite-Bourgeoys', 'Jacques-Cartier', 'Sainte-Bernadette'], rand)
      const ev = pick(N3_SCHOOL_EVENTS, rand)
      const text = `École primaire ${school}. Rencontre individuelle parents-enseignants : ${ev.date}, de 17 h à 20 h, au gymnase de l’école. Veuillez confirmer votre présence auprès du secrétariat avant ${ev.rsvp}. Le stationnement est gratuit pour les familles.`
      return {
        text,
        questions: [
          q('De quel évènement s’agit-il dans cet avis ?', 'la rencontre parents-enseignant', 'la sortie scolaire au grand musée', 'la fête de quartier pour l’école', ['rencontre']),
          q('Avant quelle date doit-on confirmer sa venue ?', `avant ${ev.rsvp}`, ev.rsvpBad1, ev.rsvpBad2, [ev.rsvp.toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: 4 * N3_SCHOOL_EVENTS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Marché public municipal
  Object.assign(
    (rand) => {
      const market = pick(['du Vieux-Port', 'de Limoilou', 'de Rosemont', 'de Sainte-Foy'], rand)
      const date = pick(['le 15 mai', 'le premier juin', 'le 20 mai', 'le 10 juin'], rand)
      const text = `Ville de Québec. Ouverture du marché public ${market} dès ${date} ! Retrouvez plus de trente producteurs locaux : fruits frais, légumes de saison, fromages artisanaux et boulangerie. Ouvert tous les samedis et dimanches de 8 h à 14 h.`
      return {
        text,
        questions: [
          q('Quelle annonce municipale est présentée dans le texte ?', 'le lancement d’un marché local', 'la fermeture d’un parc aquatique', 'des travaux dans le quartier est', ['marché']),
          q('Quels jours le marché accueille-t-il le public ?', 'les samedis et les dimanches', 'tous les mercredis après-midi', 'chaque vendredi soir seulement', ['samedis', 'dimanches']),
        ],
      }
    },
    { situation: 1, capacity: 16 }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Piscine municipale)
  Object.assign(
    (rand) => {
      const pool = pick(['Saint-Roch', 'du Plateau', 'Saint-Henri', 'de Sainte-Foy'], rand)
      const text = `Piscine municipale ${pool}. Horaires des bains libres d’automne : du mardi au vendredi de 12 h à 14 h et de 18 h à 20 h. Bonnet de bain obligatoire. Tarif d’entrée : quatre dollars par adulte, gratuit pour les enfants.`
      return {
        text,
        questions: [
          q('Quel équipement est obligatoire pour nager ?', 'un bonnet de bain', 'des lunettes de plongée', 'un maillot avec dossard', ['bonnet']),
          q('Quel est le tarif d’entrée pour un adulte ?', 'quatre dollars par personne', 'dix dollars pour une personne', 'huit dollars pour une personne', ['quatre']),
        ],
      }
    },
    { situation: 0, capacity: 4 }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Centre communautaire)
  Object.assign(
    (rand) => {
      const center = pick(['Saint-Michel', 'du Vieux-Longueuil', 'de Rosemont', 'de Limoilou'], rand)
      const text = `Centre communautaire ${center}. Inscription aux ateliers d’artisanat le samedi 18 octobre dès 9 h dans la salle polyvalente. Les ateliers débutent en novembre. Activité gratuite pour les familles résidant dans le quartier.`
      return {
        text,
        questions: [
          q('Quel est le sujet de cette annonce de quartier ?', 'des ateliers d’artisanat gratuits', 'un grand festival de musique payant', 'une exposition d’œuvres d’art locales', ['artisanat']),
          q('Où se déroulent les inscriptions le 18 octobre ?', 'dans la salle polyvalente', 'au secrétariat de l’établissement', 'dans la grande cour extérieure', ['polyvalente']),
        ],
      }
    },
    { situation: 1, capacity: 4 }
  ),
  // Scenario 5 (Static, situation: 0) - Garderie Les Petits Lutins
  {
    situation: 0,
    text: 'Garderie Les Petits Lutins. Convocation à l’assemblée générale annuelle des parents : mardi 14 octobre à 19 h dans la salle communautaire. Nous élirons les représentants au conseil d’administration. Confirmez votre participation auprès de l’éducatrice avant vendredi.',
    questions: [
      q('Quel est le but de cette assemblée générale ?', 'choisir les membres du conseil', 'organiser une fête de quartier animée', 'présenter les comptes financiers annuels', ['conseil']),
      q('À quelle heure débute la rencontre ?', 'à 19 h dans la salle', 'à midi exactement sur place', 'à 20 h dans la soirée', ['19 h']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Dépliant marché artisanal d'automne
  {
    situation: 1,
    text: 'Ville de Montréal. Dépliant de quartier : le grand marché artisanal d’automne s’installe sur la place Simon-Valois le 20 septembre de 10 h à 17 h. Venez encourager nos artisans et créateurs québécois. Kiosques d’artisanat, musique et café chaud.',
    questions: [
      q('Quel évènement ce dépliant présente-t-il ?', 'le marché artisanal d’automne', 'un concert de musique rock', 'une course sportive à pied', ['marché artisanal']),
      q('Sur quel lieu public l’évènement s’installe-t-il ?', 'sur la place Simon-Valois', 'dans la cour fermée d’une école', 'au parc public du Mont-Royal', ['place simon-valois']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-1
// ---------------------------------------------------------------------------
const N3_JOBS_LIST = [
  { job: 'commis à la caisse', kw: 'caisse', short: 'commis de caisse' },
  { job: 'vendeur au rayon vêtements', kw: 'vêtements', short: 'vendeur en rayon' },
  { job: 'commis d’épicerie', kw: 'épicerie', short: 'commis d’épicerie' },
  { job: 'associé au service à la clientèle', kw: 'clientèle', short: 'agent de service' },
]
const N3_ATTACHMENTS_LIST = [
  { att: 'votre curriculum vitæ complet', kw: 'curriculum', p: 'son curriculum vitæ récent' },
  { att: 'vos disponibilités de travail écrites', kw: 'disponibilités', p: 'ses disponibilités de travail écrites' },
  { att: 'deux références professionnelles vérifiables', kw: 'références', p: 'deux références vérifiables' },
  { att: 'une copie de votre diplôme secondaire', kw: 'diplôme', p: 'la copie de son diplôme' },
]

export const N03_R_1 = [
  // Scenario 1 (Template, situation: 0) - Formulaire d'embauche commerce
  Object.assign(
    (rand) => {
      const job = pick(N3_JOBS_LIST, rand)
      const att = pick(N3_ATTACHMENTS_LIST, rand)
      const shift = pick(['en semaine et les fins de semaine', 'du jeudi au samedi inclusivement', 'sur les quarts de soir en semaine'], rand)
      const text = `Formulaire d’embauche - Commerce de détail. Poste convoité : ${job.job}. Nom : … Prénom : … Téléphone : … Disponibilités : ${shift}. Expérience dans le domaine : oui / non. Veuillez joindre ${att.att} à votre demande.`
      return {
        text,
        questions: [
          q('Quel document le candidat remplit-il ici ?', 'un formulaire d’embauche en magasin', 'un contrat de location de local', 'une facture d’électricité du mois', ['embauche']),
          q('Quel document d’accompagnement est exigé ?', att.p, 'un acte de vente pour un bien', 'un carnet de santé pour animal', [att.kw]),
        ],
      }
    },
    { situation: 0, capacity: N3_JOBS_LIST.length * N3_ATTACHMENTS_LIST.length * 3 }
  ),
  // Scenario 2 (Template, situation: 1) - Inscription service de garde scolaire
  Object.assign(
    (rand) => {
      const school = pick(['Saint-Jean-Baptiste', 'Marguerite-Bourgeoys', 'Marie-Victorin', 'Jacques-Cartier'], rand)
      const text = `École primaire ${school}. Inscription au service de garde scolaire. Nom de l’enfant : … Année scolaire en cours : … Horaires demandés : dès 7 h le matin et après la classe. Information médicale à préciser : allergies alimentaires. Téléphone d’urgence : …`
      return {
        text,
        questions: [
          q('À quel service scolaire ce formulaire sert-il ?', 'au service de garde des élèves', 'au club sportif de fin d’année', 'aux sorties scolaires du vendredi', ['garde']),
          q('Quelle information sur l’enfant doit être indiquée ?', 'les allergies alimentaires', 'la pointure exacte des souliers', 'le titre du jeu vidéo préféré', ['allergies']),
        ],
      }
    },
    { situation: 1, capacity: 4 }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Adhésion bibliothèque)
  Object.assign(
    (rand) => {
      const branch = pick(['Centrale', 'du Vieux-Nord', 'de Saint-Sauveur', 'du Plateau'], rand)
      const text = `Bibliothèque municipale - Succursale ${branch}. Formulaire d’adhésion pour adulte. Nom et prénom : … Adresse : … Courriel : … Veuillez présenter une preuve de résidence récente et une pièce d’identité pour recevoir votre carte de membre.`
      return {
        text,
        questions: [
          q('Pour quel service ce document est-il utilisé ?', 'l’adhésion à la bibliothèque', 'l’abonnement au centre de gym', 'l’accès à la piscine municipale', ['bibliothèque']),
          q('Quelle pièce justificative doit-on présenter ?', 'une preuve de résidence récente', 'un relevé de notes scolaires', 'une attestation d’employeur', ['résidence']),
        ],
      }
    },
    { situation: 0, capacity: 4 }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Club sportif)
  Object.assign(
    (rand) => {
      const sport = pick(['de soccer', 'de basketball', 'de badminton', 'de gymnastique'], rand)
      const text = `Club de loisirs sportifs. Fiche d’inscription annuelle pour l’équipe ${sport}. Prénom de l’enfant : … Âge : … Numéro d’assurance maladie : … Personne à joindre en cas d’urgence : … Signature du parent responsable : …`
      return {
        text,
        questions: [
          q('Quel type d’inscription cette fiche permet-elle ?', 'une activité sportive pour enfant', 'un voyage scolaire à l’étranger', 'un cours de musique pour adulte', ['sport']),
          q('Quel renseignement d’urgence est demandé ?', 'un contact en cas d’urgence', 'le numéro de permis de conduire', 'le groupe sanguin des parents', ['urgence']),
        ],
      }
    },
    { situation: 1, capacity: 4 }
  ),
  // Scenario 5 (Static, situation: 0) - Supermarché Metro
  {
    situation: 0,
    text: 'Formulaire de demande d’emploi - Supermarché Metro. Postes disponibles : commis d’emballage, caissière, poissonnier. Avez-vous de l’expérience avec le public ? Êtes-vous étudiant ? Indiquez vos heures de cours du lundi au vendredi.',
    questions: [
      q('Pour quel type de commerce ce formulaire est-il conçu ?', 'un supermarché d’alimentation', 'une pharmacie de quartier', 'une quincaillerie de banlieue', ['supermarché']),
      q('Que doivent préciser les candidats qui étudient ?', 'leurs heures de cours la semaine', 'leurs résultats aux examens', 'la liste des livres achetés', ['heures de cours']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Camp de jour estival
  {
    situation: 1,
    text: 'Service des loisirs municipaux. Formulaire de camp de jour estival. Prénom et nom du jeune : … Âge : … Allergies aux piqûres d’insectes : … Prise de médicaments pendant le séjour : oui / non. Contact d’urgence et numéro de cellulaire : …',
    questions: [
      q('Pour quelle activité estivale ce formulaire est-il requis ?', 'le camp de jour municipal', 'les cours de natation d’été', 'la sortie au parc d’attractions', ['camp de jour']),
      q('Quelle information médicale particulière est relevée ?', 'la réaction aux piqûres d’insectes', 'le type de brosse à dents utilisée', 'le groupe sanguin des voisins', ['piqûres d’insectes']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-2
// ---------------------------------------------------------------------------
export const N03_R_2 = [
  // Scenario 1 (Template, situation: 0) - Offre d'emploi commis / adjoint
  Object.assign(
    (rand) => {
      const role = pick(['Commis d’entrepôt', 'Adjoint de bureau', 'Préposé à l’accueil'], rand)
      const req = pick([
        { skill: 'ponctualité et esprit d’équipe', exp: 'une année d’expérience souhaitée', kw: 'ponctualité' },
        { skill: 'bon entregent et rigueur', exp: 'aucune expérience requise', kw: 'entregent' },
        { skill: 'bonne forme et autonomie', exp: 'expérience en manutention un atout', kw: 'autonomie' },
      ], rand)
      const text = `Offre d’emploi. Titre du poste : ${role}. Profil recherché : personne dynamique démontrant ${req.skill}. Exigences : ${req.exp}. Disponibilité demandée du lundi au vendredi, 35 heures par semaine. Envoyez votre candidature à rh@entreprise.ca.`
      return {
        text,
        questions: [
          q('Quel est le poste proposé dans cette annonce ?', role, 'Comptable d’entreprise', 'Directeur du personnel', [role.split(' ')[0].toLowerCase()]),
          q('Quelle qualité essentielle est recherchée pour ce rôle ?', req.skill, 'connaissance du droit fiscal', 'expérience de dix ans', [req.kw]),
        ],
      }
    },
    { situation: 0, capacity: 9 }
  ),
  // Scenario 2 (Template, situation: 1) - Appartement à louer
  Object.assign(
    (rand) => {
      const apt = pick([
        { type: 'Spacieux cinq et demie', bedrooms: 'Deux chambres fermées' },
        { type: 'Grand cinq et demie', bedrooms: 'Deux chambres fermées' },
        { type: 'Beau quatre et demie', bedrooms: 'Une chambre fermée' },
        { type: 'Joli quatre et demie', bedrooms: 'Une chambre fermée' },
      ], rand)
      const area = pick(['dans Rosemont', 'à Sainte-Foy', 'dans Saint-Sauveur', 'près du métro Jarry'], rand)
      const rent = pick(['1 180 $ par mois', '1 250 $ par mois', '1 350 $ par mois', '1 050 $ par mois'], rand)
      const text = `À louer : ${apt.type} ensoleillé ${area}. Loyer de ${rent}. ${apt.bedrooms}, planchers de bois franc, salle de bain rénovée et balcon privé. Entrée laveuse-sécheuse incluse. Chauffage non inclus. Chats acceptés, non-fumeur. Disponible dès le 1er juillet.`
      return {
        text,
        questions: [
          q('Combien coûte le loyer de ce logement ?', rent, '2 500 $ par mois', '450 $ par mois', [rent.split(' ')[0]]),
          q('Quelle caractéristique intérieure est mentionnée ?', 'planchers en bois et balcon privé', 'cour arrière avec deux piscines', 'salle de cinéma au sous-sol', ['planchers']),
        ],
      }
    },
    { situation: 1, capacity: 64 }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Vente d'un vélo d'occasion)
  Object.assign(
    (rand) => {
      const color = pick(['bleu nuit', 'rouge vif', 'noir mat', 'gris argenté'], rand)
      const price = pick(['180 $', '160 $', '190 $', '175 $'], rand)
      const text = `À vendre : vélo de route pour adulte en excellent état. Utilisé seulement une saison, couleur ${color}, cadre en aluminium léger. Vendu avec un casque et un antivol solide pour ${price}. À récupérer sur place près du métro.`
      return {
        text,
        questions: [
          q('Quel article d’occasion est proposé à la vente ?', 'un vélo de route pour adulte', 'une trottinette tout-terrain', 'un appareil de musculation', ['vélo']),
          q('Quel accessoire est inclus avec l’article vendu ?', 'un casque et un antivol solide', 'une pompe et deux sacoches', 'un phare avant et un compteur', ['casque', 'antivol']),
        ],
      }
    },
    { situation: 0, capacity: 16 }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Recherche de colocataire)
  Object.assign(
    (rand) => {
      const qPlace = pick(['dans Rosemont', 'dans Limoilou', 'sur le Plateau', 'près du métro Jarry'], rand)
      const rent = pick(['650 $ par mois', '680 $ par mois', '620 $ par mois', '700 $ par mois'], rand)
      const text = `Recherche colocataire pour grand appartement ${qPlace}. Chambre privée lumineuse avec placard, cuisine tout équipée et salon partagé. Ambiance calme et respectueuse. Loyer de ${rent} tout compris. Libre dès le mois prochain.`
      return {
        text,
        questions: [
          q('Que propose l’annonceur de ce message ?', 'une chambre privée en colocation', 'un studio meublé pour famille', 'un bureau commercial partagé', ['chambre privée']),
          q('Quel type d’ambiance est recherché dans le logement ?', 'un milieu calme et respectueux', 'des fêtes chaque fin de semaine', 'un atelier ouvert aux clients', ['calme']),
        ],
      }
    },
    { situation: 1, capacity: 16 }
  ),
  // Scenario 5 (Static, situation: 0) - CPE Les Petits Soleils
  {
    situation: 0,
    text: 'CPE Les Petits Soleils recrute une éducatrice à la petite enfance remplaçante. Profil attendu : diplôme reconnu ou attestation en garderie, patience, esprit créatif et certificat de premiers soins valide. Salaire selon l’échelle officielle du ministère de la Famille.',
    questions: [
      q('Dans quel organisme ce poste est-il offert ?', 'en garderie pour la petite enfance', 'dans une école secondaire publique', 'dans une clinique médicale de jour', ['garderie']),
      q('Quelle formation figure dans le profil attendu ?', 'un certificat de premiers soins valide', 'un permis de conduire camion lourd', 'un brevet de pilote d’avion de ligne', ['premiers soins']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Annonce immobilière Limoilou
  {
    situation: 1,
    text: 'Annonce immobilière : superbe quatre et demie rénové dans Limoilou au rez-de-chaussée d’un triplex paisible. Grande cour arrière clôturée, cuisine moderne avec lave-vaisselle fourni, stationnement déneigé en hiver. Loyer de 1 290 dollars. Dossier de crédit demandé.',
    questions: [
      q('Quel équipement ménager est fourni dans la cuisine ?', 'un lave-vaisselle moderne', 'un four à micro-ondes neuf', 'une cafetière programmable', ['lave-vaisselle']),
      q('Quel aménagement extérieur est mentionné pour l’hiver ?', 'un stationnement déneigé', 'une patinoire privée en bois', 'une terrasse chauffée fermée', ['stationnement déneigé']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-3
// ---------------------------------------------------------------------------
const N3_CLEANERS_DATA = [
  { name: 'Nettoyant multi-surfaces écologique', action: 'Vaporiser à vingt centimètres.', actP: 'vaporiser à courte distance', kwAct: 'vaporiser', wait: 'Laisser agir deux minutes.', wipe: 'Essuyer avec un chiffon en microfibre.', warn: 'Ne jamais mélanger avec de la Javel.', warnP: 'ne pas mélanger avec la Javel', kwWarn: 'javel' },
  { name: 'Désinfectant doux pour la cuisine', action: 'Appliquer sur une éponge propre.', actP: 'mettre le produit sur l’éponge', kwAct: 'éponge', wait: 'Laisser reposer trois minutes.', wipe: 'Rincer ensuite à l’eau claire.', warn: 'Conserver hors de portée des enfants.', warnP: 'garder hors de portée des enfants', kwWarn: 'enfants' },
  { name: 'Dégraissant puissant pour cuisinière', action: 'Verser quelques gouttes sur la tache.', actP: 'verser le produit sur la tache', kwAct: 'verser', wait: 'Attendre cinq minutes.', wipe: 'Frotter avec un linge doux.', warn: 'Éviter tout contact avec les yeux.', warnP: 'ne pas mettre dans les yeux', kwWarn: 'yeux' },
  { name: 'Savon liquide pour planchers', action: 'Diluer deux bouchons dans de l’eau.', actP: 'diluer la dose dans de l’eau', kwAct: 'diluer', wait: 'Passer une vadrouille bien essorée.', wipe: 'Laisser sécher à l’air libre.', warn: 'Ne pas appliquer sur du bois brut.', warnP: 'ne pas mettre sur du bois brut', kwWarn: 'bois' },
]
const N3_CLEANER_BRANDS = ['Éco-Ménage', 'Net-Maison', 'Pur-Québec', 'Bio-Propre']

const N3_PHARMA_DATA = [
  { med: 'Comprimés contre le rhume', dose: 'Prendre un comprimé aux six heures.', doseP: 'un comprimé toutes les six heures', kwDose: 'comprimé', max: 'Ne pas dépasser quatre prises par jour.', dur: 'cinq jours consécutifs', store: 'Garder dans un endroit sec.', storeP: 'garder au sec et loin du soleil', kwStore: 'sec' },
  { med: 'Sirop contre la toux sèche', dose: 'Prendre une cuillère matin et soir.', doseP: 'une cuillère matin et soir', kwDose: 'cuillère', max: 'Ne pas dépasser deux cuillères en 24 heures.', dur: 'sept jours au besoin', store: 'Conserver la bouteille bien fermée.', storeP: 'garder la bouteille bien fermée', kwStore: 'fermée' },
  { med: 'Gélules pour la digestion', dose: 'Prendre deux gélules au milieu du repas.', doseP: 'avaler deux gélules en mangeant', kwDose: 'gélules', max: 'Ne pas prendre plus de quatre gélules par jour.', dur: 'dix jours consécutifs', store: 'Mettre à l’abri de l’humidité.', storeP: 'garder à l’abri de l’humidité', kwStore: 'humidité' },
]
const N3_PHARMA_DURS = ['trois jours consécutifs', 'cinq jours complets', 'sept jours ouvrables', 'dix jours de suite']

const N3_APPLIANCE_CARE = [
  { app: 'cafetière électrique', product: 'vinaigre blanc', prodP: 'du vinaigre blanc ordinaire', kw: 'vinaigre' },
  { app: 'bouilloire en inox', product: 'jus de citron', prodP: 'du jus de citron naturel', kw: 'citron' },
  { app: 'machine à espresso', product: 'détartrant liquide', prodP: 'un produit détartrant liquide', kw: 'détartrant' },
]
const N3_APPLIANCE_CARE_CYCLES = ['deux cycles complets', 'trois cycles consécutifs', 'un cycle prolongé']

const N3_RECYCLE_AREAS = ['Ville de Québec', 'Ville de Montréal', 'Ville de Laval', 'Ville de Sherbrooke']
const N3_RECYCLE_ITEMS = [
  { textFr: 'les cartons pliés', ans: 'les cartons et contenants propres', kw: 'cartons' },
  { textFr: 'les bouteilles de verre', ans: 'le verre et contenants propres', kw: 'verre' },
  { textFr: 'les emballages métalliques', ans: 'les emballages et contenants propres', kw: 'emballages' },
]

export const N03_R_3 = [
  // Scenario 1 (Template, situation: 0) - Nettoyant ménager
  Object.assign(
    (rand) => {
      const c = pick(N3_CLEANERS_DATA, rand)
      const b = pick(N3_CLEANER_BRANDS, rand)
      const text = `Produit ${b} : ${c.name}. Mode d’emploi : ${c.action} ${c.wait} ${c.wipe} Mise en garde de sécurité : ${c.warn} Fabriqué au Québec.`
      return {
        text,
        questions: [
          q('Quelle est la première action à réaliser ?', c.actP, 'verser dans une bouilloire avec de l’huile', 'appliquer avec force sur des habits en soie', [c.kwAct]),
          q('Quelle consigne de prudence doit-on observer ?', c.warnP, 'changer les piles chaque mois sans tarder', 'verser la bouteille entière en une fois', [c.kwWarn]),
        ],
      }
    },
    { situation: 0, capacity: N3_CLEANERS_DATA.length * N3_CLEANER_BRANDS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Notice médicale
  Object.assign(
    (rand) => {
      const p = pick(N3_PHARMA_DATA, rand)
      const dur = pick(N3_PHARMA_DURS, rand)
      const text = `Notice médicale - ${p.med}. Posologie recommandée : ${p.dose} ${p.max} Durée prévue : ${dur}. Précaution : ${p.store} En cas de doute, consultez un pharmacien.`
      return {
        text,
        questions: [
          q('À quelle fréquence ce médicament doit-il être pris ?', p.doseP, 'prendre toute la boîte en une seule fois', 'prendre une pleine dose chaque quart d’heure', [p.kwDose]),
          q('Quelle consigne de conservation est indiquée ?', p.storeP, 'garder le paquet sous la pluie au jardin', 'mettre les comprimés dans un four très chaud', [p.kwStore]),
        ],
      }
    },
    { situation: 1, capacity: N3_PHARMA_DATA.length * N3_PHARMA_DURS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Entretien cafetière)
  Object.assign(
    (rand) => {
      const care = pick(N3_APPLIANCE_CARE, rand)
      const cyc = pick(N3_APPLIANCE_CARE_CYCLES, rand)
      const text = `Guide d’entretien : ${care.app}. Pour détartrer, versez un mélange d’eau et ${de(care.product)} dans le réservoir. Lancez un cycle complet. Rincez ensuite en faisant fonctionner ${cyc} avec de l’eau claire.`
      return {
        text,
        questions: [
          q('Quel produit doit-on mélanger avec de l’eau ?', care.prodP, 'du savon liquide pour vaisselle', 'du bicarbonate de soude pur', [care.kw]),
          q('Que faut-il faire pour bien rincer l’appareil ?', 'lancer des cycles à l’eau claire', 'essuyer l’intérieur avec un linge', 'laisser tremper pendant une journée', ['claire']),
        ],
      }
    },
    { situation: 0, capacity: N3_APPLIANCE_CARE.length * N3_APPLIANCE_CARE_CYCLES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Consignes recyclage)
  Object.assign(
    (rand) => {
      const city = pick(N3_RECYCLE_AREAS, rand)
      const item = pick(N3_RECYCLE_ITEMS, rand)
      const text = `${city}. Consignes municipales de recyclage. Déposez ${item.textFr} et les contenants en plastique propres dans le bac bleu. Rincez bien vos boîtes avant le dépôt. Les résidus alimentaires doivent être placés dans le bac brun.`
      return {
        text,
        questions: [
          q('Que doit-on mettre dans le bac bleu ?', item.ans, 'les déchets alimentaires des repas', 'les vieux habits et souliers usés', [item.kw, 'bleu']),
          q('Quelle consigne s’applique aux boîtes de conserve ?', 'bien rincer avant le dépôt', 'les écraser avec un outil lourd', 'les envelopper dans du plastique', ['dépôt']),
        ],
      }
    },
    { situation: 1, capacity: N3_RECYCLE_AREAS.length * N3_RECYCLE_ITEMS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Nettoyant vitres et miroirs
  {
    situation: 0,
    text: 'Nettoyant pour vitres et miroirs. Mode d’emploi : vaporiser sur une vitre propre et sèche à quinze centimètres. Essuyer avec du papier absorbant ou un chiffon non pelucheux. Ne pas avaler. Tenir à l’écart des flammes.',
    questions: [
      q('Sur quelle surface ce produit s’applique-t-il ?', 'sur une vitre propre et bien sèche', 'sur un tapis de salon très humide', 'sur des casseroles en aluminium', ['vitre']),
      q('Quel chiffon est recommandé pour essuyer ?', 'du papier absorbant ou un linge sec', 'une serviette de bain très mouillée', 'une éponge abrasive pour plancher', ['papier absorbant']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Posologie sirop pour enfants
  {
    situation: 1,
    text: 'Posologie - Sirop pour enfants de plus de six ans. Prendre une cuillère à thé toutes les huit heures après les repas. Ne pas dépasser trois prises par 24 heures. Bien agiter le flacon avant l’usage.',
    questions: [
      q('Quel est le nombre maximal de prises par jour ?', 'au maximum trois prises par jour', 'dix cuillères par journée d’école', 'une seule cuillère par fin de semaine', ['trois prises']),
      q('Que faut-il faire avec le flacon avant l’usage ?', 'secouer le flacon avant l’emploi', 'chauffer le liquide au micro-ondes', 'laisser le produit ouvert dehors', ['flacon']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-4
// ---------------------------------------------------------------------------
const N3_TEXTO_DATA = [
  { friend: 'Camille', topic: 'ta présentation orale de ce matin', topicP: 'la présentation orale du matin', kwTopic: 'présentation', detail: 'Tu as parlé avec beaucoup de calme et d’assurance', detailP: 'le calme et la clarté des propos', kwDetail: 'calme' },
  { friend: 'Valérie', topic: 'ton nouveau manteau d’automne', topicP: 'ton nouveau manteau d’automne', kwTopic: 'manteau', detail: 'La couleur te donne une mine vraiment éclatante', detailP: 'la belle couleur éclatante du tissu', kwDetail: 'éclatante' },
  { friend: 'Mélanie', topic: 'tes photos de notre randonnée', topicP: 'tes jolies photos de randonnée', kwTopic: 'photos', detail: 'Les paysages des montagnes sont magnifiques', detailP: 'les superbes vues sur les montagnes', kwDetail: 'montagnes' },
  { friend: 'Sophie', topic: 'ton délicieux gâteau aux pommes', topicP: 'ton bon gâteau fait maison', kwTopic: 'gâteau', detail: 'Toute la famille a adoré ta recette maison', detailP: 'la recette appréciée de la famille', kwDetail: 'recette' },
  { friend: 'Chloé', topic: 'ton joli dessin pour l’exposition', topicP: 'ton beau dessin pour l’exposition', kwTopic: 'dessin', detail: 'Les couleurs vives attirent tout de suite le regard', detailP: 'les couleurs vives qui attirent l’œil', kwDetail: 'couleurs vives' },
]

const N3_TEXTO_CLOSINGS = [
  'Passe une très belle journée !',
  'On se reparle très vite pour un café !',
  'Félicitations encore pour ton travail !',
  'Prends bien soin de toi aujourd’hui !',
]

const N3_BIRTHDAY_DATA = [
  { colleague: 'Émile', wish: 'un très joyeux anniversaire', extraWish: 'beaucoup de bonheur et une excellente santé', wishP: 'du bonheur et une excellente santé', kwWish: 'santé', note: 'Profite bien de cette journée festive avec tes proches.' },
  { colleague: 'Karim', wish: 'une merveilleuse journée de fête', extraWish: 'la réussite dans tous tes beaux projets', wishP: 'la réussite dans tous ses beaux projets', kwWish: 'réussite', note: 'Ne pense pas aux dossiers du bureau aujourd’hui.' },
  { colleague: 'Martin', wish: 'un superbe anniversaire', extraWish: 'de très beaux souvenirs en famille réunis', wishP: 'des souvenirs en famille réunis', kwWish: 'souvenirs', note: 'Toute l’équipe a hâte de célébrer cela avec toi demain.' },
  { colleague: 'Sébastien', wish: 'une très belle fête', extraWish: 'de la joie et de beaux succès personnels', wishP: 'de la joie et des succès personnels', kwWish: 'succès', note: 'Prends le temps de savourer chaque instant de fête.' },
  { colleague: 'Alexandre', wish: 'un chaleureux anniversaire', extraWish: 'une année pleine de santé et d’énergie', wishP: 'de la pleine santé et de l’énergie', kwWish: 'énergie', note: 'Nous serons ravis de trinquer à ta santé sous peu.' },
]
const N3_BIRTHDAY_SIGNOFFS = [
  'Passe une excellente soirée !',
  'À très bientôt au bureau !',
  'Au plaisir de fêter cela ensemble !',
]

const N3_MOVE_HELPERS = ['Félix', 'David', 'Mathieu', 'Samuel']
const N3_MOVE_TASKS = [
  { day: 'samedi', task: 'notre déménagement en appartement', traitZh: '热情开朗且充满干劲' },
  { day: 'dimanche', task: 'la peinture de notre salon', traitZh: '做事细致且充满耐心' },
  { day: 'vendredi', task: 'l’installation de nos meubles', traitZh: '勤劳能干且乐于助人' },
]

const N3_PROMOTIONS = [
  { name: 'Marianne', role: 'responsable d’équipe', roleP: 'une promotion comme responsable d’équipe' },
  { name: 'Isabelle', role: 'coordonnatrice de projet', roleP: 'une nomination de coordonnatrice' },
  { name: 'Béatrice', role: 'directrice adjointe', roleP: 'un poste de directrice adjointe' },
]
const N3_DIVISIONS = ['notre division de service', 'le département des ventes', 'la direction des ressources humaines']

export const N03_R_4 = [
  // Scenario 1 (Template, situation: 0) - Compliment texto
  Object.assign(
    (rand) => {
      const t = pick(N3_TEXTO_DATA, rand)
      const cl = pick(N3_TEXTO_CLOSINGS, rand)
      const text = `Coucou ! Je voulais te féliciter pour ${t.topic}. ${t.detail}. Tu as vraiment beaucoup de talent. ${cl}`
      return {
        text,
        questions: [
          q('Sur quoi porte le compliment reçu dans ce message ?', t.topicP, 'l’achat d’un camion d’occasion révisé', 'un contrat de location longue durée', [t.kwTopic]),
          q('Quelle appréciation positive l’amie formule-t-elle ?', t.detailP, 'le bas prix trouvé au centre commercial', 'la rapidité d’envoi du paquet postal', [t.kwDetail]),
        ],
      }
    },
    { situation: 0, capacity: N3_TEXTO_DATA.length * N3_TEXTO_CLOSINGS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Courriel anniversaire
  Object.assign(
    (rand) => {
      const b = pick(N3_BIRTHDAY_DATA, rand)
      const sign = pick(N3_BIRTHDAY_SIGNOFFS, rand)
      const othersWish = sample(N3_BIRTHDAY_DATA.filter(x => x.wishP !== b.wishP), 2, rand)
      const text = `Bonjour ! De la part de toute l’équipe, je te souhaite ${b.wish}. Nous te souhaitons ${b.extraWish}. ${b.note} ${sign}`
      return {
        text,
        questions: [
          q('Quel est le but principal de ce courriel ?', 'souhaiter un joyeux anniversaire', 'demander un rapport de travail urgent', 'annoncer une réunion de crise d’équipe', ['souhaite']),
          q('Quels vœux bienveillants le collègue exprime-t-il ?', b.wishP, othersWish[0].wishP, othersWish[1].wishP, [b.kwWish]),
        ],
      }
    },
    { situation: 1, capacity: N3_BIRTHDAY_DATA.length * N3_BIRTHDAY_SIGNOFFS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Remerciement aide)
  Object.assign(
    (rand) => {
      const h = pick(N3_MOVE_HELPERS, rand)
      const m = pick(N3_MOVE_TASKS, rand)
      const text = `Salut ${h} ! Un grand merci pour ton aide précieuse lors de ${m.task} ${m.day}. Grâce à ton énergie et ta bonne humeur, tout s’est très bien passé. On t’invite à souper bientôt pour fêter ça !`
      return {
        text,
        questions: [
          q('Pourquoi l’expéditeur envoie-t-il ce message ?', 'pour remercier un ami de son aide', 'pour inviter des voisins à un concert', 'pour demander de prêter une remorque', ['merci']),
          q('Quelle qualité de l’ami est soulignée dans le texte ?', 'sa bonne humeur et son dynamisme', 'sa ponctualité aux réunions du matin', 'sa connaissance des routes de la ville', ['humeur', 'énergie']),
        ],
      }
    },
    { situation: 0, capacity: N3_MOVE_HELPERS.length * N3_MOVE_TASKS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Félicitations promotion)
  Object.assign(
    (rand) => {
      const p = pick(N3_PROMOTIONS, rand)
      const div = pick(N3_DIVISIONS, rand)
      const text = `Chère ${p.name}, toute ${div} tient à te féliciter chaleureusement pour ta nomination comme ${p.role}. C’est une reconnaissance pleinement méritée pour ton travail. Nous te souhaitons beaucoup de succès !`
      return {
        text,
        questions: [
          q('Quel évènement professionnel est célébré ici ?', p.roleP, 'le départ d’une collègue en voyage', 'l’arrivée d’un nouveau directeur', [p.role.split(' ')[0].toLowerCase()]),
          q('Quel sentiment l’équipe exprime-t-elle dans ce message ?', 'de chaleureuses félicitations pour son succès', 'une vive inquiétude face aux changements', 'une grande surprise devant cette annonce', ['succès']),
        ],
      }
    },
    { situation: 1, capacity: N3_PROMOTIONS.length * N3_DIVISIONS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Manteau d'hiver Marc
  {
    situation: 0,
    text: 'Allô Marc ! Ton nouveau manteau d’hiver te va super bien. La couleur bleue et la coupe moderne sont parfaites pour toi. Belle trouvaille pour la saison !',
    questions: [
      q('Quel article fait l’objet de ce compliment ?', 'un manteau bien adapté à la saison', 'une paire de bottes de ski alpin neuves', 'un sac à dos d’école en toile épaisse', ['manteau']),
      q('Qu’est-ce qui est particulièrement apprécié ?', 'la coupe moderne et la belle couleur', 'le tissu imperméable et les poches', 'la fermeture éclair solide et le col', ['coupe moderne']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Anniversaire Sophie
  {
    situation: 1,
    text: 'Bonjour Sophie ! Toute l’équipe du bureau te souhaite un joyeux anniversaire. Que cette journée t’apporte joie, repos et sourires avec ta famille. On t’attend demain avec le gâteau !',
    questions: [
      q('Quelle fête les collègues célèbrent-ils par courriel ?', 'l’anniversaire de naissance de Sophie', 'la fin d’un projet important au bureau', 'le départ en vacances de leur collègue', ['anniversaire']),
      q('Qu’est-ce qui est prévu au bureau pour le lendemain ?', 'partager un gâteau avec les collègues', 'assister à une réunion de crise urgente', 'faire des heures supplémentaires le soir', ['gâteau']),
    ],
  },
]

// -------------------------------------------------------------

// N04 LISTENING TABLES & SCENARIOS
// -------------------------------------------------------------

// ===========================================================================
// NIVEAU 4 SCENARIOS IMPLEMENTATION
// ===========================================================================

// ---------------------------------------------------------------------------
// n4-listening-0
// ---------------------------------------------------------------------------
const N4_APTS = [
  { type: 'quatre et demie', street: 'sur la rue Saint-Denis', city: 'à Montréal', num: '514 555-0145' },
  { type: 'trois et demie', street: 'sur la 3e Avenue', city: 'dans Limoilou', num: '418 555-0164' },
  { type: 'cinq et demie', street: 'près du boulevard Charest', city: 'à Québec', num: '418 555-0198' },
  { type: 'trois et demie rénové', street: 'près de la station Cartier', city: 'à Laval', num: '450 555-0134' },
  { type: 'quatre et demie ensoleillé', street: 'sur la rue King Ouest', city: 'à Sherbrooke', num: '819 555-0177' },
]
const N4_RENTS = ['1 150 dollars', '1 280 dollars', '980 dollars', '1 340 dollars', '1 050 dollars']
const N4_AVIALS = ['le premier juillet', 'le premier juin', 'le premier août', 'le quinze juillet']
const N4_LANDLORDS = ['madame Tremblay', 'monsieur Gagnon', 'madame Roy', 'monsieur Bouchard']

const N4_APPLIANCES = [
  { item: 'le réfrigérateur avec congélateur', itemFr: 'du réfrigérateur' },
  { item: 'la laveuse frontale moderne', itemFr: 'de la laveuse frontale' },
  { item: 'la sécheuse électrique silencieuse', itemFr: 'de la sécheuse électrique' },
  { item: 'la cuisinière vitrocéramique', itemFr: 'de la cuisinière' },
  { item: 'le lave-vaisselle encastré', itemFr: 'du lave-vaisselle' },
]
const N4_APPLIANCE_YEARS = ['trois années complètes', 'deux années complètes', 'quatre années complètes', 'cinq années complètes']
const N4_APPLIANCE_PRICES = ['149 dollars', '119 dollars', '129 dollars', '179 dollars', '139 dollars']
const N4_APPLIANCE_COVS = [
  { text: 'les pièces et la main-d’œuvre à domicile', opt: 'les pièces et la main-d’œuvre', kw: 'pièces' },
  { text: 'le moteur électrique et les réparations urgentes', opt: 'le moteur et les réparations', kw: 'moteur' },
  { text: 'toutes les pannes mécaniques imprévues sur place', opt: 'les pannes mécaniques imprévues', kw: 'mécaniques' },
  { text: 'les fuites internes et les pièces électroniques', opt: 'les fuites et les pièces électroniques', kw: 'fuites' },
]

const N4_STORAGE_UNITS = [
  { size: 'de six mètres carrés', street: 'sur le boulevard Saint-Laurent', city: 'à Montréal', fee: '85 dollars' },
  { size: 'de huit mètres carrés', street: 'sur le boulevard Charest', city: 'à Québec', fee: '95 dollars' },
  { size: 'de dix mètres carrés', street: 'près du boulevard Curé-Labelle', city: 'à Laval', fee: '110 dollars' },
  { size: 'de quatre mètres carrés', street: 'sur la rue King Ouest', city: 'à Sherbrooke', fee: '75 dollars' },
  { size: 'de sept mètres carrés', street: 'sur le boulevard des Forges', city: 'à Trois-Rivières', fee: '90 dollars' },
]
const N4_STORAGE_DATES = [
  'le premier mai',
  'le quinze mai',
  'le premier juin',
  'le quinze juin',
]

const N4_FURNITURE_DELIVERIES = [
  { item: 'votre table de cuisine en bois', fee: '69 dollars', feeOpt: '69 dollars pour le transport' },
  { item: 'votre meuble de salon en chêne', fee: '89 dollars', feeOpt: '89 dollars pour le transport' },
  { item: 'votre bibliothèque moderne', fee: '59 dollars', feeOpt: '59 dollars pour le transport' },
  { item: 'votre canapé trois places', fee: '79 dollars', feeOpt: '79 dollars pour le transport' },
  { item: 'votre ensemble de chambre', fee: '99 dollars', feeOpt: '99 dollars pour le transport' },
]
const N4_DELIVERY_SLOTS = [
  { slot: 'vendredi prochain en après-midi', opt: 'vendredi en après-midi' },
  { slot: 'samedi prochain dans la matinée', opt: 'samedi dans la matinée' },
  { slot: 'mardi prochain en début de soirée', opt: 'mardi en début de soirée' },
  { slot: 'jeudi prochain en après-midi', opt: 'jeudi en après-midi' },
]

export const N04_L_0 = [
  // Scenario 1 (Template, situation: 0) - Location d'un logement
  Object.assign(
    (rand) => {
      const apt = pick(N4_APTS, rand)
      const rent = pick(N4_RENTS, rand)
      const avail = pick(N4_AVIALS, rand)
      const land = pick(N4_LANDLORDS, rand)
      const othersRent = sample(N4_RENTS.filter((r) => r !== rent), 2, rand)
      const othersAvail = sample(N4_AVIALS.filter((a) => a !== avail), 2, rand)
      const text = `Bonjour, ici ${land}. Je vous rappelle pour le logement ${apt.type} ${apt.street} ${apt.city}. Le loyer est fixé à ${rent} par mois, chauffé et éclairé. Le bail débute ${avail}. L’appartement comprend une entrée laveuse-sécheuse et un grand balcon. Rappelez-moi au ${apt.num} pour planifier une visite ce samedi.`
      return {
        text,
        questions: [
          q('Combien coûte le loyer mensuel de ce logement ?', `${rent} par mois`, `${othersRent[0]} par mois`, `${othersRent[1]} par mois`, [rent.split(' ')[0]]),
          q('À quelle date le contrat de location débute-t-il ?', avail, othersAvail[0], othersAvail[1], [avail.split(' ').pop().toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N4_APTS.length * N4_RENTS.length * N4_AVIALS.length * N4_LANDLORDS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Garantie prolongée d'un appareil
  Object.assign(
    (rand) => {
      const app = pick(N4_APPLIANCES, rand)
      const years = pick(N4_APPLIANCE_YEARS, rand)
      const price = pick(N4_APPLIANCE_PRICES, rand)
      const cov = pick(N4_APPLIANCE_COVS, rand)
      const othersPrice = sample(N4_APPLIANCE_PRICES.filter((p) => p !== price), 2, rand)
      const othersCov = sample(N4_APPLIANCE_COVS.filter((c) => c.opt !== cov.opt), 2, rand)
      const text = `Pour la garantie prolongée ${app.itemFr}, notre magasin propose une protection de ${years} pour seulement ${price}. Ce contrat couvre ${cov.text}. Si un technicien certifié ne peut pas réparer l’appareil à domicile, le commerçant vous fournit un appareil neuf.`
      return {
        text,
        questions: [
          q('Combien coûte cette protection supplémentaire ?', price, othersPrice[0], othersPrice[1], [price.split(' ')[0]]),
          q('Que comprend la couverture de ce contrat ?', cov.opt, othersCov[0].opt, othersCov[1].opt, [cov.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_APPLIANCES.length * N4_APPLIANCE_YEARS.length * N4_APPLIANCE_PRICES.length * N4_APPLIANCE_COVS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Location d'un espace d'entreposage)
  Object.assign(
    (rand) => {
      const unit = pick(N4_STORAGE_UNITS, rand)
      const date = pick(N4_STORAGE_DATES, rand)
      const othersUnit = sample(N4_STORAGE_UNITS.filter((u) => u.fee !== unit.fee), 2, rand)
      const othersDate = sample(N4_STORAGE_DATES.filter((d) => d !== date), 2, rand)
      const text = `Bonjour, ici Martin du centre Mini-Entrepôt. Je vous appelle pour le local de rangement ${unit.size} situé ${unit.street} ${unit.city}. Le coût est de ${unit.fee} par mois avec accès sécurisé tous les jours. L’espace est libre pour ${date}. Rappelez-moi au 514 555-0122 pour confirmer votre réservation de local.`
      return {
        text,
        questions: [
          q('Quel est le tarif mensuel pour ce local de rangement ?', `${unit.fee} par mois`, `${othersUnit[0].fee} par mois`, `${othersUnit[1].fee} par mois`, [unit.fee.split(' ')[0]]),
          q('À quelle date cet espace de stockage est-il libre ?', date, othersDate[0], othersDate[1], [date.split(' ').pop().toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N4_STORAGE_UNITS.length * N4_STORAGE_DATES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Forfait de livraison de meubles)
  Object.assign(
    (rand) => {
      const furn = pick(N4_FURNITURE_DELIVERIES, rand)
      const slot = pick(N4_DELIVERY_SLOTS, rand)
      const othersFurn = sample(N4_FURNITURE_DELIVERIES.filter((f) => f.feeOpt !== furn.feeOpt), 2, rand)
      const othersSlot = sample(N4_DELIVERY_SLOTS.filter((s) => s.opt !== slot.opt), 2, rand)
      const text = `Pour la livraison et l’assemblage de ${furn.item}, notre magasin propose un forfait complet à ${furn.fee}. Le transporteur monte les boîtes dans la bonne pièce et reprend les emballages vides. Le rendez-vous est prévu ${slot.slot}. Merci de confirmer votre présence par téléphone avant demain midi.`
      return {
        text,
        questions: [
          q('Combien coûte le forfait proposé pour ce meuble ?', furn.feeOpt, othersFurn[0].feeOpt, othersFurn[1].feeOpt, [furn.fee.split(' ')[0]]),
          q('À quel moment la livraison aura-t-elle lieu ?', slot.opt, othersSlot[0].opt, othersSlot[1].opt, [slot.opt.split(' ')[0].toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N4_FURNITURE_DELIVERIES.length * N4_DELIVERY_SLOTS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Logement trois et demie à Limoilou
  {
    situation: 0,
    text: 'Bonjour, ici la propriétaire du triplex de la 8e Avenue à Limoilou. Notre trois et demie au rez-de-chaussée est prêt pour une sous-location dès le premier mai. Le loyer est de 890 dollars par mois, comprenant le chauffage et une cour arrière clôturée. Contactez-moi au 418 555-0112.',
    questions: [
      q('Quel est le loyer mensuel du trois et demie ?', '890 dollars par mois', '940 dollars par mois', '820 dollars par mois', ['890 dollars']),
      q('Quel aménagement extérieur est inclus avec le logis ?', 'une cour arrière clôturée', 'une terrasse sur le toit', 'un grand balcon privé', ['cour arrière']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Service d'entretien de climatiseur
  {
    situation: 1,
    text: 'Pour votre nouveau climatiseur portatif, nous recommandons le plan de service de trois ans à 99 dollars. Cette garantie couvre le compresseur, la main-d’œuvre et un entretien gratuit chaque printemps. En cas de bris l’été, un technicien intervient en 48 heures ouvrables.',
    questions: [
      q('Quel est le tarif de ce plan de service ?', '99 dollars au total', '129 dollars au total', '79 dollars au total', ['99 dollars']),
      q('Quel entretien gratuit est prévu par le contrat ?', 'un entretien chaque printemps', 'une inspection chaque automne', 'un nettoyage chaque hiver', ['chaque printemps']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-1
// ---------------------------------------------------------------------------
const N4_DISPENSERS = [
  {
    machine: 'la distributrice de café',
    card: 'ta carte d’employé',
    step2: 'choisis ta boisson sur l’écran tactile',
    button: 'sur le bouton vert pour valider',
    validOpt: 'choisir sa boisson et valider avec le bouton vert',
    kwBtn: 'vert',
    otherOpt1: 'insérer une pièce de monnaie dans le panneau arrière',
    otherOpt2: 'appuyer sur la commande rouge d’arrêt d’urgence',
  },
  {
    machine: 'la distributrice de collations',
    card: 'ta carte magnétique',
    step2: 'tape le numéro de ton choix sur le clavier',
    button: 'sur la touche étoile pour confirmer',
    validOpt: 'taper le bon numéro et confirmer avec l’étoile',
    kwBtn: 'étoile',
    otherOpt1: 'redémarrer l’interrupteur général de l’appareil',
    otherOpt2: 'demander une autorisation au service technique',
  },
  {
    machine: 'la borne de recharge pour repas',
    card: 'ta carte de cantine',
    step2: 'indique le montant souhaité sur le pavé',
    button: 'sur le bouton bleu pour terminer',
    validOpt: 'indiquer le montant voulu et appuyer sur le bleu',
    kwBtn: 'bleu',
    otherOpt1: 'changer le câble d’alimentation de la borne',
    otherOpt2: 'laisser la carte dans le lecteur toute la nuit',
  },
  {
    machine: 'l’imprimante réseau de l’étage',
    card: 'ton badge de travail',
    step2: 'sélectionne tes documents en attente',
    button: 'sur le bouton de départ pour imprimer',
    validOpt: 'sélectionner ses documents pour imprimer',
    kwBtn: 'imprimer',
    otherOpt1: 'ouvrir le capot supérieur pour vérifier l’encre',
    otherOpt2: 'éteindre le boîtier avant chaque nouvelle page',
  },
]
const N4_COLLEAGUES = ['Sophie', 'Carlos', 'Youssef', 'Chloé', 'Amadou', 'Valérie']

const N4_DESK_REQUESTS = [
  {
    lost: 'ma carte d’accès au stationnement',
    topicOpt: 'la procédure pour remplacer sa carte d’accès',
    kwTopic: 'carte d’accès',
    otherTopic1: 'le tarif mensuel pour garer son véhicule',
    otherTopic2: 'l’emplacement des bornes de recharge privées',
    answerGood: 'Remplissez ce formulaire et montrez une pièce d’identité.',
    answerWrong1: 'Merci beaucoup pour cette invitation très sympathique.',
    answerWrong2: 'Je prends un café noir sans sucre, s’il vous plaît.',
  },
  {
    lost: 'mon mot de passe pour le portail du personnel',
    topicOpt: 'la démarche pour réinitialiser son mot de passe',
    kwTopic: 'mot de passe',
    otherTopic1: 'la liste des nouveaux ordinateurs de l’entreprise',
    otherTopic2: 'l’horaire de fermeture de la salle informatique',
    answerGood: 'Entrez votre matricule et cliquez sur Réinitialiser ici.',
    answerWrong1: 'Félicitations pour votre promotion dans l’équipe.',
    answerWrong2: 'Le restaurant italien du coin est excellent le midi.',
  },
  {
    lost: 'ma carte de bibliothèque municipale',
    topicOpt: 'la marche à suivre pour obtenir une nouvelle carte',
    kwTopic: 'carte',
    otherTopic1: 'le nombre de livres disponibles pour les enfants',
    otherTopic2: 'la date de la prochaine exposition de peinture',
    answerGood: 'Présentez une preuve d’adresse au bureau d’accueil.',
    answerWrong1: 'Désolé, je ne peux pas venir souper ce samedi soir.',
    answerWrong2: 'Il fait vraiment un temps magnifique aujourd’hui.',
  },
  {
    lost: 'mon formulaire d’assurance collective',
    topicOpt: 'la méthode pour envoyer son dossier d’assurance',
    kwTopic: 'assurance',
    otherTopic1: 'le montant total des primes versées cette année',
    otherTopic2: 'le nom du nouveau responsable du personnel',
    answerGood: 'Téléversez le document signé sur le site internet.',
    answerWrong1: 'Je vous remercie de m’avoir prêté votre parapluie.',
    answerWrong2: 'Nous pouvons aller prendre une marche après le dîner.',
  },
]

const N4_PORTAL_TASKS = [
  {
    task: 'déposer une demande de congés d’été',
    topicOpt: 'la façon d’enregistrer une demande de congés',
    kwTask: 'congés',
    otherTopic1: 'l’horaire de travail prévu pour le mois prochain',
    otherTopic2: 'le compte rendu officiel de la dernière assemblée',
    answerGood: 'Ouvre l’onglet Calendrier puis clique sur Nouveau.',
    answerWrong1: 'J’ai déjà réservé ma table pour le souper d’hier.',
    answerWrong2: 'Enchanté de faire votre connaissance ce matin.',
  },
  {
    task: 'soumettre une note de frais de déplacement',
    topicOpt: 'la méthode pour déclarer des frais de déplacement',
    kwTask: 'frais de déplacement',
    otherTopic1: 'le choix du moyen de transport pour la formation',
    otherTopic2: 'l’adresse exacte de l’hôtel réservé par l’agence',
    answerGood: 'Ajoute tes reçus en photo et valide le total en bas.',
    answerWrong1: 'Bonne fin de semaine et repose-toi bien surtout.',
    answerWrong2: 'Je préfère manger une salade verte pour le repas.',
  },
  {
    task: 'changer mes coordonnées bancaires pour la paie',
    topicOpt: 'la procédure pour mettre à jour ses données bancaires',
    kwTask: 'bancaires',
    otherTopic1: 'la date de versement de la prochaine prime annuelle',
    otherTopic2: 'le nom de l’institution financière de l’employeur',
    answerGood: 'Dépose un document bancaire dans la section Mon profil.',
    answerWrong1: 'Ce dossier volumineux est déjà prêt pour la poste.',
    answerWrong2: 'Il pleut assez fort dehors depuis ce matin tôt.',
  },
  {
    task: 'réserver une salle pour la réunion de service',
    topicOpt: 'la démarche pour réserver un local de réunion',
    kwTask: 'réunion',
    otherTopic1: 'le compte rendu rédigé par la secrétaire adjointe',
    otherTopic2: 'la liste des invités présents au colloque annuel',
    answerGood: 'Choisis la plage libre sur l’agenda partagé du groupe.',
    answerWrong1: 'Merci pour ce joli cadeau offert à mon anniversaire.',
    answerWrong2: 'Le café sans caféine est disponible au distributeur.',
  },
]

const N4_COMMUNITY_COURSES = [
  {
    course: 'aux ateliers de conversation en français',
    topicOpt: 'comment participer aux ateliers de français',
    kwCourse: 'français',
    otherTopic1: 'les horaires de la piscine pour la fin de semaine',
    otherTopic2: 'les tarifs de location de la salle des fêtes',
    answerGood: 'Remplissez la fiche jaune au secrétariat avec votre carte.',
    answerWrong1: 'J’ai acheté du pain et du lait à l’épicerie ce midi.',
    answerWrong2: 'Le train de banlieue arrive sur la voie numéro trois.',
  },
  {
    course: 'aux séances de gymnastique douce pour adultes',
    topicOpt: 'la procédure pour s’inscrire aux cours de gymnastique',
    kwCourse: 'gymnastique',
    otherTopic1: 'le règlement concernant les casiers du vestiaire',
    otherTopic2: 'la date de la fête annuelle des bénévoles du centre',
    answerGood: 'Présentez un certificat médical au comptoir de sports.',
    answerWrong1: 'Je vous envoie le rapport dès demain matin sans faute.',
    answerWrong2: 'Cette veste noire me semble un peu trop petite pour moi.',
  },
  {
    course: 'aux cours de dessin pour débutants le samedi',
    topicOpt: 'les étapes pour réserver une place en cours de dessin',
    kwCourse: 'cours de dessin',
    otherTopic1: 'le nom de l’artiste invité pour l’exposition d’art',
    otherTopic2: 'le programme de musique offert durant le festival',
    answerGood: 'Inscrivez votre nom sur la liste à l’entrée de l’atelier.',
    answerWrong1: 'Prenez soin de vous et à la semaine prochaine, salut.',
    answerWrong2: 'Ma voiture est garée juste devant la porte de sortie.',
  },
  {
    course: 'aux ateliers de cuisine collective du mardi',
    topicOpt: 'la façon d’intégrer les ateliers de cuisine du centre',
    kwCourse: 'cuisine',
    otherTopic1: 'le menu de la cantine scolaire pour la semaine',
    otherTopic2: 'l’horaire d’ouverture de la pharmacie du quartier',
    answerGood: 'Venez rencontrer l’animatrice demain entre dix et midi.',
    answerWrong1: 'Très bonne idée, je vais commander un thé glacé aussi.',
    answerWrong2: 'La station de métro la plus proche est à deux coins.',
  },
]

export const N04_L_1 = [
  // Scenario 1 (Template, situation: 0) - Fonctionnement d'un appareil partagé au travail
  Object.assign(
    (rand) => {
      const d = pick(N4_DISPENSERS, rand)
      const col = pick(N4_COLLEAGUES, rand)
      const text = `— Dis ${col}, tu sais comment fonctionne ${d.machine} dans la salle de pause ? Je viens d’arriver dans l’équipe et je ne l’ai jamais utilisée.\n— C’est très simple : passe ${d.card}, ${d.step2} et appuie ${d.button}.`
      return {
        text,
        questions: [
          q('Que demande le collègue au début de la conversation ?', 'comment fonctionne cet appareil', 'à quelle heure commence la réunion d’équipe', 'où se trouve la salle de pause des employés', ['fonctionne']),
          q('Quelle consigne permet d’utiliser correctement l’appareil ?', d.validOpt, d.otherOpt1, d.otherOpt2, [d.kwBtn]),
        ],
      }
    },
    { situation: 0, capacity: N4_DISPENSERS.length * N4_COLLEAGUES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Demande de renseignements au comptoir de services
  Object.assign(
    (rand) => {
      const req = pick(N4_DESK_REQUESTS, rand)
      const text = `— Bonjour madame, excusez-moi de vous déranger à l’accueil. J’ai égaré ${req.lost} ce matin en venant au bureau. Est-ce que vous pourriez m’expliquer la marche à suivre pour régler cette situation rapidement aujourd’hui ?`
      return {
        text,
        questions: [
          q('Quel renseignement le visiteur demande-t-il au comptoir ?', req.topicOpt, req.otherTopic1, req.otherTopic2, [req.kwTopic]),
          q('Quelle réponse donnée par l’agente est appropriée ?', req.answerGood, req.answerWrong1, req.answerWrong2, ['accueil']),
        ],
      }
    },
    { situation: 1, capacity: N4_DESK_REQUESTS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Démarche sur le portail d'entreprise)
  Object.assign(
    (rand) => {
      const item = pick(N4_PORTAL_TASKS, rand)
      const col = pick(N4_COLLEAGUES, rand)
      const text = `— Salut ${col} ! Est-ce que tu pourrais m’expliquer comment ${item.task} sur le portail interne ? Je cherche depuis dix minutes dans tous les menus sans succès, et j’aimerais terminer cette démarche avant de quitter le bureau.`
      return {
        text,
        questions: [
          q('Sur quel point le collègue demande-t-il des explications ?', item.topicOpt, item.otherTopic1, item.otherTopic2, [item.kwTask]),
          q('Quelle réponse de la collègue est adaptée à la demande ?', item.answerGood, item.answerWrong1, item.answerWrong2, ['menus']),
        ],
      }
    },
    { situation: 0, capacity: N4_PORTAL_TASKS.length * N4_COLLEAGUES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Inscription aux activités d'un centre de quartier)
  Object.assign(
    (rand) => {
      const item = pick(N4_COMMUNITY_COURSES, rand)
      const text = `— Bonjour monsieur. Je viens tout juste d’emménager dans le quartier avec ma famille. Pouvez-vous m’expliquer comment s’inscrire ${item.course} ? J’ai vu l’affiche à l’entrée, mais je ne connais pas du tout les démarches.`
      return {
        text,
        questions: [
          q('Quel renseignement le citoyen demande-t-il au centre ?', item.topicOpt, item.otherTopic1, item.otherTopic2, [item.kwCourse]),
          q('Quelle réponse de l’employé est adaptée à la situation ?', item.answerGood, item.answerWrong1, item.answerWrong2, ['affiche']),
        ],
      }
    },
    { situation: 1, capacity: N4_COMMUNITY_COURSES.length }
  ),
  // Scenario 5 (Static, situation: 0) - Utilisation du numériseur de la réception
  {
    situation: 0,
    text: '— Bonjour Sylvain. Peux-tu m’expliquer comment utiliser le numériseur de la réception ? Je veux envoyer un contrat signé à la direction par courriel aujourd’hui. J’ai placé le document sur la vitre, mais je ne sais pas quoi choisir sur l’écran.',
    questions: [
      q('Que cherche à savoir la personne au début du message ?', 'la marche à suivre pour utiliser le numériseur', 'le prix d’une cartouche d’encre pour l’appareil', 'l’heure de ramassage du courrier par la poste', ['numériseur']),
      q('Quelle consigne du collègue est appropriée ?', 'Sélectionne Envoi courriel et appuie sur Départ.', 'Je serais ravi de venir dîner avec vous demain.', 'Désolé, mais j’ai un rendez-vous chez le médecin.', ['courriel']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Remplacement d'une carte de transport défectueuse
  {
    situation: 1,
    text: '— Excusez-moi monsieur, ma carte d’autobus mensuelle ne fonctionne plus quand je la passe sur la borne ce matin. Est-ce que vous pourriez m’expliquer la procédure pour régler ce problème ? Je dois prendre l’autobus tous les jours.',
    questions: [
      q('Quelle explication l’usager demande-t-il au commis ?', 'la façon de remplacer une carte défectueuse', 'le tarif d’un billet unitaire pour le métro', 'l’horaire de passage du prochain autobus rapide', ['carte']),
      q('Quelle réponse du commis est adaptée à cette situation ?', 'Montrez votre carte au guichet avec votre reçu.', 'Félicitations pour votre nouvelle maison en ville.', 'Je prends un thé à la menthe avec un peu de sucre.', ['carte']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-2
// ---------------------------------------------------------------------------
const N4_HOCKEY_TEAMS = ['Toronto', 'Boston', 'Ottawa', 'Vancouver', 'New York']
const N4_HOCKEY_SHOTS = [
  { text: 'trente-cinq tirs difficiles', opt: 'il a arrêté trente-cinq tirs difficiles', kw: 'trente-cinq' },
  { text: 'quarante tirs dangereux', opt: 'il a bloqué quarante tirs dangereux', kw: 'quarante' },
  { text: 'vingt-huit lancers précis', opt: 'il a stoppé vingt-huit lancers précis', kw: 'vingt-huit' },
  { text: 'trente-deux tirs au but', opt: 'il a repoussé trente-deux tirs au but', kw: 'trente-deux' },
]
const N4_HOCKEY_PERIODS = ['en fin de troisième période', 'au milieu de la deuxième période', 'durant la première période', 'au début du dernier tiers']
const N4_HOCKEY_OUTCOMES = ['le but gagnant en prolongation', 'la victoire avec deux buts d’avance', 'un superbe but en avantage numérique', 'le filet décisif en fin de partie']

const N4_CLINIC_CONDITIONS = [
  {
    name: 'une bronchite aiguë',
    symp: 'une toux sèche persistante, des frissons et une légère fièvre',
    warn: { text: 'ressentez de la difficulté à respirer', short: 'une difficulté respiratoire importante', kw: 'difficulté' },
  },
  {
    name: 'une gastro-entérite virale',
    symp: 'des crampes abdominales, des nausées et des vomissements fréquents',
    warn: { text: 'avez des signes de déshydratation nette', short: 'des signes de déshydratation nette', kw: 'déshydratation' },
  },
  {
    name: 'une infection des sinus',
    symp: 'des maux de tête frontaux, une congestion nasale et une pression aux joues',
    warn: { text: 'constatez une forte enflure au visage', short: 'une forte enflure au visage', kw: 'enflure' },
  },
  {
    name: 'une forte grippe saisonnière',
    symp: 'des courbatures intenses, de la fièvre et un mal de gorge aigu',
    warn: { text: 'observez une hausse subite de fièvre', short: 'une hausse subite de la fièvre', kw: 'fièvre' },
  },
]

const N4_SOCCER_PARKS = [
  { park: 'au parc Maisonneuve', city: 'à Montréal' },
  { park: 'sur le terrain des Plaines', city: 'à Québec' },
  { park: 'au parc de la Rivière', city: 'à Laval' },
  { park: 'au parc Jacques-Cartier', city: 'à Sherbrooke' },
  { park: 'près de l’école secondaire', city: 'à Trois-Rivières' },
]
const N4_SOCCER_SCORES = [
  { scoreFr: 'trois à deux', opt: 'une victoire serrée par trois à deux' },
  { scoreFr: 'quatre à trois', opt: 'une victoire serrée par quatre à trois' },
  { scoreFr: 'deux à un', opt: 'une victoire serrée par deux à un' },
  { scoreFr: 'trois à un', opt: 'une victoire nette par trois à un' },
]
const N4_SOCCER_HIGHLIGHTS = [
  { text: 'un superbe but de la tête à la fin', opt: 'un superbe but marqué de la tête', kw: 'tête' },
  { text: 'un tir précis dans le coin du filet', opt: 'un tir très précis au fond du filet', kw: 'filet' },
  { text: 'un bel arrêt de notre gardien au penalty', opt: 'un bel arrêt sur un tir de penalty', kw: 'penalty' },
  { text: 'une passe décisive de notre capitaine', opt: 'une passe parfaite de notre capitaine', kw: 'capitaine' },
]

const N4_PLUMBING_PROBLEMS = [
  {
    room: 'dans la cuisine',
    roomKw: 'cuisine',
    issue: 'le robinet de l’évier coule sans arrêt',
    measure: 'placé une grande bassine sous le meuble',
    probKw: 'évier',
    measKw: 'bassine',
    probOpt: 'une fuite continue sous l’évier de la cuisine',
    measOpt: 'installer une bassine sous le tuyau d’eau',
    otherProb1: 'une panne de courant dans les chambres',
    otherProb2: 'une porte de balcon difficile à verrouiller',
    otherMeas1: 'laisser la fenêtre du salon grande ouverte',
    otherMeas2: 'couper l’accès à l’ascenseur de l’immeuble',
  },
  {
    room: 'dans la salle de bain',
    roomKw: 'bain',
    issue: 'le tuyau sous le lavabo fuit goutte à goutte',
    measure: 'fermé la petite valve d’arrivée d’eau',
    probKw: 'lavabo',
    measKw: 'valve',
    probOpt: 'un écoulement d’eau sous le lavabo de la salle de bain',
    measOpt: 'fermer la valve locale d’arrivée d’eau',
    otherProb1: 'une poignée d’entrée complètement bloquée',
    otherProb2: 'un rideau de douche déchiré par le vent',
    otherMeas1: 'allumer le chauffage d’appoint au maximum',
    otherMeas2: 'nettoyer le carrelage avec du savon noir',
  },
  {
    room: 'près de la laveuse',
    roomKw: 'laveuse',
    issue: 'le tuyau de vidange déborde sur le plancher',
    measure: 'épongé le sol et arrêté la machine',
    probKw: 'vidange',
    measKw: 'sol',
    probOpt: 'un débordement du tuyau de vidange d’eau',
    measOpt: 'éponger le sol et éteindre l’appareil',
    otherProb1: 'un bruit de grincement dans le plancher',
    otherProb2: 'une prise murale sans tension électrique',
    otherMeas1: 'laisser tourner la machine toute la soirée',
    otherMeas2: 'ouvrir le robinet extérieur du jardinier',
  },
  {
    room: 'au sous-sol du bâtiment',
    roomKw: 'sous-sol',
    issue: 'le chauffe-eau présente une fuite à la base',
    measure: 'déposé des linges secs autour du réservoir',
    probKw: 'chauffe-eau',
    measKw: 'linges',
    probOpt: 'une fuite d’eau à la base du chauffe-eau',
    measOpt: 'poser des linges autour du réservoir d’eau',
    otherProb1: 'un verrou de porte rouillé par l’humidité',
    otherProb2: 'un escalier de secours difficile à monter',
    otherMeas1: 'remplir le réservoir avec de l’eau chaude',
    otherMeas2: 'déplacer la chaudière dans la cour arrière',
  },
]

export const N04_L_2 = [
  // Scenario 1 (Template, situation: 0) - Match de hockey du Canadien
  Object.assign(
    (rand) => {
      const team = pick(N4_HOCKEY_TEAMS, rand)
      const shots = pick(N4_HOCKEY_SHOTS, rand)
      const period = pick(N4_HOCKEY_PERIODS, rand)
      const outcome = pick(N4_HOCKEY_OUTCOMES, rand)
      const text = `— Tu as vu le match du Canadien hier soir contre ${team} ? C’était tout un spectacle ! Notre gardien a repoussé ${shots.text}. On a eu deux punitions ${period}, mais nos attaquants ont tenu bon et ont marqué ${outcome}. Tous les supporters fêtaient la victoire à la sortie de l’aréna.`
      return {
        text,
        questions: [
          q('Quelle performance remarquable le gardien a-t-il réalisée ?', shots.opt, 'il a concédé cinq buts rapides', 'il a été expulsé dès le début', [shots.kw]),
          q('Quelle équipe affrontait les Montréalais lors de ce match ?', `l’équipe ${de(team)}`, 'la sélection de Philadelphie', 'la formation de Détroit', [team.toLowerCase()]),
        ],
      }
    },
    { situation: 0, capacity: N4_HOCKEY_TEAMS.length * N4_HOCKEY_SHOTS.length * N4_HOCKEY_PERIODS.length * N4_HOCKEY_OUTCOMES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Conseils médicaux et symptômes d'une maladie
  Object.assign(
    (rand) => {
      const cond = pick(N4_CLINIC_CONDITIONS, rand)
      const othersWarn = sample(N4_CLINIC_CONDITIONS.filter((c) => c !== cond), 2, rand).map((c) => c.warn)
      const text = `— Bonjour monsieur. Pour traiter ${cond.name}, les symptômes habituels sont ${cond.symp}. Buvez beaucoup d’eau tiède et reposez-vous au lit pendant trois jours. En revanche, si vous ${cond.warn.text}, appelez sans tarder le service Info-Santé 811 ou venez à la clinique d’urgence.`
      return {
        text,
        questions: [
          q('Quel conseil de base le soignant donne-t-il au patient ?', 'se reposer au lit et boire de l’eau', 'reprendre le sport de haute intensité', 'partir en long voyage dès le lendemain', ['lit']),
          q('Quel signe doit pousser le patient à consulter d’urgence ?', cond.warn.short, othersWarn[0].short, othersWarn[1].short, [cond.warn.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_CLINIC_CONDITIONS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Match amical de soccer au parc)
  Object.assign(
    (rand) => {
      const loc = pick(N4_SOCCER_PARKS, rand)
      const sc = pick(N4_SOCCER_SCORES, rand)
      const high = pick(N4_SOCCER_HIGHLIGHTS, rand)
      const othersHigh = sample(N4_SOCCER_HIGHLIGHTS.filter((h) => h.opt !== high.opt), 2, rand)
      const text = `— Hier après-midi, notre club de quartier a joué un match amical de soccer ${loc.park} ${loc.city}. Il faisait beau et l’ambiance était très amicale. Notre équipe l’a emporté ${sc.scoreFr} grâce à ${high.text}. Nous avons fêté ce bon résultat en buvant un jus frais avec les voisins.`
      return {
        text,
        questions: [
          q('Quel a été le résultat final de cette partie amicale ?', sc.opt, 'une égalité d’un but partout', 'une défaite nette par quatre buts', [sc.scoreFr.split(' ')[0].toLowerCase()]),
          q('Quel fait de jeu marquant a assuré le succès de l’équipe ?', high.opt, othersHigh[0].opt, othersHigh[1].opt, [high.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_SOCCER_PARKS.length * N4_SOCCER_SCORES.length * N4_SOCCER_HIGHLIGHTS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Problème de plomberie signalé au propriétaire)
  Object.assign(
    (rand) => {
      const p = pick(N4_PLUMBING_PROBLEMS, rand)
      const text = `— Bonjour monsieur Tremblay. C’est le locataire du numéro quatre. Je vous contacte pour un problème de plomberie ${p.room}. Depuis ce matin, ${p.issue}. J’ai tout de suite ${p.measure}. Est-ce qu’un plombier pourrait passer aujourd’hui pour réparer le bris ? Merci de me rappeler rapidement.`
      return {
        text,
        questions: [
          q('Quel problème domestique le locataire signale-t-il ?', p.probOpt, p.otherProb1, p.otherProb2, [p.probKw]),
          q('Quelle précaution le locataire a-t-il prise immédiatement ?', p.measOpt, p.otherMeas1, p.otherMeas2, [p.measKw]),
        ],
      }
    },
    { situation: 1, capacity: N4_PLUMBING_PROBLEMS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Match de hockey Montréal contre Ottawa
  {
    situation: 0,
    text: '— Quel beau match de hockey hier entre Montréal et Ottawa ! Après un début difficile où nous tirions de l’arrière par deux buts, les attaquants ont marqué trois fois en troisième période. Le Centre Bell était en fête et l’ambiance était formidable pour les supporters québécois.',
    questions: [
      q('Quelle remontée sportive est décrite par le témoin ?', 'trois buts marqués en troisième période', 'deux pénalités évitées en fin de partie', 'un arrêt du match à cause de la glace', ['troisième période']),
      q('Quelle ambiance régnait dans l’aréna à la fin ?', 'une ambiance formidable et très joyeuse', 'une tension inquiétante parmi la foule', 'un silence complet après la défaite locale', ['formidable']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Réaction cutanée après une piqûre d'insecte
  {
    situation: 1,
    text: '— À la suite de votre piqûre d’insecte, une rougeur locale et une démangeaison modérée sont normales pendant deux jours. Appliquez de la glace enveloppée dans un linge propre. Par contre, si vous observez un gonflement du visage ou une difficulté à respirer, appelez sans tarder le 911.',
    questions: [
      q('Quelle réaction cutanée est jugée normale au départ ?', 'une rougeur cutanée avec démangeaison', 'une perte temporaire de la vision nette', 'un engourdissement total du bras entier', ['démangeaison']),
      q('Dans quelle situation faut-il composer immédiatement le 911 ?', 'si le visage gonfle ou la respiration bloque', 'si la démangeaison continue pendant une heure', 'si la trace rouge reste visible en surface', ['visage']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-3
// ---------------------------------------------------------------------------
const N4_AIRPORT_CITIES = ['de Paris', 'de Vancouver', 'de Sept-Îles', 'de Halifax', 'de Calgary']
const N4_AIRPORT_WAITS = ['pendant plus d’une heure au carrousel', 'pendant quarante-cinq minutes au débarcadère', 'pendant près d’une heure à l’arrivée', 'pendant plus d’une heure et demie']
const N4_AIRPORT_BAGS = [
  { text: 'mon gros bagage enregistré', pron: 'il', part: 'sorti' },
  { text: 'mon sac de voyage noir', pron: 'il', part: 'sorti' },
  { text: 'mon bagage bleu à roulettes', pron: 'il', part: 'sorti' },
  { text: 'mon sac à dos vert foncé', pron: 'il', part: 'sorti' },
]
const N4_AIRPORT_RESOLUTIONS = [
  { text: 'la compagnie me l’a livré le lendemain midi', opt: 'la compagnie lui a livré le lendemain midi', kw: 'lendemain' },
  { text: 'un livreur est passé chez moi deux jours après', opt: 'un livreur est passé à sa maison deux jours après', kw: 'livreur' },
  { text: 'l’agente m’a appelé le lendemain pour le récupérer', opt: 'l’agente l’a rappelé pour le récupérer', kw: 'agente' },
  { text: 'le service des bagages l’a déposé à ma porte mardi', opt: 'le service l’a déposé à sa porte mardi', kw: 'déposé' },
]

const N4_FAMILY_PARKS = [
  { text: 'au parc national de la Jacques-Cartier', opt: 'dans la vallée de la Jacques-Cartier' },
  { text: 'au parc national du Mont-Orford', opt: 'dans les sentiers du Mont-Orford' },
  { text: 'au parc national de la Mauricie', opt: 'dans la forêt de la Mauricie' },
  { text: 'au parc d’Oka près du grand lac', opt: 'près des rives du parc d’Oka' },
  { text: 'au parc national du Fjord-du-Saguenay', opt: 'dans le secteur du Fjord-du-Saguenay' },
]
const N4_FAMILY_ACTS = [
  { act: 'louer un grand canot familial pour explorer la rivière', short: 'du canot sur la rivière en famille' },
  { act: 'faire une belle randonnée pédestre jusqu’au sommet', short: 'une randonnée pédestre jusqu’au sommet' },
  { act: 'partir en kayak de mer le long des berges rocheuses', short: 'du kayak de mer près des berges rocheuses' },
  { act: 'rouler en vélo le long des sentiers de plage', short: 'du vélo sur les sentiers de la plage' },
]
const N4_FAMILY_DETAILS = [
  { text: 'observer des canards sauvages et marcher en forêt', short: 'marcher en forêt et voir des oiseaux', kw: 'canards' },
  { text: 'admirer la vue panoramique sur les lacs étincelants', short: 'admirer le panorama sur les lacs', kw: 'panoramique' },
  { text: 'pique-niquer tranquillement au bord des cascades', short: 'manger au bord des cascades d’eau', kw: 'cascades' },
  { text: 'se baigner et savourer de la crème glacée au soleil', short: 'se baigner et manger une glace', kw: 'glacée' },
]

const N4_TRANSIT_MISHAPS = [
  {
    dest: 'au centre-ville de Montréal',
    bus: 'le mauvais autobus de banlieue',
    busKw: 'autobus',
    mishapOpt: 'monter dans le mauvais autobus',
    help: 'une chauffeuse bienveillante m’a indiqué la bonne correspondance',
    helpOpt: 'une chauffeuse lui a indiqué la correspondance',
    helpKw: 'chauffeuse',
    otherHelp1: 'un agent de police l’a reconduit en patrouille',
    otherHelp2: 'un passant lui a vendu un vieux plan de ville',
  },
  {
    dest: 'au campus de l’Université Laval',
    bus: 'le circuit d’autobus express dans la mauvaise direction',
    busKw: 'autobus',
    mishapOpt: 'prendre un autobus dans la mauvaise direction',
    help: 'un étudiant sympathique m’a guidé jusqu’au bon quai',
    helpOpt: 'un étudiant l’a guidé vers le bon quai',
    helpKw: 'étudiant',
    otherHelp1: 'le chauffeur l’a forcé à marcher trois heures',
    otherHelp2: 'une patrouille municipale a bloqué la route',
  },
  {
    dest: 'au bureau d’accueil des nouveaux arrivants',
    bus: 'la mauvaise ligne de métro lors du transfert',
    busKw: 'métro',
    mishapOpt: 'prendre la mauvaise ligne de métro',
    help: 'une agente au guichet m’a imprimé le trajet complet',
    helpOpt: 'une agente lui a imprimé le bon trajet',
    helpKw: 'agente',
    otherHelp1: 'un passant l’a envoyé vers une fausse adresse',
    otherHelp2: 'le train a été annulé pour tout le reste du jour',
  },
  {
    dest: 'à mon premier appartement à Longueuil',
    bus: 'un autobus de nuit qui allait vers le terminus nord',
    busKw: 'autobus',
    mishapOpt: 'monter dans un mauvais autobus de nuit',
    help: 'un voisin de siège m’a prêté son téléphone pour m’orienter',
    helpOpt: 'un passager lui a prêté son téléphone',
    helpKw: 'téléphone',
    otherHelp1: 'un contrôleur lui a confisqué sa valise rouge',
    otherHelp2: 'le véhicule est tombé en panne sur l’autoroute',
  },
]

const N4_ORCHARDS = [
  { region: 'à Rougemont', fruit: 'des pommes Cortland fraîches', dessert: 'du jus de pomme chaud avec des beignes', fruitOpt: 'cueillir des pommes dans les arbres', snackOpt: 'du jus chaud accompagné de beignes', kwFruit: 'pommes', kwSnack: 'beignes' },
  { region: 'à Saint-Joseph-du-Lac', fruit: 'des pommes McIntosh croquantes', dessert: 'une tarte aux pommes et du cidre doux', fruitOpt: 'cueillir des pommes dans le verger', snackOpt: 'une part de tarte avec du cidre', kwFruit: 'pommes', kwSnack: 'cidre' },
  { region: 'près de l’île d’Orléans', fruit: 'des pommes Honeycrisp bien mûres', dessert: 'des chaussons aux pommes et du lait', fruitOpt: 'ramasser des pommes bien mûres', snackOpt: 'des chaussons aux pommes avec du lait', kwFruit: 'pommes', kwSnack: 'chaussons' },
  { region: 'dans les Cantons-de-l’Est', fruit: 'des pommes Gala très sucrées', dessert: 'du moût de pomme et du pain doré', fruitOpt: 'récolter des pommes très sucrées', snackOpt: 'du pain doré avec du moût frais', kwFruit: 'pommes', kwSnack: 'pain' },
]

export const N04_L_3 = [
  // Scenario 1 (Template, situation: 0) - Mésaventure de valise retardée à l'aéroport
  Object.assign(
    (rand) => {
      const city = pick(N4_AIRPORT_CITIES, rand)
      const wait = pick(N4_AIRPORT_WAITS, rand)
      const bag = pick(N4_AIRPORT_BAGS, rand)
      const res = pick(N4_AIRPORT_RESOLUTIONS, rand)
      const othersRes = sample(N4_AIRPORT_RESOLUTIONS.filter((r) => r.opt !== res.opt), 2, rand)
      const text = `— Tu ne devineras jamais ce qui m’est arrivé à l’aéroport de Montréal en rentrant ${city} ! En débarquant de l’avion, j’ai guetté ${bag.text} ${wait}. Le carrousel s’est arrêté et ${bag.pron} n’est jamais ${bag.part}. J’ai fait une déclaration au comptoir. Heureusement, ${res.text} !`
      return {
        text,
        questions: [
          q('Quel incident de voyage la personne raconte-t-elle ?', 'la perte temporaire de son bagage à l’aéroport', 'l’annulation soudaine de son vol de retour', 'un oubli de portefeuille dans la salle d’attente', ['aéroport']),
          q('Comment cette mésaventure s’est-elle finalement terminée ?', res.opt, othersRes[0].opt, othersRes[1].opt, [res.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_AIRPORT_CITIES.length * N4_AIRPORT_WAITS.length * N4_AIRPORT_BAGS.length * N4_AIRPORT_RESOLUTIONS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Sortie en plein air dans un parc national
  Object.assign(
    (rand) => {
      const park = pick(N4_FAMILY_PARKS, rand)
      const act = pick(N4_FAMILY_ACTS, rand)
      const det = pick(N4_FAMILY_DETAILS, rand)
      const othersPark = sample(N4_FAMILY_PARKS.filter((p) => p.opt !== park.opt), 2, rand)
      const othersAct = sample(N4_FAMILY_ACTS.filter((a) => a.short !== act.short), 2, rand)
      const text = `— Samedi passé, nous avons passé une très belle journée en famille ${park.text}. Le matin était ensoleillé et nous avons pu ${act.act}. Les enfants ont beaucoup aimé ${det.text}. C’est vraiment un endroit idéal pour profiter du plein air en toute tranquillité.`
      return {
        text,
        questions: [
          q('Quelle activité de plein air cette famille a-t-elle pratiquée ?', act.short, othersAct[0].short, othersAct[1].short, [act.short.split(' ')[1].toLowerCase()]),
          q('Dans quel cadre naturel cette sortie s’est-elle déroulée ?', park.opt, othersPark[0].opt, othersPark[1].opt, [park.opt.split(' ').pop().toLowerCase()]),
        ],
      }
    },
    { situation: 1, capacity: N4_FAMILY_PARKS.length * N4_FAMILY_ACTS.length * N4_FAMILY_DETAILS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Erreur d'autobus lors de l'arrivée)
  Object.assign(
    (rand) => {
      const item = pick(N4_TRANSIT_MISHAPS, rand)
      const text = `— Lors de ma première semaine au Québec, j’ai vécu une vraie mésaventure en voulant me rendre ${item.dest}. J’ai pris ${item.bus} sans regarder l’affiche. Je me suis retrouvé loin sous la pluie. Heureusement, ${item.help}. Je suis arrivé à destination avec un petit retard mais sain et sauf !`
      return {
        text,
        questions: [
          q('Quelle mésaventure la personne raconte-t-elle sur son trajet ?', item.mishapOpt, 'un bris mécanique de sa voiture personnelle', 'une perte de son billet dans la station de train', [item.busKw]),
          q('Comment la personne a-t-elle finalement trouvé son chemin ?', item.helpOpt, item.otherHelp1, item.otherHelp2, [item.helpKw]),
        ],
      }
    },
    { situation: 0, capacity: N4_TRANSIT_MISHAPS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Cueillette de pommes au verger)
  Object.assign(
    (rand) => {
      const orchard = pick(N4_ORCHARDS, rand)
      const othersOrchard = sample(N4_ORCHARDS.filter((o) => o.snackOpt !== orchard.snackOpt), 2, rand)
      const text = `— La fin de semaine passée, nous sommes allés dans un beau verger ${orchard.region} avec les enfants. Il faisait un soleil radieux d’automne. Nous avons cueilli ${orchard.fruit} pendant plus de deux heures. Avant de partir, nous avons dégusté ${orchard.dessert}. C’était une sortie simple et vraiment agréable pour toute la famille.`
      return {
        text,
        questions: [
          q('Quelle activité de saison la famille a-t-elle pratiquée ?', orchard.fruitOpt, 'une randonnée pédestre sur une montagne', 'une excursion de pêche sur une chaloupe', [orchard.kwFruit]),
          q('Quelle collation ont-ils partagée à la fin de la visite ?', orchard.snackOpt, othersOrchard[0].snackOpt, othersOrchard[1].snackOpt, [orchard.kwSnack]),
        ],
      }
    },
    { situation: 1, capacity: N4_ORCHARDS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Valise envoyée à Halifax par erreur
  {
    situation: 0,
    text: '— Je reviens tout juste de Toronto. Tout allait bien jusqu’à ce que je réalise que ma valise avait été envoyée par erreur à Halifax ! L’agente au comptoir a été très gentille : elle m’a donné une trousse de toilette de secours. Mon sac m’a finalement été livré à mon hôtel vingt-quatre heures plus tard.',
    questions: [
      q('Dans quelle ville le bagage avait-il été acheminé par erreur ?', 'à Halifax au lieu de la destination', 'à Vancouver dans l’Ouest canadien', 'à Winnipeg près des grands lacs', ['halifax']),
      q('Quel dépannage immédiat l’agente a-t-elle fourni au passager ?', 'une trousse de toilette de dépannage', 'un remboursement complet de son billet', 'un bon de repas pour le restaurant voisin', ['trousse de toilette']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Sortie à la cabane à sucre
  {
    situation: 1,
    text: '— On a fait une belle sortie à la cabane à sucre avec les enfants samedi midi. On a mangé un repas traditionnel copieux : soupe aux pois, tourtière et crêpes au sirop d’érable chaud. Ensuite, les petits ont fait une promenade en traîneau dans la forêt enneigée.',
    questions: [
      q('Quel lieu traditionnel la famille a-t-elle visité ?', 'une cabane à sucre en forêt', 'une fromagerie artisanale de ferme', 'une boulangerie de quartier réputée', ['cabane à sucre']),
      q('Quelle activité les enfants ont-ils faite après le repas ?', 'une promenade en traîneau dans le bois', 'un cours de patinage sur l’étang gelé', 'une course en raquettes sur la montagne', ['promenade en traîneau']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-4
// ---------------------------------------------------------------------------
const N4_CONCIERGES = [
  { name: 'madame Tremblay', title: 'la concierge' },
  { name: 'monsieur Gagnon', title: 'le concierge' },
  { name: 'madame Roy', title: 'la concierge' },
  { name: 'monsieur Bouchard', title: 'le concierge' },
]
const N4_LEAK_FLOORS = ['au deuxième niveau', 'au troisième niveau', 'au quatrième niveau', 'au dernier étage']
const N4_LEAK_HOURS = ['dès 8 h demain matin', 'vers 10 h demain matin', 'dès 14 h cet après-midi', 'vers 15 h cet après-midi']
const N4_LEAK_BUNDLES = [
  {
    part: 'd’un tuyau usé sous la baignoire',
    causeOpt: 'du tuyau sous la baignoire du voisin',
    action: 'coupé l’arrivée d’eau locale sans tarder',
    repair: 'un plombier certifié viendra changer la pièce',
    repOpt: 'le remplacement de la pièce par un plombier',
    kwPart: 'baignoire',
    kwRep: 'plombier',
  },
  {
    part: 'du joint du chauffe-eau central',
    causeOpt: 'du joint du chauffe-eau de l’étage',
    action: 'fermé la valve de sécurité du réservoir',
    repair: 'l’artisan qualifié viendra poser un raccord neuf',
    repOpt: 'l’installation d’un raccord neuf par un ouvrier',
    kwPart: 'chauffe-eau',
    kwRep: 'raccord',
  },
  {
    part: 'de la canalisation sous l’évier',
    causeOpt: 'du tuyau sous l’évier du voisin',
    action: 'stoppé l’alimentation principale ce matin',
    repair: 'un technicien de service posera un tuyau neuf',
    repOpt: 'la pose d’un tuyau neuf par le technicien',
    kwPart: 'évier',
    kwRep: 'technicien',
  },
  {
    part: 'd’une valve défectueuse de radiateur',
    causeOpt: 'de la valve du radiateur de l’étage',
    action: 'isolé le circuit de chauffage immédiatement',
    repair: 'un chauffagiste d’urgence viendra réparer le bris',
    repOpt: 'la réparation du bris par un chauffagiste',
    kwPart: 'radiateur',
    kwRep: 'chauffagiste',
  },
]

const N4_RADIO_STATIONS = ['Radio-Circulation', 'Info-Trafic Québec', 'le bulletin matinal', 'la météo et circulation']
const N4_RADIO_HOURS = ['7 h 30', '8 h 15', '16 h 45', '17 h 20']
const N4_RADIO_TIPS = [
  'Soyez prudents sur la route.',
  'Ralentissez dans ce secteur.',
  'Prenez votre mal en patience.',
  'Prévoyez vos déplacements d’avance.',
]
const N4_TRAFFIC_BUNDLES = [
  {
    hwy: 'sur le pont Pierre-Laporte',
    cause: 'une camionnette en panne bloque la voie droite',
    causeOpt: 'le blocage d’une voie par une camionnette',
    delay: 'vingt-cinq minutes de retard',
    delayOpt: 'un décalage d’environ vingt-cinq minutes',
    alt: 'd’emprunter le pont de Québec',
    kwCause: 'camionnette',
    kwDelay: 'vingt-cinq',
  },
  {
    hwy: 'sur l’autoroute 40 vers l’est',
    cause: 'des travaux de voirie occupent deux voies',
    causeOpt: 'un chantier de voirie sur deux voies',
    delay: 'trente minutes de ralentissement',
    delayOpt: 'une attente estimée à trente minutes',
    alt: 'de passer par le boulevard Métropolitain',
    kwCause: 'voirie',
    kwDelay: 'trente',
  },
  {
    hwy: 'sur le pont Samuel-De Champlain',
    cause: 'un accrochage entre deux voitures ralentit la voie',
    causeOpt: 'un accrochage impliquant deux voitures',
    delay: 'vingt minutes d’attente',
    delayOpt: 'un ralentissement de près de vingt minutes',
    alt: 'de prendre le pont Jacques-Cartier',
    kwCause: 'accrochage',
    kwDelay: 'vingt',
  },
  {
    hwy: 'sur l’autoroute 20 à Lévis',
    cause: 'un camion de livraison a perdu des cartons',
    causeOpt: 'la chute de cartons d’un transporteur',
    delay: 'trente-cinq minutes de bouchon',
    delayOpt: 'une perte de trente-cinq minutes environ',
    alt: 'de suivre la route du bord de l’eau',
    kwCause: 'cartons',
    kwDelay: 'trente-cinq',
  },
]

const N4_HEATING_MANAGERS = ['du bureau syndical', 'de la conciergerie', 'du comité de gestion', 'de l’administration locale']
const N4_HEATING_HOURS = ['dès treize heures cet après-midi', 'vers quatorze heures aujourd’hui', 'd’ici la fin de la journée', 'en début d’après-midi']
const N4_HEATING_BUNDLES = [
  {
    cause: 'd’un bris sur la pompe de circulation d’eau',
    causeOpt: 'une défaillance sur la pompe d’eau',
    impact: 'les radiateurs sont restés froids dans tous les appartements',
    repair: 'un réparateur certifié viendra poser une pièce neuve',
    repOpt: 'un réparateur posera une pièce neuve rapidement',
    kwCause: 'pompe',
    kwRep: 'réparateur',
  },
  {
    cause: 'd’une coupure du brûleur principal au sous-sol',
    causeOpt: 'l’arrêt soudain du brûleur de la chaudière',
    impact: 'la température a chuté de quelques degrés dans les logements',
    repair: 'l’équipe d’entretien remplacera le filtre à gaz',
    repOpt: 'l’équipe changera le filtre dans la journée',
    kwCause: 'brûleur',
    kwRep: 'filtre',
  },
  {
    cause: 'd’une panne électrique sur le thermostat central',
    causeOpt: 'un défaut électrique au niveau du thermostat',
    impact: 'la chaudière s’est coupée tout de suite par sécurité',
    repair: 'un électricien qualifié viendra réparer l’installation',
    repOpt: 'un électricien remettra le système en marche',
    kwCause: 'thermostat',
    kwRep: 'électricien',
  },
  {
    cause: 'd’une fuite mineure sur le conduit de vapeur',
    causeOpt: 'un écoulement léger sur la ligne de vapeur',
    impact: 'la pression a diminué dans les étages supérieurs du bâtiment',
    repair: 'un technicien de garde changera le joint d’étanchéité',
    repOpt: 'un technicien remplacera le joint défectueux',
    kwCause: 'vapeur',
    kwRep: 'technicien',
  },
]

const N4_TRANSIT_AGENCIES = ['de la société de transport', 'du réseau métropolitain', 'du service d’autobus et métro', 'du centre de mobilité urbaine']
const N4_TRANSIT_BUNDLES = [
  {
    line: 'la ligne orange du métro',
    cause: 'une panne de signalisation près de la station Berri-UQAM',
    causeOpt: 'un bris de signalisation dans le secteur',
    delay: 'un arrêt de service d’environ trente minutes',
    delayOpt: 'une interruption temporaire d’une demi-heure',
    measure: 'des autobus de relève ont été déployés le long du boulevard',
    measOpt: 'des autobus de relève déployés en surface',
    kwCause: 'signalisation',
    kwMeas: 'autobus',
  },
  {
    line: 'le train de banlieue nord',
    cause: 'un problème d’aiguillage gelé à l’entrée de la gare',
    causeOpt: 'le gel d’un aiguillage près de la gare',
    delay: 'un retard estimé à quarante minutes au terminus',
    delayOpt: 'une quarantaine de minutes de délai au terminus',
    measure: 'les usagers sont invités à monter dans les navettes locales',
    measOpt: 'des navettes d’urgence mises à disposition',
    kwCause: 'aiguillage',
    kwMeas: 'navettes',
  },
  {
    line: 'la ligne verte du métro',
    cause: 'un ennui mécanique sur une rame immobilisée en station',
    causeOpt: 'une défaillance sur une rame en station',
    delay: 'une attente supplémentaire de vingt-cinq minutes',
    delayOpt: 'un allongement de trajet de vingt-cinq minutes',
    measure: 'les techniciens remorquent la rame vers le garage d’urgence',
    measOpt: 'le remorquage rapide vers le garage d’urgence',
    kwCause: 'rame',
    kwMeas: 'garage d’urgence',
  },
  {
    line: 'le circuit d’autobus express',
    cause: 'la fermeture temporaire d’une bretelle d’accès par la police',
    causeOpt: 'une intervention policière fermant l’accès',
    delay: 'un ralentissement de trente-cinq minutes sur le trajet',
    delayOpt: 'un temps additionnel de trente-cinq minutes',
    measure: 'les chauffeurs empruntent une voie de contournement balisée',
    measOpt: 'un détour par des rues secondaires balisées',
    kwCause: 'accès',
    kwMeas: 'balisé',
  },
]

export const N04_L_4 = [
  // Scenario 1 (Template, situation: 0) - Fuite d'eau dans un immeuble résidentiel
  Object.assign(
    (rand) => {
      const conc = pick(N4_CONCIERGES, rand)
      const floor = pick(N4_LEAK_FLOORS, rand)
      const time = pick(N4_LEAK_HOURS, rand)
      const b = pick(N4_LEAK_BUNDLES, rand)
      const others = sample(N4_LEAK_BUNDLES.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `— Bonjour monsieur, c’est ${conc.name}, ${conc.title} de l’immeuble. Je vous appelle pour vous rassurer au sujet de l’eau sur votre plafond. La fuite provient ${b.part} ${floor}. J’ai personnellement ${b.action}. Rassurez-vous, ${b.repair} ${time}. Nous vérifierons ensuite que tout est bien sec.`
      return {
        text,
        questions: [
          q('D’où provient l’écoulement d’eau dans le logement ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwPart]),
          q('Quelle solution est prévue pour réparer la fuite ?', b.repOpt, others[0].repOpt, others[1].repOpt, [b.kwRep]),
        ],
      }
    },
    { situation: 0, capacity: N4_CONCIERGES.length * N4_LEAK_FLOORS.length * N4_LEAK_HOURS.length * N4_LEAK_BUNDLES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Bouchon de circulation routière
  Object.assign(
    (rand) => {
      const station = pick(N4_RADIO_STATIONS, rand)
      const hour = pick(N4_RADIO_HOURS, rand)
      const tip = pick(N4_RADIO_TIPS, rand)
      const b = pick(N4_TRAFFIC_BUNDLES, rand)
      const others = sample(N4_TRAFFIC_BUNDLES.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `— Ici ${station} pour le point de ${hour}. Un bouchon important paralyse les automobilistes ${b.hwy}. La cause : ${b.cause}. Les patrouilleurs dégagent la voie, mais les usagers doivent prévoir ${b.delay}. Si possible, nous vous recommandons ${b.alt}. ${tip}`
      return {
        text,
        questions: [
          q('Quelle est la cause de ce bouchon de circulation ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwCause]),
          q('Quel retard les automobilistes doivent-ils anticiper ?', b.delayOpt, others[0].delayOpt, others[1].delayOpt, [b.kwDelay]),
        ],
      }
    },
    { situation: 1, capacity: N4_RADIO_STATIONS.length * N4_RADIO_HOURS.length * N4_RADIO_TIPS.length * N4_TRAFFIC_BUNDLES.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Panne de chauffage dans l'immeuble)
  Object.assign(
    (rand) => {
      const mgr = pick(N4_HEATING_MANAGERS, rand)
      const hour = pick(N4_HEATING_HOURS, rand)
      const b = pick(N4_HEATING_BUNDLES, rand)
      const others = sample(N4_HEATING_BUNDLES.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `— Bonjour chers résidents, ici un message ${mgr}. Le chauffage central s’est arrêté ce matin en raison ${b.cause}. En conséquence, ${b.impact}. Notre fournisseur a été avisé et ${b.repair} ${hour}. Nous nous excusons pour ce désagrément temporaire.`
      return {
        text,
        questions: [
          q('Quelle est la cause de l’arrêt du chauffage central ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwCause]),
          q('Quelle réparation est prévue pour rétablir la chaleur ?', b.repOpt, others[0].repOpt, others[1].repOpt, [b.kwRep]),
        ],
      }
    },
    { situation: 0, capacity: N4_HEATING_MANAGERS.length * N4_HEATING_HOURS.length * N4_HEATING_BUNDLES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Perturbation de transport collectif)
  Object.assign(
    (rand) => {
      const agency = pick(N4_TRANSIT_AGENCIES, rand)
      const b = pick(N4_TRANSIT_BUNDLES, rand)
      const others = sample(N4_TRANSIT_BUNDLES.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `— Avis aux usagers ${agency}. Une perturbation majeure touche actuellement ${b.line}. Cet incident découle ${de(b.cause)}. Les voyageurs doivent composer avec ${b.delay}. Pour faciliter vos déplacements, ${b.measure}. Nous vous remercions pour votre patience.`
      return {
        text,
        questions: [
          q('Quelle est la cause de ce retard de transport collectif ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwCause]),
          q('Quelle mesure d’aide a été déployée pour les usagers ?', b.measOpt, others[0].measOpt, others[1].measOpt, [b.kwMeas]),
        ],
      }
    },
    { situation: 1, capacity: N4_TRANSIT_AGENCIES.length * N4_TRANSIT_BUNDLES.length }
  ),
  // Scenario 5 (Static, situation: 0) - Fuite d'eau à la conciergerie
  {
    situation: 0,
    text: '— Allô, c’est Robert, le concierge de l’immeuble. Pour la fuite dans l’entrée commune, le plombier a découvert qu’un raccord sous l’évier de la conciergerie avait cédé sous la pression. L’eau a coulé dans le plafond. Le robinet d’isolement a été fermé et la tuyauterie sera remplacée dès 14 h cet après-midi.',
    questions: [
      q('Quelle pièce défectueuse a causé la fuite d’eau ?', 'un raccord sous l’évier de la conciergerie', 'une conduite percée dans la cave commune', 'un robinet d’arrosage dans la cour externe', ['raccord']),
      q('Quand la tuyauterie brisée sera-t-elle changée ?', 'en milieu d’après-midi par le réparateur', 'dans trois semaines après les vérifications', 'au début du mois prochain avec l’artisan', ['après-midi']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Pont de Québec et chargement perdu
  {
    situation: 1,
    text: '— Chronique routière de 8 h 15. La circulation est ralentie sur le pont de Québec en direction nord. Une perte de chargement de planches de bois encombre deux voies sur trois depuis vingt minutes. Les patrouilleurs nettoient la chaussée, mais prévoyez quarante minutes de retard pour votre trajet.',
    questions: [
      q('Quel obstacle imprévu encombre les voies sur le pont ?', 'des planches de bois tombées d’un chargement', 'un camion de transport en panne de batterie', 'un panneau de signalisation plié par le vent', ['planches']),
      q('Combien de voies sont actuellement bloquées sur l’axe ?', 'deux voies de circulation sur trois', 'toutes les voies rapides du viaduc', 'une seule voie réservée aux autobus', ['deux voies']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-5
// ---------------------------------------------------------------------------
const N4_VOICEMAIL_DIGITS = ['la touche 1', 'le chiffre 2', 'la touche 8', 'le numéro 5']
const N4_VOICEMAIL_PASSWORDS = [
  { text: 'définis un code secret à quatre chiffres', opt: 'définir un code secret personnel', kw: 'code' },
  { text: 'entre un mot de passe temporaire à six chiffres', opt: 'entrer un mot de passe temporaire', kw: 'mot de passe' },
  { text: 'choisis une combinaison confidentielle de chiffres', opt: 'choisir une combinaison chiffrée', kw: 'combinaison' },
  { text: 'compose ton nouveau code d’accès personnel', opt: 'composer son nouveau code d’accès', kw: 'code' },
]
const N4_VOICEMAIL_FALSE_STEPS = [
  'rappeler immédiatement son dernier correspondant',
  'effacer sans écouter tous les anciens messages',
  'désactiver la sonnerie d’appel du téléphone',
  'transférer l’appel vers une boîte vocale externe',
]
const N4_VOICEMAIL_GREETINGS = [
  'enregistre ton message d’accueil après le bip',
  'dicte ton prénom et ton nom au microphone',
  'lis ton annonce personnalisée dans le combiné',
  'énonce tes heures de disponibilité après la tonalité',
]
const N4_VOICEMAIL_FINISHES = [
  { text: 'la touche dièse', opt: 'appuyer sur la touche dièse', kw: 'dièse' },
  { text: 'la touche étoile', opt: 'appuyer sur la touche étoile', kw: 'étoile' },
  { text: 'le chiffre 9', opt: 'appuyer sur le chiffre neuf', kw: 'chiffre' },
  { text: 'la touche carré', opt: 'appuyer sur la touche carré', kw: 'carré' },
  { text: 'la touche zéro', opt: 'appuyer sur la touche zéro', kw: 'zéro' },
]

const N4_GPS_PLACES = [
  { name: 'l’aréna municipal', opt: 'vers l’aréna municipal', kw: 'aréna' },
  { name: 'le centre récréatif', opt: 'vers le centre récréatif', kw: 'récréatif' },
  { name: 'le complexe aquatique', opt: 'vers le complexe aquatique', kw: 'aquatique' },
  { name: 'la bibliothèque municipale', opt: 'vers la bibliothèque municipale', kw: 'bibliothèque' },
  { name: 'la maison de quartier', opt: 'vers la maison de quartier', kw: 'quartier' },
]
const N4_GPS_DISTS = ['trois cents mètres', 'cinq cents mètres', 'quatre cents mètres', 'six cents mètres']
const N4_GPS_STREETS = ['le boulevard Laurier', 'l’avenue Royale', 'le chemin Sainte-Foy', 'la route de l’Église']
const N4_GPS_TURNS = [
  { text: 'tournez à droite sur la rue des Érables', opt: 'tourner à droite sur les Érables', kw: 'droite' },
  { text: 'tournez à gauche sur la rue Principale', opt: 'tourner à gauche sur la Principale', kw: 'gauche' },
  { text: 'prenez la deuxième sortie au rond-point', opt: 'sortir à la deuxième sortie du rond-point', kw: 'rond-point' },
  { text: 'serrez à droite avant le grand viaduc', opt: 'serrer à droite avant le viaduc', kw: 'viaduc' },
]
const N4_GPS_FINALS = ['un kilomètre sur votre gauche', 'deux kilomètres sur votre droite', 'cinq cents mètres devant le parc', 'huit cents mètres sur votre gauche']

const N4_CLOSING_ROOMS = ['du bureau de consultation', 'du centre de documentation', 'de la clinique médicale', 'de l’atelier communautaire']
const N4_CLOSING_STEPS = [
  { text: 'fermer les fenêtres et éteindre les écrans', opt: 'fermer les fenêtres et les écrans', kw: 'fenêtres' },
  { text: 'ranger les dossiers et fermer les stores', opt: 'ranger les dossiers et fermer les stores', kw: 'stores' },
  { text: 'verrouiller les armoires et éteindre les feux', opt: 'verrouiller les armoires du bureau', kw: 'armoires' },
  { text: 'débrancher les outils et ranger les établis', opt: 'débrancher tous les outils de travail', kw: 'outils' },
]
const N4_CLOSING_CODES = ['le code 4521', 'le code 7832', 'le code 3194', 'le code 6052']
const N4_CLOSING_FINALS = [
  { text: 'verrouillez la porte d’entrée avec la clé noire', opt: 'verrouiller la porte avec la clé noire', kw: 'clé' },
  { text: 'barrez la porte arrière avec le cadenas bleu', opt: 'barrer la porte avec le cadenas bleu', kw: 'cadenas' },
  { text: 'fermez la grille de sécurité devant l’entrée', opt: 'fermer la grille métallique de sécurité', kw: 'grille' },
  { text: 'tournez la poignée à double tour avant de partir', opt: 'verrouiller la serrure à double tour', kw: 'double tour' },
]

const N4_TRANSIT_DESTS = [
  { name: 'au centre commercial régional', opt: 'vers le grand centre commercial' },
  { name: 'à l’hôpital général du quartier', opt: 'vers l’hôpital du quartier' },
  { name: 'au centre sportif de la ville', opt: 'vers le centre sportif urbain' },
  { name: 'au grand parc de la nature', opt: 'vers le grand parc naturel' },
]
const N4_TRANSIT_BUSES = [
  { bus: 'l’autobus 80 à l’arrêt du coin', opt: 'l’autobus 80 à l’arrêt du coin', kw: '80' },
  { bus: 'la ligne 165 devant la pharmacie', opt: 'la ligne 165 devant la pharmacie', kw: '165' },
  { bus: 'l’autobus 24 sur la rue Sherbrooke', opt: 'l’autobus 24 sur Sherbrooke', kw: '24' },
  { bus: 'l’autobus 55 vers le nord', opt: 'l’autobus 55 en direction nord', kw: '55' },
]
const N4_TRANSIT_TRANSFERS = ['la station Jean-Talon', 'la station Côte-des-Neiges', 'la station Papineau', 'la station Henri-Bourassa']
const N4_TRANSIT_LINES_SUB = ['la ligne orange du métro', 'la ligne bleue du métro', 'la ligne verte du métro', 'la ligne jaune du métro']
const N4_TRANSIT_EXITS = [
  { text: 'à la station Crémazie', opt: 'descendre à Crémazie', kw: 'crémazie' },
  { text: 'à la station Université', opt: 'descendre à Université', kw: 'université' },
  { text: 'à la station Pie-IX', opt: 'descendre à la station Pie-IX', kw: 'pie-ix' },
  { text: 'au terminus de la Gouin', opt: 'descendre au terminus Gouin', kw: 'gouin' },
]

export const N04_L_5 = [
  // Scenario 1 (Template, situation: 0) - Configuration de la boîte vocale d'un cellulaire
  Object.assign(
    (rand) => {
      const digit = pick(N4_VOICEMAIL_DIGITS, rand)
      const pass = pick(N4_VOICEMAIL_PASSWORDS, rand)
      const greet = pick(N4_VOICEMAIL_GREETINGS, rand)
      const fin = pick(N4_VOICEMAIL_FINISHES, rand)
      const othersPass = sample(N4_VOICEMAIL_FALSE_STEPS, 2, rand)
      const isPound = fin.kw === 'dièse' || fin.kw === 'carré'
      const keepPound = pick(['carré', 'dièse'], rand)
      const candidateFin = N4_VOICEMAIL_FINISHES.filter((f) => {
        if (f.opt === fin.opt) return false
        if (isPound && (f.kw === 'dièse' || f.kw === 'carré')) return false
        if (!isPound && (f.kw === 'dièse' || f.kw === 'carré') && f.kw !== keepPound) return false
        return true
      })
      const othersFin = sample(candidateFin, 2, rand)
      const text = `— Pour activer et personnaliser la messagerie vocale de ton cellulaire, voici la méthode. D’abord, appuie longuement sur ${digit} sur le pavé d’appel. Lorsque la voix automatique te le demande, ${pass.text}. Ensuite, ${greet}. Pour terminer la configuration, appuie sur ${fin.text}. Ton profil sera prêt.`
      const qFin = q('Sur quelle touche faut-il appuyer pour enregistrer la configuration ?', fin.opt, othersFin[0].opt, othersFin[1].opt, [fin.kw])
      qFin.sameAs = ['carré', 'dièse']
      return {
        text,
        questions: [
          q('Quelle étape doit être effectuée après l’invite vocale ?', pass.opt, othersPass[0], othersPass[1], [pass.kw]),
          qFin,
        ],
      }
    },
    { situation: 0, capacity: N4_VOICEMAIL_DIGITS.length * N4_VOICEMAIL_PASSWORDS.length * N4_VOICEMAIL_GREETINGS.length * N4_VOICEMAIL_FINISHES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Instructions de guidage GPS vers un lieu
  Object.assign(
    (rand) => {
      const place = pick(N4_GPS_PLACES, rand)
      const dist = pick(N4_GPS_DISTS, rand)
      const street = pick(N4_GPS_STREETS, rand)
      const turn = pick(N4_GPS_TURNS, rand)
      const finDist = pick(N4_GPS_FINALS, rand)
      const othersPlace = sample(N4_GPS_PLACES.filter((p) => p.opt !== place.opt), 2, rand)
      const othersTurn = sample(N4_GPS_TURNS.filter((t) => t.opt !== turn.opt), 2, rand)
      const text = `— Instructions de navigation routière. Dans ${dist}, quittez la route principale et prenez ${street}. Au prochain carrefour avec feux, ${turn.text}. Poursuivez tout droit sur ${finDist}. Votre destination, ${place.name}, sera bien visible avec son stationnement public gratuit.`
      return {
        text,
        questions: [
          q('Vers quel endroit le système GPS guide-t-il l’automobiliste ?', place.opt, othersPlace[0].opt, othersPlace[1].opt, [place.kw]),
          q('Quelle manœuvre routière est ordonnée au carrefour ?', turn.opt, othersTurn[0].opt, othersTurn[1].opt, [turn.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_GPS_PLACES.length * N4_GPS_DISTS.length * N4_GPS_STREETS.length * N4_GPS_TURNS.length * N4_GPS_FINALS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Consignes de fermeture du lieu de travail)
  Object.assign(
    (rand) => {
      const room = pick(N4_CLOSING_ROOMS, rand)
      const step1 = pick(N4_CLOSING_STEPS, rand)
      const code = pick(N4_CLOSING_CODES, rand)
      const stepFinal = pick(N4_CLOSING_FINALS, rand)
      const othersStep1 = sample(N4_CLOSING_STEPS.filter((s) => s.opt !== step1.opt), 2, rand)
      const othersFinal = sample(N4_CLOSING_FINALS.filter((f) => f.opt !== stepFinal.opt), 2, rand)
      const text = `— Voici la marche à suivre pour la fermeture ${room} ce soir. Tout d’abord, il faut ${step1.text}. Ensuite, composez ${code} sur le panneau mural. Enfin, ${stepFinal.text}. Assurez-vous que les serrures sont bien enclenchées avant votre départ.`
      return {
        text,
        questions: [
          q('Quelle est la première étape à faire avant de quitter les lieux ?', step1.opt, othersStep1[0].opt, othersStep1[1].opt, [step1.kw]),
          q('Quelle dernière consigne permet de clore l’accès pour la nuit ?', stepFinal.opt, othersFinal[0].opt, othersFinal[1].opt, [stepFinal.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_CLOSING_ROOMS.length * N4_CLOSING_STEPS.length * N4_CLOSING_CODES.length * N4_CLOSING_FINALS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Itinéraire en transport en commun)
  Object.assign(
    (rand) => {
      const dest = pick(N4_TRANSIT_DESTS, rand)
      const bus = pick(N4_TRANSIT_BUSES, rand)
      const transfer = pick(N4_TRANSIT_TRANSFERS, rand)
      const sub = pick(N4_TRANSIT_LINES_SUB, rand)
      const exit = pick(N4_TRANSIT_EXITS, rand)
      const othersBus = sample(N4_TRANSIT_BUSES.filter((b) => b.opt !== bus.opt), 2, rand)
      const othersExit = sample(N4_TRANSIT_EXITS.filter((e) => e.opt !== exit.opt), 2, rand)
      const text = `— Pour te rendre ${dest.name} en transport en commun, c’est très simple. Prends ${bus.bus}. Descends à ${transfer}, puis prends ${sub}. Sors du train ${exit.text} et marche deux minutes. Le bâtiment se trouvera juste en face de la sortie.`
      return {
        text,
        questions: [
          q('Quel moyen de transport faut-il prendre pour débuter le trajet ?', bus.opt, othersBus[0].opt, othersBus[1].opt, [bus.kw]),
          q('À quel arrêt précis le voyageur doit-il descendre du train ?', exit.opt, othersExit[0].opt, othersExit[1].opt, [exit.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_TRANSIT_DESTS.length * N4_TRANSIT_BUSES.length * N4_TRANSIT_TRANSFERS.length * N4_TRANSIT_LINES_SUB.length * N4_TRANSIT_EXITS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Écoute des messages vocaux de l'extérieur
  {
    situation: 0,
    text: '— Pour écouter tes nouveaux messages vocaux de l’extérieur, compose d’abord ton propre numéro de cellulaire. Pendant la sonnerie, appuie sur la touche étoile, puis saisis ton mot de passe confidentiel à quatre chiffres. Choisis l’option 1 pour réécouter le message ou l’option 3 pour l’effacer.',
    questions: [
      q('Quelle touche faut-il presser pendant la sonnerie pour se connecter ?', 'la touche étoile pendant la sonnerie', 'le bouton de volume sur le combiné', 'la touche zéro pendant dix secondes', ['étoile']),
      q('Quelle option permet de supprimer définitivement un message ?', 'l’option 3 pour effacer le message', 'l’option 9 pour le transférer ailleurs', 'l’option 7 pour le sauvegarder au profil', ['effacer']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Rampe d'accès et pont Champlain vers l'aréna
  {
    situation: 1,
    text: '— Guidage GPS : dans deux cents mètres, serrez à droite pour prendre la rampe vers le pont Champlain. Restez dans la voie de droite sur un kilomètre, puis prenez la première sortie vers le boulevard René-Lévesque. L’aréna se trouvera sur votre gauche après le feu.',
    questions: [
      q('Quelle rampe d’accès le système indique-t-il d’emprunter ?', 'la rampe d’accès vers le pont Champlain', 'l’entrée vers l’autoroute des Laurentides', 'la sortie menant à la route des Rivières', ['champlain']),
      q('De quel côté l’aréna apparaîtra-t-il après le carrefour ?', 'l’aréna apparaîtra sur votre gauche', 'l’édifice se situera sur votre droite', 'le complexe sera tout droit en arrière', ['gauche']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-6
// ---------------------------------------------------------------------------
const N4_OUTDOOR_BUNDLES = [
  {
    act: 'la descente en kayak sur la rivière',
    short: 'le kayak sur la rivière en été',
    reason: 'le calme de l’eau au matin',
    reasonOpt: 'le calme apaisant au bord de l’eau',
    dis: 'le vélo sur des sentiers de boue',
    kwAct: 'kayak',
    kwReason: 'calme',
  },
  {
    act: 'la randonnée en raquettes dans la forêt',
    short: 'les raquettes dans les sous-bois',
    reason: 'le silence reposant sous les sapins',
    reasonOpt: 'le silence reposant dans les bois',
    dis: 'le patinage sur patinoire bondée',
    kwAct: 'raquettes',
    kwReason: 'silence',
  },
  {
    act: 'le ski de fond dans les sentiers balisés',
    short: 'le ski de fond sur sentier balisé',
    reason: 'l’exercice physique stimulant à l’air pur',
    reasonOpt: 'l’exercice physique en plein air',
    dis: 'la glissade sur pente encombrée',
    kwAct: 'ski',
    kwReason: 'exercice',
  },
  {
    act: 'le canot sur le lac au coucher du soleil',
    short: 'le canot sur le lac en fin de jour',
    reason: 'la beauté des reflets sur l’eau',
    reasonOpt: 'la beauté des reflets sur le lac',
    dis: 'la baignade dans une eau trop froide',
    kwAct: 'canot',
    kwReason: 'reflets',
  },
]
const N4_OUTDOOR_TIMES = ['ce samedi matin', 'dimanche prochain', 'la fin de semaine prochaine', 'samedi après-midi', 'dimanche dès l’aube']

const N4_BISTRO_PLACES = [
  { name: 'au bistro Chez Boulay sur la rue Saint-Jean', opt: 'le bistro Chez Boulay du quartier', kw: 'boulay' },
  { name: 'au restaurant Le Cartet dans le Vieux-Montréal', opt: 'le restaurant Le Cartet au centre', kw: 'cartet' },
  { name: 'à la brasserie Archibald à Sainte-Foy', opt: 'l’établissement Archibald à Sainte-Foy', kw: 'archibald' },
  { name: 'au café Maguire sur la promenade Maguire', opt: 'le café Maguire sur la promenade', kw: 'maguire' },
]
const N4_BISTRO_FOODS = [
  'des plats du terroir et des soupes chaudes',
  'des brunchs copieux et des salades fraîches',
  'des pizzas au four à bois et des burgers',
  'des sandwichs artisanaux et de bons cafés',
]
const N4_BISTRO_VIBES = [
  { text: 'l’accueil très chaleureux du personnel', opt: 'l’accueil chaleureux du personnel', kw: 'personnel' },
  { text: 'l’ambiance conviviale et lumineuse', opt: 'l’ambiance conviviale et lumineuse', kw: 'conviviale' },
  { text: 'la musique acoustique entraînante', opt: 'la musique acoustique entraînante', kw: 'musique' },
  { text: 'le décor en bois chaleureux et reposant', opt: 'le décor en bois chaud et reposant', kw: 'bois' },
]
const N4_BISTRO_PRICES = [
  'tout à fait raisonnable pour le menu',
  'très économique pour un groupe d’amis',
  'vraiment honnête pour de belles portions',
  'très abordable pour un dîner complet',
]

const N4_CLOTHING_BUNDLES = [
  {
    item: 'un manteau long en duvet d’hiver',
    opt: 'un grand manteau d’hiver en duvet',
    reason: 'il protège beaucoup mieux du grand froid',
    reasonOpt: 'une protection supérieure au grand froid',
    color: 'en bleu marin avec de grandes poches',
    dis: 'une veste courte sans capuchon',
    kwItem: 'manteau',
    kwReason: 'froid',
  },
  {
    item: 'des bottes chaudes avec semelles solides',
    opt: 'des bottes chaudes antidérapantes',
    reason: 'elles empêchent de glisser sur la glace',
    reasonOpt: 'une bonne adhérence sur la glace vive',
    color: 'en cuir noir de qualité imperméable',
    dis: 'des souliers légers de marche urbaine',
    kwItem: 'bottes',
    kwReason: 'glace',
  },
  {
    item: 'une tuque doublée en laine polaire',
    opt: 'une tuque chaude doublée en polaire',
    reason: 'elle garde les oreilles bien au chaud',
    reasonOpt: 'garder les oreilles bien au chaud',
    color: 'de couleur vert forêt et bien épaisse',
    dis: 'une casquette de sport ordinaire',
    kwItem: 'tuque',
    kwReason: 'oreilles',
  },
  {
    item: 'des gants de cuir avec doublure thermique',
    opt: 'des gants de cuir à doublure chaude',
    reason: 'ils permettent de conduire confortablement',
    reasonOpt: 'conduire sa voiture confortablement',
    color: 'en cuir brun foncé très souple',
    dis: 'des mitaines en laine tricotée',
    kwItem: 'gants',
    kwReason: 'conduire',
  },
  {
    item: 'un foulard épais en laine mérinos',
    opt: 'un foulard chaud en laine mérinos',
    reason: 'il coupe efficacement le vent d’hiver',
    reasonOpt: 'couper le vent froid sur le cou',
    color: 'de teinte grise à carreaux discrets',
    dis: 'un cache-col en tissu trop mince',
    kwItem: 'foulard',
    kwReason: 'vent',
  },
]
const N4_SHOPPING_DAYS = ['ce samedi matin', 'dimanche après-midi', 'vendredi soir', 'ce jeudi midi', 'samedi après-midi']

const N4_CULTURE_BUNDLES = [
  {
    show: 'une comédie québécoise au cinéma local',
    showOpt: 'une comédie québécoise au cinéma',
    high: 'le jeu drôle et touchant des comédiens',
    highOpt: 'le jeu drôle et touchant des acteurs',
    sound: 'les rires chaleureux dans toute la salle',
    kwShow: 'comédie',
    kwHigh: 'touchant',
  },
  {
    show: 'un documentaire sur les parcs du grand nord',
    showOpt: 'un documentaire sur les parcs du nord',
    high: 'la beauté spectaculaire des images de forêt',
    highOpt: 'les superbes images de la nature',
    sound: 'les explications passionnantes de la narratrice',
    kwShow: 'documentaire',
    kwHigh: 'images',
  },
  {
    show: 'un film d’aventure pour toute la famille',
    showOpt: 'un film d’aventure pour la famille',
    high: 'l’intrigue palpitante pleine de surprises',
    highOpt: 'une intrigue dynamique et surprenante',
    sound: 'les réactions enthousiastes des spectateurs',
    kwShow: 'aventure',
    kwHigh: 'intrigue',
  },
  {
    show: 'un spectacle d’humour au festival d’été',
    showOpt: 'un spectacle d’humour au festival',
    high: 'la fraîcheur des anecdotes sur le quotidien',
    highOpt: 'des anecdotes drôles sur le quotidien',
    sound: 'les applaudissements nourris à la fin de la soirée',
    kwShow: 'humour',
    kwHigh: 'anecdotes',
  },
]
const N4_MOVIE_DAYS = ['Vendredi passé', 'Samedi dernier', 'Hier soir', 'La semaine dernière']
const N4_CULTURE_COMPANIONS = ['avec des proches', 'avec des collègues', 'en famille', 'avec quelques amis']

export const N04_L_6 = [
  // Scenario 1 (Template, situation: 0) - Préférences pour les activités de plein air
  Object.assign(
    (rand) => {
      const b = pick(N4_OUTDOOR_BUNDLES, rand)
      const time = pick(N4_OUTDOOR_TIMES, rand)
      const others = sample(N4_OUTDOOR_BUNDLES.filter((x) => x.short !== b.short), 2, rand)
      const text = `— Tu sais, pour notre sortie de fin de semaine en nature, j’aime beaucoup mieux ${b.act}. Plusieurs amis aiment ${b.dis}, mais moi je recherche avant tout ${b.reason}. Si tu es partant pour qu’on parte ${time}, on pourrait louer notre équipement ce soir.`
      return {
        text,
        questions: [
          q('Quelle activité de loisir la personne préfère-t-elle ?', b.short, others[0].short, others[1].short, [b.kwAct]),
          q('Pourquoi cette activité a-t-elle sa nette préférence ?', b.reasonOpt, others[0].reasonOpt, others[1].reasonOpt, [b.kwReason]),
        ],
      }
    },
    { situation: 0, capacity: N4_OUTDOOR_BUNDLES.length * N4_OUTDOOR_TIMES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Appréciation positive d'un restaurant local
  Object.assign(
    (rand) => {
      const b = pick(N4_BISTRO_PLACES, rand)
      const food = pick(N4_BISTRO_FOODS, rand)
      const vibe = pick(N4_BISTRO_VIBES, rand)
      const price = pick(N4_BISTRO_PRICES, rand)
      const othersPlace = sample(N4_BISTRO_PLACES.filter((p) => p.opt !== b.opt), 2, rand)
      const othersVibe = sample(N4_BISTRO_VIBES.filter((v) => v.opt !== vibe.opt), 2, rand)
      const text = `— Hier midi, j’ai enfin dîné avec des collègues ${b.name}. Nous avons passé un très bon moment ! Le menu met en valeur ${food}. J’ai particulièrement apprécié ${vibe.text}. En plus, le montant de l’addition était ${price}. Je te conseille d’y faire un tour.`
      return {
        text,
        questions: [
          q('Quel établissement de restauration la personne a-t-elle essayé ?', b.opt, othersPlace[0].opt, othersPlace[1].opt, [b.kw]),
          q('Quel point fort du restaurant est particulièrement souligné ?', vibe.opt, othersVibe[0].opt, othersVibe[1].opt, [vibe.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_BISTRO_PLACES.length * N4_BISTRO_FOODS.length * N4_BISTRO_VIBES.length * N4_BISTRO_PRICES.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Préférences pour un vêtement d'hiver)
  Object.assign(
    (rand) => {
      const b = pick(N4_CLOTHING_BUNDLES, rand)
      const day = pick(N4_SHOPPING_DAYS, rand)
      const others = sample(N4_CLOTHING_BUNDLES.filter((i) => i.opt !== b.opt), 2, rand)
      const text = `— Pour cet hiver, mon choix s’arrête sur ${b.item}. C’est certain que d’autres préfèrent ${b.dis}, mais je préfère mon modèle parce qu’${b.reason}. J’aimerais trouver un article ${b.color}. On pourrait aller voir au centre commercial ${day}.`
      return {
        text,
        questions: [
          q('Quel vêtement d’hiver la personne préfère-t-elle se procurer ?', b.opt, others[0].opt, others[1].opt, [b.kwItem]),
          q('Pour quel motif pratique la personne choisit-elle ce vêtement ?', b.reasonOpt, others[0].reasonOpt, others[1].reasonOpt, [b.kwReason]),
        ],
      }
    },
    { situation: 0, capacity: N4_CLOTHING_BUNDLES.length * N4_SHOPPING_DAYS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Appréciation d'une sortie culturelle)
  Object.assign(
    (rand) => {
      const b = pick(N4_CULTURE_BUNDLES, rand)
      const day = pick(N4_MOVIE_DAYS, rand)
      const comp = pick(N4_CULTURE_COMPANIONS, rand)
      const others = sample(N4_CULTURE_BUNDLES.filter((s) => s.showOpt !== b.showOpt), 2, rand)
      const text = `— ${day}, nous sommes allés voir ${b.show}. Nous avons beaucoup apprécié cette représentation ! Ce qui nous a le plus plu, c’est ${b.high}. Dans la salle, on entendait ${b.sound}. Je te recommande chaleureusement d’y assister ${comp}.`
      return {
        text,
        questions: [
          q('Quelle sortie culturelle la personne a-t-elle particulièrement aimée ?', b.showOpt, others[0].showOpt, others[1].showOpt, [b.kwShow]),
          q('Quel aspect du spectacle a retenu l’attention des spectateurs ?', b.highOpt, others[0].highOpt, others[1].highOpt, [b.kwHigh]),
        ],
      }
    },
    { situation: 1, capacity: N4_CULTURE_BUNDLES.length * N4_MOVIE_DAYS.length * N4_CULTURE_COMPANIONS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Camping sauvage au bord du lac vs hôtel bondé
  {
    situation: 0,
    text: '— Pour les vacances d’été en famille, je préfère le camping sous la tente au bord d’un lac calme plutôt qu’un hôtel bondé en ville. Ce que j’aime le plus, c’est le feu de camp le soir sous les étoiles et la baignade matinale. La routine est bruyante toute l’année, j’ai besoin d’air frais.',
    questions: [
      q('Quel genre de vacances la personne privilégie-t-elle en été ?', 'dormir sous la tente au bord du lac', 'loger dans un grand complexe hôtelier', 'séjourner dans un appartement très animé', ['tente']),
      q('Qu’apprécie-t-elle tout spécialement lors de ce séjour ?', 'la baignade au réveil et le feu de camp', 'la climatisation et la télévision moderne', 'les galeries marchandes et les boutiques', ['baignade']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Crêperie bretonne de la rue Saint-Denis
  {
    situation: 1,
    text: '— J’ai dîné à la nouvelle crêperie de la rue Saint-Denis hier midi avec ma cousine. Les galettes de sarrasin sont croustillantes et généreusement garnies de fromage et de jambon de chez nous. Le cidre local est excellent et la serveuse a été très gentille. Une bonne adresse à découvrir !',
    questions: [
      q('Quelle spécialité culinaire est appréciée dans ce restaurant ?', 'des galettes de sarrasin bien garnies', 'des soupes de légumes servies froides', 'des sandwichs au pain blanc réchauffés', ['galettes']),
      q('Quelle appréciation est formulée au sujet du service ?', 'une serveuse souriante et très gentille', 'une équipe de serveurs distante et froide', 'un personnel débordé par la forte affluence', ['serveuse']),
    ],
  },
]

// ===========================================================================
// NIVEAU 4 READING SCENARIOS
// ===========================================================================

// ---------------------------------------------------------------------------
// n4-reading-0
// ---------------------------------------------------------------------------
const N4_LEASE_ADDRS = [
  '450, rue Cartier, appartement 3',
  '1280, avenue Maguire, logement 2',
  '725, rue Saint-Jean, appartement 4',
  '310, boulevard Charest Est, unité 5',
  '520, 3e Avenue, appartement 1',
]
const N4_LEASE_RENTS = ['1 120 dollars', '1 350 dollars', '980 dollars', '1 240 dollars']
const N4_LEASE_PERIODS = [
  { text: 'du premier juillet au trente juin', opt: 'une année complète à partir de juillet', kw: 'juillet' },
  { text: 'du premier août au trente et un juillet', opt: 'une année complète à compter d’août', kw: 'août' },
  { text: 'du premier septembre au trente et un août', opt: 'un an complet à partir de septembre', kw: 'septembre' },
  { text: 'du premier octobre au trente septembre', opt: 'un an complet à compter d’octobre', kw: 'octobre' },
]
const N4_LEASE_HEATS = [
  { text: 'à la charge du locataire', opt: 'aux frais directs du locataire' },
  { text: 'inclus dans le montant du loyer', opt: 'compris dans le montant du loyer' },
  { text: 'non compris dans la mensualité', opt: 'non inclus dans la mensualité' },
  { text: 'assuré par un système central inclus', opt: 'fourni par le système central' },
]
const N4_LEASE_PETS = [
  { text: 'les chats calmes sont acceptés', opt: 'les chats calmes sont permis' },
  { text: 'aucun animal domestique n’est permis', opt: 'aucun animal n’est autorisé' },
  { text: 'un petit chien de moins de dix kilos est toléré', opt: 'les petits chiens sont tolérés' },
  { text: 'seuls les animaux en cage sont admis', opt: 'les animaux en cage sont admis' },
]

const N4_FESTIVAL_NAMES = [
  { name: 'le Festival d’été de Québec', opt: 'le grand Festival d’été de Québec', kw: 'québec' },
  { name: 'les Francos de Montréal', opt: 'les Francos de Montréal', kw: 'francos' },
  { name: 'le FestiVoix de Trois-Rivières', opt: 'le FestiVoix de Trois-Rivières', kw: 'festivoix' },
  { name: 'le Festival de jazz de Montréal', opt: 'le grand Festival de jazz de Montréal', kw: 'jazz' },
]
const N4_FESTIVAL_CROWDS = [
  { text: 'un total de cent mille festivaliers', opt: 'exactement cent mille festivaliers', kw: 'cent mille' },
  { text: 'un total de quatre-vingt mille festivaliers', opt: 'exactement quatre-vingt mille personnes', kw: 'quatre-vingt mille' },
  { text: 'un total de soixante mille festivaliers', opt: 'exactement soixante mille festivaliers', kw: 'soixante mille' },
  { text: 'un total de quarante-cinq mille festivaliers', opt: 'exactement quarante-cinq mille personnes', kw: 'quarante-cinq mille' },
]
const N4_FESTIVAL_DAYS = ['dix jours de festivités en ville', 'huit journées de spectacles dehors', 'neuf soirs de concerts sur le fleuve', 'cinq jours d’activités familiales']
const N4_FESTIVAL_HIGHS = [
  'la grande diversité des artistes d’ici',
  'la gratuité de plusieurs scènes publiques',
  'l’ambiance chaleureuse au bord de l’eau',
  'la haute qualité des prestations musicales',
]

const N4_DIRECT_DEPOSIT_DEPTS = ['au service de la paie', 'à la direction des ressources humaines', 'au bureau de la comptabilité générale', 'au secrétariat des avantages sociaux']
const N4_DIRECT_DEPOSIT_DOCS = [
  { text: 'un spécimen de chèque de votre compte', opt: 'un spécimen de chèque bancaire', kw: 'chèque' },
  { text: 'un document de confirmation bancaire officiel', opt: 'une confirmation bancaire officielle', kw: 'confirmation' },
  { text: 'un formulaire de prélèvement avec signature', opt: 'un formulaire bancaire signé', kw: 'formulaire' },
  { text: 'une attestation de dépôt fournie par la caisse', opt: 'une attestation de compte bancaire', kw: 'attestation' },
]
const N4_DIRECT_DEPOSIT_DELAYS = [
  { text: 'deux jours ouvrables après la réception', opt: 'deux jours ouvrables de traitement', kw: 'deux jours' },
  { text: 'cinq jours ouvrables suivant l’envoi', opt: 'cinq jours ouvrables après envoi', kw: 'cinq jours' },
  { text: 'trois semaines complètes après la demande', opt: 'trois semaines complètes de délai', kw: 'trois semaines' },
  { text: 'un mois entier pour le traitement', opt: 'un mois entier de traitement', kw: 'un mois' },
]
const N4_DIRECT_DEPOSIT_BENEFITS = [
  { text: 'recevoir son salaire sans aucun déplacement', opt: 'recevoir son salaire sans déplacement' },
  { text: 'sécuriser le versement automatique de l’argent', opt: 'sécuriser les versements réguliers' },
  { text: 'éviter tout retard lors des jours fériés', opt: 'éviter les retards des jours fériés' },
  { text: 'bénéficier d’un dépôt rapide sur le compte', opt: 'bénéficier d’un dépôt direct rapide' },
]

const N4_ECOCENTER_CITIES = ['de la Ville de Québec', 'de l’agglomération de Longueuil', 'de la municipalité de Lévis', 'de la ville de Gatineau']
const N4_ECOCENTER_PERIODS = ['du premier mai au trente et un octobre', 'du premier mai au quinze octobre', 'du quinze mai au trente septembre', 'du premier juin au trente et un août']
const N4_ECOCENTER_HOURS = ['du mardi au dimanche de 8 h à 18 h', 'du mercredi au dimanche de 9 h à 17 h', 'du jeudi au lundi de 8 h 30 à 16 h 30', 'du mardi au samedi de 10 h à 18 h']
const N4_ECOCENTER_ACCEPTED = [
  { text: 'des résidus de rénovation et des branches', opt: 'des résidus de bois et des branches', kw: 'branches' },
  { text: 'des appareils ménagers et des métaux', opt: 'des vieux appareils et des métaux', kw: 'métaux' },
  { text: 'des cartons pliés et des pots de peinture', opt: 'des cartons et des restes de peinture', kw: 'peinture' },
  { text: 'des appareils électroniques et vieux câbles', opt: 'des appareils électroniques et des câbles', kw: 'câbles' },
]
const N4_ECOCENTER_REQUIRED = [
  { text: 'une preuve de résidence avec adresse locale', opt: 'une preuve de résidence municipale', kw: 'résidence' },
  { text: 'un permis de conduire avec adresse à jour', opt: 'un permis de conduire à bonne adresse', kw: 'permis' },
  { text: 'un compte de taxes ou facture municipale', opt: 'un compte de taxes ou reçu municipal', kw: 'taxes' },
  { text: 'une carte de citoyen délivrée par la mairie', opt: 'une carte citoyenne de la mairie', kw: 'citoyen' },
]

export const N04_R_0 = [
  // Scenario 1 (Template, situation: 0) - Extrait officiel d'un bail résidentiel
  Object.assign(
    (rand) => {
      const addr = pick(N4_LEASE_ADDRS, rand)
      const rent = pick(N4_LEASE_RENTS, rand)
      const period = pick(N4_LEASE_PERIODS, rand)
      const heat = pick(N4_LEASE_HEATS, rand)
      const pets = pick(N4_LEASE_PETS, rand)
      const othersRent = sample(N4_LEASE_RENTS.filter((r) => r !== rent), 2, rand)
      const othersPeriod = sample(N4_LEASE_PERIODS.filter((p) => p.opt !== period.opt), 2, rand)
      const text = `Extrait de bail résidentiel - Tribunal du logement. Logement situé au ${addr}. Période de location : ${period.text}. Loyer mensuel fixé à ${rent}, payable le premier du mois. Chauffage et électricité : ${heat.text}. Animaux : ${pets.text}. Toute cession de bail requiert un accord écrit du propriétaire.`
      return {
        text,
        questions: [
          q('Combien le locataire doit-il payer chaque mois ?', `${rent} par mois`, `${othersRent[0]} par mois`, `${othersRent[1]} par mois`, [rent.split(' ')[0]]),
          q('Quelle est la période de location couverte par ce bail ?', period.opt, othersPeriod[0].opt, othersPeriod[1].opt, [period.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_LEASE_ADDRS.length * N4_LEASE_RENTS.length * N4_LEASE_PERIODS.length * N4_LEASE_HEATS.length * N4_LEASE_PETS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Bilan d'un festival culturel urbain
  Object.assign(
    (rand) => {
      const fest = pick(N4_FESTIVAL_NAMES, rand)
      const crowd = pick(N4_FESTIVAL_CROWDS, rand)
      const days = pick(N4_FESTIVAL_DAYS, rand)
      const high = pick(N4_FESTIVAL_HIGHS, rand)
      const othersFest = sample(N4_FESTIVAL_NAMES.filter((f) => f.opt !== fest.opt), 2, rand)
      const othersCrowd = sample(N4_FESTIVAL_CROWDS.filter((c) => c.opt !== crowd.opt), 2, rand)
      const text = `Journal local. Bilan très positif pour ${fest.name} : ${crowd.text} ont assisté aux concerts durant ${days}. Malgré quelques averses en milieu de semaine, l’organisation souligne un grand succès populaire. Les festivaliers ont salué ${high}. Les retombées économiques sont excellentes pour les commerçants.`
      return {
        text,
        questions: [
          q('Quelle manifestation culturelle fait l’objet de cet article ?', fest.opt, othersFest[0].opt, othersFest[1].opt, [fest.kw]),
          q('Combien de spectateurs ont pris part à cet évènement ?', crowd.opt, othersCrowd[0].opt, othersCrowd[1].opt, [crowd.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_FESTIVAL_NAMES.length * N4_FESTIVAL_CROWDS.length * N4_FESTIVAL_DAYS.length * N4_FESTIVAL_HIGHS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Formulaire de dépôt direct de la paie)
  Object.assign(
    (rand) => {
      const dept = pick(N4_DIRECT_DEPOSIT_DEPTS, rand)
      const doc = pick(N4_DIRECT_DEPOSIT_DOCS, rand)
      const delay = pick(N4_DIRECT_DEPOSIT_DELAYS, rand)
      const benefit = pick(N4_DIRECT_DEPOSIT_BENEFITS, rand)
      const othersDoc = sample(N4_DIRECT_DEPOSIT_DOCS.filter((d) => d.opt !== doc.opt), 2, rand)
      const othersDelay = sample(N4_DIRECT_DEPOSIT_DELAYS.filter((d) => d.opt !== delay.opt), 2, rand)
      const text = `Adhésion au dépôt direct de la paie. Pour recevoir vos versements sur votre compte courant, remplissez ce formulaire d’autorisation et joignez ${doc.text}. Retournez l’ensemble ${dept}. Le traitement administratif s’effectue en ${delay.text}. Ce service permet ${de(benefit.text)}.`
      return {
        text,
        questions: [
          q('Quel document financier faut-il joindre au formulaire ?', doc.opt, othersDoc[0].opt, othersDoc[1].opt, [doc.kw]),
          q('Quel est le délai prévu pour la mise en place du service ?', delay.opt, othersDelay[0].opt, othersDelay[1].opt, [delay.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_DIRECT_DEPOSIT_DEPTS.length * N4_DIRECT_DEPOSIT_DOCS.length * N4_DIRECT_DEPOSIT_DELAYS.length * N4_DIRECT_DEPOSIT_BENEFITS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Horaires et services de l'écocentre municipal)
  Object.assign(
    (rand) => {
      const city = pick(N4_ECOCENTER_CITIES, rand)
      const period = pick(N4_ECOCENTER_PERIODS, rand)
      const hours = pick(N4_ECOCENTER_HOURS, rand)
      const accepted = pick(N4_ECOCENTER_ACCEPTED, rand)
      const req = pick(N4_ECOCENTER_REQUIRED, rand)
      const othersAccept = sample(N4_ECOCENTER_ACCEPTED.filter((a) => a.opt !== accepted.opt), 2, rand)
      const othersReq = sample(N4_ECOCENTER_REQUIRED.filter((r) => r.opt !== req.opt), 2, rand)
      const text = `Avis municipal - Écocentre ${city}. Durant la période estivale, ${period}, le site accueille les citoyens ${hours}. Les résidents peuvent y déposer sans frais ${accepted.text}. L’accès est gratuit sur présentation obligatoire d’${req.text}. Merci de trier vos matières avant l’arrivée sur place.`
      return {
        text,
        questions: [
          q('Quelles matières les citoyens peuvent-ils apporter sans frais ?', accepted.opt, othersAccept[0].opt, othersAccept[1].opt, [accepted.kw]),
          q('Quel document officiel faut-il présenter pour entrer sur le site ?', req.opt, othersReq[0].opt, othersReq[1].opt, [req.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_ECOCENTER_CITIES.length * N4_ECOCENTER_PERIODS.length * N4_ECOCENTER_HOURS.length * N4_ECOCENTER_ACCEPTED.length * N4_ECOCENTER_REQUIRED.length }
  ),
  // Scenario 5 (Static, situation: 0) - Avis de renouvellement de bail
  {
    situation: 0,
    text: 'Avis officiel de renouvellement de bail. Madame Bergeron vous informe que le loyer de votre trois et demie au 820 rue Saint-Vallier sera ajusté de trente dollars pour atteindre 950 dollars dès le premier juillet. Vous disposez d’un délai d’un mois après réception pour accepter ou refuser cette hausse par écrit.',
    questions: [
      q('De quel montant le loyer sera-t-il augmenté selon cet avis ?', 'de trente dollars de plus par mois', 'de quatre-vingts dollars de plus par mois', 'de quinze dollars de plus chaque mois', ['trente dollars']),
      q('Quel délai le locataire a-t-il pour envoyer sa réponse ?', 'un mois pour transmettre sa décision', 'trois mois complets pour donner une réponse', 'deux semaines ouvrables après la réception', ['un mois']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Bilan de la Fête des neiges au parc Jean-Drapeau
  {
    situation: 1,
    text: 'Revue municipale : bilan de la Fête des neiges. Plus de quarante-cinq mille personnes se sont rassemblées au parc Jean-Drapeau durant trois fins de semaine d’hiver. Les glissades sur tube, les ateliers de sculpture sur neige et la distribution de chocolat chaud ont fait la joie des petits et des grands.',
    questions: [
      q('Où cette fête d’hiver populaire s’est-elle tenue à Montréal ?', 'au parc Jean-Drapeau', 'au parc La Fontaine', 'au parc du Mont-Royal', ['jean-drapeau']),
      q('Quelles attractions hivernales ont notamment diverti le public ?', 'des glissades et des sculptures sur neige', 'des courses de traîneaux à chiens rapides', 'des tournois de hockey sur patinoire couverte', ['glissades']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-reading-1
// ---------------------------------------------------------------------------
const N4_CRAFT_WORKSHOPS = [
  {
    name: 'un cours de menuiserie pour débutants',
    topic: 'la fabrication d’objets simples en bois',
    topicOpt: 'la menuiserie et le travail du bois',
    kwTopic: 'bois',
    dur: 'six semaines en soirée',
    req: 'le matériel et les outils sont fournis',
    reqOpt: 'les outils sont fournis sur place',
    kwReq: 'outils',
  },
  {
    name: 'un atelier de couture et retouche',
    topic: 'la réparation de vêtements et le tricot',
    topicOpt: 'la couture et la retouche de vêtements',
    kwTopic: 'vêtements',
    dur: 'cinq semaines le samedi matin',
    req: 'les machines à coudre sont prêtées',
    reqOpt: 'les machines sont prêtées sur place',
    kwReq: 'machines',
  },
  {
    name: 'un cours de poterie artisanale',
    topic: 'le modelage de l’argile et la cuisson',
    topicOpt: 'la poterie et le modelage de l’argile',
    kwTopic: 'argile',
    dur: 'quatre semaines le mardi soir',
    req: 'toute la terre glaise est comprise',
    reqOpt: 'la terre glaise est fournie sur place',
    kwReq: 'terre glaise',
  },
  {
    name: 'un atelier de photographie numérique',
    topic: 'les réglages de base et le cadrage',
    topicOpt: 'la photographie et les prises de vue',
    kwTopic: 'photographie',
    dur: 'trois semaines le jeudi soir',
    req: 'un appareil photo est mis à disposition',
    reqOpt: 'un appareil photo est prêté au groupe',
    kwReq: 'appareil photo',
  },
]
const N4_CRAFT_CENTERS = [
  'au centre communautaire Saint-Michel',
  'au pavillon des loisirs du quartier',
  'à la maison de quartier Jacques-Cartier',
  'au centre culturel du Vieux-Moulin',
]
const N4_CRAFT_LEVELS = [
  'Aucune expérience préalable n’est demandée.',
  'Ce cours s’adresse aux grands débutants.',
  'Les novices sont particulièrement bienvenus.',
  'Le formateur guide chacun pas à pas.',
]
const N4_CRAFT_LIMITS = [
  'Le groupe est limité à dix participants.',
  'Les places sont limitées à huit personnes.',
  'Le nombre de places est fixé à douze.',
  'Un groupe restreint permet un bon suivi.',
]

const N4_FAIR_EVENTS = [
  {
    name: 'le Salon des métiers d’art régionaux',
    craft: 'des céramiques faites à la main',
    craftOpt: 'des céramiques façonnées à la main',
    kwCraft: 'céramiques',
    time: 'de dix heures à dix-huit heures',
    bonus: 'des démonstrations gratuites de tournage',
    bonOpt: 'des démonstrations d’artisans sur place',
    kwBon: 'démonstrations',
  },
  {
    name: 'la Foire d’automne des artisans locaux',
    craft: 'des confections en laine du pays',
    craftOpt: 'des tricots en laine et tissus locaux',
    kwCraft: 'laine',
    time: 'de neuf heures à dix-sept heures',
    bonus: 'des dégustations de confitures maison',
    bonOpt: 'des dégustations de produits maison',
    kwBon: 'dégustations',
  },
  {
    name: 'le Marché des créateurs indépendants',
    craft: 'des bijoux en bois sculpté et cuir',
    craftOpt: 'des bijoux et objets en bois sculpté',
    kwCraft: 'bijoux',
    time: 'entre onze heures et dix-neuf heures',
    bonus: 'des activités de fabrication pour enfants',
    bonOpt: 'des activités manuelles pour enfants',
    kwBon: 'enfants',
  },
  {
    name: 'l’Exposition annuelle du terroir québécois',
    craft: 'des savons naturels et produits doux',
    craftOpt: 'des savons naturels et soins corporels',
    kwCraft: 'savons',
    time: 'de dix heures à dix-sept heures',
    bonus: 'des échanges avec les artisans d’ici',
    bonOpt: 'des échanges avec les artisans locaux',
    kwBon: 'artisans',
  },
]
const N4_FAIR_LOCS = [
  'dans le hall de l’édifice municipal',
  'au gymnase du collège communautaire',
  'sur la grande place des citoyens',
  'au centre récréatif de l’arrondissement',
]
const N4_FAIR_ENTRIES = [
  'L’entrée est libre pour toute la famille.',
  'L’accès est gratuit pour les résidents.',
  'Aucun droit d’entrée n’est demandé.',
  'L’événement accueille le public sans frais.',
]
const N4_FAIR_PARKINGS = [
  'Un stationnement gratuit se trouve derrière.',
  'Le lieu est accessible en transport en commun.',
  'Des espaces pour voitures sont réservés.',
  'Des supports à vélos sont disponibles.',
]

const N4_TOUR_SITES = [
  {
    site: 'du moulin à farine historique',
    item: 'la mouture du blé avec la roue à eau',
    itemOpt: 'la fabrication de farine au moulin à eau',
    kwItem: 'farine',
    taste: 'du pain chaud sorti du fournil',
    tasteOpt: 'une miche de pain tout juste cuite',
    kwTaste: 'pain',
  },
  {
    site: 'de la ferme maraîchère biologique',
    item: 'la récolte de légumes sans produits chimiques',
    itemOpt: 'la récolte écologique de légumes frais',
    kwItem: 'légumes',
    taste: 'du jus de légumes fraîchement pressé',
    tasteOpt: 'du jus frais préparé sur place',
    kwTaste: 'jus',
  },
  {
    site: 'du verger éducatif familial',
    item: 'la taille et la culture des pommiers',
    itemOpt: 'la culture et la récolte des pommes',
    kwItem: 'culture',
    taste: 'du jus de pomme chaud et des beignes',
    tasteOpt: 'du jus de pomme chaud avec des beignes',
    kwTaste: 'beignes',
  },
  {
    site: 'de la miellerie artisanale de la vallée',
    item: 'le travail quotidien autour des ruches',
    itemOpt: 'le travail d’apiculture avec les ruches',
    kwItem: 'ruches',
    taste: 'différentes variétés de miel local',
    tasteOpt: 'plusieurs sortes de miel de la ferme',
    kwTaste: 'miel',
  },
]
const N4_TOUR_DAYS = [
  'chaque dimanche après-midi',
  'tous les samedis d’automne',
  'les fins de semaine ensoleillées',
  'du vendredi au dimanche',
]
const N4_TOUR_GUIDES = [
  'Un guide passionné explique chaque étape.',
  'La visite guidée dure environ une heure.',
  'Un animateur accompagne tout le parcours.',
  'Le circuit est conçu pour toute la famille.',
]
const N4_TOUR_TIPS = [
  'Pensez à porter de bonnes chaussures.',
  'Prévoyez des vêtements confortables.',
  'Apportez une bouteille d’eau pour le trajet.',
  'La réservation préalable est suggérée.',
]

const N4_SPORT_CLUBS = [
  {
    club: 'le club de marche nordique du parc',
    act: 'des promenades toniques avec des bâtons',
    actOpt: 'la marche rapide avec des bâtons',
    kwAct: 'marche',
    sched: 'le mardi et le jeudi à dix heures',
    schedOpt: 'deux matinées par semaine à dix heures',
    kwSched: 'dix heures',
    ben: 'de renforcer son endurance en douceur',
    benOpt: 'renforcer son endurance en douceur',
  },
  {
    club: 'le groupe d’initiation à la course à pied',
    act: 'des séances progressives sur sentier',
    actOpt: 'la course à pied par étapes faciles',
    kwAct: 'course à pied',
    sched: 'le samedi matin dès neuf heures',
    schedOpt: 'chaque samedi matin dès neuf heures',
    kwSched: 'samedi',
    ben: 'd’atteindre cinq kilomètres sans fatigue',
    benOpt: 'progresser vers cinq kilomètres de course',
  },
  {
    club: 'les cours de yoga doux en plein air',
    act: 'des postures simples et de la respiration',
    actOpt: 'le yoga doux et des respirations',
    kwAct: 'respiration',
    sched: 'le dimanche matin à dix heures',
    schedOpt: 'le dimanche matin dès dix heures',
    kwSched: 'dimanche',
    ben: 'de réduire les tensions accumulées',
    benOpt: 'diminuer les tensions de la semaine',
  },
  {
    club: 'l’atelier collectif de mise en forme',
    act: 'des étirements et du renforcement léger',
    actOpt: 'des étirements doux et du renforcement',
    kwAct: 'étirements',
    sched: 'le mercredi soir à dix-huit heures',
    schedOpt: 'le mercredi en début de soirée',
    kwSched: 'mercredi',
    ben: 'de garder la forme entre collègues',
    benOpt: 'maintenir sa forme physique en groupe',
  },
]
const N4_SPORT_PARKS = [
  'au parc municipal de l’Est',
  'sur les sentiers du parc des Moulins',
  'près du grand lac de la ville',
  'autour du terrain des sports',
]
const N4_SPORT_COSTS = [
  'L’activité est entièrement gratuite.',
  'Une contribution volontaire est suggérée.',
  'L’inscription se fait sans aucun frais.',
  'Le premier cours d’essai est offert.',
]
const N4_SPORT_BRINGS = [
  'Apportez simplement un tapis de sol.',
  'Venez avec une tenue de sport souple.',
  'Une gourde d’eau suffit pour participer.',
  'Munissez-vous de souliers de marche.',
]

export const N04_R_1 = [
  // Scenario 1 (Template, situation: 0) - Atelier pratique de loisirs
  Object.assign(
    (rand) => {
      const w = pick(N4_CRAFT_WORKSHOPS, rand)
      const center = pick(N4_CRAFT_CENTERS, rand)
      const lvl = pick(N4_CRAFT_LEVELS, rand)
      const lim = pick(N4_CRAFT_LIMITS, rand)
      const others = sample(N4_CRAFT_WORKSHOPS.filter((x) => x.topicOpt !== w.topicOpt), 2, rand)
      const text = `Atelier de quartier. Rejoignez ${w.name} ${center}. Durant cet atelier, vous découvrirez ${w.topic}. La session s’étend sur ${w.dur}. Rassurez-vous, ${w.req}. ${lvl} ${lim} Inscrivez-vous dès maintenant au secrétariat des loisirs pour réserver votre place.`
      return {
        text,
        questions: [
          q('Quel apprentissage pratique est présenté dans cette annonce ?', w.topicOpt, others[0].topicOpt, others[1].topicOpt, [w.kwTopic]),
          q('Quel avantage matériel est offert aux personnes inscrites ?', w.reqOpt, others[0].reqOpt, others[1].reqOpt, [w.kwReq]),
        ],
      }
    },
    { situation: 0, capacity: N4_CRAFT_WORKSHOPS.length * N4_CRAFT_CENTERS.length * N4_CRAFT_LEVELS.length * N4_CRAFT_LIMITS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Foire artisanale locale
  Object.assign(
    (rand) => {
      const f = pick(N4_FAIR_EVENTS, rand)
      const loc = pick(N4_FAIR_LOCS, rand)
      const entry = pick(N4_FAIR_ENTRIES, rand)
      const pkg = pick(N4_FAIR_PARKINGS, rand)
      const others = sample(N4_FAIR_EVENTS.filter((x) => x.craftOpt !== f.craftOpt), 2, rand)
      const text = `Événement culturel. Venez visiter ${f.name} ${loc}. Vous y découvrirez ${f.craft}. L’événement est ouvert ${f.time}. Vous pourrez aussi apprécier ${f.bonus}. ${entry} ${pkg} Venez encourager le savoir-faire de notre région cette fin de semaine.`
      return {
        text,
        questions: [
          q('Quels produits artisanaux sont mis en valeur à cet événement ?', f.craftOpt, others[0].craftOpt, others[1].craftOpt, [f.kwCraft]),
          q('Quelle animation spéciale est proposée aux visiteurs sur place ?', f.bonOpt, others[0].bonOpt, others[1].bonOpt, [f.kwBon]),
        ],
      }
    },
    { situation: 1, capacity: N4_FAIR_EVENTS.length * N4_FAIR_LOCS.length * N4_FAIR_ENTRIES.length * N4_FAIR_PARKINGS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Visite d'un site agrotouristique)
  Object.assign(
    (rand) => {
      const t = pick(N4_TOUR_SITES, rand)
      const day = pick(N4_TOUR_DAYS, rand)
      const guide = pick(N4_TOUR_GUIDES, rand)
      const tip = pick(N4_TOUR_TIPS, rand)
      const others = sample(N4_TOUR_SITES.filter((x) => x.itemOpt !== t.itemOpt), 2, rand)
      const text = `Découverte du patrimoine. Profitez d’une visite commentée ${t.site} ${day}. Vous comprendrez ${t.item}. À la fin du parcours, vous dégusterez ${t.taste}. ${guide} ${tip} Une belle sortie pour apprendre et partager un moment convivial.`
      return {
        text,
        questions: [
          q('Quel aspect du site les visiteurs vont-ils explorer lors du tour ?', t.itemOpt, others[0].itemOpt, others[1].itemOpt, [t.kwItem]),
          q('Quelle dégustation conclut la visite commentée pour le groupe ?', t.tasteOpt, others[0].tasteOpt, others[1].tasteOpt, [t.kwTaste]),
        ],
      }
    },
    { situation: 0, capacity: N4_TOUR_SITES.length * N4_TOUR_DAYS.length * N4_TOUR_GUIDES.length * N4_TOUR_TIPS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Club sportif et plein air)
  Object.assign(
    (rand) => {
      const s = pick(N4_SPORT_CLUBS, rand)
      const park = pick(N4_SPORT_PARKS, rand)
      const cost = pick(N4_SPORT_COSTS, rand)
      const bring = pick(N4_SPORT_BRINGS, rand)
      const others = sample(N4_SPORT_CLUBS.filter((x) => x.actOpt !== s.actOpt), 2, rand)
      const text = `Santé et plein air. Rejoignez ${s.club} ${park}. Cette activité propose ${s.act}. Les rencontres ont lieu ${s.sched}. Ces séances permettent ${s.ben}. ${cost} ${bring} N’hésitez pas à venir bouger avec nous pour garder la forme.`
      return {
        text,
        questions: [
          q('Quelle pratique physique ce club propose-t-il aux participants ?', s.actOpt, others[0].actOpt, others[1].actOpt, [s.kwAct]),
          q('À quel moment les participants se rassemblent-ils pour l’activité ?', s.schedOpt, others[0].schedOpt, others[1].schedOpt, [s.kwSched]),
        ],
      }
    },
    { situation: 1, capacity: N4_SPORT_CLUBS.length * N4_SPORT_PARKS.length * N4_SPORT_COSTS.length * N4_SPORT_BRINGS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Atelier d'initiation à la poterie
  {
    situation: 0,
    text: 'Atelier de loisirs créatifs. Le centre communautaire propose un cours d’initiation à la poterie traditionnelle cet automne. Les participants découvrent le modelage de la terre glaise, le façonnage sur tour électrique et la cuisson des pièces au four. Le matériel et l’argile sont entièrement fournis. La session dure six semaines, à raison d’une heure et demie par semaine.',
    questions: [
      q('Quelle activité manuelle est présentée dans ce descriptif ?', 'un cours pratique de poterie traditionnelle', 'un cours théorique de dessin industriel', 'un atelier d’ébénisterie et de menuiserie', ['poterie']),
      q('Quelle condition matérielle s’applique aux personnes inscrites ?', 'les outils et l’argile sont fournis au centre', 'chacun doit acheter son propre tour de potier', 'il faut obligatoirement apporter son matériel', ['fournis']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Marché fermier hebdomadaire
  {
    situation: 1,
    text: 'Vie de quartier. Le marché fermier du Vieux-Port revient chaque dimanche sur la place centrale. Une quinzaine de maraîchers de la région y vendent des légumes biologiques, des petits fruits frais, du pain artisanal et des fromages fermiers. Des musiciens locaux animent les allées entre dix heures et quatorze heures. L’accès est ouvert à tous.',
    questions: [
      q('Quel genre d’événement hebdomadaire ce texte décrit-il ?', 'un marché fermier de produits du terroir', 'une compétition sportive intercollégiale', 'un salon professionnel de l’automobile', ['marché']),
      q('Quelle animation accompagne les emplettes des visiteurs ?', 'des musiciens locaux jouant dans les allées', 'des feux d’artifice tirés en plein jour', 'des conférences données par des experts', ['musiciens']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-reading-2
// ---------------------------------------------------------------------------
const N4_CAMP_DESTS = [
  {
    place: 'au parc national du Mont-Tremblant',
    lodging: 'dans une tente près de la rivière',
    act: 'fait une belle randonnée pédestre dans la forêt',
    actOpt: 'une belle randonnée pédestre dans la forêt',
    kwAct: 'randonnée',
    eve: 'partagé un repas chaud autour du feu de camp',
    eveOpt: 'un repas très chaud partagé autour du feu',
    kwEve: 'repas',
  },
  {
    place: 'au parc de la Jacques-Cartier',
    lodging: 'dans un petit chalet en bois rond',
    act: 'pagayé en canot sur les eaux calmes de la vallée',
    actOpt: 'une sortie en canot sur la rivière calme',
    kwAct: 'canot',
    eve: 'admiré les étoiles sous un ciel très dégagé',
    eveOpt: 'l’observation des étoiles dans le ciel nocturne',
    kwEve: 'étoiles',
  },
  {
    place: 'au bord du grand lac Saint-Jean',
    lodging: 'au camping municipal sur la berge',
    act: 'roulé à bicyclette le long de la piste cyclable',
    actOpt: 'une promenade à bicyclette sur la piste',
    kwAct: 'bicyclette',
    eve: 'grillé des guimauves en écoutant de la musique',
    eveOpt: 'des guimauves grillées au son de la musique',
    kwEve: 'guimauves',
  },
  {
    place: 'dans les collines de Charlevoix',
    lodging: 'dans un refuge perché dans les arbres',
    act: 'marché jusqu’au belvédère pour voir le fleuve',
    actOpt: 'une montée au belvédère surplombant le fleuve',
    kwAct: 'belvédère',
    eve: 'joué à des jeux de société dans le salon',
    eveOpt: 'des parties de jeux de société en famille',
    kwEve: 'jeux',
  },
]
const N4_CAMP_WEATHERS = [
  'La météo était magnifique tout le samedi.',
  'Le soleil a brillé durant tout notre séjour.',
  'Le ciel est resté clair et la brise douce.',
  'La fin de semaine a été très ensoleillée.',
]
const N4_CAMP_MORNINGS = [
  'Le matin, le chant des oiseaux nous réveillait.',
  'Nous nous sommes levés tôt pour voir l’aube.',
  'L’air frais du matin nous a fait grand bien.',
  'Nous avons bu notre café face aux arbres.',
]
const N4_CAMP_CLOSINGS = [
  'C’était une fin de semaine simple et très reposante.',
  'Nous sommes rentrés chez nous avec le sourire.',
  'Cette sortie en nature nous a redonné de l’énergie.',
  'Nous pensons déjà à y retourner l’été prochain.',
]

const N4_NEIGH_INCIDENTS = [
  {
    cause: 'une grosse branche d’arbre a cédé sous le vent fort',
    causeOpt: 'une branche d’arbre tombée sur la voie',
    kwCause: 'branche',
    imp: 'le courant a été coupé pour plusieurs résidences',
    impOpt: 'une coupure de courant dans plusieurs résidences',
    sol: 'les équipes d’Hydro-Québec ont dégagé la rue et réparé les câbles',
    solOpt: 'les équipes d’urgence ont rétabli les câbles',
    kwSol: 'câbles',
  },
  {
    cause: 'une canalisation d’eau a éclaté sous le trottoir',
    causeOpt: 'une fuite d’eau sous le trottoir du quartier',
    kwCause: 'trottoir',
    imp: 'l’eau a été fermée pendant deux heures dans la rue',
    impOpt: 'une interruption d’eau durant deux heures',
    sol: 'les ouvriers municipaux ont réparé la conduite d’eau sans tarder',
    solOpt: 'les ouvriers ont colmaté la conduite d’eau',
    kwSol: 'conduite',
  },
  {
    cause: 'un camion de livraison est tombé en panne au carrefour',
    causeOpt: 'un camion de livraison immobilisé au carrefour',
    kwCause: 'camion',
    imp: 'les autobus ont dû faire un détour par une autre rue',
    impOpt: 'un détour obligatoire pour les autobus',
    sol: 'les agents de circulation ont dirigé les voitures et dégagé la voie',
    solOpt: 'les agents ont fait circuler les véhicules',
    kwSol: 'agents',
  },
  {
    cause: 'un conteneur de recyclage s’est renversé sur la route',
    causeOpt: 'un conteneur de recyclage renversé sur la route',
    kwCause: 'conteneur',
    imp: 'des cartons et papiers se sont éparpillés sur l’asphalte',
    impOpt: 'des cartons dispersés sur toute la chaussée',
    sol: 'les voisins se sont rassemblés pour tout ramasser avec des balais',
    solOpt: 'les voisins ont nettoyé la chaussée ensemble',
    kwSol: 'voisins',
  },
]
const N4_NEIGH_AREAS_2 = [
  'dans Limoilou sur la 3e Avenue',
  'dans Saint-Sauveur près du parc Victoria',
  'dans Rosemont à l’angle de la rue Masson',
  'dans Montcalm sur le boulevard René-Lévesque',
]
const N4_NEIGH_TIMES_2 = [
  'Hier vers quinze heures',
  'Vendredi en fin d’après-midi',
  'Hier matin vers dix heures',
  'Jeudi vers seize heures trente',
]
const N4_NEIGH_THANKINGS_2 = [
  'Personne n’a été blessé lors de cet incident.',
  'Le calme est revenu rapidement dans le secteur.',
  'Les résidents ont salué la rapidité de la réaction.',
  'La vie de quartier a repris son cours normal.',
]

const N4_MOVE_BUNDLES = [
  {
    help: 'mon cousin et deux amis d’enfance',
    helpOpt: 'un cousin et des amis proches du quartier',
    kwHelp: 'cousin',
    load: 'chargé le camion de boîtes et de meubles',
    loadOpt: 'remplir le camion de meubles et de boîtes',
    meal: 'partagé une bonne pizza assis sur des cartons',
    mealOpt: 'une bonne pizza partagée sur les boîtes',
    kwMeal: 'pizza',
  },
  {
    help: 'trois collègues de travail très serviables',
    helpOpt: 'trois collègues de bureau très serviables',
    kwHelp: 'collègues',
    load: 'descendu les lits et le réfrigérateur au bas de l’édifice',
    loadOpt: 'descendre les gros meubles par l’escalier',
    meal: 'dégusté des sandwichs frais avec du jus',
    mealOpt: 'des sandwichs frais avec des jus de fruits',
    kwMeal: 'sandwichs',
  },
  {
    help: 'mes deux frères et une voisine sympathique',
    helpOpt: 'ses deux frères et une voisine serviable',
    kwHelp: 'frères',
    load: 'transporté la vaisselle et les armoires en bois',
    loadOpt: 'transporter les armoires et la vaisselle',
    meal: 'mangé des salades préparées à la maison',
    mealOpt: 'de bonnes salades fraîches préparées à la maison',
    kwMeal: 'salades',
  },
  {
    help: 'des compagnons de mon club de sport',
    helpOpt: 'des amis sportifs rencontrés au club local',
    kwHelp: 'club',
    load: 'rempli la remorque avec tous les appareils ménagers',
    loadOpt: 'charger les appareils ménagers dans la remorque',
    meal: 'commandé des poutines chaudes au restaurant',
    mealOpt: 'une poutine chaude commandée au restaurant',
    kwMeal: 'poutine',
  },
]
const N4_MOVE_APTS = [
  'dans mon nouvel appartement de Limoilou',
  'vers notre nouveau logement à Verdun',
  'dans une maisonnette à Sainte-Foy',
  'dans un logement lumineux à Rosemont',
]
const N4_MOVE_STAIRS = [
  'Il a fallu monter trois étages à pied.',
  'L’escalier était étroit mais tout s’est bien passé.',
  'Tout a été monté au deuxième niveau sans bris.',
  'Les gros meubles sont entrés sans problème.',
]
const N4_MOVE_THANKS = [
  'Tout le monde a gardé sa bonne humeur.',
  'Une belle journée d’entraide entre proches.',
  'Je suis très reconnaissant pour leur aide précieuse.',
  'Nous avons fini d’installer les lits avant le coucher.',
]

const N4_SNOW_BUNDLES = [
  {
    drop: 'trente centimètres de neige poudreuse',
    dropOpt: 'une accumulation de trente centimètres de neige',
    trouble: 'ma voiture est restée coincée dans l’entrée',
    troubOpt: 'sa voiture est restée prise dans l’entrée',
    kwTrouble: 'voiture',
    helper: 'mon voisin est venu avec sa souffleuse à neige',
    helpOpt: 'un voisin avec sa souffleuse à neige',
    kwHelper: 'souffleuse',
  },
  {
    drop: 'une importante chute de neige et des rafales',
    dropOpt: 'une tempête de neige aux vents violents',
    trouble: 'un épais banc de neige bloquait notre porte de cour',
    troubOpt: 'un banc de neige bloquant la porte de cour',
    kwTrouble: 'banc de neige',
    helper: 'deux jeunes du quartier sont arrivés avec des pelles',
    helpOpt: 'deux jeunes du quartier avec de grandes pelles',
    kwHelper: 'pelles',
  },
  {
    drop: 'vingt-cinq centimètres tombés pendant la nuit',
    dropOpt: 'vingt-cinq centimètres de neige fraîche',
    trouble: 'les roues de mon véhicule patinaient sur la glace',
    troubOpt: 'les roues de son auto patinant sur la glace',
    kwTrouble: 'glace',
    helper: 'une passante m’a prêté un sac de sel et de sable',
    helpOpt: 'une passante lui prêtant du sable et du sel',
    kwHelper: 'sable',
  },
  {
    drop: 'un blizzard intense durant la matinée',
    dropOpt: 'un blizzard intense durant la matinée',
    trouble: 'le stationnement était complètement recouvert de blanc',
    troubOpt: 'le stationnement couvert d’une épaisse couche',
    kwTrouble: 'stationnement',
    helper: 'le concierge est venu déblayer l’accès avec son tracteur',
    helpOpt: 'le concierge avec son petit tracteur à neige',
    kwHelper: 'tracteur',
  },
]
const N4_SNOW_CITIES = [
  'à Québec hier matin',
  'à Sherbrooke lundi dernier',
  'à Trois-Rivières mardi passé',
  'à Montréal ce mercredi',
]
const N4_SNOW_TIMES = [
  'Le réveil a été surprenant.',
  'Dès six heures, la rue était toute blanche.',
  'Les flocons continuaient de tourbillonner dehors.',
  'La ville semblait marcher au ralenti.',
]
const N4_SNOW_OUTCOMES = [
  'J’ai pu arriver à mon travail avec un petit retard.',
  'Tout était propre avant le passage de l’autobus.',
  'Nous avons partagé un café chaud pour nous réchauffer.',
  'La solidarité d’hiver rend les journées plus faciles.',
]

export const N04_R_2 = [
  // Scenario 1 (Template, situation: 0) - Récit de séjour en plein air
  Object.assign(
    (rand) => {
      const d = pick(N4_CAMP_DESTS, rand)
      const weather = pick(N4_CAMP_WEATHERS, rand)
      const morning = pick(N4_CAMP_MORNINGS, rand)
      const closing = pick(N4_CAMP_CLOSINGS, rand)
      const others = sample(N4_CAMP_DESTS.filter((x) => x.actOpt !== d.actOpt), 2, rand)
      const text = `Journal personnel. La fin de semaine passée, nous sommes allés ${d.place}. Nous avons logé ${d.lodging}. ${weather} ${morning} Dans la journée, nous avons ${d.act}. En soirée, nous avons ${d.eve}. ${closing}`
      return {
        text,
        questions: [
          q('Quelle activité de jour les vacanciers ont-ils pratiquée ?', d.actOpt, others[0].actOpt, others[1].actOpt, [d.kwAct]),
          q('Comment le groupe a-t-il passé sa soirée en plein air ?', d.eveOpt, others[0].eveOpt, others[1].eveOpt, [d.kwEve]),
        ],
      }
    },
    { situation: 0, capacity: N4_CAMP_DESTS.length * N4_CAMP_WEATHERS.length * N4_CAMP_MORNINGS.length * N4_CAMP_CLOSINGS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Récit d'un incident de quartier
  Object.assign(
    (rand) => {
      const b = pick(N4_NEIGH_INCIDENTS, rand)
      const area = pick(N4_NEIGH_AREAS_2, rand)
      const time = pick(N4_NEIGH_TIMES_2, rand)
      const thanks = pick(N4_NEIGH_THANKINGS_2, rand)
      const others = sample(N4_NEIGH_INCIDENTS.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `Page communautaire du quartier. ${time} ${area}, un incident est survenu : ${b.cause}. En conséquence, ${b.imp}. Heureusement, ${b.sol}. ${thanks} Merci à tous pour votre civisme et votre collaboration.`
      return {
        text,
        questions: [
          q('Quel problème a perturbé la vie normale du quartier ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwCause]),
          q('Comment les intervenants ont-ils réglé cette situation ?', b.solOpt, others[0].solOpt, others[1].solOpt, [b.kwSol]),
        ],
      }
    },
    { situation: 1, capacity: N4_NEIGH_INCIDENTS.length * N4_NEIGH_AREAS_2.length * N4_NEIGH_TIMES_2.length * N4_NEIGH_THANKINGS_2.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Déménagement entre amis)
  Object.assign(
    (rand) => {
      const m = pick(N4_MOVE_BUNDLES, rand)
      const apt = pick(N4_MOVE_APTS, rand)
      const stair = pick(N4_MOVE_STAIRS, rand)
      const thank = pick(N4_MOVE_THANKS, rand)
      const others = sample(N4_MOVE_BUNDLES.filter((x) => x.helpOpt !== m.helpOpt), 2, rand)
      const text = `Récit personnel. Samedi passé, j’ai enfin déménagé ${apt}. Pour m’aider, ${m.help} sont venus dès huit heures le matin. Ensemble, nous avons ${m.load}. ${stair} À midi, nous avons ${m.meal}. ${thank} Une journée fatigante mais pleine de solidarité.`
      return {
        text,
        questions: [
          q('Qui est venu prêter main-forte pour ce déménagement ?', m.helpOpt, others[0].helpOpt, others[1].helpOpt, [m.kwHelp]),
          q('Quel repas réconfortant le groupe a-t-il partagé à midi ?', m.mealOpt, others[0].mealOpt, others[1].mealOpt, [m.kwMeal]),
        ],
      }
    },
    { situation: 0, capacity: N4_MOVE_BUNDLES.length * N4_MOVE_APTS.length * N4_MOVE_STAIRS.length * N4_MOVE_THANKS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Bordée de neige et entraide)
  Object.assign(
    (rand) => {
      const s = pick(N4_SNOW_BUNDLES, rand)
      const city = pick(N4_SNOW_CITIES, rand)
      const time = pick(N4_SNOW_TIMES, rand)
      const outcome = pick(N4_SNOW_OUTCOMES, rand)
      const others = sample(N4_SNOW_BUNDLES.filter((x) => x.troubOpt !== s.troubOpt), 2, rand)
      const text = `Anecdote d’hiver. Nous avons reçu ${s.drop} ${city}. ${time} En voulant partir au travail, ${s.trouble}. Heureusement, ${s.helper} pour m’aider à dégager l’espace. ${outcome} C’est dans ces moments qu’on apprécie l’entraide entre voisins.`
      return {
        text,
        questions: [
          q('Quel désagrément hivernal la personne a-t-elle vécu le matin ?', s.troubOpt, others[0].troubOpt, others[1].troubOpt, [s.kwTrouble]),
          q('Qui est intervenu pour aider à déneiger le secteur ?', s.helpOpt, others[0].helpOpt, others[1].helpOpt, [s.kwHelper]),
        ],
      }
    },
    { situation: 1, capacity: N4_SNOW_BUNDLES.length * N4_SNOW_CITIES.length * N4_SNOW_TIMES.length * N4_SNOW_OUTCOMES.length }
  ),
  // Scenario 5 (Static, situation: 0) - Plage avec les enfants
  {
    situation: 0,
    text: 'Anecdote de famille. Dimanche passé, je suis allé à la plage du parc avec les enfants. Le soleil était magnifique, mais l’eau du lac était encore un peu froide. On a quand même passé une très belle journée. Les enfants ont bâti un grand château de sable et ramassé de petits coquillages. Nous avons terminé l’après-midi avec une bonne crème glacée à la vanille.',
    questions: [
      q('Quelle activité les enfants ont-ils faite au bord de l’eau ?', 'construire un château de sable sur la plage', 'faire une promenade en chaloupe sur les vagues', 'pêcher tranquillement des poissons sur le quai', ['château de sable']),
      q('Quelle gourmandise ont-ils savourée avant de partir ?', 'une glace rafraîchissante à la vanille', 'un sac de friandises acheté au dépanneur', 'un chocolat chaud dans un café voisin', ['vanille']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Bris d'aqueduc devant l'école
  {
    situation: 1,
    text: 'Nouvelle locale. Hier matin vers huit heures, un bris d’aqueduc est survenu sur la rue devant l’école primaire. L’eau s’est rapidement écoulée sur la chaussée et le trottoir. Par mesure de prudence, la directrice a demandé aux élèves de passer par la porte arrière. Les ouvriers municipaux sont arrivés en vingt minutes pour couper la valve d’eau et réparer la canalisation. Tout est rentré dans l’ordre avant midi.',
    questions: [
      q('Quel problème municipal a perturbé l’accès à l’école ?', 'un bris d’aqueduc provoquant une fuite d’eau', 'une panne générale de courant dans les locaux', 'une chute importante de verglas sur la toiture', ['bris d’aqueduc']),
      q('Quelle consigne temporaire la directrice a-t-elle donnée ?', 'faire entrer les élèves par la porte arrière', 'fermer complètement l’établissement scolaire', 'déplacer toutes les classes dans une autre école', ['porte arrière']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-reading-3
// ---------------------------------------------------------------------------
const N4_BANK_NAMES = ['Desjardins', 'la Banque Nationale', 'la Banque Royale', 'la Banque Scotia']
const N4_BANK_FRAUD_BUNDLES = [
  {
    trick: 'des textos affirmant que votre carte est bloquée',
    trickOpt: 'des textos annonçant un faux blocage de carte',
    kwTrick: 'textos',
    trap: 'un faux lien vers une page demandant votre mot de passe',
    kwTrap: 'mot de passe',
  },
  {
    trick: 'des courriels signalant un faux virement en attente',
    trickOpt: 'des courriels mentionnant un virement en attente',
    kwTrick: 'courriels',
    trap: 'un formulaire vous réclamant votre numéro d’assurance',
    kwTrap: 'assurance',
  },
  {
    trick: 'des appels automatiques demandant de rappeler d’urgence',
    trickOpt: 'des appels automatiques exigeant un rappel rapide',
    kwTrick: 'appels',
    trap: 'un répondeur vous invitant à taper votre code secret',
    kwTrap: 'secret',
  },
  {
    trick: 'des messages prétextant une mise à jour obligatoire',
    trickOpt: 'des messages exigeant une mise à jour immédiate',
    kwTrick: 'mise à jour',
    trap: 'un bouton pour saisir vos coordonnées bancaires',
    kwTrap: 'coordonnées',
  },
]
const N4_BANK_RULES = [
  'Ne cliquez sur aucun lien contenu dans ces messages.',
  'Supprimez immédiatement ce type de notification.',
  'N’entrez jamais vos identifiants sur un site non sécurisé.',
  'Ignorez ces demandes inhabituelles sans y répondre.',
]
const N4_BANK_CONTACTS = [
  { act: 'appelez le numéro officiel au verso de votre carte', actOpt: 'appeler le numéro officiel au dos de sa carte', kwAct: 'numéro' },
  { act: 'joignez le service à la clientèle par l’application', actOpt: 'utiliser l’application officielle de la banque', kwAct: 'application' },
  { act: 'rendez-vous directement à votre succursale locale', actOpt: 'se présenter en succursale auprès d’un conseiller', kwAct: 'succursale' },
  { act: 'écrivez au bureau de sécurité de votre institution', actOpt: 'signaler le message au bureau de sécurité', kwAct: 'sécurité' },
]

const N4_WORK_INCIDENTS = [
  {
    place: 'dans la salle des serveurs au deuxième niveau',
    cause: 'une surchauffe temporaire du système de climatisation',
    causeOpt: 'une surchauffe de la climatisation des serveurs',
    kwCause: 'climatisation',
    imp: 'l’accès au portail interne a été ralenti durant une heure',
    impOpt: 'un ralentissement du portail durant une heure',
    sol: 'les techniciens ont rétabli la ventilation et tout fonctionne',
    solOpt: 'les équipes ont remis la ventilation en marche',
    kwSol: 'ventilation',
  },
  {
    place: 'dans l’atelier d’emballage du centre de tri',
    cause: 'le blocage mécanique d’un rouleau sur la chaîne de tri',
    causeOpt: 'un blocage mécanique sur la chaîne de tri',
    kwCause: 'chaîne de tri',
    imp: 'le traitement des colis a été suspendu pendant quarante minutes',
    impOpt: 'une interruption de quarante minutes au tri des colis',
    sol: 'l’équipe de maintenance a remplacé la courroie et relancé l’atelier',
    solOpt: 'l’équipe a remplacé la courroie défectueuse',
    kwSol: 'courroie',
  },
  {
    place: 'au comptoir de la cafétéria du personnel',
    cause: 'une fuite d’eau sous un appareil de cuisson ce matin',
    causeOpt: 'une fuite d’eau venant de la cuisson',
    kwCause: 'cuisson',
    imp: 'le service du repas chaud a été retardé d’une demi-heure',
    impOpt: 'un retard d’une demi-heure pour le repas du midi',
    sol: 'le plombier a colmaté la conduite et le dîner a pu être servi',
    solOpt: 'le plombier a réparé la conduite d’eau',
    kwSol: 'plombier',
  },
  {
    place: 'dans l’entrepôt principal de notre succursale',
    cause: 'la panne d’un chariot élévateur bloquant l’allée centrale',
    causeOpt: 'un bris de chariot élévateur dans l’allée',
    kwCause: 'chariot élévateur',
    imp: 'la préparation des commandes a pris quarante-cinq minutes de retard',
    impOpt: 'un retard de quarante-cinq minutes sur les commandes',
    sol: 'les caristes ont déplacé le véhicule et dégagé le passage',
    solOpt: 'les employés ont déplacé l’appareil en panne',
    kwSol: 'déplacé',
  },
]
const N4_WORK_NOTES = [
  'Nous vous informons de la situation.',
  'Voici un point sur les opérations ce matin.',
  'La direction partage ce mot de suivi.',
  'Voici les détails concernant cet incident.',
]
const N4_WORK_THANKS = [
  'Merci à chacun pour votre calme habituel.',
  'Nous saluons la réactivité de nos équipes.',
  'Toutes les activités se poursuivent normalement.',
  'Merci pour votre compréhension et votre professionnalisme.',
]

const N4_SNOW_ALERT_BUNDLES = [
  {
    city: 'de la Ville de Québec',
    trigger: 'le déclenchement des gyrophares de nuit',
    rule: 'stationnez uniquement du côté des numéros pairs',
    ruleOpt: 'se garer seulement du côté des numéros pairs',
    kwRule: 'pairs',
    penalty: 'le remorquage du véhicule et une amende',
    penOpt: 'le remorquage du véhicule avec une amende',
    kwPen: 'remorquage',
  },
  {
    city: 'de l’arrondissement de Rosemont',
    trigger: 'le retentissement de la sirène de déneigement',
    rule: 'libérez complètement le côté de la rue indiqué',
    ruleOpt: 'libérer totalement le côté de rue indiqué',
    kwRule: 'côté',
    penalty: 'un constat d’infraction déposé sur le pare-brise',
    penOpt: 'un constat d’infraction sur le pare-brise',
    kwPen: 'constat',
  },
  {
    city: 'de la municipalité de Lévis',
    trigger: 'l’affichage des feux clignotants orange',
    rule: 'utilisez les stationnements municipaux gratuits',
    ruleOpt: 'utiliser les espaces municipaux sans frais',
    kwRule: 'municipaux',
    penalty: 'la suspension temporaire de votre vignette de stationnement',
    penOpt: 'la suspension temporaire de sa vignette municipale',
    kwPen: 'vignette',
  },
  {
    city: 'de la ville de Gatineau',
    trigger: 'l’annonce d’une opération de chargement de neige',
    rule: 'garez votre auto du côté impair de la chaussée',
    ruleOpt: 'stationner son auto du côté impair seulement',
    kwRule: 'impair',
    penalty: 'la pose d’un sabot de blocage sur une roue',
    penOpt: 'la pose d’un sabot sur la roue',
    kwPen: 'sabot',
  },
]
const N4_SNOW_ALERT_HOURS = [
  'entre vingt-trois heures et sept heures',
  'durant toute la nuit de minuit à sept heures',
  'dès vingt-deux heures jusqu’au petit matin',
  'pendant les opérations nocturnes de voirie',
]
const N4_SNOW_ALERT_ADVICES = [
  'Vérifiez les panneaux de signalisation temporaires.',
  'Consultez la carte en ligne avant de vous garer.',
  'Téléchargez l’application municipale pour les avis.',
  'Des alertes par texto sont aussi transmises aux résidents.',
]
const N4_SNOW_ALERT_REASONS = [
  'Cette consigne permet le passage rapide des déneigeuses.',
  'Cette mesure facilite le dégagement de la chaussée.',
  'Ce règlement assure la sécurité de tous sur la route.',
  'Cette règle permet de nettoyer les rues avant le matin.',
]

const N4_FACILITY_BUNDLES = [
  {
    place: 'la piscine municipale du quartier',
    cause: 'la réfection des filtres de traitement d’eau',
    causeOpt: 'changer les filtres du circuit d’eau',
    kwCause: 'filtres',
    dur: 'du lundi douze au vendredi seize novembre',
    durOpt: 'une fermeture du lundi au vendredi inclus',
    alt: 'au centre aquatique de l’Est situé à deux kilomètres',
    altOpt: 'au centre aquatique voisin à deux kilomètres',
    kwAlt: 'aquatique',
  },
  {
    place: 'la bibliothèque centrale de la ville',
    cause: 'le vernissage et la rénovation des planchers de bois',
    causeOpt: 'la rénovation des planchers dans les salles',
    kwCause: 'planchers',
    dur: 'du trois au huit octobre inclusivement',
    durOpt: 'une période de fermeture de six jours complets',
    alt: 'à la bibliothèque de quartier pour emprunter des livres',
    altOpt: 'se rendre à la bibliothèque de quartier',
    kwAlt: 'bibliothèque',
  },
  {
    place: 'l’aréna communautaire des sports',
    cause: 'l’entretien planifié du compresseur de la glace',
    causeOpt: 'l’entretien annuel du compresseur de la glace',
    kwCause: 'compresseur',
    dur: 'pendant quatre jours à compter de mercredi',
    durOpt: 'un arrêt temporaire de quatre journées de travail',
    alt: 'sur la patinoire extérieure du grand parc',
    altOpt: 'utiliser la patinoire du grand parc',
    kwAlt: 'patinoire',
  },
  {
    place: 'la maison de quartier Saint-Roch',
    cause: 'la mise aux normes du tableau électrique principal',
    causeOpt: 'la mise aux normes de l’installation électrique',
    kwCause: 'électrique',
    dur: 'pour toute la fin de semaine à venir',
    durOpt: 'un arrêt des services pour la fin de semaine',
    alt: 'au pavillon des loisirs pour les ateliers habituels',
    altOpt: 'au pavillon des loisirs du quartier',
    kwAlt: 'pavillon',
  },
]
const N4_FACILITY_HEADS = [
  'Information aux usagers.',
  'Avis officiel aux citoyens.',
  'Communiqué de la direction des loisirs.',
  'Message important de la municipalité.',
]
const N4_FACILITY_REOPENS = [
  'Les portes rouvriront dès le samedi matin.',
  'La reprise des activités aura lieu dès le lundi suivant.',
  'Le public sera accueilli normalement après les travaux.',
  'Les horaires réguliers reprendront dès la réouverture.',
]
const N4_FACILITY_THANKS = [
  'Nous vous remercions pour votre précieuse compréhension.',
  'Merci de votre patience pendant ces améliorations nécessaires.',
  'Ces travaux permettent d’offrir un meilleur service à tous.',
  'Nous nous excusons pour ce désagrément temporaire.',
]

export const N04_R_3 = [
  // Scenario 1 (Template, situation: 0) - Sécurité bancaire
  Object.assign(
    (rand) => {
      const bank = pick(N4_BANK_NAMES, rand)
      const f = pick(N4_BANK_FRAUD_BUNDLES, rand)
      const rule = pick(N4_BANK_RULES, rand)
      const c = pick(N4_BANK_CONTACTS, rand)
      const othersF = sample(N4_BANK_FRAUD_BUNDLES.filter((x) => x.trickOpt !== f.trickOpt), 2, rand)
      const othersC = sample(N4_BANK_CONTACTS.filter((x) => x.actOpt !== c.actOpt), 2, rand)
      const text = `Avis de sécurité publié par ${bank}. Attention aux tentatives de fraude en ligne. Des personnes malveillantes envoient actuellement ${f.trick}. Ces messages contiennent souvent ${f.trap}. Règle de prudence essentielle : ${rule} En cas d’hésitation, ${c.act}. Notre institution protège vos données en tout temps.`
      return {
        text,
        questions: [
          q('Quel stratagème frauduleux est dénoncé dans cet avis bancaire ?', f.trickOpt, othersF[0].trickOpt, othersF[1].trickOpt, [f.kwTrick]),
          q('Quelle consigne est recommandée au client en cas d’hésitation ?', c.actOpt, othersC[0].actOpt, othersC[1].actOpt, [c.kwAct]),
        ],
      }
    },
    { situation: 0, capacity: N4_BANK_NAMES.length * N4_BANK_FRAUD_BUNDLES.length * N4_BANK_RULES.length * N4_BANK_CONTACTS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Incident matériel au travail
  Object.assign(
    (rand) => {
      const b = pick(N4_WORK_INCIDENTS, rand)
      const note = pick(N4_WORK_NOTES, rand)
      const thank = pick(N4_WORK_THANKS, rand)
      const others = sample(N4_WORK_INCIDENTS.filter((x) => x.causeOpt !== b.causeOpt), 2, rand)
      const text = `Note de service interne. ${note} Un problème technique s’est produit ${b.place}. L’origine : ${b.cause}. En conséquence, ${b.imp}. Grâce à une intervention rapide, ${b.sol}. ${thank}`
      return {
        text,
        questions: [
          q('Quelle a été la cause de cet incident au travail ce matin ?', b.causeOpt, others[0].causeOpt, others[1].causeOpt, [b.kwCause]),
          q('Comment le problème matériel a-t-il été résolu par l’équipe ?', b.solOpt, others[0].solOpt, others[1].solOpt, [b.kwSol]),
        ],
      }
    },
    { situation: 1, capacity: N4_WORK_INCIDENTS.length * N4_WORK_NOTES.length * N4_WORK_THANKS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Déneigement municipal)
  Object.assign(
    (rand) => {
      const a = pick(N4_SNOW_ALERT_BUNDLES, rand)
      const hour = pick(N4_SNOW_ALERT_HOURS, rand)
      const advice = pick(N4_SNOW_ALERT_ADVICES, rand)
      const reason = pick(N4_SNOW_ALERT_REASONS, rand)
      const others = sample(N4_SNOW_ALERT_BUNDLES.filter((x) => x.ruleOpt !== a.ruleOpt), 2, rand)
      const text = `Avis municipal - Opérations de déneigement ${a.city}. Dès ${a.trigger}, des règles spéciales s’appliquent ${hour}. Consigne obligatoire : ${a.rule}. Tout véhicule en infraction risque ${a.penalty}. ${advice} ${reason}`
      return {
        text,
        questions: [
          q('Quelle consigne de stationnement doit être appliquée la nuit ?', a.ruleOpt, others[0].ruleOpt, others[1].ruleOpt, [a.kwRule]),
          q('Quel risque encourent les automobilistes qui ne respectent pas l’avis ?', a.penOpt, others[0].penOpt, others[1].penOpt, [a.kwPen]),
        ],
      }
    },
    { situation: 0, capacity: N4_SNOW_ALERT_BUNDLES.length * N4_SNOW_ALERT_HOURS.length * N4_SNOW_ALERT_ADVICES.length * N4_SNOW_ALERT_REASONS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Fermeture exceptionnelle d'équipement)
  Object.assign(
    (rand) => {
      const fac = pick(N4_FACILITY_BUNDLES, rand)
      const head = pick(N4_FACILITY_HEADS, rand)
      const reopen = pick(N4_FACILITY_REOPENS, rand)
      const thank = pick(N4_FACILITY_THANKS, rand)
      const others = sample(N4_FACILITY_BUNDLES.filter((x) => x.causeOpt !== fac.causeOpt), 2, rand)
      const text = `${head} Veuillez noter que ${fac.place} fermera temporairement ses portes pour ${fac.cause}. L’interruption est prévue ${fac.dur}. Durant cette période, les usagers peuvent se rendre ${fac.alt}. ${reopen} ${thank}`
      return {
        text,
        questions: [
          q('Pour quel motif cette installation publique ferme-t-elle temporairement ?', fac.causeOpt, others[0].causeOpt, others[1].causeOpt, [fac.kwCause]),
          q('Quelle alternative de proximité est suggérée aux usagers ?', fac.altOpt, others[0].altOpt, others[1].altOpt, [fac.kwAlt]),
        ],
      }
    },
    { situation: 1, capacity: N4_FACILITY_BUNDLES.length * N4_FACILITY_HEADS.length * N4_FACILITY_REOPENS.length * N4_FACILITY_THANKS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Alerte de sécurité bancaire Desjardins
  {
    situation: 0,
    text: 'Message de sécurité de votre caisse. Des courriels frauduleux circulent actuellement au nom de notre institution. Ces messages vous demandent de confirmer votre mot de passe pour débloquer votre accès en ligne. Sachez que notre institution ne demande jamais vos identifiants par courriel. Ne cliquez sur aucun hyperlien suspect. En cas de doute, composez directement le numéro inscrit au dos de votre carte de débit.',
    questions: [
      q('Quel faux prétexte est utilisé par les fraudeurs ?', 'demander un mot de passe pour débloquer l’accès', 'proposer un prêt à taux réduit pour l’achat d’auto', 'offrir un remboursement pour des frais d’assurance', ['mot de passe']),
      q('Quel bon réflexe est recommandé aux clients en cas de doute ?', 'appeler le numéro figurant au verso de la carte', 'envoyer une capture d’écran à ses collègues', 'changer immédiatement de téléphone cellulaire', ['numéro']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Panne d'ascenseur dans l'immeuble
  {
    situation: 1,
    text: 'Avis aux résidents de l’immeuble. L’ascenseur principal est temporairement hors service depuis ce matin en raison d’une surchauffe du moteur de levage. Le technicien de la compagnie d’entretien est sur place pour changer la pièce endommagée. Nous prévoyons une remise en marche complète vers dix-sept heures. Pour les personnes à mobilité réduite, le monte-charge de service reste accessible avec l’aide du concierge.',
    questions: [
      q('Quelle pièce mécanique a causé l’arrêt de l’ascenseur ?', 'une surchauffe sur le moteur de levage', 'un bris de câble au niveau du sous-sol', 'un bouton de commande cassé au rez-de-chaussée', ['moteur de levage']),
      q('Quelle solution d’aide est offerte aux personnes à mobilité réduite ?', 'utiliser le monte-charge avec le concierge', 'attendre dans le hall jusqu’à la fin des travaux', 'demander aux voisins de porter leurs sacs', ['monte-charge']),
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-reading-4
// ---------------------------------------------------------------------------
const N4_WORK_TASKS_1 = [
  { text: 'traiter les courriels prioritaires des clients', opt: 'traiter les courriels urgents des clients', kw: 'courriels' },
  { text: 'vérifier les commandes en attente d’envoi', opt: 'contrôler les commandes prêtes à livrer', kw: 'commandes' },
  { text: 'mettre à jour le tableau des présences', opt: 'noter les présences du personnel du jour', kw: 'présences' },
  { text: 'imprimer les bordereaux de livraison du jour', opt: 'imprimer les bordereaux de livraison', kw: 'bordereaux' },
]
const N4_WORK_TASKS_2 = [
  { text: 'confirmer les rendez-vous de l’après-midi', opt: 'valider les rendez-vous de l’après-midi', kw: 'rendez-vous' },
  { text: 'classer les factures dans le classeur vert', opt: 'ranger les factures dans le bon classeur', kw: 'factures' },
  { text: 'finaliser le compte rendu de la rencontre', opt: 'rédiger le compte rendu de la réunion', kw: 'compte rendu' },
  { text: 'compter les fournitures de papeterie', opt: 'faire l’inventaire des fournitures de bureau', kw: 'fournitures' },
]
const N4_WORK_TASKS_3 = [
  { text: 'ranger les dossiers confidentiels sous clé', opt: 'fermer à clé l’armoire des dossiers privés' },
  { text: 'éteindre les imprimantes et les écrans', opt: 'mettre tous les ordinateurs hors tension' },
  { text: 'verrouiller les armoires de matériel', opt: 'sécuriser les placards de fournitures' },
  { text: 'déposer le courrier du jour à la réception', opt: 'porter les lettres au comptoir d’accueil' },
]
const N4_WORK_HEADS = [
  'Consignes de la superviseuse pour la journée.',
  'Plan de travail transmis par la directrice.',
  'Organisation des priorités pour notre équipe.',
  'Instructions journalières pour le bureau.',
]
const N4_WORK_SIGNOFFS = [
  'Merci de votre rigueur et bon travail à tous.',
  'N’hésitez pas à me joindre en cas de question.',
  'Je reste disponible à mon bureau si besoin.',
  'Merci de respecter cet ordre pour la journée.',
]

const N4_DRIVE_FOLDERS = [
  { folder: 'dans le dossier partagé des ventes', opt: 'dans le répertoire commun des ventes', kw: 'ventes' },
  { folder: 'sur le portail des ressources humaines', opt: 'sur le site interne des ressources humaines', kw: 'ressources humaines' },
  { folder: 'dans l’espace sécurisé des projets', opt: 'au sein du dossier protégé des projets', kw: 'projets' },
  { folder: 'sur le disque réseau de la comptabilité', opt: 'sur l’espace partagé de la comptabilité', kw: 'comptabilité' },
]
const N4_DRIVE_SUBS = [
  { sub: 'le sous-dossier de l’année courante', opt: 'le sous-dossier de l’année courante' },
  { sub: 'la section des rapports hebdomadaires', opt: 'la section des rapports hebdomadaires' },
  { sub: 'le répertoire des documents finaux', opt: 'le répertoire des documents finaux' },
  { sub: 'le dossier des formulaires approuvés', opt: 'le dossier des formulaires approuvés' },
]
const N4_DRIVE_FORMATS = [
  { fmt: 'en format PDF haute résolution', opt: 'au format PDF haute résolution' },
  { fmt: 'en format Word ou PDF standard', opt: 'en document Word ou PDF standard' },
  { fmt: 'en fichier texte lisible', opt: 'sous forme de document texte lisible' },
  { fmt: 'sous la forme d’un fichier compressé', opt: 'sous forme de fichier compressé' },
]
const N4_DRIVE_BUTTONS = [
  { btn: 'appuyez sur le bouton vert Téléverser', opt: 'appuyer sur le bouton Téléverser', kw: 'Téléverser' },
  { btn: 'cliquez sur la commande Enregistrer', opt: 'cliquer sur la commande Enregistrer', kw: 'Enregistrer' },
  { btn: 'validez avec la touche Confirmer l’envoi', opt: 'valider avec la touche Confirmer', kw: 'Confirmer' },
  { btn: 'cliquez sur le bouton Déposer le fichier', opt: 'cliquer sur Déposer le fichier', kw: 'Déposer' },
]
const N4_DRIVE_STEPS = [
  'Procédure de classement informatique.',
  'Guide de dépôt de document sur le réseau.',
  'Instructions pour archiver un fichier en ligne.',
  'Marche à suivre pour transmettre un compte rendu.',
]
const N4_DRIVE_CONFS = [
  'Un accusé de réception vert apparaîtra.',
  'Le système vous enverra un courriel de validation.',
  'Un message de succès confirmera votre dépôt.',
  'Un code de confirmation s’affichera à l’écran.',
]

const N4_ROOM_SETUPS = [
  { text: 'disposer vingt chaises autour de la grande table', opt: 'placer vingt chaises autour de la table' },
  { text: 'installer les tables en cercle pour l’atelier', opt: 'disposer les tables en demi-cercle' },
  { text: 'aligner les rangées de sièges face à l’écran', opt: 'aligner les sièges face à l’écran' },
  { text: 'préparer les tables d’accueil à l’entrée', opt: 'installer les tables d’accueil à l’entrée' },
]
const N4_ROOM_TECHS = [
  { text: 'brancher le projecteur et tester le micro sans fil', opt: 'brancher le projecteur et le micro sans fil', kw: 'projecteur' },
  { text: 'allumer l’ordinateur central et vérifier l’écran', opt: 'allumer l’ordinateur et l’écran central', kw: 'ordinateur' },
  { text: 'connecter l’appareil audio au réseau sans fil', opt: 'relier l’appareil audio au réseau', kw: 'audio' },
  { text: 'tester la caméra vidéo pour les participants en ligne', opt: 'tester la caméra pour les gens à distance', kw: 'caméra' },
]
const N4_ROOM_REFRESHS = [
  { text: 'placer des bouteilles d’eau et des verres propres', opt: 'disposer les bouteilles d’eau et les verres', kw: 'bouteilles' },
  { text: 'déposer les blocs-notes et les stylos devant chaque place', opt: 'installer les blocs-notes et les stylos', kw: 'blocs-notes' },
  { text: 'remplir la cafetière et sortir les tasses en carton', opt: 'préparer la cafetière et sortir les tasses', kw: 'cafetière' },
  { text: 'distribuer les dépliants du programme sur les tables', opt: 'déposer les dépliants sur les tables', kw: 'dépliants' },
]
const N4_ROOM_HEADS = [
  'Consignes pour la réunion de service.',
  'Préparation de la salle de conférence.',
  'Instructions pour l’accueil des invités.',
  'Directives pour la séance d’information.',
]
const N4_ROOM_TIMES = [
  'Cette préparation doit être finie pour treize heures.',
  'Assurez-vous que tout est prêt pour quatorze heures.',
  'Le local doit être impeccable trente minutes avant.',
  'Vérifiez chaque détail avant l’arrivée des collègues.',
]

const N4_RECYCLE_STEPS = [
  {
    text: 'déposer les cartons plats et journaux dans le bac bleu',
    opt: 'mettre les cartons dans le bac bleu',
    dist1: 'jeter les cartons dans la poubelle noire',
    dist2: 'déposer les journaux dans le bac brun',
    kw: 'cartons',
  },
  {
    text: 'placer les boîtes en carton pliées dans le bac de tri',
    opt: 'ranger les cartons pliés dans le bac de tri',
    dist1: 'mettre les cartons pliés dans le sac noir',
    dist2: 'déposer les boîtes dans le bac à compost',
    kw: 'carton',
  },
  {
    text: 'jeter les feuilles de papier usagées dans le bac bleu',
    opt: 'déposer le papier de bureau dans le bac bleu',
    dist1: 'jeter les feuilles dans la poubelle noire',
    dist2: 'mettre le papier usagé dans le bac brun',
    kw: 'papier',
  },
  {
    text: 'regrouper les revues et circulaires dans le bac bleu',
    opt: 'mettre revues et circulaires au bac bleu',
    dist1: 'jeter les revues dans la poubelle ordinaire',
    dist2: 'déposer les circulaires dans le bac brun',
    kw: 'revues',
  },
]
const N4_RECYCLE_WASHES = [
  { text: 'rincer les contenants en plastique et boîtes de conserve', opt: 'rincer boîtes de conserve et plastiques', kw: 'plastique' },
  { text: 'laver brièvement les bouteilles en verre avant le dépôt', opt: 'rincer les bouteilles en verre d’avance', kw: 'verre' },
  { text: 'enlever les bouchons et vider les pots de plastique', opt: 'vider et déboucher les pots de plastique', kw: 'pots' },
  { text: 'nettoyer les barquettes en aluminium avant le recyclage', opt: 'nettoyer les barquettes en aluminium', kw: 'aluminium' },
]
const N4_RECYCLE_WASTES = [
  { text: 'fermer hermétiquement le sac noir de déchets ménagers', opt: 'fermer le sac noir de déchets ménagers' },
  { text: 'déposer les restes alimentaires dans le petit bac brun', opt: 'mettre les restes dans le bac de compost' },
  { text: 'jeter les serviettes souillées à la poubelle ordinaire', opt: 'jeter les papiers souillés à la poubelle' },
  { text: 'attacher le sac poubelle avant la descente au local', opt: 'attacher le sac poubelle avant la descente' },
]
const N4_RECYCLE_HEADS = [
  'Guide du tri des matières résiduelles.',
  'Consignes écologiques de l’immeuble.',
  'Règles de recyclage pour les résidents.',
  'Avis concernant la gestion des déchets.',
]
const N4_RECYCLE_DAYS = [
  'Le ramassage municipal a lieu le jeudi matin.',
  'Les bacs doivent être sortis le mercredi soir.',
  'La collecte se déroule tôt chaque vendredi.',
  'Sortez vos matières avant sept heures le matin.',
]

export const N04_R_4 = [
  // Scenario 1 (Template, situation: 0) - Tâches de travail journalières
  Object.assign(
    (rand) => {
      const t1 = pick(N4_WORK_TASKS_1, rand)
      const t2 = pick(N4_WORK_TASKS_2, rand)
      const t3 = pick(N4_WORK_TASKS_3, rand)
      const head = pick(N4_WORK_HEADS, rand)
      const signoff = pick(N4_WORK_SIGNOFFS, rand)
      const others1 = sample(N4_WORK_TASKS_1.filter((x) => x.opt !== t1.opt), 2, rand)
      const others2 = sample(N4_WORK_TASKS_2.filter((x) => x.opt !== t2.opt), 2, rand)
      const text = `${head} Bonjour à tous. Voici vos priorités aujourd’hui : premièrement, ${t1.text}. Deuxièmement, avant midi, ${t2.text}. Troisièmement, en fin de journée, ${t3.text}. ${signoff}`
      return {
        text,
        questions: [
          q('Quelle est la première tâche urgente à accomplir le matin ?', t1.opt, others1[0].opt, others1[1].opt, [t1.kw]),
          q('Quelle obligation doit être finalisée avant la pause de midi ?', t2.opt, others2[0].opt, others2[1].opt, [t2.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_WORK_TASKS_1.length * N4_WORK_TASKS_2.length * N4_WORK_TASKS_3.length * N4_WORK_HEADS.length * N4_WORK_SIGNOFFS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Procédure de téléversement en ligne
  Object.assign(
    (rand) => {
      const f = pick(N4_DRIVE_FOLDERS, rand)
      const sub = pick(N4_DRIVE_SUBS, rand)
      const fmt = pick(N4_DRIVE_FORMATS, rand)
      const btn = pick(N4_DRIVE_BUTTONS, rand)
      const step = pick(N4_DRIVE_STEPS, rand)
      const conf = pick(N4_DRIVE_CONFS, rand)
      const othersF = sample(N4_DRIVE_FOLDERS.filter((x) => x.opt !== f.opt), 2, rand)
      const othersB = sample(N4_DRIVE_BUTTONS.filter((x) => x.opt !== btn.opt), 2, rand)
      const text = `${step} Connectez-vous d’abord avec vos identifiants d’employé. Dirigez-vous ${f.folder}. Ensuite, ouvrez ${sub.sub}. Glissez votre fichier ${fmt.fmt}. Pour finaliser votre transmission, ${btn.btn}. ${conf}`
      return {
        text,
        questions: [
          q('Dans quel répertoire principal faut-il classer le document ?', f.opt, othersF[0].opt, othersF[1].opt, [f.kw]),
          q('Quelle action finale permet de valider le téléversement ?', btn.opt, othersB[0].opt, othersB[1].opt, [btn.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_DRIVE_FOLDERS.length * N4_DRIVE_SUBS.length * N4_DRIVE_FORMATS.length * N4_DRIVE_BUTTONS.length * N4_DRIVE_STEPS.length * N4_DRIVE_CONFS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Préparation de salle de réunion)
  Object.assign(
    (rand) => {
      const r = pick(N4_ROOM_SETUPS, rand)
      const tech = pick(N4_ROOM_TECHS, rand)
      const ref = pick(N4_ROOM_REFRESHS, rand)
      const head = pick(N4_ROOM_HEADS, rand)
      const time = pick(N4_ROOM_TIMES, rand)
      const othersT = sample(N4_ROOM_TECHS.filter((x) => x.opt !== tech.opt), 2, rand)
      const othersR = sample(N4_ROOM_REFRESHS.filter((x) => x.opt !== ref.opt), 2, rand)
      const text = `${head} Bonjour. Pour préparer la salle de rencontre ce midi, voici la marche à suivre : premièrement, il faut ${r.text}. Deuxièmement, ${tech.text}. Troisièmement, ${ref.text}. ${time} Merci pour votre aide précieuse.`
      return {
        text,
        questions: [
          q('Quelle tâche technique doit être effectuée dans la pièce ?', tech.opt, othersT[0].opt, othersT[1].opt, [tech.kw]),
          q('Quel matériel d’accueil faut-il installer sur les tables ?', ref.opt, othersR[0].opt, othersR[1].opt, [ref.kw]),
        ],
      }
    },
    { situation: 0, capacity: N4_ROOM_SETUPS.length * N4_ROOM_TECHS.length * N4_ROOM_REFRESHS.length * N4_ROOM_HEADS.length * N4_ROOM_TIMES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Consignes de tri et recyclage)
  Object.assign(
    (rand) => {
      const rec = pick(N4_RECYCLE_STEPS, rand)
      const w = pick(N4_RECYCLE_WASHES, rand)
      const waste = pick(N4_RECYCLE_WASTES, rand)
      const head = pick(N4_RECYCLE_HEADS, rand)
      const day = pick(N4_RECYCLE_DAYS, rand)
      const othersW = sample(N4_RECYCLE_WASHES.filter((x) => x.opt !== w.opt), 2, rand)
      const text = `${head} Pour assurer la propreté des lieux et respecter l’environnement, suivez ces étapes : d’abord, ${rec.text}. Ensuite, pensez à ${w.text}. Enfin, ${waste.text}. ${day} Merci de votre participation pour une ville plus verte.`
      return {
        text,
        questions: [
          q('Que faut-il faire avec les contenants réutilisables ou recyclables ?', w.opt, othersW[0].opt, othersW[1].opt, [w.kw]),
          q('Où les matières en papier et carton doivent-elles être déposées ?', rec.opt, rec.dist1, rec.dist2, [rec.kw]),
        ],
      }
    },
    { situation: 1, capacity: N4_RECYCLE_STEPS.length * N4_RECYCLE_WASHES.length * N4_RECYCLE_WASTES.length * N4_RECYCLE_HEADS.length * N4_RECYCLE_DAYS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Priorités pour vendredi
  {
    situation: 0,
    text: 'Liste des priorités pour la journée de vendredi. 1. Répondre aux courriels prioritaires des clients avant dix heures. 2. Téléphoner à madame Roy pour confirmer la réunion de quatorze heures. 3. Déposer les contrats signés dans le classeur de la comptabilité avant seize heures. Merci de suivre cet ordre pour respecter nos échéances.',
    questions: [
      q('Quelle tâche précise doit être exécutée avant dix heures ?', 'traiter les courriels urgents de la clientèle', 'téléphoner à madame Roy pour sa confirmation', 'classer les contrats dans le bureau comptable', ['courriels']),
      q('Pour quel motif cette liste de priorités est-elle communiquée ?', 'respecter les échéances prévues avec les clients', 'organiser un dîner de fin de semaine au bureau', 'attribuer les congés payés de la saison estivale', ['échéances']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Réservation d'un véhicule de service
  {
    situation: 1,
    text: 'Guide de réservation d’un véhicule de service. Étape 1 : Ouvrez l’application mobile et choisissez la date souhaitée. Étape 2 : Sélectionnez une voiture disponible au stationnement principal. Étape 3 : Récupérez la clé dans le boîtier mural à l’aide de votre code d’employé. Étape 4 : Notez le kilométrage sur la fiche de bord au retour.',
    questions: [
      q('Où l’employé doit-il récupérer la clé de la voiture ?', 'au boîtier mural en saisissant son code', 'au guichet de sécurité à l’entrée du garage', 'auprès du directeur du département de gestion', ['boîtier mural']),
      q('Quelle consigne finale faut-il respecter à la fin du déplacement ?', 'inscrire le kilométrage sur le carnet', 'nettoyer la carrosserie du véhicule à la main', 'remplir le réservoir d’essence au maximum', ['kilométrage']),
    ],
  },
]

const N4_CHALET_INTROS = [
  'Salut ! Pour notre fin de semaine en nature',
  'Bonjour ! Concernant notre séjour au vert',
  'Allô ! Pour notre sortie de quelques jours',
  'Salut ! Au sujet de notre projet de repos',
]
const N4_CHALET_WHOS = [
  'avec mes deux enfants',
  'avec ma conjointe',
  'avec deux collègues',
  'avec toute la famille',
]
const N4_CHALET_DESTS = [
  {
    place: 'un chalet au bord d’un lac tranquille',
    prefer: 'un quai privé pour faire du canot',
    hate: 'la présence de voisins trop bruyants',
    paraphrasePrefer: 'un quai privé au bord du lac',
    paraphraseHate: 'le bruit de voisins trop proches',
    distPrefer1: 'une salle de jeux au sous-sol',
    distPrefer2: 'un sauna chaud dans la cour',
    distHate1: 'la présence de moustiques le soir',
    distHate2: 'le manque de bois pour le feu',
    kwPrefer: 'quai',
    kwHate: 'voisins',
  },
  {
    place: 'un camp rustique dans les Laurentides',
    prefer: 'un sentier direct vers la montagne',
    hate: 'les trajets de plus de deux heures',
    paraphrasePrefer: 'un accès rapide aux sentiers',
    paraphraseHate: 'un trajet de plus de deux heures',
    distPrefer1: 'une piscine creusée chauffée',
    distPrefer2: 'un grand balcon avec barbecue',
    distHate1: 'le manque de réseau cellulaire',
    distHate2: 'l’eau froide dans la cuisine',
    kwPrefer: 'sentier',
    kwHate: 'heures',
  },
  {
    place: 'un terrain de camping en Mauricie',
    prefer: 'un grand emplacement bien ombragé',
    hate: 'payer des frais pour les douches',
    paraphrasePrefer: 'un espace de camping ombragé',
    paraphraseHate: 'payer pour utiliser la douche',
    distPrefer1: 'un terrain de soccer éclairé',
    distPrefer2: 'une épicerie sur le camping',
    distHate1: 'la proximité de la grand-route',
    distHate2: 'l’absence d’arbres sur le site',
    kwPrefer: 'ombragé',
    kwHate: 'douche',
  },
  {
    place: 'une maisonnette dans les Cantons-de-l’Est',
    prefer: 'un foyer extérieur pour les soirées',
    hate: 'les chemins de terre mal entretenus',
    paraphrasePrefer: 'un foyer extérieur en pierre',
    paraphraseHate: 'une mauvaise route de terre',
    distPrefer1: 'un garage fermé pour l’auto',
    distPrefer2: 'une cuisine moderne bien équipée',
    distHate1: 'les frais de ménage élevés',
    distHate2: 'l’arrivée avant midi pile',
    kwPrefer: 'foyer',
    kwHate: 'terre',
  },
]
const N4_CHALET_CLOSINGS = [
  'Dis-moi ce que tu en penses ce soir.',
  'Écris-moi si cela te convient aussi.',
  'Fais-moi signe si tu aimes cette idée.',
  'On réserve dès que tu me donnes ton avis.',
]

const N4_PLAN_INTROS = [
  'Avis de notre client : J’utilise depuis six mois',
  'Commentaire de l’usager : J’ai pris il y a six mois',
  'Témoignage reçu du client : J’ai choisi récemment',
  'Retour d’expérience d’un abonné : J’ai souscrit',
]
const N4_PLAN_SUBS = [
  {
    service: 'le forfait internet intermédiaire à haute vitesse',
    like: 'le service à la clientèle rapide au téléphone',
    dislike: 'la hausse des tarifs après la première année',
    paraphraseLike: 'le bon soutien par téléphone',
    paraphraseDislike: 'l’augmentation du tarif annuel',
    distLike1: 'la gratuité de la borne sans fil',
    distLike2: 'la facture mensuelle par courriel',
    distDislike1: 'la lenteur du téléchargement',
    distDislike2: 'les frais fixes pour le modem',
    kwLike: 'téléphone',
    kwDislike: 'tarif',
  },
  {
    service: 'l’abonnement cellulaire avec données partagées',
    like: 'la couverture réseau stable sur la route',
    dislike: 'les frais imprévus pour les textos au loin',
    paraphraseLike: 'la bonne qualité du signal réseau',
    paraphraseDislike: 'les coûts imprévus pour les textos',
    distLike1: 'les appels illimités le soir',
    distLike2: 'la messagerie vocale comprise',
    distDislike1: 'le blocage des données le soir',
    distDislike2: 'la perte fréquente de connexion',
    kwLike: 'réseau',
    kwDislike: 'textos',
  },
  {
    service: 'le forfait combiné pour la télévision et internet',
    like: 'le grand choix de chaînes locales de nouvelles',
    dislike: 'l’engagement obligatoire de deux ans imposé',
    paraphraseLike: 'la variété des chaînes locales',
    paraphraseDislike: 'le contrat imposé de deux ans',
    distLike1: 'la qualité de l’image numérique',
    distLike2: 'l’enregistrement des émissions',
    distDislike1: 'le retard du technicien à midi',
    distDislike2: 'les frais de branchement initiaux',
    kwLike: 'chaînes',
    kwDislike: 'deux ans',
  },
  {
    service: 'l’offre de téléphonie résidentielle avec internet',
    like: 'l’installation gratuite assurée par l’agent',
    dislike: 'la boîte vocale difficile à régler au début',
    paraphraseLike: 'l’installation gratuite par un agent',
    paraphraseDislike: 'le réglage de la boîte vocale',
    distLike1: 'la clarté de la ligne au salon',
    distLike2: 'le rabais postal de bienvenue',
    distDislike1: 'la coupure du signal la nuit',
    distDislike2: 'le paiement exigé par chèque',
    kwLike: 'installation',
    kwDislike: 'boîte vocale',
  },
]
const N4_PLAN_RECOMMENDS = [
  'Dans l’ensemble, je recommande cette formule à mes proches.',
  'C’est une offre convenable malgré ce petit désagrément.',
  'Je reste satisfait de ce choix pour mon travail à la maison.',
  'Je donne une note générale très positive à cette compagnie.',
]

const N4_RENT_INTROS = [
  'Message pour une recherche de logement.',
  'Courriel envoyé au propriétaire de l’immeuble :',
  'Note pour ma future colocation en ville :',
  'Annonce de recherche de logement :',
]
const N4_RENT_APTS = [
  {
    quarter: 'le quartier Rosemont',
    prefer: 'un grand balcon privé au dernier étage',
    hate: 'les rues avec beaucoup de circulation',
    paraphrasePrefer: 'un balcon calme en hauteur',
    paraphraseHate: 'le bruit d’une forte circulation',
    distPrefer1: 'une place de stationnement couverte',
    distPrefer2: 'un casier de rangement au sous-sol',
    distHate1: 'la présence de petits commerces',
    distHate2: 'les marches d’escalier raides',
    kwPrefer: 'balcon',
    kwHate: 'circulation',
  },
  {
    quarter: 'le quartier Villeray',
    prefer: 'une salle de bain rénovée avec fenêtre',
    hate: 'les appartements mal isolés du froid',
    paraphrasePrefer: 'une salle de bain refaite à neuf',
    paraphraseHate: 'un logement mal isolé du froid',
    distPrefer1: 'une cuisine avec comptoir en bois',
    distPrefer2: 'des planchers en bois franc vernis',
    distHate1: 'un plancher qui craque un peu',
    distHate2: 'l’eau tiède dans la baignoire',
    kwPrefer: 'salle de bain',
    kwHate: 'isolé',
  },
  {
    quarter: 'le Vieux-Longueuil',
    prefer: 'une buanderie commune propre dans l’immeuble',
    hate: 'les animaux bruyants dans les corridors',
    paraphrasePrefer: 'une buanderie propre sur place',
    paraphraseHate: 'des animaux bruyants dans le couloir',
    distPrefer1: 'un système de sécurité à l’entrée',
    distPrefer2: 'un support pour vélos dans la cour',
    distHate1: 'la peinture foncée des murs',
    distHate2: 'les couloirs sans éclairage',
    kwPrefer: 'buanderie',
    kwHate: 'animaux',
  },
  {
    quarter: 'la basse-ville de Québec',
    prefer: 'la proximité des autobus et du marché',
    hate: 'les plafonds bas qui manquent de lumière',
    paraphrasePrefer: 'l’accès facile aux autobus',
    paraphraseHate: 'les pièces aux plafonds trop bas',
    distPrefer1: 'une entrée privée sur le côté',
    distPrefer2: 'une cour partagée avec verdure',
    distHate1: 'le bruit lointain des cloches',
    distHate2: 'la couleur des portes en bois',
    kwPrefer: 'autobus',
    kwHate: 'plafonds',
  },
]
const N4_RENT_CLOSINGS = [
  'Mon budget est prêt et je peux visiter dès vendredi.',
  'Je suis disponible pour une visite en fin de journée.',
  'N’hésitez pas à m’appeler pour fixer un rendez-vous.',
  'Je cherche pour le premier juillet avec de bonnes références.',
]

const N4_SNACK_INTROS = [
  'Courriel aux parents d’élèves de l’école.',
  'Message pour les collations du groupe scolaire.',
  'Note partagée entre parents bénévoles de la classe :',
  'Conseil d’une maman pour la boîte à lunch des enfants :',
]
const N4_SNACK_PICKS = [
  {
    item: 'des muffins maison aux carottes et raisins',
    like: 'ce goûter donne une bonne énergie sans excès de sucre',
    dislike: 'les barres tendres du commerce remplies de caramel',
    paraphraseLikeItem: 'des muffins aux carottes maison',
    paraphraseDislike: 'les barres sucrées du commerce',
    distItem1: 'des barres aux fruits séchés',
    distItem2: 'une compote de poires fraîches',
    distDislike1: 'les jus de fruits en carton',
    distDislike2: 'les biscuits à la confiture',
    kwItem: 'muffins',
    kwDislike: 'commerce',
  },
  {
    item: 'des bâtonnets de céleri avec du fromage doux',
    like: 'cette formule apporte des vitamines et du croquant',
    dislike: 'les croustilles très grasses vendues en sac',
    paraphraseLikeItem: 'des légumes coupés en bâtonnets',
    paraphraseDislike: 'les croustilles grasses en sac',
    distItem1: 'du pain grillé avec du fromage',
    distItem2: 'des quartiers d’oranges douces',
    distDislike1: 'les bonbons gélifiés colorés',
    distDislike2: 'les sachets de maïs soufflé',
    kwItem: 'bâtonnets',
    kwDislike: 'croustilles',
  },
  {
    item: 'des galettes à l’avoine préparées avec des graines',
    like: 'ces galettes coupent la faim sans donner de fatigue',
    dislike: 'les brioches au chocolat qui fondent dans le sac',
    paraphraseLikeItem: 'des galettes avec de l’avoine',
    paraphraseDislike: 'les brioches grasses au chocolat',
    distItem1: 'des crêpes avec de la confiture',
    distItem2: 'des carrés de céréales au miel',
    distDislike1: 'les tartes sucrées aux pommes',
    distDislike2: 'les pâtisseries à la crème',
    kwItem: 'galettes',
    kwDislike: 'brioches',
  },
  {
    item: 'des tranches de fromage avec des quartiers de pomme',
    like: 'ce duo reste frais, nourrissant et très rapide',
    dislike: 'les desserts industriels avec beaucoup de sucre',
    paraphraseLikeItem: 'des morceaux de pomme et fromage',
    paraphraseDislike: 'les desserts trop industriels',
    distItem1: 'des craquelins au blé complet',
    distItem2: 'un petit pot de yaourt crémeux',
    distDislike1: 'les boissons gazeuses sucrées',
    distDislike2: 'les sacs de croustilles salées',
    kwItem: 'fromage',
    kwDislike: 'industriels',
  },
]
const N4_SNACK_CLOSINGS = [
  'C’est parfait pour la récréation du matin.',
  'Les élèves terminent toujours leur portion.',
  'On peut préparer les portions la veille au soir.',
  'Ça évite le gaspillage pendant la pause.',
]

export const N04_R_5 = [
  // Scenario 1 (Template, situation: 0) - Location de chalet ou camp en plein air
  Object.assign(
    (rand) => {
      const intro = pick(N4_CHALET_INTROS, rand)
      const who = pick(N4_CHALET_WHOS, rand)
      const dest = pick(N4_CHALET_DESTS, rand)
      const closing = pick(N4_CHALET_CLOSINGS, rand)
      const text = `${intro} ${who}, je préfère réserver ${dest.place}. Le point essentiel pour moi, c’est ${dest.prefer}. Par contre, je déteste ${dest.hate}. C’est important d’être au calme pour bien relaxer. ${closing}`
      return {
        text,
        questions: [
          q('Quel critère le message privilégie-t-il pour le séjour ?', dest.paraphrasePrefer, dest.distPrefer1, dest.distPrefer2, [dest.kwPrefer]),
          q('Quel inconvénient l’auteur souhaite-t-il absolument éviter ?', dest.paraphraseHate, dest.distHate1, dest.distHate2, [dest.kwHate]),
        ],
      }
    },
    { situation: 0, capacity: N4_CHALET_INTROS.length * N4_CHALET_WHOS.length * N4_CHALET_DESTS.length * N4_CHALET_CLOSINGS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Évaluation d'un abonnement internet ou cellulaire
  Object.assign(
    (rand) => {
      const intro = pick(N4_PLAN_INTROS, rand)
      const sub = pick(N4_PLAN_SUBS, rand)
      const rec = pick(N4_PLAN_RECOMMENDS, rand)
      const text = `${intro} ${sub.service}. Ce que j’apprécie le plus, c’est ${sub.like}. Par contre, je regrette ${sub.dislike}. ${rec}`
      return {
        text,
        questions: [
          q('Quel point positif l’usager souligne-t-il dans son avis ?', sub.paraphraseLike, sub.distLike1, sub.distLike2, [sub.kwLike]),
          q('Quel point faible est mentionné au sujet de ce forfait ?', sub.paraphraseDislike, sub.distDislike1, sub.distDislike2, [sub.kwDislike]),
        ],
      }
    },
    { situation: 1, capacity: N4_PLAN_INTROS.length * N4_PLAN_SUBS.length * N4_PLAN_RECOMMENDS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Recherche d'appartement calme)
  Object.assign(
    (rand) => {
      const intro = pick(N4_RENT_INTROS, rand)
      const apt = pick(N4_RENT_APTS, rand)
      const closing = pick(N4_RENT_CLOSINGS, rand)
      const text = `${intro} Bonjour, je cherche un logement dans ${apt.quarter}. Pour moi, l’élément prioritaire reste ${apt.prefer}. En revanche, je refuse ${apt.hate}. J’aime avoir un endroit paisible pour étudier le soir. ${closing}`
      return {
        text,
        questions: [
          q('Quelle caractéristique du logement est prioritaire pour la personne ?', apt.paraphrasePrefer, apt.distPrefer1, apt.distPrefer2, [apt.kwPrefer]),
          q('Quel désagrément la personne refuse-t-elle absolument ?', apt.paraphraseHate, apt.distHate1, apt.distHate2, [apt.kwHate]),
        ],
      }
    },
    { situation: 0, capacity: N4_RENT_INTROS.length * N4_RENT_APTS.length * N4_RENT_CLOSINGS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Préférences de collations d'école)
  Object.assign(
    (rand) => {
      const intro = pick(N4_SNACK_INTROS, rand)
      const snack = pick(N4_SNACK_PICKS, rand)
      const closing = pick(N4_SNACK_CLOSINGS, rand)
      const text = `${intro} Pour les collations de l’école, je préfère cuisiner ${snack.item}. Le grand avantage, c’est que ${snack.like}. Par contre, j’évite toujours ${snack.dislike}. C’est bien plus sain pour les enfants. ${closing}`
      return {
        text,
        questions: [
          q('Quelle collation maison la personne conseille-t-elle de préparer ?', snack.paraphraseLikeItem, snack.distItem1, snack.distItem2, [snack.kwItem]),
          q('Que cherche-t-elle à éviter dans la boîte à lunch ?', snack.paraphraseDislike, snack.distDislike1, snack.distDislike2, [snack.kwDislike]),
        ],
      }
    },
    { situation: 1, capacity: N4_SNACK_INTROS.length * N4_SNACK_PICKS.length * N4_SNACK_CLOSINGS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Recherche de camping familial pour la Saint-Jean
  {
    situation: 0,
    text: 'Message de Marc pour le camping de la Saint-Jean. Pour notre fin de semaine en famille, je préfère réserver un terrain paisible avec une grande piscine et un accès autorisé aux chiens. Par contre, je n’aime pas quand le trajet en auto dépasse deux heures depuis Montréal. On veut arriver tôt le vendredi soir pour monter la tente sans stress.',
    questions: [
      q('Qu’est-ce que Marc préfère pour ce séjour de camping ?', 'une piscine et les animaux admis', 'un grand lac avec location de canots', 'un terrain de sport avec éclairage', ['piscine']),
      q('Quel inconvénient cherche-t-il absolument à éviter ?', 'un trajet de route trop long en auto', 'les frais supplémentaires pour le bois', 'l’absence d’eau courante sur le site', ['auto']),
    ],
  },
  // Scenario 6 (Static, situation: 1) - Sondage de satisfaction sur le transport en commun
  {
    situation: 1,
    text: 'Sondage de satisfaction - Transport collectif urbain. Pour mes déplacements quotidiens vers le travail, je préfère acheter l’abonnement mensuel sur carte à puce parce que le tarif est avantageux. Par contre, je n’aime pas du tout les retards fréquents des autobus sur la ligne centrale le matin. Cela me fait parfois manquer le début de mes réunions.',
    questions: [
      q('Pourquoi cette usagère préfère-t-elle l’abonnement mensuel ?', 'pour le coût avantageux de ce forfait', 'pour la rapidité du service en soirée', 'pour la gratuité du réseau la fin de semaine', ['avantageux']),
      q('Quel point négatif déplore-t-elle au sujet du transport ?', 'les retards d’autobus en début de journée', 'le manque de propreté dans les véhicules', 'la difficulté de recharger la carte au guichet', ['retards']),
    ],
  },
]

// -------------------------------------------------------------

// Registry export for Niveaux 3 & 4
export const N03_04_SCENARIOS = {
  "n3-listening-0": N03_L_0,
  "n3-listening-1": N03_L_1,
  "n3-listening-2": N03_L_2,
  "n3-listening-3": N03_L_3,
  "n3-listening-4": N03_L_4,
  "n3-reading-0": N03_R_0,
  "n3-reading-1": N03_R_1,
  "n3-reading-2": N03_R_2,
  "n3-reading-3": N03_R_3,
  "n3-reading-4": N03_R_4,
  "n4-listening-0": N04_L_0,
  "n4-listening-1": N04_L_1,
  "n4-listening-2": N04_L_2,
  "n4-listening-3": N04_L_3,
  "n4-listening-4": N04_L_4,
  "n4-listening-5": N04_L_5,
  "n4-listening-6": N04_L_6,
  "n4-reading-0": N04_R_0,
  "n4-reading-1": N04_R_1,
  "n4-reading-2": N04_R_2,
  "n4-reading-3": N04_R_3,
  "n4-reading-4": N04_R_4,
  "n4-reading-5": N04_R_5,
}
