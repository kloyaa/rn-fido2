import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api/authApi';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setTokens, setUser, clear } = useAuthStore();

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    }
    await clear();
  }

  function getDisplayError(err: unknown): string {
    const { error, message } = parseApiError(err);
    return getErrorMessage(error, message);
  }

  return { user, isAuthenticated, isLoading, logout, setTokens, setUser, getDisplayError };
}
