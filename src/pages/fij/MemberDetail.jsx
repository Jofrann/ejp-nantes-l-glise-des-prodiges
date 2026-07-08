import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Phone, Mail, Calendar, AlertTriangle, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { GROWTH_STATUS_LABELS, GROWTH_STATUS_COLORS, canReadFijMembers } from '@/lib/fijPermissions';

export default function MemberDetail() {
  const { fijId, memberId } = useParams();
  const [user, setUser] = useState(null);
  const [fij, setFij] = useState(null);
  const [member, setMember] = useState(null);
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [memberId]);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const f = await base44.entities.FIJ.get(fijId);
      setFij(f);

      if (!canReadFijMembers(u, f)) {
        setLoading(false);
        return;
      }

      const m = await base44.entities.FijMember.get(memberId);
      setMember(m);

      const [e, n] = await Promise.all([
        base44.entities.FijAttendanceEntry.filter({ member_id: memberId }, '-thursday_date', 200).catch(() => []),
        base44.entities.FijMemberNote.filter({ member_id: memberId }, '-created_date', 50).catch(() => []),
      ]);
      setEntries(e || []);
      setNotes(n || []);
    } catch {
      setMember(null);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  if (!fij || !member) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-5">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">Membre introuvable</p>
        <Link to="/app/departements/fij" className="text-secondary text-sm font-medium">← Retour FIJ</Link>
      </div>
    );
  }

  const presentCount = entries.filter(e => e.present).length;
  const absentCount = entries.filter(e => !e.present).length;
  const lateCount = entries.filter(e => e.late).length;
  const rate = entries.length > 0 ? Math.round((presentCount / entries.length) * 100) : 0;

  // Check 3 consecutive absences
  const sortedEntries = [...entries].sort((a, b) => new Date(b.thursday_date) - new Date(a.thursday_date));
  let consecutiveAbsences = 0;
  for (const e of sortedEntries) {
    if (!e.present) consecutiveAbsences++;
    else break;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: `/app/departements/fij/pilote/mes-fij/${fijId}` },
              { label: member.full_name, to: '#' },
            ]}
            backTo={`/app/departements/fij/pilote/mes-fij/${fijId}`}
            backLabel="← Bureau"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-xl font-bold text-muted-foreground">
                {member.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-heading font-bold text-foreground">{member.full_name}</h1>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${GROWTH_STATUS_COLORS[member.growth_status || 'passif']}`}>
                  {GROWTH_STATUS_LABELS[member.growth_status || 'passif']}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{rate}%</p>
                <p className="text-[10px] text-muted-foreground">assiduité</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              {member.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone}</div>}
              {member.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email}</div>}
              {member.entry_date && <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Entrée le {new Date(member.entry_date).toLocaleDateString('fr-FR')}</div>}
              {member.age && <div>Age : {member.age} ans</div>}
              {member.city && <div>{member.city}</div>}
            </div>

            {consecutiveAbsences >= 3 && (
              <div className="mt-3 bg-danger/5 border border-danger/20 rounded-lg p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                <p className="text-xs text-danger font-medium">{consecutiveAbsences} absences consécutives — attention requise</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatCard icon={CheckCircle2} label="Présences" value={presentCount} color="text-success" />
            <StatCard icon={XCircle} label="Absences" value={absentCount} color="text-danger" />
            <StatCard icon={Clock} label="Retards" value={lateCount} color="text-warning" />
          </div>

          {/* Historique d'assiduité */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-foreground mb-3">Historique d'assiduité</p>
            {sortedEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune saisie</p>
            ) : (
              <div className="space-y-1">
                {sortedEntries.map(e => (
                  <div key={e.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    {e.present ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                    )}
                    <span className="text-sm text-foreground flex-1">
                      {new Date(e.thursday_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {e.late && <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">Retard</span>}
                    {e.comment && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{e.comment}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes de suivi */}
          {notes.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Notes de suivi ({notes.length})</p>
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note.id} className="bg-surface border border-border rounded-lg p-2.5">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {note.author_name} · {new Date(note.created_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}