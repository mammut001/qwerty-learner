// Échelle québécoise scenarios for Niveau 1 and Niveau 2 indicators.
// Covers both official situations types (examples) for every listening and reading indicator.
// Every indicator has >= 5 scenarios and yields >= 60 distinct texts over 400 seeds.

import {
  PERSONAS,
  COUNTRIES,
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
  FOOD_ITEMS,
  FAMILY_RELATIONS,
  PAYMENT_METHODS,
  SIMPLE_DIRECTIONS,
  PICTOGRAMS,
  SYMBOLS_ABBREVIATIONS,
  pick,
  sample,
  g,
  cap,
  prepDe,
  prepA,
  artDef,
  aCoteDe,
  numberToFrench,
  de,
  que,
  le,
  la,
  merciDe,
  auOrg,
  deOrg,
  verbSeTrouver,
  cher,
  au,
  du,
  q,
} from './shared.mjs'

// Format integer with spaces as thousands separator (e.g. 2500 -> '2 500')
function formatDigits(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const N01_02_SCENARIOS = {
  // ===========================================================================
  // NIVEAU 1 - LISTENING
  // ===========================================================================

  // n1-listening-0
  // Ex 1: Comprendre la nationalité et le métier d’une nouvelle connaissance.
  // Ex 2: Comprendre le numéro de local et le numéro de téléphone du secrétariat.
  'n1-listening-0': [
    // Scenario 1 (Ex 1): Acquaintance introduction (name + nationality + profession)
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const nat = pick(NATIONALITIES, rand)
        const prof = pick(PROFESSIONS, rand)
        const otherNats = sample(NATIONALITIES.filter((n) => n.zh !== nat.zh), 2, rand)
        const otherProfs = sample(PROFESSIONS.filter((p) => p.zh !== prof.zh), 2, rand)
        const natFr = g(persona, nat.m, nat.f)
        const profFr = g(persona, prof.m, prof.f)
        return {
          text: `Bonjour, je m’appelle ${persona.name}. Je suis ${natFr}. Je suis ${profFr}.`,
          questions: [
            q(`${persona.name} 是哪国人？`, nat.zh, otherNats[0].zh, otherNats[1].zh, [natFr.toLowerCase()]),
            q(`${persona.name} 的职业是？`, prof.zh, otherProfs[0].zh, otherProfs[1].zh, [profFr.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * NATIONALITIES.length * PROFESSIONS.length, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Secretariat room & phone number
    Object.assign(
      (rand) => {
        const room = pick(ROOM_NUMBERS, rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.fr !== room.fr), 2, rand)
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Bonjour. Le secrétariat est au local ${room.fr}. Le numéro de téléphone est le ${phone.fr}.`,
          questions: [
            q('秘书处的办公室号码是？', room.fr, otherRooms[0].fr, otherRooms[1].fr, [room.fr.toLowerCase()]),
            q('秘书处的电话号码是？', phone.fr, otherPhones[0].fr, otherPhones[1].fr, [phone.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: ROOM_NUMBERS.length * PHONE_NUMBERS.length, situation: 1 }
    ),
    // Scenario 3 (Ex 1): Workplace colleague self-introduction
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const prof = pick(PROFESSIONS, rand)
        const otherCountries = sample(COUNTRIES.filter((c) => c.natZh !== persona.natZh), 2, rand)
        const otherProfs = sample(PROFESSIONS.filter((p) => p.zh !== prof.zh), 2, rand)
        const profFr = g(persona, prof.m, prof.f)
        const countryWord = persona.country.toLowerCase().replace(/^(le|la|les)\s+/i, '').replace(/^[ld][’']/i, '')
        return {
          text: `Salut ! Moi, c’est ${persona.name}. Je viens ${persona.countryPrep} et je travaille comme ${profFr} à Montréal.`,
          questions: [
            q('说话者的国籍或来源地是？', persona.natZh, otherCountries[0].natZh, otherCountries[1].natZh, [countryWord]),
            q('说话者从事什么职业？', prof.zh, otherProfs[0].zh, otherProfs[1].zh, [profFr.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * PROFESSIONS.length, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Evening class introduction
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const prof = pick(PROFESSIONS, rand)
        const otherProfs = sample(PROFESSIONS.filter((p) => p.zh !== prof.zh), 2, rand)
        const profFr = g(persona, prof.m, prof.f)
        return {
          text: `Bonsoir tout le monde, je suis ${persona.name}. Dans mon pays d’origine, j’étais ${profFr}, et ici j’apprends le français.`,
          questions: [
            q('说话者以前从事什么职业？', prof.zh, otherProfs[0].zh, otherProfs[1].zh, [profFr.toLowerCase()]),
            q('说话者的名字是？', persona.name, 'Sophie', 'Alexandre', [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * PROFESSIONS.length, situation: 0 }
    ),
    // Scenario 5 (Ex 2): Reception desk and helpline
    Object.assign(
      (rand) => {
        const room = pick(ROOM_NUMBERS, rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const otherRooms = sample(ROOM_NUMBERS.filter((r) => r.fr !== room.fr), 2, rand)
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Pour votre inscription, le bureau d’accueil se trouve au local ${room.fr}. En cas de question, composez le ${phone.fr}.`,
          questions: [
            q('接待办公室位于哪个房间？', room.fr, otherRooms[0].fr, otherRooms[1].fr, [room.fr.toLowerCase()]),
            q('咨询电话号码是？', phone.fr, otherPhones[0].fr, otherPhones[1].fr, [phone.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: ROOM_NUMBERS.length * PHONE_NUMBERS.length, situation: 1 }
    ),
  ],

  // n1-listening-1
  // Ex 1: Réagir à des questions se rapportant à son identité en vue de se présenter lors d’un échange brise-glace.
  // Ex 2: Réagir à des questions se rapportant à ses coordonnées lors d’une inscription à un cours.
  'n1-listening-1': [
    // Scenario 1 (Ex 1): Ice-breaker origin question with varied persona and countries
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const country = pick(COUNTRIES, rand)
        return {
          text: `— Bonjour ! Je m’appelle ${persona.name} et je viens ${persona.countryPrep}. Et vous, de quel pays venez-vous ?`,
          questions: [
            q(
              '面对搭话者的提问“De quel pays venez-vous ?”，合适的回答是：',
              `Je viens ${country.prep}.`,
              'J’ai trente ans.',
              'Je suis ingénieur.',
              ['pays']
            ),
            q(`搭话者自我介绍叫什么名字？`, persona.name, 'Julie', 'Patrick', [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * COUNTRIES.length, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Telephone number question at course registration
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const course = pick([
          { fr: 'francisation', zh: '法语' },
          { fr: 'cuisine québécoise', zh: '魁北克烹饪' },
          { fr: 'dessin', zh: '绘画' },
          { fr: 'informatique de base', zh: '基础计算机' },
          { fr: 'couture', zh: '缝纫' },
        ], rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Bonjour ${persona.name}. Pour finaliser votre inscription au cours ${de(course.fr)}, quel est votre numéro de téléphone ?`,
          questions: [
            q(
              '面对工作人员询问电话号码，合适的回答是：',
              `C’est le ${phone.fr}.`,
              'J’habite à Québec.',
              'Je suis étudiant.',
              ['téléphone']
            ),
            q('学员正在报名什么课程？', course.zh, '驾驶考证', '吉他演奏', ['cours']),
          ],
        }
      },
      { capacity: PERSONAS.length * 5 * PHONE_NUMBERS.length, situation: 1 }
    ),
    // Scenario 3 (Ex 1): Nationality question in icebreaker
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const userCountry = pick(COUNTRIES, rand)
        const otherCountries = sample(COUNTRIES.filter((c) => c.natZh !== persona.natZh), 2, rand)
        return {
          text: `Salut ! Moi c’est ${persona.name}, je suis ${g(persona, persona.natM, persona.natF)}. Et vous, quelle est votre nationalité ?`,
          questions: [
            q(
              '面对提问“Quelle est votre nationalité ?”，合适的回答是：',
              `Je suis ${userCountry.natM}.`,
              'J’ai deux frères.',
              'À huit heures et demie.',
              ['nationalité']
            ),
            q(`搭话者 ${persona.name} 的国籍是：`, persona.natZh, otherCountries[0].natZh, otherCountries[1].natZh, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * COUNTRIES.length, situation: 0 }
    ),
    // Scenario 4 (Ex 2): Postal address inquiry at center registration
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const center = pick(['de francisation', 'communautaire', 'de loisirs', 'sportif'], rand)
        const num = pick([120, 250, 340, 480, 510], rand)
        const street = pick(['rue Saint-Denis', 'rue Principale', 'avenue du Parc', 'boulevard René-Lévesque'], rand)
        return {
          text: `Bonjour ${persona.name} ! Pour votre fiche au centre ${center}, quelle est votre adresse de résidence à Montréal ?`,
          questions: [
            q(
              '面对工作人员询问家庭住址，合适的回答是：',
              `J’habite au ${num}, ${street}.`,
              'Je m’appelle Carlos et j’ai vingt-cinq ans.',
              'C’est le 514 555-0123, merci beaucoup.',
              ['adresse']
            ),
            q('工作人员询问的是哪项个人信息？', '家庭居住地址', '电子邮箱', '紧急联系人姓名', ['résidence']),
          ],
        }
      },
      { capacity: PERSONAS.length * 4 * 5 * 4, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Native language inquiry in welcome workshop
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const distinctLangs = [...new Set(PERSONAS.map((p) => p.langZh))].filter((zh) => zh !== persona.langZh)
        const otherLangs = sample(distinctLangs, 2, rand)
        return {
          text: `Bonjour ! Je m’appelle ${persona.name}. Dans ma famille, nous parlons ${persona.langFr}. Quelle est votre langue maternelle ?`,
          questions: [
            q(
              '面对提问“Quelle est votre langue maternelle ?”，合适的回答是：',
              'C’est le français.',
              'Je pars demain matin.',
              'Mon père est médecin.',
              ['maternelle']
            ),
            q(`${persona.name} 在家庭中使用的语言是：`, persona.langZh, otherLangs[0], otherLangs[1], [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 28, situation: 0 }
    ),
  ],

  // n1-listening-2
  // Ex 1: Comprendre les noms des principaux objets de la salle de classe.
  // Ex 2: Comprendre des mots désignant la fonction du personnel du service de garde fréquenté par son enfant.
  'n1-listening-2': [
    // Scenario 1 (Ex 1): Classroom objects to use and store
    Object.assign(
      (rand) => {
        const objs = sample(CLASSROOM_OBJECTS, 3, rand)
        const otherObjs = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o)), 2, rand)
        return {
          text: `Prenez ${objs[0].fr} et ${objs[1].fr}. Rangez ${objs[2].fr} dans votre sac.`,
          questions: [
            q('老师要求拿出的两个物品是？', `${objs[0].zh}和${objs[1].zh}`, `${otherObjs[0].zh}和${objs[1].zh}`, `${objs[0].zh}和${otherObjs[1].zh}`, [objs[0].fr.toLowerCase().split(' ').pop()]),
            q('老师要求收进书包的物品是？', objs[2].zh, otherObjs[0].zh, otherObjs[1].zh, [objs[2].fr.toLowerCase().split(' ').pop()]),
          ],
        }
      },
      { capacity: CLASSROOM_OBJECTS.length * (CLASSROOM_OBJECTS.length - 1) * (CLASSROOM_OBJECTS.length - 2), situation: 0 }
    ),
    // Scenario 2 (Ex 2): Daycare staff functions
    Object.assign(
      (rand) => {
        const roles = [
          { fr: 'l’éducatrice principale', zh: '主带幼教老师' },
          { fr: 'la directrice du centre', zh: '中心园长' },
          { fr: 'le responsable des repas', zh: '餐饮营养负责人' },
          { fr: 'l’infirmière scolaire', zh: '校医 / 护士' },
          { fr: 'le préposé à l’accueil', zh: '前台接待员' },
        ]
        const p1 = pick(PERSONAS.filter((p) => p.gender === 'f'), rand)
        const p2 = pick(PERSONAS.filter((p) => p.gender === 'm'), rand)
        const r1 = pick(roles.slice(0, 2), rand)
        const r2 = pick(roles.slice(2), rand)
        const altR1 = roles.find((r) => r.zh !== r1.zh && r.zh !== r2.zh)
        const altR2 = roles.find((r) => r.zh !== r1.zh && r.zh !== r2.zh && r.zh !== altR1.zh)
        return {
          text: `Bonjour les parents. Au service de garde, madame ${p1.name} est ${r1.fr} et monsieur ${p2.name} est ${r2.fr}.`,
          questions: [
            q(`${p1.name} 在托管中心的职务是？`, r1.zh, altR1.zh, altR2.zh, [p1.name.toLowerCase()]),
            q(`${p2.name} 在托管中心的职务是？`, r2.zh, altR1.zh, altR2.zh, [p2.name.toLowerCase()]),
          ],
        }
      },
      { capacity: 100, situation: 1 }
    ),
    // Scenario 3 (Ex 1): Classroom objects on the table
    Object.assign(
      (rand) => {
        const objs = sample(CLASSROOM_OBJECTS, 2, rand)
        const others = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o)), 2, rand)
        return {
          text: `Sur votre table de travail, placez ${objs[0].fr} et ${objs[1].fr}. Ne les perdez pas !`,
          questions: [
            q('桌上需要摆放什么物品？', `${objs[0].zh}和${objs[1].zh}`, `${others[0].zh}和${objs[1].zh}`, `${objs[0].zh}和${others[1].zh}`, [objs[0].fr.toLowerCase().split(' ').pop()]),
            q('说话者提醒大家不要丢失什么？', '桌上的学习文具', '教室钥匙', '借书证', ['table']),
          ],
        }
      },
      { capacity: CLASSROOM_OBJECTS.length * (CLASSROOM_OBJECTS.length - 1), situation: 0 }
    ),
    // Scenario 4 (Ex 2): School team presentation
    Object.assign(
      (rand) => {
        const p1 = pick(PERSONAS.filter((p) => p.gender === 'f'), rand)
        const p2 = pick(PERSONAS.filter((p) => p.gender === 'm'), rand)
        return {
          text: `Pour l’année scolaire : madame ${p1.name} est la directrice et monsieur ${p2.name} est le concierge de l’école.`,
          questions: [
            q(`${p1.name} 在学校担任什么职务？`, '校长 / 园长', '厨师', '司机', [p1.name.toLowerCase()]),
            q(`${p2.name} 负责什么工作？`, '校工与物业管理', '音乐老师', '医务人员', [p2.name.toLowerCase()]),
          ],
        }
      },
      { capacity: 100, situation: 1 }
    ),
    // Scenario 5 (Ex 1): Borrowing classroom material
    Object.assign(
      (rand) => {
        const objs = sample(CLASSROOM_OBJECTS, 2, rand)
        const others = sample(CLASSROOM_OBJECTS.filter((o) => !objs.includes(o)), 2, rand)
        return {
          text: `Pardon, est-ce que tu peux me prêter ${objs[0].fr} ou ${objs[1].fr} pour l’exercice ?`,
          questions: [
            q('同学想借用什么文具？', `${objs[0].zh}或${objs[1].zh}`, `${others[0].zh}或${objs[1].zh}`, `${objs[0].zh}或${others[1].zh}`, [objs[0].fr.toLowerCase().split(' ').pop()]),
            q('这段对话发生在什么情境下？', '课堂学习借用文具', '在图书馆还书', '在办公室交作业', ['prêter']),
          ],
        }
      },
      { capacity: CLASSROOM_OBJECTS.length * (CLASSROOM_OBJECTS.length - 1), situation: 0 }
    ),
  ],

  // n1-listening-3
  // Ex 1: Comprendre la date de la fête d’anniversaire d’une amie.
  // Ex 2: Comprendre l’heure de début d’un atelier énoncée par le responsable.
  // RULE: Questions MUST ask for date/day/time, not room!
  'n1-listening-3': [
    // Scenario 1 (Ex 1): Friend's birthday party date and time
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const day = pick(DAYS, rand)
        const date = pick(DATES, rand)
        const month = pick(MONTHS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 13 && t.hour <= 19), rand)
        const otherMonths = sample(MONTHS.filter((m) => m.num !== month.num), 2, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `La fête d’anniversaire ${de(persona.name)}, c’est le ${day.fr} ${date.dayText} ${month.fr}, à ${time.frDisplay}.`,
          questions: [
            q('派对是哪一天？', `${month.num} 月 ${date.dayNum} 日`, `${otherMonths[0].num} 月 ${date.dayNum} 日`, `${otherMonths[1].num} 月 2 日`, [month.fr.toLowerCase()]),
            q('派对几点开始？', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * DAYS.length * DATES.length * MONTHS.length * 7, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Workshop day and start time
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 8 && t.hour <= 16), rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `Attention tout le monde : l’atelier de français commence le ${day.fr} à ${time.frDisplay} précises.`,
          questions: [
            q('工作坊在星期几进行？', day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
            q('工作坊几点开始？', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * CLOCK_TIMES.length, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Medical appointment reminder
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const date = pick(DATES, rand)
        const month = pick(MONTHS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 8 && t.hour <= 16), rand)
        const otherDates = sample(DATES.filter((d) => d.dayNum !== date.dayNum), 2, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `Bonjour. Votre rendez-vous à la clinique médicale est prévu le ${day.fr} ${date.dayText} ${month.fr} à ${time.frDisplay}.`,
          questions: [
            q('就诊预约是几月几日？', `${month.num} 月 ${date.dayNum} 日`, `${month.num} 月 ${otherDates[0].dayNum} 日`, `${month.num} 月 ${otherDates[1].dayNum} 日`, [month.fr.toLowerCase()]),
            q('预约在几点进行？', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * DATES.length * MONTHS.length * 9, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Community library event day and time (morning: 9h to 11h30)
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 9 && t.hour <= 11), rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `L’heure du conte à la bibliothèque, c’est le ${day.fr} matin à ${time.frDisplay}.`,
          questions: [
            q('图书馆故事会在星期几？', day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
            q('活动几点开始？', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * 4, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Family anniversary date and time
    Object.assign(
      (rand) => {
        const day = pick(DAYS, rand)
        const date = pick(DATES, rand)
        const month = pick(MONTHS, rand)
        const time = pick(CLOCK_TIMES.filter((t) => t.hour >= 17 && t.hour <= 20), rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `La fête de famille, c’est le ${day.fr} ${date.dayText} ${month.fr} à ${time.frDisplay}.`,
          questions: [
            q('家庭聚会是星期几？', day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
            q('聚会几点开始？', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * DATES.length * MONTHS.length * 4, situation: 0 }
    ),
  ],

  // n1-listening-4
  // Ex 1: Réagir à des consignes énoncées par l’enseignant en salle de classe.
  // Ex 2: Réagir à des consignes énoncées par la secrétaire lors d’une inscription.
  // Genuinely varied instructions (> 60 distinct texts)
  'n1-listening-4': [
    // Scenario 1 (Ex 1): Teacher instructions in class
    Object.assign(
      (rand) => {
        const instrs = sample(CLASSROOM_INSTRUCTIONS, 2, rand)
        const others = sample(CLASSROOM_INSTRUCTIONS.filter((i) => !instrs.includes(i)), 2, rand)
        return {
          text: `Attention la classe : ${instrs[0].fr}, puis ${instrs[1].fr.toLowerCase()}.`,
          questions: [
            q('老师给出的第一项指令是：', instrs[0].zh, others[0].zh, others[1].zh, [instrs[0].fr.toLowerCase().split(' ')[0]]),
            q('老师随后要求做的是：', instrs[1].zh, others[0].zh, others[1].zh, [instrs[1].fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: CLASSROOM_INSTRUCTIONS.length * (CLASSROOM_INSTRUCTIONS.length - 1), situation: 0 }
    ),
    // Scenario 2 (Ex 2): Secretary registration actions
    Object.assign(
      (rand) => {
        const actions = [
          { fr: 'signez au bas du formulaire', zh: '在表格底部签名' },
          { fr: 'présentez votre carte d’identité', zh: '出示身份证件' },
          { fr: 'prenez un numéro d’attente', zh: '抽取排队号码牌' },
          { fr: 'payez les frais à la caisse', zh: '在收银台缴纳费用' },
          { fr: 'fournissez une photo récente', zh: '提供近期免冠照片' },
          { fr: 'remplissez la feuille bleue', zh: '填写蓝色登记表' },
        ]
        const a = sample(actions, 2, rand)
        const alt = sample(actions.filter((x) => !a.includes(x)), 2, rand)
        return {
          text: `Bonjour. Pour votre dossier : ${a[0].fr}, et ensuite ${a[1].fr}.`,
          questions: [
            q('秘书首先要求做的是：', a[0].zh, alt[0].zh, alt[1].zh, [a[0].fr.toLowerCase().split(' ')[0]]),
            q('随后需要完成的是：', a[1].zh, alt[0].zh, alt[1].zh, [a[1].fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: 30, situation: 1 }
    ),
    // Scenario 3 (Ex 1): Teacher exercise instructions
    Object.assign(
      (rand) => {
        const instrs = sample(CLASSROOM_INSTRUCTIONS, 2, rand)
        const others = sample(CLASSROOM_INSTRUCTIONS.filter((i) => !instrs.includes(i)), 2, rand)
        return {
          text: `Pour cet exercice : ${instrs[0].fr} et surtout ${instrs[1].fr.toLowerCase()}.`,
          questions: [
            q('做此项练习时老师要求：', instrs[0].zh, others[0].zh, others[1].zh, [instrs[0].fr.toLowerCase().split(' ')[0]]),
            q('另外一项要求是：', instrs[1].zh, others[0].zh, others[1].zh, [instrs[1].fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: CLASSROOM_INSTRUCTIONS.length * (CLASSROOM_INSTRUCTIONS.length - 1), situation: 0 }
    ),
    // Scenario 4 (Ex 2): Counter clerk document pickup instructions
    Object.assign(
      (rand) => {
        const actions = [
          { fr: 'présentez votre reçu de paiement', zh: '出示付款收据' },
          { fr: 'signez le registre de retrait', zh: '在领取登记册上签字' },
          { fr: 'vérifiez l’orthographe de votre nom', zh: '核对名字拼写无误' },
          { fr: 'conservez ce document précieusement', zh: '妥善保管该文件' },
        ]
        const a = sample(actions, 2, rand)
        const alt = sample(actions.filter((x) => !a.includes(x)), 2, rand)
        return {
          text: `Pour récupérer votre carte : ${a[0].fr}, puis ${a[1].fr}.`,
          questions: [
            q('工作人员首先要求：', a[0].zh, alt[0].zh, alt[1].zh, [a[0].fr.toLowerCase().split(' ')[0]]),
            q('接着需要做的是：', a[1].zh, alt[0].zh, alt[1].zh, [a[1].fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: 12, situation: 1 }
    ),
    // Scenario 5 (Ex 0): End of class teacher instructions
    Object.assign(
      (rand) => {
        const instrs = sample(CLASSROOM_INSTRUCTIONS, 2, rand)
        const others = sample(CLASSROOM_INSTRUCTIONS.filter((i) => !instrs.includes(i)), 2, rand)
        return {
          text: `Le cours est terminé : ${instrs[0].fr}, puis ${instrs[1].fr.toLowerCase()}. À demain !`,
          questions: [
            q('下课前老师要求的动作是：', instrs[0].zh, others[0].zh, others[1].zh, [instrs[0].fr.toLowerCase().split(' ')[0]]),
            q('随后的指令是：', instrs[1].zh, others[0].zh, others[1].zh, [instrs[1].fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: CLASSROOM_INSTRUCTIONS.length * (CLASSROOM_INSTRUCTIONS.length - 1), situation: 0 }
    ),
  ],

  // n1-listening-5
  // Ex 1: Comprendre les salutations d’une caissière.
  // Ex 2: Comprendre les remerciements d’un voisin.
  // Must respect gender agreement with persona! (> 60 distinct texts)
  'n1-listening-5': [
    // Scenario 1 (Ex 1): Cashier greeting & wishes at checkout
    Object.assign(
      (rand) => {
        const greetings = ['Bonjour madame', 'Bonjour monsieur', 'Bonsoir']
        const items = [
          { fr: 'café', zh: '咖啡' },
          { fr: 'pain', zh: '面包' },
          { fr: 'jus', zh: '果汁' },
          { fr: 'sandwich', zh: '三明治' },
          { fr: 'lait', zh: '牛奶' },
          { fr: 'muffin', zh: '松饼' },
        ]
        const farewells = [
          { fr: 'bonne journée', zh: '祝您一天愉快' },
          { fr: 'bonne soirée', zh: '祝您晚上愉快' },
          { fr: 'bonne fin de semaine', zh: '周末愉快' },
          { fr: 'bon week-end', zh: '周末愉快' },
        ]
        const gr = pick(greetings, rand)
        const item = pick(items, rand)
        const f = pick(farewells, rand)
        const otherFarewells = farewells.filter((x) => x.zh !== f.zh)
        return {
          text: `— ${gr} ! Votre ${item.fr} et votre reçu. Merci beaucoup et ${f.fr} ! — Merci à vous, ${f.fr} !`,
          questions: [
            q('店员交给了顾客什么？', `${item.zh}和收据`, '报纸和钥匙', '零钱和地图', [item.fr.toLowerCase()]),
            q('店员祝愿顾客：', f.zh, otherFarewells[0]?.zh || '生日快乐', '节日愉快', [f.fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: 3 * 6 * 4, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Neighbor thanking for a favor (correct gender agreement)
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const favors = [
          { fr: 'ton aide pour le déménagement', zh: '搬家时的帮助' },
          { fr: 'avoir arrosé mes plantes', zh: '帮忙浇花' },
          { fr: 'avoir gardé mon chat', zh: '帮忙照看小猫' },
          { fr: 'avoir déneigé l’entrée', zh: '帮忙清理车道积雪' },
          { fr: 'avoir reçu mon colis postal', zh: '代收邮包快递' },
          { fr: 'm’avoir prêté ta perceuse', zh: '借用电钻工具' },
          { fr: 'ton aide avec mes boîtes', zh: '搬运箱子时的帮助' },
        ]
        const fav = pick(favors, rand)
        const otherFavors = sample(favors.filter((x) => x.zh !== fav.zh), 2, rand)
        const cherFr = g(persona, 'Cher', 'Chère')
        const gentilFr = g(persona, 'gentil', 'gentille')
        return {
          text: `Bonjour ${persona.name} ! ${cherFr} voisin${g(persona, '', 'e')}, merci mille fois ${merciDe(fav.fr)}. Tu es vraiment très ${gentilFr} !`,
          questions: [
            q(`邻居感谢 ${persona.name} 是因为：`, fav.zh, otherFavors[0].zh, otherFavors[1].zh, [persona.name.toLowerCase()]),
            q('邻居使用的致谢语句是：', '万分感谢', '请您多关照', '祝您一路顺风', ['merci']),
          ],
        }
      },
      { capacity: PERSONAS.length * 7, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Pharmacy clerk greeting & care advice
    Object.assign(
      (rand) => {
        const farewells = [
          { fr: 'prenez bien soin de vous', zh: '保重身体' },
          { fr: 'bonne journée à vous', zh: '祝您一天愉快' },
          { fr: 'bon rétablissement', zh: '祝您早日康复' },
        ]
        const f = pick(farewells, rand)
        return {
          text: `— Bonjour ! Voici vos médicaments et votre reçu. Merci de votre visite et ${f.fr} !`,
          questions: [
            q('药店店员交给顾客的是：', '药品和收据', '报纸和信件', '水杯和车票', ['médicaments']),
            q('店员表达的关照祝愿是：', f.zh, '一路平安', '生意兴隆', [f.fr.toLowerCase().split(' ')[0]]),
          ],
        }
      },
      { capacity: 10, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Neighbor returning borrowed item with thanks
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const items = [
          { fr: 'ta pelle à neige', zh: '你的雪铲' },
          { fr: 'tes outils de jardin', zh: '你的园艺工具' },
          { fr: 'ton échelle', zh: '你的梯子' },
          { fr: 'ton coffre à outils', zh: '你的工具箱' },
        ]
        const it = pick(items, rand)
        const otherItems = items.filter((x) => x.zh !== it.zh)
        const cherFr = g(persona, 'mon cher voisin', 'ma chère voisine')
        return {
          text: `Salut ${persona.name} ! Je te rapporte ${it.fr}. Un grand merci, ${cherFr}, ton aide est très appréciée !`,
          questions: [
            q('邻居归还了什么物品？', it.zh, otherItems[0].zh, otherItems[1].zh, [it.fr.toLowerCase().split(' ').pop()]),
            q(`邻居对 ${persona.name} 表达了什么：`, '感激与道谢', '道歉与解释', '邀请朋友做客', ['merci']),
          ],
        }
      },
      { capacity: PERSONAS.length * 4, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Bakery cashier morning greeting
    Object.assign(
      (rand) => {
        const bakes = [
          { fr: 'pain frais', zh: '新鲜面包' },
          { fr: 'croissant', zh: '羊角可颂' },
          { fr: 'baguette', zh: '法棍面包' },
        ]
        const b = pick(bakes, rand)
        return {
          text: `— Bon matin ! Voici votre ${b.fr} et votre monnaie. Merci et passez une excellente journée !`,
          questions: [
            q('面包店店员递给顾客的是：', `${b.zh}和找零`, '报纸和咖啡', '收据和会员卡', [b.fr.toLowerCase().split(' ')[0]]),
            q('店员的道别祝愿是：', '度过美好的一天', '祝您早日康复', '一路顺风', ['journée']),
          ],
        }
      },
      { capacity: 10, situation: 0 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 1 - READING
  // ===========================================================================

  // n1-reading-0
  // Ex 1: Comprendre les jours de la semaine dans un calendrier.
  // Ex 2: Comprendre des mots liés à des lieux et à des services dans son quartier.
  'n1-reading-0': [
    // Scenario 1 (Ex 1): Workshop days in calendar
    Object.assign(
      (rand) => {
        const d = sample(DAYS, 3, rand)
        const otherDays = sample(DAYS.filter((x) => !d.includes(x)), 2, rand)
        return {
          text: `Calendrier des activités : ${cap(d[0].fr)} : atelier de français. ${cap(d[1].fr)} : club de lecture. ${cap(d[2].fr)} : cours de dessin.`,
          questions: [
            q('法语工作坊在哪一天？', d[0].zh, otherDays[0].zh, otherDays[1].zh, [d[0].fr.toLowerCase()]),
            q('绘画课在哪一天？', d[2].zh, otherDays[0].zh, otherDays[1].zh, [d[2].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * (DAYS.length - 1) * (DAYS.length - 2), situation: 0 }
    ),
    // Scenario 2 (Ex 2): Neighborhood directory of places and services
    Object.assign(
      (rand) => {
        const p = sample(PLACES_SERVICES, 3, rand)
        const otherPlaces = sample(
          PLACES_SERVICES.filter(
            (x) =>
              !p.includes(x) &&
              !(p.some((item) => item.base === 'épicerie') && x.base === 'supermarché') &&
              !(p.some((item) => item.base === 'supermarché') && x.base === 'épicerie')
          ),
          2,
          rand
        )
        return {
          text: `Services du quartier : ${cap(p[0].fr)} sur la rue Principale. ${cap(p[1].fr)} sur le boulevard Saint-Laurent. ${cap(p[2].fr)} près du parc.`,
          questions: [
            q('在 rue Principale 上的场所是？', p[0].zh, otherPlaces[0].zh, otherPlaces[1].zh, [p[0].base.toLowerCase()]),
            q('在 boulevard Saint-Laurent 上的场所是？', p[1].zh, otherPlaces[0].zh, otherPlaces[1].zh, [p[1].base.toLowerCase()]),
          ],
        }
      },
      { capacity: PLACES_SERVICES.length * (PLACES_SERVICES.length - 1) * (PLACES_SERVICES.length - 2), situation: 1 }
    ),
    // Scenario 3 (Ex 0): Municipal collection days
    Object.assign(
      (rand) => {
        const d = sample(DAYS, 3, rand)
        const others = sample(DAYS.filter((x) => !d.includes(x)), 2, rand)
        return {
          text: `Collecte municipale : ${cap(d[0].fr)} : ordures ménagères. ${cap(d[1].fr)} : recyclage. ${cap(d[2].fr)} : résidus verts.`,
          questions: [
            q('哪一天收集可回收物（recyclage）？', d[1].zh, others[0].zh, others[1].zh, [d[1].fr.toLowerCase()]),
            q('生活垃圾（ordures）在哪一天收集？', d[0].zh, others[0].zh, others[1].zh, [d[0].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * (DAYS.length - 1) * (DAYS.length - 2), situation: 0 }
    ),
    // Scenario 4 (Ex 1): Commerce guide on avenue
    Object.assign(
      (rand) => {
        const p = sample(PLACES_SERVICES, 2, rand)
        const n1 = pick([120, 250, 310, 420], rand)
        const n2 = pick([550, 680, 740, 890], rand)
        const others = sample(
          PLACES_SERVICES.filter(
            (x) =>
              !p.includes(x) &&
              !(p.some((item) => item.base === 'épicerie') && x.base === 'supermarché') &&
              !(p.some((item) => item.base === 'supermarché') && x.base === 'épicerie')
          ),
          2,
          rand
        )
        return {
          text: `Guide des commerces : ${cap(p[0].fr)} se situe au numéro ${n1}. ${cap(p[1].fr)} se situe au numéro ${n2}.`,
          questions: [
            q(`门牌号 ${n1} 是什么机构？`, p[0].zh, others[0].zh, others[1].zh, [String(n1)]),
            q(`门牌号 ${n2} 是什么机构？`, p[1].zh, others[0].zh, others[1].zh, [String(n2)]),
          ],
        }
      },
      { capacity: PLACES_SERVICES.length * (PLACES_SERVICES.length - 1) * 16, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Medical clinic weekly schedule
    Object.assign(
      (rand) => {
        const d = sample(DAYS, 3, rand)
        const others = sample(DAYS.filter((x) => !d.includes(x)), 2, rand)
        return {
          text: `Clinique médicale : ${cap(d[0].fr)} : sans rendez-vous. ${cap(d[1].fr)} : clinique de vaccination. ${cap(d[2].fr)} : prélèvements sanguins.`,
          questions: [
            q('无预约门诊在星期几？', d[0].zh, others[0].zh, others[1].zh, [d[0].fr.toLowerCase()]),
            q('疫苗接种在星期几？', d[1].zh, others[0].zh, others[1].zh, [d[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: DAYS.length * (DAYS.length - 1) * (DAYS.length - 2), situation: 0 }
    ),
  ],

  // n1-reading-1
  // Ex 1: Comprendre les données personnelles dans un formulaire pour s’inscrire à un cours.
  // Ex 2: Comprendre les renseignements inscrits sur sa carte d’assurance maladie.
  'n1-reading-1': [
    // Scenario 1 (Ex 1): Course registration personal data form
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const lastName = pick(['Tremblay', 'Bouchard', 'Gagnon', 'Roy', 'Côté', 'Morin', 'Lavoie', 'Fortin'], rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const birthYear = pick([1985, 1990, 1993, 1997, 2001], rand)
        const sex = g(persona, 'M', 'F')
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Formulaire d’inscription : Nom : ${lastName} | Prénom : ${persona.name} | Sexe : ${sex} | Année de naissance : ${birthYear} | Tél. : ${phone.fr}`,
          questions: [
            q('报名者的名字（Prénom）是？', persona.name, 'Sophie', 'Alexandre', [persona.name.toLowerCase()]),
            q('报名者的电话号码是？', phone.fr, otherPhones[0].fr, otherPhones[1].fr, [phone.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 8 * PHONE_NUMBERS.length * 5, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Health insurance card (RAMQ) data
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const lastName = pick(['Dubois', 'Pelletier', 'Bélanger', 'Lévesque', 'Gauthier', 'Bergeron'], rand)
        const expMonth = pick(['03', '06', '09', '11'], rand)
        const expYear = pick([2026, 2027, 2028, 2029], rand)
        const sex = g(persona, 'M', 'F')
        const otherYears = [2024, 2025, 2030].filter((y) => y !== expYear)
        return {
          text: `Carte d’assurance maladie (RAMQ) : Nom : ${lastName} | Prénom : ${persona.name} | Sexe : ${sex} | Expiration : ${expMonth} / ${expYear}`,
          questions: [
            q('持卡人的名字是？', persona.name, 'Lucie', 'Gabriel', [persona.name.toLowerCase()]),
            q('该医保卡的到期年份是？', String(expYear), String(otherYears[0]), String(otherYears[1]), [String(expYear)]),
          ],
        }
      },
      { capacity: PERSONAS.length * 6 * 4 * 4, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Library card application
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const lastName = pick(['Simard', 'Girard', 'Boucher', 'Caron'], rand)
        const city = pick(['Montréal', 'Laval', 'Longueuil', 'Québec'], rand)
        const otherCities = ['Gatineau', 'Sherbrooke', 'Trois-Rivières'].filter((c) => c !== city)
        return {
          text: `Demande de carte de bibliothèque : Demandeur : ${persona.name} ${lastName} | Ville : ${city} | Statut : Résident`,
          questions: [
            q('申请人的居住城市是？', city, otherCities[0], otherCities[1], [city.toLowerCase()]),
            q('申请人的名字（Prénom）是？', persona.name, 'Isabelle', 'Patrick', [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4 * 4, situation: 0 }
    ),
    // Scenario 4 (Ex 1): RAMQ renewal notice
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const lastName = pick(['Martel', 'Lapointe', 'Cloutier'], rand)
        const dossier = pick(['D-10492', 'D-20841', 'D-39482'], rand)
        return {
          text: `Avis de renouvellement RAMQ : Assuré : ${persona.name} ${lastName} | Dossier no : ${dossier} | Date limite : 31 décembre.`,
          questions: [
            q('被保险人的名字是？', persona.name, 'Camille', 'François', [persona.name.toLowerCase()]),
            q('该通知办理的截止日期是？', '12 月 31 日', '1 月 1 日', '6 月 30 日', ['décembre']),
          ],
        }
      },
      { capacity: PERSONAS.length * 9, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Sports center registration file
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const phone = pick(PHONE_NUMBERS, rand)
        const otherPhones = sample(PHONE_NUMBERS.filter((p) => p.fr !== phone.fr), 2, rand)
        return {
          text: `Fiche du centre sportif : Participant : ${persona.name} | Urgence tél. : ${phone.fr} | Groupe : Adulte`,
          questions: [
            q('紧急联络电话号码是？', phone.fr, otherPhones[0].fr, otherPhones[1].fr, [phone.fr.toLowerCase()]),
            q('登记参加者的名字是？', persona.name, 'Éric', 'Valérie', [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * PHONE_NUMBERS.length, situation: 0 }
    ),
  ],

  // n1-reading-2
  // Ex 1: Comprendre l’heure de la pause inscrite au tableau de la classe.
  // Ex 2: Comprendre l’heure de passage du prochain autobus affichée sur un panneau numérique.
  'n1-reading-2': [
    // Scenario 1 (Ex 1): Blackboard class schedule and pause times
    Object.assign(
      (rand) => {
        const start = pick(['8 h 30', '9 h 00'], rand)
        const pause = pick(['10 h 15', '10 h 30', '10 h 45'], rand)
        const end = pick(['12 h 00', '12 h 30'], rand)
        const otherTimes = ['11 h 00', '14 h 00'].filter((t) => t !== pause)
        return {
          text: `Tableau de classe : Début du cours : ${start}. Pause du matin : ${pause}. Fin des cours : ${end}.`,
          questions: [
            q('课间休息（Pause）在几点？', pause, otherTimes[0], otherTimes[1], [pause.toLowerCase()]),
            q('课程几点结束？', end, start, '15 h 00', [end.toLowerCase()]),
          ],
        }
      },
      { capacity: 12, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Bus next passage digital board
    Object.assign(
      (rand) => {
        const line = pick([24, 55, 80, 105, 129], rand)
        const time = pick(['14 h 12', '14 h 25', '14 h 38', '14 h 50'], rand)
        const nextLine = pick([10, 45, 97], rand)
        const otherTimes = ['14 h 05', '15 h 00'].filter((t) => t !== time)
        return {
          text: `Panneau d’arrêt de bus : Ligne ${line} : passage à ${time}. Ligne ${nextLine} : passage dans 20 minutes.`,
          questions: [
            q(`${line} 路公交车的到达时间是？`, time, otherTimes[0], otherTimes[1], [time.toLowerCase()]),
            q('该信息显示在什么设施上？', '公交车站数字站牌', '地铁检票口', '机场航站楼', ['panneau']),
          ],
        }
      },
      { capacity: 5 * 4 * 3, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Lunch break announcement
    Object.assign(
      (rand) => {
        const start = pick(['11 h 45', '12 h 00', '12 h 15'], rand)
        const end = pick(['13 h 00', '13 h 15', '13 h 30'], rand)
        return {
          text: `Horaire quotidien : Fin de matinée. Pause du dîner : de ${start} à ${end}. Reprise des cours à ${end}.`,
          questions: [
            q('午休从几点开始？', start, '10 h 00', '14 h 00', [start.toLowerCase()]),
            q('下午几点恢复上课？', end, start, '15 h 00', [end.toLowerCase()]),
          ],
        }
      },
      { capacity: 9, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Metro terminal next train display
    Object.assign(
      (rand) => {
        const time1 = pick(['15 h 02', '15 h 08', '15 h 14'], rand)
        const time2 = pick(['15 h 05', '15 h 11', '15 h 18'], rand)
        return {
          text: `Station de métro : Direction Montmorency : passage à ${time1}. Direction Côte-Vertu : passage à ${time2}.`,
          questions: [
            q('往 Montmorency 方向的列车几点到达？', time1, time2, '15 h 30', [time1.toLowerCase()]),
            q('往 Côte-Vertu 方向的列车几点到达？', time2, time1, '15 h 00', [time2.toLowerCase()]),
          ],
        }
      },
      { capacity: 9, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Afternoon pause & office hours
    Object.assign(
      (rand) => {
        const pause = pick(['14 h 45', '15 h 00', '15 h 15'], rand)
        const office = pick(['16 h 00', '16 h 30'], rand)
        return {
          text: `Avis aux étudiants : Pause de l’après-midi : ${pause}. Permanence de l’enseignant : ${office}.`,
          questions: [
            q('下午休息时间是？', pause, office, '13 h 00', [pause.toLowerCase()]),
            q('教师接待时间是？', office, pause, '17 h 30', [office.toLowerCase()]),
          ],
        }
      },
      { capacity: 6, situation: 0 }
    ),
  ],

  // n1-reading-3
  // Ex 1: Comprendre les panneaux indiquant la sortie dans un bâtiment.
  // Ex 2: Comprendre le pictogramme indiquant la toilette dans un endroit public.
  // RULE: Real emoji pictograms in text and options, questions both ways (pictogram -> word, word -> pictogram), NO English translations!
  'n1-reading-3': [
    // Scenario 1 (Ex 1): Exit & emergency safety signs with sampled pictograms
    Object.assign(
      (rand) => {
        const safetyPool = [
          { emoji: '🚪', fr: 'sortie' },
          { emoji: '🔥', fr: 'sortie de secours' },
          { emoji: '⚠️', fr: 'danger' },
          { emoji: '🛗', fr: 'ascenseur' },
          { emoji: '♿', fr: 'accès fauteuil roulant' },
          { emoji: '🚻', fr: 'toilettes' },
        ]
        const p = sample(safetyPool, 3, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const zone = pick(['Aile A', 'Bloc B', 'Secteur Nord', 'Hall central'], rand)
        return {
          text: `Signalisation de sécurité (${zone}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr} ; ${p[2].emoji} ${p[2].fr}.`,
          questions: [
            q(`哪个图标代表“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的法语词汇是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 120, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Restroom & accessibility amenities with sampled pictograms
    Object.assign(
      (rand) => {
        const publicPool = [
          { emoji: '🚻', fr: 'toilettes' },
          { emoji: '♿', fr: 'accès fauteuil roulant' },
          { emoji: '🛗', fr: 'ascenseur' },
          { emoji: '☎️', fr: 'téléphone' },
          { emoji: 'ℹ️', fr: 'information' },
          { emoji: '🍴', fr: 'cafétéria' },
        ]
        const p = sample(publicPool, 3, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const loc = pick(['Centre commercial', 'Gare centrale', 'Bibliothèque municipale', 'Hôpital régional'], rand)
        return {
          text: `Services au public (${loc}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr} ; ${p[2].emoji} ${p[2].fr}.`,
          questions: [
            q(`哪个图标代表“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的服务设施是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 120, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Public transport interchange pictograms
    Object.assign(
      (rand) => {
        const transitPool = [
          { emoji: '🚇', fr: 'métro' },
          { emoji: '🚌', fr: 'arrêt d’autobus' },
          { emoji: '🅿️', fr: 'stationnement' },
          { emoji: '🚪', fr: 'sortie' },
          { emoji: '♿', fr: 'accès fauteuil roulant' },
        ]
        const p = sample(transitPool, 3, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const hub = pick(['Station Jean-Talon', 'Station Berri-UQAM', 'Terminus Côte-Vertu', 'Gare Centrale'], rand)
        return {
          text: `Pôle de transport (${hub}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr} ; ${p[2].emoji} ${p[2].fr}.`,
          questions: [
            q(`哪个图标表示“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的交通服务是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 60, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Public health & rules pictograms
    Object.assign(
      (rand) => {
        const rulesPool = [
          { emoji: '🚭', fr: 'défense de fumer' },
          { emoji: '📵', fr: 'cellulaire interdit' },
          { emoji: '💊', fr: 'pharmacie' },
          { emoji: '🏥', fr: 'hôpital' },
          { emoji: '⚠️', fr: 'danger' },
        ]
        const p = sample(rulesPool, 3, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const hosp = pick(['Hôpital Saint-Luc', 'Hôpital général', 'Clinique médicale', 'Centre de santé'], rand)
        return {
          text: `Consignes de l’établissement (${hosp}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr} ; ${p[2].emoji} ${p[2].fr}.`,
          questions: [
            q(`哪个图标表示“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的规定是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 60, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Library information & cafeteria pictograms
    Object.assign(
      (rand) => {
        const envPool = [
          { emoji: 'ℹ️', fr: 'information' },
          { emoji: '🍴', fr: 'cafétéria' },
          { emoji: '♻️', fr: 'recyclage' },
          { emoji: '🗑️', fr: 'poubelle' },
          { emoji: '🚻', fr: 'toilettes' },
        ]
        const p = sample(envPool, 3, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const area = pick(['Hall d’accueil', 'Bibliothèque municipale', 'Complexe communautaire'], rand)
        return {
          text: `Guide des services (${area}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr} ; ${p[2].emoji} ${p[2].fr}.`,
          questions: [
            q(`哪个图标表示“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的词汇是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 3 * 60, situation: 0 }
    ),
    // Scenario 6 (Ex 1): Floor corridor guide
    Object.assign(
      (rand) => {
        const floorPool = [
          { emoji: '🛗', fr: 'ascenseur' },
          { emoji: '🚻', fr: 'toilettes' },
          { emoji: '🚪', fr: 'sortie' },
          { emoji: '🗑️', fr: 'poubelle' },
        ]
        const p = sample(floorPool, 2, rand)
        const otherEmoji = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.emoji === x.emoji)).map((x) => x.emoji), 2, rand)
        const otherWords = sample(PICTOGRAMS.filter((x) => !p.some((y) => y.fr === x.fr)).map((x) => x.fr), 2, rand)
        const floor = pick(['1er étage', '2e étage', 'rez-de-chaussée', 'sous-sol'], rand)
        return {
          text: `Couloir central (${floor}) : ${p[0].emoji} ${p[0].fr} ; ${p[1].emoji} ${p[1].fr}.`,
          questions: [
            q(`哪个图标表示“${p[0].fr}”？`, p[0].emoji, otherEmoji[0], otherEmoji[1], [p[0].fr.toLowerCase()]),
            q(`图标 ${p[1].emoji} 对应的词汇是：`, p[1].fr, otherWords[0], otherWords[1], [p[1].fr.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 12, situation: 1 }
    ),
  ],

  // n1-reading-4
  // Ex 1: Comprendre les principales abréviations rencontrées dans les adresses postales.
  // Ex 2: Comprendre le titre de civilité utilisé sous forme d’abréviation dans un formulaire.
  // Genuinely varied content (> 60 distinct texts)
  'n1-reading-4': [
    // Scenario 1 (Ex 1): Postal address abbreviations
    Object.assign(
      (rand) => {
        const road = pick([
          { abbr: 'boul.', full: 'boulevard' },
          { abbr: 'av.', full: 'avenue' },
          { abbr: 'ch.', full: 'chemin' },
        ], rand)
        const unit = pick([
          { abbr: 'app.', full: 'appartement' },
          { abbr: 'bur.', full: 'bureau' },
        ], rand)
        const num = pick([125, 240, 380, 450, 520], rand)
        const unitNum = pick(['3B', '12', '4A', '201'], rand)
        return {
          text: `Adresse postale : Destinataire : M. Tremblay, ${num}, ${road.abbr} des Érables, ${unit.abbr} ${unitNum}, Montréal (Québec).`,
          questions: [
            q(`地址中的缩写“${road.abbr}”代表：`, road.full, 'boutique', 'bibliothèque', [road.abbr.toLowerCase()]),
            q(`地址中的缩写“${unit.abbr}”代表：`, unit.full, 'banque', 'boulangerie', [unit.abbr.toLowerCase()]),
          ],
        }
      },
      { capacity: 3 * 2 * 5 * 4, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Civility abbreviations in registration form
    Object.assign(
      (rand) => {
        const lastName = pick(['Bouchard', 'Gagnon', 'Roy', 'Côté', 'Morin'], rand)
        return {
          text: `Formulaire officiel — Titre de civilité : [ ] M. [ ] Mme [ ] Mlle. Nom de famille : ${lastName}.`,
          questions: [
            q('表格中的称谓缩写“M.”代表：', 'Monsieur', 'Madame', 'Mademoiselle', ['m.']),
            q('表格中的称谓缩写“Mme”代表：', 'Madame', 'Monsieur', 'Médecin', ['mme']),
          ],
        }
      },
      { capacity: 5, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Commercial address abbreviations
    Object.assign(
      (rand) => {
        const road = pick([
          { abbr: 'boul.', full: 'boulevard' },
          { abbr: 'av.', full: 'avenue' },
        ], rand)
        const unit = pick([
          { abbr: 'bur.', full: 'bureau' },
          { abbr: 'app.', full: 'appartement' },
        ], rand)
        const num = pick([400, 500, 600, 750], rand)
        return {
          text: `Coordonnées de l’entreprise : ${num}, ${road.abbr} René-Lévesque Ouest, ${unit.abbr} 300, Montréal. Tél. : 514 555-0189.`,
          questions: [
            q(`路名缩写“${road.abbr}”代表：`, road.full, 'boucherie', 'banque', [road.abbr.toLowerCase()]),
            q(`单元缩写“${unit.abbr}”代表：`, unit.full, 'boutique', 'boîte', [unit.abbr.toLowerCase()]),
          ],
        }
      },
      { capacity: 2 * 2 * 4, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Medical receipt with civility & street abbreviation
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const civ = g(persona, { abbr: 'M.', full: 'Monsieur' }, { abbr: 'Mme', full: 'Madame' })
        const num = pick([80, 110, 240], rand)
        return {
          text: `Reçu médical : Patient : ${civ.abbr} ${persona.name}, résidant au ${num}, av. du Parc, Montréal.`,
          questions: [
            q(`称谓缩写“${civ.abbr}”代表：`, civ.full, 'Docteur', 'Infirmier', [civ.abbr.toLowerCase()]),
            q('地址中的“av.”代表：', 'avenue', 'appartement', 'autobus', ['av.']),
          ],
        }
      },
      { capacity: PERSONAS.length * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Delivery label instructions
    Object.assign(
      (rand) => {
        const road = pick([
          { abbr: 'boul.', full: 'boulevard' },
          { abbr: 'ch.', full: 'chemin' },
        ], rand)
        const num = pick([45, 90, 130], rand)
        return {
          text: `Étiquette de livraison : Livrer au ${num}, ${road.abbr} Saint-Denis, app. 4B. Code postal : H2X 1Y4.`,
          questions: [
            q(`缩写“${road.abbr}”代表：`, road.full, 'boulangerie', 'bar', [road.abbr.toLowerCase()]),
            q('缩写“app.”代表：', 'appartement', 'appareil', 'appel', ['app.']),
          ],
        }
      },
      { capacity: 2 * 3, situation: 0 }
    ),
  ],

  // n1-reading-5
  // Ex 1: Comprendre les salutations dans un bref texto d’une connaissance.
  // Ex 2: Comprendre les remerciements dans un courriel.
  // Strict gender agreement!
  'n1-reading-5': [
    // Scenario 1 (Ex 1): Friendly text message
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const greeting = pick(['Salut', 'Bonjour', 'Coucou', 'Bon matin'], rand)
        const day = pick(DAYS, rand)
        const time = pick(['14 h 00', '15 h 30', '18 h 00'], rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Texto ${de(persona.name)} : « ${greeting} ! J’espère que tu vas bien. On se retrouve ${day.fr} à ${time} pour notre projet ? Confirme-moi dès que tu peux ! »`,
          questions: [
            q('是谁发送了这条短信？', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
            q(`${g(persona, '发信人（l’expéditeur）', '发信人（l’expéditrice）')}想确认哪一天的碰面？`, day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4 * DAYS.length * 3, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Thank-you email for a favor (correct gender agreement)
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const favors = [
          { fr: 'ton aide précieuse avec mon déménagement', zh: '搬家时的宝贵帮助', kw: 'déménagement' },
          { fr: 'avoir arrosé mes fleurs cette semaine', zh: '本周帮忙浇花', kw: 'fleurs' },
          { fr: 'm’avoir prêté tes outils hier', zh: '昨天借出工具', kw: 'outils' },
          { fr: 'ton soutien pour mon examen de français', zh: '法语考试的支持', kw: 'examen' },
        ]
        const fav = pick(favors, rand)
        const otherFavors = favors.filter((f) => f.zh !== fav.zh)
        const cherFr = g(persona, 'Cher', 'Chère')
        const amiFr = g(persona, 'ami', 'amie')
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Courriel ${de(persona.name)} : « ${cherFr} collègue, un grand merci ${merciDe(fav.fr)}. Ton aide m’a été indispensable. Amitiés, ton ${amiFr} ${persona.name}. »`,
          questions: [
            q(`${persona.name} 写这封邮件的目的是：`, `感谢${fav.zh}`, `请求借款用于支付学费`, `请假缺勤并通知同事`, ['merci', fav.kw]),
            q(`发信人（${g(persona, 'l’expéditeur', 'l’expéditrice')}）是：`, persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Weekend invitation text message
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const day = pick(DAYS, rand)
        const time = pick(['10 h 00', '13 h 30', '16 h 00'], rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Texto ${de(persona.name)} : « Bonjour ! Il fait très beau ce ${day.fr}. Veux-tu aller marcher au parc à ${time} ? Réponds-moi si tu es libre ! »`,
          questions: [
            q('发信人提议在星期几去散步？', day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
            q('短信的发信人是谁？', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * DAYS.length * 3, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Neighbor thank-you note
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const tasks = [
          { fr: 'le déneigement du trottoir', zh: '清理人行道积雪', kw: 'déneigement' },
          { fr: 'la garde de mon chat', zh: '照看小猫', kw: 'chat' },
          { fr: 'la réception de mon colis', zh: '代收包裹', kw: 'colis' },
        ]
        const t = pick(tasks, rand)
        const otherTasks = tasks.filter((x) => x.zh !== t.zh)
        const voisinFr = g(persona, 'ton voisin', 'ta voisine')
        return {
          text: `Message ${de(persona.name)} : « Bonjour ! Merci mille fois pour ton aide avec ${t.fr} ce matin. ${cap(voisinFr)}, ${persona.name}. »`,
          questions: [
            q('发信人感谢邻居的：', t.zh, otherTasks[0].zh, otherTasks[1].zh, [t.kw]),
            q('发信人是收信人的：', g(persona, '男邻居', '女邻居'), '房东', '医生', [g(persona, 'voisin', 'voisine')]),
          ],
        }
      },
      { capacity: PERSONAS.length * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Evening check-in text
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        return {
          text: `Texto ${de(persona.name)} : « Bonsoir ! Merci pour le café cet après-midi, c’était un plaisir de te voir. Passe une très bonne soirée ! »`,
          questions: [
            q(`${persona.name} 在短信结尾送上了什么祝愿？`, '晚上愉快', '生日快乐', '节日愉快', ['soirée']),
            q('两人今天下午一起做了什么？', '喝了咖啡', '看了电影', '去了医院', ['café']),
          ],
        }
      },
      { capacity: PERSONAS.length, situation: 0 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 2 - LISTENING
  // ===========================================================================

  // n2-listening-0
  // Ex 1: Comprendre les jours et les heures d’ouverture du supermarché mentionnés par une commis.
  // Ex 2: Comprendre les dates de début et de fin de la période d’inscription aux cours de natation.
  'n2-listening-0': [
    // Scenario 1 (Ex 1): Supermarket opening days and hours
    Object.assign(
      (rand) => {
        const d1 = pick(DAYS.slice(0, 3), rand)
        const d2 = pick(DAYS.slice(3, 5), rand)
        const h1 = pick(['8 h 00', '8 h 30', '9 h 00'], rand)
        const h2 = pick(['20 h 00', '21 h 00', '22 h 00'], rand)
        const h3 = pick(['17 h 00', '18 h 00'], rand)
        return {
          text: `Bonjour. Notre supermarché est ouvert du ${d1.fr} au ${d2.fr}, de ${h1} à ${h2}. Le dimanche, nous fermons à ${h3}.`,
          questions: [
            q('超市平时的营业时间是？', `De ${h1} à ${h2}`, 'De 7 h 00 à 15 h 00', 'De 10 h 00 à 18 h 00', [h1, h2]),
            q('超市在周日几点关门？', h3, '12 h 00', '14 h 00', [h3, 'dimanche']),
          ],
        }
      },
      { capacity: 3 * 2 * 3 * 3 * 2, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Swimming lesson registration dates
    Object.assign(
      (rand) => {
        const month = pick(MONTHS, rand)
        const d1 = pick([2, 5, 8], rand)
        const d2 = pick([20, 22, 25], rand)
        const otherMonths = sample(MONTHS.filter((m) => m.num !== month.num), 2, rand)
        return {
          text: `Bonjour. Les inscriptions aux cours de natation débutent le ${d1} ${month.fr} et se terminent le ${d2} ${month.fr}.`,
          questions: [
            q('游泳课报名在哪一天开始？', `${month.num} 月 ${d1} 日`, `${otherMonths[0].num} 月 ${d1} 日`, `${month.num} 月 1 日`, [`${d1}`, month.fr.toLowerCase()]),
            q('报名截止日期是？', `${month.num} 月 ${d2} 日`, `${otherMonths[1].num} 月 ${d2} 日`, `${month.num} 月 30 日`, [`${d2}`, month.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: MONTHS.length * 3 * 3, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Pharmacy weekly operating hours
    Object.assign(
      (rand) => {
        const d1 = pick(DAYS.slice(0, 2), rand)
        const d2 = pick(DAYS.slice(4, 6), rand)
        const h1 = pick(['8 h 30', '9 h 00'], rand)
        const h2 = pick(['18 h 00', '19 h 00'], rand)
        return {
          text: `La pharmacie est ouverte du ${d1.fr} au ${d2.fr} de ${h1} à ${h2}. Un service d’urgence reste disponible la nuit.`,
          questions: [
            q('药店平时的营业时间是？', `De ${h1} à ${h2}`, 'De 7 h 00 à 12 h 00', 'De 13 h 00 à 17 h 00', [h1, h2]),
            q('夜间提供什么服务？', '夜间急诊值班服务', '门诊手术', '疫苗批量接种', ['service', 'urgence', 'nuit']),
          ],
        }
      },
      { capacity: 2 * 2 * 2 * 2, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Daycare registration window
    Object.assign(
      (rand) => {
        const month = pick(MONTHS, rand)
        const d1 = pick([2, 5, 10], rand)
        const d2 = pick([15, 20, 25], rand)
        return {
          text: `Chers parents : les inscriptions au service de garde ouvrent le ${d1} ${month.fr} et se terminent le ${d2} ${month.fr}.`,
          questions: [
            q('托管班报名起始日期是？', `${month.num} 月 ${d1} 日`, `${month.num} 月 1 日`, `${month.num} 月 30 日`, [`${d1}`, month.fr.toLowerCase()]),
            q('报名截止日期是？', `${month.num} 月 ${d2} 日`, `${month.num} 月 2 日`, `${month.num} 月 12 日`, [`${d2}`, month.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: MONTHS.length * 3 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Library weekend hours
    Object.assign(
      (rand) => {
        const h1 = pick(['10 h 00', '10 h 30'], rand)
        const h2 = pick(['17 h 00', '18 h 00'], rand)
        return {
          text: `La bibliothèque municipale vous accueille le samedi et le dimanche de ${h1} à ${h2}.`,
          questions: [
            q('图书馆周末在哪几天开放？', '周六和周日', '仅周一到周五', '仅周日全天', ['samedi', 'dimanche']),
            q('周末的开放时间是？', `De ${h1} à ${h2}`, 'De 8 h 00 à 12 h 00', 'De 14 h 00 à 20 h 00', [h1, h2]),
          ],
        }
      },
      { capacity: 4, situation: 0 }
    ),
  ],

  // n2-listening-1
  // Ex 1: Réagir à une question sur son lien de parenté avec un proche qui est présent.
  // Ex 2: Réagir à une demande de renseignements d’un collègue sur les modes de paiement possibles à la cafétéria.
  // Genuinely varied content (> 60 distinct texts)
  'n2-listening-1': [
    // Scenario 1 (Ex 1): Family relationship inquiry at clinic
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const matchingRels = FAMILY_RELATIONS.filter((r) => r.gender === persona.gender)
        const rel = pick(matchingRels, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        const clinic = pick(['Clinique Laurier', 'Clinique Saint-Denis', 'Centre médical du Parc', 'Clinique Santé Plus'], rand)
        return {
          text: `Bonjour ! ${cap(auOrg(clinic))}, la personne qui vous accompagne aujourd’hui, c’est ${persona.name} ? Quel est votre lien de parenté avec ${g(persona, 'lui', 'elle')} ?`,
          questions: [
            q(
              '面对医护人员询问亲属关系，合适的回答是：',
              `C’est ${rel.ansFr}.`,
              'Il est trois heures.',
              'En argent comptant.',
              ['parenté']
            ),
            q('医护人员询问的是哪位陪同者？', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 5 * 4, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Cafeteria payment methods inquiry
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const payRaw = sample(PAYMENT_METHODS, 2, rand)
        const pay = payRaw[0].fr === 'par chèque' ? [payRaw[1], payRaw[0]] : payRaw
        const food = pick([
          { fr: 'le repas du midi', zh: '午餐套餐', kw: 'repas' },
          { fr: 'ce sandwich frais', zh: '新鲜三明治', kw: 'sandwich' },
          { fr: 'ce café chaud', zh: '热咖啡', kw: 'café' },
          { fr: 'cette salade repas', zh: '主食沙拉', kw: 'salade' },
        ], rand)
        return {
          text: `Salut ! C’est ${persona.name}. Je voudrais payer ${food.fr} à la cafétéria. Quels sont les modes de paiement acceptés ici ?`,
          questions: [
            q(
              '面对同事询问食堂支付方式，合适的回答是：',
              `Vous pouvez payer ${pay[0].fr} ou ${pay[1].fr}.`,
              'Le repas coûte douze dollars, taxes et pourboire compris.',
              'La cafétéria est ouverte au deuxième étage jusqu’à 15 h.',
              ['paiement']
            ),
            q('同事询问想购买的是什么食物？', food.zh, '整箱苹果', '生日大蛋糕', [food.kw]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4 * PAYMENT_METHODS.length, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Daycare child pickup family relationship
    Object.assign(
      (rand) => {
        const child = pick(['Thomas', 'Léo', 'Emma', 'Chloé', 'Lucas', 'Alice'], rand)
        const daycare = pick(['Garderie Les Petits Amis', 'CPE du Quartier', 'Service de garde L’Étoile'], rand)
        const rel = pick(FAMILY_RELATIONS, rand)
        const otherChildren = ['Maxime', 'Camille'].filter((c) => c !== child)
        return {
          text: `Bonjour ! Vous venez chercher l’enfant ${child} ${auOrg(daycare)}. Quel est votre lien de parenté avec l’enfant ?`,
          questions: [
            q(
              '面对幼教人员询问亲属关系，合适的回答是：',
              `Je suis ${rel.childAnsFr}.`,
              'Je travaille dans un bureau.',
              'Par virement Interac.',
              ['parenté']
            ),
            q('工作人员询问的是哪位被接送的孩子？', child, otherChildren[0], otherChildren[1], [child.toLowerCase()]),
          ],
        }
      },
      { capacity: 6 * 3 * FAMILY_RELATIONS.length, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Community counter payment methods
    Object.assign(
      (rand) => {
        const payRaw = sample(PAYMENT_METHODS, 2, rand)
        const pay = payRaw[0].fr === 'par chèque' ? [payRaw[1], payRaw[0]] : payRaw
        const services = [
          { fr: 'l’atelier de francisation', zh: '法语培训班', kw: 'francisation' },
          { fr: 'l’accès à la piscine', zh: '游泳馆门票', kw: 'piscine' },
          { fr: 'la carte de membre', zh: '会员卡费', kw: 'membre' },
          { fr: 'l’activité de soccer', zh: '足球活动费', kw: 'soccer' },
        ]
        const service = pick(services, rand)
        const otherServices = services.filter((s) => s.zh !== service.zh)
        return {
          text: `Bonjour. Pour régler ${service.fr} au comptoir d’accueil, vous pouvez payer ${pay[0].fr} ou ${pay[1].fr}.`,
          questions: [
            q(
              '前台人员说明的缴费方式是：',
              `Vous pouvez payer ${pay[0].fr} ou ${pay[1].fr}.`,
              'Vous pouvez payer seulement avec une carte-cadeau du centre.',
              'Vous pouvez payer seulement en ligne, avant le cours.',
              [pay[0].short, pay[1].short]
            ),
            q('需要办理缴费的项目是：', service.zh, otherServices[0].zh, otherServices[1].zh, [service.kw]),
          ],
        }
      },
      { capacity: 4 * PAYMENT_METHODS.length * (PAYMENT_METHODS.length - 1), situation: 1 }
    ),
    // Scenario 5 (Ex 0): Introducing relative to colleague
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const matchingRels = FAMILY_RELATIONS.filter((r) => r.gender === persona.gender)
        const rel = pick(matchingRels, rand)
        const otherRels = sample(FAMILY_RELATIONS.filter((r) => r.zh !== rel.zh), 2, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Salut ! Je te présente ${persona.name} : c’est ${rel.ansFr}. ${cap(g(persona, 'Il', 'Elle'))} est venu${g(persona, '', 'e')} me rendre visite à Montréal.`,
          questions: [
            q('说话者向同事介绍的人是自己的：', rel.zh, otherRels[0].zh, otherRels[1].zh, [rel.ansFr.toLowerCase()]),
            q('被介绍的家属名字是：', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 5, situation: 0 }
    ),
  ],

  // n2-listening-2
  // Ex 1: Réagir à une demande liée à l’emplacement des toilettes dans un centre commercial.
  // Ex 2: Réagir à une demande liée à la localisation de la pharmacie dans son quartier.
  'n2-listening-2': [
    // Scenario 1 (Ex 1): Facility location in shopping mall
    Object.assign(
      (rand) => {
        const dir = pick(SIMPLE_DIRECTIONS, rand)
        const facility = pick([
          { fr: 'les toilettes', verb: 'se trouvent', zh: '洗手间', kw: 'toilettes' },
          { fr: 'la pharmacie', verb: 'se trouve', zh: '药店', kw: 'pharmacie' },
          { fr: 'l’ascenseur', verb: 'se trouve', zh: '电梯', kw: 'ascenseur' },
          { fr: 'la sortie ouest', verb: 'se trouve', zh: '西侧出口', kw: 'sortie' },
        ], rand)
        const mall = pick([
          { prep: 'Au Complexe Desjardins', name: 'Complexe Desjardins' },
          { prep: 'Au Centre Eaton', name: 'Centre Eaton' },
          { prep: 'À la Place Ville Marie', name: 'Place Ville Marie' },
          { prep: 'Aux Galeries d’Anjou', name: 'Galeries d’Anjou' },
        ], rand)
        return {
          text: `— Pardonnez-moi ! ${mall.prep}, est-ce que vous savez où ${facility.verb} ${facility.fr} ? — Oui bien sûr, c’est ${dir.fr}.`,
          questions: [
            q('路人询问的设施位置在哪里？', dir.zh, '在商场屋顶', '在停车场出口外', [dir.kw]),
            q('路人寻找的设施是：', facility.zh, '电影院', '美食广场', [facility.kw]),
          ],
        }
      },
      { capacity: SIMPLE_DIRECTIONS.length * 4 * 4, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Neighborhood pharmacy location inquiry
    Object.assign(
      (rand) => {
        const civ = pick(['madame', 'monsieur'], rand)
        const dir = pick(SIMPLE_DIRECTIONS, rand)
        const street = pick(['la rue Saint-Denis', 'l’avenue du Mont-Royal', 'le boulevard Saint-Laurent', 'la rue Rachel'], rand)
        return {
          text: `— Excusez-moi ${civ} ! Je cherche la pharmacie sur ${street}. Pouvez-vous m’indiquer le chemin ? — Oui, elle est ${dir.fr}.`,
          questions: [
            q('药店的具体方位在：', dir.zh, '在街对面的银行旁边', '在公交车站的后面', [dir.kw]),
            q('路人询问的是什么场所的路线？', '药店', '市政厅', '火车站', ['pharmacie']),
          ],
        }
      },
      { capacity: 2 * SIMPLE_DIRECTIONS.length * 4, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Public building elevator location
    Object.assign(
      (rand) => {
        const dir = pick(SIMPLE_DIRECTIONS, rand)
        const bldg = pick([
          { fr: 'la bibliothèque municipale', zh: '图书馆', kw: 'bibliothèque' },
          { fr: 'le centre communautaire', zh: '社区中心', kw: 'communautaire' },
          { fr: 'l’hôpital régional', zh: '医院', kw: 'hôpital' },
          { fr: 'le collège d’enseignement', zh: '学院教学楼', kw: 'collège' },
        ], rand)
        return {
          text: `— Pardon ! Dans ${bldg.fr}, par où doit-on passer pour prendre l’ascenseur ? — C’est ${dir.fr}.`,
          questions: [
            q('电梯的具体位置在：', dir.zh, '在楼顶露台', '在地下防空洞', [dir.kw]),
            q('对话发生在什么建筑物内？', bldg.zh, '航站楼', '足球场', [bldg.kw]),
          ],
        }
      },
      { capacity: SIMPLE_DIRECTIONS.length * 4, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Neighborhood store inquiry
    Object.assign(
      (rand) => {
        const dir = pick([
          { fr: 'au coin de la rue', zh: '在街角', kw: 'coin' },
          { fr: 'tout droit', zh: '直走', kw: 'tout droit' },
          { fr: 'plus loin à droite', zh: '再往前走一点右转', kw: 'droite' },
          { fr: 'plus loin à gauche', zh: '再往前走一点左转', kw: 'gauche' },
          { fr: 'au bout de la rue', zh: '在街尾', kw: 'bout' },
        ], rand)
        const store = pick([
          { article: 'une', pron: 'une', name: 'épicerie', zh: '杂货店' },
          { article: 'un', pron: 'un', name: 'fleuriste', zh: '花店' },
          { article: 'une', pron: 'une', name: 'boulangerie', zh: '面包房' },
          { article: 'un', pron: 'un', name: 'supermarché', zh: '生鲜超市' },
        ], rand)
        const street = pick(['la rue Principale', 'l’avenue Laurier', 'la rue Beaubien'], rand)
        return {
          text: `— Bonjour ! Est-ce qu’il y a ${store.article} ${store.name} sur ${street} ? — Oui, vous en trouverez ${store.pron} ${dir.fr}.`,
          questions: [
            q('该商店在什么方位？', dir.zh, '在河对岸', '在高速公路旁', [dir.kw]),
            q('路人寻找的是哪种商铺？', store.zh, '五金建材城', '汽车修理厂', [store.name]),
          ],
        }
      },
      { capacity: 5 * 4 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Main exit location in public facility
    Object.assign(
      (rand) => {
        const loc = pick([
          { from: 'du sous-sol', exitLoc: 'au rez-de-chaussée', zh: '在一楼（地面层）' },
          { from: 'du premier étage', exitLoc: 'au rez-de-chaussée', zh: '在一楼（地面层）' },
          { from: 'du deuxième étage', exitLoc: 'au rez-de-chaussée', zh: '在一楼（地面层）' },
        ], rand)
        return {
          text: `— Excusez-moi ! Pour sortir ${loc.from}, où se trouve la sortie principale ? — Elle est ${loc.exitLoc}, prenez l’escalier central.`,
          questions: [
            q('大楼主出口位于哪一层？', loc.zh, '在地下二层（停车场）', '在顶楼天台（露台）', ['rez-de-chaussée']),
            q('路人寻找的是什么出口？', '大楼主出口', '地下车库入口', '通风管道口', ['sortie', 'principale']),
          ],
        }
      },
      { capacity: 3, situation: 0 }
    ),
  ],

  // n2-listening-3
  // Ex 1: Comprendre le nom des sections principales d’un lieu de formation lors d’une visite.
  // Ex 2: Comprendre les indications pour trouver un produit dans une allée d’un grand magasin.
  // RULE: Proper contractions with slot's gender/number! (aCoteDe, prepDe)
  'n2-listening-3': [
    // Scenario 1 (Ex 1): Training center sections tour
    Object.assign(
      (rand) => {
        const sections = [
          { fr: 'le laboratoire informatique', zh: '计算机机房', kw: 'informatique' },
          { fr: 'la bibliothèque des étudiants', zh: '学生图书馆', kw: 'bibliothèque' },
          { fr: 'la cafétéria', zh: '学生餐厅', kw: 'cafétéria' },
          { fr: 'l’atelier pratique', zh: '实训操作车间', kw: 'atelier' },
          { fr: 'le secrétariat pédagogique', zh: '教务秘书处', kw: 'secrétariat' },
        ]
        const s = sample(sections, 3, rand)
        const other = sample(sections.filter((x) => !s.includes(x)), 2, rand)
        return {
          text: `Bienvenue au centre de formation. Au rez-de-chaussée, vous avez ${s[0].fr}. Au premier étage se trouve ${s[1].fr}, et au sous-sol se situe ${s[2].fr}.`,
          questions: [
            q('哪个设施位于一楼（rez-de-chaussée）？', s[0].zh, other[0]?.zh || '健身房', other[1]?.zh || '医务室', [s[0].kw, 'rez-de-chaussée']),
            q('地下一层（sous-sol）是什么设施？', s[2].zh, other[0]?.zh || '停车场', other[1]?.zh || '影音室', [s[2].kw, 'sous-sol']),
          ],
        }
      },
      { capacity: 60, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Supermarket aisle lookup with grammatical contractions
    Object.assign(
      (rand) => {
        const targetFood = pick(FOOD_ITEMS, rand)
        const neighborFood = pick(FOOD_ITEMS.filter((f) => f.base !== targetFood.base), rand)
        const aisle = pick([2, 3, 4, 5, 6, 7, 8], rand)
        const otherAisles = [1, 9, 12].filter((a) => a !== aisle)
        return {
          text: `Pour trouver ${artDef(targetFood)}, rendez-vous à l’allée ${aisle}. C’est situé ${aCoteDe(neighborFood)}.`,
          questions: [
            q('目标商品在几号货架通道？', `Allée ${aisle}`, `Allée ${otherAisles[0]}`, `Allée ${otherAisles[1]}`, [`allée ${aisle}`]),
            q('该商品紧邻什么物品摆放？', `在${neighborFood.zh}旁边`, '在收银机后面', '在进口处', [neighborFood.base]),
          ],
        }
      },
      { capacity: FOOD_ITEMS.length * (FOOD_ITEMS.length - 1) * 7, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Community center layout
    Object.assign(
      (rand) => {
        const floor1Options = [
          { fr: 'la salle de sport', zh: '体育活动厅', kw: 'sport' },
          { fr: 'la halte-garderie', zh: '临时日托所', kw: 'halte-garderie' },
          { fr: 'le vestiaire', zh: '更衣区', kw: 'vestiaire' },
        ]
        const floor1 = pick(floor1Options, rand)
        return {
          text: `Voici notre centre communautaire : ${floor1.fr} est au rez-de-chaussée, et les classes de francisation sont au 2e étage.`,
          questions: [
            q('哪个设施位于一楼？', floor1.zh, '屋顶花园', '地下车库', [floor1.kw, 'rez-de-chaussée']),
            q('法语培训教室在几楼？', '二楼', '一楼', '地下室', ['francisation', '2e étage']),
          ],
        }
      },
      { capacity: 3, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Supermarket second aisle lookup with contractions
    Object.assign(
      (rand) => {
        const food1 = pick(FOOD_ITEMS, rand)
        const food2 = pick(FOOD_ITEMS.filter((f) => f.base !== food1.base), rand)
        const aisle = pick([1, 4, 7, 10], rand)
        return {
          text: `${cap(artDef(food1))} ${food1.number === 'p' ? 'se trouvent' : 'se trouve'} dans l’allée ${aisle}, juste ${aCoteDe(food2)}.`,
          questions: [
            q('该商品位于几号通道？', `${aisle} 号通道`, '15 号通道', '20 号通道', [`allée ${aisle}`]),
            q('它摆放在什么货品旁边？', `在${food2.zh}旁边`, '在收银台前', '在卫生间旁', [food2.base]),
          ],
        }
      },
      { capacity: FOOD_ITEMS.length * (FOOD_ITEMS.length - 1) * 4, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Library section orientation
    Object.assign(
      (rand) => {
        return {
          text: 'Dans notre bibliothèque : la section jeunesse est au rez-de-chaussée, et les dictionnaires de référence sont au premier étage.',
          questions: [
            q('青少年阅览区位于哪一层？', '一楼', '二楼', '地下室', ['jeunesse', 'rez-de-chaussée']),
            q('字典参考资料区在：', '二楼', '一楼', '三楼', ['dictionnaires', 'premier étage']),
          ],
        }
      },
      { capacity: 10, situation: 0 }
    ),
  ],

  // n2-listening-4
  // Ex 1: Réagir à des consignes énoncées par un éducateur pour aller chercher son enfant au service de garde.
  // Ex 2: Réagir à une interdiction énoncée par une agente de sécurité dans un lieu public.
  // Genuinely varied instructions (> 60 distinct texts)
  'n2-listening-4': [
    // Scenario 1 (Ex 1): Daycare educator child pickup instructions
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const instrs = [
          { fr: 'signez le registre de présence', zh: '在签到退登记簿上签名', kw: 'registre' },
          { fr: 'prenez ses bottes dans son casier', zh: '从储物柜拿走他的雪靴', kw: 'bottes' },
          { fr: 'rangez son manteau dans son sac à dos', zh: '把外套装进他的书包', kw: 'manteau' },
          { fr: 'attendez dans le vestiaire des parents', zh: '在家长更衣等待室稍候', kw: 'vestiaire' },
          { fr: 'vérifiez son cahier de communication', zh: '查看联络本上的每日记录', kw: 'communication' },
        ]
        const i = sample(instrs, 2, rand)
        const alt = sample(instrs.filter((x) => !i.includes(x)), 2, rand)
        const titleFr = g(persona, 'L’éducateur', 'L’éducatrice')
        return {
          text: `Bonjour. ${titleFr} ${persona.name} vous rappelle : ${i[0].fr}, puis ${i[1].fr}.`,
          questions: [
            q('幼教老师首先要求家长做的是：', i[0].zh, alt[0].zh, alt[1].zh, [i[0].kw]),
            q('随后的指令是：', i[1].zh, alt[0].zh, alt[1].zh, [i[1].kw]),
          ],
        }
      },
      { capacity: PERSONAS.length * 20, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Security officer prohibition in public place
    Object.assign(
      (rand) => {
        const place = pick(['À la bibliothèque municipale', 'Dans le complexe sportif', 'Au musée municipal', 'Dans l’édifice de la Ville'], rand)
        const prohibs = [
          { fr: 'Il est interdit de stationner devant cette issue de secours', zh: '严禁在此应急出口前停车', kw: 'stationner' },
          { fr: 'Défense d’entrer dans ce couloir sans carte d’accès', zh: '无门禁卡严禁进入该走廊', kw: 'carte d’accès' },
          { fr: 'Ne laissez aucun bagage sans surveillance', zh: '请勿将任何行李脱离看管', kw: 'bagage' },
          { fr: 'Il est strictement interdit de fumer ou de vapoter ici', zh: '此区域内严禁吸烟或吸电子烟', kw: 'fumer' },
          { fr: 'Ne bloquez pas le passage des escaliers', zh: '请勿阻挡楼梯疏散通道', kw: 'escaliers' },
        ]
        const p = pick(prohibs, rand)
        const alt = sample(prohibs.filter((x) => x.zh !== p.zh), 2, rand)
        return {
          text: `${place} : attention s’il vous plaît ! ${p.fr}. Merci de votre collaboration pour la sécurité de tous.`,
          questions: [
            q('安保人员宣布的安全禁令是：', p.zh, alt[0].zh, alt[1].zh, [p.kw]),
            q('公众听到此要求后应当：', '自觉配合并严格遵守规定', '拍照并把照片发到网上', '询问附近哪里有停车场', ['collaboration']),
          ],
        }
      },
      { capacity: 4 * 5, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Daycare departure rules
    Object.assign(
      (rand) => {
        const daycare = pick(['Garderie Les Petits Pas', 'CPE Soleil', 'Service de garde Étoile'], rand)
        const instrs = [
          { fr: 'signer la fiche de départ', zh: '签署离园登记单', kw: 'fiche de départ' },
          { fr: 'ramasser les jouets de votre enfant', zh: '收好孩子的个人玩具', kw: 'jouets' },
          { fr: 'fermer la barrière de sécurité', zh: '随手关好儿童安全防护门', kw: 'barrière' },
          { fr: 'vérifier le casier de rechange', zh: '检查备用衣物储物柜', kw: 'casier' },
        ]
        const i = sample(instrs, 2, rand)
        const alt = sample(instrs.filter((x) => !i.includes(x)), 2, rand)
        return {
          text: `Avis aux parents ${deOrg(daycare)} : n’oubliez pas de ${i[0].fr} et de ${i[1].fr} avant de quitter les lieux.`,
          questions: [
            q('离园前要求完成的第一件事是：', i[0].zh, alt[0].zh, alt[1].zh, [i[0].kw]),
            q('第二项要求是：', i[1].zh, alt[0].zh, alt[1].zh, [i[1].kw]),
          ],
        }
      },
      { capacity: 3 * 12, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Transit safety warning announcement
    Object.assign(
      (rand) => {
        const station = pick(['Station Berri-UQAM', 'Station Bonaventure', 'Station Jean-Talon', 'Station Snowdon'], rand)
        const warnings = [
          { fr: 'Éloignez-vous de la bordure du quai', zh: '请远离站台边缘', kw: 'bordure du quai' },
          { fr: 'Ne retenez pas les portes automatiques', zh: '请勿强行扒阻自动车门', kw: 'portes automatiques' },
          { fr: 'Ne traversez pas les voies ferrées', zh: '严禁横穿铁路轨道', kw: 'voies ferrées' },
        ]
        const w = pick(warnings, rand)
        const alt = warnings.filter((x) => x.zh !== w.zh)
        return {
          text: `Message de la STM (${station}) : ${w.fr}. Attention : amende de 100 dollars.`,
          questions: [
            q('广播播报的安全警示是：', w.zh, alt[0].zh, alt[1].zh, [w.kw]),
            q('违规者将面临什么后果：', '被处以罚款', '被勒令离开车站', '被暂停乘车卡', ['amende']),
          ],
        }
      },
      { capacity: 4 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Daycare morning arrival drop-off
    Object.assign(
      (rand) => {
        const daycare = pick(['Garderie du Parc', 'CPE des Érables', 'Garderie Fleurie'], rand)
        const instrs = [
          { fr: 'mettre ses souliers d’intérieur', zh: '换上室内鞋', kw: 'souliers' },
          { fr: 'laver les mains de votre enfant', zh: '带孩子去洗手', kw: 'laver les mains' },
          { fr: 'noter l’heure d’arrivée sur la fiche', zh: '在登记卡上记下入园时间', kw: 'fiche' },
        ]
        const i = sample(instrs, 2, rand)
        const alt = instrs.filter((x) => !i.includes(x))
        return {
          text: `${cap(auOrg(daycare))} : veuillez ${i[0].fr}, puis ${i[1].fr}. Bonne journée !`,
          questions: [
            q('早晨入园时第一步要求是：', i[0].zh, alt[0].zh, '在院子里奔跑', [i[0].kw]),
            q('随后的卫生或登记要求是：', i[1].zh, alt[0].zh, '直接离开', [i[1].kw]),
          ],
        }
      },
      { capacity: 3 * 6, situation: 0 }
    ),
  ],

  // n2-listening-5
  // Ex 1: Comprendre les excuses d’une passagère qui désire se frayer un chemin dans un autobus bondé.
  // Ex 2: Comprendre les formules d’interpellation utilisées par un passant dans la rue.
  // RULE: NO plus-que-parfait! (« Je ne vous avais pas vue » replaced).
  'n2-listening-5': [
    // Scenario 1 (Ex 1): Crowded bus passenger apologies & moving through
    Object.assign(
      (rand) => {
        const line = pick([24, 55, 80, 105, 129, 165], rand)
        const street = pick(['la rue Sherbrooke', 'l’avenue du Parc', 'le boulevard Saint-Laurent', 'la rue Saint-Denis'], rand)
        return {
          text: `— Pardonnez-moi ! Sur la ligne ${line}, je descends au prochain arrêt sur ${street}, laissez-moi passer s’il vous plaît. — Oui bien sûr, allez-y !`,
          questions: [
            q('乘客表达歉意并请人让路的原因是：', '她要在下一站下车', '她丢了钱包', '她要找司机问路', ['descends', 'prochain arrêt']),
            q('对话中使用的礼貌道歉用语是：', 'Pardonnez-moi / Excusez-moi', 'Bonjour / Merci', 'Au revoir', ['pardonnez-moi']),
          ],
        }
      },
      { capacity: 6 * 4, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Street passerby asking for time
    Object.assign(
      (rand) => {
        const civ = pick(['madame', 'monsieur'], rand)
        const time = pick(CLOCK_TIMES, rand)
        const otherTimes = sample(CLOCK_TIMES.filter((t) => t.hour !== time.hour), 2, rand)
        return {
          text: `— Excusez-moi ${civ} ! S’il vous plaît, auriez-vous l’heure ? Ma montre ne fonctionne plus. — Oui certainement, il est ${time.frDisplay}.`,
          questions: [
            q('路人礼貌搭话的目的是：', '询问当前时间', '索要零钱', '推销产品', ['heure']),
            q('对方告知的时间是：', time.zh, otherTimes[0].zh, otherTimes[1].zh, [time.frDisplay.toLowerCase()]),
          ],
        }
      },
      { capacity: 2 * CLOCK_TIMES.length, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Supermarket checkout queue bump apology (NO plus-que-parfait!)
    Object.assign(
      (rand) => {
        const caisse = pick([1, 2, 3, 4, 5, 6], rand)
        const store = pick(['chez Métro', 'chez IGA', 'chez Jean Coutu', 'chez Maxi'], rand)
        return {
          text: `— Oh pardon madame ! Je ne vous ai pas vue, vous êtes avant moi dans la file à la caisse ${caisse} ${store}. Je vous en prie, passez devant !`,
          questions: [
            q('顾客向对方道歉是因为：', '自己刚才没看到对方排在前面', '自己把推车撞到了对方', '自己不小心插队排到了前面', ['pardon', 'file']),
            q('她们正在哪个收银台排队？', `caisse ${caisse}`, 'caisse 9', 'caisse 12', [`caisse ${caisse}`]),
          ],
        }
      },
      { capacity: 6 * 4, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Street passerby asking for directions
    Object.assign(
      (rand) => {
        const place = pick(PLACES_SERVICES, rand)
        const street = pick(['la rue Principale', 'l’avenue Laurier', 'le boulevard René-Lévesque'], rand)
        const otherPlaces = sample(PLACES_SERVICES.filter((p) => p.zh !== place.zh), 2, rand)
        return {
          text: `— Pardon monsieur ! Excusez-moi de vous déranger, est-ce que vous savez où se trouve ${place.fr} sur ${street} ? — Oui, c’est tout droit.`,
          questions: [
            q('路人上前搭话是为了寻找：', place.zh, otherPlaces[0].zh, otherPlaces[1].zh, [place.base.toLowerCase()]),
            q(
              '路人使用的礼貌搭话短语是：',
              'Pardon monsieur ! Excusez-moi de vous déranger',
              'Bonsoir madame ! Je vous souhaite une bonne journée',
              'Merci beaucoup ! Au revoir et à la prochaine fois',
              ['pardon monsieur', 'déranger']
            ),
          ],
        }
      },
      { capacity: PLACES_SERVICES.length * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Crowded metro car doorway excuse
    Object.assign(
      (rand) => {
        const route = pick([
          { line: 'la ligne orange', station: 'Bonaventure', otherStations: ['Guy-Concordia', 'Peel'] },
          { line: 'la ligne orange', station: 'Mont-Royal', otherStations: ['Guy-Concordia', 'Place-des-Arts'] },
          { line: 'la ligne orange', station: 'Snowdon', otherStations: ['Peel', 'Place-des-Arts'] },
          { line: 'la ligne verte', station: 'Peel', otherStations: ['Bonaventure', 'Mont-Royal'] },
          { line: 'la ligne verte', station: 'Guy-Concordia', otherStations: ['Snowdon', 'Mont-Royal'] },
          { line: 'la ligne verte', station: 'Place-des-Arts', otherStations: ['Bonaventure', 'Jean-Talon'] },
        ], rand)
        return {
          text: `— Pardon tout le monde ! Excusez-moi, je dois sortir sur ${route.line} à la station ${route.station}. Merci de me laisser passer !`,
          questions: [
            q('乘客请求大家让路是因为：', '需要在本站下车出车门', '车厢内有危险', '需要换座位', ['sortir', 'station']),
            q('列车到达的车站是：', route.station, route.otherStations[0], route.otherStations[1], [route.station.toLowerCase()]),
          ],
        }
      },
      { capacity: 6, situation: 0 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 2 - READING
  // ===========================================================================

  // n2-reading-0
  // Ex 1: Comprendre des renseignements relatifs à des produits alimentaires dans une circulaire.
  // Ex 2: Comprendre les indications précisant le prochain arrêt sur un panneau d’autobus.
  'n2-reading-0': [
    // Scenario 1 (Ex 1): Grocery flyer special offers
    Object.assign(
      (rand) => {
        const f1 = pick(FOOD_ITEMS, rand)
        const f2 = pick(FOOD_ITEMS.filter((f) => f.base !== f1.base), rand)
        const p1 = pick(['2,99 $', '3,49 $', '4,99 $', '5,29 $'], rand)
        const p2 = pick(['1,99 $', '2,49 $', '3,99 $'], rand)
        const unit1 = f1.unitShort === 'L' ? '/ L' : '/ kg'
        const day = pick(DAYS, rand)
        const otherDays = sample(DAYS.filter((d) => d.zh !== day.zh), 2, rand)
        return {
          text: `Circulaire Métro : ${cap(f1.base)} : ${p1} ${unit1}. ${cap(f2.base)} : ${p2} le paquet. Rabais valide jusqu’à ${day.fr}.`,
          questions: [
            q(`${f1.zh}的特价是多少？`, `${p1} ${unit1}`, `9,99 $ ${unit1}`, '免费赠送', [f1.base.toLowerCase(), p1]),
            q('本期特价优惠截止到星期几？', day.zh, otherDays[0].zh, otherDays[1].zh, [day.fr.toLowerCase()]),
          ],
        }
      },
      { capacity: FOOD_ITEMS.length * (FOOD_ITEMS.length - 1) * 4 * 3 * DAYS.length, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Bus next stop digital board
    Object.assign(
      (rand) => {
        const line = pick([24, 55, 80, 105, 129], rand)
        const stop1 = pick(['rue Sherbrooke', 'avenue du Mont-Royal', 'rue Saint-Denis', 'rue Saint-Hubert'], rand)
        const metro = pick(['Sherbrooke', 'Mont-Royal', 'Berri-UQAM', 'Saint-Laurent'], rand)
        const otherStops = ['rue Peel', 'boulevard René-Lévesque'].filter((s) => s !== stop1)
        return {
          text: `Panneau d’affichage du bus ligne ${line} : Prochain arrêt : ${stop1}. Correspondance avec le métro ${metro}. Arrêt suivant : avenue Laurier.`,
          questions: [
            q('公交车的下一站（Prochain arrêt）是哪一站？', stop1, otherStops[0], otherStops[1], [stop1.toLowerCase()]),
            q('该站可换乘哪个地铁站？', metro, 'Snowdon', 'Concordia', [metro.toLowerCase()]),
          ],
        }
      },
      { capacity: 5 * 4 * 4, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Supermarket discount limit flyer
    Object.assign(
      (rand) => {
        const f1 = pick(FOOD_ITEMS, rand)
        const p1 = pick(['1,49 $', '2,29 $', '3,19 $'], rand)
        const limit = pick([2, 4, 6], rand)
        return {
          text: `Circulaire IGA : ${cap(f1.base)} à ${p1}. Limite de ${limit} articles par client. Le 2e article à moitié prix.`,
          questions: [
            q(`${f1.zh}的促销价格是？`, p1, '10,00 $', '免费', [f1.base.toLowerCase(), p1]),
            q('每位顾客限购多少件？', `${limit} 件`, '10 件', '不限量', [`${limit}`]),
          ],
        }
      },
      { capacity: FOOD_ITEMS.length * 3 * 3, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Night bus route next stop display
    Object.assign(
      (rand) => {
        const line = pick([356, 360, 361, 363], rand)
        const stop1 = pick(['rue Sainte-Catherine', 'boulevard De Maisonneuve', 'rue Ontario'], rand)
        const dest = pick(['Terminus Centre-Ville', 'Station Jean-Talon', 'Station Côte-Vertu'], rand)
        return {
          text: `Ligne de nuit ${line} : Prochain arrêt : ${stop1}. Pour descendre, tirez le cordon jaune. Terminus : ${dest}.`,
          questions: [
            q('夜班车的下一站是哪里？', stop1, 'Station Berri', 'Aéroport', [stop1.toLowerCase()]),
            q('这趟车的终点站（Terminus）是？', dest, 'Gare Centrale', 'Parc Jarry', [dest.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 3 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Farmers market flyer
    Object.assign(
      (rand) => {
        const f = pick(FOOD_ITEMS, rand)
        const price = pick(['2,50 $', '3,00 $', '4,25 $'], rand)
        const unit = f.unitFr || 'la livre'
        const unitShort = f.unitShort || 'lb'
        return {
          text: `Marché Jean-Talon : ${cap(f.base)} du Québec à ${price} ${unit}. Arrivage frais tous les matins.`,
          questions: [
            q(`本地产${f.zh}的价格是？`, `${price} / ${unitShort}`, `15,00 $ / ${unitShort}`, '免费', [f.base.toLowerCase(), price]),
            q('该宣传单来自哪个市场？', 'Marché Jean-Talon', 'Marché Atwater', 'Marché Bonsecours', ['jean-talon']),
          ],
        }
      },
      { capacity: FOOD_ITEMS.length * 3, situation: 0 }
    ),
  ],

  // n2-reading-1
  // Ex 1: Comprendre les renseignements demandés dans un formulaire de changement d’adresse.
  // Ex 2: Comprendre les renseignements demandés dans un formulaire pour une sortie scolaire.
  // Genuinely varied content (> 60 distinct texts)
  'n2-reading-1': [
    // Scenario 1 (Ex 1): Address change form
    Object.assign(
      (rand) => {
        const oldNum = pick([105, 220, 315, 450], rand)
        const newNum = pick([500, 620, 780, 910], rand)
        const oldStreet = pick(['rue Saint-Denis', 'rue Rachel', 'rue Sherbrooke'], rand)
        const newStreet = pick(['avenue Laurier', 'boulevard Saint-Joseph', 'rue Beaubien'], rand)
        const newCity = pick(['Montréal', 'Laval', 'Longueuil'], rand)
        const effDate = pick(['1er juillet', '1er août', '1er septembre'], rand)
        return {
          text: `Formulaire de changement d’adresse : Ancienne adresse : ${oldNum}, ${oldStreet}. Nouvelle adresse : ${newNum}, ${newStreet}, ${newCity}. Date effective : ${effDate}.`,
          questions: [
            q('表格中填写的“Nouvelle adresse”（新地址）是？', `${newNum}, ${newStreet}, ${newCity}`, `${oldNum}, ${oldStreet}`, '100, rue Principale', [`${newNum}`, newStreet.toLowerCase()]),
            q('地址变更从哪一天开始生效（Date effective）？', effDate, '1er janvier', '31 décembre', [effDate.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 4 * 3 * 3 * 3 * 3, situation: 0 }
    ),
    // Scenario 2 (Ex 2): School field trip authorization form
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const dest = pick(['Biodôme de Montréal', 'Musée des beaux-arts', 'Planétarium', 'Insectarium'], rand)
        const fee = pick(['12 $', '15 $', '18 $', '20 $'], rand)
        const date = pick(['14 octobre', '20 novembre', '12 mai'], rand)
        const otherDests = ['Parc Safari', 'Zoo de Granby'].filter((d) => d !== dest)
        return {
          text: `Autorisation de sortie scolaire : Nom de l’élève : ${persona.name} | Destination : ${dest} | Date : ${date} | Frais : ${fee} | Signature requise : [Oui]`,
          questions: [
            q('学校外出活动的目的地是？', dest, otherDests[0], otherDests[1], [dest.toLowerCase()]),
            q('参加该次活动的费用是多少？', fee, '50 $', '免费', [fee]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4 * 4 * 3, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Electricity utility moving notice
    Object.assign(
      (rand) => {
        const depDate = pick(['30 juin', '15 juillet', '31 juillet'], rand)
        const account = pick(['HQ-90214', 'HQ-34821', 'HQ-58190'], rand)
        const billingStreet = pick(['rue Papineau', 'avenue du Mont-Royal', 'boulevard Gouin'], rand)
        return {
          text: `Hydro-Québec — Avis de déménagement : Numéro de compte : ${account} | Date de départ : ${depDate} | Nouvelle adresse : ${billingStreet}.`,
          questions: [
            q('用户搬迁离开的原地址日期是？', depDate, '1er janvier', '31 décembre', [depDate.toLowerCase()]),
            q('新的电费账单寄送街道是？', billingStreet, 'rue Sherbrooke', 'rue Saint-Denis', [billingStreet.toLowerCase()]),
          ],
        }
      },
      { capacity: 3 * 3 * 3, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Day camp field trip authorization
    Object.assign(
      (rand) => {
        const activity = pick(['Glissades sur tube', 'Patinage sur glace', 'Baignade à la piscine'], rand)
        const venue = pick(['Parc Jean-Drapeau', 'Mont Saint-Bruno', 'Complexe sportif'], rand)
        const returnTime = pick(['15 h 30', '16 h 00', '16 h 30'], rand)
        return {
          text: `Camp de jour — Fiche d’excursion : Activité : ${activity} | Lieu : ${venue} | Heure de retour prévue : ${returnTime}.`,
          questions: [
            q('夏令营出游的活动项目是？', activity, '电影欣赏', '野营过夜', [activity.toLowerCase()]),
            q('预计返回的时间是几点？', returnTime, '12 h 00', '18 h 30', [returnTime]),
          ],
        }
      },
      { capacity: 3 * 3 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Canada Post mail forwarding request
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const duration = pick([4, 6, 12], rand)
        const startDate = pick(['1er juillet', '1er août'], rand)
        return {
          text: `Postes Canada — Changement d’adresse : Demandeur : ${persona.name} | Durée : ${duration} mois | Date de début : ${startDate}.`,
          questions: [
            q('邮件转递服务的有效时长是？', `${duration} 个月`, '1 个月', '永久有效', [`${duration} mois`]),
            q('转递服务从哪天开始？', startDate, '1er janvier', '31 décembre', [startDate.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 3 * 2, situation: 0 }
    ),
  ],

  // n2-reading-2
  // Ex 1: Comprendre des symboles liés aux prévisions météorologiques.
  // Ex 2: Comprendre des abréviations d’unités de mesure au comptoir des viandes d’un supermarché.
  // RULE: Test symbols/abbreviations themselves ($, ¢, °C, kg, g, lb, L, ml, km, h, min, tél., RDV, etc.)!
  'n2-reading-2': [
    // Scenario 1 (Ex 1): Weather strip with emoji symbols and °C
    Object.assign(
      (rand) => {
        const city = pick(['Montréal', 'Québec', 'Gatineau', 'Sherbrooke', 'Trois-Rivières'], rand)
        const dayIndices = sample([0, 1, 2, 3, 4, 5, 6], 4, rand).sort((a, b) => a - b)
        const [d1, d2, d3, d4] = dayIndices.map((i) => DAYS[i])
        const t1 = pick([18, 20, 22], rand)
        const t2 = pick([12, 14, 15], rand)
        const t3 = pick([-2, -4, 0], rand)
        const t4 = pick([6, 8, 10], rand)
        return {
          text: `Prévisions météo pour ${city} : ${d1.fr} ☀️ (${t1} °C) ; ${d2.fr} 🌧️ (${t2} °C) ; ${d3.fr} ❄️ (${t3} °C) ; ${d4.fr} 🌬️ (${t4} °C).`,
          questions: [
            q(`根据气象带，${d2.fr}显示的图标 🌧️ 代表什么天气？`, '降雨天气', '晴朗天气', '降雪天气', [d2.fr.toLowerCase(), '🌧️']),
            q('温度符号“°C”代表的含义是：', '摄氏度（温度单位）', '厘米（长度单位）', '分（货币单位）', ['°c']),
          ],
        }
      },
      { capacity: 5 * 35 * 3 * 3 * 3 * 3, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Meat counter abbreviations ($, ¢, kg, g, lb)
    Object.assign(
      (rand) => {
        const p1 = pick(['4,99', '5,49', '5,99'], rand)
        const p2 = pick(['10,50', '11,99', '12,49'], rand)
        const w = pick([100, 150, 200], rand)
        const c = pick([89, 99], rand)
        return {
          text: `Comptoir de boucherie : Bœuf haché : ${p1} $ / lb ; Rôti de porc : ${p2} $ / kg ; Tranches de jambon : ${w} g pour ${c} ¢.`,
          questions: [
            q('肉铺标牌上的缩写“lb”代表：', '磅（重量单位）', '升（容量单位）', '行（文本单位）', ['lb']),
            q('缩写“kg”代表：', '千克 / 公斤', '千米 / 公里', '千瓦（功率单位）', ['kg']),
          ],
        }
      },
      { capacity: 3 * 3 * 3 * 2, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Winter storm weather strip with km/h and ❄️
    Object.assign(
      (rand) => {
        const t1 = pick([-5, -8, -12], rand)
        const t2 = pick([2, 5], rand)
        return {
          text: `Avis météo régional : Aujourd’hui ❄️ (${t1} °C, vent 40 km/h). Demain ☀️ (${t2} °C). Samedi 🌧️ (4 °C).`,
          questions: [
            q('气象预报中图标 ❄️ 预示着什么？', '降雪天气', '艳阳高照', '雷阵雨', ['❄️']),
            q('风速单位“km/h”代表：', '千米/小时（速度）', '千克/人（体重）', '升/小时（流量）', ['km/h']),
          ],
        }
      },
      { capacity: 3 * 2, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Dairy and liquid volume abbreviations (L, ml, $, ¢)
    Object.assign(
      (rand) => {
        const milkPrice = pick(['4,29', '4,89', '5,19'], rand)
        const creamPrice = pick(['85', '95'], rand)
        return {
          text: `Rayon des produits laitiers : Lait 2 % : 2 L pour ${milkPrice} $. Crème : 250 ml à ${creamPrice} ¢. Jus : 1 L.`,
          questions: [
            q('容量单位缩写“L”代表：', '升（容量单位）', '磅（重量单位）', '长（长度单位）', ['2 l']),
            q('缩写“ml”代表：', '毫升', '分钟', '米', ['ml']),
          ],
        }
      },
      { capacity: 3 * 2, situation: 1 }
    ),
    // Scenario 5 (Ex 1): Appointment card abbreviations (RDV, tél., boul., min)
    Object.assign(
      (rand) => {
        const m = pick([10, 15, 20], rand)
        return {
          text: `Rappel de RDV : Clinique Santé, 250, boul. René-Lévesque, app. 4B. Tél. : 514 555-0145. Arriver ${m} min à l’avance.`,
          questions: [
            q('卡片上的缩写“RDV”代表：', '就诊预约', '身份证号', '会员卡号', ['rdv']),
            q(`“${m} min”中的“min”代表：`, '分钟', '最小值', '上午时间', ['min']),
          ],
        }
      },
      { capacity: 3, situation: 1 }
    ),
  ],

  // n2-reading-3
  // Ex 1: Comprendre le montant écrit en toutes lettres sur un chèque.
  // Ex 2: Comprendre le nombre de pièces d’identité à fournir pour une inscription.
  // RULE: The digits must NOT also be printed in the text! Generate number with numberToFrench().
  'n2-reading-3': [
    // Scenario 1 (Ex 1): Check written amount in words (NO DIGITS in text)
    Object.assign(
      (rand) => {
        const amounts = [1200, 1500, 1800, 2200, 2500, 2800, 3200, 3500, 4200, 4500, 5200, 3800]
        const amt = pick(amounts, rand)
        const comp = pick([
          'Gestion Immobilière du Parc',
          'Habitations Québec',
          'Location du Nord',
          'Logements Modernes',
          'Résidences Laval',
          'Immeubles Laurier',
        ], rand)
        const correctDigits = `${formatDigits(amt)} $`
        const otherAmts = amounts.filter((a) => a !== amt).map((a) => `${formatDigits(a)} $`)
        const frenchWords = numberToFrench(amt)
        return {
          text: `Payez à l’ordre de « ${comp} » la somme de ${frenchWords} dollars et 00/100.`,
          questions: [
            q('支票上用文字书写的金额对应阿拉伯数字是多少？', correctDigits, otherAmts[0], otherAmts[1], [frenchWords.split(' ')[0].toLowerCase()]),
            q('该支票的收款受益单位（l’ordre de）是：', comp, 'Banque Nationale', 'Hydro-Québec', [comp.toLowerCase()]),
          ],
        }
      },
      { capacity: 12 * 6, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Number of ID documents required in words (NO DIGITS in text)
    Object.assign(
      (rand) => {
        const count = pick([2, 3, 4], rand)
        const workshop = pick(['cuisine', 'menuiserie', 'peinture', 'conversation', 'couture', 'danse'], rand)
        const words = numberToFrench(count)
        const otherCounts = [1, 5, 6].filter((c) => c !== count)
        return {
          text: `Inscription à l’atelier de ${workshop} : Chaque participant doit apporter ${words} pièces d’identité officielles avec photo et une preuve de résidence.`,
          questions: [
            q('参加者必须提供几件带照片的官方身份证件？', `${count} 件`, `${otherCounts[0]} 件`, `${otherCounts[1]} 件`, [words.toLowerCase()]),
            q('除身份证件外还要求出具什么证明？', '居住地址证明', '收入证明', '在校成绩单', ['résidence']),
          ],
        }
      },
      { capacity: 3 * 6, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Payment receipt written in words (NO DIGITS in text)
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const amounts = [180, 250, 320, 480, 520, 600, 750, 800, 920]
        const amt = pick(amounts, rand)
        const words = numberToFrench(amt)
        const correctDigits = `${formatDigits(amt)} $`
        const otherDigits = amounts.filter((a) => a !== amt).map((a) => `${formatDigits(a)} $`)
        return {
          text: `Reçu officiel de formation : Reçu ${de(persona.name)} la somme ${de(words)} dollars pour les cours de francisation.`,
          questions: [
            q('收据上确认的收款金额阿拉伯数字是：', correctDigits, otherDigits[0], otherDigits[1], [words.split(' ')[0].toLowerCase()]),
            q('该收据开具的用途是：', '法语课程学费', '教材费', '考试报名费', ['francisation']),
          ],
        }
      },
      { capacity: PERSONAS.length * 9, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Community library loan limits in words (NO DIGITS in text)
    Object.assign(
      (rand) => {
        const books = pick([4, 6, 8, 10], rand)
        const days = pick([14, 21, 28], rand)
        const wordsBooks = numberToFrench(books)
        const wordsDays = numberToFrench(days)
        const otherBooks = [2, 12, 15].filter((b) => b !== books)
        return {
          text: `Règlement de la bibliothèque : Chaque membre peut emprunter jusqu’à ${wordsBooks} livres pour une durée maximale de ${wordsDays} jours.`,
          questions: [
            q('每位读者最多可同时借阅多少本书？', `${books} 本`, `${otherBooks[0]} 本`, `${otherBooks[1]} 本`, [wordsBooks.toLowerCase()]),
            q('单次最长借期是多少天？', `${days} 天`, '7 天', '60 天', [wordsDays.toLowerCase()]),
          ],
        }
      },
      { capacity: 4 * 3, situation: 1 }
    ),
    // Scenario 5 (Ex 0): Repair invoice amount in words (NO DIGITS in text)
    Object.assign(
      (rand) => {
        const amounts = [450, 680, 850, 980, 1200, 1350, 1600]
        const amt = pick(amounts, rand)
        const words = numberToFrench(amt)
        const correctDigits = `${formatDigits(amt)} $`
        const otherDigits = amounts.filter((a) => a !== amt).map((a) => `${formatDigits(a)} $`)
        return {
          text: `Facture de réparation automobile : Total payable de ${words} dollars sur réception des travaux.`,
          questions: [
            q('发票上应付的维修总金额阿拉伯数字是：', correctDigits, otherDigits[0], otherDigits[1], [words.split(' ')[0].toLowerCase()]),
            q('此款项由哪项服务产生：', '汽车维修', '洗车服务', '拖车服务', ['réparation']),
          ],
        }
      },
      { capacity: 7, situation: 0 }
    ),
  ],

  // n2-reading-4
  // Ex 1: Réagir aux consignes relatives à des activités à réaliser en classe.
  // Ex 2: Réagir aux consignes affichées sur l’écran d’un guichet automatique.
  // Genuinely varied instructions (> 60 distinct texts)
  'n2-reading-4': [
    // Scenario 1 (Ex 1): Classroom exam written instructions
    Object.assign(
      (rand) => {
        const instrs = [
          { fr: 'Lisez attentivement le texte avant de répondre', zh: '作答前仔细通读短文', kw: 'lisez' },
          { fr: 'Répondez par des phrases complètes', zh: '用完整的句子作答', kw: 'répondez' },
          { fr: 'Soulignez les verbes conjugués', zh: '划出句中的变位动词', kw: 'soulignez' },
          { fr: 'Ne consultez aucun dictionnaire', zh: '严禁查阅任何字典', kw: 'dictionnaire' },
          { fr: 'Écrivez lisiblement au stylo à l’encre', zh: '用圆珠笔或钢笔工整书写', kw: 'écrivez' },
        ]
        const i = sample(instrs, 2, rand)
        const alt = sample(instrs.filter((x) => !i.includes(x)), 2, rand)
        const m = pick([30, 45, 60], rand)
        return {
          text: `Consignes de l’activité en classe : ${i[0].fr}. Ensuite, ${i[1].fr.toLowerCase()}. Temps alloué : ${m} minutes.`,
          questions: [
            q('活动要求的第一条规则是：', i[0].zh, alt[0].zh, alt[1].zh, [i[0].kw]),
            q('第二项具体要求是：', i[1].zh, alt[0].zh, alt[1].zh, [i[1].kw]),
          ],
        }
      },
      { capacity: 20 * 3, situation: 0 }
    ),
    // Scenario 2 (Ex 2): ATM screen instructions
    Object.assign(
      (rand) => {
        const steps = [
          { fr: 'Insérez votre carte de débit dans le lecteur', zh: '将借记卡插入卡槽读卡器', kw: 'insérez' },
          { fr: 'Entrez votre numéro d’identification personnel (NIP)', zh: '输入个人银行卡密码', kw: 'nip' },
          { fr: 'Sélectionnez le type de transaction', zh: '在屏幕上选择交易类型', kw: 'sélectionnez' },
          { fr: 'Prenez vos billets et votre reçu', zh: '取走纸币现金和打印凭条', kw: 'reçu' },
        ]
        const s = sample(steps, 2, rand)
        const alt = steps.filter((x) => !s.includes(x))
        return {
          text: `Guichet automatique Desjardins : Étape 1 : ${s[0].fr}. Étape 2 : ${s[1].fr.toLowerCase()}. Ne quittez pas avant la fin.`,
          questions: [
            q('屏幕显示的第一步操作是：', s[0].zh, alt[0].zh, alt[1].zh, [s[0].kw]),
            q('随后的第二步操作是：', s[1].zh, alt[0].zh, alt[1].zh, [s[1].kw]),
          ],
        }
      },
      { capacity: 12, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Group workshop reading instructions
    Object.assign(
      (rand) => {
        const instrs = [
          { fr: 'Lisez le texte à deux', zh: '两人合作朗读课文', kw: 'lisez' },
          { fr: 'Comparez vos réponses avec votre voisin', zh: '与同桌核对对比答案', kw: 'comparez' },
          { fr: 'Soulignez les mots nouveaux', zh: '划出不认识的生词', kw: 'soulignez' },
          { fr: 'Écrivez vos idées au tableau', zh: '将讨论要点写在黑板上', kw: 'écrivez' },
        ]
        const i = sample(instrs, 2, rand)
        const alt = instrs.filter((x) => !i.includes(x))
        return {
          text: `Travail d’équipe : ${i[0].fr}. Ensuite, ${i[1].fr.toLowerCase()}.`,
          questions: [
            q('小组合作的第一步是：', i[0].zh, alt[0].zh, alt[1].zh, [i[0].kw]),
            q('接下来的任务是：', i[1].zh, alt[0].zh, alt[1].zh, [i[1].kw]),
          ],
        }
      },
      { capacity: 12, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Supermarket self-checkout instructions
    Object.assign(
      (rand) => {
        const steps = [
          { fr: 'Balayez le code-barres de votre premier article', zh: '扫描首件商品的条形码', kw: 'balayez' },
          { fr: 'Déposez l’article sur le plateau de pesée', zh: '将商品放在称重台上', kw: 'déposez' },
          { fr: 'Sélectionnez votre mode de paiement', zh: '选择您的结算付款途径', kw: 'paiement' },
          { fr: 'Prenez votre coupon et votre reçu', zh: '拿走购物发票与优惠券', kw: 'reçu' },
        ]
        const s = sample(steps, 2, rand)
        const alt = steps.filter((x) => !s.includes(x))
        return {
          text: `Caisse libre-service : 1. ${s[0].fr}. 2. ${s[1].fr}. Merci de votre visite !`,
          questions: [
            q('自助结账屏幕提示的第一步是：', s[0].zh, alt[0].zh, alt[1].zh, [s[0].kw]),
            q('第二步应当：', s[1].zh, alt[0].zh, alt[1].zh, [s[1].kw]),
          ],
        }
      },
      { capacity: 12, situation: 1 }
    ),
    // Scenario 5 (Ex 1): Parking meter pay station screen
    Object.assign(
      (rand) => {
        const steps = [
          { fr: 'Entrez le numéro de votre place de stationnement', zh: '输入车位地面的停车编号', kw: 'stationnement' },
          { fr: 'Sélectionnez la durée de stationnement désirée', zh: '选择计划停泊的时长', kw: 'durée' },
          { fr: 'Insérez votre carte de crédit', zh: '插入信用卡完成结算', kw: 'crédit' },
          { fr: 'Conservez votre reçu horodaté', zh: '妥善保管打印的时间凭据', kw: 'reçu' },
        ]
        const s = sample(steps, 2, rand)
        const alt = steps.filter((x) => !s.includes(x))
        return {
          text: `Borne de stationnement de la Ville : Étape 1 : ${s[0].fr}. Étape 2 : ${s[1].fr}. Stationnement tarifé.`,
          questions: [
            q('停车咪表屏幕的第一步指令是：', s[0].zh, alt[0].zh, alt[1].zh, [s[0].kw]),
            q('随后的操作步骤是：', s[1].zh, alt[0].zh, alt[1].zh, [s[1].kw]),
          ],
        }
      },
      { capacity: 12, situation: 1 }
    ),
  ],

  // n2-reading-5
  // Ex 1: Comprendre un message de remerciement pour un service rendu.
  // Ex 2: Comprendre les messages courants formulés sur des cartes de souhaits.
  // Strict gender agreement!
  'n2-reading-5': [
    // Scenario 1 (Ex 1): Thank-you message for a rendered service (gender agreement)
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const services = [
          { fr: 'la préparation de la salle de réunion', zh: '布置准备会议室', kw: 'réunion' },
          { fr: 'la correction minutieuse de mon rapport', zh: '仔细修改核对报告', kw: 'rapport' },
          { fr: 'le transport des cartons de documents', zh: '协助搬运资料箱', kw: 'cartons' },
          { fr: 'le dépannage rapide de mon ordinateur', zh: '及时排查检修电脑', kw: 'ordinateur' },
          { fr: 'l’accueil des nouveaux étudiants', zh: '接待新入学学员', kw: 'étudiants' },
        ]
        const serv = pick(services, rand)
        const otherServs = sample(services.filter((s) => s.zh !== serv.zh), 2, rand)
        const cherFr = g(persona, 'Cher', 'Chère')
        const toucheFr = g(persona, 'touché', 'touchée')
        return {
          text: `Message ${de(persona.name)} : « ${cherFr} collègue, un grand merci pour ${serv.fr}. Ta disponibilité m’a beaucoup ${toucheFr}. Amitiés, ${persona.name}. »`,
          questions: [
            q(`${persona.name} 表达感谢是因为同事帮忙做了什么？`, serv.zh, otherServs[0].zh, otherServs[1].zh, [serv.kw]),
            q('该信函的主要情感基调是：', '真诚致谢', '热情的邀请', '郑重的道歉', ['merci']),
          ],
        }
      },
      { capacity: PERSONAS.length * 5, situation: 0 }
    ),
    // Scenario 2 (Ex 2): Greeting card wishes
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const wishes = [
          { fr: 'Joyeux anniversaire', zh: '生日快乐', kw: 'anniversaire' },
          { fr: 'Bonne et heureuse année', zh: '新年快乐', kw: 'année' },
          { fr: 'Félicitations pour votre nouvelle maison', zh: '乔迁新居祝贺', kw: 'maison' },
          { fr: 'Meilleurs vœux de prompt rétablissement', zh: '早日康复的美好祝愿', kw: 'rétablissement' },
          { fr: 'Bonne retraite et bon repos', zh: '荣休之喜与安享生活', kw: 'retraite' },
        ]
        const wish = pick(wishes, rand)
        const otherWishes = sample(wishes.filter((w) => w.zh !== wish.zh), 2, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Carte de souhaits de la part ${de(persona.name)} : « ${wish.fr} ! Que cette occasion vous apporte joie et santé. Bien cordialement, ${persona.name}. »`,
          questions: [
            q('这张贺卡表达的核心祝愿是：', wish.zh, otherWishes[0].zh, otherWishes[1].zh, [wish.kw]),
            q('寄送这张贺卡的人是：', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 5, situation: 1 }
    ),
    // Scenario 3 (Ex 0): Vacation housecare neighborly thank-you note
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const favors = [
          { fr: 'avoir arrosé mes fleurs pendant mes vacances', zh: '休假期间帮忙浇花', kw: 'fleurs' },
          { fr: 'avoir pris soin de mon chat la semaine dernière', zh: '上周帮忙喂养照看猫咪', kw: 'chat' },
          { fr: 'avoir récupéré mon courrier dans mon casier postal', zh: '帮忙收取信箱邮件', kw: 'courrier' },
          { fr: 'avoir surveillé mon appartement pendant mon absence', zh: '外出期间照料公寓', kw: 'appartement' },
        ]
        const fav = pick(favors, rand)
        const otherFavs = sample(favors.filter((f) => f.zh !== fav.zh), 2, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Mot laissé par ${persona.name} : « Merci infiniment ${merciDe(fav.fr)}. Tout était parfait à mon retour ! Amitiés, ${persona.name}. »`,
          questions: [
            q('留言便条感谢邻居的是：', fav.zh, otherFavs[0].zh, otherFavs[1].zh, [fav.kw]),
            q('便条的留信人是：', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length * 4, situation: 0 }
    ),
    // Scenario 4 (Ex 1): Farewell / new job well-wishes card
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Carte de départ pour ${persona.name} : « Félicitations pour ton nouveau poste ! Nous te souhaitons beaucoup de succès dans tes nouveaux défis professionnels. »`,
          questions: [
            q('这张卡片祝贺的喜事是：', '就任新岗位 / 职业新挑战', '结婚成家 / 幸福新生活', '购买新车 / 驾照考试通过', ['poste']),
            q('卡片赠送的对象是谁？', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length, situation: 1 }
    ),
    // Scenario 5 (Ex 1): Holiday season family greeting card
    Object.assign(
      (rand) => {
        const persona = pick(PERSONAS, rand)
        const otherPersonas = sample(PERSONAS.filter((p) => p.name !== persona.name), 2, rand)
        return {
          text: `Carte des Fêtes : « Joyeuses Fêtes et heureuse nouvelle année de la part ${de(persona.name)} et de toute sa famille ! Paix, amour et santé chez vous. »`,
          questions: [
            q('贺卡送出的节日祝愿是：', '节日快乐与新年祝愿', '生日快乐与长寿祝愿', '早日康复与身体健康', ['fêtes', 'année']),
            q('这份祝愿来自谁和家人？', persona.name, otherPersonas[0].name, otherPersonas[1].name, [persona.name.toLowerCase()]),
          ],
        }
      },
      { capacity: PERSONAS.length, situation: 1 }
    ),
  ],
}
