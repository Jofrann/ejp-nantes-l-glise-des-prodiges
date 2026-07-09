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
