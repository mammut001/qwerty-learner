// Échelle québécoise scenarios for Niveau 5 and Niveau 6 indicators.
// Covers both official situations types (examples) for every listening and reading indicator.
// Yields >= 12 distinct texts per indicator across random seeds.
// N5 bounds: 70–110 words (±15% = 60–126 words).
// N6 bounds: 90–140 words (±15% = 77–161 words).

export const N05_06_SCENARIOS = {
  // ===========================================================================
  // NIVEAU 5 - LISTENING
  // ===========================================================================
// n5-listening-0
  // Ex 0: Transmise par une voisine concernant les activités organisées à l’occasion d’une fête de quartier.
  // Ex 1: Donnée au téléjournal concernant une compétition sportive internationale.
  'n5-listening-0': [
    // Scenario 0 (Template, Ex 0): Voisine annonçant la fête de ruelle verte
    Object.assign(
      (rand) => {
        const slots = [
          { lieu: 'dans la ruelle verte', repli: 'au centre communautaire', horaire: 'dix heures', plat: 'un plat cuisiné' },
          { lieu: 'au parc Laurier', repli: 'dans le gymnase de l’école', horaire: 'onze heures', plat: 'une salade fraîche' },
          { lieu: 'sur la place publique', repli: 'dans la salle paroissiale', horaire: 'dix heures et demie', plat: 'un dessert maison' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour ! Est-ce que tu as vu l’affiche pour la fête de quartier de samedi ? Tout le monde se rassemble ${s.lieu} dès ${s.horaire} du matin. Il y aura des jeux gonflables pour les enfants et un dîner partagé le midi. Chaque famille apporte ${s.plat} à partager avec les voisins. Les organisateurs prévoient aussi des ateliers d’artisanat et des musiciens locaux tout l’après-midi. S’il commence à pleuvoir, nous irons tous ${s.repli} juste à côté. J’espère vraiment que tu viendras avec nous !`,
          questions: [
            ['Quel est le sujet principal de cette conversation ?', 'L’organisation d’une fête de quartier', 'La rentrée scolaire des enfants', 'La rénovation d’un parc public'],
            ['Où les participants doivent-ils se rassembler le matin ?', `Ils se rassemblent ${s.lieu}`, 'Ils se retrouvent à l’hôtel de ville', 'Ils vont directement au restaurant'],
            ['Que feront les personnes présentes en cas de mauvais temps ?', `Elles iront ${s.repli}`, 'Elles annuleront complètement la fête', 'Elles rentreront immédiatement chez elles'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Voisine invitant au barbecue des voisins
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Madame Tremblay', activite: 'un concours de tartes aux pommes', heure: 'midi' },
          { nom: 'Madame Bouchard', activite: 'un tournoi amical de pétanque', heure: 'midi et quart' },
          { nom: 'Madame Roy', activite: 'une dégustation de produits régionaux', heure: 'midi et demi' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Marc ! ${s.nom} m’a parlé des activités prévues pour notre journée des voisins ce dimanche. Dès neuf heures, les bénévoles installeront les tables et les chaises sur la rue piétonne. Ensuite, vers ${s.heure}, il y aura un grand repas communautaire et ${s.activite}. Les enfants pourront participer à une chasse aux trésors dans les jardins partagés. En cas d’averse, le comité louera la grande tente municipale pour abriter tout le monde. N’oublie pas d’apporter tes verres réutilisables pour éviter les déchets !`,
          questions: [
            ['De quel évènement les deux personnes parlent-elles ?', 'De la journée annuelle des voisins', 'D’une manifestation sportive locale', 'D’une réunion du conseil municipal'],
            ['Quelle activité spéciale est organisée vers le dîner ?', `${s.activite[0].toUpperCase() + s.activite.slice(1)}`, 'Une vente aux enchères caritative', 'Une projection de film en plein air'],
            ['Que demande-t-on d’apporter pour limiter les déchets ?', 'Des verres réutilisables personnels', 'Des assiettes jetables en carton', 'Des sacs poubelles supplémentaires'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Téléjournal - Championnat de patinage de vitesse
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Québec', pays: 'douze pays', epreuve: 'du cinq cents mètres', athlete: 'Marianne St-Gelais' },
          { ville: 'à Montréal', pays: 'quinze pays', epreuve: 'du mille mètres', athlete: 'Kim Boutin' },
          { ville: 'à Sherbrooke', pays: 'dix pays', epreuve: 'du relais mixte', athlete: 'Florence Brunelle' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Ici Radio-Canada au téléjournal de dix-huit heures. Les Championnats internationaux de patinage de vitesse sur courte piste s’ouvrent officiellement ce soir ${s.ville}. Plus de cent cinquante patineurs représentant ${s.pays} sont arrivés cette semaine pour s’entraîner sur la glace québécoise. L’épreuve très attendue ${s.epreuve} se déroulera samedi après-midi devant une foule nombreuse. Les entraîneurs soulignent l’excellente forme des athlètes canadiens, qui espèrent remporter plusieurs médailles d’or. La finale sera diffusée en direct sur nos plateformes dès quatorze heures. Les billets pour les gradins sont presque tous vendus.`,
          questions: [
            ['Quelle est l’information principale donnée dans ce bulletin ?', 'La tenue d’une compétition internationale de patinage', 'La rénovation d’un complexe sportif régional', 'Le départ d’une équipe olympique pour l’Europe'],
            ['Quelle épreuve spéciale se déroulera samedi après-midi ?', `L’épreuve ${s.epreuve}`, 'L’épreuve du saut en hauteur', 'La course de marathon sur route'],
            ['Que pourront faire les amateurs de sport samedi dès quatorze heures ?', 'Regarder la grande finale en direct', 'Acheter des billets à moitié prix', 'Participer à une séance de dédicaces'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Téléjournal - Tournoi international de ski de fond
    Object.assign(
      (rand) => {
        const slots = [
          { site: 'au Mont-Sainte-Anne', conditions: 'des pistes parfaitement enneigées', jour: 'ce vendredi' },
          { site: 'à la forêt Montmorency', conditions: 'une météo hivernale idéale', jour: 'ce samedi' },
          { site: 'au parc du Mont-Tremblant', conditions: 'une neige fraîche abondante', jour: 'ce dimanche' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Au téléjournal sportif, la Coupe du monde de ski de fond débute ${s.jour} ${s.site}. Les organisateurs confirment ${s.conditions} malgré le redoux du début de semaine. Plus de deux cents compétiteurs étrangers participent aux épreuves individuelles et par équipe. L’équipe canadienne mise particulièrement sur ses jeunes recrues pour monter sur le podium lors du sprint classique. Les spectateurs sont invités à utiliser les navettes gratuites mises en place depuis le centre-ville afin de limiter les embouteillages routiers. Les premières courses commenceront dès neuf heures trente demain matin.`,
          questions: [
            ['Quel évènement sportif fait l’objet de ce reportage ?', 'Une coupe du monde de ski de fond', 'Un championnat de saut à ski extrême', 'Un marathon de patinage de vitesse'],
            ['Quel moyen de transport conseille-t-on aux spectateurs ?', 'Les navettes gratuites d’autobus', 'Le train de banlieue régional', 'Le covoiturage payant en taxi'],
            ['Quand auront lieu les premières courses officielles ?', 'Dès neuf heures trente demain matin', 'En fin d’après-midi après le coucher', 'Lundi matin à l’ouverture des pistes'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Voisine parlant de la vente de garage et kermesse de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { rue: 'la rue Saint-Joseph', cause: 'la maison des jeunes', heure: 'huit heures' },
          { rue: 'la rue Bellechasse', cause: 'le refuge pour animaux', heure: 'huit heures et demie' },
          { rue: 'l’avenue Mont-Royal', cause: 'la banque alimentaire', heure: 'neuf heures' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Julie ! Je voulais te rappeler que la grande fête d’entraide du quartier aura lieu samedi sur ${s.rue}. Les familles installeront leurs kiosques dès ${s.heure} pour la vente d’objets usagés et de livres pour enfants. Tous les profits de la cantine iront directement soutenir ${s.cause}. Les commerçants du secteur offriront aussi du café chaud et des viennoiseries aux bénévoles. S’il pleut trop fort, l’événement sera remis au dimanche suivant à la même heure. Tu penses venir faire un tour avec les petits ?`,
          questions: [
            ['Quel est le but premier de ce rassemblement de quartier ?', 'Une fête solidaire avec vente d’objets', 'Une consultation sur le plan d’urbanisme', 'Une formation pour les nouveaux commerçants'],
            ['À quel organisme seront versés les bénéfices de la cantine ?', `À l’organisme pour ${s.cause}`, 'À une école privée de la métropole', 'À un club sportif professionnel'],
            ['Quelle décision sera prise s’il pleut trop fort samedi ?', 'L’événement sera reporté au dimanche', 'Toutes les activités seront annulées', 'La fête aura lieu dans un centre commercial'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-listening-1
  // Ex 0: Description d’un poste à pourvoir dans l’entreprise où travaille un ami.
  // Ex 1: Description, dans un téléjournal, des conséquences d’une inondation.
  'n5-listening-1': [
    // Scenario 0 (Template, Ex 0): Poste d'adjoint(e) dans une firme de génie
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'd’adjoint administratif', ville: 'à Laval', flex: 'deux jours de télétravail', avantage: 'une assurance collective complète' },
          { titre: 'de commis de bureau', ville: 'à Longueuil', flex: 'trois jours de télétravail', avantage: 'un régime de retraite avantageux' },
          { titre: 'de coordonnateur de projets', ville: 'à Montréal', flex: 'un horaire flexible', avantage: 'quatre semaines de vacances payées' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Patrick ! Tu cherchais un emploi stable ces temps-ci ? Notre firme de génie ${s.ville} recrute justement un poste ${s.titre}. La personne choisie devra répondre aux appels des clients, classer les dossiers techniques et coordonner les réunions hebdomadaires. On offre ${s.flex} par semaine et ${s.avantage} dès l’embauche. L’ambiance dans l’équipe est vraiment chaleureuse et dynamique. Si le poste t’intéresse, tu devrais m’envoyer ton curriculum vitæ avant vendredi midi. Je pourrai le transmettre directement à notre gestionnaire des ressources humaines !`,
          questions: [
            ['Que propose l’ami dans cette conversation ?', `Une offre d’emploi ${s.titre}`, 'Une proposition de formation universitaire', 'Une invitation à un entretien d’embauche'],
            ['Quel avantage lié au poste est expressément mentionné ?', `${s.avantage[0].toUpperCase() + s.avantage.slice(1)}`, 'Une voiture de fonction fournie', 'Un abonnement gratuit à un club de golf'],
            ['Que doit faire la personne intéressée avant vendredi midi ?', 'Transmettre son curriculum vitæ à son ami', 'Passer un test de français en ligne', 'Rencontrer la direction générale'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Poste en service à la clientèle
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'dans une coopérative financière', logiciel: 'notre logiciel interne', min: 'au moins un an d’expérience' },
          { secteur: 'dans une clinique médicale privée', logiciel: 'le portail de gestion des rendez-vous', min: 'un diplôme d’études collégiales' },
          { secteur: 'dans un centre de distribution', logiciel: 'le système de suivi des commandes', min: 'une excellente maîtrise du français' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Sophie ! Je t’appelle parce qu’il y a une belle ouverture de poste ${s.secteur} où je travaille depuis deux ans. Il s’agit d’un emploi à temps plein de représentant au service aux membres. Le travail consiste principalement à répondre aux courriels, traiter les réclamations et utiliser ${s.logiciel}. La direction demande ${s.min}, mais ils offrent deux semaines de formation payée pour les nouveaux arrivants. Le salaire de départ est très compétitif. Dis-moi si tu veux que je dépose ta candidature aujourd’hui !`,
          questions: [
            ['Quel type d’emploi est décrit par la collègue ?', 'Un poste de service à la clientèle', 'Un emploi de mécanicien industriel', 'Un poste de cadre supérieur'],
            ['Quelle exigence de l’employeur est précisée ?', `${s.min[0].toUpperCase() + s.min.slice(1)}`, 'La possession d’un permis de camion', 'La maîtrise de trois langues étrangères'],
            ['Que propose l’amie à la fin de l’appel ?', 'Déposer la candidature de son interlocutrice', 'Lui prêter des manuels de comptabilité', 'Organiser un souper de célébration'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Téléjournal - Inondation printanière rivière des Prairies
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'de Laval-Ouest', maisons: 'plus de cinquante maisons', refuge: 'dans l’aréna municipal' },
          { secteur: 'de Pierrefonds', maisons: 'près de quarante résidences', refuge: 'au centre récréatif local' },
          { secteur: 'de Sainte-Marthe-sur-le-Lac', maisons: 'une soixantaine de logements', refuge: 'dans l’école secondaire' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Au téléjournal de vingt heures, la crue printanière continue de causer de lourds dégâts dans le secteur ${s.secteur}. La rivière est sortie de son lit cet après-midi, inondant les rues riveraines et ${s.maisons}. Les équipes de la sécurité civile et des dizaines de bénévoles ont installé des milliers de sacs de sable le long des berges. Plusieurs familles ont dû être évacuées d’urgence en bateau à moteur et sont actuellement hébergées ${s.refuge}. Les autorités municipales demandent aux automobilistes d’éviter complètement le secteur pour faciliter le travail des premiers répondants.`,
          questions: [
            ['Quel phénomène climatique est décrit dans ce reportage ?', 'Une inondation causée par une crue printanière', 'Une violente tempête de neige tardive', 'Un glissement de terrain le long d’une falaise'],
            ['Où les familles évacuées sont-elles accueillies pour la nuit ?', `Elles sont accueillies ${s.refuge}`, 'Elles dorment dans leurs voitures personnelles', 'Elles ont été transférées dans un hôtel de luxe'],
            ['Quelle consigne les autorités donnent-elles aux automobilistes ?', 'Éviter complètement le secteur touché', 'Aider les pompiers à monter les digues', 'Ralentir leur vitesse de dix kilomètres'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Téléjournal - Inondation Beauce rivière Chaudière
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Saint-Georges', commerces: 'une trentaine de commerces', hauteur: 'un mètre d’eau' },
          { ville: 'à Sainte-Marie', commerces: 'une vingtaine de boutiques', hauteur: 'quatre-vingts centimètres d’eau' },
          { ville: 'à Beauceville', commerces: 'une quarantaine d’entreprises', hauteur: 'plus d’un mètre d’eau' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `En Beauce, la situation demeure critique ${s.ville} en raison de la débâcle hâtive de la rivière Chaudière. D’immenses blocs de glace ont formé un embâcle majeur sous les ponts routiers, refoulant les eaux vers le centre-ville. Les sous-sols sont inondés et ${s.commerces} du boulevard principal ont été envahis par ${s.hauteur}. Les pannes d’électricité préventives touchent actuellement deux mille clients pour éviter tout risque d’incendie. La Croix-Rouge a ouvert un bureau temporaire pour distribuer des repas chauds et des couvertures aux sinistrés évacués depuis ce matin.`,
          questions: [
            ['Quelle est la cause principale de cette inondation soudaine ?', 'Un embâcle de glaces sur la rivière', 'Une rupture soudaine de barrage hydroélectrique', 'Des pluies torrentielles d’été orageuses'],
            ['Quelle conséquence directe touche les commerces du secteur ?', `Ils ont été envahis par ${s.hauteur}`, 'Leurs toits se sont effondrés sous la neige', 'Leurs marchandises ont été pillées la nuit'],
            ['Quelle mesure d’aide la Croix-Rouge a-t-elle mise en place ?', 'Un bureau de distribution de repas et couvertures', 'Une aide financière en argent comptant', 'Un service d’avocats pour réclamer aux assurances'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Poste de technicien en informatique dans un cégep
    Object.assign(
      (rand) => {
        const slots = [
          { cegep: 'au Cégep du Vieux Montréal', taches: 'l’installation des logiciels d’enseignement', horaire: 'trente-cinq heures par semaine' },
          { cegep: 'au Cégep de Sainte-Foy', taches: 'la maintenance des laboratoires informatiques', horaire: 'trente-deux heures par semaine' },
          { cegep: 'au Collège Ahuntsic', taches: 'le dépannage technique des étudiants et professeurs', horaire: 'trente-cinq heures par semaine' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Éric, écoute ça ! Mon département ${s.cegep} vient d’afficher un poste permanent de technicien en soutien informatique. C’est un horaire régulier de ${s.horaire}, du lundi au vendredi. Tes tâches consisteraient à assurer ${s.taches} et configurer les nouveaux équipements réseau. Comme tu as déjà une bonne expérience dans ce domaine, tu as d’excellentes chances. En plus, les conditions de travail dans le réseau public sont superbes : fonds de pension, vacances d’été et journées de maladie payées. Pense à soumettre ton dossier sur le portail d’emploi !`,
          questions: [
            ['De quel emploi l’intervenant fait-il la description ?', 'Technicien en soutien informatique dans un cégep', 'Professeur de littérature au secondaire', 'Conseiller d’orientation pédagogique'],
            ['Quelle est l’une des responsabilités principales mentionnées ?', `${s.taches[0].toUpperCase() + s.taches.slice(1)}`, 'La préparation des repas à la cafétéria', 'La surveillance nocturne des résidences'],
            ['Où l’ami doit-il envoyer son dossier pour postuler ?', 'Directement sur le portail d’emploi du cégep', 'Par la poste au ministère de l’Éducation', 'En personne au bureau du directeur général'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-listening-2
  // Ex 0: Récit d’un séjour à l’étranger relaté par sa collègue.
  // Ex 1: Récit relaté par son voisin sur des incidents survenus lors d’une fête d’enfants.
  'n5-listening-2': [
    // Scenario 0 (Template, Ex 0): Séjour au Pérou / Costa Rica relaté par une collègue
    Object.assign(
      (rand) => {
        const slots = [
          { pays: 'au Pérou', duree: 'trois semaines', defi: 'l’altitude dans les montagnes des Andes', activite: 'la visite de villages traditionnels' },
          { pays: 'au Costa Rica', duree: 'deux semaines', defi: 'la chaleur humide dans la jungle tropicale', activite: 'l’observation des animaux sauvages' },
          { pays: 'en Colombie', duree: 'trois semaines', defi: 'les longs trajets sur les routes de montagne', activite: 'la découverte de plantations de café' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Jean ! Je reviens tout juste de mon voyage de ${s.duree} ${s.pays}. C’était une expérience absolument inoubliable ! Ce qui m’a le plus marquée, c’est ${s.activite} et l’immense gentillesse des gens locaux. Par contre, le début du séjour a été un peu difficile à cause de ${s.defi}. Les premiers jours, j’étais épuisée et j’avais du mal à marcher longtemps. Heureusement, en buvant beaucoup d’eau et en me reposant l’après-midi, j’ai vite retrouvé mon énergie. Je te montrerai mes photos pendant notre pause de dîner si tu veux !`,
          questions: [
            ['Quel est le thème principal de ce récit ?', `Le séjour de vacances de la collègue ${s.pays}`, 'Un voyage d’affaires pour signer des contrats', 'Un déménagement permanent en Amérique du Sud'],
            ['Quelle difficulté la voyageuse a-t-elle rencontrée au début ?', `${s.defi[0].toUpperCase() + s.defi.slice(1)}`, 'La perte de tous ses bagages à l’aéroport', 'Le vol de son passeport et de son argent'],
            ['Que propose la collègue à la fin de leur discussion ?', 'Lui montrer ses photos de voyage pendant la pause', 'Lui vendre ses guides touristiques usagés', 'L’inviter à partir avec elle l’année prochaine'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Séjour linguistique / culturel au Portugal
    Object.assign(
      (rand) => {
        const slots = [
          { pays: 'au Portugal', ville: 'de Lisbonne', logement: 'chez une famille chaleureuse', transport: 'le tramway historique' },
          { pays: 'en Espagne', ville: 'de Séville', logement: 'dans une auberge de jeunesse conviviale', transport: 'le vélo en libre-service' },
          { pays: 'en Italie', ville: 'de Bologne', logement: 'dans un petit appartement d’étudiant', transport: 'les trains régionaux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as passé de belles vacances, Carole ? — Oui, vraiment fantastiques ! Je suis partie un mois complet ${s.pays} pour suivre des cours de langue. J’habitais ${s.logement} dans le centre ${s.ville}. Tous les matins, je prenais ${s.transport} pour aller à l’école. Au début, j’avais peur de ne pas comprendre les accents régionaux, mais après deux semaines, j’arrivais déjà à commander au marché et à discuter avec les marchands. Le plus dépaysant, c’était le rythme de vie : les soupers tardifs et les longues promenades en soirée au bord de l’eau.`,
          questions: [
            ['Pourquoi Carole est-elle partie à l’étranger pendant un mois ?', 'Pour suivre des cours de langue et découvrir le pays', 'Pour trouver un emploi permanent en Europe', 'Pour participer à une compétition sportive'],
            ['Où habitait-elle pendant toute la durée de son séjour ?', `Elle logeait ${s.logement}`, 'Dans une chambre d’hôtel quatre étoiles', 'Chez des collègues de son entreprise'],
            ['Quel aspect culturel a particulièrement surpris Carole ?', 'Le rythme de vie avec des soupers tardifs', 'Le climat beaucoup trop froid pour la saison', 'L’absence de transport collectif dans la ville'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Fête d'enfants avec incident du château gonflable
    Object.assign(
      (rand) => {
        const slots = [
          { enfant: 'mon fils Lucas', age: 'sept ans', incident: 'le château gonflable s’est dégonflé d’un coup', repli: 'au salon pour faire des jeux de société' },
          { enfant: 'ma fille Maya', age: 'six ans', incident: 'une bourrasque de vent a emporté le chapiteau', repli: 'au sous-sol pour regarder un film d’animation' },
          { enfant: 'mon neveu Léo', age: 'huit ans', incident: 'le gâteau d’anniversaire est tombé par terre', repli: 'dans la cuisine pour improviser des crêpes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Sylvain ! Tu as l’air fatigué ce matin, tout s’est bien passé en fin de semaine ? — Ouf, ne m’en parle pas ! On organisait la fête d’anniversaire pour ${s.enfant} qui fêtait ses ${s.age}. On avait invité dix enfants dans la cour. Tout allait bien jusqu’à ce que ${s.incident} ! Heureusement, personne ne s’est fait mal, mais les enfants ont poussé de grands cris. Pour sauver la journée, on a tout rentré ${s.repli}. Finalement, ils ont ri comme des fous et ils sont repartis avec le sourire. Mais moi, j’ai mis deux jours à m’en remettre !`,
          questions: [
            ['Quel événement le voisin raconte-t-il dans cet extrait ?', 'Une fête d’anniversaire d’enfant mouvementée', 'Un déménagement familial imprévu', 'Une panne d’électricité dans son quartier'],
            ['Quel incident imprévu a perturbé l’activité extérieure ?', `${s.incident[0].toUpperCase() + s.incident.slice(1)}`, 'Une invasion de guêpes sur la nourriture', 'Une coupure générale d’eau courante'],
            ['Comment les adultes ont-ils sauvé la fin de la fête ?', `En rentrant les enfants ${s.repli}`, 'En renvoyant immédiatement chaque enfant chez lui', 'En commandant une dizaine de pizzas d’urgence'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Fête d'enfants avec incident de l'animateur en retard
    Object.assign(
      (rand) => {
        const slots = [
          { animateur: 'le magicien professionnel', retard: 'une heure de retard', activite: 'un atelier de maquillage pour le visage' },
          { animateur: 'le clown acrobate', retard: 'quarante minutes de retard', activite: 'un concours de danse et de statues musicales' },
          { animateur: 'l’éducateur scientifique', retard: 'trois quarts d’heure de retard', activite: 'une chasse aux trésors dans tout le sous-sol' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu ne devineras jamais ce qui est arrivé samedi chez nous ! On attendait douze enfants pour la fête de notre petite dernière. On avait réservé ${s.animateur}, mais il a eu ${s.retard} à cause d’un pneu crevé sur l’autoroute. Imagine l’angoisse avec douze petits qui courent partout en criant ! Mon conjoint et moi avons dû improviser ${s.activite} en catastrophe pour les occuper. Quand l’artiste est enfin arrivé, tout est rentré dans l’ordre et le spectacle était formidable. Les enfants n’ont même pas remarqué qu’il y avait eu un pépin !`,
          questions: [
            ['Quel problème principal a déclenché le stress des parents ?', `L’animateur prévu a eu ${s.retard}`, 'Le four de la cuisine s’est éteint soudainement', 'La moitié des invités ont annulé leur présence'],
            ['Quelle solution d’urgence les parents ont-ils improvisée ?', `${s.activite[0].toUpperCase() + s.activite.slice(1)}`, 'Ils ont laissé les enfants jouer aux jeux vidéo', 'Ils ont emmené tout le monde au parc public'],
            ['Quelle a été la réaction finale des enfants invités ?', 'Ils ont adoré le spectacle sans remarquer le problème', 'Ils ont pleuré et réclamé leurs parents', 'Ils sont partis déçus avant la fin de l’après-midi'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Séjour de randonnée dans les Rocheuses canadiennes
    Object.assign(
      (rand) => {
        const slots = [
          { parc: 'dans le parc de Banff', transport: 'une caravane louée', souvenir: 'la couleur turquoise des lacs glaciaires' },
          { parc: 'dans le parc de Jasper', transport: 'une camionnette aménagée', souvenir: 'la rencontre avec une harde de wapitis' },
          { parc: 'dans les parcs de Yoho et Kootenay', transport: 'une petite tente de camping', souvenir: 'les sommets enneigés au lever du soleil' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Martin ! Je voulais te raconter notre périple de dix jours ${s.parc}. On voyageait avec ${s.transport}, ce qui nous permettait de dormir en pleine nature chaque soir. Ce qui restera gravé dans ma mémoire, c’est ${s.souvenir}. Par contre, on a dû composer avec des nuits très fraîches : il a gelé deux fois au mois d’août ! Il fallait allumer le réchaud dès six heures du matin pour réchauffer le café et dégeler nos souliers de marche. Mais l’effort en valait tellement la peine. C’est le plus beau voyage de ma vie !`,
          questions: [
            ['Où la collègue et son compagnon ont-ils passé leurs dix jours ?', `Dans un grand parc naturel de l’Ouest canadien`, 'Dans les grandes villes de la côte Est américaine', 'Dans une station balnéaire du sud du Mexique'],
            ['Quelle météo inattendue a surpris les randonneurs en août ?', 'Des nuits très fraîches avec du gel au sol', 'Des pluies torrentielles pendant sept jours', 'Une canicule étouffante sans aucun vent'],
            ['Quel moyen d’hébergement itinérant utilisaient-ils ?', `Ils se déplaçaient et dormaient dans ${s.transport}`, 'Ils louaient des chambres d’hôtel en ville', 'Ils séjournaient dans des auberges luxueuses'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-listening-3
  // Ex 0: Explications sur la décision d’une proche d’accepter une offre de travail à temps partiel.
  // Ex 1: Explications sur la décision de son propriétaire d’interdire les animaux dans le bâtiment.
  'n5-listening-3': [
    // Scenario 0 (Template, Ex 0): Décision d'accepter un temps partiel pour finir ses études
    Object.assign(
      (rand) => {
        const slots = [
          { soeur: 'Ma sœur Clara', domaine: 'dans une librairie de quartier', heures: 'vingt heures par semaine', etudes: 'son certificat universitaire en rédaction' },
          { soeur: 'Ma cousine Émilie', domaine: 'dans une boulangerie artisanale', heures: 'vingt-cinq heures par semaine', etudes: 'son diplôme d’études professionnelles' },
          { soeur: 'Ma conjointe Laurence', domaine: 'dans un centre communautaire', heures: 'dix-huit heures par semaine', etudes: 'sa maîtrise en travail social' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as des nouvelles de Clara ? — Oui ! ${s.soeur} a finalement décidé d’accepter l’offre d’emploi à temps partiel ${s.domaine}. Elle travaillera ${s.heures}, principalement les jeudis et vendredis. Même si le salaire total est moins élevé qu’un temps plein, c’était le compromis idéal pour terminer ${s.etudes}. Son employeur lui garantit des horaires stables et accepte d’aménager son horaire pendant ses examens de fin de session. Elle se sent tellement soulagée d’avoir pris cette décision après avoir hésité pendant des semaines !`,
          questions: [
            ['Quelle décision professionnelle est expliquée ici ?', 'L’acceptation d’un emploi à temps partiel', 'Le refus d’une promotion dans son entreprise', 'La démission immédiate sans nouvel emploi'],
            ['Pourquoi ce poste à temps partiel convient-il particulièrement ?', `Pour lui permettre de terminer ${s.etudes}`, 'Pour lui donner le temps nécessaire de voyager en Europe', 'Parce qu’elle préfère consacrer ses temps libres au bénévolat'],
            ['Quel avantage l’employeur lui accorde-t-il pendant les examens ?', 'Des horaires aménagés pendant la fin de session', 'Une prime financière pour payer ses frais de cours', 'La possibilité d’amener ses livres au travail'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Temps partiel pour s'occuper d'un enfant
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Nadia', metier: 'de designer graphique', jours: 'trois jours par semaine', raison: 'passer plus de temps avec son bébé' },
          { amie: 'Camille', metier: 'de comptable adjointe', jours: 'quatre jours par semaine', raison: 'concilier sa vie de famille et ses cours' },
          { amie: 'Julie', metier: 'de rédactrice de contenu', jours: 'trois jours par semaine', raison: 'prendre soin de sa mère convalescente' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— J’ai discuté avec ${s.amie} hier soir. Elle m’a expliqué pourquoi elle a choisi un contrat à temps partiel comme ${s.metier}. L’entreprise lui offrait un poste régulier de quarante heures, mais elle a insisté pour faire seulement ${s.jours}. Sa priorité absolue cette année, c’est de ${s.raison}. Elle a calculé son budget de manière serrée et a constaté qu’en réduisant certaines dépenses de loisir, elle pouvait très bien vivre ainsi. Elle préfère avoir du temps de qualité plutôt que d’accumuler du stress au quotidien.`,
          questions: [
            ['Quel compromis l’amie a-t-elle choisi pour sa vie professionnelle ?', 'Réduire son horaire de travail à temps partiel', 'Prendre deux emplois différents en même temps', 'Faire des heures supplémentaires chaque soir'],
            ['Quelle raison principale motive son choix d’horaire ?', `${s.raison[0].toUpperCase() + s.raison.slice(1)}`, 'Une obligation légale imposée par son contrat', 'Un refus catégorique de payer des impôts'],
            ['Comment a-t-elle adapté son quotidien pour compenser la baisse de salaire ?', 'En calculant son budget et réduisant des loisirs', 'En empruntant de l’argent à ses parents', 'En vendant sa maison pour vivre en colocation'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Propriétaire interdisant les animaux dans le bloc
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Monsieur Gagnon', motif: 'les aboiements constants dans les corridors', degat: 'les planchers de bois franc égratignés' },
          { proprio: 'Monsieur Lavoie', motif: 'les plaintes de bruit et les allergies graves', degat: 'les tapis des aires communes très sales' },
          { proprio: 'Monsieur Tremblay', motif: 'le non-respect de la tranquillité des voisins', degat: 'les boiseries des portes d’entrée grugées' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as reçu la circulaire de ${s.proprio} ? — Oui, il nous a envoyé une longue lettre pour expliquer sa décision d’interdire les chiens et chats dans tous les nouveaux baux. Il explique que depuis l’hiver dernier, plusieurs locataires se sont plaints de ${s.motif}. De plus, lors du départ des anciens occupants du troisième étage, il a constaté ${s.degat}. Pour préserver la valeur de son immeuble et la quiétude des résidents, il a donc décidé de resserrer le règlement. Heureusement, les animaux déjà présents sont tolérés jusqu’à la fin des baux actuels.`,
          questions: [
            ['Quelle décision le propriétaire d’immeuble a-t-il prise ?', 'Interdire les animaux pour les futurs locataires', 'Augmenter le prix du loyer de vingt pour cent', 'Fermer l’immeuble pour des rénovations majeures'],
            ['Quel dommage matériel dans un logement a motivé cette décision ?', `${s.degat[0].toUpperCase() + s.degat.slice(1)}`, 'Des vitres de fenêtres complètement cassées', 'Une tuyauterie de salle de bain démolie'],
            ['Qu’arrive-t-il aux animaux des personnes qui habitent déjà là ?', 'Ils sont tolérés jusqu’à l’échéance du bail actuel', 'Ils doivent être immédiatement donnés à un refuge', 'Leurs propriétaires doivent payer une amende mensuelle'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire de copropriété interdisant les gros chiens
    Object.assign(
      (rand) => {
        const slots = [
          { organisme: 'le syndicat de copropriété', poids: 'plus de vingt livres', vote: 'à la majorité des deux tiers' },
          { organisme: 'le comité de gestion de l’immeuble', poids: 'plus de quinze kilos', vote: 'à l’unanimité des membres' },
          { organisme: 'la société de gestion immobilière', poids: 'de grande taille', vote: 'lors de l’assemblée générale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— J’ai assisté à la rencontre hier soir avec ${s.organisme}. La direction a expliqué en détail pourquoi le règlement interdit désormais les chiens de ${s.poids}. Cette règle a été adoptée ${s.vote} après deux incidents récents où des résidents âgés ont eu peur dans les ascenseurs. Les gestionnaires ont rappelé que les bruits de pas sur les parquets flottants créent trop d’irritation entre voisins de palier. Seuls les petits animaux de compagnie silencieux restent acceptés. Les propriétaires d’animaux actuels ont reçu un formulaire d’enregistrement obligatoire avant le premier mai.`,
          questions: [
            ['Quelle est la décision adoptée lors de la réunion de gestion ?', `L’interdiction des chiens pesant ${s.poids}`, 'L’interdiction complète de fumer sur les balcons', 'L’obligation de changer les serrures de porte'],
            ['Quelle situation a particulièrement poussé à prendre cette décision ?', 'Des résidents âgés effrayés dans l’ascenseur', 'Une morsure grave nécessitant une ambulance', 'La destruction des jardins extérieurs du complexe'],
            ['Que doivent faire les résidents qui possèdent déjà un animal ?', 'Remplir un formulaire officiel avant le premier mai', 'Payer une taxe spéciale à la ville de Montréal', 'Faire vacciner leur animal chez un vétérinaire précis'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Refus d'une offre à temps plein pour préserver la santé
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc', employeur: 'une agence de publicité', heures: 'vingt-quatre heures', raison: 'éviter l’épuisement professionnel' },
          { collegue: 'Simon', employeur: 'un cabinet de consultants', heures: 'vingt heures', raison: 'garder du temps pour ses projets créatifs' },
          { collegue: 'Benoît', employeur: 'un laboratoire médical', heures: 'vingt-huit heures', raison: 'prendre soin de sa santé fragile' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as su pour ${s.collegue} ? ${s.employeur[0].toUpperCase() + s.employeur.slice(1)} lui offrait un poste permanent à temps plein avec un salaire alléchant. Mais après mûre réflexion, il a décliné l’offre complète pour négocier un horaire de ${s.heures} par semaine. Il m’a confié que son but principal était de ${s.raison}. Il avait vécu un épisode difficile il y a deux ans et il ne voulait absolument pas retomber dans le même piège de surcharge de travail. Son employeur a heureusement accepté sa proposition, car ses compétences techniques sont indispensables pour l’équipe.`,
          questions: [
            ['Pourquoi le travailleur a-t-il refusé le poste à quarante heures ?', `Pour ${s.raison} avec un temps partiel`, 'Pour partir vivre six mois à la campagne', 'Parce qu’il a trouvé un salaire plus élevé ailleurs'],
            ['Combien d’heures de travail par semaine a-t-il négociées ?', `Un horaire de ${s.heures} par semaine`, 'Un horaire de dix heures par semaine', 'Un horaire de trente-cinq heures par semaine'],
            ['Quelle a été la réponse finale de l’employeur ?', 'Il a accepté la proposition de temps partiel', 'Il a immédiatement mis fin à son contrat', 'Il lui a demandé de chercher un autre employeur'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-listening-4
  // Ex 0: Suivre la procédure d’envoi de documents à l’interne formulée par une collègue.
  // Ex 1: Suivre la procédure donnée par son colocataire pour effectuer le paiement du loyer à partir d’une application mobile.
  'n5-listening-4': [
    // Scenario 0 (Template, Ex 0): Procédure d'envoi de documents de dépenses
    Object.assign(
      (rand) => {
        const slots = [
          { doc: 'tes reçus de dépenses', onglet: 'Comptabilité et finances', format: 'en format PDF', delai: 'avant le vingt de chaque mois' },
          { doc: 'tes feuilles de temps', onglet: 'Ressources humaines', format: 'en fichier numérisé', delai: 'avant le quinze du mois' },
          { doc: 'tes demandes de remboursement', onglet: 'Services administratifs', format: 'en document PDF scanné', delai: 'avant la fin du trimestre' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Si tu dois envoyer ${s.doc} à la direction, voici la procédure exacte à suivre. D’abord, connecte-toi sur l’intranet de l’entreprise avec ton identifiant habituel. Ensuite, clique sur l’onglet « ${s.onglet} » et sélectionne le formulaire d’envoi interne. Tu dois impérativement téléverser toutes tes pièces justificatives ${s.format}. N’oublie pas d’inscrire le numéro de projet dans la case prévue. Enfin, clique sur « Soumettre » et attends le courriel de confirmation automatique. Il faut absolument faire cette démarche ${s.delai} pour que le traitement soit fait à temps sur ta paie.`,
          questions: [
            ['Quelle démarche administrative la collègue explique-t-elle ?', 'La transmission de documents internes sur l’intranet', 'La réservation d’une salle de réunion pour clients', 'La commande de fournitures de bureau en ligne'],
            ['Dans quel format les fichiers doivent-ils obligatoirement être déposés ?', `Ils doivent être déposés ${s.format}`, 'Ils doivent être imprimés et remis en main propre', 'Ils doivent être envoyés par messagerie texte'],
            ['Quelle est l’échéance pour soumettre la demande ?', `Il faut la soumettre ${s.delai}`, 'Il faut le faire dans les vingt-quatre heures', 'Il n’y a aucune date limite particulière'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure d'approbation d'un bon de commande interne
    Object.assign(
      (rand) => {
        const slots = [
          { materiel: 'du matériel informatique', palier: 'de ton superviseur direct', bac: 'au bac bleu du secrétariat' },
          { materiel: 'du mobilier de bureau', palier: 'du chef de département', bac: 'au bureau des achats au deuxième étage' },
          { materiel: 'des fournitures d’atelier', palier: 'de la directrice adjointe', bac: 'au comptoir de la réception générale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour commander ${s.materiel}, fais bien attention aux étapes du protocole interne. Première étape : remplis le bon de commande dans le logiciel de gestion en indiquant les codes d’articles précis. Deuxième étape : imprime une copie papier et obtiens la signature manuscrite ${s.palier}. Troisième étape : dépose le document signé ${s.bac} avant quatorze heures. Une fois le bon enregistré, le commis t’enverra un numéro de suivi par messagerie instantanée. Si tu oublies la signature, ta demande sera automatiquement rejetée par le système.`,
          questions: [
            ['Quelle procédure la collègue détaille-t-elle à son interlocuteur ?', 'La commande interne de matériel avec formulaire', 'L’évaluation annuelle du rendement au travail', 'La demande de congé de maternité ou parental'],
            ['Quelle condition obligatoire permet de valider le bon de commande ?', `La signature manuscrite ${s.palier}`, 'Un appel téléphonique au fournisseur officiel', 'Le paiement comptant de la moitié de la somme'],
            ['Où doit-on déposer le document papier une fois signé ?', `On doit le déposer ${s.bac}`, 'Dans la boîte aux lettres personnelle du directeur', 'Directement dans la camionnette du livreur'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Colocataire expliquant le virement Interac pour le loyer
    Object.assign(
      (rand) => {
        const slots = [
          { banque: 'de ta banque', courriel: 'loyer.immeuble@habitation.ca', code: 'notre numéro d’appartement', montant: 'sept cent cinquante dollars' },
          { banque: 'de Desjardins', courriel: 'gestion.logement@gestionnaires.qc.ca', code: 'le nom de notre rue', montant: 'huit cent vingt dollars' },
          { banque: 'de la Banque Nationale', courriel: 'paiement.proprietaire@bloc.com', code: 'le code postal de l’immeuble', montant: 'six cent quatre-vingts dollars' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour payer ta part de loyer par cellulaire, c’est très simple, regarde. Ouvre d’abord l’application mobile ${s.banque} et va dans la section « Virements Interac ». Entre l’adresse courriel du propriétaire, qui est ${s.courriel}. Ensuite, inscris le montant exact de ta part, soit ${s.montant}. Pour la question de sécurité, écris « Appartement », et comme réponse secrète, tape ${s.code}. Vérifie bien toutes les informations avant de confirmer l’envoi. Dès que le virement est complété, fais une capture d’écran de la confirmation et envoie-la-moi par message texte pour nos dossiers !`,
          questions: [
            ['Quel paiement le colocataire apprend-il à effectuer sur son téléphone ?', 'Le virement mobile de sa part de loyer', 'Le paiement de sa facture d’électricité mensuelle', 'L’achat en ligne de meubles pour le salon'],
            ['Quelle réponse de sécurité doit-on saisir dans l’application ?', `On doit saisir ${s.code}`, 'La date de naissance du propriétaire', 'Le numéro de téléphone du colocataire'],
            ['Que doit envoyer le locataire une fois la transaction terminée ?', 'Une capture d’écran de la confirmation par texto', 'Un reçu officiel imprimé en trois exemplaires', 'Un courriel au gestionnaire de la banque'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Paiement des factures partagées par application bancaire
    Object.assign(
      (rand) => {
        const slots = [
          { facture: 'd’Internet haute vitesse', montant: 'quarante-cinq dollars', compte: 'le compte chèques', date: 'le premier de chaque mois' },
          { facture: 'd’Hydro-Québec pour l’électricité', montant: 'soixante dollars', compte: 'le compte d’opérations courantes', date: 'le cinq du mois' },
          { facture: 'd’assurance habitation pour le logement', montant: 'vingt-cinq dollars', compte: 'le compte partagé', date: 'le dernier jour du mois' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Voici comment faire pour payer la facture ${s.facture} avec ton cellulaire. Dans ton application bancaire, choisis l’onglet « Payer une facture ». Si le fournisseur n’est pas encore enregistré, clique sur « Ajouter un bénéficiaire » et tape le numéro de compte qui apparaît en haut du compte papier. Ensuite, sélectionne ${s.compte} et saisis le montant de ${s.montant}. Tu peux programmer un paiement récurrent qui s’exécutera automatiquement ${s.date}. N’oublie pas de cliquer sur le bouton vert pour enregistrer. Ça évite les oublis et les frais d’intérêt de retard !`,
          questions: [
            ['Quelle procédure est expliquée pour gérer les dépenses de la colocation ?', `Le paiement d’une facture ${s.facture} sur mobile`, 'La fermeture définitive d’un compte de chèques auprès de l’institution bancaire', 'La demande d’un emprunt d’argent pour financer la caution du bail d’habitation'],
            ['Quelle information faut-il taper pour ajouter le bénéficiaire ?', 'Le numéro de compte inscrit sur la facture papier', 'Le nom complet de tous les colocataires du bloc', 'L’adresse courriel personnelle du propriétaire'],
            ['Quel avantage offre la programmation automatique du paiement ?', 'Éviter les retards et les frais d’intérêt', 'Obtenir un rabais de dix pour cent sur la facture', 'Recevoir des points bonis sur sa carte de crédit'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Transmission de dossier d'embauche aux RH
    Object.assign(
      (rand) => {
        const slots = [
          { piece: 'ton spécimen de chèque', portail: 'le portail des employés', delai: 'dans les quarante-huit heures' },
          { piece: 'ton attestation d’études', portail: 'la section documents de l’intranet', delai: 'avant la fin de ta première semaine' },
          { piece: 'ta pièce d’identité avec photo', portail: 'le système de gestion des profils', delai: 'dès ta première journée en poste' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour finaliser ton dossier d’embauche auprès des ressources humaines, il y a trois étapes simples. Premièrement, télécharge le formulaire d’adhésion à la paie depuis ${s.portail}. Deuxièmement, numérise ${s.piece} et joins-la en fichier PDF au même endroit. Troisièmement, vérifie que ton adresse postale et ton numéro de téléphone sont bien à jour dans ton profil. Il faut compléter ces démarches ${s.delai} pour que la paie de la semaine prochaine ne soit pas bloquée. Si tu as un problème technique, appelle le poste interne 204.`,
          questions: [
            ['Quel dossier administratif le nouvel employé doit-il compléter ?', 'Son dossier d’embauche et d’adhésion à la paie', 'Une demande de mutation vers une autre succursale', 'Un formulaire pour réclamer des congés parentaux'],
            ['Quel document doit-il numériser et joindre au formulaire ?', `Il doit numériser ${s.piece}`, 'Une lettre de recommandation de son ancien voisin', 'Un certificat médical délivré par son médecin'],
            ['Dans quel délai doit-il accomplir toutes ces étapes ?', `Il doit le faire ${s.delai}`, 'Dans un délai maximal d’un mois complet', 'Avant la fin de sa période d’essai de trois mois'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-listening-5
  // Ex 0: Comprendre les suggestions de ses amies pour les vacances d’été.
  // Ex 1: Comprendre les conseils d’un physiothérapeute pour prévenir la réapparition de ses problèmes musculaires.
  'n5-listening-5': [
    // Scenario 0 (Template, Ex 0): Suggestions vacances d'été en Gaspésie
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Karine', destination: 'en Gaspésie', activite: 'louer un chalet face au fleuve et voir les baleines', conseil: 'réserver avant la fin mars' },
          { amie: 'Sarah', destination: 'aux Îles-de-la-Madeleine', activite: 'faire du kayak le long des falaises rouges', conseil: 'acheter les billets de traversier très tôt' },
          { amie: 'Émilie', destination: 'dans Charlevoix', activite: 'parcourir les sentiers de randonnée en montagne', conseil: 'prévoir des vêtements chauds pour le soir' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Julie ! Avec ${s.amie}, on discutait de nos projets pour les vacances de juillet et on a pensé à toi. On te suggère vraiment de venir avec nous ${s.destination}. Notre plan, c’est de ${s.activite} et de découvrir les petits cafés locaux. C’est tellement reposant et dépaysant ! Par contre, ${s.amie} insiste sur un point crucial : il faut absolument ${s.conseil}, parce que les hébergements affichent complet très vite en haute saison. Prends le temps d’y penser cette semaine et dis-nous si l’aventure te tente !`,
          questions: [
            ['Quelle proposition les amies font-elles pour l’été ?', `Partir en voyage de vacances ${s.destination}`, 'Suivre des cours intensifs d’anglais à Montréal', 'Rester en ville pour faire des rénovations'],
            ['Quelle activité principale prévoient-elles de faire sur place ?', `${s.activite[0].toUpperCase() + s.activite.slice(1)}`, 'Assister à des conférences sur l’économie', 'Faire les boutiques dans les centres commerciaux'],
            ['Quel conseil important l’amie donne-t-elle pour l’organisation ?', `${s.conseil[0].toUpperCase() + s.conseil.slice(1)}`, 'Attendre les soldes de dernière minute en juillet', 'Partir sans réserver pour trouver sur place'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Suggestions vacances plein air dans les parcs nationaux
    Object.assign(
      (rand) => {
        const slots = [
          { parc: 'le parc national du Mont-Tremblant', logement: 'des tentes de prêt-à-camper toutes équipées', rando: 'la via ferrata sur la paroi rocheuse' },
          { parc: 'le parc national de la Jacques-Cartier', logement: 'des chalets en bois près de la rivière', rando: 'la descente en canot sur l’eau calme' },
          { parc: 'le parc national des Grands-Jardins', logement: 'des refuges rustiques en forêt', rando: 'l’ascension du mont du Lac-des-Cygnes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Marc ! Si tu cherches des idées de vacances sans dépenser une fortune, mes copines et moi te conseillons ${s.parc}. On a testé la formule l’été dernier et c’était merveilleux. Tu peux réserver ${s.logement}, donc tu n’as pas besoin de transporter tout ton matériel de camping. Pendant la journée, la plus belle activité à faire, c’est ${s.rando}. N’oublie surtout pas d’apporter une bonne lotion contre les moustiques et une gourde d’eau réutilisable. Les réservations ouvrent ce samedi matin sur le site officiel de la Sépaq, alors sois prêt !`,
          questions: [
            ['Quelle destination de plein air les amies recommandent-elles ?', `Un séjour nature dans ${s.parc}`, 'Un voyage organisé dans les capitales européennes', 'Une semaine tout inclus dans un hôtel du Sud'],
            ['Quel hébergement pratique et économique suggèrent-elles ?', `${s.logement[0].toUpperCase() + s.logement.slice(1)}`, 'Une suite luxueuse dans un complexe hôtelier', 'Dormir dans sa propre voiture sur le stationnement'],
            ['Quelle recommandation d’équipement pratique mentionnent-elles ?', 'Apporter de la lotion contre les moustiques', 'Acheter des souliers de course neufs pour le voyage', 'Louer un camion tout-terrain pour circuler'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Conseils d'un physiothérapeute pour prévenir les maux de dos
    Object.assign(
      (rand) => {
        const slots = [
          { posture: 'un support lombaire derrière ton dos', pause: 'toutes les quarante-cinq minutes', exercice: 'des étirements doux des ischio-jambiers' },
          { posture: 'l’écran à la hauteur exacte de tes yeux', pause: 'toutes les trente minutes', exercice: 'des rotations contrôlées du bassin' },
          { posture: 'les pieds bien à plat sur le sol ou sur un repose-pied', pause: 'au moins une fois par heure', exercice: 'des flexions douces des genoux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour monsieur. Vos douleurs lombaires ont bien diminué, mais pour éviter toute rechute, vous devez adopter de nouvelles habitudes de travail. Quand vous travaillez à l’ordinateur, placez ${s.posture} pour maintenir la courbe naturelle de votre colonne. Ensuite, levez-vous ${s.pause} pour marcher quelques pas et activer la circulation sanguine. Chaque matin au lever, faites dix minutes de ${s.exercice}. Surtout, évitez absolument de soulever des boîtes lourdes en pliant le dos : pliez toujours les genoux en gardant la charge près du corps.`,
          questions: [
            ['Quel est le but des conseils donnés par le physiothérapeute ?', 'Prévenir le retour des douleurs au dos au travail', 'Préparer un athlète à une compétition de course', 'Apprendre à utiliser un fauteuil roulant d’hôpital'],
            ['Quel ajustement postural le spécialiste recommande-t-il au bureau ?', `Placer ${s.posture}`, 'S’asseoir par terre sans aucune chaise', 'Travailler debout pendant toute la journée sans pause'],
            ['Que doit-on faire absolument pour soulever une charge lourde ?', 'Plier les genoux en gardant la charge près du corps', 'Courber le dos au maximum pour faire levier', 'Prendre une grande inspiration et courir avec la boîte'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Conseils d'une physiothérapeute pour les tensions aux épaules et au cou
    Object.assign(
      (rand) => {
        const slots = [
          { accessoire: 'un coussin chauffant sur le cou pendant quinze minutes', mouvement: 'des cercles lents avec les épaules', sac: 'un sac à dos ergonomique à deux bretelles' },
          { accessoire: 'une poche de glace enveloppée dans une serviette', mouvement: 'des inclinaisons lentes de la tête de gauche à droite', sac: 'un sac de sport léger bien réparti' },
          { accessoire: 'une balle de tennis pour masser doucement le haut du dos', mouvement: 'des étirements des trapèzes et des bras', sac: 'une sacoche légère portée en bandoulière alternée' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Vos trapèzes sont encore très tendus après votre blessure musculaire. Pour consolider la guérison, appliquez ${s.accessoire} après une longue journée devant l’écran. En journée, pratiquez ${s.mouvement} trois fois par jour pour relâcher la pression sur les vertèbres cervicales. Pour vos déplacements en transport en commun, remplacez votre sac lourd par ${s.sac}. Évitez de coincer votre téléphone cellulaire entre votre oreille et votre épaule quand vous parlez : utilisez plutôt vos écouteurs avec micro mains libres. On se revoit dans un mois pour évaluer votre progression !`,
          questions: [
            ['Quels conseils professionnels la thérapeute formule-t-elle dans cette consultation ?', 'Des consignes pour soulager les tensions au cou et aux épaules', 'Des directives nutritionnelles pour perdre du poids', 'Une prescription de médicaments forts contre l’insomnie'],
            ['Quelle méthode d’application locale est conseillée le soir ?', `Appliquer ${s.accessoire}`, 'Prendre une douche d’eau glacée pendant une heure', 'Dormir toute la nuit sans aucun oreiller'],
            ['Quelle mauvaise habitude quotidienne faut-il absolument bannir ?', 'Coincer le cellulaire entre l’oreille et l’épaule', 'Regarder par la fenêtre pendant les pauses', 'Boire de l’eau fraîche pendant le travail sur écran'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Suggestions vacances à vélo sur la Route verte
    Object.assign(
      (rand) => {
        const slots = [
          { region: 'dans les Cantons-de-l’Est', parcours: 'l’Estriade et ses sentiers ombragés', halte: 'les auberges champêtres locales' },
          { region: 'dans la région de Chaudière-Appalaches', parcours: 'le Parc linéaire de la MRC de Lotbinière', halte: 'les gîtes touristiques certifiés Bienvenue cyclistes' },
          { region: 'dans les Laurentides', parcours: 'le célèbre parc linéaire du P’tit Train du Nord', halte: 'les anciennes gares ferroviaires transformées en cafés' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Stéphane ! On sait que tu aimes le vélo de route, alors on te propose un beau voyage estival ${s.region}. On te suggère d’emprunter ${s.parcours}. C’est sécuritaire, presque entièrement plat et idéal pour pédaler à son rythme en contemplant la nature. Pour dormir, on te conseille ${s.halte}, qui offrent des ateliers pour réparer et ranger les bicyclettes en sécurité la nuit. Prépare bien deux sacoches imperméables et un nécessaire de réparation pour les crevaisons. Tu verras, c’est une façon formidable de déconnecter du travail pendant une semaine !`,
          questions: [
            ['Quel genre de vacances les amies suggèrent-elles à Stéphane ?', `Une randonnée cyclotouriste ${s.region}`, 'Un stage d’alpinisme en haute montagne', 'Une fin de semaine de pêche sur un bateau à moteur'],
            ['Quelle infrastructure cyclable recommande-t-on pour le trajet ?', `${s.parcours[0].toUpperCase() + s.parcours.slice(1)}`, 'Une piste de motocross réservée aux véhicules à moteur', 'Une autoroute achalandée à quatre voies'],
            ['Quel équipement pratique lui conseille-t-on de préparer ?', 'Deux sacoches étanches et une trousse de réparation', 'Une remorque lourde capable de porter trois valises', 'Un GPS de navigation maritime spécialisé'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 5 - READING
  // ===========================================================================
// n5-reading-0
  // Ex 0: Informations contenues dans le bail de son futur logement.
  // Ex 1: Informations dans un article de journal faisant le bilan d’un festival de musique.
  'n5-reading-0': [
    // Scenario 0 (Template, Ex 0): Bail officiel pour un logement 4 1/2
    Object.assign(
      (rand) => {
        const slots = [
          { adresse: '450 rue Ontario Est, app. 3', loyer: 'neuf cent soixante dollars', services: 'le chauffage et l’eau chaude', date: 'le premier juillet' },
          { adresse: '720 avenue Laurier Ouest, app. 2', loyer: 'mille cinquante dollars', services: 'l’électricité et l’eau chaude', date: 'le premier juillet' },
          { adresse: '215 rue Saint-Denis, app. 5', loyer: 'huit cent quatre-vingts dollars', services: 'le chauffage et le déneigement', date: 'le premier août' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BAIL DE LOGEMENT (Tribunal administratif du logement)\nLe présent bail est conclu pour le logement situé au ${s.adresse}. Le bail commence ${s.date} pour une durée fixe de douze mois. Le montant du loyer mensuel est fixé à ${s.loyer}, payable le premier jour de chaque mois par virement. Le loyer comprend ${s.services}. Les animaux domestiques sont interdits dans l’immeuble, sauf les chats stérilisés. Il est strictement interdit de fumer dans le logement. Tout retard de paiement supérieur à trois semaines pourra entraîner une résiliation du bail par le propriétaire.`,
          questions: [
            ['De quel type de document officiel s’agit-il principalement ?', 'D’un bail de location résidentielle', 'D’une facture de services publics impayée', 'D’un contrat de vente d’une maison'],
            ['Quels services sont expressément inclus dans le loyer mensuel ?', `Le loyer comprend ${s.services}`, 'Le loyer inclut l’accès à un garage privé', 'Le loyer comprend les repas quotidiens'],
            ['Quelle modalité est exigée pour le versement du loyer ?', 'Le paiement le premier du mois par virement', 'Le paiement comptant en mains propres chaque lundi', 'Un dépôt annuel unique par chèque certifié'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Conditions de location condo locatif
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Québec', quartier: 'dans le quartier Saint-Roch', loyer: 'mille cent dollars', stationnement: 'un espace de stationnement intérieur' },
          { ville: 'à Sherbrooke', quartier: 'près du centre-ville', loyer: 'neuf cent vingt dollars', stationnement: 'un casier de rangement au sous-sol' },
          { ville: 'à Trois-Rivières', quartier: 'dans un secteur résidentiel', loyer: 'huit cent cinquante dollars', stationnement: 'un espace pour bicyclette sécurisé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ANNEXE AU CONTRAT DE LOCATION - IMMEUBLE LES ÉRABLES\nBienvenue dans votre appartement 3 1/2 situé ${s.ville}, ${s.quartier}. Votre loyer mensuel de ${s.loyer} inclut l’accès au gymnase ainsi que ${s.stationnement}. Le paiement s’effectue par prélèvement bancaire le premier jour de chaque mois. Les locataires doivent fournir une preuve d’assurance responsabilité civile avant la remise des clés. Les travaux de peinture requièrent une entente écrite préalable avec le gestionnaire. Pour toute urgence de chauffage, veuillez joindre le concierge de garde au poste 102.`,
          questions: [
            ['Quel document le futur locataire lit-il ici ?', 'Une annexe détaillant les conditions de son logement', 'Une offre d’achat pour une maison unifamiliale', 'Un devis de rénovation pour une cuisine'],
            ['Quel avantage supplémentaire est inclus avec le logement ?', `${s.stationnement[0].toUpperCase() + s.stationnement.slice(1)}`, 'Une connexion Internet gratuite à très haut débit', 'L’entretien ménager complet chaque vendredi'],
            ['Que doit fournir le locataire avant d’obtenir les clés ?', 'Une preuve d’assurance responsabilité civile', 'Une lettre signée par son employeur actuel', 'Un dépôt de garantie de trois mois de loyer'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Bilan de festival de musique à Montréal
    Object.assign(
      (rand) => {
        const slots = [
          { festival: 'des Francos de Montréal', spectateurs: 'huit cent mille festivaliers', concerts: 'deux cent cinquante spectacles gratuits' },
          { festival: 'du Festival de jazz de Montréal', spectateurs: 'près d’un million d’amateurs', concerts: 'trois cents concerts sur les scènes extérieures' },
          { festival: 'du Festival d’été de Québec', spectateurs: 'six cent mille spectateurs', concerts: 'deux cents représentations musicales variées' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BILAN CULTUREL - SUCCÈS MAJEUR POUR LA MUSIQUE\nLa quarante-deuxième édition ${s.festival} s’est clôturée dimanche sur une note formidable. Pendant dix jours sous le soleil, ${s.spectateurs} ont convergé vers le centre-ville. Les organisateurs célèbrent cette réussite populaire avec ${s.concerts} qui ont ravi un public familial. Les commerçants locaux soulignent des retombées économiques majeures pour les restaurants du secteur. Aucun incident n’a été rapporté par la police. Le comité organisateur donne déjà rendez-vous l’an prochain pour célébrer la chanson francophone !`,
          questions: [
            ['Quel est le sujet principal de cet article de journal ?', 'Le bilan couronné de succès d’un grand festival de musique', 'L’annulation imprévue d’un événement en raison de la pluie', 'Le conflit de travail entre artistes et producteurs'],
            ['Quelle statistique illustre la grande réussite de l’événement ?', `${s.concerts[0].toUpperCase() + s.concerts.slice(1)}`, 'La vente exclusive de billets à des prix très élevés', 'La participation d’une seule vedette internationale'],
            ['Quelle orientation est annoncée pour l’édition de l’année suivante ?', 'Un nouveau rendez-vous pour célébrer la chanson', 'Le déplacement de l’événement en banlieue éloignée', 'L’arrêt définitif de tous les concerts extérieurs gratuits'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Bilan du festival de musique régionale
    Object.assign(
      (rand) => {
        const slots = [
          { festival: 'Le Festi-Plage de Cap-d’Espoir', region: 'en Gaspésie', participants: 'vingt-cinq mille visiteurs', nouveaute: 'une scène écologique solaire' },
          { festival: 'Le Festival des musiques du monde', region: 'au Saguenay', participants: 'trente mille amateurs', nouveaute: 'des ateliers de percussion pour enfants' },
          { festival: 'Les Nuits acoustiques de Rimouski', region: 'dans le Bas-Saint-Laurent', participants: 'quinze mille festivaliers', nouveaute: 'des navettes fluviales gratuites' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE LOCALE - RECORD DE PARTICIPATION EN RÉGION\n${s.festival}, qui célébrait sa quinzième saison ${s.region}, a franchi une étape historique cette fin de semaine. L’événement a attiré ${s.participants}, dépassant toutes les prévisions du comité organisateur. Les festivaliers ont particulièrement apprécié ${s.nouveaute}. Les artistes invités ont salué l’accueil chaleureux du public lors des concerts au coucher du soleil. Grâce aux revenus de la billetterie, les organisateurs confirment que les profits serviront à financer des bourses pour les jeunes musiciens de la région.`,
          questions: [
            ['Quel événement culturel régional fait l’objet de ce bilan de presse ?', 'Un festival de musique qui a battu son record d’affluence', 'Un concours de chant télévisé pour adolescents', 'Une exposition itinérante de photographies anciennes'],
            ['Quelle nouveauté a particulièrement séduit les festivaliers ?', `${s.nouveaute[0].toUpperCase() + s.nouveaute.slice(1)}`, 'Des feux d’artifice tirés à toutes les heures de la nuit', 'La gratuité complète de tous les repas pour les touristes'],
            ['À quoi serviront les profits générés par le festival ?', 'Au financement de bourses pour de jeunes musiciens', 'À l’achat de véhicules de fonction pour les organisateurs', 'À la construction d’un hôtel permanent sur le site'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Clauses du bail pour un logement étudiant
    Object.assign(
      (rand) => {
        const slots = [
          { quartier: 'de Côte-des-Neiges', distance: 'à cinq minutes de l’université', meuble: 'entièrement meublé avec électroménagers', internet: 'l’accès à Internet haute vitesse illimité' },
          { quartier: 'de Sainte-Foy', distance: 'à deux pas du campus collégial', meuble: 'semi-meublé avec lit et bureau', internet: 'une connexion Wi-Fi sécurisée dans tout l’immeuble' },
          { quartier: 'de Sherbrooke', distance: 'à proximité des facultés', meuble: 'meublé à neuf avec lit double', internet: 'le câble et l’Internet sans fil' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `EXTRAIT DE BAIL RÉSIDENTIEL - SECTION LOGEMENT ÉTUDIANT\nLe logement loué est situé au cœur du secteur ${s.quartier}, ${s.distance}. Il s’agit d’un studio ${s.meuble}. En plus du chauffage, le loyer mensuel comprend ${s.internet}. Le locataire s’engage à respecter la tranquillité des autres résidents entre vingt-deux heures et sept heures du matin. Aucun sous-locataire n’est admis sans le consentement écrit du propriétaire. Toute sous-location non autorisée entraînera une pénalité financière immédiate. Les clés seront remises le premier du mois après versement du premier loyer.`,
          questions: [
            ['À qui s’adresse principalement cette offre de logement locatif ?', 'À des étudiants universitaires cherchant un studio', 'À une famille nombreuse avec plusieurs jeunes enfants', 'À une entreprise cherchant des bureaux commerciaux'],
            ['Quel service de télécommunication est compris dans le bail ?', `${s.internet[0].toUpperCase() + s.internet.slice(1)}`, 'Un forfait téléphonique mobile international complet', 'L’accès gratuit à toutes les chaînes de cinéma payantes'],
            ['Quelle condition encadre la sous-location éventuelle de ce studio ?', 'Elle requiert le consentement écrit du propriétaire', 'Elle est totalement libre sans aucune notification', 'Elle est permise uniquement durant les vacances de Noël'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-reading-1
  // Ex 0: Description d’une région du Québec dans une brochure touristique.
  // Ex 1: Description de la cérémonie de mariage d’une célébrité publiée dans un magazine.
  'n5-reading-1': [
    // Scenario 0 (Template, Ex 0): Brochure touristique de Charlevoix
    Object.assign(
      (rand) => {
        const slots = [
          { attraction: 'les saveurs de la Route des terroirs', paysage: 'entre le fleuve et les montagnes imposantes', village: 'le village pittoresque de Baie-Saint-Paul' },
          { attraction: 'les croisières d’observation des baleines', paysage: 'des fjords spectaculaires aux falaises escarpées', village: 'la municipalité historique de Tadoussac' },
          { attraction: 'les sentiers panoramiques du parc national', paysage: 'des vallées profondes sculptées par la nature', village: 'la jolie côte de La Malbaie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BROCHURE TOURISTIQUE OFFICIELLE - ÉVASION DANS CHARLEVOIX\nNiché ${s.paysage}, Charlevoix est une destination magnifique pour les amoureux de plein air. En parcourant cette région réserve mondiale de la biosphère, vous découvrirez ${s.attraction}, où des fromagers et des artisans passionnés vous accueillent. Faites une halte dans ${s.village}, réputé pour ses galeries d’art, ses bistros chaleureux et son patrimoine architectural préservé. Que vous choisissiez une randonnée au grand air ou un séjour douillet dans une auberge de charme, Charlevoix saura vous émerveiller en toute saison. Réservez votre séjour en ligne dès aujourd’hui !`,
          questions: [
            ['Quel est l’objectif principal de cette brochure touristique ?', 'Présenter les attraits naturels et culturels d’une région', 'Avertir les résidents d’une tempête de neige côtière', 'Raconter l’histoire politique des premiers colons'],
            ['Quelle expérience gourmande ou de plein air est mise en avant ?', `${s.attraction[0].toUpperCase() + s.attraction.slice(1)}`, 'Une compétition de pêche sportive en haute mer', 'Une visite guidée d’usines chimiques industrielles'],
            ['Pour quoi la municipalité mentionnée est-elle particulièrement reconnue ?', 'Ses galeries d’art et son patrimoine préservé', 'Son aéroport international et ses centres de congrès', 'Ses plages de sable fin aux eaux tropicales'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Brochure touristique des Cantons-de-l'Est
    Object.assign(
      (rand) => {
        const slots = [
          { route: 'la célèbre Route des vins', activite: 'la cueillette des pommes dans les vergers ancestraux', mont: 'le mont Orford' },
          { route: 'le circuit des cœurs villageois', activite: 'la détente dans les spas nordiques en plein air', mont: 'le mont Brome' },
          { route: 'le Chemin des Cantons patrimonial', activite: 'la dégustation de bières de microbrasseries locales', mont: 'le mont Sutton' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DU VISITEUR - LES TRÉSORS DES CANTONS-DE-L’EST\nÀ une heure de route de Montréal, les Cantons-de-l’Est invitent à la douceur de vivre et au dépaysement champêtre. Empruntez ${s.route} pour faire connaissance avec des producteurs locaux réputés. À l’automne, ne manquez pas ${s.activite}, une tradition vivante partagée en famille. Les adeptes de vélo et de marche trouveront leur bonheur sur les pentes entourant ${s.mont}, dont les panoramas sur les collines sont remarquables. Consultez notre carte interactive pour planifier votre circuit et découvrez nos forfaits vacances avantageux combinant nuitée et dégustations.`,
          questions: [
            ['Quelle région touristique québécoise ce guide fait-il découvrir ?', 'Les Cantons-de-l’Est et leur patrimoine champêtre', 'Le Grand Nord québécois et ses toundras glacées', 'La banlieue industrielle de l’ouest de Montréal'],
            ['Quelle activité traditionnelle automnale est recommandée aux familles ?', `${s.activite[0].toUpperCase() + s.activite.slice(1)}`, 'Une course de motoneiges sur des lacs gelés', 'La chasse aux papillons nocturnes en forêt dense'],
            ['Quel attrait géographique offre des panoramas remarquables aux randonneurs ?', `Les sentiers et les pentes entourant ${s.mont}`, 'Les immenses dunes de sable au bord de l’océan', 'Les falaises rocheuses d’un canyon inaccessible'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Cérémonie de mariage d'une célébrité québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { celebrite: 'la chanteuse populaire Ariane Fortin', lieu: 'dans une chapelle historique de l’Île d’Orléans', tenue: 'une robe blanche en dentelle signée par un créateur local' },
          { celebrite: 'l’actrice renommée Béatrice Martel', lieu: 'dans un domaine viticole réputé des Laurentides', tenue: 'une élégante robe satinée aux reflets dorés' },
          { celebrite: 'l’animatrice de télévision Sophie Leduc', lieu: 'au bord de l’eau dans un manoir du Bas-Saint-Laurent', tenue: 'une longue robe fluide bordée de broderies délicates' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MAGAZINE ÉCHOS VEDETTES - REPORTAGE EXCLUSIF\nC’est dans une atmosphère féerique que s’est déroulé ce samedi le mariage de ${s.celebrite} avec son compagnon de longue date. La cérémonie intime s’est tenue ${s.lieu}, devant une centaine d’invités triés sur le volet. La mariée a ébloui l’assistance en portant ${s.tenue}. Après un échange de vœux émouvant qui a touché leurs proches, la fête s’est poursuivie avec un banquet champêtre mettant en valeur les produits du terroir québécois. Les amoureux ont ensuite dansé sous un ciel étoilé avant de couper le gâteau traditionnel.`,
          questions: [
            ['Quel événement mondain ce magazine culturel relate-t-il ?', 'Le mariage célébré d’une personnalité artistique québécoise', 'Le lancement du nouvel album studio d’un groupe rock', 'La première projection d’un film primé à Cannes'],
            ['Où s’est déroulée la cérémonie officielle d’échange des vœux ?', `Elle s’est déroulée ${s.lieu}`, 'Dans un grand stade olympique devant dix mille personnes', 'Dans un salon privé d’un aéroport international'],
            ['Quelle attention particulière de la mariée a marqué les convives ?', `${s.tenue[0].toUpperCase() + s.tenue.slice(1)}`, 'Son arrivée surprise en hélicoptère militaire', 'Son refus de chanter devant les caméras de télévision'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Mariage d'un célèbre sportif professionnel
    Object.assign(
      (rand) => {
        const slots = [
          { sportif: 'le capitaine de hockey Alexandre Roy', endroit: 'dans une auberge ancestrale de Charlevoix', cadeau: 'des dons à un organisme pour enfants défavorisés' },
          { sportif: 'le médaillé olympique Maxime Tremblay', endroit: 'dans une grange patrimoniale restaurée en Estrie', cadeau: 'des contributions à une fondation de recherche médicale' },
          { sportif: 'le joueur étoile David Desbiens', endroit: 'dans un verger privé au pied du mont Saint-Hilaire', cadeau: 'le financement d’équipements sportifs scolaires' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE CÉLÉBRITÉS - UNION HIVERNALE AUX SAVEURS D’ICI\nCe week-end, ${s.sportif} a uni sa destinée à celle de sa conjointe ${s.endroit}. Entourés de leurs coéquipiers et de leurs familles, les amoureux ont célébré leur union dans un décor rustique. Au lieu des traditionnels présents de mariage, le couple a invité ses convives à faire ${s.cadeau}. Les invités ont savouré un repas inspiré des cabanes à sucre traditionnelles, avec de la tire sur la neige servie en fin de soirée. Un moment magique et authentique que le couple et leurs invités chériront longtemps !`,
          questions: [
            ['De quelle célébration d’envergure l’article de magazine fait-il le récit ?', 'Du mariage chaleureux d’un athlète professionnel québécois', 'D’une fête de retraite pour un entraîneur chevronné', 'D’une victoire en championnat mondial de patinage'],
            ['Quel geste généreux les nouveaux mariés ont-ils demandé à leurs invités ?', `Remplacer les cadeaux par ${s.cadeau}`, 'Construire eux-mêmes les tables et chaises du banquet', 'Payer leur propre hébergement à l’auberge de luxe'],
            ['Quelle surprise gourmande a clôturé la soirée de mariage ?', 'De la tire d’érable sur la neige servie en fin de fête', 'Un buffet de fruits de mer importés de l’étranger', 'Un gâteau glacé aux fruits tropicaux et au chocolat'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Brochure touristique de la Gaspésie
    Object.assign(
      (rand) => {
        const slots = [
          { symbole: 'le célèbre rocher Percé', parc: 'le parc national de la Gaspésie', route: 'la mythique route 132 qui longe le golfe marin' },
          { symbole: 'le phare historique de Pointe-à-la-Renommée', parc: 'le parc national Forillon', route: 'le grand tour côtier reliant la mer et les monts' },
          { symbole: 'les fous de Bassan de l’île Bonaventure', parc: 'la réserve faunique des Chic-Chocs', route: 'le corridor panoramique aux falaises côtières' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `DÉPLIANT TOURISME QUÉBEC - CAP SUR LA GASPÉSIE\nPréparez-vous à vivre un voyage sur route spectaculaire en explorant la Gaspésie. Empruntez ${s.route}, où chaque virage dévoile des falaises maritimes et des havres de pêche pittoresques. Admirez ${s.symbole}, véritable joyau naturel, et marchez dans ${s.parc} pour apercevoir des orignaux dans leur habitat sauvage. Les auberges du littoral vous feront déguster le homard frais et des chaudrées préparées selon les traditions des pêcheurs d’autrefois. Une aventure maritime inoubliable vous attend dès votre premier arrêt en bord de mer !`,
          questions: [
            ['Quelle région maritime du Québec ce document promotionnel décrit-il ?', 'La péninsule gaspésienne et ses paysages côtiers', 'L’archipel urbain des îles de la métropole', 'La région agricole plane du centre de la province'],
            ['Quel site naturel ou faunique emblématique est mis à l’honneur ?', `${s.symbole[0].toUpperCase() + s.symbole.slice(1)}`, 'Une pyramide artificielle construite au siècle dernier', 'Un barrage hydroélectrique interdit au grand public'],
            ['Quel mets culinaire typique est proposé aux voyageurs dans les auberges ?', 'Le homard frais et des chaudrées de pêcheurs', 'Des grillades importées d’Amérique du Sud', 'Des plats congelés servis dans des contenants jetables'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-reading-2
  // Ex 0: Comprendre l’essentiel d’un récit de voyage raconté par un couple dans un blogue.
  // Ex 1: Comprendre l’essentiel du récit d’un incident relaté sur la page Web d’un groupe de personnes de son quartier.
  'n5-reading-2': [
    // Scenario 0 (Template, Ex 0): Blogue de voyage en train d'un couple dans l'Ouest canadien
    Object.assign(
      (rand) => {
        const slots = [
          { couple: 'Mélanie et Sébastien', transport: 'à bord du train transcanadien', sommet: 'les sommets enneigés des Rocheuses canadiennes', retard: 'trois heures de retard causées par un troupeau d’orignaux' },
          { couple: 'Audrey et Guillaume', transport: 'en train panoramique avec dôme vitré', sommet: 'les parois vertigineuses de la rivière Fraser', retard: 'deux heures d’attente sur une voie secondaire' },
          { couple: 'Émilie et David', transport: 'en wagon-lit confortable et chaleureux', sommet: 'les lacs glaciaires d’un bleu éblouissant', retard: 'une pause imprévue pour réparer un aiguillage' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BILLET DE BLOGUE - NOTRE ÉPOPÉE FERROVIAIRE EN DUO\nBonjour à tous nos abonnés ! ${s.couple} vous écrivent depuis Vancouver après un voyage de deux semaines. Nous avons traversé le pays ${s.transport}, et c’était merveilleux. Chaque matin, nous prenions notre café devant ${s.sommet}. Même si le train a subi ${s.retard}, personne ne s’est plaint : nous en avons profité pour lier conversation avec d’autres voyageurs autour d’un jeu de cartes. Ce voyage nous a appris à ralentir et à contempler la nature. Prochaine étape : une excursion en traversier vers l’île de Vancouver !`,
          questions: [
            ['Quel est le sujet principal de ce billet de blogue de voyage ?', 'Le récit d’une traversée ferroviaire du pays en couple', 'Une critique gastronomique des restaurants d’un hôtel', 'Une demande de dons pour financer un nouveau projet'],
            ['Quel imprévu a prolongé le trajet des voyageurs ?', `${s.retard[0].toUpperCase() + s.retard.slice(1)}`, 'La panne d’électricité de toutes les prises du train', 'La perte des valises du couple lors d’un transfert'],
            ['Quelle est la prochaine destination prévue par le couple ?', 'Une excursion en traversier vers l’île de Vancouver', 'Un retour immédiat en avion vers leur ville de départ', 'Un séjour d’une semaine dans une cabane sans électricité'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Blogue de voyage en canot-camping en Mauricie
    Object.assign(
      (rand) => {
        const slots = [
          { auteurs: 'Caroline et Mathieu', duree: 'cinq jours d’immersion totale', plan: 'les lacs calmes du parc national de la Mauricie', mesaventure: 'un orage soudain qui a trempé leurs sacs de couchage' },
          { auteurs: 'Isabelle et Antoine', duree: 'quatre jours de canot-camping', plan: 'la rivière Mistassibi et ses rives boisées', mesaventure: 'la visite nocturne d’un raton laveur gourmand près du feu' },
          { auteurs: 'Sophie et François', duree: 'six jours d’expédition en nature', plan: 'le réservoir Poisson Blanc et ses îles sauvages', mesaventure: 'une pagaie cassée heureusement remplacée par celle de secours' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CARNET D’AVENTURE - RETOUR DE NOTRE SÉJOUR EN NATURE\nNous revoilà en ligne après ${s.duree} en forêt ! Avec mon conjoint, nous avons pagayé sur ${s.plan}. Le silence matinal sur l’eau et le chant des oiseaux resteront gravés dans nos mémoires pour toujours. Évidemment, une belle expédition comporte ses imprévus : nous avons essuyé ${s.mesaventure}. Heureusement, grâce à notre trousse de survie et à un feu de camp, nous avons séché nos affaires dans la bonne humeur. Pour tous ceux qui hésitent : préparez votre équipement et sautez à l’eau !`,
          questions: [
            ['Quelle expérience vécue les blogueurs partagent-ils avec leurs lecteurs ?', 'Une expédition en canot-camping de plusieurs jours', 'L’achat d’un chalet secondaire au bord d’une route', 'Une formation de guide touristique professionnel'],
            ['Quel petit incident a pimenté le quotidien du couple durant l’expédition ?', `${s.mesaventure[0].toUpperCase() + s.mesaventure.slice(1)}`, 'La perte définitive de leur canot emporté par le courant', 'Une morsure de serpent venimeux nécessitant un hélicoptère'],
            ['Comment ont-ils réagi face à ce contretemps matériel ?', 'Ils ont gardé le moral et séché leurs affaires au feu', 'Ils ont appelé les gardes du parc pour une évacuation', 'Ils ont abandonné leur matériel sur le rivage'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Incident d'eau coupée relaté sur le groupe de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'sur la rue Saint-Zotique Est', heure: 'vers six heures du matin', cause: 'le bris soudain d’une conduite d’eau principale', solidarite: 'ont offert des cruches d’eau potable à leurs voisins âgés' },
          { secteur: 'sur la rue Beaubien', heure: 'vers sept heures et demie', cause: 'une fuite majeure causée par des travaux de voirie', solidarite: 'ont partagé des bidons d’eau pour préparer le café' },
          { secteur: 'sur l’avenue Papineau', heure: 'à l’aube ce mardi', cause: 'l’éclatement d’un tuyau d’aqueduc sous le trottoir', solidarite: 'ont mis à disposition le robinet extérieur de leur cour' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GROUPE CITOYEN - SOLIDARITÉ DU QUARTIER ROSEMONT\nChers voisins, voici un résumé de la situation vécue ${s.secteur}. Ce matin ${s.heure}, l’eau s’est déversée sur le trottoir à la suite de ${s.cause}. Les cols bleus de la ville sont intervenus rapidement pour fermer les valves, coupant l’eau pour quarante logements. Face à ce désagrément, plusieurs résidents ${s.solidarite}. La municipalité a distribué des bouteilles d’eau devant le dépanneur. La pression reviendra avant vingt heures ce soir. Merci à tous pour votre belle entraide communautaire !`,
          questions: [
            ['Quel incident du quartier est décrit dans cette publication citoyenne ?', 'Une coupure d’eau courante due à un bris d’aqueduc', 'Une panne générale d’électricité due à une tempête', 'Un cambriolage survenu dans un commerce local'],
            ['Comment la solidarité entre résidents s’est-elle manifestée ?', `Des citoyens ${s.solidarite}`, 'Les habitants ont bloqué la rue pour protester', 'Les voisins ont réparé eux-mêmes la tuyauterie brisée'],
            ['Quelle mesure municipale temporaire a été mise en place pour aider ?', 'Une distribution de bouteilles d’eau devant le dépanneur', 'L’hébergement gratuit de tous les résidents à l’hôtel', 'Le remboursement immédiat des taxes municipales de l’année'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Incident d'arbre tombé dans la ruelle
    Object.assign(
      (rand) => {
        const slots = [
          { ruelle: 'entre les rues Masson et Dandurand', orage: 'de violentes rafales de vent hier soir', degat: 'a arraché deux fils téléphoniques et bloqué trois garages' },
          { ruelle: 'derrière la rue Saint-Hubert', orage: 'un orage d’été avec de fortes averses', degat: 'est tombé sur une clôture en bois et obstrue le passage' },
          { ruelle: 'au sud de l’avenue du Mont-Royal', orage: 'un coup de vent soudain en fin d’après-midi', degat: 'a écrasé un cabanon de jardin sans faire de blessé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FORUM DES HABITANTS - RUELLE SÉCURITÉ ET ENTRAIDE\nPetit retour sur les événements survenus dans notre ruelle ${s.ruelle}. À la suite ${s.orage}, un grand saule s’est abattu en travers du chemin. L’arbre ${s.degat}. Heureusement, aucun passant ne circulait à cet instant. Avant même l’arrivée des équipes municipales d’urgence, plusieurs voisins ont sorti leurs scies pour dégager l’accès aux piétons. Merci à Patrick pour avoir installé des cônes de signalisation. La ville ramassera les branches dès demain matin. Soyez prudents à vélo dans le secteur !`,
          questions: [
            ['Quel événement imprévu dans la ruelle est rapporté aux résidents ?', 'La chute d’un grand arbre à cause du vent violent', 'La fuite de gaz nécessitant l’évacuation du secteur', 'L’organisation spontanée d’une fête sans permis'],
            ['Quel dommage matériel direct la chute d’arbre a-t-elle provoqué ?', `L’arbre ${s.degat}`, 'Il a défoncé la toiture complète d’un immeuble de trois étages', 'Il a écrasé trois véhicules neufs stationnés sur la rue'],
            ['Quelle action collective spontanée les voisins ont-ils entreprise ?', 'Ils ont scié des branches pour libérer le passage', 'Ils ont appelé la police pour faire dresser des procès-verbaux', 'Ils ont abandonné leurs logements pour aller chez des amis'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Récit de voyage en motoneige au Saguenay
    Object.assign(
      (rand) => {
        const slots = [
          { parcours: 'les monts Valin et leurs sapins givrés', etape: 'dans un relais de motoneigistes chauffé au poêle à bois' },
          { parcours: 'le tour complet du grand lac Saint-Jean glacé', etape: 'dans une pourvoirie traditionnelle très chaleureuse' },
          { parcours: 'les sentiers boisés qui surplombent le fjord', etape: 'dans un camp rustique au cœur de la forêt boréale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉCIT D’ÉVASION - NOTRE PREMIER RAID HIVERNAL EN DUO\nBonjour à tous les adeptes du plein air ! Mon conjoint et moi venons de terminer notre première randonnée de motoneige au Saguenay. Pendant quatre jours, nous avons sillonné ${s.parcours}. Les paysages entièrement blancs étaient féeriques. Chaque soir, après avoir affronté un froid vif de moins vingt degrés, nous nous réchauffions ${s.etape}. L’ambiance y était formidable et les habitués nous ont donné de précieux conseils mécaniques. Nous rentrons avec des souvenirs magnifiques et l’envie irrésistible de repartir explorer la Côte-Nord l’hiver prochain !`,
          questions: [
            ['Quelle expérience hivernale ce couple partage-t-il sur son blogue ?', 'Un raid guidé en motoneige dans une région québécoise', 'Une compétition officielle de ski alpin professionnel', 'Un séjour d’achat de chalet dans une banlieue de Montréal'],
            ['Où les motoneigistes trouvaient-ils refuge pour se réchauffer le soir ?', `Ils se réchauffaient ${s.etape}`, 'Ils dormaient sous une tente sans chauffage d’appoint', 'Ils retournaient chaque nuit dormir en ville dans un hôtel'],
            ['Quel projet hivernal le couple envisage-t-il déjà pour l’an prochain ?', 'Repartir explorer la Côte-Nord en motoneige', 'Vendre tout leur équipement d’hiver pour rester au chaud', 'Partir vivre dans un pays du Sud toute l’année'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-reading-3
  // Ex 0: Comprendre l’essentiel des explications fournies par une amie, par clavardage, concernant sa décision d’accepter un poste.
  // Ex 1: Comprendre l’essentiel des explications d’un collègue, dans un courriel, concernant son refus de participer à une journée d’insertion professionnelle.
  'n5-reading-3': [
    // Scenario 0 (Template, Ex 0): Clavardage acceptation de poste en santé communautaire
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Léa', poste: 'd’agente de liaison communautaire', organisme: 'au CLSC de mon quartier', avantage: 'je pourrai y aller à pied tous les matins' },
          { amie: 'Myriam', poste: 'd’éducatrice spécialisée', organisme: 'dans un centre de pédiatrie sociale', avantage: 'l’équipe est humaine et très soudée' },
          { amie: 'Sophie', poste: 'de coordonnatrice de projets', organisme: 'dans une coopérative solidaire', avantage: 'l’horaire sur quatre jours me libère mes vendredis' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - DISCUSSION AVEC ${s.amie.toUpperCase()}\n[14:15] ${s.amie} : Coucou ! J’ai une grande nouvelle : j’ai signé mon contrat aujourd’hui ! J’ai accepté le poste ${s.poste} ${s.organisme}. J’hésitais avec une autre offre mieux payée, mais la mission sociale me rejoint beaucoup plus. En plus, un avantage formidable : ${s.avantage} ! La directrice m’a assuré que je serai bien accompagnée durant ma formation initiale. Je commence officiellement le deux mai. On va pouvoir célébrer ça autour d’un bon café cette fin de semaine si tu es libre !`,
          questions: [
            ['Quelle décision importante l’amie annonce-t-elle par message instantané ?', 'Son acceptation d’une nouvelle offre d’emploi', 'Sa décision de retourner aux études universitaires', 'Son départ définitif pour s’installer en région'],
            ['Quelle raison principale a fait pencher la balance en faveur de ce poste ?', 'L’alignement avec ses valeurs et la mission sociale', 'Le salaire deux fois supérieur à celui de ses collègues', 'L’absence totale de patron ou de supervision hiérarchique'],
            ['Quel avantage pratique du quotidien la réjouit particulièrement ?', `${s.avantage[0].toUpperCase() + s.avantage.slice(1)}`, 'Une voiture de fonction haut de gamme fournie', 'Des voyages professionnels payés chaque mois à l’étranger'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Clavardage acceptation de poste en éducation
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Catherine', poste: 'de technicienne en documentation', institution: 'à la bibliothèque du cégep', raison: 'la sécurité d’emploi et le régime de retraite' },
          { amie: 'Audrey', poste: 'd’animatrice de vie étudiante', institution: 'dans une école secondaire locale', raison: 'le contact stimulant avec les adolescents' },
          { amie: 'Nadia', poste: 'de conseillère d’orientation', institution: 'au centre pour adultes', raison: 'l’aide concrète offerte aux nouveaux arrivants' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - ANNONCE OFFICIELLE DE CARRIÈRE\n[10:32] ${s.amie} : Salut ! Je voulais t’expliquer pourquoi j’ai accepté l’offre ${s.poste} ${s.institution}. Après avoir travaillé à contrat dans l’incertitude, ce poste m’apporte exactement ce dont j’avais besoin : ${s.raison}. Même si le processus de sélection a été long avec trois entrevues, la directrice m’a fait une excellente impression. Mes futurs collègues sont accueillants et le bureau est très lumineux. J’entre en poste lundi prochain. Je suis tellement soulagée de cette stabilité !`,
          questions: [
            ['Quelle est la nouvelle profession acceptée par l’amie ?', `Un poste ${s.poste} en milieu éducatif`, 'Un poste de comptable dans une banque privée', 'Un contrat de gérante dans un magasin de vêtements'],
            ['Pourquoi ce nouveau poste représente-t-il un grand soulagement ?', `Parce qu’il lui apporte ${s.raison}`, 'Parce qu’elle n’aura que dix heures de travail par mois', 'Parce qu’elle pourra travailler sans jamais parler à personne'],
            ['Quand doit-elle commencer officiellement son nouvel emploi ?', 'Dès lundi prochain après la signature', 'Dans trois mois après une longue période de vacances', 'L’année prochaine à l’automne'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Courriel refusant de participer à la journée d'insertion
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc-André Tremblay', motif: 'la livraison urgente du rapport financier annuel', offre: 'préparer les dépliants promotionnels' },
          { collegue: 'Vincent Bouchard', motif: 'une formation obligatoire en santé et sécurité', offre: 'rédiger le compte rendu complet de la rencontre' },
          { collegue: 'Simon Pelletier', motif: 'un audit externe qui mobilise toute notre équipe', offre: 'accueillir les nouveaux lors de la séance suivante' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL PROFESSIONNEL\nDe : ${s.collegue}\nÀ : Comité d’insertion professionnelle\nObjet : Absence motivée - Journée d’insertion du 18 octobre\nBonjour à tous,\nJe vous informe avec regret que je ne pourrai pas participer à notre journée d’insertion professionnelle jeudi prochain. En effet, je dois finaliser en priorité ${s.motif}, dont l’échéance a été devancée à vendredi matin par la direction. Cette charge de travail m’empêche de me libérer pour la journée. Toutefois, pour soutenir le comité, je me propose de ${s.offre} dès ce mardi. Je vous souhaite une belle journée d’échanges et je reste disponible au besoin.`,
          questions: [
            ['Quel est l’objet principal de ce courriel professionnel ?', 'Le refus motivé de participer à une journée d’insertion', 'Une demande d’augmentation de salaire pour heures supplémentaires', 'La démission immédiate d’un employé mécontent de son équipe'],
            ['Quelle contrainte professionnelle majeure justifie cette absence ?', `${s.motif[0].toUpperCase() + s.motif.slice(1)}`, 'Une invitation personnelle à une partie de golf privée', 'Une panne d’Internet à son domicile personnel'],
            ['Quelle aide concrète le collègue propose-t-il d’apporter malgré son absence ?', `${s.offre[0].toUpperCase() + s.offre.slice(1)}`, 'Payer de sa poche tous les repas des organisateurs', 'Embaucher un remplaçant externe à ses propres frais'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Courriel d'un collègue déclinant la journée de réseautage
    Object.assign(
      (rand) => {
        const slots = [
          { expediteur: 'Alexandre Roy', obligation: 'un rendez-vous médical spécialisé pour ma fille à l’hôpital', compensation: 'transmettre mes fiches d’information par courriel' },
          { expediteur: 'Patrick Lavoie', obligation: 'une convocation judiciaire comme témoin civique', compensation: 'enregistrer une brève capsule vidéo de bienvenue' },
          { expediteur: 'Guillaume Simard', obligation: 'une urgence familiale majeure qui nécessite ma présence', compensation: 'animer la rencontre virtuelle de suivi la semaine prochaine' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE ÉLECTRONIQUE INTERNE\nDe : ${s.expediteur}\nÀ : Direction des ressources humaines\nObjet : Absence à l’activité d’intégration\nChers collègues,\nJe tiens à vous aviser que je ne pourrai malheureusement pas me joindre à vous ce vendredi pour l’accueil des nouveaux employés. J’ai ${s.obligation}, une démarche fixée de longue date que je ne peux reporter. Je regrette sincèrement de manquer cette occasion d’échanger avec nos nouvelles recrues. Afin de soutenir le groupe malgré tout, je m’engage à ${s.compensation} avant mercredi midi. Merci beaucoup pour votre compréhension et bonne journée d’accueil à tous !`,
          questions: [
            ['Pourquoi l’employé écrit-il ce message à la direction ?', 'Pour justifier son absence à la journée d’accueil du personnel', 'Pour annoncer qu’il a accepté un emploi chez un concurrent', 'Pour demander une prime de transport pour un déplacement'],
            ['Quelle raison impérative empêche sa présence ce vendredi ?', `${s.obligation[0].toUpperCase() + s.obligation.slice(1)}`, 'Un voyage de vacances réservé à la dernière minute', 'Un simple oubli de la date dans son calendrier personnel'],
            ['Quelle solution alternative l’employé propose-t-il pour s’impliquer ?', `${s.compensation[0].toUpperCase() + s.compensation.slice(1)}`, 'Refuser de répondre aux questions des nouveaux arrivants', 'Transférer définitivement ses dossiers à un autre collègue'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Clavardage acceptation d'une offre en région
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Isabelle', ville: 'à Rimouski', poste: 'de rédactrice scientifique', cadre: 'un cadre de vie paisible au bord du fleuve' },
          { amie: 'Florence', ville: 'à Chicoutimi', poste: 'd’ingénieure en environnement', cadre: 'un accès direct aux sentiers de plein air' },
          { amie: 'Mélanie', ville: 'à Rouyn-Noranda', poste: 'd’agente culturelle', cadre: 'une communauté solidaire sans bouchons de circulation' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - DÉPART VERS UNE NOUVELLE RÉGION\n[16:45] ${s.amie} : Salut ! J’ai une grande décision à t’annoncer : j’ai dit oui pour le poste ${s.poste} ${s.ville} ! Je quitte la métropole le mois prochain. J’ai longuement réfléchi, mais ce qui a emporté mon choix, c’est ${s.cadre}. Même si mes amis vont me manquer, mon employeur m’accorde une aide financière pour mon déménagement et un horaire flexible. C’est un nouveau départ formidable. Je prépare un souper d’au revoir chez moi samedi prochain, viens fêter avec nous !`,
          questions: [
            ['Quelle décision majeure l’amie partage-t-elle dans ce clavardage ?', 'Son choix d’accepter un emploi et de s’installer en région', 'Son refus catégorique de quitter la ville de Montréal', 'L’achat d’un chalet pour passer ses fins de semaine'],
            ['Quel facteur principal a motivé son départ vers sa nouvelle ville ?', `${s.cadre[0].toUpperCase() + s.cadre.slice(1)}`, 'La promesse d’un emploi sans aucune responsabilité', 'L’obligation légale ordonnée par son ordre professionnel'],
            ['Quelle aide financière concrète son nouvel employeur lui verse-t-il ?', 'Une allocation pour faciliter son déménagement', 'Le remboursement total de ses frais d’études passés', 'L’achat complet d’une maison dans sa nouvelle municipalité'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-reading-4
  // Ex 0: Suivre la procédure pour mettre à jour ses renseignements personnels auprès d’un organisme gouvernemental.
  // Ex 1: Suivre la procédure de configuration d’une nouvelle imprimante sur son ordinateur.
  'n5-reading-4': [
    // Scenario 0 (Template, Ex 0): Procédure Service québécois de changement d'adresse (SQCA)
    Object.assign(
      (rand) => {
        const slots = [
          { organisme: 'la Régie de l’assurance maladie (RAMQ)', identifiant: 'votre numéro d’assurance maladie à douze caractères', confirmation: 'un numéro de confirmation officiel à sept chiffres' },
          { organisme: 'Revenu Québec et Retraite Québec', identifiant: 'votre numéro d’assurance sociale et votre code postal', confirmation: 'un accusé de réception électronique téléchargeable' },
          { organisme: 'la Société de l’assurance automobile (SAAQ)', identifiant: 'votre numéro de permis de conduire et votre date de naissance', confirmation: 'un avis de validation transmis par courriel sécurisé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE QUÉBÉCOIS DE CHANGEMENT D’ADRESSE\nPour mettre à jour votre adresse auprès de ministères dont ${s.organisme}, suivez ces quatre étapes. Étape 1 : Accédez au portail du gouvernement du Québec et sélectionnez « Déménagement ». Étape 2 : Confirmez votre identité en saisissant ${s.identifiant}. Étape 3 : Inscrivez votre nouvelle adresse et la date de votre emménagement. Étape 4 : Révisez le formulaire et cliquez sur « Transmettre ». Le système générera ${s.confirmation}. Conservez précieusement ce document pour vos dossiers administratifs.`,
          questions: [
            ['Quelle démarche citoyenne ce guide gouvernemental explique-t-il ?', 'La mise à jour de son adresse auprès des ministères québécois', 'La demande initiale d’un passeport canadien pour voyager', 'La déclaration des impôts sur le revenu de l’année passée'],
            ['Quelle information personnelle doit-on saisir à la deuxième étape ?', `On doit saisir ${s.identifiant}`, 'Le numéro de compte de sa carte de crédit bancaire', 'L’adresse courriel personnelle de son propriétaire de logement'],
            ['Que doit conserver le citoyen à la fin de la démarche en ligne ?', `${s.confirmation[0].toUpperCase() + s.confirmation.slice(1)}`, 'Une facture postale imprimée sur papier sécurisé', 'Une lettre manuscrite timbrée par le bureau de poste'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure mise à jour profil SAAQclic
    Object.assign(
      (rand) => {
        const slots = [
          { document: 'votre permis de conduire officiel', service: 'SAAQclic avec votre compte ClicSÉQUR', avis: 'un avis de confirmation par la poste sous dix jours' },
          { document: 'votre dossier de conducteur automobile', service: 'l’espace client sécurisé de la SAAQ', avis: 'une nouvelle étiquette autocollante d’adresse' },
          { document: 'vos pièces d’immatriculation de véhicule', service: 'le portail citoyen gouvernemental', avis: 'un message dans votre boîte de réception sécurisée' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE D’UTILISATION - DOSSIER CONDUCTEUR SAAQ\nLa loi exige d’aviser la Société de l’assurance automobile dans les trente jours suivant un déménagement pour ${s.document}. Voici la démarche. Connectez-vous d’abord à ${s.service}. Rendez-vous dans la section « Coordonnées » et cliquez sur « Modifier mon adresse ». Entrez votre nouveau code postal et votre numéro de logement. Vérifiez l’exactitude des données et validez la transaction. Vous recevrez ${s.avis}. Si votre ancienne adresse figure encore sur vos pièces après trente jours, vous risquez une amende lors d’un contrôle routier.`,
          questions: [
            ['Dans quel délai légal un citoyen doit-il mettre à jour son adresse à la SAAQ ?', 'Dans les trente jours suivant son changement d’adresse', 'Dans les quarante-huit heures suivant la signature du bail', 'Dans un délai maximal d’un an sans aucune pénalité'],
            ['Où doit-on se connecter pour faire cette modification par Internet ?', `On doit se connecter à ${s.service}`, 'Sur le site public d’un concessionnaire automobile', 'Sur les réseaux sociaux de la police municipale'],
            ['Que reçoit le conducteur après avoir validé son changement en ligne ?', `${s.avis[0].toUpperCase() + s.avis.slice(1)}`, 'Une amende forfaitaire pour utilisation du portail en ligne', 'Une invitation obligatoire à passer un nouvel examen de conduite'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure d'installation d'une imprimante Wi-Fi
    Object.assign(
      (rand) => {
        const slots = [
          { modele: 'l’imprimante multifonction sans fil', reseau: 'votre réseau Wi-Fi domestique', bouton: 'le bouton Wi-Fi pendant trois secondes', test: 'imprimer une page de test pour vérifier la qualité' },
          { modele: 'l’imprimante laser noir et blanc', reseau: 'le réseau Internet local du bureau', bouton: 'la touche WPS de votre routeur', test: 'lancer l’impression du document d’accueil' },
          { modele: 'l’appareil à jet d’encre couleur', reseau: 'votre connexion sans fil personnelle', bouton: 'l’icône Réseau sur l’écran tactile', test: 'exécuter l’alignement des têtes d’impression' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DE DÉMARRAGE - INSTALLATION D’IMPRIMANTE\nPour configurer ${s.modele} sur votre ordinateur, suivez ces instructions. 1. Branchez le cordon d’alimentation et allumez l’appareil. 2. Connectez l’imprimante à ${s.reseau} en maintenant enfoncé ${s.bouton}. 3. Sur votre ordinateur, ouvrez les « Paramètres », cliquez sur « Imprimantes », puis sélectionnez « Ajouter un appareil ». Votre ordinateur détectera automatiquement l’imprimante. 4. Téléchargez le pilote recommandé et terminez en prenant soin d’${s.test}. En cas d’erreur de détection, redémarrez votre routeur avant de réessayer.`,
          questions: [
            ['Quel équipement informatique ce manuel d’instructions aide-t-il à installer ?', 'Une nouvelle imprimante sans fil connectée à un ordinateur', 'Un écran d’ordinateur de jeu à haute résolution', 'Un clavier et une souris sans fil pour tablette'],
            ['Quelle manipulation permet de connecter l’imprimante au réseau ?', `Maintenir enfoncé ${s.bouton}`, 'Débrancher et rebrancher le câble secteur dix fois', 'Appuyer sur la touche Majuscule du clavier d’ordinateur'],
            ['Quelle action finale permet de s’assurer du bon fonctionnement de l’appareil ?', `${s.test[0].toUpperCase() + s.test.slice(1)}`, 'Laisser l’appareil éteint pendant une journée complète', 'Vendre immédiatement l’ancienne imprimante sur un site Web'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Configuration d'une imprimante par câble USB
    Object.assign(
      (rand) => {
        const slots = [
          { port: 'un port USB libre de votre ordinateur', cartouche: 'les rubans de protection orange des cartouches', site: 'le site officiel d’assistance du fabricant' },
          { port: 'la prise USB à l’arrière de l’ordinateur', cartouche: 'les languettes de sécurité du toner laser', site: 'la page de téléchargement des pilotes officiels' },
          { port: 'l’adaptateur USB fourni avec votre appareil', cartouche: 'les bandes adhésives de protection', site: 'le centre de soutien technique en ligne' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE D’INSTALLATION - CONNEXION FILAIRE USB\nPour relier votre imprimante sans passer par le réseau sans fil, respectez ces étapes simples. 1. Retirez tous les emballages et enlevez ${s.cartouche}. 2. Insérez le papier dans le bac et allumez l’appareil. 3. Rendez-vous sur ${s.site} pour installer le logiciel requis avant de brancher le câble. 4. Lorsque le programme vous y invite, reliez le câble USB entre l’imprimante et ${s.port}. Le système terminera la configuration en quelques secondes. Imprimez une page d’essai pour confirmer que la liaison est réussie.`,
          questions: [
            ['Quelle méthode de raccordement de l’imprimante est détaillée ici ?', 'Une connexion directe par câble USB entre les appareils', 'Une liaison par satellite longue portée', 'Une connexion sans fil par signal Bluetooth'],
            ['Que faut-il faire avant de brancher le câble physique USB ?', 'Installer d’abord le logiciel téléchargé sur le site officiel', 'Changer la carte mère de l’ordinateur de bureau', 'Formater complètement le disque dur de la machine'],
            ['Quel élément de protection doit-on enlever délicatement au début ?', `${s.cartouche[0].toUpperCase() + s.cartouche.slice(1)}`, 'La vitre supérieure du numériseur de documents', 'Le cordon électrique d’alimentation permanente'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Mise à jour des renseignements bancaires en ligne
    Object.assign(
      (rand) => {
        const slots = [
          { institution: 'votre coopérative Desjardins', champ: 'votre numéro de téléphone et votre courriel', securite: 'un code de sécurité temporaire par message texte' },
          { institution: 'la Banque Nationale', champ: 'votre adresse postale et votre employeur', securite: 'un mot de passe unique sur votre application' },
          { institution: 'la Banque Royale', champ: 'vos coordonnées personnelles et vos avis', securite: 'une notification d’approbation sur votre appareil' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PROCÉDURE BANCAIRE - MISE À JOUR DE VOTRE DOSSIER\nMaintenez vos coordonnées à jour pour assurer la sécurité de vos comptes chez ${s.institution}. Suivez ce guide depuis votre ordinateur. Étape 1 : Ouvrez votre session avec votre identifiant et votre mot de passe habituels. Étape 2 : Cliquez sur « Paramètres du compte », puis choisissez « Renseignements personnels ». Étape 3 : Modifiez ${s.champ}. Étape 4 : Pour valider votre identité, vous recevrez ${s.securite}. Entrez ce code dans la case requise et confirmez. Vos nouvelles informations entreront en vigueur immédiatement sur vos comptes.`,
          questions: [
            ['Quelle opération de gestion de compte ce tutoriel permet-il de réaliser ?', 'Mettre à jour ses renseignements personnels sur le portail bancaire', 'Demander un prêt hypothécaire pour une maison', 'Ouvrir un compte commercial pour une grande entreprise'],
            ['Quel moyen de sécurité est utilisé pour confirmer l’identité du titulaire ?', `${s.securite[0].toUpperCase() + s.securite.slice(1)}`, 'Un appel vidéo obligatoire avec le directeur de succursale', 'La visite en personne d’un agent de sécurité à domicile'],
            ['Quand les modifications enregistrées prennent-elles effet ?', 'Immédiatement après la confirmation du code de sécurité', 'Dans un délai de trente jours ouvrables après examen', 'Uniquement au début de l’année civile suivante'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n5-reading-5
  // Ex 0: Comprendre, dans le courriel d’une amie, des suggestions sur la préparation de collations santé pour les enfants.
  // Ex 1: Comprendre des conseils sur une page Web en vue de l’achat de produits économiseurs d’eau chaude.
  'n5-reading-5': [
    // Scenario 0 (Template, Ex 0): Courriel collations santé pour l'école
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Geneviève', collation: 'des muffins maison aux carottes et à l’avoine sans sucre', fruit: 'des tranches de pomme avec du yogourt nature', regle: 'interdiction absolue des noix et des arachides' },
          { amie: 'Isabelle', collation: 'des boules d’énergie aux dattes et graines de tournesol', fruit: 'des bâtonnets de concombre avec un houmous doux', regle: 'politique sans graines de sésame ni fruits à coque' },
          { amie: 'Véronique', collation: 'des biscuits tendres aux bananes et graines de chia', fruit: 'des cubes de melon avec du fromage cheddar doux', regle: 'respect strict de la liste sans allergènes de la classe' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL AMICAL - IDÉES DE COLLATIONS ÉCOLE\nDe : ${s.amie} Bouchard\nÀ : Marie-Ève Gagnon\nObjet : Mes recettes faciles de collations pour la rentrée !\nChère Marie-Ève,\nTu me disais hier que tu manquais d’idées pour les collations des enfants. Voici mes trouvailles nutritives préférées ! Chaque dimanche, je cuisine ${s.collation}. C’est économique et riche en fibres. Pour la collation du matin, j’ajoute toujours ${s.fruit}. N’oublie pas que l’école applique une ${s.regle}, alors évite les beurres d’amandes industriels. Si tu veux, je t’enverrai mes recettes complètes par courriel ce soir. Dis-moi si tes enfants aiment ça ! Bises, ${s.amie}`,
          questions: [
            ['Quel est le thème des suggestions partagées dans ce courriel amical ?', 'Des idées saines et pratiques de collations scolaires pour enfants', 'Un menu gastronomique complet pour un souper entre adultes', 'Une liste d’achats de fournitures et de vêtements d’hiver'],
            ['Quelle recette maison l’amie prépare-t-elle en quantité chaque dimanche ?', `${s.collation[0].toUpperCase() + s.collation.slice(1)}`, 'Des beignes frits trempés dans du sirop d’érable', 'Des frites surgelées réchauffées au four micro-ondes'],
            ['Quelle consigne scolaire primordiale rappelle-t-elle pour la sécurité ?', `${s.regle[0].toUpperCase() + s.regle.slice(1)}`, 'L’obligation de manger exclusivement des aliments chauds', 'L’interdiction d’apporter des bouteilles d’eau réutilisables'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Courriel collations santé pour la garderie
    Object.assign(
      (rand) => {
        const slots = [
          { maman: 'Audrey', snack: 'des mini-galettes de riz à la purée de courge', salade: 'une salade de fruits frais coupés en dés', conseil: 'préparer les portions dans des petits contenants réutilisables' },
          { maman: 'Nathalie', snack: 'des barres tendres maison à l’avoine et canneberges', salade: 'des bouquets de brocoli avec trempette légère', conseil: 'congeler la moitié de la recette pour gagner du temps' },
          { maman: 'Mélanie', snack: 'des galettes moelleuses aux pommes et graines de lin', salade: 'des pointes de pita complet avec du guacamole', conseil: 'impliquer les enfants pour leur donner envie de goûter' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE AMICAL - ASTUCES COLLATIONS GARDERIE\nDe : ${s.maman} Tremblay\nÀ : Julie Fortin\nObjet : Recommandations de collations saines pour la garderie !\nAllô Julie ! Comme promis, voici mes conseils pour les collations de nos tout-petits. Pour remplacer les biscuits trop sucrés de l’épicerie, j’ai adopté ${s.snack}. Les enfants adorent la texture et ça leur donne une énergie durable sans coup de fatigue. J’accompagne toujours le tout avec ${s.salade}. Mon astuce préférée pour le matin : ${s.conseil}. Ça prend vingt minutes le dimanche et ta semaine est prête. Essaie ça et donne-m’en des nouvelles au parc !`,
          questions: [
            ['Quel est le principal objectif des conseils culinaires de la maman ?', 'Remplacer les collations commerciales par des choix équilibrés', 'Organiser un banquet d’anniversaire pour vingt enfants', 'Apprendre à cuisiner des repas complets au restaurant'],
            ['Quelle collation nutritive maison propose-t-elle pour éviter les sucres rapides ?', `${s.snack[0].toUpperCase() + s.snack.slice(1)}`, 'Des tablettes entières de chocolat au lait industriel', 'Des croustilles très salées achetées au dépanneur'],
            ['Quelle astuce d’organisation pratique recommande-t-elle pour le matin ?', `${s.conseil[0].toUpperCase() + s.conseil.slice(1)}`, 'Acheter des collations jetables emballées sous plastique', 'Demander à la garderie de fournir toute la nourriture'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Conseils d'Hydro-Québec pour économiser l'eau chaude
    Object.assign(
      (rand) => {
        const slots = [
          { produit: 'une pomme de douche à débit réduit certifiée WaterSense', reduction: 'quarante pour cent de consommation d’eau chaude', geste: 'laver vos vêtements à l’eau froide dans la laveuse' },
          { produit: 'des aérateurs de robinet à faible débit pour la maison', reduction: 'trente pour cent d’énergie liée au chauffe-eau', geste: 'prendre des douches courtes de moins de cinq minutes' },
          { produit: 'un régulateur de pression pour chauffe-eau domestique', reduction: 'deux cents dollars par an sur votre facture d’électricité', geste: 'réparer rapidement tout robinet qui fuit dans l’appartement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PAGE WEB CONSEILS ÉNERGIE - HYDRO-QUÉBEC\nLe chauffage de l’eau représente près de vingt pour cent de votre facture d’électricité. Pour réduire vos coûts tout en préservant l’environnement, nous vous recommandons d’installer ${s.produit}. Cet équipement simple permet d’économiser ${s.reduction} sans sacrifier votre confort. En complément, pensez à ${s.geste}. Vérifiez également que la température de votre chauffe-eau est réglée à soixante degrés Celsius : c’est le niveau idéal pour prévenir les bactéries tout en évitant le gaspillage d’énergie. Consultez nos rabais instantanés en quincaillerie participante dès aujourd’hui !`,
          questions: [
            ['Quel est le thème principal de cette page Web d’information ?', 'Des conseils pratiques pour réduire sa consommation d’eau chaude', 'Un guide pour choisir une nouvelle thermopompe de climatisation', 'Une procédure de réclamation après une panne de courant majeure'],
            ['Quel équipement économiseur d’eau chaude est expressément recommandé ?', `${s.produit[0].toUpperCase() + s.produit.slice(1)}`, 'Une piscine chauffée en permanence dans la cour arrière', 'Un deuxième chauffe-eau réservé uniquement aux invités'],
            ['Quelle température idéale est recommandée pour le réservoir d’eau chaude ?', 'Une température stable réglée à soixante degrés Celsius', 'Une température très basse de vingt degrés pour économiser', 'Une température maximale de cent degrés pour stériliser'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Guide écologique d'achat de produits économiseurs d'eau
    Object.assign(
      (rand) => {
        const slots = [
          { dispositif: 'un mitigeur thermostatique avec bouton d’arrêt temporaire', avantage: 'bloquer l’eau pendant qu’on se savonne', retour: 'rentabilisé en trois mois d’utilisation' },
          { dispositif: 'un tuyau de douche avec coupe-débit intégré', avantage: 'réduire le débit à six litres par minute', retour: 'amorti sur votre première facture d’énergie' },
          { dispositif: 'des embouts régulateurs de débit pour robinetterie', avantage: 'mélanger de l’air à l’eau pour garder une bonne pression', retour: 'très peu coûteux et posé sans outils en cinq minutes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE MAISON ÉCOLOGIQUE - DISPOSITIFS D’EAU\nPour réduire votre consommation d’énergie à la maison, le remplacement de vos accessoires de plomberie est une excellente décision. Lors de votre visite en quincaillerie, privilégiez ${s.dispositif}. Ce produit offre l’avantage de ${s.avantage}. Cet achat est rapidement ${s.retour}. N’oubliez pas de mesurer le diamètre de vos tuyaux avant l’achat afin de choisir le modèle compatible. Enfin, profitez des programmes de votre municipalité, qui offre souvent des trousses gratuites de produits économiseurs d’eau sur présentation d’une preuve de résidence.`,
          questions: [
            ['Que conseille cet article de rénovation résidentielle aux propriétaires ?', 'Acheter des dispositifs pour réduire le gaspillage d’eau chaude', 'Remplacer toute la tuyauterie de la maison par du cuivre neuf', 'Faire creuser un puits privé dans son jardin de banlieue'],
            ['Quelle caractéristique avantageuse du dispositif est soulignée ?', `Le dispositif permet de ${s.avantage}`, 'Il augmente la consommation totale d’eau pour laver plus vite', 'Il nécessite l’intervention coûteuse d’un maître électricien'],
            ['Comment peut-on parfois obtenir ces équipements gratuitement ?', 'Via des trousses subventionnées par sa propre municipalité', 'En participant à un tirage au sort commercial à la télévision', 'En achetant d’abord trois gros électroménagers neufs'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Courriel collations santé pour le sport
    Object.assign(
      (rand) => {
        const slots = [
          { entraineur: 'Sophie', collation: 'des quartiers d’orange et des galettes à l’avoine', boisson: 'de l’eau fraîche dans une gourde bien identifiée' },
          { entraineur: 'Valérie', collation: 'des raisins sans pépins et des morceaux de fromage', boisson: 'une eau fraîche infusée avec du citron et de la menthe' },
          { entraineur: 'Chantal', collation: 'des bananes mûres et des barres tendres maison', boisson: 'de l’eau plate sans ajout de sucre ni de jus' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE DU CLUB SPORTIF - COLLATIONS TOURNOI DE SOCCER\nDe : ${s.entraineur} Roy, responsable jeunesse\nÀ : Parents des joueurs de la ligue récréative\nObjet : Recommandations nutritionnelles pour le tournoi\nChers parents,\nEn vue de notre tournoi de soccer de samedi, voici quelques suggestions pour garder nos jeunes sportifs en forme. Entre deux matchs intenses, privilégiez ${s.collation}. Les glucides naturels aident à reconstituer l’énergie sans alourdir la digestion. Pour l’hydratation, la seule boisson nécessaire est ${s.boisson}. Évitez les boissons énergisantes et les jus très sucrés qui causent des maux de ventre pendant l’effort. Merci de votre précieuse collaboration et bon match à tous !`,
          questions: [
            ['Quel est l’objectif de cette note transmise par l’entraîneuse ?', 'Recommander des collations adaptées aux jeunes sportifs en tournoi', 'Anuler tous les entraînements extérieurs en raison de la chaleur', 'Exiger le paiement des cotisations financières de l’équipe'],
            ['Quelle collation est recommandée entre deux matchs pour recharger l’énergie ?', `${s.collation[0].toUpperCase() + s.collation.slice(1)}`, 'Des sacs géants de bonbons acidulés très colorés', 'Des portions de poutine avec sauce très grasse'],
            ['Quelle boisson doit-on privilégier pour l’hydratation des joueurs ?', `${s.boisson[0].toUpperCase() + s.boisson.slice(1)}`, 'Des boissons énergisantes pour sportifs professionnels', 'Des sodas très gazeux et riches en caféine'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 6 - LISTENING
  // ===========================================================================
// n6-listening-0
  // Ex 0: Comprendre des informations sur le fonctionnement et les règlements du service de garde de son enfant.
  // Ex 1: Comprendre des informations données par sa propriétaire concernant des travaux majeurs effectués dans son immeuble.
  'n6-listening-0': [
    // Scenario 0 (Template, Ex 0): Règlements du CPE / service de garde
    Object.assign(
      (rand) => {
        const slots = [
          { cpe: 'au Centre de la petite enfance Les Petits Écureuils', accueil: 'entre sept heures et neuf heures', retard: 'huit heures trente', allergie: 'aucun aliment contenant des arachides ou des noix' },
          { cpe: 'au service de garde Les Petits Explorateurs', accueil: 'entre sept heures et huit heures quarante-cinq', retard: 'huit heures quinze', allergie: 'aucun produit contenant des fruits à coque ou du sésame' },
          { cpe: 'à la garderie subventionnée Le Jardin Fleuri', accueil: 'entre sept heures quinze et neuf heures', retard: 'huit heures quarante-cinq', allergie: 'aucun produit à base d’amandes ou de graines' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour à tous les parents ! Avant d’entamer cette nouvelle année ${s.cpe}, je désire vous rappeler quelques règlements essentiels pour la sécurité et le bien-être de vos enfants. L’accueil du matin s’effectue ${s.accueil}. Si votre enfant doit arriver en retard ou s’absenter pour des motifs médicaux, vous devez obligatoirement aviser la réception avant ${s.retard} par l’application mobile. En raison d’allergies sévères parmi nos pensionnaires, nous appliquons une politique de tolérance zéro : ${s.allergie} n’est admis dans les boîtes à lunch. Enfin, n’oubliez pas d’apporter deux ensembles de vêtements de rechange étiquetés au nom de votre enfant pour les jeux d’eau extérieurs. Merci de votre précieuse collaboration !`,
          questions: [
            ['Quel est l’objet de cette communication de la directrice ?', 'Le rappel des règlements et du fonctionnement du service de garde', 'La présentation d’un nouveau programme éducatif en musique', 'L’annonce d’une hausse des tarifs quotidiens de garde'],
            ['Avant quelle heure les parents doivent-ils obligatoirement signaler une absence ?', `Avant ${s.retard} sur l’application mobile`, 'Avant six heures du matin par message vocal', 'Avant midi auprès de l’éducatrice de garde'],
            ['Quelle exigence stricte concerne la sécurité alimentaire des enfants ?', `${s.allergie[0].toUpperCase() + s.allergie.slice(1)} n’est admis`, 'Les repas doivent être livrés chaque midi par un traiteur', 'Tous les enfants doivent suivre le même régime végétarien'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Fonctionnement du service de garde scolaire
    Object.assign(
      (rand) => {
        const slots = [
          { ecole: 'de l’école primaire Saint-Barthélemy', fermeture: 'dix-huit heures précises', penalite: 'des frais de retard d’un dollar la minute', sortie: 'une autorisation écrite datée et signée' },
          { ecole: 'de l’école primaire de l’Étoile-du-Nord', fermeture: 'dix-sept heures quarante-cinq', penalite: 'une pénalité financière de dix dollars par tranche de dix minutes', sortie: 'une procuration officielle enregistrée au secrétariat' },
          { ecole: 'du pavillon primaire Saint-Viateur', fermeture: 'dix-huit heures', penalite: 'une tarification spéciale exigible dès la fermeture', sortie: 'une confirmation électronique sur le portail sécurisé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Chers parents des élèves ${s.ecole}, voici les consignes relatives au service de garde pour les journées de classe et les journées pédagogiques. Notre service ferme ses portes à ${s.fermeture}. Tout retard le soir entraînera ${s.penalite}, payable directement à l’éducatrice de service. Si une personne autre que les parents désignés vient chercher votre enfant en fin de journée, nous exigeons ${s.sortie} accompagnée d’une pièce d’identité avec photo. Pour les journées de formation des enseignants, l’inscription doit être complétée dix jours à l’avance afin de prévoir le nombre adéquat d’animateurs pour les sorties récréatives. Nous comptons sur votre ponctualité pour faciliter le bon déroulement de nos activités quotidiennes.`,
          questions: [
            ['Quel sujet administratif la responsable du service de garde aborde-t-elle ?', 'Le fonctionnement et les règles de ponctualité du service de garde', 'Le choix du matériel scolaire pour les cours d’arts plastiques', 'Le calendrier des examens finaux de fin d’année scolaire'],
            ['Quelle conséquence découle d’un retard des parents après la fermeture ?', `${s.penalite[0].toUpperCase() + s.penalite.slice(1)}`, 'Une exclusion définitive immédiate de l’enfant du groupe', 'Un appel automatique aux services de protection de la jeunesse'],
            ['Que faut-il présenter si une tierce personne vient chercher l’enfant ?', `${s.sortie[0].toUpperCase() + s.sortie.slice(1)} et une pièce d’identité`, 'Un contrat notarié attestant le lien de parenté', 'Une promesse verbale communiquée par cellulaire le jour même'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Propriétaire annonçant des travaux de toiture et balcons
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Madame Tremblay', date: 'lundi le quinze avril', duree: 'trois semaines complètes', restriction: 'retirer tous vos meubles des balcons et fermer les fenêtres' },
          { proprio: 'Madame Bouchard', date: 'mardi le deux mai', duree: 'quatre semaines de travaux', restriction: 'libérer entièrement les coursives et stationner sur la rue' },
          { proprio: 'Madame Mercier', date: 'le premier juin', duree: 'deux semaines intensives', restriction: 'couvrir vos objets fragiles et garder les stores baissés' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour à tous les résidents de l’immeuble. C’est votre propriétaire, ${s.proprio}. Je vous appelle pour vous transmettre des informations détaillées concernant les travaux majeurs de rénovation de notre toiture et de nos balcons extérieurs. Le chantier débutera ${s.date} et s’échelonnera sur ${s.duree}. Les ouvriers travailleront du lundi au vendredi, entre sept heures trente et dix-sept heures. Durant cette période, il y aura du bruit de martèlement et de la poussière. Vous devez impérativement ${s.restriction} dès ce week-end. L’accès à la cour arrière sera également interdit pour des raisons de sécurité pendant l’installation des échafaudages. Je vous remercie chaleureusement pour votre patience et votre coopération !`,
          questions: [
            ['Quelle annonce majeure la propriétaire communique-t-elle aux locataires ?', 'Le déroulement de travaux de rénovation de la toiture et des balcons', 'L’augmentation soudaine du prix des loyers pour tous les résidents', 'La vente de l’immeuble à une société immobilière internationale'],
            ['Quels horaires de travail les entrepreneurs respecteront-ils sur place ?', 'Du lundi au vendredi entre sept heures trente et dix-sept heures', 'Tous les soirs de la semaine entre dix-huit heures et minuit', 'Uniquement les fins de semaine pour ne pas déranger le jour'],
            ['Quelle consigne obligatoire les locataires doivent-ils appliquer chez eux ?', `Ils doivent ${s.restriction}`, 'Ils doivent quitter définitivement leur logement pendant un mois', 'Ils doivent surveiller eux-mêmes le travail des ouvriers'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire annonçant le remplacement de la plomberie
    Object.assign(
      (rand) => {
        const slots = [
          { batiment: 'du complexe résidentiel Le Saint-Laurent', coupure: 'les mardis et jeudis de neuf heures à seize heures', acces: 'permettre aux plombiers d’accéder aux tuyaux sous votre évier' },
          { batiment: 'de la coopérative d’habitation Les Pins', coupure: 'les lundis et mercredis de huit heures à quinze heures', acces: 'libérer l’espace autour du chauffe-eau dans votre buanderie' },
          { batiment: 'des appartements du Manoir Mont-Royal', coupure: 'tous les matins de cette semaine entre huit heures et midi', acces: 'dégager complètement l’accès aux conduites de la salle de bain' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Avis important à l’intention de tous les locataires ${s.batiment}. Notre syndicat de gestion entreprendra dès la semaine prochaine le remplacement complet de la tuyauterie d’eau potable de tout l’immeuble. Cette mise aux normes entraînera des coupures d’eau régulières ${s.coupure}. Nous vous conseillons de remplir des récipients d’eau la veille pour vos besoins essentiels. Chaque locataire doit obligatoirement être présent ou confier ses clés au concierge pour ${s.acces}. Des points de distribution d’eau embouteillée seront installés dans le hall d’entrée pour dépanner les familles. Nous regrettons ces inconvénients temporaires qui garantiront toutefois la pérennité et la salubrité de notre réseau pour les trente prochaines années.`,
          questions: [
            ['Quel projet de rénovation technique est présenté dans ce message vocal ?', 'Le remplacement complet de la plomberie de tout l’immeuble', 'La repeinte des couloirs et le remplacement des tapis', 'L’installation de caméras de surveillance dans le stationnement'],
            ['Quand les coupures d’eau potable auront-elles lieu dans le complexe ?', `${s.coupure[0].toUpperCase() + s.coupure.slice(1)}`, 'Chaque nuit entre minuit et six heures du matin', 'Pendant toute la fin de semaine sans aucune interruption'],
            ['Quelle obligation incombe à chaque occupant du logement pour les travaux ?', `Permettre l’accès aux conduites intérieures par sa présence ou ses clés`, 'Acheter lui-même les tuyaux de cuivre chez le fournisseur', 'Nettoyer les parties communes après le départ des plombiers'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Règlements d'une garderie en milieu familial
    Object.assign(
      (rand) => {
        const slots = [
          { responsable: 'Madame Chantal Roy', fermeture: 'dix-sept heures trente', signature: 'la feuille de présence officielle du ministère', vaccin: 'le carnet de vaccination à jour de votre tout-petit' },
          { responsable: 'Madame Sylvie Lavoie', fermeture: 'dix-sept heures quinze', signature: 'le registre d’émargement quotidien', vaccin: 'la fiche médicale annuelle remplie par votre médecin' },
          { responsable: 'Madame Josée Gagnon', fermeture: 'dix-sept heures quarante-cinq', signature: 'le formulaire électronique sur tablette à l’entrée', vaccin: 'la confirmation d’inscription avec antécédents médicaux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour chers parents. C’est ${s.responsable}, responsable du service de garde éducatif en milieu familial. Je tiens à préciser quelques consignes d’organisation pour que tout le monde passe une excellente session. Veuillez noter que notre journée se termine à ${s.fermeture} précises. Le soir, prenez deux minutes pour signer ${s.signature} avant de quitter avec votre enfant, car cette démarche est vérifiée lors des inspections provinciales. Si votre enfant présente de la fièvre supérieure à trente-huit degrés ou des symptômes contagieux, il doit demeurer à la maison jusqu’à disparition complète des symptômes pendant vingt-quatre heures. Enfin, n’oubliez pas de me remettre ${s.vaccin} avant vendredi prochain. Je vous remercie pour votre belle collaboration !`,
          questions: [
            ['Quel cadre éducatif fait l’objet de cette mise au point de règlements ?', 'Un service de garde éducatif en milieu familial', 'Une école de musique récréative pour enfants', 'Un camp de vacances de deux semaines en forêt'],
            ['Quelle formalité administrative obligatoire les parents doivent-ils faire le soir ?', `Signer ${s.signature} à l’entrée`, 'Régler le paiement de la garde en argent comptant', 'Laisser un pourboire dans la boîte prévue à cet effet'],
            ['Quelle règle sanitaire stricte s’applique en cas de fièvre de l’enfant ?', 'Rester à la maison jusqu’à disparition des symptômes durant 24 h', 'Prendre immédiatement un rendez-vous à l’urgence de l’hôpital', 'Apporter une attestation écrite signée par un pharmacien'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-listening-1
  // Ex 0: Description de la cérémonie d’ouverture d’une compétition sportive internationale dans une émission spéciale à la radio.
  // Ex 1: Description du profil d’une experte invitée par son entreprise pour donner une formation.
  'n6-listening-1': [
    // Scenario 0 (Template, Ex 0): Cérémonie d'ouverture à la radio - Championnat mondial
    Object.assign(
      (rand) => {
        const slots = [
          { competition: 'des Championnats mondiaux d’athlétisme', ville: 'de Montréal', porte_drapeau: 'la sprinteuse olympique québécoise', foule: 'quarante mille spectateurs enthousiastes' },
          { competition: 'des Jeux mondiaux universitaires', ville: 'de Québec', porte_drapeau: 'le champion canadien de plongeon', foule: 'trente-cinq mille personnes réunies' },
          { competition: 'du Grand Prix cycliste international', ville: 'de Gatineau', porte_drapeau: 'la cycliste chevronnée médaillée d’or', foule: 'vingt-cinq mille amateurs réunis' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Bienvenue sur nos ondes pour cette émission spéciale consacrée à la cérémonie d’ouverture ${s.competition}, qui s’est tenue hier soir dans le grand stade ${s.ville}. Le spectacle a débuté par un hommage vibrant aux Premières Nations, suivi d’une chorégraphie spectaculaire alliant danses traditionnelles et projections lumineuses sur une gigantesque surface de glace. L’émotion a atteint son comble lors du défilé des délégations, lorsque ${s.porte_drapeau} a pénétré dans l’arène sous les ovations de ${s.foule}. La flamme officielle a ensuite été allumée par deux jeunes athlètes de la relève locale au milieu d’un impressionnant feu d’artifice. Les compétitions s’amorceront dès ce matin avec les premières rondes éliminatoires.`,
          questions: [
            ['Quel événement festif et sportif est décrit par le journaliste à la radio ?', 'La cérémonie d’ouverture d’une grande compétition internationale', 'Le bilan des médailles obtenues à la fin des Jeux olympiques', 'La conférence de presse annonçant l’annulation d’un tournoi'],
            ['Par quoi le spectacle inaugural a-t-il débuté ?', 'Par un hommage vibrant aux Premières Nations et des projections', 'Par un match amical de soccer entre les deux pays hôtes', 'Par le discours politique du ministre de l’Éducation'],
            ['Qui a eu l’honneur d’allumer la flamme officielle de la compétition ?', 'Deux jeunes athlètes prometteurs de la relève locale', 'Le maire de la ville entouré de gardes de sécurité', 'Le président d’une grande entreprise commanditaire'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Cérémonie d'ouverture - Jeux d'hiver internationaux
    Object.assign(
      (rand) => {
        const slots = [
          { jeu: 'des Jeux internationaux d’hiver de la jeunesse', region: 'dans les Laurentides', spectacle: 'un conte musical poétique inspiré des légendes boréales', serment: 'une jeune patineuse de vitesse de la région' },
          { jeu: 'des Championnats mondiaux de ski nordique', region: 'au Mont-Sainte-Anne', spectacle: 'une fresque visuelle retraçant l’histoire des coureurs des bois', serment: 'un fondeur québécois sélectionné pour la première fois' },
          { jeu: 'du Festival international des sports de neige', region: 'au Saguenay', spectacle: 'une symphonie de percussions jouée sur des blocs de glace sculptés', serment: 'une skieuse acrobatique acclamée par la foule' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Ici Ici Première en direct de la soirée inaugurale ${s.jeu}, organisée cette semaine ${s.region}. Malgré un vent glacial qui soufflait sur la place des festivals, les spectateurs ont assisté à un déploiement artistique d’une rare beauté. La mise en scène proposait ${s.spectacle}, interprété par plus de trois cents artistes bénévoles. Après le salut des dignitaires, ${s.serment} a prononcé le serment des athlètes au nom de tous les participants, promettant loyauté et esprit d’équipe. La soirée s’est conclue dans une ambiance chaleureuse avec un concert de musique traditionnelle où toute la foule s’est mise à chanter et danser pour braver le froid.`,
          questions: [
            ['Quel événement culturel et sportif radiodiffusé ce reportage fait-il revivre ?', 'L’inauguration officielle d’une compétition hivernale internationale', 'Un gala de charité pour financer des bourses d’études', 'Une compétition de bûcherons amateurs retransmise à la télévision'],
            ['Quelle œuvre originale a constitué le cœur du spectacle d’ouverture ?', `${s.spectacle[0].toUpperCase() + s.spectacle.slice(1)}`, 'Une course de motoneiges rapides autour de la patinoire', 'Une démonstration militaire avec des chars d’assaut'],
            ['Comment s’est clôturée la cérémonie d’ouverture dans l’arène ?', 'Par un concert festif traditionnel où les spectateurs ont dansé', 'Par une évacuation d’urgence causée par une tempête de vent', 'Par la remise des premières médailles d’or du tournoi'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Profil d'une experte en cybersécurité invitée
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Docteure Nadia Belkacem', domaine: 'la cybersécurité et la protection des données gouvernementales', firme: 'pendant dix ans pour l’Agence spatiale canadienne', publication: 'un guide de référence sur la prévention du piratage informatique' },
          { nom: 'Docteure Valérie Côté', domaine: 'l’intelligence artificielle appliquée aux réseaux financiers', firme: 'au sein d’une grande banque québécoise comme directrice', publication: 'deux ouvrages universitaires traduits en plusieurs langues' },
          { nom: 'Docteure Amina Traoré', domaine: 'la gouvernance technologique et la gestion des risques numériques', firme: 'comme consultante stratégique pour des ministères fédéraux', publication: 'une série d’articles primés sur l’éthique des algorithmes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour chers collègues. C’est un immense honneur de vous présenter notre formatrice invitée pour cette journée de perfectionnement professionnel, ${s.nom}. Diplômée de Polytechnique Montréal et titulaire d’un doctorat en génie informatique, elle est une sommité reconnue dans le domaine de ${s.domaine}. Avant de fonder son propre cabinet de consultation, elle a œuvré ${s.firme}. Elle est également l’auteure de ${s.publication}. Aujourd’hui, elle partagera avec notre équipe des méthodes concrètes pour identifier les vulnérabilités de nos systèmes internes et sécuriser nos échanges de courriels. Je vous invite à lui réserver un accueil des plus chaleureux et à préparer vos questions pour la période d’échange finale.`,
          questions: [
            ['Quel est le profil de la personne invitée dans l’entreprise ?', 'Une experte chevronnée en informatique venue donner une formation', 'Une nouvelle employée junior qui commence son stage pratique', 'Une cliente mécontente venue exposer une plainte de service'],
            ['Quelle expérience professionnelle significative a-t-elle acquise par le passé ?', `Elle a œuvré ${s.firme}`, 'Elle a géré un magasin de matériel informatique au détail', 'Elle a enseigné le français dans une école primaire de quartier'],
            ['Quel objectif principal poursuit cette session de formation pour les employés ?', 'Identifier les vulnérabilités et sécuriser les échanges informatiques', 'Apprendre à programmer des jeux vidéo sur téléphone mobile', 'Négocier de nouveaux contrats d’achat avec des fournisseurs'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Profil d'une experte en gestion de la diversité et climat de travail
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Madame Sophie Desrosiers', expertise: 'la médiation organisationnelle et la diversité en milieu de travail', etudes: 'à l’École nationale d’administration publique', mandat: 'auprès d’hôpitaux publics et de cégeps de la province' },
          { nom: 'Madame Monique Baril', expertise: 'la santé psychologique au travail et la prévention du harcèlement', etudes: 'à l’Université de Montréal en psychologie industrielle', mandat: 'pour de grandes coopératives financières et des municipalités' },
          { nom: 'Madame Diane Beaulieu', expertise: 'le leadership inclusif et la conciliation travail-famille', etudes: 'à l’Université Laval en relations industrielles', mandat: 'au sein de sociétés d’État et d’organismes communautaires' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bienvenue à notre atelier annuel sur le bien-être au travail. Nous avons le privilège d’accueillir aujourd’hui ${s.nom}, une spécialiste de premier plan dans ${s.expertise}. Formée ${s.etudes}, elle cumule plus de quinze années d’expérience sur le terrain. Elle a piloté des mandats de transformation remarquables ${s.mandat}. Son approche novatrice repose sur des ateliers interactifs, des mises en situation réalistes et le dialogue constructif entre gestionnaires et équipes de travail. Cet après-midi, elle nous outillera pour désamorcer les conflits d’équipe et cultiver un climat de travail sain et respectueux. N’hésitez pas à participer activement à ses exercices en petits groupes pour en tirer le maximum de bénéfices !`,
          questions: [
            ['Dans quel domaine précis la conférencière possède-t-elle une grande expertise ?', `${s.expertise[0].toUpperCase() + s.expertise.slice(1)}`, 'La comptabilité fiscale et la vérification des comptes bancaires', 'La logistique du transport maritime et ferroviaire'],
            ['Auprès de quels milieux a-t-elle notamment réalisé des mandats par le passé ?', `Elle a œuvré ${s.mandat}`, 'Auprès de restaurants rapides et de parcs d’attractions', 'Auprès de constructeurs automobiles internationaux'],
            ['Quelle méthode pédagogique privilégie-t-elle pour son atelier ?', 'Des mises en situation réalistes et le dialogue en petits groupes', 'Une longue conférence théorique sans aucune prise de parole', 'Un examen écrit minuté éliminatoire à la fin de la séance'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Cérémonie d'ouverture - Compétition aquatique internationale
    Object.assign(
      (rand) => {
        const slots = [
          { bassin: 'au Parc olympique de Montréal', epreuve: 'du plongeon et de la natation artistique', honneur: 'une nageuse autochtone championne panaméricaine' },
          { bassin: 'au Centre sportif de Gatineau', epreuve: 'du water-polo et de la nage en eau libre', honneur: 'un paralympien médaillé d’or en papillon' },
          { bassin: 'au complexe Aquatique de Laval', epreuve: 'de la natation de vitesse et du plongeon synchronisé', honneur: 'une jeune prodige locale détenant un record canadien' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Vous écoutez Radio-Canada Sports pour la retransmission de la cérémonie d’ouverture de la Coupe internationale des sports aquatiques, présentée ce soir ${s.bassin}. L’arène était bondée pour accueillir les représentants de plus de quarante nations qui s’affronteront dans les épreuves ${s.epreuve}. Le moment fort de la soirée est survenu lorsqu’un spectacle acrobatique aérien a surplombé le bassin principal, illuminé d’effets holographiques aquatiques saisissants. C’est ${s.honneur} qui a officiellement déclaré les jeux ouverts, saluée par un tonnerre d’applaudissements de la part des délégations étrangères. Les premières courses débutent demain dès huit heures trente, et nous serons en ondes pour vous faire vivre chaque seconde de cette fin de semaine captivante.`,
          questions: [
            ['Quelle compétition sportive d’envergure s’ouvre officiellement dans ce reportage ?', 'Une coupe internationale réunissant des disciplines aquatiques', 'Un tournoi de tennis sur terre battue en plein air', 'Un championnat de gymnastique artistique féminine'],
            ['Quel spectacle artistique a impressionné le public au-dessus du bassin ?', 'Un numéro d’acrobaties aériennes avec des projections holographiques', 'Une démonstration de natation avec des dauphins dressés', 'Un concert rock joué sur une scène flottante instable'],
            ['Quand débuteront les premières courses éliminatoires officielles ?', 'Dès huit heures trente demain matin avec couverture en direct', 'Ce soir à minuit après la fin des discours des invités', 'La semaine prochaine après une période d’entraînement libre'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-listening-2
  // Ex 0: Suivre le déroulement d’un film relatant la vie d’une sportive.
  // Ex 1: Suivre le déroulement des évènements ayant mené à un accident de la route relaté à la radio.
  'n6-listening-2': [
    // Scenario 0 (Template, Ex 0): Critique / résumé de film sur une patineuse québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { film: '« L’Or sur glace »', sportive: 'la patineuse Joannie Rochette', blessure: 'une fracture à la cheville à la veille des sélections', finale: 'une médaille historique remportée avec courage aux Jeux d’hiver' },
          { film: '« La Traversée du courage »', sportive: 'la fondeuse Beckie Scott', blessure: 'une pneumonie sévère qui a paralysé sa saison', finale: 'une remontée spectaculaire sur le podium lors du cinquante kilomètres' },
          { film: '« Seule contre le vent »', sportive: 'la cycliste Geneviève Jeanson', blessure: 'une déchirure musculaire douloureuse après une chute en peloton', finale: 'un triomphe émouvant lors du contre-la-montre des championnats mondiaux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Dans notre chronique cinéma de ce midi, nous nous penchons sur le long-métrage biographique ${s.film}, qui retrace la vie extraordinaire de ${s.sportive}. Le film débute dans un petit village du Québec où l’on voit la jeune fille s’entraîner à l’aube sur des patinoires extérieures par des froids polaires. Le récit prend ensuite un tournant dramatique au milieu du film lorsqu’elle subit ${s.blessure}. Alors que tous les spécialistes prédisent la fin de sa carrière, elle entreprend une réadaptation rigoureuse avec l’aide de son entraîneur de toujours. La scène culminante du film montre ${s.finale}, un moment d’une rare intensité émotionnelle qui a tiré des larmes à toute la salle de projection lors de la première montréalaise.`,
          questions: [
            ['Quel type d’œuvre cinématographique le critique commente-t-il à la radio ?', 'Un film biographique racontant le parcours d’une athlète québécoise', 'Un documentaire scientifique sur les bienfaits du sport d’hiver', 'Une comédie d’action fictive sur le milieu du hockey masculin'],
            ['Quelle épreuve dramatique menace de mettre fin à la carrière de la sportive ?', `${s.blessure[0].toUpperCase() + s.blessure.slice(1)}`, 'La faillite financière totale de sa famille d’origine', 'Le refus catégorique de ses parents de la laisser s’entraîner'],
            ['Comment se conclut le point culminant du scénario du film ?', `Par ${s.finale}`, 'Par l’abandon définitif du sport pour devenir entraîneuse', 'Par son départ pour vivre incognito dans un monastère'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Résumé d'un documentaire sur une nageuse de marathon
    Object.assign(
      (rand) => {
        const slots = [
          { titre: '« Vaincre le Saint-Laurent »', nageuse: 'la marathonienne de l’extrême Mylène Paquette', defi: 'la traversée en solitaire de l’océan Atlantique à la rame', epreuve: 'trois chavirages successifs au milieu d’une tempête de vagues géantes' },
          { titre: '« Les Eaux boréales »', nageuse: 'la pionnière de la nage en eau libre Christine Cossette', defi: 'la double traversée historique du lac Saint-Jean à la nage', epreuve: 'des crampes paralysantes causées par une eau à treize degrés' },
          { titre: '« Le Fleuve au cœur »', nageuse: 'l’athlète d’endurance Geneviève Fabre', defi: 'la descente de trois cents kilomètres du fleuve Saint-Laurent', epreuve: 'de puissants courants de marée qui la repoussaient vers le large' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Le nouveau documentaire ${s.titre} captive actuellement le public dans les cinémas du Québec. Ce film puissant raconte l’histoire vraie de ${s.nageuse}. Dans la première partie, on découvre son entraînement acharné dans les eaux froides pour préparer son plus grand rêve : ${s.defi}. Le réalisateur montre sans fard les moments de doute intense et l’épuisement physique extrême lorsque surviennent ${s.epreuve}. Mais guidée par une volonté de fer et l’appui inconditionnel de son équipe de soutien sur le bateau suiveur, elle persévère heure après heure. Les images finales de son arrivée au quai, accueillie par des milliers de personnes en liesse au crépuscule, constituent une magnifique leçon de persévérance humaine.`,
          questions: [
            ['Quelle histoire vraie ce film documentaire fait-il revivre aux spectateurs ?', 'L’exploit d’endurance remarquable d’une sportive en milieu aquatique', 'La traversée des glaciers de l’Antarctique par des explorateurs', 'L’ascension de l’Everest par un groupe d’alpinistes amateurs'],
            ['Quel moment d’épreuve extrême menace la réussite de son expédition ?', `${s.epreuve[0].toUpperCase() + s.epreuve.slice(1)}`, 'La panne d’essence du bateau de soutien au milieu du trajet', 'La perte de toutes ses réserves de nourriture le premier jour'],
            ['Quelle ambiance règne lors de l’arrivée finale au quai ?', 'Un accueil triomphal par des milliers de spectateurs émus', 'Une arrivée dans l’indifférence totale au milieu de la nuit', 'Une évacuation médicale immédiate sans aucun témoin'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Accident sur l'autoroute 20 relaté à la radio
    Object.assign(
      (rand) => {
        const slots = [
          { autoroute: 'sur l’autoroute 20 en direction est, près de Saint-Hyacinthe', cause: 'une soudaine averse de pluie verglaçante créant une chaussée glissante', vehicules: 'un semi-remorque et quatre voitures de tourisme', etat: 'trois blessés légers transportés par précaution à l’hôpital' },
          { autoroute: 'sur l’autoroute 40 près de Trois-Rivières', cause: 'une bourrasque de neige réduisant la visibilité à zéro', vehicules: 'un camion de livraison et trois camionnettes', etat: 'deux conducteurs traités sur place pour des coupures mineures' },
          { autoroute: 'sur l’autoroute 15 nord à la hauteur de Mirabel', cause: 'une nappe de brouillard givrant dense sur le pont routier', vehicules: 'cinq véhicules immobilisés en portefeuille', etat: 'des dégâts matériels importants mais aucun blessé grave' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Bulletin d’information routière d’urgence sur les ondes d’Info-Circulation. Un carambolage majeur paralyse actuellement la circulation ${s.autoroute}. Selon le sergent de la Sûreté du Québec dépêché sur les lieux, la chaîne d’événements a débuté vers sept heures dix avec ${s.cause}. Un premier véhicule a perdu l’adhérence lors d’un changement de voie, heurtant la glissière de sécurité centrale. Incapable de freiner à temps sur la glace, ${s.vehicules} sont entrés en collision successive. Les services d’urgence font état de ${s.etat}. Les remorqueuses sont à l’œuvre pour dégager les voies obstruées, mais un bouchon de dix kilomètres s’est formé. Les automobilistes doivent privilégier la route secondaire 116 pour contourner le secteur.`,
          questions: [
            ['Quel événement de la circulation routière est rapporté dans ce flash d’information ?', 'Un carambolage majeur causé par de mauvaises conditions hivernales', 'La fermeture préventive d’un pont en raison de vents violents', 'Une course-poursuite policière sur l’autoroute de banlieue'],
            ['Quel facteur météorologique a déclenché le dérapage du premier véhicule ?', `${s.cause[0].toUpperCase() + s.cause.slice(1)}`, 'Une panne générale d’éclairage des lampadaires routiers', 'La présence d’un gros animal sauvage égaré sur la chaussée'],
            ['Quelle recommandation d’itinéraire les autorités formulent-elles aux usagers ?', 'Emprunter la route secondaire pour contourner le bouchon', 'Attendre patiemment dans son véhicule moteur éteint', 'Faire demi-tour directement sur les voies d’autoroute'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Accident sur un pont métropolitain relaté à la radio
    Object.assign(
      (rand) => {
        const slots = [
          { pont: 'le pont Jacques-Cartier vers Montréal', incident: 'l’éclatement d’un pneu sur une camionnette chargée d’outils', impact: 'un ralentissement s’étirant jusqu’à Longueuil', remorquage: 'la fermeture de deux voies sur trois pendant deux heures' },
          { pont: 'le pont Pierre-Laporte en direction de Québec', incident: 'une panne mécanique soudaine sur un autobus de transport', impact: 'une congestion monstre sur l’autoroute Henri-IV', remorquage: 'l’intervention délicate d’une dépanneuse lourde spécialisée' },
          { pont: 'le pont Champlain en direction de la Rive-Sud', incident: 'la perte d’un chargement de planches de bois sur la voie du centre', impact: 'un blocage quasi total de la circulation matinale', remorquage: 'le nettoyage complet de la chaussée par les équipes du ministère' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Ici le point sur la circulation métropolitaine de huit heures quinze. La circulation est particulièrement éprouvante ce matin sur ${s.pont}. Tout a commencé vers sept heures quarante avec ${s.incident}. Le conducteur a réussi à manœuvrer vers le bas-côté, mais deux automobilistes qui le suivaient de trop près se sont emboutis en tentant de l’éviter. Cet incident a entraîné ${s.remorquage}, provoquant ${s.impact}. Les ambulanciers arrivés rapidement confirment qu’aucun conducteur n’a subi de blessure menaçant sa vie. Le ministère des Transports annonce que toutes les voies seront rouvertes sous peu, mais il faudra au moins quarante-cinq minutes pour résorber complètement le refoulement des véhicules.`,
          questions: [
            ['Quelle situation d’entrave routière est analysée par le chroniqueur ?', 'Un accident sur un pont causant une congestion majeure', 'Des travaux de pavage réguliers prévus depuis un an', 'Une manifestation de cyclistes bloquant l’accès au centre-ville'],
            ['Quel événement initial a déclenché les collisions secondaires ?', `${s.incident[0].toUpperCase() + s.incident.slice(1)}`, 'Une collision frontale provoquée par un contresens', 'Le malaise cardiaque soudain d’un chauffeur de taxi'],
            ['Combien de temps faudra-t-il environ pour rétablir une circulation fluide ?', 'Au moins quarante-cinq minutes après la réouverture complète', 'Plusieurs jours en raison de réparations de la chaussée', 'Moins de cinq minutes grâce à des voies de contournement'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Récit de film sur une championne de ski acrobatique
    Object.assign(
      (rand) => {
        const slots = [
          { film: '« Les Sœurs volantes »', soeurs: 'les sœurs Justine et Chloé Dufour-Lapointe', podium: 'leur doublé historique sur le podium olympique à Sotchi', epreuve: 'la pression médiatique colossale et les sacrifices de l’entraînement quotidien' },
          { film: '« Piste noire »', soeurs: 'la championne de bosses Jennifer Heil', podium: 'sa médaille d’or conquise sous une pluie battante à Vancouver', epreuve: 'des blessures répétées aux genoux nécessitant plusieurs interventions chirurgicales' },
          { film: '« L’Envol de Chloé »', soeurs: 'la skieuse audacieuse Laurie Blouin', podium: 'sa victoire remarquable aux X Games d’hiver en snowboard', epreuve: 'une violente commotion cérébrale survenue lors d’un saut d’entraînement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Nous terminons notre tour d’horizon culturel avec le drame sportif ${s.film}, qui connaît un immense succès en salle. Le scénario retrace le parcours fascinant où ${s.soeurs} ont conquis les plus hauts sommets du ski mondial. Dès les premières scènes, la caméra capte l’intimité de cette famille québécoise dévouée corps et âme au sport de haut niveau. Le film montre avec réalisme ${s.epreuve}. La complicité indestructible entre les athlètes leur permet toutefois de surmonter les moments de doute. Le point d’orgue du film reconstitue fidèlement ${s.podium}, un souvenir encore vif dans la mémoire collective des Québécois. Une œuvre lumineuse et inspirante que nous vous recommandons chaudement de voir en famille ce week-end.`,
          questions: [
            ['Quel aspect de la vie des sportives le film met-il particulièrement en relief ?', 'Leur complicité familiale et leur persévérance face aux épreuves', 'Leur enrichissement financier rapide grâce aux commanditaires', 'Leurs conflits violents avec les fédérations internationales'],
            ['Quelle difficulté inhérente au sport d’élite le film dépeint-il sans fard ?', `${s.epreuve[0].toUpperCase() + s.epreuve.slice(1)}`, 'Le refus des juges d’accorder des notes justes aux Canadiennes', 'L’absence totale de neige lors des compétitions mondiales'],
            ['Quel moment glorieux constitue la scène majeure de la conclusion du film ?', `La reconstitution fidèle de ${s.podium}`, 'Leur départ définitif pour s’établir comme citoyennes en Europe', 'L’annonce surprise de leur retraite sportive prématurée'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-listening-3
  // Ex 0: Comprendre les explications d’une amie concernant les motifs de sa décision de changer de programme d’études.
  // Ex 1: Comprendre les explications d’un collègue concernant son choix d’acheter une voiture électrique.
  'n6-listening-3': [
    // Scenario 0 (Template, Ex 0): Changement d'études vers les soins infirmiers
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Sophie', ancien: 'la comptabilité financière au cégep', nouveau: 'les techniques de soins infirmiers', motif: 'le besoin viscéral d’aider concrètement les patients', stage: 'des stages cliniques en milieu hospitalier dès la première année' },
          { amie: 'Marianne', ancien: 'les sciences de la nature théoriques', nouveau: 'l’inhalothérapie et assistance respiratoire', motif: 'la volonté d’exercer un métier utile et actif en santé', stage: 'la formation pratique avec des simulateurs haute fidélité' },
          { amie: 'Camille', ancien: 'l’administration des affaires de bureau', nouveau: 'le travail social et relation d’aide', motif: 'le désir profond d’accompagner des personnes vulnérables', stage: 'l’immersion auprès d’organismes communautaires du secteur' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Julie ! Je voulais te parler de ma grande décision scolaire. J’ai officiellement quitté ${s.ancien} pour m’inscrire en ${s.nouveau}. J’ai réfléchi pendant des mois avant de faire le saut. Même si mon ancien programme m’offrait de bons débouchés de bureau, je me sentais coupée du monde et je m’ennuyais devant mes tableaux de calculs toute la journée. Ce qui a motivé mon changement, c’est ${s.motif}. Dans ma nouvelle filière, ce qui me stimule par-dessus tout, ce sont ${s.stage}. J’ai l’impression que chaque heure de cours a enfin un sens profond pour mon avenir. Mes parents étaient un peu inquiets au début en raison des quarts de travail parfois exigeants, mais ils voient bien que j’ai retrouvé ma motivation et mon sourire !`,
          questions: [
            ['Quelle décision scolaire majeure l’amie justifie-t-elle dans cette conversation ?', `Son changement d’orientation vers ${s.nouveau}`, 'Son abandon total des études pour faire le tour du monde', 'Son inscription à un programme de maîtrise en gestion d’entreprise'],
            ['Quelle lacune ressentait-elle dans son ancien programme d’études ?', 'Elle s’y ennuyait et se sentait déconnectée du contact humain', 'Les frais de scolarité étaient beaucoup trop élevés pour son budget', 'Ses enseignants refusaient de lui accorder des notes de passage'],
            ['Quelle composante de sa nouvelle formation la motive le plus particulièrement ?', `${s.stage[0].toUpperCase() + s.stage.slice(1)}`, 'La gratuité complète de tous ses manuels scolaires', 'La certitude de ne jamais avoir d’horaires de fin de semaine'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Changement d'études vers l'informatique ou le design
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Nadia', depart: 'le droit à l’université', arrivee: 'le développement Web et création d’applications', raison: 'la créativité et les horaires flexibles de travail à distance' },
          { amie: 'Mélanie', depart: 'la littérature comparée', arrivee: 'le design graphique et communication visuelle', raison: 'la possibilité de concevoir des projets visuels concrets' },
          { amie: 'Valérie', depart: 'les sciences politiques', arrivee: 'l’analyse de données et cybersécurité', raison: 'la pénurie criante de spécialistes et les salaires d’entrée élevés' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as l’air rayonnante ce matin, Nadia ! — Oui, et pour cause ! J’ai enfin osé faire ma demande pour changer de programme. J’abandonne ${s.depart} pour intégrer ${s.arrivee}. Pendant deux sessions, j’ai essayé de me convaincre que le milieu juridique me plairait, mais la mémorisation mécanique de textes de lois me drainait toute mon énergie. J’ai découvert que ce qui me passionne réellement, c’est ${s.raison}. Dans mon nouveau département, on travaille constamment en équipe sur des prototypes concrets et les professeurs viennent tous de l’industrie. C’est tellement plus vivant et stimulant ! Mes crédits généraux sont heureusement transférés, alors je ne perds même pas de session complète. C’est la meilleure décision que j’aie prise depuis mon entrée au cégep !`,
          questions: [
            ['Pourquoi l’étudiante a-t-elle décidé de quitter son programme d’origine ?', 'La mémorisation théorique l’ennuyait et elle manquait de créativité', 'Elle a été expulsée de son programme pour plagiat involontaire', 'Elle ne trouvait pas de covoiturage pour se rendre sur le campus'],
            ['Quel avantage principal son nouveau programme lui apporte-t-il ?', `${s.raison[0].toUpperCase() + s.raison.slice(1)}`, 'Une exemption totale de tous les examens écrits finaux', 'Un stage rémunéré obligatoire d’un an dans un pays étranger'],
            ['Qu’arrive-t-il à ses cours généraux déjà réussis ?', 'Ils sont reconnus et transférés dans son nouveau programme', 'Ils sont totalement perdus et doivent être repris à zéro', 'Ils ne peuvent être crédités que si elle paie une amende'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Collègue expliquant son choix de voiture électrique
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc', modele: 'une berline cent pour cent électrique', subvention: 'douze mille dollars en rabais gouvernementaux combinés', borne: 'une borne de niveau deux installée dans mon entrée de garage' },
          { collegue: 'Patrick', modele: 'un petit véhicule multisegment électrique', subvention: 'neuf mille dollars d’incitatifs provincial et fédéral', borne: 'la recharge nocturne sur mon circuit électrique résidentiel' },
          { collegue: 'Simon', modele: 'une voiture compacte à batterie longue autonomie', subvention: 'dix mille dollars de subventions écologiques à l’achat', borne: 'l’accès à des bornes rapides le long de mon trajet autoroutier' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as vu la nouvelle voiture dans le stationnement des employés ? C’est la mienne ! J’ai finalement fait le saut et acheté ${s.modele}. Je faisais soixante kilomètres par jour pour venir au bureau et je dépensais près de quatre cents dollars d’essence chaque mois. En faisant mes calculs financiers, j’ai réalisé qu’avec ${s.subvention}, le paiement mensuel était presque identique à mon ancien véhicule à essence. En plus, grâce à ${s.borne}, recharger ma batterie me coûte à peine trois dollars par nuit d’électricité. L’entretien est minimal : plus aucun changement d’huile, moins d’usure des freins grâce au freinage régénératif, et une conduite silencieuse incroyable dans les embouteillages. Je ne reviendrais jamais en arrière !`,
          questions: [
            ['Quel achat personnel majeur le collègue explique-t-il avec enthousiasme ?', 'L’achat d’un véhicule entièrement électrique pour ses trajets', 'L’achat d’une camionnette d’occasion à moteur diesel lourd', 'La location temporaire d’une moto de collection de luxe'],
            ['Quel facteur économique a rendu cet achat particulièrement avantageux ?', `${s.subvention[0].toUpperCase() + s.subvention.slice(1)} et l’économie d’essence`, 'La gratuité complète de toutes les assurances automobiles', 'Le fait que son employeur lui paye l’ensemble de ses mensualités'],
            ['Quel avantage mécanique et d’entretien le conducteur souligne-t-il ?', 'L’absence de changements d’huile et une usure réduite des freins', 'L’absence de pneus d’hiver obligatoires sur ce modèle', 'La garantie à vie de la carrosserie contre toute égratignure'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Choix d'une voiture électrique pour la famille
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'François', autonomie: 'quatre cent cinquante kilomètres avec une seule charge', epargne: 'économiser plus de trois mille dollars par an en carburant', avantage: 'l’accès gratuit et légal aux voies réservées de covoiturage' },
          { nom: 'Benoît', autonomie: 'quatre cents kilomètres d’autonomie même par temps froid', epargne: 'réduire nos coûts de transport familial de moitié chaque mois', avantage: 'la gratuité complète sur les traversiers et les ponts à péage' },
          { nom: 'Guillaume', autonomie: 'cinq cents kilomètres de rayon d’action pour les vacances', epargne: 'rentabiliser la borne de recharge en moins de six mois', avantage: 'la réduction importante de notre empreinte carbone familiale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Sylvain ! Tu me demandais pourquoi on avait opté pour un modèle électrique familial. Avec les enfants qui font des activités sportives aux quatre coins de la région chaque fin de semaine, on passait notre vie à la station d’essence. Notre nouveau véhicule nous offre ${s.autonomie}, ce qui élimine totalement notre anxiété sur l’autoroute. Au niveau du budget familial, les calculs sont clairs : nous allons ${s.epargne}. Mais au-delà de l’aspect financier, il y a un privilège quotidien dont on ne pourrait plus se passer : ${s.avantage} lors de l’heure de pointe. La voiture est spacieuse, d’un confort exceptionnel, et les enfants adorent le toit vitré panoramique. Pour notre famille, c’est de loin le meilleur choix de transport possible !`,
          questions: [
            ['Pourquoi cette famille a-t-elle choisi de passer au véhicule électrique ?', 'Pour réduire leurs dépenses d’essence et voyager confortablement', 'Pour pouvoir participer à des courses automobiles sur circuit', 'Parce que les véhicules à essence sont interdits dans leur quartier'],
            ['Quelle performance d’autonomie rassure les parents sur les longs trajets ?', `${s.autonomie[0].toUpperCase() + s.autonomie.slice(1)}`, 'Une autonomie de cinquante kilomètres nécessitant de recharger souvent', 'Une batterie qui ne fonctionne qu’en descente sur l’autoroute'],
            ['Quel avantage pratique sur la route leur fait gagner du temps le matin ?', `${s.avantage[0].toUpperCase() + s.avantage.slice(1)}`, 'La permission de rouler au-dessus de la vitesse permise', 'Le droit de se stationner sur les trottoirs du centre-ville'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Changement d'études vers l'enseignement primaire
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Élodie', passe: 'le marketing publicitaire en agence', avenir: 'l’enseignement préscolaire et primaire', vocation: 'transmettre le goût d’apprendre et voir briller les yeux des enfants' },
          { collegue: 'Isabelle', passe: 'les relations publiques corporatives', avenir: 'l’adaptation scolaire pour élèves en difficulté', vocation: 'aider les élèves à surmonter leurs barrières d’apprentissage' },
          { collegue: 'Stéphanie', passe: 'la gestion commerciale et vente', avenir: 'l’enseignement du français langue seconde', vocation: 'soutenir l’intégration des jeunes immigrants nouvellement arrivés' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Je dois te raconter mon grand virage professionnel ! J’ai remis ma démission de mon emploi dans ${s.passe} pour retourner sur les bancs d’école en ${s.avenir}. Dans mon ancien travail, je passais mon temps à vendre des produits inutiles et je ne trouvais plus aucun sens à ce que je faisais au quotidien. Ma véritable vocation profonde, c’est de ${s.vocation}. Le baccalauréat dure quatre ans, mais dès l’automne, je serai en stage d’observation dans une classe d’école de quartier. Le gouvernement offre d’ailleurs d’excellentes bourses d’études incitatives pour les futurs enseignants en raison de la pénurie dans le réseau public. C’est un grand saut dans le vide, mais pour la première fois de ma vie adulte, je me sens à ma juste place !`,
          questions: [
            ['Quel changement de vie radical l’interlocutrice annonce-t-elle avec émotion ?', 'Un retour aux études pour devenir enseignante dans les écoles', 'La création d’une entreprise de vente en ligne internationale', 'La retraite anticipée après une longue carrière dans la publicité'],
            ['Quel sentiment d’insatisfaction l’a poussée à quitter son ancien travail ?', 'Le manque de sens et la superficialité de ses mandats commerciaux', 'Le refus de son employeur de lui accorder des pauses de dîner', 'Un salaire insuffisant pour payer son logement étudiant'],
            ['Quelle aide financière facilite son retour sur les bancs d’école ?', 'Des bourses gouvernementales pour former de futurs enseignants', 'Un héritage personnel reçu d’un membre de sa famille', 'Un prêt commercial accordé par des investisseurs privés'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-listening-4
  // Ex 0: Suivre la procédure donnée par une formatrice pour effectuer une réparation sur un vélo.
  // Ex 1: Suivre la procédure donnée par son gestionnaire pour régler avec les ressources humaines un problème lié au versement de sa paie.
  'n6-listening-4': [
    // Scenario 0 (Template, Ex 0): Formatrice atelier vélo - Réparation d'une crevaison
    Object.assign(
      (rand) => {
        const slots = [
          { formatrice: 'Karine', outil: 'des démonte-pneus en plastique pour ne pas pincer la jante', methode: 'plonger la chambre à air gonflée dans un bac d’eau', sechage: 'frotter la surface avec du papier sablé fin avant de poser la colle' },
          { formatrice: 'Laurence', outil: 'deux leviers souples pour déloger la tringle du pneu', methode: 'écouter attentivement le sifflement d’air en approchant l’oreille', sechage: 'nettoyer la zone avec un linge sec et attendre deux minutes' },
          { formatrice: 'Julie', outil: 'une clé plate pour dévisser l’axe de la roue sans forcer', methode: 'passer doucement les doigts le long de la chambre à air', sechage: 'appliquer une fine couche de dissolvant sur la zone poncée' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour à tous les participants de notre atelier de mécanique vélo. Je suis ${s.formatrice} et je vais vous guider pas à pas pour réparer une crevaison de pneu comme des professionnels. Première étape : retirez la roue du cadre et utilisez ${s.outil} afin de sortir délicatement la chambre à air sans l’abîmer. Deuxième étape : pour localiser la fuite avec précision, le moyen infaillible consiste à ${s.methode}. Dès que vous voyez des bulles, marquez l’endroit avec une craie. Troisième étape : il faut impérativement ${s.sechage}. Ensuite seulement, collez fermement la rustine en pressant pendant trois minutes sans bouger. Quatrième étape : avant de tout remonter, vérifiez soigneusement l’intérieur du pneu avec vos doigts pour retirer l’épine ou le bout de verre qui a causé la crevaison.`,
          questions: [
            ['Quelle réparation courante de bicyclette la formatrice enseigne-t-elle ?', 'La localisation du trou et la pose d’une rustine sur la chambre à air', 'Le remplacement complet du guidon et des leviers de vitesses', 'La soudure du cadre en acier brisé après un choc'],
            ['Quelle méthode est recommandée pour localiser précisément la fuite d’air ?', `${s.methode[0].toUpperCase() + s.methode.slice(1)}`, 'Gonfler le pneu au maximum jusqu’à ce qu’il éclate', 'Laisser le pneu au soleil toute la journée pour voir la trace'],
            ['Quelle précaution essentielle doit-on prendre avant de remonter la roue ?', 'Vérifier l’intérieur du pneu pour ôter le débris pointu responsable', 'Laver toute la bicyclette à grande eau avec du savon doux', 'Repeindre la jante de la roue pour éviter la formation de rouille'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Formatrice atelier vélo - Remplacement d'un câble de frein
    Object.assign(
      (rand) => {
        const slots = [
          { animatrice: 'Sonia', etape1: 'desserrer l’écrou du serre-câble avec une clé Allen de cinq millimètres', gaine: 'inspecter la gaine noire pour vous assurer qu’elle n’est pas écrasée', embout: 'sertir un petit embout métallique en aluminium pour empêcher le câble de s’effilocher' },
          { animatrice: 'Émilie', etape1: 'dévisser la vis de serrage principale au niveau de l’étrier de frein', gaine: 'lubrifier l’intérieur de la gaine avec quelques gouttes d’huile fine', embout: 'pincer fermement une capsule de finition avec une pince coupante' },
          { animatrice: 'Audrey', etape1: 'dégager la tête de câble de son logement dans le levier au guidon', gaine: 'vérifier que les deux embouts de gaine sont bien logés dans les butées', embout: 'couper l’excédent de fil d’acier à deux centimètres du point d’attache' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bienvenue au cours d’ajustement des freins de vélo. C’est ${s.animatrice} qui vous accompagne aujourd’hui. Quand votre levier touche presque le guidon, il est temps de remplacer le câble d’acier. Voici la séquence obligatoire. D’abord, vous devez ${s.etape1}. Ensuite, retirez l’ancien câble rouillé. Avant d’insérer le nouveau câble neuf, prenez soin d’${s.gaine}. Faites coulisser le fil métallique jusqu’au frein. Tendez le câble fermement avec une pince tout en resserrant la vis de fixation. Pour finir, il est essentiel de ${s.embout}. Testez le freinage à l’arrêt en pressant vigoureusement le levier dix fois de suite pour vérifier qu’il n’y a aucun glissement. Votre sécurité sur la route en dépend directement !`,
          questions: [
            ['Quelle procédure d’entretien sécuritaire est démontrée dans cet atelier ?', 'Le remplacement et le réglage d’un câble de frein de bicyclette', 'Le gonflage des pneus à l’aide d’un compresseur électrique', 'La lubrification des roulements à billes de la roue avant'],
            ['Quelle vérification de la gaine doit-on effectuer avant d’enfiler le câble neuf ?', `${s.gaine[0].toUpperCase() + s.gaine.slice(1)}`, 'La couper en deux pour vérifier son diamètre interne', 'La peindre avec un vernis protecteur contre la chaleur'],
            ['Quelle manipulation finale empêche le câble d’acier de s’abîmer ?', `${s.embout[0].toUpperCase() + s.embout.slice(1)}`, 'Nouer fermement l’extrémité du câble avec deux nœuds doubles faits à la main', 'Enrouler plusieurs tours de ruban adhésif d’écolier ordinaire autour du fil'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Gestionnaire expliquant la régularisation d'une erreur de paie
    Object.assign(
      (rand) => {
        const slots = [
          { chef: 'Benoît Gagnon', motif: 'les quinze heures supplémentaires de la semaine dernière qui n’ont pas été comptabilisées', portail: 'le portail libre-service RH sous l’onglet « Réclamations salariales »', delai: 'avant jeudi midi' },
          { chef: 'François Tremblay', motif: 'la prime de quart de soir du mois dernier qui a été omise sur votre talon', portail: 'la section intranet des paies en choisissant le formulaire P-102', delai: 'avant mercredi dix-sept heures' },
          { chef: 'Marc Lavoie', motif: 'l’erreur d’échelon salarial suite à votre promotion récente du premier mars', portail: 'le logiciel de gestion des ressources humaines avec votre code d’employé', delai: 'au plus tard vendredi matin' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour Martin. J’ai bien reçu ton courriel au sujet de ton dernier talon de paie. Je comprends tout à fait ta frustration concernant ${s.motif}. Ne t’en fais pas, c’est une simple erreur de saisie du système et voici la procédure officielle pour régler la situation rapidement. Connecte-toi d’abord sur ${s.portail}. Tu dois y joindre une copie de tes feuilles de temps signées ainsi qu’une capture d’écran de ton relevé bancaire démontrant le manque à gagner. Dès que tu as soumis le dossier en ligne, envoie-moi le numéro de billet de confirmation par messagerie interne. J’approuverai la demande immédiatement en tant que superviseur. Si tout est fait ${s.delai}, les ressources humaines feront un virement correctif direct dans ton compte.`,
          questions: [
            ['Quel litige administratif le superviseur aide-t-il son employé à résoudre ?', 'Une omission ou une erreur de calcul sur son dernier versement de paie', 'Un refus injustifié d’accorder des vacances d’été au travailleur', 'Une contestation d’un avertissement disciplinaire au dossier'],
            ['Quel document justificatif l’employé doit-il joindre sur le portail ?', 'Ses feuilles de temps signées et une capture de son relevé bancaire', 'Une lettre manuscrite rédigée par son représentant syndical', 'La copie de son bail de logement et de ses factures courantes'],
            ['Quelle est l’échéance impérative pour soumettre la demande de correction ?', `Soumettre le dossier en ligne ${s.delai}`, 'Attendre la révision salariale annuelle de décembre', 'Effectuer la demande écrite dans un délai d’un an'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire aidant à corriger une retenue salariale indue
    Object.assign(
      (rand) => {
        const slots = [
          { gestionnaire: 'Madame Diane Roy', probleme: 'une double retenue d’assurance collective prélevée par erreur sur votre chèque', preuve: 'votre formulaire d’adhésion original confirmant le régime individuel', conseiller: 'Madame Chantal Lévesque au poste téléphonique 412' },
          { gestionnaire: 'Madame Monique Bélanger', probleme: 'une déduction incorrecte pour les cotisations au régime de retraite volontaire', preuve: 'votre relevé d’emploi et votre lettre d’embauche mentionnant le taux exact', conseiller: 'Monsieur Patrick Simard à la division des avantages sociaux' },
          { gestionnaire: 'Madame Carole Fortin', probleme: 'une retenue fiscale provinciale calculée avec un mauvais code de déduction', preuve: 'le formulaire officiel de déclaration des crédits d’impôt TP-1015', conseiller: 'l’agent de paie de garde au centre d’aide aux employés' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour Alexandre. Je viens de vérifier les montants avec le service de paie concernant ${s.probleme}. C’est fâcheux, mais nous avons une démarche bien balisée pour rembourser le montant perçu en trop. Première étape : remplis la demande de redressement de paie disponible sur notre portail intranet d’entreprise. Deuxième étape : joins en pièce jointe ${s.preuve}. Troisième étape : transmets le tout directement à la conseillère attitrée, ${s.conseiller}, en me mettant en copie conforme pour que j’appose ma validation hiérarchique. Le service financier s’est engagé à émettre un chèque spécial hors-cycle d’ici vendredi si le dossier est complet avant midi demain. Passe à mon bureau si tu as besoin d’aide pour remplir les sections du formulaire.`,
          questions: [
            ['Quel problème de rémunération fait l’objet de cette explication étape par étape ?', 'Une déduction financière indue prélevée sur la rémunération de l’employé', 'Une prime de rendement refusée par la direction générale de la firme', 'Une demande d’avance de fonds pour un voyage personnel à l’étranger'],
            ['Quelle pièce justificative officielle doit impérativement être fournie ?', `${s.preuve[0].toUpperCase() + s.preuve.slice(1)}`, 'Une déclaration sous serment signée devant un juge de paix', 'Un reçu de pharmacie prouvant l’achat de médicaments courants'],
            ['Quelle mesure financière exceptionnelle le service des finances promet-il ?', 'Émettre un paiement spécial hors-cycle d’ici vendredi après-midi', 'Offrir un jour de congé payé supplémentaire en guise d’excuse', 'Doubler le montant de la prochaine prime de vacances de l’employé'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Formatrice atelier vélo - Réglage des vitesses et de la chaîne
    Object.assign(
      (rand) => {
        const slots = [
          { animatrice: 'Isabelle', etape: 'placer la chaîne sur le plus petit pignon de la roue arrière', outil: 'un tournevis cruciforme de précision pour ajuster les vis de butée', verification: 'faire tourner les pédales à la main tout en passant chaque vitesse' },
          { animatrice: 'Geneviève', etape: 'détendre complètement le câble en positionnant la manette au repos', outil: 'une clé hexagonale de quatre millimètres pour aligner la roulette de guidage', verification: 'observer l’alignement visuel parfait entre le dérailleur et les pignons' },
          { animatrice: 'Christine', etape: 'nettoyer soigneusement les maillons de chaîne avec un chiffon dégraissant', outil: 'la molette de réglage située à la sortie du levier de vitesse au guidon', verification: 'écouter attentivement pour éliminer tout cliquetis de frottement métallique' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour chers cyclistes ! Dans cet atelier consacré au réglage de la transmission, je vous montre la méthode exacte pour éliminer les sauts de chaîne désagréables. Étape numéro un : commencez par ${s.etape}. Étape numéro deux : utilisez ${s.outil}. En tournant d’un quart de tour à la fois, vous devez éliminer l’espace qui provoque le déraillement. Étape numéro trois : tournez la molette de tension du câble d’un demi-tour dans le sens antihoraire si la chaîne hésite à monter. Étape numéro quatre : pour la vérification finale, prenez soin de ${s.verification}. Si chaque changement de vitesse s’opère avec fluidité et silence, votre transmission est parfaitement synchronisée. Rangez vos outils et venez faire un tour d’essai dans la cour !`,
          questions: [
            ['Quel composant mécanique de la bicyclette cet atelier apprend-il à ajuster ?', 'Le dérailleur arrière et la transmission pour le passage des vitesses', 'Le boîtier de direction et les roulements de la fourche avant', 'La selle et la tige pour régler la hauteur ergonomique du cycliste'],
            ['Quelle première manipulation mécanique faut-il accomplir au début ?', `${s.etape[0].toUpperCase() + s.etape.slice(1)}`, 'Retirer complètement les deux pédales du vélo avec une grosse pince', 'Couper la chaîne en deux morceaux avec un ciseau à métaux'],
            ['Comment doit-on procéder pour le test de validation finale ?', `${s.verification[0].toUpperCase() + s.verification.slice(1)}`, 'Laisser le vélo dehors sous la pluie pendant une nuit entière', 'Frapper vigoureusement sur le cadre avec un maillet en caoutchouc'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-listening-5
  // Ex 0: Comprendre l’expression de la satisfaction de sa supérieure lors d’une réunion d’information sur l’atteinte des objectifs trimestriels.
  // Ex 1: Comprendre l’expression de la déception d’un ami qui n’a pas été accepté dans un programme d’études.
  'n6-listening-5': [
    // Scenario 0 (Template, Ex 0): Discours de satisfaction de la directrice lors du bilan trimestriel
    Object.assign(
      (rand) => {
        const slots = [
          { directrice: 'Madame Thériault', taux: 'cent vingt pour cent de nos objectifs de vente', defi: 'la pénurie criante de personnel et les retards de livraison des fournisseurs', cadeau: 'un vendredi après-midi de congé payé offert à toute l’équipe' },
          { directrice: 'Madame Bélanger', taux: 'cent quinze pour cent des cibles de fidélisation clientèle', defi: 'la transition complexe vers notre nouvelle plateforme informatique', cadeau: 'une prime de rendement spéciale versée sur votre prochaine paie' },
          { directrice: 'Madame Bouchard', taux: 'l’ensemble des livrables du contrat gouvernemental avec deux semaines d’avance', defi: 'les échéances excessivement serrées imposées par le client', cadeau: 'un dîner gastronomique de célébration au restaurant pris en charge par l’entreprise' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour à toute l’équipe ! Je tenais à vous réunir aujourd’hui pour faire le bilan de notre troisième trimestre, et je dois vous dire que je suis immensément fière de chacun d’entre vous. Les chiffres viennent de tomber : nous avons atteint ${s.taux} ! Compte tenu des défis monstres auxquels nous avons fait face ces derniers mois, notamment ${s.defi}, ce résultat est tout simplement spectaculaire. Votre solidarité, vos heures d’effort supplémentaires et votre créativité ont fait toute la différence. Je tiens à vous exprimer ma plus profonde gratitude personnelle. Pour souligner ce triomphe collectif comme il se doit, la direction générale a approuvé ${s.cadeau}. Prenez ce temps pour vous reposer et célébrer, vous l’avez amplement mérité ! Félicitations à tous !`,
          questions: [
            ['Quel sentiment dominant la directrice exprime-t-elle avec enthousiasme ?', 'Une immense fierté et de la reconnaissance pour l’atteinte des objectifs', 'Une grande inquiétude face à la faillite imminente de l’entreprise', 'De la colère et de la frustration devant les retards des projets'],
            ['Quelle difficulté majeure l’équipe a-t-elle surmontée au cours du trimestre ?', `${s.defi[0].toUpperCase() + s.defi.slice(1)}`, 'Une grève générale illimitée de tous les syndicats de la ville', 'La destruction des locaux de travail par une inondation majeure'],
            ['Quelle récompense concrète la supérieure annonce-t-elle à ses employés ?', `${s.cadeau[0].toUpperCase() + s.cadeau.slice(1)}`, 'Une prolongation de quarante heures de travail par semaine sans salaire', 'L’obligation de travailler durant toutes les fins de semaine à venir'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Satisfaction de la cheffe de projet après un audit réussi
    Object.assign(
      (rand) => {
        const slots = [
          { cheffe: 'Chantal', audit: 'l’audit international de conformité aux normes environnementales ISO', note: 'une note parfaite sans aucune non-conformité relevée', reconfort: 'des cartes-cadeaux de détente et un après-midi festif au bureau' },
          { cheffe: 'Monique', audit: 'l’inspection provinciale de qualité des services aux usagers', note: 'les éloges officiels du comité d’inspection pour nos dossiers impeccables', reconfort: 'une journée complète de congé de ressourcement pour tous les départements' },
          { cheffe: 'Isabelle', audit: 'l’évaluation externe de sécurité informatique de nos serveurs', note: 'la mention d’excellence la plus haute jamais décernée à notre firme', reconfort: 'une enveloppe budgétaire spéciale pour rénover notre salle de pause' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Merci à tous d’être venus. J’ai les résultats officiels de ${s.audit}, et je ne peux cacher mon enthousiasme débordant. Nous avons obtenu ${s.note} ! Lorsque nous avons commencé ce chantier il y a six mois, beaucoup de gens doutaient de notre capacité à réussir dans des délais aussi courts. Vous avez fait preuve d’une rigueur exceptionnelle, en révisant chaque procédure et en vous entraidant sans compter votre temps. Je suis profondément touchée par votre dévouement sans faille. Pour vous remercier de cet accomplissement historique qui rehausse le prestige de notre entreprise, j’ai le plaisir de vous annoncer ${s.reconfort}. Merci mille fois pour votre travail remarquable !`,
          questions: [
            ['Pourquoi la cheffe d’équipe convoque-t-elle ses collègues avec enthousiasme ?', 'Pour célébrer les résultats éclatants d’une évaluation professionnelle', 'Pour annoncer la fermeture prochaine de plusieurs succursales', 'Pour avertir les employés d’une baisse des salaires à l’automne'],
            ['Quelle mention ou performance l’équipe a-t-elle décrochée lors de l’audit ?', `${s.note[0].toUpperCase() + s.note.slice(1)}`, 'Une mention médiocre nécessitant une reprise complète de l’examen', 'Un avertissement formel pour non-respect des règles de base'],
            ['Quel geste de reconnaissance la supérieure partage-t-elle avec son équipe ?', `${s.reconfort[0].toUpperCase() + s.reconfort.slice(1)}`, 'Une réprimande sévère devant toute la direction de l’entreprise', 'L’obligation de recommencer toutes les démarches dès lundi matin'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Déception d'un ami refusé en techniques policières
    Object.assign(
      (rand) => {
        const slots = [
          { ami: 'Félix', programme: 'en techniques policières au collège d’Alma', cause: 'la moyenne au test psychologique qui était un point sous la barre', soutien: 'm’accorder quelques jours de recul avant de préparer ma nouvelle demande' },
          { ami: 'Samuel', programme: 'en techniques de réadaptation physique au cégep', cause: 'le contingentement sévère avec plus de cinq cents candidats', soutien: 'm’inscrire à des cours de mise à niveau pour bonifier mon dossier' },
          { ami: 'Mathieu', programme: 'en soins préhospitaliers d’urgence pour ambulanciers', cause: 'l’entrevue de sélection où le stress m’a fait perdre mes moyens', soutien: 'prendre conseil auprès d’un orienteur professionnel pour bâtir un plan B' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Jean... C’est ${s.ami}. Je t’appelle parce que j’ai reçu la réponse ce matin et je suis complètement anéanti. J’ai été refusé ${s.programme}. C’est tellement dur à encaisser après avoir passé tout mon hiver à m’entraîner physiquement et à réviser mes examens chaque fin de semaine. La lettre de refus indique que ${s.cause}. J’ai l’impression que tous mes sacrifices n’ont servi à rien et j’ai une boule dans la gorge depuis deux heures. Je ne sais plus trop quoi faire de mon avenir pour l’instant. Mon père me dit que ce n’est pas la fin du monde et qu’il y a d’autres voies, mais là, j’ai juste besoin de ${s.soutien}. Merci d’être là pour m’écouter sans me juger, ça me fait du bien d’en parler avec toi.`,
          questions: [
            ['Quelle émotion pénible l’ami exprime-t-il au téléphone ?', 'Une immense déception et un sentiment d’injustice après un refus scolaire', 'De la fierté après avoir été sélectionné dans le programme de ses rêves', 'De l’indifférence totale envers les résultats scolaires de son hiver'],
            ['Quelle explication officielle lui a été transmise dans la lettre de refus ?', `${s.cause[0].toUpperCase() + s.cause.slice(1)}`, 'Le fait qu’il a oublié d’envoyer son acte de naissance officiel', 'Une suspension disciplinaire pour mauvaise conduite passée'],
            ['De quoi l’ami ressent-il le plus grand besoin dans l’immédiat ?', `${s.soutien[0].toUpperCase() + s.soutien.slice(1)}`, 'Partir vivre à l’étranger sans jamais prévenir personne de sa famille', 'Abandonner définitivement tout projet de formation professionnelle'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Déception d'une amie refusée en médecine vétérinaire
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Ariane', universite: 'à l’Université de Montréal en médecine vétérinaire', reve: 'soigner les grands animaux de ferme depuis mon enfance en région', alternative: 'compléter un baccalauréat en sciences biomédicales pour hausser mes notes' },
          { amie: 'Mélissa', universite: 'en pharmacie clinique à l’Université Laval', reve: 'devenir pharmacienne d’hôpital au service des personnes âgées', alternative: 'faire une année intensive en chimie pharmaceutique pour réappliquer' },
          { amie: 'Laurence', universite: 'en physiothérapie à l’Université de Sherbrooke', reve: 'aider les sportifs blessés à retrouver toute leur mobilité physique', alternative: 'suivre des cours de kinésiologie pour retenter ma chance l’an prochain' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Julie... Je t’écris avec les larmes aux yeux. Je viens d’ouvrir le portail d’admission ${s.universite} et ma demande a été rejetée. Je me sens tellement découragée et blessée dans mon estime personnelle. Tu sais à quel point c’était mon rêve de ${s.reve}. J’ai maintenu d’excellentes notes pendant tout mon cégep et j’ai fait du bénévolat chaque fin de semaine pour bonifier mon dossier. Voir une simple lettre impersonnelle détruire des années d’efforts acharnés en un clic, c’est cruel. Pour l’instant, j’ai le cœur brisé et j’ai de la difficulté à voir le positif. Quand le choc sera passé, j’envisagerai probablement de ${s.alternative}. Mais pour aujourd’hui, j’ai juste besoin de pleurer un bon coup et de décompresser avec toi.`,
          questions: [
            ['Quel sentiment douloureux l’amie confie-t-elle par écrit ?', 'Une vive déception et du découragement face au rejet de son admission', 'La peur panique de devoir déménager dans une autre province', 'La colère contre ses parents qui refusent de payer son logement'],
            ['Quel engagement bénévole avait-elle pris pour maximiser ses chances ?', 'Du bénévolat régulier chaque fin de semaine en plus de ses études', 'L’organisation d’une campagne électorale municipale à plein temps', 'La direction bénévole d’un organisme de charité international'],
            ['Quelle option constructive envisage-t-elle lorsque le choc sera atténué ?', `${s.alternative[0].toUpperCase() + s.alternative.slice(1)}`, 'Déménager définitivement à l’autre bout du monde sans avertir', 'Arrêter complètement de chercher une carrière dans le domaine de la santé'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Satisfaction du gestionnaire pour l'ouverture d'un nouveau magasin
    Object.assign(
      (rand) => {
        const slots = [
          { gestionnaire: 'Monsieur Patrick Roy', commerce: 'de notre succursale d’alimentation biologique', affluence: 'plus de deux mille clients franchir nos portes', fete: 'un cinq à sept festif avec bouchées locales pour célébrer ensemble' },
          { gestionnaire: 'Monsieur Luc Tremblay', commerce: 'de notre nouvelle librairie indépendante de quartier', affluence: 'une file ininterrompue de lecteurs passionnés toute la journée', fete: 'un déjeuner convivial aux viennoiseries offert à tous les employés' },
          { gestionnaire: 'Monsieur Simon Bouchard', commerce: 'de notre boutique coopérative d’articles de plein air', affluence: 'un record historique de ventes pour un jour inaugural', fete: 'une soirée de reconnaissance avec tirage de prix de plein air' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Chère équipe, rassemblez-vous deux minutes avant la fermeture ! Je ne pouvais pas vous laisser partir ce soir sans vous féliciter chaleureusement pour l’inauguration ${s.commerce}. Cette journée a dépassé nos prévisions les plus optimistes : nous avons vu ${s.affluence} ! Malgré la foule immense et le rythme effréné à la caisse, vous avez conservé votre calme, votre sourire et votre professionnalisme irréprochable. Plusieurs clients m’ont expressément fait part de leur émerveillement devant la qualité de notre service à la clientèle. Je suis extrêmement fier de diriger une équipe aussi dévouée et talentueuse. Demain soir, la direction vous convie à ${s.fete}. Merci du fond du cœur pour votre énergie contagieuse aujourd’hui !`,
          questions: [
            ['Quel bilan chaleureux le gérant partage-t-il lors du rassemblement d’équipe ?', 'La satisfaction totale devant le succès immense de la journée d’inauguration', 'La déception causée par le manque de clients lors du premier jour', 'L’annonce d’une fermeture d’urgence pour des réparations électriques'],
            ['Quelle remarque élogieuse des clients a particulièrement touché le gestionnaire ?', 'La qualité irréprochable du service et l’accueil souriant des employés', 'Les prix anormalement bas comparés à ceux des magasins à grande surface', 'La rapidité du stationnement souterrain réservé aux véhicules'],
            ['Quelle activité de célébration conviviale est organisée pour remercier l’équipe ?', `${s.fete[0].toUpperCase() + s.fete.slice(1)}`, 'Une heure supplémentaire de travail obligatoire de grand ménage de nuit', 'Une réunion de formation technique sur les nouveaux protocoles d’inventaire'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // ===========================================================================
  // NIVEAU 6 - READING
  // ===========================================================================
// n6-reading-0
  // Ex 0: Comprendre des informations sur les spécificités d’un programme de formation.
  // Ex 1: Comprendre des informations présentées dans une infolettre concernant les activités culturelles et sportives offertes dans sa ville.
  'n6-reading-0': [
    // Scenario 0 (Template, Ex 0): Fiche de programme AEC au Cégep de Sainte-Foy
    Object.assign(
      (rand) => {
        const slots = [
          { programme: 'Attestation d’études collégiales en bureautique et coordination numérique', duree: 'quatorze mois intensifs', stage: 'un stage en entreprise de quatre cent cinquante heures', prealable: 'un diplôme d’études secondaires ou une expérience équivalente' },
          { programme: 'AEC en gestion de réseaux et cybersécurité', duree: 'seize mois à temps plein', stage: 'un stage crédité en milieu corporatif de quatre cents heures', prealable: 'avoir interrompu ses études régulières depuis au moins deux sessions' },
          { programme: 'AEC en développement Web et médias interactifs', duree: 'douze mois de formation', stage: 'un stage pratique supervisé de trois cent cinquante heures', prealable: 'la réussite d’un test de logique informatique et de français' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FICHE DESCRIPTIVE DE PROGRAMME - CÉGEP DE SAINTE-FOY\nProgramme : ${s.programme}\nCe programme s’adresse aux adultes désireux de réorienter leur carrière vers un secteur en forte demande de main-d’œuvre. La formation s’échelonne sur ${s.duree}, combinant cours théoriques en ligne et travaux dirigés en laboratoire informatique. Le cursus comprend ${s.stage}, permettant une intégration immédiate sur le marché du travail québécois. Les conditions d’admission exigent ${s.prealable}. Les cours sont dispensés de soir et les fins de semaine pour accommoder les personnes en emploi. Les candidats admissibles peuvent bénéficier des prêts et bourses du gouvernement du Québec ainsi que d’un soutien personnalisé pour la rédaction de leur curriculum vitæ. Date limite de dépôt des dossiers : le quinze novembre prochain.`,
          questions: [
            ['Quel document informatif est présenté dans cet extrait ?', 'Une fiche descriptive d’un programme de formation collégiale pour adultes', 'Une convention collective négociée pour des enseignants du collégial', 'Un formulaire d’inscription pour des activités sportives récréatives'],
            ['Quelle composante pratique essentielle le programme inclut-il ?', `${s.stage[0].toUpperCase() + s.stage.slice(1)}`, 'Un voyage de six mois dans une université européenne partenaire', 'La rédaction obligatoire d’une thèse de doctorat scientifique'],
            ['Quel aménagement d’horaire est prévu pour accommoder les adultes ?', 'Des cours dispensés les soirs et les fins de semaine', 'Des cours uniquement offerts durant les vacances d’été', 'Des sessions libres sans aucun horaire de présence imposé'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Descriptif de formation DEP professionnelle
    Object.assign(
      (rand) => {
        const slots = [
          { dep: 'Diplôme d’études professionnelles en électricité de construction', centre: 'au Centre de formation professionnelle de Québec', duree: 'mille huit cents heures d’ateliers pratiques', debouche: 'l’obtention du carnet d’apprenti électricien de la Commission de la construction' },
          { dep: 'DEP en plomberie et chauffage résidentiel', centre: 'au Centre de formation professionnelle de Montréal', duree: 'mille cinq cents heures de formation intensive', debouche: 'l’accès direct aux chantiers certifiés par la CCQ' },
          { dep: 'DEP en mécanique de véhicules lourds routiers', centre: 'au Pavillon technique de l’Estrie', duree: 'mille huit cents heures en atelier mécanique', debouche: 'un taux de placement de quatre-vingt-quinze pour cent en entreprise' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DES FORMATIONS PROFESSIONNELLES - CENTRE DE SERVICES SCOLAIRE\nProgramme : ${s.dep}, offert ${s.centre}. Cette formation qualifiante de ${s.duree} prépare les futurs diplômés à œuvrer sur les grands chantiers résidentiels et industriels du Québec. Les étudiants apprennent à lire des plans complexes, à installer des systèmes conformes au Code du bâtiment et à utiliser des outils spécialisés de pointe. La réussite du programme mène à ${s.debouche}. Les candidats doivent être âgés d’au moins seize ans et avoir réussi leurs unités de français et de mathématiques de quatrième secondaire. Les équipements de protection individuelle et les coffres à outils sont fournis gratuitement pour toute la durée des cours. Les séances d’information virtuelles ont lieu chaque mardi à dix-neuf heures.`,
          questions: [
            ['Quel diplôme technique et professionnel est détaillé dans ce guide ?', `Un programme menant à un ${s.dep}`, 'Un diplôme d’études universitaires de premier cycle en gestion hôtelière', 'Un certificat d’études supérieures en arts appliqués et dessin contemporain'],
            ['Quel débouché officiel ou reconnaissance professionnelle est garanti ?', `${s.debouche[0].toUpperCase() + s.debouche.slice(1)}`, 'Une nomination directe comme inspecteur en chef municipal', 'Un poste garanti de directeur général de multinationale'],
            ['Quel avantage matériel gratuit le centre scolaire offre-t-il aux étudiants ?', 'Les équipements de protection et les coffres à outils', 'Le transport quotidien gratuit en taxi jusqu’au centre', 'Le remboursement intégral de leur logement de fonction'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Infolettre municipale - Programmation estivale
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'de la Ville de Gatineau', parc: 'le grand parc du Lac-Beauchamp', sport: 'des initiations gratuites au canot et au kayak sur l’eau', culture: 'des projections de cinéma en plein air tous les vendredis soirs' },
          { ville: 'de la Ville de Laval', parc: 'le Centre de la nature', sport: 'des ligues amicales de volleyball de plage et de soccer', culture: 'des concerts acoustiques sous le kiosque à musique les samedis' },
          { ville: 'de la Ville de Longueuil', parc: 'le parc régional Michel-Chartrand', sport: 'des séances matinales de yoga et de course sur sentiers', culture: 'des représentations théâtrales familiales en plein air' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `INFOLETTRE MUNICIPALE OFFICIELLE - ÉDITION SPÉCIALE ÉTÉ\nChers citoyens ${s.ville}, votre programmation d’activités culturelles et récréatives pour la saison estivale est enfin dévoilée ! Tout au long des mois de juillet et août, ${s.parc} deviendra le cœur des festivités familiales. Côté loisirs sportifs, les résidents pourront profiter de ${s.sport}, avec équipement nautique et gilets de sauvetage prêtés sans frais sur présentation de la carte citoyenne. Côté culture, nous vous convions à ${s.culture}. Des camions de cuisine de rue et des aires de pique-nique ombragées seront accessibles sur place. L’inscription préalable aux ateliers de groupe est obligatoire sur le portail Web des loisirs municipaux à compter du premier juin à neuf heures. Venez célébrer l’été au grand air en famille !`,
          questions: [
            ['Quel est l’objet de cette infolettre municipale adressée aux citoyens ?', 'Présenter la programmation estivale d’activités sportives et culturelles', 'Avertir la population d’une interdiction générale d’arrosage des pelouses', 'Annoncer des hausses de taxes foncières pour les propriétaires de maisons'],
            ['Quelle offre sportive récréative est accessible gratuitement aux résidents ?', `${s.sport[0].toUpperCase() + s.sport.slice(1)}`, 'Des leçons d’équitation privées avec chevaux de course', 'Des cours payants de pilotage d’hélicoptère de plaisance'],
            ['Quelle modalité est obligatoire pour participer aux ateliers de groupe ?', 'L’inscription en ligne sur le portail des loisirs dès le 1er juin', 'Le paiement d’un droit d’entrée comptant à chaque séance', 'La présentation d’un certificat médical délivré par un médecin'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Infolettre d'arrondissement montréalais - Automne culturel
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'de l’arrondissement Rosemont-La Petite-Patrie', biblio: 'la bibliothèque Marc-Favreau', atelier: 'des ateliers d’écriture créative et de contes pour enfants', tournoi: 'le tournoi d’échecs et de badminton au centre communautaire' },
          { secteur: 'de l’arrondissement Villeray-Saint-Michel', biblio: 'la maison de la culture Claude-Léveillée', atelier: 'des cours d’initiation à la poterie et à la céramique', tournoi: 'la ligue récréative de basketball pour les adolescents' },
          { secteur: 'de l’arrondissement Verdun', biblio: 'le Quai 5160 - Maison de la culture', atelier: 'des ateliers de photographie urbaine et de peinture', tournoi: 'les courses de patins à roues alignées le long des berges' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BULLETIN COMMUNAUTAIRE - HIVER ACTIF DANS VOTRE SECTEUR\nLa direction des loisirs et de la vie de quartier ${s.secteur} est fière de vous présenter son calendrier d’automne. Dès le premier octobre, ${s.biblio} accueillera une exposition photographique captivante sur l’histoire industrielle locale ainsi que ${s.atelier}. Pour les sportifs de tous âges, les inscriptions sont officiellement ouvertes pour ${s.tournoi}. Tous les gymnases municipaux offriront également des plages horaires de bain libre et de patinage intérieur gratuit durant les fins de semaine. Les personnes détenant la carte de bibliothèque bénéficient d’un accès prioritaire pour l’ensemble des événements à jauge limitée. Rendez-vous sur notre site Internet pour réserver vos laissez-passer gratuits avant que les places ne soient épuisées !`,
          questions: [
            ['Quelle publication périodique ce document d’arrondissement constitue-t-il ?', 'Un bulletin présentant les loisirs culturels et sportifs d’automne', 'Un compte rendu budgétaire sur les dépenses de déneigement', 'Une ordonnance de police concernant le stationnement de nuit'],
            ['Quelle activité artistique ou d’apprentissage est offerte à la bibliothèque ?', `${s.atelier[0].toUpperCase() + s.atelier.slice(1)}`, 'Des leçons intensives de pilotage de drones commerciaux', 'Des cours théoriques d’astronomie appliquée aux fusées'],
            ['Quel avantage octroie la possession d’une carte de bibliothèque locale ?', 'Un accès prioritaire pour les activités à capacité d’accueil limitée', 'La gratuité complète de tous les restaurants de l’arrondissement', 'L’exemption du paiement des contraventions de la circulation'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Descriptif de microprogramme universitaire à l'UQAM
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Microprogramme de premier cycle en gestion des ressources humaines', credits: 'quinze crédits universitaires répartis sur cinq cours', formule: 'une formule cent pour cent en ligne avec des classes virtuelles le soir', public: 'les superviseurs et coordonnateurs cherchant à perfectionner leur gestion d’équipe' },
          { titre: 'Certificat en communication organisationnelle et relations publiques', credits: 'trente crédits échelonnés sur deux années d’études', formule: 'un enseignement hybride combinant visioconférences et ateliers le samedi', public: 'les professionnels en reconversion vers les métiers des communications' },
          { titre: 'Microprogramme en gestion de projets dans le secteur communautaire', credits: 'douze crédits axés sur la gouvernance et le financement', formule: 'des cours de fin de semaine intensifs une fois par mois', public: 'les intervenants et directeurs d’organismes à but non lucratif' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉPERTOIRE DES ÉTUDES CONTINUES - UNIVERSITÉ DU QUÉBEC À MONTRÉAL\nProgramme offert : ${s.titre}.\nCette formation courte et flexible comprend ${s.credits}. Conçue spécialement pour les professionnels sur le marché du travail, elle adopte ${s.formule}. Ce programme vise particulièrement ${s.public}. Les cours couvrent la législation du travail, la résolution de conflits, la communication interculturelle et les outils numériques de gestion collaborative. Les étudiants admis bénéficient d’un accès complet aux bibliothèques universitaires et aux bases de données de recherche spécialisées. Il est possible de faire reconnaître des acquis d’expérience professionnelle pour satisfaire aux exigences d’admission sans détenir de diplôme collégial préalable. Les candidatures pour la prochaine session sont acceptées jusqu’au premier août.`,
          questions: [
            ['À quelle clientèle ce programme universitaire s’adresse-t-il spécifiquement ?', `${s.public[0].toUpperCase() + s.public.slice(1)}`, 'Aux enfants du primaire cherchant des cours d’été de rattrapage', 'Aux sportifs professionnels préparant les Jeux olympiques'],
            ['Quelle modalité pédagogique facilite la conciliation avec l’emploi ?', `${s.formule[0].toUpperCase() + s.formule.slice(1)}`, 'Des cours obligatoires à temps plein de neuf heures à dix-sept heures', 'Un stage non rémunéré d’une année complète à l’étranger'],
            ['Quelle mesure d’équivalence favorise l’admission des adultes en exercice ?', 'La reconnaissance des acquis de l’expérience professionnelle', 'L’obligation de repasser tous les examens du secondaire', 'Le paiement d’une pénalité financière pour les non-diplômés'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-1
  // Ex 0: Comprendre la description des tâches à accomplir dans une offre d’emploi.
  // Ex 1: Comprendre la description d’une personnalité publique dans un article biographique.
  'n6-reading-1': [
    // Scenario 0 (Template, Ex 0): Offre d'emploi - Coordonnateur / Coordonnatrice de bureau
    Object.assign(
      (rand) => {
        const slots = [
          { poste: 'Coordonnateur administratif ou coordonnatrice administrative', organisme: 'dans une fondation caritative de Montréal', taches: 'l’accueil des partenaires, la rédaction des procès-verbaux et la logistique des réunions du conseil', salaire: 'vingt-huit à trente-deux dollars de l’heure selon l’expérience' },
          { poste: 'Adjoint exécutif ou adjointe exécutive à la direction', organisme: 'au sein d’une coopérative de services financiers', taches: 'la gestion serrée des agendas, le suivi des correspondances officielles et l’organisation des voyages', salaire: 'trente à trente-cinq dollars de l’heure avec régime de retraite' },
          { poste: 'Agent de liaison ou agente de liaison et soutien de bureau', organisme: 'dans une association provinciale pour l’environnement', taches: 'la gestion des adhésions, l’envoi des infolettres et le soutien administratif aux chargés de projet', salaire: 'vingt-sept à trente et un dollars de l’heure avec horaire flexible' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `OFFRE D’EMPLOI - RECRUTEMENT IMMÉDIAT\nTitre du poste : ${s.poste}\nNotre organisation, située ${s.organisme}, est à la recherche d’une personne dynamique, rigoureuse et organisée pour pourvoir un poste permanent à temps plein de trente-cinq heures par semaine. Sous la supervision de la direction générale, vos responsabilités principales incluront ${s.taches}. Vous assurerez également la mise à jour des banques de données et le classement des dossiers financiers. Le profil recherché comprend un diplôme collégial en bureautique ou équivalent, une excellente maîtrise du français écrit et une aisance avec la suite logicielle Microsoft 365. Le salaire offert se situe entre ${s.salaire}, avec une gamme complète d’avantages sociaux après trois mois. Faites parvenir votre lettre de motivation avant le vingt-cinq mai.`,
          questions: [
            ['Quel poste à pourvoir est décrit dans cette offre d’emploi formelle ?', `Un emploi de ${s.poste}`, 'Un poste de technicien en plomberie industrielle de nuit', 'Un contrat de chauffeur-livreur de colis volumineux'],
            ['Quelles tâches quotidiennes font partie des attributions du candidat retenu ?', `${s.taches[0].toUpperCase() + s.taches.slice(1)}`, 'La préparation complète des repas quotidiens à la cuisine pour l’ensemble du personnel', 'L’entretien mécanique et la réparation des véhicules utilitaires de service de la société'],
            ['Quelle exigence de qualification linguistique est expressément requise ?', 'Une excellente maîtrise de la langue française à l’écrit', 'La maîtrise parfaite de quatre langues étrangères vivantes', 'Un diplôme officiel de traduction simultanée en direct'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Offre d'emploi - Technicien(ne) en soutien informatique
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Technicien ou technicienne en informatique et réseau', employeur: 'au Centre de services scolaire Marguerite-Bourgeoys', responsabilites: 'l’installation des postes de travail, le dépannage technique des enseignants et la maintenance des imprimantes', horaire: 'trente-cinq heures par semaine sur un horaire de jour' },
          { titre: 'Spécialiste de soutien aux utilisateurs et infrastructures', employeur: 'à l’Institut de cardiologie de Montréal', responsabilites: 'la gestion des accès réseau, le support téléphonique d’urgence et le remplacement des pièces défectueuses', horaire: 'quarts de travail rotatifs avec primes de fin de semaine' },
          { titre: 'Technicien ou technicienne au service d’assistance technique', employeur: 'dans une grande société d’État québécoise', responsabilites: 'le diagnostic à distance des pannes logicielles, la configuration des téléphones et le suivi des billets d’incident', horaire: 'formule hybride avec deux jours de télétravail par semaine' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `OFFRE DE CARRIÈRE - SECTEUR PUBLIC QUÉBÉCOIS\nPoste : ${s.titre}, en poste régulier ${s.employeur}.\nRelevant du coordonnateur des technologies de l’information, la personne titulaire aura comme mandat principal d’assurer le bon fonctionnement du parc informatique. Les tâches comprendront ${s.responsabilites}. La personne participera également à l’inventaire du matériel et à la sensibilisation des utilisateurs aux pratiques de cybersécurité. Nous recherchons un candidat titulaire d’un DEC ou d’un DEP en soutien informatique avec au moins deux années d’expérience pertinente. Le poste offre un horaire régulier de ${s.horaire}, un fonds de pension gouvernemental très avantageux et quatre semaines de vacances dès la première année. Les candidatures doivent être déposées sur notre portail d’embauche avant le trente avril.`,
          questions: [
            ['Quel profil de poste technique est affiché dans cette annonce de recrutement ?', `Un poste de ${s.titre} dans le secteur public`, 'Un emploi de chef de cuisine dans un grand restaurant gastronomique réputé', 'Un poste d’agent de sécurité pour la surveillance des édifices municipaux'],
            ['Quelle mission opérationnelle concrète est assignée au technicien ?', `${s.responsabilites[0].toUpperCase() + s.responsabilites.slice(1)}`, 'La négociation formelle des traités commerciaux et ententes avec les partenaires étrangers', 'Le calcul complexe et la comptabilisation de la paie bimensuelle des hauts dirigeants de l’État'],
            ['Quel avantage professionnel notable est garanti dès la première année d’embauche ?', 'Quatre semaines de vacances payées et un fonds de pension avantageux', 'Une voiture de fonction renouvelée tous les six mois', 'Le versement immédiat d’une prime de départ à la retraite'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article biographique d'une scientifique québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Docteure Joanne Tremblay', origine: 'dans un village côtier de la péninsule gaspésienne', discipline: 'l’océanographie et la préservation des écosystèmes marins du Saint-Laurent', prix: 'le prestigieux prix scientifique Marie-Victorin du gouvernement du Québec' },
          { nom: 'Docteure Céline Beaulieu', origine: 'dans une famille agricole de la région du Saguenay', discipline: 'la microbiologie des sols boréaux et la régénération des forêts', prix: 'l’Ordre national du Québec pour sa contribution à la biodiversité' },
          { nom: 'Docteure Hélène Desbiens', origine: 'dans les quartiers populaires de l’est de Montréal', discipline: 'la recherche en thérapie génique contre les maladies infantiles rares', prix: 'la médaille d’or du Conseil de recherches médicales du Canada' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PORTRAIT BIOGRAPHIQUE - UNE CHERCHEUSE PIONNIÈRE DU QUÉBEC\nNée ${s.origine}, ${s.nom} a toujours été animée par une curiosité insatiable pour le monde vivant. Dès son enfance, elle observait la nature avec une rigueur qui laissait déjà présager sa carrière d’exception. Après de brillantes études à l’Université Laval et un postdoctorat en Europe, elle est devenue une référence mondiale dans le domaine de ${s.discipline}. Tout au long de sa brillante carrière, elle a publié plus de deux cents articles scientifiques révolutionnaires et encadré des dizaines d’étudiants au doctorat. En reconnaissance de ses percées marquantes, elle a reçu ${s.prix}. Au-delà de ses travaux de laboratoire, elle milite avec passion pour encourager les jeunes filles à embrasser des carrières en sciences. Une femme d’exception dont le parcours continue d’inspirer toute une génération de jeunes scientifiques d’ici.`,
          questions: [
            ['Quel est l’objet de cet article de fond publié dans la presse ?', 'Le portrait biographique d’une éminente scientifique québécoise', 'Une critique littéraire sur un roman de science-fiction récent', 'Une entrevue politique avec une candidate aux élections municipales'],
            ['Dans quelle spécialité scientifique la chercheuse a-t-elle bâti sa réputation ?', `${s.discipline[0].toUpperCase() + s.discipline.slice(1)}`, 'L’archéologie médiévale et les langues disparues', 'L’astronomie appliquée aux satellites militaires'],
            ['Quelle cause sociale défend-elle activement en plus de ses recherches ?', 'L’encouragement des jeunes filles à poursuivre des études scientifiques', 'L’interdiction totale de l’usage des ordinateurs à l’école', 'Le refus des subventions gouvernementales pour la recherche'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Portrait d'un chef cuisinier mettant en valeur le terroir
    Object.assign(
      (rand) => {
        const slots = [
          { chef: 'Normand Laprise', restaurant: 'son célèbre établissement gastronomique montréalais', philosophie: 'sublimer les produits sauvages de la forêt boréale et le terroir québécois', honneur: 'l’Ordre du Canada pour son rôle d’ambassadeur de notre gastronomie' },
          { chef: 'Martin Picard', restaurant: 'sa fameuse cabane à sucre revisitée en milieu champêtre', philosophie: 'réinventer les traditions culinaires rustiques avec générosité et audace', honneur: 'de multiples distinctions internationales décernées par ses pairs' },
          { chef: 'Colombe St-Pierre', restaurant: 'sa table réputée nichée au bord du fleuve dans le Bas-Saint-Laurent', philosophie: 'valoriser les algues marines, les herbes de grève et les poissons côtiers', honneur: 'le titre prestigieux de chef de l’année au gala des lauriers de la gastronomie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FIGURES MARQUANTES DE CHEZ NOUS - LE CHEF DU TERROIR\nReconnu comme l’un des plus grands créateurs culinaires de son époque, ${s.chef} a profondément transformé la culture de la table au Québec. Parti de rien après une jeunesse modeste en région, il a fait ses classes dans les grandes cuisines européennes avant de revenir s’établir à Montréal. En fondant ${s.restaurant}, il a imposé une vision culinaire avant-gardiste : ${s.philosophie}. Il a forgé des alliances durables avec des petits producteurs agricoles, des cueilleurs de champignons sauvages et des pêcheurs artisans de la péninsule. Pour souligner sa contribution exceptionnelle à notre rayonnement culturel, il a été décoré de ${s.honneur}. Aujourd’hui mentor auprès de la relève, il enseigne avec humilité l’importance de respecter la terre et les saisons.`,
          questions: [
            ['De quelle personnalité emblématique cet article retrace-t-il la carrière ?', 'D’un chef cuisinier québécois pionnier de la mise en valeur du terroir', 'D’un homme d’affaires ayant créé une chaîne de restauration rapide', 'D’un peintre paysagiste ayant représenté les forêts boréales'],
            ['Quelle philosophie culinaire distinctive a fait sa renommée dans le milieu ?', `${s.philosophie[0].toUpperCase() + s.philosophie.slice(1)}`, 'L’importation exclusive d’ingrédients exotiques par avion', 'L’utilisation systématique de produits chimiques aromatisés'],
            ['Quelle haute distinction honorifique lui a été accordée pour son rayonnement ?', `${s.honneur[0].toUpperCase() + s.honneur.slice(1)}`, 'Le titre de citoyen d’honneur d’une métropole étrangère', 'Une médaille de bravoure militaire pour actes héroïques'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Offre d'emploi - Préposé(e) aux bénéficiaires
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Préposé ou préposée aux bénéficiaires', etablissement: 'en centre d’hébergement de soins de longue durée (CHSLD)', soins: 'l’aide à l’alimentation, l’hygiène corporelle et la mobilisation sécuritaire des résidents âgés', exigences: 'détenir une attestation d’études professionnelles (AEP) et une carte de RCR à jour' },
          { titre: 'Auxiliaire aux services de santé et sociaux', etablissement: 'au soutien à domicile du CLSC local', soins: 'l’accompagnement quotidien, la préparation de repas légers et la surveillance bienveillante', exigences: 'posséder un diplôme d’études secondaires et un permis de conduire valide avec voiture' },
          { titre: 'Préposé ou préposée aux soins généraux', etablissement: 'dans une résidence privée pour aînés certifiée', soins: 'la distribution des plateaux de repas, l’aide au lever et l’animation d’activités de loisir', exigences: 'avoir une grande empathie, de la patience et une bonne endurance physique au travail' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `AVIS DE RECRUTEMENT EN SANTÉ - EMPLOI ESSENTIEL\nTitre d’emploi : ${s.titre}, ${s.etablissement}.\nNous recrutons des personnes bienveillantes et engagées pour offrir des soins personnalisés à notre clientèle vulnérable. Votre rôle quotidien sera au cœur du confort des personnes hébergées : vos responsabilités comprendront ${s.soins}. Vous travaillerez en étroite collaboration avec l’équipe d’infirmières pour signaler tout changement dans l’état de santé des usagers. Les exigences du poste demandent de ${s.exigences}. Nous offrons un salaire horaire débutant à vingt-six dollars de l’heure avec des primes de soir et de nuit bonifiées, ainsi qu’une conciliation travail-famille exemplaire. Plusieurs postes permanents sont offerts à temps plein ou à temps partiel. Postulez dès aujourd’hui en joignant votre relevé de notes !`,
          questions: [
            ['Quel corps de métier en milieu de soins fait l’objet de cette offre d’emploi ?', `Un poste de ${s.titre} auprès de personnes âgées`, 'Un contrat de chirurgien spécialiste en bloc opératoire', 'Un poste d’ingénieur en biomécanique hospitalière'],
            ['Quels soins quotidiens d’assistance le candidat doit-il apporter aux résidents ?', `${s.soins[0].toUpperCase() + s.soins.slice(1)}`, 'La prescription médicale de traitements complexes et la chirurgie d’urgence', 'La réparation technique des installations de plomberie et du système électrique'],
            ['Quelle condition formelle fait partie des critères d’admissibilité énoncés ?', `${s.exigences[0].toUpperCase() + s.exigences.slice(1)}`, 'La possession d’un diplôme d’études universitaires de deuxième cycle', 'Avoir déjà géré une équipe de plus de cinquante professionnels'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-2
  // Ex 0: Suivre le parcours d’un cétacé égaré dans un cours d’eau rapporté par la presse.
  // Ex 1: Suivre, dans un article, le déroulement des évènements concernant une panne d’électricité majeure dans sa ville.
  'n6-reading-2': [
    // Scenario 0 (Template, Ex 0): Article presse - Rorqual à bosse égaré à Montréal
    Object.assign(
      (rand) => {
        const slots = [
          { cetace: 'un rorqual à bosse juvénile de dix mètres', distance: 'à plus de quatre cent cinquante kilomètres de son habitat marin salé', endroit: 'dans le bassin du Vieux-Port de Montréal', mesure: 'imposer une zone d’exclusion maritime et réduire la vitesse des navires marchands' },
          { cetace: 'un jeune béluga blanc égaré de son groupe', distance: 'à près de trois cents kilomètres en amont de Tadoussac', endroit: 'près du pont Jacques-Cartier dans les courants du fleuve', mesure: 'interdire la circulation des bateaux de plaisance et des motomarines dans le secteur' },
          { cetace: 'une baleine de Minke d’environ sept mètres', distance: 'à plus de cinq cents kilomètres des eaux maritimes de l’estuaire', endroit: 'aux abords des quais du port commercial de Montréal', mesure: 'déployer des hydrophones acoustiques pour surveiller l’état de santé du mammifère' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ACTUALITÉ ENVIRONNEMENTALE - ODYSSÉE INHABITUELLE DANS LE FLEUVE\nUn événement faunique exceptionnel retient l’attention des Québécois depuis plusieurs jours. ${s.cetace[0].toUpperCase() + s.cetace.slice(1)} a remonté le cours du fleuve Saint-Laurent pour atteindre les eaux douces ${s.endroit}. L’animal se trouve ${s.distance}, un phénomène rarissime qui inquiète au plus haut point les biologistes du Réseau québécois d’urgences pour les mammifères marins. Selon les spécialistes, l’eau douce prolongée fragilise la peau de l’animal et il ne trouve aucune nourriture adaptée dans ce secteur. Afin de protéger le mammifère contre d’éventuelles collisions, Transports Canada a ordonné d’${s.mesure}. Des navires de la Garde côtière veillent jour et nuit pour dissuader les curieux de s’approcher. Tous espèrent que la baleine retrouvera d’elle-même le chemin vers l’océan.`,
          questions: [
            ['Quel événement faunique inhabituel est rapporté par la presse québécoise ?', 'La présence d’une baleine égarée dans les eaux douces du fleuve', 'L’invasion de poissons carnivores dans les lacs de villégiature', 'La découverte d’un squelette fossilisé de dinosaure marin sur une plage'],
            ['Pourquoi la présence prolongée de l’animal dans ce secteur inquiète-t-elle ?', 'L’eau douce fragilise sa peau et il n’y trouve aucune nourriture', 'L’animal risque de geler instantanément à cause de la température', 'Le cétacé empêche tous les ponts routiers de s’ouvrir pour les voitures'],
            ['Quelle consigne de sécurité immédiate les autorités maritimes ont-elles imposée ?', `${s.mesure[0].toUpperCase() + s.mesure.slice(1)}`, 'Pêcher la baleine avec un filet géant pour la transférer en camion', 'Construire un mur de béton au milieu du fleuve pour la bloquer'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Baleine à bosse dans le fjord du Saguenay
    Object.assign(
      (rand) => {
        const slots = [
          { animal: 'une baleine bleue géante', site: 'dans la baie Éternité en plein cœur du fjord', alerte: 'des kayakistes ébahis qui ont aperçu son souffle puissant à l’aube', secours: 'une équipe de patrouilleurs du parc marin escortant l’animal à distance respectueuse' },
          { animal: 'un rorqual commun adulte', site: 'dans les eaux profondes de l’embouchure du Saguenay', alerte: 'le capitaine d’un traversier régulier reliant les deux rives', secours: 'des scientifiques munis de balises satellites pour cartographier ses plongées' },
          { animal: 'un groupe de dauphins à flancs blancs', site: 'dans les méandres étroits de la rivière Saguenay', alerte: 'des résidents riverains intrigués par leurs bonds hors de l’eau', secours: 'la Société d’action pour les mammifères marins diffusant des signaux acoustiques de guidage' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `REPORTAGE DE PRESSE - INTRUSION SPECTACULAIRE AU ROYAUME DU SAGUENAY\nLes riverains du fjord assistent depuis quarante-huit heures à un spectacle naturel fascinant. ${s.animal[0].toUpperCase() + s.animal.slice(1)} s’est aventuré bien au-delà de son périmètre habituel, naviguant ${s.site}. Le premier signalement a été donné par ${s.alerte}. Les experts maritimes expliquent que des courants inhabituels de krill ont pu attirer l’animal dans cette gorge rocheuse abrupte. Pour garantir la quiétude de ce visiteur majestueux, ${s.secours} veille à ce qu’aucune embarcation de plaisance ne s’approche à moins de quatre cents mètres. Les autorités rappellent que le harcèlement d’un mammifère marin protégé constitue une infraction passible de lourdes amendes en vertu de la loi sur les espèces en péril.`,
          questions: [
            ['Quel phénomène d’observation marine fait l’objet de cet article de presse ?', 'L’incursion rare d’un grand cétacé dans les eaux profondes du fjord', 'Une marée noire causée par l’échouement d’un pétrolier étranger', 'La disparition complète de tous les phoques de l’estuaire marin'],
            ['Qui a transmis le tout premier signalement de la présence de l’animal ?', `${s.alerte[0].toUpperCase() + s.alerte.slice(1)}`, 'Un hélicoptère de télévision filmant un téléroman local', 'Un pêcheur commercial dont les filets ont été emportés au large'],
            ['Quelle mesure légale de protection les patrouilleurs font-ils respecter ?', 'Garder une distance minimale de quatre cents mètres sans harcèlement', 'Nourrir l’animal chaque heure avec des poissons achetés en poissonnerie', 'Forcer le mammifère à faire des acrobaties pour les touristes'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Panne d'électricité majeure après une tempête de vent
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'dans la région métropolitaine de Montréal', rafales: 'des vents violents soufflant à près de cent kilomètres à l’heure', foyers: 'plus de deux cent cinquante mille foyers et commerces', mobilisation: 'cinq cents équipes de monteurs de ligne déployées jour et nuit sur le terrain' },
          { ville: 'dans les arrondissements de la ville de Québec', rafales: 'des bourrasques de vent destructrices accompagnées de pluie verglaçante', foyers: 'près de cent quatre-vingts mille clients d’Hydro-Québec', mobilisation: 'des équipes venues en renfort d’autres provinces pour réparer les lignes' },
          { ville: 'dans la région de la Montérégie', rafales: 'un coup de vent destructeur arrachant de nombreux toits de grange', foyers: 'plus de cent cinquante mille résidences privées', mobilisation: 'des spécialistes élagueurs débroussaillant les débris tombés sur les fils' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE D’ACTUALITÉ - LA VILLE PLONGÉE DANS LE NOIR\nLa tempête automnale qui a balayé le sud de la province a laissé de lourdes séquelles ${s.ville}. Hier vers dix-sept heures, ${s.rafales} ont provoqué la chute de centaines de branches et de gros arbres sur le réseau électrique. En moins de deux heures, les coupures se sont propagées, privant d’électricité ${s.foyers}. Les feux de circulation éteints ont provoqué des embouteillages monstres sur toutes les artères principales. Plusieurs municipalités ont ouvert des centres d’hébergement d’urgence avec génératrices pour permettre aux citoyens de se réchauffer et de recharger leurs appareils cellulaires. Hydro-Québec souligne que ${s.mobilisation}. Le rétablissement complet du courant prendra toutefois encore de quarante-huit à soixante-douze heures dans les secteurs les plus lourdement endommagés.`,
          questions: [
            ['Quel événement météorologique majeur a causé la panne d’électricité ?', 'Des vents violents provoquant la chute d’arbres sur les fils électriques', 'Une canicule extrême qui a fait fondre les transformateurs de quartier', 'Un tremblement de terre ayant détruit une centrale hydroélectrique'],
            ['Combien d’abonnés ont été privés de courant au pire moment de la crise ?', `${s.foyers[0].toUpperCase() + s.foyers.slice(1)}`, 'Seulement une dizaine de maisons isolées dans les bois', 'L’ensemble de la population de l’Amérique du Nord tout entière'],
            ['Quelle mesure municipale d’urgence a été ouverte pour soutenir la population ?', 'Des centres d’hébergement avec génératrices pour se réchauffer', 'La distribution de billets d’avion gratuits vers le Sud', 'L’évacuation obligatoire de la totalité des habitants vers une autre ville'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Panne causée par une tempête de verglas printanière
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'la région de Lanaudière et des Laurentides', epaisseur: 'une couche de verglas pesant jusqu’à vingt-cinq millimètres de glace', bris: 'l’effondrement de dizaines de poteaux de bois et de transformateurs', delai: 'trois à quatre jours de travaux continus' },
          { secteur: 'l’ouest de l’île de Montréal et Laval', epaisseur: 'quinze millimètres de pluie verglaçante accumulée sur les branches', bris: 'la rupture de câbles à haute tension près des grands axes routiers', delai: 'au moins quarante-huit heures de travail acharné' },
          { secteur: 'la région de l’Outaouais', epaisseur: 'vingt millimètres de glace vive alourdissant la végétation', bris: 'des chutes d’arbres massives bloquant les chemins de campagne', delai: 'quatre à cinq jours pour les secteurs les plus ruraux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CRISE CLIMATIQUE - LE VERGLAS PARALYSE LE RÉSEAU ÉNERGÉTIQUE\nUn épisode de pluie verglaçante printanier d’une intensité exceptionnelle a durement frappé ${s.secteur} depuis mercredi soir. L’accumulation de ${s.epaisseur} a fait céder la végétation sous un poids colossal. Les bruits de branches qui cassaient ont résonné toute la nuit dans les quartiers résidentiels. Le réseau de distribution a subi des dommages considérables, avec ${s.bris}. Les hôpitaux et les résidences pour personnes âgées ont basculé sans interruption sur leurs génératrices d’urgence. La présidente d’Hydro-Québec a appelé la population à la patience lors d’un point de presse, estimant qu’il faudra ${s.delai} pour rebrancher tous les foyers isolés. Les pompiers rappellent de ne jamais utiliser de barbecues ou de génératrices à l’intérieur d’un logement pour éviter les intoxications mortelles au monoxyde de carbone.`,
          questions: [
            ['Quelle catastrophe naturelle hivernale a causé les bris massifs sur le réseau ?', 'Une pluie verglaçante intense dont le poids de glace a brisé les lignes', 'Une tornade d’été qui a balayé le centre commercial de la ville', 'Une sécheresse prolongée ayant asséché les réservoirs des barrages'],
            ['Comment les hôpitaux du secteur ont-ils assuré la continuité de leurs soins ?', 'En basculant immédiatement sur leurs génératrices d’urgence', 'En transférant tous leurs patients par ambulance vers une autre province', 'En demandant aux malades de rentrer chez eux attendre la fin de la crise'],
            ['Quelle consigne de sécurité vitale les pompiers martèlent-ils aux citoyens ?', 'Ne jamais utiliser de barbecue ou de génératrice à l’intérieur', 'Garder toutes les portes et fenêtres grandement ouvertes pour aérer', 'Tenter de réparer soi-même les câbles électriques tombés au sol'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Béluga égaré dans la rivière Saint-Maurice
    Object.assign(
      (rand) => {
        const slots = [
          { riviere: 'la rivière Saint-Maurice à la hauteur de Shawinigan', mammifere: 'un béluga blanc adulte reconnaissable à sa peau d’ivoire', alerte: 'des pêcheurs sportifs en chaloupe médusés par son apparition', protocole: 'le Réseau d’urgences pour les mammifères marins avec des vétérinaires spécialisés' },
          { riviere: 'la rivière Richelieu près du bassin de Chambly', mammifere: 'un jeune béluga gris encore dépendant de son alimentation marine', alerte: 'des plaisanciers qui ont photographié sa silhouette près des écluses', protocole: 'Pêches et Océans Canada avec des biologistes de l’aquarium' },
          { riviere: 'la rivière des Prairies au nord de Montréal', mammifere: 'un rorqual à museau pointu en quête de bancs de poissons', alerte: 'des marcheurs longeant le parc riverain de la Merci', protocole: 'une coalition d’experts fauniques équipés de drones d’observation aérienne' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FAITS DIVERS SCIENTIFIQUES - UN HABITANT DE L’ARCTIQUE EN PLEIN CŒUR DU QUÉBEC\nLa surprise a été totale lorsque ${s.mammifere} a été aperçu nageant paisiblement dans ${s.riviere}. L’alerte a été transmise aux autorités par ${s.alerte}. Aussitôt informée, une équipe conjointe comprenant ${s.protocole} s’est mobilisée pour évaluer la viabilité d’un sauvetage ou d’un raccompagnement vers l’estuaire. Selon les spécialistes, les barrages hydroélectriques et les ponts routiers représentent des obstacles infranchissables pour le cétacé en amont. Les patrouilleurs nautiques ont établi un corridor de protection strict pour empêcher les curieux de s’approcher en canot ou en motomarine. La présence de cet ambassadeur des mers froides en plein territoire continental rappelle la fragilité de nos écosystèmes et l’importance de protéger nos cours d’eau.`,
          questions: [
            ['Où cet animal marin protégé a-t-il été repéré de manière inattendue ?', `Dans les eaux intérieures d’une rivière québécoise continentale`, 'Dans un parc zoologique privé en plein centre-ville de Toronto', 'Au fond d’une piscine résidentielle dans un quartier de banlieue'],
            ['Quelle entrave majeure bloque la progression naturelle du cétacé vers l’amont ?', 'Les barrages hydroélectriques et les ponts routiers infranchissables', 'La présence de requins géants prédateurs le long des berges', 'Une muraille de glaces permanente interdisant tout passage'],
            ['Quel appel à la conscience environnementale cette présence insolite lance-t-elle ?', 'La fragilité des écosystèmes marins et l’importance de protéger l’eau', 'L’obligation d’éliminer tous les prédateurs aquatiques de nos rivières', 'La nécessité d’assécher les rivières pour faciliter le transport routier'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-3
  // Ex 0: Comprendre les explications de son propriétaire, transmises dans une lettre, concernant sa décision d’augmenter le loyer.
  // Ex 1: Comprendre, dans un article de magazine, les explications d’une personne concernant son choix de pratiquer l’agriculture urbaine.
  'n6-reading-3': [
    // Scenario 0 (Template, Ex 0): Lettre officielle du propriétaire justifiant la hausse
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Gestion Immobilière du Nord', nouveau: 'neuf cent quatre-vingts dollars', hausse: 'quarante dollars par mois', raison: 'la hausse historique de douze pour cent du compte de taxes foncières municipales', travaux: 'le remplacement complet des chauffe-eau de l’immeuble l’automne dernier' },
          { proprio: 'Immeubles Résidentiels Tremblay', nouveau: 'mille quarante dollars', hausse: 'quarante-cinq dollars par mois', raison: 'l’augmentation marquée de la facture d’assurance bâtiment du complexe', travaux: 'la réfection de la brique de façade et le calfeutrage de toutes les fenêtres' },
          { proprio: 'Société Immobilière Lavoie', nouveau: 'neuf cent cinquante dollars', hausse: 'trente-cinq dollars par mois', raison: 'la flambée des coûts contractuels de déneigement et d’entretien extérieur', travaux: 'l’installation d’un nouveau système d’interphone sécurisé avec caméra' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `AVIS D’AUGMENTATION DE LOYER - RENOUVELLEMENT DU BAIL\nDe : ${s.proprio}\nÀ : Locataire du logement 4\nMadame, Monsieur,\nConformément aux formulaires officiels du Tribunal administratif du logement, nous vous avisons qu’à compter du premier juillet, votre loyer mensuel sera de ${s.nouveau}, soit une hausse de ${s.hausse}. Cette révision découle de deux facteurs majeurs : d’une part, ${s.raison}, et d’autre part, ${s.travaux}. Ces investissements améliorent la sécurité et le confort de votre immeuble. Conformément à la loi, vous disposez d’un délai de trente jours suivant la réception de cet avis pour nous signifier par écrit votre acceptation ou votre refus. En l’absence de réponse dans ce délai, l’augmentation sera réputée acceptée. Nous vous remercions pour votre confiance continue.`,
          questions: [
            ['Quel document juridique et financier le propriétaire adresse-t-il au locataire ?', 'Un avis formel d’augmentation de loyer pour le renouvellement du bail', 'Une mise en demeure pour non-paiement de loyer avec préavis d’expulsion', 'Une offre d’achat exclusive pour devenir propriétaire de son logement'],
            ['Quelle dépense municipale ou administrative justifie principalement cette hausse ?', `${s.raison[0].toUpperCase() + s.raison.slice(1)}`, 'L’achat d’un chalet personnel pour les vacances du gestionnaire', 'L’amende imposée par la ville pour tapage nocturne dans l’immeuble'],
            ['De quel délai le locataire dispose-t-il pour communiquer sa réponse par écrit ?', 'Un délai légal de trente jours suivant la réception de l’avis officiel', 'Un délai strict de quarante-huit heures sous peine de résiliation', 'Aucun délai car l’acceptation est obligatoire sans possibilité de refus'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Lettre du propriétaire avec grille de calcul du TAL
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Monsieur Paul Gagnon', loyer: 'mille cent vingt dollars', taux: 'trois virgule huit pour cent d’augmentation', investissement: 'la pose d’une nouvelle toiture blanche écoénergétique garantie trente ans' },
          { proprio: 'Monsieur Marc Simard', loyer: 'neuf cent quatre-vingt-dix dollars', taux: 'quatre virgule deux pour cent de majoration', investissement: 'le changement de la chaudière au gaz par un système à thermopompe haute efficacité' },
          { proprio: 'Monsieur Denis Bouchard', loyer: 'mille soixante-quinze dollars', taux: 'trois virgule cinq pour cent de hausse', investissement: 'la réfection de l’ensemble des escaliers extérieurs et rampes de sécurité' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `LETTRE DU PROPRIÉTAIRE - CALCUL DU LOYER\nChère locataire,\nComme chaque printemps, je vous transmets les conditions de renouvellement de votre bail. En appliquant la grille officielle du Tribunal administratif du logement, votre loyer mensuel passera à ${s.loyer}, soit ${s.taux}. Cette hausse s’explique par des travaux indispensables sur le bâtiment, notamment ${s.investissement}, ainsi que par l’augmentation marquée des assurances de l’immeuble. Je privilégie toujours l’entretien préventif pour vous offrir un espace sain et sécuritaire. Vous trouverez ci-joint la copie de la feuille de calcul officielle du tribunal détaillant chaque montant. N’hésitez pas à me contacter si vous souhaitez en discuter calmement de vive voix.`,
          questions: [
            ['Sur quel outil officiel le propriétaire s’appuie-t-il pour déterminer la hausse ?', 'La grille de calcul du Tribunal administratif du logement (TAL)', 'Un tirage au sort organisé entre les locataires du quartier', 'Une estimation arbitraire basée sur les prix des maisons de luxe'],
            ['Quel investissement matériel sur le bâtiment justifie ce calcul transparent ?', `${s.investissement[0].toUpperCase() + s.investissement.slice(1)}`, 'L’achat d’un téléviseur écran géant pour le salon du concierge', 'La construction d’une piscine privée réservée au propriétaire'],
            ['Quelle attitude le locateur adopte-t-il envers sa locataire dans cette démarche ?', 'Une attitude transparente et ouverte au dialogue de vive voix', 'Une menace agressive d’expulsion immédiate en cas de question', 'Un refus total de fournir les pièces justificatives des dépenses'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article magazine - Choix de l'agriculture urbaine sur son toit
    Object.assign(
      (rand) => {
        const slots = [
          { personne: 'Guillaume Lemay', quartier: 'dans le quartier Mile-End à Montréal', potager: 'un potager sur toit d’une centaine de bacs en feutre', benefice: 'récolter des tomates ancestrales, des fines herbes et des courgettes biologiques' },
          { personne: 'Mathieu Roy', quartier: 'dans le quartier Saint-Roch à Québec', potager: 'un jardin suspendu aménagé sur une terrasse communautaire', benefice: 'produire des légumes frais sans pesticides pour nourrir trois familles' },
          { personne: 'Sébastien Côté', quartier: 'dans le secteur du Vieux-Rosemont', potager: 'un écosystème de toiture verte avec ruche et composteur', benefice: 'consommer des aliments cueillis à maturité sans aucun emballage plastique' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MAGAZINE ÉCO-CITOYEN - LE VIRAGE VERT D’UN CITADIN PASSIONNÉ\nInstallé ${s.quartier}, ${s.personne} a troqué sa pelouse de banlieue contre ${s.potager}. Dans une entrevue captivante, il nous explique les raisons profondes qui l’ont poussé vers l’agriculture urbaine. « J’en avais assez d’acheter en épicerie des légumes suremballés ayant parcouru trois mille kilomètres en camion réfrigéré sans aucun goût, confie-t-il. Je voulais reprendre le contrôle de ce que je mets dans mon assiette. » Aujourd’hui, son installation ingénieuse lui permet de ${s.benefice}. Au-delà de l’autonomie alimentaire partielle, cette pratique a transformé sa vie sociale : ses voisins de palier montent régulièrement l’aider à arroser en échange de paniers maraîchers. « Cela crée un sentiment d’appartenance et de partage extraordinaire au cœur même de la ville bétonnée », conclut-il avec un grand sourire.`,
          questions: [
            ['Quel choix de mode de vie écologique est mis en lumière dans ce reportage ?', 'La pratique de l’agriculture urbaine sur un toit en milieu citadin', 'L’abandon de la vie en ville pour acheter une immense ferme industrielle', 'L’ouverture d’une chaîne de restaurants végétariens franchisés'],
            ['Quelle motivation première a poussé le citadin vers cette pratique maraîchère ?', 'Le refus des légumes insipides d’épicerie transportés sur des milliers de kilomètres', 'L’obligation légale ordonnée par les règlements d’urbanisme de sa ville', 'La volonté d’éviter de payer l’impôt foncier sur son appartement'],
            ['Quel bienfait humain et communautaire inattendu l’initiative a-t-elle engendré ?', 'Le renforcement des liens de solidarité et de partage avec ses voisins', 'Des conflits violents et des plaintes répétées auprès des tribunaux', 'La faillite de toutes les petites épiceries du quartier environnant'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Entrevue magazine - Potager nourricier familial en façade
    Object.assign(
      (rand) => {
        const slots = [
          { mere: 'Isabelle Martel', ville: 'à Longueuil', superficie: 'une plate-bande nourricière de deux cents mètres carrés', impact: 'une réduction de quarante pour cent de notre facture d’épicerie estivale' },
          { mere: 'Caroline Bélanger', ville: 'à Sherbrooke', superficie: 'un jardin écologique en permaculture occupant toute la façade', impact: 'une économie de plus de cinq cents dollars sur nos achats de fruits et légumes' },
          { mere: 'Stéphanie Gagnon', ville: 'à Trois-Rivières', superficie: 'un aménagement de bacs en bois surélevés bordant la cour avant', impact: 'l’apprentissage concret de la biodiversité pour nos trois jeunes enfants' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE MAISON DURABLE - QUAND LE GAZON DEVIENT POTAGER\nIl y a trois ans, ${s.mere}, résidente ${s.ville}, a transformé sa cour avant en remplaçant sa pelouse verte par ${s.superficie}. « Arroser et tondre un gazon gourmand en engrais me semblait un non-sens écologique complet », explique-t-elle. Les récoltes ont rapidement dépassé ses attentes : légumes frais, herbes et petits fruits comblent sa famille tout l’été. L’impact sur les finances familiales est majeur : ${s.impact}. De plus, les voisins s’arrêtent quotidiennement pour admirer les fleurs mellifères et échanger des conseils de jardinage. Son initiative inspire désormais tout le quartier à cultiver ses propres aliments avec fierté.`,
          questions: [
            ['Quelle transformation paysagère audacieuse cette résidente a-t-elle réalisée ?', 'Remplacer sa pelouse de gazon par un jardin potager nourricier', 'Bétonner toute sa cour avant pour stationner quatre voitures', 'Planter des arbres géants pour cacher complètement sa maison'],
            ['Quelle critique écologique formulait-elle envers la pelouse traditionnelle ?', 'Le gaspillage d’eau et d’engrais pour une herbe purement décorative', 'Le fait que le gazon attirait des troupeaux d’ours sauvages', 'Le coût excessif des graines de pelouse importées de pays lointains'],
            ['Quel impact positif concret l’aménagement a-t-il procuré au foyer ?', `${s.impact[0].toUpperCase() + s.impact.slice(1)}`, 'Une invitation à participer à une téléréalité américaine', 'L’obligation de payer une surtaxe municipale pour absence de gazon'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Lettre du propriétaire motivant la hausse par l'énergie
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Immeubles de l’Estrie', loyer_actuel: 'huit cent quatre-vingts dollars', loyer_futur: 'neuf cent vingt dollars', facteur: 'l’explosion des tarifs de mazout et le passage obligatoire à l’électricité', travaux_immeuble: 'l’isolation thermique du toit et le remplacement des portes d’entrée coupe-froid' },
          { proprio: 'Gestion Résidentielle Chaudière', loyer_actuel: 'neuf cent dix dollars', loyer_futur: 'neuf cent cinquante dollars', facteur: 'la hausse des coûts d’énergie et des matériaux de réparation d’urgence', travaux_immeuble: 'la pose de fenêtres à triple vitrage pour réduire les pertes de chaleur' },
          { proprio: 'Habitations Mauricie', loyer_actuel: 'huit cent quarante dollars', loyer_futur: 'huit cent soixante-quinze dollars', facteur: 'les augmentations substantielles des primes d’assurance contre les dégâts d’eau', travaux_immeuble: 'le renouvellement de la plomberie et des valves de sécurité principales' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COMMUNICATION DU LOCATEUR - PROPOSITION DE RENOUVELLEMENT\nChère locataire, cher locataire,\nNous vous soumettons notre proposition de renouvellement de bail pour l’année prochaine. Votre loyer passera de ${s.loyer_actuel} à ${s.loyer_futur} à compter du premier juillet. Cette hausse découle des critères du Tribunal administratif du logement et s’explique par deux dépenses incontournables : ${s.facteur}, ainsi que ${s.travaux_immeuble}. Ces rénovations assurent un confort durable à votre logement. Si vous acceptez ces conditions, le bail se renouvellera automatiquement. En cas de refus, veuillez nous aviser par écrit dans les trente jours. Nous vous remercions pour votre confiance continue et vous souhaitons un excellent été.`,
          questions: [
            ['Quel changement de contrat de location le locateur annonce-t-il dans cette lettre ?', `Un ajustement du loyer passant de ${s.loyer_actuel} à ${s.loyer_futur}`, 'L’interdiction définitive de renouveler le bail pour tous les résidents', 'Une baisse exceptionnelle de loyer pour compenser des désagréments'],
            ['Quelle cause énergétique ou d’assurance est citée pour justifier le calcul ?', `${s.facteur[0].toUpperCase() + s.facteur.slice(1)}`, 'Une perte financière liée à des investissements à la bourse étrangère', 'L’achat d’un yacht de luxe pour les vacances d’été des actionnaires'],
            ['Que doit faire le locataire s’il accepte les nouvelles conditions proposées ?', 'Il n’a rien à faire, le bail se renouvelle automatiquement', 'Il doit signer un nouveau contrat chez un notaire assermenté', 'Il doit payer immédiatement un an de loyer d’avance en liquide'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-4
  // Ex 0: Suivre la procédure pour retourner un vêtement acheté sur le site d’une boutique en ligne.
  // Ex 1: Suivre la procédure pour obtenir des prestations d’assurance parentale.
  'n6-reading-4': [
    // Scenario 0 (Template, Ex 0): Procédure de retour boutique de vêtements québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { boutique: 'la boutique de mode éthique Simons', delai: 'trente jours suivant la date de réception du colis', condition: 'l’article doit être non porté, non lavé et conserver toutes ses étiquettes d’origine', point: 'dans n’importe quel comptoir postal de Postes Canada' },
          { boutique: 'la plateforme de vêtements de plein air Chlorophylle', delai: 'quarante-cinq jours suivant la livraison à domicile', condition: 'le vêtement doit être dans son emballage d’origine avec la facture d’achat', point: 'au bureau de livraison le plus proche de votre domicile' },
          { boutique: 'la boutique montréalaise Frank And Oak', delai: 'trente jours civils après confirmation de commande', condition: 'l’habit doit être dans un état neuf impeccable avec code-barres intact', point: 'dans un point de dépôt sécurisé affilié de votre secteur' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `POLITIQUE DE RETOUR ET REMBOURSEMENT EN LIGNE\nPour retourner un vêtement commandé chez ${s.boutique}, suivez ces directives simples. Connectez-vous à votre compte client sous « Historique des commandes » et sélectionnez « Demande de retour ». Vous disposez d’un délai maximal de ${s.delai}. Précisez le motif du renvoi puis assurez-vous que ${s.condition}. Ensuite, imprimez l’étiquette de retour préaffranchie, collez-la sur le colis d’origine et déposez le paquet ${s.point}. Dès réception et inspection à notre entrepôt, le remboursement sera versé sur votre carte de crédit sous cinq jours ouvrables.`,
          questions: [
            ['Quelle démarche commerciale ce guide d’aide en ligne détaille-t-il ?', 'La procédure pour retourner un vêtement et obtenir un remboursement', 'Les consignes de sécurité pour laver des vêtements de laine à la main', 'L’adhésion payante à un club de fidélité pour des soldes exclusives'],
            ['Quelle condition impérative concernant l’état du vêtement est exigée ?', `${s.condition[0].toUpperCase() + s.condition.slice(1)}`, 'L’habit doit avoir été porté au moins une fois lors d’une fête', 'Le vêtement doit être entièrement décousu pour vérification'],
            ['Où le client doit-il déposer son colis muni de l’étiquette préaffranchie ?', `Il doit déposer le paquet ${s.point}`, 'Directement dans la boîte aux lettres du directeur de la compagnie', 'Chez le concierge de son immeuble sans aucune identification'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure échange ou retour chaussures en ligne
    Object.assign(
      (rand) => {
        const slots = [
          { magasin: 'la boutique québécoise Yellow Chaussures', delai: 'dans les trente jours suivant l’achat en ligne', exigence: 'les chaussures doivent être retournées dans leur boîte d’origine non abîmée sans traces d’usure sur la semelle', mode: 'un crédit magasin instantané ou un remboursement sur le mode de paiement original' },
          { magasin: 'le magasin de chaussures et bottes Kanuk', delai: 'dans les vingt et un jours suivant la réception', exigence: 'les bottes ne doivent pas avoir été portées à l’extérieur et conserver leurs étiquettes', mode: 'un remboursement complet déduction faite d’un frais fixe de retour de cinq dollars' },
          { magasin: 'la boutique en ligne Saute-Mouton', delai: 'dans les trente jours ouvrables après livraison', exigence: 'les semelles intérieures et lacets doivent être parfaitement propres et complets', mode: 'un échange de pointure sans frais de livraison supplémentaires' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE CLIENTÈLE - RETOUR ET ÉCHANGE DE CHAUSSURES\nVous avez commandé une paire de chaussures chez ${s.magasin} et la pointure ne convient pas ? Voici la marche à suivre pour effectuer votre retour. D’abord, remplissez le formulaire en ligne sous l’onglet « Aide et soutien ». Cette démarche doit être entreprise ${s.delai}. Ensuite, emballez le produit en respectant notre consigne essentielle : ${s.exigence}. Insérez le bon d’expédition et remettez le paquet au transporteur. Après vérification par notre service de contrôle, vous recevrez ${s.mode}. Les articles achetés à cinquante pour cent de rabais et plus sont en vente finale, sans échange ni remboursement.`,
          questions: [
            ['Quelle politique d’achat sur Internet est explicitée dans ce document ?', 'La marche à suivre pour échanger ou retourner des chaussures en ligne', 'Le mode d’emploi pour cirer et imperméabiliser le cuir véritable', 'Le fonctionnement d’une carte-cadeau achetée en centre commercial'],
            ['Quelle exigence spécifique touche l’état des chaussures lors du renvoi ?', `${s.exigence[0].toUpperCase() + s.exigence.slice(1)}`, 'Elles doivent avoir été portées quotidiennement pendant au moins deux semaines', 'Elles doivent être renvoyées sans leur boîte d’origine ni emballage de protection'],
            ['Quelle exclusion concerne les articles vendus à très fort rabais ?', 'Ils sont en vente finale et ne peuvent être ni échangés ni remboursés', 'Ils ne peuvent être payés qu’en argent liquide au facteur', 'Ils ne sont expédiés que six mois après la confirmation de commande'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure RQAP - Demande de prestations parentales
    Object.assign(
      (rand) => {
        const slots = [
          { regime: 'le Régime québécois d’assurance parentale (RQAP)', choix: 'le choix entre le régime de base avec prestations plus longues ou le régime particulier plus généreux', piece: 'votre relevé d’emploi officiel transmis électroniquement par votre employeur', delai: 'dans les dix jours suivant la réception de votre dossier complet' },
          { regime: 'le portail officiel des prestations familiales du Québec', choix: 'la décision concertée entre parents pour le partage des semaines de congé parental', piece: 'votre numéro d’assurance sociale et la confirmation de naissance de l’état civil', delai: 'dans un délai moyen de quatorze jours ouvrables' },
          { regime: 'la plateforme gouvernementale de soutien à la maternité et paternité', choix: 'l’option de recevoir des versements réguliers sur dix-huit ou douze mois', piece: 'vos coordonnées bancaires précises pour activer le dépôt direct automatique', delai: 'sous deux semaines à compter de la transmission électronique' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ASSURANCE PARENTALE (RQAP) - GUIDE DU PARENT\nLa naissance ou l’adoption d’un enfant donne droit au remplacement d’une partie de votre salaire par ${s.regime}. Pour recevoir vos prestations sans délai, suivez ces étapes. Connectez-vous d’abord au portail gouvernemental avec votre identifiant ClicSÉQUR. Indiquez la date d’arrivée de l’enfant et choisissez votre option irréversible : ${s.choix}. Assurez-vous ensuite que ${s.piece} est bien versé à votre dossier. Enfin, confirmez vos coordonnées bancaires pour le dépôt direct. Votre premier versement monétaire sera déposé dans votre compte ${s.delai}. Tout revenu gagné pendant les congés doit être déclaré chaque semaine pour ajuster vos prestations.`,
          questions: [
            ['Quelle prestation financière gouvernementale ce guide permet-il de réclamer ?', 'Les prestations d’assurance parentale pour nouveaux parents du RQAP', 'Une rente de retraite anticipée pour travailleurs seniors', 'Une indemnisation pour accident de travail auprès de la CNESST'],
            ['Quelle décision déterminante et irréversible les parents doivent-ils choisir ?', `${s.choix[0].toUpperCase() + s.choix.slice(1)}`, 'Le choix du prénom officiel de l’enfant inscrit sur son certificat de naissance', 'La désignation formelle de trois tuteurs légaux domiciliés dans la province'],
            ['Quand le premier versement financier sera-t-il déposé dans le compte ?', `${s.delai[0].toUpperCase() + s.delai.slice(1)}`, 'Uniquement lorsque l’enfant aura atteint l’âge de six ans', 'Au bout d’une année complète de traitement administratif'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Partage des semaines de congé parental RQAP
    Object.assign(
      (rand) => {
        const slots = [
          { volet: 'les semaines partageables de congé parental entre les deux conjoints', document: 'une entente écrite commune signée par les deux parents indiquant la répartition', avertissement: 'le choix du régime de prestations ne peut plus être modifié une fois le premier versement émis' },
          { volet: 'l’octroi des quatre semaines supplémentaires de bonus pour partage équitable', document: 'la déclaration de revenus de l’année précédente de chaque conjoint', avertissement: 'toute semaine de travail rémunéré doit être inscrite dans la déclaration hebdomadaire' },
          { volet: 'la transition entre les prestations de maternité et le congé parental', document: 'l’autorisation parentale conjointe et le calendrier prévu des semaines', avertissement: 'les semaines non utilisées avant le premier anniversaire de l’enfant sont perdues' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICES QUÉBEC - FOIRE AUX QUESTIONS ASSURANCE PARENTALE\nComment organiser le partage de vos congés lors de l’arrivée d’un enfant ? Voici les règles régissant ${s.volet}. Les deux parents peuvent recevoir des prestations simultanément ou à tour de rôle selon leurs besoins. D’abord, chaque parent doit créer son propre dossier sur le portail du RQAP. Ensuite, vous devez téléverser ${s.document}. Enfin, sélectionnez le calendrier des semaines souhaitées. Attention : ${s.avertissement}. Si vous travaillez à temps partiel durant le congé, vous pouvez conserver une partie de vos gains sans réduction excessive de prestation. Notre service clientèle demeure joignable du lundi au vendredi de huit heures trente à seize heures trente.`,
          questions: [
            ['Quel aspect spécifique de l’assurance parentale est expliqué aux couples ?', 'Le fonctionnement et les règles de partage des semaines de congé parental', 'La procédure d’adoption internationale pour un enfant étranger', 'L’achat de billets d’avion subventionnés pour toute la famille'],
            ['Quelle règle contraignante ou avertissement majeur les parents doivent-ils retenir ?', `${s.avertissement[0].toUpperCase() + s.avertissement.slice(1)}`, 'Il est formellement interdit aux deux parents de se trouver ensemble', 'Les mères n’ont pas le droit de prendre plus de deux semaines au total'],
            ['Que se passe-t-il si un parent effectue du travail à temps partiel pendant son congé ?', 'Il peut conserver une partie de ses revenus selon un seuil autorisé', 'Il perd automatiquement la totalité de ses prestations parentales à vie', 'Il doit payer une pénalité financière équivalente au double de sa paie'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Retour et échange chez un détaillant d'équipement de plein air
    Object.assign(
      (rand) => {
        const slots = [
          { coop: 'la Coopérative de plein air MEC (Mountain Equipment Company)', delai: 'dans les trente jours avec preuve d’achat', exclusion: 'les articles de sécurité d’escalade et les sous-vêtements thermiques ne sont ni repris ni échangés' },
          { coop: 'les magasins de sport SAIL Plein Air', delai: 'dans un délai de trente jours civils', exclusion: 'les permis de pêche, les armes et les munitions sont exclus de tout remboursement' },
          { coop: 'le détaillant québécois La Cordée Plein Air', delai: 'dans les trente jours suivant la commande', exclusion: 'les cartes-cadeaux et les articles vendus en liquidation finale ne sont pas admissibles' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE CLIENTÈLE - POLITIQUE DE RETOUR ET SATISFACTION GARANTIE\nChez ${s.coop}, nous voulons que chaque aventure en nature se déroule avec le meilleur équipement possible. Si votre matériel ne répond pas à vos attentes, vous pouvez le retourner facilement ${s.delai}. Pour une commande Web, générez votre étiquette de retour prépayée dans votre espace membre en ligne. Les articles doivent être retournés dans un état neuf, propres, avec leurs manuels et tous les accessoires dans leur emballage d’origine. Veuillez noter que pour des motifs de sécurité et d’hygiène, ${s.exclusion}. Dès réception du colis dans notre entrepôt de distribution, nous inspecterons le matériel et émettrons un remboursement selon votre méthode de paiement initiale. Si vous préférez un échange immédiat, vous pouvez également vous présenter dans l’une de nos succursales avec votre facture électronique.`,
          questions: [
            ['Quel type de produits ce commerçant vend-il et autorise-t-il à retourner ?', 'De l’équipement technique et des vêtements de plein air et de sport', 'Des véhicules automobiles et des pièces mécaniques lourdes', 'Des produits alimentaires périssables et des viandes fraîches'],
            ['Quelle clause d’exclusion pour motifs de sécurité ou d’hygiène s’applique ?', `${s.exclusion[0].toUpperCase() + s.exclusion.slice(1)}`, 'Tous les vêtements de couleur rouge sont exclus de tout retour', 'Les achats réglés par carte bancaire ne sont jamais remboursés'],
            ['Quelle option pratique s’offre aux clients préférant un échange immédiat ?', 'Se présenter directement dans une succursale physique avec la facture', 'Envoyer une lettre manuscrite à l’ambassade de son pays d’origine', 'Attendre un an pour faire remplacer son article en entrepôt'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-5
  // Ex 0: Comprendre la déception exprimée par une citoyenne sur un réseau social concernant l’abandon d’un projet d’aménagement urbain.
  // Ex 1: Comprendre la nervosité exprimée par un ami dans un courriel concernant une entrevue d’embauche.
  'n6-reading-5': [
    // Scenario 0 (Template, Ex 0): Déception citoyenne réseau social - Annulation piste cyclable
    Object.assign(
      (rand) => {
        const slots = [
          { citoyenne: 'Mireille Gagnon', projet: 'la piste cyclable protégée sur le boulevard Saint-Laurent', consultation: 'deux ans d’ateliers participatifs et plus de mille signatures citoyennes', motif: 'des coupures budgétaires municipales décidées en catimini' },
          { citoyenne: 'Diane Bouchard', projet: 'le réaménagement piétonnier et végétalisé de la rue Saint-Denis', consultation: 'dix-huit mois de concertation avec les commerçants et résidents', motif: 'la pression de quelques commerçants opposés au retrait du stationnement' },
          { citoyenne: 'Hélène Tremblay', projet: 'la voie réservée aux autobus et cyclistes sur l’avenue du Parc', consultation: 'trois consultations publiques et un sondage officiel d’arrondissement', motif: 'un revirement politique inattendu de la mairie d’arrondissement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PUBLICATION CITOYENNE SUR UN RÉSEAU SOCIAL\nPar ${s.citoyenne} - Groupe « Citoyens engagés de notre quartier »\nJ’apprends avec une immense déception que la mairie a décidé d’annuler ${s.projet}. Je n’ai pas de mots pour exprimer ma colère. Nous avons pourtant investi ${s.consultation} pour bâtir une rue plus verte et sécuritaire pour nos enfants. Et voilà que tout est balayé sous prétexte de ${s.motif} ! Comment les élus peuvent-ils mépriser autant d’heures de mobilisation bénévole ? Nos enfants continueront de frôler des autos roulant trop vite. Je refuse de baisser les bras : venez tous au conseil d’arrondissement ce mardi pour exiger des comptes !`,
          questions: [
            ['Quel sentiment d’indignation la citoyenne exprime-t-elle sur les réseaux sociaux ?', 'Une profonde déception et de la colère suite à l’abandon d’un projet urbain', 'L’enthousiasme débordant devant l’ouverture d’un nouveau centre commercial', 'La joie d’avoir été élue conseillère municipale de son secteur'],
            ['Quel travail citoyen considérable a été ignoré selon l’auteure du message ?', `${s.consultation[0].toUpperCase() + s.consultation.slice(1)}`, 'La rénovation privée des cuisines de tous les résidents de la rue', 'La création d’un parti politique provincial pour les jeunes'],
            ['Quelle action collective concrète propose-t-elle aux membres du groupe ?', 'Se présenter au conseil d’arrondissement ce mardi pour exiger des comptes', 'Quitter définitivement la ville pour déménager en banlieue éloignée', 'Refuser de payer ses impôts fonciers pendant les cinq prochaines années'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Déception citoyenne réseau social - Abandon d'un parc de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { auteur: 'Marc-André Lavoie', espace: 'l’aménagement d’un grand parc public avec jardins partagés sur l’ancien terrain vague de la rue Bellechasse', promoteur: 'la vente du terrain à un promoteur pour ériger deux tours de condos de luxe', promesse: 'la promesse électorale répétée par la mairesse de préserver un îlot de fraîcheur' },
          { auteur: 'Patrick Simard', espace: 'la transformation de l’ancien dépôt municipal en parc nature boisé avec jeux d’eau pour enfants', promoteur: 'la construction d’un stationnement étagé payant et de bureaux administratifs', promesse: 'l’engagement formel des élus d’augmenter la canopée urbaine dans notre quartier' },
          { auteur: 'Vincent Roy', espace: 'la création d’une place publique animée avec forêt urbaine et marché fermier local', promoteur: 'la cession du lot pour agrandir un entrepôt de distribution commerciale', promesse: 'le vote unanime du comité de quartier en faveur d’une zone verte communautaire' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `TRIBUNE LIBRE DU QUARTIER - DÉCEPTION AMÈRE FACE AU BÉTON\nPar ${s.auteur}\nQuelle tristesse de constater que le béton l’emporte encore sur notre quartier ! La ville vient de confirmer l’abandon du projet pour ${s.espace}. À la place de cet îlot de fraîcheur, les autorités ont approuvé ${s.promoteur}. Qu’est-il advenu de ${s.promesse} ? Notre secteur étouffe durant les canicules et nos enfants manquent d’arbres pour jouer. Je me sens profondément trahi comme citoyen payeur de taxes. Partagez massivement ce statut pour dénoncer cette décision inacceptable de notre administration municipale !`,
          questions: [
            ['Quelle décision municipale dénoncée avec amertume indigne le résident ?', 'L’abandon d’un grand parc vert au profit d’un projet immobilier de béton', 'La démolition complète de l’école primaire historique du quartier', 'La fermeture de la piscine municipale durant la période de canicule'],
            ['Quel aménagement remplacera l’espace vert initialement promis par les élus ?', `${s.promoteur[0].toUpperCase() + s.promoteur.slice(1)}`, 'Un sanctuaire sauvage pour oiseaux migrateurs en péril', 'Un jardin botanique gratuit ouvert à tous les chercheurs universitaires'],
            ['Quel problème de santé publique et de confort urbain le citoyen souligne-t-il ?', 'Le manque d’îlots de fraîcheur pendant les canicules pour les enfants', 'L’absence de commerces de vêtements haut de gamme dans le secteur', 'Le manque de places de stationnement gratuit pour les touristes étrangers'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Nervosité courriel d'un ami avant une entrevue d'embauche
    Object.assign(
      (rand) => {
        const slots = [
          { ami: 'Éric', poste: 'de directeur adjoint des communications dans un grand ministère québécois', jury: 'un comité de quatre évaluateurs chevronnés avec une mise en situation minutée', peur: 'de bafouiller, d’avoir un trou de mémoire ou de mal gérer mon stress en anglais' },
          { ami: 'Maxime', poste: 'de chef d’équipe logistique dans une entreprise multinationale de transport', jury: 'un jury de trois cadres supérieurs avec des questions comportementales pointues', peur: 'de perdre mes moyens face aux questions pièges sur la gestion de crise' },
          { ami: 'Guillaume', poste: 'de conseiller principal en politiques publiques auprès de la ville', jury: 'une commission d’experts externes qui évaluera ma présentation orale de quinze minutes', peur: 'de dépasser le temps limite et d’oublier les chiffres clés de mon dossier' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL PERSONNEL - BESOIN DE TES ENCOURAGEMENTS\nDe : ${s.ami} Lemieux\nÀ : Martin Tremblay\nObjet : Panique avant mon entrevue de demain !\nSalut Martin,\nJe t’écris parce que j’ai l’estomac noué et je n’arrive plus à dormir. Demain à neuf heures, je passe mon entrevue décisive pour le poste ${s.poste}. C’est la chance dont je rêve depuis des années, mais la pression est immense : je serai devant ${s.jury}. Bien que j’aie révisé mes dossiers, j’ai une angoisse folle ${s.peur}. Le syndrome de l’imposteur me paralyse complètement. Aurais-tu cinq minutes pour me faire répéter au téléphone ou me donner des conseils de respiration ? Ton aide me ferait un bien immense. Merci d’être là pour moi !`,
          questions: [
            ['Quel état émotionnel l’expéditeur confie-t-il à son ami dans ce message intime ?', 'Une intense nervosité et de l’anxiété à la veille d’un entretien décisif', 'La joie d’avoir déjà signé son nouveau contrat d’embauche avec prime', 'L’ennui ressenti dans son poste actuel sans aucune perspective d’avenir'],
            ['Quelle modalité de sélection particulièrement exigeante redoute-t-il ?', `La présence de ${s.jury}`, 'Un examen physique militaire sur une piste d’obstacles dans la boue', 'Un test médical complet avec prélèvement d’échantillons sanguins'],
            ['Quelle demande d’aide concrète formule-t-il à son ami pour surmonter son stress ?', 'Une courte répétition téléphonique et des conseils de respiration', 'Qu’il vienne passer l’entretien à sa place en se faisant passer pour lui', 'Qu’il lui prête une importante somme d’argent pour annuler l’entrevue'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Courriel amical - Anxiété avant une audition ou entrevue d'admission
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Sandrine', epreuve: 'l’audition finale d’admission au Conservatoire d’art dramatique de Montréal', exigence: 'interpréter deux monologues classiques devant un jury de metteurs en scène renommés', symptome: 'les mains qui tremblent, la gorge sèche et l’impression d’avoir tout oublié' },
          { amie: 'Laurence', epreuve: 'l’entrevue d’admission pour la maîtrise contingentée en psychologie clinique', exigence: 'analyser un cas clinique complexe sans préparation préalable en trente minutes', symptome: 'des palpitations cardiaques et une insomnie tenace depuis trois jours' },
          { amie: 'Audrey', epreuve: 'l’examen oral final du barreau du Québec pour devenir avocate', exigence: 'plaider une cause simulée devant un collège de trois juges très sévères', symptome: 'des maux de ventre paralysants et la peur panique de perdre mes moyens' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL AMICAL - SOS STRESS AVANT MON ÉPREUVE\nDe : ${s.amie} Bouchard\nÀ : Julie Fortin\nObjet : Je stresse pour mon épreuve de demain !\nMa chère Julie,\nL’angoisse m’empêche totalement de dormir. Demain après-midi, c’est le moment fatidique : je passe ${s.epreuve}. Toute mon année d’efforts se joue sur cette seule rencontre. L’exigence est redoutable car je dois ${s.exigence}. Bien que mes professeurs me disent prête, je ressens ${s.symptome}. La peur de décevoir mes proches me serre le cœur, même si je dramatise probablement. Envoie-moi tes meilleures ondes positives demain à quatorze heures, j’en aurai grand besoin ! Grosses bises, ${s.amie}`,
          questions: [
            ['Quelle épreuve capitale déclenche l’anxiété extrême de l’auteure du message ?', `${s.epreuve[0].toUpperCase() + s.epreuve.slice(1)}`, 'Une compétition de natation synchronisée sans aucun public', 'Un simple examen de routine pour renouveler sa carte d’assurance maladie'],
            ['Quelle tâche d’évaluation difficile doit-elle accomplir devant le jury ?', `${s.exigence[0].toUpperCase() + s.exigence.slice(1)}`, 'Nettoyer la salle d’examen et ranger toutes les chaises après l’épreuve', 'Cuisiner un repas gastronomique pour l’ensemble des membres du comité'],
            ['Quelle manifestation physique de stress l’amie ressent-elle intensément ?', `${s.symptome[0].toUpperCase() + s.symptome.slice(1)}`, 'Une faim insatiable qui la pousse à manger sans arrêt toute la nuit', 'Une énergie débordante qui lui donne envie de danser dans la rue'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Déception citoyenne réseau social - Fermeture bibliothèque
    Object.assign(
      (rand) => {
        const slots = [
          { citoyen: 'Jean-François Tremblay', lieu: 'de la bibliothèque de quartier Saint-Charles', public: 'les personnes âgées du secteur qui venaient lire le journal et briser leur solitude', repli: 'un pavillon municipal vétuste sans transport en commun accessible' },
          { citoyen: 'Simon Pelletier', lieu: 'du centre communautaire et récréatif des jeunes', public: 'les adolescents qui profitaient de l’aide aux devoirs et des ateliers d’art', repli: 'un sous-sol sombre d’église situé à trois kilomètres de distance' },
          { citoyen: 'David Simard', lieu: 'de la piscine municipale intérieure de notre arrondissement', public: 'les familles avec jeunes enfants et les aînés suivant des cours d’aquagym', repli: 'un complexe sportif privé payant hors de prix pour les citoyens' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉSEAU SOCIAL DE QUARTIER - CRI DU CŒUR\nPar ${s.citoyen}\nC’est avec amertume que je partage cette nouvelle : la municipalité a entériné la fermeture définitive ${s.lieu} à la fin du mois. Cet endroit constituait le poumon social de notre quartier depuis quarante ans. Je pense avec tristesse à ${s.public}, qui perdront un repère précieux et gratuit. La mairie prétend relocaliser les services vers ${s.repli}, mais cette solution pénalise d’abord les plus vulnérables. Comment peut-on sacrifier nos services de proximité essentiels ? J’appelle les résidents à signer notre pétition en ligne pour faire reculer les élus avant qu’il ne soit trop tard !`,
          questions: [
            ['Quelle mesure municipale impopulaire suscite l’indignation du citoyen ?', `La fermeture définitive ${s.lieu}`, 'La hausse des tarifs de billets de spectacle pour les touristes', 'L’interdiction de circuler en voiture durant les fins de semaine'],
            ['Quelle population vulnérable sera particulièrement touchée par cette perte ?', `${s.public[0].toUpperCase() + s.public.slice(1)}`, 'Les athlètes professionnels participant à des tournois nationaux', 'Les promoteurs immobiliers cherchant des terrains commerciaux'],
            ['Quel moyen d’action citoyen l’auteur propose-t-il pour faire reculer la mairie ?', 'Signer une pétition en ligne initiée par les comités de citoyens', 'Boycotter l’ensemble des transports en commun de la province', 'Attaquer en justice les autres résidents qui ne sont pas d’accord'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],
}
