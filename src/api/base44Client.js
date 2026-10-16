import { toast } from '@/components/ui/use-toast';
let lastError = { message: '', at: 0 };
// Compatibility name retained so existing screens use the independent local API.
async function request(path, data) {
  const response = await fetch("/api/local/" + path, {
    credentials: "same-origin",
    ...(data === undefined
      ? {}
      : {
          method: "POST",
          ...(data instanceof FormData ? { body: data } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
        }),
  }).catch(() => { const error = new Error('Connexion interrompue. Réessaie.'); toast({variant:'destructive',title:'Action non terminée',description:error.message}); throw error; });
  const text = await response.text();
  let result;
  try { result = text ? JSON.parse(text) : {}; }
  catch { result = { message: 'Le serveur est momentanément indisponible. Réessaie.' }; }
  if (!response.ok && response.status !== 401 && !path.startsWith('auth/')) {
    const message = result.message || result.error || 'Opération impossible';
    if (message !== lastError.message || Date.now() - lastError.at > 5000) {
      toast({ variant: 'destructive', title: 'Action non terminée', description: message });
      lastError = { message, at: Date.now() };
    }
  }
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
  personal: new Proxy({}, { get: (_, entity) => new Proxy({}, { get: (_, method) => (...args) => request('entities/' + entity, { method, args, scope: 'self' }) }) }),
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
  integrations: { Core: {
    UploadFile: async ({ file, visibility = 'private' }) => {
      if (!file || file.size > 50 * 1024 * 1024) { toast({variant:'destructive',title:'Fichier non envoyé',description:'Choisis un fichier de 50 Mo maximum.'}); throw new Error('Choisis un fichier de 50 Mo maximum.'); }
      const data = new FormData(); data.append('file',file); data.append('visibility',visibility);
      return request('files/upload',data);
    },
    InvokeLLM: input => request('integrations/InvokeLLM',input),
    SendEmail: input => request('integrations/SendEmail',input),
  } },
  shop: { subscribe: () => request('shop/subscription', {}) },
  integrationStatus: () => request('integrations/status'),
  appLogs: { logUserInApp: async () => {} },
};
export const localSetup = {
  status: () => request("status"),
  create: (data) => request("setup", data),
};

export const publicContent = { leadership: () => request("public/leadership"), ministries: () => request("public/ministries") };
