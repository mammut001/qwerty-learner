// Production tasks for writing and speaking, one per Échelle level.
// Writing is checked by word count + 3 self-checks. Speaking by recorded seconds + 3 self-checks.
export const WRITING_TASKS = [
  { level: 1, wordMin: 5, promptZh: '请用法语写一句自我介绍（名字、国籍或职业）。', promptFr: 'Écrivez une phrase pour vous présenter (nom, nationalité ou profession).', selfChecks: ['我使用了本课学的问候/个人信息词汇。', '我检查了名词的阴阳性和大小写。', '我写的句子不需要借助翻译工具。'] },
  { level: 2, wordMin: 15, promptZh: '写一段简短的留言，记录一家商店的营业时间和你想买的两样东西。', promptFr: 'Rédigez un court message avec les heures d’ouverture d’un magasin et deux articles que vous voulez acheter.', selfChecks: ['我用了现在时。', '我使用了时间/方位表达。', '我自己重读了一遍，没有明显错误。'] },
  { level: 3, wordMin: 30, promptZh: '给你的朋友写一条短信：描述你新买的衣服或你上周末做的事。', promptFr: 'Écrivez un texto à un ami : décrivez un vêtement que vous avez acheté ou ce que vous avez fait la fin de semaine dernière.', selfChecks: ['我用了过去时的基本形式。', '我用了描写人或物的形容词。', '意思清楚，不需要别人再解释。'] },
  { level: 4, wordMin: 60, promptZh: '写一封邮件向房东询问租房信息，或写一段关于一次小意外的原因。', promptFr: 'Rédigez un courriel au propriétaire pour demander des informations sur un logement, ou expliquez les causes d’un petit incident.', selfChecks: ['我用了简单从句（que, parce que, quand）。', '我按时间或逻辑顺序组织内容。', '我检查了主语、动词变位和性数配合。'] },
  { level: 5, wordMin: 100, promptZh: '写一封建议信或一段个人经历：向朋友介绍一次旅行/一次决定。', promptFr: 'Rédigez une lettre de suggestion ou un récit d’expérience personnelle à un ami.', selfChecks: ['我用了不同的连接词（ensuite, cependant, c’est pourquoi）。', '我用了复合过去时/未完成过去时的基本搭配。', '我的文字有几个段落，结构清晰。'] },
  { level: 6, wordMin: 150, promptZh: '写一段关于时事或身边事件的详细描述，表达你的情绪和看法。', promptFr: 'Rédigez une description détaillée d’un événement d’actualité ou de la vie quotidienne, en exprimant vos émotions et votre opinion.', selfChecks: ['我用了丰富的细节和例子。', '我用了条件式或虚拟式表达假设/意愿。', '我重读后修正了配合、时态和标点错误。'] },
  { level: 7, wordMin: 200, promptZh: '写一篇 1–2 页的说明或评论：介绍你熟悉的魁北克社会话题。', promptFr: 'Rédigez un texte d’une ou deux pages : informez ou commentez un sujet québécois qui vous intéresse.', selfChecks: ['我使用了复杂句（si, bien que, dont, ce qui）。', '我区分了事实与个人观点。', '我的词汇和表达与主题匹配。'] },
  { level: 8, wordMin: 250, promptZh: '写一篇结构清晰的文章：总结一篇文章/一次演讲，并给出自己的看法。', promptFr: 'Rédigez un texte structuré : résumez un article ou une conférence, puis donnez votre opinion.', selfChecks: ['我的文章有引言、正文和结论。', '我用了论证连接词（de plus, en revanche, ainsi）。', '我的时态、语式配合正确。'] },
  { level: 9, wordMin: 300, promptZh: '在你专业或兴趣领域写一篇文章：解释一个概念、流程或争议点。', promptFr: 'Rédigez un texte dans votre domaine d’expertise ou d’intérêt : expliquez un concept, une procédure ou une controverse.', selfChecks: ['我用了领域专业词汇。', '我用了直接/间接引语和资料来源表达。', '我的文章逻辑连贯，论证完整。'] },
  { level: 10, wordMin: 350, promptZh: '写一篇分析性文章：比较两种观点并就一个专业议题提出论证。', promptFr: 'Rédigez un texte analytique : comparez deux points de vue et argumentez sur une question de votre domaine.', selfChecks: ['我准确使用了条件过去时、虚拟式过去时等复杂时态。', '我的文章有明确的论点和反驳。', '我使用了恰当的代词和替代词以避免重复。'] },
  { level: 11, wordMin: 400, promptZh: '就一个跨学科议题（如科技、环境、社会公正）写一篇深入评论。', promptFr: 'Rédigez une réflexion approfondie sur un enjeu pluridisciplinaire.', selfChecks: ['我处理了抽象概念和细微差别。', '我用了修辞、假设、让步等复杂结构。', '我的语言风格适合正式书面语。'] },
  { level: 12, wordMin: 450, promptZh: '写一篇综合性文章：将多个领域的信息整合，表达有创意的观点或立场。', promptFr: 'Rédigez un texte de synthèse : intégrez des informations de plusieurs domaines et exprimez une position originale.', selfChecks: ['我能够跨领域建立联系。', '我的文章有独创性，同时论证严密。', '我自如运用了各种语法和篇章工具。'] },
]

export const SPEAKING_TASKS = [
  { level: 1, secondsMin: 10, promptZh: '用法语做一段自我介绍：名字、来自哪里、职业。', promptFr: 'Présentez-vous : nom, origine, profession.', selfChecks: ['我大声说出了至少三句话。', '我使用了本课的问候/个人信息表达。', '我尽量不用翻译。'] },
  { level: 2, secondsMin: 20, promptZh: '模拟在商店问路或询问营业时间。', promptFr: 'Demandez votre chemin ou les heures d’ouverture dans un magasin.', selfChecks: ['我用了现在时和简单疑问句。', '我用了礼貌用语（s’il vous plaît, excusez-moi）。', '我说的话能被听懂。'] },
  { level: 3, secondsMin: 30, promptZh: '描述一个人（外貌/性格）或一次周末活动计划。', promptFr: 'Décrivez une personne (physique/personnalité) ou vos projets pour la fin de semaine.', selfChecks: ['我用了描写性形容词。', '我用了时间连接词（d’abord, ensuite）。', '我说得比只用单词要连贯。'] },
  { level: 4, secondsMin: 45, promptZh: '讲述一次日常小问题（迟到、迷路、丢东西）并解释原因。', promptFr: 'Racontez un petit problème quotidien et expliquez-en les causes.', selfChecks: ['我用了复合过去时。', '我解释了原因（parce que, à cause de）。', '我的叙述有开始和结尾。'] },
  { level: 5, secondsMin: 60, promptZh: '给一段建议或讲述一次个人经历（旅行、工作、决定）。', promptFr: 'Donnez des conseils ou racontez une expérience personnelle.', selfChecks: ['我讲了一个完整的小故事或给出了明确建议。', '我用了不同的连接词。', '我的句子有主有次。'] },
  { level: 6, secondsMin: 90, promptZh: '详细描述一个你参加过的活动或一个你做的决定，并表达感受。', promptFr: 'Décrivez en détail une activité à laquelle vous avez participé ou une décision que vous avez prise, en exprimant vos sentiments.', selfChecks: ['我提供了具体细节（时间、地点、人物、原因）。', '我用了未完成过去时和复合过去时的搭配。', '我清楚表达了自己的情绪。'] },
  { level: 7, secondsMin: 120, promptZh: '就一个社会话题（教育、环境、健康）发表简短评论。', promptFr: 'Faites un bref exposé sur un sujet de société.', selfChecks: ['我组织了引言、观点和结论。', '我区分了事实与个人意见。', '我用了复杂句（bien que, si, ce qui）。'] },
  { level: 8, secondsMin: 150, promptZh: '总结一篇文章或一个事件，并明确表达你的立场。', promptFr: 'Résumez un article ou un événement et exprimez clairement votre position.', selfChecks: ['我的表达有结构（首先、然后、结论）。', '我用了论证连接词。', '我的发音和语法错误不影响理解。'] },
  { level: 9, secondsMin: 180, promptZh: '就你专业/兴趣领域的一个流程或争议进行口头解释。', promptFr: 'Expliquez oralement une procédure ou une controverse dans votre domaine.', selfChecks: ['我用了专业词汇。', '我能给出例子和数据支持。', '我的逻辑清楚，衔接自然。'] },
  { level: 10, secondsMin: 210, promptZh: '就一个专业议题进行论证：提出观点、反驳反方、总结。', promptFr: 'Argumentez sur une question de votre domaine : thèse, objection, synthèse.', selfChecks: ['我的论证环环相扣。', '我用了虚拟式、条件式等高级结构。', '我能根据假设进行推理。'] },
  { level: 11, secondsMin: 240, promptZh: '就一个跨学科复杂议题发表深入看法，并处理抽象概念。', promptFr: 'Donnez un exposé approfondi sur un enjeu pluridisciplinaire.', selfChecks: ['我整合了多个领域的观点。', '我表达了细微差别和隐含意义。', '我的语言正式、连贯、有说服力。'] },
  { level: 12, secondsMin: 270, promptZh: '就一个具有争议性的跨领域话题进行辩论式发言，并创造性地表达立场。', promptFr: 'Prenez la parole de façon argumentée et créative sur un sujet polémique.', selfChecks: ['我能即兴回应复杂论点。', '我使用了修辞和复杂语法。', '我的发言有影响力，逻辑严密。'] },
]

