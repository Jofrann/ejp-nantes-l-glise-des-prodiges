import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import { Users, FileText, Mail, FolderOpen, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PiloteHome() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [reports, setReports] = useState([]);
  const [comms, setComms] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const weekStart = getMonday(new Date());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.FijWeeklyReport.filter({ week_start: weekStart }, '-created_date', 200).catch(() => []),
      base44.entities.FijCommunication.filter({}, '-created_date', 10).catch(() => []),
    ]).then(([r, c]) => {
      setReports(r || []);
      setComms(c || []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const myFijs = fijs.filter(f =>
    f.pilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id)
  );
  const myFijIds = myFijs.map(f => f.id);
  const myReports = reports.filter(r => myFijIds.includes(r.fij_house_id));
  const crMissing = myFijs.filter(f => !myReports.some(r => r.fij_house_id === f.id));
  const myComms = comms.filter(c =>
    c.target_scope === 'all_pilots' ||
    (c.target_scope === 'specific_fij' && c.target_fij_ids?.some(id => myFijIds.includes(id)))
  );

  const base = '/app/departements/fij/pilote';
  const quickLinks = [
    { to: `${base}/mes-fij`, icon: Users, label: 'Mes FIJ', desc: `${myFijs.length} famille(s)` },
    { to: `${base}/cr`, icon: FileText, label: 'Comptes rendus', desc: `${crMissing.length} à remplir` },
    { to: `${base}/communications`, icon: Mail, label: 'Communications', desc: `${myComms.length} message(s)` },
    { to: `${base}/documents`, icon: FolderOpen, label: 'Documents', desc: 'Ressources utiles' },
    { to: `${base}/alertes`, icon: AlertTriangle, label: 'Signaler', desc: 'Besoin ou difficulté' },
  ];

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Espace Pilote"
      subtitle="Gérez vos FIJ et remplissez vos comptes rendus"
    >
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatBox value={myFijs.length} label="Mes FIJ" />
        <StatBox value={myReports.length} label="CR soumis" />
        <StatBox value={crMissing.length} label="CR à remplir" />
      </div>

      {/* Accès rapides */}
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Accès rapides</h2>
      <div className="space-y-2 mb-8">
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
              <link.icon className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* CR manquants */}
      {crMissing.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">CR à remplir cette semaine</h2>
          <div className="space-y-2">
            {crMissing.map(fij => (
              <Link
                key={fij.id}
                to={`/app/departements/fij/fij/${fij.id}/cr/nouveau`}
                className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl p-3 hover:border-warning/40 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fij.name}</p>
                  <p className="text-xs text-muted-foreground">{fij.city}</p>
                </div>
                <span className="text-xs text-warning font-medium">Remplir</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {myFijs.length === 0 && (
        <EmptyState
          icon={Users}
          title="Tu n'es pilote d'aucune FIJ"
          sub="Si tu penses qu'il s'agit d'une erreur, contacte la coordination FIJ."
        />
      )}
    </FijPageShell>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
      <p className="text-xl font-bold text-foreground">{value}</p>
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