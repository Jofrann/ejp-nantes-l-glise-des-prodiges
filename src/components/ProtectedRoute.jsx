import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PendingAccount from '@/components/PendingAccount';
import { isAccountPending, isAccountSuspended } from '@/lib/permissions';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-border border-t-secondary rounded-full animate-spin"></div>
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-display text-3xl text-foreground font-light mb-3">Compte suspendu</h1>
        <p className="text-sm text-muted-foreground max-w-sm">Ton accès a été suspendu. Contacte un responsable pour plus d'informations.</p>
      </div>
    );
  }

  return <Outlet />;
}