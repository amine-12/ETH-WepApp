import { readings } from './readings.ts';
import type { LearningModule } from '../types/course';

export const modules: LearningModule[] = [
  {
    id: 'comprendre-ia', number: 1, title: 'Comprendre l’IA', icon: 'brain', estimatedMinutes: 8,
    description: 'Des données à la réponse : découvrez ce qui se passe derrière l’écran.',
    sections: [
      { id: 'intro', title: 'Un outil puissant, des limites réelles', paragraphs: readings['intro'], concept: { title: 'La question à garder en tête', text: 'La réponse est-elle seulement plausible, ou ai-je des raisons de la considérer comme fiable ?' } },
      { id: 'pipeline', title: 'Comment une réponse est-elle produite ?', paragraphs: readings['pipeline'], diagram: [
        { label: 'Données', explanation: 'Des textes et autres exemples constituent des données d’apprentissage. Leur qualité et leur diversité influencent le modèle.' },
        { label: 'Entraînement', explanation: 'Les paramètres sont ajustés pour apprendre des régularités. Cette étape nécessite du calcul.' },
        { label: 'Modèle', explanation: 'Le modèle entraîné contient des paramètres appris. Ce n’est pas une encyclopédie de faits tous vérifiés.' },
        { label: 'Question', explanation: 'Votre demande et son contexte orientent la réponse. Certains outils peuvent aussi consulter des sources externes.' },
        { label: 'Prédiction', explanation: 'Le modèle prédit des tokens successifs : des fragments de mots ou d’autres unités de contenu.' },
        { label: 'Réponse', explanation: 'Le résultat peut être utile et cohérent, mais nécessite une vérification adaptée à son importance.' },
      ], concept: { title: 'Probable ne signifie pas vrai', text: 'Une IA générative ne sait pas nécessairement qu’une affirmation est vraie. Une réponse fluide peut être erronée.' } },
      { id: 'limits', title: 'Apprentissage et utilisation : deux moments distincts', paragraphs: readings['limits'], example: { title: 'Une référence qui a l’air vraie', text: 'Un titre d’article, un nom d’auteur et une date peuvent former une référence très crédible… même si cet article n’existe pas.' }, questionIds: ['comprendre-ia_q1', 'comprendre-ia_q2'] },
    ],
    takeaways: ['L’IA apprend des régularités dans des données.', 'Entraînement et inférence sont deux étapes distinctes.', 'Une réponse plausible n’est pas une preuve.', 'Adaptez la vérification à l’importance de l’usage.'],
  },
  {
    id: 'bien-utiliser-ia', number: 2, title: 'Bien utiliser l’IA', icon: 'message', estimatedMinutes: 7,
    description: 'Formulez de meilleures demandes et gardez la maîtrise de vos décisions.',
    sections: [
      { id: 'role', title: 'Une aide au raisonnement', paragraphs: readings['role'], points: ['Donner un objectif clair.', 'Préciser le contexte et le public.', 'Définir le format attendu.', 'Indiquer les contraintes.', 'Vérifier les résultats.'], concept: { title: 'Le jugement reste humain', text: 'Déléguer une tâche ne revient pas à déléguer sa responsabilité.' } },
      { id: 'prompt', title: 'D’une demande vague à une demande utile', paragraphs: readings['prompt'], activity: 'prompt' },
      { id: 'verify', title: 'Vérifier avant de réutiliser', paragraphs: readings['verify'], questionIds: ['bien-utiliser-ia_q1', 'bien-utiliser-ia_q2'] },
    ],
    takeaways: ['Précisez l’objectif, le contexte et le format.', 'Ne partagez que les informations nécessaires.', 'Vérifiez les sources originales.', 'Utilisez la réponse comme un appui à votre jugement.'],
  },
  {
    id: 'hallucinations', number: 3, title: 'Hallucinations et biais', icon: 'search', estimatedMinutes: 12,
    description: 'Apprenez à distinguer une réponse convaincante d’une information fiable.',
    sections: [
      { id: 'hallucinations', title: 'Hallucinations, mensonges et préjugés', paragraphs: readings['hallucinations'], concept: { title: 'Détaillé ≠ vrai. Confiant ≠ correct.', text: 'Un nom de chercheur, une date et une explication ne remplacent pas une source vérifiable.' }, diagram: [
        { label: 'Question', explanation: 'Une demande et un contexte sont transmis au modèle.' },
        { label: 'Token suivant', explanation: 'Le modèle prédit un fragment de texte à partir du contexte.' },
        { label: 'Prédictions successives', explanation: 'Le texte se construit progressivement ; la plausibilité statistique ne garantit pas l’exactitude.' },
        { label: 'Réponse complète', explanation: 'L’utilisateur reçoit un texte qui peut nécessiter une vérification indépendante.' },
      ] },
      { id: 'disinformation', title: 'Erreur générée ou intention de tromper ?', paragraphs: readings['disinformation'], questionIds: ['hallucinations_q2'] },
      { id: 'detect', title: 'Mini-jeu : trouvez l’hallucination', paragraphs: readings['detect'], activity: 'hallucination' },
      { id: 'bias', title: 'Quand les données reproduisent nos préjugés', paragraphs: readings['bias'], example: { title: 'Le recrutement automatisé', text: 'Une entreprise entraîne un modèle sur les CV des personnes recrutées pendant quinze ans. Si certains profils ont été favorisés, le système risque de reproduire ce schéma historique.' }, concept: { title: 'La moyenne ne dit pas tout', text: 'Dans un exemple fictif, 95 % de précision globale ne signifie pas 95 % pour chaque groupe.' }, diagram: [
        { label: 'Données historiques', explanation: 'Elles peuvent refléter des préférences passées ou des inégalités.' },
        { label: 'Entraînement', explanation: 'Le modèle apprend des tendances présentes dans les exemples.' },
        { label: 'Décision', explanation: 'Ces tendances peuvent affecter l’accès à un emploi, une assurance ou un service.' },
        { label: 'Surveillance', explanation: 'Des données variées, des évaluations par groupe et une responsabilité humaine aident à limiter les risques.' },
      ], questionIds: ['hallucinations_q1', 'hallucinations_q3'] },
    ],
    takeaways: ['Vérifiez les références, dates et citations.', 'Distinguez hallucination et désinformation.', 'Cherchez les écarts derrière les moyennes.', 'Gardez une personne responsable des décisions importantes.'],
  },
  {
    id: 'environnement', number: 4, title: 'Impact environnemental', icon: 'leaf', estimatedMinutes: 10,
    description: 'Énergie, eau, matériel : découvrez la face physique du numérique.',
    sections: [
      { id: 'energy', title: 'Le cloud repose sur des machines', paragraphs: readings['energy'], example: { title: 'Même calcul, des impacts différents', text: 'À consommation comparable, un centre alimenté par des énergies fossiles et un centre alimenté par l’hydroélectricité n’ont pas la même empreinte carbone de fonctionnement.' }, questionIds: ['environnement_q2'] },
      { id: 'resources', title: 'Eau et métaux : les autres ressources', paragraphs: readings['resources'], diagram: [
        { label: 'Extraction', explanation: 'L’extraction des métaux exerce une pression sur les ressources et les écosystèmes.' },
        { label: 'Fabrication', explanation: 'Produire les équipements mobilise de l’énergie, de l’eau et des matériaux.' },
        { label: 'Utilisation', explanation: 'Le calcul nécessite électricité et refroidissement.' },
        { label: 'Remplacement', explanation: 'Un renouvellement trop rapide augmente les besoins de fabrication.' },
        { label: 'Fin de vie', explanation: 'Réemploi et recyclage contribuent à limiter les déchets électroniques.' },
      ], concept: { title: 'Justice environnementale', text: 'Les bénéfices du numérique et ses coûts matériels ne sont pas toujours répartis entre les mêmes populations.' } },
      { id: 'sobriety', title: 'Adapter l’outil au besoin réel', paragraphs: readings['sobriety'], example: { title: 'Un réseau électrique régional', text: 'Pour prévoir des flux d’énergie, un modèle ciblé sur des séries temporelles peut être plus adapté qu’un modèle génératif massif.' }, questionIds: ['environnement_q1'] },
      { id: 'design', title: 'Concevez une IA performante et responsable', paragraphs: readings['design'], activity: 'eco' },
    ],
    takeaways: ['L’IA mobilise énergie, eau et matériaux.', 'Les impacts varient selon l’infrastructure et l’usage.', 'Adaptez le modèle au besoin réel.', 'Performance et frugalité doivent être considérées ensemble.'],
  },
  {
    id: 'vie-privee', number: 5, title: 'Vie privée et données', icon: 'shield', estimatedMinutes: 9,
    description: 'Comprenez ce que vous partagez et reprenez la maîtrise de vos données.',
    sections: [
      { id: 'cycle', title: 'Les données au cœur du système', paragraphs: readings['cycle'], diagram: [
        { label: 'Entrée', explanation: 'Des données sont transmises ou collectées. Réduisez-les au strict nécessaire.' },
        { label: 'Traitement', explanation: 'Le système analyse des motifs dans les données.' },
        { label: 'Résultat', explanation: 'Une réponse, une prédiction ou une action est produite.' },
        { label: 'Ajustement', explanation: 'Dans certains processus, les paramètres sont ajustés pour améliorer le système.' },
        { label: 'Évaluation', explanation: 'La qualité est évaluée. Les modalités de conservation dépendent du service.' },
      ] },
      { id: 'inferences', title: 'Ce que vous dites… et ce qui peut être déduit', paragraphs: readings['inferences'], questionIds: ['vie-privee_q2'] },
      { id: 'classify', title: 'Est-ce une information à partager ?', paragraphs: readings['classify'], activity: 'privacy' },
      { id: 'habits', title: 'Garder le contrôle', paragraphs: readings['habits'], points: ['Ne partagez pas de mots de passe ou de données financières.', 'Évitez les dossiers médicaux identifiables.', 'Retirez les informations permettant d’identifier une personne.', 'Vérifiez les règles de votre établissement ou de votre employeur.', 'Lisez les modalités de conservation et d’utilisation.'], concept: { title: 'Avant d’envoyer', text: 'Considérez qu’une information transmise pourrait être conservée. Les garanties dépendent du service et du cadre d’utilisation.' }, sources: [{ label: 'MIT — Navigating data privacy', url: 'https://mitsloanedtech.mit.edu/ai/policy/navigating-data-privacy/' }], questionIds: ['vie-privee_q1'] },
    ],
    takeaways: ['Limitez les données partagées.', 'Les informations personnelles peuvent aussi être déduites.', 'Vérifiez les paramètres et les politiques du service.', 'La confidentialité aide à préserver l’autonomie.'],
  },
  {
    id: 'responsabilite', number: 6, title: 'Responsabilité et éthique', icon: 'scale', estimatedMinutes: 12,
    description: 'Consentement, confiance, décisions : replacez l’humain au centre.',
    sections: [
      { id: 'copyright', title: 'Propriété intellectuelle et droit d’auteur', paragraphs: readings['copyright'], example: { title: 'Le travail derrière les données', text: 'Un outil qui reproduit le style d’un illustrateur peut concurrencer ses services. Qui choisit les conditions de cet usage et qui en reçoit les bénéfices ?' }, concept: { title: 'Légalité ≠ acceptabilité éthique', text: 'Le consentement, la reconnaissance et la rémunération restent des questions à examiner, même lorsqu’un usage est légal.' }, points: ['Privilégier les fournisseurs attentifs aux droits des créateurs.', 'Éviter l’imitation ciblée destinée à remplacer un artiste.', 'Consulter et reconnaître les sources originales.'], questionIds: ['responsabilite_q3'] },
      { id: 'anthropomorphism', title: 'Une conversation humaine en apparence', paragraphs: readings['anthropomorphism'], concept: { title: 'Préserver son autonomie', text: 'Une réponse rassurante ne garantit pas sa justesse. Conservez vos liens humains et confrontez les affirmations de l’outil à d’autres points de vue.' }, questionIds: ['responsabilite_q2'] },
      { id: 'explain', title: 'Explicabilité et traçabilité', paragraphs: readings['explain'], diagram: [
        { label: 'Entrées', explanation: 'Conserver les informations pertinentes utilisées, en respectant la confidentialité.' },
        { label: 'Système', explanation: 'Identifier l’outil, sa version et son rôle dans le processus.' },
        { label: 'Décision', explanation: 'Documenter le résultat et l’intervention humaine.' },
        { label: 'Explication', explanation: 'Donner des raisons compréhensibles, adaptées à la personne concernée.' },
        { label: 'Contestation', explanation: 'Prévoir une possibilité de réexamen par une personne responsable.' },
      ], concept: { title: 'Qui répond de la décision ?', text: 'Si vous ne pouvez ni expliquer ni défendre une décision importante, pouvez-vous en imposer les conséquences à une autre personne ?' }, sources: [
        { label: 'CJUE — Affaire C-203/22, communiqué du 27 février 2025', url: 'https://curia.europa.eu/site/upload/docs/application/pdf/2025-02/cp250022en.pdf' },
        { label: 'Anthropic — Reasoning models don’t always say what they think', url: 'https://www.anthropic.com/research/reasoning-models-dont-say-think' },
      ], questionIds: ['responsabilite_q1'] },
    ],
    takeaways: ['Distinguez légalité et acceptabilité éthique.', 'Un langage humain ne prouve pas des sentiments.', 'Documentez les décisions et les responsabilités.', 'Une explication convaincante ne suffit pas à garantir la fiabilité.'],
  },
];

