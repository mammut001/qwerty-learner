// Échelle québécoise scenarios for Niveau 7 and Niveau 8 indicators.
// Covers both official situations types (examples) for every listening and reading indicator.
// All scenarios are hand-crafted, culturally grounded in Québec, and thoroughly tested.

export const N07_08_SCENARIOS = {
  // ===========================================================================
  // NIVEAU 7 - LISTENING
  // ===========================================================================

  // n7-listening-0 (informatif)
  // Ex 0: Salon de l’emploi - avenir économique d’une région
  // Ex 1: Publicité gouvernementale - éducation des enfants
  'n7-listening-0': [
    // sc 0 (sit 0): Salon de l’emploi au Saguenay–Lac-Saint-Jean
    {
      situation: 0,
      text: 'Bonjour à toutes et à tous. Bienvenue à cette séance d’information consacrée aux perspectives professionnelles au Saguenay–Lac-Saint-Jean. Notre région traverse une transformation majeure : si l’industrie de l’aluminium et le secteur forestier demeurent des piliers économiques, de nouvelles filières en technologies vertes et en transformation agroalimentaire créent actuellement des centaines d’emplois spécialisés. Cependant, le vieillissement démographique représente un défi de taille. Plus de quatre mille postes devront être pourvus d’ici trois ans dans les services publics, la santé et l’enseignement collégial. Pour attirer des travailleuses et travailleurs qualifiés, les municipalités régionales de comté offrent des bourses d’installation ainsi qu’un accompagnement personnalisé pour le logement et les garderies. Si vous cherchez un milieu de vie paisible où vos compétences professionnelles seront reconnues rapidement, notre équipe est à votre entière disposition au kiosque numéro douze.',
      questions: [
        [
          'Quel changement économique majeur la région connaît-elle selon la conférencière ?',
          'L’apparition de créneaux dans les technologies vertes',
          'Le déclin irréversible de la transformation forestière',
          'La fermeture définitive des alumineries régionales',
        ],
        [
          'Que peut-on déduire sur l’attitude des autorités régionales envers les nouveaux arrivants ?',
          'Elles déploient des incitatifs concrets pour les attirer',
          'Elles se montrent indifférentes face à leur intégration',
          'Elles préfèrent restreindre l’accès aux garderies locales',
        ],
        [
          'Quel principal défi la région doit-elle surmonter à court terme ?',
          'Le manque important de relève lié à la démographie',
          'L’absence complète de services de santé de proximité',
          'La baisse drastique de la fréquentation collégiale',
        ],
      ],
    },
    // sc 1 (sit 0): Salon de l’emploi en Abitibi-Témiscamingue
    {
      situation: 0,
      text: 'Merci d’être venus en si grand nombre. En Abitibi-Témiscamingue, les perspectives d’embauche sont exceptionnelles dans les secteurs minier, manufacturier et environnemental. Grâce à des investissements massifs dans l’extraction responsable de minéraux critiques, nos entreprises recrutent activement des techniciennes, des ingénieurs et du personnel administratif. Plusieurs personnes hésitent parfois à s’établir en région en raison de l’éloignement géographique, mais notre réseau d’infrastructures municipales et nos services scolaires offrent une qualité de vie remarquable. De plus, plusieurs employeurs financent les frais de déménagement et garantissent un mentorat professionnel dès votre arrivée. Bien que certains corps de métier manquent cruellement de main-d’œuvre, nos programmes de formation professionnelle accélérée permettent d’obtenir rapidement une qualification reconnue. Venez rencontrer nos conseillers au pavillon régional pour discuter des nombreuses carrières qui s’offrent à vous dès aujourd’hui.',
      questions: [
        [
          'Dans quels secteurs les opportunités d’embauche sont-elles particulièrement fortes ?',
          'Dans les mines et le secteur manufacturier',
          'Dans l’agriculture biologique et le tourisme',
          'Dans le secteur financier et les assurances',
        ],
        [
          'Quelle réticence implicite des candidats la représentante cherche-t-elle à dissiper ?',
          'La crainte d’un isolement causé par la distance',
          'La peur de ne pas recevoir de salaire suffisant',
          'Le refus d’apprendre les nouvelles technologies',
        ],
        [
          'Quelle mesure concrète plusieurs employeurs proposent-ils pour faciliter l’installation ?',
          'La prise en charge des coûts liés au transport des biens',
          'La promesse d’un voyage de vacances après quelques mois',
          'L’attribution gratuite d’une maison dans la municipalité',
        ],
      ],
    },
    // sc 2 (sit 0): Salon de l’emploi en Gaspésie
    {
      situation: 0,
      text: 'Chers participants, nous sommes ravis de vous présenter aujourd’hui les projets novateurs qui dynamisent la Gaspésie. Longtemps associée uniquement à la pêche saisonnière et aux activités touristiques estivales, notre péninsule diversifie activement son économie grâce à la filière éolienne, aux biotechnologies marines et aux services numériques. Cette vitalité économique nouvelle entraîne toutefois une forte pression sur le marché de l’habitation locative dans plusieurs municipalités côtières. Pour remédier à cette situation, les élus locaux ont mis en place des partenariats novateurs afin de bâtir des logements modulaires abordables destinés aux jeunes familles. Si vous décidez de franchir le pas, vous constaterez rapidement que la solidarité communautaire et la proximité de la mer compensent largement l’éloignement des grands centres urbains. Nous vous invitons chaleureusement à échanger avec nos ambassadeurs régionaux installés au stand principal.',
      questions: [
        [
          'Comment l’économie de cette région se transforme-t-elle selon la présentation ?',
          'En développant l’énergie éolienne et le numérique',
          'En cessant totalement l’exploitation des ressources marines',
          'En limitant toutes les activités touristiques en période estivale',
        ],
        [
          'Quelle difficulté concrète les nouveaux arrivants risquent-ils de rencontrer ?',
          'Un accès restreint aux appartements à louer',
          'Une absence totale d’écoles primaires sur la côte',
          'Une opposition hostile des communautés côtières',
        ],
        [
          'Quel sous-entendu implicite la conférencière formule-t-elle sur le mode de vie en Gaspésie ?',
          'L’esprit d’entraide compense la distance géographique',
          'Le coût de la vie est devenu semblable à celui de Montréal',
          'La vie en région convient surtout aux personnes célibataires',
        ],
      ],
    },
    // sc 3 (sit 1): Publicité gouvernementale - persévérance scolaire
    {
      situation: 1,
      text: 'La réussite de nos enfants commence par des gestes simples et quotidiens. Dès les premières années du primaire, encourager la lecture à la maison, valoriser les efforts constants et maintenir une communication régulière avec l’équipe pédagogique transforment le parcours scolaire de chaque élève. Lorsque les parents s’investissent activement dans la routine des devoirs et participent aux activités parascolaires, ils transmettent un message clair : l’apprentissage est une aventure enrichissante et essentielle. Si un enfant traverse une période de découragement ou présente des difficultés scolaires, il importe d’agir sans tarder avec les professionnels de l’établissement, qu’il s’agisse d’orthopédagogues ou d’éducateurs spécialisés. Ensemble, soutenons la persévérance de nos jeunes afin qu’ils développent pleinement leur potentiel et réalisent leurs aspirations futures. Pour obtenir des conseils pratiques et des ressources adaptées, consultez dès maintenant le portail officiel du ministère de l’Éducation.',
      questions: [
        [
          'Quel comportement parental est particulièrement recommandé dans ce message ?',
          'Maintenir un dialogue constant avec les enseignants',
          'Engager un tuteur privé dès la première année d’école',
          'Inscrire l’enfant au plus grand nombre d’activités sportives',
        ],
        [
          'Que suggère implicitement le message en cas de baisse de motivation d’un élève ?',
          'Qu’une intervention rapide évite l’aggravation des blocages',
          'Qu’il vaut mieux attendre la fin de l’année pour intervenir',
          'Que les parents sont les seuls responsables de l’échec scolaire',
        ],
        [
          'Vers quelle ressource le public est-il orienté pour approfondir le sujet ?',
          'Le site Web gouvernemental consacré au milieu éducatif',
          'La ligne téléphonique d’urgence des services de santé',
          'Un bureau municipal d’aide aux devoirs de quartier',
        ],
      ],
    },
    // sc 4 (sit 1): Publicité gouvernementale - développement de la petite enfance
    {
      situation: 1,
      text: 'Dès les premiers mois de vie, chaque échange avec votre tout-petit construit les fondations de son développement cognitif et émotionnel. Les études démontrent que parler fréquemment à son nourrisson, lui chanter des comptines traditionnelles et lui lire des histoires illustrées stimulent considérablement l’acquisition du langage et favorisent son ouverture au monde. Dans nos centres de la petite enfance et nos garderies éducatives agréées, des éducatrices qualifiées accompagnent chaque enfant selon son propre rythme, en misant sur le jeu libre et la socialisation bienveillante. Si vous observez des retards dans l’acquisition de la motricité ou de la parole, sachez que des équipes multidisciplinaires en CLSC peuvent évaluer gratuitement votre enfant et vous proposer des interventions précoces adaptées. Offrons à nos tout-petits un départ solide et harmonieux dans la vie. Renseignez-vous auprès de votre centre local de services communautaires pour connaître les ateliers offerts aux familles.',
      questions: [
        [
          'Quelles activités simples sont encouragées dès la tendre enfance ?',
          'La lecture d’histoires et les discussions fréquentes',
          'L’utilisation encadrée d’écrans et d’applications mobiles',
          'L’apprentissage intensif de calculs avant la maternelle',
        ],
        [
          'Quelle intention implicite sous-tend la mention des services gratuits en CLSC ?',
          'Rassurer les parents et encourager un dépistage précoce',
          'Critiquer le manque de compétence des garderies privées',
          'Réduire le nombre d’inscriptions dans les écoles publiques',
        ],
        [
          'Où les parents peuvent-ils trouver des ateliers éducatifs adaptés à leur situation ?',
          'Dans leur centre local de services communautaires',
          'Auprès du secrétariat de la commission scolaire locale',
          'Dans les cliniques privées de pédiatrie du centre-ville',
        ],
      ],
    },
    // sc 5 (sit 1): Publicité gouvernementale - saines habitudes de vie chez les jeunes
    {
      situation: 1,
      text: 'Bouger tous les jours et adopter une alimentation saine, c’est bien plus qu’une question de santé physique : c’est un moteur puissant pour l’équilibre mental et la concentration en classe. Trop souvent, nos jeunes passent de longues heures devant des écrans lumineux, ce qui perturbe leur sommeil et réduit leur niveau d’énergie pendant les cours. En instaurant des sorties actives en famille, en favorisant les déplacements actifs vers l’école et en préparant des collations nutritives à base de fruits frais, nous aidons nos adolescents à développer de saines habitudes durables. Si les parents montrent l’exemple au quotidien avec enthousiasme, les jeunes adoptent spontanément ces comportements positifs sans les percevoir comme une contrainte imposée. Engageons-nous collectivement pour le bien-être de notre jeunesse. Découvrez des idées d’activités familiales gratuites et des recettes simples sur le site de la Santé publique du Québec.',
      questions: [
        [
          'Quel bienfait de l’activité physique est particulièrement mis de l’avant ?',
          'Une meilleure capacité d’attention pendant les apprentissages',
          'La garantie d’obtenir d’excellentes notes aux examens finaux',
          'La réduction immédiate du temps consacré aux devoirs du soir',
        ],
        [
          'Que laisse entendre le texte à propos de l’attitude parentale souhaitée ?',
          'L’adhésion des jeunes passe par l’exemplarité des adultes',
          'L’interdiction stricte des appareils électroniques suffit',
          'Les adolescents préfèrent toujours les activités solitaires',
        ],
        [
          'Quelle initiative pratique est proposée pour les trajets quotidiens ?',
          'Privilégier la marche ou le vélo pour aller étudier',
          'Acheter un véhicule électrique pour les déplacements',
          'Prendre systématiquement le transport scolaire jaune',
        ],
      ],
    },
  ],

  // n7-listening-1 (narratif)
  // Ex 0: Pièce de théâtre comique sur les relations humaines
  // Ex 1: Balado sur l’histoire d’un quartier
  'n7-listening-1': [
    // sc 0 (sit 0): Pièce comique - querelle de colocation
    {
      situation: 0,
      text: '— Félix, peux-tu m’expliquer pourquoi mon yogourt aux bleuets porte désormais une étiquette avec ton prénom ? — Écoute, Catherine, c’est une question de gestion préventive ! La semaine dernière, quelqu’un a mystérieusement mangé mes muffins aux carottes, alors j’ai décidé de nationaliser les étages du réfrigérateur. — Nationaliser ? Tu as juste collé du ruban adhésif rouge partout ! Le bac à légumes ressemble à une scène de crime. Et en plus, tu as confisqué mon fromage de chèvre sous prétexte qu’il dépassait la frontière du troisième rayon ! — Ce n’était pas une confiscation arbitraire, Catherine, c’était un droit de douane légitime pour compenser l’espace occupé par ta bouteille de kombucha géante ! — Félix, cette bouteille était là depuis hier soir, et ton prétendu traité douanier n’existe que dans ta tête ! Si tu continues comme ça, je vais instaurer un péage payant devant la porte de la salle de bain !',
      questions: [
        [
          'Quel est le ton général de cet échange entre colocataires ?',
          'Humoristique et théâtral',
          'Inquiet et dramatique',
          'Froid et professionnel',
        ],
        [
          'Quel sous-entendu Catherine fait-elle en menaçant d’installer un péage ?',
          'Elle veut montrer l’absurdité du comportement de Félix',
          'Elle a un besoin urgent de collecter de l’argent liquide',
          'Elle souhaite rénover complètement la salle de bain',
        ],
        [
          'Quelle justification farfelue Félix donne-t-il pour ses actions ?',
          'Il applique un prétendu accord douanier domestique',
          'Il affirme que le réfrigérateur est tombé en panne',
          'Il prétend suivre les consignes du propriétaire du logement',
        ],
      ],
    },
    // sc 1 (sit 0): Pièce comique - préparation d’un séjour en forêt
    {
      situation: 0,
      text: '— Marc, pourquoi as-tu empilé quatre lampes frontales, trois boussoles et une hache de bûcheron dans l’entrée ? Nous partons simplement deux jours dans un chalet tout équipé à Saint-Sauveur ! — Justement, Chantal ! En forêt boréale, la civilisation ne tient qu’à un fil. Si une tempête de vent coupe l’électricité, comment allons-nous survivre sans feu et sans repères géographiques ? — Le chalet possède un poêle à bois vitré, le chauffage d’appoint, l’Internet haute vitesse et une cafetière expresso italienne. Et pourquoi as-tu acheté un sac de couchage résistant à moins quarante degrés en plein mois de juillet ? — Parce que le climat québécois est notoirement imprévisible ! Imagine qu’une vague d’air polaire descende subitement du Grand Nord pendant la nuit ! — Marc, la météo annonce vingt-huit degrés et un soleil radieux pour toute la fin de semaine. Si un ours nous attaque, ce sera probablement pour te voler ton surplus d’équipement tellement tu ressembles à un catalogue de plein air ambulant !',
      questions: [
        [
          'Pourquoi Chantal se moque-t-elle ouvertement des préparatifs de Marc ?',
          'Il accumule un matériel excessif pour un chalet confortable',
          'Il a complètement oublié de réserver le lieu de vacances',
          'Il refuse catégoriquement de monter dans la voiture familiale',
        ],
        [
          'Que peut-on déduire de l’attitude de Marc face à cette fin de semaine ?',
          'Il manifeste une inquiétude exagérée face aux imprévus',
          'Il cherche secrètement un prétexte pour annuler le voyage',
          'Il est un expert reconnu en survie dans le Grand Nord',
        ],
        [
          'Quelle information météo Chantal rappelle-t-elle pour calmer son conjoint ?',
          'La prévision d’un temps très doux et ensoleillé',
          'L’arrivée imminente d’un orage violent sur les Laurentides',
          'Une baisse soudaine des températures sous le point de congélation',
        ],
      ],
    },
    // sc 2 (sit 0): Pièce comique - répétition d’un exposé professionnel
    {
      situation: 0,
      text: '— Respire un grand coup, Gabriel. On recommence ta présentation depuis le début. Imagine que je suis notre directrice régionale. Vas-y, impressionne-moi ! — Bonjour, estimée madame Tremblay… Notre équipe a le plaisir insigne de soumettre à votre sagacité lumineuse les chiffres trimestriels… — Stop ! Gabriel, arrête tout ! Tu as l’air d’un courtisan du dix-septième siècle qui demande une faveur royale ! Madame Tremblay dirige une entreprise de logistique à Trois-Rivières, pas la cour de Versailles ! Sois direct, dynamique et naturel ! — D’accord, d’accord. Salut Josée ! Les finances, ça roule au max, on a cartonné les objectifs et la concurrence est dans le rétroviseur ! — Ciel, Gabriel ! Entre la flatterie médiévale et le discours de vestiaire de hockey, il existe un juste milieu professionnel ! Essaie simplement de dire : « Bonjour madame Tremblay, voici les faits marquants de notre dernier bilan financier. » Tu penses pouvoir prononcer une phrase normale sans basculer dans la tragédie classique ?',
      questions: [
        [
          'Quel problème majeur la collègue cherche-t-elle à corriger chez Gabriel ?',
          'Il oscille entre des registres de langue totalement inappropriés',
          'Il refuse d’admettre que les chiffres de l’entreprise sont mauvais',
          'Il ne parvient pas à mémoriser le prénom de sa supérieure hiérarchique',
        ],
        [
          'Quel sentiment domine chez la collègue de Gabriel pendant la répétition ?',
          'Une exaspération amusée devant ses maladresses verbales',
          'Une panique incontrôlable quant à l’avenir de leur emploi',
          'Une colère profonde envers les exigences de la direction',
        ],
        [
          'Que conseille-t-elle concrètement pour réussir l’introduction de l’exposé ?',
          'Adopter un ton sobre, direct et courtois',
          'Raconter une anecdote humoristique sur Trois-Rivières',
          'Lire l’intégralité des tableaux comptables sans commentaire',
        ],
      ],
    },
    // sc 3 (sit 1): Balado sur l’histoire du Mile End à Montréal
    {
      situation: 1,
      text: 'Bienvenue au nouvel épisode de notre balado consacré au patrimoine urbain montréalais. Aujourd’hui, nous explorons l’histoire fascinante du Mile End. Au début du vingtième siècle, ce quartier au nord du mont Royal vibrait au rythme des manufactures de confection textile et des ateliers de taille de pierre. De nombreuses vagues d’immigration, venues notamment d’Europe de l’Est, de Grèce et d’Italie, s’y sont succédé, chacune laissant une empreinte durable dans les commerces de quartier, les boulangeries artisanales et les institutions communautaires. Vers la fin des années mil neuf cent quatre-vingt-dix, alors que l’industrie manufacturière fermait ses portes, d’immenses manufactures désaffectées ont attiré des peintres, des musiciennes et des artisans séduits par la luminosité des lofts et des loyers abordables. Peu à peu, le Mile End s’est métamorphosé en épicentre de la création artistique et du développement de jeux vidéo. Bien que la hausse récente du coût de l’immobilier menace cet écosystème fragile, l’esprit inventif du secteur résiste fièrement.',
      questions: [
        [
          'Quelle vocation industrielle le quartier avait-il au début du siècle dernier ?',
          'La confection textile et le travail de la pierre',
          'La fabrication lourde de wagons de chemin de fer',
          'Le raffinage pétrolier et la chimie industrielle',
        ],
        [
          'Quelle conséquence implicite la transformation des bâtiments industriels a-t-elle eue ?',
          'Elle a favorisé l’installation d’une communauté créative',
          'Elle a provoqué le départ immédiat de tous les habitants',
          'Elle a forcé la municipalité à démolir tout le quartier',
        ],
        [
          'Quelle préoccupation actuelle l’animateur du balado mentionne-t-il en conclusion ?',
          'La pression immobilière sur l’accessibilité des espaces',
          'La disparition complète des lignes de transport en commun',
          'Le manque d’intérêt des jeunes pour la création artistique',
        ],
      ],
    },
    // sc 4 (sit 1): Balado sur l’histoire du quartier Limoilou à Québec
    {
      situation: 1,
      text: 'Chers auditeurs, marchons aujourd’hui le long des avenues bordées d’arbres de Limoilou, à Québec. Né de la rivière Saint-Charles et du développement ferroviaire à la fin du dix-neuvième siècle, ce faubourg populaire a longtemps accueilli les familles ouvrières travaillant dans les chantiers navals et les scieries avoisinantes. Son tracé urbain unique, inspiré du modèle new-yorkais avec ses rues numérotées et ses ruelles verdoyantes, favorisait une vie de quartier tissée serrée où tout le monde se connaissait. Durant les décennies d’après-guerre, l’automobile et la construction d’autoroutes ont failli défigurer son tissu communautaire, mais la mobilisation farouche des citoyennes et citoyens a permis de préserver ses places publiques et ses commerces indépendants sur la 3e Avenue. Aujourd’hui, de jeunes entrepreneurs, des familles et des artistes redécouvrent la convivialité de Limoilou, tout en défendant jalousement la qualité de l’air et la protection des espaces verts riverains. Un quartier fier de ses racines et résolument tourné vers l’avenir.',
      questions: [
        [
          'Quelles industries historiques ont marqué l’essor initial de ce secteur de Québec ?',
          'Les chantiers navals et les usines de bois',
          'Les fonderies d’aluminium et les mines d’or',
          'Les usines pharmaceutiques et l’aéronautique',
        ],
        [
          'Que peut-on déduire sur l’attitude des résidents lors de la modernisation d’après-guerre ?',
          'Ils se sont mobilisés pour protéger l’esprit de leur quartier',
          'Ils ont immédiatement quitté la ville pour vivre en banlieue',
          'Ils ont refusé la création de tout nouveau commerce de proximité',
        ],
        [
          'Quelle caractéristique architecturale distingue le réseau des voies de Limoilou ?',
          'Une organisation inspirée du quadrillage urbain nord-américain',
          'Des rues en spirale construites autour d’une forteresse ancienne',
          'De grandes boucles circulaires sans aucune ruelle arrière',
        ],
      ],
    },
    // sc 5 (sit 1): Balado sur l’histoire de la Petite Italie à Montréal
    {
      situation: 1,
      text: 'Dans ce volet de notre balado patrimonial, nous posons nos micros au cœur de la Petite Italie. Arrivés par milliers au tournant du vingtième siècle pour construire les voies ferrées et bâtir les édifices montréalais, les pionniers italiens ont établi leurs pénates autour de l’église Notre-Dame-de-la-Défense. C’est dans ce périmètre chaleureux que sont nées les premières épiceries d’importation, les cafés espresso où l’on débattait avec passion et les cours intérieures garnies de potagers luxuriants. L’ouverture du marché Jean-Talon en mil neuf cent trente-trois a scellé le rôle névralgique du quartier comme carrefour agroalimentaire pour l’ensemble de l’île. Aujourd’hui encore, le parfum du basilic frais, la ferveur des terrasses ensoleillées lors des matchs de soccer et l’accueil des commerçants de deuxième génération confèrent au secteur une identité irremplaçable. Au-delà des clichés folkloriques, la Petite Italie témoigne de la contribution fondamentale des familles immigrantes à la vitalité culturelle québécoise.',
      questions: [
        [
          'Quel événement survenu dans les années trente a renforcé l’importance de ce quartier ?',
          'L’inauguration d’un grand marché public d’alimentation',
          'La construction de la première ligne de métro souterrain',
          'La fermeture des manufactures de textile environnantes',
        ],
        [
          'Quelle idée implicite l’animatrice cherche-t-elle à mettre en lumière ?',
          'L’immigration a profondément façonné le patrimoine québécois',
          'Les traditions culinaires ne peuvent subsister sans tourisme',
          'Le quartier s’est refermé sur lui-même au fil des décennies',
        ],
        [
          'Quels métiers exerçaient principalement les premiers arrivants de cette communauté ?',
          'Ouvriers ferroviaires et artisans de la construction',
          'Commerçants maritimes et pêcheurs d’eau douce',
          'Fonctionnaires municipaux et enseignants bilingues',
        ],
      ],
    },
  ],

  // n7-listening-2 (explicatif)
  // Ex 0: Journaliste économique - épargne / REER
  // Ex 1: Gestionnaire - réaménagement des espaces de travail
  'n7-listening-2': [
    // sc 0 (sit 0): Chroniqueuse économique sur le REER et le CELI
    {
      situation: 0,
      text: 'Bonjour chers auditeurs. Beaucoup d’entre vous se demandent s’il vaut mieux cotiser à un REER ou à un CELI avant la date limite fiscale. Voici les éléments clés pour faire un choix éclairé. Le Régime enregistré d’épargne-retraite procure une déduction fiscale immédiate : chaque dollar versé vient réduire votre revenu imposable de l’année courante, ce qui génère souvent un remboursement d’impôt appréciable. En contrepartie, les sommes retirées à la retraite seront ajoutées à votre revenu et imposées au taux alors en vigueur. Si vous prévoyez que votre revenu sera nettement inférieur à la retraite, le REER s’avère particulièrement avantageux. En revanche, pour une personne qui débute sur le marché du travail ou dont le salaire annuel se situe dans les paliers d’imposition inférieurs, le Compte d’épargne libre d’impôt constitue généralement une option plus souple : les gains s’y accumulent à l’abri de l’impôt et les retraits futurs ne sont jamais pénalisés. L’idéal reste souvent de combiner les deux instruments selon vos projets de vie.',
      questions: [
        [
          'Quel bénéfice financier immédiat procure une cotisation versée dans un REER ?',
          'Une diminution du montant du revenu imposable annuel',
          'Une exonération définitive de tout impôt lors de la retraite',
          'Une hausse automatique des rendements de la Bourse',
        ],
        [
          'Que déduit-on implicitement quant au choix optimal pour un jeune travailleur au salaire modeste ?',
          'Le CELI lui évite de gaspiller de précieux droits de déduction',
          'Le REER est l’unique véhicule d’épargne sécuritaire à son âge',
          'Il ne devrait épargner aucun montant avant d’atteindre quarante ans',
        ],
        [
          'À quelle condition majeure le REER est-il le plus profitable selon l’experte ?',
          'Si le taux d’imposition diminue lors de la période de retraite',
          'Si la personne retire l’ensemble du capital avant soixante ans',
          'Si le gouvernement bonifie les cotisations par une prime directe',
        ],
      ],
    },
    // sc 1 (sit 0): Chroniqueur financier sur le fonds de prévoyance en copropriété
    {
      situation: 0,
      text: 'Bienvenue à notre segment économique. Si vous êtes propriétaire d’un condo au Québec ou prévoyez en acquérir un, vous devez prêter une attention rigoureuse au fonds de prévoyance de l’immeuble. En vertu des récentes réformes législatives, chaque syndicat de copropriété doit désormais faire réaliser une étude professionnelle de fonds de prévoyance par un ingénieur ou un évaluateur agréé. Cette démarche rigoureuse permet de planifier sur vingt-cinq ans le coût des réparations majeures, comme le remplacement de la toiture, la mise aux normes des ascenseurs ou la réfection de la maçonnerie extérieure. Trop longtemps, de nombreux copropriétaires ont maintenu des frais mensuels artificiellement bas pour rendre les unités attrayantes, ce qui a causé des cotisations spéciales imprévues de plusieurs milliers de dollars au premier pépin sérieux. Une copropriété bien gérée affiche peut-être des charges mensuelles légèrement plus élevées, mais elle protège durablement la valeur marchande de votre patrimoine immobilier tout en prévenant les litiges entre voisins.',
      questions: [
        [
          'Quelle obligation légale récente s’impose désormais aux syndicats de copropriété ?',
          'Faire évaluer professionnellement les besoins futurs de réparation',
          'Baisser systématiquement les charges mensuelles des propriétaires',
          'Souscrire une assurance payée par le ministère de l’Habitation',
        ],
        [
          'Quel risque implicite guette les acheteurs de condos aux frais mensuels anormalement bas ?',
          'Devoir payer d’urgence d’importantes cotisations de rattrapage',
          'Perdre définitivement leur droit de vote aux assemblées générales',
          'Voir leur immeuble confisqué par la municipalité dans l’immédiat',
        ],
        [
          'Quels types d’ouvrages collectifs le fonds de prévoyance sert-il à financer ?',
          'Les réparations majeures des composantes communes du bâtiment',
          'La décoration intérieure des pièces privatives de chaque logement',
          'Les frais d’électricité et de chauffage individuel des occupants',
        ],
      ],
    },
    // sc 2 (sit 0): Chroniqueuse financière sur la gestion de l’endettement
    {
      situation: 0,
      text: 'Bonjour à tous. Face à la hausse des taux directeurs, la gestion de l’endettement personnel exige une discipline accrue. De nombreux ménages accumulent simultanément des soldes sur des cartes de crédit, des prêts personnels et des marges de crédit hypothécaires. La règle d’or consiste à prioriser le remboursement des dettes affichant le taux d’intérêt le plus élevé, souvent les cartes de grands magasins qui dépassent vingt pour cent d’intérêt annuel. Si votre cote de solvabilité le permet, consolider ces multiples emprunts au sein d’un seul prêt bancaire à taux préférentiel allège considérablement la charge mensuelle et accélère le désendettement. Toutefois, la consolidation ne constitue pas un remède miracle si elle ne s’accompagne pas d’une révision en profondeur des dépenses quotidiennes. Constituer un fonds d’urgence équivalant à trois mois de dépenses de base demeure le meilleur rempart pour ne pas replonger dans l’endettement à la moindre dépense imprévue, qu’il s’agisse d’une réparation automobile ou de soins dentaires urgents.',
      questions: [
        [
          'Quelle stratégie de remboursement la spécialiste recommande-t-elle en priorité ?',
          'Régler en premier les dettes dont le taux d’intérêt est le plus fort',
          'Rembourser uniquement la dette affichant le solde le moins élevé',
          'Attendre une baisse générale des taux pour payer ses cartes de crédit',
        ],
        [
          'Quel sous-entendu implicite la chroniqueuse formule-t-elle sur la consolidation de dettes ?',
          'Elle s’avère inefficace si les habitudes de consommation ne changent pas',
          'Elle garantit l’annulation complète de la moitié du capital emprunté',
          'Elle s’adresse exclusivement aux personnes sans aucun revenu fixe',
        ],
        [
          'À quoi devrait servir le fonds de secours préconisé par la chroniqueuse ?',
          'À absorber les dépenses imprévues sans recourir au crédit',
          'À financer les vacances familiales de la saison d’hiver',
          'À spéculer sur les marchés financiers internationaux',
        ],
      ],
    },
    // sc 3 (sit 1): Gestionnaire expliquant le passage aux bureaux partagés
    {
      situation: 1,
      text: 'Bonjour à toute l’équipe. Merci d’être présents pour cette rencontre d’information. Dès le premier octobre, notre direction amorcera le réaménagement complet du quatrième niveau pour adopter un modèle d’espaces partagés, communément appelé bureau flexible. Puisque la majorité des membres du personnel effectue désormais deux à trois journées de télétravail par semaine, près de la moitié de nos postes individuels demeuraient inoccupés au quotidien. Dans la nouvelle configuration, vous ne disposerez plus d’un cubicule attitré, mais d’un casier sécurisé personnel et d’une application mobile intuitive pour réserver votre poste de travail avant d’arriver au bureau. Nous avons conçu trois zones distinctes : un espace silencieux pour les tâches exigeant une concentration soutenue, des salles insonorisées pour les appels téléphoniques et un vaste espace collaboratif équipé d’écrans interactifs. Nous comprenons que cette transition bouscule vos repères habituels, mais elle favorisera une plus grande souplesse et stimulera les échanges entre nos différents départements de travail.',
      questions: [
        [
          'Quelle est la raison principale ayant motivé ce réaménagement des locaux ?',
          'Le faible taux d’occupation des postes en raison du télétravail',
          'L’obligation légale de réduire la taille globale de l’immeuble',
          'Le recrutement massif de deux cents nouveaux employés administratifs',
        ],
        [
          'Que déduit-on de l’attitude du gestionnaire envers les inquiétudes de ses employés ?',
          'Il reconnaît que le changement perturbe les habitudes de travail',
          'Il rejette avec sévérité toute critique relative au réaménagement',
          'Il estime que les employés travaillaient beaucoup trop lentement',
        ],
        [
          'Comment les employés choisiront-ils leur poste de travail à l’avenir ?',
          'En utilisant un outil numérique de réservation préalable',
          'En arrivant avant sept heures du matin pour réserver une place',
          'En négociant directement chaque matin avec leur chef d’équipe',
        ],
      ],
    },
    // sc 4 (sit 1): Gestionnaire expliquant les modalités du travail hybride
    {
      situation: 1,
      text: 'Chers collègues, je tenais à vous réunir aujourd’hui pour préciser les nouvelles balises relatives à notre formule de travail hybride. À compter du mois prochain, chaque employé devra être présent au bureau deux jours fixes par semaine, soit les mardis et les jeudis, afin de consolider la cohésion d’équipe et de faciliter la tenue des réunions stratégiques en présentiel. Les trois autres journées pourront être effectuées en télétravail à votre convenance, sous réserve de respecter vos engagements de disponibilité sur notre messagerie interne entre neuf heures et seize heures. Pour soutenir l’ergonomie de votre espace à la maison, notre organisation reconduit l’allocation annuelle d’équipement informatique et de mobilier de bureau. Si vous devez modifier exceptionnellement vos journées de présence pour des motifs familiaux ou médicaux, veuillez en aviser votre responsable immédiat au moins quarante-huit heures à l’avance. Cette nouvelle organisation vise un équilibre durable entre flexibilité personnelle et performance collective.',
      questions: [
        [
          'Quels jours de la semaine la présence physique au bureau devient-elle obligatoire ?',
          'Les mardis et les jeudis pour toute l’équipe',
          'Les lundis et les vendredis sans exception',
          'Uniquement le mercredi matin pour la réunion générale',
        ],
        [
          'Quelle intention implicite dicte le choix de fixer des journées communes au bureau ?',
          'Renforcer le sentiment d’appartenance et la synergie de groupe',
          'Surveiller en permanence le temps de travail de chaque membre',
          'Supprimer définitivement la formule du travail à domicile',
        ],
        [
          'Quelle aide matérielle l’entreprise renouvelle-t-elle pour le travail à domicile ?',
          'Une subvention financière pour le mobilier et les ordinateurs',
          'La livraison gratuite de repas chauds pour les télétravailleurs',
          'Le paiement intégral de la facture de chauffage du domicile',
        ],
      ],
    },
    // sc 5 (sit 1): Gestionnaire expliquant un déménagement vers un édifice écologique
    {
      situation: 1,
      text: 'Bonjour à tous. Je suis très fier de vous dévoiler les détails de notre futur déménagement vers le complexe environnemental de l’Éco-Quartier, prévu pour le printemps prochain. Ce nouvel édifice certifié carboneutre offre une luminosité naturelle exceptionnelle, une ventilation géothermique à la fine pointe de la technologie et un accès direct à deux stations du réseau de transport collectif. Dans cette optique de développement durable, nous devons amorcer dès ce mois-ci une grande opération de désencombrement et de numérisation de nos archives papier. Chacun d’entre vous recevra des boîtes de tri pour conserver uniquement les documents dont la valeur juridique exige un archivage physique. Par ailleurs, le nouveau site comportera des vestiaires avec douches et un vaste stationnement intérieur sécurisé pour les vélos afin d’encourager le transport actif. Je sais que déménager demande un investissement de temps considérable, mais ce nouvel environnement de travail reflète fidèlement les valeurs environnementales que nous défendons.',
      questions: [
        [
          'Quel est l’atout écologique majeur du nouvel édifice selon le gestionnaire ?',
          'Sa certification carboneutre et sa ventilation géothermique',
          'Sa proximité immédiate avec une grande autoroute urbaine',
          'L’absence totale d’ordinateurs et d’écrans dans les bureaux',
        ],
        [
          'Que déduit-on de l’attitude de la direction concernant les transports ?',
          'Elle encourage activement ses employés à adopter le transport actif',
          'Elle oblige tout le personnel à acheter une voiture électrique',
          'Elle supprime le remboursement des titres de transport en commun',
        ],
        [
          'Quelle tâche préparatoire chaque employé doit-il accomplir avant le départ ?',
          'Trier ses dossiers et numériser les documents non essentiels',
          'Démonter soi-même l’ensemble de son mobilier de travail',
          'Peindre les murs de son futur poste de travail au nouveau local',
        ],
      ],
    },
  ],

  // n7-listening-3 (argumentatif)
  // Ex 0: Discussion avec une voisine - réfection des rues du quartier
  // Ex 1: Échange avec un collègue - manifestation dans la ville
  'n7-listening-3': [
    // sc 0 (sit 0): Voisine sur la réfection de la rue Saint-Joseph
    {
      situation: 0,
      text: '— Salut Robert ! Tu as vu le panneau municipal installé au coin de la rue Saint-Joseph ? Les travaux d’excavation pour remplacer les vieilles canalisations d’eau débuteront le premier juin et s’échelonneront sur cinq mois complets. Cinq mois de bruit d’asphalteuse et de détours en pleine saison estivale ! Franchement, la Ville aurait dû attendre la fin de l’automne pour lancer ce chantier chaotique : bloquer le seul axe commercial du secteur en été, c’est de l’incompétence pure ! — Attends un peu, Manon, tempère tes propos. Le rapport des ingénieurs civils mentionnait noir sur blanc que deux bris d’aqueduc majeurs ont inondé des sous-sols l’hiver dernier. Réparer les tuyaux avant l’hiver prochain, c’est une nécessité technique absolue. — C’est peut-être vrai pour la tuyauterie souterraine, Robert, mais ils en profitent pour supprimer vingt places de stationnement afin d’ajouter une piste cyclable ! Les commerçants locaux vont perdre la moitié de leurs clients réguliers, c’est une certitude !',
      questions: [
        [
          'Parmi ces affirmations prononcées par Manon, laquelle exprime une opinion ?',
          'La décision de la Ville relève d’une incompétence pure',
          'Les travaux municipaux débuteront le premier juin prochain',
          'Le chantier est planifié pour une durée de cinq mois consécutifs',
        ],
        [
          'Quelle information factuelle Robert oppose-t-il pour justifier le chantier ?',
          'Des bris de canalisation ont inondé des maisons l’hiver dernier',
          'Les commerçants du secteur réclamaient tous une piste cyclable',
          'Le maire a promis de payer le dédommagement des automobilistes',
        ],
        [
          'Quelle attitude Manon manifeste-t-elle implicitement face au réaménagement ?',
          'Une méfiance profonde envers les projets réduisant la place de l’auto',
          'Un enthousiasme débordant pour l’arrivée des cyclistes dans la rue',
          'Un détachement complet vis-à-vis des difficultés des commerçants',
        ],
      ],
    },
    // sc 1 (sit 0): Voisins discutant de l’apaisement de la vitesse près du parc
    {
      situation: 0,
      text: '— Bonjour Sylvain. La Ville a tenu sa consultation publique hier soir pour présenter le plan de sécurisation autour du parc des Saules. Les policiers ont confirmé que plus de soixante automobilistes par jour dépassent la vitesse maximale autorisée de trente kilomètres à l’heure devant le parc pour éviter le feu de circulation de l’artère principale. La municipalité va donc aménager trois ralentisseurs de vitesse et deux îlots centraux végétalisés d’ici la fin du mois d’août. — Enfin une bonne nouvelle ! Ce quartier devenait un circuit de course automobile intolérable pour les jeunes enfants. Selon moi, ils devraient aussi installer des radars photo permanents et retirer le permis aux récidivistes ! — Du calme, Sylvain, n’exagérons rien. Des ralentisseurs de vitesse, c’est utile pour les piétons, mais ces bosses en béton abîment les amortisseurs des véhicules et ralentissent inutilement les ambulances en cas d’urgence vitale. Les conducteurs ne sont pas tous des criminels en cavale !',
      questions: [
        [
          'Laquelle des déclarations suivantes relève d’un fait objectif vérifié ?',
          'Des automobilistes dépassent quotidiennement la limite autorisée',
          'Le quartier s’est transformé en véritable circuit de course',
          'Les ralentisseurs endommagent toujours les suspensions des autos',
        ],
        [
          'Quelle opinion radicale Sylvain exprime-t-il pendant la discussion ?',
          'La pose de radars et le retrait des permis aux récidivistes',
          'L’interdiction définitive de tous les enfants dans le parc public',
          'La démolition complète des feux de signalisation de la grande artère',
        ],
        [
          'Quelle préoccupation implicite le premier voisin soulève-t-il face aux ralentisseurs ?',
          'L’impact possible sur la vitesse de passage des véhicules de secours',
          'Le coût prohibitif des végétaux plantés dans les îlots centraux',
          'Le manque flagrant de stationnements pour les parents au parc',
        ],
      ],
    },
    // sc 2 (sit 0): Voisins discutant des règles de stationnement d’hiver
    {
      situation: 0,
      text: '— Denis, as-tu pris connaissance du nouveau règlement de stationnement hivernal adopté par l’arrondissement ? Les opérations de déneigement seront désormais signalées uniquement par une alerte sur téléphone cellulaire et un gyrophare orange allumé à chaque intersection dès dix-huit heures. L’arrondissement précise que ce système a permis de réduire les coûts de remorquage de vingt pour cent dans deux villes voisines. — Franchement, ce système numérique est une véritable arnaque pour remplir les coffres de la mairie avec des contraventions salées ! Tout le monde ne passe pas sa soirée les yeux rivés sur son cellulaire, surtout les personnes âgées de notre rue. C’est injuste et discriminatoire pour les aînés. — Denis, le système permet de déblayer les bancs de neige deux fois plus vite au lieu de bloquer toute la rue avec des pancartes métalliques manuelles pendant trois jours d’affilée. C’est mille fois plus moderne que de chercher sa voiture dans une fourrière municipale à l’autre bout de la ville !',
      questions: [
        [
          'Laquelle de ces propositions constitue une information factuelle ?',
          'Le dispositif a fait baisser les frais de remorquage d’un cinquième',
          'Le dispositif numérique est une manœuvre pour enrichir la mairie',
          'La méthode moderne est infiniment supérieure à l’ancien système',
        ],
        [
          'Quelle opinion virulente Denis formule-t-il à l’égard de la nouvelle méthode ?',
          'Le système pénalise injustement les aînés du quartier',
          'Le déneigement devrait être entièrement pris en charge par l’armée',
          'Les alertes téléphoniques devraient être envoyées en pleine nuit',
        ],
        [
          'Quel bénéfice implicite le voisin met-il de l’avant pour défendre la réforme ?',
          'Un gain de rapidité évitant des tracas prolongés de stationnement',
          'La gratuité totale des contraventions pour les résidents du quartier',
          'La fin définitive des hivers froids et enneigés dans la métropole',
        ],
      ],
    },
    // sc 3 (sit 1): Collègues sur une marche pour le logement abordable
    {
      situation: 1,
      text: '— Nadia, étais-tu au centre-ville hier après-midi ? La police a estimé la foule à environ cinq mille manifestants qui ont défilé pacifiquement de la place du Peuple jusqu’au bureau de la ministre responsable de l’Habitation. Les organisateurs du front d’action communautaire demandent l’instauration d’un registre des baux public et universel ainsi que la construction rapide de logements sociaux. — Oui, j’ai vu passer le cortège devant la pharmacie. C’est scandaleux qu’on en soit réduits à bloquer la circulation automobile pour se faire entendre des politiciens ! Selon moi, les élus se moquent éperdument du sort des familles ouvrières et ne protègent que les grands promoteurs immobiliers richissimes ! — Attention aux amalgames, Nadia. Plusieurs députés ont voté une subvention exceptionnelle de cinquante millions de dollars la semaine dernière pour rénover des coopératives. Tout n’est pas tout noir. — Cinquante millions, c’est une goutte d’eau ridicule dans l’océan de la spéculation immobilière actuelle !',
      questions: [
        [
          'Laquelle des assertions formulées au cours du dialogue relève du fait vérifiable ?',
          'Une manifestation pacifique a réuni environ cinq mille personnes',
          'Les politiciens méprisent tous le sort des familles moins nanties',
          'L’argent versé par les députés est une goutte d’eau dérisoire',
        ],
        [
          'Quelle position tranchée Nadia défend-elle au sujet des autorités politiques ?',
          'Elle juge que les dirigeants favorisent les intérêts des promoteurs',
          'Elle considère que la police a fait preuve d’une violence injustifiée',
          'Elle estime que le logement social ne réglera pas les pénuries urbaines',
        ],
        [
          'Quelle intention implicite sous-tend l’intervention du collègue de Nadia ?',
          'Nuancer un jugement trop sévère en rappelant des gestes récents',
          'Convaincre Nadia de ne plus jamais aller manifester dans la rue',
          'Défendre les promoteurs privés contre les coopératives citoyennes',
        ],
      ],
    },
    // sc 4 (sit 1): Collègues sur une grève des transports collectifs
    {
      situation: 1,
      text: '— Patrick, as-tu réussi à venir en bus ce matin ? La société de transport a confirmé que quatre-vingt pour cent des chauffeurs d’autobus exercent une grève de zèle aujourd’hui pour appuyer le renouvellement de leur convention collective échue depuis six mois. Il a fallu une heure et demie pour que mon autobus arrive à l’arrêt habituel. — C’est inacceptable, Antoine ! Ces chauffeurs bénéficient déjà d’une excellente sécurité d’emploi et d’un fonds de pension indexé au coût de la vie. Prendre en otage des milliers de travailleurs honnêtes qui n’ont pas les moyens de se payer une voiture, c’est du chantage pur et simple ! — Écoute, Patrick, il faut aussi entendre leurs arguments : leurs heures supplémentaires obligatoires ont bondi de trente pour cent cette année faute de relève suffisante, et la fatigue au volant menace directement la sécurité des passagers. — Peu importe leurs heures supplémentaires, bloquer les usagers vulnérables pour faire pression sur l’employeur demeure un procédé profondément déloyal à mes yeux !',
      questions: [
        [
          'Laquelle de ces phrases expose une donnée factuelle et non une prise de position ?',
          'La convention de travail des chauffeurs est échue depuis six mois',
          'Le moyen de pression syndical constitue un chantage inacceptable',
          'Le recours à la grève est un procédé profondément déloyal',
        ],
        [
          'Quelle réaction émotionnelle Patrick manifeste-t-il vis-à-vis des grévistes ?',
          'Une indignation vive face aux retards subis par les usagers',
          'Une grande sympathie pour la fatigue accumulée au volant des bus',
          'Une indifférence totale car il utilise uniquement sa bicyclette',
        ],
        [
          'Quel argument implicite Antoine avance-t-il pour justifier la démarche syndicale ?',
          'Le surmenage non résolu met en péril la sécurité du public voyageur',
          'Les chauffeurs de transport collectif souhaitent doubler leur salaire',
          'La société de transport refuse de dialoguer avec les élus municipaux',
        ],
      ],
    },
    // sc 5 (sit 1): Collègues sur une consultation publique relative au tramway
    {
      situation: 1,
      text: '— As-tu regardé les comptes rendus de la commission consultative sur le tramway hier ? Le rapport technique officiel indique qu’une rame de tramway moderne transporte l’équivalent de trois autobus articulés tout en éliminant quinze tonnes de gaz à effet de serre par kilomètre parcouru chaque année. Le tracé de vingt kilomètres desservira deux hôpitaux et les trois principaux campus collégiaux. — Ce projet est peut-être séduisant sur le papier glacé des urbanistes, mais c’est un gouffre financier sans fond pour notre génération ! Dépenser quatre milliards de fonds publics alors que nos urgences hospitalières débordent, c’est une erreur de priorité monumentale. Les élus ont des rêves de grandeur au détriment des services essentiels ! — Mais voyons, sans un réseau ferré moderne et capacitaire, notre ville sera complètement asphyxiée par les bouchons de circulation d’ici dix ans. Investir dans des infrastructures durables, c’est préparer l’avenir au lieu d’agir toujours en pompier à la petite semaine !',
      questions: [
        [
          'Quel élément mentionné dans l’échange relève d’une donnée technique factuelle ?',
          'Une rame équivaut à la capacité de trois autobus articulés',
          'Le projet municipal est une monumentale erreur de jugement',
          'Les politiciens privilégient toujours des rêves de grandeur inutiles',
        ],
        [
          'Quelle conviction personnelle le premier collègue soutient-il avec fermeté ?',
          'Les fonds publics devraient prioritairement être alloués au réseau de la santé',
          'Les autobus actuels polluent beaucoup moins qu’un réseau ferré moderne',
          'Les campus collégiaux ne nécessitent aucun aménagement de transport collectif',
        ],
        [
          'Quel est le sous-entendu implicite du second collègue avec l’image du « pompier » ?',
          'Une approche à court terme ne règle pas les problèmes structurels majeurs',
          'Le service de protection contre les incendies est mal financé par la Ville',
          'Les pompiers devraient participer à la planification des voies ferrées',
        ],
      ],
    },
  ],

  // ===========================================================================
  // NIVEAU 7 - READING
  // ===========================================================================

  // n7-reading-0 (informatif)
  // Ex 0: Activités économiques dominantes dans une région
  // Ex 1: Dépliant publicitaire pour services de courtage immobilier
  'n7-reading-0': [
    // sc 0 (sit 0): Profil économique du Bas-Saint-Laurent
    {
      situation: 0,
      text: 'Le Bas-Saint-Laurent tire sa vitalité économique d’un équilibre remarquable entre ses ressources naturelles traditionnelles et ses créneaux de haute technologie. Bordée par le fleuve Saint-Laurent, la région se distingue historiquement par son secteur agroalimentaire spécialisé en production laitière et en cultures biologiques, ainsi que par une industrie forestière tournée vers la deuxième et troisième transformation du bois d’œuvre. Parallèlement, l’économie maritime s’est profondément modernisée grâce au pôle d’excellence des biotechnologies marines et de la recherche océanographique établi à Rimouski, qui attire des chercheurs du monde entier. Les défis démographiques demeurent néanmoins réels, avec une moyenne d’âge supérieure à la moyenne provinciale. Pour soutenir la croissance de ses entreprises manufacturières et de ses services collectifs, la région multiplie les partenariats d’accueil pour l’immigration régionale et investit dans la numérisation des procédés industriels afin d’optimiser la productivité des équipes en place.',
      questions: [
        [
          'Quels piliers traditionnels structurent l’activité économique de cette région côtière ?',
          'L’agroalimentaire laitier et la transformation du bois',
          'L’extraction du minerai de fer et les chantiers maritimes',
          'L’industrie textile lourde et le raffinage pétrochimique',
        ],
        [
          'Que peut-on déduire de la présence d’un pôle d’océanographie reconnu à Rimouski ?',
          'La région mise sur le savoir scientifique pour innover',
          'Le fleuve est désormais interdit à toute navigation de pêche',
          'Les jeunes diplômés doivent obligatoirement partir à l’étranger',
        ],
        [
          'Quelle stratégie les acteurs locaux déploient-ils pour compenser la démographie vieillissante ?',
          'L’intégration de l’immigration et la modernisation technologique',
          'La fermeture des usines ne trouvant pas immédiatement de main-d’œuvre',
          'L’arrêt définitif des investissements dans les services de santé',
        ],
      ],
    },
    // sc 1 (sit 0): Profil économique de la Mauricie
    {
      situation: 0,
      text: 'Carrefour historique du développement industriel québécois, la Mauricie poursuit avec succès sa transition vers une économie diversifiée et écologique. Si les pâtes et papiers ainsi que l’hydroélectricité ont jadis façonné l’identité des villes riveraines de la rivière Saint-Maurice, la région se positionne aujourd’hui comme la plaque tournante de la filière de l’énergie propre et de l’hydrogène vert. La zone d’innovation de la Vallée de la transition énergétique, implantée entre Shawinigan et Trois-Rivières, suscite des investissements majeurs dans la fabrication de composants pour véhicules électriques et la recherche en stockage énergétique. Cette effervescence industrielle s’appuie également sur un secteur touristique quatre saisons florissant, centré sur le parc national et la mise en valeur du patrimoine naturel. Afin de répondre aux besoins criants de techniciens et d’ingénieurs, les établissements d’enseignement supérieur de la région travaillent étroitement avec les gens d’affaires locaux pour concevoir des formations sur mesure adaptées aux exigences des nouvelles usines.',
      questions: [
        [
          'Dans quel secteur d’avenir la Mauricie investit-elle massivement ses ressources ?',
          'La transition énergétique et l’hydrogène vert',
          'L’extraction pétrolière en haute mer',
          'Le commerce de détail traditionnel en magasin',
        ],
        [
          'Quelle intention implicite sous-tend le partenariat entre écoles et entreprises ?',
          'La formation s’adapte aux nouveaux besoins industriels',
          'Les étudiants n’ont plus besoin de diplôme formel pour travailler',
          'Les universités locales refusent tout financement du secteur privé',
        ],
        [
          'Quel autre secteur d’activité contribue de façon notable à l’économie régionale ?',
          'Le tourisme récréatif axé sur les grands espaces naturels',
          'L’importation massive de produits agricoles manufacturés',
          'La fabrication exclusive de matériel ferroviaire lourd',
        ],
      ],
    },
    // sc 2 (sit 0): Profil économique de la Côte-Nord
    {
      situation: 0,
      text: 'Immense territoire nordique, la Côte-Nord constitue le cœur énergétique et minéral du Québec contemporain. Les grands complexes hydroélectriques de Manicouagan et de la rivière Romaine fournissent une part colossale de l’électricité renouvelable québécoise, alimentant tant le réseau domestique que les exportations. Sur le plan minier, l’exploitation du minerai de fer et les projets d’extraction de minéraux stratégiques attirent des capitaux internationaux substantiels et soutiennent des milliers d’emplois très bien rémunérés. La région développe également une bioéconomie nordique axée sur les petits fruits sauvages et les produits marins d’exception, particulièrement prisés par la haute gastronomie. Toutefois, la dispersion géographique des communautés le long de la route cent trente-huit et le coût élevé du fret logistique constituent des freins persistants au développement. Les gens d’affaires réclament des investissements continus dans les liaisons maritimes et aériennes pour désenclaver les localités isolées et fidéliser les travailleurs qualifiés attirés par les salaires avantageux.',
      questions: [
        [
          'Quelles ressources majeures font la richesse économique principale de la Côte-Nord ?',
          'L’hydroélectricité puissante et le minerai de fer',
          'La viticulture côtière et les céréales d’exportation',
          'L’industrie de l’optique et les technologies financières',
        ],
        [
          'Quel défi structurel implicite découle de la vaste géographie du territoire nord-côtier ?',
          'La complexité et le coût élevé des transports de marchandises',
          'Le refus catégorique des jeunes résidents d’apprendre les métiers miniers',
          'La concurrence féroce des grandes métropoles pour l’accès à l’eau',
        ],
        [
          'Quelle filière originale de niche émerge dans le secteur bioalimentaire régional ?',
          'La valorisation des ressources marines et des petits fruits sauvages',
          'La production en serre chauffée de bananes et de fruits tropicaux',
          'L’élevage intensif de bovins dans des parcs d’engraissement géants',
        ],
      ],
    },
    // sc 3 (sit 1): Dépliant publicitaire pour l’agence Courtage Boréal
    {
      situation: 1,
      text: 'Vous rêvez de vendre ou d’acheter une propriété en toute tranquillité d’esprit ? L’équipe chevronnée de Courtage Boréal vous accompagne à chaque étape de votre démarche immobilière. Forte de plus de vingt ans d’expertise sur le marché résidentiel et commercial québécois, notre agence combine une connaissance intime de vos quartiers avec des outils d’analyse de pointe. Lorsque vous nous confiez votre propriété, nous effectuons une évaluation marchande rigoureuse et déployons une stratégie promotionnelle multiplateforme, incluant la photographie haute définition, la visite virtuelle immersive et une visibilité maximale sur tous les réseaux spécialisés. Nous prenons en charge la validation des déclarations du vendeur, la coordination des visites d’acheteurs sérieux et la négociation serrée des promesses d’achat pour protéger vos intérêts financiers. De la première consultation gratuite jusqu’à la signature officielle chez le notaire, notre engagement demeure absolu : vous offrir un service professionnel irréprochable et transparent.',
      questions: [
        [
          'Quels services promotionnels spécifiques cette agence propose-t-elle aux propriétaires vendeurs ?',
          'Des photos professionnelles et des visites virtuelles',
          'La prise en charge complète des travaux de rénovation',
          'Le paiement intégral des frais de mutation municipale',
        ],
        [
          'Que déduit-on implicitement de l’insistance de l’agence sur la négociation des offres ?',
          'Elle protège ses clients contre de mauvaises conditions de vente',
          'Elle refuse systématiquement toute offre inférieure au prix initial',
          'Elle encourage les acheteurs à se passer d’inspection préachat',
        ],
        [
          'Jusqu’à quelle étape administrative l’accompagnement de l’agence est-il garanti ?',
          'Jusqu’à la signature officielle de l’acte chez le notaire',
          'Jusqu’à l’approbation préliminaire du prêt par l’institution bancaire',
          'Jusqu’à la pose de la pancarte publicitaire sur le terrain vendu',
        ],
      ],
    },
    // sc 4 (sit 1): Dépliant publicitaire pour Immo-Conseil Relocalisation
    {
      situation: 1,
      text: 'Changer de région ou s’installer dans une nouvelle ville représente une formidable opportunité, mais aussi un défi logistique stressant pour toute la maisonnée. Immo-Conseil Relocalisation simplifie votre transition grâce à une formule clé en main personnalisée. Nos conseillers immobiliers agréés débutent par une écoute attentive de vos besoins : proximité des écoles primaires, accessibilité du transport collectif, parcs de quartier ou commerces de proximité. Nous présélectionnons pour vous les résidences correspondant exactement à votre budget, nous organisons des journées de visite optimisées et nous vous guidons dans l’analyse comparative des prix du secteur ciblé. De plus, nous vous mettons en contact avec un réseau vérifié d’arpenteurs, d’inspecteurs en bâtiment certifiés et de conseillers hypothécaires pour sécuriser votre investissement. Que vous cherchiez un duplex avec cour intime, un condo urbain ou une maison unifamiliale de banlieue, faites équipe avec des professionnels attentifs qui placent votre épanouissement au cœur de leur mission.',
      questions: [
        [
          'À quelle clientèle cible cette brochure s’adresse-t-elle principalement ?',
          'Aux ménages en déménagement ou relocalisation régionale',
          'Aux locataires étudiants cherchant une chambre d’urgence',
          'Aux investisseurs institutionnels de gratte-ciel commerciaux',
        ],
        [
          'Quel bénéfice implicite la sélection préalable des propriétés apporte-t-elle aux clients ?',
          'Un gain de temps précieux et une réduction notable du stress',
          'Une garantie formelle que la maison ne demandera aucune dépense future',
          'L’assurance d’obtenir un rabais de cinquante pour cent sur le prix affiché',
        ],
        [
          'Quels spécialistes externes le réseau de l’agence permet-il de consulter ?',
          'Des inspecteurs certifiés et des conseillers hypothécaires',
          'Des architectes d’intérieur spécialisés en mobilier antique',
          'Des déménageurs internationaux pour le transport d’animaux',
        ],
      ],
    },
    // sc 5 (sit 1): Dépliant publicitaire pour Horizon Immobilier Commercial
    {
      situation: 1,
      text: 'Propriétaires d’immeubles locatifs et entrepreneurs dynamiques, découvrez l’excellence d’Horizon Immobilier Commercial. Trouver le local parfait pour ouvrir un commerce de détail, louer un espace de bureaux modernes ou acquérir un bâtiment industriel exige une expertise pointue et une compréhension fine des baux commerciaux québécois. Nos courtiers d’expérience évaluent minutieusement l’achalandage piétonnier, la conformité du zonage municipal, les ratios de stationnement et les perspectives de valorisation à long terme de chaque emplacement. Nous négocions pour nos clients des clauses de bail équilibrées, qu’il s’agisse de périodes d’aménagement sans loyer, d’options de renouvellement flexibles ou de plafonds pour les dépenses d’exploitation communes. Notre vaste réseau d’investisseurs et notre banque exclusive de propriétés commerciales vous garantissent des opportunités de premier plan avant même leur mise en marché publique. Prenez rendez-vous dès aujourd’hui pour concrétiser vos projets d’affaires avec un partenaire stratégique de confiance.',
      questions: [
        [
          'Dans quel secteur d’activité immobilière cette agence se spécialise-t-elle ?',
          'Les locaux commerciaux, les bureaux et les espaces industriels',
          'Les maisons de campagne ancestrales et les chalets de ski',
          'Les logements subventionnés pour les étudiants de premier cycle',
        ],
        [
          'Quelle mise en garde implicite le document formule-t-il au sujet des baux commerciaux ?',
          'Une négociation rigoureuse protège la viabilité financière de l’entreprise',
          'Tous les contrats de location commerciale sont rigoureusement identiques',
          'Le locataire ne peut jamais demander de modifications aux conditions écrites',
        ],
        [
          'Quel avantage exclusif l’agence met-elle en avant grâce à son réseau d’affaires ?',
          'L’accès anticipé à des biens immobiliers avant leur affichage public',
          'La gratuité intégrale des honoraires de courtage pour les propriétaires',
          'L’exemption de toutes les taxes municipales et scolaires pour dix ans',
        ],
      ],
    },
  ],

  // n7-reading-1 (narratif)
  // Ex 0: Récit d’un bénévole au sujet d’une mission humanitaire / communautaire
  // Ex 1: Récit de l’ascension d’une personnalité artistique dans la presse
  'n7-reading-1': [
    // sc 0 (sit 0): Témoignage d’un bénévole en banque alimentaire
    {
      situation: 0,
      text: 'Lorsque j’ai franchi pour la première fois les portes de l’Entraide Populaire de Rosemont un matin de novembre glacial, je n’imaginais pas à quel point cette expérience bénévole allait transformer mon regard sur la ville. Coordonner le tri et la distribution des denrées alimentaires dans notre sous-sol paroissial exigeait une rigueur logistique impressionnante : décharger les caisses de légumes offertes par les marchands solidaires, vérifier la fraîcheur des produits laitiers et préparer plus de deux cents paniers équilibrés pour des familles du quartier. Au-delà des chiffres et des boîtes empilées, ce sont les regards échangés et les confidences discrètes au comptoir qui m’ont profondément marqué. J’y ai rencontré des aînés aux pensions insuffisantes, des parents étudiants jonglant avec deux emplois précaires et de nouveaux arrivants reconnaissants d’échanger quelques mots de français chaleureux. En six mois d’engagement hebdomadaire, j’ai découvert que la véritable solidarité ne se résume pas à distribuer de la nourriture : elle redonne de la dignité et brise l’isolement invisible de nos concitoyens.',
      questions: [
        [
          'Quelle tâche concrète le bénévole devait-il accomplir chaque semaine ?',
          'Trier les denrées et composer des paniers pour les familles',
          'Cuisiner des repas chauds pour les vendre aux passants',
          'Collecter des dons d’argent sur les trottoirs du quartier',
        ],
        [
          'Que déduit-on implicitement de la réflexion finale du bénévole ?',
          'L’aide alimentaire sert aussi de rempart contre l’exclusion sociale',
          'Le bénévolat est une activité trop exigeante pour des travailleurs',
          'La municipalité devrait fermer les organismes communautaires locaux',
        ],
        [
          'Parmi les personnes bénéficiant de l’aide, qui le bénévole cite-t-il explicitement ?',
          'Des aînés, des parents étudiants et de nouveaux résidents',
          'Uniquement des adolescents refusant de fréquenter l’école',
          'Des marchands fortunés venus liquider leurs invendus gâtés',
        ],
      ],
    },
    // sc 1 (sit 0): Témoignage d’une bénévole auprès d’aînés isolés
    {
      situation: 0,
      text: 'Chaque mardi après-midi depuis deux ans, je pousse la porte de la résidence du Bon-Pasteur pour retrouver madame Simone, une dame de quatre-vingt-huit ans au regard pétillant malgré les douleurs de l’arthrite. Notre mission dans le cadre du programme « Paroles Partagées » semblait modeste au départ : tenir compagnie à une aînée pour briser la solitude des longs hivers québécois. Au fil des semaines et des tasses de thé fumant, nos conversations ont pris une tournure inestimable. Simone m’a raconté ses souvenirs de jeunesse dans une ferme du Bas-Saint-Laurent, les veillées dansantes au son de l’accordéon et les bouleversements de la société d’après-guerre. En retour, je lui partageais mes doutes professionnels et les anecdotes de mes études universitaires. Un jour où le moral lui manquait, elle m’a serré doucement la main en me disant que nos rendez-vous étaient sa fenêtre ouverte sur le monde. Ce bénévolat m’a appris que la présence attentive et l’écoute bienveillante constituent les remèdes les plus puissants contre la vulnérabilité humaine.',
      questions: [
        [
          'Quel était l’objectif premier de l’engagement bénévole décrit dans ce récit ?',
          'Offrir une présence régulière pour atténuer l’isolement d’une aînée',
          'Prendre en charge les soins médicaux quotidiens de la résidente',
          'Rédiger une biographie littéraire payante sur la vie agricole',
        ],
        [
          'Que peut-on déduire de la qualité de la relation qui s’est développée ?',
          'Elle est devenue un lien affectif réciproque et réconfortant',
          'Elle s’est détériorée à cause de désaccords politiques majeurs',
          'Elle est restée purement formelle et dénuée de chaleur humaine',
        ],
        [
          'Quels sujets madame Simone aimait-elle évoquer avec sa visiteuse ?',
          'Sa jeunesse à la campagne et les traditions musicales d’antan',
          'Ses récriminations continuelles contre le personnel de la résidence',
          'Les cours d’informatique moderne dispensés par l’université',
        ],
      ],
    },
    // sc 2 (sit 0): Récit d’un bénévole en restauration riveraine
    {
      situation: 0,
      text: 'Le réveil a sonné à cinq heures sous une pluie battante de mai, mais aucun des membres de notre brigade citoyenne n’aurait manqué cette journée d’action sur les berges de la rivière Chaudière. Après les inondations printanières destructrices des années passées, notre organisme de bassin versant avait obtenu le soutien municipal pour replanter deux mille arbustes et arbres indigènes le long des rives dénudées. Les bottes enfoncées dans une glaise tenace, nous avons pelleté, disposé les mottes racinaires et fixé les paillis biodégradables tout au long de la journée sans jamais perdre notre bonne humeur. Chaque saule et chaque cornouiller mis en terre représentait un barrage vivant pour freiner l’érosion future et restaurer l’habitat des poissons. Épuisés mais fiers, nous avons contemplé en fin de journée le rivage transformé sous une éclaircie inattendue. Cette mission m’a prouvé que face à l’ampleur de la crise environnementale, l’action collective de proximité insuffle un espoir concret et réparateur.',
      questions: [
        [
          'Quelle tâche physique précise a mobilisé ce groupe de bénévoles ?',
          'Planter des végétaux indigènes pour consolider le rivage',
          'Construire des digues en béton armé le long de la rivière',
          'Nettoyer les résidus d’huile moteur sur les ponts municipaux',
        ],
        [
          'Que ressent implicitement le narrateur à l’issue de cette journée de travail sous la pluie ?',
          'Une satisfaction profonde d’avoir contribué à la protection du milieu',
          'Un profond regret d’avoir perdu son temps dans des efforts futiles',
          'Une rancœur tenace envers les autorités municipales pour leur absence',
        ],
        [
          'Quel enjeu environnemental récurrent les plantations visent-elles à atténuer ?',
          'L’érosion des berges accentuée par les crues des eaux',
          'La disparition des oiseaux migrateurs nichant dans les toitures',
          'La pollution sonore causée par le passage des embarcations à moteur',
        ],
      ],
    },
    // sc 3 (sit 1): Ascension d’une jeune dramaturge québécoise
    {
      situation: 1,
      text: 'Il y a cinq ans à peine, Marianne Gagnon répétait ses premiers textes dramatiques dans le modeste sous-sol d’un centre communautaire de Jonquière, avec une troupe de comédiens amateurs enthousiastes et un budget dérisoire. Rien ne laissait présager que cette jeune autrice originaire du Saguenay deviendrait si rapidement l’une des voix les plus marquantes du théâtre québécois contemporain. Son premier drame intimiste, qui mettait en scène la fermeture d’une papetière et ses répercussions sur trois générations d’une même famille ouvrière, a captivé le public d’abord dans les festivals régionaux avant d’être repris triomphalement sur une grande scène montréalaise. Saluée par les critiques littéraires pour son sens aiguisé du dialogue authentique et son refus des facilités mélodramatiques, Marianne s’est vu décerner le prestigieux prix de la critique théâtrale à trente ans seulement. Malgré ce couronnement précoce et des invitations en Europe, la dramaturge refuse de quitter sa région natale, où elle puise l’encre puissante de ses pièces populaires.',
      questions: [
        [
          'Quel sujet formait la trame dramatique de la pièce qui a révélé Marianne ?',
          'L’impact social de la fermeture d’une usine de papier',
          'L’aventure romantique d’une jeune reine de la Renaissance',
          'La rivalité sportive entre deux équipes de hockey collégiales',
        ],
        [
          'Que peut-on déduire de son choix persistant de continuer à résider dans sa région ?',
          'Son attachement territorial nourrit directement son imaginaire artistique',
          'Elle refuse catégoriquement que ses œuvres dramatiques soient jouées ailleurs',
          'Elle ne parvient pas à obtenir de permis de séjour pour voyager à l’étranger',
        ],
        [
          'Quelle qualité d’écriture les critiques ont-ils unanimement célébrée chez l’autrice ?',
          'L’authenticité saisissante de ses échanges dialogués',
          'L’usage exclusif d’effets visuels et de projections pyrotechniques',
          'La complexité incompréhensible de ses structures poétiques en vers',
        ],
      ],
    },
    // sc 4 (sit 1): Parcours d’une sculptrice sur bois de Charlevoix
    {
      situation: 1,
      text: 'Dans le silence feutré de son atelier de Baie-Saint-Paul où flotte une odeur persistante de cèdre rouge et d’huile de lin, Isabelle Bouchard façonne patiemment la matière vivante. Fille et petite-fille d’artisans ébénistes, elle a longtemps hésité avant d’embrasser l’art de la sculpture monumentale, un univers alors largement dominé par des figures masculines traditionnelles. C’est en mariant les techniques ancestrales de la gouge avec des formes épurées et semi-abstraites inspirées des falaises de Charlevoix qu’elle a développé un langage visuel unique qui a dérouté le milieu de l’art avant d’enthousiasmer le grand public. Sa consécration est venue lorsque le Musée national des beaux-arts du Québec lui a commandé une œuvre monumentale en chêne blanc pour son grand hall d’accueil. Aujourd’hui courtisée par les grands collectionneurs privés, l’artiste transmet généreusement son savoir-faire à de jeunes apprentis dans son atelier, veillant à ce que la noblesse du travail du bois demeure vivante et novatrice.',
      questions: [
        [
          'Quelle étape prestigieuse a scellé la reconnaissance institutionnelle d’Isabelle ?',
          'Une commande publique pour le hall d’un grand musée national',
          'L’obtention d’un premier prix de peinture classique à Paris',
          'L’ouverture d’une usine de meubles industriels en série',
        ],
        [
          'Que peut-on déduire des débuts de sa démarche artistique singulière ?',
          'Son audace stylistique s’est heurtée à des réticences initiales',
          'Elle a immédiatement fait fortune en reproduisant les meubles de son père',
          'Elle a refusé tout contact avec les autres artistes de son village natal',
        ],
        [
          'Comment l’artiste s’investit-elle auprès de la jeune génération de créateurs ?',
          'En formant personnellement des apprentis à l’atelier',
          'En publiant des manuels de bricolage vendus en pharmacie',
          'En organisant des ventes aux enchères virtuelles chaque semaine',
        ],
      ],
    },
    // sc 5 (sit 1): Récit de la réussite d’une cheffe d’orchestre
    {
      situation: 1,
      text: 'Rien ne prédestinait Clara Tremblay, issue d’un quartier populaire de Chicoutimi, à manier la baguette devant les plus grands ensembles symphoniques du continent. Fascinée par la direction d’orchestre dès l’adolescence après avoir entendu une répétition publique de l’orchestre de son cégep, elle a dû surmonter l’absence de moyens financiers familiaux et le scepticisme d’un milieu musical conservateur. Grâce à une bourse d’excellence décrochée au Conservatoire de musique de Montréal et à une discipline de travail inébranlable, elle a complété sa formation de maître avant d’être nommée cheffe adjointe d’un ensemble réputé. Sa gestuelle expressive et sa relecture audacieuse des partitions des compositeurs québécois du vingtième siècle ont immédiatement soulevé l’enthousiasme du public et des musiciens sous sa direction. Nommée cette année à la tête de l’Orchestre symphonique de l’Estuaire, Clara s’emploie avec ferveur à démocratiser la musique classique en multipliant les concerts gratuits dans les parcs publics et les écoles régionales.',
      questions: [
        [
          'Quel obstacle important la musicienne a-t-elle dû surmonter pour réaliser son rêve ?',
          'Des moyens financiers restreints et un milieu musical frileux',
          'L’interdiction légale pour les jeunes de fréquenter les conservatoires',
          'L’absence totale de professeurs de musique dans sa région d’origine',
        ],
        [
          'Que déduit-on implicitement de sa décision de jouer dans les parcs et les écoles ?',
          'Elle veut désacraliser l’art classique pour le rendre accessible à tous',
          'Elle cherche à remplacer l’ensemble de ses musiciens professionnels',
          'Elle refuse désormais de se produire dans des salles de concert fermées',
        ],
        [
          'Quelle distinction professionnelle Clara Tremblay a-t-elle obtenue récemment ?',
          'La direction principale d’un orchestre symphonique régional',
          'Un poste d’administratrice au ministère des Finances provinciales',
          'Le premier violon au sein d’un quatuor à cordes international',
        ],
      ],
    },
  ],

  // n7-reading-2 (explicatif)
  // Ex 0: Chronique pratique - avantages et inconvénients des fonds de placement
  // Ex 1: Article sur le pour et le contre du télétravail
  'n7-reading-2': [
    // sc 0 (sit 0): Chronique financière sur les fonds négociés en bourse
    {
      situation: 0,
      text: 'Pour les épargnants soucieux de faire fructifier leurs économies sans y consacrer leurs soirées, les fonds négociés en bourse représentent une solution d’investissement populaire. Ces instruments financiers regroupent des centaines d’actions ou d’obligations, offrant une diversification instantanée qui réduit considérablement le risque lié à la défaillance d’une seule entreprise. Leur attrait principal réside dans leurs frais de gestion minimes, souvent dix fois inférieurs à ceux des fonds communs traditionnels vendus par les institutions financières, ce qui préserve une part substantielle de votre rendement à long terme. En contrepartie, ces fonds demeurent pleinement exposés aux fluctuations parfois brutales des marchés boursiers : en cas de récession globale, la valeur de votre portefeuille peut chuter rapidement. Il convient donc d’avoir un horizon de placement d’au moins cinq ans pour absorber les creux économiques sans céder à la panique. Si vous approchez de la retraite, équilibrer votre portefeuille avec des titres à revenu fixe s’avère indispensable pour préserver votre capital.',
      questions: [
        [
          'Quel atout déterminant les fonds indiciels offrent-ils par rapport aux fonds traditionnels ?',
          'Des frais de gestion bien moindres qui bonifient les gains',
          'Une garantie légale contre toute baisse temporaire de valeur',
          'L’absence complète de déclaration de revenus pour les impôts',
        ],
        [
          'Que déduit-on implicitement sur l’attitude requise de l’investisseur face aux baisses du marché ?',
          'Il doit garder son calme et conserver son horizon temporel',
          'Il doit vendre immédiatement toutes ses parts au premier jour de repli',
          'Il devrait retirer son argent pour le conserver en espèces chez lui',
        ],
        [
          'Quelle précaution la chroniqueuse conseille-t-elle à l’approche de la retraite ?',
          'Intégrer des titres plus stables pour amortir la volatilité boursière',
          'Investir l’intégralité de son capital dans des devises étrangères',
          'Souscrire un emprunt bancaire supplémentaire pour spéculer en Bourse',
        ],
      ],
    },
    // sc 1 (sit 0): Chronique pratique sur les coopératives d’habitation
    {
      situation: 0,
      text: 'Face à la flambée des loyers dans les grands centres urbains, adhérer à une coopérative d’habitation suscite un engouement grandissant. Ce modèle sans but lucratif permet d’obtenir un logement décent à un coût mensuel bien inférieur à celui du marché privé, les hausses étant votées démocratiquement par les membres pour couvrir uniquement les frais réels de gestion et d’entretien. La stabilité résidentielle y est remarquable, car aucun locataire ne risque d’être évincé par un propriétaire cherchant à revendre l’immeuble à profit. Toutefois, la vie coopérative comporte des exigences qui ne conviennent pas à tous les tempéraments. Chaque membre s’engage formellement à consacrer quelques heures par mois à des comités d’entretien, de finances ou de sélection, et à participer aux corvées communautaires régulières. Les décisions se prennent lors d’assemblées générales parfois longues où le compromis est de rigueur. Si vous recherchez un simple logement de passage sans aucune implication humaine, ce mode de vie risque de devenir une source d’inconfort mutuel.',
      questions: [
        [
          'Quel bénéfice financier majeur ce modèle locatif garantit-il à ses occupants ?',
          'Un loyer modéré déterminé selon les coûts réels de l’immeuble',
          'La gratuité intégrale des frais de chauffage et d’électricité',
          'Le versement annuel d’un dividende en argent aux locataires',
        ],
        [
          'Quel sous-entendu implicite le texte formule-t-il à propos d’une personne très individualiste ?',
          'Elle s’adaptera difficilement aux devoirs de la vie en coopérative',
          'Elle pourra facilement déléguer ses corvées contre paiement direct',
          'Elle sera immédiatement élue présidente du conseil d’administration',
        ],
        [
          'Quelle obligation particulière incombe à chaque membre habitant dans une coopérative ?',
          'Participer activement à la gestion et aux corvées collectives',
          'Être propriétaire d’au moins une part sociale dans une banque privée',
          'Loger gratuitement des touristes dans son appartement en été',
        ],
      ],
    },
    // sc 2 (sit 0): Chronique pratique sur le régime d’épargne-études REEE
    {
      situation: 0,
      text: 'Le Régime enregistré d’épargne-études constitue un véhicule financier redoutablement efficace pour financer les études postsecondaires d’un enfant. L’avantage incomparable du REEE repose sur les subventions gouvernementales : pour chaque somme versée par les parents, le gouvernement du Canada et celui du Québec ajoutent une bonification qui peut atteindre trente pour cent des cotisations pour les ménages à revenu modeste. De plus, les rendements générés s’accumulent à l’abri de l’impôt jusqu’à l’inscription de l’enfant au cégep ou à l’université. Au moment des retraits, l’impôt est calculé au nom de l’étudiant, dont le revenu personnel est généralement faible ou nul, ce qui rend l’imposition quasi inexistante. Le principal piège consiste à souscrire des régimes collectifs rigides proposés par certains courtiers privés, qui imposent des pénalités financières draconiennes si les cotisations sont interrompues temporairement. Opter pour un régime individuel ou familial auprès d’une institution financière classique offre une souplesse indispensable en cas de revers de fortune passager.',
      questions: [
        [
          'Quelle particularité financière rend le compte d’épargne-études si avantageux ?',
          'L’apport direct de subventions gouvernementales généreuses',
          'L’obligation pour les universités d’admettre l’enfant sans examen',
          'La possibilité de dépenser les fonds pour des achats récréatifs libres',
        ],
        [
          'Que déduit-on implicitement de la mise en garde contre certains régimes collectifs ?',
          'Leurs clauses trop strictes pénalisent les familles en cas d’imprévu',
          'Ils sont réservés aux familles dont les enfants étudient à l’étranger',
          'Ils refusent systématiquement de verser les subventions provinciales',
        ],
        [
          'Pourquoi les sommes retirées pour les études sont-elles si peu imposées ?',
          'L’impôt est imputé à l’étudiant qui a de faibles revenus',
          'Le gouvernement québécois a aboli tout impôt pour les personnes de moins de trente ans',
          'Les retraits d’études sont totalement anonymes pour le fisc',
        ],
      ],
    },
    // sc 3 (sit 1): Analyse des impacts du télétravail à temps plein
    {
      situation: 1,
      text: 'Le passage au télétravail à plein temps a profondément transformé le quotidien de milliers de professionnels. D’un côté, les bénéfices pratiques s’avèrent indéniables : élimination des heures perdues dans les embouteillages matinaux, réduction des dépenses de carburant et de transport collectif, et conciliation simplifiée des responsabilités familiales. De nombreux employés rapportent également une meilleure efficacité pour accomplir des tâches individuelles complexes à l’abri du bruit ambiant des cubicules. D’un autre côté, cette déconnexion physique prolongée comporte des revers insidieux pour la santé organisationnelle. L’isolement professionnel érode progressivement le sentiment d’appartenance et complique l’intégration des nouvelles recrues, qui peinent à s’imprégner de la culture de l’entreprise. Par ailleurs, la frontière entre vie privée et vie professionnelle tend à s’estomper lorsque le bureau s’installe à demeure dans le salon, favorisant l’épuisement professionnel chez les personnes incapables d’éteindre leur ordinateur portable le soir. C’est pourquoi les spécialistes préconisent majoritairement une formule hybride équilibrée.',
      questions: [
        [
          'Quel gain pratique immédiat le télétravail procure-t-il aux travailleurs concernés ?',
          'L’élimination du temps et du coût des déplacements quotidiens',
          'La réduction automatique de la durée hebdomadaire de travail',
          'La prise en charge par l’employeur du loyer résidentiel complet',
        ],
        [
          'Quelle conséquence négative implicite menace les nouveaux employés travaillant à distance ?',
          'Une difficulté accrue à créer des liens et s’intégrer à l’équipe',
          'Une diminution automatique de leur salaire horaire de départ',
          'L’obligation de travailler durant les fins de semaine et les fériés',
        ],
        [
          'Quel compromis les spécialistes du travail recommandent-ils face à ce dilemme ?',
          'Une formule hybride mariant jours au bureau et travail chez soi',
          'Le retour obligatoire au bureau cinq jours par semaine pour tous',
          'L’interdiction définitive de toute messagerie électronique le soir',
        ],
      ],
    },
    // sc 4 (sit 1): Article sur la semaine de travail de quatre jours
    {
      situation: 1,
      text: 'Expérimentée dans plusieurs entreprises québécoises de services et de technologies, la semaine de travail de quatre jours comprimée sans réduction de salaire suscite un vif intérêt. Ses promoteurs mettent en avant des résultats spectaculaires : baisse marquée de l’absentéisme, rétention record des talents et diminution du stress grâce à une fin de semaine prolongée de trois jours qui permet une véritable récupération mentale. Les employés reviennent le lundi avec une énergie renouvelée et une concentration accrue. Cependant, ce modèle n’est pas une panacée universelle et soulève des défis opérationnels complexes. Dans les organisations qui concentrent les quarante heures habituelles sur quatre journées de dix heures, la fatigue physique et intellectuelle en fin de quart de travail peut provoquer une hausse des erreurs d’inattention. De surcroît, pour les secteurs exigeant un service à la clientèle continu du lundi au vendredi, maintenir la couverture horaire requiert des embauches supplémentaires coûteuses ou une planification d’horaires acrobatique qui alourdit la gestion interne.',
      questions: [
        [
          'Quel avantage psychologique majeur les partisans de la semaine de quatre jours soulignent-ils ?',
          'Un repos plus réparateur réduisant le niveau de stress global',
          'La certitude de ne plus jamais devoir accomplir de tâches complexes',
          'La possibilité de cumuler deux emplois à temps plein facilement',
        ],
        [
          'Quel risque implicite guette les employés travaillant dix heures d’affilée par jour ?',
          'Une baisse de vigilance causée par l’épuisement en fin de journée',
          'Un refus d’utiliser les outils technologiques de l’entreprise',
          'Une baisse obligatoire de leur salaire proportionnelle aux heures',
        ],
        [
          'Pourquoi ce modèle pose-t-il un défi logistique aux commerces et services continus ?',
          'Il complique le maintien du service aux clients sans frais d’embauche',
          'Il est formellement interdit par les lois du travail provinciales',
          'Les clients refusent catégoriquement d’être servis par des employés reposés',
        ],
      ],
    },
    // sc 5 (sit 1): Analyse des espaces de travail partagés (coworking)
    {
      situation: 1,
      text: 'Face à la solitude du travail solitaire à la maison, les espaces de cotravail connaissent une expansion fulgurante dans les quartiers urbains et les villes régionales. Ces lieux collectifs offrent aux travailleurs autonomes et aux petites équipes un cadre professionnel stimulant : mobilier ergonomique, salles de visioconférence insonorisées, internet ultrarapide et aires de pause propices au réseautage spontané. Pour bien des indépendants, payer un abonnement mensuel représente un investissement rentable pour rompre l’isolement, stimuler leur créativité et nouer des collaborations d’affaires fructueuses avec d’autres professionnels côtoyés autour de la machine à café. Néanmoins, la vie en cotravail impose des concessions non négligeables. Les bruits de fond constants et les allées et venues peuvent déconcentrer les esprits facilement distraits. De plus, la confidentialité des conversations téléphoniques et la sécurité des données sensibles exigent une vigilance permanente dans ces aires ouvertes. Choisir entre confort domestique et effervescence collective dépend donc étroitement de la nature de vos mandats professionnels.',
      questions: [
        [
          'Quel bénéfice relationnel principal les travailleurs autonomes trouvent-ils en cotravail ?',
          'L’accès à un réseau stimulant brisant la solitude du domicile',
          'La promesse de ne plus jamais payer d’impôt sur le revenu d’affaires',
          'La mise à disposition d’employés administratifs gratuits pour leurs mandats',
        ],
        [
          'Quelle vigilance implicite ce mode de travail ouvert impose-t-il aux usagers ?',
          'Une attention constante à la discrétion des données et des appels',
          'Une obligation de partager la moitié de ses contrats avec ses voisins',
          'L’interdiction de travailler sur un ordinateur sans fil connecté',
        ],
        [
          'Quel inconvénient sonore peut perturber certains professionnels en espace partagé ?',
          'Les bavardages continus et la circulation fréquente des personnes',
          'L’absence totale de toute musique d’ambiance dans les salons',
          'Le silence absolu et oppressant imposé par la direction du lieu',
        ],
      ],
    },
  ],

  // n7-reading-3 (argumentatif)
  // Ex 0: Chronique sur un accident cycliste/auto et aménagement urbain
  // Ex 1: Article sur le végétalisme ou la consommation responsable
  'n7-reading-3': [
    // sc 0 (sit 0): Chronique sur la collision de l’avenue du Mont-Royal
    {
      situation: 0,
      text: 'Mardi matin, vers huit heures quinze, une violente collision est survenue à l’intersection de l’avenue du Mont-Royal et de la rue Saint-Denis. Selon le rapport du Service de police de Montréal, une cycliste de vingt-huit ans circulant en direction est a été heurtée par une camionnette commerciale effectuant un virage à droite sur un feu vert. La cycliste a été transportée d’urgence à l’hôpital pour soigner des fractures multiples au bras et à la clavicule, bien que ses jours ne soient heureusement pas en danger. Cet accident relance un débat houleux. Selon notre chroniqueur, il est inadmissible que la Ville tarde autant à installer des feux de virage exclusifs et des bordures de béton surchargées sur cet axe hautement fréquenté. Peindre de simples lignes blanches au sol pour délimiter les pistes cyclables est une négligence impardonnable face au gabarit écrasant des camions lourds. Si les élus municipaux avaient un réel souci de la vie des usagers vulnérables, ces aménagements protecteurs auraient été réalisés depuis au moins trois ans.',
      questions: [
        [
          'Parmi les énoncés suivants, lequel rapporte un fait objectif vérifié par les autorités ?',
          'La cycliste souffre de traumatismes sérieux aux membres supérieurs',
          'La Ville fait preuve d’une négligence absolument impardonnable',
          'Les élus ne se soucient aucunement de la vie des usagers',
        ],
        [
          'Quelle opinion vigoureuse le chroniqueur défend-il au sujet de la voirie ?',
          'L’installation impérative de séparateurs physiques et de feux dédiés',
          'L’interdiction définitive de tous les vélos sur les artères commerciales',
          'La fermeture complète des pistes cyclables durant les heures de pointe',
        ],
        [
          'Que déduit-on implicitement de la critique des simples lignes blanches peintes ?',
          'Le marquage visuel seul n’offre aucune barrière réelle contre les véhicules',
          'La peinture utilisée par la municipalité coûte beaucoup trop cher aux contribuables',
          'Les automobilistes préfèrent les voies cyclables sans aucun marquage au sol',
        ],
      ],
    },
    // sc 1 (sit 0): Chronique sur la vitesse et la sécurité aux abords des écoles
    {
      situation: 0,
      text: 'Une récente opération de surveillance policière menée devant trois écoles primaires de Lévis a révélé des chiffres alarmants : en deux semaines, cent quarante-cinq contraventions ont été distribuées à des automobilistes roulant à plus de cinquante kilomètres à l’heure dans des zones scolaires balisées à trente. Les données du ministère des Transports indiquent que la probabilité de survie d’un piéton enfant heurté par une automobile chute de quatre-vingt-dix pour cent à cinquante kilomètres à l’heure comparativement à trente. Face à ce constat accablant, notre éditorialiste estime que les campagnes de sensibilisation à la télévision ne servent plus à rien et constituent une dépense stérile de fonds publics. Selon lui, le gouvernement doit rendre obligatoire l’installation de radars photo automatisés à tolérance zéro devant chaque école du Québec et doubler immédiatement le montant des amendes. Traiter des contrevenants récidivistes avec indulgence lorsqu’il s’agit de la sécurité élémentaire de nos tout-petits est une lâcheté politique collective qu’il convient de dénoncer avec la plus grande fermeté.',
      questions: [
        [
          'Laquelle de ces propositions relève d’une information factuelle tirée du texte ?',
          'Cent quarante-cinq constats d’infraction ont été émis en deux semaines',
          'Les campagnes télévisées représentent un gaspillage stérile d’argent',
          'L’attitude des dirigeants face aux contrevenants est une pure lâcheté',
        ],
        [
          'Quelle solution radicale l’éditorialiste préconise-t-il pour régler le problème ?',
          'La pose obligatoire de radars photo automatiques et des amendes doublées',
          'L’embauche de policiers privés financés par les comités de parents d’élèves',
          'La fermeture des cours d’école pour transférer les enfants en périphérie',
        ],
        [
          'Quel raisonnement implicite sous-tend l’argumentation de l’auteur ?',
          'Seules des sanctions financières sévères contraindront les chauffards à ralentir',
          'Les enfants sont les premiers responsables de leur manque d’attention sur la route',
          'La police de Lévis a exagéré le danger pour justifier son quota de contraventions',
        ],
      ],
    },
    // sc 2 (sit 0): Chronique sur la cohabitation trottinettes et piétons
    {
      situation: 0,
      text: 'L’été dernier, la Ville de Québec a déployé un projet pilote de cinq cents trottinettes électriques en libre-service dans les quartiers centraux. Le bilan officiel déposé par les services municipaux fait état de cent vingt mille déplacements enregistrés en quatre mois, mais recense également quarante-trois blessés traités en clinique et plus de trois cents plaintes citoyennes pour des appareils abandonnés au milieu des trottoirs. Ces statistiques confirment nos pires craintes. Notre chroniqueuse affirme sans détour que laisser ces engins motorisés circuler à proximité des piétons relève d’un laxisme urbain intolérable. Selon elle, les trottoirs doivent demeurer des sanctuaires inviolables pour les personnes à mobilité réduite, les aînés et les familles avec poussettes. Tolérer que des usagers circulent à vingt kilomètres à l’heure sur les trottoirs sous prétexte d’écomobilité moderne est une capitulation face aux intérêts mercantiles des multinationales de location. Si les opérateurs privés sont incapables de contraindre leurs clients à respecter les voies de circulation, le projet doit être purement et simplement abrogé.',
      questions: [
        [
          'Laquelle des affirmations suivantes est une donnée factuelle issue du bilan ?',
          'Quarante-trois blessés ont été soignés en clinique durant la période',
          'Le projet de trottinettes relève d’un laxisme urbain intolérable',
          'Les élus ont capitulé devant les intérêts financiers de multinationales',
        ],
        [
          'Quelle opinion la chroniqueuse soutient-elle avec véhémence ?',
          'Les trottoirs doivent être strictement réservés aux piétons sans engin motorisé',
          'La vitesse des trottinettes devrait être augmentée pour fluidifier le trafic',
          'Les municipalités devraient financer l’achat individuel de trottinettes pour tous',
        ],
        [
          'Que déduit-on implicitement de la mise en garde finale de l’autrice ?',
          'Elle souhaite le retrait complet des flottes si les règles ne sont pas appliquées',
          'Elle envisage d’investir des fonds personnels dans une entreprise de trottinettes',
          'Elle préfère que les trottinettes circulent uniquement dans les cours d’école',
        ],
      ],
    },
    // sc 3 (sit 1): Débat sur les repas végétaliens dans les cafétérias scolaires
    {
      situation: 1,
      text: 'Le centre de services scolaire de l’Or-et-des-Bois a récemment adopté une résolution prévoyant qu’un repas du midi par semaine servi dans ses dix écoles secondaires sera entièrement végétalien à compter de la rentrée. Selon les nutritionnistes de la santé publique, cette mesure permettra de réduire l’empreinte carbone des menus collectifs de douze pour cent tout en doublant la consommation de légumineuses chez les adolescents. Si cette initiative semble exemplaire sur le plan écologique, elle suscite une vive controverse chez plusieurs parents. L’éditorialiste du quotidien régional applaudit chaudement cette décision courageuse, affirmant qu’il est temps de libérer nos institutions publiques de la dépendance à la viande industrielle et d’inculquer aux jeunes des habitudes éthiques indispensables pour l’avenir de la planète. En revanche, certains détracteurs y voient un diktat moralisateur inadmissible qui brime la liberté de choix des familles et ignore les traditions culinaires québécoises. Le débat illustre la difficulté de concilier impératifs climatiques et sensibilités culturelles.',
      questions: [
        [
          'Quelle mesure factuelle a été officiellement adoptée par l’organisme scolaire ?',
          'L’instauration d’un dîner végétalien hebdomadaire dans dix écoles',
          'La fermeture définitive des cafétérias scolaires pour des raisons d’économie',
          'L’interdiction complète de toute consommation de viande à la maison',
        ],
        [
          'Quelle opinion favorable l’éditorialiste exprime-t-il vis-à-vis du projet ?',
          'Il s’agit d’un geste éthique courageux pour préserver l’avenir environnemental',
          'Cette mesure permettra d’augmenter de façon spectaculaire les profits de l’école',
          'Les cafétérias scolaires devraient servir uniquement des légumes crus sans cuisson',
        ],
        [
          'Quelle critique implicite les opposants à la mesure mettent-ils de l’avant ?',
          'Ils perçoivent cette imposition comme une atteinte à leur autonomie alimentaire',
          'Ils affirment que les légumineuses sont excessivement toxiques pour la jeunesse',
          'Ils refusent que les élèves apprennent les enjeux du réchauffement climatique',
        ],
      ],
    },
    // sc 4 (sit 1): Débat sur l’interdiction des plastiques à usage unique
    {
      situation: 1,
      text: 'Depuis le premier mars, la Ville de Sherbrooke applique son règlement interdisant les sacs d’emballage en plastique léger, les barquettes en polystyrène et les ustensiles non compostables dans l’ensemble des épiceries et restaurants locaux. Les inspecteurs municipaux ont visité trois cents établissements et relevé un taux de conformité remarquable de quatre-vingt-huit pour cent dès le premier mois. Les écologistes saluent une avancée historique pour préserver la faune aquatique des rivières Magog et Saint-François, où des tonnes de microplastiques s’accumulaient chaque année. Pourtant, la grogne persiste chez plusieurs petits commerçants indépendants. Dans une lettre ouverte percutante, une représentante de restaurateurs dénonce une précipitation dogmatique des autorités qui étouffe les commerces de quartier sous des coûts d’emballage alternatif jusqu’à quatre fois plus chers, en pleine période d’inflation alimentaire. Selon elle, la Ville fait peser la charge morale de la transition écologique sur les petits commerces fragiles plutôt que de s’attaquer aux grands conglomérats industriels qui produisent ces matières polluantes à la source.',
      questions: [
        [
          'Quel résultat factuel a été constaté par les inspecteurs de la ville après un mois ?',
          'Un niveau de conformité des commerces approchant quatre-vingt-huit pour cent',
          'La fermeture immédiate de la moitié des restaurants et des épiceries de la ville',
          'Une disparition totale de tous les déchets polluants dans les rivières locales',
        ],
        [
          'Quelle opinion contestataire la représentante des restaurateurs défend-elle ?',
          'La réglementation impose un fardeau financier inéquitable aux petits commerces',
          'Les emballages en plastique devraient être rendus obligatoires dans chaque foyer',
          'Les rivières de la région ne contiennent en réalité aucune trace de microplastiques',
        ],
        [
          'Quel sous-entendu implicite la porte-parole fait-elle quant aux multinationales ?',
          'Les politiques ciblent les commerces de détail plutôt que les vrais pollueurs à la source',
          'Les fabricants industriels d’emballages devraient être financés par les municipalités',
          'Les grandes entreprises ont déjà aboli tous les polymères de manière exemplaire',
        ],
      ],
    },
    // sc 5 (sit 1): Tribune sur la tarification incitative des déchets résiduels
    {
      situation: 1,
      text: 'La Régie intermunicipale de gestion des déchets a présenté les résultats d’une phase pilote de tarification incitative menée auprès de trois mille ménages volontaires. En équipant les bacs noirs de puces électroniques et en facturant les collectes au-delà de deux vidanges par mois, la municipalité a enregistré une baisse spectaculaire de vingt-cinq pour cent de l’enfouissement et une hausse de quarante pour cent des matières compostées. Cette expérience déclenche des réactions passionnées dans la presse locale. Notre chroniqueur estime que le principe de l’utilisateur-payeur constitue le seul outil fiscal véritablement efficace pour responsabiliser les citoyens gaspilleurs et forcer les ménages à trier leurs restes de table. À l’inverse, une coalition citoyenne s’insurge contre ce qu’elle qualifie de taxe punitive déguisée, affirmant que faire payer les familles nombreuses pour leurs ordures est une mesure injuste qui encourage les dépôts sauvages dans les forêts riveraines. Ce bras de fer illustre la complexité d’instaurer des mécanismes d’économie circulaire acceptables pour tous.',
      questions: [
        [
          'Quelle donnée chiffrée démontre l’efficacité matérielle du projet pilote ?',
          'Une réduction de vingt-cinq pour cent des matières destinées à l’enfouissement',
          'La collecte gratuite de cent pour cent des déchets industriels en forêt',
          'Une économie financière de dix millions de dollars dès la première semaine',
        ],
        [
          'Quelle position favorable le chroniqueur avance-t-il au sujet de ce système ?',
          'La tarification selon l’usage responsabilise concrètement les comportements individuels',
          'Les bacs noirs à puce électronique devraient être interdits dans toute la province',
          'Les familles sans enfant devraient payer la totalité des impôts fonciers municipaux',
        ],
        [
          'Quelle conséquence perverse implicite la coalition citoyenne redoute-t-elle ?',
          'L’abandon illégal de sacs de déchets dans la nature pour éviter la facture',
          'La multiplication incontrôlée des achats d’articles suremballés en magasin',
          'L’arrêt complet de tout tri des matières recyclables dans les bacs bleus',
        ],
      ],
    },
  ],

  // ===========================================================================
  // NIVEAU 8 - SCENARIOS TO BE IMPLEMENTED IN NEXT BATCH
  // ===========================================================================
  // ===========================================================================
  // n8-listening-0 (informatif)
  // Ex 0: Enquête de satisfaction réalisée auprès de la clientèle
  // Ex 1: Tâches du poste souhaité lors d’un entretien d’embauche
  // ===========================================================================
  'n8-listening-0': [
    // sc 0 (sit 0)
    {
      situation: 0,
      text: "Bonjour à toute l’équipe. Je vous présente ce matin la synthèse de notre grande enquête de satisfaction annuelle menée auprès de mille deux cents clients de nos succursales de quincaillerie de l’Estrie. Globalement, l’indice global de recommandation atteint soixante-dix-huit pour cent, ce qui constitue une progression notable de quatre points par rapport à l’exercice précédent. Les répondants ont particulièrement vanté la courtoisie de notre personnel de plancher et l’expertise technique offerte au comptoir des matériaux lourds. Néanmoins, deux irritants récurrents ressortent clairement des commentaires qualitatifs. Tout d’abord, plus de quarante pour cent des usagers déplorent le temps d’attente aux caisses lors des périodes de pointe du samedi matin. Ensuite, le système de commande en ligne pour cueillette à l’auto souffre d’erreurs récurrentes d’inventaire dans plusieurs commerces. Afin de corriger ces lacunes d’ici l’automne, la direction générale a prévu d’accélérer la formation des préposés saisonniers et de déployer un tout nouveau logiciel de gestion des stocks dès le mois prochain.",
      questions: [
        [
          "Quel aspect du service a été le plus favorablement accueilli par la clientèle ?",
          "L’accompagnement compétent des employés en magasin",
          "La rapidité exceptionnelle du passage aux caisses le samedi",
          "La grande disponibilité du stationnement réservé à l’auto",
        ],
        [
          "Que peut-on déduire sur l’attitude de la direction face aux faiblesses signalées ?",
          "Elle réagit promptement en allouant des ressources ciblées",
          "Elle préfère minimiser les plaintes en attendant la saison d’hiver",
          "Elle rejette toute la faute sur les fournisseurs externes",
        ],
        [
          "Quel problème logistique précis les répondants ont-ils souligné ?",
          "Des écarts fréquents dans l’état réel des marchandises disponibles",
          "Une rupture totale dans l’approvisionnement en matériaux lourds",
          "Un manque chronique de camions pour assurer la livraison à domicile",
        ],
      ],
    },
    // sc 1 (sit 0)
    {
      situation: 0,
      text: "Merci d’être là. Voici les faits saillants de l’étude de satisfaction réalisée par notre firme indépendante auprès des usagers de la traverse maritime de Rivière-du-Loup. Sur un échantillon représentatif de huit cents passagers interrogés au cours de la saison estivale, quatre-vingt-cinq pour cent se disent très satisfaits de la ponctualité des départs et des normes de sécurité appliquées à bord des traversiers. En revanche, le volet des réservations numériques essuie des critiques sévères : les pannes répétées du site Web lors de l’ouverture des plages horaires ont suscité une vive frustration chez les familles et les transporteurs routiers. De surcroît, la signalétique à l’embarcadère pour orienter les véhicules récréatifs a été jugée confuse par près de la moitié des conducteurs étrangers à la région. Face à ces constats, nous recommandons de moderniser l’infrastructure d’hébergement web avant la haute saison et de clarifier le balisage routier aux abords immédiats des quais de chargement afin de fluidifier les opérations d’embarquement.",
      questions: [
        [
          "Quelle force principale de la traverse ressort avec clarté du sondage ?",
          "Le respect scrupuleux des horaires annoncés pour les départs",
          "L’accessibilité exemplaire de la nouvelle plateforme de réservation",
          "La clarté parfaite des panneaux routiers à l’embarcadère",
        ],
        [
          "Quelle réaction des voyageurs la défaillance informatique a-t-elle provoquée ?",
          "Un mécontentement marqué face aux blocages numériques",
          "Une annulation massive de toutes les traversées prévues",
          "Un refus catégorique de respecter les consignes à bord",
        ],
        [
          "Quelle intention anime la direction dans les changements recommandés ?",
          "Prévenir les engorgements et fiabiliser les outils en ligne",
          "Augmenter les tarifs de passage pour financer les travaux",
          "Réduire la cadence des traversées en basse saison hivernale",
        ],
      ],
    },
    // sc 2 (sit 0)
    {
      situation: 0,
      text: "Chers collègues, j’ai analysé les résultats du sondage mené auprès des trois mille abonnés de notre réseau d’espaces de travail partagés à Montréal et à Laval. Le niveau de fidélité demeure robuste avec une cote de satisfaction de quatre étoiles et demie sur cinq. Les membres apprécient tout particulièrement la luminosité des bureaux individuels, l’insonorisation des cabines téléphoniques et la vitesse de la connexion à fibre optique. Toutefois, l’enquête révèle un mécontentement grandissant concernant la gestion des aires communes de restauration : le manque de propreté des réfrigérateurs et la pénurie d’ustensiles aux heures du dîner alimentent les frictions quotidiennes. Par ailleurs, plusieurs télétravailleurs estiment que les tarifs mensuels ont progressé plus vite que la qualité globale des équipements ergonomiques fournis. Pour consolider la confiance de notre communauté, nous allons instaurer un protocole de nettoyage renforcé deux fois par jour et réviser les forfaits de location longue durée d’ici le prochain trimestre d’exploitation.",
      questions: [
        [
          "Quel atout matériel recueille un assentiment massif auprès des membres ?",
          "L’efficacité des cloisons acoustiques dans les cabines privées",
          "La gratuité complète de tous les repas servis dans l’espace cafétéria",
          "La baisse continue des frais d’adhésion pour les entreprises",
        ],
        [
          "Que peut-on déduire quant à l’effet des désagréments observés dans la cuisine ?",
          "Ils nuisent à la convivialité et créent des tensions réelles",
          "Ils incitent la majorité des membres à rompre leur contrat",
          "Ils contraignent les usagers à télétravailler depuis leur résidence",
        ],
        [
          "Quelle mesure corrective immédiate l’équipe de gestion compte-t-elle implanter ?",
          "Un accroissement de la fréquence d’entretien des espaces partagés",
          "La fermeture définitive des aires de restauration pour le dîner",
          "L’acquisition immédiate de nouveaux ordinateurs portables pour chacun",
        ],
      ],
    },
    // sc 3 (sit 1)
    {
      situation: 1,
      text: "— Bonjour, monsieur Bélanger. Permettez-moi de vous préciser les responsabilités quotidiennes du poste de coordonnateur en développement durable pour lequel vous postulez. Au sein de notre municipalité régionale de comté dans Lanaudière, votre mandat consistera principalement à accompagner seize municipalités dans l’élaboration de leur plan climat territorial. Vous rédigerez les devis techniques des projets de transition énergétique, vous animerez des séances de consultation publique en soirée auprès des citoyens et vous préparerez les demandes d’aide financière auprès des ministères provinciaux. Le rythme de travail exige une grande polyvalence et une solide aisance relationnelle, notamment lorsqu’il s’agit de concilier des visions divergentes entre les agriculteurs, les commerçants et les groupes écologistes locaux. Nous accordons deux jours de télétravail par semaine, mais vous devrez vous déplacer fréquemment sur le territoire lors des réunions de conseil. Si cette charge de travail s’avère exigeante sur le plan logistique, elle offre une autonomie décisionnelle rare pour une entrée en fonction dans notre organisation municipale.",
      questions: [
        [
          "En quoi consiste la tâche principale liée au mandat proposé ?",
          "Guider les villes locales dans la conception de stratégies climatiques",
          "Assurer la maintenance mécanique des installations solaires municipales",
          "Gérer exclusivement le budget annuel des travaux d’asphaltage urbain",
        ],
        [
          "Quelle exigence particulière découle implicitement de l’animation des réunions citoyennes ?",
          "Savoir négocier avec tact entre des interlocuteurs opposés",
          "Imposer unilatéralement les directives de l’administration",
          "Refuser la parole aux groupes qui contestent les mesures",
        ],
        [
          "Quelle modalité d’organisation du travail est garantie dans ce poste ?",
          "La possibilité d’exercer ses fonctions à distance à temps partiel",
          "L’interdiction absolue de tout déplacement hors du bureau central",
          "Une présence obligatoire au siège régional cinq jours par semaine",
        ],
      ],
    },
    // sc 4 (sit 1)
    {
      situation: 1,
      text: "— Bienvenue, madame Roy. Pour cette fonction d’analyste en cybersécurité au sein de notre coopérative financière à Lévis, vos missions s’articuleront autour de trois axes majeurs. D’abord, vous assurerez la surveillance active des journaux d’événements afin de détecter les anomalies réseau et les tentatives d’intrusion sur nos serveurs transactionnels. Ensuite, vous concevrez des simulations internes d’hameçonnage pour évaluer la vigilance de nos six cents employés et adapter nos ateliers de formation continue. Enfin, en cas de faille avérée, vous rédigerez les rapports post-incident destinés aux autorités réglementaires financières et au comité de direction. Ce rôle nécessite une capacité d’analyse rigoureuse sous pression, car vous participerez à une rotation d’astreinte téléphonique une fin de semaine par mois pour intervenir en cas d’alerte critique. Même si notre environnement technologique est hautement complexe, vous intégrerez une équipe chevronnée qui valorise le partage des connaissances et accorde un budget généreux pour l’obtention de certifications spécialisées chaque année.",
      questions: [
        [
          "Quelle mission préventive figure parmi les tâches de l’analyste ?",
          "Organiser des tests d’attaque fictifs pour former le personnel",
          "Remplacer tous les terminaux de paiement des succursales locales",
          "Installer manuellement les logiciels comptables de la direction",
        ],
        [
          "Quelle attitude est implicitement requise lors des périodes d’astreinte ?",
          "Une disponibilité réactive doublée d’un grand sang-froid",
          "Une indifférence sereine envers l’ensemble des alertes logicielles",
          "Une tendance à déléguer systématiquement aux stagiaires",
        ],
        [
          "Quel avantage professionnel l’institution propose-t-elle à la candidate ?",
          "Un financement régulier pour perfectionner ses compétences",
          "Une dispense totale de toute formation au cours de l’année",
          "Un horaire de travail fixe sans aucune contrainte d’urgence",
        ],
      ],
    },
    // sc 5 (sit 1)
    {
      situation: 1,
      text: "— Bonjour, monsieur Da Silva. Installez-vous confortablement. Comme vous le savez, le poste de gestionnaire de communauté pour notre festival de théâtre émergent à Trois-Rivières requiert un profil dynamique et polyvalent. Votre mandat englobe la gestion quotidienne de nos plateformes numériques, la rédaction d’infolettres percutantes pour nos abonnés et la création de capsules vidéo en coulisses avec les troupes invitées. En période estivale, l’intensité grimpe d’un cran : vous coordonnerez une équipe de huit bénévoles affectés à l’accueil des médias culturels et à la captation des spectacles en plein air. Vous aurez également la responsabilité d’assurer un service à la clientèle courtois en répondant rapidement aux messages du public, y compris en soirée pendant la quinzaine du festival. Nous cherchons quelqu’un doté d’une plume impeccable en français, créatif et capable de conserver son calme en situation d’imprévu technique. En contrepartie, vous jouirez d’une liberté artistique substantielle et d’un accès privilégié à toutes les résidences artistiques de l’année.",
      questions: [
        [
          "Quelle responsabilité directe incombe au candidat durant la période du festival ?",
          "Encadrer un groupe de bénévoles pour appuyer les journalistes",
          "Concevoir la programmation théâtrale complète de la prochaine édition",
          "Négocier les cachets financiers des comédiens internationaux",
        ],
        [
          "Que peut-on déduire sur les contraintes horaires liées à cet emploi ?",
          "Les journées de travail s’étirent souvent lors des représentations",
          "L’horaire s’arrête strictement à dix-sept heures chaque jour ouvrable",
          "Le travail s’effectue uniquement les fins de semaine durant l’automne",
        ],
        [
          "Quel bénéfice d’ordre culturel le poste offre-t-il au gestionnaire engagé ?",
          "Une immersion au cœur des ateliers de création théâtrale",
          "Une gratuité totale pour assister à des concerts de musique pop",
          "Un voyage culturel entièrement défrayé dans une capitale d’Europe",
        ],
      ],
    },
  ],
  // ===========================================================================
  // n8-listening-1 (narratif)
  // Ex 0: Rétrospective du mandat d’un gouvernement sortant lors de la soirée électorale
  // Ex 1: Long-métrage de fiction sur la vie sentimentale de jeunes adultes
  // ===========================================================================
  'n8-listening-1': [
    // sc 0 (sit 0)
    {
      situation: 0,
      text: "— Bonsoir à tous. À l’occasion de cette soirée électorale palpitante, dressons le bilan des quatre années de mandat du gouvernement sortant à l’Assemblée nationale. Arrivée au pouvoir avec la promesse d’un virage audacieux en santé, la coalition ministérielle peut se targuer d’avoir augmenté considérablement le nombre d’infirmières praticiennes spécialisées dans les CLSC et d’avoir enfin décentralisé la gestion des hôpitaux régionaux. Toutefois, la promesse phare d’éliminer l’attente aux urgences urbaines s’est heurtée à une pénurie sans précédent de préposés aux bénéficiaires, provoquant de vives tensions avec les fédérations de médecins. Sur le plan économique, le premier ministre a réussi à attirer des investissements substantiels dans la filière des batteries pour véhicules écologiques à Bécancour. Mais cette réussite industrielle est assombrie par le déficit budgétaire record accumulé, que l’opposition qualifie de dérive gestionnaire. Alors que les premiers bureaux de vote ferment leurs portes, les analystes s’accordent pour dire que l’électorat hésite encore entre la continuité des chantiers entamés et un désir palpable de renouveau démocratique.",
      questions: [
        [
          "Quel accomplissement concret le bilan gouvernemental met-il en lumière en santé ?",
          "Le renforcement du rôle des infirmières spécialisées en clinique",
          "La suppression définitive de tout délai d’attente dans les urgences",
          "La fermeture de plusieurs centres de soins dans les régions éloignées",
        ],
        [
          "Quelle réaction critique des adversaires politiques la gestion financière suscite-t-elle ?",
          "Un reproche véhément visant l’ampleur du déséquilibre des finances",
          "Une contestation légale de l’installation d’usines à Bécancour",
          "Une accusation de fraude électorale envers les membres du conseil",
        ],
        [
          "Quel sentiment général émerge implicitement chez les électeurs à l’heure du scrutin ?",
          "Un tiraillement entre la stabilité acquise et la volonté de changement",
          "Une certitude absolue de reconduire massivement l’équipe en place",
          "Un désintérêt complet pour les questions de santé et d’économie",
        ],
      ],
    },
    // sc 1 (sit 0)
    {
      situation: 0,
      text: "— Nous retrouvons notre correspondant parlementaire pour analyser la trajectoire de l’administration municipale sortante lors de ce scrutin local. Il y a quatre ans, la mairesse avait promis une transformation écologique ambitieuse de la métropole. Les réalisations sont indéniables dans le domaine du transport actif, avec plus de soixante kilomètres de voies cyclables sécurisées aménagées et l’acquisition d’autobus entièrement électriques pour la société de transport. Cependant, le mandat a été durement secoué par la crise du logement abordable, qui a jeté une lumière crue sur la lenteur des chantiers communautaires et la flambée des loyers. De surcroît, la réfection interminable des conduites d’aqueduc au centre-ville a provoqué l’ire des commerçants indépendants, dont plusieurs ont dû déclarer faillite faute d’achalandage piétonnier. Alors que le dépouillement commence, la mairesse sortante joue son avenir politique sur sa capacité à convaincre la population que les perturbations subies portaient la promesse d’une métropole plus résiliente pour les générations à venir.",
      questions: [
        [
          "Quel succès majeur l’administration municipale peut-elle revendiquer ?",
          "L’agrandissement notable du réseau de circulation pour vélos",
          "L’éradication complète de la crise du logement dans la ville",
          "L’achèvement précoce des réparations d’aqueduc au centre-ville",
        ],
        [
          "Que peut-on déduire sur l’attitude des commerçants face aux travaux de réfection ?",
          "Ils nourrissent une rancœur vive nourrie par leurs pertes d’argent",
          "Ils applaudissent la métamorphose paysagère de leurs artères piétonnes",
          "Ils refusent catégoriquement d’accepter les usagers du vélo en magasin",
        ],
        [
          "Quel argument la mairesse tente-t-elle de faire valoir pour persuader les votants ?",
          "Les perturbations subies étaient nécessaires pour préparer l’avenir",
          "Les travaux routiers n’ont occasionné aucun dérangement pour quiconque",
          "Le réseau de transport public sera dorénavant privatisé sans délai",
        ],
      ],
    },
    // sc 2 (sit 0)
    {
      situation: 0,
      text: "— Mesdames et messieurs, bienvenue à notre rétrospective politique consacrée au mandat du gouvernement sortant en matière d’éducation et de culture. Durant les quatre dernières années, l’équipe au pouvoir a injecté des sommes historiques pour moderniser les écoles vétustes et réduire le nombre d’élèves par classe au premier cycle du primaire. Les milieux culturels saluent également l’instauration d’un passeport culturel pour les adolescents, qui a stimulé la fréquentation des musées et des théâtres régionaux. En contrepartie, le déploiement chaotique de la plateforme numérique des services scolaires a suscité une vive fronde des enseignants, dénonçant un outil déficient imposé sans consultation préalable. Sur le front des négociations salariales, la grève historique du personnel de soutien l’automne dernier a laissé des cicatrices profondes dans les communautés scolaires. Au moment où les électeurs rendent leur verdict, le bilan gouvernemental apparaît contrasté : une volonté réformatrice indéniable sur le plan matériel, mais fragilisée par un dialogue social laborieux et souvent conflictuel.",
      questions: [
        [
          "Quelle mesure a été favorablement accueillie dans le secteur de l’enseignement ?",
          "La baisse des effectifs d’enfants dans les classes débutantes",
          "La suppression de toute aide financière aux établissements culturels",
          "L’instauration obligatoire d’un examen unique à l’échelle nationale",
        ],
        [
          "Quel sentiment les enseignants ont-ils exprimé face au nouvel outil informatique ?",
          "Une exaspération partagée causée par un manque de concertation",
          "Une satisfaction enthousiaste devant la simplicité du programme",
          "Une indifférence passive liée à l’utilisation d’autres logiciels",
        ],
        [
          "Que déduit implicitement le journaliste au sujet des relations de travail ?",
          "Les conflits syndicaux ont entamé la confiance du corps professoral",
          "Les augmentations de salaire ont dissipé toute tension avec les écoles",
          "Les écoles ont refusé de fermer leurs portes pendant les mobilisations",
        ],
      ],
    },
    // sc 3 (sit 1)
    {
      situation: 1,
      text: "Dans sa chronique culturelle, Félix commente la sortie en salle du nouveau long-métrage québécois « L’Écho des Marées ». Cette œuvre dramatique met en scène Juliette, une jeune architecte de Rimouski, et Antoine, un photographe animalier revenant d’un long séjour sur la Côte-Nord. Réunis par le mandat de rénover une maison ancestrale au bord du Saint-Laurent, les deux protagonistes nouent une complicité lumineuse qui bascule progressivement vers une liaison passionnée. Cependant, l’intrigue évite habilement les clichés de la romance convenue : la réalisatrice explore avec finesse la peur de l’engagement d’Antoine, hanté par l’échec d’une relation antérieure, et les ambitions professionnelles divergentes de Juliette, tentée par une offre d’emploi prestigieuse à Montréal. Le film captive par son authenticité psychologique, montrant comment les non-dits et le déracinement géographique pèsent sur l’amour à l’aube de la trentaine. La scène culminante sur les battures au crépuscule livre une réflexion poignante sur la nécessité de renoncer à certaines illusions pour grandir ensemble sans étouffer la liberté de l’autre.",
      questions: [
        [
          "Quel prétexte professionnel réunit les deux personnages principaux au début du récit ?",
          "Le projet de restauration d’une demeure patrimoniale sur la rive",
          "L’organisation conjointe d’une exposition de photos à Montréal",
          "L’achat d’un commerce de pêche dans un village de la Côte-Nord",
        ],
        [
          "Quel obstacle personnel freine Antoine dans sa relation naissante avec Juliette ?",
          "Les blessures non résolues laissées par une rupture passée",
          "Le rejet catégorique du milieu de vie maritime de la jeune femme",
          "Le manque d’intérêt total pour les projets d’architecture de celle-ci",
        ],
        [
          "Que peut-on déduire sur l’intention de la cinéaste à travers ce long-métrage ?",
          "Dépeindre les compromis affectifs sans verser dans la facilité romanesque",
          "Présenter une vision idyllique où l’amour triomphe sans aucun sacrifice",
          "Dénoncer l’exode rural des jeunes talents vers les grands centres urbains",
        ],
      ],
    },
    // sc 4 (sit 1)
    {
      situation: 1,
      text: "Ce matin, notre critique cinéma revient sur le long-métrage indépendant « Les Soleils d’Automne », réalisé par une jeune créatrice de Sherbrooke. L’histoire suit trois amis d’enfance, Clara, Samuel et Vincent, qui partagent un appartement dans le quartier ouvrier de Saint-Roch à Québec. Alors que leur groupe paraissait soudé par les souvenirs du cégep et un amour partagé pour la musique indie, l’arrivée inattendue d’un sentiment amoureux vient bouleverser leur bel équilibre. Samuel et Vincent tombent tous deux amoureux de Clara, tandis que cette dernière, tiraillée entre son affection fraternelle pour l’un et son attirance vertigineuse pour l’autre, s’enferme dans le silence pour préserver leur colocation. La caméra capte avec une pudeur remarquable les regards fuyants, les soupers partagés où s’accumulent les malaises et la lente dégradation d’une complicité jadis inaltérable. La fin, tout en nuances et sans dénouement mélodramatique, laisse le spectateur songeur face à cette étape charnière où l’amitié inconditionnelle de la jeunesse doit s’effacer devant les vérités du cœur et les choix d’adultes.",
      questions: [
        [
          "Quel événement déclencheur vient fissurer la cohésion des trois colocataires ?",
          "La naissance de sentiments amoureux rivaux envers leur amie commune",
          "Une dispute financière grave liée au paiement du loyer mensuel",
          "La décision soudaine de Vincent de partir étudier à l’étranger",
        ],
        [
          "Quelle attitude Clara adopte-t-elle face à la tension naissante entre ses amis ?",
          "Elle choisit de se taire pour éviter d’aggraver les divisions",
          "Elle force ses camarades à quitter immédiatement l’appartement",
          "Elle met fin sur-le-champ à toute relation avec les deux garçons",
        ],
        [
          "Que sous-entend la conclusion du film quant au passage à l’âge adulte ?",
          "Les amitiés de jeunesse doivent composer avec des dilemmes sentimentaux",
          "La rupture des liens fraternels découle toujours d’un manque de loyauté",
          "Les relations sentimentales demeurent toujours futiles et secondaires",
        ],
      ],
    },
    // sc 5 (sit 1)
    {
      situation: 1,
      text: "Au microphone de l’émission artistique, nous découvrons aujourd’hui le film « Lignes de Fuite », primé au festival de cinéma de Rouyn-Noranda. Le récit met en scène Sandrine, une traductrice méticuleuse de Gatineau, et Maxime, un paysagiste rêveur rencontré par hasard lors d’un concert dans le Vieux-Hull. Dès leurs premiers rendez-vous, une alchimie singulière opère entre leurs personnalités contrastées : elle incarne la prévoyance et l’organisation rationnelle, tandis qu’il vit au jour le jour, sans plan de carrière ni attache financière. Au fil des saisons, leur union se heurte aux réalités concrètes de la cohabitation et au projet de fonder un foyer. Le cinéaste signe une œuvre vibrante et drôle sur la vulnérabilité émotionnelle, explorant comment deux êtres aux rythmes biologiques et mentaux discordants tentent de négocier un espace commun sans renier leur identité profonde. Porté par des interprètes d’un naturel désarmant, le long-métrage illustre avec justesse les doutes existentiels d’une génération qui refuse de sacrifier ses idéaux personnels au conformisme social.",
      questions: [
        [
          "Quelle différence fondamentale caractérise les deux protagonistes de cette comédie dramatique ?",
          "Leurs rapports diamétralement opposés à la prévoyance quotidienne",
          "Leurs opinions politiques incompatibles lors des élections locales",
          "Leurs désaccords irréconciliables sur l’importance des études d’art",
        ],
        [
          "Quel sentiment les personnages éprouvent-ils au fil de leur cohabitation ?",
          "Une insécurité grandissante face à l’avenir et aux projets communs",
          "Une certitude absolue que leurs différences renforceront leur foyer",
          "Un profond mépris l’un pour l’autre après la première dispute vécue",
        ],
        [
          "Que déduit le chroniqueur au sujet de la génération dépeinte dans cette œuvre ?",
          "Elle cherche à s’épanouir amoureusement sans subir les modèles traditionnels",
          "Elle privilégie systématiquement l’enrichissement matériel avant l’amour",
          "Elle évite toute relation durable afin de préserver une solitude choisie",
        ],
      ],
    },
  ],
  // ===========================================================================
  // n8-listening-2 (explicatif)
  // Ex 0: Explications d’une journaliste sur les enjeux de main-d’œuvre et les solutions des élus
  // Ex 1: Explications d’un gestionnaire sur les causes d’une mésentente avec un client
  // ===========================================================================
  'n8-listening-2': [
    // sc 0 (sit 0)
    {
      situation: 0,
      text: "Ici Isabelle Roy en direct de Roberval pour Le bulletin régional. La pénurie de main-d’œuvre frappe de plein fouet les secteurs manufacturier et forestier du Saguenay–Lac-Saint-Jean, où plus de deux mille postes demeurent vacants. Plusieurs petites entreprises familiales doivent même refuser des commandes lucratives faute d’opérateurs de machinerie lourde et de mécaniciens industriels. Pour freiner cette hémorragie économique, la table des préfets et les mairesses de la région ont dévoilé ce matin un plan d’action concerté comportant trois mesures phares. Premièrement, une enveloppe de trois millions de dollars financera des bourses incitatives destinées aux étudiants collégiaux s’engageant à occuper un emploi dans la région pendant au moins trois ans après leur diplomation. Deuxièmement, les élus s’associent avec Francisation Québec pour offrir des cours de langue sur mesure directement dans les usines aux travailleurs immigrants temporaires. Enfin, un projet pilote de transport collectif intermunicipal reliera les zones industrielles aux municipalités environnantes pour faciliter les déplacements des travailleurs sans permis de conduire.",
      questions: [
        [
          "Quel impact direct le manque de personnel a-t-il sur les entreprises locales ?",
          "L’obligation de décliner des contrats d’affaires rentables",
          "L’arrêt définitif de toutes les activités de coupe en forêt",
          "La faillite immédiate de la majorité des petites usines du coin",
        ],
        [
          "À quelle condition un étudiant peut-il toucher la bourse financière régionale ?",
          "Demeurer en poste sur le territoire pendant une période de trois ans",
          "S’engager à travailler sans rémunération pendant son stage pratique",
          "Obtenir obligatoirement la première place de sa cohorte collégiale",
        ],
        [
          "Quelle intention anime les élus en implantant des cours de français en entreprise ?",
          "Favoriser l’enracinement durable des travailleurs issus de l’immigration",
          "Remplacer le personnel syndiqué par des stagiaires venus de l’étranger",
          "Réduire les salaires octroyés aux personnes qui ne parlent pas la langue",
        ],
      ],
    },
    // sc 1 (sit 0)
    {
      situation: 0,
      text: "Bienvenue à notre dossier économique en direct de Sherbrooke. Dans les Cantons-de-l’Est, c’est le secteur des soins de santé et des services de garde éducatifs qui subit les contrecoups les plus sévères de la pénurie d’employés qualifiés. Près de six cents places en centre de la petite enfance restent fermées, empêchant de nombreux parents, en particulier des mères de famille, de réintégrer le marché du travail. Face à cette impasse, les élus municipaux de la MRC de Memphrémagog ont présenté une stratégie novatrice en collaboration avec le cégep local. D’une part, ils proposent une formation intensive rémunérée en alternance travail-études, permettant aux nouvelles recrues d’acquérir leurs compétences tout en exerçant en salle de classe. D’autre part, pour surmonter l’obstacle majeur de la crise du logement, les municipalités céderont des terrains à prix symbolique afin de construire des coopératives d’habitation réservées en priorité aux travailleurs des services essentiels. Ces initiatives visent à redonner un souffle durable aux familles et aux institutions du réseau.",
      questions: [
        [
          "Quelle conséquence sociale la pénurie d’éducatrices entraîne-t-elle dans la région ?",
          "Le maintien forcé de parents hors de la vie professionnelle",
          "La fermeture complète de tous les centres pédiatriques de l’Estrie",
          "L’expulsion massive des enfants inscrits dans les garderies privées",
        ],
        [
          "Comment le programme collégial facilite-t-il l’apprentissage du métier d’éducatrice ?",
          "En combinant un salaire régulier avec l’acquisition théorique en classe",
          "En exigeant un diplôme collégial de niveau supérieur avant l’embauche",
          "En supprimant tout stage pratique au contact des tout-petits en centre",
        ],
        [
          "Que déduit-on quant à l’attitude des municipalités envers la crise de l’habitation ?",
          "Elles agissent concrètement pour lever le frein lié au coût du logement",
          "Elles refusent d’intervenir dans un secteur relevant du domaine privé",
          "Elles considèrent que le marché immobilier finira par s’ajuster seul",
        ],
      ],
    },
    // sc 2 (sit 0)
    {
      situation: 0,
      text: "À l’antenne régionale de Trois-Rivières, nous faisons le point sur la filière bioalimentaire en Mauricie. Malgré une demande vigoureuse pour les produits du terroir, les maraîchers et les transformateurs laitiers peinent à trouver des journaliers et des techniciens de ligne. La concurrence féroce des grandes usines urbaines, qui offrent des salaires horaires plus élevés, prive les exploitations agricoles de main-d’œuvre locale. Pour inverser la vapeur, les maires des municipalités rurales ont annoncé un partenariat inédit avec la Société de développement économique. Leur plan prévoit des incitations fiscales pour les exploitations qui automatisent les tâches les plus physiques, telles que le tri et l’emballage des récoltes, afin de rehausser l’attrait des postes restants. Parallèlement, un service d’accompagnement clé en main sera offert aux exploitants pour faciliter l’accueil des travailleurs étrangers temporaires, en prenant en charge les démarches administratives de visa et la recherche d’hébergement salubre dans les villages environnants.",
      questions: [
        [
          "Quel facteur nuit particulièrement au recrutement dans le milieu agricole ?",
          "L’attractivité des salaires versés par les usines des grands centres",
          "La chute continue de la demande pour les aliments issus du terroir",
          "L’interdiction légale d’embaucher des employés saisonniers en région",
        ],
        [
          "Quel objectif vise l’automatisation des tâches de conditionnement selon le reportage ?",
          "Alléger la pénibilité du travail pour séduire de nouveaux candidats",
          "Éliminer tous les emplois humains dans les entreprises de Mauricie",
          "Accélérer la vente de produits importés au détriment des récoltes",
        ],
        [
          "Quelle intention se dégage du soutien administratif accordé aux producteurs ?",
          "Simplifier l’embauche internationale pour combler les postes vacants",
          "Bloquer l’arrivée de travailleurs temporaires dans les villages ruraux",
          "Transférer l’entière gestion des fermes sous l’autorité des municipalités",
        ],
      ],
    },
    // sc 3 (sit 1)
    {
      situation: 1,
      text: "— Bonjour à toute l’équipe projet. Je vous ai réunis pour faire le point sur le différend qui nous oppose à notre client, le ministère des Transports, concernant la refonte du portail des usagers. Plusieurs d’entre vous s’interrogent sur les tensions ressenties lors du dernier comité de pilotage. La cause fondamentale de cette mésentente réside dans un écart d’interprétation sur le devis initial. De notre côté, nous avons livré les modules de consultation des horaires conformément au calendrier convenu. En revanche, le client s’attendait à ce que la fonctionnalité de géolocalisation en temps réel des autobus soit incluse dans cette première phase, alors qu’elle ne figurait que dans les options de la deuxième phase contractuelle. De plus, nos retards d’échanges de courriels le mois dernier ont alimenté chez eux le sentiment d’un manque de transparence. Pour désamorcer le litige, j’ai proposé au sous-ministre adjoint d’intégrer un prototype simplifié de géolocalisation sans frais supplémentaires, à condition qu’ils valident sans délai les livrables déjà complétés.",
      questions: [
        [
          "Quelle est l’origine principale du désaccord survenu avec le ministère ?",
          "Une lecture divergente des fonctionnalités prévues dans le premier contrat",
          "Un refus systématique de l’équipe de livrer le moindre module informatique",
          "Une faille de sécurité majeure ayant entraîné la fuite de données d’usagers",
        ],
        [
          "Que peut-on déduire quant à l’attitude du client avant cette mise au point ?",
          "Il éprouvait une méfiance accrue en raison d’un manque de communication",
          "Il était entièrement satisfait de la tournure prise par le développement",
          "Il cherchait délibérément un prétexte pour annuler le projet de portail",
        ],
        [
          "Quelle concession le gestionnaire a-t-il proposée pour régler le litige ?",
          "L’ajout gratuit d’un premier modèle de la fonction de repérage en direct",
          "Le remboursement complet des sommes perçues depuis le lancement des travaux",
          "La prolongation indéfinie du calendrier sans aucune validation du ministère",
        ],
      ],
    },
    // sc 4 (sit 1)
    {
      situation: 1,
      text: "— Merci d’être venus. Comme vous le savez, notre relation d’affaires avec la chaîne de supermarchés Bio-Marché traverse une passe délicate après l’annulation partielle de leur commande de contenants compostables. Je tiens à clarifier ce qui s’est passé. Le nœud du problème découle d’un changement inopiné de fournisseur pour notre résine végétale au mois de mai. Cette matière première de substitution présentait une rigidité légèrement inférieure aux normes spécifiées, ce qui a causé des déformations lors de l’empilement des barquettes dans leurs entrepôts réfrigérés. Au lieu d’aviser nos interlocuteurs immédiatement dès nos premiers essais de moulage, nous avons présumé que la différence demeurerait imperceptible. Le client a naturellement perçu ce silence comme une tentative de dissimulation lorsque leurs gérants de succursale ont signalé les défauts. J’assume pleinement la responsabilité de cette erreur de jugement managériale. Pour réparer le lien de confiance, nous avons réexpédié un lot conforme à nos frais et nous avons instauré un protocole d’inspection tripartite avant toute future expédition.",
      questions: [
        [
          "Quelle défaillance matérielle a causé l’insatisfaction du distributeur ?",
          "Une résistance mécanique insuffisante des barquettes lors du stockage",
          "Une coloration non conforme des emballages lors de la mise en rayon",
          "Une contamination chimique avérée de la résine végétale de base",
        ],
        [
          "Quel comportement de notre direction a suscité la réaction outrée du partenaire ?",
          "L’absence de communication spontanée lors du constat de la variation",
          "Le refus d’utiliser des matières écologiques pour fabriquer les contenants",
          "L’exigence unilatérale d’un paiement anticipé pour toute la production",
        ],
        [
          "Que déduit-on sur la volonté du gestionnaire dans le règlement de la crise ?",
          "Il privilégie la transparence et assume financièrement la réparation",
          "Il rejette l’entière responsabilité sur les employés de l’entrepôt froid",
          "Il menace d’intenter des poursuites en justice contre la chaîne de magasins",
        ],
      ],
    },
    // sc 5 (sit 1)
    {
      situation: 1,
      text: "— Prenez place, collègues. Je souhaite débriefer avec vous l’incident survenu hier avec notre client d’Hydro-Québec à propos de la livraison du rapport d’impact environnemental pour le chantier de La Romaine. La tension a culminé lorsque leur directrice adjointe a menacé de résilier notre contrat de consultation. En fait, le malentendu découle de notre décision unilatérale de modifier l’échéancier pour intégrer des données acoustiques supplémentaires sur la faune aviaire. Si notre intention scientifique était irréprochable, nous avons omis de valider cet ajustement avec leur comité technique. Pour eux, ce retard de trois semaines compromet le dépôt de leur dossier légal auprès du ministère de l’Environnement avant l’ajournement des travaux parlementaires. Ils ont donc interprété notre perfectionnisme méthodologique comme un mépris de leurs impératifs légaux. J’ai rencontré leur équipe ce matin pour leur présenter nos excuses formelles et leur remettre une version préliminaire certifiée qui sécurise leurs démarches réglementaires tout en préservant la rigueur de notre mandat.",
      questions: [
        [
          "Quelle décision de l’équipe a déclenché le conflit avec le donneur d’ordre ?",
          "Le report unilatéral de la date de remise pour ajouter des analyses",
          "La publication non autorisée de photos du chantier sur les réseaux sociaux",
          "La falsification intentionnelle des relevés acoustiques sur les oiseaux",
        ],
        [
          "Pourquoi le retard causé plaçait-il le client dans une situation critique ?",
          "Il menaçait la transmission d’un dossier officiel aux autorités de l’État",
          "Il empêchait l’embauche définitive des ingénieurs affectés aux turbines",
          "Il annulait les subventions fédérales déjà promises pour les chantiers",
        ],
        [
          "Quel sous-entendu implicite le gestionnaire formule-t-il sur l’origine de l’erreur ?",
          "L’excellence technique a primé au détriment de l’écoute des contraintes client",
          "Le client manquait de compétence technique pour comprendre les rapports fournis",
          "L’équipe d’écologistes a volontairement cherché à saboter le projet énergétique",
        ],
      ],
    },
  ],
  'n8-listening-3': [],
  'n8-listening-4': [],
  'n8-reading-0': [],
  'n8-reading-1': [],
  'n8-reading-2': [],
  'n8-reading-3': [],
  'n8-reading-4': [],
}
