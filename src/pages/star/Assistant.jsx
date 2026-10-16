import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

export default function Assistant() {
  const promptRef = useRef(null);
  const [prompt,setPrompt] = useState('');
  const [answer,setAnswer] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); if(loading)return;
    if (!prompt.trim()) { setError('Ecris une demande avant de continuer.'); promptRef.current?.focus(); return; }
    setLoading(true);setError('');setAnswer('');
    try { setAnswer(await base44.integrations.Core.InvokeLLM({prompt})); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };
  return <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <PageHeader title="Assistant EJP" intention="Préparer un message, organiser ton service ou clarifier une idée." />
    <p className="text-sm text-muted-foreground">Ta demande est envoyée à OpenAI. Évite les informations personnelles confidentielles. Vérifie la réponse avant de l’utiliser : aucune donnée de la plateforme n’est modifiée par l’assistant.</p>
    <form noValidate onSubmit={submit} className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <label className="text-sm font-medium block" htmlFor="assistant-prompt">Ta demande</label>
      <textarea ref={promptRef} aria-invalid={Boolean(error) && !prompt.trim()} id="assistant-prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} required maxLength={20000} rows={5} aria-describedby="assistant-help" className="w-full p-3 rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-secondary" />
      <p id="assistant-help" className="text-xs text-muted-foreground">Exemple : propose un déroulé de 30 minutes pour une réunion de mon équipe d’accueil.</p>
      <button type="submit" disabled={loading || !prompt.trim()} className="h-11 px-5 rounded-xl bg-primary text-primary-foreground disabled:opacity-60">{loading ? 'Réponse en préparation…' : 'Demander à l’assistant'}</button>
    </form>
    {error && <p role="alert" className="p-4 rounded-xl bg-danger/10 text-danger">{error}</p>}
    {answer && <section aria-label="Réponse de l’assistant" className="bg-card border border-border rounded-2xl p-5 prose prose-sm max-w-none break-words"><ReactMarkdown>{answer}</ReactMarkdown></section>}
  </div>;
}
