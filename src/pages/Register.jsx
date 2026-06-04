import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
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
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Code de vérification invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code envoyé", description: "Vérifiez votre email." });
    } catch (err) {
      setError(err.message || "Échec de l'envoi du code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  if (showOtp) {
    return (
      <AuthLayout
        footer={
        <button onClick={() => setShowOtp(false)} className="text-zinc-500 hover:text-zinc-700 text-sm">
            ← Retour
          </button>
        }>
        
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">VÉRIFICATION</h1>
        <p className="text-zinc-400 text-sm mb-8">Un code a été envoyé à <span className="text-zinc-700 font-medium">{email}</span></p>

        {error &&
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm border border-red-100">{error}</div>
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
          className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
          
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</> : "Vérifier"}
        </button>

        <p className="text-center text-sm text-zinc-400 mt-4">
          Code non reçu ?{" "}
          <button onClick={handleResend} className="text-red-500 font-medium hover:underline">Renvoyer</button>
        </p>
      </AuthLayout>);

  }

  return (
    <AuthLayout
      footer={
      <>
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 font-medium hover:underline">
            Log in
          </Link>
        </>
      }>
      
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-1">CREATE AN ACCOUNT</h1>
      <p className="text-zinc-400 text-sm mb-8">Join us! Please fill in your details below.</p>

      {error &&
      <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm border border-red-100">{error}</div>
      }

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition" />
          
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition" />
          
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800" htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition" />
          
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 bg-orange-600">
          
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Create account"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400 uppercase">or</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-12 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-sm transition flex items-center justify-center gap-2">
        
        <GoogleIcon className="w-5 h-5" />
        Continue with Google
      </button>
    </AuthLayout>);

}