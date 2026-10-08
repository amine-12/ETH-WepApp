# IA & Éthique

Site éducatif en français : six modules, lectures, questions, activités et quiz. React + TypeScript + Vite, hébergé sur Cloudflare Pages avec une API et une base D1 pour les statistiques facultatives.

**Site :** https://ia-ethique.pages.dev · **Administration :** https://ia-ethique.pages.dev/statistiques

## Démarrer

Utiliser Node.js 24 et lancer ces commandes dans le dossier du projet :

```sh
npm ci
npm run dev
```

Ouvrir http://127.0.0.1:5173. Les changements s’affichent automatiquement. Sous PowerShell, utiliser `npm.cmd` et `npx.cmd` si nécessaire.

## Variables d’environnement

### Développement local

Le frontend ne nécessite aucun fichier `.env`. Pour tester l’API et les statistiques, créer **`.dev.vars`** à la racine à partir de `.dev.vars.example` :

```dotenv
ANALYTICS_ADMIN_TOKEN=admin
```

`admin` est le mot de passe de test du tableau de bord local. La base `ANALYTICS_DB` est configurée dans `wrangler.jsonc`, pas dans `.env`.

Puis lancer :

```sh
npm run db:local
npm run dev:cloudflare
```

Ouvrir http://localhost:8788 et `/statistiques`. Après modification du code ou de `.dev.vars`, arrêter avec **Ctrl+C** puis relancer cette commande. La base locale reste séparée de la production.

### Production et GitHub Actions

| Variable | Où la configurer | Valeur |
| --- | --- | --- |
| `ANALYTICS_ADMIN_TOKEN` | Secret du projet Cloudflare Pages | Mot de passe administrateur long, différent de `admin` |
| `CLOUDFLARE_API_TOKEN` | Secret GitHub de l’environnement `production` | Jeton Cloudflare avec les permissions Pages Edit et D1 Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Secret GitHub de l’environnement `production` | `eab2fae8534ccb450c95bb26038f0913` |

Garder `.dev.vars` et `.cloudflare/` privés. Ne jamais placer de secret dans une variable `VITE_*`, car elle serait accessible dans le navigateur.

## Vérifier et déployer

```sh
npm run build                  # Compilation
npm test                       # Tests unitaires et SQL
npx playwright install chromium
npx playwright test            # Tests navigateur
npm run test:cloudflare        # Test API et D1 local, après configuration ci-dessus
npm run deploy:cloudflare      # Publication, après connexion avec npx wrangler login
```

GitHub Actions teste les pull requests vers `main`, puis teste et déploie les changements arrivant sur `main`. Configurer les secrets avant le premier déploiement automatisé.

## Structure et données

- `src/data/` : textes, modules, questions et ressources. Mettre à jour `server/catalog.js` si leurs identifiants changent.
- `src/components/`, `src/pages/`, `src/App.tsx`, `src/styles.css` : interface et navigation.
- `functions/api/`, `server/`, `migrations/` : API, statistiques et schéma D1.
- `tests/` : tests unitaires et parcours navigateur.

La progression et les réponses sélectionnées restent dans le navigateur. Les statistiques sont enregistrées dans D1 uniquement après consentement, avec un identifiant aléatoire de session et sans texte libre ni choix de réponse.

## Guides

- [Développement local](docs/guide-developpement.md)
- [Déploiement Cloudflare](docs/guide-deploiement.md)
- [Configuration GitHub Actions](docs/guide-github-actions.md)
