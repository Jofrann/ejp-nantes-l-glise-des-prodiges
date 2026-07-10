import {
  Home, Calendar, CheckCircle, Sprout, GraduationCap,
  CalendarClock, BookOpen, Briefcase, Shield, Settings,
  Target, NotebookPen, TrendingUp, Clock, AlertCircle,
  FileText, ShoppingBag, Heart, Users, Music, Award,
  BellRing, LayoutDashboard, MapPin, Phone
} from 'lucide-react';

// Mega-menu structure for STAR OS — shared between desktop header and mobile "Plan STAR"
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
    id: 'temps',
    label: 'Mon temps',
    icon: Clock,
    route: '/app/agenda',
    items: [
      { label: 'Agenda visuel', desc: 'Mon calendrier personnel', icon: Calendar, to: '/app/agenda' },
      { label: 'Présences', desc: 'Confirmer ma présence', icon: CheckCircle, to: '/app/presences' },
      { label: 'Absences & retards', desc: 'Justifier une absence', icon: AlertCircle, to: '/app/presences' },
      { label: 'Occupations personnelles', desc: 'Ajouter au calendrier', icon: Clock, to: '/app/agenda' },
    ],
  },
  {
    id: 'croissance',
    label: 'Ma croissance',
    icon: Sprout,
    route: '/app/croissance',
    items: [
      { label: 'Lecture de la Parole', desc: 'Marquer ma lecture du jour', icon: BookOpen, to: '/app/croissance' },
      { label: 'Notes personnelles', desc: 'Méditations et réflexions', icon: NotebookPen, to: '/app/croissance' },
      { label: 'Objectifs', desc: 'Mes buts et étapes', icon: Target, to: '/app/objectifs' },
      { label: 'Livres & habitudes', desc: 'Suivre ma progression', icon: BookOpen, to: '/app/croissance' },
    ],
  },
  {
    id: 'formation',
    label: 'Formation',
    icon: GraduationCap,
    route: '/app/formations',
    items: [
      { label: 'Mes formations', desc: 'Parcours PCNC et modules', icon: GraduationCap, to: '/app/formations' },
      { label: 'PCNC 001', desc: 'Fondations du parcours', icon: BookOpen, to: '/app/formations' },
      { label: 'PCNC 101', desc: 'Approfondissement', icon: BookOpen, to: '/app/formations' },
      { label: 'PCNC 201', desc: 'Maturation', icon: Award, to: '/app/formations' },
    ],
  },
  {
    id: 'accompagnement',
    label: 'Accompagnement',
    icon: Heart,
    route: '/app/rendez-vous',
    items: [
      { label: 'Demander un rendez-vous', desc: 'Bergère, leader, référent', icon: CalendarClock, to: '/app/rendez-vous' },
      { label: 'Mes demandes', desc: 'Suivre mes demandes', icon: FileText, to: '/app/rendez-vous' },
      { label: 'Vie académique', desc: 'Études, stages, orientation', icon: TrendingUp, to: '/app/parcours' },
      { label: 'Mon parcours', desc: 'Situation et compétences', icon: MapPin, to: '/app/parcours' },
    ],
  },
  {
    id: 'ressources',
    label: 'Ressources',
    icon: BookOpen,
    route: '/app/ressources',
    items: [
      { label: 'Liens utiles', desc: 'Accès rapides', icon: BookOpen, to: '/app/ressources' },
      { label: 'Documents', desc: 'Télécharger', icon: FileText, to: '/app/ressources' },
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

export const MOBILE_BOTTOM_NAV = [
  { path: '/app', label: 'Accueil', icon: Home, end: true },
  { path: '/app/agenda', label: 'Agenda', icon: Calendar },
  { path: '/app/presences', label: 'Présences', icon: CheckCircle },
  { path: '/app/formations', label: 'Formation', icon: GraduationCap },
];