export interface Resource {
  id: string;
  title: string;
  publisher: string;
  format: string;
  theme: string;
  description: string;
  url: string;
}

export const resources: Resource[] = [
  {
    id: 'inria', title: 'C’est quoi l’IA ?', publisher: 'Inria Learning Lab',
    format: 'Parcours mobile', theme: 'Comprendre',
    description: 'Une introduction pour découvrir les principales approches de l’IA, ses usages quotidiens et ses différences avec l’intelligence biologique.',
    url: 'https://learninglab.inria.fr/epocs/c-est-quoi-ia/',
  },
  {
    id: 'elements', title: 'Elements of AI : qu’est-ce que l’IA ?', publisher: 'Elements of AI',
    format: 'Cours en ligne', theme: 'Comprendre',
    description: 'Le premier chapitre en français d’un cours consacré aux bases de l’intelligence artificielle, pour poursuivre votre apprentissage.',
    url: 'https://course.elementsofai.com/fr/1/',
  },
  {
    id: 'cnil-basics', title: 'Une IA générative, à quoi ça sert ?', publisher: 'CNIL · France Num',
    format: 'Fiche PDF', theme: 'Fonctionnement',
    description: 'Une fiche accessible sur la génération de contenu, les modèles de langage et la manière de formuler une demande précise.',
    url: 'https://www.cnil.fr/sites/cnil/files/2025-03/tpe_pme_ficheia_1_a_quoi_ca_sert.pdf',
  },
  {
    id: 'cnil-use', title: 'Utiliser un système d’IA générative', publisher: 'CNIL',
    format: 'Questions-réponses', theme: 'Bonnes pratiques',
    description: 'Des repères pour choisir un système adapté, comprendre ses limites et garder un contrôle humain sur les résultats.',
    url: 'https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative',
  },
  {
    id: 'cnil-privacy', title: 'IA générative et vie privée', publisher: 'CNIL · PIPC',
    format: 'Affiche PDF', theme: 'Données personnelles',
    description: 'Six questions pratiques à se poser avant, pendant et après l’utilisation d’un outil, pour mieux protéger ses données.',
    url: 'https://www.cnil.fr/sites/default/files/2026-05/affiche_ia_generative_et_vie_privee_fr.pdf',
  },
  {
    id: 'unesco', title: 'Recommandation sur l’éthique de l’IA', publisher: 'UNESCO',
    format: 'Présentation et rapport', theme: 'Éthique',
    description: 'Un cadre international pour aborder les droits humains, la transparence, l’équité et la responsabilité dans les systèmes d’IA.',
    url: 'https://www.unesco.org/fr/articles/recommandation-sur-lethique-de-lintelligence-artificielle',
  },
  {
    id: 'montreal', title: 'La Déclaration de Montréal', publisher: 'Déclaration de Montréal pour une IA responsable',
    format: 'Texte de référence', theme: 'Éthique',
    description: 'Des principes issus d’une réflexion collective : autonomie, vie privée, équité, responsabilité et développement soutenable.',
    url: 'https://declarationmontreal-iaresponsable.com/la-declaration/',
  },
  {
    id: 'ademe', title: 'IA générative : comment quantifier les impacts ?', publisher: 'ADEME',
    format: 'Article et avis', theme: 'Environnement',
    description: 'Un éclairage sur l’énergie, les infrastructures et l’analyse du cycle de vie, pour comprendre les impacts environnementaux de l’IA.',
    url: 'https://www.ademe.fr/presse/communique-national/ia-generative-comment-quantifier-les-impacts/',
  },
];

export interface EducationalReading {
  id: string;
  title: string;
  paragraphs: string[];
  sourceIds: string[];
}

