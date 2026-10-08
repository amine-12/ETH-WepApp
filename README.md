# IA & Éthique · ETH610

Plateforme pédagogique en français : six modules, chapitres interactifs, quatorze questions avec explications, quatre activités et un quiz final de dix questions.

## Démarrer

Node.js 22.18 ou supérieur recommandé (les tests unitaires utilisent la prise en charge native de TypeScript).

```sh
npm install
npm run dev
```

Ouvrir l’adresse affichée par Vite, généralement http://127.0.0.1:5173.
Sous PowerShell, si les scripts npm sont bloqués, utiliser `npm.cmd` au lieu de `npm`.

```sh
npm run build
npm run preview
npm test
```

## Architecture

- `src/data/modules.ts` : contenus, chapitres, diagrammes, exemples et sources.
- `src/data/readings.ts` : lectures développées à partir des textes fournis, réparties en chapitres de longueur modérée.
- `src/data/resources.ts` : huit ressources externes en français et cinq synthèses originales avec leurs sources.
- `src/pages/ResourcesPage.tsx` : onglet Ressources, liens vers les organismes et lectures éducatives avec sommaire.
- `src/data/questions.ts` : questions et sélection du quiz final, identifiants stables.
- `src/data/games.ts` : règles du jeu environnemental et exemples de confidentialité.
- `src/types/course.ts` : types du cours, des réponses et de la progression.
- `src/services/progressService.ts` : seul accès au stockage local ; validation, réponses, progression, complétion et résultats des jeux.
- `src/context/ProgressContext.tsx` : état partagé et actions de sauvegarde.
- `src/components/QuestionCard.tsx` : choix, validation et rétroaction pédagogique.
- `src/components/ModuleReading.tsx` : présentation de la lecture et indication de durée approximative, avant les exercices.
- `src/components/activities.tsx` : diagrammes, constructeur de demande, recherche d’hallucination, jeu écologique et classement des données.
- `src/components/common.tsx` : cartes des modules, icônes et barres de progression.
- `src/App.tsx` : navigation, pages et composant générique `ModuleLayout`.
- `src/styles.css` : design responsive, focus clavier et mouvement réduit.

Routes : `/`, `/modules`, `/modules/comprendre-ia`, `/modules/bien-utiliser-ia`, `/modules/hallucinations`, `/modules/environnement`, `/modules/vie-privee`, `/modules/responsabilite`, `/quiz`, `/progression`, `/ressources`. Une page 404 couvre les routes inconnues.

Les ressources ont été recherchées le 7 octobre 2026 auprès d’organismes et d’éditeurs de cours : Inria, Elements of AI, CNIL, UNESCO, Déclaration de Montréal et ADEME. Les textes de la page Ressources sont des synthèses originales, avec des liens vers les sources, et non des reproductions intégrales. Les liens externes s’ouvrent dans un nouvel onglet et les PDF sont signalés. La version française de la page questions-réponses de la CNIL était indexée mais a retourné un délai d’attente dans l’outil de consultation ; son équivalent anglais a été consulté pour la synthèse. Les liens restent des ressources externes dont le contenu et la disponibilité peuvent évoluer.

## Progression et confidentialité

Le parcours reste utilisable comme site statique. Une collecte facultative et un tableau de bord protégé ont été ajoutés avec Cloudflare Pages Functions et D1. Aucun compte visiteur, abonnement analytics ou serveur permanent n’est nécessaire. Voir [le guide de déploiement gratuit](docs/deploiement-gratuit.md) pour les étapes de configuration et les quotas.

`localStorage` contient la progression sous la clé `eth610.progress.v1` : chapitres, modules terminés, dernière réponse par question, nombre de tentatives, résultats des activités et dernier score du quiz. Le quiz recommencé utilise une nouvelle tentative indépendante des réponses déjà sauvegardées. Après acceptation des statistiques, un identifiant aléatoire de session relie les événements envoyés, sans envoyer la progression complète ni les choix de réponse.

Si le stockage est indisponible, le parcours reste fonctionnel en mémoire et une notice l’indique. Un stockage absent ou corrompu revient à une progression vide. Les exercices ne bloquent pas la navigation. Si la mesure est acceptée, un temps actif approximatif est calculé en excluant les onglets masqués et les longues périodes d’inactivité.

## Modifier le cours

Ajouter ou modifier les sections dans `src/data/modules.ts`, puis les questions dans `src/data/questions.ts`. Les types sont `multiple-choice`, `true-false` et `scenario`. Chaque option possède un identifiant et chaque question une explication. Conserver les identifiants existants pour préserver les réponses locales ; changer la version du stockage si leur signification change radicalement.

