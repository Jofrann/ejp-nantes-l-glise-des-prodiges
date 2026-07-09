# PHASE 9 — STAR OS EJP Nantes — DOSSIER COMPLET

# 00 — Lire d’abord

## Verdict

L’application EJP ne doit plus être structurée d’abord autour des départements.

Cela crée une confusion :
- le serviteur cherche où aller ;
- les missions envahissent l’expérience ;
- les données personnelles, les présences, les formations et les responsabilités sont mélangées ;
- FIJ, Accueil, Communication ou Vie Académique deviennent des “mondes séparés” au lieu d’être des outils dans la vie du serviteur.

## Décision centrale

Refondre l’espace interne en **STAR OS**.

**STAR OS** est le poste de travail personnel du serviteur.

Après connexion, l’utilisateur arrive sur une page d’accueil personnelle appelée :

> Accueil STAR

Cette page n’est pas une page de départements.

Elle est construite autour de la personne :
- son agenda ;
- ses présences ;
- ses formations ;
- sa croissance ;
- ses objectifs ;
- ses rendez-vous ;
- ses ressources ;
- son parcours ;
- ses responsabilités actives.

## Principe d’ordre

Le serviteur ne commence pas par ce qu’il fait pour l’organisation.

Il commence par :
1. qui il est ;
2. où il en est ;
3. ce qu’il doit vivre aujourd’hui ;
4. ce qu’il doit déclarer ;
5. ce qu’il doit apprendre ;
6. ce qu’il doit demander ;
7. ce qu’il doit accomplir.

Ensuite seulement, l’application lui donne accès à ses outils de mission.

## À ne plus faire

Ne plus mettre les départements comme première grande entrée.

Ne plus faire de `/app/departements` la page centrale de travail.

Ne plus faire de FIJ une mini-application visible comme destination principale pour tous.

Ne plus mélanger :
- croissance personnelle ;
- présence organisationnelle ;
- formation ;
- rendez-vous pastoral ;
- responsabilité de service ;
- données de supervision.

## Ce qui doit devenir central

La route `/app` doit devenir :

> Accueil STAR

Elle doit fonctionner comme un bureau personnel.

Le serviteur y voit :
- son prénom ;
- ses actions du jour ;
- son agenda du jour et de la semaine ;
- ses présences à confirmer ;
- ses formations en cours ;
- ses objectifs prioritaires ;
- ses rendez-vous ;
- ses actualités EJP ;
- ses ressources rapides ;
- ses responsabilités actives en bas de page.

## Ordre d’exécution recommandé pour Base44

1. Créer la nouvelle navigation STAR OS.
2. Refaire `/app` comme Accueil STAR.
3. Créer Agenda visuel.
4. Créer Présences / badgeage.
5. Créer Formations.
6. Créer Croissance.
7. Créer Objectifs.
8. Créer Rendez-vous.
9. Créer Ressources.
10. Créer Parcours.
11. Créer Espace personnel personnalisable.
12. Déplacer les missions dans Responsabilités.
13. Réintégrer FIJ comme outil de responsabilité, pas comme architecture principale.
14. Refaire Direction/Admin pour la supervision.
15. Appliquer le design blanc premium.


---

# 01 — Vision STAR OS

## Définition

STAR OS signifie :

> Serviteur Travaillant Activement pour le Royaume — Operating System

Ce n’est pas seulement une application.
C’est un environnement de travail, de croissance, de suivi et de service.

L’image à retenir :

> Le serviteur arrive au travail, badge, ouvre son bureau, voit son agenda, ses tâches, ses formations, ses ressources, puis ses outils de responsabilité.

## Pourquoi ce changement est nécessaire

L’ancien modèle “département d’abord” enferme l’utilisateur dans une logique administrative.

Or, un serviteur n’est pas d’abord un département.

Un serviteur est :
- une personne ;
- un disciple ;
- un membre d’une communauté ;
- quelqu’un en croissance ;
- quelqu’un avec des présences ;
- quelqu’un avec des formations ;
- quelqu’un avec un parcours académique ou professionnel ;
- quelqu’un qui peut avoir besoin d’aide ;
- quelqu’un qui reçoit ensuite des responsabilités.

La plateforme doit donc accompagner la personne avant d’afficher ses missions.

## Les cinq niveaux de l’expérience STAR

### Niveau 1 — Ma journée

Ce que je dois faire aujourd’hui :
- confirmer une présence ;
- assister à un programme ;
- continuer une formation ;
- lire une ressource ;
- répondre à une demande ;
- remplir un CR si je suis concerné ;
- voir une actualité importante.

### Niveau 2 — Mon rythme

Mon agenda, mes cultes, mes programmes, mes temps de service, mes rendez-vous, mes échéances.

### Niveau 3 — Ma croissance

Lecture de la Parole, livres, notes, objectifs, habitudes, parcours de formation.

### Niveau 4 — Mon accompagnement

Rendez-vous, besoins, orientation, vie académique, soins pastoraux, référents.

### Niveau 5 — Mes responsabilités

Outils liés à ce qui m’a été confié :
- Pilote FIJ ;
- Coordination FIJ ;
- Accueil ;
- Communication ;
- Vie Académique ;
- Musique ;
- Coordination ;
- Bureau ;
- Admin.

## Phrase maîtresse

L’application ne commence pas par ce que le serviteur produit.

Elle commence par ce qu’il vit, organise, apprend et devient.

Puis elle lui donne les outils pour servir avec ordre et excellence.

## Bénéfices attendus

Pour le serviteur :
- une application plus personnelle ;
- une meilleure clarté ;
- un agenda centralisé ;
- un suivi de formation ;
- un espace de croissance ;
- une capacité à demander de l’aide ;
- un accès simple à ses responsabilités.

Pour les responsables :
- meilleure visibilité sur les présences ;
- meilleur suivi des formations ;
- moins de dispersion WhatsApp ;
- données fiables ;
- alertes utiles ;
- supervision sans intrusion.

Pour la Bergère et les leaders :
- vision globale ;
- données consolidées ;
- serviteurs mieux accompagnés ;
- responsabilités mieux suivies ;
- moins de dépendance à plusieurs applications externes.

## Ce que l’application ne doit pas devenir

Elle ne doit pas devenir :
- une plateforme de surveillance spirituelle ;
- un espace intrusif ;
- un outil froid et administratif ;
- une collection de pages sans logique ;
- une copie de l’ancienne application FIJ ;
- une app centrée sur les départements.

Elle doit être :
- personnelle ;
- claire ;
- belle ;
- utile ;
- fiable ;
- sécurisée ;
- évolutive.


