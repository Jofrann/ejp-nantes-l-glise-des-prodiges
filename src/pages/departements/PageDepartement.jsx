import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, MessageCircle, Lock, Loader2, ArrowLeft,
  LayoutDashboard, Users, AlertCircle,
  Calendar, Music, ListMusic, Library, CalendarCheck,
  SlidersHorizontal, Package, ListChecks, AlertTriangle,
  Heart, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isBureauLike, isAccountBlocked } from '@/lib/permissions';
import DeptIcon from '@/components/departements/DeptIcon';
import DeptRoleBadge from '@/components/departements/DeptRoleBadge';
import DeptOverviewTab from '@/components/departements/DeptOverviewTab';
import DeptTeamTab from '@/components/departements/DeptTeamTab';
import DeptMessagesTab from '@/components/departements/DeptMessagesTab';
import AjouterMembreModal from '@/components/departements/AjouterMembreModal';
import DeptChat from '@/components/departements/DeptChat';
import MusicOverviewTab from '@/components/departements/music/MusicOverviewTab';
import MusicPlanningTab from '@/components/departements/music/MusicPlanningTab';
import MusicRehearsalsTab from '@/components/departements/music/MusicRehearsalsTab';
import MusicSetlistsTab from '@/components/departements/music/MusicSetlistsTab';
import MusicRepertoireTab from '@/components/departements/music/MusicRepertoireTab';
import MusicAvailabilityTab from '@/components/departements/music/MusicAvailabilityTab';
import SoundOverviewTab from '@/components/departements/sound/SoundOverviewTab';
import SoundPlanningTab from '@/components/departements/sound/SoundPlanningTab';
import SoundPositionsTab from '@/components/departements/sound/SoundPositionsTab';
import SoundEquipmentTab from '@/components/departements/sound/SoundEquipmentTab';
import SoundChecklistsTab from '@/components/departements/sound/SoundChecklistsTab';
import SoundIncidentsTab from '@/components/departements/sound/SoundIncidentsTab';
import PrayerOverviewTab from '@/components/departements/prayer/PrayerOverviewTab';
import PrayerPlanningTab from '@/components/departements/prayer/PrayerPlanningTab';
import PrayerTopicsTab from '@/components/departements/prayer/PrayerTopicsTab';
import PrayerRequestsTab from '@/components/departements/prayer/PrayerRequestsTab';
import PrayerAvailabilityTab from '@/components/departements/prayer/PrayerAvailabilityTab';
import WelcomeOverviewTab from '@/components/departements/welcome/WelcomeOverviewTab';
import WelcomePlanningTab from '@/components/departements/welcome/WelcomePlanningTab';
import WelcomeVisitorsTab from '@/components/departements/welcome/WelcomeVisitorsTab';
import WelcomeIntegrationTab from '@/components/departements/welcome/WelcomeIntegrationTab';
import ModerationOverviewTab from '@/components/departements/moderation/ModerationOverviewTab';
import ModerationPlanningTab from '@/components/departements/moderation/ModerationPlanningTab';
import ModerationRunTab from '@/components/departements/moderation/ModerationRunTab';
import ModerationAnnouncementsTab from '@/components/departements/moderation/ModerationAnnouncementsTab';
import LogisticsOverviewTab from '@/components/departements/logistics/LogisticsOverviewTab';
import LogisticsPlanningTab from '@/components/departements/logistics/LogisticsPlanningTab';
import LogisticsTasksTab from '@/components/departements/logistics/LogisticsTasksTab';
import LogisticsNeedsTab from '@/components/departements/logistics/LogisticsNeedsTab';
import LogisticsEquipmentTab from '@/components/departements/logistics/LogisticsEquipmentTab';
import { getEnabledModules, MODULE_META } from '@/lib/departmentModules';
import { POSITION_LABELS } from '@/lib/musicConstants';

