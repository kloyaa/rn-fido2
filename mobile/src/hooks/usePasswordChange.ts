import { useState } from 'react';
import { authApi } from '../services/api/authApi';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface UsePasswordChangeResult {
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function usePasswordChange(): UsePasswordChangeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setError(getErrorMessage(code, message));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { changePassword, isLoading, error, clearError: () => setError(null) };
}
