import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Loader2, Lock, ArrowLeft, AlertCircle,
  LayoutDashboard, Building2, Users, TrendingUp, Calendar,
  AlertCircle as AlertIcon, CheckSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PILOTAGE_TABS } from '@/lib/pilotageConstants';
import PilotageOverviewTab from '@/components/pilotage/PilotageOverviewTab';
import PilotageDepartmentsTab from '@/components/pilotage/PilotageDepartmentsTab';
import PilotagePeopleTab from '@/components/pilotage/PilotagePeopleTab';
import PilotageGrowthTab from '@/components/pilotage/PilotageGrowthTab';
import PilotageMinistryLifeTab from '@/components/pilotage/PilotageMinistryLifeTab';
import PilotageAlertsTab from '@/components/pilotage/PilotageAlertsTab';
import PilotageDecisionsTab from '@/components/pilotage/PilotageDecisionsTab';

const ICON_MAP = {
  LayoutDashboard, Building2, Users, TrendingUp, Calendar, AlertCircle, CheckSquare,
};

export default function Pilotage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setAccessDenied(false);
    try {
      const res = (await base44.functions.invoke('getPilotageData', {})).data;
      if (res.access_denied) {
        setAccessDenied(true);
      } else if (res.error) {
        setError(res.error);
      } else {
        setData(res);
      }
    } catch (e) {
      const msg = e?.message || e?.toString() || '';
      if (msg.includes('403') || msg.includes('access_denied')) {
        setAccessDenied(true);
      } else {
        setError('Une erreur est survenue lors du chargement.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const refresh = async () => {
    try {
      const res = (await base44.functions.invoke('getPilotageData', {})).data;
      if (!res.access_denied && !res.error) {
        setData(res);
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6 text-danger/60" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Accès Pilotage restreint</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">
          Cet espace de direction est réservé à la Bergère, aux leaders autorisés et à l'administration.
        </p>
        <Link to="/app" className="text-secondary text-sm">← Retour à l'accueil</Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Une erreur est survenue</p>
        <p className="text-xs text-muted-foreground mb-5">{error || 'Impossible de charger Pilotage.'}</p>
        <Link to="/app" className="text-secondary text-sm">← Retour à l'accueil</Link>
      </div>
    );
  }

  const alertCount = data.alerts?.length || 0;
  const openDecisions = (data.decisions || []).filter(d => d.status === 'open' || d.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-secondary/5 blur-[140px] opacity-50" />
      </div>

      {/* Header fixe */}
      <div className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 py-2">
            <Link to="/app" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Accueil
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground">Pilotage</span>
          </div>

          {/* Identité Pilotage */}
          <div className="py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-heading font-bold text-foreground">Pilotage</p>
              <p className="text-xs text-muted-foreground">Vision globale du ministère EJP Nantes</p>
            </div>
            {alertCount > 0 && (
              <Link to="/app/pilotage" onClick={() => setActiveTab('alerts')} className="flex items-center gap-1.5 text-xs bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-xl">
                <AlertIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{alertCount} alerte{alertCount > 1 ? 's' : ''}</span>
              </Link>
            )}
            {openDecisions > 0 && (
              <Link to="/app/pilotage" onClick={() => setActiveTab('decisions')} className="flex items-center gap-1.5 text-xs bg-secondary/10 border border-secondary/20 text-secondary px-3 py-2 rounded-xl">
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{openDecisions} suivi{openDecisions > 1 ? 's' : ''}</span>
              </Link>
            )}
          </div>

          {/* Navigation par onglets */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-2">
            {PILOTAGE_TABS.map(tab => {
              const Icon = ICON_MAP[tab.icon] || LayoutDashboard;
              const active = activeTab === tab.id;
              const badge = tab.id === 'alerts' ? alertCount : tab.id === 'decisions' ? openDecisions : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {badge > 0 && (
                    <span className="ml-0.5 min-w-4 h-4 px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative max-w-5xl mx-auto pb-20">
        <div className="px-4 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'overview' && (
                <PilotageOverviewTab data={data} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'departments' && (
                <PilotageDepartmentsTab data={data} />
              )}
              {activeTab === 'people' && (
                <PilotagePeopleTab data={data} />
              )}
              {activeTab === 'growth' && (
                <PilotageGrowthTab data={data} />
              )}
              {activeTab === 'ministry' && (
                <PilotageMinistryLifeTab data={data} />
              )}
              {activeTab === 'alerts' && (
                <PilotageAlertsTab data={data} onRefresh={refresh} />
              )}
              {activeTab === 'decisions' && (
                <PilotageDecisionsTab data={data} onRefresh={refresh} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}