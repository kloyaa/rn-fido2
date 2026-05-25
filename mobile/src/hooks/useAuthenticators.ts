import { useState, useCallback } from 'react';
import { authApi, type AuthenticatorItem } from '../services/api/authApi';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface UseAuthenticatorsResult {
  authenticators: AuthenticatorItem[];
  isLoading: boolean;
  error: string | null;
  fetchAuthenticators: () => Promise<void>;
  revokeAuthenticator: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAuthenticators(): UseAuthenticatorsResult {
  const [authenticators, setAuthenticators] = useState<AuthenticatorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthenticators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await authApi.listAuthenticators();
      setAuthenticators(list);
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setError(getErrorMessage(code, message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function revokeAuthenticator(id: string): Promise<boolean> {
    setError(null);
    try {
      await authApi.revokeAuthenticator(id);
      setAuthenticators((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setError(getErrorMessage(code, message));
      return false;
    }
  }

  return {
    authenticators,
    isLoading,
    error,
    fetchAuthenticators,
    revokeAuthenticator,
    clearError: () => setError(null),
  };
}
