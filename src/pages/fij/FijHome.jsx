import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, FileText, AlertTriangle, BarChart3,
  Compass, Shield, Award, Target
} from 'lucide-react';
import { getFijAccessLevel } from '@/lib/permissions';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';

export default function FijHome() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = getMonday(new Date());

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.list('display_order', 100),
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
    ]).then(([u, f, r, a]) => {
      setUser(u);
      setFijs((f || []).filter(x => x.is_active !== false));
      setReports(r || []);
      setAlerts(a || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const accessLevel = getFijAccessLevel(user, fijs);

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const myFijs = fijs.filter(f => f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id));
  const crReceived = reports.length;
  const crExpected = activeFijs.length;
  const missingCr = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header sticky */}
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: 'FIJ', to: '/app/departements/fij' },
            ]}
            backTo="/app/departements"
            backLabel="← Tous les départements"
            rightAction={
              <Link to="/app" className="text-xs text-muted-foreground hover:text-secondary transition-colors">
                Tableau de bord EJP
              </Link>
            }
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* En-tête */}
          <div>
            <p className="text-xs text-secondary uppercase tracking-widest mb-2">Département</p>
            <h1 className="text-2xl font-heading font-bold text-foreground">Foyer d'Intercession et de Jeûne</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Les FIJ sont des maisons de prière et de formation réparties sur le territoire. Le pôle FIJ coordonne l'ouverture, le suivi et la vie spirituelle de chaque foyer.
            </p>
          </div>

          {/* Bloc mission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MissionMini icon={Target} label="Mission" text="Développer un réseau de foyers de prière vivants et fidèles." />
            <MissionMini icon={Award} label="Standard" text="Chaque FIJ produit un CR hebdomadaire et suit ses participants." />
            <MissionMini icon={Compass} label="Vision" text="Étendre l'intercession sur le territoire avec excellence." />
          </div>

          {/* Bloc "Votre accès" */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-heading font-bold text-foreground mb-1">Votre accès</h2>
            <p className="text-xs text-muted-foreground mb-5">Choisissez votre espace selon votre rôle dans le département FIJ.</p>

            <div className="space-y-3">
              {/* Pilote */}
              {accessLevel === 'pilot' && (
                <AccessCard
                  to="/app/departements/fij/pilote"
                  icon={Users}
                  title="Espace Pilote"
                  desc="Gérez vos FIJ, remplissez vos comptes rendus et consultez les communications."
                  primary
                />
              )}

              {/* Coordination */}
              {accessLevel === 'coordination' && (
                <AccessCard
                  to="/app/departements/fij/coordination"
                  icon={Shield}
                  title="Espace Coordination"
                  desc="Gérez le registre, les ouvertures, les consécrations, les CR et le reporting."
                  primary
                />
              )}

              {/* Direction */}
              {accessLevel === 'direction' && (
                <>
                  <AccessCard
                    to="/app/departements/fij/direction"
                    icon={BarChart3}
                    title="Tableau Direction FIJ"
                    desc="Indicateurs globaux, alertes critiques, décisions à valider."
                    primary
                  />
                  <AccessCard
                    to="/app/departements/fij/coordination"
                    icon={Shield}
                    title="Espace Coordination"
                    desc="Accès opérationnel complet au réseau FIJ."
                  />
                </>
              )}

              {/* Aucun rôle */}
              {accessLevel === 'none' && (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-foreground mb-1">Aucun rôle FIJ attribué</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Si vous êtes pilote ou copilote, votre accès sera configuré par la coordination.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chiffres clés selon rôle */}
          {accessLevel === 'pilot' && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Chiffres clés</h2>
              <div className="grid grid-cols-3 gap-3">
                <KeyStat value={myFijs.length} label="Mes FIJ" />
                <KeyStat value={myFijs.filter(f => !reports.some(r => r.fij_house_id === f.id)).length} label="CR à remplir" />
                <KeyStat value={reports.filter(r => myFijs.some(f => f.id === r.fij_house_id)).length} label="CR soumis" />
              </div>
            </div>
          )}

          {accessLevel === 'coordination' && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Chiffres clés</h2>
              <div className="grid grid-cols-3 gap-3">
                <KeyStat value={activeFijs.length} label="FIJ actives" />
                <KeyStat value={`${crReceived}/${crExpected}`} label="CR reçus" />
                <KeyStat value={missingCr.length} label="CR manquants" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <KeyStat value={totalParticipants} label="Participants" />
                <KeyStat value={newVisitors} label="Nouveaux" />
                <KeyStat value={alerts.length} label="Alertes" />
              </div>
            </div>
          )}

          {accessLevel === 'direction' && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Indicateurs</h2>
              <div className="grid grid-cols-2 gap-3">
                <KeyStat value={activeFijs.length} label="FIJ actives" />
                <KeyStat value={totalParticipants} label="Participants" />
                <KeyStat value={`${crReceived}/${crExpected}`} label="CR reçus" />
                <KeyStat value={criticalAlerts.length} label="Alertes critiques" />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function MissionMini({ icon: Icon, label, text }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-secondary" />
        </div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function AccessCard({ to, icon: Icon, title, desc, primary }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
        primary
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-surface border border-border hover:border-secondary/40'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        primary ? 'bg-white/10' : 'bg-card border border-border'
      }`}>
        <Icon className={`w-5 h-5 ${primary ? 'text-primary-foreground' : 'text-secondary'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${primary ? 'text-primary-foreground' : 'text-foreground'}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${primary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{desc}</p>
      </div>
      <ArrowRight className={`w-4 h-4 flex-shrink-0 ${primary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
    </Link>
  );
}

function KeyStat({ value, label }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
      <p className="text-xl font-heading font-bold text-foreground">{value}</p>
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