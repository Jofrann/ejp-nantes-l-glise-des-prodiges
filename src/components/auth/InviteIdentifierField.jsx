import React from "react";
import { User } from "lucide-react";

export default function InviteIdentifierField({ identifier }) {
  if (!identifier) return null;
  return (
    <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Ton identifiant EJP</p>
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
        <p className="text-sm font-mono font-medium text-foreground break-all">{identifier}</p>
      </div>
      <input
        type="text"
        name="username"
        autoComplete="username"
        value={identifier}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <p className="text-xs text-muted-foreground mt-2">
        C'est avec cet identifiant que tu te connecteras. Choisis maintenant ton mot de passe.
      </p>
    </div>
  );
}