import { createHash } from "node:crypto";
import { entities } from "./store.mjs";
import { isAdmin } from "../src/lib/permissions.js";
import { activeMembership, canViewAllEJPData } from "../src/lib/ejpAccess.js";
import { isActiveDepartment } from "../src/lib/departmentState.js";
import {
  isPublicEvent,
  publicEvent,
  parisDate,
  weeklyDates,
  validDay,
  validTime,
} from "../src/lib/calendarPolicy.js";
import { projectAssignments } from "./event-assignments.mjs";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
export const calendarOperations = new Set([
  "getAgendaData",
  "getCalendarManagement",
  "saveCalendarEvent",
  "saveCalendarSchedule",
  "shareStarsMeeting",
]);
const active = (e) => e.is_active !== false && e.publication_status !== "draft";
export async function calendarPublisher(user) {
  if (user?.account_status !== "active" || user.first_login) return false;
  if (isAdmin(user)) return true;
  const com = (
    await entities.Department.filter({ slug: "communication" }, null, 100000)
  ).find(isActiveDepartment);
  return (
    !!com &&
    (
      await entities.DepartmentMember.filter(
        { department_id: com.id, user_id: user.id },
        null,
        100000,
      )
    ).some(activeMembership)
  );
}
export async function calendarSettings() {
  return (
    (await entities.CalendarSchedule.filter({ key: "ejp" }, null, 1))[0] || {
      key: "ejp",
      service_time: "14:30",
      service_end: "",
      fij_time: "",
      fij_end: "",
      stars_time: "06:00",
      stars_end: "06:30",
    }
  );
}
const generatedFields = (key, date, settings) => ({
  title: key === "culte" ? "Prodiges Expérience" : "Rencontre FIJ",
  event_type: key === "culte" ? "culte" : "fij",
  event_date: date,
  event_time: key === "culte" ? settings.service_time : settings.fij_time,
  end_time: key === "culte" ? settings.service_end : settings.fij_end,
  is_public: true,
  publication_status: "published",
  audience: "all_servants",
  presence_mode: "informative",
});
const fingerprint = (e) =>
  JSON.stringify(
    Object.fromEntries(
      [
        "title",
        "event_type",
        "event_date",
        "event_time",
        "end_time",
        "is_public",
        "publication_status",
        "audience",
        "presence_mode",
      ].map((k) => [k, e[k] ?? ""]),
    ),
  );
