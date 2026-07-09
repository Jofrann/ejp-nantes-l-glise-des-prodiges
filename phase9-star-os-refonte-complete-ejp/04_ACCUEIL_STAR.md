# 04 — Accueil STAR

## Route

`/app`

## Rôle

Page d’accueil personnelle après connexion.

Cette page doit remplacer tout tableau de bord centré sur les départements.

## Objectif

En moins de 5 secondes, le serviteur doit comprendre :
- ce qui l’attend aujourd’hui ;
- s’il doit confirmer une présence ;
- quelle formation continuer ;
- quel rendez-vous arrive ;
- quelle annonce est importante ;
- quelles responsabilités nécessitent une action.

## Structure visuelle recommandée

### 1. En-tête personnel

Contenu :
- Bonjour + prénom.
- Phrase personnalisée courte.
- Date du jour.
- Statut rapide : “Présence à confirmer”, “Formation en cours”, “Aucun retard”.

Exemple :

> Bonjour Jofran,  
> Voici ton espace STAR. Aujourd’hui, tu as 2 actions à traiter.

Boutons :
- `Personnaliser mon espace`
- `Voir mon agenda`
- `Déclarer une absence`

### 2. Bloc “À faire aujourd’hui”

Cartes courtes :
- Confirmer ma présence au programme.
- Continuer PCNC 101.
- Lire ma Parole du jour.
- Remplir le CR du jeudi, si pilote FIJ et si jeudi.
- Répondre à une demande de rendez-vous, si concerné.

Chaque carte doit avoir :
- titre ;
- urgence ;
- destination ;
- bouton d’action.

Boutons possibles :
- `Confirmer`
- `Continuer`
- `Remplir`
- `Voir`
- `Reporter`

### 3. Mini agenda

Afficher :
- aujourd’hui ;
- demain ;
- cette semaine.

Vue compacte mais visuelle.

Chaque événement affiche :
- heure ;
- titre ;
- statut ;
- bouton.

Boutons :
- `Voir la journée`
- `Confirmer ma présence`
- `Je serai absent`
- `Voir tous les événements`

### 4. Présence rapide

Carte :
- prochain culte ;
- prochain programme ;
- état de confirmation.

Boutons :
- `Je serai présent`
- `Je serai absent`
- `Je serai en retard`

### 5. Formations en cours

Afficher 1 à 3 formations prioritaires.

Exemple :
- PCNC 001 — 60 %
- PCNC 101 — résumé vidéo 2 à envoyer
- Formation pilote FIJ — module 1 à commencer

Boutons :
- `Continuer`
- `Voir mes formations`
- `Envoyer un résumé`

### 6. Croissance personnelle

Carte sobre :
- lecture de la Parole du jour ;
- livre en cours ;
- objectif prioritaire.

Boutons :
- `J’ai lu aujourd’hui`
- `Ajouter une note privée`
- `Voir ma croissance`

Ne pas exposer les notes privées.

### 7. Rendez-vous

Afficher :
- prochains rendez-vous ;
- demandes en attente ;
- bouton demande rapide.

Boutons :
- `Demander un rendez-vous`
- `Voir mes demandes`

### 8. Actualités et nouveautés

Contenu :
- annonces EJP ;
- programmes à venir ;
- nouveaux t-shirts ;
- nouvelles ressources ;
- nouvelles fonctionnalités.

Boutons :
- `Lire`
- `Voir les ressources`
- `Commander`
- `Participer`

### 9. Ressources rapides

Afficher :
- liens utiles ;
- documents importants ;
- support PCNC ;
- boutique ;
- formulaires.

Boutons :
- `Ouvrir`
- `Télécharger`
- `Voir tout`

### 10. Responsabilités actives

En bas de page seulement.

Exemple :
- Pilote FIJ ;
- Accueil ;
- Communication.

Boutons :
- `Ouvrir l’outil`
- `Voir mes responsabilités`

## Ce qu’il ne faut pas mettre en premier

Ne pas mettre :
- les départements ;
- les grandes statistiques de direction ;
- les tableaux administratifs ;
- toutes les missions ;
- les pages FIJ en bloc principal.

## Logique des données affichées

L’accueil agrège des données issues de :
- `AttendanceEvent`
- `ServantAttendance`
- `TrainingEnrollment`
- `TrainingSubmission`
- `PersonalGoal`
- `AppointmentRequest`
- `Announcement`
- `Resource`
- `ResponsibilityAssignment`

## États vides

Si aucune action :

> Ton espace est à jour. Tu peux consulter ton agenda, poursuivre ta croissance ou préparer ta semaine.

Si aucun agenda :

> Aucun événement personnel n’est prévu aujourd’hui.

Si aucune formation :

> Aucune formation n’est assignée pour le moment.

## Critère d’excellence

La page doit ressembler à un bureau personnel clair, pas à un back-office.

Priorité :
- lisible ;
- lumineux ;
- visuel ;
- humain ;
- rapide ;
- mobile-first.
