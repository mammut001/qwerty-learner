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

// N04 LISTENING TABLES & SCENARIOS
// -------------------------------------------------------------

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
  'les pièces et la main-d’œuvre à domicile',
  'le moteur électrique et les réparations urgentes',
  'toutes les pannes mécaniques imprévues sur place',
  'le remplacement complet en cas de bris majeur',
  'les fuites internes et les pièces électroniques',
]

export const N04_L_0 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const apt = pick(N4_APTS, rand)
      const rent = pick(N4_RENTS, rand)
      const avail = pick(N4_AVIALS, rand)
      const land = pick(N4_LANDLORDS, rand)
      const text = `Bonjour, ici ${land}. Je vous rappelle pour le logement ${apt.type} ${apt.street} ${apt.city}. Le loyer est fixé à ${rent} par mois, chauffé et éclairé. Le bail débute ${avail}. L’appartement comprend une entrée laveuse-sécheuse et un grand balcon. Rappelez-moi au ${apt.num} pour planifier une visite ce samedi.`
      return {
        text,
        questions: [
          ['Combien coûte le loyer mensuel de ce logement ?', `${rent} par mois`, '800 dollars par mois', '2 100 dollars par mois'],
          ['Quand le logement est-il disponible pour le locataire ?', avail, 'le premier janvier', 'dès ce soir sans délai'],
        ],
      }
    },
    { situation: 0, capacity: N4_APTS.length * N4_RENTS.length * N4_AVIALS.length * N4_LANDLORDS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const app = pick(N4_APPLIANCES, rand)
      const years = pick(N4_APPLIANCE_YEARS, rand)
      const price = pick(N4_APPLIANCE_PRICES, rand)
      const cov = pick(N4_APPLIANCE_COVS, rand)
      const text = `Pour la garantie prolongée ${app.itemFr}, notre magasin propose une protection de ${years} pour seulement ${price}. Ce contrat avantageux couvre ${cov}. Si un technicien certifié ne peut pas réparer l’appareil à domicile, le commerçant s’engage à vous fournir un appareil entièrement neuf.`
      return {
        text,
        questions: [
          ['Combien coûte cette protection supplémentaire ?', price, '45 dollars', '350 dollars'],
          ['Que comprend la couverture de ce contrat de garantie ?', cov, 'uniquement les frais de livraison initiaux du meuble', 'seulement le manuel d’instruction traduit en trois langues'],
        ],
      }
    },
    { situation: 1, capacity: N4_APPLIANCES.length * N4_APPLIANCE_YEARS.length * N4_APPLIANCE_PRICES.length * N4_APPLIANCE_COVS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const apt = pick(N4_APTS, rand)
      const rent = pick(N4_RENTS, rand)
      const avail = pick(N4_AVIALS, rand)
      const land = pick(N4_LANDLORDS, rand)
      const text = `Bonjour, c’est ${land}, le propriétaire de l’immeuble. Notre ${apt.type} situé ${apt.street} est libre pour ${avail}. Le prix convenu est de ${rent} chaque mois, avec eau chaude et stationnement extérieur inclus. L’endroit est paisible. Vous pouvez me joindre au ${apt.num} en début de soirée.`
      return {
        text,
        questions: [
          ['Quel est le montant du loyer mensuel demandé ?', `${rent} chaque mois`, '650 dollars chaque mois', '1 900 dollars chaque mois'],
          ['À quelle date le contrat de location débute-t-il ?', avail, 'au milieu de l’automne', 'dès la fin décembre'],
        ],
      }
    },
    { situation: 0, capacity: N4_APTS.length * N4_RENTS.length * N4_AVIALS.length * N4_LANDLORDS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const app = pick(N4_APPLIANCES, rand)
      const years = pick(N4_APPLIANCE_YEARS, rand)
      const price = pick(N4_APPLIANCE_PRICES, rand)
      const cov = pick(N4_APPLIANCE_COVS, rand)
      const text = `— Bonjour ! En achetant ${app.item}, la garantie de base du fabricant ne dure qu’une seule année. Je vous conseille d’ajouter notre plan de ${years} au coût de ${price}. Ce contrat prévoit ${cov}. En cas de pépin mécanique, vous n’avez aucuns frais imprévus à débourser.`
      return {
        text,
        questions: [
          ['Quelle est la durée de la garantie offerte au client ?', years, 'dix années de garantie', 'six mois de protection'],
          ['Quel est le prix demandé pour ce contrat avantageux ?', price, '75 dollars', '500 dollars'],
        ],
      }
    },
    { situation: 1, capacity: N4_APPLIANCES.length * N4_APPLIANCE_YEARS.length * N4_APPLIANCE_PRICES.length * N4_APPLIANCE_COVS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: 'Bonjour, ici la propriétaire du triplex de la 8e Avenue à Limoilou. Notre trois et demie au rez-de-chaussée est prêt pour une sous-location dès le 1er mai. Le loyer est de 890 dollars par mois, comprenant le chauffage et une cour arrière clôturée. Contactez-moi au 418 555-0112.',
    questions: [
      ['Quel est le loyer mensuel du trois et demie ?', '890 dollars par mois', '1 500 dollars par mois', '450 dollars par mois'],
      ['Quel aménagement extérieur est inclus avec le logement ?', 'une cour arrière clôturée', 'une piscine creusée chauffée', 'un garage double intérieur'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: 'Pour votre nouveau climatiseur portatif, nous recommandons le plan de service de trois ans à 99 dollars. Cette garantie couvre le compresseur, la main-d’œuvre et un entretien gratuit chaque printemps. En cas de bris l’été, un technicien intervient en 48 heures ouvrables.',
    questions: [
      ['Quel est le tarif de ce plan de service ?', '99 dollars', '250 dollars', '30 dollars'],
      ['Quel entretien gratuit est prévu par le contrat ?', 'un entretien chaque printemps', 'un nettoyage chaque semaine', 'un filtre neuf chaque jour'],
    ],
  },
]

const N4_DISPENSERS = [
  { machine: 'la distributrice de boissons chaudes', slot: 'dans la fente à gauche', step2: 'choisis ta boisson sur l’écran tactile', product: 'café filtre, thé chaud ou chocolat', button: 'le bouton vert pour valider' },
  { machine: 'la distributrice de collations santé', slot: 'au lecteur de cartes du haut', step2: 'tape le numéro de ton choix sur le clavier', product: 'barres tendres, noix et fruits secs', button: 'la touche étoile pour confirmer' },
  { machine: 'la borne de recharge pour cartes repas', slot: 'dans le boîtier lumineux', step2: 'indique le montant souhaité sur le pavé', product: 'virements directs ou paiements comptant', button: 'le bouton bleu pour obtenir le reçu' },
]

const N4_COLLEAGUES = ['Sophie', 'Carlos', 'Youssef', 'Chloé', 'Amadou', 'Valérie']

const N4_EVENING_PLANS = [
  { friend: 'Carlos', reason: 'aider mon frère à déménager ses meubles', whyZh: 'déménager des meubles avec son frère', time: 'dès 18 h 00', nextDay: 'vendredi en fin de journée' },
  { friend: 'Youssef', reason: 'suivre mon cours de perfectionnement au cégep', whyZh: 'suivre un cours du soir au cégep', time: 'dès 18 h 30', nextDay: 'jeudi après les cours' },
  { friend: 'Sophie', reason: 'assister à la réunion des parents de l’école', whyZh: 'participer à la réunion des parents', time: 'dès 19 h 00', nextDay: 'samedi en début d’après-midi' },
  { friend: 'Chloé', reason: 'garder les enfants de ma sœur aînée', whyZh: 'garder les jeunes enfants de sa sœur', time: 'dès 17 h 30', nextDay: 'dimanche avant le souper' },
]

export const N04_L_1 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const d = pick(N4_DISPENSERS, rand)
      const col = pick(N4_COLLEAGUES, rand)
      const text = `— Dis ${col}, tu sais comment fonctionne ${d.machine} ? — Oui, c’est très facile ! D’abord, tu insères ta carte d’employé ${d.slot}. Ensuite, ${d.step2}. La machine propose ${d.product}. Enfin, tu appuies sur ${d.button} pour compléter ta commande. Ton article sort immédiatement.`
      return {
        text,
        questions: [
          ['Que demande la collègue au début de la conversation ?', 'comment se servir d’un appareil partagé', 'où se trouve la cafétéria du personnel', 'le prix d’un repas chaud à emporter'],
          ['Où faut-il insérer la carte d’employé au départ ?', d.slot, 'dans le bac à papier sous l’imprimante', 'derrière la porte de l’ascenseur principal'],
        ],
      }
    },
    { situation: 0, capacity: N4_DISPENSERS.length * N4_COLLEAGUES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const p = pick(N4_EVENING_PLANS, rand)
      const text = `— Allô ${p.friend} ! Je t’appelle rapidement pour savoir si tu as envie qu’on aille prendre un verre ce soir après le bureau ? — Salut ! J’aimerais beaucoup, mais j’ai déjà promis d’${p.reason} ${p.time}. Par contre, est-ce que tu serais disponible ${p.nextDay} pour qu’on se voie tranquillement ?`
      return {
        text,
        questions: [
          ['Quelle sortie l’ami propose-t-il pour la soirée ?', 'prendre un verre après le bureau', 'faire un grand voyage en train', 'participer à une course sportive'],
          ['Pourquoi l’interlocuteur décline-t-il l’invitation ?', p.whyZh, 'il a égaré son portefeuille en ville', 'il doit réparer sa bicyclette brisée'],
        ],
      }
    },
    { situation: 1, capacity: N4_EVENING_PLANS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const d = pick(N4_DISPENSERS, rand)
      const col = pick(N4_COLLEAGUES, rand)
      const text = `— Excuse-moi ${col}, je n’arrive pas à faire marcher ${d.machine}. — Ne t’inquiète pas, regarde. Dépose ta carte ${d.slot}, puis ${d.step2}. Tu peux obtenir ${d.product}. Il suffit ensuite de presser ${d.button}. C’est prêt en quelques secondes.`
      return {
        text,
        questions: [
          ['Quelle action permet de finaliser la commande ?', `presser ${d.button}`, 'redémarrer l’électricité du local', 'appeler le directeur des finances'],
          ['Quel type d’articles cet équipement distribue-t-il ?', d.product, 'des chaussures de travail en cuir brun', 'des dictionnaires de langue française'],
        ],
      }
    },
    { situation: 0, capacity: N4_DISPENSERS.length * N4_COLLEAGUES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const p = pick(N4_EVENING_PLANS, rand)
      const caller = pick(['Marc', 'Lucas', 'Antoine', 'Félix'], rand)
      const text = `— Salut ${p.friend}, c’est ${caller} ! Tu as du temps libre ce soir pour aller au cinéma du quartier ? — Coucou ! Ce soir c’est impossible, car je dois ${p.reason} ${p.time}. Mais si tu es libre ${p.nextDay}, on pourrait se faire une belle sortie ensemble.`
      return {
        text,
        questions: [
          ['Quelle activité de loisir est initialement suggérée ?', 'aller au cinéma du quartier ce soir', 'faire une randonnée en forêt samedi', 'acheter des meubles dans un magasin'],
          ['À quel moment l’ami se dit-il disponible pour se voir ?', p.nextDay, 'dans deux mois après les vacances', 'tard dans la nuit de dimanche'],
        ],
      }
    },
    { situation: 1, capacity: N4_EVENING_PLANS.length * 4 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Peux-tu m’aider avec le photocopieur de la réception ? — Bien sûr. Tu ouvres le bac à papier, tu places tes feuilles dans le bon sens, puis tu choisis le nombre de copies sur l’écran tactile. Appuie enfin sur la touche de départ bleue pour démarrer l’impression.',
    questions: [
      ['De quel appareil de bureau s’agit-il dans l’extrait ?', 'du photocopieur de la réception', 'du système de climatisation centrale', 'du broyeur de déchets alimentaires'],
      ['Sur quelle touche faut-il appuyer pour lancer la copie ?', 'sur la touche de départ bleue', 'sur le bouton d’alarme rouge', 'sur la manette de gauche'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— Allô Maxime ! On va manger une pizza au restaurant italien ce soir avec l’équipe, tu te joins à nous ? — Malheureusement non, je dois préparer mon appartement pour l’arrivée de mes parents dès 19 h 00. Mais je serai libre demain midi pour dîner avec vous.',
    questions: [
      ['Pourquoi Maxime ne peut-il pas venir au restaurant ?', 'il prépare son logis pour ses parents', 'il doit faire des heures supplémentaires', 'il a un rendez-vous chez le dentiste'],
      ['Quelle autre proposition Maxime fait-il à son collègue ?', 'dîner ensemble demain midi', 'reporter la rencontre à l’année prochaine', 'annuler définitivement le projet'],
    ],
  },
]

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
  'ressentez des difficultés respiratoires',
  'avez des signes de déshydratation sévère',
  'constatez une enflure autour des yeux',
  'observez une baisse soudaine de tension',
]

