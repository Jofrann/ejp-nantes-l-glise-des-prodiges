import React, { useState } from 'react';
import { Library, Plus, X, Search, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { SONG_CATEGORY_LABELS } from '@/lib/musicConstants';

export default function MusicRepertoireTab({ musicData, isResponsable, colors, onRefresh }) {
  const { songs = [] } = musicData;
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = (songs || []).filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.artist || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_song',
        item: data,
        item_id: editing?.id || null,
      });
      toast({ title: editing ? 'Chant modifié' : 'Chant ajouté' });
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce chant du répertoire ?')) return;
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'delete_song',
        item_id: id,
      });
      toast({ title: 'Chant supprimé' });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un chant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm border border-border rounded-lg pl-9 pr-3 py-2"
          />
        </div>
        {isResponsable && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className={`flex items-center gap-1.5 text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border} rounded-lg px-3 py-2 hover:brightness-110 transition-all`}
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Ajouter</span>
          </button>
        )}
      </div>

      {showForm && isResponsable && (
        <SongForm song={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Library className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Le répertoire est encore vide.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(song => (
            <div key={song.id} className="bg-card border border-border hover:border-secondary/30 rounded-xl p-3 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                  {song.artist && <p className="text-xs text-muted-foreground truncate">{song.artist}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {song.default_key && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-surface text-muted-foreground">Key: {song.default_key}</span>}
                    {song.bpm && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-surface text-muted-foreground">{song.bpm} BPM</span>}
                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-surface text-muted-foreground">{SONG_CATEGORY_LABELS[song.category] || song.category}</span>
                    {song.link && (
                      <a href={song.link} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-0.5 text-secondary hover:underline">
                        <ExternalLink className="w-3 h-3" /> Lien
                      </a>
                    )}
                  </div>
                  {song.notes && <p className="text-xs text-muted-foreground mt-1.5">{song.notes}</p>}
                </div>
                {isResponsable && (
                  <div className="flex flex-col gap-1">
                    <button onClick={() => { setEditing(song); setShowForm(true); }} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
                    <button onClick={() => handleDelete(song.id)} className="text-xs text-red-500 hover:text-red-600">Supprimer</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SongForm({ song, onSave, onCancel }) {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [defaultKey, setDefaultKey] = useState(song?.default_key || '');
  const [bpm, setBpm] = useState(song?.bpm || '');
  const [category, setCategory] = useState(song?.category || 'louange');
  const [link, setLink] = useState(song?.link || '');
  const [notes, setNotes] = useState(song?.notes || '');

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{song ? 'Modifier le chant' : 'Nouveau chant'}</p>
      <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <input type="text" placeholder="Artiste / Source" value={artist} onChange={e => setArtist(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <div className="flex gap-2">
        <input type="text" placeholder="Tonalité (ex: E)" value={defaultKey} onChange={e => setDefaultKey(e.target.value)} className="flex-1 text-sm border border-border rounded-lg px-3 py-2" />
        <input type="number" placeholder="BPM" value={bpm} onChange={e => setBpm(e.target.value)} className="w-24 text-sm border border-border rounded-lg px-3 py-2" />
      </div>
      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2">
        {Object.entries(SONG_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <input type="text" placeholder="Lien (ressource autorisée)" value={link} onChange={e => setLink(e.target.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <textarea placeholder="Notes internes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, artist, default_key: defaultKey, bpm: bpm ? Number(bpm) : null, category, link, notes })} disabled={!title} className="flex-1 text-sm font-medium text-white bg-primary rounded-lg py-2 disabled:opacity-40 hover:bg-primary/90 transition-all">
          {song ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button onClick={onCancel} className="flex-1 text-sm font-medium text-muted-foreground bg-surface border border-border rounded-lg py-2 hover:text-foreground transition-all">Annuler</button>
      </div>
    </div>
  );
}