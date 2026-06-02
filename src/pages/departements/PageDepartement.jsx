import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Users, Star, Crown, Pencil } from 'lucide-react';
import DeptIcon from '@/components/departements/DeptIcon';
import MembreCard from '@/components/departements/MembreCard';
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
  const [activeTab, setActiveTab] = useState('membres');

  useEffect(() => {
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
  }, [id]);

  const reload = () => {
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
  const isAdmin = user?.role === 'admin' || user?.role === 'bureau' || user?.role === 'referent';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Glow déco */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full ${colors.glow} blur-[120px] opacity-60`} />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 pt-8 pb-16">

        {/* Back */}
        <Link
          to="/departements"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Tous les départements
        </Link>

        {/* Header du département */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <DeptIcon name={dept.icon} className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white">{dept.name}</h1>
              {dept.description && <p className="text-sm text-gray-400 mt-1">{dept.description}</p>}
              <p className={`text-xs mt-2 ${colors.text} opacity-70`}>
                {members.length} membre{members.length > 1 ? 's' : ''} · {referents.length} référent{referents.length > 1 ? 's' : ''}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-125 transition-all`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Ajouter
              </button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          {[
            { id: 'membres', label: 'Membres', count: simpleMembers.length, icon: Users },
            { id: 'referents', label: 'Référents', count: referents.length, icon: Crown },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-white/10 text-white`
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? colors.bg + ' ' + colors.text : 'bg-white/5 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Liste membres */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'referents' && (
              <div className="space-y-3">
                {referents.length === 0 ? (
                  <EmptyState label="Aucun référent pour ce département." />
                ) : referents.map((m, i) => (
                  <MembreCard key={m.id} member={m} index={i} colors={colors} isAdmin={isAdmin} onDelete={reload} badge="Référent" />
                ))}
              </div>
            )}
            {activeTab === 'membres' && (
              <div className="space-y-3">
                {simpleMembers.length === 0 ? (
                  <EmptyState label="Aucun membre pour ce département." />
                ) : simpleMembers.map((m, i) => (
                  <MembreCard key={m.id} member={m} index={i} colors={colors} isAdmin={isAdmin} onDelete={reload} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Modal ajout membre */}
      {showAddModal && (
        <AjouterMembreModal
          departmentId={id}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); reload(); }}
        />
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-12 text-gray-600">
      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}