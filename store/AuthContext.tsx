import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { signInWithApple, signOut, AuthUser } from '../services/auth';
import { upsertProfile } from '../services/database';

const AUTH_USER_KEY = '@nutrascan_auth_user';

interface AuthContextValue {
  authUser: AuthUser | null;
  isSignedIn: boolean;
  isLoadingAuth: boolean;
  loginWithApple: (deviceId: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  authUser: null,
  isSignedIn: false,
  isLoadingAuth: true,
  loginWithApple: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Restore cached auth user
    AsyncStorage.getItem(AUTH_USER_KEY).then((raw) => {
      if (raw) setAuthUser(JSON.parse(raw));
    });

    // Check live session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u: AuthUser = {
          id: data.session.user.id,
          email: data.session.user.email ?? null,
          fullName: data.session.user.user_metadata?.full_name ?? null,
        };
        setAuthUser(u);
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
      }
      setIsLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? null,
          fullName: session.user.user_metadata?.full_name ?? null,
        };
        setAuthUser(u);
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
      } else {
        setAuthUser(null);
        AsyncStorage.removeItem(AUTH_USER_KEY);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginWithApple = useCallback(async (deviceId: string | null) => {
    if (Platform.OS !== 'ios') return;
    try {
      const user = await signInWithApple();
      if (!user) return;
      setAuthUser(user);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // Link device profile to this Supabase user
      if (deviceId) {
        await supabase
          .from('user_profiles')
          .update({ user_id: user.id })
          .eq('device_id', deviceId)
          .then(() => {});
      }
    } catch (err: any) {
      if (err?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Erreur', 'Connexion Apple ID impossible. Réessaie.');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setAuthUser(null);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, isSignedIn: !!authUser, isLoadingAuth, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
