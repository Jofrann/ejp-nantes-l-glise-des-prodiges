import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { PauseCircle, PlayCircle, Mail, XCircle } from 'lucide-react';

export default function Pause() {
  const { fijs, loading, accessLevel, reload } = useFijData();

  if (loading) return <LoadingSpinner />;

  const pausedFijs = fijs.filter(f => f.status === 'paused');

  const reactivate = async (fij) => {
    await base44.entities.FIJ.update(fij.id, { status: 'active', pause_reason: '', reactivation_plan: '' });
    reload();
  };

  const proposeClosure = async (fij) => {
    await base44.entities.FIJ.update(fij.id, { status: 'closed' });
    reload();
  };

  const relance = async (fij) => {
    await base44.entities.FijCommunication.create({
      type: 'reminder',
      title: `Relance - ${fij.name}`,
      content: `Bonjour ${fij.pilot_name || ''}, la FIJ ${fij.name} est en pause. Merci de nous indiquer ton plan de réactivation.`,
      target_scope: 'specific_fij',
      target_fij_ids: [fij.id],
      status: 'sent',
    });
    alert('Relance envoyée');
  };

  const saveReactivationPlan = async (fij) => {
    const plan = prompt('Plan de réactivation :', fij.reactivation_plan || '');
    if (plan === null) return;
    await base44.entities.FIJ.update(fij.id, { reactivation_plan: plan });
    reload();
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="FIJ en pause"
      subtitle="Ne pas laisser une FIJ disparaître sans suivi"
      requiredRoles={['coordination', 'direction']}
    >
      {pausedFijs.length === 0 ? (
        <EmptyState icon={PauseCircle} title="Aucune FIJ en pause" sub="Toutes les FIJ sont actives ou en ouverture." />
      ) : (
        <div className="space-y-3">
          {pausedFijs.map((fij, i) => (
            <motion.div
              key={fij.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-purple-400/20 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{fij.name}</p>
                  <p className="text-xs text-muted-foreground">{fij.city} · Pilote: {fij.pilot_name || '—'}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-600">En pause</span>
              </div>

              {fij.pause_reason && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Raison</p>
                  <p className="text-xs text-muted-foreground">{fij.pause_reason}</p>
                </div>
              )}

              {fij.reactivation_plan && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Plan de réactivation</p>
                  <p className="text-xs text-muted-foreground">{fij.reactivation_plan}</p>
                </div>
              )}

              {fij.last_report_date && (
                <p className="text-xs text-muted-foreground mb-3">Dernier CR: {new Date(fij.last_report_date).toLocaleDateString('fr-FR')}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button onClick={() => saveReactivationPlan(fij)} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                  Plan de réactivation
                </button>
                <button onClick={() => relance(fij)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 border border-primary/30 rounded-lg px-2.5 py-1.5 transition-colors">
                  <Mail className="w-3 h-3" /> Relancer
                </button>
                <button onClick={() => reactivate(fij)} className="flex items-center gap-1 text-xs text-success hover:text-success/80 border border-success/30 rounded-lg px-2.5 py-1.5 transition-colors">
                  <PlayCircle className="w-3 h-3" /> Réactiver
                </button>
                <button onClick={() => proposeClosure(fij)} className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 border border-danger/30 rounded-lg px-2.5 py-1.5 transition-colors">
                  <XCircle className="w-3 h-3" /> Fermer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </FijPageShell>
  );
}