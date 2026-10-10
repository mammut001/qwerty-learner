import type { TenseLesson } from '../types'

// 6. Indicatif vs Subjonctif (les déclencheurs)
export const indicatifVsSubjonctifLesson: TenseLesson = {
  id: 'indicatif-vs-subjonctif',
  titleFr: 'Indicatif vs Subjonctif',
  titleZh: '直陈式还是虚拟式：决断机制与触发开关',
  category: 'cross-cutting',
  cefrLevel: 'B2-C1',
  echelleNiveau: 10,
  echelleSources: [
    'n10-gr-indicatif-subjonctif: 直陈式还是虚拟式',
    'n4-gr-subjonctif-present: 虚拟式现在时',
  ],
  summaryZh: '法语语式决断核心：直陈式表达“客观事实、肯定判断与确凿现实”；虚拟式表达“主观情感、意愿、义务、怀疑与心理投射”。掌握核心动词与连词的开关转换。',
  timelinePosition: 'overview',
  formationSteps: [
    '客观 vs 主观哲学：直陈式（Indicatif）是“照相机”，如实记录客观现实与规律（Je sais qu’il vient）；虚拟式（Subjonctif）是“滤镜”，投射说话人的主观情绪、祈望或疑惑（Je veux qu’il vienne）。',
    '动词开关变换：penser / croire / être certain 在肯定句中表达确信，接直陈式（Je pense qu’il est là）；在否定句或倒装疑问句中表达怀疑，转接虚拟式（Je ne pense pas qu’il soit là / Penses-tu qu’il soit là ?）。',
    '四大例外禁区：espérer que（希望）表达对未来的自信期待，坚决接直陈式（J’espère qu’il viendra）；après que（在……之后）表示事实已发生，规范语法接直陈式（Après qu’il est parti），而 avant que 接虚拟式。',
    '固定从属连词：pour que, bien que, avant que, sans que, à condition que 强制接虚拟式；pendant que, dès que, parce que, alors que 坚决接直陈式。',
  ],
  usages: [
    {
      id: 'opinion-affirmative-vs-negative',
      titleZh: '观点动词的开关效应：肯定句（直陈式） vs 否定句/疑问句（虚拟式）',
      descriptionZh: 'penser, croire, trouver, sembler 在肯定句与否定句中的语式两极反转。',
      examples: [
        {
          fr: 'Je pense que le candidat réussira son test de français sans problème (肯定确信 → indicatif).',
          zh: '我认为这位候选人能顺利通过法语测试。',
          highlight: 'réussira',
        },
        {
          fr: 'Je ne pense pas que le candidat puisse réussir sans une préparation rigoureuse (否定怀疑 → subjonctif).',
          zh: '我不认为候选人在没有严格准备的情况下能够通过。',
          highlight: 'puisse',
        },
        {
          fr: 'Nous croyons que cette mesure économique est efficace pour contrer l’inflation.',
          zh: '我们相信这项经济措施在抑制通胀方面是行之有效的。',
          highlight: 'est',
        },
        {
          fr: 'Croyez-vous vraiment que cette mesure soit suffisante pour stabiliser les prix ?',
          zh: '您真觉得这项措施就足以稳定物价了吗？',
          highlight: 'soit',
        },
      ],
    },
    {
      id: 'esperer-vs-vouloir',
      titleZh: '经典对决：espérer que（直陈式） vs vouloir que（虚拟式）',
      descriptionZh: 'espérer 表达具有实现的客观期待；vouloir/souhaiter 表达主观意志强加。',
      examples: [
        {
          fr: 'J’espère que tu seras admis à l’Université de Montréal à la session d’automne.',
          zh: '我希望你秋季学期能被蒙特利尔大学录取（espérer + indicatif 将来时）。',
          highlight: 'seras',
        },
        {
          fr: 'Je veux que tu sois admis à l’Université de Montréal pour poursuivre tes études.',
          zh: '我要求/希望你被蒙特利尔大学录取（vouloir + subjonctif）。',
          highlight: 'sois',
        },
        {
          fr: 'Nous espérons que le chasse-neige passera avant notre départ pour le travail.',
          zh: '我们希望扫雪车在我们出门上班前会开过来。',
          highlight: 'passera',
        },
        {
          fr: 'Nous exigeons que la Ville déneige le trottoir sans plus tarder.',
          zh: '我们要求市政府不要再拖延，立刻清理人行道积雪。',
          highlight: 'déneige',
        },
      ],
    },
    {
      id: 'certitude-vs-doute',
      titleZh: '确凿肯定（直陈式） vs 存疑不决（虚拟式）',
      descriptionZh: 'il est certain que, il est vrai que vs il est douteux que, il se peut que...',
      examples: [
        {
          fr: 'Il est certain que les hivers québécois exigent des vêtements très chauds (客观确凿).',
          zh: '魁北克的严冬无疑需要非常保暖的衣物。',
          highlight: 'exigent',
        },
        {
          fr: 'Il est peu probable que la température monte au-dessus de zéro cette semaine (极其存疑).',
          zh: '本周气温升到零度以上的可能性微乎其微。',
          highlight: 'monte',
        },
        {
          fr: 'Il est clair que vous avez fait de grands progrès en français oral.',
          zh: '显而易见，您在法语口语方面取得了巨大的进步。',
          highlight: 'avez fait',
        },
        {
          fr: 'Il est douteux que l’inspecteur accepte ce document sans la signature originale.',
          zh: '很难说监察员在没有原始签名的情况下是否会认可这份文件。',
          highlight: 'accepte',
        },
      ],
    },
    {
      id: 'conjonctions-duo',
      titleZh: '成对连词对照：parce que / dès que（直陈式） vs pour que / avant que（虚拟式）',
      descriptionZh: '因果与时间连词根据客观性还是目的性决定语式。',
      examples: [
        {
          fr: 'Nous partons parce que la tempête de neige commence (客观原因 → indicatif).',
          zh: '我们离开了，因为暴风雪正在开始。',
          highlight: 'commence',
        },
        {
          fr: 'Nous partons pour que nous arrivions à la maison avant la tempête (主观目的 → subjonctif).',
          zh: '我们离开，是为了在暴风雪前赶到家里。',
          highlight: 'arrivions',
        },
        {
          fr: 'Dès que le soleil se lèvera, nous irons marcher sur le mont Royal (时间确定将来).',
          zh: '太阳一旦升起，我们就去皇家山上漫步。',
          highlight: 'se lèvera',
        },
        {
          fr: 'Partons avant que la pluie ne commence à tomber sur la ville (尚未发生的时间终点).',
          zh: '在大雨开始倾泻在城市上空之前，咱们出发吧。',
          highlight: 'commence',
        },
      ],
    },
    {
      id: 'subordonnee-relative-nuance',
      titleZh: '关系从句中的微妙温差：已存在确指（直陈式） vs 寻觅待定（虚拟式）',
      descriptionZh: '寻找一个确实存在的公寓 vs 寻找任何符合条件的理想公寓。',
      examples: [
        {
          fr: 'Je cherche un appartement qui a trois chambres et qui donne sur le parc (我已知这套房存在).',
          zh: '我正在寻找那套有三间卧室且朝向公园的公寓。',
          highlight: 'a',
        },
        {
          fr: 'Je cherche un appartement qui ait trois chambres et qui soit abordable (无论哪套，只要符合条件，属于寻觅设想).',
          zh: '我正在物色一套能有三居室且价格实惠的房子（虚拟愿景）。',
          highlight: 'ait',
        },
        {
          fr: 'Connaissez-vous quelqu’un qui parle couramment le cri ou l’inuktitut ? (询问是否存在).',
          zh: '您认识能够流利说克里语或因纽特语的人吗？',
          highlight: 'parle',
        },
        {
          fr: 'C’est le seul restaurant qui serve une authentique poutine traditionnelle dans ce secteur.',
          zh: '这是该片区唯一一家供应正宗传统普丁的餐馆（le seul que 倾向接虚拟式）。',
          highlight: 'serve',
        },
      ],
    },
  ],
  signalWords: [
    {
      word: 'espérer que (indicatif)',
      meaningZh: '希望（强制接直陈式！）',
      example: {
        fr: 'J’espère qu’il fera beau pour notre mariage à Québec.',
        zh: '我希望我们魁北克城的婚礼那天天气晴朗。',
        highlight: 'fera',
      },
    },
    {
      word: 'il faut que (subjonctif)',
      meaningZh: '必须（强制接虚拟式！）',
      example: {
        fr: 'Il faut que nous prenions notre décision avant la fin du bail.',
        zh: '在租约到期之前，我们必须作出决定。',
        highlight: 'prenions',
      },
    },
    {
      word: 'je ne pense pas que (subjonctif)',
      meaningZh: '我不认为（否定观点接虚拟式）',
      example: {
        fr: 'Je ne pense pas qu’il ait tort dans cette affaire.',
        zh: '我不认为他在这件事上做错了。',
        highlight: 'ait',
      },
    },
    {
      word: 'bien que (subjonctif)',
      meaningZh: '尽管（让步强制接虚拟式）',
      example: {
        fr: 'Bien qu’il soit encore jeune, il dirige une clinique vétérinaire réputée.',
        zh: '尽管他还年轻，却管理着一家颇具声望的兽医诊所。',
        highlight: 'soit',
      },
    },
  ],
  commonMistakes: [
    {
      wrong: 'J’espère que tu viennes demain.',
      right: 'J’espère que tu viendras demain.',
      explanationZh: '动词 espérer 绝不能接虚拟式！从句必须用直陈式（将来时 viendras 或现在时 viens）。',
    },
    {
      wrong: 'Je pense qu’il soit gentil. (肯定句中误用虚拟式)',
      right: 'Je pense qu’il est très gentil.',
      explanationZh: 'penser que 肯定句表示自己持有的客观见解，用直陈式 est；只有在否定或倒装疑问句中才用虚拟式。',
    },
    {
      wrong: 'Après qu’il soit parti, nous avons fermé la porte. (口语常见但规范语法严禁)',
      right: 'Après qu’il est parti, nous avons fermé la porte.',
      explanationZh: '规范法语中：après que 后面事件已成事实，必须接直陈式（après qu’il est parti），而 avant que 后面事件尚未发生接虚拟式。',
    },
    {
      wrong: 'Il est sûr que nous ayons du temps.',
      right: 'Il est sûr que nous avons du temps.',
      explanationZh: 'il est sûr que 表示绝对确信无疑，属于客观事实范畴，必须接直陈式 avons。',
    },
  ],
  questions: [
    {
      id: 'ind-subj-q1',
      type: 'choice',
      prompt: 'J’espère de tout cœur que tu (obtenir) ___ ton permis de conduire du premier coup.',
      options: ['obtiendras', 'obtiennes', 'obtienne', 'aies obtenu'],
      correctAnswer: 'obtiendras',
      explanationZh: 'espérer que 坚决接直陈式（简单将来时）：obtiendras。',
    },
    {
      id: 'ind-subj-q2',
      type: 'choice',
      prompt: 'Il est nécessaire que vous (renouveler) ___ votre carte d’assurance maladie avant son expiration.',
      options: ['renouveliez', 'renouvelez', 'renouvellerez', 'avez renouvelé'],
      correctAnswer: 'renouveliez',
      explanationZh: 'il est nécessaire que 表达必要性，从句接虚拟式，vous 人称为 renouveliez。',
    },
    {
      id: 'ind-subj-q3',
      type: 'choice',
      prompt: 'Je suis certain qu’elle (réussir) ___ brillamment son examen médical.',
      options: ['réussira', 'réussisse', 'réussisses', 'ait réussi'],
      correctAnswer: 'réussira',
      explanationZh: 'être certain que 表达确信，接直陈式（将来时 réussira）。',
    },
    {
      id: 'ind-subj-q4',
      type: 'choice',
      prompt: 'Je ne suis pas certain qu’elle (pouvoir) ___ venir à la fête ce soir.',
      options: ['puisse', 'peut', 'pourra', 'pouvait'],
      correctAnswer: 'puisse',
      explanationZh: 'ne pas être certain que 表达不确定与存疑，必须接虚拟式：puisse。',
    },
    {
      id: 'ind-subj-q5',
      type: 'fill',
      prompt: 'Je pense qu’il (faire) ___ trop froid pour aller patiner dehors aujourd’hui.（肯定观点，填入直陈式现在时）',
      correctAnswer: 'fait',
      acceptedAnswers: ['fait'],
      explanationZh: '肯定句 je pense que 接直陈式现在时：il fait。',
    },
    {
      id: 'ind-subj-q6',
      type: 'fill',
      prompt: 'Je ne pense pas qu’il (faire) ___ assez beau pour faire un pique-nique.（否定怀疑，填入虚拟式）',
      correctAnswer: 'fasse',
      acceptedAnswers: ['fasse'],
      explanationZh: '否定句 je ne pense pas que 接虚拟式：qu’il fasse。',
    },
    {
      id: 'ind-subj-q7',
      type: 'choice',
      prompt: 'Bien qu’il (être) ___ très tôt, les rues de Montréal sont déjà animées.',
      options: ['soit', 'est', 'sera', 'était'],
      correctAnswer: 'soit',
      explanationZh: 'bien que 是强制虚拟式的让步连词，être 变位为 soit。',
    },
    {
      id: 'ind-subj-q8',
      type: 'choice',
      prompt: 'Dès que la tempête (cesser) ___, nous sortirons pelleter l’allée de garage.',
      options: ['cessera', 'cesse', 'cesserait', 'ait cessé'],
      correctAnswer: 'cessera',
      explanationZh: 'dès que 属于时间连词，表达客观将来，接直陈式简单将来时：cessera。',
    },
    {
      id: 'ind-subj-q9',
      type: 'fill',
      prompt: 'Il faut absolument que nous (prendre) ___ le train de huit heures.（填入虚拟式）',
      correctAnswer: 'prenions',
      acceptedAnswers: ['prenions'],
      explanationZh: 'il faut que 接虚拟式，nous 对应的形式为 prenions（含有 i）。',
    },
    {
      id: 'ind-subj-q10',
      type: 'choice',
      prompt: 'Le propriétaire exige que tous les locataires (respecter) ___ la tranquillité des lieux.',
      options: ['respectent', 'respecteront', 'respectaient', 'aient respecté'],
      correctAnswer: 'respectent',
      explanationZh: 'exiger que 表达要求指令，接虚拟式：respectent。',
    },
    {
      id: 'ind-subj-q11',
      type: 'choice',
      prompt: 'Je sais pertinemment que cette démarche (prendre) ___ du temps auprès du ministère.',
      options: ['prend', 'prenne', 'prennes', 'ait pris'],
      correctAnswer: 'prend',
      explanationZh: 'savoir que 表达确凿的认知事实，接直陈式：prend。',
    },
    {
      id: 'ind-subj-q12',
      type: 'fill',
      prompt: 'Nous restons à la maison pour que les enfants (pouvoir) ___ se reposer.（填入虚拟式）',
      correctAnswer: 'puissent',
      acceptedAnswers: ['puissent'],
      explanationZh: 'pour que 目的连词接虚拟式，复数形式为 puissent。',
    },
  ],
}

