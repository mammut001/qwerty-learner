import {
  type TcfEeScores,
  type TcfEoScores,
  calculateEeTotalScore,
  calculateEoTotalScore,
  countFrenchWords,
  estimateTcfEeNclc,
  estimateTcfEoNclc,
} from './tcfEvaluation'
import { TCF_LISTENING_SET_B, TCF_READING_SET_B } from './tcfMockSetB'

export {
  calculateEeTotalScore,
  calculateEoTotalScore,
  countFrenchWords,
  estimateTcfEeNclc,
  estimateTcfEoNclc,
  type TcfEeScores,
  type TcfEoScores,
}

export type TcfSkill = 'listening' | 'reading' | 'writing' | 'speaking'

export type TcfQuestion = {
  id: string
  type: string
  prompt: string
  choices: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  explanation: string
  audioText?: string
  passage?: string
}

export const TCF_CONFIG: Record<
  TcfSkill,
  {
    label: string
    shortLabel: string
    minutes: number
    targetScore: number
    maxScore: number
    route: string
  }
> = {
  listening: {
    label: 'TCF Canada 听力 CO',
    shortLabel: '听力 CO',
    minutes: 35,
    targetScore: 458,
    maxScore: 699,
    route: '/tcf-listening',
  },
  reading: {
    label: 'TCF Canada 阅读 CE',
    shortLabel: '阅读 CE',
    minutes: 60,
    targetScore: 453,
    maxScore: 699,
    route: '/tcf-reading',
  },
  writing: {
    label: 'TCF Canada 写作 EE',
    shortLabel: '写作 EE',
    minutes: 60,
    targetScore: 10,
    maxScore: 20,
    route: '/tcf-writing',
  },
  speaking: {
    label: 'TCF Canada 口语 EO',
    shortLabel: '口语 EO',
    minutes: 12,
    targetScore: 10,
    maxScore: 20,
    route: '/tcf-speaking',
  },
}

export function estimateTcfScaledScore(correct: number, total = 39) {
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) return 0
  return Math.max(0, Math.min(699, Math.round((Math.max(0, Math.min(total, correct)) / total) * 699)))
}

export function estimateTcfNclc(skill: TcfSkill, score: number) {
  if (skill === 'writing') return estimateTcfEeNclc(score)
  if (skill === 'speaking') return estimateTcfEoNclc(score)
  const value = Math.max(0, Math.min(699, Math.round(score)))
  if (value >= 549) return 10
  if (skill === 'listening') {
    if (value >= 523) return 9
    if (value >= 503) return 8
    if (value >= 458) return 7
    if (value >= 398) return 6
    if (value >= 369) return 5
    if (value >= 331) return 4
    return 0
  }
  if (value >= 524) return 9
  if (value >= 499) return 8
  if (value >= 453) return 7
  if (value >= 406) return 6
  if (value >= 375) return 5
  if (value >= 342) return 4
  return 0
}

const listening = (
  id: number,
  type: string,
  audioText: string,
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): TcfQuestion => ({
  id: `co-${String(id).padStart(2, '0')}`,
  type,
  audioText,
  prompt,
  choices,
  answer,
  explanation,
})