---

# 02 — Suppressions et modifications à appliquer

## Objectif

Nettoyer l’ancienne architecture pour éviter deux applications en concurrence :
- une application départements ;
- une application STAR personnelle.

La nouvelle architecture doit être unifiée.

## À supprimer comme entrée principale

### 1. Tableau de bord centré sur les départements

Si `/app` affiche d’abord :
- cartes de départements ;
- accès FIJ ;
- accès Accueil ;
- accès Communication ;

alors il faut le remplacer.

`/app` doit devenir **Accueil STAR**.

Les départements peuvent encore exister, mais plus comme centre de l’expérience.

### 2. Page “Mes départements” comme page de travail

La page “Mes départements” ne doit plus être une page où le serviteur va travailler.

Elle peut devenir une page secondaire :
- “Mon organisation” ;
- “Mes rattachements” ;
- “Mes équipes” ;
- “Mes référents”.

Mais le travail réel doit être dans :
- `/app/responsabilites` ;
- ou directement dans les modules personnels.

### 3. Espace FIJ comme destination principale autonome

Ne pas mettre FIJ comme grosse page centrale pour tous.

FIJ doit apparaître seulement si l’utilisateur a une responsabilité FIJ :
- Pilote FIJ ;
- Coordination FIJ ;
- Admin FIJ ;
- Direction en lecture des indicateurs, mais dans `/app/direction`.

### 4. Direction FIJ séparée

Supprimer l’idée d’un espace “Direction FIJ” obligatoire.

Les bergers/leaders ne doivent pas aller dans un sous-espace FIJ pour voir les chiffres.

Les indicateurs FIJ remontent dans `/app/direction`.

## À déplacer

### Départements

Avant :
`/app/departements`

Après :
`/app/organisation/departements` ou `/app/responsabilites` selon le contexte.

Utilité :
- voir mes rattachements ;
- savoir qui est mon référent ;
- comprendre l’équipe ;
- consulter les standards ;
- mais pas comme bureau de travail principal.

### FIJ pilote

Avant :
`/app/departements/fij`

Après :
`/app/responsabilites/fij-pilote`

Ou raccourci depuis la page d’accueil si action à faire :
`/app/responsabilites/fij-pilote/cr-jeudi/nouveau`

### FIJ coordination

Avant :
`/app/departements/fij/coordination`

Après :
`/app/responsabilites/fij-coordination`

### Données de direction

Avant :
dispersées dans les pages métiers.

Après :
`/app/direction`

## À créer

Créer les routes personnelles suivantes :

- `/app/agenda`
- `/app/presences`
- `/app/formations`
- `/app/croissance`
- `/app/objectifs`
- `/app/rendez-vous`
- `/app/ressources`
- `/app/parcours`
- `/app/espace-personnel`
- `/app/responsabilites`
- `/app/organisation`
- `/app/direction`
- `/app/admin`

## À conserver

Conserver :
- l’authentification ;
- les rôles ;
- les données FIJ existantes ;
- le fonctionnement CR du jeudi ;
- la gestion des membres FIJ ;
- les présences ;
- les formations ;
- les permissions ;
- les profils utilisateurs.

Mais les replacer dans une architecture personnelle.

## Règle de migration

Tout ce qui est mission doit répondre à cette question :

> Est-ce une information personnelle du serviteur, une donnée organisationnelle, ou un outil de responsabilité ?

Selon la réponse :
- personnelle → module personnel ;
- organisationnelle → supervision / direction ;
- responsabilité → `/app/responsabilites`.


---

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


---

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


---

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


---

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


---

# 07 — Croissance personnelle

## Route

`/app/croissance`

## Objectif

Créer un espace personnel de croissance spirituelle, intellectuelle et disciplinaire.

Cette partie appartient d’abord au serviteur.
Elle ne doit pas devenir un outil de surveillance.

## Structure

```txt
Ma croissance
├── Aujourd’hui
├── Lecture de la Parole
├── Notes personnelles
├── Habitudes
├── Livres lus
├── Livres recommandés
├── Bilans
└── Partages volontaires
```

## Bloc “Aujourd’hui”

Afficher :
- “As-tu lu ta Parole aujourd’hui ?”
- livre ou plan en cours ;
- objectif spirituel prioritaire ;
- note rapide.

Boutons :
- `J’ai lu aujourd’hui`
- `Ajouter une note`
- `Voir mon historique`

## Lecture de la Parole

Champs :
- date ;
- passage lu ;
- statut ;
- note privée ;
- verset marquant, optionnel ;
- tags.

Boutons :
- `Ajouter une lecture`
- `Marquer comme lu`
- `Ajouter une méditation`
- `Voir calendrier de lecture`

## Notes personnelles

Confidentialité par défaut :
- privée.

Champs :
- titre ;
- contenu ;
- catégorie ;
- date ;
- visibilité.

Visibilités :
- privé ;
- partage volontaire avec un accompagnant ;
- partage volontaire avec un responsable choisi.

Boutons :
- `Créer une note`
- `Modifier`
- `Supprimer`
- `Partager volontairement`

## Habitudes

Exemples :
- lecture biblique ;
- prière ;
- lecture d’un livre ;
- sport ;
- discipline personnelle ;
- sommeil, optionnel ;
- étude.

Chaque habitude :
- nom ;
- fréquence ;
- rappel ;
- historique ;
- statut.

Boutons :
- `Créer une habitude`
- `Cocher aujourd’hui`
- `Voir progression`

## Livres lus

Champs :
- titre ;
- auteur ;
- catégorie ;
- date de début ;
- date de fin ;
- note personnelle ;
- recommandation ;
- visibilité.

Boutons :
- `Ajouter un livre`
- `Marquer terminé`
- `Recommander`
- `Voir bibliothèque`

## Livres recommandés

Le serviteur peut recommander un livre.
La recommandation peut être :
- privée ;
- visible aux autres serviteurs après validation ;
- visible dans Ressources.

Champs :
- titre ;
- auteur ;
- pourquoi je recommande ;
- public concerné ;
- lien, optionnel.

## Bilan personnel

Hebdomadaire ou mensuel.

Questions possibles :
- Qu’ai-je appris cette semaine ?
- Où ai-je été fidèle ?
- Qu’est-ce qui doit être remis en ordre ?
- Quelle décision je prends pour la semaine prochaine ?

Ces réponses sont privées par défaut.

## Ce qui peut remonter aux responsables

