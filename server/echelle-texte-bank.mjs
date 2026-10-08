// Text-grammar concepts (« grammaire du texte ») of the Échelle québécoise.
// Same shape as SENTENCE_GRAMMAR: each question is [prompt, correct answer, distractor, distractor].
export const TEXT_GRAMMAR = [
  {
    id: 'pronoms-sujets',
    titleZh: '用主语人称代词指代前文',
    explanationZh: '第二次提到某人或某物时用 il / elle / ils / elles / nous / vous 代替，避免重复名词。代词的性数要与所指对象一致。',
    examples: [
      ['Marie est infirmière. Elle travaille la nuit.', '玛丽是护士，她上夜班。'],
      ['Mes parents arrivent demain. Ils restent une semaine.', '我父母明天到，他们待一周。'],
    ],
    sources: [['Des pronoms personnels sujets pour reprendre l’information', false]],
    questions: [
      ['Marie est infirmière. ___ travaille la nuit.', 'Elle', 'Il', 'Lui'],
      ['Mes parents arrivent demain. ___ restent une semaine.', 'Ils', 'Elles', 'Eux'],
      ['Paul et toi, ___ venez ce soir ?', 'vous', 'tu', 'nous'],
      ['Ma sœur et moi, ___ partons en vacances.', 'nous', 'ils', 'vous'],
    ],
  },
  {
    id: 'connecteurs-temps',
    titleZh: '常用时间连接词',
    explanationZh: 'd’abord, ensuite, puis, après, enfin, depuis, pendant 等，用来排列事件的先后顺序。',
    examples: [
      ['D’abord je me lève, ensuite je prends ma douche.', '我先起床，然后洗澡。'],
      ['Je travaille ici depuis trois ans.', '我在这里工作三年了。'],
    ],
    sources: [['Quelques connecteurs temporels courants', false]],
    questions: [
      ['D’abord je me lève, ___ je prends ma douche.', 'ensuite', 'mais', 'parce que'],
      ['___ le repas, nous ferons la vaisselle.', 'Après', 'Pendant que', 'Depuis que'],
      ['Je travaille ici ___ trois ans.', 'depuis', 'pendant que', 'dans le'],
      ['On a marché, mangé, visité le musée… ___, nous sommes rentrés.', 'Enfin', 'Pourtant', 'Cependant'],
    ],
  },
  {
    id: 'connecteurs-et-ou-mais',
    titleZh: '并列连接词 et / ou / mais',
    explanationZh: 'et 表示并列，ou 表示选择，mais 表示转折。',
    examples: [
      ['Tu veux du thé ou du café ?', '你要茶还是咖啡？'],
      ['Il fait beau mais froid.', '天气晴朗但很冷。'],
    ],
    sources: [['Des connecteurs courants qui marquent l’addition, l’alternative, l’opposition : et, ou, mais', false]],
    questions: [
      ['Tu veux du thé ___ du café ?', 'ou', 'et', 'mais'],
      ['J’aime le hockey ___ le soccer : les deux !', 'et', 'ou', 'mais'],
      ['Il fait beau ___ froid.', 'mais', 'ou', 'donc'],
      ['Je voulais venir, ___ je suis malade.', 'mais', 'et', 'ou'],
    ],
  },
  {
    id: 'pronoms-disjoints',
    titleZh: '重读人称代词',
    explanationZh: 'moi, toi, lui, elle, nous, vous, eux, elles：用于介词后、单独回答和强调。',
    examples: [
      ['— Qui veut du gâteau ? — Moi !', '——谁要蛋糕？——我！'],
      ['Je pars avec lui.', '我跟他一起走。'],
    ],
    sources: [['Des pronoms personnels disjoints pour reprendre l’information', false]],
    questions: [
      ['— Qui veut du gâteau ? — ___ !', 'Moi', 'Je', 'Me'],
      ['Paul part demain ; je pars avec ___ .', 'lui', 'il', 'le'],
      ['Ce livre est à Marie ? — Oui, il est à ___ .', 'elle', 'la', 'lui'],
      ['Mes amis adorent la mer. ___, ils préfèrent la montagne ? Non !', 'Eux', 'Ils', 'Leur'],
    ],
  },
  {
    id: 'connecteurs-cause',
    titleZh: '表示原因的连接词',
    explanationZh: 'parce que（回答为什么）、comme（放句首）、car、à cause de（不好的原因）、grâce à（好的原因）。',
    examples: [
      ['Je reste à la maison parce que je suis malade.', '我待在家因为病了。'],
      ['J’ai réussi grâce à ton aide.', '多亏你的帮助我成功了。'],
    ],
    sources: [
      ['Des connecteurs courants qui marquent la cause', false],
      ['Des connecteurs courants qui marquent l’addition, l’alternative, l’opposition, la cause : et, ou, mais, parce que', false],
    ],
    questions: [
      ['Je reste à la maison ___ je suis malade.', 'parce que', 'mais', 'donc'],
      ['___ il neige beaucoup, l’école est fermée.', 'Comme', 'Parce', 'Donc'],
      ['Il est en retard ___ de la tempête.', 'à cause', 'grâce', 'car'],
      ['J’ai réussi ___ à ton aide.', 'grâce', 'à cause', 'car'],
    ],
  },
  {
    id: 'pronoms-cod-coi',
    titleZh: '直接 / 间接宾语代词',
    explanationZh: '直接宾语 le / la / les，间接宾语（à + 人）lui / leur，放在变位动词前。',
    examples: [
      ['Tu vois Julie ? — Oui, je la vois.', '你看见朱莉了吗？——看见了。'],
      ['Tu as téléphoné à ton père ? — Oui, je lui ai téléphoné.', '你给你爸打电话了吗？——打了。'],
    ],
    sources: [['Des pronoms personnels compléments directs ou indirects pour reprendre l’information', false]],
    questions: [
      ['Tu vois Julie ? — Oui, je ___ vois.', 'la', 'lui', 'le'],
      ['Tu as téléphoné à ton père ? — Oui, je ___ ai téléphoné.', 'lui', 'l’', 'le'],
      ['Les clés ? Je ___ ai oubliées à la maison.', 'les', 'leur', 'lui'],
      ['Tu parles à tes voisins ? — Oui, je ___ parle souvent.', 'leur', 'les', 'lui'],
    ],
  },
  {
    id: 'connecteurs-spatiaux',
    titleZh: '空间连接词',
    explanationZh: 'devant, derrière, sous, sur, entre, à côté de, en face de, au premier plan / à l’arrière-plan，用于描述位置和画面。',
    examples: [
      ['L’école est entre l’église et la mairie.', '学校在教堂和市政厅之间。'],
      ['Au premier plan, on voit un lac.', '前景是一片湖。'],
    ],
    sources: [['Des connecteurs spatiaux courants', false]],
    questions: [
      ['Le chat dort ___ la table, à l’abri.', 'sous', 'dans de', 'entre de'],
      ['L’école est ___ l’église et la mairie.', 'entre', 'parmi', 'près'],
      ['Au premier plan, on voit un lac ; ___ , des montagnes.', 'à l’arrière-plan', 'au-dessous de', 'devant'],
      ['Tournez à gauche : la gare est juste ___ face.', 'en', 'au', 'à la'],
    ],
  },
  {
    id: 'connecteurs-enumeratifs',
    titleZh: '列举连接词',
    explanationZh: 'premièrement / d’abord, ensuite, d’une part … d’autre part, ainsi que, enfin：把多个要点排好顺序。',
    examples: [
      ['Premièrement, présentez-vous ; ensuite, expliquez votre projet.', '第一，介绍自己；然后，说明你的项目。'],
      ['D’une part c’est cher, d’autre part c’est loin.', '一方面贵，另一方面远。'],
    ],
    sources: [['Des connecteurs énumératifs courants', false]],
    questions: [
      ['___ , présentez-vous ; ensuite, expliquez votre projet.', 'Premièrement', 'Finalement', 'Cependant'],
      ['D’une part, c’est cher ; ___ , c’est loin.', 'd’autre part', 'par contre que', 'alors'],
      ['___ , je vous remercie de votre attention.', 'Enfin', 'D’abord', 'Premièrement'],
      ['Il faut acheter du lait, du pain ___ des œufs.', 'ainsi que', 'donc', 'car'],
    ],
  },
  {
    id: 'reprise-possessifs-demonstratifs',
    titleZh: '物主 / 指示代词与同义替换',
    explanationZh: 'le mien, la tienne, celui-ci, celle-là，或用上位词、同义词（un chien → cet animal）避免重复。',
    examples: [
      ['Ton vélo est rouge ; le mien est bleu.', '你的自行车是红的，我的是蓝的。'],
      ['J’ai adopté un chien. Cet animal est très affectueux.', '我领养了一只狗，它很黏人。'],
    ],
    sources: [['Des pronoms possessifs ou démonstratifs, ou des procédés de substitution lexicale pour reprendre l’information', false]],
    questions: [
      ['Ton vélo est rouge ; ___ est bleu.', 'le mien', 'la mienne', 'mien'],
      ['Quelle robe préfères-tu ? — ___-ci.', 'Celle', 'Celui', 'Cela'],
      ['Ces clés sont à toi ? — Non, ce ne sont pas ___ .', 'les miennes', 'les miens', 'mes'],
      ['J’ai adopté un chien. ___ est très affectueux.', 'Cet animal', 'Un chien', 'Ce chat'],
    ],
  },
  {
    id: 'chronologie-present',
    titleZh: '以现在为参照的时间顺序',
    explanationZh: 'il y a（多久以前）、depuis（持续至今）、dans（多久以后）、aujourd’hui / maintenant，配合现在时、复合过去时和将来时。',
    examples: [
      ['Je suis arrivé au Canada il y a trois ans.', '我三年前来到加拿大。'],
      ['Je commencerai dans deux semaines.', '我两周后开始。'],
    ],
    sources: [['Les temps de verbe et une variété de connecteurs temporels pour marquer la chronologie des actions par rapport au présent', false]],
    questions: [
      ['___ , je vis à Québec ; il y a deux ans, j’habitais à Lyon.', 'Aujourd’hui', 'Hier', 'Autrefois'],
      ['Je suis arrivé au Canada ___ trois ans.', 'il y a', 'depuis', 'dans'],
      ['Je commencerai mon nouvel emploi ___ deux semaines.', 'dans', 'il y a', 'depuis'],
      ['J’apprends le français ___ six mois.', 'depuis', 'il y a', 'dans'],
    ],
  },
  {
    id: 'connecteurs-illustration',
    titleZh: '举例、解释与表达观点',
    explanationZh: 'par exemple, comme, c’est-à-dire（解释）；selon moi, à mon avis, d’après（观点）。',
    examples: [
      ['J’adore les sports d’hiver, par exemple le ski.', '我喜欢冬季运动，比如滑雪。'],
      ['À mon avis, c’est une bonne idée.', '我认为这是个好主意。'],
    ],
    sources: [
      ['Des connecteurs courants qui introduisent une illustration, un point de vue', false],
      ['Des connecteurs courants qui marquent l’illustration, l’explication', false],
    ],
    questions: [
      ['J’adore les sports d’hiver, ___ le ski et la raquette.', 'par exemple', 'pourtant', 'donc'],
      ['___ moi, c’est une bonne idée.', 'Selon', 'Malgré', 'Grâce à'],
      ['Il est polyglotte, ___ il parle cinq langues.', 'c’est-à-dire qu’', 'cependant', 'afin qu’'],
      ['___ , le télétravail a beaucoup d’avantages.', 'À mon avis', 'Bien que', 'Afin de'],
    ],
  },
  {
    id: 'pronoms-le-en',
    titleZh: '代词 le（指代整句）与 en',
    explanationZh: 'le 可以代替前面一整句话（je le sais）；en 代替 de + 名词或数量（j’en ai trois）。',
    examples: [
      ['Il va pleuvoir ? — Oui, la météo l’annonce.', '要下雨吗？——是的，天气预报说了。'],
      ['Des pommes ? J’en ai acheté trois.', '苹果？我买了三个。'],
    ],
    sources: [['Le pronom le dont le référent est une phrase et le pronom en pour reprendre l’information', false]],
    questions: [
      ['Il va pleuvoir ? — Oui, la météo ___ annonce.', 'l’', 'la', 'en'],
      ['Des pommes ? J’___ ai acheté trois.', 'en', 'les', 'y'],
      ['Tu savais qu’elle déménage ? — Non, je ne ___ savais pas.', 'le', 'la', 'en'],
      ['Tu as besoin de ton passeport ? — Oui, j’___ ai besoin.', 'en', 'le', 'y'],
    ],
  },
  {
    id: 'pc-imparfait',
    titleZh: '复合过去时与未完成过去时的搭配',
    explanationZh: '未完成过去时讲背景、正在进行的状态；复合过去时讲突然发生、有明确次数或已完成的动作。',
    examples: [
      ['Je dormais quand le téléphone a sonné.', '电话响的时候我正在睡觉。'],
      ['Il faisait beau, alors nous sommes sortis.', '天气很好，所以我们出去了。'],
    ],
    sources: [['L’emploi conjoint du passé composé et de l’imparfait', false]],
    questions: [
      ['Je ___ quand le téléphone a sonné.', 'dormais', 'ai dormi', 'dormirai'],
      ['Il ___ beau, alors nous sommes sortis.', 'faisait', 'a fait', 'fera'],
      ['Pendant que je lisais, mon frère ___ .', 'est rentré', 'rentrera', 'rentre'],
      ['Quand elle était jeune, elle ___ trois fois en France.', 'est allée', 'allait', 'ira'],
    ],
  },
  {
    id: 'connecteurs-logiques',
    titleZh: '结果、目的、让步与换言',
    explanationZh: '结果：donc, par conséquent；目的：pour, afin de / afin que；让步：bien que, même si, pourtant；换言：autrement dit, c’est-à-dire。',
    examples: [
      ['Il pleuvait ; par conséquent, le match a été annulé.', '下雨了，因此比赛取消。'],
      ['Bien qu’il soit malade, il est venu.', '尽管生病了，他还是来了。'],
    ],
    sources: [
      ['Des connecteurs courants qui marquent la concession, la reformulation', false],
      ['Des connecteurs courants qui marquent le but, la concession, la reformulation', false],
      ['Des connecteurs courants qui introduisent un point de vue, une conséquence, un but, une reformulation', false],
      ['Des connecteurs courants qui marquent la conséquence, la reformulation', false],
    ],
    questions: [
      ['Il pleuvait ; ___ , le match a été annulé.', 'par conséquent', 'pourtant', 'afin que'],
      ['___ il soit malade, il est venu travailler.', 'Bien qu’', 'Parce qu’', 'Pour qu’'],
      ['J’économise ___ acheter une maison.', 'afin d’', 'bien que', 'donc'],
      ['Il est végétalien ; ___ , il ne consomme aucun produit animal.', 'autrement dit', 'pourtant', 'afin qu’'],
    ],
  },
  {
    id: 'pronom-ca',
    titleZh: '代词 ça 与泛指的 ils',
    explanationZh: '口语里 ça 代替前面提到的事情或活动；ils 可以泛指「他们（政府、公司等）」而不点名。',
    examples: [
      ['Tu aimes le ski ? — Oui, j’adore ça.', '你喜欢滑雪吗？——超爱。'],
      ['Ils ont encore augmenté les taxes.', '他们（政府）又加税了。'],
    ],
    sources: [
      ['Le pronom personnel ils dont le référent est implicite et le pronom ça pour reprendre l’information', false],
      ['Le pronom ça pour reprendre l’information', false],
    ],
    questions: [
      ['« Ils ont encore augmenté les taxes. » Ici, « ils » désigne :', 'les autorités, sans les nommer', 'des amis précis', 'les taxes'],
      ['— Tu aimes le ski ? — Oui, j’adore ___ .', 'ça', 'le', 'lui'],
      ['On a perdu le match… Bah, ___ arrive !', 'ça', 'il', 'ce'],
      ['Faire du bénévolat, ___ m’apporte beaucoup.', 'ça', 'il', 'lui'],
    ],
  },
  {
    id: 'plan-texte',
    titleZh: '文章结构标记',
    explanationZh: '引出主题（Dans ce texte, il sera question de…）、展开步骤（En premier lieu…, Dans un deuxième temps…）、结论（En somme…, Pour conclure…）。',
    examples: [
      ['Dans un deuxième temps, nous verrons les solutions.', '接下来，我们来看解决办法。'],
      ['En somme, le projet est réaliste.', '总之，这个项目是可行的。'],
    ],
    sources: [['Des connecteurs énumératifs courants qui marquent la présentation du sujet, les étapes du développement, la conclusion', false]],
    questions: [
      ['Pour annoncer le sujet d’un texte :', 'Dans ce texte, il sera question de…', 'En conclusion…', 'Par ailleurs…'],
      ['Pour passer à la deuxième partie :', 'Dans un deuxième temps…', 'Pour conclure…', 'Tout d’abord…'],
      ['Pour conclure :', 'En somme…', 'En premier lieu…', 'D’une part…'],
      ['Pour commencer le développement :', 'En premier lieu…', 'En définitive…', 'Bref…'],
    ],
  },
  {
    id: 'connecteurs-argumentatifs',
    titleZh: '论证连接词',
    explanationZh: '补充论据：de plus, en outre；对立：en revanche, néanmoins；让步：malgré；结论：ainsi, c’est pourquoi。',
    examples: [
      ['Le projet est utile ; en revanche, il coûte cher.', '这个项目有用，但是很贵。'],
      ['Malgré ses défauts, ce film reste excellent.', '尽管有缺点，这部电影依然出色。'],
    ],
    sources: [['Des connecteurs argumentatifs courants', false]],
    questions: [
      ['Le projet est utile ; ___ , il coûte trop cher.', 'en revanche', 'de plus', 'ainsi'],
      ['Le télétravail réduit la pollution ; ___ , il fait gagner du temps.', 'de plus', 'en revanche', 'néanmoins'],
      ['___ ses défauts, ce film reste excellent.', 'Malgré', 'Grâce à', 'Afin de'],
      ['Les prix augmentent ; ___ , les familles consomment moins.', 'ainsi', 'en revanche', 'bien que'],
    ],
  },
  {
    id: 'reprise-variete',
    titleZh: '多种指代代词',
    explanationZh: 'y（à + 事物 / 地点）、en、celui / celle、le / la / les、lequel 等组合使用，让文章衔接自然。',
    examples: [
      ['Le Québec ? J’y vais chaque été.', '魁北克？我每年夏天都去。'],
      ['Tu as pensé à l’examen ? — Oui, j’y pense tout le temps.', '你想过考试吗？——一直在想。'],
    ],
    sources: [['Une variété de pronoms pour reprendre l’information', true]],
    questions: [
      ['Le Québec ? J’___ vais chaque été.', 'y', 'en', 'le'],
      ['Les documents ? Je vous ___ enverrai demain.', 'les', 'leur', 'en'],
      ['Parmi ces options, ___ que je préfère est la deuxième.', 'celle', 'ce', 'laquelle'],
      ['Tu as pensé à l’examen ? — Oui, j’___ pense tout le temps.', 'y', 'en', 'lui'],
    ],
  },
  {
    id: 'chronologie-complexe',
    titleZh: '跨过去、现在、将来的时间顺序',
    explanationZh: 'autrefois / jadis（从前）、désormais / dorénavant（从今以后）、la veille / le lendemain（前一天 / 第二天），配合愈过去时、先将来时等。',
    examples: [
      ['Autrefois, je ne savais pas conduire.', '以前我不会开车。'],
      ['Désormais, les réunions auront lieu en ligne.', '今后会议都在线上开。'],
    ],
    sources: [['Les temps de verbe et une variété de connecteurs temporels pour marquer la chronologie des actions par rapport au passé, au présent, au futur', false]],
    questions: [
      ['Elle avait quitté la France ___ deux ans quand elle a trouvé un emploi.', 'depuis', 'dans', 'il y a'],
      ['___ , je ne savais pas conduire ; aujourd’hui, je conduis tous les jours.', 'Autrefois', 'Désormais', 'Dorénavant'],
      ['___ , toutes les réunions auront lieu en ligne.', 'Désormais', 'Autrefois', 'Jadis'],
      ['Le lendemain, elle ___ qu’elle avait oublié son passeport.', 's’est rendu compte', 'se rendra compte', 'se rendrait compte'],
    ],
  },
  {
    id: 'connecteurs-variete',
    titleZh: '多样化的连接词',
    explanationZh: '高级连接词：néanmoins, toutefois, si bien que, de sorte que, en dépit de, faute de, de façon à, au lieu de。',
    examples: [
      ['Il n’a pas étudié ; néanmoins, il a réussi.', '他没复习，但还是通过了。'],
      ['Le budget est serré, si bien qu’il faudra faire des choix.', '预算紧张，所以必须取舍。'],
    ],
    sources: [['Une variété de connecteurs', true]],
    questions: [
      ['Il n’a pas étudié ; ___ , il a réussi.', 'néanmoins', 'par conséquent', 'c’est pourquoi'],
      ['Le budget est serré, ___ il faudra faire des choix.', 'si bien qu’', 'bien qu’', 'pour qu’'],
      ['___ de sa réussite, elle reste modeste.', 'En dépit', 'Au lieu', 'Faute'],
      ['Il travaille dur ___ réussir son examen.', 'de façon à', 'de sorte qu’', 'afin qu’'],
    ],
  },
  {
    id: 'substituts',
    titleZh: '代词、名词、副词替代',
    explanationZh: '用 l’auteur, cette mesure, ce dernier, là-bas 等替代前文，使行文不重复、指代清楚。',
    examples: [
      ['Victor Hugo est né en 1802. L’auteur des Misérables…', '雨果生于 1802 年。这位《悲惨世界》的作者……'],
      ['Nous sommes allés à Gaspé. Là-bas, le paysage est spectaculaire.', '我们去了加斯佩，那里的风景壮观。'],
    ],
    sources: [['Des substituts pronominaux, nominaux ou adverbiaux pour reprendre l’information', false]],
    questions: [
      ['Victor Hugo est né en 1802. ___ des Misérables a marqué son siècle.', 'L’auteur', 'Le Hugo', 'Celui-ci auteur'],
      ['Nous sommes allés à Gaspé. ___ , le paysage est spectaculaire.', 'Là-bas', 'Ici-bas', 'Ailleurs'],
      ['Le gouvernement a annoncé une réforme. ___ suscite déjà des critiques.', 'Cette mesure', 'Ce mesure', 'Celui'],
      ['J’ai rencontré la ministre et son adjoint ; ___ m’a paru plus ouvert.', 'ce dernier', 'cette dernière', 'celle-ci'],
    ],
  },
  {
    id: 'ponctuation-style',
    titleZh: '标点的修辞效果',
    explanationZh: '省略号制造悬念或留白，感叹号表达情绪，破折号插入补充，短句营造节奏。',
    examples: [
      ['Et puis… plus rien.', '然后……什么都没有了。'],
      ['Le témoin — un voisin — a tout vu.', '目击者——一位邻居——看到了一切。'],
    ],
    sources: [
      ['L’emploi stylistique de la ponctuation', false],
      ['La ponctuation pour créer des effets de style', false],
    ],
    questions: [
      ['Dans « Et puis… plus rien. », les points de suspension créent :', 'un effet de suspense', 'une question', 'une énumération'],
      ['Dans « Quelle audace ! », le point d’exclamation exprime :', 'une émotion', 'une cause', 'une condition'],
      ['Dans « Le témoin — un voisin — a tout vu. », les tirets servent à :', 'insérer une précision', 'conclure', 'poser une question'],
      ['Dans « Il hésita. Puis il partit. », les phrases courtes créent :', 'un rythme saccadé', 'une hypothèse', 'une concession'],
    ],
  },
  {
    id: 'relations-implicites',
    titleZh: '不用连接词的隐含逻辑',
    explanationZh: '两个句子并列、或用冒号时，读者要自己推断其间的因果、对立或条件关系。',
    examples: [
      ['Il pleuvait à verse. Le match a été reporté.', '下着大雨。比赛延期了。（因果）'],
      ['Je n’ai pas pu venir : ma fille était malade.', '我没能来：女儿病了。（解释）'],
    ],
    sources: [['Les relations implicites entre les idées sans l’utilisation de connecteurs', false]],
    questions: [
      ['« Il pleuvait à verse. Le match a été reporté. » Lien implicite :', 'cause – conséquence', 'opposition', 'but'],
      ['« Elle a travaillé jour et nuit. Elle a échoué. » Lien implicite :', 'opposition', 'cause', 'addition'],
      ['« Je n’ai pas pu venir : ma fille était malade. » Les deux-points introduisent :', 'une explication', 'une opposition', 'un but'],
      ['« Tu veux réussir ? Travaille. » Lien implicite :', 'condition', 'concession', 'comparaison'],
    ],
  },
  {
    id: 'coherence-temporelle',
    titleZh: '时态与语式的连贯',
    explanationZh: '整段文字中时态要前后协调：以过去为基准时用未完成过去时 / 愈过去时 / 条件式表示同时、之前、之后；语式随引导词选择。',
    examples: [
      ['Quand il est arrivé, nous avions déjà mangé.', '他到的时候，我们已经吃过了。'],
      ['Elle espérait que tout se passerait bien.', '她希望一切顺利。'],
    ],
    sources: [['Les modes et les temps verbaux pour assurer la cohérence temporelle', false]],
    questions: [
      ['Quelle phrase est cohérente ?', 'Quand il est arrivé, nous avions déjà mangé.', 'Quand il arrive, nous avions déjà mangé.', 'Quand il est arrivé, nous aurons déjà mangé.'],
      ['Elle espérait que tout ___ bien.', 'se passerait', 'se passera', 'se passe'],
      ['Il est probable qu’elle ___ demain.', 'viendra', 'vienne', 'soit venue'],
      ['Je lui avais dit que je ___ en retard.', 'serais', 'serai', 'suis'],
    ],
  },
  {
    id: 'nuances-texte',
    titleZh: '篇章层面的细微含义',
    explanationZh: '让步—反驳结构（certes … il n’en demeure pas moins）、总结标记（bref）、委婉与反语、重复修辞（anaphore）都会影响文本的论证和语气。',
    examples: [
      ['Certes, la mesure coûte cher ; il n’en demeure pas moins qu’elle est nécessaire.', '诚然，这项措施代价高，但它依然必要。'],
      ['Le moins qu’on puisse dire, c’est que la réunion fut animée.', '至少可以说，会议相当“热闹”。'],
    ],
    sources: [
      ['La personne comprend les nuances de sens véhiculées par la plupart des éléments de la grammaire du texte.', false],
      ['La personne utilise la plupart des éléments de la grammaire du texte.', false],
    ],
    questions: [
      ['« Bref, » au début d’un paragraphe signale :', 'une synthèse', 'une opposition', 'une hypothèse'],
      ['« Certes, c’est cher ; il n’en demeure pas moins que c’est nécessaire. » exprime :', 'une concession suivie d’une réfutation', 'une cause', 'une chronologie'],
      ['« Le moins qu’on puisse dire, c’est que la réunion fut animée. » signifie :', 'la réunion a été très agitée', 'la réunion était calme', 'la réunion a été annulée'],
      ['« Ce projet nous unit. Ce projet nous oblige. Ce projet nous dépasse. » La répétition sert à :', 'insister', 'conclure', 'poser une question'],
    ],
  },
]
