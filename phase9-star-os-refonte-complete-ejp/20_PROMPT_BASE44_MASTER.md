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
