import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import PendingAccount from "@/components/PendingAccount";
import { getRedirectPath, isAccountPending, isAccountSuspended } from "@/lib/permissions";

export default function Login() {
  const [email, setEmail] = useState("");
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
      await base44.auth.loginViaEmailPassword(email, password);
      const user = await base44.auth.me();

      if (isAccountPending(user)) {
        setPendingUser(user);
        setLoading(false);
        return;
      }
      if (isAccountSuspended(user)) {
        setError("Ton compte a été suspendu. Contacte un responsable.");
        setLoading(false);
        return;
      }

      window.location.href = getRedirectPath(user);
    } catch (err) {
      setError(err.message || "Email ou mot de passe invalide");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/app");
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
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Bienvenue dans l'espace serviteur</h1>
      <p className="text-sm text-muted-foreground mb-8">Retrouve tes départements, ton équipe et les informations liées à ton service.</p>

      {error &&
        <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      }

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground/60 uppercase">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-12 rounded-xl bg-card border border-border hover:bg-surface text-foreground font-medium text-sm transition flex items-center justify-center gap-2">

        <GoogleIcon className="w-5 h-5" />
        Continuer avec Google
      </button>
    </AuthLayout>
  );
}