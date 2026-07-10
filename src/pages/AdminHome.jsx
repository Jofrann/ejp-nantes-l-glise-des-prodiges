import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Users, Calendar, Image, Church, Save, Plus, Trash2, Upload, CalendarClock, GraduationCap } from 'lucide-react';
import GalleryAdmin from '@/components/admin/GalleryAdmin';
import AdminProgramsTab from '@/components/admin/AdminProgramsTab';
import AdminAppointmentsTab from '@/components/admin/AdminAppointmentsTab';
import AdminFormationsTab from '@/components/admin/AdminFormationsTab';
import AdminRessourcesTab from '@/components/admin/AdminRessourcesTab';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'hero', label: 'Hero & Général', icon: Church },
  { id: 'leaders', label: 'Leaders', icon: Users },
  { id: 'events', label: 'Événements', icon: Calendar },
  { id: 'programs', label: 'Programmes EJP', icon: CalendarClock },
  { id: 'appointments', label: 'Rendez-vous', icon: GraduationCap },
  { id: 'formations', label: 'Formations', icon: GraduationCap },
  { id: 'ressources', label: 'Ressources & Boutique', icon: Image },
  { id: 'testimonials', label: 'Témoignages', icon: Settings },
  { id: 'ministries', label: 'Ministères', icon: Settings },
  { id: 'gallery', label: 'Galerie', icon: Image },
];

function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-5 shadow-sm">
      <h3 className="text-foreground font-semibold text-sm mb-5 uppercase tracking-wider opacity-60">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-border text-foreground placeholder-muted-foreground/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50";

