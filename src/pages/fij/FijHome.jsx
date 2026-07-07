import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon, BarChart3, Users, Calendar, FileText,
  Bell, AlertTriangle, Mail, FolderOpen, ArrowRight, Plus
} from 'lucide-react';
import { isBureauLike } from '@/lib/permissions';

const PILOT_LINKS = [
  { icon: HomeIcon, label: 'Ma FIJ', desc: 'Voir ma famille', to: '/app/departements/fij/mes-fij' },
  { icon: FileText, label: 'Remplir le CR', desc: 'Compte-rendu hebdo', to: '/app/departements/fij/cr-hebdomadaires' },
  { icon: Mail, label: 'Communications', desc: 'Thèmes & annonces', to: '/app/departements/fij/communications' },
  { icon: FolderOpen, label: 'Documents', desc: 'Ressources utiles', to: '/app/departements/fij/documents' },
];

const COORD_LINKS = [
  { icon: AlertTriangle, label: 'CR manquants', desc: 'Suivre les retards', to: '/app/departements/fij/cr-hebdomadaires' },
  { icon: Users, label: 'Registre', desc: 'Toutes les FIJ', to: '/app/departements/fij/registre' },
  { icon: BarChart3, label: 'Reporting', desc: 'Bilans & stats', to: '/app/departements/fij/reporting' },
  { icon: Bell, label: 'Alertes', desc: 'FIJ en difficulté', to: '/app/departements/fij/alertes' },
  { icon: Plus, label: 'Ouvertures', desc: 'Nouvelles FIJ', to: '/app/departements/fij/ouvertures' },
  { icon: Mail, label: 'Communications', desc: 'Envoyer thèmes', to: '/app/departements/fij/communications' },
];

const DIRECTION_LINKS = [
  { icon: BarChart3, label: 'Synthèse', desc: 'Vue globale FIJ', to: '/app/departements/fij/tableau-de-bord' },
  { icon: FileText, label: 'Rapports', desc: 'Bilans hebdo', to: '/app/departements/fij/reporting' },
  { icon: AlertTriangle, label: 'Alertes', desc: 'Points d\'attention', to: '/app/departements/fij/alertes' },
  { icon: Users, label: 'Registre', desc: 'Toutes les FIJ', to: '/app/departements/fij/registre' },
];

export default function FijHome() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.list('display_order', 50),
    ]).then(([u, f]) => {
      setUser(u);
      setFijs((f || []).filter(x => x.is_active));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
      </div>
    );
  }

  const isDirection = isBureauLike(user);
  const links = isDirection ? DIRECTION_LINKS : PILOT_LINKS;
  const activeFijs = fijs.filter(f => f.status === 'active' || !f.status);
  const pausedFijs = fijs.filter(f => f.status === 'paused');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Link to="/app/departements" className="text-xs text-gray-500 hover:text-white transition-colors mb-3 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3 rotate-180" /> Départements
          </Link>
          <p className="text-xs text-amber-400/60 uppercase tracking-widest mb-2">Mini-application</p>
          <h1 className="text-3xl font-semibold text-white">Familles d'Impact Jeunes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeFijs.length} FIJ active{activeFijs.length > 1 ? 's' : ''}
            {pausedFijs.length > 0 && ` · ${pausedFijs.length} en pause`}
          </p>
        </motion.div>

        {/* Chiffres clés */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{activeFijs.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">FIJ actives</p>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{fijs.reduce((s, f) => s + (f.member_count || 0), 0)}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Participants</p>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{pausedFijs.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">En pause</p>
          </div>
        </motion.div>

        {/* Navigation selon rôle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">
            {isDirection ? 'Espace coordination & direction' : 'Espace pilote'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(isDirection ? COORD_LINKS : links).map(({ icon: Icon, label, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="group bg-gradient-to-br from-amber-400/10 to-amber-600/5 border border-amber-400/15 rounded-2xl p-4 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <Icon className="w-5 h-5 text-amber-400/70 mb-3 group-hover:text-amber-400 transition-colors" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Liste rapide des FIJ (coordination/direction) */}
        {isDirection && activeFijs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs text-gray-500 uppercase tracking-widest">FIJ actives</h2>
              <Link to="/app/departements/fij/registre" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1 transition-colors">
                Registre <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {activeFijs.slice(0, 5).map(fij => (
                <Link
                  key={fij.id}
                  to={`/app/departements/fij/registre`}
                  className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{fij.name}</p>
                    <p className="text-xs text-gray-600">{fij.city} · {fij.member_count || 0} membres</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}