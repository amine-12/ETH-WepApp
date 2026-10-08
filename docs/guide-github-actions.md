# Tests et déploiement avec GitHub Actions

Le pipeline est dans [ci-deploy.yml](../.github/workflows/ci-deploy.yml).

- Une pull request vers `main` lance la compilation et les tests unitaires, navigateur et D1 local.
- Une fusion ou un push sur `main` relance les tests, applique les migrations D1 et publie sur https://ia-ethique.pages.dev si tout réussit.
- L’onglet **Actions** permet aussi de lancer le workflow manuellement. Seule la branche `main` peut déployer.
- Les tests utilisent une base locale temporaire. Le déploiement utilise la base de production existante. Relire les nouvelles migrations avant fusion : elles modifient cette base.

## Configuration à faire une fois

1. Dans Cloudflare, créer un **API Token** personnalisé avec les permissions **Account → Cloudflare Pages → Edit** et **Account → D1 → Edit**, limité au compte qui héberge le site.
2. Dans le dépôt GitHub, ouvrir **Settings → Environments**, créer `production` et autoriser uniquement la branche `main` à déployer.
3. Dans cet environnement, ajouter les deux secrets :

   | Nom | Valeur |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | Le jeton créé dans Cloudflare |
   | `CLOUDFLARE_ACCOUNT_ID` | `eab2fae8534ccb450c95bb26038f0913` |

4. Publier les fichiers du projet, y compris `.github/workflows/ci-deploy.yml`, dans le dépôt GitHub. Ne pas publier `.dev.vars` ou `.cloudflare/`.
5. Ouvrir **Actions → Tests et production** pour suivre le premier passage.

Les collaborateurs autorisés à fusionner n’ont pas besoin de compte Cloudflare. Le workflow utilise le jeton enregistré dans GitHub. Le mot de passe du tableau de bord reste configuré dans Cloudflare et ne doit pas être ajouté à GitHub.

## Bloquer une fusion si les tests échouent

Après le premier passage du workflow, ouvrir **Settings → Rules → Rulesets** (ou **Branches**, selon l’interface). Protéger `main`, exiger une pull request et le contrôle **Tests**, et bloquer les contournements pour les collaborateurs concernés.

Sans cette règle, le pipeline bloque le déploiement en cas d’échec, mais GitHub peut encore autoriser la fusion. La disponibilité des protections dépend du plan GitHub et de la visibilité du dépôt.

Les runners standards sont gratuits pour les dépôts publics ; les dépôts privés disposent d’un quota selon le plan GitHub. Ce pipeline utilise un runner Linux.

Sources : [Cloudflare Pages avec GitHub Actions](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [secrets GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [tarification GitHub Actions](https://docs.github.com/en/actions/concepts/billing-and-usage).