const MUSIC_TABS = ['music_planning', 'music_rehearsals', 'music_setlists', 'music_repertoire', 'music_availability'];
const SOUND_TABS = ['sound_planning', 'sound_positions', 'sound_equipment', 'sound_checklists', 'sound_incidents'];
const PRAYER_TABS = ['prayer_planning', 'prayer_topics', 'prayer_requests', 'prayer_availability'];
const WELCOME_TABS = ['welcome_planning', 'welcome_visitors', 'welcome_integration'];
const MODERATION_TABS = ['moderation_planning', 'moderation_run', 'moderation_announcements'];
const LOGISTICS_TABS = ['logistics_planning', 'logistics_tasks', 'logistics_needs', 'logistics_equipment'];

const COLOR_MAP = {
  amber:  { border: 'border-secondary/20', text: 'text-secondary', bg: 'bg-secondary/10', glow: 'bg-secondary/5' },
  blue:   { border: 'border-blue-400/20',  text: 'text-blue-600',  bg: 'bg-blue-500/10',  glow: 'bg-blue-500/5'  },
  purple: { border: 'border-purple-400/20',text: 'text-purple-600',bg: 'bg-purple-500/10', glow: 'bg-purple-500/5'},
  rose:   { border: 'border-rose-400/20',  text: 'text-rose-600',  bg: 'bg-rose-500/10',  glow: 'bg-rose-500/5'  },
  green:  { border: 'border-green-400/20', text: 'text-green-600', bg: 'bg-green-500/10',  glow: 'bg-green-500/5' },
  indigo: { border: 'border-indigo-400/20',text: 'text-indigo-600',bg: 'bg-indigo-500/10', glow: 'bg-indigo-500/5'},
};

/**
 * PageDepartement — Moteur commun pour afficher un département.
 *
 * Architecture :
 *   1. Utilisateur courant
 *   2. Department par slug (via getDepartmentData — backend guardian)
 *   3. Vérification d'accès backend (403 si non membre, sauf admin)
 *   4. Rôle effectif + permissions
 *   5. Configuration des modules (departmentModules.js)
 *   6. Données autorisées (membres, messages)
 *
 * UN MOTEUR COMMUN — pas de page par département.
 * Les modules sont activés selon la configuration centralisée.
 */
