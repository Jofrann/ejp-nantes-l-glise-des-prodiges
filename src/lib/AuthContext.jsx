import { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkAppState = async () => {
    setLoading(true);
    try {
      setUser(await base44.auth.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAppState();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth: loading,
        isLoadingPublicSettings: false,
        authError: null,
        appPublicSettings: {},
        checkAppState,
        logout: () => base44.auth.logout(),
        navigateToLogin: () => base44.auth.redirectToLogin(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider requis");
  return context;
}
