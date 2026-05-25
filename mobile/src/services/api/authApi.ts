import { apiClient } from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  username?: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface EnrollmentStartResponse {
  challengeId: string;
  options: Record<string, unknown>;
}

export interface EnrollmentVerifyRequest {
  challengeId: string;
  credential: Record<string, unknown>;
  deviceName?: string;
}

export interface EnrollmentVerifyResponse {
  authenticatorId: string;
  deviceName?: string | null;
  enrolledAt: string;
}

export interface AuthenticationStartRequest {
  username: string;
}

export interface AuthenticationStartResponse {
  challengeId: string;
  options: Record<string, unknown>;
}

export interface AuthenticationVerifyRequest {
  challengeId: string;
  credential: Record<string, unknown>;
}

export interface AuthenticatorItem {
  id: string;
  deviceName?: string | null;
  enrolledAt: string;
  lastUsedAt?: string | null;
  status: string;
}

type ApiWrapped<T> = { data: T };

function unwrap<T>(response: { data: ApiWrapped<T> }): T {
  return response.data.data;
}

export const authApi = {
  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return unwrap(await apiClient.post<ApiWrapped<RegisterResponse>>('/auth/register', body));
  },

  async login(body: LoginRequest): Promise<LoginResponse> {
    return unwrap(await apiClient.post<ApiWrapped<LoginResponse>>('/auth/login', body));
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    return unwrap(await apiClient.post<ApiWrapped<{ accessToken: string; expiresIn: number }>>('/auth/token/refresh', { refreshToken }));
  },

  async enrollmentStart(deviceName?: string): Promise<EnrollmentStartResponse> {
    return unwrap(await apiClient.post<ApiWrapped<EnrollmentStartResponse>>('/auth/fido2/enroll/start', { deviceName }));
  },

  async enrollmentVerify(body: EnrollmentVerifyRequest): Promise<EnrollmentVerifyResponse> {
    return unwrap(await apiClient.post<ApiWrapped<EnrollmentVerifyResponse>>('/auth/fido2/enroll/verify', body));
  },

  async authenticationStart(body: AuthenticationStartRequest): Promise<AuthenticationStartResponse> {
    return unwrap(await apiClient.post<ApiWrapped<AuthenticationStartResponse>>('/auth/fido2/authenticate/start', body));
  },

  async authenticationVerify(body: AuthenticationVerifyRequest): Promise<LoginResponse> {
    return unwrap(await apiClient.post<ApiWrapped<LoginResponse>>('/auth/fido2/authenticate/verify', body));
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password/change', { currentPassword, newPassword });
  },

  async listAuthenticators(): Promise<AuthenticatorItem[]> {
    const res = unwrap(await apiClient.get<ApiWrapped<{ authenticators: AuthenticatorItem[] }>>('/auth/authenticators'));
    return res.authenticators;
  },

  async revokeAuthenticator(authenticatorId: string): Promise<void> {
    await apiClient.delete(`/auth/authenticators/${authenticatorId}`);
  },
};