Le contenu fourni est réparti en lectures d’environ 150 à 200 mots par chapitre, suivies des questions ou activités correspondantes. Les idées et exemples originaux sont développés dans trois paragraphes, avec leurs nuances éthiques. Les modules Comprendre l’IA et Bien utiliser l’IA s’appuient aussi sur les consignes de conception, qui ne contenaient pas de texte de cours autonome pour ces deux thèmes. Les exemples juridiques ne constituent pas des conseils juridiques. Les cas controversés du module Responsabilité sont présentés comme tels, sans conclure à une responsabilité non établie. Les chiffres environnementaux non généralisables ne sont pas présentés comme des mesures universelles. Le « Global AI Truth Index » est une invention volontaire réservée au jeu d’hallucination. Les jauges écologiques sont fictives ; toutes les combinaisons actuelles atteignent la performance minimale, certaines épuisent le budget. Le message de sous-performance reste prévu si les règles sont modifiées.

Le dossier fourni et ses instructions originales sont conservés dans `docs/`. Les cas détaillés du module Responsabilité sont présentés dans des panneaux dépliables, attribués au dossier du cours. La CJUE, les expériences d’Anthropic et l’étude sur le test de Turing possèdent des liens vers les documents originaux. Les autres cas du dossier doivent recevoir leurs références bibliographiques précises avant une publication universitaire ; aucune évolution ultérieure des procédures n’est affirmée.

## Tests navigateur

```sh
npx playwright install chromium
npx playwright test
```

Sous Windows, il est aussi possible d’utiliser Edge déjà installé :

```powershell
$env:PW_CHANNEL = 'msedge'
npx.cmd playwright test
```

Les tests couvrent les routes et chapitres, les erreurs console, la persistance des réponses et de la complétion, les résultats des jeux, une tentative complète du quiz, son redémarrage, le menu mobile, les débordements et le stockage indisponible.

Ils vérifient aussi le lien d’évitement au clavier et les pages principales avec une taille de texte doublée sur desktop. Des captures de contrôle sont générées dans `test-results/` (ignoré par Git).


Vérification exécutée le 7 octobre 2026 : compilation réussie, 8 tests unitaires/API/SQL, 12 tests navigateur et 1 test complet avec la vraie API Cloudflare et D1 en local réussis. Les tests couvrent aussi le consentement, son retrait, le temps actif, le renouvellement des sessions et le tableau de bord. Ces contrôles locaux ne constituent pas un test de production ni un audit complet d’accessibilité.

## Hébergement et statistiques

Le site est publié sur **https://ia-ethique.pages.dev** avec Cloudflare Pages et D1. Voir [le compte rendu de production](docs/deploiement-production.md) pour l’accès administrateur et les vérifications, et [le guide](docs/deploiement-gratuit.md) pour la configuration et les quotas du plan Free.

- Tableau de bord : `/statistiques`, lien « Administration » dans le pied de page.
- Mesures : sessions, pages, modules, chapitres, temps actif, réponses, activités, quiz, ressources et erreurs.
- Collecte désactivée avant acceptation ; choix modifiable dans le pied de page.
- Rapports agrégés sur 7, 30 et 90 jours, export JSON.
- Secret `ANALYTICS_ADMIN_TOKEN` côté serveur uniquement et binding D1 `ANALYTICS_DB`.
- `npm run db:local`, puis `npm run dev:cloudflare` pour tester réellement l’API. Vite seul ne fournit pas la base.
- `server/catalog.js` contient la liste fermée des identifiants autorisés ; l’actualiser avec les contenus. Un test vérifie sa cohérence.

Les scores sont des signaux d’usage déclaratifs et les corrections restent publiques : ce système ne constitue pas un outil de notation officielle. La table de statistiques ne contient ni nom, courriel, texte libre, IP ou choix de réponse. Consulter le guide pour les limites de mesure, les quotas et la suppression des anciens événements.

## Fichiers livrés

Tous les fichiers sont nouveaux : le dépôt initial ne contenait aucun fichier suivi ni commit.

```text
.gitignore
README.md
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts
playwright.config.ts
public/favicon.svg
public/_routes.json
wrangler.jsonc
.dev.vars.example
functions/api/analytics.js
functions/api/statistics.js
server/analytics.js
server/catalog.js
migrations/0001_analytics.sql
playwright.cloudflare.config.ts
src/main.tsx
src/App.tsx
src/styles.css
src/types/course.ts
src/data/modules.ts
src/data/readings.ts
src/data/resources.ts
src/pages/ResourcesPage.tsx
src/pages/StatisticsPage.tsx
src/data/questions.ts
src/data/games.ts
src/services/progressService.ts
src/services/analyticsService.ts
src/context/ProgressContext.tsx
src/components/common.tsx
src/components/QuestionCard.tsx
src/components/ModuleReading.tsx
src/components/activities.tsx
src/components/Analytics.tsx
tests/core.test.ts
tests/analytics.test.ts
tests/browser/course.spec.ts
tests/browser/analytics.spec.ts
tests/cloudflare/analytics.spec.ts
docs/deploiement-gratuit.md
docs/contenu-pedagogique-original.txt
docs/instructions-frontend-originales.txt
```
