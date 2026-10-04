import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, UserPlus, Mail } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { base44 } from "@/api/base44Client";

/**
 * Register — L'inscription autonome à l'espace interne EJP est DÉSACTIVÉE.
 *
 * Un compte interne EJP est désormais créé uniquement par l'administration.
 * Cette page permet de soumettre une demande de rejoindre l'équipe, qui sera
 * examinée par un responsable. Les formulaires publics destinés aux visiteurs
 * (FirstVisitIntent, etc.) ne sont pas affectés et restent sur les pages publiques.
 */
export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email) {
      setError("Prénom, nom et email sont requis");
      return;
    }
    setLoading(true);
    try {
      await base44.entities.ServantApplication.create({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message,
        status: "pending",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Échec de l'envoi de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        footer={
          <Link to="/login" className="text-secondary font-medium hover:underline">
            ← Retour à la connexion
          </Link>
        }
      >
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="font-display text-2xl text-foreground font-light mb-3">Demande envoyée</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Merci {firstName} ! Ta demande pour rejoindre l'équipe EJP Nantes a bien été transmise.
            Un responsable te contactera prochainement pour créer ton compte.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="text-secondary font-medium hover:underline">Se connecter</Link>
        </>
      }
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Demander à rejoindre l'équipe</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Les comptes internes sont créés par l'administration. Dépose ta demande ci-dessous,
        un responsable te contactera pour la suite.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Prénom</label>
            <input type="text" autoComplete="given-name" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Nom</label>
            <input type="text" autoComplete="family-name" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Email</label>
          <input type="email" autoComplete="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Téléphone <span className="text-muted-foreground/60">(optionnel)</span></label>
          <input type="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Pourquoi souhaites-tu servir ? <span className="text-muted-foreground/60">(optionnel)</span></label>
          <textarea rows={2} placeholder="Quelques mots sur ta motivation..." value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls + " h-auto py-3 resize-none"} />
        </div>
        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><UserPlus className="w-4 h-4" /> Envoyer ma demande</>}
        </button>
      </form>
    </AuthLayout>
  );
}