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