export const N04_L_2 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const team = pick(N4_HOCKEY_TEAMS, rand)
      const shots = pick(N4_HOCKEY_SHOTS, rand)
      const period = pick(N4_HOCKEY_PERIODS, rand)
      const outcome = pick(N4_HOCKEY_OUTCOMES, rand)
      const text = `— Tu as vu le match du Canadien hier soir contre ${team} ? C’était tout un spectacle ! Notre gardien a bloqué ${shots} avec une efficacité remarquable. On a eu deux punitions ${period}, mais les joueurs ont tenu le coup et ont inscrit ${outcome}. Tous les spectateurs criaient de joie dans les estrades !`
      return {
        text,
        questions: [
          ['De quel évènement sportif les deux collègues discutent-ils ?', 'd’une partie de hockey sur glace disputée', 'd’un match très disputé de tennis en salle', 'd’une compétition de natation en plein air'],
          ['Quelle performance du gardien de but est soulignée ?', `il a bloqué ${shots}`, 'il a marqué trois buts lui-même en attaque', 'il est resté assis sur le banc des remplaçants'],
        ],
      }
    },
    { situation: 0, capacity: N4_HOCKEY_TEAMS.length * N4_HOCKEY_SHOTS.length * N4_HOCKEY_PERIODS.length * N4_HOCKEY_OUTCOMES.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const ill = pick(N4_CLINIC_ILLNESSES, rand)
      const symp = pick(N4_CLINIC_SYMPTOMS, rand)
      const warn = pick(N4_CLINIC_WARNINGS, rand)
      const text = `— Bonjour. Pour soigner ${ill.name}, les symptômes habituels comprennent ${symp.fr}. Buvez beaucoup de liquides tièdes et gardez le lit au moins trois jours. En revanche, si vous ${warn}, contactez sans délai le service Info-Santé 811 ou rendez-vous au centre médical le plus proche.`
      return {
        text,
        questions: [
          ['Quels symptômes initiaux sont décrits par le soignant ?', symp.zh, 'une entorse à la cheville et de légères rougeurs', 'une coupure superficielle et des douleurs au bras'],
          ['Dans quelle situation faut-il consulter immédiatement ?', `si vous ${warn}`, 'si vous ressentez une simple fatigue passagère en soirée', 'si la température extérieure baisse légèrement en ville'],
        ],
      }
    },
    { situation: 1, capacity: N4_CLINIC_ILLNESSES.length * N4_CLINIC_SYMPTOMS.length * N4_CLINIC_WARNINGS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const team = pick(N4_HOCKEY_TEAMS, rand)
      const shots = pick(N4_HOCKEY_SHOTS, rand)
      const period = pick(N4_HOCKEY_PERIODS, rand)
      const outcome = pick(N4_HOCKEY_OUTCOMES, rand)
      const text = `— Quelle victoire pour le Canadien face à ${team} ! Le match a été très serré jusqu’à la toute fin. En défense, le gardien a repoussé ${shots}. Malgré une punition sévère ${period}, notre équipe a décroché ${outcome}. Toute la ville en parle ce matin à la radio !`
      return {
        text,
        questions: [
          ['Quelle équipe le Canadien affrontait-il hier soir ?', `l’équipe de ${team}`, 'une formation de soccer professionnel', 'un club de baseball américain amateur'],
          ['Quel dénouement a marqué la fin de cette rencontre ?', outcome, 'une prolongation complète sans aucun but marqué', 'une défaite par quatre points d’écart à la fin'],
        ],
      }
    },
    { situation: 0, capacity: N4_HOCKEY_TEAMS.length * N4_HOCKEY_SHOTS.length * N4_HOCKEY_PERIODS.length * N4_HOCKEY_OUTCOMES.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const ill = pick(N4_CLINIC_ILLNESSES, rand)
      const symp = pick(N4_CLINIC_SYMPTOMS, rand)
      const warn = pick(N4_CLINIC_WARNINGS, rand)
      const text = `— Bonjour madame. Dans le cas ${ill.elide}, il est fréquent de ressentir ${symp.fr}. Prenez le traitement prescrit et évitez tout effort physique cette semaine. Cependant, si vous constatez que vous ${warn}, rendez-vous sans attendre à la clinique d’urgence.`
      return {
        text,
        questions: [
          ['Quel problème médical est analysé lors de cette consultation ?', ill.zh, 'une brûlure modérée au deuxième degré', 'une douleur temporaire à une dent de sagesse'],
          ['Quelle consigne de repos le professionnel transmet-il ?', 'éviter tout effort physique cette semaine', 'courir un long marathon dès le lendemain', 'partir en voyage d’affaires à l’étranger'],
        ],
      }
    },
    { situation: 1, capacity: N4_CLINIC_ILLNESSES.length * N4_CLINIC_SYMPTOMS.length * N4_CLINIC_WARNINGS.length }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Quel beau match de hockey hier entre Montréal et Ottawa ! Après un début difficile où nous tirions de l’arrière par deux buts, les attaquants ont marqué trois fois en troisième période. Le Centre Bell était en fête et l’ambiance était formidable pour les supporters québécois.',
    questions: [
      ['Quelle remontée sportive est décrite par le témoin ?', 'trois buts marqués en troisième période', 'un abandon rapide de l’équipe adverse', 'une annulation de la partie à la demie'],
      ['Quel sentiment régnait chez les partisans à la fin ?', 'une ambiance joyeuse et festive', 'une profonde déception générale', 'une grande colère envers les arbitres'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— À la suite de votre piqûre d’insecte, une rougeur locale et une démangeaison modérée sont normales pendant deux jours. Appliquez de la glace enveloppée dans un linge propre. Par contre, si vous observez un gonflement du visage ou une difficulté à avaler, appelez sans tarder le 911.',
    questions: [
      ['Quelle réaction est considérée comme normale au début ?', 'une rougeur locale et une démangeaison', 'une perte complète de motricité', 'une forte fièvre durant deux semaines'],
      ['Quel symptôme grave impose d’appeler le 911 ?', 'gonflement du visage ou difficulté à avaler', 'léger picotement sans gravité sur le bras', 'envie passagère de faire une petite sieste'],
    ],
  },
]

