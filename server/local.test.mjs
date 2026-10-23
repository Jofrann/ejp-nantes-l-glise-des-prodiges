import {freePort} from './test-port.mjs';
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
test("independent API: authentication, persistence, CRUD, business functions and access control", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ejp-test-"));
  const port = await freePort();
  let child,
    cookie = "";
  const start = async () => {
    child = spawn(process.execPath, ["server/index.mjs"], {
      env: { ...process.env, EJP_DATA_DIR: dir, EJP_API_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await Promise.race([
      once(child.stdout, "data"),
      once(child, "exit").then(() => {
        throw new Error("API failed to start");
      }),
    ]);
  };
  const stop = async () => {
    const done = once(child, "exit");
    child.kill();
    await done;
  };
  const call = async (path, data, status = 200) => {
    const r = await fetch(`http://127.0.0.1:${port}/api/local/${path}`, {
      headers: { "Content-Type": "application/json", Cookie: cookie },
      ...(data === undefined
        ? {}
        : { method: "POST", body: JSON.stringify(data) }),
    });
    if (r.headers.get("set-cookie"))
      cookie = r.headers.get("set-cookie").split(";")[0];
    const result = await r.json();
    assert.equal(r.status, status, JSON.stringify(result));
    return result;
  };
  try {
    await start();
    assert.equal((await call("status")).setupRequired, true);
    await call("entities/User", { method: "list", args: [] }, 401);
    const u = await call("setup", {
      email: "admin@ejp.local",
      password: "testing-password-123",
    });
    await call(
      "setup",
      { email: "other@ejp.local", password: "testing-password-123" },
      409,
    );
    assert.equal((await call("auth/me")).id, u.id);
    await call('functions/getPilotageData',{},403);
    await call('functions/setEJPPermissions',{user_id:u.id,permissions:{canViewAllEJPData:true}});
    const event = await call("entities/Event", {
      method: "create",
      args: [{ title: "Test", is_active: true }],
    });
    assert.equal(
      (
        await call("entities/Event", {
          method: "filter",
          args: [{ is_active: true, id:event.id }, { limit: 5 }],
        })
      )[0].id,
      event.id,
    );
    await call("entities/Event", {
      method: "update",
      args: [event.id, { title: "Updated" }],
    });
    assert.equal(
      (await call("functions/getPilotageData", {})).access_granted,
      true,
    );
    await call("functions/annuaireSearch", { action: "search" });
    assert.equal(
      (await call("functions/getMusicData", { department_slug: "absent" }))
        .not_found,
      true,
    );
    await call("functions/createMeetLink", {}, 400);
    const churchConfig = await call("entities/ChurchConfig", {
      method: "create",
      args: [{ hero_title: "Une maison vivante", hero_image_url: "https://example.org/cover.jpg", hero_video_url: "https://example.org/film.mp4", community_image_url: "https://example.org/community.jpg", nantes_image_url: "https://example.org/nantes.jpg", mission_title: "Grandir et servir", fij_text: "Une famille", world_shepherd_first_name: "Samuel", private_note: "internal-only" }],
    });
    assert.equal((await call("entities/ChurchConfig", { method: "get", args: [churchConfig.id] })).private_note, "internal-only");
    const publicLeader = await call("entities/Leader", { method: "create", args: [{ first_name: "Public", last_name: "Leader", is_active: true, email: "private@example.org" }] });
    await call("entities/Leader", { method: "create", args: [{ first_name: "Hidden", is_active: false }] });
    const publicMinistry = await call("entities/Ministry", { method: "create", args: [{ name: "Accueil", is_active: true, private_note: "hidden" }] });
    await call("entities/Ministry", { method: "create", args: [{ name: "Hidden", is_active: false }] });
    await call("auth/logout", {});
    const ministries = await call("public/ministries");
    assert.equal(ministries.some(item => item.id === publicMinistry.id), true);
    assert.equal(ministries.some(item => item.name === "Hidden"), false);
    assert.equal(ministries.some(item => Object.hasOwn(item, "private_note")), false);
    const leadership = await call("public/leadership");
    assert.equal(leadership.some(person => person.id === publicLeader.id), true);
    assert.equal(leadership.some(person => person.first_name === "Hidden"), false);
    assert.equal(leadership.some(person => Object.hasOwn(person, "email")), false);
    await call("entities/Leader", { method: "list", args: [] }, 401);
    const publicConfig = await call("entities/ChurchConfig", { method: "get", args: [churchConfig.id] });
    assert.equal(publicConfig.hero_image_url, "https://example.org/cover.jpg");
    assert.equal(publicConfig.hero_video_url, "https://example.org/film.mp4");
    assert.equal(publicConfig.community_image_url, "https://example.org/community.jpg");
    assert.equal(publicConfig.nantes_image_url, "https://example.org/nantes.jpg");
    assert.equal(publicConfig.private_note, undefined);
    assert.equal(publicConfig.mission_title, "Grandir et servir");
    assert.equal(publicConfig.fij_text, "Une famille");
    assert.equal(publicConfig.world_shepherd_first_name, "Samuel");
    const publicConfigs = await call("entities/ChurchConfig", { method: "list", args: [] });
    assert.equal(publicConfigs.find(record => record.id === churchConfig.id).hero_title, "Une maison vivante");
    assert.equal(publicConfigs.some(record => Object.hasOwn(record, "private_note")), false);
    await call("entities/ChurchConfig", { method: "update", args: [churchConfig.id, { hero_title: "Unauthorized" }] }, 401);
    await call("auth/me", undefined, 401);
    await call(
      "auth/login",
      { email: "admin@ejp.local", password: "incorrect" },
      401,
    );
    await call("auth/login", {
      email: "admin@ejp.local",
      password: "testing-password-123",
    });
    const created = await call("functions/adminManageUser", { action: "create", first_name: "\u00c9lodie", last_name: "Test" });
    assert.ok(created.temporary_password.length >= 12);
    assert.equal(created.internal_identifier, "elodie@prodiges");
    const second = await call("functions/adminManageUser", { action: "create", first_name: "\u00c9lodie", last_name: "Autre" });
    assert.notEqual(created.internal_identifier, second.internal_identifier);
    const jofran = await call("functions/adminManageUser", { action: "create", first_name: "Jofran", last_name: "Test" });
    assert.equal(jofran.internal_identifier, "jofran@prodiges");
    await call("auth/logout", {});
    await call("auth/login", { email: "ADMIN@PRODIGES", password: "testing-password-123" });
    await call("auth/logout", {});
    await call("auth/login", { email: created.internal_identifier.toUpperCase(), password: created.temporary_password });
    assert.equal((await call("auth/me")).first_login, true);
    await call("functions/getPilotageData", {}, 403);
    await call("auth/updateMe", { first_login: false }, 403);
    await call("auth/changePassword", { currentPassword: "wrong", newPassword: "personal-password-123" }, 401);
    await call("auth/changePassword", { currentPassword: created.temporary_password, newPassword: "short" }, 400);
    await call("auth/changePassword", { currentPassword: created.temporary_password, newPassword: created.temporary_password }, 400);
    await call("auth/changePassword", { currentPassword: created.temporary_password, newPassword: "personal-password-123" });
    assert.equal((await call("auth/me")).first_login, false);
    await call("functions/adminManageUser", { action: "create", first_name: "No", last_name: "Access" }, 403);
    await call("auth/logout", {});
    await call("auth/login", { email: created.internal_identifier, password: created.temporary_password }, 401);
    await call("auth/login", { email: created.internal_identifier, password: "personal-password-123" });
    await call("auth/login", { email: "admin@ejp.local", password: "testing-password-123" });
    const reset = await call("functions/adminManageUser", { action: "reset_access", user_id: created.user_id });
    await call("auth/logout", {});
    await call("auth/login", { email: created.internal_identifier, password: "personal-password-123" }, 401);
    await call("auth/login", { email: created.internal_identifier, password: reset.temporary_password });
    assert.equal((await call("auth/me")).first_login, true);
    await call("auth/logout", {});
    await call("auth/login", { email: "admin@ejp.local", password: "testing-password-123" });
    await stop();
    await start();
    assert.equal((await call("auth/me")).id, u.id);
    assert.equal(
      (await call("entities/Event", { method: "get", args: [event.id] })).title,
      "Updated",
    );
    await call("entities/Event", { method: "delete", args: [event.id] });
    await call("entities/Event", { method: "get", args: [event.id] }, 404);
  } finally {
    if (child.exitCode === null) await stop();
    await rm(dir, { recursive: true, force: true });
  }
});
