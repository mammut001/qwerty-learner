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