export const TCF_LISTENING_QUESTIONS: TcfQuestion[] = [
  listening(
    1,
    'dialogue',
    '— Bonjour, je voudrais deux billets pour le film de vingt heures. — Il ne reste que des places au premier rang.',
    "Que veut faire l'homme ?",
    ['Réserver un restaurant', 'Acheter des billets de cinéma', 'Changer de siège dans un train', 'Voir un médecin'],
    1,
    'Il demande explicitement deux billets pour le film de vingt heures.',
  ),
  listening(
    2,
    'announcement',
    'Attention, le train à destination de Montréal partira exceptionnellement de la voie douze au lieu de la voie huit.',
    'Quelle information change ?',
    ['L’heure de départ', 'La destination', 'Le quai de départ', 'Le prix du billet'],
    2,
    "L'annonce précise que seule la voie de départ change.",
  ),
  listening(
    3,
    'voicemail',
    "Salut Nadia, je serai en retard d'une vingtaine de minutes. Commence la réunion sans moi et envoie-moi les notes après.",
    'Que demande la personne ?',
    ['Annuler la réunion', 'Reporter la réunion', 'Commencer sans elle', 'Changer de salle'],
    2,
    'Elle dit clairement de commencer la réunion sans elle.',
  ),
  listening(
    4,
    'dialogue',
    '— Tu prends encore ta voiture pour aller au travail ? — Non, depuis que le stationnement a augmenté, je prends le bus.',
    'Pourquoi la personne prend-elle le bus ?',
    ['Le bus est plus rapide', 'Sa voiture est en panne', 'Le stationnement coûte plus cher', 'Elle habite plus loin'],
    2,
    'La hausse du prix du stationnement explique le changement.',
  ),
  listening(
    5,
    'practical',
    'La bibliothèque fermera exceptionnellement à dix-sept heures vendredi en raison de travaux électriques.',
    'Pourquoi la bibliothèque ferme-t-elle plus tôt ?',
    ['Pour une fête', 'Pour des travaux', 'Pour un congé', 'Pour une réunion'],
    1,
    'La fermeture anticipée est due à des travaux électriques.',
  ),
  listening(
    6,
    'dialogue',
    '— Vous avez une table pour trois ce soir ? — Oui, mais seulement à dix-neuf heures trente.',
    'À quelle heure peuvent-ils venir ?',
    ['18 h 30', '19 h', '19 h 30', '20 h 30'],
    2,
    'La seule disponibilité annoncée est 19 h 30.',
  ),
  listening(
    7,
    'news',
    "La ville ouvre aujourd'hui une nouvelle piste cyclable reliant le centre-ville au campus universitaire.",
    'Quel est le sujet principal ?',
    ['Une nouvelle ligne d’autobus', 'Une piste cyclable', 'Un nouveau campus', 'Une fermeture de route'],
    1,
    "Le message annonce l'ouverture d'une piste cyclable.",
  ),
  listening(
    8,
    'dialogue',
    "— Est-ce que je peux rendre ce pull ? — Bien sûr, avec le reçu, dans les trente jours suivant l'achat.",
    'Quelle condition est mentionnée ?',
    ['Avoir la boîte', 'Avoir le reçu', 'Payer des frais', 'Revenir le jour même'],
    1,
    'Le reçu est explicitement exigé.',
  ),
  listening(
    9,
    'voicemail',
    'Bonjour, ici la clinique. Votre rendez-vous de lundi est déplacé à mardi matin à neuf heures.',
    "Qu'est-ce qui a changé ?",
    ['Le médecin', 'Le lieu', 'Le jour du rendez-vous', 'Le type de consultation'],
    2,
    'Le rendez-vous passe de lundi à mardi.',
  ),
  listening(
    10,
    'dialogue',
    "— On mange dehors ? — J'aimerais bien, mais la météo annonce de fortes pluies. Restons à l'intérieur.",
    'Que décident-ils ?',
    ['Faire un pique-nique', 'Rester à l’intérieur', 'Reporter au lendemain', 'Commander à emporter'],
    1,
    "À cause de la pluie, ils décident de rester à l'intérieur.",
  ),
  listening(
    11,
    'announcement',
    'Les passagers du vol AC quatre cent douze sont priés de se présenter immédiatement à la porte vingt-six.',
    'Qui doit se présenter à la porte 26 ?',
    ['Tous les voyageurs', 'Les passagers du vol AC 412', 'Le personnel de bord', 'Les passagers en correspondance'],
    1,
    "L'annonce vise uniquement les passagers du vol AC 412.",
  ),
  listening(
    12,
    'dialogue',
    '— Tu as fini le rapport ? — Presque. Il me reste à vérifier les chiffres du dernier trimestre.',
    'Que reste-t-il à faire ?',
    ['Écrire l’introduction', 'Vérifier des chiffres', 'Envoyer le rapport', 'Ajouter des photos'],
    1,
    'La personne doit encore vérifier les chiffres.',
  ),
  listening(
    13,
    'practical',
    "Pour renouveler votre carte, remplissez le formulaire en ligne puis présentez une pièce d'identité au comptoir.",
    'Quelle est la première étape ?',
    ['Payer au comptoir', 'Téléphoner', 'Remplir le formulaire en ligne', 'Envoyer une photo'],
    2,
    "Le formulaire en ligne vient avant la présentation de la pièce d'identité.",
  ),
  listening(
    14,
    'dialogue',
    "— Pourquoi tu n'es pas venu hier ? — J'avais prévu de venir, mais mon fils avait de la fièvre.",
    'Pourquoi la personne est-elle absente ?',
    ['Elle travaillait', 'Son fils était malade', 'Elle avait oublié', 'Elle était en voyage'],
    1,
    'Elle explique que son fils avait de la fièvre.',
  ),
  listening(
    15,
    'news',
    'Après plusieurs mois de travaux, le marché public rouvrira samedi avec une trentaine de commerçants.',
    'Quand le marché rouvrira-t-il ?',
    ['Vendredi', 'Samedi', 'Dimanche', 'Le mois prochain'],
    1,
    'La réouverture est annoncée pour samedi.',
  ),
  listening(
    16,
    'dialogue',
    '— Je pensais acheter ce téléphone, mais il est un peu cher. — Attends vendredi, il sera en promotion.',
    'Que conseille-t-on ?',
    ['Acheter maintenant', 'Changer de modèle', 'Attendre une promotion', 'Acheter d’occasion'],
    2,
    "Le conseil est d'attendre vendredi pour profiter d'une promotion.",
  ),
  listening(
    17,
    'announcement',
    "En raison d'un accident, la ligne deux du métro est interrompue entre Berri et Mont-Royal.",
    'Quel problème est annoncé ?',
    ['Une grève', 'Une panne d’ascenseur', 'Une interruption de métro', 'Une fermeture de stationnement'],
    2,
    'La ligne 2 est interrompue sur un tronçon.',
  ),
  listening(
    18,
    'dialogue',
    '— Vous préférez travailler à distance ou au bureau ? — Deux jours au bureau me suffisent; le reste du temps, je suis plus efficace chez moi.',
    'Quelle préférence exprime la personne ?',
    ['Toujours au bureau', 'Toujours à distance', 'Un mode hybride avec surtout du télétravail', 'Changer d’emploi'],
    2,
    'Elle souhaite deux jours au bureau et le reste à domicile.',
  ),
  listening(
    19,
    'voicemail',
    "Bonjour Marc, le colis est arrivé. Je l'ai laissé chez votre voisine du troisième étage, comme convenu.",
    'Où se trouve le colis ?',
    ['À la poste', 'Devant la porte', 'Chez une voisine', 'Dans le garage'],
    2,
    'Le colis a été remis à la voisine du troisième étage.',
  ),
  listening(
    20,
    'dialogue',
    '— Le cours commence à huit heures ? — Non, le professeur a écrit ce matin : exceptionnellement à neuf heures.',
    'À quelle heure commence le cours ?',
    ['8 h', '8 h 30', '9 h', '10 h'],
    2,
    'Le professeur a déplacé le début du cours à 9 h.',
  ),
  listening(
    21,
    'opinion',
    'À mon avis, interdire complètement les voitures au centre-ville serait excessif. Il faudrait plutôt améliorer le transport collectif.',
    'Quelle solution la personne préfère-t-elle ?',
    [
      'Interdire toutes les voitures',
      'Construire plus de stationnements',
      'Améliorer le transport collectif',
      'Réduire les pistes cyclables',
    ],
    2,
    "Elle rejette l'interdiction totale et préfère améliorer le transport collectif.",
  ),
  listening(
    22,
    'news',
    'Une étude locale montre que les employés qui peuvent choisir leurs horaires déclarent moins de stress, sans baisse de productivité.',
    'Quel résultat est présenté ?',
    ['La productivité baisse', 'Le stress augmente', 'Les horaires flexibles réduisent le stress', 'Les employés travaillent moins'],
    2,
    "L'étude associe la flexibilité à moins de stress, sans perte de productivité.",
  ),
  listening(
    23,
    'dialogue',
    "— Pourquoi as-tu choisi ce quartier ? — Il est un peu loin du centre, mais l'école des enfants est excellente et tout se fait à pied.",
    'Quel avantage est mis en avant ?',
    [
      'La proximité du centre',
      'La qualité de l’école et les services à pied',
      'Le faible niveau de bruit uniquement',
      'Le prix des voitures',
    ],
    1,
    "La personne insiste sur l'école et la possibilité de tout faire à pied.",
  ),
  listening(
    24,
    'announcement',
    "Les inscriptions au programme d'été se terminent le quinze mai. Après cette date, aucune demande tardive ne sera acceptée.",
    'Que faut-il retenir ?',
    [
      'Le programme commence le 15 mai',
      'Il faut s’inscrire avant le 15 mai',
      'Les inscriptions sont gratuites',
      'Les demandes tardives sont prioritaires',
    ],
    1,
    "Le 15 mai est la date limite d'inscription.",
  ),
  listening(
    25,
    'opinion',
    "Je comprends l'intérêt des achats en ligne, mais pour les produits frais je préfère voir et choisir moi-même ce que j'achète.",
    'Pour quoi la personne préfère-t-elle aller en magasin ?',
    ['Les livres', 'Les vêtements', 'Les produits frais', 'Les billets de voyage'],
    2,
    'Elle réserve sa préférence en magasin aux produits frais.',
  ),
  listening(
    26,
    'news',
    "La municipalité testera pendant six mois un service d'autobus de nuit afin d'évaluer la demande avant de le rendre permanent.",
    'Pourquoi le service est-il testé ?',
    ['Pour réduire les tarifs', 'Pour mesurer la demande', 'Pour remplacer le métro', 'Pour fermer les routes'],
    1,
    "La période d'essai sert à évaluer la demande.",
  ),
  listening(
    27,
    'dialogue',
    "— Tu sembles fatigué. — J'ai accepté trop de projets en même temps. Je vais devoir apprendre à dire non.",
    'Quel problème reconnaît la personne ?',
    ['Elle manque de projets', 'Elle a trop d’engagements', 'Elle veut changer de métier', 'Elle ne dort jamais le week-end'],
    1,
    'Elle a accepté trop de projets simultanément.',
  ),
  listening(
    28,
    'opinion',
    "Le télétravail facilite la concentration, mais il peut aussi isoler. Pour moi, une journée d'équipe régulière est indispensable.",
    'Quelle idée est défendue ?',
    [
      'Supprimer le télétravail',
      'Travailler seul en permanence',
      'Combiner télétravail et rencontres d’équipe',
      'Réduire les réunions à zéro',
    ],
    2,
    "La personne défend un équilibre avec une rencontre d'équipe régulière.",
  ),
  listening(
    29,
    'news',
    'Le nouveau règlement obligera les propriétaires à fournir un bac de recyclage dans chaque immeuble de plus de six logements.',
    'Qui est concerné directement ?',
    ['Les touristes', 'Les propriétaires de certains immeubles', 'Les étudiants seulement', 'Les commerces alimentaires uniquement'],
    1,
    "L'obligation vise les propriétaires d'immeubles de plus de six logements.",
  ),
  listening(
    30,
    'dialogue',
    "— J'ai reçu deux offres d'emploi. La première paie mieux, mais la seconde offre davantage de formation. — Et qu'est-ce qui compte le plus pour toi maintenant ?",
    'Quel choix doit faire la personne ?',
    ['Entre deux logements', 'Entre deux offres d’emploi', 'Entre deux universités', 'Entre deux assurances'],
    1,
    "La conversation porte sur deux offres d'emploi.",
  ),
  listening(
    31,
    'opinion',
    "On parle beaucoup de vitesse, mais un bon service public doit d'abord être fiable. Je préfère un bus ponctuel à un bus théoriquement plus rapide.",
    'Quelle qualité est prioritaire ?',
    ['La vitesse maximale', 'La fiabilité', 'Le confort des sièges', 'Le nombre de lignes'],
    1,
    'La personne place la fiabilité avant la vitesse.',
  ),
  listening(
    32,
    'news',
    "Les chercheurs ont observé que de courtes pauses régulières améliorent l'attention lors de tâches répétitives de longue durée.",
    'Quel effet des pauses est mentionné ?',
    [
      'Elles diminuent l’attention',
      'Elles améliorent l’attention',
      'Elles augmentent le temps de transport',
      'Elles remplacent le sommeil',
    ],
    1,
    "L'étude associe les pauses régulières à une meilleure attention.",
  ),
  listening(
    33,
    'opinion',
    "Je ne suis pas contre les écrans à l'école, mais ils doivent servir un objectif pédagogique précis, pas simplement remplacer le papier.",
    'Quelle position est exprimée ?',
    ['Refus total des écrans', 'Usage des écrans avec un objectif pédagogique', 'Suppression des livres', 'Usage libre sans règle'],
    1,
    "La personne accepte les écrans s'ils ont une finalité pédagogique claire.",
  ),
  listening(
    34,
    'dialogue',
    "— Le propriétaire veut augmenter le loyer de dix pour cent. — Tu devrais vérifier les règles provinciales avant d'accepter quoi que ce soit.",
    'Quel conseil est donné ?',
    ['Déménager immédiatement', 'Payer sans discuter', 'Vérifier la réglementation', 'Acheter le logement'],
    2,
    "Le conseil est de vérifier les règles avant d'accepter.",
  ),
  listening(
    35,
    'news',
    "Pour réduire les déchets, le festival n'acceptera plus de bouteilles en plastique jetables; des stations d'eau seront installées sur le site.",
    'Quelle mesure est prise ?',
    [
      'Interdire toute boisson',
      'Remplacer les bouteilles jetables par des stations d’eau',
      'Faire payer l’eau',
      'Réduire la durée du festival',
    ],
    1,
    "Les bouteilles jetables sont supprimées et remplacées par des stations d'eau.",
  ),
  listening(
    36,
    'opinion',
    "Une ville agréable n'est pas seulement une ville propre. Elle doit aussi offrir des lieux où les habitants peuvent se rencontrer sans devoir consommer.",
    'Que souhaite la personne ?',
    ['Plus de centres commerciaux', 'Des espaces publics accessibles', 'Moins de parcs', 'Des restaurants obligatoires'],
    1,
    'Elle défend des lieux de rencontre publics sans obligation de consommation.',
  ),
  listening(
    37,
    'news',
    "Le gouvernement annonce un crédit d'impôt pour les entreprises qui offrent des stages rémunérés aux nouveaux diplômés.",
    "Quel est l'objectif probable de la mesure ?",
    ['Réduire les stages', 'Encourager les stages rémunérés', 'Fermer les entreprises', 'Augmenter les frais universitaires'],
    1,
    "Le crédit d'impôt incite les entreprises à offrir davantage de stages rémunérés.",
  ),
  listening(
    38,
    'opinion',
    "Pour moi, mesurer la réussite d'une politique uniquement avec des chiffres économiques est insuffisant. Il faut aussi regarder la santé et la qualité de vie.",
    'Quelle critique est formulée ?',
    [
      'Les données économiques sont inutiles',
      'Les politiques coûtent trop cher',
      'Les indicateurs économiques seuls ne suffisent pas',
      'La santé n’a aucun lien avec les politiques',
    ],
    2,
    'La personne veut compléter les données économiques par des indicateurs de santé et de qualité de vie.',
  ),
  listening(
    39,
    'news',
    'Après consultation publique, la ville conserve le projet de tramway mais modifie son tracé afin de protéger davantage les espaces verts.',
    'Quelle décision a été prise ?',
    [
      'Annuler le tramway',
      'Conserver le projet avec un tracé modifié',
      'Remplacer le tramway par des autobus',
      'Supprimer les espaces verts',
    ],
    1,
    'Le projet est maintenu, mais son tracé est modifié.',
  ),
]

