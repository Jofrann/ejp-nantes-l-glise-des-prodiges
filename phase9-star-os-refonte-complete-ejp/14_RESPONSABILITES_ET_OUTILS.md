# 14 — Responsabilités et outils

## Route

`/app/responsabilites`

## Objectif

Afficher les outils de travail liés aux responsabilités du serviteur.

Cette page ne doit pas remplacer l’accueil STAR.
Elle vient après.

## Principe

Les responsabilités sont attribuées selon :
- rôle ;
- rattachement ;
- mission confiée ;
- validation ;
- permission.

Exemples :
- Pilote FIJ ;
- Coordination FIJ ;
- Accueil ;
- Communication ;
- Prodiges Musique ;
- Vie Académique ;
- Coordination ;
- Bureau ;
- Admin.

## Page principale

Sections :
- Mes outils actifs ;
- Actions en attente ;
- Responsabilités ;
- Historique ;
- Demander clarification, si responsabilité erronée.

Carte outil :
- nom ;
- description ;
- statut ;
- dernière action ;
- bouton.

Boutons :
- `Ouvrir`
- `Voir actions`
- `Voir guide`
- `Signaler une erreur`

## Règle d’affichage

Un serviteur ne voit que les outils qui lui sont attribués.

Il ne voit pas :
- outils d’un autre département ;
- données d’un autre périmètre ;
- CRUD d’une mission qui ne lui appartient pas.

## Exemples

### Pilote FIJ

Outil :
`/app/responsabilites/fij-pilote`

Contenu :
- Ma FIJ ;
- CR du jeudi ;
- Membres ;
- Assiduité ;
- Notes de suivi ;
- Communications ;
- Documents.

### Coordination FIJ

Outil :
`/app/responsabilites/fij-coordination`

Contenu :
- Tableau opérationnel ;
- Toutes les FIJ ;
- CR du jeudi ;
- Relances ;
- Pilotes ;
- Membres ;
- Ouvertures ;
- Consécrations ;
- FIJ en pause ;
- Reporting ;
- Documents ;
- Alertes.

### Accueil

Outil :
`/app/responsabilites/accueil`

Contenu :
- planning accueil ;
- présences serviteurs accueil ;
- visiteurs ;
- fiches pratiques ;
- reporting dimanche.

### Communication

Outil :
`/app/responsabilites/communication`

Contenu :
- demandes visuelles ;
- calendrier éditorial ;
- médias ;
- publications ;
- validations.

## Permissions CRUD

Chaque outil doit définir :
- qui peut voir ;
- qui peut créer ;
- qui peut modifier ;
- qui peut supprimer ;
- qui peut valider ;
- qui peut exporter.

## Critère d’excellence

Les responsabilités doivent être vécues comme des applications de travail disponibles dans le bureau personnel, pas comme des couloirs administratifs.
