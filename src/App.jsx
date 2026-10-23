import RouteLoadingBoundary from '@/components/RouteLoadingBoundary';
import {lazy,Suspense} from 'react';
import { PublicCopyProvider } from '@/components/public/PublicCopy';
const StarAssistant=lazy(()=>import('@/pages/star/Assistant'));
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'

import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
const Login=lazy(()=>import('@/pages/Login'));
const ForgotPassword=lazy(()=>import('@/pages/ForgotPassword'));
const ResetPassword=lazy(()=>import('@/pages/ResetPassword'));
const OAuthConsent=lazy(()=>import('@/pages/OAuthConsent'));
const FirstLogin=lazy(()=>import('@/pages/FirstLogin'));
const RoleLayout=lazy(()=>import('@/components/layouts/RoleLayout'));
import RoleGuard from '@/components/RoleGuard';
import Home from '@/pages/Home';
import FijPublic from '@/pages/FijPublic';
import APropos from '@/pages/APropos';
import Programmes from '@/pages/Programmes';
import Venir from '@/pages/Venir';
const AdminHome=lazy(()=>import('@/pages/AdminHome'));
const AnnuaireEJP=lazy(()=>import('@/pages/annuaire/AnnuaireEJP'));
const PersonFiche=lazy(()=>import('@/pages/annuaire/PersonFiche'));
const MonProfil=lazy(()=>import('@/pages/MonProfil'));
import EspaceServiteurSas from '@/pages/EspaceServiteurSas';
const AppDashboard=lazy(()=>import('@/pages/AppDashboard'));
const FijTableauBord=lazy(()=>import('@/pages/fij/TableauBord'));
const FijMesFij=lazy(()=>import('@/pages/fij/MesFij'));
const FijRegistre=lazy(()=>import('@/pages/fij/Registre'));
const FijCrHebdomadaires=lazy(()=>import('@/pages/fij/CrHebdomadaires'));
const FijOuvertures=lazy(()=>import('@/pages/fij/Ouvertures'));
const FijConsecrations=lazy(()=>import('@/pages/fij/Consecrations'));
const FijPause=lazy(()=>import('@/pages/fij/Pause'));
const FijPilotes=lazy(()=>import('@/pages/fij/Pilotes'));
const FijCommunications=lazy(()=>import('@/pages/fij/Communications'));
const FijReporting=lazy(()=>import('@/pages/fij/Reporting'));
const FijDocuments=lazy(()=>import('@/pages/fij/Documents'));
const FijAlertes=lazy(()=>import('@/pages/fij/Alertes'));
const FijTransferts=lazy(()=>import('@/pages/fij/Transferts'));
const FijDetail=lazy(()=>import('@/pages/fij/FijDetail'));
const FijCrForm=lazy(()=>import('@/pages/fij/FijCrForm'));
const FijPiloteHome=lazy(()=>import('@/pages/fij/PiloteHome'));
const FijRelances=lazy(()=>import('@/pages/fij/Relances'));
const FijBureau=lazy(()=>import('@/pages/fij/FijBureau'));
const CrJeudiForm=lazy(()=>import('@/pages/fij/CrJeudiForm'));
const CrJeudiDetail=lazy(()=>import('@/pages/fij/CrJeudiDetail'));
const CrJeudiList=lazy(()=>import('@/pages/fij/CrJeudiList'));
const MemberDetail=lazy(()=>import('@/pages/fij/MemberDetail'));
const PageDepartement=lazy(()=>import('@/pages/departements/PageDepartement'));
const DepartmentEntry=lazy(()=>import('@/components/DepartmentEntry'));
const EditerDepartement=lazy(()=>import('@/pages/departements/EditerDepartement'));
const ListeDepartements=lazy(()=>import('@/pages/departements/ListeDepartements'));
const Pilotage=lazy(()=>import('@/pages/pilotage/Pilotage'));
const PilotageDeptDetail=lazy(()=>import('@/pages/pilotage/PilotageDeptDetail'));
const StarAgenda=lazy(()=>import('@/pages/star/Agenda'));
const StarPresences=lazy(()=>import('@/pages/star/Presences'));
const StarFormations=lazy(()=>import('@/pages/star/Formations'));
const StarFormationDetail=lazy(()=>import('@/pages/star/FormationDetail'));
const StarNotifications=lazy(()=>import('@/pages/star/Notifications'));
const StarConfidentialite=lazy(()=>import('@/pages/star/Confidentialite'));
const StarCroissance=lazy(()=>import('@/pages/star/Croissance'));
const StarObjectifs=lazy(()=>import('@/pages/star/Objectifs'));
const StarRendezVous=lazy(()=>import('@/pages/star/RendezVous'));
const StarRessources=lazy(()=>import('@/pages/star/Ressources'));
const StarBoutique=lazy(()=>import('@/pages/star/Boutique'));
const StarParcours=lazy(()=>import('@/pages/star/Parcours'));
const StarEspacePersonnel=lazy(()=>import('@/pages/star/EspacePersonnel'));
const StarResponsabilites=lazy(()=>import('@/pages/star/Responsabilites'));
const StarOrganisation=lazy(()=>import('@/pages/star/Organisation'));
const StarSupervision=lazy(()=>import('@/pages/star/Supervision'));
const MonService=lazy(()=>import('@/pages/star/MonService'));
const EspaceEtudiant=lazy(()=>import('@/pages/star/EspaceEtudiant'));
const MonEquipe=lazy(()=>import('@/pages/star/MonEquipe'));
const ResponsabilitePlaceholder=lazy(()=>import('@/pages/star/ResponsabilitePlaceholder'));
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
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />

      {/* Vitrine publique */}
      <Route path="/" element={<Home />} />
      <Route path="/fij" element={<FijPublic />} />
      <Route path="/a-propos" element={<APropos />} />
      <Route path="/programmes" element={<Programmes />} />
      <Route path="/venir" element={<Venir />} />
      <Route path="/espace-serviteur" element={<EspaceServiteurSas />} />

      {/* Routes protégées (espace interne) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/first-login" element={<FirstLogin />} />
        <Route element={<RoleLayout />}>
          {/* Routes héritées (pages.config) */}
          {Object.entries(Pages).filter(([p]) => p !== 'Home').map(([path, Page]) => (
            <Route key={path} path={`/${path}`} element={<Page />} />
          ))}

          <Route path="/app" element={<AppDashboard />} />
          <Route path="/app/service" element={<MonService />} />
          <Route path="/app/profil" element={<MonProfil />} />
          <Route path="/app/departements" element={<ListeDepartements />} />
          {/* Lot 3 : /app/departements/fij affiche maintenant la page générique via DepartmentEntry
              (avec lien vers l'espace spécialisé). Les sous-routes FIJ opérationnelles
              (/app/departements/fij/pilote, /coordination, etc.) conservent leurs redirections. */}

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

          {/* === Alias FIJ Blueprint === */}
          <Route path="/app/fij" element={<Navigate to="/app/responsabilites/fij-pilote" replace />} />
          <Route path="/app/fij/coordination" element={<Navigate to="/app/responsabilites/fij-coordination" replace />} />

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
          <Route path="/app/departements/fij/direction" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/departements/fij/direction/tableau-de-bord" element={<Navigate to="/app/pilotage" replace />} />
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
          <Route path="/app/formations/:formationId" element={<StarFormationDetail />} />
          <Route path="/app/croissance" element={<StarCroissance />} />
          <Route path="/app/objectifs" element={<StarObjectifs />} />
          <Route path="/app/rendez-vous" element={<StarRendezVous />} />
          <Route path="/app/assistant" element={<StarAssistant />} />
          <Route path="/app/ressources" element={<StarRessources />} />
          <Route path="/app/ressources/boutique" element={<StarBoutique />} />
          <Route path="/app/parcours" element={<StarParcours />} />
          <Route path="/app/espace-personnel" element={<StarEspacePersonnel />} />
          <Route path="/app/espace-personnel/confidentialite" element={<StarConfidentialite />} />
          <Route path="/app/notifications" element={<StarNotifications />} />
          <Route path="/app/responsabilites" element={<StarResponsabilites />} />
          <Route path="/app/etudiant" element={<EspaceEtudiant />} />
          <Route path="/app/equipe" element={<MonEquipe />} />
          <Route path="/app/equipe/membres/:userId" element={<MonEquipe />} />
          <Route path="/app/organisation" element={<StarOrganisation />} />
          <Route path="/app/supervision" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/pilotage" element={<RoleGuard allowEJPRead allowedRoles={['bureau', 'bergere', 'admin']}><Pilotage /></RoleGuard>} />
          <Route path="/app/pilotage/departements/:slug" element={<RoleGuard allowEJPRead allowedRoles={['bureau', 'bergere', 'admin']}><PilotageDeptDetail /></RoleGuard>} />
          <Route path="/app/pilotage/personnes" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/pilotage/departements" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/pilotage/croissance" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/pilotage/alertes" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/pilotage/rapports" element={<Navigate to="/app/pilotage" replace />} />

          {/* === Lot 3 : Redirections placeholders vers moteur départemental === */}
          <Route path="/app/responsabilites/accueil" element={<Navigate to="/app/departements/accueil" replace />} />
          <Route path="/app/responsabilites/communication" element={<Navigate to="/app/departements/communication" replace />} />
          <Route path="/app/responsabilites/musique" element={<Navigate to="/app/departements/prodiges-musique" replace />} />
          {/* Vie Académique : ministère inactif — redirection vers Mon Service */}
          <Route path="/app/responsabilites/vie-academique" element={<Navigate to="/app/service" replace />} />

          <Route path="/app/departements/louange" element={<Navigate to="/app/departements/prodiges-musique" replace />} />
          <Route path="/app/departements/:slug" element={<DepartmentEntry />} />
          <Route path="/app/departements/:slug/parametres" element={<EditerDepartement />} />
          <Route path="/app/direction" element={<Navigate to="/app/pilotage" replace />} />
          <Route path="/app/admin" element={<RoleGuard allowedRoles={['admin']}><AdminHome /></RoleGuard>} />
          <Route path="/app/annuaire" element={<RoleGuard allowedRoles={['admin']}><AnnuaireEJP /></RoleGuard>} />
          <Route path="/app/annuaire/:userId" element={<RoleGuard allowedRoles={['admin']}><PersonFiche /></RoleGuard>} />
          <Route path="/hub" element={<Navigate to="/app" replace />} />
          {/* Redirections anciennes routes */}
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
          <Route path="/bureau" element={<Navigate to="/app" replace />} />
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
          <PublicCopyProvider><RouteLoadingBoundary><Suspense fallback={<div role="status" className="p-8 text-center text-sm">Chargement de la page…</div>}><AuthenticatedApp /></Suspense></RouteLoadingBoundary></PublicCopyProvider>
        </Router>
        <Toaster />

      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App