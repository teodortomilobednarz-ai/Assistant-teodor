import { useCallback } from 'react';
import { Alert } from 'react-native';

export function useNetworkGuard() {
  const withNetwork = useCallback(async <T>(
    fn: () => Promise<T>,
    opts?: { title?: string; message?: string }
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (err: any) {
      const isNetwork =
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('timeout') ||
        err?.code === 'ECONNABORTED';

      Alert.alert(
        opts?.title ?? (isNetwork ? 'Pas de connexion' : 'Erreur'),
        opts?.message ??
          (isNetwork
            ? 'Vérifie ta connexion internet et réessaie.'
            : "Une erreur est survenue. Réessaie dans quelques instants."),
        [{ text: 'OK' }]
      );
      return null;
    }
  }, []);

  return { withNetwork };
}
