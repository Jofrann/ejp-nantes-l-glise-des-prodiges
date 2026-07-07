import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon, BarChart3, Users, FileText,
  Bell, AlertTriangle, Mail, FolderOpen, ArrowRight, Plus,
  Heart, PauseCircle, UserCheck, TrendingUp, ArrowLeftRight, Send
} from 'lucide-react';
import { getFijAccessLevel } from '@/lib/permissions';
import { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { FIJ_NAV } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { useLocation } from 'react-router-dom';

export default function FijHome() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [comms, setComms] = useState([]);
  const [docs, setDocs] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [consecrations, setConsecrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const weekStart = getMonday(new Date());

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.list('display_order', 100),
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.entities.FijCommunication.filter({}, '-created_date', 10).catch(() => []),
      base44.entities.FijDocument.filter({}, '-created_date', 5).catch(() => []),
      base44.entities.FijOpeningProcess.filter({}, '-created_date', 50).catch(() => []),
      base44.entities.FijConsecrationRequest.filter({ status: 'pending' }, '-created_date', 20).catch(() => []),
    ]).then(([u, f, r, a, c, d, o, con]) => {
      setUser(u);
      setFijs((f || []).filter(x => x.is_active !== false));
      setReports(r || []);
      setAlerts(a || []);
      setComms(c || []);
      setDocs(d || []);
      setOpenings(o || []);
      setConsecrations(con || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const accessLevel = getFijAccessLevel(user, fijs);
  const navItems = FIJ_NAV.filter(item => item.roles === 'all' || item.roles.includes(accessLevel));

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const pausedFijs = fijs.filter(f => f.status === 'paused');
  const openingFijs = fijs.filter(f => f.status === 'opening');
  const myFijs = fijs.filter(f => f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id));
  const crReceived = reports.length;
  const crExpected = activeFijs.length;
  const missingCr = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const activeOpenings = openings.filter(o => o.status !== 'validated' && o.status !== 'rejected');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);

  // Dernier thème transmis
  const lastTheme = comms.find(c => c.type === 'theme' && c.status === 'sent');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header sticky avec nav */}
      <div className="sticky top-14 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/departements/fij' },
            ]}
            backTo="/app/departements"
            backLabel="← Tous les départements"
            rightAction={
              <Link to="/app" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">
                Tableau de bord EJP
              </Link>
            }
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
        {/* === ACCUEIL PILOTE === */}
        {accessLevel === 'pilot' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Mes FIJ */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-gray-500 uppercase tracking-widest">Ma FIJ</h2>
                <Link to="/app/departements/fij/mes-fij" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {myFijs.length === 0 ? (
                <EmptyState icon={Users} title="Tu n'es pilote d'aucune FIJ" sub="Contacte la coordination si nécessaire." />
              ) : (
                <div className="space-y-2">
                  {myFijs.map(fij => {
                    const thisWeekReport = reports.find(r => r.fij_house_id === fij.id);
                    return (
                      <div key={fij.id} className="bg-white/3 border border-white/8 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{fij.name}</p>
                            <p className="text-xs text-gray-500">{fij.city} · {fij.meeting_day || ''} {fij.meeting_time || ''}</p>
                          </div>
                          <Link to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`}
                            className="flex items-center gap-1 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0">
                            <FileText className="w-3 h-3" /> {thisWeekReport ? 'Éditer CR' : 'Remplir CR'}
                          </Link>
                        </div>
                        {thisWeekReport && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${thisWeekReport.status === 'submitted' ? 'bg-green-400' : 'bg-amber-400'}`} />
                            <span className="text-gray-400">CR {thisWeekReport.status === 'submitted' ? 'soumis' : thisWeekReport.status === 'validated' ? 'validé' : 'en brouillon'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dernier thème */}
            {lastTheme && (
              <div>
                <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Dernier thème transmis</h2>
                <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
                  <p className="text-sm font-medium text-white">{lastTheme.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{lastTheme.content}</p>
                </div>
              </div>
            )}

            {/* Dernières communications */}
            {comms.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-gray-500 uppercase tracking-widest">Dernières communications</h2>
                  <Link to="/app/departements/fij/communications" className="text-xs text-amber-400/70 hover:text-amber-400">Voir tout</Link>
                </div>
                <div className="space-y-2">
                  {comms.filter(c => c.status === 'sent').slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white/3 border border-white/8 rounded-xl p-3">
                      <p className="text-sm font-medium text-white">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents utiles */}
            {docs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-gray-500 uppercase tracking-widest">Documents utiles</h2>
                  <Link to="/app/departements/fij/documents" className="text-xs text-amber-400/70 hover:text-amber-400">Voir tout</Link>
                </div>
                <div className="space-y-2">
                  {docs.slice(0, 3).map(d => (
                    <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors">
                      <FolderOpen className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                      <p className="text-sm text-white truncate">{d.title}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Signaler un besoin */}
            <Link to="/app/departements/fij/alertes"
              className="flex items-center justify-center gap-2 w-full bg-amber-400/5 border border-amber-400/15 text-amber-400 text-sm font-medium py-3 rounded-xl hover:bg-amber-400/10 transition-colors">
              <AlertTriangle className="w-4 h-4" /> Signaler un besoin
            </Link>
          </motion.div>
        )}

        {/* === ACCUEIL COORDINATION === */}
        {accessLevel === 'coordination' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Chiffres clés */}
            <div className="grid grid-cols-3 gap-3">
              <KeyStat value={activeFijs.length} label="FIJ actives" color="text-amber-400" />
              <KeyStat value={`${crReceived}/${crExpected}`} label="CR reçus" color="text-blue-400" />
              <KeyStat value={missingCr.length} label="CR manquants" color="text-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <KeyStat value={activeOpenings.length} label="Ouvertures" color="text-green-400" />
              <KeyStat value={consecrations.length} label="Consécrations" color="text-purple-400" />
              <KeyStat value={pausedFijs.length} label="En pause" color="text-orange-400" />
            </div>

            {/* CR manquants */}
            {missingCr.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-gray-500 uppercase tracking-widest">CR manquants cette semaine</h2>
                  <Link to="/app/departements/fij/cr-hebdomadaires" className="text-xs text-amber-400/70 hover:text-amber-400">Voir tout</Link>
                </div>
                <div className="space-y-2">
                  {missingCr.slice(0, 5).map(f => (
                    <Link key={f.id} to={`/app/departements/fij/fij/${f.id}`}
                      className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl p-3 hover:border-red-500/30 transition-colors">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-gray-500">{f.pilot_name || 'Pilote non assigné'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Alertes */}
            {alerts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-gray-500 uppercase tracking-widest">Alertes ouvertes</h2>
                  <Link to="/app/departements/fij/alertes" className="text-xs text-amber-400/70 hover:text-amber-400">Voir tout</Link>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 4).map(a => (
                    <div key={a.id} className={`flex items-start gap-2 border rounded-xl p-3 ${
                      a.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{a.title}</p>
                        <p className="text-xs text-gray-500 truncate">{a.fij_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* === ACCUEIL DIRECTION === */}
        {accessLevel === 'direction' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Synthèse haute */}
            <div className="grid grid-cols-2 gap-3">
              <KeyStat value={activeFijs.length} label="FIJ actives" color="text-amber-400" />
              <KeyStat value={totalParticipants} label="Participants" color="text-green-400" />
              <KeyStat value={newVisitors} label="Nouveaux visiteurs" color="text-rose-400" />
              <KeyStat value={`${crReceived}/${crExpected}`} label="CR reçus" color="text-blue-400" />
            </div>

            {/* Alertes critiques */}
            {criticalAlerts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs text-gray-500 uppercase tracking-widest">Alertes critiques</h2>
                  <Link to="/app/departements/fij/alertes" className="text-xs text-amber-400/70 hover:text-amber-400">Voir tout</Link>
                </div>
                <div className="space-y-2">
                  {criticalAlerts.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.fij_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Décisions attendues */}
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Décisions attendues</h2>
              <div className="space-y-2">
                {activeOpenings.filter(o => o.consecration_completed && o.status !== 'validated').map(o => (
                  <Link key={o.id} to="/app/departements/fij/ouvertures"
                    className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 hover:border-amber-500/30 transition-colors">
                    <Plus className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Valider ouverture: {o.request_title || o.fij_name}</p>
                      <p className="text-xs text-gray-500">Toutes les étapes complétées</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  </Link>
                ))}
                {consecrations.map(c => (
                  <Link key={c.id} to="/app/departements/fij/consecrations"
                    className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 hover:border-purple-500/30 transition-colors">
                    <Heart className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Consécration: {c.fij_name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.house_address}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  </Link>
                ))}
                {activeOpenings.filter(o => o.consecration_completed && o.status !== 'validated').length === 0 && consecrations.length === 0 && (
                  <p className="text-sm text-gray-600">Aucune décision en attente.</p>
                )}
              </div>
            </div>

            {/* Lien tableau direction */}
            <Link to="/app/direction"
              className="flex items-center justify-center gap-2 w-full bg-purple-400/5 border border-purple-400/15 text-purple-400 text-sm font-medium py-3 rounded-xl hover:bg-purple-400/10 transition-colors">
              <BarChart3 className="w-4 h-4" /> Tableau direction global
            </Link>
          </motion.div>
        )}

        {/* === ACCUEIL PAR DÉFAUT (aucun rôle FIJ) === */}
        {accessLevel === 'none' && (
          <EmptyState
            icon={Users}
            title="Tu n'as pas encore de rôle FIJ"
            sub="Si tu es pilote ou copilote, ton accès sera configuré par la coordination."
          />
        )}
      </div>
    </div>
  );
}

function KeyStat({ value, label, color }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}