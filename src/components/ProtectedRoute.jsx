import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PendingAccount from '@/components/PendingAccount';
import { isAccountPending, isAccountSuspended } from '@/lib/permissions';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0B0B0C]">
    <div className="w-8 h-8 border-2 border-white/20 border-t-[#C8A96A] rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authError, user } = useAuth();

  if (isLoadingAuth) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  // Compte en attente de validation — pas d'accès à l'espace interne
  if (isAccountPending(user)) {
    return <PendingAccount userName={user?.first_name} />;
  }

  // Compte suspendu — accès refusé
  if (isAccountSuspended(user)) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-display text-3xl text-[#F7F4EF] font-light mb-3">Compte suspendu</h1>
        <p className="text-sm text-[#B8B8B8] max-w-sm">Ton accès a été suspendu. Contacte un responsable pour plus d'informations.</p>
      </div>
    );
  }

  return <Outlet />;
}