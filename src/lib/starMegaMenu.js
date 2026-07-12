import {
  Home, Calendar, CheckCircle, Sprout, GraduationCap,
  CalendarClock, BookOpen, Briefcase, Shield, Settings,
  Target, NotebookPen, TrendingUp, Clock, AlertCircle,
  FileText, ShoppingBag, Heart, Users, Music, Award,
  BellRing, LayoutDashboard, MapPin, Phone, Wrench
} from 'lucide-react';

// Mega-menu STAR OS — Blueprint Phase 16
// Navigation: Bureau | Mon Service | Mes Formations | Mes Ressources | Responsabilités
export const MEGA_MENU = [
  {
    id: 'bureau',
    label: 'Mon Bureau',
    icon: Home,
    route: '/app',
    items: [
      { label: 'Vue d\'ensemble', desc: 'Que se passe-t-il aujourd\'hui ?', icon: LayoutDashboard, to: '/app' },
      { label: 'Actions prioritaires', desc: 'Ce que je dois faire', icon: AlertCircle, to: '/app' },
      { label: 'Agenda court', desc: 'Mes prochains rendez-vous', icon: Calendar, to: '/app/agenda' },
      { label: 'Espace personnel', desc: 'Personnaliser mon espace', icon: NotebookPen, to: '/app/espace-personnel' },
    ],
  },
  {
    id: 'service',
    label: 'Mon Service',
    icon: Briefcase,
    route: '/app/service',
    items: [
      { label: 'Vue d\'ensemble', desc: 'Mon département, ma fonction', icon: LayoutDashboard, to: '/app/service' },
      { label: 'Mes Présences', desc: 'Confirmer et historique', icon: CheckCircle, to: '/app/presences' },
      { label: 'Mon Agenda', desc: 'Réunions et événements', icon: Calendar, to: '/app/agenda' },
      { label: 'Mon Parcours', desc: 'Situation et compétences', icon: MapPin, to: '/app/parcours' },
    ],
  },
  {
    id: 'formations',
    label: 'Mes Formations',
    icon: GraduationCap,
    route: '/app/formations',
    items: [
      { label: 'Formations actives', desc: 'PCNC et modules en cours', icon: GraduationCap, to: '/app/formations' },
      { label: 'Croissance', desc: 'Lecture, notes, habitudes', icon: Sprout, to: '/app/croissance' },
      { label: 'Mes Objectifs', desc: 'Buts et étapes', icon: Target, to: '/app/objectifs' },
      { label: 'Rendez-vous', desc: 'Demander un entretien', icon: CalendarClock, to: '/app/rendez-vous' },
    ],
  },
  {
    id: 'ressources',
    label: 'Mes Ressources',
    icon: BookOpen,
    route: '/app/ressources',
    items: [
      { label: 'Documents', desc: 'Télécharger des ressources', icon: FileText, to: '/app/ressources' },
      { label: 'Liens utiles', desc: 'Accès rapides', icon: BookOpen, to: '/app/ressources' },
      { label: 'Boutique', desc: 'Produits EJP', icon: ShoppingBag, to: '/app/ressources/boutique' },
      { label: 'Contacts utiles', desc: 'Joindre l\'équipe', icon: Phone, to: '/app/ressources' },
    ],
  },
  {
    id: 'responsabilites',
    label: 'Responsabilités',
    icon: Wrench,
    route: '/app/responsabilites',
    items: [
      { label: 'Mes outils actifs', desc: 'Modules assignés', icon: Briefcase, to: '/app/responsabilites' },
      { label: 'FIJ Pilote', desc: 'Gérer mes FIJ', icon: Users, to: '/app/responsabilites/fij-pilote' },
      { label: 'FIJ Coordination', desc: 'Vue réseau', icon: Users, to: '/app/responsabilites/fij-coordination' },
      { label: 'Organisation', desc: 'Vue d\'ensemble équipes', icon: LayoutDashboard, to: '/app/organisation' },
    ],
  },
];

export const MEGA_MENU_RESTRICTED = [
  {
    id: 'pilotage',
    label: 'Pilotage',
    icon: Shield,
    route: '/app/supervision',
    items: [
      { label: 'Vue globale', desc: 'Effectifs et indicateurs', icon: LayoutDashboard, to: '/app/supervision' },
      { label: 'Présences', desc: 'Agrégats par département', icon: CheckCircle, to: '/app/supervision' },
      { label: 'FIJ', desc: 'Réseau et reporting', icon: Users, to: '/app/supervision' },
      { label: 'Alertes', desc: 'Points d\'attention', icon: AlertCircle, to: '/app/supervision' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    route: '/app/admin',
    items: [
      { label: 'Contenus publics', desc: 'Vitrine et programmes', icon: FileText, to: '/app/admin' },
      { label: 'Utilisateurs', desc: 'Gérer les comptes', icon: Users, to: '/app/admin' },
      { label: 'Formations', desc: 'Créer modules et parcours', icon: GraduationCap, to: '/app/admin' },
      { label: 'Ressources', desc: 'Publier documents', icon: BookOpen, to: '/app/admin' },
    ],
  },
];

// Mobile bottom nav: Bureau | Service | Formations | Agenda | Plus
export const MOBILE_BOTTOM_NAV = [
  { path: '/app', label: 'Bureau', icon: Home, end: true },
  { path: '/app/service', label: 'Service', icon: Briefcase },
  { path: '/app/formations', label: 'Formations', icon: GraduationCap },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
];