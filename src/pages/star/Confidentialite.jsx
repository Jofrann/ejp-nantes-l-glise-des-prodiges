import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Download, Trash2, FileArchive, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/star/PageHeader';

const CONSENT_TYPES = [
  {
    type: 'data_processing',
    title: 'Traitement de mes données',
    description: 'J\'accepte que mes données personnelles soient traitées dans le cadre de STAR OS pour la gestion de l\'Église.',
    default: true,
  },
  {
    type: 'sharing_leader',
    title: 'Partage avec mon leader',
    description: 'Mon leader peut voir mes objectifs partagés et mon parcours de formation.',
    default: false,
  },
  {
    type: 'sharing_referent',
    title: 'Partage avec mon référent',
    description: 'Mon référent peut voir certaines données pour mieux m\'accompagner.',
    default: false,
  },
  {
    type: 'pastoral_care',
    title: 'Accompagnement pastoral',
    description: 'J\'autorise l\'accès à mes demandes pastorales par l\'équipe habilitée.',
    default: false,
  },
  {
    type: 'publication_photo',
    title: 'Publication de ma photo',
    description: 'J\'autorise l\'utilisation de ma photo dans les supports de l\'Église.',
    default: false,
  },
];

const DATA_CATEGORIES = [
  { title: 'Données privées', description: 'Notes personnelles, journal spirituel, objectifs privés. Visibles uniquement par vous.', icon: Lock, color: 'slate' },
  { title: 'Données partageables', description: 'Objectifs partagés, livres recommandés, résumés de formation. Selon votre choix.', icon: Eye, color: 'blue' },
  { title: 'Données organisationnelles', description: 'Présence, absence, formation assignée, rôle. Visibles par les responsables autorisés.', icon: Shield, color: 'amber' },
  { title: 'Données sensibles', description: 'Demandes pastorales, notes d\'accompagnement. Accès très restreint.', icon: AlertCircle, color: 'red' },
];

export default function Confidentialite() {
  const [consents, setConsents] = useState({});
  const [existingConsents, setExistingConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    base44.entities.PrivacyConsent.list('-consent_date', 50).then(c => {
      setExistingConsents(c || []);
      const map = {};
      (c || []).forEach(con => {
        if (con.consent_given && !con.withdrawn_date) {
          map[con.consent_type] = true;
        }
      });
      // Apply defaults
      CONSENT_TYPES.forEach(ct => {
        if (!(ct.type in map)) map[ct.type] = ct.default;
      });
      setConsents(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleConsent = async (type, newValue) => {
    setActionLoading(type);
    try {
      const user = await base44.auth.me();
      await base44.entities.PrivacyConsent.create({
        consent_type: type,
        consent_given: newValue,
        consent_text: CONSENT_TYPES.find(c => c.type === type)?.description || '',
        consent_date: new Date().toISOString(),
      });
      setConsents(prev => ({ ...prev, [type]: newValue }));
    } catch (e) {
    } finally {
      setActionLoading(null);
    }
  };

  const requestDataExport = async () => {
    setActionLoading('export');
    try {
      await base44.entities.DataRequest.create({
        request_type: 'export',
        status: 'pending',
        details: 'Demande d\'export RGPD de mes données personnelles',
      });
      alert('Votre demande d\'export a été enregistrée. Vous recevrez vos données par email.');
    } catch (e) {
    } finally {
      setActionLoading(null);
    }
  };

  const requestDataDeletion = async () => {
    if (!confirm('Êtes-vous sûr de vouloir demander la suppression de vos données ? Cette action est irréversible.')) return;
    setActionLoading('delete');
    try {
      await base44.entities.DataRequest.create({
        request_type: 'delete',
        status: 'pending',
        details: 'Demande de suppression RGPD de mes données personnelles',
      });
      alert('Votre demande de suppression a été enregistrée. Un administrateur la traitera.');
    } catch (e) {
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Confidentialité & RGPD"
        intention="Gérez vos consentements, la visibilité de vos données et vos droits."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Espace personnel', to: '/app/espace-personnel' }, { label: 'Confidentialité' }]}
      />

      {/* Data categories */}
      <div className="mb-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Vos données en clair</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl bg-${cat.color}-500/10 border border-${cat.color}-400/20 flex items-center justify-center flex-shrink-0`}>
                  <cat.icon className={`w-4 h-4 text-${cat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cat.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Consents */}
      <div className="mb-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mes consentements</h2>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          {CONSENT_TYPES.map(ct => (
            <div key={ct.type} className="flex items-start gap-3">
              <button
                onClick={() => toggleConsent(ct.type, !consents[ct.type])}
                disabled={actionLoading === ct.type}
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50 ${
                  consents[ct.type] ? 'bg-success border-success' : 'border-border bg-white'
                }`}
              >
                {consents[ct.type] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </button>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{ct.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{ct.description}</p>
              </div>
              {actionLoading === ct.type && <Loader2 className="w-3.5 h-3.5 text-secondary animate-spin flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Rights */}
      <div className="mb-6">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Vos droits</h2>
        <div className="space-y-2">
          <button
            onClick={requestDataExport}
            disabled={actionLoading === 'export'}
            className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all disabled:opacity-50 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Exporter mes données</p>
              <p className="text-xs text-muted-foreground">Recevoir une copie de toutes mes données personnelles</p>
            </div>
            {actionLoading === 'export' && <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
          </button>

          <button
            onClick={requestDataDeletion}
            disabled={actionLoading === 'delete'}
            className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all disabled:opacity-50 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Demander la suppression</p>
              <p className="text-xs text-muted-foreground">Demander l'effacement de vos données (irréversible)</p>
            </div>
            {actionLoading === 'delete' && <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            STAR OS traite vos données conformément au RGPD. Vos données privées ne sont jamais visibles par défaut.
            Les responsables ne voient que les données nécessaires à leur mission. Toute consultation de données sensibles est tracée.
          </p>
        </div>
      </div>
    </div>
  );
}