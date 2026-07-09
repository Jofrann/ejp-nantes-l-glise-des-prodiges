# 02 — Suppressions et modifications à appliquer

## Objectif

Nettoyer l’ancienne architecture pour éviter deux applications en concurrence :
- une application départements ;
- une application STAR personnelle.

La nouvelle architecture doit être unifiée.

## À supprimer comme entrée principale

### 1. Tableau de bord centré sur les départements

Si `/app` affiche d’abord :
- cartes de départements ;
- accès FIJ ;
- accès Accueil ;
- accès Communication ;

alors il faut le remplacer.

`/app` doit devenir **Accueil STAR**.

Les départements peuvent encore exister, mais plus comme centre de l’expérience.

### 2. Page “Mes départements” comme page de travail

La page “Mes départements” ne doit plus être une page où le serviteur va travailler.

Elle peut devenir une page secondaire :
- “Mon organisation” ;
- “Mes rattachements” ;
- “Mes équipes” ;
- “Mes référents”.

Mais le travail réel doit être dans :
- `/app/responsabilites` ;
- ou directement dans les modules personnels.

### 3. Espace FIJ comme destination principale autonome

Ne pas mettre FIJ comme grosse page centrale pour tous.

FIJ doit apparaître seulement si l’utilisateur a une responsabilité FIJ :
- Pilote FIJ ;
- Coordination FIJ ;
- Admin FIJ ;
- Direction en lecture des indicateurs, mais dans `/app/direction`.

### 4. Direction FIJ séparée

Supprimer l’idée d’un espace “Direction FIJ” obligatoire.

Les bergers/leaders ne doivent pas aller dans un sous-espace FIJ pour voir les chiffres.

Les indicateurs FIJ remontent dans `/app/direction`.

## À déplacer

### Départements

Avant :
`/app/departements`

Après :
`/app/organisation/departements` ou `/app/responsabilites` selon le contexte.

Utilité :
- voir mes rattachements ;
- savoir qui est mon référent ;
- comprendre l’équipe ;
- consulter les standards ;
- mais pas comme bureau de travail principal.

### FIJ pilote

Avant :
`/app/departements/fij`

Après :
`/app/responsabilites/fij-pilote`

Ou raccourci depuis la page d’accueil si action à faire :
`/app/responsabilites/fij-pilote/cr-jeudi/nouveau`

### FIJ coordination

Avant :
`/app/departements/fij/coordination`

Après :
`/app/responsabilites/fij-coordination`

### Données de direction

Avant :
dispersées dans les pages métiers.

Après :
`/app/direction`

## À créer

Créer les routes personnelles suivantes :

- `/app/agenda`
- `/app/presences`
- `/app/formations`
- `/app/croissance`
- `/app/objectifs`
- `/app/rendez-vous`
- `/app/ressources`
- `/app/parcours`
- `/app/espace-personnel`
- `/app/responsabilites`
- `/app/organisation`
- `/app/direction`
- `/app/admin`

## À conserver

Conserver :
- l’authentification ;
- les rôles ;
- les données FIJ existantes ;
- le fonctionnement CR du jeudi ;
- la gestion des membres FIJ ;
- les présences ;
- les formations ;
- les permissions ;
- les profils utilisateurs.

Mais les replacer dans une architecture personnelle.

## Règle de migration

Tout ce qui est mission doit répondre à cette question :

> Est-ce une information personnelle du serviteur, une donnée organisationnelle, ou un outil de responsabilité ?

Selon la réponse :
- personnelle → module personnel ;
- organisationnelle → supervision / direction ;
- responsabilité → `/app/responsabilites`.
