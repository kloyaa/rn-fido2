import { useState } from 'react';
import { authApi } from '../services/api/authApi';
import { useAuthStore } from '../stores/authStore';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface LoginForm {
  identifier: string; // email or username
  password: string;
}

interface UseLoginResult {
  login: (form: LoginForm) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTokens, setUser } = useAuthStore();

  async function login(form: LoginForm): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const isEmail = form.identifier.includes('@');
      const body = isEmail
        ? { email: form.identifier, password: form.password }
        : { username: form.identifier, password: form.password };

      const response = await authApi.login(body);
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

  return { login, isLoading, error, clearError: () => setError(null) };
}
