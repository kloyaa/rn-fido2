import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigurationService } from '../config/configuration.service';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigurationService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.redisHost,
      port: this.config.redisPort,
      password: this.config.redisPassword,
      lazyConnect: true,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  // FIDO2 challenge storage (10-minute TTL)
  async storeFido2Challenge(challengeId: string, data: Record<string, unknown>, ttlSeconds = 600): Promise<void> {
    await this.set(`fido2:challenge:${challengeId}`, JSON.stringify(data), ttlSeconds);
  }

  async getFido2Challenge(challengeId: string): Promise<Record<string, unknown> | null> {
    const raw = await this.get(`fido2:challenge:${challengeId}`);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  }

  async deleteFido2Challenge(challengeId: string): Promise<void> {
    await this.del(`fido2:challenge:${challengeId}`);
  }

  // Legacy challenge aliases
  async setChallenge(challengeId: string, data: string, ttlSeconds = 600): Promise<void> {
    await this.set(`fido2:challenge:${challengeId}`, data, ttlSeconds);
  }

  async getChallenge(challengeId: string): Promise<string | null> {
    return this.get(`fido2:challenge:${challengeId}`);
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    await this.del(`fido2:challenge:${challengeId}`);
  }

  // Session storage
  async storeSession(sessionId: string, userId: string, expiresAt: Date): Promise<void> {
    const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    await this.set(`session:${sessionId}`, JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }), ttlSeconds);
    // Also track session under user key for bulk revocation
    await this.set(`session:user:${userId}:${sessionId}`, sessionId, ttlSeconds);
  }

  async getSessionUserId(sessionId: string): Promise<string | null> {
    const raw = await this.get(`session:${sessionId}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as { userId: string };
    return data.userId;
  }

  async setSession(sessionId: string, data: string, ttlSeconds: number): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getSession(sessionId: string): Promise<string | null> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const pattern = `session:user:${userId}:*`;
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
    // Also remove the tracked session keys themselves
    const sessionIds = await Promise.all(keys.map((k) => this.client.get(k)));
    const sessionKeys = sessionIds.filter(Boolean).map((id) => `session:${id}`);
    if (sessionKeys.length > 0) {
      await this.client.del(...sessionKeys);
    }
  }

  // Rate limiting (per-account failed attempts)
  async incrementLoginAttempts(identifier: string): Promise<number> {
    const key = `ratelimit:login:${identifier}`;
    const count = await this.incr(key);
    if (count === 1) {
      await this.expire(key, 3600);
    }
    return count;
  }

  async getLoginAttempts(identifier: string): Promise<number> {
    const val = await this.get(`ratelimit:login:${identifier}`);
    return val ? parseInt(val, 10) : 0;
  }

  async clearLoginAttempts(identifier: string): Promise<void> {
    await this.del(`ratelimit:login:${identifier}`);
  }

  async resetLoginAttempts(identifier: string): Promise<void> {
    await this.del(`ratelimit:login:${identifier}`);
  }

  // Account lockout
  async lockAccount(identifier: string, durationMs: number): Promise<void> {
    await this.set(`lock:account:${identifier}`, '1', Math.ceil(durationMs / 1000));
  }

  async isAccountLocked(identifier: string): Promise<boolean> {
    return this.exists(`lock:account:${identifier}`);
  }

  async getAccountLockTtl(identifier: string): Promise<number> {
    return this.ttl(`lock:account:${identifier}`);
  }
}
