import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, ChevronRight, Loader2, Heart, Compass, ArrowRight,
  Calendar, AlertCircle, Briefcase, Users
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isFijPilot, isFijCoordination, getInternalIdentifier, getDisplayName, isAccountBlocked } from '@/lib/permissions';
import { loadCoordFijContext } from '@/lib/coordFijUtils';
import { isHiddenFromService } from '@/lib/departmentModules';
import PageHeader from '@/components/star/PageHeader';

/**
 * MonService — Point d'entrée personnel vers les départements de l'utilisateur.
 *
 * Sources de vérité :
 *   - DepartmentMember (appartenance départementale, rôle)
 *   - FIJ.pilot_user_id / copilot_user_id (pilote FIJ)
 *   - DepartmentMember → coordination-fij (coordination FIJ)
 *
 * Affiche :
 *   1. MES SERVICES — cartes pour chaque département actif (sauf pilote-fij, coordination-fij)
 *   2. MES RESPONSABILITÉS — Pilote FIJ + Coordination FIJ (si applicable)
 *   3. À VENIR — prochains événements globaux (si réels)
 *
 * Ne crée aucune donnée fictive. Les sections vides sans source réelle ne s'affichent pas.
 */
export default function MonService() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fijs, setFijs] = useState([]);
  const [events, setEvents] = useState([]);
  const [coordFijData, setCoordFijData] = useState({ memberships: null, coordFijDeptId: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      base44.auth.me(),
      base44.entities.DepartmentMember.filter({}, { limit: 500 }),
      base44.entities.Department.filter({ is_active: true }, { sort: 'display_order', limit: 50 }),
      base44.entities.FIJ.filter({ is_active: true }, { limit: 50 }),
      base44.entities.Event.filter({ is_active: true, event_date: { $gte: today } }, { sort: 'event_date', limit: 10 }),
      loadCoordFijContext(),
    ]).then(([u, m, d, f, e, ctx]) => {
      setUser(u);
      setMemberships(m?.items || m || []);
      setDepartments(d?.items || d || []);
      setFijs(f?.items || f || []);
      setEvents(e?.items || e || []);
      setCoordFijData(ctx);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  // Compte bloqué — aucun accès
  if (isAccountBlocked(user)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-danger/50 mx-auto mb-4" />
        <p className="text-sm font-semibold text-foreground mb-1">Compte suspendu</p>
        <p className="text-xs text-muted-foreground">Ton compte ne permet pas d'accéder à cet espace. Contacte un responsable.</p>
      </div>
    );
  }

  // Mes départements actifs (DepartmentMember où status = active ou is_active = true)
  const myActiveMemberships = memberships.filter(m =>
    m.user_id === user?.id &&
    (m.status === 'active' || (!m.status && m.is_active !== false))
  );

  // Filtrer les départements masqués (pilote-fij, coordination-fij) — gérés via responsabilités
  const myServiceMemberships = myActiveMemberships.filter(m => {
    const dept = departments.find(d => d.id === m.department_id);
    return dept && dept.is_active !== false && !isHiddenFromService(dept.slug);
  });

  // FIJ Pilot — source : FIJ.pilot_user_id / copilot_user_id
  const myPilotFijs = fijs.filter(f =>
    f.pilot_user_id === user?.id || f.copilot_user_id === user?.id
  );

  // Coordination FIJ — source : DepartmentMember → coordination-fij
  const isCoordFij = isFijCoordination(user, coordFijData.memberships, coordFijData.coordFijDeptId);
  const coordFijMembership = myActiveMemberships.find(m =>
    m.department_id === coordFijData.coordFijDeptId
  );

  // Événements à venir (globaux, audience pertinente)
  const upcomingEvents = events.filter(e =>
    e.audience === 'all_members' || e.audience === 'all_servants'
  ).slice(0, 4);

  const hasServices = myServiceMemberships.length > 0;
  const hasResponsibilities = myPilotFijs.length > 0 || isCoordFij;
  const hasUpcoming = upcomingEvents.length > 0;
  const isEmpty = !hasServices && !hasResponsibilities && !hasUpcoming;

  const firstName = user?.first_name || getDisplayName(user)?.split(' ')[0] || '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title={`Bonjour ${firstName}`}
        intention="Retrouve ici tes services, tes prochaines échéances et les informations utiles à ton engagement."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Mon Service' }]}
      />

      {isEmpty ? (
        /* État vide — utilisateur sans département ni responsabilité */
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border mb-4">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Tu n'es actuellement rattaché à aucun département.</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Si tu penses qu'il s'agit d'une erreur, rapproche-toi d'un responsable.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* === MES SERVICES === */}
          {hasServices && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Mes services</p>
              <div className="space-y-3">
                {myServiceMemberships.map(m => {
                  const dept = departments.find(d => d.id === m.department_id);
                  if (!dept) return null;
                  const teamSize = memberships.filter(mm =>
                    mm.department_id === dept.id &&
                    (mm.status === 'active' || (!mm.status && mm.is_active !== false))
                  ).length;
                  const roleLabel = ROLE_LABELS[m.role_in_dept] || 'Membre';

                  return (
                    <ServiceCard key={m.id} dept={dept} role={m.role_in_dept} roleLabel={roleLabel} teamSize={teamSize} />
                  );
                })}
              </div>
            </section>
          )}

          {/* === MES RESPONSABILITÉS === */}
          {hasResponsibilities && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Mes responsabilités</p>
              <div className="space-y-3">
                {/* Pilote FIJ — source : FIJ.pilot_user_id */}
                {myPilotFijs.map(fij => (
                  <ResponsibilityCard
                    key={`pilot-${fij.id}`}
                    icon={Compass}
                    title={fij.name || 'FIJ'}
                    roleLabel={fij.pilot_user_id === user?.id ? 'Pilote' : 'Copilote'}
                    description="Ton espace de pilotage FIJ"
                    to="/app/responsabilites/fij-pilote"
                    color="rose"
                  />
                ))}

                {/* Coordination FIJ — source : DepartmentMember → coordination-fij */}
                {isCoordFij && (
                  <ResponsibilityCard
                    key="coord-fij"
                    icon={Briefcase}
                    title="Coordination FIJ"
                    roleLabel={coordFijMembership ? (ROLE_LABELS[coordFijMembership.role_in_dept] || 'Membre') : 'Coordination'}
                    description="Toutes les FIJ, relances, reporting"
                    to="/app/responsabilites/fij-coordination"
                    color="amber"
                  />
                )}
              </div>
            </section>
          )}

          {/* === À VENIR === */}
          {hasUpcoming && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">À venir</p>
              <div className="space-y-2">
                {upcomingEvents.map(e => (
                  <Link
                    key={e.id}
                    to="/app/agenda"
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:border-secondary/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{e.event_date}</span>
                        {e.event_time && <span>· {e.event_time}</span>}
                        {e.location && <span>· {e.location}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const ROLE_LABELS = {
  responsable: 'Responsable',
  referent: 'Référent',
  coordinateur: 'Coordinateur',
  adjoint: 'Adjoint',
  pilote: 'Pilote',
  serviteur: 'Serviteur',
  membre: 'Membre',
};

const CARD_COLORS = {
  amber:  { bg: 'bg-secondary/8',  border: 'border-secondary/20', text: 'text-secondary', icon: 'bg-secondary/10 border-secondary/20' },
  rose:   { bg: 'bg-rose-500/8',   border: 'border-rose-400/20',  text: 'text-rose-600',   icon: 'bg-rose-500/10 border-rose-400/20' },
  blue:   { bg: 'bg-blue-500/8',   border: 'border-blue-400/20',  text: 'text-blue-600',   icon: 'bg-blue-500/10 border-blue-400/20' },
  green:  { bg: 'bg-green-500/8',  border: 'border-green-400/20', text: 'text-green-600',  icon: 'bg-green-500/10 border-green-400/20' },
  purple: { bg: 'bg-purple-500/8', border: 'border-purple-400/20',text: 'text-purple-600', icon: 'bg-purple-500/10 border-purple-400/20' },
  indigo: { bg: 'bg-indigo-500/8', border: 'border-indigo-400/20',text: 'text-indigo-600', icon: 'bg-indigo-500/10 border-indigo-400/20' },
};

function ServiceCard({ dept, role, roleLabel, teamSize }) {
  const colors = CARD_COLORS[dept.color] || CARD_COLORS.amber;
  const to = `/app/departements/${dept.slug || dept.id}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={to}
        className={`flex items-center gap-4 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98]`}
      >
        <div className={`w-11 h-11 rounded-xl ${colors.icon} border flex items-center justify-center flex-shrink-0`}>
          <Building2 className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
            {dept.short_name && (
              <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded px-1.5 py-0.5">{dept.short_name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${colors.text}`}>{roleLabel}</span>
            {teamSize > 0 && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> {teamSize}
                </span>
              </>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

function ResponsibilityCard({ icon: Icon, title, roleLabel, description, to, color }) {
  const colors = CARD_COLORS[color] || CARD_COLORS.amber;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={to}
        className={`flex items-center gap-4 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98]`}
      >
        <div className={`w-11 h-11 rounded-xl ${colors.icon} border flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${colors.text}`}>{roleLabel}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground truncate">{description}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </Link>
    </motion.div>
  );
}