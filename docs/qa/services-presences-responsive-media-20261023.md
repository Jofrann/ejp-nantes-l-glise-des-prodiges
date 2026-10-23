# Programmation, présences, responsive et médias — 23 octobre 2026

## Comportements livrés
Chaque département conserve ses outils et dispose aussi de « Programmer mon équipe ». Le responsable prépare la date, les horaires facultatifs, les postes et les affectations des membres actifs. Les responsables restent limités à leur périmètre ; administration et consultation transversale conservent leurs règles propres. Les plannings spécialisés restent disponibles. Les services sont projetés dans l’agenda personnel et dans les programmations de Coordination/Leaders, sans recopier les présences.
Les notifications internes signalent création, modification et retrait. Elles ouvrent l’agenda à la date du service. Le traitement est idempotent, relancé à l’écriture des sources spécialisées et périodiquement en secours. Aucun email ni push système n’est annoncé.
Les présences se renseignent par jour, semaine ou mois, regroupées chronologiquement. Les choix sont enregistrés ensemble, avec validation côté serveur et conservation de la saisie en cas d’échec. Le statut « À renseigner » permet une correction sans suppression du dossier. Les serviteurs ne peuvent écrire les présences d’un autre compte.

## Responsive : analyse et vérifications
Audit statique de tous les 317 fichiers JSX, 87 occurrences de positionnement fixe repérées (navigation, décors, surcouches et actions compris). 25 surcouches héritées dans 24 fichiers utilisent maintenant un portail commun qui gère la hauteur disponible, le défilement, le focus et la fermeture clavier. Les autres formulaires personnels sont portés au-dessus du shell ; les formulaires FIJ à validation fixe réservent l’espace de navigation. Les dialogues partagés sont bornés par la hauteur du viewport et les safe areas. Le chat départemental, les boutons flottants et les notifications ont aussi été examinés.
Matrice navigateur : Bureau, Service, Présences, Agenda, Formations et Communication en 320×740, 844×390 et 1440×1000, sans débordement du document. Programmation, rendez-vous et objectif testés dans une hauteur de 430px ; boutons de validation visibles et atteignables par hit-test. Présences : enregistrement sur le mois, relecture après rechargement, changement jour/semaine et conservation des choix après une erreur 503 simulée.
Une simulation de visualViewport réduit à 430px sans réduire la fenêtre confirme aussi que le bouton reste dans la zone visible (394px) ; la navigation est masquée pendant la saisie avec clavier superposé.
L’analyse du code ne vaut pas certification de tous les états. Pas de téléphone physique, clavier iOS/Android réel, VoiceOver/TalkBack ou audit de chaque interaction historique. Le redimensionnement d’une fenêtre valide l’espace disponible, sans simuler tout le comportement d’un clavier réel.

## Médias et chargement
Les originaux sont conservés. Les images publiques JPEG/PNG/WebP reçoivent des variantes WebP 320/640/960/1440/1920px, demandées selon l’écran et produites dans un cache temporaire. Écriture atomique, génération sérialisée et limites de pixels. Cache HTTP public uniquement pour les fichiers explicitement publics, avec ETag/304 ; les fichiers privés gardent leurs règles et leur cache privé sans stockage. Le test contrôle aussi les requêtes concurrentes et les lectures partielles.
Images hors écran chargées paresseusement ; les vidéos de galerie n’émettent plus de requête avant ouverture. Lecture d’un vrai WebM de test vérifiée, readyState 4, sans erreur. Vidéo de couverture différée ; pas de téléchargement automatique sur mobile, connexion limitée ou économie de données. Les écrans privés sont chargés à la demande : fichier JS principal passé d’environ 585Ko à 228Ko gzip. Il ne s’agit pas d’une mesure de tout le trafic ou d’un score Lighthouse.
Le titre public « Réunion de jeunesse » devient « Prodiges Expérience » ; la correction des éventuelles surcharges éditoriales est ciblée et idempotente.

FIJ : bouton « Soumettre » vérifié sur un CR avec un membre fictif, en 390×844 et 844×390, visible au-dessus de la navigation et atteignable par hit-test.

## Preuves
Tests API : permissions responsable/autre département, membres actifs, idempotence de création, service dans agenda, notification et lien daté, modification/retrait, présences de la période et refus d’un événement privé, absence de doublon, WebP plus léger, ETag, lecture partielle et fichier privé refusé. Compilation et lint ciblé vérifiés. Les données et médias de démonstration restent dans la base locale isolée et ne sont jamais importés en production.

Le typecheck global conserve des erreurs historiques de contrats JS/SDK/PublicText ; il n’est pas présenté comme réussi. La compilation, le lint ciblé et les parcours/API décrits ci-dessus sont les preuves de cette livraison.
