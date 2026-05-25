import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { AuthenticatorRepository } from '../../database/repositories/authenticator.repository';
import { AuditService } from '../../audit/audit.service';
import { AuthenticatorItemDto } from '../dto/list-authenticators.dto';

@Injectable()
export class AuthenticatorRevocationService {
  constructor(
    private readonly authenticatorRepository: AuthenticatorRepository,
    private readonly auditService: AuditService,
  ) {}

  async revokeAuthenticator(userId: string, authenticatorId: string, ipAddress: string): Promise<void> {
    const authenticator = await this.authenticatorRepository.findById(authenticatorId);
    if (!authenticator) throw new NotFoundException('AUTHENTICATOR_NOT_FOUND');
    if (authenticator.userId !== userId) throw new ForbiddenException('ACCESS_DENIED');
    if (authenticator.status === 'revoked') throw new ConflictException('AUTHENTICATOR_ALREADY_REVOKED');

    await this.authenticatorRepository.revoke(authenticatorId);
    await this.auditService.logBiometricRevocation(userId, ipAddress, authenticatorId);
  }

  async listAuthenticators(userId: string): Promise<AuthenticatorItemDto[]> {
    const authenticators = await this.authenticatorRepository.findActiveByUserId(userId);
    return authenticators.map((a) => ({
      id: a.id,
      deviceName: a.deviceName,
      enrolledAt: a.enrolledAt.toISOString(),
      lastUsedAt: a.lastUsedAt?.toISOString() ?? null,
      status: a.status,
    }));
  }
}
