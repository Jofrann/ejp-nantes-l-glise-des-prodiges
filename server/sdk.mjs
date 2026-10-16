import { AsyncLocalStorage } from "node:async_hooks";
import { invokeAI, sendEmail } from "./integrations.mjs";
import { entities } from "./store.mjs";
export const context = new AsyncLocalStorage();
const unsupported = async () => {
  throw Object.assign(
    new Error("Service externe non configuré dans cette version locale."),
    { status: 501 },
  );
};
export function createClientFromRequest() {
  const user = context.getStore();
  const client = {
    entities,
    auth: {
      me: async () => user,
      updateMe: async (data) => entities.User.update(user.id, data),
    },
    integrations: { Core: { InvokeLLM: input => invokeAI(input,user), SendEmail: input => sendEmail(input,user) } },
    users: { inviteUser: unsupported },
    connectors: { getAccessToken: unsupported },
  };
  client.asServiceRole = client;
  return client;
}
