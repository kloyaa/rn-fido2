export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email/username or password.',
  ACCOUNT_LOCKED: 'Your account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',

  // FIDO2
  NO_AUTHENTICATORS_ENROLLED: 'No biometric authenticators are enrolled on this account.',
  CHALLENGE_EXPIRED: 'The authentication challenge has expired. Please try again.',
  INVALID_ATTESTATION: 'Biometric registration failed. Please try again.',
  INVALID_ASSERTION: 'Biometric authentication failed. Please try again.',
  CLONE_DETECTED: 'Authenticator anomaly detected. Please contact support.',
  INVALID_AUTHENTICATOR: 'The authenticator is not recognized or has been revoked.',
  INVALID_CHALLENGE: 'Authentication challenge is invalid. Please try again.',

  // Password
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect.',
  WEAK_PASSWORD: 'Password does not meet the strength requirements.',

  // Authenticator management
  AUTHENTICATOR_NOT_FOUND: 'Authenticator not found.',
  AUTHENTICATOR_ALREADY_REVOKED: 'This authenticator has already been disabled.',
  ACCESS_DENIED: 'You do not have permission to perform this action.',

  // Device capability
  PLATFORM_NOT_SUPPORTED: 'Biometric enrollment is not yet supported on this device.',
  CEREMONY_CANCELLED: 'Biometric prompt was dismissed. Please try again.',

  // Network
  NETWORK_ERROR: 'Unable to reach the server. Check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}
