# EJP Nantes — intégration privée du 23 octobre 2026

Base : e73d081 (branche distante deploy/ejp-nantes-autonome au démarrage). Travail sur work/private-mobile-20261023. La publication Render n’a pas été effectuée dans cette intervention.

## Périmètre
Direction approuvée du prototype mobile : papier/encre/sauge/or, quatre onglets animés, bureau mobile compact avec accès à tous les widgets, recherche de destinations, mode sombre et mouvement réduit. Les styles ne s’appliquent pas au site public ou à la connexion. Les règles serveur, données métier et routes App.jsx sont inchangées. Coordination FIJ réunit département et réseau dans une carte. Les affectations de copilotes multiples sont reconnues par le helper existant.

## Vérifications effectuées
- Compilation de production réussie ; avertissement préexistant sur la taille du bundle principal.
- Tests serveur et tests de navigation exécutés via npm test : 28 tests réussis, aucun échec.
- Lint de tous les fichiers JS/JSX modifiés : aucune erreur. Comparaison ESLint sur src : 149 erreurs sur la base, 146 après modification ; aucun nettoyage global hors périmètre.
- Typecheck : 821 erreurs sur la base et sur la version testée ; comparaison des diagnostics normalisés : aucun ajout. Majoritairement contrats de types existants et code GSAP. La commande globale ne passe donc pas.
- Audit statique Premium strict : 148 signalements sur la base, 148 sur la version testée, aucun ajout. Cet audit n’est pas un certificat d’accessibilité ou de sécurité.
- Navigateur Edge, données fictives sur une base SQLite séparée : 320×740, 390×844, 430×932, 768×1024, 844×390, 1440×1000. Bureau, agenda, service et formations : quatre onglets, une rubrique active, aucun débordement horizontal.
- Confirmation de présence depuis le bureau : écriture API puis rechargement et relecture de la réponse dans le bureau.
- Accès au détail de formation via recherche et lien du programme ; dernière action atteignable au-dessus de la barre après défilement.
- Bureau : ouverture et fermeture de tous les widgets vérifiées.
- Recherche : alias de contacts préservé après dédoublonnage, aucun résultat, effacement, navigation, Échap et restitution du focus.
- Erreur 503 simulée sur les départements : message d’erreur explicite, puis réessai réussi.
- Mode sombre, mouvement réduit personnel et système, navigation après défilement, sortie vers le public sans fuite de thème vérifiés.

## Limites
Pas de test sur téléphone physique, clavier iOS/Android réel, VoiceOver/TalkBack ou test d’intrusion. Les protections serveur existantes restent couvertes par leurs tests ; tous les formulaires historiques n’ont pas été rejoués manuellement. Les captures et scripts de validation sont dans output/private-mobile-qa (ignoré par Git). Les données de validation ne font pas partie du produit et aucune donnée de production n’a été modifiée.

