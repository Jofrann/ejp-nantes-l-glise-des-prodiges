import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import DeptHero from '@/components/departements/DeptHero';
import ReferentGrid from '@/components/departements/ReferentGrid';
import MembresGrid from '@/components/departements/MembresGrid';
import AjouterMembreModal from '@/components/departements/AjouterMembreModal';

const COLOR_MAP = {
  amber:  { border: 'border-amber-400/20', text: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'bg-amber-400/5' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-400',  bg: 'bg-blue-400/10',  glow: 'bg-blue-400/5'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-400',bg: 'bg-purple-400/10', glow: 'bg-purple-400/5'},
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-400',  bg: 'bg-rose-400/10',  glow: 'bg-rose-400/5'  },
  green:  { border: 'border-green-400/20', text: 'text-green-400', bg: 'bg-green-400/10',  glow: 'bg-green-400/5' },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-400',bg: 'bg-indigo-400/10', glow: 'bg-indigo-400/5'},
};

export default function PageDepartement() {
  const { id } = useParams();
  const [dept, setDept] = useState(null);
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Department.filter({ id }),
      base44.entities.DepartmentMember.filter({ department_id: id, is_active: true }),
    ]).then(([u, depts, mems]) => {
      setUser(u);
      setDept(depts?.[0] || null);
      setMembers(mems || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [id]);

  const reloadMembers = () => {
    base44.entities.DepartmentMember.filter({ department_id: id, is_active: true }).then(setMembers);
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );

  if (!dept) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500">
      <p className="mb-4">Département introuvable.</p>
      <Link to="/departements" className="text-amber-400 text-sm">← Retour</Link>
    </div>
  );

  const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
  const referents = members.filter(m => m.role_in_dept === 'referent');
  const simpleMembers = members.filter(m => m.role_in_dept === 'membre');
  const isAdmin = user?.role === 'admin' || user?.role === 'bureau';
  const canManage = isAdmin || user?.role === 'referent';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full ${colors.glow} blur-[140px] opacity-50`} />
      </div>

      <div className="relative max-w-2xl mx-auto pb-20">

        {/* Hero bannière + identité */}
        <div className="px-4 pt-4">
          <DeptHero
            dept={dept}
            colors={colors}
            memberCount={members.length}
            referentCount={referents.length}
            isAdmin={canManage}
            onAddClick={() => setShowAddModal(true)}
          />
        </div>

        {/* Bouton édition (admin seulement) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 mb-6 flex justify-end"
          >
            <Link
              to={`/departement/${id}/editer`}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 px-3 py-1.5 rounded-xl transition-all"
            >
              <Settings className="w-3 h-3" /> Modifier le département
            </Link>
          </motion.div>
        )}

        {/* Référents */}
        <div className="px-5">
          <ReferentGrid
            referents={referents}
            colors={colors}
            isAdmin={canManage}
            onDelete={reloadMembers}
          />

          {/* Séparateur si les deux sections sont présentes */}
          {referents.length > 0 && (
            <div className="border-t border-white/5 my-6" />
          )}

          {/* Membres */}
          <MembresGrid
            membres={simpleMembers}
            colors={colors}
            isAdmin={canManage}
            onDelete={reloadMembers}
          />
        </div>
      </div>

      {/* Modal ajout */}
      {showAddModal && (
        <AjouterMembreModal
          departmentId={id}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); reloadMembers(); }}
        />
      )}
    </div>
  );
}