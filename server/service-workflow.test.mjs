import {freePort} from './test-port.mjs';
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
test("department programming delivers personal services and notifications; period attendance and optimized public media preserve access boundaries", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ejp-services-")),
    port = await freePort(),
    child = spawn(process.execPath, ["server/index.mjs"], {
      env: { ...process.env, EJP_DATA_DIR: dir, EJP_API_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
  let cookie = "";
  const call = async (path, body, status = 200) => {
    const r = await fetch(`http://127.0.0.1:${port}/api/local/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify(body),
      }),
      data = await r.json();
    assert.equal(r.status, status, JSON.stringify(data));
    if (r.headers.get("set-cookie"))
      cookie = r.headers.get("set-cookie").split(";")[0];
    return data;
  };
  const op = (name, body = {}, status = 200) =>
      call("functions/" + name, body, status),
    entity = (name, method, ...args) =>
      call("entities/" + name, { method, args });
  const login = async (p) => {
    await call("auth/login", {
      email: p.internal_identifier,
      password: p.temporary_password,
    });
    await call("auth/changePassword", {
      currentPassword: p.temporary_password,
      newPassword: "services-test-password-123",
    });
  };
  try {
    await Promise.race([
      once(child.stdout, "data"),
      once(child, "exit").then(() => {
        throw Error("API de test arrêtée avant démarrage");
      }),
    ]);
    await call("setup", {
      email: "services-admin@exemple.invalid",
      password: "services-admin-password-123",
    });
    const admin = cookie;
    const dept = await entity("Department", "create", {
        name: "Communication",
        slug: "communication",
      }),
      other = await entity("Department", "create", {
        name: "Autre",
        slug: "other",
      });
    const ref = await op("adminManageUser", {
        action: "create",
        first_name: "Responsable",
        last_name: "Test",
      }),
      a = await op("adminManageUser", {
        action: "create",
        first_name: "A",
        last_name: "Test",
      }),
      b = await op("adminManageUser", {
        action: "create",
        first_name: "B",
        last_name: "Test",
      });
    for (const [d, p, role] of [
      [dept, ref, "referent"],
      [dept, a, "serviteur"],
      [other, b, "serviteur"],
    ])
      await entity("DepartmentMember", "create", {
        department_id: d.id,
        user_id: p.user_id,
        role_in_dept: role,
        status: "active",
      });
    const event = await entity("Event", "create", {
        title: "Prodiges Expérience",
        event_date: "2030-01-06",
        event_time: "14:30",
        is_active: true,
        is_public: true,
      }),
      hidden = await entity("Event", "create", {
        title: "PRIVATE",
        event_date: "2030-01-07",
        is_active: true,
        is_public: false,
        audience: "specific",
        target_user_ids: [b.user_id],
      });
    await login(ref);
    const refCookie = cookie;
    let response = await op("saveDepartmentProgramming", {
      department_id: dept.id,
      request_id: "retry",
      program: {
        title: "Communication dimanche",
        date: "2030-01-06",
        start_time: "13:30",
        status: "planned",
      },
      assignments: [{ user_id: a.user_id, position: "Photos" }],
    });
    let plan = response.program;
    assert.equal(
      (
        await op("saveDepartmentProgramming", {
          department_id: dept.id,
          request_id: "retry",
          program: {
            title: "Communication dimanche",
            date: "2030-01-06",
            status: "planned",
          },
          assignments: [{ user_id: a.user_id, position: "Photos" }],
        })
      ).program.id,
      plan.id,
    );
    await op(
      "saveDepartmentProgramming",
      {
        department_id: dept.id,
        program: { title: "Intrusion", date: "2030-01-06", status: "planned" },
        assignments: [{ user_id: b.user_id, position: "Photos" }],
      },
      403,
    );
    await login(a);
    const aCookie = cookie;
    let agenda = await op("getAgendaData", {
      from: "2030-01-01",
      to: "2030-01-31",
    });
    assert.equal(agenda.events.filter((e) => e._scope === "service").length, 1);
    assert.ok(agenda.events.some((e) => e._scope === "prayer"));
    assert.equal((await entity("StarNotification", "list")).length, 1);
    assert.match(
      (await entity("StarNotification", "list"))[0].link,
      /date=2030-01-06/,
    );
    await op("getDepartmentProgramming", { department_id: other.id }, 403);
    await op(
      "saveDepartmentProgramming",
      {
        department_id: dept.id,
        program: { title: "No", date: "2030-01-06", status: "planned" },
        assignments: [],
      },
      403,
    );
    const period = { from: "2030-01-01", to: "2030-01-31" };
    assert.equal(
      (await op("getAttendancePeriod", period)).events.some(
        (e) => e.id === hidden.id,
      ),
      false,
    );
    await op(
      "saveAttendancePeriod",
      {
        ...period,
        responses: [
          { event_id: event.id, status: "present" },
          { event_id: hidden.id, status: "present" },
        ],
      },
      403,
    );
    assert.equal((await entity("AttendanceResponse", "list")).length, 0);
    await op("saveAttendancePeriod", {
      ...period,
      responses: [
        { event_id: event.id, status: "present", user_id: b.user_id },
      ],
    });
    await op("saveAttendancePeriod", {
      ...period,
      responses: [
        { event_id: event.id, status: "late", estimated_arrival_time: "14:45" },
      ],
    });
    const rows = await entity("AttendanceResponse", "list");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].user_id, a.user_id);
    assert.equal(rows[0].status, "late");
    await op("saveAttendancePeriod", {
      ...period,
      responses: [{ event_id: event.id, status: "no_response" }],
    });
    assert.equal(
      (await entity("AttendanceResponse", "list"))[0].status,
      "no_response",
    );
    cookie = refCookie;
    response = await op("saveDepartmentProgramming", {
      department_id: dept.id,
      id: plan.id,
      expected_updated_date: plan.updated_date,
      program: { ...plan, start_time: "13:00" },
      assignments: [{ user_id: a.user_id, position: "Vidéo" }],
    });
    plan = response.program;
    cookie = aCookie;
    assert.equal((await entity("StarNotification", "list")).length, 2);
    assert.equal(
      (await op("getAgendaData", period)).events.find(
        (e) => e._scope === "service",
      ).event_time,
      "13:00",
    );
    cookie = refCookie;
    await op("saveDepartmentProgramming", {
      department_id: dept.id,
      id: plan.id,
      expected_updated_date: plan.updated_date,
      program: { ...plan, status: "cancelled" },
      assignments: [],
    });
    cookie = aCookie;
    assert.equal(
      (await op("getAgendaData", period)).events.some(
        (e) => e._scope === "service",
      ),
      false,
    );
    assert.equal((await entity("StarNotification", "list")).length, 3);
    cookie = admin;
    const image = await sharp(randomBytes(1024 * 768 * 3), {
      raw: { width: 1024, height: 768, channels: 3 },
    })
      .jpeg({ quality: 95 })
      .toBuffer();
    const upload = async (visibility) => {
      const form = new FormData();
      form.set("file", new Blob([image], { type: "image/jpeg" }), "photo.jpg");
      form.set("visibility", visibility);
      const r = await fetch(`http://127.0.0.1:${port}/api/local/files/upload`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: form,
      });
      assert.equal(r.status, 200, await r.clone().text());
      return r.json();
    };
    const media = await upload("public"),
      privateFile = await upload("private");
    cookie = "";
    const base = `http://127.0.0.1:${port}`;
    const optimized = await fetch(base + media.file_url + "?w=320");
    assert.equal(optimized.status, 200);
    assert.equal(optimized.headers.get("content-type"), "image/webp");
    const bytes = Buffer.from(await optimized.arrayBuffer());
    assert.ok(bytes.length < image.length / 4);
    assert.match(optimized.headers.get("cache-control"), /public/);
    const concurrent = await Promise.all([
      fetch(base + media.file_url + "?w=640"),
      fetch(base + media.file_url + "?w=640"),
    ]);
    for (const response of concurrent) {
      const data = Buffer.from(await response.arrayBuffer());
      assert.equal((await sharp(data).metadata()).width, 640);
    }
    assert.equal(
      (
        await fetch(base + media.file_url + "?w=320", {
          headers: { "If-None-Match": optimized.headers.get("etag") },
        })
      ).status,
      304,
    );
    assert.equal(
      (await fetch(base + privateFile.file_url + "?w=320")).status,
      404,
    );
    assert.equal(
      (await fetch(base + media.file_url, { headers: { Range: "bytes=0-9" } }))
        .status,
      206,
    );
    await op("getAttendancePeriod", period, 401);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const done = once(child, "exit");
      child.kill();
      await done;
    }
    await rm(dir, { recursive: true, force: true });
  }
});