export default function PageDepartement() {
  const { slug: slugOrId } = useParams();
  const [dept, setDept] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roleInDept, setRoleInDept] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [isResponsable, setIsResponsable] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [musicData, setMusicData] = useState(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [soundData, setSoundData] = useState(null);
  const [soundLoading, setSoundLoading] = useState(false);
  const [prayerData, setPrayerData] = useState(null);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [moderationData, setModerationData] = useState(null);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [logisticsData, setLogisticsData] = useState(null);
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    setAccessDenied(false);
    setNotFound(false);

    try {
      const u = await base44.auth.me();
      setUser(u);

      // Compte bloqué — aucun accès
      if (isAccountBlocked(u)) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const res = (await base44.functions.invoke('getDepartmentData', { department_slug: slugOrId })).data;

      if (res.not_found) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (res.access_denied) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setDept(res.department);
      setMembers(res.members || []);
      setMessages(res.messages || []);
      setRoleInDept(res.role_in_dept || 'membre');
      setCanManage(res.can_manage || false);
      setIsResponsable(res.is_responsable || false);
      setLoading(false);

      // Charger les données musicales si le département a des modules musique
      const modules = getEnabledModules(res.department.slug);
      const hasMusic = modules.some(m => MUSIC_TABS.includes(m));
      if (hasMusic) {
        loadMusicData(res.department.slug);
      }

      // Charger les données sonorisation si le département a des modules sono
      const hasSound = modules.some(m => SOUND_TABS.includes(m));
      if (hasSound) {
        loadSoundData(res.department.slug);
      }

      // Charger les données MPI si le département a des modules prière
      const hasPrayer = modules.some(m => PRAYER_TABS.includes(m));
      if (hasPrayer) {
        loadPrayerData(res.department.slug);
      }

      // Charger les données Accueil si le département a des modules accueil
      const hasWelcome = modules.some(m => WELCOME_TABS.includes(m));
      if (hasWelcome) {
        loadWelcomeData(res.department.slug);
      }

      // Charger les données Modération si le département a des modules modération
      const hasModeration = modules.some(m => MODERATION_TABS.includes(m));
      if (hasModeration) {
        loadModerationData(res.department.slug);
      }

      // Charger les données Intendance si le département a des modules logistique
      const hasLogistics = modules.some(m => LOGISTICS_TABS.includes(m));
      if (hasLogistics) {
        loadLogisticsData(res.department.slug);
      }

      // Messages non lus
      const deptId = res.department.id;
      const key = `dept_chat_seen_${deptId}`;
      const seen = localStorage.getItem(key);
      const msgs = res.messages || [];
      if (!seen) {
        setUnreadCount(msgs.length);
      } else {
        setUnreadCount(msgs.filter(m => new Date(m.created_date) > new Date(seen)).length);
      }
    } catch (e) {
      const errMsg = (e?.message || e?.toString() || '');
      if (errMsg.includes('introuvable')) {
        setNotFound(true);
      } else if (errMsg.includes('access_denied') || errMsg.includes('403')) {
        setAccessDenied(true);
      } else {
        setError('Une erreur est survenue lors du chargement.');
      }
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slugOrId]);

  const reloadMessages = async () => {
    try {
      const res = (await base44.functions.invoke('getDepartmentData', { department_slug: slugOrId })).data;
      if (!res.access_denied) {
        setMembers(res.members || []);
        setMessages(res.messages || []);
      }
    } catch (e) {}
  };

  const loadMusicData = async (slug) => {
    setMusicLoading(true);
    try {
      const res = (await base44.functions.invoke('getMusicData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setMusicData(res);
      }
    } catch (e) {
      // Silencieux — les données musicales sont optionnelles
    } finally {
      setMusicLoading(false);
    }
  };

  const loadSoundData = async (slug) => {
    setSoundLoading(true);
    try {
      const res = (await base44.functions.invoke('getSoundData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setSoundData(res);
      }
    } catch (e) {
      // Silencieux — les données sonorisation sont optionnelles
    } finally {
      setSoundLoading(false);
    }
  };

  const loadPrayerData = async (slug) => {
    setPrayerLoading(true);
    try {
      const res = (await base44.functions.invoke('getPrayerData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setPrayerData(res);
      }
    } catch (e) {
      // Silencieux — les données MPI sont optionnelles
    } finally {
      setPrayerLoading(false);
    }
  };

  const loadWelcomeData = async (slug) => {
    setWelcomeLoading(true);
    try {
      const res = (await base44.functions.invoke('getWelcomeData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setWelcomeData(res);
      }
    } catch (e) {
      // Silencieux — les données Accueil sont optionnelles
    } finally {
      setWelcomeLoading(false);
    }
  };

  const loadModerationData = async (slug) => {
    setModerationLoading(true);
    try {
      const res = (await base44.functions.invoke('getModerationData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setModerationData(res);
      }
    } catch (e) {
      // Silencieux — les données Modération sont optionnelles
    } finally {
      setModerationLoading(false);
    }
  };

  const loadLogisticsData = async (slug) => {
    setLogisticsLoading(true);
    try {
      const res = (await base44.functions.invoke('getLogisticsData', { department_slug: slug || (dept && dept.slug) || slugOrId })).data;
      if (!res.access_denied && !res.not_found) {
        setLogisticsData(res);
      }
    } catch (e) {
      // Silencieux — les données Intendance sont optionnelles
    } finally {
      setLogisticsLoading(false);
    }
  };

  const openChat = () => {
    setShowChat(true);
    setUnreadCount(0);
    if (dept) {
      localStorage.setItem(`dept_chat_seen_${dept.id}`, new Date().toISOString());
    }
  };

  // === États ===

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Département introuvable</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">Ce département n'existe pas ou n'est plus disponible.</p>
        <Link to="/app/service" className="text-secondary text-sm">← Retour à Mon Service</Link>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6 text-danger/60" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Accès restreint</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">Tu n'as pas accès à cet espace. Ce département nécessite une appartenance active.</p>
        <Link to="/app/service" className="text-secondary text-sm">← Retour à Mon Service</Link>
      </div>
    );
  }

  if (error || !dept) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Une erreur est survenue</p>
        <p className="text-xs text-muted-foreground mb-5">{error || 'Impossible de charger ce département.'}</p>
        <Link to="/app/service" className="text-secondary text-sm">← Retour à Mon Service</Link>
      </div>
    );
  }

  // === Page principale ===

  const colors = COLOR_MAP[dept.color] || COLOR_MAP.amber;
  const enabledModules = getEnabledModules(dept.slug);
  const currentTab = enabledModules.includes(activeTab) ? activeTab : enabledModules[0];
  const isAdmin = isBureauLike(user);
  const canPost = isAdmin || isResponsable;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Glow ambiant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full ${colors.glow} blur-[140px] opacity-50`} />
      </div>

      {/* Header fixe */}
      <div className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 py-2">
            <Link to="/app/service" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Mon Service
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground truncate">{dept.name}</span>
          </div>

          {/* Identité département */}
          <div className="py-2.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <DeptIcon name={dept.icon} className={`w-4 h-4 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{dept.name}</p>
                {dept.short_name && (
                  <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded px-1.5 py-0.5">{dept.short_name}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <DeptRoleBadge role={roleInDept} />
                <span className="text-xs text-muted-foreground">{members.length} membre{members.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Bouton tchat */}
            <button
              onClick={openChat}
              className={`relative flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-110 transition-all`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Groupe</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
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

          {/* Navigation par onglets */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-2">
            {enabledModules.map(modId => {
              const meta = MODULE_META[modId];
              if (!meta) return null;
              const iconMap = {
                overview: LayoutDashboard, team: Users, messages: MessageCircle,
                music_planning: Calendar, music_rehearsals: Music,
                music_setlists: ListMusic, music_repertoire: Library, music_availability: CalendarCheck,
                sound_planning: Calendar, sound_positions: SlidersHorizontal,
                sound_equipment: Package, sound_checklists: ListChecks, sound_incidents: AlertTriangle,
                prayer_planning: Calendar,
                prayer_topics: Sparkles, prayer_requests: Lock, prayer_availability: CalendarCheck,
              };
              const Icon = iconMap[modId] || MessageCircle;
              const active = currentTab === modId;
              return (
                <button
                  key={modId}
                  onClick={() => setActiveTab(modId)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? `${colors.bg} ${colors.text} border ${colors.border}`
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6">
          {/* Bannière */}
          {dept.cover_url && (
            <div className="h-32 md:h-40 overflow-hidden rounded-2xl mb-6">
              <img src={dept.cover_url} alt={dept.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          {dept.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{dept.description}</p>
          )}

          {/* Contenu de l'onglet actif */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {currentTab === 'overview' && (
                <>
                  {musicData && MUSIC_TABS.some(t => enabledModules.includes(t)) ? (
                    <MusicOverviewTab
                      musicData={musicData}
                      isResponsable={isResponsable || canManage}
                      currentUserId={musicData.current_user_id}
                      colors={colors}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  ) : null}
                  {soundData && SOUND_TABS.some(t => enabledModules.includes(t)) ? (
                    <SoundOverviewTab
                      soundData={soundData}
                      isResponsable={isResponsable || canManage}
                      currentUserId={soundData.current_user_id}
                      colors={colors}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  ) : null}
                  {prayerData && PRAYER_TABS.some(t => enabledModules.includes(t)) ? (
                    <PrayerOverviewTab
                      prayerData={prayerData}
                      isResponsable={isResponsable || canManage}
                      currentUserId={prayerData.current_user_id}
                      colors={colors}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                    />
                  ) : null}
                  <DeptOverviewTab
                    dept={dept}
                    members={members}
                    roleInDept={roleInDept}
                    canManage={canManage}
                    colors={colors}
                  />
                </>
              )}
              {currentTab === 'team' && (
                <DeptTeamTab
                  members={members}
                  colors={colors}
                  musicProfiles={musicData ? musicData.profiles : null}
                  soundProfiles={soundData ? soundData.profiles : null}
                  prayerProfiles={prayerData ? prayerData.profiles : null}
                  departmentType={
                    MUSIC_TABS.some(t => enabledModules.includes(t)) ? 'music' :
                    SOUND_TABS.some(t => enabledModules.includes(t)) ? 'sound' :
                    PRAYER_TABS.some(t => enabledModules.includes(t)) ? 'prayer' : null
                  }
                />
              )}
              {currentTab === 'messages' && (
                <DeptMessagesTab
                  dept={dept}
                  messages={messages}
                  canPost={canPost}
                  onRefresh={reloadMessages}
                />
              )}
              {currentTab === 'music_planning' && musicData && (
                <MusicPlanningTab
                  musicData={musicData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={musicData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadMusicData()}
                />
              )}
              {currentTab === 'music_rehearsals' && musicData && (
                <MusicRehearsalsTab
                  musicData={musicData}
                  isResponsable={isResponsable || canManage}
                  colors={colors}
                  onRefresh={() => loadMusicData()}
                />
              )}
              {currentTab === 'music_setlists' && musicData && (
                <MusicSetlistsTab
                  musicData={musicData}
                  isResponsable={isResponsable || canManage}
                  colors={colors}
                  onRefresh={() => loadMusicData()}
                />
              )}
              {currentTab === 'music_repertoire' && musicData && (
                <MusicRepertoireTab
                  musicData={musicData}
                  isResponsable={isResponsable || canManage}
                  colors={colors}
                  onRefresh={() => loadMusicData()}
                />
              )}
              {currentTab === 'music_availability' && musicData && (
                <MusicAvailabilityTab
                  musicData={musicData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={musicData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadMusicData()}
                />
              )}
              {currentTab === 'sound_planning' && soundData && (
                <SoundPlanningTab
                  soundData={soundData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={soundData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadSoundData()}
                />
              )}
              {currentTab === 'sound_positions' && soundData && (
                <SoundPositionsTab
                  soundData={soundData}
                  isResponsable={isResponsable || canManage}
                  colors={colors}
                  onRefresh={() => loadSoundData()}
                />
              )}
              {currentTab === 'sound_equipment' && soundData && (
                <SoundEquipmentTab
                  soundData={soundData}
                  isResponsable={isResponsable || canManage}
                  colors={colors}
                  onRefresh={() => loadSoundData()}
                />
              )}
              {currentTab === 'sound_checklists' && soundData && (
                <SoundChecklistsTab
                  soundData={soundData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={soundData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadSoundData()}
                />
              )}
              {currentTab === 'sound_incidents' && soundData && (
                <SoundIncidentsTab
                  soundData={soundData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={soundData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadSoundData()}
                />
              )}
              {currentTab === 'prayer_planning' && prayerData && (
                <PrayerPlanningTab
                  prayerData={prayerData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={prayerData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadPrayerData()}
                />
              )}
              {currentTab === 'prayer_topics' && prayerData && (
                <PrayerTopicsTab
                  prayerData={prayerData}
                  isResponsable={isResponsable || canManage}
                  isLeader={prayerData.is_leader}
                  colors={colors}
                  onRefresh={() => loadPrayerData()}
                />
              )}
              {currentTab === 'prayer_requests' && prayerData && (
                <PrayerRequestsTab
                  prayerData={prayerData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={prayerData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadPrayerData()}
                />
              )}
              {currentTab === 'prayer_availability' && prayerData && (
                <PrayerAvailabilityTab
                  prayerData={prayerData}
                  isResponsable={isResponsable || canManage}
                  currentUserId={prayerData.current_user_id}
                  colors={colors}
                  onRefresh={() => loadPrayerData()}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Section administration (admin uniquement) */}
          {isAdmin && (
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Administration</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`flex items-center gap-1.5 text-xs ${colors.bg} border ${colors.border} ${colors.text} px-3 py-2 rounded-xl hover:brightness-110 transition-all`}
                >
                  <Users className="w-3.5 h-3.5" /> Ajouter un membre
                </button>
                <Link
                  to={`/app/departements/${dept.slug || dept.id}/parametres`}
                  className="flex items-center gap-1.5 text-xs bg-surface border border-border text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl transition-all"
                >
                  <Settings className="w-3.5 h-3.5" /> Paramètres
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajout membre (admin uniquement) */}
      {showAddModal && (
        <AjouterMembreModal
          departmentId={dept.id}
          existingUserIds={members.map(m => m.user_id).filter(Boolean)}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); reloadMessages(); }}
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