Uniquement :
- statistiques anonymisées ou consenties ;
- formations terminées ;
- objectifs partagés volontairement ;
- besoin d’accompagnement si l’utilisateur le demande.

Ne pas remonter :
- notes privées ;
- journal spirituel ;
- détails de prière ;
- confessions personnelles.

## Critère d’excellence

Le serviteur doit sentir que cet espace l’aide à grandir, pas qu’il est surveillé.


---

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


---

# 09 — Objectifs

## Route

`/app/objectifs`

## Objectif

Permettre au serviteur de clarifier, suivre et évaluer ses objectifs personnels, spirituels, académiques, professionnels et de service.

## Structure

```txt
Mes objectifs
├── Objectifs actifs
├── Objectifs à venir
├── Objectifs terminés
├── Objectifs partagés
└── Bilan
```

## Catégories

- Spirituel
- Discipline personnelle
- Formation
- Service
- Académique
- Professionnel
- Relationnel
- Santé / rythme, sans données médicales détaillées
- Autre

## Fiche objectif

Champs :
- titre ;
- catégorie ;
- pourquoi ;
- résultat attendu ;
- date cible ;
- étapes ;
- priorité ;
- visibilité ;
- statut.

Statuts :
- idée ;
- actif ;
- en pause ;
- terminé ;
- abandonné ;
- à revoir.

Visibilité :
- privé ;
- visible par un leader choisi ;
- visible par Vie Académique ;
- visible par référent ;
- visible par Bergère, si volontaire.

## Boutons

- `Créer un objectif`
- `Ajouter une étape`
- `Faire un point`
- `Marquer terminé`
- `Mettre en pause`
- `Partager volontairement`
- `Demander accompagnement`

## Bilan d’objectif

Questions :
- Qu’est-ce qui a avancé ?
- Qu’est-ce qui bloque ?
- Quelle décision dois-je prendre ?
- De quelle aide ai-je besoin ?

## Intégration avec agenda

Un objectif peut générer :
- rappel ;
- échéance ;
- bloc de travail personnel ;
- point hebdomadaire.

## Intégration avec rendez-vous

Depuis un objectif :
- demander un rendez-vous ;
- partager avec accompagnant.

## Critère d’excellence

Cette page doit transformer les intentions en trajectoires.


---

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


---

# 11 — Ressources et vie pratique

## Route

`/app/ressources`

## Objectif

Créer un espace où le serviteur trouve ce dont il a besoin pour vivre la vie EJP sans chercher partout.

## Sections

```txt
Ressources
├── Liens utiles
├── Documents
├── Formations
├── Livres
├── Boutique / t-shirts
├── Paiements
├── Formulaires
├── Contacts utiles
└── Nouveautés
```

## Liens utiles

Exemples :
- liens PCNC ;
- formulaires de service ;
- chaînes vidéo ;
- groupes officiels ;
- liens de paiement ;
- inscriptions événements.

Boutons :
- `Ouvrir`
- `Copier le lien`
- `Ajouter à mes favoris`

## Documents

Types :
- procédures ;
- fiches pratiques ;
- chartes ;
- supports de formation ;
- documents FIJ ;
- documents accueil ;
- documents communication.

Visibilité selon rôle.

Boutons :
- `Télécharger`
- `Lire`
- `Voir détails`

## Livres

Contenu :
- livres recommandés par EJP ;
- livres recommandés par serviteurs, après validation ;
- catégories ;
- notes.

Boutons :
- `Voir livre`
- `Recommander un livre`
- `Ajouter à ma liste`

## Boutique / t-shirts

Exemples :
- t-shirts EJP ;
- sweats ;
- supports ;
- articles événementiels.

Boutons :
- `Voir`
- `Commander`
- `Payer`
- `Suivre ma commande`

## Paiements

À prévoir seulement si techniquement disponible :
- paiement t-shirt ;
- participation événement ;
- don spécifique, si validé par responsables.

Ne pas mélanger les paiements avec la dîme/offrande sans cadrage pastoral et administratif clair.

## Contacts utiles

- accueil ;
- vie académique ;
- coordination FIJ ;
- communication ;
- soins pastoraux ;
- admin plateforme.

## Nouveautés

Afficher :
- nouvelle ressource ;
- nouveau t-shirt ;
- nouveau formulaire ;
- nouvelle fonctionnalité.

## Données

Entités :
- `Resource`
- `ResourceCategory`
- `ResourceFavorite`
- `Product`
- `Order`
- `PaymentIntent`
- `UsefulLink`
- `ContactDirectory`

## Critère d’excellence

Cette page doit donner l’impression d’un espace de repos pratique : tout ce qui est utile est au même endroit.


---

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


---

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


---

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


---

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


---

# 16 — Direction, administration et supervision

## Objectif

Permettre aux Bergers, leaders, bureau et responsables autorisés de voir les données utiles sans devoir entrer dans chaque outil.

## Route direction

`/app/direction`

## Principe

La direction ne travaille pas dans les espaces personnels des serviteurs.

Elle voit des indicateurs consolidés et des listes d’action.

## Vue globale direction

Sections :
- Serviteurs ;
- Présences ;
- Formations ;
- Rendez-vous ;
- FIJ ;
- Accueil ;
- Vie académique ;
- Alertes ;
- Décisions.

## Indicateurs serviteurs

- nombre total de serviteurs actifs ;
- nouveaux serviteurs ;
- serviteurs en attente de validation ;
- serviteurs par responsabilité ;
- serviteurs par disponibilité ;
- serviteurs en formation.

## Présences

- présences aux cultes ;
- absences ;
- retards ;
- motifs généraux ;
- non-réponses ;
- tendances par semaine ;
- tendances par événement.

## Formations

- modules en cours ;
- modules terminés ;
- résumés à valider ;
- formations en retard ;
- progression PCNC 001 / 101 / 201 ;
- progression formation pilote FIJ.

## Rendez-vous

- demandes en attente ;
- demandes urgentes ;
- demandes par type ;
- rendez-vous planifiés ;
- demandes transférées.

Respect strict de confidentialité.

## FIJ indicateurs

- FI actives ;
- FI en pause ;
- membres FIJ ;
- pilotes ;
- CR du jeudi reçus ;
- CR manquants ;
- visiteurs ;
- assiduité globale ;
- alertes FIJ.

## Accueil indicateurs

- présence du dimanche ;
- serviteurs accueil présents ;
- visiteurs ;
- nouveaux ;
- besoins signalés ;
- fiches accueil.

## Vie académique

- étudiants ;
- alternants ;
- travailleurs ;
- personnes en recherche de stage ;
- demandes accompagnement ;
- besoins prioritaires.

