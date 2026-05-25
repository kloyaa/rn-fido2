import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../database/repositories/session.repository';
import { RedisService } from '../../cache/redis.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class LogoutService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async logout(userId: string, sessionId: string, ipAddress: string): Promise<void> {
    await this.redisService.deleteSession(sessionId);
    await this.sessionRepository.revoke(sessionId);
    await this.auditService.logLogout(userId, ipAddress, sessionId);
  }
}
