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
import FijPlaceholder from '@/pages/fij/FijPlaceholder';
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
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin"></div>
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
          <Route path="/app/departements/fij/:subpage" element={<FijPlaceholder />} />
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