const N4_AIRPORT_CITIES = ['de Paris', 'de Vancouver', 'de Sept-Îles', 'de Halifax', 'de Calgary']
const N4_AIRPORT_WAITS = ['pendant plus d’une heure au carrousel', 'pendant quarante-cinq minutes au débarcadère', 'pendant près d’une heure à l’arrivée', 'pendant plus d’une heure et demie']
const N4_AIRPORT_BAGS = ['ma grosse valise rouge', 'mon sac de voyage noir', 'ma valise bleue à roulettes', 'mon sac à dos vert foncé']
const N4_AIRPORT_RESOLUTIONS = [
  'la compagnie me l’a livrée le lendemain midi',
  'un livreur est passé chez moi deux jours plus tard',
  'l’agente m’a appelé le lendemain matin pour la récupérer',
  'le service des bagages l’a déposée à ma porte mardi',
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
  { act: 'rouler en vélo le long des plages sablonneuses', short: 'du vélo sur les sentiers de sable fin' },
]
const N4_FAMILY_DETAILS = [
  'd’observer des canards sauvages et marcher en forêt',
  'd’admirer la vue panoramique sur les lacs étincelants',
  'de pique-niquer tranquillement au bord des cascades',
  'de se baigner et savourer de la crème glacée au soleil',
]

