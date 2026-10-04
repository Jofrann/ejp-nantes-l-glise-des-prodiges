import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2, Ban, CheckCircle2, Archive, RefreshCw, MoreVertical } from 'lucide-react';
import { getInitials, STATUS_LABELS, getBadgeLabel, formatDate } from '@/lib/annuaireConstants';
import FicheApercu from '@/components/annuaire/FicheApercu';
import FicheBadges from '@/components/annuaire/FicheBadges';
import FicheServices from '@/components/annuaire/FicheServices';
import FicheResponsabilites from '@/components/annuaire/FicheResponsabilites';
import FicheAcces from '@/components/annuaire/FicheAcces';
import FicheHistorique from '@/components/annuaire/FicheHistorique';

const TABS = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'badges', label: 'Badges' },
  { id: 'services', label: 'Services' },
  { id: 'responsabilites', label: 'Responsabilités' },
  { id: 'acces', label: 'Accès' },
  { id: 'historique', label: 'Historique' },
];

export default function PersonFiche() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('apercu');
  const [showActions, setShowActions] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('annuaireSearch', { action: 'getPerson', user_id: userId });
      setData(res.data);
    } catch (e) {
      console.error('PersonFiche load error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (newStatus) => {
    const person = data?.person;
    if (!person) return;
    const confirmMsg = newStatus === 'suspended'
      ? `Suspendre ${person.first_name} ${person.last_name} ?\n\nElle ne pourra plus accéder à son espace EJP. Ses données et son historique seront conservés.`
      : newStatus === 'archived'
      ? `Archiver ${person.first_name} ${person.last_name} ?\n\nElle ne fera plus partie des comptes actifs. Son historique sera conservé.`
      : `Réactiver ${person.first_name} ${person.last_name} ?\n\nAttention : ses anciens départements ne seront pas réactivés automatiquement.`;

    if (!confirm(confirmMsg)) return;
    setShowActions(false);
    setBusy(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: newStatus === 'active' ? 'activate' : newStatus,
        user_id: person.id,
      });
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!data?.person) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
      <p className="mb-4">Personne introuvable.</p>
      <Link to="/app/annuaire" className="text-secondary text-sm">← Retour à l'Annuaire</Link>
    </div>
  );

  const { person, memberships, fij_assignments, audit_logs, active_departments, active_fijs } = data;
  const statusInfo = STATUS_LABELS[person.account_status] || STATUS_LABELS.pending;
  const initials = getInitials(person.first_name, person.last_name);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Retour */}
        <button
          onClick={() => navigate('/app/annuaire')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Annuaire
        </button>

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 flex items-center justify-center flex-shrink-0 text-xl font-bold text-secondary overflow-hidden">
              {person.photo_url ? (
                <img src={person.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-heading font-bold text-foreground">
                  {person.first_name} {person.last_name}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.cls} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>
              {person.internal_identifier && (
                <p className="text-sm text-secondary/80 font-mono mt-1">{person.internal_identifier}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{person.email}</p>

              {/* Badges visibles */}
              {person.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {person.badges.map(b => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                      {getBadgeLabel(b)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={busy}
                className="w-9 h-9 flex items-center justify-center border border-border rounded-xl hover:bg-surface transition text-muted-foreground disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
              </button>
              {showActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                  <div className="absolute right-0 top-11 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[200px]">
                    {person.account_status !== 'suspended' && (
                      <button onClick={() => changeStatus('suspended')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface text-left">
                        <Ban className="w-3.5 h-3.5 text-amber-600" /> Suspendre
                      </button>
                    )}
                    {person.account_status === 'suspended' && (
                      <button onClick={() => changeStatus('active')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface text-left">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Réactiver
                      </button>
                    )}
                    {person.account_status !== 'archived' && (
                      <button onClick={() => changeStatus('archived')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface text-left">
                        <Archive className="w-3.5 h-3.5 text-slate-500" /> Archiver
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto scrollbar-none border-b border-border pb-px">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-secondary text-secondary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-12">
          {tab === 'apercu' && (
            <FicheApercu person={person} memberships={memberships} fijAssignments={fij_assignments} />
          )}
          {tab === 'badges' && (
            <FicheBadges person={person} onChanged={load} />
          )}
          {tab === 'services' && (
            <FicheServices person={person} memberships={memberships} activeDepartments={active_departments} onChanged={load} />
          )}
          {tab === 'responsabilites' && (
            <FicheResponsabilites person={person} fijAssignments={fij_assignments} activeFijs={active_fijs} onChanged={load} />
          )}
          {tab === 'acces' && (
            <FicheAcces person={person} memberships={memberships} fijAssignments={fij_assignments} allDepartments={active_departments} />
          )}
          {tab === 'historique' && (
            <FicheHistorique auditLogs={audit_logs} />
          )}
        </div>
      </div>
    </div>
  );
}