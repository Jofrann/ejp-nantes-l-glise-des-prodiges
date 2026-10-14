import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44, localSetup } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LoginBubbles from "@/components/LoginBubbles";
import AuthLayout from "@/components/AuthLayout";
import PendingAccount from "@/components/PendingAccount";
import {
  getRedirectPath,
  isAccountPending,
  isAccountSuspended,
} from "@/lib/permissions";
import { getLoginErrorMessage } from "@/lib/ejpAuth";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupLocked, setSetupLocked] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [checkingSetup, setCheckingSetup] = useState(true);
  useEffect(() => {
    localSetup
      .status()
      .then((s) => { setSetupRequired(s.setupRequired); setSetupLocked(s.setupLocked); })
      .catch(() => setError("Serveur local indisponible."))
      .finally(() => setCheckingSetup(false));
  }, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const inputCls =
    "w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (setupRequired) {
        await localSetup.create({ email: identifier.trim(), password, setupToken });
        window.location.href = "/app";
        return;
      }
      await base44.auth.loginViaEmailPassword(identifier.trim(), password);
      const user = await base44.auth.me();

      if (isAccountPending(user)) {
        setPendingUser(user);
        setLoading(false);
        return;
      }
      if (isAccountSuspended(user)) {
        setError("Ton accès est actuellement suspendu.");
        setLoading(false);
        return;
      }

      // Première connexion (non-admin) → changement de mot de passe obligatoire
      if (user.first_login) {
        window.location.href = "/first-login";
        return;
      }

      // Flux consentement MCP OAuth : retourner à la page de consentement après login
      const returnTo = safeReturnTo();
      if (returnTo !== "/") {
        window.location.href = returnTo;
        return;
      }

      window.location.href = getRedirectPath(user);
    } catch (err) {
      setError(getLoginErrorMessage(err));
      setLoading(false);
    }
  };

  if (pendingUser) {
    return <PendingAccount userName={pendingUser.first_name} />;
  }

  if (checkingSetup) return <div className="min-h-screen bg-[#fbfaf7] grid place-items-center" role="status" aria-label="Chargement de la connexion"><Loader2 className="animate-spin" /></div>;
  if (!setupRequired) return <LoginBubbles identifier={identifier} setIdentifier={setIdentifier} password={password} setPassword={setPassword} error={error} loading={loading} onSubmit={handleSubmit} />;

  return (
    <AuthLayout
      footer={
        <span className="text-muted-foreground/70">
          Version locale indépendante. Les données sont conservées sur ce
          serveur.
        </span>
      }
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">
        EJP Nantes
      </p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">
        {setupRequired
          ? "Créer le compte administrateur"
          : "Connexion à mon espace EJP"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Utilise les identifiants remis par l’administration. À ta première connexion,
        tu devras remplacer ton mot de passe provisoire.
      </p>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {setupRequired && setupLocked && <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="setup-token">Code de configuration administrateur</label>
          <input id="setup-token" type="password" autoComplete="off" value={setupToken} onChange={e => setSetupToken(e.target.value)} required className={inputCls} />
          <p className="text-xs text-muted-foreground">Code disponible pour le propriétaire dans les paramètres du serveur.</p>
        </div>}
        <div className="space-y-1.5">
          <label
            className="text-xs text-muted-foreground font-medium"
            htmlFor="identifier"
          >
            Identifiant EJP
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            autoFocus
            placeholder={setupRequired ? "admin@ejp.local" : "Jofran@prodige"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs text-muted-foreground font-medium"
            htmlFor="password"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div className="flex items-center justify-end w-full">
          <Link
            to="/forgot-password"
            className="text-xs text-muted-foreground hover:text-secondary transition"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || checkingSetup}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Connexion...
            </>
          ) : setupRequired ? (
            "Créer mon compte (12 caractères minimum)"
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
