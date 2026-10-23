import { entities } from "./store.mjs";
import {
  activeMembership,
  departmentManager,
  canViewAllEJPData,
} from "../src/lib/ejpAccess.js";
import { isAdmin } from "../src/lib/permissions.js";
import { isActiveDepartment } from "../src/lib/departmentState.js";
import { findOfficialStructure } from "../src/lib/officialStructures.js";
import {
  profileFor,
  WORK_STATUSES,
  WORK_KINDS,
} from "../src/lib/workspaceProfiles.js";
import { dashboardModel } from "../src/lib/fijAnalytics.js";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const all = (name) => entities[name].list(null, 100000);
const today = () =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(
    new Date(),
  );
const open = (r) => !["done", "cancelled"].includes(r.status);
const short = (row) => ({
  id: row.id,
  title: row.title,
  status: row.status,
  kind: row.kind,
  due_date: row.due_date || "",
  assigned_to: row.assigned_to || "",
  created_date: row.created_date,
  updated_date: row.updated_date,
});
export const workspaceOperationNames = new Set([
  "getDepartmentWorkspace",
  "saveDepartmentWorkItem",
  "getChurchOverview",
]);
export async function executeWorkspaceOperation(name, body, user) {
  if (user?.account_status !== "active" || user.first_login)
    fail(403, "Compte actif requis");
  if (name === "getChurchOverview") {
    if (!canViewAllEJPData(user))
      fail(403, "Habilitation de lecture globale requise");
    return churchOverview();
  }
  const department = await entities.Department.get(body.department_id).catch(
    () => null,
  );
  if (!department || !isActiveDepartment(department))
    fail(404, "Département indisponible");
  const memberships = (
    await entities.DepartmentMember.filter(
      { department_id: department.id },
      null,
      100000,
    )
  ).filter(activeMembership);
  const manager =
    isAdmin(user) || departmentManager(user, department.id, memberships);
  const member = memberships.some((m) => m.user_id === user.id);
  if (!manager && !member && !canViewAllEJPData(user))
    fail(403, "Accès réservé à ce département");
  const rows = await entities.DepartmentWorkItem.filter(
    { department_id: department.id },
    "-created_date",
    100000,
  );
  if (name === "saveDepartmentWorkItem") {
    const old = body.id ? rows.find((r) => r.id === body.id) : null;
    if (body.id && !old) fail(403, "Action hors département");
    if (!manager)
      fail(403, "Modification réservée au responsable du département");
    if (old && body.expected_updated_date !== old.updated_date)
      fail(409, "Cette action a changé. Actualisez avant de réessayer.");
    const input = body.item || {};
    if (!old && body.request_id && typeof body.request_id === "string") {
      const prior = rows.find(
        (r) => r.request_id === body.request_id && r.created_by_id === user.id,
      );
      if (prior) return { item: short(prior) };
    }
    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.length > 180
    )
      fail(400, "Un titre de 1 à 180 caractères est requis");
    if (
      !Object.hasOwn(WORK_STATUSES, input.status) ||
      !Object.hasOwn(WORK_KINDS, input.kind)
    )
      fail(400, "Type ou statut invalide");
    if (
      input.due_date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(input.due_date) ||
        Number.isNaN(Date.parse(input.due_date + "T12:00:00Z")) ||
        new Date(input.due_date + "T12:00:00Z").toISOString().slice(0, 10) !==
          input.due_date)
    )
      fail(400, "Échéance invalide");
    if (
      input.assigned_to &&
      !memberships.some((m) => m.user_id === input.assigned_to)
    )
      fail(400, "Le responsable doit appartenir à ce département");
    const item = {
      department_id: department.id,
      title: input.title.trim(),
      kind: input.kind,
      status: input.status,
      due_date: input.due_date || "",
      assigned_to: input.assigned_to || "",
    };
    const saved = old
      ? await entities.DepartmentWorkItem.update(old.id, item)
      : await entities.DepartmentWorkItem.create({
          ...item,
          created_by_id: user.id,
          request_id:
            typeof body.request_id === "string"
              ? body.request_id.slice(0, 100)
              : null,
        });
    return { item: short(saved) };
  }
  const canonical = findOfficialStructure(department)?.slug || department.slug,
    profile = profileFor(canonical);
  const plans = profile.source
    ? await entities[profile.source].filter(
        { department_id: department.id },
        "date",
        100000,
      )
    : [];
  const visitors =
    canonical === "accueil"
      ? await entities.VisitorContact.filter(
          { department_id: department.id },
          null,
          100000,
        )
      : [];
  const incidents =
    canonical === "sono"
      ? await entities.SoundIncident.filter(
          { department_id: department.id },
          null,
          100000,
        )
      : [];
  const users = memberships.length
    ? await entities.User.filter(
        { id: { $in: memberships.map((m) => m.user_id) } },
        null,
        100000,
      )
    : [];
  const activePlans = plans.filter(
    (p) => !["cancelled", "completed"].includes(p.status),
  );
  const date = today();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(date + "T12:00:00Z");
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 5 + i);
    const key = d.toISOString().slice(0, 7);
    return {
      key,
      label: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }),
      count: profile.source
        ? plans.filter(
            (p) => p.date?.startsWith(key) && p.status !== "cancelled",
          ).length
        : rows.filter(
            (r) =>
              (canonical !== "communication" || r.kind === "publication") &&
              r.status === "done" &&
              (r.due_date || r.updated_date)?.startsWith(key),
          ).length,
    };
  });
  return {
    department_id: department.id,
    canonical,
    can_manage: manager,
    items: rows.map(short),
    team: users.map((u) => ({
      id: u.id,
      name:
        u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" "),
    })),
    summary: {
      active_members: new Set(memberships.map((m) => m.user_id)).size,
      open: rows.filter(open).length,
      overdue: rows.filter((r) => open(r) && r.due_date && r.due_date < date)
        .length,
      completed: rows.filter((r) => r.status === "done").length,
      planned: activePlans.filter((p) => p.date >= date).length,
      visitors_to_contact: visitors.filter((v) =>
        ["new", "contacted", "in_progress"].includes(v.status),
      ).length,
      incidents: incidents.filter(
        (r) => !["resolved", "closed"].includes(r.status),
      ).length,
    },
    next_kind: profile.source ? "plan" : "action",
    next: profile.source
      ? activePlans
          .filter((p) => p.date >= date)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            title: p.title || p.name || "Service",
            date: p.date,
          }))
      : rows
          .filter((r) => open(r) && r.due_date)
          .sort((a, b) => a.due_date.localeCompare(b.due_date))
          .slice(0, 3)
          .map((r) => ({ id: r.id, title: r.title, date: r.due_date })),
    trend: months,
    generated_at: new Date().toISOString(),
  };
}
async function churchOverview() {
  const [
    departments,
    memberships,
    users,
    events,
    attendance,
    items,
    visitors,
    fijs,
    fijMembers,
    thursday,
    weekly,
    entries,
  ] = await Promise.all(
    [
      "Department",
      "DepartmentMember",
      "User",
      "Event",
      "AttendanceResponse",
      "DepartmentWorkItem",
      "VisitorContact",
      "FIJ",
      "FijMember",
      "FijThursdayReport",
      "FijWeeklyReport",
      "FijAttendanceEntry",
    ].map(all),
  );
  const active = departments.filter(isActiveDepartment),
    ids = new Set(active.map((d) => d.id));
  const team = memberships.filter(
    (m) => activeMembership(m) && ids.has(m.department_id),
  );
  const date = today(),
    past = events
      .map((e) => ({ ...e, date: e.event_date || e.date }))
      .filter((e) => e.date && e.date < date && e.status !== "cancelled")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12)
      .reverse();
  const trend = past.map((e) => {
    const rows = attendance.filter(
      (r) => r.event_id === e.id && (r.user_id || r.created_by_id),
    );
    const unique = [
      ...new Map(
        rows
          .sort((a, b) =>
            String(b.updated_date || b.created_date).localeCompare(
              String(a.updated_date || a.created_date),
            ),
          )
          .map((r) => [r.user_id || r.created_by_id, r])
          .reverse(),
      ).values(),
    ];
    const recorded = unique.filter((r) =>
      ["present", "late", "absent", "excused", "absent_justified"].includes(
        r.status,
      ),
    );
    return {
      id: e.id,
      label: new Date(e.date + "T12:00:00Z").toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
      date: e.date,
      title: e.title || e.name,
      participants: recorded.length
        ? recorded.filter((r) => ["present", "late"].includes(r.status)).length
        : null,
      recorded: recorded.length,
    };
  });
  const [incidents, followups, prayers, appointments] = await Promise.all(
    [
      "SoundIncident",
      "CoordinationFollowUp",
      "PrayerRequest",
      "AppointmentRequest",
    ].map(all),
  );
  const plannedByDept = await Promise.all(
    active.map(async (department) => {
      const profile = profileFor(
        findOfficialStructure(department)?.slug || department.slug,
      );
      if (!profile.source) return [department.id, null];
      const plans = await entities[profile.source].filter(
        { department_id: department.id },
        null,
        100000,
      );
      return [
        department.id,
        plans.filter(
          (p) =>
            p.date >= date && !["completed", "cancelled"].includes(p.status),
        ).length,
      ];
    }),
  );
  const planned = new Map(plannedByDept);
  const fij = dashboardModel({
    fijs,
    members: fijMembers,
    thursday,
    weekly,
    entries,
    weeks: 8,
  });
  return {
    generated_at: new Date().toISOString(),
    summary: {
      departments: active.length,
      servants: new Set(team.map((m) => m.user_id)).size,
      accounts: users.filter((u) => u.account_status === "active").length,
      actions: items.filter((r) => ids.has(r.department_id) && open(r)).length,
      visitors_to_contact: visitors.filter(
        (v) =>
          ids.has(v.department_id) &&
          ["new", "contacted", "in_progress"].includes(v.status),
      ).length,
    },
    trend,
    operations: {
      incidents: incidents.filter(
        (r) =>
          ids.has(r.department_id) &&
          !["resolved", "closed"].includes(r.status),
      ).length,
      coordination: followups.filter(
        (r) =>
          ids.has(r.department_id) && !["done", "cancelled"].includes(r.status),
      ).length,
      prayer: prayers.filter(
        (r) =>
          ids.has(r.department_id) &&
          ["new", "active", "follow_up"].includes(r.status),
      ).length,
      appointments: appointments.filter((r) => r.status === "pending").length,
    },
    departments: active.map((d) => ({
      planned: planned.get(d.id),
      id: d.id,
      slug: d.slug,
      name: d.name,
      members: new Set(
        team.filter((m) => m.department_id === d.id).map((m) => m.user_id),
      ).size,
      open: items.filter((r) => r.department_id === d.id && open(r)).length,
      overdue: items.filter(
        (r) =>
          r.department_id === d.id &&
          open(r) &&
          r.due_date &&
          r.due_date < date,
      ).length,
    })),
    fij: {
      active: fij.activeFijs.length,
      members: fij.members.length,
      participants: fij.latest.participants,
      attendance: fij.latest.attendance,
      missing: fij.missing.length,
      trend: fij.points.map((p) => ({
        label: p.label,
        participants: p.participants,
      })),
      note: "Membres FIJ et comptes utilisateurs sont deux populations distinctes. Ne pas les additionner.",
    },
    coverage: {
      events: trend.length,
      reported: trend.filter((p) => p.recorded > 0).length,
    },
    note: "Présences enregistrées par événement ; aucune estimation de la fréquentation totale. Personnes dédupliquées par compte et événement. Les notes de prière, de suivi et les dossiers académiques ne sont pas inclus.",
  };
}
