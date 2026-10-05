import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

/**
 * ForgotPassword — L'auto-réinitialisation est désactivée.
 *
 * L'authentification interne EJP utilise des adresses techniques contrôlées
 * par l'administration. Un serviteur ne peut pas réinitialiser son mot de
 * passe seul — l'administration EJP déclenche le processus sécurisé via
 * l'Annuaire (action "Réinitialiser l'accès").
 */
export default function ForgotPassword() {
  return (
    <AuthLayout
      footer={
        <Link to="/login" className="text-secondary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />
          Retour à la connexion
        </Link>
      }
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-foreground font-light mb-2">Mot de passe oublié</h1>

      <div className="mt-8 p-5 rounded-xl bg-surface border border-border text-center">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6 text-secondary" />
        </div>
        <p className="text-sm text-foreground font-medium mb-2">
          Ton accès doit être réinitialisé par l'administration EJP.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Contacte un responsable ou l'administration pour déclencher la réinitialisation
          de ton accès. Tu recevras tes nouveaux identifiants par le canal prévu.
        </p>
      </div>
    </AuthLayout>
  );
}