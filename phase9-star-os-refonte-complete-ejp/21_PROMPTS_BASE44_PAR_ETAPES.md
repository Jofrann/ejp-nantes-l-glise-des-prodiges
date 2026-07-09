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
