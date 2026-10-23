// The service takes place in Nantes even when the visitor uses another time zone.
const weekdays = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];
const paris = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
function parts(date) {
  return Object.fromEntries(
    paris
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}
function parisInstant(year, month, day, hour, minute) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let instant = wall;
  for (let i = 0; i < 4; i++) {
    const p = parts(new Date(instant));
    const delta =
      wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    instant += delta;
    if (!delta) break;
  }
  return new Date(instant);
}
export function getNextService(config = {}, now = new Date()) {
  const dayIndex = weekdays.indexOf(
    String(config.service_day || "Dimanche")
      .trim()
      .toLocaleLowerCase("fr"),
  );
  const [hour, minute] = /^([01]\d|2[0-3]):[0-5]\d$/.test(
    config.service_time || "",
  )
    ? config.service_time.split(":").map(Number)
    : [14, 30];
  const p = parts(now);
  const calendar = new Date(Date.UTC(p.year, p.month - 1, p.day));
  const ahead = ((dayIndex < 0 ? 0 : dayIndex) - calendar.getUTCDay() + 7) % 7;
  calendar.setUTCDate(calendar.getUTCDate() + ahead);
  let next = parisInstant(
    calendar.getUTCFullYear(),
    calendar.getUTCMonth() + 1,
    calendar.getUTCDate(),
    hour,
    minute,
  );
  if (next <= now) {
    calendar.setUTCDate(calendar.getUTCDate() + 7);
    next = parisInstant(
      calendar.getUTCFullYear(),
      calendar.getUTCMonth() + 1,
      calendar.getUTCDate(),
      hour,
      minute,
    );
  }
  return next;
}
