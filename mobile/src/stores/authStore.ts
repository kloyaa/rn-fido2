import { create } from 'zustand';
import { secureStorage } from '../services/storage/secureStorage';
import type { AuthUser } from '../services/api/authApi';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: AuthUser) => void;
  initialize: () => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  async setTokens(accessToken, refreshToken) {
    await secureStorage.setAccessToken(accessToken);
    await secureStorage.setRefreshToken(refreshToken);
    set({ accessToken, isAuthenticated: true });
  },

  setUser(user) {
    set({ user });
    secureStorage.setUserId(user.id).catch(() => {});
  },

  async initialize() {
    try {
      const token = await secureStorage.getAccessToken();
      set({ accessToken: token, isAuthenticated: !!token, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  async clear() {
    await secureStorage.clearAll();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