## Alertes

Types :
- absence récurrente ;
- formation bloquée ;
- CR manquant ;
- rendez-vous urgent ;
- demande non traitée ;
- FI en pause ;
- besoin d’accompagnement.

## Administration

Route :
`/app/admin`

Admin gère :
- utilisateurs ;
- rôles ;
- permissions ;
- formations ;
- événements ;
- ressources ;
- annonces ;
- contenus publics ;
- paramètres.

## Différence direction / admin

Direction :
- voit ;
- analyse ;
- décide ;
- valide selon rôle.

Admin :
- configure ;
- crée ;
- modifie ;
- gère technique.

## Critère d’excellence

La direction doit recevoir la bonne information sans envahir l’espace personnel du serviteur.


---

# 17 — Modèle de données

## Objectif

Créer un modèle de données cohérent avec STAR OS.

Les entités doivent séparer :
- identité ;
- agenda ;
- présences ;
- croissance ;
- formations ;
- objectifs ;
- rendez-vous ;
- ressources ;
- parcours ;
- responsabilités ;
- outils métiers ;
- supervision.

## Utilisateurs

### `users`

- id
- first_name
- last_name
- email
- phone
- avatar_url
- banner_url
- account_status
- created_at
- updated_at

### `roles`

- id
- name
- label

Rôles possibles :
- servant
- referent
- leader
- bureau
- bergere
- admin
- fij_pilot
- fij_coordination
- accueil_servant
- communication_servant
- academic_support

### `user_roles`

- id
- user_id
- role_id
- scope_type
- scope_id
- created_at

## Agenda

### `calendar_events`

- id
- title
- description
- event_type
- start_at
- end_at
- location
- visibility_scope
- created_by
- requires_attendance
- created_at
- updated_at

### `event_participants`

- id
- event_id
- user_id
- status
- response_status
- created_at
- updated_at

### `personal_calendar_blocks`

- id
- user_id
- title
- block_type
- start_at
- end_at
- visibility
- created_at
- updated_at

## Présences

### `attendance_responses`

- id
- event_id
- user_id
- status
- reason_category
- comment
- responded_at
- updated_at

Status :
- present_planned
- absent_planned
- late_planned
- present_validated
- absent_justified
- no_response

### `attendance_checkins`

- id
- event_id
- user_id
- checked_in_at
- method
- validated_by
- created_at

## Formations

### `training_programs`

- id
- title
- description
- category
- is_active
- created_at

### `training_modules`

- id
- program_id
- title
- description
- order_index
- video_url
- document_url
- requires_summary
- created_at

### `training_enrollments`

- id
- user_id
- program_id
- status
- progress_percent
- assigned_by
- assigned_at
- completed_at

### `training_summaries`

- id
- user_id
- module_id
- content
- status
- submitted_at
- reviewed_by
- reviewed_at
- review_comment

## Croissance

### `scripture_reading_logs`

- id
- user_id
- date
- passage
- status
- private_note
- created_at

### `personal_notes`

- id
- user_id
- title
- content
- category
- visibility
- shared_with_user_id
- created_at
- updated_at

### `book_logs`

- id
- user_id
- title
- author
- category
- status
- started_at
- finished_at
- personal_note
- recommendation_status

## Objectifs

### `personal_goals`

- id
- user_id
- title
- category
- why
- expected_result
- target_date
- priority
- status
- visibility
- created_at
- updated_at

### `goal_steps`

- id
- goal_id
- title
- due_date
- status
- completed_at

## Rendez-vous

### `appointment_requests`

- id
- requester_id
- request_type
- requested_person_id
- subject
- urgency
- message
- status
- created_at
- updated_at

### `appointment_slots`

- id
- appointment_request_id
- proposed_start_at
- proposed_end_at
- status
- created_by

## Ressources

### `resources`

- id
- title
- description
- category
- resource_type
- url
- file_url
- visibility_scope
- created_by
- is_active
- created_at

### `resource_favorites`

- id
- user_id
- resource_id
- created_at

### `products`

- id
- title
- description
- price
- image_url
- status
- created_at

### `orders`

- id
- user_id
- product_id
- quantity
- status
- payment_status
- created_at

## Parcours

### `servant_journeys`

- id
- user_id
- current_status
- city
- summary
- updated_at

### `education_profiles`

- id
- user_id
- school
- program
- level
- year
- needs_internship
- internship_period
- support_needed
- updated_at

### `work_profiles`

- id
- user_id
- field
- job_title
- schedule_type
- constraints
- updated_at

### `skills`

- id
- user_id
- name
- level
- willing_to_serve_with
- visibility

## Espace personnel

### `user_workspace_preferences`

- id
- user_id
- layout_config
- default_agenda_view
- notification_preferences
- updated_at

### `user_widgets`

- id
- user_id
- widget_type
- position
- is_visible
- config

### `user_shortcuts`

- id
- user_id
- title
- target_url
- icon
- position

## Responsabilités

### `responsibility_assignments`

- id
- user_id
- responsibility_type
- scope_type
- scope_id
- status
- assigned_by
- assigned_at

Types :
- fij_pilot
- fij_coordination
- accueil
- communication
- music
- academic
- coordination
- bureau
- admin

## FIJ

### `fij_groups`

- id
- name
- status
- meeting_day
- meeting_time
- location_label
- pilot_user_id
- copilot_user_id
- created_at
- updated_at

### `fij_members`

- id
- fij_group_id
- first_name
- last_name
- phone
- status
- joined_at
- created_at

### `fij_thursday_reports`

- id
- fij_group_id
- report_date
- submitted_by
- status
- general_comment
- submitted_at
- created_at

### `fij_attendance_lines`

- id
- report_id
- fij_member_id
- status
- comment

### `fij_visitors`

- id
- report_id
- first_name
- last_name
- contact
- comment

### `fij_member_notes`

- id
- fij_member_id
- created_by
- note_type
- content
- visibility_level
- created_at

## Supervision

### `alerts`

- id
- alert_type
- severity
- scope_type
- scope_id
- title
- description
- status
- created_at
- resolved_at

### `announcements`

- id
- title
- content
- audience_scope
- published_at
- expires_at
- created_by

## Règle

Chaque donnée doit avoir :
- un propriétaire ;
- une visibilité ;
- un périmètre ;
- un niveau de confidentialité ;
- des permissions CRUD.


---

# 18 — Permissions et confidentialité

## Objectif

Préserver l’ordre sans transformer la plateforme en outil intrusif.

## Trois niveaux de données

