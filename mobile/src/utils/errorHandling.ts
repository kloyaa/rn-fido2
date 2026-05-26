import { AxiosError } from 'axios';

export interface ApiError {
  error: string;
  message: string;
}

export function parseApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    if (err.response?.data) {
      const data = err.response.data as { error?: string; message?: string; data?: { error?: string; message?: string } };
      const payload = data.data ?? data;
      return {
        error: payload.error ?? 'UNKNOWN_ERROR',
        message: payload.message ?? 'An unexpected error occurred.',
      };
    }
    return { error: 'NETWORK_ERROR', message: 'Unable to reach the server. Check your connection.' };
  }
  if (err instanceof Error) {
    return { error: err.name ?? 'UNKNOWN_ERROR', message: err.message };
  }
  return { error: 'UNKNOWN_ERROR', message: 'An unexpected error occurred. Please try again.' };
}

export function isApiError(err: unknown, code: string): boolean {
  const parsed = parseApiError(err);
  return parsed.error === code;
}
