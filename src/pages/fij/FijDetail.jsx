import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { getFijAccessLevel } from '@/lib/permissions';
import { FIJ_NAV } from '@/components/fij/FijPageShell';
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500">
      <p className="mb-4">FIJ introuvable.</p>
      <Link to="/app/departements/fij" className="text-amber-400 text-sm">← Retour</Link>
    </div>
  );

  const accessLevel = getFijAccessLevel(user, fijs);
  const isCoord = accessLevel === 'coordination' || accessLevel === 'direction';
  const isPilot = fij.pilot_user_id === user?.id || (fij.co_pilot_user_ids || []).includes(user?.id);
  const canManage = isCoord || isPilot;

  const navItems = FIJ_NAV.filter(item => item.roles === 'all' || item.roles.includes(accessLevel));

  // Retour logique selon le rôle
  const parentFijPath = accessLevel === 'pilot'
    ? '/app/departements/fij/mes-fij'
    : '/app/departements/fij/registre';
  const parentFijLabel = accessLevel === 'pilot' ? '← Mes FIJ' : '← Registre';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header sticky */}
      <div className="sticky top-14 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: `/app/departements/fij/fij/${fij.id}` },
            ]}
            backTo={parentFijPath}
            backLabel={parentFijLabel}
          />
          <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}>
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Carte d'identité */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{fij.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  fij.status === 'active' ? 'bg-green-500/10 text-green-400'
                  : fij.status === 'opening' ? 'bg-blue-500/10 text-blue-400'
                  : fij.status === 'paused' ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {fij.status === 'active' ? 'Active' : fij.status === 'opening' ? 'Ouverture' : fij.status === 'paused' ? 'En pause' : 'Fermée'}
                </span>
                {fij.city && <span className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{fij.city}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">{participants.length || fij.member_count || 0}</p>
              <p className="text-[10px] text-gray-500 uppercase">participants</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {fij.meeting_day && <div className="flex items-center gap-1.5 text-gray-400"><Clock className="w-3 h-3" /> {fij.meeting_day}{fij.meeting_time ? ` à ${fij.meeting_time}` : ''}</div>}
            {fij.pilot_name && <div className="text-gray-400">Pilote: {fij.pilot_name}</div>}
            {fij.address && <div className="flex items-center gap-1.5 text-gray-400 col-span-2"><MapPin className="w-3 h-3" /> {fij.address}</div>}
          </div>
          {fij.description && <p className="text-sm text-gray-400 mt-3">{fij.description}</p>}
        </motion.div>

        {/* Actions rapides */}
        {canManage && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`}
              className="flex items-center gap-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg px-3 py-2 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Remplir le CR
            </Link>
            <Link to="/app/departements/fij/alertes"
              className="flex items-center gap-1.5 text-xs text-gray-400 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> Signaler un besoin
            </Link>
            {isCoord && (
              <Link to="/app/departements/fij/registre"
                className="flex items-center gap-1.5 text-xs text-gray-400 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors">
                <Edit className="w-3.5 h-3.5" /> Modifier
              </Link>
            )}
          </div>
        )}

        {/* Derniers CR */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Derniers comptes-rendus</h3>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-600">Aucun CR pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 5).map(r => (
                <Link key={r.id} to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`}
                  className="block bg-white/3 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">{new Date(r.meeting_date || r.week_start).toLocaleDateString('fr-FR')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      r.status === 'validated' ? 'bg-green-500/10 text-green-400'
                      : r.status === 'submitted' ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {r.status === 'validated' ? 'Validé' : r.status === 'submitted' ? 'Soumis' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-1">{r.participants_count || 0} participants · {r.new_visitors_count || 0} nouveaux</p>
                  {r.summary && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.summary}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Alertes */}
        {alerts.filter(a => a.status !== 'resolved').length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Alertes ouvertes</h3>
            <div className="space-y-2">
              {alerts.filter(a => a.status !== 'resolved').map(a => (
                <div key={a.id} className={`flex items-start gap-2 border rounded-xl p-3 ${
                  a.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Participants</h3>
          {participants.length === 0 ? (
            <p className="text-sm text-gray-600">Aucun participant enregistré.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {participants.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl p-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-400">{p.full_name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.full_name}</p>
                    <span className="text-[10px] text-gray-500">{p.status_pipeline}</span>
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