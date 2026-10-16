import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const services = [
  ['uploads','Fichiers','Stockage persistant sur le serveur. Maximum 50 Mo par fichier. Les documents restent privés ; les médias de la vitrine sont publiés par l’administration.'],
  ['ai','Assistant IA','OpenAI : OPENAI_API_KEY et OPENAI_MODEL (facultatif). Les clés se configurent uniquement dans Render. Les demandes sont envoyées à OpenAI ; ne transmets pas de données personnelles confidentielles.'],
  ['email','Courriels','Resend : RESEND_API_KEY et EJP_EMAIL_FROM, avec domaine expéditeur vérifié. Un envoi accepté par le fournisseur ne prouve pas sa livraison.'],
  ['meet','Google Meet','Google : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN. Autorisation Google Calendar requise.'],
];
export default function IntegrationSettings() {
  const [status,setStatus] = useState(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  const load = async () => {
    setLoading(true); setError('');
    try { setStatus(await base44.integrationStatus()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  return <section className="space-y-4">
    <h2 className="font-semibold text-foreground">Fichiers et intégrations</h2>
    <p className="text-sm text-muted-foreground">L’état indique si les paramètres sont présents. Il ne remplace pas un essai réel auprès du fournisseur.</p>
    {error && <p role="alert" className="text-danger text-sm">{error}</p>}
    <button onClick={load} disabled={loading} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-60">{loading ? 'Vérification…' : 'Actualiser les états'}</button>
    {services.map(([key,label,help])=><article key={key} className="p-4 bg-card border border-border rounded-xl">
      <h3 className="font-medium">{label}</h3>
      <p role="status" className="text-sm my-2">{!status ? 'État non disponible' : status[key].configured ? 'Configuration présente' : 'Configuration à terminer'}</p>
      <p className="text-sm text-muted-foreground">{help}</p>
    </article>)}
    <article className="p-4 bg-card border border-border rounded-xl"><h3 className="font-medium">Paiements boutique</h3><p className="text-sm text-muted-foreground mt-2">Ajoute un lien de paiement Stripe HTTPS dans chaque fiche produit. Les paiements sont traités sur Stripe. La plateforme ne confirme pas automatiquement les commandes.</p></article>
  </section>;
}
