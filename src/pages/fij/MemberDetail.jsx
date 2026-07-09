import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Phone, Mail, Calendar, AlertTriangle, Star, Plus, Edit3, Save, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';
import { GROWTH_STATUS_LABELS, GROWTH_STATUS_COLORS, canReadFijMembers, canUpdateFijMember, canCreateMemberNote, isFijCoordinationRole } from '@/lib/fijPermissions';

const POTENTIAL_LABELS = ['Leadership', 'Évangélisation', 'Intercession', 'Enseignement', 'Service', 'Hospitalité', 'Administration'];

export default function MemberDetail() {
  const { fijId, memberId } = useParams();
  const [user, setUser] = useState(null);
  const [fij, setFij] = useState(null);
  const [member, setMember] = useState(null);
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPotential, setEditingPotential] = useState(false);
  const [potentialData, setPotentialData] = useState({});
  const [editingGrowth, setEditingGrowth] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('suivi');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => { loadData(); }, [memberId]);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const f = await base44.entities.FIJ.get(fijId);
      setFij(f);

      if (!canReadFijMembers(u, f)) { setLoading(false); return; }

      const m = await base44.entities.FijMember.get(memberId);
      setMember(m);

      // Parse training_potential JSON
      try {
        const parsed = m.training_potential ? JSON.parse(m.training_potential) : {};
        setPotentialData(typeof parsed === 'object' ? parsed : {});
      } catch {
        setPotentialData({});
      }

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

  const savePotential = async () => {
    await base44.entities.FijMember.update(memberId, { training_potential: JSON.stringify(potentialData) });
    setMember(prev => ({ ...prev, training_potential: JSON.stringify(potentialData) }));
    setEditingPotential(false);
  };

  const saveGrowth = async (status) => {
    await base44.entities.FijMember.update(memberId, { growth_status: status });
    setMember(prev => ({ ...prev, growth_status: status }));
    setEditingGrowth(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const note = await base44.entities.FijMemberNote.create({
      fij_id: fijId,
      member_id: memberId,
      member_name: member.full_name,
      author_user_id: user.id,
      author_name: user.full_name || user.email,
      note_type: noteType,
      content: newNote.trim(),
      visibility: isFijCoordinationRole(user) ? 'coordination_fij' : 'pilote_fij',
    });
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setShowAddNote(false);
    setSavingNote(false);
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

  const canEdit = canUpdateFijMember(user, fij);
  const canNote = canCreateMemberNote(user, fij);

  const presentCount = entries.filter(e => e.present).length;
  const absentCount = entries.filter(e => !e.present).length;
  const lateCount = entries.filter(e => e.late).length;
  const rate = entries.length > 0 ? Math.round((presentCount / entries.length) * 100) : 0;

  const sortedEntries = [...entries].sort((a, b) => new Date(b.thursday_date) - new Date(a.thursday_date));
  let consecutiveAbsences = 0;
  for (const e of sortedEntries) {
    if (!e.present) consecutiveAbsences++;
    else break;
  }

  const baseBureau = `/app/departements/fij/pilote/mes-fij/${fijId}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <PageBreadcrumb
            items={[
              { label: 'FIJ', to: '/app/departements/fij' },
              { label: fij.name, to: baseBureau },
              { label: member.full_name, to: '#' },
            ]}
            backTo={baseBureau}
            backLabel="← Bureau"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-xl font-bold text-muted-foreground">
                {member.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-heading font-bold text-foreground">{member.full_name}</h1>
                {/* Growth status — cliquable si canEdit */}
                <div className="flex items-center gap-2 mt-1">
                  {editingGrowth ? (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(GROWTH_STATUS_LABELS).map(([k, v]) => (
                        <button key={k} onClick={() => saveGrowth(k)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${(member.growth_status || 'passif') === k ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-surface'}`}>
                          {v}
                        </button>
                      ))}
                      <button onClick={() => setEditingGrowth(false)} className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => canEdit && setEditingGrowth(true)} className={`text-[10px] px-1.5 py-0.5 rounded ${GROWTH_STATUS_COLORS[member.growth_status || 'passif']} ${canEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                      {GROWTH_STATUS_LABELS[member.growth_status || 'passif']}
                    </button>
                  )}
                  {canEdit && !editingGrowth && <button onClick={() => setEditingGrowth(true)} className="text-muted-foreground hover:text-foreground"><Edit3 className="w-3 h-3" /></button>}
                </div>
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
              {member.age && <div>Âge : {member.age} ans</div>}
              {member.city && <div>{member.city}</div>}
            </div>

            {consecutiveAbsences >= 3 && (
              <div className="mt-3 bg-danger/5 border border-danger/20 rounded-lg p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                <p className="text-xs text-danger font-medium">{consecutiveAbsences} absences consécutives — attention requise</p>
              </div>
            )}
          </div>

          {/* Stats assiduité */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={CheckCircle2} label="Présences" value={presentCount} color="text-success" />
            <StatCard icon={XCircle} label="Absences" value={absentCount} color="text-danger" />
            <StatCard icon={Clock} label="Retards" value={lateCount} color="text-warning" />
          </div>

          {/* Potentiels / Piliers — étoiles */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Potentiels & Piliers</p>
              {canEdit && !editingPotential && (
                <button onClick={() => setEditingPotential(true)} className="text-xs text-secondary flex items-center gap-1 hover:underline">
                  <Edit3 className="w-3 h-3" /> Modifier
                </button>
              )}
              {editingPotential && (
                <div className="flex gap-2">
                  <button onClick={savePotential} className="text-xs text-success flex items-center gap-1 hover:underline"><Save className="w-3 h-3" /> Sauvegarder</button>
                  <button onClick={() => setEditingPotential(false)} className="text-xs text-muted-foreground hover:underline">Annuler</button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {POTENTIAL_LABELS.map(label => {
                const score = potentialData[label] || 0;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          disabled={!editingPotential}
                          onClick={() => editingPotential && setPotentialData(prev => ({ ...prev, [label]: star === score ? 0 : star }))}
                          className={`transition-colors ${editingPotential ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                        >
                          <Star className={`w-4 h-4 ${star <= score ? 'fill-secondary text-secondary' : 'text-border'}`} />
                        </button>
                      ))}
                    </div>
                    {score > 0 && <span className="text-[10px] text-muted-foreground">{score}/5</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique d'assiduité */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Historique d'assiduité</p>
            {sortedEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune saisie</p>
            ) : (
              <div className="space-y-1">
                {sortedEntries.slice(0, 20).map(e => (
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
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Notes de suivi {notes.length > 0 && `(${notes.length})`}</p>
              {canNote && (
                <button onClick={() => setShowAddNote(!showAddNote)} className="flex items-center gap-1 text-xs text-secondary hover:underline">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              )}
            </div>

            {showAddNote && (
              <div className="mb-3 bg-surface border border-border rounded-xl p-3 space-y-2">
                <select value={noteType} onChange={e => setNoteType(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary bg-card">
                  <option value="suivi">Suivi général</option>
                  <option value="appel">Appel</option>
                  <option value="rencontre">Rencontre</option>
                  <option value="integration">Intégration</option>
                  <option value="absence">Absence</option>
                  <option value="transfert">Transfert</option>
                  <option value="autre">Autre</option>
                </select>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Écrivez votre note..."
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary bg-card resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddNote(false)} className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted">Annuler</button>
                  <button onClick={addNote} disabled={savingNote || !newNote.trim()} className="flex-1 px-2 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg disabled:opacity-50">
                    {savingNote ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 && !showAddNote ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune note</p>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note.id} className="bg-surface border border-border rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">{note.note_type || 'suivi'}</span>
                      <span className="text-[10px] text-muted-foreground">{note.author_name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(note.created_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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