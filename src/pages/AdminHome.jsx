import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Users, Calendar, Image, Church, LogOut, Save, Plus, Trash2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'hero', label: 'Hero & Général', icon: Church },
  { id: 'leaders', label: 'Leaders', icon: Users },
  { id: 'events', label: 'Événements', icon: Calendar },
  { id: 'ministries', label: 'Ministères', icon: Settings },
  { id: 'gallery', label: 'Galerie', icon: Image },
];

function Section({ title, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
      <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider opacity-60">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50";

export default function AdminHome() {
  const [tab, setTab] = useState('hero');
  const [config, setConfig] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [events, setEvents] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 50),
      base44.entities.Event.list('-event_date', 50),
      base44.entities.Ministry.list('display_order', 50),
      base44.entities.GalleryMedia.list('-created_date', 50),
    ]).then(([c, l, e, m, g]) => {
      setConfig(c?.[0] || {});
      setLeaders(l || []);
      setEvents(e || []);
      setMinistries(m || []);
      setGallery(g || []);
    });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    if (config?.id) {
      await base44.entities.ChurchConfig.update(config.id, config);
    } else {
      const created = await base44.entities.ChurchConfig.create(config);
      setConfig(created);
    }
    setSaving(false);
    setMsg('Sauvegardé !');
    setTimeout(() => setMsg(''), 3000);
  };

  const uploadFile = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setConfig(c => ({ ...c, [field]: file_url }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-xs">EJP</span>
          </div>
          <span className="text-white font-semibold">Admin — Page vitrine</span>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-green-400">{msg}</span>}
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-300 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 border-r border-white/10 min-h-[calc(100vh-60px)] p-4 flex flex-col gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${tab === t.id ? 'bg-amber-400/15 text-amber-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 p-6 max-w-3xl">
          {tab === 'hero' && config && (
            <>
              <Section title="Contenu Hero">
                <Field label="Titre principal">
                  <input className={inputCls} value={config.hero_title || ''} onChange={e => setConfig(c => ({ ...c, hero_title: e.target.value }))} />
                </Field>
                <Field label="Sous-titre">
                  <textarea className={inputCls} rows={3} value={config.hero_subtitle || ''} onChange={e => setConfig(c => ({ ...c, hero_subtitle: e.target.value }))} />
                </Field>
                <Field label="Vidéo hero (URL ou upload)">
                  <input className={inputCls + ' mb-2'} placeholder="https://..." value={config.hero_video_url || ''} onChange={e => setConfig(c => ({ ...c, hero_video_url: e.target.value }))} />
                  <label className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer hover:text-amber-300">
                    <Upload className="w-3.5 h-3.5" />
                    Uploader une vidéo
                    <input type="file" accept="video/*" className="hidden" onChange={e => uploadFile(e, 'hero_video_url')} />
                  </label>
                </Field>
              </Section>
              <Section title="Vision">
                <Field label="Titre vision">
                  <input className={inputCls} value={config.vision_title || ''} onChange={e => setConfig(c => ({ ...c, vision_title: e.target.value }))} />
                </Field>
                <Field label="Texte de vision">
                  <textarea className={inputCls} rows={4} value={config.vision_text || ''} onChange={e => setConfig(c => ({ ...c, vision_text: e.target.value }))} />
                </Field>
              </Section>
              <Section title="Culte">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Jour du culte">
                    <input className={inputCls} value={config.service_day || 'Dimanche'} onChange={e => setConfig(c => ({ ...c, service_day: e.target.value }))} />
                  </Field>
                  <Field label="Heure (ex: 15:00)">
                    <input className={inputCls} value={config.service_time || '15:00'} onChange={e => setConfig(c => ({ ...c, service_time: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Adresse">
                  <input className={inputCls} value={config.address_label || ''} onChange={e => setConfig(c => ({ ...c, address_label: e.target.value }))} />
                </Field>
                <Field label="Lien Google Maps">
                  <input className={inputCls} value={config.maps_link || ''} onChange={e => setConfig(c => ({ ...c, maps_link: e.target.value }))} />
                </Field>
              </Section>
              <Section title="Contact & Réseaux">
                <Field label="Email de contact">
                  <input className={inputCls} value={config.contact_email || ''} onChange={e => setConfig(c => ({ ...c, contact_email: e.target.value }))} />
                </Field>
                <Field label="Instagram URL">
                  <input className={inputCls} value={config.instagram_url || ''} onChange={e => setConfig(c => ({ ...c, instagram_url: e.target.value }))} />
                </Field>
                <Field label="YouTube URL">
                  <input className={inputCls} value={config.youtube_url || ''} onChange={e => setConfig(c => ({ ...c, youtube_url: e.target.value }))} />
                </Field>
                <Field label="WhatsApp URL">
                  <input className={inputCls} value={config.whatsapp_url || ''} onChange={e => setConfig(c => ({ ...c, whatsapp_url: e.target.value }))} />
                </Field>
              </Section>
              <Section title="Annonce">
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="ann_active" checked={config.announcement_active || false} onChange={e => setConfig(c => ({ ...c, announcement_active: e.target.checked }))} className="accent-amber-400" />
                  <label htmlFor="ann_active" className="text-sm text-gray-400">Afficher l'annonce</label>
                </div>
                <Field label="Texte de l'annonce">
                  <input className={inputCls} value={config.announcement_text || ''} onChange={e => setConfig(c => ({ ...c, announcement_text: e.target.value }))} />
                </Field>
              </Section>
            </>
          )}

          {tab === 'leaders' && (
            <LeadersAdmin leaders={leaders} setLeaders={setLeaders} />
          )}
          {tab === 'events' && (
            <EventsAdmin events={events} setEvents={setEvents} />
          )}
          {tab === 'ministries' && (
            <MinistriesAdmin ministries={ministries} setMinistries={setMinistries} />
          )}
          {tab === 'gallery' && (
            <GalleryAdmin gallery={gallery} setGallery={setGallery} />
          )}
        </div>
      </div>
    </div>
  );
}

function LeadersAdmin({ leaders, setLeaders }) {
  const add = async () => {
    const l = await base44.entities.Leader.create({ first_name: 'Nouveau', last_name: 'Leader', role: 'Rôle', is_active: true, display_order: leaders.length });
    setLeaders(prev => [...prev, l]);
  };
  const update = async (id, data) => {
    await base44.entities.Leader.update(id, data);
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };
  const remove = async (id) => {
    await base44.entities.Leader.delete(id);
    setLeaders(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-semibold">Leaders ({leaders.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-amber-400 text-black text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-300">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {leaders.map(l => (
        <div key={l.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm" placeholder="Prénom" value={l.first_name || ''} onChange={e => update(l.id, { first_name: e.target.value })} />
            <input className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm" placeholder="Nom" value={l.last_name || ''} onChange={e => update(l.id, { last_name: e.target.value })} />
          </div>
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="Rôle / Fonction" value={l.role || ''} onChange={e => update(l.id, { role: e.target.value })} />
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="URL photo" value={l.photo_url || ''} onChange={e => update(l.id, { photo_url: e.target.value })} />
          <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" rows={2} placeholder="Biographie courte" value={l.bio || ''} onChange={e => update(l.id, { bio: e.target.value })} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={l.is_main_shepherd || false} onChange={e => update(l.id, { is_main_shepherd: e.target.checked })} className="accent-amber-400" />
                Bergère principale
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={l.is_active !== false} onChange={e => update(l.id, { is_active: e.target.checked })} className="accent-amber-400" />
                Visible
              </label>
            </div>
            <button onClick={() => remove(l.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsAdmin({ events, setEvents }) {
  const add = async () => {
    const e = await base44.entities.Event.create({ title: 'Nouvel événement', event_date: new Date().toISOString().split('T')[0], is_active: true });
    setEvents(prev => [...prev, e]);
  };
  const update = async (id, data) => {
    await base44.entities.Event.update(id, data);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };
  const remove = async (id) => {
    await base44.entities.Event.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-semibold">Événements ({events.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-amber-400 text-black text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-300">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {events.map(e => (
        <div key={e.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="Titre" value={e.title || ''} onChange={ev => update(e.id, { title: ev.target.value })} />
          <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" rows={2} placeholder="Description" value={e.description || ''} onChange={ev => update(e.id, { description: ev.target.value })} />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="date" className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm" value={e.event_date || ''} onChange={ev => update(e.id, { event_date: ev.target.value })} />
            <input className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm" placeholder="Heure (15:00)" value={e.event_time || ''} onChange={ev => update(e.id, { event_time: ev.target.value })} />
          </div>
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="Lieu" value={e.location || ''} onChange={ev => update(e.id, { location: ev.target.value })} />
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="URL image" value={e.image_url || ''} onChange={ev => update(e.id, { image_url: ev.target.value })} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={e.is_featured || false} onChange={ev => update(e.id, { is_featured: ev.target.checked })} className="accent-amber-400" />
                À la une
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={e.is_active !== false} onChange={ev => update(e.id, { is_active: ev.target.checked })} className="accent-amber-400" />
                Visible
              </label>
            </div>
            <button onClick={() => remove(e.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MinistriesAdmin({ ministries, setMinistries }) {
  const add = async () => {
    const m = await base44.entities.Ministry.create({ name: 'Nouveau ministère', is_active: true, display_order: ministries.length });
    setMinistries(prev => [...prev, m]);
  };
  const update = async (id, data) => {
    await base44.entities.Ministry.update(id, data);
    setMinistries(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };
  const remove = async (id) => {
    await base44.entities.Ministry.delete(id);
    setMinistries(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-semibold">Ministères ({ministries.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-amber-400 text-black text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-300">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {ministries.map(m => (
        <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="Nom" value={m.name || ''} onChange={e => update(m.id, { name: e.target.value })} />
          <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" rows={2} placeholder="Description" value={m.description || ''} onChange={e => update(m.id, { description: e.target.value })} />
          <input className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm mb-3" placeholder="Icône (ex: Music, Users, Star)" value={m.icon || ''} onChange={e => update(m.id, { icon: e.target.value })} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500">
              <input type="checkbox" checked={m.is_active !== false} onChange={e => update(m.id, { is_active: e.target.checked })} className="accent-amber-400" />
              Visible
            </label>
            <button onClick={() => remove(m.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryAdmin({ gallery, setGallery }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const m = await base44.entities.GalleryMedia.create({ file_url, type, is_active: true, display_order: gallery.length });
    setGallery(prev => [m, ...prev]);
    setUploading(false);
  };

  const remove = async (id) => {
    await base44.entities.GalleryMedia.delete(id);
    setGallery(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-semibold">Galerie ({gallery.length})</h2>
        <label className={`flex items-center gap-2 bg-amber-400 text-black text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-300 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Upload...' : 'Uploader'}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {gallery.map(m => (
          <div key={m.id} className="relative group rounded-xl overflow-hidden aspect-square bg-white/5">
            {m.type === 'video' ? (
              <video src={m.file_url} className="w-full h-full object-cover" />
            ) : (
              <img src={m.file_url} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => remove(m.id)} className="bg-red-500/80 text-white p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}