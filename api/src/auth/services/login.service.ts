import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { SessionRepository } from '../../database/repositories/session.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RedisService } from '../../cache/redis.service';
import { AuditService } from '../../audit/audit.service';
import { ConfigurationService } from '../../config/configuration.service';
import { LoginRequestDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login.response.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigurationService,
  ) {}

  async login(dto: LoginRequestDto, ipAddress: string, deviceIdentifier?: string): Promise<LoginResponseDto> {
    const identifier = dto.email ?? dto.username!;

    const locked = await this.redisService.isAccountLocked(identifier);
    if (locked) {
      await this.auditService.logLogin(null, ipAddress, false, 'account locked', { identifier });
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    const user = dto.email
      ? await this.userRepository.findByEmail(dto.email)
      : await this.userRepository.findByUsername(dto.username!);

    if (!user) {
      await this.recordFailedAttempt(identifier, null, ipAddress);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const passwordValid = await this.passwordService.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.recordFailedAttempt(identifier, user.id, ipAddress);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    await this.redisService.clearLoginAttempts(identifier);

    const session = await this.sessionRepository.create({
      userId: user.id,
      ipAddress,
      deviceIdentifier,
    });

    await this.redisService.storeSession(session.id, user.id, session.expiresAt);

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user.id,
      user.email,
      session.id,
    );

    await this.auditService.logLogin(user.id, ipAddress, true, undefined, { sessionId: session.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.jwtExpiresIn,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  private async recordFailedAttempt(identifier: string, userId: string | null, ipAddress: string): Promise<void> {
    const attempts = await this.redisService.incrementLoginAttempts(identifier);
    const threshold = this.configService.accountLockThreshold;

    if (attempts >= threshold) {
      const lockDuration = this.configService.accountLockDurationMs;
      await this.redisService.lockAccount(identifier, lockDuration);
      await this.auditService.logRateLimitTriggered(userId, ipAddress, identifier);
    }

    await this.auditService.logLogin(userId, ipAddress, false, 'invalid credentials', { identifier, attempts });
  }
}
