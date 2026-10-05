import React, { useState } from 'react';
import { ListMusic, Plus, X, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, isUpcoming, POSITION_LABELS } from '@/lib/musicConstants';

export default function MusicSetlistsTab({ musicData, isResponsable, colors, onRefresh }) {
  const { plans = [], setlist_by_plan = {}, songs = [], members = [] } = musicData;
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [search, setSearch] = useState('');

  const plansWithSetlists = (plans || [])
    .filter(p => isUpcoming(p.date) && p.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const selectedPlan = plansWithSetlists.find(p => p.id === selectedPlanId) || plansWithSetlists[0];
  const setlist = selectedPlan ? (setlist_by_plan[selectedPlan.id] || []).sort((a, b) => (a.item_order || 0) - (b.item_order || 0)) : [];

  const handleAddSong = async (song) => {
    if (!selectedPlan) return;
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'save_setlist_item',
        item: {
          service_plan_id: selectedPlan.id,
          song_id: song?.id || null,
          title: song?.title || search,
          item_key: song?.default_key || '',
          item_order: setlist.length,
        },
      });
      toast({ title: 'Chant ajouté à la setlist' });
      setSearch('');
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'delete_setlist_item',
        item_id: itemId,
      });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleReorder = async (itemId, direction) => {
    const newSetlist = [...setlist];
    const idx = newSetlist.findIndex(s => s.id === itemId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSetlist.length) return;
    [newSetlist[idx], newSetlist[swapIdx]] = [newSetlist[swapIdx], newSetlist[idx]];
    const items = newSetlist.map((s, i) => ({ id: s.id, item_order: i }));
    try {
      await base44.functions.invoke('manageMusicItem', {
        department_slug: musicData.department.slug,
        operation: 'reorder_setlist',
        item: { items },
      });
      onRefresh();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const filteredSongs = (songs || []).filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.artist || '').toLowerCase().includes(search.toLowerCase())
  );

  if (plansWithSetlists.length === 0) {
    return (
      <div className="text-center py-12">
        <ListMusic className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">La setlist n'est pas encore disponible.</p>
        <p className="text-xs text-muted-foreground mt-1">Aucun service à venir n'a été planifié.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de service */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {plansWithSetlists.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlanId(p.id)}
            className={`flex-shrink-0 text-xs px-3 py-2 rounded-lg border transition-all ${
              (selectedPlan?.id === p.id)
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {formatDate(p.date)}
          </button>
        ))}
      </div>

      {selectedPlan && (
        <>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold text-foreground">{selectedPlan.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selectedPlan.date)}</p>
          </div>

          {/* Setlist */}
          <div className="space-y-2">
            {setlist.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Aucun chant dans la setlist.</p>
            )}
            {setlist.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <span className="text-xs font-bold text-muted-foreground w-5 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {item.item_key && <span className="text-xs text-muted-foreground">Key: {item.item_key}</span>}
                  {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
                </div>
                {isResponsable && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleReorder(item.id, 'up')} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleReorder(item.id, 'down')} disabled={idx === setlist.length - 1} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Ajout depuis le répertoire */}
          {isResponsable && (
            <div className="bg-surface/50 border border-border rounded-2xl p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ajouter un chant</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un chant..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg pl-9 pr-3 py-2"
                />
              </div>
              {search && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filteredSongs.length > 0 ? (
                    filteredSongs.map(song => (
                      <button
                        key={song.id}
                        onClick={() => handleAddSong(song)}
                        className="w-full flex items-center gap-3 bg-card border border-border hover:border-secondary/30 rounded-lg p-2.5 text-left transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground">{song.artist} {song.default_key && `· Key: ${song.default_key}`}</p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => handleAddSong(null)}
                      className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2.5"
                    >
                      <Plus className="w-4 h-4" /> Ajouter "{search}" manuellement
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}