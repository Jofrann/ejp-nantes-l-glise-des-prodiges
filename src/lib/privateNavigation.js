// Navigation groups do not grant access: route/server guards remain authoritative.
export const PRIVATE_TABS = [
  { path: '/app', label: 'Bureau', icon: 'Home', id: 'bureau' },
  { path: '/app/agenda', label: 'Agenda', icon: 'Calendar', id: 'agenda' },
  { path: '/app/service', label: 'Service', icon: 'Briefcase', id: 'service' },
  { path: '/app/formations', label: 'Parcours', icon: 'GraduationCap', id: 'parcours' },
];
export function privateSection(pathname) {
  if (/^\/app\/(agenda|presences|rendez-vous)(?:\/|$)/.test(pathname)) return 'agenda';
  if (/^\/app\/(service|departements|responsabilites|organisation|equipe|fij)(?:\/|$)/.test(pathname)) return 'service';
  if (/^\/app\/(formations|croissance|objectifs|parcours|etudiant)(?:\/|$)/.test(pathname)) return 'parcours';
  return 'bureau';
}
export const PRIVATE_CONTEXT = {
 agenda: [['/app/agenda','Calendrier'],['/app/presences','Présences'],['/app/rendez-vous','Rendez-vous']],
 service: [['/app/service','Mes engagements'],['/app/responsabilites','Tous mes accès'],['/app/organisation','Organisation'],['/app/ressources','Ressources']],
 parcours: [['/app/formations','Formations'],['/app/croissance','Croissance'],['/app/objectifs','Objectifs'],['/app/parcours','Mon chemin']],
};
export function uniqueDestinations(groups) {
 const byDestination = new Map();
 const result = groups.map(group => ({...group, items: group.items.flatMap(item => {
   const existing = byDestination.get(item.to);
   if (existing) { existing.searchTerms += ' ' + item.label + ' ' + item.desc; return []; }
   const entry = {...item, searchTerms: item.label + ' ' + item.desc};
   byDestination.set(item.to, entry); return [entry];
 })}));
 return result.filter(group => group.items.length);
}
