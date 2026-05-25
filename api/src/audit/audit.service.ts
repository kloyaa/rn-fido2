import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/AuditLog.entity';

type AuditResult = 'success' | 'failure' | 'suspended';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  private async write(
    eventType: string,
    userId: string | null,
    ipAddress: string,
    result: AuditResult,
    errorMessage?: string,
    deviceInfo?: Record<string, unknown>,
    sessionId?: string,
  ): Promise<void> {
    const entry = this.repo.create({
      userId,
      eventType,
      ipAddress,
      result,
      errorMessage: errorMessage ?? null,
      deviceInfo: deviceInfo ?? null,
      sessionId: sessionId ?? null,
    });
    await this.repo.save(entry);
  }

  async logRegistration(userId: string | null, ipAddress: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.write('registration_attempt', userId, ipAddress, success ? 'success' : 'failure', errorMessage);
  }

  async logLogin(
    userId: string | null,
    ipAddress: string,
    success: boolean,
    errorMessage?: string,
    meta?: Record<string, unknown>,
  ): Promise<void> {
    await this.write('login_credential', userId, ipAddress, success ? 'success' : 'failure', errorMessage, meta);
  }

  async logLogout(userId: string, ipAddress: string, sessionId?: string): Promise<void> {
    await this.write('logout', userId, ipAddress, 'success', undefined, undefined, sessionId);
  }

  async logPasswordChange(userId: string, ipAddress: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.write('password_change', userId, ipAddress, success ? 'success' : 'failure', errorMessage);
  }

  async logBiometricEnrollment(userId: string, ipAddress: string, success: boolean, deviceInfo?: Record<string, unknown>): Promise<void> {
    await this.write('biometric_enrollment', userId, ipAddress, success ? 'success' : 'failure', undefined, deviceInfo);
  }

  async logBiometricRevocation(userId: string, ipAddress: string, authenticatorId: string): Promise<void> {
    await this.write('biometric_revocation', userId, ipAddress, 'success', undefined, { authenticatorId });
  }

  async logBiometricAuth(userId: string | null, ipAddress: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.write('login_biometric', userId, ipAddress, success ? 'success' : 'failure', errorMessage);
  }

  async logRateLimitTriggered(userId: string | null, ipAddress: string, identifier: string): Promise<void> {
    await this.write('rate_limit_triggered', userId, ipAddress, 'suspended', undefined, { identifier });
  }

  async logFailedAttestation(userId: string | null, ipAddress: string, errorMessage?: string): Promise<void> {
    await this.write('failed_attestation', userId, ipAddress, 'failure', errorMessage);
  }

  async logReplayAttempt(userId: string | null, ipAddress: string, errorMessage?: string): Promise<void> {
    await this.write('replay_attempt_detected', userId, ipAddress, 'failure', errorMessage);
  }
}
