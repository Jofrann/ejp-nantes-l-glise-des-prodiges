import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import PendingAccount from "@/components/PendingAccount";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  const inputCls = "w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-[#F7F4EF] placeholder:text-[#6B6B6B] text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30 focus:border-[#C8A96A]/40 transition";

  useEffect(() => {
    base44.entities.Department.filter({ is_active: true }, 'display_order', 50)
      .then(setDepartments)
      .catch(() => {});
  }, []);

  const toggleDept = (deptId) => {
    setSelectedDepts(prev =>
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);

      // Mettre à jour le profil avec les infos du candidat
      try {
        await base44.auth.updateMe({
          first_name: firstName,
          last_name: lastName,
          phone,
          roles: ["serviteur"],
          account_status: "pending"
        });
      } catch (e) {
        // Non bloquant — le compte existe déjà
      }

      // Créer la demande de service
      const deptNames = departments
        .filter(d => selectedDepts.includes(d.id))
        .map(d => d.name);

      try {
        await base44.entities.ServantApplication.create({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          desired_departments: selectedDepts,
          desired_department_names: deptNames,
          message,
          status: "pending"
        });
      } catch (e) {
        // Non bloquant
      }

      setPendingUser({ first_name: firstName });
      setLoading(false);
    } catch (err) {
      setError(err.message || "Code de vérification invalide");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code envoyé", description: "Vérifie ton email." });
    } catch (err) {
      setError(err.message || "Échec de l'envoi du code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/app");
  };

  if (pendingUser) {
    return <PendingAccount userName={pendingUser.first_name} />;
  }

  if (showOtp) {
    return (
      <AuthLayout
        footer={
          <button onClick={() => setShowOtp(false)} className="text-[#B8B8B8] hover:text-[#F7F4EF] text-sm">
            ← Retour
          </button>
        }>

        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium mb-3">Vérification</p>
        <h1 className="font-display text-3xl text-[#F7F4EF] font-light mb-2">Confirme ton email</h1>
        <p className="text-sm text-[#B8B8B8] mb-8">Un code a été envoyé à <span className="text-[#F7F4EF] font-medium">{email}</span></p>

        {error &&
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>
        }

        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
          className="w-full h-12 rounded-xl bg-[#C8A96A] hover:bg-[#D4B97A] text-[#0B0B0C] font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">

          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</> : "Valider mon inscription"}
        </button>

        <p className="text-center text-sm text-[#B8B8B8] mt-4">
          Code non reçu ?{" "}
          <button onClick={handleResend} className="text-[#C8A96A] font-medium hover:underline">Renvoyer</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#C8A96A] font-medium hover:underline">Se connecter</Link>
        </>
      }>

      <p className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium mb-3">EJP Nantes</p>
      <h1 className="font-display text-3xl text-[#F7F4EF] font-light mb-2">Créer mon compte serviteur</h1>
      <p className="text-sm text-[#B8B8B8] mb-6">Le compte sera validé par un responsable avant accès complet.</p>

      {error &&
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>
      }

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#B8B8B8] font-medium">Prénom</label>
            <input type="text" autoComplete="given-name" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#B8B8B8] font-medium">Nom</label>
            <input type="text" autoComplete="family-name" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#B8B8B8] font-medium">Email</label>
          <input type="email" autoComplete="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#B8B8B8] font-medium">Téléphone</label>
          <input type="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#B8B8B8] font-medium">Mot de passe</label>
            <input type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#B8B8B8] font-medium">Confirmer</label>
            <input type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputCls} />
          </div>
        </div>

        {departments.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-[#B8B8B8] font-medium">Départements souhaités <span className="text-[#6B6B6B]">(optionnel)</span></label>
            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => toggleDept(dept.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    selectedDepts.includes(dept.id)
                      ? 'bg-[#C8A96A]/20 border-[#C8A96A]/40 text-[#C8A96A]'
                      : 'bg-white/5 border-white/10 text-[#B8B8B8] hover:border-white/20'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-[#B8B8B8] font-medium">Pourquoi souhaites-tu servir ? <span className="text-[#6B6B6B]">(optionnel)</span></label>
          <textarea
            rows={2}
            placeholder="Quelques mots sur ta motivation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputCls + " h-auto py-3 resize-none"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#C8A96A] hover:bg-[#D4B97A] text-[#0B0B0C] font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">

          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Créer mon compte"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-[#6B6B6B] uppercase">ou</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[#F7F4EF] font-medium text-sm transition flex items-center justify-center gap-2">

        <GoogleIcon className="w-5 h-5" />
        Continuer avec Google
      </button>
    </AuthLayout>
  );
}