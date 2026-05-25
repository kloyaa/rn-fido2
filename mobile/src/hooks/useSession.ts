import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { secureStorage } from '../services/storage/secureStorage';
import { authApi } from '../services/api/authApi';
import { useAuthStore } from '../stores/authStore';

const REFRESH_BUFFER_MS = 60_000; // Refresh 60s before expiry

export function useSession() {
  const { clear } = useAuthStore();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleRefresh(expiresInSeconds: number) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const delayMs = Math.max(0, expiresInSeconds * 1000 - REFRESH_BUFFER_MS);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) { await clear(); return; }
        const { accessToken, expiresIn } = await authApi.refreshToken(refreshToken);
        await secureStorage.setAccessToken(accessToken);
        scheduleRefresh(expiresIn);
      } catch {
        await clear();
      }
    }, delayMs);
  }

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // Re-check session validity when app foregrounds
        secureStorage.getAccessToken().then((token) => {
          if (!token) clear().catch(() => {});
        });
      }
    });
    return () => {
      sub.remove();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [clear]);

  return { scheduleRefresh };
}
