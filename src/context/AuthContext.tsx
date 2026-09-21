import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { api, TOKEN_KEY } from '../lib/api';
import type { Profile } from '../types/api';

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
  }, []);
  const refreshProfile = useCallback(async () => {
    const profile = await api.get<Profile>('/profile');
    setProfile(profile);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    refreshProfile()
      .catch(signOut)
      .finally(() => setLoading(false));
  }, [refreshProfile, signOut]);

  useEffect(() => {
    window.addEventListener('auth:expired', signOut);
    return () => window.removeEventListener('auth:expired', signOut);
  }, [signOut]);

  const authenticate = async (endpoint: '/signin' | '/signup', email: string, password: string) => {
    const result = await api.post<{ token: string }>(
      endpoint,
      endpoint === '/signup'
        ? { email, password, commandId: import.meta.env.VITE_COMMAND_ID ?? 'otus-shop' }
        : { email, password },
    );
    localStorage.setItem(TOKEN_KEY, result.token);
    await refreshProfile();
  };
  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        signIn: (email, password) => authenticate('/signin', email, password),
        signUp: (email, password) => authenticate('/signup', email, password),
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