// 7. Choix de l’auxiliaire et accord du participe passé
export const auxiliaireEtAccordLesson: TenseLesson = {
  id: 'choix-auxiliaire-accord-pp',
  titleFr: 'Choix de l’auxiliaire et accord du participe passé',
  titleZh: '助动词抉择与过去分词性数配合全规则',
  category: 'cross-cutting',
  cefrLevel: 'B2',
  echelleNiveau: 10,
  echelleSources: [
    'n10-gr-accord-pp: 过去分词的配合',
    'n4-gr-passe-compose: 复合过去时',
  ],
  summaryZh: '所有复合时态的基石：avoir 还是 être？及物 vs 不及物动词（双重助动词）；与主语配合还是与前置直接宾语（COD）配合？代词动词的自反配合规律。',
  timelinePosition: 'past',
  formationSteps: [
    '助动词两大阵营：绝大多数动词（及所有及物动词）用 avoir；17个位移或状态变化动词（DR MRS VANDERTRAMP）以及所有代词动词（verbes pronominaux）一律用 être。',
    '六大双重助动词（monter, descendre, sortir, rentrer, retourner, passer）：不及物位移用 être（Je suis sorti）；后面带直接宾语 COD 用 avoir（J’ai sorti les poubelles）！',
    'être 的配合法则：使用 être 作助动词时，过去分词严格与句子的“主语”进行性数配合（阴性加 -e，复数加 -s）。',
    'avoir 的配合法则：默认不配合！只有当“直接宾语（COD）置于动词之前”时（代词 que, le/la/les, quel...），过去分词才与该 COD 的性数配合！',
    '代词动词分词配合：看自反代词是 COD 还是 COI！如果是 COD（Elle s’est lavée），配合；如果是 COI（Elle s’est lavé les mains - 手是 COD 在后），不配合！',
  ],
  usages: [
    {
      id: 'double-auxiliaire-sens',
      titleZh: '六大双重助动词（Transitif vs Intransitif）的生死抉择',
      descriptionZh: 'monter, descendre, sortir, passer, rentrer, retourner 在及物与不及物下的助动词切换。',
      examples: [
        {
          fr: 'Elle est sortie sur le balcon pour respirer l’air frais (不及物位移 → être).',
          zh: '她走到阳台上呼吸新鲜空气。',
          highlight: 'est sortie',
        },
        {
          fr: 'Elle a sorti les bacs de recyclage sur le trottoir (及物直接宾语 les bacs → avoir).',
          zh: '她把可回收垃圾桶推放到了人行道上。',
          highlight: 'a sorti',
        },
        {
          fr: 'Nous sommes montés au sommet du mont Royal pour voir le coucher du soleil.',
          zh: '我们登上了皇家山顶看日落。',
          highlight: 'sommes montés',
        },
        {
          fr: 'Nous avons monté nos valises lourdes au troisième étage sans ascenseur.',
          zh: '我们在没有电梯的情况下，把沉重的箱子抬上了三楼。',
          highlight: 'avons monté',
        },
      ],
    },
    {
      id: 'accord-avoir-cod-precedent',
      titleZh: '助动词 avoir 的前置直接宾语（COD）配合规则',
      descriptionZh: '由 que 代表先行词，或宾语代词 le/la/les 置于助动词前时的配合。',
      examples: [
        {
          fr: 'Les lettres officielles que j’ai reçues étaient très encourageantes (COD que = les lettres [阴复] → reçues).',
          zh: '我收到的那些官方信件非常鼓舞人心。',
          highlight: 'ai reçues',
        },
        {
          fr: 'Cette magnifique maison centenaire ? Nous l’avons achetée en 2021 (COD l’ = cette maison [阴单] → achetée).',
          zh: '那栋漂亮的百年老宅？我们是在2021年买下它的。',
          highlight: 'avons achetée',
        },
        {
          fr: 'Combien de bouteilles de sirop d’érable as-tu achetées à la cabane ?',
          zh: '你在枫糖屋买了多少瓶枫糖浆？',
          highlight: 'as-tu achetées',
        },
        {
          fr: 'J’ai acheté trois bouteilles de sirop d’érable (COD 在动词后 → acheté 不配合).',
          zh: '我买了三瓶枫糖浆。',
          highlight: 'ai acheté',
        },
      ],
    },
    {
      id: 'pronominaux-cod-vs-coi',
      titleZh: '代词动词分词配合的深层机制（自反代词是 COD 还是 COI）',
      descriptionZh: '分析主语对自己发出动作时，动作直接承受者到底是谁。',
      examples: [
        {
          fr: 'Marie s’est lavée soigneusement avant de s’habiller (se 是直接宾语 COD → 配合 levée).',
          zh: '玛丽在穿衣服前把自己洗得干干净净。',
          highlight: 's’est lavée',
        },
        {
          fr: 'Marie s’est lavé les mains avec de l’eau chaude et du savon (les mains 是 COD 在后，se 是间接宾语 COI → lavé 不配合！).',
          zh: '玛丽用温水和肥皂洗了手。',
          highlight: 's’est lavé',
        },
        {
          fr: 'Elles se sont parlé longuement au téléphone hier soir (parler à qqn → se 是 COI，parlé 永不配合！).',
          zh: '昨晚她们在电话里聊了很久。',
          highlight: 'se sont parlé',
        },
        {
          fr: 'Elles se sont rencontrées lors de la séance d’accueil des nouveaux arrivants (rencontrer qqn → se 是 COD，配合 rencontrées).',
          zh: '她们是在新移民迎新会上相识的。',
          highlight: 'se sont rencontrées',
        },
      ],
    },
    {
      id: 'piege-en-invariable',
      titleZh: '副代词 en 与无人称动词的不配合铁律',
      descriptionZh: '当先行代词是 en 时，分词永远不配合；无人称动词（il a fallu, il a fait chaud）永远不配合。',
      examples: [
        {
          fr: 'Des pommes fraîches du verger ? J’en ai mangé trois (代词 en 永远不引发分词配合 → mangé).',
          zh: '果园的新鲜苹果？我吃了三个。',
          highlight: 'ai mangé',
        },
        {
          fr: 'Les chaleurs accablantes qu’il a fait cet été ont battu tous les records (无人称动词 il a fait 绝不配合).',
          zh: '今年夏天经历的酷暑天气打破了所有纪录。',
          highlight: 'a fait',
        },
        {
          fr: 'Les démarches administratives qu’il a fallu accomplir étaient complexes (无人称 il a fallu 永不配合).',
          zh: '必须完成的行政手续十分繁杂。',
          highlight: 'a fallu',
        },
        {
          fr: 'Des bagels chauds de la rue Saint-Viateur ? Nous en avons acheté une douzaine.',
          zh: '圣维亚特街刚出炉的热贝果？我们买了一打。',
          highlight: 'avons acheté',
        },
      ],
    },
    {
      id: 'synthese-accord-etre',
      titleZh: '使用 être 的主语全量配合综合观照',
      descriptionZh: '17个动词在复合时态中坚定与主语一致。',
      examples: [
        {
          fr: 'Mes deux sœurs sont nées à Montréal et y ont grandi heureuses.',
          zh: '我的两个姐姐出生在蒙特利尔，并在那里幸福成长。',
          highlight: 'sont nées',
        },
        {
          fr: 'Toutes les feuilles des érables sont tombées sous l’effet du premier gel.',
          zh: '在初霜的侵袭下，枫树的所有叶子都已飘落。',
          highlight: 'sont tombées',
        },
        {
          fr: 'Les enfants sont allés skier avec leur école primaire.',
          zh: '孩子们随小学一起去滑了雪。',
          highlight: 'sont allés',
        },
        {
          fr: 'La délégation québécoise est revenue hier de sa mission économique en Europe.',
          zh: '魁北克代表团昨天结束在欧洲的经贸考察返回。',
          highlight: 'est revenue',
        },
      ],
    },
  ],
  signalWords: [
    {
      word: 'que (pronom relatif)',
      meaningZh: '代表先行词（引发 avoir 过去分词配合）',
      example: {
        fr: 'La voiture que nous avons louée fonctionnait à merveille sur la neige.',
        zh: '我们租的那辆车在雪地上性能极佳。',
        highlight: 'avons louée',
      },
    },
    {
      word: 'les... que',
      meaningZh: '复数直接宾语前置',
      example: {
        fr: 'Les clés qu’il a trouvées sur le trottoir appartiennent à la concierge.',
        zh: '他在人行道上捡到的那串钥匙属于门房大妈。',
        highlight: 'a trouvées',
      },
    },
    {
      word: 'en (pronom neutre)',
      meaningZh: '代词 en（分词永不配合！）',
      example: {
        fr: 'Des fraises de l’île d’Orléans ? Nous en avons cueilli beaucoup.',
        zh: '奥尔良岛的草莓？我们采摘了好多。',
        highlight: 'avons cueilli',
      },
    },
    {
      word: 'se téléphoner / se parler',
      meaningZh: '相互代词动词间接宾语（永不配合！）',
      example: {
        fr: 'Elles se sont téléphoné pour se donner rendez-vous au métro.',
        zh: '她们通了电话，约好在地铁站碰头。',
        highlight: 'sont téléphoné',
      },
    },
  ],
  commonMistakes: [
    {
      wrong: 'J’ai monté au sommet du mont Royal.',
      right: 'Je suis monté au sommet du mont Royal.',
      explanationZh: 'monter 作不及物动词表人登上山顶，助动词必须是 être：je suis monté。',
    },
    {
      wrong: 'Les lettres que j’ai écrit.',
      right: 'Les lettres que j’ai écrites.',
      explanationZh: '关系代词 que 指代先行词 les lettres（阴性复数），置于动词 j’ai écrit 之前，分词必须配合加 -es：écrites。',
    },
    {
      wrong: 'Elle s’est lavée les mains.',
      right: 'Elle s’est lavé les mains.',
      explanationZh: '手（les mains）是直接宾语 COD 且在动词后，自反代词 s’ 充当间接宾语 COI，因此分词 lavé 绝不能配合！',
    },
    {
      wrong: 'Des pommes, j’en ai mangées trois.',
      right: 'Des pommes, j’en ai mangé trois.',
      explanationZh: '法语语法绝对铁律：前置代词 en 永远不能引发过去分词配合，必须用 mangé！',
    },
  ],
  questions: [
    {
      id: 'acc-q1',
      type: 'choice',
      prompt: 'Elle est sortie sur le balcon, mais elle ___ les valises dans la voiture.',
      options: ['a sorti', 'est sortie', 'a sortie', 'est sorti'],
      correctAnswer: 'a sorti',
      explanationZh: '把箱子搬出去，带直接宾语 les valises，及物用法助动词必须使用 avoir：a sorti。',
    },
    {
      id: 'acc-q2',
      type: 'choice',
      prompt: 'Voici les photos que nous avons (prendre) ___ lors de notre séjour au Saguenay.',
      options: ['prises', 'pris', 'prise', 'prenées'],
      correctAnswer: 'prises',
      explanationZh: 'que 代表先行词 les photos（阴性复数）在前，分词配合加 -es：prises。',
    },
    {
      id: 'acc-q3',
      type: 'choice',
      prompt: 'Marie et Sophie se sont (téléphoner) ___ pendant deux heures hier soir.',
      options: ['téléphoné', 'téléphonées', 'téléphonés', 'téléphoner'],
      correctAnswer: 'téléphoné',
      explanationZh: 'téléphoner à qqn 为间接及物，自反代词 se 是间接宾语（COI），过去分词永远不配合：téléphoné。',
    },
    {
      id: 'acc-q4',
      type: 'choice',
      prompt: 'Des framboises du Québec ? Les enfants en ont (manger) ___ un panier entier.',
      options: ['mangé', 'mangées', 'mangés', 'mangeait'],
      correctAnswer: 'mangé',
      explanationZh: '前置代词 en 永远不引发过去分词配合：mangé。',
    },
    {
      id: 'acc-q5',
      type: 'fill',
      prompt: 'La lettre que le ministère m’a (envoyer) ___ contenait une bonne nouvelle.（填入过去分词）',
      correctAnswer: 'envoyée',
      acceptedAnswers: ['envoyée', 'envoyee'],
      explanationZh: 'que 代表 la lettre（阴性单数）前置，分词配合加 -e：envoyée。',
    },
    {
      id: 'acc-q6',
      type: 'fill',
      prompt: 'Elles sont (arriver) ___ par le premier train du matin.（填入过去分词）',
      correctAnswer: 'arrivées',
      acceptedAnswers: ['arrivées', 'arrivees'],
      explanationZh: 'arriver 用 être 作助动词，主语 elles 阴性复数配合加 -es：arrivées。',
    },
    {
      id: 'acc-q7',
      type: 'choice',
      prompt: 'Quelle chaleur accablante il a (faire) ___ cet été à Montréal !',
      options: ['fait', 'faite', 'faits', 'faites'],
      correctAnswer: 'fait',
      explanationZh: '无人称动词 il a fait 的过去分词永远不配合：fait。',
    },
    {
      id: 'acc-q8',
      type: 'choice',
      prompt: 'Julie s’est (brosser) ___ les dents avant d’aller au lit.',
      options: ['brossé', 'brossée', 'brossés', 'brosser'],
      correctAnswer: 'brossé',
      explanationZh: '直接宾语 les dents 位于动词后，自反代词 s’ 是间接宾语，分词不配合：brossé。',
    },
    {
      id: 'acc-q9',
      type: 'fill',
      prompt: 'Ces maisons anciennes ? Les constructeurs les ont (démolir) ___ le mois dernier.（填入过去分词）',
      correctAnswer: 'démolies',
      acceptedAnswers: ['démolies', 'demolies'],
      explanationZh: '直接宾语代词 les 代表 ces maisons anciennes（阴性复数）前置，分词配合加 -es：démolies。',
    },
    {
      id: 'acc-q10',
      type: 'choice',
      prompt: 'Les deux diplomates se sont (serrer) ___ la main à la signature de l’accord.',
      options: ['serré', 'serrée', 'serrés', 'serrées'],
      correctAnswer: 'serré',
      explanationZh: '直接宾语 la main 位于动词后，自反代词 se 是间接宾语，分词不配合：serré。',
    },
    {
      id: 'acc-q11',
      type: 'choice',
      prompt: 'Nous sommes (monter) ___ tout en haut du phare pour admirer le fleuve.',
      options: ['montés', 'monté', 'montée', 'avons monté'],
      correctAnswer: 'montés',
      explanationZh: '人登上灯塔，不及物位移用 être，主语 nous（阳性复数）配合加 -s：montés。',
    },
    {
      id: 'acc-q12',
      type: 'fill',
      prompt: 'Toutes les fleurs du jardin sont (mourir) ___ lors de la première gelée d’automne.（填入过去分词）',
      correctAnswer: 'mortes',
      acceptedAnswers: ['mortes'],
      explanationZh: 'mourir 使用 être 作助动词，主语 toutes les fleurs（阴性复数）配合为 mortes。',
    },
  ],
}

