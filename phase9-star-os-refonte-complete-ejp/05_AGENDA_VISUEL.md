# 05 — Agenda visuel

## Route

`/app/agenda`

## Rôle

Créer un agenda personnel visuel, proche de l’expérience Calendrier iPhone, Google Calendar ou Samsung Calendar.

Ce n’est pas une simple liste d’événements.

C’est une vraie vue temporelle où le serviteur voit sa semaine, ses blocs horaires et les chevauchements.

## Objectif

Le serviteur doit voir :
- ses cultes ;
- ses programmes ;
- ses réunions ;
- ses formations ;
- ses rendez-vous ;
- ses services ;
- ses temps personnels ;
- ses échéances ;
- les conflits horaires éventuels.

## Vues nécessaires

### 1. Vue jour

Route possible :
`/app/agenda?view=day`

Structure :
- colonne verticale des heures ;
- événements affichés comme blocs ;
- possibilité de cliquer sur un bloc ;
- bouton pour confirmer présence.

Affichage :

```txt
Lundi 15 juillet

06:00 |
07:00 | [Prière personnelle]
08:00 |
09:00 | [Cours / travail]
...
18:00 | [Formation PCNC]
19:00 | [Temps EJP]
20:00 |
```

### 2. Vue semaine

Route possible :
`/app/agenda?view=week`

Structure :
- en haut : jours de la semaine ;
- à gauche : heures ;
- dans la grille : cartes d’événements.

Exemple :

```txt
        Lun      Mar      Mer      Jeu      Ven      Sam      Dim
06:00   ...      ...      ...      ...      ...      ...      ...
07:00   ...      ...      ...      ...      ...      ...      ...
18:00            PCNC              FIJ
19:00                              FIJ
15:00                                                        Culte
```

Cette vue est prioritaire.

### 3. Vue mois

Route :
`/app/agenda?view=month`

Utilité :
- voir les programmes du mois ;
- repérer les dimanches ;
- voir les formations ;
- voir les RDV ;
- voir les événements spéciaux.

### 4. Vue liste

Route :
`/app/agenda?view=list`

Utilité mobile :
- aujourd’hui ;
- demain ;
- cette semaine.

## Design de l’agenda

### Grille

- Fond blanc.
- Lignes très fines gris clair.
- Jours en haut.
- Heures à gauche.
- Événements sous forme de cartes arrondies.
- Couleurs sobres par type, jamais criardes.

Types de cartes :
- Culte : doré doux.
- Formation : bleu nuit très clair.
- Rendez-vous : vert doux.
- Service : violet très léger.
- Personnel : gris clair.
- Échéance : orange doux.
- Absence / indisponibilité : rouge très discret.

### Carte événement

Chaque carte contient :
- titre ;
- heure ;
- lieu, si utile ;
- statut présence ;
- icône discrète ;
- pastille de type.

Exemple :

> Culte EJP  
> Dimanche 15h00  
> Présence à confirmer

Boutons au clic :
- `Voir détails`
- `Confirmer présence`
- `Je serai absent`
- `Je serai en retard`
- `Ajouter à mon calendrier externe`, optionnel.

## Types d’événements

### Organisationnels

Créés par admin, bureau ou responsables :
- culte ;
- réunion ;
- formation ;
- événement jeunesse ;
- service ;
- événement spécial ;
- réunion pilotes ;
- réunion serviteurs.

### Personnels

Créés par le serviteur :
- temps de prière ;
- étude ;
- lecture ;
- rappel personnel ;
- objectif ;
- disponibilité ;
- indisponibilité.

### Responsabilités

Générés par les outils :
- CR FIJ du jeudi ;
- service accueil dimanche ;
- publication communication à préparer ;
- réunion coordination ;
- échéance formation.

## Statuts de présence

Pour chaque événement organisationnel qui requiert une présence :

- À confirmer
- Présent prévu
- Absent prévu
- Retard signalé
- Présence validée
- Absence justifiée
- Non renseigné
- Non concerné

## Interaction principale

Sur un événement :

1. Cliquer sur la carte.
2. Ouvrir un panneau latéral ou modal.
3. Afficher détails.
4. Proposer actions.

Actions :
- `Je serai présent`
- `Je serai absent`
- `Je serai en retard`
- `Modifier ma réponse`
- `Ajouter un motif`
- `Voir les participants`, uniquement si autorisé.

## Motifs d’absence

Options :
- Travail
- Études
- Santé
- Famille
- Déplacement
- Indisponibilité déjà signalée
- Autre

Le motif reste général.
Ne pas forcer le serviteur à donner des détails sensibles.

## Badgeage

Pour certains événements, l’application peut permettre :
- confirmer avant ;
- badger à l’arrivée ;
- valider après.

Boutons :
- `Je suis arrivé`
- `Je suis présent`
- `Je signale mon retard`

## Chevauchements

Si deux événements se superposent, afficher une alerte :

> Conflit horaire détecté.

Boutons :
- `Voir conflit`
- `Signaler indisponibilité`
- `Modifier événement personnel`

## Intégration avec la page Accueil STAR

L’accueil affiche une version compacte :
- prochain événement ;
- présence à confirmer ;
- vue mini semaine.

Le bouton `Voir mon agenda` ouvre `/app/agenda`.

## Données nécessaires

Entités :
- `CalendarEvent`
- `EventParticipant`
- `ServantAvailability`
- `AttendanceResponse`
- `AttendanceValidation`
- `PersonalCalendarBlock`

## Permissions

Le serviteur peut :
- voir ses événements ;
- créer ses blocs personnels ;
- répondre à ses présences ;
- justifier absence/retard.

Le référent/leader peut :
- voir les réponses des personnes dont il est responsable ;
- créer des événements pour son périmètre ;
- relancer les non-réponses.

Le bureau/admin peut :
- créer événements globaux ;
- voir statistiques globales ;
- gérer types d’événements.

## Critère de réussite

La vue semaine doit être suffisamment visuelle pour que l’utilisateur comprenne son rythme sans lire une longue liste.