export const N04_L_3 = [
  // Scenario 1 (Template, situation: 0)
  Object.assign(
    (rand) => {
      const city = pick(N4_AIRPORT_CITIES, rand)
      const wait = pick(N4_AIRPORT_WAITS, rand)
      const bag = pick(N4_AIRPORT_BAGS, rand)
      const res = pick(N4_AIRPORT_RESOLUTIONS, rand)
      const text = `— Tu ne devineras jamais ce qui m’est arrivé à l’aéroport de Montréal en rentrant ${city} ! En débarquant du vol, j’ai attendu ${bag} ${wait}. Le carrousel s’est arrêté et il n’y avait plus rien. J’ai rempli une réclamation au comptoir. Heureusement, ${res} !`
      return {
        text,
        questions: [
          ['Quel incident de voyage la personne raconte-t-elle ?', 'la perte temporaire de son bagage à l’aéroport', 'l’annulation définitive de son vol international', 'le vol de ses documents d’identité dans un hôtel'],
          ['Comment cette mésaventure s’est-elle finalement terminée ?', res, 'le bagage a été confisqué et détruit par la douane', 'le passager a dû racheter toute sa garde-robe d’hiver'],
        ],
      }
    },
    { situation: 0, capacity: N4_AIRPORT_CITIES.length * N4_AIRPORT_WAITS.length * N4_AIRPORT_BAGS.length * N4_AIRPORT_RESOLUTIONS.length }
  ),
  // Scenario 2 (Template, situation: 1)
  Object.assign(
    (rand) => {
      const park = pick(N4_FAMILY_PARKS, rand)
      const act = pick(N4_FAMILY_ACTS, rand)
      const det = pick(N4_FAMILY_DETAILS, rand)
      const text = `— Samedi passé, nous avons passé une merveilleuse journée en famille ${park}. Le matin était ensoleillé et nous avons pu ${act.act}. Les enfants étaient enchantés ${det}. C’est vraiment un endroit parfait pour déconnecter de la routine urbaine et respirer l’air pur.`
      return {
        text,
        questions: [
          ['Où cette famille a-t-elle passé sa fin de semaine ?', park, 'dans un vaste centre d’achats souterrain fermé', 'dans une salle de cinéma climatisée du centre-ville'],
          ['Quelle activité de plein air ont-ils réalisée ensemble ?', act.short, 'une visite guidée de monuments historiques anciens', 'un atelier payant de cuisine traditionnelle en salle'],
        ],
      }
    },
    { situation: 1, capacity: N4_FAMILY_PARKS.length * N4_FAMILY_ACTS.length * N4_FAMILY_DETAILS.length }
  ),
  // Scenario 3 (Template, situation: 0 variant)
  Object.assign(
    (rand) => {
      const city = pick(N4_AIRPORT_CITIES, rand)
      const wait = pick(N4_AIRPORT_WAITS, rand)
      const bag = pick(N4_AIRPORT_BAGS, rand)
      const res = pick(N4_AIRPORT_RESOLUTIONS, rand)
      const text = `— Figure-toi qu’en revenant de mon voyage d’affaires ${city}, j’ai vécu une vraie péripétie à l’aéroport. J’ai guetté ${bag} ${wait}, mais elle n’est jamais apparue. Après avoir signalé la disparition au personnel, je suis rentré chez moi sans affaires. Par chance, ${res}.`
      return {
        text,
        questions: [
          ['Quel objet manquait à l’arrivée du voyageur ?', bag, 'sa pochette contenant son passeport officiel', 'son ordinateur portable de travail flambant neuf'],
          ['Combien de temps le voyageur a-t-il attendu au carrousel ?', wait, 'cinq petites minutes seulement avant de partir', 'toute la nuit jusqu’au lendemain après-midi'],
        ],
      }
    },
    { situation: 0, capacity: N4_AIRPORT_CITIES.length * N4_AIRPORT_WAITS.length * N4_AIRPORT_BAGS.length * N4_AIRPORT_RESOLUTIONS.length }
  ),
  // Scenario 4 (Template, situation: 1 variant)
  Object.assign(
    (rand) => {
      const park = pick(N4_FAMILY_PARKS, rand)
      const act = pick(N4_FAMILY_ACTS, rand)
      const day = pick(['Dimanche dernier', 'En fin de semaine dernière', 'La semaine passée'], rand)
      const text = `— ${day}, nous avons organisé une escapade mémorable avec les enfants ${park}. Nous avions réservé pour ${act.act}. Tout le monde a adoré l’expérience. Nous sommes rentrés le soir fatigués mais ravis de cette belle journée en nature québécoise.`
      return {
        text,
        questions: [
          ['Quelle activité a particulièrement plu aux participants ?', act.short, 'la réparation d’un véhicule automobile en panne', 'l’achat de billets de loterie dans un kiosque'],
          ['Dans quel cadre naturel cette sortie s’est-elle déroulée ?', park, 'au rez-de-chaussée d’une tour à bureaux moderne', 'au bord d’une autoroute très achalandée le soir'],
        ],
      }
    },
    { situation: 1, capacity: N4_FAMILY_PARKS.length * N4_FAMILY_ACTS.length * 3 }
  ),
  // Scenario 5 (Static, situation: 0)
  {
    situation: 0,
    text: '— Je reviens tout juste de Toronto. Tout allait bien jusqu’à ce que je réalise que ma valise avait été envoyée par erreur à Halifax ! L’agente au comptoir a été très gentille : elle m’a donné une trousse de toilette de secours. Mon sac m’a finalement été livré à mon hôtel vingt-quatre heures plus tard.',
    questions: [
      ['Dans quelle ville la valise avait-elle été expédiée par erreur ?', 'à Halifax par mégarde', 'à Paris en Europe', 'à Calgary dans l’Ouest'],
      ['Qu’a remis l’agente au voyageur pour le dépanner ?', 'une trousse de toilette de secours', 'un nouveau billet d’avion gratuit', 'une valise de marque neuve'],
    ],
  },
  // Scenario 6 (Static, situation: 1)
  {
    situation: 1,
    text: '— On a fait une magnifique sortie à la cabane à sucre avec les enfants et les grands-parents samedi midi. On a mangé un repas traditionnel copieux : soupe aux pois, tourtière et crêpes au sirop d’érable chaud. Ensuite, les petits ont fait une promenade en traîneau dans la forêt enneigée.',
    questions: [
      ['Quel type d’endroit la famille a-t-elle visité ?', 'une cabane à sucre traditionnelle', 'une usine de transformation du verre', 'un musée des beaux-arts en ville'],
      ['Quelle activité extérieure a réjoui les enfants après le repas ?', 'une promenade en traîneau dans la forêt', 'une baignade en eau profonde glacée', 'une course de bicyclettes sur route'],
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