// 8. Concordance des temps et discours indirect
export const concordanceDiscoursLesson: TenseLesson = {
  id: 'concordance-discours-indirect',
  titleFr: 'Concordance des temps et discours indirect',
  titleZh: '时态配合与间接引语转述全景图',
  category: 'cross-cutting',
  cefrLevel: 'B2-C1',
  echelleNiveau: [9, 10],
  echelleSources: [
    'n9-gr-discours-indirect: 间接引语',
    'n10-gr-concordance: 时态配合',
    'n10-gr-coherence-temporelle: 时态与语式的连贯',
  ],
  summaryZh: '当主句引语动词为过去时（a dit, affirmait, a promis）时，从句时态全部后移一步：现在时 → 未完成过去时；复合过去时 → 愈过去时；简单将来时 → 条件式现在时。',
  timelinePosition: 'overview',
  formationSteps: [
    '主句为现在时或将来时（Il dit que... / Il dira que...）：从句时态完全保持原样不变！',
    '主句为过去时（Il a dit que... / Il disait que...）：触发全套时态后移法则（Recul temporel）：',
    '1. Présent → Imparfait（Il dit : « J’ai froid » → Il a dit qu’il avait froid）',
    '2. Passé composé / Passé simple → Plus-que-parfait（Il dit : « J’ai fini » → Il a dit qu’il avait fini）',
    '3. Futur simple → Conditionnel présent（Il dit : « Je viendrai » → Il a dit qu’il viendrait）',
    '4. Futur antérieur → Conditionnel passé（Il dit : « J’aurai fini » → Il a dit qu’il aurait fini）',
    '时间与空间代副词对应后移：aujourd’hui → ce jour-là；hier → la veille；demain → le lendemain；ici → là。',
  ],
  usages: [
    {
      id: 'discours-direct-vers-indirect-present',
      titleZh: '同时动作转述：直陈式现在时 → 未完成过去时（Imparfait）',
      descriptionZh: '说话时正在进行的事，在事后转述时必须后移为未完成过去时。',
      examples: [
        {
          fr: '« Je cherche un appartement à Montréal » → Elle a dit qu’elle cherchait un appartement à Montréal.',
          zh: '“我正在蒙特利尔找房子” → 她说她当时正在蒙特利尔找房子。',
          highlight: 'cherchait',
        },
        {
          fr: '« Nous sommes très occupés aujourd’hui » → Ils ont expliqué qu’ils étaient très occupés ce jour-là.',
          zh: '“我们今天非常忙碌” → 他们解释说他们那天非常忙碌。',
          highlight: 'étaient',
        },
        {
          fr: '« Mon frère habite à Québec » → Elle m’a confié que son frère habitait à Québec.',
          zh: '“我弟弟住在魁北克市” → 她悄悄告诉我她弟弟当时住在魁北克城。',
          highlight: 'habitait',
        },
        {
          fr: '« Il fait un froid de canard dehors » → Le passant a remarqué qu’il faisait un froid de canard dehors.',
          zh: '“外面冷得刺骨” → 路人当时说外面冷得刺骨。',
          highlight: 'faisait',
        },
      ],
    },
    {
      id: 'discours-direct-vers-indirect-passe',
      titleZh: '先时动作转述：复合过去时 → 愈过去时（Plus-que-parfait）',
      descriptionZh: '原话中已经发生过的事情，转述时必须后移为愈过去时。',
      examples: [
        {
          fr: '« J’ai envoyé ma déclaration d’impôts hier » → Il a affirmé qu’il avait envoyé sa déclaration la veille.',
          zh: '“我昨天寄出了税单” → 他声称他前一天已经寄出了税单。',
          highlight: 'avait envoyé',
        },
        {
          fr: '« Nous sommes arrivés en retard à cause du trafic » → Ils ont justifié qu’ils étaient arrivés en retard.',
          zh: '“我们因为堵车迟到了” → 他们解释说他们此前因为堵车迟到了。',
          highlight: 'étaient arrivés',
        },
        {
          fr: '« Elle a déjà réussi son examen » → Le professeur a confirmé qu’elle avait déjà réussi son examen.',
          zh: '“她已经考过了” → 老师证实她此前就已经考过了。',
          highlight: 'avait déjà réussi',
        },
        {
          fr: '« J’ai perdu ma carte OPUS dans l’autobus » → L’étudiant a déclaré qu’il avait perdu sa carte dans l’autobus.',
          zh: '“我在公交车上弄丢了交通卡” → 学生声明他在公交车上弄丢了卡。',
          highlight: 'avait perdu',
        },
      ],
    },
    {
      id: 'discours-direct-vers-indirect-futur',
      titleZh: '将来动作转述：简单将来时 → 条件式现在时（Conditionnel présent）',
      descriptionZh: '在过去视角中指向未来的动作，后移为条件式现在时（过去视角中的将来）。',
      examples: [
        {
          fr: '« Je déménagerai à Laval le mois prochain » → Elle a annoncé qu’elle déménagerait à Laval le mois suivant.',
          zh: '“我下个月将搬到拉瓦尔” → 她宣布她次月将搬去拉瓦尔。',
          highlight: 'déménagerait',
        },
        {
          fr: '« Le gouvernement publiera les nouveaux règlements demain » → Le porte-parole a assuré qu’il publierait les règlements le lendemain.',
          zh: '“政府明天将公布新规” → 发言人保证次日将公布规定。',
          highlight: 'publierait',
        },
        {
          fr: '« Nous serons toujours là pour vous soutenir » → Mes parents m’ont promis qu’ils seraient toujours là pour me soutenir.',
          zh: '“我们永远都会在这里支持你” → 父母向我承诺他们永远都会支持我。',
          highlight: 'seraient',
        },
        {
          fr: '« Tu obtiendras ton certificat sous peu » → L’agente m’a dit que j’obtiendrais mon certificat sous peu.',
          zh: '“你不久就会拿到证书” → 办事官员告诉我我不久就会拿到证书。',
          highlight: 'obtiendrais',
        },
      ],
    },
    {
      id: 'questions-indirectes',
      titleZh: '间接疑问句中的时态配合与引导词变化',
      descriptionZh: 'est-ce que → si；qu’est-ce que → ce que；qu’est-ce qui → ce qui，同时配合时态后移。',
      examples: [
        {
          fr: '« Est-ce que tu es prêt pour l’examen ? » → Il m’a demandé si j’étais prêt pour l’examen.',
          zh: '“你准备好考试了吗？” → 他问我当时是否准备好了考试。',
          highlight: 'étais',
        },
        {
          fr: '« Qu’est-ce que vous ferez après vos études ? » → Le conseiller a demandé ce que nous ferions après nos études.',
          zh: '“你们毕业后打算做什么？” → 顾问询问我们毕业后打算做什么。',
          highlight: 'ferions',
        },
        {
          fr: '« Quand partirez-vous en vacances ? » → Mes voisins ont voulu savoir quand nous partirions en vacances.',
          zh: '“你们什么时候去度假？” → 邻居们想知道我们什么时候启程去度假。',
          highlight: 'partirions',
        },
        {
          fr: '« Où as-tu acheté ces délicieux bagels ? » → Elle m’a demandé où j’avais acheté ces délicieux bagels.',
          zh: '“你在哪儿买的这些美味贝果？” → 她问我是在哪儿买的那些美味贝果。',
          highlight: 'avais acheté',
        },
      ],
    },
    {
      id: 'marqueurs-spatiotemporels',
      titleZh: '时空参照标记的同步后移（hier → la veille, demain → le lendemain）',
      descriptionZh: '转述过去话语时，时间副词必须以过去那天为参照物。',
      examples: [
        {
          fr: '« Je viendrai demain » → Il a dit qu’il viendrait le lendemain (demain 变为 le lendemain).',
          zh: '“我明天来” → 他说他次日会来。',
          highlight: 'viendrait',
        },
        {
          fr: '« J’ai déposé ma demande hier » → Elle a précisé qu’elle avait déposé sa demande la veille (hier 变为 la veille).',
          zh: '“我昨天提交了申请” → 她说明她前一天已经提交了申请。',
          highlight: 'avait déposé',
        },
        {
          fr: '« Le bureau ferme aujourd’hui » → Le gardien a averti que le bureau fermait ce jour-là (aujourd’hui 变为 ce jour-là).',
          zh: '“办公室今天关门” → 警卫提醒说办公室在那天关门。',
          highlight: 'fermait',
        },
        {
          fr: '« Nous signerons le contrat ici la semaine prochaine » → Ils ont convenu qu’ils signeraient le contrat là la semaine suivante.',
          zh: '“我们下周在这里签合同” → 他们商定次周在那儿签合同。',
          highlight: 'signeraient',
        },
      ],
    },
  ],
  signalWords: [
    {
      word: 'il a dit que... (imparfait)',
      meaningZh: '他说他当时……（原现在时）',
      example: {
        fr: 'Il a dit qu’il voulait apprendre le français québécois.',
        zh: '他说他想学魁北克法语。',
        highlight: 'voulait',
      },
    },
    {
      word: 'elle a promis que... (conditionnel)',
      meaningZh: '她承诺她将会……（原将来时）',
      example: {
        fr: 'Elle a promis qu’elle rappellerait avant dix-sept heures.',
        zh: '她承诺会在下午五点前打回电话。',
        highlight: 'rappellerait',
      },
    },
    {
      word: 'ils ont confirmé que... (PQP)',
      meaningZh: '他们证实此前已经……（原复合过去时）',
      example: {
        fr: 'Ils ont confirmé qu’ils avaient bien reçu les formulaires signés.',
        zh: '他们证实此前确实收到了签名的表格。',
        highlight: 'avaient bien reçu',
      },
    },
    {
      word: 'il m’a demandé si...',
      meaningZh: '他问我是否……（间接疑问句）',
      example: {
        fr: 'Il m’a demandé si j’avais déjà passé l’épreuve orale du TCF.',
        zh: '他问我此前是否已经参加了 TCF 口语考试。',
        highlight: 'avais déjà passé',
      },
    },
  ],
  commonMistakes: [
    {
      wrong: 'Il a dit qu’il viendra demain. (主句为过去时，从句将来时未后移)',
      right: 'Il a dit qu’il viendrait le lendemain.',
      explanationZh: '主句动词为过去时 a dit，从句将来时 viendra 必须后移为条件式现在时 viendrait，demain 后移为 le lendemain。',
    },
    {
      wrong: 'Il m’a demandé est-ce que je viens.',
      right: 'Il m’a demandé si je venais.',
      explanationZh: '间接疑问句中 est-ce que 必须转换为 si，且动词 viens 后移为未完成过去时 venais。',
    },
    {
      wrong: 'Elle a expliqué qu’elle a eu un problème hier.',
      right: 'Elle a expliqué qu’elle avait eu un problème la veille.',
      explanationZh: '主句为过去时 a expliqué，从句复合过去时 a eu 必须后移为愈过去时 avait eu。',
    },
    {
      wrong: 'Il a demandé qu’est-ce que je faisais.',
      right: 'Il a demandé ce que je faisais.',
      explanationZh: '间接引语中 qu’est-ce que 必须转换为 ce que：ce que je faisais。',
    },
  ],
  questions: [
    {
      id: 'conc-q1',
      type: 'choice',
      prompt: 'Paul m’a dit : « Je pars pour Québec demain » → Paul m’a dit qu’il (partir) ___ pour Québec le lendemain.',
      options: ['partirait', 'partira', 'partait', 'est parti'],
      correctAnswer: 'partirait',
      explanationZh: '原将来时/打算 part 转化为过去视角中的将来（条件式现在时）：partirait。',
    },
    {
      id: 'conc-q2',
      type: 'choice',
      prompt: 'Elle a affirmé : « J’ai déjà payé les frais » → Elle a affirmé qu’elle (déjà payer) ___ les frais.',
      options: ['avait déjà payé', 'a déjà payé', 'payait déjà', 'aurait déjà payé'],
      correctAnswer: 'avait déjà payé',
      explanationZh: '原复合过去时后移为愈过去时：avait déjà payé。',
    },
    {
      id: 'conc-q3',
      type: 'choice',
      prompt: 'Le médecin m’a demandé : « Est-ce que vous fumez ? » → Le médecin m’a demandé ___ je fumais.',
      options: ['si', 'est-ce que', 'que', 'ce que'],
      correctAnswer: 'si',
      explanationZh: '间接一般疑问句由 si 引导：demandé si je fumais。',
    },
    {
      id: 'conc-q4',
      type: 'choice',
      prompt: 'Ils ont promis qu’ils (venir) ___ nous rendre visite pendant le temps des Fêtes.',
      options: ['viendraient', 'viendront', 'viennent', 'venaient'],
      correctAnswer: 'viendraient',
      explanationZh: '主句为过去时 ont promis，从句原将来时后移为条件式现在时：viendraient。',
    },
    {
      id: 'conc-q5',
      type: 'fill',
      prompt: 'L’agent a confirmé que le dossier (être) ___ conforme aux exigences.（原为 est conforme，填入后移时态）',
      correctAnswer: 'était',
      acceptedAnswers: ['était', 'etait'],
      explanationZh: '原直陈式现在时 est 后移为未完成过去时：était。',
    },
    {
      id: 'conc-q6',
      type: 'fill',
      prompt: 'Elle m’a expliqué qu’elle (vouloir) ___ s’installer définitivement à Gatineau.（原为 veut，填入后移时态）',
      correctAnswer: 'voulait',
      acceptedAnswers: ['voulait'],
      explanationZh: '原现在时 veut 后移为未完成过去时：voulait。',
    },
    {
      id: 'conc-q7',
      type: 'choice',
      prompt: 'L’inspecteur a demandé au témoin : « Qu’avez-vous vu ? » → L’inspecteur a demandé au témoin ___ il avait vu.',
      options: ['ce qu’', 'qu’', 'si', 'est-ce qu’'],
      correctAnswer: 'ce qu’',
      explanationZh: '疑问词 que/qu’est-ce que 在间接疑问句中转化为 ce que：ce qu’il avait vu。',
    },
    {
      id: 'conc-q8',
      type: 'choice',
      prompt: 'Le météorologue a annoncé qu’une violente tempête de neige (frapper) ___ la métropole.',
      options: ['frapperait', 'frappera', 'frappe', 'frapperait-elle'],
      correctAnswer: 'frapperait',
      explanationZh: '主句动词为 a annoncé，将来预报后移为条件式现在时：frapperait。',
    },
    {
      id: 'conc-q9',
      type: 'fill',
      prompt: 'Il a avoué qu’il n’ (jamais prendre) ___ de cours de français auparavant.（填入愈过去时）',
      correctAnswer: 'avait jamais pris',
      acceptedAnswers: ['avait jamais pris'],
      explanationZh: '过去先时动作后移为愈过去时：n’avait jamais pris。',
    },
    {
      id: 'conc-q10',
      type: 'choice',
      prompt: 'Mon ami m’a dit : « Je ne peux pas t’aider aujourd’hui » → Mon ami m’a dit qu’il ne ___ pas m’aider ___.',
      options: [
        'pouvait / ce jour-là',
        'peut / aujourd’hui',
        'pourrait / demain',
        'pouvait / la veille',
      ],
      correctAnswer: 'pouvait / ce jour-là',
      explanationZh: 'peux 后移为 pouvait；aujourd’hui 后移为 ce jour-là。',
    },
    {
      id: 'conc-q11',
      type: 'choice',
      prompt: 'Elle a déclaré : « Nous aurons fini avant midi » → Elle a déclaré qu’ils (finir) ___ avant midi.',
      options: ['auraient fini', 'auront fini', 'avaient fini', 'auraient finir'],
      correctAnswer: 'auraient fini',
      explanationZh: '原先将来时（auront fini）后移为条件式过去时：auraient fini。',
    },
    {
      id: 'conc-q12',
      type: 'fill',
      prompt: 'Le patron nous a assuré qu’il nous (rappeler) ___ avant la fin de la semaine.（原为 rappellera，填入后移时态）',
      correctAnswer: 'rappellerait',
      acceptedAnswers: ['rappellerait'],
      explanationZh: '原将来时 rappellera 后移为条件式现在时：rappellerait。',
    },
  ],
}