// Synthèses originales, avec attribution aux documents consultés ;
// les textes des organismes ne sont pas reproduits intégralement.
export const educationalReadings: EducationalReading[] = [
  {
    id: 'generer', title: 'Comment une IA générative produit-elle du contenu ?', sourceIds: ['cnil-basics'],
    paragraphs: [
      'Une IA générative produit du texte, des images ou du son à partir de régularités apprises dans de nombreux exemples. Pour un modèle de langage, la génération repose sur la prédiction successive de fragments de texte en fonction du contexte. Ce mécanisme permet d’imiter des formes de conversation et d’adapter la formulation à une demande.',
      'La consigne, souvent appelée prompt, précise ce que vous attendez. Décrire la tâche, le contexte et le format aide à obtenir une proposition plus pertinente. Pour résumer un document, indiquez par exemple la longueur souhaitée et les idées à privilégier. Une demande précise améliore le cadre de la réponse ; elle ne dispense pas d’en examiner le contenu.',
    ],
  },
  {
    id: 'fiabilite', title: 'Pourquoi une réponse convaincante peut-elle être fausse ?', sourceIds: ['cnil-use'],
    paragraphs: [
      'Une réponse fluide ne prouve pas que les informations sont exactes. Un système d’IA générative peut produire un résultat plausible, mais inexact : c’est notamment ce que l’on appelle une hallucination. Le choix d’un outil doit donc tenir compte du besoin réel et de ses limites, plutôt que de la seule qualité apparente de ses formulations.',
      'Certains systèmes citent des sources, filtrent leurs résultats ou s’appuient sur une base documentaire spécialisée pour limiter les erreurs. Ces dispositifs ne remplacent pas le contrôle humain. Avant de réutiliser une proposition, examinez-la et vérifiez les éléments importants. Pour une citation ou une référence, retrouvez le document original plutôt que de considérer le texte généré comme une preuve.',
    ],
  },
  {
    id: 'donnees', title: 'Protéger ses données avant, pendant et après un échange', sourceIds: ['cnil-privacy'],
    paragraphs: [
      'Avant d’utiliser une IA, comparez les services et lisez leur politique de confidentialité : quelles données sont collectées, pour quelles fins et avec quels moyens de contrôle ? Si vous créez un compte, protégez-le avec un mot de passe robuste et, lorsque c’est possible, une authentification à deux facteurs.',
      'Pendant l’échange, évitez de transmettre des renseignements privés ou sensibles, comme des mots de passe ou des informations bancaires. Vérifiez les paramètres qui limitent l’usage des conversations pour l’entraînement et les options de discussion temporaire. Après utilisation, examinez les possibilités de suppression des conversations et déconnectez-vous, surtout sur un appareil partagé. Ces gestes réduisent les risques ; leurs effets dépendent des garanties du service choisi.',
    ],
  },
  {
    id: 'ethique', title: 'Une IA responsable ne se résume pas à sa performance', sourceIds: ['unesco', 'montreal'],
    paragraphs: [
      'L’éthique de l’IA examine les conséquences des choix techniques sur les personnes et la société. La recommandation de l’UNESCO place les droits humains et la dignité au centre de la réflexion. La transparence, l’équité et le contrôle humain aident à évaluer un système au-delà de sa vitesse ou de sa précision.',
      'La Déclaration de Montréal insiste notamment sur l’autonomie, la protection de la vie privée et la responsabilité. Pour réfléchir à un usage, demandez-vous qui en bénéficie, qui peut subir un préjudice et qui garde la maîtrise de la décision. Ces principes sont des repères pour discuter et orienter les pratiques. Ils invitent à examiner le contexte et les effets réels de l’outil, plutôt qu’à supposer qu’une innovation est souhaitable dans toutes les situations.',
    ],
  },
  {
    id: 'empreinte', title: 'L’empreinte de l’IA dépasse la consommation d’une requête', sourceIds: ['ademe'],
    paragraphs: [
      'L’IA repose sur des centres de données, des serveurs et des équipements. L’entraînement et l’utilisation des modèles consomment de l’énergie ; le mix électrique influence les émissions associées. La fabrication du matériel, l’eau et l’implantation des infrastructures doivent aussi être prises en compte. Une seule mesure par requête ne décrit donc pas toute l’empreinte d’un service.',
      'L’ADEME recommande d’examiner le cycle de vie et les effets indirects. Un outil qui promet un bénéfice écologique doit être évalué en tenant compte des ressources qu’il mobilise et des nouveaux usages qu’il peut encourager. Le manque de transparence sur les modèles et leurs infrastructures complique les comparaisons. Un usage raisonné consiste à définir le besoin et à examiner si la solution apporte réellement un gain au regard de ses impacts.',
    ],
  },
];
