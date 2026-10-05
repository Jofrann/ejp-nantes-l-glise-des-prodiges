/**
 * departmentModules.js — Configuration modulaire centralisée des départements.
 *
 * Principe : UN MOTEUR COMMUN + DES MODULES ACTIVABLES SELON LE DÉPARTEMENT.
 *
 * Lot 3 V1 — Modules réellement implémentés :
 *   - overview  : Aperçu (mission, rôle, référents, infos clés)
 *   - team      : Équipe (membres actifs avec rôles)
 *   - messages  : Actualités (DeptMessage scopé au département)
 *
 * Modules NON implémentés faute de source métier départementale validée :
 *   - meetings  : Event est global, pas scopé par département
 *   - resources : StarResource n'a pas de champ department_id
 *   - objectives: Aucune entité DepartmentObjective validée
 *
 * Cette configuration est extensible : les lots ultérieurs peuvent ajouter
 * des modules spécifiques (communication_requests, editorial_calendar, etc.)
 * sans toucher au moteur.
 */

// Modules réellement implémentés dans le Lot 3 + Lot 4A (Musique) + Lot 4B (Sono) + Lot 4C (MPI) + Lot 4D (Accueil/Modération/Intendance)
export const IMPLEMENTED_MODULES = [
  'overview', 'team', 'messages',
  'music_planning', 'music_rehearsals', 'music_setlists', 'music_repertoire', 'music_availability',
  'sound_planning', 'sound_positions', 'sound_equipment', 'sound_checklists', 'sound_incidents',
  'prayer_planning', 'prayer_topics', 'prayer_requests', 'prayer_availability',
  'welcome_planning', 'welcome_visitors', 'welcome_integration',
  'moderation_planning', 'moderation_run', 'moderation_announcements',
  'logistics_planning', 'logistics_tasks', 'logistics_needs', 'logistics_equipment',
  'coordination_planning', 'coordination_followups', 'coordination_attention', 'coordination_meetings', 'coordination_reports',
];

// Métadonnées d'affichage des modules (labels, icônes Lucide)
export const MODULE_META = {
  overview:           { label: 'Aperçu',      icon: 'LayoutDashboard' },
  team:               { label: 'Équipe',      icon: 'Users' },
  messages:           { label: 'Actualités',   icon: 'MessageCircle' },
  music_planning:     { label: 'Planning',     icon: 'Calendar' },
  music_rehearsals:   { label: 'Répétitions',  icon: 'Music' },
  music_setlists:     { label: 'Setlists',     icon: 'ListMusic' },
  music_repertoire:   { label: 'Répertoire',   icon: 'Library' },
  music_availability:  { label: 'Disponibilités', icon: 'CalendarCheck' },
  sound_planning:     { label: 'Planning',     icon: 'Calendar' },
  sound_positions:    { label: 'Postes',       icon: 'SlidersHorizontal' },
  sound_equipment:    { label: 'Matériel',     icon: 'Package' },
  sound_checklists:   { label: 'Checklists',   icon: 'ListChecks' },
  sound_incidents:    { label: 'Incidents',     icon: 'AlertTriangle' },
  prayer_planning:    { label: 'Planning',      icon: 'Calendar' },
  prayer_topics:      { label: 'Sujets',        icon: 'Sparkles' },
  prayer_requests:    { label: 'Demandes',      icon: 'Lock' },
  prayer_availability:{ label: 'Disponibilités', icon: 'CalendarCheck' },
  welcome_planning:     { label: 'Planning',      icon: 'Calendar' },
  welcome_visitors:     { label: 'Visiteurs',     icon: 'UserCheck' },
  welcome_integration:  { label: 'Intégration',   icon: 'Heart' },
  moderation_planning:    { label: 'Planning',    icon: 'Calendar' },
  moderation_run:         { label: 'Conducteurs', icon: 'ListChecks' },
  moderation_announcements:{ label: 'Annonces',  icon: 'Megaphone' },
  logistics_planning:  { label: 'Planning',  icon: 'Calendar' },
  logistics_tasks:     { label: 'Tâches',    icon: 'ListChecks' },
  logistics_needs:     { label: 'Besoins',   icon: 'Package' },
  logistics_equipment: { label: 'Matériel',  icon: 'Package' },
  coordination_planning:  { label: 'Planning',  icon: 'Calendar' },
  coordination_followups:{ label: 'Suivis',    icon: 'ListChecks' },
  coordination_attention:{ label: 'Points d\'attention', icon: 'AlertTriangle' },
  coordination_meetings: { label: 'Réunions',  icon: 'Users' },
  coordination_reports:  { label: 'Rapports',  icon: 'FileText' },
  // Modules non implémentés (documentés pour référence future)
  meetings:  { label: 'Réunions',  icon: 'Calendar' },
  resources: { label: 'Ressources', icon: 'FileText' },
  objectives:{ label: 'Objectifs', icon: 'Target' },
};