// 9. La voix passive à tous les temps
export const voixPassiveLesson: TenseLesson = {
  id: 'voix-passive',
  titleFr: 'La voix passive à tous les temps',
  titleZh: '被动语态全时态系统与转换机制',
  category: 'cross-cutting',
  cefrLevel: 'B1-B2',
  echelleNiveau: 6,
  echelleSources: [
    'n6-gr-passif: 被动语态',
    'n10-gr-accord-pp: 过去分词的配合',
  ],
  summaryZh: '由助动词 être（在相应时态变位）+ 过去分词（与主语性数完全一致）构成，施动者由 par（或 de）引出。官方通告、新闻事件与学术严谨写作的必考结构。',
  timelinePosition: 'overview',
  formationSteps: [
    '被动语态万能转换公式：被动句的时态，取决于助动词 être 处于什么时态！实义动词永远作为过去分词出现，且百分之百与被动主语进行性数配合！',
    '1. 现在时：Le pont est réparé par les ouvriers.',
    '2. 复合过去时：Le pont a été réparé par les ouvriers (a été + pp).',
    '3. 未完成过去时：Le pont était réparé par les ouvriers.',
    '4. 愈过去时：Le pont avait été réparé par les ouvriers.',
    '5. 简单将来时：Le pont sera réparé par les ouvriers.',
    '6. 条件式现在时：Le pont serait réparé par les ouvriers.',
    '7. 虚拟式现在时：Il faut que le pont soit réparé par les ouvriers.',
    '引导词抉择：绝大多数用 par；描写状态、情感或心理动词用 de（如 aimé de tous, entouré d’arbres, respecté de ses pairs）。',
  ],
  usages: [
    {
      id: 'passif-present-compose',
      titleZh: '直陈式现在时与复合过去时的被动转换',
      descriptionZh: 'est + pp vs a été + pp（已被完成）。',
      examples: [
        {
          fr: 'Toutes les demandes de résidence sont traitées par le ministère de l’Immigration (présent : sont traitées).',
          zh: '所有永久居留申请都由移民部审理。',
          highlight: 'sont traitées',
        },
        {
          fr: 'Le nouveau plan de transport a été adopté à l’unanimité par le conseil municipal (passé composé : a été adopté).',
          zh: '新的交通规划方案已被市议会全票一致通过。',
          highlight: 'a été adopté',
        },
        {
          fr: 'Ces magnifiques fresques murales ont été peintes par des artistes montréalais.',
          zh: '这些壮观的壁画是由蒙特利尔本土艺术家绘制的。',
          highlight: 'ont été peintes',
        },
        {
          fr: 'Le bail est signé électroniquement par les deux parties contractantes.',
          zh: '租约由合同双方以电子方式签署。',
          highlight: 'est signé',
        },
      ],
    },
    {
      id: 'passif-passe-imparfait-pqp',
      titleZh: '过去时态中的被动语态（était + pp vs avait été + pp）',
      descriptionZh: '当时正处于被动状态 vs 在过去之前早已被处理完毕。',
      examples: [
        {
          fr: 'L’autoroute était bloquée par une épaisse couche de verglas pendant toute la nuit.',
          zh: '整条高速公路整夜都被厚厚的冰层封堵着（持续状态）。',
          highlight: 'était bloquée',
        },
        {
          fr: 'La lettre de confirmation avait été envoyée avant la fermeture définitive des bureaux.',
          zh: '确认信在办公室彻底关门之前就早已被寄出了（先时完成）。',
          highlight: 'avait été envoyée',
        },
        {
          fr: 'Les pistes cyclables étaient déneigées régulièrement chaque matin par les équipes municipales.',
          zh: '市政作业队每天清晨都定期清理自行车道积雪。',
          highlight: 'étaient déneigées',
        },
        {
          fr: 'L’édifice historique avait été restauré avec grand soin dans les années 1990.',
          zh: '这座历史古迹在20世纪90年代曾被精心修缮。',
          highlight: 'avait été restauré',
        },
      ],
    },
    {
      id: 'passif-futur-conditionnel',
      titleZh: '将来与条件式中的被动语态（sera / serait + pp）',
      descriptionZh: '宣布即将实施的工程、法案，或设想可能被采取的行动。',
      examples: [
        {
          fr: 'Le prolongement de la ligne bleue du métro sera inauguré dans cinq ans.',
          zh: '地铁蓝线的延伸线将在五年后竣工通车。',
          highlight: 'sera inauguré',
        },
        {
          fr: 'Selon les observateurs, la nouvelle loi linguistique serait promulguée dès cet automne.',
          zh: '据观察家称，新的语言法案据称将于今年秋天颁布。',
          highlight: 'serait promulguée',
        },
        {
          fr: 'Les résultats officiels du test du TCF vous seront transmis par courriel sécurisé.',
          zh: 'TCF 考试的官方成绩将通过加密邮件发送给您。',
          highlight: 'seront transmis',
        },
        {
          fr: 'Un nouvel accord de travail pourrait être signé avant la fin de la semaine.',
          zh: '一份新的劳资协议可能在本周末之前签署。',
          highlight: 'être signé',
        },
      ],
    },
    {
      id: 'passif-subjonctif',
      titleZh: '虚拟式中的被动语态（soit / soient + pp）',
      descriptionZh: 'il faut que, vouloir que 等从句中对事物被处理的要求。',
      examples: [
        {
          fr: 'Il faut que ce formulaire soit rempli et signé par le demandeur principal.',
          zh: '这份表格必须由主申请人填写并签署。',
          highlight: 'soit rempli',
        },
        {
          fr: 'L’agente exige que toutes les pièces d’identité soient vérifiées avec la plus grande rigueur.',
          zh: '办事官员要求所有身份证件都必须经过最严格的核实。',
          highlight: 'soient vérifiées',
        },
        {
          fr: 'Il est essentiel que le déneigement soit complété avant l’heure de pointe du matin.',
          zh: '清雪工作在早高峰之前全部完成是至关重要的。',
          highlight: 'soit complété',
        },
        {
          fr: 'Je souhaite que cette injustice soit réparée sans aucun délai.',
          zh: '我希望这项不公能刻不容缓地得到纠正。',
          highlight: 'soit réparée',
        },
      ],
    },
    {
      id: 'agent-par-vs-de',
      titleZh: '施动者介词选择：par（具体动作） vs de（情感与状态）',
      descriptionZh: 'aimé de, respecté de, entouré de, connu de 等固定文雅搭配。',
      examples: [
        {
          fr: 'Ce vieux médecin de famille dévoué était aimé et respecté de tous ses patients.',
          zh: '这位尽职尽责的老家庭医生深受他所有病人的爱戴与尊敬。',
          highlight: 'aimé et respecté de',
        },
        {
          fr: 'Le chalet pittoresque est entièrement entouré d’arbres centenaires et de neige blanche.',
          zh: '那座别致的小木屋被百年古树和白雪环绕着。',
          highlight: 'entouré d’',
        },
        {
          fr: 'Le suspect a été arrêté par les agents de la Sûreté du Québec sur l’autoroute 20.',
          zh: '嫌疑人在20号高速公路上被魁省省警警员逮捕。',
          highlight: 'arrêté par',
        },
        {
          fr: 'Cette célèbre autrice québécoise est connue de tous les lecteurs francophones.',
          zh: '这位著名的魁北克女作家为所有法语读者所熟知。',
          highlight: 'connue de',
        },
      ],
    },
  ],
  signalWords: [
    {
      word: 'par (agent)',
      meaningZh: '由……（引出具体动作施动者）',
      example: {
        fr: 'Le discours a été prononcé par le maire de Montréal.',
        zh: '讲话是由蒙特利尔市长发表的。',
        highlight: 'a été prononcé',
      },
    },
    {
      word: 'de (agent d’état/sentiment)',
      meaningZh: '受……（引出情感/状态施动者）',
      example: {
        fr: 'Elle était entourée de ses enfants et de ses petits-enfants.',
        zh: '她被儿孙们团团环绕着。',
        highlight: 'était entourée',
      },
    },
    {
      word: 'a été + participe passé',
      meaningZh: '已被……（复合过去时被动）',
      example: {
        fr: 'La décision a été prise lors de la dernière assemblée générale.',
        zh: '决定是在上次全体大会上作出的。',
        highlight: 'a été prise',
      },
    },
    {
      word: 'sera + participe passé',
      meaningZh: '将被……（将来时被动）',
      example: {
        fr: 'La nouvelle école sera construite au cœur du quartier résidentiel.',
        zh: '新学校将建在住宅区中心。',
        highlight: 'sera construite',
      },
    },
  ],
  commonMistakes: [
    {
      wrong: 'Les décisions a été prises. (助动词未与主语一致)',
      right: 'Les décisions ont été prises.',
      explanationZh: '主语 les décisions 是复数，助动词 avoir 必须用 ont：ont été prises。',
    },
    {
      wrong: 'La maison a été vendu hier. (分词未配合)',
      right: 'La maison a été vendue hier.',
      explanationZh: '被动语态中，过去分词必须与被动主语（la maison，阴性单数）严格配合：vendue。',
    },
    {
      wrong: 'Il a été aimé par tout le monde. (情感动词介词偏好)',
      right: 'Il était aimé de tout le monde.',
      explanationZh: '表示情感、尊重或评价的被动动词（aimé, respecté, estimé），施动者传统上规范搭配介词 de。',
    },
    {
      wrong: 'Le livre a été lire par l’étudiant.',
      right: 'Le livre a été lu par l’étudiant.',
      explanationZh: '助动词后面必须接过去分词（lu），绝不能接原形动词 lire！',
    },
  ],
  questions: [
    {
      id: 'pass-q1',
      type: 'choice',
      prompt: 'La nouvelle passerelle piétonne (inaugurer) ___ par la mairesse samedi prochain.',
      options: ['sera inaugurée', 'sera inauguré', 'a été inaugurée', 'inaugurera'],
      correctAnswer: 'sera inaugurée',
      explanationZh: '将来时被动语态，主语 la nouvelle passerelle（阴性单数）配合加 -e：sera inaugurée。',
    },
    {
      id: 'pass-q2',
      type: 'choice',
      prompt: 'Toutes les propositions citoyennes (examiner) ___ avec soin par le comité hier.',
      options: ['ont été examinées', 'a été examinée', 'ont été examinés', 'sont examinées'],
      correctAnswer: 'ont été examinées',
      explanationZh: '复合过去时被动，主语 toutes les propositions（阴性复数）配合加 -es：ont été examinées。',
    },
    {
      id: 'pass-q3',
      type: 'choice',
      prompt: 'Ce professeur dévoué est profondément respecté ___ tous ses anciens étudiants.',
      options: ['de', 'par', 'avec', 'pour'],
      correctAnswer: 'de',
      explanationZh: '表示崇敬、爱戴的情感与评价动词（respecté, aimé），施动者由介词 de 引出。',
    },
    {
      id: 'pass-q4',
      type: 'choice',
      prompt: 'Il est impératif que les formulaires (signer) ___ par les deux époux.',
      options: ['soient signés', 'sont signés', 'soit signé', 'seront signés'],
      correctAnswer: 'soient signés',
      explanationZh: 'il est impératif que 引出虚拟式被动，主语 les formulaires 为阳性复数：soient signés。',
    },
    {
      id: 'pass-q5',
      type: 'fill',
      prompt: 'La décision finale a été (prendre) ___ à l’unanimité par le conseil.（填入配合后的过去分词）',
      correctAnswer: 'prise',
      acceptedAnswers: ['prise'],
      explanationZh: '主语 la décision 是阴性单数，prendre 的过去分词配合为 prise。',
    },
    {
      id: 'pass-q6',
      type: 'fill',
      prompt: 'Ces vieux bâtiments industriels ont été (démolir) ___ l’été dernier.（填入配合后的过去分词）',
      correctAnswer: 'démolis',
      acceptedAnswers: ['démolis', 'demolis'],
      explanationZh: '主语 ces vieux bâtiments 是阳性复数，démolir 过去分词配合加 -s：démolis。',
    },
    {
      id: 'pass-q7',
      type: 'choice',
      prompt: 'L’incendie dans le quartier historique (maîtriser) ___ rapidement par les pompiers.',
      options: ['a été maîtrisé', 'a maîtrisé', 'est maîtrisé', 'avait maîtrisé'],
      correctAnswer: 'a été maîtrisé',
      explanationZh: '火灾被消防队员扑灭，复合过去时被动语态：a été maîtrisé。',
    },
    {
      id: 'pass-q8',
      type: 'choice',
      prompt: 'Le chalet était entièrement entouré ___ magnifiques sapins enneigés.',
      options: ['de', 'par', 'avec', 'dans'],
      correctAnswer: 'de',
      explanationZh: 'entouré de 是固定被动态描写搭配：entouré de magnifiques sapins。',
    },
    {
      id: 'pass-q9',
      type: 'fill',
      prompt: 'Les résultats officiels vous (transmettre) ___ par la poste dans les meilleurs délais.（将来时被动，填入 seront + 分词）',
      correctAnswer: 'seront transmis',
      acceptedAnswers: ['seront transmis'],
      explanationZh: '将来时被动语态，主语 les résultats（阳性复数）：seront transmis。',
    },
    {
      id: 'pass-q10',
      type: 'choice',
      prompt: 'La lettre de confirmation (déjà envoyer) ___ quand nous avons téléphoné.',
      options: ['avait déjà été envoyée', 'était déjà envoyée', 'a déjà été envoyée', 'serait envoyée'],
      correctAnswer: 'avait déjà été envoyée',
      explanationZh: '在打电话之前已经被寄出，愈过去时被动：avait déjà été envoyée。',
    },
    {
      id: 'pass-q11',
      type: 'choice',
      prompt: 'Il faut que cette démarche (faire) ___ dans les règles de l’art.',
      options: ['soit faite', 'est faite', 'soit fait', 'soient faites'],
      correctAnswer: 'soit faite',
      explanationZh: '虚拟式被动，主语 cette démarche（阴性单数）配合为 soit faite。',
    },
    {
      id: 'pass-q12',
      type: 'fill',
      prompt: 'Les deux coupables ont été (arrêter) ___ par les policiers à la frontière.（填入配合后的过去分词）',
      correctAnswer: 'arrêtés',
      acceptedAnswers: ['arrêtés', 'arretes'],
      explanationZh: '主语 les deux coupables 是阳性复数，分词配合为 arrêtés。',
    },
  ],
}