// Full authentic task pools extracted from the official Échelle québécoise (2023 edition) situations types.
export const WRITING_TASK_POOLS = {
  "1": [
    {
      "id": "n1-writing-prod-1",
      "level": 1,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N1 写作情境 1（信息告知）",
      "promptFr": "Transcrit des mots ou des phrases très brèves liés à des besoins immédiats. (Exemples officiels : Transcrire le nom et le numéro de téléphone d’un dentiste en vue de prendre un rendez-vous. / Transcrire des renseignements sur une personne-ressource à consulter pour s’inscrire à un service d’impôts.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：抄写与即时需求相关的单词或极短句子。参考情境：Transcrire le nom et le numéro de téléphone d’un dentiste en vue de prendre un rendez-vous. / Transcrire des renseignements sur une personne-ressource à consulter pour s’inscrire à un service d’impôts.",
      "wordMin": 5,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Transcrire le nom et le numéro de téléphone d’un dentiste en vue de prendre un rendez-vous.",
        "Transcrire des renseignements sur une personne-ressource à consulter pour s’inscrire à un service d’impôts."
      ]
    },
    {
      "id": "n1-writing-prod-2",
      "level": 1,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N1 写作情境 2（信息告知）",
      "promptFr": "Transcrit dans un formulaire d’identification très simple et bref des données personnelles. (Exemples officiels : Transcrire son adresse sur un bon de livraison à l’épicerie. / Remplir un formulaire d’abonnement à la bibliothèque de son quartier.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：在极简单的身份表格中填写个人信息。参考情境：Transcrire son adresse sur un bon de livraison à l’épicerie. / Remplir un formulaire d’abonnement à la bibliothèque de son quartier.",
      "wordMin": 5,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Transcrire son adresse sur un bon de livraison à l’épicerie.",
        "Remplir un formulaire d’abonnement à la bibliothèque de son quartier."
      ]
    },
    {
      "id": "n1-writing-prod-3",
      "level": 1,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N1 写作情境 3（情感交际）",
      "promptFr": "Écrit quelques formules mémorisées pour saluer ou remercier. (Exemples officiels : Écrire des salutations à une collègue dans un bref texto. / Écrire des remerciements à un ami.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写几句背熟的问候或感谢语。参考情境：Écrire des salutations à une collègue dans un bref texto. / Écrire des remerciements à un ami.",
      "wordMin": 5,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Écrire des salutations à une collègue dans un bref texto.",
        "Écrire des remerciements à un ami."
      ]
    }
  ],
  "2": [
    {
      "id": "n2-writing-prod-1",
      "level": 2,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 写作情境 1（信息告知）",
      "promptFr": "Prend en note des renseignements très simples et brefs. (Exemples officiels : Noter la date, l’heure et le lieu d’un rendez-vous avec une connaissance. / Noter le nom et l’adresse d’un salon de coiffure.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：记下极简短的信息。参考情境：Noter la date, l’heure et le lieu d’un rendez-vous avec une connaissance. / Noter le nom et l’adresse d’un salon de coiffure.",
      "wordMin": 15,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Noter la date, l’heure et le lieu d’un rendez-vous avec une connaissance.",
        "Noter le nom et l’adresse d’un salon de coiffure."
      ]
    },
    {
      "id": "n2-writing-prod-2",
      "level": 2,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 写作情境 2（信息告知）",
      "promptFr": "Remplit des formulaires d’identification très simples et brefs. (Exemples officiels : Remplir un formulaire d’identification pour s’inscrire à un cours de français. / Remplir un formulaire de changement d’adresse dans son lieu de formation.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：填写极简短的身份表格。参考情境：Remplir un formulaire d’identification pour s’inscrire à un cours de français. / Remplir un formulaire de changement d’adresse dans son lieu de formation.",
      "wordMin": 15,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Remplir un formulaire d’identification pour s’inscrire à un cours de français.",
        "Remplir un formulaire de changement d’adresse dans son lieu de formation."
      ]
    },
    {
      "id": "n2-writing-prod-3",
      "level": 2,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 写作情境 3（信息告知）",
      "promptFr": "Utilise quelques symboles ou abréviations liés à des besoins immédiats. (Exemples officiels : Utiliser des symboles pour noter le prix et la quantité de différents produits alimentaires. / Utiliser des abréviations liées à l’adresse.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：使用与即时需求相关的几个符号或缩写。参考情境：Utiliser des symboles pour noter le prix et la quantité de différents produits alimentaires. / Utiliser des abréviations liées à l’adresse.",
      "wordMin": 15,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Utiliser des symboles pour noter le prix et la quantité de différents produits alimentaires.",
        "Utiliser des abréviations liées à l’adresse."
      ]
    },
    {
      "id": "n2-writing-prod-4",
      "level": 2,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 写作情境 4（信息告知）",
      "promptFr": "Dispose des renseignements selon les conventions de présentation de documents très simples et brefs. (Exemples officiels : Libeller un chèque pour payer son loyer à la propriétaire. / Adresser une enveloppe pour envoyer une carte d’anniversaire à un proche.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：按极简短文件的格式规范排列信息（如支票、信封）。参考情境：Libeller un chèque pour payer son loyer à la propriétaire. / Adresser une enveloppe pour envoyer une carte d’anniversaire à un proche.",
      "wordMin": 15,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Libeller un chèque pour payer son loyer à la propriétaire.",
        "Adresser une enveloppe pour envoyer une carte d’anniversaire à un proche."
      ]
    },
    {
      "id": "n2-writing-prod-5",
      "level": 2,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N2 写作情境 5（情感交际）",
      "promptFr": "Écrit des remerciements ou des souhaits très simples et brefs. (Exemples officiels : Écrire un message de remerciement à sa voisine pour un service rendu. / Écrire un message pour féliciter son ami à l’occasion de la naissance de son enfant.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写极简短的感谢或祝愿。参考情境：Écrire un message de remerciement à sa voisine pour un service rendu. / Écrire un message pour féliciter son ami à l’occasion de la naissance de son enfant.",
      "wordMin": 15,
      "selfChecks": [
        "我书写了符合要求的单词或简单短句。",
        "我注意了大小写与基本拼写。",
        "信息准确表达了目标内容。"
      ],
      "situations": [
        "Écrire un message de remerciement à sa voisine pour un service rendu.",
        "Écrire un message pour féliciter son ami à l’occasion de la naissance de son enfant."
      ]
    }
  ],
  "3": [
    {
      "id": "n3-writing-prod-1",
      "level": 3,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes simples et brefs pour informer sur des activités ou des services de la vie quotidienne. (Exemples officiels : Rédiger un message pour répondre à une invitation à une fête d’anniversaire. / Rédiger un avis de recherche pour retrouver un objet perdu dans son immeuble.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写简单简短的文字介绍日常活动或服务。参考情境：Rédiger un message pour répondre à une invitation à une fête d’anniversaire. / Rédiger un avis de recherche pour retrouver un objet perdu dans son immeuble.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un message pour répondre à une invitation à une fête d’anniversaire.",
        "Rédiger un avis de recherche pour retrouver un objet perdu dans son immeuble."
      ]
    },
    {
      "id": "n3-writing-prod-2",
      "level": 3,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 写作情境 2（信息告知）",
      "promptFr": "Remplit des formulaires simples et brefs. (Exemples officiels : Remplir un formulaire pour inscrire son enfant au camp de jour du quartier. / Remplir un formulaire de demande d’emploi pour un poste dans un commerce de détail.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：填写简单简短的表格。参考情境：Remplir un formulaire pour inscrire son enfant au camp de jour du quartier. / Remplir un formulaire de demande d’emploi pour un poste dans un commerce de détail.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Remplir un formulaire pour inscrire son enfant au camp de jour du quartier.",
        "Remplir un formulaire de demande d’emploi pour un poste dans un commerce de détail."
      ]
    },
    {
      "id": "n3-writing-prod-3",
      "level": 3,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 写作情境 3（信息告知）",
      "promptFr": "Rédige des textes simples et brefs sur des activités à venir. (Exemples officiels : Rédiger un texto pour faire part de ses projets de vacances à une amie. / Rédiger un message pour préciser ses disponibilités à venir sur le groupe de messagerie instantanée du personnel.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写简单简短的文字介绍即将进行的活动。参考情境：Rédiger un texto pour faire part de ses projets de vacances à une amie. / Rédiger un message pour préciser ses disponibilités à venir sur le groupe de messagerie instantanée du personnel.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un texto pour faire part de ses projets de vacances à une amie.",
        "Rédiger un message pour préciser ses disponibilités à venir sur le groupe de messagerie instantanée du personnel."
      ]
    },
    {
      "id": "n3-writing-prod-4",
      "level": 3,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 写作情境 4（信息告知）",
      "promptFr": "Rédige des textes simples et brefs pour décrire une personne, un objet ou un état. (Exemples officiels : Rédiger un texte pour décrire un objet à vendre sur un site Web de petites annonces. / Rédiger un message sur un réseau social pour décrire son nouveau quartier à un ami.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写简单简短的文字描述人、物或状态。参考情境：Rédiger un texte pour décrire un objet à vendre sur un site Web de petites annonces. / Rédiger un message sur un réseau social pour décrire son nouveau quartier à un ami.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un texte pour décrire un objet à vendre sur un site Web de petites annonces.",
        "Rédiger un message sur un réseau social pour décrire son nouveau quartier à un ami."
      ]
    },
    {
      "id": "n3-writing-prod-5",
      "level": 3,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 写作情境 5（信息告知）",
      "promptFr": "Prend en note des renseignements simples et brefs liés à des indications à suivre. (Exemples officiels : Noter des indications pour se rendre à la bibliothèque du quartier. / Noter quelques tâches à effectuer au travail avant la fin de la journée.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：记下与路线、任务等指示相关的简短信息。参考情境：Noter des indications pour se rendre à la bibliothèque du quartier. / Noter quelques tâches à effectuer au travail avant la fin de la journée.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Noter des indications pour se rendre à la bibliothèque du quartier.",
        "Noter quelques tâches à effectuer au travail avant la fin de la journée."
      ]
    },
    {
      "id": "n3-writing-prod-6",
      "level": 3,
      "taskIndex": 6,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N3 写作情境 6（情感交际）",
      "promptFr": "Rédige des compliments ou des souhaits simples et brefs. (Exemples officiels : Rédiger un texto pour complimenter une amie sur ses talents culinaires. / Rédiger un message dans une carte pour féliciter un collègue de son nouvel emploi.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写简单简短的称赞或祝愿。参考情境：Rédiger un texto pour complimenter une amie sur ses talents culinaires. / Rédiger un message dans une carte pour féliciter un collègue de son nouvel emploi.",
      "wordMin": 35,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un texto pour complimenter une amie sur ses talents culinaires.",
        "Rédiger un message dans une carte pour féliciter un collègue de son nouvel emploi."
      ]
    }
  ],
  "4": [
    {
      "id": "n4-writing-prod-1",
      "level": 4,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N4 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes simples pour informer sur des besoins courants. (Exemples officiels : Rédiger un courriel pour présenter ses services. / Remplir un formulaire médical chez une professionnelle de la santé.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写简单文字说明日常需求。参考情境：Rédiger un courriel pour présenter ses services. / Remplir un formulaire médical chez une professionnelle de la santé.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un courriel pour présenter ses services.",
        "Remplir un formulaire médical chez une professionnelle de la santé."
      ]
    },
    {
      "id": "n4-writing-prod-2",
      "level": 4,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N4 写作情境 2（信息告知）",
      "promptFr": "Rédige des textes simples pour décrire des activités ou des problèmes courants. (Exemples officiels : Rédiger un courriel pour décrire une fête familiale à une connaissance. / Rédiger un message par clavardage pour décrire un problème de connexion Internet au service à la clientèle de son fournisseur.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写简单文字描述日常活动或问题。参考情境：Rédiger un courriel pour décrire une fête familiale à une connaissance. / Rédiger un message par clavardage pour décrire un problème de connexion Internet au service à la clientèle de son fournisseur.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un courriel pour décrire une fête familiale à une connaissance.",
        "Rédiger un message par clavardage pour décrire un problème de connexion Internet au service à la clientèle de son fournisseur."
      ]
    },
    {
      "id": "n4-writing-prod-3",
      "level": 4,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N4 写作情境 3（事件叙述）",
      "promptFr": "Rédige des textes simples pour raconter des anecdotes ou des activités courantes. (Exemples officiels : Rédiger, par clavardage avec une proche, une anecdote sur son arrivée au Québec. / Rédiger un courriel pour raconter à un ami le déroulement d’une activité hivernale.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写简单文字讲述日常趣事或活动。参考情境：Rédiger, par clavardage avec une proche, une anecdote sur son arrivée au Québec. / Rédiger un courriel pour raconter à un ami le déroulement d’une activité hivernale.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger, par clavardage avec une proche, une anecdote sur son arrivée au Québec.",
        "Rédiger un courriel pour raconter à un ami le déroulement d’une activité hivernale."
      ]
    },
    {
      "id": "n4-writing-prod-4",
      "level": 4,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N4 写作情境 4（阐释分析）",
      "promptFr": "Rédige des textes simples pour expliquer les causes d’un problème courant. (Exemples officiels : Rédiger un courriel pour expliquer à son supérieur la cause d’un retard au travail. / Rédiger une note pour expliquer l’absence de son enfant à l’école.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写简单文字解释日常问题的原因。参考情境：Rédiger un courriel pour expliquer à son supérieur la cause d’un retard au travail. / Rédiger une note pour expliquer l’absence de son enfant à l’école.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un courriel pour expliquer à son supérieur la cause d’un retard au travail.",
        "Rédiger une note pour expliquer l’absence de son enfant à l’école."
      ]
    },
    {
      "id": "n4-writing-prod-5",
      "level": 4,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N4 写作情境 5（指示规程）",
      "promptFr": "Rédige des consignes simples indiquant quelques étapes. (Exemples officiels : Rédiger un aide-mémoire destiné à la personne prenant soin de ses enfants pour la soirée. / Rédiger les étapes d’une recette de cuisine pour la partager avec un collègue.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：写出包含几个步骤的简单指令。参考情境：Rédiger un aide-mémoire destiné à la personne prenant soin de ses enfants pour la soirée. / Rédiger les étapes d’une recette de cuisine pour la partager avec un collègue.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un aide-mémoire destiné à la personne prenant soin de ses enfants pour la soirée.",
        "Rédiger les étapes d’une recette de cuisine pour la partager avec un collègue."
      ]
    },
    {
      "id": "n4-writing-prod-6",
      "level": 4,
      "taskIndex": 6,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N4 写作情境 6（情感交际）",
      "promptFr": "Rédige des textes simples pour exprimer des préférences, des souhaits ou une appréciation sommaire. (Exemples officiels : Rédiger un texto pour signifier à une amie sa préférence concernant une escapade de fin de semaine. / Rédiger une appréciation sommaire sur le site Web d’un hôtel.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写简单文字表达偏好、愿望或简单评价。参考情境：Rédiger un texto pour signifier à une amie sa préférence concernant une escapade de fin de semaine. / Rédiger une appréciation sommaire sur le site Web d’un hôtel.",
      "wordMin": 60,
      "selfChecks": [
        "我使用了简单连接词（et, mais, parce que）。",
        "我注意了动词现在时或复合过去时变位。",
        "我检查了名词与形容词的性数配合。"
      ],
      "situations": [
        "Rédiger un texto pour signifier à une amie sa préférence concernant une escapade de fin de semaine.",
        "Rédiger une appréciation sommaire sur le site Web d’un hôtel."
      ]
    }
  ],
  "5": [
    {
      "id": "n5-writing-prod-1",
      "level": 5,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N5 写作情境 1（信息告知）",
      "promptFr": "Rédige de courts textes pour fournir l’essentiel d’informations liées à des sujets courants. (Exemples officiels : Rédiger un message par clavardage pour informer une amie de la création d’une halte-garderie au centre communautaire de son quartier. / Rédiger un courriel pour informer ses collègues de la disponibilité d’un stagiaire pour les assister dans certaines tâches.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写短文提供常见话题信息的要点。参考情境：Rédiger un message par clavardage pour informer une amie de la création d’une halte-garderie au centre communautaire de son quartier. / Rédiger un courriel pour informer ses collègues de la disponibilité d’un stagiaire pour les assister dans certaines tâches.",
      "wordMin": 100,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un message par clavardage pour informer une amie de la création d’une halte-garderie au centre communautaire de son quartier.",
        "Rédiger un courriel pour informer ses collègues de la disponibilité d’un stagiaire pour les assister dans certaines tâches."
      ]
    },
    {
      "id": "n5-writing-prod-2",
      "level": 5,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N5 写作情境 2（事件叙述）",
      "promptFr": "Rédige de courts textes pour décrire l’essentiel d’une situation ou d’un évènement courants. (Exemples officiels : Rédiger un courriel à l’intention d’une proche pour décrire une compétition sportive à laquelle ses enfants ont participé. / Rédiger un courriel pour décrire à un ami la fête nationale d’un pays visité.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写短文描述常见情境或事件的要点。参考情境：Rédiger un courriel à l’intention d’une proche pour décrire une compétition sportive à laquelle ses enfants ont participé. / Rédiger un courriel pour décrire à un ami la fête nationale d’un pays visité.",
      "wordMin": 100,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel à l’intention d’une proche pour décrire une compétition sportive à laquelle ses enfants ont participé.",
        "Rédiger un courriel pour décrire à un ami la fête nationale d’un pays visité."
      ]
    },
    {
      "id": "n5-writing-prod-3",
      "level": 5,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N5 写作情境 3（事件叙述）",
      "promptFr": "Rédige de courts textes pour raconter une expérience personnelle. (Exemples officiels : Rédiger un courriel pour raconter à un proche le déroulement de sa première journée au travail. / Rédiger, dans un forum de discussion, un message pour raconter une sortie familiale dans un verger.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写短文讲述个人经历。参考情境：Rédiger un courriel pour raconter à un proche le déroulement de sa première journée au travail. / Rédiger, dans un forum de discussion, un message pour raconter une sortie familiale dans un verger.",
      "wordMin": 100,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel pour raconter à un proche le déroulement de sa première journée au travail.",
        "Rédiger, dans un forum de discussion, un message pour raconter une sortie familiale dans un verger."
      ]
    },
    {
      "id": "n5-writing-prod-4",
      "level": 5,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N5 写作情境 4（阐释分析）",
      "promptFr": "Rédige de courts textes pour expliquer sa décision d’accepter ou de refuser une offre liée à une situation courante. (Exemples officiels : Rédiger un message pour expliquer à une amie sa décision d’accepter l’offre de covoiturage d’un collègue. / Rédiger un texto pour décliner une invitation à un anniversaire en expliquant son refus.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写短文解释自己接受或拒绝日常提议的决定。参考情境：Rédiger un message pour expliquer à une amie sa décision d’accepter l’offre de covoiturage d’un collègue. / Rédiger un texto pour décliner une invitation à un anniversaire en expliquant son refus.",
      "wordMin": 100,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un message pour expliquer à une amie sa décision d’accepter l’offre de covoiturage d’un collègue.",
        "Rédiger un texto pour décliner une invitation à un anniversaire en expliquant son refus."
      ]
    },
    {
      "id": "n5-writing-prod-5",
      "level": 5,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N5 写作情境 5（指示规程）",
      "promptFr": "Rédige de courts textes pour formuler des suggestions ou des conseils liés à des situations courantes. (Exemples officiels : Rédiger un courriel pour faire part à son supérieur de ses suggestions concernant le choix d’un nouveau fournisseur. / Rédiger un message par clavardage pour conseiller à des amies des lieux à visiter dans une ville voisine.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：写短文提出与常见情境相关的建议或忠告。参考情境：Rédiger un courriel pour faire part à son supérieur de ses suggestions concernant le choix d’un nouveau fournisseur. / Rédiger un message par clavardage pour conseiller à des amies des lieux à visiter dans une ville voisine.",
      "wordMin": 100,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel pour faire part à son supérieur de ses suggestions concernant le choix d’un nouveau fournisseur.",
        "Rédiger un message par clavardage pour conseiller à des amies des lieux à visiter dans une ville voisine."
      ]
    }
  ],
  "6": [
    {
      "id": "n6-writing-prod-1",
      "level": 6,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N6 写作情境 1（信息告知）",
      "promptFr": "Rédige de courts textes pour informer de façon détaillée sur des sujets courants. (Exemples officiels : Rédiger un courriel pour informer une collègue des tâches à effectuer durant son absence. / Remplir les rubriques demandant un texte suivi dans un formulaire de demande d’emploi.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写短文详细说明常见话题。参考情境：Rédiger un courriel pour informer une collègue des tâches à effectuer durant son absence. / Remplir les rubriques demandant un texte suivi dans un formulaire de demande d’emploi.",
      "wordMin": 150,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel pour informer une collègue des tâches à effectuer durant son absence.",
        "Remplir les rubriques demandant un texte suivi dans un formulaire de demande d’emploi."
      ]
    },
    {
      "id": "n6-writing-prod-2",
      "level": 6,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N6 写作情境 2（事件叙述）",
      "promptFr": "Rédige de courts textes pour décrire de façon détaillée une situation ou un évènement courants. (Exemples officiels : Rédiger un texte dans un formulaire de déclaration d’accident de travail pour décrire les circonstances ayant mené à une lésion. / Rédiger un courriel pour décrire à une amie le déroulement d’une cérémonie de remise de diplômes.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写短文详细描述常见情境或事件。参考情境：Rédiger un texte dans un formulaire de déclaration d’accident de travail pour décrire les circonstances ayant mené à une lésion. / Rédiger un courriel pour décrire à une amie le déroulement d’une cérémonie de remise de diplômes.",
      "wordMin": 150,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un texte dans un formulaire de déclaration d’accident de travail pour décrire les circonstances ayant mené à une lésion.",
        "Rédiger un courriel pour décrire à une amie le déroulement d’une cérémonie de remise de diplômes."
      ]
    },
    {
      "id": "n6-writing-prod-3",
      "level": 6,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N6 写作情境 3（事件叙述）",
      "promptFr": "Rédige de courts textes pour raconter de façon détaillée des évènements courants. (Exemples officiels : Rédiger un courriel pour raconter à un ami les incidents survenus lors d’un déménagement. / Rédiger un message sur un réseau social pour raconter les moments marquants d’un séjour en camping.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写短文详细讲述日常事件。参考情境：Rédiger un courriel pour raconter à un ami les incidents survenus lors d’un déménagement. / Rédiger un message sur un réseau social pour raconter les moments marquants d’un séjour en camping.",
      "wordMin": 150,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel pour raconter à un ami les incidents survenus lors d’un déménagement.",
        "Rédiger un message sur un réseau social pour raconter les moments marquants d’un séjour en camping."
      ]
    },
    {
      "id": "n6-writing-prod-4",
      "level": 6,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N6 写作情境 4（阐释分析）",
      "promptFr": "Rédige de courts textes pour expliquer de façon détaillée une décision ou un choix liés à une situation courante. (Exemples officiels : Rédiger un courriel pour expliquer à la responsable des ressources humaines sa décision de faire une demande de congé prolongé. / Rédiger un courriel pour expliquer à son supérieur son choix de s’inscrire à une formation.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写短文详细解释与日常情境相关的决定或选择。参考情境：Rédiger un courriel pour expliquer à la responsable des ressources humaines sa décision de faire une demande de congé prolongé. / Rédiger un courriel pour expliquer à son supérieur son choix de s’inscrire à une formation.",
      "wordMin": 150,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un courriel pour expliquer à la responsable des ressources humaines sa décision de faire une demande de congé prolongé.",
        "Rédiger un courriel pour expliquer à son supérieur son choix de s’inscrire à une formation."
      ]
    },
    {
      "id": "n6-writing-prod-5",
      "level": 6,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N6 写作情境 5（情感交际）",
      "promptFr": "Rédige de courts textes pour exprimer de façon détaillée des émotions ou des sentiments. (Exemples officiels : Rédiger un billet de blogue concernant sa satisfaction à l’égard de sa visite au salon de l’emploi. / Rédiger un courriel pour exprimer à un ami ses craintes relatives aux effets secondaires d’un traitement.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写短文详细表达情绪或感受。参考情境：Rédiger un billet de blogue concernant sa satisfaction à l’égard de sa visite au salon de l’emploi. / Rédiger un courriel pour exprimer à un ami ses craintes relatives aux effets secondaires d’un traitement.",
      "wordMin": 150,
      "selfChecks": [
        "我的文章分段明确，逻辑顺序合理。",
        "我使用了复合过去时与未完成过去时的搭配。",
        "我运用了多样词汇与适宜的情感/观点表达。"
      ],
      "situations": [
        "Rédiger un billet de blogue concernant sa satisfaction à l’égard de sa visite au salon de l’emploi.",
        "Rédiger un courriel pour exprimer à un ami ses craintes relatives aux effets secondaires d’un traitement."
      ]
    }
  ],
  "7": [
    {
      "id": "n7-writing-prod-1",
      "level": 7,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N7 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes pour informer sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger un courriel pour informer sa propriétaire des réparations souhaitées par l’ensemble des locataires. / Rédiger une lettre de motivation pour présenter sa candidature à un nouveau poste.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写文章说明一般性或特定话题。参考情境：Rédiger un courriel pour informer sa propriétaire des réparations souhaitées par l’ensemble des locataires. / Rédiger une lettre de motivation pour présenter sa candidature à un nouveau poste.",
      "wordMin": 200,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un courriel pour informer sa propriétaire des réparations souhaitées par l’ensemble des locataires.",
        "Rédiger une lettre de motivation pour présenter sa candidature à un nouveau poste."
      ]
    },
    {
      "id": "n7-writing-prod-2",
      "level": 7,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N7 写作情境 2（阐释分析）",
      "promptFr": "Rédige des textes pour donner des explications sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger un courriel pour expliquer à une amie les avantages de faire du bénévolat. / Rédiger un courriel pour expliquer à un ami les avantages et les inconvénients d’habiter au centre-ville.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写文章解释一般性或特定话题。参考情境：Rédiger un courriel pour expliquer à une amie les avantages de faire du bénévolat. / Rédiger un courriel pour expliquer à un ami les avantages et les inconvénients d’habiter au centre-ville.",
      "wordMin": 200,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un courriel pour expliquer à une amie les avantages de faire du bénévolat.",
        "Rédiger un courriel pour expliquer à un ami les avantages et les inconvénients d’habiter au centre-ville."
      ]
    },
    {
      "id": "n7-writing-prod-3",
      "level": 7,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N7 写作情境 3（指示规程）",
      "promptFr": "Rédige des procédures de quelques étapes, en s’appuyant sur des indications reçues, pour répondre à des besoins spécifiques. (Exemples officiels : Rédiger la procédure pour obtenir une vignette de stationnement à l’intention des membres d’une copropriété. / Rédiger la procédure d’entretien quotidien de l’entrepôt à l’intention de ses collègues de travail.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：根据收到的指示写出满足特定需求的几步流程。参考情境：Rédiger la procédure pour obtenir une vignette de stationnement à l’intention des membres d’une copropriété. / Rédiger la procédure d’entretien quotidien de l’entrepôt à l’intention de ses collègues de travail.",
      "wordMin": 200,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger la procédure pour obtenir une vignette de stationnement à l’intention des membres d’une copropriété.",
        "Rédiger la procédure d’entretien quotidien de l’entrepôt à l’intention de ses collègues de travail."
      ]
    },
    {
      "id": "n7-writing-prod-4",
      "level": 7,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N7 写作情境 4（情感交际）",
      "promptFr": "Rédige des commentaires sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger un commentaire sur un réseau social pour donner son avis sur un nouveau livre. / Rédiger un commentaire en réponse à une lettre ouverte sur la piétonnisation d’une rue commerciale.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：就一般性或特定话题写评论。参考情境：Rédiger un commentaire sur un réseau social pour donner son avis sur un nouveau livre. / Rédiger un commentaire en réponse à une lettre ouverte sur la piétonnisation d’une rue commerciale.",
      "wordMin": 200,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un commentaire sur un réseau social pour donner son avis sur un nouveau livre.",
        "Rédiger un commentaire en réponse à une lettre ouverte sur la piétonnisation d’une rue commerciale."
      ]
    }
  ],
  "8": [
    {
      "id": "n8-writing-prod-1",
      "level": 8,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N8 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes structurés pour informer sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger le compte rendu d’une réunion de bénévoles pour un organisme communautaire. / Rédiger une lettre pour répondre à une plainte d’un client concernant la hausse des tarifs.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写结构清晰的文章说明一般性或特定话题。参考情境：Rédiger le compte rendu d’une réunion de bénévoles pour un organisme communautaire. / Rédiger une lettre pour répondre à une plainte d’un client concernant la hausse des tarifs.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger le compte rendu d’une réunion de bénévoles pour un organisme communautaire.",
        "Rédiger une lettre pour répondre à une plainte d’un client concernant la hausse des tarifs."
      ]
    },
    {
      "id": "n8-writing-prod-2",
      "level": 8,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N8 写作情境 2（事件叙述）",
      "promptFr": "Rédige des textes structurés pour relater des évènements ou des faits liés à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Rédiger un texte pour un site Web afin de relater la création et l’évolution d’une entreprise. / Rédiger un courriel pour relater à ses collègues les moments marquants d’un colloque.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写结构清晰的文章叙述一般性或特定话题的事件或事实。参考情境：Rédiger un texte pour un site Web afin de relater la création et l’évolution d’une entreprise. / Rédiger un courriel pour relater à ses collègues les moments marquants d’un colloque.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un texte pour un site Web afin de relater la création et l’évolution d’une entreprise.",
        "Rédiger un courriel pour relater à ses collègues les moments marquants d’un colloque."
      ]
    },
    {
      "id": "n8-writing-prod-3",
      "level": 8,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N8 写作情境 3（阐释分析）",
      "promptFr": "Rédige des textes structurés pour donner des explications sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger un courriel à l’intention d’une collaboratrice pour expliquer la cause d’un retard de livraison. / Rédiger un texte pour expliquer à des personnes âgées l’importance de l’activité physique pour le maintien des facultés intellectuelles.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写结构清晰的文章解释一般性或特定话题。参考情境：Rédiger un courriel à l’intention d’une collaboratrice pour expliquer la cause d’un retard de livraison. / Rédiger un texte pour expliquer à des personnes âgées l’importance de l’activité physique pour le maintien des facultés intellectuelles.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un courriel à l’intention d’une collaboratrice pour expliquer la cause d’un retard de livraison.",
        "Rédiger un texte pour expliquer à des personnes âgées l’importance de l’activité physique pour le maintien des facultés intellectuelles."
      ]
    },
    {
      "id": "n8-writing-prod-4",
      "level": 8,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N8 写作情境 4（指示规程）",
      "promptFr": "Rédige des procédures détaillées, en s’appuyant sur des indications reçues, pour répondre à des besoins spécifiques. (Exemples officiels : Rédiger la procédure d’archivage à l’intention d’une collègue. / Rédiger la procédure de demande de financement à l’intention de sa clientèle.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：根据收到的指示写出满足特定需求的详细流程。参考情境：Rédiger la procédure d’archivage à l’intention d’une collègue. / Rédiger la procédure de demande de financement à l’intention de sa clientèle.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger la procédure d’archivage à l’intention d’une collègue.",
        "Rédiger la procédure de demande de financement à l’intention de sa clientèle."
      ]
    },
    {
      "id": "n8-writing-prod-5",
      "level": 8,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N8 写作情境 5（观点论证）",
      "promptFr": "Rédige des textes pour donner son opinion sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Rédiger un courriel pour répondre à une demande d’opinion sur le plan de formation proposé. / Rédiger un billet de blogue pour donner son opinion sur une nouvelle loi récemment adoptée par l’Assemblée nationale.)",
      "promptZh": "【观点论证】根据官方量表情境完成写作：写文章就一般性或特定话题发表观点。参考情境：Rédiger un courriel pour répondre à une demande d’opinion sur le plan de formation proposé. / Rédiger un billet de blogue pour donner son opinion sur une nouvelle loi récemment adoptée par l’Assemblée nationale.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger un courriel pour répondre à une demande d’opinion sur le plan de formation proposé.",
        "Rédiger un billet de blogue pour donner son opinion sur une nouvelle loi récemment adoptée par l’Assemblée nationale."
      ]
    },
    {
      "id": "n8-writing-prod-6",
      "level": 8,
      "taskIndex": 6,
      "skill": "writing",
      "typeDeDiscours": "resume",
      "titleZh": "N8 写作情境 6（要点概括）",
      "promptFr": "Rédige des textes pour résumer des informations liées à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Rédiger le compte rendu d’une réunion d’équipe sur des changements apportés aux pratiques de travail. / Rédiger un courriel pour résumer à un ami les moments forts d’un séjour en nature.)",
      "promptZh": "【要点概括】根据官方量表情境完成写作：写文章概括一般性或特定话题的信息。参考情境：Rédiger le compte rendu d’une réunion d’équipe sur des changements apportés aux pratiques de travail. / Rédiger un courriel pour résumer à un ami les moments forts d’un séjour en nature.",
      "wordMin": 250,
      "selfChecks": [
        "我使用了逻辑连接词（cependant, en effet, ainsi）。",
        "我区分了客观事实与主观评价。",
        "我正确运用了条件式或虚拟式等句式结构。"
      ],
      "situations": [
        "Rédiger le compte rendu d’une réunion d’équipe sur des changements apportés aux pratiques de travail.",
        "Rédiger un courriel pour résumer à un ami les moments forts d’un séjour en nature."
      ]
    }
  ],
  "9": [
    {
      "id": "n9-writing-prod-1",
      "level": 9,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N9 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes pour informer sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger une fiche technique présentant les spécificités des matériaux utilisés dans un projet réalisé par son entreprise. / Rédiger un texte informatif sur la mission d’une fondation qui soutient les équipes sportives des milieux défavorisés.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：写文章说明专业/兴趣领域的话题。参考情境：Rédiger une fiche technique présentant les spécificités des matériaux utilisés dans un projet réalisé par son entreprise. / Rédiger un texte informatif sur la mission d’une fondation qui soutient les équipes sportives des milieux défavorisés.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger une fiche technique présentant les spécificités des matériaux utilisés dans un projet réalisé par son entreprise.",
        "Rédiger un texte informatif sur la mission d’une fondation qui soutient les équipes sportives des milieux défavorisés."
      ]
    },
    {
      "id": "n9-writing-prod-2",
      "level": 9,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N9 写作情境 2（事件叙述）",
      "promptFr": "Rédige des textes pour relater des faits liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger un journal de bord pour relater le déroulement de son stage dans le cadre de sa formation. / Rédiger un billet de blogue pour relater l’évolution de l’art urbain.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：写文章叙述专业/兴趣领域的事实。参考情境：Rédiger un journal de bord pour relater le déroulement de son stage dans le cadre de sa formation. / Rédiger un billet de blogue pour relater l’évolution de l’art urbain.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un journal de bord pour relater le déroulement de son stage dans le cadre de sa formation.",
        "Rédiger un billet de blogue pour relater l’évolution de l’art urbain."
      ]
    },
    {
      "id": "n9-writing-prod-3",
      "level": 9,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N9 写作情境 3（阐释分析）",
      "promptFr": "Rédige des textes pour donner des explications sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger un texte pour expliquer les répercussions de la restructuration de l’entreprise sur les relations de travail. / Rédiger un article destiné à une revue de protection du consommateur expliquant les résultats d’un test comparatif sur des produits cosmétiques.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：写文章解释专业/兴趣领域的话题。参考情境：Rédiger un texte pour expliquer les répercussions de la restructuration de l’entreprise sur les relations de travail. / Rédiger un article destiné à une revue de protection du consommateur expliquant les résultats d’un test comparatif sur des produits cosmétiques.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte pour expliquer les répercussions de la restructuration de l’entreprise sur les relations de travail.",
        "Rédiger un article destiné à une revue de protection du consommateur expliquant les résultats d’un test comparatif sur des produits cosmétiques."
      ]
    },
    {
      "id": "n9-writing-prod-4",
      "level": 9,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N9 写作情境 4（指示规程）",
      "promptFr": "Rédige des directives liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger des directives à l’intention de ses collègues concernant les bonnes pratiques d’utilisation de données personnelles. / Rédiger des directives à l’intention de ses collaborateurs concernant la création d’un projet associatif.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：撰写专业/兴趣领域的指引。参考情境：Rédiger des directives à l’intention de ses collègues concernant les bonnes pratiques d’utilisation de données personnelles. / Rédiger des directives à l’intention de ses collaborateurs concernant la création d’un projet associatif.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger des directives à l’intention de ses collègues concernant les bonnes pratiques d’utilisation de données personnelles.",
        "Rédiger des directives à l’intention de ses collaborateurs concernant la création d’un projet associatif."
      ]
    },
    {
      "id": "n9-writing-prod-5",
      "level": 9,
      "taskIndex": 5,
      "skill": "writing",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N9 写作情境 5（观点论证）",
      "promptFr": "Rédige des textes pour donner son opinion sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger une lettre pour donner son opinion à la direction sur le nouveau mandat de son équipe de travail. / Rédiger un billet de blogue pour donner son opinion sur un récit autobiographique.)",
      "promptZh": "【观点论证】根据官方量表情境完成写作：写文章就专业/兴趣领域发表观点。参考情境：Rédiger une lettre pour donner son opinion à la direction sur le nouveau mandat de son équipe de travail. / Rédiger un billet de blogue pour donner son opinion sur un récit autobiographique.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger une lettre pour donner son opinion à la direction sur le nouveau mandat de son équipe de travail.",
        "Rédiger un billet de blogue pour donner son opinion sur un récit autobiographique."
      ]
    },
    {
      "id": "n9-writing-prod-6",
      "level": 9,
      "taskIndex": 6,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N9 写作情境 6（情感交际）",
      "promptFr": "Rédige des textes pour exprimer une variété d’émotions ou de sentiments. (Exemples officiels : Rédiger un texte pour rendre hommage à une proche lors de ses funérailles. / Rédiger un courriel pour exprimer sa reconnaissance envers une équipe médicale s’étant occupée d’un proche.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：写文章表达多种情绪或感受。参考情境：Rédiger un texte pour rendre hommage à une proche lors de ses funérailles. / Rédiger un courriel pour exprimer sa reconnaissance envers une équipe médicale s’étant occupée d’un proche.",
      "wordMin": 300,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte pour rendre hommage à une proche lors de ses funérailles.",
        "Rédiger un courriel pour exprimer sa reconnaissance envers une équipe médicale s’étant occupée d’un proche."
      ]
    }
  ],
  "10": [
    {
      "id": "n10-writing-prod-1",
      "level": 10,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N10 写作情境 1（阐释分析）",
      "promptFr": "Rédige avec précision des textes explicatifs portant sur des phénomènes ou des principes liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger un texte pour expliquer la pertinence de son projet de recherche dans le cadre d’une demande de subvention gouvernementale. / Rédiger un texte expliquant l’impact d’une mesure économique municipale sur la protection environnementale du territoire.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：精准撰写解释专业/兴趣领域现象或原理的文章。参考情境：Rédiger un texte pour expliquer la pertinence de son projet de recherche dans le cadre d’une demande de subvention gouvernementale. / Rédiger un texte expliquant l’impact d’une mesure économique municipale sur la protection environnementale du territoire.",
      "wordMin": 350,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte pour expliquer la pertinence de son projet de recherche dans le cadre d’une demande de subvention gouvernementale.",
        "Rédiger un texte expliquant l’impact d’une mesure économique municipale sur la protection environnementale du territoire."
      ]
    },
    {
      "id": "n10-writing-prod-2",
      "level": 10,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "injonctif",
      "titleZh": "N10 写作情境 2（指示规程）",
      "promptFr": "Rédige des directives complexes liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger des directives destinées au personnel chargé de l’inspection des aliments. / Rédiger des directives dans un guide concernant l’utilisation de pesticides en milieu agricole.)",
      "promptZh": "【指示规程】根据官方量表情境完成写作：撰写专业/兴趣领域的复杂指引。参考情境：Rédiger des directives destinées au personnel chargé de l’inspection des aliments. / Rédiger des directives dans un guide concernant l’utilisation de pesticides en milieu agricole.",
      "wordMin": 350,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger des directives destinées au personnel chargé de l’inspection des aliments.",
        "Rédiger des directives dans un guide concernant l’utilisation de pesticides en milieu agricole."
      ]
    },
    {
      "id": "n10-writing-prod-3",
      "level": 10,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N10 写作情境 3（观点论证）",
      "promptFr": "Rédige des textes argumentatifs sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger un texte promotionnel présentant les services offerts par son entreprise. / Rédiger une lettre de recommandation soutenant la candidature d’une collègue pour un prix de reconnaissance.)",
      "promptZh": "【观点论证】根据官方量表情境完成写作：就专业/兴趣领域的话题撰写议论文。参考情境：Rédiger un texte promotionnel présentant les services offerts par son entreprise. / Rédiger une lettre de recommandation soutenant la candidature d’une collègue pour un prix de reconnaissance.",
      "wordMin": 350,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte promotionnel présentant les services offerts par son entreprise.",
        "Rédiger une lettre de recommandation soutenant la candidature d’une collègue pour un prix de reconnaissance."
      ]
    },
    {
      "id": "n10-writing-prod-4",
      "level": 10,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "resume",
      "titleZh": "N10 写作情境 4（要点概括）",
      "promptFr": "Rédige avec précision des textes pour résumer des informations liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Rédiger le compte rendu d’une conférence sur le leadeurship au féminin à l’intention de ses collègues. / Rédiger un résumé de jugement à la suite d’un litige entre voisins.)",
      "promptZh": "【要点概括】根据官方量表情境完成写作：精准撰写专业/兴趣领域信息的概要。参考情境：Rédiger le compte rendu d’une conférence sur le leadeurship au féminin à l’intention de ses collègues. / Rédiger un résumé de jugement à la suite d’un litige entre voisins.",
      "wordMin": 350,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger le compte rendu d’une conférence sur le leadeurship au féminin à l’intention de ses collègues.",
        "Rédiger un résumé de jugement à la suite d’un litige entre voisins."
      ]
    }
  ],
  "11": [
    {
      "id": "n11-writing-prod-1",
      "level": 11,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N11 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes élaborés pour informer sur des sujets diversifiés. (Exemples officiels : Rédiger un rapport sur les mesures de protection et de conservation des milieux naturels appliquées dans une zone urbaine. / Rédiger un bilan, à l’intention du conseil d’administration, précisant l’état d’avancement d’un projet industriel.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：撰写内容充实的文章说明多样话题。参考情境：Rédiger un rapport sur les mesures de protection et de conservation des milieux naturels appliquées dans une zone urbaine. / Rédiger un bilan, à l’intention du conseil d’administration, précisant l’état d’avancement d’un projet industriel.",
      "wordMin": 400,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un rapport sur les mesures de protection et de conservation des milieux naturels appliquées dans une zone urbaine.",
        "Rédiger un bilan, à l’intention du conseil d’administration, précisant l’état d’avancement d’un projet industriel."
      ]
    },
    {
      "id": "n11-writing-prod-2",
      "level": 11,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "narratif",
      "titleZh": "N11 写作情境 2（事件叙述）",
      "promptFr": "Rédige des textes élaborés pour relater des faits liés à des sujets diversifiés. (Exemples officiels : Rédiger un texte pour relater la genèse d’un projet pédagogique dans le cadre d’une demande de subvention. / Rédiger un texte biographique sur une figure marquante de la Révolution tranquille pour une rubrique historique d’un site Internet.)",
      "promptZh": "【事件叙述】根据官方量表情境完成写作：撰写内容充实的文章叙述多样话题的事实。参考情境：Rédiger un texte pour relater la genèse d’un projet pédagogique dans le cadre d’une demande de subvention. / Rédiger un texte biographique sur une figure marquante de la Révolution tranquille pour une rubrique historique d’un site Internet.",
      "wordMin": 400,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte pour relater la genèse d’un projet pédagogique dans le cadre d’une demande de subvention.",
        "Rédiger un texte biographique sur une figure marquante de la Révolution tranquille pour une rubrique historique d’un site Internet."
      ]
    },
    {
      "id": "n11-writing-prod-3",
      "level": 11,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "explicatif",
      "titleZh": "N11 写作情境 3（阐释分析）",
      "promptFr": "Rédige des textes élaborés pour expliquer des enjeux diversifiés. (Exemples officiels : Rédiger une chronique dans une revue scientifique expliquant des avancées dans son domaine. / Rédiger un article expliquant des pratiques de travail collaboratif efficaces dans une revue professionnelle.)",
      "promptZh": "【阐释分析】根据官方量表情境完成写作：撰写内容充实的文章解释多样议题的利害。参考情境：Rédiger une chronique dans une revue scientifique expliquant des avancées dans son domaine. / Rédiger un article expliquant des pratiques de travail collaboratif efficaces dans une revue professionnelle.",
      "wordMin": 400,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger une chronique dans une revue scientifique expliquant des avancées dans son domaine.",
        "Rédiger un article expliquant des pratiques de travail collaboratif efficaces dans une revue professionnelle."
      ]
    }
  ],
  "12": [
    {
      "id": "n12-writing-prod-1",
      "level": 12,
      "taskIndex": 1,
      "skill": "writing",
      "typeDeDiscours": "informatif",
      "titleZh": "N12 写作情境 1（信息告知）",
      "promptFr": "Rédige des textes pour mettre en perspective des informations à la croisée de différents domaines. (Exemples officiels : Rédiger un texte recensant les mesures les plus prometteuses expérimentées en agriculture écoresponsable. / Rédiger un rapport sur les résultats d’un essai clinique portant sur un nouveau médicament.)",
      "promptZh": "【信息告知】根据官方量表情境完成写作：撰写多角度审视跨领域信息的文章。参考情境：Rédiger un texte recensant les mesures les plus prometteuses expérimentées en agriculture écoresponsable. / Rédiger un rapport sur les résultats d’un essai clinique portant sur un nouveau médicament.",
      "wordMin": 450,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte recensant les mesures les plus prometteuses expérimentées en agriculture écoresponsable.",
        "Rédiger un rapport sur les résultats d’un essai clinique portant sur un nouveau médicament."
      ]
    },
    {
      "id": "n12-writing-prod-2",
      "level": 12,
      "taskIndex": 2,
      "skill": "writing",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N12 写作情境 2（观点论证）",
      "promptFr": "Rédige des textes argumentatifs sur des enjeux à la croisée de différents domaines. (Exemples officiels : Rédiger un texte dans un mémoire pour défendre des mesures mises en œuvre visant à contrer la pénurie de logements. / Rédiger un texte d’opinion sur une proposition de plan de gestion des milieux naturels en réponse à une consultation publique.)",
      "promptZh": "【观点论证】根据官方量表情境完成写作：就跨领域议题撰写议论文。参考情境：Rédiger un texte dans un mémoire pour défendre des mesures mises en œuvre visant à contrer la pénurie de logements. / Rédiger un texte d’opinion sur une proposition de plan de gestion des milieux naturels en réponse à une consultation publique.",
      "wordMin": 450,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger un texte dans un mémoire pour défendre des mesures mises en œuvre visant à contrer la pénurie de logements.",
        "Rédiger un texte d’opinion sur une proposition de plan de gestion des milieux naturels en réponse à une consultation publique."
      ]
    },
    {
      "id": "n12-writing-prod-3",
      "level": 12,
      "taskIndex": 3,
      "skill": "writing",
      "typeDeDiscours": "expressif",
      "titleZh": "N12 写作情境 3（情感交际）",
      "promptFr": "Rédige des textes pour exprimer de façon créative une variété d’émotions, de sentiments ou d’intentions. (Exemples officiels : Rédiger une lettre ouverte pour exprimer ses sentiments et ses émotions concernant un scandale financier. / Rédiger un texte pour exprimer son attachement à l’être aimé.)",
      "promptZh": "【情感交际】根据官方量表情境完成写作：富有创造性地写出多种情绪、感受或意图。参考情境：Rédiger une lettre ouverte pour exprimer ses sentiments et ses émotions concernant un scandale financier. / Rédiger un texte pour exprimer son attachement à l’être aimé.",
      "wordMin": 450,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger une lettre ouverte pour exprimer ses sentiments et ses émotions concernant un scandale financier.",
        "Rédiger un texte pour exprimer son attachement à l’être aimé."
      ]
    },
    {
      "id": "n12-writing-prod-4",
      "level": 12,
      "taskIndex": 4,
      "skill": "writing",
      "typeDeDiscours": "resume",
      "titleZh": "N12 写作情境 4（要点概括）",
      "promptFr": "Rédige des textes pour synthétiser des informations à la croisée de différents domaines. (Exemples officiels : Rédiger la recension d’articles scientifiques dans le cadre d’un rapport de recherche. / Rédiger un rapport synthèse des activités d’insertion professionnelle mises en place dans son entreprise.)",
      "promptZh": "【要点概括】根据官方量表情境完成写作：撰写综合归纳跨领域信息的文章。参考情境：Rédiger la recension d’articles scientifiques dans le cadre d’un rapport de recherche. / Rédiger un rapport synthèse des activités d’insertion professionnelle mises en place dans son entreprise.",
      "wordMin": 450,
      "selfChecks": [
        "文章结构紧凑严密，符合正式书面语规范。",
        "我精准运用了专业/高级词汇与修辞手段。",
        "论述兼顾逻辑深度与语言细腻度。"
      ],
      "situations": [
        "Rédiger la recension d’articles scientifiques dans le cadre d’un rapport de recherche.",
        "Rédiger un rapport synthèse des activités d’insertion professionnelle mises en place dans son entreprise."
      ]
    }
  ]
};

