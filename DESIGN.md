# EJP Nantes — design public

Audience : jeunes découvrant la communauté à Nantes. Objectif : comprendre la maison et préparer une première venue.

Direction : compositions éditoriales, ouverture cinématographique, bleu nuit et lumière dorée. Signature : entrée du titre par lignes masquées, photo immersive avec parallaxe, récit photographique et bandeau typographique lié au défilement. Logo officiel dans public/brand/ejp-logo.png, original préservé ; inversion CSS sur fond sombre.

Périmètre : /, /a-propos, /programmes, /venir. Styles sous `.ejp-public`, navigation publique partagée. Espace interne indépendant.

Tokens canoniques : src/index.css, bloc Public site. Encre #101827, papier #FBFAF7, or #D8B76A, texte secondaire #4B5563. Or foncé #8B6926 pour les petits textes sur fond clair. Manrope pour titres/corps, Cormorant Garamond pour un accent expressif. Coins de cartes 6px, actions 3px. Pas de nouvelle bibliothèque.

Médias : ChurchConfig.hero_video_url, hero_image_url, community_image_url, nantes_image_url, hero_title, hero_subtitle. Illustrations Unsplash par défaut (crédits dans publicPhotos.js et à l’écran), remplacées par les médias administrables ; elles ne sont pas présentées comme des photos d’EJP. GalleryMedia active fournit les deux photos du récit en absence d’URL configurée. Édition dans AdminHome, onglet Hero. Photo par URL, couverture vidéo et fond alternatif. Les uploads restent tributaires de l'intégration locale existante ; cette refonte n'ajoute ni stockage ni publication en brouillon.

Mouvement : GSAP + ScrollTrigger via motion/usePublicMotion.js ; timelines d’entrée, parallaxe du Hero et des photos, ouverture des masques au défilement, bandeau typographique, inclinaison des cartes au pointeur et progression de lecture. RevealOnScroll reste le propriétaire des révélations de sections. Nettoyage par gsap.matchMedia(). Défilement natif, sans pin imposé sur mobile. Respect de prefers-reduced-motion, vidéo avec pause explicite. Navigation native au clavier, menu mobile avec Escape et retour du focus. Aucun défilement imposé ni dépendance à un curseur personnalisé.

## Connexion et accès administrés

Les écrans de connexion, FirstLogin et les formulaires de création existants restent les propriétaires du parcours. L’admin crée un identifiant EJP unique et reçoit une seule fois le mot de passe provisoire. Première connexion : remplacement obligatoire avant tout accès interne, y compris pour les comptes administrateurs concernés. Minimum 12 caractères, confirmation et mot de passe différent. La fiche annuaire permet de renouveler les accès sans supprimer les données. Les couleurs, typographies et composants AuthLayout existants sont conservés. Source métier : demande utilisateur du 14 octobre 2026 ; contrats serveur dans server/index.mjs et server/provision.mjs.

Identifiants nouveaux : Prénom normalisé avec initiale majuscule, suffixe @prodige (exemple Jofran@prodige), variantes uniques en cas d’homonyme. Connexion insensible à la casse ; anciens identifiants @prodiges conservés et acceptés. Les écrans de création affichent le lien /login à transmettre manuellement avec les accès ; aucun envoi automatique d’email.

## Application des propositions approuvées — 14 octobre 2026

Public : ajout /fij, vision et mission sur l’accueil, autorités ordonnées (Apôtre, Berger EJP Monde, Bergère Nantes), retour des ministères et galerie. Les portraits manquants sont des monogrammes. Les champs de présentation sont administrables ; aucune photo d’illustration n’est utilisée pour représenter une autorité. Les profils publics ne contiennent ni email ni téléphone privés.

Serviteur : StarLayout et les composants Bureau existants restent les propriétaires. Le thème sous .serviteur-app dans src/index.css est canonique (crème, bleu nuit, or). Les classes maison-* explicitent la composition ; aucun observateur DOM du prototype n’est livré. La navigation conserve les routes et droits. Les préférences de widgets et d’accent restent actives. Pas de nouvelle fonction ni nouvelle donnée.

