import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FijPageShell, { LoadingSpinner, EmptyState } from '@/components/fij/FijPageShell';
import { useFijData } from '@/hooks/useFijData';
import FijWorkspaceCard from '@/components/fij/FijWorkspaceCard';
import { Users, FileText, Mail, AlertTriangle, ArrowRight, FolderOpen } from 'lucide-react';

export default function PiloteHome() {
  const { user, fijs, loading, accessLevel } = useFijData();
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [comms, setComms] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || fijs.length === 0) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    const fijIds = fijs.map(f => f.id);
    Promise.all([
      Promise.all(fijIds.map(id => base44.entities.FijMember.filter({ fij_id: id }, 'full_name', 200).catch(() => []))),
      base44.entities.FijThursdayReport.filter({}, '-thursday_date', 200).catch(() => []),
      base44.entities.FijCommunication.filter({}, '-created_date', 5).catch(() => []),
    ]).then(([memberArrays, allReports, allComms]) => {
      setMembers(memberArrays.flat());
      setReports(allReports || []);
      setComms(allComms || []);
      setDataLoading(false);
    });
  }, [user, fijs]);

  if (loading || dataLoading) return <LoadingSpinner />;

  const myFijs = fijs.filter(f =>
    f.pilot_user_id === user?.id || f.copilot_user_id === user?.id || (f.co_pilot_user_ids || []).includes(user?.id)
  );
  const myFijIds = myFijs.map(f => f.id);
  const myReports = reports.filter(r => myFijIds.includes(r.fij_id));
  const myComms = comms.filter(c =>
    c.target_scope === 'all_pilots' ||
    (c.target_scope === 'specific_fij' && c.target_fij_ids?.some(id => myFijIds.includes(id)))
  );

  const getLastReport = (fijId) => myReports.find(r => r.fij_id === fijId);
  const getMembers = (fijId) => members.filter(m => m.fij_id === fijId);

  const totalActiveMembers = myFijs.reduce(
    (sum, f) => sum + getMembers(f.id).filter(m => m.is_active !== false).length, 0
  );
  const lastOverallReport = myReports[0];
  const lastCrDate = lastOverallReport
    ? new Date(lastOverallReport.thursday_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : '—';

  const base = '/app/departements/fij/pilote';

  return (
    <FijPageShell
      accessLevel={accessLevel}
      title="Mon espace FIJ"
      subtitle="Vos familles, vos membres, vos comptes rendus"
    >
      {myFijs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tu n'es pilote d'aucune FIJ"
          sub="Si tu penses qu'il s'agit d'une erreur, contacte la coordination FIJ."
        />
      ) : (
        <>
          {/* Global stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatBox value={myFijs.length} label="Mes FIJ" />
            <StatBox value={totalActiveMembers} label="Membres" />
            <StatBox value={lastCrDate} label="Dernier CR" />
          </div>

          {/* Communications */}
          {myComms.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Communications</h2>
              <div className="space-y-2">
                {myComms.slice(0, 3).map(c => (
                  <Link
                    key={c.id}
                    to={`${base}/communications`}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.content?.substring(0, 60)}…
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FIJ workspace cards */}
          <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Mes familles</h2>
          <div className="space-y-4">
            {myFijs.map((fij, i) => (
              <motion.div
                key={fij.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FijWorkspaceCard
                  fij={fij}
                  members={getMembers(fij.id)}
                  lastReport={getLastReport(fij.id)}
                  user={user}
                />
              </motion.div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-8">
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Ressources</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink to={`${base}/documents`} icon={FolderOpen} label="Documents" />
              <QuickLink to={`${base}/alertes`} icon={AlertTriangle} label="Signaler" />
            </div>
          </div>
        </>
      )}
    </FijPageShell>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 bg-card border border-border rounded-xl p-3 hover:border-secondary/30 transition-colors shadow-sm"
    >
      <Icon className="w-4 h-4 text-secondary" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
    </Link>
  );
}