# Déployer le site sur Cloudflare

Site : https://ia-ethique.pages.dev  
Statistiques : https://ia-ethique.pages.dev/statistiques

Les commandes ci-dessous s’exécutent dans **PowerShell**, depuis le dossier du projet. Node.js et npm doivent être installés.

## 1. Préparer son ordinateur

```powershell
npm.cmd ci
npx.cmd wrangler login
$env:CLOUDFLARE_ACCOUNT_ID = 'eab2fae8534ccb450c95bb26038f0913'
```

Se connecter au compte Cloudflare qui possède le projet. La variable de compte est à redéfinir à chaque nouvelle fenêtre PowerShell.

## 2. Publier une mise à jour

Le projet, la base de données et le mot de passe administrateur sont **déjà configurés**.

```powershell
npm.cmd run deploy:cloudflare
```

Cette commande compile le site puis publie les fichiers et l’API sur Cloudflare. Attendre le message `Deployment complete`, puis ouvrir le site. Les statistiques déjà enregistrées restent dans la base.

Si une modification ajoute une migration dans le dossier `migrations`, l’appliquer **avant** de publier :

```powershell
npx.cmd wrangler d1 migrations apply ANALYTICS_DB --remote
npm.cmd run deploy:cloudflare
```

## 3. Configuration initiale uniquement

Ces étapes servent à recréer l’hébergement sur un autre compte. Ne pas les refaire pour une simple mise à jour.

1. Créer la base :

   ```powershell
   npx.cmd wrangler d1 create ia-ethique-analytics
   ```

2. Copier le nouvel identifiant `database_id` dans `wrangler.jsonc`. Si le compte change, remplacer aussi la valeur de `$env:CLOUDFLARE_ACCOUNT_ID` par celle du nouveau compte.

3. Créer les tables et le projet Pages :

   ```powershell
   npx.cmd wrangler d1 migrations apply ANALYTICS_DB --remote
   npx.cmd wrangler pages project create ia-ethique --production-branch main
   ```

   Le nom du projet doit être disponible. Si Cloudflare demande un autre nom, le remplacer aussi dans `wrangler.jsonc`, le script `deploy:cloudflare` de `package.json` et la commande suivante. L’adresse sera `https://NOM-DU-PROJET.pages.dev`.

4. Définir le mot de passe administrateur, puis publier :

   ```powershell
   npx.cmd wrangler pages secret put ANALYTICS_ADMIN_TOKEN --project-name ia-ethique
   npm.cmd run deploy:cloudflare
   ```

   Saisir un mot de passe long à l’invite et le conserver dans un gestionnaire de mots de passe.

## 4. Vérifier le résultat

- Ouvrir le site et tester un module.
- Ouvrir `/api/analytics` : le résultat doit être `{"enabled":true}`.
- Accepter les statistiques, répondre à une question, puis ouvrir `/statistiques` et cliquer sur **Actualiser** après connexion.

Pour le déploiement actuel, le mot de passe de production est conservé localement dans `.cloudflare/admin-secret.json`, sous `ANALYTICS_ADMIN_TOKEN`. Le mot de passe de `.dev.vars` sert uniquement aux tests locaux.

Ne pas partager ni ajouter à Git `.cloudflare/` ou `.dev.vars`.
