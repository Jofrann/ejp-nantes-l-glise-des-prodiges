import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, MessageSquare, Calendar, CheckCircle,
  Users, ChevronRight, Loader2, MapPin, Clock, AlertCircle, Target,
  FileText, Video, BookOpen, ArrowRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hasRole, isBureauLike } from '@/lib/permissions';
import PageHeader from '@/components/star/PageHeader';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'department', label: 'Mon Département', icon: Building2 },
  { id: 'feedback', label: 'Mon Feedback', icon: MessageSquare },
  { id: 'meetings', label: 'Mes Réunions', icon: Calendar },
  { id: 'attendance', label: 'Mes Présences', icon: CheckCircle },
];

export default function MonService() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.DepartmentMember.filter({ is_active: true }, '-created_date', 50),
      base44.entities.Department.filter({ is_active: true }, 'display_order', 50),
      base44.entities.Event.filter({ is_active: true, event_date: { $gte: new Date().toISOString().split('T')[0] } }, 'event_date', 20),
      base44.entities.AttendanceResponse.filter({}, '-created_date', 50),
      base44.entities.TrainingProgram.filter({ status: 'published' }, 'display_order', 50),
      base44.entities.TrainingSubmission.filter({}, '-created_date', 50),
    ]).then(([u, m, d, e, a, t, s]) => {
      setUser(u);
      setMemberships(m || []);
      setDepartments(d || []);
      setEvents(e || []);
      setAttendances(a || []);
      setTrainings(t || []);
      setSubmissions(s || []);
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

  // User's departments
  const myDeptIds = memberships
    .filter(m => m.user_id === user?.id)
    .map(m => m.department_id);
  const myDepartments = departments.filter(d => myDeptIds.includes(d.id));
  const primaryDept = myDepartments[0];

  // Upcoming events for user
  const upcomingEvents = events.filter(e =>
    e.audience === 'all_members' || e.audience === 'all_servants'
  ).slice(0, 5);

  // Attendance history
  const myAttendances = attendances.filter(a => a.created_by_id === user?.id);

  // Training progress
  const mySubmissions = submissions.filter(s => s.created_by_id === user?.id);
  const pendingTrainings = trainings.filter(t =>
    t.assigned_roles?.includes('all') || t.assigned_roles?.includes('star_serviteur')
  ).filter(t => {
    const sub = mySubmissions.find(s => s.program_id === t.id);
    return !sub || sub.status === 'not_started' || sub.status === 'in_progress';
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mon Service"
        intention="Tout ce qui concerne ton service, ton département et tes engagements."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Mon Service' }]}
      />

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
              user={user}
              primaryDept={primaryDept}
              myDepartments={myDepartments}
              upcomingEvents={upcomingEvents}
              myAttendances={myAttendances}
              pendingTrainings={pendingTrainings}
            />
          )}
          {activeTab === 'department' && (
            <DepartmentTab departments={myDepartments} memberships={memberships} />
          )}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'meetings' && <MeetingsTab events={upcomingEvents} />}
          {activeTab === 'attendance' && (
            <AttendanceTab events={events} attendances={myAttendances} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ user, primaryDept, myDepartments, upcomingEvents, myAttendances, pendingTrainings }) {
  const nextEvent = upcomingEvents[0];
  const recentAttendance = myAttendances[0];

  const cards = [
    {
      icon: Building2,
      label: 'Département',
      value: primaryDept?.name || 'Non assigné',
      sub: primaryDept?.description || 'Contacte un responsable',
      to: primaryDept ? `/app/departements/${primaryDept.slug}` : null,
    },
    {
      icon: Calendar,
      label: 'Prochaine réunion',
      value: nextEvent?.title || 'Aucune prévue',
      sub: nextEvent ? `${nextEvent.event_date}${nextEvent.event_time ? ' à ' + nextEvent.event_time : ''}` : '',
      to: nextEvent ? '/app/agenda' : null,
    },
    {
      icon: CheckCircle,
      label: 'Présence récente',
      value: recentAttendance ? statusLabel(recentAttendance.status) : 'Aucun enregistrement',
      sub: recentAttendance?.event_title || '',
      to: null,
    },
    {
      icon: AlertCircle,
      label: 'Formation obligatoire',
      value: pendingTrainings.length > 0 ? `${pendingTrainings.length} en attente` : 'À jour',
      sub: pendingTrainings[0]?.title || '',
      to: '/app/formations',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const content = (
            <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4 h-full hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{c.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{c.value}</p>
                {c.sub && <p className="text-xs text-muted-foreground truncate mt-0.5">{c.sub}</p>}
              </div>
              {c.to && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </div>
          );
          return c.to ? (
            <Link key={i} to={c.to}>{content}</Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>

      {/* Badges / rôles */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Mes rattachements</p>
        {myDepartments.length === 0 ? (
          <p className="text-xs text-muted-foreground">Tu n'es pas encore rattaché à un département.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {myDepartments.map(d => (
              <Link
                key={d.id}
                to={`/app/departements/${d.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:border-secondary/30 transition-colors"
              >
                <Building2 className="w-3 h-3 text-secondary" />
                {d.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentTab({ departments, memberships }) {
  if (departments.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Tu n'es rattaché à aucun département.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map(dept => {
        const teamMembers = memberships.filter(m => m.department_id === dept.id && m.is_active !== false);
        const referents = teamMembers.filter(m => m.role_in_dept === 'referent');
        return (
          <div key={dept.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-heading font-bold text-foreground">{dept.name}</h3>
                  {dept.description && <p className="text-sm text-muted-foreground mt-0.5">{dept.description}</p>}
                </div>
                <Link
                  to={`/app/departements/${dept.slug}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors flex-shrink-0"
                >
                  Ouvrir <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {dept.mission && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Mission</p>
                  <p className="text-sm text-foreground leading-relaxed">{dept.mission}</p>
                </div>
              )}
              {dept.rythme_travail && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Rythme : {dept.rythme_travail}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {teamMembers.length} membre(s) · {referents.length} référent(s)
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeedbackTab() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm font-semibold text-foreground mb-1">Aucun feedback pour le moment</p>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
        Les feedbacks de service sont rédigés par tes responsables. Ils apparaîtront ici quand ils seront disponibles.
      </p>
    </div>
  );
}

function MeetingsTab({ events }) {
  if (events.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucune réunion à venir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
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
          {e.meet_url && (
            <a href={e.meet_url} target="_blank" rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[10px] font-semibold hover:bg-secondary/20 transition-colors">
              Rejoindre
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function AttendanceTab({ events, attendances }) {
  const culteEvents = events.filter(e => e.event_type === 'culte' || e.event_type === 'service');

  if (attendances.length === 0 && culteEvents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucune présence enregistrée.</p>
        <Link to="/app/presences" className="inline-flex items-center gap-1 mt-3 text-xs text-secondary font-semibold">
          Confirmer ma présence <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-foreground mb-3">À confirmer</p>
        {culteEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune présence à confirmer.</p>
        ) : (
          <div className="space-y-2">
            {culteEvents.map(e => (
              <Link key={e.id} to="/app/presences"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface transition-colors">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.event_date}{e.event_time ? ' à ' + e.event_time : ''}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Historique</p>
        {attendances.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun historique.</p>
        ) : (
          <div className="space-y-2">
            {attendances.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2">
                <div className={`w-2 h-2 rounded-full ${statusColor(a.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.event_title || 'Événement'}</p>
                  <p className="text-xs text-muted-foreground">{a.event_date}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{statusLabel(a.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function statusLabel(status) {
  const labels = { present: 'Présent', absent: 'Absent', late: 'En retard', no_response: 'En attente' };
  return labels[status] || status;
}

function statusColor(status) {
  const colors = {
    present: 'bg-success',
    absent: 'bg-danger',
    late: 'bg-warning',
    no_response: 'bg-muted-foreground/30',
  };
  return colors[status] || 'bg-muted-foreground/30';
}