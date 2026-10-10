// Échelle québécoise scenarios for Niveau 1 and Niveau 2 indicators.
// Covers both official situations types (examples) for every listening and reading indicator.
// Yields >= 12 distinct texts per indicator across random seeds.

import {
  PERSONAS,
  NATIONALITIES,
  PROFESSIONS,
  DAYS,
  MONTHS,
  DATES,
  CLOCK_TIMES,
  ROOM_NUMBERS,
  PHONE_NUMBERS,
  CLASSROOM_OBJECTS,
  CLASSROOM_INSTRUCTIONS,
  PLACES_SERVICES,
  FAMILY_RELATIONS,
  PAYMENT_METHODS,
  SIMPLE_DIRECTIONS,
  pick,
  sample,
} from './shared.mjs'

export const N01_02_SCENARIOS = {
  // ===========================================================================
  // NIVEAU 1 - LISTENING
  // ===========================================================================

  // n1-listening-0
  // Ex 1: Comprendre la nationalité et le métier d’une nouvelle connaissance.
  // Ex 2: Comprendre le numéro de local et le numéro de téléphone du secrétariat.
  'n1-listening-0': [
    // Scenario 1 (Template, Ex 1): New acquaintance identity & profession
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const nat = pick(NATIONALITIES, rand)
        const prof = pick(PROFESSIONS, rand)
        const otherNats = sample(NATIONALITIES.filter((n) => n.zh !== nat.zh), 2, rand)
        const otherProfs = sample(PROFESSIONS.filter((p) => p.zh !== prof.zh), 2, rand)
        const natFr = persona.gender === 'f' ? nat.f : nat.m
        const profFr = persona.gender === 'f' ? prof.f : prof.m
        return {
          text: `Bonjour, je m’appelle ${persona.name}. Je suis ${natFr}. Je suis ${profFr}.`,
          questions: [
            [`${persona.name} 是哪国人？`, nat.zh, otherNats[0].zh, otherNats[1].zh],
            [`${persona.name} 的职业是？`, prof.zh, otherProfs[0].zh, otherProfs[1].zh],
          ],
        }
      },
      { capacity: PERSONAS.length * NATIONALITIES.length * PROFESSIONS.length }
    ),
    // Scenario 2 (Template, Ex 2): Secretariat room & phone number
    Object.assign(
      (rand) => {
        const room = pick(ROOM_NUMBERS, rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.fr !== room.fr), 2, rand)
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Bonjour. Le secrétariat est au local ${room.fr}. Le numéro de téléphone est le ${phone.fr}.`,
          questions: [
            ['秘书处的办公室号码是？', room.fr, otherRooms[0].fr, otherRooms[1].fr],
            ['秘书处的电话号码是？', phone.fr, otherPhones[0].fr, otherPhones[1].fr],
          ],
        }
      },
      { capacity: ROOM_NUMBERS.length * PHONE_NUMBERS.length }
    ),
    // Scenario 3 (Template, Ex 1 variant): Workplace introduction
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const nat = pick(NATIONALITIES, rand)
        const prof = pick(PROFESSIONS, rand)
        const otherNats = sample(NATIONALITIES.filter((n) => n.zh !== nat.zh), 2, rand)
        const otherProfs = sample(PROFESSIONS.filter((p) => p.zh !== prof.zh), 2, rand)
        const natFr = persona.gender === 'f' ? nat.f : nat.m
        const profFr = persona.gender === 'f' ? prof.f : prof.m
        return {
          text: `Salut ! Moi, c’est ${persona.name}. Je suis ${natFr} et je travaille comme ${profFr} à Montréal.`,
          questions: [
            ['说话者的国籍是？', nat.zh, otherNats[0].zh, otherNats[1].zh],
            ['说话者从事什么职业？', prof.zh, otherProfs[0].zh, otherProfs[1].zh],
          ],
        }
      },
      { capacity: PERSONAS.length * NATIONALITIES.length * PROFESSIONS.length }
    ),
  ],

  // n1-listening-1
  // Ex 1: Réagir à des questions se rapportant à son identité en vue de se présenter lors d’un échange brise-glace.
  // Ex 2: Réagir à des questions se rapportant à ses coordonnées lors d’une inscription à un cours.
  'n1-listening-1': [
    // Scenario 1 (Template, Ex 1): Ice-breaker identity questions
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Bonjour ! Moi, c’est ${persona.name}. Comment vous vous appelez, s’il vous plaît ? Et vous venez de quel pays ?`,
          questions: [
            ['对方询问了什么？', '名字和原籍国', '职业和年龄', '电话号码和地址'],
            ['合适的回答是：', `Je m’appelle ${otherPersonas[0].name}. Je viens du Mexique.`, 'Il est huit heures et demie.', 'Très bien, merci beaucoup !'],
          ],
        }
      },
      { capacity: PERSONAS.length }
    ),
    // Scenario 2 (Template, Ex 2): Registration contact details
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const phone = pick(PHONE_NUMBERS, rand)
        return {
          text: `Bonjour. Quel est votre prénom ? — Je m’appelle ${persona.name}. — Et votre numéro de téléphone ? — C’est le ${phone.fr}.`,
          questions: [
            ['前台在询问什么？', '名字和电话号码', '家庭住址和邮编', '生日和工作单位'],
            ['对方报出的电话号码是：', phone.fr, '514 555-9999', '418 555-8888'],
          ],
        }
      },
      { capacity: PERSONAS.length * PHONE_NUMBERS.length }
    ),
    // Scenario 3 (Template, Ex 2 variant): Address and postal code
    Object.assign(
      (rand) => {
        const num = pick([102, 215, 340, 480, 520, 640, 710, 850], rand)
        const street = pick(['Saint-Denis', 'Saint-Laurent', 'Saint-Jean', 'René-Lévesque', 'Mont-Royal', 'Sainte-Catherine'], rand)
        return {
          text: `Bonjour monsieur. Votre adresse est bien le ${num} rue ${street} ? Et quel est votre code postal ?`,
          questions: [
            ['工作人员在询问和核对什么信息？', '住址和邮政编码', '姓名和电话', '课程名称和时间'],
            ['门牌号是：', String(num), '100', '999'],
          ],
        }
      },
      { capacity: 48 }
    ),
  ],

  // n1-listening-2
  // Ex 1: Comprendre les noms des principaux objets de la salle de classe.
  // Ex 2: Comprendre des mots désignant la fonction du personnel du service de garde.
  'n1-listening-2': [
    // Scenario 1 (Template, Ex 1): Classroom objects on the table
    Object.assign(
      (rand) => {
        const objs = sample(CLASSROOM_OBJECTS, 3, rand)
        const text = `Voici la classe. Sur la table, il y a ${objs[0].fr}, ${objs[1].fr} et ${objs[2].fr}. Le professeur est devant le tableau.`
        const alt1 = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o)), 3, rand)
        const alt2 = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o) && !alt1.includes(o)), 3, rand)
        return {
          text,
          questions: [
            ['桌子上有什么物品？', `${objs[0].zh}、${objs[1].zh}和${objs[2].zh}`, `${alt1[0].zh}、${alt1[1].zh}和${alt1[2].zh}`, `${alt2[0].zh}、${alt2[1].zh}和${alt2[2].zh}`],
            ['老师在哪里？', '黑板前面', '门旁边', '窗户旁边'],
          ],
        }
      },
      { capacity: 120 }
    ),
    // Scenario 2 (Template, Ex 2): Childcare staff roles
    Object.assign(
      (rand) => {
        const names = sample(['Tremblay', 'Gagnon', 'Roy', 'Bouchard', 'Gauthier', 'Morin'], 2, rand)
        const text = `Au service de garde, madame ${names[0]} est l’éducatrice et monsieur ${names[1]} est le responsable.`
        const wrongName = pick(['Côté', 'Pelletier', 'Bélanger'], rand)
        return {
          text,
          questions: [
            ['谁是幼教老师（éducatrice）？', `Madame ${names[0]}`, `Monsieur ${names[1]}`, `Madame ${wrongName}`],
            [`Monsieur ${names[1]} 的职务是？`, '负责人（responsable）', '厨师', '校车司机'],
          ],
        }
      },
      { capacity: 30 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Schoolbag items
    Object.assign(
      (rand) => {
        const objs = sample(CLASSROOM_OBJECTS, 3, rand)
        const text = `Dans mon sac d’école, j’ai ${objs[0].fr}, ${objs[1].fr} et ${objs[2].fr}. Le livre est sur le pupitre.`
        const alt1 = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o)), 3, rand)
        const alt2 = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o) && !alt1.includes(o)), 3, rand)
        return {
          text,
          questions: [
            ['书包里有什么？', `${objs[0].zh}、${objs[1].zh}和${objs[2].zh}`, `${alt1[0].zh}、${alt1[1].zh}和${alt1[2].zh}`, `${alt2[0].zh}、${alt2[1].zh}和${alt2[2].zh}`],
            ['书放在哪里？', '课桌上', '椅子下', '黑板前'],
          ],
        }
      },
      { capacity: 120 }
    ),
  ],

  // n1-listening-3
  // Ex 1: Comprendre la date de la fête d’anniversaire d’une amie.
  // Ex 2: Comprendre l’heure de début d’un atelier énoncée par le responsable.
  'n1-listening-3': [
    // Scenario 1 (Template, Ex 1): Friend's birthday party date and time
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const day = pick(DAYS, rand)
        const date = pick(DATES, rand)
        const month = pick(MONTHS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 13 && t.hour <= 19), rand)
        const otherMonths = sample(MONTHS.filter((m) => m.num !== month.num), 2, rand)
        const otherHours = sample([11, 14, 15, 17, 18, 20].filter((h) => h !== time.hour), 2, rand)
        return {
          text: `La fête d’anniversaire de ${persona.name}, c’est le ${day.fr} ${date.dayText} ${month.fr}, à ${time.hour} heures.`,
          questions: [
            ['派对是哪一天？', `${month.num} 月 ${date.dayNum} 日`, `${otherMonths[0].num} 月 ${date.dayNum} 日`, `${otherMonths[1].num} 月 2 日`],
            ['派对几点开始？', `下午 ${time.hour > 12 ? time.hour - 12 : time.hour} 点`, `下午 ${otherHours[0] > 12 ? otherHours[0] - 12 : otherHours[0]} 点`, `下午 ${otherHours[1] > 12 ? otherHours[1] - 12 : otherHours[1]} 点`],
          ],
        }
      },
      { capacity: PERSONAS.length * DAYS.length * DATES.length * MONTHS.length }
    ),
    // Scenario 2 (Template, Ex 2): Workshop start time and room
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 9 && t.hour <= 16), rand)
        const room = pick(ROOM_NUMBERS, rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.display !== room.display), 2, rand)
        return {
          text: `Attention tout le monde : l’atelier de français commence le ${day.fr} à ${time.hour} heures, dans la salle ${room.fr}.`,
          questions: [
            ['工作坊在星期几进行？', day.zh, otherDays[0].zh, otherDays[1].zh],
            ['工作坊在哪间教室？', room.display, otherRooms[0].display, otherRooms[1].display],
          ],
        }
      },
      { capacity: DAYS.length * CLOCK_TIMES.length * ROOM_NUMBERS.length }
    ),
    // Scenario 3 (Template, Ex 1 variant): Medical appointment
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const date = pick(DATES, rand)
        const month = pick(MONTHS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 8 && t.hour <= 16), rand)
        const otherDates = sample(DATES.filter((d) => d.dayNum !== date.dayNum), 2, rand)
        const otherHours = sample([9, 10, 11, 14, 15, 16].filter((h) => h !== time.hour), 2, rand)
        return {
          text: `Votre rendez-vous à la clinique est le ${day.fr} ${date.dayText} ${month.fr}, à ${time.hour} heures.`,
          questions: [
            ['看诊预约在几号？', `${month.num} 月 ${date.dayNum} 日`, `${month.num} 月 ${otherDates[0].dayNum} 日`, `${month.num} 月 ${otherDates[1].dayNum} 日`],
            ['看诊时间是几点？', `${time.hour} 点`, `${otherHours[0]} 点`, `${otherHours[1]} 点`],
          ],
        }
      },
      { capacity: DAYS.length * DATES.length * MONTHS.length * CLOCK_TIMES.length }
    ),
  ],

  // n1-listening-4
  // Ex 1: Réagir à des consignes énoncées par l’enseignant en salle de classe.
  // Ex 2: Réagir à des consignes énoncées par la secrétaire lors d’une inscription.
  'n1-listening-4': [
    // Scenario 1 (Template, Ex 1): Teacher's classroom page instruction
    Object.assign(
      (rand) => {
        const page = pick([8, 12, 14, 18, 22, 25, 30, 42], rand)
        const inst = pick([
          { fr: 'Écoutez et répétez', zh: '听并跟读' },
          { fr: 'Lisez le dialogue', zh: '阅读对话' },
          { fr: 'Écrivez les réponses', zh: '写下答案' },
          { fr: 'Soulignez les verbes', zh: '划出动词' },
        ], rand)
        const otherPages = sample([8, 12, 14, 18, 22, 25, 30, 42, 80].filter((p) => p !== page), 2, rand)
        const otherInsts = sample([
          '听并跟读',
          '阅读对话',
          '写下答案',
          '划出动词',
          '合上书本',
        ].filter((i) => i !== inst.zh), 2, rand)
        return {
          text: `Ouvrez votre livre à la page ${page}. ${inst.fr}.`,
          questions: [
            ['要把书翻到第几页？', String(page), String(otherPages[0]), String(otherPages[1])],
            ['接下来要做什么？', inst.zh, otherInsts[0], otherInsts[1]],
          ],
        }
      },
      { capacity: 32 }
    ),
    // Scenario 2 (Template, Ex 2): Secretary instructions during registration
    Object.assign(
      (rand) => {
        const doc = pick(['votre pièce d’identité', 'votre passeport', 'votre carte d’assurance maladie'], rand)
        return {
          text: `Bonjour monsieur. Signez ici en bas de la page, s’il vous plaît. Donnez-moi aussi ${doc}.`,
          questions: [
            ['秘书要求在哪里签字？', '在页面下方', '在信封背面', '在表格右上角'],
            ['秘书还需要出示什么证件？', doc.includes('passeport') ? '护照' : doc.includes('assurance') ? '医保卡' : '身份证件', '两张照片', '现金支票'],
          ],
        }
      },
      { capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Classroom writing instruction
    Object.assign(
      (rand) => {
        const page = pick([5, 10, 15, 20, 25], rand)
        return {
          text: `Prenez un crayon et votre cahier à la page ${page}. Écrivez la date d’aujourd’hui.`,
          questions: [
            ['老师要求翻到练习本第几页？', String(page), '50', '2'],
            ['要在本子上写下什么？', '今天的日期', '自己的名字', '教室号码'],
          ],
        }
      },
      { capacity: 5 }
    ),
  ],

  // n1-listening-5
  // Ex 1: Comprendre les salutations d’une caissière.
  // Ex 2: Comprendre les remerciements d’un voisin.
  'n1-listening-5': [
    // Scenario 1 (Template, Ex 1): Cashier greetings and price
    Object.assign(
      (rand) => {
        const price = pick([10, 12, 14, 15, 18, 20, 24, 28], rand)
        const otherPrices = sample([10, 12, 14, 15, 18, 20, 24, 28, 50].filter((p) => p !== price), 2, rand)
        return {
          text: `— Bonjour madame ! — Bonjour ! Ça fait ${price} dollars. — Voilà. — Merci, bonne journée ! — Merci, vous aussi !`,
          questions: [
            ['收银员最后说的祝福语是：', 'Bonne journée', 'Bonne nuit', 'Bon appétit'],
            ['一共需要支付多少加元？', `${price} 元`, `${otherPrices[0]} 元`, `${otherPrices[1]} 元`],
          ],
        }
      },
      { capacity: 8 }
    ),
    // Scenario 2 (Template, Ex 2): Neighbor thanks
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Bonjour ${persona.name} ! Merci beaucoup pour ton aide avec mes boîtes. C’est très gentil de ta part !`,
          questions: [
            ['邻居在向谁表示感谢？', persona.name, otherPersonas[0].name, otherPersonas[1].name],
            ['邻居是因为什么事表示感谢？', '帮忙搬箱子', '借钱给邻居', '照看宠物'],
          ],
        }
      },
      { capacity: PERSONAS.length }
    ),
    // Scenario 3 (Template, Ex 1 variant): Dépanneur cashier evening greeting
    Object.assign(
      (rand) => {
        const item = pick(['café', 'muffin', 'jus', 'sandwich'], rand)
        return {
          text: `— Bonjour monsieur ! Votre ${item} et votre reçu. Merci beaucoup et bonne soirée ! — Merci à vous !`,
          questions: [
            ['店员交给了顾客什么？', `${item}和收据`, '报纸和钥匙', '零钱和地图'],
            ['店员祝愿顾客：', '晚上愉快（Bonne soirée）', '生日快乐（Bonne fête）', '周末愉快（Bonne fin de semaine）'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 1 - READING
  // ===========================================================================

  // n1-reading-0
  // Ex 1: Comprendre les jours de la semaine dans un calendrier.
  // Ex 2: Comprendre des mots liés à des lieux et à des services dans son quartier.
  'n1-reading-0': [
    // Scenario 1 (Template, Ex 1): Workshop day, room and time in calendar
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const room = pick(ROOM_NUMBERS, rand)
        const time = pick(CLOCK_TIMES, rand)
        const otherDays = sample(DAYS.filter((d) => d.fr !== day.fr), 2, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.display !== room.display), 2, rand)
        return {
          text: `Quand ? ${day.fr}. Où ? ${room.display}. De quoi ? Atelier conversation. Heure : ${time.frDisplay}.`,
          questions: [
            ['Quel jour ?', day.fr, otherDays[0].fr, otherDays[1].fr],
            ['Où ?', room.display, otherRooms[0].display, otherRooms[1].display],
          ],
        }
      },
      { capacity: DAYS.length * ROOM_NUMBERS.length * CLOCK_TIMES.length }
    ),
    // Scenario 2 (Template, Ex 2): Neighborhood places and services directory
    Object.assign(
      (rand) => {
        const p1 = pick(PLACES_SERVICES, rand)
        const p2 = pick(PLACES_SERVICES.filter((p) => p.fr !== p1.fr), rand)
        const otherPlaces = sample(PLACES_SERVICES.filter((p) => p.fr !== p1.fr && p.fr !== p2.fr), 2, rand)
        return {
          text: `Services dans le quartier : ${p1.fr} sur la rue Principale. ${p2.fr} sur l’avenue du Parc. Ouvert tous les jours.`,
          questions: [
            ['Quel service est situé rue Principale ?', p1.fr, otherPlaces[0].fr, otherPlaces[1].fr],
            [`Où se trouve ${p2.fr} ?`, 'avenue du Parc', 'rue Principale', 'boulevard Saint-Laurent'],
          ],
        }
      },
      { capacity: PLACES_SERVICES.length * (PLACES_SERVICES.length - 1) }
    ),
    // Scenario 3 (Template, Ex 1 variant): Library weekly calendar
    Object.assign(
      (rand) => {
        const d1 = pick(DAYS.slice(0, 3), rand)
        const d2 = pick(DAYS.slice(3, 5), rand)
        const t1 = pick(['9 h 00', '10 h 00', '10 h 30'], rand)
        const t2 = pick(['13 h 30', '14 h 00', '15 h 00'], rand)
        return {
          text: `Calendrier de la bibliothèque : ${d1.fr} : ${t1}. ${d2.fr} : ${t2}. Dimanche : fermé.`,
          questions: [
            ['Quel jour la bibliothèque est-elle fermée ?', 'dimanche', d1.fr, d2.fr],
            [`Quelle heure pour ${d1.fr} ?`, t1, t2, '18 h 00'],
          ],
        }
      },
      { capacity: 18 }
    ),
  ],

  // n1-reading-1
  // Ex 1: Comprendre les données personnelles demandées dans un formulaire pour s’inscrire à un cours.
  // Ex 2: Comprendre les renseignements inscrits sur sa carte d’assurance maladie.
  'n1-reading-1': [
    // Scenario 1 (Template, Ex 1): Course registration form fields
    Object.assign(
      (rand) => {
        const level = pick(['débutant', 'intermédiaire', 'Niveau 1', 'Niveau 2'], rand)
        return {
          text: `Formulaire d’inscription au cours de français (${level}) : nom de famille / prénom / adresse / numéro de téléphone / courriel`,
          questions: [
            ['Quel est le titre ?', 'Formulaire d’inscription', 'Formulaire d’évaluation', 'Formulaire de plainte'],
            ['Laquelle est une catégorie du formulaire ?', 'l’adresse', 'l’âge', 'le métier'],
          ],
        }
      },
      { capacity: 4 }
    ),
    // Scenario 2 (Template, Ex 2): RAMQ health insurance card
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const year = pick([2026, 2027, 2028, 2029], rand)
        const otherNames = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Carte d’assurance maladie (RAMQ) : Nom : TREMBLAY / Prénom : ${persona.name.toUpperCase()} / Sexe : ${persona.gender.toUpperCase()} / Expiration : ${year}-06`,
          questions: [
            ['Ce document officiel est une carte :', 'd’assurance maladie', 'de crédit bancaire', 'd’autobus'],
            ['Quel est le prénom inscrit sur la carte ?', persona.name.toUpperCase(), otherNames[0].name.toUpperCase(), otherNames[1].name.toUpperCase()],
          ],
        }
      },
      { capacity: PERSONAS.length * 4 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Library membership card
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const city = pick(['Montréal', 'Québec', 'Laval', 'Gatineau'], rand)
        const otherNames = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Carte de membre de la bibliothèque : Nom : BOUCHARD / Prénom : ${persona.name.toUpperCase()} / Ville : ${city}`,
          questions: [
            ['De quel document s’agit-il ?', 'une carte de membre de bibliothèque', 'un permis de conduire', 'un passeport'],
            ['Quel est le prénom du titulaire ?', persona.name.toUpperCase(), otherNames[0].name.toUpperCase(), otherNames[1].name.toUpperCase()],
          ],
        }
      },
      { capacity: PERSONAS.length * 4 }
    ),
  ],

  // n1-reading-2
  // Ex 1: Comprendre l’heure de la pause inscrite au tableau de la classe.
  // Ex 2: Comprendre l’heure de passage du prochain autobus affichée sur un panneau numérique.
  'n1-reading-2': [
    // Scenario 1 (Template, Ex 1): Class schedule on board
    Object.assign(
      (rand) => {
        const start = pick(['8 h 30', '9 h 00', '9 h 15'], rand)
        const pause = pick(['10 h 15', '10 h 30', '10 h 45'], rand)
        const end = pick(['11 h 45', '12 h 00', '12 h 15'], rand)
        return {
          text: `Tableau de classe : Début du cours à ${start}. Pause à ${pause}. Fin du cours à ${end}.`,
          questions: [
            ['À quelle heure est la pause ?', pause, start, end],
            ['À quelle heure se termine le cours ?', end, pause, start],
          ],
        }
      },
      { capacity: 27 }
    ),
    // Scenario 2 (Template, Ex 2): Bus digital sign
    Object.assign(
      (rand) => {
        const bus = pick([24, 55, 80, 105, 121, 165], rand)
        const t1 = pick(['10 h 12', '10 h 15', '14 h 20', '15 h 05', '16 h 40'], rand)
        const t2 = pick(['10 h 27', '10 h 30', '14 h 35', '15 h 20', '16 h 55'], rand)
        const otherBuses = sample([24, 55, 80, 105, 121, 165, 435].filter((b) => b !== bus), 2, rand)
        return {
          text: `Panneau d’autobus : Ligne ${bus} vers le métro. Prochain autobus : ${t1}. Suivant : ${t2}.`,
          questions: [
            ['Quelle est la ligne d’autobus affichée ?', `Ligne ${bus}`, `Ligne ${otherBuses[0]}`, `Ligne ${otherBuses[1]}`],
            ['À quelle heure passe le prochain autobus ?', t1, t2, '12 h 00'],
          ],
        }
      },
      { capacity: 30 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Daily hours table
    Object.assign(
      (rand) => {
        const h1 = pick(['9 h 00', '8 h 45', '9 h 15'], rand)
        const h2 = pick(['10 h 15', '10 h 30', '10 h 00'], rand)
        return {
          text: `Horaires d’accueil : Lundi : ${h1}. Mardi : ${h2}. Mercredi : 11 h 30. Jeudi : 13 h 45. Vendredi : 9 h 00.`,
          questions: [
            ['Quelle heure le mardi ?', h2, h1, '11 h 30'],
            ['Quelle heure le jeudi ?', '13 h 45', h2, '9 h 00'],
          ],
        }
      },
      { capacity: 9 }
    ),
  ],

  // n1-reading-3
  // Ex 1: Comprendre les panneaux indiquant la sortie dans un bâtiment.
  // Ex 2: Comprendre le pictogramme indiquant la toilette dans un endroit public.
  'n1-reading-3': [
    // Scenario 1 (Template, Ex 1): Exit sign in building
    Object.assign(
      (rand) => {
        const door = pick([1, 2, 3, 4, 5], rand)
        const block = pick(['A', 'B', 'C'], rand)
        return {
          text: `Porte ${door} (Bloc ${block}) : Sortie / Exit. Ne pas bloquer la porte. En cas d’urgence, poussez la barre.`,
          questions: [
            ['« Sortie » correspond au mot anglais :', 'Exit', 'Entrance', 'Bus stop'],
            ['Que faut-il faire en cas d’urgence ?', 'pousser la barre', 'fermer à clé', 'rester assis'],
          ],
        }
      },
      { capacity: 15 }
    ),
    // Scenario 2 (Template, Ex 2): Restroom public sign
    Object.assign(
      (rand) => {
        const floor = pick(['1er étage', '2e étage', 'rez-de-chaussée', 'sous-sol'], rand)
        return {
          text: `Signalisation publique (${floor}) : Toilettes / Restrooms. Toilettes pour femmes à gauche. Toilettes pour hommes à droite.`,
          questions: [
            ['Le mot « Toilettes » désigne :', 'les sanitaires', 'les bureaux', 'les ascenseurs'],
            ['Où se trouvent les toilettes pour femmes ?', 'à gauche', 'à droite', 'au 3e étage'],
          ],
        }
      },
      { capacity: 4 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Bilingual public doors
    Object.assign(
      (rand) => {
        const line = pick([10, 24, 55, 80], rand)
        return {
          text: `Panneau d’accès : Sortie / Exit. Arrêt d’autobus / Bus stop ligne ${line}. Pharmacie / Pharmacy. Entrée / Entrance.`,
          questions: [
            ['« Sortie » correspond à :', 'Exit', 'Entrance', 'Bus stop'],
            ['« Arrêt d’autobus » correspond à :', 'Bus stop', 'Exit', 'Pharmacy'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n1-reading-4
  // Ex 1: Comprendre les principales abréviations rencontrées dans les adresses postales.
  // Ex 2: Comprendre le titre de civilité utilisé sous forme d’abréviation dans un formulaire.
  'n1-reading-4': [
    // Scenario 1 (Template, Ex 1): Postal abbreviations
    Object.assign(
      (rand) => {
        return {
          text: 'Abréviations postales : Av. = avenue, Boul. = boulevard, Ch. = chemin, App. = appartement',
          questions: [
            ['« Boul. » signifie :', 'boulevard', 'boulangerie', 'bouteille'],
            ['« App. » signifie :', 'appartement', 'appointement', 'appareil'],
          ],
        }
      },
      { capacity: 1 }
    ),
    // Scenario 2 (Template, Ex 2): Civility titles in forms
    Object.assign(
      (rand) => {
        return {
          text: 'Formulaire d’inscription : Titre de civilité : M. = monsieur, Mme = madame, Dr = docteur',
          questions: [
            ['« M. » est l’abréviation de :', 'monsieur', 'madame', 'maître'],
            ['« Mme » est l’abréviation de :', 'madame', 'monsieur', 'mademoiselle'],
          ],
        }
      },
      { capacity: 1 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Concrete address with abbreviations
    Object.assign(
      (rand) => {
        const num = pick([120, 240, 350, 480, 520], rand)
        const app = pick([4, 12, 18, 22, 35], rand)
        const otherApps = sample([4, 12, 18, 22, 35, 99].filter((a) => a !== app), 2, rand)
        return {
          text: `Adresse : Mme Tremblay, ${num} boul. René-Lévesque, app. ${app}, Montréal (QC) H2Z 1A4`,
          questions: [
            ['Que signifie « boul. » ?', 'boulevard', 'boulangerie', 'boucle'],
            ['Quel est le numéro d’appartement (app.) ?', String(app), String(otherApps[0]), String(otherApps[1])],
          ],
        }
      },
      { capacity: 25 }
    ),
  ],

  // n1-reading-5
  // Ex 1: Comprendre les salutations dans un bref texto d’une connaissance.
  // Ex 2: Comprendre les remerciements dans un courriel.
  'n1-reading-5': [
    // Scenario 1 (Template, Ex 1): Friendly short text message
    Object.assign(
      (rand) => {
        const p1 = pick(PERSONAS, rand)
        const p2 = pick(PERSONAS.filter((p) => p.name !== p1.name), rand)
        return {
          text: `Salut ${p1.name} ! Merci beaucoup pour ton message d’hier. Bonne journée à toi ! À demain, ${p2.name}.`,
          questions: [
            ['Le message contient :', 'une salutation et un remerciement', 'une demande de rendez-vous', 'une plainte formelle'],
            ['Qui a écrit ce texto ?', p2.name, p1.name, 'une professeure'],
          ],
        }
      },
      { capacity: PERSONAS.length * (PERSONAS.length - 1) }
    ),
    // Scenario 2 (Template, Ex 2): Email of thanks
    Object.assign(
      (rand) => {
        const p1 = pick(PERSONAS, rand)
        const p2 = pick(PERSONAS.filter((p) => p.name !== p1.name), rand)
        return {
          text: `Courriel : Bonjour ${p1.name}, un grand merci pour ton aide avec les exercices de français. Bien à toi, ${p2.name}.`,
          questions: [
            ['Pourquoi la personne écrit-elle ce courriel ?', 'pour remercier pour de l’aide', 'pour emprunter un livre', 'pour annuler un cours'],
            ['Qui a envoyé le courriel ?', p2.name, p1.name, 'la directrice'],
          ],
        }
      },
      { capacity: PERSONAS.length * (PERSONAS.length - 1) }
    ),
    // Scenario 3 (Template, Ex 1 variant): Short note
    Object.assign(
      (rand) => {
        const p1 = pick(PERSONAS, rand)
        const p2 = pick(PERSONAS.filter((p) => p.name !== p1.name), rand)
        return {
          text: `Bonjour ${p1.name}, merci pour ton aide avec les valises. À bientôt, ${p2.name}.`,
          questions: [
            ['Le message contient :', 'une salutation et un remerciement', 'une demande de rendez-vous', 'un formulaire'],
            ['Qui a rédigé le mot ?', p2.name, p1.name, 'une professeure'],
          ],
        }
      },
      { capacity: PERSONAS.length * (PERSONAS.length - 1) }
    ),
  ],

  // ===========================================================================
  // NIVEAU 2 - LISTENING
  // ===========================================================================

  // n2-listening-0
  // Ex 1: Comprendre les jours et les heures d’ouverture du supermarché.
  // Ex 2: Comprendre les dates de début et de fin de la période d’inscription aux cours de natation.
  'n2-listening-0': [
    // Scenario 1 (Template, Ex 1): Supermarket opening hours
    Object.assign(
      (rand) => {
        const closeWeek = pick([20, 21, 22], rand)
        const openWeekend = pick([8, 9, 10], rand)
        const closeWeekend = pick([17, 18, 19], rand)
        return {
          text: `Le supermarché est ouvert du lundi au vendredi, de 8 heures à ${closeWeek} heures, et la fin de semaine, de ${openWeekend} heures à ${closeWeekend} heures.`,
          questions: [
            ['周一到周五几点关门？', `${closeWeek} 点`, `${closeWeekend} 点`, '8 点'],
            ['周末几点开门？', `${openWeekend} 点`, `${openWeekend === 8 ? 9 : 8} 点`, `${closeWeekend} 点`],
          ],
        }
      },
      { capacity: 27 }
    ),
    // Scenario 2 (Template, Ex 2): Swimming lesson registration dates
    Object.assign(
      (rand) => {
        const startDay = pick([1, 2, 5, 8], rand)
        const endDay = pick([15, 20, 25, 28], rand)
        const month = pick(MONTHS, rand)
        const otherMonths = sample(MONTHS.filter((m) => m.num !== month.num), 2, rand)
        return {
          text: `Au centre sportif, la période d’inscription aux cours de natation commence le ${startDay} ${month.fr} et se termine le ${endDay} ${month.fr}.`,
          questions: [
            ['游泳课报名在哪个月份进行？', month.zh, otherMonths[0].zh, otherMonths[1].zh],
            ['报名截止日期是哪一天？', `${endDay} 日`, `${startDay} 日`, '30 日'],
          ],
        }
      },
      { capacity: 4 * 4 * MONTHS.length }
    ),
    // Scenario 3 (Template, Ex 1 variant): Medical clinic opening hours
    Object.assign(
      (rand) => {
        const closeHour = pick([16, 17, 18, 19], rand)
        return {
          text: `La clinique médicale est ouverte du lundi au jeudi de 8 heures à ${closeHour} heures. Elle est fermée la fin de semaine et les jours fériés.`,
          questions: [
            ['诊所周一到周四几点关门？', `${closeHour} 点`, '20 点', '12 点'],
            ['诊所周末的营业状态是？', '关门（fermée）', '全天营业', '仅上午营业'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-listening-1
  // Ex 1: Réagir à une question sur son lien de parenté avec un proche présent.
  // Ex 2: Réagir à une demande de renseignements d’un collègue sur les modes de paiement à la cafétéria.
  'n2-listening-1': [
    // Scenario 1 (Template, Ex 1): Kinship relation question
    Object.assign(
      (rand) => {
        const rel = pick(FAMILY_RELATIONS, rand)
        return {
          text: `Bonjour ! La personne avec vous, c’est ${rel.termFr} ?`,
          questions: [
            ['对方在询问什么？', `陪你的人是不是你${rel.zh}`, '你的家庭住址', '你的工作单位'],
            ['合适的回答是：', `Non, c’est ${rel.otherFr}.`, 'Oui, à huit heures.', 'Je suis désolé.'],
          ],
        }
      },
      { capacity: FAMILY_RELATIONS.length }
    ),
    // Scenario 2 (Template, Ex 2): Cafeteria payment methods
    Object.assign(
      (rand) => {
        const method = pick(['crédit', 'débit', 'virement Interac'], rand)
        return {
          text: `Dis-moi, est-ce qu’on peut payer par ${method} à la cafétéria, ou seulement en argent comptant ?`,
          questions: [
            ['同事在询问什么？', '咖啡厅的付款方式', '今日特价午餐', '咖啡厅几点关门'],
            ['合适的回答是：', 'On peut payer par débit ou crédit, mais pas comptant.', 'Il fait très beau aujourd’hui.', 'Je m’appelle Sophie.'],
          ],
        }
      },
      { capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 2 variant): Interac transfer question
    Object.assign(
      (rand) => {
        const fee = pick([25, 40, 50, 75], rand)
        return {
          text: `Bonjour madame. Est-ce que vous acceptez le virement Interac pour payer les ${fee} dollars de frais ?`,
          questions: [
            ['学员在询问哪种支付方式？', 'Interac 转账', '现金支付', '邮政支票'],
            ['需要支付的费用是多少？', `${fee} 加元`, '100 加元', '免费'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-listening-2
  // Ex 1: Réagir à une demande liée à l’emplacement des toilettes dans un centre commercial.
  // Ex 2: Réagir à une demande liée à la localisation de la pharmacie dans son quartier.
  'n2-listening-2': [
    // Scenario 1 (Template, Ex 1): Mall restrooms location
    Object.assign(
      (rand) => {
        const floor = pick(['au 1er étage', 'au 2e étage', 'au rez-de-chaussée', 'au sous-sol'], rand)
        const dir = pick(SIMPLE_DIRECTIONS, rand)
        return {
          text: `Pardon madame, où sont les toilettes dans le centre d’achats ${floor}, s’il vous plaît ? — Elles sont ${dir.fr}.`,
          questions: [
            ['对方在寻找什么？', '洗手间', '药店', '出口'],
            ['回答指引的方向是：', dir.zh, '在门外', '直走右转'],
          ],
        }
      },
      { capacity: 4 * SIMPLE_DIRECTIONS.length }
    ),
    // Scenario 2 (Template, Ex 2): Neighborhood pharmacy location
    Object.assign(
      (rand) => {
        const dir = pick(SIMPLE_DIRECTIONS, rand)
        const street = pick(['Saint-Denis', 'Mont-Royal', 'Sherbrooke', 'Saint-Laurent', 'Papineau'], rand)
        return {
          text: `Excusez-moi, savez-vous où se trouve la pharmacie sur la rue ${street}, s’il vous plaît ? — C’est ${dir.fr}.`,
          questions: [
            ['路人在打听哪个场所的方位？', '药店', '诊所', '超市'],
            ['回答的方位是：', dir.zh, '在地铁里', '不知道'],
          ],
        }
      },
      { capacity: 5 * SIMPLE_DIRECTIONS.length }
    ),
    // Scenario 3 (Template, Ex 2 variant): Public library location
    Object.assign(
      (rand) => {
        const quartier = pick(['du Plateau', 'de Rosemont', 'de Verdun', 'd’Hochelaga'], rand)
        return {
          text: `Pardon monsieur, où se trouve la bibliothèque municipale ${quartier}, s’il vous plaît ? — Elle est tout droit, à côté du parc.`,
          questions: [
            ['对方在寻找什么地方？', '市立图书馆', '邮局', '学校'],
            ['图书馆在什么旁边？', '在公园旁边', '在车站旁边', '在医院旁边'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-listening-3
  // Ex 1: Comprendre le nom des sections principales d’un lieu de formation lors d’une visite.
  // Ex 2: Comprendre les indications pour trouver un produit dans une allée d’un grand magasin.
  'n2-listening-3': [
    // Scenario 1 (Template, Ex 1): School campus tour sections
    Object.assign(
      (rand) => {
        const room = pick(ROOM_NUMBERS, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.fr !== room.fr), 2, rand)
        return {
          text: `Voici l’école : la cafétéria est au rez-de-chaussée, la bibliothèque est au deuxième étage et le laboratoire informatique est au local ${room.fr}.`,
          questions: [
            ['图书馆在几楼？', '二楼', '一楼', '地下室'],
            ['计算机实验室在哪个教室？', `Local ${room.fr}`, `Local ${otherRooms[0].fr}`, `Local ${otherRooms[1].fr}`],
          ],
        }
      },
      { capacity: ROOM_NUMBERS.length }
    ),
    // Scenario 2 (Template, Ex 2): Department store aisle directions
    Object.assign(
      (rand) => {
        const aisle = pick([3, 5, 8, 12, 15], rand)
        const otherAisles = sample([3, 5, 8, 12, 15, 20].filter((a) => a !== aisle), 2, rand)
        const item = pick([
          { fr: 'Le lait', zh: '牛奶', near: 'fromage', nearZh: '奶酪' },
          { fr: 'Le pain', zh: '面包', near: 'café', nearZh: '咖啡' },
          { fr: 'Le riz', zh: '大米', near: 'pâtes', nearZh: '意面' },
        ], rand)
        return {
          text: `${item.fr} est dans l’allée ${aisle}, à gauche, à côté du ${item.near}.`,
          questions: [
            [`${item.zh}在第几排通道？`, String(aisle), String(otherAisles[0]), String(otherAisles[1])],
            [`${item.zh}在什么食品旁边？`, item.nearZh, '水果', '冰淇淋'],
          ],
        }
      },
      { capacity: 15 }
    ),
    // Scenario 3 (Template, Ex 2 variant): Children's clothes department
    Object.assign(
      (rand) => {
        const floor = pick(['au rez-de-chaussée', 'au 2e étage', 'au sous-sol'], rand)
        return {
          text: `Pour les vêtements d’enfants, c’est ${floor}, tout au fond du magasin, à gauche des caisses.`,
          questions: [
            ['童装区在商店的哪个位置？', '走到底左转', '入口右侧', '二楼扶梯旁'],
            ['童装区旁边是什么？', '收银台', '试衣间', '洗手间'],
          ],
        }
      },
      { capacity: 3 }
    ),
  ],

  // n2-listening-4
  // Ex 1: Réagir à des consignes énoncées par un éducateur pour aller chercher son enfant.
  // Ex 2: Réagir à une interdiction énoncée par une agente de sécurité dans un lieu public.
  'n2-listening-4': [
    // Scenario 1 (Template, Ex 1): Daycare pickup instructions
    Object.assign(
      (rand) => {
        const group = pick(['Castors', 'Petits Loups', 'Papillons', 'Poussins', 'Explorateurs'], rand)
        return {
          text: `Bonjour aux parents du groupe des ${group} : n’oubliez pas de signer le registre à l’entrée avant de partir avec votre enfant.`,
          questions: [
            ['幼教老师提醒家长接孩子离开前做什么？', '在入口处的签到表上签名', '出示护照证件', '缴纳活动现金'],
            ['签到表放置在什么地方？', '在入口处', '在操场旁', '在黑板前'],
          ],
        }
      },
      { capacity: 5 }
    ),
    // Scenario 2 (Template, Ex 2): Security guard smoking prohibition
    Object.assign(
      (rand) => {
        const zone = pick(['Zone A', 'Zone B', 'près de l’entrée', 'dans ce couloir'], rand)
        return {
          text: `Attention, monsieur, il est strictement interdit de fumer ici (${zone}). Merci d’éteindre votre cigarette immédiatement.`,
          questions: [
            ['安保人员提醒这里禁止什么？', '吸烟', '吃东西', '拍照'],
            ['安保人员要求对方做什么？', '立即熄灭香烟', '出示有效门票', '离开当前城市'],
          ],
        }
      },
      { capacity: 4 }
    ),
    // Scenario 3 (Template, Ex 2 variant): Food prohibition and waste disposal
    Object.assign(
      (rand) => {
        const room = pick(['cette salle', 'la bibliothèque', 'le laboratoire'], rand)
        return {
          text: `Attention, monsieur, il est interdit de manger dans ${room}. Merci de jeter vos déchets dans la poubelle.`,
          questions: [
            ['这里禁止什么？', '吃东西', '拍照', '打电话'],
            ['对方要求你做什么？', '把垃圾扔进垃圾桶', '马上离开', '出示证件'],
          ],
        }
      },
      { capacity: 3 }
    ),
  ],

  // n2-listening-5
  // Ex 1: Comprendre les excuses d’une passagère pour se frayer un chemin dans un autobus.
  // Ex 2: Comprendre les formules d’interpellation utilisées par un passant dans la rue.
  'n2-listening-5': [
    // Scenario 1 (Template, Ex 1): Crowded bus exit apology
    Object.assign(
      (rand) => {
        const stop = pick([
          'Saint-Denis',
          'Mont-Royal',
          'Jean-Talon',
          'Beaubien',
          'du Parc',
          'Papineau',
          'Berri',
          'Sherbrooke',
          'Rosemont',
          'Laurier',
          'Saint-Laurent',
          'Guy-Concordia',
        ], rand)
        return {
          text: `Pardon, excusez-moi, je descends au prochain arrêt, rue ${stop} ! Laissez-moi passer s’il vous plaît.`,
          questions: [
            ['说话的人在做什么？', '请别人让一让，她要下车', '问路', '买票'],
            ['她最可能在哪里？', '公交车上', '餐厅里', '教室里'],
          ],
        }
      },
      { capacity: 12 }
    ),
    // Scenario 2 (Template, Ex 2): Pedestrian asking for time in street
    Object.assign(
      (rand) => {
        const time = pick([10, 11, 14, 15, 16], rand)
        return {
          text: `Bonjour monsieur, excusez-moi de vous déranger, est-ce que vous avez l’heure s’il vous plaît ? Il est déjà ${time} heures ?`,
          questions: [
            ['路人上前搭话是为了询问什么？', '现在几点了', '地铁站在哪里', '有没有零钱'],
            ['路人使用了哪句礼貌搭话词？', 'Excusez-moi de vous déranger', 'Au revoir', 'Bon appétit'],
          ],
        }
      },
      { capacity: 5 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Store line queue apology
    Object.assign(
      (rand) => {
        const caisse = pick([1, 2, 3, 4, 5], rand)
        return {
          text: `Oh pardon madame ! Je ne vous avais pas vue, vous étiez avant moi dans la file à la caisse ${caisse}.`,
          questions: [
            ['说话者道歉的原因是：', '差点在排队时插了对方的队', '撞坏了对方的推车', '拿错了对方的商品'],
            ['这段对话发生在什么情境中？', '在商店排队等候时', '在马路过红绿灯时', '在图书馆自习时'],
          ],
        }
      },
      { capacity: 5 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 2 - READING
  // ===========================================================================

  // n2-reading-0
  // Ex 1: Comprendre des renseignements relatifs à des produits alimentaires dans une circulaire.
  // Ex 2: Comprendre les indications précisant le prochain arrêt sur le panneau d’autobus.
  'n2-reading-0': [
    // Scenario 1 (Template, Ex 1): Grocery circular food items and prices
    Object.assign(
      (rand) => {
        const applePrice = pick(['1,99 $', '2,49 $', '2,99 $'], rand)
        const breadPrice = pick(['3,49 $', '3,99 $', '4,29 $'], rand)
        const milkPrice = pick(['2,29 $', '2,59 $'], rand)
        const day = pick([14, 20, 25, 28], rand)
        const month = pick(MONTHS, rand)
        const otherMonth = pick(MONTHS.filter((m) => m.num !== month.num), rand)
        const otherDay = pick([1, 15, 30].filter((d) => d !== day), rand)
        return {
          text: `Circulaire d’épicerie : Pommes : ${applePrice} la livre. Pain frais : ${breadPrice}. Lait 2 L : ${milkPrice}. Offre valable jusqu’au ${day} ${month.fr}.`,
          questions: [
            ['Combien coûte le pain frais ?', breadPrice, applePrice, '5,99 $'],
            ['L’offre est valable jusqu’au :', `${day} ${month.fr}`, `${otherDay} ${month.fr}`, `${day} ${otherMonth.fr}`],
          ],
        }
      },
      { capacity: 3 * 3 * 2 * 4 * MONTHS.length }
    ),
    // Scenario 2 (Template, Ex 2): Bus next stop digital display
    Object.assign(
      (rand) => {
        const stop = pick([
          { fr: 'Rue Saint-Denis', next: 'Avenue Mont-Royal' },
          { fr: 'Boulevard Saint-Laurent', next: 'Rue Jean-Talon' },
          { fr: 'Rue Sherbrooke', next: 'Avenue Papineau' },
        ], rand)
        const bus = pick([24, 55, 80, 105], rand)
        const otherStops = ['Avenue René-Lévesque', 'Rue Saint-Hubert']
        return {
          text: `Affichage d’autobus : Prochain arrêt : ${stop.fr}. Correspondance avec la ligne ${bus}. Métro à 100 mètres.`,
          questions: [
            ['Quel est le prochain arrêt affiché ?', stop.fr, otherStops[0], otherStops[1]],
            ['Avec quelle ligne d’autobus y a-t-il une correspondance ?', `Ligne ${bus}`, 'Ligne 800', 'Ligne 10'],
          ],
        }
      },
      { capacity: 12 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Supermarket cheese & meat circular
    Object.assign(
      (rand) => {
        const cheese = pick(['5,99 $', '6,49 $', '7,29 $'], rand)
        return {
          text: `Spécial supermarché : Pommes : 1,99 $ la livre. Pain : 3,49 $. Lait 2 L : 2,29 $. Fromage : ${cheese}. Offre valable jusqu’au 14 avril.`,
          questions: [
            ['Combien coûte le pain ?', '3,49 $', '1,99 $', cheese],
            ['L’offre est valable jusqu’au :', '14 avril', '24 avril', '4 avril'],
          ],
        }
      },
      { capacity: 3 }
    ),
  ],

  // n2-reading-1
  // Ex 1: Comprendre les renseignements demandés dans un formulaire de changement d’adresse.
  // Ex 2: Comprendre les renseignements demandés dans un formulaire de participation à une sortie scolaire.
  'n2-reading-1': [
    // Scenario 1 (Template, Ex 1): Address change form
    Object.assign(
      (rand) => {
        const city = pick(['Montréal', 'Québec', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Trois-Rivières', 'Lévis'], rand)
        const app = pick([2, 4, 12, 18, 25], rand)
        return {
          text: `Formulaire de changement d’adresse (${city}) : nom complet, nouvelle adresse, numéro d’appartement ${app}, code postal, date du déménagement.`,
          questions: [
            ['Ce formulaire concerne :', 'un changement d’adresse', 'une demande d’emploi', 'une réservation'],
            ['Quel renseignement d’appartement est inscrit ?', `numéro ${app}`, 'numéro 99', 'numéro 100'],
          ],
        }
      },
      { capacity: 40 }
    ),
    // Scenario 2 (Template, Ex 2): School field trip form
    Object.assign(
      (rand) => {
        const dest = pick(['au Biodôme', 'au Planétarium', 'au Musée des beaux-arts', 'au Jardin botanique', 'à la cabane à sucre'], rand)
        return {
          text: `Autorisation de sortie scolaire (${dest}) : Nom de l’enfant, Classe, Nom du parent, Numéro de téléphone d’urgence, Signature obligatoire.`,
          questions: [
            ['À quoi sert ce document ?', 'autoriser une sortie scolaire', 'demander un emploi d’enseignant', 'commander des manuels'],
            ['Quel contact obligatoire est demandé ?', 'le numéro de téléphone d’urgence', 'le numéro d’assurance sociale', 'le compte bancaire'],
          ],
        }
      },
      { capacity: 5 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Community center membership form
    Object.assign(
      (rand) => {
        const act = pick(['natation', 'yoga', 'francisation', 'peinture'], rand)
        return {
          text: `Inscription aux activités (${act}) : Nom, Prénom, Date de naissance, Adresse complète, Pièce d’identité avec photo.`,
          questions: [
            ['Quel document d’identité doit être présenté ?', 'une pièce d’identité avec photo', 'un contrat de travail', 'un relevé de notes'],
            ['Ce formulaire sert à :', 's’inscrire au centre communautaire', 'louer une automobile', 'ouvrir un compte bancaire'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-reading-2
  // Ex 1: Comprendre des symboles liés aux prévisions météorologiques.
  // Ex 2: Comprendre des abréviations d’unités de mesure au comptoir des viandes d’un supermarché.
  'n2-reading-2': [
    // Scenario 1 (Template, Ex 1): Weekly weather symbols
    Object.assign(
      (rand) => {
        const city = pick(['Montréal', 'Québec', 'Gatineau', 'Sherbrooke', 'Saguenay'], rand)
        const rainDay = pick(['mardi', 'mercredi'], rand)
        const snowDay = pick(['jeudi', 'vendredi'], rand)
        return {
          text: `Prévisions météo pour ${city} : lundi, ensoleillé ; ${rainDay}, pluie ; ${snowDay}, tempête de neige ; samedi, verglas.`,
          questions: [
            [`Quel symbole pour ${rainDay} ?`, 'pluie', 'neige', 'soleil'],
            ['Samedi, attention au :', 'verglas', 'vent chaud', 'soleil'],
          ],
        }
      },
      { capacity: 5 * 2 * 2 }
    ),
    // Scenario 2 (Template, Ex 2): Meat counter weight abbreviations
    Object.assign(
      (rand) => {
        const price = pick(['4,99 $', '5,49 $', '5,99 $'], rand)
        return {
          text: `Comptoir de boucherie : Bœuf haché : ${price} / lb (livre). Rôti de porc : 11,50 $ / kg (kilogramme). Tranches de jambon : 100 g (grammes).`,
          questions: [
            ['L’abréviation « lb » signifie :', 'livre', 'litre', 'ligne'],
            ['L’abréviation « kg » signifie :', 'kilogramme', 'kilomètre', 'kilowatt'],
          ],
        }
      },
      { capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Winter weather warning
    Object.assign(
      (rand) => {
        const region = pick(['des Laurentides', 'de l’Estrie', 'du Saguenay', 'de la Mauricie'], rand)
        return {
          text: `Avertissement météo (${region}) : lundi, ensoleillé ; mardi, nuageux ; mercredi, pluie ; jeudi, tempête de neige ; vendredi, verglas.`,
          questions: [
            ['Quel symbole pour mercredi ?', 'pluie', 'neige', 'soleil'],
            ['Vendredi, attention au :', 'verglas', 'vent', 'soleil'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-reading-3
  // Ex 1: Comprendre le montant écrit en toutes lettres sur un chèque.
  // Ex 2: Comprendre le nombre de pièces d’identité à fournir pour une inscription.
  'n2-reading-3': [
    // Scenario 1 (Template, Ex 1): Check written amount in words
    Object.assign(
      (rand) => {
        const item = pick([
          { lettres: 'trois mille deux cents', chiffres: '3 200 $', comp: 'Location du Nord' },
          { lettres: 'deux mille cinq cents', chiffres: '2 500 $', comp: 'Gestion Immobilière' },
          { lettres: 'mille huit cents', chiffres: '1 800 $', comp: 'Habitations Québec' },
          { lettres: 'quatre mille deux cents', chiffres: '4 200 $', comp: 'Logements Modernes' },
          { lettres: 'trois mille cinq cents', chiffres: '3 500 $', comp: 'Immeubles du Parc' },
          { lettres: 'deux mille huit cents', chiffres: '2 800 $', comp: 'Résidences Laval' },
          { lettres: 'mille deux cents', chiffres: '1 200 $', comp: 'Appartements Laurier' },
          { lettres: 'quatre mille cinq cents', chiffres: '4 500 $', comp: 'Location Montréal' },
          { lettres: 'cinq mille deux cents', chiffres: '5 200 $', comp: 'Gestion Tremblay' },
          { lettres: 'trois mille huit cents', chiffres: '3 800 $', comp: 'Place Mont-Royal' },
        ], rand)
        const otherAmounts = ['3 000 $', '2 300 $', '1 500 $', '4 000 $'].filter((a) => a !== item.chiffres).slice(0, 2)
        return {
          text: `Payez à l’ordre de « ${item.comp} » la somme de ${item.lettres} dollars et 00/100. (${item.chiffres})`,
          questions: [
            ['Combien d’argent est indiqué en chiffres ?', item.chiffres, otherAmounts[0], otherAmounts[1]],
            ['Qui est le bénéficiaire ?', item.comp, 'Loyer du Sud', 'Banque Populaire'],
          ],
        }
      },
      { capacity: 10 }
    ),
    // Scenario 2 (Template, Ex 2): Number of ID documents required
    Object.assign(
      (rand) => {
        const workshop = pick(['cuisine', 'menuiserie', 'peinture', 'conversation', 'couture', 'danse'], rand)
        return {
          text: `Inscription à l’atelier de ${workshop} : Veuillez apporter deux pièces d’identité avec photo et une preuve de résidence récente.`,
          questions: [
            ['Combien de pièces d’identité avec photo faut-il apporter ?', 'deux', 'cinq', 'une seule'],
            ['Quel autre document est exigé ?', 'une preuve de résidence', 'un passeport étranger', 'un diplôme'],
          ],
        }
      },
      { capacity: 6 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Payment receipt written in words
    Object.assign(
      (rand) => {
        const fee = pick(['quatre cent cinquante', 'cinq cent vingt', 'trois cent quatre-vingts', 'six cents'], rand)
        const num = fee.includes('quatre cent cinquante') ? '450 $' : fee.includes('cinq cent') ? '520 $' : fee.includes('trois') ? '380 $' : '600 $'
        return {
          text: `Reçu de paiement : Reçu la somme de ${fee} dollars (${num}) pour les cours de francisation.`,
          questions: [
            ['Quel montant en chiffres correspond au texte ?', num, '300 $', '1 000 $'],
            ['Ce reçu concerne :', 'les cours de francisation', 'l’achat de manuels', 'le transport scolaire'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],

  // n2-reading-4
  // Ex 1: Réagir aux consignes relatives à des activités à réaliser en classe.
  // Ex 2: Réagir aux consignes affichées sur l’écran d’un guichet automatique.
  'n2-reading-4': [
    // Scenario 1 (Template, Ex 1): Classroom activity instructions steps
    Object.assign(
      (rand) => {
        const actNum = pick([1, 2, 3, 4, 5], rand)
        const page = pick([10, 15, 20, 25, 30], rand)
        return {
          text: `Consignes de l’activité ${actNum} (page ${page}) : 1. Lisez le texte attentivement. 2. Soulignez les mots nouveaux. 3. Répondez aux questions 1 à 5.`,
          questions: [
            ['Combien d’étapes composent cette consigne ?', '3', '5', '1'],
            ['Quelle est la troisième étape ?', 'répondre aux questions', 'lire le texte', 'souligner les mots nouveaux'],
          ],
        }
      },
      { capacity: 25 }
    ),
    // Scenario 2 (Template, Ex 2): ATM screen instructions
    Object.assign(
      (rand) => {
        const bank = pick(['Desjardins', 'Banque Nationale', 'BMO', 'RBC', 'TD'], rand)
        return {
          text: `Écran du guichet (${bank}) : 1. Insérez votre carte client. 2. Entrez votre NIP secret de 4 chiffres. 3. Choisissez votre transaction : Retrait ou Dépôt.`,
          questions: [
            ['Que demande le guichet à la deuxième étape ?', 'entrer son NIP secret de 4 chiffres', 'reprendre sa carte', 'imprimer un reçu'],
            ['Quelles transactions sont proposées à l’étape 3 ?', 'Retrait ou Dépôt', 'Paiement de facture seulement', 'Prêt hypothécaire'],
          ],
        }
      },
      { capacity: 5 }
    ),
    // Scenario 3 (Template, Ex 1 variant): Computer lab steps
    Object.assign(
      (rand) => {
        const poste = pick([1, 2, 3, 4, 5, 6, 7, 8], rand)
        return {
          text: `Poste informatique n° ${poste} : 1. Allumez l’ordinateur. 2. Entrez votre nom d’utilisateur. 3. Ouvrez le document d’exercice.`,
          questions: [
            ['Quelle est la première action demandée ?', 'allumer l’ordinateur', 'ouvrir le document', 'éteindre l’écran'],
            ['Combien d’étapes sont décrites ?', '3', '2', '4'],
          ],
        }
      },
      { capacity: 8 }
    ),
  ],

  // n2-reading-5
  // Ex 1: Comprendre un message de remerciement pour un service rendu.
  // Ex 2: Comprendre les messages courants formulés sur des cartes de souhaits.
  'n2-reading-5': [
    // Scenario 1 (Template, Ex 1): Thank you note for dinner or help
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Merci beaucoup pour le délicieux dîner chez vous hier soir. C’était vraiment agréable ! Bisous, ${persona.name}.`,
          questions: [
            ['Pourquoi écrit-elle ?', 'remercier pour un repas', 'inviter à dîner', 'se plaindre'],
            ['Comment s’appelle l’expéditrice ?', persona.name, otherPersonas[0].name, otherPersonas[1].name],
          ],
        }
      },
      { capacity: PERSONAS.length }
    ),
    // Scenario 2 (Template, Ex 2): Birthday or holiday wish card
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        return {
          text: `Chère ${persona.name}, joyeux anniversaire ! Que cette nouvelle année t’apporte beaucoup de santé, de joie et de succès. Avec toute notre amitié.`,
          questions: [
            ['Quelle occasion cette carte souligne-t-elle ?', 'un anniversaire', 'un mariage', 'un départ à la retraite'],
            ['Quels vœux sont formulés ?', 'de la santé, de la joie et du succès', 'un prompt rétablissement', 'un bon voyage'],
          ],
        }
      },
      { capacity: PERSONAS.length }
    ),
    // Scenario 3 (Template, Ex 2 variant): New year greetings card
    Object.assign(
      (rand) => {
        const year = pick([2026, 2027, 2028, 2029], rand)
        return {
          text: `Carte de souhaits (${year}) : « Bonne et heureuse année ! Que la nouvelle année vous apporte paix, joie et prospérité. »`,
          questions: [
            ['Cette carte transmet les vœux pour :', 'la nouvelle année', 'un anniversaire de mariage', 'la fête des mères'],
            ['Quelle formule de politesse est employée ?', 'Bonne et heureuse année', 'Bonne nuit', 'Bon appétit'],
          ],
        }
      },
      { capacity: 4 }
    ),
  ],
}