### Niveau 1 — Privé personnel

Visible uniquement par le serviteur.

Exemples :
- notes personnelles ;
- journal spirituel ;
- notes de lecture privées ;
- objectifs privés ;
- widgets ;
- préférences ;
- blocs personnels privés dans l’agenda.

CRUD :
- utilisateur uniquement.

### Niveau 2 — Partage volontaire

Visible selon choix explicite du serviteur.

Exemples :
- objectif partagé ;
- note partagée avec accompagnant ;
- demande de rendez-vous ;
- livre recommandé ;
- besoin d’accompagnement.

CRUD :
- utilisateur crée ;
- destinataire lit ;
- destinataire peut commenter selon contexte.

### Niveau 3 — Organisationnel

Visible par responsables autorisés.

Exemples :
- présence ;
- absence ;
- retard ;
- formation assignée ;
- formation validée ;
- responsabilité active ;
- CR FIJ ;
- planning de service.

CRUD :
- utilisateur répond ou soumet ;
- responsables valident ;
- admin configure.

## Règles par module

### Agenda

Serviteur :
- voit ses événements ;
- crée événements personnels ;
- répond aux présences.

Responsable :
- crée événements pour son périmètre ;
- voit réponses de son périmètre.

Admin :
- gère événements globaux.

### Présences

Serviteur :
- confirme ;
- justifie ;
- signale retard.

Référent/leader :
- voit les réponses de son périmètre ;
- relance ;
- valide.

Bergère/bureau :
- voit statistiques globales.

### Croissance

Serviteur :
- CRUD complet sur ses données privées.

Responsable :
- ne voit rien sauf partage volontaire.

### Formations

Serviteur :
- suit ;
- soumet résumé.

Formateur/responsable :
- valide ;
- commente ;
- demande correction.

Admin :
- crée modules et parcours.

### Rendez-vous

Serviteur :
- crée demande ;
- voit ses demandes ;
- annule si non validé.

Destinataire :
- voit demandes qui lui sont adressées ;
- répond ;
- propose créneau.

Admin :
- peut configurer types, mais ne doit pas exposer le contenu pastoral dans des vues ordinaires.

### Ressources

Serviteur :
- lit ;
- télécharge ;
- favorise ;
- recommande un livre.

Responsable/admin :
- publie ;
- valide ;
- archive.

### Parcours

Serviteur :
- remplit ;
- modifie.

Vie académique / responsable autorisé :
- voit données utiles si périmètre ou partage.

### Responsabilités

Serviteur :
- voit ses responsabilités ;
- utilise ses outils.

Responsable :
- gère son périmètre.

Admin :
- attribue / retire selon validation.

## FIJ

Pilote :
- voit ses FI ;
- gère membres de ses FI selon permission ;
- remplit CR du jeudi ;
- ajoute notes de suivi ;
- signale besoin.

Coordination FIJ :
- voit toutes les FI ;
- voit tous les CR ;
- relance ;
- gère pilotes ;
- gère ouvertures ;
- gère consécrations ;
- produit reporting.

Direction :
- voit indicateurs consolidés ;
- ne modifie pas l’opérationnel sauf rôle spécifique.

Admin :
- configure.

## Règle anti-fuite

Un utilisateur ne doit jamais pouvoir :
- voir les données d’un autre département sans rôle ;
- modifier une donnée hors périmètre ;
- supprimer une donnée sensible hors autorisation ;
- voir notes privées ;
- accéder aux demandes pastorales d’autrui.

## Affichage conditionnel

Ne pas seulement cacher les boutons côté interface.
Il faut aussi protéger les données côté requête et côté permission.

## Boutons selon permission

Si l’utilisateur n’a pas permission :
- ne pas afficher le bouton ;
- ne pas laisser l’URL fonctionner ;
- afficher une page “accès non autorisé” si tentative directe.

## Page accès refusé

Message :

> Cette page ne fait pas partie de ton périmètre actuel. Si tu penses qu’il s’agit d’une erreur, contacte un responsable.

Bouton :
- `Retour à mon espace STAR`


---

# 19 — Design system blanc premium

## Verdict design

L’espace interne ne doit pas être noir.

Il doit être :
- blanc ;
- lumineux ;
- professionnel ;
- calme ;
- premium ;
- structuré ;
- chaleureux ;
- mobile-first.

## Ambiance

Le design doit évoquer :
- un bureau personnel ;
- une plateforme professionnelle ;
- une maison bien ordonnée ;
- une application moderne de travail ;
- une expérience claire et douce.

## Palette

### Couleurs principales

- Blanc principal : `#FFFFFF`
- Blanc cassé : `#F8F6F2`
- Fond doux : `#F5F2EC`
- Texte principal : `#1C1C1C`
- Texte secondaire : `#6F6F6F`
- Ligne / bordure : `#E7E2D8`
- Doré discret : `#C8A96A`
- Bleu nuit : `#1B2A41`

### États

- Succès doux : `#E8F5EE`
- Succès texte : `#247A4D`
- Attention douce : `#FFF4D8`
- Attention texte : `#8A5A00`
- Erreur douce : `#FDECEC`
- Erreur texte : `#B42318`
- Info douce : `#EEF4FF`
- Info texte : `#1D4ED8`

## Typographie

Titres :
- Cormorant Garamond, ou Playfair Display si disponible.

Texte :
- Inter, Manrope ou Satoshi.

Recommandation :
- Titres : Cormorant Garamond.
- Interface : Inter.

## Boutons

### Bouton principal

Style :
- fond bleu nuit ou doré selon contexte ;
- texte blanc ;
- arrondi 12px ;
- hauteur 44px minimum ;
- padding généreux ;
- ombre très douce.

Exemples :
- `Confirmer ma présence`
- `Continuer ma formation`
- `Demander un rendez-vous`

### Bouton secondaire

Style :
- fond blanc ;
- bordure gris clair ;
- texte bleu nuit.

### Bouton discret

Style :
- texte seul ;
- icône ;
- hover clair.

### Bouton danger

Style :
- fond rouge doux ;
- texte rouge ;
- jamais agressif.

## Cartes

Style :
- fond blanc ;
- bordure `#E7E2D8` ;
- arrondi 18px ;
- ombre douce ;
- padding 20px ;
- espace respirant.

## Agenda visuel

- grille blanche ;
- lignes gris clair ;
- heures à gauche ;
- jours en haut ;
- cartes d’événements arrondies ;
- couleurs pastel sobres ;
- jamais saturées.

## Sidebar / navigation