export default function AdminHome() {
  const [tab, setTab] = useState('hero');
  const [config, setConfig] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [events, setEvents] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ChurchConfig.list(),
      base44.entities.Leader.list('display_order', 50),
      base44.entities.Event.list('-event_date', 50),
      base44.entities.Ministry.list('display_order', 50),
      base44.entities.GalleryMedia.list('-created_date', 50),
      base44.entities.Testimonial.list('display_order', 50),
    ]).then(([c, l, e, m, g, t]) => {
      setConfig(c?.[0] || {});
      setLeaders(l || []);
      setEvents(e || []);
      setMinistries(m || []);
      setGallery(g || []);
      setTestimonials(t || []);
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
    setConfig(c => {
      const updated = { ...c, [field]: file_url };
      if (updated.id) {
        base44.entities.ChurchConfig.update(updated.id, { [field]: file_url });
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card/80 backdrop-blur-sm sticky top-14 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
            <span className="text-secondary font-bold text-xs">EJP</span>
          </div>
          <span className="text-foreground font-semibold">Admin — Page vitrine</span>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-success">{msg}</span>}
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 border-r border-border min-h-[calc(100vh-120px)] p-4 flex flex-col gap-1 bg-card/50">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${tab === t.id ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-surface'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 p-6 max-w-3xl">
          {tab === 'programs' && <AdminProgramsTab />}
          {tab === 'appointments' && <AdminAppointmentsTab />}
          {tab === 'formations' && <AdminFormationsTab />}
          {tab === 'ressources' && <AdminRessourcesTab />}
          {tab === 'hero' && config && (
            <>
              <Section title="Contenu Hero">
                <Field label="Titre principal">
                  <input className={inputCls} value={config.hero_title || ''} onChange={e => setConfig(c => ({ ...c, hero_title: e.target.value }))} />
                </Field>
                <Field label="Sous-titre">
                  <textarea className={inputCls} rows={3} value={config.hero_subtitle || ''} onChange={e => setConfig(c => ({ ...c, hero_subtitle: e.target.value }))} />
                </Field>
                <Field label="Vidéo de fond (URL ou upload)">
                  <input className={inputCls + ' mb-2'} placeholder="https://..." value={config.hero_video_url || ''} onChange={e => setConfig(c => ({ ...c, hero_video_url: e.target.value }))} />
                  {config.hero_video_url && (
                    <video
                      src={config.hero_video_url}
                      className="w-full h-32 object-cover rounded-xl mb-2 border border-border"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  )}
                  <label className={`flex items-center gap-2 text-xs cursor-pointer ${uploadingVideo ? 'text-muted-foreground pointer-events-none' : 'text-secondary hover:text-secondary/80'}`}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingVideo ? 'Upload en cours…' : 'Uploader une vidéo (MP4 recommandé)'}
                    <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo} onChange={async (e) => {
                      setUploadingVideo(true);
                      await uploadFile(e, 'hero_video_url');
                      setUploadingVideo(false);
                    }} />
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Conseil : vidéo &lt; 10 Mo pour un chargement rapide.</p>
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
              <Section title="Berger EJP Monde">
                <p className="text-xs text-muted-foreground mb-4">Affiché côte à côte avec la bergère EJP Nantes.</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Prénom">
                    <input className={inputCls} value={config.world_shepherd_first_name || ''} onChange={e => setConfig(c => ({ ...c, world_shepherd_first_name: e.target.value }))} />
                  </Field>
                  <Field label="Nom">
                    <input className={inputCls} value={config.world_shepherd_last_name || ''} onChange={e => setConfig(c => ({ ...c, world_shepherd_last_name: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Rôle (ex: Berger EJP Monde)">
                  <input className={inputCls} value={config.world_shepherd_role || ''} onChange={e => setConfig(c => ({ ...c, world_shepherd_role: e.target.value }))} />
                </Field>
                <Field label="Biographie">
                  <textarea className={inputCls} rows={3} value={config.world_shepherd_bio || ''} onChange={e => setConfig(c => ({ ...c, world_shepherd_bio: e.target.value }))} />
                </Field>
                <Field label="Photo (URL ou upload)">
                  <input className={inputCls + ' mb-2'} placeholder="https://..." value={config.world_shepherd_photo_url || ''} onChange={e => setConfig(c => ({ ...c, world_shepherd_photo_url: e.target.value }))} />
                  <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer hover:text-secondary/80">
                    <Upload className="w-3.5 h-3.5" />
                    Uploader une photo
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadFile(e, 'world_shepherd_photo_url')} />
                  </label>
                </Field>
              </Section>

              <Section title="Image page Connexion / Inscription">
                <p className="text-xs text-muted-foreground mb-4">Affichée sur la colonne droite des pages Login et Register.</p>
                <Field label="Image (URL ou upload)">
                  <input className={inputCls + ' mb-2'} placeholder="https://..." value={config.auth_page_image_url || ''} onChange={e => setConfig(c => ({ ...c, auth_page_image_url: e.target.value }))} />
                  {config.auth_page_image_url && (
                    <img src={config.auth_page_image_url} alt="Aperçu" className="w-full h-40 object-cover rounded-xl mb-2 border border-border" />
                  )}
                  <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer hover:text-secondary/80">
                    <Upload className="w-3.5 h-3.5" />
                    Uploader une image
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadFile(e, 'auth_page_image_url')} />
                  </label>
                </Field>
              </Section>

              <Section title="Annonce">
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="ann_active" checked={config.announcement_active || false} onChange={e => setConfig(c => ({ ...c, announcement_active: e.target.checked }))} className="accent-secondary" />
                  <label htmlFor="ann_active" className="text-sm text-muted-foreground">Afficher l'annonce</label>
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
          {tab === 'testimonials' && (
            <TestimonialsAdmin testimonials={testimonials} setTestimonials={setTestimonials} />
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

function LeaderCard({ leader, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...leader });
  const [uploading, setUploading] = useState(false);

  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(leader.id, patch);
  }, [leader.id, onUpdate]);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    setForm(f => ({ ...f, photo_url: file_url }));
    onUpdate(leader.id, { photo_url: file_url });
  };

  const iCls = "bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:border-secondary/50";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input className={iCls} placeholder="Prénom" value={form.first_name || ''} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} onBlur={e => save({ first_name: e.target.value })} />
        <input className={iCls} placeholder="Nom" value={form.last_name || ''} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} onBlur={e => save({ last_name: e.target.value })} />
      </div>
      <input className={iCls + ' mb-3'} placeholder="Rôle / Fonction" value={form.role || ''} onChange={e => setForm(f => ({...f, role: e.target.value}))} onBlur={e => save({ role: e.target.value })} />

      {/* Photo */}
      <div className="flex items-center gap-3 mb-3">
        {form.photo_url ? (
          <img src={form.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <input className={iCls + ' mb-1.5'} placeholder="URL photo" value={form.photo_url || ''} onChange={e => setForm(f => ({...f, photo_url: e.target.value}))} onBlur={e => save({ photo_url: e.target.value })} />
          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${uploading ? 'text-muted-foreground' : 'text-secondary hover:text-secondary/80'}`}>
            <Upload className="w-3 h-3" />
            {uploading ? 'Upload en cours...' : 'Uploader depuis mon PC'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
          </label>
        </div>
      </div>

      <textarea className={iCls + ' mb-3'} rows={2} placeholder="Biographie courte" value={form.bio || ''} onChange={e => setForm(f => ({...f, bio: e.target.value}))} onBlur={e => save({ bio: e.target.value })} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_main_shepherd || false} onChange={e => save({ is_main_shepherd: e.target.checked })} className="accent-secondary" />
            Bergère principale
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active !== false} onChange={e => save({ is_active: e.target.checked })} className="accent-secondary" />
            Visible
          </label>
        </div>
        <button onClick={() => onRemove(leader.id)} className="text-danger/60 hover:text-danger transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
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
        <h2 className="text-foreground font-semibold">Leaders ({leaders.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {leaders.map(l => (
        <LeaderCard key={l.id} leader={l} onUpdate={update} onRemove={remove} />
      ))}
    </div>
  );
}

function EventCard({ event: ev, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...ev });
  const [uploading, setUploading] = useState(false);
  const iCls = "w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50";

  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(ev.id, patch);
  }, [ev.id, onUpdate]);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    setForm(f => ({ ...f, image_url: file_url }));
    onUpdate(ev.id, { image_url: file_url });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
      <input className={iCls + ' mb-3'} placeholder="Titre" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} onBlur={e => save({ title: e.target.value })} />
      <textarea className={iCls + ' mb-3'} rows={2} placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} onBlur={e => save({ description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input type="date" className={iCls} value={form.event_date || ''} onChange={e => save({ event_date: e.target.value })} />
        <input className={iCls} placeholder="Heure (15:00)" value={form.event_time || ''} onChange={e => setForm(f => ({...f, event_time: e.target.value}))} onBlur={e => save({ event_time: e.target.value })} />
      </div>
      <input className={iCls + ' mb-3'} placeholder="Lieu" value={form.location || ''} onChange={e => setForm(f => ({...f, location: e.target.value}))} onBlur={e => save({ location: e.target.value })} />

      {/* Image */}
      <div className="flex items-center gap-3 mb-3">
        {form.image_url && <img src={form.image_url} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0 border border-border" />}
        <div className="flex-1">
          <input className={iCls + ' mb-1.5'} placeholder="URL image" value={form.image_url || ''} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} onBlur={e => save({ image_url: e.target.value })} />
          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${uploading ? 'text-muted-foreground' : 'text-secondary hover:text-secondary/80'}`}>
            <Upload className="w-3 h-3" />
            {uploading ? 'Upload en cours...' : 'Uploader une image'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured || false} onChange={e => save({ is_featured: e.target.checked })} className="accent-secondary" />
            À la une
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active !== false} onChange={e => save({ is_active: e.target.checked })} className="accent-secondary" />
            Visible
          </label>
        </div>
        <button onClick={() => onRemove(ev.id)} className="text-danger/60 hover:text-danger transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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
        <h2 className="text-foreground font-semibold">Événements ({events.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {events.map(e => (
        <EventCard key={e.id} event={e} onUpdate={update} onRemove={remove} />
      ))}
    </div>
  );
}

function TestimonialCard({ t, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...t });
  const iCls = "bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50";
  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(t.id, patch);
  }, [t.id, onUpdate]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
      <textarea className={"w-full " + iCls + " mb-3 resize-none"} rows={3} placeholder="Témoignage" value={form.content || ''} onChange={e => setForm(f => ({...f, content: e.target.value}))} onBlur={e => save({ content: e.target.value })} />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input className={iCls} placeholder="Prénom" value={form.author_name || ''} onChange={e => setForm(f => ({...f, author_name: e.target.value}))} onBlur={e => save({ author_name: e.target.value })} />
        <input className={iCls} placeholder="Rôle" value={form.author_role || ''} onChange={e => setForm(f => ({...f, author_role: e.target.value}))} onBlur={e => save({ author_role: e.target.value })} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_anonymous || false} onChange={e => save({ is_anonymous: e.target.checked })} className="accent-secondary" />
            Anonyme
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published || false} onChange={e => save({ is_published: e.target.checked })} className="accent-secondary" />
            Publié
          </label>
        </div>
        <button onClick={() => onRemove(t.id)} className="text-danger/60 hover:text-danger transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TestimonialsAdmin({ testimonials, setTestimonials }) {
  const add = async () => {
    const t = await base44.entities.Testimonial.create({ content: 'Nouveau témoignage', author_name: 'Prénom', is_published: false, display_order: testimonials.length });
    setTestimonials(prev => [...prev, t]);
  };
  const update = async (id, data) => {
    await base44.entities.Testimonial.update(id, data);
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const remove = async (id) => {
    await base44.entities.Testimonial.delete(id);
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-foreground font-semibold">Témoignages ({testimonials.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {testimonials.map(t => (
        <TestimonialCard key={t.id} t={t} onUpdate={update} onRemove={remove} />
      ))}
    </div>
  );
}

