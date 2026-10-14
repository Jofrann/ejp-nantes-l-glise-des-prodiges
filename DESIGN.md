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
