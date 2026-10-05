import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

/**
 * FirstLogin — Écran de changement de mot de passe obligatoire.
 *
 * S'affiche quand un utilisateur se connecte pour la première fois
 * (user.first_login === true) et que l'authentification interne est configurée.
 *
 * Utilise base44.auth.changePassword({ user_id, current_password, new_password }).
 * Après succès, first_login est mis à false via updateMe.
 */
export default function FirstLogin() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.changePassword({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword,
      });
      await base44.auth.updateMe({ first_login: false });
      setSuccess(true);
      setTimeout(() => { window.location.href = '/app'; }, 1500);
    } catch (err) {
      const msg = (err?.message || err?.toString() || '').toLowerCase();
      if (msg.includes('current') || msg.includes('incorrect')) {
        setError('Le mot de passe temporaire est incorrect.');
      } else if (msg.includes('weak') || msg.includes('complex')) {
        setError('Le mot de passe est trop simple. Choisis-en un plus robuste.');
      } else {
        setError('Impossible de modifier le mot de passe. Réessaie ou contacte l\'administration.');
      }
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h1 className="font-display text-2xl text-foreground font-light mb-3">Mot de passe modifié</h1>
          <p className="text-sm text-muted-foreground">Redirection vers ton espace EJP...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Crée ton mot de passe personnel</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Pour ta sécurité, choisis un nouveau mot de passe avant d'accéder à ton espace.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="current-password">
            Mot de passe temporaire
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
            placeholder="••••••••••"
            className="w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="new-password">
            Nouveau mot de passe
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••••"
            className="w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium" htmlFor="confirm-password">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••••"
            className="w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition"
          />
        </div>

        <p className="text-[10px] text-muted-foreground/70">
          Minimum 8 caractères. Choisis un mot de passe que tu peux mémoriser.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Modification...</>
          ) : (
            <><Lock className="w-4 h-4" /> Définir mon mot de passe</>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}