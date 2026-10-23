import { entities, db } from "./store.mjs";
import { projectAssignments } from "./event-assignments.mjs";
import { activeMembership } from "../src/lib/ejpAccess.js";
import { parisDate } from "../src/lib/calendarPolicy.js";
let running;
export async function syncServiceNotifications() {
  if (running) return running;
  running = deliver();
  try {
    return await running;
  } finally {
    running = null;
  }
}
async function deliver() {
  const from = parisDate(),
    members = (await entities.DepartmentMember.list(null, 100000)).filter(
      activeMembership,
    ),
    users = await entities.User.list(null, 100000);
  const projection = await projectAssignments(entities, {
    from,
    includeUnlinked: true,
  });
  const rows = projection.assignments.filter(
    (a) =>
      a.user_id &&
      !["declined", "replaced", "cancelled"].includes(a.status) &&
      members.some(
        (m) => m.user_id === a.user_id && m.department_id === a.department_id,
      ) &&
      users.some((u) => u.id === a.user_id && u.account_status === "active"),
  );
  const old = await entities.ServiceAgendaDelivery.list(null, 100000),
    activeKeys = new Set();
  for (const row of rows) {
    const key = [row.source, row.source_id, row.user_id].join(":");
    activeKeys.add(key);
    const prior = old.find((x) => x.key === key);
    const signature = JSON.stringify([
      row.date,
      row.start_time,
      row.end_time,
      row.position,
      row.event_title,
      row.department_name,
      row.status,
    ]);
    if (prior?.signature === signature && prior.active) continue;
    db.exec("BEGIN IMMEDIATE");
    try {
      await entities.StarNotification.create({
        user_id: row.user_id,
        notification_type: "program",
        title: prior
          ? "Ton service a été mis à jour"
          : "Tu es programmé(e) au service",
        message: `${row.department_name} · ${row.date}${row.start_time ? " à " + row.start_time : ""}. Retrouve les détails dans ton agenda.`,
        link: "/app/agenda?date=" + row.date,
        is_read: false,
      });
      if (prior)
        await entities.ServiceAgendaDelivery.update(prior.id, {
          signature,
          active: true,
          date: row.date,
        });
      else
        await entities.ServiceAgendaDelivery.create({
          key,
          user_id: row.user_id,
          signature,
          active: true,
          date: row.date,
        });
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  for (const prior of old.filter(
    (x) => x.active && x.date >= from && !activeKeys.has(x.key),
  )) {
    db.exec("BEGIN IMMEDIATE");
    try {
      await entities.StarNotification.create({
        user_id: prior.user_id,
        notification_type: "program",
        title: "Une affectation a été retirée",
        message:
          "Une programmation te concernant a changé. Ton agenda a été actualisé.",
        link: "/app/agenda?date=" + prior.date,
        is_read: false,
      });
      await entities.ServiceAgendaDelivery.update(prior.id, { active: false });
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
}
