/**
 * Original Intensive Listening (精听) passages for TCF Canada preparation.
 * Centered on authentic Québec-standard French, everyday integration, and workplace contexts.
 * All passages and questions are completely original.
 */

export type SpeakerRole = 'A' | 'B'
export type SpeakerGender = 'male' | 'female'

export interface IntensiveSentence {
  fr: string
  zh: string
  speaker?: SpeakerRole
}

export interface IntensiveVocab {
  fr: string
  zh: string
}

export interface IntensiveQuestion {
  q: string
  choices: [string, string, string, string]
  answer: number
}

export interface IntensiveSpeakers {
  A: SpeakerGender
  B?: SpeakerGender
}

export interface Passage {
  id: string
  title: string
  titleFr: string
  level: 'B1' | 'B2'
  topic: string
  speakers?: IntensiveSpeakers
  sentences: IntensiveSentence[]
  vocab: IntensiveVocab[]
  questions?: IntensiveQuestion[]
}

export type IntensivePassage = Passage

export const INTENSIVE_PASSAGES: Passage[] = [
  {
    id: 'premier-jour-cours-francais',
    title: '第一天上法语课',
    titleFr: 'Premier jour au cours de français',
    level: 'B1',
    topic: '语言学习与适应',
    speakers: {
      A: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour à tous ! Ce matin, j’ai commencé mon tout premier cours de francisation à Montréal.',
        zh: '大家好！今天早上，我开始了在蒙特利尔的第一堂法语融合课程。',
      },
      {
        speaker: 'A',
        fr: 'J’étais un peu stressée en arrivant au centre communautaire, mais l’accueil était très chaleureux.',
        zh: '到达社区中心时我有点紧张，但大家的接待非常热情。',
      },
      {
        speaker: 'A',
        fr: 'Notre professeure s’appelle Chantal, et elle a tout de suite mis tout le monde à l’aise.',
        zh: '我们的老师叫尚塔尔，她立刻就让所有人都放松了下来。',
      },
      {
        speaker: 'A',
        fr: 'Dans notre classe, on est douze adultes venus de plusieurs pays différents.',
        zh: '我们班上有十二位成年学员，来自好几个不同的国家。',
      },
      {
        speaker: 'A',
        fr: 'On a d’abord fait un tour de table pour se présenter et expliquer nos projets au Québec.',
        zh: '我们首先依次轮流发言，作自我介绍并说明我们在魁北克的规划。',
      },
      {
        speaker: 'A',
        fr: 'Chacun a raconté son parcours avec des mots simples, et tout le monde s’encourageait.',
        zh: '每个人都用简单的词句讲述了自己的经历，大家互相鼓励。',
      },
      {
        speaker: 'A',
        fr: 'Ensuite, Chantal nous a expliqué le déroulement des sessions et les objectifs de la session d’automne.',
        zh: '接着，尚塔尔向我们解释了课程安排以及秋季学期的教学目标。',
      },
      {
        speaker: 'A',
        fr: 'On va pratiquer l’écoute et la conversation tous les jours pendant trois heures.',
        zh: '我们每天将进行三个小时的听力和对话练习。',
      },
      {
        speaker: 'A',
        fr: 'Pendant la pause, je suis allée chercher un café au petit dépanneur juste en face de l’école.',
        zh: '休息时间，我到学校正对面的小便利店买了杯咖啡。',
      },
      {
        speaker: 'A',
        fr: 'J’ai même osé commander entièrement en français avec la commis, et elle m’a comprise du premier coup !',
        zh: '我甚至鼓起勇气完全用法语跟店员点单，她一下就听懂了我的意思！',
      },
      {
        speaker: 'A',
        fr: 'Ça m’a vraiment donné confiance pour la suite de mon apprentissage.',
        zh: '这真的让我对接下来的学习充满了信心。',
      },
      {
        speaker: 'A',
        fr: 'Cet après-midi, je vais réviser les verbes de base et écouter la radio locale pour habituer mes oreilles.',
        zh: '今天下午，我打算复习基础动词，并收听本地广播来磨耳朵。',
      },
      {
        speaker: 'A',
        fr: 'Apprendre une nouvelle langue demande de la patience, mais je me sens prête à relever le défi.',
        zh: '学习一门新语言需要耐心，但我感觉自己已经准备好迎接挑战了。',
      },
      {
        speaker: 'A',
        fr: 'Je vous raconterai la suite de mes progrès dans un prochain message !',
        zh: '下次我会继续在动态中跟你们分享我的学习进展！',
      },
    ],
    vocab: [
      { fr: 'francisation', zh: '法语融合课程（魁北克移民法语培训）' },
      { fr: 'chaleureux', zh: '热情的，温馨的' },
      { fr: 'tour de table', zh: '轮流发言，依次表态' },
      { fr: 'dépanneur', zh: '便利店（魁北克特色用语）' },
      { fr: 'oser', zh: '敢于，鼓起勇气' },
      { fr: 'relever le défi', zh: '迎接挑战' },
    ],
    questions: [
      {
        q: '这位学员今天在便利店有什么经历？',
        choices: [
          '她找不到想买的热咖啡',
          '她成功用法语完成了点单',
          '店员完全听不懂她说的话',
          '她因为听不懂法语而感到沮丧',
        ],
        answer: 1,
      },
      {
        q: '课堂上的教学安排包括什么？',
        choices: [
          '每天进行三小时的听力与会话练习',
          '每周只上一节语法测试课',
          '所有学员必须单独完成学术论文',
          '老师要求大家整天只能自学',
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 'appel-location-appartement',
    title: '在魁北克租公寓打电话',
    titleFr: 'Appel pour louer un appartement à Québec',
    level: 'B1',
    topic: '住房与生活',
    speakers: {
      A: 'male',
      B: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour madame, j’appelle au sujet de l’appartement trois et demi à louer dans Rosemont.',
        zh: '您好女士，我打电话是想咨询在罗斯蒙特区出租的那套一室一厅公寓。',
      },
      {
        speaker: 'B',
        fr: 'Oui, bonjour ! Il est toujours disponible. Vous cherchez pour quelle date ?',
        zh: '您好！房子目前还在招租。请问您打算从什么时候起租？',
      },
      {
        speaker: 'A',
        fr: 'Idéalement pour le premier juillet, comme c’est la coutume ici, mais je pourrais emménager dès le quinze juin.',
        zh: '按这里的习俗最好是七月一日，但我也可以从六月十五日就搬进去。',
      },
      {
        speaker: 'B',
        fr: 'Parfait. Le loyer est de mille cent dollars par mois, et le chauffage ainsi que l’eau chaude sont inclus.',
        zh: '太好了。房租是每月一千一百加元，包含暖气和热水。',
      },
      {
        speaker: 'A',
        fr: 'C’est une excellente nouvelle, surtout pour affronter l’hiver québécois !',
        zh: '这可太好了，尤其是面对魁北克的冬天！',
      },
      {
        speaker: 'B',
        fr: 'Tout à fait. Il y a aussi une buanderie commune au sous-sol avec laveuses et sécheuses payantes.',
        zh: '确实如此。地下室还有一间公用洗衣房，配有投币洗衣机和烘干机。',
      },
      {
        speaker: 'A',
        fr: 'Est-ce que les électroménagers comme le réfrigérateur et la cuisinière sont fournis dans le logement ?',
        zh: '请问房间里配有冰箱和炉灶等大家电吗？',
      },
      {
        speaker: 'B',
        fr: 'Oui, ils sont compris et en très bon état de marche.',
        zh: '有的，都是包含在内的，而且运行状态都很好。',
      },
      {
        speaker: 'A',
        fr: 'Y a-t-il un arrêt d’autobus ou une station de métro à proximité de l’immeuble ?',
        zh: '公寓楼附近有公交站或者地铁站吗？',
      },
      {
        speaker: 'B',
        fr: 'Vous avez une station de métro à seulement huit minutes de marche, et un dépanneur au coin de la rue.',
        zh: '步行仅需八分钟就有一座地铁站，街角还有一家便利店。',
      },
      {
        speaker: 'A',
        fr: 'C’est très pratique. Serait-il possible de fixer une visite en fin de semaine ?',
        zh: '那真的很方便。我们可以在这周末安排一次看房吗？',
      },
      {
        speaker: 'B',
        fr: 'Absolument, je serai sur place samedi vers quatorze heures. Est-ce que cette heure-là vous convient ?',
        zh: '当然可以，我周六下午两点左右会在那里。这个时间您方便吗？',
      },
      {
        speaker: 'A',
        fr: 'C’est parfait pour moi, je vous envoie un courriel de confirmation tout de suite.',
        zh: '对我来说非常合适，我这就给您发封确认邮件。',
      },
      {
        speaker: 'B',
        fr: 'Très bien, merci monsieur, et à samedi après-midi !',
        zh: '好的，谢谢您先生，周六下午见！',
      },
    ],
    vocab: [
      { fr: 'trois et demi', zh: '一室一厅（魁北克房型，指一房一厅一厨加半卫）' },
      { fr: 'loyer', zh: '房租' },
      { fr: 'chauffage', zh: '暖气，供暖' },
      { fr: 'buanderie', zh: '洗衣房' },
      { fr: 'électroménagers', zh: '家用电器（冰箱、炉灶等）' },
      { fr: 'fin de semaine', zh: '周末（魁北克常用词）' },
      { fr: 'courriel', zh: '电子邮件（魁北克规范用词）' },
    ],
    questions: [
      {
        q: '房租每月一千一百加元中包含了哪些项目？',
        choices: [
          '仅包含网络和电费',
          '包含暖气和热水',
          '包含停车位和全套家具',
          '不包含任何杂费',
        ],
        answer: 1,
      },
      {
        q: '双方约定什么时候实地看房？',
        choices: [
          '周三上午十点',
          '周五傍晚六点',
          '周六下午两点左右',
          '下周一中午十二点',
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'preparer-hiver-quebec',
    title: '冬天准备清单',
    titleFr: 'La liste de préparation pour l’hiver au Québec',
    level: 'B1',
    topic: '气候与日常生活',
    speakers: {
      A: 'male',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Si vous venez d’arriver au Québec, l’arrivée de la saison froide peut sembler intimidante.',
        zh: '如果你刚来到魁北克，寒冷季节的到来可能会让人感到有些望而生畏。',
      },
      {
        speaker: 'A',
        fr: 'Rassurez-vous, avec une bonne préparation, on s’adapte très rapidement à la neige et au froid.',
        zh: '请放心，只要做好充分的准备，大家很快就能适应这里的冰雪与严寒。',
      },
      {
        speaker: 'A',
        fr: 'La première règle essentielle est d’adopter le principe des pelures d’oignon pour s’habiller.',
        zh: '首要且基本的一条法则是采用“洋葱式穿衣法”来穿戴衣物。',
      },
      {
        speaker: 'A',
        fr: 'On superpose une sous-couche respirante, une couche isolante comme une laine polaire, et un manteau coupe-vent imperméable.',
        zh: '我们先穿一层透气的内层，再加一层保暖层比如抓绒衣，最外层套上一件防风防水的外套。',
      },
      {
        speaker: 'A',
        fr: 'Il ne faut surtout pas négliger les extrémités du corps : procurez-vous une bonne tuque, des mitaines chaudes et un foulard.',
        zh: '千万不要忽视身体的肢端部位：一定要备好一顶优质的毛线帽、一副保暖手套和一条围巾。',
      },
      {
        speaker: 'A',
        fr: 'Pour vos pieds, investissez dans des bottes d’hiver imperméables avec de bonnes semelles antidérapantes.',
        zh: '至于脚部，请务必投资一双具有良好防滑鞋底的防水雪地靴。',
      },
      {
        speaker: 'A',
        fr: 'En ville, les trottoirs sont souvent glacés le matin après une bordée de neige.',
        zh: '在城市里，经历了一场大雪后，清晨的人行道往往容易结冰。',
      },
      {
        speaker: 'A',
        fr: 'Si vous possédez une voiture, n’oubliez pas que les pneus d’hiver sont obligatoires à partir du premier décembre.',
        zh: '如果你有车，请别忘了从十二月一日起，法律规定必须强制更换冬季胎。',
      },
      {
        speaker: 'A',
        fr: 'Pensez également à acheter un bon balai à neige et du lave-glace adapté aux températures de moins quarante degrés.',
        zh: '还要记得购买一把好用的雪刷，以及能承受零下四十度低温的防冻玻璃水。',
      },
      {
        speaker: 'A',
        fr: 'À l’intérieur des maisons, l’air devient souvent sec à cause des calorifères électriques.',
        zh: '在室内，由于电暖气片的作用，空气通常会变得非常干燥。',
      },
      {
        speaker: 'A',
        fr: 'Un humidificateur dans la chambre à coucher vous évitera bien des maux de gorge au réveil.',
        zh: '在卧室里放一台加湿器，能有效避免早晨醒来时喉咙干痛。',
      },
      {
        speaker: 'A',
        fr: 'Enfin, profitez des belles journées ensoleillées pour aller glisser, patiner ou marcher en forêt.',
        zh: '最后，不妨充分利用晴朗明媚的日子去滑雪胎、滑冰或到森林里漫步散心。',
      },
      {
        speaker: 'A',
        fr: 'L’hiver fait partie intégrante de la culture québécoise et réserve de merveilleux moments en plein air.',
        zh: '冬日是魁北克文化不可分割的一部分，也能为我们带来精彩美好的户外时光。',
      },
      {
        speaker: 'A',
        fr: 'Prenez le temps de magasiner vos équipements à l’avance pour profiter de la saison en toute sécurité !',
        zh: '提前花时间选购好你的装备，以便安心安全地享受这个季节吧！',
      },
    ],
    vocab: [
      { fr: 'pelures d’oignon', zh: '洋葱皮穿衣法（分层叠穿）' },
      { fr: 'tuque', zh: '毛线保暖帽（魁北克特色词）' },
      { fr: 'mitaines', zh: '连指手套 / 保暖手套' },
      { fr: 'bordée de neige', zh: '一场大降雪（气象高频词）' },
      { fr: 'lave-glace', zh: '汽车挡风玻璃清洗液' },
      { fr: 'calorifère', zh: '暖气散热器，电暖片' },
      { fr: 'magasiner', zh: '购物，逛街选购（魁北克典型动词）' },
    ],
    questions: [
      {
        q: '在穿衣保暖方面，文章给出的核心建议是什么？',
        choices: [
          '只穿一件极厚且笨重的纯棉大衣',
          '采用分层叠穿的洋葱式穿法',
          '冬天在室外绝不佩戴手套与帽子',
          '尽量不出门购买任何防寒衣物',
        ],
        answer: 1,
      },
      {
        q: '关于魁北克冬季用车，文中提到了哪项强制性规定？',
        choices: [
          '十二月一日起必须强制更换冬胎',
          '每年冬天禁止在市区内驾驶私家车',
          '每辆车必须在车顶加装防雪网',
          '车辆只能在周末和节假日出行',
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 'entrevue-embauche-montreal',
    title: '求职面试',
    titleFr: 'Une entrevue d’embauche à Montréal',
    level: 'B2',
    topic: '职场与专业交流',
    speakers: {
      A: 'female',
      B: 'male',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour Julien, installez-vous. J’ai examiné votre curriculum vitæ avec beaucoup d’intérêt pour le poste de gestionnaire de projet.',
        zh: '你好朱利安，请坐。我非常认真地审阅了你的简历，了解你应聘项目经理一职的意向。',
      },
      {
        speaker: 'B',
        fr: 'Merci beaucoup de me recevoir, madame Tremblay. C’est un réel plaisir d’échanger avec vous aujourd’hui.',
        zh: '非常感谢您安排这次面试，特朗布莱女士。今天能与您交流我感到非常荣幸。',
      },
      {
        speaker: 'A',
        fr: 'Pour commencer, pourriez-vous me parler d’un projet d’envergure que vous avez mené à terme dans votre précédent emploi ?',
        zh: '首先，你能跟我谈谈你在上一份工作中主导完成的一项重大项目吗？',
      },
      {
        speaker: 'B',
        fr: 'Certainement. J’ai coordonné la transition numérique des outils de communication interne pour une équipe de quarante personnes.',
        zh: '当然可以。我曾为一支四十人的团队统筹协调过内部沟通工具的数字化转型升级。',
      },
      {
        speaker: 'B',
        fr: 'Il a fallu analyser les besoins des différents services, choisir la plateforme appropriée et former l’ensemble du personnel en trois mois.',
        zh: '我们需要深入分析各部门的具体需求，遴选适用的技术平台，并在三个月内完成全员培训。',
      },
      {
        speaker: 'A',
        fr: 'Quels ont été les principaux défis rencontrés lors de cette transition, et comment les avez-vous surmontés ?',
        zh: '在这次转型过程中遇到的主要挑战是什么，你又是如何克服它们的？',
      },
      {
        speaker: 'B',
        fr: 'La résistance au changement était sans doute le plus grand obstacle au début.',
        zh: '在初期阶段，面对变革的抵触心理无疑是最大的障碍。',
      },
      {
        speaker: 'B',
        fr: 'J’ai misé sur la transparence en organisant des ateliers participatifs et des séances de rétroaction hebdomadaires.',
        zh: '我坚持公开透明的原则，通过组织参与式工作坊和每周反馈会议来逐步推进。',
      },
      {
        speaker: 'B',
        fr: 'Cela a permis aux collègues de se sentir écoutés et de s’approprier les nouveaux outils beaucoup plus sereinement.',
        zh: '这让同事们感受到了自己的意见被倾听，从而更从容地掌握了新工具。',
      },
      {
        speaker: 'A',
        fr: 'C’est une démarche très constructive. Chez nous, nous valorisons particulièrement la collaboration multidisciplinaire et l’autonomie.',
        zh: '这是一种非常务实建设性的做法。在我们公司，我们尤其看重跨学科团队协作与员工的自主性。',
      },
      {
        speaker: 'A',
        fr: 'Comment vous adaptez-vous lorsque des priorités concurrentes surgissent dans un calendrier serré ?',
        zh: '当在紧迫的日程表上出现相互竞争的优先事项时，你通常如何应对调整？',
      },
      {
        speaker: 'B',
        fr: 'Je réévalue immédiatement la matrice d’urgence et d’importance avec les parties prenantes pour réaligner les attentes.',
        zh: '我会立即与相关利益攸关方重新评估紧急与重要性矩阵，以重新对齐各方预期。',
      },
      {
        speaker: 'B',
        fr: 'Une communication proactive évite bien des malentendus et permet d’arbitrer les compromis nécessaires sans compromettre la qualité.',
        zh: '积极主动的沟通能避免诸多误解，并让我们在不牺牲品质的前提下权衡必要的妥协。',
      },
      {
        speaker: 'A',
        fr: 'Très bien. Avez-vous des questions particulières concernant notre culture d’entreprise ou l’équipe que vous rejoindriez ?',
        zh: '很好。关于我们公司的企业文化，或者你即将加入的团队，你有什么想了解的吗？',
      },
      {
        speaker: 'B',
        fr: 'Oui, j’aimerais savoir quelles sont les opportunités de perfectionnement professionnel offertes aux nouveaux employés.',
        zh: '有的，我想了解一下公司为新员工提供了哪些专业技能进修与发展机会。',
      },
      {
        speaker: 'A',
        fr: 'Nous soutenons activement les formations continues. Nous finalisons les entrevues cette semaine et nous vous reviendrons d’ici vendredi par courriel.',
        zh: '我们非常支持员工的持续培训。我们本周会结束面试流程，并在周五前通过电子邮件给您答复。',
      },
    ],
    vocab: [
      { fr: 'envergure', zh: '规模，重要程度（projet d’envergure 重大项目）' },
      { fr: 'transition numérique', zh: '数字化转型' },
      { fr: 'résistance au changement', zh: '面对变革的抵触心理' },
      { fr: 's’approprier', zh: '吸收并熟练掌握（新工具、方法）' },
      { fr: 'priorités concurrentes', zh: '相互竞争的优先事项' },
      { fr: 'parties prenantes', zh: '利益相关方，各参与方' },
      { fr: 'perfectionnement', zh: '技能进修，精进完善' },
    ],
    questions: [
      {
        q: '应聘者在上一份工作中是如何化解员工对新工具抵触情绪的？',
        choices: [
          '强制所有人加班并在两周内完成考核',
          '组织参与式工作坊和定期反馈会议',
          '解聘不愿使用新系统的员工',
          '完全放弃推行新的数字化系统',
        ],
        answer: 1,
      },
      {
        q: '招聘主管表示公司通常在什么时候给应聘者答复？',
        choices: [
          '一个月之后的电话回访',
          '下个月初的线上笔试通知',
          '本周五前通过电子邮件通知',
          '当天下午直接公布录用结果',
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'radio-communautaire-integration',
    title: '社区电台：移民融入经验',
    titleFr: 'Radio communautaire : regards sur l’intégration au Québec',
    level: 'B2',
    topic: '社会生活与文化认同',
    speakers: {
      A: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bienvenue à toutes et à tous à l’écoute de notre émission hebdomadaire « Voix d’ici et d’ailleurs » sur les ondes de votre radio communautaire.',
        zh: '欢迎大家收听我们社区电台每周播出的栏目《此岸与远方的声音》。',
      },
      {
        speaker: 'A',
        fr: 'Aujourd’hui, j’aimerais vous partager quelques réflexions sincères sur mon propre parcours d’intégration depuis mon arrivée en terre québécoise il y a cinq ans.',
        zh: '今天，我想真诚地与各位分享五年前我踏上魁北克这片土地以来，自己在融入生活中的几点感悟。',
      },
      {
        speaker: 'A',
        fr: 'Lorsqu’on pose ses valises dans un nouvel environnement, le choc culturel ne réside pas toujours dans les grandes différences, mais plutôt dans les nuances du quotidien.',
        zh: '当一个人在一个全新的环境中安顿下来时，文化冲击往往不在于宏大的差异，而潜藏在日常生活的细微之处。',
      },
      {
        speaker: 'A',
        fr: 'Au départ, même si je maîtrisais déjà le français d’Europe, j’ai été déroutée par le rythme, l’intonation et les expressions idiomatiques locales.',
        zh: '刚开始时，即使我已经熟练掌握欧洲法语，当地的语速节奏、语调以及惯用俚语还是让我有些摸不着头脑。',
      },
      {
        speaker: 'A',
        fr: 'Il m’a fallu apprendre à tendre l’oreille avec humilité, sans hésiter à faire répéter avec le sourire.',
        zh: '我必须学会怀着谦逊的心态侧耳倾听，面带微笑地坦然请对方再讲一遍。',
      },
      {
        speaker: 'A',
        fr: 'L’un des piliers qui a transformé mon expérience a été mon engagement bénévole dans une banque alimentaire de mon quartier.',
        zh: '彻底改变我生活经历的重要支柱之一，是我在街区一家食物济贫库参与的志愿服务。',
      },
      {
        speaker: 'A',
        fr: 'En donnant un peu de mon temps chaque semaine, j’ai noué des liens solides avec des citoyens de toutes les générations.',
        zh: '通过每周贡献一点业余时间，我与各个年龄段的当地居民建立了深厚的情谊。',
      },
      {
        speaker: 'A',
        fr: 'C’est en jasant autour d’une tasse de thé que j’ai véritablement découvert l’histoire ouvrière et l’esprit d’entraide de ma communauté d’accueil.',
        zh: '正是在一杯清茶边轻松闲聊的时光里，我才真正领略了当地社区的工人历史与互助精神。',
      },
      {
        speaker: 'A',
        fr: 'L’intégration n’est jamais un processus à sens unique où l’on effacerait son passé pour se fondre dans un moule préétabli.',
        zh: '融入绝不是一条抹去个人过去、将自己削足适履套入既定模具的单向道。',
      },
      {
        speaker: 'A',
        fr: 'Il s’agit plutôt d’un dialogue d’enrichissement mutuel, un tissage patient entre ce que l’on apporte et ce que la société nous offre en partage.',
        zh: '它更像是一场相互滋养的对话，在我们带来的独特阅历与接纳社会给予的丰厚馈赠之间耐心编织。',
      },
      {
        speaker: 'A',
        fr: 'Certes, il y a des jours de doute et de nostalgie, notamment lorsque les hivers s’étirent en longueur jusqu’au mois d’avril.',
        zh: '诚然，也会有心生疑虑与思乡怀旧的日子，尤其是在漫长寒冬一直拖延到四月份的时候。',
      },
      {
        speaker: 'A',
        fr: 'Mais voir ses enfants s’épanouir à l’école de quartier et se sentir chez soi dans sa ruelle apporte une immense sérénité.',
        zh: '但看着孩子们在社区学校里健康快乐地成长，在自家后巷里找到归属感，内心便充满无限安详。',
      },
      {
        speaker: 'A',
        fr: 'Si vous traversez actuellement cette période de transition, accordez-vous de la bienveillance et ne restez pas isolé dans votre bulle.',
        zh: '如果你当前正经历这段转折适应期，请对自己多一份宽容与善意，切莫独自蜷缩在孤岛中。',
      },
      {
        speaker: 'A',
        fr: 'Les organismes communautaires regorgent d’initiatives pour vous épauler dans vos démarches d’insertion sociale et professionnelle.',
        zh: '各类社区公益机构有着丰富多样的活动，全力支持你在社会与职业生活中的顺利立足。',
      },
      {
        speaker: 'A',
        fr: 'Osez pousser la porte des bibliothèques municipales et participer aux activités de quartier, car chaque rencontre est un pas de plus vers l’enracinement.',
        zh: '鼓起勇气推开市立图书馆的大门，积极投身邻里活动吧，因为每一次相遇都是向生根发芽迈出坚实的一步。',
      },
      {
        speaker: 'A',
        fr: 'Merci de votre fidélité, et restez des nôtres pour la pause musicale qui suit !',
        zh: '感谢大家的守候与聆听，接下来请继续锁定我们的音乐小憩时光！',
      },
    ],
    vocab: [
      { fr: 'dérouté', zh: '感到困惑的，不知所措的' },
      { fr: 'bénévolat', zh: '志愿服务，义工活动' },
      { fr: 'jaser', zh: '闲聊，说话聊天（魁北克高频日常口语动词）' },
      { fr: 'entraide', zh: '互助，互相扶助' },
      { fr: 'enrichissement mutuel', zh: '相互丰富，彼此促进' },
      { fr: 'sérénité', zh: '平静，安详，坦然' },
      { fr: 'enracinement', zh: '扎根，融入生根' },
    ],
    questions: [
      {
        q: '讲述者通过哪种途径最有效地结识了当地居民并建立了深厚联系？',
        choices: [
          '独自在家里阅读历史书籍',
          '在街区食物济贫库参与志愿服务',
          '报名参加高额的商业俱乐部',
          '在网上论坛与陌生人辩论',
        ],
        answer: 1,
      },
      {
        q: '讲述者对于“移民融入”的核心观点是什么？',
        choices: [
          '必须彻底忘记母国的一切语言与文化',
          '是一场彼此滋养、在保留自身特色中相互结合的对话',
          '只要学会当地口音就无需参与任何社交',
          '只需要关注薪资待遇而无需了解历史',
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 'debat-teletravail-hybride',
    title: '关于远程办公的讨论',
    titleFr: 'Débat sur le télétravail et la formule hybride',
    level: 'B2',
    topic: '现代职场与生活平衡',
    speakers: {
      A: 'male',
      B: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Valérie, as-tu pris connaissance du nouveau sondage interne sur le retour en présentiel au bureau ?',
        zh: '瓦莱丽，你看到公司内部关于返回办公室实地办公的最新调查问卷了吗？',
      },
      {
        speaker: 'B',
        fr: 'Oui, tout à fait. La très grande majorité de nos collègues souhaite conserver au moins trois jours de télétravail par semaine.',
        zh: '看了，当然看了。绝大多数同事都希望能每周保留至少三天的居家办公时间。',
      },
      {
        speaker: 'A',
        fr: 'Je comprends l’attrait de la flexibilité, mais je m’inquiète de l’effritement du sentiment d’appartenance au sein des équipes.',
        zh: '我理解灵活性带来的吸引力，但我担心团队内部的归属感会被逐渐削弱磨灭。',
      },
      {
        speaker: 'A',
        fr: 'La créativité spontanée et les échanges informels autour de la machine à café ont quasiment disparu avec les réunions virtuelles.',
        zh: '在虚拟会议的大环境下，咖啡机旁即兴迸发的创造力与非正式交流几乎荡然无存了。',
      },
      {
        speaker: 'B',
        fr: 'C’est vrai pour certains aspects, mais le gain de productivité et la réduction du stress lié aux transports en commun sont indéniables.',
        zh: '在某些层面上确实如此，但工作效率的提高以及通勤挤车压力的减轻也是毋庸置疑的事实。',
      },
      {
        speaker: 'B',
        fr: 'Éviter une heure et demie d’embouteillages sur les ponts de Montréal chaque jour permet de mieux concilier vie professionnelle et vie personnelle.',
        zh: '每天免去了在蒙特利尔几座过河大桥上堵上一个半小时，能让人更好地平衡工作与个人生活。',
      },
      {
        speaker: 'A',
        fr: 'Certes, mais qu’en est-il de l’accueil et du mentorat des jeunes recrues qui viennent d’arriver sur le marché du travail ?',
        zh: '话虽如此，但对于那些初入职场、急需指导关怀的新人来说，又该如何安排培训与引领呢？',
      },
      {
        speaker: 'A',
        fr: 'C’est beaucoup plus intimidant pour un débutant de poser une question par clavardage que de se tourner vers son voisin de bureau.',
        zh: '对于职场新人而言，通过即时聊天工具发信息问问题，可比转过身向工位旁的同事请教要拘谨难堪得多。',
      },
      {
        speaker: 'B',
        fr: 'Tu soulèves un point tout à fait légitime, et c’est précisément pourquoi le modèle tout virtuel n’est pas viable à long terme.',
        zh: '你提的这点非常有说服力，这正是完全虚拟办公模式在长远来看不可持续的原因。',
      },
      {
        speaker: 'B',
        fr: 'En revanche, une formule hybride bien structurée permet de combiner le meilleur des deux mondes sans imposer un carcan rigide.',
        zh: '相比之下，一套设计合理的混合办公机制，能兼顾两方面的优势，同时避免施加僵化死板的束缚。',
      },
      {
        speaker: 'A',
        fr: 'Comment articulerais-tu concrètement cette formule pour garantir que le temps passé au bureau en vaille la peine ?',
        zh: '那你具体会如何规划这套方案，以确保大家特意跑来办公室上班的这一天物有所值呢？',
      },
      {
        speaker: 'B',
        fr: 'On pourrait réserver les journées en présentiel exclusivement aux séances de remue-méninges, aux rétrospectives de projets et aux formations de groupe.',
        zh: '我们可以把到办公室上班的日子专门用于开展头脑风暴、项目复盘研讨以及集体培训。',
      },
      {
        speaker: 'B',
        fr: 'Et garder les journées à domicile pour le travail de fond en solo qui exige une concentration ininterrompue.',
        zh: '而把居家的日子留给需要心无旁骛、深度投入的独立钻研任务。',
      },
      {
        speaker: 'A',
        fr: 'Présenté de cette façon, cela donne une véritable raison d’être au déplacement et donne du sens à la présence physique.',
        zh: '如果这样安排的话，通勤就真正有了立足点，也赋予了线下当面沟通切实的意义。',
      },
      {
        speaker: 'B',
        fr: 'Exactement, il ne s’agit pas de surveiller les horaires des gens, mais d’optimiser la collaboration humaine tout en préservant le bien-être.',
        zh: '完全正确，重点不再是盯防员工的上下班考勤，而是在维护身心健康的同时最大化人际协同的效率。',
      },
      {
        speaker: 'A',
        fr: 'Je vais proposer cette approche au comité de direction lors de notre prochaine rencontre stratégique.',
        zh: '在下一次战略管理例会上，我打算把这个思路正式提交给管理层讨论。',
      },
    ],
    vocab: [
      { fr: 'présentiel', zh: '现场办公，线下实地' },
      { fr: 'effritement', zh: '逐渐瓦解，慢慢磨灭' },
      { fr: 'sentiment d’appartenance', zh: '归属感' },
      { fr: 'clavardage', zh: '实时在线文字聊天（魁北克标准词，对应 chat）' },
      { fr: 'carcan', zh: '束缚，枷锁' },
      { fr: 'remue-méninges', zh: '头脑风暴（法语规范用词）' },
      { fr: 'travail de fond', zh: '深度工作，基础性扎实工作' },
    ],
    questions: [
      {
        q: '为什么瓦莱丽认为完全远程办公在长远来看不可行？',
        choices: [
          '因为居家办公完全无法完成任何工作任务',
          '因为新人很难仅通过线上沟通得到有效指导与融入',
          '因为网络费用比租赁写字楼更昂贵',
          '因为公司规定所有人必须每天打卡八小时',
        ],
        answer: 1,
      },
      {
        q: '讨论中提出的理想混合办公方案是如何分配时间的？',
        choices: [
          '在办公室专注个人独立编程，回家集体开视频会议',
          '办公室专门用于头脑风暴与团队研讨，居家处理深度专注任务',
          '工作日全员在办公室开会，周末两天全员居家加班',
          '取消所有固定工位，由员工抽签决定是否上班',
        ],
        answer: 1,
      },
    ],
  },
]
