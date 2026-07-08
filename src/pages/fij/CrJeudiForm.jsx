import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Users, Save, Send, RotateCcw, CheckCheck, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { canCreateThursdayReport, isFijCoordinationRole } from '@/lib/fijPermissions';
import { getCurrentThursday, getNearestThursday } from '@/lib/fijDateUtils';

export default function CrJeudiForm() {
  const { fijId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fij, setFij] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thursdayDate, setThursdayDate] = useState(getCurrentThursday());
  const [existingReport, setExistingReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [generalNote, setGeneralNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [fijId]);

  useEffect(() => {
    checkExisting();
  }, [thursdayDate, fijId]);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const f = await base44.entities.FIJ.get(fijId);
      if (!canCreateThursdayReport(u, f)) {
        setLoading(false);
        return;
      }
      setFij(f);
      const m = await base44.entities.FijMember.filter({ fij_id: fijId, is_active: true }, 'full_name', 200);
      setMembers(m || []);
      // Initialize entries: all present by default
      setEntries((m || []).map(mem => ({
        member_id: mem.id,
        member_name: mem.full_name,
        present: true,
        late: false,
        comment: '',
      })));
    } catch {
      setFij(null);
    }
    setLoading(false);
  };

  const checkExisting = async () => {
    if (!fijId) return;
    try {
      const existing = await base44.entities.FijThursdayReport.filter({ fij_id: fijId, thursday_date: thursdayDate }, '-created_date', 5);
      if (existing && existing.length > 0) {
        setExistingReport(existing[0]);
      } else {
        setExistingReport(null);
      }
    } catch {
      setExistingReport(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const isCoordination = isFijCoordinationRole(user);
  const basePath = isCoordination
    ? `/app/departements/fij/coordination/registre/${fijId}`
    : `/app/departements/fij/pilote/mes-fij/${fijId}`;

  if (!fij) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-5">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">Accès restreint</p>
        <Link to="/app/departements/fij" className="text-secondary text-sm font-medium">← Retour FIJ</Link>
      </div>
    );
  }

  if (existingReport) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: basePath },
              { label: 'CR du jeudi', to: `${basePath}/cr-jeudi/nouveau` },
            ]}
            backTo={basePath}
            backLabel="← Bureau"
          />
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6 text-center mt-4">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">CR déjà existant</p>
            <p className="text-xs text-muted-foreground mb-4">
              Un compte rendu existe déjà pour le {new Date(thursdayDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.
            </p>
            <Link
              to={`${basePath}/cr-jeudi/${existingReport.id}`}
              className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              Voir le CR existant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: `/app/departements/fij/pilote/mes-fij/${fijId}` },
              { label: 'CR du jeudi', to: '#' },
            ]}
            backTo={`/app/departements/fij/pilote/mes-fij/${fijId}`}
            backLabel="← Bureau"
          />
          <div className="bg-card border border-border rounded-2xl p-6 text-center mt-4">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Aucun membre actif</p>
            <p className="text-xs text-muted-foreground mb-4">Ajoutez d'abord des membres à cette FIJ.</p>
            <Link to={`/app/departements/fij/pilote/mes-fij/${fijId}`} className="text-secondary text-sm font-medium">← Retour au bureau</Link>
          </div>
        </div>
      </div>
    );
  }

  const presentCount = entries.filter(e => e.present).length;
  const absentCount = entries.filter(e => !e.present).length;
  const lateCount = entries.filter(e => e.late).length;
  const rate = entries.length > 0 ? Math.round((presentCount / entries.length) * 100) : 0;

  const togglePresent = (idx) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, present: !e.present, late: !e.present ? false : e.late } : e));
  };

  const toggleLate = (idx) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, late: !e.late, present: e.late ? e.present : true } : e));
  };

  const updateComment = (idx, comment) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, comment } : e));
  };

  const markAllPresent = () => {
    setEntries(prev => prev.map(e => ({ ...e, present: true, late: false })));
  };

  const reset = () => {
    setEntries(prev => prev.map(e => ({ ...e, present: false, late: false, comment: '' })));
  };

  const submit = async (status = 'submitted') => {
    setSaving(true);
    try {
      const report = await base44.entities.FijThursdayReport.create({
        fij_id: fijId,
        fij_name: fij.name,
        thursday_date: thursdayDate,
        status,
        submitted_by_user_id: user.id,
        submitted_by_name: user.full_name || user.email,
        submitted_at: status === 'submitted' ? new Date().toISOString() : undefined,
        total_members: entries.length,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        attendance_rate: rate,
        general_note: generalNote || undefined,
      });

      await base44.entities.FijAttendanceEntry.bulkCreate(
        entries.map(e => ({
          report_id: report.id,
          fij_id: fijId,
          member_id: e.member_id,
          member_name: e.member_name,
          thursday_date: thursdayDate,
          present: e.present,
          late: e.late,
          comment: e.comment || undefined,
        }))
      );

      const basePath = isFijCoordinationRole(user)
        ? `/app/departements/fij/coordination/registre/${fijId}`
        : `/app/departements/fij/pilote/mes-fij/${fijId}`;
      navigate(`${basePath}/cr-jeudi/${report.id}`);
    } catch (err) {
      alert('Erreur lors de l\'enregistrement: ' + (err.message || ''));
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: `/app/departements/fij/pilote/mes-fij/${fijId}` },
              { label: 'CR du jeudi', to: '#' },
            ]}
            backTo={`/app/departements/fij/pilote/mes-fij/${fijId}`}
            backLabel="← Bureau"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-heading font-bold text-foreground mb-1">CR du jeudi — Présences</h1>
          <p className="text-sm text-muted-foreground mb-4">{fij.name}</p>

          {/* Date selector + KPIs */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs font-medium text-muted-foreground">Jeudi :</label>
              <input
                type="date"
                value={thursdayDate}
                onChange={e => setThursdayDate(getNearestThursday(e.target.value))}
                className="text-sm border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Kpi label="Total" value={entries.length} />
              <Kpi label="Présents" value={presentCount} color="text-success" />
              <Kpi label="Absents" value={absentCount} color="text-danger" />
              <Kpi label="Taux" value={`${rate}%`} />
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-2 mb-3">
            <button onClick={markAllPresent} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-success/10 text-success text-xs font-medium rounded-lg hover:bg-success/20 border border-success/20">
              <CheckCheck className="w-3.5 h-3.5" /> Tout présent
            </button>
            <button onClick={reset} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface text-muted-foreground text-xs font-medium rounded-lg hover:bg-muted border border-border">
              <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          </div>

          {/* Member list */}
          <div className="space-y-1.5 mb-4">
            {entries.map((entry, idx) => (
              <div key={entry.member_id} className={`bg-card border rounded-xl p-3 ${entry.present ? 'border-border' : 'border-danger/20'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                    {entry.member_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-foreground flex-1 truncate">{entry.member_name}</p>
                  <button
                    onClick={() => toggleLate(idx)}
                    className={`p-1.5 rounded-lg border transition-colors ${entry.late ? 'bg-warning/10 border-warning/30 text-warning' : 'border-border text-muted-foreground hover:bg-surface'}`}
                    title="Retard"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => togglePresent(idx)}
                    className={`p-1.5 rounded-lg border transition-colors ${entry.present ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}
                    title={entry.present ? 'Présent' : 'Absent'}
                  >
                    {entry.present ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {!entry.present && (
                  <input
                    value={entry.comment}
                    onChange={e => updateComment(idx, e.target.value)}
                    placeholder="Motif d'absence (optionnel)..."
                    className="w-full mt-2 px-2 py-1 text-xs border border-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Note générale */}
          <textarea
            value={generalNote}
            onChange={e => setGeneralNote(e.target.value)}
            placeholder="Note générale (optionnel)..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-secondary resize-none mb-4"
          />
        </motion.div>
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-40">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button
            onClick={() => submit('draft')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border text-sm font-medium rounded-xl text-foreground hover:bg-surface disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Brouillon
          </button>
          <button
            onClick={() => submit('submitted')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-2 text-center">
      <p className={`text-lg font-bold ${color || 'text-foreground'}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}