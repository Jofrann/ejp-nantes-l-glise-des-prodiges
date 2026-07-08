import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, FileText, AlertTriangle, Shield,
  BarChart3, Compass, Award, Target, Lock
} from 'lucide-react';
import { isFijPilot, isFijCoordination, isFijDirection } from '@/lib/permissions';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';

export default function FijHome() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [comms, setComms] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = getMonday(new Date());

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.list('display_order', 100),
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijAlert.filter({ status: 'open' }, '-created_date', 50).catch(() => []),
      base44.entities.FijCommunication.filter({ status: 'sent' }, '-created_date', 20).catch(() => []),
    ]).then(([u, f, r, a, c]) => {
      setUser(u);
      setFijs((f || []).filter(x => x.is_active !== false));
      setReports(r || []);
      setAlerts(a || []);
      setComms(c || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeFijs = fijs.filter(f => !f.status || f.status === 'active');
  const openingFijs = fijs.filter(f => f.status === 'opening');
  const myFijs = fijs.filter(f => f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id));
  const missingCr = activeFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const myMissingCr = myFijs.filter(f => !reports.some(r => r.fij_house_id === f.id));
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const totalParticipants = reports.reduce((s, r) => s + (r.participants_count || 0), 0);
  const newVisitors = reports.reduce((s, r) => s + (r.new_visitors_count || 0), 0);
  const myAlerts = alerts.filter(a => myFijs.some(f => f.id === a.fij_house_id));

  const isPilot = isFijPilot(user, fijs);
  const isCoord = isFijCoordination(user);
  const isDir = isFijDirection(user) && !isCoord;
  const hasNoAccess = !isPilot && !isCoord && !isDir;

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
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* En-tête */}
          <div>
            <p className="text-xs text-secondary uppercase tracking-widest mb-2">Département</p>
            <h1 className="text-2xl font-heading font-bold text-foreground">FIJ</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Familles d'Impact Jeunes — suivi des maisons, pilotes, comptes rendus et données opérationnelles.
            </p>
          </div>

          {/* Bloc mission court */}
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
              {isPilot && (
                <>
                  <AccessCard
                    to="/app/departements/fij/pilote"
                    icon={Users}
                    title="Entrer dans mon espace pilote"
                    desc="Gérez vos FIJ, remplissez vos comptes rendus et consultez les communications."
                    primary
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <KeyStat value={myFijs.length} label="Mes FIJ" />
                    <KeyStat value={myMissingCr.length} label="CR à remplir" />
                    <KeyStat value={myAlerts.length} label="Alertes" />
                  </div>
                </>
              )}

              {/* Coordination */}
              {isCoord && (
                <>
                  <AccessCard
                    to="/app/departements/fij/coordination"
                    icon={Shield}
                    title="Entrer dans l'espace coordination"
                    desc="Gérez le registre, les ouvertures, les consécrations, les CR et le reporting."
                    primary
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KeyStat value={activeFijs.length} label="FIJ actives" />
                    <KeyStat value={missingCr.length} label="CR manquants" />
                    <KeyStat value={criticalAlerts.length} label="Alertes" />
                    <KeyStat value={openingFijs.length} label="Ouvertures" />
                  </div>
                </>
              )}

              {/* Direction (bergère/bureau/leader sans rôle coordination) */}
              {isDir && (
                <AccessCard
                  to="/app/direction"
                  icon={BarChart3}
                  title="Voir la synthèse FIJ dans le tableau direction"
                  desc="Indicateurs globaux, alertes critiques, décisions à valider — consultables dans votre espace direction."
                  primary
                />
              )}

              {/* Aucun rôle */}
              {hasNoAccess && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Aucun accès FIJ actif</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                    Si vous êtes pilote ou membre de la coordination FIJ, demandez à un administrateur de configurer votre rôle.
                  </p>
                  <Link to="/app/departements" className="text-secondary text-sm font-medium">
                    ← Retour aux départements
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Chiffres clés globaux pour coordination */}
          {isCoord && (
            <div>
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Indicateurs réseau</h2>
              <div className="grid grid-cols-3 gap-3">
                <KeyStat value={totalParticipants} label="Participants" />
                <KeyStat value={newVisitors} label="Nouveaux" />
                <KeyStat value={`${reports.length}/${activeFijs.length}`} label="CR reçus" />
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