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