let ensuring = null;
export async function ensureRecurringCalendar() {
  if (ensuring) return ensuring;
  ensuring = (async () => {
    const today = parisDate(),
      from = new Date(today + "T12:00:00Z"),
      end = new Date(today + "T12:00:00Z");
    from.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 13);
    const settings = await calendarSettings(),
      events = await entities.Event.list(null, 100000);
    for (const [key, day] of [
      ["culte", 0],
      ["fij", 2],
    ])
      for (const date of weeklyDates(
        from.toISOString().slice(0, 10),
        end.toISOString().slice(0, 10),
        day,
      )) {
        const recurrence_key = key + ":" + date;
        const old = events.find((e) => e.recurrence_key === recurrence_key);
        if (old) {
          const fields = generatedFields(key, date, settings);
          if (
            date >= today &&
            old.recurrence_fingerprint === fingerprint(old) &&
            fingerprint(old) !== fingerprint(fields)
          )
            await entities.Event.update(old.id, {
              ...fields,
              recurrence_fingerprint: fingerprint(fields),
            });
          continue;
        }
        const existing = events.find(
          (e) =>
            e.event_date === date &&
            !e.recurrence_key &&
            (key === "culte"
              ? e.event_type === "culte"
              : e.event_type === "fij" ||
                /^rencontre fij$|^fij$/i.test(e.title || "")),
        );
        if (existing) continue;
        const fields = generatedFields(key, date, settings);
        const row = await entities.Event.create({
          ...fields,
          recurrence_key,
          recurrence_fingerprint: fingerprint(fields),
          is_active: true,
        });
        events.push(row);
      }
  })();
  try {
    await ensuring;
  } finally {
    ensuring = null;
  }
}
export async function visibleEvent(e, user) {
  if (isPublicEvent(e)) return true;
  if (
    !user ||
    user.account_status !== "active" ||
    user.first_login ||
    !active(e)
  )
    return false;
  if (isAdmin(user)) return true;
  if (e.audience === "specific")
    return e.target_user_ids?.includes(user.id) === true;
  if (e.audience === "leaders") return canViewAllEJPData(user);
  if (e.audience === "fij_pilots")
    return (await entities.FIJ.list(null, 100000)).some(
      (f) =>
        f.pilot_user_id === user.id || f.co_pilot_user_ids?.includes(user.id),
    );
  return true;
}
export async function readCalendarEvents(user, method, args) {
  await ensureRecurringCalendar();
  if (method === "get") {
    const event = await entities.Event.get(args[0]);
    if (!(await visibleEvent(event, user))) fail(404, "Événement introuvable");
    return publicEvent(event);
  }
  const [query, sort, limit, skip] = method === "filter" ? args : [{}, ...args],
    options = sort && typeof sort === "object" ? sort : {};
  const rows = await entities.Event.filter(
      query || {},
      options.sort ?? (typeof sort === "string" ? sort : undefined),
      100000,
    ),
    allowed = [];
  for (const row of rows)
    if (await visibleEvent(row, user)) allowed.push(publicEvent(row));
  const offset = Math.max(0, Number(options.skip ?? skip ?? 0)),
    take = Math.min(10000, Math.max(0, Number(options.limit ?? limit ?? 1000)));
  return allowed.slice(offset, offset + take);
}
export async function executeCalendarOperation(name, body, user) {
  if (user?.account_status !== "active" || user.first_login)
    fail(403, "Compte actif requis");
  if (name === "getCalendarManagement") {
    if (!(await calendarPublisher(user)))
      fail(403, "Publication réservée à la COM et à l’administration");
    await ensureRecurringCalendar();
    return {
      events: (await entities.Event.list("-event_date", 100000)).filter(
        (e) =>
          isAdmin(user) ||
          !["specific", "leaders", "fij_pilots"].includes(e.audience),
      ),
      settings: await calendarSettings(),
      meetings: (await entities.StarsMeeting.list("-event_date", 100000)).map(
        (m) => ({ id: m.id, event_date: m.event_date, meet_url: m.meet_url }),
      ),
    };
  }
  if (name === "shareStarsMeeting") {
    if (!(await calendarPublisher(user)))
      fail(403, "Publication réservée à la COM et à l’administration");
    if (
      !validDay(body.event_date) ||
      new Date(body.event_date + "T12:00:00Z").getUTCDay() !== 0
    )
      fail(400, "Choisissez un dimanche");
    let url;
    try {
      url = new URL(body.meet_url);
    } catch {
      fail(400, "Lien Meet invalide");
    }
    if (
      url.protocol !== "https:" ||
      url.hostname !== "meet.google.com" ||
      url.username ||
      url.password ||
      !/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url.pathname)
    )
      fail(400, "Utilisez un lien https://meet.google.com valide");
    const old = (
      await entities.StarsMeeting.filter(
        { event_date: body.event_date },
        null,
        1,
      )
    )[0];
    if (old) await entities.StarsMeeting.update(old.id, { meet_url: url.href });
    else
      await entities.StarsMeeting.create({
        event_date: body.event_date,
        meet_url: url.href,
      });
    await syncStarsNotifications();
    return { success: true };
  }
  if (name === "saveCalendarSchedule") {
    if (!(await calendarPublisher(user)))
      fail(403, "Publication réservée à la COM et à l’administration");
    const input = body.settings || {},
      settings = await calendarSettings();
    for (const k of [
      "service_time",
      "service_end",
      "fij_time",
      "fij_end",
      "stars_time",
      "stars_end",
    ])
      if (!validTime(input[k])) fail(400, "Horaire invalide");
    if (!input.service_time) fail(400, "L’heure du culte est requise");
    for (const [start, end] of [
      ["service_time", "service_end"],
      ["fij_time", "fij_end"],
      ["stars_time", "stars_end"],
    ])
      if (input[end] && (!input[start] || input[end] <= input[start]))
        fail(400, "La fin doit suivre le début");
    if (input.stars_time && input.stars_time >= "12:00")
      fail(400, "La prière des stars a lieu le matin");
    const fields = Object.fromEntries(
      [
        "service_time",
        "service_end",
        "fij_time",
        "fij_end",
        "stars_time",
        "stars_end",
      ].map((k) => [k, input[k] || ""]),
    );
    if (settings.id)
      await entities.CalendarSchedule.update(settings.id, fields);
    else await entities.CalendarSchedule.create({ key: "ejp", ...fields });
    for (const event of await entities.Event.list(null, 100000))
      if (
        event.recurrence_key &&
        event.event_date >= parisDate() &&
        event.recurrence_fingerprint === fingerprint(event)
      ) {
        const next = generatedFields(
          event.recurrence_key.split(":")[0],
          event.event_date,
          fields,
        );
        await entities.Event.update(event.id, {
          ...next,
          recurrence_fingerprint: fingerprint(next),
        });
      }
    const config = (await entities.ChurchConfig.list())[0];
    if (config)
      await entities.ChurchConfig.update(config.id, {
        service_day: "Dimanche",
        service_time: fields.service_time,
      });
    await ensureRecurringCalendar();
    return { success: true };
  }
  if (name === "saveCalendarEvent") {
    if (!(await calendarPublisher(user)))
      fail(403, "Publication réservée à la COM et à l’administration");
    const input = body.event || {};
    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      input.title.length > 180 ||
      !validDay(input.event_date) ||
      !validTime(input.event_time) ||
      !validTime(input.end_time)
    )
      fail(400, "Titre, date ou horaire invalide");
    if (
      input.end_time &&
      (!input.event_time || input.end_time <= input.event_time)
    )
      fail(400, "La fin doit suivre le début");
    if (
      !["published", "draft"].includes(input.publication_status) ||
      typeof input.is_public !== "boolean"
    )
      fail(400, "Publication invalide");
    if (
      ![
        "culte",
        "fij",
        "ejp",
        "formation",
        "reunion",
        "service",
        "special",
        "autre",
      ].includes(input.event_type)
    )
      fail(400, "Type invalide");
    if (body.id) {
      const old = await entities.Event.get(body.id);
      if (
        !isAdmin(user) &&
        ["specific", "leaders", "fij_pilots"].includes(old.audience)
      )
        fail(403, "Événement réservé");
    }
    if (!body.id && body.request_id) {
      const prior = (
        await entities.Event.filter(
          { calendar_request_id: body.request_id, created_by_id: user.id },
          null,
          1,
        )
      )[0];
      if (prior) return { event: publicEvent(prior) };
    }
    const fields = {
      title:
        input.event_type === "culte"
          ? "Prodiges Expérience"
          : input.title.trim(),
      description: String(input.description || "").slice(0, 4000),
      event_date: input.event_date,
      event_time: input.event_time || "",
      end_time: input.end_time || "",
      event_type: input.event_type,
      location: String(input.location || "").slice(0, 300),
      is_public: input.is_public,
      publication_status: input.publication_status,
      is_active: input.is_active !== false,
      audience: "all_servants",
      presence_mode: "optional",
    };
    const row = body.id
      ? await entities.Event.update(body.id, fields)
      : await entities.Event.create({
          ...fields,
          created_by_id: user.id,
          calendar_request_id:
            typeof body.request_id === "string"
              ? body.request_id.slice(0, 100)
              : null,
        });
    return { event: publicEvent(row) };
  }
  const from = body.from || parisDate(),
    end = new Date(from + "T12:00:00Z");
  end.setUTCDate(end.getUTCDate() + 62);
  const to = body.to || end.toISOString().slice(0, 10);
  if (
    !validDay(from) ||
    !validDay(to) ||
    to < from ||
    Date.parse(to) - Date.parse(from) > 370 * 86400000
  )
    fail(400, "Période invalide (maximum un an)");
  if (body.department_id) {
    const dept = await entities.Department.get(body.department_id);
    if (!isActiveDepartment(dept)) fail(404, "Département indisponible");
    if (
      !isAdmin(user) &&
      !canViewAllEJPData(user) &&
      !(
        await entities.DepartmentMember.filter(
          { department_id: dept.id, user_id: user.id },
          null,
          100000,
        )
      ).some(activeMembership)
    )
      fail(403, "Accès départemental requis");
  }
  await ensureRecurringCalendar();
  const events = await readCalendarEvents(user, "filter", [
    { event_date: { $gte: from, $lte: to } },
    "event_date",
    10000,
  ]);
  const departments = (await entities.Department.list(null, 100000)).filter(
      isActiveDepartment,
    ),
    memberships = (
      await entities.DepartmentMember.filter({ user_id: user.id }, null, 100000)
    ).filter(activeMembership),
    myIds = new Set(memberships.map((m) => m.department_id)),
    sundays = new Set();
  const projection = await projectAssignments(entities, {
    from,
    to,
    includeUnlinked: true,
  });
  for (const row of projection.assignments) {
    if (
      !myIds.has(row.department_id) ||
      row.user_id !== user.id ||
      ["declined", "replaced", "cancelled"].includes(row.status)
    )
      continue;
    events.push({
      id: "service:" + row.source + ":" + row.source_id,
      title: row.department_name + " · " + row.event_title,
      description: "Votre poste : " + (row.position || "Service"),
      event_type: "service",
      event_date: row.date,
      event_time: row.start_time || "",
      end_time: row.end_time || "",
      is_public: false,
      is_active: true,
      presence_mode: "informative",
      _derived: true,
      _scope: "service",
      parent_event_id: row.event_id,
    });
    if (new Date(row.date + "T12:00:00Z").getUTCDay() === 0)
      sundays.add(row.date);
  }
  const settings = await calendarSettings(),
    meetings = await entities.StarsMeeting.list(null, 100000);
  for (const date of sundays)
    events.push({
      id: "stars:" + user.id + ":" + date,
      title: "Prière des stars",
      description:
        "Temps privé pour les serviteurs programmés ce dimanche. " +
        (!settings.stars_time ? "Dimanche matin : horaire à confirmer." : ""),
      event_date: date,
      event_time: settings.stars_time,
      end_time: settings.stars_end,
      event_type: "service",
      is_public: false,
      is_active: true,
      presence_mode: "informative",
      _derived: true,
      _scope: "prayer",
      meet_url: meetings.find((m) => m.event_date === date)?.meet_url || "",
    });
  return {
    events: events.sort((a, b) =>
      (a.event_date + (a.event_time || "")).localeCompare(
        b.event_date + (b.event_time || ""),
      ),
    ),
    can_publish: await calendarPublisher(user),
  };
}

