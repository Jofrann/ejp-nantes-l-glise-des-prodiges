import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { FileText, Mail, CheckCircle, Edit, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CrHebdomadaires() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [searchParams] = useSearchParams();
  const filterMissing = searchParams.get('filter') === 'missing';
  const [reports, setReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const weekStart = getMonday(new Date(), weekOffset);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).then(r => {
      setReports(r || []);
      setDataLoading(false);
    });
  }, [user, weekStart]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';
  const visibleFijs = isCoord ? fijs.filter(f => !f.status || f.status === 'active') : fijs.filter(f =>
    (f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id)) && (!f.status || f.status === 'active')
  );

  let rows = visibleFijs.map(fij => {
    const report = reports.find(r => r.fij_house_id === fij.id);
    return { fij, report };
  });

  if (filterMissing) rows = rows.filter(r => !r.report);
  if (statusFilter !== 'all') {
    rows = rows.filter(r => r.report && r.report.status === statusFilter);
  }

  const submitted = rows.filter(r => r.report && r.report.status === 'submitted').length;
  const missing = rows.filter(r => !r.report).length;
  const drafts = rows.filter(r => r.report && r.report.status === 'draft').length;

  const handleRelance = async (fij) => {
    await base44.entities.FijCommunication.create({
      type: 'reminder',
      title: `Relance CR - ${fij.name}`,
      content: `Bonjour ${fij.pilot_name || ''}, merci de remplir le compte-rendu de cette semaine pour ${fij.name}.`,
      target_scope: 'specific_fij',
      target_fij_ids: [fij.id],
      sent_by_name: user?.full_name,
      status: 'sent',
    });
    alert('Relance envoyée');
  };

  const handleValidate = async (reportId) => {
    await base44.entities.FijWeeklyReport.update(reportId, { status: 'validated', reviewed_by: user?.id });
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: 'validated' } : r));
  };

  const handleCorrection = async (reportId) => {
    const comment = prompt('Quel correctif demander ?');
    if (!comment) return;
    await base44.entities.FijWeeklyReport.update(reportId, { status: 'correction_required', review_comment: comment, reviewed_by: user?.id });
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: 'correction_required', review_comment: comment } : r));
  };

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="CR hebdomadaires"
      subtitle={`Semaine du ${new Date(weekStart).toLocaleDateString('fr-FR')}`}
    >
      {/* Navigation semaines */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(o => o - 1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
        <span className="text-xs font-medium text-foreground">{weekOffset === 0 ? 'Cette semaine' : weekOffset < 0 ? `S${weekOffset}` : `S+${weekOffset}`}</span>
        <button onClick={() => setWeekOffset(o => o + 1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-success">{submitted}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Soumis</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-secondary">{drafts}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Brouillons</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-danger">{missing}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Manquants</p>
        </div>
      </div>

      {/* Filtre statut */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { v: 'all', l: 'Tous' },
          { v: 'submitted', l: 'Soumis' },
          { v: 'draft', l: 'Brouillons' },
        ].map(f => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.v ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Liste */}
      {rows.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun CR à afficher" sub="Aucune FIJ active pour cette période." />
      ) : (
        <div className="space-y-2">
          {rows.map(({ fij, report }, i) => (
            <motion.div
              key={fij.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fij.name}</p>
                  <p className="text-xs text-muted-foreground">{fij.pilot_name || 'Pilote non assigné'}</p>
                </div>
                <div className="flex-shrink-0">
                  {report ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      report.status === 'validated' ? 'bg-success/10 text-success'
                      : report.status === 'submitted' ? 'bg-primary/10 text-primary'
                      : report.status === 'correction_required' ? 'bg-warning/10 text-warning'
                      : 'bg-secondary/10 text-secondary'
                    }`}>
                      {report.status === 'validated' ? 'Validé' : report.status === 'submitted' ? 'Soumis' : report.status === 'correction_required' ? 'À corriger' : 'Brouillon'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-danger/10 text-danger">Manquant</span>
                  )}
                </div>
              </div>
              {report && (
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{report.participants_count || 0} participants</span>
                  <span>{report.new_visitors_count || 0} nouveaux</span>
                  {report.summary && <span className="truncate flex-1">· {report.summary}</span>}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                {!report ? (
                  <>
                    <Link to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`} className="flex items-center gap-1 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-2.5 py-1.5 transition-colors">
                      <Edit className="w-3 h-3" /> Remplir
                    </Link>
                    {isCoord && (
                      <button onClick={() => handleRelance(fij)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                        <Mail className="w-3 h-3" /> Relancer
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                      <Edit className="w-3 h-3" /> Voir / éditer
                    </Link>
                    {isCoord && report.status === 'submitted' && (
                      <>
                        <button onClick={() => handleValidate(report.id)} className="flex items-center gap-1 text-xs text-success hover:text-success/80 border border-success/30 rounded-lg px-2.5 py-1.5 transition-colors">
                          <CheckCircle className="w-3 h-3" /> Valider
                        </button>
                        <button onClick={() => handleCorrection(report.id)} className="flex items-center gap-1 text-xs text-warning hover:text-warning/80 border border-warning/30 rounded-lg px-2.5 py-1.5 transition-colors">
                          <AlertTriangle className="w-3 h-3" /> Correction
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </FijPageShell>
  );
}

function getMonday(d, offset = 0) {
  const date = new Date(d);
  date.setDate(date.getDate() + offset * 7);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}