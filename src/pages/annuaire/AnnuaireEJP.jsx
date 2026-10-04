import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, UserPlus, Users, Star, GraduationCap, ShieldCheck, Clock, Loader2, Filter, X } from 'lucide-react';
import PersonCard from '@/components/annuaire/PersonCard';
import CreatePersonWizard from '@/components/annuaire/CreatePersonWizard';
import { BADGES, DEPT_ROLES } from '@/lib/annuaireConstants';

export default function AnnuaireEJP() {
  const [persons, setPersons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBadge, setFilterBadge] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [searchRes, statsRes, deptsRes] = await Promise.all([
        base44.functions.invoke('annuaireSearch', {
          action: 'search',
          search,
          filter_status: filterStatus,
          filter_badge: filterBadge,
          filter_department: filterDept,
          filter_role: filterRole,
        }),
        base44.functions.invoke('annuaireSearch', { action: 'stats' }),
        base44.entities.Department.filter({ is_active: true }, { sort: 'display_order', limit: 50 }),
      ]);
      setPersons(searchRes.data?.persons || []);
      setStats(searchRes.data || statsRes.data);
      setStats(statsRes.data);
      const deptList = deptsRes?.items || deptsRes || [];
      setDepartments(deptList.filter(d => d.status === 'active'));
    } catch (e) {
      console.error('Annuaire load error:', e);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterBadge, filterDept, filterRole]);

  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(() => load(), search ? 300 : 0);
    setSearchTimer(t);
    return () => clearTimeout(t);
  }, [load]);

  const hasActiveFilters = filterStatus !== 'all' || filterBadge !== 'all' || filterDept !== 'all' || filterRole !== 'all';

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterBadge('all');
    setFilterDept('all');
    setFilterRole('all');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Annuaire EJP</h1>
            <p className="text-sm text-muted-foreground mt-1">Centre de gestion des personnes</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter une personne
          </button>
        </div>

        {/* Stats légères */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard icon={Users} label="Personnes" value={stats.total} color="text-foreground" />
            <StatCard icon={Star} label="STAR" value={stats.star} color="text-secondary" />
            <StatCard icon={GraduationCap} label="Étudiants" value={stats.etudiant} color="text-blue-600" />
            <StatCard icon={ShieldCheck} label="Responsables" value={stats.responsables} color="text-purple-600" />
            <StatCard icon={Clock} label="En attente" value={stats.pending} color="text-amber-600" />
            <StatCard icon={Users} label="Actifs" value={stats.active} color="text-emerald-600" />
          </div>
        )}

        {/* Recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 transition"
            placeholder="Rechercher par prénom, nom ou identifiant EJP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition ${showFilters || hasActiveFilters ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtres
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition">
              <X className="w-3 h-3" />
              Effacer
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-5 space-y-4">
            {/* Statut */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-2">Statut du compte</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'active', 'suspended', 'archived'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${filterStatus === s ? 'bg-secondary/15 border-secondary/40 text-secondary' : 'bg-card border-border text-muted-foreground hover:border-secondary/30'}`}
                  >
                    {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'active' ? 'Actif' : s === 'suspended' ? 'Suspendu' : 'Archivé'}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-2">Badge</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterBadge('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${filterBadge === 'all' ? 'bg-secondary/15 border-secondary/40 text-secondary' : 'bg-card border-border text-muted-foreground hover:border-secondary/30'}`}
                >
                  Tous
                </button>
                {BADGES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setFilterBadge(b.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${filterBadge === b.id ? 'bg-secondary/15 border-secondary/40 text-secondary' : 'bg-card border-border text-muted-foreground hover:border-secondary/30'}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Département + Rôle */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-2">Département</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50"
                >
                  <option value="all">Tous les départements</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-2">Rôle départemental</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50"
                >
                  <option value="all">Tous les rôles</option>
                  {DEPT_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune personne trouvée.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {persons.map(p => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreatePersonWizard
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}