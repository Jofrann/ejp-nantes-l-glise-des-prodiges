import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, MessageCircle, Users, Lock, Target, Clock, Award, ListChecks, Package } from 'lucide-react';
import { isBureauLike } from '@/lib/permissions';
import DeptHero from '@/components/departements/DeptHero';
import ReferentGrid from '@/components/departements/ReferentGrid';
import MembresGrid from '@/components/departements/MembresGrid';
import AjouterMembreModal from '@/components/departements/AjouterMembreModal';
import DeptChat from '@/components/departements/DeptChat';
import DeptIcon from '@/components/departements/DeptIcon';
import GestionMembres from '@/components/departements/GestionMembres';
import MissionCard from '@/components/departements/MissionCard';

const COLOR_MAP = {
  amber:  { border: 'border-amber-400/20', text: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'bg-amber-400/5' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-400',  bg: 'bg-blue-400/10',  glow: 'bg-blue-400/5'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-400',bg: 'bg-purple-400/10', glow: 'bg-purple-400/5'},
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-400',  bg: 'bg-rose-400/10',  glow: 'bg-rose-400/5'  },
  green:  { border: 'border-green-400/20', text: 'text-green-400', bg: 'bg-green-400/10',  glow: 'bg-green-400/5' },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-400',bg: 'bg-indigo-400/10', glow: 'bg-indigo-400/5'},
};

export default function PageDepartement() {
  const { slug: id } = useParams();
  const [dept, setDept] = useState(null);
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenDate, setLastSeenDate] = useState(null);

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

      // Charger les messages non lus
      const key = `dept_chat_seen_${id}`;
      const seen = localStorage.getItem(key);
      setLastSeenDate(seen);
      base44.entities.DeptMessage.filter({ department_id: id }, '-created_date', 50).then(msgs => {
        if (!seen) { setUnreadCount(msgs?.length || 0); return; }
        const count = (msgs || []).filter(m => new Date(m.created_date) > new Date(seen)).length;
        setUnreadCount(count);
      });
    });
  };

  useEffect(() => { load(); }, [id]);

  const reloadMembers = () => {
    base44.entities.DepartmentMember.filter({ department_id: id, is_active: true }).then(setMembers);
  };

  const openChat = () => {
    setShowChat(true);
    setUnreadCount(0);
    const key = `dept_chat_seen_${id}`;
    localStorage.setItem(key, new Date().toISOString());
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-white/15 border-t-amber-400/80 rounded-full animate-spin" />
    </div>
  );

  if (!dept) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500">
      <p className="mb-4">Département introuvable.</p>
      <Link to="/app/departements" className="text-amber-400 text-sm">← Retour</Link>
    </div>
  );

  const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
  const referents = members.filter(m => m.role_in_dept === 'referent');
  const simpleMembers = members.filter(m => m.role_in_dept === 'membre');
  const isAdmin = isBureauLike(user);
  const isReferentOfDept = members.some(m => m.user_id === user?.id && m.role_in_dept === 'referent');
  const canManage = isAdmin || isReferentOfDept;
  const existingUserIds = members.map(m => m.user_id).filter(Boolean);

  // Protection d'accès : un serviteur ne peut entrer que dans un département auquel il est rattaché
  const isMember = members.some(m => m.user_id === user?.id);
  if (!isAdmin && !isMember) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-gray-500 px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <Lock className="w-6 h-6 text-red-400/60" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">Accès restreint</p>
      <p className="text-xs text-gray-500 mb-5 max-w-xs">Tu ne fais pas partie de ce département. Contacte un responsable pour le rejoindre.</p>
      <Link to="/app/departements" className="text-amber-400 text-sm">← Retour aux départements</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full ${colors.glow} blur-[140px] opacity-50`} />
      </div>

      {/* Header fixe (uniquement sur cette page) */}
      <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Identité compacte */}
          <div className={`w-8 h-8 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
            <DeptIcon name={dept.icon} className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{dept.name}</p>
            <p className="text-xs text-gray-500">{members.length} membre{members.length > 1 ? 's' : ''}</p>
          </div>

          {/* Bouton tchat */}
          <button
            onClick={openChat}
            className={`relative flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-125 transition-all`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Groupe</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Bouton édition admin */}
          {isAdmin && (
            <Link
              to={`/app/departements/${id}/parametres`}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-white border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 rounded-xl transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative max-w-2xl mx-auto pb-20">
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

        <div className="px-5">
          {/* Architecture de mission */}
          {(dept.attente_superieure || dept.rythme_travail || dept.critere_excellence || dept.responsabilites || dept.livrables) && (
            <div className="mb-8">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Espace de mission</p>
              <div className="space-y-3">
                {dept.attente_superieure && (
                  <MissionCard icon={Target} label="Attente supérieure" text={dept.attente_superieure} colors={colors} />
                )}
                {dept.rythme_travail && (
                  <MissionCard icon={Clock} label="Rythme de travail" text={dept.rythme_travail} colors={colors} />
                )}
                {dept.critere_excellence && (
                  <MissionCard icon={Award} label="Critère d'excellence" text={dept.critere_excellence} colors={colors} />
                )}
                {dept.responsabilites && (
                  <MissionCard icon={ListChecks} label="Responsabilités" text={dept.responsabilites} colors={colors} />
                )}
                {dept.livrables && (
                  <MissionCard icon={Package} label="Livrables attendus" text={dept.livrables} colors={colors} />
                )}
              </div>
            </div>
          )}

          <ReferentGrid
            referents={referents}
            colors={colors}
            isAdmin={canManage}
            onDelete={reloadMembers}
          />

          {referents.length > 0 && (
            <div className="border-t border-white/5 my-6" />
          )}

          <MembresGrid
            membres={simpleMembers}
            colors={colors}
            isAdmin={canManage}
            onDelete={reloadMembers}
          />

          {/* Section gestion admin */}
          {isAdmin && (
            <div className="mt-10">
              <div className="border-t border-white/5 mb-6" />
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Administration</p>
              <GestionMembres
                members={members}
                colors={colors}
                departmentId={id}
                existingUserIds={existingUserIds}
                onReload={reloadMembers}
                onOpenAdd={() => setShowAddModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal ajout membre (vrais utilisateurs) */}
      {showAddModal && (
        <AjouterMembreModal
          departmentId={id}
          existingUserIds={existingUserIds}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); reloadMembers(); }}
        />
      )}

      {/* Chat overlay */}
      <AnimatePresence>
        {showChat && (
          <DeptChat
            dept={dept}
            colors={colors}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}