import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { SessionRepository } from '../../database/repositories/session.repository';
import { PasswordService } from './password.service';
import { RedisService } from '../../cache/redis.service';
import { AuditService } from '../../audit/audit.service';
import { PasswordChangeRequestDto } from '../dto/password-change.dto';

@Injectable()
export class PasswordChangeService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async changePassword(userId: string, dto: PasswordChangeRequestDto, ipAddress: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    const currentValid = await this.passwordService.verify(user.passwordHash, dto.currentPassword);
    if (!currentValid) {
      await this.auditService.logPasswordChange(userId, ipAddress, false, 'incorrect current password');
      throw new UnauthorizedException('INVALID_CURRENT_PASSWORD');
    }

    const validationError = this.passwordService.validate(dto.newPassword);
    if (validationError) {
      await this.auditService.logPasswordChange(userId, ipAddress, false, validationError);
      throw new BadRequestException(validationError);
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    await this.redisService.deleteUserSessions(userId);
    await this.sessionRepository.revokeAllForUser(userId);

    await this.auditService.logPasswordChange(userId, ipAddress, true);
  }
}
