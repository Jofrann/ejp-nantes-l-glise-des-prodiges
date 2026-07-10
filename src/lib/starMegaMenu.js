import {
  Home, Calendar, CheckCircle, Sprout, GraduationCap,
  CalendarClock, BookOpen, Briefcase, Shield, Settings,
  Target, NotebookPen, TrendingUp, Clock, AlertCircle,
  FileText, ShoppingBag, Heart, Users, Music, Award,
  BellRing, LayoutDashboard, MapPin, Phone
} from 'lucide-react';

// Mega-menu structure for STAR OS — 5 main entries, anchored per-trigger
export const MEGA_MENU = [
  {
    id: 'accueil',
    label: 'Accueil',
    icon: Home,
    route: '/app',
    items: [
      { label: 'Mon bureau aujourd\'hui', desc: 'Vue d\'ensemble de ma journée', icon: LayoutDashboard, to: '/app' },
      { label: 'À faire maintenant', desc: 'Mes actions prioritaires', icon: AlertCircle, to: '/app' },
      { label: 'Actualités EJP', desc: 'Nouvelles de la communauté', icon: BellRing, to: '/' },
      { label: 'Espace personnel', desc: 'Personnaliser mon espace', icon: NotebookPen, to: '/app/espace-personnel' },
    ],
  },
  {
    id: 'quotidien',
    label: 'Quotidien',
    icon: Clock,
    route: '/app/agenda',
    items: [
      { label: 'Agenda', desc: 'Mon calendrier personnel', icon: Calendar, to: '/app/agenda' },
      { label: 'Présences', desc: 'Confirmer ma présence', icon: CheckCircle, to: '/app/presences' },
      { label: 'Rendez-vous', desc: 'Demander un rendez-vous', icon: CalendarClock, to: '/app/rendez-vous' },
      { label: 'Mon parcours', desc: 'Situation et compétences', icon: MapPin, to: '/app/parcours' },
    ],
  },
  {
    id: 'grandir',
    label: 'Grandir',
    icon: Sprout,
    route: '/app/croissance',
    items: [
      { label: 'Formations', desc: 'Parcours PCNC et modules', icon: GraduationCap, to: '/app/formations' },
      { label: 'Croissance', desc: 'Lecture, notes, habitudes', icon: Sprout, to: '/app/croissance' },
      { label: 'Objectifs', desc: 'Mes buts et étapes', icon: Target, to: '/app/objectifs' },
      { label: 'Livres', desc: 'Suivre ma progression', icon: BookOpen, to: '/app/croissance' },
    ],
  },
  {
    id: 'ressources',
    label: 'Ressources',
    icon: BookOpen,
    route: '/app/ressources',
    items: [
      { label: 'Documents', desc: 'Télécharger des ressources', icon: FileText, to: '/app/ressources' },
      { label: 'Liens utiles', desc: 'Accès rapides', icon: BookOpen, to: '/app/ressources' },
      { label: 'Boutique', desc: 'T-shirts et produits', icon: ShoppingBag, to: '/app/ressources' },
      { label: 'Contacts utiles', desc: 'Joindre l\'équipe', icon: Phone, to: '/app/ressources' },
    ],
  },
  {
    id: 'responsabilites',
    label: 'Responsabilités',
    icon: Briefcase,
    route: '/app/responsabilites',
    items: [
      { label: 'Mes outils actifs', desc: 'Modules assignés', icon: Briefcase, to: '/app/responsabilites' },
      { label: 'FIJ Pilote', desc: 'Gérer mes FIJ', icon: Users, to: '/app/responsabilites/fij-pilote' },
      { label: 'FIJ Coordination', desc: 'Vue réseau', icon: Users, to: '/app/responsabilites/fij-coordination' },
      { label: 'Organisation', desc: 'Vue d\'ensemble', icon: LayoutDashboard, to: '/app/organisation' },
    ],
  },
];

export const MEGA_MENU_RESTRICTED = [
  {
    id: 'supervision',
    label: 'Supervision',
    icon: Shield,
    route: '/app/supervision',
    items: [
      { label: 'Vue globale STAR', desc: 'Indicateurs consolidés', icon: LayoutDashboard, to: '/app/supervision' },
      { label: 'Présences', desc: 'Agrégats et relances', icon: CheckCircle, to: '/app/supervision' },
      { label: 'FIJ', desc: 'Réseau et reporting', icon: Users, to: '/app/supervision' },
      { label: 'Alertes', desc: 'Suivi des points d\'attention', icon: AlertCircle, to: '/app/supervision' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    route: '/app/admin',
    items: [
      { label: 'Utilisateurs', desc: 'Gérer les comptes', icon: Users, to: '/app/admin' },
      { label: 'Programmes EJP', desc: 'Agenda officiel', icon: Calendar, to: '/app/admin' },
      { label: 'Formations', desc: 'Créer modules', icon: GraduationCap, to: '/app/admin' },
      { label: 'Ressources', desc: 'Publier documents', icon: BookOpen, to: '/app/admin' },
    ],
  },
];

// Mobile bottom nav: 4 entries as spec requires
export const MOBILE_BOTTOM_NAV = [
  { path: '/app', label: 'Accueil', icon: Home, end: true },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
  { path: '/app/presences', label: 'Présences', icon: CheckCircle },
];