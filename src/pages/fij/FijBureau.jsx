import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { canReadFijV2, isFijCoordinationRole } from '@/lib/fijPermissions';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import OverviewTab from '@/components/fij/bureau/OverviewTab';
import MembersTab from '@/components/fij/bureau/MembersTab';
import CrJeudiTab from '@/components/fij/bureau/CrJeudiTab';
import AssiduiteTab from '@/components/fij/bureau/AssiduiteTab';
import NotesTab from '@/components/fij/bureau/NotesTab';
import { Users, FileText, BarChart3, StickyNote, LayoutDashboard, AlertTriangle } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { key: 'members', label: 'Membres', icon: Users },
  { key: 'cr', label: 'CR du jeudi', icon: FileText },
  { key: 'assiduite', label: 'Assiduité', icon: BarChart3 },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

export default function FijBureau() {
  const { fijId } = useParams();
  const [user, setUser] = useState(null);
  const [fij, setFij] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [fijId]);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);

      const f = await base44.entities.FIJ.get(fijId);
      if (!canReadFijV2(u, f)) {
        setFij(null);
        setLoading(false);
        return;
      }
      setFij(f);

      const [m, r] = await Promise.all([
        base44.entities.FijMember.filter({ fij_id: fijId }, 'full_name', 200).catch(() => []),
        base44.entities.FijThursdayReport.filter({ fij_id: fijId }, '-thursday_date', 200).catch(() => []),
      ]);
      setMembers(m || []);
      setReports(r || []);
    } catch {
      setFij(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!fij) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-5">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">Accès restreint</p>
        <p className="text-xs text-muted-foreground mb-4">Vous n'avez pas accès à cette FIJ.</p>
        <Link to="/app/responsabilites" className="text-secondary text-sm font-medium">← Retour FIJ</Link>
      </div>
    );
  }

  const isCoordination = isFijCoordinationRole(user);
  const basePath = isCoordination
    ? '/app/responsabilites/fij-coordination/registre'
    : '/app/responsabilites/fij-pilote/mes-fij';

  const activeMembers = members.filter(m => m.is_active !== false);
  const lastReport = reports[0];
  const attendanceRate = lastReport?.attendance_rate || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'FIJ', to: '/app/responsabilites' },
              { label: isCoordination ? 'Registre' : 'Mes FI', to: isCoordination ? '/app/responsabilites/fij-coordination/registre' : '/app/responsabilites/fij-pilote/mes-fij' },
              { label: fij.name, to: `${basePath}/${fijId}` },
            ]}
            backTo={isCoordination ? '/app/responsabilites/fij-coordination/registre' : '/app/responsabilites/fij-pilote/mes-fij'}
            backLabel="← Retour"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">{fij.name}</h1>
                {fij.campus && <p className="text-sm text-muted-foreground">{fij.campus}</p>}
              </div>
              <StatusBadge status={fij.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Kpi label="Membres" value={`${activeMembers.length}/${fij.member_goal || 13}`} />
              <Kpi label="Dernier CR" value={lastReport ? new Date(lastReport.thursday_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'} />
              <Kpi label="Présence" value={`${attendanceRate}%`} />
              <Kpi label="CR totaux" value={reports.length} />
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              {fij.pilot_name && <span>👥 Pilote : <strong className="text-foreground">{fij.pilot_name}</strong></span>}
              {fij.copilot_name && <span>👥 Copilote : <strong className="text-foreground">{fij.copilot_name}</strong></span>}
              {fij.meeting_day && <span>📅 {fij.meeting_day} {fij.meeting_time || ''}</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && <OverviewTab fij={fij} members={activeMembers} reports={reports} basePath={basePath} />}
          {activeTab === 'members' && <MembersTab fij={fij} members={activeMembers} user={user} onReload={loadData} basePath={basePath} />}
          {activeTab === 'cr' && <CrJeudiTab fij={fij} reports={reports} user={user} basePath={basePath} />}
          {activeTab === 'assiduite' && <AssiduiteTab fij={fij} members={activeMembers} reports={reports} />}
          {activeTab === 'notes' && <NotesTab fij={fij} members={activeMembers} user={user} />}
        </motion.div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', cls: 'bg-success/10 text-success border-success/20' },
    paused: { label: 'En pause', cls: 'bg-warning/10 text-warning border-warning/20' },
    opening: { label: 'Ouverture', cls: 'bg-primary/10 text-primary border-primary/20' },
    closed: { label: 'Fermée', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[status] || config.active;
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.cls}`}>{c.label}</span>;
}