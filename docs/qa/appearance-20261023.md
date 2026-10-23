# Apparence — correction du 23 octobre 2026

## Défauts corrigés
Les couleurs n’étaient consommées que par certains widgets du bureau. La densité n’était pas appliquée. L’agenda ignorait sa préférence de vue. Le menu de profil conservait un thème séparé dans le navigateur, sans lien avec le formulaire.

## Comportement
WorkspaceAppearance et workspaceAppearance.js possèdent les réglages et les tokens du privé. Apparence propose Clair / Sombre / Système, cinq accents, densité et réduction des animations. Aperçu immédiat ; Enregistrer conserve les valeurs dans UserWorkspacePreference scoped self. Quitter sans sauvegarder annule l’aperçu. Les raccourcis du profil sauvegardent dans la même source ; leurs mises à jour conservent les autres champs en cours d’édition. La préférence d’agenda s’applique au prochain accès et le choix manuel de la visite reste prioritaire. Les préférences anciennes restent compatibles ; aucune migration de données.

## Vérification
- 32 tests serveur/navigation réussis, dont persistance des préférences, conservation des champs non concernés et refus de modification d’un autre compte.
- Compilation réussie, lint des fichiers modifiés sans erreur, diff vérifié.
- Navigateur sur données fictives isolées : aperçu, sauvegarde, rechargement, abandon sans sauvegarde, thème système sombre/clair, erreur 503 avec conservation puis réessai, synchronisation du profil, mois par défaut dans l’agenda, absence de fuite des tokens vers le public.
- Responsive à 320, 390, 844 et 1440 px, dont paysage ; pas de débordement horizontal constaté. Les commandes de sauvegarde utilisent les couleurs de texte sémantiques, y compris en sombre.
- Typecheck global et audit Premium restent affectés par la dette du dépôt ; ce travail ne revendique pas un audit complet d’accessibilité. Captures/scripts/logs dans output/appearance-qa, hors produit.

Les essais de sauvegarde ne modifient aucun compte réel. La publication conserve le service/disque et les fonctions métier existantes.
