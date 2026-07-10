import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Phone, Trash2, Filter } from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'Nouveau', cls: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacté', cls: 'bg-amber-100 text-amber-700' },
  welcomed: { label: 'Accueilli', cls: 'bg-green-100 text-green-700' },
  archived: { label: 'Archivé', cls: 'bg-gray-100 text-gray-500' },
};

const COMING_LABELS = {
  seul: 'Seul',
  accompagne: 'Accompagné',
  incertain: 'Incertain',
};

export default function FirstVisitIntentsTab() {
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = useCallback(() => {
    setLoading(true);
    base44.entities.FirstVisitIntent.list('-created_date', 100)
      .then(data => setIntents(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    await base44.entities.FirstVisitIntent.update(id, { status });
    setIntents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const remove = async (id) => {
    await base44.entities.FirstVisitIntent.delete(id);
    setIntents(prev => prev.filter(i => i.id !== id));
  };

  const filtered = filter === 'all' ? intents : intents.filter(i => i.status === filter);
  const counts = {
    all: intents.length,
    new: intents.filter(i => i.status === 'new').length,
    contacted: intents.filter(i => i.status === 'contacted').length,
    welcomed: intents.filter(i => i.status === 'welcomed').length,
    archived: intents.filter(i => i.status === 'archived').length,
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-foreground font-semibold">Intentions de visite ({intents.length})</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-none">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${filter === key ? 'bg-secondary/15 text-secondary' : 'bg-surface text-muted-foreground hover:text-foreground'}`}
          >
            {key === 'all' ? 'Tous' : STATUS_CONFIG[key]?.label} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Aucune intention de visite pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(intent => {
            const status = STATUS_CONFIG[intent.status] || STATUS_CONFIG.new;
            const isEmail = intent.contact?.includes('@');
            return (
              <div key={intent.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{intent.first_name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                    </div>
                    <a
                      href={isEmail ? `mailto:${intent.contact}` : `tel:${intent.contact}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isEmail ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {intent.contact}
                    </a>
                  </div>
                  <button onClick={() => remove(intent.id)} className="text-danger/40 hover:text-danger transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {intent.message && (
                  <p className="text-xs text-muted-foreground bg-surface rounded-lg p-2.5 mb-2 leading-relaxed">{intent.message}</p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Vient: <strong className="text-foreground">{COMING_LABELS[intent.coming_status] || 'N/A'}</strong></span>
                    {intent.source_section && <span>· Source: {intent.source_section}</span>}
                    <span>· {new Date(intent.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <select
                    value={intent.status}
                    onChange={e => updateStatus(intent.id, e.target.value)}
                    className="text-xs bg-white border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none focus:border-secondary/50"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="welcomed">Accueilli</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}