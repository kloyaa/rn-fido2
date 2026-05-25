import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private readonly config: ConfigService) {}

  get appPort(): number {
    return this.config.get<number>('app.port')!;
  }

  get appName(): string {
    return this.config.get<string>('app.name')!;
  }

  get nodeEnv(): string {
    return this.config.get<string>('app.nodeEnv')!;
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Database
  get dbHost(): string { return this.config.get<string>('database.host')!; }
  get dbPort(): number { return this.config.get<number>('database.port')!; }
  get dbUsername(): string { return this.config.get<string>('database.username')!; }
  get dbPassword(): string { return this.config.get<string>('database.password')!; }
  get dbDatabase(): string { return this.config.get<string>('database.database')!; }
  get dbLogging(): boolean { return this.config.get<boolean>('database.logging')!; }

  // Redis
  get redisHost(): string { return this.config.get<string>('redis.host')!; }
  get redisPort(): number { return this.config.get<number>('redis.port')!; }
  get redisPassword(): string | undefined { return this.config.get<string>('redis.password'); }

  // JWT
  get jwtSecret(): string { return this.config.get<string>('jwt.secret')!; }
  get jwtExpiresIn(): number { return this.config.get<number>('jwt.expiresIn')!; }
  get jwtRefreshExpiresIn(): number { return this.config.get<number>('jwt.refreshExpiresIn')!; }

  // FIDO2
  get fido2RpId(): string { return this.config.get<string>('fido2.rpId')!; }
  get fido2RpName(): string { return this.config.get<string>('fido2.rpName')!; }
  get fido2Origin(): string { return this.config.get<string>('fido2.origin')!; }

  // Rate Limiting
  get rateLimitWindowMs(): number { return this.config.get<number>('rateLimit.windowMs')!; }
  get rateLimitMaxAttempts(): number { return this.config.get<number>('rateLimit.maxAttempts')!; }
  get accountLockDurationMs(): number { return this.config.get<number>('rateLimit.accountLockDurationMs')!; }
  get accountLockThreshold(): number { return this.config.get<number>('rateLimit.accountLockThreshold')!; }
}
