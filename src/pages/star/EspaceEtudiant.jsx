import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Map, Target, BookOpen, HeartHandshake,
  Loader2, ChevronRight, Plus, Calendar, FileText,
  TrendingUp, AlertCircle, Save, Check
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hasRole } from '@/lib/permissions';
import PageHeader from '@/components/star/PageHeader';

const TABS = [
  { id: 'parcours', label: 'Mon parcours', icon: Map },
  { id: 'suivi', label: 'Mon suivi', icon: TrendingUp },
  { id: 'objectifs', label: 'Mes objectifs', icon: Target },
  { id: 'ressources', label: 'Mes ressources', icon: BookOpen },
  { id: 'accompagnement', label: 'Accompagnement', icon: HeartHandshake },
];

export default function EspaceEtudiant() {
  const [user, setUser] = useState(null);
  const [journey, setJourney] = useState(null);
  const [goals, setGoals] = useState([]);
  const [resources, setResources] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('parcours');

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.ServantJourney.list('-updated_date', 1),
      base44.entities.PersonalGoal.filter({}, '-created_date', 50),
      base44.entities.StarResource.filter({ is_active: true }, 'display_order', 50),
      base44.entities.AppointmentRequest.filter({}, '-created_date', 20),
    ]).then(([u, j, g, r, appt]) => {
      setUser(u);
      setJourney(j && j.length > 0 ? j[0] : {});
      setGoals(g || []);
      setResources(r || []);
      setAppointments(appt || []);
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

  const academicGoals = goals.filter(g => g.category === 'academique' || g.category === 'professionnel');
  const studentResources = resources.filter(r =>
    r.category === 'document' || r.category === 'lien' || r.category === 'livre' || r.category === 'video'
  );
  const myAppointments = appointments.filter(a => a.created_by_id === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Mon Espace Étudiant"
        intention="Ton parcours académique, ton suivi et ton accompagnement — en toute confidentialité."
        breadcrumbs={[{ label: 'Accueil', to: '/app' }, { label: 'Espace Étudiant' }]}
      />

      {/* Confidentiality note */}
      <div className="flex items-start gap-2.5 bg-purple-500/5 border border-purple-400/20 rounded-xl p-3 mb-5">
        <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          Tes données académiques sont <strong>confidentielles</strong>. Seuls ton mentor assigné et la Vie Académique y ont accès selon leur mandat.
        </p>
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
          {activeTab === 'parcours' && <ParcoursTab journey={journey} />}
          {activeTab === 'suivi' && <SuiviTab journey={journey} />}
          {activeTab === 'objectifs' && <ObjectifsTab goals={academicGoals} />}
          {activeTab === 'ressources' && <RessourcesTab resources={studentResources} />}
          {activeTab === 'accompagnement' && <AccompagnementTab appointments={myAppointments} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ParcoursTab({ journey }) {
  const fields = [
    { label: 'Domaine d\'études', value: journey.education_program },
    { label: 'Établissement', value: journey.education_school },
    { label: 'Niveau', value: journey.education_level },
    { label: 'Année', value: journey.education_year },
    { label: 'Ville', value: journey.city },
    { label: 'Situation actuelle', value: journey.current_status },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Mon parcours académique</h3>
          <Link to="/app/parcours"
            className="flex items-center gap-1 text-xs text-secondary font-semibold hover:underline">
            Modifier <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {journey.id ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.label} className="bg-surface rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{f.label}</p>
                <p className="text-sm text-foreground mt-0.5">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Map className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">Renseigne ton parcours pour être mieux accompagné.</p>
            <Link to="/app/parcours"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary text-white text-xs font-semibold">
              Compléter mon parcours
            </Link>
          </div>
        )}
      </div>

      {journey.skills && journey.skills.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Compétences</h3>
          <div className="flex flex-wrap gap-2">
            {journey.skills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-foreground">
                {s.name}{s.level ? ` · ${s.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SuiviTab({ journey }) {
  const needsInternship = journey.education_needs_internship;
  const needsSupport = journey.education_support_needed;
  const searchType = journey.search_type;
  const searchDeadline = journey.search_deadline;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`rounded-2xl p-4 border ${needsInternship ? 'bg-amber-500/5 border-amber-400/20' : 'bg-card border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold text-foreground">Recherche de stage</p>
          </div>
          <p className="text-sm text-foreground">{needsInternship ? 'En cours' : 'Non'}</p>
        </div>
        <div className={`rounded-2xl p-4 border ${needsSupport ? 'bg-amber-500/5 border-amber-400/20' : 'bg-card border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold text-foreground">Accompagnement académique</p>
          </div>
          <p className="text-sm text-foreground">{needsSupport ? 'Souhaité' : 'Non'}</p>
        </div>
      </div>

      {searchType && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-foreground mb-2">Recherche en cours</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-foreground">{searchType}</p>
              {journey.search_field && <p className="text-xs text-muted-foreground">{journey.search_field}</p>}
            </div>
            {searchDeadline && (
              <div className="text-right">
                <p className="text-[10px] uppercase text-muted-foreground">Échéance</p>
                <p className="text-sm text-foreground">{searchDeadline}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h3 className="text-sm font-semibold text-foreground">Suivi et échéances</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tes examens, résultats et échéances académiques seront suivis ici. Pour un suivi détaillé, contacte la Vie Académique via un rendez-vous.
        </p>
        <Link to="/app/rendez-vous"
          className="inline-flex items-center gap-1 mt-3 text-xs text-secondary font-semibold hover:underline">
          Demander un suivi <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function ObjectifsTab({ goals }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{goals.length} objectif(s) académique(s)</p>
        <Link to="/app/objectifs"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold">
          <Plus className="w-3 h-3" /> Nouvel objectif
        </Link>
      </div>
      {goals.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun objectif académique défini.</p>
        </div>
      ) : (
        goals.map(g => (
          <div key={g.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{g.title}</p>
                {g.why && <p className="text-xs text-muted-foreground mt-0.5">{g.why}</p>}
                {g.target_date && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {g.target_date}
                  </p>
                )}
              </div>
              <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${goalStatusStyle(g.status)}`}>
                {goalStatusLabel(g.status)}
              </span>
            </div>
            {g.steps && g.steps.length > 0 && (
              <div className="mt-3 space-y-1">
                {g.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-3.5 h-3.5 rounded border ${s.done ? 'bg-success border-success' : 'border-border'}`} />
                    <span className={s.done ? 'text-muted-foreground line-through' : 'text-foreground'}>{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function RessourcesTab({ resources }) {
  if (resources.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucune ressource disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resources.map(r => {
        const href = r.file_url || r.external_url;
        return (
          <a key={r.id} href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
              {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        );
      })}
    </div>
  );
}

function AccompagnementTab({ appointments }) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Mes demandes</h3>
          <Link to="/app/rendez-vous"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold">
            <Plus className="w-3 h-3" /> Demander
          </Link>
        </div>
        {appointments.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Aucune demande d'accompagnement.</p>
        ) : (
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface">
                <div className={`w-2 h-2 rounded-full ${apptStatusColor(a.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.subject}</p>
                  <p className="text-xs text-muted-foreground">{a.request_type}</p>
                </div>
                <span className="text-xs text-muted-foreground">{apptStatusLabel(a.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-purple-500/5 border border-purple-400/20 rounded-2xl p-4">
        <div className="flex items-start gap-2.5">
          <HeartHandshake className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">Accompagnement confidentiel</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tes demandes d'accompagnement sont traitées en toute confidentialité. Seuls les destinataires que tu choisis y ont accès.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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

function apptStatusLabel(s) {
  const labels = { pending: 'En attente', accepted: 'Accepté', proposed: 'Proposé', completed: 'Terminé', cancelled: 'Annulé', transferred: 'Transféré' };
  return labels[s] || s;
}

function apptStatusColor(s) {
  const colors = { pending: 'bg-amber-500', accepted: 'bg-success', proposed: 'bg-info', completed: 'bg-muted-foreground/30', cancelled: 'bg-danger', transferred: 'bg-purple-500' };
  return colors[s] || 'bg-muted-foreground/30';
}