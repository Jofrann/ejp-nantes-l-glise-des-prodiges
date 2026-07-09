# 13 — Espace personnel personnalisable

## Route

`/app/espace-personnel`

## Objectif

Permettre au serviteur de personnaliser son bureau STAR.

L’idée est celle d’un bureau réel :
- photo ;
- raccourcis ;
- notes épinglées ;
- widgets ;
- préférences.

## Éléments personnalisables

### Profil visuel

- photo de profil ;
- bannière ;
- couleur d’accent discrète ;
- verset personnel, optionnel ;
- phrase de saison, optionnel.

### Widgets

Le serviteur peut afficher, masquer ou réordonner :

- Agenda du jour ;
- Présence à confirmer ;
- Formation en cours ;
- Objectif du mois ;
- Lecture de la Parole ;
- Prochain rendez-vous ;
- Ressources favorites ;
- Responsabilité prioritaire ;
- Notes épinglées ;
- Livre en cours.

### Raccourcis

Exemples :
- Déclarer présence ;
- Demander rendez-vous ;
- Continuer PCNC ;
- Remplir CR du jeudi ;
- Ouvrir ma FIJ ;
- Ajouter une note ;
- Voir ressources.

### Notes épinglées

Notes privées visibles seulement par l’utilisateur.

### Préférences

- notifications email ;
- notifications push, futur ;
- rappels présence ;
- rappels formation ;
- rappel lecture ;
- affichage compact ou confortable ;
- vue agenda par défaut.

## Boutons

- `Personnaliser`
- `Ajouter un widget`
- `Réordonner`
- `Masquer`
- `Restaurer par défaut`
- `Enregistrer`

## État par défaut

Pour éviter une page vide, proposer une configuration par défaut :
- agenda ;
- présence ;
- formation ;
- croissance ;
- ressources ;
- responsabilités.

## Données

Entités :
- `UserWorkspacePreference`
- `UserWidget`
- `UserShortcut`
- `PinnedNote`
- `UserThemePreference`

## Règle

La personnalisation ne doit pas casser l’ordre.

Le serviteur peut personnaliser son bureau, mais les actions importantes doivent rester accessibles.