let notificationRun = null;
export async function syncStarsNotifications() {
  if (notificationRun) return notificationRun;
  notificationRun = deliverStarsNotifications();
  try {
    return await notificationRun;
  } finally {
    notificationRun = null;
  }
}
async function deliverStarsNotifications() {
  const today = parisDate(),
    meetings = (await entities.StarsMeeting.list(null, 100000)).filter(
      (m) => m.event_date >= today,
    ),
    departments = (await entities.Department.list(null, 100000)).filter(
      isActiveDepartment,
    ),
    members = (await entities.DepartmentMember.list(null, 100000)).filter(
      activeMembership,
    ),
    users = await entities.User.list(null, 100000);
  for (const meeting of meetings) {
    const projection = await projectAssignments(entities, {
      from: meeting.event_date,
      to: meeting.event_date,
      includeUnlinked: true,
    });
    const recipients = new Set(
      projection.assignments
        .filter(
          (a) =>
            a.user_id &&
            !["declined", "replaced", "cancelled"].includes(a.status) &&
            members.some(
              (m) =>
                m.user_id === a.user_id && m.department_id === a.department_id,
            ) &&
            users.some(
              (u) => u.id === a.user_id && u.account_status === "active",
            ),
        )
        .map((a) => a.user_id),
    );
    const key = createHash("sha256")
      .update(meeting.id + ":" + meeting.meet_url)
      .digest("hex");
    for (const id of recipients)
      if (
        !(
          await entities.StarNotification.filter(
            { user_id: id, calendar_delivery_key: key },
            null,
            1,
          )
        ).length
      )
        await entities.StarNotification.create({
          user_id: id,
          created_by_id: id,
          title: "Prière des stars · " + meeting.event_date,
          message:
            "Le lien Meet du dimanche de 6h à 6h30 est disponible dans votre agenda privé.",
          body: "Le lien Meet du dimanche de 6h à 6h30 est disponible dans votre agenda privé.",
          link: "/app/agenda?date=" + meeting.event_date,
          action_url: "/app/agenda?date=" + meeting.event_date,
          is_read: false,
          calendar_delivery_key: key,
        });
  }
}
