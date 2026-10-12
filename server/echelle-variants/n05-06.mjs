// Échelle québécoise scenarios for Niveau 5 and Niveau 6 indicators.
// Covers both official situations types (examples) for every listening and reading indicator.
// NOTE: All persons depicted in these scenarios are entirely fictional.
// Real institutions, places, media and public programs are referenced solely to reflect authentic Quebec everyday life.
// Yields >= 12 distinct texts per indicator across random seeds.
// N5 bounds: 70–110 words (±15% = 60–126 words).
// N6 bounds: 90–140 words (±15% = 77–161 words).

export function makeQuestion(prompt, ans, dist1, dist2, evidence) {
  const row = [prompt, ans, dist1, dist2]
  row.evidence = Array.isArray(evidence) ? evidence : [evidence]
  return row
}

const H_ASPIRE_SET = new Set([
  'haut', 'haute', 'hautes', 'hauteur', 'hausse', 'homard', 'hockey',
  'halte', 'harcèlement', 'hors', 'huit', 'onze', 'héroïque', 'hérisson',
  'harpon', 'harpons'
])

export function isElidable(word) {
  if (!word) return false
  const clean = word.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const first = clean.split(/[^a-z0-9]/)[0]
  if (H_ASPIRE_SET.has(first) || first === 'huit' || first === 'onze' || first.startsWith('y')) return false
  if (/^[aeiou]/.test(first)) return true
  if (/^h[aeiou]/.test(first)) return true
  return false
}

export function de(word) {
  if (!word) return 'de'
  return isElidable(word) ? `d’${word}` : `de ${word}`
}

export function que(word) {
  if (!word) return 'que'
  return isElidable(word) ? `qu’${word}` : `que ${word}`
}

export function lorsque(word) {
  if (!word) return 'lorsque'
  return isElidable(word) ? `lorsqu’${word}` : `lorsque ${word}`
}

export function puisque(word) {
  if (!word) return 'puisque'
  return isElidable(word) ? `puisqu’${word}` : `puisque ${word}`
}

export function jusque(word) {
  if (!word) return 'jusque'
  return isElidable(word) ? `jusqu’${word}` : `jusque ${word}`
}

export function cap(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const SLOT_NOUN_METADATA = [
  { noun: 'respect', gender: 'm' },
  { noun: 'personne', gender: 'f' },
  { noun: 'règle', gender: 'f' },
  { noun: 'horaire', gender: 'm' },
  { noun: 'formulaire', gender: 'm' },
  { noun: 'béluga', gender: 'm' },
  { noun: 'baleine', gender: 'f' },
  { noun: 'boutique', gender: 'f' },
  { noun: 'commerce', gender: 'm' },
  { noun: 'magasin', gender: 'm' },
  { noun: 'chapelle', gender: 'f' },
  { noun: 'municipalité', gender: 'f' },
  { noun: 'village', gender: 'm' },
  { noun: 'commune', gender: 'f' },
  { noun: 'domaine', gender: 'm' },
  { noun: 'gare', gender: 'f' },
  { noun: 'auberge', gender: 'f' },
  { noun: 'gîte', gender: 'm' },
  { noun: 'navette', gender: 'f' },
  { noun: 'autobus', gender: 'm' },
  { noun: 'piste', gender: 'f' },
  { noun: 'sentier', gender: 'm' },
  { noun: 'concours', gender: 'm' },
  { noun: 'compétition', gender: 'f' },
  { noun: 'tournoi', gender: 'm' },
  { noun: 'épreuve', gender: 'f' },
  { noun: 'course', gender: 'f' },
  { noun: 'dégustation', gender: 'f' },
  { noun: 'galette', gender: 'f' },
  { noun: 'biscuit', gender: 'm' },
  { noun: 'tarte', gender: 'f' },
  { noun: 'urgence', gender: 'f' },
  { noun: 'démarche', gender: 'f' },
  { noun: 'rendez-vous', gender: 'm' },
  { noun: 'imprimante', gender: 'f' },
  { noun: 'ordinateur', gender: 'm' },
  { noun: 'portail', gender: 'm' },
  { noun: 'réseau', gender: 'm' },
  { noun: 'courriel', gender: 'm' },
  { noun: 'notification', gender: 'f' },
  { noun: 'confirmation', gender: 'f' },
  { noun: 'attestation', gender: 'f' },
  { noun: 'certificat', gender: 'm' },
  { noun: 'reçu', gender: 'm' },
  { noun: 'facture', gender: 'f' },
  { noun: 'prime', gender: 'f' },
  { noun: 'salaire', gender: 'm' },
  { noun: 'dédommagement', gender: 'm' },
  { noun: 'indemnité', gender: 'f' },
  { noun: 'allocation', gender: 'f' },
  { noun: 'bourse', gender: 'f' },
  { noun: 'aide', gender: 'f' },
  { noun: 'subvention', gender: 'f' },
  { noun: 'fresque', gender: 'f' },
  { noun: 'symphonie', gender: 'f' },
  { noun: 'exposition', gender: 'f' },
  { noun: 'conférence', gender: 'f' },
  { noun: 'présentation', gender: 'f' },
  { noun: 'atelier', gender: 'm' },
  { noun: 'stage', gender: 'm' },
  { noun: 'séance', gender: 'f' },
  { noun: 'formation', gender: 'f' },
  { noun: 'cours', gender: 'm' },
  { noun: 'programme', gender: 'm' },
  { noun: 'projet', gender: 'm' },
  { noun: 'dossier', gender: 'm' },
  { noun: 'demande', gender: 'f' },
  { noun: 'requête', gender: 'f' },
  { noun: 'plainte', gender: 'f' },
  { noun: 'réclamation', gender: 'f' },
  { noun: 'entente', gender: 'f' },
  { noun: 'contrat', gender: 'm' },
  { noun: 'convention', gender: 'f' },
  { noun: 'accord', gender: 'm' },
  { noun: 'régime', gender: 'm' },
  { noun: 'assurance', gender: 'f' },
  { noun: 'protection', gender: 'f' },
  { noun: 'couverture', gender: 'f' },
  { noun: 'option', gender: 'f' },
  { noun: 'choix', gender: 'm' },
  { noun: 'mesure', gender: 'f' },
  { noun: 'disposition', gender: 'f' },
  { noun: 'consigne', gender: 'f' },
  { noun: 'directive', gender: 'f' },
  { noun: 'instruction', gender: 'f' },
  { noun: 'recommandation', gender: 'f' },
]

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
          { lieu: 'dans la ruelle verte', repli: 'au centre communautaire', horaire: 'dix heures', plat: 'un plat cuisiné', lieuPara: 'au sein de la ruelle verte', repliPara: 'vers les salles du centre communautaire', lieuKw: 'ruelle verte', repliKw: 'centre communautaire' },
          { lieu: 'au parc Laurier', repli: 'dans le gymnase de l’école', horaire: 'onze heures', plat: 'une salade fraîche', lieuPara: 'directement au parc Laurier', repliPara: 'vers le gymnase de l’école voisine', lieuKw: 'parc laurier', repliKw: 'gymnase' },
          { lieu: 'sur la place publique', repli: 'dans la salle paroissiale', horaire: 'dix heures et demie', plat: 'un dessert maison', lieuPara: 'directement sur la place publique', repliPara: 'vers les locaux de la paroisse', lieuKw: 'place publique', repliKw: 'salle paroissiale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour ! Est-ce que tu as vu l’affiche pour la fête de quartier de samedi ? Tout le monde se rassemble ${s.lieu} dès ${s.horaire} du matin. Il y aura des jeux gonflables pour les enfants et un dîner partagé le midi. Chaque famille apporte ${s.plat} à partager avec les voisins. Les organisateurs prévoient aussi des ateliers d’artisanat et des musiciens locaux tout l’après-midi. S’il commence à pleuvoir, nous irons tous ${s.repli} juste à côté. J’espère vraiment que tu viendras avec nous !`,
          questions: [
            makeQuestion('Quel est le sujet principal de cette conversation ?', 'L’organisation festive d’un grand rassemblement de quartier', 'La planification d’un concert de musique locale', 'La préparation du grand dîner communautaire de midi', ['fête', 'quartier']),
            makeQuestion('Où les participants doivent-ils se rassembler le matin ?', `Ils se réunissent ${s.lieuPara}`, 'Ils se rejoignent devant l’école du quartier', 'Ils se retrouvent à la bibliothèque municipale', [s.lieuKw]),
            makeQuestion('Que feront les personnes présentes en cas de mauvais temps ?', `Elles iront ${s.repliPara}`, 'Elles annuleront le repas partagé entre résidents', 'Elles termineront plus tôt les ateliers d’artisanat', [s.repliKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Voisine invitant au barbecue des voisins
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Madame Tremblay', activite: 'un concours de tartes aux pommes', heure: 'midi', actPara: 'un concours culinaire de tartes aux pommes', actKw: 'pommes' },
          { nom: 'Madame Bouchard', activite: 'un tournoi amical de pétanque', heure: 'midi et quart', actPara: 'une compétition récréative de pétanque', actKw: 'pétanque' },
          { nom: 'Madame Roy', activite: 'une dégustation de produits régionaux', heure: 'midi et demi', actPara: 'une dégustation de spécialités locales', actKw: 'dégustation' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Marc ! ${s.nom} m’a parlé des activités prévues pour notre journée des voisins ce dimanche. Dès neuf heures, les bénévoles installeront les tables et les chaises sur la rue piétonne. Ensuite, vers ${s.heure}, il y aura un grand repas communautaire et ${s.activite}. Les enfants pourront participer à une chasse aux trésors dans les jardins partagés. En cas d’averse, le comité louera la grande tente municipale pour abriter tout le monde. N’oublie pas d’apporter tes verres réutilisables pour éviter les déchets !`,
          questions: [
            makeQuestion('De quel événement les deux personnes parlent-elles ?', 'Des festivités conviviales organisées par les voisins', 'D’une corvée d’aménagement dans les jardins partagés', 'D’une foire sportive animée par des bénévoles', ['voisins', 'activités']),
            makeQuestion('Quelle animation particulière est organisée vers le dîner ?', `${cap(s.actPara)}`, 'Une course de sacs dans le parc municipal', 'L’installation collective des tables et chaises', [s.actKw]),
            makeQuestion('Que demande-t-on d’apporter pour limiter les déchets ?', 'Fournir ses propres verres pour limiter les rebuts', 'Fournir ses propres chaises pour la rue piétonne', 'Nettoyer les tables installées sur la rue piétonne', ['verres', 'déchets']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Téléjournal - Championnat de patinage de vitesse
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Québec', pays: 'douze pays', epreuve: 'du cinq cents mètres', athlete: 'Camille Bédard', epPara: 'la course de vitesse sur courte distance', epKw: 'cinq cents mètres' },
          { ville: 'à Montréal', pays: 'quinze pays', epreuve: 'du mille mètres', athlete: 'Mélanie Tremblay', epPara: 'la compétition sur glace du mille mètres', epKw: 'mille mètres' },
          { ville: 'à Sherbrooke', pays: 'dix pays', epreuve: 'du relais mixte', athlete: 'Audrey Beaulieu', epPara: 'la compétition par équipes du relais mixte', epKw: 'relais mixte' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Ici Radio-Canada au téléjournal de dix-huit heures. Les Championnats internationaux de patinage de vitesse sur courte piste s’ouvrent officiellement ce soir ${s.ville}. Plus de cent cinquante patineurs représentant ${s.pays} sont arrivés cette semaine pour s’entraîner sur la glace québécoise. L’épreuve très attendue ${s.epreuve} se déroulera samedi après-midi devant une foule nombreuse. Les entraîneurs soulignent l’excellente forme des athlètes d’ici, dont ${s.athlete}, qui espèrent remporter plusieurs médailles d’or. La finale sera diffusée en direct sur nos plateformes dès quatorze heures. Les billets pour les gradins sont presque tous vendus.`,
          questions: [
            makeQuestion('Quelle est l’information principale donnée dans ce bulletin ?', 'L’ouverture d’une compétition sur glace internationale', 'La vente aux enchères d’anciens maillots de hockey', 'La clôture d’une compétition sur glace internationale', ['patinage', 'championnats']),
            makeQuestion('Quelle course très attendue se déroulera samedi après-midi ?', `${cap(s.epPara)}`, 'La séance d’entraînement sur la glace québécoise', 'La course de fond prévue dimanche matin', [s.epKw]),
            makeQuestion('Que pourront faire les amateurs de sport samedi dès quatorze heures ?', 'Regarder la ronde finale en diffusion directe', 'Participer à une collecte de dons pour les athlètes', 'Rencontrer les entraîneurs lors d’un entraînement', ['finale', 'direct']),
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
          text: `Au téléjournal sportif, la Coupe du monde de ski de fond débute ${s.jour} ${s.site}. Les organisateurs confirment ${s.conditions} malgré le redoux du début de semaine. Plus de deux cents compétiteurs étrangers participent aux épreuves individuelles et par équipe. L’équipe canadienne mise particulièrement sur ses jeunes recrues pour monter sur le podium lors du sprint classique. Les spectateurs sont invités à utiliser les navettes gratuites mises en place depuis le centre-ville afin de limiter les embouteillages routiers. Les premières courses commenceront en début de matinée demain.`,
          questions: [
            makeQuestion('Quel événement sportif fait l’objet de ce reportage ?', 'Une coupe du monde réunissant des fondeurs', 'Un entraînement de ski réservé aux recrues', 'Un slalom de ski alpin réservé aux juniors', ['ski', 'coupe du monde']),
            makeQuestion('Quel moyen de transport conseille-t-on aux spectateurs ?', 'Les autobus gratuits affrétés depuis la ville', 'Leur véhicule personnel pour rejoindre les pistes', 'Des navettes payantes vendues à l’entrée des pistes', ['navettes', 'gratuites']),
            makeQuestion('Quand auront lieu les premières courses officielles ?', 'En tout début de matinée au cours du lendemain', 'En début d’après-midi après le redoux annoncé', 'En milieu de semaine prochaine en soirée', ['début', 'matinée']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Voisine parlant de la vente de garage et kermesse de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { rue: 'la rue Saint-Joseph', cause: 'la maison des jeunes', heure: 'huit heures', orgPara: 'au centre pour adolescents', orgKw: 'jeunes' },
          { rue: 'la rue Bellechasse', cause: 'le refuge pour animaux', heure: 'huit heures et demie', orgPara: 'à un organisme animalier', orgKw: 'animaux' },
          { rue: 'l’avenue Mont-Royal', cause: 'la banque alimentaire', heure: 'neuf heures', orgPara: 'au service d’aide alimentaire', orgKw: 'alimentaire' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Julie ! Je voulais te rappeler que notre journée de solidarité entre voisins se tiendra samedi sur ${s.rue}. Les familles installeront leurs kiosques dès ${s.heure} pour la vente d’objets usagés et de livres pour enfants. Tous les profits de la cantine iront directement soutenir ${s.cause}. Les commerçants du secteur offriront aussi du café chaud et des viennoiseries aux bénévoles. S’il pleut trop fort, l’événement sera remis au dimanche suivant à la même heure. Tu penses venir faire un tour avec les petits ?`,
          questions: [
            makeQuestion('Quel est le but premier de ce rassemblement de quartier ?', 'Une fête solidaire avec vente d’articles usagés', 'Une collecte de livres usagés pour enfants', 'Une rencontre d’accueil pour de nouveaux commerçants', ['vente', 'voisins']),
            makeQuestion('À quel organisme seront versés les bénéfices de la cantine ?', `Directement ${s.orgPara}`, 'À l’association des commerçants du secteur', 'Au comité de bénévoles du quartier', [s.orgKw]),
            makeQuestion('Quelle décision sera prise s’il pleut trop fort samedi ?', 'Reporter l’ensemble des activités au lendemain', 'Annuler définitivement la vente de solidarité', 'Installer les kiosques chez les commerçants', ['dimanche', 'remis']),
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
          { titre: 'd’adjoint administratif', ville: 'à Laval', flex: 'deux jours de télétravail par semaine', avantage: 'une assurance collective complète', avPara: 'une couverture d’assurance collective complète', flexDist: 'du télétravail complet pour toute la semaine', avKw: 'assurance collective' },
          { titre: 'de commis de bureau', ville: 'à Longueuil', flex: 'trois jours de télétravail par semaine', avantage: 'un régime de retraite avantageux', avPara: 'un programme d’épargne pour la retraite avantageux', flexDist: 'du télétravail complet pour toute la semaine', avKw: 'retraite' },
          { titre: 'de coordonnateur de projets', ville: 'à Montréal', flex: 'un horaire flexible', avantage: 'quatre semaines de vacances payées', avPara: 'quatre semaines de congés payés dès l’entrée en poste', flexDist: 'un horaire allégé de travail à mi-temps', avKw: 'vacances payées' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Patrick ! Tu cherchais un emploi stable ces temps-ci ? Notre firme de génie ${s.ville} recrute justement un poste ${s.titre}. La personne choisie devra répondre aux appels des clients, classer les dossiers techniques et coordonner les réunions hebdomadaires. On offre ${s.flex} et ${s.avantage} dès l’embauche. L’ambiance dans l’équipe est vraiment chaleureuse et dynamique. Si le poste t’intéresse, tu devrais m’envoyer ton curriculum vitæ avant vendredi midi. Je pourrai le transmettre directement à notre gestionnaire des ressources humaines !`,
          questions: [
            makeQuestion('Que propose l’ami dans cette conversation ?', 'Un emploi administratif stable dans son entreprise', 'Un poste de comptable dans une grande firme de génie', 'Un contrat temporaire de classement de dossiers', ['firme', 'recrute']),
            makeQuestion('Quel avantage lié au poste est expressément mentionné ?', `${cap(s.avPara)}`, `${cap(s.flexDist)}`, 'Des réunions hebdomadaires supprimées dès l’embauche', [s.avKw]),
            makeQuestion('Que doit faire la personne intéressée avant vendredi midi ?', 'Transmettre sa candidature professionnelle à son ami', 'Joindre directement le responsable des ressources humaines', 'Attendre le lundi suivant pour envoyer son curriculum vitæ', ['curriculum vitæ', 'vendredi']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Poste en service à la clientèle
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'dans une coopérative financière', logiciel: 'notre logiciel interne', min: 'au moins un an d’expérience', reqPara: 'une année préalable d’expérience pertinente', reqKw: 'expérience' },
          { secteur: 'dans une clinique médicale privée', logiciel: 'le portail de gestion des rendez-vous', min: 'un diplôme d’études collégiales', reqPara: 'un diplôme d’études collégiales complété', reqKw: 'collégiales' },
          { secteur: 'dans un centre de distribution', logiciel: 'le système de suivi des commandes', min: 'une excellente maîtrise du français', reqPara: 'une excellente aisance en français à l’écrit', reqKw: 'français' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Sophie ! Je t’appelle parce qu’il y a une belle ouverture de poste ${s.secteur} où je travaille depuis deux ans. Il s’agit d’un emploi à temps plein de représentant au service aux membres. Le travail consiste principalement à répondre aux courriels, traiter les réclamations et utiliser ${s.logiciel}. La direction demande ${s.min}, mais ils offrent deux semaines de formation payée pour les nouveaux arrivants. Le salaire de départ est très compétitif. Dis-moi si tu veux que je dépose ta candidature aujourd’hui !`,
          questions: [
            makeQuestion('Quel type d’emploi est décrit par la collègue ?', 'Un poste au service aux membres à temps plein', 'Un poste de formateur pour les nouveaux arrivants', 'Un rôle de caissier à temps partiel', ['service aux membres', 'plein']),
            makeQuestion('Quelle exigence de l’employeur est précisée ?', `${cap(s.reqPara)}`, 'Deux années d’expérience au sein de l’équipe', 'Une formation préalable de deux semaines non payée', [s.reqKw]),
            makeQuestion('Que propose l’amie à la fin de l’appel ?', 'Déposer la candidature de son interlocutrice', 'Lui donner elle-même deux semaines de formation', 'Lui conseiller de postuler ailleurs cette semaine', ['candidature', 'dépose']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Téléjournal - Inondation printanière rivière des Prairies
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'de Laval-Ouest', maisons: 'plus de cinquante maisons', refuge: 'dans l’aréna municipal', refPara: 'au sein de l’aréna municipal', refKw: 'aréna' },
          { secteur: 'de Pierrefonds', maisons: 'près de quarante résidences', refuge: 'au centre récréatif local', refPara: 'dans un centre récréatif local', refKw: 'récréatif' },
          { secteur: 'de Sainte-Marthe-sur-le-Lac', maisons: 'une soixantaine de logements', refuge: 'dans l’école secondaire', refPara: 'dans les locaux d’une école secondaire', refKw: 'secondaire' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Au téléjournal de vingt heures, la crue printanière continue de causer de lourds dégâts dans le secteur ${s.secteur}. La rivière est sortie de son lit cet après-midi, inondant les rues riveraines et ${s.maisons}. Les équipes de la sécurité civile et des dizaines de bénévoles ont installé des milliers de sacs de sable le long des berges. Plusieurs familles ont dû être évacuées d’urgence en bateau à moteur et sont actuellement hébergées ${s.refuge}. Les autorités municipales demandent aux automobilistes d’éviter complètement le secteur pour faciliter le travail des premiers répondants.`,
          questions: [
            makeQuestion('Quel phénomène climatique est décrit dans ce reportage ?', 'Une inondation majeure causée par une crue de printemps', 'Une sécheresse prolongée qui a asséché les berges du secteur', 'Un incendie de forêt qui a gagné les berges', ['crue', 'inondant']),
            makeQuestion('Où les familles évacuées sont-elles accueillies pour la nuit ?', `Elles sont hébergées ${s.refPara}`, 'Elles passent la nuit à bord des bateaux de secours', 'Elles ont préféré rester chez elles, loin de la rivière en crue', [s.refKw]),
            makeQuestion('Quelle consigne les autorités donnent-elles aux automobilistes ?', 'Éviter totalement de circuler dans le quartier touché', 'Venir aider les équipes de secours à empiler le sable', 'Conduire les familles évacuées vers les lieux de refuge', ['éviter', 'automobilistes']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Téléjournal - Inondation Beauce rivière Chaudière
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Saint-Georges', commerces: 'une trentaine de commerces', hauteur: 'un mètre d’eau', hautPara: 'un niveau d’eau atteignant près d’un mètre', hautKw: 'mètre' },
          { ville: 'à Sainte-Marie', commerces: 'une vingtaine de magasins', hauteur: 'quatre-vingts centimètres d’eau', hautPara: 'une crue de quatre-vingts centimètres d’eau', hautKw: 'quatre-vingts' },
          { ville: 'à Beauceville', commerces: 'une quarantaine d’établissements', hauteur: 'plus d’un mètre d’eau', hautPara: 'une nappe d’eau dépassant largement un mètre', hautKw: 'mètre' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `En Beauce, la situation demeure critique ${s.ville} en raison de la débâcle hâtive de la rivière Chaudière. D’immenses blocs de glace ont formé un embâcle majeur sous les ponts routiers, refoulant les eaux vers le centre-ville. Les sous-sols sont inondés et ${s.commerces} du boulevard principal ont été envahis par ${s.hauteur}. Les pannes d’électricité préventives touchent actuellement deux mille clients pour éviter tout risque d’incendie. La Croix-Rouge a ouvert un bureau temporaire pour distribuer des repas chauds et des couvertures aux sinistrés évacués depuis ce matin.`,
          questions: [
            makeQuestion('Quelle est la cause principale de cette inondation soudaine ?', 'Un blocage d’imposants blocs de glace sous les ponts', 'Une coupure d’électricité préventive touchant deux mille clients', 'Une débâcle tardive, en plein mois de juin', ['embâcle', 'glace']),
            makeQuestion('Quelle conséquence directe touche les commerces du secteur ?', `Leur rez-de-chaussée a subi ${s.hautPara}`, 'Leurs sous-sols ont subi un incendie causé par l’électricité', 'Leur rez-de-chaussée a été épargné par l’eau pendant toute la durée de la crue', [s.hautKw]),
            makeQuestion('Quelle mesure d’aide la Croix-Rouge a-t-elle mise en place ?', 'Un centre distribuant des couvertures et des repas chauds', 'Un bureau pour vendre des assurances aux sinistrés', 'Une équipe chargée de nettoyer le boulevard principal du secteur', ['couvertures', 'repas']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Poste de technicien en informatique dans un cégep
    Object.assign(
      (rand) => {
        const slots = [
          { cegep: 'au Cégep du Vieux Montréal', taches: 'l’installation des logiciels d’enseignement', horaire: 'trente-cinq heures par semaine', tacPara: 'la mise en place de programmes informatiques pédagogiques', tacKw: 'logiciels' },
          { cegep: 'au Cégep de Sainte-Foy', taches: 'la maintenance des laboratoires informatiques', horaire: 'trente-deux heures par semaine', tacPara: 'l’entretien technique des salles d’ordinateurs des étudiants', tacKw: 'laboratoires' },
          { cegep: 'au Collège Ahuntsic', taches: 'le soutien technique des étudiants et professeurs', horaire: 'trente-cinq heures par semaine', tacPara: 'l’assistance informatique aux usagers du milieu collégial', tacKw: 'soutien' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Éric, écoute ça ! Mon département ${s.cegep} vient d’afficher un poste permanent de technicien en soutien informatique. C’est un horaire régulier de ${s.horaire}, du lundi au vendredi. Tes tâches consisteraient à assurer ${s.taches} et configurer les nouveaux équipements réseau. Comme tu as déjà une bonne expérience dans ce domaine, tu as d’excellentes chances. En plus, les conditions de travail dans le réseau public sont superbes : fonds de pension, vacances d’été et journées de maladie payées. Pense à soumettre ton dossier sur le portail d’emploi !`,
          questions: [
            makeQuestion('De quel emploi l’intervenant fait-il la description ?', 'Technicien en soutien informatique en milieu collégial', 'Professeur régulier d’informatique au sein du cégep', 'Technicien en génie civil au sein d’un bureau d’ingénieurs', ['technicien', 'informatique']),
            makeQuestion('Quelle est l’une des responsabilités principales mentionnées ?', `${cap(s.tacPara)}`, 'La gestion des dossiers de maladie et du fonds de pension', 'La vente d’équipements réseau aux étudiants et aux professeurs', [s.tacKw]),
            makeQuestion('Où l’ami doit-il envoyer son dossier pour postuler ?', 'Directement par le portail de recrutement du cégep', 'Par courriel personnel à l’adresse de son département', 'Par la poste, au secrétariat du département', ['portail', 'dossier']),
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
          { pays: 'au Pérou', duree: 'trois semaines', defi: 'de l’altitude dans les montagnes des Andes', activite: 'la visite de villages traditionnels', defPara: 'l’adaptation éprouvante à l’altitude des Andes', defKw: 'altitude' },
          { pays: 'au Costa Rica', duree: 'deux semaines', defi: 'de la chaleur humide dans la jungle tropicale', activite: 'l’observation des animaux sauvages', defPara: 'le climat lourd et humide de la forêt tropicale', defKw: 'chaleur' },
          { pays: 'en Colombie', duree: 'trois semaines', defi: 'des longs trajets sur les routes de montagne', activite: 'la découverte de plantations de café', defPara: 'les déplacements fatigants sur les routes sinueuses', defKw: 'trajets' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Jean ! Je reviens tout juste de mon voyage de ${s.duree} ${s.pays}. C’était une expérience absolument inoubliable ! Ce qui m’a le plus marquée, c’est ${s.activite} et l’immense gentillesse des gens locaux. Par contre, le début du séjour a été un peu difficile à cause ${s.defi}. Les premiers jours, j’étais épuisée et j’avais du mal à marcher longtemps. Heureusement, en buvant beaucoup d’eau et en me reposant l’après-midi, j’ai vite retrouvé mon énergie. Je te montrerai mes photos pendant notre pause de dîner si tu veux !`,
          questions: [
            makeQuestion('Quel est le thème principal de ce récit ?', 'Le bilan d’un séjour de vacances personnelles à l’étranger', 'Le récit d’un déménagement définitif dans un pays étranger', 'Un séjour express d’une seule journée à l’étranger', ['voyage', 'séjour']),
            makeQuestion('Quelle difficulté la voyageuse a-t-elle rencontrée au début ?', `${cap(s.defPara)}`, 'Un manque sévère d’eau potable lors des premiers jours', 'Une grande facilité à marcher dès le premier jour', [s.defKw]),
            makeQuestion('Que propose la collègue à la fin de leur discussion ?', 'Regarder ensemble les clichés pris durant son voyage', 'Lui envoyer par courriel le compte rendu de sa réunion', 'Organiser une sortie au cinéma le samedi suivant', ['photos', 'pause']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Séjour linguistique / culturel au Portugal
    Object.assign(
      (rand) => {
        const slots = [
          { pays: 'au Portugal', ville: 'de Lisbonne', logement: 'chez une famille chaleureuse', transport: 'le tramway historique', logPara: 'au sein d’une famille d’accueil accueillante', logKw: 'famille' },
          { pays: 'en Espagne', ville: 'de Séville', logement: 'dans une auberge de jeunesse conviviale', transport: 'le vélo en libre-service', logPara: 'dans une auberge de jeunesse pour voyageurs', logKw: 'auberge' },
          { pays: 'en Italie', ville: 'de Bologne', logement: 'dans un petit appartement d’étudiant', transport: 'les trains régionaux', logPara: 'dans un petit logement pour étudiants', logKw: 'appartement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as passé de belles vacances, Carole ? — Oui, vraiment fantastiques ! Je suis partie un mois complet ${s.pays} pour suivre des cours de langue. J’habitais ${s.logement} dans le centre ${s.ville}. Tous les matins, je prenais ${s.transport} pour aller à l’école. Au début, j’avais peur de ne pas comprendre les accents régionaux, mais après deux semaines, j’arrivais déjà à commander au marché et à discuter avec les marchands. Le plus dépaysant, c’était le rythme de vie : les soupers tardifs et les longues promenades en soirée au bord de l’eau.`,
          questions: [
            makeQuestion('Pourquoi Carole est-elle partie à l’étranger pendant un mois ?', 'Pour perfectionner une langue seconde dans son milieu', 'Pour enseigner sa propre langue dans une école du centre', 'Pour rendre visite à un ami malade pendant un mois', ['langue', 'cours']),
            makeQuestion('Où habitait-elle pendant toute la durée de son séjour ?', `Elle résidait ${s.logPara}`, 'Elle logeait dans un hôtel en périphérie', 'Elle logeait sous une tente installée au bord de l’eau', [s.logKw]),
            makeQuestion('Quel aspect culturel a particulièrement surpris Carole ?', 'Les heures tardives des repas du soir et des promenades', 'La difficulté persistante à échanger avec les marchands', 'L’absence presque totale de transports en commun dans la cité', ['soupers', 'promenades']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Fête d'enfants avec incident du château gonflable
    Object.assign(
      (rand) => {
        const slots = [
          { enfant: 'mon fils Lucas', age: 'sept ans', incident: 'le château gonflable s’est dégonflé d’un coup', repli: 'au salon pour faire des jeux de société', incPara: 'le dégonflement subit du château gonflable dans la cour', repPara: 'en réunissant le groupe au salon pour des jeux calmes', incKw: 'gonflable', repKw: 'salon' },
          { enfant: 'ma fille Maya', age: 'six ans', incident: 'le vent a soudainement emporté le chapiteau', repli: 'au sous-sol pour regarder un film d’animation', incPara: 'la chute du chapiteau emporté par un coup de vent', repPara: 'en installant les jeunes devant un film au sous-sol', incKw: 'chapiteau', repKw: 'sous-sol' },
          { enfant: 'mon neveu Léo', age: 'huit ans', incident: 'le gâteau d’anniversaire est tombé par terre', repli: 'dans la cuisine pour improviser des crêpes', incPara: 'la chute accidentelle du gâteau préparé pour la fête', repPara: 'en préparant rapidement des crêpes dans la cuisine', incKw: 'gâteau', repKw: 'cuisine' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Sylvain ! Tu as l’air fatigué ce matin, tout s’est bien passé en fin de semaine ? — Ouf, ne m’en parle pas ! On organisait la fête d’anniversaire pour ${s.enfant} qui fêtait ses ${s.age}. On avait invité dix enfants dans la cour. Tout allait bien jusqu’au moment où ${s.incident} ! Heureusement, personne ne s’est fait mal, mais les enfants ont poussé de grands cris. Pour sauver la journée, on a tout rentré ${s.repli}. Finalement, ils ont ri comme des fous et ils sont repartis avec le sourire. Mais moi, j’ai mis deux jours à m’en remettre !`,
          questions: [
            makeQuestion('Quel événement le voisin raconte-t-il dans cet extrait ?', 'Une célébration d’anniversaire d’enfants mouvementée', 'Un après-midi de jeux calmes organisé pour dix enfants', 'Une fête d’anniversaire annulée faute d’invités', ['anniversaire', 'fête']),
            makeQuestion('Quel incident imprévu a perturbé l’activité extérieure ?', `${cap(s.incPara)}`, 'Une chute d’un enfant qui s’est fait mal dans la cour', 'Une averse soudaine qui a trempé les invités', [s.incKw]),
            makeQuestion('Comment les adultes ont-ils sauvé la fin de la fête ?', `${cap(s.repPara)}`, 'En annulant la fête dès le premier incident', 'En poursuivant les activités de la fête dehors dans la cour', [s.repKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Fête d'enfants avec incident de l'animateur en retard
    Object.assign(
      (rand) => {
        const slots = [
          { animateur: 'le magicien professionnel', retard: 'une heure de retard', activite: 'un atelier de maquillage pour le visage', actPara: 'un atelier créatif de maquillage pour les jeunes', actKw: 'maquillage' },
          { animateur: 'le clown acrobate', retard: 'quarante minutes de retard', activite: 'un concours de danse et de statues musicales', actPara: 'un concours amusant de danse et statues musicales', actKw: 'danse' },
          { animateur: 'l’éducateur scientifique', retard: 'trois quarts d’heure de retard', activite: 'une chasse aux trésors dans tout le sous-sol', actPara: 'une recherche d’indices dissimulés dans le sous-sol', actKw: 'trésors' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu ne devineras jamais ce qui est arrivé samedi chez nous ! On attendait douze enfants pour la fête de notre petite dernière. On avait réservé ${s.animateur}, mais il a eu ${s.retard} à cause d’un pneu crevé sur l’autoroute. Imagine l’angoisse avec douze petits qui courent partout en criant ! Mon conjoint et moi avons dû improviser ${s.activite} en catastrophe pour les occuper. Quand l’artiste est enfin arrivé, tout est rentré dans l’ordre et le spectacle était formidable. Les enfants n’ont même pas remarqué qu’il y avait eu un pépin !`,
          questions: [
            makeQuestion('Quel problème principal a déclenché le stress des parents ?', 'Le retard prononcé de l’animateur engagé pour la fête', 'L’annulation du spectacle de l’artiste engagé', 'Le vol des cadeaux de la petite dernière', ['retard', 'artiste']),
            makeQuestion('Quelle solution d’urgence les parents ont-ils improvisée ?', `${cap(s.actPara)}`, 'Annuler la fête et renvoyer les enfants chez eux', 'Attendre l’artiste sans rien proposer aux enfants', [s.actKw]),
            makeQuestion('Quelle a été la réaction finale des enfants invités ?', 'Ils ont adoré le spectacle sans remarquer le contretemps', 'Ils ont continué de courir et crier pendant le spectacle', 'Ils ont quitté les lieux déçus avant la fin de l’activité', ['spectacle', 'enfants']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Séjour de randonnée dans les Rocheuses canadiennes
    Object.assign(
      (rand) => {
        const slots = [
          { parc: 'dans le parc de Banff', transport: 'une caravane louée', copule: 'c’est', souvenir: 'la couleur turquoise des lacs glaciaires', transPara: 'une caravane de location pour dormir en nature', transKw: 'caravane' },
          { parc: 'dans le parc de Jasper', transport: 'une camionnette aménagée', copule: 'c’est', souvenir: 'la rencontre avec une harde de wapitis', transPara: 'un véhicule utilitaire adapté au repos nocturne', transKw: 'camionnette' },
          { parc: 'dans les parcs de Yoho et Kootenay', transport: 'une petite tente de camping', copule: 'ce sont', souvenir: 'les sommets enneigés au lever du soleil', transPara: 'un abri de toile compact dressé sur le terrain', transKw: 'tente' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Martin ! Je voulais te raconter notre périple de dix jours ${s.parc}. On voyageait avec ${s.transport}, ce qui nous permettait de dormir en pleine nature chaque soir. Ce qui restera gravé dans ma mémoire, ${s.copule} ${s.souvenir}. Par contre, on a dû composer avec des nuits très fraîches : il a gelé deux fois au mois d’août ! Il fallait allumer le réchaud dès six heures du matin pour réchauffer le café et dégeler nos souliers de marche. Mais l’effort en valait tellement la peine. C’est le plus beau voyage de ma vie !`,
          questions: [
            makeQuestion('Où la collègue et son compagnon ont-ils passé leurs dix jours ?', 'Dans des parcs naturels protégés, en pleine nature', 'Dans des chambres d’hôtel en centre-ville, loin de la nature', 'Dans un camping aménagé au bord d’une grande autoroute', ['périple', 'nature']),
            makeQuestion('Quelle météo inattendue a surpris les randonneurs en août ?', 'Des nuits particulièrement froides accompagnées de gelée', 'Des nuits très chaudes au mois d’août', 'Une chaleur étouffante qui a empêché toute marche en montagne', ['gelé', 'fraîches']),
            makeQuestion('Quel moyen d’hébergement itinérant utilisaient-ils ?', `Ils utilisaient ${s.transPara}`, 'Ils dormaient dans des cabanes louées au bord du lac', 'Ils logeaient chez des amis rencontrés en route', [s.transKw]),
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
          { soeur: 'Ma sœur Clara', domaine: 'dans une librairie de quartier', heures: 'vingt heures par semaine', etudes: 'son certificat universitaire en rédaction', etudPara: 'achever son certificat universitaire en rédaction', kw: 'certificat' },
          { soeur: 'Notre amie Clara', domaine: 'dans une boulangerie artisanale', heures: 'vingt-cinq heures par semaine', etudes: 'son diplôme d’études professionnelles', etudPara: 'valider son diplôme d’études professionnelles', kw: 'diplôme' },
          { soeur: 'Ma cousine Clara', domaine: 'dans un centre communautaire', heures: 'dix-huit heures par semaine', etudes: 'sa maîtrise en travail social', etudPara: 'conclure ses cours de maîtrise en travail social', kw: 'maîtrise' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as des nouvelles de Clara ? — Oui ! ${s.soeur} a finalement décidé d’accepter l’offre d’emploi à temps partiel ${s.domaine}. Elle travaillera ${s.heures}, principalement les jeudis et vendredis. Même si le salaire total est moins élevé qu’à temps plein, c’était le compromis idéal pour terminer ${s.etudes}. Son employeur lui garantit des horaires stables et accepte d’aménager son horaire pendant ses examens de fin de session. Elle se sent tellement soulagée d’avoir pris cette décision après avoir hésité pendant des semaines !`,
          questions: [
            makeQuestion('Quelle décision professionnelle est expliquée ici ?', 'L’acceptation d’un contrat de travail à temps partiel', 'L’abandon de ses études pour un emploi à temps plein', 'Un refus net de tout emploi pendant ses études', ['temps partiel', 'offre']),
            makeQuestion('Pourquoi ce poste à temps partiel convient-il particulièrement ?', `Pour lui permettre ${de(s.etudPara)}`, 'Pour lui permettre d’abandonner ses études au printemps prochain', 'Parce qu’elle a décidé de cesser de travailler dès maintenant', [s.kw]),
            makeQuestion('Quel avantage l’employeur lui accorde-t-il pendant les examens ?', 'Des horaires adaptés durant les épreuves de fin de session', 'Le maintien intégral de son salaire habituel de temps plein', 'L’obligation de travailler davantage les lundis et mardis', ['examens', 'horaire']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Temps partiel pour s'occuper d'un enfant
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Nadia', metier: 'designer graphique', jours: 'trois jours par semaine', raison: 'passer plus de temps avec son bébé', raiPara: 'profiter pleinement de son jeune enfant', kw: 'bébé' },
          { amie: 'Camille', metier: 'comptable adjointe', jours: 'quatre jours par semaine', raison: 'concilier sa vie de famille et ses cours', raiPara: 'trouver un équilibre entre foyer et études', kw: 'famille' },
          { amie: 'Julie', metier: 'rédactrice de contenu', jours: 'trois jours par semaine', raison: 'prendre soin de sa mère convalescente', raiPara: 'veiller au rétablissement de sa mère malade', kw: 'mère' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— J’ai discuté avec ${s.amie} hier soir. Elle m’a expliqué pourquoi elle a choisi un contrat à temps partiel comme ${s.metier}. L’entreprise lui offrait un poste régulier de quarante heures, mais elle a insisté pour faire seulement ${s.jours}. Sa priorité absolue cette année, c’est de ${s.raison}. Elle a calculé son budget de manière serrée et a constaté qu’en réduisant certaines dépenses de loisir, elle pouvait très bien vivre ainsi. Elle préfère avoir du temps de qualité plutôt que d’accumuler du stress au quotidien.`,
          questions: [
            makeQuestion('Quel compromis l’amie a-t-elle choisi pour sa vie professionnelle ?', 'Adopter un horaire allégé pour préserver son quotidien', 'Conserver un poste régulier de quarante heures par semaine', 'Augmenter ses journées de travail à cinq jours par semaine', ['temps partiel', 'heures']),
            makeQuestion('Quelle raison principale motive son choix d’horaire ?', `Le souhait de ${s.raiPara}`, 'Le besoin de réduire totalement ses dépenses de loisir', 'Une volonté d’augmenter ses revenus pour acheter une maison', [s.kw]),
            makeQuestion('Comment a-t-elle adapté son quotidien pour compenser la baisse de salaire ?', 'En surveillant ses dépenses et en coupant dans les loisirs', 'En augmentant ses dépenses de loisir chaque semaine', 'En négligeant son budget et en ignorant ses dépenses', ['dépenses', 'loisir']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Propriétaire interdisant les animaux dans le bloc
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Monsieur Gagnon', motif: 'des aboiements constants dans les corridors', degat: 'les planchers de bois franc égratignés', degPara: 'des rayures marquées sur les planchers de bois franc', degKw: 'planchers' },
          { proprio: 'Monsieur Lavoie', motif: 'des plaintes de bruit et des allergies graves', degat: 'les tapis des aires communes très sales', degPara: 'des taches tenaces sur les tapis des corridors communs', degKw: 'tapis' },
          { proprio: 'Monsieur Tremblay', motif: 'du non-respect de la tranquillité des voisins', degat: 'les boiseries des portes d’entrée grugées', degPara: 'des marques d’usure et de dents sur les boiseries des portes', degKw: 'boiseries' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as reçu la circulaire de ${s.proprio} ? — Oui, il nous a envoyé une longue lettre pour expliquer sa décision d’interdire les chiens et chats dans tous les nouveaux baux. Il explique que depuis l’hiver dernier, plusieurs locataires se sont plaints ${s.motif}. De plus, lors du départ des anciens occupants du troisième palier, il a constaté ${s.degat}. Pour préserver la valeur de son immeuble et la quiétude des résidents, il a donc décidé de resserrer le règlement. Heureusement, les animaux déjà présents sont tolérés jusqu’à la fin des baux actuels.`,
          questions: [
            makeQuestion('Quelle décision le propriétaire d’immeuble a-t-il prise ?', 'Bannir la présence des animaux pour les futurs baux', 'Exiger le départ des locataires du troisième palier', 'Autoriser les chiens et les chats dans les nouveaux baux', ['interdire', 'animaux']),
            makeQuestion('Quel dommage matériel dans un logement a motivé cette décision ?', `${cap(s.degPara)}`, 'Des murs du troisième palier couverts de moisissure', 'Des fenêtres du sous-sol fendues par le gel de l’hiver', [s.degKw]),
            makeQuestion('Qu’arrive-t-il aux animaux des personnes qui habitent déjà là ?', 'Ils demeurent tolérés jusqu’au terme de leur entente actuelle', 'Ils perdent leur droit de résidence dès le premier avis', 'Leur présence est interdite dès la signature de la circulaire', ['baux', 'tolérés']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire de copropriété interdisant les gros chiens
    Object.assign(
      (rand) => {
        const slots = [
          { organisme: 'le syndicat de copropriété', poidsPhrase: 'pesant plus de vingt livres', vote: 'à la majorité des deux tiers', poiPara: 'les animaux dépassant une vingtaine de livres', kw: 'vingt livres' },
          { organisme: 'le comité de gestion de l’immeuble', poidsPhrase: 'pesant plus de quinze kilos', vote: 'à l’unanimité des membres', poiPara: 'les bêtes pesant au-delà de quinze kilos', kw: 'quinze kilos' },
          { organisme: 'la société de gestion immobilière', poidsPhrase: 'de grande taille', vote: 'lors de l’assemblée générale', poiPara: 'les chiens dont le gabarit est imposant', kw: 'grande taille' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— J’ai assisté à la rencontre hier soir avec ${s.organisme}. La direction a expliqué en détail pourquoi le règlement interdit désormais les chiens ${s.poidsPhrase}. Cette règle a été adoptée ${s.vote} après deux incidents récents où des résidents âgés ont eu peur dans les ascenseurs. Les gestionnaires ont rappelé que les bruits de pas sur les parquets flottants créent trop d’irritation entre voisins de palier. Seuls les petits animaux de compagnie silencieux restent acceptés. Les propriétaires d’animaux actuels ont reçu un formulaire d’enregistrement obligatoire avant le premier mai.`,
          questions: [
            makeQuestion('Quelle est la décision adoptée lors de la réunion de gestion ?', `La restriction visant ${s.poiPara}`, 'L’assouplissement de la règle visant les chiens de la copropriété', 'L’obligation de tenir les chiens à la laisse dans l’immeuble', [s.kw]),
            makeQuestion('Quelle situation a particulièrement poussé à prendre cette décision ?', 'L’anxiété causée à des aînés croisés dans les ascenseurs', 'Une chute grave d’aînés glissant sur les parquets flottants', 'L’enthousiasme unanime des résidents envers les nouveaux animaux', ['ascenseurs', 'peur']),
            makeQuestion('Que doivent faire les résidents qui possèdent déjà un animal ?', 'Remplir une fiche d’identification avant le premier mai', 'Remettre leur animal à un refuge avant l’hiver prochain', 'Faire enregistrer leur animal après le premier mai', ['formulaire', 'premier mai']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Refus d'une offre à temps plein pour préserver la santé
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc', employeur: 'une agence de publicité', heures: 'vingt-quatre heures', raison: 'd’éviter l’épuisement professionnel', raiPara: 'd’éviter le surmenage et préserver sa santé', kw: 'épuisement' },
          { collegue: 'Simon', employeur: 'un cabinet de consultants', heures: 'vingt heures', raison: 'de garder du temps pour ses projets créatifs', raiPara: 'de consacrer du temps à ses projets créatifs', kw: 'créatifs' },
          { collegue: 'Benoît', employeur: 'un laboratoire médical', heures: 'vingt-huit heures', raison: 'de prendre soin de sa santé fragile', raiPara: 'de prendre soin au quotidien de sa santé', kw: 'santé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as su pour ${s.collegue} ? ${s.employeur[0].toUpperCase() + s.employeur.slice(1)} lui offrait un poste permanent à temps plein avec un salaire alléchant. Mais après mûre réflexion, il a décliné l’offre complète pour négocier un horaire de ${s.heures} par semaine. Il m’a confié que son but principal était ${s.raison}. Il avait vécu un épisode difficile il y a deux ans et il ne voulait absolument pas retomber dans le même piège de surcharge de travail. Son employeur a heureusement accepté sa proposition, car ses compétences techniques sont indispensables pour l’équipe.`,
          questions: [
            makeQuestion('Pourquoi le travailleur a-t-il refusé le poste permanent à temps plein ?', `Afin ${s.raiPara}`, 'Afin d’obtenir un salaire permanent plus alléchant', 'Afin de conserver un poste permanent à temps plein', [s.kw]),
            makeQuestion('Combien d’heures de travail par semaine a-t-il négociées ?', `Une formule contractuelle de ${s.heures} hebdomadaires`, 'Un horaire complet fixé à quarante heures par semaine', 'Une formule contractuelle de dix heures hebdomadaires', [s.heures]),
            makeQuestion('Quelle a été la réponse finale de l’employeur ?', 'Il a consenti à son aménagement à temps partiel', 'Il a rompu la relation contractuelle sans délai', 'Il a refusé de reconnaître ses compétences techniques', ['employeur', 'accepté']),
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
          { doc: 'tes reçus de dépenses', onglet: 'Comptabilité et finances', format: 'en format PDF', delai: 'avant le vingt de chaque mois', formPara: 'sous la forme de documents numériques en PDF', delPara: 'Conclure la démarche avant le vingtième jour du mois', formKw: 'pdf', delKw: 'vingt' },
          { doc: 'tes feuilles de temps', onglet: 'Ressources humaines', format: 'en fichier numérisé', delai: 'avant le quinze du mois', formPara: 'sous forme de pièces numérisées et lisibles', delPara: 'Finaliser l’envoi au plus tard au milieu du mois courant', formKw: 'numérisé', delKw: 'quinze' },
          { doc: 'tes demandes de remboursement', onglet: 'Services administratifs', format: 'en document PDF scanné', delai: 'avant la fin du trimestre', formPara: 'en fichiers PDF obtenus après numérisation', delPara: 'Transmettre le dossier avant l’arrivée du nouveau trimestre', formKw: 'scanné', delKw: 'trimestre' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Si tu dois envoyer ${s.doc} à la direction, voici la procédure exacte à suivre. D’abord, connecte-toi sur l’intranet de l’entreprise avec ton identifiant habituel. Ensuite, clique sur l’onglet « ${s.onglet} » et sélectionne le formulaire d’envoi interne. Tu dois impérativement téléverser toutes tes pièces justificatives ${s.format}. N’oublie pas d’inscrire le numéro de projet dans la case prévue. Enfin, clique sur « Soumettre » et attends le courriel de confirmation automatique. Il faut absolument faire cette démarche ${s.delai} pour que le traitement soit fait à temps sur ta paie.`,
          questions: [
            makeQuestion('Quelle démarche administrative la collègue explique-t-elle ?', 'La transmission interne de justificatifs via le portail', 'La création d’un nouveau numéro de projet sur l’intranet', 'L’envoi manuel d’un courriel de confirmation à la direction', ['intranet', 'formulaire']),
            makeQuestion('Dans quel format les fichiers doivent-ils être déposés ?', `Ils doivent être transmis ${s.formPara}`, 'Ils doivent être envoyés par courriel direct à la direction', 'Ils doivent être remis en main propre au secrétariat de la direction générale', [s.formKw]),
            makeQuestion('Quelle est l’échéance pour soumettre la demande ?', `${s.delPara}`, 'L’envoi doit être complété après la fin du mois suivant', 'Au plus tard le lendemain de la fin du trimestre', [s.delKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure d'approbation d'un bon de commande interne
    Object.assign(
      (rand) => {
        const slots = [
          { materiel: 'du matériel informatique', palier: 'de ton superviseur direct', bac: 'au bac bleu du secrétariat', signPara: 'la validation écrite du responsable direct', bacPara: 'Déposer la feuille signée dans le bac bleu du secrétariat', signKw: 'superviseur', bacKw: 'bleu' },
          { materiel: 'du mobilier de bureau', palier: 'du chef de département', bac: 'au bureau des achats au second étage', signPara: 'le visa manuscrit du gestionnaire de département', bacPara: 'Laisser le document visé aux achats situés au second étage', signKw: 'chef', bacKw: 'achats' },
          { materiel: 'des fournitures d’atelier', palier: 'de la directrice adjointe', bac: 'au comptoir de la réception générale', signPara: 'l’approbation signée par la direction adjointe', bacPara: 'Remettre la feuille approuvée au comptoir de la réception', signKw: 'directrice', bacKw: 'réception' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour commander ${s.materiel}, fais bien attention aux étapes du protocole interne. Première étape : remplis le bon de commande dans le logiciel de gestion en indiquant les codes d’articles précis. Étape suivante : imprime une copie papier et obtiens la signature manuscrite ${s.palier}. Troisième phase : dépose le document signé ${s.bac} avant quatorze heures. Une fois le bon enregistré, le commis t’enverra un numéro de suivi par messagerie instantanée. Si tu oublies la signature, ta demande sera automatiquement rejetée par le système.`,
          questions: [
            makeQuestion('Quelle procédure la collègue détaille-t-elle à son interlocuteur ?', 'L’acheminement formel d’une demande d’achat de matériel', 'L’enregistrement des retours de matériel dans le logiciel', 'La transmission d’une demande d’achat sans signature manuscrite', ['bon de commande', 'protocole']),
            makeQuestion('Quelle condition obligatoire permet de valider le bon de commande ?', `Recueillir ${s.signPara}`, 'Obtenir un numéro de suivi auprès du commis de bureau', 'Transmettre une approbation par simple courriel au secrétariat', [s.signKw]),
            makeQuestion('Où doit-on déposer le document papier une fois signé ?', `${s.bacPara}`, 'Le conserver dans son casier personnel au second étage du bureau', 'Le transmettre par courriel au fournisseur du matériel', [s.bacKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Colocataire expliquant le virement Interac pour le loyer
    Object.assign(
      (rand) => {
        const slots = [
          { banque: 'de ta banque', courriel: 'loyer.immeuble@habitation.ca', code: 'notre numéro d’appartement', montant: 'sept cent cinquante dollars', secPara: 'le numéro attribué à votre logement', secKw: 'appartement' },
          { banque: 'de Desjardins', courriel: 'gestion.logement@gestionnaires.qc.ca', code: 'le nom de notre rue', montant: 'huit cent vingt dollars', secPara: 'l’appellation officielle de la rue habitée', secKw: 'rue' },
          { banque: 'de la Banque Nationale', courriel: 'paiement.proprietaire@bloc.com', code: 'le code postal de l’immeuble', montant: 'six cent quatre-vingts dollars', secPara: 'le code postal désignant la bâtisse', secKw: 'code postal' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour payer ta part de loyer par cellulaire, c’est très simple, regarde. Ouvre d’abord l’application mobile ${s.banque} et va dans la section « Virements Interac ». Entre l’adresse courriel du propriétaire, qui est ${s.courriel}. Ensuite, inscris le montant exact de ta part, soit ${s.montant}. Pour la question de sécurité, écris « Appartement », et comme réponse secrète, tape ${s.code}. Vérifie bien toutes les informations avant de confirmer l’envoi. Dès que le virement est complété, fais une capture d’écran de la confirmation et envoie-la-moi par message texte pour nos dossiers !`,
          questions: [
            makeQuestion('Quel paiement le colocataire apprend-il à effectuer sur son téléphone ?', 'Le règlement de sa quote-part de loyer via l’application', 'Le paiement en argent comptant au bureau du propriétaire', 'Le virement du loyer envoyé par simple message texte', ['loyer', 'interac']),
            makeQuestion('Quelle réponse de sécurité doit-on saisir dans l’application ?', `Il faut entrer ${s.secPara}`, 'L’adresse courriel complète de votre propriétaire', 'Le numéro de cellulaire de votre colocataire en poste', [s.secKw]),
            makeQuestion('Que doit envoyer le locataire une fois la transaction terminée ?', 'Une preuve visuelle de l’écran de confirmation par texto', 'Un courriel de confirmation officiel au propriétaire', 'Une copie papier remise en main propre au gérant de l’immeuble', ['capture', 'texte']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Paiement des factures partagées par application bancaire
    Object.assign(
      (rand) => {
        const slots = [
          { facture: 'd’Internet haute vitesse', montant: 'quarante-cinq dollars', compte: 'le compte chèques', date: 'le premier de chaque mois', facKw: 'internet' },
          { facture: 'd’électricité pour le logement', montant: 'soixante dollars', compte: 'le compte d’opérations courantes', date: 'le cinq du mois', facKw: 'électricité' },
          { facture: 'd’assurance habitation pour le logement', montant: 'vingt-cinq dollars', compte: 'le compte partagé', date: 'le dernier jour du mois', facKw: 'assurance' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Voici comment faire pour payer la facture ${s.facture} avec ton cellulaire. Dans ton application bancaire, choisis l’onglet « Payer une facture ». Si le fournisseur n’est pas encore enregistré, clique sur « Ajouter un bénéficiaire » et tape le numéro de compte qui apparaît en haut du compte papier. Ensuite, sélectionne ${s.compte} et saisis le montant de ${s.montant}. Tu peux programmer un paiement récurrent qui s’exécutera automatiquement ${s.date}. N’oublie pas de cliquer sur le bouton vert pour enregistrer. Ça évite les oublis et les frais d’intérêt de retard !`,
          questions: [
            makeQuestion('Quelle procédure est expliquée pour gérer les dépenses de la colocation ?', 'Le règlement d’une charge de logement sur l’outil bancaire mobile', 'L’ouverture d’un compte bancaire pour payer les factures', 'Le règlement d’une facture en imprimant le compte papier', ['facture', 'bancaire']),
            makeQuestion('Quelle information faut-il taper pour ajouter le bénéficiaire ?', 'La référence de compte figurant sur le document papier', 'Le montant total de la facture figurant sur le compte papier', 'Le code postal de l’agence bancaire la plus proche', ['numéro de compte', 'bénéficiaire']),
            makeQuestion('Quel avantage offre la programmation automatique du paiement ?', 'Prévenir tout retard et s’épargner des pénalités financières', 'Payer un montant moins élevé lors de chaque versement mensuel', 'Multiplier les oublis lors de chaque versement mensuel', ['frais', 'retard']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Transmission de dossier d'embauche aux RH
    Object.assign(
      (rand) => {
        const slots = [
          { piece: 'ton spécimen de chèque', portail: 'le portail des employés', delai: 'dans les quarante-huit heures', piePara: 'un spécimen de chèque bancaire valide', delPara: 'Accomplir les démarches dans un délai de quarante-huit heures', pieKw: 'chèque', delKw: 'quarante-huit heures' },
          { piece: 'ton attestation d’études', portail: 'la section documents de l’intranet', delai: 'avant la fin de ta première semaine', piePara: 'une attestation officielle de scolarité', delPara: 'Conclure la transmission avant la fin de sa semaine initiale', pieKw: 'attestation', delKw: 'première semaine' },
          { piece: 'ta pièce d’identité avec photo', portail: 'le système de gestion des profils', delai: 'dès ta première journée en poste', piePara: 'un document d’identité muni d’une photo', delPara: 'Finaliser l’envoi au cours de son tout premier jour en poste', pieKw: 'pièce', delKw: 'première journée' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Pour finaliser ton dossier d’embauche auprès des ressources humaines, il y a trois étapes simples. Premièrement, télécharge le formulaire d’adhésion à la paie depuis ${s.portail}. Deuxièmement, numérise ${s.piece} et joins ce document en fichier PDF au formulaire. Troisièmement, vérifie que ton adresse postale et ton numéro de téléphone sont bien à jour dans ton profil. Il faut compléter ces démarches ${s.delai} pour que la paie de la semaine prochaine ne soit pas bloquée. Si tu as un problème technique, appelle le poste interne 204.`,
          questions: [
            makeQuestion('Quel dossier administratif le nouvel employé doit-il compléter ?', 'Les pièces d’embauche nécessaires à la gestion de la paie', 'Une demande de permis de stationnement pour le campus', 'Un formulaire de démission envoyé à la direction', ['dossier', 'embauche']),
            makeQuestion('Quel document doit-il numériser et joindre au formulaire ?', `Il est nécessaire de déposer ${s.piePara}`, 'Un justificatif de domicile attestant de son adresse postale', 'Un document papier qui n’a pas été numérisé', [s.pieKw]),
            makeQuestion('Dans quel délai doit-il accomplir toutes ces étapes ?', `${s.delPara}`, 'Avant la date de versement de sa paie du mois prochain', 'Accomplir les démarches seulement après la fin de sa période de probation', [s.delKw]),
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
          { amie: 'Karine', destination: 'en Gaspésie', activite: 'louer un chalet face au fleuve et de voir les baleines', conseil: 'réserver avant la fin mars', conPara: 'effectuer ses réservations avant le terme du mois de mars', actKw: 'baleines', conKw: 'mars' },
          { amie: 'Sarah', destination: 'aux Îles-de-la-Madeleine', activite: 'faire du kayak le long des falaises rouges', conseil: 'acheter les billets de traversier très tôt', conPara: 'se procurer les passages sur le traversier sans tarder', actKw: 'kayak', conKw: 'traversier' },
          { amie: 'Émilie', destination: 'dans Charlevoix', activite: 'parcourir les sentiers de randonnée en montagne', conseil: 'prévoir des vêtements chauds pour le soir', conPara: 'emporter une tenue bien chaude pour les soirées fraîches', actKw: 'randonnée', conKw: 'vêtements' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Julie ! Avec ${s.amie}, on discutait de nos projets pour les vacances de juillet et on a pensé à toi. On te suggère vraiment de venir avec nous ${s.destination}. Notre plan, c’est de ${s.activite} et de découvrir les petits cafés locaux. C’est tellement reposant et dépaysant ! Par contre, ${s.amie} insiste sur un point crucial : il faut absolument ${s.conseil}, parce que les hébergements affichent complet très vite en haute saison. Prends le temps d’y penser cette semaine et dis-nous si l’aventure te tente !`,
          questions: [
            makeQuestion('Quelle proposition les amies font-elles pour l’été ?', `Une escapade estivale commune ${s.destination}`, 'Un séjour tranquille pour se reposer dans leur ville', 'Une escapade hivernale commune pour les fêtes de Noël', ['vacances', 'juillet']),
            makeQuestion('Quelle activité principale prévoient-elles de faire sur place ?', 'Explorer les paysages et fréquenter de petits cafés typiques', 'Visiter des musées d’art contemporain en fin de semaine', 'Assister à un concert de jazz au centre-ville chaque soir', ['cafés', 'découvrir']),
            makeQuestion('Quel conseil important l’amie donne-t-elle pour l’organisation ?', `${cap(s.conPara)}`, 'Attendre le plein cœur de la haute saison pour réserver', 'Partir sans rien retenir afin de négocier son logement sur place', [s.conKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Suggestions vacances plein air dans les parcs nationaux
    Object.assign(
      (rand) => {
        const slots = [
          { parc: 'le parc national du Mont-Tremblant', logement: 'des tentes de prêt-à-camper toutes équipées', rando: 'la via ferrata sur la paroi rocheuse', logPara: 'des formules de tentes prêt-à-camper toutes pourvues', logKw: 'tentes' },
          { parc: 'le parc national de la Jacques-Cartier', logement: 'des chalets en bois près de la rivière', rando: 'la descente en canot sur l’eau calme', logPara: 'des maisonnettes rustiques au bord de la rivière', logKw: 'chalets' },
          { parc: 'le parc national des Grands-Jardins', logement: 'des refuges rustiques en forêt', rando: 'l’ascension du mont du Lac-des-Cygnes', logPara: 'des abris rustiques simples installés en forêt', logKw: 'refuges' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Marc ! Si tu cherches des idées de vacances sans dépenser une fortune, mes copines et moi te conseillons ${s.parc}. On a testé la formule l’été dernier et c’était merveilleux. Tu peux réserver ${s.logement}, donc tu n’as pas besoin de transporter tout ton matériel de camping. Pendant la journée, la plus belle activité à faire, c’est ${s.rando}. N’oublie surtout pas d’apporter une bonne lotion contre les moustiques et une gourde d’eau réutilisable. Les réservations ouvrent ce samedi matin sur le site officiel de la Sépaq, alors sois prêt !`,
          questions: [
            makeQuestion('Quelle destination de plein air les amies recommandent-elles ?', 'Un séjour nature abordable dans un parc national du réseau', 'Un séjour de camping sauvage sans aucune réservation au parc', 'Un séjour urbain coûteux, loin de tout parc national', ['parc national', 'vacances']),
            makeQuestion('Quel hébergement pratique et économique suggèrent-elles ?', `${cap(s.logPara)}`, 'Installer sa propre tente avec son matériel de camping', 'Réserver une chambre d’hôtel coûteuse en ville', [s.logKw]),
            makeQuestion('Quelle recommandation d’équipement pratique mentionnent-elles ?', 'Prévoir du répulsif à insectes et un récipient d’eau propre', 'Transporter tout son matériel de camping pour la semaine', 'Oublier la lotion contre les moustiques à la maison', ['moustiques', 'gourde']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Conseils d'un physiothérapeute pour prévenir les maux de dos
    Object.assign(
      (rand) => {
        const slots = [
          { posture: 'un support lombaire derrière votre dos', pause: 'toutes les quarante-cinq minutes', exercice: 'd’étirements doux des ischio-jambiers', posPara: 'ajuster un coussin lombaire adapté derrière le bas du dos', posKw: 'lombaire' },
          { posture: 'l’écran à la hauteur exacte de vos yeux', pause: 'toutes les trente minutes', exercice: 'de rotations contrôlées du bassin', posPara: 'caler le moniteur informatique au niveau du regard', posKw: 'écran' },
          { posture: 'les pieds bien à plat sur le sol ou sur un repose-pied', pause: 'au moins une fois par heure', exercice: 'de flexions douces des genoux', posPara: 'maintenir les deux pieds en contact avec un appui stable', posKw: 'pieds' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour monsieur. Vos douleurs lombaires ont bien diminué, mais pour éviter toute rechute, vous devez adopter de nouvelles habitudes de travail. Quand vous travaillez à l’ordinateur, placez ${s.posture} pour maintenir la courbe naturelle de votre colonne. Ensuite, levez-vous ${s.pause} pour marcher quelques pas et activer la circulation sanguine. Chaque matin au lever, faites dix minutes ${s.exercice}. Surtout, évitez absolument de soulever des boîtes lourdes en pliant le dos : pliez toujours les genoux en gardant la charge près du corps.`,
          questions: [
            makeQuestion('Quel est le but des conseils donnés par le physiothérapeute ?', 'Prévenir la réapparition des douleurs dorsales au bureau', 'Reprendre un entraînement physique intensif dès le matin', 'Espacer les pauses au travail pour rester longtemps assis', ['lombaires', 'douleurs']),
            makeQuestion('Quel ajustement postural le spécialiste recommande-t-il au bureau ?', `${cap(s.posPara)}`, 'Régler le fauteuil au plus bas pour alléger les épaules', 'Éloigner le moniteur d’au moins un mètre de ses yeux', [s.posKw]),
            makeQuestion('Que doit-on faire absolument pour soulever une charge lourde ?', 'Fléchir les genoux en maintenant l’objet contre son torse', 'Soulever la boîte d’un coup sec en tirant avec les bras', 'Porter la boîte à bout de bras, loin du corps, en marchant', ['genoux', 'dos']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Conseils d'une physiothérapeute pour les tensions aux épaules et au cou
    Object.assign(
      (rand) => {
        const slots = [
          { accessoire: 'un coussin chauffant sur le cou pendant quinze minutes', mouvement: 'des cercles lents avec les épaules', sac: 'un sac à dos ergonomique à deux bretelles', accPara: 'poser un coussin tiède sur la nuque durant un quart d’heure', accKw: 'coussin' },
          { accessoire: 'une poche de glace enveloppée dans une serviette', mouvement: 'des inclinaisons lentes de la tête de gauche à droite', sac: 'un sac de sport léger bien réparti', accPara: 'appliquer une poche froide entourée d’un linge protecteur', accKw: 'glace' },
          { accessoire: 'une balle de tennis pour masser le haut du dos', mouvement: 'des étirements des trapèzes et des bras', sac: 'une sacoche légère portée en bandoulière alternée', accPara: 'masser délicatement la zone haute du dos à l’aide d’une balle', accKw: 'balle' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Vos trapèzes sont encore très tendus après votre blessure musculaire. Pour consolider la guérison, appliquez ${s.accessoire} après une longue journée devant l’écran. En journée, pratiquez ${s.mouvement} trois fois par jour pour relâcher la pression sur les vertèbres cervicales. Pour vos déplacements en transport en commun, remplacez votre sac lourd par ${s.sac}. Évitez de coincer votre téléphone cellulaire entre votre oreille et votre épaule quand vous parlez : utilisez plutôt vos écouteurs avec micro mains libres. On se revoit dans un mois pour évaluer votre progression !`,
          questions: [
            makeQuestion('Quels conseils professionnels la thérapeute formule-t-elle ?', 'Des gestes ciblés pour atténuer les raideurs au cou', 'Une consultation chez le chiropraticien chaque semaine', 'Changer de matelas et d’oreiller chaque mois', ['trapèzes', 'musculaire']),
            makeQuestion('Quelle méthode d’application locale est conseillée le soir ?', `${cap(s.accPara)}`, 'Appliquer une compresse froide pendant la pause de midi', 'Appliquer l’accessoire le matin, avant de se rendre au travail', [s.accKw]),
            makeQuestion('Quelle mauvaise habitude quotidienne faut-il absolument bannir ?', 'Tenir son appareil entre son oreille et son épaule', 'Dormir sur le ventre avec un oreiller très haut', 'Changer de position seulement une fois par jour', ['cellulaire', 'oreille']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Suggestions vacances à vélo sur la Route verte
    Object.assign(
      (rand) => {
        const slots = [
          { region: 'dans les Cantons-de-l’Est', parcours: 'l’Estriade et ses sentiers ombragés', halte: 'les auberges champêtres locales', parPara: 'la voie cyclable de l’Estriade et ses tronçons boisés', regPara: 'Une randonnée touristique à bicyclette sur les routes de l’Estrie', parKw: 'l’estriade', halKw: 'auberges' },
          { region: 'dans la région de Chaudière-Appalaches', parcours: 'le Parc linéaire de la MRC de Lotbinière', halte: 'les gîtes touristiques certifiés Bienvenue cyclistes', parPara: 'le tracé du parc linéaire aménagé dans Lotbinière', regPara: 'Un itinéraire cyclable balisé dans le secteur de Chaudière-Appalaches', parKw: 'lotbinière', halKw: 'gîtes' },
          { region: 'dans les Laurentides', parcours: 'le célèbre parc linéaire du P’tit Train du Nord', halte: 'les anciennes auberges de gare aménagées pour cyclistes', parPara: 'l’ancienne voie ferroviaire transformée en piste pour cyclistes', regPara: 'Un itinéraire à vélo récréatif au cœur des paysages des Laurentides', parKw: 'train du nord', halKw: 'auberges' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Stéphane ! On sait que tu aimes le vélo de route, alors on te propose un beau voyage estival ${s.region}. On te suggère d’emprunter ${s.parcours}. C’est sécuritaire, presque entièrement plat et idéal pour pédaler à son rythme en contemplant la nature. Pour dormir, on te conseille ${s.halte}, qui offrent des ateliers pour réparer et ranger les bicyclettes en sécurité la nuit. Prépare bien deux sacoches imperméables et un nécessaire de réparation pour les crevaisons. Tu verras, c’est une façon formidable de déconnecter du travail pendant une semaine !`,
          questions: [
            makeQuestion('Quel genre de vacances les amies suggèrent-elles à Stéphane ?', `${s.regPara}`, 'Un stage de mécanique pour apprendre à réparer des bicyclettes', 'Un circuit touristique en autobus, sans pédaler du tout', ['vélo', 'voyage']),
            makeQuestion('Quelle infrastructure cyclable recommande-t-on pour le trajet ?', `${cap(s.parPara)}`, 'Un sentier de montagne accidenté exigeant un rythme très rapide', 'Une route sinueuse et pleine de côtes abruptes', [s.parKw]),
            makeQuestion('Quel équipement pratique lui conseille-t-on de préparer ?', 'Deux sacoches étanches ainsi qu’un nécessaire pour crevaisons', 'Des pneus à crampons pour rouler sur sentiers de montagne', 'Un vélo de montagne suspendu pour les pentes raides', ['sacoches', 'crevaisons']),
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
          { adresse: '450 rue Ontario Est, app. 3', loyer: 'neuf cent soixante dollars', services: 'le chauffage et l’eau chaude', date: 'le premier juillet', serPara: 'la fourniture du chauffage et de l’eau chaude', serKw: 'chauffage' },
          { adresse: '720 avenue Laurier Ouest, app. 2', loyer: 'mille cinquante dollars', services: 'l’électricité et l’eau chaude', date: 'le premier juillet', serPara: 'l’alimentation électrique et l’eau chaude', serKw: 'électricité' },
          { adresse: '215 rue Saint-Denis, app. 5', loyer: 'huit cent quatre-vingts dollars', services: 'le chauffage et le déneigement', date: 'le premier août', serPara: 'le service de chauffage et le déneigement', serKw: 'déneigement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BAIL DE LOGEMENT (Tribunal administratif du logement)\nLe présent bail est conclu pour le logement situé au ${s.adresse}. Le bail commence ${s.date} pour une durée fixe de douze mois. Le montant du loyer mensuel est fixé à ${s.loyer}, payable le premier jour de chaque mois par virement. Le loyer comprend ${s.services}. Les animaux domestiques sont interdits dans l’immeuble, sauf les chats stérilisés. Il est strictement interdit de fumer dans le logement. Tout retard de paiement supérieur à trois semaines pourra entraîner une résiliation du bail par le propriétaire.`,
          questions: [
            makeQuestion('De quel type de document officiel s’agit-il principalement ?', 'D’un contrat officiel de location pour un appartement', 'D’un avis officiel de résiliation pour un logement', 'D’un reçu officiel de paiement du loyer', ['bail', 'logement']),
            makeQuestion('Quels services sont expressément inclus dans le loyer mensuel ?', `La redevance couvre ${s.serPara}`, 'Le loyer autorise la présence de tous les animaux dans l’immeuble', 'La redevance couvre le droit de fumer dans le logement', [s.serKw]),
            makeQuestion('Quelle modalité est exigée pour le versement du loyer ?', 'Un virement bancaire intervenant au premier jour du mois', 'Un virement bancaire autorisé après trois semaines de retard', 'Un chèque remis chaque mois au propriétaire', ['virement', 'premier']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Conditions de location condo locatif
    Object.assign(
      (rand) => {
        const slots = [
          { ville: 'à Québec', quartier: 'dans le quartier Saint-Roch', loyer: 'mille cent dollars', stationnement: 'd’un espace de stationnement intérieur', staPara: 'un emplacement de stationnement abrité', staKw: 'stationnement' },
          { ville: 'à Sherbrooke', quartier: 'près du centre-ville', loyer: 'neuf cent vingt dollars', stationnement: 'd’un casier de rangement au sous-sol', staPara: 'un compartiment de rangement au sous-sol', staKw: 'rangement' },
          { ville: 'à Trois-Rivières', quartier: 'dans un secteur résidentiel', loyer: 'huit cent cinquante dollars', stationnement: 'd’un espace pour bicyclette sécurisé', staPara: 'un local sécurisé réservé aux bicyclettes', staKw: 'bicyclette' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ANNEXE AU CONTRAT DE LOCATION - IMMEUBLE LES ÉRABLES\nBienvenue dans votre appartement 3 1/2 situé ${s.ville}, ${s.quartier}. Votre loyer mensuel de ${s.loyer} inclut l’accès au gymnase en plus ${s.stationnement}. Le paiement s’effectue par prélèvement bancaire le premier jour de chaque mois. Les locataires doivent fournir une preuve d’assurance responsabilité civile avant la remise des clés. Les travaux de peinture requièrent une entente écrite préalable avec le gestionnaire. Pour toute urgence de chauffage, veuillez joindre le concierge de garde au poste 102.`,
          questions: [
            makeQuestion('Quel document le futur locataire lit-il ici ?', 'Une annexe détaillant les règles de son appartement', 'Une entente écrite autorisant des travaux de peinture', 'Une facture de chauffage émise par le concierge', ['contrat', 'location']),
            makeQuestion('Quel aménagement complémentaire est compris avec le logement ?', `L’usage d’${s.staPara}`, 'Une salle de lavage privée près de l’ascenseur', 'Un accès au gymnase facturé en supplément du loyer', [s.staKw]),
            makeQuestion('Que doit fournir le locataire avant d’obtenir les clés ?', 'Une attestation valide d’assurance responsabilité civile', 'Une entente écrite signée pour les travaux de peinture', 'Une facture de loyer payée d’avance pour l’année', ['assurance', 'responsabilité']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Bilan de festival de musique à Montréal
    Object.assign(
      (rand) => {
        const slots = [
          { festival: 'des Francos de Montréal', spectateurs: 'huit cent mille festivaliers', concerts: 'deux cent cinquante spectacles gratuits', conPara: 'Une vaste offre de concerts musicaux sans frais d’accès', conKw: 'spectacles gratuits', cloture: 'célébrer la chanson francophone', orientPara: 'Une nouvelle édition consacrée aux artistes francophones', orientKw: 'francophone' },
          { festival: 'du Festival de jazz de Montréal', spectateurs: 'près d’un million d’amateurs', concerts: 'trois cents concerts sur les scènes extérieures', conPara: 'Une programmation riche déployée sur les scènes extérieures', conKw: 'scènes extérieures', cloture: 'célébrer les maîtres du jazz mondial', orientPara: 'Une programmation future centrée sur les talents du jazz', orientKw: 'jazz' },
          { festival: 'du Festival d’été de Québec', spectateurs: 'six cent mille spectateurs', concerts: 'deux cents représentations musicales variées', conPara: 'Un grand déploiement de prestations musicales diversifiées', conKw: 'représentations musicales', cloture: 'célébrer les artistes de la scène pop et rock', orientPara: 'Une programmation future axée sur les scènes pop et rock', orientKw: 'rock' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BILAN CULTUREL - SUCCÈS MAJEUR POUR LA MUSIQUE\nLa quarantième célébration ${s.festival} s’est clôturée dimanche sur une note formidable. Pendant dix jours sous le soleil, ${s.spectateurs} ont convergé vers le centre-ville. Les organisateurs célèbrent cette réussite populaire avec ${s.concerts} qui ont ravi un public familial. Les commerçants locaux soulignent des retombées économiques majeures pour les restaurants du secteur. Aucun incident n’a été rapporté par la police. Le comité organisateur donne déjà rendez-vous l’an prochain pour ${s.cloture} !`,
          questions: [
            makeQuestion('Quel est le sujet principal de cet article de journal ?', 'Le couronnement réussi d’une grande manifestation musicale', 'L’impact d’incidents policiers sur les commerces du secteur', 'L’annulation d’une grande fête populaire faute de spectateurs', ['musique', 'festival']),
            makeQuestion('Quelle statistique illustre la grande réussite de l’événement ?', s.conPara, 'La fermeture complète des restaurants du secteur en soirée', 'Une hausse notable des incidents signalés à la police', [s.conKw]),
            makeQuestion('Quelle orientation est annoncée pour l’édition de l’année suivante ?', s.orientPara, 'Une programmation restreinte aux seuls restaurants du centre', 'L’annulation de l’édition suivante faute de financement', [s.orientKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Bilan du festival de musique régionale
    Object.assign(
      (rand) => {
        const slots = [
          { festival: 'Le Festi-Plage de Cap-d’Espoir', region: 'en Gaspésie', participants: 'vingt-cinq mille visiteurs', nouveaute: 'une plateforme écologique solaire', nouPara: 'une plateforme scénique alimentée à l’énergie solaire', nouKw: 'solaire' },
          { festival: 'Le Festival des musiques du monde', region: 'au Saguenay', participants: 'trente mille amateurs', nouveaute: 'des ateliers de percussion pour enfants', nouPara: 'des séances d’initiation à la percussion pour enfants', nouKw: 'percussion' },
          { festival: 'Le festival Les Nuits acoustiques de Rimouski', region: 'dans le Bas-Saint-Laurent', participants: 'quinze mille festivaliers', nouveaute: 'des navettes fluviales gratuites', nouPara: 'un service de transport par navettes sur le fleuve', nouKw: 'navettes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE LOCALE - RECORD DE PARTICIPATION EN RÉGION\n${s.festival}, qui célébrait sa quinzième saison ${s.region}, a franchi une étape historique cette fin de semaine. L’événement a attiré ${s.participants}, dépassant toutes les prévisions du comité organisateur. Les festivaliers ont particulièrement apprécié ${s.nouveaute}. Les artistes invités ont salué l’accueil chaleureux du public lors des concerts au coucher du soleil. Grâce aux revenus de la billetterie, les organisateurs confirment que les profits serviront à financer des bourses pour les jeunes musiciens de la région.`,
          questions: [
            makeQuestion('Quel événement culturel régional fait l’objet de ce bilan de presse ?', 'Un festival musical ayant battu son record d’affluence', 'Un concours de danse traditionnelle organisé en plein air', 'Une exposition de peinture ancienne au musée régional', ['festival', 'région']),
            makeQuestion('Quelle nouveauté a particulièrement séduit les festivaliers ?', `${cap(s.nouPara)}`, 'Des concerts en matinée donnés au lever du soleil', 'Des bourses réservées aux festivaliers les plus âgés', [s.nouKw]),
            makeQuestion('À quoi serviront les profits générés par le festival ?', 'Au financement d’un fonds d’aide aux jeunes talents locaux', 'Au remboursement de la billetterie aux festivaliers', 'Au versement de prix pour les jeunes athlètes de la région', ['bourses', 'musiciens']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Clauses du bail pour un logement étudiant
    Object.assign(
      (rand) => {
        const slots = [
          { quartier: 'de Côte-des-Neiges', distance: 'à cinq minutes de l’université', meuble: 'entièrement meublé avec électroménagers', internet: 'l’accès à Internet haute vitesse illimité', intPara: 'un accès illimité au réseau Internet à haute vitesse', intKw: 'internet' },
          { quartier: 'de Sainte-Foy', distance: 'à deux pas du campus collégial', meuble: 'semi-meublé avec lit et bureau', internet: 'une connexion Wi-Fi sécurisée dans tout l’immeuble', intPara: 'une liaison sans fil sécurisée accessible dans l’édifice', intKw: 'wi-fi' },
          { quartier: 'de Sherbrooke', distance: 'à proximité des facultés', meuble: 'meublé à neuf avec lit double', internet: 'le câble et l’Internet sans fil', intPara: 'la fourniture combinée du câble et d’Internet sans fil', intKw: 'câble' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `EXTRAIT DE BAIL RÉSIDENTIEL - SECTION LOGEMENT ÉTUDIANT\nLe logement loué est situé au cœur du secteur ${s.quartier}, ${s.distance}. Il s’agit d’un studio ${s.meuble}. En plus du chauffage, le loyer mensuel comprend ${s.internet}. Le locataire s’engage à respecter la tranquillité des autres résidents entre vingt-deux heures et sept heures du matin. Aucun sous-locataire n’est admis sans le consentement écrit du propriétaire. Toute sous-location non autorisée entraînera une pénalité financière immédiate. Les clés seront remises le premier du mois après versement du premier loyer.`,
          questions: [
            makeQuestion('À qui s’adresse principalement cette offre de logement locatif ?', 'À des étudiants recherchant un hébergement adapté', 'À des sous-locataires cherchant un studio temporaire', 'À des retraités recherchant un logement avec jardin', ['bail', 'étudiant']),
            makeQuestion('Quel service de télécommunication est compris dans le bail ?', `${cap(s.intPara)}`, 'Un accès au réseau facturé en supplément du loyer', 'Le chauffage payé en supplément du loyer', [s.intKw]),
            makeQuestion('Quelle condition encadre la sous-location de ce studio ?', 'Obtenir impérativement l’accord formel et écrit du bailleur', 'Payer une pénalité financière au bailleur avant chaque séjour', 'Sous-louer librement dès la première année de bail', ['sous-locataire', 'consentement']),
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
          { attraction: 'les saveurs de la Route des terroirs', paysage: 'entre le fleuve et les montagnes imposantes', village: 'le village pittoresque de Baie-Saint-Paul', attPara: 'un parcours gourmand célébrant les saveurs régionales', attKw: 'saveurs', vilKw: 'baie-saint-paul' },
          { attraction: 'les croisières d’observation des baleines', paysage: 'entre des fjords spectaculaires et des falaises escarpées', village: 'le village historique de Tadoussac', attPara: 'des excursions maritimes pour contempler les baleines', attKw: 'baleines', vilKw: 'tadoussac' },
          { attraction: 'les sentiers panoramiques du parc national', paysage: 'au cœur de vallées profondes sculptées par la nature', village: 'le bourg côtier de La Malbaie', attPara: 'des pistes balisées offrant des vues imprenables', attKw: 'panoramiques', vilKw: 'la malbaie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BROCHURE TOURISTIQUE OFFICIELLE - ÉVASION DANS CHARLEVOIX\nNichée ${s.paysage}, la région de Charlevoix est une destination magnifique pour les amoureux de plein air. En parcourant cette région, réserve mondiale de la biosphère, vous découvrirez ${s.attraction}, où des fromagers et des artisans passionnés vous accueillent. Faites une halte dans ${s.village}, réputé pour ses galeries d’art, ses bistros chaleureux et son patrimoine architectural préservé. Que vous choisissiez une randonnée au grand air ou un séjour douillet dans une auberge de charme, Charlevoix saura vous émerveiller en toute saison. Réservez votre séjour en ligne dès aujourd’hui !`,
          questions: [
            makeQuestion('Quel est l’objectif principal de cette brochure touristique ?', 'Mettre en valeur le patrimoine naturel et culturel régional', 'Présenter les tarifs d’hébergement d’une auberge de charme', 'Annoncer la fermeture des sentiers pendant l’hiver', ['charlevoix', 'brochure']),
            makeQuestion('Quelle expérience est particulièrement mise en avant ?', `${cap(s.attPara)}`, 'Un concours culinaire réunissant des fromagers et artisans', 'Un séjour douillet réservé à une seule saison de l’année', [s.attKw]),
            makeQuestion('Pour quoi la municipalité mentionnée est-elle reconnue ?', 'Ses galeries d’art et son patrimoine architectural préservé', 'Ses grandes pistes de randonnée en altitude et ses auberges', 'Ses randonnées au grand air fermées en hiver', ['galeries', 'patrimoine']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Brochure touristique des Cantons-de-l'Est
    Object.assign(
      (rand) => {
        const slots = [
          { route: 'la célèbre Route des vins', activite: 'la cueillette des pommes dans les vergers ancestraux', mont: 'le mont Orford', montNom: 'du mont Orford', actPara: 'l’autocueillette de fruits au cœur de vergers ancestraux', actKw: 'pommes', montKw: 'orford' },
          { route: 'le circuit des cœurs villageois', activite: 'la détente dans les spas nordiques en plein air', mont: 'le mont Brome', montNom: 'du mont Brome', actPara: 'un moment de ressourcement dans des bains nordiques extérieurs', actKw: 'spas', montKw: 'brome' },
          { route: 'le Chemin des Cantons patrimonial', activite: 'la dégustation de bières de microbrasseries locales', mont: 'le mont Sutton', montNom: 'du mont Sutton', actPara: 'la découverte de bières artisanales brassées sur place', actKw: 'bières', montKw: 'sutton' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DU VISITEUR - LES TRÉSORS DES CANTONS-DE-L’EST\nÀ une heure de route de Montréal, les Cantons-de-l’Est invitent à la douceur de vivre et au dépaysement champêtre. Empruntez ${s.route} pour faire connaissance avec des producteurs locaux réputés. À l’automne, ne manquez pas ${s.activite}, une tradition vivante partagée en famille. Les adeptes de vélo et de marche trouveront leur bonheur sur les pentes entourant ${s.mont}, dont les panoramas sur les collines sont remarquables. Consultez notre carte interactive pour planifier votre circuit et découvrez nos forfaits vacances avantageux combinant nuitée et dégustations.`,
          questions: [
            makeQuestion('Quelle région touristique québécoise ce guide fait-il découvrir ?', 'Les paysages ruraux et les villages des Cantons-de-l’Est', 'Les quartiers urbains animés de la métropole de Montréal', 'Un territoire situé à plus de trois heures de Montréal', ['cantons-de-l’est', 'visiteur']),
            makeQuestion('Quelle activité automnale est recommandée aux familles ?', `${cap(s.actPara)}`, 'Des cours de natation dans un lac glacé en hiver', 'Une escapade printanière réservée aux adultes sans enfants', [s.actKw]),
            makeQuestion('Quel attrait géographique offre des panoramas remarquables ?', `Les pentes aux panoramas remarquables autour ${s.montNom}`, 'Les circuits routiers reliant les producteurs de la région', 'Les pentes peu accessibles aux adeptes de vélo et de marche', ['panoramas', 'collines']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Cérémonie de mariage d'une célébrité québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { celebrite: 'la chanteuse populaire Marianne Lemieux', lieu: 'dans une chapelle historique de l’Île d’Orléans', tenue: 'une robe blanche en dentelle signée par un créateur d’ici', tenPara: 'une création blanche en dentelle conçue par un artisan d’ici', lieuPara: 'Au sein d’une chapelle historique sur l’Île d’Orléans', lieuKw: 'chapelle', tenKw: 'dentelle' },
          { celebrite: 'l’actrice renommée Béatrice Martel', lieu: 'dans un domaine viticole réputé des Laurentides', tenue: 'une élégante robe satinée aux reflets dorés', tenPara: 'une robe satinée aux nuances dorées d’une grande élégance', lieuPara: 'Au cœur d’un vignoble prestigieux des Laurentides', lieuKw: 'domaine', tenKw: 'satinée' },
          { celebrite: 'l’animatrice de télévision Sophie Leduc', lieu: 'au bord de l’eau dans un manoir du Bas-Saint-Laurent', tenue: 'une longue robe fluide bordée de broderies délicates', tenPara: 'une longue toilette vaporeuse rehaussée de fines broderies', lieuPara: 'Près des berges dans une vaste propriété bas-laurentienne', lieuKw: 'manoir', tenKw: 'broderies' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MAGAZINE ÉCHOS VEDETTES - REPORTAGE EXCLUSIF\nC’est dans une atmosphère féerique que s’est déroulé ce samedi le mariage de ${s.celebrite} avec son compagnon de longue date. La cérémonie intime s’est tenue ${s.lieu}, devant une centaine d’invités triés sur le volet. La mariée a ébloui l’assistance en portant ${s.tenue}. Après un échange de vœux émouvant qui a touché leurs proches, la fête s’est poursuivie avec un banquet champêtre mettant en valeur les produits du terroir québécois. Les amoureux ont ensuite dansé sous un ciel étoilé avant de couper le gâteau traditionnel.`,
          questions: [
            makeQuestion('Quel événement mondain ce magazine culturel relate-t-il ?', 'L’union intime d’une personnalité reconnue du milieu artistique', 'Un défilé de mode présenté dans un hôtel du centre-ville', 'Une cérémonie publique ouverte à des milliers de spectateurs', ['mariage', 'compagnon']),
            makeQuestion('Où s’est déroulée la cérémonie officielle d’échange des vœux ?', s.lieuPara, 'Au milieu de la salle du banquet champêtre', 'Dans un stade bondé de supporters enthousiastes', [s.lieuKw]),
            makeQuestion('Quelle attention particulière de la mariée a marqué les convives ?', `${cap(s.tenPara)}`, 'Un échange de vœux bref et sans émotion', 'Un bouquet de fleurs offert à chacun des invités', [s.tenKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Mariage d'un célèbre sportif professionnel
    Object.assign(
      (rand) => {
        const slots = [
          { sportif: 'le capitaine de hockey Alexandre Roy', endroit: 'dans une auberge ancestrale de Charlevoix', cadeau: 'faire des dons à un organisme pour enfants défavorisés', cadPara: 'un groupe venant en aide aux enfants', cadKw: 'enfants' },
          { sportif: 'le patineur médaillé Maxime Tremblay', endroit: 'dans une grange patrimoniale restaurée en Estrie', cadeau: 'contribuer à une fondation de recherche médicale', cadPara: 'la recherche médicale', cadKw: 'médicale' },
          { sportif: 'le joueur étoile David Desbiens', endroit: 'dans un verger privé au pied du mont Saint-Hilaire', cadeau: 'contribuer au financement d’équipements sportifs scolaires', cadPara: 'l’achat de matériel sportif scolaire', cadKw: 'équipements sportifs' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE CÉLÉBRITÉS - UNION HIVERNALE AUX SAVEURS D’ICI\nCe week-end, ${s.sportif} a uni sa destinée à celle de sa conjointe ${s.endroit}. Entourés de leurs coéquipiers et de leurs familles, les amoureux ont célébré leur union dans un décor rustique. Au lieu des traditionnels présents de mariage, le couple a invité ses convives à ${s.cadeau}. Les invités ont savouré un repas inspiré des cabanes à sucre traditionnelles, avec de la tire sur la neige servie en fin de soirée. Un moment magique et authentique que le couple et leurs invités chériront longtemps !`,
          questions: [
            makeQuestion('De quelle célébration d’envergure l’article fait-il le récit ?', 'Du mariage chaleureux d’un sportif célèbre et de sa conjointe', 'D’une rencontre festive des coéquipiers dans une cabane à sucre', 'D’un défilé de mode donné dans un gymnase scolaire', ['mariage', 'union']),
            makeQuestion('Quel geste charitable les mariés ont-ils demandé à leurs invités ?', `Offrir des contributions au profit ${de(s.cadPara)}`, 'Financer eux-mêmes le repas traditionnel servi dans la cabane à sucre', 'Recevoir des présents de mariage coûteux de la part des invités', [s.cadKw]),
            makeQuestion('Quelle surprise gourmande a clôturé la soirée de mariage ?', 'De la tire d’érable servie sur la neige en plein air', 'Un sirop d’érable servi au début de la matinée', 'Des crêpes dorées servies au déjeuner du lendemain matin', ['tire', 'neige']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Brochure touristique de la Gaspésie
    Object.assign(
      (rand) => {
        const slots = [
          { symbole: 'le célèbre rocher Percé', parc: 'le parc national de la Gaspésie', route: 'la mythique route 132 qui longe le golfe marin', symPara: 'une formation géologique emblématique du littoral', symKw: 'rocher percé' },
          { symbole: 'le phare historique de Pointe-à-la-Renommée', parc: 'le parc national Forillon', route: 'le grand tour côtier reliant la mer et les monts', symPara: 'un phare patrimonial surplombant la côte maritime', symKw: 'phare' },
          { symbole: 'les fous de Bassan de l’île Bonaventure', parc: 'la réserve faunique des Chic-Chocs', route: 'le corridor panoramique aux falaises côtières', symPara: 'une colonie impressionnante d’oiseaux marins', symKw: 'île bonaventure' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `DÉPLIANT TOURISME QUÉBEC - CAP SUR LA GASPÉSIE\nPréparez-vous à vivre un voyage sur route spectaculaire en explorant la Gaspésie. Empruntez ${s.route}, où chaque virage dévoile des falaises maritimes et des havres de pêche pittoresques. Admirez ${s.symbole}, véritable joyau naturel, et marchez dans ${s.parc} pour apercevoir des orignaux dans leur habitat sauvage. Les auberges du littoral vous feront déguster le homard frais et des chaudrées préparées selon les traditions des pêcheurs d’autrefois. Une aventure maritime inoubliable vous attend dès votre premier arrêt en bord de mer !`,
          questions: [
            makeQuestion('Quelle région maritime du Québec ce dépliant décrit-il ?', 'La péninsule côtière gaspésienne et ses grands espaces', 'Un grand port industriel abritant des flottes de pêcheurs', 'Une région intérieure sans accès à la mer', ['gaspésie', 'dépliant']),
            makeQuestion('Quel site naturel ou faunique emblématique est mis à l’honneur ?', `${cap(s.symPara)}`, 'Un refuge artificiel d’orignaux aménagé près du littoral', 'Un havre de pêche industriel et désaffecté', [s.symKw]),
            makeQuestion('Quel mets culinaire typique est proposé dans les auberges ?', 'Des crustacés frais et des potages marins traditionnels', 'De la viande fraîche d’orignaux chassés par des pêcheurs', 'Des plats surgelés réchauffés dans les auberges', ['homard', 'chaudrées']),
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
          { couple: 'Mélanie et Sébastien', transport: 'à bord du train transcanadien', sommet: 'les sommets enneigés des Rocheuses canadiennes', retard: 'trois heures de retard causées par un troupeau d’orignaux', retPara: 'un ralentissement de quelques heures provoqué par la faune', retKw: 'orignaux' },
          { couple: 'Audrey et Guillaume', transport: 'en train panoramique avec dôme vitré', sommet: 'les parois vertigineuses de la rivière Fraser', retard: 'deux heures d’attente sur une voie secondaire', retPara: 'une immobilisation temporaire sur une voie de garage', retKw: 'voie' },
          { couple: 'Émilie et David', transport: 'en wagon-lit confortable et chaleureux', sommet: 'les lacs glaciaires d’un bleu éblouissant', retard: 'une pause imprévue pour réparer un aiguillage', retPara: 'une halte technique afin de réparer un équipement ferroviaire', retKw: 'aiguillage' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BILLET DE BLOGUE - NOTRE ÉPOPÉE FERROVIAIRE EN DUO\nBonjour à tous nos abonnés ! ${s.couple} vous écrivent depuis Vancouver après un voyage de deux semaines. Nous avons traversé le pays ${s.transport}, et c’était merveilleux. Chaque matin, nous prenions notre café devant ${s.sommet}. Même si le train a subi ${s.retard}, personne ne s’est plaint : nous en avons profité pour lier conversation avec d’autres voyageurs autour d’un jeu de cartes. Ce voyage nous a appris à ralentir et à contempler la nature. Prochaine étape : une excursion en traversier vers l’île de Vancouver !`,
          questions: [
            makeQuestion('Quel est le sujet principal de ce billet de blogue de voyage ?', 'Le carnet d’une traversée ferroviaire du pays en duo', 'Le compte rendu d’une excursion en traversier vers une île', 'Le carnet d’une traversée à pied du pays en solo', ['ferroviaire', 'voyage']),
            makeQuestion('Quel contretemps sur les voies a prolongé le trajet ?', `${cap(s.retPara)}`, 'Une dispute prolongée entre voyageurs autour d’un jeu de cartes', 'Une panne de machine à café au petit-déjeuner', [s.retKw]),
            makeQuestion('Quelle est la prochaine destination prévue par le couple ?', 'Une traversée maritime par bateau vers l’île voisine', 'Un vol direct de retour depuis l’aéroport de la ville', 'Une longue randonnée à pied vers une île éloignée', ['traversier', 'vancouver']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Blogue de voyage en canot-camping en Mauricie
    Object.assign(
      (rand) => {
        const slots = [
          { auteurs: 'Caroline et Mathieu', duree: 'cinq jours d’immersion totale', plan: 'les lacs calmes du parc national de la Mauricie', mesaventure: 'un orage soudain qui a trempé nos sacs de couchage', mesPara: 'une violente averse ayant mouillé leur matériel de couchage', mesKw: 'couchage' },
          { auteurs: 'Isabelle et Antoine', duree: 'quatre jours de canot-camping', plan: 'la rivière Mistassibi et ses rives boisées', mesaventure: 'la visite nocturne d’un raton laveur gourmand près du feu', mesPara: 'l’incursion nocturne d’un animal attiré par leurs vivres', mesKw: 'raton laveur' },
          { auteurs: 'Sophie et François', duree: 'six jours d’expédition en nature', plan: 'le réservoir Poisson Blanc et ses îles sauvages', mesaventure: 'une pagaie cassée heureusement remplacée par celle de secours', mesPara: 'le bris d’une pagaie remplacée par une pièce de rechange', mesKw: 'pagaie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CARNET D’AVENTURE - RETOUR DE NOTRE SÉJOUR EN NATURE\nNous revoilà en ligne après ${s.duree} en forêt ! Avec mon conjoint, nous avons pagayé sur ${s.plan}. Le silence matinal sur l’eau et le chant des oiseaux resteront gravés dans nos mémoires pour toujours. Évidemment, une belle expédition comporte ses imprévus : nous avons eu ${s.mesaventure}. Heureusement, grâce à notre trousse de survie et à un feu de camp, nous avons séché nos affaires dans la bonne humeur. Pour tous ceux qui hésitent : préparez votre équipement et sautez à l’eau !`,
          questions: [
            makeQuestion('Quelle expérience vécue les blogueurs partagent-ils ?', 'Une randonnée nautique en autonomie de plusieurs jours', 'Un stage de formation aux techniques de survie en forêt', 'Une croisière touristique de quelques heures en bateau', ['pagayé', 'forêt']),
            makeQuestion('Quel désagrément matériel a marqué leur périple ?', `${cap(s.mesPara)}`, 'Une trousse de survie perdue dans les rapides de la rivière', 'Un feu de camp impossible à allumer sous la pluie', [s.mesKw]),
            makeQuestion('Comment ont-ils réagi face à ce contretemps ?', 'En surmontant l’épreuve avec bonne humeur autour du feu', 'En appelant les secours forestiers avec la trousse de survie', 'En abandonnant leur équipement sur la berge', ['feu', 'affaires']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Incident d'eau coupée relaté sur le groupe de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'sur la rue Saint-Zotique Est', heure: 'vers six heures du matin', cause: 'du bris soudain d’une conduite d’eau principale', solidarite: 'ont offert des cruches d’eau potable à leurs voisins âgés', solPara: 'offrir des récipients d’eau aux personnes plus âgées', solKw: 'cruches' },
          { secteur: 'sur la rue Beaubien', heure: 'vers sept heures et demie', cause: 'd’une fuite majeure causée par des travaux de voirie', solidarite: 'ont partagé des bidons d’eau pour préparer le café', solPara: 'partager de l’eau potable pour faciliter les besoins matinaux', solKw: 'bidons' },
          { secteur: 'sur l’avenue Papineau', heure: 'à l’aube ce mardi', cause: 'de l’éclatement d’un tuyau d’aqueduc sous le trottoir', solidarite: 'ont mis à disposition le robinet extérieur de leur cour', solPara: 'ouvrir le robinet de leur cour pour dépanner les voisins', solKw: 'robinet' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GROUPE CITOYEN - SOLIDARITÉ DU QUARTIER ROSEMONT\nChers voisins, voici un résumé de la situation vécue ${s.secteur}. Ce matin ${s.heure}, l’eau s’est déversée sur le trottoir à la suite ${s.cause}. Les cols bleus de la ville sont intervenus rapidement pour fermer les valves, coupant l’eau pour quarante logements. Face à ce désagrément, plusieurs résidents ${s.solidarite}. La municipalité a distribué des bouteilles d’eau devant le dépanneur. La pression reviendra avant vingt heures ce soir. Merci à tous pour votre belle entraide communautaire !`,
          questions: [
            makeQuestion('Quel incident de quartier est décrit dans cette publication ?', 'Une rupture d’aqueduc entraînant une coupure d’eau potable', 'Une inondation majeure au sous-sol d’un dépanneur du secteur', 'Une collision de voitures devant le dépanneur du secteur', ['eau', 'trottoir']),
            makeQuestion('Comment la solidarité entre résidents s’est-elle manifestée ?', `En choisissant ${de(s.solPara)}`, 'En aidant les cols bleus de la ville à fermer les valves d’eau', 'En facturant aux voisins chaque bouteille d’eau offerte par la municipalité', [s.solKw]),
            makeQuestion('Quelle mesure municipale temporaire a été mise en place ?', 'Un approvisionnement en eau potable devant le dépanneur', 'Une coupure d’eau prolongée jusqu’à demain matin', 'Une réparation de la conduite reportée à la semaine prochaine', ['bouteilles', 'dépanneur']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Incident d'arbre tombé dans la ruelle
    Object.assign(
      (rand) => {
        const slots = [
          { ruelle: 'entre les rues Masson et Dandurand', orage: 'de violentes rafales de vent hier soir', degat: 'a arraché deux fils téléphoniques et bloqué trois garages', degPara: 'des fils téléphoniques rompus et des accès de garages obstrués', degKw: 'garages', degX: 'Une palissade de bois endommagée et la circulation piétonne bloquée', degY: 'La destruction d’un abri de jardin sans occasionner de blessures' },
          { ruelle: 'derrière la rue Saint-Hubert', orage: 'd’un orage d’été avec de fortes averses', degat: 'est tombé sur une clôture en bois et obstrue le passage', degPara: 'une palissade de bois endommagée et la circulation piétonne bloquée', degKw: 'clôture', degX: 'Des fils téléphoniques rompus et des accès de garages obstrués', degY: 'La destruction d’un abri de jardin sans occasionner de blessures' },
          { ruelle: 'au sud de l’avenue du Mont-Royal', orage: 'd’un coup de vent soudain en fin d’après-midi', degat: 'a écrasé un cabanon de jardin sans faire de blessé', degPara: 'la destruction d’un abri de jardin sans occasionner de blessures', degKw: 'cabanon', degX: 'Des fils téléphoniques rompus et des accès de garages obstrués', degY: 'Une palissade de bois endommagée et la circulation piétonne bloquée' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FORUM DES HABITANTS - RUELLE SÉCURITÉ ET ENTRAIDE\nPetit retour sur les événements survenus dans notre ruelle ${s.ruelle}. À la suite ${s.orage}, un grand saule s’est abattu en travers du chemin. L’arbre ${s.degat}. Heureusement, aucun passant ne circulait à cet instant. Avant même l’arrivée des équipes municipales d’urgence, plusieurs voisins ont sorti leurs scies pour dégager l’accès aux piétons. Merci à Patrick d’avoir installé des cônes de signalisation. La ville ramassera les branches dès demain matin. Soyez prudents à vélo dans le secteur !`,
          questions: [
            makeQuestion('Quel événement imprévu dans la ruelle est rapporté ?', 'La chute d’un grand arbre provoquée par les intempéries', 'La coupe volontaire d’un petit saule par les voisins du quartier', 'Une dispute entre voisins au sujet des garages du quartier', ['arbre', 'ruelle']),
            makeQuestion('Quel dommage matériel direct cette chute a-t-elle causé ?', `${cap(s.degPara)}`, s.degX, s.degY, [s.degKw]),
            makeQuestion('Quelle action collective spontanée les voisins ont-ils entreprise ?', 'Découper des branchages pour libérer le passage des piétons', 'Attendre sur place l’arrivée de l’équipe municipale d’urgence', 'Laisser la ville ramasser les branches dès ce soir', ['scies', 'piétons']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Récit de voyage en motoneige au Saguenay
    Object.assign(
      (rand) => {
        const slots = [
          { parcours: 'les monts Valin et leurs sapins givrés', etape: 'dans un relais de motoneigistes chauffé au poêle à bois', etaPara: 'dans une halte pour motoneigistes chauffée au bois', etaKw: 'relais' },
          { parcours: 'le tour complet du grand lac Saint-Jean glacé', etape: 'dans une pourvoirie traditionnelle très chaleureuse', etaPara: 'au sein d’une pourvoirie chaleureuse en région', etaKw: 'pourvoirie' },
          { parcours: 'les sentiers boisés qui surplombent le fjord', etape: 'dans un camp rustique au cœur de la forêt boréale', etaPara: 'dans un refuge forestier modeste mais accueillant', etaKw: 'camp' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉCIT D’ÉVASION - NOTRE PREMIER RAID HIVERNAL EN DUO\nBonjour à tous les adeptes du plein air ! Mon conjoint et moi venons de terminer notre première randonnée de motoneige au Saguenay. Pendant quatre jours, nous avons sillonné ${s.parcours}. Les paysages entièrement blancs étaient féeriques. Chaque soir, après avoir affronté un froid vif de moins vingt degrés, nous nous réchauffions ${s.etape}. L’ambiance y était formidable et les habitués nous ont donné de précieux conseils mécaniques. Nous rentrons avec des souvenirs magnifiques et l’envie irrésistible de repartir explorer la Côte-Nord l’hiver prochain !`,
          questions: [
            makeQuestion('Quelle expérience hivernale ce couple partage-t-il sur son blogue ?', 'Une randonnée sur plusieurs jours en motoneige au Saguenay', 'Un stage d’apprentissage de la mécanique pour motoneiges', 'Une excursion d’une journée en traîneau à chiens sur le lac gelé', ['motoneige', 'saguenay']),
            makeQuestion('Où les motoneigistes trouvaient-ils refuge pour la soirée ?', `Ils logeaient ${s.etaPara}`, 'Ils dormaient à la belle étoile près des pistes enneigées', 'Ils logeaient dans un refuge glacial, sans système de chauffage', [s.etaKw]),
            makeQuestion('Quel projet hivernal le couple envisage-t-il déjà pour l’an prochain ?', 'Explorer les grands espaces de la Côte-Nord en motoneige', 'Refaire le même circuit en motoneige autour du Saguenay', 'Renoncer à sortir en motoneige dès l’an prochain pour une autre activité', ['côte-nord', 'hiver']),
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
          { amie: 'Léa', poste: 'd’agente de liaison communautaire', organisme: 'au CLSC de mon quartier', avantage: 'je pourrai y aller à pied tous les matins', avPara: 'la possibilité de se rendre au travail à pied chaque matin', avKw: 'pied' },
          { amie: 'Myriam', poste: 'd’éducatrice spécialisée', organisme: 'dans un centre de pédiatrie sociale', avantage: 'l’équipe est humaine et très soudée', avPara: 'l’ambiance d’équipe particulièrement humaine et soudée', avKw: 'soudée' },
          { amie: 'Sophie', poste: 'de coordonnatrice de projets', organisme: 'dans une coopérative solidaire', avantage: 'l’horaire sur quatre jours me libère mes vendredis', avPara: 'une formule de travail sur quatre jours libérant le vendredi', avKw: 'quatre jours' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - DISCUSSION AVEC ${s.amie.toUpperCase()}\n[14:15] ${s.amie} : Coucou ! J’ai une grande nouvelle : j’ai signé mon contrat aujourd’hui ! J’ai accepté le poste ${s.poste} ${s.organisme}. J’hésitais avec une autre offre mieux payée, mais la mission sociale me rejoint beaucoup plus. En plus, un avantage formidable : ${s.avantage} ! La directrice m’a assuré que je serai bien accompagnée durant ma formation initiale. Je commence officiellement le deux mai. On va pouvoir célébrer ça autour d’un bon café cette fin de semaine si tu es libre !`,
          questions: [
            makeQuestion('Quelle décision importante l’amie annonce-t-elle par message ?', 'L’acceptation d’un contrat au sein d’un organisme social', 'La signature d’une offre d’emploi beaucoup mieux payée', 'Le report de son entrée en fonction à l’automne prochain', ['contrat', 'poste']),
            makeQuestion('Quelle raison principale a fait pencher la balance en faveur de ce poste ?', 'La concordance avec ses valeurs et la mission sociale du groupe', 'Une proposition salariale nettement plus avantageuse que les autres offres', 'Un salaire nettement plus élevé que celui de l’autre offre reçue', ['mission', 'sociale']),
            makeQuestion('Quel avantage pratique du quotidien la réjouit particulièrement ?', `${cap(s.avPara)}`, 'Une dispense complète de toute formation initiale en arrivant', 'Une formation initiale qu’elle doit suivre seule, sans aide', [s.avKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Clavardage acceptation de poste en éducation
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Catherine', poste: 'de technicienne en documentation', institution: 'à la bibliothèque du cégep', raison: 'la sécurité d’emploi et le régime de retraite', raiPara: 'la stabilité professionnelle et un bon régime de retraite', raiKw: 'retraite' },
          { amie: 'Audrey', poste: 'd’animatrice de vie étudiante', institution: 'dans une école secondaire locale', raison: 'le contact stimulant avec les adolescents', raiPara: 'les relations dynamiques et quotidiennes avec les adolescents', raiKw: 'adolescents' },
          { amie: 'Nadia', poste: 'de conseillère d’orientation', institution: 'au centre pour adultes', raison: 'l’aide pratique apportée aux nouveaux arrivants', raiPara: 'le soutien concret accordé aux nouveaux arrivants', raiKw: 'nouveaux arrivants' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - ANNONCE OFFICIELLE DE CARRIÈRE\n[10:32] ${s.amie} : Salut ! Je voulais t’expliquer pourquoi j’ai accepté l’offre ${s.poste} ${s.institution}. Après avoir travaillé à contrat dans l’incertitude, ce poste m’apporte exactement ce dont j’avais besoin : ${s.raison}. Même si le processus de sélection a été long avec trois entrevues, la directrice m’a fait une excellente impression. Mes futurs collègues sont accueillants et le bureau est très lumineux. J’entre en poste lundi prochain. Je suis tellement soulagée de cette stabilité !`,
          questions: [
            makeQuestion('Quelle orientation de carrière est partagée par l’amie ?', 'L’acceptation d’un engagement dans le réseau éducatif', 'Le renouvellement d’un contrat temporaire dans l’incertitude', 'Le refus de tout poste offert dans le réseau éducatif', ['poste', 'offre']),
            makeQuestion('Quel aspect du travail répondait exactement à ses attentes prioritaires ?', `Ce poste lui apporte ${s.raiPara}`, 'Un long trajet quotidien en transport en commun jusqu’au bureau', 'Des heures supplémentaires obligatoires chaque fin de semaine', [s.raiKw]),
            makeQuestion('Quand doit-elle commencer officiellement son nouvel emploi ?', 'Dès le début de la semaine suivante suite à son embauche', 'Un mois après la signature de son nouveau contrat', 'Dès la fin de la semaine précédente, sans attendre lundi', ['lundi', 'poste']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Courriel refusant de participer à la journée d'insertion
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc-André Tremblay', motif: 'la livraison urgente du rapport financier annuel', offre: 'de préparer les dépliants promotionnels', motPara: 'l’achèvement impératif du rapport financier annuel', offPara: 'confectionner le matériel promotionnel dès le mardi', motKw: 'financier', offKw: 'dépliants' },
          { collegue: 'Vincent Bouchard', motif: 'une formation obligatoire en santé et sécurité', offre: 'de rédiger le compte rendu complet de la rencontre', motPara: 'une session imposée en matière de sécurité du travail', offPara: 'rédiger l’ensemble du compte rendu de la rencontre', motKw: 'sécurité', offKw: 'compte rendu' },
          { collegue: 'Simon Pelletier', motif: 'un audit externe qui mobilise toute notre équipe', offre: 'd’accueillir les nouveaux lors de la séance suivante', motPara: 'une vérification externe mobilisant l’ensemble du service', offPara: 'prendre en charge l’accueil lors d’une séance ultérieure', motKw: 'audit', offKw: 'accueillir' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL PROFESSIONNEL\nDe : ${s.collegue}\nÀ : Comité d’insertion professionnelle\nObjet : Absence motivée - Journée d’insertion du 18 octobre\nBonjour à tous,\nJe vous informe avec regret que je ne pourrai pas participer à notre journée d’insertion professionnelle jeudi prochain. En effet, je dois finaliser en priorité ${s.motif}, dont l’échéance a été devancée à vendredi matin par la direction. Cette charge de travail m’empêche de me libérer pour la journée. Toutefois, pour soutenir le comité, je me propose ${s.offre} dès ce mardi. Je vous souhaite une belle journée d’échanges et je reste disponible au besoin.`,
          questions: [
            makeQuestion('Quel est l’objet principal de ce courriel professionnel ?', 'La justification polie d’un empêchement à une activité interne', 'Une demande de report de l’échéance fixée par la direction', 'Une proposition d’animer en personne la journée d’insertion prévue jeudi', ['insertion', 'absence']),
            makeQuestion('Quelle contrainte professionnelle majeure justifie cette absence ?', `${cap(s.motPara)}`, 'Une échéance repoussée à la semaine suivante par la direction', 'La journée d’insertion fixée au vendredi matin', [s.motKw]),
            makeQuestion('Quelle aide concrète le collègue propose-t-il d’apporter malgré tout ?', `Il offre de ${s.offPara}`, 'Reporter à la semaine suivante la livraison demandée par la direction', 'Il propose de participer à la journée d’insertion jeudi', [s.offKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Courriel d'un collègue déclinant la journée de réseautage
    Object.assign(
      (rand) => {
        const slots = [
          { expediteur: 'Alexandre Roy', obligation: 'un rendez-vous médical spécialisé pour ma fille à l’hôpital', compensation: 'transmettre mes fiches d’information par courriel', oblPara: 'un rendez-vous de santé pour son enfant fixé de longue date', comPara: 'acheminer ses fiches de renseignements par voie électronique', oblKw: 'fille', comKw: 'fiches' },
          { expediteur: 'Patrick Lavoie', obligation: 'une convocation judiciaire comme témoin civique', compensation: 'enregistrer une brève capsule vidéo de bienvenue', oblPara: 'une obligation civique de témoignage auprès de la justice', comPara: 'préparer un court enregistrement vidéo de bienvenue', oblKw: 'témoin', comKw: 'vidéo' },
          { expediteur: 'Guillaume Simard', obligation: 'une soutenance universitaire obligatoire pour mon diplôme', compensation: 'animer la rencontre virtuelle de suivi la semaine prochaine', oblPara: 'une obligation universitaire fixée de longue date pour son diplôme', comPara: 'coordonner la séance de suivi en ligne la semaine suivante', oblKw: 'diplôme', comKw: 'virtuelle' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE ÉLECTRONIQUE INTERNE\nDe : ${s.expediteur}\nÀ : Direction des ressources humaines\nObjet : Absence à l’activité d’intégration\nChers collègues,\nJe tiens à vous aviser que je ne pourrai malheureusement pas me joindre à vous ce vendredi pour l’accueil des nouveaux employés. J’ai ${s.obligation}, une démarche fixée de longue date que je ne peux reporter. Je regrette sincèrement de manquer cette occasion d’échanger avec nos nouvelles recrues. Afin de soutenir le groupe malgré tout, je m’engage à ${s.compensation} avant mercredi midi. Merci beaucoup pour votre compréhension et bonne journée d’accueil à tous !`,
          questions: [
            makeQuestion('Pourquoi l’employé écrit-il ce message à la direction ?', 'Pour exposer les motifs de son absence à l’accueil des recrues', 'Pour annuler l’activité d’intégration des nouvelles recrues', 'Pour se porter volontaire afin d’animer l’accueil des recrues ce vendredi', ['absence', 'intégration']),
            makeQuestion('Quelle raison impérative empêche sa présence ce vendredi ?', `${cap(s.oblPara)}`, 'Un devoir de participer à l’accueil des recrues ce vendredi', 'Une démarche qu’il pouvait facilement reporter à plus tard', [s.oblKw]),
            makeQuestion('Quelle solution alternative l’employé propose-t-il pour s’impliquer ?', `Il s’engage à ${s.comPara}`, 'Accueillir les nouvelles recrues en personne dès le mercredi midi', 'Remettre son travail seulement après l’accueil du vendredi', [s.comKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Clavardage acceptation d'une offre en région
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Isabelle', ville: 'à Rimouski', poste: 'de rédactrice scientifique', cadre: 'un cadre de vie paisible au bord du fleuve', cadPara: 'un environnement apaisant à proximité du fleuve', cadKw: 'fleuve' },
          { amie: 'Florence', ville: 'à Chicoutimi', poste: 'd’ingénieure en environnement', cadre: 'un accès direct aux sentiers de plein air', cadPara: 'la proximité immédiate des parcours de grand air', cadKw: 'sentiers' },
          { amie: 'Mélanie', ville: 'à Rouyn-Noranda', poste: 'd’agente culturelle', cadre: 'une communauté solidaire sans bouchons de circulation', cadPara: 'une ville solidaire épargnée par les congestions', cadKw: 'circulation' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CLAVARDAGE - DÉPART VERS UNE NOUVELLE RÉGION\n[16:45] ${s.amie} : Salut ! J’ai une grande décision à t’annoncer : j’ai dit oui pour le poste ${s.poste} ${s.ville} ! Je quitte la métropole le mois prochain. J’ai longuement réfléchi, mais ce qui a emporté mon choix, c’est ${s.cadre}. Même si mes amis vont me manquer, mon employeur m’accorde une aide financière pour mon déménagement et un horaire flexible. C’est un nouveau départ formidable. Je prépare un souper d’au revoir chez moi samedi prochain, viens fêter avec nous !`,
          questions: [
            makeQuestion('Quelle décision majeure l’amie partage-t-elle dans ce message ?', 'Son choix d’accepter un travail et d’aller s’établir en région', 'Son choix de refuser l’offre pour rester auprès de ses amis', 'Son départ de la métropole prévu dès le mois dernier', ['poste', 'région']),
            makeQuestion('Quel facteur principal a motivé son départ vers sa nouvelle ville ?', `${cap(s.cadPara)}`, 'Le désir de se rapprocher de sa famille installée là-bas', 'La possibilité de changer de carrière vers l’enseignement', [s.cadKw]),
            makeQuestion('Quelle aide concrète son nouvel employeur lui accorde-t-il ?', 'Une allocation pour faciliter les frais de son déménagement', 'La prise en charge intégrale de son souper d’au revoir', 'Un horaire très rigide imposé par son nouvel employeur', ['déménagement', 'financière']),
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
          { organisme: 'la Régie de l’assurance maladie (RAMQ)', identifiant: 'votre numéro d’assurance maladie à douze caractères', confirmation: 'un numéro de confirmation officiel à sept chiffres', conPara: 'un code chiffré de confirmation officiel à conserver', conKw: 'confirmation' },
          { organisme: 'Revenu Québec et Retraite Québec', identifiant: 'votre numéro d’assurance sociale et votre code postal', confirmation: 'un accusé de réception électronique téléchargeable', conPara: 'un reçu officiel téléchargeable confirmant l’envoi', conKw: 'réception' },
          { organisme: 'la Société de l’assurance automobile (SAAQ)', identifiant: 'votre numéro de permis de conduire et votre date de naissance', confirmation: 'un avis de validation transmis par courriel sécurisé', conPara: 'un message électronique officiel validant l’opération', conKw: 'validation' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE QUÉBÉCOIS DE CHANGEMENT D’ADRESSE\nPour mettre à jour votre adresse auprès de ministères dont ${s.organisme}, suivez ces quatre étapes. Étape 1 : Accédez au portail du gouvernement du Québec et sélectionnez « Déménagement ». Étape 2 : Confirmez votre identité en saisissant ${s.identifiant}. Étape 3 : Inscrivez votre nouvelle adresse et la date de votre emménagement. Étape 4 : Révisez le formulaire et cliquez sur « Transmettre ». Le système générera ${s.confirmation}. Conservez précieusement ce document pour vos dossiers administratifs.`,
          questions: [
            makeQuestion('Quelle démarche citoyenne ce guide gouvernemental explique-t-il ?', 'La communication d’une nouvelle adresse aux ministères provinciaux', 'La suppression de son dossier auprès des ministères provinciaux et fédéraux', 'Un changement d’adresse effectué par courrier au guichet', ['changement', 'adresse']),
            makeQuestion('Quelle information personnelle doit-on saisir à la seconde étape ?', 'La combinaison identifiante officielle requise par le portail', 'La date précise de son emménagement dans le nouveau logement', 'Votre numéro de téléphone cellulaire, à l’étape suivante', ['identité', 'saisissant']),
            makeQuestion('Que doit conserver le citoyen à la fin de la démarche en ligne ?', `${cap(s.conPara)}`, 'Une copie papier du formulaire révisé avant la transmission', 'Rien, car le système conserve le document à votre place', [s.conKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure mise à jour profil SAAQclic
    Object.assign(
      (rand) => {
        const slots = [
          { document: 'votre permis de conduire officiel', service: 'sur SAAQclic avec votre compte ClicSÉQUR', avis: 'un avis de confirmation par la poste sous dix jours', aviPara: 'un courrier de confirmation sous une dizaine de jours', aviKw: 'dix jours' },
          { document: 'votre dossier de conducteur automobile', service: 'sur l’espace client sécurisé de la SAAQ', avis: 'une nouvelle étiquette autocollante d’adresse', aviPara: 'une nouvelle étiquette autocollante avec son adresse', aviKw: 'autocollante' },
          { document: 'vos pièces d’immatriculation de véhicule', service: 'sur le portail citoyen gouvernemental', avis: 'un message dans votre boîte de réception sécurisée', aviPara: 'une notification officielle dans son espace de réception', aviKw: 'réception' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE D’UTILISATION - DOSSIER CONDUCTEUR SAAQ\nLa loi exige d’aviser la Société de l’assurance automobile dans les trente jours suivant un déménagement pour ${s.document}. Voici la démarche. Connectez-vous d’abord ${s.service}. Rendez-vous dans la section « Coordonnées » et cliquez sur « Modifier mon adresse ». Entrez votre nouveau code postal et votre numéro de logement. Vérifiez l’exactitude des données et validez la transaction. Vous recevrez ${s.avis}. Si votre ancienne adresse figure encore sur vos pièces après trente jours, vous risquez une amende lors d’un contrôle routier.`,
          questions: [
            makeQuestion('Dans quel délai un citoyen doit-il mettre à jour son adresse à la SAAQ ?', 'Dans les trente jours consécutifs à son changement de domicile', 'Dans un délai strict de dix jours consécutifs au déménagement', 'Au terme d’une période administrative d’une année civile complète', ['trente jours', 'déménagement']),
            makeQuestion('Où doit-on se connecter pour faire cette modification par Internet ?', 'Sur le portail officiel désigné pour la gestion du profil', 'Au guichet d’une succursale, sans passer par Internet ni téléphone', 'Dans la section « Coordonnées », avant toute connexion', ['connectez-vous', 'section']),
            makeQuestion('Que reçoit le conducteur après avoir validé son changement en ligne ?', `${cap(s.aviPara)}`, 'Un avis officiel d’amende forfaitaire de contrôle routier', 'Un avis indiquant que le changement a été refusé', [s.aviKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure d'installation d'une imprimante Wi-Fi
    Object.assign(
      (rand) => {
        const slots = [
          { modele: 'l’imprimante multifonction sans fil', reseau: 'à votre réseau Wi-Fi domestique', bouton: 'le bouton Wi-Fi pendant trois secondes', test: 'imprimer une page de test pour vérifier la qualité', tesPara: 'lancer l’impression d’un feuillet d’essai', tesKw: 'page de test' },
          { modele: 'l’imprimante laser noir et blanc', reseau: 'au réseau Internet local du bureau', bouton: 'la touche WPS de votre routeur', test: 'lancer l’impression du document d’accueil', tesPara: 'lancer le tirage du document d’accueil', tesKw: 'document d’accueil' },
          { modele: 'l’appareil à jet d’encre couleur', reseau: 'à votre connexion sans fil personnelle', bouton: 'l’icône Réseau sur l’écran tactile', test: 'exécuter l’alignement des têtes d’impression', tesPara: 'procéder au calibrage des têtes d’impression', tesKw: 'têtes d’impression' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DE DÉMARRAGE - INSTALLATION D’IMPRIMANTE\nPour configurer ${s.modele} sur votre ordinateur, suivez ces instructions. 1. Branchez le cordon d’alimentation et allumez l’appareil. 2. Connectez l’imprimante ${s.reseau} en maintenant enfoncé ${s.bouton}. 3. Sur votre ordinateur, ouvrez les « Paramètres », cliquez sur « Imprimantes », puis sélectionnez « Ajouter un appareil ». Votre ordinateur détectera automatiquement l’imprimante. 4. Téléchargez le pilote recommandé et terminez en prenant soin ${de(s.test)}. En cas d’erreur de détection, redémarrez votre routeur avant de réessayer.`,
          questions: [
            makeQuestion('Quel équipement informatique ce guide aide-t-il à installer ?', 'Une nouvelle imprimante sans fil reliée à son ordinateur', 'Un routeur sans fil assurant la liaison Internet du bureau', 'Un ordinateur à installer avant l’imprimante', ['imprimante', 'configurer']),
            makeQuestion('Quelle manipulation permet de connecter l’imprimante au réseau ?', 'Appuyer de façon prolongée sur la commande réseau indiquée', 'Débrancher le cordon d’alimentation électrique pendant trois secondes', 'Relâcher aussitôt la commande réseau, dès la première touche', ['maintenant', 'enfoncé']),
            makeQuestion('Quelle action finale permet de valider le bon fonctionnement ?', `Il convient de ${s.tesPara}`, 'Redémarrer le routeur réseau dès le premier branchement', 'Il convient de supprimer le pilote après son installation', [s.tesKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Configuration d'une imprimante par câble USB
    Object.assign(
      (rand) => {
        const slots = [
          { port: 'un port USB libre de votre ordinateur', cartouche: 'les rubans de protection orange des cartouches', site: 'le site officiel d’assistance du fabricant', carPara: 'retirer les adhésifs de sécurité protégeant les cartouches', carKw: 'cartouches' },
          { port: 'la prise USB à l’arrière de l’ordinateur', cartouche: 'les languettes de sécurité du toner laser', site: 'la page de téléchargement des pilotes officiels', carPara: 'dégager les attaches de protection bloquant le toner laser', carKw: 'toner laser' },
          { port: 'l’adaptateur USB fourni avec votre appareil', cartouche: 'les bandes adhésives de protection', site: 'le centre de soutien technique en ligne', carPara: 'ôter soigneusement toutes les bandes collantes de protection', carKw: 'adhésives' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE D’INSTALLATION - CONNEXION FILAIRE USB\nPour relier votre imprimante sans passer par le réseau sans fil, respectez ces étapes simples. 1. Retirez tous les emballages et enlevez ${s.cartouche}. 2. Insérez le papier dans le bac et allumez l’appareil. 3. Rendez-vous sur ${s.site} pour installer le logiciel requis avant de brancher le câble. 4. Lorsque le programme vous y invite, branchez le câble USB reliant l’imprimante à ${s.port}. Le système terminera la configuration en quelques secondes. Imprimez une page d’essai pour confirmer que la liaison est réussie.`,
          questions: [
            makeQuestion('Quelle méthode de raccordement de l’imprimante est détaillée ici ?', 'Une liaison filaire par câble USB, sans passer par le réseau', 'Une liaison passant par le réseau sans fil de la maison, sans câble', 'Une connexion sans fil automatique entre les deux appareils', ['imprimante', 'câble usb']),
            makeQuestion('Que faut-il faire avant de brancher le câble physique ?', 'Installer d’abord le programme téléchargé sur la page de soutien', 'Imprimer au préalable une page d’essai pour vérifier le bac de papier', 'Brancher le câble USB avant d’installer le logiciel requis', ['logiciel', 'brancher']),
            makeQuestion('Quel élément de protection doit-on enlever au début ?', `Il faut ${s.carPara}`, 'Le film protecteur collé sur le panneau de commande', 'Le capot protecteur fixé sous le couvercle du scanneur', [s.carKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Mise à jour des renseignements bancaires en ligne
    Object.assign(
      (rand) => {
        const slots = [
          { institution: 'votre coopérative Desjardins', champ: 'votre numéro de téléphone et votre courriel', securite: 'un code de sécurité temporaire par message texte', instruction: 'Entrez ce code dans la case requise et confirmez', secPara: 'un code temporaire de validation reçu par message texte', secKw: 'message texte' },
          { institution: 'la Banque Nationale', champ: 'votre adresse postale et votre employeur', securite: 'un mot de passe unique sur votre application', instruction: 'Saisissez ce mot de passe unique pour confirmer', secPara: 'une clé d’accès unique transmise sur l’application bancaire', secKw: 'application' },
          { institution: 'la Banque Royale', champ: 'vos coordonnées personnelles et vos avis', securite: 'une notification d’approbation sur votre appareil', instruction: 'Validez cette notification d’approbation pour confirmer', secPara: 'un avis d’approbation sécurisé à confirmer sur l’appareil', secKw: 'notification' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PROCÉDURE BANCAIRE - MISE À JOUR DE VOTRE DOSSIER\nMaintenez vos coordonnées à jour pour assurer la sécurité de vos comptes chez ${s.institution}. Suivez ce guide depuis votre ordinateur. Étape 1 : Ouvrez votre session avec votre identifiant et votre mot de passe habituels. Étape 2 : Cliquez sur « Paramètres du compte », puis choisissez « Renseignements personnels ». Étape 3 : Modifiez ${s.champ}. Étape 4 : Pour valider votre identité, vous recevrez ${s.securite}. ${s.instruction}. Vos nouvelles informations entreront en vigueur immédiatement sur vos comptes.`,
          questions: [
            makeQuestion('Quelle opération de gestion ce tutoriel permet-il de réaliser ?', 'Actualiser ses coordonnées personnelles sur son portail bancaire', 'Modifier le mot de passe habituel servant à ouvrir sa session', 'Consulter ses coordonnées bancaires, sans rien y modifier ni valider', ['coordonnées', 'sécurité']),
            makeQuestion('Quel moyen de sécurité est utilisé pour confirmer l’identité ?', `${cap(s.secPara)}`, 'Un document à envoyer à la banque pour valider son identité', 'Un nouveau mot de passe choisi à la première étape', [s.secKw]),
            makeQuestion('Quand les modifications enregistrées prennent-elles effet ?', 'Dès la validation de l’étape de confirmation de sécurité', 'Après une période d’attente de plusieurs jours ouvrables', 'Le lendemain de la validation, une fois la session fermée', ['valider', 'immédiatement']),
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
          { amie: 'Geneviève', collation: 'des muffins maison aux carottes et à l’avoine sans sucre', fruit: 'des tranches de pomme avec du yogourt nature', regle: 'règle stricte interdisant les noix et les arachides', colPara: 'des gâteaux légers aux légumes râpés préparés sans sucre', colKw: 'muffins' },
          { amie: 'Isabelle', collation: 'des boules d’énergie aux dattes et graines de tournesol', fruit: 'des bâtonnets de concombre avec un houmous doux', regle: 'politique sans graines de sésame ni fruits à coque', colPara: 'des friandises nutritives faites de fruits séchés et de graines', colKw: 'dattes' },
          { amie: 'Véronique', collation: 'des biscuits tendres aux bananes et graines de chia', fruit: 'des cubes de melon avec du fromage cheddar doux', regle: 'consigne stricte concernant la liste sans allergènes', colPara: 'des douceurs cuisinées avec des bananes écrasées et des graines', colKw: 'bananes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL AMICAL - IDÉES DE COLLATIONS ÉCOLE\nDe : ${s.amie} Bouchard\nÀ : Marie-Ève Gagnon\nObjet : Mes recettes faciles de collations pour la rentrée !\nChère Marie-Ève,\nTu me disais hier que tu manquais d’idées pour les collations des enfants. Voici mes trouvailles nutritives préférées ! Chaque dimanche, je cuisine ${s.collation}. C’est économique et riche en fibres. Pour la collation du matin, j’ajoute toujours ${s.fruit}. N’oublie pas que l’école applique une ${s.regle}, alors évite les beurres d’amandes industriels. Si tu veux, je t’enverrai mes recettes complètes par courriel ce soir. Dis-moi si tes enfants aiment ça ! Bises, ${s.amie}`,
          questions: [
            makeQuestion('Quel est le thème des suggestions partagées dans ce courriel ?', 'Des propositions saines d’en-cas scolaires pour enfants', 'Une sélection de beurres d’amandes industriels pour la rentrée', 'Des recettes de collations pour les adultes au bureau', ['collations', 'école']),
            makeQuestion('Quelle collation maison l’amie prépare-t-elle le dimanche ?', `${cap(s.colPara)}`, 'Des tartines garnies de beurres d’amandes vendus en magasin', 'Des biscuits achetés en magasin, chers et pauvres en fibres', [s.colKw]),
            makeQuestion('Quelle consigne scolaire rappelle-t-elle pour la sécurité ?', 'L’absence de certains allergènes pour préserver la santé des élèves', 'L’obligation d’apporter des beurres d’amandes industriels', 'L’interdiction formelle d’apporter toute collation préparée à la maison', ['école', 'beurres']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Courriel collations santé pour la garderie
    Object.assign(
      (rand) => {
        const slots = [
          { maman: 'Audrey', snack: 'des mini-galettes de riz à la purée de courge', salade: 'une salade de fruits frais coupés en dés', conseil: 'de préparer les portions dans des petits contenants réutilisables', snaPara: 'des galettes de riz complétées de purée de courge', snaKw: 'galettes de riz' },
          { maman: 'Nathalie', snack: 'des barres tendres maison à l’avoine et canneberges', salade: 'des bouquets de brocoli avec trempette légère', conseil: 'de congeler la moitié de la recette pour gagner du temps', snaPara: 'des barres à l’avoine et canneberges cuisinées maison', snaKw: 'barres tendres' },
          { maman: 'Mélanie', snack: 'des galettes moelleuses aux pommes et graines de lin', salade: 'des pointes de pita complet avec du guacamole', conseil: 'd’impliquer les enfants pour leur donner envie de goûter', snaPara: 'des galettes tendres préparées avec des pommes et des graines de lin', snaKw: 'pommes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE AMICAL - ASTUCES COLLATIONS GARDERIE\nDe : ${s.maman} Tremblay\nÀ : Julie Fortin\nObjet : Recommandations de collations saines pour la garderie !\nAllô Julie ! Comme promis, voici mes conseils pour les collations de nos tout-petits. Pour remplacer les biscuits trop sucrés de l’épicerie, j’ai adopté ${s.snack}. Les enfants adorent la texture et ça leur donne une énergie durable sans coup de fatigue. J’accompagne toujours le tout avec ${s.salade}. Mon astuce préférée pour le matin : ${s.conseil}. Ça prend vingt minutes le dimanche et ta semaine est prête. Essaie ça et donne-m’en des nouvelles au parc !`,
          questions: [
            makeQuestion('Quel est le principal objectif des conseils culinaires partagés ?', 'Privilégier des options saines aux produits sucrés du commerce', 'Organiser une collecte de fonds pour acheter du matériel de jeu', 'Présenter une nouvelle marque de céréales pour les enfants', ['collations', 'garderie']),
            makeQuestion('Quelle collation nutritive maison propose-t-elle pour les enfants ?', `${cap(s.snaPara)}`, 'Des paquets de biscuits sucrés achetés à l’épicerie du coin', 'Des biscuits sucrés préparés le lundi soir, en quinze minutes', [s.snaKw]),
            makeQuestion('Quelle astuce d’organisation pratique recommande-t-elle ?', 'Cuisiner le dimanche pour préparer les collations de la semaine', 'Acheter des biscuits sucrés à l’épicerie du coin pour gagner du temps', 'Préparer les collations le matin même, à la dernière minute', ['dimanche', 'astuce']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Conseils d'Hydro-Québec pour économiser l'eau chaude
    Object.assign(
      (rand) => {
        const slots = [
          { produit: 'une pomme de douche à débit réduit certifiée WaterSense', reduction: 'quarante pour cent de consommation d’eau chaude', geste: 'laver vos vêtements à l’eau froide dans la laveuse', proPara: 'une douchette à débit contrôlé certifiée pour l’économie d’eau', proKw: 'watersense' },
          { produit: 'des aérateurs de robinet à faible débit pour la maison', reduction: 'trente pour cent d’énergie liée au chauffe-eau', geste: 'prendre des douches courtes de moins de cinq minutes', proPara: 'des embouts aérateurs adaptés réduisant le flux des robinets', proKw: 'aérateurs' },
          { produit: 'un régulateur de pression pour chauffe-eau domestique', reduction: 'deux cents dollars par an sur votre facture d’électricité', geste: 'réparer rapidement tout robinet qui fuit dans l’appartement', proPara: 'un régulateur limitant la pression du chauffe-eau domestique', proKw: 'régulateur' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PAGE WEB CONSEILS ÉNERGIE - HYDRO-QUÉBEC\nLe chauffage de l’eau représente près de vingt pour cent de votre facture d’électricité. Pour réduire vos coûts tout en préservant l’environnement, nous vous recommandons d’installer ${s.produit}. Cet équipement simple permet d’économiser ${s.reduction} sans sacrifier votre confort. En complément, pensez à ${s.geste}. Vérifiez également que la température de votre chauffe-eau est réglée à soixante degrés Celsius : c’est le niveau idéal pour prévenir les bactéries tout en évitant le gaspillage d’énergie. Consultez nos rabais instantanés en quincaillerie participante dès aujourd’hui !`,
          questions: [
            makeQuestion('Quel est le thème principal de cette page Web d’information ?', 'Des mesures pour modérer sa dépense d’énergie liée à l’eau chaude', 'Un guide pour choisir un nouveau chauffe-eau résidentiel', 'Des instructions pour entretenir le système de chauffage du logement', ['chauffage', 'facture']),
            makeQuestion('Quel équipement économiseur d’eau chaude est recommandé ?', `${cap(s.proPara)}`, 'Un baril de pluie pour arroser le jardin', 'Un bain tourbillon chauffé en continu à la maison', [s.proKw]),
            makeQuestion('Quelle température idéale est recommandée pour le réservoir ?', 'Un maintien stable du réservoir à soixante degrés Celsius', 'Un arrêt complet du chauffe-eau pour éliminer les bactéries', 'Un réglage à quarante degrés Celsius pour économiser l’énergie', ['soixante degrés', 'chauffe-eau']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Guide écologique d'achat de produits économiseurs d'eau
    Object.assign(
      (rand) => {
        const slots = [
          { dispositif: 'un mitigeur thermostatique avec bouton d’arrêt temporaire', avantage: 'bloquer l’eau pendant qu’on se savonne', retour: 'rentabilisé en trois mois d’utilisation', disPara: 'un mitigeur thermostatique pourvu d’une coupure momentanée', disKw: 'thermostatique' },
          { dispositif: 'un tuyau de douche avec coupe-débit intégré', avantage: 'réduire le débit à six litres par minute', retour: 'amorti sur votre première facture d’énergie', disPara: 'un tuyau de douche doté d’un mécanisme coupe-débit intégré', disKw: 'coupe-débit' },
          { dispositif: 'des embouts régulateurs de débit pour robinetterie', avantage: 'mélanger de l’air à l’eau pour garder une bonne pression', retour: 'très peu coûteux et posé sans outils en cinq minutes', disPara: 'des adaptateurs de débit mélangeant l’air pour la robinetterie', disKw: 'embouts' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE MAISON ÉCOLOGIQUE - DISPOSITIFS D’EAU\nPour réduire votre consommation d’énergie à la maison, le remplacement de vos accessoires de plomberie est une excellente décision. Lors de votre visite en quincaillerie, privilégiez ${s.dispositif}. Ce produit offre l’avantage de ${s.avantage}. Cet achat est rapidement ${s.retour}. N’oubliez pas de mesurer le diamètre de vos tuyaux avant l’achat afin de choisir le modèle compatible. Enfin, profitez des programmes de votre municipalité, qui offre souvent des trousses gratuites de produits économiseurs d’eau sur présentation d’une preuve de résidence.`,
          questions: [
            makeQuestion('Que conseille cet article aux occupants de logements ?', 'Poser des éléments de plomberie limitant le débit d’eau chaude', 'Remplacer tous les tuyaux de sa maison par un diamètre plus grand', 'Retirer les accessoires de plomberie pour réduire les coûts', ['consommation', 'plomberie']),
            makeQuestion('Quel accessoire de plomberie économe est valorisé ?', `${cap(s.disPara)}`, 'Un tuyau de grand diamètre raccordé sans dispositif de coupure', 'Un robinet incompatible avec le diamètre des tuyaux', [s.disKw]),
            makeQuestion('Comment peut-on parfois obtenir ces équipements sans frais ?', 'Par l’entremise de trousses remises par son administration locale', 'Par un prêt gratuit d’outils de plomberie offert à la bibliothèque', 'Par un échange gratuit de vieux appareils au magasin du coin', ['municipalité', 'trousses']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Courriel collations santé pour le sport
    Object.assign(
      (rand) => {
        const slots = [
          { entraineur: 'Sophie', collation: 'des quartiers d’orange et des galettes à l’avoine', boisson: 'de l’eau fraîche dans une gourde bien identifiée', boiPara: 'De l’eau fraîche conservée dans une gourde bien identifiée', boiKw: 'gourde', colPara: 'des portions d’orange associées à des galettes d’avoine', colKw: 'orange' },
          { entraineur: 'Valérie', collation: 'des raisins sans pépins et des morceaux de fromage', boisson: 'une eau fraîche infusée avec du citron et de la menthe', boiPara: 'De l’eau fraîche infusée au citron et à la menthe', boiKw: 'citron', colPara: 'des raisins frais accompagnés de cubes de fromage', colKw: 'raisins' },
          { entraineur: 'Chantal', collation: 'des bananes mûres et des barres tendres maison', boisson: 'de l’eau plate sans ajout de sucre ni de jus', boiPara: 'De l’eau plate exempte de tout ajout de sucre ou de jus', boiKw: 'sucre', colPara: 'des bananes complétées de barres tendres faites maison', colKw: 'bananes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE DU CLUB SPORTIF - COLLATIONS TOURNOI DE SOCCER\nDe : ${s.entraineur} Roy, entraîneuse jeunesse\nÀ : Parents des joueurs de la ligue récréative\nObjet : Recommandations nutritionnelles pour le tournoi\nChers parents,\nEn vue de notre tournoi de soccer de samedi, voici quelques suggestions pour garder nos jeunes sportifs en forme. Entre deux matchs intenses, privilégiez ${s.collation}. Les glucides naturels aident à reconstituer l’énergie sans alourdir la digestion. Pour l’hydratation, la seule boisson nécessaire est ${s.boisson}. Évitez les boissons énergisantes et les jus très sucrés qui causent des maux de ventre pendant l’effort. Merci de votre précieuse collaboration et bon match à tous !`,
          questions: [
            makeQuestion('Quel est l’objectif de cette note transmise par l’entraîneuse ?', 'Conseiller des en-cas équilibrés pour des jeunes lors d’un tournoi', 'Reporter à plus tard l’ensemble des matchs du tournoi de soccer de samedi', 'Interdire les collations aux jeunes sportifs pendant le tournoi', ['tournoi', 'collations']),
            makeQuestion('Quelle collation est recommandée entre deux matchs intenses ?', `${cap(s.colPara)}`, 'Des bonbons très sucrés qui causent des maux de ventre', 'Des aliments lourds qui alourdissent la digestion', [s.colKw]),
            makeQuestion('Quelle boisson doit-on privilégier pour l’hydratation des joueurs ?', s.boiPara, 'Des boissons énergisantes conçues pour les jeunes sportifs', 'Des jus de fruits très sucrés consommés pendant l’effort', [s.boiKw]),
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
        const tuples = [
          {
            cpe: 'au Centre de la petite enfance Les Petits Écureuils',
            accueil: 'entre sept heures et neuf heures',
            retard: 'huit heures trente',
            allergie: 'les arachides ou les noix',
            retardAns: 'Signaler le retard avant huit heures trente auprès de l’accueil sur l’application',
            retardDist1: 'Aviser la réception sur l’application mobile après huit heures trente',
            retardDist2: 'Prévenir la réception lors de l’accueil du matin après neuf heures',
            allergieAns: 'Bannir des repas tout ingrédient comprenant des arachides ou des noix',
            allergieDist1: 'Accepter les lunchs dont le contenu n’est pas vérifié par le personnel',
            allergieDist2: 'Exiger une autorisation écrite pour chaque repas apporté au service de garde',
            evidenceRetard: ['huit', 'heures', 'trente'],
            evidenceAllergie: ['arachides', 'noix'],
          },
          {
            cpe: 'au service de garde Les Petits Explorateurs',
            accueil: 'entre sept heures et huit heures quarante-cinq',
            retard: 'huit heures quinze',
            allergie: 'les graines de sésame et les fruits à coque',
            retardAns: 'Prévenir le personnel avant huit heures quinze grâce à l’outil mobile',
            retardDist1: 'Aviser le personnel sur l’outil mobile après huit heures quinze',
            retardDist2: 'Contacter l’accueil du matin après huit heures quarante-cinq',
            allergieAns: 'Proscrire des lunchs les graines de sésame ainsi que les fruits à coque',
            allergieDist1: 'Accepter les lunchs dont le contenu n’est pas vérifié par le personnel',
            allergieDist2: 'Exiger une autorisation écrite pour chaque repas apporté au service de garde',
            evidenceRetard: ['huit', 'heures', 'quinze'],
            evidenceAllergie: ['graines', 'sésame', 'coque'],
          },
          {
            cpe: 'à la garderie subventionnée Le Jardin Fleuri',
            accueil: 'entre sept heures quinze et neuf heures',
            retard: 'huit heures quarante-cinq',
            allergie: 'les amandes et les dérivés de soja',
            retardAns: 'Transmettre le signalement avant huit heures quarante-cinq en ligne',
            retardDist1: 'Aviser la réception sur l’outil en ligne après huit heures quarante-cinq',
            retardDist2: 'Signaler l’absence lors de l’accueil du matin après neuf heures',
            allergieAns: 'Refuser formellement tout aliment comportant des amandes ou du soja',
            allergieDist1: 'Accepter les lunchs dont le contenu n’est pas vérifié par le personnel',
            allergieDist2: 'Exiger une autorisation écrite pour chaque repas apporté au service de garde',
            evidenceRetard: ['huit', 'heures', 'quarante-cinq'],
            evidenceAllergie: ['amandes', 'soja'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les parents ! Avant d’entamer cette nouvelle année ${t.cpe}, je désire vous rappeler quelques règlements essentiels pour la sécurité et le bien-être de vos enfants. L’accueil du matin s’effectue ${t.accueil}. Si votre enfant doit arriver en retard ou s’absenter pour des motifs médicaux, vous devez obligatoirement aviser la réception avant ${t.retard} par l’application mobile. En raison d’allergies sévères parmi nos enfants, nous appliquons une politique stricte : aucun aliment contenant ${t.allergie} n’est admis dans les boîtes à lunch. Enfin, n’oubliez pas d’apporter deux ensembles de vêtements de rechange étiquetés au nom de votre enfant pour les jeux extérieurs. Merci de votre précieuse collaboration !`,
          questions: [
            makeQuestion('Quel est l’objet principal de cette communication de la directrice ?', 'Rappeler les consignes d’accueil et les règles de vie du groupe', 'Demander l’achat de deux ensembles de rechange pour les jeux extérieurs', 'Modifier les consignes sur les boîtes à lunch pour les sorties de groupe', ['règlements', 'sécurité']),
            makeQuestion('Avant quelle heure les parents doivent-ils obligatoirement signaler une absence ?', t.retardAns, t.retardDist1, t.retardDist2, t.evidenceRetard),
            makeQuestion('Quelle exigence stricte concerne la sécurité alimentaire des enfants ?', t.allergieAns, t.allergieDist1, t.allergieDist2, t.evidenceAllergie),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Fonctionnement du service de garde scolaire
    Object.assign(
      (rand) => {
        const tuples = [
          {
            ecole: 'de l’école primaire Saint-Barthélemy',
            fermeture: 'dix-huit heures précises',
            penalite: 'des frais de retard d’un dollar pour chaque minute',
            penaliteAns: 'Le paiement d’un dollar par minute excédentaire auprès du responsable',
            penaliteDist1: 'Le versement des frais de retard réglé dix jours avant la fermeture',
            penaliteDist2: 'Une annulation de l’inscription de l’enfant aux sorties récréatives',
            sortie: 'une autorisation écrite datée et signée par les parents',
            sortieAns: 'La présentation d’une autorisation écrite signée avec pièce d’identité',
            sortieDist1: 'Une pièce d’identité sans autorisation écrite remise au responsable',
            sortieDist2: 'Une autorisation verbale transmise dix jours d’avance au responsable',
            evidencePenalite: ['dollar', 'minute'],
            evidenceSortie: ['autorisation', 'écrite', 'signée'],
          },
          {
            ecole: 'de l’école primaire de l’Étoile-du-Nord',
            fermeture: 'dix-sept heures quarante-cinq',
            penalite: 'une pénalité financière de dix dollars par tranche de dix minutes',
            penaliteAns: 'Le règlement d’une pénalité de dix dollars par bloc de dix minutes',
            penaliteDist1: 'Le versement de dix dollars payable dix jours avant la fermeture',
            penaliteDist2: 'L’annulation de l’inscription de l’enfant aux sorties récréatives',
            sortie: 'une procuration officielle enregistrée au préalable au secrétariat',
            sortieAns: 'Une procuration officielle déposée au secrétariat et une pièce d’identité munie d’une photo',
            sortieDist1: 'Une simple confirmation verbale transmise dix jours avant la sortie',
            sortieDist2: 'Une pièce d’identité sans procuration officielle remise à l’accueil',
            evidencePenalite: ['pénalité', 'dix', 'dollars'],
            evidenceSortie: ['procuration', 'secrétariat'],
          },
          {
            ecole: 'du pavillon primaire Saint-Viateur',
            fermeture: 'dix-huit heures',
            penalite: 'une tarification spéciale forfaitaire de vingt dollars dès le premier retard',
            penaliteAns: 'La facturation d’un montant forfaitaire de vingt dollars dès la fermeture',
            penaliteDist1: 'Le paiement de vingt dollars réglé dix jours avant la fermeture',
            penaliteDist2: 'Le refus de l’inscription de l’enfant pour les sorties récréatives',
            sortie: 'une confirmation électronique validée sur le portail sécurisé',
            sortieAns: 'Une validation électronique du portail et une pièce d’identité munie d’une photo',
            sortieDist1: 'Une pièce d’identité sans confirmation électronique sur le portail',
            sortieDist2: 'Un message verbal transmis au responsable dix jours avant la sortie',
            evidencePenalite: ['tarification', 'vingt', 'dollars'],
            evidenceSortie: ['confirmation', 'électronique', 'portail'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Chers parents des élèves ${t.ecole}, voici les consignes relatives au service de garde pour les journées de classe et les journées pédagogiques. Notre service ferme ses portes à ${t.fermeture}. Tout retard le soir entraînera ${t.penalite}, payable directement auprès du responsable de garde. Si une personne autre que les parents désignés vient chercher votre enfant en fin de journée, nous exigeons ${t.sortie} accompagnée d’une pièce d’identité avec photo. Pour les journées de formation des enseignants, l’inscription doit être complétée dix jours à l’avance afin de prévoir le nombre adéquat d’éducateurs pour les sorties récréatives. Nous comptons sur votre ponctualité pour faciliter le bon déroulement de nos activités quotidiennes.`,
          questions: [
            makeQuestion('Quel sujet administratif la responsable du service de garde aborde-t-elle ?', 'Les horaires habituels et les formalités du service de garde', 'Le programme des sorties récréatives pour les journées de classe', 'La formation des enseignants prévue lors des journées de classe', ['garde', 'consignes']),
            makeQuestion('Quelle conséquence découle d’un retard des parents après la fermeture ?', t.penaliteAns, t.penaliteDist1, t.penaliteDist2, t.evidencePenalite),
            makeQuestion('Que faut-il présenter si une tierce personne vient chercher l’enfant ?', t.sortieAns, t.sortieDist1, t.sortieDist2, t.evidenceSortie),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Propriétaire annonçant des travaux de toiture et balcons
    Object.assign(
      (rand) => {
        const tuples = [
          {
            proprio: 'Madame Tremblay',
            date: 'lundi le quinze avril',
            duree: 'trois semaines complètes',
            restriction: 'retirer tous vos meubles des balcons et fermer les fenêtres',
            restrictionAns: 'Dégager entièrement les balcons et maintenir les fenêtres closes',
            restrictionDist1: 'Déplacer tous les meubles vers la cour arrière pendant le chantier',
            restrictionDist2: 'Garder les fenêtres ouvertes sur les balcons pour aérer la poussière',
            evidenceRestriction: ['meubles', 'balcons', 'fenêtres'],
          },
          {
            proprio: 'Madame Bouchard',
            date: 'mardi le deux mai',
            duree: 'quatre semaines de travaux',
            restriction: 'libérer entièrement les coursives et stationner sur la rue',
            restrictionAns: 'Libérer toutes les coursives et garer son véhicule sur la rue',
            restrictionDist1: 'Stationner les véhicules dans la cour arrière pendant les travaux',
            restrictionDist2: 'Entreposer les meubles dans les coursives extérieures ce week-end',
            evidenceRestriction: ['coursives', 'stationner', 'rue'],
          },
          {
            proprio: 'Madame Mercier',
            date: 'le premier juin',
            duree: 'deux semaines intensives',
            restriction: 'couvrir vos objets fragiles et garder les stores baissés',
            restrictionAns: 'Couvrir les objets fragiles et maintenir les stores baissés',
            restrictionDist1: 'Déposer les objets fragiles dans la cour arrière dès ce week-end',
            restrictionDist2: 'Laisser les fenêtres et les stores ouverts malgré la poussière',
            evidenceRestriction: ['fragiles', 'stores', 'baissés'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les résidents de l’immeuble. C’est votre propriétaire, ${t.proprio}. Je vous appelle pour vous transmettre des informations détaillées concernant les travaux de rénovation de notre toiture et de nos balcons extérieurs. Le chantier débutera ${t.date} et s’échelonnera sur ${t.duree}. Les ouvriers travailleront du lundi au vendredi, entre sept heures trente et dix-sept heures. Durant cette période, il y aura du bruit et de la poussière. Vous devez impérativement ${t.restriction} dès ce week-end. L’accès à la cour arrière sera également interdit pour des raisons de sécurité pendant les manœuvres. Je vous remercie pour votre patience et votre coopération !`,
          questions: [
            makeQuestion('Quelle annonce majeure la propriétaire communique-t-elle aux locataires ?', 'La tenue de travaux de rénovation sur la toiture et les balcons', 'La fermeture définitive de la cour arrière pour des motifs de bruit', 'L’interdiction d’accès aux balcons extérieurs pendant tout le week-end', ['travaux', 'rénovation']),
            makeQuestion('Quels horaires de travail les ouvriers respecteront-ils sur place ?', 'Du lundi au vendredi sur le chantier de sept heures trente jusqu’en fin d’après-midi', 'Du lundi au vendredi durant la soirée afin de limiter le bruit pour l’ensemble des résidents', 'Durant toute la fin de semaine dès sept heures pour libérer la cour arrière', ['lundi', 'vendredi', 'heures']),
            makeQuestion('Quelle consigne obligatoire les locataires doivent-ils appliquer chez eux ?', t.restrictionAns, t.restrictionDist1, t.restrictionDist2, t.evidenceRestriction),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire annonçant le remplacement de la plomberie
    Object.assign(
      (rand) => {
        const tuples = [
          {
            batiment: 'du complexe résidentiel Le Saint-Laurent',
            coupure: 'les mardis et jeudis de neuf heures à seize heures',
            coupureAns: 'Les mardis et jeudis entre neuf heures et seize heures',
            coupureDist1: 'Les mardis et jeudis après seize heures jusqu’au lendemain matin',
            coupureDist2: 'La veille des travaux en soirée pour remplir les récipients d’eau',
            acces: 'permettre aux ouvriers d’accéder aux tuyaux sous votre évier',
            accesAns: 'Donner accès aux canalisations situées sous l’évier de la cuisine',
            accesDist1: 'Refuser d’être présent et de remettre ses clés au concierge',
            accesDist2: 'Remplir soi-même les récipients de distribution sous son évier',
            evidenceCoupure: ['mardis', 'jeudis', 'seize'],
            evidenceAcces: ['tuyaux', 'évier'],
          },
          {
            batiment: 'de la coopérative d’habitation Les Pins',
            coupure: 'les lundis et mercredis de huit heures à quinze heures',
            coupureAns: 'Les lundis et mercredis entre huit heures et quinze heures',
            coupureDist1: 'Les lundis et mercredis après quinze heures jusqu’au lendemain',
            coupureDist2: 'La veille des coupures en soirée pour remplir les récipients',
            acces: 'permettre aux ouvriers d’accéder au chauffe-eau dans votre buanderie',
            accesAns: 'Donner accès au chauffe-eau situé dans la buanderie pour l’intervention',
            accesDist1: 'Refuser d’être présent et de remettre ses clés au concierge',
            accesDist2: 'Remplir des récipients d’eau à partir du chauffe-eau le matin',
            evidenceCoupure: ['lundis', 'mercredis', 'quinze'],
            evidenceAcces: ['chauffe-eau', 'buanderie'],
          },
          {
            batiment: 'des appartements du Manoir Mont-Royal',
            coupure: 'tous les matins de cette semaine entre huit heures et midi',
            coupureAns: 'Tous les matins de la semaine en cours de huit heures à midi',
            coupureDist1: 'Tous les après-midis de la semaine à partir de midi seulement',
            coupureDist2: 'La veille de chaque coupure le soir pour remplir les récipients',
            acces: 'permettre aux ouvriers d’accéder aux conduites de la salle de bain',
            accesAns: 'Donner accès aux canalisations de la salle de bain pour les ouvriers',
            accesDist1: 'Refuser d’être présent et de remettre ses clés au concierge',
            accesDist2: 'Remplir les récipients d’eau potable depuis la salle de bain',
            evidenceCoupure: ['matins', 'huit', 'midi'],
            evidenceAcces: ['conduites', 'salle', 'bain'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Avis important à l’intention de tous les locataires ${t.batiment}. Notre syndicat de gestion entreprendra dès la semaine prochaine le remplacement complet de la tuyauterie d’eau potable de tout l’immeuble. Cette mise aux normes entraînera des coupures d’eau régulières ${t.coupure}. Nous vous conseillons de remplir des récipients d’eau la veille pour vos besoins essentiels. Chaque locataire doit obligatoirement être présent ou confier ses clés au concierge pour ${t.acces}. Des points de distribution d’eau embouteillée seront installés dans le hall d’entrée pour dépanner les familles. Nous regrettons ces inconvénients temporaires qui garantiront toutefois la qualité de notre réseau pour de nombreuses années.`,
          questions: [
            makeQuestion('Quel projet de rénovation technique est présenté dans ce message vocal ?', 'Le renouvellement complet des conduites d’eau de la bâtisse', 'L’aménagement de points d’eau permanents dans le hall d’entrée', 'La distribution continue d’eau embouteillée à chaque logement', ['tuyauterie', 'potable']),
            makeQuestion('Quand les coupures d’eau potable auront-elles lieu dans le complexe ?', t.coupureAns, t.coupureDist1, t.coupureDist2, t.evidenceCoupure),
            makeQuestion('Quelle obligation incombe à chaque occupant du logement pour les travaux ?', t.accesAns, t.accesDist1, t.accesDist2, t.evidenceAcces),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Règlements d'une garderie en milieu familial
    Object.assign(
      (rand) => {
        const tuples = [
          {
            responsable: 'Madame Chantal Roy',
            fermeture: 'dix-sept heures trente',
            signature: 'la feuille de présence officielle du ministère',
            vaccin: 'le carnet de vaccination à jour de votre tout-petit',
            signatureAns: 'Apposer sa signature sur le document de présence émis par le ministère',
            signatureDist1: 'Signer la feuille de présence uniquement lors des contrôles médicaux',
            signatureDist2: 'Remettre le document officiel de présence à la maison avant vendredi',
            vaccinAns: 'Fournir le livret de vaccination actualisé pour son enfant avant vendredi',
            vaccinDist1: 'Un bilan médical prouvant vingt-quatre heures sans aucun symptôme',
            vaccinDist2: 'Une note signée confirmant une température sous trente-huit degrés',
            evidenceSignature: ['feuille', 'présence', 'ministère'],
            evidenceVaccin: ['carnet', 'vaccination'],
          },
          {
            responsable: 'Madame Sylvie Lavoie',
            fermeture: 'dix-sept heures quinze',
            signature: 'le registre d’émargement quotidien',
            vaccin: 'la fiche médicale annuelle remplie par votre médecin',
            signatureAns: 'Compléter par sa signature le document quotidien d’émargement à la sortie',
            signatureDist1: 'Signer le registre d’émargement seulement lors des contrôles officiels',
            signatureDist2: 'Remettre le registre d’émargement rempli à la maison d’ici vendredi',
            vaccinAns: 'Remettre la fiche médicale annuelle complétée par le médecin traitant',
            vaccinDist1: 'Une note du médecin attestant vingt-quatre heures sans symptômes',
            vaccinDist2: 'Une attestation médicale en cas de fièvre de plus de trente-huit degrés',
            evidenceSignature: ['registre', 'émargement'],
            evidenceVaccin: ['fiche', 'médicale', 'médecin'],
          },
          {
            responsable: 'Madame Josée Gagnon',
            fermeture: 'dix-sept heures quarante-cinq',
            signature: 'le formulaire électronique sur tablette à l’entrée',
            vaccin: 'la confirmation d’inscription avec antécédents médicaux',
            signatureAns: 'Valider le formulaire électronique sur la tablette installée à l’entrée',
            signatureDist1: 'Valider le formulaire sur tablette uniquement en cas de contrôle',
            signatureDist2: 'Conserver la tablette électronique à la maison jusqu’à vendredi',
            vaccinAns: 'Donner la confirmation d’inscription mentionnant les antécédents médicaux',
            vaccinDist1: 'Un certificat médical après vingt-quatre heures sans aucun symptôme',
            vaccinDist2: 'Une déclaration écrite de fièvre dépassant trente-huit degrés le soir',
            evidenceSignature: ['formulaire', 'électronique', 'tablette'],
            evidenceVaccin: ['confirmation', 'inscription', 'antécédents'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour chers parents. C’est ${t.responsable}, responsable du service de garde éducatif en milieu familial. Je tiens à préciser quelques consignes d’organisation pour que tout le monde passe une excellente session. Veuillez noter que notre journée se termine à ${t.fermeture} précises. Le soir, prenez deux minutes pour signer ${t.signature} avant de quitter avec votre enfant, car cette démarche est vérifiée lors des contrôles. Si votre enfant présente de la fièvre supérieure à trente-huit degrés ou des symptômes contagieux, il doit demeurer à la maison jusqu’à disparition complète des symptômes pendant vingt-quatre heures. Enfin, n’oubliez pas de me remettre ${t.vaccin} avant vendredi prochain. Je vous remercie pour votre belle collaboration !`,
          questions: [
            makeQuestion('Quel cadre éducatif fait l’objet de cette mise au point de règlements ?', 'Un service de garde éducatif organisé en milieu familial', 'Un programme préscolaire organisé dans une école primaire', 'Une classe d’immersion anglaise offerte en milieu scolaire', ['garde', 'familial']),
            makeQuestion('Quelle formalité administrative obligatoire les parents doivent-ils faire le soir ?', t.signatureAns, t.signatureDist1, t.signatureDist2, t.evidenceSignature),
            makeQuestion('Quel document médical obligatoire doit être transmis d’ici vendredi ?', t.vaccinAns, t.vaccinDist1, t.vaccinDist2, t.evidenceVaccin),
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
        const tuples = [
          {
            competition: 'des Championnats mondiaux d’athlétisme',
            ville: 'de Montréal',
            porte_drapeau: 'la sprinteuse québécoise',
            foule: 'quarante mille spectateurs enthousiastes',
            drapeauAns: 'La sprinteuse québécoise acclamée par la foule rassemblée',
            drapeauDist1: 'Deux jeunes athlètes de la relève locale allumant la flamme',
            drapeauDist2: 'Les danseurs traditionnels au centre de la scène d’ouverture',
            evidenceDrapeau: ['sprinteuse', 'québécoise'],
          },
          {
            competition: 'des Jeux mondiaux universitaires',
            ville: 'de Québec',
            porte_drapeau: 'le champion canadien de plongeon',
            foule: 'trente-cinq mille personnes réunies',
            drapeauAns: 'Le plongeur champion canadien sous les applaudissements du public',
            drapeauDist1: 'Deux jeunes athlètes de la relève locale portant le drapeau',
            drapeauDist2: 'Les danseurs traditionnels au centre de la scène d’ouverture',
            evidenceDrapeau: ['champion', 'canadien', 'plongeon'],
          },
          {
            competition: 'du Grand Prix cycliste international',
            ville: 'de Gatineau',
            porte_drapeau: 'la cycliste chevronnée médaillée d’or',
            foule: 'vingt-cinq mille amateurs réunis',
            drapeauAns: 'La coureuse cycliste médaillée d’or saluée par les spectateurs',
            drapeauDist1: 'Deux jeunes athlètes de la relève locale salués par la foule',
            drapeauDist2: 'Les danseurs traditionnels au centre de la scène d’ouverture',
            evidenceDrapeau: ['cycliste', 'médaillée', 'or'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Bienvenue sur nos ondes pour cette émission spéciale consacrée à la cérémonie d’ouverture ${t.competition}, qui s’est tenue hier soir dans le grand stade ${t.ville}. Le spectacle a débuté par un hommage touchant aux Premières Nations, suivi d’une chorégraphie dynamique alliant danses traditionnelles et projections lumineuses sur une gigantesque scène centrale. L’émotion a atteint son comble lors du défilé des délégations, lorsque ${t.porte_drapeau} a franchi la scène centrale sous les ovations de ${t.foule}. La flamme officielle a ensuite été allumée par deux jeunes athlètes de la relève locale au milieu d’un impressionnant feu d’artifice. Les compétitions s’amorceront dès ce matin avec les premières rondes éliminatoires.`,
          questions: [
            makeQuestion('Quel événement festif et sportif est décrit par le journaliste à la radio ?', 'Le lancement festif d’une grande rencontre sportive internationale', 'La clôture des compétitions avec le défilé final des délégations', 'Le tirage au sort des équipes pour les premières rondes éliminatoires', ['cérémonie', 'ouverture', 'stade']),
            makeQuestion('Par quoi le spectacle inaugural a-t-il débuté ?', 'Un hommage aux Premières Nations suivi de projections visuelles', 'L’allumage de la flamme officielle au milieu du grand stade', 'Le défilé de l’ensemble des délégations sur la scène centrale', ['hommage', 'nations', 'projections']),
            makeQuestion('Quelle personnalité sportive a suscité l’enthousiasme lors du défilé ?', t.drapeauAns, t.drapeauDist1, t.drapeauDist2, t.evidenceDrapeau),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Cérémonie d'ouverture - Jeux d'hiver internationaux
    Object.assign(
      (rand) => {
        const tuples = [
          {
            jeu: 'des Jeux internationaux d’hiver de la jeunesse',
            region: 'dans les Laurentides',
            spectacle: 'un conte musical poétique inspiré des légendes boréales, interprété par trois cents artistes',
            spectacleAns: 'Un conte musical inspiré de légendes nordiques joué par des artistes',
            spectacleDist1: 'Un concert de musique traditionnelle joué par les dignitaires invités',
            spectacleDist2: 'Une chorale des athlètes interprétant des chants pour braver le froid',
            serment: 'une jeune patineuse de vitesse de la région',
            sermentAns: 'Une jeune patineuse de vitesse originaire de la région d’accueil',
            sermentDist1: 'Les dignitaires qui ont ouvert la soirée sur la place des festivals',
            sermentDist2: 'Les artistes qui ont interprété le conte musical pour les spectateurs',
            evidenceSpectacle: ['conte', 'musical', 'boréales'],
            evidenceSerment: ['patineuse', 'vitesse'],
          },
          {
            jeu: 'des Championnats mondiaux de ski nordique',
            region: 'au Mont-Sainte-Anne',
            spectacle: 'une fresque visuelle retraçant l’histoire des coureurs des bois, interprétée par trois cents artistes',
            spectacleAns: 'Une fresque visuelle historique évoquant le passé des coureurs des bois',
            spectacleDist1: 'Un concert de musique traditionnelle joué par les dignitaires présents',
            spectacleDist2: 'Une chorale des athlètes interprétant des chants pour braver le froid',
            serment: 'un fondeur québécois sélectionné pour la première fois',
            sermentAns: 'Un fondeur d’ici sélectionné pour la première fois aux championnats',
            sermentDist1: 'Les dignitaires de la région réunis sur la place des festivals',
            sermentDist2: 'Les artistes qui ont participé à la fresque visuelle historique',
            evidenceSpectacle: ['fresque', 'visuelle', 'bois'],
            evidenceSerment: ['fondeur', 'sélectionné'],
          },
          {
            jeu: 'du Festival international des sports de neige',
            region: 'au Saguenay',
            spectacle: 'une symphonie de percussions jouée sur des blocs de glace sculptés par trois cents artistes',
            spectacleAns: 'Une symphonie percussive résonnant sur d’immenses blocs de glace sculptés',
            spectacleDist1: 'Un concert de musique traditionnelle joué par les dignitaires officiels',
            spectacleDist2: 'Une chorale des athlètes interprétant des chants pour braver le froid',
            serment: 'une skieuse acrobatique acclamée par la foule',
            sermentAns: 'Une spécialiste du ski acrobatique chaudement acclamée par le public',
            sermentDist1: 'Les dignitaires accueillis au début de la soirée inaugurale',
            sermentDist2: 'Les musiciens traditionnels qui ont animé le concert de clôture',
            evidenceSpectacle: ['symphonie', 'percussions', 'glace'],
            evidenceSerment: ['skieuse', 'acrobatique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Ici Radio-Canada en direct de la soirée inaugurale ${t.jeu}, organisée cette semaine ${t.region}. Malgré un vent glacial qui soufflait sur la place des festivals, les spectateurs ont assisté à un déploiement artistique remarquable. La mise en scène proposait ${t.spectacle}. Après le salut des dignitaires, ${t.serment} a prononcé le serment des athlètes au nom de tous les participants, promettant loyauté et esprit d’équipe. La soirée s’est conclue dans une ambiance chaleureuse avec un concert de musique traditionnelle où le public s’est mis à chanter et danser pour braver le froid.`,
          questions: [
            makeQuestion('Quel événement culturel et sportif radiodiffusé ce reportage fait-il revivre ?', 'L’inauguration officielle d’un tournoi hivernal international', 'Un concert de musique traditionnelle pour clôturer les compétitions', 'Une remise de médailles aux participants sur la place des festivals', ['inaugurale', 'artistique']),
            makeQuestion('Quelle œuvre artistique a constitué le cœur du spectacle d’ouverture ?', t.spectacleAns, t.spectacleDist1, t.spectacleDist2, t.evidenceSpectacle),
            makeQuestion('Qui a prononcé le serment officiel au nom des sportifs réunis ?', t.sermentAns, t.sermentDist1, t.sermentDist2, t.evidenceSerment),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Profil d'une experte invitée pour donner une formation
    Object.assign(
      (rand) => {
        const tuples = [
          {
            nom: 'Docteure Nadia Belkacem',
            domaine: 'la cybersécurité et la protection des données gouvernementales',
            firme: 'pendant dix ans pour l’Agence spatiale canadienne',
            publication: 'd’un guide pratique sur la sécurité informatique',
            mission: 'identifier les vulnérabilités de nos systèmes internes et sécuriser nos échanges de courriels',
            domaineAns: 'La sécurité informatique et la protection des renseignements numériques',
            domaineDist1: 'La gestion administrative des cabinets de consultation spécialisés',
            domaineDist2: 'L’évaluation financière des missions pour l’Agence spatiale canadienne',
            firmeAns: 'Une décennie d’expérience au service de l’Agence spatiale canadienne',
            firmeDist1: 'Un poste d’enseignante titulaire en doctorat à Polytechnique Montréal',
            firmeDist2: 'La responsabilité de la diffusion des guides pratiques en informatique',
            missionAns: 'Détecter les faiblesses logicielles et sécuriser les courriels internes',
            missionDist1: 'Préparer la rédaction commune d’un guide pratique avec l’Agence spatiale',
            missionDist2: 'Évaluer les coûts de consultation pour l’ensemble des systèmes internes',
            evidenceDomaine: ['cybersécurité', 'données'],
            evidenceFirme: ['spatiale', 'canadienne'],
            evidenceMission: ['vulnérabilités', 'systèmes', 'courriels'],
          },
          {
            nom: 'Docteure Valérie Côté',
            domaine: 'l’intelligence artificielle appliquée aux réseaux financiers',
            firme: 'au sein d’une grande banque québécoise comme directrice de l’innovation',
            publication: 'de deux livres de référence traduits à l’étranger',
            mission: 'automatiser l’analyse des risques de crédit et repérer les anomalies transactionnelles',
            domaineAns: 'L’intelligence artificielle appliquée à la gestion des flux financiers',
            domaineDist1: 'La direction administrative des ressources humaines au sein de la banque',
            domaineDist2: 'La rédaction et la traduction de livres de référence pour l’étranger',
            firmeAns: 'Un poste de direction de l’innovation dans une grande banque québécoise',
            firmeDist1: 'La coordination de la traduction de livres pour des maisons d’édition',
            firmeDist2: 'Un rôle d’enseignante en génie informatique à Polytechnique Montréal',
            missionAns: 'Automatiser le suivi du risque et dépister les transactions anormales',
            missionDist1: 'Préparer la publication de livres de référence au sein de la banque',
            missionDist2: 'Réorganiser la direction de l’innovation pour les équipes de crédit',
            evidenceDomaine: ['intelligence', 'artificielle', 'financiers'],
            evidenceFirme: ['banque', 'québécoise', 'directrice'],
            evidenceMission: ['analyse', 'risques', 'anomalies'],
          },
          {
            nom: 'Docteure Amina Traoré',
            domaine: 'la gouvernance technologique et la gestion des risques numériques',
            firme: 'comme consultante stratégique pour plusieurs ministères fédéraux',
            publication: 'd’une série d’articles spécialisés sur l’éthique numérique',
            mission: 'baliser les pratiques éthiques en technologies et assurer la conformité réglementaire',
            domaineAns: 'La gouvernance numérique et le contrôle des risques technologiques',
            domaineDist1: 'La gestion des relations publiques au sein des ministères fédéraux',
            domaineDist2: 'La rédaction d’articles spécialisés sur la conformité réglementaire',
            firmeAns: 'Une pratique de conseil stratégique auprès de plusieurs ministères fédéraux',
            firmeDist1: 'Un poste de chercheuse doctorale en génie à Polytechnique Montréal',
            firmeDist2: 'La responsabilité de la conformité éthique dans son propre cabinet',
            missionAns: 'Encadrer les règles éthiques et garantir la conformité aux normes',
            missionDist1: 'Négocier de nouveaux mandats stratégiques avec les ministères fédéraux',
            missionDist2: 'Rédiger une série d’articles spécialisés pour le cabinet de consultation',
            evidenceDomaine: ['gouvernance', 'risques', 'numériques'],
            evidenceFirme: ['consultante', 'ministères', 'fédéraux'],
            evidenceMission: ['éthiques', 'conformité', 'réglementaire'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour chers collègues. C’est un grand plaisir de vous présenter notre formatrice invitée pour cette journée de perfectionnement professionnel, ${t.nom}. Diplômée de Polytechnique Montréal et titulaire d’un doctorat en génie informatique, elle est une spécialiste réputée dans le secteur de ${t.domaine}. Avant de fonder son propre cabinet de consultation, elle a œuvré ${t.firme}. Elle est également l’auteure ${t.publication}. Aujourd’hui, elle partagera avec notre équipe des méthodes concrètes pour ${t.mission}. Je vous invite à lui réserver un accueil chaleureux et à préparer vos questions pour la période d’échange finale.`,
          questions: [
            makeQuestion('Dans quel secteur précis la formatrice invitée s’est-elle spécialisée ?', t.domaineAns, t.domaineDist1, t.domaineDist2, t.evidenceDomaine),
            makeQuestion('Quelle fonction majeure a-t-elle exercée avant de créer son propre cabinet ?', t.firmeAns, t.firmeDist1, t.firmeDist2, t.evidenceFirme),
            makeQuestion('Quel objectif opérationnel cette session de formation vise-t-elle pour l’équipe ?', t.missionAns, t.missionDist1, t.missionDist2, t.evidenceMission),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Profil d'une experte en diversité et climat de travail
    Object.assign(
      (rand) => {
        const tuples = [
          {
            nom: 'Madame Sophie Desrosiers',
            expertise: 'la médiation organisationnelle et la diversité en milieu de travail',
            etudes: 'à l’École nationale d’administration publique',
            mandat: 'auprès d’hôpitaux publics et de cégeps de la province',
            expertiseAns: 'La médiation en entreprise et la promotion de la diversité au travail',
            expertiseDist1: 'L’administration générale des ressources hospitalières et des cégeps',
            expertiseDist2: 'L’enseignement théorique à l’École nationale d’administration publique',
            mandatAns: 'Des interventions dans des hôpitaux publics et des cégeps provinciaux',
            mandatDist1: 'Des directions facultaires à l’École nationale d’administration publique',
            mandatDist2: 'Des comités de concertation syndicale entre gestionnaires hospitaliers',
            evidenceExpertise: ['médiation', 'diversité'],
            evidenceMandat: ['hôpitaux', 'cégeps'],
          },
          {
            nom: 'Madame Monique Baril',
            expertise: 'la santé psychologique au travail et la prévention du harcèlement',
            etudes: 'à l’Université de Montréal en psychologie industrielle',
            mandat: 'pour de grandes coopératives financières et des municipalités',
            expertiseAns: 'Le bien-être psychologique en milieu professionnel et la lutte contre le harcèlement',
            expertiseDist1: 'La direction financière des grandes coopératives et des municipalités régionales',
            expertiseDist2: 'La recherche fondamentale en psychologie à l’Université de Montréal pour étudiants',
            mandatAns: 'Des missions auprès de coopératives financières et de villes d’ici',
            mandatDist1: 'Des services de recherche industrielle à l’Université de Montréal',
            mandatDist2: 'Des postes de direction générale au sein des coopératives financières',
            evidenceExpertise: ['santé', 'psychologique', 'harcèlement'],
            evidenceMandat: ['coopératives', 'municipalités'],
          },
          {
            nom: 'Madame Diane Beaulieu',
            expertise: 'le leadership inclusif et la conciliation entre le travail et la famille',
            etudes: 'à l’Université Laval en relations industrielles',
            mandat: 'au sein de sociétés d’État et d’organismes communautaires',
            expertiseAns: 'Les pratiques de gestion inclusive et l’équilibre entre travail et obligations familiales',
            expertiseDist1: 'La direction syndicale des relations industrielles au sein de l’Université Laval',
            expertiseDist2: 'L’administration budgétaire des organismes communautaires et des sociétés d’État',
            mandatAns: 'Des interventions ciblées dans des sociétés publiques et communautaires',
            mandatDist1: 'Des chaires de recherche en relations industrielles à l’Université Laval',
            mandatDist2: 'Des comités de gestion des horaires au sein d’organismes communautaires',
            evidenceExpertise: ['leadership', 'conciliation', 'famille'],
            evidenceMandat: ['sociétés', 'organismes', 'communautaires'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bienvenue à notre atelier annuel sur le bien-être au travail. Nous avons le privilège d’accueillir aujourd’hui ${t.nom}, une spécialiste reconnue pour son travail sur ${t.expertise}. Formée ${t.etudes}, elle cumule plus de quinze années d’expérience sur le terrain. Elle a piloté des mandats de transformation remarquables ${t.mandat}. Son approche pratique repose sur des ateliers interactifs, des mises en situation réalistes et le dialogue constructif entre gestionnaires et équipes de travail. Cet après-midi, elle nous outillera pour désamorcer les conflits d’équipe et cultiver un climat de travail sain et respectueux. N’hésitez pas à participer activement à ses exercices en petits groupes pour en tirer le maximum de bénéfices !`,
          questions: [
            makeQuestion('Dans quel domaine d’intervention la spécialiste possède-t-elle une solide réputation ?', t.expertiseAns, t.expertiseDist1, t.expertiseDist2, t.evidenceExpertise),
            makeQuestion('Auprès de quels milieux a-t-elle notamment réalisé des mandats d’envergure ?', t.mandatAns, t.mandatDist1, t.mandatDist2, t.evidenceMandat),
            makeQuestion('Quelle démarche pédagogique privilégie-t-elle pour outiller les participants ?', 'Des mises en situation interactives et des exercices en sous-groupes', 'Une série d’évaluations écrites sur les conflits d’équipe de travail', 'Une lecture individuelle des rapports de transformation des cégeps', ['ateliers', 'interactifs', 'exercices']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Cérémonie d'ouverture - Compétition aquatique internationale
    Object.assign(
      (rand) => {
        const tuples = [
          {
            bassin: 'au Parc olympique de Montréal',
            epreuve: 'du plongeon et de la natation artistique',
            honneur: 'une nageuse autochtone championne panaméricaine',
            epreuveAns: 'Des épreuves internationales de plongeon et de natation artistique',
            epreuveDist1: 'Des tournois de sports aquatiques disputés uniquement en eau profonde',
            epreuveDist2: 'Des démonstrations acrobatiques aériennes au-dessus des gradins pleins',
            honneurAns: 'Une nageuse autochtone sacrée championne panaméricaine',
            honneurDist1: 'L’un des acrobates aériens du spectacle au-dessus du bassin',
            honneurDist2: 'Le porte-parole des délégations étrangères de quarante pays',
            evidenceEpreuve: ['plongeon', 'natation', 'artistique'],
            evidenceHonneur: ['nageuse', 'autochtone', 'panaméricaine'],
          },
          {
            bassin: 'au Centre sportif de Gatineau',
            epreuve: 'du water-polo et de la nage en eau libre',
            honneur: 'un paralympien médaillé d’or en papillon',
            epreuveAns: 'Des confrontations de water-polo et des épreuves en eau libre',
            epreuveDist1: 'Des numéros d’acrobatie aérienne exécutés au-dessus du bassin principal',
            epreuveDist2: 'Des rondes éliminatoires de natation artistique réservées aux gradins',
            honneurAns: 'Un athlète paralympique ayant décroché l’or en style papillon',
            honneurDist1: 'L’un des artistes acrobatiques du numéro aérien de la soirée',
            honneurDist2: 'Un représentant des délégations étrangères réunies ce soir',
            evidenceEpreuve: ['water-polo', 'eau', 'libre'],
            evidenceHonneur: ['paralympien', 'médaillé', 'papillon'],
          },
          {
            bassin: 'au complexe Aquatique de Laval',
            epreuve: 'de la natation de vitesse et du plongeon synchronisé',
            honneur: 'une jeune prodige locale détenant un record canadien',
            epreuveAns: 'Des courses de natation rapide et des plongeons synchronisés',
            epreuveDist1: 'Des spectacles acrobatiques aériens organisés pour quarante nations',
            epreuveDist2: 'Des compétitions nautiques mixtes présentées dès ce soir à minuit',
            honneurAns: 'Une jeune sportive locale titulaire d’un record canadien',
            honneurDist1: 'Un acrobate aérien du spectacle ayant surplombé le bassin',
            honneurDist2: 'Un délégué étranger représentant l’une des quarante nations',
            evidenceEpreuve: ['natation', 'vitesse', 'plongeon'],
            evidenceHonneur: ['prodige', 'record', 'canadien'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Vous écoutez Radio-Canada Sports pour la retransmission de la cérémonie d’ouverture de la Coupe internationale des sports aquatiques, présentée ce soir ${t.bassin}. Les gradins étaient remplis pour accueillir les représentants de plus de quarante nations qui s’affronteront dans les épreuves ${t.epreuve}. Le moment fort de la soirée est survenu lorsqu’un spectacle acrobatique aérien a surplombé le bassin principal, illuminé d’effets visuels impressionnants. C’est ${t.honneur} qui a officiellement déclaré les jeux ouverts, saluée par un tonnerre d’applaudissements de la part des délégations étrangères. Les premières courses débutent demain dès huit heures trente, et nous serons en ondes pour vous faire vivre chaque seconde de cette compétition captivante.`,
          questions: [
            makeQuestion('Quelles disciplines sportives figurent au programme de cet événement international ?', t.epreuveAns, t.epreuveDist1, t.epreuveDist2, t.evidenceEpreuve),
            makeQuestion('Quelle personnalité a eu le privilège d’inaugurer officiellement les compétitions ?', t.honneurAns, t.honneurDist1, t.honneurDist2, t.evidenceHonneur),
            makeQuestion('Quand débuteront les premières courses officielles sur le site ?', 'Dès huit heures trente demain matin pour les éliminatoires', 'Ce soir immédiatement après le spectacle acrobatique aérien', 'Demain en fin de journée après le défilé des quarante nations', ['huit', 'heures', 'trente']),
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
    // Scenario 0 (Template, Ex 0): Critique / résumé de film sur une sportive québécoise (fictional)
    Object.assign(
      (rand) => {
        const tuples = [
          {
            film: '« L’Or sur glace »',
            sportive: 'la patineuse Émilie Vachon',
            lieuEntrainement: 'sur des patinoires extérieures sous un froid polaire',
            blessure: 'une fracture sévère à la cheville à la veille des sélections',
            finale: 'une médaille historique remportée avec courage aux Jeux d’hiver',
            blessureAns: 'Une sévère fracture de la cheville subie juste avant les sélections',
            blessureDist1: 'Le départ précipité de son entraîneur de toujours lors des sélections',
            blessureDist2: 'Une interdiction de s’entraîner sur les patinoires de son village',
            finaleAns: 'La conquête historique d’une médaille olympique couronnant sa réadaptation',
            finaleDist1: 'La décision d’abandonner les Jeux d’hiver pour rester dans son village',
            finaleDist2: 'La fin définitive de sa carrière annoncée par tous les spécialistes',
            evidenceBlessure: ['fracture', 'cheville', 'sélections'],
            evidenceFinale: ['médaille', 'jeux', 'hiver'],
          },
          {
            film: '« La Traversée du courage »',
            sportive: 'la fondeuse Sandrine Gagnon',
            lieuEntrainement: 'sur les sentiers enneigés de la forêt sous un froid polaire',
            blessure: 'une pneumonie sévère qui a paralysé sa préparation hivernale',
            finale: 'une remontée spectaculaire sur le podium lors du cinquante kilomètres',
            blessureAns: 'Une violente pneumonie venue interrompre sa préparation en plein hiver',
            blessureDist1: 'La démission soudaine de son entraîneur de toujours en plein hiver',
            blessureDist2: 'Une interdiction médicale de fréquenter les sentiers de son village',
            finaleAns: 'Une remontée mémorable vers les marches du podium au cinquante kilomètres',
            finaleDist1: 'L’abandon de sa réadaptation rigoureuse au cinquante kilomètres',
            finaleDist2: 'La fin de carrière annoncée par les spécialistes lors des sélections',
            evidenceBlessure: ['pneumonie', 'préparation'],
            evidenceFinale: ['podium', 'cinquante', 'kilomètres'],
          },
          {
            film: '« Seule contre le vent »',
            sportive: 'la cycliste Karine Simard',
            lieuEntrainement: 'sur les routes sinueuses de campagne dès les premières lueurs',
            blessure: 'une déchirure musculaire douloureuse après une chute en peloton',
            finale: 'un triomphe émouvant lors du contre-la-montre des championnats mondiaux',
            blessureAns: 'Une déchirure musculaire douloureuse occasionnée par une chute collective',
            blessureDist1: 'Un désaccord persistant avec son entraîneur de toujours avant le départ',
            blessureDist2: 'Une mauvaise chute survenue lors d’un entraînement à l’aube au village',
            finaleAns: 'Une victoire touchante remportée sur l’épreuve individuelle du contre-la-montre',
            finaleDist1: 'Le choix de devenir l’entraîneuse de son équipe après les championnats mondiaux',
            finaleDist2: 'La confirmation par les spécialistes de la fin définitive de son parcours sportif',
            evidenceBlessure: ['déchirure', 'musculaire', 'peloton'],
            evidenceFinale: ['triomphe', 'contre-la-montre', 'mondiaux'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Dans notre chronique cinéma de ce midi, nous nous penchons sur le long-métrage biographique ${t.film}, qui retrace la vie marquante de ${t.sportive}. Le film débute dans un petit village du Québec où l’on voit la jeune fille s’entraîner à l’aube ${t.lieuEntrainement}. Le récit prend ensuite un tournant dramatique au milieu du film lorsqu’elle subit ${t.blessure}. Alors que tous les spécialistes prédisent la fin de sa carrière, elle entreprend une réadaptation rigoureuse avec l’aide de son entraîneur de toujours. La scène culminante du film montre ${t.finale}, un moment d’une grande intensité émotionnelle qui a profondément touché les spectateurs lors de la première montréalaise.`,
          questions: [
            makeQuestion('Quel genre d’œuvre cinématographique le critique commente-t-il à la radio ?', 'Une biographie filmée retraçant le destin d’une sportive québécoise', 'Un film d’action sur l’entraînement des jeunes dans un petit village', 'Un documentaire historique sur les entraîneurs de sport au Québec', ['biographique', 'film']),
            makeQuestion('Quelle épreuve dramatique compromet temporairement le parcours de l’athlète ?', t.blessureAns, t.blessureDist1, t.blessureDist2, t.evidenceBlessure),
            makeQuestion('Quel accomplissement majeur couronne le dénouement victorieux du long-métrage ?', t.finaleAns, t.finaleDist1, t.finaleDist2, t.evidenceFinale),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Résumé d'un documentaire sur une nageuse de marathon (fictional)
    Object.assign(
      (rand) => {
        const tuples = [
          {
            titre: '« Vaincre le Saint-Laurent »',
            nageuse: 'l’athlète d’endurance Audrey Morin',
            defi: 'la traversée en solitaire d’un grand bras de mer à la rame',
            epreuve: 'trois chavirages successifs au milieu d’une tempête de vagues géantes',
            defiAns: 'Traverser en solitaire un large bras de mer en ramant sans relâche',
            defiDist1: 'Rejoindre le quai à la rame avec l’aide de l’équipe du bateau suiveur',
            defiDist2: 'Accompagner un groupe de nageurs dans les eaux froides du crépuscule',
            epreuveAns: 'Trois retournements d’embarcation subis au cœur de vagues monstrueuses',
            epreuveDist1: 'La perte de contact visuel avec l’équipe présente sur le bateau suiveur',
            epreuveDist2: 'Une collision imprévue contre le quai d’arrivée au milieu du crépuscule',
            evidenceDefi: ['traversée', 'solitaire', 'rame'],
            evidenceEpreuve: ['chavirages', 'tempête', 'vagues'],
          },
          {
            titre: '« Les Eaux boréales »',
            nageuse: 'la spécialiste des longues distances Sandrine Pelletier',
            defi: 'la double traversée du lac Saint-Jean à la nage sans combinaison néoprène',
            epreuve: 'des crampes paralysantes causées par une eau glaciale à treize degrés',
            defiAns: 'Franchir deux fois ce grand lac à la seule force de ses bras',
            defiDist1: 'Suivre l’équipe du bateau suiveur sur les eaux froides du lac',
            defiDist2: 'Traverser le lac en combinaison pour rejoindre le quai au soir',
            epreuveAns: 'Des crampes douloureuses et paralysantes dues à une eau à treize degrés',
            epreuveDist1: 'La panne du moteur du bateau suiveur transportant son équipe de soutien',
            epreuveDist2: 'L’impossibilité de distinguer le quai d’arrivée à travers le crépuscule',
            evidenceDefi: ['traversée', 'lac', 'nage'],
            evidenceEpreuve: ['crampes', 'eau', 'treize'],
          },
          {
            titre: '« Le Fleuve au cœur »',
            nageuse: 'la nageuse en eau libre Geneviève Fabre',
            defi: 'la descente de trois cents kilomètres du fleuve Saint-Laurent sur cinq jours',
            epreuve: 'de puissants courants de marée qui la repoussaient obstinément vers le large',
            defiAns: 'Nager trois cents kilomètres au fil du fleuve Saint-Laurent en cinq journées',
            defiDist1: 'Naviguer sur le fleuve Saint-Laurent à bord du bateau suiveur de l’équipe',
            defiDist2: 'Nager au crépuscule le long du quai pour tester sa fatigue physique en eau froide',
            epreuveAns: 'Des forces de marée contraires qui l’entraînaient malgré elle vers le large',
            epreuveDist1: 'Un éloignement involontaire du bateau suiveur lors des cinq journées de nage',
            epreuveDist2: 'Une dérive continue qui l’éloignait du quai d’arrivée lors du crépuscule final',
            evidenceDefi: ['descente', 'trois', 'cents', 'fleuve'],
            evidenceEpreuve: ['courants', 'marée', 'large'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Le nouveau documentaire ${t.titre} captive actuellement le public dans les cinémas du Québec. Ce film poignant raconte l’histoire de ${t.nageuse}. Dans la première partie, on découvre son entraînement régulier dans les eaux froides pour préparer son plus grand rêve : ${t.defi}. Le réalisateur montre avec sincérité les moments de doute et la fatigue physique lorsque surviennent ${t.epreuve}. Mais guidée par une volonté remarquable et le soutien de son équipe sur le bateau suiveur, elle persévère jour après jour. Les images finales de son arrivée au quai, accueillie par des centaines de personnes émues au crépuscule, livrent un magnifique témoignage de persévérance.`,
          questions: [
            makeQuestion('Quel défi exceptionnel constitue l’objectif central de cette athlète d’endurance ?', t.defiAns, t.defiDist1, t.defiDist2, t.evidenceDefi),
            makeQuestion('Quelle épreuve naturelle extrême menace la réalisation de son exploit sportif ?', t.epreuveAns, t.epreuveDist1, t.epreuveDist2, t.evidenceEpreuve),
            makeQuestion('Quelle atmosphère caractérise l’arrivée finale au quai montrée au dénouement ?', 'Un accueil populaire très émouvant rassemblant une foule nombreuse', 'Un départ discret du quai en bateau suiveur au moment du crépuscule', 'Une arrivée solitaire au quai sans personne pour saluer l’athlète', ['arrivée', 'quai', 'émues']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Accident sur l'autoroute relaté à la radio
    Object.assign(
      (rand) => {
        const tuples = [
          {
            autoroute: 'sur l’autoroute 20 en direction est, près de Saint-Hyacinthe',
            cause: 'une soudaine averse de pluie verglaçante créant une chaussée glissante',
            vehicules: 'un semi-remorque et quatre voitures de tourisme',
            etat: 'trois blessés légers transportés par précaution à l’hôpital',
            causeAns: 'Un épisode imprévu de pluie verglaçante rendant la chaussée très glissante',
            causeDist1: 'La présence de débris de glissière de sécurité tombés sur la voie rapide',
            causeDist2: 'Un bris mécanique survenu lors du changement de voie à sept heures dix',
            etatAns: 'Trois personnes légèrement blessées et transférées vers l’hôpital voisin',
            etatDist1: 'Tous les conducteurs du semi-remorque et des voitures indemnes sur place',
            etatDist2: 'Plusieurs blessés graves parmi les équipes de remorquage sur les voies',
            evidenceCause: ['pluie', 'verglaçante', 'chaussée'],
            evidenceEtat: ['blessés', 'légers', 'hôpital'],
          },
          {
            autoroute: 'sur l’autoroute 40 près de Trois-Rivières',
            cause: 'une bourrasque de neige réduisant la visibilité à zéro',
            vehicules: 'un camion de livraison et trois camionnettes',
            etat: 'deux conducteurs traités sur place pour des coupures mineures',
            causeAns: 'Une violente bourrasque de neige ayant totalement masqué la visibilité',
            causeDist1: 'Un bris mécanique de la remorqueuse heurtant la glissière centrale',
            causeDist2: 'Un bouchon soudain bloquant le changement de voie à sept heures dix',
            etatAns: 'Deux automobilistes soignés sur les lieux mêmes pour de petites coupures',
            etatDist1: 'Tous les conducteurs des camionnettes indemnes et repartis aussitôt',
            etatDist2: 'Plusieurs blessés graves transportés d’urgence vers l’hôpital voisin',
            evidenceCause: ['bourrasque', 'neige', 'visibilité'],
            evidenceEtat: ['conducteurs', 'traités', 'coupures'],
          },
          {
            autoroute: 'sur l’autoroute 15 nord à la hauteur de Mirabel',
            cause: 'une nappe de brouillard givrant dense sur le pont routier',
            vehicules: 'cinq véhicules immobilisés en portefeuille',
            etat: 'dégâts matériels importants sans aucun blessé grave à déplorer',
            causeAns: 'Une nappe de brouillard givrant particulièrement dense sur le viaduc',
            causeDist1: 'Un blocage des voies causé par les remorqueuses à sept heures dix',
            causeDist2: 'Un bris de glissière de sécurité survenu avant le changement de voie',
            etatAns: 'D’importants dégâts matériels sur les véhicules mais aucun blessé sérieux',
            etatDist1: 'Cinq automobilistes blessés lors du choc contre la glissière centrale',
            etatDist2: 'Plusieurs blessés légers transférés par précaution à l’hôpital voisin',
            evidenceCause: ['brouillard', 'givrant', 'pont'],
            evidenceEtat: ['dégâts', 'matériels', 'blessé'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Bulletin d’information routière d’urgence sur les ondes d’Info-Circulation. Un carambolage important perturbe actuellement la circulation ${t.autoroute}. Selon les policiers de la Sûreté du Québec dépêchés sur les lieux, la suite d’événements a débuté vers sept heures dix avec ${t.cause}. Un premier véhicule a perdu l’adhérence lors d’un changement de voie, heurtant la glissière de sécurité centrale. Incapables de freiner à temps sur la chaussée, ${t.vehicules} sont entrés en collision successive. Les services d’urgence font état de : ${t.etat}. Les remorqueuses sont à l’œuvre pour dégager les voies obstruées, mais un bouchon de dix kilomètres s’est formé. Les automobilistes doivent privilégier la route secondaire 116 pour contourner le secteur.`,
          questions: [
            makeQuestion('Quel événement de la circulation routière est rapporté dans ce flash d’information ?', 'Un carambolage sérieux survenu sur une chaussée autoroutière glissante', 'Des travaux de réfection de la glissière de sécurité sur dix kilomètres', 'La fermeture définitive de la route secondaire 116 pour les remorqueuses', ['carambolage', 'circulation']),
            makeQuestion('Quel phénomène météorologique a causé la perte de maîtrise du premier véhicule ?', t.causeAns, t.causeDist1, t.causeDist2, t.evidenceCause),
            makeQuestion('Quel est le bilan humain établi par les équipes de secours sur les lieux ?', t.etatAns, t.etatDist1, t.etatDist2, t.evidenceEtat),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Accident sur un pont métropolitain relaté à la radio
    Object.assign(
      (rand) => {
        const tuples = [
          {
            pont: 'le pont Jacques-Cartier vers Montréal',
            incident: 'l’éclatement d’un pneu sur une camionnette chargée d’outils',
            remorquage: 'la fermeture de deux voies sur trois pendant deux heures',
            impact: 'un ralentissement s’étirant jusqu’à Longueuil',
            attente: 'quarante-cinq minutes',
            incidentAns: 'La crevaison subite d’un pneu sur un véhicule utilitaire lourdement chargé',
            incidentDist1: 'La manœuvre imprudente de deux voitures s’emboutissant sur le bas-côté',
            incidentDist2: 'La fermeture imprévue de deux voies sur trois par les dépanneuses d’urgence',
            attenteAns: 'Près de trois quarts d’heure avant la dispersion complète des files d’attente',
            attenteDist1: 'Moins de dix minutes d’attente avant la réouverture des voies',
            attenteDist2: 'Moins de cinq minutes selon les ambulanciers arrivés sur les lieux',
            evidenceIncident: ['éclatement', 'pneu', 'camionnette'],
            evidenceAttente: ['quarante-cinq', 'minutes'],
          },
          {
            pont: 'le pont Pierre-Laporte en direction de Québec',
            incident: 'une panne de moteur soudaine sur un autobus de transport urbain',
            remorquage: 'l’intervention délicate d’une dépanneuse lourde spécialisée',
            impact: 'une congestion monstre sur l’autoroute Henri-IV',
            attente: 'cinquante minutes',
            incidentAns: 'Une panne mécanique subite immobilisant un autobus de transport urbain',
            incidentDist1: 'L’accrochage de la dépanneuse lourde avec deux voitures sur le bas-côté',
            incidentDist2: 'Une collision entre deux voitures suivant l’ambulance sur le pont',
            attenteAns: 'Environ cinquante minutes pour que le flot de véhicules se normalise',
            attenteDist1: 'Moins de dix minutes dès l’arrivée de la dépanneuse lourde sur place',
            attenteDist2: 'Plus de deux heures complètes pour dégager l’autobus du bas-côté',
            evidenceIncident: ['panne', 'moteur', 'autobus'],
            evidenceAttente: ['cinquante', 'minutes'],
          },
          {
            pont: 'le pont Champlain en direction de la Rive-Sud',
            incident: 'la chute d’un chargement de planches de bois sur la voie du centre',
            remorquage: 'le nettoyage complet de la chaussée par les équipes du ministère',
            impact: 'un blocage quasi total de la circulation matinale',
            attente: 'une heure',
            incidentAns: 'L’éparpillement accidentel de matériaux en bois encombrant la voie centrale',
            incidentDist1: 'L’arrêt imprévu des équipes de nettoyage du ministère sur le bas-côté',
            incidentDist2: 'Une manœuvre brusque d’ambulanciers tentant de contourner le secteur',
            attenteAns: 'Une bonne heure d’attente pour résorber l’engorgement de la circulation',
            attenteDist1: 'Moins de dix minutes dès que les équipes du ministère ont nettoyé',
            attenteDist2: 'Plus de deux heures pour que les automobilistes évitent le secteur',
            evidenceIncident: ['chargement', 'planches', 'bois'],
            evidenceAttente: ['heure', 'résorber'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Ici le point sur la circulation métropolitaine de huit heures quinze. La circulation est particulièrement difficile ce matin sur ${t.pont}. Tout a commencé vers sept heures quarante avec ${t.incident}. Le conducteur a réussi à manœuvrer vers le bas-côté, mais deux automobilistes qui le suivaient de trop près se sont emboutis en tentant de l’éviter. Cet incident a entraîné ${t.remorquage}, provoquant ${t.impact}. Les ambulanciers arrivés rapidement confirment qu’aucun conducteur n’a subi de blessure grave. Le ministère des Transports annonce que toutes les voies seront rouvertes sous peu, mais il faudra au moins ${t.attente} pour résorber complètement le refoulement des véhicules.`,
          questions: [
            makeQuestion('Quelle situation d’entrave routière est analysée par le chroniqueur ?', 'Un incident sur un pont métropolitain paralysant la circulation', 'Des travaux réguliers du ministère des Transports sur toutes les voies', 'Une intervention des ambulanciers pour dégager le bas-côté du pont', ['circulation', 'pont']),
            makeQuestion('Quel événement initial a provoqué les collisions secondaires sur le pont ?', t.incidentAns, t.incidentDist1, t.incidentDist2, t.evidenceIncident),
            makeQuestion('Combien de temps faudra-t-il environ pour rétablir une circulation fluide ?', t.attenteAns, t.attenteDist1, t.attenteDist2, t.evidenceAttente),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Récit de film sur une championne de ski acrobatique (fictional)
    Object.assign(
      (rand) => {
        const tuples = [
          {
            film: '« Les Sœurs volantes »',
            sujet: 'les sœurs Léa et Chloé Vachon ont atteint les sommets du ski acrobatique',
            epreuve: 'la pression médiatique continue et les sacrifices de l’entraînement quotidien',
            podium: 'leur doublé historique sur le podium mondial',
            sujetAns: 'Deux sœurs québécoises atteignant ensemble l’élite mondiale du ski acrobatique',
            sujetDist1: 'Une famille québécoise qui décide d’abandonner le sport après des doutes',
            sujetDist2: 'Des entraîneurs de ski acrobatique confrontés aux doutes de leurs proches',
            epreuveAns: 'La constante pression des médias et la dureté des entraînements de tous les jours',
            epreuveDist1: 'Les conflits continuels au sein de la famille québécoise avant chaque compétition',
            epreuveDist2: 'Le refus des proches de soutenir les deux sœurs lors des moments de doute vécus',
            podiumAns: 'Leur doublé historique célébré sur les marches du podium mondial',
            podiumDist1: 'Leur abandon définitif du ski de compétition lors des premières scènes',
            podiumDist2: 'Une séparation douloureuse entre les deux sœurs pour quitter la famille',
            evidenceSujet: ['sœurs', 'sommets', 'acrobatique'],
            evidenceEpreuve: ['pression', 'médiatique', 'sacrifices'],
            evidencePodium: ['doublé', 'podium', 'mondial'],
          },
          {
            film: '« Piste noire »',
            sujet: 'la championne Laurie Mercier a atteint les sommets du ski acrobatique',
            epreuve: 'des blessures répétées aux genoux nécessitant plusieurs chirurgies délicates',
            podium: 'sa médaille d’or conquise sous une pluie battante lors de la manche finale',
            sujetAns: 'Une skieuse québécoise qui gravit les échelons du ski acrobatique international',
            sujetDist1: 'Une famille québécoise refusant que leur fille pratique le ski de compétition',
            sujetDist2: 'Une équipe de skieuses qui renonce à la compétition après des doutes sportifs',
            epreuveAns: 'Des atteintes sérieuses aux genoux ayant nécessité plusieurs chirurgies délicates',
            epreuveDist1: 'Le manque de solidarité de ses proches face aux doutes nés de la compétition',
            epreuveDist2: 'Des tensions familiales apparues lors des premières manches finales sous la pluie',
            podiumAns: 'Sa conquête héroïque de la médaille d’or sous des trombes d’eau',
            podiumDist1: 'Une blessure définitive au genou subie lors de la manche finale',
            podiumDist2: 'L’abandon de la compétition malgré la solidarité de ses proches',
            evidenceSujet: ['championne', 'sommets', 'acrobatique'],
            evidenceEpreuve: ['blessures', 'genoux', 'chirurgies'],
            evidencePodium: ['médaille', 'or', 'pluie'],
          },
          {
            film: '« L’Envol de Chloé »',
            sujet: 'la skieuse Camille Fortin a atteint les sommets du ski acrobatique',
            epreuve: 'une violente commotion cérébrale survenue lors d’un saut d’entraînement périlleux',
            podium: 'sa victoire remarquable lors de la Coupe des nations en ski acrobatique',
            sujetAns: 'Le parcours inspirant d’une athlète au sommet du ski acrobatique international',
            sujetDist1: 'Une famille québécoise qui refuse de soutenir une jeune skieuse en compétition',
            sujetDist2: 'Le combat d’une skieuse acrobatique doutant de la solidarité de ses proches',
            epreuveAns: 'Une commotion cérébrale aiguë subie après un saut d’entraînement dangereux',
            epreuveDist1: 'Le refus de sa famille de l’accompagner lors de la Coupe des nations',
            epreuveDist2: 'La perte complète de solidarité de ses proches après un saut manqué',
            podiumAns: 'Son éclatant triomphe lors de la prestigieuse Coupe des nations',
            podiumDist1: 'Une chute dramatique lors de la finale de la Coupe des nations',
            podiumDist2: 'L’abandon du sport d’élite pour rester auprès de ses proches',
            evidenceSujet: ['skieuse', 'sommets', 'acrobatique'],
            evidenceEpreuve: ['commotion', 'cérébrale', 'entraînement'],
            evidencePodium: ['victoire', 'coupe', 'acrobatique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Nous terminons notre tour d’horizon culturel avec le drame sportif ${t.film}, qui connaît un beau succès en salle. Le scénario retrace le parcours où ${t.sujet}. Dès les premières scènes, la caméra montre le quotidien de cette famille québécoise engagée dans le sport de compétition. Le film présente avec réalisme ${t.epreuve}. La solidarité entre les proches leur permet toutefois de surmonter les moments de doute. Le point fort du film reconstitue ${t.podium}, un moment marquant de leur parcours sportif. Une œuvre touchante et accessible que nous vous recommandons de voir en famille ce week-end.`,
          questions: [
            makeQuestion('Quelle histoire humaine et sportive ce long-métrage met-il à l’honneur ?', t.sujetAns, t.sujetDist1, t.sujetDist2, t.evidenceSujet),
            makeQuestion('Quelle difficulté majeure inhérente au sport d’élite le film dépeint-il ?', t.epreuveAns, t.epreuveDist1, t.epreuveDist2, t.evidenceEpreuve),
            makeQuestion('Quel événement mémorable clôt le parcours de la sportive à la fin du film ?', t.podiumAns, t.podiumDist1, t.podiumDist2, t.evidencePodium),
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
    // Scenario 0 (Template, Ex 0): Changement d'études vers la santé
    Object.assign(
      (rand) => {
        const tuples = [
          {
            amie: 'Sophie',
            ancien: 'la comptabilité financière au cégep',
            nouveau: 'techniques de soins infirmiers',
            motif: 'le désir sincère d’aider concrètement les patients',
            stage: 'les stages cliniques en milieu hospitalier dès la première session',
            nouveauAns: 'Rejoindre une formation collégiale en soins infirmiers',
            nouveauDist1: 'Poursuivre un cheminement avancé en comptabilité financière',
            nouveauDist2: 'Garder son poste de bureau sans s’inscrire au nouveau programme',
            stageAns: 'La réalisation de stages cliniques à l’hôpital dès le début du parcours',
            stageDist1: 'Des horaires de cours nettement allégés pour rassurer ses parents dès la rentrée',
            stageDist2: 'La possibilité de travailler dans un bureau hospitalier sans contact avec les patients',
            evidenceNouveau: ['soins', 'infirmiers'],
            evidenceStage: ['stages', 'cliniques', 'hospitalier'],
          },
          {
            amie: 'Marianne',
            ancien: 'l’informatique de gestion de bureau',
            nouveau: 'inhalothérapie et assistance respiratoire',
            motif: 'la volonté d’exercer un métier utile et actif en santé',
            stage: 'les séances de pratique avec des simulateurs haute fidélité',
            nouveauAns: 'Bifurquer vers les études en inhalothérapie et soins respiratoires',
            nouveauDist1: 'Poursuivre un stage pratique prolongé en informatique de gestion de bureau',
            nouveauDist2: 'Conserver son travail de bureau tout en abandonnant le domaine de la santé',
            stageAns: 'Les ateliers pratiques réguliers réalisés sur des simulateurs de pointe',
            stageDist1: 'La garantie d’horaires nettement moins exigeants pour rassurer sa propre famille',
            stageDist2: 'L’analyse détaillée de tableaux de calculs appliqués aux soins respiratoires',
            evidenceNouveau: ['inhalothérapie', 'respiratoire'],
            evidenceStage: ['simulateurs', 'haute', 'fidélité'],
          },
          {
            amie: 'Camille',
            ancien: 'l’administration des affaires de bureau',
            nouveau: 'travail social et relation d’aide',
            motif: 'le souhait profond d’accompagner des personnes vulnérables',
            stage: 'les interventions directes auprès des organismes communautaires',
            nouveauAns: 'Choisir la filière du travail social et de l’intervention d’aide',
            nouveauDist1: 'Poursuivre ses études collégiales en administration des affaires',
            nouveauDist2: 'Rester dans un emploi de bureau pour rassurer ses parents inquiets',
            stageAns: 'L’action directe sur le terrain auprès d’organismes communautaires',
            stageDist1: 'La possibilité d’éviter les horaires particulièrement exigeants de son programme',
            stageDist2: 'Le retour garanti vers des tâches de bureau en gestion administrative',
            evidenceNouveau: ['travail', 'social', 'aide'],
            evidenceStage: ['organismes', 'communautaires'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Julie ! Je voulais te parler de ma grande décision scolaire. J’ai officiellement quitté ${t.ancien} pour m’inscrire en ${t.nouveau}. J’ai réfléchi pendant des mois avant de faire le saut. Même si mon ancien programme m’offrait de bons débouchés de bureau, je me sentais isolée et je m’ennuyais devant mes tableaux de calculs toute la journée. Ce qui a motivé mon changement, c’est ${t.motif}. Dans ma nouvelle filière, ce qui me stimule par-dessus tout, ce sont ${t.stage}. J’ai l’impression que chaque heure de cours a enfin un sens pratique pour mon avenir. Mes parents étaient un peu inquiets au début en raison des horaires parfois exigeants, mais ils voient bien que j’ai retrouvé ma motivation et mon énergie !`,
          questions: [
            makeQuestion('Quelle réorientation d’études collégiales l’amie annonce-t-elle ?', t.nouveauAns, t.nouveauDist1, t.nouveauDist2, t.evidenceNouveau),
            makeQuestion('Quelle frustration éprouvait-elle dans son ancienne formation collégiale ?', 'Le sentiment de solitude et l’ennui causé par des tâches de bureau', 'Des horaires de cours trop exigeants critiqués par ses propres parents', 'Une absence totale de débouchés professionnels pour le travail de bureau', ['isolée', 'ennuyais', 'tableaux']),
            makeQuestion('Quel volet pratique de son nouveau programme stimule le plus son enthousiasme ?', t.stageAns, t.stageDist1, t.stageDist2, t.evidenceStage),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Changement d'études vers l'informatique ou le design
    Object.assign(
      (rand) => {
        const tuples = [
          {
            amie: 'Nadia',
            depart: 'le droit à l’université',
            arrivee: 'développement Web et création d’applications',
            raison: 'la créativité et les horaires flexibles de travail à distance',
            arriveeAns: 'La programmation Web et le développement d’applications interactives',
            arriveeDist1: 'Des études collégiales et universitaires approfondies en théorie du droit',
            arriveeDist2: 'Un programme purement théorique et général sans aucun travail en équipe',
            raisonAns: 'Le volet créatif des projets et la flexibilité du télétravail',
            raisonDist1: 'La reconnaissance automatique et complète de tous ses trimestres de droit',
            raisonDist2: 'L’apprentissage purement théorique sans la moindre tâche pratique en équipe',
            evidenceArrivee: ['développement', 'applications'],
            evidenceRaison: ['créativité', 'horaires', 'distance'],
          },
          {
            amie: 'Mélanie',
            depart: 'la littérature comparée',
            arrivee: 'design graphique et communication visuelle',
            raison: 'la possibilité de concevoir des projets visuels concrets',
            arriveeAns: 'Le design graphique et la conception de projets visuels',
            arriveeDist1: 'La poursuite d’un cursus théorique en littérature comparée',
            arriveeDist2: 'L’inscription à des cours généraux de lettres sans projet',
            raisonAns: 'L’opportunité stimulante de réaliser des créations visuelles palpables',
            raisonDist1: 'La possibilité de valider l’ensemble de ses cours théoriques sans projets',
            raisonDist2: 'L’assurance de travailler de façon autonome sans les professeurs du département',
            evidenceArrivee: ['design', 'graphique', 'communication'],
            evidenceRaison: ['concevoir', 'projets', 'visuels'],
          },
          {
            amie: 'Valérie',
            depart: 'les sciences politiques',
            arrivee: 'analyse de données et cybersécurité',
            raison: 'la forte demande de spécialistes et les salaires d’entrée motivants',
            arriveeAns: 'L’analyse de mégadonnées et les techniques de cybersécurité',
            arriveeDist1: 'La poursuite prolongée d’études axées sur les sciences politiques',
            arriveeDist2: 'Un cursus universitaire purement théorique sans manipulation de données',
            raisonAns: 'Les débouchés professionnels nombreux et une rémunération de départ attractive',
            raisonDist1: 'L’intérêt intellectuel exclusif pour les cours théoriques de son premier choix',
            raisonDist2: 'La perspective rassurante d’éviter tout travail d’équipe dans le département',
            evidenceArrivee: ['données', 'cybersécurité'],
            evidenceRaison: ['spécialistes', 'salaires'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Tu as l’air rayonnante ce matin, ${t.amie} ! — Oui, et pour cause ! J’ai enfin osé faire ma demande pour changer de programme. J’abandonne ${t.depart} pour m’inscrire en ${t.arrivee}. Pendant deux sessions, j’ai essayé de me convaincre que mon premier choix me plairait, mais l’apprentissage théorique me demandait trop d’énergie sans m’allumer. J’ai découvert que ce qui me passionne réellement, c’est ${t.raison}. Dans mon nouveau département, on travaille régulièrement en équipe sur des projets pratiques et les enseignants sont très disponibles. C’est tellement plus concret et stimulant ! Mes cours généraux réussis sont reconnus, alors je ne perds aucun trimestre. C’est la meilleure décision que j’aie prise !`,
          questions: [
            makeQuestion('Vers quelle nouvelle orientation professionnelle l’étudiante a-t-elle choisi de s’engager ?', t.arriveeAns, t.arriveeDist1, t.arriveeDist2, t.evidenceArrivee),
            makeQuestion('Quel attrait principal motive son nouvel enthousiasme pour cette discipline ?', t.raisonAns, t.raisonDist1, t.raisonDist2, t.evidenceRaison),
            makeQuestion('Qu’advient-il des cours généraux déjà complétés avec succès par l’étudiante ?', 'Leurs crédits sont pleinement validés afin d’éviter tout retard dans le cursus', 'Ils doivent être entièrement repris afin de pouvoir intégrer les projets d’équipe', 'Ils sont automatiquement annulés en raison du changement de programme après deux sessions', ['cours', 'généraux', 'reconnus']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Collègue expliquant son choix de voiture électrique
    Object.assign(
      (rand) => {
        const tuples = [
          {
            collegue: 'Marc',
            modele: 'une berline cent pour cent électrique',
            subvention: 'douze mille dollars en rabais gouvernementaux combinés',
            borne: 'une borne de recharge installée dans mon entrée de garage',
            subventionAns: 'L’obtention de douze mille dollars de rabais publics cumulés',
            subventionDist1: 'Une réduction de ses dépenses d’essence payée par son employeur',
            subventionDist2: 'Le remboursement mensuel de son stationnement au bureau chaque mois',
            borneAns: 'La recharge sur borne privée dans l’entrée de son propre garage',
            borneDist1: 'Le branchement gratuit dans le stationnement des employés du bureau',
            borneDist2: 'Un plein d’électricité effectué chaque soir à la station d’essence',
            evidenceSubvention: ['douze', 'mille', 'rabais'],
            evidenceBorne: ['borne', 'entrée', 'garage'],
          },
          {
            collegue: 'Patrick',
            modele: 'un petit véhicule multisegment électrique',
            subvention: 'neuf mille dollars d’incitatifs provinciaux et fédéraux',
            borne: 'la recharge nocturne sur mon circuit électrique résidentiel',
            subventionAns: 'Une remise de neuf mille dollars en incitatifs provinciaux et fédéraux',
            subventionDist1: 'La prise en charge de quatre cents dollars d’essence par l’entreprise',
            subventionDist2: 'Le remboursement total de ses soixante kilomètres de route quotidiens',
            borneAns: 'La recharge durant la nuit sur son circuit électrique de maison',
            borneDist1: 'Le rechargement de nuit sur les prises du stationnement du bureau',
            borneDist2: 'Le branchement direct à une borne rapide d’une station d’essence',
            evidenceSubvention: ['neuf', 'mille', 'incitatifs'],
            evidenceBorne: ['recharge', 'nocturne', 'résidentiel'],
          },
          {
            collegue: 'Simon',
            modele: 'une voiture compacte à batterie longue autonomie',
            subvention: 'dix mille dollars de subventions écologiques à l’achat',
            borne: 'une borne de recharge murale installée à mon domicile',
            subventionAns: 'Une aide financière de dix mille dollars en subventions écologiques',
            subventionDist1: 'Une compensation de son employeur pour ses quatre cents dollars d’essence',
            subventionDist2: 'Un rabais commercial sur l’électricité consommée au bureau par la voiture',
            borneAns: 'L’installation d’une borne de recharge murale à son domicile',
            borneDist1: 'Une prise de recharge installée au stationnement de son travail',
            borneDist2: 'Un accord pour charger sa batterie gratuitement à la station d’essence',
            evidenceSubvention: ['dix', 'mille', 'subventions'],
            evidenceBorne: ['borne', 'murale', 'domicile'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Tu as vu le nouveau véhicule dans le stationnement des employés ? C’est le mien ! J’ai finalement fait le saut et choisi ${t.modele}. Je faisais soixante kilomètres par jour pour venir au bureau et je dépensais près de quatre cents dollars d’essence chaque mois. En faisant mes calculs financiers, j’ai réalisé qu’avec ${t.subvention}, le paiement mensuel était comparable à mon ancien véhicule à essence. En plus, grâce à ${t.borne}, faire le plein d’énergie me coûte à peine trois dollars par nuit d’électricité. L’entretien est minime : plus de vidange d’huile, moins d’usure des freins grâce au système régénératif, et une conduite silencieuse dans la circulation dense. Je ne regrette absolument pas mon choix !`,
          questions: [
            makeQuestion('Quel achat personnel majeur le collègue explique-t-il avec fierté ?', 'L’acquisition d’une automobile entièrement électrique pour ses trajets', 'Le remplacement de son ancien véhicule par une voiture à essence neuve', 'La pose d’un système régénératif sur son ancienne voiture à essence', ['véhicule', 'essence']),
            makeQuestion('Quel coup de pouce financier public a pesé dans sa décision d’achat ?', t.subventionAns, t.subventionDist1, t.subventionDist2, t.evidenceSubvention),
            makeQuestion('Quelle solution de recharge pratique lui assure de faire le plein à peu de frais ?', t.borneAns, t.borneDist1, t.borneDist2, t.evidenceBorne),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Choix d'une voiture électrique pour la famille
    Object.assign(
      (rand) => {
        const tuples = [
          {
            nom: 'François',
            autonomie: 'quatre cent cinquante kilomètres avec une pleine recharge',
            epargne: 'économiser plus de trois mille dollars par an en carburant',
            avantage: 'l’accès aux voies réservées qui nous fait gagner vingt minutes chaque matin',
            autonomieAns: 'Une portée de quatre cent cinquante kilomètres sur une seule recharge',
            autonomieDist1: 'Une autonomie limitée aux trajets de fin de semaine vers les activités',
            autonomieDist2: 'Une autonomie insuffisante obligeant à s’arrêter souvent sur l’autoroute',
            avantageQ: 'Quel gain de temps appréciable ce véhicule procure-t-il le matin ?',
            avantageAns: 'L’emprunt des voies réservées faisant épargner vingt minutes chaque matin',
            avantageDist1: 'Le passage rapide à la station d’essence chaque matin grâce au nouveau véhicule',
            avantageDist2: 'Un trajet quotidien direct sur l’autoroute sans emprunter les voies réservées',
            evidenceAutonomie: ['quatre', 'cent', 'cinquante'],
            evidenceAvantage: ['voies', 'réservées', 'minutes'],
          },
          {
            nom: 'Benoît',
            autonomie: 'quatre cents kilomètres d’autonomie même en période hivernale',
            epargne: 'réduire nos coûts de transport familial de moitié chaque mois',
            avantage: 'la gratuité complète sur certains ponts à péage de la région',
            autonomieAns: 'Une autonomie de quatre cents kilomètres même sous les rigueurs du froid',
            autonomieDist1: 'Une autonomie suffisante uniquement pendant les saisons plus chaudes hors de l’hiver',
            autonomieDist2: 'Une portée de cent kilomètres strictement réservée aux sorties sportives familiales',
            avantageQ: 'Quel allègement financier routier fort appréciable la famille obtient-elle ?',
            avantageAns: 'La gratuité accordée lors de la traversée de certains ponts à péage',
            avantageDist1: 'Un tarif réduit sur l’essence lors des activités sportives de fin de semaine',
            avantageDist2: 'La gratuité totale pour toutes les activités sportives organisées des enfants',
            evidenceAutonomie: ['quatre', 'cents', 'hivernale'],
            evidenceAvantage: ['gratuité', 'ponts', 'péage'],
          },
          {
            nom: 'Guillaume',
            autonomie: 'cinq cents kilomètres d’autonomie pour les trajets interurbains',
            epargne: 'rentabiliser la borne de recharge en moins de six mois',
            avantage: 'la réduction marquée de soixante-dix pour cent de notre consommation d’énergie fossile',
            autonomieAns: 'Une distance franchissable de cinq cents kilomètres lors des trajets interurbains',
            autonomieDist1: 'Une autonomie de cinq cents kilomètres strictement limitée aux petites rues du quartier',
            autonomieDist2: 'Une portée insuffisante imposant des arrêts d’urgence fréquents en station d’essence',
            avantageQ: 'Quel impact environnemental direct ce choix procure-t-il au ménage ?',
            avantageAns: 'Un recul de soixante-dix pour cent dans leurs besoins en énergie fossile',
            avantageDist1: 'L’élimination presque totale de l’ensemble de leurs dépenses d’énergie pour la maison',
            avantageDist2: 'Une rentabilisation complète de la nouvelle borne de recharge en quelques jours',
            evidenceAutonomie: ['cinq', 'cents', 'interurbains'],
            evidenceAvantage: ['soixante-dix', 'énergie', 'fossile'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Sylvain ! Tu me demandais pourquoi on avait opté pour un modèle électrique familial. Avec les enfants qui font des activités sportives aux quatre coins de la région chaque fin de semaine, on passait notre vie à la station d’essence. Notre nouvelle voiture nous offre ${t.autonomie}, ce qui élimine notre inquiétude sur l’autoroute. Au niveau du budget familial, les calculs sont clairs : nous allons ${t.epargne}. Mais au-delà de l’aspect financier, il y a un privilège quotidien fort appréciable : ${t.avantage}. Le véhicule est spacieux, confortable, et les enfants adorent le toit vitré panoramique. Pour notre famille, c’est une excellente formule de déplacement au quotidien !`,
          questions: [
            makeQuestion('Pourquoi cette famille a-t-elle décidé d’adopter une voiture électrique ?', 'Choisir un véhicule familial économique et adapté à leurs nombreux trajets', 'Éviter l’autoroute en conduisant les enfants à leurs activités sportives régulières', 'Acheter une voiture à essence plus spacieuse dotée d’un toit panoramique vitré', ['voiture', 'familial']),
            makeQuestion('Quelle autonomie rassurante ce modèle offre-t-il sur la route ?', t.autonomieAns, t.autonomieDist1, t.autonomieDist2, t.evidenceAutonomie),
            makeQuestion(t.avantageQ, t.avantageAns, t.avantageDist1, t.avantageDist2, t.evidenceAvantage),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Changement d'études vers l'enseignement primaire
    Object.assign(
      (rand) => {
        const tuples = [
          {
            collegue: 'Élodie',
            passe: 'le marketing publicitaire en agence',
            avenir: 'enseignement préscolaire et primaire',
            vocation: 'transmettre le goût d’apprendre et voir grandir les enfants',
            avenirAns: 'L’enseignement auprès des élèves du préscolaire et du primaire',
            avenirDist1: 'Un certificat universitaire spécialisé et avancé en marketing publicitaire',
            avenirDist2: 'La gestion administrative quotidienne de dossiers commerciaux au sein d’une agence',
            vocationAns: 'Développer le goût du savoir et accompagner l’épanouissement des enfants',
            vocationDist1: 'Travailler sur de nouveaux dossiers commerciaux au sein d’une école de quartier',
            vocationDist2: 'Obtenir rapidement un poste de direction en agence après son stage d’observation',
            evidenceAvenir: ['préscolaire', 'primaire'],
            evidenceVocation: ['apprendre', 'grandir', 'enfants'],
          },
          {
            collegue: 'Isabelle',
            passe: 'les services commerciaux d’une grande entreprise',
            avenir: 'adaptation scolaire pour élèves en difficulté',
            vocation: 'soutenir les jeunes pour surmonter leurs difficultés d’apprentissage',
            avenirAns: 'L’adaptation scolaire destinée aux enfants présentant des difficultés',
            avenirDist1: 'La direction de projets de grande envergure en relations publiques corporatives',
            avenirDist2: 'La gestion quotidienne de dossiers commerciaux pour de grands groupes d’écoles',
            vocationAns: 'Aider les enfants vulnérables à franchir leurs défis scolaires',
            vocationDist1: 'Gérer d’importants dossiers commerciaux dans une classe de son école de quartier',
            vocationDist2: 'Assurer les relations publiques corporatives auprès de l’ensemble de son école',
            evidenceAvenir: ['adaptation', 'scolaire', 'difficulté'],
            evidenceVocation: ['soutenir', 'difficultés', 'apprentissage'],
          },
          {
            collegue: 'Stéphanie',
            passe: 'la gestion commerciale et vente',
            avenir: 'enseignement du français langue seconde',
            vocation: 'favoriser l’apprentissage des jeunes qui arrivent au pays',
            avenirAns: 'L’enseignement du français comme langue seconde dans les classes',
            avenirDist1: 'Un baccalauréat spécialisé en gestion commerciale et techniques de vente',
            avenirDist2: 'Un poste d’observation prolongé dans une agence gérant des dossiers commerciaux',
            vocationAns: 'Faciliter l’intégration linguistique des jeunes nouvellement installés',
            vocationDist1: 'Développer des dossiers commerciaux novateurs adaptés à tout le réseau scolaire',
            vocationDist2: 'Faire de la gestion commerciale et financière auprès de plusieurs écoles de quartier',
            evidenceAvenir: ['français', 'langue', 'seconde'],
            evidenceVocation: ['apprentissage', 'arrivent', 'pays'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Je dois te raconter mon grand virage professionnel ! J’ai remis ma démission de mon emploi dans ${t.passe} pour retourner sur les bancs d’école en ${t.avenir}. Dans mon ancien travail, je passais mes journées sur des dossiers commerciaux et je ne trouvais plus de sens à mon quotidien. Ma véritable vocation est de ${t.vocation}. Le baccalauréat dure quatre ans, mais dès l’automne, je serai en stage d’observation dans une classe d’école de quartier. Le gouvernement offre d’ailleurs de bonnes bourses d’études pour encourager la relève dans le réseau scolaire. C’est un grand changement dans ma vie, mais pour la première fois, je me sens à ma place !`,
          questions: [
            makeQuestion('Quel virage d’études universitaires la collègue annonce-t-elle ?', t.avenirAns, t.avenirDist1, t.avenirDist2, t.evidenceAvenir),
            makeQuestion('Quelle vocation profonde l’anime dans ce nouveau choix de carrière ?', t.vocationAns, t.vocationDist1, t.vocationDist2, t.evidenceVocation),
            makeQuestion('Quelle mesure financière publique soutient sa reconversion professionnelle ?', 'Des bourses gouvernementales instituées pour soutenir la relève scolaire', 'Une prime de départ versée par son ancienne agence de dossiers commerciaux', 'Une pleine rémunération versée dès son stage d’observation dans une classe', ['bourses', 'relève', 'scolaire']),
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
        const tuples = [
          {
            formatrice: 'Karine',
            outil: 'des démonte-pneus souples pour ne pas pincer la jante',
            methode: 'plonger la chambre à air gonflée dans un bac d’eau claire',
            sechage: 'frotter la zone avec du papier abrasif avant de poser la colle',
            methodeAns: 'Immerger le tube gonflé dans une cuvette d’eau propre',
            methodeDist1: 'Passer doucement ses doigts à l’intérieur du pneu sans sortir la chambre',
            methodeDist2: 'Presser fermement la valve sans plonger le caoutchouc dans le bac d’eau',
            sechageAns: 'Frotter la surface au papier abrasif avant d’enduire de colle',
            sechageDist1: 'Remettre la chambre à air dans le bac d’eau claire juste après la craie',
            sechageDist2: 'Appliquer immédiatement la colle sans frotter la surface au papier abrasif',
            evidenceMethode: ['chambre', 'bac', 'eau'],
            evidenceSechage: ['frotter', 'papier', 'abrasif'],
          },
          {
            formatrice: 'Laurence',
            outil: 'deux leviers en plastique pour déloger la tringle du pneu',
            methode: 'repérer attentivement le sifflement d’air en approchant l’oreille',
            sechage: 'nettoyer la surface avec un linge sec et attendre deux minutes',
            methodeAns: 'Déceler le bruit de fuite d’air en approchant son oreille de la paroi',
            methodeDist1: 'Passer la main à l’intérieur du pneu avant de déloger la tringle',
            methodeDist2: 'Presser la paroi du pneu sans approcher l’oreille de la chambre',
            sechageAns: 'Essuyer la zone avec un chiffon propre et patienter deux minutes',
            sechageDist1: 'Coller la rustine tout de suite sans attendre les deux minutes prescrites',
            sechageDist2: 'Laver la zone sous un jet d’eau sans utiliser le moindre linge sec',
            evidenceMethode: ['sifflement', 'air', 'oreille'],
            evidenceSechage: ['linge', 'attendre', 'minutes'],
          },
          {
            formatrice: 'Julie',
            outil: 'une clé plate pour dévisser l’axe de la roue sans forcer',
            methode: 'passer doucement les doigts le long de la chambre à air gonflée',
            sechage: 'appliquer une fine couche de dissolvant sur la zone ciblée',
            methodeAns: 'Glisser délicatement ses doigts le long du tube pour sentir le flux d’air',
            methodeDist1: 'Dévisser l’axe de la roue avec la clé plate dès l’apparition d’une fuite',
            methodeDist2: 'Presser la chambre à air sans faire glisser les doigts le long de la paroi',
            sechageAns: 'Étaler une mince couche de dissolvant sur la surface ciblée',
            sechageDist1: 'Appliquer directement la colle sur le caoutchouc sans couche de dissolvant',
            sechageDist2: 'Retirer l’épine du pneu avec la clé plate avant d’étaler le dissolvant',
            evidenceMethode: ['doigts', 'chambre', 'air'],
            evidenceSechage: ['dissolvant', 'zone', 'ciblée'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les participants de notre atelier de mécanique vélo. Je suis ${t.formatrice} et je vais vous guider pas à pas pour réparer une crevaison de pneu comme des professionnels. Première étape : retirez la roue du cadre et utilisez ${t.outil} afin de sortir délicatement la chambre à air sans l’abîmer. Seconde étape : pour localiser la fuite avec précision, le moyen recommandé consiste à ${t.methode}. Dès que vous voyez des bulles, marquez l’endroit avec une craie. Troisième phase : il faut impérativement ${t.sechage}. Ensuite seulement, collez fermement la rustine en pressant pendant trois minutes sans bouger. Dernière étape : avant de tout remonter, vérifiez soigneusement l’intérieur du pneu avec vos doigts pour retirer l’épine ou le bout de verre qui a causé la crevaison.`,
          questions: [
            makeQuestion('Quelle réparation de vélo la formatrice enseigne-t-elle avec méthode ?', 'Le repérage d’une crevaison et la pose rigoureuse d’une rustine', 'Le remplacement direct de la chambre à air sans inspecter l’intérieur du pneu', 'Le retrait immédiat de l’épine sans coller de rustine sur la chambre à air', ['crevaison', 'rustine']),
            makeQuestion('Quel moyen est enseigné pour identifier précisément l’emplacement de la fuite ?', t.methodeAns, t.methodeDist1, t.methodeDist2, t.evidenceMethode),
            makeQuestion('Quelle étape de préparation de surface doit-on réaliser avant de coller la rustine ?', t.sechageAns, t.sechageDist1, t.sechageDist2, t.evidenceSechage),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Formatrice atelier vélo - Remplacement d'un câble de frein
    Object.assign(
      (rand) => {
        const tuples = [
          {
            animatrice: 'Sonia',
            etape1: 'desserrer l’écrou du serre-câble avec une clé de cinq millimètres',
            gaine: 'vérifier l’état de la gaine noire pour vous assurer qu’elle est bien droite',
            embout: 'sertir un petit embout en aluminium pour protéger les brins du câble',
            gaineAns: 'Contrôler l’état et la rectitude de la gaine noire protectrice',
            gaineDist1: 'Resserrer l’écrou du serre-câble avant de vérifier la rectitude de la gaine',
            gaineDist2: 'Enfiler le fil métallique dans la gaine sans vérifier son état préalable',
            emboutAns: 'Sertir une cosse d’aluminium pour préserver les fils d’acier',
            emboutDist1: 'Presser dix fois le levier de frein avant de poser le moindre embout métallique',
            emboutDist2: 'Laisser les brins du câble d’acier à nu sans poser d’embout protecteur',
            evidenceGaine: ['gaine', 'droite'],
            evidenceEmbout: ['embout', 'aluminium', 'brins'],
          },
          {
            animatrice: 'Émilie',
            etape1: 'dévisser la vis de serrage principale au niveau de l’étrier de frein',
            gaine: 'huiler légèrement l’intérieur du conduit avec un lubrifiant adapté',
            embout: 'pincer fermement une capsule de finition avec une pince plate',
            gaineAns: 'Lubrifier délicatement la paroi intérieure du passage de câble',
            gaineDist1: 'Dévisser la vis de fixation de l’étrier sans lubrifier le conduit intérieur',
            gaineDist2: 'Faire coulisser le câble d’acier à sec sans ajouter de lubrifiant adapté',
            emboutAns: 'Serrer solidement une capsule de finition à l’aide d’une pince plate',
            emboutDist1: 'Resserrer la vis de l’étrier de frein sans pincer de capsule de finition',
            emboutDist2: 'Tendre le câble avec la pince plate sans poser de capsule sur l’extrémité',
            evidenceGaine: ['huiler', 'conduit', 'lubrifiant'],
            evidenceEmbout: ['capsule', 'finition', 'pince'],
          },
          {
            animatrice: 'Audrey',
            etape1: 'dégager la tête de câble de son logement dans le levier au guidon',
            gaine: 'contrôler la propreté des deux extrémités de la gaine dans leurs butées',
            embout: 'couper l’excédent de fil d’acier à deux centimètres du point d’attache',
            gaineAns: 'Vérifier la propreté des embouchures de la gaine insérées dans les butées',
            gaineDist1: 'Loger directement la tête de câble au guidon sans vérifier les butées',
            gaineDist2: 'Tendre fermement le fil avec une pince avant de nettoyer les embouchures',
            emboutAns: 'Sectionner nettement le bout excédentaire à une distance de deux centimètres',
            emboutDist1: 'Couper le fil d’acier à ras du point d’attache avant de resserrer la vis',
            emboutDist2: 'Presser le levier au guidon dix fois de suite sans raccourcir le câble',
            evidenceGaine: ['propreté', 'extrémités', 'gaine'],
            evidenceEmbout: ['centimètres', 'attache'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bienvenue au cours d’ajustement des freins de vélo. C’est ${t.animatrice} qui vous accompagne aujourd’hui. Quand votre levier touche presque le guidon, il est temps de remplacer le câble d’acier. Voici la séquence obligatoire. D’abord, vous devez ${t.etape1}. Ensuite, retirez l’ancien câble rouillé. Avant d’insérer le nouveau câble neuf, prenez soin ${de(t.gaine)}. Faites coulisser le fil métallique jusqu’au frein. Tendez le câble fermement avec une pince tout en resserrant la vis de fixation. Pour finir, il est essentiel ${de(t.embout)}. Testez le freinage à l’arrêt en pressant vigoureusement le levier dix fois de suite pour vérifier qu’il n’y a aucun glissement. Votre sécurité sur la route en dépend directement !`,
          questions: [
            makeQuestion('Quelle procédure mécanique sécuritaire cet atelier enseigne-t-il ?', 'Le remplacement méthodique et l’ajustement d’un nouveau câble de frein', 'Le graissage de l’ancien câble rouillé sans remplacer le fil métallique', 'Le resserrage de la vis de fixation sans ajuster la tension du câble au guidon', ['câble', 'frein']),
            makeQuestion('Quelle précaution concernant la gaine doit être accomplie avant d’enfiler le câble ?', t.gaineAns, t.gaineDist1, t.gaineDist2, t.evidenceGaine),
            makeQuestion('Quelle opération de finition permet de finaliser l’ajustement du câble ?', t.emboutAns, t.emboutDist1, t.emboutDist2, t.evidenceEmbout),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Gestionnaire expliquant la régularisation d'une erreur de paie
    Object.assign(
      (rand) => {
        const tuples = [
          {
            chef: 'Benoît Gagnon',
            motif: 'les quinze heures supplémentaires de la semaine dernière qui n’ont pas été comptabilisées',
            portail: 'le portail libre-service RH sous l’onglet des réclamations salariales',
            delai: 'avant jeudi midi',
            motifAns: 'L’omission de quinze heures supplémentaires travaillées la semaine précédente',
            motifDist1: 'Une déduction imprévue sur le relevé bancaire lors du virement salarial',
            motifDist2: 'Un désaccord sur le taux horaire de base inscrit sur le talon de paie',
            delaiAns: 'Déposer la réclamation sur le portail d’entreprise avant jeudi midi',
            delaiDist1: 'Transmettre le billet de confirmation au superviseur en fin de semaine',
            delaiDist2: 'Attendre le versement de la paie suivante pour déposer la demande en ligne',
            evidenceMotif: ['heures', 'supplémentaires', 'comptabilisées'],
            evidenceDelai: ['jeudi', 'midi'],
          },
          {
            chef: 'François Tremblay',
            motif: 'la prime de quart de soir du mois dernier qui a été omise sur ton talon',
            portail: 'la section intranet des paies en choisissant le formulaire P-102',
            delai: 'avant mercredi dix-sept heures',
            motifAns: 'L’oubli de la prime liée aux quarts de travail en soirée du mois passé',
            motifDist1: 'Un refus d’approbation de ses feuilles de temps signées par le superviseur',
            motifDist2: 'Une déduction imprévue pour les heures normales effectuées le mois passé',
            delaiAns: 'Compléter l’envoi des pièces justificatives avant mercredi dix-sept heures',
            delaiDist1: 'Attendre la fin de la semaine pour faire approuver la demande en ligne',
            delaiDist2: 'Soumettre les feuilles de temps signées après le virement des paies',
            evidenceMotif: ['prime', 'quart', 'omise'],
            evidenceDelai: ['mercredi', 'dix-sept', 'heures'],
          },
          {
            chef: 'Marc Lavoie',
            motif: 'l’erreur d’échelon salarial consécutive à ta promotion du premier mars',
            portail: 'le logiciel de gestion des ressources humaines avec ton code d’employé',
            delai: 'au plus tard vendredi matin',
            motifAns: 'Une mauvaise attribution d’échelon salarial intervenue suite à sa promotion',
            motifDist1: 'Une erreur de calcul sur les heures travaillées depuis sa récente promotion',
            motifDist2: 'Un retard dans le versement de sa paie régulière annoncé par la direction',
            delaiAns: 'Enregistrer la requête dans le système au plus tard vendredi matin',
            delaiDist1: 'Obtenir l’approbation écrite des ressources humaines le mois suivant',
            delaiDist2: 'Déposer la réclamation en ligne uniquement après le prochain talon',
            evidenceMotif: ['échelon', 'salarial', 'promotion'],
            evidenceDelai: ['vendredi', 'matin'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour Martin. J’ai bien reçu ton courriel au sujet de ton dernier talon de paie. Je comprends tout à fait ta frustration concernant ${t.motif}. Ne t’en fais pas, c’est une simple erreur de saisie du système et voici la procédure officielle pour régler la situation rapidement. Connecte-toi d’abord sur ${t.portail}. Tu dois y joindre une copie de tes feuilles de temps signées ainsi qu’une capture d’écran de ton relevé bancaire démontrant le manque à gagner. Dès que tu as soumis le dossier en ligne, envoie-moi le numéro de billet de confirmation par messagerie interne. J’approuverai la demande immédiatement en tant que superviseur. Si tout est fait ${t.delai}, les ressources humaines feront un virement correctif direct dans ton compte.`,
          questions: [
            makeQuestion('Quel différend salarial le superviseur aide-t-il son collaborateur à régulariser ?', t.motifAns, t.motifDist1, t.motifDist2, t.evidenceMotif),
            makeQuestion('Quels justificatifs officiels l’employé doit-il joindre à sa demande numérique ?', 'Ses feuilles de temps signées avec une copie de son relevé bancaire', 'Le numéro de billet de confirmation et le courriel transmis au superviseur', 'Une attestation d’heures non signée sans capture du relevé bancaire', ['feuilles', 'temps', 'bancaire']),
            makeQuestion('Quelle échéance doit être respectée pour que le virement correctif soit émis rapidement ?', t.delaiAns, t.delaiDist1, t.delaiDist2, t.evidenceDelai),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Gestionnaire aidant à corriger une retenue salariale indue
    Object.assign(
      (rand) => {
        const tuples = [
          {
            gestionnaire: 'Diane Roy',
            probleme: 'une double retenue d’assurance collective prélevée par erreur sur ton chèque',
            preuve: 'ton formulaire d’adhésion original confirmant le régime individuel choisi',
            conseillerTexte: 'à la conseillère attitrée, Chantal Lévesque, au poste téléphonique 412',
            problemeAns: 'Un prélèvement dédoublé au titre du régime d’assurance collective',
            problemeDist1: 'Une déduction omise sur le portail lors du choix du régime d’assurance',
            problemeDist2: 'Un retard du service financier dans l’émission du chèque de paie régulier',
            preuveAns: 'Le formulaire d’adhésion original certifiant la couverture individuelle retenue',
            preuveDist1: 'La copie de la validation transmise par courriel par le gestionnaire',
            preuveDist2: 'Le relevé du service financier attestant du montant perçu en trop',
            evidenceProbleme: ['double', 'retenue', 'assurance'],
            evidencePreuve: ['adhésion', 'individuel'],
          },
          {
            gestionnaire: 'Monique Bélanger',
            probleme: 'une déduction incorrecte pour les cotisations au régime de retraite volontaire',
            preuve: 'ton contrat d’embauche mentionnant expressément le taux de cotisation retenu',
            conseillerTexte: 'au conseiller attitré, Patrick Simard, à la division des avantages sociaux',
            problemeAns: 'Une retenue excessive appliquée aux cotisations de retraite volontaire',
            problemeDist1: 'Une déduction salariale sans contrat d’embauche enregistré par l’entreprise',
            problemeDist2: 'Une omission complète de cotisations de retraite sur le talon de paie',
            preuveAns: 'Le contrat d’embauche mentionnant le taux de déduction de retraite convenu',
            preuveDist1: 'Le formulaire de redressement signé par la division des avantages sociaux',
            preuveDist2: 'Une copie de la demande d’adhésion sans mention du taux de cotisation',
            evidenceProbleme: ['déduction', 'retraite', 'volontaire'],
            evidencePreuve: ['contrat', 'embauche', 'cotisation'],
          },
          {
            gestionnaire: 'Carole Fortin',
            probleme: 'une retenue fiscale provinciale calculée avec un mauvais code de déduction',
            preuve: 'le formulaire officiel de déclaration des crédits d’impôt TP-1015 signé',
            conseillerTexte: 'au conseiller attitré, Marc Bédard, au bureau de paie',
            problemeAns: 'Une retenue d’impôt provincial erronée causée par un code fiscal inadéquat',
            problemeDist1: 'Une omission des crédits d’impôt lors de la validation par le gestionnaire',
            problemeDist2: 'Un montant perçu en trop lié au remboursement d’avances salariales',
            preuveAns: 'Le formulaire fiscal provincial TP-1015 attestant des crédits d’impôt applicables',
            preuveDist1: 'Le formulaire de redressement de paie rempli avec le conseiller attitré',
            preuveDist2: 'Une copie du courriel envoyé au bureau de paie sans déclaration de crédits',
            evidenceProbleme: ['retenue', 'fiscale', 'déduction'],
            evidencePreuve: ['crédits', 'impôt', 'TP-1015'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour Alexandre. Je viens de vérifier les montants avec le service de paie concernant ${t.probleme}. C’est fâcheux, mais nous avons une démarche bien balisée pour rembourser le montant perçu en trop. Première étape : remplis la demande de redressement de paie disponible sur notre portail intranet d’entreprise. Seconde étape : joins en pièce jointe ${t.preuve}. Troisième phase : transmets le tout directement ${t.conseillerTexte}, en me mettant en copie conforme pour que j’appose ma validation. Le service financier s’est engagé à émettre un paiement correctif d’ici vendredi si le dossier est complet avant midi demain. Passe à mon bureau si tu as besoin d’aide pour remplir les sections du formulaire.`,
          questions: [
            makeQuestion('Quel prélèvement indu sur la paie cette démarche vise-t-elle à régulariser ?', t.problemeAns, t.problemeDist1, t.problemeDist2, t.evidenceProbleme),
            makeQuestion('Quelle pièce justificative officielle doit impérativement accompagner la demande ?', t.preuveAns, t.preuveDist1, t.preuveDist2, t.evidencePreuve),
            makeQuestion('À quelle condition le service des finances promet-il un paiement correctif d’ici vendredi ?', 'La transmission de l’ensemble du dossier complet avant midi le lendemain', 'L’envoi de la demande au service financier sans validation du gestionnaire', 'La remise en main propre des pièces au conseiller avant la fin du vendredi', ['midi', 'demain', 'vendredi']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Formatrice atelier vélo - Réglage des vitesses et de la transmission
    Object.assign(
      (rand) => {
        const tuples = [
          {
            animatrice: 'Isabelle',
            etape: 'positionner la chaîne sur le plus petit pignon de la roue arrière',
            outil: 'un tournevis cruciforme pour ajuster avec précision les vis de butée',
            verification: 'faire tourner le pédalier à la main tout en montant les vitesses',
            etapeAns: 'Placer la chaîne sur le pignon le plus étroit de la roue arrière',
            etapeDist1: 'Faire un tour d’essai dans la cour avant d’ajuster la chaîne sur les pignons',
            etapeDist2: 'Tourner la molette de tension du câble avant de positionner la chaîne sur la roue',
            verifAns: 'Actionner le pédalier à la main en passant une par une les vitesses',
            verifDist1: 'Ajuster les vis de butée avec le tournevis pendant le tour d’essai dans la cour',
            verifDist2: 'Ranger immédiatement tous les outils sans vérifier le pédalier ni les vitesses',
            evidenceEtape: ['chaîne', 'petit', 'pignon'],
            evidenceVerif: ['pédalier', 'vitesses'],
          },
          {
            animatrice: 'Geneviève',
            etape: 'relâcher la tension du câble en plaçant la manette au repos complet',
            outil: 'une clé hexagonale de quatre millimètres pour aligner le dérailleur',
            verification: 'contrôler l’alignement visuel entre le galet et chaque pignon',
            etapeAns: 'Placer la manette au repos afin de libérer toute la tension du câble',
            etapeDist1: 'Aligner immédiatement le dérailleur avec la clé sans toucher à la manette',
            etapeDist2: 'Tourner la molette dans le sens antihoraire avant de libérer le câble d’acier',
            verifAns: 'Vérifier visuellement l’alignement parfait du galet sous chaque pignon',
            verifDist1: 'Tourner la molette de tension d’un demi-tour sans regarder le galet ni les pignons',
            verifDist2: 'Actionner la manette de vitesse au guidon sans vérifier la position du dérailleur',
            evidenceEtape: ['relâcher', 'tension', 'manette'],
            evidenceVerif: ['alignement', 'galet', 'pignon'],
          },
          {
            animatrice: 'Christine',
            etape: 'nettoyer soigneusement les maillons de la chaîne pour enlever toute saleté',
            outil: 'la molette de tension située à l’extrémité du levier au guidon',
            verification: 'tendre l’oreille pour détecter tout frottement métallique anormal',
            etapeAns: 'Nettoyer méticuleusement chaque maillon métallique pour retirer la crasse',
            etapeDist1: 'Tourner la molette du câble au guidon sans nettoyer les maillons de la chaîne',
            etapeDist2: 'Faire tourner le pédalier à pleine vitesse avant d’enlever toute la saleté',
            verifAns: 'Écouter attentivement pour s’assurer de l’absence de frottement métallique',
            verifDist1: 'Observer l’espace entre la chaîne et la cour sans écouter le bruit métallique',
            verifDist2: 'Tourner la molette dans le sens horaire dès qu’un léger bruit apparaît en selle',
            evidenceEtape: ['maillons', 'chaîne'],
            evidenceVerif: ['oreille', 'frottement', 'métallique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour chers cyclistes ! Dans cet atelier consacré au réglage de la transmission, je vous montre la méthode exacte pour éliminer les sauts de chaîne désagréables. Étape numéro un : commencez par ${t.etape}. Étape numéro deux : utilisez ${t.outil}. En tournant d’un quart de tour à la fois, vous devez éliminer l’espace qui provoque le déraillement. Étape numéro trois : tournez la molette de tension du câble d’un demi-tour dans le sens antihoraire si la chaîne hésite à monter. Étape numéro quatre : pour la vérification finale, prenez soin de ${t.verification}. Si chaque changement de vitesse s’opère avec fluidité et silence, votre transmission est parfaitement synchronisée. Rangez vos outils et venez faire un tour d’essai dans la cour !`,
          questions: [
            makeQuestion('Quel composant mécanique de la bicyclette cet atelier apprend-il à régler ?', 'L’ajustement précis de la transmission et le passage fluide des vitesses', 'Le remplacement de la chaîne par une transmission à pignon unique', 'Le démontage complet des plateaux du pédalier pour freiner la roue', ['transmission', 'vitesse']),
            makeQuestion('Quelle première intervention concrète faut-il exécuter au début de la manœuvre ?', t.etapeAns, t.etapeDist1, t.etapeDist2, t.evidenceEtape),
            makeQuestion('Quelle vérification finale permet de valider le bon fonctionnement de la transmission ?', t.verifAns, t.verifDist1, t.verifDist2, t.evidenceVerif),
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
        const tuples = [
          {
            directrice: 'Madame Thériault',
            taux: 'cent vingt pour cent de nos objectifs de vente',
            defi: 'le manque ponctuel de personnel et les contraintes d’approvisionnement',
            cadeau: 'un vendredi après-midi de repos payé pour toute l’équipe',
            defiAns: 'Le manque temporaire de personnel combiné aux lenteurs de livraison',
            defiDist1: 'Une baisse imprévue des objectifs de vente fixés par la direction générale',
            defiDist2: 'Un refus de la direction d’accorder des jours de repos pour toute l’équipe',
            cadeauAns: 'Une demi-journée de congé payée accordée à tous le vendredi',
            cadeauDist1: 'Une prime liée directement au dépassement des objectifs de vente',
            cadeauDist2: 'Un repos compensatoire accordé uniquement aux employés de livraison',
            evidenceDefi: ['personnel', 'approvisionnement'],
            evidenceCadeau: ['vendredi', 'repos', 'payé'],
          },
          {
            directrice: 'Madame Bélanger',
            taux: 'cent quinze pour cent des cibles de fidélisation de la clientèle',
            defi: 'la période d’adaptation exigeante liée à notre nouvelle plateforme informatique',
            cadeau: 'une prime de reconnaissance exceptionnelle versée avec le prochain salaire',
            defiAns: 'La transition complexe vers le nouveau logiciel informatique de travail',
            defiDist1: 'Une chute des cibles de fidélisation de la clientèle durant l’adaptation',
            defiDist2: 'Un retard dans le versement de la prime de reconnaissance exceptionnelle',
            cadeauAns: 'Une prime exceptionnelle de reconnaissance accordée sur le prochain salaire',
            cadeauDist1: 'Un vendredi de congé payé pour compenser l’effort sur la plateforme',
            cadeauDist2: 'Une formation payée sur la nouvelle plateforme informatique au bureau',
            evidenceDefi: ['adaptation', 'plateforme', 'informatique'],
            evidenceCadeau: ['prime', 'reconnaissance', 'salaire'],
          },
          {
            directrice: 'Madame Bouchard',
            taux: 'l’ensemble des livrables demandés avec deux semaines d’avance',
            defi: 'les échéances très serrées imposées pour achever ce contrat d’envergure',
            cadeau: 'un repas convivial de célébration entièrement pris en charge par l’entreprise',
            defiAns: 'Le calendrier extrêmement serré imparti pour mener à bien le contrat',
            defiDist1: 'Un retard de deux semaines dans la remise des livrables de ce contrat',
            defiDist2: 'Un refus de l’équipe de se réunir pour célébrer la réussite collective',
            cadeauAns: 'Un repas convivial et festif pris en charge par la direction',
            cadeauDist1: 'Une prime financière versée pour souligner l’avance de deux semaines',
            cadeauDist2: 'Un repas convivial payé individuellement par chaque membre de l’équipe',
            evidenceDefi: ['échéances', 'serrées', 'contrat'],
            evidenceCadeau: ['repas', 'convivial', 'célébration'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à toute l’équipe ! Je tenais à vous réunir aujourd’hui pour faire le bilan de notre troisième trimestre, et je dois vous dire que je suis immensément fière de chacun d’entre vous. Les chiffres viennent de tomber : nous avons atteint ${t.taux} ! Compte tenu des défis importants auxquels nous avons fait face ces derniers mois, notamment ${t.defi}, ce résultat est tout simplement remarquable. Votre solidarité, vos efforts continus et votre créativité ont fait toute la différence. Je tiens à vous exprimer ma plus sincère reconnaissance. Pour souligner cette belle réussite collective comme il se doit, la direction générale a approuvé ${t.cadeau}. Prenez ce temps pour vous reposer et célébrer, vous l’avez amplement mérité ! Félicitations à tous !`,
          questions: [
            makeQuestion('Quel sentiment dominant la directrice exprime-t-elle avec chaleur ?', 'Une grande fierté devant l’atteinte des objectifs collectifs de l’équipe', 'Une déception face au manque ponctuel de créativité observé durant le trimestre', 'Une vive inquiétude concernant la charge de travail et la solidarité de l’équipe', ['fière', 'bilan', 'résultat']),
            makeQuestion('Quelle difficulté majeure l’équipe est-elle parvenue à surmonter ?', t.defiAns, t.defiDist1, t.defiDist2, t.evidenceDefi),
            makeQuestion('Quelle marque de reconnaissance concrète la direction générale accorde-t-elle ?', t.cadeauAns, t.cadeauDist1, t.cadeauDist2, t.evidenceCadeau),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Satisfaction de la cheffe de projet après un audit réussi
    Object.assign(
      (rand) => {
        const tuples = [
          {
            cheffe: 'Chantal',
            audit: 'l’audit de conformité aux normes environnementales',
            note: 'une note excellente sans aucun manquement relevé par les inspecteurs',
            reconfort: 'des cartes-cadeaux de détente et un après-midi festif au bureau',
            noteAns: 'Une note exemplaire attribuée sans aucune défaillance constatée',
            noteDist1: 'Une note moyenne accompagnée de plusieurs manquements de procédure',
            noteDist2: 'Un rapport soulignant des doutes sérieux chez plusieurs inspecteurs',
            reconfortAns: 'Des cartes-cadeaux de détente accompagnées d’un après-midi festif au travail',
            reconfortDist1: 'Une prime individuelle pour compenser les heures de révision passées',
            reconfortDist2: 'L’allègement complet des procédures de travail pour les six prochains mois',
            evidenceNote: ['excellente', 'manquement', 'inspecteurs'],
            evidenceReconfort: ['cartes-cadeaux', 'détente', 'festif'],
          },
          {
            cheffe: 'Monique',
            audit: 'l’inspection provinciale de qualité des services aux usagers',
            note: 'les félicitations officielles du comité d’inspection pour nos dossiers',
            reconfort: 'une journée complète de ressourcement pour tous les départements',
            noteAns: 'Les félicitations formelles du comité saluant la rigueur des dossiers',
            noteDist1: 'Une demande de révision de l’ensemble des dossiers sous six mois',
            noteDist2: 'Une inspection prolongée en raison d’un manque d’entraide interne',
            reconfortAns: 'L’attribution d’une journée entière de ressourcement à tout le personnel',
            reconfortDist1: 'Un après-midi festif réservé aux membres du comité d’inspection',
            reconfortDist2: 'Des cartes-cadeaux offertes aux seuls collègues du service d’accueil',
            evidenceNote: ['félicitations', 'comité', 'dossiers'],
            evidenceReconfort: ['journée', 'ressourcement', 'départements'],
          },
          {
            cheffe: 'Isabelle',
            audit: 'l’évaluation externe de sécurité informatique de nos serveurs',
            note: 'la mention d’excellence la plus haute jamais décernée à notre firme',
            reconfort: 'une enveloppe budgétaire spéciale pour rénover notre salle de pause',
            noteAns: 'La distinction d’excellence maximale octroyée pour la première fois à la firme',
            noteDist1: 'Une mention d’encouragement assortie d’un délai de révision de six mois',
            noteDist2: 'Un avis demandant de vérifier les protocoles de serveurs de l’équipe',
            reconfortAns: 'Un budget dédié au réaménagement complet de la salle de pause de l’équipe',
            reconfortDist1: 'Une journée complète de ressourcement accordée à l’ensemble de la firme',
            reconfortDist2: 'Des cartes-cadeaux distribuées après l’évaluation des serveurs au bureau',
            evidenceNote: ['excellence', 'haute', 'firme'],
            evidenceReconfort: ['enveloppe', 'budgétaire', 'pause'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Merci à tous d’être venus. J’ai les résultats officiels de ${t.audit}, et je ne peux cacher ma fierté. Nous avons obtenu ${t.note} ! Lorsque nous avons commencé ce chantier il y a six mois, plusieurs personnes doutaient de notre capacité à réussir dans des délais aussi courts. Vous avez fait preuve d’une rigueur remarquable, en révisant chaque procédure et en vous entraidant sans compter vos heures. Je suis touchée par votre dévouement constant. Pour souligner cette très belle réussite qui met en valeur notre équipe, j’ai le plaisir de vous annoncer ${t.reconfort}. Merci sincèrement pour votre excellent travail !`,
          questions: [
            makeQuestion('Pourquoi la cheffe d’équipe convoque-t-elle ses collègues avec enthousiasme ?', 'Pour souligner le succès éclatant obtenu lors de l’audit externe', 'Pour annoncer la révision de chaque procédure avant l’audit externe', 'Pour exprimer ses doutes sur la capacité de l’équipe à tenir les délais', ['résultats', 'fierté']),
            makeQuestion('Quel résultat remarquable l’équipe a-t-elle décroché lors de cette vérification ?', t.noteAns, t.noteDist1, t.noteDist2, t.evidenceNote),
            makeQuestion('Quel geste de reconnaissance la gestionnaire annonce-t-elle pour récompenser l’effort ?', t.reconfortAns, t.reconfortDist1, t.reconfortDist2, t.evidenceReconfort),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Déception d'un ami refusé dans un programme d'études
    Object.assign(
      (rand) => {
        const tuples = [
          {
            ami: 'Félix',
            programme: 'en techniques policières au collège d’Alma',
            cause: 'ma note au test de sélection était un peu sous le seuil requis',
            soutien: 'prendre quelques jours de repos avant de penser à une autre demande',
            causeAns: 'Un résultat légèrement inférieur à la note minimale fixée au test de sélection',
            causeDist1: 'Un manque de préparation évident durant les fins de semaine d’hiver',
            causeDist2: 'Une note d’entrevue insuffisante devant les responsables du collège',
            soutienAns: 'S’accorder quelques journées de repos pour accuser le coup avant d’agir',
            soutienDist1: 'Déposer immédiatement une nouvelle demande d’admission au collège',
            soutienDist2: 'Consulter dès aujourd’hui son père pour trouver une autre avenue',
            evidenceCause: ['test', 'sélection', 'seuil'],
            evidenceSoutien: ['jours', 'repos', 'demande'],
          },
          {
            ami: 'Samuel',
            programme: 'en techniques de réadaptation physique au cégep',
            cause: 'le nombre de candidatures reçues dépassait largement les places disponibles',
            soutien: 'suivre des cours de perfectionnement pour bonifier ma candidature future',
            causeAns: 'La forte concurrence générée par un nombre très restreint de places offertes',
            causeDist1: 'Un échec au test de sélection écrit malgré des révisions tout l’hiver',
            causeDist2: 'Une note sous le seuil exigé pour les cours préparatoires du cégep',
            soutienAns: 'Suivre des cours de perfectionnement en vue d’enrichir un futur dossier',
            soutienDist1: 'Prendre plusieurs mois de repos complet avant d’écouter son ami',
            soutienDist2: 'Refaire immédiatement une demande sans changer son dossier au cégep',
            evidenceCause: ['candidatures', 'places', 'disponibles'],
            evidenceSoutien: ['perfectionnement', 'candidature', 'future'],
          },
          {
            ami: 'Mathieu',
            programme: 'en soins préhospitaliers d’urgence pour ambulanciers',
            cause: 'le stress de l’entrevue m’a fait perdre mes repères devant le comité',
            soutien: 'consulter un conseiller en orientation pour explorer d’autres voies',
            causeAns: 'La perte de moyens liée à l’anxiété ressentie lors de l’entrevue de sélection',
            causeDist1: 'Un résultat sous la note minimale au test écrit préparé tout l’hiver',
            causeDist2: 'Un nombre insuffisant d’heures d’étude consacrées avant l’entrevue',
            soutienAns: 'Consulter un professionnel de l’orientation pour analyser d’autres options',
            soutienDist1: 'Repasser l’entrevue devant le comité dès la semaine prochaine',
            soutienDist2: 'Passer tout son hiver à réviser sans consulter de professionnel',
            evidenceCause: ['stress', 'entrevue', 'repères'],
            evidenceSoutien: ['conseiller', 'orientation', 'voies'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Allô Jean... C’est ${t.ami}. Je t’appelle parce que j’ai reçu la réponse ce matin et je suis vraiment découragé. J’ai été refusé ${t.programme}. C’est difficile à encaisser après avoir passé tout mon hiver à réviser et à me préparer chaque fin de semaine. La lettre de refus indique que ${t.cause}. J’ai l’impression que mes efforts n’ont pas suffi et j’ai le moral à plat depuis deux heures. Je ne sais plus trop comment envisager la suite pour le moment. Mon père me dit que ce n’est pas la fin du monde et qu’il existe d’autres avenues, mais là, j’ai surtout besoin de ${t.soutien}. Merci d’être là pour m’écouter sans me juger, ça me fait du bien d’en parler avec toi.`,
          questions: [
            makeQuestion('Quel état d’esprit douloureux l’ami partage-t-il au téléphone ?', 'Un profond découragement consécutif au refus de son admission', 'La fierté d’avoir révisé chaque fin de semaine tout au long de l’hiver', 'L’indifférence totale face aux avenues proposées par son père', ['découragé', 'refusé']),
            makeQuestion('Quel motif officiel la lettre de refus invoque-t-elle pour motiver cette décision ?', t.causeAns, t.causeDist1, t.causeDist2, t.evidenceCause),
            makeQuestion('De quoi le jeune homme éprouve-t-il le plus grand besoin dans l’immédiat ?', t.soutienAns, t.soutienDist1, t.soutienDist2, t.evidenceSoutien),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Déception d'une amie refusée en programme universitaire
    Object.assign(
      (rand) => {
        const tuples = [
          {
            amie: 'Ariane',
            universite: 'à l’Université de Montréal en médecine vétérinaire',
            reve: 'soigner les animaux en région rurale depuis mon enfance',
            alternative: 'faire une année en sciences biomédicales pour hausser mes notes',
            reveAns: 'Le souhait profond de soigner des animaux en région rurale',
            reveDist1: 'L’envie de poursuivre des études en biomédicale sans aller en région',
            reveDist2: 'La perspective de faire du bénévolat dans des cliniques montréalaises',
            altAns: 'Entreprendre une année préparatoire en sciences biomédicales pour améliorer ses notes',
            altDist1: 'Faire une nouvelle demande immédiate dans le même programme sans hausser ses notes',
            altDist2: 'Abandonner son rêve auprès des animaux pour poursuivre du bénévolat collégial',
            evidenceReve: ['soigner', 'animaux'],
            evidenceAlt: ['sciences', 'biomédicales', 'notes'],
          },
          {
            amie: 'Mélissa',
            universite: 'en pharmacie clinique à l’Université Laval',
            reve: 'travailler en milieu hospitalier auprès des aînés',
            alternative: 'suivre un certificat universitaire complémentaire pour enrichir mes compétences',
            reveAns: 'Le souhait d’œuvrer dans le secteur hospitalier auprès des aînés',
            reveDist1: 'L’objectif de compléter un certificat sans intégrer le milieu hospitalier',
            reveDist2: 'La volonté de faire du bénévolat plutôt que de soigner des personnes aînées',
            altAns: 'Compléter un certificat universitaire pour renforcer la valeur de son profil',
            altDist1: 'Poursuivre ses activités de bénévolat auprès des aînés sans étudier à l’université',
            altDist2: 'Ouvrir une réclamation sur le portail d’admission de l’université sans certificat',
            evidenceReve: ['hospitalier', 'aînés'],
            evidenceAlt: ['certificat', 'complémentaire', 'compétences'],
          },
          {
            amie: 'Laurence',
            universite: 'en physiothérapie à l’Université de Sherbrooke',
            reve: 'soutenir les personnes blessées pour retrouver leur mobilité',
            alternative: 'm’inscrire dans une filière voisine pour faire une nouvelle demande l’an prochain',
            reveAns: 'Le désir d’aider des personnes blessées à retrouver leur mobilité',
            reveDist1: 'Le projet d’obtenir un diplôme collégial sans faire de nouvelle demande',
            reveDist2: 'L’intention de s’inscrire dans une filière voisine sans soigner les blessés',
            altAns: 'Intégrer une filière connexe afin de retenter sa chance l’année suivante',
            altDist1: 'Refaire immédiatement une demande d’admission sans attendre l’année suivante',
            altDist2: 'Renoncer au secteur de la mobilité pour refaire son parcours au collégial',
            evidenceReve: ['personnes', 'blessées', 'mobilité'],
            evidenceAlt: ['filière', 'voisine', 'demande'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Julie... Je t’écris avec le cœur gros. Je viens d’ouvrir le portail d’admission ${t.universite} et ma candidature n’a pas été retenue. Je me sens vraiment triste et déçue. Tu sais à quel point c’était mon rêve de ${t.reve}. J’ai maintenu de très bonnes notes pendant tout mon parcours collégial et j’ai fait du bénévolat pour consolider mon dossier. Voir une lettre impersonnelle écarter mes projets après tant d’efforts, c’est dur à accepter. Pour l’instant, j’ai de la difficulté à voir le côté positif. Quand le choc sera passé, j’envisagerai probablement de ${t.alternative}. Mais pour aujourd’hui, j’ai simplement besoin d’en parler avec une amie et de souffler un peu.`,
          questions: [
            makeQuestion('Quelle triste nouvelle l’amie partage-t-elle avec émotion ?', 'Le refus de son admission dans le programme universitaire souhaité', 'L’annulation de ses activités de bénévolat durant ses études collégiales', 'L’obligation de reprendre l’ensemble de ses cours collégiaux déjà réussis', ['admission', 'candidature', 'retenue']),
            makeQuestion('Quelle aspiration motivait particulièrement son projet d’études ?', t.reveAns, t.reveDist1, t.reveDist2, t.evidenceReve),
            makeQuestion('Quelle stratégie académique constructive envisage-t-elle après le choc de l’annonce ?', t.altAns, t.altDist1, t.altDist2, t.evidenceAlt),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Satisfaction du gestionnaire pour l'ouverture d'un nouveau magasin
    Object.assign(
      (rand) => {
        const tuples = [
          {
            gestionnaire: 'Patrick Roy',
            commerce: 'de notre succursale d’alimentation biologique',
            affluence: 'plus de deux mille clients franchir nos portes avec curiosité',
            remarque: 'la fraîcheur exceptionnelle de nos produits maraîchers et la propreté impeccable des rayons',
            fete: 'un cinq à sept chaleureux avec dégustation de produits du terroir',
            remarqueAns: 'La propreté exemplaire des allées et la grande fraîcheur des produits maraîchers',
            remarqueDist1: 'La dégustation de produits du terroir offerte par les maraîchers aux caisses',
            remarqueDist2: 'Le calme des clients malgré les prévisions de fermeture de la succursale',
            feteAns: 'Un rassemblement de cinq à sept offrant des bouchées de produits du terroir',
            feteDist1: 'Un rabais exceptionnel sur l’ensemble des produits maraîchers du magasin',
            feteDist2: 'Une prime d’inauguration remise à l’équipe juste avant la fermeture',
            evidenceRemarque: ['fraîcheur', 'produits', 'propreté'],
            evidenceFete: ['cinq', 'sept', 'terroir'],
          },
          {
            gestionnaire: 'Luc Tremblay',
            commerce: 'de notre nouvelle librairie indépendante de quartier',
            affluence: 'une file ininterrompue de lecteurs passionnés tout au long de la journée',
            remarque: 'la grande disponibilité de nos conseillers et la sélection originale de nos ouvrages',
            fete: 'un déjeuner convivial garni de viennoiseries offert à tous les employés',
            remarqueAns: 'L’écoute attentionnée des libraires et le choix original des titres proposés',
            remarqueDist1: 'La rapidité à la caisse pour servir la file de lecteurs passionnés',
            remarqueDist2: 'Le déjeuner garni de viennoiseries offert aux clients de la librairie',
            feteAns: 'Un déjeuner matinal d’équipe garni de viennoiseries offert par la gérance',
            feteDist1: 'Une soirée festive avec un tirage de livres offerts par la librairie',
            feteDist2: 'Une pause prolongée accordée aux conseillers après la fin de journée',
            evidenceRemarque: ['disponibilité', 'conseillers', 'ouvrages'],
            evidenceFete: ['déjeuner', 'viennoiseries', 'employés'],
          },
          {
            gestionnaire: 'Simon Bouchard',
            commerce: 'de notre boutique coopérative d’articles de plein air',
            affluence: 'un volume record de ventes dès cette première journée inaugurale',
            remarque: 'l’expertise technique de nos vendeurs et leurs conseils personnalisés très avisés',
            fete: 'une soirée festive de remerciements assortie d’un tirage de cartes-cadeaux',
            remarqueAns: 'Les compétences techniques des vendeurs et la justesse de leurs conseils',
            remarqueDist1: 'Le volume des ventes d’articles de plein air malgré l’attente à la caisse',
            remarqueDist2: 'Le tirage de cartes-cadeaux organisé dès le matin pour tous les clients',
            feteAns: 'Une soirée de célébration amicale incluant un tirage de cartes-cadeaux',
            feteDist1: 'Un déjeuner d’équipe offert dans la boutique avant l’ouverture des portes',
            feteDist2: 'Une prime de vente partagée entre les vendeurs d’articles de plein air',
            evidenceRemarque: ['expertise', 'vendeurs', 'conseils'],
            evidenceFete: ['soirée', 'festive', 'cartes-cadeaux'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Chère équipe, rassemblez-vous deux minutes avant la fermeture ! Je ne pouvais pas vous laisser partir ce soir sans vous féliciter chaleureusement pour l’inauguration ${t.commerce}. Cette journée a dépassé nos prévisions les plus optimistes : nous avons vu ${t.affluence} ! Malgré la foule importante et le rythme soutenu à la caisse, vous avez conservé votre calme, votre sourire et votre professionnalisme. Plusieurs clients m’ont fait part de leur appréciation devant ${t.remarque}. Je suis très fier de diriger une équipe aussi engagée et efficace. Demain soir, la direction vous convie à ${t.fete}. Merci du fond du cœur pour votre belle énergie aujourd’hui !`,
          questions: [
            makeQuestion('Quel bilan gratifiant le responsable partage-t-il lors du rassemblement d’équipe ?', 'Une immense fierté devant l’accueil chaleureux réservé par le public', 'L’inquiétude causée par la lenteur du rythme de passage à la caisse', 'Le regret de ne pas avoir accueilli assez de clients à l’inauguration', ['inauguration', 'féliciter', 'journée']),
            makeQuestion('Quel compliment formulé par la clientèle a particulièrement touché le gestionnaire ?', t.remarqueAns, t.remarqueDist1, t.remarqueDist2, t.evidenceRemarque),
            makeQuestion('Quelle célébration conviviale est organisée le lendemain pour remercier le personnel ?', t.feteAns, t.feteDist1, t.feteDist2, t.evidenceFete),
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
        const tuples = [
          {
            programme: 'Attestation d’études collégiales en bureautique et coordination numérique',
            duree: 'quatorze mois intensifs',
            stage: 'un stage crédité en entreprise de quatre cent cinquante heures',
            prealable: 'un diplôme d’études secondaires ou une expérience équivalente reconnue',
            stageAns: 'Une période de travail en entreprise totalisant quatre cent cinquante heures',
            stageDist1: 'Des cours théoriques en ligne seulement, sans activité pratique sur le campus',
            stageDist2: 'Un stage facultatif de fin de semaine réservé aux personnes sans emploi',
            prealableAns: 'Avoir complété ses études secondaires ou justifier d’une expérience équivalente',
            prealableDist1: 'Détenir un poste en emploi dans le domaine de la coordination numérique',
            prealableDist2: 'Bénéficier déjà des prêts et bourses accordés par le gouvernement provincial',
            evidenceStage: ['stage', 'quatre', 'cinquante', 'heures'],
            evidencePrealable: ['diplôme', 'secondaires', 'expérience'],
          },
          {
            programme: 'AEC en gestion de réseaux et cybersécurité',
            duree: 'seize mois à temps plein',
            stage: 'un stage en milieu corporatif de quatre cents heures',
            prealable: 'avoir interrompu ses études régulières depuis au moins deux sessions',
            stageAns: 'Une période de stage corporatif supervisé totalisant quatre cents heures',
            stageDist1: 'Des cours théoriques en ligne sans aucun travail dans les laboratoires du campus',
            stageDist2: 'Une session complète de travaux dirigés dans les laboratoires sans stage en entreprise',
            prealableAns: 'Une interruption des études régulières d’au moins deux sessions consécutives',
            prealableDist1: 'Avoir complété seize mois d’études régulières dans un programme universitaire',
            prealableDist2: 'Occuper un emploi de soir dans le domaine des réseaux ou de la cybersécurité',
            evidenceStage: ['stage', 'corporatif', 'quatre', 'cents'],
            evidencePrealable: ['interrompu', 'études', 'sessions'],
          },
          {
            programme: 'AEC en développement Web et médias interactifs',
            duree: 'douze mois de formation',
            stage: 'un stage pratique supervisé de trois cent cinquante heures',
            prealable: 'la réussite d’un test de logique informatique et de français',
            stageAns: 'Une période de stage pratique totalisant trois cent cinquante heures',
            stageDist1: 'Une session d’observation en milieu hospitalier sans travail requis dans les laboratoires',
            stageDist2: 'Un atelier préparatoire de rédaction de curriculum vitæ d’une quinzaine d’heures',
            prealableAns: 'Obtenir la note de passage requise à l’épreuve de logique et de français',
            prealableDist1: 'Avoir déjà complété douze mois de cours en ligne dans un programme collégial',
            prealableDist2: 'Fournir un curriculum vitæ attestant d’une expérience de travail en multimédia',
            evidenceStage: ['stage', 'trois', 'cinquante', 'heures'],
            evidencePrealable: ['réussite', 'logique', 'français'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `FICHE DESCRIPTIVE DE PROGRAMME - CÉGEP DE SAINTE-FOY\nProgramme : ${t.programme}\nCe programme collégial s’adresse aux adultes désireux de réorienter leur carrière vers un secteur en forte demande de main-d’œuvre au Québec. La formation s’échelonne sur ${t.duree}, combinant cours théoriques en ligne et travaux dirigés dans les laboratoires informatiques du campus. Le cursus comprend ${t.stage}, permettant une intégration professionnelle immédiate sur le marché du travail. Les conditions d’admission exigent ${t.prealable}. Les cours sont dispensés de soir et les fins de semaine pour accommoder les personnes en emploi. Les candidats admissibles peuvent bénéficier des prêts et bourses du gouvernement du Québec ainsi que d’un soutien personnalisé pour la rédaction de leur curriculum vitæ. Date limite de dépôt des dossiers : le quinze novembre prochain.`,
          questions: [
            makeQuestion('Quel type de document officiel est présenté dans cet extrait d’information ?', 'Une fiche descriptive d’une formation collégiale pour adultes', 'Une demande de bourse gouvernementale pour financer un stage de fin d’études', 'Un formulaire d’inscription officiel pour les laboratoires informatiques du campus', ['fiche', 'programme', 'adultes']),
            makeQuestion('Quelle composante pratique obligatoire le parcours intègre-t-il dans son cursus ?', t.stageAns, t.stageDist1, t.stageDist2, t.evidenceStage),
            makeQuestion('Quelle condition formelle d’admissibilité est requise pour intégrer la cohorte ?', t.prealableAns, t.prealableDist1, t.prealableDist2, t.evidencePrealable),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Descriptif de formation DEP professionnelle
    Object.assign(
      (rand) => {
        const tuples = [
          {
            dep: 'Diplôme d’études professionnelles en électricité de construction',
            centre: 'au Centre de formation professionnelle de Québec',
            duree: 'mille huit cents heures d’ateliers pratiques',
            debouche: 'l’obtention du carnet d’apprenti électricien de la Commission de la construction',
            metierAns: 'Le métier d’électricien de construction sur les grands chantiers',
            metierDist1: 'L’inspection des équipements de protection individuelle des ouvriers du bâtiment',
            metierDist2: 'La rédaction technique de plans complexes pour les centres de services scolaires',
            deboucheAns: 'La délivrance de la carte d’apprenti électricien reconnue par la CCQ',
            deboucheDist1: 'L’embauche directe sans passer par les étapes d’apprentissage sur chantier',
            deboucheDist2: 'Un poste permanent de formateur technique au sein du centre de formation',
            evidenceMetier: ['électricité', 'construction', 'chantiers'],
            evidenceDebouche: ['carnet', 'apprenti', 'électricien'],
          },
          {
            dep: 'DEP en plomberie et chauffage résidentiel',
            centre: 'au Centre de formation professionnelle de Montréal',
            duree: 'mille cinq cents heures de formation intensive',
            debouche: 'l’accès direct aux chantiers certifiés par la CCQ',
            metierAns: 'Les techniques de plomberie et d’installation de chauffage résidentiel',
            metierDist1: 'Le contrôle de conformité des plans selon les normes du Code du bâtiment',
            metierDist2: 'La gestion administrative des chantiers résidentiels et industriels certifiés',
            deboucheAns: 'L’accès sans délai aux chantiers de construction certifiés par la CCQ',
            deboucheDist1: 'L’obtention automatique d’un carnet de compagnon sans passer par l’apprentissage',
            deboucheDist2: 'La direction immédiate des équipes d’ouvriers sur les chantiers industriels',
            evidenceMetier: ['plomberie', 'chauffage', 'chantiers'],
            evidenceDebouche: ['accès', 'chantiers', 'ccq'],
          },
          {
            dep: 'DEP en mécanique de véhicules lourds routiers',
            centre: 'au Pavillon technique de l’Estrie',
            duree: 'mille huit cents heures en atelier mécanique',
            debouche: 'un taux d’embauche confirmé de quatre-vingt-quinze pour cent en entreprise',
            metierAns: 'La mécanique spécialisée pour les camions et véhicules lourds routiers',
            metierDist1: 'La vente d’équipements de protection individuelle et d’outils spécialisés',
            metierDist2: 'L’animation de séances virtuelles d’information technique pour les jeunes',
            deboucheAns: 'Une quasi-certitude de placement professionnel chiffrée à quatre-vingt-quinze pour cent',
            deboucheDist1: 'L’obtention directe du carnet d’apprenti de la CCQ pour tous les chantiers du Québec',
            deboucheDist2: 'Une embauche immédiate garantie comme gestionnaire au Centre de services scolaire',
            evidenceMetier: ['mécanique', 'véhicules', 'lourds'],
            evidenceDebouche: ['embauche', 'quatre-vingt-quinze', 'pour'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `GUIDE DES FORMATIONS PROFESSIONNELLES - CENTRE DE SERVICES SCOLAIRE\nProgramme : ${t.dep}, offert ${t.centre}. Cette formation qualifiante de ${t.duree} prépare les futurs diplômés à œuvrer sur les grands chantiers résidentiels et industriels du Québec. Les étudiants apprennent à lire des plans complexes, à installer des systèmes conformes au Code du bâtiment et à utiliser des outils spécialisés de pointe. La réussite du programme mène à ${t.debouche}. Les candidats doivent être âgés d’au moins seize ans et avoir réussi leurs unités de français et de mathématiques de quatrième secondaire. Les équipements de protection individuelle et les coffres à outils sont fournis gratuitement pour toute la durée des cours. Les séances d’information virtuelles ont lieu chaque mardi à dix-neuf heures.`,
          questions: [
            makeQuestion('Quel métier technique du secteur professionnel cette formation prépare-t-elle ?', t.metierAns, t.metierDist1, t.metierDist2, t.evidenceMetier),
            makeQuestion('Quelle perspective sur le marché du travail la réussite du programme garantit-elle ?', t.deboucheAns, t.deboucheDist1, t.deboucheDist2, t.evidenceDebouche),
            makeQuestion('Quel avantage matériel gratuit l’établissement scolaire fournit-il aux étudiants ?', t.metierAns.length > 50 ? 'Le matériel de protection corporelle et l’outillage spécialisé' : 'Le matériel de protection individuelle ainsi que la boîte à outils spécialisée', 'Un ordinateur portable neuf et une licence de logiciel de conception', 'Une tablette numérique prêtée pour la durée complète des cours du soir', ['protection', 'outils']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Infolettre municipale - Programmation estivale
    Object.assign(
      (rand) => {
        const tuples = [
          {
            ville: 'de la Ville de Gatineau',
            parc: 'le grand parc du Lac-Beauchamp',
            sportTexte: 'd’initiations gratuites au canot et au kayak sur l’eau',
            materiel: 'les embarcations nautiques et les gilets de sauvetage',
            culture: 'des projections de cinéma en plein air tous les vendredis soirs',
            sportAns: 'Des ateliers guidés sur l’eau avec prêt gratuit d’embarcations et de gilets',
            sportDist1: 'Des compétitions de canot réservées aux détenteurs d’embarcations privées',
            sportDist2: 'Des ateliers de kayak payants organisés en dehors des heures d’ouverture du parc',
            cultureAns: 'Des séances de cinéma en plein air proposées les vendredis en soirée',
            cultureDist1: 'Des projections de films payantes organisées dans les aires de pique-nique',
            cultureDist2: 'Des séances de cinéma en salle fermée accessibles sans carte citoyenne',
            evidenceSport: ['canot', 'kayak', 'gilets'],
            evidenceCulture: ['projections', 'cinéma', 'plein', 'air'],
          },
          {
            ville: 'de la Ville de Laval',
            parc: 'le Centre de la nature',
            sportTexte: 'de ligues amicales de volleyball de plage et de tournois de soccer',
            materiel: 'les ballons officiels et les filets de sport nécessaires',
            culture: 'des concerts acoustiques sous le kiosque à musique les samedis',
            sportAns: 'Des parties amicales de volleyball ou de soccer avec matériel fourni',
            sportDist1: 'Des tournois payants de soccer exigeant l’achat de ballons officiels',
            sportDist2: 'Des ligues de volleyball de plage sans prêt de filets ni inscription préalable',
            cultureAns: 'Des prestations musicales acoustiques présentées sous le kiosque le samedi',
            cultureDist1: 'Des concerts payants organisés autour des camions de cuisine de rue le samedi',
            cultureDist2: 'Des spectacles musicaux sous le kiosque réservés aux sportifs des ligues',
            evidenceSport: ['volleyball', 'soccer', 'ballons'],
            evidenceCulture: ['concerts', 'acoustiques', 'kiosque'],
          },
          {
            ville: 'de la Ville de Longueuil',
            parc: 'le parc régional Michel-Chartrand',
            sportTexte: 'de séances matinales de yoga et de course guidée sur sentiers',
            materiel: 'les tapis d’exercice adaptés et les accessoires de posture',
            culture: 'des représentations théâtrales familiales jouées en plein air',
            sportAns: 'Des cours matinaux combinant yoga et course avec prêt de tapis adapté',
            sportDist1: 'Des séances de course de nuit sur sentiers avec achat obligatoire de tapis',
            sportDist2: 'Des ateliers de yoga réservés aux citoyens sans accès au portail Web municipal',
            cultureAns: 'Des pièces de théâtre destinées aux familles interprétées en plein air',
            cultureDist1: 'Des pièces de théâtre payantes jouées dans le centre récréatif fermé',
            cultureDist2: 'Des représentations théâtrales familiales réservées aux groupes scolaires',
            evidenceSport: ['yoga', 'course', 'tapis'],
            evidenceCulture: ['théâtrales', 'plein', 'air'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `INFOLETTRE MUNICIPALE OFFICIELLE - ÉDITION SPÉCIALE ÉTÉ\nChers citoyens ${t.ville}, votre programmation d’activités culturelles et récréatives pour la saison estivale est enfin dévoilée ! Tout au long des mois de juillet et août, ${t.parc} deviendra le cœur des festivités familiales. Côté loisirs sportifs, les résidents pourront profiter ${t.sportTexte}, avec ${t.materiel} prêtés sans frais sur présentation de la carte citoyenne. Côté culture, nous vous convions à ${t.culture}. Des camions de cuisine de rue et des aires de pique-nique ombragées seront accessibles sur place. L’inscription préalable aux ateliers de groupe est obligatoire sur le portail Web des loisirs municipaux à compter du premier juin à neuf heures. Venez célébrer l’été au grand air en famille !`,
          questions: [
            makeQuestion('Quel est l’objet principal de cette publication municipale estivale ?', 'Présenter la programmation estivale d’activités sportives et culturelles', 'Annoncer les horaires des camions de cuisine de rue dans les parcs de la ville', 'Rappeler les consignes pour obtenir une nouvelle carte citoyenne municipale', ['programmation', 'estivale', 'loisirs']),
            makeQuestion('Quelle proposition sportive avec équipement prêté est offerte aux citoyens ?', t.sportAns, t.sportDist1, t.sportDist2, t.evidenceSport),
            makeQuestion('Quelle animation culturelle est accessible dans le parc ?', t.cultureAns, t.cultureDist1, t.cultureDist2, t.evidenceCulture),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Infolettre d'arrondissement montréalais - Automne culturel
    Object.assign(
      (rand) => {
        const tuples = [
          {
            secteur: 'dans l’arrondissement de Rosemont–La Petite-Patrie',
            biblio: 'la bibliothèque Marc-Favreau',
            atelier: 'des ateliers d’écriture créative et de contes pour enfants',
            tournoi: 'le tournoi amical d’échecs et de badminton',
            atelierAns: 'Des ateliers guidés favorisant l’écriture d’histoires chez les jeunes',
            atelierDist1: 'Une visite guidée payante de l’exposition sur l’histoire industrielle',
            atelierDist2: 'Des ateliers d’écriture réservés aux adultes sans accès aux contes jeunesse',
            tournoiAns: 'Une rencontre amicale et sportive mariant les échecs et le badminton',
            tournoiDist1: 'Une ligue de patinage de vitesse organisée dans les gymnases municipaux',
            tournoiDist2: 'Un championnat d’échecs payant réservé aux membres de la bibliothèque',
            evidenceAtelier: ['écriture', 'contes', 'enfants'],
            evidenceTournoi: ['échecs', 'badminton', 'tournoi'],
          },
          {
            secteur: 'dans l’arrondissement de Villeray–Saint-Michel',
            biblio: 'la maison de la culture Claude-Léveillée',
            atelier: 'des cours pratiques d’initiation à la poterie et au modelage',
            tournoi: 'la ligue récréative de basketball pour les adolescents',
            atelierAns: 'Des séances pratiques d’apprentissage du travail de la terre cuite et du modelage',
            atelierDist1: 'Des cours théoriques d’histoire industrielle locale dans la maison de la culture',
            atelierDist2: 'Des ateliers de sculpture sur pierre réservés aux professionnels de l’arrondissement',
            tournoiAns: 'Une ligue récréative de basketball destinée aux adolescents',
            tournoiDist1: 'Un tournoi de basketball ouvert uniquement aux adultes de l’arrondissement',
            tournoiDist2: 'Des séances de jeu libre payantes organisées durant les fins de semaine',
            evidenceAtelier: ['poterie', 'modelage', 'cours'],
            evidenceTournoi: ['basketball', 'adolescents', 'ligue'],
          },
          {
            secteur: 'dans l’arrondissement de Verdun',
            biblio: 'le Quai 5160 - Maison de la culture',
            atelier: 'des ateliers de photographie urbaine et de peinture d’automne',
            tournoi: 'la course de patins à roues alignées le long des berges',
            atelierAns: 'Des ateliers de création visuelle centrés sur la photo et la peinture',
            atelierDist1: 'Une vente aux enchères des clichés de l’histoire industrielle de Verdun',
            atelierDist2: 'Des cours de peinture d’automne réservés aux sportifs de la vie de quartier',
            tournoiAns: 'Une épreuve sportive sur patins à roues alignées en bordure fluviale',
            tournoiDist1: 'Une course de patinage intérieur payante organisée dans le gymnase',
            tournoiDist2: 'Une compétition de marche sur les berges réservée aux détenteurs de carte',
            evidenceAtelier: ['photographie', 'peinture', 'ateliers'],
            evidenceTournoi: ['patins', 'roues', 'berges'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `BULLETIN COMMUNAUTAIRE - AUTOMNE CULTUREL DANS VOTRE SECTEUR\nLa direction des loisirs et de la vie de quartier ${t.secteur} est fière de vous présenter son calendrier d’automne. Dès le premier octobre, ${t.biblio} accueillera une exposition photographique captivante sur l’histoire industrielle locale ainsi que ${t.atelier}. Pour les sportifs de tous âges, les inscriptions sont officiellement ouvertes pour ${t.tournoi}. Tous les gymnases municipaux offriront également des plages horaires de jeu libre et de patinage intérieur gratuit durant les fins de semaine. Les personnes détenant la carte de bibliothèque bénéficient d’un accès prioritaire pour l’ensemble des événements à jauge limitée. Rendez-vous sur notre site Internet pour réserver vos laissez-passer gratuits avant que les places ne soient épuisées !`,
          questions: [
            makeQuestion('Quel est l’objet de ce bulletin d’information distribué aux citoyens ?', 'Présenter le calendrier municipal des loisirs et activités de l’automne', 'Présenter l’horaire des gymnases municipaux pour les compétitions d’athlètes', 'Aviser les citoyens de la fermeture temporaire de la bibliothèque du quartier', ['bulletin', 'automne', 'calendrier']),
            makeQuestion('Quelle activité artistique ou d’expression est proposée dans le centre culturel ?', t.atelierAns, t.atelierDist1, t.atelierDist2, t.evidenceAtelier),
            makeQuestion('Quelle compétition ou ligue sportive récréative est accessible aux résidents ?', t.tournoiAns, t.tournoiDist1, t.tournoiDist2, t.evidenceTournoi),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Descriptif de microprogramme universitaire à l'UQAM
    Object.assign(
      (rand) => {
        const tuples = [
          {
            titre: 'Microprogramme de premier cycle en gestion des ressources humaines',
            credits: 'quinze crédits universitaires répartis sur cinq cours spécialisés',
            formule: 'une formule entièrement en ligne avec des classes virtuelles offertes le soir',
            public: 'les coordonnateurs et gestionnaires d’équipe déjà en exercice',
            formuleAns: 'Une modalité d’apprentissage à distance intégrant des cours synchrones en soirée',
            formuleDist1: 'Des cours en présentiel organisés dans les bibliothèques universitaires la fin de semaine',
            formuleDist2: 'Des séances obligatoires de jour sur le campus pour l’apprentissage des outils numériques',
            publicAns: 'Les professionnels en exercice qui coordonnent ou dirigent des équipes',
            publicDist1: 'Les étudiants réguliers de premier cycle sans expérience sur le marché du travail',
            publicDist2: 'Les chercheurs universitaires travaillant à plein temps dans les bibliothèques',
            evidenceFormule: ['ligne', 'virtuelles', 'soir'],
            evidencePublic: ['gestionnaires', 'équipe', 'professionnels'],
          },
          {
            titre: 'Certificat en communication organisationnelle et relations publiques',
            credits: 'trente crédits universitaires échelonnés sur deux années d’études',
            formule: 'un enseignement hybride combinant visioconférences et ateliers pratiques le samedi',
            public: 'les professionnels visant une réorientation vers les relations publiques',
            formuleAns: 'Un cursus mixte alliant visioconférences et ateliers d’application le samedi',
            formuleDist1: 'Des cours exclusivement offerts le soir en visioconférence sans ateliers le samedi',
            formuleDist2: 'Un enseignement à temps plein sur le campus universitaire durant deux années d’études',
            publicAns: 'Les travailleurs souhaitant se réorienter vers les relations publiques',
            publicDist1: 'Les étudiants inscrits à des cours de jour sans expérience professionnelle préalable',
            publicDist2: 'Les spécialistes en outils numériques ne souhaitant pas suivre d’ateliers le samedi',
            evidenceFormule: ['hybride', 'visioconférences', 'samedi'],
            evidencePublic: ['réorientation', 'relations', 'publiques'],
          },
          {
            titre: 'Microprogramme en gestion de projets dans le secteur communautaire',
            credits: 'douze crédits universitaires axés sur la gouvernance et le financement',
            formule: 'des cours intensifs de fin de semaine planifiés une fois par mois',
            public: 'les intervenants et coordonnateurs d’organismes à but non lucratif',
            formuleAns: 'Des sessions intensives de fin de semaine organisées à raison d’une fois par mois',
            formuleDist1: 'Des cours du soir hebdomadaires obligatoires pour tous les étudiants du microprogramme',
            formuleDist2: 'Une formule en ligne sans aucune rencontre de fin de semaine pour les cinq cours prévus',
            publicAns: 'Les intervenants et gestionnaires travaillant dans le milieu communautaire',
            publicDist1: 'Les intervenants détenant obligatoirement un diplôme collégial en gestion de projets',
            publicDist2: 'Les professionnels du secteur privé cherchant des cours de soir en semaine régulière',
            evidenceFormule: ['fin', 'semaine', 'mois'],
            evidencePublic: ['intervenants', 'organismes', 'lucratif'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `RÉPERTOIRE DES ÉTUDES CONTINUES - UNIVERSITÉ DU QUÉBEC À MONTRÉAL\nProgramme offert : ${t.titre}.\nCette formation courte et flexible comprend ${t.credits}. Conçue spécialement pour les professionnels sur le marché du travail, elle adopte ${t.formule}. Ce programme vise particulièrement ${t.public}. Les cours couvrent la législation du travail, la résolution de conflits, la communication interculturelle et les outils numériques de gestion collaborative. Les étudiants admis bénéficient d’un accès complet aux bibliothèques universitaires et aux bases de données de recherche spécialisées. Il est possible de faire reconnaître des acquis d’expérience professionnelle pour satisfaire aux exigences d’admission sans détenir de diplôme collégial préalable. Les candidatures pour la prochaine session sont acceptées jusqu’au premier août.`,
          questions: [
            makeQuestion('À quel public de travailleurs ce cursus universitaire s’adresse-t-il en priorité ?', t.publicAns, t.publicDist1, t.publicDist2, t.evidencePublic),
            makeQuestion('Quel aménagement pédagogique souple permet de concilier travail et formation ?', t.formuleAns, t.formuleDist1, t.formuleDist2, t.evidenceFormule),
            makeQuestion('Quelle disposition avantageuse facilite l’admission directe des adultes expérimentés ?', 'La reconnaissance officielle des acquis d’expérience professionnelle', 'La prolongation automatique des délais de candidature jusqu’au quinze septembre', 'Une réduction de moitié des frais d’inscription pour les adultes expérimentés', ['reconnaître', 'acquis', 'expérience']),
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
        const tuples = [
          {
            poste: 'Coordonnateur administratif ou coordonnatrice administrative',
            organisme: 'dans une fondation caritative de Montréal',
            taches: 'l’accueil des partenaires, la rédaction des comptes rendus et la logistique des réunions',
            salaire: 'vingt-huit et trente-deux dollars de l’heure selon l’expérience',
            posteAns: 'Un rôle de coordination administrative générale pour une fondation',
            posteDist1: 'Un rôle de direction générale supervisant les banques de données financières',
            posteDist2: 'Un poste d’animateur de réunions de partenaires sans tâches administratives',
            tachesAns: 'L’accueil des visiteurs, la prise de notes lors des rencontres et le soutien logistique',
            tachesDist1: 'La facturation des abonnements à des revues spécialisées pour les donateurs',
            tachesDist2: 'La tenue du registre des paies et la réservation de vols internationaux',
            evidencePoste: ['coordonnateur', 'administrative', 'fondation'],
            evidenceTaches: ['accueil', 'comptes', 'réunions'],
          },
          {
            poste: 'Adjoint exécutif ou adjointe exécutive à la direction',
            organisme: 'au sein d’une coopérative de services financiers',
            taches: 'la gestion des agendas, le suivi des correspondances officielles et l’organisation des déplacements',
            salaire: 'trente et trente-cinq dollars de l’heure avec régime de retraite',
            posteAns: 'Un poste d’assistance exécutive auprès de la direction d’une coopérative',
            posteDist1: 'Un poste de conseiller en services financiers auprès de la clientèle',
            posteDist2: 'Un rôle de responsable du classement des dossiers sans lien avec la direction',
            tachesAns: 'Le calendrier de direction, le traitement du courrier officiel et la gestion des trajets',
            tachesDist1: 'La validation des dossiers financiers sans gestion des correspondances',
            tachesDist2: 'La coordination exclusive des déplacements personnels de l’équipe de bureau',
            evidencePoste: ['adjoint', 'direction', 'financiers'],
            evidenceTaches: ['agendas', 'correspondances', 'déplacements'],
          },
          {
            poste: 'Agent de liaison ou agente de liaison et soutien de bureau',
            organisme: 'dans une association provinciale pour l’environnement',
            taches: 'la gestion des adhésions, l’envoi des infolettres et le soutien administratif aux chargés de projet',
            salaire: 'vingt-sept et trente et un dollars de l’heure avec horaire flexible',
            posteAns: 'Un mandat de liaison et de soutien bureautique au sein d’une organisation verte',
            posteDist1: 'Un poste de chargé de projet pour des études environnementales sur le terrain',
            posteDist2: 'Un mandat de vérificateur comptable pour les dossiers financiers de l’association',
            tachesAns: 'Le suivi des membres, l’expédition des infolettres et l’appui aux chargés de projet',
            tachesDist1: 'La direction autonome des campagnes environnementales sans appui administratif',
            tachesDist2: 'La rédaction intégrale des dossiers financiers sans expédition d’infolettres',
            evidencePoste: ['agent', 'liaison', 'environnement'],
            evidenceTaches: ['adhésions', 'infolettres', 'projet'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `OFFRE D’EMPLOI - RECRUTEMENT IMMÉDIAT\nTitre du poste : ${t.poste}\nNotre organisation, située ${t.organisme}, est à la recherche d’une personne dynamique, rigoureuse et organisée pour pourvoir un poste permanent à temps plein de trente-cinq heures par semaine. Sous la supervision de la direction générale, vos responsabilités principales incluront ${t.taches}. Vous assurerez également la mise à jour des banques de données et le classement des dossiers financiers. Le profil recherché comprend un diplôme collégial en bureautique ou équivalent, une excellente maîtrise du français écrit et une aisance avec la suite logicielle Microsoft 365. Le salaire offert se situe entre ${t.salaire}, avec une gamme complète d’avantages sociaux après trois mois. Faites parvenir votre lettre de motivation avant le vingt-cinq mai.`,
          questions: [
            makeQuestion('Quel titre de poste permanent est ouvert au recrutement dans cette offre ?', t.posteAns, t.posteDist1, t.posteDist2, t.evidencePoste),
            makeQuestion('Quelles tâches administratives concrètes feront partie du quotidien professionnel ?', t.tachesAns, t.tachesDist1, t.tachesDist2, t.evidenceTaches),
            makeQuestion('Quelle compétence fondamentale de communication est formellement requise ?', 'Une grande aisance rédactionnelle en français pour produire les documents', 'Une habileté orale pour animer des conférences de presse publiques et répondre aux médias', 'Une capacité d’écoute active pour négocier les contrats avec les fournisseurs régionaux', ['maîtrise', 'français', 'écrit']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Offre d'emploi - Technicien(ne) en soutien informatique
    Object.assign(
      (rand) => {
        const tuples = [
          {
            titre: 'Technicien ou technicienne en informatique et réseau',
            employeur: 'au Centre de services scolaire Marguerite-Bourgeoys',
            responsabilites: 'l’installation des postes de travail, le dépannage technique des enseignants et la maintenance du matériel',
            horaire: 'un horaire régulier de jour à raison de trente-cinq heures par semaine',
            employeurAns: 'Un centre de services scolaire du réseau de l’éducation publique',
            employeurDist1: 'Une entreprise privée fournissant du matériel informatique aux enseignants',
            employeurDist2: 'Un cabinet de consultation spécialisé dans l’inventaire scolaire du réseau',
            responsabilitesAns: 'L’installation des postes, la maintenance du matériel et le dépannage des enseignants',
            responsabilitesDist1: 'La programmation de sites Web pour le conseil d’établissement de l’école',
            responsabilitesDist2: 'La réparation des bâtiments et la pose de câbles électriques de la cafétéria',
            evidenceEmployeur: ['services', 'scolaire', 'marguerite-bourgeoys'],
            evidenceResp: ['installation', 'postes', 'enseignants'],
          },
          {
            titre: 'Spécialiste de soutien aux utilisateurs et infrastructures',
            employeur: 'à l’Institut de cardiologie de Montréal',
            responsabilites: 'la gestion des accès réseau, le support d’urgence aux soignants et le remplacement des pièces défectueuses',
            horaire: 'des quarts de travail rotatifs avec des primes bonifiées la fin de semaine',
            employeurAns: 'Un institut hospitalier réputé du secteur des soins et de la santé',
            employeurDist1: 'Une société privée de cybersécurité desservant les hôpitaux de Montréal',
            employeurDist2: 'Un centre de formation pour soignants axé sur les technologies de santé',
            responsabilitesAns: 'L’attribution des accès réseau, le support aux équipes médicales et le changement de pièces',
            responsabilitesDist1: 'La programmation de l’application mobile destinée aux visiteurs de l’hôpital',
            responsabilitesDist2: 'L’installation de climatiseurs dans les bureaux de l’aile administrative',
            evidenceEmployeur: ['institut', 'cardiologie', 'montréal'],
            evidenceResp: ['accès', 'réseau', 'soignants'],
          },
          {
            titre: 'Technicien ou technicienne au service d’assistance technique',
            employeur: 'dans une grande société d’État québécoise',
            responsabilites: 'le diagnostic à distance des anomalies logicielles, la configuration des téléphones et le traitement des requêtes',
            horaire: 'une formule hybride combinant trois jours au bureau et deux jours en télétravail',
            employeurAns: 'Une société d’État québécoise d’envergure dans le secteur parapublic',
            employeurDist1: 'Une entreprise privée de télécommunications offrant du télétravail',
            employeurDist2: 'Une agence gouvernementale chargée uniquement de l’inventaire public',
            responsabilitesAns: 'La résolution à distance des bogues logiciels et le paramétrage des téléphones',
            responsabilitesDist1: 'La rédaction de manuels de formation sur les serveurs de messagerie',
            responsabilitesDist2: 'L’entretien mécanique des photocopieuses et le remplacement des cartouches',
            evidenceEmployeur: ['société', 'état', 'québécoise'],
            evidenceResp: ['diagnostic', 'anomalies', 'téléphones'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `OFFRE DE CARRIÈRE - SECTEUR PUBLIC QUÉBÉCOIS\nPoste : ${t.titre}, en poste régulier ${t.employeur}.\nRelevant du coordonnateur des technologies de l’information, la personne titulaire aura comme mandat principal d’assurer le bon fonctionnement du parc informatique. Les tâches comprendront ${t.responsabilites}. La personne participera également à l’inventaire du matériel et à la sensibilisation des utilisateurs aux pratiques de cybersécurité. Nous recherchons un candidat titulaire d’un DEC ou d’un DEP en soutien informatique avec au moins deux années d’expérience pertinente. Le poste offre ${t.horaire}, un régime de retraite gouvernemental très avantageux et quatre semaines de vacances dès la première année. Les candidatures doivent être déposées sur notre portail d’embauche avant le trente avril.`,
          questions: [
            makeQuestion('Quel environnement institutionnel recrute pour ce poste informatique ?', t.employeurAns, t.employeurDist1, t.employeurDist2, t.evidenceEmployeur),
            makeQuestion('Quel mandat technique opérationnel est confié à la personne engagée ?', t.responsabilitesAns, t.responsabilitesDist1, t.responsabilitesDist2, t.evidenceResp),
            makeQuestion('Quels avantages sociaux sont offerts dès la première année d’entrée en fonction ?', 'Un fonds de retraite public avantageux et quatre semaines de congés payés dès l’embauche', 'Le remboursement intégral des frais d’accès à Internet pour les journées de télétravail', 'Une dispense complète de période probatoire pour les candidats détenant un DEC en soutien', ['retraite', 'quatre', 'semaines', 'vacances']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article biographique d'une scientifique québécoise
    Object.assign(
      (rand) => {
        const tuples = [
          {
            nom: 'Docteure Joanne Tremblay',
            origine: 'dans un village côtier de la péninsule gaspésienne',
            discipline: 'l’océanographie et la préservation des écosystèmes marins du Saint-Laurent',
            prix: 'le prix scientifique Marie-Victorin du gouvernement du Québec',
            disciplineAns: 'L’océanographie et la protection de la faune marine dans l’estuaire',
            disciplineDist1: 'La physique des particules et les accélérateurs de recherche',
            disciplineDist2: 'La génétique végétale et l’amélioration des cultures agricoles',
            prixAns: 'Le prix scientifique Marie-Victorin décerné par le gouvernement du Québec',
            prixDist1: 'Un prix honorifique décerné par une université européenne pour ses articles',
            prixDist2: 'La nomination comme directrice de recherche pour les parcs côtiers du Québec',
            evidenceDiscipline: ['océanographie', 'préservation', 'écosystèmes'],
            evidencePrix: ['marie-victorin', 'gouvernement', 'québec'],
          },
          {
            nom: 'Docteure Céline Beaulieu',
            origine: 'dans une communauté agricole de la région du Saguenay',
            discipline: 'la microbiologie des sols boréaux et la régénération naturelle des forêts',
            prix: 'l’Ordre national du Québec pour sa contribution à la biodiversité',
            disciplineAns: 'L’étude microbienne des sols boréaux et le renouveau forestier naturel',
            disciplineDist1: 'La physique nucléaire appliquée aux réacteurs des centrales électriques',
            disciplineDist2: 'La chimie organique de synthèse des médicaments pharmaceutiques',
            prixAns: 'L’Ordre national du Québec soulignant son apport à la biodiversité boréale',
            prixDist1: 'Une médaille d’honneur décernée par les coopératives agricoles du Saguenay',
            prixDist2: 'Le prix Marie-Victorin pour la promotion des sciences auprès des étudiants',
            evidenceDiscipline: ['microbiologie', 'sols', 'forêts'],
            evidencePrix: ['ordre', 'national', 'biodiversité'],
          },
          {
            nom: 'Docteure Hélène Desbiens',
            origine: 'dans un quartier populaire de l’est de Montréal',
            discipline: 'la thérapie génique visant à guérir des maladies infantiles rares',
            prix: 'la médaille d’or du Conseil de recherches médicales du Canada',
            disciplineAns: 'La recherche en thérapie génique contre des maladies infantiles rares',
            disciplineDist1: 'L’astronomie observationnelle et la cartographie des étoiles doubles',
            disciplineDist2: 'La géologie minière et l’exploration des gisements de cuivre',
            prixAns: 'La médaille d’or décernée par le Conseil de recherches médicales',
            prixDist1: 'L’Ordre national du Québec pour son engagement auprès des jeunes filles',
            prixDist2: 'Le prix d’excellence de l’Université Laval pour l’encadrement au laboratoire',
            evidenceDiscipline: ['thérapie', 'génique', 'infantiles'],
            evidencePrix: ['médaille', 'or', 'médicales'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `PORTRAIT BIOGRAPHIQUE - UNE CHERCHEUSE PIONNIÈRE DU QUÉBEC\nNée ${t.origine}, ${t.nom} a toujours été animée par une grande curiosité pour le monde vivant. Dès son enfance, elle observait la nature avec une rigueur qui annonçait déjà son intérêt pour la recherche. Après de solides études à l’Université Laval et un séjour de recherche en Europe, elle est devenue une référence reconnue dans le domaine de ${t.discipline}. Tout au long de son parcours, elle a publié de nombreux articles scientifiques et formé plusieurs étudiants aux cycles supérieurs. En reconnaissance de ses découvertes importantes, elle a reçu ${t.prix}. Au-delà de ses travaux au laboratoire, elle milite avec conviction pour encourager les jeunes filles à choisir des carrières en sciences. Une chercheuse remarquable dont le parcours inspire la relève scientifique d’ici.`,
          questions: [
            makeQuestion('Dans quel domaine d’expertise scientifique cette pionnière s’est-elle illustrée ?', t.disciplineAns, t.disciplineDist1, t.disciplineDist2, t.evidenceDiscipline),
            makeQuestion('Quelle distinction prestigieuse est venue couronner ses contributions remarquables ?', t.prixAns, t.prixDist1, t.prixDist2, t.evidencePrix),
            makeQuestion('Quel engagement social poursuit-elle parallèlement à ses recherches de pointe ?', 'L’incitation des jeunes filles à s’orienter vers les carrières scientifiques', 'Le financement exclusif d’études en Europe pour les étudiants des cycles supérieurs', 'La création d’organismes de recherche indépendants dans son village natal côtier', ['jeunes', 'filles', 'sciences']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Portrait d'un chef cuisinier mettant en valeur le terroir
    Object.assign(
      (rand) => {
        const tuples = [
          {
            chef: 'Renaud Simard',
            restaurant: 'son établissement réputé du Vieux-Montréal',
            philosophie: 'sublimer les champignons sauvages de la forêt boréale et le terroir québécois',
            honneur: 'du titre honorifique d’ambassadeur de notre gastronomie régionale',
            philoAns: 'La mise en valeur originale des champignons de cueillette boréale',
            philoDist1: 'L’approvisionnement auprès de distributeurs industriels sans lien avec le terroir',
            philoDist2: 'La reproduction fidèle des recettes traditionnelles apprises dans les grandes cuisines',
            honneurAns: 'Le titre honorifique d’ambassadeur de la gastronomie régionale québécoise',
            honneurDist1: 'Le prix du meilleur formateur régional décerné par de grandes cuisines',
            honneurDist2: 'Une médaille décernée par les cueilleurs de champignons de la forêt boréale',
            evidencePhilo: ['champignons', 'sauvages', 'boréale'],
            evidenceHonneur: ['ambassadeur', 'gastronomie', 'régionale'],
          },
          {
            chef: 'Mathieu Caron',
            restaurant: 'sa cabane gourmande établie en campagne dans les Cantons-de-l’Est',
            philosophie: 'réinventer les recettes rustiques traditionnelles avec des viandes d’élevage local et du sirop d’érable',
            honneur: 'de l’étoile d’or de la créativité culinaire au gala provincial des restaurateurs',
            philoAns: 'La réinvention de recettes traditionnelles avec viandes locales et sirop d’érable',
            philoDist1: 'L’utilisation d’ingrédients d’importation pour moderniser les repas en campagne',
            philoDist2: 'Le service de plats gastronomiques sans viande locale ni produit de l’érablière',
            honneurAns: 'Le prestigieux trophée récompensant l’inventivité en cuisine des restaurateurs',
            honneurDist1: 'Le titre d’ambassadeur de la gastronomie décerné par les producteurs agricoles',
            honneurDist2: 'Le prix de la meilleure cabane de campagne attribué par les éleveurs locaux',
            evidencePhilo: ['recettes', 'rustiques', 'érable'],
            evidenceHonneur: ['étoile', 'créativité', 'restaurateurs'],
          },
          {
            chef: 'Étienne Lapointe',
            restaurant: 'sa table de bord de mer dans la région du Bas-Saint-Laurent',
            philosophie: 'valoriser les algues marines comestibles, les herbes de grève et les poissons côtiers',
            honneur: 'du prix prestigieux de chef de l’année décerné lors de la grande fête des saveurs',
            philoAns: 'La valorisation d’algues marines, d’herbes de grève et de poissons côtiers',
            philoDist1: 'L’achat de poissons congelés provenant de marchés extérieurs au Bas-Saint-Laurent',
            philoDist2: 'La préparation de viandes d’élevage en éliminant les plantes sauvages du menu',
            honneurAns: 'Le titre envié de chef de l’année attribué au grand rassemblement gastronomique',
            honneurDist1: 'L’étoile d’or de la créativité culinaire remise lors du gala provincial',
            honneurDist2: 'Le trophée du restaurateur de l’année remis par les pêcheurs du littoral',
            evidencePhilo: ['algues', 'herbes', 'poissons'],
            evidenceHonneur: ['chef', 'année', 'saveurs'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `FIGURES MARQUANTES DE CHEZ NOUS - LE CHEF DU TERROIR\nReconnu comme un créateur culinaire marquant de sa génération, ${t.chef} a profondément renouvelé la cuisine régionale au Québec. Après une jeunesse modeste en région, il a perfectionné son art dans de grandes cuisines avant de s’établir à son compte. En ouvrant ${t.restaurant}, il a proposé une approche nouvelle : ${t.philosophie}. Il a bâti des liens solides avec de petits producteurs agricoles, des cueilleurs de plantes sauvages et des pêcheurs locaux. Pour souligner son apport marquant à notre culture de la table, il a été décoré ${t.honneur}. Aujourd’hui formateur auprès des jeunes cuisiniers, il transmet l’importance de valoriser les ressources locales et les saisons.`,
          questions: [
            makeQuestion('Quelle démarche gastronomique originale caractérise la cuisine de ce chef ?', t.philoAns, t.philoDist1, t.philoDist2, t.evidencePhilo),
            makeQuestion('Quelle distinction officielle consacre l’excellence de son engagement culinaire ?', t.honneurAns, t.honneurDist1, t.honneurDist2, t.evidenceHonneur),
            makeQuestion('Quelle valeur fondamentale transmet-il aujourd’hui à la relève culinaire ?', 'La mise en valeur primordiale du terroir québécois et des arrivages saisonniers', 'La priorité donnée à la rapidité du service plutôt qu’à la qualité des produits', 'L’importance de standardiser les recettes pour réduire les coûts d’approvisionnement', ['ressources', 'locales', 'saisons']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Offre d'emploi - Préposé(e) aux bénéficiaires
    Object.assign(
      (rand) => {
        const tuples = [
          {
            titre: 'Préposé ou préposée aux bénéficiaires',
            etablissement: 'en centre d’hébergement et de soins de longue durée (CHSLD)',
            soins: 'l’aide à l’alimentation, l’hygiène corporelle et la mobilisation sécuritaire des résidents âgés',
            exigences: 'détenir une attestation d’études professionnelles (AEP) et une carte de secourisme à jour',
            etabAns: 'Un établissement public d’hébergement pour personnes en perte d’autonomie',
            etabDist1: 'Une résidence étudiante universitaire aménagée près des campus de la région',
            etabDist2: 'Un camp de vacances d’été pour adolescents animé par des moniteurs bénévoles',
            soinsAns: 'Le soutien aux repas, la toilette quotidienne et l’aide aux déplacements',
            soinsDist1: 'Le ménage complet des chambres, le lavage des rideaux et le changement hebdomadaire de la literie',
            soinsDist2: 'La lecture d’histoires aux enfants hospitalisés pendant la nuit dans une unité de pédiatrie',
            evidenceEtab: ['hébergement', 'soins', 'chsld'],
            evidenceSoins: ['alimentation', 'hygiène', 'mobilisation'],
          },
          {
            titre: 'Auxiliaire aux services de santé et sociaux',
            etablissement: 'au sein de l’équipe de soutien à domicile du CLSC local',
            soins: 'l’accompagnement quotidien, la préparation de repas simples et la surveillance bienveillante à la maison',
            exigences: 'posséder un diplôme secondaire et un permis de conduire valide avec voiture personnelle',
            etabAns: 'Le service de soutien à domicile d’un centre local de services communautaires',
            etabDist1: 'Une colocation étudiante près d’un campus, avec cuisine et salle de bain partagées',
            etabDist2: 'Une auberge de jeunesse pour voyageurs de passage dans le centre-ville',
            soinsAns: 'L’assistance à domicile, la confection de plats légers et la présence attentive',
            soinsDist1: 'Le nettoyage hebdomadaire des vitres et des planchers de la maison familiale au complet',
            soinsDist2: 'La lecture de contes aux enfants hospitalisés pendant la nuit dans une unité de pédiatrie',
            evidenceEtab: ['soutien', 'domicile', 'clsc'],
            evidenceSoins: ['accompagnement', 'repas', 'surveillance'],
          },
          {
            titre: 'Préposé ou préposée aux soins généraux',
            etablissement: 'dans une résidence privée pour aînés certifiée par le gouvernement',
            soins: 'la distribution des plateaux-repas, l’aide au lever et l’animation de jeux calmes de détente',
            exigences: 'démontrer une grande empathie, de la patience et une bonne endurance physique',
            etabAns: 'Un complexe résidentiel privé pour aînés dûment homologué par le gouvernement',
            etabDist1: 'Un village de vacances pour familles nombreuses au bord d’un lac',
            etabDist2: 'Une coopérative d’habitation pour jeunes couples dans un quartier animé',
            soinsAns: 'Le service de nourriture aux chambres, l’assistance matinale et les loisirs doux',
            soinsDist1: 'Le ménage complet des chambres, le lavage des rideaux et le changement hebdomadaire de la literie',
            soinsDist2: 'La lecture d’histoires aux enfants hospitalisés pendant la nuit dans une unité de pédiatrie',
            evidenceEtab: ['résidence', 'privée', 'aînés'],
            evidenceSoins: ['plateaux-repas', 'lever', 'détente'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `AVIS DE RECRUTEMENT EN SANTÉ - EMPLOI ESSENTIEL\nTitre d’emploi : ${t.titre}, ${t.etablissement}.\nNous recrutons des personnes bienveillantes et engagées pour offrir des soins personnalisés à notre clientèle vulnérable. Votre rôle quotidien sera au cœur du confort des personnes hébergées : vos responsabilités comprendront ${t.soins}. Vous travaillerez en étroite collaboration avec l’équipe d’infirmières pour signaler tout changement dans l’état de santé des usagers. Les exigences du poste demandent de ${t.exigences}. Nous offrons un salaire débutant à vingt-six dollars de l’heure avec des primes de soir et de nuit bonifiées, ainsi qu’une conciliation travail-famille exemplaire. Plusieurs postes permanents sont offerts à temps plein ou à temps partiel. Postulez dès aujourd’hui en joignant votre relevé de notes !`,
          questions: [
            makeQuestion('Dans quel milieu de vie dédié aux personnes âgées cette offre s’inscrit-elle ?', t.etabAns, t.etabDist1, t.etabDist2, t.evidenceEtab),
            makeQuestion('Quelles interventions concrètes d’aide et de réconfort sont confiées au candidat ?', t.soinsAns, t.soinsDist1, t.soinsDist2, t.evidenceSoins),
            makeQuestion('Quelles conditions salariales et de conciliation avantageuses sont garanties ?', 'Un taux horaire initial de vingt-six dollars assorti de bonifications de quart', 'Un taux horaire de vingt-huit dollars assorti d’un régime de retraite et d’une assurance collective', 'Une prime annuelle de fin d’année équivalant à trois mois de salaire brut versée chaque décembre', ['salaire', 'vingt-six', 'primes']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],

  // n6-reading-2
  // Ex 0: Suivre le parcours d’un cétacé égaré dans un cours d’eau rapporté par la presse.
  // n6-reading-2
  // Ex 0: Suivre, dans un article, le déroulement des évènements concernant un béluga égaré dans le fleuve Saint-Laurent.
  // Ex 1: Suivre, dans un article, le déroulement des évènements concernant une panne d’électricité majeure dans sa ville.
  'n6-reading-2': [
    // Scenario 0 (Template, Ex 0): Article presse - Rorqual à bosse égaré à Montréal
    Object.assign(
      (rand) => {
        const tuples = [
          {
            cetace: 'un rorqual à bosse juvénile de dix mètres',
            endroit: 'dans le bassin du Vieux-Port de Montréal',
            distance: 'à plus de quatre cent cinquante kilomètres de son habitat marin salé',
            mesure: 'd’imposer une zone d’exclusion maritime et de réduire la vitesse des navires marchands',
            cetaceAns: 'Un rorqual à bosse juvénile naviguant dans le Vieux-Port de Montréal',
            cetaceDist1: 'Une colonie de phoques gris échouée sur les rochers de l’île d’Orléans',
            cetaceDist2: 'Une migration massive d’oies blanches observée au-dessus du lac Saint-Pierre',
            mesureAns: 'L’imposition d’une zone d’exclusion et la réduction de vitesse des navires',
            mesureDist1: 'Le blocage complet de l’accès au Vieux-Port pour tous les navires de la Garde côtière',
            mesureDist2: 'L’acheminement immédiat de nourriture adaptée directement dans le bassin portuaire',
            evidenceCetace: ['rorqual', 'bosse', 'Montréal'],
            evidenceMesure: ['exclusion', 'vitesse', 'navires'],
          },
          {
            cetace: 'un jeune béluga blanc égaré de son groupe',
            endroit: 'près du pont Jacques-Cartier dans les forts courants du fleuve',
            distance: 'à près de trois cents kilomètres en amont de Tadoussac',
            mesure: 'd’interdire la circulation des bateaux de plaisance et des motomarines dans le secteur',
            cetaceAns: 'Un jeune béluga blanc isolé près du pont Jacques-Cartier',
            cetaceDist1: 'Un troupeau de caribous traversant le lac Saint-Jean à la nage',
            cetaceDist2: 'Une colonie de phoques gris échouée sur les rochers de l’île d’Orléans',
            mesureAns: 'L’interdiction de naviguer pour les bateaux de plaisance et les motomarines',
            mesureDist1: 'L’éloignement forcé du jeune béluga par les navires de la Garde côtière vers Tadoussac',
            mesureDist2: 'L’arrêt de toute intervention des spécialistes du Réseau québécois auprès de l’animal',
            evidenceCetace: ['béluga', 'blanc', 'Jacques-Cartier'],
            evidenceMesure: ['interdire', 'bateaux', 'motomarines'],
          },
          {
            cetace: 'une baleine de Minke d’environ sept mètres',
            endroit: 'aux abords des quais du port commercial de Montréal',
            distance: 'à plus de cinq cents kilomètres des eaux maritimes de l’estuaire',
            mesure: 'd’installer des balises acoustiques pour surveiller en continu l’état et les plongées du mammifère',
            cetaceAns: 'Une baleine de Minke repérée près des installations portuaires montréalaises',
            cetaceDist1: 'Un troupeau de caribous traversant le lac Saint-Jean à la nage',
            cetaceDist2: 'Une migration massive d’oies blanches observée au-dessus du lac Saint-Pierre',
            mesureAns: 'L’installation de balises acoustiques de surveillance continue des plongées',
            mesureDist1: 'La fermeture complète des quais du port commercial à tout navire de la Garde côtière',
            mesureDist2: 'L’obligation pour les spécialistes de ramener sans délai la baleine vers l’estuaire',
            evidenceCetace: ['baleine', 'Minke', 'quais'],
            evidenceMesure: ['balises', 'acoustiques', 'surveiller'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `ACTUALITÉ ENVIRONNEMENTALE - ODYSSÉE INHABITUELLE DANS LE FLEUVE\nUn événement faunique exceptionnel retient l’attention des Québécois depuis plusieurs jours. ${cap(t.cetace)} a remonté le cours du fleuve Saint-Laurent pour atteindre les eaux douces ${t.endroit}. L’animal se trouve ${t.distance}, un phénomène très rare qui inquiète les biologistes du Réseau québécois d’urgences pour les mammifères marins. Selon les spécialistes, l’eau douce prolongée fragilise la peau de l’animal et il ne trouve aucune nourriture adaptée dans ce secteur. Afin de protéger le mammifère contre d’éventuelles collisions, Transports Canada a ordonné ${t.mesure}. Des navires de la Garde côtière veillent jour et nuit pour dissuader les curieux de s’approcher. Tous espèrent que l’animal retrouvera de lui-même le chemin vers l’océan.`,
          questions: [
            makeQuestion('Quel événement faunique rare et insolite est rapporté par la presse québécoise ?', t.cetaceAns, t.cetaceDist1, t.cetaceDist2, t.evidenceCetace),
            makeQuestion('Pourquoi le séjour prolongé de l’animal en eau douce inquiète-t-il les biologistes ?', 'La fragilisation de son épiderme et l’absence de nourriture adaptée sur place', 'Le danger immédiat de collision avec des navires marchands circulant dans la zone', 'L’attroupement continu de curieux s’approchant en bateau le long des quais du port', ['fragilise', 'nourriture', 'adaptée']),
            makeQuestion('Quelle mesure de protection immédiate Transports Canada a-t-il ordonnée ?', t.mesureAns, t.mesureDist1, t.mesureDist2, t.evidenceMesure),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Baleine à bosse dans le fjord du Saguenay
    Object.assign(
      (rand) => {
        const tuples = [
          {
            animal: 'Une baleine bleue imposante',
            verbeSujet: 's’est aventurée',
            site: 'dans la baie Éternité en plein cœur du fjord du Saguenay',
            alerte: 'des kayakistes qui ont aperçu son souffle puissant à l’aube',
            patrouille: 'une équipe de patrouilleurs du parc marin veille à ce qu’aucune embarcation ne s’approche à moins de quatre cents mètres',
            animalAns: 'Une baleine bleue imposante s’aventurant dans le fjord du Saguenay',
            animalDist1: 'Une accumulation exceptionnelle de bancs de krill dérivant au fond de la baie Éternité',
            animalDist2: 'Une patrouille d’embarcations du parc marin inspectant les parois de la gorge rocheuse',
            alerteAns: 'Des sportifs en kayak ayant distingué son jet d’eau à l’aurore',
            alerteDist1: 'Des patrouilleurs du parc marin veillant sur le périmètre de la baie Éternité',
            alerteDist2: 'Des experts maritimes étudiant les courants inhabituels de krill dans le fjord',
            distanceAns: 'Garder un rayon de sécurité d’au moins quatre cents mètres avec le mammifère',
            distanceDist1: 'Suivre le sillage du mammifère marin à faible allure pour guider sa sortie du fjord',
            distanceDist2: 'Naviguer uniquement à proximité des patrouilleurs du parc marin durant quarante-huit heures',
            evidenceAnimal: ['baleine', 'bleue', 'fjord'],
            evidenceAlerte: ['kayakistes', 'souffle', 'aube'],
            evidenceDistance: ['quatre', 'cents', 'mètres'],
          },
          {
            animal: 'Un rorqual commun adulte',
            verbeSujet: 's’est aventuré',
            site: 'dans les eaux profondes de l’embouchure du Saguenay',
            alerte: 'le capitaine d’un traversier régulier reliant Tadoussac à Baie-Sainte-Catherine',
            patrouille: 'des agents de protection de la faune veillent à faire respecter un périmètre de six cents mètres autour du mammifère',
            animalAns: 'Un rorqual commun adulte circulant dans les eaux de l’embouchure du Saguenay',
            animalDist1: 'Une traversée spéciale organisée par le capitaine du traversier à Baie-Sainte-Catherine',
            animalDist2: 'Une concentration anormale de krill attirant de multiples navires marchands dans le fjord',
            alerteAns: 'Le commandant d’un traversier reliant les deux rives du Saguenay',
            alerteDist1: 'Des agents de protection de la faune patrouillant le long de l’embouchure',
            alerteDist2: 'Des experts maritimes évaluant la présence de krill dans les eaux profondes',
            distanceAns: 'Maintenir une zone tampon d’au moins six cents mètres autour du cétacé',
            distanceDist1: 'Accompagner le traversier de Baie-Sainte-Catherine jusqu’à l’embouchure du Saguenay',
            distanceDist2: 'Signaler immédiatement la position des agents de la faune à chaque navire de passage',
            evidenceAnimal: ['rorqual', 'commun', 'Saguenay'],
            evidenceAlerte: ['capitaine', 'traversier', 'reliant'],
            evidenceDistance: ['six', 'cents', 'mètres'],
          },
          {
            animal: 'Un jeune béluga blanc égaré',
            verbeSujet: 's’est aventuré',
            site: 'dans les méandres escarpés de la rivière Sainte-Marguerite',
            alerte: 'des résidents riverains intrigués par ses apparitions répétées à la surface de l’eau',
            patrouille: 'une brigade nautique spécialisée veille à ce que personne ne franchisse un rayon de trois cents mètres',
            animalAns: 'Un jeune béluga blanc égaré dans une rivière tributaire du fjord',
            animalDist1: 'Un déplacement massif de bancs de krill le long de la rivière Sainte-Marguerite',
            animalDist2: 'Une brigade nautique inspectant les méandres escarpés à la demande des résidents',
            alerteAns: 'Des habitants du bord de l’eau étonnés de voir l’animal émerger',
            alerteDist1: 'Des patrouilleurs de la brigade nautique circulant sur la rivière',
            alerteDist2: 'Des biologistes marins chargés de cartographier les bancs de krill',
            distanceAns: 'Interdire toute approche nautique à moins de trois cents mètres de l’animal',
            distanceDist1: 'Suivre la brigade nautique à distance constante le long de la rivière Sainte-Marguerite',
            distanceDist2: 'Avertir les résidents riverains dès que le jeune mammifère s’approche de la berge rocheuse',
            evidenceAnimal: ['béluga', 'blanc', 'rivière'],
            evidenceAlerte: ['résidents', 'riverains', 'surface'],
            evidenceDistance: ['trois', 'cents', 'mètres'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `REPORTAGE DE PRESSE - INTRUSION SPECTACULAIRE AU ROYAUME DU SAGUENAY\nLes riverains du fjord assistent depuis quarante-huit heures à un spectacle naturel fascinant. ${t.animal} ${t.verbeSujet} bien au-delà de son périmètre habituel, naviguant ${t.site}. Le premier signalement a été donné par ${t.alerte}. Les experts maritimes expliquent que des courants inhabituels de krill ont pu attirer l’animal dans cette gorge rocheuse abrupte. Pour garantir la quiétude de ce visiteur rare, ${t.patrouille}. Les autorités rappellent que le harcèlement d’un mammifère marin protégé constitue une infraction passible de lourdes amendes en vertu de la loi sur les espèces en péril.`,
          questions: [
            makeQuestion('Quel événement naturel remarquable retient toute l’attention des riverains ?', t.animalAns, t.animalDist1, t.animalDist2, t.evidenceAnimal),
            makeQuestion('Par qui le premier signalement de l’animal a-t-il été transmis aux autorités ?', t.alerteAns, t.alerteDist1, t.alerteDist2, t.evidenceAlerte),
            makeQuestion('Quelle consigne stricte de navigation les patrouilleurs imposent-ils aux plaisanciers ?', t.distanceAns, t.distanceDist1, t.distanceDist2, t.evidenceDistance),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Panne d'électricité majeure après une tempête de vent
    Object.assign(
      (rand) => {
        const tuples = [
          {
            ville: 'dans la région métropolitaine de Montréal',
            rafales: 'des vents violents soufflant à près de cent kilomètres à l’heure',
            verbeRafale: 'ont provoqué',
            foyers: 'plus de deux cent cinquante mille foyers et commerces',
            mobilisation: 'cinq cents équipes de monteurs de ligne sont déployées jour et nuit sur le terrain',
            causeAns: 'Des bourrasques violentes à une vitesse avoisinant les cent kilomètres-heure',
            causeDist1: 'Une vague de chaleur extrême qui a fait fondre les câbles de transport',
            causeDist2: 'Une longue période de grand froid sous les moins quarante degrés',
            mobilisationAns: 'L’envoi sur le réseau de cinq cents équipes de monteurs mobilisées en continu',
            mobilisationDist1: 'Le recours à des drones d’inspection pour repérer les lignes à haute tension endommagées',
            mobilisationDist2: 'La construction de centrales de secours alimentées au diesel dans chaque quartier touché',
            evidenceCause: ['vents', 'violents', 'cent'],
            evidenceMob: ['cinq', 'cents', 'monteurs'],
          },
          {
            ville: 'dans les arrondissements de la ville de Québec',
            rafales: 'des bourrasques destructrices accompagnées de pluie torrentielle',
            verbeRafale: 'ont provoqué',
            foyers: 'près de cent quatre-vingts mille clients d’Hydro-Québec',
            mobilisation: 'des équipes de monteurs venues en renfort d’autres régions s’activent sans relâche',
            causeAns: 'Des vents violents et des pluies torrentielles ayant endommagé le réseau',
            causeDist1: 'Une sécheresse prolongée ayant asséché les sols autour des poteaux',
            causeDist2: 'Un brouillard givrant dense qui a couvert la ville toute la nuit',
            mobilisationAns: 'L’appui d’effectifs de monteurs acheminés depuis d’autres zones pour réparer',
            mobilisationDist1: 'L’installation de transformateurs temporaires de grande capacité dans les postes de quartier',
            mobilisationDist2: 'La mise en service de lignes souterraines enfouies dans tous les quartiers de la capitale',
            evidenceCause: ['bourrasques', 'destructrices', 'torrentielle'],
            evidenceMob: ['renfort', 'régions', 'activent'],
          },
          {
            ville: 'dans la région rurale de la Montérégie',
            rafales: 'un coup de vent destructeur d’une rare violence',
            verbeRafale: 'a provoqué',
            foyers: 'plus de cent cinquante mille résidences privées',
            mobilisation: 'des spécialistes élagueurs débroussaillent sans répit les débris tombés sur les fils',
            causeAns: 'Une violente tempête soudaine d’une force rare qui a arraché les arbres',
            causeDist1: 'Une vague de chaleur extrême qui a fait fondre les câbles de transport',
            causeDist2: 'Une longue période de grand froid sous les moins quarante degrés',
            mobilisationAns: 'L’intervention sans répit d’élagueurs spécialisés dégageant les fils',
            mobilisationDist1: 'L’envoi d’une flotte d’hélicoptères pour inspecter les lignes de transport',
            mobilisationDist2: 'La construction temporaire de nouvelles lignes électriques en bordure de forêt',
            evidenceCause: ['coup', 'vent', 'violence'],
            evidenceMob: ['élagueurs', 'débroussaillent', 'fils'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `CHRONIQUE D’ACTUALITÉ - LA VILLE PLONGÉE DANS LE NOIR\nLa bourrasque automnale qui a balayé le sud de la province a laissé de lourdes séquelles ${t.ville}. Hier vers dix-sept heures, ${t.rafales} ${t.verbeRafale} la chute de centaines de branches et de gros arbres sur le réseau électrique. En moins de deux heures, les coupures se sont propagées, privant d’électricité ${t.foyers}. Les feux de circulation éteints ont provoqué de forts ralentissements sur toutes les artères principales. Plusieurs municipalités ont ouvert des centres d’hébergement temporaires avec génératrices pour permettre aux citoyens de se réchauffer et de recharger leurs téléphones. Hydro-Québec souligne que ${t.mobilisation}. Le rétablissement complet du courant prendra toutefois encore de quarante-huit à soixante-douze heures dans les secteurs les plus lourdement endommagés.`,
          questions: [
            makeQuestion('Quel phénomène météorologique violent a provoqué ces pannes majeures de courant ?', t.causeAns, t.causeDist1, t.causeDist2, t.evidenceCause),
            makeQuestion('Quel déploiement exceptionnel sur le terrain Hydro-Québec met-elle en avant ?', t.mobilisationAns, t.mobilisationDist1, t.mobilisationDist2, t.evidenceMob),
            makeQuestion('Quelle mesure d’urgence les municipalités ont-elles ouverte pour soutenir les résidents ?', 'Des centres d’hébergement temporaires chauffés équipés de génératrices', 'L’ouverture continue des ateliers municipaux pour recharger les téléphones des citoyens', 'Le déploiement de patrouilles municipales pour réguler les feux de circulation éteints', ['hébergement', 'génératrices', 'réchauffer']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Panne causée par une tempête de verglas printanière
    Object.assign(
      (rand) => {
        const tuples = [
          {
            secteur: 'la région de Lanaudière et des Laurentides',
            epaisseur: 'vingt-cinq millimètres',
            bris: 'l’effondrement de plusieurs poteaux et de transformateurs',
            delai: 'trois à quatre jours de travaux continus',
            brisAns: 'La chute sous le verglas de poteaux électriques et de transformateurs',
            brisDist1: 'L’inondation soudaine de conduits électriques souterrains en milieu urbain',
            brisDist2: 'L’arrachement de câbles de transmission le long des voies ferroviaires',
            delaiAns: 'Entre trois et quatre journées complètes d’efforts soutenus pour tout rétablir',
            delaiDist1: 'Un rétablissement garanti dès la fin de la nuit pour l’ensemble des quartiers',
            delaiDist2: 'Une attente limitée à quelques heures avant le redémarrage des transformateurs',
            evidenceBris: ['effondrement', 'poteaux', 'transformateurs'],
            evidenceDelai: ['trois', 'quatre', 'jours'],
          },
          {
            secteur: 'l’ouest de l’île de Montréal et Laval',
            epaisseur: 'quinze millimètres',
            bris: 'la rupture de câbles aériens majeurs près des autoroutes',
            delai: 'au moins quarante-huit heures de travail continu',
            brisAns: 'Le sectionnement de lignes aériennes importantes longeant les autoroutes',
            brisDist1: 'L’affaissement de pylônes métalliques de transport d’énergie à haute tension',
            brisDist2: 'L’inondation par les crues de chambres électriques souterraines dans la ville',
            delaiAns: 'Une durée minimale de deux jours complets d’intervention technique',
            delaiDist1: 'Une réalimentation achevée dès la fin de la première soirée de verglas',
            delaiDist2: 'Une intervention limitée à quelques heures le long des autoroutes touchées',
            evidenceBris: ['rupture', 'câbles', 'autoroutes'],
            evidenceDelai: ['quarante-huit', 'heures', 'travail'],
          },
          {
            secteur: 'la région de l’Outaouais',
            epaisseur: 'vingt millimètres',
            bris: 'des chutes d’arbres massives bloquant les chemins de campagne',
            delai: 'quatre à cinq jours pour les secteurs les plus ruraux',
            brisAns: 'Des arbres tombés en grand nombre obstruant les voies rurales',
            brisDist1: 'Le bris de sectionneurs centraux dans les postes de distribution régionaux',
            brisDist2: 'La rupture d’isolateurs en porcelaine sur les lignes électriques secondaires',
            delaiAns: 'Une attente estimée de quatre à cinq journées en milieu rural',
            delaiDist1: 'Un retour de l’électricité garanti dès le lendemain matin dans les campagnes',
            delaiDist2: 'Une coupure limitée à vingt-quatre heures pour l’ensemble des foyers isolés',
            evidenceBris: ['chutes', 'arbres', 'chemins'],
            evidenceDelai: ['quatre', 'cinq', 'jours'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `CRISE CLIMATIQUE - LE VERGLAS PARALYSE LE RÉSEAU ÉNERGÉTIQUE\nUn épisode de pluie verglaçante printanier d’une intensité exceptionnelle a durement frappé ${t.secteur} depuis mercredi soir. L’accumulation d’une couche de verglas atteignant ${t.epaisseur} a fait céder la végétation sous un poids considérable. Les bruits de branches qui cassaient ont résonné toute la nuit dans les quartiers résidentiels. Le réseau de distribution a subi des dommages importants, avec ${t.bris}. Les hôpitaux et les résidences pour personnes âgées ont basculé sans interruption sur leurs génératrices d’urgence. La direction d’Hydro-Québec a appelé la population à la patience lors d’un point de presse, estimant qu’il faudra ${t.delai} pour rebrancher tous les foyers isolés. Les pompiers rappellent de ne jamais utiliser d’appareils de cuisson au propane à l’intérieur pour éviter toute intoxication.`,
          questions: [
            makeQuestion('Quels dommages matériels sévères le réseau de distribution électrique a-t-il subis ?', t.brisAns, t.brisDist1, t.brisDist2, t.evidenceBris),
            makeQuestion('Quel délai de réalimentation Hydro-Québec estime-t-elle pour les foyers touchés ?', t.delaiAns, t.delaiDist1, t.delaiDist2, t.evidenceDelai),
            makeQuestion('Quel avertissement de sécurité essentiel les pompiers réitèrent-ils à la population ?', 'Éviter tout réchaud au gaz dans son logement pour prévenir l’asphyxie', 'Ne jamais brancher d’appareils électriques directement sur les génératrices d’urgence', 'Éviter de sortir dans les quartiers résidentiels en raison de la chute des branches', ['propane', 'intérieur', 'intoxication']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Béluga égaré dans la rivière Saint-Maurice
    Object.assign(
      (rand) => {
        const tuples = [
          {
            coursEau: 'la rivière Saint-Maurice à la hauteur de Shawinigan',
            mammifere: 'un béluga blanc adulte reconnaissable à sa silhouette claire',
            alerte: 'des pêcheurs en chaloupe surpris par son émersion soudaine',
            protocole: 'le Réseau québécois d’urgences pour les mammifères marins avec des vétérinaires spécialisés',
            lieuAns: 'Dans les eaux douces de la rivière Saint-Maurice à Shawinigan',
            lieuDist1: 'Dans les eaux de l’estuaire marin près du point de départ du mammifère',
            lieuDist2: 'Dans le réservoir en amont du grand barrage hydroélectrique de Shawinigan',
            alerteAns: 'Des personnes en chaloupe de pêche ayant constaté sa remontée à la surface',
            alerteDist1: 'Des patrouilleurs nautiques surveillant les abords du barrage hydroélectrique',
            alerteDist2: 'Des vétérinaires spécialisés effectuant une mission de sauvetage dans la région',
            evidenceLieu: ['Saint-Maurice', 'Shawinigan'],
            evidenceAlerte: ['pêcheurs', 'chaloupe', 'émersion'],
          },
          {
            coursEau: 'la rivière Richelieu près du bassin historique de Chambly',
            mammifere: 'un jeune béluga blanc encore dépendant de son alimentation marine',
            alerte: 'des plaisanciers qui ont photographié sa silhouette près des écluses',
            protocole: 'Pêches et Océans Canada avec des biologistes de l’aquarium de Québec',
            lieuAns: 'Sur le cours de la rivière Richelieu aux abords du bassin de Chambly',
            lieuDist1: 'Dans les eaux de l’estuaire maritime au large des zones de pêche côtières',
            lieuDist2: 'En amont des écluses de Chambly au-delà des barrages hydroélectriques',
            alerteAns: 'Des navigateurs de plaisance ayant pris en photo sa forme aux écluses',
            alerteDist1: 'Des patrouilleurs nautiques postés près des barrages pour surveiller le cours d’eau',
            alerteDist2: 'Des biologistes de l’aquarium de Québec en déplacement d’étude le long de la rivière',
            evidenceLieu: ['Richelieu', 'Chambly'],
            evidenceAlerte: ['plaisanciers', 'silhouette', 'écluses'],
          },
          {
            coursEau: 'la rivière des Prairies au nord de l’île de Montréal',
            mammifere: 'un rorqual à museau pointu en quête de bancs de poissons',
            alerte: 'des marcheurs longeant le sentier riverain du parc de la Merci',
            protocole: 'une équipe d’experts fauniques appuyée par des drones de repérage aérien',
            lieuAns: 'Sur les flots de la rivière des Prairies bordant le secteur nord montréalais',
            lieuDist1: 'Dans l’estuaire marin à plusieurs centaines de kilomètres de Montréal',
            lieuDist2: 'En amont des ponts routiers dans le corridor de protection des patrouilleurs',
            alerteAns: 'Des promeneurs sur le sentier du parc de la Merci en bord de rive',
            alerteDist1: 'Des patrouilleurs nautiques déployés d’urgence pour sécuriser le corridor fluvial',
            alerteDist2: 'Des experts fauniques manipulant des drones de repérage aérien au-dessus de l’eau',
            evidenceLieu: ['Prairies', 'Montréal'],
            evidenceAlerte: ['marcheurs', 'riverain', 'Merci'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `FAITS DIVERS SCIENTIFIQUES - UN HABITANT DE L’ARCTIQUE EN PLEIN CŒUR DU QUÉBEC\nLa surprise a été totale ${lorsque(t.mammifere)} a été aperçu nageant paisiblement dans ${t.coursEau}. L’alerte a été transmise aux autorités par ${t.alerte}. Aussitôt informée, une équipe conjointe comprenant ${t.protocole} s’est mobilisée pour évaluer la viabilité d’un sauvetage ou d’un raccompagnement vers l’estuaire. Selon les spécialistes, les barrages hydroélectriques et les ponts routiers représentent des obstacles infranchissables pour le cétacé en amont. Les patrouilleurs nautiques ont établi un corridor de protection strict pour empêcher les curieux de s’approcher en canot ou en motomarine. La présence de ce visiteur rare rappelle la fragilité de nos écosystèmes et l’importance de protéger nos cours d’eau.`,
          questions: [
            makeQuestion('Dans quel cours d’eau inattendu ce mammifère égaré a-t-il été repéré ?', t.lieuAns, t.lieuDist1, t.lieuDist2, t.evidenceLieu),
            makeQuestion('Par quel groupe de témoins l’alerte a-t-elle été transmise aux autorités maritimes ?', t.alerteAns, t.alerteDist1, t.alerteDist2, t.evidenceAlerte),
            makeQuestion('Quel obstacle d’aménagement majeur bloque toute progression du cétacé en amont ?', 'La présence de barrages hydroélectriques et de ponts routiers infranchissables', 'Des écluses ouvertes permettant au cétacé de remonter le cours d’eau', 'Des quais de pêche aménagés le long des rives pour les plaisanciers', ['barrages', 'hydroélectriques', 'ponts']),
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
        const tuples = [
          {
            proprio: 'Gestion Immobilière du Nord',
            nouveau: 'neuf cent quatre-vingts dollars',
            hausse: 'quarante dollars par mois',
            raison: 'la hausse de douze pour cent du compte de taxes foncières municipales',
            travaux: 'le remplacement complet des chauffe-eau de l’immeuble l’automne dernier',
            raisonAns: 'L’alourdissement de douze pour cent des taxes de la ville et les chauffe-eau neufs',
            raisonDist1: 'La baisse du coût moyen de l’électricité dans le secteur résidentiel',
            raisonDist2: 'La réduction de dix pour cent du nombre de logements de l’immeuble',
            hausseAns: 'Une hausse mensuelle de quarante dollars portant le loyer à neuf cent quatre-vingts dollars',
            hausseDist1: 'Une hausse mensuelle de douze dollars fixant le montant total à neuf cent quarante dollars',
            hausseDist2: 'Une majoration de trente dollars portant le loyer à neuf cent soixante-dix dollars',
            evidenceRaison: ['taxes', 'foncières', 'chauffe-eau'],
            evidenceHausse: ['neuf', 'quatre-vingts', 'quarante'],
          },
          {
            proprio: 'Immeubles Résidentiels Tremblay',
            nouveau: 'mille quarante dollars',
            hausse: 'quarante-cinq dollars par mois',
            raison: 'l’augmentation marquée de la facture d’assurance bâtiment du complexe',
            travaux: 'la réfection de la brique de façade et le calfeutrage complet de toutes les fenêtres',
            raisonAns: 'La flambée des primes d’assurance de l’immeuble et la réfection de la maçonnerie',
            raisonDist1: 'La baisse des frais de chauffage collectif observée depuis deux ans',
            raisonDist2: 'La réduction de dix pour cent du nombre de logements de l’immeuble',
            hausseAns: 'Une majoration de quarante-cinq dollars pour un loyer fixé à mille quarante dollars',
            hausseDist1: 'Une augmentation de vingt dollars portant le loyer mensuel à mille vingt dollars',
            hausseDist2: 'Une majoration de cinquante dollars pour un montant projeté de mille soixante dollars',
            evidenceRaison: ['assurance', 'bâtiment', 'brique'],
            evidenceHausse: ['mille', 'quarante', 'quarante-cinq'],
          },
          {
            proprio: 'Société Immobilière Lavoie',
            nouveau: 'neuf cent cinquante dollars',
            hausse: 'trente-cinq dollars par mois',
            raison: 'la hausse des coûts contractuels de déneigement et d’entretien extérieur',
            travaux: 'l’installation d’un nouveau système d’interphone sécurisé avec caméra couleur',
            raisonAns: 'Les coûts accrus de déneigement et l’installation d’un interphone avec caméra',
            raisonDist1: 'La baisse des coûts de l’électricité et la fermeture du stationnement visiteurs',
            raisonDist2: 'La réduction de dix pour cent du nombre de logements de l’immeuble',
            hausseAns: 'Une augmentation de trente-cinq dollars menant le loyer à neuf cent cinquante dollars',
            hausseDist1: 'Une majoration mensuelle de vingt dollars portant le coût à neuf cent trente dollars',
            hausseDist2: 'Une augmentation de quarante dollars fixant le loyer final à neuf cent soixante dollars',
            evidenceRaison: ['déneigement', 'entretien', 'interphone'],
            evidenceHausse: ['neuf', 'cinquante', 'trente-cinq'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `AVIS D’AUGMENTATION DE LOYER - RENOUVELLEMENT DU BAIL\nDe : ${t.proprio}\nÀ : Locataire du logement 4\nMadame, Monsieur,\nConformément aux formulaires officiels du Tribunal administratif du logement, nous vous avisons qu’à compter du premier juillet, votre loyer mensuel sera de ${t.nouveau}, soit une hausse de ${t.hausse}. Cette révision découle de deux facteurs majeurs : d’une part, ${t.raison}, et d’autre part, ${t.travaux}. Ces investissements améliorent la sécurité et le confort de votre immeuble. Conformément à la loi, vous disposez d’un délai de trente jours suivant la réception de cet avis pour nous signifier par écrit votre acceptation ou votre refus. À défaut de réponse dans ce délai, l’augmentation sera réputée acceptée. Nous vous remercions pour votre confiance continue.`,
          questions: [
            makeQuestion('Quels facteurs objectifs et vérifiables motivent la révision du montant du loyer ?', t.raisonAns, t.raisonDist1, t.raisonDist2, t.evidenceRaison),
            makeQuestion('Quel est le montant exact de la hausse mensuelle et le loyer projeté ?', t.hausseAns, t.hausseDist1, t.hausseDist2, t.evidenceHausse),
            makeQuestion('De quel délai légal le locataire dispose-t-il pour faire connaître son désaccord par écrit ?', 'Une période légale de trente jours à compter de la réception de la lettre', 'Un délai accordé jusqu’au premier juillet suivant la date d’émission de l’avis', 'Une période maximale de douze jours ouvrables suivant l’envoi du formulaire', ['délai', 'trente', 'jours']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Lettre du propriétaire avec grille de calcul du TAL
    Object.assign(
      (rand) => {
        const tuples = [
          {
            proprio: 'Monsieur Paul Gagnon',
            loyer: 'mille cent vingt dollars',
            taux: 'trois virgule huit pour cent d’augmentation',
            investissement: 'la pose d’une nouvelle toiture blanche écoénergétique',
            investAns: 'La pose d’une toiture blanche écoénergétique à haut rendement',
            investDist1: 'L’audit énergétique annuel exigé pour le renouvellement des assurances',
            investDist2: 'Le remplacement intégral des serrures pour sécuriser les espaces communs',
            tauxAns: 'Une progression de trois virgule huit pour cent fixant le coût à mille cent vingt dollars',
            tauxDist1: 'Une hausse de deux virgule cinq pour cent portant le loyer à mille quatre-vingts dollars',
            tauxDist2: 'Une progression de quatre virgule deux pour cent fixant le montant à mille cent dix dollars',
            evidenceInvest: ['toiture', 'blanche', 'écoénergétique'],
            evidenceTaux: ['mille', 'cent', 'vingt', 'trois', 'huit'],
          },
          {
            proprio: 'Monsieur Marc Simard',
            loyer: 'neuf cent quatre-vingt-dix dollars',
            taux: 'quatre virgule deux pour cent de majoration',
            investissement: 'le remplacement de la vieille chaudière au gaz par un système à thermopompe',
            investAns: 'L’abandon du vieux chauffage au gaz au profit d’une thermopompe moderne',
            investDist1: 'La révision annuelle des contrats d’assurance multirisque du bâtiment',
            investDist2: 'La mise aux normes des conduits de ventilation dans les espaces partagés',
            tauxAns: 'Une majoration de quatre virgule deux pour cent pour un loyer révisé de neuf cent quatre-vingt-dix',
            tauxDist1: 'Une hausse de trois virgule deux pour cent portant le loyer mensuel à neuf cent soixante dollars',
            tauxDist2: 'Une majoration de cinq pour cent aboutissant à un loyer révisé de neuf cent quatre-vingt-cinq dollars',
            evidenceInvest: ['chaudière', 'gaz', 'thermopompe'],
            evidenceTaux: ['neuf', 'quatre-vingt-dix', 'quatre', 'deux'],
          },
          {
            proprio: 'Monsieur Denis Bouchard',
            loyer: 'mille soixante-quinze dollars',
            taux: 'trois virgule cinq pour cent de hausse',
            investissement: 'la réfection de l’ensemble des escaliers extérieurs et rampes de sécurité',
            investAns: 'La remise à neuf des escaliers extérieurs et le renforcement des rampes',
            investDist1: 'La renégociation complète de la police d’assurance collective du bâtiment',
            investDist2: 'L’inspection préventive des portes d’accès pour sécuriser l’espace commun',
            tauxAns: 'Une hausse de trois virgule cinq pour cent menant le loyer à mille soixante-quinze dollars',
            tauxDist1: 'Une progression de deux virgule huit pour cent fixant le loyer à mille cinquante dollars',
            tauxDist2: 'Une hausse de quatre virgule deux pour cent menant le loyer mensuel à mille soixante-dix dollars',
            evidenceInvest: ['escaliers', 'extérieurs', 'rampes'],
            evidenceTaux: ['mille', 'soixante-quinze', 'trois', 'cinq'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `LETTRE DU PROPRIÉTAIRE - CALCUL DU LOYER\nChère locataire,\nComme chaque printemps, je vous transmets les conditions de renouvellement de votre bail. En appliquant la grille officielle du Tribunal administratif du logement, votre loyer mensuel passera à ${t.loyer}, soit ${t.taux}. Cette hausse s’explique par des travaux indispensables sur le bâtiment, notamment ${t.investissement}, ainsi que par l’augmentation marquée des assurances de l’immeuble. Je privilégie toujours l’entretien préventif pour vous offrir un espace sain et sécuritaire. Vous trouverez ci-joint la copie de la feuille de calcul officielle du tribunal détaillant chaque montant. N’hésitez pas à me contacter si vous souhaitez en discuter calmement de vive voix.`,
          questions: [
            makeQuestion('Sur quel outil de référence légal le bailleur base-t-il sa proposition de hausse ?', 'La grille et la feuille de calcul officielles du Tribunal administratif du logement', 'Le règlement municipal sur la salubrité des logements affiché dans le hall', 'Le guide pratique de la Régie du bâtiment sur les travaux de rénovation', ['grille', 'Tribunal', 'calcul']),
            makeQuestion('Quel investissement de rénovation majeur sur le bâtiment justifie ce calcul ?', t.investAns, t.investDist1, t.investDist2, t.evidenceInvest),
            makeQuestion('Quel pourcentage d’ajustement et quel loyer mensuel sont formellement proposés ?', t.tauxAns, t.tauxDist1, t.tauxDist2, t.evidenceTaux),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article magazine - Choix de l'agriculture urbaine sur son toit
    Object.assign(
      (rand) => {
        const tuples = [
          {
            personne: 'Guillaume Lemay',
            quartier: 'dans le quartier Mile-End à Montréal',
            potager: 'un potager sur toit comptant une centaine de bacs en feutre géotextile',
            benefice: 'récolter des tomates ancestrales, des fines herbes fraîches et des courgettes',
            potagerAns: 'Un potager aménagé sur la toiture avec une centaine de contenants textiles',
            potagerDist1: 'Une pelouse traditionnelle nécessitant un arrosage régulier par les voisins',
            potagerDist2: 'Un point de distribution de légumes d’épicerie géré au sommet de l’immeuble',
            beneficeAns: 'Cueillir des tomates du patrimoine, des fines herbes et des courgettes fraîches',
            beneficeDist1: 'Acheter en épicerie des aliments importés à moindre coût pour ses voisins',
            beneficeDist2: 'Éviter tout arrosage régulier grâce à des produits maraîchers du commerce',
            evidencePotager: ['toit', 'bacs', 'feutre'],
            evidenceBenefice: ['tomates', 'herbes', 'courgettes'],
          },
          {
            personne: 'Mathieu Roy',
            quartier: 'dans le quartier Saint-Roch à Québec',
            potager: 'un jardin suspendu aménagé avec des bacs surélevés en cèdre durable',
            benefice: 'produire des légumes frais sans engrais chimiques pour approvisionner trois familles',
            potagerAns: 'Un aménagement suspendu composé de grands bacs en bois de cèdre',
            potagerDist1: 'Une pelouse surélevée partagée entre les trois familles de l’immeuble',
            potagerDist2: 'Un espace de stockage de légumes d’épicerie aménagé au dernier étage',
            beneficeAns: 'Produire des légumes sans engrais chimiques pour nourrir trois familles voisines',
            beneficeDist1: 'Sélectionner des légumes d’épicerie suremballés pour les redistribuer aux voisins',
            beneficeDist2: 'Réduire les trajets vers les marchés grâce à des produits maraîchers importés',
            evidencePotager: ['jardin', 'suspendu', 'cèdre'],
            evidenceBenefice: ['légumes', 'engrais', 'familles'],
          },
          {
            personne: 'Sébastien Côté',
            quartier: 'dans le secteur convivial du Vieux-Rosemont',
            potager: 'un écosystème de toiture verte combinant bacs de permaculture et composteur',
            benefice: 'consommer des aliments cueillis à maturité sans emballage jetable de plastique',
            potagerAns: 'Un toit végétalisé intégrant la permaculture et un composteur',
            potagerDist1: 'Une pelouse verte entretenue sans composteur par l’ensemble des voisins',
            potagerDist2: 'Un comptoir de distribution de légumes sous emballage plastique recyclable',
            beneficeAns: 'Consommer des aliments cueillis mûrs sans emballage de plastique jetable',
            beneficeDist1: 'Acheter en grande quantité des légumes d’épicerie emballés sous plastique',
            beneficeDist2: 'Fournir l’épicerie de quartier en produits récoltés avant leur maturité',
            evidencePotager: ['toiture', 'verte', 'composteur'],
            evidenceBenefice: ['cueillis', 'maturité', 'emballage'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `MAGAZINE ÉCO-CITOYEN - LE VIRAGE VERT D’UN CITADIN PASSIONNÉ\nInstallé ${t.quartier}, ${t.personne} a troqué sa pelouse de banlieue contre ${t.potager}. Dans une entrevue, il nous explique les raisons qui l’ont poussé vers l’agriculture urbaine. « J’en avais assez d’acheter en épicerie des légumes suremballés ayant parcouru des milliers de kilomètres sans goût, confie-t-il. Je voulais reprendre le contrôle de ce que je mange. » Aujourd’hui, son aménagement lui permet de ${t.benefice}. Au-delà des récoltes, cette pratique a transformé sa vie de quartier : ses voisins montent régulièrement l’aider à arroser en échange de légumes frais. « Cela crée des liens formidables au cœur même de la ville », conclut-il avec le sourire.`,
          questions: [
            makeQuestion('Quelle installation écologique cet habitant a-t-il créée au sommet de son immeuble ?', t.potagerAns, t.potagerDist1, t.potagerDist2, t.evidencePotager),
            makeQuestion('Quel avantage alimentaire direct son potager urbain lui permet-il d’obtenir ?', t.beneficeAns, t.beneficeDist1, t.beneficeDist2, t.evidenceBenefice),
            makeQuestion('Quelle retombée humaine et communautaire inattendue le projet a-t-il favorisée ?', 'Le tissage de liens d’entraide et de partage chaleureux avec les voisins du secteur', 'L’obligation pour chaque résident du secteur de remplacer sa propre pelouse', 'L’organisation d’achats collectifs de légumes directement auprès des épiceries', ['liens', 'voisins', 'arroser']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Entrevue magazine - Potager nourricier familial en façade
    Object.assign(
      (rand) => {
        const tuples = [
          {
            mere: 'Isabelle Martel',
            ville: 'à Longueuil',
            superficie: 'une plate-bande nourricière de deux cents mètres carrés en façade',
            impact: 'une économie d’au moins deux cents dollars par mois sur notre facture d’épicerie estivale',
            superficieAns: 'Une aire potagère de deux cents mètres carrés aménagée devant la résidence',
            superficieDist1: 'Une pelouse verte traditionnelle nécessitant une tonte hebdomadaire en façade',
            superficieDist2: 'Un point d’eau collectif destiné à l’arrosage des pelouses de tout le secteur',
            impactAns: 'Une baisse mensuelle de deux cents dollars minimum sur les emplettes d’été',
            impactDist1: 'La suppression intégrale de la facture d’eau potable durant toute l’année',
            impactDist2: 'Un revenu régulier tiré de la revente de légumes aux résidents du quartier',
            evidenceSuperficie: ['plate-bande', 'deux', 'cents', 'mètres'],
            evidenceImpact: ['économie', 'deux', 'cents', 'épicerie'],
          },
          {
            mere: 'Caroline Bélanger',
            ville: 'à Sherbrooke',
            superficie: 'un aménagement en permaculture remplaçant entièrement la pelouse devant la maison',
            impact: 'une baisse de près de quarante pour cent de nos dépenses en fruits et légumes frais',
            superficieAns: 'Un jardin en permaculture remplaçant toute la pelouse devant la maison',
            superficieDist1: 'Une pelouse verte uniforme réservée aux jeux des enfants du quartier',
            superficieDist2: 'Un espace gazonné traditionnel exigeant un arrosage soutenu en été',
            impactAns: 'Une coupure avoisinant quarante pour cent dans l’achat de fruits et légumes',
            impactDist1: 'La réduction de moitié des taxes municipales accordée pour l’aménagement',
            impactDist2: 'Un gain financier tiré de cours de jardinage donnés aux voisins du secteur',
            evidenceSuperficie: ['permaculture', 'pelouse', 'devant'],
            evidenceImpact: ['quarante', 'pour', 'cent', 'légumes'],
          },
          {
            mere: 'Stéphanie Gagnon',
            ville: 'à Trois-Rivières',
            superficie: 'une série de bacs surélevés en bois bordant harmonieusement l’allée d’entrée',
            impact: 'une réduction appréciable de plusieurs centaines de dollars sur le budget alimentaire estival',
            superficieAns: 'Un alignement de bacs surélevés en bois longeant le chemin d’accès',
            superficieDist1: 'Une large pelouse verte entretenue le long de l’allée principale',
            superficieDist2: 'Un gazon ornemental arrosé en continu pour embellir la cour avant',
            impactAns: 'Un allègement de plusieurs centaines de dollars pour les repas de la belle saison',
            impactDist1: 'L’élimination complète des dépenses d’eau municipale tout au long de l’année',
            impactDist2: 'La perception de redevances versées par les voisins en échange de conseils',
            evidenceSuperficie: ['bacs', 'surélevés', 'allée'],
            evidenceImpact: ['réduction', 'centaines', 'alimentaire'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `CHRONIQUE MAISON DURABLE - QUAND LE GAZON DEVIENT POTAGER\nIl y a trois ans, ${t.mere}, résidente ${t.ville}, a transformé sa cour avant en remplaçant sa pelouse verte par ${t.superficie}. « Arroser et tondre un gazon gourmand en eau me semblait un non-sens écologique », explique-t-elle. Les récoltes ont rapidement comblé toute la famille tout au long de l’été. L’impact sur les finances familiales est tangible : ${t.impact}, tout en éveillant les enfants au jardinage. De plus, les voisins s’arrêtent quotidiennement pour admirer les plants et échanger des conseils horticoles. Son initiative inspire désormais d’autres citoyens du secteur à cultiver leurs propres aliments.`,
          questions: [
            makeQuestion('Quel aménagement extérieur écologique cette résidente a-t-elle créé devant chez elle ?', t.superficieAns, t.superficieDist1, t.superficieDist2, t.evidenceSuperficie),
            makeQuestion('Quel impact financier positif et direct cette pratique procure-t-elle au ménage ?', t.impactAns, t.impactDist1, t.impactDist2, t.evidenceImpact),
            makeQuestion('Quelle motivation environnementale a initialement poussé la résidente à ce changement ?', 'Le refus d’entretenir un gazon traditionnel très gourmand en eau potable', 'Le désir d’offrir un espace d’apprentissage du jardinage aux enfants du quartier', 'La recherche d’économies immédiates sur le coût d’achat de plants horticoles', ['gazon', 'gourmand', 'eau']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Lettre du propriétaire motivant la hausse par l'énergie
    Object.assign(
      (rand) => {
        const tuples = [
          {
            proprio: 'Immeubles de l’Estrie',
            loyer_actuel: 'huit cent quatre-vingts dollars',
            loyer_futur: 'neuf cent vingt dollars',
            facteur: 'l’augmentation de quinze pour cent des coûts de chauffage collectif au gaz',
            travaux_immeuble: 'l’isolation thermique du toit et le remplacement des portes coupe-froid',
            depenseAns: 'La hausse de quinze pour cent du chauffage au gaz et l’isolation thermique du toit',
            depenseDist1: 'Les frais de gestion d’un dossier formel ouvert auprès du Tribunal du logement',
            depenseDist2: 'La régularisation des charges communes suite au renouvellement automatique du bail',
            loyerAns: 'Un loyer mensuel passant de huit cent quatre-vingts à neuf cent vingt dollars',
            loyerDist1: 'Un loyer passant de huit cent quarante à huit cent quatre-vingts dollars par mois',
            loyerDist2: 'Un montant révisé passant de huit cent quatre-vingts à neuf cent quarante dollars',
            evidenceDepense: ['chauffage', 'gaz', 'isolation', 'toit'],
            evidenceLoyer: ['huit', 'quatre-vingts', 'neuf', 'vingt'],
          },
          {
            proprio: 'Gestion Résidentielle Chaudière',
            loyer_actuel: 'neuf cent dix dollars',
            loyer_futur: 'neuf cent cinquante dollars',
            facteur: 'la hausse des primes d’assurance multirisque et des frais d’électricité des aires communes',
            travaux_immeuble: 'la pose de fenêtres à triple vitrage pour réduire les pertes de chaleur',
            depenseAns: 'La hausse des assurances et de l’électricité commune et les fenêtres à triple vitrage',
            depenseDist1: 'Les frais d’ouverture de dossier réclamés pour le renouvellement annuel du bail',
            depenseDist2: 'L’application de pénalités imposées par le Tribunal du logement pour retard d’avis',
            loyerAns: 'Un montant de loyer révisé passant de neuf cent dix à neuf cent cinquante dollars',
            loyerDist1: 'Un loyer mensuel passant de huit cent quatre-vingt-dix à neuf cent trente dollars',
            loyerDist2: 'Un montant ajusté passant de neuf cent dix à neuf cent soixante-dix dollars par mois',
            evidenceDepense: ['assurance', 'électricité', 'triple', 'vitrage'],
            evidenceLoyer: ['neuf', 'dix', 'neuf', 'cinquante'],
          },
          {
            proprio: 'Habitations Mauricie',
            loyer_actuel: 'huit cent quarante dollars',
            loyer_futur: 'huit cent soixante-quinze dollars',
            facteur: 'les augmentations des tarifs municipaux de traitement d’eau et de collecte des résidus',
            travaux_immeuble: 'le renouvellement préventif de la plomberie et des valves de sécurité principales',
            depenseAns: 'La hausse des tarifs municipaux d’eau et la rénovation préventive de la plomberie',
            depenseDist1: 'Le coût de traitement des formulaires d’avis soumis au Tribunal du logement',
            depenseDist2: 'Les frais de reconduction administrative appliqués lors du renouvellement de bail',
            loyerAns: 'Un bail révisé s’établissant à huit cent soixante-quinze au lieu du montant de huit cent quarante',
            loyerDist1: 'Un loyer révisé passant de huit cent vingt à huit cent soixante dollars à compter de juillet',
            loyerDist2: 'Un montant passant de huit cent quarante à huit cent quatre-vingt-dix dollars par mois',
            evidenceDepense: ['traitement', 'eau', 'plomberie', 'valves'],
            evidenceLoyer: ['huit', 'quarante', 'huit', 'soixante-quinze'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `COMMUNICATION DU LOCATEUR - PROPOSITION DE RENOUVELLEMENT\nChère locataire, cher locataire,\nNous vous soumettons notre proposition de renouvellement de bail pour l’année prochaine. Votre loyer passera de ${t.loyer_actuel} à ${t.loyer_futur} à compter du premier juillet. Cette hausse découle des critères du Tribunal administratif du logement et s’explique par deux dépenses incontournables : ${t.facteur}, ainsi que ${t.travaux_immeuble}. Ces rénovations assurent un confort durable à votre logement. Si vous acceptez ces conditions, le bail se renouvellera automatiquement. En cas de refus, veuillez nous aviser par écrit dans les trente jours. Nous vous remercions pour votre confiance continue et vous souhaitons un excellent été.`,
          questions: [
            makeQuestion('Quelles dépenses d’exploitation incontournables justifient ce calcul de renouvellement ?', t.depenseAns, t.depenseDist1, t.depenseDist2, t.evidenceDepense),
            makeQuestion('Quel ajustement précis de loyer mensuel est soumis à l’approbation du locataire ?', t.loyerAns, t.loyerDist1, t.loyerDist2, t.evidenceLoyer),
            makeQuestion('Quelle démarche s’impose au locataire qui accepte les termes de la proposition ?', 'Le bail se renouvelle automatiquement sans démarche supplémentaire', 'Envoyer une confirmation écrite par la poste dans les trente jours', 'Déposer le formulaire d’accord auprès du Tribunal du logement', ['bail', 'renouvellera', 'automatiquement']),
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
        const tuples = [
          {
            boutique: 'la boutique de mode Simons',
            delai: 'trente jours suivant la date de réception du colis',
            condition: 'l’article doit être non porté, non lavé et conserver toutes ses étiquettes de vente d’origine',
            point: 'dans n’importe quel comptoir postal agréé de Postes Canada',
            delaiAns: 'Un intervalle de trente jours au maximum après livraison du colis',
            delaiDist1: 'Un délai strict de cinq jours ouvrables suivant la réception du paquet',
            delaiDist2: 'Une période de quarante-huit heures après la commande passée en ligne',
            conditionAns: 'L’article doit rester propre, jamais lavé ni porté, avec étiquetage intact',
            conditionDist1: 'L’article doit présenter des traces d’usage visibles et un emballage abîmé',
            conditionDist2: 'L’article doit présenter quelques marques d’usure et des plis bien visibles',
            pointAns: 'Auprès d’un point de service de Postes Canada avec l’étiquette fournie',
            pointDist1: 'Directement au centre de tri logistique de l’entrepôt principal de distribution',
            pointDist2: 'Au comptoir de paiement affilié à l’institution bancaire émettrice de la carte',
            evidenceDelai: ['trente', 'jours', 'réception'],
            evidenceCondition: ['porté', 'lavé', 'étiquettes'],
            evidencePoint: ['comptoir', 'postal', 'Postes', 'Canada'],
          },
          {
            boutique: 'la plateforme de vêtements Chlorophylle',
            delai: 'quarante-cinq jours suivant la livraison à domicile',
            condition: 'le vêtement doit être retourné intact dans son emballage d’origine avec la facture d’achat',
            point: 'au bureau de messagerie de votre quartier indiqué sur le bordereau',
            delaiAns: 'Une période de quarante-cinq jours accordée à compter de la livraison',
            delaiDist1: 'Un délai maximal de cinq jours ouvrables après l’enregistrement du retour',
            delaiDist2: 'Une période limitée à quatorze jours civils suivant la commande en ligne',
            conditionAns: 'La pièce de vêtement doit demeurer intacte dans son carton avec la facture',
            conditionDist1: 'Le vêtement doit présenter des traces d’usage visibles et être sorti de son sac',
            conditionDist2: 'La pièce doit être déchirée et sans étiquette, prête à être essayée',
            pointAns: 'Au bureau de messagerie du quartier précisé sur le bordereau d’envoi',
            pointDist1: 'Directement aux portes de chargement de l’entrepôt central réservé aux inspections',
            pointDist2: 'Au guichet principal de l’agence bancaire liée au mode de remboursement choisi',
            evidenceDelai: ['quarante-cinq', 'jours', 'livraison'],
            evidenceCondition: ['intact', 'emballage', 'facture'],
            evidencePoint: ['bureau', 'messagerie', 'bordereau'],
          },
          {
            boutique: 'la boutique montréalaise Frank And Oak',
            delai: 'vingt et un jours civils après confirmation de commande',
            condition: 'l’habit doit être dans un état impeccable, exempt de taches et avec son étiquette intacte',
            point: 'dans un point de dépôt sécurisé affilié à notre réseau de distribution',
            delaiAns: 'Un intervalle de trois semaines complètes suivant la confirmation de commande',
            delaiDist1: 'Un délai maximal de cinq jours ouvrables suivant l’enregistrement officiel de l’achat',
            delaiDist2: 'Une période limite de dix jours consécutifs suivant l’expédition initiale du colis',
            conditionAns: 'La tenue doit demeurer impeccable, sans la moindre tache et avec étiquette',
            conditionDist1: 'L’habit doit présenter des salissures visibles et une doublure déchirée',
            conditionDist2: 'La tenue doit présenter une usure marquée et des plis durables au tissu',
            pointAns: 'Auprès d’un comptoir de dépôt sécurisé lié au réseau du marchand',
            pointDist1: 'Au quai de déchargement de l’entrepôt principal avant son inspection',
            pointDist2: 'Dans la boîte postale de l’institution bancaire émettrice du paiement',
            evidenceDelai: ['vingt', 'jours', 'confirmation'],
            evidenceCondition: ['impeccable', 'taches', 'étiquette'],
            evidencePoint: ['dépôt', 'sécurisé', 'affilié'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `POLITIQUE DE RETOUR ET REMBOURSEMENT EN LIGNE\nPour retourner un vêtement commandé chez ${t.boutique}, suivez ces directives simples. Connectez-vous à votre compte client sous « Historique des commandes » et sélectionnez « Demande de retour ». Vous disposez d’un délai maximal de ${t.delai}. Précisez le motif du renvoi puis assurez-vous que ${t.condition}. Ensuite, imprimez l’étiquette de retour préaffranchie, collez-la sur le colis d’origine et déposez le paquet ${t.point}. Dès réception et inspection à notre entrepôt, le remboursement sera versé sur votre carte bancaire sous cinq jours ouvrables.`,
          questions: [
            makeQuestion('Quel délai maximal le client doit-il respecter pour enregistrer sa demande de retour ?', t.delaiAns, t.delaiDist1, t.delaiDist2, t.evidenceDelai),
            makeQuestion('Quelle exigence stricte relative à l’état de l’article retourné est imposée ?', t.conditionAns, t.conditionDist1, t.conditionDist2, t.evidenceCondition),
            makeQuestion('Où le consommateur doit-il déposer son colis muni de l’étiquette préaffranchie ?', t.pointAns, t.pointDist1, t.pointDist2, t.evidencePoint),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure échange ou retour chaussures en ligne
    Object.assign(
      (rand) => {
        const tuples = [
          {
            magasin: 'la boutique de souliers Yellow',
            delai: 'dans les trente jours suivant la commande en ligne',
            exigence: 'les chaussures doivent être retournées dans leur boîte d’origine avec des semelles propres',
            mode: 'un crédit instantané au compte ou un remboursement sur le mode de paiement original',
            delaiAns: 'Une période de trente jours après avoir passé la commande sur le Web',
            delaiDist1: 'Un délai strict de dix jours civils après le passage officiel de la commande',
            delaiDist2: 'Une période limite de quarante-huit heures après la remise du colis au transporteur',
            exigenceAns: 'Les souliers doivent retourner dans l’emballage initial avec des semelles nettes',
            exigenceDist1: 'Les souliers doivent présenter des talons usés et une tige fendue',
            exigenceDist2: 'Les chaussures doivent porter des traces de boue séchée sur toute la tige',
            modeAns: 'Un avoir immédiat au profil ou la rétrocession sur la carte de paiement initiale',
            modeDist1: 'Un rabais forfaitaire de cinquante pour cent à faire valoir sur un prochain achat',
            modeDist2: 'Un bon d’achat garanti valide exclusivement pour les articles soldés en vente finale',
            evidenceDelai: ['trente', 'jours', 'commande'],
            evidenceExigence: ['boîte', 'origine', 'semelles', 'propres'],
            evidenceMode: ['crédit', 'remboursement', 'paiement'],
          },
          {
            magasin: 'la boutique d’hiver Kanuk',
            delai: 'dans les vingt et un jours suivant la réception à domicile',
            exigence: 'les bottes ne doivent jamais avoir servi à l’extérieur et doivent garder leurs étiquettes',
            mode: 'un remboursement complet déduction faite d’un frais fixe de retour de cinq dollars',
            delaiAns: 'Une fenêtre de vingt et un jours calculée dès la livraison du paquet',
            delaiDist1: 'Un délai maximal de sept jours ouvrables à compter de la réception initiale',
            delaiDist2: 'Une période limite de quarante-huit heures suivant l’arrivée du transporteur',
            exigenceAns: 'Les bottes doivent être indemnes d’usage extérieur et munies de leurs étiquettes',
            exigenceDist1: 'Les bottes doivent présenter des traces de boue séchée et des coutures ouvertes',
            exigenceDist2: 'Les bottes doivent présenter une semelle usée et des traces de sel sur la tige',
            modeAns: 'La restitution intégrale des sommes moins une retenue forfaitaire de cinq dollars',
            modeDist1: 'Un remboursement partiel direct assorti d’un rabais de cinquante pour cent en boutique',
            modeDist2: 'La gratuité totale et immédiate d’un nouvel article choisi parmi les fins de série en solde',
            evidenceDelai: ['vingt', 'jours', 'réception'],
            evidenceExigence: ['servi', 'extérieur', 'étiquettes'],
            evidenceMode: ['remboursement', 'frais', 'cinq', 'dollars'],
          },
          {
            magasin: 'la maison québécoise Saute-Mouton',
            delai: 'dans les trente jours ouvrables après livraison',
            exigence: 'les semelles intérieures et les lacets doivent être parfaitement complets et sans odeur',
            mode: 'un échange direct de pointure sans frais de livraison supplémentaires',
            delaiAns: 'Dans les trente jours ouvrables suivant la livraison du produit',
            delaiDist1: 'Dans les dix jours ouvrables suivant la passation initiale de la commande',
            delaiDist2: 'Dans les quarante-huit heures suivant la remise officielle du colis chez soi',
            exigenceAns: 'La présence intacte des lacets et des semelles de propreté, sans odeur',
            exigenceDist1: 'Les tiges doivent être déformées et couvertes de sable, avec une odeur forte',
            exigenceDist2: 'L’intérieur doit être humide, couvert de boue séchée et d’une forte odeur',
            modeAns: 'Le remplacement immédiat de la grandeur sans frais de renvoi additionnels',
            modeDist1: 'Un crédit d’achat réduit de moitié en raison des règles de la vente finale',
            modeDist2: 'Un remboursement partiel déduit des coûts d’expédition payés au transporteur',
            evidenceDelai: ['trente', 'jours', 'ouvrables'],
            evidenceExigence: ['semelles', 'lacets', 'complets'],
            evidenceMode: ['échange', 'pointure', 'frais'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `SERVICE CLIENTÈLE - RETOUR ET ÉCHANGE DE CHAUSSURES\nVous avez commandé une paire de chaussures chez ${t.magasin} et la pointure ne convient pas ? Voici la marche à suivre pour effectuer votre retour. D’abord, remplissez le formulaire en ligne sous l’onglet « Aide et soutien ». Cette démarche doit être entreprise ${t.delai}. Ensuite, emballez le produit en respectant notre consigne essentielle : ${t.exigence}. Insérez le bon d’expédition et remettez le paquet au transporteur. Après vérification par notre service de contrôle, vous recevrez ${t.mode}. Les articles achetés à cinquante pour cent de rabais et plus sont en vente finale, sans échange ni remboursement.`,
          questions: [
            makeQuestion('Quel délai s’applique pour entreprendre formellement la démarche de retour ?', t.delaiAns, t.delaiDist1, t.delaiDist2, t.evidenceDelai),
            makeQuestion('Quelle règle matérielle stricte relative à l’état des chaussures doit être respectée ?', t.exigenceAns, t.exigenceDist1, t.exigenceDist2, t.evidenceExigence),
            makeQuestion('Quelle modalité de compensation ou d’échange le client reçoit-il après vérification ?', t.modeAns, t.modeDist1, t.modeDist2, t.evidenceMode),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure RQAP - Demande de prestations parentales
    Object.assign(
      (rand) => {
        const tuples = [
          {
            choix: 'le choix déterminant entre le régime de base plus étalé et le régime particulier plus généreux',
            piece: 'votre relevé d’emploi officiel transmis électroniquement par votre employeur',
            pieceVerbe: 'est bien versé',
            delai: 'dans les dix jours suivant la confirmation de votre dossier complet',
            choixAns: 'L’arbitrage entre la formule de base allongée et la formule spéciale majorée',
            choixDist1: 'L’obligation de déclarer à l’avance l’intégralité des revenus de travail futurs',
            choixDist2: 'Le choix exclusif du mode de versement par chèque postal ou par dépôt direct',
            pieceAns: 'L’attestation d’emploi officielle acheminée par voie numérique par l’employeur',
            pieceDist1: 'La copie papier du contrat de travail visée par le service des ressources humaines',
            pieceDist2: 'Le relevé hebdomadaire des heures effectuées durant les semaines de congé parental',
            delaiAns: 'Au cours des dix journées consécutives à la validation finale du dossier',
            delaiDist1: 'Dans les quarante-huit heures suivant la connexion au portail officiel ClicSÉQUR',
            delaiDist2: 'Au terme des trente premiers jours suivant l’arrivée déclarée du nouveau-né',
            evidenceChoix: ['régime', 'base', 'particulier'],
            evidencePiece: ['relevé', 'emploi', 'employeur'],
            evidenceDelai: ['dix', 'jours', 'dossier'],
          },
          {
            choix: 'la décision concertée entre les deux parents concernant le partage des semaines de congé',
            piece: 'votre numéro d’assurance sociale et la confirmation de naissance de l’état civil',
            pieceVerbe: 'sont bien versés',
            delai: 'dans un délai moyen de quatorze jours ouvrables après réception',
            choixAns: 'L’entente mutuelle des parents quant à la répartition des semaines de congé',
            choixDist1: 'La sélection définitive du compte bancaire devant recevoir l’ensemble des fonds',
            choixDist2: 'L’engagement de ne percevoir aucun autre salaire durant l’année de prestations',
            pieceAns: 'Le numéro d’assurance sociale et le certificat de naissance officiel de l’enfant',
            pieceDist1: 'L’attestation officielle de salaire signée par l’employeur pour chaque semaine travaillée',
            pieceDist2: 'Le formulaire complet de confirmation d’accès sécurisé délivré par le portail officiel',
            delaiAns: 'Une période d’environ deux semaines ouvrables à compter de la réception',
            delaiDist1: 'Dans les trois jours ouvrables suivant l’enregistrement de l’acte à l’état civil',
            delaiDist2: 'Au terme d’un délai de trente jours civils après la confirmation du dossier',
            evidenceChoix: ['partage', 'semaines', 'congé'],
            evidencePiece: ['assurance', 'sociale', 'naissance'],
            evidenceDelai: ['quatorze', 'jours', 'ouvrables'],
          },
          {
            choix: 'l’option de recevoir des versements réguliers étalés sur douze ou dix-huit mois',
            piece: 'vos coordonnées bancaires complètes permettant d’activer le dépôt direct',
            pieceVerbe: 'sont bien versées',
            delai: 'sous deux semaines à compter de la transmission électronique finale',
            choixAns: 'La modalité d’étalement des versements périodiques sur un an ou un an et demi',
            choixDist1: 'L’autorisation permanente d’un prélèvement direct sur le salaire professionnel',
            choixDist2: 'La renonciation formelle à toute révision du dossier en cas de changement de revenu',
            pieceAns: 'Les renseignements bancaires complets nécessaires pour activer le dépôt direct',
            pieceDist1: 'L’historique complet et détaillé des déclarations de revenus transmises par l’employeur',
            pieceDist2: 'La grille officielle détaillée des pourcentages de remplacement de salaire du ménage',
            delaiAns: 'Dans un délai de quatorze jours après l’envoi numérique définitif',
            delaiDist1: 'Dans les cinq jours ouvrables suivant l’entrée sur le portail en ligne',
            delaiDist2: 'Au bout d’un mois complet après l’enregistrement des coordonnées bancaires',
            evidenceChoix: ['versements', 'douze', 'dix-huit'],
            evidencePiece: ['coordonnées', 'bancaires', 'dépôt'],
            evidenceDelai: ['deux', 'semaines', 'transmission'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `ASSURANCE PARENTALE (RQAP) - GUIDE DU PARENT\nLa naissance ou l’adoption d’un enfant donne droit au remplacement d’une partie de votre salaire par le Régime québécois d’assurance parentale (RQAP). Pour recevoir vos prestations sans retard, suivez ces étapes. Connectez-vous d’abord au portail officiel avec votre identifiant ClicSÉQUR. Indiquez la date d’arrivée de l’enfant et choisissez votre option irréversible : ${t.choix}. Assurez-vous ensuite que ${t.piece} ${t.pieceVerbe} à votre dossier. Enfin, confirmez vos coordonnées bancaires pour le dépôt direct. Votre premier versement financier sera déposé dans votre compte ${t.delai}. Tout revenu gagné pendant vos semaines de congé doit être déclaré pour ajuster vos prestations.`,
          questions: [
            makeQuestion('Quel choix irréversible les parents doivent-ils obligatoirement poser lors de l’inscription ?', t.choixAns, t.choixDist1, t.choixDist2, t.evidenceChoix),
            makeQuestion('Quel renseignement ou document officiel doit être consigné au dossier du RQAP ?', t.pieceAns, t.pieceDist1, t.pieceDist2, t.evidencePiece),
            makeQuestion('Dans quel délai moyen le premier versement financier sera-t-il déposé dans le compte ?', t.delaiAns, t.delaiDist1, t.delaiDist2, t.evidenceDelai),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Partage des semaines de congé parental RQAP
    Object.assign(
      (rand) => {
        const tuples = [
          {
            volet: 'les semaines partageables de congé parental entre les deux conjoints',
            document: 'une entente écrite signée par les deux parents précisant la répartition choisie',
            avertissement: 'le choix du régime ne peut plus être modifié dès qu’un premier versement a été émis',
            avertAns: 'L’impossibilité absolue de changer d’option après réception du versement initial',
            avertDist1: 'L’obligation stricte et continue pour les deux parents de prendre leur congé simultanément',
            avertDist2: 'L’interdiction de travailler à temps partiel tout au long des semaines de congé',
            docAns: 'Un document conjoint signé fixant le partage convenu des semaines de congé',
            docDist1: 'La preuve officielle de déclaration hebdomadaire des gains perçus à temps partiel',
            docDist2: 'Le relevé officiel d’horaires confirmant la pleine disponibilité du service clientèle',
            evidenceAvert: ['régime', 'modifié', 'versement'],
            evidenceDoc: ['entente', 'signée', 'répartition'],
          },
          {
            volet: 'l’octroi des quatre semaines de prestations supplémentaires favorisant un partage équitable',
            document: 'la déclaration de revenus provinciale de l’année fiscale précédente de chaque parent',
            avertissement: 'toute semaine de travail rémunéré doit obligatoirement être inscrite dans la déclaration hebdomadaire',
            avertAns: 'L’inscription obligatoire de chaque tranche de salaire reçue au cours des semaines',
            avertDist1: 'L’interdiction formelle et absolue de cumuler le moindre revenu salarial durant le congé',
            avertDist2: 'L’obligation de déposer un dossier commun unique pour l’ensemble des deux conjoints',
            docAns: 'Le rapport fiscal provincial du dernier exercice d’imposition de chaque parent',
            docDist1: 'La copie intégrale du contrat de travail à temps partiel signé avec son employeur',
            docDist2: 'Le certificat de naissance original de l’enfant délivré par le registre civil',
            evidenceAvert: ['travail', 'déclaration', 'hebdomadaire'],
            evidenceDoc: ['déclaration', 'revenus', 'parent'],
          },
          {
            volet: 'la transition continue entre les prestations de maternité et le congé parental',
            document: 'l’autorisation parentale conjointe ainsi que le calendrier détaillé des semaines projetées',
            avertissement: 'les semaines de congé non réclamées avant le premier anniversaire de l’enfant sont définitivement perdues',
            avertAns: 'La perte définitive de toute semaine non utilisée avant le premier anniversaire',
            avertDist1: 'L’impossibilité formelle de prendre des semaines de congé à tour de rôle entre conjoints',
            avertDist2: 'L’interdiction totale et absolue de percevoir des revenus professionnels pendant le congé',
            docAns: 'L’accord officiel des deux parents précisant la planification des semaines retenues',
            docDist1: 'Le relevé hebdomadaire officiel de toutes les heures de travail effectuées à temps partiel',
            docDist2: 'L’attestation officielle d’inscription confirmée par le service clientèle du portail en ligne',
            evidenceAvert: ['anniversaire', 'enfant', 'perdues'],
            evidenceDoc: ['autorisation', 'calendrier', 'semaines'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `SERVICES QUÉBEC - FOIRE AUX QUESTIONS ASSURANCE PARENTALE\nComment organiser le partage de vos congés lors de l’arrivée d’un enfant ? Voici les règles régissant ${t.volet}. Les deux parents peuvent recevoir des prestations simultanément ou à tour de rôle selon leurs besoins. D’abord, chaque parent doit créer son propre dossier sur le portail du RQAP. Ensuite, vous devez téléverser ${t.document}. Enfin, sélectionnez le calendrier des semaines souhaitées. Attention : ${t.avertissement}. Si vous travaillez à temps partiel durant le congé, vous pouvez conserver une partie de vos gains sans réduction excessive de prestation. Notre service clientèle demeure joignable du lundi au vendredi de huit heures trente à seize heures trente.`,
          questions: [
            makeQuestion('Quel avertissement impératif les bénéficiaires doivent-ils impérativement respecter ?', t.avertAns, t.avertDist1, t.avertDist2, t.evidenceAvert),
            makeQuestion('Quel document justificatif les parents doivent-ils téléverser dans leur dossier en ligne ?', t.docAns, t.docDist1, t.docDist2, t.evidenceDoc),
            makeQuestion('Que prévoit le système si un parent effectue quelques heures rémunérées pendant son congé ?', 'Le maintien d’une part de rémunération sans pénalité majeure sur ses allocations', 'La suppression intégrale et définitive de la prestation pour chaque semaine travaillée', 'Le report automatique et garanti des semaines de congé au-delà du premier anniversaire', ['partie', 'gains', 'réduction']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Retour et échange chez un détaillant d'équipement de plein air
    Object.assign(
      (rand) => {
        const tuples = [
          {
            coop: 'la Coopérative de plein air MEC',
            delai: 'dans les trente jours suivant la transaction avec preuve d’achat',
            motifEtExclusion: 'pour des impératifs stricts d’hygiène et de sécurité corporelle, le matériel d’escalade et les sous-vêtements thermiques ne sont ni repris ni échangés',
            exclusionAns: 'Les équipements d’assurage en paroi ainsi que les sous-vêtements chauds',
            exclusionDist1: 'Les tentes de camping familiales ainsi que les matelas gonflables',
            exclusionDist2: 'Les vestes imperméables d’alpinisme ainsi que les sacs de randonnée',
            evidenceExcl: ['escalade', 'sous-vêtements', 'échangés'],
          },
          {
            coop: 'les magasins de sport SAIL Plein Air',
            delai: 'dans un délai limite de trente jours civils après achat',
            motifEtExclusion: 'en vertu de la réglementation provinciale sur les activités récréatives, les permis de pêche et les munitions sont exclus de tout remboursement',
            exclusionAns: 'Les droits de pêche officiels ainsi que les cartouches de chasse',
            exclusionDist1: 'Les cannes de lancer sportif ainsi que les leurres artificiels',
            exclusionDist2: 'Les vestes de flottaison nautiques ainsi que les bottes de marche',
            evidenceExcl: ['permis', 'pêche', 'munitions'],
          },
          {
            coop: 'le détaillant québécois La Cordée Plein Air',
            delai: 'dans les trente jours suivant la réception de votre commande',
            motifEtExclusion: 'selon nos règles commerciales de gestion d’inventaire, les cartes-cadeaux et les articles vendus en liquidation finale ne sont pas admissibles aux retours',
            exclusionAns: 'Les cartes d’achat prépayées et les produits achetés en solde de fermeture',
            exclusionDist1: 'Les maillots de bain de natation et les sous-vêtements de sport',
            exclusionDist2: 'Les lunettes de soleil polarisées et les montres de navigation GPS',
            evidenceExcl: ['cartes-cadeaux', 'liquidation', 'admissibles'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `SERVICE CLIENTÈLE - POLITIQUE DE RETOUR ET SATISFACTION GARANTIE\nChez ${t.coop}, nous voulons que chaque aventure en nature se déroule avec le meilleur équipement possible. Si votre matériel ne répond pas à vos attentes, vous pouvez le retourner facilement ${t.delai}. Pour une commande Web, générez votre étiquette de retour prépayée dans votre espace membre en ligne. Les articles doivent être retournés dans un état neuf, propres, avec leurs manuels et tous les accessoires dans leur emballage d’origine. Veuillez noter ${que(t.motifEtExclusion)}. Dès réception du colis dans notre entrepôt de distribution, nous inspecterons le matériel et émettrons un remboursement selon votre méthode de paiement initiale. Si vous préférez un échange immédiat, vous pouvez également vous présenter dans l’une de nos succursales avec votre facture électronique.`,
          questions: [
            makeQuestion('Quel est l’objet de cette politique d’après-vente pour les amateurs de plein air ?', 'Les conditions encadrant le retour, l’échange et le remboursement des articles', 'La fixation des prix de vente des équipements de plein air pour la saison', 'Le calendrier des promotions saisonnières offertes aux clients fidèles', ['politique', 'retour', 'remboursement']),
            makeQuestion('Quelle clause d’exclusion spécifique s’applique formellement selon le texte ?', t.exclusionAns, t.exclusionDist1, t.exclusionDist2, t.evidenceExcl),
            makeQuestion('Quelle option avantageuse s’offre au client désirant obtenir un remplacement sans délai ?', 'Se présenter en personne dans une succursale du réseau avec sa facture électronique', 'Générer une étiquette prépayée dans son espace membre en ligne pour renvoyer le colis', 'Expédier le matériel directement à l’entrepôt de distribution pour inspection rapide', ['succursales', 'facture', 'immédiat']),
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
        const tuples = [
          {
            citoyenne: 'Mireille Gagnon',
            projet: 'la piste cyclable protégée sur le boulevard Saint-Laurent',
            consultation: 'deux ans d’ateliers participatifs et plus de mille signatures citoyennes',
            motif: 'de coupures budgétaires décidées en catimini',
            projetAns: 'L’aménagement d’un corridor cyclable sécurisé sur le boulevard Saint-Laurent',
            projetDist1: 'La sécurisation des zones scolaires réclamée lors du conseil d’arrondissement',
            projetDist2: 'Le ralentissement de la vitesse des autos circulant sur le boulevard urbain',
            consultAns: 'Deux années d’ateliers participatifs et plus d’un millier de signatures citoyennes',
            consultDist1: 'Des dizaines de séances de négociation budgétaire tenues à la mairie de quartier',
            consultDist2: 'Une vaste campagne locale de sensibilisation des automobilistes à la vitesse urbaine',
            evidenceProjet: ['cyclable', 'Saint-Laurent', 'mairie'],
            evidenceConsult: ['ateliers', 'participatifs', 'signatures'],
          },
          {
            citoyenne: 'Diane Bouchard',
            projet: 'le réaménagement piétonnier et végétalisé de la rue Saint-Denis',
            consultation: 'dix-huit mois de concertation continue avec les commerçants et résidents',
            motif: 'de la pression indue exercée par quelques commerçants réticents',
            projetAns: 'La transformation verte et piétonne de la chaussée de la rue Saint-Denis',
            projetDist1: 'L’installation de ralentisseurs de vitesse demandée par les résidents du quartier',
            projetDist2: 'L’organisation d’ateliers de sécurité routière pour les commerçants de la rue',
            consultAns: 'Dix-huit mois d’échanges soutenus réunissant commerçants locaux et riverains',
            consultDist1: 'Une série de rencontres budgétaires d’urgence organisées à la mairie centrale',
            consultDist2: 'Un programme de patrouilles bénévoles pour sécuriser les traversées piétonnes',
            evidenceProjet: ['piétonnier', 'Saint-Denis', 'mairie'],
            evidenceConsult: ['concertation', 'commerçants', 'résidents'],
          },
          {
            citoyenne: 'Hélène Tremblay',
            projet: 'la voie réservée aux autobus et aux cyclistes sur l’avenue du Parc',
            consultation: 'trois consultations publiques et un sondage officiel d’arrondissement',
            motif: 'd’un revirement politique inattendu de l’administration municipale',
            projetAns: 'Le tracé dédié aux autobus collectifs et aux vélos sur l’avenue du Parc',
            projetDist1: 'Le plan de réduction de la vitesse des autos présenté au conseil municipal',
            projetDist2: 'La création de zones vertes protégées aux abords des arrêts d’autobus locaux',
            consultAns: 'Trois séances de consultation publique et une vaste enquête d’arrondissement',
            consultDist1: 'Un plan d’action bénévole pour comptabiliser le flux d’autobus et de cyclistes',
            consultDist2: 'Une série de rencontres avec les élus pour négocier les enveloppes budgétaires',
            evidenceProjet: ['voie', 'autobus', 'Parc'],
            evidenceConsult: ['consultations', 'publiques', 'sondage'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `PUBLICATION CITOYENNE SUR UN RÉSEAU SOCIAL\nPar ${t.citoyenne} - Groupe « Citoyens engagés de notre quartier »\nJ’apprends avec une immense déception que la mairie a décidé d’annuler ${t.projet}. Je n’ai pas de mots pour exprimer ma colère. Nous avons pourtant investi ${t.consultation} pour bâtir une rue plus verte et sécuritaire pour nos enfants. Et voilà que tout est balayé sous prétexte ${t.motif} ! Comment les élus peuvent-ils mépriser autant d’heures de mobilisation bénévole ? Nos enfants continueront de frôler des autos roulant trop vite. Je refuse de baisser les bras : venez tous au conseil d’arrondissement ce mardi pour exiger des comptes !`,
          questions: [
            makeQuestion('Quel aménagement urbain annulé par les autorités provoque l’indignation de l’auteure ?', t.projetAns, t.projetDist1, t.projetDist2, t.evidenceProjet),
            makeQuestion('Quel effort citoyen majeur de longue haleine est ainsi balayé par cette décision ?', t.consultAns, t.consultDist1, t.consultDist2, t.evidenceConsult),
            makeQuestion('Quelle mobilisation concrète la citoyenne propose-t-elle pour demander des comptes ?', 'Assister en grand nombre à la prochaine séance du conseil d’arrondissement ce mardi', 'Organiser un blocage spontané des automobilistes roulant trop vite dans le quartier', 'Relancer immédiatement un cycle complet d’ateliers participatifs avec les résidents', ['conseil', 'arrondissement', 'comptes']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Déception citoyenne réseau social - Abandon d'un parc de quartier
    Object.assign(
      (rand) => {
        const tuples = [
          {
            auteur: 'Marc-André Lavoie',
            espace: 'l’aménagement d’un grand parc public avec jardins partagés sur l’ancien terrain vague de la rue Bellechasse',
            promoteur: 'la vente du terrain à un promoteur pour ériger deux tours d’habitation denses',
            promesse: 'de la promesse électorale formelle de préserver un îlot de fraîcheur pour les familles',
            espaceAns: 'Un grand parc public accueillant des potagers collectifs sur la rue Bellechasse',
            espaceDist1: 'La rénovation complète des aires de jeux pour enfants bordant la rue Bellechasse',
            espaceDist2: 'La plantation d’arbres d’alignement le long des futures tours d’habitation denses',
            promoteurAns: 'Deux tours d’habitation denses confiées à un promoteur immobilier privé',
            promoteurDist1: 'Un centre commercial à un étage avec une grande aire de stationnement extérieure',
            promoteurDist2: 'Un parc de maisons unifamiliales isolées avec larges pelouses privées',
            evidenceEspace: ['parc', 'Bellechasse', 'jardins'],
            evidencePromoteur: ['tours', 'habitation', 'promoteur'],
          },
          {
            auteur: 'Patrick Simard',
            espace: 'la transformation de l’ancien dépôt municipal en parc nature boisé doté de jeux d’eau pour enfants',
            promoteur: 'la construction d’un stationnement étagé payant en béton et d’immeubles à bureaux',
            promesse: 'de l’engagement officiel d’augmenter significativement le couvert végétal du secteur',
            espaceAns: 'La reconversion de l’ancien dépôt en espace boisé naturel pourvu de jeux d’eau',
            espaceDist1: 'La végétalisation immédiate des toits du stationnement étagé prévu par la ville',
            espaceDist2: 'L’installation de modules de jeux temporaires devant les futurs édifices à bureaux',
            promoteurAns: 'L’implantation d’un garage étagé payant et d’édifices de bureaux en béton',
            promoteurDist1: 'Quatre rangées de maisons de ville mitoyennes destinées aux familles',
            promoteurDist2: 'Un petit lotissement de chalets résidentiels avec piscine commune',
            evidenceEspace: ['dépôt', 'boisé', 'jeux'],
            evidencePromoteur: ['stationnement', 'étagé', 'bureaux'],
          },
          {
            auteur: 'Vincent Roy',
            espace: 'la création d’une place publique animée avec forêt urbaine et kiosques de marché fermier',
            promoteur: 'la cession du lot commercial pour agrandir un vaste entrepôt de distribution logistique',
            promesse: 'du vote unanime des comités de quartier en faveur d’un espace vert et rassembleur',
            espaceAns: 'Une esplanade publique animée mariant îlot forestier urbain et marché fermier',
            espaceDist1: 'La création d’un cordon d’arbres protecteur autour du futur entrepôt logistique',
            espaceDist2: 'L’aménagement d’un kiosque d’information permanent sur le vote des comités locaux',
            promoteurAns: 'La cession du terrain en faveur d’un vaste centre logistique de distribution',
            promoteurDist1: 'Un ensemble de condos de luxe avec terrasses panoramiques sur le toit',
            promoteurDist2: 'Une résidence pour aînés avec commerces de proximité au rez-de-chaussée',
            evidenceEspace: ['place', 'publique', 'fermier'],
            evidencePromoteur: ['entrepôt', 'distribution', 'logistique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `TRIBUNE LIBRE DU QUARTIER - DÉCEPTION AMÈRE FACE AU BÉTON\nPar ${t.auteur}\nQuelle tristesse de constater que le béton l’emporte encore sur notre quartier ! La ville vient de confirmer l’abandon du projet pour ${t.espace}. À la place de cet îlot de fraîcheur, les autorités ont approuvé ${t.promoteur}. Qu’est-il advenu ${t.promesse} ? Notre secteur étouffe durant les canicules et nos enfants manquent d’arbres pour jouer. Je me sens profondément trahi comme citoyen payeur de taxes. Partagez massivement ce statut pour dénoncer cette décision inacceptable de notre administration municipale !`,
          questions: [
            makeQuestion('Quel aménagement vert promis aux familles est sacrifié par les élus municipaux ?', t.espaceAns, t.espaceDist1, t.espaceDist2, t.evidenceEspace),
            makeQuestion('Quel type de projet immobilier dense ou commercial remplacera l’espace vert prévu ?', t.promoteurAns, t.promoteurDist1, t.promoteurDist2, t.evidencePromoteur),
            makeQuestion('Quelle préoccupation écologique essentielle motive ce cri du cœur sur le réseau social ?', 'Le manque d’arbres et d’îlots de fraîcheur pour soulager le quartier durant les canicules', 'La pollution sonore causée par les chantiers de construction nocturnes du quartier', 'La présence excessive de goélands et de pigeons près des terrasses du secteur', ['canicules', 'enfants', 'arbres']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Nervosité courriel d'un ami avant une entrevue d'embauche
    Object.assign(
      (rand) => {
        const tuples = [
          {
            ami: 'Éric',
            poste: 'de directeur adjoint des communications dans un grand ministère québécois',
            jury: 'un comité de quatre évaluateurs avec une mise en situation minutée',
            peur: 'de bafouiller, d’avoir un trou de mémoire ou de mal gérer mon stress en anglais',
            posteAns: 'Un mandat d’encadrement des communications au sein d’un ministère québécois',
            posteDist1: 'Un rôle d’évaluateur externe spécialisé dans les mises en situation professionnelles',
            posteDist2: 'Un poste de formateur en gestion du stress et en techniques de prise de parole',
            juryAns: 'Un panel de quatre examinateurs avec épreuve pratique chronométrée',
            juryDist1: 'Un examen écrit individuel de traduction anglaise portant sur les dossiers',
            juryDist2: 'Une évaluation téléphonique impromptue de cinq minutes avec la direction',
            peurAns: 'La crainte d’hésiter dans ses paroles, d’oublier ses arguments et de bloquer en anglais',
            peurDist1: 'La peur de manquer de temps le matin même pour relire l’ensemble de ses dossiers révisés',
            peurDist2: 'L’angoisse de ne pas parvenir à joindre son ami au téléphone pour faire des exercices utiles',
            evidencePoste: ['directeur', 'adjoint', 'communications'],
            evidenceJury: ['quatre', 'évaluateurs', 'minutée'],
            evidencePeur: ['bafouiller', 'mémoire', 'stress'],
          },
          {
            ami: 'Maxime',
            poste: 'de chef d’équipe logistique dans une entreprise multinationale de transport',
            jury: 'un jury de trois cadres supérieurs avec des questions comportementales serrées',
            peur: 'de perdre mes repères face aux questions imprévues sur la gestion de crise',
            posteAns: 'La fonction de chef d’équipe logistique pour un groupe mondial de fret',
            posteDist1: 'Un mandat de consultant externe chargé d’auditer les cadres supérieurs du groupe',
            posteDist2: 'Un rôle de formateur interne spécialisé dans les entrevues comportementales de crise',
            juryAns: 'Un panel de trois hauts dirigeants posant des questions comportementales pointues',
            juryDist1: 'Une mise en situation pratique de gestion de crise simulée sur un quai logistique',
            juryDist2: 'Un test écrit individuel portant sur les procédures internes du groupe de transport',
            peurAns: 'L’angoisse de perdre ses moyens devant des questions inattendues sur les crises',
            peurDist1: 'La peur de ne pas maîtriser les dossiers logistiques révisés la veille au soir',
            peurDist2: 'L’inquiétude d’oublier de poser des questions aux trois membres du jury d’embauche',
            evidencePoste: ['chef', 'équipe', 'logistique'],
            evidenceJury: ['trois', 'cadres', 'comportementales'],
            evidencePeur: ['repères', 'questions', 'crise'],
          },
          {
            ami: 'Guillaume',
            poste: 'de conseiller principal en politiques publiques auprès de la mairie',
            jury: 'une commission d’experts qui évaluera ma présentation orale de quinze minutes',
            peur: 'de dépasser le temps limite et d’oublier les recommandations clés de mon dossier',
            posteAns: 'Un rôle stratégique d’orientation des affaires publiques pour la ville',
            posteDist1: 'Un poste de commissaire évaluateur au sein du jury de recrutement de la mairie',
            posteDist2: 'Un mandat d’analyste chargé de la relecture finale des dossiers de présentation',
            juryAns: 'Un comité d’évaluation chargé de juger un exposé oral de quinze minutes',
            juryDist1: 'Un entretien informel sans temps limite avec le chef de cabinet de la mairie',
            juryDist2: 'Une session de questions écrites portant sur l’ensemble des politiques publiques',
            peurAns: 'La crainte d’excéder le temps imparti et d’omettre les propositions maîtresses',
            peurDist1: 'L’angoisse de ne pas avoir assez de contenu pour tenir les quinze minutes d’exposé',
            peurDist2: 'La peur vive de décevoir son ami après avoir répété au téléphone durant la soirée',
            evidencePoste: ['conseiller', 'politiques', 'publiques'],
            evidenceJury: ['commission', 'présentation', 'minutes'],
            evidencePeur: ['dépasser', 'recommandations', 'dossier'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `COURRIEL PERSONNEL - BESOIN DE TES ENCOURAGEMENTS\nDe : ${t.ami} Lemieux\nÀ : Martin Tremblay\nObjet : Panique avant mon entrevue de demain !\nSalut Martin,\nJe t’écris parce que j’ai l’estomac noué et je n’arrive plus à dormir. Demain à neuf heures, je passe mon entrevue décisive pour le poste ${t.poste}. C’est la chance dont je rêve depuis des années, mais la pression est forte : je serai devant ${t.jury}. Bien que j’aie révisé mes dossiers, j’ai une angoisse folle : j’ai peur ${t.peur}. Le syndrome de l’imposteur me paralyse complètement. Aurais-tu cinq minutes pour me faire répéter au téléphone ou me donner des conseils de respiration ? Ton aide me ferait un bien immense. Merci d’être là pour moi !`,
          questions: [
            makeQuestion('Quel poste stratégique de carrière convoité est en jeu lors de cette entrevue ?', t.posteAns, t.posteDist1, t.posteDist2, t.evidencePoste),
            makeQuestion('Quelle formule d’évaluation exigeante devant jury le candidat doit-il affronter ?', t.juryAns, t.juryDist1, t.juryDist2, t.evidenceJury),
            makeQuestion('Quelle crainte précise paralyse particulièrement le candidat à la veille du test ?', t.peurAns, t.peurDist1, t.peurDist2, t.evidencePeur),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Courriel amical - Anxiété avant une audition ou entrevue d'admission
    Object.assign(
      (rand) => {
        const tuples = [
          {
            amie: 'Sandrine',
            epreuve: 'une audition finale d’admission au Conservatoire d’art dramatique de Montréal',
            exigence: 'interpréter deux monologues classiques devant un jury de professeurs renommés',
            symptome: 'les mains qui tremblent, la gorge sèche et la peur panique d’oublier mon texte',
            epreuveAns: 'L’audition décisive pour être admise au prestigieux Conservatoire de théâtre',
            epreuveDist1: 'Une répétition générale organisée en public par ses professeurs de théâtre',
            epreuveDist2: 'Un examen théorique de fin d’année portant sur les textes dramatiques classiques',
            exigenceAns: 'Jouer deux monologues classiques devant des enseignants de premier plan',
            exigenceDist1: 'Improviser une scène dramatique inédite à la demande expresse de ses professeurs',
            exigenceDist2: 'Analyser l’histoire littéraire des deux textes classiques sans aucune préparation',
            symptomeAns: 'Des tremblements aux mains, la bouche asséchée et la hantise d’un trou de mémoire',
            symptomeDist1: 'Des maux de gorge persistants l’empêchant totalement de parler à voix haute sur scène',
            symptomeDist2: 'Une fatigue musculaire extrême provoquée par de longues répétitions avec ses proches',
            evidenceEpreuve: ['audition', 'Conservatoire', 'dramatique'],
            evidenceExigence: ['interpréter', 'monologues', 'professeurs'],
            evidenceSymptome: ['tremblent', 'gorge', 'texte'],
          },
          {
            amie: 'Laurence',
            epreuve: 'une entrevue d’admission pour la maîtrise professionnelle en psychologie clinique',
            exigence: 'analyser un cas clinique complexe sans préparation préalable en trente minutes',
            symptome: 'des palpitations cardiaques intenses et une insomnie tenace depuis trois jours',
            epreuveAns: 'L’entrevue sélective permettant d’intégrer le programme supérieur de psychologie',
            epreuveDist1: 'Un examen théorique de synthèse portant sur l’ensemble des cours cliniques de l’année',
            epreuveDist2: 'Une séance de consultation clinique simulée organisée entre étudiants de sa cohorte',
            exigenceAns: 'Décortiquer une situation clinique complexe sans préparation en trente minutes',
            exigenceDist1: 'Rédiger un bilan psychologique complet après une observation en milieu hospitalier',
            exigenceDist2: 'Présenter les théories cliniques de base devant un collège d’enseignants réputés',
            symptomeAns: 'De vives palpitations cardiaques et trois nuits consécutives sans trouver le sommeil',
            symptomeDist1: 'Des étourdissements continus l’obligeant à s’allonger durant l’analyse de son dossier',
            symptomeDist2: 'Une extinction presque totale de voix survenue suite à de longues discussions amicales',
            evidenceEpreuve: ['entrevue', 'maîtrise', 'psychologie'],
            evidenceExigence: ['analyser', 'clinique', 'trente'],
            evidenceSymptome: ['palpitations', 'insomnie', 'jours'],
          },
          {
            amie: 'Audrey',
            epreuve: 'un examen oral final de l’École du Barreau du Québec pour devenir avocate',
            exigence: 'plaider une cause simulée devant un collège de trois juges expérimentés',
            symptome: 'des maux de ventre paralysants et l’angoisse vive de perdre tous mes moyens',
            epreuveAns: 'L’épreuve orale ultime auprès du Barreau pour pouvoir exercer comme avocate',
            epreuveDist1: 'Une plaidoirie d’entraînement animée par ses professeurs de l’École du Barreau',
            epreuveDist2: 'Un stage pratique d’observation auprès d’un collège de trois juges d’expérience',
            exigenceAns: 'Soutenir une plaidoirie simulée face à un tribunal de trois magistrats d’expérience',
            exigenceDist1: 'Rédiger un mémoire de défense complet en respectant un temps limite de préparation',
            exigenceDist2: 'Répondre sans délai à un interrogatoire théorique posé par les professeurs du Barreau',
            symptomeAns: 'De violents maux d’estomac et la hantise de perdre l’ensemble de ses capacités',
            symptomeDist1: 'Des tremblements incontrôlables des mains au moment de tenir ses notes de plaidoirie',
            symptomeDist2: 'Une grande difficulté à respirer calmement dès qu’elle aperçoit la salle d’audience',
            evidenceEpreuve: ['examen', 'Barreau', 'avocate'],
            evidenceExigence: ['plaider', 'cause', 'juges'],
            evidenceSymptome: ['ventre', 'moyens', 'peur'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `COURRIEL AMICAL - SOS STRESS AVANT MON ÉPREUVE\nDe : ${t.amie} Bouchard\nÀ : Julie Fortin\nObjet : Je stresse pour mon épreuve de demain !\nMa chère Julie,\nL’angoisse m’empêche totalement de dormir. Demain après-midi, c’est le moment fatidique : je passe ${t.epreuve}. Toute mon année d’efforts se joue sur cette seule rencontre. L’exigence est élevée car je dois ${t.exigence}. Bien que mes professeurs me disent prête, je ressens ${t.symptome}. La peur de décevoir mes proches me serre le cœur, même si je dramatise probablement. Envoie-moi tes meilleures pensées positives demain à quatorze heures, j’en aurai grand besoin ! Grosses bises, ${t.amie}`,
          questions: [
            makeQuestion('Quelle épreuve déterminante provoque la vive anxiété de l’expéditrice ?', t.epreuveAns, t.epreuveDist1, t.epreuveDist2, t.evidenceEpreuve),
            makeQuestion('Quel défi d’évaluation complexe doit-elle relever devant le comité ?', t.exigenceAns, t.exigenceDist1, t.exigenceDist2, t.evidenceExigence),
            makeQuestion('Quels symptômes physiques traduisent l’ampleur de son stress à la veille de l’épreuve ?', t.symptomeAns, t.symptomeDist1, t.symptomeDist2, t.evidenceSymptome),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Déception citoyenne réseau social - Fermeture équipement de quartier
    Object.assign(
      (rand) => {
        const tuples = [
          {
            citoyen: 'Jean-François Tremblay',
            lieu: 'de la bibliothèque de quartier Saint-Charles',
            public: 'aux aînés du secteur qui venaient lire le journal et emprunter des livres',
            repli: 'un pavillon municipal vétuste sans transport en commun direct',
            lieuAns: 'L’arrêt définitif des services offerts par la bibliothèque Saint-Charles',
            lieuDist1: 'La fermeture temporaire du pavillon municipal durant les travaux du mois',
            lieuDist2: 'L’annulation de tous les circuits d’autobus desservant le secteur Saint-Charles',
            publicAns: 'Les résidents âgés du quartier habitués à consulter la presse et emprunter des romans',
            publicDist1: 'Les automobilistes du secteur qui utilisaient le stationnement du pavillon municipal',
            publicDist2: 'L’ensemble des signataires de la pétition locale demandant le maintien des élus en place',
            repliAns: 'Un local communal dégradé inaccessible sans véhicule automobile personnel',
            repliDist1: 'Un bâtiment moderne situé à une trop grande distance du centre du quartier',
            repliDist2: 'Une salle de lecture municipale payante dont les tarifs excluent les lecteurs âgés',
            evidenceLieu: ['fermeture', 'bibliothèque', 'Saint-Charles'],
            evidencePublic: ['aînés', 'journal', 'livres'],
            evidenceRepli: ['pavillon', 'vétuste', 'transport'],
          },
          {
            citoyen: 'Simon Pelletier',
            lieu: 'du centre communautaire et récréatif pour les jeunes de notre arrondissement',
            public: 'aux adolescents qui profitaient de l’aide aux devoirs et des ateliers d’art',
            repli: 'un sous-sol sombre d’église situé à plus de trois kilomètres de distance',
            lieuAns: 'La condamnation irréversible du centre récréatif jeunesse du quartier',
            lieuDist1: 'La fermeture définitive du sous-sol de l’église de notre arrondissement',
            lieuDist2: 'L’arrêt des subventions accordées aux ateliers artistiques de la paroisse',
            publicAns: 'Les jeunes du quartier soutenus pour leurs études scolaires et leurs créations manuelles',
            publicDist1: 'Les bénévoles de la paroisse locale assurant l’entretien régulier de l’édifice religieux',
            publicDist2: 'Les résidents mobilisés sur les réseaux sociaux pour faire reculer la mairie de quartier',
            repliAns: 'Une crypte d’édifice religieux obscure et éloignée de plus de trois mille mètres',
            repliDist1: 'Un local associatif jugé trop exigu pour accueillir les activités d’aide aux devoirs',
            repliDist2: 'Le sous-sol proposé est situé à deux pas de l’école et accessible à pied',
            evidenceLieu: ['fermeture', 'centre', 'jeunes'],
            evidencePublic: ['adolescents', 'devoirs', 'ateliers'],
            evidenceRepli: ['sous-sol', 'église', 'kilomètres'],
          },
          {
            citoyen: 'David Simard',
            lieu: 'de la piscine municipale intérieure de notre arrondissement',
            public: 'aux familles avec enfants et aux personnes âgées suivant des cours d’aquagym',
            repli: 'un complexe sportif privé aux tarifs d’abonnement inaccessibles pour la population',
            lieuAns: 'L’abandon permanent du bassin aquatique intérieur de l’arrondissement',
            lieuDist1: 'La fermeture d’urgence du complexe sportif privé implanté dans le quartier',
            lieuDist2: 'L’arrêt complet des cours municipaux d’aquagym durant la saison estivale',
            publicAns: 'Les ménages avec tout-petits et les aînés adeptes d’exercices aquatiques doux',
            publicDist1: 'Les membres réguliers abonnés aux activités du complexe sportif privé du secteur',
            publicDist2: 'Les signataires bénévoles de la pétition locale protestant contre la municipalité',
            repliAns: 'Un club d’entraînement payant appliquant des cotisations trop lourdes pour les résidents',
            repliDist1: 'Une installation sportive éloignée de plusieurs kilomètres sans aucun transport en commun',
            repliDist2: 'Un bassin privé réservé uniquement aux compétitions nautiques et fermé pour les familles',
            evidenceLieu: ['fermeture', 'piscine', 'arrondissement'],
            evidencePublic: ['familles', 'âgées', 'aquagym'],
            evidenceRepli: ['complexe', 'privé', 'inaccessibles'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `RÉSEAU SOCIAL DE QUARTIER - CRI DU CŒUR\nPar ${t.citoyen}\nC’est avec tristesse que je partage cette nouvelle : la municipalité a confirmé la fermeture définitive ${t.lieu} à la fin du mois. Cet endroit constituait un repère précieux dans notre quartier depuis des décennies. Je pense avec peine ${t.public}, qui perdront un espace accessible et gratuit. La mairie prétend relocaliser les activités vers ${t.repli}, mais cette solution pénalise d’abord les résidents les plus vulnérables. Comment peut-on sacrifier nos services de proximité essentiels ? J’appelle les résidents à signer notre pétition en ligne pour faire reculer les élus avant qu’il ne soit trop tard !`,
          questions: [
            makeQuestion('Quelle fermeture de service de proximité local est dénoncée dans ce cri du cœur ?', t.lieuAns, t.lieuDist1, t.lieuDist2, t.evidenceLieu),
            makeQuestion('Quel groupe d’usagers sera le plus durement pénalisé par cette décision municipale ?', t.publicAns, t.publicDist1, t.publicDist2, t.evidencePublic),
            makeQuestion('Pourquoi l’option de relocalisation proposée par la mairie est-elle vivement critiquée ?', t.repliAns, t.repliDist1, t.repliDist2, t.evidenceRepli),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],
}
