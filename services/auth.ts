import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

export async function signInWithApple(): Promise<AuthUser | null> {
  if (Platform.OS !== 'ios') return null;

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) throw new Error('No identity token');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error || !data.user) throw error ?? new Error('Auth failed');

  const fullName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ') || null
    : data.user.user_metadata?.full_name ?? null;

  if (fullName && !data.user.user_metadata?.full_name) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return { id: data.user.id, email: credential.email ?? data.user.email ?? null, fullName };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
