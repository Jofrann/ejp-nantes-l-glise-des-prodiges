import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PendingAccount from "@/components/PendingAccount";
import { getRedirectPath, isAccountPending, isAccountSuspended } from "@/lib/permissions";
import { resolveAuthEmail, getLoginErrorMessage } from "@/lib/ejpAuth";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const inputCls = "w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Résout l'adresse technique : prenom@prodiges → prenom@<domaine> (ou email réel en fallback)
      const { authEmail, error: resolveError } = await resolveAuthEmail(identifier);

      if (resolveError === "not_configured") {
        setError("Le système d'authentification interne n'est pas encore configuré. Contacte l'administration EJP.");
        setLoading(false);
        return;
      }

      await base44.auth.loginViaEmailPassword(authEmail, password);
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
      const isAdmin = user.role === "admin" || (Array.isArray(user.badges) && user.badges.includes("ADMIN"));
      if (user.first_login && !isAdmin) {
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

  return (
    <AuthLayout
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-secondary font-medium hover:underline">
            Créer mon compte serviteur
          </Link>
        </>
      }>

      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Connexion à mon espace EJP</h1>
      <p className="text-sm text-muted-foreground mb-8">Retrouve tes départements, ton équipe et les informations liées à ton service.</p>

      {error &&
        <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      }

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="identifier">Identifiant EJP</label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            autoFocus
            placeholder="prenom@prodiges"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="password">Mot de passe</label>
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
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-secondary transition">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">

          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> : "Se connecter"}
        </button>
      </form>

    </AuthLayout>
  );
}