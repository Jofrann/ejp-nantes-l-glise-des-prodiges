import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LoginBubbles({ identifier, setIdentifier, password, setPassword, error, loading, onSubmit }) {
  const [step, setStep] = useState(0);
  const [validation, setValidation] = useState('');
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  useEffect(() => { (step === 0 ? usernameRef : passwordRef).current?.focus(); }, [step]);
  const submit = event => {
    event.preventDefault();
    if (!identifier.trim()) { setValidation('Renseigne ton identifiant EJP.'); setStep(0); usernameRef.current?.focus(); return; }
    if (step === 0) { setValidation(''); setStep(1); return; }
    if (!password) { setValidation('Renseigne ton mot de passe.'); passwordRef.current?.focus(); return; }
    setValidation('');
    onSubmit(event);
  };
  const message = validation || error;
  return <main className="ejp-login">
    <Link to="/" className="ejp-login-brand"><img src="/brand/ejp-logo.png" alt="EJP Nantes — retour à l’accueil" width="90" height="64" /></Link>
    <div className="ejp-login-center"><p className="ejp-login-eyebrow">Espace serviteur · EJP Nantes</p><h1>Heureux de te retrouver.</h1><p className="ejp-login-intro">{step === 0 ? 'Entre ton identifiant pour rejoindre ton espace.' : 'Encore un pas, et tu es chez toi.'}</p>
      <form onSubmit={submit} noValidate aria-busy={loading}>
        <div className={`ejp-login-stack ${step === 1 ? 'password-step' : ''}`}>
          <div className="ejp-login-bubble username-bubble" {...(step === 1 ? { inert: '' } : {})} aria-hidden={step === 1}>
            <UserRound size={21} aria-hidden="true" /><div className="ejp-login-field"><label htmlFor="bubble-identifier">Identifiant EJP</label><Input ref={usernameRef} id="bubble-identifier" name="username" autoComplete="username" placeholder="Jofran@prodige" value={identifier} readOnly={step === 1 || loading} tabIndex={step === 0 ? 0 : -1} onChange={event => { setIdentifier(event.target.value); setValidation(''); }} aria-invalid={step === 0 && !!message} aria-describedby={message ? 'bubble-error' : undefined} /></div>
            <button type="submit" disabled={loading} aria-label="Continuer vers le mot de passe"><ArrowRight size={22} /></button>
          </div>
          <div className="ejp-login-bubble password-bubble" {...(step === 0 ? { inert: '' } : {})} aria-hidden={step === 0}>
            <LockKeyhole size={21} aria-hidden="true" /><div className="ejp-login-field"><label htmlFor="bubble-password">Mot de passe</label><Input ref={passwordRef} id="bubble-password" name="password" type="password" autoComplete="current-password" placeholder="Ton mot de passe" value={password} disabled={loading} tabIndex={step === 1 ? 0 : -1} onChange={event => { setPassword(event.target.value); setValidation(''); }} aria-invalid={step === 1 && !!message} aria-describedby={message ? 'bubble-error' : undefined} /></div>
            <button type="submit" disabled={loading} aria-label={loading ? 'Connexion en cours' : 'Se connecter'}>{loading ? <Loader2 size={22} className="animate-spin" /> : <ArrowRight size={22} />}</button>
          </div>
        </div>
        <div className="ejp-login-below">{message && <p id="bubble-error" role="alert" className="ejp-login-error">{message}</p>}
          {step === 1 && <div className="ejp-login-links"><button type="button" disabled={loading} onClick={() => { setStep(0); setValidation(''); }}><ArrowLeft size={14} /> Modifier l’identifiant</button><Link to="/forgot-password">Mot de passe oublié ?</Link></div>}
          <p className="ejp-login-progress" aria-live="polite">{step === 0 ? 'Identifiant · Étape 1 sur 2' : 'Mot de passe · Étape 2 sur 2'}</p>
        </div>
      </form>
      <p className="ejp-login-help">Utilise les accès remis par l’administration. À ta première connexion, tu remplaceras ton mot de passe provisoire.</p>
    </div><Link to="/" className="ejp-login-back">Retour au site EJP Nantes</Link>
  </main>;
}
