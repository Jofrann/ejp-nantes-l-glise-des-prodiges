import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Échec de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
        <h1 className="font-display text-3xl text-foreground font-light mb-2">Mot de passe défini</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ton mot de passe est maintenant actif. Tu peux te connecter à ton espace EJP.
        </p>

        <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Pour te connecter</p>
          <ol className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="text-secondary font-semibold">1.</span>
              <span>Utilise ton <strong className="text-secondary">identifiant EJP</strong> au format <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-border">prenom@prodiges</code></span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary font-semibold">2.</span>
              <span>Saisis le mot de passe que tu viens de définir</span>
            </li>
          </ol>
        </div>

        <Link
          to="/login"
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition flex items-center justify-center"
        >
          Se connecter à mon espace
        </Link>
      </AuthLayout>
    );
  }

  if (!resetToken) {
    return (
      <AuthLayout
        footer={
          <Link to="/forgot-password" className="text-secondary font-medium hover:underline">
            Demander un nouveau lien
          </Link>
        }
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
        <h1 className="font-display text-3xl text-foreground font-light mb-2">Lien invalide</h1>
        <p className="text-sm text-muted-foreground mb-8">Ce lien de réinitialisation est manquant ou invalide.</p>
        <p className="text-sm text-muted-foreground text-center">
          Le lien que tu as utilisé semble incomplet. Demande un nouvel email de réinitialisation.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Nouveau mot de passe</h1>
      <p className="text-sm text-muted-foreground mb-8">Saisis ton nouveau mot de passe ci-dessous.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}