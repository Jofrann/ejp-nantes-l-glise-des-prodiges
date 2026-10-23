import { entities, db } from "./store.mjs";
import { readCalendarEvents, visibleEvent } from "./calendar.mjs";
import { validDay, validTime } from "../src/lib/calendarPolicy.js";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
export const attendanceOperations = new Set([
  "getAttendancePeriod",
  "saveAttendancePeriod",
]);
export async function executeAttendance(name, body, user) {
  if (user?.account_status !== "active" || user.first_login)
    fail(403, "Compte actif requis");
  const { from, to } = body;
  if (
    !validDay(from) ||
    !validDay(to) ||
    to < from ||
    Date.parse(to) - Date.parse(from) > 62 * 86400000
  )
    fail(400, "Période invalide (deux mois maximum)");
  const events = await readCalendarEvents(user, "filter", [
    { event_date: { $gte: from, $lte: to } },
    "event_date",
    10000,
  ]);
  events.sort(
    (a, b) =>
      (a.event_date + (a.event_time || "99:99")).localeCompare(
        b.event_date + (b.event_time || "99:99"),
      ) || a.title.localeCompare(b.title, "fr"),
  );
  const own = (
    await entities.AttendanceResponse.filter(
      { created_by_id: user.id },
      "-updated_date",
      100000,
    )
  )
    .concat(
      await entities.AttendanceResponse.filter(
        { user_id: user.id },
        "-updated_date",
        100000,
      ),
    )
    .filter((row) => (row.user_id || row.created_by_id) === user.id);
  if (name === "getAttendancePeriod")
    return {
      events,
      responses: [
        ...new Map(
          own
            .filter((r) => events.some((e) => e.id === r.event_id))
            .map((r) => [r.id, r]),
        ).values(),
      ],
    };
  if (
    !Array.isArray(body.responses) ||
    body.responses.length > 1000 ||
    new Set(body.responses.map((r) => r.event_id)).size !==
      body.responses.length
  )
    fail(400, "Présences invalides");
  const rows = [];
  for (const r of body.responses) {
    const e = events.find((e) => e.id === r.event_id);
    if (!e || !(await visibleEvent(e, user)))
      fail(403, "Événement hors de la période ou non accessible");
    if (!["present", "absent", "late", "no_response"].includes(r.status))
      fail(400, "Statut de présence invalide");
    if (
      r.status === "late" &&
      r.estimated_arrival_time &&
      !validTime(r.estimated_arrival_time)
    )
      fail(400, "Heure d’arrivée invalide");
    if (
      r.reason_category &&
      ![
        "travail",
        "etudes",
        "sante",
        "famille",
        "deplacement",
        "service_ailleurs",
        "autre",
      ].includes(r.reason_category)
    )
      fail(400, "Motif invalide");
    rows.push({
      event_id: e.id,
      event_title: e.title,
      event_date: e.event_date,
      user_id: user.id,
      created_by_id: user.id,
      status: r.status,
      reason_category: r.status === "absent" ? r.reason_category || null : null,
      estimated_arrival_time:
        r.status === "late" ? r.estimated_arrival_time || null : null,
      comment: String(r.comment || "").slice(0, 1000),
    });
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const row of rows) {
      const existing = own
        .filter((r) => r.event_id === row.event_id)
        .sort((a, b) => b.updated_date.localeCompare(a.updated_date))[0];
      if (existing) await entities.AttendanceResponse.update(existing.id, row);
      else await entities.AttendanceResponse.create(row);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { saved: rows.length };
}
