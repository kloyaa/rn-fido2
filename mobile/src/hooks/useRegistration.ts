import { useState } from 'react';
import { authApi } from '../services/api/authApi';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface RegistrationForm {
  email: string;
  password: string;
  username?: string;
}

interface UseRegistrationResult {
  register: (form: RegistrationForm) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useRegistration(): UseRegistrationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(form: RegistrationForm): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(form);
      return true;
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setError(getErrorMessage(code, message));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading, error, clearError: () => setError(null) };
}
