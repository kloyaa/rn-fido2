import { useState } from 'react';
import { authApi } from '../services/api/authApi';
import { performAuthenticationCeremony } from '../services/webauthn/authenticationCeremony';
import { useAuthStore } from '../stores/authStore';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface UseAuthenticationCeremonyResult {
  authenticate: (username: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAuthenticationCeremony(): UseAuthenticationCeremonyResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTokens, setUser } = useAuthStore();

  async function authenticate(username: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const { challengeId, options } = await authApi.authenticationStart({ username });
      const credential = await performAuthenticationCeremony(options);
      const response = await authApi.authenticationVerify({
        challengeId,
        credential: credential as unknown as Record<string, unknown>,
      });
      await setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return true;
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setError(getErrorMessage(code, message));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { authenticate, isLoading, error, clearError: () => setError(null) };
}
