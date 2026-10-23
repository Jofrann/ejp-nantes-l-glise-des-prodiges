import { visibleEvent, readCalendarEvents } from "./calendar.mjs";
import { entities, db } from "./store.mjs";
import { isAdmin } from "../src/lib/permissions.js";
import { activeMembership, departmentManager } from "../src/lib/ejpAccess.js";
import { isActiveDepartment } from "../src/lib/departmentState.js";
import { validDay, validTime, parisDate } from "../src/lib/calendarPolicy.js";
import { syncServiceNotifications } from "./service-notifications.mjs";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
export const programmingOperations = new Set([
  "getDepartmentProgramming",
  "saveDepartmentProgramming",
]);
export async function executeProgramming(name, body, user) {
  if (user?.account_status !== "active" || user.first_login)
    fail(403, "Compte actif requis");
  const department = await entities.Department.get(body.department_id).catch(
    () => null,
  );
  if (!isActiveDepartment(department)) fail(404, "Département indisponible");
  const members = (
    await entities.DepartmentMember.filter(
      { department_id: department.id },
      null,
      100000,
    )
  ).filter(activeMembership);
  const manager =
    isAdmin(user) || departmentManager(user, department.id, members);
  if (!manager && !members.some((m) => m.user_id === user.id))
    fail(403, "Accès réservé à ce département");
  const users = (await entities.User.list(null, 100000)).filter(
    (u) =>
      u.account_status === "active" && members.some((m) => m.user_id === u.id),
  );
  const plans = await entities.ServiceProgram.filter(
    { department_id: department.id },
    "date",
    100000,
  );
  const assignments = await entities.ServiceAssignment.filter(
    { department_id: department.id },
    null,
    100000,
  );
  if (name === "getDepartmentProgramming")
    return {
      events: await readCalendarEvents(user, "filter", [
        { is_active: true },
        "event_date",
        10000,
      ]),
      can_manage: manager,
      members: users.map((u) => ({
        id: u.id,
        full_name:
          u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" "),
      })),
      plans,
      assignments,
    };
  if (!manager)
    fail(403, "Programmation réservée au responsable du département");
  const input = body.program || {},
    old = body.id ? plans.find((p) => p.id === body.id) : null;
  if (body.id && !old) fail(403, "Programmation hors département");
  if (old && old.updated_date !== body.expected_updated_date)
    fail(409, "Cette programmation a changé. Actualise avant de réessayer.");
  if (
    !input.title?.trim() ||
    input.title.length > 180 ||
    !validDay(input.date) ||
    !validTime(input.start_time) ||
    !validTime(input.end_time)
  )
    fail(400, "Titre, date ou horaires invalides");
  if (
    input.end_time &&
    (!input.start_time || input.end_time <= input.start_time)
  )
    fail(400, "La fin doit suivre le début");
  if (!["planned", "cancelled"].includes(input.status))
    fail(400, "Statut invalide");
  if (input.event_id) {
    const event = await entities.Event.get(input.event_id).catch(() => null);
    if (
      !event ||
      event.event_date !== input.date ||
      event.is_active === false ||
      !(await visibleEvent(event, user))
    )
      fail(400, "Choisis un événement actif de la même date");
  }
  const selected = body.assignments;
  if (!Array.isArray(selected) || selected.length > members.length + 100)
    fail(400, "Affectations invalides");
  if (new Set(selected.map((a) => a.user_id)).size !== selected.length)
    fail(
      400,
      "Un serviteur ne peut apparaître deux fois dans cette programmation",
    );
  for (const a of selected) {
    if (!users.some((u) => u.id === a.user_id))
      fail(403, "Choisis uniquement les serviteurs actifs de ce département");
    if (typeof a.position !== "string" || a.position.length > 120)
      fail(400, "Poste invalide");
  }
  if (!old && body.request_id) {
    const prior = plans.find(
      (p) => p.request_id === body.request_id && p.created_by_id === user.id,
    );
    if (prior) return { program: prior };
  }
  db.exec("BEGIN IMMEDIATE");
  let plan;
  try {
    const fields = {
      department_id: department.id,
      title: input.title.trim(),
      date: input.date,
      start_time: input.start_time || "",
      end_time: input.end_time || "",
      event_id: input.event_id || null,
      status: input.status,
    };
    plan = old
      ? await entities.ServiceProgram.update(old.id, fields)
      : await entities.ServiceProgram.create({
          ...fields,
          request_id: String(body.request_id || "").slice(0, 100),
          created_by_id: user.id,
        });
    const prior = assignments.filter((a) => a.service_plan_id === plan.id);
    for (const a of prior)
      if (
        !selected.some((x) => x.user_id === a.user_id) &&
        a.status !== "replaced"
      )
        await entities.ServiceAssignment.update(a.id, { status: "replaced" });
    for (const a of selected) {
      const existing = prior.find((x) => x.user_id === a.user_id);
      const same =
        existing &&
        existing.position === a.position &&
        !["replaced", "cancelled"].includes(existing.status);
      const fields = {
        department_id: department.id,
        service_plan_id: plan.id,
        user_id: a.user_id,
        full_name: users.find((u) => u.id === a.user_id).full_name || "",
        position: a.position.trim() || "Service",
        status: same ? existing.status : "assigned",
      };
      if (existing)
        await entities.ServiceAssignment.update(existing.id, fields);
      else await entities.ServiceAssignment.create(fields);
    }
    await entities.AuditLog.create({
      action: "department_programming_saved",
      entity_type: "ServiceProgram",
      entity_id: plan.id,
      performed_by_id: user.id,
    });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  let notification_pending = false;
  try {
    await syncServiceNotifications();
  } catch (error) {
    notification_pending = true;
    console.error("Notification de programmation à réessayer", error.message);
  }
  return { program: plan, notification_pending };
}