Desktop :
- sidebar gauche claire ;
- logo en haut ;
- navigation courte ;
- icônes fines ;
- item actif avec fond blanc cassé et bord gauche doré.

Mobile :
- barre bas ou menu compact ;
- accès rapide à Accueil, Agenda, Présences, Formations, Plus.

## Page accueil

Doit ressembler à un tableau de bord personnel premium :
- grand bonjour ;
- cartes courtes ;
- agenda compact ;
- actions prioritaires ;
- actualités ;
- ressources.

## Formulaires

- labels clairs ;
- champs larges ;
- messages d’aide ;
- erreurs lisibles ;
- sauvegarde brouillon si possible.

## Niveau de finition attendu

Interdit :
- gros aplats noirs ;
- boutons criards ;
- cartes trop colorées ;
- polices enfantines ;
- icônes incohérentes ;
- pages surchargées ;
- longues listes sans hiérarchie.

Attendu :
- ordre ;
- respiration ;
- élégance ;
- précision ;
- cohérence ;
- lisibilité.

## Référence mentale

L’espace interne doit être plus proche de :
- Notion ;
- Linear ;
- Apple Calendar ;
- Google Calendar ;
- Slack moderne ;
- un portail RH premium ;

que d’un site événementiel sombre.


---

# 20 — Prompt Base44 Master

Copier-coller ce prompt dans Base44 si une refonte globale est possible.

---

Refonds l’application interne EJP Nantes autour d’un concept appelé **STAR OS**.

STAR signifie : **Serviteur Travaillant Activement pour le Royaume**.

La logique actuelle est encore trop centrée sur les départements. Il faut la remplacer par une architecture centrée sur l’espace personnel du serviteur.

## Objectif central

Après connexion, l’utilisateur doit arriver sur `/app`, une page appelée **Accueil STAR**.

Cette page ne doit pas afficher d’abord les départements.

Elle doit afficher :
- Bonjour + prénom ;
- actions du jour ;
- agenda personnel ;
- présences à confirmer ;
- formations en cours ;
- croissance personnelle ;
- objectifs prioritaires ;
- rendez-vous à venir ;
- actualités EJP ;
- ressources rapides ;
- responsabilités actives en bas de page.

## Routes à créer ou refondre

Créer/refondre les routes suivantes :

- `/app` : Accueil STAR
- `/app/agenda` : agenda visuel
- `/app/presences` : présences, absences, retards, badgeage
- `/app/formations` : formations assignées, PCNC, modules, résumés
- `/app/croissance` : Parole, livres, notes privées, habitudes
- `/app/objectifs` : objectifs personnels, spirituels, académiques, service
- `/app/rendez-vous` : demandes de rendez-vous
- `/app/ressources` : liens utiles, documents, livres, t-shirts, boutique, paiements
- `/app/parcours` : situation étudiant/travailleur/alternant/stage
- `/app/espace-personnel` : personnalisation du bureau STAR
- `/app/responsabilites` : outils de mission attribués selon rôle
- `/app/organisation` : rattachements, équipes, référents, départements en lecture secondaire
- `/app/direction` : supervision leaders/Bergère/bureau
- `/app/admin` : administration

## Architecture à ne plus utiliser comme centre

Ne plus faire de `/app/departements` ou des départements l’entrée principale de l’espace serviteur.

Les départements peuvent rester comme rattachements organisationnels, mais pas comme bureau de travail principal.

## Agenda visuel

Créer un agenda visuel proche des applications Calendrier iPhone / Google Calendar.

Il doit contenir :
- vue jour ;
- vue semaine ;
- vue mois ;
- vue liste ;
- ligne des jours en haut ;
- heures sur le côté ;
- blocs visuels d’événements ;
- détection de chevauchements ;
- cartes cliquables ;
- confirmation de présence ;
- absence ;
- retard ;
- motifs.

Les événements peuvent être :
- cultes ;
- programmes ;
- réunions ;
- formations ;
- rendez-vous ;
- services ;
- blocs personnels.

## Présences

Créer un module `/app/presences` où le serviteur peut :
- confirmer présence ;
- déclarer absence ;
- signaler retard ;
- ajouter motif général ;
- voir historique ;
- voir statistiques personnelles.

Motifs :
- Travail ;
- Études ;
- Santé ;
- Famille ;
- Déplacement ;
- Service ailleurs ;
- Autre.

## Formations

Créer `/app/formations`.

Prévoir :
- PCNC 001 ;
- PCNC 101 ;
- PCNC 201 ;
- formation serviteur ;
- formation pilote FIJ ;
- autres modules selon rôle.

Chaque formation contient :
- vidéos ;
- documents ;
- résumé à rédiger ;
- brouillon ;
- envoi ;
- validation ;
- commentaire du formateur ;
- progression.

## Croissance

Créer `/app/croissance`.

Contenu :
- lecture de la Parole ;
- notes privées ;
- habitudes ;
- livres lus ;
- livres recommandés ;
- bilans personnels.

Important :
Les notes privées et journaux personnels ne doivent pas être visibles par les responsables.

## Objectifs

Créer `/app/objectifs`.

Objectifs avec :
- titre ;
- catégorie ;
- pourquoi ;
- résultat attendu ;
- étapes ;
- date cible ;
- statut ;
- visibilité.

Visibilités :
- privé ;
- partagé volontairement ;
- visible par référent ;
- visible par Vie Académique ;
- visible par leader choisi.

## Rendez-vous

Créer `/app/rendez-vous`.

Le serviteur peut demander un rendez-vous avec :
- Bergère ;
- leader ;
- soins pastoraux ;
- Vie Académique ;
- référent ;
- responsable de service.

Respecter la confidentialité.

## Ressources

Créer `/app/ressources`.

Inclure :
- liens utiles ;
- documents ;
- livres ;
- t-shirts ;
- boutique ;
- paiements ;
- formulaires ;
- contacts utiles ;
- nouveautés.

## Parcours

Créer `/app/parcours`.

Le serviteur renseigne :
- étudiant ;
- alternant ;
- travailleur ;
- recherche stage ;
- recherche emploi ;
- compétences ;
- disponibilités ;
- besoins d’accompagnement.

## Espace personnel

Créer `/app/espace-personnel`.

Le serviteur peut personnaliser :
- widgets ;
- raccourcis ;
- photo ;
- bannière ;
- verset personnel ;
- préférences ;
- vue agenda par défaut.

## Responsabilités

Créer `/app/responsabilites`.