export const SPEAKING_TASK_POOLS = {
  "1": [
    {
      "id": "n1-speaking-prod-1",
      "level": 1,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N1 口语情境 1（信息告知）",
      "promptFr": "Pose des questions très simples et brèves liées aux données personnelles. (Exemples officiels : Poser des questions concernant l’identité d’une collègue lors d’un échange brise-glace. / Demander à un nouvel ami ses coordonnées.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：提出与个人信息相关的极简短问题。参考情境：Poser des questions concernant l’identité d’une collègue lors d’un échange brise-glace. / Demander à un nouvel ami ses coordonnées.",
      "secondsMin": 10,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Poser des questions concernant l’identité d’une collègue lors d’un échange brise-glace.",
        "Demander à un nouvel ami ses coordonnées."
      ]
    },
    {
      "id": "n1-speaking-prod-2",
      "level": 1,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N1 口语情境 2（信息告知）",
      "promptFr": "Fournit des réponses très simples et brèves à des questions liées aux données personnelles. (Exemples officiels : Fournir sa nouvelle adresse au secrétariat. / Se présenter à sa voisine en donnant son prénom.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：简短回答与个人信息相关的问题。参考情境：Fournir sa nouvelle adresse au secrétariat. / Se présenter à sa voisine en donnant son prénom.",
      "secondsMin": 10,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Fournir sa nouvelle adresse au secrétariat.",
        "Se présenter à sa voisine en donnant son prénom."
      ]
    },
    {
      "id": "n1-speaking-prod-3",
      "level": 1,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N1 口语情境 3（情感交际）",
      "promptFr": "Utilise les formules courantes pour saluer ou remercier. (Exemples officiels : Saluer l’amie d’une connaissance. / Remercier un livreur.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：使用打招呼、道谢的常用说法。参考情境：Saluer l’amie d’une connaissance. / Remercier un livreur.",
      "secondsMin": 10,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Saluer l’amie d’une connaissance.",
        "Remercier un livreur."
      ]
    }
  ],
  "2": [
    {
      "id": "n2-speaking-prod-1",
      "level": 2,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 口语情境 1（信息告知）",
      "promptFr": "Pose des questions très simples et brèves pour obtenir des renseignements liés à des besoins immédiats. (Exemples officiels : Demander l’heure d’ouverture du bureau de poste. / Demander à un enseignant des renseignements sur une sortie organisée par le personnel de son lieu de formation.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：为获取即时需求的信息提出极简短问题。参考情境：Demander l’heure d’ouverture du bureau de poste. / Demander à un enseignant des renseignements sur une sortie organisée par le personnel de son lieu de formation.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Demander l’heure d’ouverture du bureau de poste.",
        "Demander à un enseignant des renseignements sur une sortie organisée par le personnel de son lieu de formation."
      ]
    },
    {
      "id": "n2-speaking-prod-2",
      "level": 2,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 口语情境 2（信息告知）",
      "promptFr": "Fournit des réponses très simples et brèves à des questions liées à des besoins immédiats. (Exemples officiels : Informer une connaissance sur l’heure de fermeture de la pharmacie. / Informer un ami sur ses passetemps en soirée.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：简短回答与即时需求相关的问题。参考情境：Informer une connaissance sur l’heure de fermeture de la pharmacie. / Informer un ami sur ses passetemps en soirée.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Informer une connaissance sur l’heure de fermeture de la pharmacie.",
        "Informer un ami sur ses passetemps en soirée."
      ]
    },
    {
      "id": "n2-speaking-prod-3",
      "level": 2,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 口语情境 3（信息告知）",
      "promptFr": "Demande des renseignements très simples et brefs concernant l’orientation dans son environnement immédiat. (Exemples officiels : Demander l’emplacement des toilettes dans un édifice public. / Demander à un passant l’emplacement du supermarché le plus près.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：询问身边环境中的方位信息。参考情境：Demander l’emplacement des toilettes dans un édifice public. / Demander à un passant l’emplacement du supermarché le plus près.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Demander l’emplacement des toilettes dans un édifice public.",
        "Demander à un passant l’emplacement du supermarché le plus près."
      ]
    },
    {
      "id": "n2-speaking-prod-4",
      "level": 2,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N2 口语情境 4（信息告知）",
      "promptFr": "Fournit des renseignements très simples et brefs concernant l’orientation dans son environnement immédiat. (Exemples officiels : Fournir des indications à une passante pour localiser l’école primaire du quartier. / Fournir des indications à un collègue pour localiser le bureau de la directrice du lieu de formation.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：提供身边环境中的方位信息。参考情境：Fournir des indications à une passante pour localiser l’école primaire du quartier. / Fournir des indications à un collègue pour localiser le bureau de la directrice du lieu de formation.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Fournir des indications à une passante pour localiser l’école primaire du quartier.",
        "Fournir des indications à un collègue pour localiser le bureau de la directrice du lieu de formation."
      ]
    },
    {
      "id": "n2-speaking-prod-5",
      "level": 2,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N2 口语情境 5（指示规程）",
      "promptFr": "Répète des consignes très simples et brèves. (Exemples officiels : Répéter à une collègue de fermer la porte de la classe. / Rappeler à un ami l’interdiction de fumer devant la porte d’un édifice public.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：复述极简短的指令。参考情境：Répéter à une collègue de fermer la porte de la classe. / Rappeler à un ami l’interdiction de fumer devant la porte d’un édifice public.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Répéter à une collègue de fermer la porte de la classe.",
        "Rappeler à un ami l’interdiction de fumer devant la porte d’un édifice public."
      ]
    },
    {
      "id": "n2-speaking-prod-6",
      "level": 2,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N2 口语情境 6（情感交际）",
      "promptFr": "Utilise les formules courantes pour s’excuser ou aborder une personne. (Exemples officiels : Formuler des excuses pour se frayer un chemin dans un autobus. / Interpeler une cliente qui oublie son parapluie à une table voisine dans le restaurant.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：使用道歉、搭话的常用说法。参考情境：Formuler des excuses pour se frayer un chemin dans un autobus. / Interpeler une cliente qui oublie son parapluie à une table voisine dans le restaurant.",
      "secondsMin": 20,
      "selfChecks": [
        "我清楚说出了发音清晰的词句。",
        "我使用了日常基础问候与信息表达。",
        "表达过程没有过长停顿。"
      ],
      "situations": [
        "Formuler des excuses pour se frayer un chemin dans un autobus.",
        "Interpeler une cliente qui oublie son parapluie à une table voisine dans le restaurant."
      ]
    }
  ],
  "3": [
    {
      "id": "n3-speaking-prod-1",
      "level": 3,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 口语情境 1（信息告知）",
      "promptFr": "Formule des demandes simples et brèves liées à des services ou à des renseignements. (Exemples officiels : Demander des précisions sur le menu dans un restaurant. / Demander à une collègue si elle peut travailler le lendemain en soirée.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：提出与服务或信息相关的简单简短请求。参考情境：Demander des précisions sur le menu dans un restaurant. / Demander à une collègue si elle peut travailler le lendemain en soirée.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Demander des précisions sur le menu dans un restaurant.",
        "Demander à une collègue si elle peut travailler le lendemain en soirée."
      ]
    },
    {
      "id": "n3-speaking-prod-2",
      "level": 3,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 口语情境 2（信息告知）",
      "promptFr": "Formule des réponses simples et brèves à des demandes liées à des services ou à des renseignements. (Exemples officiels : Répondre aux questions d’une vendeuse au moment de payer son achat. / Répondre à une question d’un collègue sur la météo à son retour au travail après un diner à l’extérieur.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：对与服务或信息相关的请求做简单简短回答。参考情境：Répondre aux questions d’une vendeuse au moment de payer son achat. / Répondre à une question d’un collègue sur la météo à son retour au travail après un diner à l’extérieur.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Répondre aux questions d’une vendeuse au moment de payer son achat.",
        "Répondre à une question d’un collègue sur la météo à son retour au travail après un diner à l’extérieur."
      ]
    },
    {
      "id": "n3-speaking-prod-3",
      "level": 3,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N3 口语情境 3（信息告知）",
      "promptFr": "Fournit des renseignements simples et brefs sur des activités à venir. (Exemples officiels : Annoncer ses projets de vacances à une amie. / Informer son voisin des activités du mois prochain au centre communautaire du quartier.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：简单简短地介绍即将进行的活动。参考情境：Annoncer ses projets de vacances à une amie. / Informer son voisin des activités du mois prochain au centre communautaire du quartier.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Annoncer ses projets de vacances à une amie.",
        "Informer son voisin des activités du mois prochain au centre communautaire du quartier."
      ]
    },
    {
      "id": "n3-speaking-prod-4",
      "level": 3,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "descriptif",
      "titleZh": "N3 口语情境 4（描写刻画）",
      "promptFr": "Fournit des descriptions simples et brèves portant sur une personne, un objet ou un état. (Exemples officiels : Décrire à un agent de sécurité son sac à dos oublié à la cafétéria. / Décrire à une pharmacienne ses symptômes d’allergie saisonnière.)",
      "promptZh": "【描写刻画】根据官方量表情境完成口头表达：简单简短地描述人、物或状态。参考情境：Décrire à un agent de sécurité son sac à dos oublié à la cafétéria. / Décrire à une pharmacienne ses symptômes d’allergie saisonnière.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Décrire à un agent de sécurité son sac à dos oublié à la cafétéria.",
        "Décrire à une pharmacienne ses symptômes d’allergie saisonnière."
      ]
    },
    {
      "id": "n3-speaking-prod-5",
      "level": 3,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N3 口语情境 5（指示规程）",
      "promptFr": "Formule des consignes simples et brèves. (Exemples officiels : Formuler des consignes à son enfant pour s’habiller un matin d’hiver. / Formuler quelques consignes à un collègue pour installer une application sur son cellulaire.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：说出简单简短的指令。参考情境：Formuler des consignes à son enfant pour s’habiller un matin d’hiver. / Formuler quelques consignes à un collègue pour installer une application sur son cellulaire.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Formuler des consignes à son enfant pour s’habiller un matin d’hiver.",
        "Formuler quelques consignes à un collègue pour installer une application sur son cellulaire."
      ]
    },
    {
      "id": "n3-speaking-prod-6",
      "level": 3,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N3 口语情境 6（情感交际）",
      "promptFr": "Formule des compliments ou des souhaits simples et brefs. (Exemples officiels : Complimenter une proche sur sa nouvelle couleur de cheveux. / Féliciter un collègue pour l’annonce de son mariage.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：说出简单简短的称赞或祝愿。参考情境：Complimenter une proche sur sa nouvelle couleur de cheveux. / Féliciter un collègue pour l’annonce de son mariage.",
      "secondsMin": 30,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Complimenter une proche sur sa nouvelle couleur de cheveux.",
        "Féliciter un collègue pour l’annonce de son mariage."
      ]
    }
  ],
  "4": [
    {
      "id": "n4-speaking-prod-1",
      "level": 4,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N4 口语情境 1（阐释分析）",
      "promptFr": "Formule des demandes simples d’explications ou de renseignements liées à des besoins courants. (Exemples officiels : Demander à une commis à la banque des explications sur la marche à suivre pour remplacer une carte de guichet perdue. / Demander au propriétaire des renseignements sur les conditions de location d’un logement.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：就日常需求提出简单的解释或信息请求。参考情境：Demander à une commis à la banque des explications sur la marche à suivre pour remplacer une carte de guichet perdue. / Demander au propriétaire des renseignements sur les conditions de location d’un logement.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Demander à une commis à la banque des explications sur la marche à suivre pour remplacer une carte de guichet perdue.",
        "Demander au propriétaire des renseignements sur les conditions de location d’un logement."
      ]
    },
    {
      "id": "n4-speaking-prod-2",
      "level": 4,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N4 口语情境 2（信息告知）",
      "promptFr": "Fournit des renseignements simples liés à des besoins courants. (Exemples officiels : Fournir des renseignements en vue de la livraison d’un appareil électroménager. / Fournir à une agente d’aide à l’emploi des renseignements concernant sa scolarité et sa profession.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：提供与日常需求相关的简单信息。参考情境：Fournir des renseignements en vue de la livraison d’un appareil électroménager. / Fournir à une agente d’aide à l’emploi des renseignements concernant sa scolarité et sa profession.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Fournir des renseignements en vue de la livraison d’un appareil électroménager.",
        "Fournir à une agente d’aide à l’emploi des renseignements concernant sa scolarité et sa profession."
      ]
    },
    {
      "id": "n4-speaking-prod-3",
      "level": 4,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "descriptif",
      "titleZh": "N4 口语情境 3（描写刻画）",
      "promptFr": "Formule des descriptions simples d’activités ou de problèmes courants. (Exemples officiels : Décrire à une amie une activité sportive offerte au centre communautaire. / Décrire un problème de plomberie à son propriétaire.)",
      "promptZh": "【描写刻画】根据官方量表情境完成口头表达：简单描述日常活动或问题。参考情境：Décrire à une amie une activité sportive offerte au centre communautaire. / Décrire un problème de plomberie à son propriétaire.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Décrire à une amie une activité sportive offerte au centre communautaire.",
        "Décrire un problème de plomberie à son propriétaire."
      ]
    },
    {
      "id": "n4-speaking-prod-4",
      "level": 4,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N4 口语情境 4（事件叙述）",
      "promptFr": "Raconte brièvement des anecdotes ou des activités courantes. (Exemples officiels : Raconter à une proche une anecdote sur son arrivée au Québec. / Raconter à un collègue les activités réalisées pendant la fin de semaine.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：简要讲述日常趣事或活动。参考情境：Raconter à une proche une anecdote sur son arrivée au Québec. / Raconter à un collègue les activités réalisées pendant la fin de semaine.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Raconter à une proche une anecdote sur son arrivée au Québec.",
        "Raconter à un collègue les activités réalisées pendant la fin de semaine."
      ]
    },
    {
      "id": "n4-speaking-prod-5",
      "level": 4,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N4 口语情境 5（阐释分析）",
      "promptFr": "Formule des explications simples concernant les causes d’un problème courant. (Exemples officiels : Expliquer à une voisine la cause de la fermeture ponctuelle des écoles en hiver. / Expliquer à un collègue la cause d’un retard.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：简单解释日常问题的原因。参考情境：Expliquer à une voisine la cause de la fermeture ponctuelle des écoles en hiver. / Expliquer à un collègue la cause d’un retard.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Expliquer à une voisine la cause de la fermeture ponctuelle des écoles en hiver.",
        "Expliquer à un collègue la cause d’un retard."
      ]
    },
    {
      "id": "n4-speaking-prod-6",
      "level": 4,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N4 口语情境 6（指示规程）",
      "promptFr": "Formule des consignes simples indiquant quelques étapes. (Exemples officiels : Formuler à une connaissance l’itinéraire à suivre pour se rendre au centre commercial en transport collectif. / Formuler à un collègue la marche à suivre lors de la fermeture du lieu de travail.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：说出包含几个步骤的简单指令。参考情境：Formuler à une connaissance l’itinéraire à suivre pour se rendre au centre commercial en transport collectif. / Formuler à un collègue la marche à suivre lors de la fermeture du lieu de travail.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Formuler à une connaissance l’itinéraire à suivre pour se rendre au centre commercial en transport collectif.",
        "Formuler à un collègue la marche à suivre lors de la fermeture du lieu de travail."
      ]
    },
    {
      "id": "n4-speaking-prod-7",
      "level": 4,
      "taskIndex": 7,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N4 口语情境 7（情感交际）",
      "promptFr": "Exprime des préférences, des souhaits ou une appréciation sommaire. (Exemples officiels : Exprimer ses préférences en vue de l’achat d’un vêtement. / Faire part à une connaissance d’une appréciation sommaire concernant un restaurant.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：表达偏好、愿望或简单评价。参考情境：Exprimer ses préférences en vue de l’achat d’un vêtement. / Faire part à une connaissance d’une appréciation sommaire concernant un restaurant.",
      "secondsMin": 45,
      "selfChecks": [
        "我的语句较为连贯，有开头和结尾。",
        "我使用了基础连接词和简单时态。",
        "语音语调大体自然，对方容易听懂。"
      ],
      "situations": [
        "Exprimer ses préférences en vue de l’achat d’un vêtement.",
        "Faire part à une connaissance d’une appréciation sommaire concernant un restaurant."
      ]
    }
  ],
  "5": [
    {
      "id": "n5-speaking-prod-1",
      "level": 5,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N5 口语情境 1（信息告知）",
      "promptFr": "Interagit pour demander ou fournir l’essentiel d’informations liées à des sujets courants. (Exemples officiels : Interagir par téléphone avec la réceptionniste d’un hôtel pour réserver une chambre et connaitre les services offerts. / Interagir avec le préposé d’une entreprise de déménagement pour recourir à ses services.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：互动中询问或提供常见话题信息的要点。参考情境：Interagir par téléphone avec la réceptionniste d’un hôtel pour réserver une chambre et connaitre les services offerts. / Interagir avec le préposé d’une entreprise de déménagement pour recourir à ses services.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Interagir par téléphone avec la réceptionniste d’un hôtel pour réserver une chambre et connaitre les services offerts.",
        "Interagir avec le préposé d’une entreprise de déménagement pour recourir à ses services."
      ]
    },
    {
      "id": "n5-speaking-prod-2",
      "level": 5,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N5 口语情境 2（事件叙述）",
      "promptFr": "Décrit l’essentiel d’une situation ou d’un évènement courants. (Exemples officiels : Décrire un problème de santé au téléphone à une infirmière du service Info-Santé. / Décrire à un proche les activités présentées dans la programmation d’un carnaval d’hiver.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：描述常见情境或事件的要点。参考情境：Décrire un problème de santé au téléphone à une infirmière du service Info-Santé. / Décrire à un proche les activités présentées dans la programmation d’un carnaval d’hiver.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Décrire un problème de santé au téléphone à une infirmière du service Info-Santé.",
        "Décrire à un proche les activités présentées dans la programmation d’un carnaval d’hiver."
      ]
    },
    {
      "id": "n5-speaking-prod-3",
      "level": 5,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N5 口语情境 3（事件叙述）",
      "promptFr": "Raconte une expérience personnelle. (Exemples officiels : Raconter à une amie les moments marquants d’une excursion. / Raconter à un proche le déroulement de son examen de conduite.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：讲述一段个人经历。参考情境：Raconter à une amie les moments marquants d’une excursion. / Raconter à un proche le déroulement de son examen de conduite.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Raconter à une amie les moments marquants d’une excursion.",
        "Raconter à un proche le déroulement de son examen de conduite."
      ]
    },
    {
      "id": "n5-speaking-prod-4",
      "level": 5,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N5 口语情境 4（阐释分析）",
      "promptFr": "Explique sa décision d’accepter ou de refuser une offre liée à une situation courante. (Exemples officiels : Expliquer à une amie sa décision d’accepter l’offre faite par son fournisseur pour changer son forfait Internet. / Expliquer à un collègue sa décision de refuser le poste qui lui a été offert.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：解释自己接受或拒绝日常提议的决定。参考情境：Expliquer à une amie sa décision d’accepter l’offre faite par son fournisseur pour changer son forfait Internet. / Expliquer à un collègue sa décision de refuser le poste qui lui a été offert.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Expliquer à une amie sa décision d’accepter l’offre faite par son fournisseur pour changer son forfait Internet.",
        "Expliquer à un collègue sa décision de refuser le poste qui lui a été offert."
      ]
    },
    {
      "id": "n5-speaking-prod-5",
      "level": 5,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N5 口语情境 5（指示规程）",
      "promptFr": "Formule des procédures de quelques étapes pour répondre à des besoins courants. (Exemples officiels : Formuler à une amie la procédure d’inscription au Guichet d’accès à un médecin de famille. / Formuler à un nouveau collègue la procédure pour déclarer ses heures supplémentaires.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：说明满足日常需求的几步流程。参考情境：Formuler à une amie la procédure d’inscription au Guichet d’accès à un médecin de famille. / Formuler à un nouveau collègue la procédure pour déclarer ses heures supplémentaires.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Formuler à une amie la procédure d’inscription au Guichet d’accès à un médecin de famille.",
        "Formuler à un nouveau collègue la procédure pour déclarer ses heures supplémentaires."
      ]
    },
    {
      "id": "n5-speaking-prod-6",
      "level": 5,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N5 口语情境 6（指示规程）",
      "promptFr": "Fournit des suggestions ou des conseils liés à des situations courantes. (Exemples officiels : Fournir des suggestions à ses voisins concernant le stationnement de leur voiture pendant leur séjour à l’étranger. / Fournir des conseils pour la recherche de logement à une personne nouvellement arrivée au Québec.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：就常见情境提出建议或忠告。参考情境：Fournir des suggestions à ses voisins concernant le stationnement de leur voiture pendant leur séjour à l’étranger. / Fournir des conseils pour la recherche de logement à une personne nouvellement arrivée au Québec.",
      "secondsMin": 60,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Fournir des suggestions à ses voisins concernant le stationnement de leur voiture pendant leur séjour à l’étranger.",
        "Fournir des conseils pour la recherche de logement à une personne nouvellement arrivée au Québec."
      ]
    }
  ],
  "6": [
    {
      "id": "n6-speaking-prod-1",
      "level": 6,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N6 口语情境 1（信息告知）",
      "promptFr": "Interagit pour demander ou fournir des informations détaillées liées à des sujets courants. (Exemples officiels : Interagir avec sa voisine pour échanger des techniques culinaires. / Interagir avec son propriétaire au sujet des travaux de réparation prévus.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：互动中询问或提供常见话题的详细信息。参考情境：Interagir avec sa voisine pour échanger des techniques culinaires. / Interagir avec son propriétaire au sujet des travaux de réparation prévus.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Interagir avec sa voisine pour échanger des techniques culinaires.",
        "Interagir avec son propriétaire au sujet des travaux de réparation prévus."
      ]
    },
    {
      "id": "n6-speaking-prod-2",
      "level": 6,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "descriptif",
      "titleZh": "N6 口语情境 2（描写刻画）",
      "promptFr": "Décrit de façon détaillée une situation ou un événement courants ou une personne. (Exemples officiels : Décrire à une amie les travaux effectués dans son logement. / Décrire son profil personnel lors d’une courte entrevue d’emploi.)",
      "promptZh": "【描写刻画】根据官方量表情境完成口头表达：详细描述常见情境、事件或人物。参考情境：Décrire à une amie les travaux effectués dans son logement. / Décrire son profil personnel lors d’une courte entrevue d’emploi.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Décrire à une amie les travaux effectués dans son logement.",
        "Décrire son profil personnel lors d’une courte entrevue d’emploi."
      ]
    },
    {
      "id": "n6-speaking-prod-3",
      "level": 6,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N6 口语情境 3（事件叙述）",
      "promptFr": "Raconte de façon détaillée des faits divers ou des évènements courants. (Exemples officiels : Raconter à une proche un fait divers concernant un incendie sur sa rue. / Raconter à son conjoint le déroulement d’une rencontre scolaire.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：详细讲述社会新闻或日常事件。参考情境：Raconter à une proche un fait divers concernant un incendie sur sa rue. / Raconter à son conjoint le déroulement d’une rencontre scolaire.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Raconter à une proche un fait divers concernant un incendie sur sa rue.",
        "Raconter à son conjoint le déroulement d’une rencontre scolaire."
      ]
    },
    {
      "id": "n6-speaking-prod-4",
      "level": 6,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N6 口语情境 4（阐释分析）",
      "promptFr": "Explique de façon détaillée une décision ou un choix liés à une situation courante. (Exemples officiels : Expliquer à une proche les raisons ayant mené à sa décision de changer de physiothérapeute. / Expliquer à son employeur les raisons d’une demande de congé sans solde.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：详细解释与日常情境相关的决定或选择。参考情境：Expliquer à une proche les raisons ayant mené à sa décision de changer de physiothérapeute. / Expliquer à son employeur les raisons d’une demande de congé sans solde.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Expliquer à une proche les raisons ayant mené à sa décision de changer de physiothérapeute.",
        "Expliquer à son employeur les raisons d’une demande de congé sans solde."
      ]
    },
    {
      "id": "n6-speaking-prod-5",
      "level": 6,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N6 口语情境 5（指示规程）",
      "promptFr": "Formule des procédures détaillées pour répondre à des besoins courants. (Exemples officiels : Formuler à une collègue la procédure pour demander un remboursement de frais de déplacement. / Formuler à un ami la procédure d’emprunt et de téléchargement d’un livre électronique.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：说明满足日常需求的详细流程。参考情境：Formuler à une collègue la procédure pour demander un remboursement de frais de déplacement. / Formuler à un ami la procédure d’emprunt et de téléchargement d’un livre électronique.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Formuler à une collègue la procédure pour demander un remboursement de frais de déplacement.",
        "Formuler à un ami la procédure d’emprunt et de téléchargement d’un livre électronique."
      ]
    },
    {
      "id": "n6-speaking-prod-6",
      "level": 6,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N6 口语情境 6（情感交际）",
      "promptFr": "Exprime de façon détaillée des émotions ou des sentiments. (Exemples officiels : Exprimer sa joie à l’annonce de la rémission de la maladie grave dont souffre un ami. / Exprimer son mécontentement à des proches à l’égard de sa prestation lors d’une entrevue d’embauche.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：详细表达情绪或感受。参考情境：Exprimer sa joie à l’annonce de la rémission de la maladie grave dont souffre un ami. / Exprimer son mécontentement à des proches à l’égard de sa prestation lors d’une entrevue d’embauche.",
      "secondsMin": 90,
      "selfChecks": [
        "我提供了具体的细节与原因阐释。",
        "我能清晰表达自身经历与情感态度。",
        "发音清晰，母语口音不影响信息理解。"
      ],
      "situations": [
        "Exprimer sa joie à l’annonce de la rémission de la maladie grave dont souffre un ami.",
        "Exprimer son mécontentement à des proches à l’égard de sa prestation lors d’une entrevue d’embauche."
      ]
    }
  ],
  "7": [
    {
      "id": "n7-speaking-prod-1",
      "level": 7,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N7 口语情境 1（信息告知）",
      "promptFr": "Présente des informations liées à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Présenter des informations sur un projet de bénévolat à ses amis. / Présenter à ses collègues les résultats d’un sondage sur la flexibilité des horaires.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：介绍一般性或特定话题的信息。参考情境：Présenter des informations sur un projet de bénévolat à ses amis. / Présenter à ses collègues les résultats d’un sondage sur la flexibilité des horaires.",
      "secondsMin": 120,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Présenter des informations sur un projet de bénévolat à ses amis.",
        "Présenter à ses collègues les résultats d’un sondage sur la flexibilité des horaires."
      ]
    },
    {
      "id": "n7-speaking-prod-2",
      "level": 7,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N7 口语情境 2（事件叙述）",
      "promptFr": "Relate des évènements ou des faits liés à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Relater à une amie le déroulement des évènements ayant mené au congédiement d’une personnalité publique. / Relater les faits liés à une mauvaise expérience en tant que client lors d’un appel au service à la clientèle d’une entreprise.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：叙述一般性或特定话题的事件或事实。参考情境：Relater à une amie le déroulement des évènements ayant mené au congédiement d’une personnalité publique. / Relater les faits liés à une mauvaise expérience en tant que client lors d’un appel au service à la clientèle d’une entreprise.",
      "secondsMin": 120,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Relater à une amie le déroulement des évènements ayant mené au congédiement d’une personnalité publique.",
        "Relater les faits liés à une mauvaise expérience en tant que client lors d’un appel au service à la clientèle d’une entreprise."
      ]
    },
    {
      "id": "n7-speaking-prod-3",
      "level": 7,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N7 口语情境 3（阐释分析）",
      "promptFr": "Donne des explications sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Expliquer à une connaissance les avantages et les inconvénients de l’école publique ou de l’école privée. / Expliquer à un collègue les avantages et les inconvénients du covoiturage.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：就一般性或特定话题做出解释。参考情境：Expliquer à une connaissance les avantages et les inconvénients de l’école publique ou de l’école privée. / Expliquer à un collègue les avantages et les inconvénients du covoiturage.",
      "secondsMin": 120,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Expliquer à une connaissance les avantages et les inconvénients de l’école publique ou de l’école privée.",
        "Expliquer à un collègue les avantages et les inconvénients du covoiturage."
      ]
    },
    {
      "id": "n7-speaking-prod-4",
      "level": 7,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N7 口语情境 4（情感交际）",
      "promptFr": "Émet des commentaires sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Commenter les nouvelles mesures de santé et sécurité en vigueur lors d’une réunion de travail. / Commenter la nouvelle limite de vitesse imposée dans un quartier lors d’une discussion entre voisins.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：就一般性或特定话题发表评论。参考情境：Commenter les nouvelles mesures de santé et sécurité en vigueur lors d’une réunion de travail. / Commenter la nouvelle limite de vitesse imposée dans un quartier lors d’une discussion entre voisins.",
      "secondsMin": 120,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Commenter les nouvelles mesures de santé et sécurité en vigueur lors d’une réunion de travail.",
        "Commenter la nouvelle limite de vitesse imposée dans un quartier lors d’une discussion entre voisins."
      ]
    },
    {
      "id": "n7-speaking-prod-5",
      "level": 7,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "resume",
      "titleZh": "N7 口语情境 5（要点概括）",
      "promptFr": "Résume des productions culturelles ou des évènements liés à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Résumer à une amie l’histoire d’un court-métrage vu dans un festival. / Résumer à des collègues les circonstances ayant mené à une grève des travailleurs.)",
      "promptZh": "【要点概括】根据官方量表情境完成口头表达：概述一般性或特定话题的文化作品或事件。参考情境：Résumer à une amie l’histoire d’un court-métrage vu dans un festival. / Résumer à des collègues les circonstances ayant mené à une grève des travailleurs.",
      "secondsMin": 120,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Résumer à une amie l’histoire d’un court-métrage vu dans un festival.",
        "Résumer à des collègues les circonstances ayant mené à une grève des travailleurs."
      ]
    }
  ],
  "8": [
    {
      "id": "n8-speaking-prod-1",
      "level": 8,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "informatif",
      "titleZh": "N8 口语情境 1（信息告知）",
      "promptFr": "Présente de façon structurée des informations liées à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Présenter les retombées sociales et scientifiques d’une recherche en cours à ses collègues. / Présenter à une nouvelle collègue les possibilités de perfectionnement professionnel dans leur entreprise.)",
      "promptZh": "【信息告知】根据官方量表情境完成口头表达：有条理地介绍一般性或特定话题的信息。参考情境：Présenter les retombées sociales et scientifiques d’une recherche en cours à ses collègues. / Présenter à une nouvelle collègue les possibilités de perfectionnement professionnel dans leur entreprise.",
      "secondsMin": 150,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Présenter les retombées sociales et scientifiques d’une recherche en cours à ses collègues.",
        "Présenter à une nouvelle collègue les possibilités de perfectionnement professionnel dans leur entreprise."
      ]
    },
    {
      "id": "n8-speaking-prod-2",
      "level": 8,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N8 口语情境 2（事件叙述）",
      "promptFr": "Relate de façon structurée des évènements ou des faits liés à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Relater à une proche le déroulement d’une exploration spatiale. / Relater à un collègue les faits saillants abordés lors d’une rencontre syndicale.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：有条理地叙述一般性或特定话题的事件或事实。参考情境：Relater à une proche le déroulement d’une exploration spatiale. / Relater à un collègue les faits saillants abordés lors d’une rencontre syndicale.",
      "secondsMin": 150,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Relater à une proche le déroulement d’une exploration spatiale.",
        "Relater à un collègue les faits saillants abordés lors d’une rencontre syndicale."
      ]
    },
    {
      "id": "n8-speaking-prod-3",
      "level": 8,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N8 口语情境 3（阐释分析）",
      "promptFr": "Donne de façon structurée des explications liées à des sujets d’intérêt général ou à des sujets spécifiques. (Exemples officiels : Expliquer à ses collègues les causes derrière le rejet d’un projet d’investissement à l’international proposé par son département. / Expliquer à un proche le fonctionnement et le déroulement d’un tournoi sportif international.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：有条理地解释一般性或特定话题。参考情境：Expliquer à ses collègues les causes derrière le rejet d’un projet d’investissement à l’international proposé par son département. / Expliquer à un proche le fonctionnement et le déroulement d’un tournoi sportif international.",
      "secondsMin": 150,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Expliquer à ses collègues les causes derrière le rejet d’un projet d’investissement à l’international proposé par son département.",
        "Expliquer à un proche le fonctionnement et le déroulement d’un tournoi sportif international."
      ]
    },
    {
      "id": "n8-speaking-prod-4",
      "level": 8,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N8 口语情境 4（指示规程）",
      "promptFr": "Formule des procédures détaillées pour répondre à des besoins spécifiques. (Exemples officiels : Formuler à un collègue la procédure à suivre en cas d’accident de travail. / Formuler à une connaissance la procédure à suivre pour faire une demande d’immigration en tant que travailleur qualifié.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：说明满足特定需求的详细流程。参考情境：Formuler à un collègue la procédure à suivre en cas d’accident de travail. / Formuler à une connaissance la procédure à suivre pour faire une demande d’immigration en tant que travailleur qualifié.",
      "secondsMin": 150,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Formuler à un collègue la procédure à suivre en cas d’accident de travail.",
        "Formuler à une connaissance la procédure à suivre pour faire une demande d’immigration en tant que travailleur qualifié."
      ]
    },
    {
      "id": "n8-speaking-prod-5",
      "level": 8,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N8 口语情境 5（观点论证）",
      "promptFr": "Donne son opinion sur des sujets d’intérêt général ou des sujets spécifiques. (Exemples officiels : Donner à un ami son opinion sur une décision concernant la santé publique récemment adoptée par le gouvernement. / Donner son opinion lors d’une discussion entre collègues sur l’impact des réseaux sociaux sur la vie des jeunes.)",
      "promptZh": "【观点论证】根据官方量表情境完成口头表达：就一般性或特定话题发表个人观点。参考情境：Donner à un ami son opinion sur une décision concernant la santé publique récemment adoptée par le gouvernement. / Donner son opinion lors d’une discussion entre collègues sur l’impact des réseaux sociaux sur la vie des jeunes.",
      "secondsMin": 150,
      "selfChecks": [
        "发言逻辑清晰，有明确观点与论据。",
        "我使用了较为丰富的词汇和复合句式。",
        "语调与节奏自然，语音掌握稳定。"
      ],
      "situations": [
        "Donner à un ami son opinion sur une décision concernant la santé publique récemment adoptée par le gouvernement.",
        "Donner son opinion lors d’une discussion entre collègues sur l’impact des réseaux sociaux sur la vie des jeunes."
      ]
    }
  ],
  "9": [
    {
      "id": "n9-speaking-prod-1",
      "level": 9,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N9 口语情境 1（阐释分析）",
      "promptFr": "Expose des informations sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Exposer le concept d’un projet architectural vert à une cliente. / Exposer un type d’ouverture dans une partie d’échecs à un ami.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：系统阐述专业/兴趣领域的信息。参考情境：Exposer le concept d’un projet architectural vert à une cliente. / Exposer un type d’ouverture dans une partie d’échecs à un ami.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Exposer le concept d’un projet architectural vert à une cliente.",
        "Exposer un type d’ouverture dans une partie d’échecs à un ami."
      ]
    },
    {
      "id": "n9-speaking-prod-2",
      "level": 9,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N9 口语情境 2（事件叙述）",
      "promptFr": "Relate avec aisance des faits liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Relater à des stagiaires les actions prises par son entreprise pour contrer la pénurie de main-d’œuvre. / Relater à un ami le parcours ayant mené à l’ascension d’une personnalité politique.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：轻松叙述专业/兴趣领域的事实。参考情境：Relater à des stagiaires les actions prises par son entreprise pour contrer la pénurie de main-d’œuvre. / Relater à un ami le parcours ayant mené à l’ascension d’une personnalité politique.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Relater à des stagiaires les actions prises par son entreprise pour contrer la pénurie de main-d’œuvre.",
        "Relater à un ami le parcours ayant mené à l’ascension d’une personnalité politique."
      ]
    },
    {
      "id": "n9-speaking-prod-3",
      "level": 9,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N9 口语情境 3（阐释分析）",
      "promptFr": "Donne avec aisance des explications liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Donner à ses collègues des explications sur les limites d’une pratique professionnelle. / Donner à des amateurs d’ornithologie des explications relatives au comportement d’une espèce d’oiseau.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：轻松解释专业/兴趣领域的问题。参考情境：Donner à ses collègues des explications sur les limites d’une pratique professionnelle. / Donner à des amateurs d’ornithologie des explications relatives au comportement d’une espèce d’oiseau.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Donner à ses collègues des explications sur les limites d’une pratique professionnelle.",
        "Donner à des amateurs d’ornithologie des explications relatives au comportement d’une espèce d’oiseau."
      ]
    },
    {
      "id": "n9-speaking-prod-4",
      "level": 9,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N9 口语情境 4（指示规程）",
      "promptFr": "Donne des directives liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Donner à un stagiaire des directives liées aux formalités douanières de fouille électronique. / Donner des directives d’arbitrage à un groupe de bénévoles pour un tournoi de soccer.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：下达专业/兴趣领域的指示。参考情境：Donner à un stagiaire des directives liées aux formalités douanières de fouille électronique. / Donner des directives d’arbitrage à un groupe de bénévoles pour un tournoi de soccer.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Donner à un stagiaire des directives liées aux formalités douanières de fouille électronique.",
        "Donner des directives d’arbitrage à un groupe de bénévoles pour un tournoi de soccer."
      ]
    },
    {
      "id": "n9-speaking-prod-5",
      "level": 9,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N9 口语情境 5（情感交际）",
      "promptFr": "Exprime avec aisance une variété d’émotions ou de sentiments. (Exemples officiels : Exprimer à la fois sa reconnaissance et sa déception à l’égard d’un collègue qui quitte son poste. / Exprimer à des connaissances l’ambivalence de ses sentiments quant à la perspective de travailler à l’étranger.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：轻松表达多种情绪或感受。参考情境：Exprimer à la fois sa reconnaissance et sa déception à l’égard d’un collègue qui quitte son poste. / Exprimer à des connaissances l’ambivalence de ses sentiments quant à la perspective de travailler à l’étranger.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Exprimer à la fois sa reconnaissance et sa déception à l’égard d’un collègue qui quitte son poste.",
        "Exprimer à des connaissances l’ambivalence de ses sentiments quant à la perspective de travailler à l’étranger."
      ]
    },
    {
      "id": "n9-speaking-prod-6",
      "level": 9,
      "taskIndex": 6,
      "skill": "speaking",
      "typeDeDiscours": "resume",
      "titleZh": "N9 口语情境 6（要点概括）",
      "promptFr": "Résume avec aisance des informations liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Résumer à des collègues le contenu d’une formation reçue lors d’un congrès. / Résumer à des amis les techniques d’un maitre brasseur.)",
      "promptZh": "【要点概括】根据官方量表情境完成口头表达：轻松概述专业/兴趣领域的信息。参考情境：Résumer à des collègues le contenu d’une formation reçue lors d’un congrès. / Résumer à des amis les techniques d’un maitre brasseur.",
      "secondsMin": 180,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Résumer à des collègues le contenu d’une formation reçue lors d’un congrès.",
        "Résumer à des amis les techniques d’un maitre brasseur."
      ]
    }
  ],
  "10": [
    {
      "id": "n10-speaking-prod-1",
      "level": 10,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N10 口语情境 1（阐释分析）",
      "promptFr": "Expose avec précision des informations sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Exposer à ses collègues les exigences d’un appel d’offres pour l’achat d’équipements agricoles. / Exposer à un groupe de parents les fondements et les bienfaits de la méditation pour les enfants.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：精准阐述专业/兴趣领域的信息。参考情境：Exposer à ses collègues les exigences d’un appel d’offres pour l’achat d’équipements agricoles. / Exposer à un groupe de parents les fondements et les bienfaits de la méditation pour les enfants.",
      "secondsMin": 210,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Exposer à ses collègues les exigences d’un appel d’offres pour l’achat d’équipements agricoles.",
        "Exposer à un groupe de parents les fondements et les bienfaits de la méditation pour les enfants."
      ]
    },
    {
      "id": "n10-speaking-prod-2",
      "level": 10,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N10 口语情境 2（阐释分析）",
      "promptFr": "Explique avec précision des phénomènes ou des principes liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Expliquer un phénomène d’érosion fluviale lors d’un cours magistral. / Expliquer les principes de l’égalité homme-femme dans le cadre d’un atelier sur les valeurs québécoises.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：精准解释专业/兴趣领域的现象或原理。参考情境：Expliquer un phénomène d’érosion fluviale lors d’un cours magistral. / Expliquer les principes de l’égalité homme-femme dans le cadre d’un atelier sur les valeurs québécoises.",
      "secondsMin": 210,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Expliquer un phénomène d’érosion fluviale lors d’un cours magistral.",
        "Expliquer les principes de l’égalité homme-femme dans le cadre d’un atelier sur les valeurs québécoises."
      ]
    },
    {
      "id": "n10-speaking-prod-3",
      "level": 10,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "injonctif",
      "titleZh": "N10 口语情境 3（指示规程）",
      "promptFr": "Donne des directives complexes liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Donner des directives d’interprétation à un comédien en préparation à un rôle dans une pièce de théâtre. / Donner des directives sur de nouvelles mesures en santé et sécurité lors d’une formation en entreprise.)",
      "promptZh": "【指示规程】根据官方量表情境完成口头表达：下达专业/兴趣领域的复杂指示。参考情境：Donner des directives d’interprétation à un comédien en préparation à un rôle dans une pièce de théâtre. / Donner des directives sur de nouvelles mesures en santé et sécurité lors d’une formation en entreprise.",
      "secondsMin": 210,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Donner des directives d’interprétation à un comédien en préparation à un rôle dans une pièce de théâtre.",
        "Donner des directives sur de nouvelles mesures en santé et sécurité lors d’une formation en entreprise."
      ]
    },
    {
      "id": "n10-speaking-prod-4",
      "level": 10,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N10 口语情境 4（观点论证）",
      "promptFr": "Argumente sur des sujets liés à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Argumenter avec une collaboratrice sur l’architecture d’une nouvelle école. / Argumenter avec des proches sur les façons de diminuer son empreinte écologique.)",
      "promptZh": "【观点论证】根据官方量表情境完成口头表达：就专业/兴趣领域的话题进行论证。参考情境：Argumenter avec une collaboratrice sur l’architecture d’une nouvelle école. / Argumenter avec des proches sur les façons de diminuer son empreinte écologique.",
      "secondsMin": 210,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Argumenter avec une collaboratrice sur l’architecture d’une nouvelle école.",
        "Argumenter avec des proches sur les façons de diminuer son empreinte écologique."
      ]
    },
    {
      "id": "n10-speaking-prod-5",
      "level": 10,
      "taskIndex": 5,
      "skill": "speaking",
      "typeDeDiscours": "resume",
      "titleZh": "N10 口语情境 5（要点概括）",
      "promptFr": "Résume avec précision des informations liées à son domaine d’expertise ou à ses champs d’intérêt. (Exemples officiels : Résumer à une collègue la démarche méthodologique retenue pour son prochain projet de recherche. / Résumer à un ami le bilan de l’impact de la pollution lumineuse sur le comportement d’organismes vivants.)",
      "promptZh": "【要点概括】根据官方量表情境完成口头表达：精准概述专业/兴趣领域的信息。参考情境：Résumer à une collègue la démarche méthodologique retenue pour son prochain projet de recherche. / Résumer à un ami le bilan de l’impact de la pollution lumineuse sur le comportement d’organismes vivants.",
      "secondsMin": 210,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Résumer à une collègue la démarche méthodologique retenue pour son prochain projet de recherche.",
        "Résumer à un ami le bilan de l’impact de la pollution lumineuse sur le comportement d’organismes vivants."
      ]
    }
  ],
  "11": [
    {
      "id": "n11-speaking-prod-1",
      "level": 11,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N11 口语情境 1（阐释分析）",
      "promptFr": "Expose de façon finement articulée des informations liées à des sujets diversifiés. (Exemples officiels : Exposer les bonnes pratiques en matière de gestion lors d’une formation. / Exposer dans une vidéo éducative les spécificités du système électoral de son pays.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：细腻有层次地阐述多样话题的信息。参考情境：Exposer les bonnes pratiques en matière de gestion lors d’une formation. / Exposer dans une vidéo éducative les spécificités du système électoral de son pays.",
      "secondsMin": 240,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Exposer les bonnes pratiques en matière de gestion lors d’une formation.",
        "Exposer dans une vidéo éducative les spécificités du système électoral de son pays."
      ]
    },
    {
      "id": "n11-speaking-prod-2",
      "level": 11,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "narratif",
      "titleZh": "N11 口语情境 2（事件叙述）",
      "promptFr": "Relate de façon finement articulée des faits liés à des sujets diversifiés. (Exemples officiels : Relater l’histoire d’une civilisation disparue dans le cadre d’une conférence grand public. / Relater à des amis l’évolution du flux migratoire au Canada après la Deuxième Guerre mondiale.)",
      "promptZh": "【事件叙述】根据官方量表情境完成口头表达：细腻有层次地叙述多样话题的事实。参考情境：Relater l’histoire d’une civilisation disparue dans le cadre d’une conférence grand public. / Relater à des amis l’évolution du flux migratoire au Canada après la Deuxième Guerre mondiale.",
      "secondsMin": 240,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Relater l’histoire d’une civilisation disparue dans le cadre d’une conférence grand public.",
        "Relater à des amis l’évolution du flux migratoire au Canada après la Deuxième Guerre mondiale."
      ]
    },
    {
      "id": "n11-speaking-prod-3",
      "level": 11,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N11 口语情境 3（阐释分析）",
      "promptFr": "Explique de façon finement articulée des enjeux liés à des sujets diversifiés. (Exemples officiels : Expliquer à une intervenante les enjeux vécus par une personne nouvellement arrivée dans le cadre d’une médiation interculturelle. / Expliquer les enjeux économiques des paradis fiscaux lors d’une table ronde.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：细腻有层次地解释多样话题的利害。参考情境：Expliquer à une intervenante les enjeux vécus par une personne nouvellement arrivée dans le cadre d’une médiation interculturelle. / Expliquer les enjeux économiques des paradis fiscaux lors d’une table ronde.",
      "secondsMin": 240,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Expliquer à une intervenante les enjeux vécus par une personne nouvellement arrivée dans le cadre d’une médiation interculturelle.",
        "Expliquer les enjeux économiques des paradis fiscaux lors d’une table ronde."
      ]
    },
    {
      "id": "n11-speaking-prod-4",
      "level": 11,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N11 口语情境 4（观点论证）",
      "promptFr": "Argumente sur des enjeux liés à des sujets diversifiés. (Exemples officiels : Argumenter avec d’autres spécialistes de l’incidence de certains types de jeux vidéos sur le comportement des adolescents. / Argumenter lors d’un échange avec des voisins sur la conversion d’un stationnement en jardin collectif.)",
      "promptZh": "【观点论证】根据官方量表情境完成口头表达：就多样话题的利害进行论证。参考情境：Argumenter avec d’autres spécialistes de l’incidence de certains types de jeux vidéos sur le comportement des adolescents. / Argumenter lors d’un échange avec des voisins sur la conversion d’un stationnement en jardin collectif.",
      "secondsMin": 240,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Argumenter avec d’autres spécialistes de l’incidence de certains types de jeux vidéos sur le comportement des adolescents.",
        "Argumenter lors d’un échange avec des voisins sur la conversion d’un stationnement en jardin collectif."
      ]
    }
  ],
  "12": [
    {
      "id": "n12-speaking-prod-1",
      "level": 12,
      "taskIndex": 1,
      "skill": "speaking",
      "typeDeDiscours": "explicatif",
      "titleZh": "N12 口语情境 1（阐释分析）",
      "promptFr": "Met en perspective des informations à la croisée de différents domaines. (Exemples officiels : Mettre en perspective, pour la famille d’un patient, les bienfaits de la zoothérapie selon un point de vue physique, psychoaffectif et cognitif. / Mettre en perspective, pour un groupe d’étudiants, l’influence des facteurs climatiques sur la biodiversité marine.)",
      "promptZh": "【阐释分析】根据官方量表情境完成口头表达：多角度审视跨领域信息。参考情境：Mettre en perspective, pour la famille d’un patient, les bienfaits de la zoothérapie selon un point de vue physique, psychoaffectif et cognitif. / Mettre en perspective, pour un groupe d’étudiants, l’influence des facteurs climatiques sur la biodiversité marine.",
      "secondsMin": 270,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Mettre en perspective, pour la famille d’un patient, les bienfaits de la zoothérapie selon un point de vue physique, psychoaffectif et cognitif.",
        "Mettre en perspective, pour un groupe d’étudiants, l’influence des facteurs climatiques sur la biodiversité marine."
      ]
    },
    {
      "id": "n12-speaking-prod-2",
      "level": 12,
      "taskIndex": 2,
      "skill": "speaking",
      "typeDeDiscours": "argumentatif",
      "titleZh": "N12 口语情境 2（观点论证）",
      "promptFr": "Débat sur des enjeux à la croisée de différents domaines. (Exemples officiels : Débattre d’un projet de loi avec d’autres membres d’un comité citoyen. / Débattre de la mise en place d’une politique de conciliation travail-famille avec la partie patronale.)",
      "promptZh": "【观点论证】根据官方量表情境完成口头表达：就跨领域议题展开辩论。参考情境：Débattre d’un projet de loi avec d’autres membres d’un comité citoyen. / Débattre de la mise en place d’une politique de conciliation travail-famille avec la partie patronale.",
      "secondsMin": 270,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Débattre d’un projet de loi avec d’autres membres d’un comité citoyen.",
        "Débattre de la mise en place d’une politique de conciliation travail-famille avec la partie patronale."
      ]
    },
    {
      "id": "n12-speaking-prod-3",
      "level": 12,
      "taskIndex": 3,
      "skill": "speaking",
      "typeDeDiscours": "expressif",
      "titleZh": "N12 口语情境 3（情感交际）",
      "promptFr": "Exprime de façon créative ses émotions, ses sentiments ou ses intentions. (Exemples officiels : Exprimer ses émotions et ses sentiments dans une allocution lors du mariage d’un proche. / Exprimer ses sentiments et ses intentions à ses collègues lors d’une intervention visant la résolution d’un conflit.)",
      "promptZh": "【情感交际】根据官方量表情境完成口头表达：富有创造性地表达情绪、感受或意图。参考情境：Exprimer ses émotions et ses sentiments dans une allocution lors du mariage d’un proche. / Exprimer ses sentiments et ses intentions à ses collègues lors d’une intervention visant la résolution d’un conflit.",
      "secondsMin": 270,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Exprimer ses émotions et ses sentiments dans une allocution lors du mariage d’un proche.",
        "Exprimer ses sentiments et ses intentions à ses collègues lors d’une intervention visant la résolution d’un conflit."
      ]
    },
    {
      "id": "n12-speaking-prod-4",
      "level": 12,
      "taskIndex": 4,
      "skill": "speaking",
      "typeDeDiscours": "resume",
      "titleZh": "N12 口语情境 4（要点概括）",
      "promptFr": "Synthétise des informations à la croisée de différents domaines. (Exemples officiels : Synthétiser, à l’attention du grand public, les recommandations formulées lors d’une consultation publique sur un projet d’ensemble résidentiel. / Synthétiser les arguments en faveur d’investissements socialement responsables lors d’une conférence.)",
      "promptZh": "【要点概括】根据官方量表情境完成口头表达：综合归纳跨领域信息。参考情境：Synthétiser, à l’attention du grand public, les recommandations formulées lors d’une consultation publique sur un projet d’ensemble résidentiel. / Synthétiser les arguments en faveur d’investissements socialement responsables lors d’une conférence.",
      "secondsMin": 270,
      "selfChecks": [
        "发言论证严谨，逻辑层层递进。",
        "我自如运用了专业表达与细致区分。",
        "语音流畅自如，语用得体自然。"
      ],
      "situations": [
        "Synthétiser, à l’attention du grand public, les recommandations formulées lors d’une consultation publique sur un projet d’ensemble résidentiel.",
        "Synthétiser les arguments en faveur d’investissements socialement responsables lors d’une conférence."
      ]
    }
  ]
};

export function getProductionTaskPool(skill, level) {
  if (skill === 'writing') return WRITING_TASK_POOLS[level] || [];
  if (skill === 'speaking') return SPEAKING_TASK_POOLS[level] || [];
  return [];
}
