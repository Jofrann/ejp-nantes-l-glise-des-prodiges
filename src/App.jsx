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
import BureauDashboard from '@/pages/BureauDashboard';
import MonProfil from '@/pages/MonProfil';
import EspaceServiteurSas from '@/pages/EspaceServiteurSas';
import AppDashboard from '@/pages/AppDashboard';
import FijHome from '@/pages/fij/FijHome';
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
import FijDirectionHome from '@/pages/fij/DirectionHome';
import ListeDepartements from '@/pages/departements/ListeDepartements';
import PageDepartement from '@/pages/departements/PageDepartement';
import EditerDepartement from '@/pages/departements/EditerDepartement';
import Hub from '@/pages/Hub';

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
          <Route path="/app/departements" element={<ListeDepartements />} />
          <Route path="/app/departements/fij" element={<FijHome />} />

          {/* === Espace Pilote FIJ === */}
          <Route path="/app/departements/fij/pilote" element={<FijPiloteHome />} />
          <Route path="/app/departements/fij/pilote/mes-fij" element={<FijMesFij />} />
          <Route path="/app/departements/fij/pilote/cr" element={<FijCrHebdomadaires />} />
          <Route path="/app/departements/fij/pilote/communications" element={<FijCommunications />} />
          <Route path="/app/departements/fij/pilote/documents" element={<FijDocuments />} />
          <Route path="/app/departements/fij/pilote/alertes" element={<FijAlertes />} />

          {/* === Espace Coordination FIJ === */}
          <Route path="/app/departements/fij/coordination" element={<FijTableauBord />} />
          <Route path="/app/departements/fij/coordination/registre" element={<FijRegistre />} />
          <Route path="/app/departements/fij/coordination/cr" element={<FijCrHebdomadaires />} />
          <Route path="/app/departements/fij/coordination/ouvertures" element={<FijOuvertures />} />
          <Route path="/app/departements/fij/coordination/consecrations" element={<FijConsecrations />} />
          <Route path="/app/departements/fij/coordination/pause" element={<FijPause />} />
          <Route path="/app/departements/fij/coordination/pilotes" element={<FijPilotes />} />
          <Route path="/app/departements/fij/coordination/communications" element={<FijCommunications />} />
          <Route path="/app/departements/fij/coordination/documents" element={<FijDocuments />} />
          <Route path="/app/departements/fij/coordination/alertes" element={<FijAlertes />} />
          <Route path="/app/departements/fij/coordination/reporting" element={<FijReporting />} />
          <Route path="/app/departements/fij/coordination/transferts" element={<FijTransferts />} />

          {/* === Espace Direction FIJ === */}
          <Route path="/app/departements/fij/direction" element={<FijDirectionHome />} />
          <Route path="/app/departements/fij/direction/tableau-de-bord" element={<FijTableauBord />} />

          {/* === Routes partagées === */}
          <Route path="/app/departements/fij/fij/:id" element={<FijDetail />} />
          <Route path="/app/departements/fij/fij/:id/cr/nouveau" element={<FijCrForm />} />

          {/* === Redirections anciennes routes === */}
          <Route path="/app/departements/fij/tableau-de-bord" element={<Navigate to="/app/departements/fij/coordination" replace />} />
          <Route path="/app/departements/fij/mes-fij" element={<Navigate to="/app/departements/fij/pilote/mes-fij" replace />} />
          <Route path="/app/departements/fij/registre" element={<Navigate to="/app/departements/fij/coordination/registre" replace />} />
          <Route path="/app/departements/fij/cr-hebdomadaires" element={<Navigate to="/app/departements/fij/coordination/cr" replace />} />
          <Route path="/app/departements/fij/ouvertures" element={<Navigate to="/app/departements/fij/coordination/ouvertures" replace />} />
          <Route path="/app/departements/fij/consecrations" element={<Navigate to="/app/departements/fij/coordination/consecrations" replace />} />
          <Route path="/app/departements/fij/pause" element={<Navigate to="/app/departements/fij/coordination/pause" replace />} />
          <Route path="/app/departements/fij/pilotes" element={<Navigate to="/app/departements/fij/coordination/pilotes" replace />} />
          <Route path="/app/departements/fij/communications" element={<Navigate to="/app/departements/fij/coordination/communications" replace />} />
          <Route path="/app/departements/fij/reporting" element={<Navigate to="/app/departements/fij/coordination/reporting" replace />} />
          <Route path="/app/departements/fij/documents" element={<Navigate to="/app/departements/fij/coordination/documents" replace />} />
          <Route path="/app/departements/fij/alertes" element={<Navigate to="/app/departements/fij/coordination/alertes" replace />} />
          <Route path="/app/departements/fij/transferts" element={<Navigate to="/app/departements/fij/coordination/transferts" replace />} />
          <Route path="/app/departements/:slug" element={<PageDepartement />} />
          <Route path="/app/departements/:slug/parametres" element={<EditerDepartement />} />
          <Route path="/app/direction" element={<RoleGuard allowedRoles={['bureau', 'bergere', 'admin']}><BureauDashboard /></RoleGuard>} />
          <Route path="/app/admin" element={<RoleGuard allowedRoles={['admin']}><AdminHome /></RoleGuard>} />
          <Route path="/hub" element={<Hub />} />
          {/* Redirections anciennes routes */}
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
          <Route path="/bureau" element={<Navigate to="/app/direction" replace />} />
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