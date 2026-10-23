import {workspaceOperationNames,executeWorkspaceOperation} from './workspaces.mjs';
import { integrationStatus, invokeAI, sendEmail, createMeet } from './integrations.mjs';
import { subscribeShop, notifyShopOpening } from './shop.mjs';
import { uploadFile, serveFile, maxUploadBytes } from './files.mjs';
import { executeEntity } from './access.mjs';
import { operationNames, executeEJPOperation } from './ejp-operations.mjs';
import { isAdminUser } from '../base44/shared/identityUtils.ts';
import { initializeAdmin } from './bootstrap-admin.mjs';
import "./hooks.mjs";
import { createServer } from "node:http";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { entities, db } from "./store.mjs";
import { context } from "./sdk.mjs";
import { serveWebsite } from "./static.mjs";
import { provisionAccount } from "./provision.mjs";
await initializeAdmin({ identifier: process.env.EJP_INITIAL_ADMIN_IDENTIFIER, passwordHash: process.env.EJP_INITIAL_ADMIN_PASSWORD_HASH });
const hash = (password, salt = randomBytes(16).toString("hex")) =>
  salt + ":" + scryptSync(password, salt, 64).toString("hex");
const matches = (password, stored) => {
  const [salt, key] = stored.split(":");
  return timingSafeEqual(
    Buffer.from(key, "hex"),
    scryptSync(password, salt, 64),
  );
};
const digest = (token) => createHash("sha256").update(token).digest("hex");
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const publicRead = new Set([
  "ChurchConfig",
  "Event",
  "Testimonial",
  "GalleryMedia",
  "Department",
]);
const functions = new Set([
  "adminManageUser",
  "annuaireSearch",
  "applyPendingSetup",
  "getDepartmentData",
  "getCoordinationData",
  "getLogisticsData",
  "getModerationData",
  "getMusicData",
  "getPilotageData",
  "getPrayerData",
  "getSoundData",
  "getWelcomeData",
  "manageCoordinationItem",
  "manageLogisticsItem",
  "manageModerationItem",
  "manageMusicItem",
  "managePilotageItem",
  "managePrayerItem",
  "manageSoundItem",
  "manageWelcomeItem",
  "logAuditAndNotify",
]);
const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  try {
    const url = new URL(req.url, "http://localhost");
    if (process.env.EJP_SERVE_WEB === '1' && !url.pathname.startsWith('/api/')) {
      await serveWebsite(req, res, url.pathname);
      return;
    }
    const allowedOrigins = new Set([
      `http://${req.headers.host}`,
      `https://${req.headers.host}`,
      process.env.EJP_PUBLIC_ORIGIN,
    ].filter(Boolean));
    if (
      req.method === "POST" &&
      req.headers.origin &&
      !allowedOrigins.has(req.headers.origin)
    )
      fail(403, "Origine non autorisée");
    const isUpload = url.pathname === '/api/local/files/upload' && req.method === 'POST';
    const token = (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("ejp_session="))
      ?.slice(12);
    const session = token
      ? db
          .prepare("SELECT user_id FROM sessions WHERE token=? AND expires>?")
          .get(digest(token), Date.now())
      : null;
    const user = session
      ? await entities.User.get(session.user_id).catch(() => null)
      : null;
    const requireUser = () => {
      if (!user || user.account_status !== "active")
        fail(401, "Connexion requise");
      if (user.first_login && !["/api/local/auth/me", "/api/local/auth/changePassword"].includes(url.pathname))
        fail(403, "Change ton mot de passe provisoire avant de continuer");
    };
    const requireAdmin = () => {
      requireUser();
      if (!isAdminUser(user)) fail(403, "Accès administrateur requis");
    };
    const sessionCookie = (id) => {
      const value = randomBytes(32).toString("hex");
      db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
        digest(value),
        id,
        Date.now() + 86400000,
      );
      res.setHeader(
        "Set-Cookie",
        `ejp_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${process.env.EJP_PUBLIC_ORIGIN?.startsWith("https://") ? "; Secure" : ""}`,
      );
    };
    if (isUpload) requireUser();
    const chunks = []; let received = 0;
    for await (const chunk of req) {
      received += chunk.length;
      if (received > (isUpload ? maxUploadBytes + 65536 : 1024 * 1024)) fail(413, isUpload ? 'Le fichier dépasse 50 Mo' : 'Requête trop volumineuse');
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks);
    let body = {};
    if (!isUpload && raw.length) {
      try { body = JSON.parse(raw.toString('utf8')); }
      catch { fail(400, 'Requête JSON invalide'); }
    }
    if (isUpload) {
      requireUser();
      const result = await uploadFile(raw, req.headers['content-type'], user);
      res.end(JSON.stringify(result)); return;
    }
    if (url.pathname.startsWith('/api/local/files/')) {
      const id = url.pathname.slice('/api/local/files/'.length);
      if (!/^[a-f0-9-]{36}$/.test(id)) fail(404, 'Fichier introuvable');
      await serveFile(req,res,id,user); return;
    }
    if (url.pathname === '/api/local/integrations/status') {
      requireAdmin(); res.end(JSON.stringify(integrationStatus())); return;
    }
    if (url.pathname.startsWith('/api/local/integrations/') && req.method === 'POST') {
      requireUser();
      const name = url.pathname.split('/').pop();
      const handlers = { InvokeLLM: invokeAI, SendEmail: sendEmail };
      if (!handlers[name]) fail(404,'Intégration inconnue');
      res.end(JSON.stringify(await handlers[name](body,user))); return;
    }
    if (url.pathname === '/api/local/shop/subscription' && req.method === 'POST') {
      requireUser(); res.end(JSON.stringify(await subscribeShop(user))); return;
    }
    let result;
    if (url.pathname === "/api/local/status")
      result = {
        setupRequired: !db.prepare("SELECT id FROM credentials LIMIT 1").get(),
        setupLocked: Boolean(process.env.EJP_SETUP_TOKEN) || process.env.NODE_ENV === "production",
      };
    else if (url.pathname === "/api/local/setup" && req.method === "POST") {
      if (db.prepare("SELECT id FROM credentials LIMIT 1").get())
        fail(409, "Compte initial déjà créé");
      if ((process.env.NODE_ENV === "production" || process.env.EJP_SETUP_TOKEN) &&
          (!process.env.EJP_SETUP_TOKEN || typeof body.setupToken !== "string" ||
           digest(body.setupToken) !== digest(process.env.EJP_SETUP_TOKEN)))
        fail(403, "Code de configuration administrateur requis");
      if (
        !/^[^\s@]+@[^\s@]+$/.test(body.email || "") ||
        typeof body.password !== "string" ||
        body.password.length < 12
      )
        fail(400, "Adresse valide et mot de passe de 12 caractères requis");
      const credential = hash(body.password);
      db.exec("BEGIN IMMEDIATE");
      try {
        const u = await entities.User.create({
          email: body.email.toLowerCase(),
          full_name: body.name || "Administration EJP",
          first_name: body.name || "Admin",
          role: "admin",
          roles: ["admin"],
          badges: ["ADMIN"],
          account_status: "active",
          internal_identifier: "Admin@prodige",
          first_login: false,
        });
        db.prepare("INSERT INTO credentials VALUES(?,?)").run(u.id, credential);
        db.exec("COMMIT");
        sessionCookie(u.id);
        result = u;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    } else if (
      url.pathname === "/api/local/auth/login" &&
      req.method === "POST"
    ) {
      const email = String(body.email || "").trim().toLowerCase();
      const canonical = value => String(value || '').trim().toLowerCase().replace(/@prodiges$/, '@prodige');
      const users = await entities.User.list(null, 100000);
      const u = users.find(record => canonical(record.internal_identifier) === canonical(email)) ||
        users.find(record => String(record.email || '').toLowerCase() === email) ||
        (email.endsWith('@ejp.local') ? users.find(record => canonical(record.internal_identifier) === canonical(email.replace('@ejp.local', '@prodige'))) : null);
      const c =
        u && db.prepare("SELECT hash FROM credentials WHERE id=?").get(u.id);
      if (
        !c ||
        typeof body.password !== "string" ||
        !matches(body.password, c.hash)
      )
        fail(401, "Identifiants incorrects");
      if (u.account_status !== "active") fail(403, "Compte suspendu");
      sessionCookie(u.id);
      result = u;
    } else if (url.pathname === "/api/local/auth/me") {
      requireUser();
      result = user;
    } else if (
      url.pathname === "/api/local/auth/logout" &&
      req.method === "POST"
    ) {
      if (token)
        db.prepare("DELETE FROM sessions WHERE token=?").run(digest(token));
      res.setHeader(
        "Set-Cookie",
        "ejp_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      );
      result = { success: true };
    } else if (
      url.pathname === "/api/local/auth/updateMe" &&
      req.method === "POST"
    ) {
      requireUser();
      const allowed = {};
      for (const k of [
        "first_name",
        "last_name",
        "full_name",
        "phone",
        "avatar_url", "photo_url", "bio", "instagram_url", "whatsapp_number",
      ])
        if (k in body) allowed[k] = body[k];
      result = await entities.User.update(user.id, allowed);
    } else if (
      url.pathname === "/api/local/auth/changePassword" &&
      req.method === "POST"
    ) {
      requireUser();
      const c = db
        .prepare("SELECT hash FROM credentials WHERE id=?")
        .get(user.id);
      if (!matches(body.currentPassword || "", c.hash))
        fail(401, "Mot de passe incorrect");
      if (typeof body.newPassword !== "string" || body.newPassword.length < 12)
        fail(400, "12 caractères requis");
      if (body.newPassword === body.currentPassword)
        fail(400, "Choisis un mot de passe différent du mot de passe provisoire");
      db.exec("BEGIN IMMEDIATE");
      try {
      db.prepare("UPDATE credentials SET hash=? WHERE id=?").run(
        hash(body.newPassword),
        user.id,
      );
      await entities.User.update(user.id, { first_login: false });
      db.prepare("DELETE FROM sessions WHERE user_id=?").run(user.id);
      db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
      sessionCookie(user.id);
      result = { success: true };
    } else if (url.pathname === "/api/local/public/ministries" && req.method === "GET") {
      const fields = ["id", "name", "description", "icon", "image_url", "benefit_text", "display_order"];
      const ministries = await entities.Ministry.filter({ is_active: true }, "display_order", 100);
      result = ministries.map(item => Object.fromEntries(fields.filter(key => Object.hasOwn(item, key)).map(key => [key, item[key]])));
    } else if (url.pathname === "/api/local/public/leadership" && req.method === "GET") {
      const fields = ["id", "first_name", "last_name", "role", "bio", "photo_url", "is_main_shepherd", "display_order"];
      const people = await entities.Leader.filter({ is_active: true }, "display_order", 100);
      result = people.map(person => Object.fromEntries(fields.filter(key => Object.hasOwn(person, key)).map(key => [key, person[key]])));
    } else if (
      url.pathname.startsWith("/api/local/entities/") &&
      req.method === "POST"
    ) {
      const entity = url.pathname.split("/").pop();
      const { method, args = [], scope } = body;
      if (
        !/^[A-Za-z][A-Za-z0-9]*$/.test(entity) ||
        ![
          "list",
          "filter",
          "get",
          "create",
          "update",
          "delete",
          "bulkCreate",
          "deleteMany",
        ].includes(method) ||
        !Array.isArray(args)
      )
        fail(400, "Opération invalide");
      if (
        publicRead.has(entity) &&
        ["list", "filter", "get"].includes(method)
      ) {
        result = await entities[entity][method](...args);
        if (entity === "ChurchConfig" && !(isAdminUser(user) && user?.account_status === "active" && !user.first_login)) {
          const publicFields = [
            "id", "public_copy", "church_name", "auth_email_domain", "auth_page_image_url",
            "hero_title", "hero_subtitle", "hero_video_url", "hero_image_url",
            "community_image_url", "nantes_image_url",
            "vision_title", "vision_text", "service_day", "service_time",
            "address_label", "maps_link", "contact_email", "instagram_url",
            "youtube_url", "whatsapp_url", "tiktok_url", "announcement_text",
            "apostle_name", "apostle_bio", "apostle_photo_url", "world_shepherd_first_name", "world_shepherd_last_name", "world_shepherd_role", "world_shepherd_bio", "world_shepherd_photo_url", "mission_title", "mission_text", "fij_title", "fij_text", "fij_join_text",
            "announcement_active", "shepherd_name", "shepherd_bio", "shepherd_image_url",
          ];
          const projectPublic = record => Object.fromEntries(publicFields
            .filter(key => Object.hasOwn(record, key)).map(key => [key, record[key]]));
          result = Array.isArray(result) ? result.map(projectPublic) : projectPublic(result);
        }
      } else if (entity === "FirstVisitIntent" && method === "create") {
        const data = args[0] || {};
        delete data.id;
        result = await entities[entity].create(data);
      } else {
        requireUser();
        if (entity === 'ChurchConfig' && ['create', 'update'].includes(method)) {
          const changes = method === 'create' ? args[0] : args[1];
          const copy = changes?.public_copy;
          if (copy !== undefined && (!copy || typeof copy !== 'object' || Array.isArray(copy) || Object.keys(copy).length > 1000 || Object.entries(copy).some(([key, value]) => !/^[a-f0-9]{16}$/.test(key) || typeof value !== 'string' || value.length > 10000))) fail(400, 'Les textes publics sont invalides ou trop longs.');
          if (changes?.service_time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(changes.service_time)) fail(400, 'Indique une heure valide au format HH:MM.');
          if (changes?.service_day !== undefined && !['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'].includes(String(changes.service_day).trim().toLocaleLowerCase('fr'))) fail(400, 'Choisis un jour de la semaine valide.');
        }
        result = await executeEntity({ entity, method, args, scope, user });
        if (entity === 'StarProduct' && ['create','update'].includes(method)) await notifyShopOpening();
      }
    } else if (
      url.pathname.startsWith("/api/local/functions/") &&
      req.method === "POST"
    ) {
      requireUser();
      const name = url.pathname.split("/").pop();
      if ((operationNames.has(name) || workspaceOperationNames.has(name))) { res.end(JSON.stringify(await (workspaceOperationNames.has(name) ? executeWorkspaceOperation(name,body,user) : executeEJPOperation(name,body,user)))); return; }
      if (name === "createMeetLink") { res.end(JSON.stringify(await createMeet(body,user))); return; }
      if (name === "adminManageUser" && ["create", "reset_access"].includes(body.action)) {
        requireAdmin();
        result = await provisionAccount(body, user, hash, fail);
        res.end(JSON.stringify(result));
        return;
      }
      if (!functions.has(name))
        fail(501, "Fonction externe non disponible localement");
      const module = await import(`../base44/functions/${name}/entry.ts`);
      const response = await context.run(user, () =>
        module.default(
          new Request("http://localhost/function", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
        ),
      );
      res.statusCode = response.status;
      result = await response.json();
    } else fail(404, "Route inconnue");
    res.end(JSON.stringify(result));
  } catch (e) {
    if (res.headersSent) { res.destroy(); return; }
    res.statusCode = e.status || 500;
    res.end(
      JSON.stringify({
        message: e.status ? e.message : "Erreur interne du serveur",
      }),
    );
    if (!e.status) console.error(e);
  }
});
server.listen(Number(process.env.EJP_API_PORT || 3001), process.env.EJP_HOST || "127.0.0.1", () =>
  console.log(process.env.EJP_SERVE_WEB === '1' ? 'Site EJP et API démarrés' : 'API EJP locale démarrée'),
);
