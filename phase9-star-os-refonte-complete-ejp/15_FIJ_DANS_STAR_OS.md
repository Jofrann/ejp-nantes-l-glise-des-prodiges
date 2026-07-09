# 15 — FIJ dans STAR OS

## Décision

FIJ ne doit plus être une architecture principale.

FIJ devient un outil de responsabilité visible dans `/app/responsabilites`.

## Deux outils FIJ

### 1. Pilote FIJ

Route :
`/app/responsabilites/fij-pilote`

Visible pour :
- pilotes FIJ ;
- copilotes, si applicable ;
- coordination FIJ en lecture ou supervision ;
- admin.

### 2. Coordination FIJ

Route :
`/app/responsabilites/fij-coordination`

Visible pour :
- coordination FIJ ;
- responsables autorisés ;
- admin.

## Pilote FIJ — structure

```txt
Pilote FIJ
├── Accueil de ma FIJ
├── Membres
├── CR du jeudi
├── Assiduité
├── Notes de suivi
├── Visiteurs
├── Communications
├── Documents
└── Besoin d’aide
```

## Accueil de ma FIJ

Contenu :
- nom de la FI ;
- jour de rassemblement ;
- lieu général, sans exposer adresse sensible à tous ;
- pilote ;
- copilote ;
- nombre de membres ;
- dernier CR ;
- prochain jeudi ;
- actions à faire.

Boutons :
- `Remplir le CR du jeudi`
- `Voir membres`
- `Ajouter un visiteur`
- `Signaler un besoin`
- `Voir historique`

## Membres

Champs membre :
- prénom ;
- nom ;
- contact, si autorisé ;
- statut ;
- date d’arrivée ;
- assiduité ;
- notes de suivi ;
- historique présence.

Actions :
- `Voir fiche`
- `Ajouter note`
- `Marquer actif`
- `Signaler départ`
- `Demander transfert`

## CR du jeudi

Le CR doit rester fidèle à l’ancien fonctionnement efficace.

Il ne doit pas contenir pour le moment :
- état émotionnel ;
- état financier ;
- radar santé ;
- données intrusives ;
- notes sensibles obligatoires.

Il doit contenir :
- FI concernée ;
- date du jeudi ;
- liste des membres ;
- présent / absent / retard ;
- visiteurs ;
- commentaire général simple ;
- besoin à signaler ;
- validation / envoi.

### Formulaire CR

Étapes :

1. Choisir FI, si pilote de plusieurs FI.
2. Vérifier date du jeudi.
3. Liste des membres.
4. Cocher présence.
5. Ajouter visiteurs.
6. Commentaire général optionnel.
7. Envoyer à la coordination.

Statuts présence :
- présent ;
- absent ;
- retard ;
- excusé ;
- non renseigné.

Boutons :
- `Enregistrer brouillon`
- `Envoyer le CR`
- `Ajouter visiteur`
- `Voir historique`
- `Annuler`

## Assiduité

Vue par membre :
- nombre de présences ;
- absences ;
- retards ;
- tendance ;
- historique.

L’objectif est le suivi, pas l’humiliation.

## Notes de suivi

Le pilote peut noter des éléments utiles :
- encouragement ;
- besoin de relance ;
- demande d’accompagnement ;
- changement de situation ;
- remarque pratique.

Confidentialité :
- visible par pilote et coordination FIJ ;
- éventuellement leader autorisé selon niveau ;
- pas visible par tous.

## Coordination FIJ — structure

```txt
Coordination FIJ
├── Tableau opérationnel
├── Toutes les FIJ
├── CR du jeudi
├── CR manquants
├── Relances
├── Pilotes
├── Membres
├── Visiteurs
├── Ouvertures FIJ
├── Consécrations
├── FIJ en pause
├── Documents
├── Communications
├── Alertes
└── Reporting
```

## Tableau opérationnel

Indicateurs :
- FI actives ;
- FI en pause ;
- membres FIJ ;
- pilotes ;
- CR reçus cette semaine ;
- CR manquants ;
- visiteurs ;
- tendance de présence ;
- alertes.

Boutons :
- `Voir CR manquants`
- `Relancer pilotes`
- `Voir registre`
- `Créer une communication`
- `Exporter reporting`

## Relances

Relancer :
- pilote n’ayant pas rempli CR ;
- FI sans activité ;
- informations manquantes ;
- réunion à venir.

Boutons :
- `Relancer`
- `Relancer tous`
- `Marquer traité`

## Reporting

La coordination peut produire :
- bilan hebdomadaire ;
- bilan mensuel ;
- comparaison S-1 ;
- FI actives ;
- participants ;
- visiteurs ;
- absences ;
- points d’attention.

## Direction

La direction ne doit pas entrer obligatoirement dans FIJ.

Les indicateurs FIJ remontent dans `/app/direction`.

## Données

Entités :
- `FijGroup`
- `FijMember`
- `FijPilotAssignment`
- `FijThursdayReport`
- `FijAttendanceLine`
- `FijVisitor`
- `FijMemberNote`
- `FijTransferRequest`
- `FijOpeningProcess`
- `FijConsecrationRequest`
- `FijPauseStatus`
- `FijCommunication`
- `FijReminder`
- `FijOperationalAlert`

## Critère d’excellence

Le pilote doit remplir un CR en moins de 3 minutes.

La coordination doit savoir en moins de 30 secondes :
- quelles FI ont envoyé leur CR ;
- lesquelles manquent ;
- combien de personnes étaient présentes ;
- quels points nécessitent une action.