// 10. Vue d’ensemble : la ligne du temps
export const ligneDuTempsLesson: TenseLesson = {
  id: 'ligne-du-temps',
  titleFr: 'Vue d’ensemble : la ligne du temps',
  titleZh: '全景时间轴：法语全时态的相对坐标系统',
  category: 'cross-cutting',
  cefrLevel: 'A1-C1',
  echelleNiveau: [2, 10],
  echelleSources: [
    'n5-gr-chronologie-present: 以现在为参照的时间顺序',
    'n8-gr-chronologie-complexe: 跨过去、现在、将来的时间顺序',
    'n10-gr-coherence-temporelle: 时态与语式的连贯',
  ],
  summaryZh: '将法语全部直陈式时态放在同一根时间轴（Ligne du temps）上横向对比：从过去的过去（PQP）、过去完成（PC）、过去背景（Imparfait）、刚刚完成（Passé récent），到当下此刻（Présent），再到马上发生（Futur proche）、将来完成（Futur antérieur）与长远将来（Futur simple）。',
  timelinePosition: 'overview',
  formationSteps: [
    '时间轴锚点（Point d’ancrage）：现在时刻（Maintenant）。所有时态都以此为核心向左（过去）或向右（未来）延展。',
    '过去域纵深排列（从最深到最近）：',
    '1. Plus-que-parfait：过去的过去（在过去基准点之前就已完成）。',
    '2. Passé simple / Passé composé：过去发生的事件（点状、完成、界限分明）。',
    '3. Imparfait：过去的线状背景、持续状态与老习惯。',
    '4. Passé récent（venir de）：刚刚完成（距离此刻仅几秒或几分钟）。',
    '现在域：Présent de l’indicatif（此刻的状态、习惯与真理）；Présent progressif（être en train de，强调此刻正在进行）。',
    '将来域递进排列（从眼前到远景）：',
    '1. Futur proche（aller + inf）：马上就要发生、明确近期打算。',
    '2. Futur antérieur（aurai + pp）：将来某一时间点之前必将先行完成。',
    '3. Futur simple：中长远规划、客观规律、官方预报与规定。',
  ],
  usages: [
    {
      id: 'axe-chronologique-complet',
      titleZh: '全景叙事中的八个时态一览无余',
      descriptionZh: '一段连贯的移民生活自述，同时串联全部时态坐标。',
      examples: [
        {
          fr: 'J’avais déjà étudié un an à Paris avant de décider d’immigrer au Québec (Plus-que-parfait : 过去的过去).',
          zh: '在决定移民魁北克之前，我此前已经在巴黎留学了一年。',
          highlight: 'avais déjà étudié',
        },
        {
          fr: 'En 2022, je suis arrivé à Montréal sous un soleil radieux de juillet (Passé composé : 过去明确事件).',
          zh: '2022年，我在七月明媚灿烂的阳光下抵达了蒙特利尔。',
          highlight: 'suis arrivé',
        },
        {
          fr: 'À cette époque-là, je ne connaissais presque personne dans la métropole (Imparfait : 过去背景状态).',
          zh: '在那个时候，我在大都市里几乎一个人都不认识。',
          highlight: 'connaissais',
        },
        {
          fr: 'Je viens de signer mon bail et je suis maintenant en train de m’installer (Passé récent & progressif : 紧邻此刻).',
          zh: '我刚刚签下了租约，此刻正在紧锣密鼓地布置新家。',
          highlight: 'viens de signer',
        },
      ],
    },
    {
      id: 'axe-futur-coordonne',
      titleZh: '向未来延伸的三级阶梯（马上做 → 先完成 → 长远愿景）',
      descriptionZh: '从几分钟后的动作推进到数年后的宏伟目标。',
      examples: [
        {
          fr: 'Je vais d’abord réussir mon épreuve de français ce samedi matin (Futur proche : 即将面对).',
          zh: '我这周六早晨首先要考过我的法语考试。',
          highlight: 'vais d’abord réussir',
        },
        {
          fr: 'Dès que j’aurai obtenu mes résultats officiels, je déposerai ma demande de sélection (Futur antérieur : 将来先时).',
          zh: '一旦拿到了正式成绩单，我就将提交选拔申请。',
          highlight: 'aurai obtenu',
        },
        {
          fr: 'Dans cinq ans, j’achèterai une propriété et je fonderai mon entreprise au Québec (Futur simple : 远景规划).',
          zh: '五年之后，我将在魁北克购置房产并开创自己的企业。',
          highlight: 'achèterai',
        },
        {
          fr: 'À ce moment-là, je serai pleinement épanoui dans ma nouvelle patrie d’adoption.',
          zh: '到那个时候，我将在我的第二故乡实现全面的人生价值。',
          highlight: 'serai',
        },
      ],
    },
    {
      id: 'concordance-plan-texte',
      titleZh: '文章篇章的时态连贯（Coherence temporelle du texte）',
      descriptionZh: '避免在记叙文中毫无逻辑地任意跳跃时态，保持时间流向的严谨。',
      examples: [
        {
          fr: 'Il neigeait doucement depuis l’aube quand les premiers chasse-neige sont sortis dans les rues.',
          zh: '从黎明起雪一直在轻轻下着（背景），这时第一批扫雪车开上了街头（动作）。',
          highlight: 'sont sortis',
        },
        {
          fr: 'Ils avaient vérifié la météo la veille, ils savaient que la journée serait difficile.',
          zh: '他们前一天查过天气（更早），他们知道（当时状态）这一天将非常艰难（过去视角中的将来）。',
          highlight: 'serait',
        },
        {
          fr: 'Le conducteur a freiné brusquement parce qu’un chevreuil venait de traverser la route forestière.',
          zh: '司机猛踩刹车（突发动作），因为一只狍子刚刚穿过林间公路（紧邻先时）。',
          highlight: 'venait de traverser',
        },
        {
          fr: 'Dès que le soleil aura dissipé le brouillard matinal, nous pourrons reprendre notre route en toute sécurité.',
          zh: '太阳一旦驱散晨雾，我们就能全无安全顾虑地重新启程。',
          highlight: 'aura dissipé',
        },
      ],
    },
    {
      id: 'moods-par-rapport-temps',
      titleZh: '语式与时间轴的叠加：真实时间（直陈式） vs 虚构时间（条件式与虚拟式）',
      descriptionZh: '时态位于现实世界的时间轴；条件式是平行宇宙的分支；虚拟式是心理世界的投射。',
      examples: [
        {
          fr: 'Je vis à Montréal (réalité présente sur l’axe) vs J’aimerais vivre à Montréal (souhait parallèle).',
          zh: '我住在蒙特利尔（时间轴上的现实） vs 我真想住在蒙特利尔（平行心愿）。',
          highlight: 'aimerais',
        },
        {
          fr: 'Il est venu (fait réel passé) vs Il aurait pu venir (possibilité passée avortée).',
          zh: '他来了（现实历史） vs 他本来能来的（虚构错失的过去）。',
          highlight: 'aurait pu venir',
        },
        {
          fr: 'Le train part à dix heures (certitude horaire) vs Il faut que le train parte à l’heure (obligation projetée).',
          zh: '火车十点开（客观确定） vs 火车必须准点开（主观要求）。',
          highlight: 'parte',
        },
        {
          fr: 'Si j’avais su la vérité, je n’aurais pas agi de la sorte.',
          zh: '如果我当时知道真相，我本来就不会这样行事了（在过去轴上构建替代历史）。',
          highlight: 'aurais pas agi',
        },
      ],
    },
    {
      id: 'recapitulatif-tcf-quebec',
      titleZh: 'TCF Canada 备考时态全能速查心法',
      descriptionZh: '听力、阅读、写作与口语中的四项时态分布策略。',
      examples: [
        {
          fr: 'Tâche 1 EE : Raconter un événement passé → Passé composé (actions) + Imparfait (décor et sentiments).',
          zh: '写作任务1（记事述怀）：复合过去时记述主线事件，未完成过去时渲染背景心情。',
          highlight: 'Passé composé',
        },
        {
          fr: 'Tâche 2 EE : Raconter son parcours d’intégration → Alterner PQP, Passé composé, Présent et Futur.',
          zh: '写作任务2（经验历程）：巧妙穿插愈过去时、复合过去时、现在时与将来时展现时间纵深。',
          highlight: 'Alterner PQP',
        },
        {
          fr: 'Tâche 3 EE : Exprimer son opinion argumentée → Présent de vérité générale + Subjonctif + Conditionnel.',
          zh: '写作任务3（议论辩驳）：用现在时阐述客观论据，用虚拟式和条件式展现论证严密性。',
          highlight: 'Présent de vérité',
        },
        {
          fr: 'Compréhension écrite : Reconnaître le Passé simple dans les textes historiques et littéraires.',
          zh: '阅读理解：在历史与文学文本中快速识别简单过去时动词。',
          highlight: 'Passé simple',
        },
      ],
    },
  ],
  signalWords: [
    {
      word: 'avant que (antériorité)',
      meaningZh: '在……之前（时间纵深）',
      example: {
        fr: 'Il avait tout préparé avant que les invités n’arrivent.',
        zh: '在客人们到来之前，他已经把一切都准备好了。',
        highlight: 'avait tout préparé',
      },
    },
    {
      word: 'maintenant (présent)',
      meaningZh: '现在（时间轴核心锚点）',
      example: {
        fr: 'Maintenant, nous comprenons parfaitement la mécanique des temps français.',
        zh: '现在，我们完全理解了法语时态系统的运行逻辑。',
        highlight: 'comprenons',
      },
    },
    {
      word: 'dès que + futur antérieur',
      meaningZh: '一旦……（将来先时锚点）',
      example: {
        fr: 'Dès que le printemps sera arrivé, les arbres bourgeonneront partout.',
        zh: '春天一旦降临，树木将处处抽出嫩芽。',
        highlight: 'sera arrivé',
      },
    },
    {
      word: 'dans dix ans (futur simple)',
      meaningZh: '十年后（远期坐标）',
      example: {
        fr: 'Dans dix ans, nous regarderons ce parcours avec une immense fierté.',
        zh: '十年之后，我们将怀着巨大的自豪感回望这段奋斗历程。',
        highlight: 'regarderons',
      },
    },
  ],
  commonMistakes: [
    {
      wrong: 'J’ai arrivé en 2020 et je vis ici depuis 2020. (逻辑表达单一重复)',
      right: 'Je suis arrivé en 2020 et j’habite ici depuis trois ans.',
      explanationZh: 'arrivée 是到达那一瞬（passé composé），habite 是至今持续的居住状态（présent + depuis）。',
    },
    {
      wrong: 'Hier j’avais mangé une poutine. (没有过去参照点却单用 PQP)',
      right: 'Hier j’ai mangé une poutine.',
      explanationZh: '愈过去时不能在没有“过去基准点”的情况下独立作为单纯过去动作使用！昨天发生的事直接用 passé composé。',
    },
    {
      wrong: 'Dès que je vais finir, je vais partir. (双重最近将来时在主从句中累赘失范)',
      right: 'Dès que j’aurai fini, je partirai.',
      explanationZh: '书面或规范表达中，时间从句用先将来时（aurai fini），主句用简单将来时（partirai），体现精妙的先时层次。',
    },
    {
      wrong: 'Il a dit qu’il viendra demain. (时态轴后移脱节)',
      right: 'Il a dit qu’il viendrait le lendemain.',
      explanationZh: '时间轴平移原则：主句一旦锚定在过去（a dit），从句的整个将来视线必须相应转化为条件式（viendrait）。',
    },
  ],
  questions: [
    {
      id: 'axe-q1',
      type: 'choice',
      prompt: 'Quel temps représente une action achevée dans le passé avant une autre action passée ?',
      options: ['Le plus-que-parfait', 'Le passé composé', 'L’imparfait', 'Le futur antérieur'],
      correctAnswer: 'Le plus-que-parfait',
      explanationZh: '在另一过去动作之前就已完成的“过去的过去”，是愈过去时（Plus-que-parfait）。',
    },
    {
      id: 'axe-q2',
      type: 'choice',
      prompt: 'Quel temps utilise-t-il pour décrire un décor ou une habitude dans le passé ?',
      options: ['L’imparfait', 'Le passé composé', 'Le passé simple', 'Le présent'],
      correctAnswer: 'L’imparfait',
      explanationZh: '描绘过去的背景画面、环境与习惯的是未完成过去时（Imparfait）。',
    },
    {
      id: 'axe-q3',
      type: 'choice',
      prompt: 'Dans la phrase « Dès que j’aurai fini, je partirai », quel temps exprime « aurai fini » ?',
      options: ['Le futur antérieur', 'Le futur simple', 'Le futur proche', 'Le conditionnel passé'],
      correctAnswer: 'Le futur antérieur',
      explanationZh: 'aurai + fini 是助动词简单将来时 + 过去分词，构成先将来时（Futur antérieur）。',
    },
    {
      id: 'axe-q4',
      type: 'choice',
      prompt: 'Quelle formule exprime une action accomplie il y a seulement quelques secondes ou minutes ?',
      options: ['venir de + infinitif', 'aller + infinitif', 'être en train de + infinitif', 'avoir + participe passé'],
      correctAnswer: 'venir de + infinitif',
      explanationZh: '表达刚刚完成的微距过去时态是 venir de + infinitif（Passé récent）。',
    },
    {
      id: 'axe-q5',
      type: 'fill',
      prompt: 'Pour exprimer une action en cours de déroulement à l’instant même, on utilise être en ___ de + infinitif.（填入介词短语词汇）',
      correctAnswer: 'train',
      acceptedAnswers: ['train'],
      explanationZh: '现在进行时固定短语是 être en train de + infinitif。',
    },
    {
      id: 'axe-q6',
      type: 'fill',
      prompt: 'Dans le système avec « si », si + présent s’associe typiquement dans la principale avec le futur ___.（填入 simple 或 proche）',
      correctAnswer: 'simple',
      acceptedAnswers: ['simple'],
      explanationZh: 'si + présent 标准搭配主句为 futur simple。',
    },
    {
      id: 'axe-q7',
      type: 'choice',
      prompt: 'Quel temps purement littéraire et journalistique remplace le passé composé dans les romans ?',
      options: ['Le passé simple', 'L’imparfait', 'Le plus-que-parfait', 'Le subjonctif passé'],
      correctAnswer: 'Le passé simple',
      explanationZh: '文学与史书叙事中替代复合过去时的是简单过去时（Passé simple）。',
    },
    {
      id: 'axe-q8',
      type: 'choice',
      prompt: 'Quand l’action est projetée dans un futur immédiat avec une forte intention, on utilise :',
      options: ['Le futur proche (aller + inf)', 'Le futur antérieur', 'L’imparfait', 'Le conditionnel'],
      correctAnswer: 'Le futur proche (aller + inf)',
      explanationZh: '表达即将发生或明确个人近期打算使用最近将来时（aller + infinitif）。',
    },
    {
      id: 'axe-q9',
      type: 'fill',
      prompt: 'Le conditionnel passé exprime souvent un ___ ou un reproche concernant un fait passé.（填入中文或法文，如 regret / 遗憾）',
      correctAnswer: 'regret',
      acceptedAnswers: ['regret', '遗憾'],
      explanationZh: '条件式过去时常用于表达对过去的遗憾（regret）或责备。',
    },
    {
      id: 'axe-q10',
      type: 'choice',
      prompt: 'Dans la phrase « Il a dit qu’il viendrait », le verbe « viendrait » est au conditionnel présent pour exprimer :',
      options: [
        'Le futur dans le passé',
        'Une politesse',
        'Une incertitude totale',
        'Une hypothèse irréelle',
      ],
      correctAnswer: 'Le futur dans le passé',
      explanationZh: '主句在过去，从句原将来时转化为条件式现在时，表达“过去视角中的将来”（Le futur dans le passé）。',
    },
    {
      id: 'axe-q11',
      type: 'choice',
      prompt: 'Quel mode exprime la réalité objective et les certitudes sur l’axe du temps ?',
      options: ['L’indicatif', 'Le subjonctif', 'L’impératif', 'Le conditionnel'],
      correctAnswer: 'L’indicatif',
      explanationZh: '真实世界的时间轴由直陈式（Indicatif）承担，其他语式表达主观情态。',
    },
    {
      id: 'axe-q12',
      type: 'fill',
      prompt: 'Sur l’axe du temps, le point central par rapport auquel tout s’organise est le ___ de l’indicatif.（填入 présent 或 futur）',
      correctAnswer: 'présent',
      acceptedAnswers: ['présent', 'present'],
      explanationZh: '整个时间轴的核心绝对锚点是直陈式现在时（présent de l’indicatif）。',
    },
  ],
}
