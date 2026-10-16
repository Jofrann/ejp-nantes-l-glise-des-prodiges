# EJP Nantes — propriétaires des interactions conservées

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
