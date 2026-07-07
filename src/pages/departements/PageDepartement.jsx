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
import PageBreadcrumb from '@/components/navigation/PageBreadcrumb';

async function findDepartmentBySlugOrId(slugOrId) {
  let res = await base44.entities.Department.filter({ id: slugOrId });
  if (res?.[0]) return res[0];
  res = await base44.entities.Department.filter({ slug: slugOrId });
  return res?.[0] || null;
}

const COLOR_MAP = {
  amber:  { border: 'border-secondary/20', text: 'text-secondary', bg: 'bg-secondary/10', glow: 'bg-secondary/5' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-600',  bg: 'bg-blue-500/10',  glow: 'bg-blue-500/5'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-600',bg: 'bg-purple-500/10', glow: 'bg-purple-500/5'},
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-600',  bg: 'bg-rose-500/10',  glow: 'bg-rose-500/5'  },
  green:  { border: 'border-green-400/20', text: 'text-green-600', bg: 'bg-green-500/10',  glow: 'bg-green-500/5' },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-600',bg: 'bg-indigo-500/10', glow: 'bg-indigo-500/5'},
};

export default function PageDepartement() {
  const { slug: slugOrId } = useParams();
  const [dept, setDept] = useState(null);
  const [resolvedId, setResolvedId] = useState(null);
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenDate, setLastSeenDate] = useState(null);

  const load = async () => {
    const [u, found] = await Promise.all([
      base44.auth.me(),
      findDepartmentBySlugOrId(slugOrId),
    ]);
    setUser(u);
    setDept(found);
    if (!found) { setLoading(false); return; }
    const deptId = found.id;
    setResolvedId(deptId);

    const mems = await base44.entities.DepartmentMember.filter({ department_id: deptId, is_active: true });
    setMembers(mems || []);
    setLoading(false);

    // Charger les messages non lus
    const key = `dept_chat_seen_${deptId}`;
    const seen = localStorage.getItem(key);
    setLastSeenDate(seen);
    base44.entities.DeptMessage.filter({ department_id: deptId }, '-created_date', 50).then(msgs => {
      if (!seen) { setUnreadCount(msgs?.length || 0); return; }
      const count = (msgs || []).filter(m => new Date(m.created_date) > new Date(seen)).length;
      setUnreadCount(count);
    });
  };

  useEffect(() => { load(); }, [slugOrId]);

  const reloadMembers = () => {
    if (!resolvedId) return;
    base44.entities.DepartmentMember.filter({ department_id: resolvedId, is_active: true }).then(setMembers);
  };

  const openChat = () => {
    setShowChat(true);
    setUnreadCount(0);
    const key = `dept_chat_seen_${resolvedId}`;
    localStorage.setItem(key, new Date().toISOString());
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (!dept) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
      <p className="mb-4">Département introuvable.</p>
      <Link to="/app/departements" className="text-secondary text-sm">← Retour</Link>
    </div>
  );

  const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
  const referents = members.filter(m => m.role_in_dept === 'referent');
  const simpleMembers = members.filter(m => m.role_in_dept === 'membre');
  const isAdmin = isBureauLike(user);
  const isReferentOfDept = members.some(m => m.user_id === user?.id && m.role_in_dept === 'referent');
  const canManage = isAdmin || isReferentOfDept;
  const existingUserIds = members.map(m => m.user_id).filter(Boolean);
  const id = resolvedId;

  // Protection d'accès : un serviteur ne peut entrer que dans un département auquel il est rattaché
  const isMember = members.some(m => m.user_id === user?.id);
  if (!isAdmin && !isMember) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-5">
        <Lock className="w-6 h-6 text-danger/60" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Accès restreint</p>
      <p className="text-xs text-muted-foreground mb-5 max-w-xs">Tu ne fais pas partie de ce département. Contacte un responsable pour le rejoindre.</p>
      <Link to="/app/departements" className="text-secondary text-sm">← Retour aux départements</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full ${colors.glow} blur-[140px] opacity-50`} />
      </div>

      {/* Header fixe (uniquement sur cette page) */}
      <div className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <PageBreadcrumb
            items={[
              { label: 'Tableau de bord', to: '/app' },
              { label: 'Départements', to: '/app/departements' },
              { label: dept.name, to: `/app/departements/${dept.slug || dept.id}` },
            ]}
            backTo="/app/departements"
            backLabel="← Départements"
            rightAction={
              <Link to="/app" className="text-xs text-muted-foreground hover:text-secondary transition-colors">
                Tableau de bord
              </Link>
            }
          />
          {/* Ligne identité + actions */}
          <div className="py-2.5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <DeptIcon name={dept.icon} className={`w-4 h-4 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
              <p className="text-xs text-muted-foreground">{members.length} membre{members.length > 1 ? 's' : ''}</p>
            </div>

            {/* Bouton tchat */}
            <button
              onClick={openChat}
              className={`relative flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-110 transition-all`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Groupe</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bouton édition admin */}
            {isAdmin && (
              <Link
                to={`/app/departements/${dept.slug || dept.id}/parametres`}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground border border-border hover:border-secondary/30 bg-card hover:bg-surface rounded-xl transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
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
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-4">Espace de mission</p>
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
            <div className="border-t border-border my-6" />
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
              <div className="border-t border-border mb-6" />
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-3">Administration</p>
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