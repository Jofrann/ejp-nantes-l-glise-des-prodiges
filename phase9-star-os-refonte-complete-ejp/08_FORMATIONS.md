# 08 — Formations

## Route

`/app/formations`

## Objectif

Permettre au serviteur de suivre son parcours de formation, regarder les contenus, écrire des résumés et recevoir validation.

## Formations prévues

- PCNC 001
- PCNC 101
- PCNC 201
- Formation serviteur
- Formation pilote FIJ
- Formation accueil
- Formation communication
- Formation musique
- Formation coordination
- Modules spéciaux

## Page “Mes formations”

Contenu :
- formations assignées ;
- formations recommandées ;
- formations terminées ;
- formations en attente de validation ;
- progression globale.

Carte formation :
- titre ;
- catégorie ;
- progression ;
- prochain module ;
- statut ;
- bouton.

Boutons :
- `Continuer`
- `Commencer`
- `Voir détails`
- `Envoyer résumé`

## Page formation détaillée

Route :
`/app/formations/:formationId`

Contenu :
- description ;
- objectifs ;
- modules ;
- progression ;
- documents ;
- formateur/référent ;
- validations.

## Module vidéo

Route :
`/app/formations/:formationId/modules/:moduleId`

Contenu :
- vidéo ;
- document ;
- consignes ;
- résumé à rédiger ;
- quiz éventuel ;
- bouton de soumission.

Boutons :
- `Marquer comme regardé`
- `Rédiger mon résumé`
- `Enregistrer brouillon`
- `Envoyer pour validation`

## Résumé de vidéo

Champs :
- ce que j’ai compris ;
- ce qui m’a marqué ;
- ce que je dois appliquer ;
- question éventuelle ;
- temps passé ;
- statut.

Statuts :
- brouillon ;
- envoyé ;
- à corriger ;
- validé.

## Validation

Un formateur ou responsable autorisé peut :
- lire résumé ;
- valider ;
- demander correction ;
- commenter ;
- attribuer module suivant.

Boutons responsable :
- `Valider`
- `Demander correction`
- `Commenter`
- `Voir historique`

## Formation pilote FIJ

Visible seulement pour :
- pilote FIJ ;
- futur pilote FIJ ;
- coordination FIJ ;
- formateur autorisé.

Contenu recommandé :
- rôle du pilote ;
- gestion d’une FI ;
- CR du jeudi ;
- assiduité ;
- suivi des membres ;
- communication avec coordination ;
- éthique et confidentialité.

## Données

Entités :
- `TrainingProgram`
- `TrainingModule`
- `TrainingEnrollment`
- `TrainingVideo`
- `TrainingDocument`
- `TrainingSummary`
- `TrainingValidation`
- `TrainingComment`

## Intégration Accueil STAR

Afficher :
- formation en cours ;
- prochaine vidéo ;
- résumé à envoyer ;
- formation en retard.

## Critère d’excellence

Chaque formation doit être orientée vers l’action :
- regarder ;
- comprendre ;
- résumer ;
- appliquer ;
- valider.