Les outils de mission apparaissent ici selon les permissions :
- FIJ pilote ;
- FIJ coordination ;
- Accueil ;
- Communication ;
- Musique ;
- Vie Académique ;
- Coordination ;
- Bureau ;
- Admin.

Ces outils ne doivent pas apparaître comme centre de l’application, mais comme applications de travail disponibles selon le rôle.

## FIJ

Intégrer FIJ dans responsabilités.

Routes :
- `/app/responsabilites/fij-pilote`
- `/app/responsabilites/fij-coordination`

Pilote FIJ voit :
- sa FIJ ;
- membres ;
- CR du jeudi ;
- assiduité ;
- notes de suivi ;
- visiteurs ;
- communications ;
- documents.

Coordination FIJ voit :
- toutes les FIJ ;
- CR du jeudi ;
- CR manquants ;
- relances ;
- pilotes ;
- membres ;
- visiteurs ;
- ouvertures ;
- consécrations ;
- FIJ en pause ;
- reporting ;
- documents ;
- alertes.

Le CR du jeudi doit rester simple :
- date du jeudi ;
- liste des membres ;
- présent / absent / retard / excusé ;
- visiteurs ;
- commentaire général optionnel ;
- besoin à signaler.

Ne pas ajouter pour le moment :
- état émotionnel ;
- état financier ;
- radar de santé ;
- informations intrusives.

## Direction

Créer/refondre `/app/direction`.

Les leaders/Bergère/bureau y voient :
- nombre de serviteurs ;
- présences ;
- absences ;
- formations ;
- rendez-vous ;
- FIJ actives ;
- membres FIJ ;
- pilotes ;
- CR reçus ;
- CR manquants ;
- visiteurs ;
- alertes ;
- décisions.

Ils ne doivent pas être obligés d’entrer dans l’espace FIJ.

## Permissions

Séparer les données en trois niveaux :
1. privées personnelles ;
2. partageables volontairement ;
3. organisationnelles.

Ne jamais afficher :
- notes privées ;
- journal spirituel ;
- objectifs privés ;
- demandes pastorales d’autrui ;
- données d’un autre périmètre.

Le CRUD doit dépendre du rôle et du périmètre.

## Design

Refaire l’espace interne en blanc premium.

Style :
- fond blanc ;
- blanc cassé ;
- doré discret ;
- bleu nuit ;
- cartes propres ;
- typographie professionnelle ;
- boutons modernes ;
- agenda visuel ;
- beaucoup d’espace ;
- mobile-first.

Ne plus utiliser de design noir pour l’espace interne.

## Test final

Après connexion, un serviteur doit comprendre en moins de 5 secondes :
- ce qu’il doit faire aujourd’hui ;
- comment confirmer sa présence ;
- où est son agenda ;
- où continuer sa formation ;
- où demander un rendez-vous ;
- où trouver ses ressources ;
- où ouvrir ses responsabilités.


---

# 21 — Prompts Base44 par étapes

Cette méthode est recommandée si Base44 a tendance à mal appliquer les gros prompts.

## Étape 1 — Recentrer l’application

```txt
Refonds la navigation interne autour de STAR OS : Serviteur Travaillant Activement pour le Royaume.

La route /app doit devenir Accueil STAR, une page personnelle pour le serviteur.

Ne mets plus les départements comme entrée principale.

Crée la navigation :
Accueil, Agenda, Présences, Formations, Croissance, Rendez-vous, Plus.
Dans Plus : Objectifs, Ressources, Parcours, Responsabilités, Espace personnel, Profil.

Les responsabilités et outils de mission apparaissent selon le rôle dans /app/responsabilites.
```

## Étape 2 — Accueil STAR

```txt
Refais /app comme Accueil STAR.

La page doit afficher :
- Bonjour + prénom ;
- actions du jour ;
- mini agenda ;
- présences à confirmer ;
- formations en cours ;
- croissance personnelle ;
- rendez-vous ;
- actualités EJP ;
- ressources rapides ;
- responsabilités actives en bas.

Ne pas afficher les départements comme premier contenu.
```

## Étape 3 — Agenda visuel

```txt
Crée /app/agenda comme agenda visuel type Calendrier iPhone/Google Calendar.

Prévoir vue jour, semaine, mois, liste.
En vue semaine : jours en haut, heures à gauche, blocs d’événements dans la grille.

Chaque événement peut permettre :
- voir détails ;
- confirmer présence ;
- déclarer absence ;
- signaler retard ;
- ajouter motif.

Types : culte, programme, réunion, formation, rendez-vous, service, bloc personnel.
```

## Étape 4 — Présences

```txt
Crée /app/presences.

Le serviteur doit pouvoir :
- voir les présences à confirmer ;
- confirmer présence ;
- déclarer absence ;
- signaler retard ;
- choisir un motif général ;
- voir historique ;
- voir statistiques personnelles.

Les responsables autorisés voient les présences de leur périmètre.
```

## Étape 5 — Formations

```txt
Crée /app/formations.

Prévoir PCNC 001, PCNC 101, PCNC 201, formation serviteur, formation pilote FIJ et modules selon rôle.

Chaque formation contient modules, vidéos, documents, résumés, brouillons, soumission, validation et progression.
```

## Étape 6 — Croissance

```txt
Crée /app/croissance.

Inclure lecture de la Parole, notes privées, habitudes, livres lus, livres recommandés, bilans.

Les notes privées, journaux et objectifs privés ne doivent pas être visibles par les responsables.
```

## Étape 7 — Objectifs / RDV / Ressources / Parcours

```txt
Crée les pages :
- /app/objectifs
- /app/rendez-vous
- /app/ressources
- /app/parcours

Objectifs : objectifs personnels avec étapes et visibilité.
Rendez-vous : demande auprès Bergère, leaders, soins pastoraux, Vie Académique, référent.
Ressources : liens, documents, livres, t-shirts, paiements, formulaires.
Parcours : étudiant, alternant, travailleur, recherche stage, compétences, disponibilités.
```

## Étape 8 — Espace personnel

```txt
Crée /app/espace-personnel.

Permets de personnaliser widgets, raccourcis, photo, bannière, préférences, vue agenda par défaut.

Les widgets incluent : agenda, présence, formation, objectif, lecture, rendez-vous, ressources, responsabilités.
```

## Étape 9 — Responsabilités et FIJ

```txt
Crée /app/responsabilites.

Les outils de mission apparaissent selon le profil :
- fij-pilote
- fij-coordination
- accueil
- communication
- musique
- vie-academique
- coordination

Pour FIJ :
- /app/responsabilites/fij-pilote
- /app/responsabilites/fij-coordination

Le pilote voit sa FIJ, membres, CR du jeudi, assiduité, notes de suivi.
La coordination voit toutes les FIJ, CR, relances, pilotes, membres, ouvertures, consécrations, FIJ en pause, reporting.
```

