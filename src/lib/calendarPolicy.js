export const parisDate = (now = new Date()) =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(now);
export const isPublicEvent = (e) =>
  !!e &&
  e.is_active !== false &&
  e.publication_status !== "draft" &&
  e.is_public !== false &&
  (e.is_public === true ||
    !["specific", "leaders", "fij_pilots"].includes(e.audience));
export const eventFields = [
  "id",
  "title",
  "description",
  "event_type",
  "event_date",
  "event_time",
  "end_time",
  "location",
  "image_url",
  "is_featured",
  "is_active",
  "presence_mode",
  "audience",
  "is_public",
  "publication_status",
  "recurrence_key",
  "meet_url",
];
export const publicEvent = (e) =>
  Object.fromEntries(
    eventFields.filter((k) => Object.hasOwn(e, k)).map((k) => [k, e[k]]),
  );
export function weeklyDates(from, to, weekday) {
  const dates = [];
  for (
    let d = new Date(from + "T12:00:00Z");
    d.toISOString().slice(0, 10) <= to;
    d.setUTCDate(d.getUTCDate() + 1)
  )
    if (d.getUTCDay() === weekday) dates.push(d.toISOString().slice(0, 10));
  return dates;
}
export function validDay(day) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day || "") &&
    !Number.isNaN(Date.parse(day + "T12:00:00Z")) &&
    new Date(day + "T12:00:00Z").toISOString().slice(0, 10) === day
  );
}
export const validTime = (t) => !t || /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
