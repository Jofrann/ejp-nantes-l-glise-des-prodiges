import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import RoleLayout from '@/components/layouts/RoleLayout';
import RoleGuard from '@/components/RoleGuard';
import Home from '@/pages/Home';
import AdminHome from '@/pages/AdminHome';
import MonProfil from '@/pages/MonProfil';
import EspaceServiteurSas from '@/pages/EspaceServiteurSas';
import AppDashboard from '@/pages/AppDashboard';
import FijTableauBord from '@/pages/fij/TableauBord';
import FijMesFij from '@/pages/fij/MesFij';
import FijRegistre from '@/pages/fij/Registre';
import FijCrHebdomadaires from '@/pages/fij/CrHebdomadaires';
import FijOuvertures from '@/pages/fij/Ouvertures';
import FijConsecrations from '@/pages/fij/Consecrations';
import FijPause from '@/pages/fij/Pause';
import FijPilotes from '@/pages/fij/Pilotes';
import FijCommunications from '@/pages/fij/Communications';
import FijReporting from '@/pages/fij/Reporting';
import FijDocuments from '@/pages/fij/Documents';
import FijAlertes from '@/pages/fij/Alertes';
import FijTransferts from '@/pages/fij/Transferts';
import FijDetail from '@/pages/fij/FijDetail';
import FijCrForm from '@/pages/fij/FijCrForm';
import FijPiloteHome from '@/pages/fij/PiloteHome';
import FijRelances from '@/pages/fij/Relances';
import FijBureau from '@/pages/fij/FijBureau';
import CrJeudiForm from '@/pages/fij/CrJeudiForm';
import CrJeudiDetail from '@/pages/fij/CrJeudiDetail';
import CrJeudiList from '@/pages/fij/CrJeudiList';
import MemberDetail from '@/pages/fij/MemberDetail';
import PageDepartement from '@/pages/departements/PageDepartement';
import DepartmentEntry from '@/components/DepartmentEntry';
import EditerDepartement from '@/pages/departements/EditerDepartement';
import StarAgenda from '@/pages/star/Agenda';
import StarPresences from '@/pages/star/Presences';
import StarFormations from '@/pages/star/Formations';
import StarCroissance from '@/pages/star/Croissance';
import StarObjectifs from '@/pages/star/Objectifs';
import StarRendezVous from '@/pages/star/RendezVous';
import StarRessources from '@/pages/star/Ressources';
import StarParcours from '@/pages/star/Parcours';
import StarEspacePersonnel from '@/pages/star/EspacePersonnel';
import StarResponsabilites from '@/pages/star/Responsabilites';
import StarOrganisation from '@/pages/star/Organisation';
import StarSupervision from '@/pages/star/Supervision';
import ResponsabilitePlaceholder from '@/pages/star/ResponsabilitePlaceholder';
import { Users, Settings as SettingsIcon, Music, GraduationCap } from 'lucide-react';