## Étape 10 — Direction / Admin / Design

```txt
Refais /app/direction pour les leaders/Bergère/bureau.

Ils doivent voir les indicateurs globaux : serviteurs, présences, formations, rendez-vous, FIJ, accueil, alertes.

Refais le design interne en blanc premium : fond blanc, blanc cassé, doré discret, bleu nuit, cartes propres, typographie professionnelle, boutons modernes.

Ne plus utiliser de design noir pour l’espace interne.
```


---

# 22 — Checklist de recette

## Test global

Après connexion, l’utilisateur arrive sur `/app`.

La page `/app` doit être Accueil STAR, pas un tableau de départements.

## Accueil STAR

- [ ] Le prénom de l’utilisateur s’affiche.
- [ ] Les actions du jour s’affichent.
- [ ] Le mini agenda s’affiche.
- [ ] Les présences à confirmer s’affichent.
- [ ] Les formations en cours s’affichent.
- [ ] Les rendez-vous s’affichent.
- [ ] Les actualités EJP s’affichent.
- [ ] Les ressources rapides s’affichent.
- [ ] Les responsabilités sont en bas, pas en premier.
- [ ] Aucun département n’est l’entrée principale.

## Agenda

- [ ] Vue jour disponible.
- [ ] Vue semaine disponible.
- [ ] Vue mois disponible.
- [ ] Vue liste disponible.
- [ ] Les jours sont visibles en haut en vue semaine.
- [ ] Les heures sont visibles sur le côté.
- [ ] Les événements apparaissent comme cartes dans une grille.
- [ ] Un événement permet de confirmer présence.
- [ ] Un événement permet de signaler absence.
- [ ] Un événement permet de signaler retard.
- [ ] Les chevauchements sont visibles.

## Présences

- [ ] Le serviteur peut confirmer sa présence.
- [ ] Le serviteur peut déclarer une absence.
- [ ] Le serviteur peut signaler un retard.
- [ ] Le serviteur peut choisir un motif général.
- [ ] Le serviteur voit son historique.
- [ ] Les responsables voient seulement leur périmètre.

## Formations

- [ ] PCNC 001 existe.
- [ ] PCNC 101 existe.
- [ ] PCNC 201 existe.
- [ ] Une formation peut avoir des modules.
- [ ] Un module peut avoir une vidéo.
- [ ] Le serviteur peut rédiger un résumé.
- [ ] Le résumé peut être envoyé.
- [ ] Un responsable peut valider ou demander correction.

## Croissance

- [ ] Le serviteur peut renseigner sa lecture de la Parole.
- [ ] Le serviteur peut écrire une note privée.
- [ ] Les notes privées ne sont pas visibles par responsables.
- [ ] Le serviteur peut ajouter un livre lu.
- [ ] Le serviteur peut recommander un livre.
- [ ] Le serviteur peut suivre des habitudes.

## Objectifs

- [ ] Le serviteur peut créer un objectif.
- [ ] L’objectif a une visibilité.
- [ ] L’objectif peut rester privé.
- [ ] L’objectif peut être partagé volontairement.
- [ ] L’objectif a des étapes.

## Rendez-vous

- [ ] Le serviteur peut demander un rendez-vous.
- [ ] Il peut choisir Bergère, leader, soins pastoraux, Vie Académique, référent.
- [ ] Les demandes pastorales ne sont pas visibles publiquement.
- [ ] Un rendez-vous accepté apparaît dans l’agenda.

## Ressources

- [ ] Les liens utiles existent.
- [ ] Les documents existent.
- [ ] Les livres existent.
- [ ] Les t-shirts / boutique existent ou sont prévus.
- [ ] Les ressources peuvent être filtrées par visibilité.

## Parcours

- [ ] Le serviteur peut renseigner étudiant/travailleur/alternant.
- [ ] Il peut renseigner recherche de stage.
- [ ] Il peut renseigner compétences.
- [ ] Il peut demander accompagnement.

## Espace personnel

- [ ] Le serviteur peut personnaliser les widgets.
- [ ] Il peut ajouter des raccourcis.
- [ ] Il peut changer bannière/photo.
- [ ] Les préférences sont sauvegardées.

## Responsabilités

- [ ] Les outils apparaissent selon rôle.
- [ ] Un simple serviteur ne voit pas les outils non attribués.
- [ ] FIJ pilote apparaît seulement pour pilote.
- [ ] FIJ coordination apparaît seulement pour coordination.
- [ ] Les responsabilités ne sont pas le centre de l’accueil.

## FIJ

- [ ] Le pilote voit sa FIJ.
- [ ] Le pilote peut remplir le CR du jeudi.
- [ ] Le CR contient présence par membre.
- [ ] Le CR ne contient pas état émotionnel/financier/radar intrusif.
- [ ] La coordination voit tous les CR.
- [ ] La coordination voit les CR manquants.
- [ ] La coordination peut relancer.
- [ ] Les indicateurs FIJ remontent dans Direction.

## Direction

- [ ] Les leaders voient les indicateurs globaux.
- [ ] Les FIJ remontent dans Direction.
- [ ] Les présences remontent dans Direction.
- [ ] Les formations remontent dans Direction.
- [ ] Les rendez-vous sont visibles selon confidentialité.
- [ ] La direction ne doit pas entrer dans chaque outil pour avoir les chiffres.

## Permissions

- [ ] Les données privées restent privées.
- [ ] Les données partageables nécessitent choix ou autorisation.
- [ ] Les données organisationnelles sont filtrées par périmètre.
- [ ] Le CRUD est protégé par rôle.
- [ ] Les URL directes non autorisées sont bloquées.

## Design

- [ ] L’espace interne est blanc premium.
- [ ] Le fond noir a été retiré.
- [ ] Les boutons sont professionnels.
- [ ] Les cartes sont propres.
- [ ] La typographie est cohérente.
- [ ] L’application est mobile-first.
- [ ] L’agenda est visuel et lisible.

## Test final de vérité

Un serviteur nouveau doit pouvoir répondre sans explication :

1. Où suis-je ?
2. Que dois-je faire aujourd’hui ?
3. Comment confirmer ma présence ?
4. Où est mon agenda ?
5. Où est ma formation ?
6. Où demander un rendez-vous ?
7. Où trouver mes ressources ?
8. Où sont mes responsabilités ?
