import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * getInviteIdentifier — Fonction publique appelée par la page /reset-password.
 *
 * À partir du jeton reçu par email, retrouve l'invitation en attente et renvoie
 * UNIQUEMENT l'identifiant EJP (prenom@prodiges) et le prénom, pour pré-remplir
 * la page de création du mot de passe.
 * L'adresse email technique n'est jamais renvoyée.
 */
function decodeTokenPayload(token: string): Record<string, any> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = new TextDecoder().decode(Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)));
    const payload = JSON.parse(json);
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token || token.length > 4000) return Response.json({ identifier: null });

    const payload = decodeTokenPayload(token);
    // Trace de forme uniquement (jamais de valeurs) pour diagnostiquer le format du jeton.
    console.log('invite token shape', { parts: token.split('.').length, claims: payload ? Object.keys(payload) : null });
    if (!payload) return Response.json({ identifier: null });

    const candidates = [payload.email, payload.user_email, payload.sub]
      .filter((v) => typeof v === 'string' && v.includes('@'))
      .map((v) => String(v).trim());
    if (candidates.length === 0) return Response.json({ identifier: null });

    for (const candidate of candidates) {
      for (const email of [candidate, candidate.toLowerCase()]) {
        const pending = await base44.asServiceRole.entities.PendingUserSetup.filter({ email, applied: false });
        const record = pending?.[0];
        if (record?.internal_identifier) {
          return Response.json({ identifier: record.internal_identifier, first_name: record.first_name || null });
        }
      }
    }
    return Response.json({ identifier: null });
  } catch (error) {
    return Response.json({ identifier: null, error: error.message }, { status: 500 });
  }
}