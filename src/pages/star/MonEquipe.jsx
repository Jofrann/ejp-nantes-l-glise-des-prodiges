import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users, LayoutDashboard, CheckCircle, CalendarClock, Target,
  Loader2, ChevronRight, AlertCircle, User, ArrowLeft,
  TrendingUp, GraduationCap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hasRole, isBureauLike, canReadDepartment } from '@/lib/permissions';
import PageHeader from '@/components/star/PageHeader';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'attendance', label: 'Présences', icon: CheckCircle },
  { id: 'appointments', label: 'Entretiens', icon: CalendarClock },
  { id: 'goals', label: 'Objectifs', icon: Target },
];

export default function MonEquipe() {
  const { userId } = useParams();
  const navigate = useNavigate();

  if (userId) {
    return <MemberDetail userId={userId} onBack={() => navigate('/app/equipe')} />;
  }

  return <EquipeDashboard />;
}

function EquipeDashboard() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.DepartmentMember.filter({ is_active: true }, '-created_date', 200),
      base44.entities.Department.filter({ is_active: true }, 'display_order', 50),
      base44.entities.User.list('-created_date', 200),
      base44.entities.AttendanceResponse.filter({}, '-created_date', 200),
      base44.entities.AppointmentRequest.filter({}, '-created_date', 100),
      base44.entities.PersonalGoal.filter({}, '-created_date', 200),
    ]).then(([u, m, d, users, a, appt, g]) => {
      setUser(u);
      setMemberships(m || []);
      setDepartments(d || []);
      setAllUsers(users || []);
      setAttendances(a || []);
      setAppointments(appt || []);
      setGoals(g || []);
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

  // User's managed departments (as referent or bureau)
  const myManagedDeptIds = memberships
    .filter(m => m.user_id === user?.id && m.role_in_dept === 'referent')
    .map(m => m.department_id);
  const isBureau = isBureauLike(user);
  const managedDepts = isBureau
    ? departments
    : departments.filter(d => myManagedDeptIds.includes(d.id));

  // Team members in managed departments
  const managedDeptIds = managedDepts.map(d => d.id);
  const teamMemberIds = [...new Set(
    memberships
      .filter(m => managedDeptIds.includes(m.department_id) && m.is_active !== false)
      .map(m => m.user_id)
  )];
  const teamMembers = allUsers.filter(u => teamMemberIds.includes(u.id));

  // Team data
  const teamAttendances = attendances.filter(a => teamMemberIds.includes(a.created_by_id));
  const teamAppointments = appointments.filter(a =>
    teamMemberIds.includes(a.created_by_id) ||
    a.reviewed_by === user?.id
  );
  const teamGoals = goals.filter(g => teamMemberIds.includes(g.created_by_id));

  // Stats
  const presentCount = teamAttendances.filter(a => a.status === 'present').length;
  const attendanceRate = teamAttendances.length > 0
    ? Math.round((presentCount / teamAttendances.length) * 100)
    : 0;
  const pendingAppointments = teamAppointments.filter(a => a.status === 'pending');
  const activeGoals = teamGoals.filter(g => g.status === 'active');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mon Équipe"
        intention={isBureau ? 'Vue globale sur tous les serviteurs et départements.' : 'Vision de ton équipe, limitée à ton périmètre.'}
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Mon Équipe' }]}
      />

      {/* Departments chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {managedDepts.map(d => (
          <Link key={d.id} to={`/app/departements/${d.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:border-secondary/30 transition-colors">
            <Users className="w-3 h-3 text-secondary" />
            {d.name}
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-none -mx-1 px-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              memberCount={teamMembers.length}
              attendanceRate={attendanceRate}
              pendingAppointments={pendingAppointments.length}
              activeGoals={activeGoals.length}
              managedDepts={managedDepts}
            />
          )}
          {activeTab === 'members' && (
            <MembersTab members={teamMembers} memberships={memberships} managedDeptIds={managedDeptIds} />
          )}
          {activeTab === 'attendance' && (
            <AttendanceTab attendances={teamAttendances} members={teamMembers} />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsTab appointments={teamAppointments} members={teamMembers} />
          )}
          {activeTab === 'goals' && (
            <GoalsTab goals={teamGoals} members={teamMembers} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ memberCount, attendanceRate, pendingAppointments, activeGoals, managedDepts }) {
  const stats = [
    { icon: Users, label: 'Membres', value: memberCount, color: 'text-secondary' },
    { icon: TrendingUp, label: 'Taux de présence', value: `${attendanceRate}%`, color: 'text-success' },
    { icon: CalendarClock, label: 'Entretiens en attente', value: pendingAppointments, color: 'text-warning' },
    { icon: Target, label: 'Objectifs actifs', value: activeGoals, color: 'text-info' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Départements sous ma responsabilité</p>
        <div className="space-y-2">
          {managedDepts.map(d => (
            <Link key={d.id} to={`/app/departements/${d.slug}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface transition-colors">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                {d.description && <p className="text-xs text-muted-foreground truncate">{d.description}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembersTab({ members, memberships, managedDeptIds }) {
  if (members.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun membre dans ton équipe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map(m => {
        const memberDepts = memberships.filter(mem =>
          mem.user_id === m.id && managedDeptIds.includes(mem.department_id)
        );
        const isReferent = memberDepts.some(md => md.role_in_dept === 'referent');
        return (
          <Link
            key={m.id}
            to={`/app/equipe/membres/${m.id}`}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-xs font-bold text-secondary flex-shrink-0">
              {m.full_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{m.full_name || 'Sans nom'}</p>
              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
            </div>
            {isReferent && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-secondary/10 text-secondary">
                Référent
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}

function AttendanceTab({ attendances, members }) {
  if (attendances.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucune présence enregistrée dans ton équipe.</p>
      </div>
    );
  }

  const memberName = (id) => members.find(m => m.id === id)?.full_name || '—';

  return (
    <div className="space-y-2">
      {attendances.slice(0, 30).map(a => (
        <div key={a.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5">
          <div className={`w-2 h-2 rounded-full ${attStatusColor(a.status)}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{a.event_title || 'Événement'}</p>
            <p className="text-xs text-muted-foreground">{memberName(a.created_by_id)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{a.event_date}</p>
            <p className="text-xs font-medium text-foreground">{attStatusLabel(a.status)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AppointmentsTab({ appointments, members }) {
  if (appointments.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <CalendarClock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun entretien dans ton périmètre.</p>
      </div>
    );
  }

  const memberName = (id) => members.find(m => m.id === id)?.full_name || '—';

  return (
    <div className="space-y-2">
      {appointments.map(a => (
        <div key={a.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5">
          <div className={`w-2 h-2 rounded-full ${apptStatusColor(a.status)}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{a.subject}</p>
            <p className="text-xs text-muted-foreground">{memberName(a.created_by_id)} · {a.request_type}</p>
          </div>
          <span className="text-xs text-muted-foreground">{apptStatusLabel(a.status)}</span>
        </div>
      ))}
    </div>
  );
}

function GoalsTab({ goals, members }) {
  if (goals.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun objectif dans ton équipe.</p>
      </div>
    );
  }

  const memberName = (id) => members.find(m => m.id === id)?.full_name || '—';

  return (
    <div className="space-y-2">
      {goals.map(g => (
        <div key={g.id} className="bg-card border border-border rounded-xl p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{g.title}</p>
              <p className="text-xs text-muted-foreground">{memberName(g.created_by_id)}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${goalStatusStyle(g.status)}`}>
              {goalStatusLabel(g.status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberDetail({ userId, onBack }) {
  const [member, setMember] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list('-created_date', 200),
      base44.entities.DepartmentMember.filter({ user_id: userId, is_active: true }, '-created_date', 50),
      base44.entities.AttendanceResponse.filter({ created_by_id: userId }, '-created_date', 50),
      base44.entities.AppointmentRequest.filter({ created_by_id: userId }, '-created_date', 20),
      base44.entities.PersonalGoal.filter({ created_by_id: userId }, '-created_date', 50),
    ]).then(([users, m, a, appt, g]) => {
      setMember(users?.find(u => u.id === userId) || null);
      setMemberships(m || []);
      setAttendances(a || []);
      setAppointments(appt || []);
      setGoals(g || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
        <p className="text-sm text-muted-foreground">Membre introuvable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'équipe
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-lg font-bold text-secondary">
          {member.full_name?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">{member.full_name}</h1>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departments */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-secondary" /> Départements
          </p>
          {memberships.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun rattachement.</p>
          ) : (
            <div className="space-y-2">
              {memberships.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{m.department_id}</span>
                  {m.role_in_dept && (
                    <span className="text-muted-foreground capitalize">{m.role_in_dept}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance summary */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Présences récentes
          </p>
          {attendances.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune présence enregistrée.</p>
          ) : (
            <div className="space-y-1.5">
              {attendances.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${attStatusColor(a.status)}`} />
                  <span className="text-foreground truncate flex-1">{a.event_title || 'Événement'}</span>
                  <span className="text-muted-foreground">{attStatusLabel(a.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-secondary" /> Entretiens
          </p>
          {appointments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun entretien.</p>
          ) : (
            <div className="space-y-1.5">
              {appointments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${apptStatusColor(a.status)}`} />
                  <span className="text-foreground truncate flex-1">{a.subject}</span>
                  <span className="text-muted-foreground">{apptStatusLabel(a.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-secondary" /> Objectifs de service
          </p>
          {goals.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun objectif.</p>
          ) : (
            <div className="space-y-1.5">
              {goals.slice(0, 5).map(g => (
                <div key={g.id} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground truncate flex-1">{g.title}</span>
                  <span className={`px-1.5 py-0.5 rounded ${goalStatusStyle(g.status)}`}>{goalStatusLabel(g.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Privacy note */}
      <div className="mt-4 flex items-start gap-2.5 bg-purple-500/5 border border-purple-400/20 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          Cette fiche est limitée aux données de service. Les notes personnelles, rendez-vous pastoraux et données académiques détaillées ne sont pas visibles.
        </p>
      </div>
    </div>
  );
}

function attStatusLabel(s) {
  const labels = { present: 'Présent', absent: 'Absent', late: 'En retard', no_response: 'En attente' };
  return labels[s] || s;
}

function attStatusColor(s) {
  const colors = { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning', no_response: 'bg-muted-foreground/30' };
  return colors[s] || 'bg-muted-foreground/30';
}

function apptStatusLabel(s) {
  const labels = { pending: 'En attente', accepted: 'Accepté', proposed: 'Proposé', completed: 'Terminé', cancelled: 'Annulé', transferred: 'Transféré' };
  return labels[s] || s;
}

function apptStatusColor(s) {
  const colors = { pending: 'bg-amber-500', accepted: 'bg-success', proposed: 'bg-info', completed: 'bg-muted-foreground/30', cancelled: 'bg-danger', transferred: 'bg-purple-500' };
  return colors[s] || 'bg-muted-foreground/30';
}

function goalStatusLabel(s) {
  const labels = { idea: 'Idée', active: 'Actif', paused: 'En pause', done: 'Atteint', abandoned: 'Abandonné' };
  return labels[s] || s;
}

function goalStatusStyle(s) {
  const styles = {
    idea: 'bg-surface text-muted-foreground',
    active: 'bg-secondary/10 text-secondary',
    paused: 'bg-amber-500/10 text-amber-600',
    done: 'bg-success/10 text-success',
    abandoned: 'bg-danger/10 text-danger',
  };
  return styles[s] || 'bg-surface text-muted-foreground';
}