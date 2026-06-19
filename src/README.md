# EJP Nantes — Application Web communautaire

## À propos

**EJP Nantes** (Église des Jeunes Prodiges) est une application web full-stack développée pour une communauté religieuse locale basée à Nantes, France.

L'objectif de ce projet est de centraliser la vie communautaire de l'église au sein d'une plateforme digitale moderne, accessible à tous les membres.

---

## Fonctionnalités principales

### 🌐 Site vitrine public
- Page d'accueil cinématique avec fond vidéo/image configurable et animations au défilement
- Présentation de la vision, des leaders, des ministères et des événements
- Section galerie multimédia (photos & vidéos)
- Carte interactive du réseau mondial FIJ (Familles d'Impact Jeune) via un globe 3D (Three.js)
- Formulaire de contact et intégration des réseaux sociaux

### 🔐 Espace membre (authentifié)
- Inscription avec vérification OTP par email
- Connexion via email/mot de passe ou Google OAuth
- Profil personnel personnalisable
- **Le Parvis** : flux social interne à la communauté (posts, réactions, commentaires)
- **Espace Serviteur** : accès réservé aux membres engagés dans un département

### 🏛️ Gestion des départements
- Liste des départements actifs (Louange, Accueil, FIJ, etc.)
- Chat interne par département
- Gestion des membres et des référents
- Vue dédiée par département avec rôles distincts

### ⚙️ Administration (Bureau / Admin)
- Tableau de bord d'administration complète du contenu (configuration du site, annonces, events, témoignages, galerie, leaders)
- Upload de médias (images, vidéos) directement depuis l'interface
- Gestion des pages de connexion/inscription (image illustrative dynamique)
- Panneau dédié au bureau de l'église pour les actions rapides

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Animations | Framer Motion, GSAP (ScrollTrigger) |
| 3D | Three.js |
| Routing | React Router v6 |
| État / Cache | TanStack Query |
| Backend / BaaS | Base44 (auth, base de données, stockage, fonctions) |
| Internationalisation | Français (interface principale) |

---

## Contexte

Ce projet a été réalisé dans le cadre d'une expérience de développement fullstack en autonomie, de la conception de la base de données à la mise en production, en passant par le design de l'interface et l'architecture des composants.

Il illustre la capacité à livrer une application complète, fonctionnelle et personnalisée pour un vrai besoin utilisateur.

---

*Développé avec ❤️ pour la communauté EJP Nantes.*