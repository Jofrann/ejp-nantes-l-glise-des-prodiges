# Audit de l’application EJP Nantes — 16 octobre 2026

Les écritures de test utilisent une base isolée. La lecture de production a confirmé 2 comptes, aucun département et aucune affectation : aucun département fictif ni compte de test ne sont ajoutés au site.

| Bug confirmé | Correction vérifiée |
| --- | --- |
| La route Départements redirigeait vers le service personnel | Page de gestion rétablie et accessible depuis le menu admin et Mon service |
| Absence de département sans explication exploitable | État vide explicite et création accessible à l’administration |
| Département créé sans identifiant de navigation | Slug généré, doublons refusés, consultation par slug ou ID |
| Données personnelles interdites aux serviteurs | Accès contrôlé par propriétaire et périmètre ; données privées des autres utilisateurs refusées |
| Métadonnées absentes après création | Attribution au compte connecté côté serveur, valeurs par défaut des modèles appliquées aux nouvelles données |
| Liens admin ouvrant tous la même page | Annuaire, départements et onglets de configuration correctement ciblés |
| Rôles et badges admin interprétés différemment | Contrôles client et serveur alignés |
| Contenu masqué par les barres fixes | Espacement mesuré, zones sûres et limites de hauteur des panneaux adaptées |
| Erreurs de requêtes silencieuses | Messages d’erreur visibles et sortie de chargement rétablie sur les parcours corrigés |

```mermaid
flowchart LR
 A[Admin : créer un département] --> B[Annuaire : affecter le compte]
 B --> C[Première connexion : remplacer le mot de passe]
 C --> D[Mon service : ouvrir son département]
 D --> E[Retrait de l’affectation : accès révoqué]
```

| Zone de notifications invisible interceptant les clics en paysage | Conteneur non bloquant, fermeture et expiration des notifications rétablies |

## Vérifications réalisées

- Quatre suites automatisées passent : initialisation admin sans écrasement, API et persistance, serveur web, parcours départements et autorisations.
- Navigateur : création de département, affectation depuis la fiche d’annuaire, connexion du serviteur, remplacement du mot de passe initial et ouverture du département.
- 92 adresses internes visitées pour chacun des deux profils admin et serviteur : pas d’erreur JavaScript, d’erreur HTTP inattendue ni de débordement horizontal détecté à 390 × 844. Cela couvre la navigation, pas toutes les opérations de chaque écran.
- Contrôles responsive locaux : 55 combinaisons de pages et tailles lors de la correction des barres fixes.
- Navigation en paysage 844 × 390 : ouverture du panneau Plan STAR et limites du panneau vérifiées après correction des notifications.
- Isolation des notes privées, refus de l’auto-attribution de droits, retrait d’affectation et refus d’accès d’un compte suspendu vérifiés par tests serveur.

## Limites identifiées

Les connecteurs d’envoi de courriels, d’upload de fichiers, d’IA, de paiement et de visioconférence ne sont pas configurés sur le serveur autonome. Leur fonctionnement de bout en bout reste à traiter ; les tests ci-dessus ne les valident pas. Le bouton de notification de la boutique affiche actuellement une confirmation sans abonnement persistant. Les parcours FIJ ont été parcourus avec les deux profils testés, sans jeu métier complet de pilote et de coordination : cela ne constitue pas une validation de toutes leurs écritures.

Le présent correctif traite en priorité les départements, affectations, données personnelles et accès mobile. Il ne prétend pas garantir l’absence de tout bug dans l’ensemble de l’application.

Audit des dépendances : `npm audit --omit=dev` signale 25 vulnérabilités (8 modérées, 16 élevées, 1 critique dans jsPDF). Ces alertes demandent une analyse d’exposition et des mises à jour compatibles ; elles ne sont pas corrigées par cette livraison. Certaines corrections proposées changent de version majeure.

## Publication vérifiée

Le code du commit `b2e139a` est Live sur Render (déploiement `dep-db8oqtff3r2c73esj9ng`). Sur le domaine officiel, connexion admin, affichage de la gestion des départements et ouverture du formulaire de création vérifiés à 390 × 844. Le formulaire a été ouvert sans enregistrer de département fictif. Les sources corrigées sont aussi synchronisées dans le dossier local `ejp-nantes`.