// Modules communs à tous les départements (Lot 3 V1)
const DEFAULT_MODULES = ['overview', 'team', 'messages'];

// Overrides par slug de département (extensible pour les lots futurs)
// Si un slug n'est pas listé, il utilise DEFAULT_MODULES.
const DEPARTMENT_OVERRIDES = {
  'prodiges-musique': [
    'overview',
    'music_planning',
    'music_rehearsals',
    'music_setlists',
    'music_repertoire',
    'music_availability',
    'team',
    'messages',
  ],
  'sono': [
    'overview',
    'sound_planning',
    'sound_positions',
    'sound_equipment',
    'sound_checklists',
    'sound_incidents',
    'team',
    'messages',
  ],
  'mpi': [
    'overview',
    'prayer_planning',
    'prayer_topics',
    'prayer_requests',
    'prayer_availability',
    'team',
    'messages',
  ],
  'accueil': [
    'overview',
    'welcome_planning',
    'welcome_visitors',
    'welcome_integration',
    'team',
    'messages',
  ],
  'moderation': [
    'overview',
    'moderation_planning',
    'moderation_run',
    'moderation_announcements',
    'team',
    'messages',
  ],
  'intendance': [
    'overview',
    'logistics_planning',
    'logistics_tasks',
    'logistics_needs',
    'logistics_equipment',
    'team',
    'messages',
  ],
  'coordination': [
    'overview',
    'coordination_planning',
    'coordination_followups',
    'coordination_attention',
    'coordination_meetings',
    'coordination_reports',
    'team',
    'messages',
  ],
};

// Départements qui redirigent vers un espace spécialisé au lieu d'une page départementale générique.
// Ces départements ont une application métier dédiée (FIJ).
const DEPARTMENT_REDIRECTS = {
  'pilote-fij':      '/app/responsabilites/fij-pilote',
};

// Départements masqués de la liste "Mes Services" car ils sont gérés
// via les responsabilités spécialisées (Pilote FIJ via FIJ.pilot_user_id,
// Coordination FIJ via DepartmentMember → coordination-fij).
const HIDDEN_FROM_SERVICE = ['pilote-fij'];

// Départements qui ont un lien vers un espace métier spécialisé dans leur page générique.
// La page départementale s'affiche normalement, mais un lien vers l'espace métier est ajouté.
const SPECIALIZED_SPACE_LINK = {
  'fij': {
    to: '/app/responsabilites',
    label: 'Espace FIJ',
    description: 'Outils opérationnels FIJ (registre, CR, membres, assiduité)',
  },
  'coordination-fij': {
    to: '/app/responsabilites/fij-coordination',
    label: 'Espace Coordination FIJ',
    description: 'Outils spécialisés (registre, CR, relances, reporting)',
  },
};

/**
 * Retourne la liste des modules activés pour un département (filtrés par IMPLEMENTED_MODULES).
 */
export function getEnabledModules(deptSlug) {
  const configured = DEPARTMENT_OVERRIDES[deptSlug] || DEFAULT_MODULES;
  return configured.filter(m => IMPLEMENTED_MODULES.includes(m));
}

/**
 * Retourne l'URL de redirection si le département doit rediriger vers un espace spécialisé.
 * Retourne null si le département doit afficher sa page générique.
 */
export function getRedirectForSlug(deptSlug) {
  return DEPARTMENT_REDIRECTS[deptSlug] || null;
}

/**
 * Retourne true si le département ne doit pas apparaître dans "Mes Services".
 */
export function isHiddenFromService(deptSlug) {
  return HIDDEN_FROM_SERVICE.includes(deptSlug);
}

/**
 * Retourne les informations du lien vers l'espace spécialisé pour un département.
 * Retourne null si le département n'a pas d'espace spécialisé.
 */
export function getSpecializedSpaceLink(deptSlug) {
  return SPECIALIZED_SPACE_LINK[deptSlug] || null;
}

/**
 * Documentation des modules non implémentés (pour le rapport).
 */
export const NOT_IMPLEMENTED_MODULES = {
  meetings: 'Aucune source de réunions départementales validée — Event est global, pas scopé par département.',
  resources: 'StarResource n\'est pas scopée par département (pas de champ department_id).',
  objectives: 'Aucune entité DepartmentObjective validée — les objectifs actuels sont personnels (PersonalGoal), pas départementaux.',
};