import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Check } from 'lucide-react';
import { BADGES, getBadgeLabel } from '@/lib/annuaireConstants';

export default function FicheBadges({ person, onChanged }) {
  const [badges, setBadges] = useState(person.badges || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleBadge = (badgeId) => {
    setBadges(prev => prev.includes(badgeId) ? prev.filter(b => b !== badgeId) : [...prev, badgeId]);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('adminManageUser', {
        action: 'update_badges',
        user_id: person.id,
        badges,
      });
      setSaved(true);
      onChanged?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(badges.sort()) !== JSON.stringify((person.badges || []).sort());

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1">Profil de la personne</p>
        <p className="text-xs text-muted-foreground/70">Les badges sont des identifiants globaux. Ils ne remplacent pas les appartenances départementales.</p>
      </div>

      <div className="space-y-2 mb-6">
        {BADGES.map(b => (
          <button
            key={b.id}
            onClick={() => toggleBadge(b.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition text-left ${badges.includes(b.id) ? 'bg-secondary/10 border-secondary/30' : 'bg-card border-border hover:border-secondary/20'}`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${badges.includes(b.id) ? 'bg-secondary border-secondary' : 'border-border'}`}>
              {badges.includes(b.id) && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Sauvegarde...' : saved ? 'Enregistré' : 'Enregistrer les badges'}
        </button>
        {hasChanges && !saved && (
          <span className="text-xs text-muted-foreground">Modifications non enregistrées</span>
        )}
      </div>
    </div>
  );
}