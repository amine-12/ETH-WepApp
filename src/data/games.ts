export const ecoSteps = [
  { title: 'Choisir une architecture', options: [
    { label: 'Modèle de fondation massif', performance: 55, cost: 40, explanation: 'Une forte capacité générale, mais une puissance de calcul importante pour ce besoin spécialisé.' },
    { label: 'Modèle dédié et frugal', performance: 35, cost: 15, explanation: 'Un modèle spécialisé consomme moins de ressources et se concentre sur le besoin réel.' },
  ] },
  { title: 'Implanter le centre de données', options: [
    { label: 'Région chaude et énergie fossile', performance: 25, cost: 35, explanation: 'Le mix fossile et les besoins de refroidissement augmentent la pression sur les ressources.' },
    { label: 'Région nordique et hydroélectricité', performance: 20, cost: 15, explanation: 'Le climat et le mix énergétique peuvent réduire les impacts de fonctionnement, sans les annuler.' },
  ] },
  { title: 'Sélectionner le matériel', options: [
    { label: 'Nouveaux accélérateurs IA', performance: 25, cost: 35, explanation: 'Le renouvellement exige fabrication, extraction de métaux et gestion des déchets.' },
    { label: 'Serveurs mutualisés et reconditionnés', performance: 15, cost: 10, explanation: 'Allonger la durée de vie et partager le matériel limite le besoin de nouveaux équipements.' },
  ] },
];

export function calculateEcoResult(choices: number[]) {
  if (choices.length !== 3 || choices.some(c => c !== 0 && c !== 1)) throw new Error('Trois choix valides sont requis.');
  const performance = choices.reduce((sum, c, i) => sum + ecoSteps[i].options[c].performance, 0);
  const ecologicalBudget = 100 - choices.reduce((sum, c, i) => sum + ecoSteps[i].options[c].cost, 0);
  return { performance, ecologicalBudget, isSuccessful: performance >= 70 && ecologicalBudget > 0 };
}

export const privacyItems = [
  { id: 'card', label: 'Mon numéro de carte bancaire', safe: false, explanation: 'Une donnée financière sensible ne doit pas être transmise à un outil public.' },
  { id: 'password', label: 'Mon mot de passe', safe: false, explanation: 'Un mot de passe reste secret. Un outil d’IA n’en a pas besoin pour vous aider.' },
  { id: 'public', label: 'Un texte public que j’ai le droit de réutiliser', safe: true, explanation: 'L’absence de données confidentielles et le respect des droits rendent cet usage généralement acceptable.' },
  { id: 'medical', label: 'Mon dossier médical complet', safe: false, explanation: 'Il contient des renseignements sensibles et identifiants. Vérifiez le cadre autorisé et minimisez les données.' },
  { id: 'confidential', label: 'Un document confidentiel de mon employeur', safe: false, explanation: 'Le partage peut compromettre la confidentialité. Suivez les règles de votre organisation.' },
  { id: 'general', label: 'Une question générale sur la photosynthèse', safe: true, explanation: 'Une question générale sans données personnelles présente moins de risques pour la vie privée.' },
];
