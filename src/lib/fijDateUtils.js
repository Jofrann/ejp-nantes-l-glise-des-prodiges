/**
 * Helper pour obtenir le jeudi le plus proche (ou un jeudi spécifique).
 */

// Retourne la date du jeudi de la semaine courante
export function getCurrentThursday() {
  const d = new Date();
  const day = d.getDay(); // 0=dim, 4=jeu
  const diff = day === 0 ? -3 : 4 - day; // recule si dimanche
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// Retourne le jeudi précédent
export function getPreviousThursday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -3 : 4 - day;
  d.setDate(d.getDate() + diff - 7);
  return d.toISOString().split('T')[0];
}

// Vérifie si une date est un jeudi
export function isThursday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDay() === 4;
}

// Retourne le jeudi le plus proche d'une date
export function getNearestThursday(dateStr) {
  if (!dateStr) return getCurrentThursday();
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  let diff;
  if (day === 4) diff = 0;
  else if (day < 4) diff = 4 - day;
  else diff = 4 - day + 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// Retourne les N derniers jeudis
export function getLastThursdays(count = 8) {
  const result = [];
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -3 : 4 - day;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < count; i++) {
    result.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() - 7);
  }
  return result;
}