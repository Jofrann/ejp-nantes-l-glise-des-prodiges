# 12 — Parcours et situation

## Route

`/app/parcours`

## Objectif

Permettre au serviteur de renseigner sa saison de vie : étudiant, travailleur, alternant, en recherche de stage, etc.

Cette page appartient d’abord au serviteur, mais certaines données peuvent aider la Vie Académique, les leaders ou les référents à mieux accompagner.

## Structure

```txt
Mon parcours
├── Situation actuelle
├── Études
├── Travail
├── Recherche
├── Compétences
├── Disponibilités
├── Besoins d’accompagnement
└── Historique
```

## Situation actuelle

Options :
- Étudiant ;
- Alternant ;
- Travailleur ;
- En recherche d’emploi ;
- En recherche de stage ;
- En transition ;
- Autre.

## Études

Champs :
- établissement ;
- formation ;
- niveau ;
- année ;
- ville ;
- rythme ;
- recherche de stage ;
- période de stage ;
- difficultés principales, optionnelles ;
- besoin d’accompagnement.

## Travail

Champs :
- domaine ;
- métier ;
- entreprise, optionnel ;
- rythme ;
- contraintes horaires ;
- compétences ;
- disponibilités.

## Recherche

Champs :
- recherche de stage ;
- recherche d’alternance ;
- recherche d’emploi ;
- domaine visé ;
- CV disponible ;
- besoin d’aide ;
- échéance.

## Compétences

Champs :
- compétence ;
- niveau ;
- souhait de servir avec cette compétence ;
- visibilité.

## Disponibilités

L’utilisateur peut renseigner :
- jours disponibles ;
- soirées disponibles ;
- contraintes ;
- périodes d’indisponibilité.

Ces données peuvent nourrir :
- agenda ;
- responsabilités ;
- organisation ;
- accompagnement.

## Besoins d’accompagnement

Types :
- vie académique ;
- orientation ;
- méthode de travail ;
- recherche stage ;
- CV ;
- entretien ;
- organisation personnelle ;
- autre.

Bouton :
- `Demander un accompagnement`

## Visibilité

Le serviteur contrôle une partie de la visibilité.

Certaines données organisationnelles peuvent être visibles par les responsables autorisés :
- statut général ;
- disponibilités ;
- recherche de stage ;
- besoin d’accompagnement déclaré.

Données sensibles non obligatoires.

## Données

Entités :
- `ServantJourney`
- `EducationProfile`
- `WorkProfile`
- `SearchProfile`
- `Skill`
- `Availability`
- `AcademicSupportRequest`

## Critère d’excellence

Cette page doit permettre de connaître la saison de la personne sans l’enfermer dans un département.
