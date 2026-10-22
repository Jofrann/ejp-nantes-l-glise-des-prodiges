import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("FIJ dashboard API preserves member notes and refuses cross-FIJ access", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ejp-fij-dashboard-"));
  const port = 59000 + Math.floor(Math.random() * 700);
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
  const entity = (name, method, ...args) =>
    call("entities/" + name, { method, args });
  try {
    await Promise.race([
      once(child.stdout, "data"),
      once(child, "exit").then(() => {
        throw Error("API failed to start");
      }),
    ]);
    await call("setup", {
      email: "fij-admin@exemple.invalid",
      password: "isolated-fij-admin-check-123",
    });
    const adminCookie = cookie;
    const pilot = await call("functions/adminManageUser", {
      action: "create",
      first_name: "Pilote",
      last_name: "Test",
    });
    const outsider = await call("functions/adminManageUser", {
      action: "create",
      first_name: "Autre",
      last_name: "Test",
    });
    const a = await entity("FIJ", "create", {
      name: "FIJ A",
      pilot_user_id: pilot.user_id,
      status: "active",
    });
    const b = await entity("FIJ", "create", {
      name: "FIJ B",
      pilot_user_id: outsider.user_id,
      status: "active",
    });
    const member = await entity("FijMember", "create", {
      fij_id: a.id,
      full_name: "Membre fictif",
      growth_status: "regulier",
    });
    const foreign = await entity("FijMember", "create", {
      fij_id: b.id,
      full_name: "Membre autre FIJ",
    });
    await call("auth/login", {
      email: pilot.internal_identifier,
      password: pilot.temporary_password,
    });
    await call("auth/changePassword", {
      currentPassword: pilot.temporary_password,
      newPassword: "isolated-fij-pilot-check-123",
    });
    const note = await entity("FijMemberNote", "create", {
      fij_id: a.id,
      member_id: member.id,
      content: "Suivi isolé",
      author_user_id: pilot.user_id,
      visibility: "pilote_fij",
    });
    assert.ok(
      (
        await entity("FijMemberNote", "filter", {
          member_id: member.id,
          fij_id: a.id,
        })
      ).some((n) => n.id === note.id),
    );
    await entity("FijMember", "update", member.id, {
      growth_status: "disciple",
    });
    assert.equal(
      (await entity("FijMember", "get", member.id)).growth_status,
      "disciple",
    );
    assert.deepEqual(await entity("FijMember", "filter", { fij_id: b.id }), []);
    await call(
      "entities/FijMember",
      { method: "get", args: [foreign.id] },
      403,
    );
    cookie = adminCookie;
    // System administration alone does not confer confidential-note access.
    await call(
      "entities/FijMemberNote",
      { method: "get", args: [note.id] },
      403,
    );
    await call("auth/login", {
      email: pilot.internal_identifier,
      password: "isolated-fij-pilot-check-123",
    });
    assert.equal(
      (await entity("FijMemberNote", "get", note.id)).content,
      "Suivi isolé",
    );
    cookie = "";
    await call("entities/FijMember", { method: "get", args: [member.id] }, 401);
  } finally {
    child.kill();
    await once(child, "exit");
    // dir is created by mkdtemp in this test, never a workspace or production path.
    await rm(dir, { recursive: true, force: true });
  }
});