const reading = (
  id: number,
  type: string,
  passage: string,
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): TcfQuestion => ({
  id: `ce-${String(id).padStart(2, '0')}`,
  type,
  passage,
  prompt,
  choices,
  answer,
  explanation,
})

export const TCF_READING_QUESTIONS: TcfQuestion[] = [
  reading(
    1,
    'notice',
    'Piscine municipale : fermeture du bassin principal mercredi de 8 h à 13 h pour entretien. Le bassin pour enfants reste ouvert.',
    'Que peut-on faire mercredi matin ?',
    [
      'Nager dans le bassin principal',
      'Utiliser le bassin pour enfants',
      'Prendre un cours dans le bassin principal',
      'Entrer gratuitement',
    ],
    1,
    'Seul le bassin principal est fermé; le bassin pour enfants reste ouvert.',
  ),
  reading(
    2,
    'message',
    "Salut Léa, j'ai laissé tes clés à l'accueil de l'immeuble. Tu peux les récupérer avant 20 h. — Samir",
    'Où Léa doit-elle aller ?',
    ['Chez Samir', 'À la réception', 'Au stationnement', 'À la poste'],
    1,
    "Les clés sont laissées à l'accueil de l'immeuble.",
  ),
  reading(
    3,
    'notice',
    "Bibliothèque : les livres empruntés peuvent être renouvelés deux fois en ligne, sauf s'ils sont déjà réservés par un autre usager.",
    'Quand un renouvellement est-il impossible ?',
    ['Quand le livre est récent', 'Quand quelqu’un d’autre l’a réservé', 'Après un seul renouvellement', 'Quand on utilise Internet'],
    1,
    'La réservation par un autre usager bloque le renouvellement.',
  ),
  reading(
    4,
    'email',
    "Bonjour, votre commande est prête. Vous disposez de cinq jours ouvrables pour venir la chercher au comptoir 4 avec une pièce d'identité.",
    'Que faut-il apporter ?',
    ['Une carte bancaire', 'Une photo', 'Une pièce d’identité', 'Le produit à échanger'],
    2,
    "Le courriel exige une pièce d'identité.",
  ),
  reading(
    5,
    'announcement',
    'Cours de conversation française : mardi et jeudi, 18 h 30–20 h. Niveau intermédiaire. Inscription obligatoire avant le 10 septembre.',
    "À qui s'adresse ce cours ?",
    ['Aux débutants complets', 'Aux apprenants intermédiaires', 'Aux enfants uniquement', 'Aux professeurs'],
    1,
    'Le niveau indiqué est intermédiaire.',
  ),
  reading(
    6,
    'message',
    'Je ne pourrai pas venir dîner ce soir. Mon train a trois heures de retard. On se voit demain ? — Chloé',
    'Pourquoi Chloé annule-t-elle ?',
    ['Elle est malade', 'Son train est très en retard', 'Elle travaille tard', 'Elle a oublié'],
    1,
    'Elle explique que son train a trois heures de retard.',
  ),
  reading(
    7,
    'notice',
    'Stationnement réservé aux résidents de 18 h à 7 h. Permis visible obligatoire.',
    'Qui peut stationner ici à 22 h ?',
    ['N’importe qui', 'Les résidents avec permis', 'Les touristes', 'Les taxis seulement'],
    1,
    'Le stationnement nocturne est réservé aux résidents avec permis visible.',
  ),
  reading(
    8,
    'email',
    "Votre rendez-vous du 14 octobre est confirmé à 15 h. Si vous devez l'annuler, merci de nous prévenir au moins 24 heures à l'avance.",
    "Que demande le cabinet en cas d'annulation ?",
    ['Payer immédiatement', 'Prévenir au moins un jour avant', 'Envoyer une lettre', 'Choisir un autre médecin'],
    1,
    'Il faut prévenir au moins 24 heures avant.',
  ),
  reading(
    9,
    'practical',
    "Pour accéder au laboratoire, les visiteurs doivent s'enregistrer à la sécurité et porter leur badge en tout temps.",
    'Quelle règle est obligatoire ?',
    ['Apporter un ordinateur', 'Porter un badge', 'Venir accompagné', 'Téléphoner avant chaque visite'],
    1,
    'Le badge doit être porté en permanence.',
  ),
  reading(
    10,
    'notice',
    "Marché du quartier : samedi de 9 h à 14 h. En cas de forte pluie, l'événement sera déplacé au centre communautaire.",
    "Que se passe-t-il s'il pleut beaucoup ?",
    ['Le marché est annulé', 'Le marché change de lieu', 'Le marché ferme à midi', 'Le marché devient gratuit'],
    1,
    'Le marché est déplacé au centre communautaire.',
  ),
  reading(
    11,
    'short-text',
    "Depuis qu'elle travaille quatre jours par semaine, Maya utilise son vendredi libre pour suivre une formation en comptabilité.",
    'Que fait Maya le vendredi ?',
    ['Elle travaille au bureau', 'Elle suit une formation', 'Elle garde ses enfants', 'Elle voyage'],
    1,
    'Son vendredi libre est consacré à une formation.',
  ),
  reading(
    12,
    'short-text',
    "Le café du musée n'accepte plus d'espèces. Les paiements par carte et par téléphone sont toujours possibles.",
    "Quel paiement n'est plus accepté ?",
    ['La carte bancaire', 'Le téléphone', 'L’argent comptant', 'Le paiement sans contact'],
    2,
    'Le texte indique que les espèces ne sont plus acceptées.',
  ),
  reading(
    13,
    'short-text',
    'Antoine cherchait un appartement près du centre. Il a finalement choisi un logement plus éloigné, car il est deux fois plus grand pour le même loyer.',
    'Pourquoi a-t-il choisi ce logement ?',
    ['Il est plus proche', 'Il est beaucoup plus grand', 'Il est meublé', 'Il coûte deux fois moins cher'],
    1,
    'Le principal avantage est la surface, deux fois plus grande pour le même loyer.',
  ),
  reading(
    14,
    'article',
    'Une entreprise locale offre désormais deux heures par semaine à ses employés pour faire du bénévolat pendant les heures de travail. La direction affirme vouloir renforcer les liens avec la communauté.',
    "Quel est l'objectif annoncé ?",
    ['Réduire les salaires', 'Renforcer les liens avec la communauté', 'Remplacer des employés', 'Augmenter les heures supplémentaires'],
    1,
    'La direction présente explicitement cet objectif.',
  ),
  reading(
    15,
    'article',
    "Le nouveau service de vélos partagés a connu un démarrage plus lent que prévu. La ville prévoit toutefois d'ajouter des stations près des gares, où la demande est la plus forte.",
    'Quelle action est prévue ?',
    ['Supprimer le service', 'Ajouter des stations près des gares', 'Augmenter le prix partout', 'Fermer les gares'],
    1,
    'La ville prévoit des stations supplémentaires près des gares.',
  ),
  reading(
    16,
    'article',
    "De nombreux employés apprécient la flexibilité du télétravail, mais plusieurs disent avoir du mal à séparer vie professionnelle et vie privée lorsqu'ils travaillent toujours de chez eux.",
    'Quel problème est mentionné ?',
    ['Le manque d’Internet', 'La difficulté à séparer travail et vie privée', 'Le coût du transport', 'Le manque de bureaux'],
    1,
    'Le texte souligne la frontière floue entre travail et vie privée.',
  ),
  reading(
    17,
    'article',
    'Le quartier a transformé un ancien stationnement en jardin collectif. Les résidents peuvent y cultiver des légumes et participer à des ateliers gratuits.',
    "Qu'offre le nouveau lieu ?",
    ['Un garage', 'Un jardin et des ateliers', 'Un centre commercial', 'Des bureaux privés'],
    1,
    'Le stationnement est devenu un jardin collectif avec ateliers.',
  ),
  reading(
    18,
    'article',
    "Une étude universitaire observe que les étudiants qui planifient des périodes courtes de révision plusieurs fois par semaine retiennent mieux que ceux qui étudient tout la veille de l'examen.",
    'Quelle méthode semble plus efficace ?',
    ['Tout réviser la veille', 'Réviser régulièrement en petites périodes', 'Ne jamais planifier', 'Étudier seulement en groupe'],
    1,
    'La révision espacée et régulière est associée à une meilleure rétention.',
  ),
  reading(
    19,
    'article',
    "La compagnie de transport veut rendre ses horaires plus faciles à comprendre. Elle testera une nouvelle signalisation dans trois stations avant de décider si elle l'étend à tout le réseau.",
    'Pourquoi commencer dans trois stations ?',
    [
      'Pour fermer les autres stations',
      'Pour tester la solution avant de la généraliser',
      'Pour réduire le nombre de voyageurs',
      'Pour changer les tarifs',
    ],
    1,
    "Il s'agit d'une phase pilote avant un éventuel déploiement général.",
  ),
  reading(
    20,
    'article',
    "Les commerces du centre pourront désormais rester ouverts plus tard le vendredi. La mesure est volontaire : chaque propriétaire décidera s'il souhaite prolonger ses heures.",
    'Que signifie cette mesure ?',
    [
      'Tous les commerces doivent fermer plus tôt',
      'Chaque commerce choisit s’il ouvre plus tard',
      'Seuls les restaurants peuvent ouvrir',
      'Les heures du vendredi sont supprimées',
    ],
    1,
    'La prolongation est facultative.',
  ),
  reading(
    21,
    'opinion',
    "On présente souvent la voiture électrique comme une solution complète. Elle réduit certaines émissions, mais elle ne règle ni les embouteillages ni l'espace occupé par les voitures en ville.",
    "Quelle nuance apporte l'auteur ?",
    [
      'La voiture électrique ne réduit aucune émission',
      'Elle résout tous les problèmes urbains',
      'Elle aide sur les émissions mais pas sur tous les problèmes de mobilité',
      'Elle est interdite en ville',
    ],
    2,
    "L'auteur reconnaît un bénéfice tout en soulignant ses limites.",
  ),
  reading(
    22,
    'opinion',
    'Selon moi, une bonne politique de logement ne devrait pas opposer construction neuve et protection des locataires. Une ville a besoin des deux pour rester accessible.',
    'Quelle position est défendue ?',
    [
      'Construire sans protéger les locataires',
      'Protéger sans construire',
      'Combiner construction et protection',
      'Arrêter toute politique du logement',
    ],
    2,
    "L'auteur refuse l'opposition et défend les deux approches.",
  ),
  reading(
    23,
    'opinion',
    "Certains craignent que les semaines de quatre jours réduisent la production. Pourtant, plusieurs expériences montrent qu'une meilleure organisation peut maintenir les résultats tout en améliorant le bien-être.",
    'Quel argument soutient la semaine de quatre jours ?',
    [
      'Elle garantit moins de travail produit',
      'Une meilleure organisation peut maintenir les résultats',
      'Elle supprime tous les coûts',
      'Elle exige plus d’heures chaque jour',
    ],
    1,
    'Le texte cite des expériences où les résultats sont maintenus.',
  ),
  reading(
    24,
    'opinion',
    "Les réseaux sociaux peuvent aider à découvrir de nouvelles idées, mais leur algorithme favorise souvent les contenus qui retiennent l'attention plutôt que ceux qui sont les plus fiables.",
    'Quelle critique est formulée ?',
    [
      'Les réseaux ne montrent aucun contenu',
      'Les algorithmes privilégient parfois l’attention au détriment de la fiabilité',
      'Tout contenu en ligne est fiable',
      'Les algorithmes sont inutilisés',
    ],
    1,
    "La critique vise le choix algorithmique fondé sur l'attention.",
  ),
  reading(
    25,
    'opinion',
    "Rendre les transports gratuits peut aider certaines familles, mais si les autobus sont rares et peu fiables, la gratuité seule ne convaincra pas beaucoup d'automobilistes.",
    'Quelle condition est jugée importante ?',
    ['Augmenter le prix', 'Améliorer aussi la fréquence et la fiabilité', 'Supprimer les autobus', 'Interdire les familles'],
    1,
    "L'auteur estime que la qualité du service compte autant que le prix.",
  ),
  reading(
    26,
    'article',
    "Une école secondaire a remplacé une partie des devoirs traditionnels par des projets réalisés en équipe. Les enseignants observent plus de participation, mais notent que l'évaluation individuelle est devenue plus complexe.",
    'Quel inconvénient est mentionné ?',
    ['Moins de participation', 'Une évaluation individuelle plus difficile', 'L’absence totale de projets', 'Des classes plus courtes'],
    1,
    "La difficulté concerne l'évaluation de chaque élève.",
  ),
  reading(
    27,
    'article',
    "Face à la hausse des prix alimentaires, plusieurs organismes proposent des ateliers de cuisine économique. Ils insistent sur la planification des repas et l'utilisation complète des ingrédients.",
    'Que cherchent à enseigner ces ateliers ?',
    ['À cuisiner plus cher', 'À réduire les coûts et le gaspillage', 'À ouvrir un restaurant', 'À acheter uniquement des plats préparés'],
    1,
    "La planification et l'utilisation complète des ingrédients visent économies et réduction du gaspillage.",
  ),
  reading(
    28,
    'opinion',
    'Interdire les téléphones en classe peut réduire certaines distractions. Mais sans apprendre aux élèves à gérer leur attention, le problème risque simplement de se déplacer ailleurs.',
    "Quelle idée complète l'interdiction ?",
    ['Ignorer l’attention', 'Apprendre à gérer son attention', 'Donner deux téléphones', 'Supprimer les cours'],
    1,
    "L'auteur juge nécessaire d'éduquer aussi à la gestion de l'attention.",
  ),
  reading(
    29,
    'article',
    'La ville souhaite planter dix mille arbres en cinq ans, en priorité dans les secteurs où les températures estivales sont les plus élevées et où la couverture végétale est faible.',
    'Quels secteurs sont prioritaires ?',
    [
      'Les secteurs déjà très verts',
      'Les secteurs chauds avec peu de végétation',
      'Les zones industrielles uniquement',
      'Les quartiers les plus riches',
    ],
    1,
    'La priorité va aux zones chaudes et peu végétalisées.',
  ),
  reading(
    30,
    'opinion',
    'Un diplôme reste utile, mais il ne garantit plus à lui seul une carrière stable. La capacité à apprendre de nouvelles compétences devient tout aussi importante.',
    "Quelle évolution souligne l'auteur ?",
    [
      'Le diplôme est inutile',
      'Il faut aussi continuer à apprendre',
      'Les compétences ne changent jamais',
      'La carrière stable est garantie',
    ],
    1,
    "Le texte insiste sur l'apprentissage continu en plus du diplôme.",
  ),
  reading(
    31,
    'article',
    'Des chercheurs ont comparé deux groupes de marcheurs. Ceux qui marchaient régulièrement dans des espaces verts rapportaient une baisse plus importante de leur stress perçu.',
    'Quel facteur est associé à une plus grande baisse du stress ?',
    ['Marcher uniquement le soir', 'Marcher régulièrement dans des espaces verts', 'Marcher plus vite', 'Marcher en centre commercial'],
    1,
    'Le groupe fréquentant régulièrement les espaces verts rapporte la plus forte baisse.',
  ),
  reading(
    32,
    'opinion',
    "Les villes veulent attirer des événements internationaux pour leurs retombées économiques. Elles devraient cependant publier clairement les coûts publics engagés afin que les citoyens puissent juger si l'investissement en vaut la peine.",
    "Que demande l'auteur ?",
    ['Interdire tous les événements', 'Publier les coûts publics', 'Cacher les dépenses', 'Laisser les citoyens payer directement'],
    1,
    "L'auteur demande de la transparence sur les coûts publics.",
  ),
  reading(
    33,
    'article',
    "Une coopérative d'habitation réserve une partie de ses logements à des personnes âgées et propose des espaces communs afin de favoriser l'entraide entre voisins.",
    'Quel objectif social apparaît ?',
    ['Isoler les résidents', 'Favoriser l’entraide', 'Réduire les espaces communs', 'Accueillir uniquement des étudiants'],
    1,
    "Les espaces communs sont conçus pour encourager l'entraide.",
  ),
  reading(
    34,
    'opinion',
    "Travailler plus longtemps n'est pas forcément travailler mieux. Dans les métiers qui demandent beaucoup de concentration, la fatigue peut augmenter les erreurs et annuler le gain de temps apparent.",
    'Quelle idée centrale est défendue ?',
    [
      'Plus d’heures donnent toujours de meilleurs résultats',
      'La fatigue peut réduire l’efficacité',
      'La concentration ne change jamais',
      'Les erreurs font gagner du temps',
    ],
    1,
    "L'auteur distingue durée du travail et efficacité réelle.",
  ),
  reading(
    35,
    'article',
    "Pour lutter contre la désinformation, une association propose des ateliers où les participants apprennent à vérifier l'auteur, la date, les sources citées et le contexte d'une publication.",
    'Quelle compétence est développée ?',
    ['La création de publicités', 'La vérification de l’information', 'La programmation', 'La photographie'],
    1,
    "Les étapes décrites sont celles de la vérification de l'information.",
  ),
  reading(
    36,
    'opinion',
    "La densification des villes peut limiter l'étalement urbain, mais elle doit s'accompagner d'écoles, de parcs et de transports suffisants. Sinon, les habitants auront le sentiment de perdre en qualité de vie.",
    'À quelle condition la densification est-elle mieux acceptée ?',
    [
      'Sans aucun service public',
      'Avec des infrastructures et services suffisants',
      'Avec moins de transports',
      'Avec uniquement des tours très hautes',
    ],
    1,
    "L'auteur lie la densification à la présence d'infrastructures adaptées.",
  ),
  reading(
    37,
    'article',
    'Une entreprise a supprimé les réunions sans ordre du jour. Six mois plus tard, les employés disent passer moins de temps en réunion et disposer de davantage de plages de travail concentré.',
    'Quel changement est observé ?',
    ['Plus de réunions', 'Moins de temps en réunion et plus de concentration', 'Aucun travail individuel', 'Des réunions plus longues'],
    1,
    'La suppression des réunions sans ordre du jour libère du temps de concentration.',
  ),
  reading(
    38,
    'opinion',
    "Les politiques climatiques sont souvent évaluées sur leur coût immédiat. Il faut aussi considérer le coût de l'inaction, qui apparaît plus tard sous forme de dommages, d'assurances plus chères ou de pertes agricoles.",
    "Que propose l'auteur d'inclure dans l'évaluation ?",
    ['Seulement le coût immédiat', 'Le coût futur de l’inaction', 'Uniquement le prix des assurances', 'Aucun coût économique'],
    1,
    "L'auteur veut comparer le coût des mesures au coût futur de ne rien faire.",
  ),
  reading(
    39,
    'article',
    "Après une consultation, l'université maintient son projet de nouveau pavillon, mais réduit le nombre de places de stationnement et ajoute un accès direct au réseau cyclable.",
    'Quel compromis a été retenu ?',
    [
      'Abandonner le pavillon',
      'Garder le projet en favorisant davantage les déplacements actifs',
      'Ajouter uniquement des stationnements',
      'Supprimer l’accès cyclable',
    ],
    1,
    "Le projet est maintenu tout en réduisant le stationnement et en améliorant l'accès cyclable.",
  ),
]

