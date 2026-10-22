# EJP Nantes — design public

## Proposition FIJ du 22 octobre 2026 — validation locale

Périmètre : les accueils existants `/app/responsabilites/fij-pilote` et `/app/responsabilites/fij-coordination`, ainsi que la fiche membre accessible depuis leurs listes. StarLayout, PrivateSidebar, le registre de navigation et les autres ministères sont conservés. Aucun déplacement de route ni changement de thème global.

Les six documents FIJ fournis le 22 octobre constituent les sources métier. Le tableau distingue assembler (participants et CR), connaître (parcours renseigné et fiches), conduire (schéma Attirer → Convertir → Intégrer → Prendre soin). La consécration, les 24 h de prière, les pauses, les transferts, la communication et le reporting conservent leurs formulaires existants. Le seuil de 13 membres signale une multiplication à préparer ; il ne crée, ne ferme et ne divise aucune FIJ automatiquement.

FijVisualDashboard possède la composition des deux accueils et FijMemberDialog le détail en superposition ; couleurs et géométrie sont limitées à `components/fij/fijDashboard.css` sous `.fij-visual`. Palette dérivée de l’espace privé lumineux existant : fond #f3f6fa, surfaces blanches, texte #192f50, secondaire #67788e, accent des courbes #456bdd, séparateurs #e4eaf3. Manrope, grands titres sans serif, graphiques Recharts existants, mouvement limité et compatibilité reduced-motion. Aucun nouvel outil graphique ni image générée.

Présentation : vue de lecture couvrant le chrome, sans noms de membres, contacts ou notes individuelles. Quitter restitue le tableau de bord. Bilan CSV agrégé uniquement. Les chiffres de démonstration vivent hors du produit dans les scripts de vérification, jamais dans les composants livrés.

Audience : jeunes découvrant la communauté à Nantes. Objectif : comprendre la maison et préparer une première venue.

## Évolution métier — cahier des charges du 16 octobre 2026

Les lots 02 à 07 étendent les écrans existants : suivi de l’équipe dans PageDepartement, équipes des programmes dans Coordination, données détaillées dans Pilotage. Aucune nouvelle identité visuelle. Les primitives Input/Button et les contrôles natifs des formulaires métier restent canoniques. Les graphiques réutilisent les variables CSS --success, --danger et --muted-foreground ; une donnée manquante est explicitement distinguée d’une absence. Aucun score individuel.

Le format des nouveaux identifiants demandé dans ce cahier des charges est prenom@prodiges. Il remplace le format de création décrit plus bas dans les décisions historiques du 14 octobre ; les identifiants existants sont conservés et restent utilisables.

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

## Espace privé approuvé — 16 octobre 2026

La proposition interactive output/proposition-privee a été approuvée par l’utilisateur. Elle remplace le thème privé crème/or par un espace lumineux : fond #f3f6fa, surfaces #ffffff, texte #172b4b, actions #294d84, contours #e4e9f0, texte secondaire #637087 et or discret #b58b42. Typographie Manrope, titres 29–33 px, cartes 18–20 px. Ces variables restent sous .serviteur-app dans src/index.css ; public et connexion gardent leur identité.

StarLayout reste propriétaire du shell : barre latérale PrivateSidebar à partir de 1280 px, en-tête à 78 px sur ordinateur et 68 px sur téléphone, navigation inférieure mesurée sous 1280 px. Le répertoire recherchable remplace le panneau de navigation complet et réutilise Dialog Radix (focus, Escape, fermeture). Les liens proviennent du registre starMegaMenu existant, complété par les accès personnels déjà routés. Aucun rôle de démonstration dans le produit.

AppDashboard garde son chargement et ses composants métier. BureauHero accueille, BureauNextEvent affiche le prochain événement réel et mène au parcours de présences existant. Le contexte conserve agenda, départements, raccourcis, verset et phrase personnels. Les widgets et leur visibilité, les accents, les formulaires, les validations et les autorisations restent disponibles. Aucune donnée fictive ni statistique inventée. Les formations reprennent les programmes réels dans le même langage visuel.

Pas de nouvel appel d’écriture, nouvelle bibliothèque ou modification serveur. Mouvement discret Framer Motion avec reducedMotion=user, défilement natif et CSS de mouvement réduit.

## Édition claire des photos publiques — 16 octobre 2026

AdminHome ouvre Photos du site par défaut. PublicPhotosEditor présente six emplacements réels : accueil, communauté (également La maison et FIJ après affectation), Nantes (également Venir), Apôtre, Berger EJP Monde, Bergère Nantes. Chaque carte montre l’image actuelle, sa destination, le chargement d’un fichier public, le choix dans la galerie et un lien de consultation. Les changements de configuration restent en mémoire jusqu’au bouton Publier les modifications ; les emplacements en attente sont identifiés, y compris après changement d’onglet. La vidéo d’accueil est explicite, puisqu’elle recouvre la photo.

GalleryAdmin conserve la source GalleryMedia et enregistre ses propres opérations immédiatement. Modifier titre/description/fichier, masquer/afficher, monter/descendre et retirer sont visibles au toucher. Retirer demande confirmation et ne détruit pas le fichier utilisé ailleurs. Les liens ouvrent Accueil → Galerie. Home charge jusqu’à 1000 médias actifs au lieu de huit ; GalerieVivante en montre neuf puis propose la suite. Une vidéo sans miniature utilise un élément video plutôt qu’un img pointant vers le fichier vidéo.

Le stockage et les autorisations de server/files.mjs restent les propriétaires de l’upload. Les formulaires réutilisent le Dialog partagé. Aucun import de données de test en production. Les photos ne sont pas modifiées automatiquement au déploiement.
