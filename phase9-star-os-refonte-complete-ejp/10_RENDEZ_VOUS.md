# 10 — Rendez-vous

## Route

`/app/rendez-vous`

## Objectif

Permettre au serviteur de demander un rendez-vous avec la bonne personne ou le bon pôle.

## Types de rendez-vous

- Bergère
- Leader
- Référent
- Soins pastoraux
- Vie académique
- Formation
- Service / responsabilité
- Orientation
- Autre

## Page principale

Sections :
- demander un rendez-vous ;
- demandes en attente ;
- rendez-vous confirmés ;
- historique ;
- règles de confidentialité.

Boutons :
- `Demander un rendez-vous`
- `Voir mes demandes`
- `Annuler une demande`
- `Modifier mes disponibilités`

## Formulaire de demande

Champs :
- type de rendez-vous ;
- sujet ;
- personne souhaitée, optionnel ;
- niveau d’urgence ;
- disponibilités ;
- message ;
- acceptation confidentialité.

Urgences :
- normal ;
- important ;
- urgent.

Ne pas utiliser de formulation dramatique ou culpabilisante.

## Traitement côté responsable

Un responsable autorisé voit :
- demandes qui le concernent ;
- type ;
- urgence ;
- disponibilités ;
- message ;
- historique de traitement.

Actions :
- `Accepter`
- `Proposer un créneau`
- `Transférer au bon pôle`
- `Demander précision`
- `Clôturer`

## Confidentialité

Les demandes pastorales et personnelles doivent être visibles uniquement par :
- la personne destinataire ;
- les personnes explicitement autorisées ;
- admin technique si nécessaire, mais non affiché dans les interfaces ordinaires.

## Intégration avec agenda

Un rendez-vous accepté crée un événement dans l’agenda du serviteur.

## Données

Entités :
- `AppointmentRequest`
- `AppointmentSlot`
- `AppointmentParticipant`
- `AppointmentMessage`
- `AppointmentStatusHistory`

## Critère d’excellence

Le serviteur doit savoir où demander de l’aide sans devoir écrire à cinq personnes sur WhatsApp.