const { Pages, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Routes publiques auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Vitrine publique */}
      <Route path="/" element={<Home />} />
      <Route path="/espace-serviteur" element={<EspaceServiteurSas />} />

      {/* Routes protégées (espace interne) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<RoleLayout />}>
          {/* Routes héritées (pages.config) */}
          {Object.entries(Pages).filter(([p]) => p !== 'Home').map(([path, Page]) => (
            <Route key={path} path={`/${path}`} element={<Page />} />
          ))}

          <Route path="/app" element={<AppDashboard />} />
          <Route path="/app/profil" element={<MonProfil />} />
          <Route path="/app/departements" element={<Navigate to="/app/responsabilites" replace />} />
          <Route path="/app/departements/fij" element={<Navigate to="/app/responsabilites" replace />} />

          {/* === Espace Pilote FIJ (sous /app/responsabilites/fij-pilote) === */}
          <Route path="/app/responsabilites/fij-pilote" element={<FijPiloteHome />} />
          <Route path="/app/responsabilites/fij-pilote/mes-fij" element={<FijMesFij />} />
          <Route path="/app/responsabilites/fij-pilote/cr" element={<FijCrHebdomadaires />} />
          <Route path="/app/responsabilites/fij-pilote/communications" element={<FijCommunications />} />
          <Route path="/app/responsabilites/fij-pilote/documents" element={<FijDocuments />} />
          <Route path="/app/responsabilites/fij-pilote/alertes" element={<FijAlertes />} />
          <Route path="/app/responsabilites/fij-pilote/mes-fij/:fijId" element={<FijBureau />} />
          <Route path="/app/responsabilites/fij-pilote/mes-fij/:fijId/cr-jeudi/nouveau" element={<CrJeudiForm />} />
          <Route path="/app/responsabilites/fij-pilote/mes-fij/:fijId/cr-jeudi/:reportId" element={<CrJeudiDetail />} />
          <Route path="/app/responsabilites/fij-pilote/mes-fij/:fijId/membres/:memberId" element={<MemberDetail />} />

          {/* === Espace Coordination FIJ (sous /app/responsabilites/fij-coordination) === */}
          <Route path="/app/responsabilites/fij-coordination" element={<FijTableauBord />} />
          <Route path="/app/responsabilites/fij-coordination/registre" element={<FijRegistre />} />
          <Route path="/app/responsabilites/fij-coordination/cr" element={<FijCrHebdomadaires />} />
          <Route path="/app/responsabilites/fij-coordination/relances" element={<FijRelances />} />
          <Route path="/app/responsabilites/fij-coordination/ouvertures" element={<FijOuvertures />} />
          <Route path="/app/responsabilites/fij-coordination/consecrations" element={<FijConsecrations />} />
          <Route path="/app/responsabilites/fij-coordination/pause" element={<FijPause />} />
          <Route path="/app/responsabilites/fij-coordination/pilotes" element={<FijPilotes />} />
          <Route path="/app/responsabilites/fij-coordination/communications" element={<FijCommunications />} />
          <Route path="/app/responsabilites/fij-coordination/documents" element={<FijDocuments />} />
          <Route path="/app/responsabilites/fij-coordination/alertes" element={<FijAlertes />} />
          <Route path="/app/responsabilites/fij-coordination/reporting" element={<FijReporting />} />
          <Route path="/app/responsabilites/fij-coordination/transferts" element={<FijTransferts />} />
          <Route path="/app/responsabilites/fij-coordination/registre/:fijId" element={<FijBureau />} />
          <Route path="/app/responsabilites/fij-coordination/registre/:fijId/cr-jeudi/nouveau" element={<CrJeudiForm />} />
          <Route path="/app/responsabilites/fij-coordination/registre/:fijId/cr-jeudi/:reportId" element={<CrJeudiDetail />} />
          <Route path="/app/responsabilites/fij-coordination/cr-jeudi" element={<CrJeudiList />} />

          {/* === Routes partagées === */}
          <Route path="/app/responsabilites/fij-pilote/fij/:id" element={<FijDetail />} />
          <Route path="/app/responsabilites/fij-pilote/fij/:id/cr/nouveau" element={<FijCrForm />} />

          {/* === Redirections anciennes routes FIJ vers /app/responsabilites === */}
          <Route path="/app/departements/fij/pilote" element={<Navigate to="/app/responsabilites/fij-pilote" replace />} />
          <Route path="/app/departements/fij/pilote/mes-fij" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij" replace />} />
          <Route path="/app/departements/fij/pilote/cr" element={<Navigate to="/app/responsabilites/fij-pilote/cr" replace />} />
          <Route path="/app/departements/fij/pilote/communications" element={<Navigate to="/app/responsabilites/fij-pilote/communications" replace />} />
          <Route path="/app/departements/fij/pilote/documents" element={<Navigate to="/app/responsabilites/fij-pilote/documents" replace />} />
          <Route path="/app/departements/fij/pilote/alertes" element={<Navigate to="/app/responsabilites/fij-pilote/alertes" replace />} />
          <Route path="/app/departements/fij/pilote/mes-fij/:fijId" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij/:fijId" replace />} />
          <Route path="/app/departements/fij/pilote/mes-fij/:fijId/cr-jeudi/nouveau" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij/:fijId/cr-jeudi/nouveau" replace />} />
          <Route path="/app/departements/fij/pilote/mes-fij/:fijId/cr-jeudi/:reportId" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij/:fijId/cr-jeudi/:reportId" replace />} />
          <Route path="/app/departements/fij/pilote/mes-fij/:fijId/membres/:memberId" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij/:fijId/membres/:memberId" replace />} />
          <Route path="/app/departements/fij/coordination" element={<Navigate to="/app/responsabilites/fij-coordination" replace />} />
          <Route path="/app/departements/fij/coordination/registre" element={<Navigate to="/app/responsabilites/fij-coordination/registre" replace />} />
          <Route path="/app/departements/fij/coordination/cr" element={<Navigate to="/app/responsabilites/fij-coordination/cr" replace />} />
          <Route path="/app/departements/fij/coordination/relances" element={<Navigate to="/app/responsabilites/fij-coordination/relances" replace />} />
          <Route path="/app/departements/fij/coordination/ouvertures" element={<Navigate to="/app/responsabilites/fij-coordination/ouvertures" replace />} />
          <Route path="/app/departements/fij/coordination/consecrations" element={<Navigate to="/app/responsabilites/fij-coordination/consecrations" replace />} />
          <Route path="/app/departements/fij/coordination/pause" element={<Navigate to="/app/responsabilites/fij-coordination/pause" replace />} />
          <Route path="/app/departements/fij/coordination/pilotes" element={<Navigate to="/app/responsabilites/fij-coordination/pilotes" replace />} />
          <Route path="/app/departements/fij/coordination/communications" element={<Navigate to="/app/responsabilites/fij-coordination/communications" replace />} />
          <Route path="/app/departements/fij/coordination/documents" element={<Navigate to="/app/responsabilites/fij-coordination/documents" replace />} />
          <Route path="/app/departements/fij/coordination/alertes" element={<Navigate to="/app/responsabilites/fij-coordination/alertes" replace />} />
          <Route path="/app/departements/fij/coordination/reporting" element={<Navigate to="/app/responsabilites/fij-coordination/reporting" replace />} />
          <Route path="/app/departements/fij/coordination/transferts" element={<Navigate to="/app/responsabilites/fij-coordination/transferts" replace />} />
          <Route path="/app/departements/fij/coordination/registre/:fijId" element={<Navigate to="/app/responsabilites/fij-coordination/registre/:fijId" replace />} />
          <Route path="/app/departements/fij/coordination/registre/:fijId/cr-jeudi/nouveau" element={<Navigate to="/app/responsabilites/fij-coordination/registre/:fijId/cr-jeudi/nouveau" replace />} />
          <Route path="/app/departements/fij/coordination/registre/:fijId/cr-jeudi/:reportId" element={<Navigate to="/app/responsabilites/fij-coordination/registre/:fijId/cr-jeudi/:reportId" replace />} />
          <Route path="/app/departements/fij/coordination/cr-jeudi" element={<Navigate to="/app/responsabilites/fij-coordination/cr-jeudi" replace />} />
          <Route path="/app/departements/fij/direction" element={<Navigate to="/app/supervision" replace />} />
          <Route path="/app/departements/fij/direction/tableau-de-bord" element={<Navigate to="/app/supervision" replace />} />
          <Route path="/app/departements/fij/fij/:id" element={<Navigate to="/app/responsabilites/fij-pilote/fij/:id" replace />} />
          <Route path="/app/departements/fij/fij/:id/cr/nouveau" element={<Navigate to="/app/responsabilites/fij-pilote/fij/:id/cr/nouveau" replace />} />

          {/* === Redirections anciennes routes FIJ === */}
          <Route path="/app/departements/fij/tableau-de-bord" element={<Navigate to="/app/responsabilites/fij-coordination" replace />} />
          <Route path="/app/departements/fij/mes-fij" element={<Navigate to="/app/responsabilites/fij-pilote/mes-fij" replace />} />
          <Route path="/app/departements/fij/registre" element={<Navigate to="/app/responsabilites/fij-coordination/registre" replace />} />
          <Route path="/app/departements/fij/cr-hebdomadaires" element={<Navigate to="/app/responsabilites/fij-coordination/cr" replace />} />
          <Route path="/app/departements/fij/ouvertures" element={<Navigate to="/app/responsabilites/fij-coordination/ouvertures" replace />} />
          <Route path="/app/departements/fij/consecrations" element={<Navigate to="/app/responsabilites/fij-coordination/consecrations" replace />} />
          <Route path="/app/departements/fij/pause" element={<Navigate to="/app/responsabilites/fij-coordination/pause" replace />} />
          <Route path="/app/departements/fij/pilotes" element={<Navigate to="/app/responsabilites/fij-coordination/pilotes" replace />} />
          <Route path="/app/departements/fij/communications" element={<Navigate to="/app/responsabilites/fij-coordination/communications" replace />} />
          <Route path="/app/departements/fij/reporting" element={<Navigate to="/app/responsabilites/fij-coordination/reporting" replace />} />
          <Route path="/app/departements/fij/documents" element={<Navigate to="/app/responsabilites/fij-coordination/documents" replace />} />
          <Route path="/app/departements/fij/alertes" element={<Navigate to="/app/responsabilites/fij-coordination/alertes" replace />} />
          <Route path="/app/departements/fij/transferts" element={<Navigate to="/app/responsabilites/fij-coordination/transferts" replace />} />
          {/* === Routes STAR OS — Espace personnel serviteur === */}
          <Route path="/app/agenda" element={<StarAgenda />} />
          <Route path="/app/presences" element={<StarPresences />} />
          <Route path="/app/formations" element={<StarFormations />} />
          <Route path="/app/croissance" element={<StarCroissance />} />
          <Route path="/app/objectifs" element={<StarObjectifs />} />
          <Route path="/app/rendez-vous" element={<StarRendezVous />} />
          <Route path="/app/ressources" element={<StarRessources />} />
          <Route path="/app/parcours" element={<StarParcours />} />
          <Route path="/app/espace-personnel" element={<StarEspacePersonnel />} />
          <Route path="/app/responsabilites" element={<StarResponsabilites />} />
          <Route path="/app/organisation" element={<StarOrganisation />} />
          <Route path="/app/supervision" element={<RoleGuard allowedRoles={['bureau', 'bergere', 'admin']}><StarSupervision /></RoleGuard>} />

          {/* === Redirections anciennes routes vers responsabilités === */}
          <Route path="/app/responsabilites/accueil" element={<ResponsabilitePlaceholder title="Accueil" description="Planning, visiteurs, reporting dimanche" icon={Users} items={['Planning accueil', 'Présences serviteurs', 'Visiteurs', 'Fiches pratiques', 'Reporting dimanche']} />} />
          <Route path="/app/responsabilites/communication" element={<ResponsabilitePlaceholder title="Communication" description="Demandes visuelles, calendrier éditorial" icon={SettingsIcon} items={['Demandes visuelles', 'Calendrier éditorial', 'Médias', 'Publications', 'Validations']} />} />
          <Route path="/app/responsabilites/musique" element={<ResponsabilitePlaceholder title="Prodiges Musique" description="Planning, setlists, répétitions" icon={Music} items={['Planning musique', 'Setlists', 'Répétitions', 'Chants', 'Reporting']} />} />
          <Route path="/app/responsabilites/vie-academique" element={<ResponsabilitePlaceholder title="Vie Académique" description="Accompagnement étudiants, stages" icon={GraduationCap} items={['Suivi étudiants', 'Recherche stages', 'Accompagnement', 'CV / orientation', 'Besoins']} />} />

          <Route path="/app/departements/:slug" element={<DepartmentEntry />} />
          <Route path="/app/departements/:slug/parametres" element={<EditerDepartement />} />
          <Route path="/app/direction" element={<Navigate to="/app/supervision" replace />} />
          <Route path="/app/admin" element={<RoleGuard allowedRoles={['admin']}><AdminHome /></RoleGuard>} />
          <Route path="/hub" element={<Navigate to="/app" replace />} />
          {/* Redirections anciennes routes */}
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
          <Route path="/bureau" element={<Navigate to="/app/supervision" replace />} />
          <Route path="/profil" element={<Navigate to="/app/profil" replace />} />
          <Route path="/departements" element={<Navigate to="/app/departements" replace />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App