Connexion : LoginBubbles présente deux étapes centrées ; Login.jsx reste propriétaire des états et du traitement. AuthLayout reste utilisé par la configuration initiale et les autres parcours d’accès. Aucun changement des règles de première connexion, suspension, consentement ou mots de passe. Champs partagés Input, autocomplete username/current-password, focus à l’étape active, validation textuelle, retour à l’identifiant et respect du mouvement réduit.

## Autorités et reflet doré — référence Porto-Novo

Apôtre en composition texte/portrait, puis deux présentations des bergers avec signature et portrait. Portraits publics de Yvan Castanou et Samuel Eboumbou : sources officielles observées sur https://www.ejp-portonovo.com/ ; URLs remplaçables dans ChurchConfig. Le portrait de Nantes reste spécifique à Nantes. Aucun témoignage ou citation n’est attribué sans source. Reflet doré CSS sur quelques titres, respect de prefers-reduced-motion et couleurs forcées.

## Responsive et barres fixes

useChromeInset mesure les en-têtes et les barres du bas avec ResizeObserver. Les décalages et marges de défilement utilisent les variables de hauteur réelles. Sur téléphone, les en-têtes secondaires restent dans le flux, les onglets d’administration défilent horizontalement et les fenêtres passent devant la navigation avec une hauteur adaptée au viewport visuel. Les barres inférieures s’effacent pendant la saisie pour libérer le clavier. Zones de sécurité prises en compte. Les fonctions métier restent inchangées.


## Fichiers, boutique et intégrations — 16 octobre 2026

Les écrans d’upload existants restent propriétaires de la sélection et du chargement ; base44Client est l’adaptateur partagé. Une erreur serveur reste visible, les états de chargement sont libérés ; rien ne simule un fichier enregistré. L’onglet Admin Fichiers & Intégrations explique les états et les paramètres attendus. L’assistant utilise PageHeader, les couleurs et le layout existants ; il apparaît dans Mes Ressources sur desktop comme mobile. Les règles métier viennent de server/files.mjs, server/integrations.mjs et server/shop.mjs ; les messages ne présentent pas les réponses d’un fournisseur comme une preuve de livraison. L’abonnement boutique produit une notification interne persistante. Aucune refonte du design ni migration Tailwind majeure dans ce correctif.
## Espace privé approuvé — 16 octobre 2026

La proposition interactive output/proposition-privee a été approuvée par l’utilisateur. Elle remplace le thème privé crème/or par un espace lumineux : fond #f3f6fa, surfaces #ffffff, texte #172b4b, actions #294d84, contours #e4e9f0, texte secondaire #637087 et or discret #b58b42. Typographie Manrope, titres 29–33 px, cartes 18–20 px. Ces variables restent sous .serviteur-app dans src/index.css ; public et connexion gardent leur identité.

StarLayout reste propriétaire du shell : barre latérale PrivateSidebar à partir de 1280 px, en-tête à 78 px sur ordinateur et 68 px sur téléphone, navigation inférieure mesurée sous 1280 px. Le répertoire recherchable remplace le panneau de navigation complet et réutilise Dialog Radix (focus, Escape, fermeture). Les liens proviennent du registre starMegaMenu existant, complété par les accès personnels déjà routés. Aucun rôle de démonstration dans le produit.

AppDashboard garde son chargement et ses composants métier. BureauHero accueille, BureauNextEvent affiche le prochain événement réel et mène au parcours de présences existant. Le contexte conserve agenda, départements, raccourcis, verset et phrase personnels. Les widgets et leur visibilité, les accents, les formulaires, les validations et les autorisations restent disponibles. Aucune donnée fictive ni statistique inventée. Les formations reprennent les programmes réels dans le même langage visuel.

Pas de nouvel appel d’écriture, nouvelle bibliothèque ou modification serveur. Mouvement discret Framer Motion avec reducedMotion=user, défilement natif et CSS de mouvement réduit.
