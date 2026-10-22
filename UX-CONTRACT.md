# EJP Nantes — propriétaires des interactions conservées

## FIJ — tableaux de bord et fiche membre (22 octobre 2026)

- Données : API locale existante, contrôles serveur inchangés. Requêtes par `fij_id` ; anciens CR par `fij_house_id`. Seuls les CR soumis/validés/en retard entrent dans les graphiques, dédoublonnés par FIJ/semaine ; un CR de présence soumis prévaut sur le total hebdomadaire de la même FIJ. Le nombre de nouveaux visiteurs reste une mesure distincte. Taux pondéré par les effectifs renseignés, semaines sans mesure vides, absences non renseignées exclues. La semaine en cours est explicitement provisoire.
- Select/Listbox : filtres FIJ, période et statut de parcours utilisent intentionnellement des sélections natives pour conserver les interactions de la plateforme, notamment sur téléphone. Les propriétaires globaux des autres écrans ne sont pas remplacés.
- Fiche : Dialog Radix partagé, portail et surcouche FIJ floutée, focus piégé, Escape et restitution du focus. Aucune donnée nominative en présentation. Les autorisations de lecture/écriture et de visibilité des notes restent celles de fijPermissions et du serveur ; le contexte d’adhésion coordination confirmé est normalisé comme côté serveur, sans modifier les rôles stockés.
- Écriture : statut de croissance via FijMember.update et note via FijMemberNote.create ; attente visible, double clic bloqué, erreur explicite, texte conservé en cas d’échec, confirmation après réponse serveur. Le détail historique des changements de statut et la présence au culte ne sont pas fabriqués : absence de mesure affichée.
- Autres parcours : création/suppression des membres, saisie et consultation des CR, registre, ouvertures, consécrations, pauses, relances, pilotes, documents, communications, transferts et reporting restent accessibles sur leurs routes existantes. Aucun import, aucune migration ni suppression de données en production.

## Lots métier du 16 octobre 2026

- Suivi de l’équipe : DepartmentAnalytics, lecture getDepartmentAnalytics autorisée côté serveur ; filtres date natifs via Input, sélection nominative limitée au département. Les taux indiquent leur dénominateur et excluent les données non renseignées. Les périodes portent sur les affectations reliées à des événements ; les plannings sans lien restent explicitement hors calcul.
- Coordination : ProgramTeams réutilise AssignmentList. Vue de lecture opérationnelle, sans historique de présence, visiteurs, prière ou notes académiques. Rattachement d’un planning et service réalisé réservés au Référent du département, avec audit et confirmation serveur.
- Pilotage : même route et onglets existants, ajout LeaderDataBrowser. Habilitations nominatives indépendantes des rôles/badges. Consultation sensible tracée, 25 dossiers au plus par page, aucun export global. Les secrets ne sont jamais des champs métier consultables.
- Administration : EJPPermissions utilise les contrôles de formulaire existants et une validation explicite avant écriture. Aucune attribution automatique ni changement de droit optimiste.
- Chargement/erreur/réessai : ReadState et useEJPRead ; une réponse obsolète n’écrase pas le nouveau périmètre. Pas de cache personnel persistant dans le navigateur. Les erreurs backend restent visibles.
- Tableaux et graphiques : pas de sélection multiple, pas de nouveau moteur de défilement. Thème et espacements existants ; graphiques sans animation, alternatives textuelles pour les indicateurs, contenu inférieur atteignable sur mobile et paysage.

Périmètre de cette refonte : présentation publique, thème StarLayout et connexion. Les données et les opérations métier existantes restent inchangées.

| Capacité | Propriétaire canonique | Variante touchée | Vérification |
| --- | --- | --- | --- |
| Form | Input partagé, Login.jsx, ejpAuth.js, server/index.mjs | LoginBubbles, deux étapes | Navigation clavier, erreur de connexion, tests API |
| Navigation | App.jsx, starMegaMenu.js, MegaMenu, StarLayout | Route active et thème | Bureau, Service, Agenda, mobile |
| Modal | components/ui/dialog.jsx pour la galerie ; formulaires métier existants pour Présences | Galerie publique ; dimensions du formulaire existant | Escape, focus, mobile |
| Scrollbar | src/index.css et défilement natif | Aucun nouveau moteur de défilement | Absence de débordement horizontal |
| Toast | Toaster existant dans App.jsx | Inchangé | Pas de nouveau fournisseur |
| CRUD | base44Client.js, routes API locales et composants métier existants | Édition des champs publics dans AdminHome | Tests API, aucune permission élargie |

Select/Listbox, Date et Table Selection : pas de nouveau comportement dans cette refonte ; conserver les composants et contrats existants. Langue de l’interface : français. Source des droits : permissions.js et serveur. Les données de démonstration des vidéos restent dans output/playwright ; elles ne sont jamais importées par le produit.

## Navigation privée du 16 octobre 2026

PrivateSidebar et les liens inférieurs présentent les routes existantes. MobilePlanStar demeure le propriétaire du répertoire, désormais présenté via le Dialog partagé : recherche locale sans requête réseau, effacement immédiat, état sans résultat, fermeture avec Escape et restitution du focus au déclencheur visible. Le profil et les droits proviennent toujours de l’utilisateur authentifié ; aucun sélecteur de rôle de maquette n’est livré. Les données du prochain événement sont en lecture ; le CTA ouvre les présences existantes sans confirmer automatiquement une réponse.

## Photos du site et galerie

Photo d’emplacement : upload public → aperçu et état À publier → publication de ChurchConfig → image publique. Le chargement bloque la publication ; une erreur conserve le formulaire modifiable. Le changement d’onglet conserve les choix non publiés dans AdminHome. Galerie : opérations GalleryMedia enregistrées immédiatement, état visible/masqué et position affichés ; suppression de la référence après confirmation, sans destruction du fichier. Choisir un média de galerie pour un emplacement utilise son URL stable sans déplacer ni supprimer la référence de galerie. Les boîtes de dialogue utilisent les composants Radix existants.
