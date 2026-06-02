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
import RoleLayout from '@/components/layouts/RoleLayout';
import Home from '@/pages/Home';
import AdminHome from '@/pages/AdminHome';
import BureauDashboard from '@/pages/BureauDashboard';
import MonProfil from '@/pages/MonProfil';
import EspaceServiteur from '@/pages/EspaceServiteur';

const { Pages, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <RoleLayout>
      <Routes>
        {/* Page principale EJP */}
        <Route path="/" element={<Home />} />

        {/* Routes héritées (pages.config) */}
        {Object.entries(Pages).filter(([p]) => p !== 'Home').map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<Page />} />
        ))}

        <Route path="/admin" element={<AdminHome />} />
        <Route path="/bureau" element={<BureauDashboard />} />
        <Route path="/profil" element={<MonProfil />} />
        <Route path="/espace-serviteur" element={<EspaceServiteur />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </RoleLayout>
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