// Grammar concepts behind the « dimensions linguistiques » of the Échelle québécoise.
// `sources` lists the exact scale wording (and whether it is a « Une variété de » entry);
// each question is [prompt, correct answer, distractor, distractor].
export const SENTENCE_GRAMMAR = [
  {
    id: 'present',
    titleZh: '直陈式现在时',
    explanationZh: '描述现在的状态、习惯和普遍事实。重点记住高频不规则动词：être, avoir, aller, faire, prendre, venir, pouvoir, vouloir。',
    examples: [
      ['Nous habitons à Montréal depuis deux ans.', '我们在蒙特利尔住了两年。'],
      ['Elle prend le métro tous les matins.', '她每天早上坐地铁。'],
    ],
    sources: [
      ['Quelques verbes à l’indicatif présent', false],
      ['Une variété de verbes à l’indicatif présent', true],
    ],
    questions: [
      ['Nous ___ à Montréal depuis deux ans.', 'habitons', 'habitez', 'habitent'],
      ['Elle ___ le bus tous les matins.', 'prend', 'prends', 'prenons'],
      ['Ils ___ leurs devoirs le soir.', 'font', 'faisent', 'fait'],
      ['Vous ___ venir à quelle heure ?', 'pouvez', 'pouvons', 'peuvez'],
    ],
  },
  {
    id: 'imperatif',
    titleZh: '命令式',
    explanationZh: '用于下指令、提建议、提醒禁止。只有 tu / nous / vous 三个人称，不写主语；-er 动词 tu 式去掉 s。肯定句代词放动词后并加连字符（Mets-le）。',
    examples: [
      ['Ferme la porte, s’il te plaît.', '请关门。'],
      ['Ne sois pas en retard !', '别迟到！'],
    ],
    sources: [
      ['Quelques verbes à l’impératif présent', false],
      ['Des verbes à l’impératif présent', false],
      ['Une variété de verbes à l’impératif présent', true],
    ],
    questions: [
      ['(à un ami) ___ la porte, s’il te plaît.', 'Ferme', 'Fermes', 'Fermer'],
      ['(à la classe) ___ vos livres à la page 10.', 'Ouvrez', 'Ouvrir', 'Ouvrent'],
      ['Ne ___ pas en retard demain !', 'sois', 'es', 'être'],
      ['Ton manteau ? ___ , il fait froid.', 'Mets-le', 'Le mets', 'Mets-lui'],
    ],
  },
  {
    id: 'interrogation',
    titleZh: '疑问句与疑问词',
    explanationZh: '一般疑问句可用语调、Est-ce que 或倒装；特殊疑问句用 où, quand, combien, comment, pourquoi, qui, quel / lequel 等。',
    examples: [
      ['Où est-ce que tu habites ?', '你住在哪里？'],
      ['Lequel préfères-tu ?', '你更喜欢哪一个？'],
    ],
    sources: [
      ['L’interrogation totale ou partielle formulée à l’aide de quelques mots interrogatifs', false],
      ['Des phrases interrogatives totales ou partielles formulées à l’aide de quelques mots interrogatifs', false],
      ['L’interrogation partielle formulée à l’aide d’une variété de mots interrogatifs', true],
      ['Des phrases interrogatives partielles formulées à l’aide d’une variété de mots interrogatifs', true],
    ],
    questions: [
      ['— ___ tu habites ? — À Laval.', 'Où', 'Quand', 'Combien'],
      ['— ___ coûte ce billet ? — 3,75 $.', 'Combien', 'Comment', 'Pourquoi'],
      ['— ___ partez-vous si tôt ? — Parce que j’ai un rendez-vous.', 'Pourquoi', 'Qui', 'Quel'],
      ['Le thé ou le café : ___ est-ce que tu préfères ?', 'lequel', 'laquelle', 'quoi'],
    ],
  },
  {
    id: 'negation',
    titleZh: '否定 ne … pas',
    explanationZh: 'ne 放在变位动词前，pas 放在其后；复合时态夹住助动词。否定句中不定冠词 un / une / des 变成 de。口语里 ne 常被省略。',
    examples: [
      ['Elle ne mange pas de viande.', '她不吃肉。'],
      ['Je n’ai pas compris.', '我没听懂。'],
    ],
    sources: [
      ['La négation avec (ne)… pas', false],
      ['Des phrases négatives avec (ne)… pas', false],
      ['La négation avec ne… pas', false],
      ['Des phrases négatives avec ne… pas', false],
    ],
    questions: [
      ['Quelle phrase est correcte ?', 'Elle ne mange pas de viande.', 'Elle mange ne pas de viande.', 'Elle ne pas mange de viande.'],
      ['Il n’a pas ___ voiture.', 'de', 'une', 'la'],
      ['Je ___ comprends ___ la question.', 'ne … pas', 'pas … ne', 'non … pas'],
      ['Quelle phrase est correcte ?', 'Nous n’avons pas fini.', 'Nous avons ne pas fini.', 'Nous n’avons fini pas.'],
    ],
  },
  {
    id: 'phrases-base',
    titleZh: '基本句型',
    explanationZh: '法语基本语序是「主语 + 动词 + 补语」。注意 être（是）和 avoir（有、年龄）的区别。',
    examples: [
      ['Mon frère est étudiant.', '我哥哥是学生。'],
      ['J’ai trente ans.', '我三十岁。'],
    ],
    sources: [['Des phrases de base', false]],
    questions: [
      ['Quel ordre est correct ?', 'Marie achète du pain.', 'Achète Marie du pain.', 'Du pain achète Marie.'],
      ['Mon frère ___ étudiant.', 'est', 'a', 'et'],
      ['J’___ trente ans.', 'ai', 'suis', 'a'],
      ['Quelle phrase est complète ?', 'Le bus arrive à huit heures.', 'Arrive à huit heures.', 'Le bus à huit heures.'],
    ],
  },
  {
    id: 'ponctuation',
    titleZh: '标点符号',
    explanationZh: '句号、问号、感叹号、逗号、冒号与法式引号 « »。法语里 ? ! : ; 和 » 前通常要加空格。',
    examples: [
      ['Tu viens ce soir ?', '你今晚来吗？'],
      ['Il a dit : « J’arrive. »', '他说：“我到了。”'],
    ],
    sources: [
      ['Quelques signes de ponctuation', false],
      ['Une variété de signes de ponctuation', true],
    ],
    questions: [
      ['Quel signe termine une question ?', '?', '.', ','],
      ['Les guillemets français s’écrivent :', '« … »', '“ … ”', '‹ … ›'],
      ['Pour annoncer une liste ou une explication, on utilise :', 'les deux-points', 'le point d’exclamation', 'le point final'],
      ['Dans « Paul, viens ici ! », la virgule sert à :', 'isoler la personne à qui l’on parle', 'terminer la phrase', 'marquer une question'],
    ],
  },
  {
    id: 'futur-proche',
    titleZh: '最近将来时 aller + 不定式',
    explanationZh: '表示马上或计划中要发生的事：aller 现在时变位 + 动词原形。',
    examples: [
      ['Demain, je vais visiter le Vieux-Québec.', '明天我要去逛魁北克老城。'],
      ['Attention, il va pleuvoir !', '小心，要下雨了！'],
    ],
    sources: [['Des verbes au futur proche', false]],
    questions: [
      ['Demain, je ___ visiter le Vieux-Québec.', 'vais', 'suis', 'vas'],
      ['Attention, il ___ pleuvoir !', 'va', 'vient', 'a'],
      ['Nous ___ déménager en juillet.', 'allons', 'avons', 'sommes'],
      ['Ils ___ partir dans cinq minutes.', 'vont', 'sont', 'font'],
    ],
  },
  {
    id: 'conditionnel-politesse',
    titleZh: '条件式表礼貌',
    explanationZh: '用条件式现在时让请求更委婉：je voudrais, pourriez-vous, j’aimerais。',
    examples: [
      ['Je voudrais un café, s’il vous plaît.', '我想要一杯咖啡。'],
      ['Pourriez-vous m’aider ?', '您能帮我一下吗？'],
    ],
    sources: [['Quelques verbes au conditionnel présent comme forme de politesse', false]],
    questions: [
      ['Je ___ un café, s’il vous plaît.', 'voudrais', 'voudrai', 'voulais'],
      ['___-vous m’aider, s’il vous plaît ?', 'Pourriez', 'Pourrez', 'Pouviez'],
      ['Est-ce que tu ___ me prêter ton stylo ?', 'pourrais', 'pourras', 'pouvais'],
      ['Nous ___ réserver une table pour deux.', 'aimerions', 'aimerons', 'aimions'],
    ],
  },
  {
    id: 'gerondif',
    titleZh: '副动词 en + -ant',
    explanationZh: '表示同时进行、方式或条件：en + 现在分词（nous 式去 -ons 加 -ant）。主语必须与主句一致。',
    examples: [
      ['Elle écoute la radio en cuisinant.', '她边做饭边听广播。'],
      ['En partant tôt, tu éviteras les bouchons.', '早点出发就能避开堵车。'],
    ],
    sources: [
      ['Quelques verbes au gérondif', false],
      ['Des verbes au gérondif', false],
      ['Une variété de verbes au gérondif', true],
    ],
    questions: [
      ['Je me suis blessé ___ du vélo.', 'en faisant', 'en fait', 'en faire'],
      ['Elle écoute la radio ___ le souper.', 'en préparant', 'en préparer', 'en préparé'],
      ['C’est ___ qu’on devient forgeron.', 'en forgeant', 'en forger', 'en forgé'],
      ['___ tôt, tu éviteras les bouchons.', 'En partant', 'En partir', 'En parti'],
    ],
  },
  {
    id: 'si-condition',
    titleZh: 'si 引导的条件',
    explanationZh: '真实条件：si + 现在时，主句用现在时、命令式或简单将来时。si 后面不能接将来时或条件式。',
    examples: [
      ['Si tu es fatigué, repose-toi.', '累了就休息吧。'],
      ['S’il pleut, le match sera annulé.', '如果下雨，比赛就取消。'],
    ],
    sources: [['La condition introduite par si', false]],
    questions: [
      ['Si tu ___ fatigué, repose-toi.', 'es', 'seras', 'serais'],
      ['Si vous avez des questions, ___-moi.', 'appelez', 'appelleriez', 'appeliez'],
      ['Si on ___ le temps, on ira au parc.', 'a', 'aura', 'aurait'],
      ['S’il ___ demain, le match sera annulé.', 'pleut', 'pleuvra', 'pleuvrait'],
    ],
  },
  {
    id: 'modaux',
    titleZh: '情态助动词',
    explanationZh: 'pouvoir（能、可以）、devoir（必须）、vouloir（想）、savoir（会）、il faut（需要）后面直接接动词原形。',
    examples: [
      ['Vous devez remplir ce formulaire.', '您必须填写这张表。'],
      ['Je sais nager.', '我会游泳。'],
    ],
    sources: [['Des auxiliaires de modalité', false]],
    questions: [
      ['Tu ___ venir avec nous si tu veux.', 'peux', 'dois de', 'sais à'],
      ['Il ___ présenter une pièce d’identité.', 'faut', 'doit de', 'veut que'],
      ['Je ___ nager depuis l’âge de cinq ans.', 'sais', 'connais', 'peux savoir'],
      ['Vous ___ remplir ce formulaire avant lundi.', 'devez', 'devez de', 'doivent'],
    ],
  },
  {
    id: 'passe-compose',
    titleZh: '复合过去时',
    explanationZh: '讲述已完成的动作：avoir / être 现在时 + 过去分词。位移类动词和代词式动词用 être，过去分词与主语配合。',
    examples: [
      ['Hier, nous sommes allés au cinéma.', '昨天我们去看了电影。'],
      ['Elle a laissé ses clés sur la table.', '她把钥匙落在桌上了。'],
    ],
    sources: [
      ['Quelques verbes au passé composé', false],
      ['Une variété de verbes au passé composé', true],
    ],
    questions: [
      ['Hier, nous ___ au cinéma.', 'sommes allés', 'avons allé', 'sommes allé'],
      ['Elle ___ ses clés sur la table.', 'a laissé', 'est laissée', 'a laissée'],
      ['Ils ___ tard ce matin.', 'se sont levés', 'ont levés', 'se sont levé'],
      ['J’___ ce film deux fois.', 'ai vu', 'ai vus', 'suis vu'],
    ],
  },
  {
    id: 'futur-simple',
    titleZh: '简单将来时',
    explanationZh: '表示将来的计划或预测：多数动词用不定式 + -ai, -as, -a, -ons, -ez, -ont；不规则词根要背：ser-, aur-, ir-, fer-, viendr-, pourr-。',
    examples: [
      ['L’an prochain, je travaillerai à Toronto.', '明年我会在多伦多工作。'],
      ['Il fera beau demain.', '明天天气会很好。'],
    ],
    sources: [
      ['Quelques verbes au futur simple', false],
      ['Des verbes au futur simple', false],
      ['Une variété de verbes au futur simple', true],
    ],
    questions: [
      ['L’an prochain, je ___ à Toronto.', 'travaillerai', 'travaillerais', 'travaillais'],
      ['Nous ___ vous voir dimanche.', 'viendrons', 'venirons', 'viendrions'],
      ['Quand tu ___ grand, tu comprendras.', 'seras', 'es', 'serais'],
      ['Il ___ beau demain sur la Côte-Nord.', 'fera', 'faira', 'ferait'],
    ],
  },
  {
    id: 'determinants',
    titleZh: '多样的限定词',
    explanationZh: '冠词（定冠词、不定冠词、部分冠词 du / de la / de l’）、指示形容词 ce / cette / ces、物主形容词、chaque 等。',
    examples: [
      ['Je voudrais de l’eau.', '我想要点水。'],
      ['Chaque étudiant reçoit un badge.', '每个学生领一个胸牌。'],
    ],
    sources: [['Des déterminants diversifiés', false]],
    questions: [
      ['Je voudrais ___ eau, s’il vous plaît.', 'de l’', 'du', 'de la'],
      ['___ enfants jouent dans le parc.', 'Ces', 'Cette', 'Ce'],
      ['C’est ___ voiture de ma sœur.', 'la', 'le', 'les'],
      ['___ étudiant doit remplir le formulaire.', 'Chaque', 'Chaques', 'Tous'],
    ],
  },
  {
    id: 'adverbes',
    titleZh: '频率、比较、程度副词',
    explanationZh: '频率：souvent, rarement, jamais；比较：plus / moins / aussi … que；程度：très, trop, assez, beaucoup。',
    examples: [
      ['Je vais souvent au gym.', '我经常去健身房。'],
      ['Ce manteau est plus cher que l’autre.', '这件大衣比那件贵。'],
    ],
    sources: [['Des adverbes de fréquence, de comparaison, d’intensité', false]],
    questions: [
      ['Je vais ___ au gym : trois fois par semaine.', 'souvent', 'jamais', 'rarement'],
      ['Ce manteau est ___ cher que l’autre.', 'plus', 'très', 'beaucoup'],
      ['Il fait ___ froid en janvier !', 'très', 'beaucoup', 'plus que'],
      ['Elle parle ___ vite : je ne comprends rien.', 'trop', 'assez de', 'beaucoup de'],
    ],
  },
  {
    id: 'relatifs-simples',
    titleZh: '简单关系代词',
    explanationZh: 'qui（作主语）、que（作直接宾语）、où（地点、时间）、dont（代替 de + 名词）。',
    examples: [
      ['C’est la dame qui habite à côté.', '这是住在隔壁的女士。'],
      ['Le collègue dont je t’ai parlé arrive demain.', '我跟你说过的那位同事明天到。'],
    ],
    sources: [
      ['Des subordonnées formulées à l’aide de pronoms relatifs simples', false],
      ['Des subordonnées formulées à l’aide de quelques pronoms relatifs simples', false],
    ],
    questions: [
      ['Le livre ___ je lis est passionnant.', 'que', 'qui', 'dont'],
      ['C’est la dame ___ habite à côté.', 'qui', 'que', 'où'],
      ['La ville ___ je suis né est petite.', 'où', 'que', 'qui'],
      ['Le collègue ___ je t’ai parlé arrive demain.', 'dont', 'que', 'qui'],
    ],
  },
  {
    id: 'subjonctif-present',
    titleZh: '虚拟式现在时',
    explanationZh: '用在 il faut que、pour que、vouloir que、bien que 等之后。构成：ils 现在时词根 + -e, -es, -e, -ions, -iez, -ent；être → sois，avoir → aie，faire → fasse。',
    examples: [
      ['Il faut que tu remplisses ce formulaire.', '你得填这张表。'],
      ['Je parle lentement pour que vous compreniez.', '我说慢点好让你们听懂。'],
    ],
    sources: [
      ['Quelques verbes au subjonctif présent', false],
      ['Quelques verbes au subjonctif présent introduits par il faut que ou pour que', false],
      ['Une variété de verbes au subjonctif présent', true],
    ],
    questions: [
      ['Il faut que tu ___ ce formulaire.', 'remplisses', 'remplis', 'rempliras'],
      ['Je parle lentement pour que vous ___ .', 'compreniez', 'comprenez', 'comprendrez'],
      ['Je veux que tu ___ à l’heure.', 'sois', 'es', 'seras'],
      ['Bien qu’il ___ tard, elle travaille encore.', 'soit', 'est', 'sera'],
    ],
  },
  {
    id: 'imparfait',
    titleZh: '未完成过去时',
    explanationZh: '描述过去的背景、状态和习惯：nous 现在时词根 + -ais, -ais, -ait, -ions, -iez, -aient（être → ét-）。',
    examples: [
      ['Quand j’étais petit, je jouais au hockey.', '我小时候打冰球。'],
      ['Il faisait beau et les oiseaux chantaient.', '天气很好，鸟儿在唱歌。'],
    ],
    sources: [['Des verbes à l’imparfait', false]],
    questions: [
      ['Quand j’étais petit, je ___ au hockey tous les samedis.', 'jouais', 'ai joué', 'jouerai'],
      ['Avant, nous ___ à Paris.', 'habitions', 'habitons', 'habiterons'],
      ['Il ___ beau et les oiseaux chantaient.', 'faisait', 'fera', 'fait'],
      ['Au lycée, elle ___ toujours en retard.', 'arrivait', 'arrivera', 'arrive'],
    ],
  },
  {
    id: 'action-recente',
    titleZh: '刚刚完成 / 正在进行',
    explanationZh: 'venir de + 不定式 = 刚刚做完；être en train de + 不定式 = 正在做。',
    examples: [
      ['Le train vient de partir.', '火车刚开走。'],
      ['Il est en train de travailler.', '他正在工作。'],
    ],
    sources: [['L’expression d’une action récente ou en cours', false]],
    questions: [
      ['Le train ___ partir : tu l’as raté de deux minutes.', 'vient de', 'va', 'est en train de'],
      ['Ne le dérange pas, il ___ travailler.', 'est en train de', 'vient de', 'va'],
      ['Nous ___ arriver ; les valises sont encore dans l’entrée.', 'venons d’', 'allons', 'serons'],
      ['— Tu fais quoi ? — Je ___ cuisiner.', 'suis en train de', 'viens de', 'vais en'],
    ],
  },
  {
    id: 'completives',
    titleZh: 'que 引导的补语从句',
    explanationZh: '在 penser, dire, savoir, espérer 等动词后用 que 引出从句（元音前写 qu’）。',
    examples: [
      ['Je pense qu’il a raison.', '我觉得他是对的。'],
      ['Elle dit que le magasin est fermé.', '她说商店关门了。'],
    ],
    sources: [['Des subordonnées complétives avec que', false]],
    questions: [
      ['Je pense ___ il a raison.', 'qu’', 'qui', 'quoi'],
      ['Elle dit ___ le magasin est fermé.', 'que', 'qui', 'dont'],
      ['Je sais ___ tu es occupé.', 'que', 'ce que', 'si que'],
      ['Il espère ___ vous viendrez.', 'que', 'de', 'qui'],
    ],
  },
  {
    id: 'infinitives',
    titleZh: '不定式从句',
    explanationZh: '感知动词（voir, entendre, regarder）和 laisser 后，宾语加动词原形：J’entends les enfants jouer。',
    examples: [
      ['J’entends les enfants jouer.', '我听见孩子们在玩。'],
      ['Je regarde la neige tomber.', '我看着雪落下。'],
    ],
    sources: [['Des subordonnées infinitives', false]],
    questions: [
      ['J’entends les enfants ___ dans la cour.', 'jouer', 'jouent', 'joué'],
      ['Je regarde la neige ___ .', 'tomber', 'tombe', 'tombée'],
      ['Elle laisse son fils ___ seul à l’école.', 'aller', 'va', 'allé'],
      ['On voit les avions ___ au-dessus de la maison.', 'passer', 'passent', 'passé'],
    ],
  },
  {
    id: 'circonstancielles',
    titleZh: '状语从句',
    explanationZh: '表示时间（quand, dès que, pendant que）、原因（comme, parce que）、目的（pour + 不定式、pour que）等的从句。',
    examples: [
      ['Comme il pleuvait, nous sommes restés à la maison.', '因为下雨，我们待在家里。'],
      ['Appelle-moi dès que tu arrives.', '你一到就打给我。'],
    ],
    sources: [['Des subordonnées compléments de phrase', false]],
    questions: [
      ['___ il pleuvait, nous sommes restés à la maison.', 'Comme', 'Pour que', 'Bien que'],
      ['Appelle-moi ___ tu arrives.', 'dès que', 'pour que', 'afin de'],
      ['Je travaille le soir ___ payer mes études.', 'pour', 'parce que', 'quand'],
      ['Il est sorti ___ je dormais.', 'pendant que', 'pour que', 'afin que'],
    ],
  },
  {
    id: 'passif',
    titleZh: '被动语态',
    explanationZh: 'être（任何时态）+ 过去分词（与主语配合），施动者用 par 引出。',
    examples: [
      ['Le pont a été construit en 1930.', '这座桥建于 1930 年。'],
      ['Ce roman est lu par des millions de personnes.', '这本小说有数百万读者。'],
    ],
    sources: [['La forme passive', false]],
    questions: [
      ['La décision ___ par le comité hier.', 'a été prise', 'a pris', 'est prenant'],
      ['Le pont ___ en 1930.', 'a été construit', 'a construit', 'est construisant'],
      ['Ce roman est lu ___ des millions de personnes.', 'par', 'pour', 'sur'],
      ['Les résultats ___ demain.', 'seront publiés', 'publieront', 'sont publier'],
    ],
  },
  {
    id: 'si-realiste',
    titleZh: '现实假设 si + 现在时',
    explanationZh: '对现在或将来可能发生的情况做假设：si + 现在时，主句用简单将来时、现在时或命令式。',
    examples: [
      ['S’il fait beau samedi, nous ferons un pique-nique.', '如果周六天好，我们去野餐。'],
      ['Si j’ai le temps, je te téléphonerai.', '有空我就给你打电话。'],
    ],
    sources: [['Des hypothèses réalistes sur un fait présent ou futur avec si', false]],
    questions: [
      ['Si tu ___ ton travail tôt, on ira au cinéma.', 'finis', 'finirais', 'finiras'],
      ['S’il fait beau samedi, nous ___ un pique-nique.', 'ferons', 'ferions', 'faisions'],
      ['Si vous ___ en retard, prévenez-nous.', 'êtes', 'serez', 'seriez'],
      ['Si j’ai le temps, je te ___ ce soir.', 'téléphonerai', 'téléphonerais', 'téléphonais'],
    ],
  },
  {
    id: 'passe-simple',
    titleZh: '简单过去时（阅读识别）',
    explanationZh: '书面叙事时态，主要要求读得懂：il entra, elle fit, ils furent, nous prîmes。口语中对应复合过去时。',
    examples: [
      ['Il entra dans la pièce sans un mot.', '他一言不发地走进房间。'],
      ['Ils furent très surpris.', '他们非常惊讶。'],
    ],
    sources: [
      ['Quelques verbes au passé simple', false],
      ['Une variété de verbes au passé simple', true],
    ],
    questions: [
      ['« Elle fit un geste de la main. » « fit » vient du verbe :', 'faire', 'finir', 'fixer'],
      ['« Ils furent surpris. » « furent » vient du verbe :', 'être', 'fuir', 'avoir'],
      ['« Nous prîmes le train. » En français courant :', 'Nous avons pris le train.', 'Nous prenions le train.', 'Nous prendrons le train.'],
      ['« Il vint me voir. » « vint » vient du verbe :', 'venir', 'vendre', 'voir'],
    ],
  },
  {
    id: 'accord-gn',
    titleZh: '名词短语中的性数配合',
    explanationZh: '形容词与所修饰名词性数一致：阴性多加 -e，复数多加 -s；beau / nouveau / vieux 有特殊形式。',
    examples: [
      ['des chemises bleues', '几件蓝衬衫'],
      ['nos nouvelles voisines', '我们的新邻居（女）'],
    ],
    sources: [['Les règles d’accord dans le groupe nominal', false]],
    questions: [
      ['des fleurs ___', 'blanches', 'blancs', 'blanche'],
      ['une ___ idée', 'bonne', 'bon', 'bonnes'],
      ['nos ___ voisines', 'nouvelles', 'nouveaux', 'nouvelle'],
      ['des chemises ___', 'bleues', 'bleus', 'bleue'],
    ],
  },
  {
    id: 'conditionnel-present',
    titleZh: '条件式现在时（建议、假设、未证实消息）',
    explanationZh: '将来时词根 + 未完成过去时词尾：je serais, tu pourrais。用于建议（À ta place, je…）、愿望、假设结果和未经证实的消息。',
    examples: [
      ['À ta place, j’accepterais ce poste.', '换作是你，我会接受这个职位。'],
      ['Selon la radio, le ministre devrait démissionner.', '据电台说，部长可能要辞职。'],
    ],
    sources: [['Une variété de verbes au conditionnel présent', true]],
    questions: [
      ['À ta place, j’___ ce poste.', 'accepterais', 'accepterai', 'acceptais'],
      ['Selon la radio, le ministre ___ démissionner bientôt.', 'devrait', 'devra', 'devait'],
      ['Nous ___ voyager plus si nous avions de l’argent.', 'pourrions', 'pourrons', 'pouvions'],
      ['Ce ___ bien de partir plus tôt.', 'serait', 'sera', 'soit'],
    ],
  },
  {
    id: 'futur-anterieur',
    titleZh: '先将来时',
    explanationZh: 'avoir / être 的简单将来时 + 过去分词，表示将来某动作之前已完成的动作，也可表示对过去的推测。',
    examples: [
      ['Quand tu auras fini, tu pourras sortir.', '你做完了就可以出去。'],
      ['D’ici juin, nous aurons déménagé.', '到六月我们就已经搬完家了。'],
    ],
    sources: [['Des verbes au futur antérieur', false]],
    questions: [
      ['Quand tu ___ tes devoirs, tu pourras sortir.', 'auras fini', 'finissais', 'avais fini'],
      ['D’ici juin, nous ___ .', 'aurons déménagé', 'déménagerions', 'déménagions'],
      ['Dès qu’elle ___ , on commencera la réunion.', 'sera arrivée', 'arrivait', 'était arrivée'],
      ['Il a l’air inquiet : il ___ ses clés.', 'aura perdu', 'perdra', 'perdrait'],
    ],
  },
  {
    id: 'plus-que-parfait',
    titleZh: '愈过去时',
    explanationZh: 'avoir / être 的未完成过去时 + 过去分词，表示过去某时刻之前已经完成的动作。',
    examples: [
      ['Quand je suis arrivé, le film avait commencé.', '我到的时候电影已经开始了。'],
      ['Elle m’a dit qu’elle avait lu le livre.', '她告诉我她读过那本书。'],
    ],
    sources: [['Des verbes au plus-que-parfait', false]],
    questions: [
      ['Quand je suis arrivé, le film ___ depuis dix minutes.', 'avait commencé', 'commencera', 'commence'],
      ['Elle m’a dit qu’elle ___ le livre.', 'avait lu', 'lira', 'lit'],
      ['Nous étions fatigués parce que nous ___ toute la nuit.', 'avions marché', 'marchons', 'marcherions'],
      ['Ils ___ partis avant l’orage.', 'étaient', 'avaient', 'seraient'],
    ],
  },
  {
    id: 'comparatifs',
    titleZh: '比较级与最高级',
    explanationZh: 'plus / moins / aussi + 形容词 + que；最高级 le / la / les plus …。特殊形式：bon → meilleur，bien → mieux，mauvais → pire。',
    examples: [
      ['Montréal est la plus grande ville du Québec.', '蒙特利尔是魁北克最大的城市。'],
      ['Il chante mieux que moi.', '他唱得比我好。'],
    ],
    sources: [['Des comparatifs et des superlatifs', false]],
    questions: [
      ['Montréal est ___ grande ville du Québec.', 'la plus', 'plus', 'la très'],
      ['Ce café est ___ que l’autre.', 'meilleur', 'plus bon', 'mieux'],
      ['Il chante ___ que moi.', 'mieux', 'meilleur', 'plus bien'],
      ['C’est le ___ hiver depuis vingt ans : il a fait −40 °C !', 'pire', 'plus pire', 'mieux'],
    ],
  },
  {
    id: 'si-irreel-present',
    titleZh: '与现在事实相反的假设',
    explanationZh: 'si + 未完成过去时，主句用条件式现在时：Si j’avais le temps, j’apprendrais le piano。',
    examples: [
      ['Si j’avais plus de temps, j’apprendrais le piano.', '要是我有更多时间，我会学钢琴。'],
      ['Si nous étions riches, nous voyagerions.', '要是我们有钱，就去旅行了。'],
    ],
    sources: [['Des hypothèses irréelles sur un fait présent ou futur avec si', false]],
    questions: [
      ['Si j’___ plus de temps, j’apprendrais le piano.', 'avais', 'ai', 'aurais'],
      ['Si tu habitais ici, tu ___ le métro.', 'prendrais', 'prendras', 'prenais'],
      ['Si nous ___ riches, nous voyagerions.', 'étions', 'serions', 'sommes'],
      ['Que ferais-tu si tu ___ à la loterie ?', 'gagnais', 'gagnerais', 'gagnes'],
    ],
  },
  {
    id: 'conditionnel-passe',
    titleZh: '条件式过去时',
    explanationZh: 'avoir / être 的条件式 + 过去分词：表示遗憾、责备（tu aurais dû）、与过去相反的结果，以及未经证实的过去消息。',
    examples: [
      ['J’aurais voulu venir, mais j’étais malade.', '我本想来的，可是我病了。'],
      ['Tu aurais dû me prévenir !', '你本该提前告诉我的！'],
    ],
    sources: [
      ['Quelques verbes au conditionnel passé', false],
      ['Une variété de verbes au conditionnel passé', true],
    ],
    questions: [
      ['J’___ venir, mais j’étais malade.', 'aurais voulu', 'aurai voulu', 'avais voulu'],
      ['Tu ___ me prévenir !', 'aurais dû', 'auras dû', 'avais dû'],
      ['Selon les témoins, le voleur ___ par la fenêtre.', 'serait entré', 'sera entré', 'entrera'],
      ['À ta place, je n’___ pas accepté.', 'aurais', 'aurai', 'avais'],
    ],
  },
  {
    id: 'subjonctif-passe',
    titleZh: '虚拟式过去时',
    explanationZh: 'avoir / être 的虚拟式现在时 + 过去分词，表示在主句动作之前已完成：Je suis content que tu sois venu。',
    examples: [
      ['Je suis content que tu sois venu.', '你来了我很高兴。'],
      ['Je doute qu’il ait compris.', '我怀疑他听懂了。'],
    ],
    sources: [
      ['Quelques verbes au subjonctif passé', false],
      ['Des verbes au subjonctif passé', false],
      ['Une variété de verbes au subjonctif passé', true],
    ],
    questions: [
      ['Je suis content que tu ___ venu.', 'sois', 'es', 'serais'],
      ['Il faut que vous ___ fini avant midi.', 'ayez', 'avez', 'aurez'],
      ['Bien qu’elle ___ partie tôt, elle a raté le train.', 'soit', 'est', 'était'],
      ['Je doute qu’il ___ compris.', 'ait', 'a', 'aura'],
    ],
  },
  {
    id: 'si-irreel-passe',
    titleZh: '与过去事实相反的假设',
    explanationZh: 'si + 愈过去时，主句用条件式过去时：Si j’avais su, je serais venu。',
    examples: [
      ['Si j’avais su, je serais venu.', '早知道我就来了。'],
      ['Si tu étais parti plus tôt, tu aurais pris le bus.', '你要是早点出发，就赶上公交了。'],
    ],
    sources: [
      ['Des hypothèses irréelles sur un fait passé avec si', false],
      ['Des hypothèses irréelles au passé avec si', false],
    ],
    questions: [
      ['Si j’___ su, je serais venu.', 'avais', 'aurais', 'ai'],
      ['Si tu étais parti plus tôt, tu ___ le bus.', 'aurais pris', 'prendrais', 'avais pris'],
      ['S’il ___ , nous aurions annulé la sortie.', 'avait plu', 'aurait plu', 'pleut'],
      ['Nous aurions gagné si nous ___ mieux.', 'avions joué', 'aurions joué', 'jouons'],
    ],
  },
  {
    id: 'negation-diverse',
    titleZh: '多种否定结构',
    explanationZh: 'ne … rien / personne / jamais / plus / aucun / ni … ni；ne … que 表示「只」。',
    examples: [
      ['Il n’y a rien dans le frigo.', '冰箱里什么都没有。'],
      ['Je ne bois ni thé ni café.', '我既不喝茶也不喝咖啡。'],
    ],
    sources: [['Diverses constructions négatives', false]],
    questions: [
      ['Il n’y a ___ dans le frigo.', 'rien', 'personne de', 'aucun'],
      ['Elle ne fume ___ : elle a arrêté l’an dernier.', 'plus', 'jamais de', 'pas de'],
      ['___ candidat n’a réussi l’examen.', 'Aucun', 'Personne', 'Rien'],
      ['Je ne bois ___ thé ___ café.', 'ni … ni', 'ne … que', 'pas … pas'],
    ],
  },
  {
    id: 'discours-indirect',
    titleZh: '间接引语',
    explanationZh: '转述别人的话：主句在过去时，从句时态后移（现在→未完成过去时，将来→条件式）；疑问句用 si / où / ce que 等引出。',
    examples: [
      ['Elle a dit qu’elle viendrait.', '她说她会来。'],
      ['Il m’a demandé si je venais.', '他问我来不来。'],
    ],
    sources: [['Le discours indirect', false]],
    questions: [
      ['Il dit : « Je suis fatigué. » → Il dit qu’il ___ fatigué.', 'est', 'était', 'sera'],
      ['Elle a dit : « Je viendrai. » → Elle a dit qu’elle ___ .', 'viendrait', 'viendra', 'vient'],
      ['« Où habites-tu ? » → Il m’a demandé ___ j’habitais.', 'où', 'que', 'si'],
      ['« Tu viens ? » → Elle m’a demandé ___ je venais.', 'si', 'que', 'ce que'],
    ],
  },
  {
    id: 'relatifs-complexes',
    titleZh: '复合关系代词',
    explanationZh: '介词 + lequel / laquelle / lesquels / lesquelles；与 à、de 缩合为 auquel、duquel 等。',
    examples: [
      ['Le projet sur lequel je travaille est ambitieux.', '我正在做的项目很有野心。'],
      ['La raison pour laquelle il est parti reste mystérieuse.', '他离开的原因仍是个谜。'],
    ],
    sources: [['Des subordonnées formulées à l’aide d’une variété de pronoms relatifs simples ou complexes', false]],
    questions: [
      ['Le projet ___ je travaille est ambitieux.', 'sur lequel', 'lequel', 'dont lequel'],
      ['La raison ___ il est parti reste mystérieuse.', 'pour laquelle', 'pour lequel', 'dont'],
      ['Les collègues avec ___ je collabore sont efficaces.', 'lesquels', 'desquels', 'auxquels'],
      ['Le parc près ___ nous habitons est immense.', 'duquel', 'dont', 'auquel'],
    ],
  },
  {
    id: 'correlatives',
    titleZh: '关联从句（程度—结果、比例）',
    explanationZh: 'si / tellement / tant … que 表示程度导致的结果；plus … plus、autant … autant 表示比例或对照。',
    examples: [
      ['Il a tellement couru qu’il est épuisé.', '他跑得太多，累坏了。'],
      ['Plus on lit, plus on apprend.', '读得越多，学得越多。'],
    ],
    sources: [['Diverses subordonnées corrélatives', false]],
    questions: [
      ['Il a tellement couru ___ il est épuisé.', 'qu’', 'que de', 'comme'],
      ['Plus on lit, ___ on apprend.', 'plus', 'mieux que', 'tant'],
      ['Elle est si fatiguée ___ elle s’est endormie au cinéma.', 'qu’', 'comme', 'alors'],
      ['___ il est doué, autant il est paresseux.', 'Autant', 'Tant', 'Aussi'],
    ],
  },
  {
    id: 'concordance',
    titleZh: '时态配合',
    explanationZh: '主句是过去时，从句表示同时用未完成过去时，表示之前用愈过去时，表示之后用条件式现在时。',
    examples: [
      ['Je croyais que tu étais malade.', '我以为你病了。'],
      ['Il m’a promis qu’il appellerait.', '他答应我会打电话。'],
    ],
    sources: [['Les règles de concordance des temps', false]],
    questions: [
      ['Je croyais que tu ___ malade.', 'étais', 'es', 'seras'],
      ['Il m’a promis qu’il ___ le lendemain.', 'appellerait', 'appellera', 'appelle'],
      ['Elle savait que nous ___ déjà partis.', 'étions', 'sommes', 'serons'],
      ['Je pense qu’il ___ hier soir.', 'est venu', 'viendrait', 'vienne'],
    ],
  },
  {
    id: 'indicatif-subjonctif',
    titleZh: '直陈式还是虚拟式',
    explanationZh: '确信、陈述用直陈式（je crois que, après que）；怀疑、否定看法、意愿、情感、bien que / avant que 用虚拟式。',
    examples: [
      ['Je crois qu’il a raison.', '我相信他是对的。'],
      ['Je ne crois pas qu’il ait raison.', '我不认为他是对的。'],
    ],
    sources: [['Les règles d’emploi du mode indicatif ou subjonctif', false]],
    questions: [
      ['Je crois qu’il ___ raison.', 'a', 'ait', 'aie'],
      ['Je ne crois pas qu’il ___ raison.', 'ait', 'a', 'aura'],
      ['Après que tu ___ parti, il est arrivé.', 'es', 'sois', 'serais'],
      ['Avant que tu ___ , je dois te dire quelque chose.', 'partes', 'pars', 'partiras'],
    ],
  },
  {
    id: 'accord-pp',
    titleZh: '过去分词的配合',
    explanationZh: 'être 作助动词时与主语配合；avoir 作助动词时只与位于其前的直接宾语配合；代词式动词后接直接宾语时不配合（elle s’est lavé les mains）。',
    examples: [
      ['Les lettres que j’ai écrites sont sur la table.', '我写的信在桌上。'],
      ['Elle s’est lavé les mains.', '她洗了手。'],
    ],
    sources: [['Les règles d’accord des participes passés', false]],
    questions: [
      ['Les lettres que j’ai ___ sont sur la table.', 'écrites', 'écrit', 'écrits'],
      ['Elles sont ___ hier soir.', 'arrivées', 'arrivé', 'arrivés'],
      ['Elle s’est ___ les mains.', 'lavé', 'lavée', 'lavées'],
      ['Les efforts qu’il a ___ ont porté leurs fruits.', 'fournis', 'fourni', 'fournies'],
    ],
  },
  {
    id: 'accord-gv',
    titleZh: '动词与主语的配合',
    explanationZh: '注意难判断的主语：la plupart des + 复数名词 → 复数；c’est moi qui → 第一人称；chacun → 单数；ni … ni 连接两个主语 → 通常复数。',
    examples: [
      ['La plupart des étudiants sont satisfaits.', '大多数学生都很满意。'],
      ['C’est moi qui ai raison.', '是我对。'],
    ],
    sources: [['Les règles d’accord dans le groupe verbal', false]],
    questions: [
      ['La plupart des étudiants ___ satisfaits.', 'sont', 'est', 'soit'],
      ['C’est moi qui ___ raison.', 'ai', 'a', 'avons'],
      ['Ni Paul ni Marie ne ___ venus.', 'sont', 'est', 'sera'],
      ['Chacun des employés ___ reçu un badge.', 'a', 'ont', 'avons'],
    ],
  },
  {
    id: 'nuances-syntaxe',
    titleZh: '复杂句法的细微差别',
    explanationZh: '强调结构（c’est … qui / que）、句首副词后的倒装（peut-être, sans doute）、让步与条件的书面结构（quoi que, pour peu que）等，都会改变语气与侧重点。',
    examples: [
      ['C’est Marie qui a trouvé la solution.', '正是玛丽找到了解决办法。'],
      ['Pour peu qu’on l’encourage, il réussira.', '只要稍加鼓励，他就会成功。'],
    ],
    sources: [
      ['La personne comprend les nuances de sens véhiculées par la plupart des constructions syntaxiques complexes.', false],
      ['La personne utilise la plupart des constructions syntaxiques complexes.', false],
    ],
    questions: [
      ['« C’est Marie qui a trouvé la solution. » Cette construction sert à :', 'mettre Marie en relief', 'exprimer une hypothèse', 'marquer le futur'],
      ['« Peut-être viendra-t-il. » En tête de phrase, « peut-être » entraîne :', 'l’inversion du sujet', 'la négation', 'le subjonctif'],
      ['« Quoi qu’il dise, je ne changerai pas d’avis. » signifie :', 'peu importe ce qu’il dit', 'parce qu’il parle', 'dès qu’il parle'],
      ['« Pour peu qu’on l’encourage, il réussira. » exprime :', 'une condition minimale', 'une cause', 'un but'],
    ],
  },
]
