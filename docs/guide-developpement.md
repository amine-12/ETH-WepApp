# Développer le site en local

Utiliser **PowerShell** dans le dossier du projet. Installer Node.js **22.13 ou plus récent** et npm avant de commencer.

## 1. Installer les dépendances

```powershell
npm.cmd ci
```

À faire au premier lancement et lorsque les dépendances changent.

## 2. Lancer le site

```powershell
npm.cmd run dev
```

Ouvrir l’adresse affichée dans le terminal, généralement http://127.0.0.1:5173. Les changements dans le code s’affichent automatiquement.

Ce mode convient pour modifier les pages, les textes et le style. Pour tester la base et les statistiques, utiliser le mode suivant.

## 3. Tester les statistiques et la base locale

Créer le fichier de configuration locale s’il n’existe pas :

```powershell
if (!(Test-Path .dev.vars)) {
    Copy-Item .dev.vars.example .dev.vars
}
```

Le mot de passe de test fourni est `admin`. Il peut être modifié dans `.dev.vars`.

Créer les tables puis démarrer le site avec son API :

```powershell
npm.cmd run db:local
npm.cmd run dev:cloudflare
```

Ouvrir http://localhost:8788, accepter les statistiques et tester un module. Consulter http://localhost:8788/statistiques avec le mot de passe de `.dev.vars`, puis cliquer sur **Actualiser**.

La base locale est conservée dans `.wrangler/` et reste séparée de la production. Après un changement de code ou de `.dev.vars`, arrêter ce serveur avec **Ctrl+C** puis relancer `npm.cmd run dev:cloudflare` pour reconstruire le site.

## 4. Vérifier les modifications

Compiler le site et lancer les tests unitaires :

```powershell
npm.cmd run build
npm.cmd test
```

Pour les tests navigateur sous Windows, utiliser Edge installé sur l’ordinateur :

```powershell
$env:PW_CHANNEL = 'msedge'
npx.cmd playwright test
```

Pour tester aussi l’API et la base locale, préparer `.dev.vars` et les tables comme à l’étape 3, puis lancer :

```powershell
npm.cmd run test:cloudflare
```

Ces tests ajoutent des données uniquement dans la base locale.

## 5. Où modifier le projet

| Dossier ou fichier | Contenu |
| --- | --- |
| `src/App.tsx` | Pages et navigation |
| `src/components/` | Composants, questions et activités |
| `src/data/` | Textes, modules, questions et ressources |
| `src/services/` | Progression et envoi des statistiques |
| `src/styles.css` | Style du site |
| `functions/api/` | Routes de l’API Cloudflare |
| `server/` | Validation et calcul des statistiques |
| `migrations/` | Structure de la base de données |
| `public/` | Favicon et fichiers publics |

**Ctrl+C** arrête le serveur dans le terminal. Garder `.dev.vars` et `.cloudflare/` privés.

Pour publier les modifications, suivre le [guide de déploiement](guide-deploiement.md).
