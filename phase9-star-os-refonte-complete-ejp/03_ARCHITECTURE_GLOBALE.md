# 03 — Architecture globale finale

## Navigation principale visible pour un serviteur simple

La navigation doit rester courte.

```txt
Accueil
Agenda
Présences
Formations
Croissance
Rendez-vous
Plus
```

Dans “Plus” :

```txt
Objectifs
Ressources
Parcours
Responsabilités
Mon espace
Profil
```

## Navigation pour un serviteur avec responsabilités

```txt
Accueil
Agenda
Présences
Formations
Croissance
Responsabilités
Rendez-vous
Plus
```

Dans “Responsabilités”, les outils apparaissent selon son profil :
- Pilote FIJ ;
- Coordination FIJ ;
- Accueil ;
- Communication ;
- Prodiges Musique ;
- Vie Académique ;
- Coordination générale.

## Navigation pour référent / leader / bureau

Ajouter :
```txt
Direction
Suivi
Organisation
```

## Navigation pour admin

Ajouter :
```txt
Administration
Paramètres
Contenus publics
Utilisateurs
Permissions
```

## Arborescence finale

```txt
/app
├── Accueil STAR
│
├── Agenda
│   ├── Vue jour
│   ├── Vue semaine
│   ├── Vue mois
│   ├── Événement
│   ├── Confirmation présence
│   └── Absence / retard
│
├── Présences
│   ├── À confirmer
│   ├── Historique
│   ├── Absences
│   ├── Retards
│   └── Statistiques personnelles
│
├── Formations
│   ├── Mes formations
│   ├── Module PCNC 001
│   ├── Module PCNC 101
│   ├── Module PCNC 201
│   ├── Module pilote FIJ
│   ├── Vidéo
│   ├── Résumé
│   └── Validation
│
├── Croissance
│   ├── Parole du jour
│   ├── Habitudes
│   ├── Notes privées
│   ├── Livres lus
│   ├── Livres recommandés
│   └── Bilan personnel
│
├── Objectifs
│   ├── Tous mes objectifs
│   ├── Nouvel objectif
│   ├── Objectif détaillé
│   ├── Étapes
│   └── Bilan
│
├── Rendez-vous
│   ├── Demander un RDV
│   ├── Mes demandes
│   ├── Mes RDV validés
│   ├── Disponibilités
│   └── Historique
│
├── Ressources
│   ├── Liens utiles
│   ├── Documents
│   ├── Livres
│   ├── T-shirts / boutique
│   ├── Paiements
│   └── Contacts utiles
│
├── Parcours
│   ├── Situation actuelle
│   ├── Études
│   ├── Travail
│   ├── Compétences
│   ├── Besoins
│   └── Disponibilités
│
├── Espace personnel
│   ├── Widgets
│   ├── Raccourcis
│   ├── Préférences
│   ├── Bannière
│   └── Personnalisation
│
├── Responsabilités
│   ├── Mes outils actifs
│   ├── FIJ pilote
│   ├── FIJ coordination
│   ├── Accueil
│   ├── Communication
│   ├── Musique
│   ├── Vie académique
│   └── Autres outils
│
├── Organisation
│   ├── Mes rattachements
│   ├── Mes équipes
│   ├── Mes référents
│   ├── Départements
│   └── Annuaire autorisé
│
├── Direction
│   ├── Vue globale
│   ├── Serviteurs
│   ├── Présences
│   ├── Formations
│   ├── Rendez-vous
│   ├── FIJ indicateurs
│   ├── Accueil indicateurs
│   ├── Alertes
│   └── Décisions
│
└── Administration
    ├── Utilisateurs
    ├── Rôles
    ├── Permissions
    ├── Formations
    ├── Événements
    ├── Ressources
    ├── Contenu public
    └── Paramètres
```

## Règle d’affichage

Une page peut exister techniquement, mais ne doit apparaître dans la navigation que si elle concerne l’utilisateur.

Exemples :
- un pilote FIJ voit “FIJ pilote” ;
- un simple serviteur ne voit pas “FIJ coordination” ;
- un leader voit “Direction” ;
- un admin voit “Administration” ;
- un étudiant voit davantage d’éléments dans “Parcours / Vie académique”.

## Boutons globaux obligatoires

Sur toutes les pages internes :

- Retour
- Accueil STAR
- Action principale
- Aide / Besoin d’accompagnement, si pertinent
- Sauvegarder, si formulaire
- Annuler, si formulaire
- Voir historique, si donnée temporelle
