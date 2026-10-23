import {freePort} from './test-port.mjs';
import { ensureAcademicWorkspace } from "./academic-workspace.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("Department workspaces persist scoped actions and leaders receive deduplicated aggregates only", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ejp-workspaces-")),
    port = await freePort();
  const child = spawn(process.execPath, ["server/index.mjs"], {
    env: { ...process.env, EJP_DATA_DIR: dir, EJP_API_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let cookie = "";
  async function call(path, body, expected = 200) {
    const response = await fetch(`http://127.0.0.1:${port}/api/local/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, expected, JSON.stringify(result));
    if (response.headers.get("set-cookie"))
      cookie = response.headers.get("set-cookie").split(";")[0];
    return result;
  }
  const op = (name, body = {}, expected = 200) =>
      call("functions/" + name, body, expected),
    entity = (name, method, ...args) =>
      call("entities/" + name, { method, args });
  try {
    await once(child.stdout, "data");
    await call("setup", {
      email: "workspace-admin@exemple.invalid",
      password: "workspace-test-admin-123",
    });
    const adminCookie = cookie;
    const ref = await op("adminManageUser", {
        action: "create",
        first_name: "Référent",
        last_name: "Test",
      }),
      member = await op("adminManageUser", {
        action: "create",
        first_name: "Membre",
        last_name: "Test",
      }),
      leader = await op("adminManageUser", {
        action: "create",
        first_name: "Leader",
        last_name: "Test",
      });
    const a = await entity("Department", "create", {
        slug: "communication",
        name: "Communication",
        status: "active",
      }),
      b = await entity("Department", "create", {
        slug: "sono",
        name: "Sono",
        status: "active",
      });
    for (const [dept, person, role] of [
      [a, ref, "referent"],
      [a, member, "serviteur"],
      [b, member, "serviteur"],
    ])
      await entity("DepartmentMember", "create", {
        department_id: dept.id,
        user_id: person.user_id,
        role_in_dept: role,
        status: "active",
      });
    const adapter = {
      Department: {
        filter: (...args) => entity("Department", "filter", ...args),
        create: (data) => entity("Department", "create", data),
      },
    };
    const academic = await ensureAcademicWorkspace(adapter);
    assert.equal(academic.created, true);
    assert.deepEqual(await ensureAcademicWorkspace(adapter), {
      created: false,
      id: academic.id,
    });
    await entity("DepartmentMember", "create", {
      department_id: academic.id,
      user_id: member.user_id,
      role_in_dept: "serviteur",
      status: "active",
    });
    const privateJourney = await entity("ServantJourney", "create", {
      user_id: ref.user_id,
      education_school: "PRIVATE_ACADEMIC_MARKER",
    });
    const event = await entity("Event", "create", {
      title: "Rencontre",
      event_date: "2026-01-10",
      status: "published",
    });
    await entity("AttendanceResponse", "create", {
      event_id: event.id,
      user_id: member.user_id,
      status: "absent",
    });
    await new Promise((r) => setTimeout(r, 5));
    await entity("AttendanceResponse", "create", {
      event_id: event.id,
      user_id: member.user_id,
      status: "present",
    });
    await entity("PrayerRequest", "create", {
      department_id: b.id,
      title: "CONFIDENTIAL_MARKER",
      content: "DO_NOT_EXPOSE",
    });
    await op("getChurchOverview", {}, 403);
    await op("setEJPPermissions", {
      user_id: leader.user_id,
      permissions: { canViewAllEJPData: true },
    });
    const login = async (p) => {
      await call("auth/login", {
        email: p.internal_identifier,
        password: p.temporary_password,
      });
      await call("auth/changePassword", {
        currentPassword: p.temporary_password,
        newPassword: "workspace-test-user-123",
      });
    };
    await login(ref);
    await op("getDepartmentWorkspace", { department_id: b.id }, 403);
    const item = {
      title: "Préparer le visuel du culte",
      kind: "publication",
      status: "todo",
      due_date: "2026-01-01",
      assigned_to: member.user_id,
    };
    const created = await op("saveDepartmentWorkItem", {
      department_id: a.id,
      item,
      request_id: "fixture-request-1",
    });
    const duplicate = await op("saveDepartmentWorkItem", {
      department_id: a.id,
      item,
      request_id: "fixture-request-1",
    });
    assert.equal(duplicate.item.id, created.item.id);
    let read = await op("getDepartmentWorkspace", { department_id: a.id });
    assert.equal(read.items.length, 1);
    assert.equal(read.summary.overdue, 1);
    assert.equal(read.summary.active_members, 2);
    await op(
      "saveDepartmentWorkItem",
      { department_id: b.id, id: created.item.id, item },
      403,
    );
    await op(
      "saveDepartmentWorkItem",
      { department_id: a.id, item: { ...item, assigned_to: leader.user_id } },
      400,
    );
    await op(
      "saveDepartmentWorkItem",
      { department_id: a.id, item: { ...item, due_date: "2026-02-30" } },
      400,
    );
    await op(
      "saveDepartmentWorkItem",
      {
        department_id: a.id,
        id: created.item.id,
        expected_updated_date: "stale",
        item,
      },
      409,
    );
    await op("saveDepartmentWorkItem", {
      department_id: a.id,
      id: created.item.id,
      expected_updated_date: created.item.updated_date,
      item: { ...item, status: "done" },
    });
    read = await op("getDepartmentWorkspace", { department_id: a.id });
    assert.equal(read.summary.open, 0);
    assert.equal(read.summary.completed, 1);
    await login(member);
    assert.equal(
      (await op("getDepartmentWorkspace", { department_id: academic.id }))
        .canonical,
      "vie-academique",
    );
    await call(
      "entities/ServantJourney",
      { method: "get", args: [privateJourney.id] },
      403,
    );
    const memberRead = await op("getDepartmentWorkspace", {
      department_id: a.id,
    });
    assert.equal(memberRead.can_manage, false);
    assert.equal(memberRead.items[0].status, "done");
    await op("saveDepartmentWorkItem", { department_id: a.id, item }, 403);
    await op("getChurchOverview", {}, 403);
    await call(
      "entities/DepartmentWorkItem",
      { method: "list", args: [] },
      403,
    );
    await login(leader);
    const global = await op("getChurchOverview");
    assert.equal(global.summary.servants, 2);
    assert.equal(global.trend[0].participants, 1);
    assert.equal(JSON.stringify(global).includes("DO_NOT_EXPOSE"), false);
    assert.equal(JSON.stringify(global).includes(member.user_id), false);
    assert.equal(JSON.stringify(global).includes(item.title), false);
    await op("saveDepartmentWorkItem", { department_id: a.id, item }, 403);
    cookie = "";
    await op("getChurchOverview", {}, 401);
    await op("getDepartmentWorkspace", { department_id: a.id }, 401);
    cookie = adminCookie;
    assert.equal((await entity("Department", "list")).length, 3);
    assert.equal((await entity("Event", "get", event.id)).title, "Rencontre");
  } finally {
    child.kill();
    await once(child, "exit");
    await rm(dir, { recursive: true, force: true });
  }
});
