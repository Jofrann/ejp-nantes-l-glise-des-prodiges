// Read models only. No writes, inferred spiritual scores or invented history.
export const reportFij = (r) => r.fij_id || r.fij_house_id;
export const reportDate = (r) =>
  r.thursday_date || r.meeting_date || r.week_start;
export function weekKey(value) {
  if (!value) return null;
  const d = new Date(String(value).slice(0, 10) + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function weeklyReports(thursday = [], weekly = [], ids = []) {
  const selected = new Map();
  const valid = new Set(["submitted", "validated", "late"]);
  // A submitted attendance report owns the attendance figures for its FIJ/week.
  for (const r of [...weekly, ...thursday]) {
    const date = reportDate(r),
      week = weekKey(date),
      fij = reportFij(r);
    if (!week || !ids.includes(fij) || !valid.has(r.status)) continue;
    const key = fij + ":" + week;
    const old = selected.get(key);
    const isThursday = !!r.thursday_date;
    if (
      !old ||
      (isThursday && !old.thursday_date) ||
      (isThursday === !!old.thursday_date &&
        String(r.updated_date || r.submitted_at || r.created_date || r.id) >
          String(
            old.updated_date || old.submitted_at || old.created_date || old.id,
          ))
    ) {
      selected.set(key, {
        ...r,
        visitors: r.new_visitors_count ?? old?.visitors ?? null,
      });
    } else if (old.visitors == null && r.new_visitors_count != null)
      old.visitors = r.new_visitors_count;
  }
  return [...selected.values()];
}
export function attendanceSummary(entries = []) {
  const unique = new Map();
  for (const e of entries) {
    if (typeof e.present !== "boolean") continue;
    const key = (e.report_id || e.thursday_date) + ":" + e.member_id;
    unique.set(key, e);
  }
  const rows = [...unique.values()].sort((a, b) =>
    String(b.thursday_date).localeCompare(String(a.thursday_date)),
  );
  let consecutive = 0;
  for (const e of rows) {
    if (e.present) break;
    consecutive++;
  }
  const present = rows.filter((e) => e.present).length;
  return {
    rows,
    present,
    total: rows.length,
    rate: rows.length ? Math.round((present / rows.length) * 100) : null,
    consecutive,
  };
}
export function dashboardModel({
  fijs = [],
  members = [],
  thursday = [],
  weekly = [],
  entries = [],
  weeks = 8,
  now = new Date(),
}) {
  const ids = fijs.map((f) => f.id),
    rows = weeklyReports(thursday, weekly, ids);
  const current = weekKey(now.toISOString()),
    points = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(current + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10),
      batch = rows.filter((r) => weekKey(reportDate(r)) === key);
    const attendance = batch.filter(
      (r) =>
        Number.isFinite(r.total_members) &&
        r.total_members > 0 &&
        Number.isFinite(r.present_count),
    );
    const denominator = attendance.reduce((s, r) => s + r.total_members, 0);
    const participants = batch.reduce(
      (s, r) => s + (r.present_count ?? r.participants_count ?? 0),
      0,
    );
    points.push({
      key,
      label: d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
      participants: batch.length ? participants : null,
      attendance: denominator
        ? Math.round(
            (attendance.reduce((s, r) => s + r.present_count, 0) /
              denominator) *
              100,
          )
        : null,
      reports: batch.length,
      visitors: batch.some((r) => r.visitors != null)
        ? batch.reduce((s, r) => s + (r.visitors || 0), 0)
        : null,
    });
  }
  const activeMembers = members.filter(
    (m) => m.is_active !== false && ids.includes(m.fij_id),
  );
  const latest = points.at(-1),
    previous = points.at(-2);
  const activeFijs = fijs.filter((f) => !f.status || f.status === "active");
  const sent = new Set(
    rows.filter((r) => weekKey(reportDate(r)) === current).map(reportFij),
  );
  const attendanceRows = entries.filter(
    (e) =>
      ids.includes(e.fij_id) &&
      points.some((p) => p.key === weekKey(e.thursday_date)),
  );
  const people = activeMembers.map((member) => ({
    member,
    ...attendanceSummary(
      attendanceRows.filter((e) => e.member_id === member.id),
    ),
  }));
  return {
    points,
    latest,
    previous,
    members: activeMembers,
    people,
    activeFijs,
    sent,
    rows,
    missing: activeFijs.filter((f) => !sent.has(f.id)),
    multiplying: fijs.filter(
      (f) => activeMembers.filter((m) => m.fij_id === f.id).length >= 13,
    ),
    needsCare: people.filter((p) => p.consecutive >= 3),
  };
}
