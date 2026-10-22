# Modifier les photos du site EJP Nantes

## Remplacer une grande photo ou un portrait

1. Ouvrir Administration → Photos du site.
2. Repérer l’emplacement grâce à son titre et à son aperçu.
3. Cliquer sur Remplacer la photo pour envoyer un fichier, ou Depuis la galerie pour réutiliser une photo.
4. Cliquer sur Publier les modifications. Une confirmation apparaît après l’enregistrement.
5. Utiliser Voir cet emplacement sur le site pour consulter le résultat dans un nouvel onglet ; recharger un onglet public déjà ouvert.

La photo Communauté, une fois choisie explicitement, est aussi utilisée sur La maison et FIJ. La photo Nantes est aussi utilisée sur Nous rejoindre. Une vidéo d’accueil active s’affiche devant la photo : utiliser Désactiver la vidéo, puis publier, pour montrer uniquement l’image.

## Où vont les médias de la galerie ?

Administration → Galerie alimente Accueil → Galerie, section Une maison vivante. Le lien Voir la galerie ouvre cet emplacement. La liste publique présente neuf médias, puis un bouton permet d’afficher la suite. Les nouveaux ajouts sont à la fin de la liste ; les flèches changent leur ordre.

Les commandes Modifier, Masquer / Afficher et les flèches sont enregistrées immédiatement. Modifier permet de changer le titre, la description accessible et le fichier. Retirer enlève l’entrée de la galerie après confirmation ; cela ne change pas une photo déjà sélectionnée pour une autre partie du site. Une photo masquée dans la galerie peut toujours servir à un emplacement choisi explicitement.

Sans choix explicite pour les images Communauté et Nantes, la page d’accueil peut reprendre les premières photos actives de la galerie. Pour choisir précisément les images de ces sections, utiliser Photos du site.

Les textes restent dans Textes & Réglages, les autres contenus dans leurs onglets existants. Aucun réglage de rôle ou donnée interne n’est modifié par cet éditeur.


## Textes et aperçu avant publication

Administration → Textes du site présente le contenu existant. Informations partagées regroupe le titre d’accueil, le jour et l’heure du culte, l’adresse, la vision, la mission, les autorités et les FIJ. Les autres sections regroupent les textes des six routes publiques, les menus, les appels à l’action, les questions fréquentes et le formulaire de visite. Rechercher retrouve les phrases. Une phrase identique utilisée à plusieurs endroits reste liée.

Les modifications de ChurchConfig et de public_copy restent dans l’état du formulaire jusqu’à Publier les modifications. Voir l’aperçu avant publication ouvre le vrai rendu des pages en vue ordinateur ou téléphone, avec les photos et textes en cours. Cet aperçu est réservé à une session administrateur active, communiqué uniquement à son iframe de même origine ; seuls les champs publics sont transférés. Les liens et l’envoi du formulaire sont bloqués. Fermer ou Échap revient à l’éditeur. Recharger ou quitter l’administration perd les changements non publiés.

Les événements, programmes, ministères, leaders, témoignages et légendes de galerie conservent leurs éditeurs métier : les liens sont disponibles dans Textes du site et leurs opérations restent enregistrées directement. Ces opérations ne sont pas des brouillons de ChurchConfig.

Les variables {{jour}}, {{horaire}} et {{adresse}} affichent les réglages partagés. L’heure est celle de Nantes, au format HH:MM. Compte à rebours et fichiers calendrier utilisent Europe/Paris, y compris les changements saisonniers. Aucune heure officielle n’est inventée : les réglages enregistrés sont conservés ; 15:00 reste la valeur de secours déjà présente dans l’application.

Le catalogue publicCopyCatalog.json référence les textes de présentation existants ; PublicText les rend comme texte React, sans HTML injecté ni modification du DOM après rendu. Tout nouveau texte de présentation doit utiliser cette même liaison et être ajouté au catalogue avec une section. Les clés et valeurs enregistrées sont validées côté serveur. Aucune donnée privée d’intégration n’est publiée dans public_copy.
