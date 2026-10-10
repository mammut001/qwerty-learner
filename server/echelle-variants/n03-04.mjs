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
// NIVEAU 3 - LISTENING
// ===========================================================================

const QUEBEC_SUPERMARKETS = [
  { name: 'Metro', fee: '50 dollars', minZh: '50 加元' },
  { name: 'IGA', fee: '60 dollars', minZh: '60 加元' },
  { name: 'Maxi', fee: '45 dollars', minZh: '45 加元' },
  { name: 'Super C', fee: '55 dollars', minZh: '55 加元' },
  { name: 'Provigo', fee: '65 dollars', minZh: '65 加元' },
]

const DELIVERY_SCHEDULES = [
  { daysFr: 'le mardi et le jeudi', daysZh: '周二和周四', hoursFr: 'entre 13 h et 17 h' },
  { daysFr: 'le lundi et le mercredi', daysZh: '周一和周三', hoursFr: 'entre 10 h et 14 h' },
  { daysFr: 'le mercredi et le vendredi', daysZh: '周三和周五', hoursFr: 'entre 14 h et 18 h' },
  { daysFr: 'le vendredi et le samedi', daysZh: '周五和周六', hoursFr: 'entre 9 h et 13 h' },
]

const TRANSIT_AGENCIES = [
  { agency: 'de la STM à Montréal', card: 'carte OPUS', fareZh: '3,75 加元', fareFr: '3 dollars 75' },
  { agency: 'du RTC à Québec', card: 'carte OPUS', fareZh: '3,50 加元', fareFr: '3 dollars 50' },
  { agency: 'de la STL à Laval', card: 'carte Horizon', fareZh: '3,50 加元', fareFr: '3 dollars 50' },
  { agency: 'de la STS à Sherbrooke', card: 'carte La Vermeille', fareZh: '3,30 加元', fareFr: '3 dollars 30' },
]

const PASS_OPTIONS = [
  { passFr: 'mensuel', passZh: '月票', priceFr: '94 dollars', priceZh: '94 加元' },
  { passFr: 'hebdomadaire', passZh: '周票', priceFr: '30 dollars', priceZh: '30 加元' },
  { passFr: 'soirée illimitée', passZh: '晚间通票', priceFr: '6 dollars', priceZh: '6 加元' },
  { passFr: 'fin de semaine', passZh: '周末票', priceFr: '15 dollars', priceZh: '15 加元' },
]

const N3_FORMS = [
  { name: 'la demande d’allocation familiale', topicZh: '家庭津贴申请表', field: '« revenu net »' },
  { name: 'le renouvellement de la carte d’assurance maladie', topicZh: '医保卡更新表', field: '« numéro de référence »' },
  { name: 'l’inscription à la garderie municipale', topicZh: '日托报名表', field: '« contact d’urgence »' },
  { name: 'le formulaire d’admission au cégep', topicZh: '学院入学申请表', field: '« code permanent »' },
]

const N3_WEEKEND_PLANS = [
  { act: 'au parc Jean-Drapeau pour faire du vélo', actZh: '去公园骑行', day: 'samedi' },
  { act: 'au Musée national des beaux-arts à Québec', actZh: '去美术馆参观', day: 'dimanche' },
  { act: 'à la cabane à sucre avec ma cousine', actZh: '去枫糖小屋', day: 'samedi' },
  { act: 'en randonnée sur le mont Saint-Hilaire', actZh: '去徒步登山', day: 'dimanche' },
  { act: 'patiner à la patinoire extérieure du quartier', actZh: '去户外滑冰', day: 'samedi' },
]

const N3_CLOTHES = [
  { item: 'un manteau d’hiver', colorM: 'bleu marine', colorZh: '深蓝色', feature: 'très chaud avec un capuchon', discount: 'à moitié prix', reasonZh: '半价特惠' },
  { item: 'une veste imperméable', colorM: 'noire', colorZh: '黑色', feature: 'avec de grandes poches', discount: 'en liquidation', reasonZh: '清仓特惠' },
  { item: 'un chandail de laine', colorM: 'vert foncé', colorZh: '深绿色', feature: 'doux et très confortable', discount: 'avec un bon rabais', reasonZh: '特价优惠' },
  { item: 'un pantalon chaud', colorM: 'gris foncé', colorZh: '深灰色', feature: 'parfait pour le froid', discount: 'en solde de saison', reasonZh: '季末打折' },
  { item: 'une belle tuque', colorM: 'rouge foncé', colorZh: '深红色', feature: 'doublée en laine polaire', discount: 'à moitié prix', reasonZh: '半价特惠' },
]

const N3_CLOTH_STORES = [
  'chez Simons',
  'au magasin Winners',
  'au centre commercial',
  'à la boutique locale',
  'chez Aubainerie',
]

