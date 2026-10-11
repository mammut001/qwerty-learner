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
  'halte', 'harcèlement', 'hors', 'huit', 'onze', 'héroïque', 'hérisson'
])

export function isElidable(word) {
  if (!word) return false
  const clean = word.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const first = clean.split(/[^a-z0-9]/)[0]
  if (H_ASPIRE_SET.has(first) || first === 'huit' || first === 'onze') return false
  if (/^[aeiouy]/.test(first)) return true
  if (/^h[aeiouy]/.test(first)) return true
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
          { lieu: 'sur la place publique', repli: 'dans la salle paroissiale', horaire: 'dix heures et demie', plat: 'un dessert maison', lieuPara: 'au centre de la place publique', repliPara: 'vers les locaux de la paroisse', lieuKw: 'place publique', repliKw: 'salle paroissiale' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour ! Est-ce que tu as vu l’affiche pour la fête de quartier de samedi ? Tout le monde se rassemble ${s.lieu} dès ${s.horaire} du matin. Il y aura des jeux gonflables pour les enfants et un dîner partagé le midi. Chaque famille apporte ${s.plat} à partager avec les voisins. Les organisateurs prévoient aussi des ateliers d’artisanat et des musiciens locaux tout l’après-midi. S’il commence à pleuvoir, nous irons tous ${s.repli} juste à côté. J’espère vraiment que tu viendras avec nous !`,
          questions: [
            makeQuestion('Quel est le sujet principal de cette conversation ?', 'L’organisation festive d’un grand rassemblement de quartier', 'La planification d’un concert de musique locale', 'La préparation du grand dîner communautaire de midi', ['fête', 'quartier']),
            makeQuestion('Où les participants doivent-ils se rassembler le matin ?', `Ils se réunissent ${s.lieuPara}`, 'Ils se rejoignent devant l’école du quartier', 'Ils s’installent près des jeux pour enfants', [s.lieuKw]),
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
          { nom: 'Madame Roy', activite: 'une dégustation de produits régionaux', heure: 'midi et demi', actPara: 'une dégustation guidée de spécialités locales', actKw: 'dégustation' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Marc ! ${s.nom} m’a parlé des activités prévues pour notre journée des voisins ce dimanche. Dès neuf heures, les bénévoles installeront les tables et les chaises sur la rue piétonne. Ensuite, vers ${s.heure}, il y aura un grand repas communautaire et ${s.activite}. Les enfants pourront participer à une chasse aux trésors dans les jardins partagés. En cas d’averse, le comité louera la grande tente municipale pour abriter tout le monde. N’oublie pas d’apporter tes verres réutilisables pour éviter les déchets !`,
          questions: [
            makeQuestion('De quel événement les deux personnes parlent-elles ?', 'Des festivités conviviales organisées par les voisins', 'D’une assemblée publique au conseil de ville', 'D’une foire sportive animée par des bénévoles', ['voisins', 'activités']),
            makeQuestion('Quelle animation particulière est organisée vers le dîner ?', `${cap(s.actPara)}`, 'Une grande chasse aux trésors dans les jardins', 'L’installation collective des tables et chaises', [s.actKw]),
            makeQuestion('Que demande-t-on d’apporter pour limiter les déchets ?', 'Fournir ses propres verres pour limiter les rebuts', 'Apporter des assiettes en carton supplémentaires', 'Nettoyer les tables installées sur la rue piétonne', ['verres', 'déchets']),
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
          { ville: 'à Montréal', pays: 'quinze pays', epreuve: 'du mille mètres', athlete: 'Mélanie Tremblay', epPara: 'l’épreuve individuelle de moyenne distance', epKw: 'mille mètres' },
          { ville: 'à Sherbrooke', pays: 'dix pays', epreuve: 'du relais mixte', athlete: 'Audrey Beaulieu', epPara: 'la compétition par équipes du relais mixte', epKw: 'relais mixte' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `Ici Radio-Canada au téléjournal de dix-huit heures. Les Championnats internationaux de patinage de vitesse sur courte piste s’ouvrent officiellement ce soir ${s.ville}. Plus de cent cinquante patineurs représentant ${s.pays} sont arrivés cette semaine pour s’entraîner sur la glace québécoise. L’épreuve très attendue ${s.epreuve} se déroulera samedi après-midi devant une foule nombreuse. Les entraîneurs soulignent l’excellente forme des athlètes d’ici, dont ${s.athlete}, qui espèrent remporter plusieurs médailles d’or. La finale sera diffusée en direct sur nos plateformes dès quatorze heures. Les billets pour les gradins sont presque tous vendus.`,
          questions: [
            makeQuestion('Quelle est l’information principale donnée dans ce bulletin ?', 'L’ouverture d’une compétition sur glace internationale', 'La rénovation complète d’un anneau sportif régional', 'Le départ d’une équipe olympique pour un stage à l’étranger', ['patinage', 'championnats']),
            makeQuestion('Quelle course très attendue se déroulera samedi après-midi ?', `${cap(s.epPara)}`, 'La présentation officielle des délégations étrangères', 'La cérémonie de remise des récompenses d’ouverture', [s.epKw]),
            makeQuestion('Que pourront faire les amateurs de sport samedi dès quatorze heures ?', 'Regarder la ronde finale en diffusion directe', 'Acheter des billets à moitié prix aux guichets', 'Rencontrer les entraîneurs lors d’un entraînement', ['finale', 'direct']),
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
            makeQuestion('Quel événement sportif fait l’objet de ce reportage ?', 'Une coupe du monde réunissant des fondeurs', 'Un circuit d’alpinisme réservé aux recrues', 'Une traversée récréative des forêts du Nord', ['ski', 'coupe du monde']),
            makeQuestion('Quel moyen de transport conseille-t-on aux spectateurs ?', 'Les autobus gratuits affrétés depuis la ville', 'Le train de banlieue reliant les pistes de ski', 'Le covoiturage payant coordonné par taxi local', ['navettes', 'gratuites']),
            makeQuestion('Quand auront lieu les premières courses officielles ?', 'En tout début de matinée au cours du lendemain', 'En fin d’après-midi après le coucher du soleil', 'Lundi matin dès l’ouverture générale du domaine', ['début', 'matinée']),
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
            makeQuestion('Quel est le but premier de ce rassemblement de quartier ?', 'Une fête solidaire avec vente d’articles usagés', 'Une consultation citoyenne sur la circulation locale', 'Une rencontre d’accueil pour de nouveaux commerçants', ['vente', 'voisins']),
            makeQuestion('À quel organisme seront versés les bénéfices de la cantine ?', `Directement ${s.orgPara}`, 'À une école privée du centre métropolitain', 'À un club sportif finançant ses compétitions', [s.orgKw]),
            makeQuestion('Quelle décision sera prise s’il pleut trop fort samedi ?', 'Reporter l’ensemble des activités au lendemain', 'Annuler définitivement la vente de solidarité', 'Déplacer les kiosques dans le gymnase du quartier', ['dimanche', 'remis']),
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
          { titre: 'd’adjoint administratif', ville: 'à Laval', flex: 'deux jours de télétravail', avantage: 'une assurance collective complète', avPara: 'une couverture d’assurance collective complète', avKw: 'assurance collective' },
          { titre: 'de commis de bureau', ville: 'à Longueuil', flex: 'trois jours de télétravail', avantage: 'un régime de retraite avantageux', avPara: 'un programme d’épargne pour la retraite avantageux', avKw: 'retraite' },
          { titre: 'de coordonnateur de projets', ville: 'à Montréal', flex: 'un horaire flexible', avantage: 'quatre semaines de vacances payées', avPara: 'quatre semaines de congés payés dès l’entrée en poste', avKw: 'vacances payées' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Patrick ! Tu cherchais un emploi stable ces temps-ci ? Notre firme de génie ${s.ville} recrute justement un poste ${s.titre}. La personne choisie devra répondre aux appels des clients, classer les dossiers techniques et coordonner les réunions hebdomadaires. On offre ${s.flex} par semaine et ${s.avantage} dès l’embauche. L’ambiance dans l’équipe est vraiment chaleureuse et dynamique. Si le poste t’intéresse, tu devrais m’envoyer ton curriculum vitæ avant vendredi midi. Je pourrai le transmettre directement à notre gestionnaire des ressources humaines !`,
          questions: [
            makeQuestion('Que propose l’ami dans cette conversation ?', 'Un emploi administratif stable dans son entreprise', 'Un perfectionnement en bureautique pour diplômés', 'Un contrat temporaire de rédaction de rapports', ['firme', 'recrute']),
            makeQuestion('Quel avantage lié au poste est expressément mentionné ?', `${cap(s.avPara)}`, 'Une voiture de société fournie pour les déplacements', 'Un abonnement annuel à une salle de sport privée', [s.avKw]),
            makeQuestion('Que doit faire la personne intéressée avant vendredi midi ?', 'Transmettre sa candidature professionnelle à son ami', 'Prendre rendez-vous avec la direction générale', 'Passer une entrevue formelle devant les collègues', ['curriculum vitæ', 'vendredi']),
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
            makeQuestion('Quel type d’emploi est décrit par la collègue ?', 'Un poste au service aux membres à temps plein', 'Un emploi de mécanicien dans un atelier d’usine', 'Un rôle de cadre supérieur gérant les finances', ['service aux membres', 'plein']),
            makeQuestion('Quelle exigence de l’employeur est précisée ?', `${cap(s.reqPara)}`, 'La détention d’un permis de conduire commercial', 'La maîtrise courante de trois langues étrangères', [s.reqKw]),
            makeQuestion('Que propose l’amie à la fin de l’appel ?', 'Déposer la candidature de son interlocutrice', 'Lui prêter des manuels de comptabilité financière', 'Organiser un dîner avec le chef des ressources', ['candidature', 'dépose']),
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
            makeQuestion('Quel phénomène climatique est décrit dans ce reportage ?', 'Une inondation majeure causée par une crue de printemps', 'Une tempête de neige tardive bloquant les grands axes', 'Un glissement de terrain le long d’une falaise rocheuse', ['crue', 'inondant']),
            makeQuestion('Où les familles évacuées sont-elles accueillies pour la nuit ?', `Elles sont hébergées ${s.refPara}`, 'Elles passent la nuit dans leur véhicule personnel', 'Elles ont été relocalisées dans un hôtel de banlieue', [s.refKw]),
            makeQuestion('Quelle consigne les autorités donnent-elles aux automobilistes ?', 'Éviter totalement de circuler dans le quartier touché', 'Venir aider les équipes de secours à empiler le sable', 'Ralentir leur allure de dix kilomètres à l’heure', ['éviter', 'automobilistes']),
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
            makeQuestion('Quelle est la cause principale de cette inondation soudaine ?', 'Un blocage d’imposants blocs de glace sous les ponts', 'La rupture soudaine d’un barrage hydroélectrique en amont', 'Des précipitations torrentielles causées par un orage d’été', ['embâcle', 'glace']),
            makeQuestion('Quelle conséquence directe touche les commerces du secteur ?', `Leur rez-de-chaussée a subi ${s.hautPara}`, 'Leur toiture a cédé sous le poids d’une neige abondante', 'Leurs réserves de marchandises ont été pillées la nuit', [s.hautKw]),
            makeQuestion('Quelle mesure d’aide la Croix-Rouge a-t-elle mise en place ?', 'Un centre distribuant des couvertures et des repas chauds', 'Une distribution d’argent comptant aux propriétaires sinistrés', 'Un service d’avocats pour contester les décisions d’assurance', ['couvertures', 'repas']),
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
            makeQuestion('De quel emploi l’intervenant fait-il la description ?', 'Technicien en soutien informatique en milieu collégial', 'Professeur régulier de littérature au secondaire', 'Conseiller pédagogique pour l’orientation scolaire', ['technicien', 'informatique']),
            makeQuestion('Quelle est l’une des responsabilités principales mentionnées ?', `${cap(s.tacPara)}`, 'La préparation des repas quotidiens à la cafétéria', 'La surveillance nocturne des résidences d’étudiants', [s.tacKw]),
            makeQuestion('Où l’ami doit-il envoyer son dossier pour postuler ?', 'Directement par le portail de recrutement du cégep', 'Par lettre recommandée au ministère de l’Éducation', 'En main propre au bureau du directeur général du cégep', ['portail', 'dossier']),
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
            makeQuestion('Quel est le thème principal de ce récit ?', 'Le bilan d’un séjour de vacances personnelles à l’étranger', 'Un voyage d’affaires pour conclure des accords commerciaux', 'Un projet de déménagement définitif en Amérique du Sud', ['voyage', 'séjour']),
            makeQuestion('Quelle difficulté la voyageuse a-t-elle rencontrée au début ?', `${cap(s.defPara)}`, 'La perte de toutes ses valises dès l’arrivée à l’aéroport', 'Le vol de ses pièces d’identité et de son argent comptant', [s.defKw]),
            makeQuestion('Que propose la collègue à la fin de leur discussion ?', 'Regarder ensemble les clichés pris durant son voyage', 'Lui vendre ses guides touristiques sur le pays visité', 'Planifier une escapade commune pour l’été qui vient', ['photos', 'pause']),
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
          { pays: 'en Italie', ville: 'de Bologne', logement: 'dans un petit appartement d’étudiant', transport: 'les trains régionaux', logPara: 'dans un modeste logement partagé pour étudiants', logKw: 'appartement' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as passé de belles vacances, Carole ? — Oui, vraiment fantastiques ! Je suis partie un mois complet ${s.pays} pour suivre des cours de langue. J’habitais ${s.logement} dans le centre ${s.ville}. Tous les matins, je prenais ${s.transport} pour aller à l’école. Au début, j’avais peur de ne pas comprendre les accents régionaux, mais après deux semaines, j’arrivais déjà à commander au marché et à discuter avec les marchands. Le plus dépaysant, c’était le rythme de vie : les soupers tardifs et les longues promenades en soirée au bord de l’eau.`,
          questions: [
            makeQuestion('Pourquoi Carole est-elle partie à l’étranger pendant un mois ?', 'Pour perfectionner une langue seconde dans son milieu', 'Pour chercher un emploi régulier auprès d’une firme européenne', 'Pour participer à un tournoi sportif d’envergure internationale', ['langue', 'cours']),
            makeQuestion('Où habitait-elle pendant toute la durée de son séjour ?', `Elle résidait ${s.logPara}`, 'Elle séjournait dans une chambre d’hôtel quatre étoiles', 'Elle partageait l’appartement d’un collègue de son entreprise', [s.logKw]),
            makeQuestion('Quel aspect culturel a particulièrement surpris Carole ?', 'Les heures tardives des repas du soir et des promenades', 'Un climat hivernal anormalement rigoureux pour la saison', 'L’absence presque totale de transports en commun dans la cité', ['soupers', 'promenades']),
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
            makeQuestion('Quel événement le voisin raconte-t-il dans cet extrait ?', 'Une célébration d’anniversaire d’enfants mouvementée', 'Un déménagement familial précipité durant le week-end', 'Une panne d’électricité ayant interrompu une réunion de quartier', ['anniversaire', 'fête']),
            makeQuestion('Quel incident imprévu a perturbé l’activité extérieure ?', `${cap(s.incPara)}`, 'Une invasion soudaine de guêpes sur les tables du repas', 'Une coupure générale d’eau courante dans tout le secteur', [s.incKw]),
            makeQuestion('Comment les adultes ont-ils sauvé la fin de la fête ?', `${cap(s.repPara)}`, 'En reconduisant chaque jeune chez ses parents avant l’heure', 'En commandant une dizaine de pizzas livrées d’intervention prioritaire', [s.repKw]),
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
            makeQuestion('Quel problème principal a déclenché le stress des parents ?', 'Le retard prononcé de l’animateur engagé pour la fête', 'L’arrêt imprévu du four lors de la cuisson du gâteau', 'Le désistement de la moitié des camarades de classe invités', ['retard', 'animateur']),
            makeQuestion('Quelle solution d’urgence les parents ont-ils improvisée ?', `${cap(s.actPara)}`, 'Laisser les enfants jouer à des jeux vidéo sur ordinateur', 'Emmener l’ensemble du groupe au parc public le plus proche', [s.actKw]),
            makeQuestion('Quelle a été la réaction finale des enfants invités ?', 'Ils ont adoré le spectacle sans remarquer le contretemps', 'Ils ont réclamé avec insistance de rentrer chez eux', 'Ils ont quitté les lieux déçus avant la fin de l’activité', ['spectacle', 'enfants']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Séjour de randonnée dans les Rocheuses canadiennes
    Object.assign(
      (rand) => {
        const slots = [
          { parc: 'dans le parc de Banff', transport: 'une caravane louée', souvenir: 'la couleur turquoise des lacs glaciaires', transPara: 'une caravane de location pour dormir en nature', transKw: 'caravane' },
          { parc: 'dans le parc de Jasper', transport: 'une camionnette aménagée', souvenir: 'la rencontre avec une harde de wapitis', transPara: 'un véhicule utilitaire adapté au repos nocturne', transKw: 'camionnette' },
          { parc: 'dans les parcs de Yoho et Kootenay', transport: 'une petite tente de camping', souvenir: 'les sommets enneigés au lever du soleil', transPara: 'un abri de toile compact dressé sur le terrain', transKw: 'tente' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Martin ! Je voulais te raconter notre périple de dix jours ${s.parc}. On voyageait avec ${s.transport}, ce qui nous permettait de dormir en pleine nature chaque soir. Ce qui restera gravé dans ma mémoire, c’est ${s.souvenir}. Par contre, on a dû composer avec des nuits très fraîches : il a gelé deux fois au mois d’août ! Il fallait allumer le réchaud dès six heures du matin pour réchauffer le café et dégeler nos souliers de marche. Mais l’effort en valait tellement la peine. C’est le plus beau voyage de ma vie !`,
          questions: [
            makeQuestion('Où la collègue et son compagnon ont-ils passé leurs dix jours ?', 'Au cœur de réserves naturelles des Rocheuses de l’Ouest', 'Dans les grandes métropoles animées de la région atlantique', 'Dans une station balnéaire populaire du sud du continent', ['périple', 'nature']),
            makeQuestion('Quelle météo inattendue a surpris les randonneurs en août ?', 'Des nuits particulièrement froides accompagnées de gelée', 'Des pluies continues qui ont détrempé les chemins durant sept jours', 'Une chaleur étouffante qui a empêché toute marche en montagne', ['gelé', 'fraîches']),
            makeQuestion('Quel moyen d’hébergement itinérant utilisaient-ils ?', `Ils utilisaient ${s.transPara}`, 'Ils réservaient des chambres d’hôtel en ville chaque soir', 'Ils séjournaient dans des auberges luxueuses en bordure de route', [s.transKw]),
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
          text: `— Tu as des nouvelles de Clara ? — Oui ! ${s.soeur} a finalement décidé d’accepter l’offre d’emploi à temps partiel ${s.domaine}. Elle travaillera ${s.heures}, principalement les jeudis et vendredis. Même si le salaire total est moins élevé qu’un temps plein, c’était le compromis idéal pour terminer ${s.etudes}. Son employeur lui garantit des horaires stables et accepte d’aménager son horaire pendant ses examens de fin de session. Elle se sent tellement soulagée d’avoir pris cette décision après avoir hésité pendant des semaines !`,
          questions: [
            makeQuestion('Quelle décision professionnelle est expliquée ici ?', 'L’acceptation d’un contrat de travail à temps partiel', 'Le refus d’une promotion hiérarchique dans son entreprise', 'Une démission sans perspective d’un autre engagement', ['temps partiel', 'offre']),
            makeQuestion('Pourquoi ce poste à temps partiel convient-il particulièrement ?', `Pour lui permettre ${de(s.etudPara)}`, 'Pour lui offrir du temps libre afin de voyager à l’étranger', 'Parce qu’elle privilégie la réalisation d’actions bénévoles', [s.kw]),
            makeQuestion('Quel avantage l’employeur lui accorde-t-il pendant les examens ?', 'Des horaires adaptés durant les épreuves de fin de session', 'Une indemnité financière pour couvrir les coûts d’inscription', 'L’autorisation d’étudier ses manuels durant ses heures de garde', ['examens', 'horaire']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Temps partiel pour s'occuper d'un enfant
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Nadia', metier: 'de designer graphique', jours: 'trois jours par semaine', raison: 'passer plus de temps avec son bébé', raiPara: 'consacrer davantage de moments précieux à son jeune enfant', kw: 'bébé' },
          { amie: 'Camille', metier: 'de comptable adjointe', jours: 'quatre jours par semaine', raison: 'concilier sa vie de famille et ses cours', raiPara: 'mieux équilibrer sa vie familiale et la reprise de ses cours', kw: 'famille' },
          { amie: 'Julie', metier: 'de rédactrice de contenu', jours: 'trois jours par semaine', raison: 'prendre soin de sa mère convalescente', raiPara: 'veiller au quotidien sur sa mère convalescente', kw: 'mère' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— J’ai discuté avec ${s.amie} hier soir. Elle m’a expliqué pourquoi elle a choisi un contrat à temps partiel comme ${s.metier}. L’entreprise lui offrait un poste régulier de quarante heures, mais elle a insisté pour faire seulement ${s.jours}. Sa priorité absolue cette année, c’est de ${s.raison}. Elle a calculé son budget de manière serrée et a constaté qu’en réduisant certaines dépenses de loisir, elle pouvait très bien vivre ainsi. Elle préfère avoir du temps de qualité plutôt que d’accumuler du stress au quotidien.`,
          questions: [
            makeQuestion('Quel compromis l’amie a-t-elle choisi pour sa vie professionnelle ?', 'Adopter un horaire allégé pour préserver son quotidien', 'Cumuler deux emplois complémentaires la même semaine', 'Effectuer des heures supplémentaires chaque soir ouvrable', ['temps partiel', 'horaire']),
            makeQuestion('Quelle raison principale motive son choix d’horaire ?', `Le souhait de ${s.raiPara}`, 'Une clause obligatoire stipulée dans son entente syndicale', 'Une volonté explicite de réduire ses obligations fiscales', [s.kw]),
            makeQuestion('Comment a-t-elle adapté son quotidien pour compenser la baisse de salaire ?', 'En surveillant ses dépenses et en coupant dans les loisirs', 'En sollicitant un emprunt d’argent auprès de sa famille', 'En mettant en vente sa propriété pour habiter en colocation', ['dépenses', 'loisir']),
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
            makeQuestion('Quelle décision le propriétaire d’immeuble a-t-il prise ?', 'Bannir la présence des animaux pour les futurs baux', 'Hausser les loyers mensuels de vingt pour cent au renouvellement', 'Suspendre les baux pour lancer des travaux de rénovation majeurs', ['interdire', 'animaux']),
            makeQuestion('Quel dommage matériel dans un logement a motivé cette décision ?', `${cap(s.degPara)}`, 'Des carreaux de fenêtres fracturés dans les parties communes', 'Une tuyauterie de cuisine descellée provoquant une fuite d’eau', [s.degKw]),
            makeQuestion('Qu’arrive-t-il aux animaux des personnes qui habitent déjà là ?', 'Ils demeurent tolérés jusqu’au terme de leur entente actuelle', 'Leurs maîtres doivent les placer immédiatement dans un refuge', 'Leur présence est soumise à une pénalité financière mensuelle', ['baux', 'tolérés']),
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
            makeQuestion('Quelle est la décision adoptée lors de la réunion de gestion ?', `La restriction visant ${s.poiPara}`, 'L’interdiction définitive de fumer sur les balcons extérieurs', 'L’obligation de renouveler l’ensemble des serrures de palier', [s.kw]),
            makeQuestion('Quelle situation a particulièrement poussé à prendre cette décision ?', 'L’anxiété causée à des aînés croisés dans les ascenseurs', 'Une morsure sévère ayant exigé l’intervention des ambulanciers', 'La détérioration continue des plates-bandes végétalisées du parc', ['ascenseurs', 'peur']),
            makeQuestion('Que doivent faire les résidents qui possèdent déjà un animal ?', 'Remplir une fiche d’identification avant le premier mai', 'Verser un droit spécifique au bureau municipal de quartier', 'Fournir un carnet de vaccination visé par une clinique vétérinaire', ['formulaire', 'premier mai']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Refus d'une offre à temps plein pour préserver la santé
    Object.assign(
      (rand) => {
        const slots = [
          { collegue: 'Marc', employeur: 'une agence de publicité', heures: 'vingt-quatre heures', raison: 'd’éviter l’épuisement professionnel', raiPara: 'protéger son bien-être et prévenir le surmenage', kw: 'épuisement' },
          { collegue: 'Simon', employeur: 'un cabinet de consultants', heures: 'vingt heures', raison: 'de garder du temps pour ses projets créatifs', raiPara: 'conserver des plages pour ses projets personnels créatifs', kw: 'créatifs' },
          { collegue: 'Benoît', employeur: 'un laboratoire médical', heures: 'vingt-huit heures', raison: 'de prendre soin de sa santé fragile', raiPara: 'donner la priorité au maintien d’un bon état de santé', kw: 'santé' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Tu as su pour ${s.collegue} ? ${s.employeur[0].toUpperCase() + s.employeur.slice(1)} lui offrait un poste permanent à temps plein avec un salaire alléchant. Mais après mûre réflexion, il a décliné l’offre complète pour négocier un horaire de ${s.heures} par semaine. Il m’a confié que son but principal était ${s.raison}. Il avait vécu un épisode difficile il y a deux ans et il ne voulait absolument pas retomber dans le même piège de surcharge de travail. Son employeur a heureusement accepté sa proposition, car ses compétences techniques sont indispensables pour l’équipe.`,
          questions: [
            makeQuestion('Pourquoi le travailleur a-t-il refusé le poste à quarante heures ?', `Dans l’objectif de ${s.raiPara}`, 'Pour s’installer plusieurs mois à l’écart en campagne', 'Parce qu’une autre entreprise lui assurait un salaire doublé', [s.kw]),
            makeQuestion('Combien d’heures de travail par semaine a-t-il négociées ?', `Une formule contractuelle de ${s.heures} hebdomadaires`, 'Un horaire réduit fixé à une dizaine d’heures par semaine', 'Une charge hebdomadaire standard de trente-cinq heures', [s.heures]),
            makeQuestion('Quelle a été la réponse finale de l’employeur ?', 'Il a consenti à son aménagement à temps partiel', 'Il a rompu la relation contractuelle sans délai', 'Il lui a enjoint de solliciter un autre établissement', ['employeur', 'accepté']),
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
            makeQuestion('Quelle démarche administrative la collègue explique-t-elle ?', 'La transmission interne de justificatifs via le portail', 'La réservation d’un espace de conférence pour clients', 'La passation d’une commande de fournitures en magasin', ['intranet', 'formulaire']),
            makeQuestion('Dans quel format les fichiers doivent-ils être déposés ?', `Ils doivent être transmis ${s.formPara}`, 'Ils doivent être imprimés puis apportés en mains propres', 'Ils doivent être expédiés par simple messagerie texte', [s.formKw]),
            makeQuestion('Quelle est l’échéance pour soumettre la demande ?', `${s.delPara}`, 'La démarche doit obligatoirement être faite en 24 heures', 'Aucune limite dans le calendrier n’est imposée aux salariés', [s.delKw]),
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
            makeQuestion('Quelle procédure la collègue détaille-t-elle à son interlocuteur ?', 'L’acheminement formel d’une demande d’achat de matériel', 'L’évaluation semestrielle du rendement au sein du groupe', 'Le protocole de demande de congé pour motifs personnels', ['bon de commande', 'protocole']),
            makeQuestion('Quelle condition obligatoire permet de valider le bon de commande ?', `Recueillir ${s.signPara}`, 'Contacter directement par téléphone le fournisseur externe', 'Effectuer un paiement comptant préalable de la moitié du coût', [s.signKw]),
            makeQuestion('Où doit-on déposer le document papier une fois signé ?', `${s.bacPara}`, 'Le glisser sous la porte fermée du bureau de direction', 'Le remettre directement au transporteur lors de sa livraison', [s.bacKw]),
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
            makeQuestion('Quel paiement le colocataire apprend-il à effectuer sur son téléphone ?', 'Le règlement de sa quote-part de loyer via l’application', 'Le paiement mensuel de sa facture de consommation électrique', 'L’achat en ligne d’éléments d’ameublement pour le logement', ['loyer', 'interac']),
            makeQuestion('Quelle réponse de sécurité doit-on saisir dans l’application ?', `Il faut entrer ${s.secPara}`, 'La date de naissance exacte de votre propriétaire', 'Le numéro de cellulaire de votre colocataire en poste', [s.secKw]),
            makeQuestion('Que doit envoyer le locataire une fois la transaction terminée ?', 'Une preuve visuelle de l’écran de confirmation par texto', 'Un reçu officiel imprimé en trois exemplaires distincts', 'Un message officiel adressé au responsable de succursale', ['capture', 'texto']),
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
            makeQuestion('Quelle procédure est expliquée pour gérer les dépenses de la colocation ?', 'Le règlement d’une charge de logement sur l’outil bancaire mobile', 'La fermeture complète d’un compte auprès de l’établissement bancaire', 'L’ouverture d’une demande de crédit pour la caution de l’appartement', ['facture', 'bancaire']),
            makeQuestion('Quelle information faut-il taper pour ajouter le bénéficiaire ?', 'La référence de compte figurant sur le document papier', 'Les prénoms et noms de l’ensemble des résidents du bloc', 'Le courriel confidentiel du propriétaire de la bâtisse', ['numéro de compte', 'bénéficiaire']),
            makeQuestion('Quel avantage offre la programmation automatique du paiement ?', 'Prévenir tout retard et s’épargner des pénalités financières', 'Bénéficier d’une remise commerciale de dix pour cent sur la note', 'Engranger des récompenses fidélité sur sa carte de crédit privée', ['frais', 'retard']),
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
            makeQuestion('Quel dossier administratif le nouvel employé doit-il compléter ?', 'Les pièces d’embauche nécessaires à la gestion de la paie', 'Un dossier de mutation vers une filiale en région voisine', 'Une demande officielle d’octroi de jours de congé parental', ['dossier', 'embauche']),
            makeQuestion('Quel document doit-il numériser et joindre au formulaire ?', `Il est nécessaire de déposer ${s.piePara}`, 'Une attestation de bonne conduite signée par son voisinage', 'Un certificat d’aptitude remis par un médecin spécialiste', [s.pieKw]),
            makeQuestion('Dans quel délai doit-il accomplir toutes ces étapes ?', `${s.delPara}`, 'Le processus doit être mené dans un délai strict de trente jours', 'Les démarches doivent obligatoirement précéder sa probation', [s.delKw]),
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
          { amie: 'Karine', destination: 'en Gaspésie', activite: 'louer un chalet face au fleuve et voir les baleines', conseil: 'réserver avant la fin mars', conPara: 'effectuer ses réservations avant le terme du mois de mars', actKw: 'baleines', conKw: 'mars' },
          { amie: 'Sarah', destination: 'aux Îles-de-la-Madeleine', activite: 'faire du kayak le long des falaises rouges', conseil: 'acheter les billets de traversier très tôt', conPara: 'se procurer les passages sur le traversier sans tarder', actKw: 'kayak', conKw: 'traversier' },
          { amie: 'Émilie', destination: 'dans Charlevoix', activite: 'parcourir les sentiers de randonnée en montagne', conseil: 'prévoir des vêtements chauds pour le soir', conPara: 'emporter une tenue bien chaude pour les soirées fraîches', actKw: 'randonnée', conKw: 'vêtements' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Julie ! Avec ${s.amie}, on discutait de nos projets pour les vacances de juillet et on a pensé à toi. On te suggère vraiment de venir avec nous ${s.destination}. Notre plan, c’est de ${s.activite} et de découvrir les petits cafés locaux. C’est tellement reposant et dépaysant ! Par contre, ${s.amie} insiste sur un point crucial : il faut absolument ${s.conseil}, parce que les hébergements affichent complet très vite en haute saison. Prends le temps d’y penser cette semaine et dis-nous si l’aventure te tente !`,
          questions: [
            makeQuestion('Quelle proposition les amies font-elles pour l’été ?', `Une escapade estivale commune ${s.destination}`, 'Une session intensive d’anglais à suivre à Montréal', 'Un temps libre consacré à des travaux dans leur logement', ['vacances', 'juillet']),
            makeQuestion('Quelle activité principale prévoient-elles de faire sur place ?', 'Explorer les paysages et fréquenter de petits cafés typiques', 'Participer à une série de conférences sur les affaires régionales', 'Faire des achats dans les centres commerciaux des environs', ['cafés', 'découvrir']),
            makeQuestion('Quel conseil important l’amie donne-t-elle pour l’organisation ?', `${cap(s.conPara)}`, 'Attendre les réductions de fin de parcours en plein mois de juillet', 'Partir sans rien retenir afin de négocier son logement sur place', [s.conKw]),
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
          { parc: 'le parc national des Grands-Jardins', logement: 'des refuges rustiques en forêt', rando: 'l’ascension du mont du Lac-des-Cygnes', logPara: 'des cabanes écologiques simples implantées en forêt', logKw: 'refuges' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Allô Marc ! Si tu cherches des idées de vacances sans dépenser une fortune, mes copines et moi te conseillons ${s.parc}. On a testé la formule l’été dernier et c’était merveilleux. Tu peux réserver ${s.logement}, donc tu n’as pas besoin de transporter tout ton matériel de camping. Pendant la journée, la plus belle activité à faire, c’est ${s.rando}. N’oublie surtout pas d’apporter une bonne lotion contre les moustiques et une gourde d’eau réutilisable. Les réservations ouvrent ce samedi matin sur le site officiel de la Sépaq, alors sois prêt !`,
          questions: [
            makeQuestion('Quelle destination de plein air les amies recommandent-elles ?', 'Un séjour nature abordable dans un parc national du réseau', 'Un circuit touristique guidé à travers les capitales du monde', 'Une semaine complète tout inclus dans un complexe hôtelier du Sud', ['parc national', 'vacances']),
            makeQuestion('Quel hébergement pratique et économique suggèrent-elles ?', `${cap(s.logPara)}`, 'Une chambre spacieuse au sein d’un hôtel haut de gamme', 'Passer la nuit dans sa propre voiture sur le stationnement', [s.logKw]),
            makeQuestion('Quelle recommandation d’équipement pratique mentionnent-elles ?', 'Prévoir du répulsif à insectes et un récipient d’eau propre', 'Acheter des souliers neufs de course pour marcher en sentier', 'Prendre en location un véhicule tout-terrain pour circuler', ['moustiques', 'gourde']),
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
          { posture: 'l’écran à la hauteur exacte de vos yeux', pause: 'toutes les trente minutes', exercice: 'de rotations contrôlées du bassin', posPara: 'caler le moniteur informatique au niveau direct du regard', posKw: 'écran' },
          { posture: 'les pieds bien à plat sur le sol ou sur un repose-pied', pause: 'au moins une fois par heure', exercice: 'de flexions douces des genoux', posPara: 'poser les pieds à plat sur le plancher ou un appui stable', posKw: 'pieds' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Bonjour monsieur. Vos douleurs lombaires ont bien diminué, mais pour éviter toute rechute, vous devez adopter de nouvelles habitudes de travail. Quand vous travaillez à l’ordinateur, placez ${s.posture} pour maintenir la courbe naturelle de votre colonne. Ensuite, levez-vous ${s.pause} pour marcher quelques pas et activer la circulation sanguine. Chaque matin au lever, faites dix minutes ${s.exercice}. Surtout, évitez absolument de soulever des boîtes lourdes en pliant le dos : pliez toujours les genoux en gardant la charge près du corps.`,
          questions: [
            makeQuestion('Quel est le but des conseils donnés par le physiothérapeute ?', 'Prévenir la réapparition des douleurs dorsales au bureau', 'Préparer un athlète d’élite à une épreuve de course à pied', 'Enseigner le maniement sécuritaire d’un fauteuil de transport', ['lombaires', 'douleurs']),
            makeQuestion('Quel ajustement postural le spécialiste recommande-t-il au bureau ?', `Il est recommandé ${de(s.posPara)}`, 'S’asseoir directement au plancher sans recourir à un siège', 'Accomplir ses tâches en station debout toute la journée sans arrêt', [s.posKw]),
            makeQuestion('Que doit-on faire absolument pour soulever une charge lourde ?', 'Fléchir les genoux en maintenant l’objet contre son torse', 'Courber l’échine au maximum pour créer un effet de levier', 'Garder les jambes raides en penchant le torse vers l’avant', ['genoux', 'dos']),
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
            makeQuestion('Quels conseils professionnels la thérapeute formule-t-elle ?', 'Des gestes ciblés pour atténuer les raideurs au cou', 'Des recommandations alimentaires pour perdre du poids', 'Une prescription formelle d’analgésiques puissants', ['trapèzes', 'musculaire']),
            makeQuestion('Quelle méthode d’application locale est conseillée le soir ?', `${cap(s.accPara)}`, 'Prendre une douche très froide pendant une trentaine de minutes', 'Passer la nuit complète sans oreiller sous les vertèbres cervicales', [s.accKw]),
            makeQuestion('Quelle mauvaise habitude quotidienne faut-il absolument bannir ?', 'Tenir son appareil entre son oreille et son épaule', 'Porter son regard vers l’extérieur pendant les courtes pauses', 'Prendre de l’eau fraîche en travaillant devant son écran', ['cellulaire', 'oreille']),
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
          { region: 'dans les Laurentides', parcours: 'le célèbre parc linéaire du P’tit Train du Nord', halte: 'les anciennes auberges de gare aménagées pour cyclistes', parPara: 'l’ancienne voie ferroviaire transformée en piste pour cyclistes', regPara: 'Une boucle de vélo récréative au cœur des paysages des Laurentides', parKw: 'train du nord', halKw: 'auberges' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `— Salut Stéphane ! On sait que tu aimes le vélo de route, alors on te propose un beau voyage estival ${s.region}. On te suggère d’emprunter ${s.parcours}. C’est sécuritaire, presque entièrement plat et idéal pour pédaler à son rythme en contemplant la nature. Pour dormir, on te conseille ${s.halte}, qui offrent des ateliers pour réparer et ranger les bicyclettes en sécurité la nuit. Prépare bien deux sacoches imperméables et un nécessaire de réparation pour les crevaisons. Tu verras, c’est une façon formidable de déconnecter du travail pendant une semaine !`,
          questions: [
            makeQuestion('Quel genre de vacances les amies suggèrent-elles à Stéphane ?', `${s.regPara}`, 'Un stage d’alpinisme technique en haute altitude', 'Une fin de semaine de navigation à moteur sur les lacs', ['vélo', 'voyage']),
            makeQuestion('Quelle infrastructure cyclable recommande-t-on pour le trajet ?', `${cap(s.parPara)}`, 'Un circuit fermé d’entraînement dédié uniquement à la course', 'Une route provinciale dépourvue de bande réservée aux vélos', [s.parKw]),
            makeQuestion('Quel équipement pratique lui conseille-t-on de préparer ?', 'Deux sacoches étanches et une trousse de secours pour les crevaisons', 'Une lourde remorque de camping pour transporter des bagages', 'Un équipement complet de secours en cas de tempête hivernale', ['sacoches', 'crevaisons']),
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
            makeQuestion('De quel type de document officiel s’agit-il principalement ?', 'D’un contrat officiel de location pour un appartement', 'D’un état de compte pour des consommations impayées', 'D’une promesse unilatérale pour acquérir une maison', ['bail', 'logement']),
            makeQuestion('Quels services sont expressément inclus dans le loyer mensuel ?', `La redevance couvre ${s.serPara}`, 'Le paiement comprend un accès à un box de garage privé', 'Le bail garantit un approvisionnement en repas quotidiens', [s.serKw]),
            makeQuestion('Quelle modalité est exigée pour le versement du loyer ?', 'Un virement bancaire intervenant au premier jour du mois', 'Un versement hebdomadaire en liquide de la main à la main', 'Un paiement semestriel unique déposé auprès d’un notaire', ['virement', 'premier']),
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
            makeQuestion('Quel document le futur locataire lit-il ici ?', 'Une annexe détaillant les règles de son appartement', 'Une promesse formelle d’acquisition pour un immeuble', 'Une soumission d’entrepreneur pour refaire une cuisine', ['contrat', 'location']),
            makeQuestion('Quel aménagement complémentaire est compris avec le logement ?', `L’usage d’${s.staPara}`, 'Un branchement direct à un forfait Internet très rapide', 'Une formule de ménage complet assurée chaque vendredi', [s.staKw]),
            makeQuestion('Que doit fournir le locataire avant d’obtenir les clés ?', 'Une attestation valide d’assurance responsabilité civile', 'Une lettre de recommandation rédigée par son employeur', 'Un dépôt en garantie couvrant trois mensualités de loyer', ['assurance', 'responsabilité']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Bilan de festival de musique à Montréal
    Object.assign(
      (rand) => {
        const slots = [
          { festival: 'des Francos de Montréal', spectateurs: 'huit cent mille festivaliers', concerts: 'deux cent cinquante spectacles gratuits', conPara: 'Une vaste offre de concerts extérieurs sans frais d’accès', conKw: 'spectacles gratuits', cloture: 'célébrer la chanson francophone', orientPara: 'Une nouvelle édition consacrée aux artistes francophones', orientKw: 'francophone' },
          { festival: 'du Festival de jazz de Montréal', spectateurs: 'près d’un million d’amateurs', concerts: 'trois cents concerts sur les scènes extérieures', conPara: 'Une programmation riche déployée sur les scènes extérieures', conKw: 'scènes extérieures', cloture: 'célébrer les maîtres du jazz mondial', orientPara: 'Une programmation future centrée sur les talents du jazz', orientKw: 'jazz' },
          { festival: 'du Festival d’été de Québec', spectateurs: 'six cent mille spectateurs', concerts: 'deux cents représentations musicales variées', conPara: 'Un grand déploiement de prestations musicales diversifiées', conKw: 'représentations musicales', cloture: 'célébrer les artistes de la scène pop et rock', orientPara: 'Une programmation future axée sur les scènes pop et rock', orientKw: 'rock' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BILAN CULTUREL - SUCCÈS MAJEUR POUR LA MUSIQUE\nLa quarantième célébration ${s.festival} s’est clôturée dimanche sur une note formidable. Pendant dix jours sous le soleil, ${s.spectateurs} ont convergé vers le centre-ville. Les organisateurs célèbrent cette réussite populaire avec ${s.concerts} qui ont ravi un public familial. Les commerçants locaux soulignent des retombées économiques majeures pour les restaurants du secteur. Aucun incident n’a été rapporté par la police. Le comité organisateur donne déjà rendez-vous l’an prochain pour ${s.cloture} !`,
          questions: [
            makeQuestion('Quel est le sujet principal de cet article de journal ?', 'Le couronnement réussi d’une grande manifestation musicale', 'L’interruption d’un événement culturel sous de fortes pluies', 'Le conflit de travail persistant entre musiciens et agents', ['musique', 'festival']),
            makeQuestion('Quelle statistique illustre la grande réussite de l’événement ?', s.conPara, 'La commercialisation exclusive de billets à des tarifs élevés', 'La participation ponctuelle d’une unique vedette étrangère', [s.conKw]),
            makeQuestion('Quelle orientation est annoncée pour l’édition de l’année suivante ?', s.orientPara, 'La délocalisation de toutes les scènes vers la périphérie', 'L’abandon pur et simple des représentations en plein air', [s.orientKw]),
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
            makeQuestion('Quel événement culturel régional fait l’objet de ce bilan de presse ?', 'Un festival musical ayant battu son record d’affluence', 'Un concours de chant réservé aux étudiants de conservatoire', 'Une exposition itinérante sur les métiers d’autrefois', ['festival', 'région']),
            makeQuestion('Quelle nouveauté a particulièrement séduit les festivaliers ?', `${cap(s.nouPara)}`, 'Des feux d’artifice tirés à chaque heure de la nuitée', 'L’offre de repas gastronomiques gratuits à tous les visiteurs', [s.nouKw]),
            makeQuestion('À quoi serviront les profits générés par le festival ?', 'Au financement d’un fonds d’aide aux jeunes talents locaux', 'À l’acquisition de voitures de fonction pour la direction', 'À la construction d’une hôtellerie permanente sur la plage', ['bourses', 'musiciens']),
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
            makeQuestion('À qui s’adresse principalement cette offre de logement locatif ?', 'À des étudiants recherchant un hébergement adapté', 'À un ménage avec plusieurs enfants en bas âge', 'À une société en quête de locaux professionnels', ['bail', 'étudiant']),
            makeQuestion('Quel service de télécommunication est compris dans le bail ?', `${cap(s.intPara)}`, 'Un forfait de téléphonie cellulaire internationale illimité', 'Un abonnement sans frais à des bouquets de chaînes cinéma', [s.intKw]),
            makeQuestion('Quelle condition encadre la sous-location de ce studio ?', 'Obtenir impérativement l’accord formel et écrit du bailleur', 'Prévenir simplement le voisinage par un message affiché', 'Limiter cette occupation aux seules semaines de la relâche', ['sous-locataire', 'consentement']),
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
          { attraction: 'les croisières d’observation des baleines', paysage: 'des fjords spectaculaires aux falaises escarpées', village: 'le village historique de Tadoussac', attPara: 'des excursions maritimes pour contempler les baleines', attKw: 'baleines', vilKw: 'tadoussac' },
          { attraction: 'les sentiers panoramiques du parc national', paysage: 'des vallées profondes sculptées par la nature', village: 'le bourg côtier de La Malbaie', attPara: 'des pistes balisées offrant des vues imprenables', attKw: 'panoramiques', vilKw: 'la malbaie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `BROCHURE TOURISTIQUE OFFICIELLE - ÉVASION DANS CHARLEVOIX\nNiché ${s.paysage}, Charlevoix est une destination magnifique pour les amoureux de plein air. En parcourant cette région réserve mondiale de la biosphère, vous découvrirez ${s.attraction}, où des fromagers et des artisans passionnés vous accueillent. Faites une halte dans ${s.village}, réputé pour ses galeries d’art, ses bistros chaleureux et son patrimoine architectural préservé. Que vous choisissiez une randonnée au grand air ou un séjour douillet dans une auberge de charme, Charlevoix saura vous émerveiller en toute saison. Réservez votre séjour en ligne dès aujourd’hui !`,
          questions: [
            makeQuestion('Quel est l’objectif principal de cette brochure touristique ?', 'Mettre en valeur le patrimoine naturel et culturel régional', 'Avertir les résidents de l’arrivée de dépressions côtières', 'Dresser la chronique historique des premiers colons français', ['charlevoix', 'brochure']),
            makeQuestion('Quelle expérience est particulièrement mise en avant ?', `${cap(s.attPara)}`, 'Une compétition sportive de pêche au gros en haute mer', 'Une visite commentée d’installations pétrochimiques', [s.attKw]),
            makeQuestion('Pour quoi la municipalité mentionnée est-elle reconnue ?', 'Ses ateliers d’artisans et ses bâtiments patrimoniaux', 'Ses infrastructures aéroportuaires et ses foires d’affaires', 'Ses étendues de sable chaud bordées d’eaux tropicales', ['galeries', 'patrimoine']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Brochure touristique des Cantons-de-l'Est
    Object.assign(
      (rand) => {
        const slots = [
          { route: 'la célèbre Route des vins', activite: 'la cueillette des pommes dans les vergers ancestraux', mont: 'le mont Orford', actPara: 'l’autocueillette de fruits au cœur de vergers ancestraux', actKw: 'pommes', montKw: 'orford' },
          { route: 'le circuit des cœurs villageois', activite: 'la détente dans les spas nordiques en plein air', mont: 'le mont Brome', actPara: 'un moment de ressourcement dans des bains nordiques extérieurs', actKw: 'spas', montKw: 'brome' },
          { route: 'le Chemin des Cantons patrimonial', activite: 'la dégustation de bières de microbrasseries locales', mont: 'le mont Sutton', actPara: 'la découverte de bières artisanales brassées sur place', actKw: 'bières', montKw: 'sutton' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DU VISITEUR - LES TRÉSORS DES CANTONS-DE-L’EST\nÀ une heure de route de Montréal, les Cantons-de-l’Est invitent à la douceur de vivre et au dépaysement champêtre. Empruntez ${s.route} pour faire connaissance avec des producteurs locaux réputés. À l’automne, ne manquez pas ${s.activite}, une tradition vivante partagée en famille. Les adeptes de vélo et de marche trouveront leur bonheur sur les pentes entourant ${s.mont}, dont les panoramas sur les collines sont remarquables. Consultez notre carte interactive pour planifier votre circuit et découvrez nos forfaits vacances avantageux combinant nuitée et dégustations.`,
          questions: [
            makeQuestion('Quelle région touristique québécoise ce guide fait-il découvrir ?', 'Les paysages ruraux et les villages des Cantons-de-l’Est', 'Les paysages forestiers boréaux caractéristiques du grand nord québécois', 'La plaine agricole s’étendant au centre du pays', ['cantons-de-l’est', 'visiteur']),
            makeQuestion('Quelle activité automnale est recommandée aux familles ?', `${cap(s.actPara)}`, 'Des descentes en canot sur les rivières', 'Des compétitions de course à pied organisées chaque fin de semaine en forêt', [s.actKw]),
            makeQuestion('Quel attrait géographique offre des panoramas remarquables ?', 'Les sentiers pédestres balisés offrant des panoramas splendides autour du mont', 'Des sentiers côtiers longeant une immense plage de sable fin', 'Des sentiers de terre battue au fond d’une combe', ['panoramas', 'collines']),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Cérémonie de mariage d'une célébrité québécoise
    Object.assign(
      (rand) => {
        const slots = [
          { celebrite: 'la chanteuse populaire Marianne Lemieux', lieu: 'dans une chapelle historique de l’Île d’Orléans', tenue: 'une robe blanche en dentelle signée par un créateur d’ici', tenPara: 'une création blanche en dentelle conçue par un artisan d’ici', lieuPara: 'Au sein d’une vieille église sur l’Île d’Orléans', lieuKw: 'chapelle', tenKw: 'dentelle' },
          { celebrite: 'l’actrice renommée Béatrice Martel', lieu: 'dans un domaine viticole réputé des Laurentides', tenue: 'une élégante robe satinée aux reflets dorés', tenPara: 'une robe satinée aux nuances dorées d’une grande élégance', lieuPara: 'Au cœur d’un vignoble prestigieux des Laurentides', lieuKw: 'domaine', tenKw: 'satinée' },
          { celebrite: 'l’animatrice de télévision Sophie Leduc', lieu: 'au bord de l’eau dans un manoir du Bas-Saint-Laurent', tenue: 'une longue robe fluide bordée de broderies délicates', tenPara: 'une longue toilette vaporeuse rehaussée de fines broderies', lieuPara: 'Près des berges dans une vaste propriété bas-laurentienne', lieuKw: 'manoir', tenKw: 'broderies' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MAGAZINE ÉCHOS VEDETTES - REPORTAGE EXCLUSIF\nC’est dans une atmosphère féerique que s’est déroulé ce samedi le mariage de ${s.celebrite} avec son compagnon de longue date. La cérémonie intime s’est tenue ${s.lieu}, devant une centaine d’invités triés sur le volet. La mariée a ébloui l’assistance en portant ${s.tenue}. Après un échange de vœux émouvant qui a touché leurs proches, la fête s’est poursuivie avec un banquet champêtre mettant en valeur les produits du terroir québécois. Les amoureux ont ensuite dansé sous un ciel étoilé avant de couper le gâteau traditionnel.`,
          questions: [
            makeQuestion('Quel événement mondain ce magazine culturel relate-t-il ?', 'L’union intime d’une personnalité reconnue du milieu artistique', 'Le lancement d’un album de musique classique enregistré par un grand orchestre', 'La projection d’un documentaire historique primé', ['mariage', 'compagnon']),
            makeQuestion('Où s’est déroulée la cérémonie officielle d’échange des vœux ?', s.lieuPara, 'Dans une salle municipale polyvalente', 'Dans un amphithéâtre sportif au centre-ville', [s.lieuKw]),
            makeQuestion('Quelle attention particulière de la mariée a marqué les convives ?', `${cap(s.tenPara)}`, 'Une toilette sobre confectionnée par une boutique locale', 'Un habit traditionnel d’époque loué pour la fête', [s.tenKw]),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Mariage d'un célèbre sportif professionnel
    Object.assign(
      (rand) => {
        const slots = [
          { sportif: 'le capitaine de hockey Alexandre Roy', endroit: 'dans une auberge ancestrale de Charlevoix', cadeau: 'des dons à un organisme pour enfants défavorisés', cadPara: 'un groupe venant en aide aux enfants', cadKw: 'enfants' },
          { sportif: 'le patineur médaillé Maxime Tremblay', endroit: 'dans une grange patrimoniale restaurée en Estrie', cadeau: 'des contributions à une fondation de recherche médicale', cadPara: 'la recherche médicale québécoise', cadKw: 'médicale' },
          { sportif: 'le joueur étoile David Desbiens', endroit: 'dans un verger privé au pied du mont Saint-Hilaire', cadeau: 'le financement d’équipements sportifs scolaires', cadPara: 'l’achat de matériel sportif scolaire', cadKw: 'équipements sportifs' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE CÉLÉBRITÉS - UNION HIVERNALE AUX SAVEURS D’ICI\nCe week-end, ${s.sportif} a uni sa destinée à celle de sa conjointe ${s.endroit}. Entourés de leurs coéquipiers et de leurs familles, les amoureux ont célébré leur union dans un décor rustique. Au lieu des traditionnels présents de mariage, le couple a invité ses convives à faire ${s.cadeau}. Les invités ont savouré un repas inspiré des cabanes à sucre traditionnelles, avec de la tire sur la neige servie en fin de soirée. Un moment magique et authentique que le couple et leurs invités chériront longtemps !`,
          questions: [
            makeQuestion('De quelle célébration d’envergure l’article fait-il le récit ?', 'Du mariage chaleureux d’un athlète professionnel québécois', 'D’un hommage marquant le départ en retraite d’un entraîneur', 'D’une soirée commémorant une victoire en championnat de hockey', ['sportif', 'mariage']),
            makeQuestion('Quel geste charitable les mariés ont-ils demandé à leurs invités ?', `Offrir des contributions au profit de ${s.cadPara}`, 'Fabriquer eux-mêmes les tables et chaises du banquet', 'Prendre en charge l’achat de tous les meubles requis pour accueillir les invités', [s.cadKw]),
            makeQuestion('Quelle surprise gourmande a clôturé la soirée de mariage ?', 'De la tire d’érable servie sur la neige en plein air', 'Un assortiment de poissons et fruits de mer importés', 'Une pièce montée chocolatée parée de fruits exotiques', ['tire', 'neige']),
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
            makeQuestion('Quelle région maritime du Québec ce dépliant décrit-il ?', 'La péninsule côtière gaspésienne et ses grands espaces', 'L’archipel urbain s’étendant autour de la métropole', 'La plaine agricole s’étirant au cœur de la province', ['gaspésie', 'dépliant']),
            makeQuestion('Quel site naturel ou faunique emblématique est mis à l’honneur ?', `${cap(s.symPara)}`, 'Une pyramide de pierre édifiée au siècle précédent', 'Une centrale hydroélectrique interdite aux curieux', [s.symKw]),
            makeQuestion('Quel mets culinaire typique est proposé dans les auberges ?', 'Des crustacés frais et des potages marins traditionnels', 'Des pièces de viande rouge importées par transport aérien', 'Des barquettes de plats préparés et réchauffés au four', ['homard', 'chaudrées']),
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
            makeQuestion('Quel est le sujet principal de ce billet de blogue de voyage ?', 'Le carnet d’une traversée ferroviaire du pays en duo', 'Une recension critique des prestations d’un hôtel urbain', 'Une campagne participative pour soutenir un projet d’art', ['ferroviaire', 'voyage']),
            makeQuestion('Quel contretemps sur les voies a prolongé le trajet ?', `${cap(s.retPara)}`, 'Une panne générale d’énergie touchant l’ensemble des rames', 'La disparition des bagages de cabine durant une manœuvre', [s.retKw]),
            makeQuestion('Quelle est la prochaine destination prévue par le couple ?', 'Une traversée maritime par bateau vers l’île voisine', 'Un vol sans escale de retour vers leur ville de départ', 'Un séjour d’une semaine dans une cabane non chauffée', ['traversier', 'vancouver']),
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
          text: `CARNET D’AVENTURE - RETOUR DE NOTRE SÉJOUR EN NATURE\nNous revoilà en ligne après ${s.duree} en forêt ! Avec mon conjoint, nous avons pagayé sur ${s.plan}. Le silence matinal sur l’eau et le chant des oiseaux resteront gravés dans nos mémoires pour toujours. Évidemment, une belle expédition comporte ses imprévus : nous avons essuyé ${s.mesaventure}. Heureusement, grâce à notre trousse de survie et à un feu de camp, nous avons séché nos affaires dans la bonne humeur. Pour tous ceux qui hésitent : préparez votre équipement et sautez à l’eau !`,
          questions: [
            makeQuestion('Quelle expérience vécue les blogueurs partagent-ils ?', 'Une randonnée nautique en autonomie de plusieurs jours', 'L’acquisition d’une résidence secondaire près d’un axe routier', 'Le suivi d’un stage professionnel pour devenir guide de plein air', ['canot', 'forêt']),
            makeQuestion('Quel désagrément matériel a marqué leur périple ?', `${cap(s.mesPara)}`, 'La perte de leur canot emporté au loin par les flots d’un torrent', 'Une atteinte corporelle sévère exigeant une évacuation par les airs', [s.mesKw]),
            makeQuestion('Comment ont-ils réagi face à ce contretemps ?', 'En surmontant l’épreuve avec bonne humeur autour du feu', 'En alertant sans attendre les équipes de secours forestier', 'En abandonnant sur place leur équipement pour regagner la route', ['feu', 'affaires']),
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
            makeQuestion('Quel incident de quartier est décrit dans cette publication ?', 'Une rupture d’aqueduc entraînant une coupure d’eau potable', 'Une interruption électrique causée par de violentes rafales', 'Une série d’effractions commises dans des commerces du secteur', ['eau', 'conduite']),
            makeQuestion('Comment la solidarité entre résidents s’est-elle manifestée ?', `En choisissant ${de(s.solPara)}`, 'En barrant l’accès à la rue pour alerter les automobilistes', 'En tentant de colmater eux-mêmes les bris de canalisation', [s.solKw]),
            makeQuestion('Quelle mesure municipale temporaire a été mise en place ?', 'Un approvisionnement en eau potable devant le dépanneur', 'Un hébergement gratuit pour tous les occupants à l’hôtel', 'L’annulation des taxes municipales pour l’ensemble de l’année', ['bouteilles', 'dépanneur']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Incident d'arbre tombé dans la ruelle
    Object.assign(
      (rand) => {
        const slots = [
          { ruelle: 'entre les rues Masson et Dandurand', orage: 'de violentes rafales de vent hier soir', degat: 'a arraché deux fils téléphoniques et bloqué trois garages', degPara: 'des fils téléphoniques rompus et des accès de garages obstrués', degKw: 'garages' },
          { ruelle: 'derrière la rue Saint-Hubert', orage: 'd’un orage d’été avec de fortes averses', degat: 'est tombé sur une clôture en bois et obstrue le passage', degPara: 'une palissade de bois endommagée et la circulation piétonne bloquée', degKw: 'clôture' },
          { ruelle: 'au sud de l’avenue du Mont-Royal', orage: 'd’un coup de vent soudain en fin d’après-midi', degat: 'a écrasé un cabanon de jardin sans faire de blessé', degPara: 'la destruction d’un abri de jardin sans occasionner de blessures', degKw: 'cabanon' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FORUM DES HABITANTS - RUELLE SÉCURITÉ ET ENTRAIDE\nPetit retour sur les événements survenus dans notre ruelle ${s.ruelle}. À la suite ${s.orage}, un grand saule s’est abattu en travers du chemin. L’arbre ${s.degat}. Heureusement, aucun passant ne circulait à cet instant. Avant même l’arrivée des équipes municipales d’urgence, plusieurs voisins ont sorti leurs scies pour dégager l’accès aux piétons. Merci à Patrick d’avoir installé des cônes de signalisation. La ville ramassera les branches dès demain matin. Soyez prudents à vélo dans le secteur !`,
          questions: [
            makeQuestion('Quel événement imprévu dans la ruelle est rapporté ?', 'La chute d’un grand arbre provoquée par de fortes bourrasques', 'Une fuite de gaz ayant nécessité l’évacuation des logements', 'La tenue sans permis d’un rassemblement festif sur la voie', ['arbre', 'ruelle']),
            makeQuestion('Quel dommage matériel direct cette chute a-t-elle causé ?', `${cap(s.degPara)}`, 'L’écroulement d’un mur mitoyen sur un immeuble de trois étages', 'La destruction de trois véhicules stationnés le long du trottoir', [s.degKw]),
            makeQuestion('Quelle action collective spontanée les voisins ont-ils entreprise ?', 'Découper des branchages pour libérer le passage des piétons', 'Faire appel aux forces policières pour établir un constat écrit', 'Quitter temporairement leurs logements pour loger chez des proches', ['scies', 'piétons']),
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
            makeQuestion('Quelle expérience hivernale ce couple partage-t-il sur son blogue ?', 'Une randonnée sur plusieurs jours en motoneige au Saguenay', 'Une participation à un concours officiel de slalom en ski', 'Une démarche d’acquisition immobilière dans les Laurentides', ['motoneige', 'saguenay']),
            makeQuestion('Où les motoneigistes trouvaient-ils refuge pour la soirée ?', `Ils logeaient ${s.etaPara}`, 'Ils dormaient sous la tente sans équipement de chauffage', 'Ils revenaient chaque soir séjourner dans un grand hôtel urbain', [s.etaKw]),
            makeQuestion('Quel projet hivernal le couple envisage-t-il déjà pour l’an prochain ?', 'Explorer les grands espaces de la Côte-Nord en motoneige', 'Céder tout leur matériel motorisé pour demeurer en ville', 'Séjourner durant la saison froide dans un pays ensoleillé', ['côte-nord', 'hiver']),
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
            makeQuestion('Quelle décision importante l’amie annonce-t-elle par message ?', 'L’acceptation d’un contrat au sein d’un organisme social', 'Une inscription à temps plein dans un programme universitaire', 'Un départ précipité pour s’établir de façon permanente en région', ['contrat', 'poste']),
            makeQuestion('Quelle raison principale a fait pencher la balance en faveur de ce poste ?', 'La concordance avec ses valeurs et la mission sociale du groupe', 'Une rémunération deux fois supérieure à celle des autres postes', 'L’absence de supervision hiérarchique au sein de la structure', ['mission', 'sociale']),
            makeQuestion('Quel avantage pratique du quotidien la réjouit particulièrement ?', `${cap(s.avPara)}`, 'Une voiture de fonction haut de gamme mise à disposition', 'Des séjours professionnels assurés mensuellement à l’étranger', [s.avKw]),
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
            makeQuestion('Quelle orientation de carrière est partagée par l’amie ?', 'L’acceptation d’un engagement dans le réseau éducatif', 'Une embauche comme commis comptable au sein d’une banque', 'Un contrat de gérance dans un magasin de vêtements du quartier', ['poste', 'offre']),
            makeQuestion('Pourquoi cette embauche représente-t-elle un grand soulagement ?', `Elle lui assure ${s.raiPara}`, 'Elle n’exige qu’une dizaine d’heures de présence par mois', 'Elle lui permet d’œuvrer sans aucun contact avec le public', [s.raiKw]),
            makeQuestion('Quand doit-elle commencer officiellement son nouvel emploi ?', 'Dès le début de la semaine suivante suite à son embauche', 'Dans trois mois après une longue période de repos estival', 'Au cours de l’automne prochain lors de la rentrée scolaire', ['lundi', 'poste']),
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
            makeQuestion('Quel est l’objet principal de ce courriel professionnel ?', 'La justification polie d’un empêchement à une activité interne', 'Une demande formelle d’augmentation de traitement salarial', 'Une démission sans préavis suite à un désaccord dans le service', ['insertion', 'absence']),
            makeQuestion('Quelle contrainte professionnelle majeure justifie cette absence ?', `${cap(s.motPara)}`, 'Une invitation personnelle à disputer une partie de golf récréative', 'Une coupure de connexion Internet survenue à son domicile privé', [s.motKw]),
            makeQuestion('Quelle aide concrète le collègue propose-t-il d’apporter malgré tout ?', `Il offre de ${s.offPara}`, 'Régler personnellement l’ensemble des frais de bouche de la journée', 'Rémunérer à ses frais un travailleur temporaire pour la journée', [s.offKw]),
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
          { expediteur: 'Guillaume Simard', obligation: 'une soutenance universitaire obligatoire pour mon diplôme', compensation: 'animer la rencontre virtuelle de suivi la semaine prochaine', oblPara: 'une obligation universitaire fixée de longue date pour son diplôme', comPara: 'coordonner la réunion de suivi prévue en ligne la semaine suivante', oblKw: 'diplôme', comKw: 'virtuelle' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE ÉLECTRONIQUE INTERNE\nDe : ${s.expediteur}\nÀ : Direction des ressources humaines\nObjet : Absence à l’activité d’intégration\nChers collègues,\nJe tiens à vous aviser que je ne pourrai malheureusement pas me joindre à vous ce vendredi pour l’accueil des nouveaux employés. J’ai ${s.obligation}, une démarche fixée de longue date que je ne peux reporter. Je regrette sincèrement de manquer cette occasion d’échanger avec nos nouvelles recrues. Afin de soutenir le groupe malgré tout, je m’engage à ${s.compensation} avant mercredi midi. Merci beaucoup pour votre compréhension et bonne journée d’accueil à tous !`,
          questions: [
            makeQuestion('Pourquoi l’employé écrit-il ce message à la direction ?', 'Pour exposer les motifs de son absence à l’accueil des recrues', 'Pour officialiser son embauche auprès d’une entreprise concurrente', 'Pour demander une indemnité de transport pour son itinéraire', ['absence', 'intégration']),
            makeQuestion('Quelle raison impérative empêche sa présence ce vendredi ?', `${cap(s.oblPara)}`, 'Une réservation de vacances organisée au dernier moment', 'Un défaut d’inscription de la date sur son agenda personnel', [s.oblKw]),
            makeQuestion('Quelle solution alternative l’employé propose-t-il pour s’impliquer ?', `Il s’engage à ${s.comPara}`, 'Refuser de répondre aux courriels des nouveaux arrivants', 'Transférer définitivement l’ensemble de ses dossiers à un pair', [s.comKw]),
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
            makeQuestion('Quelle décision majeure l’amie partage-t-elle dans ce message ?', 'Son choix d’accepter un travail et d’aller s’établir en région', 'Son refus de quitter son logement situé au cœur de Montréal', 'L’achat d’une maison de villégiature pour ses fins de semaine', ['poste', 'région']),
            makeQuestion('Quel facteur principal a motivé son départ vers sa nouvelle ville ?', `${cap(s.cadPara)}`, 'L’assurance d’exercer un emploi exempt de toute responsabilité', 'Une décision obligatoire rendue par son association corporative', [s.cadKw]),
            makeQuestion('Quelle aide concrète son nouvel employeur lui accorde-t-il ?', 'Une allocation pour faciliter les frais de son déménagement', 'Le paiement complet de ses droits universitaires passés', 'L’acquisition d’un logement complet dans sa municipalité d’accueil', ['déménagement', 'financière']),
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
            makeQuestion('Quelle démarche citoyenne ce guide gouvernemental explique-t-il ?', 'La communication d’une nouvelle adresse aux ministères provinciaux', 'La demande de délivrance d’un passeport de voyage à l’étranger', 'La transmission de la déclaration fiscale annuelle de revenus', ['changement', 'adresse']),
            makeQuestion('Quelle information personnelle doit-on saisir à la seconde étape ?', 'La combinaison identifiante officielle requise par le portail', 'Les coordonnées bancaires complètes de sa carte de paiement', 'L’adresse courriel personnelle de son propriétaire de logement', ['identité', 'saisissant']),
            makeQuestion('Que doit conserver le citoyen à la fin de la démarche en ligne ?', `${cap(s.conPara)}`, 'Une attestation timbrée expédiée par voie postale sous pli fermé', 'Un formulaire manuscrit signé devant un officier public', [s.conKw]),
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
          { document: 'votre dossier de conducteur automobile', service: 'sur l’espace client sécurisé de la SAAQ', avis: 'une nouvelle étiquette autocollante d’adresse', aviPara: 'un autocollant officiel d’adresse à poser sur son permis', aviKw: 'autocollante' },
          { document: 'vos pièces d’immatriculation de véhicule', service: 'sur le portail citoyen gouvernemental', avis: 'un message dans votre boîte de réception sécurisée', aviPara: 'une notification officielle dans son espace de réception', aviKw: 'réception' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE D’UTILISATION - DOSSIER CONDUCTEUR SAAQ\nLa loi exige d’aviser la Société de l’assurance automobile dans les trente jours suivant un déménagement pour ${s.document}. Voici la démarche. Connectez-vous d’abord ${s.service}. Rendez-vous dans la section « Coordonnées » et cliquez sur « Modifier mon adresse ». Entrez votre nouveau code postal et votre numéro de logement. Vérifiez l’exactitude des données et validez la transaction. Vous recevrez ${s.avis}. Si votre ancienne adresse figure encore sur vos pièces après trente jours, vous risquez une amende lors d’un contrôle routier.`,
          questions: [
            makeQuestion('Dans quel délai un citoyen doit-il mettre à jour son adresse à la SAAQ ?', 'Dans les trente jours consécutifs à son changement de domicile', 'Durant les quarante-huit heures suivant l’entrée dans les lieux', 'Au terme d’une période maximale d’une année civile complète', ['trente jours', 'déménagement']),
            makeQuestion('Où doit-on se connecter pour faire cette modification par Internet ?', 'Sur le portail officiel désigné pour la gestion du profil', 'Auprès du site promotionnel d’un distributeur d’automobiles', 'Sur la page officielle des réseaux de la surveillance policière', ['connectez-vous', 'section']),
            makeQuestion('Que reçoit le conducteur après avoir validé son changement en ligne ?', `${cap(s.aviPara)}`, 'Une contravention forfaitaire pour usage du service numérique', 'Une convocation obligatoire à repasser l’examen théorique du code', [s.aviKw]),
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure d'installation d'une imprimante Wi-Fi
    Object.assign(
      (rand) => {
        const slots = [
          { modele: 'l’imprimante multifonction sans fil', reseau: 'à votre réseau Wi-Fi domestique', bouton: 'le bouton Wi-Fi pendant trois secondes', test: 'imprimer une page de test pour vérifier la qualité', tesPara: 'lancer l’impression d’un feuillet d’essai pour juger du rendu', tesKw: 'page de test' },
          { modele: 'l’imprimante laser noir et blanc', reseau: 'au réseau Internet local du bureau', bouton: 'la touche WPS de votre routeur', test: 'lancer l’impression du document d’accueil', tesPara: 'lancer le tirage du feuillet de présentation fourni par le logiciel', tesKw: 'document d’accueil' },
          { modele: 'l’appareil à jet d’encre couleur', reseau: 'à votre connexion sans fil personnelle', bouton: 'l’icône Réseau sur l’écran tactile', test: 'exécuter l’alignement des têtes d’impression', tesPara: 'procéder au calibrage mécanique des têtes d’impression', tesKw: 'têtes d’impression' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `GUIDE DE DÉMARRAGE - INSTALLATION D’IMPRIMANTE\nPour configurer ${s.modele} sur votre ordinateur, suivez ces instructions. 1. Branchez le cordon d’alimentation et allumez l’appareil. 2. Connectez l’imprimante ${s.reseau} en maintenant enfoncé ${s.bouton}. 3. Sur votre ordinateur, ouvrez les « Paramètres », cliquez sur « Imprimantes », puis sélectionnez « Ajouter un appareil ». Votre ordinateur détectera automatiquement l’imprimante. 4. Téléchargez le pilote recommandé et terminez en prenant soin ${de(s.test)}. En cas d’erreur de détection, redémarrez votre routeur avant de réessayer.`,
          questions: [
            makeQuestion('Quel équipement informatique ce guide aide-t-il à installer ?', 'Une nouvelle imprimante sans fil reliée à son ordinateur', 'Un moniteur d’ordinateur haute définition pour les loisirs', 'Un ensemble clavier et pavé tactile sans liaison filaire', ['imprimante', 'configurer']),
            makeQuestion('Quelle manipulation permet de connecter l’imprimante au réseau ?', 'Appuyer de façon prolongée sur la commande réseau indiquée', 'Déconnecter puis réinsérer le câble d’alimentation dix fois', 'Maintenir enfoncée la touche de majuscule sur son clavier', ['maintenant', 'enfoncé']),
            makeQuestion('Quelle action finale permet de valider le bon fonctionnement ?', `Il convient de ${s.tesPara}`, 'Laisser le matériel hors tension durant une journée entière', 'Mettre en vente immédiate son ancien équipement sur Internet', [s.tesKw]),
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
            makeQuestion('Quelle méthode de raccordement de l’imprimante est détaillée ici ?', 'Une liaison par câble informatique direct entre les deux appareils', 'Un raccordement distant par antenne satellitaire de longue portée', 'Une synchronisation par signal Bluetooth de faible puissance', ['imprimante', 'câble usb']),
            makeQuestion('Que faut-il faire avant de brancher le câble physique ?', 'Installer d’abord le programme téléchargé sur la page de soutien', 'Remplacer la carte maîtresse de son ordinateur de travail', 'Procéder au formatage du système de stockage de la machine', ['logiciel', 'brancher']),
            makeQuestion('Quel élément de protection doit-on enlever au début ?', `Il faut ${s.carPara}`, 'Dévisser le verre de protection du numériseur de documents', 'Couper le câble d’alimentation permanente de l’équipement', [s.carKw]),
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
            makeQuestion('Quelle opération de gestion ce tutoriel permet-il de réaliser ?', 'Actualiser ses coordonnées personnelles sur son portail bancaire', 'Constituer un dossier de prêt hypothécaire pour un bien immobilier', 'Créer un compte d’affaires dédié à une entreprise commerciale', ['coordonnées', 'sécurité']),
            makeQuestion('Quel moyen de sécurité est utilisé pour confirmer l’identité ?', `${cap(s.secPara)}`, 'Une entrevue visuelle imposée avec le gestionnaire de succursale', 'La visite au domicile d’un mandataire de sécurité financière', [s.secKw]),
            makeQuestion('Quand les modifications enregistrées prennent-elles effet ?', 'Dès la validation de l’étape de confirmation de sécurité', 'Au terme d’un délai d’examen de trente jours ouvrables', 'Exclusivement lors de l’ouverture du prochain exercice civil', ['valider', 'immédiatement']),
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
            makeQuestion('Quel est le thème des suggestions partagées dans ce courriel ?', 'Des propositions saines d’en-cas scolaires pour enfants', 'Un menu d’invitation complet préparé pour un repas d’adultes', 'Une liste d’effets vestimentaires chauds pour la rentrée', ['collations', 'école']),
            makeQuestion('Quelle collation maison l’amie prépare-t-elle le dimanche ?', `${cap(s.colPara)}`, 'Des beignets industriels nappés d’un épais sirop de sucre', 'Des portions de croustilles industrielles frites et très salées sorties du sachet', [s.colKw]),
            makeQuestion('Quelle consigne scolaire rappelle-t-elle pour la sécurité ?', 'L’absence de certains allergènes alimentaires pour préserver la santé des élèves', 'L’obligation formelle de ne consommer que des aliments chauds', 'L’interdiction d’apporter des bouteilles d’eau dans les salles', ['allergènes', 'école']),
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
          { maman: 'Mélanie', snack: 'des galettes moelleuses aux pommes et graines de lin', salade: 'des pointes de pita complet avec du guacamole', conseil: 'd’impliquer les enfants pour leur donner envie de goûter', snaPara: 'des galettes tendres préparées avec des pommes et du lin', snaKw: 'pommes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE AMICAL - ASTUCES COLLATIONS GARDERIE\nDe : ${s.maman} Tremblay\nÀ : Julie Fortin\nObjet : Recommandations de collations saines pour la garderie !\nAllô Julie ! Comme promis, voici mes conseils pour les collations de nos tout-petits. Pour remplacer les biscuits trop sucrés de l’épicerie, j’ai adopté ${s.snack}. Les enfants adorent la texture et ça leur donne une énergie durable sans coup de fatigue. J’accompagne toujours le tout avec ${s.salade}. Mon astuce préférée pour le matin : ${s.conseil}. Ça prend vingt minutes le dimanche et ta semaine est prête. Essaie ça et donne-m’en des nouvelles au parc !`,
          questions: [
            makeQuestion('Quel est le principal objectif des conseils culinaires partagés ?', 'Privilégier des options saines aux produits sucrés du commerce', 'Organiser un buffet d’anniversaire très copieux rassemblant vingt enfants d’âge préscolaire', 'Apprendre à cuisiner des repas complets', ['collations', 'garderie']),
            makeQuestion('Quelle collation nutritive maison propose-t-elle pour les enfants ?', `${cap(s.snaPara)}`, 'Des barres de chocolat au lait achetées au magasin', 'Des collations très salées et grasses issues des rayons de dépanneur d’autoroute', [s.snaKw]),
            makeQuestion('Quelle astuce d’organisation pratique recommande-t-elle ?', 'S’avancer le dimanche pour préparer l’ensemble des collations saines de la semaine', 'Se procurer des collations jetables sous emballage individuel', 'Compter sur le service de garde pour nourrir les enfants', ['dimanche', 'astuce']),
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
            makeQuestion('Quel est le thème principal de cette page Web d’information ?', 'Des mesures pour modérer sa dépense d’énergie liée à l’eau chaude', 'Un guide pour choisir une nouvelle thermopompe de climatisation', 'Une procédure de déclaration suite à une coupure de courant', ['eau chaude', 'facture']),
            makeQuestion('Quel équipement économiseur d’eau chaude est recommandé ?', `${cap(s.proPara)}`, 'Une piscine chauffée en permanence dans sa cour arrière privée', 'Un second réservoir de chauffe-eau réservé aux visiteurs', [s.proKw]),
            makeQuestion('Quelle température idéale est recommandée pour le réservoir ?', 'Un maintien stable du réservoir à soixante degrés Celsius', 'Un abaissement du chauffe-eau à vingt degrés pour économiser', 'Une température maximale de cent degrés pour stériliser', ['soixante degrés', 'chauffe-eau']),
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
            makeQuestion('Que conseille cet article aux occupants de logements ?', 'Poser des éléments de plomberie limitant le débit d’eau chaude', 'Renouveler toute la tuyauterie de sa bâtisse avec du cuivre neuf', 'Creuser un point d’eau individuel dans son jardin de banlieue', ['consommation', 'plomberie']),
            makeQuestion('Quel accessoire de plomberie économe est valorisé ?', `${cap(s.disPara)}`, 'Une pompe surpuissante augmentant le débit pour rincer plus vite', 'Un raccord électronique nécessitant le concours d’un technicien', [s.disKw]),
            makeQuestion('Comment peut-on parfois obtenir ces équipements sans frais ?', 'Par l’entremise de trousses remises par son administration locale', 'En participant à un tirage au sort commercial diffusé en ligne', 'En effectuant d’abord l’achat de plusieurs gros appareils neufs', ['municipale', 'trousses']),
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Courriel collations santé pour le sport
    Object.assign(
      (rand) => {
        const slots = [
          { entraineur: 'Sophie', collation: 'des quartiers d’orange et des galettes à l’avoine', boisson: 'de l’eau fraîche dans une gourde bien identifiée', colPara: 'des portions d’orange associées à des galettes d’avoine', colKw: 'orange' },
          { entraineur: 'Valérie', collation: 'des raisins sans pépins et des morceaux de fromage', boisson: 'une eau fraîche infusée avec du citron et de la menthe', colPara: 'des raisins frais accompagnés de cubes de fromage', colKw: 'raisins' },
          { entraineur: 'Chantal', collation: 'des bananes mûres et des barres tendres maison', boisson: 'de l’eau plate sans ajout de sucre ni de jus', colPara: 'des bananes complétées de barres tendres faites maison', colKw: 'bananes' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MESSAGE DU CLUB SPORTIF - COLLATIONS TOURNOI DE SOCCER\nDe : ${s.entraineur} Roy, entraîneuse jeunesse\nÀ : Parents des joueurs de la ligue récréative\nObjet : Recommandations nutritionnelles pour le tournoi\nChers parents,\nEn vue de notre tournoi de soccer de samedi, voici quelques suggestions pour garder nos jeunes sportifs en forme. Entre deux matchs intenses, privilégiez ${s.collation}. Les glucides naturels aident à reconstituer l’énergie sans alourdir la digestion. Pour l’hydratation, la seule boisson nécessaire est ${s.boisson}. Évitez les boissons énergisantes et les jus très sucrés qui causent des maux de ventre pendant l’effort. Merci de votre précieuse collaboration et bon match à tous !`,
          questions: [
            makeQuestion('Quel est l’objectif de cette note transmise par l’entraîneuse ?', 'Conseiller des en-cas équilibrés pour des jeunes lors d’un tournoi', 'Reporter l’ensemble des parties disputées à l’extérieur en raison des fortes pluies', 'Réclamer le versement des droits d’adhésion', ['tournoi', 'collations']),
            makeQuestion('Quelle collation est recommandée entre deux matchs intenses ?', `${cap(s.colPara)}`, 'Des sachets de bonbons du commerce', 'Des portions de frites chaudes très grasses servies avec une sauce salée', [s.colKw]),
            makeQuestion('Quelle boisson doit-on privilégier pour l’hydratation des joueurs ?', 'De l’eau potable fraîche sans aucun ajout de sucre raffiné ou de jus commercial', 'Des boissons stimulantes pour coureurs d’endurance', 'Des sodas gazéifiés et fortement enrichis en caféine', ['eau', 'boisson']),
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
            retardDist1: 'Déposer un mot manuscrit d’explication directement au secrétariat avant neuf heures',
            retardDist2: 'Téléphoner au responsable du centre éducatif après dix heures lors de la pause du matin',
            allergieAns: 'Bannir des repas tout ingrédient comprenant des arachides ou des noix',
            allergieDist1: 'Obliger les familles à fournir un repas chaud préparé par un traiteur externe certifié',
            allergieDist2: 'Interdire formellement tout produit laitier ou contenant du gluten lors du dîner',
            evidenceRetard: ['huit', 'heures', 'trente'],
            evidenceAllergie: ['arachides', 'noix'],
          },
          {
            cpe: 'au service de garde Les Petits Explorateurs',
            accueil: 'entre sept heures et huit heures quarante-cinq',
            retard: 'huit heures quinze',
            allergie: 'les graines de sésame et les fruits à coque',
            retardAns: 'Prévenir le personnel avant huit heures quinze grâce à l’outil mobile',
            retardDist1: 'Inscrire l’absence sur le registre papier officiel auprès du concierge à neuf heures',
            retardDist2: 'Transmettre un message téléphonique d’urgence à la direction après dix heures trente',
            allergieAns: 'Proscrire des lunchs les graines de sésame ainsi que les fruits à coque',
            allergieDist1: 'Exiger une attestation médicale délivrée par un pédiatre pour chaque aliment',
            allergieDist2: 'Fournir uniquement des collations surgelées préemballées achetées en pharmacie',
            evidenceRetard: ['huit', 'heures', 'quinze'],
            evidenceAllergie: ['graines', 'sésame', 'coque'],
          },
          {
            cpe: 'à la garderie subventionnée Le Jardin Fleuri',
            accueil: 'entre sept heures quinze et neuf heures',
            retard: 'huit heures quarante-cinq',
            allergie: 'les amandes et les dérivés de soja',
            retardAns: 'Transmettre le signalement avant huit heures quarante-cinq en ligne',
            retardDist1: 'Faire signer un formulaire imprimé au concierge du bâtiment à neuf heures quinze',
            retardDist2: 'Avertir les responsables après midi par un courriel personnel adressé au directeur',
            allergieAns: 'Refuser formellement tout aliment comportant des amandes ou du soja',
            allergieDist1: 'Imposer un menu entièrement biologique et végétarien fourni par la garderie',
            allergieDist2: 'Supprimer l’ensemble des collations nutritives prises au cours de l’après-midi',
            evidenceRetard: ['huit', 'heures', 'quarante-cinq'],
            evidenceAllergie: ['amandes', 'soja'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les parents ! Avant d’entamer cette nouvelle année ${t.cpe}, je désire vous rappeler quelques règlements essentiels pour la sécurité et le bien-être de vos enfants. L’accueil du matin s’effectue ${t.accueil}. Si votre enfant doit arriver en retard ou s’absenter pour des motifs médicaux, vous devez obligatoirement aviser la réception avant ${t.retard} par l’application mobile. En raison d’allergies sévères parmi nos enfants, nous appliquons une politique stricte : aucun aliment contenant ${t.allergie} n’est admis dans les boîtes à lunch. Enfin, n’oubliez pas d’apporter deux ensembles de vêtements de rechange étiquetés au nom de votre enfant pour les jeux extérieurs. Merci de votre précieuse collaboration !`,
          questions: [
            makeQuestion('Quel est l’objet principal de cette communication de la directrice ?', 'Rappeler les consignes d’accueil et les règles de vie du groupe', 'Présenter l’ensemble des nouveaux éducateurs embauchés pour l’année', 'Annoncer la révision annuelle des tarifs du service de garde', ['règlements', 'sécurité']),
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
            penaliteDist1: 'Une suspension immédiate et sans appel de la garde pour toute la semaine',
            penaliteDist2: 'Une exclusion définitive du service de garde sans aucun préavis écrit',
            sortie: 'une autorisation écrite datée et signée par les parents',
            sortieAns: 'La présentation d’une autorisation écrite signée avec pièce d’identité',
            sortieDist1: 'Un message téléphonique circonstancié enregistré sur le répondeur de l’école',
            sortieDist2: 'Un simple accord verbal exprimé spontanément par l’élève lors du départ',
            evidencePenalite: ['dollar', 'minute'],
            evidenceSortie: ['autorisation', 'écrite', 'signée'],
          },
          {
            ecole: 'de l’école primaire de l’Étoile-du-Nord',
            fermeture: 'dix-sept heures quarante-cinq',
            penalite: 'une pénalité financière de dix dollars par tranche de dix minutes',
            penaliteAns: 'Le règlement d’une pénalité de dix dollars par bloc de dix minutes',
            penaliteDist1: 'L’obligation de rencontrer la direction de l’établissement scolaire le lendemain',
            penaliteDist2: 'Une retenue automatique sur le versement mensuel de l’allocation familiale',
            sortie: 'une procuration officielle enregistrée au préalable au secrétariat',
            sortieAns: 'Le dépôt préalable d’une procuration officielle auprès du secrétariat',
            sortieDist1: 'Une note manuscrite rédigée à la hâte sur la première page d’un cahier de classe',
            sortieDist2: 'La présentation d’un reçu officiel attestant le paiement de tous les frais scolaires',
            evidencePenalite: ['pénalité', 'dix', 'dollars'],
            evidenceSortie: ['procuration', 'secrétariat'],
          },
          {
            ecole: 'du pavillon primaire Saint-Viateur',
            fermeture: 'dix-huit heures',
            penalite: 'une tarification spéciale forfaitaire de vingt dollars dès le premier retard',
            penaliteAns: 'La facturation d’un montant forfaitaire de vingt dollars dès la fermeture',
            penaliteDist1: 'Une convocation immédiate des parents devant le conseil d’établissement scolaire',
            penaliteDist2: 'La confiscation temporaire du dossier d’inscription de l’enfant jusqu’au lundi',
            sortie: 'une confirmation électronique validée sur le portail sécurisé',
            sortieAns: 'Une validation électronique formelle effectuée sur le portail sécurisé',
            sortieDist1: 'Une photographie couleur récente de l’accompagnateur envoyée par texto',
            sortieDist2: 'Un appel téléphonique en direct avec un témoin du voisinage de l’école',
            evidencePenalite: ['tarification', 'vingt', 'dollars'],
            evidenceSortie: ['confirmation', 'électronique', 'portail'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Chers parents des élèves ${t.ecole}, voici les consignes relatives au service de garde pour les journées de classe et les journées pédagogiques. Notre service ferme ses portes à ${t.fermeture}. Tout retard le soir entraînera ${t.penalite}, payable directement auprès du responsable de garde. Si une personne autre que les parents désignés vient chercher votre enfant en fin de journée, nous exigeons ${t.sortie} accompagnée d’une pièce d’identité avec photo. Pour les journées de formation des enseignants, l’inscription doit être complétée dix jours à l’avance afin de prévoir le nombre adéquat d’éducateurs pour les sorties récréatives. Nous comptons sur votre ponctualité pour faciliter le bon déroulement de nos activités quotidiennes.`,
          questions: [
            makeQuestion('Quel sujet administratif la responsable du service de garde aborde-t-elle ?', 'Les horaires habituels et les formalités du service de garde', 'L’achat du matériel requis pour les projets artistiques de l’école primaire', 'Le calendrier détaillé des examens et évaluations de la session scolaire', ['garde', 'consignes']),
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
            restrictionDist1: 'Quitter le logement familial durant toute la durée des rénovations prévues',
            restrictionDist2: 'Installer des planches en bois clouées sur toutes les vitres de l’appartement',
            evidenceRestriction: ['meubles', 'balcons', 'fenêtres'],
          },
          {
            proprio: 'Madame Bouchard',
            date: 'mardi le deux mai',
            duree: 'quatre semaines de travaux',
            restriction: 'libérer entièrement les coursives et stationner sur la rue',
            restrictionAns: 'Laisser les coursives libres et garer les voitures sur la rue',
            restrictionDist1: 'Couper l’alimentation électrique principale de l’appartement durant le jour',
            restrictionDist2: 'Ranger tous les appareils ménagers volumineux dans la cave commune fermée',
            evidenceRestriction: ['coursives', 'stationner', 'rue'],
          },
          {
            proprio: 'Madame Mercier',
            date: 'le premier juin',
            duree: 'deux semaines intensives',
            restriction: 'couvrir vos objets fragiles et garder les stores baissés',
            restrictionAns: 'Protéger les biens délicats et conserver les stores baissés',
            restrictionDist1: 'Nettoyer chaque soir la cage d’escalier avec de l’eau savonneuse tiède',
            restrictionDist2: 'Déménager l’ensemble des lits dans les pièces centrales de l’immeuble',
            evidenceRestriction: ['fragiles', 'stores', 'baissés'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les résidents de l’immeuble. C’est votre propriétaire, ${t.proprio}. Je vous appelle pour vous transmettre des informations détaillées concernant les travaux de rénovation de notre toiture et de nos balcons extérieurs. Le chantier débutera ${t.date} et s’échelonnera sur ${t.duree}. Les ouvriers travailleront du lundi au vendredi, entre sept heures trente et dix-sept heures. Durant cette période, il y aura du bruit et de la poussière. Vous devez impérativement ${t.restriction} dès ce week-end. L’accès à la cour arrière sera également interdit pour des raisons de sécurité pendant les manœuvres. Je vous remercie pour votre patience et votre coopération !`,
          questions: [
            makeQuestion('Quelle annonce majeure la propriétaire communique-t-elle aux locataires ?', 'La tenue prochaine de réparations sur le toit et les balcons', 'La hausse annuelle des loyers pour l’ensemble des logements de l’immeuble', 'Le remplacement intégral de toutes les serrures des portes palières', ['travaux', 'rénovation']),
            makeQuestion('Quels horaires de travail les ouvriers respecteront-ils sur place ?', 'Du lundi au vendredi sur le chantier de sept heures trente jusqu’en fin d’après-midi', 'Uniquement en soirée de dix-huit heures à minuit du lundi au vendredi pour éviter le bruit', 'Les fins de semaine complètes du samedi matin au dimanche soir pour accélérer la livraison', ['lundi', 'vendredi', 'heures']),
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
            coupureDist1: 'Les vendredis soirs de dix-huit heures à minuit de manière continue',
            coupureDist2: 'Chaque nuit de la semaine entre deux heures et six heures du matin',
            acces: 'permettre aux plombiers d’accéder aux tuyaux sous votre évier',
            accesAns: 'Donner accès aux canalisations situées sous l’évier de la cuisine',
            accesDist1: 'Acheter à ses frais des raccords de plomberie neufs dans une quincaillerie',
            accesDist2: 'Purger soi-même le compteur d’eau principal situé au sous-sol du bâtiment',
            evidenceCoupure: ['mardis', 'jeudis', 'seize'],
            evidenceAcces: ['tuyaux', 'évier'],
          },
          {
            batiment: 'de la coopérative d’habitation Les Pins',
            coupure: 'les lundis et mercredis de huit heures à quinze heures',
            coupureAns: 'Les lundis et mercredis entre huit heures et quinze heures',
            coupureDist1: 'Les fins de semaine complètes du samedi matin jusqu’au dimanche soir',
            coupureDist2: 'Uniquement les mercredis soirs après dix-neuf heures jusqu’à minuit',
            acces: 'libérer l’espace autour du chauffe-eau dans votre buanderie',
            accesAns: 'Dégager entièrement le pourtour du chauffe-eau situé dans la buanderie',
            accesDist1: 'Vidanger complètement le réservoir d’eau chaude la veille de l’intervention',
            accesDist2: 'Démonter tous les robinets de la baignoire avant l’arrivée des plombiers',
            evidenceCoupure: ['lundis', 'mercredis', 'quinze'],
            evidenceAcces: ['chauffe-eau', 'buanderie'],
          },
          {
            batiment: 'des appartements du Manoir Mont-Royal',
            coupure: 'tous les matins de cette semaine entre huit heures et midi',
            coupureAns: 'Tous les matins de la semaine en cours de huit heures à midi',
            coupureDist1: 'Une journée entière sans aucun préavis au milieu du mois courant',
            coupureDist2: 'Les samedis après-midi entre treize heures et dix-huit heures trente',
            acces: 'dégager complètement l’accès aux conduites de la salle de bain',
            accesAns: 'Dégager les canalisations situées dans la salle de bain pour les ouvriers',
            accesDist1: 'Remplacer le rideau de douche par une cloison étanche aux normes sanitaires',
            accesDist2: 'Couper le chauffage central de l’appartement pendant trois jours consécutifs',
            evidenceCoupure: ['matins', 'huit', 'midi'],
            evidenceAcces: ['conduites', 'salle', 'bain'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Avis important à l’intention de tous les locataires ${t.batiment}. Notre syndicat de gestion entreprendra dès la semaine prochaine le remplacement complet de la tuyauterie d’eau potable de tout l’immeuble. Cette mise aux normes entraînera des coupures d’eau régulières ${t.coupure}. Nous vous conseillons de remplir des récipients d’eau la veille pour vos besoins essentiels. Chaque locataire doit obligatoirement être présent ou confier ses clés au concierge pour ${t.acces}. Des points de distribution d’eau embouteillée seront installés dans le hall d’entrée pour dépanner les familles. Nous regrettons ces inconvénients temporaires qui garantiront toutefois la qualité de notre réseau pour de nombreuses années.`,
          questions: [
            makeQuestion('Quel projet de rénovation technique est présenté dans ce message vocal ?', 'Le renouvellement complet des conduites d’eau de la bâtisse', 'La réfection des tapis et la pose de peinture fraîche dans le hall d’entrée', 'L’installation de nouvelles caméras de sécurité dans l’ensemble du complexe', ['tuyauterie', 'potable']),
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
            signatureDist1: 'Remettre une somme d’argent comptant directement à la responsable le soir',
            signatureDist2: 'Enregistrer un message vocal de confirmation sur le répondeur de la garde',
            vaccinAns: 'Fournir le livret de vaccination actualisé pour son enfant avant vendredi',
            vaccinDist1: 'Fournir un extrait officiel de naissance notarié délivré par une cour de justice',
            vaccinDist2: 'Faire certifier le passeport de l’enfant par un avocat spécialisé en droit civil',
            evidenceSignature: ['feuille', 'présence', 'ministère'],
            evidenceVaccin: ['carnet', 'vaccination'],
          },
          {
            responsable: 'Madame Sylvie Lavoie',
            fermeture: 'dix-sept heures quinze',
            signature: 'le registre d’émargement quotidien',
            vaccin: 'la fiche médicale annuelle remplie par votre médecin',
            signatureAns: 'Compléter par sa signature le document quotidien d’émargement à la sortie',
            signatureDist1: 'Déposer une pièce d’identité avec photo dans un casier sécurisé et fermé',
            signatureDist2: 'Envoyer un courriel officiel de confirmation avant de quitter les lieux',
            vaccinAns: 'Remettre la fiche médicale annuelle complétée par le médecin traitant',
            vaccinDist1: 'Présenter une facture d’achat de médicaments délivrée par un pharmacien agréé',
            vaccinDist2: 'Faire signer une déclaration d’assurance responsabilité civile pour la saison',
            evidenceSignature: ['registre', 'émargement'],
            evidenceVaccin: ['fiche', 'médicale', 'médecin'],
          },
          {
            responsable: 'Madame Josée Gagnon',
            fermeture: 'dix-sept heures quarante-cinq',
            signature: 'le formulaire électronique sur tablette à l’entrée',
            vaccin: 'la confirmation d’inscription avec antécédents médicaux',
            signatureAns: 'Valider le formulaire électronique sur la tablette installée à l’entrée',
            signatureDist1: 'Montrer une photo de famille récente imprimée sur du papier cartonné',
            signatureDist2: 'Laisser une note écrite dans le casier extérieur réservé à la garderie',
            vaccinAns: 'Donner la confirmation d’inscription mentionnant les antécédents médicaux',
            vaccinDist1: 'Produire un bilan radiologique complet du thorax délivré par un spécialiste',
            vaccinDist2: 'Faire approuver le dossier médical de l’enfant par la commission scolaire',
            evidenceSignature: ['formulaire', 'électronique', 'tablette'],
            evidenceVaccin: ['confirmation', 'inscription', 'antécédents'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour chers parents. C’est ${t.responsable}, responsable du service de garde éducatif en milieu familial. Je tiens à préciser quelques consignes d’organisation pour que tout le monde passe une excellente session. Veuillez noter que notre journée se termine à ${t.fermeture} précises. Le soir, prenez deux minutes pour signer ${t.signature} avant de quitter avec votre enfant, car cette démarche est vérifiée lors des contrôles. Si votre enfant présente de la fièvre supérieure à trente-huit degrés ou des symptômes contagieux, il doit demeurer à la maison jusqu’à disparition complète des symptômes pendant vingt-quatre heures. Enfin, n’oubliez pas de me remettre ${t.vaccin} avant vendredi prochain. Je vous remercie pour votre belle collaboration !`,
          questions: [
            makeQuestion('Quel cadre éducatif fait l’objet de cette mise au point de règlements ?', 'Une garderie éducative en milieu familial', 'Un centre de garde rattaché à un cégep de grande taille', 'Un camp de vacances de plein air pour enfants d’âge scolaire', ['garde', 'familial']),
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
            drapeauDist1: 'Le ministre responsable des sports du gouvernement fédéral',
            drapeauDist2: 'Le maire honoraire de la ville hôte de la compétition',
            evidenceDrapeau: ['sprinteuse', 'québécoise'],
          },
          {
            competition: 'des Jeux mondiaux universitaires',
            ville: 'de Québec',
            porte_drapeau: 'le champion canadien de plongeon',
            foule: 'trente-cinq mille personnes réunies',
            drapeauAns: 'Le plongeur champion canadien sous les applaudissements du public',
            drapeauDist1: 'Le doyen principal de la faculté régionale d’éducation physique et sportive',
            drapeauDist2: 'Un groupe d’entraîneurs retraités de haut niveau',
            evidenceDrapeau: ['champion', 'canadien', 'plongeon'],
          },
          {
            competition: 'du Grand Prix cycliste international',
            ville: 'de Gatineau',
            porte_drapeau: 'la cycliste chevronnée médaillée d’or',
            foule: 'vingt-cinq mille amateurs réunis',
            drapeauAns: 'La coureuse cycliste médaillée d’or saluée par les spectateurs',
            drapeauDist1: 'Le président de la fédération internationale de cyclisme',
            drapeauDist2: 'Le chef de police de la municipalité hôte',
            evidenceDrapeau: ['cycliste', 'médaillée', 'or'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Bienvenue sur nos ondes pour cette émission spéciale consacrée à la cérémonie d’ouverture ${t.competition}, qui s’est tenue hier soir dans le grand stade ${t.ville}. Le spectacle a débuté par un hommage touchant aux Premières Nations, suivi d’une chorégraphie dynamique alliant danses traditionnelles et projections lumineuses sur une gigantesque surface de glace. L’émotion a atteint son comble lors du défilé des délégations, lorsque ${t.porte_drapeau} a franchi la scène centrale sous les ovations de ${t.foule}. La flamme officielle a ensuite été allumée par deux jeunes athlètes de la relève locale au milieu d’un impressionnant feu d’artifice. Les compétitions s’amorceront dès ce matin avec les premières rondes éliminatoires.`,
          questions: [
            makeQuestion('Quel événement festif et sportif est décrit par le journaliste à la radio ?', 'Le lancement festif d’une grande rencontre sportive internationale', 'La remise officielle des prix clôturant une compétition provinciale annuelle', 'La conférence de presse matinale annonçant l’annulation de tournois', ['cérémonie', 'ouverture', 'sportive']),
            makeQuestion('Par quoi le spectacle inaugural a-t-il débuté ?', 'Un hommage aux Premières Nations suivi de projections visuelles', 'Une joute amicale entre deux équipes rivales régionales', 'Une longue allocution officielle prononcée par les commanditaires', ['hommage', 'nations', 'projections']),
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
            spectacleDist1: 'Une parade mécanique de motoneiges anciennes le long des pistes de ski',
            spectacleDist2: 'Une démonstration d’escalade sur parois rocheuses artificielles',
            serment: 'une jeune patineuse de vitesse de la région',
            sermentAns: 'Une jeune patineuse de vitesse originaire de la région d’accueil',
            sermentDist1: 'Le ministre responsable du tourisme accompagné de délégués municipaux',
            sermentDist2: 'L’arbitre en chef désigné pour les épreuves de bobsleigh',
            evidenceSpectacle: ['conte', 'musical', 'boréales'],
            evidenceSerment: ['patineuse', 'vitesse'],
          },
          {
            jeu: 'des Championnats mondiaux de ski nordique',
            region: 'au Mont-Sainte-Anne',
            spectacle: 'une fresque visuelle retraçant l’histoire des coureurs des bois, interprétée par trois cents artistes',
            spectacleAns: 'Une fresque visuelle historique évoquant le passé des coureurs des bois',
            spectacleDist1: 'Un tournoi amical de hockey sur une patinoire improvisée',
            spectacleDist2: 'Un concert symphonique classique prestigieux donné dans une église du village',
            serment: 'un fondeur québécois sélectionné pour la première fois',
            sermentAns: 'Un fondeur d’ici sélectionné pour la première fois aux championnats',
            sermentDist1: 'Le président du comité général d’organisation de la compétition sportive',
            sermentDist2: 'Un ancien médaillé olympique venu assister en simple spectateur',
            evidenceSpectacle: ['fresque', 'visuelle', 'bois'],
            evidenceSerment: ['fondeur', 'sélectionné'],
          },
          {
            jeu: 'du Festival international des sports de neige',
            region: 'au Saguenay',
            spectacle: 'une symphonie de percussions jouée sur des blocs de glace sculptés par trois cents artistes',
            spectacleAns: 'Une symphonie percussive résonnant sur d’immenses blocs de glace sculptés',
            spectacleDist1: 'Un grand défilé de traîneaux à chiens traversant la place publique principale',
            spectacleDist2: 'Une compétition culinaire de mets traditionnels du terroir boréal',
            serment: 'une skieuse acrobatique acclamée par la foule',
            sermentAns: 'Une spécialiste du ski acrobatique chaudement acclamée par le public',
            sermentDist1: 'Le préfet de la municipalité régionale de comté hôte',
            sermentDist2: 'Un représentant de la ligue provinciale de patinage artistique',
            evidenceSpectacle: ['symphonie', 'percussions', 'glace'],
            evidenceSerment: ['skieuse', 'acrobatique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Ici Radio-Canada en direct de la soirée inaugurale ${t.jeu}, organisée cette semaine ${t.region}. Malgré un vent glacial qui soufflait sur la place des festivals, les spectateurs ont assisté à un déploiement artistique remarquable. La mise en scène proposait ${t.spectacle}. Après le salut des dignitaires, ${t.serment} a prononcé le serment des athlètes au nom de tous les participants, promettant loyauté et esprit d’équipe. La soirée s’est conclue dans une ambiance chaleureuse avec un concert de musique traditionnelle où le public s’est mis à chanter et danser pour braver le froid.`,
          questions: [
            makeQuestion('Quel événement culturel et sportif radiodiffusé ce reportage fait-il revivre ?', 'L’inauguration officielle d’un tournoi hivernal international', 'Une grande levée de fonds communautaire pour rénover un aréna municipal', 'Une compétition locale de patinage artistique réservée aux écoliers', ['inaugurale', 'artistique']),
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
            domaineDist1: 'La comptabilité analytique et l’optimisation des portefeuilles boursiers',
            domaineDist2: 'L’aménagement paysager et la gestion durable des espaces verts',
            firmeAns: 'Une décennie d’expérience au service de l’Agence spatiale canadienne',
            firmeDist1: 'La gestion administrative d’un grand magasin de fournitures électroniques',
            firmeDist2: 'L’enseignement primaire dans une petite commission scolaire',
            missionAns: 'Détecter les faiblesses logicielles et sécuriser les courriels internes',
            missionDist1: 'Apprendre à concevoir des applications informatiques ludiques pour téléphones',
            missionDist2: 'Négocier de nouveaux contrats commerciaux avec les fournisseurs',
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
            domaineDist1: 'La production audiovisuelle pour les chaînes de télévision locales',
            domaineDist2: 'La révision des lois électorales pour les partis provinciaux',
            firmeAns: 'Un poste de direction de l’innovation dans une grande banque québécoise',
            firmeDist1: 'L’animation d’émissions radiophoniques consacrées à la vie communautaire',
            firmeDist2: 'La coordination d’un service de livraison de colis urbains',
            missionAns: 'Automatiser le suivi du risque et dépister les transactions anormales',
            missionDist1: 'Créer un site Internet promotionnel d’envergure pour attirer de jeunes clients',
            missionDist2: 'Rédiger le manuel d’accueil destiné aux stagiaires administratifs',
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
            domaineDist1: 'Le stylisme vestimentaire et la mise en marché dans la mode',
            domaineDist2: 'La logistique portuaire pour les navires de transport de marchandises',
            firmeAns: 'Une pratique de conseil stratégique auprès de plusieurs ministères fédéraux',
            firmeDist1: 'La gérance d’un café associatif situé dans un quartier étudiant très animé',
            firmeDist2: 'La vente d’espaces publicitaires pour un journal régional d’annonces',
            missionAns: 'Encadrer les règles éthiques et garantir la conformité aux normes',
            missionDist1: 'Rénover le réseau électrique et la plomberie de la cafétéria de l’entreprise',
            missionDist2: 'Organiser une journée festive pour célébrer les anniversaires de service',
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
            expertiseDist1: 'La vérification comptable et fiscale des grandes entreprises multinationales du secteur',
            expertiseDist2: 'L’entretien mécanique régulier de flottes de véhicules municipaux et industriels lourds',
            mandatAns: 'Des interventions dans des hôpitaux publics et des cégeps provinciaux',
            mandatDist1: 'La gestion quotidienne de commerces spécialisés de prêt-à-porter en banlieue',
            mandatDist2: 'La surveillance de sentiers pédestres dans des réserves naturelles',
            evidenceExpertise: ['médiation', 'diversité'],
            evidenceMandat: ['hôpitaux', 'cégeps'],
          },
          {
            nom: 'Madame Monique Baril',
            expertise: 'la santé psychologique au travail et la prévention du harcèlement',
            etudes: 'à l’Université de Montréal en psychologie industrielle',
            mandat: 'pour de grandes coopératives financières et des municipalités',
            expertiseAns: 'Le bien-être psychologique en milieu professionnel et la lutte contre le harcèlement',
            expertiseDist1: 'Le génie civil et structural appliqué à la construction de grands viaducs routiers régionaux',
            expertiseDist2: 'La négociation de baux commerciaux complexes pour de vastes entrepôts portuaires industriels',
            mandatAns: 'Des missions auprès de coopératives financières et de villes d’ici',
            mandatDist1: 'L’approvisionnement en pièces de rechange pour de grandes usines textiles',
            mandatDist2: 'La confection d’uniformes pour des équipes sportives régionales',
            evidenceExpertise: ['santé', 'psychologique', 'harcèlement'],
            evidenceMandat: ['coopératives', 'municipalités'],
          },
          {
            nom: 'Madame Diane Beaulieu',
            expertise: 'le leadership inclusif et la conciliation entre le travail et la famille',
            etudes: 'à l’Université Laval en relations industrielles',
            mandat: 'au sein de sociétés d’État et d’organismes communautaires',
            expertiseAns: 'Les pratiques de gestion inclusive et l’équilibre entre travail et obligations familiales',
            expertiseDist1: 'La gestion des stocks de marchandises périssables dans un vaste supermarché régional',
            expertiseDist2: 'L’arpentage géométrique de grands terrains forestiers éloignés des centres urbains',
            mandatAns: 'Des interventions ciblées dans des sociétés publiques et communautaires',
            mandatDist1: 'La restauration rapide dans plusieurs centres commerciaux de quartier',
            mandatDist2: 'L’exploitation de carrières de gravier dans les régions du nord du Québec',
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
            makeQuestion('Quelle démarche pédagogique privilégie-t-elle pour outiller les participants ?', 'Des mises en situation interactives et des exercices en sous-groupes', 'Une conférence magistrale théorique sans aucune prise de parole permise', 'Un examen écrit individuel noté administré à la fin de la séance', ['ateliers', 'interactifs', 'exercices']),
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
            epreuveDist1: 'Des tournois majeurs de hockey sur glace disputés dans un aréna fermé',
            epreuveDist2: 'Des compétitions de course d’endurance sur piste synthétique',
            honneurAns: 'Une nageuse autochtone sacrée championne panaméricaine',
            honneurDist1: 'Le chef du protocole du comité international des juges',
            honneurDist2: 'Le constructeur des installations aquatiques du complexe',
            evidenceEpreuve: ['plongeon', 'natation', 'artistique'],
            evidenceHonneur: ['nageuse', 'autochtone', 'panaméricaine'],
          },
          {
            bassin: 'au Centre sportif de Gatineau',
            epreuve: 'du water-polo et de la nage en eau libre',
            honneur: 'un paralympien médaillé d’or en papillon',
            epreuveAns: 'Des confrontations de water-polo et des épreuves en eau libre',
            epreuveDist1: 'Des matches de soccer intérieur disputés en gymnase',
            epreuveDist2: 'Des concours de saut à ski acrobatique tenus sur un tremplin extérieur',
            honneurAns: 'Un athlète paralympique ayant décroché l’or en style papillon',
            honneurDist1: 'Le maire adjoint délégué aux loisirs et aux sports de la municipalité',
            honneurDist2: 'Un animateur de radio locale invité pour l’animation',
            evidenceEpreuve: ['water-polo', 'eau', 'libre'],
            evidenceHonneur: ['paralympien', 'médaillé', 'papillon'],
          },
          {
            bassin: 'au complexe Aquatique de Laval',
            epreuve: 'de la natation de vitesse et du plongeon synchronisé',
            honneur: 'une jeune prodige locale détenant un record canadien',
            epreuveAns: 'Des courses de natation rapide et des plongeons synchronisés',
            epreuveDist1: 'Des rencontres de curling sur glace balayée à la main',
            epreuveDist2: 'Des épreuves de vélo acrobatique sur de grandes rampes intérieures en bois',
            honneurAns: 'Une jeune sportive locale titulaire d’un record canadien',
            honneurDist1: 'Le responsable de l’entretien technique et mécanique de la machinerie',
            honneurDist2: 'Le fournisseur des tenues de bain des athlètes',
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
            makeQuestion('Quand débuteront les premières courses officielles sur le site ?', 'Dès huit heures trente demain matin pour les éliminatoires', 'Ce soir à minuit après la fin des discours des dignitaires', 'La fin de semaine prochaine après les derniers entraînements libres', ['huit', 'heures', 'trente']),
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
            blessure: 'une fracture sévère à la cheville à la veille des sélections',
            finale: 'une médaille historique remportée avec courage aux Jeux d’hiver',
            blessureAns: 'Une sévère fracture de la cheville subie juste avant les sélections',
            blessureDist1: 'La perte soudaine et inattendue de l’ensemble de ses commanditaires majeurs',
            blessureDist2: 'Le refus de son club de lui accorder une dispense scolaire',
            finaleAns: 'La conquête historique d’une médaille olympique couronnant sa réadaptation',
            finaleDist1: 'L’abandon complet de toute compétition sportive pour ouvrir une boutique de sport',
            finaleDist2: 'Une retraite précipitée annoncée au cours d’un point de presse',
            evidenceBlessure: ['fracture', 'cheville', 'sélections'],
            evidenceFinale: ['médaille', 'jeux', 'hiver'],
          },
          {
            film: '« La Traversée du courage »',
            sportive: 'la fondeuse Sandrine Gagnon',
            blessure: 'une pneumonie sévère qui a paralysé sa préparation hivernale',
            finale: 'une remontée spectaculaire sur le podium lors du cinquante kilomètres',
            blessureAns: 'Une violente pneumonie venue interrompre sa préparation en plein hiver',
            blessureDist1: 'Un vol complet de matériel sportif survenu la veille même du grand départ officiel',
            blessureDist2: 'Une dispute avec la fédération sportive sur le choix de son équipement',
            finaleAns: 'Une remontée mémorable vers les marches du podium au cinquante kilomètres',
            finaleDist1: 'Une réorientation professionnelle vers l’enseignement universitaire en kinésiologie',
            finaleDist2: 'La signature d’un contrat d’entraîneuse dans un club européen',
            evidenceBlessure: ['pneumonie', 'préparation'],
            evidenceFinale: ['podium', 'cinquante', 'kilomètres'],
          },
          {
            film: '« Seule contre le vent »',
            sportive: 'la cycliste Karine Simard',
            blessure: 'une déchirure musculaire douloureuse après une chute en peloton',
            finale: 'un triomphe émouvant lors du contre-la-montre des championnats mondiaux',
            blessureAns: 'Une déchirure musculaire douloureuse occasionnée par une chute collective',
            blessureDist1: 'Une série de pannes mécaniques répétées lors de chaque course préliminaire du circuit',
            blessureDist2: 'Une annulation des épreuves en raison de fortes tempêtes de pluie',
            finaleAns: 'Une victoire touchante remportée sur l’épreuve individuelle du contre-la-montre',
            finaleDist1: 'La création d’une école de formation pour de jeunes cyclistes de quartier défavorisé',
            finaleDist2: 'Un refus obstiné de participer aux épreuves internationales suivantes',
            evidenceBlessure: ['déchirure', 'musculaire', 'peloton'],
            evidenceFinale: ['triomphe', 'contre-la-montre', 'mondiaux'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Dans notre chronique cinéma de ce midi, nous nous penchons sur le long-métrage biographique ${t.film}, qui retrace la vie marquante de ${t.sportive}. Le film débute dans un petit village du Québec où l’on voit la jeune fille s’entraîner à l’aube sur des patinoires extérieures sous des froids polaires. Le récit prend ensuite un tournant dramatique au milieu du film lorsqu’elle subit ${t.blessure}. Alors que tous les spécialistes prédisent la fin de sa carrière, elle entreprend une réadaptation rigoureuse avec l’aide de son entraîneur de toujours. La scène culminante du film montre ${t.finale}, un moment d’une grande intensité émotionnelle qui a profondément touché les spectateurs lors de la première montréalaise.`,
          questions: [
            makeQuestion('Quel genre d’œuvre cinématographique le critique commente-t-il à la radio ?', 'Une biographie filmée retraçant le destin d’une sportive québécoise', 'Une comédie d’intrigue amoureuse et burlesque qui se déroule dans une grande université', 'Un grand documentaire historique sur la fondation des premiers cinémas de quartier', ['biographique', 'film']),
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
            defiDist1: 'Courir un marathon complet sur un parcours accidenté dans les ruelles du Vieux-Québec',
            defiDist2: 'Escalader sans corde un sommet rocheux dans les Rocheuses',
            epreuveAns: 'Trois retournements d’embarcation subis au cœur de vagues monstrueuses',
            epreuveDist1: 'Une panne complète et soudaine de tous les instruments électroniques du voilier suiveur',
            epreuveDist2: 'La perte accidentelle des réserves de vivres tombées à la mer',
            evidenceDefi: ['traversée', 'solitaire', 'rame'],
            evidenceEpreuve: ['chavirages', 'tempête', 'vagues'],
          },
          {
            titre: '« Les Eaux boréales »',
            nageuse: 'la spécialiste des longues distances Sandrine Pelletier',
            defi: 'la double traversée du lac Saint-Jean à la nage sans combinaison néoprène',
            epreuve: 'des crampes paralysantes causées par une eau glaciale à treize degrés',
            defiAns: 'Franchir deux fois ce grand lac à la seule force de ses bras',
            defiDist1: 'Descendre des rapides tumultueux en kayak biplace avec un guide expérimenté',
            defiDist2: 'Participer à une épreuve de vitesse sur cinquante mètres en bassin intérieur',
            epreuveAns: 'Des crampes douloureuses et paralysantes dues à une eau à treize degrés',
            epreuveDist1: 'La rencontre imprévue et effrayante avec une meute de chiens errants sur la berge',
            epreuveDist2: 'Une rupture prématurée de sa combinaison thermique de rechange',
            evidenceDefi: ['traversée', 'lac', 'nage'],
            evidenceEpreuve: ['crampes', 'eau', 'treize'],
          },
          {
            titre: '« Le Fleuve au cœur »',
            nageuse: 'la nageuse en eau libre Geneviève Fabre',
            defi: 'la descente de trois cents kilomètres du fleuve Saint-Laurent sur cinq jours',
            epreuve: 'de puissants courants de marée qui la repoussaient obstinément vers le large',
            defiAns: 'Nager trois cents kilomètres au fil du fleuve Saint-Laurent en cinq journées',
            defiDist1: 'Faire le tour complet de l’île d’Orléans en planche à voile par grand vent',
            defiDist2: 'Franchir un parcours d’obstacles balisé dans le bassin portuaire',
            epreuveAns: 'Des forces de marée contraires qui l’entraînaient malgré elle vers le large',
            epreuveDist1: 'Une rupture imprévue d’approvisionnement en eau potable à bord du bateau suiveur',
            epreuveDist2: 'Un épais brouillard l’empêchant de distinguer la côte pendant des heures',
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
            makeQuestion('Quelle atmosphère caractérise l’arrivée finale au quai montrée au dénouement ?', 'Un accueil populaire très émouvant rassemblant une foule enthousiaste', 'Un débarquement solitaire et silencieux en pleine nuit sans aucun accueil public prévu', 'Une intervention médicale d’urgence de secouristes interrompant brutalement l’événement', ['arrivée', 'quai', 'émues']),
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
            causeDist1: 'Un bris mécanique soudain sur l’éclairage de sécurité des lampadaires autoroutiers',
            causeDist2: 'Une traversée imprévue d’animaux sauvages sur les voies rapides',
            etatAns: 'Trois personnes légèrement blessées et transférées vers l’hôpital voisin',
            etatDist1: 'Aucun blessé physique mais dix automobilistes gardés en observation préventive',
            etatDist2: 'Plusieurs victimes dans un état critique héliportées d’urgence',
            evidenceCause: ['pluie', 'verglaçante', 'chaussée'],
            evidenceEtat: ['blessés', 'légers', 'hôpital'],
          },
          {
            autoroute: 'sur l’autoroute 40 près de Trois-Rivières',
            cause: 'une bourrasque de neige réduisant la visibilité à zéro',
            vehicules: 'un camion de livraison et trois camionnettes',
            etat: 'deux conducteurs traités sur place pour des coupures mineures',
            causeAns: 'Une violente bourrasque de neige ayant totalement masqué la visibilité',
            causeDist1: 'Un nid-de-poule d’une profondeur exceptionnelle apparu au milieu de la voie centrale',
            causeDist2: 'Une défaillance de la signalisation lumineuse à l’échangeur',
            etatAns: 'Deux automobilistes soignés sur les lieux mêmes pour de petites coupures',
            etatDist1: 'Un carambolage sans aucun dommage corporel ni matériel nécessitant une indemnisation',
            etatDist2: 'Une vingtaine de personnes admises aux soins intensifs de la région',
            evidenceCause: ['bourrasque', 'neige', 'visibilité'],
            evidenceEtat: ['conducteurs', 'traités', 'coupures'],
          },
          {
            autoroute: 'sur l’autoroute 15 nord à la hauteur de Mirabel',
            cause: 'une nappe de brouillard givrant dense sur le pont routier',
            vehicules: 'cinq véhicules immobilisés en portefeuille',
            etat: 'dégâts matériels importants sans aucun blessé grave à déplorer',
            causeAns: 'Une nappe de brouillard givrant particulièrement dense sur le viaduc',
            causeDist1: 'Une flaque d’huile moteur déversée accidentellement par une dépanneuse municipale',
            causeDist2: 'Des débris de construction éparpillés par un convoi exceptionnel',
            etatAns: 'D’importants dégâts matériels sur les véhicules mais aucun blessé sérieux',
            etatDist1: 'La destruction totale d’une glissière de pont avec plusieurs blessures très graves',
            etatDist2: 'Le transport immédiat de tous les conducteurs vers un centre de traumatologie',
            evidenceCause: ['brouillard', 'givrant', 'pont'],
            evidenceEtat: ['dégâts', 'matériels', 'blessé'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Bulletin d’information routière d’urgence sur les ondes d’Info-Circulation. Un carambolage important perturbe actuellement la circulation ${t.autoroute}. Selon les policiers de la Sûreté du Québec dépêchés sur les lieux, la suite d’événements a débuté vers sept heures dix avec ${t.cause}. Un premier véhicule a perdu l’adhérence lors d’un changement de voie, heurtant la glissière de sécurité centrale. Incapables de freiner à temps sur la chaussée, ${t.vehicules} sont entrés en collision successive. Les services d’urgence font état de : ${t.etat}. Les remorqueuses sont à l’œuvre pour dégager les voies obstruées, mais un bouchon de dix kilomètres s’est formé. Les automobilistes doivent privilégier la route secondaire 116 pour contourner le secteur.`,
          questions: [
            makeQuestion('Quel événement de la circulation routière est rapporté dans ce flash d’information ?', 'Un carambolage sérieux survenu sur une chaussée autoroutière glissante', 'Une poursuite policière à grande vitesse sur plusieurs voies rapides de la région', 'Une inspection de routine des pneus d’hiver organisée par le ministère des Transports', ['carambolage', 'circulation']),
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
            incidentDist1: 'Un refus d’obtempérer avec délit de fuite lors d’un contrôle de police au péage',
            incidentDist2: 'Un bris de câble électrique pendant sous la structure métallique',
            attenteAns: 'Près de trois quarts d’heure avant la dispersion complète des files d’attente',
            attenteDist1: 'Au moins quatre heures entières d’interruption complète de l’ensemble du trafic routier',
            attenteDist2: 'Moins de cinq minutes grâce à la réouverture immédiate de toutes les voies',
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
            incidentDist1: 'La perte accidentelle d’un chargement de gravier sur l’ensemble de la voie de dépassement',
            incidentDist2: 'L’incendie complet d’une remorque de camping sur le tablier',
            attenteAns: 'Environ cinquante minutes pour que le flot de véhicules se normalise',
            attenteDist1: 'Deux jours ouvrables complets pour consolider les glissières de sécurité endommagées',
            attenteDist2: 'Une quinzaine de minutes au maximum selon les prévisions policières',
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
            incidentDist1: 'Un tête-à-queue spectaculaire provoqué par une flaque de carburant répandu sur la voie',
            incidentDist2: 'Une collision entre deux motocyclistes roulant entre les files',
            attenteAns: 'Une bonne heure d’attente pour résorber l’engorgement de la circulation',
            attenteDist1: 'Une fermeture complète de la travée principale pendant vingt-quatre heures complètes',
            attenteDist2: 'À peine quelques minutes une fois les planches déplacées',
            evidenceIncident: ['chargement', 'planches', 'bois'],
            evidenceAttente: ['heure', 'résorber'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `Ici le point sur la circulation métropolitaine de huit heures quinze. La circulation est particulièrement difficile ce matin sur ${t.pont}. Tout a commencé vers sept heures quarante avec ${t.incident}. Le conducteur a réussi à manœuvrer vers le bas-côté, mais deux automobilistes qui le suivaient de trop près se sont emboutis en tentant de l’éviter. Cet incident a entraîné ${t.remorquage}, provoquant ${t.impact}. Les ambulanciers arrivés rapidement confirment qu’aucun conducteur n’a subi de blessure grave. Le ministère des Transports annonce que toutes les voies seront rouvertes sous peu, mais il faudra au moins ${t.attente} pour résorber complètement le refoulement des véhicules.`,
          questions: [
            makeQuestion('Quelle situation d’entrave routière est analysée par le chroniqueur ?', 'Un incident sur un pont métropolitain paralysant la circulation automobile', 'Des travaux de réfection du tablier programmés pour toute la fin de semaine en banlieue', 'La fermeture préventive d’une station de métro en raison d’un dégât d’eau important', ['circulation', 'pont']),
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
            sujetDist1: 'Une formation régionale de hockey féminin mobilisée pour sauver son aréna municipal',
            sujetDist2: 'Des alpinistes chevronnés explorant les glaciers du Grand Nord',
            epreuveAns: 'La constante pression des médias et la dureté des entraînements de tous les jours',
            epreuveDist1: 'Le refus obstiné de leurs proches de comprendre les sacrifices du sport de haut niveau',
            epreuveDist2: 'Le manque d’équipements adéquats dans l’ensemble de la région',
            podiumAns: 'Leur doublé historique célébré sur les marches du podium mondial',
            podiumDist1: 'Leur décision concertée de renoncer à la haute compétition pour fonder une entreprise',
            podiumDist2: 'Leur départ vers l’étranger pour fonder une chaîne d’hôtels de luxe',
            evidenceSujet: ['sœurs', 'sommets', 'acrobatique'],
            evidenceEpreuve: ['pression', 'médiatique', 'sacrifices'],
            evidencePodium: ['doublé', 'podium', 'mondial'],
          },
          {
            film: '« Piste noire »',
            sujet: 'la championne Laurie Mercier a atteint les sommets du ski acrobatique',
            epreuve: 'des blessures répétées aux genoux nécessitant plusieurs chirurgies délicates',
            podium: 'sa médaille d’or conquise sous une pluie battante lors de la manche finale',
            sujetAns: 'Une skieuse solitaire qui gravit les échelons du ski de bosses international',
            sujetDist1: 'Une patineuse artistique s’exilant à l’étranger pour changer de nationalité sportive',
            sujetDist2: 'Un groupe de monitrices de ski ouvrant une école privée en montagne',
            epreuveAns: 'Des atteintes sérieuses aux genoux ayant nécessité plusieurs chirurgies délicates',
            epreuveDist1: 'Une suspension injustifiée et prolongée infligée par la commission antidopage mondiale',
            epreuveDist2: 'La faillite inattendue de son club d’entraînement d’origine',
            podiumAns: 'Sa conquête héroïque de la médaille d’or sous des trombes d’eau',
            podiumDist1: 'Une disqualification de dernière minute pour utilisation d’un équipement non conforme',
            podiumDist2: 'L’annonce surprise de sa retraite pour devenir commentatrice télévisée',
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
            sujetDist1: 'L’histoire d’une nageuse de vitesse tentant une reconversion difficile dans le water-polo',
            sujetDist2: 'Les débuts hésitants d’une arbitre de gymnastique dans un collège',
            epreuveAns: 'Une commotion cérébrale aiguë subie après un saut d’entraînement dangereux',
            epreuveDist1: 'L’annulation imprévue de toutes les bourses gouvernementales consacrées à cette discipline',
            epreuveDist2: 'Une querelle familiale étalée dans la presse à sensations',
            podiumAns: 'Son éclatant triomphe lors de la prestigieuse Coupe des nations',
            podiumDist1: 'Un abandon volontaire au beau milieu de la finale pour protester contre l’arbitrage',
            podiumDist2: 'La remise d’un prix d’honneur posthume par la fédération sportive',
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
            nouveauDist1: 'Poursuivre un certificat de perfectionnement en fiscalité des entreprises',
            nouveauDist2: 'Quitter définitivement toute formation pour voyager à l’étranger',
            stageAns: 'La réalisation de stages cliniques à l’hôpital dès le début du parcours',
            stageDist1: 'L’assurance d’éviter tout horaire de travail de nuit ou de fin de semaine',
            stageDist2: 'La distribution sans frais de tous les manuels scolaires requis',
            evidenceNouveau: ['soins', 'infirmiers'],
            evidenceStage: ['stages', 'cliniques', 'hospitalier'],
          },
          {
            amie: 'Marianne',
            ancien: 'les sciences de la nature théoriques',
            nouveau: 'inhalothérapie et assistance respiratoire',
            motif: 'la volonté d’exercer un métier utile et actif en santé',
            stage: 'les séances de pratique avec des simulateurs haute fidélité',
            nouveauAns: 'Bifurquer vers les études en inhalothérapie et soins respiratoires',
            nouveauDist1: 'S’inscrire en chimie pure pour faire de la recherche dans un laboratoire',
            nouveauDist2: 'Prendre une année de congé sabbatique sans étudier',
            stageAns: 'Les ateliers pratiques réguliers réalisés sur des simulateurs de pointe',
            stageDist1: 'La dispense complète d’effectuer des gardes hospitalières de fin de semaine',
            stageDist2: 'L’obtention automatique d’une bourse d’excellence gouvernementale',
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
            nouveauDist1: 'Ouvrir son propre cabinet privé de gestion d’immeubles locatifs',
            nouveauDist2: 'Intégrer une école de commerce privée haut de gamme',
            stageAns: 'L’action directe sur le terrain auprès d’organismes communautaires',
            stageDist1: 'L’accès garanti à un bureau individuel fermé pour ses devoirs',
            stageDist2: 'Le remboursement intégral des frais de transport en commun',
            evidenceNouveau: ['travail', 'social', 'aide'],
            evidenceStage: ['organismes', 'communautaires'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Julie ! Je voulais te parler de ma grande décision scolaire. J’ai officiellement quitté ${t.ancien} pour m’inscrire en ${t.nouveau}. J’ai réfléchi pendant des mois avant de faire le saut. Même si mon ancien programme m’offrait de bons débouchés de bureau, je me sentais isolée et je m’ennuyais devant mes tableaux de calculs toute la journée. Ce qui a motivé mon changement, c’est ${t.motif}. Dans ma nouvelle filière, ce qui me stimule par-dessus tout, ce sont ${t.stage}. J’ai l’impression que chaque heure de cours a enfin un sens pratique pour mon avenir. Mes parents étaient un peu inquiets au début en raison des horaires parfois exigeants, mais ils voient bien que j’ai retrouvé ma motivation et mon énergie !`,
          questions: [
            makeQuestion('Quelle réorientation d’études collégiales l’amie annonce-t-elle ?', t.nouveauAns, t.nouveauDist1, t.nouveauDist2, t.evidenceNouveau),
            makeQuestion('Quelle frustration éprouvait-elle dans son ancienne formation collégiale ?', 'Le sentiment de solitude et l’ennui causé par des tâches de bureau', 'Des échecs répétés aux évaluations académiques qui risquaient de freiner ses études', 'Des droits de scolarité annuels beaucoup trop pesants pour son budget d’étudiante', ['isolée', 'ennuyais', 'tableaux']),
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
            arriveeDist1: 'La comptabilité publique appliquée aux municipalités régionales de comté',
            arriveeDist2: 'L’enseignement du latin et du grec ancien au niveau collégial',
            raisonAns: 'Le volet créatif des projets et la flexibilité du télétravail',
            raisonDist1: 'L’obligation de voyager chaque semaine dans des congrès internationaux',
            raisonDist2: 'La gratuité de tous les équipements informatiques fournis d’office',
            evidenceArrivee: ['développement', 'applications'],
            evidenceRaison: ['créativité', 'horaires', 'distance'],
          },
          {
            amie: 'Mélanie',
            depart: 'la littérature comparée',
            arrivee: 'design graphique et communication visuelle',
            raison: 'la possibilité de concevoir des projets visuels concrets',
            arriveeAns: 'Le design graphique et la conception de projets visuels',
            arriveeDist1: 'La gestion spécialisée de documents d’archives dans un ministère gouvernemental',
            arriveeDist2: 'La traduction littéraire de poèmes du dix-neuvième siècle',
            raisonAns: 'L’opportunité stimulante de réaliser des créations visuelles palpables',
            raisonDist1: 'La promesse d’une bourse d’excellence annuelle sans condition d’assiduité',
            raisonDist2: 'La dispense totale de réussir des cours généraux de français',
            evidenceArrivee: ['design', 'graphique', 'communication'],
            evidenceRaison: ['concevoir', 'projets', 'visuels'],
          },
          {
            amie: 'Valérie',
            depart: 'les sciences politiques',
            arrivee: 'analyse de données et cybersécurité',
            raison: 'la forte demande de spécialistes et les salaires d’entrée motivants',
            arriveeAns: 'L’analyse de mégadonnées et les techniques de cybersécurité',
            arriveeDist1: 'L’histoire médiévale et la conservation de manuscrits anciens en bibliothèque',
            arriveeDist2: 'La rédaction d’éditoriaux pour des publications syndicales',
            raisonAns: 'Les débouchés professionnels nombreux et une rémunération de départ attractive',
            raisonDist1: 'La suppression complète des épreuves et examens de mi-session',
            raisonDist2: 'La possibilité de terminer l’ensemble du cursus en six semaines',
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
            makeQuestion('Qu’advient-il des cours généraux déjà complétés avec succès par l’étudiante ?', 'Leurs crédits sont pleinement validés afin d’éviter tout retard dans le cursus', 'Tous les cours généraux précédents doivent impérativement être repris depuis le début', 'Une pénalité financière importante est imposée pour faire reconnaître chaque cours réussi', ['cours', 'généraux', 'reconnus']),
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
            subventionDist1: 'La promesse d’une avance salariale versée par l’employeur',
            subventionDist2: 'L’exonération complète de l’essence sur présentation du reçu',
            borneAns: 'La recharge sur borne privée dans l’entrée de son propre garage',
            borneDist1: 'L’accès réservé à la station-service la plus proche du travail',
            borneDist2: 'Le branchement d’appoint sur une prise publique payante au centre-ville',
            evidenceSubvention: ['douze', 'mille', 'rabais'],
            evidenceBorne: ['borne', 'entrée', 'garage'],
          },
          {
            collegue: 'Patrick',
            modele: 'un petit véhicule multisegment électrique',
            subvention: 'neuf mille dollars d’incitatifs provinciaux et fédéraux',
            borne: 'la recharge nocturne sur mon circuit électrique résidentiel',
            subventionAns: 'Une remise de neuf mille dollars en incitatifs provinciaux et fédéraux',
            subventionDist1: 'Le paiement de la totalité des mensualités par le comité social de l’usine',
            subventionDist2: 'Une subvention versée par la compagnie d’assurances de l’auto',
            borneAns: 'La recharge durant la nuit sur son circuit électrique de maison',
            borneDist1: 'L’utilisation d’un générateur au propane installé dans le coffre',
            borneDist2: 'L’arrêt obligatoire dans des haltes routières de l’autoroute',
            evidenceSubvention: ['neuf', 'mille', 'incitatifs'],
            evidenceBorne: ['recharge', 'nocturne', 'résidentiel'],
          },
          {
            collegue: 'Simon',
            modele: 'une voiture compacte à batterie longue autonomie',
            subvention: 'dix mille dollars de subventions écologiques à l’achat',
            borne: 'l’accès à des bornes rapides le long de mon trajet quotidien',
            subventionAns: 'Une aide financière de dix mille dollars en subventions écologiques',
            subventionDist1: 'Un rabais consenti par le fabricant en échange d’actions en bourse',
            subventionDist2: 'Un prêt sans intérêt accordé par un organisme caritatif local',
            borneAns: 'La disponibilité de bornes rapides situées sur son parcours de tous les jours',
            borneDist1: 'Le rechargement d’urgence effectué par une remorqueuse municipale',
            borneDist2: 'Le prêt d’une batterie de rechange à chaque passage au bureau',
            evidenceSubvention: ['dix', 'mille', 'subventions'],
            evidenceBorne: ['bornes', 'rapides', 'trajet'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Tu as vu le nouveau véhicule dans le stationnement des employés ? C’est le mien ! J’ai finalement fait le saut et choisi ${t.modele}. Je faisais soixante kilomètres par jour pour venir au bureau et je dépensais près de quatre cents dollars d’essence chaque mois. En faisant mes calculs financiers, j’ai réalisé qu’avec ${t.subvention}, le paiement mensuel était comparable à mon ancien véhicule à essence. En plus, grâce à ${t.borne}, faire le plein d’énergie me coûte à peine trois dollars par nuit d’électricité. L’entretien est minime : plus de vidange d’huile, moins d’usure des freins grâce au système régénératif, et une conduite silencieuse dans la circulation dense. Je ne regrette absolument pas mon choix !`,
          questions: [
            makeQuestion('Quel achat personnel majeur le collègue explique-t-il avec fierté ?', 'L’acquisition d’une automobile entièrement électrique pour ses trajets', 'L’achat d’un grand véhicule utilitaire familial d’occasion à motorisation diesel', 'La souscription d’un contrat de location longue durée pour une camionnette lourde', ['véhicule', 'électrique']),
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
            autonomieDist1: 'Une batterie limitée à cent kilomètres obligeant à recharger à chaque sortie',
            autonomieDist2: 'Une autonomie de plus de huit cents kilomètres sans aucun arrêt',
            avantageQ: 'Quel gain de temps appréciable ce véhicule procure-t-il le matin ?',
            avantageAns: 'L’emprunt des voies réservées faisant épargner vingt minutes chaque matin',
            avantageDist1: 'Une vitesse de pointe autorisée plus élevée sur les ponts urbains',
            avantageDist2: 'Le droit de stationner gratuitement devant tous les commerces de quartier',
            evidenceAutonomie: ['quatre', 'cent', 'cinquante'],
            evidenceAvantage: ['voies', 'réservées', 'minutes'],
          },
          {
            nom: 'Benoît',
            autonomie: 'quatre cents kilomètres d’autonomie même en période hivernale',
            epargne: 'réduire nos coûts de transport familial de moitié chaque mois',
            avantage: 'la gratuité complète sur certains ponts à péage de la région',
            autonomieAns: 'Une autonomie de quatre cents kilomètres même sous les rigueurs du froid',
            autonomieDist1: 'Une capacité restreinte à cinquante kilomètres dès qu’apparaissent les premières neiges',
            autonomieDist2: 'Une réserve inépuisable sans jamais recourir à une borne en hiver',
            avantageQ: 'Quel allègement financier routier fort appréciable la famille obtient-elle ?',
            avantageAns: 'La gratuité accordée lors de la traversée de certains ponts à péage',
            avantageDist1: 'Une déduction directe sur l’impôt foncier de leur maison unifamiliale',
            avantageDist2: 'La gratuité totale de tous les péages autoroutiers à travers le pays',
            evidenceAutonomie: ['quatre', 'cents', 'hivernale'],
            evidenceAvantage: ['gratuité', 'ponts', 'péage'],
          },
          {
            nom: 'Guillaume',
            autonomie: 'cinq cents kilomètres d’autonomie pour les trajets interurbains',
            epargne: 'rentabiliser la borne de recharge en moins de six mois',
            avantage: 'la réduction marquée de soixante-dix pour cent de notre consommation d’énergie fossile',
            autonomieAns: 'Une distance franchissable de cinq cents kilomètres lors des trajets interurbains',
            autonomieDist1: 'Une autonomie de deux cents kilomètres réservée aux parcours de quartier',
            autonomieDist2: 'Une possibilité de rouler mille kilomètres sans brancher le véhicule',
            avantageQ: 'Quel impact environnemental direct ce choix procure-t-il au ménage ?',
            avantageAns: 'Un recul de soixante-dix pour cent dans leurs besoins en énergie fossile',
            avantageDist1: 'Une production d’électricité verte nettement supérieure aux besoins du foyer',
            avantageDist2: 'L’élimination de tous les déchets recyclables générés par la maisonnée',
            evidenceAutonomie: ['cinq', 'cents', 'interurbains'],
            evidenceAvantage: ['soixante-dix', 'énergie', 'fossile'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Sylvain ! Tu me demandais pourquoi on avait opté pour un modèle électrique familial. Avec les enfants qui font des activités sportives aux quatre coins de la région chaque fin de semaine, on passait notre vie à la station d’essence. Notre nouvelle voiture nous offre ${t.autonomie}, ce qui élimine notre inquiétude sur l’autoroute. Au niveau du budget familial, les calculs sont clairs : nous allons ${t.epargne}. Mais au-delà de l’aspect financier, il y a un privilège quotidien fort appréciable : ${t.avantage}. Le véhicule est spacieux, confortable, et les enfants adorent le toit vitré panoramique. Pour notre famille, c’est une excellente formule de déplacement au quotidien !`,
          questions: [
            makeQuestion('Pourquoi cette famille a-t-elle décidé d’adopter une voiture électrique ?', 'Choisir un mode de transport familial économique et adapté à leurs sorties', 'Remplacer leurs bicyclettes par une voiture haut de gamme réservée aux grandes vacances', 'Acquérir un minibus utilitaire d’occasion pour transporter du matériel de construction', ['voiture', 'familial']),
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
            avenirDist1: 'La comptabilité notariale spécialisée au sein d’un grand cabinet d’avocats',
            avenirDist2: 'La gestion de stocks dans un entrepôt de vente au détail',
            vocationAns: 'Développer le goût du savoir et accompagner l’épanouissement des enfants',
            vocationDist1: 'Organiser de grandes réceptions mondaines pour des personnalités publiques du milieu',
            vocationDist2: 'Négocier des campagnes de promotion avec des commanditaires',
            evidenceAvenir: ['préscolaire', 'primaire'],
            evidenceVocation: ['apprendre', 'grandir', 'enfants'],
          },
          {
            collegue: 'Isabelle',
            passe: 'les relations publiques corporatives',
            avenir: 'adaptation scolaire pour élèves en difficulté',
            vocation: 'soutenir les jeunes pour surmonter leurs difficultés d’apprentissage',
            avenirAns: 'L’adaptation scolaire destinée aux enfants présentant des difficultés',
            avenirDist1: 'Le courtage immobilier commercial pour des immeubles de bureaux prestigieux',
            avenirDist2: 'La programmation informatique pour des banques d’investissement',
            vocationAns: 'Aider les enfants vulnérables à franchir leurs défis scolaires',
            vocationDist1: 'Gérer la communication de crise pour de grands groupes industriels',
            vocationDist2: 'Accroître les rendements financiers d’un portefeuille d’actions',
            evidenceAvenir: ['adaptation', 'scolaire', 'difficulté'],
            evidenceVocation: ['soutenir', 'difficultés', 'apprentissage'],
          },
          {
            collegue: 'Stéphanie',
            passe: 'la gestion commerciale et vente',
            avenir: 'enseignement du français langue seconde',
            vocation: 'favoriser l’apprentissage des jeunes qui arrivent au pays',
            avenirAns: 'L’enseignement du français comme langue seconde dans les classes',
            avenirDist1: 'La vente automobile dans une concession de véhicules neufs',
            avenirDist2: 'La gestion du personnel dans une chaîne hôtelière internationale',
            vocationAns: 'Faciliter l’intégration linguistique des jeunes nouvellement installés',
            vocationDist1: 'Décrocher des commissions de vente en signant des contrats de gros',
            vocationDist2: 'Rédiger des manuels d’utilisation pour de l’outillage mécanique',
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
            makeQuestion('Quelle mesure financière publique soutient sa reconversion professionnelle ?', 'Des bourses gouvernementales instituées pour soutenir la relève scolaire', 'Un prêt commercial avec intérêts accordé par une institution financière privée de quartier', 'Un important héritage familial notarié couvrant la totalité des droits de scolarité annuels', ['bourses', 'relève', 'scolaire']),
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
            methodeDist1: 'Passer une flamme de briquet le long du caoutchouc noir',
            methodeDist2: 'Remplir le pneu d’air comprimé jusqu’à entendre une détonation',
            sechageAns: 'Frotter la surface au papier abrasif avant d’enduire de colle',
            sechageDist1: 'Enduire l’ensemble de la chambre à air de graisse mécanique épaisse et visqueuse',
            sechageDist2: 'Laisser tremper la pièce dans un solvant industriel pendant une heure',
            evidenceMethode: ['chambre', 'bac', 'eau'],
            evidenceSechage: ['frotter', 'papier', 'abrasif'],
          },
          {
            formatrice: 'Laurence',
            outil: 'deux leviers en plastique pour déloger la tringle du pneu',
            methode: 'repérer attentivement le sifflement d’air en approchant l’oreille',
            sechage: 'nettoyer la surface avec un linge sec et attendre deux minutes',
            methodeAns: 'Déceler le bruit de fuite d’air en approchant son oreille de la paroi',
            methodeDist1: 'Percer plusieurs petits trous pour égaliser la pression interne',
            methodeDist2: 'Faire rouler le vélo à plat sur du gravier pour tester la jante',
            sechageAns: 'Essuyer la zone avec un chiffon propre et patienter deux minutes',
            sechageDist1: 'Chauffer le caoutchouc au séchoir thermique jusqu’à observer une déformation',
            sechageDist2: 'Rincer le pneu avec un puissant détergent moussant pour vaisselle',
            evidenceMethode: ['sifflement', 'air', 'oreille'],
            evidenceSechage: ['linge', 'attendre', 'minutes'],
          },
          {
            formatrice: 'Julie',
            outil: 'une clé plate pour dévisser l’axe de la roue sans forcer',
            methode: 'passer doucement les doigts le long de la chambre à air gonflée',
            sechage: 'appliquer une fine couche de dissolvant sur la zone poncée',
            methodeAns: 'Glisser délicatement ses doigts le long du tube pour sentir le flux d’air',
            methodeDist1: 'Frotter vigoureusement avec une brosse métallique rugueuse',
            methodeDist2: 'Verser de la cire chaude sur tout le pourtour de la tringle',
            sechageAns: 'Étaler une mince couche de dissolvant sur la surface préalablement poncée',
            sechageDist1: 'Coller immédiatement la rustine sans aucune préparation de surface préalable',
            sechageDist2: 'Saupoudrer du sable fin pour sécher rapidement la colle liquide',
            evidenceMethode: ['doigts', 'chambre', 'air'],
            evidenceSechage: ['dissolvant', 'zone', 'poncée'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à tous les participants de notre atelier de mécanique vélo. Je suis ${t.formatrice} et je vais vous guider pas à pas pour réparer une crevaison de pneu comme des professionnels. Première étape : retirez la roue du cadre et utilisez ${t.outil} afin de sortir délicatement la chambre à air sans l’abîmer. Seconde étape : pour localiser la fuite avec précision, le moyen recommandé consiste à ${t.methode}. Dès que vous voyez des bulles, marquez l’endroit avec une craie. Troisième phase : il faut impérativement ${t.sechage}. Ensuite seulement, collez fermement la rustine en pressant pendant trois minutes sans bouger. Dernière étape : avant de tout remonter, vérifiez soigneusement l’intérieur du pneu avec vos doigts pour retirer l’épine ou le bout de verre qui a causé la crevaison.`,
          questions: [
            makeQuestion('Quelle réparation de vélo la formatrice enseigne-t-elle avec méthode ?', 'Le repérage d’une crevaison et la pose rigoureuse d’une rustine', 'Le changement complet de tous les câbles de freins et du guidon de course', 'Le dévoilage des rayons métalliques et l’alignement de la roue arrière', ['crevaison', 'rustine']),
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
            gaineDist1: 'Couper la gaine protectrice en plusieurs tronçons de taille rigoureusement égale',
            gaineDist2: 'Remplir le conduit de colle à bois pour immobiliser la pièce',
            emboutAns: 'Sertir une cosse d’aluminium pour préserver les fils d’acier',
            emboutDist1: 'Nouer le fil d’acier souple autour du rayon métallique le plus proche de la jante',
            emboutDist2: 'Enrouler dix couches de ruban adhésif d’écolier sur le bout',
            evidenceGaine: ['gaine', 'droite'],
            evidenceEmbout: ['embout', 'aluminium', 'brins'],
          },
          {
            animatrice: 'Émilie',
            etape1: 'dévisser la vis de serrage principale au niveau de l’étrier de frein',
            gaine: 'huiler légèrement l’intérieur du conduit avec un lubrifiant adapté',
            embout: 'pincer fermement une capsule de finition avec une pince plate',
            gaineAns: 'Lubrifier délicatement la paroi intérieure du passage de câble',
            gaineDist1: 'Rincer le tuyau intérieur à grande eau puis l’abandonner directement à l’humidité',
            gaineDist2: 'Chauffer la pièce de plastique pour ramollir le passage',
            emboutAns: 'Serrer solidement une capsule de finition à l’aide d’une pince plate',
            emboutDist1: 'Brûler l’extrémité du câble avec une flamme vive pour en faire fondre le métal',
            emboutDist2: 'Torsader le câble à mains nues jusqu’à ce qu’il casse sous tension',
            evidenceGaine: ['huiler', 'conduit', 'lubrifiant'],
            evidenceEmbout: ['capsule', 'finition', 'pince'],
          },
          {
            animatrice: 'Audrey',
            etape1: 'dégager la tête de câble de son logement dans le levier au guidon',
            gaine: 'contrôler la propreté des deux extrémités de la gaine dans leurs butées',
            embout: 'couper l’excédent de fil d’acier à deux centimètres du point d’attache',
            gaineAns: 'Vérifier la propreté des embouchures de la gaine insérées dans les butées',
            gaineDist1: 'Remplacer immédiatement l’ensemble de la potence par un guidon de course neuf',
            gaineDist2: 'Vernir l’extérieur de la gaine avec une peinture laquée colorée',
            emboutAns: 'Sectionner nettement le bout excédentaire à une distance de deux centimètres',
            emboutDist1: 'Laisser pendre négligemment le fil d’acier le long de la chaîne sans y toucher',
            emboutDist2: 'Tresser le bout du fil dans les maillons du dérailleur arrière',
            evidenceGaine: ['propreté', 'extrémités', 'gaine'],
            evidenceEmbout: ['centimètres', 'attache'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bienvenue au cours d’ajustement des freins de vélo. C’est ${t.animatrice} qui vous accompagne aujourd’hui. Quand votre levier touche presque le guidon, il est temps de remplacer le câble d’acier. Voici la séquence obligatoire. D’abord, vous devez ${t.etape1}. Ensuite, retirez l’ancien câble rouillé. Avant d’insérer le nouveau câble neuf, prenez soin de ${t.gaine}. Faites coulisser le fil métallique jusqu’au frein. Tendez le câble fermement avec une pince tout en resserrant la vis de fixation. Pour finir, il est essentiel de ${t.embout}. Testez le freinage à l’arrêt en pressant vigoureusement le levier dix fois de suite pour vérifier qu’il n’y a aucun glissement. Votre sécurité sur la route en dépend directement !`,
          questions: [
            makeQuestion('Quelle procédure mécanique sécuritaire cet atelier enseigne-t-il ?', 'Le remplacement méthodique et l’ajustement d’un nouveau câble de frein', 'La révision générale de tous les engrenages internes du boîtier de pédalier', 'L’installation fixe d’un grand porte-bagages métallique à l’arrière du vélo', ['câble', 'frein']),
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
            motifDist1: 'Un prélèvement abusif au titre des cotisations syndicales de l’ensemble de l’usine',
            motifDist2: 'Le refus de verser le remboursement de frais de déplacement professionnel',
            delaiAns: 'Déposer la réclamation sur le portail d’entreprise avant jeudi midi',
            delaiDist1: 'Faire parvenir une lettre recommandée postale avant la fin du trimestre en cours',
            delaiDist2: 'Prendre rendez-vous avec le directeur général le mois prochain',
            evidenceMotif: ['heures', 'supplémentaires', 'comptabilisées'],
            evidenceDelai: ['jeudi', 'midi'],
          },
          {
            chef: 'François Tremblay',
            motif: 'la prime de quart de soir du mois dernier qui a été omise sur votre talon',
            portail: 'la section intranet des paies en choisissant le formulaire P-102',
            delai: 'avant mercredi dix-sept heures',
            motifAns: 'L’oubli de la prime liée aux quarts de travail en soirée du mois passé',
            motifDist1: 'Une diminution arbitraire du salaire de base fixée par avenant contractuel',
            motifDist2: 'L’absence d’indemnisation pour un arrêt de travail pour maladie',
            delaiAns: 'Compléter l’envoi des pièces justificatives avant mercredi dix-sept heures',
            delaiDist1: 'Attendre passivement la révision générale des contrats annuels en décembre',
            delaiDist2: 'Transmettre un message vocal au superviseur d’ici deux semaines',
            evidenceMotif: ['prime', 'quart', 'omise'],
            evidenceDelai: ['mercredi', 'dix-sept', 'heures'],
          },
          {
            chef: 'Marc Lavoie',
            motif: 'l’erreur d’échelon salarial consécutive à votre promotion du premier mars',
            portail: 'le logiciel de gestion des ressources humaines avec votre code d’employé',
            delai: 'au plus tard vendredi matin',
            motifAns: 'Une mauvaise attribution d’échelon salarial intervenue suite à sa promotion',
            motifDist1: 'Une retenue salariale injustifiée sur l’ensemble des indemnités de repas du midi',
            motifDist2: 'Un désaccord sur le calcul des vacances annuelles accumulées',
            delaiAns: 'Enregistrer la requête dans le système au plus tard vendredi matin',
            delaiDist1: 'Faire viser l’ensemble du dossier par un notaire assermenté dans les trente jours',
            delaiDist2: 'Reporter la correction salariale au prochain exercice financier',
            evidenceMotif: ['échelon', 'salarial', 'promotion'],
            evidenceDelai: ['vendredi', 'matin'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour Martin. J’ai bien reçu ton courriel au sujet de ton dernier talon de paie. Je comprends tout à fait ta frustration concernant ${t.motif}. Ne t’en fais pas, c’est une simple erreur de saisie du système et voici la procédure officielle pour régler la situation rapidement. Connecte-toi d’abord sur ${t.portail}. Tu dois y joindre une copie de tes feuilles de temps signées ainsi qu’une capture d’écran de ton relevé bancaire démontrant le manque à gagner. Dès que tu as soumis le dossier en ligne, envoie-moi le numéro de billet de confirmation par messagerie interne. J’approuverai la demande immédiatement en tant que superviseur. Si tout est fait ${t.delai}, les ressources humaines feront un virement correctif direct dans ton compte.`,
          questions: [
            makeQuestion('Quel différend salarial le superviseur aide-t-il son collaborateur à régulariser ?', t.motifAns, t.motifDist1, t.motifDist2, t.evidenceMotif),
            makeQuestion('Quels justificatifs officiels l’employé doit-il joindre à sa demande numérique ?', 'Ses relevés d’heures approuvés ainsi qu’une copie de son relevé bancaire', 'Une déclaration sous serment formulée devant un représentant des ressources humaines', 'Une attestation médicale confirmant son aptitude au travail en entreprise', ['feuilles', 'temps', 'bancaire']),
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
            probleme: 'une double retenue d’assurance collective prélevée par erreur sur votre chèque',
            preuve: 'votre formulaire d’adhésion original confirmant le régime individuel choisi',
            conseillerTexte: 'la conseillère attitrée, Chantal Lévesque, au poste téléphonique 412',
            problemeAns: 'Un prélèvement dédoublé au titre du régime d’assurance collective',
            problemeDist1: 'Une saisie sur salaire ordonnée formellement par une cour de justice municipale',
            problemeDist2: 'Un défaut de versement de la prime de fin d’année convenue',
            preuveAns: 'Le formulaire d’adhésion original certifiant la couverture individuelle retenue',
            preuveDist1: 'Un extrait complet du casier judiciaire vierge remis par les services de police',
            preuveDist2: 'Une copie du certificat de qualification professionnelle du travailleur',
            evidenceProbleme: ['double', 'retenue', 'assurance'],
            evidencePreuve: ['adhésion', 'individuel'],
          },
          {
            gestionnaire: 'Monique Bélanger',
            probleme: 'une déduction incorrecte pour les cotisations au régime de retraite volontaire',
            preuve: 'votre contrat d’embauche mentionnant expressément le taux de cotisation retenu',
            conseillerTexte: 'le conseiller attitré, Patrick Simard, à la division des avantages sociaux',
            problemeAns: 'Une retenue excessive appliquée aux cotisations de retraite volontaire',
            problemeDist1: 'Une retenue erronée d’impôt fédéral calculée sur la base d’un salaire fictif',
            problemeDist2: 'L’annulation imprévue de ses jours de congés parentaux accumulés',
            preuveAns: 'Le contrat d’embauche mentionnant le taux de déduction de retraite convenu',
            preuveDist1: 'Une longue lettre d’appui rédigée par un ancien collègue d’une autre entreprise',
            preuveDist2: 'Un relevé de kilométrage parcouru au volant de son véhicule privé',
            evidenceProbleme: ['déduction', 'retraite', 'volontaire'],
            evidencePreuve: ['contrat', 'embauche', 'cotisation'],
          },
          {
            gestionnaire: 'Carole Fortin',
            probleme: 'une retenue fiscale provinciale calculée avec un mauvais code de déduction',
            preuve: 'le formulaire officiel de déclaration des crédits d’impôt TP-1015 signé',
            conseillerTexte: 'le conseiller attitré, Marc Bédard, au bureau de paie',
            problemeAns: 'Une retenue d’impôt provincial erronée causée par un code fiscal inadéquat',
            problemeDist1: 'Une déduction financière injustifiée pour un repas pris à la cantine d’entreprise',
            problemeDist2: 'Une suspension de salaire liée à une absence pour motifs syndicaux',
            preuveAns: 'Le formulaire fiscal provincial TP-1015 attestant des crédits d’impôt applicables',
            preuveDist1: 'Un reçu officiel de paiement de taxes municipales sur sa résidence personnelle',
            preuveDist2: 'Une attestation de domicile délivrée par le bureau de poste du quartier',
            evidenceProbleme: ['retenue', 'fiscale', 'déduction'],
            evidencePreuve: ['crédits', 'impôt', 'TP-1015'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour Alexandre. Je viens de vérifier les montants avec le service de paie concernant ${t.probleme}. C’est fâcheux, mais nous avons une démarche bien balisée pour rembourser le montant perçu en trop. Première étape : remplis la demande de redressement de paie disponible sur notre portail intranet d’entreprise. Seconde étape : joins en pièce jointe ${t.preuve}. Troisième phase : transmets le tout directement à ${t.conseillerTexte}, en me mettant en copie conforme pour que j’appose ma validation. Le service financier s’est engagé à émettre un paiement correctif d’ici vendredi si le dossier est complet avant midi demain. Passe à mon bureau si tu as besoin d’aide pour remplir les sections du formulaire.`,
          questions: [
            makeQuestion('Quel prélèvement indu sur la paie cette démarche vise-t-elle à régulariser ?', t.problemeAns, t.problemeDist1, t.problemeDist2, t.evidenceProbleme),
            makeQuestion('Quelle pièce justificative officielle doit impérativement accompagner la demande ?', t.preuveAns, t.preuveDist1, t.preuveDist2, t.evidencePreuve),
            makeQuestion('À quelle condition le service des finances promet-il un paiement correctif d’ici vendredi ?', 'La transmission du dossier complet avant midi le lendemain', 'La démission immédiate de l’employé avec renonciation aux indemnités', 'L’approbation formelle de l’assemblée générale des actionnaires', ['midi', 'demain', 'vendredi']),
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
            etapeDist1: 'Démonter entièrement les deux roues ainsi que le plateau avant du pédalier',
            etapeDist2: 'Tordre la patte de fixation vers l’extérieur avec un levier en fer',
            verifAns: 'Actionner le pédalier à la main en passant une par une les vitesses',
            verifDist1: 'Rouler à vive allure dans une pente très abrupte sans tenir le guidon du vélo',
            verifDist2: 'Secouer vigoureusement le cadre pour vérifier la solidité de la selle',
            evidenceEtape: ['chaîne', 'petit', 'pignon'],
            evidenceVerif: ['pédalier', 'vitesses'],
          },
          {
            animatrice: 'Geneviève',
            etape: 'relâcher la tension du câble en plaçant la manette au repos complet',
            outil: 'une clé hexagonale de quatre millimètres pour aligner le dérailleur',
            verification: 'contrôler l’alignement visuel entre le galet et chaque pignon',
            etapeAns: 'Placer la manette au repos afin de libérer toute la tension du câble',
            etapeDist1: 'Tendre au maximum le câble métallique jusqu’à frôler la limite de rupture nette',
            etapeDist2: 'Retirer les patins de frein pour faire de la place autour de la jante',
            verifAns: 'Vérifier visuellement l’alignement parfait du galet sous chaque pignon',
            verifDist1: 'Laisser le vélo entièrement immergé dans un ruisseau pour en rincer la mécanique',
            verifDist2: 'Frapper sur les pignons avec une massette pour tester leur dureté',
            evidenceEtape: ['relâcher', 'tension', 'manette'],
            evidenceVerif: ['alignement', 'galet', 'pignon'],
          },
          {
            animatrice: 'Christine',
            etape: 'nettoyer soigneusement les maillons de la chaîne pour enlever toute saleté',
            outil: 'la molette de tension située à l’extrémité du levier au guidon',
            verification: 'tendre l’oreille pour détecter tout frottement métallique anormal',
            etapeAns: 'Nettoyer méticuleusement chaque maillon métallique pour retirer la crasse',
            etapeDist1: 'Recouvrir les maillons métalliques d’un enduit étanche sans retirer la saleté',
            etapeDist2: 'Scier un maillon sur deux pour alléger le poids de la transmission',
            verifAns: 'Écouter attentivement pour s’assurer de l’absence de frottement métallique',
            verifDist1: 'Mesurer avec précision la température de la jante après un freinage prolongé',
            verifDist2: 'Compter le nombre de dents de chaque plateau avec une loupe',
            evidenceEtape: ['maillons', 'chaîne'],
            evidenceVerif: ['oreille', 'frottement', 'métallique'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour chers cyclistes ! Dans cet atelier consacré au réglage de la transmission, je vous montre la méthode exacte pour éliminer les sauts de chaîne désagréables. Étape numéro un : commencez par ${t.etape}. Étape numéro deux : utilisez ${t.outil}. En tournant d’un quart de tour à la fois, vous devez éliminer l’espace qui provoque le déraillement. Étape numéro trois : tournez la molette de tension du câble d’un demi-tour dans le sens antihoraire si la chaîne hésite à monter. Étape numéro quatre : pour la vérification finale, prenez soin de ${t.verification}. Si chaque changement de vitesse s’opère avec fluidité et silence, votre transmission est parfaitement synchronisée. Rangez vos outils et venez faire un tour d’essai dans la cour !`,
          questions: [
            makeQuestion('Quel composant mécanique de la bicyclette cet atelier apprend-il à régler ?', 'Le mécanisme de transmission et le passage des vitesses du vélo', 'L’ajustement complet de la selle et l’inclinaison du guidon de course', 'La pression d’air optimale recommandée pour les pneus tout-terrain', ['transmission', 'vitesses']),
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
            defiDist1: 'Une grève générale imprévue ayant interrompu les transports dans toute la ville',
            defiDist2: 'Une cyberattaque ayant détruit l’ensemble des données comptables',
            cadeauAns: 'Une demi-journée de congé payée accordée à tous le vendredi',
            cadeauDist1: 'L’obligation d’effectuer des heures de nuit durant trois semaines',
            cadeauDist2: 'La suspension des augmentations pour absorber les surcoûts récents',
            evidenceDefi: ['personnel', 'approvisionnement'],
            evidenceCadeau: ['vendredi', 'repos', 'payé'],
          },
          {
            directrice: 'Madame Bélanger',
            taux: 'cent quinze pour cent des cibles de fidélisation de la clientèle',
            defi: 'la période d’adaptation exigeante liée à notre nouvelle plateforme informatique',
            cadeau: 'une prime de reconnaissance exceptionnelle versée avec le prochain salaire',
            defiAns: 'La transition complexe vers le nouveau logiciel informatique de travail',
            defiDist1: 'La démission soudaine et imprévue de la totalité des cadres supérieurs de la boîte',
            defiDist2: 'Un incendie survenu dans les bureaux du siège social en janvier',
            cadeauAns: 'Une prime exceptionnelle de reconnaissance accordée sur le prochain salaire',
            cadeauDist1: 'Une diminution imposée du nombre de semaines de congés payés autorisées cet été',
            cadeauDist2: 'L’imposition d’une tenue uniforme achetée aux frais des salariés',
            evidenceDefi: ['adaptation', 'plateforme', 'informatique'],
            evidenceCadeau: ['prime', 'reconnaissance', 'salaire'],
          },
          {
            directrice: 'Madame Bouchard',
            taux: 'l’ensemble des livrables demandés avec deux semaines d’avance',
            defi: 'les échéances très serrées imposées pour achever ce contrat d’envergure',
            cadeau: 'un repas convivial de célébration entièrement pris en charge par l’entreprise',
            defiAns: 'Le calendrier extrêmement serré imparti pour mener à bien le contrat',
            defiDist1: 'La perte définitive des accès téléphoniques pendant un mois complet',
            defiDist2: 'Une annulation du projet décidée par le client avant la reprise',
            cadeauAns: 'Un repas convivial et festif pris en charge par la direction',
            cadeauDist1: 'L’obligation de travailler tous les samedis jusqu’à la fin du trimestre',
            cadeauDist2: 'Le retrait des pauses de travail quotidiennes durant deux mois',
            evidenceDefi: ['échéances', 'serrées', 'contrat'],
            evidenceCadeau: ['repas', 'convivial', 'célébration'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Bonjour à toute l’équipe ! Je tenais à vous réunir aujourd’hui pour faire le bilan de notre troisième trimestre, et je dois vous dire que je suis immensément fière de chacun d’entre vous. Les chiffres viennent de tomber : nous avons atteint ${t.taux} ! Compte tenu des défis importants auxquels nous avons fait face ces derniers mois, notamment ${t.defi}, ce résultat est tout simplement remarquable. Votre solidarité, vos efforts continus et votre créativité ont fait toute la différence. Je tiens à vous exprimer ma plus sincère reconnaissance. Pour souligner cette belle réussite collective comme il se doit, la direction générale a approuvé ${t.cadeau}. Prenez ce temps pour vous reposer et célébrer, vous l’avez amplement mérité ! Félicitations à tous !`,
          questions: [
            makeQuestion('Quel sentiment dominant la directrice exprime-t-elle avec chaleur ?', 'Une grande fierté devant l’atteinte des objectifs collectifs de l’équipe', 'Une vive inquiétude financière quant à la rentabilité future de l’ensemble de l’organisation', 'Un vif mécontentement causé par le non-respect répété des délais convenus initialement', ['fière', 'bilan', 'objectifs']),
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
            noteDist1: 'Un avertissement sévère exigeant une remise aux normes sous trente jours',
            noteDist2: 'Une mise en demeure officielle pour pollution de l’environnement',
            reconfortAns: 'Des cartes-cadeaux de détente accompagnées d’un après-midi festif au travail',
            reconfortDist1: 'Une réduction drastique de moitié des journées de télétravail hebdomadaires autorisées',
            reconfortDist2: 'Une pénalité financière retenue sur la rémunération mensuelle',
            evidenceNote: ['excellente', 'manquement', 'inspecteurs'],
            evidenceReconfort: ['cartes-cadeaux', 'détente', 'festif'],
          },
          {
            cheffe: 'Monique',
            audit: 'l’inspection provinciale de qualité des services aux usagers',
            note: 'les félicitations officielles du comité d’inspection pour nos dossiers',
            reconfort: 'une journée complète de ressourcement pour tous les départements',
            noteAns: 'Les félicitations formelles du comité saluant la rigueur des dossiers',
            noteDist1: 'Un blâme public adressé à la direction pour mauvaise gestion des usagers',
            noteDist2: 'Une recommandation de fermer temporairement le service d’accueil',
            reconfortAns: 'L’attribution d’une journée entière de ressourcement à tout le personnel',
            reconfortDist1: 'L’obligation stricte de suivre des cours magistraux du soir chaque semaine ouvrable',
            reconfortDist2: 'Le gel complet des embauches pour l’année à venir',
            evidenceNote: ['félicitations', 'comité', 'dossiers'],
            evidenceReconfort: ['journée', 'ressourcement', 'départements'],
          },
          {
            cheffe: 'Isabelle',
            audit: 'l’évaluation externe de sécurité informatique de nos serveurs',
            note: 'la mention d’excellence la plus haute jamais décernée à notre firme',
            reconfort: 'une enveloppe budgétaire spéciale pour rénover notre salle de pause',
            noteAns: 'La distinction d’excellence maximale octroyée pour la première fois à la firme',
            noteDist1: 'Un rapport critique pointant d’innombrables failles de sécurité',
            noteDist2: 'Une amende forfaitaire imposée pour non-respect des protocoles de sécurité',
            reconfortAns: 'Un budget dédié au réaménagement complet de la salle de pause de l’équipe',
            reconfortDist1: 'Le remplacement forcé de l’ensemble du matériel informatique aux frais des salariés',
            reconfortDist2: 'L’interdiction formelle d’utiliser Internet pour le travail quotidien',
            evidenceNote: ['excellence', 'haute', 'firme'],
            evidenceReconfort: ['enveloppe', 'budgétaire', 'pause'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Merci à tous d’être venus. J’ai les résultats officiels de ${t.audit}, et je ne peux cacher ma fierté. Nous avons obtenu ${t.note} ! Lorsque nous avons commencé ce chantier il y a six mois, plusieurs personnes doutaient de notre capacité à réussir dans des délais aussi courts. Vous avez fait preuve d’une rigueur remarquable, en révisant chaque procédure et en vous entraidant sans compter vos heures. Je suis touchée par votre dévouement constant. Pour souligner cette très belle réussite qui met en valeur notre équipe, j’ai le plaisir de vous annoncer ${t.reconfort}. Merci sincèrement pour votre excellent travail !`,
          questions: [
            makeQuestion('Pourquoi la cheffe d’équipe convoque-t-elle ses collègues avec enthousiasme ?', 'Pour souligner le succès éclatant obtenu lors de l’audit externe', 'Pour planifier le licenciement économique de plusieurs employés', 'Pour dénoncer les retards accumulés dans la livraison des dossiers', ['audit', 'résultats', 'fierté']),
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
            causeDist1: 'Un manquement disciplinaire très grave figurant au dossier scolaire de l’étudiant',
            causeDist2: 'L’omission d’envoyer son certificat de naissance avec la demande',
            soutienAns: 'S’accorder quelques journées de repos pour accuser le coup avant d’agir',
            soutienDist1: 'S’expatrier immédiatement vers un autre pays pour renoncer à tout travail au Québec',
            soutienDist2: 'Déposer une plainte au tribunal contre la direction du collège',
            evidenceCause: ['test', 'sélection', 'seuil'],
            evidenceSoutien: ['jours', 'repos', 'demande'],
          },
          {
            ami: 'Samuel',
            programme: 'en techniques de réadaptation physique au cégep',
            cause: 'le grand nombre de candidatures pour très peu de places disponibles',
            soutien: 'suivre des cours de perfectionnement pour bonifier ma candidature future',
            causeAns: 'La forte concurrence générée par un nombre très restreint de places offertes',
            causeDist1: 'L’absence remarquée d’une lettre de recommandation signée par un ancien enseignant',
            causeDist2: 'Une mauvaise note obtenue à un test de dépistage physique obligatoire',
            soutienAns: 'Suivre des cours de perfectionnement en vue d’enrichir un futur dossier',
            soutienDist1: 'Cesser définitivement toute activité scolaire pour chercher un emploi non qualifié',
            soutienDist2: 'Boycotter l’ensemble des institutions d’enseignement collégial de la province',
            evidenceCause: ['candidatures', 'places', 'disponibles'],
            evidenceSoutien: ['perfectionnement', 'candidature', 'future'],
          },
          {
            ami: 'Mathieu',
            programme: 'en soins préhospitaliers d’urgence pour ambulanciers',
            cause: 'le stress de l’entrevue m’a fait perdre mes repères devant le comité',
            soutien: 'consulter un conseiller en orientation pour explorer d’autres voies',
            causeAns: 'La perte de moyens liée à l’anxiété ressentie lors de l’entrevue de sélection',
            causeDist1: 'Le rejet automatique de son permis de conduire pour cause d’infraction',
            causeDist2: 'L’impossibilité de fournir un relevé médical certifié par un médecin',
            soutienAns: 'Consulter un professionnel de l’orientation pour analyser d’autres options',
            soutienDist1: 'S’inscrire sans attendre à un concours d’officier de l’armée étrangère',
            soutienDist2: 'Exiger une révision judiciaire immédiate de la décision du comité',
            evidenceCause: ['stress', 'entrevue', 'repères'],
            evidenceSoutien: ['conseiller', 'orientation', 'voies'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Allô Jean... C’est ${t.ami}. Je t’appelle parce que j’ai reçu la réponse ce matin et je suis vraiment découragé. J’ai été refusé ${t.programme}. C’est difficile à encaisser après avoir passé tout mon hiver à réviser et à me préparer chaque fin de semaine. La lettre de refus indique que ${t.cause}. J’ai l’impression que mes efforts n’ont pas suffi et j’ai le moral à plat depuis deux heures. Je ne sais plus trop comment envisager la suite pour le moment. Mon père me dit que ce n’est pas la fin du monde et qu’il existe d’autres avenues, mais là, j’ai surtout besoin de ${t.soutien}. Merci d’être là pour m’écouter sans me juger, ça me fait du bien d’en parler avec toi.`,
          questions: [
            makeQuestion('Quel état d’esprit douloureux l’ami partage-t-il au téléphone ?', 'Un profond découragement consécutif au refus de son admission', 'Une grande joie d’avoir réussi la première épreuve éliminatoire', 'Une indifférence totale envers la décision rendue par le collège', ['découragé', 'refusé']),
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
            altAns: 'Entreprendre une année préparatoire en sciences biomédicales pour améliorer ses notes',
            altDist1: 'Renoncer définitivement aux études supérieures pour travailler comme aide-animalière non qualifiée',
            altDist2: 'Tenter sa chance dans un conservatoire de musique sans préparation',
            evidenceReve: ['soigner', 'animaux', 'enfance'],
            evidenceAlt: ['sciences', 'biomédicales', 'notes'],
          },
          {
            amie: 'Mélissa',
            universite: 'en pharmacie clinique à l’Université Laval',
            reve: 'travailler en milieu hospitalier auprès des aînés',
            alternative: 'suivre un certificat universitaire complémentaire pour enrichir mes compétences',
            altAns: 'Compléter un certificat universitaire pour renforcer la valeur de son profil',
            altDist1: 'Ouvrir sans diplôme requis un petit commerce indépendant de vente de produits naturels',
            altDist2: 'Partir vivre dans un pays étranger sans donner d’explications',
            evidenceReve: ['hospitalier', 'aînés'],
            evidenceAlt: ['certificat', 'complémentaire', 'compétences'],
          },
          {
            amie: 'Laurence',
            universite: 'en physiothérapie à l’Université de Sherbrooke',
            reve: 'soutenir les personnes blessées pour retrouver leur mobilité',
            alternative: 'm’inscrire dans une filière voisine pour faire une nouvelle demande l’an prochain',
            altAns: 'Intégrer une filière connexe afin de retenter sa chance l’année suivante',
            altDist1: 'Déposer une poursuite judiciaire contre le doyen de la faculté de médecine',
            altDist2: 'Abandonner toute ambition dans le secteur des soins de santé',
            evidenceReve: ['personnes', 'blessées', 'mobilité'],
            evidenceAlt: ['filière', 'voisine', 'demande'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Salut Julie... Je t’écris avec le cœur gros. Je viens d’ouvrir le portail d’admission ${t.universite} et ma candidature n’a pas été retenue. Je me sens vraiment triste et déçue. Tu sais à quel point c’était mon rêve de ${t.reve}. J’ai maintenu de très bonnes notes pendant tout mon parcours collégial et j’ai fait du bénévolat pour consolider mon dossier. Voir une lettre impersonnelle écarter mes projets après tant d’efforts, c’est dur à accepter. Pour l’instant, j’ai de la difficulté à voir le côté positif. Quand le choc sera passé, j’envisagerai probablement de ${t.alternative}. Mais pour aujourd’hui, j’ai simplement besoin d’en parler avec une amie et de souffler un peu.`,
          questions: [
            makeQuestion('Quelle triste nouvelle l’amie partage-t-elle avec émotion ?', 'Le refus de son admission dans le programme universitaire souhaité', 'La perte inattendue de son emploi à temps partiel à la clinique', 'L’annulation de son stage d’observation auprès d’une équipe sportive', ['admission', 'candidature', 'retenue']),
            makeQuestion('Quelle aspiration de longue date motivait particulièrement son projet d’études ?', 'Le souhait profond de concrétiser une vocation née dès l’enfance', 'Le désir de percevoir un salaire très élevé dès la fin du baccalauréat', 'La volonté de diriger un département sans jamais être en contact avec le public', ['rêve', 'efforts']),
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
            remarqueDist1: 'Les rabais massifs et exceptionnels accordés sur les produits périmés de la semaine',
            remarqueDist2: 'La présence d’une aire de stationnement souterrain entièrement gratuite',
            feteAns: 'Un rassemblement de cinq à sept offrant des bouchées de produits du terroir',
            feteDist1: 'Une garde de nuit obligatoire imposée à tous les employés pour effectuer le grand ménage',
            feteDist2: 'Une formation disciplinaire sur le maniement des caisses enregistreuses',
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
            remarqueDist1: 'La gratuité complète de l’ensemble des bandes dessinées et albums pour les jeunes enfants',
            remarqueDist2: 'L’ouverture continue du commerce vingt-quatre heures sur vingt-quatre',
            feteAns: 'Un déjeuner matinal d’équipe garni de viennoiseries offert par la gérance',
            feteDist1: 'Une corvée dominicale fastidieuse d’inventaire manuel réalisée dans l’arrière-boutique',
            feteDist2: 'Un avertissement collectif sur les risques de vol à l’étalage',
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
            remarqueDist1: 'La distribution d’échantillons de tentes sans aucune contrepartie',
            remarqueDist2: 'La reprise sans limite de vieux équipements de sport usagés',
            feteAns: 'Une soirée de célébration amicale incluant un tirage de cartes-cadeaux',
            feteDist1: 'Une inspection surprise des casiers personnels par les services de sécurité',
            feteDist2: 'Une retenue sur salaire pour compenser les pertes de lancement',
            evidenceRemarque: ['expertise', 'vendeurs', 'conseils'],
            evidenceFete: ['soirée', 'festive', 'cartes-cadeaux'],
          },
        ]
        const t = tuples[Math.floor(rand() * tuples.length)]
        return {
          text: `— Chère équipe, rassemblez-vous deux minutes avant la fermeture ! Je ne pouvais pas vous laisser partir ce soir sans vous féliciter chaleureusement pour l’inauguration ${t.commerce}. Cette journée a dépassé nos prévisions les plus optimistes : nous avons vu ${t.affluence} ! Malgré la foule importante et le rythme soutenu à la caisse, vous avez conservé votre calme, votre sourire et votre professionnalisme. Plusieurs clients m’ont fait part de leur appréciation devant ${t.remarque}. Je suis très fier de diriger une équipe aussi engagée et efficace. Demain soir, la direction vous convie à ${t.fete}. Merci du fond du cœur pour votre belle énergie aujourd’hui !`,
          questions: [
            makeQuestion('Quel bilan gratifiant le responsable partage-t-il lors du rassemblement d’équipe ?', 'Une immense fierté devant l’accueil chaleureux réservé par le public', 'Une vive inquiétude face au déficit d’exploitation dès le premier jour', 'Le regret amer d’avoir ouvert les portes trop tôt dans la saison', ['inauguration', 'féliciter', 'journée']),
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
        const slots = [
          { programme: 'Attestation d’études collégiales en bureautique et coordination numérique', duree: 'quatorze mois intensifs', stage: 'un stage en entreprise de quatre cent cinquante heures', prealable: 'un diplôme d’études secondaires ou une expérience équivalente' },
          { programme: 'AEC en gestion de réseaux et cybersécurité', duree: 'seize mois à temps plein', stage: 'un stage crédité en milieu corporatif de quatre cents heures', prealable: 'avoir interrompu ses études régulières depuis au moins deux sessions' },
          { programme: 'AEC en développement Web et médias interactifs', duree: 'douze mois de formation', stage: 'un stage pratique supervisé de trois cent cinquante heures', prealable: 'la réussite d’un test de logique informatique et de français' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FICHE DESCRIPTIVE DE PROGRAMME - CÉGEP DE SAINTE-FOY\nProgramme : ${s.programme}\nCe programme s’adresse aux adultes désireux de réorienter leur carrière vers un secteur en forte demande de main-d’œuvre. La formation s’échelonne sur ${s.duree}, combinant cours théoriques en ligne et travaux dirigés dans les laboratoires informatiques. Le cursus comprend ${s.stage}, permettant une intégration immédiate sur le marché du travail québécois. Les conditions d’admission exigent ${s.prealable}. Les cours sont dispensés de soir et les fins de semaine pour accommoder les personnes en emploi. Les candidats admissibles peuvent bénéficier des prêts et bourses du gouvernement du Québec ainsi que d’un soutien personnalisé pour la rédaction de leur curriculum vitæ. Date limite de dépôt des dossiers : le quinze novembre prochain.`,
          questions: [
            ['Quel type de document officiel est présenté dans cet extrait ?', 'Une fiche descriptive d’une formation collégiale pour adultes', 'Une convention collective encadrant les droits du corps enseignant du cégep', 'Un dépliant publicitaire pour des loisirs sportifs'],
            ['Quelle composante pratique obligatoire le parcours intègre-t-il ?', 'Un stage crédité en milieu de travail de plusieurs centaines d’heures', 'Un voyage d’études à l’étranger pour la session', 'La rédaction d’une recherche théorique publiée dans une revue universitaire'],
            ['Quel aménagement d’horaire est offert pour concilier les études avec l’emploi ?', 'Des séances d’enseignement offertes en soirée ainsi que les fins de semaine', 'Des cours intensifs concentrés durant les vacances estivales', 'Un parcours libre sans aucun horaire fixe imposé'],
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
            ['Quel diplôme professionnel et technique est présenté dans ce guide ?', 'Un cheminement pratique préparant à un métier de chantier', 'Un certificat universitaire de premier cycle orienté vers les arts visuels', 'Un programme court de gestion des espaces verts'],
            ['Quelle reconnaissance sur le marché du travail la réussite assure-t-elle ?', 'L’obtention d’une certification facilitant l’accès aux chantiers', 'La direction immédiate des projets municipaux', 'L’embauche automatique comme cadre supérieur au sein de l’administration'],
            ['Quel avantage matériel gratuit l’établissement met-il à la disposition des élèves ?', 'L’ensemble du matériel de sécurité et la trousse d’outils nécessaires', 'La prise en charge des frais quotidiens de transport', 'Le versement d’une aide pour payer le loyer mensuel'],
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
            ['Quel est l’objet de cette publication municipale estivale ?', 'Présenter les activités sportives et culturelles de la saison', 'Rappeler les consignes strictes sur l’arrosage et la consommation d’eau', 'Annoncer la révision triennale des taxes foncières'],
            ['Quelle offre récréative est accessible gratuitement aux résidents ?', 'Des activités sportives de plein air avec prêt de matériel', 'Des cours privés de pilotage de bateaux à moteur', 'Des leçons d’équitation réservées exclusivement aux sportifs de haut niveau'],
            ['Quelle formalité est exigée pour avoir accès aux ateliers de groupe ?', 'Une inscription obligatoire sur le portail Web municipal dès le début de juin', 'Le paiement d’une cotisation au comptoir d’accueil municipal', 'La présentation d’un certificat médical récent'],
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
            ['Quel type de document d’information locale cet extrait constitue-t-il ?', 'Un calendrier détaillant les propositions de loisirs pour l’automne', 'Un bilan financier exhaustif portant sur les coûts des travaux de voirie', 'Une ordonnance municipale encadrant le stationnement'],
            ['Quelle activité artistique est notamment accessible dans le quartier ?', 'Des ateliers d’expression culturelle ouverts à tout le public', 'Des séances pour apprendre la conduite d’engins', 'Des conférences théoriques sur l’entretien futur des voies ferrées urbaines'],
            ['Quel privilège la possession d’une carte de bibliothèque locale confère-t-elle ?', 'Un accès prioritaire pour s’inscrire aux rendez-vous dont les places sont limitées', 'La gratuité complète des repas dans les commerces locaux', 'L’annulation de l’ensemble des constats d’infraction'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Descriptif de microprogramme universitaire à l'UQAM
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Microprogramme de premier cycle en gestion des ressources humaines', credits: 'quinze crédits universitaires répartis sur cinq cours', formule: 'une formule cent pour cent en ligne avec des classes virtuelles le soir', public: 'les professionnels en gestion d’équipe' },
          { titre: 'Certificat en communication organisationnelle et relations publiques', credits: 'trente crédits échelonnés sur deux années d’études', formule: 'un enseignement hybride combinant visioconférences et ateliers le samedi', public: 'les professionnels en reconversion vers les communications' },
          { titre: 'Microprogramme en gestion de projets dans le secteur communautaire', credits: 'douze crédits axés sur la gouvernance et le financement', formule: 'des cours de fin de semaine intensifs une fois par mois', public: 'les intervenants et coordonnateurs d’organismes à but non lucratif' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉPERTOIRE DES ÉTUDES CONTINUES - UNIVERSITÉ DU QUÉBEC À MONTRÉAL\nProgramme offert : ${s.titre}.\nCette formation courte et flexible comprend ${s.credits}. Conçue spécialement pour les professionnels sur le marché du travail, elle adopte ${s.formule}. Ce programme vise particulièrement ${s.public}. Les cours couvrent la législation du travail, la résolution de conflits, la communication interculturelle et les outils numériques de gestion collaborative. Les étudiants admis bénéficient d’un accès complet aux bibliothèques universitaires et aux bases de données de recherche spécialisées. Il est possible de faire reconnaître des acquis d’expérience professionnelle pour satisfaire aux exigences d’admission sans détenir de diplôme collégial préalable. Les candidatures pour la prochaine session sont acceptées jusqu’au premier août.`,
          questions: [
            ['À quelle clientèle ce programme universitaire s’adresse-t-il en priorité ?', 'Aux travailleurs en poste souhaitant approfondir leurs compétences', 'Aux jeunes du primaire ayant besoin d’un soutien scolaire pendant l’été', 'Aux athlètes préparant une transition olympique'],
            ['Quel mode d’apprentissage souple est offert pour concilier études et travail ?', 'Une formule à distance ou dispensée en dehors des heures de jour', 'Des cours magistraux obligatoires chaque matinée', 'Un séjour d’immersion linguistique complet d’une année en milieu anglophone'],
            ['Quelle mesure d’équivalence favorise l’admission directe des adultes sur le marché ?', 'La valorisation de l’expérience de travail passée pour combler les préalables', 'La reprise systématique des cours secondaires généraux', 'Le versement de frais de scolarité bonifiés au départ'],
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
          { poste: 'Coordonnateur administratif ou coordonnatrice administrative', organisme: 'dans une fondation caritative de Montréal', taches: 'l’accueil des partenaires, la rédaction des comptes rendus et la logistique des réunions', salaire: 'vingt-huit et trente-deux dollars de l’heure selon l’expérience' },
          { poste: 'Adjoint exécutif ou adjointe exécutive à la direction', organisme: 'au sein d’une coopérative de services financiers', taches: 'la gestion des agendas, le suivi des correspondances officielles et l’organisation des déplacements', salaire: 'trente et trente-cinq dollars de l’heure avec régime de retraite' },
          { poste: 'Agent de liaison ou agente de liaison et soutien de bureau', organisme: 'dans une association provinciale pour l’environnement', taches: 'la gestion des adhésions, l’envoi des infolettres et le soutien administratif aux chargés de projet', salaire: 'vingt-sept et trente et un dollars de l’heure avec horaire flexible' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `OFFRE D’EMPLOI - RECRUTEMENT IMMÉDIAT\nTitre du poste : ${s.poste}\nNotre organisation, située ${s.organisme}, est à la recherche d’une personne dynamique, rigoureuse et organisée pour pourvoir un poste permanent à temps plein de trente-cinq heures par semaine. Sous la supervision de la direction générale, vos responsabilités principales incluront ${s.taches}. Vous assurerez également la mise à jour des banques de données et le classement des dossiers financiers. Le profil recherché comprend un diplôme collégial en bureautique ou équivalent, une excellente maîtrise du français écrit et une aisance avec la suite logicielle Microsoft 365. Le salaire offert se situe entre ${s.salaire}, avec une gamme complète d’avantages sociaux après trois mois. Faites parvenir votre lettre de motivation avant le vingt-cinq mai.`,
          questions: [
            ['Quel poste permanent est décrit dans cette offre de recrutement ?', 'Un emploi de soutien et de coordination administrative en bureau', 'Un poste d’ouvrier spécialisé en électromécanique au sein d’un atelier de nuit', 'Un contrat de livraison pour le transport de colis'],
            ['Quelles tâches courantes font partie du quotidien du poste ?', 'L’accueil des partenaires et la gestion des dossiers de bureau', 'La préparation des repas pour les réceptions', 'La révision technique de l’ensemble des camionnettes de service de l’organisme'],
            ['Quelle exigence linguistique formelle est indispensable pour poser sa candidature ?', 'Une excellente maîtrise de la rédaction et de la communication écrite en français', 'La pratique fluide de quatre langues vivantes étrangères', 'Un certificat officiel délivré par un ordre de traducteurs'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Offre d'emploi - Technicien(ne) en soutien informatique
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Technicien ou technicienne en informatique et réseau', employeur: 'au Centre de services scolaire Marguerite-Bourgeoys', responsabilites: 'l’installation des postes de travail, le dépannage technique des enseignants et la maintenance du matériel', horaire: 'trente-cinq heures par semaine sur un horaire de jour' },
          { titre: 'Spécialiste de soutien aux utilisateurs et infrastructures', employeur: 'à l’Institut de cardiologie de Montréal', responsabilites: 'la gestion des accès réseau, le support téléphonique d’urgence et le remplacement des pièces défectueuses', horaire: 'quarts de travail rotatifs avec primes de fin de semaine' },
          { titre: 'Technicien ou technicienne au service d’assistance technique', employeur: 'dans une grande société d’État québécoise', responsabilites: 'le diagnostic à distance des pannes logicielles, la configuration des téléphones et le suivi des demandes', horaire: 'formule hybride avec deux jours de télétravail par semaine' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `OFFRE DE CARRIÈRE - SECTEUR PUBLIC QUÉBÉCOIS\nPoste : ${s.titre}, en poste régulier ${s.employeur}.\nRelevant du coordonnateur des technologies de l’information, la personne titulaire aura comme mandat principal d’assurer le bon fonctionnement du parc informatique. Les tâches comprendront ${s.responsabilites}. La personne participera également à l’inventaire du matériel et à la sensibilisation des utilisateurs aux pratiques de cybersécurité. Nous recherchons un candidat titulaire d’un DEC ou d’un DEP en soutien informatique avec au moins deux années d’expérience pertinente. Le poste offre un horaire régulier de ${s.horaire}, un fonds de pension gouvernemental très avantageux et quatre semaines de vacances dès la première année. Les candidatures doivent être déposées sur notre portail d’embauche avant le trente avril.`,
          questions: [
            ['Quel profil professionnel est recherché par cet organisme public ?', 'Un spécialiste du soutien aux usagers et du matériel informatique', 'Un chef cuisinier responsable des menus au sein d’un établissement réputé', 'Un gardien de sécurité affecté à la surveillance'],
            ['Quelle mission opérationnelle précise est assignée au technicien ?', 'L’installation des postes et la résolution des pannes courantes', 'La négociation des ententes internationales', 'Le calcul comptable et la validation des salaires des membres de la direction'],
            ['Quel avantage social avantageux est accordé dès la première année en poste ?', 'Quatre semaines de congés payés ainsi que l’adhésion à un fonds de pension', 'L’attribution d’un véhicule de service pour les fins de semaine', 'Une prime d’embauche versée sous forme d’actions'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article biographique d'une scientifique québécoise (fictional)
    Object.assign(
      (rand) => {
        const slots = [
          { nom: 'Docteure Joanne Tremblay', origine: 'dans un village côtier de la péninsule gaspésienne', discipline: 'l’océanographie et la préservation des écosystèmes marins du Saint-Laurent', prix: 'le prix scientifique Marie-Victorin du gouvernement du Québec' },
          { nom: 'Docteure Céline Beaulieu', origine: 'dans une famille agricole de la région du Saguenay', discipline: 'la microbiologie des sols boréaux et la régénération des forêts', prix: 'l’Ordre national du Québec pour sa contribution à la biodiversité' },
          { nom: 'Docteure Hélène Desbiens', origine: 'dans les quartiers populaires de l’est de Montréal', discipline: 'la recherche en thérapie génique contre les maladies infantiles rares', prix: 'la médaille d’or du Conseil de recherches médicales du Canada' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PORTRAIT BIOGRAPHIQUE - UNE CHERCHEUSE PIONNIÈRE DU QUÉBEC\nNée ${s.origine}, ${s.nom} a toujours été animée par une grande curiosité pour le monde vivant. Dès son enfance, elle observait la nature avec une rigueur qui annonçait déjà son intérêt pour la recherche. Après de solides études à l’Université Laval et un séjour de recherche en Europe, elle est devenue une référence reconnue dans le domaine de ${s.discipline}. Tout au long de son parcours, elle a publié de nombreux articles scientifiques et formé plusieurs étudiants aux cycles supérieurs. En reconnaissance de ses découvertes importantes, elle a reçu ${s.prix}. Au-delà de ses travaux au laboratoire, elle milite avec conviction pour encourager les jeunes filles à choisir des carrières en sciences. Une chercheuse remarquable dont le parcours inspire la relève scientifique d’ici.`,
          questions: [
            ['Quel est le sujet de cet article biographique paru dans la revue ?', 'Le cheminement professionnel remarquable d’une scientifique d’ici', 'Une critique littéraire consacrée au dernier roman à succès d’un auteur connu', 'Une entrevue politique avec une candidate aux élections'],
            ['Dans quelle discipline la chercheuse s’est-elle illustrée ?', 'Des recherches appliquées touchant les sciences et l’environnement', 'L’archéologie des civilisations disparues', 'La conception de technologies militaires pour des fusées de combat aérien'],
            ['Quel engagement social poursuit-elle parallèlement à ses projets de recherche ?', 'L’encouragement actif des jeunes filles à choisir des études en sciences', 'Le refus de tout outil numérique à l’école primaire', 'L’opposition aux subventions gouvernementales pour la science'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Portrait d'un chef cuisinier mettant en valeur le terroir (fictional)
    Object.assign(
      (rand) => {
        const slots = [
          { chef: 'Renaud Simard', restaurant: 'son établissement réputé du centre-ville', philosophie: 'sublimer les produits sauvages de la forêt boréale et le terroir québécois', honneur: 'du titre honorifique d’ambassadeur de notre gastronomie' },
          { chef: 'Mathieu Caron', restaurant: 'sa cabane gourmande établie en campagne', philosophie: 'réinventer les traditions culinaires rustiques avec créativité et audace', honneur: 'de plusieurs distinctions prestigieuses remises par ses pairs' },
          { chef: 'Marianne Lemieux', restaurant: 'sa table de bord de mer dans le Bas-Saint-Laurent', philosophie: 'valoriser les algues marines, les herbes de grève et les poissons côtiers', honneur: 'du prix convoité de chef de l’année au gala québécois' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FIGURES MARQUANTES DE CHEZ NOUS - LE CHEF DU TERROIR\nReconnu comme un créateur culinaire marquant de sa génération, ${s.chef} a profondément renouvelé la cuisine régionale au Québec. Après une jeunesse modeste en région, il a perfectionné son art dans de grandes cuisines avant de s’établir à son compte. En ouvrant ${s.restaurant}, il a proposé une approche nouvelle : ${s.philosophie}. Il a bâti des liens solides avec de petits producteurs agricoles, des cueilleurs de plantes sauvages et des pêcheurs locaux. Pour souligner son apport marquant à notre culture de la table, il a été décoré ${s.honneur}. Aujourd’hui formateur auprès des jeunes cuisiniers, il transmet l’importance de valoriser les ressources locales et les saisons.`,
          questions: [
            ['Quelle figure du monde culinaire ce texte met-il en valeur ?', 'Un chef québécois renommé valorisant les produits du terroir', 'Un dirigeant ayant bâti un réseau international de restaurants franchisés', 'Un critique gastronomique animant une émission'],
            ['Quelle démarche gastronomique distinctive caractérise sa cuisine ?', 'La valorisation créative des ingrédients régionaux et sauvages', 'L’importation massive d’aliments exotiques par avion', 'L’utilisation systématique de produits industriels transformés sous vide'],
            ['Quelle reconnaissance officielle lui a été décernée pour sa carrière marquante ?', 'Une prestigieuse marque de distinction célébrant sa contribution à la table', 'Un grade universitaire honorifique remis à l’étranger', 'Une médaille militaire pour des actes de bravoure civique'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Offre d'emploi - Préposé(e) aux bénéficiaires
    Object.assign(
      (rand) => {
        const slots = [
          { titre: 'Préposé ou préposée aux bénéficiaires', etablissement: 'en centre d’hébergement de soins de longue durée (CHSLD)', soins: 'l’aide à l’alimentation, l’hygiène corporelle et la mobilisation sécuritaire des résidents âgés', exigences: 'détenir une attestation professionnelle (AEP) et une carte de secourisme à jour' },
          { titre: 'Auxiliaire aux services de santé et sociaux', etablissement: 'au soutien à domicile du CLSC local', soins: 'l’accompagnement quotidien, la préparation de repas légers et la surveillance bienveillante', exigences: 'posséder un diplôme secondaire et un permis de conduire valide avec voiture' },
          { titre: 'Préposé ou préposée aux soins généraux', etablissement: 'dans une résidence privée pour aînés certifiée', soins: 'la distribution des plateaux de repas, l’aide au lever et l’animation d’activités de détente', exigences: 'démontrer une grande empathie, de la patience et une bonne endurance physique' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `AVIS DE RECRUTEMENT EN SANTÉ - EMPLOI ESSENTIEL\nTitre d’emploi : ${s.titre}, ${s.etablissement}.\nNous recrutons des personnes bienveillantes et engagées pour offrir des soins personnalisés à notre clientèle vulnérable. Votre rôle quotidien sera au cœur du confort des personnes hébergées : vos responsabilités comprendront ${s.soins}. Vous travaillerez en étroite collaboration avec l’équipe d’infirmières pour signaler tout changement dans l’état de santé des usagers. Les exigences du poste demandent de ${s.exigences}. Nous offrons un salaire horaire débutant à vingt-six dollars de l’heure avec des primes de soir et de nuit bonifiées, ainsi qu’une conciliation travail-famille exemplaire. Plusieurs postes permanents sont offerts à temps plein ou à temps partiel. Postulez dès aujourd’hui en joignant votre relevé de notes !`,
          questions: [
            ['Quel métier essentiel du secteur des soins cette annonce recrute-t-elle ?', 'Un poste d’accompagnement et d’aide quotidienne auprès des aînés', 'Un ingénieur responsable du parc d’équipements biomédicaux hospitaliers', 'Un pharmacien cadre supervisant les stocks de garde'],
            ['Quelles tâches de bienveillance courante le poste comprend-il ?', 'L’assistance aux repas, à la mobilité et aux soins de confort', 'Des interventions chirurgicales complexes au bloc', 'La rénovation des circuits électriques et des systèmes de ventilation du bloc'],
            ['Quelle qualification fait partie des exigences formulées pour poser sa candidature ?', 'Une formation reconnue en assistance à la personne ou des qualités humaines solides', 'Un grade universitaire de maîtrise en gestion hospitalière', 'Une expérience de dix ans comme cadre de département clinique'],
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
          { cetace: 'un rorqual à bosse juvénile de dix mètres', distance: 'à plus de quatre cent cinquante kilomètres de son habitat marin salé', endroit: 'dans le bassin du Vieux-Port de Montréal', mesure: 'd’imposer une zone d’exclusion maritime et de réduire la vitesse des navires' },
          { cetace: 'un jeune béluga blanc égaré de son groupe', distance: 'à près de trois cents kilomètres en amont de Tadoussac', endroit: 'près du pont Jacques-Cartier dans les courants du fleuve', mesure: 'd’interdire la circulation des bateaux de plaisance et des motomarines' },
          { cetace: 'une baleine de Minke d’environ sept mètres', distance: 'à plus de cinq cents kilomètres des eaux maritimes de l’estuaire', endroit: 'aux abords des quais du port commercial de Montréal', mesure: 'd’installer des balises acoustiques pour surveiller l’état du mammifère' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ACTUALITÉ ENVIRONNEMENTALE - ODYSSÉE INHABITUELLE DANS LE FLEUVE\nUn événement faunique exceptionnel retient l’attention des Québécois depuis plusieurs jours. ${s.cetace[0].toUpperCase() + s.cetace.slice(1)} a remonté le cours du fleuve Saint-Laurent pour atteindre les eaux douces ${s.endroit}. L’animal se trouve ${s.distance}, un phénomène très rare qui inquiète les biologistes du Réseau québécois d’urgences pour les mammifères marins. Selon les spécialistes, l’eau douce prolongée fragilise la peau de l’animal et il ne trouve aucune nourriture adaptée dans ce secteur. Afin de protéger le mammifère contre d’éventuelles collisions, Transports Canada a ordonné ${s.mesure}. Des navires de la Garde côtière veillent jour et nuit pour dissuader les curieux de s’approcher. Tous espèrent que la baleine retrouvera d’elle-même le chemin vers l’océan.`,
          questions: [
            ['Quel événement animalier rare est rapporté par les spécialistes ?', 'La présence inhabituelle d’une grande baleine dans le fleuve', 'Une prolifération subite d’algues toxiques dans un lac de villégiature estival', 'La découverte d’ossements anciens sur une berge isolée'],
            ['Pourquoi le séjour prolongé de l’animal en eau douce inquiète-t-il ?', 'Le manque de proies adaptées et la détérioration de son épiderme', 'La température de l’eau qui causerait des coups de soleil', 'Une incapacité totale de flotter provoquée par l’absence de marées maritimes'],
            ['Quelle mesure de sécurité immédiate a été mise en place pour préserver l’animal ?', 'L’instauration d’un périmètre d’exclusion et la réduction de vitesse des navires', 'La capture au filet pour transporter l’animal en camion', 'La construction rapide d’une digue en béton sur le chenal'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Baleine à bosse dans le fjord du Saguenay
    Object.assign(
      (rand) => {
        const slots = [
          { animal: 'une baleine bleue imposante', site: 'dans la baie Éternité en plein cœur du fjord', alerte: 'des kayakistes qui ont aperçu son souffle puissant à l’aube', secours: 'une équipe de patrouilleurs du parc marin escortant l’animal à distance' },
          { animal: 'un rorqual commun adulte', site: 'dans les eaux profondes de l’embouchure du Saguenay', alerte: 'le capitaine d’un traversier régulier reliant les deux rives', secours: 'des scientifiques munis de balises satellites pour cartographier ses plongées' },
          { animal: 'un groupe de dauphins à flancs blancs', site: 'dans les méandres étroits de la rivière Saguenay', alerte: 'des résidents riverains intrigués par leurs bonds hors de l’eau', secours: 'des équipes spécialisées diffusant des signaux acoustiques de guidage' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `REPORTAGE DE PRESSE - INTRUSION SPECTACULAIRE AU ROYAUME DU SAGUENAY\nLes riverains du fjord assistent depuis quarante-huit heures à un spectacle naturel fascinant. ${s.animal[0].toUpperCase() + s.animal.slice(1)} s’est aventuré bien au-delà de son périmètre habituel, naviguant ${s.site}. Le premier signalement a été donné par ${s.alerte}. Les experts maritimes expliquent que des courants inhabituels de krill ont pu attirer l’animal dans cette gorge rocheuse abrupte. Pour garantir la quiétude de ce visiteur majestueux, ${s.secours} veille à ce qu’aucune embarcation de plaisance ne s’approche à moins de quatre cents mètres. Les autorités rappellent que le harcèlement d’un mammifère marin protégé constitue une infraction passible de lourdes amendes en vertu de la loi sur les espèces en péril.`,
          questions: [
            ['Quel événement naturel marquant retient l’attention des riverains ?', 'L’arrivée inattendue d’un grand cétacé dans les eaux du fjord', 'Un déversement d’hydrocarbures causé par l’avarie d’un grand navire commercial', 'La désertion soudaine des colonies d’oiseaux marins du parc'],
            ['Par qui le premier signalement de l’animal a-t-il été transmis ?', 'Par des usagers ou des observateurs attentifs présents sur place', 'Par des pilotes d’hélicoptère en mission de sauvetage', 'Par un pêcheur hauturier constatant la perte de l’ensemble de ses filets marins'],
            ['Quelle consigne stricte de navigation les patrouilleurs nautiques appliquent-ils ?', 'Maintenir une distance minimale d’au moins un demi-kilomètre avec l’animal', 'Distribuer chaque jour des poissons pour nourrir le visiteur', 'Guider le mammifère vers la sortie avec des avertisseurs sonores'],
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
          text: `CHRONIQUE D’ACTUALITÉ - LA VILLE PLONGÉE DANS LE NOIR\nLa bourrasque automnale qui a balayé le sud de la province a laissé de lourdes séquelles ${s.ville}. Hier vers dix-sept heures, ${s.rafales} ont provoqué la chute de centaines de branches et de gros arbres sur le réseau électrique. En moins de deux heures, les coupures se sont propagées, privant d’électricité ${s.foyers}. Les feux de circulation éteints ont provoqué de forts ralentissements sur toutes les artères principales. Plusieurs municipalités ont ouvert des centres d’hébergement temporaires avec génératrices pour permettre aux citoyens de se réchauffer et de recharger leurs téléphones. Hydro-Québec souligne que ${s.mobilisation}. Le rétablissement complet du courant prendra toutefois encore de quarante-huit à soixante-douze heures dans les secteurs les plus lourdement endommagés.`,
          questions: [
            ['Quel phénomène météorologique violent a provoqué les pannes de courant ?', 'De fortes rafales de vent ayant fait tomber des branches sur les fils', 'Une vague de chaleur sans précédent ayant endommagé les postes de distribution', 'Un affaissement de terrain ayant détruit une centrale'],
            ['Combien d’abonnés ont été touchés par ces coupures majeures d’électricité ?', 'Plusieurs dizaines ou centaines de milliers de résidences et commerces', 'Seulement quelques habitations situées en forêt profonde', 'L’intégralité des clients raccordés à l’ensemble du réseau nord-américain réuni'],
            ['Quelle mesure d’urgence a été déployée par les villes pour soulager les citoyens ?', 'Des centres temporaires chauffés munis de génératrices pour accueillir la population', 'L’octroi de billets d’avion vers des régions épargnées par le froid', 'L’évacuation forcée des familles vers une autre métropole'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Panne causée par une tempête de verglas printanière
    Object.assign(
      (rand) => {
        const slots = [
          { secteur: 'la région de Lanaudière et des Laurentides', epaisseur: 'vingt-cinq millimètres de glace', bris: 'l’effondrement de plusieurs poteaux et de transformateurs', delai: 'trois à quatre jours de travaux continus' },
          { secteur: 'l’ouest de l’île de Montréal et Laval', epaisseur: 'quinze millimètres de pluie verglaçante accumulée sur les branches', bris: 'la rupture de câbles aériens près des grands axes routiers', delai: 'au moins quarante-huit heures de travail continu' },
          { secteur: 'la région de l’Outaouais', epaisseur: 'vingt millimètres de glace alourdissant la végétation', bris: 'des chutes d’arbres massives bloquant les chemins de campagne', delai: 'quatre à cinq jours pour les secteurs les plus ruraux' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CRISE CLIMATIQUE - LE VERGLAS PARALYSE LE RÉSEAU ÉNERGÉTIQUE\nUn épisode de pluie verglaçante printanier d’une intensité exceptionnelle a durement frappé ${s.secteur} depuis mercredi soir. L’accumulation d’une couche de verglas pesant jusqu’à ${s.epaisseur} a fait céder la végétation sous un poids considérable. Les bruits de branches qui cassaient ont résonné toute la nuit dans les quartiers résidentiels. Le réseau de distribution a subi des dommages importants, avec ${s.bris}. Les hôpitaux et les résidences pour personnes âgées ont basculé sans interruption sur leurs génératrices d’urgence. La direction d’Hydro-Québec a appelé la population à la patience lors d’un point de presse, estimant qu’il faudra ${s.delai} pour rebrancher tous les foyers isolés. Les pompiers rappellent de ne jamais utiliser d’appareils de cuisson au propane à l’intérieur pour éviter toute intoxication.`,
          questions: [
            ['Quel événement climatique a paralysé le réseau électrique régional ?', 'Une accumulation sévère de verglas ayant brisé fils et poteaux', 'Une violente bourrasque estivale ayant arraché plusieurs toitures dans la ville', 'Une sécheresse marquée ayant asséché les réservoirs du nord'],
            ['Comment les établissements de soins ont-ils maintenu leurs services essentiels ?', 'Grâce au fonctionnement immédiat de génératrices de secours internes', 'En organisant le transfert par bus de tous les patients', 'En demandant à l’ensemble des malades hospitalisés de rentrer à leur domicile'],
            ['Quel avertissement de sécurité essentiel les pompiers rappellent-ils au public ?', 'L’interdiction absolue de faire fonctionner des appareils au propane à l’intérieur', 'L’obligation d’ouvrir toutes les fenêtres de la résidence en hiver', 'La consigne de réparer soi-même les câbles tombés sur la voie'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Béluga égaré dans la rivière Saint-Maurice
    Object.assign(
      (rand) => {
        const slots = [
          { riviere: 'la rivière Saint-Maurice à la hauteur de Shawinigan', mammifere: 'un béluga blanc adulte reconnaissable à sa peau claire', alerte: 'des pêcheurs en chaloupe surpris par son apparition', protocole: 'le Réseau d’urgences pour les mammifères marins avec des vétérinaires spécialisés' },
          { riviere: 'la rivière Richelieu près du bassin de Chambly', mammifere: 'un jeune béluga encore dépendant de son alimentation marine', alerte: 'des plaisanciers qui ont photographié sa silhouette près des écluses', protocole: 'Pêches et Océans Canada avec des biologistes de l’aquarium' },
          { riviere: 'la rivière des Prairies au nord de Montréal', mammifere: 'un rorqual à museau pointu en quête de bancs de poissons', alerte: 'des marcheurs longeant le parc riverain de la Merci', protocole: 'une équipe d’experts fauniques équipés de drones d’observation aérienne' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `FAITS DIVERS SCIENTIFIQUES - UN HABITANT DE L’ARCTIQUE EN PLEIN CŒUR DU QUÉBEC\nLa surprise a été totale lorsque ${s.mammifere} a été aperçu nageant paisiblement dans ${s.riviere}. L’alerte a été transmise aux autorités par ${s.alerte}. Aussitôt informée, une équipe conjointe comprenant ${s.protocole} s’est mobilisée pour évaluer la viabilité d’un sauvetage ou d’un raccompagnement vers l’estuaire. Selon les spécialistes, les barrages hydroélectriques et les ponts routiers représentent des obstacles infranchissables pour le cétacé en amont. Les patrouilleurs nautiques ont établi un corridor de protection strict pour empêcher les curieux de s’approcher en canot ou en motomarine. La présence de ce visiteur rare rappelle la fragilité de nos écosystèmes et l’importance de protéger nos cours d’eau.`,
          questions: [
            ['Dans quel environnement inhabituel ce mammifère arctique a-t-il été repéré ?', 'Dans les eaux douces d’un cours d’eau situé à l’intérieur des terres', 'Dans les installations intérieures d’un parc aquatique commercial de Toronto', 'Dans le bassin d’une piscine privée de banlieue'],
            ['Quel obstacle majeur empêche l’animal de continuer sa route en amont ?', 'La présence de barrages hydroélectriques et de structures infranchissables', 'La menace d’attaques par de grands carnivores marins', 'Une couche épaisse de banquise bloquant toute avancée sur le fleuve en amont'],
            ['Quel message de sensibilisation cette observation insolite transmet-elle au public ?', 'La nécessité urgente de protéger les écosystèmes fluviaux et les espèces fragiles', 'L’obligation de chasser tout animal sauvage hors des cours d’eau', 'Le drainage prévu des rivières pour accélérer les déplacements'],
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
          { proprio: 'Gestion Immobilière du Nord', nouveau: 'neuf cent quatre-vingts dollars', hausse: 'quarante dollars par mois', raison: 'la hausse de douze pour cent du compte de taxes foncières municipales', travaux: 'le remplacement complet des chauffe-eau de l’immeuble l’automne dernier' },
          { proprio: 'Immeubles Résidentiels Tremblay', nouveau: 'mille quarante dollars', hausse: 'quarante-cinq dollars par mois', raison: 'l’augmentation marquée de la facture d’assurance bâtiment du complexe', travaux: 'la réfection de la brique de façade et le calfeutrage de toutes les fenêtres' },
          { proprio: 'Société Immobilière Lavoie', nouveau: 'neuf cent cinquante dollars', hausse: 'trente-cinq dollars par mois', raison: 'la hausse des coûts contractuels de déneigement et d’entretien extérieur', travaux: 'l’installation d’un nouveau système d’interphone sécurisé avec caméra' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `AVIS D’AUGMENTATION DE LOYER - RENOUVELLEMENT DU BAIL\nDe : ${s.proprio}\nÀ : Locataire du logement 4\nMadame, Monsieur,\nConformément aux formulaires officiels du Tribunal administratif du logement, nous vous avisons qu’à compter du premier juillet, votre loyer mensuel sera de ${s.nouveau}, soit une hausse de ${s.hausse}. Cette révision découle de deux facteurs majeurs : d’une part, ${s.raison}, et d’autre part, ${s.travaux}. Ces investissements améliorent la sécurité et le confort de votre immeuble. Conformément à la loi, vous disposez d’un délai de trente jours suivant la réception de cet avis pour nous signifier par écrit votre acceptation ou votre refus. À défaut de réponse dans ce délai, l’augmentation sera réputée acceptée. Nous vous remercions pour votre confiance continue.`,
          questions: [
            ['Quelle notification juridique et financière le propriétaire transmet-il au locataire ?', 'Un avis officiel de hausse de loyer pour le renouvellement du bail', 'Une mise en demeure pour loyer impayé exigeant de libérer les lieux sans délai', 'Une offre formelle pour acheter son appartement actuel'],
            ['Quels facteurs principaux justifient la hausse demandée selon le locateur ?', 'La montée des dépenses d’exploitation et les travaux effectués sur la bâtisse', 'L’achat d’une voiture de luxe pour la direction', 'Le paiement d’amendes municipales répétées pour le bruit excessif dans le bloc'],
            ['De quel délai légal le locataire dispose-t-il pour faire part de son désaccord écrit ?', 'D’une période de trente jours débutant au moment de la réception de la lettre', 'D’un délai impératif de quarante-huit heures ouvrables', 'D’une obligation d’accepter sans recours juridique possible'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Lettre du propriétaire avec grille de calcul du TAL
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Monsieur Paul Gagnon', loyer: 'mille cent vingt dollars', taux: 'trois virgule huit pour cent d’augmentation', investissement: 'la pose d’une nouvelle toiture blanche écoénergétique' },
          { proprio: 'Monsieur Marc Simard', loyer: 'neuf cent quatre-vingt-dix dollars', taux: 'quatre virgule deux pour cent de majoration', investissement: 'le remplacement de la chaudière au gaz par un système à thermopompe' },
          { proprio: 'Monsieur Denis Bouchard', loyer: 'mille soixante-quinze dollars', taux: 'trois virgule cinq pour cent de hausse', investissement: 'la réfection de l’ensemble des escaliers extérieurs et rampes de sécurité' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `LETTRE DU PROPRIÉTAIRE - CALCUL DU LOYER\nChère locataire,\nComme chaque printemps, je vous transmets les conditions de renouvellement de votre bail. En appliquant la grille officielle du Tribunal administratif du logement, votre loyer mensuel passera à ${s.loyer}, soit ${s.taux}. Cette hausse s’explique par des travaux indispensables sur le bâtiment, notamment ${s.investissement}, ainsi que par l’augmentation marquée des assurances de l’immeuble. Je privilégie toujours l’entretien préventif pour vous offrir un espace sain et sécuritaire. Vous trouverez ci-joint la copie de la feuille de calcul officielle du tribunal détaillant chaque montant. N’hésitez pas à me contacter si vous souhaitez en discuter calmement de vive voix.`,
          questions: [
            ['Sur quelle référence officielle le locateur s’appuie-t-il pour fixer sa hausse ?', 'Sur la grille de calcul établie par le Tribunal administratif du logement', 'Sur une décision arbitraire prise après une consultation verbale des voisins', 'Sur le barème moyen des logements de luxe du secteur'],
            ['Quels travaux nécessaires sur l’immeuble sont évoqués dans le calcul ?', 'Des interventions de rénovation visant à préserver l’état du bâtiment', 'L’installation d’un écran géant dans le hall', 'L’aménagement d’un bain tourbillon sur le toit réservé aux seuls gestionnaires'],
            ['Quelle attitude le propriétaire privilégie-t-il envers son locataire ?', 'Une démarche constructive et transparente encourageant un échange bienveillant', 'Une mise en garde sévère contre tout refus de la révision', 'Le refus catégorique d’expliquer les factures engagées'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Article magazine - Choix de l'agriculture urbaine sur son toit
    Object.assign(
      (rand) => {
        const slots = [
          { personne: 'Guillaume Lemay', quartier: 'dans le quartier Mile-End à Montréal', potager: 'un potager sur toit d’une centaine de bacs en feutre', benefice: 'récolter des tomates, des fines herbes et des courgettes' },
          { personne: 'Mathieu Roy', quartier: 'dans le quartier Saint-Roch à Québec', potager: 'un jardin suspendu aménagé sur une terrasse communautaire', benefice: 'produire des légumes frais sans engrais chimiques pour trois familles' },
          { personne: 'Sébastien Côté', quartier: 'dans le secteur du Vieux-Rosemont', potager: 'un écosystème de toiture verte avec ruche et composteur', benefice: 'consommer des aliments cueillis à maturité sans emballage jetable' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `MAGAZINE ÉCO-CITOYEN - LE VIRAGE VERT D’UN CITADIN PASSIONNÉ\nInstallé ${s.quartier}, ${s.personne} a troqué sa pelouse de banlieue contre ${s.potager}. Dans une entrevue, il nous explique les raisons qui l’ont poussé vers l’agriculture urbaine. « J’en avais assez d’acheter en épicerie des légumes suremballés ayant parcouru des milliers de kilomètres sans goût, confie-t-il. Je voulais reprendre le contrôle de ce que je mange. » Aujourd’hui, son aménagement lui permet de ${s.benefice}. Au-delà des récoltes, cette pratique a transformé sa vie de quartier : ses voisins montent régulièrement l’aider à arroser en échange de légumes frais. « Cela crée des liens formidables au cœur même de la ville », conclut-il avec le sourire.`,
          questions: [
            ['Quelle initiative citoyenne écologique est documentée dans cette entrevue ?', 'La création d’un potager de toiture productive en milieu urbain', 'L’achat d’une terre agricole conventionnelle pour y faire de la monoculture', 'Le lancement d’une entreprise de livraison rapide'],
            ['Quelle motivation principale a guidé le choix de cet habitant de la ville ?', 'Le refus de légumes d’épicerie sans saveur venus de très loin', 'Une obligation réglementaire votée par la mairie', 'La volonté de ne plus jamais payer les taxes foncières associées au bâtiment'],
            ['Quelle retombée humaine et communautaire inattendue le projet a-t-il favorisée ?', 'Le tissage de liens chaleureux et d’entraide entre voisins autour des récoltes', 'Des tensions persistantes avec le voisinage de l’immeuble', 'L’abandon des petits commerces d’alimentation du secteur'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Entrevue magazine - Potager nourricier familial en façade
    Object.assign(
      (rand) => {
        const slots = [
          { mere: 'Isabelle Martel', ville: 'à Longueuil', superficie: 'une plate-bande nourricière de deux cents mètres carrés', impact: 'une réduction appréciable de notre facture d’épicerie estivale' },
          { mere: 'Caroline Bélanger', ville: 'à Sherbrooke', superficie: 'un jardin en permaculture occupant toute la façade', impact: 'une économie mesurable sur nos achats de fruits et légumes' },
          { mere: 'Stéphanie Gagnon', ville: 'à Trois-Rivières', superficie: 'un aménagement de bacs en bois surélevés bordant la cour avant', impact: 'l’apprentissage pratique de la nature pour nos trois jeunes enfants' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `CHRONIQUE MAISON DURABLE - QUAND LE GAZON DEVIENT POTAGER\nIl y a trois ans, ${s.mere}, résidente ${s.ville}, a transformé sa cour avant en remplaçant sa pelouse verte par ${s.superficie}. « Arroser et tondre un gazon gourmand en eau me semblait un non-sens écologique », explique-t-elle. Les récoltes ont rapidement dépassé ses attentes : légumes frais, herbes et petits fruits comblent sa famille tout l’été. L’impact sur les finances familiales est majeur : ${s.impact}. De plus, les voisins s’arrêtent quotidiennement pour admirer les fleurs et échanger des conseils de jardinage. Son initiative inspire désormais d’autres citoyens à cultiver leurs propres aliments.`,
          questions: [
            ['Quel réaménagement extérieur audacieux cette résidente a-t-elle entrepris ?', 'Le remplacement d’une pelouse gazonnée par un espace potager nourricier', 'L’asphaltage complet de la cour pour y stationner plusieurs véhicules lourds', 'L’érection d’un mur opaque pour masquer la façade'],
            ['Quel reproche environnemental adressait-elle à l’entretien d’un gazon parfait ?', 'La grande quantité d’eau potable gaspillée pour un simple agrément visuel', 'L’apparition de prédateurs sauvages sur la pelouse', 'Le coût excessif des semences vendues dans les pépinières horticoles locales'],
            ['Quel avantage direct et mesurable ce changement a-t-il procuré au ménage ?', 'Une diminution appréciable des dépenses alimentaires et un contact éducatif vert', 'Une sollicitation pour participer à une émission de téléréalité', 'Une pénalité financière imposée pour absence de pelouse'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Lettre du propriétaire motivant la hausse par l'énergie
    Object.assign(
      (rand) => {
        const slots = [
          { proprio: 'Immeubles de l’Estrie', loyer_actuel: 'huit cent quatre-vingts dollars', loyer_futur: 'neuf cent vingt dollars', facteur: 'l’augmentation des frais de chauffage et d’électricité', travaux_immeuble: 'l’isolation thermique du toit et le remplacement des portes d’entrée coupe-froid' },
          { proprio: 'Gestion Résidentielle Chaudière', loyer_actuel: 'neuf cent dix dollars', loyer_futur: 'neuf cent cinquante dollars', facteur: 'la hausse des coûts d’énergie et des matériaux de réparation d’urgence', travaux_immeuble: 'la pose de fenêtres à triple vitrage pour réduire les pertes de chaleur' },
          { proprio: 'Habitations Mauricie', loyer_actuel: 'huit cent quarante dollars', loyer_futur: 'huit cent soixante-quinze dollars', facteur: 'les augmentations des primes d’assurance contre les dégâts d’eau', travaux_immeuble: 'le renouvellement de la plomberie et des valves de sécurité principales' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COMMUNICATION DU LOCATEUR - PROPOSITION DE RENOUVELLEMENT\nChère locataire, cher locataire,\nNous vous soumettons notre proposition de renouvellement de bail pour l’année prochaine. Votre loyer passera de ${s.loyer_actuel} à ${s.loyer_futur} à compter du premier juillet. Cette hausse découle des critères du Tribunal administratif du logement et s’explique par deux dépenses incontournables : ${s.facteur}, ainsi que ${s.travaux_immeuble}. Ces rénovations assurent un confort durable à votre logement. Si vous acceptez ces conditions, le bail se renouvellera automatiquement. En cas de refus, veuillez nous aviser par écrit dans les trente jours. Nous vous remercions pour votre confiance continue et vous souhaitons un excellent été.`,
          questions: [
            ['Quelle modification contractuelle le propriétaire soumet-il à son locataire ?', 'Une révision annuelle du montant du loyer pour le prochain bail', 'La résiliation unilatérale de l’entente sans motif pour reprendre le logement', 'Un rabais exceptionnel consenti suite à des travaux'],
            ['Quels coûts d’opération justifient ce calcul de renouvellement ?', 'La facture accrue des assurances et des énergies ainsi que des rénovations', 'Des investissements boursiers hasardeux du locateur', 'L’achat d’équipements récréatifs pour les dirigeants de la société de gestion'],
            ['Quelle démarche s’impose au locataire qui accepte les termes de la proposition ?', 'Aucune formalité particulière requise, la reconduction se faisant d’office', 'Une confirmation notariée sous serment obligatoire', 'Le versement immédiat de plusieurs mensualités d’avance'],
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
          { boutique: 'la boutique de mode Simons', delai: 'trente jours suivant la date de réception du colis', condition: 'l’article doit être non porté, non lavé et conserver toutes ses étiquettes d’origine', point: 'dans n’importe quel comptoir postal de Postes Canada' },
          { boutique: 'la plateforme de vêtements Chlorophylle', delai: 'quarante-cinq jours suivant la livraison à domicile', condition: 'le vêtement doit être dans son emballage d’origine avec la facture d’achat', point: 'au bureau de livraison le plus proche de votre domicile' },
          { boutique: 'la boutique montréalaise Frank And Oak', delai: 'trente jours civils après confirmation de commande', condition: 'l’habit doit être dans un état impeccable avec son étiquette intacte', point: 'dans un point de dépôt sécurisé affilié de votre secteur' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `POLITIQUE DE RETOUR ET REMBOURSEMENT EN LIGNE\nPour retourner un vêtement commandé chez ${s.boutique}, suivez ces directives simples. Connectez-vous à votre compte client sous « Historique des commandes » et sélectionnez « Demande de retour ». Vous disposez d’un délai maximal de ${s.delai}. Précisez le motif du renvoi puis assurez-vous que ${s.condition}. Ensuite, imprimez l’étiquette de retour préaffranchie, collez-la sur le colis d’origine et déposez le paquet ${s.point}. Dès réception et inspection à notre entrepôt, le remboursement sera versé sur votre carte de crédit sous cinq jours ouvrables.`,
          questions: [
            ['Quelle démarche ce document explicatif détaille-t-il pour les clients en ligne ?', 'La marche à suivre pour retourner un habit et obtenir son remboursement', 'Les techniques de lavage recommandées pour préserver les lainages délicats', 'L’adhésion à un programme fidélité donnant droit à des soldes'],
            ['Quelle exigence relative à l’état du vêtement renvoyé est incontournable ?', 'Renvoyer une pièce impeccable, sans odeur, jamais portée ni lavée', 'Le vêtement doit avoir été porté au moins une fois', 'Le tissu doit être volontairement décousu pour en vérifier la composition'],
            ['Où le consommateur doit-il déposer son colis muni du bordereau officiel ?', 'Dans un point de dépôt postal ou un comptoir de livraison dûment agréé', 'Dans le casier postal privé du président de la bannière', 'Auprès du gardien d’immeuble sans étiquette collée'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Procédure échange ou retour chaussures en ligne
    Object.assign(
      (rand) => {
        const slots = [
          { magasin: 'la boutique de souliers Yellow', delai: 'dans les trente jours suivant l’achat en ligne', exigence: 'les chaussures doivent être retournées dans leur boîte d’origine, munies de semelles propres', mode: 'un crédit instantané ou un remboursement sur le mode de paiement original' },
          { magasin: 'le magasin d’hiver Kanuk', delai: 'dans les vingt et un jours suivant la réception', exigence: 'les bottes ne doivent pas avoir servi à l’extérieur et garder les étiquettes', mode: 'un remboursement complet déduction faite d’un frais fixe de retour de cinq dollars' },
          { magasin: 'la boutique québécoise Saute-Mouton', delai: 'dans les trente jours ouvrables après livraison', exigence: 'les semelles intérieures et lacets doivent être parfaitement complets', mode: 'un échange de pointure sans frais de livraison supplémentaires' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE CLIENTÈLE - RETOUR ET ÉCHANGE DE CHAUSSURES\nVous avez commandé une paire de chaussures chez ${s.magasin} et la pointure ne convient pas ? Voici la marche à suivre pour effectuer votre retour. D’abord, remplissez le formulaire en ligne sous l’onglet « Aide et soutien ». Cette démarche doit être entreprise ${s.delai}. Ensuite, emballez le produit en respectant notre consigne essentielle : ${s.exigence}. Insérez le bon d’expédition et remettez le paquet au transporteur. Après vérification par notre service de contrôle, vous recevrez ${s.mode}. Les articles achetés à cinquante pour cent de rabais et plus sont en vente finale, sans échange ni remboursement.`,
          questions: [
            ['Quelle politique commerciale ce guide pratique précise-t-il aux acheteurs ?', 'La procédure à appliquer pour renvoyer des chaussures mal ajustées', 'Les consignes de cirage du cuir pour éviter les marques d’usure prématurée', 'L’utilisation d’un bon de réduction en magasin'],
            ['Quelle condition physique essentielle concerne les chaussures retournées ?', 'Les articles doivent être propres, complets et remis dans leur emballage', 'Les souliers doivent être portés dehors deux semaines', 'Les chaussures doivent être expédiées sans aucune protection de transport'],
            ['Quelle restriction vise formellement les articles acquis en très forte solde ?', 'Les produits vendus à moitié prix ou plus sont considérés en vente finale', 'Le remboursement est versé exclusivement en argent liquide', 'La livraison est différée de six mois par l’entrepôt'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Procédure RQAP - Demande de prestations parentales
    Object.assign(
      (rand) => {
        const slots = [
          { regime: 'le Régime québécois d’assurance parentale (RQAP)', choix: 'le choix entre le régime de base plus long ou le régime particulier plus généreux', piece: 'votre relevé d’emploi officiel transmis électroniquement par votre employeur', delai: 'dans les dix jours suivant la réception de votre dossier complet' },
          { regime: 'le portail officiel des prestations familiales du Québec', choix: 'la décision concertée entre parents pour le partage des semaines de congé', piece: 'votre numéro d’assurance sociale et la confirmation de naissance de l’état civil', delai: 'dans un délai moyen de quatorze jours ouvrables' },
          { regime: 'la plateforme gouvernementale de soutien aux nouveaux parents', choix: 'l’option de recevoir des versements réguliers sur dix-huit ou douze mois', piece: 'vos coordonnées bancaires précises pour activer le dépôt direct automatique', delai: 'sous deux semaines à compter de la transmission électronique' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `ASSURANCE PARENTALE (RQAP) - GUIDE DU PARENT\nLa naissance ou l’adoption d’un enfant donne droit au remplacement d’une partie de votre salaire par ${s.regime}. Pour recevoir vos prestations sans délai, suivez ces étapes. Connectez-vous d’abord au portail gouvernemental avec votre identifiant ClicSÉQUR. Indiquez la date d’arrivée de l’enfant et choisissez votre option irréversible : ${s.choix}. Assurez-vous ensuite que ${s.piece} est bien versé à votre dossier. Enfin, confirmez vos coordonnées bancaires pour le dépôt direct. Votre premier versement monétaire sera déposé dans votre compte ${s.delai}. Tout revenu gagné pendant les congés doit être déclaré chaque semaine pour ajuster vos prestations.`,
          questions: [
            ['Quelle mesure de soutien gouvernementale ce guide permet-il de demander ?', 'Le remplacement partiel de salaire lors de l’accueil d’un enfant', 'Une allocation de retraite anticipée destinée aux employés en fin de carrière', 'Une indemnité financière consécutive à un arrêt de travail'],
            ['Quel choix irréversible les nouveaux parents doivent-ils obligatoirement poser ?', 'La sélection entre le régime de base et le régime particulier du RQAP', 'L’inscription définitive du prénom à l’état civil', 'La désignation formelle de trois tuteurs légaux domiciliés dans la province'],
            ['Quel délai moyen est généralement requis pour recevoir le premier paiement ?', 'Les versements sont effectués sous un délai moyen de dix à quatorze jours', 'Une fois que l’enfant fréquente l’école primaire de quartier', 'Après une attente administrative stricte d’une année complète'],
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
            ['Quelle modalité spécifique du congé parental ce texte détaille-t-il aux familles ?', 'Les conditions encadrant la répartition des semaines entre parents', 'La procédure juridique complète d’adoption d’un pupille né à l’étranger', 'La réservation de billets d’avion subventionnés par l’État'],
            ['Quel avertissement important les demandeurs doivent-ils impérativement respecter ?', 'Le choix des modalités est irréversible dès le dépôt de la première somme', 'L’interdiction aux deux conjoints d’habiter ensemble', 'La limitation stricte des congés à deux semaines consécutives pour chaque parent'],
            ['Que prévoit le système si un parent effectue quelques heures rémunérées pendant son congé ?', 'La possibilité de conserver une part de ses gains sans perte intégrale de droits', 'La suppression immédiate et sans appel de toutes les prestations', 'L’obligation de rembourser le double des montants déjà versés'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Retour et échange chez un détaillant d'équipement de plein air
    Object.assign(
      (rand) => {
        const slots = [
          { coop: 'la Coopérative de plein air MEC', delai: 'dans les trente jours avec preuve d’achat', exclusion: 'les articles de sécurité et les sous-vêtements ne sont ni repris ni échangés' },
          { coop: 'les magasins de sport SAIL Plein Air', delai: 'dans un délai de trente jours civils', exclusion: 'les permis et les munitions sont exclus de tout remboursement' },
          { coop: 'le détaillant québécois La Cordée Plein Air', delai: 'dans les trente jours suivant la commande', exclusion: 'les cartes-cadeaux et les articles vendus en liquidation ne sont pas admissibles' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `SERVICE CLIENTÈLE - POLITIQUE DE RETOUR ET SATISFACTION GARANTIE\nChez ${s.coop}, nous voulons que chaque aventure en nature se déroule avec le meilleur équipement possible. Si votre matériel ne répond pas à vos attentes, vous pouvez le retourner facilement ${s.delai}. Pour une commande Web, générez votre étiquette de retour prépayée dans votre espace membre en ligne. Les articles doivent être retournés dans un état neuf, propres, avec leurs manuels et tous les accessoires dans leur emballage d’origine. Veuillez noter que pour des motifs de sécurité et d’hygiène, ${s.exclusion}. Dès réception du colis dans notre entrepôt de distribution, nous inspecterons le matériel et émettrons un remboursement selon votre méthode de paiement initiale. Si vous préférez un échange immédiat, vous pouvez également vous présenter dans l’une de nos succursales avec votre facture électronique.`,
          questions: [
            ['Quelle politique d’après-vente ce détaillant de plein air met-il en œuvre ?', 'Les conditions de reprise et de remboursement des articles de sport', 'La location à long terme de camionnettes tout-terrain pour les expéditions', 'La vente d’aliments frais pour les camps en forêt'],
            ['Quelle clause d’exclusion pour des raisons d’hygiène ou de sécurité s’applique ?', 'L’exclusion de certaines pièces précises par souci d’hygiène', 'L’interdiction de retourner les articles colorés', 'Le refus systématique de rembourser les commandes réglées par carte de débit'],
            ['Quelle option avantageuse s’offre au client désirant obtenir un remplacement sans délai ?', 'Se présenter en personne dans un magasin du réseau avec son justificatif d’achat', 'Envoyer une lettre recommandée au siège corporatif de l’entreprise', 'Attendre l’année suivante pour obtenir un échange gratuit'],
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
          { citoyenne: 'Mireille Gagnon', projet: 'la piste cyclable protégée sur le boulevard Saint-Laurent', consultation: 'deux ans d’ateliers participatifs et plus de mille signatures citoyennes', motif: 'de coupures budgétaires décidées en catimini' },
          { citoyenne: 'Diane Bouchard', projet: 'le réaménagement piétonnier et végétalisé de la rue Saint-Denis', consultation: 'dix-huit mois de concertation avec les commerçants et résidents', motif: 'de la pression exercée par quelques commerçants' },
          { citoyenne: 'Hélène Tremblay', projet: 'la voie réservée aux autobus et cyclistes sur l’avenue du Parc', consultation: 'trois consultations publiques et un sondage officiel d’arrondissement', motif: 'd’un revirement politique inattendu de la mairie' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `PUBLICATION CITOYENNE SUR UN RÉSEAU SOCIAL\nPar ${s.citoyenne} - Groupe « Citoyens engagés de notre quartier »\nJ’apprends avec une immense déception que la mairie a décidé d’annuler ${s.projet}. Je n’ai pas de mots pour exprimer ma colère. Nous avons pourtant investi ${s.consultation} pour bâtir une rue plus verte et sécuritaire pour nos enfants. Et voilà que tout est balayé sous prétexte ${s.motif} ! Comment les élus peuvent-ils mépriser autant d’heures de mobilisation bénévole ? Nos enfants continueront de frôler des autos roulant trop vite. Je refuse de baisser les bras : venez tous au conseil d’arrondissement ce mardi pour exiger des comptes !`,
          questions: [
            ['Quel sentiment dominant la résidente exprime-t-elle dans son message en ligne ?', 'Une amère déception et de l’indignation face à l’abandon du projet', 'Un grand soulagement suite à la construction d’un grand complexe de bureaux', 'La joie d’avoir été élue au conseil d’arrondissement'],
            ['Quel effort collectif important a été balayé selon l’auteure de la publication ?', 'De longs mois de consultation et des centaines de signatures citoyennes', 'Des rénovations privées menées par les propriétaires', 'Une vaste collecte de fonds destinée à créer un nouveau parti politique d’ici'],
            ['Quelle mobilisation civique concrète propose-t-elle aux résidents de son quartier ?', 'Assister en grand nombre à la prochaine séance du conseil municipal local', 'Déménager immédiatement dans une banlieue plus paisible', 'Refuser de payer ses taxes foncières durant plusieurs années'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 1 (Template, Ex 0): Déception citoyenne réseau social - Abandon d'un parc de quartier
    Object.assign(
      (rand) => {
        const slots = [
          { auteur: 'Marc-André Lavoie', espace: 'l’aménagement d’un grand parc public avec jardins partagés sur l’ancien terrain vague de la rue Bellechasse', promoteur: 'la vente du terrain à un promoteur pour ériger deux tours d’habitation', promesse: 'de la promesse électorale de préserver un îlot de fraîcheur' },
          { auteur: 'Patrick Simard', espace: 'la transformation de l’ancien dépôt municipal en parc nature boisé avec jeux d’eau pour enfants', promoteur: 'la construction d’un stationnement étagé payant et de bureaux administratifs', promesse: 'de l’engagement officiel d’augmenter les arbres dans le secteur' },
          { auteur: 'Vincent Roy', espace: 'la création d’une place publique animée avec forêt urbaine et marché fermier local', promoteur: 'la cession du lot pour agrandir un entrepôt de distribution commerciale', promesse: 'du vote unanime du comité de quartier pour un parc vert' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `TRIBUNE LIBRE DU QUARTIER - DÉCEPTION AMÈRE FACE AU BÉTON\nPar ${s.auteur}\nQuelle tristesse de constater que le béton l’emporte encore sur notre quartier ! La ville vient de confirmer l’abandon du projet pour ${s.espace}. À la place de cet îlot de fraîcheur, les autorités ont approuvé ${s.promoteur}. Qu’est-il advenu ${s.promesse} ? Notre secteur étouffe durant les canicules et nos enfants manquent d’arbres pour jouer. Je me sens profondément trahi comme citoyen payeur de taxes. Partagez massivement ce statut pour dénoncer cette décision inacceptable de notre administration municipale !`,
          questions: [
            ['Quelle décision des autorités municipales révolte profondément ce résident ?', 'L’abandon d’un parc naturel au profit de projets immobiliers denses', 'La démolition d’une vieille école primaire pour élargir les voies de circulation', 'La fermeture d’une piscine durant la période de canicule'],
            ['Quel type d’aménagement remplacera l’espace vert initialement promis aux citoyens ?', 'La construction de tours d’habitation ou d’un vaste stationnement', 'L’aménagement d’un sanctuaire d’oiseaux marins', 'L’érection d’un observatoire botanique réservé uniquement aux chercheurs du cégep'],
            ['Quelle préoccupation environnementale et humaine est mise de l’avant dans ce cri du cœur ?', 'Le manque criant d’ombre et de végétation pour rafraîchir le quartier en été', 'L’absence de commerces de luxe sur l’artère commerciale', 'La rareté des cases de stationnement pour les visiteurs le soir'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
    // Scenario 2 (Template, Ex 1): Nervosité courriel d'un ami avant une entrevue d'embauche
    Object.assign(
      (rand) => {
        const slots = [
          { ami: 'Éric', poste: 'de directeur adjoint des communications dans un grand ministère québécois', jury: 'un comité de quatre évaluateurs avec une mise en situation minutée', peur: 'de bafouiller, d’avoir un trou de mémoire ou de mal gérer mon stress en anglais' },
          { ami: 'Maxime', poste: 'de chef d’équipe logistique dans une entreprise multinationale de transport', jury: 'un jury de trois cadres supérieurs avec des questions comportementales', peur: 'de perdre mes repères face aux questions sur la gestion de crise' },
          { ami: 'Guillaume', poste: 'de conseiller principal en politiques publiques auprès de la ville', jury: 'une commission d’experts qui évaluera ma présentation orale de quinze minutes', peur: 'de dépasser le temps limite et d’oublier les points clés de mon dossier' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL PERSONNEL - BESOIN DE TES ENCOURAGEMENTS\nDe : ${s.ami} Lemieux\nÀ : Martin Tremblay\nObjet : Panique avant mon entrevue de demain !\nSalut Martin,\nJe t’écris parce que j’ai l’estomac noué et je n’arrive plus à dormir. Demain à neuf heures, je passe mon entrevue décisive pour le poste ${s.poste}. C’est la chance dont je rêve depuis des années, mais la pression est forte : je serai devant ${s.jury}. Bien que j’aie révisé mes dossiers, j’ai une angoisse folle ${s.peur}. Le syndrome de l’imposteur me paralyse complètement. Aurais-tu cinq minutes pour me faire répéter au téléphone ou me donner des conseils de respiration ? Ton aide me ferait un bien immense. Merci d’être là pour moi !`,
          questions: [
            ['Quel état d’esprit l’expéditeur confie-t-il à son interlocuteur dans ce courriel ?', 'Une profonde angoisse à la veille d’un entretien d’embauche déterminant', 'La conviction inébranlable d’avoir déjà signé son contrat avec prime d’embauche', 'L’ennui ressenti dans ses fonctions actuelles au bureau'],
            ['Quelle modalité particulièrement stressante de l’épreuve de sélection redoute-t-il ?', 'Devoir faire une présentation ou répondre à un jury de cadres exigeants', 'Une épreuve sportive chronométrée sur piste d’athlétisme', 'Un bilan médical complet incluant une batterie d’examens cliniques approfondis'],
            ['Quelle démarche d’entraide concrète sollicite-t-il auprès de son ami pour se calmer ?', 'Une simulation au téléphone pour répéter ses réponses et maîtriser sa respiration', 'Une demande pour qu’un proche se présente au test à sa place', 'Le prêt d’une somme d’argent pour annuler son rendez-vous'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 3 (Template, Ex 1): Courriel amical - Anxiété avant une audition ou entrevue d'admission
    Object.assign(
      (rand) => {
        const slots = [
          { amie: 'Sandrine', epreuve: 'une audition finale d’admission au Conservatoire d’art dramatique de Montréal', exigence: 'd’interpréter deux monologues classiques devant un jury de professeurs renommés', symptome: 'les mains qui tremblent, la gorge sèche et l’impression d’avoir tout oublié' },
          { amie: 'Laurence', epreuve: 'une entrevue d’admission pour la maîtrise en psychologie clinique', exigence: 'd’analyser un cas clinique complexe sans préparation préalable en trente minutes', symptome: 'des palpitations cardiaques et une insomnie tenace depuis trois jours' },
          { amie: 'Audrey', epreuve: 'un examen oral final du barreau du Québec pour devenir avocate', exigence: 'de plaider une cause simulée devant un collège de trois juges expérimentés', symptome: 'des maux de ventre paralysants et la peur panique de perdre mes moyens' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `COURRIEL AMICAL - SOS STRESS AVANT MON ÉPREUVE\nDe : ${s.amie} Bouchard\nÀ : Julie Fortin\nObjet : Je stresse pour mon épreuve de demain !\nMa chère Julie,\nL’angoisse m’empêche totalement de dormir. Demain après-midi, c’est le moment fatidique : je passe ${s.epreuve}. Toute mon année d’efforts se joue sur cette seule rencontre. L’exigence est élevée car je dois ${s.exigence}. Bien que mes professeurs me disent prête, je ressens ${s.symptome}. La peur de décevoir mes proches me serre le cœur, même si je dramatise probablement. Envoie-moi tes meilleures pensées positives demain à quatorze heures, j’en aurai grand besoin ! Grosses bises, ${s.amie}`,
          questions: [
            ['Quelle rencontre décisive provoque la vive appréhension de l’expéditrice ?', 'Une épreuve formelle de sélection déterminant son avenir d’études', 'Une compétition de natation synchronisée organisée à huis clos dans son collège', 'Une démarche administrative pour renouveler son passeport'],
            ['Quelle exigence d’évaluation complexe doit-elle démontrer devant le comité ?', 'Une performance exigeante requérant une grande maîtrise professionnelle', 'Le rangement soigné des dossiers après l’entrevue', 'La préparation complète d’un repas gastronomique destiné aux évaluateurs de table'],
            ['Quels symptômes physiques traduisent l’ampleur de son anxiété à la veille du test ?', 'Des tremblements, des troubles de sommeil et la peur de perdre tous ses repères', 'Une faim inhabituelle qui l’empêche de se concentrer sur ses textes', 'Une agitation joyeuse qui la pousse à sortir fêter toute la nuit'],
          ],
        }
      },
      { situation: 1, capacity: 3 }
    ),
    // Scenario 4 (Template, Ex 0): Déception citoyenne réseau social - Fermeture bibliothèque
    Object.assign(
      (rand) => {
        const slots = [
          { citoyen: 'Jean-François Tremblay', lieu: 'de la bibliothèque de quartier Saint-Charles', public: 'les personnes âgées du secteur qui venaient lire le journal', repli: 'un pavillon municipal vétuste sans transport en commun accessible' },
          { citoyen: 'Simon Pelletier', lieu: 'du centre communautaire et récréatif des jeunes', public: 'les adolescents qui profitaient de l’aide aux devoirs et des ateliers d’art', repli: 'un sous-sol sombre d’église situé à trois kilomètres de distance' },
          { citoyen: 'David Simard', lieu: 'de la piscine municipale intérieure de notre arrondissement', public: 'les familles avec jeunes enfants et les aînés suivant des cours d’aquagym', repli: 'un complexe sportif privé payant hors de prix pour les citoyens' },
        ]
        const s = slots[Math.floor(rand() * slots.length)]
        return {
          text: `RÉSEAU SOCIAL DE QUARTIER - CRI DU CŒUR\nPar ${s.citoyen}\nC’est avec tristesse que je partage cette nouvelle : la municipalité a confirmé la fermeture définitive ${s.lieu} à la fin du mois. Cet endroit constituait un repère précieux dans notre quartier depuis des décennies. Je pense avec peine à ${s.public}, qui perdront un espace accessible et gratuit. La mairie prétend relocaliser les activités vers ${s.repli}, mais cette solution pénalise d’abord les résidents les plus vulnérables. Comment peut-on sacrifier nos services de proximité essentiels ? J’appelle les résidents à signer notre pétition en ligne pour faire reculer les élus avant qu’il ne soit trop tard !`,
          questions: [
            ['Quelle mesure municipale amèrement dénoncée fait l’objet de cette publication ?', 'La fermeture définitive d’une installation de loisirs de proximité', 'La majoration des tarifs des billets présentés dans les grands théâtres urbains', 'L’interdiction temporaire de circuler en voiture le soir'],
            ['Quel groupe d’usagers sera particulièrement pénalisé par cette disparition ?', 'Les résidents du quartier, notamment les jeunes et les personnes âgées', 'Les athlètes professionnels participant à des championnats', 'Les promoteurs immobiliers cherchant à acquérir des terrains dans le centre-ville'],
            ['Quelle démarche démocratique locale l’auteur encourage-t-il pour s’opposer à la décision ?', 'L’appui à une démarche citoyenne sur le Web visant à contester la décision', 'Le boycott immédiat des réseaux de transport en commun de la région', 'Le dépôt de plaintes judiciaires contre les riverains indifférents'],
          ],
        }
      },
      { situation: 0, capacity: 3 }
    ),
  ],
}
