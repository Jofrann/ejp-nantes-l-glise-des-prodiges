import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Email ou mot de passe invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <AuthLayout
      footer={
      <>
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500 font-medium hover:underline">
            Sign up for free!
          </Link>
        </>
      }>
      
      {/* Titre */}
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-1">
        WELCOME BACK
      </h1>
      <p className="text-sm mb-8 text-orange-700">Glad to see you again, young prodigy.

      </p>

      {/* Erreur */}
      {error &&
      <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm border border-red-100">
          {error}
        </div>
      }

      {/* Formulaire */}
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
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition" />
          
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between w-full">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 accent-red-500" />
            
            <span className="text-sm text-zinc-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-zinc-600 hover:text-red-500 transition">
            Forgot password
          </Link>
        </div>

        {/* Bouton Sign in */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 bg-orange-500">
          
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> : "Sign in"}
        </button>
      </form>

      {/* Séparateur */}
      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400 uppercase">or</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* Bouton Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-12 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-sm transition flex items-center justify-center gap-2">
        
        <GoogleIcon className="w-5 h-5" />
        Sign in with Google
      </button>
    </AuthLayout>);

}