import test from "node:test";
import assert from "node:assert/strict";
import {
  weekKey,
  weeklyReports,
  attendanceSummary,
  dashboardModel,
} from "../src/lib/fijAnalytics.js";

test("FIJ weeks use a stable Monday including the Sunday boundary", () => {
  assert.equal(weekKey("2026-10-25"), "2026-10-19");
  assert.equal(weekKey("2026-10-26"), "2026-10-26");
  assert.equal(weekKey("bad"), null);
});
test("submitted CR are deduplicated by FIJ/week, scoped and drafts excluded", () => {
  const r = weeklyReports(
    [
      {
        id: "t",
        fij_id: "a",
        thursday_date: "2026-10-22",
        status: "submitted",
        present_count: 8,
      },
    ],
    [
      {
        id: "w",
        fij_house_id: "a",
        week_start: "2026-10-19",
        status: "submitted",
        participants_count: 10,
        new_visitors_count: 2,
      },
      {
        id: "draft",
        fij_house_id: "b",
        week_start: "2026-10-19",
        status: "draft",
        participants_count: 99,
      },
      {
        id: "foreign",
        fij_house_id: "foreign",
        week_start: "2026-10-19",
        status: "submitted",
      },
    ],
    ["a", "b"],
  );
  assert.equal(r.length, 1);
  assert.equal(r[0].present_count, 8);
  assert.equal(r[0].visitors, 2);
});
test("unknown attendance is not an absence and duplicate records are not double counted", () => {
  const r = attendanceSummary([
    {
      report_id: "1",
      member_id: "m",
      thursday_date: "2026-10-22",
      present: false,
    },
    {
      report_id: "1",
      member_id: "m",
      thursday_date: "2026-10-22",
      present: false,
    },
    { report_id: "2", member_id: "m", thursday_date: "2026-10-15" },
    {
      report_id: "3",
      member_id: "m",
      thursday_date: "2026-10-08",
      present: true,
    },
  ]);
  assert.equal(r.total, 2);
  assert.equal(r.rate, 50);
  assert.equal(r.consecutive, 1);
  assert.equal(attendanceSummary([]).rate, null);
});
test("dashboard preserves missing periods, weighted rates and one CR per active family", () => {
  const m = dashboardModel({
    now: new Date("2026-10-22T12:00:00Z"),
    weeks: 3,
    fijs: [
      { id: "a", status: "active" },
      { id: "b", status: "active" },
      { id: "c", status: "paused" },
    ],
    thursday: [
      {
        id: "a",
        fij_id: "a",
        thursday_date: "2026-10-22",
        status: "submitted",
        present_count: 2,
        total_members: 2,
      },
      {
        id: "b",
        fij_id: "b",
        thursday_date: "2026-10-22",
        status: "validated",
        present_count: 4,
        total_members: 8,
      },
    ],
    members: [{ id: "foreign", fij_id: "other" }],
  });
  assert.equal(m.latest.attendance, 60);
  assert.equal(m.latest.participants, 6);
  assert.equal(m.points[0].participants, null);
  assert.equal(m.previous.participants, null);
  assert.equal(m.missing.length, 0);
  assert.equal(m.members.length, 0);
});
