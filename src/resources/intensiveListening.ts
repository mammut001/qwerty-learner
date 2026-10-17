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
        fr: 'J’ai même osé commander entièrement en français auprès de la commis, et elle m’a comprise du premier coup !',
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
        choices: ['她找不到想买的热咖啡', '她成功用法语完成了点单', '店员完全听不懂她说的话', '她因为听不懂法语而感到沮丧'],
        answer: 1,
      },
      {
        q: '课堂上的教学安排包括什么？',
        choices: ['每天进行三小时的听力与会话练习', '每周只上一节语法测试课', '所有学员必须单独完成学术论文', '老师要求大家整天只能自学'],
        answer: 0,
      },
    ],
  },
  {
    id: 'appel-location-appartement',
    title: '在蒙特利尔租公寓打电话',
    titleFr: 'Appel pour louer un appartement à Montréal',
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
      { fr: 'trois et demi', zh: '一室一厅（魁北克房型：卧室、客厅、厨房各一间，“半间”指卫生间）' },
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
        choices: ['仅包含网络和电费', '包含暖气和热水', '包含停车位和全套家具', '不包含任何杂费'],
        answer: 1,
      },
      {
        q: '双方约定什么时候实地看房？',
        choices: ['周三上午十点', '周五傍晚六点', '周六下午两点左右', '下周一中午十二点'],
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
        choices: ['只穿一件极厚且笨重的纯棉大衣', '采用分层叠穿的洋葱式穿法', '冬天在室外绝不佩戴手套与帽子', '尽量不出门购买任何防寒衣物'],
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
        choices: ['一个月之后的电话回访', '下个月初的线上笔试通知', '本周五前通过电子邮件通知', '当天下午直接公布录用结果'],
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
        fr: 'Aujourd’hui, j’aimerais partager avec vous quelques réflexions sincères sur mon propre parcours d’intégration depuis mon arrivée en terre québécoise il y a cinq ans.',
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
        choices: ['独自在家里阅读历史书籍', '在街区食物济贫库参与志愿服务', '报名参加高额的商业俱乐部', '在网上论坛与陌生人辩论'],
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
  {
    id: 'pharmacie-conseils-symptomes',
    title: '在药房问药与症状',
    titleFr: 'Conseils et symptômes à la pharmacie',
    level: 'B1',
    topic: '健康与就医',
    speakers: {
      A: 'female',
      B: 'male',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour monsieur, j’ai la gorge très irritée et le nez bouché depuis hier soir.',
        zh: '您好先生，从昨天傍晚开始，我的喉咙就特别痛，而且鼻子也堵住了。',
      },
      {
        speaker: 'B',
        fr: 'Bonjour madame ! Avez-vous de la fièvre ou des courbatures dans tout le corps ?',
        zh: '您好女士！请问您发烧吗，或者全身有没有酸痛的感觉？',
      },
      {
        speaker: 'A',
        fr: 'J’ai pris ma température ce matin : j’avais seulement trente-sept point huit, donc pas de grosse fièvre.',
        zh: '我今天早上量了体温，只有三十七点八度，所以并没有发高烧。',
      },
      {
        speaker: 'B',
        fr: 'C’est rassurant. Est-ce que votre toux est sèche ou bien vous avez des sécrétions dans les bronches ?',
        zh: '那还挺让人安心的。请问您的咳嗽是干咳，还是支气管里有痰呢？',
      },
      {
        speaker: 'A',
        fr: 'C’est une toux plutôt sèche qui m’empêche de bien dormir la nuit.',
        zh: '主要是干咳，而且咳得我夜里都睡不好觉。',
      },
      {
        speaker: 'B',
        fr: 'Prenez-vous actuellement d’autres médicaments ou avez-vous des allergies à certaines molécules ?',
        zh: '您目前在服用其他药物吗，或者对某些药物成分过敏吗？',
      },
      {
        speaker: 'A',
        fr: 'Non, aucune allergie connue, et je ne prends aucun médicament régulier.',
        zh: '没有，没有已知的过敏史，平时也没有长期服用任何常规药物。',
      },
      {
        speaker: 'B',
        fr: 'Je vous suggère ce sirop antitussif en vente libre pour calmer les quintes de toux en soirée.',
        zh: '我建议您用这款非处方止咳糖浆，能有效缓解傍晚和夜间的剧烈咳嗽。',
      },
      {
        speaker: 'A',
        fr: 'Parfait. Quelle est la posologie recommandée pour ce sirop ?',
        zh: '好的。请问这款糖浆推荐的服用剂量是多少？',
      },
      {
        speaker: 'B',
        fr: 'Prenez une cuillère à soupe avant de vous coucher, mais pas plus de trois fois par jour.',
        zh: '睡前喝一大汤匙，但一天不要超过三次。',
      },
      {
        speaker: 'B',
        fr: 'Pour votre gorge, ces pastilles au miel et à l’eucalyptus apporteront un soulagement immédiat.',
        zh: '针对喉咙痛，这款蜂蜜桉树润喉糖能起到立竿见影的舒缓作用。',
      },
      {
        speaker: 'A',
        fr: 'Avez-vous aussi une solution saline pour nettoyer et décongestionner les voies nasales ?',
        zh: '您这里还有生理盐水喷雾吗，我想用来清洗鼻腔、缓解鼻塞？',
      },
      {
        speaker: 'B',
        fr: 'Oui, ce vaporisateur nasal d’eau de mer est très doux et nettoie efficacement sans accoutumance.',
        zh: '有的，这款海水鼻腔喷雾非常温和，清洁效果好且不会产生药物依赖性。',
      },
      {
        speaker: 'A',
        fr: 'Merci beaucoup pour vos précieux conseils, je vais prendre ces trois articles tout de suite.',
        zh: '非常感谢您的悉心建议，这三样东西我这就一起买下了。',
      },
      {
        speaker: 'B',
        fr: 'Si vos symptômes persistent plus de cinq jours, consultez un médecin sans tarder.',
        zh: '如果您的症状持续超过五天，请务必及时去就医看诊。',
      },
    ],
    vocab: [
      { fr: 'médicament en vente libre', zh: '非处方药（OTC 药物）' },
      { fr: 'quinte de toux', zh: '剧烈咳嗽，阵咳' },
      { fr: 'posologie', zh: '用药剂量与方法' },
      { fr: 'pastilles', zh: '润喉糖，含片' },
      { fr: 'décongestionner', zh: '消除充血，通鼻塞' },
      { fr: 'sans accoutumance', zh: '无成瘾性，不产生药物依赖' },
    ],
    questions: [
      {
        q: '顾客目前出现了哪些主要不适症状？',
        choices: ['喉咙痛、鼻塞以及影响睡眠的干咳', '持续多日的高烧和严重肺部感染', '剧烈的胃痛和药物过敏反应', '严重的腿部骨折和关节剧痛'],
        answer: 0,
      },
      {
        q: '药剂师对止咳糖浆给出了什么用药建议？',
        choices: ['必须每隔一个小时喝一次', '睡前喝一汤匙，一天不超过三次', '饭前与大量抗生素一同服用', '只能在清晨空腹时服用一次'],
        answer: 1,
      },
    ],
  },
  {
    id: 'astuces-transport-stm-montreal',
    title: '坐 STM 地铁与公交的小技巧',
    titleFr: 'Astuces pour prendre le métro et le bus de la STM',
    level: 'B1',
    topic: '交通与城市生活',
    speakers: {
      A: 'male',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Se déplacer en transport en commun à Montréal est à la fois économique, rapide et écologique.',
        zh: '在蒙特利尔乘坐公共交通出行，既经济实惠、快捷高效，又低碳环保。',
      },
      {
        speaker: 'A',
        fr: 'Pour commencer, procurez-vous une carte OPUS rechargeable dans une billetterie métropolitaine ou dans un dépanneur.',
        zh: '首先，你可以在大都会售票处或街角便利店办理一张可充值的 OPUS 交通卡。',
      },
      {
        speaker: 'A',
        fr: 'Vous pouvez charger des titres mensuels ou des carnets de dix passages selon vos habitudes de déplacement.',
        zh: '你可以根据自己的日常通勤习惯，充值月票或者十次票。',
      },
      {
        speaker: 'A',
        fr: 'Dans les stations de métro souterraines, les quatre lignes de couleur permettent de traverser l’île facilement.',
        zh: '在地下地铁站里，四条以不同颜色标识的地铁线能让你轻松穿行整座岛屿。',
      },
      {
        speaker: 'A',
        fr: 'Sur le quai, attendez derrière la ligne jaune et laissez toujours sortir les passagers avant d’embarquer.',
        zh: '在站台上，请在黄线后等候，并在上车前始终先礼让车内乘客下车。',
      },
      {
        speaker: 'A',
        fr: 'À l’intérieur de la rame, pensez à retirer votre sac à dos pour libérer de l’espace.',
        zh: '进入车厢后，记得取下双肩背包放在身前或脚下，以腾出更多站立空间。',
      },
      {
        speaker: 'A',
        fr: 'Pour le réseau des autobus, téléchargez une application comme Chrono afin de suivre les passages en temps réel.',
        zh: '乘坐公交车网络时，建议下载 Chrono 等应用程序，以便实时追踪公交班次的到达时间。',
      },
      {
        speaker: 'A',
        fr: 'Votre titre unitaire vous donne droit à une correspondance gratuite pendant une période de cent vingt minutes.',
        zh: '你的单程车票在一百二十分钟内享有一次免费换乘地铁或公交的权益。',
      },
      {
        speaker: 'A',
        fr: 'Il suffit de valider de nouveau votre carte sans que d’autres passages soient débités.',
        zh: '换乘时只需再次刷卡即可，系统不会扣除额外的乘车次数。',
      },
      {
        speaker: 'A',
        fr: 'Le soir, les femmes voyageant seules en autobus peuvent demander au chauffeur de descendre entre deux arrêts réguliers.',
        zh: '夜间独自搭乘公交的女性乘客，可以向司机申请在两个正规车站之间就近下车。',
      },
      {
        speaker: 'A',
        fr: 'Ce service permet d’accéder plus rapidement à son domicile et assure une meilleure sécurité nocturne.',
        zh: '这项服务让乘客能够更快到家，并提供了更有力的夜间人身安全保障。',
      },
      {
        speaker: 'A',
        fr: 'Pendant l’hiver, prévoyez toujours quelques minutes supplémentaires en cas de ralentissements causés par le verglas.',
        zh: '在冬季，由于路面结冰常会导致车辆减速，出行时请始终多预留几分钟。',
      },
      {
        speaker: 'A',
        fr: 'Avec ces quelques bonnes habitudes, vos déplacements montréalais deviendront agréables et sans aucun tracas.',
        zh: '养成这些良好的出行习惯，你在蒙特利尔的旅程就会变得舒适惬意、毫无烦恼。',
      },
      {
        speaker: 'A',
        fr: 'Bon voyage à toutes et à tous sur le magnifique réseau de notre métropole !',
        zh: '祝大家在我们美丽的大都市交通网络中出行愉快！',
      },
    ],
    vocab: [
      { fr: 'titre de transport', zh: '车票，乘车通票' },
      { fr: 'correspondance', zh: '换乘，转乘' },
      { fr: 'rame', zh: '地铁列车，车厢编组' },
      { fr: 'temps réel', zh: '实时，即时' },
      { fr: 'descendre entre deux arrêts', zh: '在两站之间就近下车（夜间安全服务）' },
      { fr: 'verglas', zh: '路面冻雨冰霜，黑冰' },
    ],
    questions: [
      {
        q: '乘客购买的单程票在多长时间内享有免费换乘权益？',
        choices: ['三十分钟内', '六十分钟内', '一百二十分钟内', '整整二十四小时内'],
        answer: 2,
      },
      {
        q: '文中提到公交车在夜间为女性单独出行乘客提供什么便利服务？',
        choices: ['免费提供出租车接送服务', '可申请在两个固定站台之间就近下车', '允许乘客在车厢内随意吸烟', '晚上八点之后免票乘车'],
        answer: 1,
      },
    ],
  },
  {
    id: 'appel-saaq-echange-permis',
    title: '预约 SAAQ 驾照换领',
    titleFr: 'Prise de rendez-vous pour échanger son permis à la SAAQ',
    level: 'B1',
    topic: '政务与证件办理',
    speakers: {
      A: 'male',
      B: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour, j’aimerais prendre rendez-vous pour échanger mon permis de conduire étranger contre un permis québécois.',
        zh: '您好，我想预约办理把外国驾照换领成魁北克驾照的手续。',
      },
      {
        speaker: 'B',
        fr: 'Bonjour monsieur ! Depuis combien de temps résidez-vous au Québec avec votre statut légal ?',
        zh: '您好先生！请问您持有合法居留身份在魁北克定居多久了？',
      },
      {
        speaker: 'A',
        fr: 'Je suis arrivé il y a trois mois avec une confirmation de résidence permanente.',
        zh: '我是三个月前持永久居民确认函抵达这里的。',
      },
      {
        speaker: 'B',
        fr: 'Très bien. Votre permis d’origine est-il toujours valide et rédigé en français ou en anglais ?',
        zh: '很好。请问您原国家的驾照目前是否仍在有效期内，是用法语或英语书写的吗？',
      },
      {
        speaker: 'A',
        fr: 'Il est valide, mais rédigé dans une autre langue avec une traduction officielle reconnue.',
        zh: '驾照是有效的，但原文是其他语种，不过我已经做了官方认可的正规翻译件。',
      },
      {
        speaker: 'B',
        fr: 'C’est parfait. Quels documents avez-vous pour prouver votre domicile actuel dans la province ?',
        zh: '那很好。请问您有哪些文件能证明您目前在本省的居住地址呢？',
      },
      {
        speaker: 'A',
        fr: 'J’ai une copie de mon bail de logement et une facture récente d’Hydro-Québec.',
        zh: '我有一份房屋租赁合同的副本，以及一张最近的魁北克电力公司账单。',
      },
      {
        speaker: 'B',
        fr: 'Ces deux preuves conviennent parfaitement pour vérifier votre résidence principale au Québec.',
        zh: '这两样证明材料完全合规，足以核实您在魁北克的主居住地。',
      },
      {
        speaker: 'A',
        fr: 'Est-ce que je devrai passer un examen théorique ou un test pratique sur route ?',
        zh: '请问我需要参加理论笔试，或者路上的实际驾驶考核吗？',
      },
      {
        speaker: 'B',
        fr: 'Selon le pays émetteur, vous pourriez seulement avoir un test visuel sommaire lors de l’entrevue.',
        zh: '根据原驾照核发国的不同，您在面谈时可能只需要接受一次基础视力测试。',
      },
      {
        speaker: 'A',
        fr: 'D’accord. Auriez-vous une plage horaire disponible au centre de services Henri-Bourassa ?',
        zh: '明白了。请问昂利-布拉萨服务中心近期有可预约的时间段吗？',
      },
      {
        speaker: 'B',
        fr: 'J’ai une place mardi prochain à neuf heures et demie du matin, est-ce convenable ?',
        zh: '我这里下周二上午九点半有一个空档，这个时间合适吗？',
      },
      {
        speaker: 'A',
        fr: 'C’est excellent, je réserve immédiatement cette date pour mon dossier d’échange.',
        zh: '太好了，我就直接定下这个时间来办理换领档案。',
      },
      {
        speaker: 'B',
        fr: 'N’oubliez pas d’apporter tous vos documents originaux lors de votre visite en succursale.',
        zh: '请别忘了在前往营业网点时，带齐所有相关文件材料的原件。',
      },
      {
        speaker: 'A',
        fr: 'C’est bien noté, merci beaucoup pour votre assistance courtoise et bonne journée !',
        zh: '记下了，非常感谢您礼貌周到的帮助，祝您今天愉快！',
      },
      {
        speaker: 'B',
        fr: 'Au plaisir monsieur, et au plaisir de vous servir à la SAAQ !',
        zh: '不客气先生，期待在 SAAQ 为您提供服务！',
      },
    ],
    vocab: [
      { fr: 'échange de permis', zh: '驾照换领，驾照互换' },
      { fr: 'statut légal', zh: '合法居留身份' },
      { fr: 'traduction officielle', zh: '官方认可的翻译文件' },
      { fr: 'preuve de domicile', zh: '居住地址证明' },
      { fr: 'plage horaire', zh: '预约时间段，档期' },
      { fr: 'succursale', zh: '服务网点，分局机构' },
    ],
    questions: [
      {
        q: '通话者使用哪两样材料作为魁北克居住证明？',
        choices: ['酒店发票与外国护照复印件', '租房合同以及魁北克电力公司账单', '银行信用卡以及地铁年票', '雇主证明信以及健身房会员卡'],
        answer: 1,
      },
      {
        q: '双方最终将预约时间定在什么时候？',
        choices: ['下周二上午九点半', '本周五下午四点整', '下个月初的周末', '当天下午两点十五分'],
        answer: 0,
      },
    ],
  },
  {
    id: 'conference-francais-quebecois-france',
    title: '魁北克法语与法国法语的差异',
    titleFr: 'Les particularités du français québécois face au français de France',
    level: 'B2',
    topic: '语言文化与社会历史',
    speakers: {
      A: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Chers participants, bienvenue à cette causerie consacrée aux richesses comparées du français québécois et du français hexagonal.',
        zh: '各位来宾，欢迎参加本次讲座，今天我们将共同探讨魁北克法语与法国本土法语的多元特色。',
      },
      {
        speaker: 'A',
        fr: 'Beaucoup de nouveaux arrivants s’étonnent des contrastes lexicaux et phonétiques rencontrés dès leurs premières interactions à Montréal.',
        zh: '许多初来乍到的新移民在蒙特利尔开展最初的日常交往时，都会对词汇与语音上的差异感到惊奇。',
      },
      {
        speaker: 'A',
        fr: 'Il faut d’abord rappeler que le français d’Amérique du Nord plonge ses racines au dix-septième siècle.',
        zh: '首先需要明确的是，北美法语的根基可以追溯到十七世纪的法兰西先民时期。',
      },
      {
        speaker: 'A',
        fr: 'Les colons venus de Normandie ou du Poitou ont apporté un parler qui a évolué de manière autonome.',
        zh: '来自诺曼底或普瓦图的定居先驱带来了各自的方言，并在大西洋彼岸自主独立地演变发展。',
      },
      {
        speaker: 'A',
        fr: 'Ainsi, certains termes perçus en Europe comme des archaïsmes demeurent ici d’un usage quotidien tout à fait naturel.',
        zh: '因此，一些在欧洲被视作古语的词汇，在魁北克至今仍是极其自然生动的日常用语。',
      },
      {
        speaker: 'A',
        fr: 'Par exemple, employer le mot barrer pour fermer à clé ou débarbouillette pour une petite serviette humide.',
        zh: '比如用 barrer 来表达“锁门”，或者用 débarbouillette 来指代洗脸擦手的小毛巾。',
      },
      {
        speaker: 'A',
        fr: 'Une autre divergence marquante concerne la création de néologismes pour résister aux emprunts massifs à la langue anglaise.',
        zh: '另一项引人注目的显著差异，在于创造新词以抵制对英语词汇的盲目照搬吸收。',
      },
      {
        speaker: 'A',
        fr: 'Tandis que la France adopte volontiers des mots comme shopping ou parking, le Québec privilégie magasinage et stationnement.',
        zh: '当法国人乐于借用 shopping 或 parking 时，魁北克则坚定推行 magasinage（购物）与 stationnement（停车场）。',
      },
      {
        speaker: 'A',
        fr: 'C’est d’ailleurs d’ici que proviennent les termes universels courriel ou clavardage, aujourd’hui diffusés dans toute la francophonie.',
        zh: '事实上，正是魁北克首创了 courriel（电子邮件）和 clavardage（在线聊天），并推广至整个法语圈。',
      },
      {
        speaker: 'A',
        fr: 'Sur le plan grammatical et discursif, le québécois familier emploie fréquemment la particule interrogative « tu ».',
        zh: '在语法与口语交流层面，魁北克通俗口语经常使用疑问语气助词 tu。',
      },
      {
        speaker: 'A',
        fr: 'Une formule comme « on part-tu ? » sert simplement à poser une question sans désigner directement l’interlocuteur.',
        zh: '像 on part-tu ?（我们出发吗？）这样的句式，纯粹用于增强疑问语气，并不特指对方“你”。',
      },
      {
        speaker: 'A',
        fr: 'Il ne s’agit nullement d’une version inférieure, mais plutôt d’une variante dynamique dotée d’une immense légitimité culturelle.',
        zh: '这绝非什么低人一等的语言形式，而是一种充满活力且具备深厚文化正统性的语言变体。',
      },
      {
        speaker: 'A',
        fr: 'Apprivoiser ces subtilités linguistiques constitue la plus belle passerelle vers une intégration harmonieuse et respectueuse.',
        zh: '熟悉并领会这些语言精髓，是通向和谐、受尊重的社会融入的最美桥梁。',
      },
      {
        speaker: 'A',
        fr: 'Je vous remercie pour votre attention et je réponds volontiers à toutes vos questions !',
        zh: '感谢各位的专注聆听，接下来我很乐意回答大家的任何提问！',
      },
    ],
    vocab: [
      { fr: 'français hexagonal', zh: '法国本土法语（六角国法语）' },
      { fr: 'archaïsme', zh: '古语词汇，古风用法' },
      { fr: 'débarbouillette', zh: '洗脸小毛巾，面巾（魁北克特色词）' },
      { fr: 'néologisme', zh: '新词，新造词' },
      { fr: 'emprunt linguistique', zh: '语言外来借词' },
      { fr: 'particule interrogative', zh: '疑问语气助词' },
      { fr: 'apprivoiser', zh: '逐渐熟悉，领会掌握' },
    ],
    questions: [
      {
        q: '讲座中指出魁北克在应对外来语借词方面有什么显著特点？',
        choices: [
          '大量直接借用英语日常词汇而不作修改',
          '积极创造规范的法语新词来替代英文借词',
          '禁止居民在公众场合使用任何现代词汇',
          '完全照搬法国本土最新流行的外来语',
        ],
        answer: 1,
      },
      {
        q: '魁北克口语中常出现的语气助词“tu”（如 on part-tu ?）起什么作用？',
        choices: [
          '表示严厉的警告与批评态度',
          '纯粹用于强化疑问语气而非指代第二人称',
          '用来强调某一动作已经彻底完成',
          '专门用于指称对话双方之外的第三方',
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 'litige-logement-mediation-tal',
    title: '租房纠纷与 TAL 调解',
    titleFr: 'Litige de logement et médiation devant le TAL',
    level: 'B2',
    topic: '法律权益与租房',
    speakers: {
      A: 'male',
      B: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bonjour, mon propriétaire vient de m’envoyer un avis d’augmentation de loyer de douze pour cent pour le prochain bail.',
        zh: '您好，我的房东刚刚给我发来一份下一年度租约涨租通知，租金涨幅居然高达百分之十二。',
      },
      {
        speaker: 'B',
        fr: 'C’est une hausse considérable qui dépasse largement les indices d’ajustement publiés par le Tribunal administratif du logement.',
        zh: '这个涨幅相当惊人，远远超出了魁北克房屋租赁法庭（TAL）公布的年度租金调整参考指标。',
      },
      {
        speaker: 'A',
        fr: 'En plus, il refuse de réparer une infiltration d’eau importante dans le plafond de ma salle de bain.',
        zh: '不仅如此，我浴室天花板有一处严重的渗漏水问题，他也一直推脱拒绝维修。',
      },
      {
        speaker: 'B',
        fr: 'Vous disposez d’un délai strict de trente jours après réception de l’avis pour notifier votre réponse par écrit.',
        zh: '在收到房东涨租通知后的三十天严格法定期限内，您必须通过书面形式作出明确答复。',
      },
      {
        speaker: 'A',
        fr: 'Est-ce que j’ai le droit de refuser l’augmentation tout en renouvelant mon bail pour une autre année ?',
        zh: '请问我有权在拒绝这一租金涨幅的同时，继续续签我下一年的租约吗？',
      },
      {
        speaker: 'B',
        fr: 'Absolument, c’est une protection fondamentale offerte à chaque locataire par le Code civil du Québec.',
        zh: '当然有权，这是《魁北克民法典》赋予每一位租客的最根本法律保障。',
      },
      {
        speaker: 'A',
        fr: 'Que se passera-t-il si le propriétaire persiste et refuse mon refus de hausse de loyer ?',
        zh: '如果房东坚持己见、不接受我拒绝涨租的决定，接下来会发生什么？',
      },
      {
        speaker: 'B',
        fr: 'Ce sera alors à lui de s’adresser au tribunal pour demander une fixation officielle du loyer.',
        zh: '届时必须由房东亲自向租赁法庭提出申请，要求法庭介入并裁定法定租金。',
      },
      {
        speaker: 'B',
        fr: 'Le tribunal utilise une grille rigoureuse basée sur les taxes municipales et les travaux réels d’amélioration.',
        zh: '法庭会根据市政地税的变动以及实际开展的房屋修缮开销，依据严谨的测算表来核定涨幅。',
      },
      {
        speaker: 'A',
        fr: 'Et concernant la moisissure et l’infiltration d’eau, quelle démarche juridique dois-je entreprendre en priorité ?',
        zh: '那么针对霉菌和渗水问题，我首要应该采取什么法律步骤呢？',
      },
      {
        speaker: 'B',
        fr: 'Vous devez lui transmettre une mise en demeure formelle par courrier recommandé avec signature à la réception.',
        zh: '您必须通过附带收条签收的挂号信，向房东送达一份正式的书面敦促催告函（mise en demeure）。',
      },
      {
        speaker: 'B',
        fr: 'Accordez-lui un délai raisonnable de dix jours pour faire intervenir un plombier qualifié dans votre logement.',
        zh: '给他设定十天的合理宽限期，要求其安排专业持证管道工上门为您检修房屋。',
      },
      {
        speaker: 'A',
        fr: 'Si nous ne trouvons pas d’accord, est-il possible d’opter pour une séance de médiation rapide ?',
        zh: '如果我们无法达成共识，是否可以选择开展一次快捷的调解会议？',
      },
      {
        speaker: 'B',
        fr: 'Oui, le service de conciliation du tribunal permet souvent de régler les différends sans audience contentieuse longue.',
        zh: '是的，租赁法庭的民事调解服务通常能帮助双方化解分歧，免去冗长繁琐的开庭对簿公堂。',
      },
      {
        speaker: 'A',
        fr: 'Je me sens beaucoup plus rassuré et je vais rédiger ces deux réponses dès cet après-midi.',
        zh: '我现在心里踏实多了，今天下午我就把这两份书面材料正式拟定好。',
      },
      {
        speaker: 'B',
        fr: 'N’hésitez pas à revenir nous voir avec vos brouillons pour que nous puissions les valider ensemble.',
        zh: '拟好初稿后随时欢迎您再来找我们，我们一起帮您核对把关。',
      },
    ],
    vocab: [
      { fr: 'avis d’augmentation', zh: '租金上涨通知书' },
      { fr: 'Tribunal administratif du logement', zh: '魁北克房屋租赁法庭（简称 TAL）' },
      { fr: 'fixation de loyer', zh: '法定租金核定 / 裁定' },
      { fr: 'mise en demeure', zh: '正式敦促催告函' },
      { fr: 'courrier recommandé', zh: '双挂号信件（带签收回执）' },
      { fr: 'conciliation', zh: '民事调解，协议和解' },
      { fr: 'audience contentieuse', zh: '争议诉讼庭审' },
    ],
    questions: [
      {
        q: '租客在收到房东的涨租通知后，法律规定的书面答复期限是多久？',
        choices: ['仅有四十八小时', '七天以内', '三十天以内', '六个月以内'],
        answer: 2,
      },
      {
        q: '针对天花板漏水和发霉问题，社区顾问建议租客首先采取什么行动？',
        choices: [
          '私自扣留全部房租并不再通知房东',
          '通过挂号信向房东发出带有期限的正式催告函',
          '立即搬离公寓并不支付任何费用',
          '在社交媒体上公开房东的个人联系电话',
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 'podcast-benevolat-tremplin-emploi',
    title: '志愿者经历如何帮助求职',
    titleFr: 'Le bénévolat comme tremplin professionnel au Québec',
    level: 'B2',
    topic: '职业发展与社会参与',
    speakers: {
      A: 'female',
    },
    sentences: [
      {
        speaker: 'A',
        fr: 'Bienvenue dans ce nouvel épisode de notre balado consacré aux stratégies d’insertion professionnelle sur le marché québécois.',
        zh: '欢迎收听本期播客节目，今天我们将聚焦探讨在魁北克就业市场中实现职业融入的有效策略。',
      },
      {
        speaker: 'A',
        fr: 'Pour beaucoup d’aspirants travailleurs, le manque d’expérience locale constitue une barrière parfois frustrante lors des démarches d’embauche.',
        zh: '对于很多求职者而言，缺乏本地工作经验往往是在应聘求职过程中令人沮丧的一道壁垒。',
      },
      {
        speaker: 'A',
        fr: 'On se heurte souvent à ce dilemme : comment obtenir un poste sans expérience locale préalable sur son profil ?',
        zh: '大家常常会陷入这样的两难困局：如果简历上缺乏本地经历，究竟该如何获得自己的第一份工作呢？',
      },
      {
        speaker: 'A',
        fr: 'L’engagement bénévole représente justement un levier extraordinaire pour briser ce cercle vicieux de façon constructive et valorisante.',
        zh: '投身志愿服务，恰恰是打破这一恶性循环、建立自我价值的绝佳抓手。',
      },
      {
        speaker: 'A',
        fr: 'En vous impliquant dans un organisme communautaire, vous mobilisez des compétences concrètes dans un cadre collaboratif authentique.',
        zh: '通过在社区公益组织中贡献力量，你能在真实的团队协作环境中充分调动并锻炼实操技能。',
      },
      {
        speaker: 'A',
        fr: 'Que ce soit la coordination logistique ou la communication numérique, ces mandats témoignent directement de votre savoir-faire.',
        zh: '无论是活动后勤协调还是数字化宣传沟通，这些具体实践任务都能直观体现你的专业素养。',
      },
      {
        speaker: 'A',
        fr: 'De surcroît, le bénévolat permet de bâtir un réseau de contacts professionnels de manière tout à fait spontanée.',
        zh: '此外，参与义工活动还能以非常自然真诚的方式，逐步搭建起本地的人脉网络。',
      },
      {
        speaker: 'A',
        fr: 'Vos superviseurs ou vos pairs deviennent d’excellentes références pour appuyer vos futures candidatures auprès des recruteurs québécois.',
        zh: '你的团队主管或志愿伙伴，都将成为日后向魁北克招聘官力荐你的人选证明人。',
      },
      {
        speaker: 'A',
        fr: 'C’est également une occasion privilégiée de parfaire votre aisance linguistique dans des situations quotidiennes de travail réel.',
        zh: '这同时也是在真实的职场日常情境中磨练语言表达、提升流利自信的绝佳契机。',
      },
      {
        speaker: 'A',
        fr: 'Sur votre curriculum vitæ, n’hésitez pas à intégrer vos réalisations bénévoles sous la rubrique des expériences pertinentes.',
        zh: '在个人简历中，不妨大胆地将志愿服务的亮眼成绩列入“相关经历”一栏。',
      },
      {
        speaker: 'A',
        fr: 'Décrivez des résultats tangibles avec des verbes d’action pour capter immédiatement l’attention des comités de sélection.',
        zh: '运用生动的行动动词，量化并描述切实成果，以便迅速抓住选拔委员会的眼球。',
      },
      {
        speaker: 'A',
        fr: 'Lors de l’entrevue, illustrez votre polyvalence et votre esprit d’initiative grâce à ces anecdotes de terrain mémorables.',
        zh: '在面试过程中，通过这些令人印象深刻的实战故事，生动展现你的多面能力与主动开拓精神。',
      },
      {
        speaker: 'A',
        fr: 'Au Québec, l’altruisme et la contribution à la collectivité sont perçus comme des indicateurs d’intelligence relationnelle forte.',
        zh: '在魁北克，利他精神和对社区公共利益的贡献，被广泛视为具备出众情商与人际交往能力的标志。',
      },
      {
        speaker: 'A',
        fr: 'Choisissez une cause qui résonne avec vos valeurs pour transformer votre générosité en un formidable tremplin de carrière.',
        zh: '选择一项与你价值观产生共鸣的公益事业吧，将你的善意奉献转化为职场腾飞的坚实跳板。',
      },
      {
        speaker: 'A',
        fr: 'Merci de votre écoute, et rendez-vous la semaine prochaine pour d’autres conseils inspirants sur notre balado !',
        zh: '感谢大家的收听，下周同一时间请继续锁定我们的播客，获取更多富有启发性的职场建议！',
      },
    ],
    vocab: [
      { fr: 'balado', zh: '播客，音频广播节目（魁北克规范用词）' },
      { fr: 'levier', zh: '杠杆，抓手，推动手段' },
      { fr: 'cercle vicieux', zh: '恶性循环' },
      { fr: 'références professionnelles', zh: '推荐人，背调推荐证明' },
      { fr: 'aisance linguistique', zh: '语言流利自如度' },
      { fr: 'polyvalence', zh: '多面手能力，综合适应力' },
      { fr: 'tremplin', zh: '跳板，腾飞发展契机' },
    ],
    questions: [
      {
        q: '根据播客内容，志愿服务如何帮助求职者突破“缺乏本地工作经验”的困境？',
        choices: [
          '支付高额费用直接购买正式员工聘书',
          '在实际协作中积累技能、结识人脉并获取本地推荐人',
          '允许求职者在简历中虚构全职工作经历',
          '替代所有学历认证与签证审核手续',
        ],
        answer: 1,
      },
      {
        q: '节目建议求职者在个人简历中如何呈现义工经历？',
        choices: [
          '隐藏所有志愿经历，只字不提',
          '将义工经历放在家庭生活兴趣一栏',
          '使用行动动词将成果写在“相关经历”一栏',
          '只能在面试被问到时口头顺便提一句',
        ],
        answer: 2,
      },
    ],
  },
]
