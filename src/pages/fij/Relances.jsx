import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Mail, CheckCircle, AlertCircle, Send, Loader2, Clock
} from 'lucide-react';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';

export default function FijRelances() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState(new Set());

  const weekStart = getMonday(new Date());

  useEffect(() => {
    if (!user) return;
    base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200)
      .then(r => { setReports(r || []); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const missingFijs = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const submittedFijs = activeFijs.filter(f => reports.some(r => r.fij_house_id === f.id));

  const handleRelance = async (fij) => {
    if (!fij.pilot_email) return;
    setSendingTo(fij.id);
    try {
      await base44.integrations.Core.SendEmail({
        to: fij.pilot_email,
        subject: `Rappel : CR hebdomadaire FIJ — ${fij.name}`,
        body: `Bonjour ${fij.pilot_name || ''},\n\nNous n'avons pas encore reçu votre compte rendu hebdomadaire pour la FIJ ${fij.name} (${fij.city}).\n\nMerci de le remplir dès que possible via l'application.\n\nCoordination FIJ — EJP Nantes`,
      });
      setSentTo(prev => new Set([...prev, fij.id]));
    } catch (e) {
      // silent fail
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      requiredRoles={['coordination', 'admin']}
      title="Relances CR"
      subtitle="Suivi des comptes rendus manquants et relance des pilotes"
      breadcrumbLabel="Relances"
    >
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard value={activeFijs.length} label="FIJ actives" />
        <SummaryCard value={submittedFijs.length} label="CR reçus" color="text-success" />
        <SummaryCard value={missingFijs.length} label="CR manquants" color="text-danger" />
      </div>

      {/* CR manquants */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        À relancer ({missingFijs.length})
      </h2>

      {missingFijs.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Tous les CR ont été reçus !"
          sub="Aucune relance nécessaire cette semaine."
        />
      ) : (
        <div className="space-y-2 mb-8">
          {missingFijs.map(fij => {
            const isSending = sendingTo === fij.id;
            const isSent = sentTo.has(fij.id);
            const hasEmail = !!fij.pilot_email;

            return (
              <motion.div
                key={fij.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{fij.name}</p>
                    <p className="text-xs text-muted-foreground">{fij.city} · {fij.meeting_day || '—'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-foreground">{fij.pilot_name || 'Sans pilote'}</p>
                      {fij.pilot_email && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Mail className="w-2.5 h-2.5" /> {fij.pilot_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasEmail ? (
                    <button
                      onClick={() => handleRelance(fij)}
                      disabled={isSending || isSent}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all flex-shrink-0 ${
                        isSent
                          ? 'bg-success/10 border border-success/20 text-success'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isSent ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      {isSent ? 'Relancé' : 'Relancer'}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-surface border border-border px-2 py-1.5 rounded-lg flex-shrink-0">
                      <AlertCircle className="w-3 h-3" /> Pas d'email
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CR reçus */}
      {submittedFijs.length > 0 && (
        <>
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            CR reçus ({submittedFijs.length})
          </h2>
          <div className="space-y-2">
            {submittedFijs.map(fij => (
              <div key={fij.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fij.name}</p>
                  <p className="text-xs text-muted-foreground">{fij.pilot_name || '—'} · {fij.city}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </FijPageShell>
  );
}

function SummaryCard({ value, label, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
      <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}