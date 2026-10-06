export type TcfWritingPrompt = {
  id: string
  taskIndex: 1 | 2 | 3
  category: string
  title: string
  prompt: string
  docA?: string
  docB?: string
  minWords: number
  maxWords: number
  sampleAnswer: string
  connectors: string[]
  usefulPhrases: string[]
}

export const TCF_WRITING_TASK1_PROMPTS: TcfWritingPrompt[] = [
  {
    id: 'ee-t1-01',
    category: 'Invitation',
    title: 'Pendaison de crémaillère',
    prompt:
      "Vous venez d'emménager dans un nouvel appartement. Écrivez un courriel à vos amis pour les inviter à votre pendaison de crémaillère. Précisez la date, l'heure, l'adresse, et demandez-leur de confirmer leur présence.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Salut les amis ! J'ai enfin terminé mon emménagement dans mon nouvel appartement à Montréal. Pour fêter cette belle étape, je vous invite tous à ma pendaison de crémaillère le samedi 18 novembre à partir de dix-huit heures. Mon nouveau chez-moi se trouve au 450 rue Saint-Denis. J'ai prévu des boissons et quelques amuse-gueules, mais vous pouvez apporter ce qui vous fait plaisir. Merci de me confirmer votre présence avant jeudi pour que je puisse m'organiser. J'ai hâte de vous faire visiter les lieux et de passer une excellente soirée ensemble !",
    connectors: ['enfin', 'pour fêter', 'à partir de', 'mais', 'avant'],
    usefulPhrases: ["J'ai enfin terminé mon emménagement", 'Je vous invite tous à...', 'Merci de me confirmer votre présence avant...'],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-02',
    category: "Demande d'information",
    title: 'Renseignements sur des cours de français',
    prompt:
      "Vous écrivez à une école de langues pour obtenir des renseignements sur des cours de français du soir. Posez des questions sur les horaires, les tarifs, le nombre d'étudiants par groupe et les modalités d'inscription.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, je vous écris car je souhaite m'inscrire à vos cours du soir de français pour le niveau intermédiaire. Pourriez-vous m'indiquer les horaires exacts des cours ainsi que le tarif pour une session de trois mois ? De plus, j'aimerais savoir combien d'étudiants composent habituellement chaque groupe. Enfin, quelles sont les démarches nécessaires pour passer le test de classement initial ? Vous trouverez mes coordonnées complètes en pièce jointe. Dans l'attente de votre réponse, je vous prie d'agréer mes salutations distinguées.",
    connectors: ['car', 'de plus', 'enfin', "dans l'attente de"],
    usefulPhrases: ["Pourriez-vous m'indiquer...", "J'aimerais savoir...", 'Quelles sont les démarches nécessaires pour...'],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-03',
    category: 'Annulation et report',
    title: "Report d'un rendez-vous médical",
    prompt:
      "Vous avez un rendez-vous chez votre dentiste demain matin, mais un empêchement professionnel vous oblige à reporter. Écrivez un message pour vous excuser, expliquer brièvement la situation et proposer d'autres créneaux.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, j'avais rendez-vous demain matin à neuf heures avec le docteur Gagnon pour un examen de contrôle. Malheureusement, un imprévu professionnel urgent m'oblige à être présent au bureau toute la matinée. Je suis sincèrement désolé pour ce contretemps tardif. Serait-il possible de reporter notre rencontre à vendredi après-midi ou au début de la semaine prochaine ? Je reste joignable par téléphone au 514-555-0199 pour fixer une nouvelle date. Merci beaucoup pour votre compréhension et bonne journée.",
    connectors: ['malheureusement', 'cependant', 'serait-il possible de', 'par conséquent'],
    usefulPhrases: ["Un imprévu professionnel m'oblige à...", 'Je suis sincèrement désolé pour...', 'Serait-il possible de reporter...'],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-04',
    category: 'Remerciement',
    title: 'Remerciements après une collaboration',
    prompt:
      'Votre collègue vous a aidé à finaliser un projet important dans des délais très courts. Envoyez-lui un message chaleureux pour le remercier, souligner son professionnalisme et lui proposer un déjeuner.',
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour Thomas, je tenais à te remercier chaleureusement pour ton aide précieuse sur le dossier de présentation cette semaine. Grâce à ton efficacité et à ta rigueur, nous avons pu respecter l'échéance fixée par la direction sans commettre d'erreur. C'était un véritable plaisir de collaborer avec toi sur ce défi. Pour marquer le coup et te remercier dignement, je t'invite à déjeuner ce midi ou demain au bistrot d'en bas. Dis-moi ce qui te convient le mieux. Encore un immense merci et à très bientôt !",
    connectors: ['grâce à', 'sans', 'pour marquer le coup', 'encore'],
    usefulPhrases: [
      'Je tenais à te remercier chaleureusement pour...',
      'Grâce à ton aide...',
      "C'était un véritable plaisir de collaborer avec toi.",
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-05',
    category: 'Réclamation locative',
    title: "Signalement d'une fuite d'eau au propriétaire",
    prompt:
      "Une fuite d'eau importante est apparue sous l'évier de votre cuisine. Écrivez un courriel à votre propriétaire pour lui décrire le problème, souligner l'urgence et demander le passage rapide d'un plombier.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour Monsieur Tremblay, je vous contacte en urgence car une fuite d'eau importante s'est déclarée ce matin sous l'évier de ma cuisine. Malgré mes tentatives pour couper l'arrivée secondaire, l'eau continue de s'infiltrer sous les meubles et risque d'endommager le plancher en bois. La situation nécessite l'intervention rapide d'un plombier qualifié pour éviter des dégâts plus importants. Je suis disponible toute la journée pour lui ouvrir la porte. Merci de me contacter dès que possible au 438-555-0142 pour convenir d'une visite. Cordialement.",
    connectors: ['en urgence', 'malgré', 'pour éviter', 'dès que possible'],
    usefulPhrases: [
      'Je vous contacte en urgence car...',
      "La situation nécessite l'intervention rapide de...",
      'Merci de me contacter dès que possible.',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-06',
    category: 'Proposition',
    title: 'Week-end au chalet entre amis',
    prompt:
      "Vous organisez une fin de semaine au chalet le mois prochain. Écrivez à vos amis pour leur proposer l'idée, donner les détails (lieu, activités prévues, partage des frais) et leur demander leur avis.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Salut tout le monde ! Que diriez-vous d'un week-end au grand air début octobre ? J'ai trouvé un superbe chalet au bord d'un lac dans les Laurentides pour six personnes. Au programme : randonnée, feu de camp et détente au bord de l'eau. Le coût serait d'environ cinquante dollars par personne pour les deux nuits, plus le partage des repas. Faites-moi savoir si vous êtes partants avant la fin de semaine pour que je valide la réservation. J'espère que vous serez tous disponibles, ce serait génial !",
    connectors: ['au bord de', 'au programme', 'environ', 'avant'],
    usefulPhrases: ['Que diriez-vous de...', 'Faites-moi savoir si vous êtes partants...', "J'espère que vous serez disponibles."],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-07',
    category: 'Information voisinage',
    title: 'Préavis de fête aux voisins',
    prompt:
      "Vous organisez une soirée d'anniversaire chez vous samedi soir. Écrivez un mot à l'attention de vos voisins de palier pour les prévenir du bruit éventuel, vous excuser par avance et leur laisser votre numéro.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Chers voisins, je vous informe que je fêterai mon anniversaire ce samedi 25 octobre dans mon appartement au troisième étage. Il se peut qu'il y ait un peu plus de passage et de musique que d'habitude entre dix-neuf heures et minuit. Nous veillerons bien sûr à limiter le volume sonore pour ne pas perturber votre repos. Je m'excuse par avance pour la gêne occasionnée. En cas de problème ou de bruit excessif, n'hésitez surtout pas à m'appeler au 514-555-0188. Merci beaucoup pour votre compréhension et bonne semaine !",
    connectors: ['ce samedi', 'bien sûr', 'par avance', 'en cas de'],
    usefulPhrases: ['Je vous informe que...', 'Nous veillerons à limiter...', "N'hésitez surtout pas à me contacter si..."],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-08',
    category: 'Demande administrative',
    title: 'Demande de prolongation de congé',
    prompt:
      "Vous écrivez à votre responsable d'équipe pour lui demander deux jours de congé supplémentaires à la suite d'un événement familial imprévu. Expliquez la situation et précisez que vos dossiers sont à jour.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour Madame Roy, je me permets de vous solliciter afin de solliciter deux jours de congé supplémentaires, les jeudi 12 et vendredi 13 novembre prochains. En effet, un événement familial imprévu nécessite ma présence auprès de mes proches en région. Je tiens à vous rassurer : l'ensemble de mes dossiers urgents a été traité et ma collègue Sophie assurera le suivi de mes courriels pendant mon absence. Je reste joignable par courriel pour toute urgence absolue. En espérant une réponse favorable de votre part, je vous remercie pour votre écoute.",
    connectors: ['afin de', 'en effet', 'pendant mon absence', 'en espérant'],
    usefulPhrases: ['Je me permets de vous solliciter pour...', 'Je tiens à vous rassurer...', 'En espérant une réponse favorable...'],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-09',
    category: 'Inscription',
    title: 'Inscription à un atelier municipal',
    prompt:
      'Vous écrivez au centre communautaire de votre quartier pour vous inscrire à un atelier hebdomadaire de menuiserie ou de poterie. Posez des questions sur le matériel à apporter et les conditions de paiement.',
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, j'ai découvert votre programmation automnale et je souhaiterais vivement m'inscrire à l'atelier de poterie du mardi soir. Reste-t-il encore des places disponibles pour la session débutant en octobre ? Pourriez-vous également m'indiquer si le matériel de base est fourni sur place ou s'il faut acheter ses propres outils ? Enfin, acceptez-vous les paiements échelonnés par carte de crédit ? Je vous remercie pour les précisions que vous pourrez m'apporter et vous souhaite une excellente journée. Sincères salutations.",
    connectors: ['également', 'ou', 'enfin', 'pour les précisions'],
    usefulPhrases: [
      "Je souhaiterais vivement m'inscrire à...",
      'Reste-t-il encore des places disponibles pour...',
      "Pourriez-vous m'indiquer si...",
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-10',
    category: 'Petite annonce',
    title: "Achat d'un vélo d'occasion",
    prompt:
      "Vous avez vu une annonce pour un vélo de ville d'occasion. Écrivez au vendeur pour lui demander si le vélo est toujours disponible, s'il a été révisé récemment et convenir d'un moment pour l'essayer.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, votre annonce pour le vélo de ville bleu m'intéresse beaucoup. Est-il toujours disponible à la vente ? J'aimerais savoir si les freins et les vitesses ont été vérifiés récemment et si vous possédez encore la facture d'origine. Si le vélo est toujours à vendre, seriez-vous disponible demain en fin d'après-midi pour que je vienne l'essayer dans votre quartier ? Je peux payer comptant ou par virement électronique selon votre préférence. Merci pour votre retour et bonne soirée !",
    connectors: ['toujours', 'si', 'selon votre préférence', 'pour que'],
    usefulPhrases: [
      "Votre annonce m'intéresse beaucoup",
      'Est-il toujours disponible à la vente ?',
      "Seriez-vous disponible pour que je vienne l'essayer ?",
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-11',
    category: 'Réservation',
    title: "Arrivée tardive à l'hôtel",
    prompt:
      "Vous avez réservé une chambre d'hôtel pour le week-end prochain. Écrivez à la réception pour les informer que votre avion atterrira tard et que vous arriverez après minuit. Demandez la procédure d'accès.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, je dispose d'une réservation au nom de Martin pour deux nuits à compter du 14 octobre (numéro de réservation : 84920). En raison d'un retard de mon vol, je prévois d'arriver à l'hôtel vers une heure du matin. Pourriez-vous me confirmer que la réception reste ouverte 24 heures sur 24 ou m'indiquer le code d'accès de nuit pour récupérer ma clé ? Si possible, j'apprécierais également une chambre au calme donnant sur la cour intérieure. Je vous remercie d'avance pour votre aide et votre flexibilité.",
    connectors: ['en raison de', 'vers', 'pourriez-vous me confirmer', 'si possible'],
    usefulPhrases: [
      "Je dispose d'une réservation au nom de...",
      "En raison d'un retard, je prévois d'arriver à...",
      "Je vous remercie d'avance pour votre aide.",
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-12',
    category: 'Invitation',
    title: "Pique-nique d'été au parc",
    prompt:
      'Pour profiter des beaux jours, vous organisez un pique-nique dimanche après-midi. Écrivez à vos camarades de classe pour les inviter, préciser le lieu exact et répartir ce que chacun apporte.',
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Salut tout le monde ! Comme le soleil est de retour ce week-end, je vous propose d'organiser un grand pique-nique dimanche à partir de midi au parc La Fontaine, près du grand étang. Chacun peut apporter un plat salé, une salade ou un dessert à partager. De mon côté, je m'occupe des boissons fraîches et des jeux de société. Pensez à apporter une nappe ou une couverture pour vous asseoir dans l'herbe. Confirmez-moi votre venue dans notre groupe de discussion. À dimanche pour une belle journée ensoleillée !",
    connectors: ['comme', 'à partir de', 'de mon côté', "dans l'herbe"],
    usefulPhrases: ["Je vous propose d'organiser un grand pique-nique...", 'Chacun peut apporter...', 'Pensez à apporter...'],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-13',
    category: 'Réclamation',
    title: 'Colis non reçu auprès du service client',
    prompt:
      "Vous avez commandé des livres il y a deux semaines et le suivi indique que le colis est livré, mais vous n'avez rien reçu. Écrivez au service client pour demander une enquête ou un remboursement.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Madame, Monsieur, j'ai passé la commande numéro 72910 sur votre site le 5 septembre dernier. Bien que l'avis de suivi indique une livraison effectuée hier, je vous informe que je n'ai reçu aucun colis dans ma boîte aux lettres ni chez mes voisins. Après vérification auprès du gardien de l'immeuble, le livreur n'est pas passé. Par conséquent, je vous demande d'ouvrir une enquête rapide auprès du transporteur ou de procéder à la réexpédition de ma commande. Sans nouvelle sous quarante-huit heures, je demanderai un remboursement complet.",
    connectors: ['bien que', 'après vérification', 'par conséquent', 'sans nouvelle'],
    usefulPhrases: [
      "Je vous informe que je n'ai reçu aucun...",
      'Par conséquent, je vous demande de...',
      'Sans nouvelle sous quarante-huit heures, je...',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-14',
    category: "Demande d'information",
    title: "Renseignements auprès d'un club de randonnée",
    prompt:
      "Vous souhaitez rejoindre un groupe de randonnée pédestre. Écrivez au responsable de l'association pour connaître le niveau physique requis, la fréquence des sorties et le montant de la cotisation annuelle.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour, passionné de marche en nature, je souhaite adhérer à votre club de randonnée pour la saison à venir. Pourriez-vous me préciser quel niveau d'endurance physique est exigé pour participer aux sorties du dimanche ? Par ailleurs, combien de kilomètres parcourez-vous en moyenne lors d'une journée type ? J'aimerais également connaître le montant de la cotisation annuelle ainsi que l'équipement obligatoire nécessaire pour les nouveaux membres. Je vous remercie par avance pour ces informations précieuses et espère marcher bientôt à vos côtés.",
    connectors: ['pour la saison', 'par ailleurs', 'en moyenne', 'également'],
    usefulPhrases: ['Je souhaite adhérer à votre club...', 'Pourriez-vous me préciser quel niveau...', "J'aimerais également connaître..."],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-15',
    category: 'Remerciement',
    title: 'Remerciement à un professeur de français',
    prompt:
      "Vous venez de terminer une session intensive de français. Écrivez un message de remerciement à votre enseignant en mentionnant vos progrès et l'ambiance motivante des cours.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Chère professeure Leblanc, notre session intensive de français s'est terminée vendredi et je tenais à vous exprimer toute ma gratitude. Grâce à votre pédagogie bienveillante et à votre dynamisme, j'ai surmonté mes appréhensions à l'oral et j'ai enrichi mon vocabulaire de manière spectaculaire. L'ambiance conviviale que vous avez créée dans le groupe a rendu chaque cours très stimulant. Je me sens désormais beaucoup plus confiant pour passer les épreuves du TCF. Merci encore pour votre dévouement exceptionnel et votre patience au quotidien.",
    connectors: ['grâce à', 'désormais', 'chaque cours', 'encore'],
    usefulPhrases: [
      'Je tenais à vous exprimer toute ma gratitude',
      'Grâce à votre pédagogie bienveillante...',
      'Je me sens désormais beaucoup plus confiant pour...',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-16',
    category: 'Demande de service',
    title: 'Proposition de covoiturage professionnel',
    prompt:
      "Votre voiture est en réparation pour la semaine. Écrivez à un collègue qui habite dans le même secteur pour lui demander s'il peut vous covoiturer jusqu'au bureau et lui proposer de partager l'essence.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Salut David, j'espère que tu vas bien. Ma voiture est actuellement immobilisée au garage pour des réparations majeures toute la semaine prochaine. Sachant que nous habitons dans le même quartier et que nous commençons à la même heure, accepterais-tu de me prendre en covoiturage pour aller au bureau ? Je pourrais te rejoindre chaque matin au coin de ta rue à huit heures précises. Il va de soi que je participerai volontiers aux frais d'essence de la semaine. Dis-moi si cela te convient !",
    connectors: ['actuellement', 'sachant que', 'chaque matin', 'il va de soi que'],
    usefulPhrases: [
      'Accepterais-tu de me prendre en covoiturage...',
      'Je pourrais te rejoindre à...',
      'Il va de soi que je participerai à...',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-17',
    category: "Notification d'absence",
    title: 'Absence à une séance sportive',
    prompt:
      "Vous ne pourrez pas assister à votre cours habituel de natation ou de pilates ce jeudi. Écrivez à l'instructeur pour le prévenir et demander si vous pouvez rattraper le cours sur un autre créneau.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Bonjour Julie, je vous écris pour vous informer que je ne pourrai pas assister à notre cours de pilates ce jeudi soir à dix-neuf heures en raison d'un déplacement professionnel. Afin de ne pas perdre cette séance d'entraînement, serait-il possible de participer exceptionnellement au cours de samedi matin ou à celui de mardi prochain ? Je sais que les places sont limitées, mais je serais ravi de m'insérer s'il y a un désistement. Merci beaucoup pour votre compréhension et à très bientôt en studio !",
    connectors: ['en raison de', 'afin de', 'exceptionnellement', 'à très bientôt'],
    usefulPhrases: [
      'Je vous écris pour vous informer que...',
      'Serait-il possible de participer exceptionnellement à...',
      'Merci beaucoup pour votre compréhension.',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-18',
    category: 'Demande amicale',
    title: 'Prêt de matériel de camping',
    prompt:
      'Vous préparez une première sortie en camping le week-end prochain. Écrivez à un ami expérimenté pour lui demander de vous prêter une tente et lui demander des conseils sur le matériel indispensable.',
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Salut Alexandre ! Je pars camper pour la toute première fois ce week-end dans un parc national avec deux amis. Comme tu es un grand adepte du plein air, je me demandais si tu aurais la gentillesse de me prêter ta tente trois places pour quelques jours ? Je promets d'en prendre le plus grand soin et de te la rendre nettoyée dès lundi. Au passage, aurais-tu deux ou trois conseils essentiels à me donner sur ce qu'il ne faut surtout pas oublier d'emporter ? Merci mille fois d'avance !",
    connectors: ['comme', 'dès lundi', 'au passage', 'surtout'],
    usefulPhrases: [
      'Je me demandais si tu aurais la gentillesse de...',
      "Je promets d'en prendre le plus grand soin",
      'Aurais-tu deux ou trois conseils sur...',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-19',
    category: 'Demande administrative',
    title: "Demande d'inscription en garderie municipale",
    prompt:
      "Vous venez de vous installer dans une nouvelle ville et vous cherchez une place en garderie pour votre fille de deux ans. Écrivez à la responsable pour demander les critères d'admission et les délais d'attente.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Madame la directrice, nouvellement installé dans la municipalité avec ma famille, je recherche une place en garderie à temps plein pour ma fille de deux ans à compter du mois de janvier. Pourriez-vous m'indiquer la marche à suivre pour inscrire notre enfant sur votre liste d'attente prioritaire ? Quels sont les documents justificatifs exigés pour compléter le dossier d'admission ? De plus, pourriez-vous me donner une estimation du délai d'attribution d'une place ? En vous remerciant sincèrement pour votre aide précieuse, je vous adresse mes salutations cordiales.",
    connectors: ['à compter de', 'de plus', 'en vous remerciant', 'sincèrement'],
    usefulPhrases: [
      "Pourriez-vous m'indiquer la marche à suivre pour...",
      'Quels sont les documents justificatifs exigés...',
      'En vous remerciant pour votre aide...',
    ],
    taskIndex: 1,
  },
  {
    id: 'ee-t1-20',
    category: 'Message de départ',
    title: 'Adieu et remerciements aux collègues',
    prompt:
      "C'est votre dernier jour dans l'entreprise avant de commencer un nouvel emploi. Écrivez un message d'adieu chaleureux à l'ensemble de votre équipe pour les remercier des trois années passées ensemble et laisser vos coordonnées.",
    minWords: 60,
    maxWords: 120,
    sampleAnswer:
      "Chers collègues, après trois merveilleuses années parmi vous, le moment est venu pour moi de relever de nouveaux défis professionnels. Je tenais à vous remercier de tout cœur pour votre soutien constant, votre bonne humeur et tous les beaux projets que nous avons menés ensemble. Cette expérience restera gravée dans ma mémoire grâce à votre esprit d'équipe exceptionnel. Je serais ravi de rester en contact avec vous tous : n'hésitez pas à m'écrire sur mon adresse personnelle (claire.bernard@email.com). Je vous souhaite à chacun une excellente continuation et beaucoup de succès !",
    connectors: ['après', 'de tout cœur', 'grâce à', "n'hésitez pas à"],
    usefulPhrases: [
      'Le moment est venu pour moi de...',
      'Je tenais à vous remercier de tout cœur pour...',
      'Je serais ravi de rester en contact.',
    ],
    taskIndex: 1,
  },
]

export const TCF_WRITING_TASK2_PROMPTS: TcfWritingPrompt[] = [
  {
    id: 'ee-t2-01',
    category: 'Témoignage professionnel',
    title: 'Ma reconversion professionnelle',
    prompt:
      'Vous publiez un texte sur un réseau professionnel pour raconter votre reconversion vers un nouveau métier après dix ans dans la même branche. Décrivez les étapes, vos hésitations et ce que cela a changé dans votre vie.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Après dix années stimulantes mais épuisantes dans le secteur bancaire, j'ai décidé l'an dernier de tout quitter pour me consacrer à ma passion : l'ébénisterie artisanale. Au début, franchir ce cap n'a pas été facile. La peur de perdre un salaire confortable et le regard sceptique de mon entourage ont suscité de nombreuses nuits d'angoisse. Pourtant, j'ai intégré une formation intensive de huit mois où j'ai réappris le travail manuel et la patience. Aujourd'hui, je gère mon propre atelier de création de meubles durables. Cette reconversion a totalement transformé mon équilibre quotidien. Certes, les journées sont parfois longues et exigeantes, mais la satisfaction de créer un objet tangible de mes propres mains n'a aucun prix. Si vous hésitez à faire le grand saut, rappelez-vous qu'il n'est jamais trop tard pour donner un nouveau sens à sa carrière.",
    connectors: ['après', 'au début', 'pourtant', "aujourd'hui", 'certes', 'si vous hésitez'],
    usefulPhrases: [
      "J'ai décidé de tout quitter pour...",
      "Franchir ce cap n'a pas été facile",
      'Cette expérience a totalement transformé mon équilibre quotidien',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-02',
    category: 'Récit de voyage',
    title: 'Une expédition inoubliable en Gaspésie',
    prompt:
      'Sur votre blog de voyage, racontez une fin de semaine passée dans un parc naturel ou une région touristique. Racontez vos activités, une rencontre surprenante et vos impressions générales.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "L'été dernier, j'ai entrepris une traversée inoubliable de la Gaspésie qui restera gravée dans ma mémoire. Dès mon arrivée au parc national de Forillon, la majesté des falaises plongeant dans l'océan m'a laissé sans voix. Durant trois jours, j'ai arpenté les sentiers côtiers au lever du jour pour observer la faune locale. Le moment fort du séjour s'est produit lors d'une randonnée en kayak de mer, lorsqu'une famille de phoques curieux s'est approchée à quelques mètres de mon embarcation. Plus tard, j'ai partagé un souper chaleureux dans une auberge de jeunesse avec des pêcheurs locaux qui m'ont raconté l'histoire fascinante de leur village. Cette immersion dans une nature préservée m'a permis de me ressourcer en profondeur loin de l'agitation urbaine. Je recommande vivement cette destination authentique à tous les amoureux de paysages grandioses.",
    connectors: ['dès mon arrivée', 'durant', 'lorsque', 'plus tard', 'cette immersion'],
    usefulPhrases: [
      'Cette expérience restera gravée dans ma mémoire',
      "Le moment fort du séjour s'est produit lors de...",
      'Je recommande vivement cette destination à...',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-03',
    category: 'Article de blog',
    title: 'Adopter un chien dans un refuge',
    prompt:
      "Vous écrivez un article pour sensibiliser à l'adoption responsable d'animaux. Partagez votre expérience personnelle d'adoption, les défis rencontrés les premières semaines et le bonheur apporté par votre animal.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Il y a six mois, j'ai poussé la porte d'un refuge local pour offrir une seconde chance à un animal abandonné. C'est là que j'ai croisé le regard de Milo, un berger croisé d'un an. Les premières semaines à la maison n'ont pas été simples. Traumatisé par son passé, il sursautait au moindre bruit et refusait de s'alimenter en ma présence. Cependant, avec de la patience, de la douceur et des promenades régulières en forêt, il a progressivement repris confiance. Aujourd'hui, Milo est un compagnon joyeux, fidèle et plein d'énergie qui illumine mes journées. Adopter en refuge demande un engagement sincère, mais la gratitude d'un animal sauvé compense largement tous les efforts. N'achetez plus vos animaux, offrez plutôt une nouvelle vie à ceux qui attendent dans les refuges.",
    connectors: ['il y a', "c'est là que", 'cependant', 'progressivement', "aujourd'hui"],
    usefulPhrases: [
      'Offrir une seconde chance à...',
      "Les premières semaines n'ont pas été de tout repos",
      'Cela compense largement tous les efforts',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-04',
    category: 'Chronique de société',
    title: 'Mon bilan après un an de télétravail',
    prompt:
      'Dans une tribune en ligne, racontez comment une année complète de télétravail a changé votre organisation personnelle, votre efficacité et votre vie familiale.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Voilà tout juste douze mois que mon salon s'est transformé en bureau permanent. Au départ, je craignais que l'absence de collègues autour de moi ne nuise à ma motivation quotidienne. Pourtant, cette nouvelle organisation a rapidement révélé des bénéfices inattendus. Le fait d'éliminer deux heures de transport quotidien en métro m'a offert un gain de temps inestimable pour pratiquer le sport et préparer des repas sains. De plus, j'ai constaté une nette amélioration de ma concentration sur les tâches complexes sans interruptions constantes. En contrepartie, la frontière entre vie professionnelle et sphère privée est devenue parfois poreuse. J'ai donc dû instaurer des rituels stricts, comme éteindre mon ordinateur à dix-sept heures précises et sortir marcher. En conclusion, malgré quelques moments de solitude, ce mode de travail hybride m'apporte une flexibilité précieuse que je ne souhaite plus abandonner.",
    connectors: ['au départ', 'pourtant', 'de plus', 'en contrepartie', 'en conclusion'],
    usefulPhrases: [
      'Cette nouvelle organisation a révélé des bénéfices inattendus',
      'Un gain de temps inestimable pour...',
      "J'ai donc dû instaurer des règles strictes",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-05',
    category: "Récit d'engagement",
    title: 'Une matinée à la banque alimentaire',
    prompt:
      "Vous racontez votre première matinée de bénévolat au sein d'un organisme communautaire. Décrivez les tâches effectuées, l'équipe et ce que cette action vous a apporté humainement.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Samedi dernier, j'ai participé pour la première fois à la distribution de paniers solidaires à la banque alimentaire de mon quartier. Dès sept heures du matin, notre équipe de dix bénévoles s'est activée dans l'entrepôt pour trier les fruits et légumes donnés par les commerçants partenaires. L'énergie collective était communicative et chacun savait exactement quoi faire dans une atmosphère d'entraide formidable. Lorsque les premiers bénéficiaires sont arrivés à dix heures, nous avons échangé des sourires chaleureux et quelques paroles réconfortantes avec des familles reconnaissantes. Cette expérience concrète m'a ouvert les yeux sur la précarité qui touche de nombreuses personnes ordinaires près de chez nous. Elle m'a aussi rappelé qu'un petit geste solidaire peut faire une différence immense dans le quotidien d'autrui. Je compte désormais m'y investir deux samedis par mois avec conviction.",
    connectors: ['samedi dernier', 'dès', 'lorsque', 'cette expérience', 'désormais'],
    usefulPhrases: [
      "L'énergie collective était communicative",
      "Cette expérience m'a ouvert les yeux sur...",
      "Faire une différence immense dans le quotidien d'autrui",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-06',
    category: 'Article de blog',
    title: 'Adieu la voiture, bonjour le vélo',
    prompt:
      'Vous avez vendu votre voiture pour utiliser exclusivement le vélo en ville. Racontez cette transition, vos craintes initiales (météo, sécurité) et les bienfaits sur votre santé et votre portefeuille.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Il y a un an, j'ai pris une décision radicale : vendre ma voiture familiale pour circuler uniquement à bicyclette en ville. Mes amis me traitaient d'inconscient en évoquant les hivers rigoureux et la circulation dense. Les débuts ont effectivement demandé quelques adaptations matérielles, notamment l'achat de vêtements imperméables de qualité et de bons pneus cloutés pour l'hiver. Mais les résultats ont dépassé toutes mes espérances. Non seulement j'ai économisé plus de quatre mille dollars en assurance, carburant et stationnement, mais ma condition physique s'est spectaculairement améliorée en quelques mois. Fini le stress des bouchons matinaux : mon temps de trajet est désormais prévisible à la minute près. Rouler à vélo m'a reconnecté à ma ville et à ses quartiers d'une manière incomparable. Je ne reviendrais en arrière pour rien au monde !",
    connectors: ['il y a un an', 'les débuts', 'mais', 'non seulement... mais', 'désormais'],
    usefulPhrases: [
      "J'ai pris une décision radicale",
      'Les résultats ont dépassé toutes mes espérances',
      'Je ne reviendrais en arrière pour rien au monde',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-07',
    category: "Témoignage d'apprentissage",
    title: 'Apprendre une langue à quarante ans',
    prompt:
      "Vous partagez votre expérience de reprise d'études pour apprendre le français à l'âge adulte. Décrivez votre méthode, les obstacles surmontés et votre fierté aujourd'hui.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Reprendre l'apprentissage d'une langue étrangère à quarante ans semblait être un défi presque insurmontable au départ. Avec un emploi à temps plein et deux jeunes enfants, trouver du temps pour mémoriser les règles de grammaire exigeait une rigueur de fer. J'ai donc choisi de m'exercer trente minutes chaque matin avant le réveil de la maisonnée, en combinant des applications mobiles, des balados francophones et des cours du soir. La conjugaison du subjonctif et la distinction entre passé composé et imparfait m'ont causé bien des maux de tête. Toutefois, en m'autorisant à faire des erreurs sans honte devant mes professeurs, j'ai fini par débloquer ma fluidité orale. Le mois dernier, j'ai réussi mon premier entretien professionnel entièrement en français. Cette victoire personnelle me prouve que la plasticité cérébrale ne dépend pas de l'âge, mais de la régularité.",
    connectors: ['au départ', 'avec', "j'ai donc choisi", 'toutefois', 'cette victoire'],
    usefulPhrases: [
      'Semblait être un défi presque insurmontable',
      'Exigeait une rigueur de fer',
      'Cette victoire personnelle me prouve que...',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-08',
    category: 'Récit culturel',
    title: 'Mon premier festival de musique francophone',
    prompt:
      "Racontez une soirée mémorable passée dans un grand festival de musique ou d'art en plein air. Décrivez l'ambiance, les artistes et les émotions ressenties.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "En juillet dernier, j'ai assisté pour la toute première fois aux FrancoFolies de Montréal, et l'expérience a été tout simplement magique. Dès la tombée de la nuit, la place des Festivals s'est remplie d'une marée humaine vibrante et enthousiaste de tous âges. Sur la scène principale, un groupe folk québécois enchaînait les refrains entraînants accompagnés de violons énergiques. Tout le public chantait en chœur, les bras levés sous les lumières colorées. Ce qui m'a profondément touché, c'est l'ambiance bienveillante et festive qui régnait dans la foule : on croisait des touristes et des résidents qui partageaient la même passion musicale sans barrière. Après deux heures de concert ininterrompu, je suis reparti le cœur léger et la tête pleine de mélodies. Ce festival incarne parfaitement la vitalité culturelle et la générosité de la francophonie.",
    connectors: ['en juillet dernier', 'dès', 'sur la scène', "ce qui m'a touché", 'après'],
    usefulPhrases: [
      "L'expérience a été tout simplement magique",
      "Ce qui m'a profondément touché, c'est...",
      'Ce festival incarne parfaitement...',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-09',
    category: 'Expérience humaine',
    title: 'Vivre en colocation intergénérationnelle',
    prompt:
      "Pendant un an, vous avez logé chez une dame âgée dans le cadre d'un programme intergénérationnel. Racontez cette cohabitation, les échanges quotidiens et les préjugés déconstruits.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Durant ma première année universitaire, j'ai choisi de vivre en colocation avec Marguerite, une institutrice à la retraite de quatre-vingt-deux ans. Au début, mes camarades trouvaient cette formule étrange et pensaient que je manquerais d'indépendance. En réalité, cette cohabitation s'est révélée d'une richesse humaine extraordinaire. En échange d'un loyer modique et d'une présence rassurante le soir, je partageais nos soupers trois fois par semaine. Marguerite me racontait l'histoire de la ville à travers les décennies et corrigeait mes dissertations avec humour, tandis que je l'initiais aux appels vidéo sur tablette. Cette expérience a balayé tous mes préjugés sur le fossé entre les générations. Elle m'a appris à écouter avec attention et à apprécier le rythme d'une vie plus posée. Marguerite est devenue une véritable amie que je continue de visiter régulièrement avec grand plaisir.",
    connectors: ['durant', 'au début', 'en réalité', 'tandis que', 'cette expérience'],
    usefulPhrases: [
      "S'est révélée d'une richesse humaine extraordinaire",
      'Cette expérience a balayé tous mes préjugés',
      "Elle m'a appris à écouter avec attention",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-10',
    category: 'Récit sportif',
    title: 'Mes débuts en ski de fond en forêt',
    prompt:
      "Racontez votre toute première sortie en ski de fond en plein hiver. Décrivez les chutes amusantes du début, la beauté du paysage enneigé et le sentiment d'accomplissement à l'arrivée.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Vivant dans un pays nordique depuis peu, je redoutais l'hiver jusqu'au jour où j'ai chaussé des skis de fond pour la première fois. Notre groupe s'est élancé sur une piste boisée du mont Royal par un matin glacial mais baigné de soleil. Les premières montées ont été comiques : mes spatules se croisaient constamment et j'ai atterri dans la poudreuse à trois reprises sous les rires complices de mes amis. Cependant, dès que j'ai trouvé le bon rythme de glisse, la magie a opéré. Le silence absolu de la forêt enneigée, troublé uniquement par le crissement de nos skis, procurait une paix intérieure incroyable. À l'arrivée au chalet d'accueil, savourer un chocolat chaud fumant devant la cheminée m'a procuré un sentiment de fierté inoubliable. L'hiver n'est plus une saison à subir, c'est désormais mon terrain de jeu préféré.",
    connectors: ['depuis peu', 'cependant', 'dès que', "à l'arrivée", 'désormais'],
    usefulPhrases: [
      "Je redoutais l'hiver jusqu'au jour où...",
      'La magie a opéré dès que...',
      "M'a procuré un sentiment de fierté inoubliable",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-11',
    category: 'Défi personnel',
    title: 'Un mois sans supermarché',
    prompt:
      'Vous avez tenté le défi de ne faire vos courses que chez les petits commerçants et au marché local pendant un mois. Racontez cette aventure, les surprises et les leçons apprises.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "En mai dernier, j'ai relevé le défi de boycotter totalement les grandes surfaces d'alimentation pendant trente jours consécutifs. Mon objectif était de privilégier les producteurs locaux, les épiceries en vrac et le marché fermier de quartier. Au départ, cela m'a demandé une réorganisation complète : planifier mes menus à l'avance et consacrer deux matinées par semaine à faire la tournée des commerçants à pied. Très vite, la qualité gustative des aliments frais a transformé ma façon de cuisiner. J'ai redécouvert le plaisir de discuter avec le maraîcher et de connaître la provenance exacte de mes légumes. Contrairement à mes craintes, ma facture globale n'a pas augmenté car j'ai complètement éliminé les achats impulsifs de produits ultra-transformés. Cette expérience a profondément modifié ma consommation : je soutiens désormais l'économie locale avec une immense fierté au quotidien.",
    connectors: ['en mai dernier', 'au départ', 'très vite', 'contrairement à', 'désormais'],
    usefulPhrases: [
      "J'ai relevé le défi de...",
      'Très vite, la qualité a transformé ma façon de...',
      'Cette expérience a profondément modifié ma consommation',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-12',
    category: 'Récit de vie',
    title: 'Quitter la grande ville pour la campagne',
    prompt:
      "Racontez votre déménagement d'un appartement exigu en centre-ville vers une maison avec jardin dans un village rural. Comparez votre quotidien avant et après ce choix.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Pendant quinze ans, j'ai vécu dans le tumulte trépidant de la métropole, logé dans un deux-pièces sombre et hors de prix. Lorsque le télétravail s'est généralisé, mon conjoint et moi avons sauté le pas pour nous installer dans un charmant village à deux heures de la ville. Le contraste avec notre ancienne routine a été saisissant dès les premières semaines. À la place des klaxons et de la pollution, notre réveil se fait au chant des oiseaux avec une vue imprenable sur les collines. Les enfants ont enfin de l'espace pour courir dans le jardin et faire du vélo en toute sécurité. Certes, les services sont plus éloignés et nécessitent d'utiliser la voiture pour l'épicerie, mais la qualité de l'air et la solidarité du voisinage l'emportent largement. Nous avons gagné en sérénité et en qualité de vie.",
    connectors: ['pendant quinze ans', 'lorsque', 'dès les premières semaines', 'certes... mais', 'enfin'],
    usefulPhrases: [
      'Le contraste avec notre ancienne routine a été saisissant',
      'Nous avons sauté le pas pour...',
      'Nous avons gagné en sérénité',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-13',
    category: 'Engagement citoyen',
    title: 'Cultiver au jardin communautaire',
    prompt:
      "Vous avez rejoint le jardin collectif de votre quartier cette saison. Décrivez votre parcelle, l'organisation collective entre voisins et le bonheur de récolter vos légumes.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Au printemps dernier, j'ai obtenu une parcelle de terre dans le jardin communautaire situé à deux pas de chez moi. Dès les premiers jours de bêchage, j'ai été accueilli chaleureusement par un groupe de voisins passionnés qui m'ont prodigué de précieux conseils de permaculture. Ensemble, nous partagions les corvées d'arrosage, l'entretien des outils communs et la fabrication du compost. Cultiver mes propres tomates, courgettes et fines herbes m'a reconnecté aux cycles naturels de la terre. Quel bonheur indescriptible de préparer une salade le soir même avec des produits récoltés quelques minutes plus tôt sous mes yeux ! Au-delà de l'abondance des récoltes biologiques, ce jardin est devenu un véritable poumon social où l'on tisse des liens solides entre générations. C'est l'un des plus beaux projets collectifs auxquels j'ai eu la chance de participer.",
    connectors: ['au printemps dernier', 'dès les premiers jours', 'ensemble', 'au-delà de', "c'est l'un des"],
    usefulPhrases: [
      "J'ai été accueilli chaleureusement par...",
      'Quel bonheur indescriptible de...',
      "Au-delà de l'abondance, c'est devenu un poumon social",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-14',
    category: 'Chronique locale',
    title: "L'ouverture d'un café solidaire de quartier",
    prompt:
      "Racontez la création d'un café associatif et solidaire dans votre rue. Décrivez son concept (tarifs libres, ateliers gratuits) et l'impact positif sur la vie du quartier.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Il y a quelques mois, un local commercial abandonné de notre rue a repris vie grâce à la mobilisation d'un collectif d'habitants motivés. Ensemble, nous avons fondé « Le Petit Repère », un café solidaire fondé sur le principe de la contribution libre. Ici, chacun paie sa boisson selon ses moyens et peut laisser un café suspendu pour une personne dans le besoin. Dès son inauguration, le lieu s'est transformé en point de ralliement pour tout le quartier. On y trouve des ateliers d'aide aux devoirs, des soirées de jeux de société et des cours d'informatique pour les aînés. Ce projet prouve qu'un espace sans visée commerciale peut recréer du lien social là où l'individualisme régnait. Voir des étudiants côtoyer des retraités autour d'un thé redonne un souffle d'espoir magnifique à notre vie de quartier.",
    connectors: ['il y a quelques mois', 'ensemble', 'dès son inauguration', 'ici', 'ce projet prouve que'],
    usefulPhrases: [
      'Un local a repris vie grâce à...',
      'Chacun paie selon ses moyens',
      "Ce projet prouve qu'un espace solidaire peut recréer du lien",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-15',
    category: 'Récit de vacances',
    title: 'Mes vacances en échange de maison',
    prompt:
      "Vous avez testé pour la première fois l'échange de maison pour vos vacances d'été. Racontez comment s'est déroulé cet échange avec une famille étrangère et les avantages vécus.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Pour nos vacances estivales, ma famille a décidé de tenter une aventure inédite : échanger notre maison québécoise avec celle d'une famille bretonne pendant trois semaines. Au départ, confier nos clés et nos effets personnels à de parfaits inconnus suscitait une certaine appréhension. Pourtant, après plusieurs échanges chaleureux par visioconférence, la confiance s'est naturellement installée. À notre arrivée en France, nous avons découvert une maison impeccable avec une lettre de bienvenue détaillant les plus belles criques secrètes de la région. Pendant ce temps, nos homologues profitaient de nos bicyclettes et de notre cour arrière. Cette formule nous a permis d'économiser le coût exorbitant d'un hébergement touristique tout en vivant comme de véritables habitants locaux. Nous avons noué une amitié sincère avec cette famille et prévoyons déjà de renouveler l'expérience l'an prochain dans une autre contrée.",
    connectors: ['au départ', 'pourtant', 'à notre arrivée', 'pendant ce temps', 'cette formule'],
    usefulPhrases: [
      'Tenter une aventure inédite',
      "La confiance s'est naturellement installée",
      'Vivre comme de véritables habitants locaux',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-16',
    category: 'Article écologique',
    title: 'Mon cheminement vers le zéro déchet',
    prompt:
      "Racontez comment vous avez réussi à réduire de 80 % vos déchets ménagers en un an. Décrivez les gestes simples mis en place et l'impact sur votre mode de vie.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "En constatant la quantité alarmante d'emballages plastiques qui débordaient de ma poubelle chaque semaine, j'ai décidé d'entamer une transition vers le zéro déchet. J'ai commencé par des gestes élémentaires : emporter des sacs en tissu et des bocaux en verre à l'épicerie, refuser les emballages jetables et fabriquer mes propres produits ménagers avec du vinaigre blanc. Peu à peu, j'ai aussi adopté le compostage pour les résidus de table. En l'espace de douze mois, le volume de mes déchets a chuté de façon spectaculaire : je ne sors désormais qu'un seul petit sac par mois ! Cette démarche m'a permis d'alléger mon esprit, de consommer avec conscience et de réaliser d'importantes économies. Réduire ses déchets n'exige pas d'être parfait du jour au lendemain, mais de poser chaque jour un geste réfléchi pour préserver notre planète commune.",
    connectors: ['en constatant', "j'ai commencé par", 'peu à peu', "en l'espace de", 'désormais'],
    usefulPhrases: [
      'Entamer une transition vers...',
      "En l'espace de douze mois, le volume a chuté",
      'Poser chaque jour un geste réfléchi pour...',
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-17',
    category: "Récit d'apprentissage",
    title: "Mon stage d'initiation à la forge d'art",
    prompt:
      "Vous avez suivi un stage intensif de trois jours pour apprendre les bases de la ferronnerie d'art. Décrivez l'atelier, la manipulation du feu et du fer et votre fierté finale.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Le week-end dernier, j'ai réalisé un rêve d'enfance en participant à un atelier de forge traditionnelle au cœur d'un vieux village d'artisans. Dès que j'ai franchi le seuil de l'atelier, l'odeur du charbon incandescent et le tintement régulier des marteaux m'ont plongé dans une atmosphère fascinante. Sous le regard attentif d'un maître forgeron expérimenté, j'ai appris à dompter le feu de la forge, à chauffer l'acier jusqu'au rouge vif et à frapper l'enclume avec précision. Le travail physique était harassant et la chaleur étouffante, mais voir une simple barre de métal brut se métamorphoser sous mes yeux était magique. À la fin du troisième jour, j'ai achevé un magnifique couteau gravé dont je suis extrêmement fier. Cette expérience m'a appris le respect du geste d'artisan et l'humilité face à la matière brute.",
    connectors: ['le week-end dernier', 'dès que', 'sous le regard', 'mais', 'à la fin de'],
    usefulPhrases: [
      "J'ai réalisé un rêve d'enfance en...",
      "L'expérience m'a plongé dans une atmosphère fascinante",
      "J'ai appris le respect du geste d'artisan",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-18',
    category: 'Expérience bien-être',
    title: 'Une fin de semaine sans aucun écran',
    prompt:
      'Racontez une expérience de déconnexion numérique totale de 48 heures sans téléphone, ordinateur ni télévision. Racontez le sevrage initial et le bien-être retrouvé.',
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Pris au piège des notifications incessantes et du défilement machinal sur les réseaux sociaux, j'ai tenté une déconnexion numérique complète pendant tout un week-end. Le vendredi soir à vingt heures, j'ai enfermé mon téléphone et mon ordinateur portable dans un tiroir à clé. Les premières heures ont provoqué un réflexe quasi obsessionnel de vérifier ma poche au moindre temps mort. Pourtant, dès le samedi matin, ce sentiment d'urgence artificielle s'est dissipé pour laisser place à un calme extraordinaire. J'ai dévoré un roman entier de trois cents pages, cuisiné un mijoté sans montre en main et marché en forêt l'esprit totalement disponible. Cette parenthèse m'a fait réaliser à quel point les écrans fragmentent notre attention et volent notre temps précieux. Depuis cette expérience salutaire, je m'impose une journée sans écran chaque dimanche.",
    connectors: ['le vendredi soir', 'pourtant', 'dès le samedi', 'cette parenthèse', 'depuis'],
    usefulPhrases: [
      'Pris au piège des notifications incessantes',
      "Ce sentiment d'urgence artificielle s'est dissipé",
      "Cette parenthèse m'a fait réaliser à quel point...",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-19',
    category: "Récit d'accueil",
    title: 'Accueillir un étudiant international chez soi',
    prompt:
      "Pendant six mois, vous avez hébergé chez vous un étudiant venu d'un autre continent. Racontez les échanges culturels, le partage des repas et les liens durables tissés.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "L'automne dernier, ma famille a pris la décision d'ouvrir sa porte à Mateo, un étudiant colombien venu faire un échange universitaire de six mois à Montréal. Cette cohabitation s'est vite transformée en un pont culturel inestimable pour nous tous. Autour de la table du souper, nous comparions avec curiosité nos coutumes, nos proverbes populaires et nos spécialités culinaires, alternant entre mets traditionnels québécois et empanadas préparées à quatre mains. Nous avons pris plaisir à lui faire découvrir les hivers canadiens, ses premières tempêtes de neige et le patinage sur le lac gelé. En retour, son enthousiasme communicatif et son optimisme ont insufflé une énergie magnifique à notre foyer. Lorsque son avion a décollé en avril, nous avions le cœur serré mais la certitude d'avoir gagné un membre de famille supplémentaire à l'autre bout du continent.",
    connectors: ["l'automne dernier", 'autour de la table', 'en retour', 'lorsque', 'la certitude de'],
    usefulPhrases: [
      "Cette cohabitation s'est transformée en un pont culturel inestimable",
      'Nous prenions plaisir à lui faire découvrir...',
      "Nous avions la certitude d'avoir gagné un ami fidèle",
    ],
    taskIndex: 2,
  },
  {
    id: 'ee-t2-20',
    category: 'Récit de rénovation',
    title: 'Rénover une maison ancienne avec patience',
    prompt:
      "Vous avez acheté et rénové de vos mains une vieille maison de village. Racontez les imprévus rencontrés, l'apprentissage du bricolage et la joie du résultat final.",
    minWords: 120,
    maxWords: 150,
    sampleAnswer:
      "Il y a deux ans, nous avons eu le coup de foudre pour une maison centenaire dont les murs en pierre menaçaient ruine. Ignorant tout du bâtiment au départ, nous avons choisi de relever le défi de la restaurer nous-mêmes en préservant son cachet historique. Les chantiers du week-end n'ont pas manqué de péripéties : découverte d'une toiture à remplacer en urgence, planchers affaissés et plomberie d'époque à repenser entièrement. Guidés par des tutoriels et les conseils de voisins généreux, nous avons appris à poser du carrelage, réparer les boiseries et isoler à la laine de chanvre. Chaque étape franchie représentait une victoire collective sur le découragement. Aujourd'hui, vivre dans un espace rénové avec amour procure une émotion incomparable. Cette aventure nous a prouvé que la passion et la persévérance permettent de redonner vie au patrimoine oublié.",
    connectors: ['il y a deux ans', 'au départ', 'chaque étape', "aujourd'hui", 'cette aventure'],
    usefulPhrases: [
      'Nous avons eu le coup de foudre pour...',
      'Chaque étape franchie représentait une victoire',
      'La passion et la persévérance permettent de...',
    ],
    taskIndex: 2,
  },
]

export const TCF_WRITING_TASK3_PROMPTS: TcfWritingPrompt[] = [
  {
    id: 'ee-t3-01',
    category: 'Débat sociétal',
    title: 'La gratuité des transports en commun',
    prompt:
      'Vous avez lu deux avis contradictoires sur la gratuité des transports collectifs urbains. Rédigez un texte argumenté présentant les deux points de vue, puis exprimez et justifiez votre position personnelle.',
    docA: "Document 1 : Rendre les bus et métros gratuits encourage massivement l'abandon de l'automobile, réduit les émissions de gaz à effet de serre et offre une aide financière précieuse aux classes populaires.",
    docB: "Document 2 : La gratuité prive les réseaux des fonds nécessaires pour entretenir et étendre les lignes. Il vaut mieux investir dans des transports ponctuels, rapides et fiables même s'ils restent payants.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La question de la gratuité des transports collectifs suscite des débats animés. D'un côté, les partisans de cette mesure affirment qu'elle incite fortement les automobilistes à délaisser leur véhicule, ce qui favorise la transition écologique tout en soutenant le pouvoir d'achat des foyers modestes. De l'autre côté, les critiques soutiennent que sans recettes tarifaires, les municipalités manquent cruellement de budget pour moderniser les infrastructures, entretenir le matériel et garantir une fréquence optimale sur les lignes.\n\nEn ce qui me concerne, j'estime que la priorité absolue doit être accordée à la qualité et à la fiabilité du service plutôt qu'à sa gratuité totale. En effet, un réseau gratuit mais bondé, peu ponctuel ou mal desservi ne convaincra jamais les conducteurs réguliers d'abandonner le confort de leur voiture. Une tarification solidaire ciblée pour les étudiants et personnes précaires, combinée à des investissements massifs dans les voies dédiées, constitue selon moi le compromis le plus efficace et durable pour nos métropoles.",
    connectors: ["d'un côté... de l'autre", 'en ce qui me concerne', 'en effet', 'selon moi', 'en conclusion'],
    usefulPhrases: [
      'Les partisans affirment que...',
      'Les critiques soutiennent en revanche que...',
      "J'estime que la priorité absolue doit être...",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-02',
    category: 'Éducation',
    title: "L'interdiction des téléphones portables à l'école",
    prompt:
      "Vous présentez deux opinions divergentes sur l'interdiction totale des cellulaires dans les écoles secondaires, puis exposez votre propre point de vue étayé d'arguments.",
    docA: "Document 1 : L'interdiction complète protège l'attention des élèves, diminue le cyberharcèlement dans les couloirs et favorise les véritables interactions sociales pendant les pauses.",
    docB: "Document 2 : Le téléphone est un outil moderne incontournable. L'école devrait plutôt apprendre aux jeunes à l'utiliser de manière responsable et l'intégrer aux activités pédagogiques.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'usage des téléphones intelligents en milieu scolaire fait l'objet de vifs désaccords. Pour certains observateurs, bannir strictement les écrans permet d'accroître la concentration en classe, de freiner le cyberharcèlement et d'encourager des relations amicales authentiques durant les récréations. En revanche, d'autres intervenants considèrent qu'interdire cet appareil est vain : selon eux, l'école doit éduquer les jeunes aux technologies numériques et exploiter le potentiel pédagogique des outils mobiles.\n\nPour ma part, je partage pleinement l'avis favorable à une interdiction rigoureuse durant les heures de cours et de pause. En effet, la dépendance aux notifications permanentes et la dispersion cognitive nuisent gravement à l'assimilation des connaissances fondamentales chez les adolescents. L'éducation au numérique peut parfaitement s'effectuer sur des tablettes ou ordinateurs fournis par l'établissement avec des accès contrôlés. Préserver l'école comme un sanctuaire d'apprentissage serein et de socialisation réelle me semble indispensable à l'épanouissement des générations futures.",
    connectors: ['pour certains', 'en revanche', 'pour ma part', 'en effet', 'me semble indispensable'],
    usefulPhrases: [
      "Bannir strictement permet d'accroître...",
      "D'autres intervenants considèrent au contraire que...",
      "Je partage pleinement l'avis favorable à...",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-03',
    category: 'Monde du travail',
    title: 'La semaine de travail de 4 jours',
    prompt:
      'Exposez les deux arguments contradictoires sur la réduction du temps de travail à 4 jours par semaine, puis prenez position en illustrant votre avis.',
    docA: "Document 1 : Travailler 4 jours réduit l'épuisement professionnel, améliore l'équilibre personnel et stimule la productivité globale des employés.",
    docB: "Document 2 : Cette formule engendre des journées trop longues et épuisantes, pénalise les services d'accueil au public et augmente les coûts pour les petites entreprises.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "Le passage à la semaine de quatre jours divise le monde du travail. Ses défenseurs mettent en avant une réduction significative du surmenage, un meilleur équilibre entre vie professionnelle et privée, ainsi qu'une efficacité accrue grâce à des employés plus reposés. À l'opposé, les opposants soulignent que condenser les heures sur quatre journées fatigue les équipes et désorganise les services essentiels, tout en imposant un fardeau financier lourd aux PME.\n\nÀ mon sens, l'adoption de la semaine de quatre jours sans baisse de rémunération représente une évolution moderne et bénéfique si elle est modulée selon les secteurs. De multiples expériences internationales ont démontré que des salariés épanouis produisent autant en moins de temps car les réunions inutiles sont écourtées et la motivation est décuplée. Pour les services nécessitant une présence continue, une rotation des plannings d'équipe permet de maintenir la continuité du service sans pénaliser les usagers. C'est une opportunité majeure d'adapter le travail aux réalités contemporaines.",
    connectors: [
      'ses défenseurs mettent en avant',
      "à l'opposé",
      'à mon sens',
      'de multiples expériences ont démontré',
      "c'est une opportunité",
    ],
    usefulPhrases: [
      'Ses défenseurs mettent en avant...',
      "À l'opposé, les opposants soulignent que...",
      'Représente une évolution moderne et bénéfique si...',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-04',
    category: 'Environnement',
    title: 'Interdire les véhicules thermiques au centre-ville',
    prompt:
      "Comparez les deux opinions présentées sur la piétonnisation intégrale et l'interdiction des voitures à essence au centre-ville, puis exprimez votre point de vue argumenté.",
    docA: "Document 1 : Fermer le centre aux voitures polluantes purifie l'air, réduit les nuisances sonores et redynamise les terrasses et commerces piétons.",
    docB: 'Document 2 : Cela pénalise les résidents de banlieue et les personnes à mobilité réduite, tout en compliquant les livraisons et le stationnement en périphérie.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La fermeture des cœurs urbains aux véhicules à essence suscite des réactions contrastées. D'un côté, certains célèbrent une bouffée d'air frais indispensable pour lutter contre la pollution atmosphérique, réduire le bruit assourdissant et redonner l'espace public aux promeneurs et commerces locaux. De l'autre côté, les détracteurs dénoncent une mesure discriminatoire qui exclut les banlieusards mal desservis par les transports en commun et complique les livraisons des commerçants.\n\nQuant à moi, je suis convaincu qu'une restriction progressive des véhicules thermiques au centre-ville est inéluctable et souhaitable pour notre santé publique. Cependant, pour être équitable, cette politique ne doit pas se réduire à une interdiction brutale. Elle doit impérativement s'accompagner de stationnements relais abordables aux portes de la ville, d'une augmentation de la fréquence des autobus électriques et de dérogations adaptées pour les livreurs et personnes handicapées. Réconcilier transition écologique et accessibilité universelle est la seule façon de garantir l'adhésion citoyenne.",
    connectors: ["d'un côté... de l'autre", 'quant à moi', 'cependant', 'impérativement', 'la seule façon de'],
    usefulPhrases: [
      'Suscite des réactions contrastées',
      "Je suis convaincu qu'une restriction est inéluctable",
      "Elle doit impérativement s'accompagner de...",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-05',
    category: 'Technologies',
    title: "L'intelligence artificielle dans l'enseignement",
    prompt:
      "Présentez les deux visions opposées sur l'introduction des outils d'IA générative dans les écoles et universités, puis donnez votre sentiment motivé sur ce sujet.",
    docA: "Document 1 : L'IA offre un tutorat personnalisé à chaque élève, l'aide à progresser à son rythme et prépare les futurs travailleurs au monde de demain.",
    docB: "Document 2 : L'IA encourage la tricherie, atrophie l'esprit critique et la capacité d'écriture, tout en déshumanisant la relation maître-élève.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'arrivée massive de l'intelligence artificielle dans le monde éducatif fait couler beaucoup d'encre. Ses partisans y voient une révolution pédagogique prometteuse, capable d'offrir des explications sur mesure adaptées aux difficultés de chaque apprenant et de développer des compétences technologiques cruciales pour l'avenir. À l'inverse, ses détracteurs craignent une perte dramatique de l'effort intellectuel, une recrudescence du plagiat et un affaiblissement de la relation humaine entre l'enseignant et sa classe.\n\nPersonnellement, je pense que rejeter l'intelligence artificielle serait une erreur d'anachronisme, mais que son encadrement doit être particulièrement vigilant. L'IA devrait être utilisée comme un assistant interactif pour explorer des pistes de réflexion ou corriger des lacunes précises, et non comme un substitut à la pensée critique ou à la rédaction personnelle. Les évaluations en classe sous surveillance doivent être renforcées pour s'assurer que les compétences de base demeurent solidement acquises. Utilisée avec discernement, l'IA peut enrichir l'apprentissage sans jamais remplacer le professeur.",
    connectors: ['ses partisans y voient', "à l'inverse", 'personnellement', 'mais', 'utilisée avec discernement'],
    usefulPhrases: [
      "Fait couler beaucoup d'encre",
      "Rejeter l'IA serait une erreur d'anachronisme",
      'Utilisée avec discernement, elle peut enrichir...',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-06',
    category: 'Commerce',
    title: 'Commerce en ligne contre commerces de proximité',
    prompt:
      "Comparez les arguments sur l'essor du commerce en ligne face aux boutiques de quartier, puis défendez votre position personnelle avec des arguments concrets.",
    docA: "Document 1 : Les achats sur Internet permettent d'économiser du temps et de l'argent, offrent un choix infini et facilitent la vie des familles actives.",
    docB: 'Document 2 : La livraison à domicile multiplie les déchets et les camions polluants, tout en vidant les centres-villes de leurs commerçants traditionnels.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "Le duel entre commerce numérique et boutiques physiques alimente de nombreux débats économiques. D'une part, les adeptes de la vente en ligne soulignent la rapidité de comparaison des prix, l'immense diversité des produits disponibles et le confort de recevoir ses commandes sans quitter son domicile. D'autre part, les défenseurs du commerce local rappellent que ces plateformes géantes provoquent la désertification des centres-villes, détruisent des emplois de proximité et génèrent une pollution importante liée aux livraisons quotidiennes.\n\nPour ma part, je considère que la vitalité de nos quartiers repose sur la préservation de nos commerces de proximité. Même si le commerce en ligne rend service pour certains articles introuvables localement, il ne remplacera jamais le conseil personnalisé, le contact humain et la convivialité d'un marché ou d'une librairie de quartier. Les municipalités doivent soutenir financièrement les commerçants indépendants pour qu'ils modernisent leur offre tout en cultivant ce lien social irremplaçable qui forge l'âme de nos villes.",
    connectors: ["d'une part... d'autre part", 'pour ma part', 'même si', 'cependant', 'tout en cultivant'],
    usefulPhrases: [
      'Alimente de nombreux débats économiques',
      'Pour ma part, je considère que la vitalité repose sur...',
      'Ne remplacera jamais le conseil personnalisé et le contact humain',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-07',
    category: 'Éducation',
    title: 'La suppression des devoirs à la maison au primaire',
    prompt:
      "Examinez les deux points de vue sur l'élimination des devoirs traditionnels pour les élèves du primaire, puis partagez votre point de vue justifié.",
    docA: 'Document 1 : Les devoirs créent des tensions familiales le soir et creusent les inégalités entre les enfants dont les parents peuvent aider et les autres.',
    docB: "Document 2 : Les devoirs renforcent les apprentissages vus en classe, développent l'autonomie et permettent aux parents de suivre la scolarité de leur enfant.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "Faut-il supprimer les devoirs scolaires à l'école primaire ? D'un côté, plusieurs spécialistes affirment que le travail à la maison surcharge inutilement les jeunes enfants après six heures de cours, engendre des conflits familiaux quotidiens et accentue les inégalités sociales selon le niveau d'instruction des parents. De l'autre côté, certains enseignants soutiennent qu'un travail personnel régulier forge le sens des responsabilités et permet aux parents de suivre les progrès académiques de leur progéniture.\n\nSelon moi, la suppression des devoirs écrits à la maison au niveau primaire est une mesure de bon sens qui favorise l'équité. Après une longue journée d'école, les enfants ont un besoin vital de jouer, de bouger et de se reposer pour consolider leur mémoire. L'assimilation des notions et la consolidation des apprentissages devraient s'effectuer en classe ou lors d'études surveillées animées par des pédagogues qualifiés. Encourager simplement la lecture plaisir partagée le soir suffit largement à stimuler l'amour des mots sans stress superflu.",
    connectors: ["d'un côté... de l'autre", 'selon moi', 'après une longue journée', "devraient s'effectuer", 'suffit largement'],
    usefulPhrases: [
      'Faut-il supprimer les devoirs scolaires ?',
      "Selon moi, c'est une mesure de bon sens qui...",
      "L'assimilation devrait s'effectuer en classe",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-08',
    category: 'Société',
    title: 'Le travail dominical des commerces de détail',
    prompt:
      "Présentez les deux avis sur l'autorisation d'ouvrir les magasins le dimanche, puis explicitez votre position personnelle avec des arguments clairs.",
    docA: 'Document 1 : Ouvrir le dimanche permet aux consommateurs pressés de faire leurs achats tranquillement et crée des emplois étudiants rémunérés.',
    docB: 'Document 2 : Le dimanche doit demeurer un jour de repos commun pour préserver la vie familiale, sportive et associative de la collectivité.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'ouverture généralisée des magasins le dimanche continue de diviser l'opinion. D'un côté, les partisans de la dérégulation insistent sur la liberté des citoyens d'organiser leur temps de magasinage comme ils le souhaitent et mettent en avant la création d'emplois flexibles pour les étudiants. D'un autre côté, les opposants affirment que le dimanche doit demeurer un temps d'arrêt partagé, indispensable à la vie familiale, à la participation associative et au repos physique des salariés.\n\nEn ce qui me concerne, je m'oppose fermement à la banalisation du travail dominical dans le commerce de détail ordinaire. Si l'on accepte que chaque jour de la semaine devienne interchangeable sous la pression consumériste, nous détruisons le rythme collectif et isolons davantage les travailleurs précaires contraints d'accepter ces horaires. Seuls les services indispensables à la sécurité, à la santé et aux loisirs culturels devraient faire exception. Préserver un jour synchronisé de trêve hebdomadaire est un pilier fondamental de la cohésion sociale et du bien-être général.",
    connectors: ["d'un côté... d'un autre côté", 'en ce qui me concerne', "si l'on accepte que", 'seuls', 'est un pilier fondamental'],
    usefulPhrases: [
      "Continue de diviser l'opinion",
      "Je m'oppose fermement à la banalisation de...",
      'Préserver un jour de trêve est un pilier fondamental',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-09',
    category: 'Environnement',
    title: 'La réduction de la consommation de viande',
    prompt:
      "Deux avis s'opposent sur l'incitation publique à réduire drastiquement notre consommation de viande. Présentez ces positions puis donnez votre avis personnel.",
    docA: "Document 1 : L'élevage intensif dévaste le climat et les forêts. Adopter une alimentation végétale est le geste individuel le plus efficace pour l'environnement.",
    docB: 'Document 2 : La viande fournit des nutriments essentiels et fait partie intégrante de notre culture culinaire. Il faut privilégier un élevage durable plutôt que le tout-végétal.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La diminution de la consommation de produits carnés fait l'objet d'intenses controverses sociétales. Pour les militants environnementaux, réduire drastiquement la viande est une nécessité écologique urgente pour freiner la déforestation, diminuer les émissions de méthane et préserver les ressources en eau douce. En contrepartie, les éleveurs traditionnels et défenseurs du patrimoine gastronomique rappellent que la viande fournit des protéines et du fer essentiels, tout en soutenant l'économie rurale et les paysages agricoles pâturés.\n\nÀ mon avis, la solution réside dans la modération raisonnée plutôt que dans l'interdiction dogmatique. Adopter une démarche flexitarienne — en réduisant notre consommation de moitié tout en choisissant de la viande locale issue d'élevages respectueux du bien-être animal — permet de concilier impératif climatique et équilibre nutritionnel. En diminuant les portions carnées au profit des légumineuses dans les cantines publiques, nous pouvons amorcer une transition collective sans brusquer les habitudes culturelles. Manger moins de viande, mais de bien meilleure qualité, voilà la voie d'avenir.",
    connectors: ['pour les militants', 'en contrepartie', 'à mon avis', 'plutôt que', 'voilà la voie'],
    usefulPhrases: [
      "Fait l'objet d'intenses controverses",
      'La solution réside dans la modération raisonnée',
      'Permet de concilier impératif climatique et équilibre nutritionnel',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-10',
    category: 'Logement',
    title: 'La régulation des locations touristiques courte durée',
    prompt:
      "Comparez les points de vue sur l'encadrement strict des plateformes type Airbnb dans les grandes villes, puis présentez votre opinion argumentée.",
    docA: "Document 1 : Louer son logement quelques semaines par an permet aux habitants de payer leurs charges et diversifie l'offre touristique.",
    docB: 'Document 2 : La prolifération des logements touristiques crée une pénurie dramatique de baux résidentiels et fait exploser le prix des loyers pour les locaux.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'essor fulgurant des plateformes de location touristique de courte durée soulève de vives inquiétudes dans les centres urbains. D'un côté, certains propriétaires défendent leur droit de disposer librement de leur bien immobilier pour arrondir leurs fins de mois face à l'inflation et dynamiser le tourisme d'accueil. De l'autre côté, les associations de locataires et les municipalités dénoncent la transformation massive de logements permanents en hôtels déguisés, ce qui aggrave la crise du logement et expulse les familles des quartiers populaires.\n\nÀ mes yeux, un encadrement municipal rigoureux de ces plateformes est une urgence absolue. Le droit au logement pour les résidents permanents doit primer sur le profit spéculatif d'investisseurs qui achètent des immeubles entiers pour les rentabiliser à la nuitée. Autoriser uniquement la sous-location de la résidence principale pour une durée maximale de trente jours par an permettrait de préserver l'esprit d'origine du partage sans détruire le tissu résidentiel de nos villes. Le logement est un besoin primaire, pas un produit financier.",
    connectors: ["d'un côté... de l'autre", 'à mes yeux', 'doit primer sur', 'autoriser uniquement', 'en conclusion'],
    usefulPhrases: [
      'Soulève de vives inquiétudes dans les centres urbains',
      'Un encadrement rigoureux est une urgence absolue',
      'Le droit au logement doit primer sur le profit',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-11',
    category: 'Économie',
    title: "La société sans espèces : faut-il éliminer l'argent liquide ?",
    prompt:
      'Vous présentez deux points de vue sur la fin programmée des pièces et billets de banque, puis vous formulez votre avis personnel.',
    docA: 'Document 1 : Les paiements électroniques sont rapides, sécurisés, réduisent la fraude fiscale et limitent les risques de vols physiques.',
    docB: "Document 2 : Supprimer le liquide menace la vie privée, expose aux pannes informatiques et exclut les personnes âgées ou démunies qui n'ont pas accès aux banques.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La disparition progressive de l'argent liquide au profit des transactions numériques suscite des avis partagés. D'un côté, les partisans d'une société sans espèces mettent en avant la commodité des paiements sans contact, la réduction substantielle des coûts de gestion des billets et une lutte plus efficace contre le travail au noir et le blanchiment d'argent. D'un autre côté, les réfractaires soulignent les risques majeurs pour la confidentialité des données personnelles, la vulnérabilité en cas de cyberattaque et l'exclusion des personnes âgées ou marginalisées qui dépendent du comptant.\n\nPersonnellement, je crois fermement que le maintien de l'argent physique est une condition indispensable de notre liberté individuelle. Le paiement en espèces garantit l'anonymat des actes de la vie courante et protège les citoyens d'une surveillance financière totale de la part des banques et des géants technologiques. De surcroît, le liquide reste le seul moyen d'échange fiable lors d'une panne d'électricité ou de réseau. La technologie doit offrir des options supplémentaires, jamais imposer l'éradication des outils d'autonomie traditionnels.",
    connectors: ["d'un côté... d'un autre côté", 'personnellement', 'de surcroît', 'cependant', 'en conclusion'],
    usefulPhrases: [
      'Suscite des avis partagés',
      'Je crois fermement que le maintien est une condition indispensable',
      "La technologie doit offrir des options, pas imposer l'éradication",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-12',
    category: 'Mobilité',
    title: 'Remplacer les places de stationnement par des pistes cyclables',
    prompt:
      'Analysez les deux visions sur la suppression des stationnements automobiles au profit du réseau cyclable, puis justifiez votre position.',
    docA: "Document 1 : Réduire le stationnement décourage l'usage de l'auto, sécurise les cyclistes et permet de verdir les boulevards urbains.",
    docB: 'Document 2 : Cela pénalise les clients des petits commerces, complique la vie des personnes âgées et reporte le trafic dans les rues résidentielles voisines.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "Le réaménagement de l'espace urbain au détriment des places de stationnement fait l'objet de vifs débats municipaux. D'une part, les urbanistes et associations cyclistes affirment que transformer l'asphalte en pistes protégées et en bandes végétalisées stimule les déplacements doux, assainit l'air et réduit drastiquement les accidents mortels. D'autre part, plusieurs commerçants et riverains craignent une baisse de fréquentation de leurs boutiques et déplorent les difficultés accrues pour stationner à proximité de leur domicile.\n\nÀ mon avis, le rééquilibrage de l'espace public en faveur du vélo est une décision salutaire et indispensable pour l'avenir de nos villes. Les études démontrent que les clients à vélo ou à pied fréquentent les magasins plus souvent que les automobilistes de passage. Pour rassurer les commerces locaux, la suppression des cases de stationnement de surface doit s'accompagner d'espaces de livraison bien identifiés et d'un accès facilité aux garages souterrains périphériques. Donner la priorité aux mobilités actives transforme durablement nos rues en lieux de vie agréables.",
    connectors: ["d'une part... d'autre part", 'à mon avis', 'les études démontrent que', 'pour rassurer', 'en conclusion'],
    usefulPhrases: [
      "Fait l'objet de vifs débats municipaux",
      "C'est une décision salutaire et indispensable pour...",
      'Donner la priorité aux mobilités actives transforme nos rues',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-13',
    category: 'Éducation',
    title: 'Les uniformes obligatoires dans les écoles publiques',
    prompt:
      "Présentez les deux points de vue sur l'instauration d'un code vestimentaire uniforme dans les établissements publics, puis donnez votre avis personnel.",
    docA: "Document 1 : L'uniforme gomme les disparités sociales et les marques coûteuses, renforce le sentiment d'appartenance et simplifie les matins des familles.",
    docB: "Document 2 : L'uniforme brime l'expression individuelle des jeunes, ne règle pas le harcèlement en profondeur et représente un coût d'achat élevé.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'obligation de porter un uniforme à l'école publique demeure un sujet hautement controversé. Pour ses partisans, instaurer une tenue identique atténue la compétition néfaste autour des marques de vêtements, estompe visuellement les écarts de richesse entre élèves et développe un fort sentiment de fierté et de cohésion collective. À l'opposé, les détracteurs soutiennent que l'uniforme restreint la liberté d'expression des jeunes, n'éradique pas les véritables causes du harcèlement et impose des dépenses substantielles aux foyers modestes.\n\nSelon moi, imposer une tenue uniforme est une fausse solution qui s'attaque aux apparences sans traiter le fond des problèmes scolaires. L'apprentissage de la tolérance et du respect des différences passe par la confrontation à la diversité réelle, et non par une standardisation artificielle des corps. De plus, les conflits entre élèves se déplacent rapidement vers d'autres accessoires comme les téléphones ou les chaussures de sport. L'école doit plutôt investir son énergie dans l'éducation morale, l'accompagnement psychologique et le dialogue bienveillant plutôt que dans la police vestimentaire.",
    connectors: ['demeure un sujet controversé', "à l'opposé", 'selon moi', 'de plus', 'plutôt que'],
    usefulPhrases: [
      'Demeure un sujet hautement controversé',
      "C'est une fausse solution qui s'attaque aux apparences",
      "L'école doit plutôt investir son énergie dans...",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-14',
    category: 'Emploi et jeunesse',
    title: "La rémunération obligatoire de tous les stages d'études",
    prompt: "Comparez les avis sur l'obligation légale de rémunérer tous les stages étudiants, puis exposez votre point de vue argumenté.",
    docA: "Document 1 : Tout travail mérite salaire. Rémunérer les stagiaires empêche l'exploitation d'une main-d'œuvre gratuite et favorise les étudiants moins aisés.",
    docB: "Document 2 : Imposer une paie pour de courts stages d'observation risque de freiner les petites entreprises et les OBNL qui n'ont pas les moyens d'embaucher.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La rémunération systématique des stages d'études fait l'objet d'intenses négociations entre syndicats étudiants et employeurs. Les défenseurs de la rémunération obligatoire soutiennent que toute contribution productive au sein d'une organisation mérite un salaire équitable. Selon eux, le bénévolat forcé perpétue la précarité étudiante et privilégie ceux dont la famille peut assumer les frais de subsistance. À l'inverse, certains représentants du secteur associatif et de petites entreprises affirment que cette contrainte financière les obligerait à renoncer totalement à l'accueil de stagiaires en formation.\n\nPour ma part, je considère que tout stage où l'étudiant accomplit des tâches réelles doit être obligatoirement rémunéré au moins au salaire minimum. Considérer les jeunes en formation comme une source d'aide gratuite est une injustice sociale qui dévalorise le travail intellectuel. L'État pourrait compenser cette charge pour les organismes communautaires et petites entreprises par des crédits d'impôt ciblés. Offrir une compensation financière digne est une marque de respect élémentaire envers l'avenir de notre jeunesse.",
    connectors: ["fait l'objet de négociations", 'selon eux', "à l'inverse", 'pour ma part', 'en conclusion'],
    usefulPhrases: [
      'Toute contribution productive mérite salaire',
      "C'est une injustice sociale qui dévalorise le travail",
      'Offrir une compensation financière digne est un respect élémentaire',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-15',
    category: 'Société et climat',
    title: 'Faut-il instaurer un quota annuel de vols en avion ?',
    prompt:
      "Examinez les deux points de vue sur la proposition d'imposer un nombre maximal de billets d'avion par personne pour lutter contre le réchauffement climatique, puis prenez position.",
    docA: "Document 1 : L'aviation produit d'énormes quantités de CO2. Un quota annuel est une mesure d'urgence indispensable et égalitaire face à la crise planétaire.",
    docB: 'Document 2 : Cela entrave gravement la liberté de circulation, pénalise les expatriés qui visitent leur famille et nuit aux économies insulaires dépendantes du tourisme.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'idée de limiter le nombre de vols aériens par citoyen soulève des débats passionnés. D'un côté, les écologistes convaincus soulignent que le transport aérien est un privilège extrêmement polluant réservé à une minorité mondiale, et qu'un quota universel constitue la solution la plus juste pour contraindre chacun à réduire son empreinte carbone. D'un autre côté, les adversaires d'une telle mesure dénoncent une atteinte inadmissible à la liberté de voyager et soulignent le préjudice immense pour les familles d'immigrants éloignées de leur pays d'origine.\n\nÀ mon sens, bien que l'urgence climatique soit indéniable, un quota strict et punitif serait politiquement inapplicable et injuste pour les personnes ayant des attaches transnationales. Il me semble plus équitable de supprimer les subventions au kérosène, de taxer lourdement les vols d'affaires en jets privés et d'interdire les trajets courts lorsqu'une liaison ferroviaire directe de moins de quatre heures existe. Nous devons développer des alternatives ferroviaires rapides et accessibles plutôt que d'enfermer les citoyens dans des restrictions arbitraires.",
    connectors: ["d'un côté... d'un autre côté", 'à mon sens', 'bien que', 'il me semble plus équitable de', 'plutôt que de'],
    usefulPhrases: [
      'Soulève des débats passionnés',
      "Bien que l'urgence soit indéniable, un quota serait...",
      "Nous devons développer des alternatives plutôt que d'enfermer",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-16',
    category: 'Santé publique',
    title: 'La taxe sur les boissons et aliments ultra-transformés',
    prompt:
      'Comparez les deux avis sur la taxation spéciale des produits riches en sucre et additifs, puis exprimez votre opinion personnelle.',
    docA: 'Document 1 : Taxer la malbouffe incite les industriels à revoir leurs recettes, diminue le diabète et finance les soins de santé publics.',
    docB: "Document 2 : Ces taxes frappent injustement le pouvoir d'achat des classes populaires sans garantir un réel changement durable des habitudes alimentaires.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'instauration d'une taxe punitive sur la malbouffe et les boissons sucrées polarise l'opinion publique. D'une part, les professionnels de la santé publique rappellent que les maladies chroniques liées à la mauvaise alimentation pèsent lourdement sur les finances des hôpitaux, et qu'une surtaxe incite les industriels à réduire le sel, le sucre et le gras. D'autre part, les associations de consommateurs objectent que cette mesure est régressive et grève le budget alimentaire des foyers les plus démunis sans les éduquer à la nutrition.\n\nPersonnellement, je pense qu'une taxe seule est insuffisante et injuste si elle ne s'accompagne pas d'incitations positives. Les recettes récoltées par cette fiscalité nutritionnelle devraient être intégralement réinvesties pour subventionner les fruits, légumes et céréales biologiques dans les quartiers défavorisés. De surcroît, interdire la publicité ciblant les enfants et renforcer les ateliers de cuisine à l'école primaire me semblent des leviers infiniment plus porteurs pour transformer durablement la santé de la population.",
    connectors: ["d'une part... d'autre part", 'personnellement', "si elle ne s'accompagne pas de", 'de surcroît', 'en conclusion'],
    usefulPhrases: [
      "Polarise l'opinion publique",
      'Une taxe seule est insuffisante si...',
      'Me semblent des leviers infiniment plus porteurs pour...',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-17',
    category: 'Technologie et démocratie',
    title: 'Le vote électronique aux élections',
    prompt:
      "Examinez les deux points de vue sur l'introduction du vote en ligne aux élections citoyennes, puis explicitez votre point de vue.",
    docA: "Document 1 : Le vote sur Internet permet de lutter contre l'abstention des jeunes et facilite la participation des personnes vivant à l'étranger.",
    docB: "Document 2 : Le vote électronique ne garantit pas le secret du scrutin, ouvre la porte aux cyberattaques et supprime le rituel démocratique de l'isoloir.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "L'opportunité d'introduire le vote par Internet lors des scrutins électoraux fait l'objet de vives discussions. Pour ses promoteurs, la numérisation du vote constitue une solution moderne pour enrayer la chute de la participation civique, séduire les jeunes générations et permettre aux citoyens expatriés de voter sans parcourir des centaines de kilomètres. Cependant, les experts en cybersécurité alertent sur l'impossibilité de garantir simultanément la transparence du dépouillement, l'inviolabilité des serveurs face aux piratages et la liberté du vote hors d'un isoloir physique.\n\nPour ma part, je reste fermement opposé au vote électronique généralisé pour les élections politiques majeures. La confiance populaire dans les résultats électoraux est le pilier intangible de toute démocratie saine. Le bulletin papier déposé dans une urne transparente en présence de scrutateurs citoyens offre une sécurité vérifiable par n'importe qui, sans dépendre d'algorithmes opaques. Le geste citoyen de se déplacer au bureau de vote renforce le sentiment de communauté politique partagée.",
    connectors: ["fait l'objet de vives discussions", 'cependant', 'pour ma part', 'le pilier intangible', 'en conclusion'],
    usefulPhrases: [
      'Pour ses promoteurs, cela constitue une solution pour...',
      "Les experts alertent cependant sur l'impossibilité de...",
      'La confiance populaire est le pilier intangible de toute démocratie',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-18',
    category: 'Environnement urbain',
    title: "L'interdiction de la publicité commerciale dans l'espace public",
    prompt: 'Comparez les avis sur la suppression totale des panneaux publicitaires dans les rues et métros, puis partagez votre position.',
    docA: "Document 1 : Éliminer la publicité réduit la pollution visuelle, libère l'esprit des sollicitations d'achats compulsifs et valorise l'architecture urbaine.",
    docB: 'Document 2 : La publicité rapporte des millions de dollars aux villes pour financer le mobilier urbain et soutient les entreprises locales.',
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La présence massive des affiches publicitaires et des écrans vidéo lumineux dans l'espace urbain suscite la controverse. D'un côté, les partisans de villes apaisées plaident pour l'éradication des réclames commerciales, faisant valoir qu'elles agressent visuellement les passants, incitent à une surconsommation néfaste pour le climat et dénaturent le patrimoine architectural. De l'autre côté, les partisans du maintien soulignent que les contrats d'affichage procurent des recettes substantielles aux municipalités pour financer les abribus, les vélos en libre-service et les transports en commun.\n\nÀ mon sens, interdire au moins les panneaux publicitaires numériques et surdimensionnés dans nos rues est une nécessité urgente. L'espace public appartient à tous et ne devrait pas être privatisé au profit d'intérêts marchands agressifs. Les municipalités peuvent diversifier leurs sources de revenus sans transformer leurs avenues en panneaux géants. Libérer les regards de la pression commerciale redonne de la beauté et de la sérénité à notre environnement quotidien.",
    connectors: ['suscite la controverse', "d'un côté... de l'autre", 'à mon sens', 'ne devrait pas être', 'en conclusion'],
    usefulPhrases: [
      'Suscite la controverse',
      "À mon sens, c'est une nécessité urgente",
      "L'espace public appartient à tous et ne devrait pas être privatisé",
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-19',
    category: 'Tourisme et culture',
    title: "Faut-il limiter l'accès aux sites touristiques célèbres ?",
    prompt:
      'Présentez les deux visions opposées sur la mise en place de quotas stricts de visiteurs dans les musées, parcs nationaux ou monuments historiques, puis justifiez votre avis.',
    docA: "Document 1 : Fixer des jauges quotidiennes protège les chefs-d'œuvre de la dégradation et offre une expérience de visite sereine et contemplative.",
    docB: "Document 2 : Limiter l'accès privatise la culture au profit de ceux qui réservent des mois à l'avance et pénalise les voyageurs spontanés et les habitants.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "Le phénomène du surtourisme pousse de plus en plus d'institutions à instaurer des quotas journaliers de visiteurs. Les défenseurs de cette régulation soutiennent que limiter la foule est le seul moyen efficace de sauvegarder des monuments fragiles, d'éviter l'érosion des écosystèmes naturels et d'offrir une visite de qualité respectueuse des lieux. En revanche, les détracteurs craignent une marchandisation élitiste de la culture qui empêche les visites spontanées et réserve l'accès à ceux qui ont le temps et les moyens de réserver des mois à l'avance.\n\nÀ mon avis, l'instauration de réservations obligatoires et de jauges maximales est devenue inévitable face à la saturation des sites prestigieux. Cependant, cette politique doit rester démocratique en sanctuarisant des plages horaires gratuites réservées aux habitants locaux et aux publics scolaires sans réservation préalable complexe. La beauté du monde ne peut survivre que si nous acceptons de discipliner nos flux pour ne pas détruire les trésors que nous venons admirer.",
    connectors: ['pousse à instaurer', 'en revanche', 'à mon avis', 'cependant', 'ne peut survivre que si'],
    usefulPhrases: [
      "Le surtourisme pousse de plus en plus d'institutions à...",
      "L'instauration de jauges est devenue inévitable",
      'Nous devons discipliner nos flux pour ne pas détruire les trésors',
    ],
    taskIndex: 3,
  },
  {
    id: 'ee-t3-20',
    category: 'Gouvernance et travail',
    title: "L'obligation de retour au bureau en entreprise",
    prompt:
      "Comparez les arguments sur l'obligation imposée par certains employeurs de revenir travailler au bureau à temps plein ou quasi-plein, puis défendez votre point de vue.",
    docA: "Document 1 : La présence physique renforce la cohésion d'équipe, stimule la créativité spontanée et facilite l'intégration des nouveaux arrivants.",
    docB: "Document 2 : Obliger le retour au bureau ignore les gains prouvés d'autonomie et de productivité, et pousse les employés qualifiés vers la démission.",
    minWords: 120,
    maxWords: 180,
    sampleAnswer:
      "La décision de plusieurs grandes entreprises d'imposer un retour obligatoire au bureau suscite une forte résistance chez les employés. D'un côté, les dirigeants d'entreprise affirment que la présence physique dans les locaux est essentielle pour forger une culture d'entreprise solide, accélérer l'innovation informelle près de la machine à café et former efficacement les jeunes recrues. De l'autre côté, les salariés dénoncent une perte de confiance injustifiée et refusent de gaspiller à nouveau des heures dans les embouteillages au détriment de leur bien-être familial.\n\nEn ce qui me concerne, je crois que le retour forcé et rigide au bureau est une régression managériale vouée à l'échec. Un modèle hybride équilibré — prévoyant deux jours de présence commune pour les réunions de concertation et trois jours de télétravail axés sur la production individuelle — représente la solution idéale. La loyauté et la performance des employés ne s'obtiennent pas par la surveillance physique, mais par la confiance mutuelle et le respect de leur autonomie.",
    connectors: [
      'suscite une forte résistance',
      "d'un côté... de l'autre",
      'en ce qui me concerne',
      'représente la solution idéale',
      'en conclusion',
    ],
    usefulPhrases: [
      'Suscite une forte résistance chez les salariés',
      "Le retour forcé est une régression vouée à l'échec",
      "La performance s'obtient par la confiance mutuelle",
    ],
    taskIndex: 3,
  },
]

export const TCF_WRITING_PROMPTS_BY_TASK: Record<1 | 2 | 3, TcfWritingPrompt[]> = {
  1: TCF_WRITING_TASK1_PROMPTS,
  2: TCF_WRITING_TASK2_PROMPTS,
  3: TCF_WRITING_TASK3_PROMPTS,
}

export const ALL_TCF_WRITING_PROMPTS: TcfWritingPrompt[] = [
  ...TCF_WRITING_TASK1_PROMPTS,
  ...TCF_WRITING_TASK2_PROMPTS,
  ...TCF_WRITING_TASK3_PROMPTS,
]