function MinistryCard({ m, onUpdate, onRemove }) {
  const [form, setForm] = useState({ ...m });
  const iCls = "w-full bg-white border border-border text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary/50";
  const save = useCallback((patch) => {
    setForm(f => ({ ...f, ...patch }));
    onUpdate(m.id, patch);
  }, [m.id, onUpdate]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
      <input className={iCls + ' mb-3'} placeholder="Nom" value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} onBlur={e => save({ name: e.target.value })} />
      <textarea className={iCls + ' mb-3'} rows={2} placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} onBlur={e => save({ description: e.target.value })} />
      <input className={iCls + ' mb-3'} placeholder="Icône (ex: Music, Users, Star)" value={form.icon || ''} onChange={e => setForm(f => ({...f, icon: e.target.value}))} onBlur={e => save({ icon: e.target.value })} />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
          <input type="checkbox" checked={form.is_active !== false} onChange={e => save({ is_active: e.target.checked })} className="accent-secondary" />
          Visible
        </label>
        <button onClick={() => onRemove(m.id)} className="text-danger/60 hover:text-danger transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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
        <h2 className="text-foreground font-semibold">Ministères ({ministries.length})</h2>
        <button onClick={add} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {ministries.map(m => (
        <MinistryCard key={m.id} m={m} onUpdate={update} onRemove={remove} />
      ))}
    </div>
  );
}