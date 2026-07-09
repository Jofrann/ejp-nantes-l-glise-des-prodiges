# 06 — Présences et badgeage

## Route

`/app/presences`

## Objectif

Centraliser les présences, absences, retards et motifs pour les cultes, programmes, réunions, formations et services.

Cette page ne doit pas être punitive.
Elle doit permettre l’ordre, la visibilité et la responsabilité.

## Structure de page

```txt
Mes présences
├── À confirmer
├── Aujourd’hui
├── Historique
├── Absences
├── Retards
└── Statistiques personnelles
```

## Bloc “À confirmer”

Liste des événements qui attendent une réponse.

Carte :
- titre événement ;
- date ;
- heure ;
- lieu ;
- statut actuel ;
- deadline de réponse.

Boutons :
- `Je serai présent`
- `Je serai absent`
- `Je serai en retard`
- `Voir détails`

## Formulaire d’absence

Champs :
- événement concerné ;
- motif général ;
- commentaire optionnel ;
- justificatif optionnel, seulement si nécessaire ;
- visibilité.

Motifs :
- Travail ;
- Études ;
- Santé ;
- Famille ;
- Déplacement ;
- Service ailleurs ;
- Autre.

## Formulaire de retard

Champs :
- heure estimée d’arrivée ;
- motif général ;
- commentaire optionnel.

Boutons :
- `Signaler mon retard`
- `Annuler`

## Badgeage d’arrivée

Pour certains programmes, l’application peut proposer :

Bouton :
- `Je suis arrivé`

Données :
- user_id ;
- event_id ;
- timestamp ;
- statut ;
- mode de validation.

Modes possibles :
- auto-déclaré ;
- validé par responsable ;
- QR code, futur ;
- géolocalisation, non prioritaire et à éviter au début.

## Historique

Afficher :
- événement ;
- date ;
- statut ;
- motif si absence ;
- validation ;
- commentaire.

Filtres :
- mois ;
- type d’événement ;
- statut ;
- année.

## Statistiques personnelles

Afficher seulement à l’utilisateur :
- nombre de présences ;
- absences justifiées ;
- retards ;
- taux de réponse ;
- série de confirmations à temps.

Pour responsables :
- statistiques organisationnelles utiles ;
- pas de jugement affiché ;
- pas de classement humiliant.

## Données visibles par les responsables

Oui :
- présent ;
- absent ;
- retard ;
- motif général ;
- réponse manquante ;
- historique lié à un événement.

Non :
- notes personnelles ;
- détails sensibles ;
- vie spirituelle privée ;
- commentaires privés non partagés.

## Actions responsables

Un responsable autorisé peut :
- voir qui a répondu ;
- relancer les non-réponses ;
- valider une présence ;
- exporter une liste ;
- voir taux de présence de son périmètre.

Boutons responsables :
- `Relancer`
- `Exporter`
- `Valider`
- `Voir détails`
- `Filtrer`

## Intégration avec l’agenda

Depuis un événement dans l’agenda :
- confirmer présence ;
- signaler absence ;
- signaler retard.

Depuis Présences :
- ouvrir événement dans l’agenda.

## Entités nécessaires

- `AttendanceEvent`
- `AttendanceResponse`
- `AttendanceCheckIn`
- `AbsenceReason`
- `AttendanceScope`
- `AttendanceReminder`

## Règle d’excellence

Le serviteur doit pouvoir répondre en deux clics.

Exemple :
1. Cliquer “Je serai présent”.
2. Confirmation enregistrée.

Pour une absence :
1. Cliquer “Je serai absent”.
2. Choisir motif.
3. Enregistrer.
