import { useState } from 'react';
import { authApi } from '../services/api/authApi';
import { performEnrollmentCeremony } from '../services/webauthn/enrollmentCeremony';
import { parseApiError } from '../utils/errorHandling';
import { getErrorMessage } from '../constants/errors';

interface UseEnrollmentResult {
  enroll: (deviceName?: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  clearError: () => void;
}

export function useEnrollment(): UseEnrollmentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function enroll(deviceName?: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const { challengeId, options } = await authApi.enrollmentStart(deviceName);
      const credential = await performEnrollmentCeremony(options);
      await authApi.enrollmentVerify({
        challengeId,
        credential: credential as unknown as Record<string, unknown>,
        deviceName,
      });
      return true;
    } catch (err) {
      const { error: code, message } = parseApiError(err);
      setErrorCode(code);
      setError(getErrorMessage(code, message));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
    setErrorCode(null);
  }

  return { enroll, isLoading, error, errorCode, clearError };
}
