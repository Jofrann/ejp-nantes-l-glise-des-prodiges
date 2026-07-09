import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Users, Heart, Music, GraduationCap, Settings, ShieldAlert } from 'lucide-react';
import { isFijPilot, isFijCoordination, isBureauLike, isAdmin, hasRole } from '@/lib/permissions';

const TOOL_META = {
  fij_pilot: { icon: Heart, label: 'Pilote FIJ', desc: 'Ma FIJ, CR du jeudi, membres, assiduité', to: '/app/responsabilites/fij-pilote', color: 'from-rose-500/10 to-rose-500/5 border-rose-400/20 text-rose-600' },
  fij_coordination: { icon: Briefcase, label: 'Coordination FIJ', desc: 'Toutes les FIJ, relances, reporting', to: '/app/responsabilites/fij-coordination', color: 'from-secondary/10 to-secondary/5 border-secondary/20 text-secondary' },
  accueil: { icon: Users, label: 'Accueil', desc: 'Planning, visiteurs, reporting dimanche', to: '/app/responsabilites/accueil', color: 'from-blue-500/10 to-blue-500/5 border-blue-400/20 text-blue-600' },
  communication: { icon: Settings, label: 'Communication', desc: 'Demandes visuelles, calendrier éditorial', to: '/app/responsabilites/communication', color: 'from-purple-500/10 to-purple-500/5 border-purple-400/20 text-purple-600' },
  music: { icon: Music, label: 'Prodiges Musique', desc: 'Planning, setlists, répétitions', to: '/app/responsabilites/musique', color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-400/20 text-indigo-600' },
  academic: { icon: GraduationCap, label: 'Vie Académique', desc: 'Accompagnement étudiants, stages', to: '/app/responsabilites/vie-academique', color: 'from-green-500/10 to-green-500/5 border-green-400/20 text-green-600' },
};

export default function Responsabilites() {
  const [user, setUser] = useState(null);
  const [fijs, setFijs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.FIJ.filter({ is_active: true }, '-created_date', 50),
    ]).then(([u, f]) => {
      setUser(u);
      setFijs(f || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const tools = [];
  if (isFijPilot(user, fijs)) tools.push('fij_pilot');
  if (isFijCoordination(user)) tools.push('fij_coordination');
  if (hasRole(user, 'accueil') || hasRole(user, 'accueil_servant')) tools.push('accueil');
  if (hasRole(user, 'communication') || hasRole(user, 'communication_servant')) tools.push('communication');
  if (hasRole(user, 'music')) tools.push('music');
  if (hasRole(user, 'academic') || hasRole(user, 'academic_support')) tools.push('academic');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-heading font-bold text-foreground mb-1">Mes responsabilités</h1>
        <p className="text-sm text-muted-foreground mb-6">Tes outils de mission, attribués selon ton rôle.</p>
      </motion.div>

      {tools.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border mb-4">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Aucune responsabilité active</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Tu n'as pas encore d'outil de mission attribué. Un responsable peut t'en confier une.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map((key, i) => {
            const tool = TOOL_META[key];
            return (
              <motion.div key={key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  to={tool.to}
                  className={`flex items-center gap-4 bg-gradient-to-br ${tool.color} border rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98]`}
                >
                  <div className="w-10 h-10 rounded-xl bg-card/50 border border-border flex items-center justify-center flex-shrink-0">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{tool.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lien organisation */}
      <div className="mt-8 pt-6 border-t border-border">
        <Link to="/app/organisation" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Users className="w-4 h-4" />
          Voir mes rattachements et équipes
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </div>
  );
}