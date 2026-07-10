import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { getFijAccessLevel } from '@/lib/permissions';
import { ArrowLeft, Users, FileText, AlertTriangle, MapPin, Clock, Edit, Plus, PauseCircle } from 'lucide-react';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { useLocation } from 'react-router-dom';

export default function FijDetail() {
  const { id } = useParams();
  const { user, fijs, loading } = useFijData();
  const [fij, setFij] = useState(null);
  const [reports, setReports] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.FIJ.filter({ id }).then(r => r?.[0] || null),
      base44.entities.FijWeeklyReport.filter({ fij_house_id: id }, '-created_date', 20).catch(() => []),
      base44.entities.FijParticipant.filter({ fij_house_id: id, is_active: true }, '-created_date', 100).catch(() => []),
      base44.entities.FijAlert.filter({ fij_house_id: id }, '-created_date', 20).catch(() => []),
    ]).then(([f, r, p, a]) => {
      setFij(f);
      setReports(r || []);
      setParticipants(p || []);
      setAlerts(a || []);
      setDataLoading(false);
    });
  }, [id, user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  if (!fij) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
      <p className="mb-4">FIJ introuvable.</p>
      <Link to="/app/responsabilites" className="text-secondary text-sm">← Retour</Link>
    </div>
  );

  const accessLevel = getFijAccessLevel(user, fijs);
  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';
  const isPilot = fij.pilot_user_id === user?.id || (fij.co_pilot_user_ids || []).includes(user?.id);
  const canManage = isCoord || isPilot;

  // Retour logique selon le rôle
  const parentFijPath = accessLevel === 'pilot'
    ? '/app/responsabilites/fij-pilote/mes-fij'
    : '/app/responsabilites/fij-coordination/registre';
  const parentFijLabel = accessLevel === 'pilot' ? '← Mes FIJ' : '← Registre';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header sticky */}
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/responsabilites' },
              { label: fij.name, to: `/app/responsabilites/fij-pilote/fij/${fij.id}` },
            ]}
            backTo={parentFijPath}
            backLabel={parentFijLabel}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Carte d'identité */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{fij.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  fij.status === 'active' ? 'bg-success/10 text-success'
                  : fij.status === 'opening' ? 'bg-primary/10 text-primary'
                  : fij.status === 'paused' ? 'bg-purple-500/10 text-purple-600'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {fij.status === 'active' ? 'Active' : fij.status === 'opening' ? 'Ouverture' : fij.status === 'paused' ? 'En pause' : 'Fermée'}
                </span>
                {fij.city && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="w-3 h-3" />{fij.city}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-secondary">{participants.length || fij.member_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase">participants</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {fij.meeting_day && <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3 h-3" /> {fij.meeting_day}{fij.meeting_time ? ` à ${fij.meeting_time}` : ''}</div>}
            {fij.pilot_name && <div className="text-muted-foreground">Pilote: {fij.pilot_name}</div>}
            {fij.address && <div className="flex items-center gap-1.5 text-muted-foreground col-span-2"><MapPin className="w-3 h-3" /> {fij.address}</div>}
          </div>
          {fij.description && <p className="text-sm text-muted-foreground mt-3">{fij.description}</p>}
        </motion.div>

        {/* Actions rapides */}
        {canManage && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link to={`/app/responsabilites/fij-pilote/fij/${fij.id}/cr/nouveau`}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-2 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Remplir le CR
            </Link>
            <Link to={accessLevel === 'pilot' ? '/app/responsabilites/fij-pilote/alertes' : '/app/responsabilites/fij-coordination/alertes'}
              className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-surface transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> Signaler un besoin
            </Link>
            {isCoord && (
              <Link to="/app/responsabilites/fij-coordination/registre"
                className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-surface transition-colors">
                <Edit className="w-3.5 h-3.5" /> Modifier
              </Link>
            )}
          </div>
        )}

        {/* Derniers CR */}
        <div className="mb-6">
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Derniers comptes-rendus</h3>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun CR pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 5).map(r => (
                <Link key={r.id} to={`/app/responsabilites/fij-pilote/fij/${fij.id}/cr/nouveau`}
                  className="block bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(r.meeting_date || r.week_start).toLocaleDateString('fr-FR')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      r.status === 'validated' ? 'bg-success/10 text-success'
                      : r.status === 'submitted' ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary'
                    }`}>
                      {r.status === 'validated' ? 'Validé' : r.status === 'submitted' ? 'Soumis' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{r.participants_count || 0} participants · {r.new_visitors_count || 0} nouveaux</p>
                  {r.summary && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.summary}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Alertes */}
        {alerts.filter(a => a.status !== 'resolved').length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Alertes ouvertes</h3>
            <div className="space-y-2">
              {alerts.filter(a => a.status !== 'resolved').map(a => (
                <div key={a.id} className={`flex items-start gap-2 border rounded-xl p-3 ${
                  a.severity === 'critical' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'
                }`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-danger' : 'text-warning'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Participants</h3>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun participant enregistré.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {participants.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-secondary">{p.full_name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.full_name}</p>
                    <span className="text-[10px] text-muted-foreground">{p.status_pipeline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}