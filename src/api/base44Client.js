// Compatibility name retained so existing screens use the independent local API.
async function request(path, data) {
  const response = await fetch("/api/local/" + path, {
    credentials: "same-origin",
    ...(data === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(
      new Error(result.message || result.error || "Opération impossible"),
      { status: response.status, data: result },
    );
  return result;
}
const unsupported = async () => {
  throw new Error(
    "Ce service externe n’est pas configuré dans la version locale.",
  );
};
export const base44 = {
  entities: new Proxy(
    {},
    {
      get: (_, entity) =>
        new Proxy(
          {},
          {
            get:
              (_, method) =>
              (...args) =>
                request("entities/" + entity, { method, args }),
          },
        ),
    },
  ),
  auth: {
    me: () => request("auth/me"),
    isAuthenticated: async () => {
      try {
        await request("auth/me");
        return true;
      } catch {
        return false;
      }
    },
    loginViaEmailPassword: (email, password) =>
      request("auth/login", { email, password }),
    updateMe: (data) => request("auth/updateMe", data),
    changePassword: (input, newPassword) =>
      request(
        "auth/changePassword",
        typeof input === "object"
          ? {
              currentPassword: input.current_password,
              newPassword: input.new_password,
            }
          : { currentPassword: input, newPassword },
      ),
    logout: async (redirect) => {
      await request("auth/logout", {});
      window.location.assign(redirect || "/login");
    },
    redirectToLogin: () => window.location.assign("/login"),
    resetPasswordRequest: unsupported,
    resetPassword: unsupported,
  },
  functions: {
    invoke: async (name, data = {}) => ({
      data: await request("functions/" + name, data),
    }),
  },
  integrations: { Core: new Proxy({}, { get: () => unsupported }) },
  appLogs: { logUserInApp: async () => {} },
};
export const localSetup = {
  status: () => request("status"),
  create: (data) => request("setup", data),
};

export const publicContent = { leadership: () => request("public/leadership"), ministries: () => request("public/ministries") };
