# EJP Nantes — version locale indépendante

Prérequis : Node.js 24. Le projet ne nécessite plus de compte, de SDK ou de serveur Base44.

Pour lancer le site complet (pages et API, un seul serveur) :

```sh
npm ci
npm start
```

Chaque `npm start` reconstruit le site avant de démarrer : les modifications visuelles sont donc incluses automatiquement. Depuis le dossier parent `ejp-nantes-site-local`, `npm start` fonctionne également. Ouvrir `http://localhost:5173/` pour la vitrine publique.

Le serveur écoute sur le port 5173 (`PORT` permet de le changer). Ouvrir la page `/login` sur l’adresse de votre hébergement pour créer votre compte. Il faut un navigateur ayant accès à ce serveur : l’espace de configuration Codex ne fournit pas de lien public ni d’aperçu intégré. La publication de l’environnement sauvegarde sa configuration ; elle ne publie pas le site sur Internet.

Pour modifier le code avec rechargement automatique :

```sh
npm run dev
```

Le frontend Vite écoute sur le port 5173 et relaie `/api/local` vers le serveur Node sur 127.0.0.1:3001. Ouvrir `/login` pour créer le premier compte administrateur avec votre adresse et un mot de passe de 12 caractères minimum. Aucun compte ni mot de passe par défaut n'est fourni. Les identifiants `@prodiges` correspondent au domaine `ejp.local` ; vous pouvez toujours utiliser l'adresse saisie lors de la création du compte.

SQLite conserve les données dans `.local-data/ejp.sqlite` (ignoré par Git). Sauvegarder le dossier complet lorsque le serveur est arrêté. `EJP_DATA_DIR` permet de choisir un autre dossier et `EJP_API_PORT` un autre port API (le proxy Vite suit automatiquement ce port). Les données historiques Base44 ne sont pas incluses : la base démarre vide, avec la configuration EJP uniquement.

Le client `src/api/base44Client.js` conserve son nom pour compatibilité avec les écrans mais utilise uniquement le serveur local. Le serveur réutilise les fonctions métier TypeScript du dossier `base44/functions`, en remplaçant leurs imports SDK par l'adaptateur local. Les mots de passe sont hachés avec scrypt ; les sessions utilisent des cookies HttpOnly et expirent après 24 heures. Les données privées via l'API générique sont actuellement réservées à l'administrateur ; les fonctions métier conservent leurs vérifications de rôle.

Cette version est destinée au développement local et à l'administration. Elle n'est pas un déploiement public multi-utilisateurs : le formulaire de création du premier compte doit rester accessible seulement à son propriétaire. Les invitations par email, la récupération par email, les uploads, l'IA, les paiements, Google Meet et OAuth nécessitent encore des remplacements dédiés. Ils ne simulent pas un succès. Les comptes membres et leurs droits fins devront être intégrés avant une ouverture à tous les serviteurs.

Validation : `npm run build` ; `npm test`. Le lint et le contrôle de types du projet original présentent déjà des erreurs.

Pour un hébergement HTTPS, définir `EJP_PUBLIC_ORIGIN` avec l’origine exacte du site (exemple : `https://votre-domaine.fr`, sans chemin ni barre finale) ; cette valeur autorise les formulaires de cette origine et active les cookies Secure. `EJP_HOST` contrôle l’interface d’écoute. Le mode `npm start` sert uniquement le dossier compilé `dist`, jamais les sources, la base de données ou les fichiers Git. Conserver `.local-data` sur un volume persistant. Ne pas exposer le premier lancement à des tiers avant d’avoir créé votre compte.

## Premier administrateur sur Render

Le premier compte peut être initialisé par EJP_INITIAL_ADMIN_IDENTIFIER et EJP_INITIAL_ADMIN_PASSWORD_HASH (format scrypt sel hex de 16 octets, deux-points, clé hex de 64 octets). Aucun mot de passe par défaut n’est livré. Initialisation uniquement en absence de toute credential ; aucun compte existant remplacé. Ne jamais versionner ces valeurs ni le dossier de données. Le formulaire de création et les changements de mot de passe conservent leur minimum de 12 caractères.
