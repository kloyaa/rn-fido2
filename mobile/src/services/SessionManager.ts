import { secureStorage } from './storage/secureStorage';
import { authApi } from './api/authApi';

const REFRESH_BUFFER_MS = 60_000;

class SessionManager {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private onSessionExpired: (() => void) | null = null;

  setExpiryHandler(handler: () => void) {
    this.onSessionExpired = handler;
  }

  scheduleRefresh(expiresInSeconds: number) {
    this.cancelRefresh();
    const delayMs = Math.max(0, expiresInSeconds * 1000 - REFRESH_BUFFER_MS);
    this.refreshTimer = setTimeout(() => this.refresh(), delayMs);
  }

  cancelRefresh() {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async refresh() {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) {
        this.expire();
        return;
      }
      const { accessToken, expiresIn } = await authApi.refreshToken(refreshToken);
      await secureStorage.setAccessToken(accessToken);
      this.scheduleRefresh(expiresIn);
    } catch {
      this.expire();
    }
  }

  private expire() {
    this.cancelRefresh();
    this.onSessionExpired?.();
  }
}

export const sessionManager = new SessionManager();
