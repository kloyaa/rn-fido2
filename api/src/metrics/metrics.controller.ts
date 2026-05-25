import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from '../database/entities/AuditLog.entity';

@Controller('metrics')
export class MetricsController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  @Get()
  async getMetrics() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalAuthRequests,
      successfulLogins,
      failedLogins,
      lockoutEvents,
      fido2Failures,
      sessionTimeouts,
    ] = await Promise.all([
      this.auditRepo.count({ where: [{ eventType: 'login_credential' }, { eventType: 'login_biometric' }] }),
      this.auditRepo.count({ where: [
        { eventType: 'login_credential', result: 'success' },
        { eventType: 'login_biometric', result: 'success' },
      ]}),
      this.auditRepo.count({ where: [
        { eventType: 'login_credential', result: 'failure' },
        { eventType: 'login_biometric', result: 'failure' },
      ]}),
      this.auditRepo.count({ where: { eventType: 'rate_limit_triggered' } }),
      this.auditRepo.count({ where: [
        { eventType: 'failed_attestation' },
        { eventType: 'replay_attempt_detected' },
      ]}),
      this.auditRepo.count({ where: { eventType: 'session_timeout' } }),
    ]);

    return {
      total_auth_requests: totalAuthRequests,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      lockout_events: lockoutEvents,
      fido2_failures: fido2Failures,
      session_timeouts: sessionTimeouts,
      generated_at: new Date().toISOString(),
    };
  }
}
