export const WORKSPACE_PROFILES = {
  "prodiges-musique": {
    subtitle: "Préparer la musique, servir ensemble.",
    steps: ["Préparer les chants", "Répéter", "Servir"],
    tools: [
      "music_planning",
      "music_rehearsals",
      "music_setlists",
      "music_repertoire",
      "music_availability",
    ],
    source: "MusicServicePlan",
    noun: "Services musicaux",
  },
  sono: {
    subtitle: "Un service technique préparé et suivi.",
    steps: ["Préparer", "Vérifier", "Assurer le service"],
    tools: [
      "sound_planning",
      "sound_checklists",
      "sound_equipment",
      "sound_incidents",
      "sound_positions",
    ],
    source: "SoundServicePlan",
    noun: "Services techniques",
  },
  accueil: {
    subtitle: "Accueillir, créer le lien, accompagner la suite.",
    steps: ["Accueillir", "Recontacter", "Intégrer"],
    tools: ["welcome_planning", "welcome_visitors", "welcome_integration"],
    source: "WelcomeServicePlan",
    noun: "Services d’accueil",
  },
  communication: {
    subtitle: "De la demande à la publication.",
    steps: ["Recevoir la demande", "Préparer et valider", "Publier"],
    tools: [],
    source: null,
    noun: "Publications",
  },
  moderation: {
    subtitle: "Un déroulé clair pour chaque rencontre.",
    steps: ["Préparer le déroulé", "Confirmer les annonces", "Conduire"],
    tools: [
      "moderation_planning",
      "moderation_run",
      "moderation_announcements",
    ],
    source: "ModerationServicePlan",
    noun: "Services de modération",
  },
  mpi: {
    subtitle: "Organiser les temps de prière et leur suivi.",
    steps: ["Planifier", "Mobiliser", "Suivre"],
    tools: [
      "prayer_planning",
      "prayer_topics",
      "prayer_requests",
      "prayer_availability",
    ],
    source: "PrayerSchedule",
    noun: "Temps de prière",
  },
  coordination: {
    subtitle: "Relier les équipes, faire avancer les actions.",
    steps: ["Coordonner", "Lever les blocages", "Suivre les décisions"],
    tools: [
      "program_teams",
      "coordination_planning",
      "coordination_followups",
      "coordination_attention",
      "coordination_meetings",
      "coordination_reports",
    ],
    source: "CoordinationPlan",
    noun: "Programmes coordonnés",
  },
  "vie-academique": {
    subtitle: "Organiser l’accompagnement et les rendez-vous.",
    steps: ["Identifier le besoin", "Organiser un échange", "Suivre la suite"],
    tools: [],
    source: null,
    noun: "Accompagnements",
  },
  leaders: {
    subtitle: "Comprendre la situation, décider, accompagner.",
    steps: ["Observer", "Comprendre", "Décider"],
    tools: [],
    source: null,
    noun: "Actions",
  },
};
export const WORK_STATUSES = {
  todo: "À préparer",
  in_progress: "En cours",
  review: "À valider",
  done: "Terminé",
  cancelled: "Annulé",
};
export const WORK_KINDS = {
  task: "Action",
  request: "Demande",
  publication: "Publication",
  appointment: "Rendez-vous",
};
export const profileFor = (slug) =>
  WORKSPACE_PROFILES[slug] || {
    subtitle: "Votre équipe et ses priorités.",
    steps: ["Préparer", "Agir", "Suivre"],
    tools: [],
    source: null,
    noun: "Actions",
  };