// All sick names start with consonants so "que + Name" never violates elision
const N3_SICK_PEOPLE = [
  { name: 'Karim', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’un gros rhume avec un peu de fièvre', sympZh: '重感冒伴有低烧' },
  { name: 'Sarah', absent: 's’est absentée ce matin', pronoun: 'Elle', prep: 'd’un mal de gorge très persistant', sympZh: '严重喉咙疼痛' },
  { name: 'Patrick', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’une vilaine grippe saisonnière', sympZh: '患季节性流感' },
  { name: 'Lucia', absent: 's’est absentée ce matin', pronoun: 'Elle', prep: 'd’une migraine intense et de fatigue', sympZh: '偏头痛伴随疲劳' },
  { name: 'David', absent: 's’est absenté ce matin', pronoun: 'Il', prep: 'd’une bronchite assez douloureuse', sympZh: '患急性支气管炎' },
  { name: 'Fatima', absent: 's’est absentée ce matin', pronoun: 'Elle', prep: 'd’un problème d’estomac passager', sympZh: '急性胃部不适' },
]

const N3_CLINICS = [
  { clinic: 'au CLSC du quartier', clinicZh: '社区诊所（CLSC）' },
  { clinic: 'à la clinique sans rendez-vous', clinicZh: '免预约家庭门诊' },
  { clinic: 'chez son médecin de famille', clinicZh: '家庭医生诊所' },
  { clinic: 'au centre médical local', clinicZh: '本地综合医疗中心' },
]

const N3_MED_DOSAGES = [
  { med: 'ce sirop pour la toux', dose: 'une cuillère', freq: 'deux fois par jour', freqZh: '每天 2 次', moment: 'après le déjeuner et le souper', momentZh: '早晚餐后服用', dur: 'pendant cinq jours', durZh: '连续 5 天' },
  { med: 'ces comprimés blancs', dose: 'un comprimé', freq: 'trois fois par jour', freqZh: '每天 3 次', moment: 'avec un grand verre d’eau', momentZh: '大杯温水送服', dur: 'pendant sept jours', durZh: '连续 7 天' },
  { med: 'ces gélules de vitamines', dose: 'deux gélules', freq: 'chaque matin', freqZh: '每天早晨', moment: 'avant le premier repas', momentZh: '空腹早餐前服', dur: 'pendant dix jours', durZh: '连续 10 天' },
  { med: 'ces gouttes pour les yeux', dose: 'trois gouttes', freq: 'deux fois par jour', freqZh: '每天 2 次', moment: 'le matin et le soir', momentZh: '早晚各服一次', dur: 'pendant une semaine', durZh: '连续 1 周' },
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

const N3_IT_FOLLOWUPS = [
  'Ensuite, ouvre ta boîte de courriels.',
  'Puis, vérifie tes tâches du jour.',
  'Après, confirme ta présence sur le portail.',
  'Ensuite, regarde les messages urgents.',
]

const N3_COMPLIMENTS = [
  { item: 'ton veston bleu', adj: 'très élégant', itemZh: '蓝色外套', effectZh: '显得大方得体' },
  { item: 'ta chemise blanche', adj: 'vraiment impeccable', itemZh: '白色衬衫', effectZh: '显得干净整洁' },
  { item: 'ta belle veste', adj: 'très soignée', itemZh: '漂亮的夹克', effectZh: '很有职业精神' },
  { item: 'ton joli foulard', adj: 'superbe', itemZh: '好看的围巾', effectZh: '颜色搭配极佳' },
  { item: 'ton pull en laine', adj: 'très chic', itemZh: '羊毛毛衣', effectZh: '款式现代时尚' },
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

const N3_CHEER_ADVICES = [
  'Prends tout ton temps pour te soigner.',
  'Ne te soucie pas des dossiers du travail.',
  'Dors beaucoup et bois des tisanes chaudes.',
  'Toute l’équipe au bureau t’envoie du courage.',
]

export const N03_L_0 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const store = pick(QUEBEC_SUPERMARKETS, rand)
      const sched = pick(DELIVERY_SCHEDULES, rand)
      const text = `Pour la livraison à domicile avec ${store.name}, le service est gratuit à partir de ${store.fee}. Le chauffeur passe ${sched.daysFr}, habituellement ${sched.hoursFr}.`
      return {
        text,
        questions: [
          ['满多少金额可以享受免费送货？', store.minZh, '20 加元', '100 加元'],
          ['超市在哪几天安排送货？', sched.daysZh, '周末两天', '仅限周日'],
        ],
      }
    },
    { situation: 0, capacity: QUEBEC_SUPERMARKETS.length * DELIVERY_SCHEDULES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const transit = pick(TRANSIT_AGENCIES, rand)
      const pass = pick(PASS_OPTIONS, rand)
      const text = `Pour utiliser le réseau ${transit.agency}, un passage unitaire coûte ${transit.fareFr}. Le titre ${pass.passFr} coûte ${pass.priceFr}. N’oubliez pas de valider votre carte sur la borne.`
      return {
        text,
        questions: [
          ['单程车票的价格是多少？', transit.fareZh, '5,00 加元', '1,50 加元'],
          ['被介绍的通票类型是？', pass.passZh, '年票', '学生特惠票'],
        ],
      }
    },
    { situation: 1, capacity: TRANSIT_AGENCIES.length * PASS_OPTIONS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const store = pick(QUEBEC_SUPERMARKETS, rand)
      const sched = pick(DELIVERY_SCHEDULES, rand)
      const text = `À l’épicerie ${store.name}, la livraison coûte cinq dollars, mais elle devient gratuite dès ${store.fee} d’achats. Nos commis préparent les commandes pour ${sched.daysFr} matin.`
      return {
        text,
        questions: [
          ['达到多少消费金额可免送货费？', store.minZh, '25 加元', '90 加元'],
          ['订单将在哪几天准备好？', sched.daysZh, '周末两天', '仅限周三'],
        ],
      }
    },
    { situation: 0, capacity: QUEBEC_SUPERMARKETS.length * DELIVERY_SCHEDULES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const transit = pick(TRANSIT_AGENCIES, rand)
      const pass = pick(PASS_OPTIONS, rand)
      const text = `Au guichet ${transit.agency}, vous pouvez charger un titre ${pass.passFr} sur votre ${transit.card}. Le prix est de ${pass.priceFr}. Le paiement s’effectue par carte ou comptant.`
      return {
        text,
        questions: [
          ['乘客可以在服务窗口办理什么？', `购买${pass.passZh}`, '补办身份证件', '预约入职面试'],
          ['购买该车票的费用是多少？', pass.priceZh, '120 加元', '10 加元'],
        ],
      }
    },
    { situation: 1, capacity: TRANSIT_AGENCIES.length * PASS_OPTIONS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Bienvenue chez Provigo. Pour faire livrer votre épicerie chez vous, le panier d’achats doit atteindre au moins 60 dollars. Nous livrons du lundi au vendredi jusqu’à 19 heures.',
    questions: [
      ['最低购物金额是多少才能送货？', '60 加元', '30 加元', '100 加元'],
      ['超市哪几天提供送货服务？', '周一至周五', '仅限周末', '仅限周六'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Bonjour madame. Pour circuler dans l’autobus et le métro, vous pouvez acheter un titre de deux passages à sept dollars. C’est valide durant deux heures après la première validation.',
    questions: [
      ['购买两次票的价格是多少？', '7 加元', '12 加元', '3 加元'],
      ['每次乘车后车票的有效期是多久？', '2 小时', '24 小时', '半小时'],
    ],
  },
]

export const N03_L_1 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const form = pick(N3_FORMS, rand)
      const friend = pick(['Julie', 'Fatima', 'Carlos', 'Youssef'], rand)
      const text = `— Salut ${friend} ! Est-ce que tu pourrais m’aider avec ${form.name} ? Je ne comprends pas la case ${form.field}. — Oui, bien sûr ! Regarde, tu dois simplement écrire ton information personnelle ici.`
      return {
        text,
        questions: [
          ['朋友需要什么帮助？', `协助填写${form.topicZh}`, '借用办公笔记本电脑', '帮忙搬家到新公寓'],
          ['面对求助，合适的回答是：', 'Oui, on va regarder ça ensemble.', 'Non, je vais manger à la cafétéria.', 'Je dois partir tout de suite au bureau.'],
        ],
      }
    },
    { situation: 0, capacity: N3_FORMS.length * 4 }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const plan = pick(N3_WEEKEND_PLANS, rand)
      const name = pick(['Antoine', 'Chloé', 'Maxime', 'Amina'], rand)
      const text = `— Bonjour ${name} ! Qu’est-ce que tu as prévu pour la fin de semaine ? — Je vais aller ${plan.act} ce ${plan.day}. Et toi, est-ce que tu fais quelque chose de spécial ?`
      return {
        text,
        questions: [
          ['同事计划在周末做什么？', plan.actZh, '在公司加班处理文件', '在家修理老旧的汽车'],
          ['面对询问，合适的回答是：', 'Moi, je vais relaxer à la maison avec un livre.', 'Je prévois repeindre le salon de mon logement.', 'Nous allons visiter notre grand-mère samedi.'],
        ],
      }
    },
    { situation: 1, capacity: N3_WEEKEND_PLANS.length * 4 }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const form = pick(N3_FORMS, rand)
      const name = pick(['Sophie', 'Mei', 'Karim', 'Amadou'], rand)
      const text = `— Dis-moi ${name}, tu as deux minutes ? Je dois envoyer ${form.name} avant vendredi, mais la section ${form.field} me semble compliquée. — Pas de problème, voyons ça tranquillement ensemble.`
      return {
        text,
        questions: [
          ['说话人遇到了什么问题？', `不理解${form.topicZh}的一项内容`, '错过了报名参加培训班的时间', '丢失了钱包里的两张有效证件'],
          ['面对询问，合适的回答是：', 'D’accord, montre-moi ton document.', 'Je vais préparer un café au lait chaud.', 'Mon adresse de courriel est inscrite ici.'],
        ],
      }
    },
    { situation: 0, capacity: N3_FORMS.length * 4 }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const plan = pick(N3_WEEKEND_PLANS, rand)
      const colleague = pick(['Jean', 'Émilie', 'Valérie', 'Simon'], rand)
      const text = `— Salut ${colleague} ! Tu as des projets intéressants pour samedi ou dimanche ? — Oui, nous partons ${plan.act} ce ${plan.day} si la météo reste clémente. Tu aimerais venir avec nous ?`
      return {
        text,
        questions: [
          ['对方提出了什么周末安排？', plan.actZh, '去超市采购一周的日常杂货', '留在家里彻底打扫房间卫生'],
          ['面对邀请，合适的回答是：', 'Avec grand plaisir, merci pour l’invitation !', 'Je regrette, j’ai déjà une autre activité.', 'C’est une très bonne idée pour la sortie !'],
        ],
      }
    },
    { situation: 1, capacity: N3_WEEKEND_PLANS.length * 4 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Excuse-moi, est-ce que tu as rempli la demande de bourse d’études ? Je bloque sur la deuxième page. — Oui, je l’ai déjà envoyée hier. Viens à mon bureau, je vais t’expliquer.',
    questions: [
      ['朋友在咨询关于什么的疑问？', '奖学金申请表格内容', '租房合同的重要条款', '护照签证的办理流程'],
      ['面对求助，合适的回答是：', 'Je viens tout de suite à ton bureau.', 'La pluie tombe très fort dehors.', 'J’ai acheté du fromage à l’épicerie.'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— Salut Martin ! Tu as des projets pour la longue fin de semaine ? — Oui, nous partons faire du camping dans Charlevoix avec des amis. Et toi, tu restes en ville ?',
    questions: [
      ['马丁在长周末有什么打算？', '去夏勒瓦地区户外露营', '在市中心商场疯狂购物', '去市立图书馆复习功课'],
      ['面对提问，合适的回答是：', 'Oui, je reste ici pour visiter des musées.', 'Ma voiture a quatre roues entièrement neuves.', 'Le pain frais coûte trois dollars cinquante.'],
    ],
  },
]

export const N03_L_2 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const c = pick(N3_CLOTHES, rand)
      const store = pick(N3_CLOTH_STORES, rand)
      const text = `Regarde, je viens d’acheter ${c.item} ${c.colorM}. C’est ${c.feature}, parfait pour l’hiver au Québec. En plus, c’était ${c.discount} ${store}.`
      return {
        text,
        questions: [
          ['购买的衣物是什么颜色？', c.colorZh, '纯黄色', '纯白色'],
          ['为什么这次购物很划算？', c.reasonZh, '抽奖免费赠送', '二手旧物交换'],
        ],
      }
    },
    { situation: 0, capacity: N3_CLOTHES.length * N3_CLOTH_STORES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const p = pick(N3_SICK_PEOPLE, rand)
      const clinic = pick(N3_CLINICS, rand)
      const text = `Notre collègue ${p.name} ne sera pas là aujourd’hui. ${p.pronoun} souffre ${p.prep}. Le médecin consulté ${clinic.clinic} lui a recommandé trois jours de repos complet au lit.`
      return {
        text,
        questions: [
          ['生病的同事出现了什么症状？', p.sympZh, '扭伤了右脚脚踝', '皮肤对花粉过敏'],
          ['同事去哪里看了医生？', clinic.clinicZh, '省会大型综合医院', '私立牙科专门诊所'],
        ],
      }
    },
    { situation: 1, capacity: N3_SICK_PEOPLE.length * N3_CLINICS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const c = pick(N3_CLOTHES, rand)
      const store = pick(N3_CLOTH_STORES, rand)
      const text = `Hier, j’ai trouvé ${c.item} ${c.colorM} ${store}. Le tissu est très chaud et ${c.feature}. C’était une excellente affaire parce que l’article était ${c.discount}.`
      return {
        text,
        questions: [
          ['买到的衣服是什么颜色？', c.colorZh, '浅灰色', '粉红色'],
          ['说话人为什么认为买得很值？', c.reasonZh, '积分卡免费换领', '朋友赠送的礼物'],
        ],
      }
    },
    { situation: 0, capacity: N3_CLOTHES.length * N3_CLOTH_STORES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const p = pick(N3_SICK_PEOPLE, rand)
      const clinic = pick(N3_CLINICS, rand)
      const text = `Je t’informe que ${p.name} ${p.absent}. ${p.pronoun} souffre ${p.prep}. Le personnel soignant consulté ${clinic.clinic} lui a ordonné un arrêt de travail jusqu’à lundi.`
      return {
        text,
        questions: [
          ['请假同事的身体健康问题是？', p.sympZh, '眼睛发炎看不清', '摔跤擦伤了手臂'],
          ['同事是在何处接受医疗检查的？', clinic.clinicZh, '远程视频电话问诊', '药房日常咨询窗口'],
        ],
      }
    },
    { situation: 1, capacity: N3_SICK_PEOPLE.length * N3_CLINICS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'J’ai acheté une écharpe en laine brune et des mitaines épaisses. Les deux articles étaient en solde à vingt dollars seulement au magasin de la rue Saint-Denis.',
    questions: [
      ['买到的围巾是什么颜色？', '棕色', '黑色', '蓝色'],
      ['购买这两样物品共花了多少钱？', '20 加元', '50 加元', '80 加元'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Marc nous a écrit ce matin. Il a une laryngite et a complètement perdu sa voix. Le médecin lui a prescrit du repos et des tisanes chaudes pour toute la semaine.',
    questions: [
      ['马克身体有什么具体不适？', '得了喉炎并且失声', '胃痛无法进食消化', '突发高烧剧烈抽搐'],
      ['医生给马克的治疗建议是？', '多休息并喝热茶', '立即进行微创手术', '去健身房跑步锻炼'],
    ],
  },
]

export const N03_L_3 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const med = pick(N3_MED_DOSAGES, rand)
      const adv = pick(N3_MED_ADVICES, rand)
      const text = `À la pharmacie, on m’a bien expliqué comment prendre ${med.med}. Prenez ${med.dose} ${med.freq}, ${med.moment}, ${med.dur}. ${adv.fr}`
      return {
        text,
        questions: [
          ['这种药品的服用频率是？', med.freqZh, '每隔两周定期服用一次', '每个月末必须服用一次'],
          ['药剂师给出的健康建议是？', adv.zh, '连续三天停止所有的正常进食', '立即乘坐救护车去医院急诊室'],
        ],
      }
    },
    { situation: 0, capacity: N3_MED_DOSAGES.length * N3_MED_ADVICES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const dev = pick(N3_IT_DEVICES, rand)
      const f = pick(N3_IT_FOLLOWUPS, rand)
      const text = `Pour ouvrir ${dev.dev}, écoute bien les étapes. Tu dois ${dev.step1}. Dès que la lumière verte clignote, il faut ${dev.step2}. ${f}`
      return {
        text,
        questions: [
          ['开启工作设备的第一步是？', dev.step1Zh, '拔掉设备机箱后面的电源线', '直接用力拍打前面的液晶屏幕'],
          ['开机后应如何登录系统？', dev.step2Zh, '重新下载并安装全部应用软件', '拨打电话联系部门经理来处理'],
        ],
      }
    },
    { situation: 1, capacity: N3_IT_DEVICES.length * N3_IT_FOLLOWUPS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const med = pick(N3_MED_DOSAGES, rand)
      const adv = pick(N3_MED_ADVICES, rand)
      const text = `Voici les consignes du pharmacien pour ${med.med}. Il faut avaler ${med.dose} ${med.freq}, surtout ${med.moment}, ${med.dur}. ${adv.fr}`
      return {
        text,
        questions: [
          ['药物需要在什么时间服用？', med.momentZh, '剧烈体育运动之后立即服用', '晚上洗热水澡之前空腹服用'],
          ['药物建议的连续服用时长是？', med.durZh, '整整三个月时间', '连续六十天时间'],
        ],
      }
    },
    { situation: 0, capacity: N3_MED_DOSAGES.length * N3_MED_ADVICES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const dev = pick(N3_IT_DEVICES, rand)
      const f = pick(N3_IT_FOLLOWUPS, rand)
      const text = `Voici comment allumer ${dev.dev}. Il faut ${dev.step1}. Ensuite, sur l’écran de démarrage, pense à ${dev.step2}. ${f}`
      return {
        text,
        questions: [
          ['同事提醒的第一步操作是？', dev.step1Zh, '关闭办公室房间的所有主照明', '拉下墙壁上的红色紧急报警电闸'],
          ['在登录页面需要执行的操作是？', dev.step2Zh, '格式化电脑主机里的全部硬盘', '长按设备电源关机按键十秒钟'],
        ],
      }
    },
    { situation: 1, capacity: N3_IT_DEVICES.length * N3_IT_FOLLOWUPS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Pour votre toux, dissolvez un sachet de poudre dans un verre d’eau tiède chaque matin. Ne dépassez pas deux sachets par jour et buvez beaucoup d’eau fraîche.',
    questions: [
      ['这种止咳冲剂应该在什么时候服用？', '每天早晨', '每天晚上临睡前', '午饭正餐进食时'],
      ['冲剂每天的最高限量是多少？', '每天不超过两包', '每天可以吃五大包', '每次只能喝半小包'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Pour lancer l’imprimante partagée, appuie sur le bouton vert situé sur le côté droit. Attends que le voyant bleu devienne fixe avant d’envoyer ton premier document.',
    questions: [
      ['开启打印机应按下哪个按钮？', '右侧的绿色按钮', '左侧机身上的红色开关', '正前方最下方的黄色按键'],
      ['什么时候才可以发送打印文件？', '蓝灯常亮稳定时', '机器红灯闪烁报警时', '机器蜂鸣声响三次后'],
    ],
  },
]

export const N03_L_4 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const c = pick(N3_COMPLIMENTS, rand)
      const m = pick(N3_MEETINGS, rand)
      const text = `Wow, ${c.item} est ${c.adj} ! Cela te va à merveille ${m}. Tu fais une excellente impression auprès de toute l’équipe aujourd’hui.`
      return {
        text,
        questions: [
          ['说话人赞赏了对方的什么穿着？', c.itemZh, '新买的皮质公文包', '手腕上戴的手表品牌'],
          ['同事表达的核心赞赏意思是？', c.effectZh, '请你快点出发走吧', '买这件衣服太昂贵了'],
        ],
      }
    },
    { situation: 0, capacity: N3_COMPLIMENTS.length * N3_MEETINGS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const p = pick(['Mélanie', 'Amadou', 'Sofia', 'Émile', 'Karim', 'Lucia'], rand)
      const ch = pick(N3_CHEERS, rand)
      const adv = pick(N3_CHEER_ADVICES, rand)
      const text = `Chère ${p}, j’ai appris que tu avais ${ch.condition}. Je te souhaite ${ch.wish}. Surtout, ${adv} Reviens-nous en pleine forme !`
      return {
        text,
        questions: [
          ['朋友发来这段关怀的主要内容是？', ch.wishZh, '催促按时提交业务报告', '祝贺考取专业职业证书'],
          ['朋友得知对方出现了什么状况？', ch.conditionZh, '刚从国外旅游度假回来', '准备跳槽去其他新公司'],
        ],
      }
    },
    { situation: 1, capacity: 6 * N3_CHEERS.length * N3_CHEER_ADVICES.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const c = pick(N3_COMPLIMENTS, rand)
      const m = pick(N3_MEETINGS, rand)
      const text = `Dis donc, ${c.item} est ${c.adj} ! Cela donne un style très professionnel ${m}. Honnêtement, cela te met beaucoup en valeur.`
      return {
        text,
        questions: [
          ['同事称赞了什么随身物品或着装？', c.itemZh, '办公桌上的精致摆设', '手写的会议重要记录本'],
          ['同事表达的赞赏评价是？', c.effectZh, '衣物质地比较轻薄透气', '款式看起来十分陈旧过时'],
        ],
      }
    },
    { situation: 0, capacity: N3_COMPLIMENTS.length * N3_MEETINGS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const p = pick(['Karim', 'Lucia', 'Jin', 'Fatima', 'Patrick', 'Sarah'], rand)
      const ch = pick(N3_CHEERS, rand)
      const text = `Salut ${p} ! J’ai su pour ${ch.condition}. Ne t’en fais pas pour les dossiers du bureau, nous prenons le relais. Prends le temps de guérir complètement.`
      return {
        text,
        questions: [
          ['同事发来这段问候的目的是？', '表达关怀并让其安心养病', '询问借调外地出差的意向', '商量周末换班调班的事情'],
          ['关于办公室的工作，同事说了什么？', '大家会分担，不必操心', '必须按期自己远程做完', '所有项目暂停等待返回'],
        ],
      }
    },
    { situation: 1, capacity: 6 * N3_CHEERS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Félicitations pour ta promotion ! Ton nouveau veston bleu marine est très classe et s’accorde parfaitement à tes nouvelles fonctions. Tu as fière allure !',
    questions: [
      ['说话人称赞了同事的什么着装？', '深蓝色西装外套', '白色运动慢跑鞋', '冬天防寒厚手套'],
      ['« Tu as fière allure » 的意思是：', '你看起来气派精神', '你走路走得太快了', '你感到非常骄傲自大'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Coucou Julie ! Je viens aux nouvelles après ton opération du genou. J’espère que tu as moins mal. Reste bien tranquille à la maison et reviens en pleine forme !',
    questions: [
      ['朋友为什么发来这段慰问？', '得知对方刚做了膝盖手术', '庆祝对方搬入了新公寓', '祝贺对方喜添新生宝宝'],
      ['朋友希望朱莉怎样休养？', '安心静养，等完全康复再回', '每天多出门散步慢跑', '尽快回单位报到工作'],
    ],
  },
]

// -------------------------------------------------------------
// N03 READING
// -------------------------------------------------------------

const N3_JOBS = [
  'commis à la caisse',
  'vendeur au rayon vêtements',
  'commis d’épicerie',
  'associé au service à la clientèle',
  'aide-magasinier en réserve',
]

const N3_SHIFTS = [
  'en semaine et les fins de semaine',
  'du jeudi au samedi inclusivement',
  'sur les quarts de soir en semaine',
  'de jour du lundi au mercredi',
]

const N3_ATTACHMENTS = [
  'votre curriculum vitæ complet',
  'vos disponibilités de travail écrites',
  'deux références professionnelles vérifiables',
  'une copie de votre diplôme secondaire',
]

const N3_SCHOOLS = [
  'Saint-Jean-Baptiste',
  'Marguerite-Bourgeoys',
  'Marie-Victorin',
  'Jacques-Cartier',
]

const N3_CARE_HOURS = [
  'dès 7 h le matin et après les cours jusqu’à 18 h',
  'sur la période du midi et après la classe',
  'le matin à 7 h 30 et en fin de journée',
]

const N3_MED_INFOS = [
  'les allergies alimentaires connues',
  'les vaccins obligatoires reçus',
  'les problèmes de santé particuliers',
  'les contacts du médecin de famille',
]

export const N03_R_0 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const school = pick(['Saint-Jean-Baptiste', 'Marguerite-Bourgeoys', 'Jacques-Cartier', 'Sainte-Bernadette'], rand)
      const date = pick(['le 14 octobre', 'le 18 novembre', 'le 22 octobre', 'le 12 novembre'], rand)
      const rsvp = pick(['le 10 octobre', 'le 12 novembre', 'le 17 octobre', 'le 7 novembre'], rand)
      const text = `École primaire ${school}. Rencontre individuelle parents-enseignants : ${date}, de 17 h à 20 h, au gymnase de l’école. Veuillez confirmer votre présence auprès du secrétariat avant ${rsvp}. Le stationnement est gratuit pour les familles.`
      return {
        text,
        questions: [
          ['De quel évènement s’agit-il dans cet avis ?', 'une rencontre individuelle parents-enseignants', 'un concert de musique de fin d’année', 'une foire du livre organisée par la ville'],
          ['Avant quelle date doit-on confirmer sa venue ?', rsvp, 'le 30 décembre', 'le premier septembre'],
        ],
      }
    },
    { situation: 0, capacity: 16 }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const market = pick(['du Vieux-Port', 'de Limoilou', 'de Rosemont', 'de Sainte-Foy'], rand)
      const date = pick(['le 15 mai', 'le premier juin', 'le 20 mai', 'le 10 juin'], rand)
      const text = `Ville de Québec. Ouverture du marché public ${market} dès ${date} ! Retrouvez plus de trente producteurs locaux : fruits frais, légumes de saison, fromages artisanaux et boulangerie. Ouvert tous les samedis et dimanches de 8 h à 14 h.`
      return {
        text,
        questions: [
          ['Quelle annonce municipale est présentée dans le texte ?', 'l’ouverture d’un marché public de quartier', 'la fermeture temporaire d’une piscine publique', 'des travaux majeurs de voirie dans les rues'],
          ['Quels jours le marché accueille-t-il le public ?', 'tous les samedis et dimanches', 'uniquement le mercredi après-midi', 'tous les soirs après dix-neuf heures'],
        ],
      }
    },
    { situation: 1, capacity: 16 }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const school = pick(['Monseigneur-Parent', 'Paul-Gérin-Lajoie', 'Joseph-François-Perrault'], rand)
      const text = `École secondaire ${school}. Réunion d’information de début d’année le jeudi 25 septembre à 18 h 30 à l’auditorium. Les parents d’élèves recevront l’agenda scolaire et le calendrier des examens. Inscription obligatoire par courriel avant mardi.`
      return {
        text,
        questions: [
          ['Où aura lieu cette réunion d’information ?', 'à l’auditorium de l’école secondaire', 'dans la cour de récréation extérieure', 'à la mairie de l’arrondissement voisin'],
          ['Comment les parents doivent-ils s’inscrire ?', 'par courriel avant mardi', 'par la poste avec un chèque', 'en venant sans prévenir'],
        ],
      }
    },
    { situation: 0, capacity: 3 }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const city = pick(['Laval', 'Longueuil', 'Sherbrooke', 'Trois-Rivières'], rand)
      const text = `Ville de ${city}. Marché champêtre d’été au parc central. Venez déguster nos produits du terroir, fleurs coupées et pains frais chaque dimanche de juin à septembre, de 9 h à 15 h. Entrée libre et aire de jeux pour enfants disponible.`
      return {
        text,
        questions: [
          ['Quel est le lieu de tenue de ce marché champêtre ?', 'au parc central', 'au centre hospitalier', 'dans le sous-sol de l’église'],
          ['Combien coûte l’entrée pour les visiteurs ?', 'l’entrée est libre et gratuite', 'l’entrée coûte vingt dollars', 'l’entrée exige un achat'],
        ],
      }
    },
    { situation: 1, capacity: 4 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Garderie Les Petits Lutins. Convocation à l’assemblée générale annuelle des parents : mardi 14 octobre à 19 h dans la salle communautaire. Nous élirons les représentants au conseil d’administration. Confirmez votre participation auprès de l’éducatrice avant vendredi.',
    questions: [
      ['Quel est le but de cette assemblée générale ?', 'élire les représentants au conseil d’administration', 'organiser une collecte de vieux jouets d’enfants', 'annoncer la fermeture définitive de la garderie'],
      ['À quelle heure débute la rencontre ?', 'à 19 heures', 'à midi pile', 'à 8 heures le matin'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Ville de Montréal. Dépliant de quartier : le grand marché artisanal d’automne s’installe sur la place Simon-Valois le 20 septembre de 10 h à 17 h. Venez encourager nos artisans et créateurs québécois. Kiosques d’artisanat, musique et café chaud.',
    questions: [
      ['Quel évènement ce dépliant présente-t-il ?', 'le grand marché artisanal d’automne', 'un match de hockey sur glace junior', 'un défilé de voitures anciennes en ville'],
      ['Sur quelle place publique l’évènement a-t-il lieu ?', 'sur la place Simon-Valois', 'sur le pont Jacques-Cartier', 'dans le métro Berri-UQAM'],
    ],
  },
]

export const N03_R_1 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const job = pick(N3_JOBS, rand)
      const shift = pick(N3_SHIFTS, rand)
      const att = pick(N3_ATTACHMENTS, rand)
      const text = `Formulaire d’embauche - Commerce de détail. Poste convoité : ${job}. Nom : … Prénom : … Téléphone : … Disponibilités : ${shift}. Expérience dans le domaine : oui / non. Veuillez joindre ${att} à votre demande.`
      return {
        text,
        questions: [
          ['Quel document le candidat remplit-il ici ?', 'un formulaire d’embauche pour un emploi', 'une facture d’électricité résidentielle', 'une contravention pour mauvais stationnement'],
          ['Quel document d’accompagnement est exigé ?', att, 'un acte de vente notarié pour une maison', 'un carnet de vaccination pour animal de compagnie'],
        ],
      }
    },
    { situation: 0, capacity: N3_JOBS.length * N3_SHIFTS.length * N3_ATTACHMENTS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const school = pick(N3_SCHOOLS, rand)
      const hours = pick(N3_CARE_HOURS, rand)
      const med = pick(N3_MED_INFOS, rand)
      const text = `École primaire ${school}. Inscription au service de garde scolaire. Nom de l’enfant : … Année scolaire en cours : … Horaires demandés : ${hours}. Information médicale à préciser : ${med}. Téléphone d’urgence des parents : …`
      return {
        text,
        questions: [
          ['À quel service scolaire ce formulaire sert-il ?', 'au service de garde de l’école primaire', 'au club de ski alpin de la région voisine', 'aux cours de natation sportive en piscine'],
          ['Quelle information sur l’enfant doit être indiquée ?', med, 'la pointure exacte de ses souliers de course', 'le titre de son jeu vidéo favori à la maison'],
        ],
      }
    },
    { situation: 1, capacity: N3_SCHOOLS.length * N3_CARE_HOURS.length * N3_MED_INFOS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const store = pick(['Pharmaprix', 'Jean Coutu', 'Canadian Tire', 'Walmart', 'Bureau en Gros'], rand)
      const job = pick(N3_JOBS, rand)
      const shift = pick(N3_SHIFTS, rand)
      const text = `Candidature spontanée chez ${store}. Poste souhaité : ${job}. Nom et prénom : … Adresse : … Disponibilité demandée : ${shift}. Avez-vous un permis valide : oui / non. Date d’entrée en fonction souhaitée : …`
      return {
        text,
        questions: [
          ['Dans quel établissement ce poste est-il offert ?', `dans un magasin de la chaîne ${store}`, 'dans un centre hospitalier universitaire', 'dans un bureau d’avocats spécialistes'],
          ['Quel renseignement de travail le candidat donne-t-il ?', `sa disponibilité : ${shift}`, 'son nombre moyen d’heures de sommeil chaque nuit', 'la date de ses prochaines vacances d’été au bord de la mer'],
        ],
      }
    },
    { situation: 0, capacity: 5 * N3_JOBS.length * N3_SHIFTS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const school = pick(N3_SCHOOLS, rand)
      const hours = pick(N3_CARE_HOURS, rand)
      const text = `Service de garde de l’école ${school}. Fiche annuelle de fréquentation. Prénom de l’enfant : … Groupe-classe : … Périodes d’accueil retenues : ${hours}. Autorisation de départ autonome : oui / non. Signature du parent responsable : …`
      return {
        text,
        questions: [
          ['Que doivent signer les parents en bas de la fiche ?', 'la signature du parent responsable', 'un contrat de prêt bancaire personnel', 'une autorisation de voyage à l’étranger'],
          ['Quel choix d’horaires est proposé sur la fiche ?', hours, 'uniquement le samedi matin de 9 h à 12 h pour des cours', 'les nuits complètes durant toutes les fins de semaine'],
        ],
      }
    },
    { situation: 1, capacity: N3_SCHOOLS.length * N3_CARE_HOURS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Formulaire de demande d’emploi - Supermarché Metro. Postes disponibles : commis d’emballage, caissière, poissonnier. Avez-vous de l’expérience avec le public ? Êtes-vous étudiant ? Indiquez vos heures de cours du lundi au vendredi.',
    questions: [
      ['Pour quel type de commerce ce formulaire est-il conçu ?', 'un supermarché d’alimentation générale', 'un cabinet de dentistes spécialisés', 'un atelier de mécanique automobile'],
      ['Que doivent préciser les candidats qui étudient ?', 'leurs heures de cours du lundi au vendredi', 'leurs résultats aux examens universitaires', 'le titre des livres scolaires achetés'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Service des loisirs municipaux. Formulaire de camp de jour estival. Prénom et nom du jeune : … Âge : … Allergies aux piqûres d’insectes : … Prise de médicaments pendant le séjour : oui / non. Contact d’urgence et numéro de cellulaire : …',
    questions: [
      ['Pour quelle activité estivale ce formulaire est-il requis ?', 'le camp de jour municipal pour les jeunes', 'l’inscription à l’école secondaire pour adultes', 'l’achat d’un permis de pêche en rivière'],
      ['Quelle information médicale particulière est relevée ?', 'les allergies aux piqûres d’insectes', 'le type de brosse à dents utilisée', 'le groupe sanguin des voisins de palier'],
    ],
  },
]

export const N03_R_2 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const role = pick(['Commis d’entrepôt', 'Adjoint administratif', 'Préposé à l’accueil', 'Aide-cuisinier'], rand)
      const req = pick([
        { skill: 'excellente ponctualité et esprit d’équipe', exp: 'une année d’expérience souhaitée' },
        { skill: 'bon entregent et souci du détail', exp: 'aucune expérience requise, formation offerte' },
        { skill: 'bonne forme physique et autonomie', exp: 'expérience en manutention un atout' },
        { skill: 'maîtrise du français parlé et rigueur', exp: 'diplôme d’études secondaires demandé' },
      ], rand)
      const text = `Offre d’emploi. Titre du poste : ${role}. Profil recherché : personne dynamique démontrant ${req.skill}. Exigences : ${req.exp}. Disponibilité demandée du lundi au vendredi, 35 heures par semaine. Envoyez votre candidature à rh@entreprise.ca.`
      return {
        text,
        questions: [
          ['Quel est le poste proposé dans cette annonce ?', role, 'comptable certifié de l’entreprise', 'directeur des ressources humaines'],
          ['Quelle qualité essentielle est recherchée pour ce rôle ?', req.skill, 'connaissance approfondie du droit fiscal', 'expérience de dix ans comme gestionnaire'],
        ],
      }
    },
    { situation: 0, capacity: 16 }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const type = pick(['Beau quatre et demie', 'Grand trois et demie', 'Spacieux cinq et demie'], rand)
      const area = pick(['dans Rosemont', 'à Sainte-Foy', 'dans Saint-Sauveur', 'près du métro Jarry'], rand)
      const rent = pick(['1 180 $ par mois', '950 $ par mois', '1 350 $ par mois', '1 050 $ par mois'], rand)
      const text = `À louer : ${type} ensoleillé ${area}. Loyer de ${rent}. Deux chambres fermées, planchers de bois franc, salle de bain rénovée et balcon privé. Entrée laveuse-sécheuse incluse. Chauffage non inclus. Chats acceptés, non-fumeur. Disponible dès le 1er juillet.`
      return {
        text,
        questions: [
          ['Combien coûte le loyer de ce logement ?', rent, '2 500 $ par mois', '400 $ par mois'],
          ['Quelle caractéristique intérieure est mentionnée ?', 'planchers en bois et balcon privé', 'cour arrière avec deux piscines', 'salle de cinéma au sous-sol'],
        ],
      }
    },
    { situation: 1, capacity: 48 }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const job = pick(['Caissier à temps partiel', 'Commis de pharmacie', 'Préposé au service client'], rand)
      const qual = pick(['courtoisie et rigueur au comptoir', 'sens de l’organisation et entregent', 'ponctualité et entregent avec le public'], rand)
      const text = `Pharmacie du quartier cherche ${job} pour les soirs et fins de semaine. Profil : ${qual}. Environnement agréable et rabais aux employés sur place. Déposez votre curriculum vitæ directement au comptoir de vente.`
      return {
        text,
        questions: [
          ['Quel poste cette pharmacie souhaite-t-elle pourvoir ?', job, 'médecin spécialiste de garde', 'directeur financier régional'],
          ['Quel avantage est expressément accordé au personnel ?', 'des rabais aux employés sur place', 'une voiture de fonction neuve offerte', 'des voyages annuels payés en Floride'],
        ],
      }
    },
    { situation: 0, capacity: 9 }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const city = pick(['Sherbrooke', 'Trois-Rivières', 'Gatineau', 'Laval'], rand)
      const rent = pick(['720 dollars', '840 dollars', '790 dollars', '890 dollars'], rand)
      const text = `Logement à louer : deux et demie meublé au centre-ville de ${city}. Loyer à ${rent} tout compris (chauffage, électricité et internet haute vitesse inclus). Parfait pour étudiant ou travailleur seul. Buanderie payante dans l’immeuble. Libre immédiatement.`
      return {
        text,
        questions: [
          ['Que comprend le montant du loyer mensuel ?', 'chauffage, électricité et internet', 'seulement les repas du midi et du soir', 'uniquement le nettoyage des vêtements'],
          ['À quel public ce logement s’adresse-t-il idéalement ?', 'à un étudiant ou travailleur seul', 'à une grande famille de six enfants', 'à un groupe de touristes en vacances'],
        ],
      }
    },
    { situation: 1, capacity: 16 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'CPE Les Petits Soleils recrute une éducatrice à la petite enfance remplaçante. Profil attendu : diplôme reconnu ou attestation en garderie, patience, esprit créatif et certificat de premiers soins valide. Salaire selon l’échelle officielle du ministère de la Famille.',
    questions: [
      ['Dans quel organisme ce poste est-il offert ?', 'dans un centre de la petite enfance (CPE)', 'dans une usine de transformation du bois', 'dans une station de radio communautaire'],
      ['Quelle attestation médicale est formellement exigée ?', 'un certificat de premiers soins valide', 'un diplôme de médecine générale', 'un certificat de pilote d’avion privé'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Annonce immobilière : superbe quatre et demie rénové dans Limoilou au rez-de-chaussée d’un triplex paisible. Grande cour arrière clôturée, cuisine moderne avec lave-vaisselle fourni, stationnement déneigé en hiver. Loyer de 1 290 dollars. Dossier de crédit demandé.',
    questions: [
      ['Quel équipement ménager est fourni dans la cuisine ?', 'un lave-vaisselle moderne', 'un four à pizza commercial', 'une machine à crème glacée'],
      ['Quel aménagement extérieur est mentionné pour l’hiver ?', 'un stationnement déneigé', 'une patinoire privée', 'une serre chauffée'],
    ],
  },
]

const N3_CLEANERS = [
  { name: 'Nettoyant multi-surfaces écologique', action: 'Vaporiser à vingt centimètres de la surface.', wait: 'Laisser agir deux minutes sans frotter.', wipe: 'Essuyer avec un chiffon sec en microfibre.', warn: 'Ne jamais mélanger avec de l’eau de Javel.' },
  { name: 'Désinfectant doux pour la cuisine', action: 'Appliquer sur une éponge propre et humide.', wait: 'Laisser reposer pendant trois minutes.', wipe: 'Rincer ensuite abondamment à l’eau claire.', warn: 'Conserver hors de portée des jeunes enfants.' },
  { name: 'Dégraissant puissant pour cuisinière', action: 'Verser quelques gouttes directement sur la tache.', wait: 'Attendre cinq minutes avant de nettoyer.', wipe: 'Frotter doucement avec un linge doux.', warn: 'Éviter tout contact direct avec les yeux.' },
  { name: 'Savon liquide pour planchers de bois', action: 'Diluer deux bouchons dans un seau d’eau tiède.', wait: 'Passer une vadrouille bien essorée.', wipe: 'Laisser sécher à l’air libre sans rincer.', warn: 'Ne jamais appliquer sur du bois non verni.' },
  { name: 'Nettoyant vitres et miroirs sans traces', action: 'Pulvériser uniformément sur la vitre sèche.', wait: 'Laisser agir quelques secondes seulement.', wipe: 'Passer une raclette en caoutchouc propre.', warn: 'Ne pas inhaler les vapeurs de produit.' },
]

const N3_PHARMA = [
  { med: 'Comprimés contre le rhume', dose: 'Prendre un comprimé toutes les six heures.', max: 'Ne pas dépasser quatre prises par jour.', dur: 'cinq jours consécutifs', store: 'Garder dans un endroit sec à température ambiante.' },
  { med: 'Sirop contre la toux sèche', dose: 'Prendre une cuillère le matin et le soir.', max: 'Ne pas dépasser deux cuillères en 24 heures.', dur: 'sept jours au besoin', store: 'Conserver la bouteille bien fermée après usage.' },
  { med: 'Gélules pour la digestion', dose: 'Prendre deux gélules au milieu du repas.', max: 'Ne pas prendre plus de quatre gélules par jour.', dur: 'dix jours consécutifs', store: 'Mettre à l’abri de l’humidité et du soleil.' },
  { med: 'Pastilles pour la gorge', dose: 'Sucer lentement une pastille aux quatre heures.', max: 'Maximum strict de six pastilles par journée.', dur: 'trois jours au besoin', store: 'Tenir hors de la portée des jeunes enfants.' },
  { med: 'Gouttes nasales décongestionnantes', dose: 'Mettre deux gouttes dans chaque narine.', max: 'Ne pas utiliser plus de trois fois par jour.', dur: 'quatre jours consécutifs', store: 'Ranger au frais après chaque utilisation.' },
]

export const N03_R_3 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const c = pick(N3_CLEANERS, rand)
      const text = `${c.name}. Mode d’emploi : ${c.action} ${c.wait} ${c.wipe} Mise en garde de sécurité : ${c.warn} Fabriqué au Québec.`
      return {
        text,
        questions: [
          ['Quelle est la première étape d’utilisation indiquée ?', c.action, 'Faire bouillir le liquide dans une grande casserole sur le feu', 'Mettre tout le produit directement dans la machine à laver'],
          ['Quelle consigne de sécurité doit-on respecter ?', c.warn, 'Changer les piles de l’appareil de nettoyage chaque mois', 'Verser la totalité de la bouteille en une seule utilisation'],
        ],
      }
    },
    { situation: 0, capacity: N3_CLEANERS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const p = pick(N3_PHARMA, rand)
      const text = `Notice médicale - ${p.med}. Posologie recommandée : ${p.dose} ${p.max} Durée prévue : ${p.dur}. Précaution : ${p.store} En cas de doute, consultez un pharmacien.`
      return {
        text,
        questions: [
          ['À quelle fréquence ce médicament doit-il être pris ?', p.dose, 'Prendre toute la boîte de médicaments en une seule fois', 'Prendre une dose complète toutes les demi-heures en journée'],
          ['Quelle limite de sécurité est précisée dans la notice ?', p.max, 'Boire deux litres de café très chaud chaque matin au lever', 'Arrêter complètement de manger pendant trois jours entiers'],
        ],
      }
    },
    { situation: 1, capacity: N3_PHARMA.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const c = pick(N3_CLEANERS, rand)
      const brand = pick(['Éco-Ménage', 'Net-Maison', 'Pur-Québec', 'Bio-Propre'], rand)
      const text = `Produit d’entretien ${brand} : ${c.name.toLowerCase()}. Conseils pratiques : ${c.action} ${c.wait} Ensuite, ${c.wipe.toLowerCase()} Attention : ${c.warn.toLowerCase()}`
      return {
        text,
        questions: [
          ['Comment doit-on appliquer ce produit d’entretien ?', c.action, 'Le verser dans une bouilloire électrique avec de l’huile', 'L’appliquer avec vigueur sur des vêtements fragiles en soie'],
          ['Quelle mise en garde importante figure sur le flacon ?', c.warn, 'Garder la bouteille au congélateur pendant toute la semaine', 'Remplacer le bouchon après chaque minute d’utilisation'],
        ],
      }
    },
    { situation: 0, capacity: N3_CLEANERS.length * 4 }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const p = pick(N3_PHARMA, rand)
      const dur = pick(['trois jours consécutifs', 'cinq jours complets', 'sept jours ouvrables', 'dix jours de suite'], rand)
      const text = `Pharmacie du quartier. Posologie pour ${p.med.toLowerCase()} : ${p.dose} Durée : ${dur}. ${p.max} Rangement : ${p.store.toLowerCase()} Respectez bien les doses.`
      return {
        text,
        questions: [
          ['Quelle posologie le pharmacien a-t-il inscrite ?', p.dose, 'Une seule cuillère par mois au coucher pour un adulte', 'Quatre prises par heure sans arrêt pendant deux semaines'],
          ['Quelle consigne de rangement est recommandée ?', p.store, 'Laisser le médicament sous la pluie dans le jardin public', 'Mettre la boîte de médicaments dans le four très chaud'],
        ],
      }
    },
    { situation: 1, capacity: N3_PHARMA.length * 4 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Nettoyant pour vitres et miroirs. Mode d’emploi : vaporiser sur une vitre propre et sèche à quinze centimètres. Essuyer avec du papier absorbant ou un chiffon non pelucheux. Ne pas avaler. Tenir à l’écart des flammes.',
    questions: [
      ['Sur quelle surface ce produit s’applique-t-il ?', 'sur une vitre propre et sèche', 'sur un tapis de salon très humide et sale', 'sur des ustensiles de cuisine en aluminium'],
      ['Quel chiffon est recommandé pour essuyer ?', 'du papier absorbant ou un chiffon sec', 'une serviette de bain épaisse très mouillée', 'une éponge abrasive en métal pour plancher'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Posologie - Sirop pour enfants de plus de six ans. Prendre une cuillère à thé toutes les huit heures après les repas. Ne pas dépasser trois prises par 24 heures. Bien agiter le flacon avant l’usage.',
    questions: [
      ['Quel est le nombre maximal de prises autorisées par jour ?', 'trois prises par 24 heures', 'dix prises complètes par journée de classe', 'une seule cuillère par semaine au coucher'],
      ['Que faut-il faire avec le flacon avant l’usage ?', 'bien agiter le flacon', 'chauffer le flacon au four à micro-ondes', 'laisser le flacon ouvert toute la nuit dehors'],
    ],
  },
]

const N3_TEXTO_PRAISE = [
  { friend: 'Camille', topic: 'ta présentation orale de ce matin', topicZh: 'présentation orale', detail: 'Tu as parlé avec beaucoup de calme et d’assurance', detailZh: 'assurance et clarté' },
  { friend: 'Valérie', topic: 'ton nouveau manteau d’automne', topicZh: 'nouveau manteau', detail: 'La couleur te donne une mine vraiment éclatante', detailZh: 'couleur éclatante' },
  { friend: 'Mélanie', topic: 'tes photos de notre randonnée', topicZh: 'photos de randonnée', detail: 'Les paysages des montagnes sont magnifiques', detailZh: 'beauté des paysages' },
  { friend: 'Sophie', topic: 'ton délicieux gâteau aux pommes', topicZh: 'gâteau aux pommes', detail: 'Toute la famille a adoré ta recette maison', detailZh: 'recette très appréciée' },
  { friend: 'Chloé', topic: 'ton beau dessin pour l’exposition', topicZh: 'dessin d’exposition', detail: 'Les couleurs vives attirent tout de suite le regard', detailZh: 'belles couleurs vives' },
]

const N3_TEXTO_CLOSINGS = [
  'Passe une très belle journée !',
  'On se reparle très vite pour un café !',
  'Félicitations encore pour ton travail !',
  'Prends bien soin de toi aujourd’hui !',
]

const N3_BIRTHDAY_GREETINGS = [
  { colleague: 'Émile', wish: 'un très joyeux anniversaire', wishDetail: 'beaucoup de bonheur et une excellente santé', note: 'Profite bien de cette journée festive avec tes proches.' },
  { colleague: 'Karim', wish: 'une merveilleuse journée de fête', wishDetail: 'la réussite dans tous tes beaux projets', note: 'Ne pense pas aux dossiers du bureau aujourd’hui.' },
  { colleague: 'Martin', wish: 'un superbe anniversaire', wishDetail: 'des moments inoubliables en famille', note: 'Toute l’équipe a hâte de célébrer cela avec toi demain.' },
  { colleague: 'Sébastien', wish: 'une très belle fête', wishDetail: 'de la joie et de beaux succès personnels', note: 'Prends le temps de savourer chaque instant de fête.' },
  { colleague: 'Alexandre', wish: 'un chaleureux anniversaire', wishDetail: 'une année pleine de santé et d’énergie', note: 'Nous serons ravis de trinquer à ta santé sous peu.' },
]

const N3_BIRTHDAY_SIGNOFFS = [
  'À très bientôt au bureau !',
  'Passe une excellente soirée !',
  'Au plaisir de fêter cela ensemble !',
  'Bien cordialement de la part de l’équipe !',
]

export const N03_R_4 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const t = pick(N3_TEXTO_PRAISE, rand)
      const cl = pick(N3_TEXTO_CLOSINGS, rand)
      const text = `Coucou ! Je voulais te féliciter pour ${t.topic}. ${t.detail}. Tu as vraiment beaucoup de talent. ${cl}`
      return {
        text,
        questions: [
          ['Sur quoi porte le compliment reçu dans ce message ?', `sur ${t.topic}`, 'sur l’achat d’une nouvelle voiture familiale pour l’hiver', 'sur une réservation de billets de train pour voyager loin'],
          ['Quelle appréciation positive l’amie formule-t-elle ?', t.detail, 'le prix très bas des magasins du centre commercial', 'la rapidité d’expédition du colis postal prioritaire'],
        ],
      }
    },
    { situation: 0, capacity: N3_TEXTO_PRAISE.length * N3_TEXTO_CLOSINGS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const b = pick(N3_BIRTHDAY_GREETINGS, rand)
      const sign = pick(N3_BIRTHDAY_SIGNOFFS, rand)
      const text = `Bonjour ! De la part de toute l’équipe, je te souhaite ${b.wish}. Nous te souhaitons ${b.wishDetail}. ${b.note} ${sign}`
      return {
        text,
        questions: [
          ['Quel est le but principal de ce courriel ?', 'souhaiter un joyeux anniversaire', 'demander un rapport de travail très urgent', 'annoncer une réunion de crise du personnel'],
          ['Quels vœux bienveillants le collègue exprime-t-il ?', b.wishDetail, 'un contrat d’achat d’un camion d’occasion révisé', 'un déménagement dans une autre province canadienne'],
        ],
      }
    },
    { situation: 1, capacity: N3_BIRTHDAY_GREETINGS.length * N3_BIRTHDAY_SIGNOFFS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const t = pick(N3_TEXTO_PRAISE, rand)
      const cl = pick(N3_TEXTO_CLOSINGS, rand)
      const text = `Salut ! Un petit mot pour te dire que j’ai adoré ${t.topic}. ${t.detail}. C’est vraiment très réussi. ${cl}`
      return {
        text,
        questions: [
          ['De quoi parle l’amie dans ce texto amical ?', `de ${t.topic}`, 'd’une facture d’électricité résidentielle imprévue', 'd’un vol d’avion retardé de nuit par mauvais temps'],
          ['Quel commentaire appréciatif l’amie ajoute-t-elle ?', t.detail, 'une plainte sur la météo pluvieuse de la semaine', 'une demande de remboursement d’argent emprunté'],
        ],
      }
    },
    { situation: 0, capacity: N3_TEXTO_PRAISE.length * N3_TEXTO_CLOSINGS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const b = pick(N3_BIRTHDAY_GREETINGS, rand)
      const sign = pick(N3_BIRTHDAY_SIGNOFFS, rand)
      const text = `Cher collègue, je tiens à te souhaiter ${b.wish}. Pour cette nouvelle année, je te souhaite ${b.wishDetail}. ${b.note} ${sign}`
      return {
        text,
        questions: [
          ['Pour quelle occasion ce courriel est-il rédigé ?', 'l’anniversaire d’un membre de l’équipe', 'le départ à la retraite du directeur général', 'l’embauche d’un nouveau stagiaire d’été'],
          ['Que souhaite l’expéditeur pour la nouvelle année ?', b.wishDetail, 'des heures supplémentaires obligatoires le samedi', 'une réduction importante des congés payés annuels'],
        ],
      }
    },
    { situation: 1, capacity: N3_BIRTHDAY_GREETINGS.length * N3_BIRTHDAY_SIGNOFFS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Allô Marc ! Ton nouveau manteau d’hiver te va super bien. La couleur bleue et la coupe moderne sont parfaites pour toi. Belle trouvaille pour la saison !',
    questions: [
      ['Quel article fait l’objet de ce compliment ?', 'un nouveau manteau d’hiver', 'une paire de bottes de ski alpin neuves', 'un sac à dos d’école en toile épaisse'],
      ['Qu’est-ce qui est particulièrement apprécié ?', 'la couleur bleue et la coupe moderne', 'le prix d’achat très bon marché en solde', 'la marque de fabrication européenne réputée'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Bonjour Sophie ! Toute l’équipe du bureau te souhaite un joyeux anniversaire. Que cette journée t’apporte joie, repos et sourires avec ta famille. On t’attend demain avec le gâteau !',
    questions: [
      ['Quelle fête les collègues célèbrent-ils par courriel ?', 'l’anniversaire de naissance de Sophie', 'l’arrivée d’un nouveau client important', 'la fin des examens de fin d’année'],
      ['Qu’est-ce qui est prévu au bureau pour le lendemain ?', 'partager un gâteau avec l’équipe', 'participer à une réunion de crise urgente', 'faire des heures supplémentaires de soir'],
    ],
  },
]

// Registry export for Niveaux 3 & 4
export const N03_04_SCENARIOS = {
  'n3-listening-0': N03_L_0,
  'n3-listening-1': N03_L_1,
  'n3-listening-2': N03_L_2,
  'n3-listening-3': N03_L_3,
  'n3-listening-4': N03_L_4,
  'n3-reading-0': N03_R_0,
  'n3-reading-1': N03_R_1,
  'n3-reading-2': N03_R_2,
  'n3-reading-3': N03_R_3,
  'n3-reading-4': N03_R_4,
}
