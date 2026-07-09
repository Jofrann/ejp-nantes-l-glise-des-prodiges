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
