import { AxiosError } from 'axios';

export interface ApiError {
  error: string;
  message: string;
}

export function parseApiError(err: unknown): ApiError {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as { error?: string; message?: string; data?: { error?: string; message?: string } };
    // Handle wrapped response format { data: { error, message } }
    const payload = data.data ?? data;
    return {
      error: payload.error ?? 'UNKNOWN_ERROR',
      message: payload.message ?? 'An unexpected error occurred.',
    };
  }
  return { error: 'NETWORK_ERROR', message: 'Unable to reach the server. Check your connection.' };
}

export function isApiError(err: unknown, code: string): boolean {
  const parsed = parseApiError(err);
  return parsed.error === code;
}