// Les cas du dossier pédagogique sont séparés des concepts pour garder
// une lecture courte tout en préservant les exemples et leurs nuances.
const responsibility = modules.find(m => m.id === 'responsabilite')!;
responsibility.sections[0].cases = [
  { title: 'Médias canadiens et OpenAI · novembre 2024', text: 'Le dossier du cours présente la poursuite d’une coalition comprenant CBC/Radio-Canada, La Presse Canadienne et The Globe and Mail. Les médias reprochent à OpenAI l’usage de leurs contenus sans permission ni rémunération. Ce cas interroge la répartition des coûts de production de l’information et des bénéfices liés à l’IA ; les reproches ne sont pas présentés comme un jugement définitif.' },
  { title: 'Numérisation de livres et Anthropic · juin 2025', text: 'Le jugement américain évoqué dans le dossier distingue la numérisation d’exemplaires achetés, dont les reliures ont été découpées et les exemplaires papier éliminés, de la constitution d’une bibliothèque de copies piratées. Il reconnaît certains usages au titre du fair use. Cette distinction juridique ne règle pas la question morale de la valeur accordée au travail des auteurs et aux livres.' },
  { title: 'Imitation d’illustrateurs québécois · exemple du dossier', text: 'Le contenu fourni rapporte une enquête de mai 2026 sur des modèles reproduisant les styles d’Élise Gravel, Michel Rabagliati et Guy Delisle sans leur consentement. Ce cas invite à distinguer l’imitation d’un style de la reproduction d’une partie importante d’une œuvre, et à examiner les conditions d’entraînement et la concurrence exercée sur les créateurs.' },
];
responsibility.sections[1].cases = [
  { title: 'Le test de Turing · étude de 2025', text: 'Dans l’étude citée, GPT-4.5, invité à adopter un personnage humain, a été choisi comme interlocuteur humain dans 73 % des cas lors d’échanges de cinq minutes. Ce résultat concerne ces conditions expérimentales. Il mesure une capacité d’imitation et ne démontre ni conscience ni sentiments.' },
  { title: 'Compagnons virtuels et protection des mineurs', text: 'Le dossier rapporte la plainte déposée en octobre 2024 par la mère de Sewell Setzer, adolescent de 14 ans décédé par suicide. Selon la plainte, les échanges avec un agent Character.AI auraient contribué à son décès. Il s’agit d’allégations : elles soulèvent des enjeux de conception et de protection des mineurs sans établir à elles seules toutes les responsabilités.' },
  { title: 'Complaisance et confiance excessive', text: 'Le contenu fourni décrit une mise à jour de GPT-4o, déployée puis retirée en avril 2025, qui pouvait renforcer des émotions négatives ou valider des comportements impulsifs. Il cite également le témoignage d’Anthony Tan rapporté en septembre 2025 après des échanges intensifs avec ChatGPT. Ces exemples invitent à examiner les risques de dépendance et de renforcement de croyances, sans confondre témoignage, diagnostic et démonstration de causalité.' },
];
responsibility.sections[1].sources = [{ label: 'Jones et Bergen — Large Language Models Pass the Turing Test (2025)', url: 'https://arxiv.org/abs/2503.23674' }];
responsibility.sections[2].cases = [
  { title: 'Air Canada · information erronée du chatbot', text: 'Le dossier présente un jugement de Colombie-Britannique de 2024 : une personne a reçu une information erronée sur un tarif de deuil. Une capture de l’échange a documenté l’erreur et l’organisation n’a pas pu transférer sa responsabilité au robot conversationnel. Le cas illustre la valeur des traces conservées ; il ne concerne pas l’explication d’un algorithme décisionnel.' },
  { title: 'Québec · décisions exclusivement automatisées', text: 'L’article 12.1 de la loi québécoise applicable au secteur privé, cité dans le dossier, prévoit des droits d’information et la possibilité de présenter ses observations à une personne en mesure de réviser une décision fondée exclusivement sur un traitement automatisé de renseignements personnels. Son champ d’application ne couvre pas indistinctement toutes les réponses d’une IA.' },
];