export type TcfQcmSkill = 'listening' | 'reading'

export const TCF_QUESTIONS: Record<TcfQcmSkill, TcfQuestion[]> = {
  listening: TCF_LISTENING_QUESTIONS,
  reading: TCF_READING_QUESTIONS,
}

export type TcfQuestionSet = { id: string; label: string; questions: TcfQuestion[] }

export const TCF_QUESTION_SETS: Record<TcfQcmSkill, TcfQuestionSet[]> = {
  listening: [
    { id: 'a', label: '套题 A', questions: TCF_LISTENING_QUESTIONS },
    { id: 'b', label: '套题 B', questions: TCF_LISTENING_SET_B },
  ],
  reading: [
    { id: 'a', label: '套题 A', questions: TCF_READING_QUESTIONS },
    { id: 'b', label: '套题 B', questions: TCF_READING_SET_B },
  ],
}

export const TCF_MIXED_SET_ID = 'mixed'

// A mixed paper draws each position from a random set, so the A1 → C2 progression is kept.
export function pickTcfQuestions(skill: TcfQcmSkill, setId: string, random: () => number = Math.random): TcfQuestion[] {
  const sets = TCF_QUESTION_SETS[skill]
  if (setId !== TCF_MIXED_SET_ID) return (sets.find((set) => set.id === setId) ?? sets[0]).questions
  return sets[0].questions.map((_, index) => sets[Math.floor(random() * sets.length)].questions[index])
}

export function shuffleTcfChoiceOrder(random: () => number = Math.random): number[] {
  const order = [0, 1, 2, 3]
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }
  return order
}
