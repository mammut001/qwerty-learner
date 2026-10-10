// Échelle québécoise practice content scenarios for Niveaux 3 & 4.
// Covers both official situations types (examples) for every listening and reading indicator.
// All indicators yield >= 40 distinct texts across 300 seeded builds.

import { pick, sample } from './shared.mjs'

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
          ['满多少金额可以享受免费送货？', store.minZh, othersFee[0].minZh, othersFee[1].minZh],
          ['超市在哪几天安排送货？', sched.daysZh, othersSched[0].daysZh, othersSched[1].daysZh],
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
          ['单程车票的价格是多少？', transit.fareZh, othersFare[0], othersFare[1]],
          ['被介绍的通票类型是？', pass.passZh, othersPass[0].passZh, othersPass[1].passZh],
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
          ['药房满多少金额免收配送费？', pharm.minZh, othersMin[0].minZh, othersMin[1].minZh],
          ['送药上门服务安排在哪几天？', pharm.daysZh, othersDays[0].daysZh, othersDays[1].daysZh],
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
          ['居民办理图书借阅的年费是？', lib.feeZh, othersFee[0].feeZh, othersFee[1].feeZh],
          ['读者一次最多可以借多少书？', lib.limitZh, othersLimit[0].limitZh, othersLimit[1].limitZh],
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
      ['最低购物金额是多少才能送货？', '60 加元', '40 加元', '80 加元'],
      ['超市哪几天提供送货服务？', '周一至周五', '周二至周六', '仅限双休日'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Titres de transport autobus et métro
  {
    situation: 1,
    text: 'Bonjour madame. Pour circuler dans l’autobus et le métro, vous pouvez acheter un titre de deux passages à sept dollars. C’est valide durant deux heures après la première validation.',
    questions: [
      ['购买两次票的价格是多少？', '7,00 加元', '5,00 加元', '9,00 加元'],
      ['车票验证后的有效时长是？', '2 个小时', '4 个小时', '1 个小时'],
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
          ['朋友需要什么方面的帮助？', `协助填写${form.topicZh}`, `协助填写${othersForm[0].topicZh}`, `协助填写${othersForm[1].topicZh}`],
          ['面对求助，合适的回答是：', 'Oui, je peux regarder avec toi.', 'Merci pour cette belle invitation.', 'Enchanté de faire votre rencontre.'],
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
          ['同事计划在周末做什么？', plan.actZh, othersPlan[0].actZh, othersPlan[1].actZh],
          ['面对询问，合适的回答是：', 'Moi, je vais me reposer à la maison.', 'À mon avis, ce projet coûte trop cher.', 'S’il vous plaît, où est la réception ?'],
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
      const text = `— Excuse-moi ${name}, est-ce que tu sais à quelle heure ferme ${off.place} aujourd’hui ? Je dois déposer une feuille importante avant mon départ.`
      return {
        text,
        questions: [
          ['说话人想打听哪个部门的下班时间？', off.placeZh, othersOff[0].placeZh, othersOff[1].placeZh],
          ['面对询问，合适的回答是：', 'Le bureau ferme à dix-sept heures.', 'Je prends un café sans sucre, merci.', 'Félicitations pour ton bon travail.'],
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
          ['同事邀请对方去哪里用餐？', lunch.placeZh, othersLunch[0].placeZh, othersLunch[1].placeZh],
          ['面对邀请，合适的回答是：', 'Avec plaisir, j’arrive dans cinq minutes.', 'Bonjour, je cherche l’arrêt d’autobus.', 'Prenez deux comprimés avant le souper.'],
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
      ['朋友在咨询关于什么的疑问？', '助学贷款申请表格', '租房合同续约条款', '驾照更新体检证明'],
      ['面对求助，合适的回答是：', 'Viens, je vais te montrer la case.', 'Merci beaucoup pour ce beau cadeau.', 'Je prends mon manteau et je sors.'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Sortie de camping dans Charlevoix
  {
    situation: 1,
    text: '— Salut Martin ! Tu as des projets pour la longue fin de semaine ? Nous partons deux jours en camping dans Charlevoix s’il fait beau. Tu viens avec nous ?',
    questions: [
      ['马丁被邀请参加什么活动？', '去夏勒瓦地区露营', '在市中心商场购物', '去市立图书馆复习'],
      ['面对邀请，合适的回答是：', 'Merci, mais j’ai déjà un engagement.', 'Le dossier est prêt sur votre bureau.', 'Prenez à droite après le feu rouge.'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-2
// ---------------------------------------------------------------------------
const N3_CLOTHES = [
  { item: 'un manteau d’hiver', colorM: 'bleu marine', colorZh: '深蓝色', feature: 'très chaud avec un capuchon', discount: 'à moitié prix', reasonZh: '半价特惠' },
  { item: 'une veste imperméable', colorM: 'noire', colorZh: '深黑色', feature: 'avec de grandes poches', discount: 'en liquidation', reasonZh: '清仓特卖' },
  { item: 'un chandail de laine', colorM: 'vert foncé', colorZh: '墨绿色', feature: 'doux et très confortable', discount: 'avec un bon rabais', reasonZh: '特价优惠' },
  { item: 'un pantalon chaud', colorM: 'gris foncé', colorZh: '深灰色', feature: 'parfait pour le froid', discount: 'en solde de saison', reasonZh: '季末折扣' },
  { item: 'un blouson d’automne', colorM: 'brun foncé', colorZh: '深棕色', feature: 'doublé en polaire douce', discount: 'avec un bon rabais', reasonZh: '换季让利' },
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
  { clinic: 'au CLSC du quartier', clinicZh: '社区综合门诊CLSC' },
  { clinic: 'à la clinique sans rendez-vous', clinicZh: '免预约家庭门诊部' },
  { clinic: 'chez son médecin de famille', clinicZh: '家庭医生私人诊所' },
  { clinic: 'au centre médical local', clinicZh: '本地综合医疗中心' },
]

const N3_APPLIANCES = [
  { item: 'une cafetière programmable', colorZh: '黑色机身', feat: 'compacte avec une verseuse en verre', useZh: '快速煮制新鲜咖啡' },
  { item: 'un grille-pain électrique', colorZh: '银灰机身', feat: 'muni de fentes très larges', useZh: '均匀烘烤各种面包' },
  { item: 'un four à micro-ondes', colorZh: '白色机身', feat: 'doté d’un affichage numérique clair', useZh: '快速加热便当餐食' },
  { item: 'un mélangeur de cuisine', colorZh: '深红机身', feat: 'équipé de lames solides en acier', useZh: '轻松搅拌新鲜果汁' },
]
const N3_APPLIANCE_STORES = ['au magasin Walmart', 'chez Canadian Tire', 'au magasin Best Buy', 'au centre d’achats']

const N3_PETS = [
  { type: 'chaton très affectueux', furZh: '灰色条纹', featZh: '活泼好动爱玩耍' },
  { type: 'chiot très énergique', furZh: '棕褐毛色', featZh: '热情开朗喜奔跑' },
  { type: 'jeune chat curieux', furZh: '黑白相间', featZh: '机警温和喜安静' },
  { type: 'petit chien joueur', furZh: '纯白毛色', featZh: '乖巧亲人爱撒娇' },
]
const N3_SHELTER_LOCS = ['de Québec', 'de Montréal', 'de Laval', 'de Sherbrooke']

export const N03_L_2 = [
  // Scenario 1 (Template, situation: 0) - Achat de vêtement chaud en solde
  Object.assign(
    (rand) => {
      const c = pick(N3_CLOTHES, rand)
      const store = pick(N3_CLOTH_STORES, rand)
      const othersColor = sample(N3_CLOTHES.filter(x => x.colorZh !== c.colorZh), 2, rand)
      const othersReason = sample(N3_CLOTHES.filter(x => x.reasonZh !== c.reasonZh), 2, rand)
      const text = `Regarde, je viens d’acheter ${c.item} ${c.colorM}. C’est ${c.feature}, parfait pour l’hiver au Québec. En plus, c’était ${c.discount} ${store}.`
      return {
        text,
        questions: [
          ['购买的衣物是什么颜色？', c.colorZh, othersColor[0].colorZh, othersColor[1].colorZh],
          ['为什么这次购物很划算？', c.reasonZh, othersReason[0].reasonZh, othersReason[1].reasonZh],
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
      const othersClinic = sample(N3_CLINIC_LIST.filter(x => x.clinicZh !== clinic.clinicZh), 2, rand)
      const text = `Notre collègue ${p.name} ne sera pas là aujourd’hui. ${p.pronoun} souffre ${p.prep}. Le médecin consulté ${clinic.clinic} lui a recommandé trois jours de repos complet au lit.`
      return {
        text,
        questions: [
          ['生病的同事出现了什么症状？', p.sympZh, othersSymp[0].sympZh, othersSymp[1].sympZh],
          ['同事去哪里看了医生？', clinic.clinicZh, othersClinic[0].clinicZh, othersClinic[1].clinicZh],
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
      const text = `J’ai acheté ${app.item} en solde ${st}. L’appareil est ${app.feat}. Il est très pratique pour la cuisine de tous les jours.`
      return {
        text,
        questions: [
          ['买到的厨房电器外观颜色是？', app.colorZh, othersColor[0].colorZh, othersColor[1].colorZh],
          ['这款电器的主要实用功能是？', app.useZh, othersUse[0].useZh, othersUse[1].useZh],
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
      const text = `Au refuge pour animaux ${loc}, nous avons choisi un ${pet.type}. Il a un beau pelage et des yeux vifs. Nous sommes ravis de l’accueillir à la maison.`
      return {
        text,
        questions: [
          ['在收容所挑选的动物毛色是？', pet.furZh, othersFur[0].furZh, othersFur[1].furZh],
          ['这只小动物表现出的性格是？', pet.featZh, othersFeat[0].featZh, othersFeat[1].featZh],
        ],
      }
    },
    { situation: 1, capacity: N3_PETS.length * N3_SHELTER_LOCS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Écharpe en laine et mitaines
  {
    situation: 0,
    text: 'J’ai acheté une écharpe en laine brune et des mitaines épaisses. Les deux articles étaient en solde à vingt dollars seulement au magasin de la rue Saint-Denis.',
    questions: [
      ['买到的围巾是什么颜色？', '棕色毛线', '黑色毛线', '深蓝毛线'],
      ['购买这两样物品共花了多少钱？', '20 加元', '35 加元', '50 加元'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Collègue atteint d'une laryngite
  {
    situation: 1,
    text: 'Marc nous a écrit ce matin. Il a une laryngite et a complètement perdu sa voix. Le médecin lui a prescrit du repos et des tisanes chaudes pour toute la semaine.',
    questions: [
      ['马克身体有什么具体不适？', '得了喉炎并且失声', '偏头痛伴随有低烧', '扭伤手腕无法写字'],
      ['医生给马克的治疗建议是？', '充分休息并喝热茶', '按时服用消炎胶囊', '佩戴护具卧床静养'],
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
  { machine: 'le lave-linge moderne', soapSlot: 'le tiroir central gradué', cycle: 'éco à l’eau froide', soapZh: '中间带刻度的小槽', cycleZh: '冷水节能环保程序' },
]
const N3_WASH_TEMPS = ['à l’eau tiède', 'à l’eau froide', 'à basse température']

const N3_WORKSHOP_AREAS = [
  { area: 'à l’atelier de menuiserie', gear: 'des lunettes de sécurité transparentes', gearZh: '透明护目安全眼镜', placeZh: '员工更衣室存物柜' },
  { area: 'au laboratoire de mécanique', gear: 'des gants de protection renforcés', gearZh: '加厚耐磨防护手套', placeZh: '车间进门处的置物台' },
  { area: 'dans la zone d’usinage', gear: 'un casque de protection antibruit', gearZh: '专用防噪安全耳罩', placeZh: '指定员工个人存物箱' },
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
          ['这种药品的服用频率是？', med.freqZh, othersFreq[0].freqZh, othersFreq[1].freqZh],
          ['药剂师给出的健康建议是？', adv.zh, othersAdv[0].zh, othersAdv[1].zh],
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
          ['开启工作设备的第一步是？', dev.step1Zh, othersStep1[0].step1Zh, othersStep1[1].step1Zh],
          ['开机后应如何登录系统？', dev.step2Zh, othersStep2[0].step2Zh, othersStep2[1].step2Zh],
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
          ['洗衣液应倒在哪个具体位置？', wm.soapZh, '洗衣机机身排水管道', '直接倒入滚筒的最底部'],
          ['建议选择哪一种洗涤程序？', wm.cycleZh, '高温强力除污清洗程序', '超高速甩干脱水程序'],
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
          ['进入工作区域前必须佩戴什么？', ws.gearZh, '轻便普通防尘棉纱口罩', '耐磨防刮保暖皮质手套'],
          ['随身背包应当放在什么地方？', ws.placeZh, '靠近生产机床的物料架', '车间大门口右侧木长椅'],
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
      ['这种止咳冲剂应该在什么时候服用？', '每天早晨起床后', '每晚睡前空腹时', '午餐正餐进食前'],
      ['冲剂每天的最高限量是多少？', '每天最多两小包', '每天最多四小包', '每天最多一整盒'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Imprimante partagée
  {
    situation: 1,
    text: 'Pour lancer l’imprimante partagée, appuie sur le bouton vert situé sur le côté droit. Attends que le voyant bleu devienne fixe avant d’envoyer ton premier document.',
    questions: [
      ['开启打印机应按下哪个按钮？', '右侧的绿色按钮', '左侧的红色开关', '顶部的黄色旋钮'],
      ['什么时候才可以发送打印文件？', '蓝色指示灯常亮时', '黄色警报灯闪烁时', '红色按键弹起之后'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-listening-4
// ---------------------------------------------------------------------------
const N3_COMPLIMENTS = [
  { item: 'ton veston bleu', adj: 'très élégant', itemZh: '蓝色外套', effectZh: '显得大方得体' },
  { item: 'ta chemise blanche', adj: 'vraiment impeccable', itemZh: '白色衬衫', effectZh: '显得干净整洁' },
  { item: 'ta belle veste', adj: 'très soignée', itemZh: '漂亮的夹克', effectZh: '很有职业精神' },
  { item: 'ton joli foulard', adj: 'superbe', itemZh: '好看的围巾', effectZh: '显得现代大方' },
  { item: 'ton pull en laine', adj: 'très chic', itemZh: '羊毛毛衣', effectZh: '款式大方端庄' },
]
const N3_MEETINGS = [
  'pour la réunion de ce matin',
  'pour notre rencontre d’équipe',
  'pour la visite des nouveaux clients',
  'pour la formation de cet après-midi',
]

const N3_CHEERS = [
  { condition: 'ta vilaine grippe', conditionZh: '患严重季节性流感', wish: 'un prompt rétablissement', wishZh: '祝早日恢复健康' },
  { condition: 'ton opération récente', conditionZh: '刚做完微创手术', wish: 'une douce convalescence', wishZh: '祝安心平稳休养' },
  { condition: 'ta grosse bronchite', conditionZh: '患急性支气管炎', wish: 'un bon rétablissement', wishZh: '祝早日康复如初' },
  { condition: 'tes douleurs au dos', conditionZh: '背部肌肉拉伤酸痛', wish: 'beaucoup de repos', wishZh: '祝好好放松休息' },
]

const N3_EXAM_SUCCESSES = [
  { exam: 'pratique de conduite', task: 'les manœuvres de stationnement', passZh: '通过了路考拿到驾照' },
  { exam: 'de français professionnel', task: 'la compréhension orale', passZh: '通过了职业法语考试' },
  { exam: 'd’admission au cégep', task: 'toutes les épreuves écrites', passZh: '顺利通过了学院统考' },
  { exam: 'de certification comptable', task: 'les exercices financiers', passZh: '考取了专业资格证书' },
]

const N3_NEWCOMERS = [
  { name: 'Antoine', dept: 'de service', deptZh: '热烈欢迎加入工作团队' },
  { name: 'Thomas', dept: 'des finances', deptZh: '热烈欢迎加入财务团队' },
  { name: 'Nicolas', dept: 'des admissions', deptZh: '热烈欢迎加入招生团队' },
  { name: 'Gabriel', dept: 'de la logistique', deptZh: '热烈欢迎加入后勤团队' },
]

export const N03_L_4 = [
  // Scenario 1 (Template, situation: 0) - Compliment tenue
  Object.assign(
    (rand) => {
      const c = pick(N3_COMPLIMENTS, rand)
      const m = pick(N3_MEETINGS, rand)
      const othersItem = sample(N3_COMPLIMENTS.filter(x => x.itemZh !== c.itemZh), 2, rand)
      const othersEffect = sample(N3_COMPLIMENTS.filter(x => x.effectZh !== c.effectZh), 2, rand)
      const text = `Wow, ${c.item} est ${c.adj} ! Cela te va à merveille ${m}. Tu fais une excellente impression auprès de toute l’équipe aujourd’hui.`
      return {
        text,
        questions: [
          ['说话人赞赏了对方的什么穿着？', c.itemZh, othersItem[0].itemZh, othersItem[1].itemZh],
          ['同事表达的核心赞赏意思是？', c.effectZh, othersEffect[0].effectZh, othersEffect[1].effectZh],
        ],
      }
    },
    { situation: 0, capacity: N3_COMPLIMENTS.length * N3_MEETINGS.length }
  ),
  // Scenario 2 (Template, situation: 1) - Vœux de bon rétablissement
  Object.assign(
    (rand) => {
      const ch = pick(N3_CHEERS, rand)
      const p = pick(['Mélanie', 'Amadou', 'Sofia', 'Émile', 'Karim', 'Lucia'], rand)
      const othersWish = sample(N3_CHEERS.filter(x => x.wishZh !== ch.wishZh), 2, rand)
      const othersCond = sample(N3_CHEERS.filter(x => x.conditionZh !== ch.conditionZh), 2, rand)
      const text = `Chère ${p}, j’ai appris pour ${ch.condition}. Je te souhaite ${ch.wish}. Prends tout ton temps pour te soigner. Reviens-nous en pleine forme !`
      return {
        text,
        questions: [
          ['朋友发来这段问候的主要内容是？', ch.wishZh, othersWish[0].wishZh, othersWish[1].wishZh],
          ['朋友得知对方出现了什么状况？', ch.conditionZh, othersCond[0].conditionZh, othersCond[1].conditionZh],
        ],
      }
    },
    { situation: 1, capacity: 6 * N3_CHEERS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant / NEW SITUATION: Examen réussi)
  Object.assign(
    (rand) => {
      const ex = pick(N3_EXAM_SUCCESSES, rand)
      const othersPass = sample(N3_EXAM_SUCCESSES.filter(x => x.passZh !== ex.passZh), 2, rand)
      const text = `Bravo pour ton examen ${ex.exam} ! Tu as tellement pratiqué ${ex.task} ces dernières semaines. Je suis vraiment fier de ton beau succès.`
      return {
        text,
        questions: [
          ['朋友发来祝贺的具体事情是？', ex.passZh, othersPass[0].passZh, othersPass[1].passZh],
          ['说话人对这个结果有什么评价？', '对努力付出的认可', '靠运气通过的侥幸', '过程准备得太匆忙'],
        ],
      }
    },
    { situation: 0, capacity: N3_EXAM_SUCCESSES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Bienvenue nouveau collègue)
  Object.assign(
    (rand) => {
      const newcomer = pick(N3_NEWCOMERS, rand)
      const othersDept = sample(N3_NEWCOMERS.filter(x => x.deptZh !== newcomer.deptZh), 2, rand)
      const text = `Bienvenue dans notre équipe, ${newcomer.name} ! Nous sommes tous très heureux de t’accueillir dans la division ${newcomer.dept}. Prends bien tes repères et passe une agréable première journée.`
      return {
        text,
        questions: [
          ['同事向新员工表达了什么心意？', newcomer.deptZh, othersDept[0].deptZh, othersDept[1].deptZh],
          ['同事希望对方在第一天怎样？', '轻松适应新的工作环境', '立即起草一份业务方案', '独立处理客户投诉案件'],
        ],
      }
    },
    { situation: 1, capacity: N3_NEWCOMERS.length }
  ),
  // Scenario 5 (Static, situation: 0) - Félicitations promotion & veston
  {
    situation: 0,
    text: 'Félicitations pour ta promotion ! Ton nouveau veston bleu marine est très classe et s’accorde parfaitement à tes nouvelles fonctions. Tu as fière allure !',
    questions: [
      ['说话人称赞了同事的什么着装？', '深蓝色的西装外套', '质地轻薄的长袖衫', '剪裁合身的长裤子'],
      ['« Tu as fière allure » 的意思是：', '你看起来气派精神', '你走起路来很迅速', '你穿着打扮太随意'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Vœux après opération du genou
  {
    situation: 1,
    text: 'Coucou Julie ! Je viens aux nouvelles après ton opération du genou. J’espère que tu as moins mal. Reste bien tranquille à la maison et reviens en pleine forme !',
    questions: [
      ['朋友为什么发来这段慰问？', '得知对方刚做膝盖手术', '听说对方准备外出旅行', '祝贺对方喜迁全新住所'],
      ['朋友希望朱莉怎样休养？', '安心在家休养到康复', '每天坚持在户外快走', '尽快回单位报到上班'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-0
// ---------------------------------------------------------------------------
export const N03_R_0 = [
  // Scenario 1 (Template, situation: 0) - Rencontre parents-enseignant
  Object.assign(
    (rand) => {
      const school = pick(['Saint-Jean-Baptiste', 'Marguerite-Bourgeoys', 'Jacques-Cartier', 'Sainte-Bernadette'], rand)
      const date = pick(['le 14 octobre', 'le 18 novembre', 'le 22 octobre', 'le 12 novembre'], rand)
      const rsvp = pick(['le 10 octobre', 'le 12 novembre', 'le 17 octobre', 'le 7 novembre'], rand)
      const text = `École primaire ${school}. Rencontre individuelle parents-enseignants : ${date}, de 17 h à 20 h, au gymnase de l’école. Veuillez confirmer votre présence auprès du secrétariat avant ${rsvp}. Le stationnement est gratuit pour les familles.`
      return {
        text,
        questions: [
          ['De quel évènement s’agit-il dans cet avis ?', 'la rencontre parents-enseignant', 'la sortie scolaire au grand musée', 'la fête de quartier pour l’école'],
          ['Avant quelle date doit-on confirmer sa venue ?', `avant ${rsvp}`, 'avant le trente décembre prochain', 'avant le premier septembre entier'],
        ],
      }
    },
    { situation: 0, capacity: 64 }
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
          ['Quelle annonce municipale est présentée dans le texte ?', 'le lancement d’un marché local', 'la fermeture d’un parc aquatique', 'des travaux dans le quartier est'],
          ['Quels jours le marché accueille-t-il le public ?', 'les samedis et les dimanches', 'tous les mercredis après-midi', 'chaque vendredi soir seulement'],
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
          ['Quel équipement est obligatoire pour nager ?', 'un bonnet de bain', 'des lunettes de plongée', 'un maillot avec dossard'],
          ['Quel est le tarif d’entrée pour un adulte ?', 'quatre dollars par personne', 'dix dollars pour une personne', 'huit dollars pour une personne'],
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
          ['Quel est le sujet de cette annonce de quartier ?', 'des ateliers d’artisanat gratuits', 'un grand festival de musique payant', 'une exposition d’œuvres d’art locales'],
          ['Où se déroulent les inscriptions le 18 octobre ?', 'dans la salle polyvalente', 'au secrétariat de l’établissement', 'dans la grande cour extérieure'],
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
      ['Quel est le but de cette assemblée générale ?', 'choisir les membres du conseil', 'organiser une fête de quartier animée', 'présenter les comptes financiers annuels'],
      ['À quelle heure débute la rencontre ?', 'à dix-neuf heures précises', 'à midi exactement sur place', 'à vingt heures de la soirée'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Dépliant marché artisanal d'automne
  {
    situation: 1,
    text: 'Ville de Montréal. Dépliant de quartier : le grand marché artisanal d’automne s’installe sur la place Simon-Valois le 20 septembre de 10 h à 17 h. Venez encourager nos artisans et créateurs québécois. Kiosques d’artisanat, musique et café chaud.',
    questions: [
      ['Quel évènement ce dépliant présente-t-il ?', 'une foire d’artisans locaux', 'un concert de musique rock', 'une course sportive à pied'],
      ['Sur quel lieu public l’évènement s’installe-t-il ?', 'sur la place Simon-Valois', 'dans la cour fermée d’une école', 'au parc public du Mont-Royal'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-1
// ---------------------------------------------------------------------------
const N3_JOBS_LIST = [
  { job: 'commis à la caisse', short: 'commis de caisse' },
  { job: 'vendeur au rayon vêtements', short: 'vendeur en rayon' },
  { job: 'commis d’épicerie', short: 'commis d’épicerie' },
  { job: 'associé au service à la clientèle', short: 'agent de service' },
]
const N3_ATTACHMENTS_LIST = [
  { att: 'votre curriculum vitæ complet', p: 'son curriculum vitæ récent' },
  { att: 'vos disponibilités de travail écrites', p: 'ses plages de travail écrites' },
  { att: 'deux références professionnelles vérifiables', p: 'deux références vérifiables' },
  { att: 'une copie de votre diplôme secondaire', p: 'la copie de son diplôme' },
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
          ['Quel document le candidat remplit-il ici ?', 'une demande d’emploi en magasin', 'un contrat de location de local', 'une facture d’électricité du mois'],
          ['Quel document d’accompagnement est exigé ?', att.p, 'un acte de vente pour un bien', 'un carnet de santé pour animal'],
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
          ['À quel service scolaire ce formulaire sert-il ?', 'au service de garde des élèves', 'au club sportif de fin d’année', 'aux sorties scolaires du vendredi'],
          ['Quelle information sur l’enfant doit être indiquée ?', 'les allergies alimentaires', 'la pointure exacte des souliers', 'le titre du jeu vidéo préféré'],
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
          ['Pour quel service ce document est-il utilisé ?', 'l’adhésion à la bibliothèque', 'l’abonnement au centre de gym', 'l’accès à la piscine municipale'],
          ['Quelle pièce justificative doit-on présenter ?', 'une preuve d’adresse récente', 'un relevé de notes scolaires', 'une attestation d’employeur'],
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
          ['Quel type d’inscription cette fiche permet-elle ?', 'une activité sportive pour enfant', 'un voyage scolaire à l’étranger', 'un cours de musique pour adulte'],
          ['Quel renseignement d’urgence est demandé ?', 'le contact d’un proche responsable', 'le numéro de permis de conduire', 'le groupe sanguin des parents'],
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
      ['Pour quel type de commerce ce formulaire est-il conçu ?', 'un supermarché d’alimentation', 'une pharmacie de quartier', 'une quincaillerie de banlieue'],
      ['Que doivent préciser les candidats qui étudient ?', 'leurs heures de cours la semaine', 'leurs résultats aux examens', 'la liste des livres achetés'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Camp de jour estival
  {
    situation: 1,
    text: 'Service des loisirs municipaux. Formulaire de camp de jour estival. Prénom et nom du jeune : … Âge : … Allergies aux piqûres d’insectes : … Prise de médicaments pendant le séjour : oui / non. Contact d’urgence et numéro de cellulaire : …',
    questions: [
      ['Pour quelle activité estivale ce formulaire est-il requis ?', 'le camp de jour municipal', 'les cours de natation d’été', 'la sortie au parc d’attractions'],
      ['Quelle information médicale particulière est relevée ?', 'la réaction aux piqûres d’insectes', 'le type de brosse à dents utilisée', 'le groupe sanguin des voisins'],
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
        { skill: 'ponctualité et esprit d’équipe', exp: 'une année d’expérience souhaitée' },
        { skill: 'bon entregent et rigueur', exp: 'aucune expérience requise' },
        { skill: 'bonne forme et autonomie', exp: 'expérience en manutention un atout' },
      ], rand)
      const text = `Offre d’emploi. Titre du poste : ${role}. Profil recherché : personne dynamique démontrant ${req.skill}. Exigences : ${req.exp}. Disponibilité demandée du lundi au vendredi, 35 heures par semaine. Envoyez votre candidature à rh@entreprise.ca.`
      return {
        text,
        questions: [
          ['Quel est le poste proposé dans cette annonce ?', role, 'Comptable d’entreprise', 'Directeur du personnel'],
          ['Quelle qualité essentielle est recherchée pour ce rôle ?', req.skill, 'connaissance du droit fiscal', 'expérience de dix ans'],
        ],
      }
    },
    { situation: 0, capacity: 9 }
  ),
  // Scenario 2 (Template, situation: 1) - Appartement à louer
  Object.assign(
    (rand) => {
      const type = pick(['Beau quatre et demie', 'Grand trois et demie', 'Spacieux cinq et demie'], rand)
      const area = pick(['dans Rosemont', 'à Sainte-Foy', 'dans Saint-Sauveur', 'près du métro Jarry'], rand)
      const rent = pick(['1 180 $ par mois', '1 250 $ par mois', '1 350 $ par mois', '1 050 $ par mois'], rand)
      const text = `À louer : ${type} ensoleillé ${area}. Loyer de ${rent}. Deux chambres fermées, planchers de bois franc, salle de bain rénovée et balcon privé. Entrée laveuse-sécheuse incluse. Chauffage non inclus. Chats acceptés, non-fumeur. Disponible dès le 1er juillet.`
      return {
        text,
        questions: [
          ['Combien coûte le loyer de ce logement ?', rent, '2 500 $ par mois', '450 $ par mois'],
          ['Quelle caractéristique intérieure est mentionnée ?', 'planchers en bois et balcon privé', 'cour arrière avec deux piscines', 'salle de cinéma au sous-sol'],
        ],
      }
    },
    { situation: 1, capacity: 48 }
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
          ['Quel article d’occasion est proposé à la vente ?', 'un vélo de route pour adulte', 'une trottinette tout-terrain', 'un appareil de musculation'],
          ['Quel accessoire est inclus avec l’article vendu ?', 'un casque et un antivol solide', 'une pompe et deux sacoches', 'un phare avant et un compteur'],
        ],
      }
    },
    { situation: 0, capacity: 16 }
  ),
  // Scenario 4 (Template, situation: 1 variant / NEW SITUATION: Recherche de colocataire)
  Object.assign(
    (rand) => {
      const q = pick(['dans Rosemont', 'dans Limoilou', 'sur le Plateau', 'près du métro Jarry'], rand)
      const rent = pick(['650 $ par mois', '680 $ par mois', '620 $ par mois', '700 $ par mois'], rand)
      const text = `Recherche colocataire pour grand appartement ${q}. Chambre privée lumineuse avec placard, cuisine tout équipée et salon partagé. Ambiance calme et respectueuse. Loyer de ${rent} tout compris. Libre dès le mois prochain.`
      return {
        text,
        questions: [
          ['Que propose l’annonceur de ce message ?', 'une chambre privée en colocation', 'un studio meublé pour famille', 'un bureau commercial partagé'],
          ['Quel type d’ambiance est recherché dans le logement ?', 'un milieu calme et respectueux', 'des fêtes chaque fin de semaine', 'un atelier ouvert aux clients'],
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
      ['Dans quel organisme ce poste est-il offert ?', 'dans un service de garde d’enfants', 'dans une école secondaire publique', 'dans une clinique médicale de jour'],
      ['Quelle attestation médicale est formellement exigée ?', 'une formation en premiers soins', 'un permis de conduire camion', 'un brevet de pilote d’avion'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Annonce immobilière Limoilou
  {
    situation: 1,
    text: 'Annonce immobilière : superbe quatre et demie rénové dans Limoilou au rez-de-chaussée d’un triplex paisible. Grande cour arrière clôturée, cuisine moderne avec lave-vaisselle fourni, stationnement déneigé en hiver. Loyer de 1 290 dollars. Dossier de crédit demandé.',
    questions: [
      ['Quel équipement ménager est fourni dans la cuisine ?', 'un lave-vaisselle moderne', 'un four à micro-ondes neuf', 'une cafetière programmable'],
      ['Quel aménagement extérieur est mentionné pour l’hiver ?', 'un stationnement déneigé', 'une patinoire privée en bois', 'une terrasse chauffée fermée'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-3
// ---------------------------------------------------------------------------
const N3_CLEANERS_DATA = [
  { name: 'Nettoyant multi-surfaces écologique', action: 'Vaporiser à vingt centimètres.', actP: 'vaporiser à courte distance', wait: 'Laisser agir deux minutes.', wipe: 'Essuyer avec un chiffon en microfibre.', warn: 'Ne jamais mélanger avec de la Javel.', warnP: 'ne pas mélanger avec la Javel' },
  { name: 'Désinfectant doux pour la cuisine', action: 'Appliquer sur une éponge propre.', actP: 'mettre le produit sur l’éponge', wait: 'Laisser reposer trois minutes.', wipe: 'Rincer ensuite à l’eau claire.', warn: 'Conserver hors de portée des enfants.', warnP: 'garder hors de portée des petits' },
  { name: 'Dégraissant puissant pour cuisinière', action: 'Verser quelques gouttes sur la tache.', actP: 'verser le produit sur la tache', wait: 'Attendre cinq minutes.', wipe: 'Frotter avec un linge doux.', warn: 'Éviter tout contact avec les yeux.', warnP: 'ne pas mettre dans les yeux' },
  { name: 'Savon liquide pour planchers', action: 'Diluer deux bouchons dans de l’eau.', actP: 'diluer la dose dans de l’eau', wait: 'Passer une vadrouille bien essorée.', wipe: 'Laisser sécher à l’air libre.', warn: 'Ne pas appliquer sur du bois brut.', warnP: 'ne pas mettre sur du bois brut' },
]
const N3_CLEANER_BRANDS = ['Éco-Ménage', 'Net-Maison', 'Pur-Québec', 'Bio-Propre']

const N3_PHARMA_DATA = [
  { med: 'Comprimés contre le rhume', dose: 'Prendre un comprimé aux six heures.', doseP: 'un comprimé toutes les six heures', max: 'Ne pas dépasser quatre prises par jour.', dur: 'cinq jours consécutifs', store: 'Garder dans un endroit sec.', storeP: 'garder au sec et loin du soleil' },
  { med: 'Sirop contre la toux sèche', dose: 'Prendre une cuillère matin et soir.', doseP: 'une dose le matin et le soir', max: 'Ne pas dépasser deux cuillères en 24 heures.', dur: 'sept jours au besoin', store: 'Conserver la bouteille bien fermée.', storeP: 'bien fermer la bouteille au sec' },
  { med: 'Gélules pour la digestion', dose: 'Prendre deux gélules au milieu du repas.', doseP: 'avaler deux capsules en mangeant', max: 'Ne pas prendre plus de quatre gélules par jour.', dur: 'dix jours consécutifs', store: 'Mettre à l’abri de l’humidité.', storeP: 'garder au sec et à l’abri du jour' },
]
const N3_PHARMA_DURS = ['trois jours consécutifs', 'cinq jours complets', 'sept jours ouvrables', 'dix jours de suite']

const N3_APPLIANCE_CARE = [
  { app: 'cafetière électrique', product: 'vinaigre blanc', prodP: 'du vinaigre blanc ordinaire' },
  { app: 'bouilloire en inox', product: 'jus de citron dilué', prodP: 'du jus de citron naturel' },
  { app: 'fer à repasser à vapeur', product: 'eau déminéralisée', prodP: 'de l’eau déminéralisée' },
]
const N3_APPLIANCE_CARE_CYCLES = ['deux cycles complets', 'trois cycles consécutifs', 'un cycle prolongé']

const N3_RECYCLE_AREAS = ['Ville de Québec', 'Ville de Montréal', 'Ville de Laval', 'Ville de Sherbrooke']
const N3_RECYCLE_ITEMS = ['les cartons pliés', 'les bouteilles de plastique', 'les emballages métalliques']

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
          ['Quelle est la première action à réaliser ?', c.actP, 'verser dans une bouilloire avec de l’huile', 'appliquer avec force sur des habits en soie'],
          ['Quelle consigne de prudence doit-on observer ?', c.warnP, 'changer les piles chaque mois sans tarder', 'verser la bouteille entière en une fois'],
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
          ['À quelle fréquence ce médicament doit-il être pris ?', p.doseP, 'prendre toute la boîte en une seule fois', 'prendre une pleine dose chaque quart d’heure'],
          ['Quelle consigne de conservation est indiquée ?', p.storeP, 'garder le paquet sous la pluie au jardin', 'mettre les comprimés dans un four très chaud'],
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
          ['Quel produit doit-on mélanger avec de l’eau ?', care.prodP, 'du savon liquide pour vaisselle', 'du bicarbonate de soude pur'],
          ['Que faut-il faire pour bien rincer l’appareil ?', 'lancer des cycles à l’eau claire', 'essuyer l’intérieur avec un linge', 'laisser tremper pendant une journée'],
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
      const text = `${city}. Consignes municipales de recyclage. Déposez ${item} et les contenants en plastique propres dans le bac bleu. Rincez bien vos boîtes avant le dépôt. Les résidus alimentaires doivent être placés dans le bac brun.`
      return {
        text,
        questions: [
          ['Que doit-on mettre dans le bac bleu ?', 'les cartons et plastiques propres', 'les déchets alimentaires des repas', 'les vieux habits et souliers usés'],
          ['Quelle consigne s’applique aux boîtes de conserve ?', 'bien rincer avant le dépôt', 'les écraser avec un outil lourd', 'les envelopper dans du plastique'],
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
      ['Sur quelle surface ce produit s’applique-t-il ?', 'sur une vitre propre et bien sèche', 'sur un tapis de salon très humide', 'sur des casseroles en aluminium'],
      ['Quel chiffon est recommandé pour essuyer ?', 'du papier absorbant ou un linge sec', 'une serviette de bain très mouillée', 'une éponge abrasive pour plancher'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Posologie sirop pour enfants
  {
    situation: 1,
    text: 'Posologie - Sirop pour enfants de plus de six ans. Prendre une cuillère à thé toutes les huit heures après les repas. Ne pas dépasser trois prises par 24 heures. Bien agiter le flacon avant l’usage.',
    questions: [
      ['Quel est le nombre maximal de prises par jour ?', 'au maximum trois prises par jour', 'dix cuillères par journée d’école', 'une seule cuillère par fin de semaine'],
      ['Que faut-il faire avec le flacon avant l’usage ?', 'remuer la bouteille avant l’emploi', 'chauffer le liquide au micro-ondes', 'laisser la bouteille ouverte dehors'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n3-reading-4
// ---------------------------------------------------------------------------
const N3_TEXTO_DATA = [
  { friend: 'Camille', topic: 'ta présentation orale de ce matin', topicP: 'la présentation orale du matin', detail: 'Tu as parlé avec beaucoup de calme et d’assurance', detailP: 'le calme et la clarté des propos' },
  { friend: 'Valérie', topic: 'ton nouveau manteau d’automne', topicP: 'ton nouveau manteau d’automne', detail: 'La couleur te donne une mine vraiment éclatante', detailP: 'la belle couleur éclatante du tissu' },
  { friend: 'Mélanie', topic: 'tes photos de notre randonnée', topicP: 'tes jolies photos de randonnée', detail: 'Les paysages des montagnes sont magnifiques', detailP: 'les superbes vues sur la montagne' },
  { friend: 'Sophie', topic: 'ton délicieux gâteau aux pommes', topicP: 'ton bon gâteau fait maison', detail: 'Toute la famille a adoré ta recette maison', detailP: 'la recette appréciée de la famille' },
  { friend: 'Chloé', topic: 'ton joli dessin pour l’exposition', topicP: 'ton beau dessin pour l’exposition', detail: 'Les couleurs vives attirent tout de suite le regard', detailP: 'les couleurs vives qui attirent l’œil' },
]

const N3_TEXTO_CLOSINGS = [
  'Passe une très belle journée !',
  'On se reparle très vite pour un café !',
  'Félicitations encore pour ton travail !',
  'Prends bien soin de toi aujourd’hui !',
]

const N3_BIRTHDAY_DATA = [
  { colleague: 'Émile', wish: 'un très joyeux anniversaire', wishP: 'beaucoup de bonheur et une bonne santé', note: 'Profite bien de cette journée festive avec tes proches.' },
  { colleague: 'Karim', wish: 'une merveilleuse journée de fête', wishP: 'la réussite dans tous tes beaux projets', note: 'Ne pense pas aux dossiers du bureau aujourd’hui.' },
  { colleague: 'Martin', wish: 'un superbe anniversaire', wishP: 'de beaux souvenirs en famille réunis', note: 'Toute l’équipe a hâte de célébrer cela avec toi demain.' },
  { colleague: 'Sébastien', wish: 'une très belle fête', wishP: 'de la joie et de beaux succès personnels', note: 'Prends le temps de savourer chaque instant de fête.' },
  { colleague: 'Alexandre', wish: 'un chaleureux anniversaire', wishP: 'une année pleine de santé et d’énergie', note: 'Nous serons ravis de trinquer à ta santé sous peu.' },
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
  { name: 'Marianne', role: 'responsable d’équipe', roleP: 'une promotion comme chef d’équipe' },
  { name: 'Isabelle', role: 'coordonnatrice de projet', roleP: 'une nomination de coordinatrice' },
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
          ['Sur quoi porte le compliment reçu dans ce message ?', t.topicP, 'l’achat d’un camion d’occasion révisé', 'un contrat de location longue durée'],
          ['Quelle appréciation positive l’amie formule-t-elle ?', t.detailP, 'le bas prix trouvé au centre commercial', 'la rapidité d’envoi du paquet postal'],
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
      const text = `Bonjour ! De la part de toute l’équipe, je te souhaite ${b.wish}. Nous te souhaitons beaucoup de bonheur. ${b.note} ${sign}`
      return {
        text,
        questions: [
          ['Quel est le but principal de ce courriel ?', 'souhaiter un joyeux anniversaire', 'demander un rapport de travail urgent', 'annoncer une réunion de crise d’équipe'],
          ['Quels vœux bienveillants le collègue exprime-t-il ?', b.wishP, 'des heures de travail en plus le samedi', 'une baisse importante des congés payés'],
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
          ['Pourquoi l’expéditeur envoie-t-il ce message ?', 'pour remercier un ami de son aide', 'pour inviter des voisins à un concert', 'pour demander de prêter une remorque'],
          ['Quelle qualité de l’ami est soulignée dans le texte ?', 'sa bonne humeur et son dynamisme', 'sa ponctualité aux réunions du matin', 'sa connaissance des routes de la ville'],
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
          ['Quel évènement professionnel est célébré ici ?', p.roleP, 'le départ d’une collègue en voyage', 'l’arrivée d’un nouveau directeur'],
          ['Quel sentiment l’équipe exprime-t-elle dans ce message ?', 'une grande fierté et de la joie', 'une inquiétude face aux changements', 'une surprise devant cette annonce'],
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
      ['Quel article fait l’objet de ce compliment ?', 'un manteau bien adapté à la saison', 'une paire de bottes de ski alpin neuves', 'un sac à dos d’école en toile épaisse'],
      ['Qu’est-ce qui est particulièrement apprécié ?', 'la coupe moderne et la belle couleur', 'le tissu imperméable et les poches', 'la fermeture éclair solide et le col'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Anniversaire Sophie
  {
    situation: 1,
    text: 'Bonjour Sophie ! Toute l’équipe du bureau te souhaite un joyeux anniversaire. Que cette journée t’apporte joie, repos et sourires avec ta famille. On t’attend demain avec le gâteau !',
    questions: [
      ['Quelle fête les collègues célèbrent-ils par courriel ?', 'l’anniversaire de naissance de Sophie', 'la fin d’un projet important au bureau', 'le départ en vacances de leur collègue'],
      ['Qu’est-ce qui est prévu au bureau pour le lendemain ?', 'partager un gâteau avec les collègues', 'assister à une réunion de crise urgente', 'faire des heures supplémentaires le soir'],
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
  { text: 'les pièces et la main-d’œuvre à domicile', opt: 'les pièces et la main-d’œuvre' },
  { text: 'le moteur électrique et les réparations urgentes', opt: 'le moteur et les réparations' },
  { text: 'toutes les pannes mécaniques imprévues sur place', opt: 'les pannes mécaniques courantes' },
  { text: 'les fuites internes et les pièces électroniques', opt: 'les fuites et les pièces électriques' },
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
          ['Combien coûte le loyer mensuel de ce logement ?', `${rent} par mois`, `${othersRent[0]} par mois`, `${othersRent[1]} par mois`],
          ['À quelle date le contrat de location débute-t-il ?', avail, othersAvail[0], othersAvail[1]],
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
          ['Combien coûte cette protection supplémentaire ?', price, othersPrice[0], othersPrice[1]],
          ['Que comprend la couverture de ce contrat ?', cov.opt, othersCov[0].opt, othersCov[1].opt],
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
      const text = `Bonjour, ici Martin du centre Mini-Entrepôt. Je vous appelle pour le local de rangement ${unit.size} situé ${unit.street} ${unit.city}. Le coût est de ${unit.fee} par mois avec accès sécurisé tous les jours. L’espace est libre pour ${date}. Rappelez-moi au 514 555-0122 pour confirmer votre réservation de casier.`
      return {
        text,
        questions: [
          ['Quel est le tarif mensuel pour ce local de rangement ?', `${unit.fee} par mois`, `${othersUnit[0].fee} par mois`, `${othersUnit[1].fee} par mois`],
          ['À quelle date cet espace de stockage est-il libre ?', date, othersDate[0], othersDate[1]],
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
          ['Combien coûte le forfait proposé pour ce meuble ?', furn.feeOpt, othersFurn[0].feeOpt, othersFurn[1].feeOpt],
          ['À quel moment la livraison aura-t-elle lieu ?', slot.opt, othersSlot[0].opt, othersSlot[1].opt],
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
      ['Quel est le loyer mensuel du trois et demie ?', '890 dollars par mois', '940 dollars par mois', '820 dollars par mois'],
      ['Quel aménagement extérieur est inclus avec le logis ?', 'une cour arrière clôturée', 'une terrasse sur le toit', 'un grand balcon privé'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Service d'entretien de climatiseur
  {
    situation: 1,
    text: 'Pour votre nouveau climatiseur portatif, nous recommandons le plan de service de trois ans à 99 dollars. Cette garantie couvre le compresseur, la main-d’œuvre et un entretien gratuit chaque printemps. En cas de bris l’été, un technicien intervient en 48 heures ouvrables.',
    questions: [
      ['Quel est le tarif de ce plan de service ?', '99 dollars au total', '129 dollars au total', '79 dollars au total'],
      ['Quel entretien gratuit est prévu par le contrat ?', 'un entretien chaque printemps', 'une inspection chaque automne', 'un nettoyage chaque hiver'],
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
    otherOpt1: 'insérer une pièce de monnaie dans le panneau arrière',
    otherOpt2: 'appuyer sur la commande rouge d’arrêt d’urgence',
  },
  {
    machine: 'la distributrice de collations',
    card: 'ta carte magnétique',
    step2: 'tape le numéro de ton choix sur le clavier',
    button: 'sur la touche étoile pour confirmer',
    validOpt: 'taper le bon numéro et confirmer avec l’étoile',
    otherOpt1: 'redémarrer l’interrupteur général de l’appareil',
    otherOpt2: 'demander une autorisation au service technique',
  },
  {
    machine: 'la borne de recharge pour repas',
    card: 'ta carte de cantine',
    step2: 'indique le montant souhaité sur le pavé',
    button: 'sur le bouton bleu pour terminer',
    validOpt: 'indiquer le montant voulu et appuyer sur le bleu',
    otherOpt1: 'changer le câble d’alimentation de la borne',
    otherOpt2: 'laisser la carte dans le lecteur toute la nuit',
  },
  {
    machine: 'l’imprimante réseau de l’étage',
    card: 'ton badge de travail',
    step2: 'sélectionne tes documents en attente',
    button: 'sur le bouton de départ pour imprimer',
    validOpt: 'sélectionner ses documents puis lancer l’impression',
    otherOpt1: 'ouvrir le capot supérieur pour vérifier l’encre',
    otherOpt2: 'éteindre le boîtier avant chaque nouvelle page',
  },
]
const N4_COLLEAGUES = ['Sophie', 'Carlos', 'Youssef', 'Chloé', 'Amadou', 'Valérie']

const N4_DESK_REQUESTS = [
  {
    lost: 'ma carte d’accès au stationnement',
    topicOpt: 'la procédure pour remplacer sa carte d’accès',
    otherTopic1: 'le tarif mensuel pour garer son véhicule',
    otherTopic2: 'l’emplacement des bornes de recharge privées',
    answerGood: 'Remplissez ce formulaire et montrez une pièce d’identité.',
    answerWrong1: 'Merci beaucoup pour cette invitation très sympathique.',
    answerWrong2: 'Je prends un café noir sans sucre, s’il vous plaît.',
  },
  {
    lost: 'mon mot de passe pour le portail du personnel',
    topicOpt: 'la démarche pour réinitialiser son mot de passe',
    otherTopic1: 'la liste des nouveaux ordinateurs de l’entreprise',
    otherTopic2: 'l’horaire de fermeture de la salle informatique',
    answerGood: 'Entrez votre matricule et cliquez sur Réinitialiser ici.',
    answerWrong1: 'Félicitations pour votre promotion dans l’équipe.',
    answerWrong2: 'Le restaurant italien du coin est excellent le midi.',
  },
  {
    lost: 'ma carte de bibliothèque municipale',
    topicOpt: 'la marche à suivre pour obtenir une nouvelle carte',
    otherTopic1: 'le nombre de livres disponibles pour les enfants',
    otherTopic2: 'la date de la prochaine exposition de peinture',
    answerGood: 'Présentez une preuve d’adresse au bureau d’accueil.',
    answerWrong1: 'Désolé, je ne peux pas venir souper ce samedi soir.',
    answerWrong2: 'Il fait vraiment un temps magnifique aujourd’hui.',
  },
  {
    lost: 'mon formulaire d’assurance collective',
    topicOpt: 'la méthode pour envoyer son dossier d’assurance',
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
    topicOpt: 'la façon d’enregistrer une demande de vacances',
    otherTopic1: 'l’horaire de travail prévu pour le mois prochain',
    otherTopic2: 'le compte rendu officiel de la dernière assemblée',
    answerGood: 'Ouvre l’onglet Calendrier puis clique sur Nouveau.',
    answerWrong1: 'J’ai déjà réservé ma table pour le souper d’hier.',
    answerWrong2: 'Enchanté de faire votre connaissance ce matin.',
  },
  {
    task: 'soumettre une note de frais de déplacement',
    topicOpt: 'la méthode pour déclarer des dépenses de voyage',
    otherTopic1: 'le choix du moyen de transport pour la formation',
    otherTopic2: 'l’adresse exacte de l’hôtel réservé par l’agence',
    answerGood: 'Ajoute tes reçus en photo et valide le total en bas.',
    answerWrong1: 'Bonne fin de semaine et repose-toi bien surtout.',
    answerWrong2: 'Je préfère manger une salade verte pour le repas.',
  },
  {
    task: 'changer mes coordonnées bancaires pour la paie',
    topicOpt: 'la procédure pour mettre à jour ses données bancaires',
    otherTopic1: 'la date de versement de la prochaine prime annuelle',
    otherTopic2: 'le nom de l’institution financière de l’employeur',
    answerGood: 'Dépose un document bancaire dans la section Mon profil.',
    answerWrong1: 'Ce dossier volumineux est déjà prêt pour la poste.',
    answerWrong2: 'Il pleut assez fort dehors depuis ce matin tôt.',
  },
  {
    task: 'réserver une salle pour la réunion de service',
    topicOpt: 'la démarche pour réserver un local de réunion',
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
    otherTopic1: 'les horaires de la piscine pour la fin de semaine',
    otherTopic2: 'les tarifs de location de la salle des fêtes',
    answerGood: 'Remplissez la fiche jaune au secrétariat avec votre carte.',
    answerWrong1: 'J’ai acheté du pain et du lait à l’épicerie ce midi.',
    answerWrong2: 'Le train de banlieue arrive sur la voie numéro trois.',
  },
  {
    course: 'aux séances de gymnastique douce pour adultes',
    topicOpt: 'la procédure pour s’inscrire aux cours de gymnastique',
    otherTopic1: 'le règlement concernant les casiers du vestiaire',
    otherTopic2: 'la date de la fête annuelle des bénévoles du centre',
    answerGood: 'Présentez un certificat médical au comptoir de sports.',
    answerWrong1: 'Je vous envoie le rapport dès demain matin sans faute.',
    answerWrong2: 'Cette veste noire me semble un peu trop petite pour moi.',
  },
  {
    course: 'aux cours de dessin pour débutants le samedi',
    topicOpt: 'les étapes pour réserver une place en cours de dessin',
    otherTopic1: 'le nom de l’artiste invité pour l’exposition d’art',
    otherTopic2: 'le programme de musique offert durant le festival',
    answerGood: 'Inscrivez votre nom sur la liste à l’entrée de l’atelier.',
    answerWrong1: 'Prenez soin de vous et à la semaine prochaine, salut.',
    answerWrong2: 'Ma voiture est garée juste devant la porte de sortie.',
  },
  {
    course: 'aux ateliers de cuisine collective du mardi',
    topicOpt: 'la façon d’intégrer les ateliers de cuisine du centre',
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
      const text = `— Dis ${col}, tu sais comment fonctionne ${d.machine} dans la salle de pause ? Je viens d’arriver dans l’équipe et je ne l’ai jamais utilisée. J’ai ma carte en main, mais je ne sais pas sur quoi appuyer pour commander.`
      return {
        text,
        questions: [
          ['Que demande le collègue au début de la conversation ?', 'comment se servir d’un appareil partagé', 'à quelle heure commence la réunion d’équipe', 'où se trouve la salle de pause des employés'],
          ['Quelle consigne permet d’utiliser correctement l’appareil ?', d.validOpt, d.otherOpt1, d.otherOpt2],
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
          ['Quel renseignement le visiteur demande-t-il au comptoir ?', req.topicOpt, req.otherTopic1, req.otherTopic2],
          ['Quelle réponse donnée par l’agente est appropriée ?', req.answerGood, req.answerWrong1, req.answerWrong2],
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
          ['Sur quel point le collègue demande-t-il des explications ?', item.topicOpt, item.otherTopic1, item.otherTopic2],
          ['Quelle réponse de la collègue est adaptée à la demande ?', item.answerGood, item.answerWrong1, item.answerWrong2],
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
          ['Quel renseignement le citoyen demande-t-il au centre ?', item.topicOpt, item.otherTopic1, item.otherTopic2],
          ['Quelle réponse de l’employé est adaptée à la situation ?', item.answerGood, item.answerWrong1, item.answerWrong2],
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
      ['Que cherche à savoir la personne au début du message ?', 'la marche à suivre pour numériser un document', 'le prix d’une cartouche d’encre pour l’appareil', 'l’heure de ramassage du courrier par la poste'],
      ['Quelle consigne du collègue est appropriée ?', 'Sélectionne Envoi courriel et appuie sur Départ.', 'Je serais ravi de venir dîner avec vous demain.', 'Désolé, mais j’ai un rendez-vous chez le médecin.'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Remplacement d'une carte de transport défectueuse
  {
    situation: 1,
    text: '— Excusez-moi monsieur, ma carte d’autobus mensuelle ne fonctionne plus quand je la passe sur la borne ce matin. Est-ce que vous pourriez m’expliquer la procédure pour régler ce problème ? Je dois prendre l’autobus tous les jours.',
    questions: [
      ['Quelle explication l’usager demande-t-il au commis ?', 'la façon de remplacer une carte défectueuse', 'le tarif d’un billet unitaire pour le métro', 'l’horaire de passage du prochain autobus rapide'],
      ['Quelle réponse du commis est adaptée à cette situation ?', 'Montrez votre carte au guichet avec votre reçu.', 'Félicitations pour votre nouvelle maison en ville.', 'Je prends un thé à la menthe avec un peu de sucre.'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-2
// ---------------------------------------------------------------------------
const N4_HOCKEY_TEAMS = ['Toronto', 'Boston', 'Ottawa', 'Vancouver', 'New York']
const N4_HOCKEY_SHOTS = ['trente-cinq tirs difficiles', 'quarante tirs dangereux', 'vingt-huit lancers précis', 'trente-deux tirs au but']
const N4_HOCKEY_PERIODS = ['en fin de troisième période', 'au milieu de la deuxième période', 'durant la première période', 'au début du dernier tiers']
const N4_HOCKEY_OUTCOMES = ['le but gagnant en prolongation', 'la victoire avec deux buts d’avance', 'un superbe but en avantage numérique', 'le filet décisif en fin de partie']

const N4_CLINIC_ILLNESSES = [
  { name: 'une bronchite aiguë', elide: 'd’une bronchite aiguë', zh: 'une bronchite aiguë' },
  { name: 'une gastro-entérite virale', elide: 'd’une gastro-entérite virale', zh: 'une gastro-entérite virale' },
  { name: 'une infection des sinus', elide: 'd’une infection des sinus', zh: 'une infection des sinus' },
  { name: 'une forte grippe saisonnière', elide: 'd’une forte grippe saisonnière', zh: 'une forte grippe saisonnière' },
]
const N4_CLINIC_SYMPTOMS = [
  { fr: 'une fièvre modérée, des frissons et une toux sèche', zh: 'fièvre, frissons et toux sèche' },
  { fr: 'des crampes abdominales, des nausées et une grande fatigue', zh: 'crampes abdominales et nausées' },
  { fr: 'des maux de tête frontaux et le nez très congestionné', zh: 'maux de tête et nez très congestionné' },
  { fr: 'des courbatures intenses, de la fièvre et un mal de gorge', zh: 'courbatures, fièvre et mal de gorge' },
]
const N4_CLINIC_WARNINGS = [
  { text: 'ressentez de la difficulté à respirer', short: 'une difficulté respiratoire importante' },
  { text: 'avez des signes de déshydratation nette', short: 'des signes de déshydratation nette' },
  { text: 'constatez une forte enflure au visage', short: 'une forte enflure au visage' },
  { text: 'observez une hausse subite de fièvre', short: 'une hausse subite de la fièvre' },
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
  { text: 'un superbe but de la tête à la fin', opt: 'un superbe but marqué de la tête' },
  { text: 'un tir précis dans le coin du filet', opt: 'un tir très précis au fond du filet' },
  { text: 'un bel arrêt de notre gardien au penalty', opt: 'un bel arrêt sur un tir de penalty' },
  { text: 'une passe décisive de notre capitaine', opt: 'une passe parfaite de notre capitaine' },
]

const N4_PLUMBING_PROBLEMS = [
  {
    room: 'dans la cuisine',
    issue: 'le robinet de l’évier coule sans arrêt',
    measure: 'placé une grande bassine sous le meuble',
    probOpt: 'une fuite continue sous l’évier de la cuisine',
    measOpt: 'installer une bassine sous le tuyau d’eau',
    otherProb1: 'une panne de courant dans les chambres',
    otherProb2: 'une porte de balcon difficile à verrouiller',
    otherMeas1: 'laisser la fenêtre du salon grande ouverte',
    otherMeas2: 'couper l’accès à l’ascenseur de l’immeuble',
  },
  {
    room: 'dans la salle de bain',
    issue: 'le tuyau sous le lavabo fuit goutte à goutte',
    measure: 'fermé la petite valve d’arrivée d’eau',
    probOpt: 'un écoulement d’eau sous le lavabo du bain',
    measOpt: 'fermer la valve locale d’arrivée d’eau',
    otherProb1: 'une poignée d’entrée complètement bloquée',
    otherProb2: 'un rideau de douche déchiré par le vent',
    otherMeas1: 'allumer le chauffage d’appoint au maximum',
    otherMeas2: 'nettoyer le carrelage avec du savon noir',
  },
  {
    room: 'près de la laveuse',
    issue: 'le tuyau de vidange déborde sur le plancher',
    measure: 'épongé le sol et arrêté la machine',
    probOpt: 'un débordement du tuyau de vidange d’eau',
    measOpt: 'éponger le sol et éteindre l’appareil',
    otherProb1: 'un bruit de grincement dans le plancher',
    otherProb2: 'une prise murale sans tension électrique',
    otherMeas1: 'laisser tourner la machine toute la soirée',
    otherMeas2: 'ouvrir le robinet extérieur du jardinier',
  },
  {
    room: 'au sous-sol du bâtiment',
    issue: 'le chauffe-eau présente une fuite à la base',
    measure: 'déposé des linges secs autour du réservoir',
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
      const text = `— Tu as vu le match du Canadien hier soir contre ${team} ? C’était tout un spectacle ! Notre gardien a repoussé ${shots}. On a eu deux punitions ${period}, mais nos attaquants ont tenu bon et ont marqué ${outcome}. Tous les supporters fêtaient la victoire à la sortie de l’aréna.`
      return {
        text,
        questions: [
          ['Quelle performance remarquable le gardien a-t-il réalisée ?', `il a repoussé ${shots}`, 'il a concédé cinq buts rapides', 'il a été expulsé dès le début'],
          ['Quelle équipe affrontait les Montréalais lors de ce match ?', `l’équipe ${de(team)}`, 'la sélection de Philadelphie', 'la formation de Détroit'],
        ],
      }
    },
    { situation: 0, capacity: N4_HOCKEY_TEAMS.length * N4_HOCKEY_SHOTS.length * N4_HOCKEY_PERIODS.length * N4_HOCKEY_OUTCOMES.length }
  ),
  // Scenario 2 (Template, situation: 1) - Conseils médicaux et symptômes d'une maladie
  Object.assign(
    (rand) => {
      const ill = pick(N4_CLINIC_ILLNESSES, rand)
      const symp = pick(N4_CLINIC_SYMPTOMS, rand)
      const warn = pick(N4_CLINIC_WARNINGS, rand)
      const othersWarn = sample(N4_CLINIC_WARNINGS.filter((w) => w.short !== warn.short), 2, rand)
      const text = `— Bonjour monsieur. Pour traiter ${ill.name}, les symptômes habituels sont ${symp.fr}. Buvez beaucoup d’eau tiède et reposez-vous au lit pendant trois jours. En revanche, si vous ${warn.text}, appelez sans tarder le service Info-Santé 811 ou venez à la clinique d’urgence.`
      return {
        text,
        questions: [
          ['Quel conseil de base le soignant donne-t-il au patient ?', 'se reposer au lit et boire de l’eau', 'reprendre le sport de haute intensité', 'partir en long voyage dès le lendemain'],
          ['Quel signe doit pousser le patient à consulter d’urgence ?', warn.short, othersWarn[0].short, othersWarn[1].short],
        ],
      }
    },
    { situation: 1, capacity: N4_CLINIC_ILLNESSES.length * N4_CLINIC_SYMPTOMS.length * N4_CLINIC_WARNINGS.length }
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
          ['Quel a été le résultat final de cette partie amicale ?', sc.opt, 'une égalité d’un but partout', 'une défaite nette par quatre buts'],
          ['Quel fait de jeu marquant a assuré le succès de l’équipe ?', high.opt, othersHigh[0].opt, othersHigh[1].opt],
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
          ['Quel problème domestique le locataire signale-t-il ?', p.probOpt, p.otherProb1, p.otherProb2],
          ['Quelle précaution le locataire a-t-il prise immédiatement ?', p.measOpt, p.otherMeas1, p.otherMeas2],
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
      ['Quelle remontée sportive est décrite par le témoin ?', 'trois buts marqués en troisième période', 'deux pénalités évitées en fin de partie', 'un arrêt du match à cause de la glace'],
      ['Quelle ambiance régnait dans l’aréna à la fin ?', 'une ambiance formidable et très joyeuse', 'une tension inquiétante parmi la foule', 'un silence complet après la défaite locale'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Réaction cutanée après une piqûre d'insecte
  {
    situation: 1,
    text: '— À la suite de votre piqûre d’insecte, une rougeur locale et une démangeaison modérée sont normales pendant deux jours. Appliquez de la glace enveloppée dans un linge propre. Par contre, si vous observez un gonflement du visage ou une difficulté à respirer, appelez sans tarder le 911.',
    questions: [
      ['Quelle réaction cutanée est jugée normale au départ ?', 'une rougeur locale et une démangeaison', 'une perte temporaire de la vision nette', 'un engourdissement total du bras entier'],
      ['Dans quelle situation faut-il composer immédiatement le 911 ?', 'si le visage gonfle ou la respiration bloque', 'si la démangeaison continue pendant une heure', 'si la trace rouge reste visible en surface'],
    ],
  },
]

// ---------------------------------------------------------------------------
// n4-listening-3
// ---------------------------------------------------------------------------
const N4_AIRPORT_CITIES = ['de Paris', 'de Vancouver', 'de Sept-Îles', 'de Halifax', 'de Calgary']
const N4_AIRPORT_WAITS = ['pendant plus d’une heure au carrousel', 'pendant quarante-cinq minutes au débarcadère', 'pendant près d’une heure à l’arrivée', 'pendant plus d’une heure et demie']
const N4_AIRPORT_BAGS = ['ma grosse valise rouge', 'mon sac de voyage noir', 'ma valise bleue à roulettes', 'mon sac à dos vert foncé']
const N4_AIRPORT_RESOLUTIONS = [
  { text: 'la compagnie me l’a livrée le lendemain midi', opt: 'la compagnie lui a livré le lendemain midi' },
  { text: 'un livreur est passé chez moi deux jours après', opt: 'un livreur est passé à sa maison deux jours après' },
  { text: 'l’agente m’a appelé le lendemain pour la récupérer', opt: 'l’agente l’a rappelé pour la récupérer' },
  { text: 'le service des bagages l’a déposée à ma porte mardi', opt: 'le service l’a déposée à sa porte mardi' },
]

const N4_FAMILY_PARKS = [
  'au parc national de la Jacques-Cartier',
  'au parc national du Mont-Orford',
  'au parc national de la Mauricie',
  'au parc d’Oka près du grand lac',
  'au parc national du Fjord-du-Saguenay',
]
const N4_FAMILY_ACTS = [
  { act: 'louer un grand canot familial pour explorer la rivière', short: 'du canot sur la rivière en famille' },
  { act: 'faire une belle randonnée pédestre jusqu’au sommet', short: 'une randonnée pédestre jusqu’au sommet' },
  { act: 'partir en kayak de mer le long des berges rocheuses', short: 'du kayak de mer près des berges rocheuses' },
  { act: 'rouler en vélo le long des sentiers de plage', short: 'du vélo sur les sentiers de la plage' },
]
const N4_FAMILY_DETAILS = [
  { text: 'd’observer des canards sauvages et de marcher en forêt', short: 'marcher en forêt et voir des oiseaux' },
  { text: 'd’admirer la vue panoramique sur les lacs étincelants', short: 'admirer le panorama sur les lacs' },
  { text: 'de pique-niquer tranquillement au bord des cascades', short: 'manger au bord des cascades d’eau' },
  { text: 'de se baigner et de savourer de la crème glacée au soleil', short: 'se baigner et manger une glace' },
]

const N4_TRANSIT_MISHAPS = [
  {
    dest: 'au centre-ville de Montréal',
    bus: 'le mauvais autobus de banlieue',
    help: 'une chauffeuse bienveillante m’a indiqué la bonne correspondance',
    helpOpt: 'une chauffeuse lui a indiqué la correspondance',
    otherHelp1: 'un agent de police l’a reconduit en patrouille',
    otherHelp2: 'un passant lui a vendu un vieux plan de ville',
  },
  {
    dest: 'au campus de l’Université Laval',
    bus: 'le circuit d’autobus express dans la mauvaise direction',
    help: 'un étudiant sympathique m’a guidé jusqu’au bon quai',
    helpOpt: 'un étudiant l’a guidé vers le bon quai',
    otherHelp1: 'le chauffeur l’a forcé à marcher trois heures',
    otherHelp2: 'une patrouille municipale a bloqué la route',
  },
  {
    dest: 'au bureau d’accueil des nouveaux arrivants',
    bus: 'la mauvaise ligne de métro lors du transfert',
    help: 'une agente au guichet m’a imprimé le trajet complet',
    helpOpt: 'une agente lui a imprimé le bon trajet',
    otherHelp1: 'un passant l’a envoyé vers une fausse adresse',
    otherHelp2: 'le train a été annulé pour tout le reste du jour',
  },
  {
    dest: 'à mon premier appartement à Longueuil',
    bus: 'un autobus de nuit qui allait vers le terminus nord',
    help: 'un voisin de siège m’a prêté son téléphone pour m’orienter',
    helpOpt: 'un passager lui a prêté son téléphone',
    otherHelp1: 'un contrôleur lui a confisqué sa valise rouge',
    otherHelp2: 'le véhicule est tombé en panne sur l’autoroute',
  },
]

const N4_ORCHARDS = [
  { region: 'à Rougemont', fruit: 'des pommes Cortland fraîches', dessert: 'du jus de pomme chaud avec des beignes', fruitOpt: 'cueillir des pommes dans les arbres', snackOpt: 'du jus de pomme chaud et des beignes' },
  { region: 'à Saint-Joseph-du-Lac', fruit: 'des pommes McIntosh croquantes', dessert: 'une tarte aux pommes et du cidre doux', fruitOpt: 'cueillir des pommes dans le verger', snackOpt: 'de la tarte aux pommes et du cidre doux' },
  { region: 'près de l’île d’Orléans', fruit: 'des pommes Honeycrisp bien mûres', dessert: 'des chaussons aux pommes et du lait', fruitOpt: 'ramasser des pommes bien mûres', snackOpt: 'des chaussons aux pommes et du lait' },
  { region: 'dans les Cantons-de-l’Est', fruit: 'des pommes Gala très sucrées', dessert: 'du moût de pomme et du pain doré', fruitOpt: 'récolter des pommes très sucrées', snackOpt: 'du moût de pomme et du pain doré' },
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
      const text = `— Tu ne devineras jamais ce qui m’est arrivé à l’aéroport de Montréal en rentrant ${city} ! En débarquant de l’avion, j’ai guetté ${bag} ${wait}. Le carrousel s’est arrêté et elle n’est jamais sortie. J’ai fait une déclaration au comptoir. Heureusement, ${res.text} !`
      return {
        text,
        questions: [
          ['Quel incident de voyage la personne raconte-t-elle ?', 'la perte temporaire de son bagage à l’aéroport', 'l’annulation soudaine de son vol de retour', 'un oubli de portefeuille dans la salle d’attente'],
          ['Comment cette mésaventure s’est-elle finalement terminée ?', res.opt, othersRes[0].opt, othersRes[1].opt],
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
      const othersPark = sample(N4_FAMILY_PARKS.filter((p) => p !== park), 2, rand)
      const othersAct = sample(N4_FAMILY_ACTS.filter((a) => a.short !== act.short), 2, rand)
      const text = `— Samedi passé, nous avons passé une très belle journée en famille ${park}. Le matin était ensoleillé et nous avons pu ${act.act}. Les enfants ont beaucoup aimé ${det.text}. C’est vraiment un endroit idéal pour profiter du plein air en toute tranquillité.`
      return {
        text,
        questions: [
          ['Quelle activité de plein air cette famille a-t-elle pratiquée ?', act.short, othersAct[0].short, othersAct[1].short],
          ['Dans quel cadre naturel cette sortie s’est-elle déroulée ?', park, othersPark[0], othersPark[1]],
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
          ['Quelle mésaventure la personne raconte-t-elle sur son trajet ?', 'une erreur de ligne de transport en commun', 'un bris mécanique de sa voiture personnelle', 'une perte de son billet dans la station de train'],
          ['Comment la personne a-t-elle finalement trouvé son chemin ?', item.helpOpt, item.otherHelp1, item.otherHelp2],
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
          ['Quelle activité de saison la famille a-t-elle pratiquée ?', orchard.fruitOpt, 'une randonnée pédestre sur une montagne', 'une excursion de pêche sur une chaloupe'],
          ['Quelle collation ont-ils partagée à la fin de la visite ?', orchard.snackOpt, othersOrchard[0].snackOpt, othersOrchard[1].snackOpt],
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
      ['Dans quelle ville le bagage avait-il été acheminé par erreur ?', 'à Halifax au lieu de la destination', 'à Vancouver dans l’Ouest canadien', 'à Winnipeg près des grands lacs'],
      ['Quel dépannage immédiat l’agente a-t-elle fourni au passager ?', 'une trousse de toilette de dépannage', 'un remboursement complet de son billet', 'un bon de repas pour le restaurant voisin'],
    ],
  },
  // Scenario 6 (Static, situation: 1) - Sortie à la cabane à sucre
  {
    situation: 1,
    text: '— On a fait une belle sortie à la cabane à sucre avec les enfants samedi midi. On a mangé un repas traditionnel copieux : soupe aux pois, tourtière et crêpes au sirop d’érable chaud. Ensuite, les petits ont fait une promenade en traîneau dans la forêt enneigée.',
    questions: [
      ['Quel lieu traditionnel la famille a-t-elle visité ?', 'une cabane à sucre en forêt', 'une fromagerie artisanale de ferme', 'une boulangerie de quartier réputée'],
      ['Quelle activité les enfants ont-ils faite après le repas ?', 'une promenade en traîneau dans le bois', 'un cours de patinage sur l’étang gelé', 'une course en raquettes sur la montagne'],
    ],
  },
]

const N4_LEAK_PARTS = [
  { desc: 'd’un tuyau usé sous le bain', short: 'un tuyau sous le bain' },
  { desc: 'du joint du chauffe-eau', short: 'le joint du chauffe-eau' },
  { desc: 'de la tuyauterie de cuisine', short: 'la tuyauterie de cuisine' },
  { desc: 'd’une valve de radiateur', short: 'une valve de radiateur' },
]
const N4_LEAK_FLOORS = ['au dernier niveau', 'à l’étage supérieur', 'dans le logement du haut', 'à l’étage du milieu']
const N4_LEAK_ACTIONS = [
  'coupé l’arrivée d’eau principale sans tarder',
  'fermé la valve de sécurité immédiatement',
  'stoppé l’écoulement général dès ce matin',
  'fermé le robinet d’isolement d’urgence',
]
const N4_LEAK_REPAIRS = [
  'un plombier qualifié viendra changer la pièce demain matin',
  'l’artisan certifié viendra poser un raccord neuf vendredi',
  'l’équipe d’entretien remplacera le joint défectueux jeudi',
  'le spécialiste en plomberie passera dès 8 h demain matin',
]

const N4_TRAFFIC_HIGHWAYS = [
  'sur le pont Pierre-Laporte en direction nord',
  'sur l’autoroute 40 près de l’échangeur Décarie',
  'sur le pont Samuel-De Champlain vers Montréal',
  'sur l’autoroute 20 à la hauteur de Lévis',
  'sur l’autoroute 15 nord près de Laval',
]
const N4_TRAFFIC_CAUSES = [
  'une camionnette en panne bloque la voie de droite',
  'des travaux d’urgence obligent la fermeture de deux voies',
  'un accrochage entre deux voitures ralentit la circulation',
  'un camion de transport a perdu une partie de son chargement',
]
const N4_TRAFFIC_DELAYS = [
  'un retard d’au moins vingt-cinq minutes',
  'un ralentissement de trente minutes pour les usagers',
  'une attente supplémentaire de vingt minutes au total',
  'un bouchon majeur étiré sur plusieurs kilomètres',
]

export const N04_L_4 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const part = pick(N4_LEAK_PARTS, rand)
      const floor = pick(N4_LEAK_FLOORS, rand)
      const act = pick(N4_LEAK_ACTIONS, rand)
      const rep = pick(N4_LEAK_REPAIRS, rand)
      const text = `— Bonjour monsieur, c’est le concierge de l’immeuble. Je vous appelle pour vous rassurer au sujet de l’infiltration d’eau sur votre plafond. La fuite provient ${part.desc} ${floor}. J’ai personnellement ${act} pour stopper le dégât. Rassurez-vous, ${rep}. Nous vérifierons ensuite que tout est bien sec.`
      return {
        text,
        questions: [
          ['D’où provient l’écoulement d’eau selon le concierge ?', `${part.short} ${floor}`, 'une infiltration par une fenêtre mal fermée du salon', 'un débordement dans la buanderie collective du sous-sol'],
          ['Quelle mesure immédiate le concierge a-t-il prise ?', act, 'il a évacué tous les locataires de l’immeuble dehors', 'il a repeint le plafond sans attendre la fin des travaux'],
        ],
      }
    },
    { situation: 0, capacity: N4_LEAK_PARTS.length * N4_LEAK_FLOORS.length * N4_LEAK_ACTIONS.length * N4_LEAK_REPAIRS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const hwy = pick(N4_TRAFFIC_HIGHWAYS, rand)
      const cause = pick(N4_TRAFFIC_CAUSES, rand)
      const delay = pick(N4_TRAFFIC_DELAYS, rand)
      const text = `— Bulletin de circulation routière en direct. Un bouchon majeur paralyse actuellement les automobilistes ${hwy}. La cause principale : ${cause}. Les services de remorquage s’activent sur place, mais les usagers doivent prévoir ${delay}. Si possible, évitez ce secteur et empruntez un itinéraire secondaire.`
      return {
        text,
        questions: [
          ['Quel incident cause ce ralentissement de la circulation ?', cause, 'une grande manifestation piétonne autorisée occupant toute la chaussée', 'la traversée d’un très long troupeau d’animaux sur les voies rapides'],
          ['Quel temps d’attente supplémentaire doit-on anticiper ?', delay, 'un arrêt complet et indéterminé jusqu’au milieu de la nuit prochaine', 'une fermeture totale de l’axe routier durant plus de cinq heures'],
        ],
      }
    },
    { situation: 1, capacity: N4_TRAFFIC_HIGHWAYS.length * N4_TRAFFIC_CAUSES.length * N4_TRAFFIC_DELAYS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const part = pick(N4_LEAK_PARTS, rand)
      const floor = pick(N4_LEAK_FLOORS, rand)
      const act = pick(N4_LEAK_ACTIONS, rand)
      const rep = pick(N4_LEAK_REPAIRS, rand)
      const text = `— Allô madame, ici le responsable d’entretien de la copropriété. Je fais suite à votre signalement d’eau dans la salle de bain. Le bris découle ${part.desc} ${floor}. De notre côté, nous avons ${act}. Soyez sans inquiétude, ${rep} afin de régler définitivement la situation.`
      return {
        text,
        questions: [
          ['D’où provient le problème d’eau dans le bâtiment ?', `${part.short} ${floor}`, 'du système de climatisation fixé sur le toit de l’édifice', 'd’un robinet d’arrosage resté ouvert dans la cour extérieure'],
          ['Quelle intervention de réparation spécialisée est programmée ?', rep, 'la démolition complète de l’ensemble du bâtiment résidentiel', 'l’installation de nouveaux panneaux solaires sur la toiture'],
        ],
      }
    },
    { situation: 0, capacity: N4_LEAK_PARTS.length * N4_LEAK_FLOORS.length * N4_LEAK_ACTIONS.length * N4_LEAK_REPAIRS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const hwy = pick(N4_TRAFFIC_HIGHWAYS, rand)
      const cause = pick(N4_TRAFFIC_CAUSES, rand)
      const delay = pick(N4_TRAFFIC_DELAYS, rand)
      const radio = pick(['Radio-Circulation', 'Info-Trafic Québec', 'Le bulletin matinal'], rand)
      const text = `— Ici ${radio}. Prenez note d’une congestion importante ${hwy}. Un incident est survenu : ${cause}. Les policiers dirigent les voies disponibles, mais vous subirez ${delay}. Nous vous suggérons d’écouter nos mises à jour régulières.`
      return {
        text,
        questions: [
          ['Sur quelle route le bouchon de circulation est-il signalé ?', hwy, 'sur une piste cyclable municipale d’un quartier très tranquille', 'dans le stationnement souterrain réservé d’un grand centre commercial'],
          ['Quelle est la cause de ce bouchon expliquée à la radio ?', cause, 'la chute accidentelle d’un grand pylône électrique haute tension', 'une course automobile nocturne totalement interdite en centre-ville'],
        ],
      }
    },
    { situation: 1, capacity: N4_TRAFFIC_HIGHWAYS.length * N4_TRAFFIC_CAUSES.length * N4_TRAFFIC_DELAYS.length * 3 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Allô, c’est Robert, le syndic de l’immeuble. Pour la fuite dans l’entrée commune, le plombier a découvert qu’un raccord sous l’évier de la conciergerie avait cédé sous la pression. L’eau a coulé dans le faux plafond. Le robinet d’isolement a été fermé et la tuyauterie sera remplacée dès 14 h cet après-midi.',
    questions: [
      ['Quelle pièce de plomberie avait cédé selon le syndic ?', 'un raccord sous l’évier de la conciergerie', 'une canalisation d’égout municipale', 'un tuyau d’arrosage extérieur'],
      ['Quand la tuyauterie défectueuse sera-t-elle changée ?', 'dès 14 h cet après-midi', 'dans trois semaines au plus tôt', 'l’an prochain après l’hiver'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— Chronique routière de 8 h 15. La circulation est lourdement perturbée sur le pont de Québec en direction de la rive nord. Une perte de chargement de planches de bois encombre deux voies sur trois depuis une demi-heure. Les patrouilleurs nettoient la chaussée, mais comptez quarante minutes de retard.',
    questions: [
      ['Quel obstacle imprévu bloque les voies sur le pont ?', 'une perte de chargement de planches de bois', 'un camion citerne en panne de carburant', 'une tempête de grêle localisée'],
      ['Combien de voies sont encombrées par les débris ?', 'deux voies sur trois', 'toutes les voies de secours', 'une seule voie piétonne'],
    ],
  },
]

const N4_VOICEMAIL_DIGITS = ['la touche 1', 'le chiffre 2', 'la touche 8', 'le numéro 5']
const N4_VOICEMAIL_PASSWORDS = [
  'définis un code secret personnel à quatre chiffres',
  'entre un mot de passe temporaire fourni par le commis',
  'choisis une nouvelle combinaison sécurisée de chiffres',
  'compose ton code confidentiel à six chiffres',
]
const N4_VOICEMAIL_GREETINGS = [
  'enregistre ton message d’accueil après le bip sonore',
  'dicte ton prénom et ton nom distinctement au micro',
  'lis ton annonce personnalisée dans le combiné',
  'énonce tes heures de disponibilité après la tonalité',
]
const N4_VOICEMAIL_FINISHES = [
  'la touche dièse pour sauvegarder',
  'la touche étoile pour confirmer',
  'le bouton carré pour enregistrer',
  'la commande neuf pour finaliser',
]

const N4_GPS_PLACES = ['l’aréna municipal', 'le centre récréatif', 'le complexe aquatique', 'le centre communautaire', 'la bibliothèque municipale']
const N4_GPS_DISTS = ['cinq cents mètres', 'trois cents mètres', 'quatre cents mètres', 'six cents mètres']
const N4_GPS_STREETS = ['le boulevard Laurier', 'l’avenue Royale', 'le chemin Sainte-Foy', 'la route de l’Église']
const N4_GPS_TURNS = [
  'tournez à gauche sur la rue des Érables',
  'tournez à droite sur la rue Principale',
  'prenez la deuxième sortie au rond-point',
  'serrez à droite avant le grand viaduc',
]
const N4_GPS_FINALS = [
  'deux kilomètres sur votre droite',
  'un kilomètre et demi sur votre gauche',
  'trois kilomètres juste en face du parc',
  'huit cents mètres sur votre gauche',
]

export const N04_L_5 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const digit = pick(N4_VOICEMAIL_DIGITS, rand)
      const pass = pick(N4_VOICEMAIL_PASSWORDS, rand)
      const greet = pick(N4_VOICEMAIL_GREETINGS, rand)
      const fin = pick(N4_VOICEMAIL_FINISHES, rand)
      const text = `— Pour activer et personnaliser ta messagerie vocale sur ton nouveau cellulaire, voici la marche à suivre. D’abord, maintiens enfoncée ${digit} sur le pavé d’appel. Lorsque la voix automatisée t’y invite, ${pass}. Ensuite, ${greet}. Pour terminer la configuration, appuie sur ${fin}. Tes messages vocaux seront alors prêts.`
      return {
        text,
        questions: [
          ['Quelle étape doit être effectuée après l’invite vocale ?', pass, 'éteindre complètement le téléphone portable durant une heure', 'retirer définitivement la carte mémoire de l’appareil mobile'],
          ['Sur quelle touche faut-il appuyer pour terminer la configuration ?', fin, 'sur le bouton de réglage du volume sonore sur le côté', 'sur la commande d’arrêt d’urgence située à l’arrière'],
        ],
      }
    },
    { situation: 0, capacity: N4_VOICEMAIL_DIGITS.length * N4_VOICEMAIL_PASSWORDS.length * N4_VOICEMAIL_GREETINGS.length * N4_VOICEMAIL_FINISHES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const place = pick(N4_GPS_PLACES, rand)
      const dist = pick(N4_GPS_DISTS, rand)
      const street = pick(N4_GPS_STREETS, rand)
      const turn = pick(N4_GPS_TURNS, rand)
      const finDist = pick(N4_GPS_FINALS, rand)
      const text = `— Instructions de navigation en direct. Dans ${dist}, quittez la voie principale et empruntez ${street}. Au prochain carrefour avec feux de signalisation, ${turn}. Poursuivez ensuite tout droit sur environ ${finDist}. Votre destination, ${place}, apparaîtra clairement avec son stationnement public gratuit.`
      return {
        text,
        questions: [
          ['Vers quel lieu le géonavigateur guide-t-il l’automobiliste ?', `vers ${place}`, 'vers une base militaire secrète située en forêt dense', 'vers un port maritime industriel réservé aux conteneurs'],
          ['Quelle manœuvre routière le système ordonne-t-il au feu ?', turn, 'faire demi-tour immédiatement en plein milieu de la voie', 'couper le contact du moteur et attendre l’arrivée d’aide'],
        ],
      }
    },
    { situation: 1, capacity: N4_GPS_PLACES.length * N4_GPS_DISTS.length * N4_GPS_STREETS.length * N4_GPS_TURNS.length * N4_GPS_FINALS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const digit = pick(N4_VOICEMAIL_DIGITS, rand)
      const pass = pick(N4_VOICEMAIL_PASSWORDS, rand)
      const greet = pick(N4_VOICEMAIL_GREETINGS, rand)
      const fin = pick(N4_VOICEMAIL_FINISHES, rand)
      const text = `— Tu as du mal à configurer ta boîte vocale ? Écoute bien les consignes du fournisseur. Pour commencer, appuie longuement sur ${digit}. Au signal, ${pass}. Après le bip, ${greet}. N’oublie pas de presser ${fin} pour sauvegarder ton profil. Voilà, c’est réglé !`
      return {
        text,
        questions: [
          ['Comment lance-t-on le service de boîte vocale au tout début ?', `appuyer longuement sur ${digit}`, 'redémarrer l’ordinateur familial portable du salon', 'retirer complètement la batterie de l’appareil mobile'],
          ['Quelle consigne est donnée pour personnaliser le message ?', greet, 'chanter une longue chanson dans une langue étrangère', 'taper plusieurs fois sur l’écran tactile avec un crayon'],
        ],
      }
    },
    { situation: 0, capacity: N4_VOICEMAIL_DIGITS.length * N4_VOICEMAIL_PASSWORDS.length * N4_VOICEMAIL_GREETINGS.length * N4_VOICEMAIL_FINISHES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const place = pick(N4_GPS_PLACES, rand)
      const dist = pick(N4_GPS_DISTS, rand)
      const street = pick(N4_GPS_STREETS, rand)
      const turn = pick(N4_GPS_TURNS, rand)
      const finDist = pick(N4_GPS_FINALS, rand)
      const text = `— Guidage assisté par satellite. Continuez tout droit sur ${street}. Dans ${dist}, préparez-vous à tourner : ${turn}. Roulez ensuite sur ${finDist}. Vous arriverez à ${place} qui sera bien visible sur votre trajectoire. Le stationnement est situé à l’arrière.`
      return {
        text,
        questions: [
          ['Quelle rue ou route le conducteur suit-il présentement ?', street, 'une voie ferrée désaffectée traversant la banlieue', 'un sentier pédestre forestier interdit aux véhicules'],
          ['Où se trouve le stationnement à l’arrivée de la destination ?', 'le stationnement est situé à l’arrière', 'il n’existe aucun stationnement disponible dans le secteur', 'le stationnement est réservé aux camions de transport lourd'],
        ],
      }
    },
    { situation: 1, capacity: N4_GPS_PLACES.length * N4_GPS_DISTS.length * N4_GPS_STREETS.length * N4_GPS_TURNS.length * N4_GPS_FINALS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Pour écouter tes nouveaux messages vocaux de l’extérieur, compose d’abord ton propre numéro de cellulaire. Pendant la sonnerie, appuie sur la touche étoile, puis saisis ton mot de passe confidentiel à quatre chiffres. Choisis l’option 1 pour réécouter le message ou l’option 3 pour l’effacer définitivement.',
    questions: [
      ['Quelle touche faut-il presser pendant la sonnerie pour accéder aux messages ?', 'la touche étoile pendant la sonnerie', 'le bouton de volume sur le combiné', 'la touche zéro pendant dix secondes'],
      ['Quelle option permet d’effacer définitivement un message ?', 'l’option 3 pour l’effacer', 'l’option 9 pour le transférer', 'l’option 7 pour le sauvegarder'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— Guidage GPS : dans deux cents mètres, serrez à droite pour prendre la rampe d’accès vers le pont Champlain. Restez dans la voie de droite sur un kilomètre, puis prenez la première sortie vers le boulevard René-Lévesque. L’aréna se dressera sur votre gauche après le grand feu.',
    questions: [
      ['Quelle rampe d’accès le système indique-t-il d’emprunter ?', 'la rampe vers le pont Champlain', 'l’entrée vers l’autoroute des Laurentides', 'le tunnel sous-marin réservé au train'],
      ['De quel côté l’aréna apparaîtra-t-il après le grand feu ?', 'l’aréna se dressera sur la gauche', 'le complexe sera caché derrière un bois', 'le bâtiment se situera tout droit en haut'],
    ],
  },
]

const N4_OUTDOOR_ACTS = [
  { act: 'la descente en kayak sur la rivière', short: 'le kayak sur la rivière' },
  { act: 'la randonnée en raquettes dans la forêt', short: 'la raquette dans la forêt' },
  { act: 'le ski de fond dans les sentiers balisés', short: 'le ski de fond en sentier' },
  { act: 'le canot sur le lac au coucher du soleil', short: 'le canot sur le grand lac' },
]
const N4_OUTDOOR_REASONS = [
  'le calme apaisant de l’eau',
  'le silence reposant des sapins',
  'l’exercice régulier à l’air pur',
  'les superbes paysages québécois',
]
const N4_OUTDOOR_DISLIKES = [
  'le vélo de montagne salissant',
  'le patinage sur patinoire bondée',
  'la planche à neige trop fatigante',
  'la baignade en eau trop glacée',
]
const N4_OUTDOOR_TIMES = ['ce samedi matin', 'dimanche prochain', 'la fin de semaine prochaine', 'samedi après-midi']

const N4_BISTRO_PLACES = [
  'le bistro Chez Boulay sur la rue Saint-Jean',
  'le restaurant Le Cartet dans le Vieux-Montréal',
  'la brasserie artisanale Archibald à Sainte-Foy',
  'le café Le Torréfacteur sur l’avenue Maguire',
]
const N4_BISTRO_FOODS = [
  'des plats du terroir québécois de saison',
  'des brunchs gourmands et des salades fraîches',
  'des pizzas au four à bois et des burgers',
  'des sandwichs artisanaux et de bons cafés',
]
const N4_BISTRO_VIBES = [
  'l’accueil très chaleureux du personnel',
  'l’ambiance conviviale et lumineuse',
  'la musique québécoise entraînante',
  'le décor en bois chaleureux et reposant',
]
const N4_BISTRO_PRICES = [
  'tout à fait raisonnable pour la qualité',
  'vraiment honnête pour les portions servies',
  'parfaitement adapté pour un groupe d’amis',
  'très économique pour un dîner complet',
]

export const N04_L_6 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const act = pick(N4_OUTDOOR_ACTS, rand)
      const reason = pick(N4_OUTDOOR_REASONS, rand)
      const dis = pick(N4_OUTDOOR_DISLIKES, rand)
      const time = pick(N4_OUTDOOR_TIMES, rand)
      const text = `— Tu sais, pour notre escapade de fin de semaine au parc naturel, j’aime beaucoup mieux ${act.act}. Certaines personnes aiment ${dis}, mais moi je préfère de loin ${reason}. Si tu es partant pour qu’on parte ${time}, qu’est-ce que tu dirais qu’on loue cet équipement au centre récréatif ?`
      return {
        text,
        questions: [
          ['Quelle activité de plein air l’amie préfère-t-elle pour la sortie ?', act.short, 'le saut acrobatique en parachute au-dessus des montagnes', 'la plongée en scaphandre autonome au fond de l’océan'],
          ['Pourquoi cette activité a-t-elle sa nette préférence ?', `elle apprécie ${reason}`, 'ce loisir est totalement gratuit tout au long de l’année', 'l’activité se déroule dans une salle fermée et chauffée'],
        ],
      }
    },
    { situation: 0, capacity: N4_OUTDOOR_ACTS.length * N4_OUTDOOR_REASONS.length * N4_OUTDOOR_DISLIKES.length * N4_OUTDOOR_TIMES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const bistro = pick(N4_BISTRO_PLACES, rand)
      const food = pick(N4_BISTRO_FOODS, rand)
      const vibe = pick(N4_BISTRO_VIBES, rand)
      const price = pick(N4_BISTRO_PRICES, rand)
      const text = `— Dis, hier midi j’ai enfin testé ${bistro} avec mes collègues de bureau. Franchement, nous avons été conquis ! On y sert ${food}. J’ai tout particulièrement apprécié ${vibe}. En plus, le montant de l’addition était ${price}. Je te conseille vraiment de réserver une table pour cette fin de semaine.`
      return {
        text,
        questions: [
          ['Quel établissement de restauration le collègue a-t-il expérimenté ?', bistro, 'une cantine scolaire réservée aux élèves du primaire', 'un comptoir de restauration rapide le long d’une autoroute'],
          ['Qu’est-ce qui a particulièrement retenu son attention positivement ?', vibe, 'la lenteur tout à fait remarquable du service en cuisine', 'l’absence complète de chaises et de tables pour s’asseoir'],
        ],
      }
    },
    { situation: 1, capacity: N4_BISTRO_PLACES.length * N4_BISTRO_FOODS.length * N4_BISTRO_VIBES.length * N4_BISTRO_PRICES.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const act = pick(N4_OUTDOOR_ACTS, rand)
      const reason = pick(N4_OUTDOOR_REASONS, rand)
      const dis = pick(N4_OUTDOOR_DISLIKES, rand)
      const text = `— Pour notre sortie en nature avec le groupe, mon premier choix demeure sans hésiter ${act.act}. C’est certain que d’autres préfèrent d’autres sports, mais pour ma part je recherche avant tout ${reason}. En revanche, je refuse de faire ${dis}. On pourrait réserver nos places ensemble dès ce soir.`
      return {
        text,
        questions: [
          ['Quel loisir en plein air correspond le mieux aux goûts de la personne ?', act.short, 'la pêche sportive sur glace au sommet d’une haute montagne', 'l’escalade sur des parois de falaise sans aucun équipement'],
          ['Quelle activité sportive la personne rejette-t-elle expressément ?', dis, 'la marche tranquille sur le trottoir du quartier résidentiel', 'une séance de gymnastique douce au bord de l’eau en plein air'],
        ],
      }
    },
    { situation: 0, capacity: N4_OUTDOOR_ACTS.length * N4_OUTDOOR_REASONS.length * N4_OUTDOOR_DISLIKES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const bistro = pick(N4_BISTRO_PLACES, rand)
      const food = pick(N4_BISTRO_FOODS, rand)
      const vibe = pick(N4_BISTRO_VIBES, rand)
      const price = pick(N4_BISTRO_PRICES, rand)
      const text = `— Si tu cherches un endroit sympa pour souper vendredi, je te suggère les yeux fermés ${bistro}. Nous y avons passé une superbe soirée. Le menu propose ${food}. Ce qui nous a le plus charmés, c’est ${vibe}. Côté budget, le coût moyen était ${price}. C’est vraiment une excellente découverte !`
      return {
        text,
        questions: [
          ['Quels types de mets sont servis dans ce restaurant recommandé ?', food, 'des conserves froides importées par avion depuis un autre pays', 'uniquement des soupes en poudre déshydratées servies tièdes'],
          ['Quel jugement global la personne porte-t-elle sur les tarifs ?', `le tarif était ${price}`, 'l’établissement pratique des tarifs exorbitants pour ces plats', 'la direction impose un paiement en devises étrangères rares'],
        ],
      }
    },
    { situation: 1, capacity: N4_BISTRO_PLACES.length * N4_BISTRO_FOODS.length * N4_BISTRO_VIBES.length * N4_BISTRO_PRICES.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Pour les vacances d’été en famille, je préfère le camping sauvage au bord d’un lac tranquille plutôt qu’un hôtel tout compris bondé. Ce que j’aime, c’est le feu de camp le soir sous les étoiles et la baignade dès le réveil. La ville est bruyante toute l’année, j’ai besoin de calme et d’air frais.',
    questions: [
      ['Quel style de vacances la personne privilégie-t-elle en été ?', 'le camping sauvage au bord d’un lac', 'un hôtel de luxe avec centre commercial', 'un séjour dans une grande métropole'],
      ['Qu’apprécie-t-elle particulièrement lors de ce séjour ?', 'le feu de camp et la baignade matinale', 'la climatisation et la télévision par câble', 'les visites de discothèques en soirée'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— J’ai dîné à la nouvelle crêperie bretonne de la rue Saint-Denis hier avec ma cousine. Les galettes de sarrasin sont croustillantes et généreusement garnies de fromage québécois et de jambon artisanal. Le cidre artisanal local est excellent et la serveuse a été très attentionnée. Une adresse formidable à découvrir !',
    questions: [
      ['Quelle spécialité culinaire est mise à l’honneur dans cette critique ?', 'des galettes de sarrasin croustillantes', 'des sushis japonais au poisson cru', 'des tacos mexicains au bœuf piquant'],
      ['Quel élément du service a été particulièrement souligné ?', 'une serveuse très attentionnée', 'un chef cuisinier venu chanter en salle', 'une commande livrée par un robot'],
    ],
  },
]

// -------------------------------------------------------------
// N04 READING TABLES & SCENARIOS
// -------------------------------------------------------------

const N4_LEASE_ADDRS = [
  '450, rue Cartier, appartement 3',
  '1280, avenue Maguire, logement 2',
  '725, rue Saint-Jean, appartement 4',
  '310, boulevard Charest Est, unité 5',
  '520, 3e Avenue, appartement 1',
]
const N4_LEASE_RENTS = ['1 120 dollars', '1 350 dollars', '980 dollars', '1 240 dollars']
const N4_LEASE_PERIODS = [
  'du 1er juillet 2025 au 30 juin 2026',
  'du 1er août 2025 au 31 juillet 2026',
  'du 1er septembre 2025 au 31 août 2026',
  'du 1er octobre 2025 au 30 septembre 2026',
]
const N4_LEASE_HEATS = [
  'à la charge du locataire',
  'inclus dans le montant du loyer',
  'non compris dans la mensualité',
  'assuré par un système central inclus',
]
const N4_LEASE_PETS = [
  'les chats calmes sont acceptés',
  'aucun animal domestique n’est permis',
  'un petit chien de moins de dix kilos est toléré',
  'seuls les animaux en cage sont admis',
]

const N4_FESTIVAL_NAMES = ['le Festival d’été de Québec', 'les Francos de Montréal', 'le FestiVoix de Trois-Rivières', 'le Festival de montgolfières de Gatineau']
const N4_FESTIVAL_CROWDS = ['plus de cent mille spectateurs', 'près de quatre-vingt mille mélomanes', 'plus de soixante mille visiteurs', 'environ soixante-quinze mille personnes']
const N4_FESTIVAL_DAYS = ['dix jours consécutifs de festivités', 'huit journées de spectacles en plein air', 'neuf soirs de concerts sur les berges', 'cinq jours d’activités familiales']
const N4_FESTIVAL_HIGHS = [
  'la diversité remarquable des artistes québécois',
  'la gratuité de nombreuses scènes extérieures',
  'l’ambiance chaleureuse au bord du fleuve',
  'la qualité des prestations musicales offertes',
]

export const N04_R_0 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const addr = pick(N4_LEASE_ADDRS, rand)
      const rent = pick(N4_LEASE_RENTS, rand)
      const period = pick(N4_LEASE_PERIODS, rand)
      const heat = pick(N4_LEASE_HEATS, rand)
      const pets = pick(N4_LEASE_PETS, rand)
      const text = `Extrait de bail résidentiel - Tribunal du logement. Adresse : ${addr}. Durée : ${period}. Loyer fixé à ${rent} par mois, payable le premier du mois. Chauffage et électricité ${heat}. Règle sur les animaux : ${pets}. Cession de bail sur accord écrit du propriétaire.`
      return {
        text,
        questions: [
          ['Combien le locataire doit-il payer chaque mois ?', `${rent} par mois`, 'six cents dollars par mois', 'deux mille cinq cents dollars par mois'],
          ['Quelle clause est inscrite au sujet des animaux ?', pets, 'la présence d’animaux est strictement obligatoire dans chaque pièce', 'les gros animaux d’élevage sont acceptés dans le salon principal'],
        ],
      }
    },
    { situation: 0, capacity: N4_LEASE_ADDRS.length * N4_LEASE_RENTS.length * N4_LEASE_PERIODS.length * N4_LEASE_HEATS.length * N4_LEASE_PETS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const fest = pick(N4_FESTIVAL_NAMES, rand)
      const crowd = pick(N4_FESTIVAL_CROWDS, rand)
      const days = pick(N4_FESTIVAL_DAYS, rand)
      const high = pick(N4_FESTIVAL_HIGHS, rand)
      const text = `Journal Le Soleil. Bilan éclatant pour ${fest} : ${crowd} ont vibré au son des scènes pendant ${days}. Malgré des averses en début de semaine, l’organisation souligne un succès populaire. Les festivaliers ont salué ${high}. Les retombées économiques sont estimées à plusieurs millions.`
      return {
        text,
        questions: [
          ['Combien de spectateurs ont pris part à cet évènement ?', crowd, 'seulement trois cents curieux au total sur l’ensemble du site', 'une cinquantaine de résidents du quartier venus à pied'],
          ['Quel point fort a été particulièrement mis en valeur ?', high, 'l’interdiction d’utiliser les transports en commun municipaux', 'l’imposition de tarifs exorbitants sur tous les repas vendus'],
        ],
      }
    },
    { situation: 1, capacity: N4_FESTIVAL_NAMES.length * N4_FESTIVAL_CROWDS.length * N4_FESTIVAL_DAYS.length * N4_FESTIVAL_HIGHS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const addr = pick(N4_LEASE_ADDRS, rand)
      const rent = pick(N4_LEASE_RENTS, rand)
      const period = pick(N4_LEASE_PERIODS, rand)
      const heat = pick(N4_LEASE_HEATS, rand)
      const pets = pick(N4_LEASE_PETS, rand)
      const text = `Formulaire officiel de bail à loyer. Localisation : ${addr}. Période : ${period}. Montant exigible : ${rent} par mois. Les coûts d’énergie sont ${heat}. Présence d’animaux : ${pets}. Le locataire s’engage à maintenir les lieux en bon état de propreté.`
      return {
        text,
        questions: [
          ['Quelle est la durée couverte par ce contrat de bail ?', period, 'cinq années consécutives sans aucun droit de renouvellement', 'une fin de semaine d’été seulement pendant les vacances scolaires'],
          ['Comment les frais d’énergie sont-ils gérés selon le bail ?', `les coûts d’énergie sont ${heat}`, 'la municipalité finance l’ensemble des factures d’électricité', 'les voisins du palier se partagent les paiements de l’immeuble'],
        ],
      }
    },
    { situation: 0, capacity: N4_LEASE_ADDRS.length * N4_LEASE_RENTS.length * N4_LEASE_PERIODS.length * N4_LEASE_HEATS.length * N4_LEASE_PETS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const fest = pick(N4_FESTIVAL_NAMES, rand)
      const crowd = pick(N4_FESTIVAL_CROWDS, rand)
      const days = pick(N4_FESTIVAL_DAYS, rand)
      const high = pick(N4_FESTIVAL_HIGHS, rand)
      const text = `Chronique culturelle. Succès retentissant pour ${fest} qui s’est achevé dimanche. Au cours de ${days}, ${crowd} se sont déplacées pour applaudir les artistes. Les organisateurs dressent un bilan très positif en insistant sur ${high}. La sécurité a été exemplaire.`
      return {
        text,
        questions: [
          ['Quelle manifestation culturelle fait l’objet du compte rendu ?', fest, 'une foire agricole annuelle présentant du matériel de récolte', 'une exposition muséale sur des instruments scientifiques anciens'],
          ['Quelle durée les festivités ont-elles couverte cette année ?', days, 'deux petites heures seulement avant le coucher du soleil', 'trois mois complets répartis sur toute la saison hivernale'],
        ],
      }
    },
    { situation: 1, capacity: N4_FESTIVAL_NAMES.length * N4_FESTIVAL_CROWDS.length * N4_FESTIVAL_DAYS.length * N4_FESTIVAL_HIGHS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Avis officiel de renouvellement de bail. Madame Bergeron vous informe que le loyer de votre trois et demie au 820 rue Saint-Vallier sera majoré de trente dollars pour atteindre 950 dollars dès le premier juillet. Vous disposez d’un délai d’un mois après réception pour accepter ou refuser cette hausse par écrit.',
    questions: [
      ['De combien le montant du loyer sera-t-il augmenté ?', 'de trente dollars par mois', 'de deux cents dollars par mois', 'd’aucun montant supplémentaire'],
      ['Quel délai le locataire a-t-il pour signifier sa décision ?', 'un délai d’un mois après réception', 'six mois après la date de renouvellement', 'trois jours ouvrables seulement'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Revue municipale : bilan de la Fête des neiges. Plus de quarante-cinq mille personnes se sont rassemblées au parc Jean-Drapeau durant trois fins de semaine d’hiver. Les glissades sur tube géantes, les ateliers de sculpture sur glace et la distribution de chocolat chaud ont fait le bonheur des petits et grands.',
    questions: [
      ['Où cette fête hivernale s’est-elle déroulée à Montréal ?', 'au parc Jean-Drapeau', 'sur le toit d’un gratte-ciel', 'dans le port de marchandises'],
      ['Quelles attractions ont notamment diverti les participants ?', 'les glissades sur tube et sculptures sur glace', 'des courses de chevaux sur la plage', 'des concours d’avions téléguidés'],
    ],
  },
]

const N4_REG_NAMES = ['la Gaspésie', 'les Cantons-de-l’Est', 'la région de Charlevoix', 'le Saguenay-Lac-Saint-Jean']
const N4_REG_FEATS = [
  'les majestueuses falaises et le rocher Percé',
  'les collines verdoyantes et les vergers réputés',
  'les paysages entre le fleuve et les montagnes',
  'le fjord impressionnant et ses parois de roc',
]
const N4_REG_ACTS = [
  'des sorties en bateau pour voir les baleines',
  'des parcours cyclables reliant de beaux villages',
  'des sentiers pédestres avec vue sur le fleuve',
  'des randonnées en kayak le long des falaises',
]
const N4_REG_FOODS = [
  'du homard frais et des poissons du fleuve',
  'des fromages artisanaux et des vins locaux',
  'des viandes fumées et des produits fermiers',
  'de la tourtière et de la tarte aux bleuets',
]

const N4_WEDDINGS = [
  { celeb: 'la comédienne Julie Roy et Marc Gagnon', short: 'de Julie Roy et Marc Gagnon', place: 'au manoir de Stoneham dans un décor enchanteur', guests: 'cent vingt invités intimes', dress: 'une longue robe blanche de dentelle raffinée' },
  { celeb: 'la chanteuse Sarah Tremblay et David Bouchard', short: 'de Sarah Tremblay et David Bouchard', place: 'dans les jardins de l’Île d’Orléans au bord de l’eau', guests: 'quatre-vingts proches et amis', dress: 'une tenue fluide ornée de perles délicates' },
  { celeb: 'l’écrivaine Clara Côté et Patrick Morin', short: 'de Clara Côté et Patrick Morin', place: 'dans un domaine champêtre des Cantons-de-l’Est', guests: 'cent cinquante convives réunis', dress: 'une élégante robe ivoire faite sur mesure' },
]

export const N04_R_1 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const reg = pick(N4_REG_NAMES, rand)
      const feat = pick(N4_REG_FEATS, rand)
      const act = pick(N4_REG_ACTS, rand)
      const food = pick(N4_REG_FOODS, rand)
      const text = `Brochure touristique. Venez découvrir ${reg}, un trésor naturel d’exception. Cette région séduit les voyageurs par ${feat}. Les amateurs d’aventure profiteront de ${act}. En soirée, dégustez ${food}. Des hébergements confortables en bord de mer et en forêt vous attendent pour des vacances au Québec.`
      return {
        text,
        questions: [
          ['Quelle région est mise à l’honneur dans cette brochure ?', reg, 'les îles tropicales bordées de coraux', 'un désert de sable chaud du continent'],
          ['Quels délices culinaires sont proposés aux touristes ?', food, 'des repas déshydratés achetés en magasin', 'des conserves industrielles sans saveur'],
        ],
      }
    },
    { situation: 0, capacity: N4_REG_NAMES.length * N4_REG_FEATS.length * N4_REG_ACTS.length * N4_REG_FOODS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const w = pick(N4_WEDDINGS, rand)
      const text = `Magazine Vedettes du Québec. Un mariage de rêve pour ${w.celeb} ! C’est ${w.place} que le couple a prononcé ses vœux devant ${w.guests}. La mariée était resplendissante dans ${w.dress}. La cérémonie a ému l’assemblée avant de laisser place à un banquet gastronomique servi au coucher du soleil.`
      return {
        text,
        questions: [
          ['De quel évènement mondain cet article de presse parle-t-il ?', `du mariage ${w.short}`, 'd’une remise solennelle de diplômes à l’université', 'd’une conférence syndicale de travailleurs d’usine'],
          ['Où cette fête prestigieuse s’est-elle déroulée ?', w.place, 'au sous-sol d’un centre de tri postal de banlieue', 'dans une station de métro fermée pour la nuitée'],
        ],
      }
    },
    { situation: 1, capacity: N4_WEDDINGS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const reg = pick(N4_REG_NAMES, rand)
      const feat = pick(N4_REG_FEATS, rand)
      const act = pick(N4_REG_ACTS, rand)
      const food = pick(N4_REG_FOODS, rand)
      const text = `Guide escapades au Québec. Laissez-vous charmer par ${reg} ! Vous tomberez sous le charme en contemplant ${feat}. Tout au long de l’année, pratiquez ${act}. N’oubliez pas de goûter ${food}. Une destination rêvée pour reconnecter avec la beauté brute des grands espaces.`
      return {
        text,
        questions: [
          ['Quels attraits paysagers majeurs sont décrits dans ce texte ?', feat, 'des gratte-ciel modernes en verre de soixante étages', 'des usines de métallurgie bordant une zone portuaire'],
          ['Quelle activité de plein air est recommandée aux visiteurs ?', act, 'la pratique du patin à roulettes dans un tunnel obscur', 'la participation à une vente aux enchères de machinerie'],
        ],
      }
    },
    { situation: 0, capacity: N4_REG_NAMES.length * N4_REG_FEATS.length * N4_REG_ACTS.length * N4_REG_FOODS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const w = pick(N4_WEDDINGS, rand)
      const text = `Revue Échos des Célébrités. Tous nos vœux de bonheur à ${w.celeb} qui se sont dit oui pour la vie ! La célébration intime s’est tenue ${w.place} en présence de ${w.guests}. Tous les regards étaient tournés vers la mariée vêtue d’${w.dress}. La soirée a continué au son d’un orchestre.`
      return {
        text,
        questions: [
          ['Quelle tenue la mariée portait-elle lors de son union ?', `vêtue d’${w.dress}`, 'd’un pantalon d’équitation avec une veste en cuir usé', 'd’un ensemble de ski très épais pour le grand froid'],
          ['Combien d’invités ont pris part à la célébration intime ?', w.guests, 'cinq mille personnes inconnues invitées par tirage au sort', 'deux témoins officiels seulement sans aucun proche parent'],
        ],
      }
    },
    { situation: 1, capacity: N4_WEDDINGS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Guide vacances : les Laurentides vous invitent au dépaysement à une heure de Montréal. Découvrez des sommets montagneux recouverts d’érables, des centaines de lacs paisibles et des sentiers de villégiature très bien entretenus. Profitez des auberges champêtres pour relaxer dans les bains scandinaves et déguster les produits des vergers locaux.',
    questions: [
      ['À quelle distance de Montréal les Laurentides sont-elles situées ?', 'à une heure de Montréal seulement', 'à quinze heures de vol par avion', 'à trois jours de route par autobus'],
      ['Quels hébergements touristiques sont mis en avant pour relaxer ?', 'des auberges champêtres avec bains scandinaves', 'des dortoirs militaires sans eau chaude', 'des conteneurs en métal le long des voies'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Magazine Gala Québec : le mariage grandiose de l’animatrice Catherine Dion. Entourée de sa famille et de ses collègues du petit écran, la vedette a épousé le réalisateur Martin Lepage dans une chapelle historique de la vieille capitale. Les deux cent cinquante convives ont ensuite dansé jusqu’aux petites heures du matin.',
    questions: [
      ['Dans quel lieu patrimonial la cérémonie de mariage a-t-elle eu lieu ?', 'dans une chapelle historique de Québec', 'dans un hangar d’aviation commerciale', 'dans un gymnase scolaire de banlieue'],
      ['Qui étaient les deux personnes qui unissaient leur destinée ?', 'l’animatrice Catherine Dion et Martin Lepage', 'deux ministres du gouvernement provincial', 'deux pilotes de course automobile'],
    ],
  },
]

const N4_TRIP_DESTS = [
  'le long de la Côte-Nord jusqu’à Natashquan',
  'autour de la Gaspésie en véhicule récréatif',
  'à travers les forêts du parc de la Mauricie',
  'sur les routes des îles de la Madeleine',
]
const N4_TRIP_CAMPS = [
  'sur des plages sauvages au bord du golfe',
  'dans des parcs naturels face aux falaises',
  'sous la tente sur les berges d’un lac pur',
  'près des dunes de sable au son des marées',
]
const N4_TRIP_ENCS = [
  'des pêcheurs passionnés partageant du poisson frais',
  'des artisans locaux qui sculptent le bois de grève',
  'des biologistes dévoués observant la faune marine',
  'des producteurs locaux élevant des moules de mer',
]
const N4_TRIP_FAVS = [
  'le spectacle des aurores boréales dans la nuit',
  'le coucher de soleil flamboyant sur la mer',
  'la descente paisible de la rivière en canot',
  'la lumière dorée sur les maisons de pêcheurs',
]

const N4_NEIGH_AREAS = [
  'dans Limoilou sur la 3e Avenue',
  'dans Saint-Sauveur près du parc Victoria',
  'dans Rosemont à l’angle de la rue Masson',
  'dans Montcalm sur le boulevard René-Lévesque',
]
const N4_NEIGH_CAUSES = [
  'une branche d’arbre imposante est tombée sur des fils',
  'une conduite d’eau principale a éclaté sous la chaussée',
  'un bris d’aqueduc a inondé partiellement la chaussée',
  'un poteau de télécommunication a été brisé par le vent',
]
const N4_NEIGH_DURS = [
  'trois heures d’obscurité pour cinquante résidents',
  'une coupure temporaire d’eau pour tout le secteur',
  'la fermeture de la circulation pendant quatre heures',
  'l’interruption du réseau internet jusqu’en soirée',
]
const N4_NEIGH_SOLS = [
  'les équipes d’Hydro-Québec ont rétabli le courant',
  'les cols bleus municipaux ont colmaté la fuite d’eau',
  'les pompiers ont pompé l’eau et sécurisé les commerces',
  'les techniciens ont réparé le matériel sans tarder',
]

export const N04_R_2 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const dest = pick(N4_TRIP_DESTS, rand)
      const camp = pick(N4_TRIP_CAMPS, rand)
      const enc = pick(N4_TRIP_ENCS, rand)
      const fav = pick(N4_TRIP_FAVS, rand)
      const text = `Blogue Deux sacs à dos sur la route. Notre voyage ${dest} reste une expérience inoubliable. Nous avons campé ${camp}. En chemin, nous avons rencontré ${enc}. Notre plus grand souvenir demeure ${fav}. Le Québec offre tant d’horizons sauvages à explorer avec émerveillement !`
      return {
        text,
        questions: [
          ['Où les auteurs de ce carnet de voyage ont-ils campé ?', camp, 'dans le vaste stationnement souterrain d’un centre hospitalier', 'dans un hangar métallique désaffecté près d’une voie ferrée'],
          ['Quelle rencontre enrichissante ont-ils faite en chemin ?', enc, 'des agents de sécurité refusant l’accès aux voies publiques', 'des employés de bureau en grève devant le siège de l’entreprise'],
        ],
      }
    },
    { situation: 0, capacity: N4_TRIP_DESTS.length * N4_TRIP_CAMPS.length * N4_TRIP_ENCS.length * N4_TRIP_FAVS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const area = pick(N4_NEIGH_AREAS, rand)
      const cause = pick(N4_NEIGH_CAUSES, rand)
      const dur = pick(N4_NEIGH_DURS, rand)
      const sol = pick(N4_NEIGH_SOLS, rand)
      const text = `Page communautaire du quartier. Hier vers 16 h 30 ${area}, un incident est survenu : ${cause}. Cet évènement a entraîné ${dur}. Heureusement, personne n’a été blessé. Grâce à une intervention rapide, ${sol}. La ville remercie les résidents pour leur patience.`
      return {
        text,
        questions: [
          ['Quel incident s’est produit dans les rues du quartier ?', cause, 'la construction non autorisée d’une piste d’atterrissage en ville', 'une tornade violente emportant des toitures de résidences privées'],
          ['Quelle conséquence les citoyens ont-ils subie temporairement ?', dur, 'l’évacuation forcée de l’ensemble de la ville pendant trois mois', 'l’interdiction permanente d’utiliser des appareils électroniques'],
        ],
      }
    },
    { situation: 1, capacity: N4_NEIGH_AREAS.length * N4_NEIGH_CAUSES.length * N4_NEIGH_DURS.length * N4_NEIGH_SOLS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const dest = pick(N4_TRIP_DESTS, rand)
      const camp = pick(N4_TRIP_CAMPS, rand)
      const enc = pick(N4_TRIP_ENCS, rand)
      const fav = pick(N4_TRIP_FAVS, rand)
      const text = `Récit de voyage partagé en ligne. Après deux semaines ${dest}, nous revenons transformés. Nous nous sommes endormis ${camp}. Nous avons croisé ${enc}. Ce qui nous a le plus charmés, c’est ${fav}. Nous recommandons ce circuit aux amoureux du grand air.`
      return {
        text,
        questions: [
          ['Quelle destination routière les voyageurs ont-ils explorée ?', dest, 'les banlieues d’usines chimiques de grandes villes étrangères', 'les zones minières fermées au public dans le grand nord éloigné'],
          ['Quel moment privilégié a particulièrement marqué leur séjour ?', fav, 'l’achat de pièces de quincaillerie usagées dans un garage', 'la perte de leurs bagages personnels dans un marécage boueux'],
        ],
      }
    },
    { situation: 0, capacity: N4_TRIP_DESTS.length * N4_TRIP_CAMPS.length * N4_TRIP_ENCS.length * N4_TRIP_FAVS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const area = pick(N4_NEIGH_AREAS, rand)
      const cause = pick(N4_NEIGH_CAUSES, rand)
      const dur = pick(N4_NEIGH_DURS, rand)
      const sol = pick(N4_NEIGH_SOLS, rand)
      const text = `Avis aux citoyens du secteur. Une interruption de service a touché notre communauté ${area}. En effet, ${cause}. Cela a occasionné ${dur}. Dès le signalement d’urgence, ${sol}. N’hésitez pas à composer le 311 si vous constatez d’autres anomalies.`
      return {
        text,
        questions: [
          ['Dans quel secteur précis cet évènement municipal s’est-il déroulé ?', area, 'dans un champ de culture situé à plus de cent kilomètres de là', 'sur une île inhabitée située au large du golfe Saint-Laurent'],
          ['Comment les équipes d’urgence ont-elles résolu la situation ?', sol, 'en démolissant l’ensemble des habitations situées à proximité', 'en laissant les débris sur place sans aucune intervention humaine'],
        ],
      }
    },
    { situation: 1, capacity: N4_NEIGH_AREAS.length * N4_NEIGH_CAUSES.length * N4_NEIGH_DURS.length * N4_NEIGH_SOLS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Carnet de route : notre traversée du parc national de la Gaspésie en randonnée autonome restera gravée dans nos mémoires. Pendant quatre jours de marche avec nos sacs sur le dos, nous avons croisé des caribous au sommet du mont Albert et dormi dans des refuges en bois chauffés au poêle. Une déconnexion totale !',
    questions: [
      ['Quels animaux sauvages les randonneurs ont-ils observés au sommet ?', 'des caribous au sommet du mont Albert', 'des lions d’Afrique en liberté surveillée', 'des manchots empereurs sur la glace'],
      ['Où les marcheurs passaient-ils leurs nuits pendant le trek ?', 'dans des refuges en bois chauffés au poêle', 'dans des suites d’hôtels cinq étoiles', 'dans les sièges de leur véhicule arrêté'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Alerte de quartier : hier matin dans Hochelaga, un camion de livraison a heurté un poteau d’incendie à l’intersection des rues Ontario et Pie-IX. Un geyser d’eau impressionnant a inondé le carrefour pendant quarante-cinq minutes. Les pompiers et les employés de la ville ont rapidement coupé la vanne sans aucun blessé.',
    questions: [
      ['Quel équipement urbain a été heurté par le camion de livraison ?', 'un poteau d’incendie à l’intersection', 'une statue en bronze d’un monument public', 'un abribus vitré pour les passagers'],
      ['Quel effet l’accident a-t-il provoqué sur la rue avant la réparation ?', 'un geyser d’eau inondant le carrefour', 'un incendie majeur embrasant tout le quartier', 'l’effondrement d’un pont pour trains'],
    ],
  },
]

const N4_BANKS = ['Desjardins', 'la Banque Nationale', 'la Banque Royale', 'la Banque Scotia']
const N4_BANK_FRAUDS = [
  'des courriels demandant vos identifiants',
  'des messages annonçant un faux virement d’argent',
  'des alertes signalant un prétendu blocage de carte',
  'des formulaires réclamant votre numéro d’assurance',
]
const N4_BANK_RULES = [
  'ne cliquez jamais sur les liens suspects reçus',
  'évitez d’entrer votre mot de passe sur un site inconnu',
  'ne donnez aucun code de sécurité reçu par texto',
  'sachez que votre banque n’exige aucun mot de passe par texto',
]
const N4_BANK_ACTIONS = [
  'composez le numéro au dos de votre carte de débit',
  'utilisez seulement l’application mobile officielle',
  'communiquez avec le service antifraude de l’institution',
  'transférez le message à notre équipe de sécurité',
]

const N4_WORK_LOCS = [
  'dans la salle des serveurs informatiques au 2e étage',
  'dans l’atelier d’emballage de notre centre de tri',
  'au comptoir de la cafétéria centrale du personnel',
  'dans l’entrepôt principal de notre succursale locale',
]
const N4_WORK_CAUSES = [
  'une surchauffe due à l’arrêt de la ventilation',
  'un convoyeur s’est bloqué après un bourrage',
  'un bris de tuyau d’eau sous un équipement',
  'un chariot a heurté une rangée de matériel',
]
const N4_WORK_DURS = [
  'une panne de trente minutes sur le portail interne',
  'l’arrêt de la chaîne durant quarante minutes',
  'la fermeture du service pour l’heure du midi',
  'le blocage d’une allée pendant une heure de travail',
]
const N4_WORK_SOLS = [
  'la ventilation a été réparée et les données sont intactes',
  'les techniciens ont changé la pièce et relancé le tri',
  'la plomberie a été réparée et un traiteur a été offert',
  'le secteur a été nettoyé et les stocks ont été remis en place',
]

export const N04_R_3 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const bank = pick(N4_BANKS, rand)
      const fraud = pick(N4_BANK_FRAUDS, rand)
      const rule = pick(N4_BANK_RULES, rand)
      const act = pick(N4_BANK_ACTIONS, rand)
      const text = `Dépliant de sécurité de ${bank}. Protégez vos données personnelles face aux fraudeurs. Méfiez-vous particulièrement de ${fraud}. Règle essentielle : ${rule}. Votre institution financière ne réclame aucun renseignement confidentiel par courriel. En cas de doute, ${act}. La vigilance en ligne assure votre sécurité.`
      return {
        text,
        questions: [
          ['Quelle tentative de fraude ce dépliant bancaire dénonce-t-il ?', fraud, 'des offres d’emploi légitimes publiées dans la presse régionale', 'des factures d’énergie officielles envoyées sous pli postal'],
          ['Quelle consigne de prudence essentielle est formulée ici ?', rule, 'inscrire son mot de passe en gros caractères sur une affiche publique', 'partager immédiatement ses codes bancaires avec des inconnus croisés'],
        ],
      }
    },
    { situation: 0, capacity: N4_BANKS.length * N4_BANK_FRAUDS.length * N4_BANK_RULES.length * N4_BANK_ACTIONS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const loc = pick(N4_WORK_LOCS, rand)
      const cause = pick(N4_WORK_CAUSES, rand)
      const dur = pick(N4_WORK_DURS, rand)
      const sol = pick(N4_WORK_SOLS, rand)
      const text = `Note de service interne. Nous vous informons qu’un incident mineur est survenu ce matin ${loc}. L’origine du problème : ${cause}. Cet évènement a entraîné ${dur}. Heureusement, ${sol}. Nous remercions l’ensemble du personnel pour son calme et son professionnalisme.`
      return {
        text,
        questions: [
          ['Où cet incident de travail a-t-il pris naissance ce matin ?', loc, 'dans la cabine de pilotage d’un avion de ligne en plein vol', 'au milieu d’un champ de maïs loué par l’entreprise pour l’été'],
          ['Quelle a été la cause exacte du problème matériel signalé ?', cause, 'la fermeture définitive de la compagnie en raison d’une faillite', 'une tempête de neige majeure détruisant les toitures de l’usine'],
        ],
      }
    },
    { situation: 1, capacity: N4_WORK_LOCS.length * N4_WORK_CAUSES.length * N4_WORK_DURS.length * N4_WORK_SOLS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const bank = pick(N4_BANKS, rand)
      const fraud = pick(N4_BANK_FRAUDS, rand)
      const rule = pick(N4_BANK_RULES, rand)
      const act = pick(N4_BANK_ACTIONS, rand)
      const text = `Avis de sécurité publié par ${bank}. Soyez attentifs à ${fraud}. Pour protéger vos finances, ${rule}. Aucun employé de banque ne sollicite de mot de passe par message. Si vous pensez avoir été ciblé, ${act}. Votre prudence demeure votre meilleure protection.`
      return {
        text,
        questions: [
          ['Quelle démarche préventive est conseillée en cas de doute ?', act, 'transférer immédiatement de l’argent comptant à un tiers inconnu', 'publier ses identifiants confidentiels sur les réseaux sociaux'],
          ['Quel type d’arnaque financière est expressément mentionné ?', fraud, 'la distribution gratuite de journaux quotidiens devant les gares', 'l’encaissement d’un chèque de paie par son employeur habituel'],
        ],
      }
    },
    { situation: 0, capacity: N4_BANKS.length * N4_BANK_FRAUDS.length * N4_BANK_RULES.length * N4_BANK_ACTIONS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const loc = pick(N4_WORK_LOCS, rand)
      const cause = pick(N4_WORK_CAUSES, rand)
      const dur = pick(N4_WORK_DURS, rand)
      const sol = pick(N4_WORK_SOLS, rand)
      const text = `Communication interne de la direction. Concernant la perturbation survenue ${loc}, nous confirmons qu’${cause}. Cette interruption a causé ${dur}. Grâce à une intervention rapide, ${sol}. Toutes les opérations se poursuivent normalement aujourd’hui.`
      return {
        text,
        questions: [
          ['Quelle conséquence concrète a résulté de cette interruption ?', dur, 'la mise à pied définitive de l’ensemble des ouvriers de la région', 'la fermeture complète du complexe commercial pendant deux années'],
          ['Comment la situation matérielle a-t-elle été résolue ?', sol, 'en vendant aux enchères tous les équipements de l’entreprise', 'en abandonnant totalement les locaux de travail sans personnel'],
        ],
      }
    },
    { situation: 1, capacity: N4_WORK_LOCS.length * N4_WORK_CAUSES.length * N4_WORK_DURS.length * N4_WORK_SOLS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Alerte fraude - Mouvement Desjardins. Des malfaiteurs utilisent actuellement de faux messages texte au nom de notre institution affirmant que votre accès en ligne a été suspendu pour activité inhabituelle. Ne cliquez sur aucun hyperlien contenu dans ces messages. Nous ne demandons jamais de déverrouiller un compte par simple texto.',
    questions: [
      ['Quel faux prétexte est invoqué dans les messages frauduleux ?', 'un accès prétendument suspendu pour activité inhabituelle', 'un gain d’un million de dollars à la loterie nationale', 'une offre de réduction sur des abonnements de gymnase'],
      ['Quel réflexe de sécurité est fermement recommandé aux usagers ?', 'ne cliquer sur aucun lien contenu dans le message', 'répondre avec son numéro de carte de crédit', 'transmettre son adresse résidentielle complète'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Note de service interne : déclenchement de l’alarme d’incendie. L’évacuation survenue hier à 11 h dans l’édifice central a été provoquée par de la fumée dense issue d’un grille-pain défectueux à la cafétéria du troisième niveau. Les pompiers ont inspecté les conduits et ventilé les couloirs. Le retour au travail s’est fait en toute sécurité.',
    questions: [
      ['Quel appareil a déclenché l’alarme d’incendie et l’évacuation ?', 'un grille-pain défectueux à la cafétéria', 'une chaudière de chauffage au sous-sol', 'un ordinateur portable surchauffé dans un bureau'],
      ['Comment l’incident a-t-il été maîtrisé par les intervenants ?', 'les pompiers ont inspecté et ventilé les lieux', 'tous les murs de l’édifice ont été repeints', 'l’électricité a été coupée pour une semaine'],
    ],
  },
]

const N4_TASKS_1 = [
  'répondre aux courriels urgents des clients reçus depuis hier',
  'vérifier les commandes en attente d’expédition dans le logiciel',
  'traiter les demandes d’inscription prioritaires du secrétariat',
  'compléter la révision des fiches de paie pour l’administration',
]
const N4_TASKS_2 = [
  'finaliser l’inventaire des stocks de la réserve avant midi',
  'imprimer les bordereaux de livraison pour les camionneurs',
  'mettre à jour le tableau des présences pour la directrice',
  'confirmer les rendez-vous des clients de l’après-midi',
]
const N4_TASKS_3 = [
  'préparer les dossiers papier pour la rencontre d’équipe',
  'classer les factures fournisseurs dans les chemises prévues',
  'accueillir les stagiaires dans la salle de conférence',
  'ranger le matériel informatique dans l’armoire fermée',
]
const N4_TASKS_SIGNS = [
  'N’hésitez pas à me joindre en cas de question.',
  'Venez me voir à mon bureau si vous avez un doute.',
  'Je reste joignable sur mon cellulaire si besoin.',
  'Merci de votre rigueur et bon travail à tous.',
]

const N4_DRIVE_FOLDERS = [
  'dans le dossier partagé des ventes',
  'sur le portail des ressources humaines',
  'dans l’espace sécurisé des projets',
  'sur le disque réseau de la comptabilité',
]
const N4_DRIVE_SUBS = [
  'le sous-dossier de l’année courante',
  'la section des rapports hebdomadaires',
  'le répertoire des documents finaux',
  'le dossier des factures approuvées',
]
const N4_DRIVE_FORMATS = [
  'au format PDF haute résolution',
  'en format Word ou PDF standard',
  'en document numérique lisible',
  'sous la forme d’un fichier compressé',
]
const N4_DRIVE_BUTTONS = [
  'appuyez sur le bouton vert Téléverser',
  'cliquez sur le bouton Enregistrer le fichier',
  'validez votre dépôt avec la touche Confirmer',
  'pressez la commande Déposer pour finaliser',
]

export const N04_R_4 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const p1 = pick(N4_TASKS_1, rand)
      const p2 = pick(N4_TASKS_2, rand)
      const p3 = pick(N4_TASKS_3, rand)
      const sign = pick(N4_TASKS_SIGNS, rand)
      const text = `Consignes de la superviseuse pour la journée de travail. Bonjour à l’équipe ! Voici vos priorités : premièrement, ${p1}. Deuxièmement, ${p2}. Troisièmement, ${p3}. Merci de respecter cet ordre pour assurer la fluidité de nos opérations. ${sign}`
      return {
        text,
        questions: [
          ['Quelle est la première tâche urgente à accomplir le matin ?', p1, 'partir en pause dîner prolongée dès l’arrivée au travail', 'téléphoner à des connaissances pour organiser le week-end'],
          ['Quelle obligation doit être finalisée en fin de matinée ?', p2, 'quitter définitivement l’entreprise sans en informer personne', 'nettoyer l’ensemble du stationnement extérieur avec un balai'],
        ],
      }
    },
    { situation: 0, capacity: N4_TASKS_1.length * N4_TASKS_2.length * N4_TASKS_3.length * N4_TASKS_SIGNS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const folder = pick(N4_DRIVE_FOLDERS, rand)
      const sub = pick(N4_DRIVE_SUBS, rand)
      const format = pick(N4_DRIVE_FORMATS, rand)
      const btn = pick(N4_DRIVE_BUTTONS, rand)
      const text = `Procédure informatique : comment déposer un document en ligne. Tout d’abord, connectez-vous avec vos identifiants d’employé. Dirigez-vous ${folder}. Ensuite, ouvrez ${sub}. Glissez votre fichier ${format}. Pour clore l’envoi avec succès, ${btn}. Une confirmation apparaîtra à l’écran.`
      return {
        text,
        questions: [
          ['Dans quel répertoire principal faut-il classer le document ?', folder, 'sur une clé USB personnelle conservée à domicile', 'dans la corbeille de recyclage d’un collègue absent'],
          ['Sous quel format le document doit-il être déposé ?', format, 'en dessin manuscrit pris en photo avec un téléphone', 'en enregistrement vocal récité au combiné du bureau'],
        ],
      }
    },
    { situation: 1, capacity: N4_DRIVE_FOLDERS.length * N4_DRIVE_SUBS.length * N4_DRIVE_FORMATS.length * N4_DRIVE_BUTTONS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const p1 = pick(N4_TASKS_1, rand)
      const p2 = pick(N4_TASKS_2, rand)
      const p3 = pick(N4_TASKS_3, rand)
      const sign = pick(N4_TASKS_SIGNS, rand)
      const text = `Plan de travail journalier envoyé par la gestionnaire. Bon matin ! Afin de respecter nos engagements auprès de la clientèle, veuillez procéder ainsi : d’abord, ${p1}. Avant midi, assurez-vous ${de(p2)}. Enfin, consacrez votre après-midi à ${p3}. ${sign}`
      return {
        text,
        questions: [
          ['À quelle tâche les employés doivent-ils consacrer l’après-midi ?', p3, 'à se reposer dans les fauteuils de la salle d’attente', 'à confectionner des décorations festives pour Noël'],
          ['Dans quel but cette planification de travail est-elle établie ?', 'respecter les engagements envers la clientèle', 'permettre aux employés de quitter le travail à midi', 'organiser une compétition de jeux de société sur place'],
        ],
      }
    },
    { situation: 0, capacity: N4_TASKS_1.length * N4_TASKS_2.length * N4_TASKS_3.length * N4_TASKS_SIGNS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const folder = pick(N4_DRIVE_FOLDERS, rand)
      const sub = pick(N4_DRIVE_SUBS, rand)
      const format = pick(N4_DRIVE_FORMATS, rand)
      const btn = pick(N4_DRIVE_BUTTONS, rand)
      const text = `Guide d’archivage numérique à l’interne. Pour archiver votre compte rendu annuel, connectez-vous à la plateforme sécurisée. Accédez au répertoire ${folder}, puis choisissez ${sub}. Téléversez votre travail ${format}. Dès que l’importation est prête, ${btn}. Un reçu sera généré.`
      return {
        text,
        questions: [
          ['Quelle action finale permet de valider l’archivage numérique ?', btn, 'redémarrer immédiatement le serveur central du bureau', 'actionner le disjoncteur électrique général de l’étage'],
          ['Dans quelle section spécifique l’archive doit-elle être placée ?', sub, 'dans le répertoire des jeux vidéo personnels téléchargés', 'sur un profil de réseau social accessible à tout le public'],
        ],
      }
    },
    { situation: 1, capacity: N4_DRIVE_FOLDERS.length * N4_DRIVE_SUBS.length * N4_DRIVE_FORMATS.length * N4_DRIVE_BUTTONS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Courriel de la responsable de service : organisation de la journée de vendredi. 1. Classer tous les dossiers clients de la semaine avant 11 h. 2. Participer à la réunion d’équipe de midi dans la grande salle. 3. Finaliser l’inventaire des fournitures de bureau avant votre départ à 16 h 30.',
    questions: [
      ['Quelle tâche doit être terminée avant 11 h le matin ?', 'classer les dossiers clients de la semaine', 'participer à la fête d’anniversaire du directeur', 'commander les billets d’avion pour les vacances'],
      ['Où la rencontre d’équipe aura-t-elle lieu à midi ?', 'dans la grande salle de réunion', 'au restaurant à l’extérieur du centre-ville', 'dans le stationnement sous-sol de l’édifice'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Guide de mise à jour des coordonnées personnelles au gouvernement. Connectez-vous à votre dossier en ligne avec votre numéro d’assurance maladie. Cliquez sur l’onglet « Profil », modifiez votre adresse postale, puis joignez une preuve de résidence récente. Cliquez sur « Confirmer » pour recevoir votre accusé.',
    questions: [
      ['Quel renseignement permet d’ouvrir la session en ligne ?', 'le numéro d’assurance maladie officiel', 'le mot de passe de sa boîte de courriel personnelle', 'le nom complet de son ancien employeur'],
      ['Quelle pièce justificative faut-il joindre au dossier ?', 'une preuve de résidence récente', 'une photo de sa maison de vacances', 'une lettre de recommandation d’un voisin'],
    ],
  },
]

const N4_SNACK_FRIENDS = ['Valérie', 'Sophie', 'Mélanie', 'Camille']
const N4_SNACK_ITEMS = [
  'de petits muffins maison aux bananes et graines de chia',
  'des bâtonnets de carottes et concombres avec du houmous',
  'des boules d’énergie à l’avoine et canneberges séchées',
  'des cubes de fromage québécois avec des tranches de pomme',
]
const N4_SNACK_PREPS = [
  'le dimanche après-midi pour toute la semaine d’école',
  'la veille au soir dans des contenants hermétiques',
  'en bonne quantité pour pouvoir les congeler au besoin',
  'en portions individuelles prêtes pour la boîte à lunch',
]
const N4_SNACK_WHYS = [
  'c’est nourrissant, peu sucré et très aimé des enfants',
  'c’est croquant, plein de vitamines et facile à emporter',
  'cela donne une bonne dose d’énergie sans allergène',
  'c’est riche en protéines et les enfants ne s’en lassent pas',
]

const N4_SAVER_ITEMS = [
  'une pomme de douche certifiée à débit réduit WaterSense',
  'des aérateurs de robinet modernes pour la cuisine et le bain',
  'un mitigeur thermostatique muni d’un bouton écologique',
  'une couverture isolante thermique pour réservoir d’eau',
]
const N4_SAVER_BENEFITS = [
  'quarante pour cent d’eau chaude sans rogner sur le confort',
  'trente pour cent sur la facture de chauffage d’eau',
  'de précieuses minutes d’eau gaspillée lors des réglages',
  'les pertes de chaleur passives durant les mois d’hiver',
]
const N4_SAVER_COSTS = [
  'un achat modique rentabilisé dès les premières semaines',
  'un coût minime de quelques dollars en quincaillerie',
  'une réduction durable sur votre compte d’Hydro-Québec',
  'une dépense modeste qui prolonge la vie du chauffe-eau',
]
const N4_SAVER_INSTALLS = [
  'elle se visse simplement à la main sans outil lourd',
  'ils s’installent en quelques secondes au bec du robinet',
  'il stabilise la température en évitant les brûlures',
  'elle s’enroule autour du cylindre avec des bandes fournies',
]

export const N04_R_5 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const friend = pick(N4_SNACK_FRIENDS, rand)
      const snack = pick(N4_SNACK_ITEMS, rand)
      const prep = pick(N4_SNACK_PREPS, rand)
      const why = pick(N4_SNACK_WHYS, rand)
      const text = `Courriel de ton amie ${friend}. Allô ! Tu me demandais des suggestions de collations santé pour les boîtes à lunch des enfants. Je te conseille vivement de cuisiner ${snack}. Je prépare cela ${prep}. Le grand avantage, c’est que ${why}. Mes enfants adorent en emporter à la récréation. Essaie cette recette !`
      return {
        text,
        questions: [
          ['Quelle idée de collation santé l’amie suggère-t-elle ?', snack, 'de grands sacs de croustilles salées achetés au dépanneur du coin', 'des barres chocolatées industrielles très riches en sucre et en gras'],
          ['Pourquoi cette option est-elle particulièrement recommandée ?', why, 'cette collation occasionne une dépense de cent dollars chaque semaine', 'les enfants ont l’obligation stricte de la jeter à la poubelle en arrivant'],
        ],
      }
    },
    { situation: 0, capacity: N4_SNACK_FRIENDS.length * N4_SNACK_ITEMS.length * N4_SNACK_PREPS.length * N4_SNACK_WHYS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const item = pick(N4_SAVER_ITEMS, rand)
      const benefit = pick(N4_SAVER_BENEFITS, rand)
      const cost = pick(N4_SAVER_COSTS, rand)
      const inst = pick(N4_SAVER_INSTALLS, rand)
      const text = `Page Web d’efficacité énergétique - Éco-Habitation Québec. Vous souhaitez diminuer vos factures sans réduire votre confort ? Nous vous recommandons d’installer ${item}. Cet équipement permet d’économiser ${benefit}. De plus, c’est ${cost}. Sur le plan pratique, ${inst}. Un geste écologique simple et rentable pour toute la maison.`
      return {
        text,
        questions: [
          ['Quel produit économiseur d’eau est conseillé sur cette page Web ?', item, 'une grande piscine extérieure chauffée installée dans le jardin', 'une imposante machine à laver industrielle alimentée au mazout'],
          ['Quel bénéfice concret l’usager retire-t-il de cette installation ?', `d’économiser ${benefit}`, 'de doubler la consommation quotidienne d’eau potable de la maison', 'de faire grimper les coûts annuels de facturation d’électricité'],
        ],
      }
    },
    { situation: 1, capacity: N4_SAVER_ITEMS.length * N4_SAVER_BENEFITS.length * N4_SAVER_COSTS.length * N4_SAVER_INSTALLS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const friend = pick(N4_SNACK_FRIENDS, rand)
      const snack = pick(N4_SNACK_ITEMS, rand)
      const prep = pick(N4_SNACK_PREPS, rand)
      const why = pick(N4_SNACK_WHYS, rand)
      const text = `Message amical de ${friend} pour les collations d’école. Coucou ! Si tu cherches une collation nutritive qui change de la routine, pense à ${snack}. C’est super pratique à préparer ${prep}. C’est vraiment formidable parce que ${why}. Ça dépanne tellement les matins pressés ! Donne-moi des nouvelles.`
      return {
        text,
        questions: [
          ['Quand est-il suggéré de confectionner cette collation ?', prep, 'au milieu de la nuit entre deux et trois heures du matin', 'au moment où la sonnerie des cours retentit dans l’école'],
          ['Quel type d’aliment maison est proposé dans ce message ?', snack, 'une portion de frites grasses réchauffées de la veille', 'des sucreries très colorées vendues dans les kermesses'],
        ],
      }
    },
    { situation: 0, capacity: N4_SNACK_FRIENDS.length * N4_SNACK_ITEMS.length * N4_SNACK_PREPS.length * N4_SNACK_WHYS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const item = pick(N4_SAVER_ITEMS, rand)
      const benefit = pick(N4_SAVER_BENEFITS, rand)
      const cost = pick(N4_SAVER_COSTS, rand)
      const inst = pick(N4_SAVER_INSTALLS, rand)
      const text = `Guide conseils pour réduire sa facture d’électricité. Pour diminuer la consommation d’eau chaude d’un ménage québécois, songez à poser ${item}. En adoptant cet accessoire, vous pouvez gagner ${benefit}. C’est ${cost}. Du point de vue pratique, ${inst}. Un choix avantageux pour votre budget.`
      return {
        text,
        questions: [
          ['Comment s’effectue l’installation de cet accessoire écoénergétique ?', inst, 'en faisant obligatoirement appel à une équipe d’ingénieurs', 'en coupant le courant électrique général durant six semaines'],
          ['Quel bénéfice financier ce dispositif procure-t-il au ménage ?', cost, 'il entraîne un endettement lourd pour toute la famille', 'il fait augmenter de moitié le tarif des assurances maison'],
        ],
      }
    },
    { situation: 1, capacity: N4_SAVER_ITEMS.length * N4_SAVER_BENEFITS.length * N4_SAVER_COSTS.length * N4_SAVER_INSTALLS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Courriel de Chloé : idées de collations pour le groupe de soccer. Bonjour les parents ! Pour la mi-temps de samedi, évitons les jus industriels et les biscuits trop sucrés. Je propose d’apporter des quartiers d’oranges fraîches et des morceaux de melon d’eau bien juteux. C’est parfait pour réhydrater les jeunes coureurs sous le soleil !',
    questions: [
      ['Quels fruits rafraîchissants Chloé propose-t-elle pour les enfants ?', 'des quartiers d’oranges et melon d’eau', 'des bananes flambées au caramel', 'des pommes frites dans l’huile'],
      ['Quels produits déconseille-t-elle pour la mi-temps du match ?', 'les jus industriels et biscuits trop sucrés', 'l’eau minérale et les fruits frais coupés', 'les tranches de pain complet sans sel'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Conseils pratiques - Société d’habitation du Québec. Réduire la température de votre chauffe-eau à soixante degrés Celsius permet de faire des économies d’énergie appréciables tout en éliminant les risques de brûlure pour les enfants. C’est la température idéale recommandée pour concilier sécurité et hygiène dans la maison.',
    questions: [
      ['À quelle température idéale est-il conseillé de régler le chauffe-eau ?', 'à soixante degrés Celsius', 'à quatre-vingt-dix degrés Celsius', 'à vingt degrés Celsius seulement'],
      ['Quel double bénéfice ce réglage de température procure-t-il ?', 'économies d’énergie et prévention des brûlures', 'doublement de la facture d’électricité', 'baisse de la pression de l’eau dans les tuyaux'],
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
