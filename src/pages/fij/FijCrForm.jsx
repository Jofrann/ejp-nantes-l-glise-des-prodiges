import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LoadingSpinner } from '@/components/fij/FijPageShell';
import { ArrowLeft, Save, FileText } from 'lucide-react';

export default function FijCrForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fij, setFij] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekStart = getMonday(new Date());
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    meeting_date: today,
    participants_count: 0,
    new_visitors_count: 0,
    servants_present_count: 0,
    theme_shared: false,
    theme_title: '',
    summary: '',
    highlights: '',
    difficulties: '',
    needs: '',
    prayer_points: '',
    people_to_follow: '',
    status: 'draft',
  });

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.filter({ id }),
      base44.entities.FijWeeklyReport.filter({ fij_house_id: id, week_start: weekStart }, '-created_date', 1),
    ]).then(([u, fijs, reports]) => {
      setUser(u);
      setFij(fijs?.[0] || null);
      if (reports && reports.length > 0) {
        const r = reports[0];
        setExistingReport(r);
        setForm({
          meeting_date: r.meeting_date || today,
          participants_count: r.participants_count || 0,
          new_visitors_count: r.new_visitors_count || 0,
          servants_present_count: r.servants_present_count || 0,
          theme_shared: r.theme_shared || false,
          theme_title: r.theme_title || '',
          summary: r.summary || '',
          highlights: r.highlights || '',
          difficulties: r.difficulties || '',
          needs: r.needs || '',
          prayer_points: r.prayer_points || '',
          people_to_follow: r.people_to_follow || '',
          status: r.status || 'draft',
        });
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!fij) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500">
      <p className="mb-4">FIJ introuvable.</p>
      <Link to="/app/departements/fij" className="text-amber-400 text-sm">← Retour</Link>
    </div>
  );

  const inputCls = "w-full h-11 px-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30";
  const labelCls = "text-xs text-gray-500 mb-1 block";

  const save = async (newStatus) => {
    setSaving(true);
    const payload = {
      ...form,
      status: newStatus || form.status,
      fij_house_id: id,
      fij_name: fij.name,
      week_start: weekStart,
      submitted_by: user?.id,
      submitted_by_name: user?.full_name,
    };
    try {
      if (existingReport) {
        await base44.entities.FijWeeklyReport.update(existingReport.id, payload);
      } else {
        await base44.entities.FijWeeklyReport.create(payload);
      }
      navigate(`/app/departements/fij/fij/${id}`);
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Link to={`/app/departements/fij/fij/${id}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> {fij.name}
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">CR semaine du {new Date(weekStart).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-amber-400" />
            <h1 className="text-lg font-semibold text-white">Compte-rendu hebdomadaire</h1>
          </div>
          <p className="text-xs text-gray-500">{fij.name} · {new Date(weekStart).toLocaleDateString('fr-FR')}</p>
        </motion.div>

        <div className="space-y-5">
          {/* Date */}
          <div>
            <label className={labelCls}>Date de rencontre</label>
            <input type="date" className={inputCls} value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} />
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Participants</label>
              <input type="number" min="0" className={inputCls} value={form.participants_count} onChange={e => setForm(f => ({ ...f, participants_count: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className={labelCls}>Nouveaux visiteurs</label>
              <input type="number" min="0" className={inputCls} value={form.new_visitors_count} onChange={e => setForm(f => ({ ...f, new_visitors_count: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className={labelCls}>Serviteurs présents</label>
              <input type="number" min="0" className={inputCls} value={form.servants_present_count} onChange={e => setForm(f => ({ ...f, servants_present_count: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          {/* Thème */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={form.theme_shared} onChange={e => setForm(f => ({ ...f, theme_shared: e.target.checked }))} className="w-4 h-4 accent-amber-400" />
              <span className="text-sm text-gray-300">Le thème de la semaine a été partagé</span>
            </label>
            {form.theme_shared && (
              <div>
                <label className={labelCls}>Titre du thème</label>
                <input className={inputCls} value={form.theme_title} onChange={e => setForm(f => ({ ...f, theme_title: e.target.value }))} placeholder="Titre du thème abordé" />
              </div>
            )}
          </div>

          {/* Résumé */}
          <div>
            <label className={labelCls}>Résumé de la réunion</label>
            <textarea className={inputCls + ' h-24 resize-none'} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Que s'est-il passé pendant la réunion ?" />
          </div>

          {/* Points forts */}
          <div>
            <label className={labelCls}>Points forts</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} placeholder="Moments marquants, bénédictions..." />
          </div>

          {/* Difficultés */}
          <div>
            <label className={labelCls}>Difficultés</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.difficulties} onChange={e => setForm(f => ({ ...f, difficulties: e.target.value }))} placeholder="Obstacles rencontrés..." />
          </div>

          {/* Besoins */}
          <div>
            <label className={labelCls}>Besoins</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.needs} onChange={e => setForm(f => ({ ...f, needs: e.target.value }))} placeholder="Besoins identifiés..." />
          </div>

          {/* Sujets de prière */}
          <div>
            <label className={labelCls}>Sujets de prière</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.prayer_points} onChange={e => setForm(f => ({ ...f, prayer_points: e.target.value }))} placeholder="Sujets à porter dans la prière..." />
          </div>

          {/* Personnes à suivre */}
          <div>
            <label className={labelCls}>Personnes à suivre</label>
            <textarea className={inputCls + ' h-20 resize-none'} value={form.people_to_follow} onChange={e => setForm(f => ({ ...f, people_to_follow: e.target.value }))} placeholder="Nouveaux visiteurs, personnes nécessitant un suivi pastoral..." />
          </div>
        </div>
      </div>

      {/* Actions fixes en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-md border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <button
            onClick={() => save('draft')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-400 border border-white/10 rounded-xl py-3 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Brouillon
          </button>
          <button
            onClick={() => save('submitted')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
}